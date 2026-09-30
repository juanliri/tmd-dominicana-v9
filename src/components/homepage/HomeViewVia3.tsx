import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  HardHat,
  Search,
  Zap,
  SlidersHorizontal,
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
  Layers,
  Compass,
  Radio,
  Phone,
  MessageCircle,
  ExternalLink,
  Flame,
  Gauge,
  TrendingDown,
  Award
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

export const HomeViewVia3: React.FC<HomeViewProps> = ({ onNavigate, onSelectMachine }) => {
  const { currentUser, signInWithGoogle } = useAuth();
  const [authPromptFeature, setAuthPromptFeature] = useState<{ title: string; route: string; description: string } | null>(null);
  const { addMachineToQuote, currency, exchangeRate } = useCart();
  const { toggleMachineCompare, isComparing, openComparison } = useComparison();

  // Unified Store Machinery (44+ units)
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

  // Auto-rotating Hero machine
  const [heroMachineIndex, setHeroMachineIndex] = useState<number>(0);
  const [isHeroAutoPlaying, setIsHeroAutoPlaying] = useState<boolean>(true);
  
  const heroMachines = useMemo(() => {
    return [
      allStoreMachines.find(m => m.id === 'jcb-3cx-eco') || allStoreMachines[0],
      allStoreMachines.find(m => m.id === 'liugong-922e') || allStoreMachines[1],
      allStoreMachines.find(m => m.id === 'jcb-3cx-compact') || allStoreMachines[2],
      allStoreMachines.find(m => m.id === 'jcb-1cxt') || allStoreMachines[3],
    ].filter(Boolean);
  }, [allStoreMachines]);

  const activeHeroMachine = heroMachines[heroMachineIndex] || heroMachines[0] || allStoreMachines[0];

  useEffect(() => {
    if (!isHeroAutoPlaying || heroMachines.length <= 1) return;
    const interval = setInterval(() => {
      setHeroMachineIndex((prev) => (prev + 1) % heroMachines.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isHeroAutoPlaying, heroMachines.length]);

  // Catalog Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedBrand, setSelectedBrand] = useState<string>('Todas');
  const [quickSearchQuery, setQuickSearchQuery] = useState<string>('');
  const [fleetViewMode, setFleetViewMode] = useState<'grid' | 'carousel'>('grid');

  // Modals
  const [estimateMachine, setEstimateMachine] = useState<Machine | null>(null);
  const [isTestDriveModalOpen, setIsTestDriveModalOpen] = useState<boolean>(false);
  const [active360Machine, setActive360Machine] = useState<Machine | null>(null);
  const [isTradeInModalOpen, setIsTradeInModalOpen] = useState<boolean>(false);

  // Carousel ref
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 360;
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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* ========================================================================= */}
      {/* VÍA 3 HERO: 4K CINEMATIC ENGINE + DOCKED HIGH-VELOCITY CONVERSION DECK   */}
      {/* ========================================================================= */}
      <section className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden bg-zinc-950 border-b border-amber-500/20 pt-20 pb-8">
        
        {/* Full-bleed 4K Background with Subtle Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/images/tmd_machinery_hub_4k_cinematic.jpg" 
            alt="TMD Dominicana Sede Central Km 22" 
            className="w-full h-full object-cover object-center opacity-45 scale-105 animate-pulse duration-[14000ms]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/75 to-zinc-950/40" />
          <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:28px_28px] opacity-15" />
        </div>

        {/* Live Top Status Telemetry Ribbon */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-2">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-zinc-400 bg-zinc-900/80 backdrop-blur-md px-4 py-2 rounded-lg border border-zinc-800 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-zinc-200 font-bold uppercase tracking-wider">SEDE CENTRAL KM 22 ACTIVA</span>
              <span className="text-zinc-600 hidden sm:inline">|</span>
              <span className="hidden sm:inline text-zinc-400">18 Bahías 350 Bar en Servicio</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-amber-400 font-bold">44+ UNIDADES EN STOCK</span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-300">TASA BCRD: <strong className="text-white">RD$ {exchangeRate.toFixed(2)}</strong></span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6">
          
          {/* Left Column: Institutional Power & Direct Value */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              DISTRIBUCIÓN DIRECTA DE FÁBRICA • REPÚBLICA DOMINICANA
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-condensed tracking-tight text-white uppercase leading-none">
              POTENCIA PESADA <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
                DISPONIBILIDAD INMEDIATA
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 max-w-2xl font-sans leading-relaxed">
              Equipos de construcción, minería y agroindustria respaldados por 15,000 m² de taller central, 
              garantía directa de fábrica y crédito fiscal con NCF válido para deducción inmediata.
            </p>

            {/* DOCKED CONVERSION DECK: 4 Instant Action Pillars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <button 
                onClick={() => scrollToSection('hybrid-showroom')}
                className="flex flex-col p-3 rounded-lg bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-700/60 hover:border-amber-500/80 transition-all text-left group shadow-lg"
              >
                <div className="flex items-center justify-between text-amber-400 mb-1">
                  <Truck className="w-4 h-4" />
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-xs font-mono text-zinc-400">INVENTARIO</span>
                <span className="text-xs font-bold text-white uppercase font-sans">44+ Equipos</span>
              </button>

              <a 
                href="tel:+18095601234"
                className="flex flex-col p-3 rounded-lg bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-700/60 hover:border-emerald-500/80 transition-all text-left group shadow-lg"
              >
                <div className="flex items-center justify-between text-emerald-400 mb-1">
                  <Wrench className="w-4 h-4" />
                  <Phone className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-xs font-mono text-zinc-400">DESPACHO SOS</span>
                <span className="text-xs font-bold text-white uppercase font-sans">Taller 24/7</span>
              </a>

              <button 
                onClick={() => setIsTestDriveModalOpen(true)}
                className="flex flex-col p-3 rounded-lg bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-700/60 hover:border-blue-500/80 transition-all text-left group shadow-lg"
              >
                <div className="flex items-center justify-between text-blue-400 mb-1">
                  <MapPin className="w-4 h-4" />
                  <Calendar className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-xs font-mono text-zinc-400">PATIO KM 22</span>
                <span className="text-xs font-bold text-white uppercase font-sans">Test Drive VIP</span>
              </button>

              <button 
                onClick={() => setIsTradeInModalOpen(true)}
                className="flex flex-col p-3 rounded-lg bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-700/60 hover:border-amber-400/80 transition-all text-left group shadow-lg"
              >
                <div className="flex items-center justify-between text-amber-300 mb-1">
                  <Scale className="w-4 h-4" />
                  <DollarSign className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-xs font-mono text-zinc-400">TRADE-IN</span>
                <span className="text-xs font-bold text-white uppercase font-sans">Cotizar Flota</span>
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Featured Machine Viewfinder */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-zinc-900/90 border border-zinc-800/80 p-5 shadow-2xl backdrop-blur-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold uppercase">
                    {activeHeroMachine.brand} OFICIAL
                  </span>
                  <span className="text-zinc-400 text-xs font-mono">STOCK INMEDIATO</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {heroMachines.map((m, idx) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setIsHeroAutoPlaying(false);
                        setHeroMachineIndex(idx);
                      }}
                      className={`h-2 rounded-full transition-all ${idx === heroMachineIndex ? 'w-6 bg-amber-500' : 'w-2 bg-zinc-700'}`}
                      title={m.name}
                    />
                  ))}
                </div>
              </div>

              {/* Machine Photo */}
              <div className="relative h-56 sm:h-64 flex items-center justify-center p-2 group">
                <img 
                  src={getMachineImg(activeHeroMachine)} 
                  alt={activeHeroMachine?.name || 'Maquinaria TMD'}
                  className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={() => {
                    setActive360Machine(activeHeroMachine);
                  }}
                  className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg bg-zinc-950/80 hover:bg-amber-500 text-zinc-300 hover:text-zinc-950 text-xs font-mono font-bold border border-zinc-700 transition-colors flex items-center gap-1.5 shadow-lg backdrop-blur-md"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  ESTUDIO 360°
                </button>
              </div>

              {/* Machine Specs & Pricing */}
              <div className="space-y-3 pt-2">
                <div>
                  <h3 className="text-xl font-bold font-condensed text-white tracking-tight">
                    {activeHeroMachine?.name}
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans line-clamp-1">
                    {activeHeroMachine?.description}
                  </p>
                </div>

                <div className="flex items-baseline justify-between border-t border-zinc-800/80 pt-3">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block uppercase">PRECIO DIRECTO CON NCF</span>
                    <span className="text-xl sm:text-2xl font-black font-condensed text-amber-400">
                      {formatMachineryPrice(getMachineCost(activeHeroMachine))}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-zinc-500 block uppercase">LEASING ESTIMADO</span>
                    <span className="text-sm font-bold font-mono text-zinc-300">
                      {formatLeasingEstimate(getMachineCost(activeHeroMachine))}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => onSelectMachine(activeHeroMachine.id)}
                    className="w-full py-2.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20 text-center font-sans"
                  >
                    Ver Ficha Flagship
                  </button>
                  <button
                    onClick={() => {
                      addMachineToQuote(activeHeroMachine);
                      triggerHaptic();
                    }}
                    className="w-full py-2.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-colors border border-zinc-700 text-center font-sans"
                  >
                    + Cotizar NCF
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Live Marquee of Brands at Bottom of Hero */}
        <div className="relative z-10 border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md pt-2">
          <LiveMarquee onNavigate={onNavigate} />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 1: UNIFIED FLEET SHOWROOM (HIGH VELOCITY DUAL VIEW AT 550px)       */}
      {/* ========================================================================= */}
      <section id="hybrid-showroom" className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-500 font-bold uppercase tracking-wider mb-2">
              <HardHat className="w-4 h-4" />
              CAPÍTULO 1 • INVENTARIO CERTIFICADO TMD
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-condensed tracking-tight text-slate-900 dark:text-white uppercase">
              SHOWROOM DE FLOTA INDUSTRIAL
            </h2>
            <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-2xl font-sans mt-1">
              Catálogo sincronizado en tiempo real. Todos los equipos cuentan con telemetría satelital, 
              garantía oficial de 2 años y entrega inmediata en Sede Km 22 o en tu proyecto.
            </p>
          </div>

          {/* View Toggles & Search */}
          <div className="flex items-center gap-3">
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text"
                placeholder="Buscar modelo o marca..."
                value={quickSearchQuery}
                onChange={(e) => setQuickSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex rounded-lg border border-slate-300 dark:border-zinc-800 p-0.5 bg-slate-100 dark:bg-zinc-900">
              <button
                onClick={() => setFleetViewMode('grid')}
                className={`p-1.5 rounded text-xs font-mono ${fleetViewMode === 'grid' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'}`}
                title="Vista en Cuadrícula"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setFleetViewMode('carousel')}
                className={`p-1.5 rounded text-xs font-mono ${fleetViewMode === 'carousel' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'}`}
                title="Vista en Carrusel"
              >
                <Columns className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Brand Filters Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {brands.map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBrand(b)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all ${selectedBrand === b ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20' : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:border-amber-500'}`}
            >
              {b}
            </button>
          ))}
          <div className="h-4 w-px bg-zinc-700 mx-1" />
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all ${selectedCategory === c ? 'bg-slate-900 dark:bg-zinc-700 text-white' : 'bg-slate-100 dark:bg-zinc-900/60 text-slate-500 dark:text-zinc-400 hover:text-white'}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Machines Display: Grid or Carousel */}
        {fleetViewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredMachines.map((machine) => (
              <div 
                key={machine.id}
                className="group relative rounded-xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800/80 overflow-hidden shadow-lg hover:border-amber-500/60 transition-all flex flex-col justify-between"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2">
                    <span className="font-bold text-amber-500 uppercase">{machine.brand}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">STOCK KM 22</span>
                  </div>

                  <div 
                    onClick={() => onSelectMachine(machine.id)}
                    className="relative h-44 flex items-center justify-center cursor-pointer p-2 overflow-hidden"
                  >
                    <img 
                      src={getMachineImg(machine)} 
                      alt={machine.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <h3 
                    onClick={() => onSelectMachine(machine.id)}
                    className="font-bold text-base text-slate-900 dark:text-white font-condensed tracking-tight mt-2 line-clamp-1 cursor-pointer hover:text-amber-500"
                  >
                    {machine.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 mt-1 font-sans">
                    {machine.description}
                  </p>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50 dark:bg-zinc-950/60">
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 block uppercase">PRECIO NCF</span>
                      <span className="text-lg font-black font-condensed text-amber-500">
                        {formatMachineryPrice(getMachineCost(machine))}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 block uppercase">LEASING</span>
                      <span className="text-xs font-bold font-mono text-slate-700 dark:text-zinc-300">
                        {formatLeasingEstimate(getMachineCost(machine))}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSelectMachine(machine.id)}
                      className="py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase font-sans tracking-wide text-center"
                    >
                      Ver Ficha
                    </button>
                    <button
                      onClick={() => {
                        addMachineToQuote(machine);
                        triggerHaptic();
                      }}
                      className="py-2 px-3 rounded-lg bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-white font-bold text-xs uppercase font-sans tracking-wide text-center"
                    >
                      + Cotizar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            <div 
              ref={carouselRef}
              className="flex gap-5 overflow-x-auto pb-4 scroll-smooth scrollbar-none"
            >
              {filteredMachines.map((machine) => (
                <div 
                  key={machine.id}
                  className="w-[320px] flex-shrink-0 group relative rounded-xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800/80 overflow-hidden shadow-lg flex flex-col justify-between"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2">
                      <span className="font-bold text-amber-500 uppercase">{machine.brand}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">STOCK KM 22</span>
                    </div>

                    <div 
                      onClick={() => onSelectMachine(machine.id)}
                      className="relative h-44 flex items-center justify-center cursor-pointer p-2 overflow-hidden"
                    >
                      <img 
                        src={getMachineImg(machine)} 
                        alt={machine.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <h3 
                      onClick={() => onSelectMachine(machine.id)}
                      className="font-bold text-base text-slate-900 dark:text-white font-condensed tracking-tight mt-2 line-clamp-1 cursor-pointer hover:text-amber-500"
                    >
                      {machine.name}
                    </h3>
                  </div>

                  <div className="p-4 border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50 dark:bg-zinc-950/60">
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 block uppercase">PRECIO NCF</span>
                        <span className="text-lg font-black font-condensed text-amber-500">
                          {formatMachineryPrice(getMachineCost(machine))}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 block uppercase">LEASING</span>
                        <span className="text-xs font-bold font-mono text-slate-700 dark:text-zinc-300">
                          {formatLeasingEstimate(getMachineCost(machine))}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onSelectMachine(machine.id)}
                        className="py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase font-sans tracking-wide text-center"
                      >
                        Ver Ficha
                      </button>
                      <button
                        onClick={() => {
                          addMachineToQuote(machine);
                          triggerHaptic();
                        }}
                        className="py-2 px-3 rounded-lg bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-white font-bold text-xs uppercase font-sans tracking-wide text-center"
                      >
                        + Cotizar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel Navigation Arrows */}
            <button 
              onClick={() => scrollCarousel('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 p-3 rounded-full bg-zinc-950/90 text-white border border-zinc-700 shadow-xl hover:bg-amber-500 hover:text-zinc-950 transition-colors z-20"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scrollCarousel('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 p-3 rounded-full bg-zinc-950/90 text-white border border-zinc-700 shadow-xl hover:bg-amber-500 hover:text-zinc-950 transition-colors z-20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: 6-SERVICE OPERATIONAL RIBBON (THE DENSE ENGINEERING BENTO)     */}
      {/* ========================================================================= */}
      <section className="py-12 bg-zinc-900 border-y border-zinc-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8">
            <div>
              <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider block mb-1">
                ECOSISTEMA OPERACIONAL TMD • RESPALDO POST-VENTA
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-condensed tracking-tight uppercase">
                6 PILARES DE INGENIERÍA 24/7
              </h2>
            </div>
            <a 
              href="tel:+18095601234"
              className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 hover:text-emerald-300 font-bold mt-2 sm:mt-0"
            >
              <Phone className="w-4 h-4" />
              DESPACHO CENTRAL: (809) 560-1234
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            
            <div className="p-5 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-amber-500/50 transition-all space-y-2">
              <div className="flex items-center gap-3 text-amber-400">
                <Truck className="w-6 h-6" />
                <h3 className="font-bold font-condensed text-lg text-white uppercase">Taller Móvil SOS 24/7</h3>
              </div>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                4 unidades de rescate equipadas con bancos de presión hidráulica, soldadura de arco y diagnóstico electrónico directo en campo.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-amber-500/50 transition-all space-y-2">
              <div className="flex items-center gap-3 text-amber-400">
                <Building2 className="w-6 h-6" />
                <h3 className="font-bold font-condensed text-lg text-white uppercase">Sede Km 22 (18 Bahías)</h3>
              </div>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                15,000 m² de infraestructura con grúas puente de 20 toneladas y banco de prueba hidráulico certificado de 350 Bar.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-amber-500/50 transition-all space-y-2">
              <div className="flex items-center gap-3 text-blue-400">
                <Cpu className="w-6 h-6" />
                <h3 className="font-bold font-condensed text-lg text-white uppercase">Telemetría LiveLink™ IoT</h3>
              </div>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Monitoreo satelital en tiempo real de consumo de combustible, horas motor, geovallas y alertas de mantenimiento preventivo.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-amber-500/50 transition-all space-y-2">
              <div className="flex items-center gap-3 text-emerald-400">
                <Wrench className="w-6 h-6" />
                <h3 className="font-bold font-condensed text-lg text-white uppercase">Repuestos OEM Donaldson</h3>
              </div>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Más de 4,000 SKUs en inventario local: filtros Donaldson & Fleetguard, orugas, cuchillas y aceites hidráulicos originales.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-amber-500/50 transition-all space-y-2">
              <div className="flex items-center gap-3 text-amber-400">
                <ShieldCheck className="w-6 h-6" />
                <h3 className="font-bold font-condensed text-lg text-white uppercase">Garantía 2 Años / 2,000 Horas</h3>
              </div>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Cobertura directa de tren motriz, componentes hidráulicos y sistemas electrónicos con técnicos certificados en fábrica.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-amber-500/50 transition-all space-y-2">
              <div className="flex items-center gap-3 text-purple-400">
                <Award className="w-6 h-6" />
                <h3 className="font-bold font-condensed text-lg text-white uppercase">Academia de Operadores</h3>
              </div>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Capacitación y certificación técnica en seguridad, telemetría y rendimiento de combustible para tu personal de obra.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: SINGLE HIGH-CONTRAST TRADE-IN BANNER BAR (ZERO DOM CLUTTER)     */}
      {/* ========================================================================= */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-amber-500/40 p-8 sm:p-10 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2 max-w-2xl">
            <span className="px-3 py-1 rounded bg-amber-500/20 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
              PROGRAMA DE RENOVACIÓN DE FLOTAS
            </span>
            <h3 className="text-2xl sm:text-3xl font-black font-condensed text-white uppercase tracking-tight">
              ¿TIENES MAQUINARIA USADA? RECIBIMOS TU EQUIPO EN TRADE-IN
            </h3>
            <p className="text-sm text-zinc-300 font-sans">
              Tasamos tu excavadora, retroexcavadora o tractor usado como abono para tu nueva unidad con crédito fiscal NCF o pago directo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setIsTradeInModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase font-sans tracking-wider transition-colors shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
            >
              <Scale className="w-4 h-4" />
              Avaluar Mi Flota Ahora
            </button>
            <a
              href="https://wa.me/18095601234?text=Hola,%20deseo%20evaluar%20un%20equipo%20usado%20para%20Trade-In%20en%20TMD."
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase font-sans tracking-wider transition-colors border border-zinc-700 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              WhatsApp Directo
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: TACTICAL KM 22 PHYSICAL PROOF & GOOGLE MAPS RETICLE             */}
      {/* ========================================================================= */}
      <section className="py-12 bg-slate-100 dark:bg-zinc-900/60 border-t border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-mono text-amber-500 font-bold uppercase tracking-wider block">
                AUTORIDAD FÍSICA INEXPUGNABLE • NO SOMOS INTERMEDIARIOS
              </span>
              <h2 className="text-3xl font-black font-condensed text-slate-900 dark:text-white uppercase tracking-tight">
                SEDE CENTRAL & PATIO KM 22
              </h2>
              <p className="text-sm text-slate-600 dark:text-zinc-300 font-sans leading-relaxed">
                Nuestras instalaciones centrales albergan el patio de exhibición y pruebas de maquinaria pesada 
                más completo de la Autopista Duarte. Ven a operar y probar tu equipo antes de firmar el contrato.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                  <span className="text-xs font-mono text-slate-400 dark:text-zinc-500 block">COORDENADAS GPS</span>
                  <span className="text-xs font-mono font-bold text-slate-800 dark:text-zinc-200">18.5204° N, 69.9801° W</span>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                  <span className="text-xs font-mono text-slate-400 dark:text-zinc-500 block">HORARIO COMERCIAL</span>
                  <span className="text-xs font-mono font-bold text-slate-800 dark:text-zinc-200">Lun - Vie: 8am - 6pm</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsTestDriveModalOpen(true)}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase font-sans tracking-wider shadow-lg shadow-amber-500/20 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Agendar Visita & Test Drive VIP
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl overflow-hidden shadow-xl border border-slate-200 dark:border-zinc-800 group relative">
                <img 
                  src={tmdEntranceImg} 
                  alt="Fachada Principal Km 22" 
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-2 left-2 px-2 py-1 rounded bg-zinc-950/80 text-[10px] font-mono text-white backdrop-blur-md">
                  ENTRADA PRINCIPAL
                </span>
              </div>
              <div className="rounded-xl overflow-hidden shadow-xl border border-slate-200 dark:border-zinc-800 group relative">
                <img 
                  src={tmdPatioImg} 
                  alt="Patio de Maquinaria 15,000 m2" 
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-2 left-2 px-2 py-1 rounded bg-zinc-950/80 text-[10px] font-mono text-white backdrop-blur-md">
                  PATIO DE PRUEBAS 15,000 M²
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: OFFICIAL BRANDS PAVILION & VIP EXECUTIVE HOTLINE                */}
      {/* ========================================================================= */}
      <section className="py-12 bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-mono text-amber-500 font-bold uppercase tracking-wider block mb-2">
            DISTRIBUCIÓN OFICIAL AUTORIZADA
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-condensed text-slate-900 dark:text-white uppercase tracking-tight mb-8">
            MARCAS GLOBALES QUE IMPULSAN EL PAÍS
          </h2>

          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-4 items-center justify-center opacity-85">
            {OFFICIAL_BRANDS.map((brand) => (
              <div 
                key={brand.id}
                onClick={() => {
                  setSelectedBrand(brand.name);
                  scrollToSection('hybrid-showroom');
                }}
                className="p-3 rounded-lg border border-slate-200 dark:border-zinc-800 hover:border-amber-500 cursor-pointer transition-all bg-slate-50 dark:bg-zinc-900 flex flex-col items-center justify-center gap-1 group"
              >
                <BrandLogo brandId={brand.id} className="h-6 object-contain filter grayscale group-hover:grayscale-0 transition-all" />
                <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 group-hover:text-amber-500 font-bold">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>

          {/* Executive Direct Channel Card */}
          <div className="mt-12 p-6 rounded-2xl bg-zinc-900 text-white border border-zinc-800 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div>
              <span className="text-xs font-mono text-amber-400 font-bold uppercase block">
                ATENCIÓN CORPORATIVA & LICITACIONES
              </span>
              <h4 className="text-lg font-bold font-condensed">DON EDUARDO LÓPEZ • GERENCIA GENERAL</h4>
              <p className="text-xs text-zinc-400 font-sans">
                Atención directa para compras corporativas, licitaciones del Estado y apertura de líneas de crédito.
              </p>
            </div>
            <a 
              href="https://wa.me/18095601234?text=Estimado%20Don%20Eduardo,%20me%20comunico%20desde%20el%20portal%20TMD%20para%20una%20consulta%20corporativa."
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs uppercase font-sans tracking-wider transition-colors flex items-center gap-2 flex-shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              Contactar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CONNECTED MODALS                                                          */}
      {/* ========================================================================= */}
      {isTestDriveModalOpen && (
        <TestDriveBookingModal 
          isOpen={isTestDriveModalOpen}
          onClose={() => setIsTestDriveModalOpen(false)}
          machineName={activeHeroMachine.name}
        />
      )}

      {active360Machine && (
        <Machine360Modal
          isOpen={Boolean(active360Machine)}
          onClose={() => setActive360Machine(null)}
          machine={active360Machine}
          activeTab="360"
        />
      )}

      {(isTradeInModalOpen || estimateMachine) && (
        <PriceEstimateModal
          isOpen={isTradeInModalOpen || Boolean(estimateMachine)}
          onClose={() => {
            setIsTradeInModalOpen(false);
            setEstimateMachine(null);
          }}
          machine={estimateMachine || activeHeroMachine}
          onProceedToQuote={(data?: any) => {
            setIsTradeInModalOpen(false);
            setEstimateMachine(null);
            onNavigate('quote');
          }}
        />
      )}

    </div>
  );
};
