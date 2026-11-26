/* 校長「全校報告」：每天／每週／每月。資料來自後端 stats（全校），這裡負責把數字整理成一頁可讀、可列印的報告。 */
(function(){
  const MODES=[{id:'day',days:1,label:'📅 每天報告',title:'每日',range:'今天'},{id:'week',days:7,label:'🗓 每週報告',title:'每週',range:'最近 7 天'},{id:'month',days:30,label:'📆 每月報告',title:'每月',range:'最近 30 天'}];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pct=x=>Math.round((x||0)*100)+'%';
  const GZ=['','一','二','三','四','五','六'], clsLabel=c=>(GZ[c[0]]||c[0])+'年'+c.slice(1)+'班';
  const COL={red:'#e5484d',blue:'#3b82f6',yellow:'#f5b301',green:'#2fa86b'}, ZH={red:'紅·生氣',blue:'藍·沮喪',yellow:'黃·焦慮',green:'綠·平和'};
  function findings(d,mode){
    const t=d.totals,p=d.prevTotals,out=[],bc=(d.byClass||[]).filter(c=>c.n>0),ch=d.change||{both:0};
    if(!t.n) return ['這段期間沒有任何簽到資料。'];
    out.push(`${mode.range}共有 <b>${t.n}</b> 人次簽到；綠色（平和快樂）占 <b>${pct(t.green/t.n)}</b>，負向情緒（紅＋藍＋黃）占 <b>${pct(t.neg)}</b>。`);
    if(p.n>0&&mode.days>1){const dd=Math.round((t.neg-p.neg)*100);
      out.push(dd===0?'負向情緒占比與前一個同長度期間持平。':dd>0?`負向情緒比前期<b class="up">多 ${dd} 個百分點</b>，建議留意。`:`負向情緒比前期<b class="down">少 ${-dd} 個百分點</b>，整體趨於平穩。`);}
    if(ch.both) out.push(`同一天 Check-in 與 Check-out 都完成的有 <b>${ch.both}</b> 人次：好轉 ${pct(ch.improved/ch.both)}、持平 ${pct(ch.same/ch.both)}、轉換 ${pct(ch.shifted/ch.both)}、<b class="up">轉差 ${pct(ch.worsened/ch.both)}</b>（${ch.worsened} 人次）。`);
    if(bc.length>1){
      const hi=[...bc].sort((a,b)=>b.neg-a.neg)[0], lo=[...bc].sort((a,b)=>a.neg-b.neg)[0];
      out.push(`負向占比最高的是 <b>${clsLabel(hi.cls)}</b>（${pct(hi.neg)}），最低的是 <b>${clsLabel(lo.cls)}</b>（${pct(lo.neg)}）。`);
      const wc=[...bc].filter(c=>c.change&&c.change.worsened>0).sort((a,b)=>b.change.worsened-a.change.worsened)[0];
      if(wc) out.push(`當天心情轉差最多的是 <b>${clsLabel(wc.cls)}</b>（${wc.change.worsened} 人次），可請導師了解當天狀況。`);
    }
    if(d.emotions&&d.emotions.length) out.push(`最常出現的情緒是「<b>${esc(d.emotions[0].name)}</b>」（${d.emotions[0].n} 人次）。`);
    const w=d.watch||[]; out.push(w.length?`目前有 <b class="up">${w.length}</b> 位學生列入持續關注（見下方名單）。`:'目前沒有學生符合持續關注條件。');
    return out;
  }
  function kpi(d,mode){
    const t=d.totals,bc=d.byClass||[],size=bc.reduce((a,c)=>a+c.size,0);
    const part=size?bc.reduce((a,c)=>a+c.participation*c.size,0)/size:0, ch=d.change||{both:0};
    const cell=(b,l,c)=>`<div${c?` style="border-top:4px solid ${c}"`:''}><b${c?` style="color:${c}"`:''}>${b}</b><span>${l}</span></div>`;
    return `<div class="st-sum">`+cell(size,'全校學生數')+cell(t.n,'簽到人次')+cell(pct(part),'平均參與率（Check-in＋Check-out）')
      +cell(pct(t.n?t.green/t.n:0),'🟢 平和快樂',COL.green)+cell(pct(t.neg),'負向情緒（紅＋藍＋黃）',t.neg>=0.4?COL.red:COL.yellow)
      +cell(ch.both?pct(ch.improved/ch.both):'—','當天好轉比例',COL.green)+cell(ch.both?pct(ch.worsened/ch.both):'—','當天轉差比例',COL.red)+`</div>`;
  }
  window.SELReport={
    MODES,
    tabs(active){return `<div class="st-tabs" id="rptTabs">`+MODES.map(m=>`<button data-m="${m.id}" class="${m.id===active?'on':''}">${m.label}</button>`).join('')+`</div>`;},
    html(d,modeId){
      const mode=MODES.find(m=>m.id===modeId)||MODES[0], f=findings(d,mode);
      const head=`<div class="rpt-head"><h2>辰光國小 全校 SEL 情緒${mode.title}報告</h2><div class="st-note">統計期間：${d.start}${d.start===d.end?'':' ～ '+d.end}（${mode.range}）· 產生時間：${new Date().toLocaleString('zh-TW',{hour12:false})}</div></div>`;
      const sum=`<div class="st-card rpt-sum"><h3>📝 重點摘要</h3><ul>${f.map(x=>`<li>${x}</li>`).join('')}</ul></div>`;
      return head+kpi(d,mode)+sum+SELStats.html(d,{showCls:true,hideTrend:mode.days===1,noSummary:true});
    }
  };
})();
