import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  RotateCcw, 
  Wrench, 
  ShieldCheck, 
  CheckCircle2, 
  Search, 
  Sparkles, 
  Activity, 
  Layers, 
  Download, 
  AlertCircle,
  Truck,
  ArrowRight,
  Phone,
  DollarSign
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import { REMAN_COMPONENTS } from '../../data/remanData';
import { RemanComponent } from '../../types';
import { useCart } from '../../context/CartContext';

interface RemanExchangeCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCategory?: string;
  onNavigate?: (route: string) => void;
}

export const RemanExchangeCatalogModal: React.FC<RemanExchangeCatalogModalProps> = ({
  isOpen,
  onClose,
  preselectedCategory,
  onNavigate
}) => {
  const { formatPrice, addToCart, showToast } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>(preselectedCategory || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeComponent, setActiveComponent] = useState<RemanComponent | null>(null);

  if (!isOpen) return null;

  const categories = [
    { key: 'all', label: 'Todos' },
    { key: 'Motores Diésel', label: 'Motores Diésel' },
    { key: 'Bombas Hidráulicas', label: 'Bombas Hidráulicas' },
    { key: 'Motores de Giro', label: 'Motores de Giro' },
    { key: 'Mandos Finales', label: 'Mandos Finales' },
    { key: 'Transmisiones', label: 'Transmisiones' },
    { key: 'Turbocargadores', label: 'Turbos' }
  ];

  const filteredComponents = REMAN_COMPONENTS.filter(comp => {
    const matchesCategory = selectedCategory === 'all' || comp.category === selectedCategory;
    const matchesSearch = 
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.compatibleMachines.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleOrderReman = (comp: RemanComponent) => {
    triggerHaptic('success');
    addToCart({
      id: comp.id,
      name: `${comp.name} (TMD Reman + Casco Exchange)`,
      partNumber: comp.sku,
      brand: comp.brand,
      priceUsd: comp.netPriceUsd,
      category: comp.category,
      image: comp.image,
      stockQty: comp.stockQty,
      isOem: true,
      deliveryTimeHours: comp.leadTimeDays * 24,
      compatibleModels: comp.compatibleMachines,
      description: `${comp.description} • Incluye crédito por retorno de casco (-${formatPrice(comp.coreCreditUsd)}).`
    });
    showToast(`Reman ${comp.sku} añadido al carrito oficial (-${formatPrice(comp.coreCreditUsd)} por retorno de casco).`);
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl p-5 sm:p-6 text-white font-mono space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-[2px] bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase">
                PROGRAMA TMD REMAN™ • TOLERANCIA CERO HORAS
              </span>
              <span className="text-[10px] text-zinc-500">SEDE CENTRAL KM 22 DUARTE</span>
            </div>
            <h3 className="text-base sm:text-lg font-black uppercase tracking-wide text-white font-display">
              CATÁLOGO DE COMPONENTES REMANUFACTURADOS CON CORE EXCHANGE
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Ahorre hasta 45% vs componente nuevo entregando su casco usado. 12 meses de garantía oficial y certificación en banco dinamométrico y de flujo hidráulico a 350 bar.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Exchange Protocol Explainer Banner */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4" />
              <span>¿CÓMO OPERA EL SISTEMA CORE EXCHANGE (CRÉDITO POR CASCO USADO)?</span>
            </span>
            <span className="text-[10px] text-zinc-400 uppercase">MÍNIMA MÁQUINA PARADA</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800/80">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] uppercase mb-1">
                <span>1. DESPACHO INMEDIATO</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                Reciba la unidad Reman probada en banco desde Km 22 para instalarla de inmediato en su máquina sin esperar semanas de taller.
              </p>
            </div>

            <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800/80">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] uppercase mb-1">
                <span>2. RECOGIDA DE CASCO USADO</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                TMD recoge su componente averiado en obra dentro de los 15 días posteriores al despacho mediante nuestra red logística nacional.
              </p>
            </div>

            <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800/80">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] uppercase mb-1">
                <span>3. ACREDITACIÓN DEL CRÉDITO</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                Tras inspección visual de fisuras externas en carcasa, el crédito pactado se aplica de inmediato a su factura oficial.
              </p>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setSelectedCategory(cat.key);
                }}
                className={`px-3 py-1.5 rounded-[2px] uppercase text-[10px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.key
                    ? 'bg-amber-400 text-black font-black'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="BUSCAR SKU, MARCA O MODELO..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-[2px] pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 uppercase focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Components Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {filteredComponents.map((comp) => {
            const estimatedNewPrice = Math.round(comp.priceRemanUsd * 1.55);
            const savingsVsNew = estimatedNewPrice - comp.netPriceUsd;
            const savingsPercent = Math.round((savingsVsNew / estimatedNewPrice) * 100);

            return (
              <div
                key={comp.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-[3px] p-4 flex flex-col justify-between space-y-3 transition-colors"
              >
                <div>
                  {/* Top Tags */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-[2px] bg-zinc-950 border border-zinc-800 text-amber-400 font-mono">
                      {comp.sku}
                    </span>
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-[2px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Garantía {comp.warrantyMonths} Meses
                    </span>
                  </div>

                  {/* Component Title */}
                  <h4 className="text-xs sm:text-sm font-black uppercase text-white font-display leading-snug">
                    {comp.name}
                  </h4>

                  {/* Compatibility */}
                  <div className="mt-1 text-[10px] text-zinc-400 font-sans">
                    <strong className="text-zinc-300 font-mono uppercase">Compatibilidad:</strong> {comp.compatibleMachines.join(' • ')}
                  </div>

                  {/* Dyno Bench Certification */}
                  <div className="mt-2 p-2 rounded-[2px] bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-amber-400" />
                      <span>BANCO DE PRUEBA: <strong className="text-white">{comp.dynoTestReportRef}</strong></span>
                    </span>
                    <span className="text-emerald-400 font-bold uppercase">CERTIFICADO 100%</span>
                  </div>

                  {/* Technical Description */}
                  <p className="mt-2 text-[11px] text-zinc-400 font-sans leading-relaxed">
                    {comp.description}
                  </p>
                </div>

                {/* Economics Box */}
                <div className="pt-3 border-t border-zinc-800 space-y-2">
                  <div className="bg-zinc-950 p-2.5 rounded-[2px] border border-zinc-800/80 space-y-1 text-[11px]">
                    <div className="flex justify-between text-zinc-500 line-through">
                      <span>PRECIO NUEVO ESTIMADO:</span>
                      <span>US$ {estimatedNewPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-zinc-300">
                      <span>PRECIO REMAN LISTA:</span>
                      <span className="text-white font-bold">US$ {comp.priceRemanUsd.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>(-) CRÉDITO POR TU CASCO USADO:</span>
                      <span>-US$ {comp.coreCreditUsd.toLocaleString()}</span>
                    </div>
                    <div className="pt-1.5 border-t border-zinc-800 flex justify-between items-baseline font-black">
                      <span className="text-amber-400 uppercase text-xs">NETO CON RETORNO DE CASCO:</span>
                      <div className="text-right">
                        <span className="text-sm sm:text-base text-amber-400 font-mono">
                          US$ {comp.netPriceUsd.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-emerald-400 block font-normal">
                          Ahorras US$ {savingsVsNew.toLocaleString()} ({savingsPercent}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOrderReman(comp)}
                      className="flex-1 py-2 px-3 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-xs transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>PEDIR CON CORE EXCHANGE</span>
                    </button>

                    <a
                      href={`https://wa.me/18095601234?text=Hola%20TMD%2C%20solicito%20inspecci%C3%B3n%20y%20reserva%20de%20la%20unidad%20Reman%20${encodeURIComponent(comp.sku)}%20con%20cr%C3%A9dito%20de%20casco.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-[2px] bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
                      title="Consultar disponibilidad con asesor de taller"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <span className="text-zinc-500 uppercase text-[10px]">
            {filteredComponents.length} COMPONENTES REMAN CON ENTREGA EN 24-48H DESDE KM 22 DUARTE
          </span>

          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold uppercase text-xs transition-colors cursor-pointer self-end"
          >
            CERRAR CATÁLOGO
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
