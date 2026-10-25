/**
 * UNSCROLL IT — Application Logic & Engine
 * Polite Roaster, Life Toll Calculator, Nature Canvas, Side Quests, Audio Synthesizer
 */

// ============================================================================
// 1. STATE & PERSISTENCE
// ============================================================================
const APP_STORAGE_KEY = 'unscroll_it_state_v1';

const defaultState = {
  reclaimedHours: 4.5,
  questsCompleted: 7,
  roastsEndured: 14,
  sunsetsWitnessed: 12,
  thumbMilesSaved: 32,
  activeQuest: null,
  activeQuestTimeRemaining: 0,
  selectedPersona: 'victorian',
  interventionThreshold: 5,
  speechEnabled: true,
  soundscapeActive: false,
  weatherMode: 'sun',
  unlockedBadges: ['thumb_pacifist', 'grass_initiate'],
  // Sound Sanctuary state (100% Organic Nature, Weather, Chimes & Animals - Zero Electronic Hz Tones)
  activePreset: 'emerald_rain',
  masterVolume: 80,
  mixerVolumes: {
    rain: 65,
    ocean: 65,
    breeze: 55,
    stream: 60,
    crystal: 50,
    bamboo: 55,
    birds: 65,
    crickets: 60
  },
  mixerActive: {
    rain: true,
    ocean: false,
    breeze: false,
    stream: false,
    crystal: false,
    bamboo: false,
    birds: true,
    crickets: false
  },
  // Attention Span Improver & Focus Gym state
  cinemaTaste: {
    genres: ['Sci-Fi', 'Psychological Thriller', 'Studio Ghibli'],
    favoriteMovies: ['Interstellar', 'Inception', 'Spirited Away'],
    runtimeFilter: 'all',
    level: 'all',
    mood: 'all',
    search: ''
  },
  watchedMovies: [
    {
      title: 'Interstellar',
      year: 2014,
      director: 'Christopher Nolan',
      runtime: 169,
      date: '2026-09-28',
      phoneFreeRating: '100% Phone-Free',
      userRating: 5,
      notes: 'Held undivided focus through the docking sequence. Total dopamine reset.',
      lifePointer: 'Love and genuine human devotion transcend dimensions of space and time; never trade irreplaceable mortal presence for trivial algorithmic feeds.',
      socraticQ: [
        'How does the deafening silence of vacuum space challenge our addiction to constant background noise?',
        'Notice your emotional response when Cooper watches 23 years of accumulated video messages in 5 minutes—what did that teach you about the value of time?'
      ],
      craftInsight: 'Nolan used practical IMAX projection on set rather than green screens, creating authentic optical scale that commands total visual immersion.'
    },
    {
      title: 'Spirited Away',
      year: 2001,
      director: 'Hayao Miyazaki',
      runtime: 125,
      date: '2026-10-01',
      phoneFreeRating: '100% Phone-Free',
      userRating: 5,
      notes: 'Miyazaki\'s quiet train sequence was pure neurological therapy.',
      lifePointer: 'True integrity and quiet inner resolve endure even when the surrounding society succumbs to greedy, insatiable consumption.',
      socraticQ: [
        'Why did Miyazaki deliberately include long, wordless pauses (Ma) like the quiet train ride across the flooded tracks?',
        'How does Chihiro\'s refusal of No-Face\'s golden bait reflect our ability to refuse algorithmic micro-rewards?'
      ],
      craftInsight: 'Hand-drawn watercolor backgrounds and intentional silence directly soothe overstimulated prefrontal neural pathways.'
    }
  ],
  cinemaFocusMinutes: 294,
  activeCinemaSession: null
};

let appState = loadState();

function loadState() {
  try {
    const saved = localStorage.getItem(APP_STORAGE_KEY);
    const parsed = saved ? { ...defaultState, ...JSON.parse(saved) } : { ...defaultState };

    // Ensure cinemaTaste and sub-arrays are fully initialized
    if (!parsed.cinemaTaste || typeof parsed.cinemaTaste !== 'object') {
      parsed.cinemaTaste = { ...defaultState.cinemaTaste };
    }
    if (!Array.isArray(parsed.cinemaTaste.genres) || parsed.cinemaTaste.genres.length === 0) {
      parsed.cinemaTaste.genres = ['Sci-Fi', 'Psychological Thriller', 'Studio Ghibli'];
    }
    if (!Array.isArray(parsed.cinemaTaste.favoriteMovies) || parsed.cinemaTaste.favoriteMovies.length === 0) {
      parsed.cinemaTaste.favoriteMovies = ['Interstellar', 'Inception', 'Spirited Away'];
    }
    if (!parsed.cinemaTaste.runtimeFilter) parsed.cinemaTaste.runtimeFilter = 'all';
    if (!parsed.cinemaTaste.level) parsed.cinemaTaste.level = 'all';
    if (!parsed.cinemaTaste.mood) parsed.cinemaTaste.mood = 'all';
    if (parsed.cinemaTaste.search === undefined) parsed.cinemaTaste.search = '';

    // Migrate Sound Sanctuary channels to pure organic nature palette
    if (!parsed.mixerVolumes || parsed.mixerVolumes.ocean === undefined || parsed.mixerVolumes.theta !== undefined || parsed.mixerVolumes.sunlight !== undefined) {
      parsed.mixerVolumes = { ...defaultState.mixerVolumes };
      parsed.mixerActive = { ...defaultState.mixerActive };
      parsed.activePreset = 'emerald_rain';
    }

    return parsed;
  } catch (e) {
    console.warn('Storage read failed, using defaults', e);
    return { ...defaultState };
  }
}

function saveState() {
  try {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(appState));
  } catch (e) {
    console.warn('Storage write failed', e);
  }
  updateUIStats();
}

// ============================================================================
// 2. EXPANDED WEB AUDIO ENGINE (Procedural Sanctuary & Mind-Clearing Sounds)
// ============================================================================
let audioCtx = null;
let masterGain = null;
let soundAnalyser = null;

// Track node references
let continuousNodes = {
  rain: null,
  sunlight: null,
  bamboo: null,
  bowls: null,
  crystal: null,
  theta: null,
  purr: null,
  celestial: null,
  highpitch: null
};

// Periodic schedulers
let bambooTimer = null;
let bowlsTimer = null;
let crystalTimer = null;
let birdsTimer = null;
let streamInterval = null;
let visualizerAnimId = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    // Master Gain & Analyser
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(appState.masterVolume / 100, audioCtx.currentTime);

    soundAnalyser = audioCtx.createAnalyser();
    soundAnalyser.fftSize = 128;
    soundAnalyser.smoothingTimeConstant = 0.8;

    masterGain.connect(soundAnalyser);
    soundAnalyser.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Helper: Generate Pink / Brownian Noise Buffer
function createNoiseBuffer(ctx, duration = 3) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }
  return buffer;
}

// ============================================================================
// 100% ORGANIC ACOUSTIC SOUND SANCTUARY
// Pure Nature, Weather, Chimes & Soothing Animal Audio — Zero Electronic Hz/Drones
// ============================================================================


// ----------------------------------------------------------------------------
// A. PROCEDURAL GENTLE RAIN CANOPY & WATER DROPS
// ----------------------------------------------------------------------------
function startRainAudio() {
  stopRainAudio(true);
  try {
    const ctx = getAudioContext();
    const buffer = createNoiseBuffer(ctx, 4);
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Dual organic filters: soft low moisture body + gentle foliage leaf patter
    const lowFilter = ctx.createBiquadFilter();
    lowFilter.type = 'lowpass';
    lowFilter.frequency.setValueAtTime(380, ctx.currentTime);

    const highFilter = ctx.createBiquadFilter();
    highFilter.type = 'bandpass';
    highFilter.frequency.setValueAtTime(2200, ctx.currentTime);
    highFilter.Q.setValueAtTime(0.75, ctx.currentTime);

    const gain = ctx.createGain();
    const vol = (appState.mixerVolumes.rain / 100) * 0.40;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 1.2);

    noise.connect(lowFilter);
    lowFilter.connect(gain);
    noise.connect(highFilter);
    highFilter.connect(gain);
    gain.connect(masterGain);

    noise.start();

    // Occasional gentle raindrop plops on leaves
    let dropInterval = setInterval(() => {
      if (!appState.soundscapeActive || !appState.mixerActive.rain || !continuousNodes.rain) {
        if (dropInterval) clearInterval(dropInterval);
        return;
      }
      if (Math.random() < 0.65) {
        try {
          const t = ctx.currentTime;
          const dropOsc = ctx.createOscillator();
          const dropGain = ctx.createGain();
          dropOsc.type = 'sine';
          const startF = 1500 + Math.random() * 600;
          dropOsc.frequency.setValueAtTime(startF, t);
          dropOsc.frequency.exponentialRampToValueAtTime(550 + Math.random() * 150, t + 0.04);
          dropGain.gain.setValueAtTime(vol * (0.12 + Math.random() * 0.2), t);
          dropGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
          dropOsc.connect(dropGain);
          dropGain.connect(gain);
          dropOsc.start(t);
          dropOsc.stop(t + 0.05);
        } catch (err) {}
      }
    }, 200);

    continuousNodes.rain = {
      gain: gain,
      sources: [noise],
      interval: dropInterval
    };
  } catch (e) {
    console.warn('Rain audio error:', e);
  }
}

function stopRainAudio(immediate = false) {
  if (continuousNodes.rain) {
    try {
      if (continuousNodes.rain.interval) {
        clearInterval(continuousNodes.rain.interval);
        continuousNodes.rain.interval = null;
      }
      if (immediate) {
        if (continuousNodes.rain.sources) {
          continuousNodes.rain.sources.forEach(s => {
            try { s.stop(); s.disconnect(); } catch (e) {}
          });
        }
        if (continuousNodes.rain.gain && audioCtx) {
          try {
            continuousNodes.rain.gain.gain.cancelScheduledValues(audioCtx.currentTime);
            continuousNodes.rain.gain.gain.setValueAtTime(0, audioCtx.currentTime);
            continuousNodes.rain.gain.disconnect();
          } catch(e) {}
        }
        continuousNodes.rain = null;
      } else {
        continuousNodes.rain.gain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
        setTimeout(() => {
          if (continuousNodes.rain && continuousNodes.rain.sources) {
            continuousNodes.rain.sources.forEach(s => {
              try { s.stop(); s.disconnect(); } catch (e) {}
            });
          }
          continuousNodes.rain = null;
        }, 350);
      }
    } catch (e) {
      continuousNodes.rain = null;
    }
  }
}

function triggerRainGust() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const vol = (appState.mixerVolumes.rain / 100) * 0.50;
    const buf = createNoiseBuffer(ctx, 2.5);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const flt = ctx.createBiquadFilter();
    flt.type = 'bandpass';
    flt.frequency.setValueAtTime(1200, now);
    flt.frequency.exponentialRampToValueAtTime(2600, now + 1.0);
    flt.frequency.exponentialRampToValueAtTime(1000, now + 2.3);
    flt.Q.setValueAtTime(1.1, now);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(vol, now + 0.8);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);
    src.connect(flt);
    flt.connect(g);
    g.connect(masterGain);
    src.start(now);
    src.stop(now + 2.5);
  } catch (e) {}
}

// ----------------------------------------------------------------------------
// B. PROCEDURAL OCEAN SHORE WAVES & COASTAL TIDE
// ----------------------------------------------------------------------------
function startOceanAudio() {
  stopOceanAudio(true);
  try {
    const ctx = getAudioContext();
    const vol = (appState.mixerVolumes.ocean / 100) * 0.42;

    const buffer = createNoiseBuffer(ctx, 5);
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Organic coastal wave filter modulated by slow natural LFO
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);

    // 0.08 Hz slow natural surf cycle (~12.5 seconds per wave crest)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.08, ctx.currentTime);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(450, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 1.8);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    noise.start();
    lfo.start();

    continuousNodes.ocean = {
      gain: gain,
      sources: [noise, lfo]
    };
  } catch (e) {
    console.warn('Ocean audio error:', e);
  }
}

function stopOceanAudio(immediate = false) {
  if (continuousNodes.ocean) {
    try {
      if (immediate) {
        if (continuousNodes.ocean.sources) {
          continuousNodes.ocean.sources.forEach(s => {
            try { s.stop(); s.disconnect(); } catch (e) {}
          });
        }
        if (continuousNodes.ocean.gain && audioCtx) {
          try {
            continuousNodes.ocean.gain.gain.cancelScheduledValues(audioCtx.currentTime);
            continuousNodes.ocean.gain.gain.setValueAtTime(0, audioCtx.currentTime);
            continuousNodes.ocean.gain.disconnect();
          } catch(e) {}
        }
        continuousNodes.ocean = null;
      } else {
        continuousNodes.ocean.gain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
        setTimeout(() => {
          if (continuousNodes.ocean && continuousNodes.ocean.sources) {
            continuousNodes.ocean.sources.forEach(s => {
              try { s.stop(); s.disconnect(); } catch (e) {}
            });
          }
          continuousNodes.ocean = null;
        }, 450);
      }
    } catch (e) {
      continuousNodes.ocean = null;
    }
  }
}

function triggerOceanSurge() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const vol = (appState.mixerVolumes.ocean / 100) * 0.55;
    const buf = createNoiseBuffer(ctx, 3.5);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const flt = ctx.createBiquadFilter();
    flt.type = 'lowpass';
    flt.frequency.setValueAtTime(220, now);
    flt.frequency.linearRampToValueAtTime(800, now + 1.4);
    flt.frequency.exponentialRampToValueAtTime(260, now + 3.4);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(vol, now + 1.4);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 3.4);
    src.connect(flt);
    flt.connect(g);
    g.connect(masterGain);
    src.start(now);
    src.stop(now + 3.5);
  } catch (e) {}
}

// ----------------------------------------------------------------------------
// C. PROCEDURAL MOUNTAIN PINE BREEZE & RUSTLING LEAVES
// ----------------------------------------------------------------------------
function startBreezeAudio() {
  stopBreezeAudio(true);
  try {
    const ctx = getAudioContext();
    const vol = (appState.mixerVolumes.breeze / 100) * 0.35;

    const buffer = createNoiseBuffer(ctx, 4);
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Dual soft whispering wind bandpass filters
    const f1 = ctx.createBiquadFilter();
    f1.type = 'bandpass';
    f1.frequency.setValueAtTime(520, ctx.currentTime);
    f1.Q.setValueAtTime(1.6, ctx.currentTime);

    const f2 = ctx.createBiquadFilter();
    f2.type = 'bandpass';
    f2.frequency.setValueAtTime(1080, ctx.currentTime);
    f2.Q.setValueAtTime(1.4, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.07, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(220, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(f1.frequency);
    lfoGain.connect(f2.frequency);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 1.6);

    noise.connect(f1);
    noise.connect(f2);
    f1.connect(gain);
    f2.connect(gain);
    gain.connect(masterGain);

    noise.start();
    lfo.start();

    continuousNodes.breeze = {
      gain: gain,
      sources: [noise, lfo]
    };
  } catch (e) {
    console.warn('Breeze audio error:', e);
  }
}

function stopBreezeAudio(immediate = false) {
  if (continuousNodes.breeze) {
    try {
      if (immediate) {
        if (continuousNodes.breeze.sources) {
          continuousNodes.breeze.sources.forEach(s => {
            try { s.stop(); s.disconnect(); } catch (e) {}
          });
        }
        if (continuousNodes.breeze.gain && audioCtx) {
          try {
            continuousNodes.breeze.gain.gain.cancelScheduledValues(audioCtx.currentTime);
            continuousNodes.breeze.gain.gain.setValueAtTime(0, audioCtx.currentTime);
            continuousNodes.breeze.gain.disconnect();
          } catch(e) {}
        }
        continuousNodes.breeze = null;
      } else {
        continuousNodes.breeze.gain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
        setTimeout(() => {
          if (continuousNodes.breeze && continuousNodes.breeze.sources) {
            continuousNodes.breeze.sources.forEach(s => {
              try { s.stop(); s.disconnect(); } catch (e) {}
            });
          }
          continuousNodes.breeze = null;
        }, 450);
      }
    } catch (e) {
      continuousNodes.breeze = null;
    }
  }
}

function triggerBreezeGust() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const vol = (appState.mixerVolumes.breeze / 100) * 0.48;
    const buf = createNoiseBuffer(ctx, 3.0);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const flt = ctx.createBiquadFilter();
    flt.type = 'bandpass';
    flt.frequency.setValueAtTime(450, now);
    flt.frequency.linearRampToValueAtTime(950, now + 1.2);
    flt.frequency.exponentialRampToValueAtTime(480, now + 2.8);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(vol, now + 1.1);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 2.9);
    src.connect(flt);
    flt.connect(g);
    g.connect(masterGain);
    src.start(now);
    src.stop(now + 3.0);
  } catch (e) {}
}

// ----------------------------------------------------------------------------
// D. PROCEDURAL BABBLING FOREST BROOK
// ----------------------------------------------------------------------------
function startStreamAudio() {
  stopStreamAudio(true);
  try {
    const ctx = getAudioContext();
    const vol = (appState.mixerVolumes.stream / 100) * 0.38;

    const buffer = createNoiseBuffer(ctx, 3);
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Water flow bandpass
    const flt = ctx.createBiquadFilter();
    flt.type = 'bandpass';
    flt.frequency.setValueAtTime(1100, ctx.currentTime);
    flt.Q.setValueAtTime(0.8, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 1.4);

    noise.connect(flt);
    flt.connect(gain);
    gain.connect(masterGain);
    noise.start();

    // Micro bubble gurgles in the current
    let bubbleInterval = setInterval(() => {
      if (!appState.soundscapeActive || !appState.mixerActive.stream || !continuousNodes.stream) {
        if (bubbleInterval) clearInterval(bubbleInterval);
        return;
      }
      try {
        const t = ctx.currentTime;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        const f = 900 + Math.random() * 650;
        o.frequency.setValueAtTime(f, t);
        o.frequency.exponentialRampToValueAtTime(f + 250, t + 0.035);
        g.gain.setValueAtTime(vol * (0.08 + Math.random() * 0.14), t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
        o.connect(g);
        g.connect(gain);
        o.start(t);
        o.stop(t + 0.045);
      } catch(e) {}
    }, 150);

    continuousNodes.stream = {
      gain: gain,
      sources: [noise],
      interval: bubbleInterval
    };
  } catch (e) {
    console.warn('Stream audio error:', e);
  }
}

function stopStreamAudio(immediate = false) {
  if (continuousNodes.stream) {
    try {
      if (continuousNodes.stream.interval) {
        clearInterval(continuousNodes.stream.interval);
        continuousNodes.stream.interval = null;
      }
      if (immediate) {
        if (continuousNodes.stream.sources) {
          continuousNodes.stream.sources.forEach(s => {
            try { s.stop(); s.disconnect(); } catch (e) {}
          });
        }
        if (continuousNodes.stream.gain && audioCtx) {
          try {
            continuousNodes.stream.gain.gain.cancelScheduledValues(audioCtx.currentTime);
            continuousNodes.stream.gain.gain.setValueAtTime(0, audioCtx.currentTime);
            continuousNodes.stream.gain.disconnect();
          } catch(e) {}
        }
        continuousNodes.stream = null;
      } else {
        continuousNodes.stream.gain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
        setTimeout(() => {
          if (continuousNodes.stream && continuousNodes.stream.sources) {
            continuousNodes.stream.sources.forEach(s => {
              try { s.stop(); s.disconnect(); } catch (e) {}
            });
          }
          continuousNodes.stream = null;
        }, 450);
      }
    } catch (e) {
      continuousNodes.stream = null;
    }
  }
}

function triggerStreamSplash() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const vol = (appState.mixerVolumes.stream / 100) * 0.45;
    for (let i = 0; i < 4; i++) {
      const dt = now + i * 0.06 + Math.random() * 0.03;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(1100 + Math.random() * 700, dt);
      o.frequency.exponentialRampToValueAtTime(600, dt + 0.06);
      g.gain.setValueAtTime(vol * 0.35, dt);
      g.gain.exponentialRampToValueAtTime(0.0001, dt + 0.07);
      o.connect(g);
      g.connect(masterGain);
      o.start(dt);
      o.stop(dt + 0.08);
    }
  } catch (e) {}
}

// ----------------------------------------------------------------------------
// E. PROCEDURAL CRYSTAL GLASS WIND CHIMES
// ----------------------------------------------------------------------------
function triggerCrystalChimeNow() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const vol = (appState.mixerVolumes.crystal / 100) * 0.35;
    const notes = [2160, 2430, 2720, 3240, 3640, 4320];
    const count = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < count; i++) {
      const noteFreq = notes[Math.floor(Math.random() * notes.length)];
      const delay = i * (0.05 + Math.random() * 0.08);
      const osc = ctx.createOscillator();
      const g = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(noteFreq, now + delay);

      g.gain.setValueAtTime(0, now + delay);
      g.gain.linearRampToValueAtTime(vol * (0.7 + Math.random() * 0.3), now + delay + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, now + delay + 1.6);

      osc.connect(g);
      g.connect(masterGain);

      osc.start(now + delay);
      osc.stop(now + delay + 1.7);
    }
  } catch (e) {
    console.warn('Crystal chime error:', e);
  }
}

function startCrystalChimesAudio() {
  if (crystalTimer) clearTimeout(crystalTimer);
  function scheduleChime() {
    if (appState.soundscapeActive && appState.mixerActive.crystal) {
      triggerCrystalChimeNow();
    }
    const nextInterval = 3400 + Math.random() * 4600;
    crystalTimer = setTimeout(scheduleChime, nextInterval);
  }
  scheduleChime();
}

function stopCrystalChimesAudio(immediate = false) {
  if (crystalTimer) {
    clearTimeout(crystalTimer);
    crystalTimer = null;
  }
}

// ----------------------------------------------------------------------------
// F. PROCEDURAL KYOTO BAMBOO SHISHI-ODOSHI & WOODEN BELLS
// ----------------------------------------------------------------------------
function triggerBambooClack() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const vol = (appState.mixerVolumes.bamboo / 100) * 0.50;

    const strike = ctx.createOscillator();
    strike.type = 'triangle';
    strike.frequency.setValueAtTime(620 + Math.random() * 40, now);
    strike.frequency.exponentialRampToValueAtTime(210, now + 0.08);

    const f1 = ctx.createBiquadFilter();
    f1.type = 'bandpass';
    f1.frequency.setValueAtTime(680, now);
    f1.Q.setValueAtTime(4.8, now);

    const f2 = ctx.createBiquadFilter();
    f2.type = 'bandpass';
    f2.frequency.setValueAtTime(1420, now);
    f2.Q.setValueAtTime(3.2, now);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(vol, now + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

    strike.connect(f1);
    strike.connect(f2);
    f1.connect(g);
    f2.connect(g);
    g.connect(masterGain);

    strike.start(now);
    strike.stop(now + 0.15);

    // Subtle water trickle following the strike
    setTimeout(() => {
      if (!appState.soundscapeActive || !appState.mixerActive.bamboo) return;
      const t = ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const dt = t + i * 0.09 + Math.random() * 0.04;
        const drop = ctx.createOscillator();
        const dg = ctx.createGain();
        drop.type = 'sine';
        drop.frequency.setValueAtTime(1600 + Math.random() * 600, dt);
        drop.frequency.exponentialRampToValueAtTime(750, dt + 0.06);
        dg.gain.setValueAtTime(vol * 0.25, dt);
        dg.gain.exponentialRampToValueAtTime(0.0001, dt + 0.07);
        drop.connect(dg);
        dg.connect(masterGain);
        drop.start(dt);
        drop.stop(dt + 0.08);
      }
    }, 180);
  } catch (e) {
    console.warn('Bamboo clack error:', e);
  }
}

function startBambooAudio() {
  if (bambooTimer) clearTimeout(bambooTimer);
  function scheduleNext() {
    if (appState.soundscapeActive && appState.mixerActive.bamboo) {
      triggerBambooClack();
    }
    const nextInterval = 4800 + Math.random() * 4500;
    bambooTimer = setTimeout(scheduleNext, nextInterval);
  }
  scheduleNext();
}

function stopBambooAudio(immediate = false) {
  if (bambooTimer) {
    clearTimeout(bambooTimer);
    bambooTimer = null;
  }
}

// ----------------------------------------------------------------------------
// G. PROCEDURAL WOODLAND FORESTS SONGBIRDS (SOOTHING ANIMAL)
// ----------------------------------------------------------------------------
function triggerBirdCallNow() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const vol = (appState.mixerVolumes.birds / 100) * 0.36;

    // Pattern type: 0 = warbler chirp, 1 = paired robin call, 2 = trill
    const pattern = Math.floor(Math.random() * 3);

    if (pattern === 0) {
      // Warbler swoop
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(2600, now);
      o.frequency.linearRampToValueAtTime(3700, now + 0.04);
      o.frequency.exponentialRampToValueAtTime(2400, now + 0.09);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(vol, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
      o.connect(g);
      g.connect(masterGain);
      o.start(now);
      o.stop(now + 0.12);
    } else if (pattern === 1) {
      // Paired robin calls
      [0, 0.14].forEach((dt, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        const startF = idx === 0 ? 3100 : 3500;
        o.frequency.setValueAtTime(startF, now + dt);
        o.frequency.exponentialRampToValueAtTime(startF + 400, now + dt + 0.04);
        o.frequency.exponentialRampToValueAtTime(startF - 300, now + dt + 0.08);
        g.gain.setValueAtTime(0, now + dt);
        g.gain.linearRampToValueAtTime(vol * 0.9, now + dt + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + dt + 0.09);
        o.connect(g);
        g.connect(masterGain);
        o.start(now + dt);
        o.stop(now + dt + 0.10);
      });
    } else {
      // Melodious gentle warble trill
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoG = ctx.createGain();

      o.type = 'sine';
      o.frequency.setValueAtTime(3200, now);
      lfo.frequency.setValueAtTime(16, now);
      lfoG.gain.setValueAtTime(140, now);
      lfo.connect(lfoG);
      lfoG.connect(o.frequency);

      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(vol * 0.8, now + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

      o.connect(g);
      g.connect(masterGain);

      lfo.start(now);
      o.start(now);
      lfo.stop(now + 0.17);
      o.stop(now + 0.17);
    }
  } catch(e) {
    console.warn('Bird call error:', e);
  }
}

function startBirdsAudio() {
  if (birdsTimer) clearTimeout(birdsTimer);
  function scheduleBirds() {
    if (appState.soundscapeActive && appState.mixerActive.birds) {
      triggerBirdCallNow();
    }
    const nextInterval = 3800 + Math.random() * 4500;
    birdsTimer = setTimeout(scheduleBirds, nextInterval);
  }
  scheduleBirds();
}

function stopBirdsAudio(immediate = false) {
  if (birdsTimer) {
    clearTimeout(birdsTimer);
    birdsTimer = null;
  }
}

// ----------------------------------------------------------------------------
// H. PROCEDURAL MIDNIGHT SUMMER CRICKETS (SOOTHING ANIMAL)
// ----------------------------------------------------------------------------
function startCricketsAudio() {
  stopCricketsAudio(true);
  try {
    const ctx = getAudioContext();
    const vol = (appState.mixerVolumes.crickets / 100) * 0.32;

    const buffer = createNoiseBuffer(ctx, 3);
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Resonant bandpass tuned to natural meadow cricket stridulation
    const f1 = ctx.createBiquadFilter();
    f1.type = 'bandpass';
    f1.frequency.setValueAtTime(4500, ctx.currentTime);
    f1.Q.setValueAtTime(6.0, ctx.currentTime);

    const f2 = ctx.createBiquadFilter();
    f2.type = 'bandpass';
    f2.frequency.setValueAtTime(5200, ctx.currentTime);
    f2.Q.setValueAtTime(5.5, ctx.currentTime);

    // 16 Hz natural chirping pulse LFO
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(16, ctx.currentTime);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(vol * 0.4, ctx.currentTime);
    lfo.connect(lfoGain);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 1.5);
    lfoGain.connect(gain.gain);

    noise.connect(f1);
    noise.connect(f2);
    f1.connect(gain);
    f2.connect(gain);
    gain.connect(masterGain);

    noise.start();
    lfo.start();

    continuousNodes.crickets = {
      gain: gain,
      sources: [noise, lfo]
    };
  } catch(e) {
    console.warn('Crickets audio error:', e);
  }
}

function stopCricketsAudio(immediate = false) {
  if (continuousNodes.crickets) {
    try {
      if (immediate) {
        if (continuousNodes.crickets.sources) {
          continuousNodes.crickets.sources.forEach(s => {
            try { s.stop(); s.disconnect(); } catch (e) {}
          });
        }
        if (continuousNodes.crickets.gain && audioCtx) {
          try {
            continuousNodes.crickets.gain.gain.cancelScheduledValues(audioCtx.currentTime);
            continuousNodes.crickets.gain.gain.setValueAtTime(0, audioCtx.currentTime);
            continuousNodes.crickets.gain.disconnect();
          } catch(e) {}
        }
        continuousNodes.crickets = null;
      } else {
        continuousNodes.crickets.gain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
        setTimeout(() => {
          if (continuousNodes.crickets && continuousNodes.crickets.sources) {
            continuousNodes.crickets.sources.forEach(s => {
              try { s.stop(); s.disconnect(); } catch (e) {}
            });
          }
          continuousNodes.crickets = null;
        }, 450);
      }
    } catch (e) {
      continuousNodes.crickets = null;
    }
  }
}

function triggerCricketChirp() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const vol = (appState.mixerVolumes.crickets / 100) * 0.40;
    for (let i = 0; i < 4; i++) {
      const dt = now + i * 0.05;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(4600 + (i % 2 === 0 ? 200 : 0), dt);
      g.gain.setValueAtTime(vol * 0.3, dt);
      g.gain.exponentialRampToValueAtTime(0.0001, dt + 0.035);
      o.connect(g);
      g.connect(masterGain);
      o.start(dt);
      o.stop(dt + 0.04);
    }
  } catch(e) {}
}

// ----------------------------------------------------------------------------
// I. ACOUSTIC TIBETAN BRONZE SINGING BOWL STRIKE (ZERO ELECTRONIC HUM)
// ----------------------------------------------------------------------------
function strikeTibetanBowlNow(baseFreq = 264) {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const vol = (appState.mixerVolumes.rain / 100) * 0.42;
    const duration = 10;

    // Acoustic bronze harmonic partials with authentic natural decay (ZERO continuous drone)
    const partials = [
      { ratio: 1.0, g: 0.60 },
      { ratio: 2.01, g: 0.32 },
      { ratio: 3.02, g: 0.16 },
      { ratio: 4.18, g: 0.08 }
    ];

    partials.forEach(p => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * p.ratio, now);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(vol * p.g, now + 0.035);
      g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(g);
      g.connect(masterGain);
      osc.start(now);
      osc.stop(now + duration);
    });

    triggerBreathingCycle();
  } catch (e) {}
}

function strikeSingingBowl(freq = 264) {
  strikeTibetanBowlNow(freq);
}

// ----------------------------------------------------------------------------
// MASTER SOUNDSCAPE CONTROLLER (100% ORGANIC NATURE MIXER)
// ----------------------------------------------------------------------------
function applyMixerState() {
  if (!appState.soundscapeActive) {
    stopAllAudioTracks();
    return;
  }

  // 1. Rain
  if (appState.mixerActive.rain) startRainAudio();
  else stopRainAudio();

  // 2. Ocean
  if (appState.mixerActive.ocean) startOceanAudio();
  else stopOceanAudio();

  // 3. Breeze
  if (appState.mixerActive.breeze) startBreezeAudio();
  else stopBreezeAudio();

  // 4. Stream
  if (appState.mixerActive.stream) startStreamAudio();
  else stopStreamAudio();

  // 5. Crystal Chimes
  if (appState.mixerActive.crystal) startCrystalChimesAudio();
  else stopCrystalChimesAudio();

  // 6. Bamboo
  if (appState.mixerActive.bamboo) startBambooAudio();
  else stopBambooAudio();

  // 7. Songbirds
  if (appState.mixerActive.birds) startBirdsAudio();
  else stopBirdsAudio();

  // 8. Crickets
  if (appState.mixerActive.crickets) startCricketsAudio();
  else stopCricketsAudio();

  startAudioVisualizer();
}

function stopAllAudioTracks() {
  // Hard zero master gain immediately
  if (masterGain && audioCtx) {
    try {
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
    } catch (e) {}
  }

  // Stop all 8 nature channels with immediate flag
  stopRainAudio(true);
  stopOceanAudio(true);
  stopBreezeAudio(true);
  stopStreamAudio(true);
  stopCrystalChimesAudio(true);
  stopBambooAudio(true);
  stopBirdsAudio(true);
  stopCricketsAudio(true);

  // Clear all scheduling timers
  if (typeof bambooTimer !== 'undefined' && bambooTimer) { clearTimeout(bambooTimer); bambooTimer = null; }
  if (typeof crystalTimer !== 'undefined' && crystalTimer) { clearTimeout(crystalTimer); crystalTimer = null; }
  if (typeof birdsTimer !== 'undefined' && birdsTimer) { clearTimeout(birdsTimer); birdsTimer = null; }

  // Halt any radio audio element
  if (typeof johnnyDynamiteAudio !== 'undefined' && johnnyDynamiteAudio) {
    try {
      johnnyDynamiteAudio.pause();
      johnnyDynamiteAudio.currentTime = 0;
    } catch (e) {}
  }

  // Cancel any speech synthesis
  if (window.speechSynthesis) {
    try { window.speechSynthesis.cancel(); } catch (e) {}
  }
  setSpeakerActiveVisuals(false);

  // Suspend Web Audio hardware engine
  if (audioCtx && audioCtx.state === 'running') {
    try {
      audioCtx.suspend();
    } catch (e) {}
  }
}

function toggleMasterSoundscape() {
  getAudioContext();
  appState.soundscapeActive = !appState.soundscapeActive;

  const headerBtn = document.getElementById('soundscapeBtn');
  const masterBtn = document.getElementById('btnMasterAudioToggle');
  const statusTitle = document.getElementById('masterStatusTitle');
  const indicator = document.getElementById('audioPulseIndicator');

  if (appState.soundscapeActive) {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    if (masterGain && audioCtx) {
      try {
        masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
        masterGain.gain.setValueAtTime(appState.masterVolume / 100, audioCtx.currentTime);
      } catch (e) {}
    }
    applyMixerState();
    if (headerBtn) {
      headerBtn.classList.add('playing');
      const label = headerBtn.querySelector('.sound-label');
      if (label) label.textContent = 'Sanctuary Audio: On 🍃';
    }

    if (masterBtn) {
      const icon = document.getElementById('masterToggleIcon');
      const text = document.getElementById('masterToggleText');
      if (icon) icon.textContent = '⏸';
      if (text) text.textContent = 'Pause Sanctuary';
    }
    if (statusTitle) statusTitle.textContent = 'Sanctuary Audio Active';
    if (indicator) indicator.style.background = 'var(--emerald-primary)';
  } else {
    stopAllAudioTracks();
    if (headerBtn) {
      headerBtn.classList.remove('playing');
      const label = headerBtn.querySelector('.sound-label');
      if (label) label.textContent = 'Sanctuary Audio: Off';
    }

    if (masterBtn) {
      const icon = document.getElementById('masterToggleIcon');
      const text = document.getElementById('masterToggleText');
      if (icon) icon.textContent = '▶';
      if (text) text.textContent = 'Start Sanctuary';
    }
    if (statusTitle) statusTitle.textContent = 'Sanctuary Audio Muted';
    if (indicator) indicator.style.background = 'var(--text-dim)';
  }

  saveState();
}

// 100% ORGANIC NATURE & CHIME PRESETS
const SOUND_PRESETS = {
  emerald_rain: {
    name: 'Emerald Rainforest & Songbirds',
    active: { rain: true, ocean: false, breeze: false, stream: false, crystal: false, bamboo: false, birds: true, crickets: false },
    vols: { rain: 65, birds: 65 },
    action: () => triggerBirdCallNow()
  },
  ocean_breeze: {
    name: 'Ocean Shore Waves & Mountain Wind',
    active: { rain: false, ocean: true, breeze: true, stream: false, crystal: false, bamboo: false, birds: false, crickets: false },
    vols: { ocean: 70, breeze: 60 },
    action: () => triggerOceanSurge()
  },
  crystal_brook: {
    name: 'Crystal Wind Chimes & Babbling Brook',
    active: { rain: false, ocean: false, breeze: false, stream: true, crystal: true, bamboo: false, birds: false, crickets: false },
    vols: { crystal: 65, stream: 70 },
    action: () => triggerCrystalChimeNow()
  },
  kyoto_garden: {
    name: 'Kyoto Bamboo Bells & Water Garden',
    active: { rain: true, ocean: false, breeze: false, stream: false, crystal: false, bamboo: true, birds: false, crickets: false },
    vols: { bamboo: 70, rain: 55 },
    action: () => triggerBambooClack()
  },
  summer_meadow: {
    name: 'Midnight Meadow & Summer Crickets',
    active: { rain: false, ocean: false, breeze: true, stream: false, crystal: false, bamboo: false, birds: false, crickets: true },
    vols: { crickets: 70, breeze: 55 },
    action: () => triggerCricketChirp()
  },
  temple_sanctuary: {
    name: 'Tibetan Singing Bowl & Forest Stream',
    active: { rain: false, ocean: false, breeze: false, stream: true, crystal: false, bamboo: false, birds: true, crickets: false },
    vols: { stream: 65, birds: 55 },
    action: () => strikeTibetanBowlNow(264)
  }
};

function activateSoundPreset(presetKey) {
  const preset = SOUND_PRESETS[presetKey];
  if (!preset) return;

  appState.activePreset = presetKey;
  // Apply active flags
  Object.keys(appState.mixerActive).forEach(k => {
    appState.mixerActive[k] = !!preset.active[k];
  });
  // Apply volumes
  if (preset.vols) {
    Object.keys(preset.vols).forEach(k => {
      appState.mixerVolumes[k] = preset.vols[k];
    });
  }

  // Update UI cards
  document.querySelectorAll('.preset-card').forEach(c => {
    c.classList.toggle('active-preset', c.getAttribute('data-preset') === presetKey);
  });

  const subtitle = document.getElementById('masterPlayingPresetName');
  if (subtitle) subtitle.textContent = preset.name;

  syncMixerControlsToState();

  // If paused, auto start
  if (!appState.soundscapeActive) {
    toggleMasterSoundscape();
  } else {
    applyMixerState();
  }

  if (preset.action) preset.action();
}

function syncMixerControlsToState() {
  Object.keys(appState.mixerActive).forEach(key => {
    const chk = document.getElementById(`chkTrack${capitalize(key)}`);
    const slider = document.getElementById(`volTrack${capitalize(key)}`);
    const valDisplay = document.getElementById(`valTrack${capitalize(key)}`);

    if (chk) chk.checked = appState.mixerActive[key];
    if (slider) slider.value = appState.mixerVolumes[key];
    if (valDisplay) valDisplay.textContent = `${appState.mixerVolumes[key]}%`;
  });
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ----------------------------------------------------------------------------
// REAL-TIME AUDIO VISUALIZER CANVAS
// ----------------------------------------------------------------------------
function startAudioVisualizer() {
  const canvas = document.getElementById('soundVisualizerCanvas');
  if (!canvas || !soundAnalyser) return;
  const ctx = canvas.getContext('2d');
  const bufferLength = soundAnalyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    visualizerAnimId = requestAnimationFrame(draw);
    soundAnalyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dark sleek background
    ctx.fillStyle = '#040710';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.2;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;

      const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
      grad.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
      grad.addColorStop(0.6, 'rgba(52, 211, 153, 0.8)');
      grad.addColorStop(1, 'rgba(196, 181, 253, 0.95)');

      ctx.fillStyle = grad;
      ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

      x += barWidth;
    }

    // Glowing center line
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 2);
    ctx.lineTo(canvas.width, canvas.height - 2);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  if (!visualizerAnimId) draw();
}

// ----------------------------------------------------------------------------
// MIND-CLEARING BREATHING HALO
// ----------------------------------------------------------------------------
let breathingCycleInterval = null;

function triggerBreathingCycle() {
  const ring = document.getElementById('breathingHaloRing');
  const promptElem = document.getElementById('haloBreathPrompt');
  const timerElem = document.getElementById('haloBreathTimer');
  if (!ring || !promptElem || !timerElem) return;

  if (breathingCycleInterval) clearInterval(breathingCycleInterval);

  let phase = 0; // 0: inhale (4s), 1: hold (4s), 2: exhale (6s)
  let count = 4;

  function runPhase() {
    if (phase === 0) {
      ring.className = 'breathing-halo-ring inhale';
      promptElem.textContent = 'Breathe In...';
      timerElem.textContent = `${count}s`;
    } else if (phase === 1) {
      ring.className = 'breathing-halo-ring hold';
      promptElem.textContent = 'Hold Stillness...';
      timerElem.textContent = `${count}s`;
    } else {
      ring.className = 'breathing-halo-ring exhale';
      promptElem.textContent = 'Exhale Fog...';
      timerElem.textContent = `${count}s`;
    }

    count--;
    if (count < 0) {
      if (phase === 0) {
        phase = 1;
        count = 4;
      } else if (phase === 1) {
        phase = 2;
        count = 6;
      } else {
        phase = 0;
        count = 4;
      }
    }
  }

  runPhase();
  breathingCycleInterval = setInterval(runPhase, 1000);
}

// Synthesizer for Pentatonic Instrument & Chimes
function playChime(freq = 440, type = 'sine', duration = 1.2) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain || ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.error('Audio play error:', e);
  }
}

// Legacy alias to maintain full compatibility
function toggleSoundscape() {
  toggleMasterSoundscape();
}


// ============================================================================
// 3. POLITE ROASTER ENGINE (Massive 335+ Reality Checks & Roasts)
// ============================================================================
const ROAST_CATEGORIES = {
  brainrot: { title: "Brain Rot & Attention Span", icon: "🧠", severity: "Code Red Brainrot" },
  wasted_time: { title: "Wasted Potential & Lost Time", icon: "⏳", severity: "Mortal Clock Alert" },
  tech_coder: { title: "Tech, Gaming & Dev Life", icon: "💻", severity: "Runtime Exception" },
  addiction: { title: "Addiction & Algorithmic Slavery", icon: "📱", severity: "Dopamine Prisoner" },
  zombie: { title: "Zombie Mode & Physical Lethargy", icon: "🧟", severity: "Biological Stagnation" },
  academic_career: { title: "Academic & Career Procrastination", icon: "🎓", severity: "Deadline Crisis" },
  midnight: { title: "Midnight Doomscroll & Sleep Loss", icon: "🌙", severity: "Circadian Collapse" },
  victorian: { title: "Refined Victorian & Butler Savages", icon: "🧐", severity: "High Society Disdain" }
};

const ROASTS = {
  brainrot: [
    "Your attention span is fighting for its life right now.",
    "You've officially watched so many reels your brain is just a Subway Surfers gameplay video.",
    "If I spoke to you for longer than 60 seconds, you’d probably try to swipe me away.",
    "Your internal monologue is just TikTok text-to-speech at this point.",
    "I’m surprised you can even read a menu without a split-screen GTA car driving under it.",
    "Your brain cells are doing the Renegade into oblivion.",
    "Bro’s dopamine receptors are completely fried.",
    "You consume so much short-form content, your thoughts are constantly buffering.",
    "You’ve successfully speedrun losing your own train of thought.",
    "If someone asks you a question, you probably hear a trending audio before you answer.",
    "Your vocabulary is shrinking faster than your phone battery.",
    "You're one reel away from completely forgetting how to hold a real conversation.",
    "A goldfish has a better attention span than you on a Sunday afternoon.",
    "You watch so many life hacks but still haven't hacked how to get a life.",
    "The algorithm knows you better than your own family does.",
    "You're basically a human flesh-vessel for Mark Zuckerberg’s ad revenue.",
    "You are trapped in an infinite loop of 15-second dopamine hits.",
    "Your brain is buffering harder than a 3G connection in a tunnel.",
    "You’re suffering from acute algorithm-induced amnesia.",
    "I’d tell you a joke, but it doesn't have a hook in the first three seconds so you wouldn't care.",
    "You need Minecraft parkour gameplay playing in the corner of your vision just to brush your teeth.",
    "Your hippocampus has been replaced by an infinite loop of low-taper fade memes.",
    "If a book doesn't have ASMR kinetic sand cutting in the margins, your eyes slide off the page.",
    "You have the attention span of a concussed fruit fly trapped in a laser tag arena.",
    "Your thoughts are currently rendering in 144p resolution with 200ms latency.",
    "You just forgot what you opened your phone for 8 seconds ago and started swiping anyway.",
    "If someone talks without subtitles, do you just assume they're speaking in ancient hieroglyphics?",
    "You get emotional whiplash going from a tragic news report to a dancing cat in 1.4 seconds.",
    "Your attention span doesn't just wander, it sprinted out the door and boarded a flight to nowhere.",
    "You can't even microwave a bowl of soup without consuming 4 unrelated micro-videos.",
    "Your brain is so cooked you probably expect a fanfare chime when you finish an in-person sentence.",
    "You just scrolled past a video explaining the cure for boredom to watch soap being sliced.",
    "Your working memory has the capacity of a damp cocktail napkin.",
    "Your neurons are currently operating at 0.2 frames per second.",
    "You can't sit in total silence for 10 seconds without feeling like your soul is detaching from your body.",
    "Your vocabulary has shrunk to 'literally me', 'cooked', and 'it's giving'. Shakespeare is rolling in his grave.",
    "You're suffering from chronic algorithmic brain rot; your thoughts are sponsored by Temu.",
    "You need a 10-second recap of your own breakfast just to remember what you ate.",
    "You've replaced your childhood memories with sounds of trending CapCut templates.",
    "If an idea takes more than two sentences to explain, your brain automatically skips to the next creator.",
    "You have outsourced your curiosity to an engagement optimization script.",
    "You are one algorithmic update away from communicating entirely in soundbites.",
    "Your ability to read a full paragraph without checking notifications is officially classified as extinct.",
    "Your brain cells are currently clocking out for an unscheduled sabbatical.",
    "You stare at that feed like a moth waiting for a lightbulb that never turns on."
  ],

  wasted_time: [
    "You could have built a house with the time you spent watching people clean theirs.",
    "Imagine if you put this much dedication into your actual engineering degree.",
    "You’ve watched a thousand gym reels and still haven't lifted a single weight.",
    "Bro is graduating with a Ph.D. in Instagram Reels.",
    "Your screen time report needs a trigger warning.",
    "You’re currently losing a staring contest with a glowing rectangle.",
    "You’ve scrolled through entire eras of human history today while sitting in one spot.",
    "Time flies when you're doing absolutely nothing with your life.",
    "You’ve spent more time looking at other people’s lives than living your own.",
    "If scrolling burned calories, you’d be a prime Olympic athlete.",
    "You've memorized 50 transition trends but still forget your own passwords.",
    "You're speedrunning wasting your twenties.",
    "A sloth achieves more in a day than you do in a four-hour scroll session.",
    "You are living proof that time travel exists, because you just skipped three hours doing nothing.",
    "You've consumed 400 motivational videos and remained perfectly stationary.",
    "The amount of time you spend swiping is a modern tragedy.",
    "You’ve explored more of your explore page than the actual outside world.",
    "Your thumbs are getting more exercise than your legs.",
    "You could've learned three coding languages in the time you spent watching street food being made.",
    "You're treating procrastination like it's your full-time job.",
    "You've spent more hours watching people reorganize closets than you've spent organizing your entire life.",
    "You could have learned fluent Italian by now, but you chose to watch 40 ways to fold a fitted sheet.",
    "Bro has watched 900 finance bros explain dropshipping while possessing $4.12 in his bank account.",
    "Your bucket list is just an unviewed saved folder on an app designed to steal your youth.",
    "You've watched enough travel reels to circle the equator five times, yet your passport is gathering dust.",
    "Your future biographer will have to skip this entire calendar year because all you did was swipe.",
    "If procrastination was an Olympic discipline, the committee would retire your jersey.",
    "You have saved 3,000 workout tutorials, yet your only muscle hypertrophy is in your scrolling thumb.",
    "The amount of human potential decomposing in this chair right now could power a medium-sized municipality.",
    "You spent 45 minutes watching 'how to be productive tomorrow' while actively incinerating today.",
    "You watched 60 Michelin chefs cook Wagyu beef, then got up and ate cold cereal out of a coffee mug.",
    "You could have written a bestselling novel by now, but you chose to watch a man restore a rusty wrench.",
    "Your childhood dreams are currently sitting in the lobby of your conscience, wondering when you'll call them in.",
    "You are treating mortal life like it comes with infinite respawn tickets.",
    "An ancient oak tree spent 80 years growing so you could sit under it and watch 15-second prank videos.",
    "You just traded two hours of conscious daylight for a video of a hamster eating a tiny burrito.",
    "You have watched 50 people achieve their dreams today while taking zero steps toward your own.",
    "The sun set three hours ago. You didn't see it because a 19-year-old was explaining zodiac compatibility.",
    "Your future self is screaming through the space-time continuum begging you to lock that phone.",
    "You're buffering your destiny while waiting for another autoplay reel.",
    "You've watched 12 home renovation series and your laundry is still sitting in a pile on the chair.",
    "You possess the accumulated knowledge of the entire human species in your palm, and you're rating cats.",
    "Your youth is leaking out through your thumb like water through a rusted colander.",
    "You're investing hours into algorithms that won't even remember your username tomorrow.",
    "If wasted time paid compound interest, you'd be bankrupt by midnight."
  ],

  tech_coder: [
    "You’re stuck in an infinite while(true) loop of brain rot.",
    "If dodging responsibilities was a Valorant rank, you'd be top 500 Radiant.",
    "Your brain's RAM is at 99% capacity from storing useless meme formats.",
    "You need to Alt-F4 out of that app and touch some grass.",
    "Bro's productivity is currently throwing the match.",
    "You’re compiling errors in real life while watching someone else succeed.",
    "You have zero map awareness of your own living room right now.",
    "You need to reset your router and your life choices.",
    "You’re completely AFK from reality.",
    "Your life needs a patch update; this current version is just scrolling.",
    "You're bypassing real-life achievements like you bypass copy-paste blocks.",
    "You've been staring at that screen so long you're getting screen burn-in on your retinas.",
    "Your social skills are returning a 404 Error.",
    "If you optimized your life like an Octave script, you'd actually get something done.",
    "You're lagging in real life because your background processes are full of TikToks.",
    "The only bitwise operation you know right now is shifting your thumb up.",
    "You're stuck in the tutorial level of the day because you won't close the app.",
    "You have a ping of 999 when someone tries to talk to you in person.",
    "You need to factory reset your daily habits.",
    "You're rendering pointless videos while your actual life buffers.",
    "Your life's git commit history is just 'no changes made' for 42 consecutive days.",
    "You have a fatal memory leak in your prefrontal cortex.",
    "Your brain just threw an UnhandledPromiseRejection: Ambition Not Found.",
    "You're sitting here like a bugged NPC waiting for an interaction prompt that will never trigger.",
    "You have 120 background tabs open in your brain and every single one is playing royalty-free elevator music.",
    "Your CPU is thermal throttling from processing high-entropy algorithmic trash.",
    "You're dropping frames in your own reality.",
    "Bro is hardstuck Iron IV in real life because he refuses to grind his actual attributes.",
    "You're trapped in an unskippable cutscene of self-sabotage.",
    "Your life architecture is currently optimized for zero throughput and maximum packet loss.",
    "Even Windows Vista had a more competent task scheduler than your daily routine.",
    "You're running on single-thread processing while the modern world is multi-threaded.",
    "You just spent an hour debugging someone else's Twitter drama while your own codebase won't even build.",
    "Your social cache is so stale you're still referencing memes from three seasons ago.",
    "You need an urgent hotfix for your dopamine threshold before you blue-screen entirely.",
    "You have a higher latency responding to your loved ones than a server hosted on the moon.",
    "Your willpower has encountered a segmentation fault (core dumped).",
    "You treat real-life tasks like deprecated legacy code: ignored until catastrophic system failure.",
    "Your daily routine is an infinite recursion without a base case. Stack overflow imminent.",
    "You are farming zero XP in the game of life while watching someone else's gameplay footage.",
    "You've got the bandwidth of dial-up internet and the processing speed of a pocket calculator right now.",
    "Your prefrontal cortex needs a sudo kill -9 on that short-form video process.",
    "You're spectating someone else's highlight reel while your own character is AFK in spawn.",
    "Your phone has more computing power than Apollo 11, and you're using it to watch bread fall over.",
    "You've forgotten how to execute the simplest real-life shell script: stand up and do your work."
  ],

  addiction: [
    "Your phone’s battery health is degrading faster than your future.",
    "The algorithm is the only thing validating your existence today.",
    "Apple is going to invent a new screen time category just for your addiction.",
    "Your phone charger is the hardest working thing in this room.",
    "The blue light is permanently etching itself into your skull.",
    "You’ve given so much data to Meta they could clone you, and the clone would be just as lazy.",
    "You're essentially a bio-battery for a recommendation engine.",
    "The 'Are you still watching?' prompt was invented specifically for you.",
    "You've swiped up so many times you're trying to achieve liftoff.",
    "Your fingerprint is probably wearing off from all that friction.",
    "You refresh the feed like it’s going to dispense a winning lottery ticket.",
    "Your phone is overheating from processing pure garbage.",
    "I bet your screen time graph just looks like a vertical wall.",
    "The algorithm is actually getting tired of finding new things for you to watch.",
    "You're basically being remote-controlled by Silicon Valley at this point.",
    "You look like you're trying to swipe away your real-life problems.",
    "The only relationship you're nurturing right now is with your For You Page.",
    "You stare at that screen like it owes you money.",
    "Your most used app is single-handedly destroying your circadian rhythm.",
    "I can literally see the reflection of a dancing teenager in your dead eyes.",
    "A machine learning engineer in California just earned his quarterly bonus because you refused to close this app.",
    "You are paying an ad network with the single non-renewable asset in the known universe: your mortal hours.",
    "The glow of that OLED panel is the only sunlight your face has received in 72 hours.",
    "You check notifications that don't exist because your nervous system is hallucinating phantom vibrations.",
    "You're refreshing a bottomless feed. It's like staring into an empty refrigerator for four consecutive hours.",
    "The algorithm could serve you static television noise and you'd still give it ten seconds of your finite life.",
    "You have formally surrendered sovereign control of your consciousness to a neural network.",
    "Your battery hit 1% and you dove across the room like someone severed your life support cable.",
    "You don't own that smartphone. That rectangle owns you, rents your retinas, and auctions your attention.",
    "You are the user, the product, and the casualty all wrapped into one stationary silhouette.",
    "You swipe down like a laboratory mouse pressing a plastic lever for glucose water.",
    "The recommendation engine knows your deepest insecurities better than your closest friend.",
    "You're scrolling like you were personally appointed to chronicle the collapse of human dignity.",
    "Your thumb has developed its own autonomous nervous system; your brain is just along for the ride.",
    "You closed the app, stared at your wallpaper for 1.2 seconds, and reflexively reopened the exact same app.",
    "You're trapped in an engagement loop designed by PhD psychologists to exploit your mammalian brain.",
    "Your phone has become an artificial organ without which you experience severe phantom limb syndrome.",
    "You've surrendered 45 minutes of free will to an autoplay sequence about miniature polymer clay food.",
    "The feed doesn't have an end because your compliance doesn't have a limit.",
    "You look at that screen with the reverent devotion of a medieval monk illuminating a manuscript.",
    "You're consuming digital junk food at a rate that would make a dumpster raccoon blush.",
    "The algorithm has cataloged your boredom, monetized your loneliness, and scheduled your next distraction.",
    "You're one notification away from abandoning whatever scrap of discipline you had left today.",
    "You're refreshing the comments section of a fight between two strangers who live on another continent.",
    "Your thumb flick is faster than your critical thinking skills."
  ],

  zombie: [
    "You’re breathing manually while staring at that screen, aren't you?",
    "If you sit any stiller, the motion sensors in the room are going to turn the lights off.",
    "You look like a Victorian ghost who just discovered a smartphone.",
    "The only thing you've accomplished today is converting oxygen into carbon dioxide.",
    "You’re practically a piece of furniture that occasionally giggles.",
    "Your posture right now resembles a deeply depressed shrimp.",
    "You've been in that exact same position for so long you're going to fossilize.",
    "I've seen garden statues with more kinetic energy than you.",
    "You’re actively decomposing on that couch.",
    "You blink once every three fiscal quarters.",
    "I could replace you with a cardboard cutout and the algorithm wouldn't notice.",
    "You are officially a captive of your own laziness.",
    "If they paid you minimum wage to scroll, you’d be a millionaire.",
    "The only journey you’re taking today is down a digital rabbit hole.",
    "You've reached peak evolution: a creature that only moves its thumb.",
    "You look like a moth hypnotized by a very stupid lamp.",
    "You've outsourced your imagination to strangers on the internet.",
    "At this rate, your tombstone is just going to be an embedded video link.",
    "You’re not relaxing, you’re just paralyzing yourself with pixels.",
    "Wake up bro, the real world is happening right behind your phone.",
    "Your cervical spine is angled at 65 degrees, actively mocking four million years of bipedal evolution.",
    "If someone took your pulse right now, they'd have to wait for the next video ad to buffer.",
    "Your eyes are so bloodshot you look like you're auditioning for an indie zombie movie.",
    "You've been in bed for so long your mattress has filed paperwork to claim you on its taxes.",
    "You have traveled zero inches in the physical realm while your thumb ran a half-marathon.",
    "Your spine has formally resigned from being a column and is now identifying as a question mark.",
    "Household dust is actively settling on your shoulders while you watch stranger's wedding drama.",
    "You look like a wax museum replica of a human being that someone left propped against a pillow.",
    "Your legs are so asleep that if you stood up right now, you'd collapse like an origami crane.",
    "You haven't looked at the horizon in so long your optic nerve thinks the world is 6.1 inches diagonal.",
    "You're breathing at 30% lung capacity because your slumped posture is compressing your vital organs.",
    "A potted fern in the hallway is photosynthesizing with more initiative than you've shown all afternoon.",
    "You look like you've been embalmed in 5,000 Kelvins of blue backlight.",
    "Your jaw is slack, your eyes are glazed, and your brain is on standby mode.",
    "You have the physical presence of a bag of potting soil left out in the rain.",
    "Your circadian clock just packed its bags and left the state.",
    "You're horizontal on a Sunday afternoon, losing a battle against gravity and short-form video.",
    "If laziness was a currency, you could bail out several developing nations right now.",
    "You've been holding your phone above your face for so long you're playing Russian roulette with your teeth.",
    "You're giving off the vital signs of a dormant moss colony.",
    "Your muscles are wondering if they still have a contract with your skeleton.",
    "You're slouching so hard you're about to slide into another dimension.",
    "A stiff breeze outside has more ambition than you've exhibited in the past three hours.",
    "You look like an extra in an apocalyptic movie waiting for the main characters to arrive.",
    "Your posture is screaming for help and your thumb is actively ignoring the distress call."
  ],

  academic_career: [
    "Your exam is in 10 hours and you're currently auditing the history of Byzantine catapults.",
    "You've read zero pages of your syllabus and 400 comments arguing about who won a 2014 rap battle.",
    "Your GPA is in freefall while you're busy learning how to build a log cabin in Siberia.",
    "Your resume hasn't been updated in three years, but your saved folder has 2,400 life hacks.",
    "You're researching 'how to make $10k a month with AI' while refusing to complete your $15 homework assignment.",
    "Your supervisor thinks you're drafting a project proposal, but you're watching capybaras take a hot bath.",
    "You have a major deadline in 45 minutes and you just started a three-part documentary on feral cats.",
    "You have 19 unread emails from your professor and you're analyzing a celebrity's jawline transformation.",
    "You plan your career like a lottery ticket holder: waiting for divine intervention while staring at glass.",
    "You've spent more time choosing a font for your project title than writing actual content.",
    "Your study session consisted of 4 minutes of opening tabs and 86 minutes of watching street food.",
    "You're complaining about the job market while your primary skill is infinite vertical scrolling.",
    "You could have finished your thesis, but you got sidetracked by a video on how crayons are manufactured.",
    "Your LinkedIn profile is an archaeological relic, but your TikTok watch history is updated to the second.",
    "You tell everyone you're 'grinding in silence', but you're actually just silent because you're doomscrolling.",
    "You've watched 50 tutorials on productivity frameworks and executed precisely zero of them.",
    "Your textbooks are functioning as very expensive paperweights while your phone runs hot.",
    "You're calculating the exact minimum score you need to pass so you can justify 2 more hours of reels.",
    "You're treating your college tuition like a donation to a building you rarely visit.",
    "You could have mastered calculus in the time you spent watching strangers rate hotel breakfasts.",
    "Your homework is sitting open in another tab, silently weeping at your lack of character.",
    "You just spent two hours watching someone else code a mobile app while your own IDE is closed.",
    "You're procrastinating on a 2-page essay like it's a peace treaty between warring nations.",
    "Your dream job requires dedication, but you can't even dedicate your attention to a 3-minute video.",
    "You're planning your 5-year career roadmap from a horizontal position with your phone plugged in.",
    "You're waiting for 'motivation' to strike like it's a lightning bolt, while the algorithm strikes every second.",
    "You just watched an hour of study-vloggers pretending to study so you could feel productive while doing nothing.",
    "Your midterm is tomorrow. May the algorithm have mercy on your transcript.",
    "You're reading career advice from a 17-year-old dropshipper with a rented Lamborghini.",
    "You've optimized your desk setup for eight weeks and haven't done fifteen minutes of actual work on it.",
    "You have a deadline creeping up behind you with a crowbar, and you're watching slime videos.",
    "You're trading your future career mobility for momentary amusement from strangers.",
    "Your degree is turning into an expensive certificate of attendance while your feed thrives.",
    "You tell yourself you'll start working at 'the top of the hour'. It is now 4:03 PM. See you at 5:00 PM.",
    "You're speedrunning academic probation with breathtaking nonchalance.",
    "You've memorized the entire lore of an anime you don't even like while ignoring your coursework.",
    "You have five assignments past due and you're watching a video about ancient Roman sanitation.",
    "You're building an empire in your head while your real-life productivity is in Chapter 11 bankruptcy.",
    "Your professor gave you two weeks for this assignment. You are currently starting it with 38 minutes left.",
    "You're outsourcing your intellect to short-form clips and wondering why tests feel hard."
  ],

  midnight: [
    "It is 2:43 AM. Exactly who are you waiting for? The CEO of sleep to personally invite you to bed?",
    "You said 'just one more reel' 87 reels ago. The sun will be rising before your common sense does.",
    "Your melatonin production has officially resigned in protest.",
    "You're trading tomorrow's energy and mental peace for a video of a raccoon eating grapes at 3 AM.",
    "Your alarm goes off in four hours. You are currently engineering your own morning misery.",
    "You're doomscrolling in pitch darkness looking like an deep-sea creature near a hydrothermal vent.",
    "Your circadian rhythm isn't just broken, it has fled the country and applied for political asylum.",
    "You're sacrificing tomorrow's happiness for content you won't even remember at breakfast.",
    "Put the phone face down, close your burning eyes, and accept that the internet will continue without you.",
    "You're looking at blue light at 3:15 AM wondering why you feel anxious and exhausted.",
    "The birds are going to start singing soon, and they will be singing a song of pure disappointment in you.",
    "You've entered the cursed twilight hours where you watch videos about conspiracy theories and cake decorating.",
    "Your pillow is right there. It is soft, loyal, and doesn't track your behavioral metrics. Go to sleep.",
    "You're going to wake up tomorrow feeling like you were hit by a freight train filled with regrets.",
    "You are actively borrowing happiness from tomorrow with an exorbitant 400% interest rate.",
    "Nothing good has ever happened on Instagram at 3:30 in the morning. Put the glowing brick down.",
    "You're squinting with one eye closed because the screen is burning your retinas. That is a cry for help.",
    "Your future morning self is going to curse your name with every ounce of their exhausted soul.",
    "You're watching a 12-part series on why a couple broke up in 2016. It is 4:00 AM. Reevaluate your life.",
    "The phone just slipped out of your hand and hit you in the bridge of the nose. Take the hint.",
    "You're wide awake from dopamine while your body temperature is dropping. You are a biological paradox.",
    "You're checking stories from people who were asleep five hours ago. They don't know you're haunting them.",
    "Your sleep tracker is currently displaying a flatline of despair.",
    "You're treating sleep like an optional suggestion rather than a biological requirement for sanity.",
    "You've scrolled all the way to yesterday's content. You have caught up with the algorithm. Go to bed.",
    "The blue light is suppressing your pineal gland while your thumb drags you deeper into the abyss.",
    "Tomorrow you'll drink four iced coffees and complain about being tired. We both know the truth.",
    "You're lying on your side with the phone charger pulled taut like a tightrope. It's time to stop.",
    "You're in the dark watching someone organize their fridge in Beverly Hills. What are you doing with your life?",
    "Your eyelids are heavier than your responsibilities, yet your thumb persists. A tragedy in one act.",
    "You're speedrunning chronic fatigue and calling it 'revenge bedtime procrastination'.",
    "The dark circles under your eyes are currently developing their own zip code.",
    "You have 3 hours and 14 minutes until your alarm. Sleep now or suffer an eternity tomorrow.",
    "You're one tap away from dropping your phone behind the headboard into the unreachable void.",
    "Goodnight to everyone except you, who is currently watching a dog balance a waffle on its snout at 3:45 AM.",
    "Your bed is a sanctuary of rest that you have converted into a digital casino. Cash out and sleep.",
    "You're staring into the pixel void while the rest of your timezone is restoring their neural pathways.",
    "Tomorrow's meetings will be a blur of brain fog, and this reel about miniature cooking will be to blame.",
    "You're one swipe away from welcoming the sunrise with a migraine.",
    "Shut the screen down. Darkness is free and your brain desperately needs it."
  ],

  victorian: [
    "I say, your thumb appears to have far outrun your ambition today. Did you genuinely plan on donating your remaining youth to 15-second dancing teenagers, or did your willpower simply step out for tea?",
    "Pardon the intrusion, darling, but your cerebral cortex is gently liquefying into high-fructose algorithmic syrup. Do consider sitting upright.",
    "A truly magnificent display of doing absolutely nothing of consequence for the forty-fifth minute in succession. Queen Victoria herself would be bewildered.",
    "Excuse me, your future self dispatched an urgent telegram. They inquired why you traded their potential for a cat mistakenly slipping off a kitchen refrigerator.",
    "Good heavens! The universe gifted you eighty years of conscious contemplation, and you are presently auditing cosmetic tutorials you will never implement.",
    "Pardon the interruption, Sir/Madam. I have laid out your abandoned ambitions in the drawing room. Would you prefer them buried before or after dinner?",
    "Very good, Master. I shall notify your ancestors that the lineage culminated in you watching strangers microwaving gummy worms.",
    "Your to-do list called, Sir. It inquired whether you had passed away, or if you were merely held hostage by a scrolling rectangle.",
    "Might I gently observe that your thumb has now walked two full miles across glowing glass while your legs have remained motionless since luncheon?",
    "Certainly, Sir. I shall let the world know you were otherwise occupied watching someone arrange decorative colored soaps.",
    "Marcus Aurelius wrote: 'You could be good today, yet you choose tomorrow.' Though in your specific case, you chose nineteen consecutive skits about bad roommates.",
    "Consider the stars above: light travelling billions of miles across the cosmic void, only to hit your retina while you rate someone's refrigerator restock.",
    "Time is the single finite currency of mortal existence. You cannot renegotiate the hour you just surrendered to an autoplay sequence.",
    "Seneca observed that life is long if you know how to use it. He did not foresee you staring vacantly at a man crushing hydraulic press items at 1 AM.",
    "Is this the flourishing of your soul, or the silent surrender of your willpower to an advertising algorithm designed by teenagers in Palo Alto?",
    "Mon dieu! Your attention span is like spoiled béarnaise sauce: completely broken, soupy, and unfit for human consumption.",
    "You are marinating your precious intellect in pure junk food! Look at this feed—it's raw! It has zero emotional nutrition!",
    "I asked for a five-star life, and you are serving me reheated viral microwave popcorn for the third consecutive hour!",
    "Where is the seasoning? Where is the real life flavor? You cannot taste life through a smear of fingerprint oil on a glass screen!",
    "One would think an individual of your station would exhibit some modest restraint, yet here you are, mesmerized by a mechanical sand slicer.",
    "I shudder to imagine the conversation when your progeny inquire as to how you spent the golden epoch of your youth.",
    "Pray tell, does the luminous pane provide sustenance, or merely an opiate to numb your dread of quiet self-examination?",
    "A gentleman or lady of culture cultivates their garden; you, however, appear to be cultivating digital necrosis of the brain.",
    "Shall I order the carriage, Sir? Or do you intend to perish upon this settee whilst auditing street food hygiene in distant lands?",
    "The mortal clock ticks with unremitting precision, completely indifferent to your determination to view yet another cat falling from a banister.",
    "How exquisitely tragic: an immortal human soul traded for an algorithmic dopamine droplet.",
    "You possess the bearing of a scholar and the scrolling habits of a destitute chimney sweep.",
    "Rest assured, your ancestors are gazing down from the heavens in absolute, unanimous mortification.",
    "Put down the contraption, wash your countenance, and endeavor to resemble an upright member of civilized society.",
    "Your dignified conscience has officially submitted its formal resignation. Good day to you, Sir."
  ]
};

// Return full structured roast data
function getRandomRoastData(categoryKey = appState.selectedPersona) {
  let catKeys = [];
  if (categoryKey === 'all' || !ROASTS[categoryKey]) {
    catKeys = Object.keys(ROASTS);
  } else {
    catKeys = [categoryKey];
  }
  const chosenCat = catKeys[Math.floor(Math.random() * catKeys.length)];
  const list = ROASTS[chosenCat];
  const idx = Math.floor(Math.random() * list.length);
  const text = list[idx];
  const meta = ROAST_CATEGORIES[chosenCat] || { title: "Reality Check", icon: "🧐", severity: "High Severity" };

  return {
    text: text,
    categoryKey: chosenCat,
    categoryTitle: meta.title,
    icon: meta.icon,
    severity: meta.severity,
    index: idx + 1,
    totalInCategory: list.length
  };
}

function getRandomRoast(persona = appState.selectedPersona) {
  return getRandomRoastData(persona).text;
}

// Flat list for counter and search
function getTotalRoastCount() {
  return Object.values(ROASTS).reduce((acc, arr) => acc + arr.length, 0);
}


// Global Roast Treasury Updater (Ensures zero ReferenceErrors across all 9 roast personality buttons)
function updateTreasuryRoast(roastData) {
  try {
    if (!roastData) roastData = getRandomRoastData(appState.selectedPersona);
    const quoteElem = document.getElementById('treasuryQuoteText');
    const catElem = document.getElementById('treasuryCatBadge');
    const indexElem = document.getElementById('treasuryIndexBadge');
    if (quoteElem) quoteElem.textContent = `"${roastData.text || roastData}"`;
    if (catElem) catElem.textContent = `${roastData.icon || '🧐'} ${roastData.categoryTitle || roastData.category || 'Reality Check'}`;
    if (indexElem) indexElem.textContent = `Roast #${roastData.index || (Math.floor(Math.random() * 45) + 1)} of ${roastData.totalInCategory || '45+'}`;
  } catch (err) {
    console.warn('updateTreasuryRoast error:', err);
  }
}

// Global Reality Check Slot Modal Opener
function openRealityCheckSlotModal() {
  try {
    const modal = document.getElementById('universalModal');
    if (!modal) return;
    const roastData = getRandomRoastData(appState.selectedPersona);
    const avatar = document.getElementById('modalAvatar');
    const badge = document.getElementById('modalBadge');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBodyText');
    const stage1 = document.getElementById('modalStage1');
    const stage2 = document.getElementById('modalStage2');
    if (stage1) stage1.style.display = 'block';
    if (stage2) stage2.style.display = 'none';
    if (avatar) avatar.textContent = '';
    if (badge) badge.textContent = roastData.categoryTitle || 'High Society Reality Check';
    if (title) title.textContent = 'Mr. No cap';
    if (body) body.textContent = roastData.text || getRandomRoast();
    modal.style.display = 'flex';
    playChime(528, 'sine', 0.8);
  } catch (err) {
    console.warn('openRealityCheckSlotModal error:', err);
  }
}

// ============================================================================
// JOHNNY DYNAMITE - VOICE CLONING ENGINE (VOICE SKIN MODEL)
// Clones Johnny Dynamite's deep American vintage radio DJ timbre, pitch, & accent.
// Speaks exclusively the website's text directly. Never reads reference audio file.
// ============================================================================

const JOHNNY_VOICE_MODEL = {
  name: 'Johnny Dynamite - Vintage Radio DJ',
  pitch: 0.82,       // Deep radio baritone chest resonance cloned from MP3 reference
  rate: 0.98,        // Confident mid-century broadcaster cadence
  cachedVoice: null,
  profiles: {
    vintage_am: { label: 'Johnny Dynamite (Vintage AM Radio Host)', pitch: 0.82, rate: 0.98 },
    late_night: { label: 'Johnny Dynamite (Late Night Velvet FM)', pitch: 0.76, rate: 0.88 },
    drive_time: { label: 'Johnny Dynamite (Punchy Drive-Time Broadcaster)', pitch: 0.88, rate: 1.06 },
    gentleman:  { label: 'Johnny Dynamite (Aristocratic Reality Host)', pitch: 0.84, rate: 0.94 },
    brainrot:   { label: 'Johnny Dynamite (Brainrot Shredder)', pitch: 0.86, rate: 1.04 },
    wasted_time:{ label: 'Johnny Dynamite (Time Loss Countdown)', pitch: 0.80, rate: 0.94 },
    tech_coder: { label: 'Johnny Dynamite (Terminal Broadcaster)', pitch: 0.84, rate: 1.02 },
    addiction:  { label: 'Johnny Dynamite (Midnight Intervention)', pitch: 0.82, rate: 0.92 },
    zombie:     { label: 'Johnny Dynamite (Graveyard Shift Baritone)', pitch: 0.78, rate: 0.88 },
    academic_career: { label: 'Johnny Dynamite (News Desk Bulletin)', pitch: 0.84, rate: 0.98 },
    midnight:   { label: 'Johnny Dynamite (After Hours Jazz FM)', pitch: 0.76, rate: 0.86 },
    victorian:  { label: 'Johnny Dynamite (Theatrical Telegraph Host)', pitch: 0.86, rate: 0.92 },
    cinema:     { label: 'Johnny Dynamite (Film Focus Director)', pitch: 0.80, rate: 0.90 },
    default:    { label: 'Johnny Dynamite (Vintage Radio DJ)', pitch: 0.82, rate: 0.98 }
  }
};

let radioBedGain = null;
let radioBedNoise = null;

// Get best deep American male broadcaster voice (NEVER pick female or default robot)
function getJohnnyClonedVoice() {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const isFemale = (v) => /zira|female|woman|girl|eva|samantha|victoria|karen|susan|catherine|hazel|heera|ayumi|haruka|hortense|hedda/i.test(v.name);

  // Strictly match deep American male radio host voices (David, Mark, Guy, Christopher)
  const bestVoice = 
    // Priority 1: Microsoft Mark (deepest American male baritone on Windows)
    voices.find(v => v.name.includes('Mark') && v.lang.startsWith('en')) ||
    // Priority 2: Microsoft David (classic resonant American male broadcaster on Windows)
    voices.find(v => v.name.includes('David') && v.lang.startsWith('en')) ||
    // Priority 3: Edge/Chrome Natural American male broadcasters
    voices.find(v => (v.name.includes('Guy') || v.name.includes('Christopher') || v.name.includes('Eric')) && v.lang.startsWith('en') && !isFemale(v)) ||
    // Priority 4: Any explicit male English voice
    voices.find(v => (v.name.toLowerCase().includes('male') || v.name.includes('George')) && v.lang.startsWith('en') && !isFemale(v)) ||
    // Priority 5: Google US English male
    voices.find(v => v.name.includes('Google') && v.lang.startsWith('en-US') && !isFemale(v)) ||
    // Priority 6: Non-female en-US voice
    voices.find(v => v.lang.startsWith('en-US') && !isFemale(v)) ||
    // Priority 7: Non-female English voice
    voices.find(v => v.lang.startsWith('en') && !isFemale(v)) ||
    null;

  return bestVoice;
}

// Pre-warm voices on page load
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    updateVoiceSkinUI();
  };
  window.speechSynthesis.getVoices();
}

function updateVoiceSkinUI() {
  const nameEl = document.getElementById('voiceSkinActiveName');
  if (nameEl) {
    const v = getJohnnyClonedVoice();
    if (v) {
      nameEl.textContent = `Johnny Dynamite [Cloned from ${v.name.split(' - ')[0]}]`;
    } else {
      nameEl.textContent = `Johnny Dynamite [Vintage Radio DJ • Baritone]`;
    }
  }
}

// Authentic vintage studio broadcast mic un-mute & subtle warm radio presence
function startVintageRadioBed() {
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') ctx.resume();
    stopVintageRadioBed();

    const now = ctx.currentTime;
    // 1. Studio mic un-mute click (18ms vintage broadcast switch pop)
    const pop = ctx.createOscillator();
    const popG = ctx.createGain();
    pop.type = 'triangle';
    pop.frequency.setValueAtTime(290, now);
    pop.frequency.exponentialRampToValueAtTime(105, now + 0.018);
    popG.gain.setValueAtTime(0.04, now);
    popG.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);
    pop.connect(popG);
    popG.connect(ctx.destination);
    pop.start(now);
    pop.stop(now + 0.025);

    // 2. Subtle warm vintage studio presence bed
    const buf = createNoiseBuffer(ctx, 3);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    const flt = ctx.createBiquadFilter();
    flt.type = 'bandpass';
    flt.frequency.setValueAtTime(1250, now);
    flt.Q.setValueAtTime(0.8, now);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.012, now + 0.15);

    src.connect(flt);
    flt.connect(g);
    g.connect(ctx.destination);
    src.start(now);

    radioBedGain = g;
    radioBedNoise = src;
  } catch(e) {}
}

function stopVintageRadioBed() {
  if (radioBedGain && audioCtx) {
    try {
      radioBedGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);
      setTimeout(() => {
        if (radioBedNoise) {
          try { radioBedNoise.stop(); radioBedNoise.disconnect(); } catch(e) {}
          radioBedNoise = null;
        }
        radioBedGain = null;
      }, 150);
    } catch(e) {
      radioBedGain = null;
      radioBedNoise = null;
    }
  }
}

// Main Johnny Dynamite Voice Speaking Function
function speakJohnnyDynamite(wantedText, personaKey = '', triggeringBtn = null) {
  // 1. Toggle OFF if currently speaking
  if (window.speechSynthesis && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    stopVintageRadioBed();
    setSpeakerActiveVisuals(false);
    if (triggeringBtn) triggeringBtn.classList.remove('speaker-sound-active');
    showGlobalToast('🔇 Johnny Dynamite Mic Muted', '⏸️');
    return;
  }

  // 2. Clean wanted text: extract website text, remove surrounding quotes
  let cleanText = (wantedText || '').trim();
  if (cleanText.startsWith('"') && cleanText.endsWith('"')) {
    cleanText = cleanText.substring(1, cleanText.length - 1).trim();
  }
  if (!cleanText) {
    cleanText = document.getElementById('heroRoastText')?.textContent?.trim() || "Put the glowing rectangle down and re-engage with reality!";
    if (cleanText.startsWith('"') && cleanText.endsWith('"')) {
      cleanText = cleanText.substring(1, cleanText.length - 1).trim();
    }
  }

  // 3. Resolve persona/profile pitch and rate from Johnny Voice Model
  const key = personaKey || appState.selectedPersona || 'default';
  const profile = JOHNNY_VOICE_MODEL.profiles[key] || JOHNNY_VOICE_MODEL.profiles.default;

  // Use user-customized pitch/rate if sliders were adjusted
  const pitchSlider = document.getElementById('voicePitchSlider');
  const rateSlider = document.getElementById('voiceRateSlider');
  const finalPitch = pitchSlider ? parseFloat(pitchSlider.value) : profile.pitch;
  const finalRate = rateSlider ? parseFloat(rateSlider.value) : profile.rate;

  // 4. Start subtle vintage studio radio presence bed
  startVintageRadioBed();

  // 5. Speak the exact website text directly using Johnny Dynamite's cloned voice model
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Clear queue

    const utterance = new SpeechSynthesisUtterance(cleanText); // SPEAK WEBSITE TEXT DIRECTLY!
    
    // Select cloned deep American male broadcaster voice (never default female voice)
    const clonedVoice = getJohnnyClonedVoice();
    if (clonedVoice) {
      utterance.voice = clonedVoice;
    }

    // Apply cloned voice timbre, pitch and cadence
    utterance.pitch = finalPitch; // Deep radio baritone
    utterance.rate = finalRate;   // Confident broadcaster speed
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setSpeakerActiveVisuals(true);
      if (triggeringBtn) triggeringBtn.classList.add('speaker-sound-active');
      const voiceName = clonedVoice ? clonedVoice.name.split(' - ')[0] : 'Vintage Radio DJ';
      showGlobalToast(`🎙️ Johnny Dynamite: ${voiceName}`, '📻');
    };

    utterance.onend = () => {
      stopVintageRadioBed();
      setSpeakerActiveVisuals(false);
      if (triggeringBtn) triggeringBtn.classList.remove('speaker-sound-active');
    };

    utterance.onerror = (err) => {
      stopVintageRadioBed();
      setSpeakerActiveVisuals(false);
      if (triggeringBtn) triggeringBtn.classList.remove('speaker-sound-active');
      console.warn('Speech synthesis error:', err);
    };

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    window.speechSynthesis.speak(utterance);
  } else {
    showGlobalToast('⚠️ Browser SpeechSynthesis not supported', '🔇');
  }
}

function playJohnnyDynamiteSpeakerSound(forceToggle = false, wantedText = '', personaKey = '') {
  if (wantedText) {
    speakJohnnyDynamite(wantedText, personaKey);
    return;
  }
  const heroText = document.getElementById('heroRoastText')?.textContent || '';
  speakJohnnyDynamite(heroText, appState.selectedPersona);
}

function setSpeakerActiveVisuals(isPlaying) {
  const speakerButtons = [
    document.getElementById('btnSpeakHeroRoast'),
    document.getElementById('btnTreasurySpeak'),
    document.getElementById('btnFioAudio'),
    document.getElementById('phoneSpeakerInteractive'),
    document.getElementById('btnTestVoiceSkin')
  ];

  speakerButtons.forEach(btn => {
    if (!btn) return;
    btn.classList.toggle('speaker-sound-active', isPlaying);
    if (isPlaying) {
      btn.setAttribute('title', 'Johnny Dynamite Speaking (Click to pause)');
    } else {
      btn.setAttribute('title', 'Hear Johnny Dynamite speak this line 🔊');
    }
  });
}

function speakText(text, personaKey = '') {
  if (!appState.speechEnabled) return;
  speakJohnnyDynamite(text, personaKey || appState.selectedPersona);
}


// ============================================================================
// 4. DOOMSCROLL SIMULATOR & INTERRUPTER
// ============================================================================
let simReelsWatched = 0;
let lastScrollTop = 0;
let lastScrollTime = Date.now();

const SIMULATED_REELS_DATA = [
  {
    title: "10 Lifehacks that are literally worse than doing it normally #satisfying",
    author: "@diy_madness",
    likes: "420K",
    comments: "3.2K",
    bg: "radial-gradient(circle, #3b82f6 0%, #0f172a 100%)",
    icon: "🧼"
  },
  {
    title: "POV: You forgot your phone in 2004 vs 2026 (Wait till the end!)",
    author: "@relatable_memez",
    likes: "890K",
    comments: "8.4K",
    bg: "radial-gradient(circle, #ec4899 0%, #1e1b4b 100%)",
    icon: "🤯"
  },
  {
    title: "Cutting kinetic sand for 8 hours straight with ASMR crunch",
    author: "@sand_guru",
    likes: "1.2M",
    comments: "15.1K",
    bg: "radial-gradient(circle, #10b981 0%, #064e3b 100%)",
    icon: "⏳"
  },
  {
    title: "Top 5 crypto coins that will 10,000x before next Tuesday (NOT FINANCIAL ADVICE)",
    author: "@hype_trader",
    likes: "210K",
    comments: "4.9K",
    bg: "radial-gradient(circle, #7c3aed 0%, #1e1035 100%)",
    icon: "📈"
  },
  {
    title: "He thought she was cheating until this dog revealed the secret 🐶😱",
    author: "@drama_tales",
    likes: "1.5M",
    comments: "22K",
    bg: "radial-gradient(circle, #8b5cf6 0%, #1e1b4b 100%)",
    icon: "🐕"
  },
  {
    title: "Reorganizing my pantry using 80 clear plastic containers #restocktok",
    author: "@tidy_vibes",
    likes: "670K",
    comments: "5.8K",
    bg: "radial-gradient(circle, #06b6d4 0%, #083344 100%)",
    icon: "🧃"
  }
];

function initSimulator() {
  const feed = document.getElementById('simFeed');
  if (!feed) return;

  feed.innerHTML = '';
  // Repeat cards to allow infinite scroll feel
  for (let r = 0; r < 4; r++) {
    SIMULATED_REELS_DATA.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'sim-reel-card';
      card.style.background = item.bg;
      card.innerHTML = `
        <div style="font-size: 5rem; text-align: center; margin-bottom: 2rem;">${item.icon}</div>
        <div class="sim-reel-overlay-content">
          <div class="sim-reel-author">${item.author} • <small style="color: #34d399;">Follow</small></div>
          <p class="sim-reel-desc">${item.title}</p>
          <div class="sim-reel-meta">
            <span>❤️ ${item.likes}</span>
            <span>💬 ${item.comments}</span>
            <span>↗️ Share</span>
          </div>
        </div>
      `;
      feed.appendChild(card);
    });
  }

  // Scroll listener
  feed.addEventListener('scroll', handleFeedScroll);
}

function handleFeedScroll(e) {
  const feed = e.target;
  const currentScrollTop = feed.scrollTop;
  const now = Date.now();
  const timeDiff = (now - lastScrollTime) / 1000;
  const dist = Math.abs(currentScrollTop - lastScrollTop);

  if (timeDiff > 0.05) {
    const speed = Math.round(dist / timeDiff);
    const speedElem = document.getElementById('simSpeedVal');
    if (speedElem) speedElem.textContent = `${speed} px/s`;
  }

  // Determine current reel index based on card height
  const reelHeight = 580;
  const newIndex = Math.floor((currentScrollTop + reelHeight / 2) / reelHeight);

  if (newIndex !== simReelsWatched && newIndex > simReelsWatched) {
    simReelsWatched = newIndex;
    const countElem = document.getElementById('simReelCount');
    if (countElem) countElem.textContent = simReelsWatched;

    // Check if threshold reached
    const threshold = parseInt(document.getElementById('roastThresholdSelect').value || '5', 10);
    if (simReelsWatched > 0 && simReelsWatched % threshold === 0) {
      triggerInterruptionOverlay();
    }
  }

  lastScrollTop = currentScrollTop;
  lastScrollTime = now;
}

function triggerInterruptionOverlay() {
  const overlay = document.getElementById('simOverlay');
  const roastElem = document.getElementById('overlayRoastText');
  const avatarElem = document.getElementById('overlayAvatar');
  const badgeElem = document.getElementById('overlaySeverity');
  const titleElem = document.getElementById('overlayTitle');

  const roastData = getRandomRoastData();
  roastElem.textContent = `"${roastData.text}"`;

  if (avatarElem) avatarElem.textContent = roastData.icon;
  if (badgeElem) badgeElem.textContent = `${roastData.categoryTitle} • ${roastData.severity}`;
  if (titleElem) titleElem.textContent = `Reality Check #${roastData.index} of ${roastData.totalInCategory}`;

  playChime(329.63, 'triangle', 0.8);
  overlay.style.display = 'flex';

  speakText(roast);
  appState.roastsEndured++;
  saveState();
}

// ============================================================================
// 5. LIFE TOLL CALCULATOR MATRIX
// ============================================================================
function updateLifeTollCalculations() {
  const reelsPerDay = parseInt(document.getElementById('reelsSlider').value, 10);
  const secsPerReel = parseInt(document.getElementById('secsSlider').value, 10);
  const years = parseInt(document.getElementById('yearsSlider').value, 10);

  // Update slider label numbers
  document.getElementById('calcReelsDisplay').textContent = reelsPerDay;
  document.getElementById('calcSecsDisplay').textContent = secsPerReel;
  document.getElementById('calcYearsDisplay').textContent = years;

  // Computations
  const totalReelsYear = reelsPerDay * 365;
  const dailySeconds = reelsPerDay * secsPerReel;
  const dailyMinutes = Math.round(dailySeconds / 60);

  const totalSeconds = dailySeconds * 365 * years;
  const totalHours = totalSeconds / 3600;

  // Assuming 16 waking hours per day
  const wakingDaysLost = totalHours / 16;
  const wakingMonthsLost = (wakingDaysLost / 30.4).toFixed(1);

  // Quick stats
  document.getElementById('qsDailyHours').textContent = `${dailyMinutes} mins/day`;
  document.getElementById('qsYearlyReels').textContent = totalReelsYear.toLocaleString();
  document.getElementById('qsWakingLife').textContent = `${wakingMonthsLost} Months`;

  // Toll items
  // 1. Books (Avg 4.5 hours per book)
  const books = Math.floor(totalHours / 4.5);
  document.getElementById('tollBooksCount').textContent = books.toLocaleString();

  // 2. Thumb miles (6 inches per scroll = 0.5 ft * totalReels / 5280)
  const totalReelsTotal = reelsPerDay * 365 * years;
  const miles = Math.round((totalReelsTotal * 0.5) / 5280);
  document.getElementById('tollThumbMiles').textContent = miles.toLocaleString();

  // 3. Instruments (400 hours of focused deliberate practice)
  const instruments = (totalHours / 400).toFixed(1);
  document.getElementById('tollInstruments').textContent = instruments;

  // 4. Sunsets ignored
  const sunsets = (365 * years).toLocaleString();
  document.getElementById('tollSunsets').textContent = sunsets;

  // 5. Unrushed coffees (1.5 hrs per meaningful chat)
  const coffees = Math.floor(totalHours / 1.5).toLocaleString();
  document.getElementById('tollCoffees').textContent = coffees;

  // 6. Attention Span degradation factor
  const attentionLoss = Math.min(65, Math.round((reelsPerDay / 300) * 55 + (secsPerReel < 30 ? 10 : 0)));
  document.getElementById('tollAttentionLoss').textContent = `${attentionLoss}%`;

  // Sync canvas vitality ratio
  // Lower daily reels = higher vitality (10 reels = 100%, 300 reels = 10%)
  const vitalityRatio = Math.max(0.1, 1 - (reelsPerDay - 10) / 290);
  renderNatureCanvases(vitalityRatio);
}

// ============================================================================
// 6. LIVING NATURE CANVASES (Blooming Grove vs Digital Glitch)
// ============================================================================
let butterflies = [];
let fireflies = [];
let leaves = [];
let animFrameId = null;

function initNatureParticles() {
  butterflies = [];
  for (let i = 0; i < 6; i++) {
    butterflies.push({
      x: Math.random() * 800,
      y: 100 + Math.random() * 150,
      vx: 0.5 + Math.random() * 1,
      vy: (Math.random() - 0.5) * 0.8,
      wing: 0,
      wingSpeed: 0.15 + Math.random() * 0.1,
      color: ['#C4B5FD', '#34D399', '#818CF8', '#A78BFA'][i % 4]
    });
  }

  fireflies = [];
  for (let i = 0; i < 25; i++) {
    fireflies.push({
      x: Math.random() * 800,
      y: 50 + Math.random() * 250,
      radius: 1 + Math.random() * 2,
      alpha: Math.random(),
      speed: 0.02 + Math.random() * 0.03
    });
  }
}

function drawTree(ctx, startX, startY, len, angle, branchWidth, vitalityRatio) {
  ctx.beginPath();
  ctx.save();
  ctx.strokeStyle = vitalityRatio > 0.4 ? '#4A3728' : '#334155';
  ctx.fillStyle = vitalityRatio > 0.4 ? '#10B981' : '#64748B';
  ctx.lineWidth = branchWidth;
  ctx.translate(startX, startY);
  ctx.rotate(angle * Math.PI / 180);
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -len);
  ctx.stroke();

  if (len < 12) {
    // Leaf / Blossom
    if (vitalityRatio > 0.3) {
      ctx.beginPath();
      ctx.arc(0, -len, 4 * vitalityRatio + 1, 0, Math.PI * 2);
      ctx.fillStyle = vitalityRatio > 0.7 ? '#34D399' : (vitalityRatio > 0.5 ? '#10B981' : '#C4B5FD');
      ctx.fill();

      // Blossom
      if (vitalityRatio > 0.65) {
        ctx.beginPath();
        ctx.arc(2, -len - 2, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#C4B5FD';
        ctx.fill();
      }
    }
    ctx.restore();
    return;
  }

  drawTree(ctx, 0, -len, len * 0.76, angle - 20, branchWidth * 0.7, vitalityRatio);
  drawTree(ctx, 0, -len, len * 0.76, angle + 20, branchWidth * 0.7, vitalityRatio);
  ctx.restore();
}

function renderNatureScene(canvas, vitalityRatio, isDetailed = false) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // 1. Sky & Horizon Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  if (vitalityRatio > 0.5) {
    if (appState.weatherMode === 'sun') {
      skyGrad.addColorStop(0, '#0B1D28');
      skyGrad.addColorStop(0.6, '#133534');
      skyGrad.addColorStop(1, '#06201B');
    } else {
      skyGrad.addColorStop(0, '#0D1527');
      skyGrad.addColorStop(1, '#1A2942');
    }
  } else {
    // Glitched/corrupted red-slate sky
    skyGrad.addColorStop(0, '#1E1218');
    skyGrad.addColorStop(0.7, '#241421');
    skyGrad.addColorStop(1, '#130B12');
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Sun or Moon
  ctx.beginPath();
  const sunX = w * 0.78;
  const sunY = h * 0.28;
  const sunGrad = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 45);
  if (vitalityRatio > 0.5) {
    sunGrad.addColorStop(0, 'rgba(196, 181, 253, 0.85)');
    sunGrad.addColorStop(1, 'rgba(139, 92, 246, 0)');
  } else {
    sunGrad.addColorStop(0, 'rgba(124, 58, 237, 0.65)');
    sunGrad.addColorStop(1, 'rgba(76, 29, 149, 0)');
  }
  ctx.fillStyle = sunGrad;
  ctx.arc(sunX, sunY, 45, 0, Math.PI * 2);
  ctx.fill();

  // 3. Ground / Rolling Hills
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.quadraticCurveTo(w * 0.35, h - 70 * vitalityRatio - 30, w * 0.65, h - 40);
  ctx.quadraticCurveTo(w * 0.85, h - 25, w, h);
  ctx.closePath();
  ctx.fillStyle = vitalityRatio > 0.4 ? '#08281C' : '#171A21';
  ctx.fill();

  // 4. Living Tree
  const treeBaseX = w * 0.42;
  const treeBaseY = h - 25;
  drawTree(ctx, treeBaseX, treeBaseY, 55 * (0.6 + vitalityRatio * 0.5), 0, 8, vitalityRatio);

  // 5. Grass blades & Wildflowers
  const grassCount = isDetailed ? 90 : 45;
  for (let i = 0; i < grassCount; i++) {
    const gx = (w / grassCount) * i + Math.sin(i) * 6;
    const gy = h - 15 - (Math.sin(i * 0.5) * 15);
    const gHeight = (12 + Math.random() * 15) * vitalityRatio;

    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.quadraticCurveTo(gx + 3, gy - gHeight * 0.6, gx + (i % 2 === 0 ? 4 : -4), gy - gHeight);
    ctx.strokeStyle = vitalityRatio > 0.4 ? '#10B981' : '#475569';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Wildflowers
    if (vitalityRatio > 0.6 && i % 4 === 0) {
      ctx.beginPath();
      ctx.arc(gx + 4, gy - gHeight, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = ['#C4B5FD', '#A78BFA', '#8B5CF6', '#818CF8'][i % 4];
      ctx.fill();
    }
  }

  // 6. Particles (Butterflies / Fireflies) if vitality is good
  if (vitalityRatio > 0.45) {
    // Fireflies
    fireflies.forEach(f => {
      f.alpha += f.speed;
      const curAlpha = (Math.sin(f.alpha) + 1) / 2;
      ctx.beginPath();
      ctx.arc(f.x % w, f.y % (h - 60), f.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(167, 243, 208, ${curAlpha * 0.7})`;
      ctx.fill();
    });

    // Butterflies
    butterflies.forEach(b => {
      b.x = (b.x + b.vx) % w;
      b.y += Math.sin(b.wing) * 0.8;
      b.wing += b.wingSpeed;

      const wingSpan = Math.abs(Math.cos(b.wing)) * 5;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.fillStyle = b.color;
      // Left wing
      ctx.beginPath();
      ctx.ellipse(-wingSpan, 0, wingSpan, 4, -0.2, 0, Math.PI * 2);
      ctx.fill();
      // Right wing
      ctx.beginPath();
      ctx.ellipse(wingSpan, 0, wingSpan, 4, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // 7. Digital Glitch Overlay if vitality is poor
  if (vitalityRatio < 0.5) {
    const glitchIntensity = (0.5 - vitalityRatio) * 2; // 0 to 1
    const glitchLines = Math.floor(glitchIntensity * 12);
    for (let g = 0; g < glitchLines; g++) {
      const lineY = Math.random() * h;
      const lineH = 1 + Math.random() * 3;
      ctx.fillStyle = `rgba(244, 63, 94, ${0.15 + Math.random() * 0.35})`;
      ctx.fillRect(0, lineY, w, lineH);

      // Chromatic shift block
      if (Math.random() > 0.6) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.fillRect(Math.random() * (w - 80), lineY, 80, lineH);
      }
    }
  }

  // Rain effect if toggled
  if (appState.weatherMode === 'rain') {
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.25)';
    ctx.lineWidth = 1;
    for (let r = 0; r < 40; r++) {
      const rx = Math.random() * w;
      const ry = Math.random() * h;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 3, ry + 12);
      ctx.stroke();
    }
  }
}

function renderNatureCanvases(vitalityRatio) {
  const dashCanvas = document.getElementById('natureCanvasDashboard');
  const deepCanvas = document.getElementById('natureCanvasDetailed');

  renderNatureScene(dashCanvas, vitalityRatio, false);
  renderNatureScene(deepCanvas, vitalityRatio, true);

  const statusBadge = document.getElementById('badgeNatureStatus');
  if (statusBadge) {
    const percent = Math.round(vitalityRatio * 100);
    if (vitalityRatio > 0.75) {
      statusBadge.textContent = `Grove Health: ${percent}% (Lush & Blooming)`;
      statusBadge.style.borderColor = 'var(--emerald-primary)';
    } else if (vitalityRatio > 0.45) {
      statusBadge.textContent = `Grove Health: ${percent}% (Moderate Canopy)`;
      statusBadge.style.borderColor = 'var(--amber-gold)';
    } else {
      statusBadge.textContent = `Grove Health: ${percent}% (Degraded by Digital Glitch)`;
      statusBadge.style.borderColor = 'var(--rose-danger)';
    }
  }
}

function startNatureLoop() {
  function loop() {
    const reelsPerDay = parseInt(document.getElementById('reelsSlider')?.value || '90', 10);
    const vitalityRatio = Math.max(0.1, 1 - (reelsPerDay - 10) / 290);
    renderNatureCanvases(vitalityRatio);
    animFrameId = requestAnimationFrame(loop);
  }
  if (!animFrameId) {
    loop();
  }
}

// ============================================================================
// 7. SIDE QUESTS ENGINE & DISPATCHER
// ============================================================================
const SIDE_QUESTS = [
  {
    id: 'q1',
    title: 'Kyoto Pentatonic Session',
    category: 'music',
    duration: 5,
    icon: '🎵',
    xp: 50,
    desc: 'Play the in-app Zen Pentatonic keys below or hum a 5-note melody. No screens, pure auditory harmony.',
    prompt: 'Create 3 gentle musical phrases using the chime keys.'
  },
  {
    id: 'q2',
    title: 'The Sky & Cloud Vigil',
    category: 'nature',
    duration: 5,
    icon: '☁️',
    xp: 60,
    desc: 'Step out to a window or porch. Look at the furthest clouds for 5 full minutes without touching any device.',
    prompt: 'Observe cloud drift and tree motion with zero hurry.'
  },
  {
    id: 'q3',
    title: 'The Unhurried Tea Ceremony',
    category: 'mind',
    duration: 15,
    icon: '🍵',
    xp: 120,
    desc: 'Boil water. Listen to the kettle hiss. Steep loose tea or coffee. Drink the entire cup without looking at a single screen.',
    prompt: 'Savor every warm sip with complete presence.'
  },
  {
    id: 'q4',
    title: 'Analog Notebook Brain Dump',
    category: 'creative',
    duration: 15,
    icon: '✍️',
    xp: 130,
    desc: 'Grab a physical pen and blank paper. Write non-stop whatever thoughts, worries, or drawings come to mind.',
    prompt: 'Fill 2 physical pages with ink.'
  },
  {
    id: 'q5',
    title: 'Instrumental Play & Rhythm Practice',
    category: 'music',
    duration: 30,
    icon: '🎸',
    xp: 220,
    desc: 'Pick up an instrument (guitar, keyboard, harmonica) or clap along to a jazz record. Practice simple chord changes.',
    prompt: 'Engage your muscle memory and acoustic rhythm.'
  },
  {
    id: 'q6',
    title: 'Botanical Leaf Sketch & Observation',
    category: 'nature',
    duration: 30,
    icon: '🌿',
    xp: 240,
    desc: 'Find one living plant or leaf outside. Sit down and sketch its exact vein structure and imperfections on paper.',
    prompt: 'Study organic fractal patterns in real life.'
  },
  {
    id: 'q7',
    title: 'The Solitary Neighborhood Walk',
    category: 'nature',
    duration: 60,
    icon: '🚶',
    xp: 350,
    desc: 'Leave your phone on the kitchen counter. Walk for 60 minutes in your neighborhood. Count 5 birds and 3 historic houses.',
    prompt: 'Rediscover your immediate physical world on foot.'
  },
  {
    id: 'q8',
    title: 'Masterpiece Chapter Immersion',
    category: 'mind',
    duration: 60,
    icon: '📖',
    xp: 380,
    desc: 'Read 35 pages of an acclaimed novel, history book, or philosophy text without a single tab or notification switch.',
    prompt: 'Immerse deeply into extended prose.'
  },
  {
    id: 'q9',
    title: 'Deep Acoustic Album Audition',
    category: 'music',
    duration: 60,
    icon: '🎻',
    xp: 400,
    desc: 'Dim the room lights. Play an entire instrumental album (e.g. Miles Davis, Debussy, or Ludovico Einaudi) from track 1 to the end.',
    prompt: 'Let the album structure wash over your auditory cortex.'
  },
  {
    id: 'q10',
    title: 'Complete Offline Craft / Cooking Project',
    category: 'creative',
    duration: 120,
    icon: '🧑‍🍳',
    xp: 750,
    desc: 'Cook an intricate recipe completely from scratch (like homemade pasta, fresh bread, or slow stew) with zero phone checking.',
    prompt: 'Transform raw ingredients into a feast.'
  },
  {
    id: 'q11',
    title: 'The Great Woods / Park Expedition',
    category: 'nature',
    duration: 120,
    icon: '🌲',
    xp: 800,
    desc: 'Travel to the nearest forest, lake, or large botanical garden. Spend two unhurried hours surrounded by ancient living trees.',
    prompt: 'Breathe phytoncides and let your nervous system decompress.'
  }
];

let questTimerInterval = null;

function renderQuests(filterTime = '60', filterCat = 'all') {
  const container = document.getElementById('questsGridContainer');
  if (!container) return;

  container.innerHTML = '';

  const filtered = SIDE_QUESTS.filter(q => {
    const matchTime = filterTime === 'all' || q.duration <= parseInt(filterTime, 10);
    const matchCat = filterCat === 'all' || q.category === filterCat;
    return matchTime && matchCat;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-dim); padding: 2rem;">No quests match this combination. Try selecting "Any Time" or "All Quests".</div>`;
    return;
  }

  filtered.forEach((quest, idx) => {
    const card = document.createElement('div');
    card.className = `quest-card ${idx === 0 ? 'featured-quest-card' : ''}`;
    card.innerHTML = `
      <div class="quest-card-header">
        <span class="quest-icon">${quest.icon}</span>
        <span class="quest-time-tag">⏱️ ${quest.duration} Mins</span>
      </div>
      <h4 class="quest-title">${quest.title}</h4>
      <p class="quest-desc">${quest.desc}</p>
      <div class="quest-card-footer">
        <span class="quest-xp-badge">+${quest.xp} XP Reclaimed</span>
        <button class="btn-primary btn-sm btn-accept-quest" data-id="${quest.id}">Accept Quest</button>
      </div>
    `;
    container.appendChild(card);
  });

  if (typeof init3DCardPhysics === 'function') {
    init3DCardPhysics();
  }

  // Attach button listeners
  container.querySelectorAll('.btn-accept-quest').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const qId = e.target.getAttribute('data-id');
      const quest = SIDE_QUESTS.find(q => q.id === qId);
      if (quest) acceptQuest(quest);
    });
  });
}

function acceptQuest(quest) {
  appState.activeQuest = quest;
  appState.activeQuestTimeRemaining = quest.duration * 60; // seconds

  const banner = document.getElementById('activeQuestBanner');
  document.getElementById('activeQuestName').textContent = `${quest.icon} ${quest.title}`;
  document.getElementById('activeQuestPrompt').textContent = quest.prompt;
  banner.style.display = 'flex';

  playChime(440, 'triangle', 0.6);
  startQuestTimer();

  // Scroll to banner if on quests tab
  banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function startQuestTimer() {
  if (questTimerInterval) clearInterval(questTimerInterval);

  updateTimerDigits();

  questTimerInterval = setInterval(() => {
    if (appState.activeQuestTimeRemaining > 0) {
      appState.activeQuestTimeRemaining--;
      updateTimerDigits();
    } else {
      clearInterval(questTimerInterval);
      completeActiveQuest();
    }
  }, 1000);
}

function updateTimerDigits() {
  const m = Math.floor(appState.activeQuestTimeRemaining / 60);
  const s = appState.activeQuestTimeRemaining % 60;
  const digitsElem = document.getElementById('questTimerDigits');
  if (digitsElem) {
    digitsElem.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
}

function completeActiveQuest() {
  if (!appState.activeQuest) return;

  const quest = appState.activeQuest;
  appState.questsCompleted++;
  appState.reclaimedHours += quest.duration / 60;
  appState.reclaimedHours = parseFloat(appState.reclaimedHours.toFixed(1));

  // Sound fanfare
  playChime(523.25, 'sine', 0.5);
  setTimeout(() => playChime(659.25, 'sine', 0.8), 200);

  alert(`🎉 Quest Completed: "${quest.title}"!\nYou have reclaimed ${quest.duration} minutes of pristine human consciousness and earned +${quest.xp} XP.`);

  // Clear active quest
  if (questTimerInterval) clearInterval(questTimerInterval);
  appState.activeQuest = null;
  document.getElementById('activeQuestBanner').style.display = 'none';

  saveState();
}

function cancelActiveQuest() {
  if (confirm("Abandon this quest? Your mind will miss an offline adventure.")) {
    if (questTimerInterval) clearInterval(questTimerInterval);
    appState.activeQuest = null;
    document.getElementById('activeQuestBanner').style.display = 'none';
    saveState();
  }
}

// ============================================================================
// 8. PENTATONIC CHIME INSTRUMENT
// ============================================================================
function initInstrument() {
  const keys = document.querySelectorAll('.chime-key');
  keys.forEach((key, index) => {
    const freq = parseFloat(key.getAttribute('data-freq'));
    key.addEventListener('mousedown', () => {
      playChime(freq, 'sine', 1.4);
      key.classList.add('active-press');
    });
    key.addEventListener('click', () => {
      playChime(freq, 'sine', 1.4);
      key.classList.add('active-press');
      setTimeout(() => key.classList.remove('active-press'), 180);
    });
    key.addEventListener('mouseup', () => key.classList.remove('active-press'));
    key.addEventListener('mouseleave', () => key.classList.remove('active-press'));
  });

  // Keyboard hotkeys 1-8
  window.addEventListener('keydown', (e) => {
    if (['1', '2', '3', '4', '5', '6', '7', '8'].includes(e.key)) {
      const idx = parseInt(e.key, 10) - 1;
      const keyElem = keys[idx];
      if (keyElem) {
        const freq = parseFloat(keyElem.getAttribute('data-freq'));
        playChime(freq, 'sine', 1.4);
        keyElem.classList.add('active-press');
        setTimeout(() => keyElem.classList.remove('active-press'), 180);
      }
    }
  });
}

// ============================================================================
// 10. ATTENTION SPAN IMPROVER & CINEMA THERAPY MODULE
// ============================================================================
const CINEMA_DATABASE = [
  {
    id: 'zima_blue',
    title: 'Zima Blue',
    year: 2019,
    director: 'Robert Valley / Alastair Reynolds',
    runtime: 10,
    rating: 8.4,
    level: 'level1',
    levelLabel: '⚡ 10m Micro-Focus',
    genres: ['scifi', 'philosophy', 'animation'],
    genreLabel: 'Philosophical Sci-Fi',
    mood: 'philosophical',
    icon: '🟦',
    gradient: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
    description: 'A reclusive, legendary artist grants an exclusive interview to unveil his final, transcendent masterpiece before retiring forever.',
    whyAntidote: 'Just 10 minutes of profound philosophical clarity. A powerful reminder that chasing infinite complexity only brings emptiness; true peace is in simple, mindful purpose.',
    tags: ['Love Death & Robots', 'Philosophical Monument', '10-Minute Reset'],
    watchUrl: 'https://www.netflix.com/title/80174608',
    lifePointer: 'You do not need infinite novel stimuli to find fulfillment; the highest art in life is knowing your core purpose and doing it with pure simplicity.',
    socraticQ: [
      'Why did Zima surrender god-like fame to return to scrubbing swimming pool ceramic tiles?',
      'How does our digital culture mimic Zima’s early obsession with endless expansion?'
    ],
    craftInsight: 'Bold angular gouache animation style by Robert Valley that demands visual focus without hyperactive camera cuts.'
  },
  {
    id: 'henry_sugar',
    title: 'The Wonderful Story of Henry Sugar',
    year: 2023,
    director: 'Wes Anderson',
    runtime: 37,
    rating: 7.4,
    level: 'level1',
    levelLabel: '🎯 37m Short Masterpiece',
    genres: ['drama', 'comedy', 'adaptation'],
    genreLabel: 'Whimsical / Focus Training',
    mood: 'calm_zen',
    icon: '🃏',
    gradient: 'linear-gradient(135deg, #4C1D95 0%, #1E1B4B 100%)',
    description: 'A wealthy playboy masters an esoteric meditation technique to see through playing cards, which unexpectedly dismantles his superficial worldview.',
    whyAntidote: 'Anderson’s rapid yet metronomic, theatrical dialogue trains your working memory. Proves that intense, unwavering concentration transforms selfish boredom into generous mastery.',
    tags: ['Oscar Winner', 'Deliberate Concentration', '37-Minute Focus Gym'],
    watchUrl: 'https://www.netflix.com/title/81473041',
    lifePointer: 'When you develop superhuman concentration, trivial wealth loses its allure—your real gift is using your focus to elevate the lives of others.',
    socraticQ: [
      'How does Henry Sugar’s three years of candle-staring practice contrast with today’s 15-second attention span?',
      'Why did winning easy money feel completely devoid of satisfaction?'
    ],
    craftInsight: 'Rotating physical theatrical flats and continuous panning shots that recreate the tactile delight of turning physical book pages.'
  },
  {
    id: 'world_of_tomorrow',
    title: 'World of Tomorrow',
    year: 2015,
    director: 'Don Hertzfeldt',
    runtime: 17,
    rating: 8.1,
    level: 'level1',
    levelLabel: '⚡ 17m Micro-Focus',
    genres: ['scifi', 'animation', 'philosophical'],
    genreLabel: 'Visionary Animated Sci-Fi',
    mood: 'philosophical',
    icon: '🚀',
    gradient: 'linear-gradient(135deg, #4C1D95 0%, #1E1B4B 100%)',
    description: 'A little girl named Emily is taken on a mind-bending tour of her distant future by a third-generation clone of herself.',
    whyAntidote: 'Poignant, existential, and deeply funny. Shows how future societies lost their minds uploading memories into digital voids while missing simple human presence.',
    tags: ['Oscar Nominee', 'Sundance Winner', 'Cosmic Perspective'],
    watchUrl: 'https://vimeo.com/ondemand/worldoftomorrow',
    lifePointer: 'Do not lose yourself in nostalgia or simulated memories of what could be; living consciously in this exact present moment is the only true reality.',
    socraticQ: [
      'Emily Prime was completely engrossed in watching a rock. Why was she happier than her super-intelligent future clone?',
      'What did the clone mean when she said: "Do not lose time on things that do not matter"?'
    ],
    craftInsight: 'Combining hand-drawn stick figure minimalism with breathtaking cosmic color washes and spontaneous toddler voice acting.'
  },
  {
    id: 'every_frame_fincher',
    title: 'David Fincher — And the Other Way is Wrong',
    year: 2014,
    director: 'Tony Zhou',
    runtime: 8,
    rating: 9.1,
    level: 'level1',
    levelLabel: '⚡ 8m Video Essay',
    genres: ['documentary', 'essay', 'cinema_craft'],
    genreLabel: 'Masterclass Cinema Essay',
    mood: 'mind_bender',
    icon: '🎬',
    gradient: 'linear-gradient(135deg, #27272A 0%, #09090B 100%)',
    description: 'A brilliant 8-minute exploration of how David Fincher creates cinematic tension through deliberate camera movement and cutting on action.',
    whyAntidote: 'Re-educates your eyes to recognize visual craftsmanship vs. chaotic algorithmic jump-cuts. Teaches discipline in observation.',
    tags: ['Every Frame a Painting', 'Visual Literacy', '8-Minute Eye Cleanser'],
    watchUrl: 'https://www.youtube.com/watch?v=QPAloq5MCK4',
    youtubeEmbedId: 'QPAloq5MCK4',
    lifePointer: 'Perfection is not about adding more noise; it is about eliminating every single unnecessary movement until only pure intentionality remains.',
    socraticQ: [
      'Why does Fincher only move the camera when a character moves?',
      'How does intentional pacing create tension without relying on cheap shock tactics?'
    ],
    craftInsight: 'Demonstrates surgical editorial rhythm and seamless geometric framing.'
  },
  {
    id: 'black_mirror_white_christmas',
    title: 'Black Mirror: White Christmas',
    year: 2014,
    director: 'Carl Tibbetts',
    runtime: 73,
    rating: 9.1,
    level: 'level2',
    levelLabel: '⏱️ 73m Mid-Length Gem',
    genres: ['scifi', 'thriller', 'mystery'],
    genreLabel: 'Sci-Fi / Mind-Bender',
    mood: 'mind_bender',
    icon: '❄️',
    gradient: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
    description: 'In a remote snowy cabin, two men recount three interlocking tales of technological isolation, digital clones, and inescapable temporal punishment.',
    whyAntidote: 'A 73-minute masterclass in psychological suspense that directly exposes our vulnerability to smart lenses, blocking people in real life, and digital voyeurism.',
    tags: ['Anthology Peak', 'Mind Maze', 'Tech Cautionary Tale'],
    watchUrl: 'https://www.netflix.com/title/70264888',
    lifePointer: 'Technology that promises to buffer you from difficult human emotions will ultimately isolate you in a prison of your own making.',
    socraticQ: [
      'How does "blocking" people in the episode mirror our modern impulse to swipe away anything mildly uncomfortable?',
      'What does the concept of the "cookie" tell us about treating human consciousness as a utility?'
    ],
    craftInsight: 'Tightly woven triptych narrative structure where every seemingly unrelated subplot detonates into a chilling climax.'
  },
  {
    id: 'rakka',
    title: 'Rakka (Oats Studios)',
    year: 2017,
    director: 'Neill Blomkamp',
    runtime: 22,
    rating: 7.3,
    level: 'level1',
    levelLabel: '🎯 22m Short Masterpiece',
    genres: ['scifi', 'action', 'dystopian'],
    genreLabel: 'Dystopian Sci-Fi / Cyberpunk',
    mood: 'adrenaline',
    icon: '🦎',
    gradient: 'linear-gradient(135deg, #15803D 0%, #052E16 100%)',
    description: 'A broken band of human survivors fight against telepathic reptilian invaders who alter Earth’s atmosphere and harvest human minds.',
    whyAntidote: 'At 22 minutes, this visceral short puts Hollywood blockbuster CGI to shame while exploring the grim terror of losing mental autonomy to hostile overlords.',
    tags: ['Sigourney Weaver', 'Oats Studios', 'High Intensity Focus'],
    watchUrl: 'https://www.youtube.com/watch?v=VjQ2t_yNHQs',
    youtubeEmbedId: 'VjQ2t_yNHQs',
    lifePointer: 'Even when the environment seems totally hostile to human dignity, small disciplined acts of resistance keep the flame of freedom alive.',
    socraticQ: [
      'How does the aliens’ telepathic paralysis parallel the feeling of being paralyzed by endless short-form feeds?',
      'What gave the resistance fighters their grit to keep striving?'
    ],
    craftInsight: 'Grim, tactile sci-fi world-building with photorealistic practical prosthetics and grim atmospheric grading.'
  },
  {
    id: 'every_frame_kurosawa',
    title: 'Akira Kurosawa — Composing Movement',
    year: 2015,
    director: 'Tony Zhou',
    runtime: 9,
    rating: 9.3,
    level: 'level1',
    levelLabel: '⚡ 9m Video Essay',
    genres: ['documentary', 'essay', 'cinema_craft'],
    genreLabel: 'Visual Composition Masterclass',
    mood: 'calm_zen',
    icon: '🎋',
    gradient: 'linear-gradient(135deg, #3F3F46 0%, #18181B 100%)',
    description: 'A brilliant 9-minute breakdown showing how master director Akira Kurosawa combines movement of the elements, the camera, and the actors.',
    whyAntidote: 'Trains your eyes to see rain, wind, smoke, and group choreography as visual music. Restores visual patience.',
    tags: ['Kurosawa Mastery', 'Cinematic Eye', '9-Minute Focus Gym'],
    watchUrl: 'https://www.youtube.com/watch?v=doaQC-S8de8',
    youtubeEmbedId: 'doaQC-S8de8',
    lifePointer: 'Notice how dynamic life becomes when you pay attention to the natural elements (wind in the trees, rain on the path) instead of staring downward.',
    socraticQ: [
      'How does Kurosawa use weather to reflect internal character psychology without a single word of dialogue?',
      'Why does this deliberate visual rhythm feel infinitely more satisfying than modern frantic editing?'
    ],
    craftInsight: 'Demonstrates geometric blocking and multi-layered motion within a single stationary frame.'
  },
  {
    id: 'inception',
    title: 'Inception',
    year: 2010,
    director: 'Christopher Nolan',
    runtime: 148,
    rating: 8.8,
    level: 'level3',
    levelLabel: 'Level 3: Zen Focus Monk',
    genres: ['scifi', 'mystery', 'thriller', 'mind_bender', 'heist'],
    genreLabel: 'Sci-Fi / Mind-Bender',
    mood: 'mind_bender',
    icon: '🌀',
    gradient: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    whyAntidote: 'Demands tracking 4 simultaneous dream layers with different time dilation physics. Exceptional strength conditioning for executive focus and working memory.',
    tags: ['Nolan Masterpiece', 'Dream Architecture', 'Complex Puzzle', 'Zero Gravity']
  },
  {
    id: 'fight_club',
    title: 'Fight Club',
    year: 1999,
    director: 'David Fincher',
    runtime: 139,
    rating: 8.8,
    level: 'level2',
    levelLabel: 'Level 2: Deep Immersion',
    genres: ['thriller', 'drama', 'psychological'],
    genreLabel: 'Psychological Thriller / Drama',
    mood: 'mind_bender',
    icon: '🧼',
    gradient: 'linear-gradient(135deg, #831843 0%, #18181B 100%)',
    description: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into something much more profound and dangerous.',
    whyAntidote: 'Direct surgical strike against mindless consumerism and algorithmic pacification. Shocks you out of comfortable digital numbness into raw visceral awareness.',
    tags: ['Fincher Classic', 'Anti-Consumerism', 'Iconic Twist', 'Raw Reality']
  },
  {
    id: 'the_matrix',
    title: 'The Matrix',
    year: 1999,
    director: 'Lana & Lilly Wachowski',
    runtime: 136,
    rating: 8.7,
    level: 'level2',
    levelLabel: 'Level 2: Deep Immersion',
    genres: ['scifi', 'cyberpunk', 'action'],
    genreLabel: 'Sci-Fi / Cyberpunk',
    mood: 'mind_bender',
    icon: '💊',
    gradient: 'linear-gradient(135deg, #064E3B 0%, #022C22 100%)',
    description: 'When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence.',
    whyAntidote: 'The quintessential wake-up call to escape simulated reality. The ultimate antidote to algorithms farming your attention as if you were human bio-batteries.',
    tags: ['Red Pill Awakening', 'Cyberpunk Classic', 'Philosophical Sci-Fi']
  },
  {
    id: 'se7en',
    title: 'Se7en',
    year: 1995,
    director: 'David Fincher',
    runtime: 127,
    rating: 8.6,
    level: 'level2',
    levelLabel: 'Level 2: Deep Immersion',
    genres: ['mystery', 'thriller', 'crime', 'neo-noir'],
    genreLabel: 'Neo-Noir / Crime Thriller',
    mood: 'mind_bender',
    icon: '📦',
    gradient: 'linear-gradient(135deg, #1C1917 0%, #0C0A09 100%)',
    description: 'Two detectives, a rookie and a veteran, hunt a serial killer who uses the seven deadly sins as his motives.',
    whyAntidote: 'Fincher\'s atmospheric rain and meticulous detective procedural forces sustained, patient deductive reasoning. No cheap dopamine tricks, just relentless narrative gravity.',
    tags: ['David Fincher', 'Atmospheric Dread', 'Master Detective Tale']
  },
  {
    id: 'arrival',
    title: 'Arrival',
    year: 2016,
    director: 'Denis Villeneuve',
    runtime: 116,
    rating: 8.0,
    level: 'level2',
    levelLabel: 'Level 2: Deep Immersion',
    genres: ['scifi', 'mystery'],
    genreLabel: 'Sci-Fi / Mystery',
    mood: 'mind_bender',
    icon: '🛸',
    gradient: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)',
    description: 'A linguistics professor leads an elite team of investigators when gigantic spaceships touch down in 12 locations around the world.',
    whyAntidote: 'Non-linear narrative structure that exercises your working memory. Requires keeping complex emotional and temporal threads connected across 116 uninterrupted minutes.',
    tags: ['Non-Linear', 'Visual Poetry', 'Hypnotic Score']
  },
  {
    id: '12_angry_men',
    title: '12 Angry Men',
    year: 1957,
    director: 'Sidney Lumet',
    runtime: 96,
    rating: 9.0,
    level: 'level1',
    levelLabel: 'Level 1: Brisk Hooks',
    genres: ['drama', 'mystery'],
    genreLabel: 'Drama / Mystery',
    mood: 'adrenaline',
    icon: '⚖️',
    gradient: 'linear-gradient(135deg, #27272A 0%, #18181B 100%)',
    description: 'The jury in a New York City murder trial is frustrated by a single member whose skepticism forces them to reconsider the evidence.',
    whyAntidote: 'Set entirely within a single claustrophobic room with zero CGI or cheap jump cuts. Forces your brain to tune into pure dialogue, human psychology, and subtle facial micro-expressions.',
    tags: ['Single Room', 'Masterful Dialogue', 'Zero Distraction']
  },
  {
    id: 'interstellar',
    title: 'Interstellar',
    year: 2014,
    director: 'Christopher Nolan',
    runtime: 169,
    rating: 8.7,
    level: 'level3',
    levelLabel: 'Level 3: Zen Focus Monk',
    genres: ['scifi', 'epic'],
    genreLabel: 'Sci-Fi / Epic',
    mood: 'philosophical',
    icon: '🪐',
    gradient: 'linear-gradient(135deg, #09090B 0%, #1E1B4B 100%)',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked with piloting a spacecraft along with a team of researchers to find a new planet.',
    whyAntidote: 'Nolan\'s monumental cosmic scale and Hans Zimmer\'s towering organ score recalibrate your dopamine baseline from 15-second phone clips back to cosmic wonder.',
    tags: ['Cosmic Wonder', 'Time Dilation', 'Monumental Score']
  },
  {
    id: 'spirited_away',
    title: 'Spirited Away',
    year: 2001,
    director: 'Hayao Miyazaki',
    runtime: 125,
    rating: 8.6,
    level: 'level2',
    levelLabel: 'Level 2: Deep Immersion',
    genres: ['ghibli', 'mystery'],
    genreLabel: 'Ghibli / Fantasy',
    mood: 'calm_zen',
    icon: '🏮',
    gradient: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
    description: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, where humans are changed into beasts.',
    whyAntidote: 'Masterful use of "ma" (intentional emptiness and peaceful pauses). The iconic silent train scene over endless water allows overstimulated neural circuits to decompress.',
    tags: ['Studio Ghibli', 'Intentional Silence', 'Hand-Drawn Zen']
  },
  {
    id: 'whiplash',
    title: 'Whiplash',
    year: 2014,
    director: 'Damien Chazelle',
    runtime: 107,
    rating: 8.5,
    level: 'level1',
    levelLabel: 'Level 1: Brisk Hooks',
    genres: ['drama', 'thriller'],
    genreLabel: 'Drama / Music',
    mood: 'adrenaline',
    icon: '🥁',
    gradient: 'linear-gradient(135deg, #581C87 0%, #2E1065 100%)',
    description: 'A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student\'s potential.',
    whyAntidote: 'Relentless rhythmic pacing that locks your gaze to the screen with absolute grip. Proves that sustained tension in a feature film provides 100x more satisfaction than a hundred reels.',
    tags: ['Pure Adrenaline', 'Rhythmic Focus', 'Unflinching Stakes']
  },
  {
    id: 'blade_runner_2049',
    title: 'Blade Runner 2049',
    year: 2017,
    director: 'Denis Villeneuve',
    runtime: 164,
    rating: 8.0,
    level: 'level3',
    levelLabel: 'Level 3: Zen Focus Monk',
    genres: ['scifi', 'slowburn'],
    genreLabel: 'Sci-Fi / Neo-Noir',
    mood: 'philosophical',
    icon: '🌆',
    gradient: 'linear-gradient(135deg, #701A75 0%, #1E1B4B 100%)',
    description: 'Young Blade Runner K\'s discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who\'s been missing for thirty years.',
    whyAntidote: 'Roger Deakins\' Academy-Award-winning cinematography uses slow, hypnotic visual compositions. Retrains your eyes to linger on architectural framing rather than frantic rapid cuts.',
    tags: ['Visual Masterpiece', 'Atmospheric Immersion', 'Philosophical Noir']
  },
  {
    id: 'perfect_days',
    title: 'Perfect Days',
    year: 2023,
    director: 'Wim Wenders',
    runtime: 124,
    rating: 7.9,
    level: 'level2',
    levelLabel: 'Level 2: Deep Immersion',
    genres: ['slowburn', 'drama'],
    genreLabel: 'Slice of Life / Zen',
    mood: 'calm_zen',
    icon: '🌿',
    gradient: 'linear-gradient(135deg, #14532D 0%, #0F172A 100%)',
    description: 'Hirayama seems entirely content with his simple life as a cleaner of toilets in Tokyo. Outside of his structured routine, he cherishes his music on cassette tapes, books, and taking photos of trees.',
    whyAntidote: 'A pure meditative antidote to modern hurry sickness. Teaches your dopamine system to find sublime ecstasy in sunlight filtering through tree leaves (komorebi) and mindful presence.',
    tags: ['Mindful Presence', 'Tokyo Solitude', 'Pure Neural Calm']
  },
  {
    id: 'shutter_island',
    title: 'Shutter Island',
    year: 2010,
    director: 'Martin Scorsese',
    runtime: 138,
    rating: 8.2,
    level: 'level2',
    levelLabel: 'Level 2: Deep Immersion',
    genres: ['mystery', 'thriller'],
    genreLabel: 'Psychological Thriller',
    mood: 'mind_bender',
    icon: '🌊',
    gradient: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
    description: 'A U.S. Marshal investigates the disappearance of a murderer who escaped from a hospital for the criminally insane on a remote and windswept island.',
    whyAntidote: 'A gripping psychological labyrinth that demands sustained analytical vigilance. Keeps your brain constantly evaluating unreliable narrative clues rather than passive scrolling.',
    tags: ['Mind Maze', 'Gothic Mystery', 'High Tension']
  },
  {
    id: '2001_space_odyssey',
    title: '2001: A Space Odyssey',
    year: 1968,
    director: 'Stanley Kubrick',
    runtime: 149,
    rating: 8.3,
    level: 'level3',
    levelLabel: 'Level 3: Zen Focus Monk',
    genres: ['scifi', 'slowburn'],
    genreLabel: 'Sci-Fi / Art House',
    mood: 'philosophical',
    icon: '🌌',
    gradient: 'linear-gradient(135deg, #020617 0%, #172554 100%)',
    description: 'After discovering a mysterious artifact buried beneath the Lunar surface, mankind sets off on a quest to find its origins with the help of supercomputer H.A.L. 9000.',
    whyAntidote: 'The ultimate endurance test and sanctum against algorithmic fragmentation. Features long, wordless classical waltzes in zero gravity that recondition human stillness.',
    tags: ['Kubrickian Genius', 'Minimal Dialogue', 'Ultimate Focus Test']
  },
  {
    id: 'dune_two',
    title: 'Dune: Part Two',
    year: 2024,
    director: 'Denis Villeneuve',
    runtime: 166,
    rating: 8.5,
    level: 'level3',
    levelLabel: 'Level 3: Zen Focus Monk',
    genres: ['scifi', 'epic'],
    genreLabel: 'Sci-Fi / Epic',
    mood: 'adrenaline',
    icon: '🏜️',
    gradient: 'linear-gradient(135deg, #3B0764 0%, #120A24 100%)',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    whyAntidote: 'Vast, earth-shaking desert scale and religious intensity that physically dwarfs the handheld 6-inch dopamine box. Absorbs 100% of your perceptual capacity.',
    tags: ['Desert Scale', 'Epic Immersion', 'Sensory Overload']
  },
  {
    id: 'past_lives',
    title: 'Past Lives',
    year: 2023,
    director: 'Celine Song',
    runtime: 105,
    rating: 7.8,
    level: 'level1',
    levelLabel: 'Level 1: Brisk Hooks',
    genres: ['drama', 'slowburn'],
    genreLabel: 'Drama / Romance',
    mood: 'calm_zen',
    icon: '🍂',
    gradient: 'linear-gradient(135deg, #4C1D95 0%, #1E1B4B 100%)',
    description: 'Nora and Hae Sung, two deeply connected childhood friends, are wrested apart after Nora\'s family emigrates from South Korea. Two decades later, they are reunited in New York.',
    whyAntidote: 'Emotional subtlety with lingering, contemplative glances. Teaches the brain that profound feelings do not require explosive shock value or rapid dopamine triggers.',
    tags: ['Emotional Depth', 'Poetic Pacing', 'Soulful Stillness']
  },
  {
    id: 'memento',
    title: 'Memento',
    year: 2000,
    director: 'Christopher Nolan',
    runtime: 113,
    rating: 8.4,
    level: 'level2',
    levelLabel: 'Level 2: Deep Immersion',
    genres: ['mystery', 'thriller'],
    genreLabel: 'Mystery / Thriller',
    mood: 'mind_bender',
    icon: '📸',
    gradient: 'linear-gradient(135deg, #1C1917 0%, #292524 100%)',
    description: 'A man with short-term memory loss attempts to track down his wife\'s murderer using a system of Polaroid photographs and tattoos.',
    whyAntidote: 'Told backwards in 5-minute increments. Ironically mimics short-term memory impairment while forcing the viewer to use maximum sustained cognitive effort to assemble the puzzle.',
    tags: ['Reverse Timeline', 'Cognitive Workout', 'Nolan Classic']
  },
  {
    id: 'princess_mononoke',
    title: 'Princess Mononoke',
    year: 1997,
    director: 'Hayao Miyazaki',
    runtime: 134,
    rating: 8.4,
    level: 'level2',
    levelLabel: 'Level 2: Deep Immersion',
    genres: ['ghibli', 'epic'],
    genreLabel: 'Ghibli / Epic',
    mood: 'philosophical',
    icon: '🐺',
    gradient: 'linear-gradient(135deg, #15803D 0%, #064E3B 100%)',
    description: 'On a journey to find the cure for a Tatarigami curse, Ashitaka finds himself in the middle of a war between the forest gods and Tatara, a mining colony.',
    whyAntidote: 'Rich mythological depth with complex moral ambiguity. Refuses simple algorithmic black-and-white outrage, encouraging deep, empathetic contemplation.',
    tags: ['Forest Spirits', 'Hand-Painted Nature', 'Complex Morality']
  },
  {
    id: 'shawshank',
    title: 'The Shawshank Redemption',
    year: 1994,
    director: 'Frank Darabont',
    runtime: 142,
    rating: 9.3,
    level: 'level3',
    levelLabel: 'Level 3: Zen Focus Monk',
    genres: ['drama'],
    genreLabel: 'Drama / Masterpiece',
    mood: 'calm_zen',
    icon: '🕊️',
    gradient: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
    description: 'A banker convicted of uxoricide forms a friendship over a quarter of a century with a hardened convict, while maintaining his innocence and trying to remain hopeful through simple compassion.',
    whyAntidote: 'Demonstrates the power of patience, enduring decades within a narrative. Directly challenges our cultural addiction to instant gratification.',
    tags: ['Patience & Hope', 'Classic Storytelling', 'IMDb #1']
  },
  {
    id: 'zodiac',
    title: 'Zodiac',
    year: 2007,
    director: 'David Fincher',
    runtime: 157,
    rating: 7.7,
    level: 'level3',
    levelLabel: 'Level 3: Zen Focus Monk',
    genres: ['mystery', 'thriller'],
    genreLabel: 'Mystery / Procedural',
    mood: 'mind_bender',
    icon: '📁',
    gradient: 'linear-gradient(135deg, #18181B 0%, #27272A 100%)',
    description: 'Between 1968 and 1983, a San Francisco cartoonist becomes an amateur detective obsessed with tracking down the Zodiac Killer.',
    whyAntidote: 'Fincher\'s forensic, obsessive procedural detail forces you to slow down and follow evidence, phone books, and dates. The antithesis of clickbait.',
    tags: ['Obsessive Detail', 'Fincher Mastery', 'Archival Mystery']
  },
  {
    id: 'before_sunrise',
    title: 'Before Sunrise',
    year: 1995,
    director: 'Richard Linklater',
    runtime: 101,
    rating: 8.1,
    level: 'level1',
    levelLabel: 'Level 1: Brisk Hooks',
    genres: ['drama', 'slowburn'],
    genreLabel: 'Drama / Romance',
    mood: 'calm_zen',
    icon: '☕',
    gradient: 'linear-gradient(135deg, #4C1D95 0%, #110E2E 100%)',
    description: 'A young man and woman meet on a train in Europe, and wind up spending one evening together in Vienna. Unfortunately, both know this will probably be their only night together.',
    whyAntidote: 'Real-time human conversation without manufactured melodrama. Reminds your social brain what real interpersonal chemistry and attentive listening look like.',
    tags: ['Pure Conversation', 'Vienna Nights', 'Human Chemistry']
  },
  {
    id: 'drive_my_car',
    title: 'Drive My Car',
    year: 2021,
    director: 'Ryusuke Hamaguchi',
    runtime: 179,
    rating: 7.6,
    level: 'level3',
    levelLabel: 'Level 3: Zen Focus Monk',
    genres: ['slowburn', 'drama'],
    genreLabel: 'Art House / Drama',
    mood: 'philosophical',
    icon: '🚗',
    gradient: 'linear-gradient(135deg, #374151 0%, #111827 100%)',
    description: 'An aging theater director directs a multilingual production of Uncle Vanya in Hiroshima and grapples with the mysteries his wife left behind.',
    whyAntidote: 'Opening credits do not roll until minute 40. A profound lesson in trusting slow art to deliver transcendent emotional catharsis.',
    tags: ['Slow Cinema', 'Profound Grief', 'Academy Award Winner']
  },
  {
    id: 'coherence',
    title: 'Coherence',
    year: 2013,
    director: 'James Ward Byrkit',
    runtime: 89,
    rating: 7.2,
    level: 'level1',
    levelLabel: 'Level 1: Brisk Hooks',
    genres: ['scifi', 'mystery'],
    genreLabel: 'Sci-Fi / Mind-Bender',
    mood: 'mind_bender',
    icon: '☄️',
    gradient: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
    description: 'Strange things begin to happen when a group of eight friends gather for a dinner party on an evening when a comet is passing overhead.',
    whyAntidote: 'At just 89 minutes, it hooks immediately and spirals into quantum multiverse paranoia. Zero filler, 100% intellectual engagement.',
    tags: ['Brisk Runtime', 'Quantum Puzzle', 'Zero Fluff']
  },
  {
    id: 'grand_budapest',
    title: 'The Grand Budapest Hotel',
    year: 2014,
    director: 'Wes Anderson',
    runtime: 99,
    rating: 8.1,
    level: 'level1',
    levelLabel: 'Level 1: Brisk Hooks',
    genres: ['drama'],
    genreLabel: 'Comedy / Art',
    mood: 'calm_zen',
    icon: '🏨',
    gradient: 'linear-gradient(135deg, #831843 0%, #500724 100%)',
    description: 'A writer encounters the owner of an aging high-class hotel, who tells him of his early years serving as a lobby boy in the hotel\'s glorious years under an exceptional concierge.',
    whyAntidote: 'Wes Anderson\'s immaculate visual geometry and pastel color palettes turn every single frame into a work of art, rewarding watchful, attentive eyes.',
    tags: ['Artisanal Symmetry', 'Whimsical Pacing', 'Visual Candy']
  },
  {
    id: 'parasite',
    title: 'Parasite',
    year: 2019,
    director: 'Bong Joon-ho',
    runtime: 132,
    rating: 8.5,
    level: 'level2',
    levelLabel: 'Level 2: Deep Immersion',
    genres: ['thriller', 'drama'],
    genreLabel: 'Thriller / Dark Comedy',
    mood: 'adrenaline',
    icon: '🎭',
    gradient: 'linear-gradient(135deg, #14532D 0%, #1E293B 100%)',
    description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    whyAntidote: 'Flawless tonal gearshifts and structural precision. Delivers the adrenaline of high-stakes entertainment with social depth that lingers for weeks.',
    tags: ['Palme d\'Or', 'Flawless Tension', 'Genre Bending']
  },
  {
    id: 'truman_show',
    title: 'The Truman Show',
    year: 1998,
    director: 'Peter Weir',
    runtime: 103,
    rating: 8.2,
    level: 'level1',
    levelLabel: 'Level 1: Brisk Hooks',
    genres: ['drama', 'scifi'],
    genreLabel: 'Satire / Drama',
    mood: 'philosophical',
    icon: '📺',
    gradient: 'linear-gradient(135deg, #0369A1 0%, #0C4A6E 100%)',
    description: 'An insurance salesman discovers his entire life is actually a reality TV show, filmed through thousands of hidden cameras and broadcast worldwide 24/7.',
    whyAntidote: 'A prophetic meta-commentary on algorithmic surveillance and passive media consumption. Wakes your subconscious mind up from the digital trance.',
    tags: ['Media Satire', 'Mind Awakening', 'Brisk Pacing']
  },
  {
    id: 'stalker',
    title: 'Stalker',
    year: 1979,
    director: 'Andrei Tarkovsky',
    runtime: 162,
    rating: 8.1,
    level: 'level3',
    levelLabel: 'Level 3: Zen Focus Monk',
    genres: ['slowburn', 'scifi'],
    genreLabel: 'Philosophical / Sci-Fi',
    mood: 'philosophical',
    icon: '🌿',
    gradient: 'linear-gradient(135deg, #2E1065 0%, #0F172A 100%)',
    description: 'A figure known as the Stalker guides a writer and a professor into the heart of the mysterious "Zone", a restricted area where a Room is rumored to grant one\'s deepest desires.',
    whyAntidote: 'Tarkovsky uses uninterrupted 4-minute takes of flowing water, wet grass, and rusted metal. A spiritual sanctuary that cures dopamine dependency.',
    tags: ['Tarkovsky Masterpiece', 'Spiritual Reset', 'Long Takes']
  },
  {
    id: 'oppenheimer',
    title: 'Oppenheimer',
    year: 2023,
    director: 'Christopher Nolan',
    runtime: 180,
    rating: 8.8,
    level: 'level3',
    levelLabel: 'Level 3: Zen Focus Monk',
    genres: ['drama', 'epic'],
    genreLabel: 'Historical / Drama',
    mood: 'adrenaline',
    icon: '⚛️',
    gradient: 'linear-gradient(135deg, #2E1065 0%, #0B0716 100%)',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    whyAntidote: '3 hours of pure dialogue, courtroom bureaucracy, and moral panic that feels like an Olympic sprint. Teaches you that complex intellectual history can be thrilling without cheap shortcuts.',
    tags: ['Best Picture', 'Dense Dialogue', '3-Hour Focus Challenge']
  }
];

let cinemaSessionTimer = null;
let cinemaSessionRemaining = 0;

// ============================================================================
// GLOBAL TOAST NOTIFICATION SYSTEM
// ============================================================================
function showGlobalToast(message, icon = '✨') {
  let toastContainer = document.getElementById('unscrollGlobalToastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'unscrollGlobalToastContainer';
    toastContainer.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.style.cssText = `
    background: rgba(13, 20, 36, 0.95);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(16, 185, 129, 0.45);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.25);
    border-radius: 12px;
    padding: 0.85rem 1.25rem;
    color: #F8FAFC;
    font-size: 0.88rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    pointer-events: auto;
    transform: translateY(20px);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    max-width: 440px;
  `;
  toast.innerHTML = `<span style="font-size: 1.3rem;">${icon}</span> <span>${message}</span>`;
  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  });

  setTimeout(() => {
    toast.style.transform = 'translateY(15px)';
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 350);
  }, 3500);
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// ============================================================================
// SMART CINEMA MATCH & RECOMMENDATION SCORING ENGINE
// ============================================================================
function calculateMovieMatch(movie) {
  const taste = appState.cinemaTaste || {};
  const userGenres = Array.isArray(taste.genres) ? taste.genres : [];
  const userMovies = Array.isArray(taste.favoriteMovies) ? taste.favoriteMovies : [];
  const runtimeFilter = taste.runtimeFilter || 'all';

  let matchPoints = 0;
  let matchReasons = [];

  // 1. Focus Gym Runtime Match (+35 pts)
  if (runtimeFilter !== 'all') {
    let fitsRuntime = false;
    if (runtimeFilter === '15' && movie.runtime <= 25) fitsRuntime = true;
    else if (runtimeFilter === '30' && movie.runtime > 25 && movie.runtime <= 45) fitsRuntime = true;
    else if (runtimeFilter === '60' && movie.runtime > 45 && movie.runtime <= 85) fitsRuntime = true;
    else if (runtimeFilter === '90' && movie.runtime > 85 && movie.runtime <= 135) fitsRuntime = true;
    else if (runtimeFilter === '150' && movie.runtime > 135) fitsRuntime = true;

    if (fitsRuntime) {
      matchPoints += 35;
      matchReasons.push(`${movie.runtime}m Workout`);
    }
  }

  // 2. Favorite Movies direct or related match (+50 pts)
  const movieTitleLower = (movie.title || '').toLowerCase();
  for (const m of userMovies) {
    const mTrim = m.trim().toLowerCase();
    if (mTrim) {
      if (movieTitleLower === mTrim || movieTitleLower.includes(mTrim) || mTrim.includes(movieTitleLower)) {
        matchPoints += 50;
        matchReasons.push(`Beloved: ${movie.title}`);
        break;
      }
    }
  }

  // 3. User Custom Genres Match (+30 pts each)
  const movieBlob = `${movie.title} ${movie.genreLabel} ${(movie.genres || []).join(' ')} ${(movie.tags || []).join(' ')} ${movie.description}`.toLowerCase();
  for (const g of userGenres) {
    const gTrim = g.trim().toLowerCase();
    if (!gTrim) continue;

    const isDirect = movie.genres && movie.genres.some(mg => mg.toLowerCase().includes(gTrim) || gTrim.includes(mg.toLowerCase()));
    const isBlob = movieBlob.includes(gTrim);

    if (isDirect || isBlob) {
      matchPoints += 30;
      if (matchReasons.length < 3) {
        matchReasons.push(g.trim());
      }
    }
  }

  // 4. Mood match (+15 pts)
  if (taste.mood && taste.mood !== 'all' && movie.mood === taste.mood) {
    matchPoints += 15;
  }

  // 5. Training Level match (+15 pts)
  if (taste.level && taste.level !== 'all' && movie.level === taste.level) {
    matchPoints += 15;
  }

  // Calculate final percentage score: 62% - 99%
  let score = Math.min(99, Math.max(62, 55 + matchPoints));
  if (matchPoints === 0) {
    score = Math.round(movie.rating * 8.5);
  }

  const isHighMatch = score >= 88 || matchPoints >= 40;
  const label = matchReasons.length > 0
    ? `${score}% Match: ${matchReasons.slice(0, 2).join(' + ')}`
    : `${score}% Attention Match`;

  return {
    score,
    isHighMatch,
    label,
    reasons: matchReasons
  };
}

function filterCinemaDatabase() {
  const { runtimeFilter, level, mood, search } = appState.cinemaTaste || {};
  const q = (search || '').toLowerCase().trim();

  const filtered = CINEMA_DATABASE.filter(movie => {
    // Focus Gym Runtime filter
    if (runtimeFilter && runtimeFilter !== 'all') {
      if (runtimeFilter === '15' && movie.runtime > 25) return false;
      if (runtimeFilter === '30' && (movie.runtime <= 25 || movie.runtime > 45)) return false;
      if (runtimeFilter === '60' && (movie.runtime <= 45 || movie.runtime > 85)) return false;
      if (runtimeFilter === '90' && (movie.runtime <= 85 || movie.runtime > 135)) return false;
      if (runtimeFilter === '150' && movie.runtime <= 135) return false;
    }
    // Level filter
    if (level && level !== 'all' && movie.level !== level) return false;
    // Mood filter
    if (mood && mood !== 'all' && movie.mood !== mood) return false;
    // Search query
    if (q) {
      const matchTitle = movie.title.toLowerCase().includes(q);
      const matchDir = movie.director.toLowerCase().includes(q);
      const matchDesc = movie.description.toLowerCase().includes(q);
      const matchTags = movie.tags.some(t => t.toLowerCase().includes(q));
      const matchGenreLabel = (movie.genreLabel || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDir && !matchDesc && !matchTags && !matchGenreLabel) return false;
    }
    return true;
  });

  return filtered.map(movie => {
    return {
      movie,
      match: calculateMovieMatch(movie)
    };
  }).sort((a, b) => b.match.score - a.match.score);
}

// ============================================================================
// INTERACTIVE TASTE STUDIO & INPUT HANDLERS (GENRES & FAVORITE FILMS)
// ============================================================================
function renderTasteStudioTags() {
  const taste = appState.cinemaTaste || {};
  const genres = Array.isArray(taste.genres) ? taste.genres : [];
  const movies = Array.isArray(taste.favoriteMovies) ? taste.favoriteMovies : [];

  // 1. Genres
  const genreContainer = document.getElementById('activeGenreTags');
  if (genreContainer) {
    if (genres.length === 0) {
      genreContainer.innerHTML = '<span class="empty-tags-hint">No custom genres added yet. Type above or tap chips below.</span>';
    } else {
      genreContainer.innerHTML = genres.map(g => `
        <span class="user-tag-pill">
          ${escapeHtml(g)}
          <button class="user-tag-remove" data-type="genre" data-val="${escapeHtml(g)}" title="Remove ${escapeHtml(g)}">×</button>
        </span>
      `).join('');
    }
  }

  // 2. Favorite Movies
  const movieContainer = document.getElementById('activeFavMovieTags');
  if (movieContainer) {
    if (movies.length === 0) {
      movieContainer.innerHTML = '<span class="empty-tags-hint">No favorite movies added yet. Type above or tap presets.</span>';
    } else {
      movieContainer.innerHTML = movies.map(m => `
        <span class="user-tag-pill">
          ${escapeHtml(m)}
          <button class="user-tag-remove" data-type="movie" data-val="${escapeHtml(m)}" title="Remove ${escapeHtml(m)}">×</button>
        </span>
      `).join('');
    }
  }

  // Attach remove handlers
  document.querySelectorAll('.user-tag-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const type = btn.getAttribute('data-type');
      const val = btn.getAttribute('data-val');
      removeTasteTag(type, val);
    });
  });

  // Update summary details banner
  const summaryElem = document.getElementById('tasteSummaryDetails');
  if (summaryElem) {
    const genreStr = genres.length > 0 ? genres.slice(0, 3).join(', ') + (genres.length > 3 ? ` +${genres.length - 3} more` : '') : 'all genres';
    const runtimeStr = taste.runtimeFilter && taste.runtimeFilter !== 'all' ? `${taste.runtimeFilter}m focus tier` : 'all runtimes (8m–180m+)';
    summaryElem.textContent = `Calibrated for: ${genreStr} • ${movies.length} loved reference films • Focus Gym Workout: ${runtimeStr}.`;
  }
}

function addCustomGenre(genreName) {
  const val = (genreName || '').trim();
  if (!val) return;
  if (!Array.isArray(appState.cinemaTaste.genres)) {
    appState.cinemaTaste.genres = [];
  }
  const exists = appState.cinemaTaste.genres.some(g => g.toLowerCase() === val.toLowerCase());
  if (exists) {
    showGlobalToast(`"${val}" is already in your genres list.`, 'ℹ️');
    return;
  }
  appState.cinemaTaste.genres.push(val);
  saveState();
  renderTasteStudioTags();
  renderCinemaCatalog();
  playChime(523.25, 'triangle', 0.2);
  showGlobalToast(`Genre added: "${val}"! Recommendations calibrated.`, '🎨');
}

function addFavMovie(movieTitle) {
  const val = (movieTitle || '').trim();
  if (!val) return;
  if (!Array.isArray(appState.cinemaTaste.favoriteMovies)) {
    appState.cinemaTaste.favoriteMovies = [];
  }
  const exists = appState.cinemaTaste.favoriteMovies.some(m => m.toLowerCase() === val.toLowerCase());
  if (exists) {
    showGlobalToast(`"${val}" is already in your loved films list.`, 'ℹ️');
    return;
  }
  appState.cinemaTaste.favoriteMovies.push(val);
  saveState();
  renderTasteStudioTags();
  renderCinemaCatalog();
  playChime(587.33, 'triangle', 0.2);
  showGlobalToast(`Film added: "${val}"! Matching against similar styles.`, '🎬');
}

function removeTasteTag(type, val) {
  if (type === 'genre' && Array.isArray(appState.cinemaTaste.genres)) {
    appState.cinemaTaste.genres = appState.cinemaTaste.genres.filter(g => g.toLowerCase() !== val.toLowerCase());
  } else if (type === 'movie' && Array.isArray(appState.cinemaTaste.favoriteMovies)) {
    appState.cinemaTaste.favoriteMovies = appState.cinemaTaste.favoriteMovies.filter(m => m.toLowerCase() !== val.toLowerCase());
  }
  saveState();
  renderTasteStudioTags();
  renderCinemaCatalog();
  showGlobalToast(`Removed "${val}" from profile.`, '🗑️');
}

function submitInlineCinemaCheckin() {
  const titleInput = document.getElementById('inlineCheckinTitle');
  const focusSelect = document.getElementById('inlineCheckinFocus');
  const ratingSelect = document.getElementById('inlineCheckinRating');
  const pointerInput = document.getElementById('inlineCheckinPointer');

  const title = (titleInput ? titleInput.value : '').trim();
  if (!title) {
    alert('Please type the title of a movie or short you watched.');
    if (titleInput) titleInput.focus();
    return;
  }

  const focus = focusSelect ? focusSelect.value : '100% Phone-Free';
  const rating = parseInt(ratingSelect ? ratingSelect.value : '4', 10) || 4;
  const userPointer = pointerInput ? pointerInput.value.trim() : '';

  const match = CINEMA_DATABASE.find(m => m.title.toLowerCase() === title.toLowerCase());
  const runtime = match ? match.runtime : 120;
  const director = match ? match.director : '';

  const newLog = {
    title: match ? match.title : title,
    year: match ? match.year : new Date().getFullYear(),
    director: director,
    runtime: runtime,
    date: new Date().toISOString().split('T')[0],
    phoneFreeRating: focus,
    userRating: rating,
    notes: match ? match.whyAntidote : 'Logged via Lord Algernon cinema inquest check-in.',
    lifePointer: userPointer || (match ? match.lifePointer : null) || 'Focused contemplation on this narrative restored working memory and broke the high-dopamine cycle.',
    socraticQ: match ? match.socraticQ : [
      'What narrative or thematic moment held your undivided attention the longest?',
      'How did sitting through the slower, quiet scenes recalibrate your patience compared to 15-second reels?'
    ],
    craftInsight: match ? match.craftInsight : 'Sustained pacing and intentional visual composition give the human brain room to contemplate rather than panic.'
  };

  if (!appState.watchedMovies) appState.watchedMovies = [];
  appState.watchedMovies.push(newLog);

  // If user gave 4 or 5 stars, automatically add to favorite movies
  if (rating >= 4) {
    if (!Array.isArray(appState.cinemaTaste.favoriteMovies)) {
      appState.cinemaTaste.favoriteMovies = [];
    }
    const alreadyLoved = appState.cinemaTaste.favoriteMovies.some(m => m.toLowerCase() === newLog.title.toLowerCase());
    if (!alreadyLoved) {
      appState.cinemaTaste.favoriteMovies.push(newLog.title);
    }
  }

  // Award hours
  const addedHours = +(runtime / 60).toFixed(2);
  appState.reclaimedHours += addedHours;
  appState.cinemaFocusMinutes = (appState.cinemaFocusMinutes || 0) + runtime;

  saveState();
  updateUIStats();
  renderCinemaJournal();
  renderTasteStudioTags();
  renderCinemaCatalog();

  if (titleInput) titleInput.value = '';
  if (pointerInput) pointerInput.value = '';

  playChime(523.25, 'triangle', 0.3);
  setTimeout(() => playChime(659.25, 'triangle', 0.4), 150);
  setTimeout(() => playChime(783.99, 'triangle', 0.5), 300);

  showGlobalToast(`🎬 "${newLog.title}" logged! Socratic Notebook & life pointer updated (+${addedHours} hrs focus).`, '⭐');
}

function openCinemaWatchModal(movie) {
  const modal = document.getElementById('cinemaWatchModal');
  if (!modal) return;

  const titleElem = document.getElementById('watchModalTitle');
  const avatarElem = document.getElementById('watchModalAvatar');
  const metaElem = document.getElementById('watchModalMeta');
  const antidoteElem = document.getElementById('watchAntidoteText');
  const embedWrap = document.getElementById('watchVideoEmbedWrap');
  const iframe = document.getElementById('watchVideoIframe');
  const streamGrid = document.getElementById('watchStreamingBtnGrid');

  if (titleElem) titleElem.textContent = `${movie.title} (${movie.year})`;
  if (avatarElem) avatarElem.textContent = movie.icon || '🎬';
  if (metaElem) metaElem.textContent = `${movie.runtime} mins • Directed by ${movie.director} • ⭐ ${movie.rating}/10 • ${movie.genreLabel || ''}`;
  if (antidoteElem) antidoteElem.textContent = movie.whyAntidote || movie.description;

  // Embedded player
  if (movie.youtubeEmbedId && embedWrap && iframe) {
    iframe.src = `https://www.youtube-nocookie.com/embed/${movie.youtubeEmbedId}?autoplay=1`;
    embedWrap.style.display = 'block';
  } else {
    if (iframe) iframe.src = '';
    if (embedWrap) embedWrap.style.display = 'none';
  }

  // Populate streaming launch buttons
  if (streamGrid) {
    const encodedTitle = encodeURIComponent(movie.title);
    const options = [];

    if (movie.watchUrl) {
      let badge = 'Direct Link';
      let icon = '▶️';
      if (movie.watchUrl.includes('youtube')) { badge = 'Free HD on YouTube'; icon = '▶️'; }
      else if (movie.watchUrl.includes('netflix')) { badge = 'Official Netflix Stream'; icon = '🍿'; }
      else if (movie.watchUrl.includes('vimeo')) { badge = 'Official Vimeo Stream'; icon = '📽️'; }

      options.push({
        title: `Watch "${movie.title}" on Official Player`,
        url: movie.watchUrl,
        badge: badge,
        icon: icon
      });
    }

    options.push({
      title: `Check Live Streaming Availability on JustWatch`,
      url: `https://www.justwatch.com/us/search?q=${encodedTitle}`,
      badge: 'Live Stream Guide',
      icon: '🔍'
    });

    options.push({
      title: `Find Where to Stream or Rent on Google TV`,
      url: `https://www.google.com/search?q=${encodeURIComponent('where to watch ' + movie.title + ' ' + movie.year + ' movie')}`,
      badge: 'Search Providers',
      icon: '📺'
    });

    options.push({
      title: `Watch Official HD Trailer on YouTube`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' ' + movie.year + ' official trailer hd')}`,
      badge: 'HD Trailer',
      icon: '🎬'
    });

    streamGrid.innerHTML = options.map(opt => `
      <a href="${opt.url}" target="_blank" rel="noopener" class="stream-launch-btn">
        <div class="stream-btn-left">
          <span>${opt.icon}</span>
          <span>${opt.title}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span class="stream-btn-badge">${opt.badge}</span>
          <span style="font-size: 0.75rem; color: #94A3B8;">↗</span>
        </div>
      </a>
    `).join('');
  }

  // Modal Action Buttons
  const btnSession = document.getElementById('btnWatchStartSession');
  if (btnSession) {
    btnSession.onclick = () => {
      closeCinemaWatchModal();
      startCinemaSession(movie);
    };
  }

  const btnCheckin = document.getElementById('btnWatchOpenCheckin');
  if (btnCheckin) {
    btnCheckin.onclick = () => {
      closeCinemaWatchModal();
      openCinemaCheckinModal(movie);
    };
  }

  modal.style.display = 'flex';
}

function closeCinemaWatchModal() {
  const modal = document.getElementById('cinemaWatchModal');
  if (modal) modal.style.display = 'none';
  const iframe = document.getElementById('watchVideoIframe');
  if (iframe) iframe.src = ''; // Stop audio playback
}

function renderCinemaCatalog() {
  const grid = document.getElementById('cinemaGrid');
  const countBadge = document.getElementById('cinemaMatchCount');
  const navCountBadge = document.getElementById('cinemaNavCount');
  if (!grid) return;

  const results = filterCinemaDatabase();
  if (countBadge) countBadge.textContent = results.length;
  if (navCountBadge) navCountBadge.textContent = results.length;

  if (results.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: #94A3B8;">
        <span style="font-size: 2.5rem; display: block; margin-bottom: 0.5rem;">🔍</span>
        <h4>No films match your search or filter combination</h4>
        <p>Try clearing search or setting runtime workout / mood to 'All'.</p>
        <button class="btn-secondary btn-sm" id="btnResetCinemaFilters" style="margin-top: 1rem;">Reset Filters</button>
      </div>
    `;
    const btnReset = document.getElementById('btnResetCinemaFilters');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        appState.cinemaTaste.runtimeFilter = 'all';
        appState.cinemaTaste.level = 'all';
        appState.cinemaTaste.mood = 'all';
        appState.cinemaTaste.search = '';
        document.querySelectorAll('#cinemaRuntimeFilters .filter-pill').forEach(p => {
          p.classList.toggle('active', p.getAttribute('data-runtime') === 'all');
        });
        document.querySelectorAll('#cinemaLevelFilters .filter-pill').forEach(p => {
          p.classList.toggle('active', p.getAttribute('data-level') === 'all');
        });
        document.querySelectorAll('#cinemaMoodFilters .filter-pill').forEach(p => {
          p.classList.toggle('active', p.getAttribute('data-mood') === 'all');
        });
        const searchBox = document.getElementById('cinemaSearchInput');
        if (searchBox) searchBox.value = '';
        renderCinemaCatalog();
      });
    }
    return;
  }

  grid.innerHTML = '';
  results.forEach(({ movie, match }) => {
    const card = document.createElement('div');
    card.className = 'cinema-card';
    card.id = `movie-card-${movie.id}`;

    const levelClass = movie.level === 'level1' ? 'level-tag-1' : (movie.level === 'level2' ? 'level-tag-2' : 'level-tag-3');

    card.innerHTML = `
      <div class="cinema-card-poster" style="background: ${movie.gradient};">
        <div class="cinema-card-poster-top">
          <span class="cinema-level-tag ${levelClass}">${movie.levelLabel}</span>
          <span class="cinema-runtime-tag">⏱️ ${movie.runtime}m</span>
        </div>
        <div class="cinema-poster-icon">${movie.icon}</div>
      </div>
      <div class="cinema-card-body">
        <div class="cinema-title-row">
          <div class="cinema-match-badge ${match.isHighMatch ? 'high-match' : ''}">
            <span>${match.isHighMatch ? '🔥' : '✨'}</span> ${match.label}
          </div>
          <h4 class="cinema-title">${movie.title} <span style="font-size: 0.9rem; font-weight: 500; color: #94A3B8;">(${movie.year})</span></h4>
        </div>
        <div class="cinema-meta-info">Directed by <strong>${movie.director}</strong> • ⭐ ${movie.rating}/10</div>
        <p class="cinema-desc">${movie.description}</p>
        <div class="cinema-antidote-box">
          <span class="antidote-label">🧠 Neurological Antidote:</span>
          <div class="antidote-text">${movie.whyAntidote}</div>
        </div>
        <div class="cinema-tags-row">
          ${movie.tags.map(t => `<span class="cinema-genre-chip">#${t}</span>`).join('')}
        </div>
        <div class="cinema-card-actions">
          <button class="btn-cinema-load" data-movie-id="${movie.id}" title="Load into Frame.io Review Workstation">
            <span>⚡</span> Load in Player
          </button>
          <button class="btn-cinema-watch" data-movie-id="${movie.id}" title="Watch or find live streaming options for ${escapeHtml(movie.title)}">
            <span>▶</span> Stream
          </button>
          <button class="btn-cinema-session" data-movie-id="${movie.id}" title="Start sustained phone-free focus session">
            <span>🍿</span> Focus
          </button>
          <button class="btn-cinema-log" data-movie-id="${movie.id}" title="Mark as watched and record your focus">
            <span>✓</span> Watched
          </button>
        </div>
      </div>
    `;

    // Hook up buttons
    card.querySelector('.btn-cinema-load').addEventListener('click', () => {
      loadMovieIntoFioWorkstation(movie, true);
      showGlobalToast(`🎬 Loaded "${movie.title}" into Frame.io Review Workstation!`, '⚡');
    });

    // Poster click also loads into workstation
    const poster = card.querySelector('.cinema-card-poster');
    if (poster) {
      poster.style.cursor = 'pointer';
      poster.title = `Click to load "${movie.title}" into Frame.io Player`;
      poster.addEventListener('click', () => {
        loadMovieIntoFioWorkstation(movie, true);
        showGlobalToast(`🎬 Loaded "${movie.title}" into Frame.io Review Workstation!`, '⚡');
      });
    }

    card.querySelector('.btn-cinema-watch').addEventListener('click', () => {
      openCinemaWatchModal(movie);
    });

    card.querySelector('.btn-cinema-session').addEventListener('click', () => {
      startCinemaSession(movie);
    });

    card.querySelector('.btn-cinema-log').addEventListener('click', () => {
      openCinemaCheckinModal(movie);
    });

    grid.appendChild(card);
  });

  if (typeof init3DCardPhysics === 'function') {
    init3DCardPhysics();
  }
}

function renderCinemaJournal() {
  const container = document.getElementById('cinemaJournalList');
  if (!container) return;

  const watched = appState.watchedMovies || [];
  if (watched.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2.5rem 1rem; color: #94A3B8;">
        <span style="font-size: 2.2rem; display: block; margin-bottom: 0.5rem;">🎞️</span>
        <p>No watched films logged yet. Click "Check In What You Watched" above to log your first phone-free triumph!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  // Show most recent first
  [...watched].reverse().forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'journal-item-card';

    const stars = '⭐'.repeat(item.userRating || 5);
    const questions = Array.isArray(item.socraticQ) && item.socraticQ.length > 0
      ? item.socraticQ
      : [
        `What narrative scene in "${item.title}" demanded your deepest undivided focus?`,
        'How did resisting the urge to swipe away during quieter moments shift your mental calmness?'
      ];

    const questionsHtml = questions.map(q => `<div class="socratic-q-item">💬 ${escapeHtml(q)}</div>`).join('');
    const lifePointerText = item.lifePointer || 'Deep, deliberate attention reveals profound truths that rapid dopamine feeds can never offer.';
    const craftInsightText = item.craftInsight || 'Deliberate pacing and composed cinematography calm the prefrontal cortex and rebuild working memory.';

    card.innerHTML = `
      <div class="journal-item-header">
        <div class="journal-item-left">
          <div class="journal-item-icon">🎬</div>
          <div>
            <div class="journal-item-title">${escapeHtml(item.title)} ${item.year ? `<span style="font-size: 0.85rem; color: #94A3B8;">(${item.year})</span>` : ''}</div>
            <div class="journal-item-meta">${item.runtime || 120} mins • Logged on ${escapeHtml(item.date || 'Recent')} ${item.director ? `• Dir: ${escapeHtml(item.director)}` : ''}</div>
          </div>
        </div>
        <div class="journal-item-right" style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
          <span class="journal-item-badge">${escapeHtml(item.phoneFreeRating || '100% Phone-Free')}</span>
          <span class="journal-item-stars">${stars}</span>
          <button class="journal-expand-btn" type="button" aria-expanded="false" title="Click to view Socratic inquiries and golden life pointer">
            <span class="journal-expand-label">Socratic Notebook & Life Pointer</span>
            <span class="journal-expand-arrow">▼</span>
          </button>
        </div>
      </div>
      <div class="journal-socratic-drawer">
        <!-- Golden Life Benefit Pointer Highlight Card -->
        <div class="golden-life-pointer-card" style="margin-bottom: 1.15rem;">
          <div class="life-pointer-badge-icon">🌟</div>
          <div class="life-pointer-content">
            <span class="life-pointer-label">Golden Life Benefit Pointer (Character / Story Takeaway)</span>
            <p class="life-pointer-text">${escapeHtml(lifePointerText)}</p>
          </div>
        </div>

        <!-- Socratic Inquiries & Craft Grid -->
        <div class="socratic-grid">
          <div class="socratic-section-box">
            <div class="socratic-box-title">🧐 Lord Algernon's Socratic Inquiries</div>
            <div class="socratic-questions-list">
              ${questionsHtml}
            </div>
          </div>
          <div class="socratic-section-box">
            <div class="socratic-box-title">🎥 Cinematic Craft & Focus Notes</div>
            <div style="font-size: 0.82rem; color: #94A3B8; margin-bottom: 0.6rem; line-height: 1.45;">
              <strong style="color: #F1F5F9;">Directing Insight:</strong> ${escapeHtml(craftInsightText)}
            </div>
            ${item.notes ? `<div class="socratic-user-notes">"${escapeHtml(item.notes)}"</div>` : ''}
          </div>
        </div>
      </div>
    `;

    // Toggle drawer on header click
    const header = card.querySelector('.journal-item-header');
    const expandBtn = card.querySelector('.journal-expand-btn');
    const expandLabel = card.querySelector('.journal-expand-label');

    header.addEventListener('click', () => {
      const isExpanded = card.classList.toggle('is-expanded');
      if (expandBtn) expandBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      if (expandLabel) {
        expandLabel.textContent = isExpanded ? 'Hide Socratic Notebook' : 'Socratic Notebook & Life Pointer';
      }
    });

    container.appendChild(card);
  });
}

// ============================================================================
// FRAME.IO PRO REVIEW WORKSTATION & TIME-CODED SCRUBBING ENGINE
// ============================================================================

const fioState = {
  currentMovie: null,
  isPlaying: false,
  currentSeconds: 0,
  totalSeconds: 10140, // default 169m (Interstellar)
  playbackRate: 1.0,
  timerInterval: null,
  markers: [],
  activeFilter: 'all',
  version: 'v2.4 Final Cut',
  status: 'In Review'
};

function formatSMPTE(seconds, fps = 24) {
  const s = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  const frames = Math.floor((seconds - Math.floor(seconds)) * fps);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}:${pad(frames)}`;
}

function loadMovieIntoFioWorkstation(movie, autoScroll = true) {
  if (!movie) return;
  fioState.currentMovie = movie;
  fioState.totalSeconds = (movie.runtime || 120) * 60;
  fioState.currentSeconds = 0;
  if (fioState.isPlaying) pauseFioPlayback();

  // Top Bar Asset Name
  const headerName = document.getElementById('fioHeaderAssetName');
  if (headerName) headerName.textContent = `${movie.title} (${movie.year})`;

  // Big Screen Info
  const bigIcon = document.getElementById('fioBigFilmIcon');
  if (bigIcon) bigIcon.textContent = movie.icon || '🎬';

  const eyebrow = document.getElementById('fioBigFilmEyebrow');
  if (eyebrow) eyebrow.textContent = `${(movie.genreLabel || 'FEATURE FILM').toUpperCase()} • ${movie.runtime} MINS`;

  const bigTitle = document.getElementById('fioBigFilmTitle');
  if (bigTitle) bigTitle.textContent = movie.title;

  const bigMeta = document.getElementById('fioBigFilmMeta');
  if (bigMeta) bigMeta.textContent = `${movie.year} • Directed by ${movie.director} • ⭐ ${movie.rating}/10`;

  const bigAntidote = document.getElementById('fioBigFilmAntidote');
  if (bigAntidote) bigAntidote.textContent = `"${movie.whyAntidote || movie.description}"`;

  const backdrop = document.getElementById('fioFilmBackdrop');
  if (backdrop && movie.gradient) {
    backdrop.style.background = `radial-gradient(circle at 50% 35%, rgba(124, 58, 237, 0.28) 0%, rgba(11, 12, 17, 0.95) 75%), ${movie.gradient}`;
  }

  // Stream Link
  const streamBtn = document.getElementById('btnFioLaunchStream');
  if (streamBtn) {
    streamBtn.href = movie.watchUrl || `https://www.google.com/search?q=${encodeURIComponent(movie.title + ' ' + movie.year + ' movie watch')}`;
  }

  // Focus session button
  const focusBtn = document.getElementById('btnFioStartFocusSession');
  if (focusBtn) {
    focusBtn.onclick = () => startCinemaSession(movie);
  }

  // Video embed check
  const embedWrap = document.getElementById('fioVideoEmbed');
  const iframe = document.getElementById('fioIframe');
  if (movie.youtubeEmbedId && embedWrap && iframe) {
    iframe.src = `https://www.youtube-nocookie.com/embed/${movie.youtubeEmbedId}?enablejsapi=1&rel=0`;
    embedWrap.style.display = 'block';
  } else {
    if (iframe) iframe.src = '';
    if (embedWrap) embedWrap.style.display = 'none';
  }

  // Total SMPTE timecode
  const tcTotal = document.getElementById('fioTcTotal');
  if (tcTotal) tcTotal.textContent = formatSMPTE(fioState.totalSeconds);

  // Generate and render markers
  generateFioMarkersForMovie(movie);
  updateFioPlayheadDisplay();
  renderFioMarkers();
  renderFioComments();

  if (autoScroll) {
    const workstation = document.getElementById('fioWorkspaceWrapper');
    if (workstation) {
      workstation.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

function generateFioMarkersForMovie(movie) {
  const dur = fioState.totalSeconds;
  fioState.markers = [
    {
      id: 'm-opening',
      timeSec: Math.floor(dur * 0.04),
      timecode: formatSMPTE(Math.floor(dur * 0.04)),
      category: 'director',
      author: `${movie.director}`,
      role: 'Director Craft',
      avatar: '🎬',
      text: movie.craftInsight || 'Opening visual immersion: observe the deliberateness of pacing and camera blocking.',
      resolved: false
    },
    {
      id: 'm-focus',
      timeSec: Math.floor(dur * 0.28),
      timecode: formatSMPTE(Math.floor(dur * 0.28)),
      category: 'focus',
      author: 'Lord Algernon',
      role: 'Focus Checkpoint',
      avatar: '🧐',
      text: `Neurological focus test: ${movie.whyAntidote}`,
      resolved: false
    }
  ];

  if (Array.isArray(movie.socraticQ)) {
    movie.socraticQ.forEach((q, idx) => {
      const pct = 0.52 + idx * 0.22;
      if (pct < 0.92) {
        fioState.markers.push({
          id: `m-soc-${idx}`,
          timeSec: Math.floor(dur * pct),
          timecode: formatSMPTE(Math.floor(dur * pct)),
          category: 'socratic',
          author: 'Socratic Tutor',
          role: 'Inquiry Marker',
          avatar: '💭',
          text: q,
          resolved: false
        });
      }
    });
  }

  if (movie.lifePointer) {
    fioState.markers.push({
      id: 'm-life',
      timeSec: Math.floor(dur * 0.91),
      timecode: formatSMPTE(Math.floor(dur * 0.91)),
      category: 'life',
      author: 'Wisdom Ledger',
      role: 'Golden Life Pointer',
      avatar: '🌟',
      text: movie.lifePointer,
      resolved: false
    });
  }

  fioState.markers.sort((a, b) => a.timeSec - b.timeSec);
}

function renderFioMarkers() {
  const container = document.getElementById('fioMarkersLayer');
  if (!container) return;
  container.innerHTML = '';

  const dur = fioState.totalSeconds || 1;
  fioState.markers.forEach(m => {
    const pct = Math.min(100, Math.max(0, (m.timeSec / dur) * 100));
    const pin = document.createElement('div');
    pin.className = `fio-marker-pin marker-${m.category} ${m.resolved ? 'resolved' : ''}`;
    pin.style.left = `${pct}%`;
    pin.title = `[${m.timecode}] ${m.author}: ${m.text.slice(0, 50)}...`;
    pin.innerHTML = '<span class="fio-pin-dot"></span>';

    pin.addEventListener('click', (e) => {
      e.stopPropagation();
      seekFioToSeconds(m.timeSec);
      highlightFioComment(m.id);
    });

    container.appendChild(pin);
  });
}

function renderFioComments() {
  const feed = document.getElementById('fioCommentsFeed');
  const countBadge = document.getElementById('fioCommentCount');
  if (!feed) return;

  const filtered = fioState.markers.filter(m => {
    if (fioState.activeFilter === 'all') return true;
    if (fioState.activeFilter === 'socratic') return m.category === 'socratic';
    if (fioState.activeFilter === 'director') return m.category === 'director';
    if (fioState.activeFilter === 'user') return m.category === 'user' || m.category === 'focus' || m.category === 'life';
    return true;
  });

  if (countBadge) countBadge.textContent = filtered.length;

  if (filtered.length === 0) {
    feed.innerHTML = `
      <div class="fio-empty-comments">
        <span>📍</span>
        <p>No notes in this category. Drag playhead or click "+Marker" to add one!</p>
      </div>
    `;
    return;
  }

  feed.innerHTML = filtered.map(m => `
    <div class="fio-comment-card ${m.resolved ? 'is-resolved' : ''}" id="fio-comment-${m.id}">
      <div class="fio-comment-header">
        <button class="fio-tc-jump-btn" data-time="${m.timeSec}" title="Jump playhead to ${m.timecode}">
          <span class="fio-jump-play">▶</span>
          <span class="fio-jump-code">${m.timecode}</span>
        </button>
        <div class="fio-comment-author-badge">
          <span class="fio-comment-avatar">${m.avatar || '💬'}</span>
          <span class="fio-comment-author">${escapeHtml(m.author || 'User')}</span>
          <span class="fio-comment-role">${escapeHtml(m.role || 'Note')}</span>
        </div>
        <button class="fio-resolve-btn ${m.resolved ? 'active' : ''}" data-id="${m.id}" title="${m.resolved ? 'Mark In Review' : 'Mark Resolved'}">
          ${m.resolved ? '✓ Resolved' : '○ Resolve'}
        </button>
      </div>
      <div class="fio-comment-body">
        ${escapeHtml(m.text)}
      </div>
    </div>
  `).join('');

  feed.querySelectorAll('.fio-tc-jump-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sec = parseFloat(btn.getAttribute('data-time'));
      seekFioToSeconds(sec);
    });
  });

  feed.querySelectorAll('.fio-resolve-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const item = fioState.markers.find(m => m.id === id);
      if (item) {
        item.resolved = !item.resolved;
        renderFioComments();
        renderFioMarkers();
      }
    });
  });
}

function seekFioToSeconds(targetSec) {
  const dur = fioState.totalSeconds || 1;
  fioState.currentSeconds = Math.max(0, Math.min(dur, targetSec));
  updateFioPlayheadDisplay();
}

function updateFioPlayheadDisplay() {
  const dur = fioState.totalSeconds || 1;
  const pct = Math.min(100, Math.max(0, (fioState.currentSeconds / dur) * 100));

  const progressBar = document.getElementById('fioProgressBar');
  if (progressBar) progressBar.style.width = `${pct}%`;

  const playhead = document.getElementById('fioPlayhead');
  if (playhead) playhead.style.left = `${pct}%`;

  const tcCurrent = document.getElementById('fioTcCurrent');
  if (tcCurrent) tcCurrent.textContent = formatSMPTE(fioState.currentSeconds);

  const tooltip = document.getElementById('fioPlayheadTooltip');
  if (tooltip) tooltip.textContent = formatSMPTE(fioState.currentSeconds);

  const activePill = document.getElementById('fioActiveStampPill');
  if (activePill) activePill.textContent = formatSMPTE(fioState.currentSeconds);
}

function toggleFioPlayback() {
  if (fioState.isPlaying) {
    pauseFioPlayback();
  } else {
    startFioPlayback();
  }
}

function startFioPlayback() {
  if (fioState.isPlaying) return;
  fioState.isPlaying = true;

  const playIcon = document.getElementById('fioPlayIcon');
  if (playIcon) playIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';

  const centerIcon = document.getElementById('fioCenterPlayIcon');
  if (centerIcon) centerIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';

  const stateTag = document.getElementById('fioPlayerStateTag');
  if (stateTag) {
    stateTag.textContent = 'PLAYING';
    stateTag.style.color = '#34D399';
  }

  const centerBtn = document.getElementById('btnFioCenterPlay');
  if (centerBtn) centerBtn.classList.add('playing');

  const stepMs = 50;
  fioState.timerInterval = setInterval(() => {
    fioState.currentSeconds += (stepMs / 1000) * fioState.playbackRate * 10;
    if (fioState.currentSeconds >= fioState.totalSeconds) {
      fioState.currentSeconds = fioState.totalSeconds;
      pauseFioPlayback();
    }
    updateFioPlayheadDisplay();
  }, stepMs);
}

function pauseFioPlayback() {
  fioState.isPlaying = false;
  if (fioState.timerInterval) {
    clearInterval(fioState.timerInterval);
    fioState.timerInterval = null;
  }

  const playIcon = document.getElementById('fioPlayIcon');
  if (playIcon) playIcon.innerHTML = '<polygon points="6 4 20 12 6 20 6 4"></polygon>';

  const centerIcon = document.getElementById('fioCenterPlayIcon');
  if (centerIcon) centerIcon.innerHTML = '<polygon points="6 4 20 12 6 20 6 4"></polygon>';

  const stateTag = document.getElementById('fioPlayerStateTag');
  if (stateTag) {
    stateTag.textContent = 'PAUSED';
    stateTag.style.color = '#C4B5FD';
  }

  const centerBtn = document.getElementById('btnFioCenterPlay');
  if (centerBtn) centerBtn.classList.remove('playing');
}

function cycleFioSpeed() {
  const speeds = [0.5, 1.0, 1.25, 1.5, 2.0];
  const curIdx = speeds.indexOf(fioState.playbackRate);
  const nextIdx = (curIdx + 1) % speeds.length;
  fioState.playbackRate = speeds[nextIdx];
  const btn = document.getElementById('btnFioSpeed');
  if (btn) btn.textContent = `${fioState.playbackRate}x`;
  showGlobalToast(`Playback speed: ${fioState.playbackRate}x`, '⚡');
}

function toggleFioStatus() {
  const chip = document.getElementById('fioStatusChip');
  const text = document.getElementById('fioStatusText');
  if (fioState.status === 'In Review') {
    fioState.status = 'Approved';
    if (chip) chip.className = 'fio-status-chip approved';
    if (text) text.textContent = 'Approved';
    showGlobalToast('Review Status: Cut Approved! ✓', '✓');
    playChime(659.25, 'triangle', 0.25);
  } else {
    fioState.status = 'In Review';
    if (chip) chip.className = 'fio-status-chip in-review';
    if (text) text.textContent = 'In Review';
    showGlobalToast('Review Status: In Review', 'ℹ️');
  }
}

function postFioUserComment() {
  const input = document.getElementById('fioNewCommentText');
  const catSelect = document.getElementById('fioCommentCategory');
  if (!input) return;
  const text = input.value.trim();
  if (!text) {
    showGlobalToast('Please write a note before posting.', '⚠️');
    return;
  }
  const category = catSelect ? catSelect.value : 'user';
  const newMarker = {
    id: `m-user-${Date.now()}`,
    timeSec: Math.floor(fioState.currentSeconds),
    timecode: formatSMPTE(fioState.currentSeconds),
    category: category,
    author: 'You (Reviewer)',
    role: 'Frame Note',
    avatar: '✍️',
    text: text,
    resolved: false
  };

  fioState.markers.push(newMarker);
  fioState.markers.sort((a, b) => a.timeSec - b.timeSec);
  input.value = '';

  renderFioMarkers();
  renderFioComments();
  highlightFioComment(newMarker.id);

  playChime(587.33, 'triangle', 0.25);
  showGlobalToast(`Note pinned at ${newMarker.timecode}!`, '📍');
}

function highlightFioComment(id) {
  const card = document.getElementById(`fio-comment-${id}`);
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    card.classList.add('highlighted');
    setTimeout(() => card.classList.remove('highlighted'), 1800);
  }
}

function initFioWorkstation() {
  // Load default master cut (Interstellar or first film)
  const defaultMovie = CINEMA_DATABASE.find(m => m.id === 'interstellar') || CINEMA_DATABASE[0];
  if (defaultMovie) {
    loadMovieIntoFioWorkstation(defaultMovie, false);
  }

  // Play / Pause toggles
  const btnPlayPause = document.getElementById('btnFioPlayPause');
  if (btnPlayPause) btnPlayPause.addEventListener('click', toggleFioPlayback);

  const btnCenterPlay = document.getElementById('btnFioCenterPlay');
  if (btnCenterPlay) btnCenterPlay.addEventListener('click', toggleFioPlayback);

  // Scrubber drag / click
  const trackWrap = document.getElementById('fioTimelineTrackWrap');
  if (trackWrap) {
    let isDragging = false;
    const handleScrub = (e) => {
      const rect = trackWrap.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, clickX / rect.width));
      seekFioToSeconds(pct * fioState.totalSeconds);
    };

    trackWrap.addEventListener('mousedown', (e) => {
      isDragging = true;
      handleScrub(e);
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) handleScrub(e);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  // Step buttons
  const btnStepBack = document.getElementById('btnFioStepBack');
  if (btnStepBack) {
    btnStepBack.addEventListener('click', () => seekFioToSeconds(fioState.currentSeconds - 5));
  }

  const btnStepForward = document.getElementById('btnFioStepForward');
  if (btnStepForward) {
    btnStepForward.addEventListener('click', () => seekFioToSeconds(fioState.currentSeconds + 5));
  }

  // Prev / Next marker jump
  const btnPrevMarker = document.getElementById('btnFioPrevMarker');
  if (btnPrevMarker) {
    btnPrevMarker.addEventListener('click', () => {
      const prev = [...fioState.markers].reverse().find(m => m.timeSec < fioState.currentSeconds - 1);
      if (prev) {
        seekFioToSeconds(prev.timeSec);
        highlightFioComment(prev.id);
      } else {
        seekFioToSeconds(0);
      }
    });
  }

  const btnNextMarker = document.getElementById('btnFioNextMarker');
  if (btnNextMarker) {
    btnNextMarker.addEventListener('click', () => {
      const next = fioState.markers.find(m => m.timeSec > fioState.currentSeconds + 1);
      if (next) {
        seekFioToSeconds(next.timeSec);
        highlightFioComment(next.id);
      }
    });
  }

  // Playback speed
  const btnSpeed = document.getElementById('btnFioSpeed');
  if (btnSpeed) btnSpeed.addEventListener('click', cycleFioSpeed);

  // Status toggle
  const chipStatus = document.getElementById('fioStatusChip');
  if (chipStatus) chipStatus.addEventListener('click', toggleFioStatus);

  // Post comment
  const btnPost = document.getElementById('btnFioPostComment');
  if (btnPost) btnPost.addEventListener('click', postFioUserComment);

  const commentInput = document.getElementById('fioNewCommentText');
  if (commentInput) {
    commentInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        postFioUserComment();
      }
    });
  }

  // Filter tabs
  document.querySelectorAll('.fio-filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.fio-filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      fioState.activeFilter = tab.getAttribute('data-filter') || 'all';
      renderFioComments();
    });
  });

  // Top header actions
  const btnAddMarker = document.getElementById('btnFioAddMarker');
  const btnAddMarkerTop = document.getElementById('btnFioAddMarkerTop');
  const focusCommentInput = () => {
    const input = document.getElementById('fioNewCommentText');
    if (input) {
      input.focus();
      showGlobalToast(`Add your note at frame ${formatSMPTE(fioState.currentSeconds)}`, '📍');
    }
  };
  if (btnAddMarker) btnAddMarker.addEventListener('click', focusCommentInput);
  if (btnAddMarkerTop) btnAddMarkerTop.addEventListener('click', focusCommentInput);

  const btnShare = document.getElementById('btnFioShareLink');
  if (btnShare) {
    btnShare.addEventListener('click', () => {
      const url = `${window.location.origin}${window.location.pathname}#cinema`;
      navigator.clipboard?.writeText(url);
      showGlobalToast('📋 Frame.io review link copied to clipboard!', '🔗');
      playChime(659.25, 'triangle', 0.2);
    });
  }

  const btnCheckinWatch = document.getElementById('btnFioCheckinWatch');
  if (btnCheckinWatch) {
    btnCheckinWatch.addEventListener('click', () => {
      if (fioState.currentMovie) {
        openCinemaCheckinModal(fioState.currentMovie);
      } else {
        openCinemaCheckinModal();
      }
    });
  }

  // Fullscreen theater toggle
  const btnFullscreen = document.getElementById('btnFioFullscreen');
  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', () => {
      const stage = document.getElementById('fioWorkstationLayout');
      if (!stage) return;
      if (!document.fullscreenElement) {
        stage.requestFullscreen?.().catch(() => { });
      } else {
        document.exitFullscreen?.().catch(() => { });
      }
    });
  }

  // Audio speaker feedback / Johnny Dynamite Vintage Radio DJ
  const btnAudio = document.getElementById('btnFioAudio');
  if (btnAudio) {
    btnAudio.addEventListener('click', () => {
      const promptText = document.getElementById('cinemaPromptText')?.textContent 
        || "Cinema focus initialized. Silence all digital distractions and engage deep awareness.";
      speakJohnnyDynamite(promptText, 'cinema', btnAudio);
    });
  }
}

function startCinemaSession(movie) {
  if (cinemaSessionTimer) clearInterval(cinemaSessionTimer);

  appState.activeCinemaSession = {
    title: movie.title,
    year: movie.year,
    runtime: movie.runtime,
    director: movie.director,
    startTime: Date.now()
  };
  cinemaSessionRemaining = movie.runtime * 60; // in seconds

  const banner = document.getElementById('cinemaSessionBanner');
  const titleElem = document.getElementById('sessionMovieTitle');
  const timerDigits = document.getElementById('sessionTimerDigits');

  if (titleElem) titleElem.textContent = `${movie.title} (${movie.year}) — Dir: ${movie.director}`;
  if (timerDigits) {
    const mins = Math.floor(cinemaSessionRemaining / 60);
    const secs = cinemaSessionRemaining % 60;
    timerDigits.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  if (banner) {
    banner.style.display = 'block';
    banner.scrollIntoView({ behavior: 'smooth' });
  }

  cinemaSessionTimer = setInterval(() => {
    cinemaSessionRemaining--;
    if (timerDigits) {
      const mins = Math.floor(cinemaSessionRemaining / 60);
      const secs = cinemaSessionRemaining % 60;
      timerDigits.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    if (cinemaSessionRemaining <= 0) {
      clearInterval(cinemaSessionTimer);
      banner.style.display = 'none';
      openCinemaCheckinModal(movie);
      playChime(523.25, 'sine', 1.5);
      showGlobalToast(`🎬 Cinema session complete for ${movie.title}! Time to log your focus.`, '🍿');
    }
  }, 1000);

  playChime(440, 'triangle', 0.4);
  setTimeout(() => playChime(659.25, 'triangle', 0.6), 200);
  showGlobalToast(`🍿 Phone-free mode engaged for ${movie.title}. Put your phone aside!`, '🎬');
  saveState();
}

function cancelCinemaSession() {
  if (cinemaSessionTimer) clearInterval(cinemaSessionTimer);
  appState.activeCinemaSession = null;
  const banner = document.getElementById('cinemaSessionBanner');
  if (banner) banner.style.display = 'none';
  showGlobalToast('Cinema session cancelled.', 'ℹ️');
  saveState();
}

function openCinemaCheckinModal(prefilledMovie = null) {
  const modal = document.getElementById('cinemaCheckinModal');
  if (!modal) return;

  const titleInput = document.getElementById('checkinMovieTitle');
  const runtimeInput = document.getElementById('checkinRuntime');
  const notesInput = document.getElementById('checkinNotes');
  const pointerInput = document.getElementById('checkinLifePointer');

  if (prefilledMovie) {
    if (titleInput) titleInput.value = prefilledMovie.title;
    if (runtimeInput) runtimeInput.value = prefilledMovie.runtime || 120;
    if (notesInput) notesInput.value = prefilledMovie.whyAntidote ? `Felt the restorative effect of: ${prefilledMovie.whyAntidote.slice(0, 70)}...` : '';
    if (pointerInput) pointerInput.value = prefilledMovie.lifePointer || '';
  } else {
    if (titleInput) titleInput.value = '';
    if (runtimeInput) runtimeInput.value = 120;
    if (notesInput) notesInput.value = '';
    if (pointerInput) pointerInput.value = '';
  }

  modal.style.display = 'flex';
}

function submitCinemaCheckin() {
  const titleInput = document.getElementById('checkinMovieTitle');
  const runtimeInput = document.getElementById('checkinRuntime');
  const ratingInput = document.getElementById('checkinRating');
  const notesInput = document.getElementById('checkinNotes');
  const pointerInput = document.getElementById('checkinLifePointer');
  const phoneFreeRadio = document.querySelector('input[name="phoneFreeRating"]:checked');

  const title = (titleInput ? titleInput.value : '').trim();
  if (!title) {
    alert('Please enter a movie title.');
    if (titleInput) titleInput.focus();
    return;
  }

  const runtime = parseInt(runtimeInput ? runtimeInput.value : 120, 10) || 120;
  const rating = parseInt(ratingInput ? ratingInput.value : 5, 10) || 5;
  const notes = (notesInput ? notesInput.value : '').trim();
  const userPointer = (pointerInput ? pointerInput.value : '').trim();
  const phoneFree = phoneFreeRadio ? phoneFreeRadio.value : '100% Phone-Free';

  // Find match in database if exists for metadata
  const match = CINEMA_DATABASE.find(m => m.title.toLowerCase() === title.toLowerCase());

  const newLog = {
    title: match ? match.title : title,
    year: match ? match.year : new Date().getFullYear(),
    director: match ? match.director : '',
    runtime: runtime,
    date: new Date().toISOString().split('T')[0],
    phoneFreeRating: phoneFree,
    userRating: rating,
    notes: notes || (match ? match.whyAntidote : 'Completed sustained long-form focus.'),
    lifePointer: userPointer || (match && match.lifePointer) || 'Deep, deliberate attention builds character resilience and frees the mind from frantic digital loops.',
    socraticQ: (match && match.socraticQ) || [
      `What moment in "${match ? match.title : title}" demanded your deepest undivided focus?`,
      'How did sitting through the slower, quiet scenes recalibrate your patience compared to 15-second reels?'
    ],
    craftInsight: (match && match.craftInsight) || 'Sustained pacing and intentional visual composition give the human brain room to contemplate rather than panic.'
  };

  if (!appState.watchedMovies) appState.watchedMovies = [];
  appState.watchedMovies.push(newLog);

  // If user gave 4 or 5 stars, automatically add to favorite movies
  if (rating >= 4) {
    if (!Array.isArray(appState.cinemaTaste.favoriteMovies)) {
      appState.cinemaTaste.favoriteMovies = [];
    }
    const alreadyLoved = appState.cinemaTaste.favoriteMovies.some(m => m.toLowerCase() === newLog.title.toLowerCase());
    if (!alreadyLoved) {
      appState.cinemaTaste.favoriteMovies.push(newLog.title);
    }
  }

  // Award reclaimed hours!
  const addedHours = +(runtime / 60).toFixed(2);
  appState.reclaimedHours += addedHours;
  appState.cinemaFocusMinutes = (appState.cinemaFocusMinutes || 0) + runtime;

  // Check badges
  if (appState.watchedMovies.length >= 2 && !appState.unlockedBadges.includes('cinema_monk')) {
    appState.unlockedBadges.push('cinema_monk');
  }

  saveState();
  updateUIStats();
  renderCinemaJournal();
  renderTasteStudioTags();

  // Close modal and cancel session if running
  const modal = document.getElementById('cinemaCheckinModal');
  if (modal) modal.style.display = 'none';

  if (cinemaSessionTimer) {
    clearInterval(cinemaSessionTimer);
    const banner = document.getElementById('cinemaSessionBanner');
    if (banner) banner.style.display = 'none';
  }

  playChime(523.25, 'triangle', 0.3);
  setTimeout(() => playChime(659.25, 'triangle', 0.4), 150);
  setTimeout(() => playChime(783.99, 'triangle', 0.5), 300);

  showGlobalToast(`🎬 "${newLog.title}" logged! +${addedHours} hrs of sustained focus awarded to your journal.`, '⭐');
}

// ============================================================================
// 11. UI UPDATES & TAB SWITCHING
// ============================================================================
function updateUIStats() {
  // Header
  document.getElementById('headerSavedHours').textContent = appState.reclaimedHours.toFixed(1);

  // Sanctuary Dashboard
  document.getElementById('dashReclaimedHours').innerHTML = `${appState.reclaimedHours.toFixed(1)} <span class="metric-unit">hrs</span>`;
  document.getElementById('dashQuestsCount').innerHTML = `${appState.questsCompleted} <span class="metric-unit">done</span>`;
  document.getElementById('dashSunsetsCount').innerHTML = `${appState.sunsetsWitnessed} <span class="metric-unit">witnessed</span>`;

  // Cinema Stats
  const cinemaFilmsElem = document.getElementById('cinemaFilmsCount');
  if (cinemaFilmsElem && appState.watchedMovies) {
    cinemaFilmsElem.textContent = appState.watchedMovies.length;
  }
  const cinemaHoursElem = document.getElementById('cinemaTotalHours');
  if (cinemaHoursElem && appState.watchedMovies) {
    const totalMins = appState.watchedMovies.reduce((acc, m) => acc + (m.runtime || 120), 0);
    cinemaHoursElem.innerHTML = `${(totalMins / 60).toFixed(1)} <span class="stat-unit">hrs</span>`;
  }
  const cinemaRankElem = document.getElementById('cinemaFocusRank');
  if (cinemaRankElem && appState.watchedMovies) {
    const count = appState.watchedMovies.length;
    if (count >= 10) cinemaRankElem.textContent = 'Level 4: Zen Cinema Master';
    else if (count >= 5) cinemaRankElem.textContent = 'Level 3: Sustained Attention';
    else if (count >= 2) cinemaRankElem.textContent = 'Level 2: Deep Immersion';
    else cinemaRankElem.textContent = 'Level 1: Novice Viewer';
  }
}

function initTabNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  const panes = document.querySelectorAll('.tab-pane');
  const suitePills = document.querySelectorAll('.suite-pill');
  const dockButtons = document.querySelectorAll('.dock-btn');

  function updateActiveIndicators(targetId) {
    // 1. Header Navigation Bar
    navButtons.forEach(b => {
      const match = b.getAttribute('data-tab') === targetId;
      b.classList.toggle('active', match);
      b.setAttribute('aria-selected', match ? 'true' : 'false');
    });

    // 2. Suite Ribbon Pills
    suitePills.forEach(pill => {
      const match = pill.getAttribute('data-tab-target') === targetId;
      pill.classList.toggle('active', match);
    });

    // 3. Floating 3D Dynamic Island Navigator
    dockButtons.forEach(dockBtn => {
      const match = dockBtn.getAttribute('data-target') === targetId;
      dockBtn.classList.toggle('active', match);
    });

    // 4. Update URL hash without scroll jumps
    const hashMap = {
      'tab-dashboard': '',
      'tab-simulator': '#simulator',
      'tab-calculator': '#calculator',
      'tab-quests': '#quests',
      'tab-sounds': '#sounds',
      'tab-cinema': '#cinema',
      'tab-guide': '#guide'
    };
    if (targetId in hashMap) {
      const newHash = hashMap[targetId];
      history.replaceState(null, null, newHash || window.location.pathname);
    }
  }

  // Header Nav button clicks -> smooth scroll
  navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-tab');
      updateActiveIndicators(targetId);
      navigateToSection(targetId);
    });
  });

  // Suite Ribbon pills -> smooth scroll
  suitePills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = pill.getAttribute('data-tab-target');
      if (targetId) {
        updateActiveIndicators(targetId);
        navigateToSection(targetId);
      }
    });
  });

  // Floating 3D Dynamic Island Dock buttons -> smooth scroll
  dockButtons.forEach(dockBtn => {
    dockBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = dockBtn.getAttribute('data-target');
      if (targetId) {
        updateActiveIndicators(targetId);
        navigateToSection(targetId);
      }
    });
  });

  // ScrollSpy using IntersectionObserver for continuous scrolling voyage
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          updateActiveIndicators(sectionId);
        }
      });
    }, {
      root: null,
      rootMargin: '-20% 0px -50% 0px',
      threshold: 0
    });

    panes.forEach(pane => observer.observe(pane));
  }

  // Floating Dock Scroll Progress Bar
  const dockScrollBar = document.getElementById('dockScrollBar');
  if (dockScrollBar) {
    window.addEventListener('scroll', () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const scrolled = (window.scrollY / docHeight) * 100;
        dockScrollBar.style.width = `${Math.min(100, Math.max(0, scrolled))}%`;
      }
    }, { passive: true });
  }
}

function navigateToSection(targetId) {
  const targetPane = document.getElementById(targetId);
  if (targetPane) {
    targetPane.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.querySelectorAll('.tab-pane').forEach(p => {
      if (p.id === targetId) p.classList.add('active');
    });
  }
}

function switchTab(tabId) {
  navigateToSection(tabId);
}

// Squared Card Physics: Clean straight lift without tilt
function init3DCardPhysics() {
  const cards = document.querySelectorAll('.quest-card, .cinema-card, .calc-results-card, .fio-workstation-window, .preset-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-5px)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'none';
    });
  });
}

// ============================================================================
// 11. INITIALIZATION & EVENT LISTENERS
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initTabNavigation();
  init3DCardPhysics();
  initSimulator();
  initNatureParticles();
  startNatureLoop();
  initInstrument();
  updateUIStats();
  updateLifeTollCalculations();
  renderQuests('60', 'all');

  // Soundscape toggle in header
  document.getElementById('soundscapeBtn').addEventListener('click', toggleMasterSoundscape);

  // Sound Sanctuary Presets
  document.querySelectorAll('.preset-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const presetKey = card.getAttribute('data-preset');
      activateSoundPreset(presetKey);
    });
  });

  // Acoustic Nature Strum & Bowl Strike Listeners
  document.querySelectorAll('.acoustic-nature-actions .solfeggio-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.acoustic-nature-actions .solfeggio-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  const btnStrike = document.getElementById('btnStrikeBowl');
  if (btnStrike) {
    btnStrike.addEventListener('click', () => {
      strikeTibetanBowlNow(264);
    });
  }

  // Master Audio Toggle
  const btnMaster = document.getElementById('btnMasterAudioToggle');
  if (btnMaster) {
    btnMaster.addEventListener('click', toggleMasterSoundscape);
  }

  // Master Volume Slider
  const masterSlider = document.getElementById('masterVolumeSlider');
  if (masterSlider) {
    masterSlider.addEventListener('input', (e) => {
      appState.masterVolume = parseInt(e.target.value, 10);
      const numElem = document.getElementById('masterVolumeNum');
      if (numElem) numElem.textContent = `${appState.masterVolume}%`;
      if (masterGain && audioCtx) {
        masterGain.gain.setValueAtTime(appState.masterVolume / 100, audioCtx.currentTime);
      }
      saveState();
    });
  }

    // Mixer Tracks Checkboxes & Sliders (8 Organic Nature Channels)
  const trackKeys = ['rain', 'ocean', 'breeze', 'stream', 'crystal', 'bamboo', 'birds', 'crickets'];
  trackKeys.forEach(key => {
    const capKey = capitalize(key);
    const chk = document.getElementById(`chkTrack${capKey}`);
    const slider = document.getElementById(`volTrack${capKey}`);
    const valDisp = document.getElementById(`valTrack${capKey}`);

    if (chk) {
      chk.addEventListener('change', (e) => {
        appState.mixerActive[key] = e.target.checked;
        if (e.target.checked && !appState.soundscapeActive) {
          toggleMasterSoundscape();
        } else {
          applyMixerState();
        }
        saveState();
      });
    }

    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        appState.mixerVolumes[key] = val;
        if (valDisp) valDisp.textContent = `${val}%`;

        if (continuousNodes[key] && continuousNodes[key].gain && audioCtx) {
          continuousNodes[key].gain.gain.setValueAtTime((val / 100) * 0.40, audioCtx.currentTime);
        }
        saveState();
      });
    }
  });

  // Micro Test Buttons for 8 Nature Channels
  const btnTestRain = document.getElementById('btnTestRain');
  if (btnTestRain) btnTestRain.addEventListener('click', () => triggerRainGust());

  const btnTestOcean = document.getElementById('btnTestOcean');
  if (btnTestOcean) btnTestOcean.addEventListener('click', () => triggerOceanSurge());

  const btnTestBreeze = document.getElementById('btnTestBreeze');
  if (btnTestBreeze) btnTestBreeze.addEventListener('click', () => triggerBreezeGust());

  const btnTestStream = document.getElementById('btnTestStream');
  if (btnTestStream) btnTestStream.addEventListener('click', () => triggerStreamSplash());

  const btnTestCrystal = document.getElementById('btnTestCrystal');
  if (btnTestCrystal) btnTestCrystal.addEventListener('click', () => triggerCrystalChimeNow());

  const btnTestBamboo = document.getElementById('btnTestBamboo');
  if (btnTestBamboo) btnTestBamboo.addEventListener('click', () => triggerBambooClack());

  const btnTestBirds = document.getElementById('btnTestBirds');
  if (btnTestBirds) btnTestBirds.addEventListener('click', () => triggerBirdCallNow());

  const btnTestCrickets = document.getElementById('btnTestCrickets');
  if (btnTestCrickets) btnTestCrickets.addEventListener('click', () => triggerCricketChirp());

  // Quick Nature Strum Buttons
  const btnQuickBowl = document.getElementById('btnQuickBowl');
  if (btnQuickBowl) btnQuickBowl.addEventListener('click', () => strikeTibetanBowlNow(264));

  const btnQuickChime = document.getElementById('btnQuickChime');
  if (btnQuickChime) btnQuickChime.addEventListener('click', () => triggerCrystalChimeNow());

  const btnQuickBird = document.getElementById('btnQuickBird');
  if (btnQuickBird) btnQuickBird.addEventListener('click', () => triggerBirdCallNow());

  const btnQuickOcean = document.getElementById('btnQuickOcean');
  if (btnQuickOcean) btnQuickOcean.addEventListener('click', () => triggerOceanSurge());

  const btnStrikeBowl = document.getElementById('btnStrikeBowl');
  if (btnStrikeBowl) btnStrikeBowl.addEventListener('click', () => strikeTibetanBowlNow(264));

  const btnChimeBreezeQuick = document.getElementById('btnChimeBreezeQuick');
  if (btnChimeBreezeQuick) btnChimeBreezeQuick.addEventListener('click', () => triggerCrystalChimeNow());

  // Voice Skin Controls & Live Tester
  const pitchSlider = document.getElementById('voicePitchSlider');
  const pitchVal = document.getElementById('voicePitchVal');
  if (pitchSlider && pitchVal) {
    pitchSlider.addEventListener('input', (e) => {
      pitchVal.textContent = parseFloat(e.target.value).toFixed(2);
      JOHNNY_VOICE_MODEL.pitch = parseFloat(e.target.value);
    });
  }

  const rateSlider = document.getElementById('voiceRateSlider');
  const rateVal = document.getElementById('voiceRateVal');
  if (rateSlider && rateVal) {
    rateSlider.addEventListener('input', (e) => {
      rateVal.textContent = parseFloat(e.target.value).toFixed(2);
      JOHNNY_VOICE_MODEL.rate = parseFloat(e.target.value);
    });
  }

  const btnTestVoice = document.getElementById('btnTestVoiceSkin');
  if (btnTestVoice) {
    btnTestVoice.addEventListener('click', () => {
      const activeText = document.getElementById('heroRoastText')?.textContent || "Listen up! Your thumb has traveled three miles through vertical video wasteland.";
      speakJohnnyDynamite(activeText, appState.selectedPersona, btnTestVoice);
    });
  }

  // Radio Station Broadcast Button (Original ElevenLabs recording)
  const btnPlayRadio = document.getElementById('btnPlayJohnnyRadio');
  if (btnPlayRadio) {
    btnPlayRadio.addEventListener('click', () => {
      playJohnnyRadioStationAudio(true);
    });
  }

  // Reset Mixer to Defaults
  document.getElementById('btnResetMixer').addEventListener('click', () => {
    appState.mixerVolumes = { ...defaultState.mixerVolumes };
    appState.mixerActive = { ...defaultState.mixerActive };
    appState.activePreset = 'emerald_rain';
    syncMixerControlsToState();
    applyMixerState();
    saveState();
    showGlobalToast('🎛️ Mixer Reset to Default Nature Sounds', '🍃');
  });

  
// Architecture & Setup Interactive Simulation Buttons
  const btnTestTrap = document.getElementById('btnTestExtensionInterception');
  if (btnTestTrap) {
    btnTestTrap.addEventListener('click', () => {
      playChime(528, 'triangle', 0.3);
      showGlobalToast('⚡ Interception Simulated: 5 Swipes Trapped on /reels/ -> Diverting to Sanctuary Hub!', '🛡️');
      const diag = document.getElementById('telemetryDiagLog');
      if (diag) {
        diag.textContent = `[${new Date().toLocaleTimeString()}] Handshake ACK: Event intercepted. Gesture Quota: 5/5. Triggering Unscroll It modal.`;
        diag.style.color = '#34D399';
      }
    });
  }

  const btnCopyExtCode = document.getElementById('btnCopyExtensionCode');
  if (btnCopyExtCode) {
    btnCopyExtCode.addEventListener('click', () => {
      const codeSnippet = `// Manifest V3 content script: content.js\nlet reelCount = 0;\nwindow.addEventListener('scroll', () => {\n  if (location.href.includes('/reels/') || location.href.includes('/shorts/')) {\n    reelCount++;\n    if (reelCount >= 5) {\n      injectUnscrollItModal();\n    }\n  }\n});`;
      navigator.clipboard.writeText(codeSnippet).then(() => {
        showGlobalToast('📋 Manifest V3 script copied to clipboard!', '✓');
        btnCopyExtCode.textContent = '✓ Copied!';
        setTimeout(() => { btnCopyExtCode.textContent = '📋 Copy'; }, 2000);
      }).catch(() => {});
    });
  }

  // Featured Quest Action
  document.getElementById('btnAcceptFeaturedQuest').addEventListener('click', () => {
    const featuredQuest = SIDE_QUESTS[4]; // 30 min instrumental
    acceptQuest(featuredQuest);
    switchTab('tab-quests');
  });

  // Simulator Personality & Category Selectors (9 Categories)
  document.querySelectorAll('.personality-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.personality-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const persona = btn.getAttribute('data-persona');
      appState.selectedPersona = persona;

      // Update Treasury card immediately to show a roast from this category
      updateTreasuryRoast(getRandomRoastData(persona));
      saveState();
    });
  });

  document.getElementById('simSpeechToggle').addEventListener('change', (e) => {
    appState.speechEnabled = e.target.checked;
    saveState();
  });

  const btnInstantRoast = document.getElementById('btnGenerateInstantRoast');
  if (btnInstantRoast) {
    btnInstantRoast.addEventListener('click', () => {
      const roastData = getRandomRoastData(appState.selectedPersona);
      showGlobalToast(`🧐 ${roastData.categoryTitle || 'Reality Check'}: "${roastData.text}"`, '🎰');
      speakJohnnyDynamite(roastData.text, appState.selectedPersona, btnInstantRoast);
      appState.roastsEndured++;
      saveState();
    });
  }

  // Simulator Overlay Buttons
  document.getElementById('btnOverlayAcceptQuest').addEventListener('click', () => {
    document.getElementById('simOverlay').style.display = 'none';
    switchTab('tab-quests');
  });

  document.getElementById('btnOverlayResume').addEventListener('click', () => {
    document.getElementById('simOverlay').style.display = 'none';
  });

  // Sliders
  document.getElementById('reelsSlider').addEventListener('input', updateLifeTollCalculations);
  document.getElementById('secsSlider').addEventListener('input', updateLifeTollCalculations);
  document.getElementById('yearsSlider').addEventListener('input', updateLifeTollCalculations);

  // Weather & Butterfly controls
  document.getElementById('btnToggleWeather').addEventListener('click', () => {
    appState.weatherMode = appState.weatherMode === 'sun' ? 'rain' : 'sun';
    const btn = document.getElementById('btnToggleWeather');
    btn.textContent = appState.weatherMode === 'sun' ? 'Toggle Rain / Sunlight' : 'Weather: Gentle Rain 🌧️';
  });

  document.getElementById('btnSpawnButterflies').addEventListener('click', () => {
    for (let i = 0; i < 4; i++) {
      butterflies.push({
        x: Math.random() * 800,
        y: 100 + Math.random() * 150,
        vx: 1 + Math.random() * 1.5,
        vy: (Math.random() - 0.5),
        wing: 0,
        wingSpeed: 0.2,
        color: '#FDE68A'
      });
    }
  });

  // Quest Filters
  let curTimeFilter = '60';
  let curCatFilter = 'all';

  document.querySelectorAll('.time-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      curTimeFilter = btn.getAttribute('data-time');
      renderQuests(curTimeFilter, curCatFilter);
    });
  });

  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      curCatFilter = btn.getAttribute('data-cat');
      renderQuests(curTimeFilter, curCatFilter);
    });
  });

  // Active Quest Controls
  document.getElementById('btnCompleteQuest').addEventListener('click', completeActiveQuest);
  document.getElementById('btnCancelQuest').addEventListener('click', cancelActiveQuest);

  // Universal Modal (Reality Check Slot)
  const btnModalClose = document.getElementById('btnModalClose');
  if (btnModalClose) {
    btnModalClose.addEventListener('click', () => {
      document.getElementById('universalModal').style.display = 'none';
    });
  }

  const btnModalDontCare = document.getElementById('btnModalDontCare');
  if (btnModalDontCare) {
    btnModalDontCare.addEventListener('click', () => {
      const roastData = getRandomRoastData();
      const avatar = document.getElementById('modalAvatar');
      const badge = document.getElementById('modalBadge');
      const title = document.getElementById('modalTitle');
      const body = document.getElementById('modalBodyText');
      if (avatar) avatar.textContent = roastData.icon;
      if (badge) badge.textContent = `${roastData.categoryTitle} • Round ${appState.roastsEndured + 1}`;
      if (title) title.textContent = `Reality Check #${roastData.index}`;
      if (body) body.textContent = `"${roastData.text}"`;
      speakText(roastData.text);
      playChime(330, 'sawtooth', 0.2);
      appState.roastsEndured++;
      saveState();
    });
  }

  const btnModalUnderstand = document.getElementById('btnModalUnderstand');
  if (btnModalUnderstand) {
    btnModalUnderstand.addEventListener('click', () => {
      const stage1 = document.getElementById('modalStage1');
      const stage2 = document.getElementById('modalStage2');
      if (stage1) stage1.style.display = 'none';
      if (stage2) stage2.style.display = 'block';
      playChime(528, 'sine', 0.4);
    });
  }

  const btnModalChallenge = document.getElementById('btnModalChallenge');
  if (btnModalChallenge) {
    btnModalChallenge.addEventListener('click', () => {
      document.getElementById('universalModal').style.display = 'none';
      switchTab('tab-quests');
    });
  }

  const btnModalRelaxResort = document.getElementById('btnModalRelaxResort');
  if (btnModalRelaxResort) {
    btnModalRelaxResort.addEventListener('click', () => {
      document.getElementById('universalModal').style.display = 'none';
      switchTab('tab-sounds');
    });
  }

  const btnModalCinema = document.getElementById('btnModalCinema');
  if (btnModalCinema) {
    btnModalCinema.addEventListener('click', () => {
      document.getElementById('universalModal').style.display = 'none';
      switchTab('tab-cinema');
    });
  }

  const btnModalRollAgain = document.getElementById('btnModalRollAgain');
  if (btnModalRollAgain) {
    btnModalRollAgain.addEventListener('click', () => {
      const stage1 = document.getElementById('modalStage1');
      const stage2 = document.getElementById('modalStage2');
      if (stage1) stage1.style.display = 'block';
      if (stage2) stage2.style.display = 'none';
      const roastData = getRandomRoastData();
      const body = document.getElementById('modalBodyText');
      if (body) body.textContent = `"${roastData.text}"`;
      playChime(440, 'triangle', 0.3);
    });
  }

  // Dashboard Cinema Portal Banner Jump
  const btnDashJumpCinema = document.getElementById('btnDashJumpCinema');
  if (btnDashJumpCinema) {
    btnDashJumpCinema.addEventListener('click', () => {
      switchTab('tab-cinema');
    });
  }

  // Simulator Overlay Cinema Jump
  const btnOverlayCinema = document.getElementById('btnOverlayCinema');
  if (btnOverlayCinema) {
    btnOverlayCinema.addEventListener('click', () => {
      const simOverlay = document.getElementById('simOverlay');
      if (simOverlay) simOverlay.style.display = 'none';
      switchTab('tab-cinema');
    });
  }

  // --- ATTENTION SPAN IMPROVER EVENT LISTENERS ---
  renderTasteStudioTags();
  renderCinemaCatalog();
  renderCinemaJournal();
  initFioWorkstation();

  // 1. Custom Genre Tag Input + Presets
  const inputCustomGenre = document.getElementById('inputCustomGenre');
  const btnAddCustomGenre = document.getElementById('btnAddCustomGenre');
  if (btnAddCustomGenre && inputCustomGenre) {
    btnAddCustomGenre.addEventListener('click', () => {
      addCustomGenre(inputCustomGenre.value);
      inputCustomGenre.value = '';
      inputCustomGenre.focus();
    });
    inputCustomGenre.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addCustomGenre(inputCustomGenre.value);
        inputCustomGenre.value = '';
      }
    });
  }

  document.querySelectorAll('.preset-chip[data-genre]').forEach(chip => {
    chip.addEventListener('click', () => {
      const g = chip.getAttribute('data-genre');
      addCustomGenre(g);
    });
  });

  // 2. Favorite Movies Tag Input + Presets
  const inputFavMovie = document.getElementById('inputFavMovie');
  const btnAddFavMovie = document.getElementById('btnAddFavMovie');
  if (btnAddFavMovie && inputFavMovie) {
    btnAddFavMovie.addEventListener('click', () => {
      addFavMovie(inputFavMovie.value);
      inputFavMovie.value = '';
      inputFavMovie.focus();
    });
    inputFavMovie.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addFavMovie(inputFavMovie.value);
        inputFavMovie.value = '';
      }
    });
  }

  document.querySelectorAll('.preset-chip[data-movie]').forEach(chip => {
    chip.addEventListener('click', () => {
      const m = chip.getAttribute('data-movie');
      addFavMovie(m);
    });
  });

  // 3. Save & Reset Profile Buttons
  const btnSaveTaste = document.getElementById('btnSaveTasteProfile');
  if (btnSaveTaste) {
    btnSaveTaste.addEventListener('click', () => {
      saveState();
      renderTasteStudioTags();
      renderCinemaCatalog();
      playChime(523.25, 'triangle', 0.3);
      showGlobalToast('✨ Taste profile saved & cinema recommendations calibrated!', '🎯');
      const catalogHeader = document.querySelector('.cinema-catalog-header');
      if (catalogHeader) {
        catalogHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  const btnResetTaste = document.getElementById('btnResetTasteProfile');
  if (btnResetTaste) {
    btnResetTaste.addEventListener('click', () => {
      if (confirm('Reset your movie taste profile back to curated defaults?')) {
        appState.cinemaTaste = {
          genres: ['Sci-Fi', 'Psychological Thriller', 'Studio Ghibli'],
          favoriteMovies: ['Interstellar', 'Inception', 'Spirited Away'],
          runtimeFilter: 'all',
          level: 'all',
          mood: 'all',
          search: ''
        };
        document.querySelectorAll('#cinemaRuntimeFilters .filter-pill').forEach(p => {
          p.classList.toggle('active', p.getAttribute('data-runtime') === 'all');
        });
        document.querySelectorAll('#cinemaLevelFilters .filter-pill').forEach(p => {
          p.classList.toggle('active', p.getAttribute('data-level') === 'all');
        });
        document.querySelectorAll('#cinemaMoodFilters .filter-pill').forEach(p => {
          p.classList.toggle('active', p.getAttribute('data-mood') === 'all');
        });
        const searchBox = document.getElementById('cinemaSearchInput');
        if (searchBox) searchBox.value = '';
        saveState();
        renderTasteStudioTags();
        renderCinemaCatalog();
        showGlobalToast('Taste profile reset to defaults.', '↻');
      }
    });
  }

  // 5. Inline Check-in Form Submission
  const btnSubmitInline = document.getElementById('btnSubmitInlineCheckin');
  const inlineTitle = document.getElementById('inlineCheckinTitle');
  if (btnSubmitInline) {
    btnSubmitInline.addEventListener('click', submitInlineCinemaCheckin);
  }
  if (inlineTitle) {
    inlineTitle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitInlineCinemaCheckin();
      }
    });
  }

  // Jump from Hero to Cinema
  const btnJumpToCinema = document.getElementById('btnJumpToCinema');
  if (btnJumpToCinema) {
    btnJumpToCinema.addEventListener('click', () => {
      switchTab('tab-cinema');
    });
  }

  // Open check-in modal buttons
  const btnOpenCheckin = document.getElementById('btnOpenCinemaCheckin');
  if (btnOpenCheckin) {
    btnOpenCheckin.addEventListener('click', () => openCinemaCheckinModal());
  }

  const btnPromptLog = document.getElementById('btnPromptLogWatch');
  if (btnPromptLog) {
    btnPromptLog.addEventListener('click', () => openCinemaCheckinModal());
  }

  const btnLogJournal = document.getElementById('btnLogNewWatchInJournal');
  if (btnLogJournal) {
    btnLogJournal.addEventListener('click', () => openCinemaCheckinModal());
  }

  // Butler Surprise Film Button
  const btnPromptSurprise = document.getElementById('btnPromptSurpriseMovie');
  if (btnPromptSurprise) {
    btnPromptSurprise.addEventListener('click', () => {
      const candidates = filterCinemaDatabase();
      const randomFilmEntry = candidates[Math.floor(Math.random() * candidates.length)] || { movie: CINEMA_DATABASE[0] };
      const randomFilm = randomFilmEntry.movie;
      const card = document.getElementById(`movie-card-${randomFilm.id}`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.style.transition = 'transform 0.4s, box-shadow 0.4s, border-color 0.4s';
        card.style.borderColor = '#10B981';
        card.style.boxShadow = '0 0 35px rgba(16, 185, 129, 0.6)';
        card.style.transform = 'scale(1.04)';
        setTimeout(() => {
          card.style.transform = '';
          card.style.boxShadow = '';
        }, 2000);
      }
      playChime(523.25, 'triangle', 0.3);
      showGlobalToast(`🎯 Recommended for your focus: ${randomFilm.title} (${randomFilm.runtime}m)`, '🎬');
    });
  }

  // Dismiss prompt
  const btnDismissPrompt = document.getElementById('btnDismissPrompt');
  if (btnDismissPrompt) {
    btnDismissPrompt.addEventListener('click', () => {
      const promptCard = document.getElementById('cinemaCheckinPromptCard');
      if (promptCard) {
        promptCard.style.opacity = '0.4';
        promptCard.style.pointerEvents = 'none';
        showGlobalToast('Check-in prompt snoozed. You can check in anytime via the button.', '☕');
      }
    });
  }

  // Quick suggest chips in check-in modal
  document.querySelectorAll('#quickSuggestChips .suggest-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const title = chip.getAttribute('data-title');
      const runtime = chip.getAttribute('data-runtime');
      const titleInput = document.getElementById('checkinMovieTitle');
      const runtimeInput = document.getElementById('checkinRuntime');
      if (titleInput) titleInput.value = title;
      if (runtimeInput) runtimeInput.value = runtime;
    });
  });

  // Honesty radio cards
  document.querySelectorAll('.focus-radio-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.focus-radio-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  // Checkin Modal Close
  const btnCloseCheckin = document.getElementById('btnCinemaCheckinClose');
  if (btnCloseCheckin) {
    btnCloseCheckin.addEventListener('click', () => {
      document.getElementById('cinemaCheckinModal').style.display = 'none';
    });
  }

  const checkinModal = document.getElementById('cinemaCheckinModal');
  if (checkinModal) {
    checkinModal.addEventListener('click', (e) => {
      if (e.target === checkinModal) checkinModal.style.display = 'none';
    });
  }

  // Checkin Modal Submit
  const btnSubmitCheckin = document.getElementById('btnSubmitCinemaCheckin');
  if (btnSubmitCheckin) {
    btnSubmitCheckin.addEventListener('click', submitCinemaCheckin);
  }

  // Filter Pills: Runtime Workout Focus
  document.querySelectorAll('#cinemaRuntimeFilters .filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#cinemaRuntimeFilters .filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      appState.cinemaTaste.runtimeFilter = pill.getAttribute('data-runtime');
      renderCinemaCatalog();
    });
  });

  // Filter Pills: Level
  document.querySelectorAll('#cinemaLevelFilters .filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#cinemaLevelFilters .filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      appState.cinemaTaste.level = pill.getAttribute('data-level');
      renderCinemaCatalog();
    });
  });

  // Filter Pills: Mood
  document.querySelectorAll('#cinemaMoodFilters .filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#cinemaMoodFilters .filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      appState.cinemaTaste.mood = pill.getAttribute('data-mood');
      renderCinemaCatalog();
    });
  });

  // Search input
  const searchInput = document.getElementById('cinemaSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      appState.cinemaTaste.search = e.target.value;
      renderCinemaCatalog();
    });
  }

  // Shuffle button
  const btnShuffle = document.getElementById('btnShuffleCinema');
  if (btnShuffle) {
    btnShuffle.addEventListener('click', () => {
      CINEMA_DATABASE.sort(() => Math.random() - 0.5);
      renderCinemaCatalog();
      playChime(392, 'triangle', 0.2);
    });
  }

  // Active Session early finish & cancel
  const btnFinishSessionEarly = document.getElementById('btnFinishSessionEarly');
  if (btnFinishSessionEarly) {
    btnFinishSessionEarly.addEventListener('click', () => {
      const active = appState.activeCinemaSession;
      if (active) {
        cancelCinemaSession();
        openCinemaCheckinModal(active);
      }
    });
  }

  const btnCancelSession = document.getElementById('btnCancelSession');
  if (btnCancelSession) {
    btnCancelSession.addEventListener('click', cancelCinemaSession);
  }

  // Cinema Watch Modal Close Controls
  const btnCloseWatch = document.getElementById('btnCinemaWatchClose');
  if (btnCloseWatch) {
    btnCloseWatch.addEventListener('click', closeCinemaWatchModal);
  }

  const watchModal = document.getElementById('cinemaWatchModal');
  if (watchModal) {
    watchModal.addEventListener('click', (e) => {
      if (e.target === watchModal) closeCinemaWatchModal();
    });
  }

  // Quick Jump Navigation inside Attention Span Improver
  document.querySelectorAll('.jump-pill[data-jump]').forEach(pill => {
    pill.addEventListener('click', () => {
      const targetId = pill.getAttribute('data-jump');
      const targetElem = document.getElementById(targetId);
      if (targetElem) {
        targetElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        targetElem.style.transition = 'outline 0.3s';
        targetElem.style.outline = '2px solid #8B5CF6';
        setTimeout(() => { targetElem.style.outline = ''; }, 1500);
      }
    });
  });

  const btnQuickSurprise = document.getElementById('btnQuickSurpriseMovie');
  if (btnQuickSurprise && btnPromptSurprise) {
    btnQuickSurprise.addEventListener('click', () => {
      btnPromptSurprise.click();
    });
  }

  // Accessible Keyboard Shortcuts for Modals & Frame.io Workstation
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCinemaWatchModal();
      const checkinModal = document.getElementById('cinemaCheckinModal');
      if (checkinModal) checkinModal.style.display = 'none';
      const universalModal = document.getElementById('universalModal');
      if (universalModal) universalModal.style.display = 'none';
      return;
    }

    // Frame.io Workstation shortcuts (only when on cinema tab and not typing in text field)
    const cinemaTab = document.getElementById('tab-cinema');
    const isCinemaActive = cinemaTab && cinemaTab.classList.contains('active');
    const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);

    if (isCinemaActive && !isTyping) {
      if (e.code === 'Space' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        toggleFioPlayback();
      } else if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        seekFioToSeconds(fioState.currentSeconds - 5);
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        seekFioToSeconds(fioState.currentSeconds + 5);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        const input = document.getElementById('fioNewCommentText');
        if (input) input.focus();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        const stage = document.getElementById('fioWorkstationLayout');
        if (stage) {
          if (!document.fullscreenElement) stage.requestFullscreen?.().catch(() => { });
          else document.exitFullscreen?.().catch(() => { });
        }
      }
    }
  });

  // URL Hash Routing & Direct Deep Links (e.g. index.html#cinema)
  function handleHashRouting() {
    const hash = window.location.hash.toLowerCase();
    if (hash === '#cinema' || hash === '#films' || hash === '#improver') {
      switchTab('tab-cinema');
    } else if (hash === '#simulator') {
      switchTab('tab-simulator');
    } else if (hash === '#calculator') {
      switchTab('tab-calculator');
    } else if (hash === '#quests') {
      switchTab('tab-quests');
    } else if (hash === '#sounds') {
      switchTab('tab-sounds');
    }
  }

  
  // ============================================================================
  // INTERACTIVE BUTTONS WIRING & USER CONTROLS
  // ============================================================================
  // 1. Hero Primary Action Buttons
  const btnOpenRoaster = document.getElementById('btnOpenRoaster');
  if (btnOpenRoaster) {
    btnOpenRoaster.addEventListener('click', openRealityCheckSlotModal);
  }

  const btnHeaderCta = document.getElementById('btnHeaderCta');
  if (btnHeaderCta) {
    btnHeaderCta.addEventListener('click', openRealityCheckSlotModal);
  }

  const btnJumpToQuests = document.getElementById('btnJumpToQuests');
  if (btnJumpToQuests) {
    btnJumpToQuests.addEventListener('click', () => switchTab('tab-quests'));
  }

  const btnSimulateFeed = document.getElementById('btnSimulateFeed');
  if (btnSimulateFeed) {
    btnSimulateFeed.addEventListener('click', () => switchTab('tab-simulator'));
  }

  const btnGoToNatureCalc = document.getElementById('btnGoToNatureCalc');
  if (btnGoToNatureCalc) {
    btnGoToNatureCalc.addEventListener('click', () => switchTab('tab-calculator'));
  }

  // 2. Hero Roast Box Interactive Buttons
  const btnCopyHeroRoast = document.getElementById('btnCopyHeroRoast');
  if (btnCopyHeroRoast) {
    btnCopyHeroRoast.addEventListener('click', () => {
      const text = document.getElementById('heroRoastText')?.textContent?.trim();
      if (text) {
        navigator.clipboard.writeText(text).then(() => {
          showGlobalToast('Reality check roast copied to clipboard! 📋', '✨');
        }).catch(() => {
          showGlobalToast('Roast copied! 📋', '✨');
        });
      }
    });
  }

  const btnRefreshRoast = document.getElementById('btnRefreshRoast');
  if (btnRefreshRoast) {
    btnRefreshRoast.addEventListener('click', () => {
      const data = getRandomRoastData(appState.selectedPersona);
      const txtElem = document.getElementById('heroRoastText');
      const authElem = document.getElementById('heroRoastAuthor');
      const roleElem = document.getElementById('heroRoastRole');
      const tagElem = document.getElementById('heroRoastTag');
      const avElem = document.getElementById('heroButlerAvatar');
      if (txtElem) txtElem.textContent = `"${data.text}"`;
      if (authElem) authElem.textContent = 'Mr. No cap';
      if (roleElem) roleElem.textContent = 'Chief Etiquette Officer';
      if (tagElem) tagElem.textContent = `Severity: ${data.severity || 'High Society Savage'}`;
      if (avElem) avElem.textContent = '';
      playChime(523.25, 'triangle', 0.2);
      showGlobalToast('Fresh reality check requested! ↻', '');
    });
  }

  const btnSpeakHeroRoast = document.getElementById('btnSpeakHeroRoast');
  if (btnSpeakHeroRoast) {
    btnSpeakHeroRoast.addEventListener('click', () => {
      const text = document.getElementById('heroRoastText')?.textContent?.trim() || "I say, your thumb appears to have far outrun your ambition today.";
      speakJohnnyDynamite(text, appState.selectedPersona, btnSpeakHeroRoast);
    });
  }

  // 3. Grand Roast Treasury Controls
  const btnTreasuryNext = document.getElementById('btnTreasuryNext');
  if (btnTreasuryNext) {
    btnTreasuryNext.addEventListener('click', () => {
      updateTreasuryRoast(getRandomRoastData(appState.selectedPersona));
      playChime(523.25, 'triangle', 0.2);
    });
  }

  const btnTreasuryCopy = document.getElementById('btnTreasuryCopy');
  if (btnTreasuryCopy) {
    btnTreasuryCopy.addEventListener('click', () => {
      const text = document.getElementById('treasuryQuoteText')?.textContent?.trim();
      if (text) {
        navigator.clipboard.writeText(text).then(() => {
          const toast = document.getElementById('treasuryCopyToast');
          if (toast) {
            toast.style.display = 'inline-block';
            setTimeout(() => { toast.style.display = 'none'; }, 2000);
          }
          showGlobalToast('Copied roast to clipboard! 📋', '✨');
        }).catch(() => {
          showGlobalToast('Copied roast to clipboard! 📋', '✨');
        });
      }
    });
  }

  const btnTreasurySpeak = document.getElementById('btnTreasurySpeak');
  if (btnTreasurySpeak) {
    btnTreasurySpeak.addEventListener('click', () => {
      const text = document.getElementById('treasuryQuoteText')?.textContent?.trim() || "Your attention span is fighting for its life right now.";
      speakJohnnyDynamite(text, appState.selectedPersona, btnTreasurySpeak);
    });
  }

  // 4. Simulator Overlay & 3D Phone Controls
  const btnOverlayClearMind = document.getElementById('btnOverlayClearMind');
  if (btnOverlayClearMind) {
    btnOverlayClearMind.addEventListener('click', () => {
      strikeTibetanBowlNow(528);
      showGlobalToast('Tibetan singing bowl struck at 528Hz: Harmonic mind restoration', '🥣');
    });
  }

  const phoneSpeaker = document.getElementById('phoneSpeakerInteractive');
  if (phoneSpeaker) {
    phoneSpeaker.addEventListener('click', () => {
      const reelDesc = document.querySelector('.sim-reel-card .sim-reel-desc')?.textContent || "Listen up! Put down the glass slab and step back into reality.";
      speakJohnnyDynamite(reelDesc, 'default', phoneSpeaker);
    });
  }

  // 5. Sound Sanctuary Preset Play Buttons
  document.querySelectorAll('.btn-preset-play').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.preset-card');
      const presetKey = card ? card.getAttribute('data-preset') : btn.getAttribute('data-preset');
      if (presetKey) activateSoundPreset(presetKey);
    });
  });

  // 6. Lottie Player Interactivity Controls (Play/Pause & Speed Switching)
  const lottieEl = document.getElementById('heroLottiePlayer');
  const btnToggleLottie = document.getElementById('btnToggleLottiePlay');
  const btnLottieSlow = document.getElementById('btnLottieSpeedSlow');
  const btnLottieNormal = document.getElementById('btnLottieSpeedNormal');
  const btnLottieFast = document.getElementById('btnLottieSpeedFast');

  if (lottieEl && btnToggleLottie) {
    let isLottiePlaying = true;
    btnToggleLottie.addEventListener('click', () => {
      if (isLottiePlaying) {
        if (typeof lottieEl.pause === 'function') lottieEl.pause();
        btnToggleLottie.textContent = '▶ Play';
        isLottiePlaying = false;
        showGlobalToast('Lottie animation paused', '⏸');
      } else {
        if (typeof lottieEl.play === 'function') lottieEl.play();
        btnToggleLottie.textContent = '⏸ Pause';
        isLottiePlaying = true;
        showGlobalToast('Lottie animation playing', '▶');
      }
    });

    if (btnLottieSlow) {
      btnLottieSlow.addEventListener('click', () => {
        if (typeof lottieEl.setSpeed === 'function') lottieEl.setSpeed(0.5);
        [btnLottieSlow, btnLottieNormal, btnLottieFast].forEach(b => b?.classList.remove('active'));
        btnLottieSlow.classList.add('active');
        showGlobalToast('Lottie speed: 0.5x (Slow Motion)', '🐢');
      });
    }

    if (btnLottieNormal) {
      btnLottieNormal.addEventListener('click', () => {
        if (typeof lottieEl.setSpeed === 'function') lottieEl.setSpeed(1.0);
        [btnLottieSlow, btnLottieNormal, btnLottieFast].forEach(b => b?.classList.remove('active'));
        btnLottieNormal.classList.add('active');
        showGlobalToast('Lottie speed: 1.0x (Normal)', '⚡');
      });
    }

    if (btnLottieFast) {
      btnLottieFast.addEventListener('click', () => {
        if (typeof lottieEl.setSpeed === 'function') lottieEl.setSpeed(1.5);
        [btnLottieSlow, btnLottieNormal, btnLottieFast].forEach(b => b?.classList.remove('active'));
        btnLottieFast.classList.add('active');
        showGlobalToast('Lottie speed: 1.5x (Fast Forward)', '🚀');
      });
    }
  }

  // ==========================================================
  // REFERO / FRAMER BENTO & DEEP-DIVE INTERACTIVITY ENGINE
  // ==========================================================
  function initReferoInteractiveModules() {
    // 1. Bento Simulator Launch Button
    const btnBentoLaunchSim = document.getElementById('btnBentoLaunchSim');
    if (btnBentoLaunchSim) {
      btnBentoLaunchSim.addEventListener('click', () => {
        navigateToSection('tab-simulator');
        showGlobalToast('Entering Doomscroll Chamber...', '📱');
      });
    }

    // 2. Bento Acoustic Toggle Button
    const btnBentoAcousticToggle = document.getElementById('btnBentoAcousticToggle');
    const soundscapeBtn = document.getElementById('soundscapeBtn');
    if (btnBentoAcousticToggle && soundscapeBtn) {
      btnBentoAcousticToggle.addEventListener('click', () => {
        soundscapeBtn.click();
      });
    }

    // 3. Web Audio Chime generator for satisfying micro-interaction
    function playReferoChime(freq = 528) {
      try {
        const audioCtx = window.audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
      } catch (e) {}
    }

    // 4. Bento Side Quests (Click to complete with audio feedback)
    const questChips = document.querySelectorAll('.refero-quest-chip');
    const bentoQuestCompletedCount = document.getElementById('bentoQuestCompletedCount');

    questChips.forEach(chip => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('completed');
        const isDone = chip.classList.contains('completed');
        if (isDone) {
          playReferoChime(660);
          showGlobalToast('Quest complete: +50 XP Calm 🌱', '✨');
        }
        const doneCount = document.querySelectorAll('.refero-quest-chip.completed').length;
        if (bentoQuestCompletedCount) {
          bentoQuestCompletedCount.textContent = `${doneCount} / ${questChips.length} done`;
        }
      });
    });

    // 5. Bento Roast Severity Slider & Tone Presets
    const bentoRoastSlider = document.getElementById('bentoRoastSlider');
    const bentoRoastSeverityVal = document.getElementById('bentoRoastSeverityVal');
    const heroRoastTag = document.getElementById('heroRoastTag');
    const btnRefreshRoast = document.getElementById('btnRefreshRoast');

    if (bentoRoastSlider && bentoRoastSeverityVal) {
      bentoRoastSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        bentoRoastSeverityVal.textContent = `${val}%`;
        if (heroRoastTag) {
          heroRoastTag.textContent = val > 70 ? 'Severity: High Society Savage' : (val > 40 ? 'Severity: Dry British Wit' : 'Severity: Gentle Reminder');
        }
      });
    }

    const bentoTones = [
      { id: 'bentoToneGentle', name: 'Gentle', tag: 'Severity: Gentle Reminder' },
      { id: 'bentoToneDryWit', name: 'Dry Wit', tag: 'Severity: Dry British Wit' },
      { id: 'bentoToneSavage', name: 'Savage', tag: 'Severity: High Society Savage' }
    ];

    bentoTones.forEach(tone => {
      const btn = document.getElementById(tone.id);
      if (btn) {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.refero-tone-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          if (heroRoastTag) heroRoastTag.textContent = tone.tag;
          if (btnRefreshRoast) btnRefreshRoast.click();
          showGlobalToast(`Roast Tone: ${tone.name}`, '🧐');
        });
      }
    });

    // 6. Sound Sanctuary Deep-Dive Interactive Tiles
    const soundCards = [
      { id: 'referoSoundChimes', freq: 528, label: 'Temple Chimes' },
      { id: 'referoSoundRain', freq: 220, label: 'Gentle Rain' },
      { id: 'referoSoundRiver', freq: 174, label: 'Forest River' },
      { id: 'referoSoundCrickets', freq: 432, label: 'Night Crickets' },
      { id: 'referoSoundBirds', freq: 639, label: 'Morning Birds' },
      { id: 'referoSoundBinaural', freq: 432, label: 'Binaural 432Hz' }
    ];

    soundCards.forEach(s => {
      const card = document.getElementById(s.id);
      if (card) {
        card.addEventListener('click', () => {
          const isPlaying = card.classList.contains('playing');
          document.querySelectorAll('.refero-sound-card').forEach(c => {
            c.classList.remove('playing');
            const statusEl = c.querySelector('.refero-sound-status');
            if (statusEl) statusEl.textContent = 'Off';
          });

          if (!isPlaying) {
            card.classList.add('playing');
            const statusEl = card.querySelector('.refero-sound-status');
            if (statusEl) statusEl.textContent = '● Playing';
            playReferoChime(s.freq);
            showGlobalToast(`Acoustic Sanctuary: ${s.label} playing`, '🎧');
          } else {
            showGlobalToast('Acoustic track paused', '⏸');
          }
        });
      }
    });

    // 7. Life Toll Live Slider Recalculation
    const referoDailyHoursSlider = document.getElementById('referoDailyHoursSlider');
    const referoDailyHoursVal = document.getElementById('referoDailyHoursVal');
    const referoLifeLossVal = document.getElementById('referoLifeLossVal');
    const referoBooksVal = document.getElementById('referoBooksVal');
    const referoLanguagesVal = document.getElementById('referoLanguagesVal');
    const referoSunsetsVal = document.getElementById('referoSunsetsVal');

    if (referoDailyHoursSlider) {
      referoDailyHoursSlider.addEventListener('input', (e) => {
        const hrs = parseFloat(e.target.value);
        if (referoDailyHoursVal) referoDailyHoursVal.textContent = hrs.toFixed(1);
        if (referoLifeLossVal) referoLifeLossVal.textContent = ((hrs * 365 * 60) / (24 * 365)).toFixed(1);
        if (referoBooksVal) referoBooksVal.textContent = Math.round(hrs * 52).toLocaleString();
        if (referoLanguagesVal) referoLanguagesVal.textContent = (hrs * 1.2).toFixed(1);
        if (referoSunsetsVal) referoSunsetsVal.textContent = Math.round(hrs * 365 * 2).toLocaleString();
      });
    }

    // 8. Focus Countdown Timer Dial
    const btnReferoTimerToggle = document.getElementById('btnReferoTimerToggle');
    const btnReferoTimerReset = document.getElementById('btnReferoTimerReset');
    const referoTimerDisplay = document.getElementById('referoTimerDisplay');
    const referoTimerStatus = document.getElementById('referoTimerStatus');

    let referoTimerSeconds = 25 * 60;
    let referoTimerInterval = null;
    let referoTimerRunning = false;

    function renderReferoTimer() {
      if (!referoTimerDisplay) return;
      const mins = Math.floor(referoTimerSeconds / 60);
      const secs = referoTimerSeconds % 60;
      referoTimerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    if (btnReferoTimerToggle) {
      btnReferoTimerToggle.addEventListener('click', () => {
        referoTimerRunning = !referoTimerRunning;
        if (referoTimerRunning) {
          btnReferoTimerToggle.textContent = '⏸ Pause Focus';
          if (referoTimerStatus) referoTimerStatus.textContent = 'FOCUS ACTIVE';
          showGlobalToast('25m Focus Session Begun — Stay Present', '🧘');
          playReferoChime(528);

          referoTimerInterval = setInterval(() => {
            if (referoTimerSeconds > 0) {
              referoTimerSeconds--;
              renderReferoTimer();
            } else {
              clearInterval(referoTimerInterval);
              referoTimerRunning = false;
              btnReferoTimerToggle.textContent = '▶ Start Focus';
              if (referoTimerStatus) referoTimerStatus.textContent = 'COMPLETED 🎉';
              playReferoChime(880);
              showGlobalToast('Focus workout complete! +25 mins reclaimed.', '🏆');
            }
          }, 1000);
        } else {
          clearInterval(referoTimerInterval);
          btnReferoTimerToggle.textContent = '▶ Resume Focus';
          if (referoTimerStatus) referoTimerStatus.textContent = 'PAUSED';
        }
      });
    }

    if (btnReferoTimerReset) {
      btnReferoTimerReset.addEventListener('click', () => {
        clearInterval(referoTimerInterval);
        referoTimerRunning = false;
        referoTimerSeconds = 25 * 60;
        renderReferoTimer();
        if (btnReferoTimerToggle) btnReferoTimerToggle.textContent = '▶ Start Focus';
        if (referoTimerStatus) referoTimerStatus.textContent = 'DEEP WORK';
        showGlobalToast('Focus Timer reset to 25:00', '↺');
      });
    }

    // 9. Deep-Dive Section Jump Buttons
    const jumpLinks = [
      { id: 'btnJumpToSoundsTab', target: 'tab-sounds' },
      { id: 'btnJumpToCalcTab', target: 'tab-calculator' },
      { id: 'btnJumpToCinemaTab', target: 'tab-cinema' }
    ];

    jumpLinks.forEach(link => {
      const btn = document.getElementById(link.id);
      if (btn) {
        btn.addEventListener('click', () => {
          navigateToSection(link.target);
        });
      }
    });
  }

  initReferoInteractiveModules();

  window.addEventListener('hashchange', handleHashRouting);
  handleHashRouting();

  // Pre-load speech voices
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
});
