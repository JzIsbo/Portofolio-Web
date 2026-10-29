import React, { useState } from 'react';
import { Music, ExternalLink, Play, Disc3, Radio } from 'lucide-react';
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

  return (
    <section id="Spotify" className="relative py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden w-full min-w-0">
      {/* Background ambient neon glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Spotify Card Container */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#07131e]/90 to-slate-950/95 border border-sky-500/25 p-4 sm:p-8 lg:p-12 shadow-2xl backdrop-blur-xl overflow-hidden text-left w-full min-w-0">
        {/* Subtle decorative concentric circles */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full border border-sky-500/10 pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full border border-emerald-500/10 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center w-full min-w-0">
          {/* Left Column: Heading, Subtitle & Interactive Equalizer */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            {/* Eyebrow with Animated Equalizer Bars */}
            <div className="inline-flex items-center gap-2.5">
              <div className="flex items-end gap-1 h-3.5">
                <span className="w-1 bg-emerald-400 rounded-full animate-[pulse_1s_ease-in-out_infinite] h-2.5" />
                <span className="w-1 bg-rose-400 rounded-full animate-[pulse_0.7s_ease-in-out_infinite] h-3.5" />
                <span className="w-1 bg-amber-400 rounded-full animate-[pulse_1.2s_ease-in-out_infinite] h-2" />
                <span className="w-1 bg-emerald-400 rounded-full animate-[pulse_0.9s_ease-in-out_infinite] h-3" />
              </div>
              <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
                Spotify Event Vibes
              </span>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                Soundtrack of Events. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-rose-400 to-amber-300">
                  Powering Great Activations.
                </span>
              </h2>
            </div>

            {/* Description */}
            <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
              Kompilasi lagu penuh energi yang menemani perancangan strategi aktivasi brand, koordinasi panggung event akbar, hingga ritme dinamis dari latar belakang Concert Band & Musik di Universitas Bunda Mulia.
            </p>

            {/* Open in Spotify CTA */}
            <div className="pt-1 sm:pt-2">
              <a
                href={personalInfo.socials.spotify}
                target="_blank"
                rel="noreferrer"
                onClick={() => playBeep?.(850)}
                className="inline-flex items-center justify-center gap-2.5 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-full text-xs sm:text-sm font-semibold bg-[#1ed760] hover:bg-[#1fdf64] text-slate-950 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 active:scale-95 transition-all duration-200 w-full sm:w-auto text-center"
              >
                <SpotifyLogo className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
                <span>Buka Playlist di Spotify</span>
                <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
            </div>

            {/* Mini Tracks Quick Switch */}
            <div className="space-y-1.5 sm:space-y-2 pt-1 sm:pt-2">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Featured Vibes
              </span>
              <div className="space-y-1.5">
                {spotifyTracks.slice(0, 3).map((track, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setActiveTrackIndex(idx);
                      playBeep?.(700 + idx * 50);
                    }}
                    className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      activeTrackIndex === idx
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate min-w-0 pr-2">
                      <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-emerald-400" />
                      <span className="font-medium text-slate-200 truncate text-[11px] sm:text-xs">
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
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Embedded Spotify Playlist Iframe Player */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-2xl shadow-emerald-950/20 group">
              <iframe
                title="Spotify Event & Activation Playlist"
                src={personalInfo.spotifyEmbed}
                width="100%"
                height="320"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="w-full h-[280px] sm:h-[340px] rounded-2xl bg-slate-950"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-400 pt-2.5 px-1">
              <span>Spotify Web Embed Player</span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Feed
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
