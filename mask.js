/* 學生姓名遮罩：畫面上一律以「王o明」的形式顯示（中間的字以 o 取代）。
   兩個字：王o　三個字：王o明　四個字以上：王oo明（頭尾保留，中間全部換成 o）。
   只影響「畫面與匯出」；試算表裡仍是完整姓名。 */
(function(){
  window.SELMask=function(name){
    const a=Array.from(String(name==null?'':name).trim());
    if(a.length<2)return a.join('');
    if(a.length===2)return a[0]+'o';
    return a[0]+'o'.repeat(a.length-2)+a[a.length-1];
  };
})();
