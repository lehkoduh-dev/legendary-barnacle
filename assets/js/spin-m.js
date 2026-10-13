/* TEST: phone version of the scroll-driven rotating bottle (pre-rendered frames, smoothed, document-anchored) */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || window.innerWidth >= 1000) return;
  var hero = document.querySelector('.hero');
  var b2 = document.querySelector('.hero .trio .b2 img');
  var b1 = document.querySelector('.hero .trio .b1 img');
  var target = document.querySelector('#blends .card.pink img.bimg');
  if (!hero || !b2 || !target) return;
  // bring the pink bottle (first card) to the foreground
  if (b1 && /bottle-spiced/.test(b2.getAttribute('src'))) {
    var u2 = b2.getAttribute('src'), a2 = b2.alt, a1 = b1.alt;
    b2.setAttribute('src', u2.replace('bottle-spiced', 'bottle-pink')); b2.alt = a1;
    b1.setAttribute('src', u2); b1.alt = a2;
  }
  var V = (document.currentScript && document.currentScript.src.split('?v=')[1]) || '1';
  var N = 60, COLS = 10, FW = 220, FH = 434, TURNS = 2;
  var sheet = new Image();
  sheet.onload = start;
  sheet.src = '/assets/img/spin/pink-frames.webp?v=' + V;

  var cv, ctx, vh = 0, vw = 0;
  var nat, tgt, sEnd = 1, cur = 0, goal = 0, lastIdx = -1, raf = 0;
  var holdFirst = true;

  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function clamp01(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }

  function rectDoc(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + window.pageXOffset, y: r.top + window.pageYOffset, w: r.width, h: r.height };
  }
  function measure() {
    // heights are taken once per width: the collapsing address bar never changes them
    vw = window.innerWidth; vh = Math.max(window.innerHeight, document.documentElement.clientHeight);
    cv.style.transform = 'none';
    hero.classList.remove('spin-m-lock');
    var save = target.style.visibility;
    nat = rectDoc(b2); tgt = rectDoc(target);
    sEnd = Math.max(300, tgt.y - vh * 0.30);
    target.style.visibility = save;
  }

  function place(y) {
    var t = clamp01(y / sEnd), s = smooth(t);
    var x = lerp(nat.x, tgt.x, s), py = lerp(nat.y, tgt.y, s);
    var w = lerp(nat.w, tgt.w, s), h = lerp(nat.h, tgt.h, s);
    cv.style.width = w + 'px'; cv.style.height = h + 'px';
    cv.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + py.toFixed(1) + 'px,0)';
    var idx = Math.round(t * TURNS * N) % N;
    if (idx !== lastIdx) {
      ctx.clearRect(0, 0, FW, FH);
      ctx.drawImage(sheet, (idx % COLS) * FW, Math.floor(idx / COLS) * FH, FW, FH, 0, 0, FW, FH);
      lastIdx = idx;
    }
    var p = clamp01(y / (hero.offsetHeight * 0.7));
    hero.style.setProperty('--p', smooth(p).toFixed(3));
  }

  function loop() {
    raf = 0;
    var d = goal - cur;
    if (Math.abs(d) < 0.3) cur = goal; else cur += d * 0.2;   // exponential smoothing of inertial scroll
    place(cur);
    if (cur !== goal) raf = requestAnimationFrame(loop);
  }
  function onScroll() { goal = Math.max(0, window.pageYOffset); if (!raf) raf = requestAnimationFrame(loop); }

  function start() {
    cv = document.createElement('canvas');
    cv.width = FW; cv.height = FH; cv.className = 'spin-m'; cv.setAttribute('aria-hidden', 'true');
    ctx = cv.getContext('2d');
    document.body.appendChild(cv);
    measure();
    goal = cur = Math.max(0, window.pageYOffset);
    place(cur);
    document.documentElement.setAttribute('data-spin', 'pink');
    document.documentElement.classList.add('spin-on', 'spin-m-on');
    requestAnimationFrame(function () { cv.classList.add('ready'); });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('load', function () { measure(); onScroll(); place(cur); });
    var lastW = window.innerWidth;
    window.addEventListener('resize', function () {
      if (window.innerWidth === lastW) return;       // ignore height-only resizes (address bar)
      lastW = window.innerWidth; measure(); place(cur);
    }, { passive: true });
  }
})();
