/**
 * SEL 情緒簽到 — Google Apps Script 後端
 * 部署：Google Sheets → 擴充功能 → Apps Script → 貼上本檔
 *      → 專案設定 → 指令碼屬性 新增 PRINCIPAL_PASSCODE（校長密碼，可看全校）
 *      → 試算表 Teachers 分頁：每班一列「班級（例：3甲）、教師、密碼」，老師只看得到自己的班
 *      → 部署 → 新增部署 → 網頁應用程式 → 執行身分：我；存取：任何人 → 複製網址
 *
 * 工作表（首次執行自動建立）：
 *   Checkins  : id, 時間, 日期, 班級, 座號, 姓名, 顏色, 情緒, 備註, 類型（Check-in／Check-out：當天第一次送出＝Check-in、第二次起＝Check-out，不看時間）
 *   Roster    : 班級（例：3甲）, 座號, 姓名, 圖案  ← 名單放這裡，用 RosterSeed.gs 一次匯入；「圖案」由學生自選（自我圖式）
 *   Teachers  : 班級, 教師, 密碼, 信箱   ← 老師登入用；同一位老師帶多班就多列、用同一組密碼。
 *               「信箱」填學校 Google 信箱，學生選紅色時會立刻寄信通知（可留空＝不通知）
 *   Followups : 時間, 日期, 班級, 座號, 姓名, 狀態, 處遇紀錄, 教師
 */
var COLORS = ['red', 'blue', 'yellow', 'green'];
var SHEETS = {
  Checkins: ['id', '時間', '日期', '班級', '座號', '姓名', '顏色', '情緒', '備註', '類型'],
  Roster: ['班級', '座號', '姓名', '圖案'],
  Teachers: ['班級', '教師', '密碼', '信箱'],
  Followups: ['時間', '日期', '班級', '座號', '姓名', '狀態', '處遇紀錄', '教師']
};

function sheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(SHEETS[name]);
    sh.setFrozenRows(1);
  }
  return sh;
}
function rows_(name) {
  var v = sheet_(name).getDataRange().getValues();
  var head = v.shift();
  return v.map(function (r) {
    var o = {};
    head.forEach(function (h, i) { o[h] = r[i]; });
    return o;
  });
}
function today_() { return Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyy-MM-dd'); }
function now_() { return Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyy-MM-dd HH:mm:ss'); }
function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
// 權限：校長密碼（指令碼屬性 PRINCIPAL_PASSCODE）可看全校；教師密碼（Teachers 分頁）只能看自己的班
function prop_(k) { return PropertiesService.getScriptProperties().getProperty(k); }
function isPrincipal_(pass) { var p = prop_('PRINCIPAL_PASSCODE'); return !!p && String(pass) === String(p); }
function access_(pass) {
  pass = String(pass == null ? '' : pass);
  if (!pass) return null;
  if (isPrincipal_(pass)) return { role: 'principal', name: '校長', classes: null };
  var mine = rows_('Teachers').filter(function (r) { return String(r['密碼']) === pass; });
  if (!mine.length) return null;
  return { role: 'teacher', name: String(mine[0]['教師']), classes: mine.map(function (r) { return String(r['班級']); }) };
}
function can_(acc, cls) {
  return !!acc && (acc.role === 'principal' || acc.classes.indexOf(String(cls)) >= 0);
}
function allClasses_() {
  var seen = {}, out = [];
  rows_('Roster').forEach(function (r) { var c = String(r['班級']); if (!seen[c]) { seen[c] = 1; out.push(c); } });
  return out.sort();
}
function str_(v, max) { return String(v == null ? '' : v).slice(0, max || 100); }
function dateStr_(v) {
  return v instanceof Date ? Utilities.formatDate(v, 'Asia/Taipei', 'yyyy-MM-dd') : String(v);
}

function timeStr_(v) {
  return v instanceof Date ? Utilities.formatDate(v, 'Asia/Taipei', 'yyyy-MM-dd HH:mm:ss') : String(v == null ? '' : v);
}
// 類型：不論時間，只看順序。學生當天第一次送出＝Check-in（ci），第二次起＝Check-out（co）。
// 新資料會明確寫入「類型」欄；舊資料沒有該欄時，依「同一位學生當天的第幾筆」推算。
var KIND_ZH_ = { ci: 'Check-in', co: 'Check-out' };
function checkinRows_() {
  var rows = rows_('Checkins'), seq = {};
  rows.forEach(function (r, i) { r._i = i; });
  rows.slice().sort(function (a, b) {
    var ta = timeStr_(a['時間']), tb = timeStr_(b['時間']);
    return ta < tb ? -1 : ta > tb ? 1 : a._i - b._i;
  }).forEach(function (r) {
    var k = String(r['班級']) + '|' + Number(r['座號']) + '|' + dateStr_(r['日期']);
    var n = seq[k] = (seq[k] || 0) + 1, v = String(r['類型'] || '').toLowerCase();
    r._kind = v === 'check-in' ? 'ci' : v === 'check-out' ? 'co' : (n === 1 ? 'ci' : 'co');
  });
  return rows;
}
// 當天心情變化：a＝Check-in 的顏色、b＝Check-out 的顏色
function changeKind_(a, b) {
  if (a === b) return 'same';           // 持平
  if (b === 'green') return 'improved'; // 好轉：非綠 → 綠
  if (a === 'green') return 'worsened'; // 轉差：綠 → 非綠
  return 'shifted';                     // 轉換：非綠 → 另一種非綠
}

function doGet(e) {
  e = e || {};   // 在編輯器手動執行時沒有 e；網頁請求才會帶 e.parameter
  var p = e.parameter || { action: 'ping' }, a = p.action;
  try {
    if (a === 'ping') return out_({ ok: true });
    // 學生端：只提供座號（不含姓名），姓名僅後端與校長/教師可見
    if (a === 'roster') {
      var list = rows_('Roster').filter(function (r) { return String(r['班級']) === String(p.cls); })
              .map(function (r) { return { seat: Number(r['座號']), avatar: String(r['圖案'] || '') }; });
      // 只回傳今天已簽到的座號（不含顏色），讓班級圖卡顯示 ✓
      var d0 = today_(), done = { ci: [], co: [] };
      checkinRows_().forEach(function (r) {
        if (String(r['班級']) === String(p.cls) && dateStr_(r['日期']) === d0) done[r._kind].push(Number(r['座號']));
      });
      return out_({ ok: true, roster: list, done: done });
    }
    // 校長總控台：全校總覽（含姓名）
    if (a === 'overview') {
      if (!isPrincipal_(p.pass)) return out_({ ok: false, error: 'auth' });
      return out_(overview_(p.date || today_()));
    }
    // 以下為教師端（只能看自己的班）
    var acc = access_(p.pass);
    if (!acc) return out_({ ok: false, error: 'auth' });
    if (a === 'login') {
      return out_({ ok: true, role: acc.role, name: acc.name, classes: acc.classes || allClasses_() });
    }
    // 情緒統計：指定 cls＝該班（老師可看自己班）；不指定＝全校（僅校長）
    if (a === 'stats') {
      if (p.cls ? !can_(acc, p.cls) : acc.role !== 'principal') return out_({ ok: false, error: 'forbidden' });
      return out_(stats_(p.cls || '', Math.min(Math.max(Number(p.days) || 7, 1), 400)));
    }
    if (!can_(acc, p.cls)) return out_({ ok: false, error: 'forbidden' });
    if (a === 'today') {
      var d = p.date || today_();
      var cl = checkinRows_().filter(function (r) {
        return String(r['班級']) === String(p.cls) && dateStr_(r['日期']) === d;
      }).map(function (r) {
        return { id: r.id, time: timeStr_(r['時間']), kind: r._kind, seat: Number(r['座號']), name: r['姓名'],
                 color: r['顏色'], emotion: r['情緒'], note: r['備註'] };
      });
      var fu = rows_('Followups').filter(function (r) {
        return String(r['班級']) === String(p.cls) && dateStr_(r['日期']) === d;
      }).map(function (r) {
        return { time: String(r['時間']), seat: Number(r['座號']), status: r['狀態'], note: r['處遇紀錄'], teacher: r['教師'] };
      });
      return out_({ ok: true, date: d, checkins: cl, followups: fu, roster: rosterOf_(p.cls) });
    }
    if (a === 'history') {
      var limit = new Date(); limit.setDate(limit.getDate() - (Number(p.days) || 14));
      var lim = Utilities.formatDate(limit, 'Asia/Taipei', 'yyyy-MM-dd');
      var h = checkinRows_().filter(function (r) {
        return String(r['班級']) === String(p.cls) && Number(r['座號']) === Number(p.seat) && dateStr_(r['日期']) >= lim;
      }).map(function (r) {
        return { date: dateStr_(r['日期']), time: timeStr_(r['時間']), kind: r._kind, color: r['顏色'], emotion: r['情緒'], note: r['備註'] };
      });
      var f = rows_('Followups').filter(function (r) {
        return String(r['班級']) === String(p.cls) && Number(r['座號']) === Number(p.seat);
      }).map(function (r) {
        return { time: String(r['時間']), status: r['狀態'], note: r['處遇紀錄'], teacher: r['教師'] };
      });
      return out_({ ok: true, history: h, followups: f });
    }
    return out_({ ok: false, error: 'unknown action' });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  }
}

// ===== 情緒統計（短期 7 天／中期 30 天／長期 180 天，由前端選 days）=====
var NEG_ = { red: 1, blue: 1, yellow: 1 };   // 非綠色視為「負向／需留意」情緒
function addDays_(ymd, n) {
  var d = new Date(ymd + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n);
  return Utilities.formatDate(d, 'UTC', 'yyyy-MM-dd');
}
function weekStart_(ymd) {   // 該週週一
  var d = new Date(ymd + 'T00:00:00Z'), w = (d.getUTCDay() + 6) % 7;
  return addDays_(ymd, -w);
}
function tally_(list) {
  var t = { n: 0, red: 0, blue: 0, yellow: 0, green: 0 };
  list.forEach(function (x) { t.n++; if (t[x.color] !== undefined) t[x.color]++; });
  t.neg = t.n ? (t.red + t.blue + t.yellow) / t.n : 0;
  return t;
}
function zeroChange_() { return { both: 0, improved: 0, same: 0, shifted: 0, worsened: 0 }; }
function stats_(cls, days) {
  var end = today_(), start = addDays_(end, -(days - 1)), prevStart = addDays_(start, -days), weekly = days > 31;
  var names = {}, sizes = {};
  rows_('Roster').forEach(function (r) {
    var c = String(r['班級']); names[c + '|' + Number(r['座號'])] = r['姓名'];
    if (!cls || c === cls) sizes[c] = (sizes[c] || 0) + 1;
  });
  // 每位學生「每天、每種類型（Check-in／Check-out）」取最新一筆
  var latest = {};
  checkinRows_().forEach(function (r) {
    var d = dateStr_(r['日期']), c = String(r['班級']);
    if (d < prevStart || d > end || (cls && c !== cls)) return;
    var pd = r._kind, t = timeStr_(r['時間']), k = c + '|' + Number(r['座號']) + '|' + d + '|' + pd;
    if (!latest[k] || t >= latest[k].time) {
      latest[k] = { cls: c, seat: Number(r['座號']), date: d, kind: pd, time: t, color: r['顏色'], emotion: String(r['情緒'] || '') };
    }
  });
  var all = Object.keys(latest).map(function (k) { return latest[k]; });
  var cur = all.filter(function (x) { return x.date >= start; });
  var prev = all.filter(function (x) { return x.date < start; });
  var bucketOf = function (d) { return weekly ? weekStart_(d) : d; };

  // 簽到人次的時間序列：31 天內以日、較長以週為單位
  var buckets = {};
  cur.forEach(function (x) {
    var key = bucketOf(x.date);
    var b = buckets[key] || (buckets[key] = { key: key, n: 0, red: 0, blue: 0, yellow: 0, green: 0 });
    b.n++; if (b[x.color] !== undefined) b[x.color]++;
  });
  var series = Object.keys(buckets).sort().map(function (k) { return buckets[k]; });

  // 當天心情變化：同一天 Check-in、Check-out 都有簽到的學生（好轉／持平／轉換／轉差）
  var dayMap = {};
  cur.forEach(function (x) {
    var k = x.cls + '|' + x.seat + '|' + x.date;
    (dayMap[k] = dayMap[k] || { cls: x.cls, seat: x.seat, date: x.date })[x.kind] = x.color;
  });
  var change = zeroChange_(), changeByBucket = {}, changeByClass = {}, worsenedBy = {};
  Object.keys(dayMap).forEach(function (k) {
    var v = dayMap[k]; if (!v.ci || !v.co) return;
    var kind = changeKind_(v.ci, v.co), bk = bucketOf(v.date);
    var cb = changeByBucket[bk] || (changeByBucket[bk] = zeroChange_()); cb.key = bk;
    var cc = changeByClass[v.cls] || (changeByClass[v.cls] = zeroChange_());
    [change, cb, cc].forEach(function (o) { o.both++; o[kind]++; });
    if (kind === 'worsened') { var sk = v.cls + '|' + v.seat; worsenedBy[sk] = (worsenedBy[sk] || 0) + 1; }
  });
  var changeSeries = Object.keys(changeByBucket).sort().map(function (k) { return changeByBucket[k]; });

  // 情緒排行
  var emo = {};
  cur.forEach(function (x) {
    if (!x.emotion) return;
    var e = emo[x.emotion] || (emo[x.emotion] = { name: x.emotion, color: x.color, n: 0 }); e.n++;
  });
  var emotions = Object.keys(emo).map(function (k) { return emo[k]; }).sort(function (a, b) { return b.n - a.n; });

  // 各班（全校視角）
  var byClass = [];
  if (!cls) {
    Object.keys(sizes).sort().forEach(function (c) {
      var mine = cur.filter(function (x) { return x.cls === c; }), pv = prev.filter(function (x) { return x.cls === c; });
      var daysActive = {}; mine.forEach(function (x) { daysActive[x.date] = 1; });
      var nd = Object.keys(daysActive).length, t = tally_(mine), size = sizes[c];
      var ciN = mine.filter(function (x) { return x.kind === 'ci'; }).length, coN = mine.length - ciN;
      byClass.push({ cls: c, size: size, n: t.n, red: t.red, blue: t.blue, yellow: t.yellow, green: t.green, neg: t.neg,
        prevNeg: pv.length ? tally_(pv).neg : null,
        ciRate: nd && size ? ciN / (nd * size) : 0, coRate: nd && size ? coN / (nd * size) : 0,
        participation: nd && size ? t.n / (nd * size * 2) : 0, change: changeByClass[c] || zeroChange_() });
    });
  }

  // 持續關注學生（含姓名；前端依權限顯示）
  var per = {};
  cur.forEach(function (x) { var k = x.cls + '|' + x.seat; (per[k] = per[k] || []).push(x); });
  var watch = [];
  Object.keys(per).forEach(function (k) {
    var list = per[k].sort(function (a, b) { return (a.date + a.kind) < (b.date + b.kind) ? -1 : 1; });
    var t = tally_(list), streak = 0;
    for (var i = list.length - 1; i >= 0 && NEG_[list[i].color]; i--) streak++;
    var why = [];
    if (streak >= 3) why.push('連續 ' + streak + ' 次簽到非綠色');
    if (t.n >= 5 && t.neg >= 0.6) why.push('負向情緒占 ' + Math.round(t.neg * 100) + '%');
    if (t.red >= 3) why.push('紅色 ' + t.red + ' 次');
    if ((worsenedBy[k] || 0) >= 3) why.push('當天心情由綠轉差 ' + worsenedBy[k] + ' 次');
    if (why.length) {
      var pt = prev.filter(function (x) { return x.cls === list[0].cls && x.seat === list[0].seat; });
      watch.push({ cls: list[0].cls, seat: list[0].seat, name: names[k] || '', n: t.n, red: t.red, blue: t.blue, yellow: t.yellow,
        green: t.green, neg: t.neg, prevNeg: pt.length ? tally_(pt).neg : null, streak: streak, last: list[list.length - 1].color, why: why });
    }
  });
  watch.sort(function (a, b) { return (b.streak - a.streak) || (b.neg - a.neg); });

  return { ok: true, scope: cls || 'school', days: days, bucket: weekly ? 'week' : 'day', start: start, end: end,
    totals: tally_(cur), prevTotals: tally_(prev),
    kinds: { ci: tally_(cur.filter(function (x) { return x.kind === 'ci'; })), co: tally_(cur.filter(function (x) { return x.kind === 'co'; })) },
    change: change, changeSeries: changeSeries, series: series, emotions: emotions, byClass: byClass, watch: watch };
}

// 全校總覽：每班名單 + 當日每位學生 Check-in／Check-out 各自最新一筆簽到 + 處遇
function overview_(d) {
  var classes = {}, order = [];
  rows_('Roster').forEach(function (r) {
    var c = String(r['班級']);
    if (!classes[c]) { classes[c] = { cls: c, students: {} }; order.push(c); }
    classes[c].students[Number(r['座號'])] = { seat: Number(r['座號']), name: r['姓名'], avatar: String(r['圖案'] || '') };
  });
  checkinRows_().forEach(function (r) {
    if (dateStr_(r['日期']) !== d) return;
    var c = String(r['班級']), s = Number(r['座號']);
    if (!classes[c]) { classes[c] = { cls: c, students: {} }; order.push(c); }
    var st = classes[c].students[s] || (classes[c].students[s] = { seat: s, name: r['姓名'] });
    var pd = r._kind, t = timeStr_(r['時間']);
    if (!st[pd] || t >= st[pd].time) st[pd] = { time: t, color: r['顏色'], emotion: r['情緒'], note: r['備註'] };
  });
  rows_('Followups').forEach(function (r) {
    if (dateStr_(r['日期']) !== d) return;
    var c = String(r['班級']), s = Number(r['座號']);
    if (classes[c] && classes[c].students[s]) classes[c].students[s].fu = { status: r['狀態'], note: r['處遇紀錄'], teacher: r['教師'] };
  });
  order.sort();
  return {
    ok: true, date: d,
    classes: order.map(function (c) {
      var list = Object.keys(classes[c].students).map(Number).sort(function (a, b) { return a - b; })
        .map(function (k) {
          var st = classes[c].students[k];
          var L = (st.ci && st.co) ? (st.co.time >= st.ci.time ? st.co : st.ci) : (st.co || st.ci);   // 目前（最新）狀態
          if (L) { st.time = L.time; st.color = L.color; st.emotion = L.emotion; st.note = L.note; }
          st.change = (st.ci && st.co) ? changeKind_(st.ci.color, st.co.color) : '';
          return st;
        });
      return { cls: c, students: list };
    })
  };
}

function rosterOf_(cls) {
  return rows_('Roster').filter(function (r) { return String(r['班級']) === String(cls); })
    .map(function (r) { return { seat: Number(r['座號']), name: r['姓名'], avatar: String(r['圖案'] || '') }; });
}

// ===== 即時通知導師（Email）=====
// 規則：選「紅色」一律通知；「藍色／黃色」只有在學生有留言時才通知；同一位學生 Check-in、Check-out 各只通知一次。
// 收件人：Teachers 分頁該班的「信箱」欄；另可在指令碼屬性設 PRINCIPAL_EMAIL（校長副本）、DASHBOARD_URL（看板網址）。
function clsLabel_(c) {
  var z = ['', '一', '二', '三', '四', '五', '六'], g = parseInt(c, 10);
  return (z[g] || g) + '年' + String(c).slice(String(g).length) + '班';
}
function alertTeachers_(cls, seat, name, color, emotion, hasNote, kind) {
  var urgent = color === 'red' || ((color === 'blue' || color === 'yellow') && hasNote);
  if (!urgent) return;
  var cache = CacheService.getScriptCache(), key = 'al|' + cls + '|' + seat + '|' + today_() + '|' + (kind || '');
  if (cache.get(key)) return;                                  // 今天已通知過
  var seen = {}, to = [];
  var add = function (m) { m = String(m || '').trim(); if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m) && !seen[m]) { seen[m] = 1; to.push(m); } };
  rows_('Teachers').forEach(function (r) { if (String(r['班級']) === String(cls)) add(r['信箱']); });
  add(prop_('PRINCIPAL_EMAIL'));
  if (!to.length || MailApp.getRemainingDailyQuota() < 1) return;
  var dash = prop_('DASHBOARD_URL') || '';
  var label = color === 'red' ? '紅色（生氣區）' : (color === 'blue' ? '藍色（沮喪區）' : '黃色（焦慮區）');
  MailApp.sendEmail({
    to: to.join(','), name: 'SEL 情緒簽到',
    subject: '【SEL 關心】' + clsLabel_(cls) + ' ' + seat + '號 ' + name + '（' + (KIND_ZH_[kind] || '') + '）選了 ' + label,
    body: now_() + '\n\n班級：' + clsLabel_(cls) + '\n學生：' + seat + '號 ' + name + '\n類型：' + (KIND_ZH_[kind] || '') + '\n情緒：' + emotion + '｜' + label + '\n' +
      (hasNote ? '學生有留言，請登入看板查看。\n' : '') + '\n請盡快關心這位同學。' + (dash ? '\n看板：' + dash : '') +
      '\n\n※ 本信含學生個資，請勿轉寄。同一位學生 Check-in、Check-out 各只會通知一次。'
  });
  cache.put(key, '1', 21600);
}
// 測試用：在編輯器選 testAlert 執行一次（第一次會要求寄信授權），會寄一封測試信給你自己
function testAlert() {
  var me = Session.getEffectiveUser().getEmail();
  MailApp.sendEmail({ to: me, name: 'SEL 情緒簽到', subject: '【SEL 關心】測試信', body: '收到這封信代表即時通知已經可以使用。' });
  Logger.log('已寄測試信給 ' + me);
}

// 前端以 text/plain 傳 JSON，避免 CORS 預檢
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var b = JSON.parse(e.postData.contents), a = b.action;
    if (a === 'checkin') {
      if (COLORS.indexOf(b.color) < 0) return out_({ ok: false, error: 'bad color' });
      var cls = str_(b.cls, 10), seat = Number(b.seat);
      var me = rosterOf_(cls).filter(function (r) { return r.seat === seat; })[0];
      var name = me ? me.name : str_(b.name, 20);
      // 不論時間，只看順序：學生當天第一次送出＝Check-in，第二次起＝Check-out（第三次以後視為更正 Check-out，
      // 統計取最新一筆）。以後端紀錄為準，不採用前端傳來的任何類型。
      var seenToday = 0, dd = today_();
      rows_('Checkins').forEach(function (r) {
        if (String(r['班級']) === cls && Number(r['座號']) === seat && dateStr_(r['日期']) === dd) seenToday++;
      });
      var kind = seenToday === 0 ? 'ci' : 'co';
      var csh = sheet_('Checkins'), hdr = csh.getDataRange().getValues()[0];
      try { if (hdr.indexOf('類型') < 0) csh.getRange(1, hdr.length + 1).setValue('類型'); } catch (hdrErr) {}   // 舊試算表自動補上「類型」標題欄（失敗也不影響簽到）
      csh.appendRow([Utilities.getUuid(), now_(), today_(), cls, seat, name,
        b.color, str_(b.emotion, 30), str_(b.note, 200), KIND_ZH_[kind]]);
      // 即時通知導師（寄信失敗不影響簽到）
      try { alertTeachers_(cls, seat, name, b.color, str_(b.emotion, 30), !!str_(b.note, 200), kind); } catch (mailErr) {}
      return out_({ ok: true, kind: kind });
    }
    if (a === 'setAvatar') {   // 學生自選圖案（自我圖式）
      var av = str_(b.avatar, 8);
      if (!av || /[A-Za-z0-9<>&"'\s]/.test(av)) return out_({ ok: false, error: 'bad avatar' });
      var rsh = sheet_('Roster'), rv = rsh.getDataRange().getValues(), col = rv[0].indexOf('圖案');
      if (col < 0) { col = rv[0].length; rsh.getRange(1, col + 1).setValue('圖案'); }
      var target = -1, current = '';
      for (var j = 1; j < rv.length; j++) {
        if (String(rv[j][0]) !== String(b.cls)) continue;
        if (Number(rv[j][1]) === Number(b.seat)) { target = j; current = String(rv[j][col] || ''); }
        else if (String(rv[j][col] || '') === av) return out_({ ok: false, error: 'taken' });   // 同班同學已選走，每個圖案只能一人使用
      }
      if (target < 0) return out_({ ok: false, error: 'not in roster' });
      // 每個座號只能選一次，選定就固定（重送相同圖案視為成功，避免網路重試誤判）；要重選須由老師／校長重設
      if (current) return out_(current === av ? { ok: true } : { ok: false, error: 'locked' });
      rsh.getRange(target + 1, col + 1).setValue(av);
      return out_({ ok: true });
    }
    var acc = access_(b.pass);
    if (!acc) return out_({ ok: false, error: 'auth' });
    if (!can_(acc, b.cls)) return out_({ ok: false, error: 'forbidden' });
    if (a === 'clearAvatar') {   // 老師（自己班）或校長：重設某位學生的圖案，讓他可以重新選一次
      var csh2 = sheet_('Roster'), cv = csh2.getDataRange().getValues(), ccol = cv[0].indexOf('圖案');
      if (ccol < 0) return out_({ ok: true });
      for (var q = 1; q < cv.length; q++) {
        if (String(cv[q][0]) === String(b.cls) && Number(cv[q][1]) === Number(b.seat)) { csh2.getRange(q + 1, ccol + 1).setValue(''); return out_({ ok: true }); }
      }
      return out_({ ok: false, error: 'not in roster' });
    }
    if (a === 'saveRoster') {
      var sh = sheet_('Roster');
      var all = sh.getDataRange().getValues();
      var keep = {};   // 重存名單時保留學生已選的圖案
      for (var i = all.length - 1; i >= 1; i--) if (String(all[i][0]) === String(b.cls)) { keep[Number(all[i][1])] = all[i][3] || ''; sh.deleteRow(i + 1); }
      (b.roster || []).forEach(function (r) { sh.appendRow([str_(b.cls, 10), Number(r.seat), str_(r.name, 20), keep[Number(r.seat)] || '']); });
      return out_({ ok: true });
    }
    if (a === 'followup') {
      sheet_('Followups').appendRow([now_(), today_(), str_(b.cls, 10), Number(b.seat), str_(b.name, 20),
        str_(b.status, 20), str_(b.note, 500), str_(b.teacher || acc.name, 20)]);
      return out_({ ok: true });
    }
    return out_({ ok: false, error: 'unknown action' });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}
