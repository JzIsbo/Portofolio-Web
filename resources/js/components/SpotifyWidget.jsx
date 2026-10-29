import React, { useState, useEffect, useRef } from 'react';
import {
  Music,
  ExternalLink,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Disc3,
  Radio,
  Sparkles
} from 'lucide-react';
import { personalInfo, spotifyTracks } from '../data/portfolioData';

// Custom Spotify SVG Icon
function SpotifyLogo({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.316a.75.75 0 0 1-1.031.25c-2.822-1.725-6.375-2.115-10.56-1.16a.75.75 0 0 1-.334-1.462c4.582-1.045 8.52-.602 11.675 1.341a.75.75 0 0 1 .25 1.031zm1.466-3.262a.938.938 0 0 1-1.29.313c-3.23-1.986-8.156-2.56-11.977-1.4a.938.938 0 0 1-.55-1.792c4.37-1.326 9.805-.684 13.504 1.589a.938.938 0 0 1 .313 1.29zm.126-3.414c-3.873-2.3-10.264-2.512-13.98-1.383a1.125 1.125 0 0 1-.652-2.155c4.27-1.297 11.33-1.049 15.792 1.6a1.125 1.125 0 1 1-1.16 1.938z" />
    </svg>
  );
}

export default function SpotifyWidget({ playBeep }) {
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [playerMode, setPlayerMode] = useState('interactive'); // 'interactive' | 'spotify'
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const currentTrack = spotifyTracks[activeTrackIndex] || spotifyTracks[0];

  // Web Audio Synthesizer Loop Ref
  const audioCtxRef = useRef(null);
  const loopIntervalRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const noteIndexRef = useRef(0);

  const initAudioCtx = () => {
    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtxClass) return null;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtxClass();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  };

  const playMelodyNote = () => {
    if (isMuted) return;
    const ctx = initAudioCtx();
    if (!ctx) return;

    const melody = currentTrack.melody || [440, 523, 659, 784];
    const freq = melody[noteIndexRef.current % melody.length];
    noteIndexRef.current += 1;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);

      gain.gain.setValueAtTime(0.045, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.32);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.34);
    } catch {}
  };

  const startPlayback = () => {
    setIsPlaying(true);
    initAudioCtx();

    // Start melody ticker
    clearInterval(loopIntervalRef.current);
    playMelodyNote();
    loopIntervalRef.current = setInterval(playMelodyNote, 280);

    // Progress ticker
    clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      setPlayProgress((prev) => (prev >= 100 ? 0 : prev + 0.6));
    }, 1000);
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    clearInterval(loopIntervalRef.current);
    clearInterval(progressIntervalRef.current);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopPlayback();
      playBeep?.(450);
    } else {
      startPlayback();
      playBeep?.(850);
    }
  };

  const handleTrackChange = (newIndex) => {
    const idx = (newIndex + spotifyTracks.length) % spotifyTracks.length;
    setActiveTrackIndex(idx);
    setPlayProgress(0);
    noteIndexRef.current = 0;
    setIframeLoaded(false);
    playBeep?.(700 + idx * 40);

    if (isPlaying) {
      startPlayback();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(loopIntervalRef.current);
      clearInterval(progressIntervalRef.current);
    };
  }, []);

  return (
    <section id="Spotify" className="relative py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden w-full min-w-0">
      {/* Background ambient neon glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Spotify Card Container */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#07131e]/90 to-slate-950/95 border border-sky-500/25 p-4 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-xl overflow-hidden text-left w-full min-w-0">
        {/* Subtle decorative concentric circles */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full border border-sky-500/10 pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full border border-emerald-500/10 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start w-full min-w-0">
          {/* Left Column: Heading, Subtitle & Interactive Equalizer */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-5 w-full min-w-0">
            {/* Eyebrow with Animated Equalizer Bars */}
            <div className="inline-flex items-center gap-2.5">
              <div className="flex items-end gap-1 h-3.5">
                <span className={`w-1 bg-emerald-400 rounded-full h-2.5 ${isPlaying ? 'animate-[pulse_0.8s_ease-in-out_infinite]' : ''}`} />
                <span className={`w-1 bg-rose-400 rounded-full h-3.5 ${isPlaying ? 'animate-[pulse_0.5s_ease-in-out_infinite]' : ''}`} />
                <span className={`w-1 bg-amber-400 rounded-full h-2 ${isPlaying ? 'animate-[pulse_1s_ease-in-out_infinite]' : ''}`} />
                <span className={`w-1 bg-emerald-400 rounded-full h-3 ${isPlaying ? 'animate-[pulse_0.7s_ease-in-out_infinite]' : ''}`} />
              </div>
              <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
                Spotify Event Vibes
              </span>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight break-words">
                Soundtrack of Events. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-rose-400 to-amber-300 inline-block">
                  Powering Great Activations.
                </span>
              </h2>
            </div>

            {/* Description */}
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed break-words">
              Kompilasi lagu penuh energi yang menemani perancangan strategi aktivasi brand, koordinasi panggung event akbar, hingga ritme dinamis dari latar belakang Concert Band & Musik di Universitas Bunda Mulia.
            </p>

            {/* Open in Spotify CTA */}
            <div className="pt-1">
              <a
                href={personalInfo.socials.spotify}
                target="_blank"
                rel="noreferrer"
                onClick={() => playBeep?.(850)}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-semibold bg-[#1ed760] hover:bg-[#1fdf64] text-slate-950 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 active:scale-95 transition-all duration-200 w-full sm:w-auto text-center"
              >
                <SpotifyLogo className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 shrink-0" />
                <span>Buka Playlist di Spotify</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>

            {/* Interactive Track List */}
            <div className="space-y-2 pt-2 w-full min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Featured Vibes ({spotifyTracks.length} Lagu)
                </span>
                <span className="text-[10px] font-mono text-emerald-400/90 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Klik lagu untuk memutar
                </span>
              </div>

              <div className="space-y-1.5 w-full min-w-0">
                {spotifyTracks.map((track, idx) => {
                  const isCurrent = activeTrackIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        handleTrackChange(idx);
                        if (!isPlaying && playerMode === 'interactive') {
                          startPlayback();
                        }
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all duration-200 text-left min-w-0 active:scale-[0.99] ${
                        isCurrent
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-500/10'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate min-w-0 pr-2">
                        {isCurrent && isPlaying ? (
                          <div className="flex items-end gap-0.5 h-3.5 w-4 shrink-0">
                            <span className="w-1 bg-emerald-400 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3" />
                            <span className="w-1 bg-emerald-400 rounded-full animate-[pulse_0.9s_ease-in-out_infinite] h-2" />
                            <span className="w-1 bg-emerald-400 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-3.5" />
                          </div>
                        ) : (
                          <Play className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-emerald-400 fill-emerald-400' : 'text-slate-500'}`} />
                        )}
                        <span className={`font-semibold truncate text-[11px] sm:text-xs ${isCurrent ? 'text-emerald-200' : 'text-slate-200'}`}>
                          {track.title}
                        </span>
                        <span className="text-slate-600 shrink-0">•</span>
                        <span className="text-slate-400 truncate text-[10px] sm:text-[11px]">
                          {track.artist}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {track.duration}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Vinyl / Audio Player & Spotify Toggle */}
          <div className="lg:col-span-7 flex flex-col justify-center w-full min-w-0 pt-2 lg:pt-0">
            {/* Player Header with Mode Toggle */}
            <div className="flex items-center justify-between pb-3 px-1">
              <div className="flex items-center gap-2">
                <Disc3 className={`w-4 h-4 text-emerald-400 ${isPlaying ? 'animate-spin-slow' : ''}`} />
                <span className="text-xs font-mono font-semibold text-slate-300">
                  {playerMode === 'interactive' ? 'Interactive Web Player' : 'Official Spotify Embed'}
                </span>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="inline-flex items-center p-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-medium">
                <button
                  type="button"
                  onClick={() => {
                    setPlayerMode('interactive');
                    playBeep?.(600);
                  }}
                  className={`px-2.5 py-1 rounded-full transition-all ${
                    playerMode === 'interactive'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Web Player
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPlayerMode('spotify');
                    stopPlayback();
                    playBeep?.(750);
                  }}
                  className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1 ${
                    playerMode === 'spotify'
                      ? 'bg-[#1ed760] text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <SpotifyLogo className="w-3 h-3" />
                  Spotify
                </button>
              </div>
            </div>

            {/* --- VIEW 1: INTERACTIVE WEB AUDIO & VINYL PLAYER --- */}
            {playerMode === 'interactive' ? (
              <div className="relative w-full rounded-2xl border border-slate-700/80 bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950 p-5 sm:p-7 shadow-2xl shadow-emerald-950/20 overflow-hidden">
                {/* Vinyl & Turntable Art Section */}
                <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-7 mb-6">
                  {/* Rotating Vinyl Record */}
                  <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-slate-950 border-4 border-slate-800/80 shadow-2xl flex items-center justify-center shrink-0 overflow-hidden group">
                    {/* Vinyl Grooves */}
                    <div className="absolute inset-2 rounded-full border border-slate-800/60" />
                    <div className="absolute inset-5 rounded-full border border-slate-800/40" />
                    <div className="absolute inset-8 rounded-full border border-slate-800/30" />

                    {/* Center Vinyl Label with Image */}
                    <div className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-emerald-400 shadow-md ${isPlaying ? 'animate-spin-slow' : ''}`}>
                      <img
                        src={currentTrack.cover}
                        alt={currentTrack.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/assets/frontCard.png';
                        }}
                      />
                      <div className="absolute inset-0 bg-slate-950/20" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-950 border border-slate-700" />
                    </div>
                  </div>

                  {/* Song Details & Vibe Badge */}
                  <div className="flex flex-col items-center sm:items-start text-center sm:text-left min-w-0 flex-1 space-y-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                      <Radio className="w-3 h-3 animate-pulse" />
                      {currentTrack.vibe}
                    </span>
                    <h3 className="text-lg sm:text-2xl font-bold text-white truncate max-w-full">
                      {currentTrack.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 font-medium truncate max-w-full">
                      {currentTrack.artist}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400">
                      Duration: {currentTrack.duration}
                    </p>
                  </div>
                </div>

                {/* Progress Bar & Seek Timers */}
                <div className="space-y-1.5 mb-5">
                  <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden cursor-pointer">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                      style={{ width: `${playProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>
                      {isPlaying
                        ? `0:${Math.floor((playProgress / 100) * 42).toString().padStart(2, '0')}`
                        : '0:00'}
                    </span>
                    <span className="text-emerald-400 font-semibold">
                      {isPlaying ? 'Playing Live Synthesizer Melody' : 'Paused'}
                    </span>
                    <span>{currentTrack.duration}</span>
                  </div>
                </div>

                {/* Player Controls (Prev, Play/Pause, Next, Mute) */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                    className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                  </button>

                  <div className="flex items-center gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => handleTrackChange(activeTrackIndex - 1)}
                      title="Lagu Sebelumnya"
                      className="p-2 sm:p-2.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-all active:scale-90"
                    >
                      <SkipBack className="w-4 sm:w-5 h-4 sm:h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={togglePlay}
                      title={isPlaying ? 'Pause' : 'Play'}
                      className="p-3.5 sm:p-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 sm:w-6 h-5 sm:h-6 fill-current" />
                      ) : (
                        <Play className="w-5 sm:w-6 h-5 sm:h-6 fill-current ml-0.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTrackChange(activeTrackIndex + 1)}
                      title="Lagu Berikutnya"
                      className="p-2 sm:p-2.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-all active:scale-90"
                    >
                      <SkipForward className="w-4 sm:w-5 h-4 sm:h-5" />
                    </button>
                  </div>

                  <a
                    href={personalInfo.socials.spotify}
                    target="_blank"
                    rel="noreferrer"
                    title="Buka di Spotify"
                    className="p-2 rounded-full text-slate-400 hover:text-[#1ed760] hover:bg-slate-800/60 transition-colors"
                  >
                    <SpotifyLogo className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ) : (
              /* --- VIEW 2: DYNAMIC SPOTIFY EMBED IFRAME --- */
              <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-2xl shadow-emerald-950/20">
                {/* Fallback Loading Skeleton */}
                {!iframeLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-400 text-xs font-mono space-y-2 z-10 pointer-events-none">
                    <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                    <span>Memuat Spotify Player...</span>
                  </div>
                )}

                <iframe
                  title={`Spotify Player - ${currentTrack.title}`}
                  src={currentTrack.embedUrl}
                  width="100%"
                  height="340"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  onLoad={() => setIframeLoaded(true)}
                  className="w-full h-[300px] sm:h-[352px] rounded-2xl bg-slate-950 transition-opacity duration-300"
                />
              </div>
            )}

            {/* Footer Status Bar */}
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-400 pt-2 px-1">
              <span>{playerMode === 'interactive' ? 'Built-in Web Audio Synthesizer' : 'Spotify Official Embed'}</span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${isPlaying ? 'animate-ping' : ''}`} />
                {isPlaying ? 'Audio Active' : 'Ready to Play'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
