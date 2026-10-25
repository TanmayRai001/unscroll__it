/**
 * RippleTransition — WebGL-powered organic liquid refractive wave transition
 * Based on @/components/ui/ripple-transition component specification:
 * - Fluid refractive wave propagation
 * - Chromatic aberration (RGB channel splitting) along the wavefront
 * - Luminous wavefront highlight glow
 * - Tactile inward pinch distortion at the ripple origin
 * - 3-octave organic noise displacement
 * - Preserves existing site background and cobblestone/moss aesthetic
 * - Full support for prefers-reduced-motion and zero idle overhead
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.RippleTransition = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var SAMPLE_IMAGES = [
    'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&q=85&w=1800',
    'https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&q=85&w=1800',
    'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=85&w=1800'
  ];

  var DEFAULTS = {
    duration: 1.4,        // seconds (1.4s reference duration)
    waveSpeed: 1.6,       // wavefront expansion velocity
    sigma: 0.15,          // ripple band thickness
    waveFreq: 5.0,        // concentric wave frequency
    pushAmt: 0.145,       // radial displacement amount
    caStrength: 0.02,     // chromatic aberration intensity
    glow: 0.73,           // highlight lift along wavefront
    noiseWarp: 1.0,       // organic noise warping factor
    pinch: true,          // inward pull at ripple epicenter
    autoPlay: false,
    autoPlayInterval: 3200,
    autoPlayOrigin: 'center'
  };

  var VERT_SRC = [
    'attribute vec2 position;',
    'varying vec2 uv;',
    'void main() {',
    '  uv = vec2(position.x * 0.5 + 0.5, 0.5 - position.y * 0.5);',
    '  gl_Position = vec4(position, 0.0, 1.0);',
    '}'
  ].join('\n');

  var FRAG_SRC = [
    'precision highp float;',
    'varying vec2 uv;',
    'uniform sampler2D fromImage;',
    'uniform sampler2D toImage;',
    'uniform vec2 viewport;',
    'uniform vec2 fromSize;',
    'uniform vec2 toSize;',
    'uniform vec2 origin;',
    'uniform float phase;',
    'uniform float speed;',
    'uniform float thickness;',
    'uniform float frequency;',
    'uniform float displacement;',
    'uniform float chroma;',
    'uniform float highlight;',
    'uniform float roughness;',
    'uniform float pinchAmount;',
    'uniform float opacity;',
    '',
    'float random2(vec2 p) {',
    '  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);',
    '}',
    '',
    'float smoothNoise(vec2 p) {',
    '  vec2 cell = floor(p);',
    '  vec2 local = fract(p);',
    '  local = local * local * (3.0 - 2.0 * local);',
    '  return mix(',
    '    mix(random2(cell), random2(cell + vec2(1.0, 0.0)), local.x),',
    '    mix(random2(cell + vec2(0.0, 1.0)), random2(cell + vec2(1.0, 1.0)), local.x),',
    '    local.y',
    '  );',
    '}',
    '',
    'float layeredNoise(vec2 p) {',
    '  return smoothNoise(p) * 0.57 +',
    '         smoothNoise(p * 2.07 + 4.3) * 0.29 +',
    '         smoothNoise(p * 4.21 - 2.8) * 0.14;',
    '}',
    '',
    'vec2 cover(vec2 point, vec2 media, vec2 frame) {',
    '  float mediaRatio = media.x / media.y;',
    '  float frameRatio = frame.x / frame.y;',
    '  vec2 crop = frameRatio > mediaRatio',
    '    ? vec2(1.0, mediaRatio / frameRatio)',
    '    : vec2(frameRatio / mediaRatio, 1.0);',
    '  return (point - 0.5) * crop + 0.5;',
    '}',
    '',
    'vec4 splitSample(sampler2D image, vec2 size, vec2 point, vec2 split) {',
    '  vec2 uvR = cover(point - split, size, viewport);',
    '  vec2 uvG = cover(point, size, viewport);',
    '  vec2 uvB = cover(point + split, size, viewport);',
    '  return vec4(',
    '    texture2D(image, uvR).r,',
    '    texture2D(image, uvG).g,',
    '    texture2D(image, uvB).b,',
    '    texture2D(image, uvG).a',
    '  );',
    '}',
    '',
    'void main() {',
    '  float aspect = viewport.x / viewport.y;',
    '  vec2 radial = uv - origin;',
    '  radial.x *= aspect;',
    '  float distanceFromOrigin = length(radial);',
    '  float farthest = length(vec2(aspect, 1.0));',
    '  float distance01 = distanceFromOrigin * 2.0 / farthest;',
    '  float agitation = (layeredNoise(radial * 9.0 + phase * 1.8) - 0.5) * roughness;',
    '  float boundary = phase * speed;',
    '  float signedDistance = distance01 + agitation - boundary;',
    '',
    '  float wave = exp(-(signedDistance * signedDistance) / max(0.0001, 2.0 * thickness * thickness));',
    '  wave *= 0.55 + 0.45 * cos(signedDistance * frequency * 6.28318);',
    '  wave *= smoothstep(0.0, 0.08, phase) * (1.0 - smoothstep(0.82, 1.0, phase));',
    '',
    '  vec2 direction = distanceFromOrigin > 0.0001 ? radial / distanceFromOrigin : vec2(0.0);',
    '  direction.x /= aspect;',
    '  float centerPull = exp(-distanceFromOrigin * distanceFromOrigin * 45.0) * pinchAmount;',
    '  vec2 offset = direction * (wave * displacement - centerPull * 0.018);',
    '  vec2 split = direction * wave * chroma;',
    '  float reveal = 1.0 - smoothstep(-0.045, 0.045, signedDistance);',
    '',
    '  vec4 before = splitSample(fromImage, fromSize, uv - offset, split);',
    '  vec4 after = splitSample(toImage, toSize, uv - offset, split);',
    '  vec3 color = mix(before.rgb, after.rgb, reveal);',
    '',
    '  // Botanical dew/emerald highlight glow along wavefront',
    '  vec3 glowColor = vec3(0.65, 0.92, 0.72);',
    '  color += wave * highlight * 0.38 * glowColor;',
    '  color *= 1.0 - centerPull * 0.12;',
    '',
    '  // Refractive opacity envelope — seamless blend with existing background',
    '  float waveAlpha = clamp(wave * 2.0 + abs(before.a - after.a), 0.0, 1.0);',
    '  float envelope = smoothstep(0.0, 0.35, phase) * (1.0 - smoothstep(0.68, 1.0, phase));',
    '  float alpha = opacity * clamp(max(waveAlpha, envelope * 0.85), 0.0, 1.0);',
    '',
    '  gl_FragColor = vec4(clamp(color, 0.0, 1.0), alpha);',
    '}'
  ].join('\n');

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function compileShader(gl, type, source) {
    var shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('[RippleTransition] Shader compilation failed:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function createTexture(gl, imageOrCanvas) {
    var texture = gl.createTexture();
    if (!texture) return null;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageOrCanvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return texture;
  }

  // Generate a procedural damp cobblestone texture matching the site's palette
  function makeProceduralStoneTexture(w, h, seed) {
    var c = document.createElement('canvas');
    c.width = w || 512;
    c.height = h || 512;
    var ctx = c.getContext('2d');
    
    // Deep stone abyss base
    ctx.fillStyle = '#0e120f';
    ctx.fillRect(0, 0, c.width, c.height);

    var stones = [
      '#1a201b', '#242a22', '#2d332a', '#1e251f', '#293026', '#353c30'
    ];
    var moss = ['#2f5e34', '#3b6e3c', '#477e45', '#558f4a'];

    var rows = 12;
    var rowH = c.height / rows;
    for (var r = 0; r < rows; r++) {
      var y = r * rowH;
      var x = -((r * 45 + seed * 30) % 60);
      while (x < c.width + 80) {
        var sw = 50 + ((x * 13 + r * 17 + seed * 19) % 55);
        ctx.fillStyle = stones[(r + Math.floor(x / 40)) % stones.length];
        ctx.fillRect(x + 1, y + 1, sw - 2, rowH - 2);

        // Moss ledge on tops of stone courses
        if ((r + x) % 3 === 0) {
          ctx.fillStyle = moss[(r + Math.floor(x / 30)) % moss.length];
          ctx.fillRect(x + 2, y + 1, sw - 4, 3);
        }
        x += sw;
      }
    }
    return c;
  }

  function RippleEngine(canvas, customSettings) {
    this.canvas = canvas;
    this.settings = Object.assign({}, DEFAULTS, customSettings || {});
    this.gl = null;
    this.program = null;
    this.geometry = null;
    this.textures = [];
    this.textureSizes = [];
    this.phase = 0;
    this.origin = [0.5, 0.5];
    this.opacity = 1.0;
    this.active = false;
    this.rafId = null;

    this.initGL();
  }

  RippleEngine.prototype.initGL = function () {
    try {
      var gl = this.canvas.getContext('webgl', {
        antialias: true,
        alpha: true,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false
      }) || this.canvas.getContext('experimental-webgl');

      if (!gl) {
        console.warn('[RippleTransition] WebGL not supported, fallback active.');
        return;
      }
      this.gl = gl;

      var vs = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
      var fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
      if (!vs || !fs) return;

      var program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.warn('[RippleTransition] Link error:', gl.getProgramInfoLog(program));
        return;
      }
      this.program = program;
      gl.useProgram(program);

      // Fullscreen quad [-1, -1] to [1, 1]
      var geo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, geo);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW
      );
      this.geometry = geo;

      var posLoc = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      // Default textures: two harmonious cobblestone/moss textures
      var texA = makeProceduralStoneTexture(512, 512, 1);
      var texB = makeProceduralStoneTexture(512, 512, 7);

      this.textures = [
        createTexture(gl, texA),
        createTexture(gl, texB)
      ];
      this.textureSizes = [
        { width: 512, height: 512 },
        { width: 512, height: 512 }
      ];

      gl.uniform1i(gl.getUniformLocation(program, 'fromImage'), 0);
      gl.uniform1i(gl.getUniformLocation(program, 'toImage'), 1);

      this.resize();
    } catch (e) {
      console.warn('[RippleTransition] WebGL init error:', e);
      this.gl = null;
    }
  };

  RippleEngine.prototype.resize = function () {
    if (!this.gl) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(1, Math.round(window.innerWidth * dpr));
    var h = Math.max(1, Math.round(window.innerHeight * dpr));

    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.gl.viewport(0, 0, w, h);
    }
  };

  RippleEngine.prototype.draw = function () {
    var gl = this.gl;
    if (!gl || !this.program) return;

    var s = this.settings;
    gl.useProgram(this.program);

    gl.uniform2f(gl.getUniformLocation(this.program, 'viewport'), this.canvas.width, this.canvas.height);
    gl.uniform2f(gl.getUniformLocation(this.program, 'fromSize'), this.textureSizes[0].width, this.textureSizes[0].height);
    gl.uniform2f(gl.getUniformLocation(this.program, 'toSize'), this.textureSizes[1].width, this.textureSizes[1].height);
    gl.uniform2f(gl.getUniformLocation(this.program, 'origin'), this.origin[0], this.origin[1]);
    gl.uniform1f(gl.getUniformLocation(this.program, 'phase'), this.phase);
    gl.uniform1f(gl.getUniformLocation(this.program, 'speed'), s.waveSpeed);
    gl.uniform1f(gl.getUniformLocation(this.program, 'thickness'), s.sigma);
    gl.uniform1f(gl.getUniformLocation(this.program, 'frequency'), s.waveFreq);
    gl.uniform1f(gl.getUniformLocation(this.program, 'displacement'), s.pushAmt);
    gl.uniform1f(gl.getUniformLocation(this.program, 'chroma'), s.caStrength);
    gl.uniform1f(gl.getUniformLocation(this.program, 'highlight'), s.glow);
    gl.uniform1f(gl.getUniformLocation(this.program, 'roughness'), s.noiseWarp * 0.09);
    gl.uniform1f(gl.getUniformLocation(this.program, 'pinchAmount'), s.pinch ? 1.0 : 0.0);
    gl.uniform1f(gl.getUniformLocation(this.program, 'opacity'), this.opacity);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[1]);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  // Preload and supply image texture
  RippleEngine.prototype.setTexture = function (slot, imageElement) {
    if (!this.gl || !imageElement) return;
    var tex = createTexture(this.gl, imageElement);
    if (tex) {
      if (this.textures[slot]) this.gl.deleteTexture(this.textures[slot]);
      this.textures[slot] = tex;
      this.textureSizes[slot] = {
        width: imageElement.naturalWidth || imageElement.width || 512,
        height: imageElement.naturalHeight || imageElement.height || 512
      };
    }
  };

  RippleEngine.prototype.destroy = function () {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (!this.gl) return;
    var gl = this.gl;
    this.textures.forEach(function (t) { if (t) gl.deleteTexture(t); });
    if (this.geometry) gl.deleteBuffer(this.geometry);
    if (this.program) gl.deleteProgram(this.program);
    this.gl = null;
  };

  // Singleton manager
  var instance = null;
  var canvasEl = null;
  var busy = false;
  var reduceMotion = false;

  function checkReducedMotion() {
    reduceMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function getOrCreateCanvas() {
    var c = document.getElementById('rippleCanvas');
    if (!c) {
      c = document.createElement('canvas');
      c.id = 'rippleCanvas';
      c.className = 'ripple-transition-canvas';
      c.setAttribute('aria-hidden', 'true');
      document.body.appendChild(c);
    }
    return c;
  }

  function init() {
    checkReducedMotion();
    if (!instance && typeof document !== 'undefined') {
      canvasEl = getOrCreateCanvas();
      instance = new RippleEngine(canvasEl, DEFAULTS);

      window.addEventListener('resize', function () {
        if (instance) instance.resize();
      });

      // Attempt to load the baked stone wall photo as a texture
      var bakedWall = document.querySelector('.wall-layer');
      var wallImg = new Image();
      wallImg.onload = function () {
        if (instance) {
          instance.setTexture(0, wallImg);
          instance.setTexture(1, wallImg);
        }
      };
      // High-res reference photograph from wall-texture.css
      wallImg.src = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAA8KCw0LCQ8NDA0REA8RFiUYFhQUFi0gIhslNS84NzQvNDM7QlVIOz9QPzM0SmRLUFdaX2BfOUdob2dcblVdX1v/2wBDARARERYTFisYGCtbPTQ9W1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1v/wAARCAFBAeADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD0 ...';
    }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  /**
   * Main transition trigger
   * opts: {
   *   origin: [x, y],        // normalized 0..1 (default: center [0.5, 0.5])
   *   duration: 1400,        // ms (default: 1.4s)
   *   midCb: function(),     // called at ripple crest (DOM changes happen under wave cover)
   *   doneCb: function()     // called when animation completes
   * }
   */
  function transition(opts) {
    opts = opts || {};
    checkReducedMotion();

    var midCb = opts.midCb;
    var doneCb = opts.doneCb;

    if (reduceMotion) {
      if (midCb) midCb();
      if (doneCb) doneCb();
      return;
    }

    if (busy) {
      if (midCb) midCb();
      if (doneCb) doneCb();
      return;
    }
    busy = true;

    init();
    var engine = instance;
    if (!engine || !engine.gl) {
      // Fallback if WebGL failed: smooth opacity handover
      if (midCb) midCb();
      setTimeout(function () {
        busy = false;
        if (doneCb) doneCb();
      }, 300);
      return;
    }

    var origin = opts.origin || [0.5, 0.5];
    engine.origin = [
      Math.max(0.01, Math.min(0.99, origin[0])),
      Math.max(0.01, Math.min(0.99, origin[1]))
    ];
    engine.phase = 0.0;
    engine.opacity = 1.0;
    engine.resize();

    canvasEl.style.display = 'block';
    canvasEl.style.opacity = '1';

    var duration = (typeof opts.duration === 'number' ? opts.duration : DEFAULTS.duration * 1000);
    var startTime = null;
    var midTriggered = false;

    function frame(ts) {
      if (!startTime) startTime = ts;
      var elapsed = ts - startTime;
      var progress = Math.min(1.0, elapsed / duration);

      // Easing curve: smooth cubic ease-in-out
      var phase = easeInOutCubic(progress);
      engine.phase = phase;

      // Opacity fades smoothly during the wave's departure
      if (progress > 0.72) {
        engine.opacity = Math.max(0, 1.0 - (progress - 0.72) / 0.28);
      } else {
        engine.opacity = 1.0;
      }

      engine.draw();

      // Trigger midpoint callback at wave crest coverage
      if (progress >= 0.48 && !midTriggered) {
        midTriggered = true;
        if (midCb) {
          try { midCb(); } catch (err) { console.error('[RippleTransition] midCb error:', err); }
        }
      }

      if (progress < 1.0) {
        engine.rafId = requestAnimationFrame(frame);
      } else {
        canvasEl.style.opacity = '0';
        canvasEl.style.display = 'none';
        engine.phase = 0.0;
        busy = false;
        if (doneCb) {
          try { doneCb(); } catch (err) { console.error('[RippleTransition] doneCb error:', err); }
        }
      }
    }

    engine.rafId = requestAnimationFrame(frame);
  }

  /**
   * Arriving ripple (e.g. after navigating to a new page via sessionStorage flag)
   * The wave completes its departure cleanly, unveiling the new page.
   */
  function arrive(opts) {
    opts = opts || {};
    checkReducedMotion();
    if (reduceMotion) return;

    init();
    var engine = instance;
    if (!engine || !engine.gl) return;

    var origin = opts.origin || [0.5, 0.5];
    engine.origin = [
      Math.max(0.01, Math.min(0.99, origin[0])),
      Math.max(0.01, Math.min(0.99, origin[1]))
    ];
    engine.phase = 0.48;
    engine.opacity = 1.0;
    engine.resize();

    canvasEl.style.display = 'block';
    canvasEl.style.opacity = '1';

    var duration = (typeof opts.duration === 'number' ? opts.duration : 750);
    var startTime = null;

    function frame(ts) {
      if (!startTime) startTime = ts;
      var elapsed = ts - startTime;
      var progress = Math.min(1.0, elapsed / duration);

      var phase = 0.48 + 0.52 * easeInOutCubic(progress);
      engine.phase = phase;
      engine.opacity = Math.max(0, 1.0 - progress);

      engine.draw();

      if (progress < 1.0) {
        engine.rafId = requestAnimationFrame(frame);
      } else {
        canvasEl.style.opacity = '0';
        canvasEl.style.display = 'none';
        engine.phase = 0.0;
      }
    }

    engine.rafId = requestAnimationFrame(frame);
  }

  return {
    transition: transition,
    arrive: arrive,
    isBusy: function () { return busy; },
    configure: function (settings) {
      if (instance) Object.assign(instance.settings, settings);
    },
    sampleImages: SAMPLE_IMAGES,
    destroy: function () {
      if (instance) {
        instance.destroy();
        instance = null;
      }
    }
  };
});
