import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ChevronRight, 
  ExternalLink, 
  CheckCircle2, 
  ArrowUpRight, 
  Sparkles, 
  Award, 
  Factory, 
  Globe2, 
  Wrench, 
  Layers, 
  FileText,
  Filter
} from 'lucide-react';
import { OFFICIAL_BRANDS, BrandInfo } from '../../data/brandsData';
import { BrandLogo } from '../common/BrandLogos';

interface DynamicOfficialBrandsShowcaseProps {
  onSelectBrandFilter: (brandName: string) => void;
  onNavigate: (route: string) => void;
  activeSelectedBrand?: string;
}

export const DynamicOfficialBrandsShowcase: React.FC<DynamicOfficialBrandsShowcaseProps> = ({
  onSelectBrandFilter,
  onNavigate,
  activeSelectedBrand = 'Todas'
}) => {
  const [activeBrand, setActiveBrand] = useState<BrandInfo>(OFFICIAL_BRANDS[0]);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  // Sync with parent filter if a specific brand is selected
  useEffect(() => {
    if (activeSelectedBrand && activeSelectedBrand !== 'Todas') {
      const found = OFFICIAL_BRANDS.find(
        (b) => b.name.toLowerCase() === activeSelectedBrand.toLowerCase() ||
               b.id.toLowerCase() === activeSelectedBrand.toLowerCase()
      );
      if (found) {
        setActiveBrand(found);
        setIsAutoPlaying(false);
      }
    }
  }, [activeSelectedBrand]);

  // Gentle auto-rotation between official brands every 6 seconds if not paused
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveBrand((prev) => {
        const currentIndex = OFFICIAL_BRANDS.findIndex((b) => b.id === prev.id);
        const nextIndex = (currentIndex + 1) % OFFICIAL_BRANDS.length;
        return OFFICIAL_BRANDS[nextIndex];
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleBrandClick = (brand: BrandInfo) => {
    setIsAutoPlaying(false);
    setActiveBrand(brand);
  };

  const handleApplyFilter = (brandName: string) => {
    onSelectBrandFilter(brandName);
    const catalogElement = document.getElementById('fleet-catalog-section');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section 
      id="official-brands-hub"
      className="w-full bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white border-y border-zinc-800/80 py-8 sm:py-12 transition-all relative overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Subtle ambient grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f59e0b08_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1780px] mx-auto relative z-10 space-y-6 sm:space-y-8">
        
        {/* Dynamic Header: Active Status Badge, Title & Direct Exclusivity Pill */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {/* Dynamic Live Status Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-[11px] font-black tracking-wide shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="uppercase">CONCESIONARIO OFICIAL EXCLUSIVO REPÚBLICA DOMINICANA</span>
                <span className="text-zinc-500">•</span>
                <span className="font-semibold text-zinc-300">Garantía Directa de Fábrica</span>
              </div>

              {/* Dominican Flag Badge */}
              <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-[10px] font-bold text-zinc-300 border border-zinc-700 flex items-center gap-1">
                <span>🇩🇴</span>
                <span>RD Sede Central Km 22</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
                <span>Distribución Oficial & Alianzas Exclusivas</span>
                <Award className="w-6 h-6 text-amber-500 hidden sm:inline" />
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl leading-relaxed">
              Representación directa de las marcas líderes mundiales en maquinaria pesada, transporte de materiales, compactación vial y motores diésel con stock físico garantizado en territorio dominicano.
            </p>
          </div>

          {/* Right Action: Verification & Link to Company Credibility */}
          <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
            <button
              onClick={() => onNavigate('#/about')}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Ver Credenciales & Staff</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Dynamic Interactive Brand Spotlight Hero Card */}
        <div className="p-5 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800/90 shadow-2xl relative overflow-hidden">
          {/* Accent glow corner & subtle banner watermark if available */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          {activeBrand.bannerImage && (
            <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-luminosity overflow-hidden">
              <img 
                src={activeBrand.bannerImage} 
                alt={`${activeBrand.name} Banner Watermark`} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-right"
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
            {/* Left Brand Spotlight Info */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-14 sm:h-16 px-4 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-inner">
                    <BrandLogo brandId={activeBrand.id} className="h-9 sm:h-11 max-w-[160px]" />
                  </div>
                  {activeBrand.technicalIcon && (
                    <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-amber-500/50 p-1 shrink-0 shadow-md" title="Emblema Técnico de Ingeniería">
                      <img 
                        src={activeBrand.technicalIcon} 
                        alt={`${activeBrand.name} Technical Emblem`} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-[11px] font-bold text-zinc-300 border border-zinc-700 flex items-center gap-1.5 inline-flex">
                    <Globe2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>{activeBrand.country}</span>
                  </span>
                  <div className="text-[10px] text-emerald-400 font-mono font-bold mt-1">
                    ● En Stock en Patio Km 22
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-black uppercase tracking-wider text-amber-500 mb-1 flex items-center gap-1.5">
                  <Factory className="w-3.5 h-3.5" />
                  <span>{activeBrand.category}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                  {activeBrand.name} — {activeBrand.tagline}
                </h3>
              </div>

              {/* Key Trust Checkmarks */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300 pt-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Garantía 2 Años / 2,000 Hrs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Repuestos 100% Genuinos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Soporte Móvil en Obra 24/7</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Financiamiento & Leasing NCF</span>
                </div>
              </div>
            </div>

            {/* Middle: Equipment Lines & Machinery Spotlight */}
            <div className="lg:col-span-5 lg:border-x lg:border-zinc-800/80 lg:px-6 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  <span>Líneas de Maquinaria Certificadas</span>
                </span>
                <span className="text-[10px] text-zinc-500">
                  Despacho Inmediato en RD
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeBrand.equipmentLines.map((line, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/90 text-xs font-semibold text-zinc-200 flex items-center gap-2 hover:border-amber-500/40 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="truncate">{line}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 flex items-center justify-between">
                <span>¿Buscas una configuración especial de fábrica?</span>
                <button
                  onClick={() => onNavigate('#/checkout')}
                  className="font-black text-amber-400 hover:text-white underline text-xs cursor-pointer"
                >
                  Cotizar Proforma →
                </button>
              </div>
            </div>

            {/* Right: Quick Action Controls */}
            <div className="lg:col-span-3 space-y-3 flex flex-col justify-center">
              <button
                type="button"
                onClick={() => handleApplyFilter(activeBrand.name)}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer group"
              >
                <Filter className="w-4 h-4 text-black group-hover:scale-110 transition-transform" />
                <span>Ver Equipos {activeBrand.name} en Catálogo</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('#/parts')}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-white font-bold text-xs border border-zinc-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                <span>Repuestos & Filtros {activeBrand.name}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('#/warranty')}
                className="w-full py-2 px-3 text-[11px] text-zinc-400 hover:text-white font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Consultar Garantía Oficial TMD</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Brand Switcher Carousel Ribbon */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
            <span className="font-bold uppercase tracking-wider text-[11px]">
              Selecciona una marca para interactuar:
            </span>
            <span className="text-[11px] text-zinc-500 hidden sm:inline">
              {isAutoPlaying ? '● Rotación automática activa (haz clic para fijar)' : '● Marca fijada'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {OFFICIAL_BRANDS.map((b) => {
              const isSelected = activeBrand.id === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => handleBrandClick(b)}
                  className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group text-center relative ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-amber-400 shadow-md ring-1 ring-amber-500/30'
                      : 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700 text-zinc-400 hover:text-white'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-zinc-900 animate-pulse" />
                  )}

                  <div className="h-8 flex items-center justify-center w-full px-1 relative">
                    <BrandLogo brandId={b.id} className="h-6 max-w-full group-hover:scale-105 transition-transform" />
                    {b.technicalIcon && (
                      <span className="absolute -top-1 -left-1 w-4 h-4 rounded-md overflow-hidden border border-amber-500/40 shadow-xs hidden sm:block">
                        <img 
                          src={b.technicalIcon} 
                          alt={`${b.name} icon`} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      </span>
                    )}
                  </div>

                  <div className="w-full">
                    <span className={`text-xs font-black block truncate ${isSelected ? 'text-amber-400' : 'text-zinc-300'}`}>
                      {b.name}
                    </span>
                    <span className="text-[10px] text-zinc-500 truncate block">
                      {b.country.split(' ')[0]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
