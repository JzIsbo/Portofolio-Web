import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Send, Sparkles, Terminal } from 'lucide-react';
import { personalInfo } from '../data/portfolioData';
import { InstagramIcon, LinkedInIcon } from './Icons';
import Lanyard from './Lanyard';

export default function Hero({ playBeep }) {
  // Typewriter effect state
  const [currentText, setCurrentText] = useState('');
  const [roleIndex, setRoleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const roles = personalInfo.roles;
    const currentRole = roles[roleIndex];

    const handleTyping = () => {
      if (!isDeleting) {
        if (charIndex < currentRole.length) {
          setCurrentText((prev) => prev + currentRole[charIndex]);
          setCharIndex((prev) => prev + 1);
        } else {
          // Pause at full word before deleting
          setTimeout(() => setIsDeleting(true), 1600);
          return;
        }
      } else {
        if (charIndex > 0) {
          setCurrentText((prev) => prev.slice(0, -1));
          setCharIndex((prev) => prev - 1);
        } else {
          setIsDeleting(false);
          setRoleIndex((prev) => (prev + 1) % roles.length);
          return;
        }
      }
    };

    const timer = setTimeout(handleTyping, isDeleting ? 45 : 85);
    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, roleIndex]);

  return (
    <section id="Home" className="relative min-h-[88vh] sm:min-h-[92vh] flex items-center justify-center pt-20 sm:pt-28 pb-8 sm:pb-20 overflow-hidden">
      {/* Background radial ambient lights */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-60 sm:w-80 h-60 sm:h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-6 items-center">
        {/* Left Column: Bio & CTAs */}
        <div className="lg:col-span-7 flex flex-col items-start z-10 space-y-4 sm:space-y-6 text-left w-full min-w-0">
          {/* Status Pill */}
          <div className="inline-flex max-w-full items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 backdrop-blur-md shadow-sm">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] sm:text-xs font-mono text-slate-300 truncate">
              {personalInfo.status}
            </span>
          </div>

          {/* Heading Group */}
          <div className="space-y-0.5 sm:space-y-1">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              <span className="gradient-text">Welcome to</span>
            </h1>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              My Portofolio
            </h1>
          </div>

          {/* Typewriter Row */}
          <div className="flex items-center text-sm sm:text-lg md:text-xl lg:text-2xl font-mono text-sky-400 font-semibold min-h-[40px] sm:min-h-[36px]">
            <span className="break-words leading-tight">{currentText}</span>
            <span className="hero-typewriter-cursor shrink-0" />
          </div>

          {/* Narrative Story Description */}
          <p className="text-slate-300/90 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl font-normal">
            {personalInfo.bio}
          </p>

          {/* CTA Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2 w-full sm:w-auto">
            <a
              href="#Portofolio"
              onClick={() => playBeep?.(750)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-3 rounded-xl sm:rounded-full text-xs sm:text-sm font-semibold bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 active:scale-95 transition-all duration-200 text-center"
            >
              <span>Lihat Projek</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            <a
              href="#Contact"
              onClick={() => playBeep?.(650)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-3 rounded-xl sm:rounded-full text-xs sm:text-sm font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 active:scale-95 transition-all duration-200 shadow-md text-center"
            >
              <span>Hubungi Saya</span>
              <Send className="w-4 h-4 text-sky-400" />
            </a>
          </div>

          {/* Find Me & Social Links */}
          <div className="flex items-center gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-slate-800/80 w-full max-w-md">
            <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-slate-400">
              Find me
            </span>
            <div className="flex items-center gap-2.5">
              {personalInfo.socials.linkedin && (
                <a
                  href={personalInfo.socials.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  title="LinkedIn Steve Marvin"
                  onClick={() => playBeep?.(850)}
                  className="w-9 h-9 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-sky-950/60 hover:bg-sky-900/80 border border-sky-500/40 text-sky-400 hover:text-white hover:border-sky-400 hover:shadow-lg hover:shadow-sky-500/30 active:scale-90 transition-all"
                >
                  <LinkedInIcon className="w-4 h-4" />
                </a>
              )}

              {personalInfo.socials.instagram && (
                <a
                  href={personalInfo.socials.instagram}
                  target="_blank"
                  rel="noreferrer"
                  title="Instagram @stevedamnn"
                  onClick={() => playBeep?.(850)}
                  className="w-9 h-9 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-pink-950/40 hover:bg-pink-900/60 border border-pink-500/40 text-pink-400 hover:text-white hover:border-pink-400 hover:shadow-lg hover:shadow-pink-500/30 active:scale-90 transition-all"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: 3D Interactive Lanyard */}
        <div className="lg:col-span-5 relative flex items-center justify-center w-full">
          <div className="w-full relative">
            <div className="absolute inset-0 bg-gradient-to-b from-sky-500/10 via-purple-600/10 to-transparent rounded-3xl blur-2xl pointer-events-none" />
            <Lanyard
              frontImage="/assets/frontCard.png"
              backImage="/assets/backCard.png"
              strapImage="/assets/band.png"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
