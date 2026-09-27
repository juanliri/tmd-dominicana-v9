import React, { useState, useMemo, useRef } from 'react';
import { 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft,
  Search
} from 'lucide-react';
import { OFFICIAL_BRANDS, BrandInfo } from '../../data/brandsData';
import { BrandLogo } from '../common/BrandLogos';
import { CONTRACTOR_TESTIMONIALS } from '../../data/testimonials';
import { FAQ_DATA } from '../../data/faq';
import { Machine } from '../../types';

interface DynamicMultiLayeredGridProps {
  onNavigate: (route: string) => void;
  onSelectBrandFilter: (brandName: string) => void;
  onOpen360?: (machine: Machine) => void;
}

export const DynamicMultiLayeredGrid: React.FC<DynamicMultiLayeredGridProps> = ({
  onNavigate,
  onSelectBrandFilter,
  onOpen360
}) => {
  const [selectedBrandCategory, setSelectedBrandCategory] = useState<string>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [faqSearchQuery, setFaqSearchQuery] = useState<string>('');
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState<number>(0);
  
  const brandScrollRef = useRef<HTMLDivElement>(null);

  const filteredBrands = OFFICIAL_BRANDS.filter((b) => {
    if (selectedBrandCategory === 'all') return true;
    if (selectedBrandCategory === 'construction') {
      return b.id === 'jcb' || b.id === 'liugong' || b.id === 'ammann' || b.id === 'imer';
    }
    if (selectedBrandCategory === 'agri') {
      return b.id === 'ls-tractor' || b.id === 'kubota';
    }
    if (selectedBrandCategory === 'mining') {
      return b.id === 'liugong' || b.id === 'jcb' || b.id === 'afex';
    }
    return true;
  });

  const handleBrandCardClick = (brandName: string) => {
    onSelectBrandFilter(brandName);
    const catalogEl = document.getElementById('fleet-catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollBrands = (direction: 'left' | 'right') => {
    if (brandScrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      brandScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const filteredFaqs = useMemo(() => {
    if (!faqSearchQuery.trim()) return FAQ_DATA.slice(0, 5);
    const q = faqSearchQuery.toLowerCase();
    return FAQ_DATA.filter(
      f => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
    );
  }, [faqSearchQuery]);

  const currentTestimonial = CONTRACTOR_TESTIMONIALS[activeTestimonialIdx] || CONTRACTOR_TESTIMONIALS[0];

  return (
    <section className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 max-w-[1780px] mx-auto py-6 sm:py-10 space-y-8 sm:space-y-12" id="industrial-ecosystem-grid">
      
      {/* ========================================================================= */}
      {/* LAYER 1: SLEEK TMD MULTI-BRAND ALLIANCE SHOWROOM (HORIZONTAL SCROLLABLE)  */}
      {/* ========================================================================= */}
      <div id="brand-pavilion-section" className="space-y-3 scroll-mt-28">
        {/* Sleek TMD Authority Header & Category Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#d99b26]/10 border border-[#d99b26]/20 text-[#e0a22a] text-[10px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3" />
                DISTRIBUIDOR AUTORIZADO RD
              </span>
              <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                Alianza Oficial de Marcas Homologadas
              </h2>
            </div>
            <p className="text-xs text-zinc-400">
              Stock físico en Patio Km 22, garantía directa de fábrica y despacho de repuestos genuinos.
            </p>
          </div>

          {/* Quick Category Filters & Carousel Navigation */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-0.5 bg-[#09090e] p-1 rounded-lg border border-white/[0.06] overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedBrandCategory('all')}
                className={`px-2 py-0.5 rounded-[4px] text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedBrandCategory === 'all'
                    ? 'bg-[#d99b26] text-black font-black shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Todas ({OFFICIAL_BRANDS.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedBrandCategory('construction')}
                className={`px-2 py-0.5 rounded-[4px] text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedBrandCategory === 'construction'
                    ? 'bg-[#d99b26] text-black font-black shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Construcción
              </button>
              <button
                type="button"
                onClick={() => setSelectedBrandCategory('agri')}
                className={`px-2 py-0.5 rounded-[4px] text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedBrandCategory === 'agri'
                    ? 'bg-[#d99b26] text-black font-black shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Agro
              </button>
              <button
                type="button"
                onClick={() => setSelectedBrandCategory('mining')}
                className={`px-2 py-0.5 rounded-[4px] text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedBrandCategory === 'mining'
                    ? 'bg-[#d99b26] text-black font-black shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Minería
              </button>
            </div>

            {/* Scroll buttons for brands */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollBrands('left')}
                className="p-1.5 rounded-lg bg-[#0e0e16] hover:bg-[#181824] text-zinc-300 hover:text-white border border-white/[0.08] transition-colors cursor-pointer"
                title="Desplazar a la izquierda"
                aria-label="Desplazar marcas a la izquierda"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => scrollBrands('right')}
                className="p-1.5 rounded-lg bg-[#0e0e16] hover:bg-[#181824] text-zinc-300 hover:text-white border border-white/[0.08] transition-colors cursor-pointer"
                title="Desplazar a la derecha"
                aria-label="Desplazar marcas a la derecha"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Compact Horizontal Brand Track (Low Profile Luxury Obsidian Cards) */}
        <div 
          ref={brandScrollRef}
          className="flex items-stretch gap-2.5 overflow-x-auto scrollbar-none pb-1 scroll-smooth snap-x snap-mandatory"
        >
          {filteredBrands.map((brand: BrandInfo) => {
            return (
              <div
                key={brand.id}
                onClick={() => handleBrandCardClick(brand.name)}
                className="w-[210px] sm:w-[230px] shrink-0 snap-start rounded-lg bg-gradient-to-b from-[#13131c] via-[#0b0b10] to-[#040407] border border-white/[0.08] hover:border-[#d99b26]/60 transition-all p-3 flex flex-col justify-between group shadow-xs cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-6 px-1.5 rounded-[3px] bg-[#07070b] border border-white/[0.08] flex items-center justify-center shrink-0">
                      <BrandLogo brandId={brand.id} className="h-3.5 max-w-[55px]" />
                    </div>
                    <span className="text-xs font-black text-white group-hover:text-[#e0a22a] transition-colors truncate">
                      {brand.name}
                    </span>
                  </div>

                  <span className="px-1 py-0.5 rounded-[2px] text-[8px] font-bold bg-[#0a0a10] text-zinc-400 border border-white/[0.06] shrink-0">
                    {brand.country}
                  </span>
                </div>

                <div className="pt-2 mt-2 border-t border-white/[0.06] flex items-center justify-between gap-2 text-[10px]">
                  <span className="text-zinc-400 truncate font-sans">
                    {brand.equipmentLines[0]}
                  </span>
                  <span className="font-bold text-[#e0a22a] group-hover:text-white flex items-center shrink-0 transition-colors">
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LAYER 2: STREAMLINED CONTRACTOR EXPERIENCE & PROCUREMENT FAQS             */}
      {/* ========================================================================= */}
      <div className="rounded-xl bg-gradient-to-b from-[#14141c] via-[#0c0c12] to-[#06060a] border border-white/[0.08] p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Real Dominican Contractors Experience */}
          <div id="contractors-testimonials-section" className="lg:col-span-6 space-y-3.5 scroll-mt-28">
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#e0a22a] block mb-0.5">
                  Voces del Sector Construcción RD
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Experiencia de Contratistas en Obra
                </h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTestimonialIdx((prev) => (prev > 0 ? prev - 1 : CONTRACTOR_TESTIMONIALS.length - 1))}
                  className="p-1 rounded-md bg-[#0e0e16] hover:bg-[#181824] text-zinc-300 transition-colors cursor-pointer border border-white/[0.06]"
                  title="Anterior testimonio"
                  aria-label="Testimonio anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTestimonialIdx((prev) => (prev < CONTRACTOR_TESTIMONIALS.length - 1 ? prev + 1 : 0))}
                  className="p-1 rounded-md bg-[#0e0e16] hover:bg-[#181824] text-zinc-300 transition-colors cursor-pointer border border-white/[0.06]"
                  title="Siguiente testimonio"
                  aria-label="Siguiente testimonio"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Active Testimonial Card */}
            <div className="p-4 rounded-xl bg-gradient-to-b from-[#13131c] via-[#0b0b10] to-[#040407] border border-white/[0.08] space-y-2.5 relative transition-all">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-black text-white block">{currentTestimonial.author}</span>
                  <span className="text-[10px] text-zinc-400">{currentTestimonial.role} • {currentTestimonial.company}</span>
                </div>
                <span className="px-2 py-0.5 rounded-[4px] bg-[#d99b26]/10 text-[#e0a22a] text-[10px] font-bold border border-[#d99b26]/20 shrink-0">
                  {currentTestimonial.city}, {currentTestimonial.province}
                </span>
              </div>

              <p className="text-xs text-zinc-300 italic leading-relaxed">
                "{currentTestimonial.review}"
              </p>

              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2 text-[10px]">
                <span className="text-[#e0a22a] font-mono font-bold truncate">
                  Flota: {currentTestimonial.equipmentUsed.join(', ')}
                </span>
                {currentTestimonial.highlightMetric && (
                  <span className="text-emerald-400 font-bold shrink-0">
                    {currentTestimonial.highlightMetric.value} {currentTestimonial.highlightMetric.label}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Testimonial selector tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {CONTRACTOR_TESTIMONIALS.slice(0, 4).map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTestimonialIdx(idx)}
                  className={`px-2.5 py-1 rounded-[4px] text-[10px] font-bold transition-all cursor-pointer truncate ${
                    activeTestimonialIdx === idx
                      ? 'bg-[#d99b26] text-black font-black shadow-xs'
                      : 'bg-[#09090e] text-zinc-400 hover:text-white border border-white/[0.06]'
                  }`}
                >
                  {item.author.split(' ')[0]} ({item.city})
                </button>
              ))}
            </div>
          </div>

          {/* Right: Institutional FAQ for Contractors & Procurement with Fast Search */}
          <div id="procurement-faqs-section" className="lg:col-span-6 space-y-3.5 scroll-mt-28">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-white/[0.06]">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#e0a22a] block mb-0.5">
                  Preguntas Frecuentes
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Resolución para Finanzas y Compras
                </h3>
              </div>

              {/* Fast FAQ Filter */}
              <div className="relative w-full sm:w-44">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar en FAQs..."
                  value={faqSearchQuery}
                  onChange={(e) => setFaqSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-[#09090e] border border-white/[0.08] text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#d99b26]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              {filteredFaqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-lg bg-gradient-to-b from-[#13131c] via-[#0b0b10] to-[#040407] border border-white/[0.08] overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-2.5 sm:p-3 flex items-center justify-between text-left font-bold text-xs text-white hover:text-[#e0a22a] transition-colors cursor-pointer"
                    >
                      <span className="pr-2">{faq.question}</span>
                      <ChevronRight className={`w-3.5 h-3.5 text-zinc-400 transition-transform shrink-0 ${isOpen ? 'rotate-90 text-[#e0a22a]' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-2.5 sm:px-3 pb-3 text-xs text-zinc-300 leading-relaxed border-t border-white/[0.06] pt-2">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Direct Contact Assistance */}
            <div className="p-3 rounded-lg bg-[#0a0a10] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-white block">¿Requieres cotización formal con NCF B01?</span>
                <span className="text-zinc-400 text-[11px]">Nuestros ingenieros comerciales te atienden al instante.</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('#/checkout')}
                className="py-1.5 px-3 rounded-[4px] bg-[#d99b26] hover:bg-[#e0a22a] text-black font-black text-xs cursor-pointer shadow-xs shrink-0 whitespace-nowrap transition-colors"
              >
                Cotizar con Asesor
              </button>
            </div>
          </div>

        </div>
      </div>

    </section>
  );
};
