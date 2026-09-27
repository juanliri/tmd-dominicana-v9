import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Award, 
  ShieldCheck, 
  CheckCircle, 
  Search, 
  Filter, 
  ArrowRight, 
  DollarSign, 
  Sparkles, 
  FileText, 
  Layers, 
  Clock, 
  MapPin, 
  HelpCircle,
  Truck
} from 'lucide-react';
import { CERTIFIED_USED_MACHINES } from '../../data/tradeInData';
import { UsedMachineListing } from '../../types';
import { useCart } from '../../context/CartContext';

interface CertifiedUsedMarketViewProps {
  onNavigate?: (route: string) => void;
}

export const CertifiedUsedMarketView: React.FC<CertifiedUsedMarketViewProps> = ({ onNavigate }) => {
  const { formatPrice } = useCart();
  const [machinesList] = useState<UsedMachineListing[]>(CERTIFIED_USED_MACHINES);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedMachine, setSelectedMachine] = useState<UsedMachineListing | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState<boolean>(false);

  // Trade-in (Retoma) Calculator State
  const [tradeInBrand, setTradeInBrand] = useState<string>('JCB');
  const [tradeInModel, setTradeInModel] = useState<string>('3CX');
  const [tradeInYear, setTradeInYear] = useState<number>(2017);
  const [tradeInHours, setTradeInHours] = useState<number>(4500);
  const [tradeInCondition, setTradeInCondition] = useState<'excelente' | 'bueno' | 'regular'>('bueno');
  const [estimatedTradeInValue, setEstimatedTradeInValue] = useState<number | null>(null);
  const [tradeInCalculated, setTradeInCalculated] = useState<boolean>(false);

  const filteredMachines = machinesList.filter(m => {
    if (selectedBrand === 'all') return true;
    return m.brand.toLowerCase() === selectedBrand.toLowerCase();
  });

  const handleCalculateTradeIn = (e: React.FormEvent) => {
    e.preventDefault();
    // Valuation algorithm based on age, hours, and condition
    let baseValue = 55000;
    if (tradeInBrand === 'LiuGong') baseValue = 65000;
    if (tradeInBrand === 'Caterpillar') baseValue = 70000;
    if (tradeInBrand === 'Komatsu') baseValue = 62000;

    const age = 2026 - tradeInYear;
    const depreciationFactor = Math.max(0.3, 1 - (age * 0.08) - (tradeInHours * 0.00005));
    
    let conditionMultiplier = 1.0;
    if (tradeInCondition === 'excelente') conditionMultiplier = 1.12;
    if (tradeInCondition === 'regular') conditionMultiplier = 0.85;

    const finalVal = Math.round(baseValue * depreciationFactor * conditionMultiplier / 500) * 500;
    setEstimatedTradeInValue(finalVal);
    setTradeInCalculated(true);
  };

  const handleInspectMachine = (m: UsedMachineListing) => {
    setSelectedMachine(m);
    setContactModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors pb-24">
      {/* Hero Banner */}
      <div className="bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 text-white border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Award className="w-3.5 h-3.5" />
              <span>Mercado de Equipos Certificados & Retoma Oficial</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
              Maquinaria Usada <span className="text-amber-500">Certificada 150 Puntos</span>
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              Equipos de ocasión inspeccionados rigurosamente por ingenieros de fábrica en Km 22 Duarte. Garantía oficial de tren motriz, historial de mantenimiento comprobado y entrega inmediata en toda República Dominicana.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        
        {/* Trade-In (Retoma) Interactive Appraisal Engine */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-zinc-200 dark:border-zinc-800 mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2 text-amber-500 text-xs font-black uppercase tracking-wider mb-1">
                <DollarSign className="w-4 h-4" />
                <span>Programa Retoma TMD Trade-In</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
                Cotiza el Valor de tu Máquina Usada
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Recibimos tu equipo usado como parte de pago para tu nueva unidad JCB o LiuGong 0 km con financiamiento directo.
              </p>
            </div>
          </div>

          <form onSubmit={handleCalculateTradeIn} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
            <div>
              <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Marca del Equipo
              </label>
              <select
                value={tradeInBrand}
                onChange={(e) => setTradeInBrand(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold focus:ring-2 focus:ring-amber-500"
              >
                <option value="JCB">JCB</option>
                <option value="LiuGong">LiuGong</option>
                <option value="Caterpillar">Caterpillar</option>
                <option value="Komatsu">Komatsu</option>
                <option value="Case">Case</option>
                <option value="John Deere">John Deere</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Modelo / Referencia
              </label>
              <input
                type="text"
                value={tradeInModel}
                onChange={(e) => setTradeInModel(e.target.value)}
                placeholder="Ej. 3CX, 922E, 320D"
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Año de Fabricación
              </label>
              <select
                value={tradeInYear}
                onChange={(e) => setTradeInYear(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold focus:ring-2 focus:ring-amber-500"
              >
                {[2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Horas Horómetro
              </label>
              <input
                type="number"
                value={tradeInHours}
                onChange={(e) => setTradeInHours(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer h-9 flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Calcular Retoma</span>
              </button>
            </div>
          </form>

          {/* Trade In Calculated Output Box */}
          {tradeInCalculated && estimatedTradeInValue && (
            <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 text-white border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-200">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Valor Estimado de Retoma (Trade-In Credit):
                </span>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {formatPrice(estimatedTradeInValue)} <span className="text-xs text-zinc-400 font-normal">estimado</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Para aplicar a {tradeInBrand} {tradeInModel} ({tradeInYear}, {tradeInHours} hrs). Sujeto a peritaje presencial de 150 puntos en Km 22 Duarte.
                </p>
              </div>

              <a
                href={`https://wa.me/18095601234?text=Hola%20TMD,%20quiero%20agendar%20peritaje%20para%20retoma%20de%20mi%20${encodeURIComponent(tradeInBrand + ' ' + tradeInModel + ' ' + tradeInYear)}%20con%20valor%20estimado%20de%20USD%20${estimatedTradeInValue}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shrink-0 cursor-pointer shadow-md"
              >
                Agendar Peritaje Físico
              </a>
            </div>
          )}
        </div>

        {/* Available Certified Used Units */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
                Inventario Disponible en Patio
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Unidades listas para entrega con documentación aduanal y traspaso al día
              </p>
            </div>

            {/* Brand Filter */}
            <div className="flex items-center gap-2">
              {['all', 'JCB', 'LiuGong'].map(b => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                    selectedBrand === b
                      ? 'bg-amber-500 text-black font-black'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {b === 'all' ? 'Todas' : b}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMachines.map(m => (
              <div
                key={m.id}
                className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-52 overflow-hidden bg-zinc-800">
                    <img
                      src={m.imageUrl}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-zinc-900/90 backdrop-blur-xs text-amber-400 text-[10px] font-black uppercase border border-amber-500/30 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-amber-500" />
                        <span>Score: {m.certifiedInspectionScore}%</span>
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono">
                        {m.serialNumberMasked}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-bold text-white bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 rounded-xl">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{m.hours.toLocaleString()} Horas</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span className="truncate max-w-[140px]">{m.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">
                          Año {m.year} • {m.brand}
                        </span>
                        <h3 className="text-base font-black text-zinc-900 dark:text-white leading-snug">
                          {m.title}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      {m.features.slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                          <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                      <span className="text-zinc-500 text-[11px]">Tren de Rodaje / Gomas:</span>
                      <strong className="text-emerald-500 font-black">{m.undercarriageConditionPercent}% de Vida Útil</strong>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-zinc-100 dark:border-zinc-800 mt-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase block">Precio Certificado:</span>
                    <div className="text-lg font-black text-zinc-900 dark:text-white">
                      {formatPrice(m.priceUsd)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleInspectMachine(m)}
                    className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-100 text-xs font-black transition-all cursor-pointer shadow-xs"
                  >
                    Solicitar Informe
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Inspection Modal */}
      {contactModalOpen && selectedMachine && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-md w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
              <div>
                <span className="text-[10px] font-bold text-amber-500 uppercase">Peritaje TMD</span>
                <h3 className="text-base font-black text-zinc-900 dark:text-white">
                  Informe de 150 Puntos
                </h3>
              </div>
              <button onClick={() => setContactModalOpen(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 mb-4 text-xs space-y-1">
              <div className="font-bold text-zinc-900 dark:text-white">{selectedMachine.title}</div>
              <div className="text-zinc-500">Horómetro: {selectedMachine.hours} hrs • {selectedMachine.location}</div>
              <div className="text-amber-500 font-black">{formatPrice(selectedMachine.priceUsd)}</div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
              El informe oficial de 150 puntos incluye análisis de compresión de motor, prueba dinamométrica de bombas hidráulicas y certificación de chasis sin fisuras estructurales.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setContactModalOpen(false)}
                className="flex-1 py-2 rounded-xl text-zinc-500 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs"
              >
                Cerrar
              </button>
              <a
                href={`https://wa.me/18095601234?text=Hola%20TMD,%20solicito%20el%20informe%20de%20peritaje%20150P%20de%20la%20unidad%20usada%20${encodeURIComponent(selectedMachine.title)}%20(${selectedMachine.serialNumberMasked})`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-center text-xs"
              >
                Recibir por WhatsApp
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
