import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  RotateCcw, 
  ShieldCheck, 
  Wrench, 
  CheckCircle, 
  ArrowRight, 
  Download, 
  Coins, 
  Package, 
  Search,
  Sparkles,
  Zap,
  Phone
} from 'lucide-react';
import { REMAN_COMPONENTS } from '../../data/remanData';
import { RemanComponent } from '../../types';
import { useCart } from '../../context/CartContext';

interface RemanCenterViewProps {
  onNavigate?: (route: string) => void;
}

export const RemanCenterView: React.FC<RemanCenterViewProps> = ({ onNavigate }) => {
  const { formatPrice, addToCart } = useCart();
  const [components] = useState<RemanComponent[]>(REMAN_COMPONENTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hasCoreReturn, setHasCoreReturn] = useState<boolean>(true);
  const [selectedComponentForModal, setSelectedComponentForModal] = useState<RemanComponent | null>(null);
  const [quoteSuccess, setQuoteSuccess] = useState<boolean>(false);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const categories = ['all', 'Motores Diésel', 'Bombas Hidráulicas', 'Transmisiones', 'Turbocargadores'];

  const filteredComponents = components.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.compatibleMachines.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCat && matchesSearch;
  });

  const handleOpenQuote = (item: RemanComponent) => {
    setSelectedComponentForModal(item);
    setQuoteSuccess(false);
  };

  const handleAddRemanToCart = (item: RemanComponent) => {
    const finalPrice = hasCoreReturn ? item.netPriceUsd : item.priceRemanUsd;
    addToCart({
      id: item.id,
      partNumber: item.sku,
      name: `${item.name} (${hasCoreReturn ? 'Con Entrega de Casco/Core' : 'Sin Casco'})`,
      priceUsd: finalPrice,
      brand: item.brand,
      category: item.category,
      image: item.image,
      stockQty: item.stockQty,
      description: item.description,
      isOem: true,
      deliveryTimeHours: 24,
      compatibleModels: item.compatibleMachines
    });
    setAddedToast(`¡${item.name} agregado al carrito!`);
    setTimeout(() => setAddedToast(null), 3500);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 transition-colors pb-24 relative font-mono">
      {/* Toast Alert */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-500 text-black px-4 py-2.5 rounded-[3px] shadow-2xl font-black text-xs uppercase flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-black" />
          <span>{addedToast}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-zinc-950 text-white border-b border-zinc-800">
        <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8 sm:py-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-mono font-bold uppercase tracking-wider mb-2.5">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>PROGRAMA OFICIAL CORE EXCHANGE • TMD REMAN RD</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-wider font-display text-white mb-2">
              COMPONENTES <span className="text-amber-400">REMANUFACTURADOS</span> CON GARANTÍA
            </h1>
            <p className="text-xs text-zinc-400 font-mono uppercase leading-relaxed">
              Ahorre hasta un 45% respecto a un componente nuevo entregando su casco dañado. Motores JCB y Cummins, transmisiones Carraro y bombas Kawasaki probadas en dinamómetro con 12 meses de garantía oficial.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 mt-6">
        {/* Core Return Toggle Banner */}
        <div className="bg-zinc-950 rounded-[5px] p-4 border border-zinc-800 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[3px] bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase font-display">
                ¿TIENE UN CASCO O NÚCLEO USADO PARA ENTREGAR A CAMBIO?
              </h3>
              <p className="text-[11px] text-zinc-400 uppercase">
                APLICA INMEDIATAMENTE UN CRÉDITO DE RECOMPRA DEDUCIENDO EL VALOR DEL CORE EN SU COTIZACIÓN.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-[3px] border border-zinc-800 shrink-0">
            <button
              onClick={() => setHasCoreReturn(true)}
              className={`px-3 py-1.5 rounded-[3px] text-xs font-bold uppercase transition-all cursor-pointer ${
                hasCoreReturn 
                  ? 'bg-amber-500 text-black font-black' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              SÍ, ENTREGO CASCO (-CRÉDITO)
            </button>
            <button
              onClick={() => setHasCoreReturn(false)}
              className={`px-3 py-1.5 rounded-[3px] text-xs font-bold uppercase transition-all cursor-pointer ${
                !hasCoreReturn 
                  ? 'bg-amber-500 text-black font-black' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              SIN ENTREGA DE CASCO
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-zinc-950 rounded-[5px] p-3.5 border border-zinc-800 mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="BUSCAR COMPONENTE REMAN (448, 6BTA, BOMBA)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-[3px] bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 uppercase focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-[3px] text-xs font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-black font-black'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
                  }`}
                >
                  {cat === 'all' ? 'TODOS' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Components Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredComponents.map(item => {
            const displayPrice = hasCoreReturn ? item.netPriceUsd : item.priceRemanUsd;

            return (
              <div
                key={item.id}
                className="bg-zinc-950 rounded-[5px] overflow-hidden border border-zinc-800 shadow-md hover:border-zinc-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 bg-zinc-900 overflow-hidden border-b border-zinc-800">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-zinc-950/90 text-amber-400 text-[10px] font-bold uppercase border border-zinc-800">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{item.warrantyMonths} MESES GARANTÍA</span>
                    </div>

                    {item.dynoCertified && (
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-[3px] bg-emerald-500 text-black text-[10px] font-black uppercase">
                        DYNO OK
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] font-display">
                        {item.brand} • {item.category}
                      </span>
                      <span className="font-mono text-zinc-500 text-[11px]">
                        {item.sku}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-white uppercase font-display leading-snug mb-1.5">
                      {item.name}
                    </h3>

                    <p className="text-[11px] text-zinc-400 line-clamp-2 mb-3 uppercase leading-relaxed">
                      {item.description}
                    </p>

                    <div className="p-2.5 rounded-[3px] bg-zinc-900 border border-zinc-800 mb-3 space-y-1 text-xs uppercase">
                      <div className="flex justify-between text-zinc-500 text-[10px]">
                        <span>PRECIO BASE:</span>
                        <strong className="line-through">{formatPrice(item.priceRemanUsd)}</strong>
                      </div>
                      {hasCoreReturn && (
                        <div className="flex justify-between text-emerald-400 text-[10px] font-bold">
                          <span>CRÉDITO CASCO:</span>
                          <span>- {formatPrice(item.coreCreditUsd)}</span>
                        </div>
                      )}
                      <div className="pt-1 border-t border-zinc-800 flex justify-between items-baseline">
                        <span className="font-bold text-white text-[11px]">PRECIO NETO:</span>
                        <span className="text-base font-black text-amber-400">
                          {formatPrice(displayPrice)}
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] text-zinc-400 space-y-0.5 mb-1 uppercase">
                      <div>DYNO REF: <strong className="text-zinc-200 font-mono">{item.dynoTestReportRef}</strong></div>
                      <div>COMPATIBILIDAD: <strong className="text-zinc-200">{item.compatibleMachines.join(', ')}</strong></div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenQuote(item)}
                    className="py-1.5 px-2.5 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold uppercase transition-all cursor-pointer border border-zinc-800"
                  >
                    DICTAMEN DYNO
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddRemanToCart(item)}
                    className="py-1.5 px-2.5 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                  >
                    ORDENAR REMAN
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dyno Report Modal */}
      {selectedComponentForModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 rounded-[5px] p-6 max-w-lg w-full border border-zinc-800 shadow-2xl relative font-mono text-white">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3.5">
              <div>
                <span className="text-[9px] font-black uppercase text-amber-400 tracking-wider block">
                  TMD LABORATORIO DE DINAMOMETRÍA
                </span>
                <h3 className="text-sm font-black text-white uppercase font-display">
                  CERTIFICADO DE BANCO DE PRUEBAS
                </h3>
              </div>
              <button onClick={() => setSelectedComponentForModal(null)} className="text-zinc-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs uppercase">
              <div className="p-2.5 rounded-[3px] bg-zinc-900 border border-zinc-800">
                <div className="font-bold text-white font-display">{selectedComponentForModal.name}</div>
                <div className="text-zinc-400 font-mono text-[10px] mt-0.5">REF: {selectedComponentForModal.dynoTestReportRef}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-zinc-400 text-[10px]">
                <div className="p-2 rounded-[3px] bg-zinc-900 border border-zinc-800">
                  <span className="block text-[8px] uppercase font-bold text-zinc-500">PRESIÓN DE INYECCIÓN / ACEITE:</span>
                  <strong className="text-white">4.8 BAR (NOMINAL A 1800 RPM)</strong>
                </div>
                <div className="p-2 rounded-[3px] bg-zinc-900 border border-zinc-800">
                  <span className="block text-[8px] uppercase font-bold text-zinc-500">TORQUE MÁXIMO TESTEADO:</span>
                  <strong className="text-white">420 NM @ 1400 RPM</strong>
                </div>
                <div className="p-2 rounded-[3px] bg-zinc-900 border border-zinc-800">
                  <span className="block text-[8px] uppercase font-bold text-zinc-500">TEMPERATURA TERMOSTATO:</span>
                  <strong className="text-white">88°C ESTABLE</strong>
                </div>
                <div className="p-2 rounded-[3px] bg-zinc-900 border border-zinc-800">
                  <span className="block text-[8px] uppercase font-bold text-zinc-500">FUGA / BLOW-BY:</span>
                  <strong className="text-emerald-400">0.02 KPA (NORMA OEM)</strong>
                </div>
              </div>

              <div className="p-2.5 rounded-[3px] bg-zinc-900 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>COMPONENTE APROBADO PARA DESPACHO CON PRECINTO Y 12 MESES DE GARANTÍA TMD.</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedComponentForModal(null)}
                  className="px-4 py-1.5 rounded-[3px] text-zinc-400 font-bold hover:bg-zinc-900 border border-zinc-800 cursor-pointer"
                >
                  CERRAR
                </button>
                <a
                  href={`https://wa.me/18095601234?text=Hola%20TMD,%20solicito%20ordenar%20el%20componente%20Reman:%20${selectedComponentForModal.sku}%20con%20certificado%20${selectedComponentForModal.dynoTestReportRef}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black font-black uppercase flex items-center gap-1.5 shadow-md"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>ESPECIALISTA REMAN</span>
                </a>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
