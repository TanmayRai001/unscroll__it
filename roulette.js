/* ============================================================================
   BOREDOM ROULETTE — a twelve-faced stone for the Overgrown Bastion.

   One true dodecahedron, carved from weathered mineral and reclaimed by
   moss. The activity is chosen BEFORE the throw; the stone is then spun
   and drawn toward the exact face that owns it — the face looking up at
   the end IS the result, verified before anything is revealed.

   Geometry:  THREE.DodecahedronGeometry (36 flat triangles) re-woven into
              12 true pentagon faces, each with planar UVs and its own
              canvas-cut texture (number, bevel, moss, grain — solid
              pigments only, never a gradient).
   Materials: MeshStandardMaterial, dark charcoal/basalt per face, matte,
              no metal shine, no emissive anything.
   Motion:    anticipate → multi-axis quaternion tumble → exponential
              decay with late attraction to the target → deliberate
              settle, squash, a leaf kicked on the platform.
   Honesty:   prefers-reduced-motion gets a short controlled turn; a
              dead WebGL context still yields a valid activity; the
              garden grows only from a real "marked done".
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------- 1. THE TWELVE
     The one authoritative list. The die faces, the result panel, the
     garden notes and the card's last-choosing line all read from here. */
  var ACTIVITIES = [
    { title: 'Watch a 5-minute science documentary', desc: 'Discover a fascinating scientific idea through a short documentary.' },
    { title: 'Set a new milestone for any exercise', desc: 'Choose an exercise and set a realistic personal milestone to work toward.' },
    { title: 'Listen to a song from a random country', desc: 'Discover a new musical culture by listening to a song from somewhere in the world.' },
    { title: 'Solve a difficult puzzle', desc: 'Challenge your reasoning with a puzzle that requires patience and creative thinking.' },
    { title: 'Read about an unsolved historical mystery', desc: 'Explore a historical mystery and consider the evidence behind competing explanations.' },
    { title: 'Learn an interesting psychological phenomenon', desc: 'Discover a psychological effect that helps explain how people think and behave.' },
    { title: 'Explore a random location on Google Earth', desc: 'Travel somewhere unexpected and explore its geography, landmarks, and surroundings.' },
    { title: 'Learn 5 words in a new language', desc: 'Pick a language and learn five useful words or expressions.' },
    { title: 'Watch a stand-up comedy clip', desc: 'Take a short break and discover a comedian or performance you have not watched before.' },
    { title: 'Find out how something around you works', desc: 'Choose an everyday object and discover the mechanism or science behind it.' },
    { title: 'Learn about human emotions for 10 minutes', desc: 'Explore how emotions work, what influences them, and how they shape human experiences.' },
    { title: 'Do absolutely nothing for two minutes and see what you think about', desc: 'Take two quiet minutes without a feed, task, or notification. Simply notice your thoughts.' }
  ];

  var STORE_KEY = 'bastion_roulette_v1';
  var R = 1.12;                        // die circumradius
  var REST_Y = R * 0.7947 + 0.005;     // resting height: the face's inradius

  // The chamber only exists on the page that owns it.
  var modal = document.getElementById('rouletteModal');
  if (!modal) return;

  var stageEl = document.getElementById('rouletteStage');
  var canvasEl = document.getElementById('rouletteCanvas');
  var stageNote = document.getElementById('rouletteStageNote');
  var btnEnter = document.getElementById('btnEnterRoulette');
  var btnClose = document.getElementById('btnCloseRoulette');
  var btnRoll = document.getElementById('btnRollStone');
  var rollLabel = document.getElementById('rollStoneLabel');
  var invite = document.getElementById('rouletteInvite');
  var result = document.getElementById('rouletteResult');
  var resultNumber = document.getElementById('resultNumber');
  var resultTitle = document.getElementById('resultTitle');
  var resultDesc = document.getElementById('resultDesc');
  var btnBegin = document.getElementById('btnBeginAdventure');
  var btnMark = document.getElementById('btnMarkDone');
  var btnAgain = document.getElementById('btnRollAgain');
  var doneNote = document.getElementById('rouletteDoneNote');
  var status = document.getElementById('rouletteStatus');
  var lastNoteEl = document.getElementById('rouletteLastNote');

  var reducedMQ = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };

  var engine = null;        // built once, kept for the life of the page
  var enginePromise = null;
  var rolling = false;
  var chosen = -1;          // single source of truth during a roll: index into ACTIVITIES
  var rafId = 0;
  var modalOpen = false;
  var opener = null;
  var anim = null;

  var tmpQ = null;          // scratch quaternions, created once THREE exists
  var tmpV = null;

  /* ---------------------------------------------------------- 2. STATE */
  var state = loadState();

  function loadState() {
    try {
      var parsed = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      return {
        rolls: typeof parsed.rolls === 'number' ? parsed.rolls : 0,
        last: typeof parsed.last === 'number' ? parsed.last : -1,
        done: Array.isArray(parsed.done)
          ? parsed.done.filter(function (n) { return typeof n === 'number' && n >= 0 && n < 12; })
          : []
      };
    } catch (e) {
      return { rolls: 0, last: -1, done: [] };
    }
  }

  function saveState() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  function pickIndex() {
    var a = new Uint32Array(1);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(a);
      return a[0] % 12;
    }
    return Math.floor(Math.random() * 12);
  }

  function bell(freq, dur) {
    if (window.playBellChime) window.playBellChime(freq, dur);
  }

  function syncLastNote() {
    if (!lastNoteEl) return;
    if (state.last >= 0 && ACTIVITIES[state.last]) {
      var t = ACTIVITIES[state.last].title;
      lastNoteEl.textContent = t.length > 30 ? t.slice(0, 29) + '…' : t;
    }
  }
  syncLastNote();

  /* ------------------------------------------------- 3. THE STONE ENGINE */
  function canWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  }

  var THREE_MIRRORS = [
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js',
    'https://unpkg.com/three@0.128.0/build/three.min.js'
  ];

  function loadThree() {
    return new Promise(function (resolve, reject) {
      if (window.THREE) { resolve(); return; }
      var i = 0;
      function attempt() {
        if (i >= THREE_MIRRORS.length) { reject(new Error('three.js unreachable')); return; }
        var s = document.createElement('script');
        var to = setTimeout(function () { cleanup(); attempt(); }, 9000);
        function cleanup() {
          clearTimeout(to);
          s.onload = null;
          s.onerror = null;
        }
        s.onload = function () {
          cleanup();
          if (window.THREE) resolve(); else attempt();
        };
        s.onerror = function () { cleanup(); attempt(); };
        s.src = THREE_MIRRORS[i++];
        document.head.appendChild(s);
      }
      attempt();
    });
  }

  // Let the Bodoni numerals settle into the canvas fonts before they are cut.
  function whenTypeSettled() {
    if (!document.fonts || !document.fonts.ready) return Promise.resolve();
    return Promise.race([
      document.fonts.ready,
      new Promise(function (r) { setTimeout(r, 1200); })
    ]);
  }

  function ensureEngine(cb) {
    if (engine) { cb(null, engine); return; }
    if (enginePromise) {
      enginePromise.then(function (e) { cb(null, e); }, function (err) { cb(err); });
      return;
    }
    if (!canWebGL()) { cb(new Error('WebGL unavailable')); return; }
    enginePromise = loadThree().then(whenTypeSettled).then(buildEngine);
    enginePromise.then(
      function (e) { cb(null, e); if (modalOpen) startLoop(); },
      function (err) {
        enginePromise = null;
        console.error('[roulette] the stone would not wake:', err);
        cb(err || new Error('the stone would not wake'));
      }
    );
  }

  // Face pigments: one coherent stone with barely-there variation, two
  // faces carrying the faintest forest undertone.
  var FACE_STONE = [
    '#292d29', '#2b302b', '#272c28', '#2e332e',
    '#2a322c', '#31362f', '#2c312c', '#333833',
    '#292e29', '#2d3430', '#2b302c', '#303530'
  ];

  function buildEngine() {
    var THREE = window.THREE;
    tmpQ = new THREE.Quaternion();
    tmpV = new THREE.Vector3();
    var UP = new THREE.Vector3(0, 1, 0);

    var renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setClearColor(0x0f1412, 1);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(36, 1, 0.1, 60);
    camera.position.set(0, 3.05, 6.5);
    camera.lookAt(0, 0.78, 0);

    // ---- light: one quiet afternoon over a courtyard
    var key = new THREE.DirectionalLight(0xe8e2c8, 1.0);
    key.position.set(3.5, 6, 2.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -3.6;
    key.shadow.camera.right = 3.6;
    key.shadow.camera.top = 3.6;
    key.shadow.camera.bottom = -3.6;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 14;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.02;
    scene.add(key);
    scene.add(new THREE.HemisphereLight(0x3a4438, 0x14180f, 0.55));
    var mossBounce = new THREE.PointLight(0x477d38, 0.4, 9);   // green thrown back from the moss
    mossBounce.position.set(-2.2, 0.7, 2.0);
    scene.add(mossBounce);
    var rim = new THREE.DirectionalLight(0xb2bca3, 0.3);       // faint botanical rim
    rim.position.set(-3, 2.4, -4);
    scene.add(rim);

    // ---- geometry: a true dodecahedron, re-woven face by face
    var src = new THREE.DodecahedronGeometry(R, 0);
    var faces = groupFaces(THREE, src, UP);      // 12 pentagons: normal, axes, uv points
    var geo = reweave(THREE, src, faces);        // ordered triangles + planar UVs + groups
    src.dispose();

    var maxAniso = renderer.capabilities.getMaxAnisotropy
      ? renderer.capabilities.getMaxAnisotropy() : 1;

    var materials = faces.map(function (face, i) {
      var tex = faceTexture(THREE, i, face.uvs);
      tex.anisotropy = Math.min(4, maxAniso);
      return new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.78 + ((i * 37) % 17) / 100,   // weathered: never uniform
        metalness: 0.02,
        flatShading: true
      });
    });

    var dieGroup = new THREE.Group();
    var die = new THREE.Mesh(geo, materials);
    die.castShadow = true;
    dieGroup.add(die);
    var cage = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo, 12),   // the 12 real edges only; pentagon interiors are coplanar
      new THREE.LineBasicMaterial({ color: 0x0d0f0c, transparent: true, opacity: 0.5 })
    );
    cage.scale.setScalar(1.002);
    dieGroup.add(cage);
    dieGroup.position.y = REST_Y;
    scene.add(dieGroup);

    // ---- platform: dark cobbles, moss in the seams, shadow-catching
    var platTex = platformTexture(THREE);
    platTex.anisotropy = Math.min(4, maxAniso);
    var platform = new THREE.Mesh(
      new THREE.CylinderGeometry(2.6, 2.78, 0.5, 26),
      [
        new THREE.MeshStandardMaterial({ color: 0x1a1f1b, roughness: 0.95, metalness: 0 }),
        new THREE.MeshStandardMaterial({ map: platTex, roughness: 0.94, metalness: 0 }),
        new THREE.MeshStandardMaterial({ color: 0x12150f, roughness: 0.95, metalness: 0 })
      ]
    );
    platform.position.y = -0.25;            // top face rests at y = 0
    platform.receiveShadow = true;
    scene.add(platform);

    // ---- a few leaves that fell and stayed
    var leaves = [];
    [
      { c: 0x21452b, x: 1.62, z: 0.85, r: 0.7, s: 0.34 },
      { c: 0x285633, x: -1.35, z: -1.15, r: 2.4, s: 0.27 },
      { c: 0x173522, x: 0.55, z: -1.72, r: 4.1, s: 0.22 }
    ].forEach(function (spec) {
      var leaf = new THREE.Mesh(
        leafGeometry(THREE),
        new THREE.MeshStandardMaterial({
          color: spec.c, roughness: 0.85, metalness: 0, side: THREE.DoubleSide
        })
      );
      leaf.rotation.x = -Math.PI / 2;
      leaf.rotation.z = spec.r;
      leaf.scale.setScalar(spec.s);
      leaf.position.set(spec.x, 0.012, spec.z);
      leaf.receiveShadow = true;
      leaf.userData.baseZ = spec.r;
      leaf.userData.phase = spec.x * 2.1;
      leaf.userData.kick = 0;
      scene.add(leaf);
      leaves.push(leaf);
    });

    // The die's resting pose: a different face greets you each visit.
    var eng = {
      THREE: THREE, renderer: renderer, scene: scene, camera: camera,
      dieGroup: dieGroup, faces: faces, leaves: leaves,
      baseCamY: camera.position.y, camDip: 0,
      idleBase: null
    };
    engine = eng;   // qForFaceIdx reads the module handle — publish first
    eng.idleBase = qForFaceIdx(Math.floor(Math.random() * 12));
    dieGroup.quaternion.copy(eng.idleBase);
    sizeRenderer();
    return eng;
  }

  /* PolyhedronGeometry hands over 36 flat triangles — three per pentagon.
     Gather them into the twelve true faces, each with its own in-plane
     axes ('u' = one edge direction, 'v' = the texture's up) and the five
     corner points used for both UV mapping and the painted bevel. */
  function groupFaces(THREE, geo, UP) {
    var pos = geo.attributes.position.array;
    var nor = geo.attributes.normal.array;
    var faces = [];

    function samePoint(ax, ay, az, bx, by, bz) {
      return Math.abs(ax - bx) < 1e-4 && Math.abs(ay - by) < 1e-4 && Math.abs(az - bz) < 1e-4;
    }

    for (var t = 0; t < 36; t++) {
      var o = t * 9;
      var n = new THREE.Vector3(nor[o], nor[o + 1], nor[o + 2]).normalize();
      // cluster by direction: the three triangles of one pentagon are
      // coplanar (dot ~ 1); distinct faces sit 63° apart (dot ~ 0.45)
      var fi = -1;
      for (var c = 0; c < faces.length; c++) {
        if (faces[c].n.dot(n) > 0.996) { fi = c; break; }
      }
      if (fi === -1) {
        var ref = Math.abs(n.y) > 0.94 ? new THREE.Vector3(1, 0, 0) : UP;
        var u = new THREE.Vector3().crossVectors(n, ref).normalize();
        var v = new THREE.Vector3().crossVectors(n, u).normalize();  // right-handed: (u, v, n)
        faces.push({ n: n, u: u, v: v, tris: [], verts: [] });
        fi = faces.length - 1;
      }
      faces[fi].tris.push(t);
    }

    if (faces.length !== 12) throw new Error('the stone refused to divide into twelve');

    faces.forEach(function (f) {
      if (f.tris.length !== 3) throw new Error('a face is not a pentagon');
      // five unique corners, gathered from the three fan triangles
      f.tris.forEach(function (t) {
        for (var j = 0; j < 3; j++) {
          var o = t * 9 + j * 3;
          var px = pos[o], py = pos[o + 1], pz = pos[o + 2];
          var known = f.verts.some(function (w) { return samePoint(px, py, pz, w[0], w[1], w[2]); });
          if (!known) f.verts.push([px, py, pz]);
        }
      });
      if (f.verts.length !== 5) throw new Error('a pentagon lost its corners');

      var c = [0, 0, 0];
      f.verts.forEach(function (w) { c[0] += w[0] / 5; c[1] += w[1] / 5; c[2] += w[2] / 5; });
      var rad = 0;
      f.verts.forEach(function (w) {
        rad = Math.max(rad, Math.sqrt(
          (w[0] - c[0]) * (w[0] - c[0]) + (w[1] - c[1]) * (w[1] - c[1]) + (w[2] - c[2]) * (w[2] - c[2])));
      });
      f.uvs = f.verts.map(function (w) {
        var dU = (w[0] - c[0]) * f.u.x + (w[1] - c[1]) * f.u.y + (w[2] - c[2]) * f.u.z;
        var dV = (w[0] - c[0]) * f.v.x + (w[1] - c[1]) * f.v.y + (w[2] - c[2]) * f.v.z;
        return [0.5 + dU / (2 * rad), 0.5 + dV / (2 * rad)];
      });
    });
    return faces;
  }

  // Rebuild the buffers ordered face by face so each pentagon owns nine
  // consecutive vertices — one material group per true face, planar UVs.
  function reweave(THREE, geo, faces) {
    var pos = geo.attributes.position.array;
    var nor = geo.attributes.normal.array;
    var newPos = new Float32Array(36 * 9);
    var newNor = new Float32Array(36 * 9);
    var newUv = new Float32Array(36 * 2);

    faces.forEach(function (f, fi) {
      // each triangle slot is matched to its corner within the pentagon
      f.tris.forEach(function (t, k) {
        for (var j = 0; j < 3; j++) {
          var o = t * 9 + j * 3;
          var px = pos[o], py = pos[o + 1], pz = pos[o + 2];
          var ci = -1;
          for (var w = 0; w < 5; w++) {
            var q = f.verts[w];
            if (Math.abs(px - q[0]) < 1e-4 && Math.abs(py - q[1]) < 1e-4 && Math.abs(pz - q[2]) < 1e-4) {
              ci = w; break;
            }
          }
          if (ci === -1) throw new Error('a corner left its face');

          var dst = (fi * 9 + k * 3 + j) * 3;
          newPos[dst] = px; newPos[dst + 1] = py; newPos[dst + 2] = pz;
          newNor[dst] = nor[o]; newNor[dst + 1] = nor[o + 1]; newNor[dst + 2] = nor[o + 2];
          var uvDst = (fi * 9 + k * 3 + j) * 2;
          newUv[uvDst] = f.uvs[ci][0];
          newUv[uvDst + 1] = f.uvs[ci][1];
        }
      });
    });

    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(newPos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(newNor, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(newUv, 2));
    for (var f = 0; f < 12; f++) g.addGroup(f * 9, 9, f);
    return g;
  }

  /* One canvas per face — pigment, grain, damp moss in a corner, the
     bevel stroked along the face's own edges, and the numeral cut deep
     with a pale fresh-cut lip. Solid colours and strokes only. */
  function faceTexture(THREE, i, uvs) {
    var S = 256;
    var cv = document.createElement('canvas');
    cv.width = cv.height = S;
    var g = cv.getContext('2d');

    g.fillStyle = FACE_STONE[i % FACE_STONE.length];
    g.fillRect(0, 0, S, S);

    // mineral grain
    for (var k = 0; k < 460; k++) {
      g.fillStyle = (k % 2 ? '#171a17' : '#555a52');
      g.globalAlpha = 0.045 + (k % 7) * 0.009;
      var w = 1 + (k % 3);
      g.fillRect((k * 71 + i * 37) % S, (k * 113 + i * 61) % S, w, w);
    }
    g.globalAlpha = 1;

    // moss where the damp collects — some faces only, one corner each
    if (i % 3 === 1 || i === 7) {
      var corner = uvs[(i * 3) % 5];
      var mx = (0.5 + (corner[0] - 0.5) * 0.62) * S;
      var my = (1 - (0.5 + (corner[1] - 0.5) * 0.62)) * S;
      for (var m = 0; m < 16; m++) {
        g.fillStyle = ['#173522', '#21452b', '#285633'][m % 3];
        g.globalAlpha = 0.4 + (m % 5) * 0.11;
        g.beginPath();
        g.arc(mx + ((m * 53) % 34) - 17, my + ((m * 29) % 30) - 15, 1.4 + (m % 4) * 0.8, 0, Math.PI * 2);
        g.fill();
      }
      g.globalAlpha = 1;
    }

    // the bevel: hard-edged strokes riding the face's real edge
    g.lineJoin = 'round';
    pentPath(g, uvs, S, 1);
    g.strokeStyle = '#131612';
    g.lineWidth = 13;
    g.stroke();
    pentPath(g, uvs, S, 0.9);
    g.strokeStyle = '#1d211d';
    g.lineWidth = 6;
    g.stroke();
    pentPath(g, uvs, S, 0.915);
    g.strokeStyle = '#555a52';
    g.globalAlpha = 0.3;
    g.lineWidth = 1.6;
    g.stroke();
    g.globalAlpha = 1;

    // the numeral: deep-cut dark with the pale lip of the chisel below-right
    g.font = '600 104px "Bodoni Moda", Georgia, serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = 'rgba(154, 160, 140, 0.38)';
    g.fillText(String(i + 1), S / 2 + 2.5, S / 2 + 3);
    g.fillStyle = '#12150f';
    g.fillText(String(i + 1), S / 2, S / 2);

    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  // Stroke the pentagon through the face's five corners, scaled toward center.
  function pentPath(g, uvs, S, scale) {
    g.beginPath();
    for (var p = 0; p < 5; p++) {
      var x = (0.5 + (uvs[p][0] - 0.5) * scale) * S;
      var y = (1 - (0.5 + (uvs[p][1] - 0.5) * scale)) * S;
      if (p === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.closePath();
  }

  // The courtyard floor: irregular cobbles, dark seams, moss in the joints.
  function platformTexture(THREE) {
    var S = 512;
    var cv = document.createElement('canvas');
    cv.width = cv.height = S;
    var g = cv.getContext('2d');
    g.fillStyle = '#12150f';
    g.fillRect(0, 0, S, S);

    var seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return (seed % 1000) / 1000; }

    var fills = ['#242c28', '#282d29', '#2d322e', '#343934', '#292f2a'];
    for (var i = 0; i < 46; i++) {
      var cx = rnd() * S, cy = rnd() * S, r = 20 + rnd() * 26;
      var n = 7 + Math.floor(rnd() * 3);
      g.beginPath();
      for (var k = 0; k <= n; k++) {
        var a = (k / n) * Math.PI * 2;
        var rr = r * (0.78 + rnd() * 0.34);
        var x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
        if (k === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.closePath();
      g.fillStyle = fills[i % fills.length];
      g.fill();
      g.strokeStyle = '#0f130e';
      g.lineWidth = 3.5;
      g.stroke();
    }
    for (var m = 0; m < 90; m++) {
      g.fillStyle = ['#173522', '#21452b', '#285633'][m % 3];
      g.globalAlpha = 0.35 + rnd() * 0.45;
      g.beginPath();
      g.arc(rnd() * S, rnd() * S, 1.5 + rnd() * 4, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;

    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  // A fallen leaf: one bezier silhouette, cheap and few.
  function leafGeometry(THREE) {
    var s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(0.5, 0.25, 0.85, 0.75, 0, 1.6);
    s.bezierCurveTo(-0.85, 0.75, -0.5, 0.25, 0, 0);
    return new THREE.ShapeGeometry(s, 6);
  }

  /* -------------------------------------------- 4. FACE ORIENTATION MATH
     The winner is never an accident: we build the exact orientation that
     puts a given face up and readable, then throw the stone toward it. */
  function qForFaceIdx(idx) {
    var eng = engine;
    if (!eng) return null;
    var THREE = eng.THREE;
    var f = eng.faces[idx];
    var q1 = new THREE.Quaternion().setFromUnitVectors(f.n, new THREE.Vector3(0, 1, 0));
    var upDir = f.v.clone().applyQuaternion(q1);        // the face's 'up' after tilting
    var yaw = Math.atan2(0, -1) - Math.atan2(upDir.x, upDir.z);
    var qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    return qYaw.multiply(q1);                            // upright for the viewer
  }

  function faceUpIndex() {
    var eng = engine;
    var best = 0, bestY = -Infinity;
    var q = eng.dieGroup.quaternion;
    for (var i = 0; i < 12; i++) {
      var wy = eng.faces[i].n.clone().applyQuaternion(q).y;
      if (wy > bestY) { bestY = wy; best = i; }
    }
    return best;
  }

  /* -------------------------------------------------------- 5. THE ROLL */
  function roll() {
    if (rolling) return;
    chosen = pickIndex();
    hideResult();
    markBusy(true);

    ensureEngine(function (err, eng) {
      if (err || !eng) { revealResult(ACTIVITIES[chosen]); markBusy(false); return; }
      var target = qForFaceIdx(chosen);

      if (reducedMQ.matches) {
        anim = {
          mode: 'quiet', t0: performance.now(), dur: 420,
          from: eng.dieGroup.quaternion.clone(), to: target
        };
      } else {
        anim = {
          mode: 'roll', t0: performance.now(),
          anticipate: 150, spin: 1250 + Math.random() * 300, settle: 320,
          axis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
          wMax: 15 + Math.random() * 8,
          lift: 0.5 + Math.random() * 0.12,
          seed: Math.random() * 10,
          to: target
        };
      }
      startLoop();
    });
  }

  function startLoop() {
    if (!rafId && modalOpen && engine) rafId = requestAnimationFrame(tick);
  }

  function stopLoop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function tick(now) {
    rafId = 0;
    var eng = engine;
    if (!eng || !modalOpen) return;
    var dt = Math.min(0.05, (now - (tick.last || now)) / 1000);
    tick.last = now;

    if (anim) stepRoll(eng, now, dt);
    else idle(eng, now, dt);

    if (eng.camDip > 0.0005) {
      eng.camDip *= Math.pow(0.001, dt);
      eng.camera.position.y = eng.baseCamY - eng.camDip;
    } else if (eng.camDip !== 0) {
      eng.camDip = 0;
      eng.camera.position.y = eng.baseCamY;
    }

    eng.renderer.render(eng.scene, eng.camera);
    if (modalOpen) rafId = requestAnimationFrame(tick);
  }

  // Calm at rest: the die leans on its last answer, breathing a little.
  function idle(eng, now, dt) {
    var THREE = eng.THREE;
    var t = now / 1000;
    var drift = new THREE.Quaternion().setFromEuler(new THREE.Euler(
      Math.sin(t * 0.35) * 0.022,
      Math.sin(t * 0.21 + 1.7) * 0.03,
      Math.sin(t * 0.27 + 0.6) * 0.016
    ));
    eng.dieGroup.quaternion.copy(eng.idleBase).multiply(drift);
    eng.dieGroup.position.y = REST_Y + Math.sin(t * 0.85) * 0.013;

    eng.leaves.forEach(function (leaf) {
      if (leaf.userData.kick > 0.001) {
        leaf.userData.kick *= Math.pow(0.02, dt);
        leaf.rotation.z = leaf.userData.baseZ + Math.sin(t * 26) * 0.16 * leaf.userData.kick;
      } else {
        leaf.rotation.z = leaf.userData.baseZ + Math.sin(t * 0.5 + leaf.userData.phase) * 0.035;
      }
    });
  }

  function stepRoll(eng, now, dt) {
    var THREE = eng.THREE;
    var a = anim;
    var el = now - a.t0;

    // reduced motion: one short, controlled turn to the drawn face
    if (a.mode === 'quiet') {
      var qp = Math.min(1, el / a.dur);
      var qe = qp < 0.5 ? 4 * qp * qp * qp : 1 - Math.pow(-2 * qp + 2, 3) / 2;
      tmpQ.copy(a.from).slerp(a.to, qe);
      eng.dieGroup.quaternion.copy(tmpQ);
      if (qp >= 1) finishRoll();
      return;
    }

    // 1. anticipation — the hand settles the stone before the throw
    if (el < a.anticipate) {
      var ap = el / a.anticipate;
      var dip = Math.sin(ap * Math.PI) * 0.05;
      eng.dieGroup.position.y = REST_Y - dip;
      eng.dieGroup.scale.set(1 + dip * 0.5, 1 - dip * 0.9, 1 + dip * 0.5);
      return;
    }
    var el2 = el - a.anticipate;

    // 2. the tumble — accelerating, full speed, then decaying while the
    //    axis itself wanders, so no two throws share a path
    if (el2 < a.spin) {
      var u = el2 / a.spin;
      var w;
      if (u < 0.18) w = a.wMax * (u / 0.18) * (u / 0.18);
      else if (u < 0.46) w = a.wMax;
      else w = Math.max(0.3, a.wMax * Math.exp(-4.4 * (u - 0.46) / 0.54));

      tmpV.set(
        a.axis.x + Math.sin(el2 * 0.004 + a.seed) * 0.55,
        a.axis.y + Math.sin(el2 * 0.0031 + a.seed * 2) * 0.55,
        a.axis.z + Math.sin(el2 * 0.0036 + a.seed * 3) * 0.55
      ).normalize();
      tmpQ.setFromAxisAngle(tmpV, w * dt);
      eng.dieGroup.quaternion.premultiply(tmpQ);

      // late in the decay, the stone is gently drawn toward its fate
      if (u > 0.58) {
        var k = Math.pow((u - 0.58) / 0.42, 2) * 0.12;
        eng.dieGroup.quaternion.slerp(a.to, 1 - Math.pow(1 - k, dt * 60));
      }

      var arc = Math.sin(Math.PI * Math.min(1, u * 1.06)) * a.lift;
      eng.dieGroup.position.y = REST_Y + arc;
      eng.dieGroup.scale.set(1, 1, 1);
      return;
    }

    // 3. the settle — a last, deliberate alignment; the platform takes
    //    the weight, a leaf is kicked, a low bell sounds
    if (!a.settleFrom) {
      a.settleFrom = eng.dieGroup.quaternion.clone();
      a.settleT0 = el2;
      eng.camDip = 0.035;
      if (eng.leaves[0]) eng.leaves[0].userData.kick = 1;
      bell(392, 0.7);
    }
    var sp = Math.min(1, (el2 - a.settleT0) / a.settle);
    var se = sp < 0.5 ? 4 * sp * sp * sp : 1 - Math.pow(-2 * sp + 2, 3) / 2;
    tmpQ.copy(a.settleFrom).slerp(a.to, se);
    eng.dieGroup.quaternion.copy(tmpQ);
    var squash = Math.sin(Math.min(1, sp * 1.4) * Math.PI) * 0.05 * (1 - sp);
    eng.dieGroup.scale.set(1 + squash * 0.6, 1 - squash, 1 + squash * 0.6);
    eng.dieGroup.position.y = REST_Y - squash * 0.1;
    if (sp >= 1) finishRoll();
  }

  function finishRoll() {
    var eng = engine;
    anim = null;
    eng.dieGroup.scale.set(1, 1, 1);
    eng.dieGroup.position.y = REST_Y;

    // truth check: the face looking up must be the face that was drawn
    var winner = faceUpIndex();
    if (winner !== chosen) {
      console.warn('[roulette] orientation corrected to match the drawn face');
      eng.dieGroup.quaternion.copy(qForFaceIdx(chosen));
    }
    // the stone now rests on its answer — it stays until the next throw
    eng.idleBase = eng.dieGroup.quaternion.clone();

    revealResult(ACTIVITIES[chosen]);
    markBusy(false);
  }

  /* ----------------------------------------------------- 6. THE PANEL */
  function markBusy(on) {
    rolling = on;
    btnRoll.classList.toggle('rolling', on);
    btnRoll.disabled = on;
    btnRoll.setAttribute('aria-busy', on ? 'true' : 'false');
    rollLabel.textContent = on ? 'The stone is deciding…' : 'Roll the Stone';
    if (on) {
      status.textContent = 'The stone is deciding…';
      invite.textContent = 'The stone is deciding…';
      invite.classList.add('quiet');
    } else if (state.rolls > 0) {
      invite.textContent = 'Twelve paths. The stone remembers them all.';
      invite.classList.add('quiet');
    }
  }

  function revealResult(act) {
    var idx = act.title ? ACTIVITIES.indexOf(act) : chosen;
    resultNumber.textContent = (idx + 1) < 10 ? '0' + (idx + 1) : String(idx + 1);
    resultTitle.textContent = act.title;
    resultDesc.textContent = act.desc;

    var done = state.done.indexOf(idx) !== -1;
    btnBegin.classList.toggle('hidden', done);
    btnMark.classList.toggle('hidden', done);
    doneNote.classList.toggle('hidden', !done);

    result.hidden = false;
    void result.offsetWidth;              // let it settle before the reveal moves
    result.classList.add('show');

    status.textContent = 'The stone chose face ' + (idx + 1) + ': ' + act.title + '. ' + act.desc;
    state.rolls += 1;
    state.last = idx;
    saveState();
    syncLastNote();
    bell(528, 0.9);
  }

  function hideResult() {
    result.classList.remove('show');
    if (!result.hidden) {
      setTimeout(function () {
        if (!result.classList.contains('show')) result.hidden = true;
      }, 240);
    }
  }

  /* ------------------------------------------------------ 7. THE CHAMBER */
  function open(e) {
    if (!modal || modalOpen) return;
    opener = document.activeElement;
    var show = function () {
      modalOpen = true;
      modal.classList.remove('hidden');
      sizeRenderer();   // the stage has real dimensions again
      var panel = modal.querySelector('.modal-panel');
      if (panel) {
        panel.classList.remove('ritual-enter');
        void panel.offsetWidth;
        panel.classList.add('ritual-enter');
      }
      document.documentElement.style.overflow = 'hidden';
      syncLastNote();

      if (!engine && !enginePromise && canWebGL()) {
        stageNote.textContent = 'Summoning the stone…';
        stageNote.classList.remove('hidden');
      }
      btnClose.focus();

      ensureEngine(function (err) {
        if (!modalOpen) return;
        if (err) {
          stageNote.innerHTML = 'The stone is asleep — rendering unavailable.<br>The choice below still stands.';
          stageNote.classList.remove('hidden');
        } else {
          stageNote.classList.add('hidden');
          startLoop();
        }
      });
      startLoop();
    };
    var ritual = window.BastionRitual;
    if (ritual && ritual.sweep && !reducedMQ.matches) ritual.sweep(show, null, e);
    else show();
  }

  function close(e) {
    if (!modalOpen) return;
    modalOpen = false;
    stopLoop();
    document.documentElement.style.overflow = '';
    var finish = function () {
      modal.classList.add('hidden');
      if (opener && opener.focus) opener.focus();
      opener = null;
    };
    var ritual = window.BastionRitual;
    if (ritual && ritual.sweep && !reducedMQ.matches) ritual.sweep(finish, null, e);
    else finish();
  }

  /* ------------------------------------------------------ 8. WIRING */
  if (btnEnter) btnEnter.addEventListener('click', open);
  btnClose.addEventListener('click', close);
  btnRoll.addEventListener('click', roll);
  btnAgain.addEventListener('click', roll);

  btnBegin.addEventListener('click', function () {
    if (chosen < 0) return;
    btnBegin.classList.add('hidden');
    btnMark.classList.remove('hidden');
    status.textContent = 'Adventure begun: ' + ACTIVITIES[chosen].title +
      '. Mark it done when the stones have had their say.';
    bell(528, 0.7);
  });

  btnMark.addEventListener('click', function () {
    if (chosen < 0) return;
    var act = ACTIVITIES[chosen];
    // the garden grows from real completions, nothing else
    if (window.BastionGarden && window.BastionGarden.note) window.BastionGarden.note(act.title, true);
    if (state.done.indexOf(chosen) === -1) { state.done.push(chosen); saveState(); }
    btnMark.classList.add('hidden');
    doneNote.classList.remove('hidden');
    status.textContent = act.title + ' marked done — a fern grows on the garden ledge.';
    bell(660, 1.1);
  });

  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Escape' || e.key === 'Esc') && modalOpen) close();
  });
  modal.addEventListener('mousedown', function (e) {
    if (e.target === modal) close();
  });

  window.addEventListener('resize', function () { sizeRenderer(); });
  function sizeRenderer() {
    if (!engine || !stageEl) return;
    var w = stageEl.clientWidth, h = stageEl.clientHeight;
    if (!w || !h) return;
    engine.camera.aspect = w / h;
    engine.camera.updateProjectionMatrix();
    engine.renderer.setSize(w, h, false);
  }

  window.addEventListener('beforeunload', function () {
    stopLoop();
    if (!engine) return;
    engine.scene.traverse(function (obj) {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        var mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach(function (m) {
          if (m.map) m.map.dispose();
          m.dispose();
        });
      }
    });
    engine.renderer.dispose();
  });

  /* ------------------------------------------------- 9. PUBLIC FACE */
  window.BoredomRoulette = {
    ACTIVITIES: ACTIVITIES,
    open: open,
    close: close,
    roll: roll,
    getState: function () {
      return { rolls: state.rolls, last: state.last, done: state.done.slice() };
    },
    _engineReady: function () { return !!engine; },
    // verification: every face really owns its number, in both directions
    _faceMap: function () {
      if (!engine) return null;
      var out = [];
      var keep = engine.dieGroup.quaternion.clone();
      for (var i = 0; i < 12; i++) {
        engine.dieGroup.quaternion.copy(qForFaceIdx(i));
        out.push(faceUpIndex() === i);
      }
      engine.dieGroup.quaternion.copy(keep);
      return out;
    }
  };
})();
