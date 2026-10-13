/* TEST: scroll-driven pour scene (desktop). Bottle descends, uncorks, tilts, pours into a glass with ice, orange garnish drops in. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || window.innerWidth < 1000) return;
  var hero = document.querySelector('.hero');
  var sec = document.getElementById('blends');
  var c1img = document.querySelector('#blends .card.pink img.bimg');
  if (!hero || !sec || !c1img) return;
  var V = (document.currentScript && document.currentScript.src.split('?v=')[1]) || '1';
  var N = 36, COLS = 6, FW = 300, FH = 592, TURNS = 2, BW = 542, BH = 1068, RUN = 1700;
  var LIQ = '#EE7FAA';
  var sheet, cork, left = 2;
  [['pink-pour', function (i) { sheet = i; }], ['cork', function (i) { cork = i; }]].forEach(function (p) {
    var im = new Image(); im.onload = function () { p[1](im); if (--left === 0) start(); };
    im.src = '/assets/img/spin/' + p[0] + '.webp?v=' + V;
  });

  var wrap, stage, cv, ctx, ck, stream, spath, glass, liquidG, surf, iceG, orange, svgNS = 'http://www.w3.org/2000/svg';
  var wrapTop = 0, raf = 0, lastIdx = -1, GEO = {};

  function lerp(a, b, t) { return a + (b - a) * t; }
  function cl(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }
  function sm(t) { t = cl(t); return t * t * (3 - 2 * t); }
  function seg(u, a, b) { return sm((u - a) / (b - a)); }
  function el(n, a, p) { var e = document.createElementNS(svgNS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }

  function buildGlass() {
    glass = el('svg', { viewBox: '0 0 160 250', class: 'pour-glass' });
    glass.style.cssText = 'position:absolute;overflow:visible;pointer-events:none';
    var d = el('defs', {}, glass);
    var cp = el('clipPath', { id: 'pgclip' }, d);
    el('path', { d: 'M14 14 L146 14 L132 214 Q131 222 123 222 L37 222 Q29 222 28 214 Z' }, cp);
    el('ellipse', { cx: 80, cy: 244, rx: 64, ry: 6, fill: 'rgba(120,30,70,.25)' }, glass);
    el('path', { d: 'M8 10 L152 10 L136 226 Q135 236 125 236 L35 236 Q25 236 24 226 Z', fill: 'rgba(255,255,255,.34)', stroke: 'rgba(255,255,255,.95)', 'stroke-width': 2.2 }, glass);
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
    stage.appendChild(glass);
  }

  function layout() {
    var vh = window.innerHeight, vw = window.innerWidth;
    wrap.style.height = (vh + RUN) + 'px'; stage.style.height = vh + 'px';
    wrapTop = wrap.getBoundingClientRect().top + window.pageYOffset;
    var gh = Math.min(0.5 * vh, 400), gw = gh * 160 / 236;
    GEO = { vh: vh, vw: vw, gh: gh, gw: gw, gcx: vw * 0.56, gb: vh * 0.88, h0: Math.min(0.62 * vh, 540), cx0: vw * 0.30 };
    glass.style.width = gw + 'px'; glass.style.height = (gh * 250 / 236) + 'px';
    glass.style.left = (GEO.gcx - gw / 2) + 'px'; glass.style.top = (GEO.gb - gh) + 'px';
  }

  function pose(y) {
    var G = GEO, vh = G.vh;
    var stageView = Math.min(Math.max(wrapTop - y, 0), wrapTop + RUN - y);
    var h0 = G.h0, k0 = h0 / BH;
    var cx0 = G.cx0, cy0 = stageView + G.gb - h0 / 2 - 4;
    var T0 = wrapTop - 0.85 * vh, yP0 = wrapTop;
    var P = { ang: 0, idx: 0, cork: 0, fill: 0, stream: 0, orange: 0 };
    P.g = { t: stageView + G.gb - G.gh, cx: G.gcx, h: G.gh };
    var r1 = c1img.getBoundingClientRect();
    if (y < T0) {                                       // sits in card 1, looks like the static bottle
      P.k = r1.height / BH; P.cx = r1.left + r1.width / 2; P.cy = r1.top + r1.height / 2;
      return P;
    }
    if (y < yP0) {                                      // pause is over: it lifts out, turns once and travels to the pour scene
      var s = sm((y - T0) / (yP0 - T0));
      var c1x = r1.left + r1.width / 2, c1y = r1.top + r1.height / 2 + y;       // doc coords
      P.k = lerp(r1.height / BH, k0, s);
      P.cx = lerp(c1x, cx0, s); P.cy = lerp(c1y, cy0 + y, s) - y;
      P.idx = Math.round(s * N) % N;
      return P;
    }
    P.k = k0;
    var u = cl((y - yP0) / RUN);
    var m0 = { x: cx0, y: cy0 - 458 * k0 };
    var M = { x: P.g.cx + 4, y: P.g.t - 0.26 * G.gh };
    var tilt = seg(u, 0.24, 0.46), back = seg(u, 0.88, 0.96);
    var amt = tilt * (1 - back);
    var th = -118 * amt - 12 * seg(u, 0.5, 0.86) * (1 - back);
    var arc = Math.sin(Math.PI * amt) * -30;
    var mx = lerp(m0.x, M.x, amt), my = lerp(m0.y, M.y, amt) + arc;
    var r = th * Math.PI / 180, c = Math.cos(r), s2 = Math.sin(r);
    P.cx = mx - (0 * c - (-458 * k0) * s2);
    P.cy = my - (0 * s2 + (-458 * k0) * c);
    P.ang = th; P.mouth = { x: mx, y: my };
    P.cork = u < 0.22 ? seg(u, 0.04, 0.2) : (u < 0.94 ? 1 : 1 - seg(u, 0.94, 0.995));
    P.fill = seg(u, 0.52, 0.86);
    var gi = 14 / 250 * G.gh, bt = 222 / 250 * G.gh;
    P.surfY = P.g.t + lerp(bt, gi + 0.12 * G.gh, P.fill);
    P.stream = seg(u, 0.47, 0.53) * (1 - seg(u, 0.83, 0.89));
    P.streamStart = seg(u, 0.83, 0.89);
    P.orange = seg(u, 0.9, 0.995);
    return P;
  }

  function render(y) {
    var P = pose(y), k = P.k;
    document.documentElement.classList.toggle('pour-lifted', y >= 0);
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
  }

  function loop() { raf = 0; render(window.pageYOffset); }
  function req() { if (!raf) raf = requestAnimationFrame(loop); }

  function start() {
    wrap = document.createElement('div'); wrap.className = 'pour-wrap';
    stage = document.createElement('section'); stage.className = 'pour-stage'; wrap.appendChild(stage);
    sec.parentNode.insertBefore(wrap, sec.nextSibling);
    buildGlass();
    cv = document.createElement('canvas'); cv.width = FW; cv.height = FH; cv.className = 'pour-bottle'; cv.setAttribute('aria-hidden', 'true');
    ctx = cv.getContext('2d');
    ck = new Image(); ck.src = cork.src; ck.className = 'pour-cork'; ck.setAttribute('aria-hidden', 'true');
    stream = el('svg', { class: 'pour-stream', width: '100%', height: '100%' });
    spath = el('path', { fill: 'none', stroke: LIQ, 'stroke-linecap': 'round', 'stroke-width': 7 }, stream);
    document.body.appendChild(stream); document.body.appendChild(cv); document.body.appendChild(ck);
    layout();
    document.documentElement.classList.add('pour-on');
    render(window.pageYOffset);
    requestAnimationFrame(function () { cv.classList.add('ready'); ck.classList.add('ready'); });
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('load', function () { layout(); req(); });
    window.addEventListener('resize', function () { layout(); req(); }, { passive: true });
  }
})();
