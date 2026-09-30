import React, { useState, useMemo, useCallback } from 'react';
import { 
  Search, 
  HardHat, 
  Truck, 
  Wrench, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  MessageCircle, 
  ChevronRight, 
  Layers, 
  Scale, 
  Calendar,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Cpu,
  Building2,
  Filter
} from 'lucide-react';
import { getUnifiedStoreMachinery } from '../../services/cdnCatalogLoader';
import { useCart } from '../../context/CartContext';
import { Machine } from '../../types';
import { PriceEstimateModal } from '../PriceEstimateModal';
import { TestDriveBookingModal } from '../media/TestDriveBookingModal';
import { OFFICIAL_BRANDS } from '../../data/brandsData';
import { BrandLogo } from '../common/BrandLogos';
import { triggerHaptic } from '../../utils/haptics';

interface HomeViewProps {
  onNavigate: (route: string) => void;
  onSelectMachine: (machineId: string) => void;
}

export const HomeViewVia1: React.FC<HomeViewProps> = ({ onNavigate, onSelectMachine }) => {
  const { addMachineToQuote, currency, exchangeRate } = useCart();
  
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

  // Cockpit filters
  const [selectedBrand, setSelectedBrand] = useState<string>('Todas');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Modals
  const [isTestDriveModalOpen, setIsTestDriveModalOpen] = useState<boolean>(false);
  const [isTradeInModalOpen, setIsTradeInModalOpen] = useState<boolean>(false);
  const [selectedMachineForModal, setSelectedMachineForModal] = useState<Machine | null>(null);

  const categories = ['Todos', 'Retroexcavadoras', 'Excavadoras', 'Tractores', 'Compactación', 'Cargadores'];
  const brands = ['Todas', 'JCB', 'LiuGong', 'Ammann', 'LS Tractor', 'Kubota', 'Yanmar'];

  const filteredMachines = useMemo(() => {
    return allStoreMachines.filter((m) => {
      const matchCat = selectedCategory === 'Todos' || m.category === selectedCategory;
      const matchBrand = selectedBrand === 'Todas' || m.brand.toLowerCase() === selectedBrand.toLowerCase();
      const matchQuery = !searchQuery.trim() || 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.modelCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStock = !inStockOnly || m.inStock;
      return matchCat && matchBrand && matchQuery && matchStock;
    });
  }, [allStoreMachines, selectedCategory, selectedBrand, searchQuery, inStockOnly]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* ========================================================================= */}
      {/* VÍA 1: TRANSACTIONAL COCKPIT HEADER & RAPID INVENTORY SEARCH               */}
      {/* ========================================================================= */}
      <section className="bg-zinc-900 border-b border-zinc-800 text-white pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Top Live Ticker */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-zinc-400 border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-zinc-200 font-bold uppercase">TMD COCKPIT B2B • KM 22 EN VIVO</span>
              <span className="text-zinc-600">|</span>
              <span className="text-amber-400 font-bold">44+ EQUIPOS DISPONIBLES</span>
            </div>
            <div className="flex items-center gap-3">
              <span>TASA OFICIAL BCRD: <strong className="text-white">RD$ {exchangeRate.toFixed(2)}</strong></span>
              <span className="text-zinc-600">|</span>
              <a href="tel:+18095601234" className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> (809) 560-1234
              </a>
            </div>
          </div>

          {/* Cockpit Headline & Rapid Value Prop */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 font-mono text-xs font-bold uppercase mb-2">
                <Filter className="w-3.5 h-3.5" />
                SISTEMA TRANSACCIONAL DE INVENTARIO INMEDIATO
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-condensed tracking-tight uppercase">
                CATÁLOGO DE MAQUINARIA & DESPACHO
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans max-w-2xl mt-1">
                Selecciona, cotiza con crédito fiscal NCF y agenda entrega o prueba directa en Sede Km 22.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setIsTestDriveModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono font-bold text-white border border-zinc-700 flex items-center gap-1.5 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                Agendar Visita Km 22
              </button>
              <button
                onClick={() => setIsTradeInModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-mono font-bold text-zinc-950 flex items-center gap-1.5 transition-colors shadow-md shadow-amber-500/20"
              >
                <Scale className="w-3.5 h-3.5" />
                Avaluar Trade-In
              </button>
            </div>
          </div>

          {/* Interactive Fast-Search Cockpit Box */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-6 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input 
                  type="text"
                  placeholder="Buscar excavadora, rodillo, 3CX, 922E..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-sans rounded-lg bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="md:col-span-3">
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full py-2.5 px-3 text-xs font-mono rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-amber-500"
                >
                  {brands.map(b => (
                    <option key={b} value={b}>{b === 'Todas' ? 'Todas las Marcas' : b}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full py-2.5 px-3 text-xs font-mono rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-amber-500"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c === 'Todos' ? 'Todas las Categorías' : c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Filter Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-zinc-500 font-mono text-[11px] mr-1">Filtros rápidos:</span>
                {['JCB', 'LiuGong', 'Ammann', 'LS Tractor', 'Kubota'].map(b => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(b === selectedBrand ? 'Todas' : b)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all ${selectedBrand === b ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-mono text-zinc-300 select-none">
                <input 
                  type="checkbox" 
                  checked={inStockOnly} 
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-zinc-700 text-amber-500 focus:ring-0"
                />
                Solo Entrega Inmediata (Stock Km 22)
              </label>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* VÍA 1 INVENTORY MATRIX: HIGH-DENSITY PRODUCT LIST                          */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
            Mostrando <strong>{filteredMachines.length}</strong> de <strong>{allStoreMachines.length}</strong> máquinas industriales
          </span>
          {(selectedBrand !== 'Todas' || selectedCategory !== 'Todos' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedBrand('Todas');
                setSelectedCategory('Todos');
                setSearchQuery('');
                setInStockOnly(false);
              }}
              className="text-xs font-mono text-amber-500 hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Dense Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMachines.map((m) => (
            <div 
              key={m.id}
              className="rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="font-bold text-amber-500 uppercase">{m.brand}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    ENTREGA INMEDIATA
                  </span>
                </div>

                <div 
                  onClick={() => onSelectMachine(m.id)}
                  className="h-36 flex items-center justify-center p-2 cursor-pointer group"
                >
                  <img 
                    src={getMachineImg(m)} 
                    alt={m.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                </div>

                <h3 
                  onClick={() => onSelectMachine(m.id)}
                  className="text-base font-bold font-condensed tracking-tight text-slate-900 dark:text-white cursor-pointer hover:text-amber-500 line-clamp-1"
                >
                  {m.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 mt-1">
                  {m.description}
                </p>

                {/* Key Spec Badges */}
                <div className="grid grid-cols-3 gap-2 py-2 mt-2 border-y border-slate-100 dark:border-zinc-800/80 text-[11px] font-mono text-slate-600 dark:text-zinc-400">
                  <div>
                    <span className="text-[9px] text-slate-400 dark:text-zinc-500 block">GARANTÍA</span>
                    <strong className="text-slate-800 dark:text-zinc-200">2 Años</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 dark:text-zinc-500 block">TELEMETRÍA</span>
                    <strong className="text-slate-800 dark:text-zinc-200">LiveLink™</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 dark:text-zinc-500 block">FACTURACIÓN</span>
                    <strong className="text-slate-800 dark:text-zinc-200">NCF Válido</strong>
                  </div>
                </div>
              </div>

              {/* Price & Action Row */}
              <div className="pt-3 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 block uppercase">PRECIO NCF</span>
                  <span className="text-base font-black font-condensed text-amber-500">
                    {formatMachineryPrice(getMachineCost(m))}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onSelectMachine(m.id)}
                    className="py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-mono font-bold text-slate-800 dark:text-white transition-colors"
                  >
                    Ficha
                  </button>
                  <button
                    onClick={() => {
                      addMachineToQuote(m);
                      triggerHaptic();
                    }}
                    className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-mono font-bold text-zinc-950 transition-colors shadow-sm"
                  >
                    + Cotizar
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

      </section>

      {/* ========================================================================= */}
      {/* VÍA 1 INLINE TRADE-IN & PHYSICAL BACKUP STRIP                              */}
      {/* ========================================================================= */}
      <section className="bg-zinc-900 border-t border-zinc-800 text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          <div className="space-y-1">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase">RENOVACIÓN DE FLOTAS B2B</span>
            <h3 className="text-xl font-bold font-condensed">¿Tienes maquinaria usada?</h3>
            <p className="text-xs text-zinc-400">Recibimos tu equipo en Trade-In o pagamos en efectivo con crédito fiscal.</p>
            <button
              onClick={() => setIsTradeInModalOpen(true)}
              className="mt-2 text-xs font-mono text-amber-400 hover:underline flex items-center gap-1 font-bold"
            >
              Calcular avalúo express <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-6">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase">RESPALDO DE INGENIERÍA</span>
            <h3 className="text-xl font-bold font-condensed">Sede Central Km 22</h3>
            <p className="text-xs text-zinc-400">18 Bahías hidráulicas 350 Bar y 4 unidades Taller Móvil SOS 24/7 en campo.</p>
            <a href="tel:+18095601234" className="mt-2 text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1 font-bold">
              Llamar a despacho central <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-1 border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-6">
            <span className="text-xs font-mono text-blue-400 font-bold uppercase">GERENCIA COMERCIAL</span>
            <h3 className="text-xl font-bold font-condensed">Don Eduardo López</h3>
            <p className="text-xs text-zinc-400">Atención directa para licitaciones gubernamentales y grandes flotas.</p>
            <a 
              href="https://wa.me/18095601234"
              target="_blank"
              rel="noreferrer"
              className="mt-2 text-xs font-mono text-blue-400 hover:underline flex items-center gap-1 font-bold"
            >
              WhatsApp directo con Don Eduardo <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </section>

      {/* Modals */}
      {isTestDriveModalOpen && (
        <TestDriveBookingModal 
          isOpen={isTestDriveModalOpen}
          onClose={() => setIsTestDriveModalOpen(false)}
          machineName="JCB 3CX Eco"
        />
      )}

      {isTradeInModalOpen && (
        <PriceEstimateModal
          isOpen={isTradeInModalOpen}
          onClose={() => setIsTradeInModalOpen(false)}
          machine={allStoreMachines[0]}
          onProceedToQuote={() => {
            setIsTradeInModalOpen(false);
            onNavigate('quote');
          }}
        />
      )}

    </div>
  );
};
