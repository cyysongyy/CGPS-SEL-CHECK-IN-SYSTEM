// ★ 唯一需要你修改的地方 ★
// 部署 Apps Script（網頁應用程式）後，把網址貼在下面的引號內，三個頁面都會使用它。
window.SEL_GAS_URL = 'https://script.google.com/macros/s/AKfycbwmc7SmkCS-gYC_fz93Auy6MERCrjh1nCQpTAnNEcTxPGQrLs61Sj7kfdF2UA1kVjRX/exec';

// 點心情卡片就直接送出（不需要再按「送出」）：true＝開啟（預設）；false＝選好後要再按「送出」鈕。
// 開啟時送出後有 4 秒可按「↩︎ 按錯了，重選」撤銷（約 3 分鐘內有效）。
window.SEL_AUTO_SUBMIT = true;

// 大螢幕名單下方的「還沒簽到」提醒（一行小字，不跳視窗）：true＝開啟（預設）；false＝關閉。
// 上午 SEL_NUDGE_CI 之後提醒還沒 Check-in 的座號；下午 SEL_NUDGE_CO 之後提醒還沒 Check-out 的座號（24 小時制）。
window.SEL_NUDGE = true;
window.SEL_NUDGE_CI = '09:00';
window.SEL_NUDGE_CO = '15:30';
