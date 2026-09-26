import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ShieldCheck, 
  ArrowUp,
  HardHat,
  Cog,
  Wrench,
  CheckCircle2,
  Send,
  Building2,
  Calendar,
  Sparkles,
  ExternalLink,
  Award,
  Globe2,
  FileText,
  Truck,
  ChevronDown,
  Share2,
  Radio,
  Play
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { TMDLogo, BrandLogo } from './common/BrandLogos';
import { OFFICIAL_BRANDS } from '../data/brandsData';

// Custom Branded Social Media Icons with Crisp SVG Rendering
const InstagramIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const LinkedInIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const YouTubeIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" fill="currentColor" />
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    handle: '@tmddominicana',
    subtitle: 'Demostraciones en vivo y entregas en faena',
    url: 'https://instagram.com/tmddominicana',
    icon: InstagramIcon,
    tag: 'REELS & STORIES',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    hoverGlow: 'hover:border-rose-500/60 hover:shadow-[0_0_25px_rgba(244,63,94,0.25)]',
    hoverIconBg: 'group-hover:bg-gradient-to-tr group-hover:from-amber-500 group-hover:via-rose-500 group-hover:to-purple-600 group-hover:text-white',
    accentColor: '#e1306c'
  },
  {
    name: 'LinkedIn',
    handle: 'TMD Dominicana',
    subtitle: 'Licitaciones, proyectos mineros e infraestructura',
    url: 'https://linkedin.com/company/tmddominicana',
    icon: LinkedInIcon,
    tag: 'CORPORATIVO',
    badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    hoverGlow: 'hover:border-sky-500/60 hover:shadow-[0_0_25px_rgba(14,165,233,0.25)]',
    hoverIconBg: 'group-hover:bg-[#0077b5] group-hover:text-white',
    accentColor: '#0077b5'
  },
  {
    name: 'YouTube',
    handle: 'TMD TV Dominicana',
    subtitle: 'Pruebas de potencia, telemetría y talleres SOS',
    url: 'https://youtube.com/@tmddominicana',
    icon: YouTubeIcon,
    tag: 'VÍDEOS 4K',
    badgeColor: 'text-red-400 bg-red-500/10 border-red-500/30',
    hoverGlow: 'hover:border-red-500/60 hover:shadow-[0_0_25px_rgba(239,68,68,0.25)]',
    hoverIconBg: 'group-hover:bg-[#ff0000] group-hover:text-white',
    accentColor: '#ff0000'
  },
  {
    name: 'Facebook',
    handle: 'TMD Dominicana',
    subtitle: 'Comunidad de operadores de maquinaria pesada RD',
    url: 'https://facebook.com/tmddominicana',
    icon: FacebookIcon,
    tag: 'COMUNIDAD RD',
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    hoverGlow: 'hover:border-blue-500/60 hover:shadow-[0_0_25px_rgba(59,130,246,0.25)]',
    hoverIconBg: 'group-hover:bg-[#1877f2] group-hover:text-white',
    accentColor: '#1877f2'
  }
];

interface FooterProps {
  onNavigate: (route: string) => void;
  currentRoute?: string;
}

const AUTHORIZED_BRANDS = [
  { name: 'JCB', role: 'Distribuidor Oficial' },
  { name: 'LiuGong', role: 'Maquinaria Pesada' },
  { name: 'Ammann', role: 'Compactación' },
  { name: 'Donaldson', role: 'Filtración OEM' },
  { name: 'Fleetguard', role: 'Sistemas HD' },
  { name: 'Cummins', role: 'Motores Diésel' }
];

export const Footer: React.FC<FooterProps> = ({ onNavigate, currentRoute = '' }) => {
  const { currency, setCurrency } = useCart();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openMobileSection, setOpenMobileSection] = useState<string | null>(null);

  const toggleMobileSection = (section: string) => {
    setOpenMobileSection(prev => prev === section ? null : section);
  };

  const isPortalOrWorkspace = [
    '#/portal',
    '#/admin',
    '#/admin-dashboard',
    '#/fullbay',
    '#/livelink',
    '#/checkout',
    '#/offline-vault',
    '#/offline-docs'
  ].includes(currentRoute);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      setEmail('');
    }, 400);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Ultra-Clean Adaptive Footer for Admin, Portals & LiveLink Workspaces
  if (isPortalOrWorkspace) {
    return (
      <footer 
        id="portal-compact-footer"
        className="bg-transparent text-zinc-400 border-t border-white/10 py-2 sm:py-2.5 px-3 sm:px-6 lg:px-10 xl:px-14 text-xs transition-all shrink-0 z-30"
      >
        <div className="w-full max-w-[1780px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sistemas TMD Cloud En Línea</span>
            </div>
            <span className="hidden sm:inline text-zinc-700">•</span>
            <span className="hidden md:inline text-zinc-400 font-medium">
              Patio Km 22 Autopista Duarte
            </span>
            <span className="hidden sm:inline text-zinc-700">•</span>
            <a 
              href="tel:18095601234" 
              className="text-amber-500 hover:text-amber-400 font-bold transition-colors"
            >
              Mesa de Ayuda: +1 (809) 560-1234
            </a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-[11px]">
            <button
              onClick={() => onNavigate('#/home')}
              className="px-2 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer text-[10px] font-bold"
            >
              Showroom
            </button>
            <button
              onClick={() => onNavigate('#/machinery')}
              className="px-2 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer text-[10px] font-bold"
            >
              Maquinaria
            </button>
            <button
              onClick={() => onNavigate('#/parts')}
              className="px-2 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer text-[10px] font-bold"
            >
              Repuestos
            </button>
            <span className="text-zinc-600 text-[10px] font-mono hidden xl:inline">
              RNC 1-01-85732-1
            </span>
          </div>
        </div>
      </footer>
    );
  }

  // 2. High-End, Structured Industrial Public Footer with Compact Mobile/Tablet Design
  return (
    <footer className="bg-gradient-to-b from-[#0e0e16] via-[#08080d] to-[#040407] text-zinc-100 border-t border-white/[0.08] pt-8 sm:pt-10 lg:pt-12 pb-24 lg:pb-10 text-sm font-medium font-display">
      <div className="w-full max-w-[1780px] mx-auto px-3.5 sm:px-6 lg:px-12 xl:px-16 space-y-6 sm:space-y-8">
        
        {/* TOP CERTIFIED DISTRIBUTOR & NEWSLETTER BAR - RESPONSIVE & COMPACT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 p-4 sm:p-6 lg:p-7 rounded-xl bg-gradient-to-r from-[#14141c] via-[#0c0c12] to-[#06060a] border border-white/[0.08] shadow-xl items-center">
          {/* Left: Official Dealership Credentials */}
          <div className="lg:col-span-6 space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 flex-wrap font-display">
              <span className="px-2.5 py-0.5 rounded-[4px] bg-[#d99b26] text-black text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-xs">
                DISTRIBUCIÓN OFICIAL HOMOLOGADA
              </span>
              <span className="text-zinc-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                DESDE 2002 • PATIO KM 22 AUTOPISTA DUARTE
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal font-sans">
              Representante autorizado de <strong className="text-white font-black text-[#e0a22a]">JCB, LiuGong, Ammann, Kubota, Yomel, AFEX y Donaldson</strong> con soporte técnico local y stock permanente de partes OEM.
            </p>

            <div className="flex items-center gap-1.5 pt-0.5 text-[11px] sm:text-xs font-black uppercase tracking-wider text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>GARANTÍA DE FÁBRICA 2 AÑOS / 2,000H Y TELEMETRÍA SATELITAL LIVELINK™.</span>
            </div>
          </div>

          {/* Right: Fleet & Inventory Alerts Subscription */}
          <div className="lg:col-span-6 lg:pl-6 lg:border-l lg:border-white/[0.08] pt-2 lg:pt-0 border-t lg:border-t-0 border-white/[0.08]">
            <div className="space-y-1 mb-2.5">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#e0a22a] shrink-0" />
                <span>BOLETÍN DE EMBARQUES Y DESPACHO EXPRESS</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-zinc-400 font-sans line-clamp-1 sm:line-clamp-none">
                Llegada de contenedores Haina/Caucedo, ofertas en kits de filtros y disponibilidad de flota.
              </p>
            </div>

            {isSubscribed ? (
              <div className="px-3 py-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>¡SUSCRITO CON ÉXITO! RECIBIRÁS LAS ALERTAS DE INVENTARIO.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-row items-center gap-2">
                <div className="relative flex-1 min-w-0">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@empresa.com.do"
                    required
                    className="w-full px-3 py-2 sm:py-2.5 rounded-lg bg-[#07070b] border border-white/[0.08] text-white placeholder-zinc-500 text-xs font-mono font-medium focus:outline-none focus:border-[#d99b26] transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 sm:py-2.5 rounded-lg bg-[#d99b26] hover:bg-[#e0a22a] text-black font-black uppercase tracking-wider text-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>{isSubmitting ? '...' : 'SUSCRIBIR'}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* 4 BALANCED DIRECTORY COLUMNS - COMPACT RESPONSIVE GRID FOR TABLET & MOBILE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8 pt-1">
          {/* Column 1: Brand & Official Status */}
          <div className="space-y-3 bg-[#0a0a10]/50 sm:bg-transparent p-3.5 sm:p-0 rounded-xl border sm:border-0 border-white/[0.08]">
            <div className="flex items-center justify-between">
              <TMDLogo className="h-8 sm:h-9" />
              <span className="sm:hidden px-2 py-0.5 rounded-[2px] bg-[#14141c] text-[#e0a22a] text-[10px] font-black uppercase border border-white/[0.08]">
                OFICIAL RD
              </span>
            </div>

            <p className="text-zinc-300 leading-relaxed text-xs font-sans">
              Líder en distribución, renta y soporte técnico de maquinaria pesada para construcción, minería y agricultura en todo el país.
            </p>

            <div className="p-2.5 sm:p-3 rounded-[4px] bg-zinc-900 border border-zinc-800 grid grid-cols-2 sm:grid-cols-1 gap-1.5 text-[11px] sm:text-xs">
              <div className="flex justify-between items-center gap-1">
                <span className="text-zinc-400 font-black uppercase">RNC DGII:</span>
                <span className="font-mono font-black text-white">1-01-85732-1</span>
              </div>
              <div className="flex justify-between items-center gap-1">
                <span className="text-zinc-400 font-black uppercase">FACTURACIÓN:</span>
                <span className="font-black text-amber-400 uppercase">NCF B01/B15</span>
              </div>
            </div>

            {/* Quick Social Bar */}
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-zinc-400">
                <span>CANALES OFICIALES:</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  EN LÍNEA
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {SOCIAL_LINKS.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center justify-center p-2 rounded-lg bg-[#0c0c14] hover:bg-[#141420] border border-white/[0.08] hover:border-[#e0a22a]/50 text-zinc-400 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
                      title={`${social.name} • ${social.handle}`}
                    >
                      <div className={`p-1.5 rounded-md bg-white/[0.04] text-zinc-300 transition-all duration-300 ${social.hoverIconBg}`}>
                        <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <span className="text-[9px] font-bold mt-1 text-zinc-400 group-hover:text-amber-400 transition-colors truncate max-w-full">
                        {social.name}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 pt-0.5">
              <button
                onClick={() => onNavigate('#/bio')}
                className="w-full px-2.5 py-2 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-amber-400 font-black uppercase tracking-wider border border-zinc-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>BIO-LINK & REDES 24/7</span>
              </button>
              <button
                onClick={() => onNavigate('#/help')}
                className="w-full px-2.5 py-2 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-black uppercase tracking-wider border border-zinc-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>AYUDA & FAQS</span>
              </button>
            </div>
          </div>

          {/* Column 2: Machinery & Rental */}
          <div className="space-y-2.5 bg-zinc-900/50 sm:bg-transparent p-3 sm:p-0 rounded-[5px] border sm:border-0 border-zinc-800">
            <button
              type="button"
              onClick={() => toggleMobileSection('machinery')}
              className="w-full flex items-center justify-between sm:cursor-default text-left"
            >
              <h4 className="font-black text-xs sm:text-sm text-white uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <HardHat className="w-4 h-4 text-amber-400 shrink-0" />
                <span>MAQUINARIA & RENTA</span>
              </h4>
              <ChevronDown className={`w-4 h-4 text-zinc-400 sm:hidden transition-transform duration-200 ${openMobileSection === 'machinery' ? 'rotate-180 text-amber-400' : ''}`} />
            </button>
            <ul className={`${openMobileSection === 'machinery' ? 'block' : 'hidden sm:grid'} grid-cols-1 gap-2 text-xs font-bold uppercase tracking-wider text-zinc-300 pt-1 sm:pt-0`}>
              <li>
                <button onClick={() => onNavigate('#/machinery')} className="hover:text-amber-400 transition-colors text-left flex items-center justify-between w-full cursor-pointer py-0.5">
                  <span>CATÁLOGO DE EQUIPOS 2026</span>
                  <span className="text-[10px] text-amber-400 font-black">NUEVO</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('#/rental')} className="hover:text-amber-400 transition-colors text-left flex items-center justify-between w-full cursor-pointer py-0.5">
                  <span>RENTA FLOTA & LOWBOY</span>
                  <span className="text-[10px] text-zinc-500">&lt;4H</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('#/trade-in')} className="hover:text-amber-400 transition-colors text-left block w-full cursor-pointer py-0.5">
                  TRADE-IN & USADOS 150 PUNTOS
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('#/tco-calculator')} className="hover:text-amber-400 transition-colors text-left block w-full cursor-pointer py-0.5">
                  CALCULADORA DE TCO & DIÉSEL
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('#/checkout')} className="hover:text-amber-400 text-amber-400 transition-colors text-left flex items-center gap-1 w-full cursor-pointer py-0.5 font-black">
                  <span>COTIZADOR FORMAL DGII (NCF B15)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Parts & Heavy Service */}
          <div className="space-y-2.5 bg-zinc-900/50 sm:bg-transparent p-3 sm:p-0 rounded-[5px] border sm:border-0 border-zinc-800">
            <button
              type="button"
              onClick={() => toggleMobileSection('parts')}
              className="w-full flex items-center justify-between sm:cursor-default text-left"
            >
              <h4 className="font-black text-xs sm:text-sm text-white uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
                <span>REPUESTOS & TALLER HD</span>
              </h4>
              <ChevronDown className={`w-4 h-4 text-zinc-400 sm:hidden transition-transform duration-200 ${openMobileSection === 'parts' ? 'rotate-180 text-amber-400' : ''}`} />
            </button>
            <ul className={`${openMobileSection === 'parts' ? 'block' : 'hidden sm:grid'} grid-cols-1 gap-2 text-xs font-bold uppercase tracking-wider text-zinc-300 pt-1 sm:pt-0`}>
              <li>
                <button onClick={() => onNavigate('#/parts')} className="hover:text-amber-400 transition-colors text-left flex items-center justify-between w-full cursor-pointer py-0.5">
                  <span>REPUESTOS OEM GENUINOS</span>
                  <span className="text-[10px] text-amber-400 font-bold">+35K</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('#/service')} className="hover:text-amber-400 transition-colors text-left block w-full cursor-pointer py-0.5">
                  TALLER CENTRAL KM 22 (12 BAHÍAS)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('#/emergency-dispatch')} className="hover:text-amber-400 transition-colors text-left text-emerald-400 font-black flex items-center gap-1.5 w-full cursor-pointer py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
                  <span>TALLERES MÓVILES SOS 24/7</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('#/oil-lab')} className="hover:text-amber-400 transition-colors text-left block w-full cursor-pointer py-0.5">
                  LABORATORIO DE ACEITES SOS
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('#/livelink')} className="hover:text-amber-400 transition-colors text-left block w-full cursor-pointer py-0.5">
                  TELEMETRÍA LIVELINK™ EN TIEMPO REAL
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: National Network & Direct Dispatch */}
          <div className="space-y-2.5 bg-zinc-900/50 sm:bg-transparent p-3 sm:p-0 rounded-[5px] border sm:border-0 border-zinc-800">
            <button
              type="button"
              onClick={() => toggleMobileSection('locations')}
              className="w-full flex items-center justify-between sm:cursor-default text-left"
            >
              <h4 className="font-black text-xs sm:text-sm text-white uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>SEDES & CONTACTO RD</span>
              </h4>
              <ChevronDown className={`w-4 h-4 text-zinc-400 sm:hidden transition-transform duration-200 ${openMobileSection === 'locations' ? 'rotate-180 text-[#e0a22a]' : ''}`} />
            </button>
            <div className={`${openMobileSection === 'locations' ? 'block' : 'hidden sm:block'} space-y-2 text-zinc-300 text-xs pt-1 sm:pt-0`}>
              <div className="p-2 sm:p-2.5 rounded-lg bg-[#0c0c14] border border-white/[0.08]">
                <strong className="text-[#e0a22a] block text-[11px] sm:text-xs font-black uppercase">PATIO CENTRAL KM 22:</strong>
                <span className="text-[11px] text-zinc-400 block font-sans">Autopista Duarte Km 22, Pedro Brand, Santo Domingo</span>
              </div>

              <div className="p-2 sm:p-2.5 rounded-lg bg-[#0c0c14] border border-white/[0.08]">
                <strong className="text-[#e0a22a] block text-[11px] sm:text-xs font-black uppercase">CIBAO & ESTE:</strong>
                <span className="text-[11px] text-zinc-400 block font-sans">Santiago (Circunvalación) • Bávaro - Punta Cana</span>
              </div>

              <div className="pt-1 flex flex-col sm:flex-row lg:flex-col gap-1.5 text-xs">
                <a 
                  href="tel:18095601234" 
                  className="px-2.5 py-1.5 rounded-md bg-[#0c0c14] text-emerald-400 hover:bg-[#141420] font-black uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5 transition-colors cursor-pointer border border-white/[0.08]"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>24/7: +1 (809) 560-1234</span>
                </a>
                <a 
                  href="mailto:ventas@tmddominicana.com" 
                  className="px-2.5 py-1.5 rounded-md bg-[#0c0c14] text-zinc-300 hover:text-white font-black uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5 transition-colors cursor-pointer border border-white/[0.08] text-[11px]"
                >
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span>VENTAS@TMDDOMINICANA.COM</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* SOCIAL MEDIA & BRAND ENGAGEMENT HUB - INTERACTIVE ANIMATED CARDS */}
        <div className="pt-2 sm:pt-4 border-t border-white/[0.08]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 mb-3.5 sm:mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#d99b26] animate-ping" />
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <span>CANALES DIGITALES & REDES SOCIALES TMD</span>
                </h4>
                <span className="px-2 py-0.5 rounded-[3px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase">
                  @TMDDOMINICANA
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-400 font-sans mt-0.5">
                Sigue nuestra actividad en obras, demostraciones de potencia y soporte técnico en toda República Dominicana.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-400 hidden sm:inline font-mono">
                CONÉCTATE DIRECTO:
              </span>
              <button
                onClick={() => onNavigate('#/bio')}
                className="px-2.5 py-1 rounded-md bg-[#141420] hover:bg-[#1c1c2e] text-amber-400 hover:text-amber-300 text-xs font-bold transition-colors cursor-pointer border border-white/[0.08] flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>VER BIO-HUB COMPLETO</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {SOCIAL_LINKS.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative p-3.5 sm:p-4 rounded-xl bg-gradient-to-b from-[#0e0e16] to-[#08080c] border border-white/[0.08] transition-all duration-300 cursor-pointer overflow-hidden ${social.hoverGlow} hover:-translate-y-1`}
                >
                  {/* Subtle hover gradient wash */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r from-amber-400 to-rose-400 transition-opacity duration-300 pointer-events-none" />

                  <div className="relative flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-lg bg-zinc-900 border border-white/[0.08] flex items-center justify-center text-zinc-300 transition-all duration-300 shrink-0 ${social.hoverIconBg} shadow-sm`}>
                        <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-xs sm:text-sm text-white uppercase group-hover:text-amber-400 transition-colors">
                            {social.name}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] font-bold text-amber-400/90 block truncate">
                          {social.handle}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <span className={`px-1.5 py-0.5 rounded-[3px] text-[9px] font-black uppercase border ${social.badgeColor}`}>
                        {social.tag}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                    </div>
                  </div>

                  <p className="relative mt-2.5 text-[11px] text-zinc-400 font-sans leading-relaxed line-clamp-2 group-hover:text-zinc-300 transition-colors">
                    {social.subtitle}
                  </p>

                  <div className="relative mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                    <span className="text-zinc-500 group-hover:text-zinc-300 transition-colors flex items-center gap-1">
                      <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                      CANAL OFICIAL
                    </span>
                    <span className="text-amber-400 group-hover:underline flex items-center gap-0.5">
                      <span>SEGUIR</span>
                      <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* BOTTOM METRIC & LEGAL BAR - COMPACT & ORGANIZED */}
        <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-zinc-400 text-xs font-bold">
          <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start text-center sm:text-left text-[11px]">
            <span className="font-extrabold text-zinc-200">© {new Date().getFullYear()} TMD TECNOMAQUINARIAS DIESEL S.R.L.</span>
            <span>•</span>
            <span className="text-zinc-500">República Dominicana</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-[11px]">
            <button
              onClick={() => onNavigate('#/about')}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Empresa
            </button>
            <button
              onClick={() => onNavigate('#/about')}
              className="text-[#e0a22a] hover:text-[#d99b26] font-bold transition-colors cursor-pointer"
            >
              Staff (12)
            </button>
            <button
              onClick={() => onNavigate('#/branches')}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Sedes
            </button>
            <button
              onClick={() => onNavigate('#/warranty')}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Garantías
            </button>
            <button
              onClick={() => onNavigate('#/portal')}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Portal
            </button>
            <button
              onClick={() => onNavigate('#/bio')}
              className="text-[#e0a22a] hover:text-[#d99b26] font-extrabold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Bio-Link</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0c0c14] hover:bg-[#181824] text-[#e0a22a] font-black uppercase tracking-wider transition-colors cursor-pointer border border-white/[0.08]"
            >
              <span>SUBIR</span>
              <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
