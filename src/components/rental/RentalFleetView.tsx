import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Truck, 
  Calendar, 
  UserCheck, 
  ShieldCheck, 
  MapPin, 
  CheckCircle, 
  FileText, 
  Clock, 
  Fuel, 
  Weight, 
  Layers, 
  ArrowRight,
  Phone,
  Info,
  LayoutGrid,
  List,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Radio,
  Building2,
  Shield
} from 'lucide-react';
import { RENTAL_FLEET_DATA, PROVINCIAL_FREIGHT_RATES } from '../../data/rentalData';
import { RentalEquipment } from '../../types';
import { useCart } from '../../context/CartContext';
import { UniversalBreadcrumbs } from '../common/navigation/UniversalBreadcrumbs';

interface RentalFleetViewProps {
  onNavigate: (route: string) => void;
}

const RENTAL_BRAND_LOGOS = [
  { name: 'JCB', tag: 'Retroexcavadoras & Loadall', color: 'text-amber-500' },
  { name: 'LiuGong', tag: 'Excavadoras 22T–36T', color: 'text-amber-400' },
  { name: 'Ammann', tag: 'Compactación Suiza', color: 'text-zinc-300' },
  { name: 'Dynapac', tag: 'Rodillos de Suelo', color: 'text-zinc-400' }
];

export const RentalFleetView: React.FC<RentalFleetViewProps> = ({ onNavigate }) => {
  const { currency, formatPrice, showToast } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(4);

  const [activeMachine, setActiveMachine] = useState<RentalEquipment>(RENTAL_FLEET_DATA[0]);
  const [rentalDays, setRentalDays] = useState<number>(7);
  const [withOperator, setWithOperator] = useState<boolean>(true);
  const [selectedProvince, setSelectedProvince] = useState<string>('Santo Domingo / D.N. (Local)');
  const [reservationModalOpen, setReservationModalOpen] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerCompany, setCustomerCompany] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

  const categories = ['all', 'Retroexcavadoras', 'Excavadoras', 'Compactación', 'Minicargadores', 'Manipuladores'];

  const filteredEquipment = useMemo(() => {
    return RENTAL_FLEET_DATA.filter((m) => {
      const matchCat = selectedCategory === 'all' || m.category === selectedCategory;
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        m.name.toLowerCase().includes(q) ||
        m.brand.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchTerm]);

  // Pagination calculation
  const totalItems = filteredEquipment.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const validPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (validPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedEquipment = filteredEquipment.slice(startIndex, endIndex);

  // Calculation logic
  const calculateRate = (equipment: RentalEquipment, days: number): number => {
    if (days >= 30) {
      const months = Math.floor(days / 30);
      const remDays = days % 30;
      return (months * equipment.monthRateUsd) + (remDays * (equipment.monthRateUsd / 30));
    } else if (days >= 7) {
      const weeks = Math.floor(days / 7);
      const remDays = days % 7;
      return (weeks * equipment.weekRateUsd) + (remDays * (equipment.weekRateUsd / 7));
    } else {
      return days * equipment.dayRateUsd;
    }
  };

  const machineCostUsd = calculateRate(activeMachine, rentalDays);
  const operatorCostUsd = withOperator ? (rentalDays * activeMachine.operatorRateDayUsd) : 0;
  const freightUsd = PROVINCIAL_FREIGHT_RATES[selectedProvince] || 350;
  const subtotalBeforeTax = machineCostUsd + operatorCostUsd + freightUsd;
  const itbisUsd = subtotalBeforeTax * 0.18;
  const totalUsd = subtotalBeforeTax + itbisUsd;

  const handleSelectForQuote = (machine: RentalEquipment) => {
    setActiveMachine(machine);
    const calcElement = document.getElementById('rental-calculator-section');
    if (calcElement) {
      calcElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmitReservation = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      setReservationModalOpen(false);
      setBookingSuccess(false);
    }, 2800);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 transition-colors pb-16">
      {/* Top Hero Banner - Compact Commercial Standard */}
      <div className="relative bg-zinc-950 text-white border-b border-zinc-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 space-y-4">
          <UniversalBreadcrumbs currentRoute="#/rental" onNavigate={onNavigate} />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[3px] bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-mono font-bold uppercase tracking-wider">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>DIVISIÓN DE RENTA & FLOTA PESADA TMD</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider font-display text-white">
                RENTA DE MAQUINARIA PESADA EN <span className="text-amber-400">REPÚBLICA DOMINICANA</span>
              </h1>

              <p className="text-xs text-zinc-400 font-mono uppercase leading-relaxed max-w-2xl">
                Flota moderna con telemetría satelital LiveLink™ activa. Alquiler en seco o con operadores certificados TMD con traslado en cama baja directa a obra nacional.
              </p>

              {/* Verified Trust Badges */}
              <div className="flex flex-wrap gap-2 pt-1 text-xs font-mono font-bold uppercase text-zinc-300">
                <span className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-[3px] border border-zinc-800 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>SEGURO TODO RIESGO</span>
                </span>
                <span className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-[3px] border border-zinc-800 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>AUXILIO SOS &lt; 3H</span>
                </span>
                <span className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-[3px] border border-zinc-800 text-[11px]">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>DGII FISCAL B01</span>
                </span>
                <span className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-[3px] border border-zinc-800 text-[11px]">
                  <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>LIVELINK™ GPS</span>
                </span>
              </div>
            </div>

            {/* Quick Brand Matrix Card */}
            <div className="lg:col-span-4 bg-zinc-900 rounded-[5px] p-4 border border-zinc-800 shadow-xl space-y-2.5 font-mono">
              <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-display">
                  <Sparkles className="w-3.5 h-3.5" />
                  MARCAS EN RENTA
                </span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase">100% STOCK RD</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {RENTAL_BRAND_LOGOS.map((b) => (
                  <div key={b.name} className="p-2 rounded-[3px] bg-zinc-950 border border-zinc-800">
                    <span className={`text-xs font-black ${b.color} block uppercase`}>{b.name}</span>
                    <span className="text-[10px] text-zinc-400 block truncate uppercase">{b.tag}</span>
                  </div>
                ))}
              </div>

              <div className="pt-1.5 text-[11px] text-zinc-400 flex items-center justify-between border-t border-zinc-800 uppercase">
                <span>ENTREGA EN LOWBOY:</span>
                <strong className="text-white">32 PROVINCIAS</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6">
        {/* Category Filters & Quick Search Bar */}
        <div className="bg-zinc-950 rounded-[5px] p-3.5 shadow-sm border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 font-mono">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-[3px] text-xs font-bold uppercase whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-black font-black'
                    : 'text-zinc-400 hover:bg-zinc-900 border border-transparent hover:border-zinc-800'
                }`}
              >
                {cat === 'all' ? 'TODA LA FLOTA' : cat.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="BUSCAR EXCAVADORA, JCB..."
              className="w-full pl-9 pr-8 py-1.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 uppercase focus:outline-none focus:border-amber-500 font-mono"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Main 2-Column Grid: Fleet Cards & Live Rental Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Available Fleet (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-[5px] border border-zinc-800 font-mono">
              <div className="text-xs text-zinc-400 uppercase">
                MOSTRANDO <strong className="text-white">{totalItems > 0 ? startIndex + 1 : 0}–{endIndex}</strong> DE <strong className="text-white">{totalItems}</strong> UNIDADES
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-zinc-900 p-0.5 rounded-[3px] border border-zinc-800">
                  <button
                    onClick={() => setViewMode('card')}
                    className={`p-1.5 rounded-[2px] transition-colors cursor-pointer ${viewMode === 'card' ? 'bg-amber-500 text-black' : 'text-zinc-400'}`}
                    title="Vista de Tarjetas"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-[2px] transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-amber-500 text-black' : 'text-zinc-400'}`}
                    title="Vista de Tabla"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {viewMode === 'table' ? (
              <div className="bg-zinc-950 rounded-[5px] border border-zinc-800 overflow-hidden shadow-sm font-mono">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px] font-bold">
                      <tr>
                        <th className="py-2.5 px-3">EQUIPO</th>
                        <th className="py-2.5 px-3">CATEGORÍA</th>
                        <th className="py-2.5 px-3">POTENCIA</th>
                        <th className="py-2.5 px-3 text-right">TARIFA / DÍA</th>
                        <th className="py-2.5 px-3 text-center">ACCIÓN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {paginatedEquipment.map((eq) => {
                        const isSelected = activeMachine.id === eq.id;
                        return (
                          <tr
                            key={eq.id}
                            onClick={() => handleSelectForQuote(eq)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-zinc-900 border-l-2 border-amber-500'
                                : 'hover:bg-zinc-900/50'
                            }`}
                          >
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-white uppercase">
                                {eq.name}
                              </div>
                              <span className="text-[10px] text-amber-400 font-bold uppercase">
                                {eq.brand}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-zinc-400 uppercase">
                              {eq.category}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-zinc-300">
                              {eq.specs.powerHp} HP
                            </td>
                            <td className="py-2.5 px-3 text-right font-black text-amber-400">
                              {formatPrice(eq.dayRateUsd)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                className={`px-2.5 py-1 rounded-[3px] text-xs font-bold uppercase transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-amber-500 text-black'
                                    : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                                }`}
                              >
                                {isSelected ? 'ACTIVO' : 'COTIZAR'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedEquipment.map(eq => {
                  const isSelected = activeMachine.id === eq.id;

                  return (
                    <div
                      key={eq.id}
                      onClick={() => handleSelectForQuote(eq)}
                      className={`p-3.5 rounded-[5px] border transition-all cursor-pointer bg-zinc-950 font-mono ${
                        isSelected
                          ? 'border-amber-500 ring-1 ring-amber-500/30 bg-zinc-900/80'
                          : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-36 h-28 rounded-[3px] overflow-hidden bg-zinc-900 shrink-0 relative border border-zinc-800">
                          <img 
                            src={eq.image} 
                            alt={eq.name} 
                            className="w-full h-full object-cover"
                            loading="lazy" 
                          />
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-[2px] bg-black/90 text-amber-400 text-[9px] font-black uppercase">
                            {eq.brand}
                          </span>
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                                  {eq.category}
                                </span>
                                <h3 className="text-sm font-bold text-white uppercase leading-tight font-display">
                                  {eq.name}
                                </h3>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-sm font-black text-amber-400">
                                  {formatPrice(eq.dayRateUsd)}
                                </div>
                                <span className="text-[10px] text-zinc-500 block uppercase">POR DÍA</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] text-zinc-400 uppercase">
                              <span className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-[2px] font-bold">
                                {eq.specs.powerHp} HP
                              </span>
                              <span className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-[2px] font-bold">
                                {eq.specs.weightTons} TONS
                              </span>
                              <span className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-[2px] font-bold">
                                SEDE: {eq.baseLocation.split(' ')[0]}
                              </span>
                            </div>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                            <span className="text-zinc-400 text-[11px] uppercase">
                              SEMANAL: <strong className="text-white font-bold">{formatPrice(eq.weekRateUsd)}</strong>
                            </span>
                            <button
                              type="button"
                              className={`px-3 py-1 rounded-[3px] text-xs font-bold uppercase transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-500 text-black font-black'
                                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                              }`}
                            >
                              {isSelected ? 'SELECCIONADO' : 'CALCULAR'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-3 rounded-[5px] bg-zinc-950 border border-zinc-800 text-xs font-mono">
                <span className="text-zinc-400 uppercase">PÁGINA {validPage} DE {totalPages}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(validPage - 1)}
                    disabled={validPage === 1}
                    className="p-1.5 rounded-[3px] border border-zinc-800 bg-zinc-900 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-6 h-6 rounded-[2px] text-xs font-bold uppercase cursor-pointer transition-all ${
                        validPage === p ? 'bg-amber-500 text-black font-black' : 'text-zinc-400 hover:bg-zinc-900 border border-zinc-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(validPage + 1)}
                    disabled={validPage === totalPages}
                    className="p-1.5 rounded-[3px] border border-zinc-800 bg-zinc-900 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Live Interactive Rental & Logistics Calculator (5 cols) */}
          <div id="rental-calculator-section" className="lg:col-span-5 sticky top-20 space-y-4">
            <div className="bg-zinc-950 rounded-[5px] p-5 sm:p-6 border border-zinc-800 shadow-xl font-mono text-white">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block font-display">
                    SIMULADOR FISCAL DGII NCF
                  </span>
                  <h3 className="text-base font-black text-white uppercase font-display">
                    COTIZADOR DE RENTA & FLETE
                  </h3>
                </div>
                <div className="w-8 h-8 rounded-[3px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>

              {/* Active Selected Machine Header */}
              <div className="mt-4 p-3 rounded-[4px] bg-zinc-900 border border-zinc-800 flex items-center gap-3">
                <img 
                  src={activeMachine.image} 
                  alt={activeMachine.name}
                  className="w-12 h-10 rounded-[2px] object-cover bg-zinc-950 shrink-0" 
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-bold text-amber-400 uppercase">
                    {activeMachine.brand} • {activeMachine.category}
                  </span>
                  <h4 className="text-xs font-bold text-white uppercase truncate">
                    {activeMachine.name}
                  </h4>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">
                    TARIFA: <strong className="text-amber-400">{formatPrice(activeMachine.dayRateUsd)}/DÍA</strong>
                  </span>
                </div>
              </div>

              {/* Form Controls */}
              <div className="mt-4 space-y-3.5 text-xs">
                {/* Days Selector */}
                <div>
                  <div className="flex items-center justify-between font-bold mb-1 uppercase">
                    <span className="text-zinc-400">DURACIÓN DEL CONTRATO</span>
                    <span className="text-amber-400 font-black text-sm">{rentalDays} DÍAS</span>
                  </div>
                  <input
                    type="range"
                    min={activeMachine.minRentalDays}
                    max={60}
                    step={1}
                    value={rentalDays}
                    onChange={(e) => setRentalDays(parseInt(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-sm"
                  />
                  <div className="flex justify-between text-[9px] text-zinc-500 mt-1 uppercase font-bold">
                    <span>MÍN ({activeMachine.minRentalDays}D)</span>
                    <span>15D</span>
                    <span>30D (MES)</span>
                    <span>60D</span>
                  </div>
                </div>

                {/* Operator Toggle */}
                <div className="p-3 rounded-[4px] bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="font-bold text-white block uppercase text-[11px]">
                        OPERADOR CERTIFICADO TMD
                      </span>
                      <span className="text-[10px] text-zinc-400 uppercase">
                        +US$ {activeMachine.operatorRateDayUsd}/DÍA (CON SEGURO LABORAL)
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={withOperator}
                      onChange={(e) => setWithOperator(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-zinc-800 peer-focus:outline-none rounded-[2px] peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-[1px] after:h-3 after:w-3.5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {/* Lowboy Destination Province */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase">
                    DESTINO EN RD (TRANSPORTE CAMA BAJA LOWBOY)
                  </label>
                  <select
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-[3px] bg-zinc-900 border border-zinc-800 text-white uppercase font-mono focus:outline-none focus:border-amber-500"
                  >
                    {Object.keys(PROVINCIAL_FREIGHT_RATES).map(prov => (
                      <option key={prov} value={prov}>
                        {prov.toUpperCase()} - FLETE: US$ {PROVINCIAL_FREIGHT_RATES[prov]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Financial Breakdown */}
                <div className="pt-3 border-t border-zinc-800 space-y-1.5 text-xs uppercase">
                  <div className="flex justify-between text-zinc-400">
                    <span>RENTA DE MAQUINARIA ({rentalDays} DÍAS)</span>
                    <span className="font-bold text-white">{formatPrice(machineCostUsd)}</span>
                  </div>

                  {withOperator && (
                    <div className="flex justify-between text-zinc-400">
                      <span>OPERADOR CERTIFICADO ({rentalDays} DÍAS)</span>
                      <span className="font-bold text-white">{formatPrice(operatorCostUsd)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-zinc-400">
                    <span>FLETE LOWBOY A DESTINO</span>
                    <span className="font-bold text-white">{formatPrice(freightUsd)}</span>
                  </div>

                  <div className="flex justify-between text-zinc-400">
                    <span>ITBIS FISCAL (18%)</span>
                    <span className="font-bold text-white">{formatPrice(itbisUsd)}</span>
                  </div>

                  <div className="pt-2.5 border-t border-zinc-800 flex justify-between items-baseline">
                    <div>
                      <span className="text-xs font-black uppercase text-white block">
                        TOTAL PROFORMA NCF B01
                      </span>
                      <span className="text-[9px] text-zinc-400 uppercase">LISTO PARA FACTURA FISCAL</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-amber-400 font-mono">
                        {formatPrice(totalUsd)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions: Primary & Secondary standard button styling */}
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => setReservationModalOpen(true)}
                    className="w-full py-2.5 px-4 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>SOLICITAR PROFORMA OFICIAL NCF</span>
                  </button>

                  <a
                    href={`https://wa.me/18095601234?text=Hola%20TMD,%20deseo%20rentar%20la%20unidad%20${encodeURIComponent(activeMachine.name)}%20por%20${rentalDays}%20d%C3%ADas%20para%20${encodeURIComponent(selectedProvince)}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-800"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WHATSAPP DESPACHO RENTA 24/7</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reservation / Quote Request Modal */}
      {reservationModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-zinc-950 rounded-[5px] p-6 max-w-lg w-full border border-zinc-800 shadow-2xl relative font-mono text-white">
            {bookingSuccess ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-[3px] bg-zinc-900 text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/40">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black uppercase text-white mb-1 font-display">
                  ¡SOLICITUD REGISTRADA CON ÉXITO!
                </h3>
                <p className="text-xs text-zinc-400 uppercase max-w-sm mx-auto mb-3">
                  EL EQUIPO DE DESPACHO HA RESERVADO LA UNIDAD <strong>{activeMachine.name}</strong> PARA ENTREGA EN <strong>{selectedProvince}</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReservation} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <h3 className="text-sm font-black uppercase text-white font-display">
                    CONFIRMAR DATOS PARA CONTRATO DE RENTA
                  </h3>
                  <button
                    type="button"
                    onClick={() => setReservationModalOpen(false)}
                    className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1 uppercase">
                    NOMBRE O RAZÓN SOCIAL (EMPRESA)
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="CONSTRUCTORA DEL CARIBE SRL"
                    className="w-full px-3 py-2 text-xs rounded-[3px] bg-zinc-900 border border-zinc-800 text-white uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1 uppercase">
                    TELÉFONO / WHATSAPP DE CONTACTO
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+1 (809) 555-0199"
                    className="w-full px-3 py-2 text-xs rounded-[3px] bg-zinc-900 border border-zinc-800 text-white uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setReservationModalOpen(false)}
                    className="px-4 py-2 rounded-[3px] text-xs font-bold uppercase text-zinc-400 hover:bg-zinc-900 border border-zinc-800 cursor-pointer"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase cursor-pointer shadow-md"
                  >
                    EMITIR SOLICITUD NCF
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
