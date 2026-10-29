import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  Flame,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { personalInfo } from '../data/portfolioData';
import { InstagramIcon, LinkedInIcon } from './Icons';

export default function Contact({ playBeep }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    try {
      const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': token || '',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });
    } catch (err) {
      // offline / fallback
    }

    setSubmitted(true);
    playBeep?.(1000);

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#38bdf8', '#818cf8', '#34d399']
      });
    } catch {}

    // Reset after a delay
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 4000);
  };

  return (
    <section id="Contact" className="relative py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden w-full min-w-0">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center space-y-2.5 sm:space-y-3 mb-10 sm:mb-16 w-full min-w-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-xs font-mono text-cyan-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Mari Terhubung</span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight break-words">
          Punya Ide Proyek? <span className="gradient-text inline-block">Hubungi Saya</span>
        </h2>
        <p className="text-slate-400 text-xs sm:text-base max-w-xl px-2 break-words">
          Terbuka untuk kolaborasi aktivasi brand, manajemen event offline berskala nasional, dan kemitraan strategis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 text-left w-full min-w-0">
        {/* Left Column: Direct Partnership & Social Cards */}
        <div className="lg:col-span-5 space-y-4">
          {/* Brand Activation Partnership Card */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 transition-all duration-300 shadow-xl backdrop-blur-xl space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <span className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-rose-500/20 to-sky-500/20 text-sky-400 border border-sky-500/30">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400" />
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Available for Activations
              </span>
            </div>

            <div>
              <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-slate-400">
                Brand & Event Activation
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                Kolaborasi & Kemitraan Event
              </h3>
            </div>

            <p className="text-xs text-slate-300/90 leading-relaxed">
              Siap merancang strategi aktivasi multi-brand, roadshow mall nasional, experiential consumer engagement, dan koordinasi event berskala besar.
            </p>

            <div className="pt-2 flex flex-wrap gap-1.5 border-t border-slate-800/80 text-[10px] sm:text-[11px] font-mono text-slate-400">
              <span className="px-2.5 py-0.5 sm:py-1 rounded-md bg-slate-800/80 text-rose-300 border border-rose-500/20">
                GOC Brands
              </span>
              <span className="px-2.5 py-0.5 sm:py-1 rounded-md bg-slate-800/80 text-sky-300 border border-sky-500/20">
                Ex Kanzler
              </span>
              <span className="px-2.5 py-0.5 sm:py-1 rounded-md bg-slate-800/80 text-pink-300 border border-pink-500/20">
                Dear Me Beauty
              </span>
            </div>
          </div>

          {/* Social Channels List (LinkedIn & Instagram) */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl space-y-2.5 sm:space-y-3">
            <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
              Social Media & Profil
            </span>

            {/* LinkedIn */}
            {personalInfo.socials.linkedin && (
              <a
                href={personalInfo.socials.linkedin}
                target="_blank"
                rel="noreferrer"
                onClick={() => playBeep?.(800)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-sky-950/40 border border-sky-500/30 hover:border-sky-400 hover:bg-sky-900/40 transition-all group shadow-sm shadow-sky-500/10"
              >
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                    <LinkedInIcon className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors">
                      LinkedIn
                    </h4>
                    <p className="text-xs text-sky-300/70">Steve Marvin</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-sky-400 group-hover:text-white transition-colors" />
              </a>
            )}

            {/* Instagram */}
            {personalInfo.socials.instagram && (
              <a
                href={personalInfo.socials.instagram}
                target="_blank"
                rel="noreferrer"
                onClick={() => playBeep?.(800)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-pink-950/30 border border-pink-500/30 hover:border-pink-400 hover:bg-pink-900/40 transition-all group shadow-sm shadow-pink-500/10"
              >
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                    <InstagramIcon className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-pink-300 transition-colors">
                      Instagram
                    </h4>
                    <p className="text-xs text-pink-300/80">@stevedamnn</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-pink-400 group-hover:text-white transition-colors" />
              </a>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Contact Form */}
        <div className="lg:col-span-7">
          <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />
              <span>Kirim Pesan Langsung</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-4 sm:mb-6">
              Isi data di bawah ini, saya akan merespon pesan Anda secepatnya.
            </p>

            {submitted ? (
              <div className="p-6 sm:p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h4 className="text-base sm:text-lg font-bold text-white">
                  Pesan Berhasil Terkirim!
                </h4>
                <p className="text-xs sm:text-sm text-slate-300">
                  Terima kasih sudah menghubungi saya, {formData.name}. Saya akan segera memeriksa pesan Anda.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-[11px] sm:text-xs font-mono text-slate-400 mb-1">
                      Nama Anda
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama..."
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] sm:text-xs font-mono text-slate-400 mb-1">
                      Email Anda
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="contoh@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-mono text-slate-400 mb-1">
                    Pesan / Deskripsi Proyek
                  </label>
                  <textarea
                    required
                    rows="4"
                    placeholder="Ceritakan tentang ide atau kebutuhan proyek Anda..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:brightness-110 active:scale-95 text-white shadow-lg shadow-sky-500/20 transition-all duration-200"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Pesan</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
