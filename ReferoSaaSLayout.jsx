import React, { useState } from 'react';

/**
 * ReferoSaaSLayout.jsx
 * Production-ready React component replicating the exact UI layout, styling,
 * and design system from the Refero / Framer landing page reference.
 * 
 * Features:
 * - Floating glass pill navigation bar with active states & hover lifts
 * - Pure dark canvas (#030305) with radiant violet/purple ambient glow
 * - Exact typography scale and letter-spacing matching Refero
 * - High-contrast solid white primary CTA buttons with hover bloom
 * - Signature "Dead simple. Surprisingly powerful." Bento Grid
 * - Alternating deep-dive feature modules (Collections, CMS, Matrix, Quests, Gym)
 */

export default function ReferoSaaSLayout() {
  const [activeTab, setActiveTab] = useState('Sanctuary');
  const [roastSeverity, setRoastSeverity] = useState(75);
  const [activeSound, setActiveSound] = useState('Temple Chimes');
  const [audioPlaying, setAudioPlaying] = useState(false);

  const navItems = [
    'Sanctuary',
    'Doomscroll Simulator',
    'Life Toll Matrix',
    'Side Quests',
    'Sound Sanctuary',
    'Attention Span Improver'
  ];

  return (
    <div className="min-h-screen bg-[#030305] text-[#F1F5F9] font-sans antialiased selection:bg-violet-600 selection:text-white relative overflow-x-hidden">
      
      {/* 1. ATMOSPHERIC AMBIENT GLOWS (Matching Refero Screenshot) */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed top-0 right-0 -z-10 w-[900px] h-[750px] opacity-75 blur-[140px] transform translate-x-1/4 -translate-y-1/4"
        style={{
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.45) 0%, rgba(99, 102, 241, 0.22) 40%, rgba(6, 182, 212, 0.08) 65%, transparent 75%)'
        }}
      />
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed bottom-1/3 left-0 -z-10 w-[700px] h-[600px] opacity-40 blur-[130px] transform -translate-x-1/3"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, rgba(59, 130, 246, 0.15) 50%, transparent 70%)'
        }}
      />

      {/* Subtle Grid Mesh */}
      <div 
        aria-hidden="true"
        className="fixed inset-0 -z-20 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* 2. TOP FLOATING PILL NAVBAR */}
      <header className="sticky top-4 z-50 max-w-6xl mx-auto px-4 w-full">
        <div className="backdrop-blur-2xl bg-[#090a12]/80 border border-white/[0.08] rounded-full px-4 py-2.5 flex items-center justify-between shadow-[0_12px_40px_-10px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_16px_rgba(124,58,237,0.5)] border border-white/20">
              ⚡
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white tracking-tight leading-tight">
                Unscroll<span className="text-violet-400">.</span>It
              </span>
              <span className="text-[9px] font-semibold tracking-wider uppercase text-neutral-400">
                Focus OS
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-black/40 p-1 rounded-full border border-white/[0.04]">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveTab(item)}
                className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                  activeTab === item
                    ? 'bg-white/10 text-white shadow-sm border border-white/10'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Actions & High-Contrast Primary CTA */}
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setAudioPlaying(!audioPlaying)}
              className="text-xs font-medium px-3 py-1.5 rounded-full border border-white/10 text-neutral-300 hover:text-white hover:bg-white/5 transition flex items-center gap-1.5"
            >
              <span>{audioPlaying ? '🔊' : '🎧'}</span>
              <span className="hidden sm:inline">{audioPlaying ? 'Sound: On' : 'Sound: Off'}</span>
            </button>
            <button className="bg-white text-black font-semibold text-xs sm:text-sm px-4 sm:px-5 py-1.5 sm:py-2 rounded-full hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:shadow-[0_0_30px_rgba(255,255,255,0.45)] active:scale-95 flex items-center gap-1.5">
              <span>Reclaim Focus</span>
              <span className="text-black/60 font-mono">→</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION (Exact Refero Framing) */}
      <section className="relative pt-20 pb-24 px-4 max-w-6xl mx-auto text-center">
        
        {/* Eyebrow Tag Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-[0.2em] uppercase text-violet-400 bg-violet-500/10 border border-violet-500/25 mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(139,92,246,0.15)]">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>
          POLITE REALITY CHECKS FOR THE ALGORITHMIC SOUL
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[1.04] max-w-4xl mx-auto">
          Content creation <br />
          <span className="text-white">you’ll enjoy.</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-xl text-neutral-400 max-w-2xl mx-auto mt-6 leading-relaxed font-normal">
          A minimalist cognitive sanctuary that breaks algorithmic dopamine loops, quantifies your finite life toll, and restores deep creative stillness.
        </p>

        {/* Hero Action Buttons */}
        <div className="mt-8 flex justify-center items-center gap-3">
          <button className="bg-white text-black font-semibold text-sm sm:text-base px-8 py-3.5 rounded-full hover:bg-neutral-100 transition-all duration-200 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 flex items-center gap-2">
            <span>Start Reality Check</span>
            <span className="text-black/60 font-mono text-lg">→</span>
          </button>
          <button className="bg-white/5 hover:bg-white/10 text-white font-medium text-sm sm:text-base px-7 py-3.5 rounded-full border border-white/15 transition-all">
            <span>Explore Sanctuary</span>
          </button>
        </div>

        {/* 4. HERO APP WINDOW MOCKUP (The Sleek Framer CMS Style Container) */}
        <div className="mt-16 rounded-2xl border border-white/10 bg-[#0a0b12]/90 backdrop-blur-xl shadow-[0_30px_90px_rgba(0,0,0,0.9),0_0_60px_rgba(124,58,237,0.15)] overflow-hidden text-left">
          
          {/* Mac Traffic Light Header Bar */}
          <div className="px-4 py-3 border-b border-white/[0.08] bg-[#0c0d16] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56]"></span>
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e]"></span>
              <span className="w-3 h-3 rounded-full bg-[#27c93f]"></span>
              <span className="ml-3 text-xs font-mono text-neutral-400">Unscroll.it — Live Focus Terminal</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ● 2.4M SCROLLS HALTED
              </span>
              <span className="text-xs text-neutral-400 font-mono">00:00:15:00</span>
            </div>
          </div>

          {/* Interior Dual Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
            
            {/* Left Sidebar / Navigation Pane */}
            <div className="lg:col-span-3 border-r border-white/[0.08] p-4 bg-[#080910]/60 space-y-4">
              <div className="text-[10px] font-bold tracking-wider uppercase text-neutral-500">SANCTUARY MODES</div>
              <ul className="space-y-1">
                {navItems.map((item, idx) => (
                  <li 
                    key={item}
                    onClick={() => setActiveTab(item)}
                    className={`text-xs px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                      activeTab === item ? 'bg-violet-600/20 text-white font-medium border border-violet-500/30' : 'text-neutral-400 hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    <span>{item}</span>
                    <span className="text-[10px] font-mono text-neutral-500">0{idx + 1}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-white/[0.08] space-y-2">
                <div className="text-[10px] font-bold tracking-wider uppercase text-neutral-500">VOICE SYNTHESIS</div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs">
                  <div className="text-violet-300 font-medium">Johnny Dynamite</div>
                  <div className="text-[10px] text-neutral-400">Vintage Radio DJ • Baritone</div>
                </div>
              </div>
            </div>

            {/* Main Content Workspace */}
            <div className="lg:col-span-6 p-6 space-y-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🧐</div>
                    <div>
                      <div className="text-sm font-semibold text-white">Lord Algernon of Sanity</div>
                      <div className="text-xs text-neutral-400">Chief Etiquette Officer</div>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                    High Society Savage
                  </span>
                </div>

                <blockquote className="text-base sm:text-lg text-neutral-200 font-serif italic mt-6 leading-relaxed bg-white/[0.015] p-5 rounded-xl border border-white/[0.04]">
                  “I say, your thumb appears to have far outrun your ambition today. Did you genuinely plan on donating your remaining youth to 15-second dancing teenagers, or did your willpower simply step out for tea?”
                </blockquote>
              </div>

              {/* Action Toolbar */}
              <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition shadow-[0_0_15px_rgba(124,58,237,0.4)] flex items-center gap-1.5">
                    <span>🔊</span> Speak via Johnny
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-medium border border-white/10 transition">
                    Request Another Rebuke ↻
                  </button>
                </div>
                <span className="text-xs font-mono text-neutral-500">Status: Reality Intercepted</span>
              </div>
            </div>

            {/* Right Telemetry Panel */}
            <div className="lg:col-span-3 border-l border-white/[0.08] p-5 bg-[#080910]/60 space-y-5">
              <div className="text-[10px] font-bold tracking-wider uppercase text-neutral-500">LIVE TELEMETRY</div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Dopamine Deficit</span>
                  <span className="text-cyan-400 font-mono">14% (Safe)</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 w-[14%]"></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Doomscroll Velocity</span>
                  <span className="text-amber-400 font-mono">0.0 km/h</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 w-[0%]"></div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-violet-950/20 border border-violet-500/20 text-xs space-y-1">
                <div className="text-violet-300 font-semibold">Offline Time Reclaimed</div>
                <div className="text-2xl font-bold font-mono text-white">4.8 <span className="text-xs text-neutral-400">Hours</span></div>
                <div className="text-[10px] text-neutral-400">Equivalent to 48 pages of deep reading.</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. "DEAD SIMPLE. SURPRISINGLY POWERFUL." SECTION */}
      <section className="py-24 px-4 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
            Dead simple. <br />
            <span className="text-white">Surprisingly powerful.</span>
          </h2>
          <p className="text-neutral-400 text-base sm:text-lg mt-4 leading-relaxed">
            Everything you need to break the algorithmic loop, restore dopamine sensitivity, and retrain your focus.
          </p>
        </div>

        {/* 6. SIGNATURE REFERO / FRAMER BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Card 1: Top Wide Featured Card with Gradient Banner */}
          <div className="md:col-span-12 rounded-2xl border border-white/10 bg-[#0a0b12] overflow-hidden group hover:border-violet-500/40 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="h-32 sm:h-40 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-6 flex flex-col justify-end relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-full bg-white/10 blur-2xl transform skew-x-12 pointer-events-none"></div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-violet-200">ACTIVE INTERVENTION</span>
              <h3 className="text-xl sm:text-2xl font-bold text-white">Doomscroll Simulator & Feed Shield</h3>
            </div>
            <div className="p-6 bg-[#0a0b12]/90 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-neutral-400 max-w-xl">
                Experience simulated addictive micro-clips under controlled lab conditions. Exposes algorithmic dopamine loops with instant reality-check overlays before you get trapped.
              </p>
              <button className="px-5 py-2.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition shrink-0">
                Launch Simulator →
              </button>
            </div>
          </div>

          {/* Card 2: Typography / Acoustic Frequency Card */}
          <div className="md:col-span-4 rounded-2xl border border-white/10 bg-[#0a0b12] p-6 flex flex-col justify-between group hover:border-violet-500/40 transition-all duration-300">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center text-white text-2xl font-serif font-bold shadow-[0_0_20px_rgba(124,58,237,0.4)] mb-6">
                Aa
              </div>
              <h4 className="text-lg font-bold text-white">Sound Sanctuary</h4>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Zero vibration or irritability. Pure soothing nature rain, temple chimes, and flowing stream acoustics.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs">
              <span className="text-violet-400 font-mono">432Hz Harmonic</span>
              <span className="text-emerald-400 font-mono">Active</span>
            </div>
          </div>

          {/* Card 3: 6-Item Quick Quest Mini Grid */}
          <div className="md:col-span-4 rounded-2xl border border-white/10 bg-[#0a0b12] p-6 flex flex-col justify-between group hover:border-violet-500/40 transition-all duration-300">
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400">MICRO MISSIONS</span>
              <h4 className="text-lg font-bold text-white mt-1">Dopamine Side Quests</h4>
              <p className="text-xs text-neutral-400 mt-1">Re-route craving into physical world actions.</p>
              
              <div className="grid grid-cols-2 gap-2 mt-4">
                {['Touch Grass', 'Drink Cold Water', 'Stare at Cloud', 'Read 2 Pages', 'Do 15 Pushups', 'Call a Friend'].map((q) => (
                  <div key={q} className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] text-neutral-300 hover:border-violet-500/30 transition cursor-pointer">
                    ✨ {q}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.08] text-[11px] text-neutral-500">
              Completed: <strong className="text-white">12 / 18 today</strong>
            </div>
          </div>

          {/* Card 4: Inspector / Controls Panel */}
          <div className="md:col-span-4 rounded-2xl border border-white/10 bg-[#0a0b12] p-6 flex flex-col justify-between group hover:border-violet-500/40 transition-all duration-300">
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400">CALIBRATION</span>
              <h4 className="text-lg font-bold text-white mt-1">Roast Severity Matrix</h4>
              
              <div className="mt-5 space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-neutral-300 mb-1.5">
                    <span>Rebuke Intensity</span>
                    <span className="font-mono text-violet-400">{roastSeverity}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={roastSeverity}
                    onChange={(e) => setRoastSeverity(Number(e.target.value))}
                    className="w-full accent-violet-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] text-neutral-400">Tone Preset</div>
                  <div className="flex gap-1.5">
                    {['Gentle', 'Dry Wit', 'Savage'].map((t, idx) => (
                      <span key={t} className={`text-[10px] px-2.5 py-1 rounded-full cursor-pointer ${idx === 2 ? 'bg-violet-600 text-white font-medium' : 'bg-white/5 text-neutral-400'}`}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.08] text-[11px] text-neutral-500">
              Voice: <strong className="text-neutral-300">Lord Algernon • Vintage DJ</strong>
            </div>
          </div>

        </div>
      </section>

      {/* 7. DETAILED FEATURE DEEP-DIVE SECTIONS (Matching Refero Vertical Flow) */}
      
      {/* Feature 1: Sound Sanctuary (Collections style) */}
      <section className="py-20 px-4 max-w-6xl mx-auto border-t border-white/[0.06]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-[11px] font-bold tracking-widest uppercase text-violet-400">ACOUSTIC HEALING</span>
            <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Sound Sanctuary</h3>
            <p className="text-neutral-400 text-base leading-relaxed">
              Zero harsh vibrations, zero buzzing, zero irritation. Layer organic chimes, rainfall, mountain streams, and soothing wildlife audio engineered to silence algorithmic brain fog.
            </p>
            <div className="pt-2">
              <button className="text-sm font-semibold text-white hover:text-violet-400 transition flex items-center gap-2">
                <span>Explore all nature soundscapes</span>
                <span className="font-mono">→</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#090a14] p-6 shadow-2xl">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { name: 'Temple Chimes', icon: '🔔', status: 'Playing' },
                { name: 'Gentle Rain', icon: '🌧️', status: 'Muted' },
                { name: 'Forest River', icon: '🌊', status: 'Muted' },
                { name: 'Night Crickets', icon: '🦗', status: 'Muted' },
                { name: 'Morning Birds', icon: '🐦', status: 'Muted' },
                { name: 'Binaural 432Hz', icon: '✨', status: 'Muted' }
              ].map((s) => (
                <div 
                  key={s.name} 
                  onClick={() => setActiveSound(s.name)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    activeSound === s.name ? 'border-violet-500 bg-violet-600/15' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="text-sm font-semibold text-white">{s.name}</div>
                  <div className="text-[10px] text-neutral-400 mt-1">{activeSound === s.name ? '● Active' : 'Off'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature 2: Life Toll Matrix (Collection List style) */}
      <section className="py-20 px-4 max-w-6xl mx-auto border-t border-white/[0.06]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-[11px] font-bold tracking-widest uppercase text-violet-400">FINITE REALITY</span>
            <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Life Toll Matrix</h3>
            <p className="text-neutral-400 text-base leading-relaxed">
              Turn abstract screen hours into tangible lost life milestones. Measure the real cost of mindless swiping in lost books, unwritten songs, and missed conversations.
            </p>
            <div className="pt-2">
              <button className="text-sm font-semibold text-white hover:text-violet-400 transition flex items-center gap-2">
                <span>Calculate your personal life toll</span>
                <span className="font-mono">→</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#090a14] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <span className="text-xs font-mono text-neutral-400">ASSUMED SCROLL TIME: 3.5 HRS/DAY</span>
              <span className="text-xs font-mono text-rose-400">LIFETIME LOSS: 11.2 YEARS</span>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                <div className="text-2xl font-bold text-white font-mono">182</div>
                <div className="text-[11px] text-neutral-400 mt-1">Books Unread</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                <div className="text-2xl font-bold text-white font-mono">4.2</div>
                <div className="text-[11px] text-neutral-400 mt-1">Languages Lost</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                <div className="text-2xl font-bold text-white font-mono">2,100</div>
                <div className="text-[11px] text-neutral-400 mt-1">Sunsets Missed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 3: Attention Span Improver (Field Types style) */}
      <section className="py-20 px-4 max-w-6xl mx-auto border-t border-white/[0.06]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-[11px] font-bold tracking-widest uppercase text-violet-400">COGNITIVE GYM</span>
            <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Attention Span Improver</h3>
            <p className="text-neutral-400 text-base leading-relaxed">
              Retrain working memory with guided cinematic focus sessions, reading speed drills, and dopamine reset intervals.
            </p>
            <div className="pt-2">
              <button className="text-sm font-semibold text-white hover:text-violet-400 transition flex items-center gap-2">
                <span>Enter Film Focus Sanctuary</span>
                <span className="font-mono">→</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#090a14] p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-around gap-6 text-center">
            <div className="w-36 h-36 rounded-full border-4 border-violet-500/20 border-t-violet-500 flex flex-col items-center justify-center animate-spin-slow">
              <span className="text-3xl font-bold font-mono text-white">25:00</span>
              <span className="text-[10px] text-violet-300 uppercase tracking-widest">DEEP FOCUS</span>
            </div>
            <div className="space-y-2 text-left">
              <div className="text-xs font-semibold text-white">Cinematic Focus Conditioning</div>
              <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
                Watch full-length long-form cinematic scenes without opening a single notification or switching tabs.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Current Streak: 7 Days 🔥
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="border-t border-white/[0.08] py-12 px-4 max-w-6xl mx-auto text-neutral-400 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">Unscroll It</span>
          <span>•</span>
          <span>Polite Reality Checks for the Algorithmic Soul</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#sanctuary" className="hover:text-white transition">Sanctuary</a>
          <a href="#simulator" className="hover:text-white transition">Simulator</a>
          <a href="#quests" className="hover:text-white transition">Side Quests</a>
          <a href="#matrix" className="hover:text-white transition">Life Toll</a>
        </div>
      </footer>

    </div>
  );
}
