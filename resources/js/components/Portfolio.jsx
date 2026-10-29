import React, { useState } from 'react';
import {
  Code,
  Layers,
  Award,
  FileCheck,
  ExternalLink,
  X,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { LinkedInIcon } from './Icons';
import confetti from 'canvas-confetti';
import {
  projectsData,
  skillsData,
  certificatesData,
  awardsData
} from '../data/portfolioData';

export default function Portfolio({ playBeep }) {
  const [activeTab, setActiveTab] = useState('projects');
  const [selectedProject, setSelectedProject] = useState(null);

  const tabs = [
    { id: 'projects', label: 'Projects', icon: Code, count: projectsData.length },
    { id: 'skills', label: 'Skills', icon: Layers, count: 18 },
    { id: 'certificates', label: 'Certificates', icon: FileCheck, count: certificatesData.length },
    { id: 'awards', label: 'Awards', icon: Award, count: awardsData.length },
  ];

  const handleOpenModal = (project) => {
    setSelectedProject(project);
    playBeep?.(850);
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#818cf8', '#c084fc']
      });
    } catch {}
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
    playBeep?.(400);
  };

  return (
    <section id="Portofolio" className="relative py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center space-y-2.5 sm:space-y-3 mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-xs font-mono text-indigo-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Karya & Kemampuan</span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
          Portofolio <span className="gradient-text">Aktivasi & Kampanye Brand</span>
        </h2>
        <p className="text-slate-400 text-xs sm:text-base max-w-2xl px-2">
          Koleksi aktivasi brand berskala nasional, strategi event management, serta program experiential marketing yang sukses menggerakkan interaksi konsumen.
        </p>
      </div>

      {/* Tab Controls */}
      <div className="flex justify-start sm:justify-center mb-8 sm:mb-10 overflow-x-auto max-w-full pb-2 scrollbar-none px-2 -mx-2">
        <div className="inline-flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-lg shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  playBeep?.(650);
                }}
                className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- Tab 1: PROJECTS VIEW --- */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {projectsData.map((project) => (
            <article
              key={project.id}
              onClick={() => handleOpenModal(project)}
              className="group relative rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-sky-500/50 p-5 flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-sky-500/10 backdrop-blur-md"
            >
              {/* Subtle top glow line */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-sky-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div>
                {/* Image Preview Container */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 mb-5 border border-slate-800/80 group-hover:border-sky-500/30 transition-colors">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  {/* Category Pill Tag */}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-sky-300">
                    {project.categoryLabel}
                  </div>
                </div>

                {/* Title & Desc */}
                <h3 className="text-xl font-bold text-white group-hover:text-sky-400 transition-colors mb-2">
                  {project.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4 line-clamp-3">
                  {project.shortDesc}
                </p>
              </div>

              {/* Bottom Tags & Button */}
              <div className="pt-4 border-t border-slate-800/80 space-y-4">
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.slice(0, 4).map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-800/90 text-slate-300 border border-slate-700/50"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 4 && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-800/50 text-slate-400">
                      +{project.tags.length - 4}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-sky-400 group-hover:text-cyan-300">
                  <span>Lihat Detail & Fitur</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* --- Tab 2: SKILLS VIEW --- */}
      {activeTab === 'skills' && (
        <div className="space-y-12 text-left">
          {skillsData.map((group, gIdx) => (
            <div key={gIdx} className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <span>{group.category}</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {group.skills.map((skill, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-sky-500/40 hover:bg-slate-850 transition-all duration-200 flex flex-col items-center text-center group"
                  >
                    <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                      {skill.icon}
                    </span>
                    <h4 className="text-sm font-semibold text-white group-hover:text-sky-400 transition-colors">
                      {skill.name}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                      {skill.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- Tab 3: CERTIFICATES VIEW --- */}
      {activeTab === 'certificates' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {certificatesData.map((cert) => (
            <div
              key={cert.id}
              className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <FileCheck className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">
                    {cert.year}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white mb-1">
                  {cert.title}
                </h4>
                <p className="text-xs font-semibold text-purple-400 mb-3">
                  {cert.issuer}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {cert.detail}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {cert.badge}
                </span>
                <span className="text-xs text-slate-400">Verified ID</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- Tab 4: AWARDS VIEW --- */}
      {activeTab === 'awards' && (
        <div className="max-w-2xl mx-auto text-left">
          {awardsData.map((award) => (
            <div
              key={award.id}
              className="p-8 rounded-3xl bg-gradient-to-tr from-slate-900/90 to-amber-950/20 border border-amber-500/30 shadow-xl flex flex-col sm:flex-row items-center gap-6"
            >
              <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Award className="w-10 h-10" />
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-amber-500/20 text-amber-300">
                  {award.badge} • {award.year}
                </div>
                <h4 className="text-xl font-bold text-white">
                  {award.title}
                </h4>
                <p className="text-xs font-semibold text-amber-400/90">
                  {award.event}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {award.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- PROJECT DETAIL MODAL --- */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={handleCloseModal}
        >
          <div
            className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto overscroll-contain rounded-2xl sm:rounded-3xl bg-slate-900 border border-sky-500/30 shadow-2xl p-4 sm:p-8 text-left space-y-4 sm:space-y-6"
            style={{ WebkitOverflowScrolling: 'touch' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 sm:top-5 sm:right-5 w-8 h-8 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-slate-950/90 border border-slate-700/80 text-white hover:bg-slate-800 active:scale-90 transition-all z-20 shadow-xl"
              aria-label="Tutup Detail Projek"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Image */}
            <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
              <img
                src={selectedProject.image}
                alt={selectedProject.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Header info */}
            <div>
              <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold">
                {selectedProject.category}
              </span>
              <h3 className="text-xl sm:text-3xl font-extrabold text-white mt-0.5 sm:mt-1 leading-snug">
                {selectedProject.title}
              </h3>
            </div>

            {/* Full description */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {selectedProject.longDesc}
            </p>

            {/* Feature Highlights */}
            {selectedProject.features && (
              <div className="space-y-1.5 sm:space-y-2">
                <h4 className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-slate-400">
                  Fitur Utama & Keunggulan
                </h4>
                <ul className="space-y-1 sm:space-y-1.5">
                  {selectedProject.features.map((feat, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs text-slate-300"
                    >
                      <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Focus & Key Skills */}
            <div className="space-y-1.5 sm:space-y-2">
              <h4 className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-slate-400">
                Fokus & Keahlian Utama
              </h4>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {selectedProject.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-mono bg-slate-800 text-sky-300 border border-slate-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Links */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-800">
              {/* Back to Main Page Button requested by user */}
              <button
                type="button"
                onClick={() => {
                  setSelectedProject(null);
                  playBeep?.(500);
                }}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 transition-all shadow-md active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 text-sky-400" />
                <span>Kembali ke Halaman Utama</span>
              </button>

              {/* LinkedIn Showcase Link */}
              <a
                href={selectedProject.demoUrl || "https://www.linkedin.com/in/steve-marvin-993aa7148?utm_source=share_via&utm_content=profile&utm_medium=member_android"}
                target="_blank"
                rel="noreferrer"
                onClick={() => playBeep?.(900)}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:brightness-110 text-white shadow-md shadow-sky-500/20 transition-all active:scale-95"
              >
                <LinkedInIcon className="w-4 h-4" />
                <span>Lihat di LinkedIn</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-80" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
