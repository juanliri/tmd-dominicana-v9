import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
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
  HardHat,
  Cog,
  FileSpreadsheet,
  FileText,
  Award,
  Search,
  Zap,
  SlidersHorizontal,
  X,
  Check,
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
  MessageCircle,
  ExternalLink,
  Flame,
  Gauge,
  TrendingDown
} from 'lucide-react';
import { getUnifiedStoreMachinery } from '../../services/cdnCatalogLoader';
import { useCart } from '../../context/CartContext';
import { useComparison } from '../../context/ComparisonContext';
import { Machine } from '../../types';
import { PriceEstimateModal } from '../PriceEstimateModal';
import { Machine360Modal } from '../Machine360Modal';
import { LiveMarquee } from '../LiveMarquee';
import { OFFICIAL_BRANDS } from '../../data/brandsData';
import { BrandLogo } from '../common/BrandLogos';
import { TestDriveBookingModal } from '../media/TestDriveBookingModal';
import tmdEntranceImg from '../../assets/images/tmd_sede_central_entrance_km22.jpg';
import tmdPatioImg from '../../assets/images/tmd_sede_central_patio_km22.jpg';
import { IndustrialTiltCard } from '../effects/IndustrialTiltCard';
import { useAuth } from '../../context/AuthContext';
import { triggerHaptic } from '../../utils/haptics';

interface HomeViewProps {
  onNavigate: (route: string) => void;
  onSelectMachine: (machineId: string) => void;
}

export const HomeViewVia2: React.FC<HomeViewProps> = ({ onNavigate, onSelectMachine }) => {
  const { currentUser, signInWithGoogle } = useAuth();
  const [authPromptFeature, setAuthPromptFeature] = useState<{ title: string; route: string; description: string } | null>(null);
  const { addMachineToQuote, currency, exchangeRate } = useCart();
  const { toggleMachineCompare, isComparing, openComparison } = useComparison();

  // Unified Store Machinery (Full 44+ Units Dataset)
  const allStoreMachines = useMemo(() => {
    return getUnifiedStoreMachinery();
  }, []);

  // Currency & Financial Formatter
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

  // Flagship Hero Showcase Models (Auto-rotating top models)
  const [heroMachineIndex, setHeroMachineIndex] = useState<number>(0);
  const [isHeroAutoPlaying, setIsHeroAutoPlaying] = useState<boolean>(true);
  
  const heroMachines = useMemo(() => {
    return [
      allStoreMachines.find(m => m.id === 'jcb-3cx-eco') || allStoreMachines[0],
      allStoreMachines.find(m => m.id === 'jcb-3cx-compact') || allStoreMachines[1],
      allStoreMachines.find(m => m.id === 'liugong-922e') || allStoreMachines[2],
      allStoreMachines.find(m => m.id === 'jcb-1cxt') || allStoreMachines[3],
    ].filter(Boolean);
  }, [allStoreMachines]);

  const activeHeroMachine = heroMachines[heroMachineIndex] || heroMachines[0] || allStoreMachines[0];

  useEffect(() => {
    if (!isHeroAutoPlaying || heroMachines.length <= 1) return;
    const interval = setInterval(() => {
      setHeroMachineIndex((prev) => (prev + 1) % heroMachines.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isHeroAutoPlaying, heroMachines.length]);

  // Interactive Catalog Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedBrand, setSelectedBrand] = useState<string>('Todas');
  const [quickSearchQuery, setQuickSearchQuery] = useState<string>('');
  const [desktopFleetViewMode, setDesktopFleetViewMode] = useState<'carousel' | 'grid'>('carousel');

  // Modals & Preview State
  const [previewMachine, setPreviewMachine] = useState<Machine | null>(null);
  const [estimateMachine, setEstimateMachine] = useState<Machine | null>(null);
  const [isTestDriveModalOpen, setIsTestDriveModalOpen] = useState<boolean>(false);
  const [active360Machine, setActive360Machine] = useState<Machine | null>(null);
  const [active360Tab, setActive360Tab] = useState<'360' | 'video' | 'gallery' | 'dimensions'>('360');

  // Interactive Trade-In Estimator State
  const [tradeInBrand, setTradeInBrand] = useState<string>('JCB');
  const [tradeInType, setTradeInType] = useState<string>('Retroexcavadora');
  const [tradeInYear, setTradeInYear] = useState<number>(2019);
  const [tradeInHours, setTradeInHours] = useState<number>(4500);
  const [tradeInCondition, setTradeInCondition] = useState<'excelente' | 'bueno' | 'regular'>('bueno');
  const [isTradeInCalculated, setIsTradeInCalculated] = useState<boolean>(false);

  const calculateTradeInValuation = () => {
    let baseUsd = 50000;
    if (tradeInBrand === 'JCB') baseUsd = 55000;
    if (tradeInBrand === 'Caterpillar') baseUsd = 62000;
    if (tradeInBrand === 'LiuGong') baseUsd = 48000;
    if (tradeInBrand === 'Komatsu') baseUsd = 54000;

    if (tradeInType.includes('Excavadora')) baseUsd *= 1.7;
    if (tradeInType.includes('Cargador')) baseUsd *= 1.35;
    if (tradeInType.includes('Rodillo')) baseUsd *= 1.1;

    const age = Math.max(0, 2026 - tradeInYear);
    const ageDecay = age * 3000;
    const hourDecay = (tradeInHours / 1000) * 1800;
    let net = Math.max(16000, baseUsd - ageDecay - hourDecay);

    if (tradeInCondition === 'excelente') net *= 1.15;
    if (tradeInCondition === 'regular') net *= 0.85;

    return Math.round(net);
  };

  const estimatedTradeInUsd = calculateTradeInValuation();
  const estimatedTradeInDop = Math.round(estimatedTradeInUsd * exchangeRate);

  // Horizontal Carousel Controls
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
  const brands = ['Todas', 'JCB', 'LiuGong', 'Ammann', 'LS Tractor', 'Kubota', 'Yanmar'];

  // Filtered Machines
  const filteredMachines = useMemo(() => {
    return allStoreMachines.filter((m) => {
      const matchCat = selectedCategory === 'Todos' || m.category === selectedCategory;
      const matchBrand = selectedBrand === 'Todas' || m.brand.toLowerCase() === selectedBrand.toLowerCase();
      const matchQuery = !quickSearchQuery.trim() || 
        m.name.toLowerCase().includes(quickSearchQuery.toLowerCase()) ||
        m.modelCode.toLowerCase().includes(quickSearchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(quickSearchQuery.toLowerCase());
      return matchCat && matchBrand && matchQuery;
    });
  }, [allStoreMachines, selectedCategory, selectedBrand, quickSearchQuery]);

  const scrollToCatalog = () => {
    const el = document.getElementById('flagship-catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* HERO: FULL-BLEED 4K FLAGSHIP DEALERSHIP CINEMA (APPLE / TESLA GRADE)    */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden min-h-[580px] lg:min-h-[720px] flex items-center border-b border-slate-200 dark:border-white/[0.08]">
        {/* 4K Ultra-Photorealistic Dealership Yard Background */}
        <img
          src="/assets/images/tmd_machinery_hub_4k_cinematic.jpg"
          alt="Tecnomaquinarias Diesel Showroom Km 22 Autopista Duarte"
          className="absolute inset-0 w-full h-full object-cover object-right md:object-center opacity-75 dark:opacity-60 scale-105 transition-transform duration-1000"
        />

        {/* Multi-Layered Obsidian Contrast Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/40 dark:from-zinc-950 dark:via-zinc-950/85 dark:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-transparent to-black/40 dark:from-zinc-950 dark:via-transparent dark:to-black/50" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Authoritative Editorial Copy */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="lg:col-span-7 space-y-6 text-white"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-[3px] text-[10px] font-black uppercase tracking-wider bg-amber-400 text-black shadow-md font-mono">
                  Sede Central Km 22 Autopista Duarte
                </span>
                <span className="px-2.5 py-1 rounded-[3px] text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-xs font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1.5 animate-pulse" />
                  Distribuidor Oficial Autorizado RD
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.04] tracking-tight font-display uppercase">
                  Tecnomaquinarias
                  <span className="block text-amber-400 mt-1">Diesel S.R.L.</span>
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-zinc-300 font-sans max-w-2xl leading-relaxed">
                  15,000 m² de instalaciones físicas y pistas de demostración en terreno real. Distribuidor oficial autorizado de <strong className="text-white">JCB, LiuGong, Ammann, LS Tractor y Kubota</strong> con garantía directa de fábrica de 2 años, leasing bancario pre-aprobado y servicio diésel especializado en 18 bahías.
                </p>
              </div>

              {/* 4 Executive Pillars Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="p-2.5 rounded-[4px] bg-black/60 border border-white/[0.1] backdrop-blur-md">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block font-bold">SUPERFICIE PATIO</span>
                  <span className="text-base sm:text-lg font-black text-white font-mono">15,000 m²</span>
                </div>
                <div className="p-2.5 rounded-[4px] bg-black/60 border border-white/[0.1] backdrop-blur-md">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block font-bold">STOCK EN PATIO</span>
                  <span className="text-base sm:text-lg font-black text-amber-400 font-mono">44+ Equipos</span>
                </div>
                <div className="p-2.5 rounded-[4px] bg-black/60 border border-white/[0.1] backdrop-blur-md">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block font-bold">BAHÍAS TALLER</span>
                  <span className="text-base sm:text-lg font-black text-white font-mono">18 Bahías</span>
                </div>
                <div className="p-2.5 rounded-[4px] bg-black/60 border border-white/[0.1] backdrop-blur-md">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block font-bold">CRÉDITO LEASING</span>
                  <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">24 Horas</span>
                </div>
              </div>

              {/* Call to Actions Strip */}
              <div className="flex flex-wrap items-center gap-3 pt-2 font-display">
                <button
                  type="button"
                  onClick={scrollToCatalog}
                  className="px-6 py-3.5 rounded-[4px] bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-400/25 flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <HardHat className="w-4 h-4" />
                  <span>Explorar Showroom de Flota</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsTestDriveModalOpen(true)}
                  className="px-5 py-3.5 rounded-[4px] bg-zinc-900/90 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/[0.15] backdrop-blur-md flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Agendar Test Drive en Patio</span>
                </button>

                <a
                  href="https://wa.me/18095601234?text=Hola%20Don%20Eduardo,%20deseo%20coordinar%20una%20visita%20t%C3%A9cnica%20a%20Patio%20Km%2022%20para%20evaluar%20maquinaria."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3.5 rounded-[4px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Directo</span>
                </a>
              </div>
            </motion.div>

            {/* Right Column: Interactive Flagship Machinery Viewfinder */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
              className="lg:col-span-5"
            >
              <div className="relative rounded-[6px] bg-zinc-950/95 backdrop-blur-2xl border border-white/[0.1] p-4 sm:p-5 shadow-2xl space-y-4">
                {/* CAD Viewfinder Reticles */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-400 pointer-events-none" />

                {/* Model Selector Strip */}
                <div className="flex items-center justify-between gap-1 pb-3 border-b border-white/[0.08]">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    SHOWROOM EN VIVO
                  </span>

                  <div className="flex gap-1">
                    {heroMachines.map((m, idx) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setHeroMachineIndex(idx);
                          setIsHeroAutoPlaying(false);
                          triggerHaptic();
                        }}
                        className={`px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                          heroMachineIndex === idx
                            ? 'bg-amber-400 text-black shadow-xs font-black'
                            : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/[0.06]'
                        }`}
                      >
                        {m.modelCode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visual Viewport with 360° Studio Button */}
                <div className="relative aspect-[16/10] rounded-[4px] overflow-hidden bg-zinc-900 border border-white/[0.08] group">
                  <img
                    src={activeHeroMachine.image}
                    alt={activeHeroMachine.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-2 inset-x-2 flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-[2px] bg-black/80 text-amber-400 text-[10px] font-mono font-black uppercase border border-amber-400/40">
                      {activeHeroMachine.brand} • {activeHeroMachine.modelCode}
                    </span>
                    <span className="px-2 py-0.5 rounded-[2px] bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase border border-emerald-500/30">
                      ENTREGA INMEDIATA
                    </span>
                  </div>

                  {/* Bottom Studio 360 Trigger */}
                  <div className="absolute bottom-2 inset-x-2 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-zinc-300 bg-black/70 px-2 py-0.5 rounded-[2px] border border-white/10 hidden sm:inline-flex items-center gap-1">
                      <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
                      LIVELINK™ TELEMETRÍA
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setActive360Tab('360');
                        setActive360Machine(activeHeroMachine);
                        triggerHaptic();
                      }}
                      className="ml-auto px-2.5 py-1 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black text-[10px] font-mono font-black uppercase transition-all flex items-center gap-1 cursor-pointer shadow-md active:scale-95"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>Giro 360°</span>
                    </button>
                  </div>
                </div>

                {/* Machine Details & Price Overview */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-white font-display">
                        {activeHeroMachine.name}
                      </h3>
                      <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                        {activeHeroMachine.category}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-mono text-zinc-400 uppercase block font-bold">
                        PRECIO DIRECTO ({currency})
                      </span>
                      <span className="text-base sm:text-lg font-black text-white font-mono">
                        {formatMachineryPrice(activeHeroMachine.basePriceUsd)}
                      </span>
                    </div>
                  </div>

                  {/* Quick CAD Spec Bar */}
                  <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-[3px] bg-zinc-900/90 border border-white/[0.06] text-center font-mono">
                    <div>
                      <span className="text-[9px] text-zinc-400 uppercase block">POTENCIA</span>
                      <span className="text-xs font-bold text-amber-400">{activeHeroMachine.powerHp} HP</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-400 uppercase block">PESO OP.</span>
                      <span className="text-xs font-bold text-zinc-200">{(activeHeroMachine.operatingWeightKg / 1000).toFixed(1)} T</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-400 uppercase block">LEASING RD</span>
                      <span className="text-xs font-bold text-emerald-400">{formatLeasingEstimate(activeHeroMachine.basePriceUsd)}</span>
                    </div>
                  </div>

                  {/* High-Prestige Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1 font-display">
                    <button
                      type="button"
                      onClick={() => {
                        addMachineToQuote(activeHeroMachine);
                        onNavigate('#/checkout');
                        triggerHaptic();
                      }}
                      className="py-2.5 px-3 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-[0.98]"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Cotizar NCF B01</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectMachine(activeHeroMachine.id);
                        onNavigate(`#/machinery/${activeHeroMachine.id}`);
                        triggerHaptic();
                      }}
                      className="py-2.5 px-3 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/[0.15] flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                    >
                      <span>Ficha Completa →</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* REAL-TIME OPERATIONS MARQUEE                                             */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 -mt-4 relative z-20">
        <div className="rounded-[4px] overflow-hidden shadow-md border border-slate-200 dark:border-white/[0.08] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md">
          <LiveMarquee onNavigate={onNavigate} />
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* CHAPTER 1: THE UNIFIED FLEET SHOWROOM (EL GRAN SALÓN DE MAQUINARIA)     */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      <section id="flagship-catalog-section" className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-12 sm:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">
                CAPÍTULO I • SHOWROOM OFICIAL
              </span>
              <span className="px-2 py-0.5 rounded-[2px] bg-zinc-900 text-zinc-300 border border-white/[0.08] text-[10px] font-mono font-bold uppercase">
                {filteredMachines.length} UNIDADES CERTIFICADAS
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-display">
              Flota Oficial 2026 en Patio Km 22
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1 max-w-2xl font-sans">
              Inspección de pre-entrega (PDI) certificada, prueba de banco de 350 Bar y entrega con comprobante fiscal NCF en cualquier provincia de la República Dominicana.
            </p>
          </div>

          {/* Quick Search in Catalog */}
          <div className="w-full md:w-72">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={quickSearchQuery}
                onChange={(e) => setQuickSearchQuery(e.target.value)}
                placeholder="Buscar por modelo o tipo..."
                className="w-full pl-9 pr-3 py-2 rounded-[3px] bg-white dark:bg-zinc-900 border border-slate-300 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-400 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Clean Filter Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-2.5 rounded-[4px] bg-slate-100 dark:bg-zinc-900/90 border border-slate-200 dark:border-white/[0.08] mb-6 font-display">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  triggerHaptic();
                }}
                className={`px-3 py-1.5 rounded-[3px] text-[11px] font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-400 text-black shadow-xs'
                    : 'bg-white dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.06]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* View Mode Controls & Direct Full Catalog Link */}
          <div className="flex items-center justify-between lg:justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-white/[0.08]">
            <div className="flex items-center gap-1 bg-white dark:bg-zinc-950 p-0.5 rounded-[3px] border border-slate-200 dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => setDesktopFleetViewMode('carousel')}
                className={`px-2.5 py-1 rounded-[2px] text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                  desktopFleetViewMode === 'carousel'
                    ? 'bg-amber-400 text-black'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Columns className="w-3 h-3" />
                <span>Carrusel</span>
              </button>
              <button
                type="button"
                onClick={() => setDesktopFleetViewMode('grid')}
                className={`px-2.5 py-1 rounded-[2px] text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                  desktopFleetViewMode === 'grid'
                    ? 'bg-amber-400 text-black'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3 h-3" />
                <span>Cuadrícula</span>
              </button>
            </div>

            {desktopFleetViewMode === 'carousel' && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollCarousel('left')}
                  className="p-1.5 rounded-[2px] bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 hover:text-amber-500 border border-slate-200 dark:border-white/[0.08] cursor-pointer"
                  title="Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCarousel('right')}
                  className="p-1.5 rounded-[2px] bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 hover:text-amber-500 border border-slate-200 dark:border-white/[0.08] cursor-pointer"
                  title="Siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => onNavigate('#/machinery')}
              className="px-3 py-1.5 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-amber-400 text-[10px] font-black uppercase tracking-wider border border-amber-400/40 cursor-pointer flex items-center gap-1"
            >
              <span>Ver Todo ({allStoreMachines.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Machinery Display: Panoramico or Grid */}
        <div
          ref={carouselRef}
          className={
            desktopFleetViewMode === 'carousel'
              ? "-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 pt-1 scrollbar-none"
              : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4 pt-1"
          }
        >
          {filteredMachines.map((machine) => (
            <IndustrialTiltCard
              key={machine.id}
              maxTilt={3}
              className={`${
                desktopFleetViewMode === 'carousel'
                  ? "w-[85vw] sm:w-[320px] lg:w-[350px] shrink-0 snap-start"
                  : "w-full"
              } bg-white dark:bg-zinc-950 rounded-[5px] border border-slate-200 dark:border-white/[0.08] hover:border-amber-400/60 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between group overflow-hidden`}
            >
              {/* Image Viewport */}
              <div className="relative aspect-[16/10] bg-zinc-900 overflow-hidden">
                <img
                  src={machine.image}
                  alt={machine.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-black text-amber-400 border border-white/[0.08]">
                  {machine.brand}
                </div>
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMachineCompare(machine.id);
                      triggerHaptic();
                    }}
                    className={`p-1 rounded-[2px] text-[9px] font-bold transition-all cursor-pointer ${
                      isComparing(machine.id)
                        ? 'bg-amber-400 text-black'
                        : 'bg-black/70 text-zinc-300 hover:text-amber-400 border border-white/10'
                    }`}
                    title={isComparing(machine.id) ? 'Quitar de comparativa' : 'Agregar a comparativa'}
                  >
                    <Scale className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActive360Tab('360');
                      setActive360Machine(machine);
                      triggerHaptic();
                    }}
                    className="p-1 rounded-[2px] bg-black/70 text-amber-400 hover:bg-black border border-white/10 cursor-pointer"
                    title="Giro 360°"
                  >
                    <RotateCw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-baseline justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono text-amber-500 font-bold uppercase truncate">
                      {machine.category}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-400 uppercase">
                      PATIO KM 22
                    </span>
                  </div>

                  <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white font-display truncate">
                    {machine.name}
                  </h3>

                  {/* Operational Specs */}
                  <div className="grid grid-cols-2 gap-1.5 py-1.5 px-2 rounded-[3px] bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.06] text-[10px] font-mono mt-2">
                    <span className="text-slate-700 dark:text-zinc-300">
                      <strong className="text-amber-500">{machine.powerHp}</strong> HP
                    </span>
                    <span className="text-slate-700 dark:text-zinc-300 text-right">
                      <strong>{(machine.operatingWeightKg / 1000).toFixed(1)}</strong> Toneladas
                    </span>
                  </div>

                  {/* Financials: Price + Leasing */}
                  <div className="pt-2 font-mono flex items-baseline justify-between border-t border-slate-100 dark:border-white/[0.06]">
                    <div>
                      <span className="text-[9px] text-zinc-400 block uppercase font-bold">PRECIO DIRECTO</span>
                      <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                        {formatMachineryPrice(machine.basePriceUsd)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] text-zinc-400 block uppercase font-bold">LEASING RD</span>
                      <span className="text-[10px] font-bold text-amber-500">
                        {formatLeasingEstimate(machine.basePriceUsd)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5-Star Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.06] font-display">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectMachine(machine.id);
                      onNavigate(`#/machinery/${machine.id}`);
                      triggerHaptic();
                    }}
                    className="py-2 px-2 rounded-[3px] bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-wider text-center cursor-pointer border border-slate-300 dark:border-white/[0.08]"
                  >
                    Ficha Completa →
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      addMachineToQuote(machine);
                      onNavigate('#/checkout');
                      triggerHaptic();
                    }}
                    className="py-2 px-2 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black text-[10px] font-black uppercase tracking-wider text-center cursor-pointer shadow-xs active:scale-[0.98]"
                  >
                    Cotizar NCF
                  </button>
                </div>
              </div>
            </IndustrialTiltCard>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* CHAPTER 2: THE PHYSICAL FORTRESS KM 22 (PATIO & PISTAS DE PRUEBA)       */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      <section className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-12 border-t border-slate-200 dark:border-white/[0.08]">
        <div className="rounded-[6px] bg-zinc-950 text-white p-6 sm:p-8 lg:p-10 border border-white/[0.1] relative overflow-hidden shadow-2xl">
          {/* Subtle Ambient Amber Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Physical Credentials & Satellite Coordinates */}
            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-[2px] bg-amber-400 text-black text-[10px] font-mono font-black uppercase">
                  CAPÍTULO II • SEDE CENTRAL FÍSICA
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

            {/* Right: Dual Authentic Photo Gallery */}
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

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* CHAPTER 3: EXECUTIVE COMMERCIAL SUITE & TRADE-IN ESTIMATOR              */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      <section className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-12 border-t border-slate-200 dark:border-white/[0.08]">
        <div className="mb-6">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">
            CAPÍTULO III • INGENIERÍA FINANCIERA & RENOVACIÓN
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

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* CHAPTER 4: THE 24/7 ENGINEERING ECOSYSTEM (POSTVENTA & TELEMETRÍA)      */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      <section className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-12 border-t border-slate-200 dark:border-white/[0.08]">
        <div className="mb-6">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">
            CAPÍTULO IV • ECOSISTEMA TÉCNICO PERMANENTE
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

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* CHAPTER 5: OFFICIAL BRANDS PAVILION & CLOSURE BANNER                     */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      <section className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-12 border-t border-slate-200 dark:border-white/[0.08]">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">
              CAPÍTULO V • ALIANZAS GLOBALES & BANCA LOCAL
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-display mt-1">
              Portafolio de Fabricantes Oficiales
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('#/brands-directory')}
            className="text-xs font-mono font-bold text-amber-500 hover:underline uppercase hidden sm:inline-block"
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
                scrollToCatalog();
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

        {/* High-Prestige Final Conversion Ribbon */}
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
                className="px-6 py-3 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg"
              >
                <Phone className="w-4 h-4" />
                <span>Llamar al Conmutador (809) 560-1234</span>
              </a>

              <a
                href="https://wa.me/18095601234?text=Hola%20Don%20Eduardo,%20deseo%20una%20reuni%C3%B3n%20t%C3%A9cnica%20para%20adquisici%C3%B3n%20de%20maquinaria."
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-[3px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Presidencia</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* GLOBAL MODALS & DIALOGS                                                 */}
      {/* ════════════════════════════════════════════════════════════════════════ */}

      {/* Machine 360 Studio Modal */}
      <Machine360Modal
        machine={active360Machine}
        isOpen={Boolean(active360Machine)}
        initialTab={active360Tab}
        onClose={() => setActive360Machine(null)}
        onNavigate={onNavigate}
      />

      {/* Price Estimate Modal */}
      <PriceEstimateModal
        machine={estimateMachine}
        isOpen={Boolean(estimateMachine)}
        onClose={() => setEstimateMachine(null)}
        onNavigate={onNavigate}
      />

      {/* Test Drive Booking Modal */}
      <TestDriveBookingModal
        isOpen={isTestDriveModalOpen}
        onClose={() => setIsTestDriveModalOpen(false)}
      />

    </div>
  );
};
