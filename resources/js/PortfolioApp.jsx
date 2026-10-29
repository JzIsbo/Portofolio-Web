import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Portfolio from './components/Portfolio';
import SpotifyWidget from './components/SpotifyWidget';
import Contact from './components/Contact';
import Footer from './components/Footer';
import BackgroundCanvas from './components/BackgroundCanvas';

import Preloader from './components/Preloader';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const soundEnabledRef = useRef(soundEnabled);
  const mainRef = useRef(null);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Persistent Web Audio API Synthesizer
  const audioCtxRef = useRef(null);

  const getAudioContext = () => {
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
    } catch (e) {
      return null;
    }
  };

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);

    const ctx = getAudioContext();
    if (!ctx) return;

    if (nextState) {
      // Melodic chime when sound is enabled [C5, E5, G5, C6]
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const start = ctx.currentTime + idx * 0.055;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.045, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.16);
      });
    } else {
      // Gentle descending tone when sound is muted [A4, E4]
      const notes = [440, 329.63];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const start = ctx.currentTime + idx * 0.055;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.035, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.12);
      });
    }
  };

  const playBeep = React.useCallback((freq = 600, type = 'sine', vol = 0.035) => {
    if (!soundEnabledRef.current) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      // AudioContext blocked or not supported
    }
  }, []);

  // Preloader curtain sweep provides a clean theatrical reveal without jarring post-load opacity jumps

  return (
    <div ref={mainRef} className="relative min-h-screen bg-[#050510] text-[#e2e8f0] overflow-x-clip selection:bg-sky-500/30 selection:text-white">
      {/* Cool & Elegant Preloader on initial entry */}
      {loading && (
        <Preloader
          onComplete={() => setLoading(false)}
          playBeep={playBeep}
        />
      )}

      {/* Dynamic Starfield Background Canvas */}
      <BackgroundCanvas />

      {/* Floating Glass Navbar */}
      <Navbar
        soundEnabled={soundEnabled}
        toggleSound={toggleSound}
        playBeep={playBeep}
      />

      {/* Main Content Sections */}
      <main className="relative z-10 flex flex-col space-y-8 sm:space-y-24 w-full max-w-full min-w-0 overflow-x-clip">
        {/* 1. Hero with Typewriter & 3D Interactive Lanyard */}
        <Hero playBeep={playBeep} />

        {/* 2. About Me, Education & Experience */}
        <About playBeep={playBeep} />

        {/* 3. Portfolio Projects, Skills, Certificates & Awards */}
        <Portfolio playBeep={playBeep} />

        {/* 4. Spotify Section Widget */}
        <SpotifyWidget playBeep={playBeep} />

        {/* 5. Contact Section & Direct Message Form */}
        <Contact playBeep={playBeep} />
      </main>

      {/* Footer with Tech Stack Credits */}
      <Footer playBeep={playBeep} />
    </div>
  );
}
