import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  Layers, 
  ArrowRight, 
  Compass, 
  Award, 
  Activity,
  HardHat,
  Play,
  Video
} from 'lucide-react';
import { SHOWROOM_MARKETING_ASSETS } from '../../data/brandsData';

interface BrandShowroomMarketingBannerProps {
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  onSelectCategory?: (category: string) => void;
}

export const BrandShowroomMarketingBanner: React.FC<BrandShowroomMarketingBannerProps> = ({
  selectedBrand,
  onSelectBrand,
  onSelectCategory
}) => {
  const normBrand = selectedBrand.toLowerCase();
  const isJcb = normBrand === 'jcb';
  const isLiuGong = normBrand === 'liugong';
  const isAmmann = normBrand === 'ammann';
  const isLsTractor = normBrand === 'ls tractor' || normBrand === 'ls-tractor';
  const isKubota = normBrand === 'kubota' || normBrand === 'escorts kubota';
  const isAfex = normBrand === 'afex';
  const isImer = normBrand === 'imer';
  const isGeneral = !isJcb && !isLiuGong && !isAmmann && !isLsTractor && !isKubota && !isAfex && !isImer;

  const handleScrollToVideo = () => {
    const el = document.getElementById('dominican-videos-section') || document.getElementById('patio-km22-video-showcase');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="showroom-marketing-banner" className="mb-6 rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 bg-zinc-950 shadow-xl relative transition-all">
      {/* Top Brand Category Tabs */}
      <div className="bg-zinc-900/90 border-b border-zinc-800/80 px-4 py-2.5 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onSelectBrand('Todas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              isGeneral
                ? 'bg-amber-500 text-black shadow-xs'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Pabellón General TMD</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectBrand('JCB')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              isJcb
                ? 'bg-amber-500 text-black shadow-xs'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>JCB</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectBrand('LiuGong')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              isLiuGong
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-blue-400 hover:bg-zinc-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>LiuGong</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectBrand('Ammann')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              isAmmann
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>Ammann Suizo</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectBrand('LS Tractor')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              isLsTractor
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-sky-400 hover:bg-zinc-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>LS Tractor</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectBrand('Escorts Kubota')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              isKubota
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-teal-400 hover:bg-zinc-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <span>Kubota</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectBrand('AFEX')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              isAfex
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-red-400 hover:bg-zinc-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span>AFEX Minería</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectBrand('IMER')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              isImer
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>IMER Concreto</span>
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleScrollToVideo}
            className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 hover:text-amber-300 text-xs font-black border border-amber-500/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Ver video del patio de pruebas en Autopista Duarte Km 22"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Video Patio Km 22</span>
          </button>
        </div>
      </div>

      {/* JCB Active Banner View */}
      {isJcb && (
        <div className="relative min-h-[260px] sm:min-h-[290px] flex items-center overflow-hidden">
          {/* Background Marketing Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src={SHOWROOM_MARKETING_ASSETS.jcb.banner} 
              alt="JCB Machinery Fleet Marketing Banner" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter brightness-[0.45] saturate-[1.2] transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/40" />
          </div>

          {/* Banner Content */}
          <div className="relative z-10 p-5 sm:p-7 w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider shadow-sm">
                  <Zap className="w-3 h-3 fill-current" />
                  Concesionario Oficial JCB en RD
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-900/80 text-zinc-300 text-[10px] font-bold border border-zinc-700/70">
                  Tecnología Británica 🇬🇧
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/40">
                  ● Stock Disponible en Patio
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* 3D Technical Icon Badge */}
                <div className="relative shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-500/80 shadow-lg shadow-amber-500/20 bg-zinc-900 p-1">
                    <img 
                      src={SHOWROOM_MARKETING_ASSETS.jcb.technicalIcon} 
                      alt="JCB Engineering Technical Icon" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-amber-500 text-black text-[9px] font-black rounded-md shadow-xs">
                    OEM
                  </div>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
                    {SHOWROOM_MARKETING_ASSETS.jcb.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-1 line-clamp-2 leading-relaxed">
                    {SHOWROOM_MARKETING_ASSETS.jcb.subtitle}
                  </p>
                </div>
              </div>

              {/* Stats Highlights */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-1 max-w-lg">
                {SHOWROOM_MARKETING_ASSETS.jcb.stats.map((s, idx) => (
                  <div key={idx} className="p-2 sm:p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-xs">
                    <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">{s.label}</div>
                    <div className="text-xs sm:text-sm font-black text-amber-400 mt-0.5">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Filter Direct Buttons */}
            <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
                Familias JCB Recomendadas:
              </span>
              <button
                type="button"
                onClick={() => onSelectCategory && onSelectCategory('Retroexcavadoras')}
                className="px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-amber-500 hover:text-black text-zinc-200 border border-zinc-700/80 text-xs font-bold transition-all flex items-center justify-between gap-3 cursor-pointer group"
              >
                <span>Retroexcavadoras (3CX / 4CX)</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-500 group-hover:text-black transition-colors" />
              </button>
              <button
                type="button"
                onClick={() => onSelectCategory && onSelectCategory('Excavadoras')}
                className="px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-amber-500 hover:text-black text-zinc-200 border border-zinc-700/80 text-xs font-bold transition-all flex items-center justify-between gap-3 cursor-pointer group"
              >
                <span>Excavadoras de Oruga (JS220)</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-500 group-hover:text-black transition-colors" />
              </button>
              <button
                type="button"
                onClick={() => onSelectCategory && onSelectCategory('Manipuladores')}
                className="px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-amber-500 hover:text-black text-zinc-200 border border-zinc-700/80 text-xs font-bold transition-all flex items-center justify-between gap-3 cursor-pointer group"
              >
                <span>Manipuladores Loadall (540-170)</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-500 group-hover:text-black transition-colors" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LiuGong Active Banner View */}
      {isLiuGong && (
        <div className="relative min-h-[260px] sm:min-h-[290px] flex items-center overflow-hidden">
          {/* Background Marketing Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src={SHOWROOM_MARKETING_ASSETS.liugong.banner} 
              alt="LiuGong Heavy Mining Fleet Marketing Banner" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter brightness-[0.45] saturate-[1.2] transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/40" />
          </div>

          {/* Banner Content */}
          <div className="relative z-10 p-5 sm:p-7 w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                  <ShieldCheck className="w-3 h-3 fill-current" />
                  Distribuidor Oficial LiuGong en RD
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-900/80 text-zinc-300 text-[10px] font-bold border border-zinc-700/70">
                  Ingeniería Pesada Global 🌐
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/40">
                  ● Stock Inmediato para Canteras & Minería
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* 3D Technical Icon Badge */}
                <div className="relative shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-orange-500/80 shadow-lg shadow-orange-500/20 bg-zinc-900 p-1">
                    <img 
                      src={SHOWROOM_MARKETING_ASSETS.liugong.technicalIcon} 
                      alt="LiuGong Articulated Engineering Technical Icon" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-orange-600 text-white text-[9px] font-black rounded-md shadow-xs">
                    HEAVY
                  </div>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
                    {SHOWROOM_MARKETING_ASSETS.liugong.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-1 line-clamp-2 leading-relaxed">
                    {SHOWROOM_MARKETING_ASSETS.liugong.subtitle}
                  </p>
                </div>
              </div>

              {/* Stats Highlights */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-1 max-w-lg">
                {SHOWROOM_MARKETING_ASSETS.liugong.stats.map((s, idx) => (
                  <div key={idx} className="p-2 sm:p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-xs">
                    <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">{s.label}</div>
                    <div className="text-xs sm:text-sm font-black text-orange-400 mt-0.5">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Filter Direct Buttons */}
            <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
                Familias LiuGong Destacadas:
              </span>
              <button
                type="button"
                onClick={() => onSelectCategory && onSelectCategory('Palas')}
                className="px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-orange-600 hover:text-white text-zinc-200 border border-zinc-700/80 text-xs font-bold transition-all flex items-center justify-between gap-3 cursor-pointer group"
              >
                <span>Palas Cargadoras (856H Max)</span>
                <ArrowRight className="w-3.5 h-3.5 text-orange-400 group-hover:text-white transition-colors" />
              </button>
              <button
                type="button"
                onClick={() => onSelectCategory && onSelectCategory('Excavadoras')}
                className="px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-orange-600 hover:text-white text-zinc-200 border border-zinc-700/80 text-xs font-bold transition-all flex items-center justify-between gap-3 cursor-pointer group"
              >
                <span>Excavadoras Pesadas (922E / 936E)</span>
                <ArrowRight className="w-3.5 h-3.5 text-orange-400 group-hover:text-white transition-colors" />
              </button>
              <button
                type="button"
                onClick={() => onSelectCategory && onSelectCategory('Vial')}
                className="px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-orange-600 hover:text-white text-zinc-200 border border-zinc-700/80 text-xs font-bold transition-all flex items-center justify-between gap-3 cursor-pointer group"
              >
                <span>Motoniveladoras & Rodillos</span>
                <ArrowRight className="w-3.5 h-3.5 text-orange-400 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ammann Active Banner View */}
      {isAmmann && (
        <div className="relative min-h-[260px] sm:min-h-[290px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src={SHOWROOM_MARKETING_ASSETS.ammann.banner} 
              alt="Ammann Compaction Machinery Banner" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter brightness-[0.45] saturate-[1.2] transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/40" />
          </div>

          <div className="relative z-10 p-5 sm:p-7 w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                  <Zap className="w-3 h-3 fill-current" />
                  Distribuidor Ammann Suiza en RD
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-900/80 text-zinc-300 text-[10px] font-bold border border-zinc-700/70">
                  Compactación Inteligente ACE 🇨🇭
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/40">
                  ● Entrega Inmediata Km 22
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-rose-500/80 shadow-lg shadow-rose-500/20 bg-zinc-900 p-1">
                    <img 
                      src={SHOWROOM_MARKETING_ASSETS.ammann.technicalIcon} 
                      alt="Ammann Engineering Technical Icon" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-rose-600 text-white text-[9px] font-black rounded-md shadow-xs">
                    SWISS
                  </div>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
                    {SHOWROOM_MARKETING_ASSETS.ammann.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-1 line-clamp-2 leading-relaxed">
                    {SHOWROOM_MARKETING_ASSETS.ammann.subtitle}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-1 max-w-lg">
                {SHOWROOM_MARKETING_ASSETS.ammann.stats.map((s, idx) => (
                  <div key={idx} className="p-2 sm:p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-xs">
                    <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">{s.label}</div>
                    <div className="text-xs sm:text-sm font-black text-rose-400 mt-0.5">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
                Familias Ammann:
              </span>
              <button
                type="button"
                onClick={() => onSelectCategory && onSelectCategory('Compactación')}
                className="px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-rose-600 hover:text-white text-zinc-200 border border-zinc-700/80 text-xs font-bold transition-all flex items-center justify-between gap-3 cursor-pointer group"
              >
                <span>Rodillos Monotambor (ASC 110)</span>
                <ArrowRight className="w-3.5 h-3.5 text-rose-400 group-hover:text-white transition-colors" />
              </button>
              <button
                type="button"
                onClick={() => onSelectCategory && onSelectCategory('Pavimentación')}
                className="px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-rose-600 hover:text-white text-zinc-200 border border-zinc-700/80 text-xs font-bold transition-all flex items-center justify-between gap-3 cursor-pointer group"
              >
                <span>Tándem de Asfalto & Placas</span>
                <ArrowRight className="w-3.5 h-3.5 text-rose-400 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LS Tractor Active Banner View */}
      {isLsTractor && (
        <div className="relative min-h-[260px] sm:min-h-[290px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src={SHOWROOM_MARKETING_ASSETS.lsTractor.banner} 
              alt="LS Tractor Agricultural Banner" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter brightness-[0.45] saturate-[1.2] transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/40" />
          </div>

          <div className="relative z-10 p-5 sm:p-7 w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                  <Zap className="w-3 h-3 fill-current" />
                  Concesionario LS Tractor en RD
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-900/80 text-zinc-300 text-[10px] font-bold border border-zinc-700/70">
                  Tecnología Surcoreana 🇰🇷
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/40">
                  ● 3 Años Garantía Oficial
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-sky-500/80 shadow-lg shadow-sky-500/20 bg-zinc-900 p-1">
                    <img 
                      src={SHOWROOM_MARKETING_ASSETS.lsTractor.technicalIcon} 
                      alt="LS Tractor Technical Icon" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-sky-600 text-white text-[9px] font-black rounded-md shadow-xs">
                    4WD
                  </div>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
                    {SHOWROOM_MARKETING_ASSETS.lsTractor.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-1 line-clamp-2 leading-relaxed">
                    {SHOWROOM_MARKETING_ASSETS.lsTractor.subtitle}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-1 max-w-lg">
                {SHOWROOM_MARKETING_ASSETS.lsTractor.stats.map((s, idx) => (
                  <div key={idx} className="p-2 sm:p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-xs">
                    <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">{s.label}</div>
                    <div className="text-xs sm:text-sm font-black text-sky-400 mt-0.5">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
                Líneas LS Tractor:
              </span>
              <button
                type="button"
                onClick={() => onSelectCategory && onSelectCategory('Agrícola')}
                className="px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-sky-600 hover:text-white text-zinc-200 border border-zinc-700/80 text-xs font-bold transition-all flex items-center justify-between gap-3 cursor-pointer group"
              >
                <span>Tractores Plus 80-100 HP</span>
                <ArrowRight className="w-3.5 h-3.5 text-sky-400 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Escorts Kubota Active Banner View */}
      {isKubota && (
        <div className="relative min-h-[260px] sm:min-h-[290px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src={SHOWROOM_MARKETING_ASSETS.kubota.banner} 
              alt="Kubota Escorts Machinery Banner" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter brightness-[0.45] saturate-[1.2] transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/40" />
          </div>

          <div className="relative z-10 p-5 sm:p-7 w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                  <Zap className="w-3 h-3 fill-current" />
                  Escorts Kubota en RD
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-900/80 text-zinc-300 text-[10px] font-bold border border-zinc-700/70">
                  Ingeniería Japonesa 🇯🇵
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-teal-500/80 shadow-lg shadow-teal-500/20 bg-zinc-900 p-1">
                    <img 
                      src={SHOWROOM_MARKETING_ASSETS.kubota.technicalIcon} 
                      alt="Kubota Technical Icon" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-teal-600 text-white text-[9px] font-black rounded-md shadow-xs">
                    DIESEL
                  </div>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
                    {SHOWROOM_MARKETING_ASSETS.kubota.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-1 line-clamp-2 leading-relaxed">
                    {SHOWROOM_MARKETING_ASSETS.kubota.subtitle}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-1 max-w-lg">
                {SHOWROOM_MARKETING_ASSETS.kubota.stats.map((s, idx) => (
                  <div key={idx} className="p-2 sm:p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-xs">
                    <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">{s.label}</div>
                    <div className="text-xs sm:text-sm font-black text-teal-400 mt-0.5">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AFEX Active Banner View */}
      {isAfex && (
        <div className="relative min-h-[260px] sm:min-h-[290px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src={SHOWROOM_MARKETING_ASSETS.afex.banner} 
              alt="AFEX Fire Suppression Banner" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter brightness-[0.45] saturate-[1.2] transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/40" />
          </div>

          <div className="relative z-10 p-5 sm:p-7 w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                  <ShieldCheck className="w-3 h-3 fill-current" />
                  Sistemas AFEX Oficial en RD
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-900/80 text-zinc-300 text-[10px] font-bold border border-zinc-700/70">
                  Protección Minera Certificada 🇺🇸
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-red-500/80 shadow-lg shadow-red-500/20 bg-zinc-900 p-1">
                    <img 
                      src={SHOWROOM_MARKETING_ASSETS.afex.technicalIcon} 
                      alt="AFEX Technical Icon" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-black rounded-md shadow-xs">
                    FIRE
                  </div>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
                    {SHOWROOM_MARKETING_ASSETS.afex.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-1 line-clamp-2 leading-relaxed">
                    {SHOWROOM_MARKETING_ASSETS.afex.subtitle}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-1 max-w-lg">
                {SHOWROOM_MARKETING_ASSETS.afex.stats.map((s, idx) => (
                  <div key={idx} className="p-2 sm:p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-xs">
                    <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">{s.label}</div>
                    <div className="text-xs sm:text-sm font-black text-red-400 mt-0.5">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IMER Active Banner View */}
      {isImer && (
        <div className="relative min-h-[260px] sm:min-h-[290px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src={SHOWROOM_MARKETING_ASSETS.imer.banner} 
              alt="IMER Concrete Banner" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter brightness-[0.45] saturate-[1.2] transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/40" />
          </div>

          <div className="relative z-10 p-5 sm:p-7 w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                  <Zap className="w-3 h-3 fill-current" />
                  IMER Concrete Italia en RD
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-900/80 text-zinc-300 text-[10px] font-bold border border-zinc-700/70">
                  Mixers & Plantas de Hormigón 🇮🇹
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-emerald-500/80 shadow-lg shadow-emerald-500/20 bg-zinc-900 p-1">
                    <img 
                      src={SHOWROOM_MARKETING_ASSETS.imer.technicalIcon} 
                      alt="IMER Technical Icon" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-black rounded-md shadow-xs">
                    MIXER
                  </div>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
                    {SHOWROOM_MARKETING_ASSETS.imer.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-1 line-clamp-2 leading-relaxed">
                    {SHOWROOM_MARKETING_ASSETS.imer.subtitle}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-1 max-w-lg">
                {SHOWROOM_MARKETING_ASSETS.imer.stats.map((s, idx) => (
                  <div key={idx} className="p-2 sm:p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-xs">
                    <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">{s.label}</div>
                    <div className="text-xs sm:text-sm font-black text-emerald-400 mt-0.5">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Default Showroom Pavilion Overview View ('Todas') */}
      {isGeneral && (
        <div className="relative min-h-[260px] sm:min-h-[290px] flex items-center overflow-hidden">
          {/* Background Marketing Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src={SHOWROOM_MARKETING_ASSETS.showroomBanner} 
              alt="TMD Heavy Machinery Architectural Showroom Pavilion" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter brightness-[0.4] saturate-[1.15] transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/50" />
          </div>

          {/* Banner Content */}
          <div className="relative z-10 p-5 sm:p-7 w-full flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider border border-amber-500/40">
                  <Sparkles className="w-3 h-3" />
                  Showroom Principal & Patio Demostración Km 22
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-900/80 text-zinc-300 text-[10px] font-bold border border-zinc-700/70">
                  Garantía Oficial TMD 2026
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
                  Flota Certificada de Maquinaria Pesada en República Dominicana
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 mt-1.5 leading-relaxed">
                  Equipos de construcción, minería, compactación vial y agricultura con respaldo total de repuestos originales, telemetría y técnicos certificados.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-zinc-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Inspección técnica pre-entrega</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Entrega en todo el país</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pruebas en patio dinámico</span>
                </div>
              </div>
            </div>

            {/* Dual Featured Cards for JCB and LiuGong */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0 lg:max-w-md w-full">
              {/* JCB Mini Card */}
              <div 
                onClick={() => onSelectBrand('JCB')}
                className="p-3.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-amber-500/60 transition-all cursor-pointer group flex items-center gap-3 shadow-md"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-500/50 bg-zinc-950 shrink-0 p-0.5">
                  <img 
                    src={SHOWROOM_MARKETING_ASSETS.jcb.technicalIcon} 
                    alt="JCB Icon" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-400 group-hover:text-amber-300">JCB Oficial</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <span className="text-[11px] text-zinc-300 font-medium block truncate">3CX, JS220 & Loadall</span>
                  <span className="text-[10px] text-zinc-500 block">Tecnología LiveLink™</span>
                </div>
              </div>

              {/* LiuGong Mini Card */}
              <div 
                onClick={() => onSelectBrand('LiuGong')}
                className="p-3.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-orange-500/60 transition-all cursor-pointer group flex items-center gap-3 shadow-md"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-orange-500/50 bg-zinc-950 shrink-0 p-0.5">
                  <img 
                    src={SHOWROOM_MARKETING_ASSETS.liugong.technicalIcon} 
                    alt="LiuGong Icon" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-orange-400 group-hover:text-orange-300">LiuGong Pesada</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <span className="text-[11px] text-zinc-300 font-medium block truncate">856H Max & 922E/936E</span>
                  <span className="text-[10px] text-zinc-500 block">Cummins + ZF</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
