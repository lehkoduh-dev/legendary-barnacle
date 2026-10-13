/* Scroll-driven rotating bottle (home page, wide screens only) */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  var mobile = window.innerWidth < 1000;
  var KEY = mobile ? 'pink' : 'spiced';   // first card on phones (stacked), third card on desktop
  var hero = document.querySelector('.hero');
  var b2 = document.querySelector('.hero .trio .b2 img');
  var target = document.querySelector('#blends .card.' + KEY + ' img.bimg');
  if (mobile) {   // put the bottle that matches the first card in the foreground
    var b1 = document.querySelector('.hero .trio .b1 img');
    if (b1 && b2 && /bottle-spiced/.test(b2.getAttribute('src'))) {
      var u2 = b2.getAttribute('src'), a2 = b2.alt, a1 = b1.alt;
      b2.setAttribute('src', u2.replace('bottle-spiced', 'bottle-pink')); b2.alt = a1;
      b1.setAttribute('src', u2); b1.alt = a2;
    }
  }
  if (!hero || !b2 || !target) return;

  var V = (document.currentScript && document.currentScript.src.split('?v=')[1]) || '1';
  var STEP = mobile ? 2 : 1;
  var W = 542, H = 1068, CX = 271, RL = 266;
  var FRONT_HALF = 112.2 * Math.PI / 180, BACK_HALF = 46 * Math.PI / 180;

  var imgs = {}, left = 3;
  ['base', KEY + '-front', KEY + '-back'].forEach(function (n) {
    var im = new Image();
    im.onload = function () { imgs[n] = im; if (--left === 0) start(); };
    im.onerror = function () { /* keep the static hero */ };
    im.src = '/assets/img/spin/' + n + '.webp?v=' + V;
  });

  var canvas, ctx, layer, lctx, shadeCache = {};
  var natural = { x: 0, y: 0, w: 0, h: 0 };
  var lastRot = null, ticking = false;

  function gradient(c, type) {
    var g = c.createLinearGradient(CX - RL, 0, CX + RL, 0), i, t, psi, a;
    for (i = 0; i <= 40; i++) {
      t = i / 40; var s = t * 2 - 1; psi = Math.asin(Math.max(-1, Math.min(1, s)));
      if (type === 'shade') { a = 0.45 * (1 - Math.cos(psi)); g.addColorStop(t, 'rgba(20,10,5,' + a.toFixed(3) + ')'); }
      else {
        a = 0.20 * Math.exp(-Math.pow((psi + 0.62) / 0.17, 2)) + 0.06 * Math.exp(-Math.pow((psi - 0.5) / 0.25, 2));
        g.addColorStop(t, 'rgba(255,255,255,' + a.toFixed(3) + ')');
      }
    }
    return g;
  }

  function norm(a) { a = (a + Math.PI) % (2 * Math.PI); if (a < 0) a += 2 * Math.PI; return a - Math.PI; }

  function strip(tex, center, half, y0, rot) {
    var tw = tex.width, th = tex.height, x, s, psi, t, sx, sw, du;
    for (x = CX - RL + 1; x < CX + RL; x += STEP) {
      s = (x - CX) / RL; psi = Math.asin(s);
      t = norm(psi - rot - center);
      if (Math.abs(t) >= half) continue;
      sx = (t / half * 0.5 + 0.5) * (tw - 1);
      du = (1 / (RL * Math.max(0.06, Math.cos(psi)))) / half * 0.5 * (tw - 1);
      sw = Math.max(2, Math.min(60, du));
      var sx0 = Math.max(0, Math.min(tw - sw, sx - sw / 2));
      lctx.drawImage(tex, sx0, 0, sw, th, x, y0, STEP, th);
    }
  }

  function draw(rot) {
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(imgs.base, 0, 0);
    lctx.clearRect(0, 0, W, H);
    lctx.globalCompositeOperation = 'source-over';
    strip(imgs[KEY + '-front'], 0, FRONT_HALF, 866 - imgs[KEY + '-front'].height, rot);
    strip(imgs[KEY + '-back'], Math.PI, BACK_HALF, 700 - Math.floor(imgs[KEY + '-back'].height / 2), rot);
    lctx.globalCompositeOperation = 'source-atop';
    lctx.fillStyle = shadeCache.shade; lctx.fillRect(0, 0, W, H);
    lctx.fillStyle = shadeCache.spec; lctx.fillRect(0, 0, W, H);
    lctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(layer, 0, 0);
  }

  function measure() {
    var r = b2.getBoundingClientRect();
    natural = { x: r.left, y: r.top + window.scrollY, w: r.width, h: r.height };
  }

  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(t) { return t * t * (3 - 2 * t); }

  function frame() {
    ticking = false;
    var vw = window.innerWidth, vh = window.innerHeight, y = window.scrollY;
    var heroH = hero.offsetHeight;
    var p = Math.max(0, Math.min(1, y / (heroH * 0.7)));
    hero.style.setProperty('--p', smooth(p).toFixed(4));
    var tr = target.getBoundingClientRect();
    var tgtY = tr.top + y;                         // page position of the card bottle
    var sEnd = Math.max(240, tgtY - vh * 0.30);    // scroll position where the bottle has landed
    var t = Math.max(0, Math.min(1, y / sEnd));
    var s = smooth(t);
    var cx, cy, cw, ch;
    if (y >= sEnd) { cx = tr.left; cy = tr.top; cw = tr.width; ch = tr.height; }
    else {
      cx = lerp(natural.x, tr.left, s);
      cy = lerp(natural.y, tgtY, s) - y;
      cw = lerp(natural.w, tr.width, s); ch = lerp(natural.h, tr.height, s);
    }
    canvas.style.width = cw + 'px'; canvas.style.height = ch + 'px';
    canvas.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
    var rot = t * 4 * Math.PI;                     // two full turns, lands front-facing
    var docked = y >= sEnd;
    canvas.classList.toggle('docked', docked);
    if (lastRot === null || Math.abs(rot - lastRot) > 0.002) { draw(rot); lastRot = rot; }
  }

  function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }

  function start() {
    canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H; canvas.className = 'spin-bottle'; canvas.setAttribute('aria-hidden', 'true');
    ctx = canvas.getContext('2d');
    layer = document.createElement('canvas'); layer.width = W; layer.height = H; lctx = layer.getContext('2d');
    shadeCache.shade = gradient(lctx, 'shade'); shadeCache.spec = gradient(lctx, 'spec');
    document.documentElement.setAttribute('data-spin', KEY);
    document.body.appendChild(canvas);
    measure(); draw(0); lastRot = 0;
    document.documentElement.classList.add('spin-on');
    measure();
    frame();
    requestAnimationFrame(function () { canvas.classList.add('ready'); });
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', function () { var s = window.scrollY; measure(); req(); }, { passive: true });
  }
})();
