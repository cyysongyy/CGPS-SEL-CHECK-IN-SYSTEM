/* SEL 動物頭像：30 種動物的向量插圖（統一風格、柔光漸層，不受裝置表情符號樣式影響）
   學生選的「代表圖案」仍以 emoji 為代號存進試算表（例如 🐶），畫面上換成這裡的精緻插圖。
   學生頁、老師看板、校長總控台共用。 */
(function () {
  const D = '#34271f';                 // 五官深色
  const RIM = 'rgba(70,45,30,.22)';    // 外框
  const PINK = '#FF9DB0', WHITE = '#fff';
  let uid = 0;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // 基本元件
  const eye = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r || 2.7}" fill="${D}"/><circle cx="${x - 0.9}" cy="${y - 1}" r="${(r || 2.7) * 0.36}" fill="#fff"/>`;
  const eyes = (y, dx, r) => eye(32 - (dx || 8), y, r) + eye(32 + (dx || 8), y, r);
  const nose = (x, y, c) => `<ellipse cx="${x}" cy="${y}" rx="3.6" ry="2.6" fill="${c || D}"/><ellipse cx="${x - 1}" cy="${y - 0.9}" rx="1.1" ry=".7" fill="#fff" opacity=".5"/>`;
  const smile = (x, y, w) => `<path d="M${x} ${y}v2.2M${x - w} ${y + 3.2}q${w} 3.4 ${w} -1q0 4.4 ${w} 1" stroke="${D}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const cheeks = (y, c) => `<ellipse cx="17.5" cy="${y}" rx="4.2" ry="2.8" fill="${c || PINK}" opacity=".5"/><ellipse cx="46.5" cy="${y}" rx="4.2" ry="2.8" fill="${c || PINK}" opacity=".5"/>`;
  const gloss = `<path d="M17 28Q19 21 26 18" stroke="#fff" stroke-opacity=".5" stroke-width="2.6" stroke-linecap="round" fill="none"/>`;
  const defs = (id, a, b) => `<defs><radialGradient id="${id}" cx="35%" cy="28%" r="80%"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient></defs>`;
  const head = (id, cx, cy, r) => `<circle cx="${cx || 32}" cy="${cy || 36}" r="${r || 21}" fill="url(#${id})" stroke="${RIM}" stroke-width="1.3"/>`;
  const ell = (id, cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id})" stroke="${RIM}" stroke-width="1.3"/>`;
  const st = (c, w) => `stroke="${c}" stroke-width="${w || 2}" stroke-linecap="round" stroke-linejoin="round" fill="none"`;

  // 每種動物：name 名稱、draw(id) 回傳 SVG 內容
  const A = {
    '🐶': { name: '小狗', draw: id => defs(id, '#FBE7BC', '#EBC98A') +
      `<ellipse cx="13" cy="30" rx="7" ry="13" transform="rotate(22 13 30)" fill="#9A6234" stroke="${RIM}" stroke-width="1.2"/><ellipse cx="51" cy="30" rx="7" ry="13" transform="rotate(-22 51 30)" fill="#9A6234" stroke="${RIM}" stroke-width="1.2"/>` +
      head(id) + `<circle cx="40.5" cy="33" r="7.2" fill="#9A6234" opacity=".92"/>` + ell('x', 32, 44, 9.5, 7).replace('url(#x)', '#FFF6E3') + eye(24, 34, 2.8) + eye(40.5, 33.5, 2.8) + nose(32, 40.5) +
      smile(32, 43, 4) + `<path d="M29 48.6q3 5 6 0z" fill="#FF7B93"/>` + gloss },
    '🐱': { name: '小貓', draw: id => defs(id, '#FFD08A', '#F2A04E') +
      `<path d="M12 31L14 9L29 19Z" fill="#F2A04E" stroke="${RIM}" stroke-width="1.2" stroke-linejoin="round"/><path d="M52 31L50 9L35 19Z" fill="#F2A04E" stroke="${RIM}" stroke-width="1.2" stroke-linejoin="round"/>` +
      `<path d="M16 26L17 15L24 20Z" fill="#FFB5C0"/><path d="M48 26L47 15L40 20Z" fill="#FFB5C0"/>` + head(id) +
      `<path d="M32 17v6M26.5 18.5l1 5M37.5 18.5l-1 5" ${st('#C9742A', 2)}/>` + ell('x', 32, 44, 7.5, 5.2).replace('url(#x)', '#FFF5E6') + eyes(34, 9, 2.8) +
      `<path d="M29.8 40.2h4.4l-2.2 2.8z" fill="#FF8FA3"/>` + `<path d="M32 43q-2.5 3.6 -5.5 1M32 43q2.5 3.6 5.5 1" ${st(D, 1.5)}/>` +
      `<path d="M6 38h10M7 44l9 -2.4M58 38h-10M57 44l-9 -2.4" ${st('#8a5a2b', 1.2)}/>` + cheeks(41) + gloss },
    '🐰': { name: '小兔', draw: id => defs(id, '#FFFFFF', '#EFE6EA') +
      `<ellipse cx="24" cy="13" rx="5.6" ry="14" transform="rotate(-8 24 13)" fill="#fff" stroke="${RIM}" stroke-width="1.3"/><ellipse cx="24" cy="14" rx="2.7" ry="9" transform="rotate(-8 24 14)" fill="#FFB9CA"/>` +
      `<ellipse cx="40" cy="13" rx="5.6" ry="14" transform="rotate(8 40 13)" fill="#fff" stroke="${RIM}" stroke-width="1.3"/><ellipse cx="40" cy="14" rx="2.7" ry="9" transform="rotate(8 40 14)" fill="#FFB9CA"/>` +
      head(id) + eyes(37, 8.5, 2.8) + `<ellipse cx="32" cy="42.5" rx="2.6" ry="2" fill="${PINK}"/>` + `<path d="M32 44.5v1.8M32 46.3q-3 3 -5.6 .4M32 46.3q3 3 5.6 .4" ${st(D, 1.4)}/>` +
      `<rect x="29.6" y="47.2" width="4.8" height="4.6" rx="1.2" fill="#fff" stroke="#d9cfd3" stroke-width=".8"/>` + cheeks(43) + gloss },
    '🐻': { name: '小熊', draw: id => defs(id, '#D79B64', '#B07440') +
      `<circle cx="16" cy="19" r="7.4" fill="#A56B3A" stroke="${RIM}" stroke-width="1.2"/><circle cx="48" cy="19" r="7.4" fill="#A56B3A" stroke="${RIM}" stroke-width="1.2"/><circle cx="16" cy="19.5" r="3.8" fill="#E5B98E"/><circle cx="48" cy="19.5" r="3.8" fill="#E5B98E"/>` +
      head(id) + ell('x', 32, 44, 9.6, 7.4).replace('url(#x)', '#F3D8B0') + eyes(35, 9, 2.8) + nose(32, 41) + smile(32, 43.4, 4) + cheeks(42) + gloss },
    '🐼': { name: '貓熊', draw: id => defs(id, '#FFFFFF', '#ECECF0') +
      `<circle cx="16" cy="19" r="7.6" fill="#33333c" stroke="${RIM}" stroke-width="1"/><circle cx="48" cy="19" r="7.6" fill="#33333c" stroke="${RIM}" stroke-width="1"/>` + head(id) +
      `<ellipse cx="23.5" cy="35" rx="5.6" ry="7.6" transform="rotate(22 23.5 35)" fill="#33333c"/><ellipse cx="40.5" cy="35" rx="5.6" ry="7.6" transform="rotate(-22 40.5 35)" fill="#33333c"/>` +
      `<circle cx="24" cy="35" r="2.3" fill="#fff"/><circle cx="24.4" cy="35.2" r="1.2" fill="${D}"/><circle cx="40" cy="35" r="2.3" fill="#fff"/><circle cx="39.6" cy="35.2" r="1.2" fill="${D}"/>` +
      nose(32, 43.5, '#33333c') + `<path d="M32 46q-3 3.6 -6 .8M32 46q3 3.6 6 .8" ${st('#33333c', 1.6)}/>` + cheeks(45, '#FFB3C2') + gloss },
    '🦊': { name: '狐狸', draw: id => defs(id, '#FFA86B', '#EE7B30') +
      `<path d="M11 31L14 8L29 21Z" fill="#EE7B30" stroke="${RIM}" stroke-width="1.2" stroke-linejoin="round"/><path d="M53 31L50 8L35 21Z" fill="#EE7B30" stroke="${RIM}" stroke-width="1.2" stroke-linejoin="round"/>` +
      `<path d="M15 26L15.5 13L23 20Z" fill="#3a2a22"/><path d="M49 26L48.5 13L41 20Z" fill="#3a2a22"/>` + head(id) +
      `<path d="M11.5 38Q32 54 52.5 38Q50 56 32 58Q14 56 11.5 38Z" fill="#fff"/>` + eyes(34, 8.5, 2.7) + nose(32, 50.2) + `<path d="M32 52.4q-2 3 -4.4 .8M32 52.4q2 3 4.4 .8" ${st(D, 1.4)}/>` + gloss },
    '🐯': { name: '老虎', draw: id => defs(id, '#FFC873', '#F29A2E') +
      `<circle cx="16" cy="19" r="6.8" fill="#F29A2E" stroke="${RIM}" stroke-width="1.2"/><circle cx="48" cy="19" r="6.8" fill="#F29A2E" stroke="${RIM}" stroke-width="1.2"/><circle cx="16" cy="19.5" r="3.2" fill="#fff"/><circle cx="48" cy="19.5" r="3.2" fill="#fff"/>` + head(id) +
      `<path d="M32 16v8M26.5 17.4v5.6M37.5 17.4v5.6" ${st(D, 2.6)}/><path d="M11.5 34h6M12.6 40h7M52.5 34h-6M51.4 40h-7" ${st(D, 2.8)}/>` + ell('x', 32, 45, 10.4, 7.6).replace('url(#x)', '#FFF6E8') +
      eyes(35, 9, 2.8) + nose(32, 41.6, '#E5646E') + smile(32, 44, 4) + gloss },
    '🦁': { name: '獅子', draw: id => defs(id, '#E69A4A', '#B5651F') +
      Array.from({ length: 14 }, (_, i) => { const a = i / 14 * Math.PI * 2; return `<circle cx="${(32 + Math.cos(a) * 21.5).toFixed(1)}" cy="${(35 + Math.sin(a) * 21.5).toFixed(1)}" r="7.4" fill="url(#${id})" stroke="${RIM}" stroke-width="1"/>`; }).join('') +
      `<circle cx="32" cy="35" r="23" fill="url(#${id})"/>` + `<circle cx="19" cy="17" r="5" fill="#F4C26B" stroke="${RIM}" stroke-width="1"/><circle cx="45" cy="17" r="5" fill="#F4C26B" stroke="${RIM}" stroke-width="1"/>` +
      `<circle cx="32" cy="37" r="16.5" fill="#F8CD7E" stroke="${RIM}" stroke-width="1.2"/>` + ell('x', 32, 44.5, 8.4, 6.2).replace('url(#x)', '#FFF1D2') + eyes(35, 7.5, 2.6) + nose(32, 41, '#8a4a2b') + smile(32, 43.4, 3.6) },
    '🐸': { name: '青蛙', draw: id => defs(id, '#A5E58F', '#62B84F') +
      `<circle cx="20" cy="22" r="8.6" fill="url(#${id})" stroke="${RIM}" stroke-width="1.3"/><circle cx="44" cy="22" r="8.6" fill="url(#${id})" stroke="${RIM}" stroke-width="1.3"/>` + ell(id, 32, 38, 24, 18.5) +
      `<circle cx="20" cy="22" r="5.6" fill="#fff"/><circle cx="44" cy="22" r="5.6" fill="#fff"/><circle cx="20.6" cy="22.8" r="3" fill="${D}"/><circle cx="43.4" cy="22.8" r="3" fill="${D}"/><circle cx="19.6" cy="21.6" r="1" fill="#fff"/><circle cx="42.4" cy="21.6" r="1" fill="#fff"/>` +
      `<path d="M14 43Q32 59 50 43" ${st(D, 2)}/><circle cx="28.5" cy="34" r="1.1" fill="#3f7f33"/><circle cx="35.5" cy="34" r="1.1" fill="#3f7f33"/>` + cheeks(42, '#FF9DB0') },
    '🐵': { name: '猴子', draw: id => defs(id, '#C58A52', '#9A6234') +
      `<circle cx="11" cy="35" r="7.4" fill="#9A6234" stroke="${RIM}" stroke-width="1.2"/><circle cx="53" cy="35" r="7.4" fill="#9A6234" stroke="${RIM}" stroke-width="1.2"/><circle cx="11" cy="35" r="3.8" fill="#F2CBA0"/><circle cx="53" cy="35" r="3.8" fill="#F2CBA0"/>` + head(id, 32, 34, 21) +
      `<path d="M32 29C26 22 14 26 18 39C20 50 27 57 32 57C37 57 44 50 46 39C50 26 38 22 32 29Z" fill="#F7DDB6"/>` + eyes(36.5, 6.6, 2.7) + `<circle cx="30" cy="45" r="1" fill="#8a5a3b"/><circle cx="34" cy="45" r="1" fill="#8a5a3b"/><path d="M26 49q6 5.4 12 0" ${st(D, 1.6)}/>` },
    '🐧': { name: '企鵝', draw: id => defs(id, '#566581', '#2B3850') + head(id, 32, 36, 21) +
      `<path d="M32 30C26 21 13 27 16.5 40C18.5 51 27 57 32 57C37 57 45.5 51 47.5 40C51 27 38 21 32 30Z" fill="#fff"/>` + eyes(38, 6.6, 2.7) +
      `<path d="M27.6 43.6L32 40.4L36.4 43.6L32 48.6Z" fill="#F7A93B" stroke="#d98a1e" stroke-width=".8" stroke-linejoin="round"/>` + `<ellipse cx="21.5" cy="44" rx="3.2" ry="2.2" fill="${PINK}" opacity=".55"/><ellipse cx="42.5" cy="44" rx="3.2" ry="2.2" fill="${PINK}" opacity=".55"/>` + gloss },
    '🐥': { name: '小雞', draw: id => defs(id, '#FFEC8A', '#FFD13F') +
      `<path d="M29.5 16Q27 9 31 8M33 16Q33.6 9 38 10.4" ${st('#FFD13F', 3)}/>` + head(id) + eyes(34, 8.5, 2.8) +
      `<path d="M27.6 40L32 37.6L36.4 40L32 45.6Z" fill="#F89A2E" stroke="#d98a1e" stroke-width=".8" stroke-linejoin="round"/>` + cheeks(41) +
      `<path d="M9 40Q5 47 11 49" ${st('#F2B92A', 2.4)}/><path d="M55 40Q59 47 53 49" ${st('#F2B92A', 2.4)}/>` + gloss },
    '🐷': { name: '小豬', draw: id => defs(id, '#FFD0DA', '#FFA6BA') +
      `<path d="M12 28L10 11L27 18Z" fill="#FF9DB3" stroke="${RIM}" stroke-width="1.2" stroke-linejoin="round"/><path d="M52 28L54 11L37 18Z" fill="#FF9DB3" stroke="${RIM}" stroke-width="1.2" stroke-linejoin="round"/>` + head(id) +
      eyes(33, 9.5, 2.8) + ell('x', 32, 43, 10.6, 7.6).replace('url(#x)', '#FF8FA8') + `<ellipse cx="28.2" cy="43" rx="1.8" ry="2.8" fill="#B8395E"/><ellipse cx="35.8" cy="43" rx="1.8" ry="2.8" fill="#B8395E"/>` + cheeks(38, '#FF7B96') + gloss },
    '🐮': { name: '乳牛', draw: id => defs(id, '#FFFFFF', '#EEEEF2') +
      `<path d="M15 18q-4 -7 1 -9M49 18q4 -7 -1 -9" ${st('#E8D4A6', 3.4)}/><ellipse cx="10.5" cy="27" rx="7.6" ry="4.4" transform="rotate(-24 10.5 27)" fill="#fff" stroke="${RIM}" stroke-width="1.2"/><ellipse cx="53.5" cy="27" rx="7.6" ry="4.4" transform="rotate(24 53.5 27)" fill="#fff" stroke="${RIM}" stroke-width="1.2"/>` +
      head(id) + `<path d="M13 31Q12 20 22 19Q26 24 20 32Q16 35 13 31Z" fill="#3b3b45"/><ellipse cx="44" cy="46.5" rx="5.6" ry="4.4" fill="#3b3b45" opacity=".9"/>` +
      eyes(34, 8.5, 2.8) + ell('x', 32, 46, 11.4, 8.2).replace('url(#x)', '#FFC4CF') + `<ellipse cx="27.6" cy="46" rx="1.9" ry="2.6" fill="#B8395E"/><ellipse cx="36.4" cy="46" rx="1.9" ry="2.6" fill="#B8395E"/>` + gloss },
    '🐑': { name: '綿羊', draw: id => defs(id, '#FFFFFF', '#E9EAF0') +
      Array.from({ length: 9 }, (_, i) => { const a = Math.PI * (1.05 + i * 0.113 * 1.0); const x = 32 + Math.cos(a) * 21, y = 36 + Math.sin(a) * 19; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8" fill="url(#${id})" stroke="${RIM}" stroke-width="1"/>`; }).join('') +
      `<circle cx="32" cy="22" r="10" fill="url(#${id})"/>` + `<ellipse cx="11" cy="35" rx="5.6" ry="3.2" transform="rotate(20 11 35)" fill="#4a4a58"/><ellipse cx="53" cy="35" rx="5.6" ry="3.2" transform="rotate(-20 53 35)" fill="#4a4a58"/>` +
      `<ellipse cx="32" cy="40.5" rx="14" ry="16.5" fill="#4F4F5E" stroke="${RIM}" stroke-width="1.2"/>` + `<circle cx="25.4" cy="37" r="3.1" fill="#fff"/><circle cx="38.6" cy="37" r="3.1" fill="#fff"/><circle cx="25.8" cy="37.4" r="1.7" fill="${D}"/><circle cx="38.2" cy="37.4" r="1.7" fill="${D}"/>` +
      `<ellipse cx="32" cy="46.6" rx="3.2" ry="2.4" fill="#FF9DB0"/><path d="M32 49q-2.4 3 -5 .6M32 49q2.4 3 5 .6" ${st('#fff', 1.4)}/>` },
    '🐨': { name: '無尾熊', draw: id => defs(id, '#CFD5DE', '#A2AAB7') +
      `<circle cx="13" cy="24" r="10" fill="#A2AAB7" stroke="${RIM}" stroke-width="1.2"/><circle cx="51" cy="24" r="10" fill="#A2AAB7" stroke="${RIM}" stroke-width="1.2"/><circle cx="13" cy="24.5" r="5.6" fill="#F5E8EC"/><circle cx="51" cy="24.5" r="5.6" fill="#F5E8EC"/>` +
      head(id) + eyes(33, 10, 2.5) + `<ellipse cx="32" cy="40" rx="5.2" ry="7.2" fill="#3b3b44"/><ellipse cx="30.4" cy="37.4" rx="1.5" ry="1.1" fill="#fff" opacity=".5"/>` + `<path d="M32 47.4q-2.6 3 -5 .6M32 47.4q2.6 3 5 .6" ${st(D, 1.4)}/>` + cheeks(43) + gloss },
    '🦝': { name: '浣熊', draw: id => defs(id, '#C2C8D0', '#939BA7') +
      `<circle cx="17" cy="19" r="7" fill="#939BA7" stroke="${RIM}" stroke-width="1.2"/><circle cx="47" cy="19" r="7" fill="#939BA7" stroke="${RIM}" stroke-width="1.2"/><circle cx="17" cy="19.5" r="3.4" fill="#3b3b45"/><circle cx="47" cy="19.5" r="3.4" fill="#3b3b45"/>` + head(id) +
      `<path d="M11.5 34Q32 24 52.5 34Q51 43 41 42Q32 38 23 42Q13 43 11.5 34Z" fill="#3b3b45"/>` + `<circle cx="24" cy="35" r="3.8" fill="#fff"/><circle cx="40" cy="35" r="3.8" fill="#fff"/><circle cx="24.4" cy="35.4" r="2" fill="${D}"/><circle cx="39.6" cy="35.4" r="2" fill="${D}"/>` +
      ell('x', 32, 47, 9.4, 7).replace('url(#x)', '#fff') + nose(32, 43.4) + smile(32, 45.8, 3.4) },
    '🦉': { name: '貓頭鷹', draw: id => defs(id, '#C99568', '#9B6B43') +
      `<path d="M12 30L11 11L26 20Z" fill="#8A5A36" stroke="${RIM}" stroke-width="1.2" stroke-linejoin="round"/><path d="M52 30L53 11L38 20Z" fill="#8A5A36" stroke="${RIM}" stroke-width="1.2" stroke-linejoin="round"/>` + head(id) +
      `<circle cx="23" cy="34" r="9.4" fill="#F6E3C4" stroke="#C99568" stroke-width="2"/><circle cx="41" cy="34" r="9.4" fill="#F6E3C4" stroke="#C99568" stroke-width="2"/><circle cx="23" cy="34.4" r="4.6" fill="${D}"/><circle cx="41" cy="34.4" r="4.6" fill="${D}"/><circle cx="21.4" cy="32.6" r="1.7" fill="#fff"/><circle cx="39.4" cy="32.6" r="1.7" fill="#fff"/>` +
      `<path d="M28.6 41L35.4 41L32 48.4Z" fill="#F7A93B" stroke="#d98a1e" stroke-width=".8" stroke-linejoin="round"/>` + `<path d="M20 19q4 -3 8 -.5M36 18.5q4 -2.5 8 .5" ${st('#6f4528', 2)}/>` },
    '🦆': { name: '小鴨', draw: id => defs(id, '#FFF08C', '#FFD43E') +
      `<path d="M29.5 15.5Q28 9.6 32 9M33.4 15.4Q35 10.4 39 11.6" ${st('#FFD43E', 3)}/>` + head(id) + eyes(32, 9, 2.8) +
      `<ellipse cx="32" cy="44.4" rx="12.4" ry="6.4" fill="#FAA033" stroke="#d98a1e" stroke-width="1"/><path d="M22 44.4h20" stroke="#d98a1e" stroke-width="1.2"/><circle cx="29" cy="42.4" r=".9" fill="#a8610f"/><circle cx="35" cy="42.4" r=".9" fill="#a8610f"/>` + cheeks(38) + gloss },
    '🦛': { name: '河馬', draw: id => defs(id, '#C7C1E2', '#9A93C2') +
      `<circle cx="14" cy="21" r="5.6" fill="#9A93C2" stroke="${RIM}" stroke-width="1.2"/><circle cx="50" cy="21" r="5.6" fill="#9A93C2" stroke="${RIM}" stroke-width="1.2"/>` + ell(id, 32, 36, 22, 19) +
      `<circle cx="23" cy="25" r="5" fill="#B5AED5" stroke="${RIM}" stroke-width="1"/><circle cx="41" cy="25" r="5" fill="#B5AED5" stroke="${RIM}" stroke-width="1"/>` + eye(23, 25, 2.5) + eye(41, 25, 2.5) +
      ell('x', 32, 47, 17, 10.6).replace('url(#x)', '#D9D4EE') + `<ellipse cx="25" cy="44" rx="2" ry="2.8" fill="#6b6498"/><ellipse cx="39" cy="44" rx="2" ry="2.8" fill="#6b6498"/>` + `<path d="M26 51q6 4.4 12 0" ${st('#6b6498', 1.6)}/>` + cheeks(40, '#FF9DB0') },
    '🐘': { name: '大象', draw: id => defs(id, '#D5DBE4', '#A8B1BF') +
      `<circle cx="11" cy="31" r="12.5" fill="#A8B1BF" stroke="${RIM}" stroke-width="1.2"/><circle cx="53" cy="31" r="12.5" fill="#A8B1BF" stroke="${RIM}" stroke-width="1.2"/><circle cx="11.5" cy="31.5" r="7.6" fill="#EBC8D2"/><circle cx="52.5" cy="31.5" r="7.6" fill="#EBC8D2"/>` +
      head(id, 32, 33, 18.5) + eyes(31, 8, 2.7) + `<path d="M26.2 38Q25 55 32.6 58Q37 59 37 55.4Q32.4 55 33.6 38Z" fill="url(#${id})" stroke="${RIM}" stroke-width="1.2" stroke-linejoin="round"/><path d="M27.4 45.5h5.6M27.4 49.5h5.4" stroke="#8d97a6" stroke-width="1" stroke-linecap="round"/>` + cheeks(38) + gloss },
    '🦒': { name: '長頸鹿', draw: id => defs(id, '#FFE08A', '#F1B84A') +
      `<path d="M24 17L22 7M40 17L42 7" ${st('#B07440', 2.4)}/><circle cx="22" cy="6.4" r="2.6" fill="#8a5a36"/><circle cx="42" cy="6.4" r="2.6" fill="#8a5a36"/>` +
      `<ellipse cx="11" cy="26" rx="6.6" ry="3.6" transform="rotate(-22 11 26)" fill="#F1B84A" stroke="${RIM}" stroke-width="1.2"/><ellipse cx="53" cy="26" rx="6.6" ry="3.6" transform="rotate(22 53 26)" fill="#F1B84A" stroke="${RIM}" stroke-width="1.2"/>` +
      ell(id, 32, 36, 17.5, 19.5) + `<path d="M22 24q3 -3 6 0q-1 4 -5 3.6zM38 21q3.4 -1 5 2q-2 3.8 -5.4 1.4zM33 29q2.4 -1.6 4 .6q-1.2 2.6 -3.6 1.6z" fill="#B97A3E" opacity=".85"/>` +
      eyes(33, 8, 2.6) + ell('x', 32, 47, 11.4, 8.4).replace('url(#x)', '#FFF0C9') + `<ellipse cx="28" cy="47" rx="1.5" ry="2.2" fill="#8a5a36"/><ellipse cx="36" cy="47" rx="1.5" ry="2.2" fill="#8a5a36"/>` + `<path d="M28.4 52q3.6 2.6 7.2 0" ${st(D, 1.4)}/>` },
    '🦓': { name: '斑馬', draw: id => defs(id, '#FFFFFF', '#E9E9EE') +
      `<path d="M19 17L21 6L26 14M45 17L43 6L38 14" fill="#fff" stroke="${RIM}" stroke-width="1.2" stroke-linejoin="round"/><path d="M29 12q-1 -4 0 -7M35 12q1 -4 0 -7" ${st(D, 2.6)}/>` +
      ell(id, 32, 37, 17.5, 20.5) + `<path d="M18 28q5 -3 7 2M46 28q-5 -3 -7 2M17 36q5 -2 8 3M47 36q-5 -2 -8 3M28 16q1 6 0 9M36 16q-1 6 0 9" ${st(D, 2.6)}/>` + eyes(34, 8.4, 2.6) +
      ell('x', 32, 48, 12, 8.6).replace('url(#x)', '#4A4A54') + `<ellipse cx="28" cy="47" rx="1.4" ry="2.2" fill="#ECECF2"/><ellipse cx="36" cy="47" rx="1.4" ry="2.2" fill="#ECECF2"/>` + `<path d="M28.6 52q3.4 2.2 6.8 0" ${st('#ECECF2', 1.4)}/>` },
    '🦌': { name: '小鹿', draw: id => defs(id, '#E7B684', '#CC8F55') +
      `<path d="M22 19L17 6M19.4 12.6L13 10.4M20.6 15L25 8M42 19L47 6M44.6 12.6L51 10.4M43.4 15L39 8" ${st('#8a5a36', 2.6)}/>` +
      `<ellipse cx="12" cy="27" rx="7" ry="4" transform="rotate(-28 12 27)" fill="#CC8F55" stroke="${RIM}" stroke-width="1.2"/><ellipse cx="52" cy="27" rx="7" ry="4" transform="rotate(28 52 27)" fill="#CC8F55" stroke="${RIM}" stroke-width="1.2"/>` +
      ell(id, 32, 37, 18, 19.5) + `<circle cx="27" cy="24" r="1.5" fill="#fff" opacity=".9"/><circle cx="37" cy="24" r="1.5" fill="#fff" opacity=".9"/><circle cx="32" cy="21" r="1.5" fill="#fff" opacity=".9"/>` + eyes(33.5, 8.4, 2.7) +
      ell('x', 32, 47, 9.4, 7.2).replace('url(#x)', '#F6DDBA') + nose(32, 44.2) + `<path d="M32 46.6q-2.4 3 -5 .6M32 46.6q2.4 3 5 .6" ${st(D, 1.4)}/>` + cheeks(41) + gloss },
    '🦔': { name: '刺蝟', draw: id => defs(id, '#FBE5C5', '#E9C494') +
      `<path d="M9 40L8 26L15 29L15 15L22 21L26 10L31 18L36 9L40 18L46 11L48 21L55 17L52 30L58 30L55 41Z" fill="#6E4C3C" stroke="${RIM}" stroke-width="1.2" stroke-linejoin="round"/>` +
      `<path d="M16 26L19 20M26 20L28 14M36 19L38 13M46 22L48 17" ${st('#8a6552', 1.4)}/>` +
      ell(id, 32, 42, 17.5, 15.5) + `<circle cx="14.5" cy="33" r="4.4" fill="#E9C494" stroke="${RIM}" stroke-width="1"/><circle cx="49.5" cy="33" r="4.4" fill="#E9C494" stroke="${RIM}" stroke-width="1"/>` + eyes(38, 8.2, 2.7) + `<circle cx="32" cy="45.6" r="3" fill="${D}"/><circle cx="31" cy="44.6" r=".9" fill="#fff" opacity=".6"/>` + `<path d="M32 48.6q-2.6 3 -5 .6M32 48.6q2.6 3 5 .6" ${st(D, 1.4)}/>` + cheeks(44) },
    '🐭': { name: '老鼠', draw: id => defs(id, '#E4E4EC', '#BDBDCB') +
      `<circle cx="14" cy="22" r="10.6" fill="#BDBDCB" stroke="${RIM}" stroke-width="1.2"/><circle cx="50" cy="22" r="10.6" fill="#BDBDCB" stroke="${RIM}" stroke-width="1.2"/><circle cx="14" cy="22.5" r="6.4" fill="#FFC3D0"/><circle cx="50" cy="22.5" r="6.4" fill="#FFC3D0"/>` + head(id, 32, 37, 20) +
      eyes(35, 8.6, 2.8) + `<ellipse cx="32" cy="43.6" rx="2.8" ry="2.2" fill="${PINK}"/>` + `<path d="M32 45.8v1.6M32 47.4q-3 2.8 -5.4 .4M32 47.4q3 2.8 5.4 .4" ${st(D, 1.4)}/><rect x="30" y="48" width="4" height="3.6" rx="1" fill="#fff" stroke="#d6d6de" stroke-width=".7"/>` +
      `<path d="M8 41h9M9 46l8 -2M56 41h-9M55 46l-8 -2" ${st('#8a8a9a', 1.1)}/>` + cheeks(42) + gloss },
    '🐹': { name: '倉鼠', draw: id => defs(id, '#FFDDAE', '#F2B879') +
      `<circle cx="18" cy="18" r="6" fill="#F2B879" stroke="${RIM}" stroke-width="1.2"/><circle cx="46" cy="18" r="6" fill="#F2B879" stroke="${RIM}" stroke-width="1.2"/><circle cx="18" cy="18.5" r="3" fill="#FFC9C9"/><circle cx="46" cy="18.5" r="3" fill="#FFC9C9"/>` + ell(id, 32, 37, 22, 19.5) +
      `<path d="M32 17q-5 6 0 11q5 -5 0 -11z" fill="#fff" opacity=".85"/>` + `<ellipse cx="18.5" cy="43" rx="8.6" ry="7" fill="#FFF3DE"/><ellipse cx="45.5" cy="43" rx="8.6" ry="7" fill="#FFF3DE"/>` + eyes(35, 9.4, 2.8) + `<ellipse cx="32" cy="41.6" rx="2.4" ry="1.9" fill="${PINK}"/>` +
      `<path d="M32 43.6v1.6M32 45.2q-2.6 2.6 -5 .4M32 45.2q2.6 2.6 5 .4" ${st(D, 1.4)}/><rect x="30" y="46" width="4" height="3.8" rx="1" fill="#fff" stroke="#e5d7bd" stroke-width=".7"/>` + cheeks(43) },
    '🐺': { name: '野狼', draw: id => defs(id, '#B7C0CC', '#808B9A') +
      `<path d="M10 33L12 7L28 20Z" fill="#808B9A" stroke="${RIM}" stroke-width="1.2" stroke-linejoin="round"/><path d="M54 33L52 7L36 20Z" fill="#808B9A" stroke="${RIM}" stroke-width="1.2" stroke-linejoin="round"/><path d="M15 26L15 14L22 20Z" fill="#3a3f4a"/><path d="M49 26L49 14L42 20Z" fill="#3a3f4a"/>` + head(id) +
      `<path d="M23 38Q32 31 41 38L39 52Q32 59 25 52Z" fill="#EEF1F6"/><path d="M11 40l5 -2l-1 5l5 -1M53 40l-5 -2l1 5l-5 -1" fill="#B7C0CC"/>` + `<path d="M22 31l6 2M42 31l-6 2" ${st(D, 2.2)}/>` + eye(25, 34, 2.4) + eye(39, 34, 2.4) + nose(32, 47.4) + `<path d="M32 49.6q-2.4 3 -5 .6M32 49.6q2.4 3 5 .6" ${st(D, 1.4)}/>` },
    '🐙': { name: '章魚', draw: id => defs(id, '#FF9DB7', '#EE6C8F') +
      `<path d="M12 38Q6 54 14 58Q19 59 18.5 52Q21 59 26 58Q30 57 29 51Q32.6 58 37 57Q42 57 39.6 50.4Q44 58 50 57Q58 54 52 38Z" fill="url(#${id})" stroke="${RIM}" stroke-width="1.3" stroke-linejoin="round"/>` +
      `<circle cx="32" cy="28" r="20" fill="url(#${id})" stroke="${RIM}" stroke-width="1.3"/>` + `<circle cx="14" cy="48" r="1.4" fill="#fff" opacity=".7"/><circle cx="25.5" cy="52" r="1.4" fill="#fff" opacity=".7"/><circle cx="38.5" cy="51" r="1.4" fill="#fff" opacity=".7"/><circle cx="50" cy="48" r="1.4" fill="#fff" opacity=".7"/>` +
      `<circle cx="24" cy="29" r="5.4" fill="#fff"/><circle cx="40" cy="29" r="5.4" fill="#fff"/><circle cx="24.6" cy="30" r="3" fill="${D}"/><circle cx="39.4" cy="30" r="3" fill="${D}"/><circle cx="23.4" cy="28.8" r="1" fill="#fff"/><circle cx="38.4" cy="28.8" r="1" fill="#fff"/>` +
      `<path d="M27 40q5 4.4 10 0" ${st(D, 1.8)}/>` + cheeks(37, '#FF6F91') + gloss },
    '🐢': { name: '烏龜', draw: id => defs(id, '#8ED48A', '#4E9E56') +
      `<ellipse cx="32" cy="28" rx="23" ry="17" fill="url(#${id})" stroke="${RIM}" stroke-width="1.3"/>` + `<path d="M32 13.4L41 19L38 29L26 29L23 19Z M32 13.4V11M41 19L48 16M38 29L45 34M26 29L19 34M23 19L16 16" stroke="#357a3f" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="rgba(255,255,255,.12)"/>` +
      `<circle cx="32" cy="46" r="12.4" fill="#BFE5A4" stroke="${RIM}" stroke-width="1.3"/>` + eyes(44.6, 5.4, 2.5) + `<path d="M27.4 50.4q4.6 4 9.2 0" ${st(D, 1.6)}/>` + `<ellipse cx="22" cy="48.6" rx="3" ry="2" fill="${PINK}" opacity=".55"/><ellipse cx="42" cy="48.6" rx="3" ry="2" fill="${PINK}" opacity=".55"/>` }
  };

  const LIST = Object.keys(A);
  function svg(em, size) {
    const a = A[em]; if (!a) return '';
    const id = 'sa' + (++uid), s = size || 48;
    return `<svg class="animal" width="${s}" height="${s}" viewBox="0 0 64 64" role="img" aria-label="${esc(a.name)}" style="flex:none;overflow:visible">${a.draw(id)}</svg>`;
  }
  // 有插圖就用插圖，沒有（舊資料的其他 emoji）就顯示原本的 emoji
  const html = (em, size) => svg(em, size) || esc(em || '');
  window.SELAnimals = { LIST, NAME: Object.fromEntries(LIST.map(k => [k, A[k].name])), svg, html };
})();
