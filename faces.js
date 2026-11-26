/* SEL 情緒臉譜 v2：12 種情緒的向量插圖與柔和配色（學生頁與兩個看板共用）
   特色：柔光漸層臉、眼睛高光、每種情緒有專屬記號（怒氣符號、汗滴、星星…）以利辨識。
   要改配色或描述，只需改這個檔案。 */
(function () {
  const ZONE = {
    red:    { card: '#FFECEC', light: '#FFE3E0', face: '#FFB9B3', ring: '#E98A84', stroke: '#A93733', text: '#8A2A27', zh: '紅色・生氣區' },
    blue:   { card: '#EAF1FF', light: '#E3EDFF', face: '#B3CDFA', ring: '#7FA3E6', stroke: '#2F58AB', text: '#27478A', zh: '藍色・沮喪區' },
    yellow: { card: '#FFF6D6', light: '#FFF4C7', face: '#FFDD82', ring: '#E9B93A', stroke: '#8F6700', text: '#6B4E00', zh: '黃色・焦慮區' },
    green:  { card: '#E8F5EC', light: '#E4F8EB', face: '#B5E6C5', ring: '#74C28E', stroke: '#2F7A4C', text: '#235C39', zh: '綠色・平和區' }
  };
  const TEAR = '#7FB8FF', BLUSH = '#FF8FA3', GOLD = '#FFC107';
  // 線條（粗圓角）
  const L = (s, w) => `stroke="${s}" stroke-width="${w || 3.4}" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  // 有高光的黑眼珠
  const eye = (x, y, s, r) => `<circle cx="${x}" cy="${y}" r="${r || 3.8}" fill="${s}"/><circle cx="${x - 1.3}" cy="${y - 1.4}" r="${(r || 3.8) * 0.33}" fill="#fff"/>`;
  const star = (x, y, k, c) => `<path d="M${x} ${y - 7 * k}L${x + 2 * k} ${y - 2 * k}L${x + 7 * k} ${y}L${x + 2 * k} ${y + 2 * k}L${x} ${y + 7 * k}L${x - 2 * k} ${y + 2 * k}L${x - 7 * k} ${y}L${x - 2 * k} ${y - 2 * k}Z" fill="${c}"/>`;
  const drop = (x, y, k) => `<path d="M${x} ${y}Q${x + 4 * k} ${y + 7 * k} ${x} ${y + 10 * k}Q${x - 4 * k} ${y + 7 * k} ${x} ${y}Z" fill="${TEAR}" stroke="#4F93E8" stroke-width="1"/>`;
  const blush = `<ellipse cx="14.5" cy="41" rx="5" ry="3.4" fill="${BLUSH}" opacity=".55"/><ellipse cx="49.5" cy="41" rx="5" ry="3.4" fill="${BLUSH}" opacity=".55"/>`;

  // 每種情緒：zone（顏色區）、desc（一句話描述）、draw（五官與專屬記號）
  const F = {
    '生氣': { zone: 'red', desc: '心裡有一團火', draw: s =>
      `<path d="M15 19L28 26M49 19L36 26" ${L(s, 4)}/>${eye(23, 32, s, 3.4)}${eye(41, 32, s, 3.4)}<path d="M22 49Q32 38 42 49" ${L(s, 3.6)}/>` +
      `<path d="M47 5q4 0 4 4M55 5q-4 0 -4 4M47 13q4 0 4 -4M55 13q-4 0 -4 -4" ${L('#E5484D', 2.6)}/>` },
    '挫折': { zone: 'red', desc: '事情不如預期', draw: s =>
      `<path d="M17 24L28 30L17 36M47 24L36 30L47 36" ${L(s, 3.8)}/><path d="M20 47Q26 40 32 47T44 47" ${L(s, 3.6)}/>` +
      `<path d="M14 9q3 -5 6 0M44 9q3 -5 6 0M10 14l4 2M54 14l-4 2" ${L(s, 2.6)}/>` },
    '嫉妒': { zone: 'red', desc: '看到別人有，我也想要', draw: s =>
      `<path d="M15 21L28 19M36 23L49 17" ${L(s, 3.8)}/><ellipse cx="23" cy="31" rx="6.2" ry="5" fill="#fff" stroke="${s}" stroke-width="2.4"/>${eye(26.2, 31, s, 2.8)}` +
      `<ellipse cx="41" cy="31" rx="6.2" ry="5" fill="#fff" stroke="${s}" stroke-width="2.4"/>${eye(44.2, 31, s, 2.8)}<path d="M22 47Q32 42 43 45" ${L(s, 3.6)}/>` +
      `<path d="M52 8l2 4 4 .6-3 3 .8 4-3.8-2-3.8 2 .8-4-3-3 4-.6z" fill="#7DD3A0" opacity=".9"/>` },
    '沮喪': { zone: 'blue', desc: '有一點提不起勁', draw: s =>
      `<path d="M15 27L28 21M49 27L36 21" ${L(s, 3.8)}/>${eye(23, 33, s, 3.4)}${eye(41, 33, s, 3.4)}<path d="M22 50Q32 41 42 50" ${L(s, 3.6)}/>${drop(18, 38, 1)}${drop(46, 38, 1)}` },
    '孤單': { zone: 'blue', desc: '好像沒有人陪我', draw: s =>
      `<path d="M16 26Q22 22 28 26M36 26Q42 22 48 26" ${L(s, 3)}/><circle cx="23" cy="33" r="5.6" fill="${s}"/><circle cx="41" cy="33" r="5.6" fill="${s}"/><circle cx="21.2" cy="31" r="2" fill="#fff"/><circle cx="39.2" cy="31" r="2" fill="#fff"/><circle cx="25" cy="35" r="1" fill="#fff"/><circle cx="43" cy="35" r="1" fill="#fff"/>` +
      `<path d="M28 49Q32 45.5 36 49" ${L(s, 3.4)}/>${drop(46, 40, 1)}<circle cx="48" cy="10" r="2" fill="${s}" opacity=".7"/><circle cx="54" cy="10" r="2" fill="${s}" opacity=".7"/><circle cx="60" cy="10" r="2" fill="${s}" opacity=".7"/>` },
    '失望': { zone: 'blue', desc: '期待的事沒有發生', draw: s =>
      `<path d="M16 24Q22 22 28 25M36 25Q42 22 48 24" ${L(s, 3.2)}/><path d="M17 32Q23 39 29 32Z" fill="#fff" stroke="${s}" stroke-width="2"/><path d="M35 32Q41 39 47 32Z" fill="#fff" stroke="${s}" stroke-width="2"/>${eye(23, 34, s, 1.9)}${eye(41, 34, s, 1.9)}<path d="M16 32H30M34 32H48" ${L(s, 3.6)}/>` +
      `<path d="M24 49Q32 43 40 49" ${L(s, 3.4)}/><path d="M51 40q4 1 4 5q3 0 3 3q0 3 -4 3h-6" fill="none" stroke="${s}" stroke-width="1.8" opacity=".6" stroke-linecap="round"/>` },
    '焦慮': { zone: 'yellow', desc: '有些擔心與不安', draw: s =>
      `<path d="M15 27L28 21M49 27L36 21" ${L(s, 3.6)}/>${eye(23, 33, s, 3.6)}${eye(41, 33, s, 3.6)}<path d="M20 49Q25 44 30 49T40 49T46 47" ${L(s, 3.4)}/>${drop(51, 8, 1.1)}${drop(12, 12, .8)}` },
    '害怕': { zone: 'yellow', desc: '心跳好快，想躲起來', draw: s =>
      `<path d="M15 18Q22 12 29 18M35 18Q42 12 49 18" ${L(s, 3.4)}/><circle cx="23" cy="30" r="7" fill="#fff" stroke="${s}" stroke-width="2.6"/>${eye(23, 31, s, 2.6)}<circle cx="41" cy="30" r="7" fill="#fff" stroke="${s}" stroke-width="2.6"/>${eye(41, 31, s, 2.6)}` +
      `<ellipse cx="32" cy="48" rx="5" ry="6.2" fill="${s}"/><ellipse cx="32" cy="50.5" rx="2.6" ry="2.2" fill="#FF8FA3" opacity=".8"/><path d="M55 6v9M55 19v2.4" ${L(s, 3.4)}/>` },
    '壓力大': { zone: 'yellow', desc: '事情好多，喘不過氣', draw: s =>
      `<path d="M23 31a1.6 1.6 0 0 1 3.2 0a3.2 3.2 0 0 1 -6.4 0a4.8 4.8 0 0 1 9.6 0a6.4 6.4 0 0 1 -12.8 0" ${L(s, 2.2)}/><path d="M41 31a1.6 1.6 0 0 1 3.2 0a3.2 3.2 0 0 1 -6.4 0a4.8 4.8 0 0 1 9.6 0a6.4 6.4 0 0 1 -12.8 0" ${L(s, 2.2)}/>` +
      `<path d="M20 49L24.5 44L29 49L33.5 44L38 49L42.5 44" ${L(s, 3.4)}/><path d="M32 2V7M21 4L23.5 8.5M43 4L40.5 8.5M12 9L16 12M52 9L48 12" ${L(s, 2.8)}/>` },
    '平和快樂': { zone: 'green', desc: '心裡暖暖、穩穩的', draw: s =>
      `<path d="M16 32Q22.5 24 29 32M35 32Q41.5 24 48 32" ${L(s, 3.6)}/><path d="M22 41Q32 52 42 41" ${L(s, 3.6)}/>${blush}${star(53, 11, .8, GOLD)}` },
    '開心興奮': { zone: 'green', desc: '好想跳起來、大聲笑', draw: s =>
      `${star(23, 28, 1.25, s)}${star(41, 28, 1.25, s)}<path d="M19 40Q32 58 45 40Z" fill="#fff" stroke="${s}" stroke-width="3.2" stroke-linejoin="round"/><path d="M25 48Q32 54 39 48Q32 45 25 48Z" fill="#FF8FA3"/>${blush}${star(55, 10, .8, GOLD)}${star(9, 12, .6, GOLD)}` },
    '自信自豪': { zone: 'green', desc: '我做到了，覺得很棒', draw: s =>
      `<path d="M16 23L28 21M36 20L48 23" ${L(s, 3.8)}/>${eye(23, 31, s, 3.8)}${eye(41, 31, s, 3.8)}<path d="M22 43Q33 54 45 40" ${L(s, 3.8)}/>${blush}${star(52, 11, 1, GOLD)}${star(11, 14, .6, GOLD)}` }
  };

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // 去掉開頭的表情符號與空白：'😠 生氣' → '生氣'
  const nameOf = str => String(str == null ? '' : str).replace(/^[^一-鿿]+/, '').trim();
  let uid = 0;

  function svg(name, size) {
    const f = F[nameOf(name)];
    if (!f) return '';
    const z = ZONE[f.zone], id = 'sf' + (++uid);
    return `<svg class="face" width="${size || 56}" height="${size || 56}" viewBox="0 0 64 64" role="img" aria-label="${esc(nameOf(name))}" style="flex:none;overflow:visible">` +
      `<defs><radialGradient id="${id}" cx="35%" cy="28%" r="78%"><stop offset="0" stop-color="${z.light}"/><stop offset="1" stop-color="${z.face}"/></radialGradient></defs>` +
      `<circle cx="32" cy="33" r="30" fill="rgba(0,0,0,.06)"/><circle cx="32" cy="32" r="30" fill="url(#${id})" stroke="${z.ring}" stroke-width="1.6"/>` +
      `<path d="M13 22Q17 11 28 8" stroke="#fff" stroke-opacity=".6" stroke-width="3" stroke-linecap="round" fill="none"/>${f.draw(z.stroke)}</svg>`;
  }
  // 圖＋名稱（給看板、統計用）
  function html(str, size) {
    const n = nameOf(str), f = F[n];
    if (!f) return esc(str);
    return `<span style="display:inline-flex;align-items:center;gap:5px;vertical-align:middle">${svg(n, size || 22)}<span>${esc(n)}</span></span>`;
  }
  window.SELFaces = { ZONE, FACES: F, svg, html, nameOf };
})();
