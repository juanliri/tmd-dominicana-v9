import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  ChevronDown,
  HardHat,
  Cog,
  FileSpreadsheet,
  FileText,
  Award,
  Search,
  Zap,
  SlidersHorizontal,
  X,
  Plus,
  Check,
  Building2,
  Calendar,
  Scale,
  MapPin,
  RotateCw,
  Video,
  Eye,
  Sparkles,
  LayoutGrid,
  Columns,
  HelpCircle,
  DollarSign,
  RefreshCw,
  Layers,
  Compass,
  Radio
} from 'lucide-react';
import { MACHINES_DATA, USD_TO_DOP_RATE } from '../data/catalog';
import { PARTS_DATA } from '../data/parts';
import { useCart } from '../context/CartContext';
import { useComparison } from '../context/ComparisonContext';
import { Machine } from '../types';
import { PriceEstimateModal } from './PriceEstimateModal';
import { Machine360Modal } from './Machine360Modal';
import { AboveFoldConversionDeck } from './home/AboveFoldConversionDeck';
import { ExecutiveTargetProfilesBar } from './home/ExecutiveTargetProfilesBar';
import { ExecutiveTradeInSellingModule } from './home/ExecutiveTradeInSellingModule';
import { DynamicMultiLayeredGrid } from './home/DynamicMultiLayeredGrid';
import { LiveMarquee } from './LiveMarquee';
import { AnimatedMetric } from './AnimatedMetric';
import { BrandLogo } from './common/BrandLogos';
import { OFFICIAL_BRANDS } from '../data/brandsData';
import { PatioKm22DroneVideoShowcase } from './media/PatioKm22DroneVideoShowcase';
import { TestDriveBookingModal } from './media/TestDriveBookingModal';
import { IndustrialTiltCard } from './effects/IndustrialTiltCard';
import { useAuth } from '../context/AuthContext';

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
  const { currentUser, isClient, isStaff, isAdmin, signInWithGoogle } = useAuth();
  const [authPromptFeature, setAuthPromptFeature] = useState<{ title: string; route: string; description: string } | null>(null);
  const { addMachineToQuote, addToCart, formatPrice, currency } = useCart();
  const { 
    toggleMachineCompare, 
    isComparing, 
    openComparison, 
    selectedMachines, 
    maxMachines 
  } = useComparison();

  const handleSelectMachineByName = (machineName: string) => {
    const cleanQuery = machineName.toLowerCase();
    const match = MACHINES_DATA.find((m) => 
      m.name.toLowerCase().includes(cleanQuery) ||
      m.modelCode.toLowerCase().includes(cleanQuery) ||
      cleanQuery.includes(m.name.toLowerCase()) ||
      cleanQuery.includes(m.modelCode.toLowerCase())
    );

    if (match) {
      onSelectMachine(match.id);
    } else {
      onNavigate('#/machinery');
    }
  };

  // Flagship Hero Showcase State (Auto-cycling enterprise carousel with pause on hover)
  const [heroMachineIndex, setHeroMachineIndex] = useState<number>(0);
  const [isHeroAutoPlaying, setIsHeroAutoPlaying] = useState<boolean>(true);
  const heroMachines = useMemo(() => {
    return [
      MACHINES_DATA.find(m => m.id === 'jcb-3cx-eco') || MACHINES_DATA[0], // JCB 3CX
      MACHINES_DATA.find(m => m.id === 'jcb-3cx-compact') || MACHINES_DATA[1], // JCB 3CX Compact
      MACHINES_DATA.find(m => m.id === 'jcb-1cxt') || MACHINES_DATA[3], // JCB 1CXT
      MACHINES_DATA.find(m => m.id === 'jcb-250t') || MACHINES_DATA[5], // JCB 250T
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

  // Interactive filters on homepage
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedBrand, setSelectedBrand] = useState<string>('Todas');
  const [quickSearchQuery, setQuickSearchQuery] = useState<string>('');

  // Quick Spec Modal for instant mobile view without page jumping
  const [previewMachine, setPreviewMachine] = useState<Machine | null>(null);
  const [estimateMachine, setEstimateMachine] = useState<Machine | null>(null);
  const [isTestDriveModalOpen, setIsTestDriveModalOpen] = useState<boolean>(false);

  // Machine 360 Studio Modal State
  const [active360Machine, setActive360Machine] = useState<Machine | null>(null);
  const [active360Tab, setActive360Tab] = useState<'360' | 'video' | 'gallery' | 'dimensions'>('360');

  // Desktop Fleet View Mode: Carousel vs Bento Grid
  const [desktopFleetViewMode, setDesktopFleetViewMode] = useState<'carousel' | 'grid'>('carousel');

  // Horizontal Fleet Carousel Reference & Controls
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 340;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const categories = ['Todos', 'Retroexcavadoras', 'Excavadoras', 'Tractores', 'Compactación', 'Cargadores'];
  const brands = ['Todas', 'JCB', 'LiuGong', 'Ammann', 'LS Tractor', 'Kubota', 'AFEX', 'IMER'];

  const filteredMachines = useMemo(() => {
    return MACHINES_DATA.filter((m) => {
      const matchCat = selectedCategory === 'Todos' || m.category === selectedCategory;
      const matchBrand = selectedBrand === 'Todas' || m.brand === selectedBrand;
      const matchQuery = !quickSearchQuery.trim() || 
        m.name.toLowerCase().includes(quickSearchQuery.toLowerCase()) ||
        m.modelCode.toLowerCase().includes(quickSearchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(quickSearchQuery.toLowerCase());
      return matchCat && matchBrand && matchQuery;
    });
  }, [selectedCategory, selectedBrand, quickSearchQuery]);

  // Featured parts preview for instant checkout
  const featuredParts = useMemo(() => PARTS_DATA.slice(0, 4), []);

  // Section Accordion Visibility Controls (Non-essential & Secondary Sections)
  const [isProfilesExpanded, setIsProfilesExpanded] = useState<boolean>(true);
  const [isTradeInExpanded, setIsTradeInExpanded] = useState<boolean>(true);
  const [isVideoExpanded, setIsVideoExpanded] = useState<boolean>(true);
  const [isServicesExpanded, setIsServicesExpanded] = useState<boolean>(true);

  // Fleet Show More / Less & Bounded Container Controls
  const [fleetVisibleLimit, setFleetVisibleLimit] = useState<number>(6);
  const [isFleetContainerBounded, setIsFleetContainerBounded] = useState<boolean>(false);

  // Quick Spec Modal Accordion State
  const [previewAccordionSection, setPreviewAccordionSection] = useState<'specs' | 'engine' | 'hydraulic' | 'dimensions' | 'warranty'>('specs');

  // Hero Section Dynamic Typewriter Text for Specializations
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

  // Mobile Quick Anchor Jump & Scroll-To-Top state (Optimized with rAF & zero layout thrashing)
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string>('top-hero-section');
  const showScrollTopRef = useRef(false);
  const activeSectionIdRef = useRef('top-hero-section');
  const scrollRafId = useRef<number | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRafId.current !== null) return;

      scrollRafId.current = requestAnimationFrame(() => {
        scrollRafId.current = null;
        const currentY = window.scrollY;

        // 1. Show scroll-to-top button threshold (only updates state on change)
        const shouldShow = currentY > 450;
        if (shouldShow !== showScrollTopRef.current) {
          showScrollTopRef.current = shouldShow;
          setShowScrollTop(shouldShow);
        }

        // 2. Direct DOM update for scroll progress bar (prevents full-tree re-renders!)
        const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (totalScroll > 0 && progressBarRef.current) {
          const pct = Math.min(100, Math.max(0, (currentY / totalScroll) * 100));
          progressBarRef.current.style.width = `${pct}%`;
        }

        // 3. Active Section anchor spy (only updates state when active section changes)
        const sectionIds = [
          'top-hero-section',
          'fleet-catalog-section',
          'executive-commercial-profiles',
          'tradein-valuation-module',
          'official-company-video',
          'strategic-services-section',
          'industrial-ecosystem-grid',
        ];

        for (const id of sectionIds) {
          const el = document.getElementById(id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= 200 && rect.bottom >= 120) {
              if (id !== activeSectionIdRef.current) {
                activeSectionIdRef.current = id;
                setActiveSectionId(id);
              }
              break;
            }
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollRafId.current !== null) cancelAnimationFrame(scrollRafId.current);
    };
  }, []);

  const scrollToAnchor = (sectionId: string) => {
    activeSectionIdRef.current = sectionId;
    setActiveSectionId(sectionId);
    if (sectionId === 'top-hero-section') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      const yOffset = -72;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8 sm:space-y-12 pb-16 animate-in fade-in-50 duration-400 ease-out fill-mode-both"
    >
      {/* 1. HERO SECTION: Clean, High-Contrast Industrial Aesthetic & Flagship Showcase */}
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 max-w-[1780px] mx-auto pt-5 sm:pt-7 lg:pt-8 relative">
        {/* Soft atmospheric ambient aura bridging header and hero */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-4/5 h-28 bg-amber-500/15 dark:bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <section id="top-hero-section" className="relative overflow-hidden rounded-[6px] bg-zinc-950 text-white border border-zinc-800/80 dark:border-white/[0.08] shadow-2xl">
        {/* Background Image with optimized loading & balanced cinematic illumination (Clear & Vivid) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={activeHeroMachine.image || "/images/tmd_portal_hero.jpg"}
            alt="Maquinaria Pesada en República Dominicana"
            loading="eager"
            decoding="async"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('tmd_coming_soon')) {
                target.src = '/images/tmd_coming_soon.jpg';
              }
            }}
            className="w-full h-full object-cover object-center opacity-65 sm:opacity-75 scale-102 filter brightness-105 contrast-110 transition-all duration-700 ease-out"
          />
          {/* Subtle luminous industrial vignette - machinery is bright, clear & visible */}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/92 via-zinc-950/55 to-zinc-950/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(245,158,11,0.22),rgba(0,0,0,0))] pointer-events-none" />
        </div>

        <motion.div
          variants={heroContainerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 px-3.5 py-6 sm:px-8 sm:py-9 lg:px-12 lg:py-11 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center"
        >
          {/* Left Column: Headline, Live Status & Search */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            {/* Live Operational Status Badges with Dynamic Typing Showcase */}
            <motion.div variants={heroFadeInUpItem} className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[5px] bg-zinc-900/95 border border-amber-500/40 text-zinc-100 text-[11px] sm:text-xs font-black tracking-wider uppercase font-mono shadow-md backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                </span>
                <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400 bg-clip-text text-transparent font-bold">
                  {typewriterText}
                </span>
                <span className="inline-block w-1.5 h-3.5 bg-amber-400 animate-pulse ml-0.5 rounded-[1px]" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[5px] bg-zinc-900/95 border border-zinc-700/80 text-zinc-200 text-[11px] sm:text-xs font-bold tracking-wider uppercase font-mono shadow-md">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>GARANTÍA OFICIAL 2 AÑOS / 2,000 HRS</span>
              </div>
            </motion.div>

            {/* Monumental Heavy Industrial Typography: Luxury Gold Gradient Title with High-Contrast Presence */}
            <motion.h1 
              variants={heroFadeInUpItem} 
              className="text-3xl sm:text-5xl md:text-6xl lg:text-[3.95rem] font-black font-display tracking-tight text-white uppercase leading-[0.96] drop-shadow-xl"
            >
              <span className="block text-white">TECNOMAQUINARIAS DIESEL</span>{' '}
              <span className="inline-block bg-gradient-to-r from-amber-400 via-yellow-200 via-amber-300 to-amber-500 bg-clip-text text-transparent font-black drop-shadow-[0_4px_16px_rgba(245,158,11,0.4)]">
                DOMINICANA
              </span>
            </motion.h1>

            {/* Body Typography: High-Contrast Technical Overview */}
            <motion.p 
              variants={heroFadeInUpItem} 
              className="text-xs sm:text-sm md:text-base text-zinc-200 max-w-2xl font-normal leading-relaxed tracking-[0.01em] drop-shadow-sm"
            >
              Distribuidor oficial autorizado de <strong className="text-amber-400 font-bold uppercase">JCB, LiuGong, LS Tractor y Ammann</strong> en República Dominicana. Maquinaria pesada certificada, servicio de taller móvil en obra 24/7 y almacén central de repuestos genuinos en el Km 22, Autopista Duarte.
            </motion.p>

            {/* Quick Live Filter Search Input with 5px Precision Corners */}
            <motion.div variants={heroFadeInUpItem} className="max-w-xl">
              <div className="relative flex items-center group">
                <Search className="absolute left-3.5 w-4 h-4 text-zinc-400 group-focus-within:text-amber-400 transition-colors" />
                <input
                  type="text"
                  value={quickSearchQuery}
                  onChange={(e) => setQuickSearchQuery(e.target.value)}
                  placeholder="BUSCAR MODELO (EJ. 3CX, 922E, 540) O CATEGORÍA..."
                  className="w-full pl-10 pr-20 py-3 bg-zinc-900/95 border border-zinc-700/80 hover:border-zinc-600 rounded-[5px] text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 transition-all shadow-inner uppercase font-mono tracking-wide"
                />
                {quickSearchQuery ? (
                  <button
                    type="button"
                    onClick={() => setQuickSearchQuery('')}
                    className="absolute right-3 p-1 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="absolute right-3 px-2 py-0.5 rounded-[3px] bg-zinc-800 border border-zinc-700 text-[10px] text-amber-400 font-mono font-bold hidden sm:inline tracking-wider uppercase">
                    EN VIVO
                  </span>
                )}
              </div>
            </motion.div>

            {/* Action CTAs with 5px Rounded Precision Corners */}
            <motion.div variants={heroFadeInUpItem} className="flex flex-wrap items-center gap-3 pt-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('#/machinery')}
                className="tmd-shimmer-btn inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-black uppercase tracking-wider rounded-[5px] shadow-xl shadow-amber-500/25 transition-all text-xs sm:text-sm cursor-pointer"
              >
                <span>VER CATÁLOGO 2026</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('#/checkout')}
                className="tmd-shimmer-btn inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-b from-[#181820] via-[#0d0d12] to-[#040407] hover:from-[#242430] hover:via-[#14141c] hover:to-[#08080c] text-white font-bold uppercase tracking-wider rounded-[5px] border border-white/[0.14] hover:border-[#d99b26]/60 shadow-[0_4px_18px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.18)] transition-all text-xs sm:text-sm cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#e0a22a]" />
                <span>EMITIR PROFORMA NCF</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('#/financing')}
                className="hidden sm:inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold uppercase tracking-wider rounded-[5px] border border-zinc-800 hover:border-zinc-700 text-xs transition-colors cursor-pointer"
              >
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span>FINANCIAMIENTO</span>
              </motion.button>
            </motion.div>

            {/* Key Trust Stats Bar with Chiselled Numbers & Dark Mode Hierarchy */}
            <motion.div variants={heroFadeInUpItem} className="grid grid-cols-3 gap-2 sm:gap-6 pt-4 border-t border-zinc-800/80 text-center sm:text-left">
              <div>
                <span className="block text-xl sm:text-2xl lg:text-3xl font-black font-display tracking-tight text-white">
                  <AnimatedMetric value={24} /><span className="text-amber-400 font-display">+ AÑOS</span>
                </span>
                <span className="text-[10px] sm:text-xs text-zinc-400 font-bold uppercase tracking-wider">EN REP. DOMINICANA</span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl lg:text-3xl font-black font-display tracking-tight text-white">
                  KM <AnimatedMetric value={22} />
                </span>
                <span className="text-[10px] sm:text-xs text-zinc-400 font-bold uppercase tracking-wider">AUTOPISTA DUARTE</span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl lg:text-3xl font-black font-display tracking-tight text-white">
                  <AnimatedMetric value={24} /><span className="text-amber-400 font-display">/7</span>
                </span>
                <span className="text-[10px] sm:text-xs text-zinc-400 font-bold uppercase tracking-wider">TALLER MÓVIL EN OBRA</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Auto-Cycling Interactive Flagship Machine Card with Glossy Obsidian Finish & Calibrated Industrial Gold */}
          <motion.div 
            variants={heroFadeInUpItem} 
            onMouseEnter={() => setIsHeroAutoPlaying(false)}
            onMouseLeave={() => setIsHeroAutoPlaying(true)}
            className="lg:col-span-5 bg-gradient-to-b from-[#15151c]/95 via-[#0c0c10]/98 to-[#030305] rounded-[6px] border border-white/[0.12] hover:border-[#d99b26]/50 p-4 sm:p-5 lg:p-6 space-y-4 shadow-[0_16px_45px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-md transition-all relative group/card overflow-hidden"
          >
            {/* Top Gloss Sheen Reflection */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />

            {/* Auto Switcher Header & Model Tabs with Linear Progress Bar */}
            <div className="space-y-2 pb-3 border-b border-white/[0.08] relative z-10">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-black tracking-wider text-zinc-300 font-display">
                    EQUIPOS EN PATIO
                  </span>
                  <span className={`w-1.5 h-1.5 rounded-full ${isHeroAutoPlaying ? 'bg-[#e0a22a] animate-pulse shadow-[0_0_8px_rgba(224,162,42,0.8)]' : 'bg-zinc-600'}`} title={isHeroAutoPlaying ? 'Auto-rotación activa (5s)' : 'Pausado'} />
                </div>
                
                <div className="flex gap-1.5">
                  {heroMachines.map((m, idx) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setHeroMachineIndex(idx);
                        setIsHeroAutoPlaying(false);
                      }}
                      className={`relative overflow-hidden px-3 py-1 rounded-[4px] text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        heroMachineIndex === idx
                          ? 'bg-gradient-to-b from-[#202028] to-[#0e0e13] text-[#e0a22a] border border-[#d99b26]/70 shadow-[0_2px_8px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.15)]'
                          : 'bg-[#060608]/90 text-zinc-400 hover:text-white hover:bg-[#14141a] border border-white/[0.06]'
                      }`}
                    >
                      <span>{m.modelCode}</span>
                      {heroMachineIndex === idx && isHeroAutoPlaying && (
                        <motion.div
                          key={`progress-${heroMachineIndex}`}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 5, ease: 'linear' }}
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e0a22a] origin-left"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Animated Machine Visual Card with Bigger Photo & 5px Precision Corners */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeHeroMachine.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4 relative z-10"
              >
                {/* Bigger Photo Showcase (Taller Aspect Ratio & Precision Industrial Viewfinder Layout) */}
                <div className="relative aspect-[16/10] min-h-[260px] sm:min-h-[300px] lg:min-h-[320px] rounded-[5px] overflow-hidden bg-[#030305] border border-white/[0.08] group/photo shadow-2xl transition-colors hover:border-[#d99b26]/50">
                  {/* Subtle Ambient Radial Gold Glow Behind Machinery */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(217,155,38,0.14)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />

                  {/* CAD Telemetry Viewfinder Corner Alignment Brackets */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#d99b26]/70 pointer-events-none z-20 transition-all group-hover/photo:border-[#e0a22a] group-hover/photo:w-4 group-hover/photo:h-4" />
                  <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#d99b26]/70 pointer-events-none z-20 transition-all group-hover/photo:border-[#e0a22a] group-hover/photo:w-4 group-hover/photo:h-4" />
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#d99b26]/70 pointer-events-none z-20 transition-all group-hover/photo:border-[#e0a22a] group-hover/photo:w-4 group-hover/photo:h-4" />
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#d99b26]/70 pointer-events-none z-20 transition-all group-hover/photo:border-[#e0a22a] group-hover/photo:w-4 group-hover/photo:h-4" />

                  {/* High-Resolution Machinery Image - Bright, Vibrant, High Definition */}
                  <img
                    src={activeHeroMachine.image}
                    alt={activeHeroMachine.name}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('tmd_coming_soon')) {
                        target.src = '/images/tmd_coming_soon.jpg';
                      }
                    }}
                    className="w-full h-full object-cover group-hover/photo:scale-106 filter brightness-105 contrast-110 group-hover/photo:contrast-120 transition-all duration-700 ease-out"
                  />

                  {/* Balanced Vignette Gradients for Text Legibility without dimming the machine */}
                  <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/60 via-transparent to-transparent pointer-events-none z-10" />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none z-10" />

                  {/* Specular Light Reflection Sweep on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/photo:translate-x-full transition-transform duration-1000 ease-out pointer-events-none z-15" />

                  {/* Top Floating Telemetry & Availability Bar */}
                  <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-2 z-20 pointer-events-auto">
                    {/* Brand & Model Official Badge */}
                    <div className="bg-[#050508]/95 backdrop-blur-md px-2.5 py-1 rounded-[4px] text-[11px] font-black text-[#e0a22a] border border-[#d99b26]/40 tracking-wider uppercase font-display shadow-lg flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e0a22a]" />
                      <span>{activeHeroMachine.brand} • {activeHeroMachine.modelCode}</span>
                    </div>

                    {/* Live Patio Stock Badge (3-Color Deep Industrial Finish) */}
                    <div className="bg-[#050508]/95 backdrop-blur-md px-2.5 py-1 rounded-[4px] text-[10px] font-black text-zinc-200 border border-white/[0.1] tracking-wider uppercase font-mono shadow-lg flex items-center gap-1.5">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e0a22a] opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#e0a22a]" />
                      </span>
                      <span>EN PATIO KM 22</span>
                    </div>
                  </div>

                  {/* Bottom Telematics & Interactive 360 Action Bar */}
                  <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between gap-2 z-20 pointer-events-auto">
                    {/* Telematics Status Pill */}
                    <div className="hidden sm:inline-flex items-center gap-1.5 bg-[#050508]/90 backdrop-blur-md px-2 py-1 rounded-[4px] text-[10px] font-bold text-zinc-300 border border-white/10 font-mono tracking-wider uppercase">
                      <Radio className="w-3 h-3 text-[#e0a22a] animate-pulse" />
                      <span>LIVELINK™ GPS ACTIVO</span>
                    </div>

                    {/* Interactive 360° Studio Trigger Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setActive360Tab('360');
                        setActive360Machine(activeHeroMachine);
                      }}
                      className="ml-auto px-3.5 py-1.5 rounded-[4px] bg-gradient-to-b from-[#1c1c24] to-[#08080c] hover:from-[#262632] hover:to-[#0e0e14] text-[#e0a22a] text-xs font-mono font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xl hover:shadow-[0_4px_16px_rgba(217,155,38,0.2)] hover:scale-105 active:scale-95 cursor-pointer border border-white/[0.12] hover:border-[#d99b26]/70"
                    >
                      <RotateCw className="w-3.5 h-3.5 animate-spin-slow text-[#e0a22a]" />
                      <span>GIRO 360°</span>
                    </button>
                  </div>
                </div>

                {/* Specs & Quick Action Deck */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-black font-display text-zinc-100 uppercase tracking-tight">
                        {activeHeroMachine.name}
                      </h3>
                      <span className="text-xs font-mono text-[#e0a22a] font-bold uppercase tracking-wider">
                        {activeHeroMachine.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 block uppercase tracking-wider font-bold">INVERSIÓN ESTIMADA</span>
                      <span className="text-sm sm:text-base font-black text-white font-mono tracking-tight">
                        US$ {activeHeroMachine.basePriceUsd.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* 3-Column CAD Spec Badges (ALL CAPS & 5px Precision Corners) */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs py-2.5 px-3 rounded-[5px] bg-gradient-to-b from-[#0a0a0e] to-[#040406] border border-white/[0.08] shadow-inner">
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">POTENCIA</span>
                      <span className="font-black text-[#e0a22a] font-mono text-xs sm:text-sm">{activeHeroMachine.powerHp} HP</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">PESO OP.</span>
                      <span className="font-black text-zinc-200 font-mono text-xs sm:text-sm">{(activeHeroMachine.operatingWeightKg / 1000).toFixed(1)}T</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">MOTOR DIESEL</span>
                      <span className="font-black text-zinc-200 truncate block text-xs">{activeHeroMachine.engine}</span>
                    </div>
                  </div>

                  {/* High-Conversion Action Buttons with 5px Rounded Corners */}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        addMachineToQuote(activeHeroMachine);
                        onNavigate('#/checkout');
                      }}
                      className="flex-1 py-2.5 bg-gradient-to-r from-[#d99b26] via-[#e5a83b] to-[#d99b26] hover:from-[#e5a83b] hover:to-[#f0b54d] active:from-[#c58b1f] text-zinc-950 font-black uppercase tracking-wider rounded-[5px] text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_16px_rgba(217,155,38,0.25)]"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>COTIZAR {activeHeroMachine.modelCode}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectMachine(activeHeroMachine.id);
                        onNavigate('#/machinery');
                      }}
                      className="px-4 py-2.5 bg-gradient-to-b from-[#181820] to-[#07070a] hover:from-[#22222c] hover:to-[#0f0f14] text-zinc-200 hover:text-white font-bold uppercase tracking-wider rounded-[5px] text-xs transition-all cursor-pointer border border-white/[0.1] hover:border-white/[0.2] shadow-sm"
                    >
                      FICHA
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Above-The-Fold High-Conversion Executive Action Deck: Request Quote, Financing, Direct Sales */}
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

      {/* 1.5 LIVE UPDATES MARQUEE: Streamlined Real-Time Ticker */}
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 max-w-[1780px] mx-auto -mt-3 sm:-mt-6 relative z-20">
        <div className="rounded-[6px] overflow-hidden shadow-md border border-white/[0.08] bg-[#07070b]/90 backdrop-blur-md">
          <LiveMarquee onNavigate={onNavigate} />
        </div>
      </div>

      {/* REFINED INDUSTRIAL HAIRLINE DIVIDER */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1780px] mx-auto py-2" aria-hidden="true">
        <div className="relative flex items-center justify-center">
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#d99b26]/35 to-transparent" />
        </div>
      </div>

      {/* MINIMAL FLOATING ANCHOR CAPSULE DOCK (Minimal Icons & Smooth Scrolling Animation) */}
      <div className="sticky top-14 sm:top-16 z-30 w-full px-3 max-w-fit mx-auto py-1 pointer-events-none">
        <div className="pointer-events-auto relative flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded-full bg-[#0a0a10]/95 backdrop-blur-xl border border-white/[0.12] shadow-[0_10px_35px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.15)] overflow-hidden">
          {/* Animated Dynamic Scroll Progress Indicator along the base */}
          <div className="absolute bottom-0 inset-x-0 h-[2px] bg-white/[0.05] pointer-events-none">
            <div 
              ref={progressBarRef}
              className="h-full bg-gradient-to-r from-[#d99b26] to-[#f0b54d] transition-all duration-75 ease-out" 
              style={{ width: '0%' }}
            />
          </div>

          {[
            { id: 'top-hero-section', label: 'Inicio', icon: Sparkles },
            { id: 'fleet-catalog-section', label: 'Flota en Patio', icon: HardHat, count: `${filteredMachines.length}` },
            { id: 'executive-commercial-profiles', label: 'Precios & NCF', icon: DollarSign },
            { id: 'tradein-valuation-module', label: 'Trade-In / Avalúo', icon: RefreshCw },
            { id: 'official-company-video', label: 'Patio Km 22 Video', icon: Video },
            { id: 'strategic-services-section', label: 'Servicios & Taller', icon: Wrench },
            { id: 'industrial-ecosystem-grid', label: 'Marcas & Ecosistema', icon: Layers },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSectionId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToAnchor(item.id)}
                className="relative group p-2 rounded-full flex items-center justify-center transition-all cursor-pointer"
                aria-label={item.label}
              >
                {/* Active Sliding Glowing Pill Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeDockIndicator"
                    className="absolute inset-0 rounded-full bg-gradient-to-b from-[#22222e] to-[#0f0f16] border border-[#d99b26]/70 shadow-[0_2px_10px_rgba(217,155,38,0.25),inset_0_1px_0_rgba(255,255,255,0.18)]"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}

                <div className="relative z-10 flex items-center gap-1">
                  <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-[#e0a22a]' : 'text-zinc-400 group-hover:text-white'}`} />
                  {item.count && (
                    <span className={`text-[9px] font-mono px-1 rounded-full ${isActive ? 'text-[#e0a22a] font-bold' : 'text-zinc-500'}`}>
                      {item.count}
                    </span>
                  )}
                </div>

                {/* Minimal Micro Tooltip on Hover */}
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-[4px] bg-[#0c0c14] border border-white/[0.12] text-[10px] font-mono font-bold text-zinc-200 uppercase tracking-wider whitespace-nowrap shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                  {item.label}
                </span>
              </button>
            );
          })}

          <div className="h-4 w-[1px] bg-white/[0.1] mx-0.5" />

          {/* Quick Back to Top Minimal Icon */}
          <button
            type="button"
            onClick={() => scrollToAnchor('top-hero-section')}
            className="p-2 rounded-full text-zinc-400 hover:text-[#e0a22a] hover:bg-white/[0.06] transition-colors cursor-pointer group relative"
            title="Volver arriba"
            aria-label="Volver arriba"
          >
            <ChevronUp className="w-3.5 h-3.5" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-[4px] bg-[#0c0c14] border border-white/[0.12] text-[10px] font-mono font-bold text-zinc-200 uppercase tracking-wider whitespace-nowrap shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
              Arriba
            </span>
          </button>
        </div>
      </div>

      {/* 2. ELEVATED FLEET CATALOG: IMMEDIATE PRICING, LEASING ESTIMATES & DIRECT ACTIONS */}
      <section id="fleet-catalog-section" className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1780px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-3.5 gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black font-display uppercase tracking-wider text-[#e0a22a]">
                Catálogo de Flota con Precios Transparentes
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-[4px] bg-[#0c0c14] text-zinc-300 border border-white/[0.08] font-mono font-bold uppercase">
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
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-display tracking-tight text-white uppercase">
              MAQUINARIA PESADA LISTA EN SHOWROOM
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 max-w-2xl">
              Equipos de entrega inmediata con precios en USD y RD$, leasing pre-aprobado y cotización NCF instantánea para contratistas e ingenieros.
            </p>
          </div>
        </div>

        {/* Unified Streamlined Catalog Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 p-2 rounded-xl bg-gradient-to-r from-[#14141c] via-[#0c0c12] to-[#06060a] border border-white/[0.08] mb-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer border ${
                  selectedCategory === cat
                    ? 'bg-[#d99b26] text-black border-[#e0a22a] shadow-xs'
                    : 'bg-[#0a0a10] text-zinc-400 hover:text-white hover:bg-[#12121c] border-white/[0.06]'
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Right Controls: View mode switcher, carousel navigation, and full fleet link */}
          <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-white/[0.06]">
            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-[#0a0a10] p-0.5 rounded-lg border border-white/[0.06] text-xs">
              <button
                type="button"
                onClick={() => setDesktopFleetViewMode('carousel')}
                className={`px-2 py-1 rounded-md font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer text-[11px] ${
                  desktopFleetViewMode === 'carousel'
                    ? 'bg-[#181824] text-[#e0a22a] border border-[#d99b26]/50 shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Vista Carrusel Panorámico"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Carrusel</span>
              </button>
              <button
                type="button"
                onClick={() => setDesktopFleetViewMode('grid')}
                className={`px-2 py-1 rounded-md font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer text-[11px] ${
                  desktopFleetViewMode === 'grid'
                    ? 'bg-[#181824] text-[#e0a22a] border border-[#d99b26]/50 shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Vista Cuadrícula Completa"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cuadrícula</span>
              </button>
            </div>

            {desktopFleetViewMode === 'carousel' && (
              <div className="flex items-center gap-1">
                <button
                  id="fleet-carousel-prev-btn"
                  type="button"
                  onClick={() => scrollCarousel('left')}
                  className="p-1.5 rounded-md bg-[#0a0a10] hover:bg-[#181824] text-zinc-300 transition-colors cursor-pointer border border-white/[0.08]"
                  title="Anterior"
                  aria-label="Desplazar carrusel de maquinaria hacia la izquierda"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  id="fleet-carousel-next-btn"
                  type="button"
                  onClick={() => scrollCarousel('right')}
                  className="p-1.5 rounded-md bg-[#0a0a10] hover:bg-[#181824] text-zinc-300 transition-colors cursor-pointer border border-white/[0.08]"
                  title="Siguiente"
                  aria-label="Desplazar carrusel de maquinaria hacia la derecha"
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

        {/* Full-width Horizontal Snap Slider or Multi-Column Bento Grid with CSS Grid Template & Bounded Scroll */}
        <div className="relative group/carousel">
          <div
            ref={carouselRef}
            className={
              desktopFleetViewMode === 'carousel'
                ? "-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2.5 sm:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 pt-1 scrollbar-none"
                : isFleetContainerBounded
                  ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 max-h-[560px] overflow-y-auto p-2 rounded-[5px] border border-zinc-800 bg-zinc-950/90 shadow-inner"
                  : "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 pb-3 pt-1"
            }
            style={
              desktopFleetViewMode === 'carousel'
                ? { scrollbarWidth: 'none', msOverflowStyle: 'none' }
                : isFleetContainerBounded
                  ? { gridAutoRows: 'minmax(310px, auto)' }
                  : undefined
            }
          >
            {(desktopFleetViewMode === 'carousel' || isFleetContainerBounded
              ? filteredMachines
              : filteredMachines.slice(0, fleetVisibleLimit)
            ).map((machine) => (
              <IndustrialTiltCard
                key={machine.id}
                maxTilt={4}
                className={`${
                  desktopFleetViewMode === 'carousel'
                    ? "w-[44vw] min-w-[155px] max-w-[195px] sm:w-[240px] sm:max-w-none md:w-[265px] lg:w-[290px] shrink-0 snap-start"
                    : "w-full"
                } bg-gradient-to-b from-[#14141c] via-[#0c0c12] to-[#040407] rounded-xl border border-white/[0.08] hover:border-[#d99b26]/50 overflow-hidden hover:shadow-xl hover:shadow-black/50 transition-all flex flex-col justify-between group`}
              >
                {/* Narrow aspect image with micro-badges */}
                <div className="relative aspect-[4/3] bg-[#08080d] overflow-hidden">
                  <img
                    src={machine.image}
                    alt={machine.name}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('tmd_coming_soon')) {
                        target.src = '/images/tmd_coming_soon.jpg';
                      }
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-1.5 left-1.5 bg-[#08080d]/90 px-1.5 py-0.5 rounded-[3px] text-[9px] sm:text-[10px] font-black text-[#e0a22a] border border-white/[0.08] font-mono uppercase">
                    {machine.brand}
                  </div>
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMachineCompare(machine.id);
                      }}
                      className={`backdrop-blur-xs p-1 rounded-[3px] text-[9px] font-bold transition-all shadow cursor-pointer ${
                        isComparing(machine.id)
                          ? 'bg-[#d99b26] text-black border border-[#e0a22a]'
                          : 'bg-[#08080d]/90 text-zinc-300 hover:text-[#e0a22a] border border-white/[0.08]'
                      }`}
                      title={isComparing(machine.id) ? 'Quitar de comparativa' : 'Agregar a comparativa'}
                      aria-label={`Comparar ${machine.name}`}
                    >
                      <Scale className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </button>
                  </div>

                  {/* 360° interactive micro-badge button */}
                  <button
                    type="button"
                    onClick={() => {
                      setActive360Tab('360');
                      setActive360Machine(machine);
                    }}
                    className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-[3px] bg-[#08080d]/90 hover:bg-[#181824] text-[#e0a22a] text-[9px] sm:text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 border border-white/[0.08] hover:border-[#d99b26]/50 cursor-pointer shadow-xs"
                    title="Girar en 360°"
                  >
                    <RotateCw className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-spin-slow" />
                    <span>360°</span>
                  </button>
                </div>

                {/* Card Body optimized for vertical compactness and explicit pricing */}
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

                    {/* Single-row specs */}
                    <div className="flex items-center gap-1 py-1 px-1.5 rounded-md bg-[#09090f] border border-white/[0.06] text-[9px] sm:text-[11px] font-mono font-bold text-zinc-300 mb-2 truncate">
                      <span className="text-[#e0a22a]">{machine.powerHp} HP</span>
                      <span className="text-zinc-600">•</span>
                      <span>{(machine.operatingWeightKg / 1000).toFixed(1)}T</span>
                    </div>

                    {/* Clear Showroom Price & Estimated Monthly Leasing */}
                    <div className="flex items-baseline justify-between py-1 px-1.5 rounded-md bg-[#09090f]/95 border border-white/[0.06] mb-2 font-mono">
                      <div>
                        <span className="text-[8px] text-zinc-500 block uppercase font-bold">PRECIO DIRECTO</span>
                        <span className="text-xs sm:text-sm font-black text-white font-mono">
                          US$ {machine.basePriceUsd.toLocaleString()}
                        </span>
                        <span className="text-[8px] text-zinc-500 block font-mono">
                          ≈ RD$ {Math.round(machine.basePriceUsd * USD_TO_DOP_RATE).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-zinc-400 font-bold uppercase block">LEASING RD</span>
                        <span className="text-[10px] font-mono font-bold text-[#e0a22a]">
                          ~US$ {Math.round(machine.basePriceUsd / 60).toLocaleString()}/M
                        </span>
                        <span className="text-[8px] text-zinc-400 font-bold uppercase block">
                          0% INICIAL
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Button */}
                  <div className="pt-2 border-t border-white/[0.06] flex items-center gap-1.5 font-display">
                    <button
                      type="button"
                      onClick={() => setPreviewMachine(machine)}
                      className="flex-1 py-1 px-1 rounded-md bg-[#0d0d14] hover:bg-[#181824] text-zinc-300 hover:text-white text-[10px] font-black uppercase tracking-wider transition-colors text-center cursor-pointer border border-white/[0.08]"
                    >
                      FICHA
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        addMachineToQuote(machine);
                        onNavigate('#/checkout');
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

          {/* Desktop/Mobile Show More / Less & In-Place Scroll Controls */}
          {desktopFleetViewMode === 'grid' && (
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-zinc-800 font-display">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFleetContainerBounded(!isFleetContainerBounded)}
                  className={`px-3 py-1.5 rounded-[4px] text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isFleetContainerBounded
                      ? 'bg-zinc-800 text-amber-400 border-amber-500/80 shadow-xs'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isFleetContainerBounded ? 'CAJA DE DESPLAZAMIENTO ACTIVA' : 'FIJAR ALTURA CON DESPLAZAMIENTO'}</span>
                </button>
              </div>

              {!isFleetContainerBounded && filteredMachines.length > 6 && (
                <div className="flex items-center gap-2">
                  {fleetVisibleLimit < filteredMachines.length ? (
                    <button
                      type="button"
                      onClick={() => setFleetVisibleLimit(prev => Math.min(prev + 6, filteredMachines.length))}
                      className="px-4 py-2 rounded-[4px] bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-zinc-800 hover:border-amber-500/60 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <span>MOSTRAR MÁS MODELOS (+{filteredMachines.length - fleetVisibleLimit} RESTANTES)</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setFleetVisibleLimit(6)}
                      className="px-4 py-2 rounded-[4px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>MOSTRAR MENOS (6 INICIALES)</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Mobile swipe hint and count */}
          {desktopFleetViewMode === 'carousel' && (
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-500 mt-1 px-1 sm:hidden font-mono uppercase">
              <span>← DESLIZA PARA VER MÁS →</span>
              <span>{filteredMachines.length} MODELOS CON PRECIO</span>
            </div>
          )}
        </div>
      </section>

      {/* 3. EXECUTIVE COMMERCIAL PROFILES & PROTOCOLS (ACCORDION TOGGLE) */}
      <section id="executive-commercial-profiles" className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1780px] mx-auto scroll-mt-24">
        <div className="flex items-center justify-between py-2 px-3.5 rounded-[6px] bg-gradient-to-r from-[#14141c] via-[#0c0c12] to-[#06060a] border border-white/[0.08] hover:border-[#d99b26]/40 mb-2 transition-all">
          <button
            type="button"
            onClick={() => setIsProfilesExpanded(!isProfilesExpanded)}
            className="flex items-center gap-2 text-left font-black text-xs sm:text-sm text-zinc-100 cursor-pointer hover:text-[#e0a22a] transition-colors"
          >
            <DollarSign className="w-3.5 h-3.5 text-[#e0a22a] shrink-0" />
            <span>Perfiles Comerciales & Protocolos de Compra</span>
            <span className="text-[10px] px-2 py-0.5 rounded-[3px] bg-[#1a1a24] text-zinc-300 font-mono font-bold border border-white/[0.06]">
              {isProfilesExpanded ? 'Contraer' : 'Expandir'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setIsProfilesExpanded(!isProfilesExpanded)}
            className="p-1 rounded-[4px] bg-[#14141c] text-zinc-400 hover:text-white cursor-pointer transition-colors border border-white/[0.06]"
            aria-label={isProfilesExpanded ? "Contraer perfiles comerciales" : "Expandir perfiles comerciales"}
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isProfilesExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {isProfilesExpanded && <ExecutiveTargetProfilesBar onNavigate={onNavigate} />}
      </section>

      {/* 4. EXECUTIVE TRADE-IN & VALUATION MODULE (ACCORDION TOGGLE) */}
      <section id="tradein-valuation-module" className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1780px] mx-auto scroll-mt-24">
        <div className="flex items-center justify-between py-2 px-3.5 rounded-[6px] bg-gradient-to-r from-[#14141c] via-[#0c0c12] to-[#06060a] border border-white/[0.08] hover:border-[#d99b26]/40 mb-2 transition-all">
          <button
            type="button"
            onClick={() => setIsTradeInExpanded(!isTradeInExpanded)}
            className="flex items-center gap-2 text-left font-black text-xs sm:text-sm text-zinc-100 cursor-pointer hover:text-[#e0a22a] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#e0a22a] shrink-0" />
            <span>Módulo de Venta y Trade-In de Maquinaria Usada</span>
            <span className="text-[10px] px-2 py-0.5 rounded-[3px] bg-[#1a1a24] text-zinc-300 font-mono font-bold border border-white/[0.06]">
              {isTradeInExpanded ? 'Contraer' : 'Expandir'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setIsTradeInExpanded(!isTradeInExpanded)}
            className="p-1 rounded-[4px] bg-[#14141c] text-zinc-400 hover:text-white cursor-pointer transition-colors border border-white/[0.06]"
            aria-label={isTradeInExpanded ? "Contraer módulo trade-in" : "Expandir módulo trade-in"}
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isTradeInExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {isTradeInExpanded && <ExecutiveTradeInSellingModule onNavigate={onNavigate} />}
      </section>

      {/* 4.5 INSTALACIONES & PATIO DE DEMOSTRACIONES KM 22 (VIDEO OFICIAL TMD - ACCORDION TOGGLE) */}
      <section id="official-company-video" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 scroll-mt-24">
        <div className="flex items-center justify-between py-2 px-3.5 rounded-[6px] bg-gradient-to-r from-[#14141c] via-[#0c0c12] to-[#06060a] border border-white/[0.08] hover:border-[#d99b26]/40 mb-3 transition-all">
          <button
            type="button"
            onClick={() => setIsVideoExpanded(!isVideoExpanded)}
            className="flex items-center gap-2 text-left font-black text-xs sm:text-sm text-zinc-100 cursor-pointer hover:text-[#e0a22a] transition-colors"
          >
            <Video className="w-3.5 h-3.5 text-[#e0a22a] shrink-0" />
            <span>Video Oficial: Recorrido y Pista de Pruebas Km 22</span>
            <span className="text-[10px] px-2 py-0.5 rounded-[3px] bg-[#1a1a24] text-zinc-300 font-mono font-bold border border-white/[0.06]">
              {isVideoExpanded ? 'Contraer' : 'Expandir'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setIsVideoExpanded(!isVideoExpanded)}
            className="p-1 rounded-[4px] bg-[#14141c] text-zinc-400 hover:text-white cursor-pointer transition-colors border border-white/[0.06]"
            aria-label={isVideoExpanded ? "Contraer video oficial" : "Expandir video oficial"}
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isVideoExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {isVideoExpanded && (
          <div className="space-y-4">
            <div className="mb-2 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-black shadow-xs">
                    Video Oficial Corporativo
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    1080p HD • Patio Km 22
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    Autopista Duarte Km 22, Pedro Brand, Sto. Dgo.
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                  Instalaciones Centrales & Patio de Demostraciones TMD
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                  Recorra en video nuestras 15,000 m² de inventario multimarca en stock físico (JCB, LiuGong, Yanmar, Ammann), pruebas operacionales en terreno real y nave principal de taller con 12 bahías de servicio técnico.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => onNavigate('#/machinery')}
                  className="px-3.5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-zinc-200 dark:border-zinc-700"
                >
                  <HardHat className="w-3.5 h-3.5 text-amber-500" />
                  <span>Ver Equipos en Stock</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsTestDriveModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Agendar Prueba en Patio</span>
                </button>
              </div>
            </div>

            <PatioKm22DroneVideoShowcase 
              onScheduleTestDrive={() => setIsTestDriveModalOpen(true)}
              onNavigate={onNavigate}
            />
          </div>
        )}
      </section>

      {/* 4.8 STRATEGIC SERVICES: Compact Ergonomic Micro-Grid (ACCORDION TOGGLE) */}
      <section id="strategic-services-section" className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1780px] mx-auto py-2 scroll-mt-24">
        <div className="flex items-center justify-between py-2 px-3.5 rounded-[6px] bg-gradient-to-r from-[#14141c] via-[#0c0c12] to-[#06060a] border border-white/[0.08] hover:border-[#d99b26]/40 mb-3 transition-all">
          <button
            type="button"
            onClick={() => setIsServicesExpanded(!isServicesExpanded)}
            className="flex items-center gap-2 text-left font-black text-xs sm:text-sm text-zinc-100 cursor-pointer hover:text-[#e0a22a] transition-colors"
          >
            <Wrench className="w-3.5 h-3.5 text-[#e0a22a] shrink-0" />
            <span>Ecosistema de Soluciones Operativas Directas</span>
            <span className="text-[10px] px-2 py-0.5 rounded-[3px] bg-[#1a1a24] text-zinc-300 font-mono font-bold border border-white/[0.06]">
              {isServicesExpanded ? 'Contraer' : 'Expandir'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setIsServicesExpanded(!isServicesExpanded)}
            className="p-1 rounded-[4px] bg-[#14141c] text-zinc-400 hover:text-white cursor-pointer transition-colors border border-white/[0.06]"
            aria-label={isServicesExpanded ? "Contraer servicios estratégicos" : "Expandir servicios estratégicos"}
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isServicesExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {isServicesExpanded && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
            <div
              onClick={() => onNavigate('#/machinery')}
              className="tmd-luxury-card p-3 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <HardHat className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white mb-0.5">
                  Maquinaria
                </h3>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                  Stock físico en Patio Km 22.
                </p>
              </div>
              <span className="text-[10px] font-bold text-amber-500 mt-2 flex items-center gap-0.5">
                Ver Equipos <ChevronRight className="w-3 h-3" />
              </span>
            </div>

            <div
              onClick={() => onNavigate('#/parts')}
              className="tmd-luxury-card p-3 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Cog className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white mb-0.5">
                  Repuestos OEM
                </h3>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                  Filtros, rodaje e hidráulica.
                </p>
              </div>
              <span className="text-[10px] font-bold text-amber-500 mt-2 flex items-center gap-0.5">
                Ver Catálogo <ChevronRight className="w-3 h-3" />
              </span>
            </div>

            <div
              onClick={() => {
                if (currentUser) {
                  onNavigate('#/livelink');
                } else {
                  setAuthPromptFeature({
                    title: 'LiveLink™ IoT Telemetría',
                    route: '#/livelink',
                    description: 'Acceso seguro al portal de telemetría CAN Bus en tiempo real y geocercas GPS de maquinaria.'
                  });
                }
              }}
              className="tmd-luxury-card p-3 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-500/30 hover:border-amber-500 shadow-xs transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group"
            >
              <span className="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded bg-amber-500 text-zinc-950 text-[8px] font-black uppercase">
                {currentUser ? 'Live' : 'Portal'}
              </span>
              <div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Cpu className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white mb-0.5">
                  LiveLink™ IoT
                </h3>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                  GPS satelital y horómetros.
                </p>
              </div>
              <span className="text-[10px] font-bold text-amber-500 mt-2 flex items-center gap-0.5">
                {currentUser ? 'Telemetría' : 'Acceso'} <ChevronRight className="w-3 h-3" />
              </span>
            </div>

            <div
              onClick={() => {
                if (currentUser) {
                  onNavigate('#/fullbay');
                } else {
                  setAuthPromptFeature({
                    title: 'Taller Central Fullbay',
                    route: '#/fullbay',
                    description: 'Monitoreo de órdenes de servicio, estado de mecánicos y diagnósticos en bahías de taller.'
                  });
                }
              }}
              className="tmd-luxury-card p-3 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-500/30 hover:border-amber-500 shadow-xs transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group"
            >
              <span className="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded bg-amber-500 text-zinc-950 text-[8px] font-black uppercase">
                {currentUser ? 'Fullbay' : 'Taller'}
              </span>
              <div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Wrench className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white mb-0.5">
                  Taller 12 Bahías
                </h3>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                  Diagnóstico y overhaul.
                </p>
              </div>
              <span className="text-[10px] font-bold text-amber-500 mt-2 flex items-center gap-0.5">
                {currentUser ? 'Ver Taller' : 'Acceso Taller'} <ChevronRight className="w-3 h-3" />
              </span>
            </div>

            <div
              onClick={() => onNavigate('#/service')}
              className="tmd-luxury-card p-3 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Truck className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white mb-0.5">
                  Servicio Móvil
                </h3>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                  Auxilio SOS 24/7 en mina.
                </p>
              </div>
              <span className="text-[10px] font-bold text-amber-500 mt-2 flex items-center gap-0.5">
                Pedir SOS <ChevronRight className="w-3 h-3" />
              </span>
            </div>

            <div
              onClick={() => onNavigate('#/checkout')}
              className="tmd-luxury-card tmd-shimmer-btn p-3 sm:p-4 rounded-2xl bg-amber-500 text-black shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-black/10 text-black flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Zap className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>
                <h3 className="text-xs sm:text-sm font-black mb-0.5">
                  Cotizar NCF
                </h3>
                <p className="text-[10px] text-black/80 line-clamp-1">
                  Comprobante fiscal B01 DGII.
                </p>
              </div>
              <span className="text-[10px] font-black mt-2 flex items-center gap-0.5">
                Cotizar Ya <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        )}
      </section>

      {/* 5. DYNAMIC MULTI-LAYERED INDUSTRIAL GRID (BRAND PAVILION, INFRASTRUCTURE BENTO & CONTRACTOR PROOF) */}
      <DynamicMultiLayeredGrid
        onNavigate={onNavigate}
        onSelectBrandFilter={(brandName) => {
          setSelectedBrand(brandName);
          const fleetElem = document.getElementById('fleet-catalog-section');
          if (fleetElem) {
            fleetElem.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onOpen360={(machine) => {
          setActive360Tab('360');
          setActive360Machine(machine);
        }}
      />

      {/* QUICK SPEC MODAL (Responsive Mobile Bottom-Sheet or Centered Dialog) */}
      {previewMachine && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in" onClick={() => setPreviewMachine(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block">
                  {previewMachine.brand} • Mod. {previewMachine.modelCode}
                </span>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                  {previewMachine.name}
                </h3>
              </div>
              <button
                onClick={() => setPreviewMachine(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video rounded-2xl overflow-hidden bg-zinc-800">
              <img
                src={previewMachine.image}
                alt={previewMachine.name}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('tmd_coming_soon')) {
                    target.src = '/images/tmd_coming_soon.jpg';
                  }
                }}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {previewMachine.description}
            </p>

            {/* Interactive Accordion for Secondary Specs */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden text-xs">
              {/* Tab 1: Especificaciones Base */}
              <button
                type="button"
                onClick={() => setPreviewAccordionSection(previewAccordionSection === 'specs' ? 'engine' : 'specs')}
                className="w-full flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left font-bold text-zinc-900 dark:text-white transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Cog className="w-3.5 h-3.5 text-amber-500" />
                  <span>Potencia & Capacidad Operativa</span>
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${previewAccordionSection === 'specs' ? 'rotate-180' : ''}`} />
              </button>
              {previewAccordionSection === 'specs' && (
                <div className="p-3 bg-white dark:bg-zinc-900 grid grid-cols-2 gap-2 text-xs border-t border-zinc-200 dark:border-zinc-800 animate-in fade-in">
                  <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                    <span className="text-zinc-400 block text-[10px]">Potencia Nominal</span>
                    <span className="font-bold text-zinc-900 dark:text-white">{previewMachine.powerHp} HP</span>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                    <span className="text-zinc-400 block text-[10px]">Peso Operacional</span>
                    <span className="font-bold text-zinc-900 dark:text-white">{previewMachine.operatingWeightKg.toLocaleString()} kg</span>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                    <span className="text-zinc-400 block text-[10px]">Motorización</span>
                    <span className="font-bold text-zinc-900 dark:text-white">{previewMachine.engine}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                    <span className="text-zinc-400 block text-[10px]">Inversión Referencial</span>
                    <span className="font-bold text-amber-500">US$ {previewMachine.basePriceUsd.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Tab 2: Cobertura, Financiamiento y Garantía */}
              <button
                type="button"
                onClick={() => setPreviewAccordionSection(previewAccordionSection === 'warranty' ? 'specs' : 'warranty')}
                className="w-full flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left font-bold text-zinc-900 dark:text-white transition-colors cursor-pointer border-t border-zinc-200 dark:border-zinc-800"
              >
                <span className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Garantía Oficial & Opciones de Pago DGII</span>
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${previewAccordionSection === 'warranty' ? 'rotate-180' : ''}`} />
              </button>
              {previewAccordionSection === 'warranty' && (
                <div className="p-3 bg-white dark:bg-zinc-900 space-y-2 text-xs border-t border-zinc-200 dark:border-zinc-800 animate-in fade-in">
                  <div className="flex items-center justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-500">Garantía de Fábrica:</span>
                    <span className="font-bold text-zinc-900 dark:text-white">2 Años / 2,000 Horas</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-500">Comprobante Fiscal:</span>
                    <span className="font-bold text-amber-500">Factura B01 con ITBIS transparentado</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-zinc-500">Leasing Bancario RD:</span>
                    <span className="font-bold text-emerald-500">Aprobación en 24h (BHD, Popular, Banreservas)</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const target = previewMachine;
                  setPreviewMachine(null);
                  setActive360Tab('360');
                  setActive360Machine(target);
                }}
                className="py-3 px-4 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 text-amber-400 rounded-xl text-xs font-black transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 border border-amber-500/30"
              >
                <RotateCw className="w-3.5 h-3.5 text-amber-500" />
                <span>Giro 360°</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  toggleMachineCompare(previewMachine.id);
                  setPreviewMachine(null);
                  openComparison();
                }}
                className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                  isComparing(previewMachine.id)
                    ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white'
                }`}
              >
                <Scale className="w-4 h-4" />
                <span>{isComparing(previewMachine.id) ? 'En Comparativa' : 'Comparar'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = previewMachine;
                  setPreviewMachine(null);
                  setEstimateMachine(target);
                }}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-black shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Solicitar Estimado</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectMachine(previewMachine.id);
                  setPreviewMachine(null);
                  onNavigate('#/machinery');
                }}
                className="py-3 px-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
              >
                Ficha Completa
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Machine 360 Studio Modal */}
      <Machine360Modal
        machine={active360Machine}
        isOpen={Boolean(active360Machine)}
        initialTab={active360Tab}
        onClose={() => setActive360Machine(null)}
        onNavigate={onNavigate}
      />

      {/* Interactive Price Estimate Modal */}
      <PriceEstimateModal
        machine={estimateMachine}
        isOpen={Boolean(estimateMachine)}
        onClose={() => setEstimateMachine(null)}
        onNavigate={onNavigate}
      />

      {/* Patio Km 22 Test Drive Booking Modal */}
      <TestDriveBookingModal
        isOpen={isTestDriveModalOpen}
        onClose={() => setIsTestDriveModalOpen(false)}
      />

      {/* Portal Auth Prompt Modal */}
      {authPromptFeature && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-500">
                  Portal Clientes TMD
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAuthPromptFeature(null)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center space-y-2 py-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3 border border-amber-500/20 shadow-inner">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                {authPromptFeature.title}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed px-2">
                {authPromptFeature.description}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await signInWithGoogle();
                    const dest = authPromptFeature.route;
                    setAuthPromptFeature(null);
                    onNavigate(dest);
                  } catch {
                    onNavigate('#/portal');
                    setAuthPromptFeature(null);
                  }
                }}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Acceder con Google Workspace / Cliente</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthPromptFeature(null);
                  onNavigate('#/portal');
                }}
                className="w-full py-2.5 px-4 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
              >
                Ir a Portal TMD &amp; Roles
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Floating Scroll-to-Top Button for Mobile & Desktop (Zero Scroll Fatigue) */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 sm:bottom-8 right-4 sm:right-6 z-40 p-3 sm:px-4 sm:py-2.5 rounded-2xl bg-amber-500 text-black shadow-2xl border border-amber-400/80 font-black flex items-center gap-1.5 hover:bg-amber-400 active:scale-95 transition-all cursor-pointer animate-in fade-in slide-in-from-bottom-3"
          aria-label="Volver arriba"
        >
          <ChevronUp className="w-5 h-5 sm:w-4 sm:h-4 stroke-[3]" />
          <span className="text-xs hidden sm:inline">Subir al Inicio</span>
        </button>
      )}
    </motion.div>
  );
};
