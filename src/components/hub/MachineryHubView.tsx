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
  Cog,
  Radio,
  Award,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { OFFICIAL_BRANDS, SHOWROOM_MARKETING_ASSETS } from '../../data/brandsData';

interface CategoryHubProps {
  onNavigate: (route: string) => void;
}

/* ─── Data ─── */

const HERO_STATS = [
  { value: '44+', label: 'Máquinas en Patio', icon: HardHat },
  { value: '10', label: 'Marcas Oficiales', icon: Sparkles },
  { value: '24/7', label: 'Taller Móvil SOS', icon: Wrench },
  { value: '2 AÑOS', label: 'Garantía Directa', icon: Shield },
];

const SHOP_BY_CATEGORY = [
  {
    id: 'excavadoras',
    title: 'Excavadoras & Retroexcavadoras',
    subtitle: 'JCB 3CX, 4CX, JS220 y LiuGong 922E',
    image: SHOWROOM_MARKETING_ASSETS.jcb.banner,
    count: '12 modelos',
    route: '#/machinery?category=Retroexcavadoras',
    accent: 'from-amber-500/20 to-transparent'
  },
  {
    id: 'cargadores',
    title: 'Palas Cargadoras & Minería',
    subtitle: 'LiuGong 856T, 835T y Kubota SVL97-2',
    image: SHOWROOM_MARKETING_ASSETS.liugong.banner,
    count: '8 modelos',
    route: '#/machinery?category=Cargadores',
    accent: 'from-emerald-500/20 to-transparent'
  },
  {
    id: 'compactacion',
    title: 'Compactación & Rodillos',
    subtitle: 'Ammann ASC 110, ARX 90 y ARS 220',
    image: SHOWROOM_MARKETING_ASSETS.ammann.banner,
    count: '6 modelos',
    route: '#/machinery?category=Compactación',
    accent: 'from-blue-500/20 to-transparent'
  },
  {
    id: 'telescopicos',
    title: 'Manipuladores Telescópicos',
    subtitle: 'JCB 540-170 Loadall 17m y 510-56',
    image: '/assets/machinery/JCB_510-56.jpg',
    count: '4 modelos',
    route: '#/machinery?category=Manipuladores',
    accent: 'from-indigo-500/20 to-transparent'
  },
  {
    id: 'motoniveladoras',
    title: 'Motoniveladoras Viales',
    subtitle: 'LiuGong 4180D MOPC y 4156M',
    image: SHOWROOM_MARKETING_ASSETS.showroomBanner,
    count: '3 modelos',
    route: '#/machinery?category=Motoniveladoras',
    accent: 'from-orange-500/20 to-transparent'
  },
  {
    id: 'tractores',
    title: 'Tractores & Agrícola',
    subtitle: 'LS Tractor MT5 y U60 para alcaldías',
    image: SHOWROOM_MARKETING_ASSETS.lsTractor?.banner || SHOWROOM_MARKETING_ASSETS.showroomBanner,
    count: '5 modelos',
    route: '#/machinery?category=Tractores',
    accent: 'from-lime-500/20 to-transparent'
  }
];

const USE_CASES = [
  { title: 'Construcción Vial', desc: 'Carreteras, autopistas y urbanizaciones', icon: Truck, route: '#/machinery?category=Compactación' },
  { title: 'Minería & Canteras', desc: 'Extracción de áridos, roca y materiales', icon: Mountain, route: '#/machinery?category=Cargadores' },
  { title: 'Edificaciones', desc: 'Movimiento de tierras y cimentación', icon: Layers, route: '#/machinery?category=Excavadoras' },
  { title: 'Gobierno & MOPC', desc: 'Licitaciones públicas y proyectos viales', icon: Award, route: '#/tech-docs' },
];

/* ─── Component ─── */

export const MachineryHubView: React.FC<CategoryHubProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-white">
      
      {/* ═══════════════════════════════════════════════════════ */}
      {/* 1. HERO BANNER */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${SHOWROOM_MARKETING_ASSETS.jcb.banner})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-black">
                Catálogo 2026
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1 animate-pulse" />
                Stock en Patio Km 22
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight font-display">
              Maquinaria Pesada
              <span className="block text-amber-400 mt-1">Certificada en RD</span>
            </h1>

            <p className="mt-4 text-base sm:text-lg text-zinc-300 leading-relaxed max-w-xl font-sans">
              Distribuidor oficial de <strong className="text-white">JCB, LiuGong, Ammann, LS Tractor y Kubota</strong> con garantía directa de fábrica, telemetría satelital y servicio técnico local.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button
                onClick={() => onNavigate('#/machinery')}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-sm font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-400/20 cursor-pointer"
              >
                <span>Ver Catálogo Completo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="https://wa.me/18095601234?text=Hola%20TMD,%20me%20interesa%20cotizar%20maquinaria%20pesada"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-bold border border-white/20 transition-all cursor-pointer backdrop-blur-sm"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Cotizar con Don Eduardo</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 2. QUICK STATS BAR */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="bg-slate-50 dark:bg-zinc-900/50 border-y border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {HERO_STATS.map((stat, idx) => {
              const StatIcon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx, duration: 0.4 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 dark:bg-amber-500/15 flex items-center justify-center shrink-0">
                    <StatIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-display">{stat.value}</div>
                    <div className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{stat.label}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 3. SHOP BY CATEGORY — PHOTO GRID */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-display">
              Explorar por Categoría
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 font-sans">
              Selecciona el tipo de equipo que necesitas para tu proyecto
            </p>
          </div>
          <button
            onClick={() => onNavigate('#/machinery')}
            className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
          >
            Ver todo el inventario
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SHOP_BY_CATEGORY.map((cat, idx) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * idx, duration: 0.5 }}
              onClick={() => onNavigate(cat.route)}
              className="group relative overflow-hidden rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-amber-400 dark:hover:border-amber-500/50 transition-all text-left cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-44 sm:h-48 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.accent}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Count Badge */}
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-black/50 text-white backdrop-blur-sm border border-white/10">
                  {cat.count}
                </span>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors font-display">
                  {cat.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-sans">
                  {cat.subtitle}
                </p>
                <div className="flex items-center gap-1 mt-3 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <span>Ver modelos</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 4. SHOP BY USE CASE */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="bg-slate-50 dark:bg-zinc-900/30 border-y border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8 font-display">
            Equipos por Sector
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {USE_CASES.map((uc, idx) => {
              const UCIcon = uc.icon;
              return (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.08 * idx, duration: 0.4 }}
                  onClick={() => onNavigate(uc.route)}
                  className="group p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-amber-400 dark:hover:border-amber-500/50 transition-all text-left cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UCIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white font-display">
                    {uc.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-sans">
                    {uc.desc}
                  </p>
                  <div className="flex items-center gap-1 mt-3 text-xs font-bold text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Explorar</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 5. OFFICIAL BRANDS CAROUSEL */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-display">
              Marcas Oficiales
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 font-sans">
              Distribuidores autorizados con garantía directa de fábrica
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {OFFICIAL_BRANDS.slice(0, 10).map((brand, idx) => (
            <motion.button
              key={brand.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx, duration: 0.4 }}
              onClick={() => onNavigate(`#/machinery?brand=${brand.id}`)}
              className="group p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-amber-400 dark:hover:border-amber-500/50 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate font-display">
                  {brand.name}
                </span>
                <span className="text-[8px] font-mono font-bold text-slate-500 dark:text-zinc-400 bg-slate-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded-sm">
                  {brand.country}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1 font-sans">
                {brand.category}
              </p>
              <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Ver equipos</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 6. TRUST SIGNALS & SLA BADGES */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="bg-zinc-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-4 font-display">
                Respaldo Técnico
                <span className="text-amber-400"> Local 24/7</span>
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed font-sans">
                Somos el único distribuidor en República Dominicana con taller central propio, stock de repuestos genuinos en patio físico y servicio de rescate mecánico móvil a nivel nacional.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                  onClick={() => onNavigate('#/service')}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Agendar Cita en Taller</span>
                </button>
                <button
                  onClick={() => onNavigate('#/emergency-dispatch')}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold border border-zinc-700 transition-all cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Auxilio SOS 24/7</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Shield, label: '2 Años de Garantía', desc: 'Garantía directa de fábrica' },
                { icon: Radio, label: 'Telemetría LiveLink™', desc: 'GPS satelital en cada unidad' },
                { icon: Clock, label: 'Respuesta < 4 Horas', desc: 'SLA de auxilio mecánico' },
                { icon: MapPin, label: '4 Sedes Operativas', desc: 'Cobertura nacional completa' },
              ].map((trust, idx) => {
                const TrustIcon = trust.icon;
                return (
                  <div key={idx} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                    <TrustIcon className="w-5 h-5 text-amber-400 mb-2" />
                    <div className="text-xs font-black uppercase text-white font-display">{trust.label}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5 font-sans">{trust.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 7. FINAL CTA BANNER */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="bg-amber-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight font-display">
              ¿Listo para cotizar?
            </h3>
            <p className="text-sm text-black/70 mt-1 font-sans">
              Genera tu proforma fiscal NCF con precios vigentes y financiamiento bancario local.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('#/checkout')}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-black text-amber-400 text-sm font-black uppercase tracking-wider hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Generar Proforma NCF</span>
            </button>
            <a
              href="https://wa.me/18095601234?text=Hola%20TMD,%20necesito%20cotizar%20maquinaria%20pesada%20para%20mi%20proyecto"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-black/10 hover:bg-black/20 text-black text-sm font-bold border border-black/20 transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
