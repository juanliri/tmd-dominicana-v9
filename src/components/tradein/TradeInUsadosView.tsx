import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  Clock, 
  FileText, 
  Calculator,
  RefreshCw,
  Phone
} from 'lucide-react';
import { CERTIFIED_USED_MACHINES } from '../../data/tradeInData';
import { UsedMachineListing } from '../../types';
import { useCart } from '../../context/CartContext';

interface TradeInUsadosViewProps {
  onNavigate?: (route: string) => void;
}

export const TradeInUsadosView: React.FC<TradeInUsadosViewProps> = ({ onNavigate }) => {
  const { formatPrice } = useCart();
  const [machines] = useState<UsedMachineListing[]>(CERTIFIED_USED_MACHINES);
  const [selectedMachine, setSelectedMachine] = useState<UsedMachineListing | null>(null);
  
  // Trade-In valuation form states
  const [tradeInBrand, setTradeInBrand] = useState('JCB');
  const [tradeInModel, setTradeInModel] = useState('3CX');
  const [tradeInYear, setTradeInYear] = useState(2018);
  const [tradeInHours, setTradeInHours] = useState(4500);
  const [tradeInCondition, setTradeInCondition] = useState('good');
  const [estimatedTradeInValue, setEstimatedTradeInValue] = useState<number | null>(null);

  const handleCalculateTradeIn = (e: React.FormEvent) => {
    e.preventDefault();
    // Realistic heuristic based on Dominican heavy equipment resale values
    let baseVal = 45000;
    if (tradeInBrand === 'JCB') baseVal = 52000;
    if (tradeInBrand === 'LiuGong') baseVal = 48000;
    if (tradeInBrand === 'Caterpillar') baseVal = 58000;

    const ageDiff = Math.max(0, 2026 - tradeInYear);
    const depreciation = ageDiff * 3200 + (tradeInHours / 1000) * 1800;
    let finalEst = Math.max(18000, baseVal - depreciation);

    if (tradeInCondition === 'excellent') finalEst *= 1.15;
    if (tradeInCondition === 'fair') finalEst *= 0.85;

    setEstimatedTradeInValue(Math.round(finalEst));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 transition-colors pb-20 font-mono">
      {/* Top Banner */}
      <div className="bg-zinc-950 text-white border-b border-zinc-800">
        <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-6 sm:py-8">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-black uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>CERTIFICACIÓN TMD 150 PUNTOS • MERCADO DE OCASIÓN & TRADE-IN</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight uppercase font-display">
              USADOS <span className="text-amber-400">CERTIFICADOS</span> & AVALÚO DE FLOTAS
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 uppercase leading-relaxed">
              Equipos de segunda mano rigurosamente inspeccionados en 150 puntos críticos por nuestros ingenieros mecánicos. Entregue su maquinaria actual como parte de pago para su nueva flota JCB o LiuGong.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 mt-6 space-y-6">
        
        {/* Trade-In Estimator Box */}
        <div className="bg-zinc-900 rounded-[5px] p-5 sm:p-6 shadow-xl border border-zinc-800">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-black uppercase tracking-wider mb-1 font-display">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>SIMULADOR DE RETOMA & TRADE-IN RD</span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-white uppercase font-display">
                ¿DESEA CAMBIAR SU MÁQUINA POR UNA NUEVA?
              </h2>
              <p className="text-xs text-zinc-400 uppercase">
                Calcule el valor aproximado de retoma de su equipo actual para abonar a la compra de una unidad nueva.
              </p>
            </div>

            {estimatedTradeInValue !== null && (
              <div className="p-3.5 rounded-[3px] bg-zinc-950 border border-amber-500/40 text-left sm:text-right shrink-0 flex flex-col items-start sm:items-end gap-1">
                <span className="text-[9px] font-bold text-amber-400 uppercase block font-display">VALOR ESTIMADO DE RETOMA:</span>
                <div className="text-2xl font-black text-white font-mono">
                  {formatPrice(estimatedTradeInValue)}
                </div>
                <span className="text-[9px] text-zinc-500 block uppercase">Sujeto a peritaje en patio Km 22</span>
                <a
                  href={`https://wa.me/18095601234?text=Hola%20TMD,%20deseo%20agendar%20peritaje%20Trade-In%20para%20mi%20equipo%20${encodeURIComponent(tradeInBrand)}%20${encodeURIComponent(tradeInModel)}%20(${tradeInYear},%20${tradeInHours}h,%20Condici%C3%B3n:%20${tradeInCondition}).%20Estimaci%C3%B3n%20web:%20USD$${estimatedTradeInValue}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 px-3 py-1.5 rounded-[3px] bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black uppercase flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Phone className="w-3 h-3" />
                  <span>AGENDAR PERITAJE PATIO KM 22</span>
                </a>
              </div>
            )}
          </div>

          <form onSubmit={handleCalculateTradeIn} className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="block font-bold text-zinc-400 mb-1 uppercase text-[10px]">MARCA ACTUAL</label>
              <select
                value={tradeInBrand}
                onChange={(e) => setTradeInBrand(e.target.value)}
                className="w-full px-3 py-2 rounded-[3px] bg-zinc-950 border border-zinc-700 text-white font-bold text-xs focus:outline-none focus:border-amber-400 uppercase"
              >
                <option value="JCB">JCB</option>
                <option value="LiuGong">LiuGong</option>
                <option value="Caterpillar">Caterpillar</option>
                <option value="Komatsu">Komatsu</option>
                <option value="Case">Case</option>
                <option value="Otra">Otra Marca</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-zinc-400 mb-1 uppercase text-[10px]">MODELO / TIPO</label>
              <input
                type="text"
                value={tradeInModel}
                onChange={(e) => setTradeInModel(e.target.value)}
                placeholder="Ej. 3CX, 320D, 922E..."
                className="w-full px-3 py-2 rounded-[3px] bg-zinc-950 border border-zinc-700 text-white font-bold text-xs focus:outline-none focus:border-amber-400 uppercase"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-400 mb-1 uppercase text-[10px]">AÑO FABRICACIÓN</label>
              <input
                type="number"
                min={2005}
                max={2026}
                value={tradeInYear}
                onChange={(e) => setTradeInYear(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-[3px] bg-zinc-950 border border-zinc-700 text-white font-bold text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-400 mb-1 uppercase text-[10px]">HORÓMETRO (HORAS)</label>
              <input
                type="number"
                min={100}
                max={30000}
                value={tradeInHours}
                onChange={(e) => setTradeInHours(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-[3px] bg-zinc-950 border border-zinc-700 text-white font-bold text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs transition-all cursor-pointer shadow-xs"
              >
                CALCULAR AVALÚO
              </button>
            </div>
          </form>
        </div>

        {/* Certified Machinery Inventory */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div>
              <h2 className="text-base sm:text-lg font-black text-white uppercase font-display">
                FLOTA DE USADOS CERTIFICADOS EN STOCK
              </h2>
              <p className="text-[10px] text-zinc-400 uppercase">
                Disponibilidad inmediata para entrega con informe pericial 150 puntos
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {machines.map(m => (
              <div
                key={m.id}
                className="bg-zinc-900 rounded-[5px] overflow-hidden border border-zinc-800 shadow-md hover:border-zinc-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 bg-zinc-950 overflow-hidden">
                    <img 
                      src={m.imageUrl} 
                      alt={m.title} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-[3px] bg-black/85 backdrop-blur-xs text-amber-400 text-[10px] font-black uppercase border border-amber-500/30 flex items-center gap-1 font-mono">
                      <ShieldCheck className="w-3 h-3 text-amber-400" />
                      <span>SCORE: {m.certifiedInspectionScore}/100</span>
                    </div>

                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-[3px] bg-emerald-500 text-black text-[10px] font-black uppercase font-mono">
                      {m.warrantyMonths}M GARANTÍA
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="font-bold text-amber-400 uppercase text-[10px]">
                        {m.brand} • {m.year}
                      </span>
                      <span className="font-mono text-[10px]">
                        {m.hours.toLocaleString()} HRS
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-white leading-snug uppercase font-display">
                      {m.title}
                    </h3>

                    <div className="grid grid-cols-2 gap-2 p-2 rounded-[3px] bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400">
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase block font-bold">UBICACIÓN:</span>
                        <strong className="text-zinc-200 truncate block uppercase">{m.location}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase block font-bold">RODAJE:</span>
                        <strong className="text-emerald-400 uppercase">{m.undercarriageConditionPercent}% VIDA ÚTIL</strong>
                      </div>
                    </div>

                    <ul className="space-y-1 text-xs text-zinc-400">
                      {m.features.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-[10px] uppercase">
                          <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="truncate">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-zinc-800/80 flex items-center justify-between mt-auto">
                  <div>
                    <span className="text-[10px] text-zinc-400 block uppercase font-bold">PRECIO CERTIFICADO:</span>
                    <div className="text-lg font-black text-amber-400 font-mono">
                      {formatPrice(m.priceUsd)}
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/18095601234?text=Hola%20TMD,%20me%20interesa%20inspeccionar%20el%20equipo%20usado%20certificado:%20${m.title}%20(${m.serialNumberMasked})`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-[3px] bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-black uppercase transition-all shadow-xs flex items-center gap-1"
                  >
                    <span>CITAR INSPECCIÓN</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
