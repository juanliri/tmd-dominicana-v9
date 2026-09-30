import React from 'react';
import { 
  ArrowRight, 
  ChevronRight, 
  Truck, 
  Shield, 
  MapPin, 
  Phone, 
  Sparkles, 
  Calendar, 
  Wrench, 
  HardHat, 
  Mountain, 
  Layers, 
  Award, 
  Clock, 
  Radio, 
  CheckCircle2, 
  Zap,
  Cpu
} from 'lucide-react';
import { motion } from 'motion/react';
import { OFFICIAL_BRANDS, SHOWROOM_MARKETING_ASSETS } from '../../data/brandsData';
import { getUnifiedStoreMachinery } from '../../services/cdnCatalogLoader';

interface CategoryHubProps {
  onNavigate: (route: string) => void;
}

const HERO_STATS = [
  { value: '44+ EQUIPOS', label: 'Inventario Físico en Patio', icon: HardHat },
  { value: '10 MARCAS', label: 'Representación Oficial', icon: Sparkles },
  { value: '18 BAHÍAS', label: 'Taller Central 350 Bar', icon: Wrench },
  { value: '2 AÑOS', label: 'Garantía Directa de Fábrica', icon: Shield },
];

const SHOP_BY_CATEGORY = [
  {
    id: 'excavadoras',
    title: 'Excavadoras & Retroexcavadoras',
    subtitle: 'JCB 3CX Eco, 4CX, JS220 y LiuGong 922E HD',
    image: SHOWROOM_MARKETING_ASSETS.jcb.banner,
    count: 'DISPONIBILIDAD INMEDIATA',
    route: '#/machinery?category=Retroexcavadoras',
    tonnage: '8.5T - 22.0T',
    power: '74 - 173 HP',
    brandTag: 'JCB · LIUGONG'
  },
  {
    id: 'cargadores',
    title: 'Palas Cargadoras & Minería',
    subtitle: 'LiuGong 856T, 835T y Kubota SVL97-2 con balde de 1.8 a 3.5 m³',
    image: SHOWROOM_MARKETING_ASSETS.liugong.banner,
    count: 'ENTREGA 24 HORAS',
    route: '#/machinery?category=Cargadores',
    tonnage: '11.0T - 19.5T',
    power: '125 - 220 HP',
    brandTag: 'LIUGONG · KUBOTA'
  },
  {
    id: 'compactacion',
    title: 'Compactación & Rodillos Viales',
    subtitle: 'Ammann ASC 110, ARX 90 y ARS 220 con sistema ACE Pro',
    image: SHOWROOM_MARKETING_ASSETS.ammann.banner,
    count: 'HOMOLOGADO MOPC',
    route: '#/machinery?category=Compactación',
    tonnage: '9.0T - 22.0T',
    power: '100 - 160 HP',
    brandTag: 'AMMANN SUIZA'
  },
  {
    id: 'telescopicos',
    title: 'Manipuladores Telescópicos (Loadall)',
    subtitle: 'JCB 540-170 Loadall 17m y 510-56 para izaje de cargas en altura',
    image: '/assets/machinery/JCB_510-56.jpg',
    count: 'ALCANCE HASTA 17M',
    route: '#/machinery?category=Manipuladores',
    tonnage: '4.0T - 5.0T CARGA',
    power: '109 HP TURBO',
    brandTag: 'JCB LOADALL™'
  },
  {
    id: 'motoniveladoras',
    title: 'Motoniveladoras de Alta Precisión',
    subtitle: 'LiuGong 4180D y 4156M con vertedera de 3,960 mm y cabina ROPS/FOPS',
    image: SHOWROOM_MARKETING_ASSETS.showroomBanner,
    count: 'LICITACIÓN DGII/MOPC',
    route: '#/machinery?category=Motoniveladoras',
    tonnage: '15.5T - 18.0T',
    power: '180 - 215 HP',
    brandTag: 'LIUGONG HEAVY'
  },
  {
    id: 'tractores',
    title: 'Tractores Agrícolas & Municipales',
    subtitle: 'LS Tractor MT5 y U60 4WD con toma de fuerza independiente y pala frontal',
    image: SHOWROOM_MARKETING_ASSETS.lsTractor?.banner || SHOWROOM_MARKETING_ASSETS.showroomBanner,
    count: 'GARANTÍA EXTENDIDA',
    route: '#/machinery?category=Tractores',
    tonnage: '2.5T - 4.2T',
    power: '55 - 90 HP',
    brandTag: 'LS TRACTOR COREA'
  }
];

const USE_CASES = [
  { title: 'Construcción Vial & Asfalto', desc: 'Rodillos tándem, monocilíndricos y motoniveladoras MOPC', icon: Truck, route: '#/machinery?category=Compactación', tag: 'VIAL' },
  { title: 'Minería & Canteras Pesadas', desc: 'Excavadoras de cadenas 22T+ y palas cargadoras de alta roca', icon: Mountain, route: '#/machinery?category=Cargadores', tag: 'MINERÍA' },
  { title: 'Movimiento Masivo de Tierras', desc: 'Retroexcavadoras 4x4 y excavadoras hidráulicas con balde HD', icon: Layers, route: '#/machinery?category=Retroexcavadoras', tag: 'TERRÍGENO' },
  { title: 'Licitaciones Públicas & Alcaldías', desc: 'Pliegos homologados con NCF fiscal B01/B15 y entrega en patio', icon: Award, route: '#/tech-docs', tag: 'GOBIERNO' },
];

export const MachineryHubView: React.FC<CategoryHubProps> = ({ onNavigate }) => {
  const machinery = getUnifiedStoreMachinery();
  const totalEquipos = machinery.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* ─── CAD RETICLE SUB-HEADER ─── */}
      <div className="border-b border-slate-200/80 dark:border-white/[0.06] bg-slate-100/70 dark:bg-zinc-900/60 backdrop-blur-md">
        <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500 dark:text-zinc-400">
            <button onClick={() => onNavigate('#/home')} className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer">
              INICIO
            </button>
            <ChevronRight className="w-3 h-3 text-slate-400 dark:text-zinc-600" />
            <span className="text-slate-900 dark:text-white font-bold uppercase tracking-wider">
              SHOWROOM CENTRAL DE MAQUINARIA PESADA
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4 font-mono text-[10px] text-zinc-400">
            <span className="flex items-center gap-1.5 text-emerald-500 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {totalEquipos}+ UNIDADES REGISTRADAS
            </span>
            <span className="text-zinc-600">|</span>
            <span>AUTHO: DISTRIBUIDOR OFICIAL RD</span>
          </div>
        </div>
      </div>

      {/* ─── 1. HERO BANNER - 4K ULTRA-PHOTOREALISTIC CINEMATIC ─── */}
      <section className="relative overflow-hidden min-h-[480px] lg:min-h-[540px] flex items-center bg-zinc-950 text-white border-b border-white/10">
        <img
          src="/assets/images/tmd_machinery_hub_4k_cinematic.jpg"
          alt="TMD Dominicana Showroom Central Km 22"
          className="absolute inset-0 w-full h-full object-cover object-right md:object-center opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-zinc-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-16 sm:py-20 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-1 rounded-[3px] text-[10px] font-black uppercase tracking-wider bg-amber-400 text-black shadow-md font-mono">
                Catálogo Homologado 2026
              </span>
              <span className="px-2.5 py-1 rounded-[3px] text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1.5 animate-pulse" />
                Patio Físico Km 22 Duarte
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.08] tracking-tight font-display uppercase">
              Maquinaria Pesada
              <span className="block text-amber-400 mt-1">Certificada en República Dominicana</span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl font-sans">
              Representación oficial autorizada de <strong className="text-white">JCB, LiuGong, Ammann, LS Tractor y Kubota</strong> con garantía directa de fábrica, telemetría satelital en vivo y despacho inmediato a cualquier punto del territorio nacional.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button
                onClick={() => onNavigate('#/machinery')}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-[4px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-400/20 cursor-pointer active:scale-[0.98] font-mono"
              >
                <span>Acceder a Catálogo e Inventario ({totalEquipos} Equipos)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="https://wa.me/18095601234?text=Hola%20TMD,%20me%20interesa%20cotizar%20maquinaria%20pesada"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-[4px] bg-zinc-900/90 hover:bg-zinc-800 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer backdrop-blur-md active:scale-[0.98] font-mono"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Asesor Comercial Directo</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── 2. QUICK STATS BAR (CAD OBSIDIAN) ─── */}
      <section className="bg-white dark:bg-[#0c0c10] border-b border-slate-200/80 dark:border-white/[0.06]">
        <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {HERO_STATS.map((stat, idx) => {
              const StatIcon = stat.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3.5 rounded-[4px] bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 transition-colors"
                >
                  <div className="w-10 h-10 rounded-[4px] bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <StatIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono tracking-tight">
                      {stat.value}
                    </div>
                    <div className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 3. SHOP BY CATEGORY — HIGH-DENSITY CAD GRID ─── */}
      <section className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-12 lg:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono">
                Segmentación por Aplicación de Obra
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-display">
              Líneas de Maquinaria Pesada en Patio
            </h2>
          </div>
          <button
            onClick={() => onNavigate('#/machinery')}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline uppercase tracking-wider font-mono cursor-pointer"
          >
            <span>Ver Inventario Completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SHOP_BY_CATEGORY.map((cat, idx) => (
            <div
              key={cat.id}
              onClick={() => onNavigate(cat.route)}
              className="group relative overflow-hidden rounded-[6px] bg-white dark:bg-zinc-900/90 border border-slate-200/90 dark:border-zinc-800 hover:border-amber-400 dark:hover:border-amber-500/50 transition-all duration-300 text-left cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-lg"
            >
              {/* Image & Overlay */}
              <div className="relative h-48 overflow-hidden bg-zinc-950">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                
                {/* Brand Tag Top Left */}
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-[3px] text-[10px] font-mono font-black uppercase bg-zinc-950/80 text-amber-400 border border-amber-400/40 backdrop-blur-xs">
                  {cat.brandTag}
                </span>

                {/* Status Badge Top Right */}
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-[3px] text-[10px] font-mono font-black uppercase bg-black/70 text-white backdrop-blur-xs border border-white/10">
                  {cat.count}
                </span>

                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-base font-black uppercase tracking-wider text-white font-display">
                    {cat.title}
                  </h3>
                </div>
              </div>

              {/* Technical Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium leading-relaxed font-sans">
                    {cat.subtitle}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800 font-mono text-[10px]">
                    <div className="bg-slate-50 dark:bg-zinc-800/80 px-2 py-1.5 rounded-[3px] border border-slate-200/60 dark:border-zinc-700">
                      <span className="text-slate-400 dark:text-zinc-400 block uppercase">PESO OP:</span>
                      <strong className="text-slate-800 dark:text-zinc-200 font-bold">{cat.tonnage}</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-zinc-800/80 px-2 py-1.5 rounded-[3px] border border-slate-200/60 dark:border-zinc-700">
                      <span className="text-slate-400 dark:text-zinc-400 block uppercase">POTENCIA:</span>
                      <strong className="text-slate-800 dark:text-zinc-200 font-bold">{cat.power}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs font-mono font-bold text-amber-600 dark:text-amber-400 group-hover:underline">
                  <span>FILTRAR EN CATÁLOGO</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 4. EQUIPOS POR SECTOR (CAD CONSOLE) ─── */}
      <section className="bg-slate-100/60 dark:bg-zinc-950 border-y border-slate-200/80 dark:border-white/[0.06] py-12 lg:py-16">
        <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="mb-8">
            <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1 font-mono">
              Soluciones Sectoriales
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-display">
              Equipos de Alto Rendimiento por Industria
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {USE_CASES.map((uc, idx) => {
              const UCIcon = uc.icon;
              return (
                <div
                  key={idx}
                  onClick={() => onNavigate(uc.route)}
                  className="group p-5 rounded-[4px] bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800 hover:border-amber-400 dark:hover:border-amber-500/50 transition-all text-left cursor-pointer shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-[4px] bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <UCIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-[2px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 uppercase">
                        {uc.tag}
                      </span>
                    </div>

                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-display">
                      {uc.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 font-sans leading-relaxed">
                      {uc.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 group-hover:underline">
                    <span>EXPLORAR FLOTA</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 5. OFFICIAL BRANDS PAVILION ─── */}
      <section className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-12 lg:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1 font-mono">
              Representación Directa de Fábrica
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-display">
              Marcas Homologadas en República Dominicana
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {OFFICIAL_BRANDS.slice(0, 10).map((brand, idx) => (
            <button
              key={brand.id}
              onClick={() => onNavigate(`#/machinery?brand=${brand.id}`)}
              className="group p-4 rounded-[4px] bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800 hover:border-amber-400 dark:hover:border-amber-500/50 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate font-display uppercase">
                  {brand.name}
                </span>
                <span className="text-[8px] font-mono font-bold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-[2px]">
                  {brand.country}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1 font-sans">
                {brand.category}
              </p>
              <div className="flex items-center gap-1 mt-2 text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Ver inventario</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ─── 6. TRUST SIGNALS & SLA (CAD RETICLES) ─── */}
      <section className="bg-zinc-950 text-white border-t border-white/10">
        <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-mono font-black text-amber-400 uppercase tracking-widest block mb-1">
                Garantía & Respaldo Nacional
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-4 font-display">
                Infraestructura Postventa
                <span className="text-amber-400"> Km 22 Autopista Duarte</span>
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed font-sans">
                Distribuidores directos con 18 bahías industriales propias, banco de prueba dinamométrico de 350 Bar, stock permanente de más de 35,000 repuestos genuinos y auxilio mecánico 4x4 en obra a nivel nacional.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                  onClick={() => onNavigate('#/service')}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-[4px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer font-mono shadow-md"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Conocer Taller Central (18 Bahías)</span>
                </button>
                <button
                  onClick={() => onNavigate('#/emergency-dispatch')}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-[4px] bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold border border-zinc-700 transition-all cursor-pointer font-mono"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Auxilio Mecánico SOS 24/7</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Shield, label: '2 Años de Garantía', desc: 'Garantía oficial directa de fábrica' },
                { icon: Radio, label: 'Telemetría LiveLink™', desc: 'Monitoreo satelital GPS en vivo' },
                { icon: Clock, label: 'Respuesta < 2 Horas', desc: 'Despacho de emergencia en obra' },
                { icon: MapPin, label: 'Patio Central 15,000 m²', desc: 'Sede central Km 22 Autopista Duarte' },
              ].map((trust, idx) => {
                const TrustIcon = trust.icon;
                return (
                  <div key={idx} className="p-4 rounded-[4px] bg-zinc-900/90 border border-zinc-800">
                    <TrustIcon className="w-5 h-5 text-amber-400 mb-2" />
                    <div className="text-xs font-black uppercase text-white font-mono">{trust.label}</div>
                    <div className="text-[10px] text-zinc-400 mt-1 font-sans">{trust.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. FINAL CTA BANNER ─── */}
      <section className="bg-amber-400 border-t border-amber-500">
        <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[11px] font-mono font-black text-black uppercase tracking-wider block mb-1">
              Atención Inmediata & Facturación DGII
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight font-display">
              ¿Listo para adquirir o renovar tu equipo?
            </h3>
            <p className="text-xs sm:text-sm text-black/80 mt-1 font-sans font-medium">
              Emita su proforma oficial con NCF válido para DGII, financiamiento bancario y entrega inmediata en Km 22.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('#/machinery')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-[4px] bg-black text-amber-400 text-xs font-black uppercase tracking-wider hover:bg-zinc-900 transition-all cursor-pointer font-mono shadow-md"
            >
              <Calendar className="w-4 h-4" />
              <span>Ver Catálogo Completo</span>
            </button>
            <a
              href="https://wa.me/18095601234?text=Hola%20TMD,%20necesito%20cotizar%20maquinaria%20pesada%20para%20mi%20proyecto"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3.5 rounded-[4px] bg-black/10 hover:bg-black/20 text-black text-xs font-bold border border-black/20 transition-all cursor-pointer font-mono"
            >
              <Phone className="w-4 h-4" />
              <span>WhatsApp Directo</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
