/* TEST: scroll-driven pour scene (desktop). Bottle descends, uncorks, tilts, pours into a glass with ice, orange garnish drops in. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || window.innerWidth < 1000) return;
  var hero = document.querySelector('.hero');
  var b2 = document.querySelector('.hero .trio .b2 img');
  var b1 = document.querySelector('.hero .trio .b1 img');
  var sec = document.getElementById('blends');
  var art = document.querySelector('#blends .card.pink .art');
  if (!hero || !b2 || !sec || !art) return;
  if (b1 && /bottle-spiced/.test(b2.getAttribute('src'))) {      // pink bottle in the foreground
    var u2 = b2.getAttribute('src'), a2 = b2.alt, a1 = b1.alt;
    b2.setAttribute('src', u2.replace('bottle-spiced', 'bottle-pink')); b2.alt = a1;
    b1.setAttribute('src', u2); b1.alt = a2;
  }
  var V = (document.currentScript && document.currentScript.src.split('?v=')[1]) || '1';
  var N = 36, COLS = 6, FW = 300, FH = 592, TURNS = 2, BW = 542, BH = 1068, RUN = 1700, PINTOP = 80;
  var LIQ = '#EE7FAA';
  var sheet, cork, left = 2;
  [['pink-pour', function (i) { sheet = i; }], ['cork', function (i) { cork = i; }]].forEach(function (p) {
    var im = new Image(); im.onload = function () { p[1](im); if (--left === 0) start(); };
    im.src = '/assets/img/spin/' + p[0] + '.webp?v=' + V;
  });

  var wrap, cv, ctx, ck, stream, spath, glass, liquidG, surf, iceG, orange, svgNS = 'http://www.w3.org/2000/svg';
  var nat, secTop, secH, artRel, yP0, raf = 0, lastIdx = -1, cur = 0, goal = 0;

  function lerp(a, b, t) { return a + (b - a) * t; }
  function cl(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }
  function sm(t) { t = cl(t); return t * t * (3 - 2 * t); }
  function seg(u, a, b) { return sm((u - a) / (b - a)); }
  function el(n, a, p) { var e = document.createElementNS(svgNS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }

  function buildGlass() {
    art.style.position = 'relative';
    glass = el('svg', { viewBox: '0 0 160 250', class: 'pour-glass' });
    glass.style.cssText = 'position:absolute;overflow:visible;pointer-events:none;opacity:0';
    var d = el('defs', {}, glass);
    var cp = el('clipPath', { id: 'pgclip' }, d);
    el('path', { d: 'M14 14 L146 14 L132 214 Q131 222 123 222 L37 222 Q29 222 28 214 Z' }, cp);
    el('ellipse', { cx: 80, cy: 244, rx: 64, ry: 6, fill: 'rgba(60,30,10,.22)' }, glass);
    var body = el('path', { d: 'M8 10 L152 10 L136 226 Q135 236 125 236 L35 236 Q25 236 24 226 Z', fill: 'rgba(255,255,255,.34)', stroke: 'rgba(255,255,255,.95)', 'stroke-width': 2.2 }, glass);
    liquidG = el('g', { 'clip-path': 'url(#pgclip)' }, glass);
    liquidG.liq = el('rect', { x: 0, y: 222, width: 160, height: 220, fill: LIQ, 'fill-opacity': .9 }, liquidG);
    surf = el('ellipse', { cx: 80, cy: 222, rx: 66, ry: 4.5, fill: '#F7B5CF', 'fill-opacity': .95 }, liquidG);
    iceG = el('g', { 'clip-path': 'url(#pgclip)' }, glass);
    [[44, 178, 12], [84, 160, 26], [62, 120, 38], [100, 190, -8]].forEach(function (c) {
      var g = el('g', { transform: 'translate(' + c[0] + ' ' + c[1] + ') rotate(' + c[2] + ')' }, iceG);
      g.base = c;
      el('rect', { x: -19, y: -19, width: 38, height: 38, rx: 7, fill: 'rgba(235,248,255,.42)', stroke: 'rgba(255,255,255,.9)', 'stroke-width': 1.6 }, g);
      el('path', { d: 'M-12 -10 L-3 -13', stroke: 'rgba(255,255,255,.95)', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, g);
    });
    iceG.cubes = iceG.querySelectorAll('g');
    el('path', { d: 'M18 20 L26 214', stroke: 'rgba(255,255,255,.7)', 'stroke-width': 4, 'stroke-linecap': 'round', fill: 'none' }, glass);
    el('path', { d: 'M8 10 L152 10', stroke: 'rgba(255,255,255,.95)', 'stroke-width': 3, fill: 'none' }, glass);
    orange = el('g', {}, glass);
    el('circle', { r: 27, fill: '#F6A21E' }, orange);
    el('circle', { r: 23, fill: '#FFD27A' }, orange);
    for (var i = 0; i < 8; i++) {
      var a = i * Math.PI / 4;
      el('path', { d: 'M0 0 L' + (21 * Math.cos(a)).toFixed(1) + ' ' + (21 * Math.sin(a)).toFixed(1), stroke: '#F6A21E', 'stroke-width': 1.6 }, orange);
    }
    el('circle', { r: 3, fill: '#FFE9B8' }, orange);
    orange.style.opacity = 0;
    art.appendChild(glass);
  }

  function measure() {
    var wr = wrap.getBoundingClientRect(), y = window.pageYOffset;
    secTop = wr.top + y;
    var sr = sec.getBoundingClientRect(), ar = art.getBoundingClientRect();
    secH = sr.height; artRel = { l: ar.left - sr.left, t: ar.top - sr.top, w: ar.width, h: ar.height, x: ar.left };
    var r = b2.getBoundingClientRect();
    nat = { x: r.left, y: r.top + y - (hero.getBoundingClientRect().top + y - hero.offsetTop) * 0, w: r.width, h: r.height };
    nat.y = r.top + y;
    yP0 = Math.max(300, secTop - PINTOP);
  }
  function wrapInit() {
    wrap = document.createElement('div'); wrap.className = 'pour-wrap';
    sec.parentNode.insertBefore(wrap, sec); wrap.appendChild(sec);
    wrap.style.height = (sec.offsetHeight + RUN) + 'px';
    sec.style.position = 'sticky'; sec.style.top = PINTOP + 'px';
  }

  function pose(y) {
    var vh = window.innerHeight;
    var secView = Math.min(Math.max(secTop - y, PINTOP), secTop + RUN - y);
    var A = { l: artRel.l + 0, t: secView + artRel.t, w: artRel.w, h: artRel.h };
    A.l = artRel.x;
    var h0 = 0.86 * A.h, k0 = h0 / BH;
    var cx0 = A.l + A.w * 0.74, cy0 = A.t + A.h - h0 / 2 - 6;
    var u = cl((y - yP0) / RUN);
    var P = { A: A, u: u, ang: 0, idx: 0, cork: 0 };
    var gw = A.w * 0.42, gh = A.h * 0.64, gl = A.l + A.w * 0.07, gb = A.t + A.h - 4;
    P.g = { l: gl, w: gw, h: gh, b: gb, t: gb - gh, cx: gl + gw / 2 };
    if (y < yP0) {
      var t = cl(y / yP0), s = sm(t);
      var docCx0 = cx0 + y, docCy0 = cy0 + y;           // home pose in document coordinates
      var ncx = nat.x + nat.w / 2, ncy = nat.y + nat.h / 2;
      P.k = lerp(nat.h / BH, k0, s);
      P.cx = lerp(ncx, docCx0, s); P.cy = lerp(ncy, docCy0, s) - y;
      P.idx = Math.round(s * TURNS * N) % N;
      P.glassOp = cl((t - 0.55) / 0.4);
      P.fill = 0; P.stream = 0; P.orange = 0;
      return P;
    }
    P.k = k0; P.glassOp = 1;
    var m0 = { x: cx0, y: cy0 - 458 * k0 };               // mouth at home
    var M = { x: P.g.cx + 4, y: P.g.t - 0.26 * gh };      // mouth while pouring
    var tilt = seg(u, 0.24, 0.46);
    var back = seg(u, 0.88, 0.96);
    var amt = tilt * (1 - back);
    var th = -118 * amt - 12 * seg(u, 0.5, 0.86) * (1 - back);
    var arc = Math.sin(Math.PI * amt) * -30;               // lift while swinging
    var mx = lerp(m0.x, M.x, amt), my = lerp(m0.y, M.y, amt) + arc;
    var r = th * Math.PI / 180, c = Math.cos(r), s2 = Math.sin(r);
    // centre so that the local mouth (0,-458k) lands on (mx,my)
    P.cx = mx - (0 * c - (-458 * k0) * s2);
    P.cy = my - (0 * s2 + (-458 * k0) * c);
    P.ang = th; P.mouth = { x: mx, y: my };
    P.cork = u < 0.22 ? seg(u, 0.04, 0.2) : (u < 0.94 ? 1 : 1 - seg(u, 0.94, 0.995));
    var f = seg(u, 0.52, 0.86);
    P.fill = f;
    var gi = 14 / 250 * gh, bt = 222 / 250 * gh;           // interior top/bottom in px from glass top
    P.surfY = P.g.t + lerp(bt, gi + 0.12 * gh, f);
    P.stream = seg(u, 0.47, 0.53) * (1 - seg(u, 0.83, 0.89));
    P.streamStart = seg(u, 0.83, 0.89);
    P.orange = seg(u, 0.9, 0.995);
    return P;
  }

  function render(y) {
    var P = pose(y), k = P.k;
    var w = BW * k, h = BH * k;
    if (P.idx !== lastIdx) {
      ctx.clearRect(0, 0, FW, FH);
      ctx.drawImage(sheet, (P.idx % COLS) * FW, Math.floor(P.idx / COLS) * FH, FW, FH, 0, 0, FW, FH);
      lastIdx = P.idx;
    }
    cv.style.width = w + 'px'; cv.style.height = h + 'px';
    cv.style.transform = 'translate3d(' + (P.cx - w / 2).toFixed(1) + 'px,' + (P.cy - h / 2).toFixed(1) + 'px,0) rotate(' + P.ang.toFixed(2) + 'deg)';
    // cork: rides on the bottle head, then lifts off to the back/right and fades
    var th = P.ang * Math.PI / 180, c = Math.cos(th), s = Math.sin(th);
    var lx = -1 * k, ly = -453 * k;
    var ccx = P.cx + lx * c - ly * s, ccy = P.cy + lx * s + ly * c;
    var cc = P.cork, cw = 260 * k * (1 - 0.3 * cc), chh = 150 * k * (1 - 0.3 * cc);
    ccx += cc * 90 * k * 3.2; ccy -= cc * 230 * k * 1.2;
    ck.style.width = cw + 'px'; ck.style.height = chh + 'px';
    ck.style.opacity = cc < 0.55 ? 1 : Math.max(0, 1 - (cc - 0.55) / 0.45);
    ck.style.transform = 'translate3d(' + (ccx - cw / 2).toFixed(1) + 'px,' + (ccy - chh / 2).toFixed(1) + 'px,0) rotate(' + (P.ang + cc * 38).toFixed(1) + 'deg)';
    // glass position/size inside the card
    var g = P.g, A = P.A;
    glass.style.left = (g.l - A.l) + 'px'; glass.style.top = (g.t - A.t) + 'px';
    glass.style.width = g.w + 'px'; glass.style.height = (g.h * 250 / 236) + 'px';
    glass.style.opacity = P.glassOp;
    var ly0 = 222 - P.fill * (222 - 36);
    liquidG.liq.setAttribute('y', ly0); surf.setAttribute('cy', ly0);
    surf.setAttribute('rx', 66 - P.fill * 8 + Math.sin(y * 0.05) * 1.2 * (P.stream > 0.1 ? 1 : 0));
    Array.prototype.forEach.call(iceG.cubes, function (g2, i) {
      var b = g2.base, rise = P.fill * (46 + i * 4) - Math.sin(y * 0.02 + i) * (P.fill > 0.1 ? 1.5 : 0);
      g2.setAttribute('transform', 'translate(' + b[0] + ' ' + (b[1] - rise) + ') rotate(' + (b[2] + P.fill * (i % 2 ? 12 : -9)) + ')');
    });
    // orange slice falls onto the rim
    var o = P.orange, ease = o * o;
    var oy = lerp(-150, 4, ease) - Math.sin(Math.PI * o) * 0, rot = lerp(260, -14, sm(o));
    var bounce = o > 0.92 ? Math.sin((o - 0.92) / 0.08 * Math.PI) * -6 : 0;
    orange.setAttribute('transform', 'translate(' + lerp(120, 126, o) + ' ' + (oy + bounce) + ') rotate(' + rot + ')');
    orange.style.opacity = o > 0.01 ? 1 : 0;
    // stream
    if (P.stream > 0.01 && P.mouth) {
      var sx = P.mouth.x, sy = P.mouth.y, ey = lerp(sy, P.surfY, P.stream);
      var y1 = lerp(sy, P.surfY, P.streamStart || 0);
      var wob = Math.sin(y * 0.09) * 1.6;
      spath.setAttribute('d', 'M' + (sx + 1) + ' ' + y1 + ' Q' + (sx + wob) + ' ' + ((y1 + ey) / 2) + ' ' + (sx - 2) + ' ' + ey);
      spath.style.opacity = 1;
      spath.setAttribute('stroke-width', (8 - 2 * P.stream).toFixed(1));
    } else spath.style.opacity = 0;
    // pinned section can be shifted; stream/bottle are fixed overlays, so nothing else to do
    var p = cl(y / (hero.offsetHeight * 0.7));
    hero.style.setProperty('--p', sm(p).toFixed(4));
  }

  function loop() { raf = 0; render(window.pageYOffset); }
  function req() { if (!raf) raf = requestAnimationFrame(loop); }

  function start() {
    PINTOP = 240 - (art.getBoundingClientRect().top - sec.getBoundingClientRect().top);
    wrapInit();
    buildGlass();
    cv = document.createElement('canvas'); cv.width = FW; cv.height = FH; cv.className = 'pour-bottle'; cv.setAttribute('aria-hidden', 'true');
    ctx = cv.getContext('2d');
    ck = new Image(); ck.src = cork.src; ck.className = 'pour-cork'; ck.setAttribute('aria-hidden', 'true');
    stream = el('svg', { class: 'pour-stream', width: '100%', height: '100%' });
    spath = el('path', { fill: 'none', stroke: LIQ, 'stroke-linecap': 'round', 'stroke-width': 7 }, stream);
    document.body.appendChild(stream); document.body.appendChild(cv); document.body.appendChild(ck);
    measure();
    document.documentElement.setAttribute('data-spin', 'pink');
    document.documentElement.classList.add('spin-on');
    render(window.pageYOffset);
    requestAnimationFrame(function () { cv.classList.add('ready'); ck.classList.add('ready'); });
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('load', function () { wrap.style.height = (sec.offsetHeight + RUN) + 'px'; measure(); req(); });
    window.addEventListener('resize', function () { wrap.style.height = (sec.offsetHeight + RUN) + 'px'; measure(); req(); }, { passive: true });
  }
})();
