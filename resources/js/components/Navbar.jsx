import React, { useState, useEffect } from 'react';
import { Sparkles, Menu, X, Volume2, VolumeX, ArrowUpRight, Code2 } from 'lucide-react';
import { personalInfo } from '../data/portfolioData';

export default function Navbar({ soundEnabled, toggleSound, playBeep }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('Home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#Home' },
    { name: 'About', href: '#About' },
    { name: 'Portofolio', href: '#Portofolio' },
    { name: 'Music', href: '#Spotify' },
    { name: 'Contact', href: '#Contact' },
  ];

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);

      const sections = ['Home', 'About', 'Portofolio', 'Spotify', 'Contact'];
      const scrollPos = window.scrollY + 200;

      for (let id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(id === 'Portofolio' ? 'Portofolio' : id === 'Spotify' ? 'Music' : id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-2.5 sm:px-4 pt-3 sm:pt-6 transition-all duration-300 pointer-events-none">
      <nav
        className={`pointer-events-auto flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 py-2 sm:py-2.5 rounded-full border transition-all duration-300 backdrop-blur-xl shadow-2xl ${
          scrolled
            ? 'bg-slate-950/85 border-slate-700/60 shadow-sky-950/30'
            : 'bg-slate-900/60 border-slate-800/80'
        } max-w-4xl w-full`}
      >
        {/* Brand */}
        <a
          href="#Home"
          className="flex items-center gap-2 sm:gap-2.5 group"
          onClick={() => playBeep?.(520)}
        >
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border-2 border-sky-400/50 shadow-md shadow-sky-500/25 group-hover:scale-105 group-hover:border-sky-300 transition-all shrink-0">
            <img
              src="/assets/steve.png"
              alt={personalInfo.name}
              className="w-full h-full object-cover object-top"
            />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-cyan-400 ring-2 ring-slate-950 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-white group-hover:text-cyan-400 transition-colors">
              {personalInfo.name}
            </span>
            <span className="text-[9px] sm:text-[10px] text-rose-400 -mt-0.5 font-mono font-medium">
              Brand Activation
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1 bg-slate-950/40 p-1 rounded-full border border-slate-800/60">
          {navLinks.map((link) => {
            const isActive = activeSection === link.name;
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={() => playBeep?.(600)}
                className={`relative px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                  isActive
                    ? 'text-white bg-gradient-to-r from-sky-500/30 to-indigo-500/30 border border-sky-400/40 shadow-sm shadow-sky-500/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {link.name}
              </a>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Audio toggle button */}
          <button
            type="button"
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Matikan Suara Audio' : 'Aktifkan Suara Audio'}
            title={soundEnabled ? 'Mute SFX (Matikan Suara)' : 'Enable SFX (Aktifkan Suara)'}
            className={`w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border transition-all text-xs active:scale-90 ${
              soundEnabled
                ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-sm shadow-sky-500/30'
                : 'bg-slate-800/60 hover:bg-slate-700/60 border-slate-700/50 text-slate-400 hover:text-white'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Quick CTA button */}
          <a
            href="#Contact"
            onClick={() => playBeep?.(800)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 text-white shadow-md shadow-sky-500/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <span>Hubungi</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              playBeep?.(500);
            }}
            aria-label={mobileMenuOpen ? 'Tutup Menu' : 'Buka Menu'}
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center bg-slate-800/90 border border-slate-700/80 text-slate-300 hover:text-white active:scale-90 transition-all shadow-md"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu & Backdrop */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 pointer-events-auto md:hidden animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Floating Luxury Sheet */}
          <div className="md:hidden pointer-events-auto fixed inset-x-3 sm:inset-x-4 top-16 sm:top-20 z-50 p-4 sm:p-5 max-h-[85vh] overflow-y-auto overscroll-contain rounded-2xl sm:rounded-3xl bg-slate-950/95 backdrop-blur-2xl border border-sky-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col gap-3.5 sm:gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
            {/* Header info inside drawer */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full overflow-hidden border border-sky-400/50">
                  <img
                    src="/assets/steve.png"
                    alt={personalInfo.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white tracking-wide">
                    {personalInfo.name}
                  </span>
                  <span className="text-[10px] text-rose-400 font-mono">
                    Brand Activation
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Open for Work
              </span>
            </div>

            {/* Nav Links */}
            <div className="flex flex-col gap-1 sm:gap-1.5">
              {navLinks.map((link) => {
                const isActive = activeSection === link.name;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      playBeep?.(600);
                    }}
                    className={`flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/20 border border-sky-400/40 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    <span>{link.name}</span>
                    <span className="text-xs text-sky-400 font-mono">→</span>
                  </a>
                );
              })}
            </div>

            {/* Mobile Actions: CTA & Socials */}
            <div className="pt-2.5 sm:pt-3 border-t border-slate-800/80 flex flex-col gap-2 sm:gap-2.5">
              <a
                href="#Contact"
                onClick={() => {
                  setMobileMenuOpen(false);
                  playBeep?.(800);
                }}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 text-white shadow-md shadow-sky-500/25 active:scale-95 transition-all text-center"
              >
                <span>Hubungi Steve Marvin</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>

              <div className="flex items-center justify-center gap-2.5 sm:gap-3 pt-0.5 sm:pt-1">
                {personalInfo.socials.linkedin && (
                  <a
                    href={personalInfo.socials.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 border border-sky-500/30 text-sky-400 text-xs font-mono"
                  >
                    <span>LinkedIn</span>
                  </a>
                )}
                {personalInfo.socials.instagram && (
                  <a
                    href={personalInfo.socials.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 border border-pink-500/30 text-pink-400 text-xs font-mono"
                  >
                    <span>Instagram</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
