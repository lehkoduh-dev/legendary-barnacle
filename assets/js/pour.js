/* TEST: pour scene on the cocktails slide (desktop). Spiced Velvet leaves its card, spins, flies down, uncorks and pours into a rocks glass. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || window.innerWidth < 1000) return;
  var c3img = document.querySelector('#blends .card.spiced img.bimg');
  var ofCard = document.querySelector('a.card.oldf');
  if (!c3img || !ofCard) return;
  var sec = ofCard.closest('section');
  var art2 = ofCard.querySelector('.art');
  var cardsRow = ofCard.parentNode;
  var art3 = cardsRow.children[cardsRow.children.length - 1].querySelector('.art');
  var V = (document.currentScript && document.currentScript.src.split('?v=')[1]) || '1';
  var N = 36, COLS = 6, FW = 300, FH = 592, BW = 542, BH = 1068, RUN = 1700, ART_TOP = 250;
  var LIQ = '#C97D20';
  var sheet, cork, left = 2;
  [['spiced-pour', function (i) { sheet = i; }], ['cork', function (i) { cork = i; }]].forEach(function (p) {
    var im = new Image(); im.onload = function () { p[1](im); if (--left === 0) start(); };
    im.src = '/assets/img/spin/' + p[0] + '.webp?v=' + V;
  });

  var wrap, cv, ctx, ck, stream, spath, glass, liquidG, surf, iceG, orange, spinCv, PINTOP = 0, svgNS = 'http://www.w3.org/2000/svg';
  var wrapTop = 0, raf = 0, lastIdx = -1, GEO = {}, c3 = {};

  function lerp(a, b, t) { return a + (b - a) * t; }
  function cl(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }
  function sm(t) { t = cl(t); return t * t * (3 - 2 * t); }
  function seg(u, a, b) { return sm((u - a) / (b - a)); }
  function el(n, a, p) { var e = document.createElementNS(svgNS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  var GH = 175, SY0 = 158, SY1 = 62;     // glass svg height, liquid bottom/top (svg units)

  function buildGlass() {
    art2.style.cssText += ';position:relative;overflow:visible';
    glass = el('svg', { viewBox: '0 0 170 ' + GH, class: 'pour-glass' });
    glass.style.cssText = 'position:absolute;overflow:visible;pointer-events:none';
    var d = el('defs', {}, glass);
    var cp = el('clipPath', { id: 'pgclip' }, d);
    el('path', { d: 'M16 14 L154 14 L146 150 Q145 158 137 158 L33 158 Q25 158 24 150 Z' }, cp);
    el('ellipse', { cx: 85, cy: 170, rx: 70, ry: 5, fill: 'rgba(90,40,10,.28)' }, glass);
    el('path', { d: 'M10 10 L160 10 L152 154 Q151 166 140 166 L30 166 Q19 166 18 154 Z', fill: 'rgba(255,255,255,.30)', stroke: 'rgba(255,255,255,.95)', 'stroke-width': 2.2 }, glass);
    var pre = el('g', { 'clip-path': 'url(#pgclip)' }, glass);
    el('rect', { x: 20, y: 148, width: 130, height: 12, fill: '#7A3F10', 'fill-opacity': .75 }, pre);         // syrup + bitters already in the glass
    liquidG = el('g', { 'clip-path': 'url(#pgclip)' }, glass);
    liquidG.liq = el('rect', { x: 0, y: SY0, width: 170, height: 200, fill: LIQ, 'fill-opacity': .92 }, liquidG);
    surf = el('ellipse', { cx: 85, cy: SY0, rx: 66, ry: 4.5, fill: '#E3A24F', 'fill-opacity': .95 }, liquidG);
    iceG = el('g', { 'clip-path': 'url(#pgclip)' }, glass);
    var cube = el('g', { transform: 'translate(85 112) rotate(-4)' }, iceG);
    cube.base = [85, 112, -4];
    el('rect', { x: -38, y: -38, width: 76, height: 76, rx: 9, fill: 'rgba(235,248,255,.42)', stroke: 'rgba(255,255,255,.9)', 'stroke-width': 1.8 }, cube);
    el('path', { d: 'M-26 -22 L-8 -28', stroke: 'rgba(255,255,255,.95)', 'stroke-width': 3, 'stroke-linecap': 'round' }, cube);
    el('path', { d: 'M-28 -6 L-28 22', stroke: 'rgba(255,255,255,.5)', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, cube);
    iceG.cube = cube;
    el('path', { d: 'M20 20 L28 150', stroke: 'rgba(255,255,255,.7)', 'stroke-width': 4, 'stroke-linecap': 'round', fill: 'none' }, glass);
    el('path', { d: 'M10 10 L160 10', stroke: 'rgba(255,255,255,.95)', 'stroke-width': 3, fill: 'none' }, glass);
    orange = el('g', {}, glass);
    el('path', { d: 'M-30 4 C-22 -20 -4 -20 2 -6 S22 10 30 -8', stroke: '#F28C1A', 'stroke-width': 8, 'stroke-linecap': 'round', fill: 'none' }, orange);
    el('path', { d: 'M-30 4 C-22 -20 -4 -20 2 -6 S22 10 30 -8', stroke: '#FFC76B', 'stroke-width': 2.4, 'stroke-linecap': 'round', fill: 'none' }, orange);
    orange.style.opacity = 0;
    art2.appendChild(glass);
  }

  function layout() {
    var vh = window.innerHeight, vw = window.innerWidth;
    var save = sec.style.cssText;
    wrap.style.height = (sec.offsetHeight + RUN) + 'px';
    var sr = sec.getBoundingClientRect(), a2 = art2.getBoundingClientRect(), a3 = art3.getBoundingClientRect();
    PINTOP = ART_TOP - (a2.top - sr.top);
    sec.style.top = PINTOP + 'px';
    wrapTop = wrap.getBoundingClientRect().top + window.pageYOffset;
    var gw = Math.min(0.62 * a2.width, 230), gh = gw * GH / 170;
    var h0 = 0.98 * a3.height;
    GEO = { vh: vh, gw: gw, gh: gh, gcx: a2.left + a2.width / 2, gbRel: (a2.bottom - sr.top) - 26, h0: h0,
            cx0: a3.left + a3.width / 2, cy0Rel: (a3.bottom - sr.top) - h0 / 2 - 4 };
    glass.style.width = gw + 'px'; glass.style.height = gh + 'px';
    glass.style.left = (a2.width / 2 - gw / 2) + 'px'; glass.style.top = (a2.height - 26 - gh) + 'px';
    var r = c3img.getBoundingClientRect(), y = window.pageYOffset;
    c3 = { cx: r.left + r.width / 2, docCy: r.top + y + r.height / 2, h: r.height, docTop: r.top + y };
  }

  function pose(y) {
    var G = GEO, vh = G.vh;
    var stageView = Math.min(Math.max(wrapTop - y + 0, PINTOP), wrapTop + RUN - y);
    var yP0 = wrapTop - PINTOP;
    stageView = Math.min(Math.max(wrapTop - y, PINTOP), wrapTop + RUN - y);
    var h0 = G.h0, k0 = h0 / BH;
    var cx0 = G.cx0, cy0 = stageView + G.cy0Rel;
    var yLift = c3.docTop - 0.30 * vh + 0.12 * vh;
    var P = { ang: 0, idx: 0, cork: 0, fill: 0, stream: 0, orange: 0 };
    var gbV = stageView + G.gbRel;
    P.g = { t: gbV - G.gh, cx: G.gcx, h: G.gh };
    if (y < yLift) {                                    // docked in card 3
      P.k = c3.h / BH; P.cx = c3.cx; P.cy = c3.docCy - y;
      return P;
    }
    if (y < yP0) {                                      // lifts out, turns once, glides to the cocktail slide
      var s = sm((y - yLift) / (yP0 - yLift));
      var sx = c3.cx, sy = c3.docCy - yLift;
      var hx = cx0, hy = PINTOP + G.cy0Rel;
      P.k = lerp(c3.h / BH, k0, s);
      P.cx = lerp(sx, hx, s); P.cy = lerp(sy, hy, s);
      P.idx = Math.round(s * N) % N;
      return P;
    }
    P.k = k0;
    var u = cl((y - yP0) / RUN);
    var m0 = { x: cx0, y: cy0 - 458 * k0 };
    var M = { x: P.g.cx + 6, y: P.g.t - 0.30 * G.gh };
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
    var unit = G.gh / GH;
    P.surfY = P.g.t + lerp(SY0, SY1, P.fill) * unit;
    P.stream = seg(u, 0.47, 0.53) * (1 - seg(u, 0.83, 0.89));
    P.streamStart = seg(u, 0.83, 0.89);
    P.orange = seg(u, 0.9, 0.995);
    return P;
  }

  function render(y) {
    var docked = spinCv && spinCv.classList.contains('docked');
    cv.style.visibility = ck.style.visibility = docked ? 'visible' : 'hidden';
    if (spinCv) spinCv.style.visibility = docked ? 'hidden' : '';
    if (!docked) { spath.style.opacity = 0; }
    var P = pose(y), k = P.k;
    var w = BW * k, h = BH * k;
    if (P.idx !== lastIdx) {
      ctx.clearRect(0, 0, FW, FH);
      ctx.drawImage(sheet, (P.idx % COLS) * FW, Math.floor(P.idx / COLS) * FH, FW, FH, 0, 0, FW, FH);
      lastIdx = P.idx;
    }
    cv.style.width = w + 'px'; cv.style.height = h + 'px';
    cv.style.transform = 'translate3d(' + (P.cx - w / 2).toFixed(1) + 'px,' + (P.cy - h / 2).toFixed(1) + 'px,0) rotate(' + P.ang.toFixed(2) + 'deg)';
    var th = P.ang * Math.PI / 180, c = Math.cos(th), s = Math.sin(th);
    var lx = -1 * k, ly = -453 * k;
    var ccx = P.cx + lx * c - ly * s, ccy = P.cy + lx * s + ly * c;
    var cc = P.cork, cw = 260 * k * (1 - 0.3 * cc), chh = 150 * k * (1 - 0.3 * cc);
    ccx += cc * 90 * k * 3.2; ccy -= cc * 230 * k * 1.2;
    ck.style.width = cw + 'px'; ck.style.height = chh + 'px';
    ck.style.opacity = cc < 0.55 ? 1 : Math.max(0, 1 - (cc - 0.55) / 0.45);
    ck.style.transform = 'translate3d(' + (ccx - cw / 2).toFixed(1) + 'px,' + (ccy - chh / 2).toFixed(1) + 'px,0) rotate(' + (P.ang + cc * 38).toFixed(1) + 'deg)';
    var ly0 = lerp(SY0, SY1, P.fill);
    liquidG.liq.setAttribute('y', ly0); surf.setAttribute('cy', ly0);
    surf.setAttribute('rx', 66 - P.fill * 4 + Math.sin(y * 0.05) * 1.2 * (P.stream > 0.1 ? 1 : 0));
    var b = iceG.cube.base, rise = P.fill * 18 - Math.sin(y * 0.02) * (P.fill > 0.1 && P.fill < 1 ? 1.2 : 0);
    iceG.cube.setAttribute('transform', 'translate(' + b[0] + ' ' + (b[1] - rise) + ') rotate(' + (b[2] + P.fill * 5) + ')');
    var o = P.orange, ease = o * o;
    var oy = lerp(-150, 14, ease), rot = lerp(220, -8, sm(o));
    var bounce = o > 0.92 ? Math.sin((o - 0.92) / 0.08 * Math.PI) * -6 : 0;
    orange.setAttribute('transform', 'translate(' + lerp(96, 100, o) + ' ' + (oy + bounce) + ') rotate(' + rot + ')');
    orange.style.opacity = o > 0.01 ? 1 : 0;
    if (docked && P.stream > 0.01 && P.mouth) {
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
    sec.parentNode.insertBefore(wrap, sec); wrap.appendChild(sec);
    sec.style.position = 'sticky';
    buildGlass();
    cv = document.createElement('canvas'); cv.width = FW; cv.height = FH; cv.className = 'pour-bottle'; cv.setAttribute('aria-hidden', 'true');
    ctx = cv.getContext('2d');
    ck = new Image(); ck.src = cork.src; ck.className = 'pour-cork'; ck.setAttribute('aria-hidden', 'true');
    stream = el('svg', { class: 'pour-stream', width: '100%', height: '100%' });
    spath = el('path', { fill: 'none', stroke: LIQ, 'stroke-linecap': 'round', 'stroke-width': 7 }, stream);
    document.body.appendChild(stream); document.body.appendChild(cv); document.body.appendChild(ck);
    spinCv = document.querySelector('.spin-bottle');
    layout();
    render(window.pageYOffset);
    requestAnimationFrame(function () { cv.classList.add('ready'); ck.classList.add('ready'); });
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('load', function () { spinCv = document.querySelector('.spin-bottle'); layout(); req(); });
    window.addEventListener('resize', function () { layout(); req(); }, { passive: true });
    setTimeout(function () { spinCv = document.querySelector('.spin-bottle'); layout(); req(); }, 1500);
  }
})();
