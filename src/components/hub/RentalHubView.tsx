import React from 'react';
import { 
  ArrowRight, 
  ChevronRight, 
  ShieldCheck, 
  Truck, 
  Clock, 
  Phone, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  HardHat, 
  Wrench,
  Fuel,
  Users,
  Compass,
  FileCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { SHOWROOM_MARKETING_ASSETS } from '../../data/brandsData';

interface RentalHubProps {
  onNavigate: (route: string) => void;
}

const RENTAL_HERO_STATS = [
  { value: '100%', label: 'Disponibilidad Garantizada', icon: CheckCircle2 },
  { value: '2 Horas', label: 'SLA de Asistencia en Obra', icon: Clock },
  { value: 'Km 22', label: 'Patio Central de Despacho', icon: Truck },
  { value: 'Preventivo', label: 'Mantenimiento 100% Incluido', icon: Wrench },
];

const RENTAL_FLEET_CATEGORIES = [
  {
    id: 'retroexcavadoras',
    name: 'Retroexcavadoras 4x4',
    subtitle: 'JCB 3CX Pro y 4CX con martillo hidráulico opcional',
    specs: '74 - 109 HP · Profundidad 4.24m - 5.88m',
    image: '/assets/machinery/heavy_duty_yellow_jcb_3cx_eco.jpg',
    rateDay: 'US$ 380',
    rateMonth: 'US$ 6,800',
    route: '#/rental?category=Retroexcavadoras'
  },
  {
    id: 'excavadoras',
    name: 'Excavadoras de Cadenas',
    subtitle: 'LiuGong 922E y JCB JS220 para movimiento masivo',
    specs: '22 Toneladas · Cucharón 1.1 m³ · Cummins QSB 6.7',
    image: SHOWROOM_MARKETING_ASSETS.jcb.banner,
    rateDay: 'US$ 650',
    rateMonth: 'US$ 11,500',
    route: '#/rental?category=Excavadoras'
  },
  {
    id: 'rodillos',
    name: 'Rodillos Compactadores 11T-16T',
    subtitle: 'Ammann ASC 110 con medidor de densidad ACE Pro',
    specs: '11.5 Toneladas · Tambor 2,130 mm · Amplitud Variable',
    image: SHOWROOM_MARKETING_ASSETS.ammann.banner,
    rateDay: 'US$ 420',
    rateMonth: 'US$ 7,400',
    route: '#/rental?category=Compactadores'
  },
  {
    id: 'cargadores',
    name: 'Palas Cargadoras Frontales',
    subtitle: 'LiuGong 856T con transmisión ZF Powershift',
    specs: 'Capacidad 3.5 m³ · Carga útil 5,000 kg · Motor Cummins',
    image: SHOWROOM_MARKETING_ASSETS.liugong.banner,
    rateDay: 'US$ 550',
    rateMonth: 'US$ 9,800',
    route: '#/rental?category=Cargadores'
  },
  {
    id: 'telescopicos',
    name: 'Manipuladores Telescópicos (Telehandlers)',
    subtitle: 'JCB 540-170 Loadall alcance 17 metros',
    specs: 'Alcance 16.7m · Capacidad 4,000 kg · Estabilizadores',
    image: '/assets/machinery/jcb_loadall_531_70_telescopic_handler.jpg',
    rateDay: 'US$ 480',
    rateMonth: 'US$ 8,200',
    route: '#/rental?category=Telescopicos'
  },
  {
    id: 'motoniveladoras',
    name: 'Motoniveladoras Viales',
    subtitle: 'LiuGong 4180D para rasante y conformación vial MOPC',
    specs: '180 HP · Vertedera 3,960 mm · Cabina Climatizada ROPS',
    image: SHOWROOM_MARKETING_ASSETS.showroomBanner,
    rateDay: 'US$ 720',
    rateMonth: 'US$ 12,800',
    route: '#/rental?category=Motoniveladoras'
  }
];

export const RentalHubView: React.FC<RentalHubProps> = ({ onNavigate }) => {
  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-[#06060a] text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* 1. BREADCRUMBS */}
      <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-3 border-b border-slate-200/80 dark:border-white/[0.06] text-xs font-semibold text-slate-500 dark:text-zinc-400 flex items-center gap-2">
        <button onClick={() => onNavigate('#/home')} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer">
          Inicio
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600" />
        <span className="text-slate-900 dark:text-white font-bold">División de Renta & Operaciones en Obra</span>
      </div>

      {/* 2. HERO BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-zinc-950 via-slate-900 to-black text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-white/10">
        <div className="max-w-[1780px] mx-auto relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-400 text-xs font-black uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Flota Pesada 2026 Homologada con Telemetría</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              Renta de Maquinaria Pesada <br />
              <span className="text-amber-400">Flexibilidad Diaria, Semanal o Mensual</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
              Flota moderna y mantenida con rigor OEM en Patio Km 22. Despacho nacional inmediato con o sin operador 
              certificado. Mantenimiento preventivo en obra y telemetría satelital en vivo incluida en cada contrato.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('#/rental')}
                className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-400/25 flex items-center gap-2 cursor-pointer"
              >
                <span>Ver Flota de Renta Disponible</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <a
                href="https://wa.me/18095601234?text=Hola%20TMD,%20deseo%20cotizar%20la%20renta%20de%20un%20equipo%20para%20obra"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cotización Express WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 3. HERO STATS */}
      <div className="border-b border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-[#0a0a12]">
        <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {RENTAL_HERO_STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-white/[0.04]">
                <div className="p-2.5 rounded-lg bg-amber-400/10 text-amber-600 dark:text-amber-400 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-black text-slate-900 dark:text-white leading-none">
                    {stat.value}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mt-0.5">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. RENTAL FLEET MATRIX */}
      <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
              Tarifario Orientativo & Modelos
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 dark:text-white">
              Equipos de Renta Más Solicitados
            </h2>
          </div>
          <button
            onClick={() => onNavigate('#/rental')}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
          >
            <span>Ver Toda la Flota de Renta</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {RENTAL_FLEET_CATEGORIES.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-white dark:bg-[#0c0d14] border border-slate-200/80 dark:border-white/[0.08] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-zinc-800">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                  <span className="text-xs font-mono font-bold bg-amber-400 text-black px-2 py-0.5 rounded-[4px]">
                    Día: {item.rateDay}
                  </span>
                  <span className="text-xs font-mono font-bold bg-black/70 backdrop-blur-md border border-white/20 px-2 py-0.5 rounded-[4px]">
                    Mes: {item.rateMonth}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 font-medium">
                    {item.subtitle}
                  </p>
                  <div className="mt-3 p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-white/[0.04] text-[11px] font-mono text-slate-600 dark:text-zinc-300">
                    {item.specs}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center gap-2">
                  <button
                    onClick={() => onNavigate(item.route)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-amber-400 hover:text-black text-slate-800 dark:text-zinc-200 text-xs font-bold transition-all text-center cursor-pointer"
                  >
                    Detalles & Disponibilidad
                  </button>
                  <a
                    href={`https://wa.me/18095601234?text=Deseo%20reservar%20renta%20de%20${encodeURIComponent(item.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                    title="Reservar por WhatsApp"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. VALUE PROPOSITION: POR QUÉ RENTAR CON TMD */}
      <div className="border-t border-slate-200/80 dark:border-white/[0.06] bg-slate-100/60 dark:bg-[#08080f] py-12">
        <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Garantía Operativa TMD
            </span>
            <h3 className="text-xl sm:text-2xl font-black uppercase text-slate-900 dark:text-white mt-1">
              El Estándar de Alquiler Más Riguroso de RD
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.06]">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white">Cero Tiempos Muertos</h4>
              <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Si un equipo presenta una falla no atribuible a mala operación, nuestro taller móvil acude en menos de 2 horas o sustituimos la unidad.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.06]">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <FileCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white">Contratos Flexibles</h4>
              <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Tarifas decrecientes por volumen mensual o semestral con facturación con Comprobante Fiscal B01 para deducción tributaria.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.06]">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white">Operadores Calificados</h4>
              <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Personal certificado con carnet de seguridad industrial y experiencia en minería, carreteras y proyectos de infraestructura.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.06]">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white">Telemetría LiveLink™</h4>
              <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Acceso a portal web para monitorear horómetro real, consumo de diésel y ubicación satelital de cada máquina alquilada.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
