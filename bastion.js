/**
 * THE OVERGROWN BASTION — Visual & Interaction Engine
 * Custom astrolabe crosshair • Living cobblestone canvas • Ambient spores
 * Framing vine growth • Sleight-of-hand vine curtains • Stone tilt & shine
 * Leaf sprout & moss cluster injection
 *
 * ZERO GRADIENTS: every fill used here is a solid color token.
 */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  var C = {
    stoneAbyss: '#0F1412',
    stoneBasalt: '#181E1B',
    stoneGranite: '#242C28',
    stoneLimestone: '#46534C',
    mossShadow: '#0B2014',
    mossPeat: '#143321',
    mossVelvet: '#1F4E32',
    mossEmerald: '#2D6E46',
    mossFern: '#42935E',
    mossLichen: '#68B87E',
    mossDew: '#9CE0AC',
    bloomSun: '#E6B84D',
    bloomBriar: '#D46A6A',
    bloomBell: '#7A8CE0',
    bloomHawthorn: '#F2EFE9',
    /* Extended Living-Ruins ramp — distributed naturally, never uniform */
    mossCanopy: '#326A37',
    mossLiving: '#477D38',
    mossFernLive: '#609B42',
    botanicLaurel: '#4D7954',
    botanicSage: '#849B78',
    botanicIvory: '#F0EBD8',
    botanicBlush: '#C78F83',
    botanicOchre: '#B59A60'
  };

  /* A small botanical library: several leaf silhouettes rather than one
     duplicated icon. Shapes are builders in local coordinates anchored at
     the stem (0,0), growing toward +x for side = 1. */
  var LEAF_SHAPES = [
    // 1 — pointed leaf
    function (s) { return 'M0 0 C' + (6*s) + ' -9,' + (20*s) + ' -7,' + (29*s) + ' 0 C' + (20*s) + ' 7,' + (6*s) + ' 9,0 0 Z'; },
    // 2 — rounded ivy leaf, two-lobed
    function (s) { return 'M0 0 C' + (5*s) + ' -11,' + (19*s) + ' -12,' + (25*s) + ' -3 C' + (29*s) + ' 2,' + (21*s) + ' 9,' + (12*s) + ' 8 C' + (5*s) + ' 7,' + (2*s) + ' 4,0 0 Z'; },
    // 3 — narrow laurel blade
    function (s) { return 'M0 0 Q' + (15*s) + ' -9,' + (31*s) + ' -1 Q' + (15*s) + ' 5,0 0 Z'; },
    // 4 — small fern leaflet, tapered
    function (s) { return 'M0 0 C' + (8*s) + ' -6,' + (17*s) + ' -5,' + (23*s) + ' -2 C' + (17*s) + ' 3,' + (8*s) + ' 4,0 0 Z'; }
  ];

  var LEAF_TONES = [
    C.mossEmerald, C.mossEmerald, C.mossCanopy, C.mossCanopy,
    C.mossVelvet, C.mossFernLive, C.botanicLaurel, C.botanicSage
  ];

  function pickLeafShape() {
    return LEAF_SHAPES[Math.floor(Math.random() * LEAF_SHAPES.length)];
  }

  function pickLeafTone() {
    return LEAF_TONES[Math.floor(Math.random() * LEAF_TONES.length)];
  }

  var mouse = { x: -999, y: -999, inside: false };

  document.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.inside = true;
  });
  document.addEventListener('mouseleave', function () { mouse.inside = false; });

  // ========================================================================
  // 0. THE WALL — photographic foundation
  //    wall-texture.css carries the reference photograph itself, baked dark
  //    and damp: one completely static layer behind everything. If that
  //    stylesheet is missing, the layer paints nothing and the procedural
  //    canvas wall below remains as the fallback texture. Either way the
  //    wall NEVER reacts to the pointer — the background stays still.
  // ========================================================================
  (function wallLayer() {
    var layer = document.createElement('div');
    layer.className = 'wall-layer';
    layer.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(layer, document.body.firstChild);
    // The photo is present only if the stylesheet actually painted it
    if (getComputedStyle(layer).backgroundImage.indexOf('url(') !== -1) {
      document.documentElement.classList.add('wall-photo');
    }
  })();

  // ========================================================================
  // 1. RAIN-WET STACKED-STONE WALL (z-index: -2)
  //    Fallback texture for when the photographic layer is unavailable:
  //    Flat, elongated stones laid in horizontal courses — grey-brown damp
  //    masonry with moss living along the ledge tops, after the reference
  //    wall. Rendered ONCE, then completely still.
  // ========================================================================
  (function stoneWall() {
    var canvas = document.getElementById('cobbleCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var base = document.createElement('canvas');
    var baseCtx = base.getContext('2d');
    var stones = [];
    var clumps = [];
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = 0, h = 0;

    function lerpHex(a, b, t) {
      var ar = parseInt(a.slice(1, 3), 16), ag = parseInt(a.slice(3, 5), 16), ab = parseInt(a.slice(5, 7), 16);
      var br = parseInt(b.slice(1, 3), 16), bg = parseInt(b.slice(3, 5), 16), bb = parseInt(b.slice(5, 7), 16);
      return 'rgb(' + Math.round(ar + (br - ar) * t) + ',' + Math.round(ag + (bg - ag) * t) + ',' + Math.round(ab + (bb - ab) * t) + ')';
    }

    /* Damp masonry tones sampled from the reference wall — cool wet greys
       mixed with warm sedimentary browns, all desaturated and rain-soaked.
       Kept deep so text stays readable over the wall without a scrim. */
    var TONES = [
      '#292D27', '#2F332B', '#343830', '#3A3E36', '#3E423A',
      '#434035', '#484339', '#44473F', '#4A4E45', '#41443E', '#4C5047'
    ];

    /* Living moss — muted bed greens; fresh tips only rarely */
    var MOSS = ['#326A37', '#3E7138', '#477D38', '#4D7954', '#558C3E', '#609B42'];
    var MOSS_TIP = '#76B747';

    function jitterTone(hex, amt) {
      var ch = function (off) {
        var v = parseInt(hex.slice(off, off + 2), 16) + Math.round((Math.random() * 2 - 1) * amt);
        return ('0' + Math.max(0, Math.min(255, v)).toString(16)).slice(-2);
      };
      return '#' + ch(1) + ch(3) + ch(5);
    }

    function buildStones() {
      stones = [];
      clumps = [];
      var wave = Math.random() * 12;   // moss density drifts in slow patches
      var y = -30;
      while (y < h + 34) {
        var courseH = 24 + Math.random() * 34;
        var x = -Math.random() * 110;
        while (x < w + 44) {
          var sw = 64 + Math.random() * 132;   // elongated, laid by hand
          var sy = y + (Math.random() * 4 - 2);
          var sh = courseH + (Math.random() * 6 - 3);
          var jr = function () { return Math.random() * 5 - 2.5; };
          var pts = [
            { x: x + jr(), y: sy + jr() },
            { x: x + sw + jr(), y: sy + jr() },
            { x: x + sw + jr(), y: sy + sh + jr() },
            { x: x + jr(), y: sy + sh + jr() }
          ];
          var topA = { x: pts[0].x, y: pts[0].y };
          var topB = { x: pts[1].x, y: pts[1].y };
          var botA = { x: pts[3].x, y: pts[3].y };
          var botB = { x: pts[2].x, y: pts[2].y };
          // A chipped corner on a side or bottom edge — worn, not machined
          if (Math.random() < 0.55) {
            var idx = 1 + Math.floor(Math.random() * 3);
            var a2 = pts[idx], b2 = pts[(idx + 1) % 4];
            var tt = 0.3 + Math.random() * 0.4;
            pts.splice(idx + 1, 0, {
              x: a2.x + (b2.x - a2.x) * tt + (Math.random() * 7 - 3.5),
              y: a2.y + (b2.y - a2.y) * tt + (Math.random() * 7 - 3.5)
            });
          }
          var st = {
            pts: pts,
            cx: x + sw / 2, cy: sy + sh / 2,
            tone: jitterTone(TONES[Math.floor(Math.random() * TONES.length)], 7),
            topA: topA, topB: topB, botA: botA, botB: botB,
            striate: [], sheen: Math.random() < 0.82
          };
          // Sedimentary layering across the face
          var ns = Math.random() < 0.6 ? 1 + (Math.random() < 0.3 ? 1 : 0) : 0;
          for (var si = 0; si < ns; si++) {
            st.striate.push({ f: 0.3 + Math.random() * 0.45, a: Math.random() * 5 - 2.5 });
          }
          stones.push(st);

          // Moss lives on the top ledge — density drifts, so the wall has
          // thickly overgrown stretches and long, clean stone runs
          var density = 0.5 + 0.5 * Math.sin((x + wave * 90) * 0.0045) * Math.cos((sy + wave * 40) * 0.006);
          if (Math.random() < density * 0.4 + 0.05) {
            var cn = 7 + Math.floor(Math.random() * 8);
            var cw = 14 + Math.random() * (sw * 0.4);
            var cx0 = topA.x + Math.random() * Math.max(6, topB.x - topA.x - cw);
            var ty = (topA.y + topB.y) / 2;
            var cMid = cx0 + cw * 0.5;
            var circles = [];
            for (var ci = 0; ci < cn; ci++) {
              var rr = 2.4 + Math.random() * 3.6;
              // Bias toward the clump centre so the moss reads as a dense
              // bed hugging the ledge, never scattered dots
              var off = (Math.random() + Math.random() - 1) * cw * 0.5;
              circles.push({
                x: cMid + off,
                y: ty - Math.random() * rr * 0.55 + Math.random() * 2,
                r: rr,
                c: Math.random() < 0.1 ? MOSS_TIP : MOSS[Math.floor(Math.random() * MOSS.length)]
              });
            }
            var fronds = [];
            if (Math.random() < 0.15) {
              fronds.push({
                x: cx0 + cw * (0.2 + Math.random() * 0.6),
                y: ty,
                a: -Math.PI / 2 + (Math.random() * 0.8 - 0.4),
                len: 7 + Math.random() * 7
              });
            }
            clumps.push({
              circles: circles, fronds: fronds,
              stains: [
                { x: cx0 + cw * 0.5, y: ty + 7, r: cw * 0.4 },
                { x: cx0 + cw * (0.2 + Math.random() * 0.6), y: ty + 15, r: cw * 0.28 }
              ],
              cx: cx0 + cw * 0.5, cy: ty, w: cw
            });
          }

          x += sw + (3 + Math.random() * 3);   // narrow mortar joint
        }
        y += courseH + (2 + Math.random() * 3);
      }
    }

    function drawStone(g, s, hl) {
      var pts = s.pts;
      g.beginPath();
      g.moveTo(pts[0].x, pts[0].y);
      for (var i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
      g.closePath();
      // Faces turn darker and damper near the cursor — rain-soaked stone
      g.fillStyle = hl > 0 ? lerpHex(s.tone, '#1E211C', hl * 0.45) : s.tone;
      g.fill();
      // Mortar-shadowed bottom edge — the light always falls from above
      g.beginPath();
      g.moveTo(s.botB.x, s.botB.y - 2);
      g.lineTo(s.botA.x, s.botA.y - 2);
      g.lineWidth = 2;
      g.strokeStyle = 'rgba(10, 13, 10, 0.34)';
      g.stroke();
      // Sedimentary striations
      for (var k = 0; k < s.striate.length; k++) {
        var st = s.striate[k];
        g.beginPath();
        g.moveTo(s.topA.x + 4, s.topA.y + (s.botA.y - s.topA.y) * st.f);
        g.lineTo(s.topB.x - 4, s.topB.y + (s.botB.y - s.topB.y) * st.f + st.a);
        g.lineWidth = 1;
        g.strokeStyle = 'rgba(12, 14, 11, 0.16)';
        g.stroke();
      }
      // Thin wet sheen catching a grey sky on the top ledge — restrained,
      // never a gleam: water-reflection silver, low alpha
      if (s.sheen) {
        g.beginPath();
        g.moveTo(s.topA.x + 2, s.topA.y + 0.5);
        g.lineTo(s.topB.x - 2, s.topB.y + 0.5);
        g.lineWidth = 1.4;
        g.strokeStyle = 'rgba(168, 182, 170,' + (0.13 + 0.24 * hl).toFixed(3) + ')';
        g.stroke();
      }
    }

    function drawClump(g, cl, hl) {
      // Damp stain soaking down the face beneath the moss
      g.fillStyle = 'rgba(14, 24, 16, 0.16)';
      for (var si = 0; si < cl.stains.length; si++) {
        g.beginPath();
        g.arc(cl.stains[si].x, cl.stains[si].y, cl.stains[si].r, 0, Math.PI * 2);
        g.fill();
      }
      // Moss swells softly when the gaze passes near
      var swell = 2.4 * hl;
      for (var i = 0; i < cl.circles.length; i++) {
        var c = cl.circles[i];
        g.beginPath();
        g.arc(c.x, c.y, c.r + swell, 0, Math.PI * 2);
        g.fillStyle = (hl > 0 && c.c !== MOSS_TIP) ? lerpHex(c.c, MOSS_TIP, hl * 0.45) : c.c;
        g.fill();
      }
      // A rare frond reaching out of the clump
      for (var f = 0; f < cl.fronds.length; f++) {
        var fr = cl.fronds[f];
        g.save();
        g.translate(fr.x, fr.y);
        g.rotate(fr.a);
        g.strokeStyle = hl > 0.4 ? '#558C3E' : '#477D38';
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(0, 0);
        g.quadraticCurveTo(1.5, -fr.len * 0.55, 0.5, -fr.len);
        g.stroke();
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(0.4, -fr.len * 0.45); g.lineTo(3.5, -fr.len * 0.62);
        g.moveTo(0.5, -fr.len * 0.72); g.lineTo(-2.5, -fr.len * 0.88);
        g.stroke();
        g.restore();
      }
    }

    function renderBase() {
      baseCtx.clearRect(0, 0, w, h);
      baseCtx.fillStyle = C.stoneAbyss;
      baseCtx.fillRect(0, 0, w, h);
      for (var i = 0; i < stones.length; i++) drawStone(baseCtx, stones[i], 0);
      for (var c = 0; c < clumps.length; c++) drawClump(baseCtx, clumps[c], 0);
    }

    function render() {
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(base, 0, 0);
    }

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      base.width = w * dpr;
      base.height = h * dpr;
      baseCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStones();
      renderBase();
    }

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 180);
    });

    resize();
    render();
  })();

  // ========================================================================
  // 2. AMBIENT SPORES & FALLING LEAVES (z-index: -1)
  // ========================================================================
  (function ambientSpores() {
    var canvas = document.getElementById('sporeCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = 0, h = 0;
    var parts = [];

    function spawn(initial) {
      var isLeaf = Math.random() < 0.15;
      var colors = isLeaf ? [C.mossCanopy] : [C.botanicLaurel, C.botanicOchre, C.botanicSage];
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : -10,
        r: isLeaf ? 3.4 + Math.random() * 2 : 1.2 + Math.random() * 1.8,
        vy: 0.09 + Math.random() * 0.16,
        phase: Math.random() * Math.PI * 2,
        sway: 0.25 + Math.random() * 0.5,
        rot: Math.random() * Math.PI,
        rotV: (Math.random() - 0.5) * 0.012,
        leaf: isLeaf,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
    }

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = w < 700 ? 9 : 14;
      parts = [];
      for (var i = 0; i < count; i++) parts.push(spawn(true));
    }

    var t = 0;
    function frame() {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.x += Math.sin(t * 0.8 + p.phase) * p.sway;
        p.y += p.vy;
        p.rot += p.rotV;

        if (p.y > h + 12) { Object.assign(p, spawn(false)); }
        if (p.x < -12) p.x = w + 10;
        if (p.x > w + 12) p.x = -10;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.leaf) {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.r * 1.7, p.r * 0.75, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      requestAnimationFrame(frame);
    }

    window.addEventListener('resize', resize);
    resize();
    if (reduceMotion) {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      frame();
    }
  })();

  // ========================================================================
  // 3. FRAMING VINES — grow with scroll, bloom at milestones
  // ========================================================================
  var vineApi = { setProgress: function () {} };
  (function framingVines() {
    var svgL = document.getElementById('vineLeft');
    var svgR = document.getElementById('vineRight');
    if (!svgL || !svgR) return;

    var NS = 'http://www.w3.org/2000/svg';
    var stems = [];

    function buildVine(svg, phase) {
      svg.innerHTML = '';
      var H = window.innerHeight;
      var W = 130;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

      var pts = [];
      var step = 90;
      for (var y = H + 20, i = 0; y > -40; y -= step, i++) {
        pts.push({ x: 62 + Math.sin(i * 0.85 + phase) * 34, y: y });
      }

      var d = 'M ' + pts[0].x + ' ' + pts[0].y;
      for (var i = 1; i < pts.length; i++) {
        var p0 = pts[i - 1], p1 = pts[i];
        var my = (p0.y + p1.y) / 2;
        d += ' C ' + p0.x + ' ' + my + ', ' + p1.x + ' ' + my + ', ' + p1.x + ' ' + p1.y;
      }

      var stem = document.createElementNS(NS, 'path');
      stem.setAttribute('d', d);
      stem.setAttribute('class', 'vine-path');
      svg.appendChild(stem);

      var core = document.createElementNS(NS, 'path');
      core.setAttribute('d', d);
      core.setAttribute('class', 'vine-path-core');
      svg.appendChild(core);

      // Leaves sprouting along the stem — varied silhouette, tone and breeze
      for (var i = 1; i < pts.length - 1; i += 2) {
        var side = i % 4 === 1 ? 1 : -1;
        var g = document.createElementNS(NS, 'g');
        g.setAttribute('class', 'vine-leaf-g');

        var lx = pts[i].x + side * 12;
        var ly = pts[i].y - 10;
        var rot = side * (26 + (i % 3) * 9);

        var leaf = document.createElementNS(NS, 'path');
        leaf.setAttribute('d', pickLeafShape()(side));
        leaf.setAttribute('transform', 'translate(' + lx + ' ' + ly + ') rotate(' + rot + ')');
        leaf.setAttribute('class', 'vine-leaf');
        leaf.setAttribute('fill', pickLeafTone());
        g.appendChild(leaf);

        var vein = document.createElementNS(NS, 'path');
        vein.setAttribute('d', 'M ' + (pts[i].x + side * 6) + ' ' + ly + ' L ' + (pts[i].x + side * 26) + ' ' + ly);
        vein.setAttribute('transform', 'rotate(' + (rot * 0.6) + ' ' + lx + ' ' + ly + ')');
        vein.setAttribute('class', 'vine-leaf-vein');
        g.appendChild(vein);
        svg.appendChild(g);
      }

      // Milestone flowers (bloom at scroll thresholds)
      var flowerFractions = [0.2, 0.45, 0.7, 0.92];
      var flowers = [];
      flowerFractions.forEach(function (fr, idx) {
        var pi = Math.min(pts.length - 1, Math.max(0, Math.round((1 - fr) * (pts.length - 1))));
        var anchor = pts[pi];
        var g = document.createElementNS(NS, 'g');
        g.setAttribute('class', 'vine-flower');
        var petalColor = idx % 2 === 0 ? C.bloomHawthorn : C.bloomBell;
        for (var k = 0; k < 5; k++) {
          var a = (k / 5) * Math.PI * 2;
          var petal = document.createElementNS(NS, 'circle');
          petal.setAttribute('cx', anchor.x + Math.cos(a) * 7 + 20);
          petal.setAttribute('cy', anchor.y + Math.sin(a) * 7);
          petal.setAttribute('r', 4.4);
          petal.setAttribute('fill', petalColor);
          g.appendChild(petal);
        }
        var heart = document.createElementNS(NS, 'circle');
        heart.setAttribute('cx', anchor.x + 20);
        heart.setAttribute('cy', anchor.y);
        heart.setAttribute('r', 3.4);
        heart.setAttribute('fill', C.bloomSun);
        g.appendChild(heart);
        svg.appendChild(g);
        flowers.push({ el: g, at: fr });
      });

      var len = stem.getTotalLength();
      [stem, core].forEach(function (p) {
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = len;
      });

      return { stem: stem, core: core, len: len, flowers: flowers };
    }

    function rebuild() {
      stems = [buildVine(svgL, 0), buildVine(svgR, 1.7)];
      vineApi.setProgress(lastProgress);
    }

    var lastProgress = 0.12;
    vineApi.setProgress = function (p) {
      lastProgress = p;
      stems.forEach(function (v) {
        v.stem.style.strokeDashoffset = v.len * (1 - p);
        v.core.style.strokeDashoffset = v.len * (1 - p);
        v.flowers.forEach(function (f) {
          f.el.classList.toggle('bloomed', p >= f.at);
        });
      });
    };

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(rebuild, 200);
    });

    rebuild();
  })();

  // ========================================================================
  // 4. SCROLL-DRIVEN GROWTH + STAGGERED STONE SETTLING
  // ========================================================================
  (function scrollGrowth() {
    var ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var p = max > 0 ? window.scrollY / max : 1;
        p = Math.min(1, Math.max(0.12, 0.12 + p * 0.88));
        vineApi.setProgress(p);
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Staggered entrances: heavy cut stones laid into wet moss
    var settlers = document.querySelectorAll('.settle');
    if ('IntersectionObserver' in window && !reduceMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var siblings = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
            el.style.setProperty('--d', Math.min(siblings, 6) * 95 + 'ms');
            el.classList.add('settled');
            io.unobserve(el);
          }
        });
      }, { threshold: 0.12 });
      settlers.forEach(function (el) { io.observe(el); });
    } else {
      settlers.forEach(function (el) { el.classList.add('settled'); });
    }
  })();

  // ========================================================================
  // 5. CUSTOM ASTROLABE CROSSHAIR
  // ========================================================================
  (function crosshair() {
    var core = document.getElementById('cursorCore');
    var ring = document.getElementById('cursorRing');
    if (!core || !ring || !finePointer || reduceMotion) return;

    ring.classList.remove('hidden');

    var rx = -100, ry = -100;
    var rotation = 0;
    var hoverExtra = 0;
    var hovering = false;
    var lastT = performance.now();

    var INTERACTIVE = 'a, button, .quest-btn, .tone-pill, .sound-card-item, input, select, label, .rail-mode-item, [data-cursor]';

    document.addEventListener('pointerover', function (e) {
      hovering = !!(e.target.closest && e.target.closest(INTERACTIVE));
      ring.classList.toggle('hovering', hovering);
    });

    document.addEventListener('pointerdown', function () { ring.classList.add('clicked'); });
    document.addEventListener('pointerup', function () { ring.classList.remove('clicked'); });
    document.addEventListener('mouseleave', function () {
      core.classList.remove('cursor-visible');
      ring.classList.remove('cursor-visible');
    });
    document.addEventListener('mouseenter', function () {
      core.classList.add('cursor-visible');
      ring.classList.add('cursor-visible');
    });

    function frame(t) {
      var dt = Math.min(64, t - lastT);
      lastT = t;

      if (mouse.inside) {
        core.classList.add('cursor-visible');
        ring.classList.add('cursor-visible');
      }

      // Inner seed: locked 1:1 to the cursor
      core.style.transform = 'translate3d(' + mouse.x + 'px,' + mouse.y + 'px,0) rotate(45deg)';

      // Outer brass ring: spring-lerped trail + slow 15deg/s astrolabe rotation
      rx += (mouse.x - rx) * 0.18;
      ry += (mouse.y - ry) * 0.18;
      rotation += (15 * dt) / 1000;
      var targetExtra = hovering ? 45 : 0;
      hoverExtra += (targetExtra - hoverExtra) * 0.2;

      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0) rotate(' + (rotation + hoverExtra) + 'deg)';
      requestAnimationFrame(frame);
    }

    core.classList.add('cursor-visible');
    ring.classList.add('cursor-visible');
    requestAnimationFrame(frame);
  })();

  // ========================================================================
  // 6. LEAF SPROUTS, MOSS CLUSTERS & POLLEN BURSTS
  // ========================================================================
  (function botanicals() {
    var NS = 'http://www.w3.org/2000/svg';

    function leafSVG(variant) {
      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '0 0 30 30');
      var p1 = document.createElementNS(NS, 'path');
      p1.setAttribute('d', (LEAF_SHAPES[variant % LEAF_SHAPES.length])(1));
      p1.setAttribute('transform', 'translate(4 25) rotate(-48)');
      p1.setAttribute('class', 'sprout-leaf');
      p1.setAttribute('fill', LEAF_TONES[(variant * 3) % LEAF_TONES.length]);
      svg.appendChild(p1);
      var p2 = document.createElementNS(NS, 'path');
      p2.setAttribute('d', 'M8 22 C12 16 18 10 23 8');
      p2.setAttribute('class', 'sprout-vein');
      svg.appendChild(p2);
      return svg;
    }

    var sproutSeq = 0;
    document.querySelectorAll('.stone-btn').forEach(function (btn) {
      var tl = document.createElement('span');
      tl.className = 'sprout sprout-tl';
      tl.setAttribute('aria-hidden', 'true');
      tl.appendChild(leafSVG(sproutSeq++));
      var br = document.createElement('span');
      br.className = 'sprout sprout-br';
      br.setAttribute('aria-hidden', 'true');
      br.appendChild(leafSVG(sproutSeq++));
      btn.appendChild(tl);
      btn.appendChild(br);

      // Overgrowth wipe enters from the side the cursor arrived from
      btn.addEventListener('pointerenter', function (e) {
        var r = btn.getBoundingClientRect();
        btn.classList.toggle('wipe-r', (e.clientX - r.left) / r.width > 0.5);
      });
    });

    var mossFlowerSeq = 0;
    function mossClusterSVG() {
      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '0 0 46 46');
      var blobs = [
        { cx: 10, cy: 10, r: 8, cls: 'moss-blob' },
        { cx: 22, cy: 7, r: 5.5, cls: 'moss-blob-lit' },
        { cx: 7, cy: 22, r: 5, cls: 'moss-blob' },
        { cx: 19, cy: 17, r: 3.5, cls: 'moss-blob-lit' }
      ];
      blobs.forEach(function (b) {
        var c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', b.cx);
        c.setAttribute('cy', b.cy);
        c.setAttribute('r', b.r);
        c.setAttribute('class', b.cls);
        svg.appendChild(c);
      });
      var leaf = document.createElementNS(NS, 'path');
      leaf.setAttribute('d', pickLeafShape()(1));
      leaf.setAttribute('transform', 'translate(12 24) rotate(-30)');
      leaf.setAttribute('class', 'moss-leaf');
      leaf.setAttribute('fill', pickLeafTone());
      svg.appendChild(leaf);

      // Rare discovery: a tiny wildflower grows beside roughly one cluster
      // in four — ivory or muted blush, never confetti
      mossFlowerSeq += 1;
      if (mossFlowerSeq % 4 === 1) {
        var fx = 28, fy = 22;
        var petalColor = mossFlowerSeq % 8 === 1 ? C.botanicIvory : C.botanicBlush;
        for (var k = 0; k < 5; k++) {
          var a = (k / 5) * Math.PI * 2 - Math.PI / 2;
          var petal = document.createElementNS(NS, 'circle');
          petal.setAttribute('cx', (fx + Math.cos(a) * 2.6).toFixed(1));
          petal.setAttribute('cy', (fy + Math.sin(a) * 2.6).toFixed(1));
          petal.setAttribute('r', 1.7);
          petal.setAttribute('fill', petalColor);
          svg.appendChild(petal);
        }
        var heart = document.createElementNS(NS, 'circle');
        heart.setAttribute('cx', fx);
        heart.setAttribute('cy', fy);
        heart.setAttribute('r', 1.3);
        heart.setAttribute('fill', C.botanicOchre);
        svg.appendChild(heart);
      }
      return svg;
    }

    document.querySelectorAll('.moss-corners').forEach(function (host) {
      host.style.position = host.style.position || 'relative';
      var tl = document.createElement('span');
      tl.className = 'moss-cluster tl';
      tl.setAttribute('aria-hidden', 'true');
      tl.appendChild(mossClusterSVG());
      var br = document.createElement('span');
      br.className = 'moss-cluster br';
      br.setAttribute('aria-hidden', 'true');
      br.appendChild(mossClusterSVG());
      host.appendChild(tl);
      host.appendChild(br);
    });
  })();

  // ========================================================================
  // 7. WET-STONE 3D TILT & SPECULAR SHINE STRIP
  // ========================================================================
  (function tiltAndShine() {
    if (!finePointer || reduceMotion) return;

    document.querySelectorAll('.tilt').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        if (!card.classList.contains('settled') && card.classList.contains('settle')) return;
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        var ry = (px - 0.5) * 8;   // max 4deg
        var rx = (0.5 - py) * 8;
        card.style.transform = 'perspective(800px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
        card.style.setProperty('--shine-x', (px * r.width * 2.4 - r.width * 0.2).toFixed(0) + 'px');
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.setProperty('--shine-x', '0px');
      });
    });

    // Shine strip also glides on any glass card hover
    document.querySelectorAll('.glass-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        card.style.setProperty('--shine-x', (px * r.width * 2.4 - r.width * 0.2).toFixed(0) + 'px');
      });
      card.addEventListener('mouseleave', function () {
        card.style.setProperty('--shine-x', '0px');
      });
    });
  })();

  // ========================================================================
  // 8. RIPPLE TRANSITION RITUALS (WebGL organic liquid refractive wavefront)
  //    Replaces the legacy veiny vine curtains across the site.
  // ========================================================================
  var ritual = (function () {
    function sweep(midCb, doneCb, e) {
      var origin = [0.5, 0.5];
      if (e && e.clientX != null && window.innerWidth > 0 && window.innerHeight > 0) {
        origin = [
          Math.max(0.05, Math.min(0.95, e.clientX / window.innerWidth)),
          Math.max(0.05, Math.min(0.95, e.clientY / window.innerHeight))
        ];
      }

      if (reduceMotion) {
        if (midCb) midCb();
        if (doneCb) doneCb();
        return;
      }

      if (window.RippleTransition) {
        window.RippleTransition.transition({
          origin: origin,
          duration: 1400,
          midCb: function () {
            if (window.BastionAnchorVines) window.BastionAnchorVines.reveal(true);
            if (midCb) midCb();
          },
          doneCb: function () {
            if (window.BastionAnchorVines) window.BastionAnchorVines.reveal(false);
            if (doneCb) doneCb();
          }
        });
      } else {
        if (midCb) midCb();
        if (doneCb) doneCb();
      }
    }

    return {
      sweep: sweep,
      isBusy: function () {
        return window.RippleTransition ? window.RippleTransition.isBusy() : false;
      }
    };
  })();

  window.BastionRitual = ritual;

  // Nav link clicks: expanding liquid ripple blooms from the clicked item
  document.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) !== '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      if (reduceMotion) {
        target.scrollIntoView({ behavior: 'auto' });
        return;
      }
      ritual.sweep(function () {
        target.scrollIntoView({ behavior: 'smooth' });
      }, null, e);
    });
  });


  // ========================================================================
  // 9. PROXIMITY FLORA — a few chosen leaves tilt as the cursor draws near.
  //    Localized (150px radius), restrained (max ~7°), eased by CSS, and
  //    completely silent when the pointer rests. The background never
  //    reacts; only these few leaves do.
  // ========================================================================
  (function leafBreeze() {
    if (reduceMotion) return;
    var leaves = [];
    var rectsDirty = true;

    function collect() {
      leaves = [];
      document.querySelectorAll('.vine-leaf-g').forEach(function (el) {
        leaves.push({ el: el, shown: 0, tx: 0, ty: 0 });
      });
      rectsDirty = true;
    }

    function measure() {
      for (var i = 0; i < leaves.length; i++) {
        var r = leaves[i].el.getBoundingClientRect();
        leaves[i].tx = r.left + r.width / 2;
        leaves[i].ty = r.top + r.height / 2;
      }
      rectsDirty = false;
    }

    // React directly to the pointer — immediate, and independent of the
    // render loop. The CSS transition on .vine-leaf-g eases each step.
    document.addEventListener('mousemove', function (e) {
      // vines rebuild themselves on resize; re-collect if our refs are stale
      if (!leaves.length || !document.contains(leaves[0].el)) collect();
      if (!leaves.length) return;
      if (rectsDirty) measure();
      for (var i = 0; i < leaves.length; i++) {
        var L = leaves[i];
        var dx = L.tx - e.clientX, dy = L.ty - e.clientY;
        var d = Math.sqrt(dx * dx + dy * dy);
        var target = 0;
        if (d < 150 && d > 0.01) {
          // the leaf leans away as the gaze brushes past it
          target = (dx > 0 ? 1 : -1) * (1 - d / 150) * 7;
        }
        var shown = Math.round(target * 10) / 10;
        if (shown !== L.shown) {
          L.shown = shown;
          L.el.style.transform = shown ? 'rotate(' + shown + 'deg)' : '';
        }
      }
    }, { passive: true });

    document.addEventListener('scroll', function () { rectsDirty = true; }, { passive: true });
    window.addEventListener('resize', collect);

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', collect);
    } else {
      collect();
    }
  })();

  // ========================================================================
  // 10. SANCTUARY FOCUS STATE — the world settles while a session runs.
  //     Derived strictly from real state: the dial's own 'running' class,
  //     toggled by the application only while a session is actually live.
  // ========================================================================
  (function focusState() {
    var dial = document.getElementById('focusTimerDial');
    if (!dial) return;
    function sync() {
      document.body.classList.toggle('focusing', dial.classList.contains('running'));
    }
    new MutationObserver(sync).observe(dial, { attributes: true, attributeFilter: ['class'] });
    sync();
  })();

  // ========================================================================
  // 11. THE GARDEN — real state, made visible and persistent.
  //     Every plant on the ledge is derived from actual application state:
  //       · one moss bed per focus session the timer REALLY completed
  //       · one fern per side quest currently checked off
  //     Saved to localStorage and restored on every load. Unchecking a
  //     quest withers its fern, because the state that grew it is gone.
  //     No fake growth, no streaks, no rewards — the garden simply
  //     remembers what actually happened.
  // ========================================================================
  (function bastionGarden() {
    var KEY = 'bastion_garden_v1';
    var ledge = document.getElementById('bastionGarden');
    if (!ledge) return;
    var caption = document.getElementById('gardenCaption');
    var MOSS_CAP = 24;

    var state = { sessions: 0, quests: [] };
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          state.sessions = Math.max(0, parseInt(parsed.sessions, 10) || 0);
          state.quests = Array.isArray(parsed.quests)
            ? parsed.quests.filter(function (q) { return typeof q === 'string' && q.length; })
            : [];
        }
      }
    } catch (e) { /* storage unavailable: the session starts from bare stone */ }

    function save() {
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    }

    /* Deterministic placement: the same history always grows in the same
       spots — yesterday's moss stays exactly where it settled. */
    function mossLeft(i) { return 3 + ((i * 37) % 78); }
    function fernLeft(j) { return 8 + ((j * 29) % 72); }

    var MOSS_TONES = ['#3B6440', '#33593A', '#2C4F33', '#416B45'];
    var FROND_DARK = '#3E6B39';
    var FROND_LIT = '#54873F';

    // An irregular mound of moss — it grows along the stone, never a circle
    function makeMoss(i) {
      var el = document.createElement('span');
      el.className = 'garden-moss';
      el.style.left = mossLeft(i) + '%';
      var tone = MOSS_TONES[i % MOSS_TONES.length];
      var lit = MOSS_TONES[(i + 3) % MOSS_TONES.length];
      var span = 20 + (i % 4) * 6;
      var steps = 4 + (i % 3);
      var d = 'M 0 18';
      for (var k = 1; k <= steps; k++) {
        var x = (span * k) / steps;
        var bump = (i + k * 3) % 4;
        d += ' Q ' + (x - span / steps / 2).toFixed(1) + ' ' + (9.5 - bump * 1.4).toFixed(1) +
             ' ' + x.toFixed(1) + ' ' + (13 + ((i + k) % 3)) + ' ';
      }
      d += 'L ' + span + ' 21 L 0 21 Z';
      el.innerHTML =
        '<svg width="' + (span + 4) + '" height="22" viewBox="0 0 ' + (span + 4) + ' 22">' +
        '<path d="' + d + '" fill="' + tone + '" transform="translate(2 0)"/>' +
        '<circle cx="' + (span * 0.3 + 2).toFixed(1) + '" cy="' + (10.5 - (i % 3)) + '" r="1.5" fill="' + lit + '" opacity="0.9"/>' +
        '<circle cx="' + (span * 0.72 + 2).toFixed(1) + '" cy="' + (11.5 - ((i + 2) % 3)) + '" r="1.2" fill="' + lit + '" opacity="0.7"/>' +
        '<path d="M ' + (span * 0.45 + 2).toFixed(1) + ' 12 q 1 -4 0 -6.6" stroke="' + FROND_LIT + '" stroke-width="1" fill="none" stroke-linecap="round"/>' +
        '<path d="M ' + (span * 0.62 + 2).toFixed(1) + ' 13 q -1 -3.2 0.4 -5.2" stroke="' + FROND_DARK + '" stroke-width="1" fill="none" stroke-linecap="round"/>' +
        '</svg>';
      return el;
    }

    // A tiny fern: curved stem, alternating leaflets, one lit crozier tip
    function makeFern(seq, name) {
      var el = document.createElement('span');
      el.className = 'garden-fern';
      el.style.left = fernLeft(seq) + '%';
      el.title = 'Grown by finishing: ' + name;
      var lean = seq % 2 === 0 ? 1 : -1;
      var leaflets = '';
      for (var k = 0; k < 5; k++) {
        var y = 26 - k * 4.6;
        var sx = 13 + (26 - y) * 0.09 * lean;
        var size = 5.2 - k * 0.7;
        leaflets +=
          '<ellipse cx="' + (sx - size * 0.62).toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="' + size.toFixed(1) + '" ry="1.6"' +
          ' transform="rotate(28 ' + (sx - size * 0.62).toFixed(1) + ' ' + y.toFixed(1) + ')" fill="' + FROND_DARK + '"/>' +
          '<ellipse cx="' + (sx + size * 0.62).toFixed(1) + '" cy="' + (y - 1.6).toFixed(1) + '" rx="' + size.toFixed(1) + '" ry="1.6"' +
          ' transform="rotate(-28 ' + (sx + size * 0.62).toFixed(1) + ' ' + (y - 1.6).toFixed(1) + ')" fill="' + FROND_LIT + '"/>';
      }
      el.innerHTML =
        '<svg width="26" height="34" viewBox="0 0 26 34">' +
        '<path d="M 13 34 C ' + (13 + 1.4 * lean) + ' 24 ' + (13 + 2.4 * lean) + ' 14 ' + (13 + 3 * lean) + ' 7"' +
        ' stroke="' + FROND_DARK + '" stroke-width="1.5" fill="none" stroke-linecap="round"/>' +
        leaflets +
        '<path d="M ' + (13 + 3 * lean) + ' 7 q ' + (1.7 * lean) + ' -2.2 0.4 -4.2" stroke="' + FROND_LIT + '" stroke-width="1.2" fill="none" stroke-linecap="round"/>' +
        '</svg>';
      return el;
    }

    var mossEls = [];
    var fernEls = {};
    var fernSeq = 0;

    function addMoss(animate) {
      if (mossEls.length >= MOSS_CAP) return;
      var el = makeMoss(mossEls.length);
      if (animate && !reduceMotion) el.classList.add('unfurl');
      ledge.appendChild(el);
      mossEls.push(el);
    }

    function addFern(name, animate) {
      var el = makeFern(fernSeq++, name);
      if (animate && !reduceMotion) el.classList.add('unfurl');
      ledge.appendChild(el);
      fernEls[name] = el;
    }

    function removeFern(name) {
      var el = fernEls[name];
      if (!el) return;
      delete fernEls[name];
      el.classList.add('wither');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 500);
    }

    function updateCaption() {
      if (!caption) return;
      var s = state.sessions, q = state.quests.length;
      if (!s && !q) { caption.textContent = 'bare stone — finish a session'; return; }
      var parts = [];
      if (s) parts.push(s + ' session' + (s === 1 ? '' : 's'));
      if (q) parts.push(q + ' fern' + (q === 1 ? '' : 's'));
      caption.textContent = parts.join(' · ');
    }

    // ---- Restore: growth appears exactly as the persisted state describes
    for (var i = 0; i < Math.min(state.sessions, MOSS_CAP); i++) addMoss(false);

    var chips = document.querySelectorAll('.quest-btn');
    function questName(chip) {
      return (chip.textContent || '').replace(/^\u2713\s*/, '').trim();
    }

    // The checklist and the garden share one truth: checked chips restored
    chips.forEach(function (chip) {
      if (!chip.classList.contains('quest-done') && state.quests.indexOf(questName(chip)) !== -1) {
        chip.classList.add('quest-done');
        chip.innerHTML = '\u2713 ' + chip.innerHTML;
      }
    });
    state.quests.forEach(function (name) { addFern(name, false); });
    fernSeq = state.quests.length;

    // ---- Watch the REAL state from here on
    // Checked → a fern grows and stays; unchecked → it withers, because
    // the state that grew it no longer exists.
    chips.forEach(function (chip) {
      new MutationObserver(function () {
        var name = questName(chip);
        var done = chip.classList.contains('quest-done');
        var idx = state.quests.indexOf(name);
        if (done && idx === -1) {
          state.quests.push(name);
          save();
          addFern(name, true);
          updateCaption();
        } else if (!done && idx !== -1) {
          state.quests.splice(idx, 1);
          save();
          removeFern(name);
          updateCaption();
        }
      }).observe(chip, { attributes: true, attributeFilter: ['class'] });
    });

    // Focus sessions: growth only when the timer REALLY completes — the
    // dial's state text is set by the application on true completion.
    var stateText = document.getElementById('focusTimerStateText');
    if (stateText) {
      var lastText = (stateText.textContent || '').trim().toUpperCase();
      new MutationObserver(function () {
        var now = (stateText.textContent || '').trim().toUpperCase();
        if (now === lastText) return;
        if (now === 'COMPLETED!') {
          state.sessions += 1;
          save();
          addMoss(true);
          updateCaption();
        }
        lastText = now;
      }).observe(stateText, { childList: true, characterData: true, subtree: true });
    }

    updateCaption();
    // Public face of the garden. note(name, on) lets features beyond the
    // old checklist — the roulette's adventures — earn their growth through
    // the same single truth: same state, same save, same fern lifecycle.
    window.BastionGarden = {
      state: state,
      note: function (name, on) {
        if (typeof name !== 'string' || !name) return;
        var idx = state.quests.indexOf(name);
        if (on && idx === -1) {
          state.quests.push(name);
          save();
          addFern(name, true);
          updateCaption();
        } else if (!on && idx !== -1) {
          state.quests.splice(idx, 1);
          save();
          removeFern(name);
          updateCaption();
        }
      }
    };
  })();

  // ========================================================================
  // 12. ANCHOR VINES — reusable sprigs rooted at believable seams
  //     One small builder, several plantings: ends of the wooden plank,
  //     the garden ledge, the footer line. The leaves carry the
  //     .vine-leaf-g class, so the proximity tilt (section 9) reaches
  //     them for free; the buds open while a page transition sweeps.
  // ========================================================================
  (function anchorVines() {
    var NS = 'http://www.w3.org/2000/svg';

    // opts: { cls, w, h, stem, leaves:[{x,y,s,r,flower}], seed }
    function build(o) {
      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'anchor-vine ' + o.cls);
      svg.setAttribute('viewBox', '0 0 ' + o.w + ' ' + o.h);
      svg.setAttribute('aria-hidden', 'true');
      svg.style.width = o.w + 'px';
      svg.style.height = o.h + 'px';
      svg.style.setProperty('--breeze-dur', (7 + ((o.seed * 1.3) % 4.5)).toFixed(1) + 's');
      svg.style.setProperty('--breeze-delay', '-' + ((o.seed * 2.1) % 7).toFixed(1) + 's');

      var stem = document.createElementNS(NS, 'path');
      stem.setAttribute('d', o.stem);
      stem.setAttribute('class', 'vine-path');
      svg.appendChild(stem);
      var core = document.createElementNS(NS, 'path');
      core.setAttribute('d', o.stem);
      core.setAttribute('class', 'vine-path-core');
      svg.appendChild(core);

      o.leaves.forEach(function (L, i) {
        var g = document.createElementNS(NS, 'g');
        g.setAttribute('class', 'vine-leaf-g');
        var leaf = document.createElementNS(NS, 'path');
        leaf.setAttribute('d', pickLeafShape()(L.s));
        leaf.setAttribute('transform', 'translate(' + L.x + ' ' + L.y + ') rotate(' + (L.s * L.r) + ')');
        leaf.setAttribute('class', 'vine-leaf');
        leaf.setAttribute('fill', pickLeafTone());
        g.appendChild(leaf);
        var vein = document.createElementNS(NS, 'path');
        vein.setAttribute('d', 'M ' + L.x + ' ' + L.y + ' L ' + (L.x + L.s * 13) + ' ' + L.y);
        vein.setAttribute('transform', 'rotate(' + (L.s * L.r * 0.6) + ' ' + L.x + ' ' + L.y + ')');
        vein.setAttribute('class', 'vine-leaf-vein');
        g.appendChild(vein);
        svg.appendChild(g);

        if (L.flower) {
          var fg = document.createElementNS(NS, 'g');
          fg.setAttribute('class', 'vine-flower');
          var petal = i % 2 === 0 ? C.bloomHawthorn : C.bloomBell;
          for (var k = 0; k < 5; k++) {
            var a = (k / 5) * Math.PI * 2;
            var pc = document.createElementNS(NS, 'circle');
            pc.setAttribute('cx', (L.x + Math.cos(a) * 3.2).toFixed(1));
            pc.setAttribute('cy', (L.y + Math.sin(a) * 3.2).toFixed(1));
            pc.setAttribute('r', '2.1');
            pc.setAttribute('fill', petal);
            fg.appendChild(pc);
          }
          var cc = document.createElementNS(NS, 'circle');
          cc.setAttribute('cx', L.x);
          cc.setAttribute('cy', L.y);
          cc.setAttribute('r', '1.5');
          cc.setAttribute('fill', C.botanicOchre);
          fg.appendChild(cc);
          svg.appendChild(fg);
        }
      });
      return svg;
    }

    // Plantings — each sprig grows from a corner or seam that could
    // realistically hold damp: the plank's mitred ends, the ledge corners
    var PLANTINGS = [
      { host: '.bastion-nav', cls: 'root-hang-l', w: 70, h: 64, seed: 1,
        stem: 'M 10 0 C 4 12, 16 22, 10 34 C 5 44, 13 54, 8 63',
        leaves: [
          { x: 9, y: 10, s: -1, r: 26 },
          { x: 15, y: 24, s: 1, r: 30 },
          { x: 8, y: 38, s: -1, r: 24, flower: true },
          { x: 11, y: 54, s: 1, r: 28 }
        ] },
      { host: '.bastion-nav', cls: 'root-hang-r', w: 70, h: 64, seed: 4,
        stem: 'M 60 0 C 66 12, 54 22, 60 34 C 65 44, 57 54, 62 63',
        leaves: [
          { x: 61, y: 10, s: 1, r: 26 },
          { x: 55, y: 24, s: -1, r: 30 },
          { x: 62, y: 38, s: 1, r: 24, flower: true },
          { x: 59, y: 54, s: -1, r: 28 }
        ] },
      { host: '#bastionGarden', cls: 'root-bl', w: 150, h: 42, seed: 7,
        stem: 'M 0 40 C 18 38, 30 32, 48 30 C 72 27, 92 30, 112 24 C 126 20, 136 14, 146 6',
        leaves: [
          { x: 30, y: 32, s: -1, r: 26 },
          { x: 62, y: 29, s: 1, r: 30, flower: true },
          { x: 96, y: 28, s: -1, r: 24 },
          { x: 128, y: 13, s: 1, r: 30 }
        ] },
      { host: '#bastionGarden', cls: 'root-br', w: 130, h: 40, seed: 10,
        stem: 'M 130 38 C 112 36, 100 31, 82 29 C 60 26, 42 29, 24 23 C 14 19, 8 13, 2 6',
        leaves: [
          { x: 100, y: 31, s: 1, r: 26 },
          { x: 70, y: 28, s: -1, r: 30, flower: true },
          { x: 38, y: 26, s: 1, r: 24 },
          { x: 12, y: 12, s: -1, r: 30 }
        ] }
    ];

    function plant() {
      PLANTINGS.forEach(function (p) {
        var host = document.querySelector(p.host);
        if (!host || host.querySelector(':scope > .anchor-vine.' + p.cls.split(' ')[0])) return;
        host.appendChild(build(p));
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', plant);
    } else {
      plant();
    }

    // Buds open while a page transition sweeps through, then close again
    window.BastionAnchorVines = {
      reveal: function (on) {
        document.querySelectorAll('.anchor-vine').forEach(function (v) {
          v.classList.toggle('revealing', !!on);
        });
      }
    };
  })();

  // ========================================================================
  // 13. MAGNETIC DOCK — the plank's links behave like a physical dock:
  //     each item swells and lifts as the cursor approaches, peaks under
  //     the nearest neighbour, and settles back with a restrained return
  //     when the cursor leaves. Mouse only — touch is left alone; the
  //     keyboard gets the same quiet pop on focus; reduced motion gets
  //     stillness (the module never arms).
  // ========================================================================
  (function magneticDock() {
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // opts: { radius, peak (max extra scale), lift (max px), vBias }
    function arm(row, opts) {
      if (!row || row.getAttribute('data-dock')) return;
      row.setAttribute('data-dock', '1');
      row.classList.add('magnetic-row');
      var items = Array.prototype.slice.call(row.children);
      var rects = [];
      var active = false;

      function measure() {
        rects = items.map(function (el) {
          var r = el.getBoundingClientRect();
          return { el: el, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
        });
      }

      function paint(x, y) {
        for (var i = 0; i < rects.length; i++) {
          var it = rects[i];
          var dx = x - it.cx;
          var dy = (y - it.cy) * (opts.vBias || 1);
          var d = Math.sqrt(dx * dx + dy * dy);
          var t = Math.max(0, 1 - d / opts.radius);
          t = t * t * (3 - 2 * t); // smoothstep — dock-like falloff
          it.el.style.setProperty('--dock-s', (1 + opts.peak * t).toFixed(3));
          it.el.style.setProperty('--dock-y', (-opts.lift * t).toFixed(2) + 'px');
        }
      }

      function settle() {
        if (!active) return;
        active = false;
        row.classList.add('dock-settle');
        items.forEach(function (el) {
          el.style.removeProperty('--dock-s');
          el.style.removeProperty('--dock-y');
        });
      }

      if (!reduced) {
        row.addEventListener('pointerenter', function (e) {
          if (e.pointerType && e.pointerType !== 'mouse') return;
          active = true;
          row.classList.remove('dock-settle');
          measure();
          paint(e.clientX, e.clientY);
        });
        row.addEventListener('pointermove', function (e) {
          if (!active || (e.pointerType && e.pointerType !== 'mouse')) return;
          paint(e.clientX, e.clientY);
        }, { passive: true });
        row.addEventListener('pointerleave', settle);
        row.addEventListener('pointercancel', settle);
        window.addEventListener('resize', function () { if (active) measure(); });
        window.addEventListener('scroll', function () { if (active) measure(); }, { passive: true });
      }

      // keyboard: the same quiet pop on focus, no pointer math
      items.forEach(function (el) {
        el.addEventListener('focus', function () {
          el.style.setProperty('--dock-s', (1 + opts.peak * 0.4).toFixed(3));
          el.style.setProperty('--dock-y', (-opts.lift * 0.4).toFixed(2) + 'px');
        });
        el.addEventListener('blur', function () {
          el.style.removeProperty('--dock-s');
          el.style.removeProperty('--dock-y');
        });
      });
    }

    function plant() {
      document.querySelectorAll('.nav-links').forEach(function (r) {
        arm(r, { radius: 130, peak: 0.22, lift: 7, vBias: 1.6 });
      });
      document.querySelectorAll('.tone-row').forEach(function (r) {
        arm(r, { radius: 110, peak: 0.12, lift: 4, vBias: 1.4 });
      });
      var tiles = document.getElementById('soundTilesContainer');
      if (tiles) arm(tiles, { radius: 120, peak: 0.1, lift: 3, vBias: 1.2 });

      // real-state badge: a brass rivet on "Sound Sanctuary" while the
      // 432Hz soundscape is actually breathing — observed, never faked
      var soundLink = document.querySelector('.nav-link[href="#sounds"]');
      var acousticText = document.getElementById('acousticText');
      if (soundLink && acousticText) {
        var sync = function () {
          soundLink.classList.toggle('has-audio', /on/i.test(acousticText.textContent || ''));
        };
        sync();
        new MutationObserver(sync).observe(acousticText, { childList: true, characterData: true, subtree: true });
      }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', plant);
    else plant();
  })();

  // ========================================================================
  // 14. TEXT ROLL — headings and nav links cascade letter-by-letter on
  //     hover: the original letter rolls up out of a mask while a
  //     duplicate rolls in from below. The stagger radiates outward from
  //     the centre of the text, ~35 ms a step — the vanilla port of the
  //     framer-motion TextRoll idea. Reduced motion keeps letters still.
  // ========================================================================
  (function textRoll() {
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return; // letters simply stay put

    var STAGGER = 0.035; // seconds per step of distance from centre
    var DURATION = 0.5;  // seconds a letter spends rolling

    var TARGETS = '.hero-section h1, .section-head h2, .split-copy h3, .feature-banner h3, .results-head h2, .nav-link';

    function rollable(el) {
      if (!el || el.getAttribute('data-roll')) return;
      el.setAttribute('data-roll', '1');

      var nodes = Array.prototype.slice.call(el.childNodes);
      // build the label from the nodes themselves so <br> line breaks
      // read as spaces ("creation you'll", not "creationyou'll")
      var label = '';
      nodes.forEach(function (node) {
        label += node.nodeType === 3 ? node.nodeValue : ' ';
      });
      el.setAttribute('aria-label', label.replace(/\s+/g, ' ').trim());

      var pairs = [];
      var frag = document.createDocumentFragment();

      function pushChar(ch) {
        var mask = document.createElement('span');
        mask.className = 'roll-char';
        var face = document.createElement('span');
        face.className = 'roll-face';
        face.textContent = ch;
        var dup = document.createElement('span');
        dup.className = 'roll-face roll-dup';
        dup.setAttribute('aria-hidden', 'true');
        dup.textContent = ch;
        mask.appendChild(face);
        mask.appendChild(dup);
        frag.appendChild(mask);
        pairs.push([face, dup]);
      }

      nodes.forEach(function (node) {
        if (node.nodeType === 3) {
          var t = node.nodeValue;
          for (var i = 0; i < t.length; i++) {
            var c = t[i];
            if (c === '\n' || c === '\t' || c === '\r') continue;
            pushChar(c === ' ' ? '\u00A0' : c);
          }
        } else {
          frag.appendChild(node.cloneNode(true)); // <br>, <em>, … keep their shape
        }
      });

      el.textContent = '';
      el.appendChild(frag);

      // centre-out stagger, exactly like the reference implementation
      var n = pairs.length;
      pairs.forEach(function (pair, i) {
        var delay = (STAGGER * Math.abs(i - (n - 1) / 2)).toFixed(3) + 's';
        pair[0].style.transitionDelay = delay;
        pair[1].style.transitionDelay = delay;
      });
    }

    function plant() {
      document.querySelectorAll(TARGETS).forEach(rollable);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', plant);
    else plant();
  })();

  /* =========================================================================
     15. TOUCH THE IRON, RAISE THE LIGHT
     The wall is not a picture. Plaques lean toward the hand that nears
     them — via the `translate` property, so a real press (transform) still
     lands on top — and tablets catch a faint hairline of torchlight as the
     cursor approaches. Everything here moves only when the hand moves
     first, and the lean yields entirely to prefers-reduced-motion while
     the light (which is not motion) stays.
     ========================================================================= */
  (function () {
    var reduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var btns = [].slice.call(document.querySelectorAll('.stone-btn, .btn-ghost, .btn-brass'));
    var slabs = [].slice.call(document.querySelectorAll('.glass-card'));
    if (!btns.length && !slabs.length) return;

    var mx = -1e5, my = -1e5, queued = false;
    var MAGNET = 3.4;      // px of lean at closest reach
    var REACH_PAD = 46;    // px of air around a plaque in which the hand moves it
    var TORCH = 170;       // px radius the torchlight reaches

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      if (!queued) {
        queued = true;
        requestAnimationFrame(respond);
      }
    }, { passive: true });

    function respond() {
      queued = false;
      var i, el, r, dx, dy, d, prox, cur;

      // READ every rect first — one layout pass per frame, then writes
      var btnRects = [];
      for (i = 0; i < btns.length; i++) {
        el = btns[i];
        if (el.disabled || el.classList.contains('is-loading')) { btnRects.push(null); continue; }
        r = el.getBoundingClientRect();
        btnRects.push(
          (r.bottom < -80 || r.top > window.innerHeight + 80 ||
           r.right < -80 || r.left > window.innerWidth + 80) ? null : r
        );
      }
      var slabRects = [];
      for (i = 0; i < slabs.length; i++) {
        r = slabs[i].getBoundingClientRect();
        slabRects.push(
          (r.bottom < -60 || r.top > window.innerHeight + 60) ? null : r
        );
      }

      // WRITE: plaques lean toward the hand
      if (!reduced) {
        for (i = 0; i < btns.length; i++) {
          el = btns[i];
          r = btnRects[i];
          if (!r) { if (el.style.translate) el.style.translate = ''; continue; }
          dx = mx - (r.left + r.width / 2);
          dy = my - (r.top + r.height / 2);
          d = Math.sqrt(dx * dx + dy * dy) || 1;
          var reach = Math.max(r.width, r.height) * 0.5 + REACH_PAD;
          if (d < reach) {
            var pull = (1 - d / reach) * MAGNET;
            el.style.translate =
              ((dx / d) * pull).toFixed(2) + 'px ' + ((dy / d) * pull).toFixed(2) + 'px';
          } else if (el.style.translate) {
            el.style.translate = '';
          }
        }
      }

      // WRITE: tablets catch the light near the cursor
      for (i = 0; i < slabs.length; i++) {
        el = slabs[i];
        r = slabRects[i];
        if (!r) {
          prox = 0;
        } else {
          dx = Math.max(r.left - mx, 0, mx - r.right);
          dy = Math.max(r.top - my, 0, my - r.bottom);
          d = Math.sqrt(dx * dx + dy * dy);
          prox = d < TORCH ? Math.round((1 - d / TORCH) * 20) / 20 : 0;
        }
        cur = parseFloat(el.style.getPropertyValue('--prox'));
        if (cur !== prox) el.style.setProperty('--prox', String(prox));
      }
    }
  })();

  /* =========================================================================
     16. RIPPLE THRESHOLD (Cross-page navigation)
     Crossing between pages uses the WebGL RippleTransition instead of the
     old white airflow fog bands. The liquid ripple washes outward from the
     clicked link across the departing page, and cleanly clears on arrival.
     ========================================================================= */
  (function rippleThreshold() {
    var KEY = 'bastion_ripple_nav';
    var reduce = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var busy = false;

    // Cross-page link clicks
    document.addEventListener('click', function (e) {
      if (reduce || busy) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target === '_blank') return;
      var href = a.getAttribute('href');
      if (!href || !/\.html($|[?#])/.test(href)) return;
      e.preventDefault();
      busy = true;

      var origin = [
        Math.max(0.05, Math.min(0.95, e.clientX / window.innerWidth)),
        Math.max(0.05, Math.min(0.95, e.clientY / window.innerHeight))
      ];

      try {
        sessionStorage.setItem(KEY, JSON.stringify({ x: origin[0], y: origin[1] }));
      } catch (err) { /* private mode */ }

      if (window.RippleTransition) {
        window.RippleTransition.transition({
          origin: origin,
          duration: 1400,
          midCb: function () {
            location.href = href;
          }
        });
      } else {
        location.href = href;
      }
    });

    function arrive() {
      var coords = null;
      try {
        var raw = sessionStorage.getItem(KEY);
        if (raw) {
          coords = JSON.parse(raw);
          sessionStorage.removeItem(KEY);
        }
      } catch (err) { /* private mode */ }

      if (coords && !reduce && window.RippleTransition) {
        window.RippleTransition.arrive({
          origin: [coords.x, coords.y],
          duration: 850
        });
      }
    }

    if (document.readyState === 'complete') arrive();
    else window.addEventListener('load', arrive);
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) arrive();
    });
  })();
})();

