/* SEL 情緒統計（短／中／長期）共用畫面：teacher.html 與 principal.html 都載入這支檔案 */
(function(){
  const RANGES=[{days:7,label:'短期 7 天'},{days:30,label:'中期 30 天'},{days:180,label:'長期 180 天（約一學期）'}];
  const COL={red:'#e5484d',blue:'#3b82f6',yellow:'#f5b301',green:'#2fa86b'};
  const ZH={red:'紅·生氣',blue:'藍·沮喪',yellow:'黃·焦慮',green:'綠·平和'};
  const GRADE_ZH=['','一','二','三','四','五','六'];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pct=x=>Math.round((x||0)*100)+'%';
  const clsLabel=c=>(GRADE_ZH[c[0]]||c[0])+'年'+c.slice(1)+'班';

  const css=`.st-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 12px}
.st-tabs button{border:2px solid #cbd5e1;background:#fff;border-radius:999px;padding:7px 14px;font-size:15px;cursor:pointer;font-family:inherit}
.st-tabs button.on{background:#374151;color:#fff;border-color:#374151}
.st-sum{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
.st-sum div{flex:1;min-width:130px;background:#fff;border-radius:12px;padding:10px 12px;box-shadow:0 1px 5px rgba(0,0,0,.07)}
.st-sum b{display:block;font-size:24px}.st-sum span{font-size:13px;color:#6b7280}
.st-up{color:#b91c1c}.st-down{color:#047857}
.st-card{background:#fff;border-radius:14px;padding:12px;margin-bottom:12px;box-shadow:0 1px 5px rgba(0,0,0,.07)}
.st-card h3{margin:0 0 8px;font-size:16px}
.st-chart{display:flex;align-items:flex-end;gap:3px;height:170px;border-bottom:2px solid #e5e7eb;padding-top:6px}
.st-col{flex:1;min-width:6px;height:100%;display:flex;flex-direction:column-reverse;justify-content:flex-start}
.st-col i{display:block}
.st-lab{display:flex;gap:3px;font-size:11px;color:#6b7280;margin-top:3px}.st-lab span{flex:1;min-width:6px;text-align:center;overflow:visible;white-space:nowrap}
.st-leg{display:flex;gap:12px;flex-wrap:wrap;font-size:13px;margin-top:8px}.st-leg i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:4px;vertical-align:-1px}
.st-bar{display:flex;align-items:center;gap:8px;margin:5px 0;font-size:14px}.st-bar .nm{width:150px;flex:none}.st-bar .tr{flex:1;background:#f1f5f9;border-radius:6px;height:16px;overflow:hidden}.st-bar .tr i{display:block;height:100%}
.st-t{width:100%;border-collapse:collapse;font-size:14px}.st-t th,.st-t td{text-align:left;padding:6px 5px;border-bottom:1px solid #e5e7eb}
.st-note{color:#6b7280;font-size:13px;margin-top:6px}`;
  if(!document.getElementById('st-css')){const s=document.createElement('style');s.id='st-css';s.textContent=css;document.head.appendChild(s)}

  function delta(cur,prev,hasPrev){
    if(!hasPrev)return '<span>（無前期資料可比較）</span>';
    const d=Math.round((cur-prev)*100);
    if(d===0)return '<span>與前期持平</span>';
    return d>0?`<span class="st-up">▲ 比前期多 ${d} 個百分點</span>`:`<span class="st-down">▼ 比前期少 ${-d} 個百分點</span>`;
  }
  function chart(d){
    if(!d.series.length)return '<div class="st-note">這段期間沒有簽到資料。</div>';
    const maxN=Math.max(...d.series.map(b=>b.n)),step=Math.ceil(d.series.length/10);
    const cols=d.series.map(b=>{
      const h=b.n/maxN*100;  // 高度＝當期簽到人次（相對），顏色段＝各色占比
      const seg=['red','blue','yellow','green'].map(k=>b[k]?`<i style="height:${b[k]/b.n*100}%;background:${COL[k]}"></i>`:'').join('');
      const lbl=d.bucket==='week'?`${b.key.slice(5)} 起這週`:b.key.slice(5);
      return `<div class="st-col" title="${lbl}：共 ${b.n} 人次｜紅${b.red} 藍${b.blue} 黃${b.yellow} 綠${b.green}"><div style="height:${h}%;display:flex;flex-direction:column-reverse">${seg}</div></div>`;
    }).join('');
    const labs=d.series.map((b,i)=>`<span>${i%step===0?b.key.slice(5):''}</span>`).join('');
    return `<div class="st-chart">${cols}</div><div class="st-lab">${labs}</div>
      <div class="st-leg">${Object.keys(COL).map(k=>`<span><i style="background:${COL[k]}"></i>${ZH[k]}</span>`).join('')}<span class="st-note">柱高＝簽到人次，色塊＝各色占比（${d.bucket==='week'?'每週':'每日'}）</span></div>`;
  }
  function emotions(d){
    if(!d.emotions.length)return '';
    const max=d.emotions[0].n;
    return `<div class="st-card"><h3>情緒排行</h3>`+d.emotions.slice(0,12).map(e=>`<div class="st-bar"><span class="nm">${window.SELFaces?SELFaces.html(e.name,22):esc(e.name)}</span><span class="tr"><i style="width:${e.n/max*100}%;background:${COL[e.color]||'#94a3b8'}"></i></span><span>${e.n}</span></div>`).join('')+'</div>';
  }
  function classes(d){
    if(!d.byClass||!d.byClass.length)return '';
    return `<div class="st-card"><h3>各班比較</h3><div style="overflow-x:auto"><table class="st-t"><tr><th>班級</th><th>👋 Check-in 簽到率</th><th>🏁 Check-out 簽到率</th><th>🔴</th><th>🔵</th><th>🟡</th><th>🟢</th><th>負向占比</th><th>好轉↑</th><th>轉差↓</th></tr>`+
      d.byClass.map(c=>{const ch=c.change||{};return `<tr><td>${clsLabel(c.cls)}</td><td>${pct(c.ciRate)}</td><td>${pct(c.coRate)}</td><td>${c.red}</td><td>${c.blue}</td><td>${c.yellow}</td><td>${c.green}</td><td>${pct(c.neg)} ${c.prevNeg==null?'':(c.neg>c.prevNeg?'<span class="st-up">▲</span>':c.neg<c.prevNeg?'<span class="st-down">▼</span>':'＝')}</td><td>${ch.improved||0}</td><td>${ch.worsened?`<b class="st-up">${ch.worsened}</b>`:0}</td></tr>`}).join('')+
      `</table></div><div class="st-note">簽到率＝該類型（Check-in／Check-out）簽到人次 ÷（有簽到的天數 × 班級人數）；好轉／轉差＝同一天 Check-in 與 Check-out 都有簽到者的人次；▲▼ 與前一個同長度期間比較。</div></div>`;
  }
  // 當天心情變化：Check-in → Check-out
  const KIND={improved:{zh:'好轉',c:'#2fa86b',icon:'↑',hint:'非綠 → 綠'},same:{zh:'持平',c:'#94a3b8',icon:'＝',hint:'顏色不變'},shifted:{zh:'轉換',c:'#f59e0b',icon:'⇄',hint:'非綠 → 另一種非綠'},worsened:{zh:'轉差',c:'#e5484d',icon:'↓',hint:'綠 → 非綠'}};
  const KORDER=['improved','same','shifted','worsened'];
  function kindBar(label,t){
    if(!t||!t.n)return `<div class="st-bar"><span class="nm">${label}</span><span class="st-note">沒有簽到</span></div>`;
    return `<div class="st-bar"><span class="nm">${label}（${t.n}）</span><span class="tr" style="display:flex">${['red','blue','yellow','green'].map(k=>t[k]?`<i style="width:${t[k]/t.n*100}%;background:${COL[k]}" title="${ZH[k]} ${t[k]}"></i>`:'').join('')}</span><span>${pct(t.neg)}</span></div>`;
  }
  function changeChart(d){
    const cs=d.changeSeries||[]; if(!cs.length)return '';
    const maxN=Math.max(...cs.map(b=>b.both)),step=Math.ceil(cs.length/10);
    const cols=cs.map(b=>{const seg=KORDER.map(k=>b[k]?`<i style="height:${b[k]/b.both*100}%;background:${KIND[k].c}"></i>`:'').join('');
      return `<div class="st-col" title="${b.key}：${KORDER.map(k=>KIND[k].zh+b[k]).join('｜')}"><div style="height:${b.both/maxN*100}%;display:flex;flex-direction:column-reverse">${seg}</div></div>`}).join('');
    return `<div class="st-chart" style="height:120px">${cols}</div><div class="st-lab">${cs.map((b,i)=>`<span>${i%step===0?b.key.slice(5):''}</span>`).join('')}</div>`;
  }
  function changeCard(d){
    const c=d.change||{both:0}, P=d.kinds||{};
    let h=`<div class="st-card"><h3>🔄 當天心情變化（Check-in → Check-out）</h3>`;
    if(!c.both){h+=`<div class="st-note">這段期間還沒有同學「同一天 Check-in 和 Check-out 都簽到」，Check-out 後就會出現變化統計。</div>`;}
    else{
      h+=`<div class="st-sum" style="margin-bottom:8px">`+KORDER.map(k=>`<div style="border-top:4px solid ${KIND[k].c}"><b style="color:${KIND[k].c}">${c[k]} <small style="font-size:13px">（${pct(c[k]/c.both)}）</small></b><span>${KIND[k].icon} ${KIND[k].zh}：${KIND[k].hint}</span></div>`).join('')+`</div>`+
        changeChart(d)+`<div class="st-leg">${KORDER.map(k=>`<span><i style="background:${KIND[k].c}"></i>${KIND[k].zh}</span>`).join('')}<span class="st-note">柱高＝Check-in、Check-out 都簽到的人次（${d.bucket==='week'?'每週':'每日'}）</span></div>`;
    }
    h+=`<div style="margin-top:12px"><b style="font-size:14px">Check-in 與 Check-out 的情緒分布</b>${kindBar('👋 Check-in',P.ci)}${kindBar('🏁 Check-out',P.co)}</div>`+
      `<div class="st-note">進步＝Check-out 比 Check-in 更平和；轉差的同學建議當天關心。若 Check-out 的負向占比明顯高於 Check-in，可回頭看當天的課程與互動。</div></div>`;
    return h;
  }
  function watch(d,showCls){
    const w=d.watch||[];
    return `<div class="st-card"><h3>🔎 持續關注學生（${w.length} 位）</h3>`+(w.length?`<table class="st-t"><tr>${showCls?'<th>班級</th>':''}<th>座號</th><th>姓名</th><th>原因</th><th>簽到次數</th><th>最近</th></tr>`+
      w.map(s=>`<tr>${showCls?`<td>${clsLabel(s.cls)}</td>`:''}<td>${s.seat}</td><td>${esc(s.name)}</td><td>${s.why.map(esc).join('；')}</td><td>${s.n}</td><td><span style="color:${COL[s.last]}">●</span> ${ZH[s.last]}</td></tr>`).join('')+'</table>':'<div class="st-note">這段期間沒有達到關注條件的學生。</div>')+
      `<div class="st-note">條件（任一）：連續 3 次以上非綠色、簽到 5 次以上且負向占 60% 以上、紅色 3 次以上。僅供輔導參考，請搭配實際觀察。</div></div>`;
  }
  window.SELStats={
    RANGES,
    /* 回傳統計畫面 HTML。opts.showCls：顯示班級欄（校長）；opts.tabsHtml：頁面自行傳入期間按鈕 */
    html(d,opts){
      opts=opts||{};const t=d.totals,p=d.prevTotals,hasPrev=p.n>0;
      return `<div class="st-sum">
        <div><b>${t.n}</b><span>簽到人次（${d.start.slice(5)} ～ ${d.end.slice(5)}）</span></div>
        <div><b>${pct(t.neg)}</b><span>負向情緒（紅＋藍＋黃）<br>${delta(t.neg,p.neg,hasPrev)}</span></div>
        <div><b>${pct(t.n?t.green/t.n:0)}</b><span>綠色（平和快樂）</span></div></div>
        ${changeCard(d)}<div class="st-card"><h3>情緒走勢</h3>${chart(d)}</div>${classes(d)}${emotions(d)}${watch(d,opts.showCls)}`;
    },
    tabs(active){
      return `<div class="st-tabs">`+RANGES.map(r=>`<button data-days="${r.days}" class="${r.days===active?'on':''}">${r.label}</button>`).join('')+`</div>`;
    }
  };
})();
