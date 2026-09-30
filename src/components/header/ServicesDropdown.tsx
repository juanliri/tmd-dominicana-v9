import React from 'react';
import { 
  Wrench, 
  HardHat, 
  FlaskConical, 
  Radio, 
  Landmark, 
  FileText, 
  TrendingUp, 
  Building2, 
  ChevronRight, 
  Phone, 
  ArrowRight,
  ShieldCheck,
  Calculator,
  Award,
  Layers,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ServicesDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

interface ServiceMenuItem {
  id: string;
  title: string;
  subtitle: string;
  route: string;
  badge: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

const TECHNICAL_SERVICES: ServiceMenuItem[] = [
  {
    id: 'central-workshop',
    title: 'Taller Central Km 22 & Overhaul',
    subtitle: '18 bahías de servicio pesado, bancos de prueba 350 bar y motores diésel',
    route: '#/service',
    badge: '18 Bahías',
    icon: Wrench,
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/15',
    iconColor: 'text-amber-600 dark:text-amber-400'
  },
  {
    id: 'emergency-dispatch',
    title: 'Auxilio Mecánico SOS 24/7',
    subtitle: 'Despacho urgente de taller móvil 4x4 a frente de obra en < 4h',
    route: '#/emergency-dispatch',
    badge: 'Urgencias',
    icon: HardHat,
    iconBg: 'bg-rose-500/10 dark:bg-rose-500/15',
    iconColor: 'text-rose-600 dark:text-rose-400'
  },
  {
    id: 'oil-lab',
    title: 'Laboratorio Tribológico SOS',
    subtitle: 'Espectrometría ICP de aceites y análisis preventivo de fluidos',
    route: '#/oil-lab',
    badge: 'Tribología',
    icon: FlaskConical,
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    iconColor: 'text-emerald-600 dark:text-emerald-400'
  },
  {
    id: 'telematics-livelink',
    title: 'Telemetría Satelital LiveLink™',
    subtitle: 'Monitoreo GPS satelital en tiempo real, horómetro y alertas de flota',
    route: '#/livelink',
    badge: 'GPS Satelital',
    icon: Radio,
    iconBg: 'bg-blue-500/10 dark:bg-blue-500/15',
    iconColor: 'text-blue-600 dark:text-blue-400'
  }
];

const CORPORATE_SERVICES: ServiceMenuItem[] = [
  {
    id: 'gov-bids',
    title: 'Licitaciones & Compras Públicas MOPC',
    subtitle: 'Fichas homologadas MOPC, pliegos, RPE activo y NCF B15 estatal',
    route: '#/tech-docs',
    badge: 'MOPC & DGII',
    icon: Landmark,
    iconBg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
    iconColor: 'text-indigo-600 dark:text-indigo-400'
  },
  {
    id: 'tech-docs-vault',
    title: 'Bóveda Técnica & Fichas PDF',
    subtitle: 'Descarga directa de manuales de servicio y especificaciones oficiales',
    route: '#/tech-docs',
    badge: 'PDF Bóveda',
    icon: FileText,
    iconBg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
    iconColor: 'text-cyan-600 dark:text-cyan-400'
  },
  {
    id: 'trade-in-aval',
    title: 'Trade-In / Avalúo de Usados',
    subtitle: 'Recibimos tu maquinaria usada como parte de pago con tasación en 24h',
    route: '#/trade-in',
    badge: 'Tasación 24h',
    icon: TrendingUp,
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    iconColor: 'text-emerald-600 dark:text-emerald-400'
  },
  {
    id: 'about-tmd',
    title: 'Sobre TMD & Patio Central Km 22',
    subtitle: '24+ años de trayectoria, sede en Autopista Duarte y alianzas oficiales',
    route: '#/about',
    badge: 'Patio Km 22',
    icon: Building2,
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/15',
    iconColor: 'text-amber-600 dark:text-amber-400'
  }
];

export const ServicesDropdown: React.FC<ServicesDropdownProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onMouseEnter,
  onMouseLeave
}) => {
  const handleItemClick = (route: string) => {
    onClose();
    onNavigate(route);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Invisible safe hover bridge between navbar button and dropdown */}
          <div 
            className="absolute top-full left-0 right-0 h-3 z-50 pointer-events-auto"
            onMouseEnter={onMouseEnter}
          />

          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.985 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 30, 
              mass: 0.75,
              opacity: { duration: 0.15 } 
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className="absolute top-[calc(100%+8px)] right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 lg:right-0 lg:left-auto lg:translate-x-0 w-[680px] max-w-[calc(100vw-32px)] bg-zinc-950/98 text-white backdrop-blur-2xl rounded-[6px] border border-white/[0.12] shadow-[0_20px_60px_rgba(0,0,0,0.85)] z-50 overflow-hidden text-left"
          >
            {/* Top Amber CAD Accent Hairline */}
            <div className="h-[2px] w-full bg-gradient-to-r from-amber-500 via-[#d99b26] to-transparent" />

            {/* Main 2-Column Content */}
            <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-zinc-800/80">
              {/* Column 1: Soporte Técnico & Taller */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1 pb-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Wrench className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-zinc-200 font-display">
                      Soporte & Taller en Obra
                    </span>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/20">
                    Km 22 Duarte
                  </span>
                </div>

                <div className="space-y-1">
                  {TECHNICAL_SERVICES.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleItemClick(item.route)}
                        className="w-full flex items-start gap-3 p-2.5 rounded-[4px] hover:bg-white/[0.06] transition-all text-left group cursor-pointer border border-transparent hover:border-amber-400/40"
                      >
                        <div className={`w-8 h-8 rounded-[3px] ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-xs font-black text-white group-hover:text-amber-400 transition-colors truncate uppercase font-display">
                              {item.title}
                            </span>
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-[2px] bg-zinc-900 text-zinc-300 border border-white/[0.08] shrink-0 uppercase">
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5 leading-snug font-sans">
                            {item.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Column 2: Licitaciones & Corporativo */}
              <div className="space-y-3 pt-4 md:pt-0 md:pl-4">
                <div className="flex items-center justify-between px-1 pb-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-indigo-500/10 text-indigo-400">
                      <Landmark className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-wider text-zinc-200 font-display">
                      Licitaciones & Empresa
                    </span>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-950/40 text-indigo-400 border border-indigo-500/20">
                    DGII / MOPC
                  </span>
                </div>

                <div className="space-y-1">
                  {CORPORATE_SERVICES.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleItemClick(item.route)}
                        className="w-full flex items-start gap-3 p-2.5 rounded-[4px] hover:bg-white/[0.06] transition-all text-left group cursor-pointer border border-transparent hover:border-amber-400/40"
                      >
                        <div className={`w-8 h-8 rounded-[3px] ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-xs font-black text-white group-hover:text-amber-400 transition-colors truncate uppercase font-display">
                              {item.title}
                            </span>
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-[2px] bg-zinc-900 text-zinc-300 border border-white/[0.08] shrink-0 uppercase">
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5 leading-snug font-sans">
                            {item.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Quick-Access Strip (Zero Capabilities Lost!) */}
            <div className="px-5 py-3 bg-zinc-950 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Specialist Tools Pill Group */}
              <div className="flex items-center gap-2 flex-wrap font-mono">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  Herramientas:
                </span>
                <button
                  type="button"
                  onClick={() => handleItemClick('#/tco')}
                  className="px-2 py-0.5 rounded-[3px] text-[10px] font-bold text-zinc-300 hover:text-amber-400 hover:bg-white/[0.06] transition-colors cursor-pointer uppercase border border-white/[0.06]"
                >
                  Calculadora TCO
                </button>
                <button
                  type="button"
                  onClick={() => handleItemClick('#/pma-contracts')}
                  className="px-2 py-0.5 rounded-[3px] text-[10px] font-bold text-zinc-300 hover:text-amber-400 hover:bg-white/[0.06] transition-colors cursor-pointer uppercase border border-white/[0.06]"
                >
                  Contratos PMA
                </button>
                <button
                  type="button"
                  onClick={() => handleItemClick('#/academy')}
                  className="px-2 py-0.5 rounded-[3px] text-[10px] font-bold text-zinc-300 hover:text-amber-400 hover:bg-white/[0.06] transition-colors cursor-pointer uppercase border border-white/[0.06]"
                >
                  Academia
                </button>
                <button
                  type="button"
                  onClick={() => handleItemClick('#/reman')}
                  className="px-2 py-0.5 rounded-[3px] text-[10px] font-bold text-zinc-300 hover:text-amber-400 hover:bg-white/[0.06] transition-colors cursor-pointer uppercase border border-white/[0.06]"
                >
                  Centro Reman
                </button>
              </div>

              {/* Direct WhatsApp Callout */}
              <a
                href="https://wa.me/18095601234?text=Hola%20TMD,%20solicito%20asistencia%20t%C3%A9cnica%20de%20servicios"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Asistencia SOS: +1 (809) 560-1234</span>
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
