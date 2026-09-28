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
  Play,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { TMDLogo } from './common/BrandLogos';
import { OFFICIAL_BRANDS } from '../data/brandsData';

// Custom Branded Social Media Icons
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
    url: 'https://instagram.com/tmddominicana',
    icon: InstagramIcon,
    hoverIconBg: 'group-hover:bg-gradient-to-tr group-hover:from-amber-500 group-hover:via-rose-500 group-hover:to-purple-600 group-hover:text-white',
  },
  {
    name: 'LinkedIn',
    handle: 'TMD Dominicana',
    url: 'https://linkedin.com/company/tmddominicana',
    icon: LinkedInIcon,
    hoverIconBg: 'group-hover:bg-[#0077b5] group-hover:text-white',
  },
  {
    name: 'YouTube',
    handle: 'TMD TV Dominicana',
    url: 'https://youtube.com/@tmddominicana',
    icon: YouTubeIcon,
    hoverIconBg: 'group-hover:bg-[#ff0000] group-hover:text-white',
  },
  {
    name: 'Facebook',
    handle: 'TMD Dominicana',
    url: 'https://facebook.com/tmddominicana',
    icon: FacebookIcon,
    hoverIconBg: 'group-hover:bg-[#1877f2] group-hover:text-white',
  }
];

interface FooterProps {
  onNavigate: (route: string) => void;
  currentRoute?: string;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, currentRoute = '' }) => {
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
              onClick={() => onNavigate('#/machinery-hub')}
              className="px-2 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer text-[10px] font-bold"
            >
              Maquinaria
            </button>
            <button
              onClick={() => onNavigate('#/parts-hub')}
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

  // 2. High-End, Balanced Industrial Public Footer Optimized for Desktop, Tablet & Mobile
  return (
    <footer className="bg-gradient-to-b from-[#0e0e16] via-[#08080d] to-[#040407] text-zinc-100 border-t border-white/[0.08] pt-8 sm:pt-10 lg:pt-12 pb-24 lg:pb-8 text-sm font-medium font-display dark-preserve">
      <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 space-y-8">
        
        {/* TIER 1: INDUSTRIAL TRUST PILLARS BAR (Clean 4-Pill Grid on Desktop/Tablet) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400 shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs font-black uppercase text-white truncate">
                Distribuidor Oficial
              </div>
              <div className="text-[10px] text-zinc-400 truncate">
                Garantía 2 Años / 2,000h
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400 shrink-0">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs font-black uppercase text-white truncate">
                Patio Km 22 Duarte
              </div>
              <div className="text-[10px] text-zinc-400 truncate">
                Despacho Nacional Inmediato
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400 shrink-0">
              <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs font-black uppercase text-white truncate">
                Auxilio SOS 24/7
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold truncate">
                Llegada a obra &lt; 120 min
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400 shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs font-black uppercase text-white truncate">
                Comprobante Fiscal
              </div>
              <div className="text-[10px] text-zinc-400 truncate">
                DGII NCF B01 / B15
              </div>
            </div>
          </div>
        </div>

        {/* TIER 2: 5 BALANCED COLUMNS ON DESKTOP, 4 ON TABLET, ACCORDION ON MOBILE */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 lg:gap-8 pt-2">
          
          {/* Column 1: Institutional & Corporate ID */}
          <div className="space-y-4 md:col-span-4 lg:col-span-1 md:flex md:flex-row md:items-center md:justify-between md:gap-6 lg:flex-col lg:items-start lg:space-y-4">
            <div className="space-y-2 md:max-w-md lg:max-w-none">
              <TMDLogo variant="responsive" className="h-8 sm:h-9" />
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Líder en distribución, renta y soporte técnico para construcción pesada, minería y agroindustria en República Dominicana.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-row lg:flex-col gap-2.5 shrink-0">
              <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1 text-xs">
                <div className="flex justify-between items-center gap-4 text-[11px]">
                  <span className="text-zinc-500 font-bold uppercase">RNC DGII:</span>
                  <span className="font-mono font-bold text-zinc-200">1-01-85732-1</span>
                </div>
                <div className="flex justify-between items-center gap-4 text-[11px]">
                  <span className="text-zinc-500 font-bold uppercase">Facturación:</span>
                  <span className="font-bold text-amber-400">NCF B01 / B15</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {['JCB', 'LiuGong', 'Ammann', 'Kubota', 'Yanmar'].map(brand => (
                  <span key={brand} className="px-2 py-0.5 rounded-[4px] bg-white/[0.04] text-[10px] font-bold text-zinc-400 border border-white/[0.06]">
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Maquinaria Pesada */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => toggleMobileSection('machinery')}
              className="w-full flex items-center justify-between sm:cursor-default text-left"
            >
              <h4 className="font-black text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <HardHat className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Maquinaria Pesada</span>
              </h4>
              <ChevronDown className={`w-4 h-4 text-zinc-400 sm:hidden transition-transform duration-200 ${openMobileSection === 'machinery' ? 'rotate-180 text-amber-400' : ''}`} />
            </button>
            <ul className={`${openMobileSection === 'machinery' ? 'block' : 'hidden sm:block'} space-y-2 text-xs font-semibold text-zinc-300 pt-1 sm:pt-0`}>
              <li>
                <button onClick={() => onNavigate('#/machinery-hub')} className="hover:text-amber-400 transition-colors text-left flex items-center justify-between w-full cursor-pointer py-0.5 text-amber-400 font-bold">
                  <span>Centro de Maquinaria</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('#/machinery?category=Retroexcavadoras')} className="hover:text-white transition-colors text-left block w-full cursor-pointer py-0.5 text-zinc-400">
                  Retroexcavadoras 4x4
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('#/machinery?category=Excavadoras')} className="hover:text-white transition-colors text-left block w-full cursor-pointer py-0.5 text-zinc-400">
                  Excavadoras de Cadenas
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('#/machinery?category=Cargadores')} className="hover:text-white transition-colors text-left block w-full cursor-pointer py-0.5 text-zinc-400">
                  Palas Cargadoras & Minería
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('#/machinery?category=Compactación')} className="hover:text-white transition-colors text-left block w-full cursor-pointer py-0.5 text-zinc-400">
                  Compactación & Rodillos
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('#/machinery?category=Manipuladores')} className="hover:text-white transition-colors text-left block w-full cursor-pointer py-0.5 text-zinc-400">
                  Manipuladores Loadall
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Repuestos OEM */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => toggleMobileSection('parts')}
              className="w-full flex items-center justify-between sm:cursor-default text-left"
            >
              <h4 className="font-black text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Cog className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Repuestos OEM</span>
              </h4>
              <ChevronDown className={`w-4 h-4 text-zinc-400 sm:hidden transition-transform duration-200 ${openMobileSection === 'parts' ? 'rotate-180 text-amber-400' : ''}`} />
            </button>
            <ul className={`${openMobileSection === 'parts' ? 'block' : 'hidden sm:block'} space-y-2 text-xs font-semibold text-zinc-300 pt-1 sm:pt-0`}>
              <li>
                <button onClick={() => onNavigate('#/parts-hub')} className="hover:text-amber-400 transition-colors text-left flex items-center justify-between w-full cursor-pointer py-0.5 text-amber-400 font-bold">
                  <span>Centro de Repuestos</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('#/parts?category=Filtros')} className="hover:text-white transition-colors text-left block w-full cursor-pointer py-0.5 text-zinc-400">
                  Filtros & Mantenimiento
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('#/parts?category=Tren%20de%20Rodaje')} className="hover:text-white transition-colors text-left block w-full cursor-pointer py-0.5 text-zinc-400">
                  Tren de Rodaje & Orugas
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('#/parts?category=Hidráulica')} className="hover:text-white transition-colors text-left block w-full cursor-pointer py-0.5 text-zinc-400">
                  Sistemas Hidráulicos & Sellos
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('#/parts?category=Motor')} className="hover:text-white transition-colors text-left block w-full cursor-pointer py-0.5 text-zinc-400">
                  Motor Diésel & Inyección
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('#/parts?category=Desgaste')} className="hover:text-white transition-colors text-left block w-full cursor-pointer py-0.5 text-zinc-400">
                  Herramientas de Corte (GET)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Renta & Taller en Obra */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => toggleMobileSection('services')}
              className="w-full flex items-center justify-between sm:cursor-default text-left"
            >
              <h4 className="font-black text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Renta & Taller</span>
              </h4>
              <ChevronDown className={`w-4 h-4 text-zinc-400 sm:hidden transition-transform duration-200 ${openMobileSection === 'services' ? 'rotate-180 text-amber-400' : ''}`} />
            </button>
            <ul className={`${openMobileSection === 'services' ? 'block' : 'hidden sm:block'} space-y-2 text-xs font-semibold text-zinc-300 pt-1 sm:pt-0`}>
              <li>
                <button onClick={() => onNavigate('#/rental-hub')} className="hover:text-amber-400 transition-colors text-left flex items-center justify-between w-full cursor-pointer py-0.5 text-amber-400 font-bold">
                  <span>Centro de Renta</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('#/services-hub')} className="hover:text-amber-400 transition-colors text-left flex items-center justify-between w-full cursor-pointer py-0.5 text-amber-400 font-bold">
                  <span>Centro de Servicios</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('#/service')} className="hover:text-white transition-colors text-left block w-full cursor-pointer py-0.5 text-zinc-400">
                  Taller Central Km 22 (8 Bahías)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('#/emergency-dispatch')} className="hover:text-emerald-400 transition-colors text-left flex items-center gap-1.5 w-full cursor-pointer py-0.5 text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Taller Móvil SOS 24/7</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('#/oil-lab')} className="hover:text-white transition-colors text-left block w-full cursor-pointer py-0.5 text-zinc-400">
                  Laboratorio de Aceites SOS
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('#/livelink')} className="hover:text-white transition-colors text-left block w-full cursor-pointer py-0.5 text-zinc-400">
                  Telemetría LiveLink™
                </button>
              </li>
            </ul>
          </div>

          {/* Column 5: Sedes, Contacto & Canales */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => toggleMobileSection('contact')}
              className="w-full flex items-center justify-between sm:cursor-default text-left"
            >
              <h4 className="font-black text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Sedes & Contacto</span>
              </h4>
              <ChevronDown className={`w-4 h-4 text-zinc-400 sm:hidden transition-transform duration-200 ${openMobileSection === 'contact' ? 'rotate-180 text-amber-400' : ''}`} />
            </button>
            <div className={`${openMobileSection === 'contact' ? 'block' : 'hidden sm:block'} space-y-2.5 text-xs text-zinc-400 pt-1 sm:pt-0`}>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <strong className="text-white block text-xs font-bold mb-0.5">Sede Central Km 22:</strong>
                <span className="text-[11px] leading-tight block">Autopista Duarte Km 22, Pedro Brand, Santo Domingo</span>
              </div>

              <div className="space-y-1.5 pt-1">
                <a 
                  href="tel:18095601234" 
                  className="w-full py-2 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center gap-2 border border-emerald-500/20 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span>+1 (809) 560-1234 (24/7)</span>
                </a>
                <a 
                  href="mailto:ventas@tmddominicana.com" 
                  className="w-full py-1.5 px-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-zinc-300 text-xs flex items-center gap-2 border border-white/[0.06] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate">ventas@tmddominicana.com</span>
                </a>
              </div>

              <button
                onClick={() => onNavigate('#/bio')}
                className="w-full py-2 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer mt-2"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Bio-Link & Redes 24/7</span>
              </button>
            </div>
          </div>

        </div>

        {/* TIER 3: HORIZONTAL SOCIAL & NEWSLETTER STRIP (Balanced & Sleek) */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Social Channels */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 mr-2">
              Canales Oficiales:
            </span>
            <div className="flex items-center gap-1.5">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/[0.06] hover:border-amber-400/50 transition-all cursor-pointer group"
                    title={social.name}
                  >
                    <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Newsletter Input */}
          <div className="w-full md:w-auto">
            {isSubscribed ? (
              <div className="px-4 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Suscrito a alertas de disponibilidad de flota.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center gap-2 w-full md:w-80">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Suscríbase a alertas de inventario..."
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider transition-colors shrink-0 cursor-pointer shadow-sm"
                >
                  {isSubmitting ? '...' : 'Unirse'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* TIER 4: SUB-FOOTER LEGAL & QUICK JUMP */}
        <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-zinc-500 text-xs">
          <div className="text-center sm:text-left text-[11px]">
            <span>© {new Date().getFullYear()} TMD Tecnomaquinarias Diesel S.R.L.</span>
            <span className="mx-2">•</span>
            <span>República Dominicana</span>
            <span className="mx-2 hidden md:inline">•</span>
            <span className="hidden md:inline">RNC: 1-01-85732-1</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px]">
            <button onClick={() => onNavigate('#/brands-directory')} className="hover:text-zinc-200 transition-colors cursor-pointer">
              Marcas Homologadas
            </button>
            <button onClick={() => onNavigate('#/about')} className="hover:text-zinc-200 transition-colors cursor-pointer">
              Empresa
            </button>
            <button onClick={() => onNavigate('#/branches')} className="hover:text-zinc-200 transition-colors cursor-pointer">
              Sedes
            </button>
            <button onClick={() => onNavigate('#/warranty')} className="hover:text-zinc-200 transition-colors cursor-pointer">
              Garantías
            </button>
            <button onClick={() => onNavigate('#/portal')} className="hover:text-zinc-200 transition-colors cursor-pointer">
              Portal VIP
            </button>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-amber-400 font-bold transition-colors cursor-pointer border border-white/[0.06]"
            >
              <span>Subir</span>
              <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
