import React from 'react';
import { 
  ArrowRight, 
  ChevronRight, 
  Wrench, 
  Clock, 
  Phone, 
  Sparkles, 
  ShieldCheck, 
  Radio, 
  FlaskConical, 
  Truck, 
  Calculator, 
  FileText, 
  GraduationCap, 
  RotateCcw,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { motion } from 'motion/react';

interface ServicesHubProps {
  onNavigate: (route: string) => void;
  onOpenBayBooking?: () => void;
}

const SERVICES_HERO_STATS = [
  { value: '8 Bahías', label: 'Taller Central Km 22', icon: Wrench },
  { value: '2 Horas', label: 'Respuesta SOS en Obra', icon: Clock },
  { value: 'Bosch / Delphi', label: 'Laboratorio de Inyección', icon: FlaskConical },
  { value: '24/7 Satélite', label: 'Telemetría LiveLink™', icon: Radio },
];

const MAIN_SERVICE_PILLARS = [
  {
    id: 'taller-central',
    title: 'Taller Central de Alta Capacidad (Km 22)',
    subtitle: '8 bahías de servicio pesado, banco de prueba de cilindros hidráulicos y puente grúa de 25 toneladas',
    image: '/assets/machinery/high_tech_heavy_machinery_overhaul_workshop.jpg',
    route: '#/service',
    actionText: 'Agendar Bahía',
    badge: 'Sede Duarte'
  },
  {
    id: 'sos-movil',
    title: 'Taller Móvil SOS 24/7 en Obra',
    subtitle: 'Flota 4x4 equipada con planta eléctrica, compresor de aire, lubricación rápida y kit de mangueras hidráulicas',
    image: '/images/video_ch4_taller.jpg',
    route: '#/emergency-dispatch',
    actionText: 'Despacho de Emergencia',
    badge: 'Nivel Nacional'
  },
  {
    id: 'laboratorio-diesel',
    title: 'Laboratorio de Inyección Diésel & Aceites',
    subtitle: 'Calibración Common Rail, prueba de inyectores piezoeléctricos y análisis espectrométrico de fluidos SOS',
    image: '/assets/machinery/certified_diesel_injection_common_rail_testing.jpg',
    route: '#/oil-lab',
    actionText: 'Solicitar Análisis',
    badge: 'Norma ISO 4406'
  },
  {
    id: 'livelink-telemetria',
    title: 'Centro Satelital LiveLink™ Fleet',
    subtitle: 'Monitoreo remoto de códigos de falla DTC en tiempo real, horómetros, geocercas y alertas de seguridad',
    image: '/images/tmd_portal_telematics.jpg',
    route: '#/livelink',
    actionText: 'Acceso a Telemetría',
    badge: 'JCB & LiuGong'
  }
];

const SPECIALIZED_PROGRAMS = [
  {
    title: 'Contratos Preventivos PMA',
    desc: 'Planes de mantenimiento programado por horas de motor para maximizar el valor de reventa.',
    icon: ShieldCheck,
    route: '#/pma-contracts'
  },
  {
    title: 'Calculadora de Costo Total (TCO)',
    desc: 'Simule costo por hora de operación, depreciación y consumo de diésel.',
    icon: Calculator,
    route: '#/tco'
  },
  {
    title: 'Evaluador de Trade-In',
    desc: 'Tasación técnica de su maquinaria usada como abono a equipo nuevo 2026.',
    icon: RotateCcw,
    route: '#/trade-in'
  },
  {
    title: 'Academia de Operadores',
    desc: 'Certificación técnica de conductores y operadores de excavadora en Km 22.',
    icon: GraduationCap,
    route: '#/academy'
  },
  {
    title: 'Programa Remanufactura OEM',
    desc: 'Motores y bombas reconstruidos con garantía oficial de fábrica al 60% del costo nuevo.',
    icon: Wrench,
    route: '#/reman'
  },
  {
    title: 'Fichas Técnicas & Catálogos CAD',
    desc: 'Biblioteca técnica descargable en PDF con curvas de carga y diagramas hidráulicos.',
    icon: FileText,
    route: '#/tech-docs'
  }
];

export const ServicesHubView: React.FC<ServicesHubProps> = ({ onNavigate, onOpenBayBooking }) => {
  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* 1. BREADCRUMBS */}
      <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-3 border-b border-slate-200/80 dark:border-white/[0.06] text-xs font-semibold text-slate-500 dark:text-zinc-400 flex items-center gap-2">
        <button onClick={() => onNavigate('#/home')} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer">
          Inicio
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600" />
        <span className="text-slate-900 dark:text-white font-bold">Centro de Servicios Técnicos & Postventa</span>
      </div>

      {/* 2. HERO BANNER WITH 4K DEALERSHIP & WORKSHOP BAYS BACKGROUND */}
      <div className="relative overflow-hidden bg-zinc-950 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-white/10">
        {/* 4K Background Imagery with Ambient Dimming & Specular Gold Glow */}
        <img
          src="/assets/images/tmd_dealership_bg_1790439101712.jpg"
          alt="TMD Dominicana Centro de Servicios Técnicos & Postventa"
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
              <span>Soporte Técnico de Nivel OEM en República Dominicana</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight font-display">
              Ingeniería de Servicio <br />
              <span className="text-amber-400">& Mantenimiento en Patio y Obra</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-zinc-200 leading-relaxed font-normal max-w-2xl font-sans">
              Infraestructura certificada en Km 22 Autopista Duarte con 8 bahías industriales, unidades móviles de 
              rescate en carretera, banco de prueba diésel y monitoreo satelital en vivo para que su proyecto nunca se detenga.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              {onOpenBayBooking ? (
                <button
                  onClick={onOpenBayBooking}
                  className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-400/25 flex items-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Reservar Bahía en Taller</span>
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('#/service')}
                  className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-400/25 flex items-center gap-2 cursor-pointer"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Conocer Nuestro Taller</span>
                </button>
              )}
              <a
                href="tel:18095601234"
                className="px-6 py-3.5 rounded-xl bg-red-600/30 hover:bg-red-600/40 border border-red-500/50 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-red-400" />
                <span>Línea SOS Emergencias (809) 560-1234</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 3. HERO STATS */}
      <div className="border-b border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-[#0c0c10]">
        <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES_HERO_STATS.map((stat, idx) => {
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

      {/* 4. MAIN 4 PILLARS */}
      <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-12">
        <div className="mb-8">
          <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
            Pilares Operativos
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 dark:text-white">
            Infraestructura Técnica de Respaldo
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MAIN_SERVICE_PILLARS.map((pillar) => (
            <div
              key={pillar.id}
              className="rounded-2xl bg-white dark:bg-[#0c0c10] border border-slate-200/80 dark:border-white/[0.08] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-56 overflow-hidden bg-slate-100 dark:bg-zinc-800">
                <img
                  src={pillar.image}
                  alt={pillar.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-[4px] bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-wider text-amber-400">
                    {pillar.badge}
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-lg font-black text-white leading-tight">
                    {pillar.title}
                  </h3>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed font-medium">
                  {pillar.subtitle}
                </p>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                  <button
                    onClick={() => onNavigate(pillar.route)}
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    <span>{pillar.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href="https://wa.me/18095601234?text=Hola%20TMD,%20solicito%20asistencia%20técnica"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-slate-500 hover:text-emerald-500 transition-colors"
                  >
                    WhatsApp Soporte →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. SPECIALIZED PROGRAMS GRID */}
      <div className="border-t border-slate-200/80 dark:border-white/[0.06] bg-slate-100/60 dark:bg-zinc-950 py-12">
        <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="mb-8">
            <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
              Soluciones Especializadas
            </span>
            <h3 className="text-xl sm:text-2xl font-black uppercase text-slate-900 dark:text-white">
              Herramientas y Programas de Flota
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SPECIALIZED_PROGRAMS.map((prog, idx) => {
              const Icon = prog.icon;
              return (
                <div
                  key={idx}
                  onClick={() => onNavigate(prog.route)}
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.06] hover:border-amber-400 text-left transition-all group cursor-pointer shadow-2xs flex items-start gap-4"
                >
                  <div className="p-3 rounded-xl bg-amber-400/10 text-amber-600 dark:text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {prog.title}
                    </h4>
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
                      {prog.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};
