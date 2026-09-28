import React, { useState } from 'react';
import { 
  RotateCcw, 
  Wrench, 
  ShieldCheck, 
  CheckCircle, 
  Search, 
  Cpu, 
  ArrowRight, 
  Sparkles, 
  Activity, 
  Layers, 
  Download, 
  AlertCircle,
  Phone,
  Truck
} from 'lucide-react';
import { REMAN_COMPONENTS } from '../../data/remanData';
import { RemanComponent } from '../../types';
import { useCart } from '../../context/CartContext';
import { triggerHaptic } from '../../utils/haptics';

interface RemanCoreExchangeViewProps {
  onNavigate?: (route: string) => void;
}

export const RemanCoreExchangeView: React.FC<RemanCoreExchangeViewProps> = ({ onNavigate }) => {
  const { formatPrice, addToCart, showToast } = useCart();
  const [componentsList] = useState<RemanComponent[]>(REMAN_COMPONENTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { key: 'all', label: 'Todos los Componentes' },
    { key: 'Motores Diésel', label: 'Motores Diésel' },
    { key: 'Bombas Hidráulicas', label: 'Bombas Hidráulicas' },
    { key: 'Motores de Giro', label: 'Motores de Giro' },
    { key: 'Mandos Finales', label: 'Mandos Finales' },
    { key: 'Transmisiones', label: 'Transmisiones' },
    { key: 'Turbocargadores', label: 'Turbocargadores' }
  ];

  const filteredComponents = componentsList.filter(comp => {
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
      name: `${comp.name} (Reman Oficial + Core Exchange)`,
      partNumber: comp.sku,
      brand: comp.brand,
      priceUsd: comp.netPriceUsd,
      category: comp.category,
      image: comp.image,
      stockQty: comp.stockQty,
      isOem: true,
      deliveryTimeHours: comp.leadTimeDays * 24,
      compatibleModels: comp.compatibleMachines,
      description: comp.description
    });
    showToast(`Reman ${comp.sku} en carrito con crédito de casco (-${formatPrice(comp.coreCreditUsd)}).`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white transition-colors pb-24 font-mono">
      {/* Top Banner */}
      <div className="bg-zinc-950 text-white border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[2px] bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>PROGRAMA TMD REMAN & CRÉDITO POR CASCO USADO (CORE EXCHANGE)</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight uppercase font-display">
              COMPONENTES <span className="text-amber-400">REMANUFACTURADOS EN BANCO DYNO</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 uppercase leading-relaxed font-sans">
              Ahorre hasta un 45% respecto a un componente nuevo sin comprometer la confiabilidad. Motores JCB Dieselmax y Cummins, bombas Kawasaki, motores de giro Rexroth y transmisiones Carraro reconstruidas a tolerancia cero horas con 12 meses de garantía oficial.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        
        {/* Core Exchange How it works callout */}
        <div className="bg-zinc-900 rounded-[5px] p-5 sm:p-6 shadow-xl border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-black uppercase tracking-wider text-amber-400">
              ¿CÓMO OPERA EL SISTEMA DE RETORNO DE CASCO (CORE EXCHANGE)?
            </div>
            <span className="text-[10px] text-zinc-400 uppercase">TALLER SEDE KM 22 DUARTE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-1">
              <div className="w-6 h-6 rounded-[2px] bg-amber-400/20 text-amber-400 flex items-center justify-center font-black text-xs mb-1">
                1
              </div>
              <h4 className="font-black text-white text-xs uppercase">
                Adquiere la Unidad Reman
              </h4>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                Despacho inmediato de stock certificado en Km 22 Duarte para minimizar el tiempo de máquina parada.
              </p>
            </div>

            <div className="p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-1">
              <div className="w-6 h-6 rounded-[2px] bg-amber-400/20 text-amber-400 flex items-center justify-center font-black text-xs mb-1">
                2
              </div>
              <h4 className="font-black text-white text-xs uppercase">
                Entrega tu Casco Dañado
              </h4>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                Envía el motor o bomba averiada a nuestros talleres para inspección de integridad estructural en 48 horas.
              </p>
            </div>

            <div className="p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-1">
              <div className="w-6 h-6 rounded-[2px] bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs mb-1">
                3
              </div>
              <h4 className="font-black text-white text-xs uppercase">
                Acreditación Inmediata
              </h4>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                Acreditamos automáticamente el valor del casco (Core Credit) en tu factura oficial o cuenta corriente.
              </p>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-zinc-900 rounded-[5px] p-4 shadow-md border border-zinc-800 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="BUSCAR POR SKU, MOTOR O MÁQUINA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-[2px] bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 uppercase focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
              {categories.map(c => (
                <button
                  key={c.key}
                  onClick={() => {
                    triggerHaptic('selection');
                    setSelectedCategory(c.key);
                  }}
                  className={`px-3 py-1.5 rounded-[2px] text-[10px] font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === c.key
                      ? 'bg-amber-400 text-black font-black'
                      : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reman Components Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredComponents.map(comp => (
            <div
              key={comp.id}
              className="bg-zinc-900 rounded-[5px] p-5 border border-zinc-800 shadow-md hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                      {comp.brand} • {comp.category}
                    </span>
                    <h3 className="text-sm font-black uppercase text-white font-display leading-snug mt-0.5">
                      {comp.name}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-[2px] bg-zinc-950 border border-zinc-800 text-zinc-400 font-mono text-[10px] font-bold shrink-0">
                    {comp.sku}
                  </span>
                </div>

                <p className="text-[11px] text-zinc-400 font-sans leading-relaxed mb-3">
                  {comp.description}
                </p>

                <div className="space-y-1.5 py-2.5 px-3 rounded-[3px] bg-zinc-950 border border-zinc-800/80 text-xs mb-3 font-mono">
                  <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                    <span className="uppercase">PRECIO BRUTO REMAN:</span>
                    <strong className="text-zinc-200">{formatPrice(comp.priceRemanUsd)}</strong>
                  </div>
                  <div className="flex items-center justify-between text-emerald-400 text-[11px]">
                    <span className="uppercase font-semibold">(-) CRÉDITO POR CASCO:</span>
                    <strong className="font-black">-{formatPrice(comp.coreCreditUsd)}</strong>
                  </div>
                  <div className="pt-1.5 border-t border-zinc-800 flex items-center justify-between text-xs font-black">
                    <span className="uppercase text-amber-400">NETO CON CASCO:</span>
                    <strong className="text-amber-400 font-black text-sm">{formatPrice(comp.netPriceUsd)}</strong>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-[2px] bg-emerald-500/10 text-emerald-400 text-[9px] font-bold border border-emerald-500/20 flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    <span>Dyno Test OK</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-[2px] bg-amber-400/10 text-amber-400 text-[9px] font-bold border border-amber-400/20">
                    {comp.warrantyMonths} Meses Garantía
                  </span>
                  <span className="px-2 py-0.5 rounded-[2px] bg-zinc-950 border border-zinc-800 text-zinc-400 text-[9px] font-bold">
                    Stock: {comp.stockQty} u.
                  </span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleOrderReman(comp)}
                  className="w-full py-2.5 px-4 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ORDENAR CON CRÉDITO CASCO</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
