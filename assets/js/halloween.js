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
    '.hw-pump{bottom:-10px;z-index:3;filter:drop-shadow(0 8px 8px rgba(30,10,0,.35))}.hw-pump.a{left:-6%;width:clamp(56px,7vw,104px)}.hw-pump.b{right:-4%;width:clamp(44px,5.5vw,80px);transform:scaleX(-1)}' +
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
  var pump = '<svg viewBox="0 0 120 110"><path d="M58 22 C58 12 64 6 72 4" stroke="#4d6b2a" stroke-width="7" stroke-linecap="round" fill="none"/>' +
    '<ellipse cx="60" cy="66" rx="52" ry="42" fill="#F07A12"/><ellipse cx="38" cy="66" rx="22" ry="42" fill="#F58F2B" opacity=".7"/>' +
    '<ellipse cx="82" cy="66" rx="22" ry="42" fill="#D9640A" opacity=".55"/><ellipse cx="60" cy="66" rx="12" ry="42" fill="#F58F2B" opacity=".5"/>' +
    '<g class="glow" fill="#FFD84A"><path d="M30 56 L48 56 L39 44Z"/><path d="M72 56 L90 56 L81 44Z"/>' +
    '<path d="M32 78 Q46 96 60 86 Q74 96 88 78 Q76 84 70 80 L60 86 L50 80 Q44 84 32 78Z"/></g></svg>';
  var bat = '<svg viewBox="0 0 60 36"><g fill="#1d1423"><g class="wing"><path d="M30 18 C24 6 12 4 2 10 C8 12 10 16 10 22 C14 18 18 20 20 26 C23 22 27 22 30 26Z"/>' +
    '<path d="M30 18 C36 6 48 4 58 10 C52 12 50 16 50 22 C46 18 42 20 40 26 C37 22 33 22 30 26Z"/></g>' +
    '<ellipse cx="30" cy="20" rx="5" ry="8"/><path d="M26 13 L25 6 L29 11Z M34 13 L35 6 L31 11Z"/></g></svg>';

  function add(cls, html) { var d = document.createElement('div'); d.className = 'hw ' + cls; d.innerHTML = html; d.setAttribute('aria-hidden', 'true'); hero.appendChild(d); return d; }
  add('hw-web l', web); add('hw-web r', web);
  var trio = hero.querySelector('.trio');
  if (trio) {
    if (getComputedStyle(trio).position === 'static') trio.style.position = 'relative';
    [['a', pump], ['b', pump]].forEach(function (x) { var d = document.createElement('div'); d.className = 'hw hw-pump ' + x[0]; d.innerHTML = x[1]; d.setAttribute('aria-hidden', 'true'); trio.appendChild(d); });
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
