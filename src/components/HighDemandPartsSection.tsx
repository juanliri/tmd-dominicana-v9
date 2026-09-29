import React, { useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Truck, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Plus, 
  Check, 
  ShieldCheck, 
  MapPin, 
  Zap,
  ShoppingBag,
  Copy,
  Search,
  MessageSquare,
  Sparkles,
  Info,
  X,
  Clock,
  ArrowRight
} from 'lucide-react';
import { PARTS_DATA } from '../data/parts';
import { useCart } from '../context/CartContext';
import { Part } from '../types';

interface HighDemandPartsSectionProps {
  onNavigate: (route: string) => void;
  onSelectMachineByName?: (machineName: string) => void;
}

const DISPATCH_LOCATIONS = [
  { city: 'Santo Domingo / D.N.', time: '2 - 4 Horas', route: 'Salida directa Km 22 Duarte' },
  { city: 'Santiago / Cibao', time: 'Mismo Día (6h)', route: 'Vía Metro Pac & Expreso' },
  { city: 'Punta Cana / Bávaro', time: 'Hoy / < 24h', route: 'Ruta hotelera diaria' },
  { city: 'La Vega / Bonao', time: '3 - 5 Horas', route: 'Corredor Autopista Duarte' },
  { city: 'Cabo Rojo / Pedernales', time: '< 24 Horas', route: 'Carga Expresa Proyectos' }
];

const POPULAR_MACHINE_FILTERS = [
  { label: 'Todos los Equipos', value: 'all' },
  { label: 'JCB 3CX', value: 'JCB 3CX' },
  { label: 'LiuGong 922E', value: 'LiuGong 922E' },
  { label: 'LiuGong 856H', value: '856H' },
  { label: 'Ammann ASC', value: 'Ammann' },
  { label: 'Cummins Diesel', value: 'Cummins' }
];

export const HighDemandPartsSection = React.memo<HighDemandPartsSectionProps>(({
  onNavigate,
  onSelectMachineByName
}) => {
  const { addToCart, formatPrice, currency } = useCart();
  const sliderRef = useRef<HTMLDivElement>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMachineFilter, setSelectedMachineFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCityIdx, setSelectedCityIdx] = useState<number>(0);
  const [addedPartId, setAddedPartId] = useState<string | null>(null);
  const [copiedPartNumber, setCopiedPartNumber] = useState<string | null>(null);
  const [quickViewPart, setQuickViewPart] = useState<Part | null>(null);

  const categories = [
    { id: 'all', label: 'Todo el Stock' },
    { id: 'Filtros', label: 'Filtros & Kits' },
    { id: 'Desgaste', label: 'Dientes & Cuchillas' },
    { id: 'Hidráulica', label: 'Bombas & Cilindros' },
    { id: 'Motor', label: 'Inyección & Motor' }
  ];

  const filteredParts = useMemo(() => {
    return PARTS_DATA.filter((part) => {
      // Category filter
      const matchesCategory = 
        selectedCategory === 'all' || 
        part.category.toLowerCase().includes(selectedCategory.toLowerCase());

      // Machine filter
      const matchesMachine = 
        selectedMachineFilter === 'all' || 
        part.compatibleModels.some(m => m.toLowerCase().includes(selectedMachineFilter.toLowerCase())) ||
        part.name.toLowerCase().includes(selectedMachineFilter.toLowerCase());

      // Search Query
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = 
        !query ||
        part.name.toLowerCase().includes(query) ||
        part.partNumber.toLowerCase().includes(query) ||
        part.brand.toLowerCase().includes(query) ||
        part.compatibleModels.some(m => m.toLowerCase().includes(query));

      return matchesCategory && matchesMachine && matchesSearch;
    });
  }, [selectedCategory, selectedMachineFilter, searchQuery]);

  const handleAddToCart = (part: Part, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addToCart(part, 1);
    setAddedPartId(part.id);
    setTimeout(() => setAddedPartId(null), 1500);
  };

  const handleCopyPartNumber = (partNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(partNumber);
    setCopiedPartNumber(partNumber);
    setTimeout(() => setCopiedPartNumber(null), 1500);
  };

  const handleWhatsAppQuickOrder = (part: Part, e: React.MouseEvent) => {
    e.stopPropagation();
    const city = DISPATCH_LOCATIONS[selectedCityIdx].city;
    const msg = encodeURIComponent(
      `*Orden Express de Repuesto OEM - TMD Dominicana*\n` +
      `📦 Repuesto: ${part.name}\n` +
      `🔢 Nro Parte: ${part.partNumber}\n` +
      `🚜 Marca: ${part.brand}\n` +
      `📍 Destino de Despacho: ${city}\n` +
      `💰 Precio: USD $${part.priceUsd.toFixed(2)}\n` +
      `¿Tienen disponibilidad para despacho inmediato hoy?`
    );
    window.open(`https://wa.me/18095601234?text=${msg}`, '_blank');
  };

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 320;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1780px] mx-auto py-2 sm:py-3 font-display" id="repuestos-alta-demanda">
      <div className="bg-zinc-950 rounded-[5px] border border-zinc-800 p-4 sm:p-5 shadow-xl">
        
        {/* Dynamic Compact Bar 1: Header + Live Stock Indicator + Dispatch Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              STOCK VIVO KM 22
            </span>

            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2 uppercase tracking-wider">
              <span>REPUESTOS OEM DE ALTA DEMANDA</span>
              <span className="text-xs font-mono font-bold text-amber-400">
                ({filteredParts.length} DISPONIBLES)
              </span>
            </h2>
          </div>

          {/* Dynamic Dispatch Route Selector + Catalog Shortcut */}
          <div className="flex items-center gap-2 self-start lg:self-auto font-mono">
            {/* Live Dispatch selector */}
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 text-amber-400 px-2.5 py-1 rounded-[3px] text-xs font-bold">
              <Truck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[10px] uppercase font-mono font-black tracking-wider text-zinc-400 hidden sm:inline">
                RUTA:
              </span>
              <select
                value={selectedCityIdx}
                onChange={(e) => setSelectedCityIdx(Number(e.target.value))}
                className="bg-transparent border-0 text-xs font-bold text-white cursor-pointer focus:outline-none uppercase"
              >
                {DISPATCH_LOCATIONS.map((loc, idx) => (
                  <option key={idx} value={idx} className="bg-zinc-900 text-white">
                    {loc.city.toUpperCase()} — {loc.time.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => onNavigate('#/parts')}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs transition-colors cursor-pointer shrink-0 shadow-md font-display"
            >
              <span>VER TODO</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Compact Bar 2: Quick Search + Filter Pills + Slider Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 pb-2 font-display">
          {/* Category Chips & Machine Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-[3px] text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border ${
                  selectedCategory === cat.id
                    ? 'bg-zinc-800 text-amber-400 border-zinc-700 shadow-xs'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-850'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Quick Search & Slider Arrow Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end font-mono">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="PARTE O MODELO..."
                className="w-full pl-8 pr-6 py-1 text-xs rounded-[3px] bg-zinc-900 border border-zinc-800 focus:border-amber-400 focus:bg-zinc-950 text-white placeholder-zinc-500 transition-all outline-none uppercase font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => scrollSlider('left')}
                className="p-1.5 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
                title="Desplazar izquierda"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => scrollSlider('right')}
                className="p-1.5 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
                title="Desplazar derecha"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Horizontal Cards Stream / Responsive Slider */}
        <div
          ref={sliderRef}
          className="flex items-stretch gap-3 overflow-x-auto pt-2 pb-1 scrollbar-none snap-x"
        >
          {filteredParts.length === 0 ? (
            <div className="w-full py-8 text-center text-xs text-zinc-400 font-mono uppercase">
              NO SE ENCONTRARON REPUESTOS CON EL FILTRO "{searchQuery || selectedCategory}".
              <button
                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                className="block mx-auto mt-2 text-amber-400 font-bold hover:underline uppercase"
              >
                RESTABLECER FILTROS
              </button>
            </div>
          ) : (
            filteredParts.map((part) => {
              const isAdded = addedPartId === part.id;
              const isCopied = copiedPartNumber === part.partNumber;

              return (
                <div
                  key={part.id}
                  onClick={() => setQuickViewPart(part)}
                  className="w-[260px] sm:w-[280px] shrink-0 snap-start group rounded-[4px] bg-zinc-900 border border-zinc-800 p-3.5 flex flex-col justify-between hover:border-amber-400/60 transition-all hover:shadow-xl cursor-pointer relative font-display"
                >
                  {/* Top Badges */}
                  <div>
                    <div className="flex items-center justify-between gap-1.5 mb-2">
                      <span className="px-1.5 py-0.5 rounded-[2px] bg-zinc-950 text-amber-400 border border-zinc-800 text-[10px] font-mono font-black uppercase tracking-wider">
                        {part.category}
                      </span>

                      {/* Copy Part Number Button */}
                      <button
                        type="button"
                        onClick={(e) => handleCopyPartNumber(part.partNumber, e)}
                        className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-zinc-400 hover:text-amber-400 bg-zinc-950 px-1.5 py-0.5 rounded-[2px] border border-zinc-800 cursor-pointer transition-colors"
                        title="Copiar Código OEM"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                            <span className="text-emerald-400 text-[10px] uppercase font-bold">COPIADO</span>
                          </>
                        ) : (
                          <>
                            <span>{part.partNumber}</span>
                            <Copy className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                          </>
                        )}
                      </button>
                    </div>

                    {/* Image & Quick Info */}
                    <div className="relative h-28 w-full rounded-[3px] overflow-hidden mb-2.5 bg-zinc-950 border border-zinc-800">
                      <img
                        src={part.image}
                        alt={part.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      
                      {/* Stock Level Tag */}
                      <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-[2px] bg-zinc-950/90 border border-zinc-800 text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1 uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{part.stockQty} UNID. KM 22</span>
                      </div>
                    </div>

                    {/* Title & Compatibility */}
                    <h3 className="font-black text-xs text-white line-clamp-1 group-hover:text-amber-400 transition-colors uppercase">
                      {part.name}
                    </h3>
                    
                    <p className="text-[10px] font-mono font-bold text-zinc-400 mt-0.5 line-clamp-1 uppercase">
                      {part.brand} • {(part.compatibleModels || []).slice(0, 2).join(', ')}
                    </p>
                  </div>

                  {/* Price & Action Row */}
                  <div className="pt-2.5 mt-2 border-t border-zinc-800 flex items-center justify-between gap-2 font-mono">
                    <div>
                      <div className="text-xs sm:text-sm font-black text-white leading-tight">
                        {formatPrice(part.priceUsd)}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-bold uppercase">
                        + ITBIS FISCAL
                      </div>
                    </div>

                    <div className="flex items-center gap-1 font-display">
                      {/* WhatsApp Quick Order */}
                      <button
                        type="button"
                        onClick={(e) => handleWhatsAppQuickOrder(part, e)}
                        className="p-1.5 rounded-[3px] bg-zinc-950 hover:bg-zinc-800 text-emerald-400 border border-zinc-800 transition-colors cursor-pointer"
                        title="Pedir por WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>

                      {/* Add to Cart Button */}
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(part, e)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[3px] text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-500 text-white'
                            : 'bg-amber-500 hover:bg-amber-400 text-black shadow-md'
                        }`}
                        title="Añadir al Carrito"
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span className="text-[10px]">LISTO</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            <span className="text-[10px]">AÑADIR</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick View Modal for Deep Technical Specs without leaving Home */}
      {quickViewPart && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in font-display">
          <div className="bg-zinc-950 rounded-[5px] border border-zinc-800 max-w-md w-full p-5 shadow-2xl space-y-3 relative">
            <button
              onClick={() => setQuickViewPart(null)}
              className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 font-mono">
              <span className="px-2 py-0.5 rounded-[2px] bg-zinc-900 text-amber-400 border border-zinc-800 text-[10px] font-black uppercase">
                {quickViewPart.category}
              </span>
              <span className="text-xs font-bold text-zinc-400">
                OEM #{quickViewPart.partNumber}
              </span>
            </div>

            <div className="h-40 w-full rounded-[3px] overflow-hidden bg-zinc-900 border border-zinc-800">
              <img
                src={quickViewPart.image}
                alt={quickViewPart.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h3 className="text-sm font-black text-white uppercase">
                {quickViewPart.name}
              </h3>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed font-sans">
                {quickViewPart.description}
              </p>
            </div>

            <div className="p-3 rounded-[3px] bg-zinc-900 border border-zinc-800 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-400 font-bold uppercase">MARCA FABRICANTE:</span>
                <span className="font-bold text-white uppercase">{quickViewPart.brand}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 font-bold uppercase">MODELOS COMPATIBLES:</span>
                <span className="font-bold text-amber-400 uppercase">
                  {quickViewPart.compatibleModels.join(', ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 font-bold uppercase">TIEMPO DE DESPACHO:</span>
                <span className="font-bold text-emerald-400 uppercase">
                  {DISPATCH_LOCATIONS[selectedCityIdx].time} A {DISPATCH_LOCATIONS[selectedCityIdx].city}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800 font-mono">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">PRECIO DE LISTA</span>
                <span className="text-base font-black text-amber-400">
                  {formatPrice(quickViewPart.priceUsd)}
                </span>
              </div>

              <div className="flex items-center gap-2 font-display">
                <button
                  type="button"
                  onClick={(e) => {
                    handleWhatsAppQuickOrder(quickViewPart, e);
                    setQuickViewPart(null);
                  }}
                  className="px-3 py-2 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-zinc-800 font-black uppercase tracking-wider text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WHATSAPP</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    handleAddToCart(quickViewPart, e);
                    setQuickViewPart(null);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider rounded-[3px] text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>AÑADIR</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
});

HighDemandPartsSection.displayName = 'HighDemandPartsSection';
