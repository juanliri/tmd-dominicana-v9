import React, { useState } from 'react';
import { 
  ArrowRight, 
  ChevronRight, 
  Search, 
  ShieldCheck, 
  Truck, 
  Clock, 
  Phone, 
  Sparkles, 
  FileText, 
  Layers, 
  Cog, 
  Filter, 
  CheckCircle2, 
  ExternalLink,
  Wrench,
  PackageCheck,
  Cpu
} from 'lucide-react';
import { motion } from 'motion/react';
import { OFFICIAL_BRANDS } from '../../data/brandsData';

interface PartsHubProps {
  onNavigate: (route: string) => void;
  onOpenVinModal?: () => void;
}

const PARTS_HERO_STATS = [
  { value: '+35,000', label: 'SKUs en Stock Km 22', icon: PackageCheck },
  { value: '24 Horas', label: 'Entrega a Todo el País', icon: Truck },
  { value: '100% OEM', label: 'Certificación Genuina', icon: ShieldCheck },
  { value: 'B01 / B15', label: 'Comprobante Fiscal NCF', icon: FileText },
];

const PARTS_CATEGORIES = [
  {
    id: 'filtros',
    name: 'Filtros & Mantenimiento Preventivo',
    subtitle: 'Aceite, combustible, aire primario/secundario y kits de 500h/1000h',
    badge: 'Alta Rotación',
    image: '/assets/machinery/clean_new_jcb_oem_diesel_fuel.jpg',
    count: '1,420+ ítems',
    route: '#/parts?category=Filtros',
    accent: 'from-amber-500/20 to-transparent'
  },
  {
    id: 'tren-rodaje',
    name: 'Tren de Rodaje & Orugas',
    subtitle: 'Zapatas, cadenas, rodillos inferiores/superiores y ruedas guía',
    badge: 'Servicio Pesado',
    image: '/assets/machinery/macro_view_of_steel_tracked_undercarriage.jpg',
    count: '890+ ítems',
    route: '#/parts?category=Tren%20de%20Rodaje',
    accent: 'from-blue-500/20 to-transparent'
  },
  {
    id: 'hidraulica',
    name: 'Sistemas Hidráulicos & Sellos',
    subtitle: 'Bombas principales, cilindros, distribuidores y kits de empaques OEM',
    badge: 'Presión Crítica',
    image: '/assets/machinery/automated_hydraulic_testing_bench_with_heavy.jpg',
    count: '650+ ítems',
    route: '#/parts?category=Hidráulica',
    accent: 'from-emerald-500/20 to-transparent'
  },
  {
    id: 'motor-diesel',
    name: 'Motor Diésel & Inyección',
    subtitle: 'Inyectores Common Rail, turbocompresores, camisas, pistones y culatas',
    badge: 'Garantía 1 Año',
    image: '/assets/machinery/cleanroom_high_pressure_diesel_fuel_injection.jpg',
    count: '1,100+ ítems',
    route: '#/parts?category=Motor',
    accent: 'from-red-500/20 to-transparent'
  },
  {
    id: 'desgaste-get',
    name: 'Herramientas de Corte & GET',
    subtitle: 'Puntas de cucharón, cuchillas cantoneras, adaptadores y pernos de alta resistencia',
    badge: 'Acero Tratado',
    image: '/assets/machinery/JCB_Contractor_breakers.jpg',
    count: '430+ ítems',
    route: '#/parts?category=Desgaste',
    accent: 'from-orange-500/20 to-transparent'
  },
  {
    id: 'electrico',
    name: 'Sistema Eléctrico, Módulos & Sensores',
    subtitle: 'ECM/ECU, alternadores, motores de arranque, pantallas y sensores de presión',
    badge: 'Diagnóstico CAD',
    image: '/assets/machinery/technical_close_up_of_digital_hydraulic.jpg',
    count: '580+ ítems',
    route: '#/parts?category=Eléctrico',
    accent: 'from-purple-500/20 to-transparent'
  }
];

export const PartsHubView: React.FC<PartsHubProps> = ({ onNavigate, onOpenVinModal }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`#/parts?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      onNavigate('#/parts');
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* 1. BREADCRUMBS & TOP CONTEXT */}
      <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-3 border-b border-slate-200/80 dark:border-white/[0.06] text-xs font-semibold text-slate-500 dark:text-zinc-400 flex items-center gap-2">
        <button onClick={() => onNavigate('#/home')} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer">
          Inicio
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600" />
        <span className="text-slate-900 dark:text-white font-bold">Centro de Repuestos Genuinos & Filtros OEM</span>
      </div>

      {/* 2. HERO MARKETING BANNER WITH 4K LOGISTICS WAREHOUSE BACKGROUND */}
      <div className="relative overflow-hidden bg-zinc-950 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-white/10">
        {/* 4K Background Imagery with Ambient Dimming & Specular Gold Glow */}
        <img
          src="/assets/images/portal_bg_machinery_1790441100418.jpg"
          alt="TMD Dominicana Centro de Repuestos Genuinos & Filtros OEM"
          className="absolute inset-0 w-full h-full object-cover object-right md:object-center opacity-85"
        />
        {/* Layered Vignettes for Perfect Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-black/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(245,158,11,0.18)_0%,transparent_60%)] pointer-events-none" />

        <div className="max-w-[1780px] mx-auto relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 backdrop-blur-md border border-amber-400/40 text-amber-400 text-xs font-black uppercase tracking-wider mb-4 shadow-lg shadow-amber-500/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Inventario Certificado Km 22 Autopista Duarte</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight font-display">
              Repuestos Genuinos OEM <br />
              <span className="text-amber-400">Despacho Inmediato en RD</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-zinc-200 leading-relaxed font-normal max-w-2xl font-sans">
              Más de 35,000 referencias directas de fábrica para JCB, LiuGong, Ammann, Kubota y Yanmar. 
              Despiece técnico por número de parte o chasis VIN con factura fiscal válida para DGII.
            </p>

            {/* Quick Search Form */}
            <form onSubmit={handleSearchSubmit} className="mt-8 flex flex-col sm:flex-row items-center gap-2 max-w-xl">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Número de parte (ej. 320/04133), filtro o modelo..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-zinc-400 text-xs sm:text-sm focus:outline-none focus:border-amber-400 focus:bg-white/15 transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Buscar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Fast Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {onOpenVinModal && (
                <button
                  onClick={onOpenVinModal}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/10 text-xs font-bold text-white transition-all cursor-pointer"
                >
                  <Cpu className="w-3.5 h-3.5 text-amber-400" />
                  <span>Despiece Técnico por Chasis / VIN</span>
                </button>
              )}
              <a
                href="https://wa.me/18095601234?text=Hola%20TMD,%20necesito%20cotizar%20un%20repuesto%20específico"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold text-emerald-400 transition-all cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Consultar por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 3. QUICK STATS STRIP */}
      <div className="border-b border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-[#0c0c10]">
        <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {PARTS_HERO_STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="flex items-center gap-3 p-3.5 rounded-[4px] bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800">
                <div className="p-2.5 rounded-[4px] bg-amber-400/10 text-amber-600 dark:text-amber-400 shrink-0 border border-amber-500/20">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-none font-mono">
                    {stat.value}
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 mt-1 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. SHOP BY CATEGORY GRID */}
      <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1 font-mono">
              Catálogo de Mantenimiento & Desgaste
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 dark:text-white font-display">
              Explorar por Categoría de Repuesto
            </h2>
          </div>
          <button
            onClick={() => onNavigate('#/parts')}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 hover:underline cursor-pointer font-mono"
          >
            <span>Ver Catálogo Completo (35K+ Ítems)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PARTS_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate(cat.route)}
              className="group rounded-[6px] bg-white dark:bg-zinc-900/90 border border-slate-200/90 dark:border-zinc-800 hover:border-amber-400 dark:hover:border-amber-500/50 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="relative h-48 overflow-hidden bg-zinc-950">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.accent} via-black/40 to-transparent`} />
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-0.5 rounded-[3px] bg-black/70 backdrop-blur-xs border border-white/20 text-[10px] font-mono font-black uppercase tracking-wider text-white">
                    {cat.badge}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="px-2 py-0.5 rounded-[3px] bg-amber-400 text-black text-[10px] font-mono font-black uppercase">
                    {cat.count}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors font-display uppercase tracking-wide">
                    {cat.name}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
                    {cat.subtitle}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-zinc-300">Consultar modelos</span>
                  <div className="p-1.5 rounded-[3px] bg-slate-100 dark:bg-zinc-800 group-hover:bg-amber-400 group-hover:text-black transition-all">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. BRAND DIRECTORY SELECTOR */}
      <div className="border-t border-slate-200/80 dark:border-white/[0.06] bg-slate-100/60 dark:bg-zinc-950 py-12">
        <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Fabricantes OEM Oficiales
            </span>
            <h3 className="text-xl sm:text-2xl font-black uppercase text-slate-900 dark:text-white mt-1">
              Repuestos por Marca de Maquinaria
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2">
              Líneas completas con trazabilidad directa de ensamblaje para su flota en República Dominicana.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {OFFICIAL_BRANDS.slice(0, 10).map((brand) => (
              <button
                key={brand.id}
                onClick={() => onNavigate(`#/parts?brand=${brand.id}`)}
                className="p-4 rounded-[4px] bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 hover:border-amber-400 text-left transition-all group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 font-display uppercase">
                    {brand.name}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-zinc-500">
                    {brand.country}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400 line-clamp-1 font-sans">
                  {brand.category}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 6. BOTTOM TRUST & CTA BANNER */}
      <div className="bg-amber-400 border-t border-amber-500 text-black py-10 px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="max-w-[1780px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight font-display">
              ¿Requieres Asistencia Técnica para Identificar tu Repuesto?
            </h3>
            <p className="text-xs sm:text-sm text-black/80 font-medium mt-1 font-sans">
              Envía la foto de la placa de tu máquina o el número de serie por WhatsApp a nuestros ingenieros en Km 22.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://wa.me/18095601234?text=Hola%20TMD,%20tengo%20foto%20de%20la%20placa%20de%20mi%20maquina%20para%20un%20repuesto"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-[4px] bg-black hover:bg-zinc-900 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg font-mono"
            >
              Contactar Asesor de Repuestos
            </a>
            <button
              onClick={() => onNavigate('#/parts')}
              className="px-6 py-3.5 rounded-[4px] bg-black/10 hover:bg-black/20 text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer font-mono border border-black/20"
            >
              Ver Catálogo Online
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
