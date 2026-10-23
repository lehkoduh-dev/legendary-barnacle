/* Seasonal Halloween decorations on the home hero. Switches itself off after 2 Nov 2026. */
(function () {
  'use strict';
  var now = new Date();
  if (now > new Date(2026, 10, 2, 23, 59)) return;
  var hero = document.querySelector('.hero');
  if (!hero) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var css = '.hw{position:absolute;pointer-events:none;z-index:6}' +
    '.hw-web{top:0;width:min(240px,26vw);opacity:.75}.hw-web.l{left:0}.hw-web.r{right:0;transform:scaleX(-1)}' +
    '.hw-pump{bottom:-10px;z-index:3}.hw-pump.a{left:-6%;width:clamp(56px,7vw,104px)}.hw-pump.b{right:-4%;width:clamp(44px,5.5vw,80px);transform:scaleX(-1)}' +
    '.hw-pump .glow{animation:hwflick 2.6s ease-in-out infinite}.hw-pump.b .glow{animation-delay:-1.1s}' +
    '@keyframes hwflick{0%,100%{opacity:1}45%{opacity:.78}55%{opacity:.95}70%{opacity:.7}}' +
    '.hw-bat{top:0;left:0;width:44px;opacity:0;will-change:transform}' +
    '.hw-bat .wing{transform-origin:50% 55%;animation:hwflap .28s ease-in-out infinite alternate}' +
    '@keyframes hwflap{from{transform:scaleY(1)}to{transform:scaleY(.45)}}' +
    '@keyframes hwfly{0%{transform:translate(-80px,var(--y0)) rotate(-6deg);opacity:0}8%{opacity:.95}50%{transform:translate(50vw,calc(var(--y0) - 40px)) rotate(4deg)}92%{opacity:.95}100%{transform:translate(calc(100vw + 80px),calc(var(--y0) + 20px)) rotate(-4deg);opacity:0}}' +
    '.hw-bat.go{animation:hwfly var(--d) linear var(--delay) infinite}' +
    '@media(max-width:700px){.hw-bat{width:30px}.hw-web{width:34vw}}' +
    '@media(prefers-reduced-motion:reduce){.hw-bat{display:none}.hw-pump .glow{animation:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var web = '<svg viewBox="0 0 200 200" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round">' +
    '<path d="M0 0 L200 0 M0 0 L0 200 M0 0 L170 110 M0 0 L110 170 M0 0 L150 60 M0 0 L60 150"/>' +
    '<path d="M40 0 Q34 34 0 40 M80 0 Q66 66 0 80 M120 0 Q98 98 0 120 M160 0 Q130 130 0 160"/>' +
    '<path d="M0 0 Q38 22 60 0 M0 0 Q22 38 0 60" opacity=".0"/></svg>';
  var pid = 0;
  function pumpkin(carved) {
    var u = 'pk' + (++pid);
    var lobes = [[28, 70, 30, 48], [92, 70, 30, 48], [44, 68, 32, 52], [76, 68, 32, 52], [60, 68, 30, 54]];
    var body = '';
    lobes.forEach(function (l, i) {
      body += '<ellipse cx="' + l[0] + '" cy="' + l[1] + '" rx="' + l[2] + '" ry="' + l[3] + '" fill="url(#' + u + 'g' + (i < 2 ? 'e' : 'm') + ')"/>';
    });
    var ribs = '<g fill="none" stroke="#7a2e00" stroke-opacity=".38" stroke-width="2" stroke-linecap="round">' +
      '<path d="M32 28 Q16 70 34 112"/><path d="M46 22 Q36 70 46 116"/><path d="M60 20 Q56 70 60 118"/>' +
      '<path d="M74 22 Q84 70 74 116"/><path d="M88 28 Q104 70 86 112"/></g>';
    var face = '';
    if (carved) {
      var f = 'M38 62 L54 62 L46 46Z M66 62 L82 62 L74 46Z M36 80 Q44 98 54 92 L60 100 L66 92 Q76 98 84 80 Q74 86 68 82 L60 88 L52 82 Q46 86 36 80Z';
      face = '<g class="glow"><path d="' + f + '" fill="#FFB52E" filter="url(#' + u + 'b)"/><path d="' + f + '" fill="url(#' + u + 'f)"/></g>' +
        '<path d="' + f + '" fill="none" stroke="#5a2000" stroke-opacity=".55" stroke-width="1.6"/>';
    }
    return '<svg viewBox="0 0 120 130" overflow="visible"><defs>' +
      '<radialGradient id="' + u + 'gm" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#FFA13A"/><stop offset=".45" stop-color="#EE6F10"/><stop offset="1" stop-color="#9C3A04"/></radialGradient>' +
      '<radialGradient id="' + u + 'ge" cx=".5" cy=".35" r=".9"><stop offset="0" stop-color="#F58A22"/><stop offset=".6" stop-color="#D45A0A"/><stop offset="1" stop-color="#7C2C02"/></radialGradient>' +
      '<radialGradient id="' + u + 'f" cx=".5" cy=".6" r=".7"><stop offset="0" stop-color="#FFF3B0"/><stop offset=".6" stop-color="#FFC83A"/><stop offset="1" stop-color="#FF9A1A"/></radialGradient>' +
      '<linearGradient id="' + u + 's" x1="0" x2="1"><stop offset="0" stop-color="#4b3a1a"/><stop offset=".5" stop-color="#8a7a3a"/><stop offset="1" stop-color="#3f3216"/></linearGradient>' +
      '<filter id="' + u + 'b" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="5"/></filter>' +
      '<filter id="' + u + 't" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9 .12" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .12  0 0 0 0 0  0 0 0 .22 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>' +
      '</defs>' +
      '<ellipse cx="62" cy="122" rx="52" ry="8" fill="#3a1800" opacity=".38"/>' +
      '<g>' + body + '</g><g filter="url(#' + u + 't)">' + body + '</g>' + ribs +
      '<ellipse cx="42" cy="44" rx="16" ry="9" fill="#fff" opacity=".22" transform="rotate(-24 42 44)"/>' +
      '<path d="M56 24 C54 12 60 4 70 0 C72 6 70 10 68 16 C66 20 66 24 66 26 Z" fill="url(#' + u + 's)"/>' +
      '<path d="M56 24 C62 28 68 28 72 24" stroke="#2e2410" stroke-width="2" fill="none" opacity=".7"/>' +
      '<path d="M66 8 C78 8 88 14 90 24" stroke="#5f7a2e" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
      face + '</svg>';
  }
  var pump = pumpkin(true), pumpPlain = pumpkin(false);
  var bat = '<svg viewBox="0 0 60 36"><g fill="#1d1423"><g class="wing"><path d="M30 18 C24 6 12 4 2 10 C8 12 10 16 10 22 C14 18 18 20 20 26 C23 22 27 22 30 26Z"/>' +
    '<path d="M30 18 C36 6 48 4 58 10 C52 12 50 16 50 22 C46 18 42 20 40 26 C37 22 33 22 30 26Z"/></g>' +
    '<ellipse cx="30" cy="20" rx="5" ry="8"/><path d="M26 13 L25 6 L29 11Z M34 13 L35 6 L31 11Z"/></g></svg>';

  function add(cls, html) { var d = document.createElement('div'); d.className = 'hw ' + cls; d.innerHTML = html; d.setAttribute('aria-hidden', 'true'); hero.appendChild(d); return d; }
  add('hw-web l', web); add('hw-web r', web);
  var trio = hero.querySelector('.trio');
  if (trio) {
    if (getComputedStyle(trio).position === 'static') trio.style.position = 'relative';
    [['a', pump], ['b', pumpPlain]].forEach(function (x) { var d = document.createElement('div'); d.className = 'hw hw-pump ' + x[0]; d.innerHTML = x[1]; d.setAttribute('aria-hidden', 'true'); trio.appendChild(d); });
  }
  if (!reduce) {
    [[0, 12, 11], [4.5, 20, 14], [8, 8, 12], [13, 26, 16]].forEach(function (b, i) {
      var d = add('hw-bat', bat);
      d.style.setProperty('--y0', (b[1] * 6 + 40) + 'px');
      d.style.setProperty('--delay', (-b[0]) + 's'); d.style.setProperty('--d', b[2] + 's');
      d.classList.add('go');
    });
  }
})();
