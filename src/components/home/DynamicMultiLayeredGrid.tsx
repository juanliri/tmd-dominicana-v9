import React, { useState, useMemo, useRef } from 'react';
import { 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft,
  Search,
  Star,
  MapPin,
  Building2,
  Wrench,
  Clock,
  Truck,
  FileSpreadsheet,
  MessageSquare,
  Check,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  HardHat,
  Phone,
  X,
  Layers,
  ArrowRight
} from 'lucide-react';
import { OFFICIAL_BRANDS, BrandInfo } from '../../data/brandsData';
import { BrandLogo } from '../common/BrandLogos';
import { CONTRACTOR_TESTIMONIALS, ContractorTestimonial } from '../../data/testimonials';
import { FAQ_DATA, FAQItem } from '../../data/faq';
import { Machine } from '../../types';

interface DynamicMultiLayeredGridProps {
  onNavigate: (route: string) => void;
  onSelectBrandFilter: (brandName: string) => void;
  onOpen360?: (machine: Machine) => void;
}

// Brand inventory counts for real-time Dominican contractor relevance
const BRAND_INVENTORY_COUNTS: Record<string, { count: number; flag: string; accentColor: string }> = {
  jcb: { count: 17, flag: '🇬🇧 UK', accentColor: '#f59e0b' },
  liugong: { count: 6, flag: '🌐 Global', accentColor: '#0284c7' },
  ammann: { count: 3, flag: '🇨🇭 Suiza', accentColor: '#e11d48' },
  'ls-tractor': { count: 8, flag: '🇰🇷 Corea', accentColor: '#2563eb' },
  kubota: { count: 5, flag: '🇯🇵 Japón', accentColor: '#ea580c' },
  yanmar: { count: 3, flag: '🇯🇵 Japón', accentColor: '#dc2626' },
  imer: { count: 2, flag: '🇮🇹 Italia', accentColor: '#7c3aed' },
  afex: { count: 1, flag: '🇺🇸 USA', accentColor: '#d97706' },
  yomel: { count: 1, flag: '🇦🇷 Argentina', accentColor: '#16a34a' }
};

// Contractor pull-quotes (punchy, high-impact headlines instead of text walls)
const CONTRACTOR_PULL_QUOTES: Record<string, string> = {
  'test-1': '2,400 horas de faena continua en roca coralina sin una sola falla hidráulica.',
  'test-2': 'Reducción comprobada de 18.5% en diésel en los arrozales del Valle del Yuna.',
  'test-3': '450 toneladas por turno en cantera sin forzar temperatura en motor Cummins.',
  'test-4': '98% de compactación Proctor estándar en solo 4 pasadas de rodillo en obra MOPC.',
  'test-5': 'Despacho directo en menos de 24h a más de 300 km de la capital para faena crítica.'
};

export const DynamicMultiLayeredGrid: React.FC<DynamicMultiLayeredGridProps> = ({
  onNavigate,
  onSelectBrandFilter,
  onOpen360
}) => {
  const [selectedBrandCategory, setSelectedBrandCategory] = useState<string>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [faqSearchQuery, setFaqSearchQuery] = useState<string>('');
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>('all');
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState<number>(0);
  
  const brandScrollRef = useRef<HTMLDivElement>(null);

  const filteredBrands = useMemo(() => {
    return OFFICIAL_BRANDS.filter((b) => {
      if (selectedBrandCategory === 'all') return true;
      if (selectedBrandCategory === 'construction') {
        return b.id === 'jcb' || b.id === 'liugong' || b.id === 'ammann' || b.id === 'imer';
      }
      if (selectedBrandCategory === 'agri') {
        return b.id === 'ls-tractor' || b.id === 'kubota' || b.id === 'yomel';
      }
      if (selectedBrandCategory === 'mining') {
        return b.id === 'liugong' || b.id === 'jcb' || b.id === 'afex';
      }
      return true;
    });
  }, [selectedBrandCategory]);

  const handleBrandCardClick = (brandName: string) => {
    onSelectBrandFilter(brandName);
    const catalogEl = document.getElementById('fleet-catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollBrands = (direction: 'left' | 'right') => {
    if (brandScrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      brandScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter(faq => {
      const matchesCat = selectedFaqCategory === 'all' || faq.category === selectedFaqCategory;
      if (!faqSearchQuery.trim()) return matchesCat;
      const q = faqSearchQuery.toLowerCase();
      const matchesSearch = faq.question.toLowerCase().includes(q) || 
        faq.answer.toLowerCase().includes(q) ||
        (faq.keyPoints && faq.keyPoints.some(k => k.toLowerCase().includes(q)));
      return matchesCat && matchesSearch;
    }).slice(0, 5);
  }, [faqSearchQuery, selectedFaqCategory]);

  const currentTestimonial: ContractorTestimonial = CONTRACTOR_TESTIMONIALS[activeTestimonialIdx] || CONTRACTOR_TESTIMONIALS[0];
  const pullQuote = CONTRACTOR_PULL_QUOTES[currentTestimonial.id] || currentTestimonial.review.slice(0, 90) + '...';

  return (
    <section className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 max-w-[1780px] mx-auto py-6 sm:py-10 space-y-8 sm:space-y-12" id="industrial-ecosystem-grid">
      
      {/* ========================================================================= */}
      {/* LAYER 1: INTERACTIVE BRAND PAVILION (Rich, Distinctive & Connected to Stock) */}
      {/* ========================================================================= */}
      <div id="brand-pavilion-section" className="space-y-4 scroll-mt-28">
        {/* Header & Category Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/[0.08]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-amber-500/10 dark:bg-[#d99b26]/10 border border-amber-500/30 dark:border-[#d99b26]/20 text-amber-700 dark:text-[#e0a22a] text-[10px] font-black uppercase tracking-wider font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-[#e0a22a]" />
                DISTRIBUIDOR AUTORIZADO RD • SEDE KM 22
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight font-display">
                Alianza Oficial de Marcas Homologadas
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400 font-sans">
              Maquinaria pesada certificada con stock físico en Patio Km 22, garantía directa de fábrica y despacho de repuestos genuinos.
            </p>
          </div>

          {/* Category Tabs & Navigation Arrows */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-950 p-1 rounded-lg border border-slate-200 dark:border-white/[0.06] overflow-x-auto scrollbar-none font-mono">
              <button
                type="button"
                onClick={() => setSelectedBrandCategory('all')}
                className={`px-2.5 py-1 rounded-[4px] text-[11px] font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                  selectedBrandCategory === 'all'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Todas ({OFFICIAL_BRANDS.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedBrandCategory('construction')}
                className={`px-2.5 py-1 rounded-[4px] text-[11px] font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                  selectedBrandCategory === 'construction'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Construcción
              </button>
              <button
                type="button"
                onClick={() => setSelectedBrandCategory('agri')}
                className={`px-2.5 py-1 rounded-[4px] text-[11px] font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                  selectedBrandCategory === 'agri'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Agro
              </button>
              <button
                type="button"
                onClick={() => setSelectedBrandCategory('mining')}
                className={`px-2.5 py-1 rounded-[4px] text-[11px] font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                  selectedBrandCategory === 'mining'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Minería
              </button>
            </div>

            {/* Scroll navigation arrows */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollBrands('left')}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#0c0c10] dark:hover:bg-[#1c1c24] text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-white/[0.08] transition-colors cursor-pointer"
                title="Desplazar marcas a la izquierda"
                aria-label="Desplazar a la izquierda"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollBrands('right')}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#0c0c10] dark:hover:bg-[#1c1c24] text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-white/[0.08] transition-colors cursor-pointer"
                title="Desplazar marcas a la derecha"
                aria-label="Desplazar a la derecha"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Brand Pavilion Carousel Track */}
        <div 
          ref={brandScrollRef}
          className="flex items-stretch gap-3 overflow-x-auto scrollbar-none pb-2 scroll-smooth snap-x snap-mandatory"
        >
          {filteredBrands.map((brand: BrandInfo) => {
            const meta = BRAND_INVENTORY_COUNTS[brand.id] || { count: 3, flag: brand.country, accentColor: '#f59e0b' };
            return (
              <div
                key={brand.id}
                onClick={() => handleBrandCardClick(brand.name)}
                className="w-[240px] sm:w-[260px] shrink-0 snap-start rounded-lg bg-white dark:bg-gradient-to-b dark:from-[#13131c] dark:via-[#0b0b10] dark:to-[#040407] border border-slate-200 dark:border-white/[0.08] hover:border-amber-500 dark:hover:border-[#d99b26]/70 transition-all p-3.5 flex flex-col justify-between group shadow-sm hover:shadow-md cursor-pointer relative overflow-hidden"
              >
                {/* Brand Color Top Accent Line */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1 transition-all group-hover:h-1.5"
                  style={{ backgroundColor: meta.accentColor }}
                />

                {/* Top Row: Vector Logo + Country Origin Flag */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="h-7 px-2 rounded-[3px] bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-white/[0.08] flex items-center justify-center shrink-0">
                    <BrandLogo brandId={brand.id} className="h-4 max-w-[65px]" />
                  </div>

                  <span className="px-1.5 py-0.5 rounded-[3px] text-[9px] font-mono font-bold bg-slate-100 dark:bg-[#0c0c10] text-slate-700 dark:text-zinc-400 border border-slate-200 dark:border-white/[0.06] shrink-0">
                    {meta.flag}
                  </span>
                </div>

                {/* Middle: Brand Title & Flagship Line */}
                <div className="py-2.5 space-y-1">
                  <h3 className="text-sm font-black font-display text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors uppercase">
                    {brand.name}
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-300 font-sans line-clamp-1">
                    {brand.equipmentLines[0] || brand.tagline}
                  </p>
                </div>

                {/* Bottom Row: Live Stock Pill + Filter Link */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-2 text-[10px] font-mono">
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{meta.count} en Patio</span>
                  </span>

                  <span className="font-bold text-amber-600 dark:text-[#e0a22a] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    <span>Ver Flota</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LAYER 2: BENTO GRID (Executive Contractor Case Study + Procurement FAQ Hub) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* ======================================================================= */}
        {/* LEFT COLUMN: EXECUTIVE CONTRACTOR CASE STUDY (High-Impact Social Proof)  */}
        {/* ======================================================================= */}
        <div id="contractors-testimonials-section" className="lg:col-span-6 flex flex-col justify-between rounded-xl bg-white dark:bg-gradient-to-b dark:from-[#14141c] dark:via-[#0c0c12] dark:to-[#06060a] border border-slate-200 dark:border-white/[0.08] p-5 sm:p-6 shadow-sm space-y-4 scroll-mt-28">
          
          {/* Header & Carousel Navigation */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.06]">
            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-600 dark:text-[#e0a22a] flex items-center gap-1.5 mb-0.5">
                <HardHat className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                CASOS DE ÉXITO EN OBRA RD
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight font-display">
                Experiencia de Contratistas en Terreno
              </h3>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTestimonialIdx((prev) => (prev > 0 ? prev - 1 : CONTRACTOR_TESTIMONIALS.length - 1))}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#0c0c10] dark:hover:bg-[#1c1c24] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/[0.08] transition-colors cursor-pointer"
                title="Caso anterior"
                aria-label="Caso anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTestimonialIdx((prev) => (prev < CONTRACTOR_TESTIMONIALS.length - 1 ? prev + 1 : 0))}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#0c0c10] dark:hover:bg-[#1c1c24] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/[0.08] transition-colors cursor-pointer"
                title="Caso siguiente"
                aria-label="Caso siguiente"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Active Case Study Bento Container */}
          <div className="p-4 sm:p-5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-white/[0.06] space-y-3.5 relative">
            
            {/* Contractor Profile Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[5px] bg-amber-500/15 border border-amber-500/30 flex items-center justify-center font-display font-black text-amber-700 dark:text-amber-400 text-sm shadow-xs">
                  {currentTestimonial.author.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-slate-900 dark:text-white font-display">
                      {currentTestimonial.author}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/50">
                      Verificado
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-600 dark:text-zinc-400 block font-sans">
                    {currentTestimonial.role} • <strong className="text-slate-800 dark:text-zinc-300">{currentTestimonial.company}</strong>
                  </span>
                </div>
              </div>

              {/* Location Pill & Star Rating */}
              <div className="text-right space-y-0.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200/80 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 text-[10px] font-mono font-bold">
                  <MapPin className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  {currentTestimonial.city}, {currentTestimonial.province}
                </span>
                <div className="flex items-center justify-end gap-0.5 text-amber-500 text-xs">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 ml-1 font-mono">5.0</span>
                </div>
              </div>
            </div>

            {/* High-Impact Hero Pull-Quote */}
            <div className="pt-1">
              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase font-display leading-snug">
                &ldquo;{pullQuote}&rdquo;
              </h4>
              <p className="text-xs text-slate-600 dark:text-zinc-300 font-sans leading-relaxed pt-1.5 line-clamp-3">
                {currentTestimonial.review}
              </p>
            </div>

            {/* 3-Metric CAD Telemetry Bar */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-white/[0.08] text-center font-mono">
              <div className="p-2 rounded bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-white/[0.06]">
                <span className="text-[9px] text-slate-500 dark:text-zinc-400 block font-bold uppercase">Rendimiento</span>
                <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 truncate block">
                  {currentTestimonial.highlightMetric?.value || '+2,400h'}
                </span>
              </div>
              <div className="p-2 rounded bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-white/[0.06]">
                <span className="text-[9px] text-slate-500 dark:text-zinc-400 block font-bold uppercase">Flota en Obra</span>
                <span className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400 truncate block">
                  {currentTestimonial.equipmentUsed[0] || 'JCB 3CX'}
                </span>
              </div>
              <div className="p-2 rounded bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-white/[0.06]">
                <span className="text-[9px] text-slate-500 dark:text-zinc-400 block font-bold uppercase">Respaldo TMD</span>
                <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-zinc-200 truncate block">
                  Taller SOS 24/7
                </span>
              </div>
            </div>
          </div>

          {/* Quick Contractor Selector Tabs */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500 uppercase font-bold">
              Seleccionar Empresa Contratista:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 font-mono">
              {CONTRACTOR_TESTIMONIALS.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTestimonialIdx(idx)}
                  className={`px-2.5 py-1 rounded-[4px] text-[10px] font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                    activeTestimonialIdx === idx
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.06]'
                  }`}
                >
                  {item.company.split(' ')[0]} ({item.city})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN: PROCUREMENT & FINANCE FAQ HUB (Bullet Points & Actions)   */}
        {/* ======================================================================= */}
        <div id="procurement-faqs-section" className="lg:col-span-6 flex flex-col justify-between rounded-xl bg-white dark:bg-gradient-to-b dark:from-[#14141c] dark:via-[#0c0c12] dark:to-[#06060a] border border-slate-200 dark:border-white/[0.08] p-5 sm:p-6 shadow-sm space-y-4 scroll-mt-28">
          
          {/* Header & Fast Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-200 dark:border-white/[0.06]">
            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-600 dark:text-[#e0a22a] block mb-0.5">
                RESOLUCIÓN TÉCNICA Y BANCARIA
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight font-display">
                Preguntas Frecuentes de Compras & Finanzas
              </h3>
            </div>

            {/* Fast Search Input */}
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar dudas..."
                value={faqSearchQuery}
                onChange={(e) => setFaqSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
              />
              {faqSearchQuery && (
                <button
                  type="button"
                  onClick={() => setFaqSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Quick FAQ Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none font-mono">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'machinery', label: 'Clima & Motor' },
              { id: 'financing', label: 'NCF & Leasing' },
              { id: 'warranty', label: 'Garantía & Patio' }
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedFaqCategory(cat.id)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                  selectedFaqCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.06]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Structured Accordion Cards with KeyPoints */}
          <div className="space-y-2">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.id || idx}
                  className={`rounded-lg transition-all border ${
                    isOpen
                      ? 'bg-slate-50 dark:bg-[#0c0c10] border-amber-400/80 dark:border-[#d99b26]/60 shadow-xs'
                      : 'bg-white dark:bg-gradient-to-b dark:from-[#13131c] dark:via-[#0b0b10] dark:to-[#040407] border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-3 flex items-center justify-between text-left font-bold text-xs text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-[#e0a22a] transition-colors cursor-pointer"
                  >
                    <span className="pr-3 leading-snug flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      {faq.question}
                    </span>
                    <ChevronRight className={`w-4 h-4 text-slate-400 dark:text-zinc-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-90 text-amber-600 dark:text-[#e0a22a]' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-3 pb-3.5 space-y-2.5 border-t border-slate-200 dark:border-white/[0.06] pt-2.5 text-xs">
                      {/* Concise Summary */}
                      <p className="text-slate-600 dark:text-zinc-300 font-sans leading-relaxed">
                        {faq.answer}
                      </p>

                      {/* Technical Key Takeaways (Bullets) */}
                      {faq.keyPoints && faq.keyPoints.length > 0 && (
                        <div className="p-2.5 rounded bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-white/[0.06] space-y-1.5 font-sans">
                          <span className="text-[10px] font-mono font-bold uppercase text-amber-700 dark:text-amber-400 block">
                            Puntos Clave Certificados:
                          </span>
                          {faq.keyPoints.map((pt, pIdx) => (
                            <div key={pIdx} className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-zinc-200">
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                              <span>{pt}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Direct Resolution Action Link */}
                      {faq.actionLabel && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (faq.actionRoute) onNavigate(faq.actionRoute);
                              else if (faq.actionType === 'whatsapp') {
                                window.open('https://wa.me/18095601234?text=Hola%2C%20requiero%20informaci%C3%B3n%20sobre%20' + encodeURIComponent(faq.question), '_blank');
                              }
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 cursor-pointer transition-colors"
                          >
                            <span>{faq.actionLabel}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Elevated Conversion Callout Bar */}
          <div className="p-3.5 rounded-lg bg-amber-500/10 dark:bg-gradient-to-r dark:from-[#181824] dark:to-[#0e0e16] border border-amber-500/30 dark:border-[#d99b26]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5 text-center sm:text-left">
              <span className="font-black text-slate-900 dark:text-white block font-display uppercase tracking-wide">
                ¿Requieres cotización formal con Comprobante NCF B01?
              </span>
              <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-sans flex items-center justify-center sm:justify-start gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Asesores Comerciales Activos en Patio Km 22</span>
              </span>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="https://wa.me/18095601234?text=Hola%2C%20solicito%20cotizaci%C3%B3n%20formal%20NCF%20B01"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 rounded-[5px] bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs cursor-pointer transition-colors flex items-center gap-1.5 border border-slate-300 dark:border-white/[0.08]"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => onNavigate('#/checkout')}
                className="py-2 px-3.5 rounded-[5px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-md shrink-0 transition-all flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-950" />
                <span>Emitir Proforma</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
};
