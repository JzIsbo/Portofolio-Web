import React, { useState, useEffect, useRef } from 'react';
import {
  ExternalLink,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  Music2
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

  const currentTrack = spotifyTracks[activeTrackIndex] || spotifyTracks[0];

  // Real HTML5 Audio Element Ref
  const audioRef = useRef(null);

  // Initialize or retrieve Audio instance
  const getAudio = () => {
    if (!audioRef.current && typeof window !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto';
    }
    return audioRef.current;
  };

  const startPlayback = (trackToPlay = currentTrack) => {
    const audio = getAudio();
    if (!audio) return;

    if (audio.src !== trackToPlay.audioUrl) {
      audio.src = trackToPlay.audioUrl;
      audio.load();
    }
    audio.muted = isMuted;

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch((err) => {
        console.warn('Playback error:', err);
        setIsPlaying(false);
      });
  };

  const stopPlayback = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    setIsPlaying(false);
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
    playBeep?.(700 + idx * 40);

    const nextTrack = spotifyTracks[idx];
    const audio = getAudio();
    if (audio) {
      audio.src = nextTrack.audioUrl;
      if (isPlaying) {
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }
  };

  // Sync mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Audio event listeners for timeupdate & onended
  useEffect(() => {
    const audio = getAudio();
    if (!audio) return;

    if (!audio.src) {
      audio.src = currentTrack.audioUrl;
    }

    const handleTimeUpdate = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setPlayProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      handleTrackChange(activeTrackIndex + 1);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [activeTrackIndex, currentTrack]);

  // Pause on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <section id="Spotify" className="relative py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden w-full min-w-0">
      {/* Background ambient neon glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Spotify Card Container */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#07131e]/90 to-slate-950/95 border border-sky-500/25 p-4 sm:p-7 lg:p-9 shadow-2xl backdrop-blur-xl overflow-hidden text-left w-full min-w-0">
        {/* Subtle decorative concentric circles */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full border border-sky-500/10 pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full border border-emerald-500/10 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch w-full min-w-0">
          {/* Left Column: Heading, Subtitle & Interactive Equalizer */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4 sm:space-y-5 w-full min-w-0">
            <div className="space-y-3 sm:space-y-4">
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
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-semibold bg-[#1ed760] hover:bg-[#1fdf64] text-slate-950 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 active:scale-95 transition-all duration-200 w-full sm:w-auto text-center"
                >
                  <SpotifyLogo className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 shrink-0" />
                  <span>Buka Playlist di Spotify</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>
            </div>

            {/* Event Music Highlights Card */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-2 mt-4">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Official Studio Audio
                </span>
                <span className="text-slate-500">Live Vocal & Master</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pilih lagu pada tabel di samping untuk langsung memutar audio resmi studio lengkap dengan vokal asli penyanyi hits dunia.
              </p>
            </div>
          </div>

          {/* Right Column: Full-Height Spotify Playlist Table Card (sebesar tabel cardnya) */}
          <div className="lg:col-span-7 flex flex-col h-full w-full min-w-0 pt-2 lg:pt-0">
            {/* Main Full-Size Playlist Card Container */}
            <div className="relative w-full h-full min-h-[460px] sm:min-h-[520px] rounded-2xl border border-slate-700/80 bg-gradient-to-b from-slate-950 via-[#071018] to-slate-950 p-4 sm:p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
              {/* Header: Playlist Info & Mode Switcher */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-emerald-500/40 shadow-lg shrink-0 relative group bg-slate-900">
                      <img
                        src="/assets/steve.png"
                        alt="Steve Marvin"
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          e.target.src = '/assets/me.png';
                        }}
                      />
                      <div className="absolute inset-0 bg-slate-950/10 pointer-events-none" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                          Playlist
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {spotifyTracks.length} Lagu
                        </span>
                      </div>
                      <h3 className="text-base sm:text-xl font-bold text-white truncate">
                        Soundtrack of Events
                      </h3>
                      <p className="text-xs text-slate-400 truncate">
                        Steve Marvin • Brand Activation
                      </p>
                    </div>
                  </div>

                  {/* Mode Toggle: Web Player / Spotify Embed */}
                  <div className="inline-flex items-center p-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-medium shrink-0">
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

                {/* VIEW 1: FULL PLAYLIST TABLE (No "Preview" word, fills 100% of card) */}
                {playerMode === 'interactive' ? (
                  <div className="space-y-1 w-full min-w-0">
                    <div className="grid grid-cols-12 text-[10px] font-mono text-slate-500 uppercase tracking-wider px-3 py-1.5 border-b border-slate-900">
                      <span className="col-span-1 text-center">#</span>
                      <span className="col-span-6 sm:col-span-5">Judul Lagu</span>
                      <span className="hidden sm:block sm:col-span-4">Vibe Aktivasi</span>
                      <span className="col-span-5 sm:col-span-2 text-right">Durasi</span>
                    </div>

                    <div className="space-y-1 w-full min-w-0 pt-1">
                      {spotifyTracks.map((track, idx) => {
                        const isCurrent = activeTrackIndex === idx;
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              handleTrackChange(idx);
                              if (!isPlaying) startPlayback();
                            }}
                            className={`grid grid-cols-12 items-center px-3 py-2 sm:py-2.5 rounded-xl cursor-pointer transition-all duration-150 text-xs ${
                              isCurrent
                                ? 'bg-emerald-500/15 border border-emerald-500/40 text-white shadow-sm'
                                : 'hover:bg-slate-900/80 border border-transparent text-slate-300'
                            }`}
                          >
                            {/* # or Playing Waveform */}
                            <div className="col-span-1 flex items-center justify-center">
                              {isCurrent && isPlaying ? (
                                <div className="flex items-end gap-0.5 h-3 w-3">
                                  <span className="w-0.5 bg-emerald-400 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-2.5" />
                                  <span className="w-0.5 bg-emerald-400 rounded-full animate-[pulse_0.9s_ease-in-out_infinite] h-1.5" />
                                  <span className="w-0.5 bg-emerald-400 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-3" />
                                </div>
                              ) : (
                                <span className={`text-[11px] font-mono ${isCurrent ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                                  {idx + 1}
                                </span>
                              )}
                            </div>

                            {/* Title & Artist */}
                            <div className="col-span-6 sm:col-span-5 truncate pr-2">
                              <p className={`font-semibold truncate text-[11px] sm:text-xs ${isCurrent ? 'text-emerald-300' : 'text-slate-100'}`}>
                                {track.title}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {track.artist}
                              </p>
                            </div>

                            {/* Vibe Badge (Desktop) */}
                            <div className="hidden sm:block sm:col-span-4 truncate pr-2">
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800 truncate max-w-full">
                                {track.vibe}
                              </span>
                            </div>

                            {/* Duration & Play action */}
                            <div className="col-span-5 sm:col-span-2 flex items-center justify-end gap-2 text-right">
                              <span className="text-[10px] font-mono text-slate-400">
                                {track.duration}
                              </span>
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-transform ${isCurrent ? 'bg-emerald-500 text-slate-950 scale-105' : 'bg-slate-800 text-slate-400'}`}>
                                {isCurrent && isPlaying ? (
                                  <Pause className="w-2.5 h-2.5 fill-current" />
                                ) : (
                                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* VIEW 2: OFFICIAL SPOTIFY IFRAME (Filling 100% of card) */
                  <div className="relative w-full h-[360px] sm:h-[420px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                    <iframe
                      title={`Spotify Player - ${currentTrack.title}`}
                      src={currentTrack.embedUrl}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      className="w-full h-full rounded-2xl bg-slate-950"
                    />
                  </div>
                )}
              </div>

              {/* Bottom Sticky Player Bar */}
              <div className="mt-4 pt-3 border-t border-slate-800/90 space-y-2">
                {/* Progress bar */}
                <div
                  className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const pct = Math.max(0, Math.min(1, clickX / rect.width));
                    if (audioRef.current && audioRef.current.duration) {
                      audioRef.current.currentTime = pct * audioRef.current.duration;
                      setPlayProgress(pct * 100);
                    }
                  }}
                >
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                    style={{ width: `${playProgress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  {/* Left: Now Playing Song Info */}
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-emerald-500/30 shrink-0 relative bg-slate-900 hidden sm:block">
                      <img
                        src="/assets/steve.png"
                        alt="Steve Marvin"
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          e.target.src = '/assets/me.png';
                        }}
                      />
                    </div>
                    <Music2 className={`w-4 h-4 text-emerald-400 shrink-0 sm:hidden ${isPlaying ? 'animate-bounce' : ''}`} />
                    <div className="min-w-0 truncate">
                      <p className="text-xs font-bold text-white truncate">
                        {currentTrack.title}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {currentTrack.artist} • {currentTrack.vibe}
                      </p>
                    </div>
                  </div>

                  {/* Right: Controls (Prev, Play, Next, Mute) */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      title={isMuted ? 'Unmute' : 'Mute'}
                      className="p-1.5 rounded-full text-slate-400 hover:text-white"
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTrackChange(activeTrackIndex - 1)}
                      title="Lagu Sebelumnya"
                      className="p-1.5 rounded-full text-slate-300 hover:text-white active:scale-90"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={togglePlay}
                      title={isPlaying ? 'Pause' : 'Play'}
                      className="p-2 sm:p-2.5 rounded-full bg-emerald-500 text-slate-950 hover:scale-105 active:scale-95 transition-all shadow-md shadow-emerald-500/25 flex items-center justify-center"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTrackChange(activeTrackIndex + 1)}
                      title="Lagu Berikutnya"
                      className="p-1.5 rounded-full text-slate-300 hover:text-white active:scale-90"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
