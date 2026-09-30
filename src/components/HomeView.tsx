import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Wrench, 
  Cpu, 
  Clock, 
  CheckCircle2, 
  PhoneCall, 
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  HardHat,
  Cog,
  FileSpreadsheet,
  FileText,
  Award,
  Search,
  Zap,
  SlidersHorizontal,
  X,
  Building2,
  Calendar,
  Scale,
  MapPin,
  RotateCw,
  Video,
  Sparkles,
  LayoutGrid,
  Columns,
  DollarSign,
  RefreshCw,
  Layers,
  Compass,
  Radio,
  Phone,
  MessageCircle
} from 'lucide-react';
import { MACHINES_DATA, USD_TO_DOP_RATE } from '../data/catalog';
import { useCart } from '../context/CartContext';
import { useComparison } from '../context/ComparisonContext';
import { Machine } from '../types';
import { PriceEstimateModal } from './PriceEstimateModal';
import { Machine360Modal } from './Machine360Modal';
import { AboveFoldConversionDeck } from './home/AboveFoldConversionDeck';
import { LiveMarquee } from './LiveMarquee';
import { BrandLogo } from './common/BrandLogos';
import { OFFICIAL_BRANDS } from '../data/brandsData';
import { TestDriveBookingModal } from './media/TestDriveBookingModal';
import tmdEntranceImg from '../assets/images/tmd_sede_central_entrance_km22.jpg';
import tmdPatioImg from '../assets/images/tmd_sede_central_patio_km22.jpg';
import { IndustrialTiltCard } from './effects/IndustrialTiltCard';
import { triggerHaptic } from '../utils/haptics';

// Staggered 'fade-in-up' entrance animation variants for the main hero viewport
const heroContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const heroFadeInUpItem: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

interface HomeViewProps {
  onNavigate: (route: string) => void;
  onSelectMachine: (machineId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onSelectMachine }) => {
  const { addMachineToQuote, currency, exchangeRate } = useCart();
  const { 
    toggleMachineCompare, 
    isComparing, 
  } = useComparison();

  // Reactive financial formatters using live BCRD rate
  const formatMachineryPrice = useCallback((usd: number) => {
    if (currency === 'DOP') {
      return `RD$ ${Math.round(usd * exchangeRate).toLocaleString('es-DO')}`;
    }
    return `US$ ${usd.toLocaleString('en-US')}`;
  }, [currency, exchangeRate]);

  const formatLeasingEstimate = useCallback((usd: number) => {
    const monthlyUsd = Math.round(usd * 0.016);
    if (currency === 'DOP') {
      return `RD$ ${Math.round(monthlyUsd * exchangeRate).toLocaleString('es-DO')}/mes`;
    }
    return `US$ ${monthlyUsd.toLocaleString('en-US')}/mes`;
  }, [currency, exchangeRate]);

  // Safe image & cost helpers
  const getMachineImg = useCallback((m?: Machine | null): string => {
    if (!m) return '/assets/machinery/jcb_3cx_thumb.jpg';
    if (m.image) return m.image;
    if (Array.isArray((m as any).images) && (m as any).images[0]) return (m as any).images[0];
    return '/assets/machinery/jcb_3cx_thumb.jpg';
  }, []);

  const getMachineCost = useCallback((m?: Machine | null): number => {
    if (!m) return 0;
    return m.basePriceUsd || (m as any).priceUsd || 0;
  }, []);

  // Flagship Hero Showcase State (Auto-cycling enterprise carousel with pause on hover)
  const [heroMachineIndex, setHeroMachineIndex] = useState<number>(0);
  const [isHeroAutoPlaying, setIsHeroAutoPlaying] = useState<boolean>(true);
  const heroMachines = useMemo(() => {
    return [
      MACHINES_DATA.find(m => m.id === 'jcb-3cx-eco') || MACHINES_DATA[0],
      MACHINES_DATA.find(m => m.id === 'jcb-3cx-compact') || MACHINES_DATA[1],
      MACHINES_DATA.find(m => m.id === 'jcb-1cxt') || MACHINES_DATA[3],
      MACHINES_DATA.find(m => m.id === 'jcb-250t') || MACHINES_DATA[5],
    ].filter(Boolean);
  }, []);
  const activeHeroMachine = heroMachines[heroMachineIndex] || heroMachines[0];

  useEffect(() => {
    if (!isHeroAutoPlaying || heroMachines.length <= 1) return;
    const interval = setInterval(() => {
      setHeroMachineIndex((prev) => (prev + 1) % heroMachines.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHeroAutoPlaying, heroMachines.length]);

  // Interactive filters on Showroom
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [selectedBrand, setSelectedBrand] = useState<string>('Todas');
  const [quickSearchQuery, setQuickSearchQuery] = useState<string>('');
  const [desktopFleetViewMode, setDesktopFleetViewMode] = useState<'grid' | 'carousel'>('carousel');
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = 350;
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const categories = ['TODOS', 'RETROEXCAVADORAS', 'EXCAVADORAS', 'TRACTORES', 'COMPACTACIÓN', 'CARGADORES'];

  const filteredMachines = useMemo(() => {
    return MACHINES_DATA.filter((m) => {
      const matchCat = selectedCategory === 'TODOS' || m.category.toUpperCase() === selectedCategory;
      const matchBrand = selectedBrand === 'Todas' || m.brand.toLowerCase() === selectedBrand.toLowerCase();
      const matchQuery = !quickSearchQuery.trim() ||
        m.name.toLowerCase().includes(quickSearchQuery.toLowerCase()) ||
        m.modelCode.toLowerCase().includes(quickSearchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(quickSearchQuery.toLowerCase());
      return matchCat && matchBrand && matchQuery;
    });
  }, [selectedCategory, selectedBrand, quickSearchQuery]);

  // Hero Section Dynamic Typewriter Text
  const HERO_ROTATING_PHRASES = useMemo(() => [
    'DISTRIBUIDOR AUTORIZADO JCB & LIUGONG EN RD',
    'EXCAVADORAS & PALAS DE ALTO TONELAJE',
    'REPUESTOS ORIGINALES OEM & TALLER MÓVIL 24/7',
    'FINANCIAMIENTO & LEASING COMERCIAL EN RD',
    'TELEMETRÍA SATELITAL & HORÓMETROS LIVELINK™'
  ], []);

  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [typewriterText, setTypewriterText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = HERO_ROTATING_PHRASES[typewriterIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && typewriterText === currentPhrase) {
      timeout = setTimeout(() => setIsDeleting(true), 2200);
    } else if (isDeleting && typewriterText === '') {
      setIsDeleting(false);
      setTypewriterIndex((prev) => (prev + 1) % HERO_ROTATING_PHRASES.length);
    } else {
      const nextCharLength = isDeleting ? typewriterText.length - 1 : typewriterText.length + 1;
      const speed = isDeleting ? 25 : 50;
      timeout = setTimeout(() => {
        setTypewriterText(currentPhrase.substring(0, nextCharLength));
      }, speed);
    }

    return () => clearTimeout(timeout);
  }, [typewriterText, isDeleting, typewriterIndex, HERO_ROTATING_PHRASES]);

  // Modals state
  const [active360Machine, setActive360Machine] = useState<Machine | null>(null);
  const [active360Tab, setActive360Tab] = useState<'360' | 'video' | 'dimensions'>('360');
  const [estimateMachine, setEstimateMachine] = useState<Machine | null>(null);
  const [isTestDriveModalOpen, setIsTestDriveModalOpen] = useState<boolean>(false);

  // Chapter 3: Trade-In Calculator State
  const [tradeInBrand, setTradeInBrand] = useState<string>('JCB');
  const [tradeInType, setTradeInType] = useState<string>('Retroexcavadora');
  const [tradeInYear, setTradeInYear] = useState<number>(2020);
  const [tradeInHours, setTradeInHours] = useState<number>(4500);

  const estimatedTradeInUsd = useMemo(() => {
    let base = 48000;
    if (tradeInType === 'Excavadora') base = 75000;
    if (tradeInType === 'Cargador') base = 55000;
    if (tradeInType === 'Rodillo') base = 38000;
    if (tradeInBrand === 'Caterpillar') base *= 1.05;
    if (tradeInBrand === 'JCB') base *= 1.02;

    const age = 2026 - tradeInYear;
    const ageDeprec = Math.max(0.35, 1 - age * 0.055);
    const hoursDeprec = Math.max(0.4, 1 - (tradeInHours / 12000) * 0.45);
    return Math.round(base * ageDeprec * hoursDeprec);
  }, [tradeInBrand, tradeInType, tradeInYear, tradeInHours]);

  const estimatedTradeInDop = useMemo(() => {
    return Math.round(estimatedTradeInUsd * exchangeRate);
  }, [estimatedTradeInUsd, exchangeRate]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8 sm:space-y-12 pb-16 animate-in fade-in-50 duration-400 ease-out fill-mode-both"
    >
      {/* ========================================================================= */}
      {/* 1. ORIGINAL HERO SECTION: Monumental Headline & Interactive 360 Card      */}
      {/* ========================================================================= */}
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 max-w-[1780px] mx-auto pt-5 sm:pt-7 lg:pt-8 relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-4/5 h-28 bg-amber-500/15 dark:bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <section id="top-hero-section" className="relative overflow-hidden rounded-[6px] bg-white dark:bg-zinc-950 text-slate-900 dark:text-white border border-slate-200 dark:border-white/[0.08] shadow-xl">
          {/* Background Image */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src={activeHeroMachine.image || "/images/tmd_portal_hero.jpg"}
              alt="Maquinaria Pesada en República Dominicana"
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover object-center opacity-65 sm:opacity-75 scale-102 filter brightness-105 contrast-110 transition-all duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/20 dark:from-zinc-950/92 dark:via-zinc-950/55 dark:to-zinc-950/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent dark:from-zinc-950 dark:via-zinc-950/30 dark:to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(245,158,11,0.15),rgba(0,0,0,0))] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(245,158,11,0.22),rgba(0,0,0,0))] pointer-events-none" />
          </div>

          <motion.div
            variants={heroContainerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10 px-3.5 py-6 sm:px-8 sm:py-9 lg:px-12 lg:py-11 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center"
          >
            {/* Left Column: Headline, Live Status & Search */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              {/* Live Operational Status Badges */}
              <motion.div variants={heroFadeInUpItem} className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[5px] bg-white/95 dark:bg-zinc-900/95 border border-amber-500/50 text-slate-900 dark:text-zinc-100 text-[11px] sm:text-xs font-black tracking-wider uppercase font-mono shadow-md backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 dark:bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 dark:bg-amber-400" />
                  </span>
                  <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 dark:from-amber-400 dark:via-amber-200 dark:to-amber-400 bg-clip-text text-transparent font-bold">
                    {typewriterText}
                  </span>
                  <span className="inline-block w-1.5 h-3.5 bg-amber-500 dark:bg-amber-400 animate-pulse ml-0.5 rounded-[1px]" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[5px] bg-white/95 dark:bg-zinc-900/95 border border-slate-300 dark:border-zinc-700/80 text-slate-700 dark:text-zinc-200 text-[11px] sm:text-xs font-bold tracking-wider uppercase font-mono shadow-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>GARANTÍA OFICIAL 2 AÑOS / 2,000 HRS</span>
                </div>
              </motion.div>

              {/* Monumental Heavy Industrial Typography */}
              <motion.h1 
                variants={heroFadeInUpItem} 
                className="text-3xl sm:text-5xl md:text-6xl lg:text-[3.95rem] font-black font-display tracking-tight text-slate-900 dark:text-white uppercase leading-[0.96] drop-shadow-sm dark:drop-shadow-xl"
              >
                <span className="block text-slate-900 dark:text-white">TECNOMAQUINARIAS DIESEL</span>{' '}
                <span className="inline-block bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 dark:from-amber-400 dark:via-yellow-200 dark:via-amber-300 dark:to-amber-500 bg-clip-text text-transparent font-black drop-shadow-[0_2px_10px_rgba(217,119,6,0.3)] dark:drop-shadow-[0_4px_16px_rgba(245,158,11,0.4)]">
                  DOMINICANA
                </span>
              </motion.h1>

              {/* Body Typography */}
              <motion.p 
                variants={heroFadeInUpItem}
                className="text-xs sm:text-sm md:text-base text-slate-700 dark:text-zinc-300 max-w-2xl font-sans leading-relaxed"
              >
                Distribuidor oficial autorizado de <strong className="text-slate-900 dark:text-white font-black">JCB, LIUGONG, LS TRACTOR Y AMMANN</strong> en República Dominicana. Maquinaria pesada certificada, servicio de taller móvil en obra 24/7 y almacén central de repuestos genuinos en el Km 22, Autopista Duarte.
              </motion.p>

              {/* Quick Search */}
              <motion.div variants={heroFadeInUpItem} className="relative max-w-xl">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-400" />
                <input
                  type="text"
                  placeholder="BUSCAR MODELO (EJ. 3CX, 922E, 540) O CATEGORÍA..."
                  value={quickSearchQuery}
                  onChange={(e) => setQuickSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-24 py-3 rounded-[5px] bg-white/95 dark:bg-zinc-900/95 border border-slate-300 dark:border-white/[0.1] text-xs font-mono uppercase tracking-wider text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-hidden focus:border-amber-500 shadow-md backdrop-blur-md"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase bg-amber-500/10 px-2 py-0.5 rounded-[3px]">
                  EN VIVO
                </span>
              </motion.div>

              {/* CTAs */}
              <motion.div variants={heroFadeInUpItem} className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('#/machinery')}
                  className="px-5 py-3 rounded-[5px] bg-gradient-to-r from-[#d99b26] via-[#e5a83b] to-[#d99b26] hover:from-[#e5a83b] hover:to-[#f0b54d] text-zinc-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_4px_20px_rgba(217,155,38,0.3)] flex items-center gap-2 cursor-pointer active:scale-98 font-display"
                >
                  <span>VER CATÁLOGO 2026</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('#/checkout')}
                  className="px-4 py-3 rounded-[5px] bg-white/90 dark:bg-zinc-900/90 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-white font-bold text-xs uppercase tracking-wider transition-all border border-slate-300 dark:border-white/[0.1] flex items-center gap-2 cursor-pointer shadow-sm font-display"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>EMITIR PROFORMA NCF</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('#/financing')}
                  className="px-4 py-3 rounded-[5px] bg-white/90 dark:bg-zinc-900/90 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-white font-bold text-xs uppercase tracking-wider transition-all border border-slate-300 dark:border-white/[0.1] flex items-center gap-2 cursor-pointer shadow-sm font-display"
                >
                  <DollarSign className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>FINANCIAMIENTO</span>
                </button>
              </motion.div>

              {/* Stat Counters */}
              <motion.div variants={heroFadeInUpItem} className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-white/[0.08] max-w-xl font-mono">
                <div>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">24+ AÑOS</span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 block uppercase">EN REP. DOMINICANA</span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-[#e0a22a]">KM 22</span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 block uppercase">AUTOPISTA DUARTE</span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">24/7</span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 block uppercase">TALLER MÓVIL EN OBRA</span>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Interactive Flagship Machinery Card */}
            <motion.div 
              variants={heroFadeInUpItem}
              className="lg:col-span-5 rounded-[6px] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-slate-200 dark:border-white/[0.12] p-4 sm:p-5 shadow-2xl space-y-4"
            >
              {/* Tab Selector */}
              <div className="space-y-2 pb-3 border-b border-slate-200 dark:border-white/[0.08]">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-700 dark:text-zinc-300 font-display">
                    EQUIPOS EN PATIO •
                  </span>
                  <div className="flex gap-1.5">
                    {heroMachines.map((m, idx) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setHeroMachineIndex(idx);
                          setIsHeroAutoPlaying(false);
                          triggerHaptic();
                        }}
                        className={`px-3 py-1 rounded-[4px] text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          heroMachineIndex === idx
                            ? 'bg-amber-500 text-slate-950 font-bold border border-amber-600 shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-white/[0.06]'
                        }`}
                      >
                        {m.modelCode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Machine Viewport */}
              <div className="relative aspect-[16/10] w-full max-h-[360px] rounded-[5px] overflow-hidden bg-slate-900 dark:bg-zinc-950 border border-slate-200 dark:border-white/[0.08] group shadow-2xl">
                {/* CAD Brackets */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-500 pointer-events-none z-20" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-500 pointer-events-none z-20" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-500 pointer-events-none z-20" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-500 pointer-events-none z-20" />

                <img
                  src={getMachineImg(activeHeroMachine)}
                  alt={activeHeroMachine.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 filter brightness-105 contrast-110 transition-all duration-700 ease-out"
                />

                <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-2 z-20">
                  <div className="bg-zinc-950/95 px-2.5 py-1 rounded-[4px] text-[11px] font-black text-amber-400 border border-amber-400/40 uppercase font-mono shadow-lg">
                    • {activeHeroMachine.brand} • {activeHeroMachine.modelCode}
                  </div>
                  <div className="bg-zinc-950/95 px-2.5 py-1 rounded-[4px] text-[10px] font-black text-zinc-200 border border-white/[0.1] uppercase font-mono shadow-lg">
                    • EM PATIO KM 22
                  </div>
                </div>

                <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between gap-2 z-20">
                  <div className="inline-flex items-center gap-1.5 bg-zinc-950/90 px-2 py-1 rounded-[4px] text-[10px] font-bold text-zinc-300 border border-white/10 font-mono uppercase">
                    <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
                    <span>LIVELINK™ GPS ACTIVO</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActive360Tab('360');
                      setActive360Machine(activeHeroMachine);
                      triggerHaptic();
                    }}
                    className="ml-auto px-3.5 py-1.5 rounded-[4px] bg-slate-900/90 text-amber-400 text-xs font-mono font-black uppercase tracking-wider transition-all flex items-center gap-1.5 border border-amber-500/50 cursor-pointer shadow-xl hover:scale-105"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>GIRO 360°</span>
                  </button>
                </div>
              </div>

              {/* Machine Specs & Pricing */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-black font-display text-slate-900 dark:text-zinc-100 uppercase tracking-tight">
                      {activeHeroMachine.name}
                    </h3>
                    <span className="text-xs font-mono text-amber-600 dark:text-[#e0a22a] font-bold uppercase">
                      {activeHeroMachine.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block uppercase font-bold">INVERSIÓN ESTIMADA ({currency})</span>
                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono">
                      {formatMachineryPrice(getMachineCost(activeHeroMachine))}
                    </span>
                  </div>
                </div>

                {/* 3-Column CAD Spec Badges */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs py-2.5 px-3 rounded-[5px] bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08]">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold uppercase">POTENCIA</span>
                    <span className="font-black text-amber-600 dark:text-amber-400 font-mono text-xs sm:text-sm">{activeHeroMachine.powerHp} HP</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold uppercase">PESO OP.</span>
                    <span className="font-black text-slate-800 dark:text-zinc-200 font-mono text-xs sm:text-sm">{(activeHeroMachine.operatingWeightKg / 1000).toFixed(1)}T</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold uppercase">MOTOR DIESEL</span>
                    <span className="font-black text-slate-800 dark:text-zinc-200 truncate block text-xs">{activeHeroMachine.engine}</span>
                  </div>
                </div>

                {/* High-Conversion Action Buttons */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      addMachineToQuote(activeHeroMachine);
                      onNavigate('#/checkout');
                      triggerHaptic();
                    }}
                    className="flex-1 py-2.5 bg-gradient-to-r from-[#d99b26] via-[#e5a83b] to-[#d99b26] hover:from-[#e5a83b] hover:to-[#f0b54d] text-zinc-950 font-black uppercase tracking-wider rounded-[5px] text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>COTIZAR {activeHeroMachine.modelCode}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectMachine(activeHeroMachine.id);
                      onNavigate(`#/machinery/${activeHeroMachine.id}`);
                      triggerHaptic();
                    }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:text-zinc-200 font-bold uppercase tracking-wider rounded-[5px] text-xs transition-all cursor-pointer border border-slate-300 dark:border-white/[0.1]"
                  >
                    FICHA
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Above-The-Fold Action Deck */}
            <motion.div variants={heroFadeInUpItem} className="lg:col-span-12">
              <AboveFoldConversionDeck
                onNavigate={onNavigate}
                onOpenQuoteModal={(m) => {
                  if (m) {
                    setEstimateMachine(m);
                  } else {
                    onNavigate('#/checkout');
                  }
                }}
                onScrollToCatalog={() => {
                  const el = document.getElementById('fleet-catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onScrollToTradeIn={() => {
                  const el = document.getElementById('tradein-valuation-module');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                featuredMachines={MACHINES_DATA}
              />
            </motion.div>
          </motion.div>
        </section>
      </div>

      {/* Live Marquee Ticker */}
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 max-w-[1780px] mx-auto -mt-3 sm:-mt-6 relative z-20">
        <div className="rounded-[6px] overflow-hidden shadow-md border border-slate-200 dark:border-white/[0.08] bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md">
          <LiveMarquee onNavigate={onNavigate} />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ORIGINAL SHOWROOM: Immediate Pricing, Leasing & Direct Navigation       */}
      {/* ========================================================================= */}
      <section id="fleet-catalog-section" className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1780px] mx-auto scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-3.5 gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black font-display uppercase tracking-wider text-[#e0a22a]">
                Catálogo de Flota con Precios Transparentes
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-[4px] bg-[#0c0c10] text-zinc-300 border border-white/[0.08] font-mono font-bold uppercase">
                {filteredMachines.length} EN PATIO
              </span>
              {selectedBrand !== 'Todas' && (
                <button
                  type="button"
                  onClick={() => setSelectedBrand('Todas')}
                  className="text-[10px] text-[#e0a22a] underline font-bold uppercase font-mono cursor-pointer"
                >
                  (FILTRO {selectedBrand} ACTIVO • LIMPIAR)
                </button>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-display tracking-tight text-slate-900 dark:text-white uppercase">
              MAQUINARIA PESADA LISTA EN SHOWROOM
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-0.5 max-w-2xl font-sans">
              Equipos de entrega inmediata con precios en USD y RD$, leasing pre-aprobado y cotización NCF instantánea para contratistas e ingenieros.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 p-2 rounded-xl bg-gradient-to-r from-[#14141c] via-[#0c0c12] to-[#06060a] border border-white/[0.08] mb-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  triggerHaptic();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer border ${
                  selectedCategory === cat
                    ? 'bg-[#d99b26] text-black border-[#e0a22a] shadow-xs'
                    : 'bg-[#0c0c10] text-zinc-400 hover:text-white hover:bg-[#14141c] border-white/[0.06]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Right Controls: View mode switcher & full fleet link */}
          <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-white/[0.06]">
            <div className="flex items-center gap-1 bg-[#0c0c10] p-0.5 rounded-lg border border-white/[0.06] text-xs">
              <button
                type="button"
                onClick={() => setDesktopFleetViewMode('carousel')}
                className={`px-2 py-1 rounded-md font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer text-[11px] ${
                  desktopFleetViewMode === 'carousel'
                    ? 'bg-[#1c1c24] text-[#e0a22a] border border-[#d99b26]/50 shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Carrusel</span>
              </button>
              <button
                type="button"
                onClick={() => setDesktopFleetViewMode('grid')}
                className={`px-2 py-1 rounded-md font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer text-[11px] ${
                  desktopFleetViewMode === 'grid'
                    ? 'bg-[#1c1c24] text-[#e0a22a] border border-[#d99b26]/50 shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cuadrícula</span>
              </button>
            </div>

            {desktopFleetViewMode === 'carousel' && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollCarousel('left')}
                  className="p-1.5 rounded-md bg-[#0c0c10] hover:bg-[#1c1c24] text-zinc-300 transition-colors cursor-pointer border border-white/[0.08]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCarousel('right')}
                  className="p-1.5 rounded-md bg-[#0c0c10] hover:bg-[#1c1c24] text-zinc-300 transition-colors cursor-pointer border border-white/[0.08]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => onNavigate('#/machinery')}
              className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-[#e0a22a] hover:underline pl-1 cursor-pointer shrink-0"
            >
              <span>Ver Flota</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Carousel or Grid */}
        <div className="relative group/carousel">
          <div
            ref={carouselRef}
            className={
              desktopFleetViewMode === 'carousel'
                ? "-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2.5 sm:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 pt-1 scrollbar-none"
                : "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 pb-3 pt-1"
            }
          >
            {filteredMachines.map((machine) => (
              <IndustrialTiltCard
                key={machine.id}
                maxTilt={4}
                className={`${
                  desktopFleetViewMode === 'carousel'
                    ? "w-[44vw] min-w-[155px] max-w-[195px] sm:w-[240px] sm:max-w-none md:w-[265px] lg:w-[290px] shrink-0 snap-start"
                    : "w-full"
                } bg-gradient-to-b from-[#14141c] via-[#0c0c12] to-[#040407] rounded-xl border border-white/[0.08] hover:border-[#d99b26]/50 overflow-hidden hover:shadow-xl hover:shadow-black/50 transition-all flex flex-col justify-between group`}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-zinc-950 overflow-hidden">
                  <img
                    src={getMachineImg(machine)}
                    alt={machine.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-1.5 left-1.5 bg-zinc-950/90 px-1.5 py-0.5 rounded-[3px] text-[9px] sm:text-[10px] font-black text-[#e0a22a] border border-white/[0.08] font-mono uppercase">
                    {machine.brand}
                  </div>
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMachineCompare(machine.id);
                        triggerHaptic();
                      }}
                      className={`p-1 rounded-[3px] text-[9px] font-bold transition-all shadow cursor-pointer ${
                        isComparing(machine.id)
                          ? 'bg-[#d99b26] text-black border border-[#e0a22a]'
                          : 'bg-zinc-950/90 text-zinc-300 hover:text-[#e0a22a] border border-white/[0.08]'
                      }`}
                      title="Comparar"
                    >
                      <Scale className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActive360Tab('360');
                      setActive360Machine(machine);
                      triggerHaptic();
                    }}
                    className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-[3px] bg-zinc-950/90 hover:bg-[#1c1c24] text-[#e0a22a] text-[9px] sm:text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 border border-white/[0.08] cursor-pointer"
                  >
                    <RotateCw className="w-2.5 h-2.5 animate-spin-slow" />
                    <span>360°</span>
                  </button>
                </div>

                {/* Card Body */}
                <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="mb-1">
                      <h3 className="text-xs sm:text-sm font-black font-display text-white group-hover:text-[#e0a22a] transition-colors truncate uppercase">
                        {machine.name}
                      </h3>
                      <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#e0a22a] truncate block">
                        MOD. {machine.modelCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 py-1 px-1.5 rounded-md bg-zinc-950 border border-white/[0.06] text-[9px] sm:text-[11px] font-mono font-bold text-zinc-300 mb-2 truncate">
                      <span className="text-[#e0a22a]">{machine.powerHp} HP</span>
                      <span className="text-zinc-600">•</span>
                      <span>{(machine.operatingWeightKg / 1000).toFixed(1)}T</span>
                    </div>

                    <div className="flex items-baseline justify-between py-1 px-1.5 rounded-md bg-zinc-950/95 border border-white/[0.06] mb-2 font-mono">
                      <div>
                        <span className="text-[10px] text-zinc-500 block uppercase font-bold">PRECIO DIRECTO</span>
                        <span className="text-xs sm:text-sm font-black text-white font-mono">
                          {formatMachineryPrice(getMachineCost(machine))}
                        </span>
                        <span className="text-[10px] text-zinc-500 block font-mono">
                          ≈ RD$ {Math.round(getMachineCost(machine) * exchangeRate).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase block">LEASING RD</span>
                        <span className="text-[10px] font-mono font-bold text-[#e0a22a]">
                          {formatLeasingEstimate(getMachineCost(machine))}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase block">
                          0% INICIAL
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-white/[0.06] flex items-center gap-1.5 font-display">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectMachine(machine.id);
                        onNavigate(`#/machinery/${machine.id}`);
                        triggerHaptic();
                      }}
                      className="flex-1 py-1 px-1 rounded-md bg-[#0c0c10] hover:bg-[#1c1c24] text-zinc-300 hover:text-white text-[10px] font-black uppercase tracking-wider transition-colors text-center cursor-pointer border border-white/[0.08]"
                    >
                      FICHA
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        addMachineToQuote(machine);
                        onNavigate('#/checkout');
                        triggerHaptic();
                      }}
                      className="flex-1 py-1 px-1.5 rounded-md bg-[#d99b26] hover:bg-[#e0a22a] text-black text-[10px] font-black uppercase tracking-wider transition-colors text-center cursor-pointer shadow-xs"
                    >
                      COTIZAR
                    </button>
                  </div>
                </div>
              </IndustrialTiltCard>
            ))}
          </div>

          {/* Full Fleet Direct Entry Banner */}
          <div className="mt-4 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/[0.08]">
            <div className="text-[11px] text-zinc-400 font-mono uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Inventario Físico Certificado • Entrega Inmediata en Patio Km 22</span>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('#/machinery')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <span>Ver Catálogo Completo ({MACHINES_DATA.length} Modelos)</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. VÍA 2 CHAPTER 2: THE PHYSICAL FORTRESS KM 22 (PATIO & PISTAS DE PRUEBA) */}
      {/* ========================================================================= */}
      <section className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-12 border-t border-slate-200 dark:border-white/[0.08]">
        <div className="rounded-[6px] bg-zinc-950 text-white p-6 sm:p-8 lg:p-10 border border-white/[0.1] relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Physical Fortress Credentials */}
            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-[2px] bg-amber-400 text-black text-[10px] font-mono font-black uppercase">
                  SEDE CENTRAL FÍSICA
                </span>
                <span className="text-zinc-400 text-[10px] font-mono">
                  18.5284° N, 70.0436° W
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight font-display">
                Instalaciones Centrales &amp; Pistas de Prueba en Km 22
              </h2>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                La mayor ventaja competitiva de Tecnomaquinarias Diesel es la tangibilidad de su operación. Frente a comercializadores sin infraestructura, en nuestro complejo de Autopista Duarte Km 22 usted prueba la máquina en terreno real antes de autorizar el financiamiento.
              </p>

              {/* 3 Pillars */}
              <div className="space-y-3 pt-2 font-display">
                <div className="flex items-start gap-3 p-3 rounded-[4px] bg-zinc-900/80 border border-white/[0.06]">
                  <div className="w-8 h-8 rounded-[3px] bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase text-white">1. Pistas de Demostración en Tierra Real</h3>
                    <p className="text-[11px] text-zinc-400 font-sans mt-0.5">Pendientes de excavación, balastros y prueba de potencia hidráulica con nuestros ingenieros de producto.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-[4px] bg-zinc-900/80 border border-white/[0.06]">
                  <div className="w-8 h-8 rounded-[3px] bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase text-white">2. Nave Principal con 18 Bahías Diésel</h3>
                    <p className="text-[11px] text-zinc-400 font-sans mt-0.5">Banco de pruebas hidráulico a 350 Bar, overhaul certificado y laboratorio de inyección.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-[4px] bg-zinc-900/80 border border-white/[0.06]">
                  <div className="w-8 h-8 rounded-[3px] bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase text-white">3. Almacén Central de Repuestos & Filtros OEM</h3>
                    <p className="text-[11px] text-zinc-400 font-sans mt-0.5">Más de 5,000 referencias de filtros Donaldson, JCB y LiuGong con despacho en 4 horas a nivel nacional.</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsTestDriveModalOpen(true)}
                  className="px-6 py-3 rounded-[4px] bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Coordinar Visita Técnica a Patio Km 22</span>
                </button>
              </div>
            </div>

            {/* Right Column: Dual Authentic Photos */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-mono">
              <div className="group relative rounded-[4px] overflow-hidden border border-white/[0.1] bg-black aspect-[4/3] shadow-md">
                <img
                  src={tmdEntranceImg}
                  alt="Fachada Principal Tecnomaquinarias Diesel Km 22"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-[2px] bg-black/80 border border-amber-400/40 text-amber-400 text-[9px] font-bold uppercase">
                  FACHADA CENTRAL • KM 22
                </span>
                <span className="absolute bottom-2 left-2 text-white font-black text-xs uppercase drop-shadow-md">
                  Acceso Showroom &amp; Ventas
                </span>
              </div>

              <div className="group relative rounded-[4px] overflow-hidden border border-white/[0.1] bg-black aspect-[4/3] shadow-md">
                <img
                  src={tmdPatioImg}
                  alt="Patio de Maniobras de 15,000 m² Km 22 Autopista Duarte"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-[2px] bg-black/80 border border-emerald-500/40 text-emerald-400 text-[9px] font-bold uppercase">
                  PATIO MANIOBRAS • 15,000 M²
                </span>
                <span className="absolute bottom-2 left-2 text-white font-black text-xs uppercase drop-shadow-md">
                  Pistas de Prueba en Tierra
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. VÍA 2 CHAPTER 3: EXECUTIVE COMMERCIAL SUITE & CONSOLIDATED TRADE-IN     */}
      {/* ========================================================================= */}
      <section id="tradein-valuation-module" className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-12 border-t border-slate-200 dark:border-white/[0.08] scroll-mt-20">
        <div className="mb-6">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">
            INGENIERÍA FINANCIERA & RENOVACIÓN DE FLOTA
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-display mt-1">
            Programas Comerciales, Licitaciones &amp; Trade-In
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Commercial Protocols */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-[4px] bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-amber-500 font-display">
                <Building2 className="w-4 h-4" />
                <h3 className="text-sm font-black uppercase">1. Contratistas Privados &amp; Desarrolladores</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-300 font-sans leading-relaxed">
                Estructuración de contratos de leasing comercial con banca dominicana (Banreservas, Banco BHD, Banco Popular) a plazos de 36 a 60 meses con cuotas deducibles del impuesto sobre la renta (ISR).
              </p>
              <div className="flex gap-2 font-mono text-[10px]">
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">NCF B01 Fiscal</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">0% Inicial Calificado</span>
              </div>
            </div>

            <div className="p-5 rounded-[4px] bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-amber-500 font-display">
                <FileSpreadsheet className="w-4 h-4" />
                <h3 className="text-sm font-black uppercase">2. Licitaciones Públicas del Estado (MOPC / INAPA)</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-300 font-sans leading-relaxed">
                Emisión de pliegos técnicos homologados conforme a la Ley 340-06 de Compras y Contrataciones. Comprobantes fiscales gubernamentales B15 y certificados de origen DGA.
              </p>
              <div className="flex gap-2 font-mono text-[10px]">
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">NCF B15 Gubernamental</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">Certificación Fabricante</span>
              </div>
            </div>
          </div>

          {/* Right Column: Unified Trade-In Estimator Card */}
          <div className="lg:col-span-6">
            <div className="h-full p-5 sm:p-6 rounded-[4px] bg-zinc-950 text-white border border-white/[0.1] shadow-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-[2px] bg-amber-400 text-black text-[10px] font-mono font-black uppercase">
                    MÓDULO DE AVALÚO EN PATIO
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    MERCADO DE OCASIÓN RD
                  </span>
                </div>

                <h3 className="text-lg font-black uppercase font-display text-white">
                  ¿Desea renovar su maquinaria usada?
                </h3>
                <p className="text-xs text-zinc-300 font-sans">
                  Recibimos su equipo usado como inicial para maquinaria 0 Horas con garantía de fábrica o liquidamos en efectivo inmediato.
                </p>
              </div>

              {/* Calculator Form */}
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1 uppercase">Marca del Equipo</label>
                  <select
                    value={tradeInBrand}
                    onChange={(e) => setTradeInBrand(e.target.value)}
                    className="w-full p-2 rounded-[2px] bg-zinc-900 border border-white/10 text-white focus:outline-hidden focus:border-amber-400"
                  >
                    <option value="JCB">JCB</option>
                    <option value="Caterpillar">Caterpillar</option>
                    <option value="LiuGong">LiuGong</option>
                    <option value="Komatsu">Komatsu</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1 uppercase">Tipo de Equipo</label>
                  <select
                    value={tradeInType}
                    onChange={(e) => setTradeInType(e.target.value)}
                    className="w-full p-2 rounded-[2px] bg-zinc-900 border border-white/10 text-white focus:outline-hidden focus:border-amber-400"
                  >
                    <option value="Retroexcavadora">Retroexcavadora</option>
                    <option value="Excavadora">Excavadora</option>
                    <option value="Cargador">Cargador Frontal</option>
                    <option value="Rodillo">Rodillo Compactador</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1 uppercase">Año de Fabricación ({tradeInYear})</label>
                  <input
                    type="range"
                    min={2014}
                    max={2024}
                    value={tradeInYear}
                    onChange={(e) => setTradeInYear(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1 uppercase">Horómetro ({tradeInHours.toLocaleString()} h)</label>
                  <input
                    type="range"
                    min={1000}
                    max={12000}
                    step={500}
                    value={tradeInHours}
                    onChange={(e) => setTradeInHours(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Estimated Valuation Output */}
              <div className="p-3.5 rounded-[3px] bg-zinc-900/90 border border-amber-400/40 font-mono flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-zinc-400 uppercase block font-bold">AVALÚO TÉCNICO ESTIMADO</span>
                  <span className="text-base sm:text-lg font-black text-amber-400">
                    US$ {estimatedTradeInUsd.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-zinc-400 block font-mono">
                    ≈ RD$ {estimatedTradeInDop.toLocaleString()}
                  </span>
                </div>

                <a
                  href={`https://wa.me/18095601234?text=Hola%20Don%20Eduardo,%20deseo%20evaluar%20en%20Trade-In%20mi%20${tradeInBrand}%20${tradeInType}%20a%C3%B1o%20${tradeInYear}%20con%20${tradeInHours}%20horas%20(Aval%C3%BAo%20estimado%20US$%20${estimatedTradeInUsd}).`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-black font-display uppercase tracking-wider transition-all cursor-pointer"
                >
                  Solicitar Inspección en Patio →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. VÍA 2 CHAPTER 4: THE 24/7 ENGINEERING ECOSYSTEM (POSTVENTA & TALLER)   */}
      {/* ========================================================================= */}
      <section className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-12 border-t border-slate-200 dark:border-white/[0.08]">
        <div className="mb-6">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">
            ECOSISTEMA TÉCNICO PERMANENTE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-display mt-1">
            Soporte Operativo &amp; Mantenimiento Crítico en Obra
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-display">
          {/* Card 1 */}
          <div 
            onClick={() => onNavigate('#/service')}
            className="p-5 rounded-[4px] bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/[0.08] hover:border-amber-400/60 shadow-sm transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-[3px] bg-amber-400/10 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
              Taller Móvil SOS 24/7
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 font-sans mt-1 leading-relaxed">
              Unidades móviles de asistencia técnica equipadas con compresor, soldadura y diagnósticos computarizados para rescate en canteras y minas.
            </p>
            <span className="text-[10px] font-bold text-amber-500 mt-3 inline-flex items-center gap-1 font-mono">
              Solicitar Auxilio Mecánico <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          {/* Card 2 */}
          <div 
            onClick={() => onNavigate('#/fullbay')}
            className="p-5 rounded-[4px] bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/[0.08] hover:border-amber-400/60 shadow-sm transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-[3px] bg-amber-400/10 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
              Taller Central 18 Bahías
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 font-sans mt-1 leading-relaxed">
              Banco de pruebas hidráulicas calibrado a 350 Bar. Overhaul certificado de motores diésel pesados y transmisiones PowerShift.
            </p>
            <span className="text-[10px] font-bold text-amber-500 mt-3 inline-flex items-center gap-1 font-mono">
              Ver Gestión de Bahías <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          {/* Card 3 */}
          <div 
            onClick={() => onNavigate('#/livelink')}
            className="p-5 rounded-[4px] bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/[0.08] hover:border-amber-400/60 shadow-sm transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-[3px] bg-amber-400/10 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
              LiveLink™ IoT Telemetría
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 font-sans mt-1 leading-relaxed">
              Geolocalización satelital en vivo, conteo de horómetros reales, alertas tempranas de código de error (DTC) y consumo diésel.
            </p>
            <span className="text-[10px] font-bold text-amber-500 mt-3 inline-flex items-center gap-1 font-mono">
              Portal Telemático <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          {/* Card 4 */}
          <div 
            onClick={() => onNavigate('#/parts')}
            className="p-5 rounded-[4px] bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/[0.08] hover:border-amber-400/60 shadow-sm transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-[3px] bg-amber-400/10 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Cog className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
              Repuestos Genuinos &amp; Filtros
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 font-sans mt-1 leading-relaxed">
              Almacén inteligente en Km 22 con codificación por anaquel y rótulo térmico. Distribución autorizada de filtros Donaldson y piezas OEM.
            </p>
            <span className="text-[10px] font-bold text-amber-500 mt-3 inline-flex items-center gap-1 font-mono">
              Buscar por Número de Parte <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          {/* Card 5 */}
          <div 
            onClick={() => onNavigate('#/about')}
            className="p-5 rounded-[4px] bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/[0.08] hover:border-amber-400/60 shadow-sm transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-[3px] bg-amber-400/10 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
              Garantía Oficial 2 Años
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 font-sans mt-1 leading-relaxed">
              Respaldo directo de fábrica en tren de fuerza, sistema hidráulico y estructura. Contratos de mantenimiento preventivo (PMA) programados.
            </p>
            <span className="text-[10px] font-bold text-amber-500 mt-3 inline-flex items-center gap-1 font-mono">
              Ver Términos de Garantía <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          {/* Card 6 */}
          <div 
            onClick={() => onNavigate('#/academy')}
            className="p-5 rounded-[4px] bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/[0.08] hover:border-amber-400/60 shadow-sm transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-[3px] bg-amber-400/10 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
              Academia de Operadores TMD
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 font-sans mt-1 leading-relaxed">
              Capacitación técnica en cabina para operadores de contratistas: técnicas de ahorro de combustible diésel y seguridad en obras de gran escala.
            </p>
            <span className="text-[10px] font-bold text-amber-500 mt-3 inline-flex items-center gap-1 font-mono">
              Certificación de Personal <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. VÍA 2 CHAPTER 5: OFFICIAL BRANDS PAVILION & CLOSURE BANNER             */}
      {/* ========================================================================= */}
      <section className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-12 border-t border-slate-200 dark:border-white/[0.08]">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">
              ALIANZAS GLOBALES & BANCA LOCAL
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-display mt-1">
              Portafolio de Fabricantes Oficiales
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('#/brands-directory')}
            className="text-xs font-mono font-bold text-amber-500 hover:underline uppercase hidden sm:inline-block cursor-pointer"
          >
            Ver Directorio de Marcas →
          </button>
        </div>

        {/* Brand Logos Strip */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3 items-center">
          {OFFICIAL_BRANDS.map((b) => (
            <div
              key={b.id}
              onClick={() => {
                setSelectedBrand(b.name);
                const el = document.getElementById('fleet-catalog-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                triggerHaptic();
              }}
              className="p-3 rounded-[4px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] hover:border-amber-400/60 shadow-xs transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
            >
              <BrandLogo brandId={b.id} className="h-6 w-auto object-contain grayscale group-hover:grayscale-0 transition-all opacity-70 group-hover:opacity-100" />
              <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-zinc-300 mt-2 uppercase">
                {b.name}
              </span>
            </div>
          ))}
        </div>

        {/* High-Prestige Direct Channels Banner */}
        <div className="mt-12 rounded-[6px] bg-gradient-to-r from-zinc-950 via-zinc-900 to-black p-8 sm:p-12 border border-amber-400/30 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="px-2.5 py-1 rounded-[2px] bg-amber-400 text-black text-[10px] font-mono font-black uppercase">
              COORDINACIÓN DIRECTA DE COMPRA & RENTA
            </span>

            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight font-display">
              ¿Listo para inspeccionar su próxima máquina en Patio Km 22?
            </h2>

            <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
              Comuníquese con nuestra mesa técnica de despacho o agende una cita con Don Eduardo López. Pruebas de campo, emisión inmediata de proformas fiscales NCF y financiamiento comercial aprobado en 24 horas.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 font-display">
              <a
                href="tel:8095601234"
                className="px-6 py-3 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Llamar al Conmutador (809) 560-1234</span>
              </a>

              <a
                href="https://wa.me/18095601234?text=Hola%20Don%20Eduardo,%20deseo%20una%20reuni%C3%B3n%20t%C3%A9cnica%20para%20adquisici%C3%B3n%20de%20maquinaria."
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-[3px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Presidencia</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. CONNECTED MODALS                                                       */}
      {/* ========================================================================= */}
      <Machine360Modal
        machine={active360Machine}
        isOpen={Boolean(active360Machine)}
        initialTab={active360Tab}
        onClose={() => setActive360Machine(null)}
        onNavigate={onNavigate}
      />

      <PriceEstimateModal
        machine={estimateMachine}
        isOpen={Boolean(estimateMachine)}
        onClose={() => setEstimateMachine(null)}
        onNavigate={onNavigate}
      />

      <TestDriveBookingModal
        isOpen={isTestDriveModalOpen}
        onClose={() => setIsTestDriveModalOpen(false)}
      />
    </motion.div>
  );
};
