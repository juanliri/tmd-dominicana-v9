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
  AlertCircle
} from 'lucide-react';
import { REMAN_COMPONENTS } from '../../data/remanData';
import { RemanComponent } from '../../types';
import { useCart } from '../../context/CartContext';

interface RemanCoreExchangeViewProps {
  onNavigate?: (route: string) => void;
}

export const RemanCoreExchangeView: React.FC<RemanCoreExchangeViewProps> = ({ onNavigate }) => {
  const { formatPrice, addToCart, showToast } = useCart();
  const [componentsList] = useState<RemanComponent[]>(REMAN_COMPONENTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCoreComp, setActiveCoreComp] = useState<RemanComponent | null>(null);

  const categories = [
    { key: 'all', label: 'Todos los Componentes' },
    { key: 'Motores Diésel', label: 'Motores Diésel' },
    { key: 'Bombas Hidráulicas', label: 'Bombas Hidráulicas' },
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors pb-24">
      {/* Top Banner */}
      <div className="bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 text-white border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Programa Reman & Crédito por Casco Usado (Core Exchange)</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
              Componentes <span className="text-amber-500">Remanufacturados en Banco Dyno</span>
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              Ahorre hasta un 45% respecto a un componente nuevo sin comprometer la confiabilidad. Motores JCB Dieselmax y Cummins, bombas Kawasaki y transmisiones Carraro reconstruidas a tolerancia cero horas con 12 meses de garantía oficial.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        
        {/* Core Exchange How it works callout */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-zinc-200 dark:border-zinc-800 mb-10">
          <div className="text-xs font-black uppercase tracking-wider text-amber-500 mb-2">
            ¿Cómo Funciona el Retorno de Casco (Core Exchange)?
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-black text-sm mb-3">1</div>
              <h4 className="font-extrabold text-zinc-900 dark:text-white text-sm mb-1">Adquiere la Unidad Reman</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Despacho inmediato de stock en Km 22 Duarte para minimizar el tiempo de máquina parada.</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center font-black text-sm mb-3">2</div>
              <h4 className="font-extrabold text-zinc-900 dark:text-white text-sm mb-1">Entrega tu Casco Dañado</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Envía el motor o bomba averiada a nuestros talleres para inspección de integridad estructural.</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-black text-sm mb-3">3</div>
              <h4 className="font-extrabold text-zinc-900 dark:text-white text-sm mb-1">Reembolso / Crédito Inmediato</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Acreditamos automáticamente el valor del casco (Core Credit) en tu factura o cuenta corriente.</p>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-md border border-zinc-200 dark:border-zinc-800 mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar componente por SKU, Motor o Máquina (ej. Dieselmax, K3V112)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
              {categories.map(c => (
                <button
                  key={c.key}
                  onClick={() => setSelectedCategory(c.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === c.key
                      ? 'bg-amber-500 text-black font-black'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reman Components Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComponents.map(comp => (
            <div
              key={comp.id}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">
                      {comp.brand} • {comp.category}
                    </span>
                    <h3 className="text-base font-extrabold text-zinc-900 dark:text-white leading-snug">
                      {comp.name}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-mono text-[10px] font-bold shrink-0">
                    {comp.sku}
                  </span>
                </div>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
                  {comp.description}
                </p>

                <div className="space-y-2 py-3 px-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-xs mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Precio Bruto Reman:</span>
                    <strong className="text-zinc-800 dark:text-zinc-200">{formatPrice(comp.priceRemanUsd)}</strong>
                  </div>
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                    <span className="font-semibold">Crédito Retorno de Casco:</span>
                    <strong className="font-black">-{formatPrice(comp.coreCreditUsd)}</strong>
                  </div>
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-sm">
                    <span className="font-bold text-zinc-900 dark:text-white">Precio Neto con Casco:</span>
                    <strong className="text-amber-500 font-black text-base">{formatPrice(comp.netPriceUsd)}</strong>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20 flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    <span>Dyno Test OK</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[10px] font-bold border border-blue-500/20">
                    {comp.warrantyMonths} Meses Garantía
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold">
                    Stock: {comp.stockQty} u.
                  </span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleOrderReman(comp)}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ordenar con Crédito Casco</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
