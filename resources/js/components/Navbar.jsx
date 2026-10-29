import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

/**
 * Centered Floating Glass Navbar (Exact alfari.my.id Style)
 *
 * - Perfectly centered pill capsule at the top
 * - Navigation links: Home, About, Portfolio, Contact
 * - Active pill button indicator
 * - Audio toggle button (Volume2 / VolumeX) immediately to the right of Contact
 * - Locked permanently at top of viewport (fixed)
 */
export default function Navbar({ soundEnabled, toggleSound, playBeep }) {
  const [activeSection, setActiveSection] = useState('Home');

  const navLinks = [
    { name: 'Home', href: '#Home' },
    { name: 'About', href: '#About' },
    { name: 'Portfolio', href: '#Portofolio' },
    { name: 'Contact', href: '#Contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['Home', 'About', 'Portofolio', 'Spotify', 'Contact'];
      const scrollPos = window.scrollY + 200;

      for (let id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(id === 'Portofolio' ? 'Portfolio' : id === 'Spotify' ? 'Contact' : id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className="absolute top-5 inset-x-0 z-40 pointer-events-none flex justify-center w-full px-4"
      style={{
        position: 'absolute',
        top: '1.25rem',
        left: 0,
        right: 0,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 40,
        pointerEvents: 'none',
      }}
    >
      <nav className="pointer-events-auto flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:py-2 rounded-full bg-slate-900/70 hover:bg-slate-900/85 backdrop-blur-xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.7)] transition-all duration-300">
        {/* Nav Links */}
        {navLinks.map((link) => {
          const isActive = activeSection === link.name;
          return (
            <a
              key={link.name}
              href={link.href}
              onClick={() => playBeep?.(600)}
              className={`relative px-3.5 sm:px-4 py-1 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 ${
                isActive
                  ? 'text-white bg-slate-800/90 border border-slate-700/70 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              {link.name}
            </a>
          );
        })}

        {/* Subtle Vertical Divider */}
        <div className="w-[1px] h-4 bg-slate-700/60 mx-1 shrink-0" />

        {/* Audio Toggle Button right next to Contact */}
        <button
          type="button"
          onClick={toggleSound}
          aria-label={soundEnabled ? 'Matikan Suara Audio' : 'Aktifkan Suara Audio'}
          title={soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${
            soundEnabled
              ? 'text-cyan-400 bg-sky-500/20 border border-sky-400/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 animate-pulse" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>
      </nav>
    </header>
  );
}
