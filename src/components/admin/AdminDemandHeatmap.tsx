import React, { useState } from 'react';
import { 
  MapPin, 
  TrendingUp, 
  Flame, 
  Ship, 
  Layers, 
  Building2, 
  BarChart2, 
  Calendar, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { USD_TO_DOP_RATE } from '../../data/catalog';
import { Currency } from '../../types';

interface ProvinceDemandMetric {
  id: string;
  province: string;
  region: 'Cibao' | 'Santo Domingo / Metropolitano' | 'Este' | 'Sur';
  topMachineRequested: string;
  monthlyQuotesCount: number;
  estimatedVolumeUsd: number;
  growthRatePercent: number;
  heatLevel: 'CRITICAL_HIGH' | 'HIGH' | 'MODERATE' | 'STABLE';
  importRecommendation: string;
}

const REGIONAL_DEMAND_DATA: ProvinceDemandMetric[] = [
  {
    id: 'sd',
    province: 'Santo Domingo / Distrito Nacional / San Cristóbal',
    region: 'Santo Domingo / Metropolitano',
    topMachineRequested: 'Retroexcavadora JCB 3CX Eco & Rodillo LiuGong 6114E',
    monthlyQuotesCount: 142,
    estimatedVolumeUsd: 2850000,
    growthRatePercent: 24.5,
    heatLevel: 'CRITICAL_HIGH',
    importRecommendation: 'Aumentar pedidos a fábrica JCB Reino Unido en +4 unidades mensuales.'
  },
  {
    id: 'cibao',
    province: 'Santiago / La Vega / San Francisco de Macorís / Puerto Plata',
    region: 'Cibao',
    topMachineRequested: 'Excavadora LiuGong 922E & Tractor LS Plus 100',
    monthlyQuotesCount: 118,
    estimatedVolumeUsd: 2150000,
    growthRatePercent: 19.8,
    heatLevel: 'HIGH',
    importRecommendation: 'Mantener stock de excavadoras 22T y kits de zapatas para roca en sucursal Santiago.'
  },
  {
    id: 'este',
    province: 'La Altagracia (Punta Cana / Bávaro) / La Romana / San Pedro',
    region: 'Este',
    topMachineRequested: 'Cargador LiuGong 856H & Minicargador JCB 250',
    monthlyQuotesCount: 89,
    estimatedVolumeUsd: 1620000,
    growthRatePercent: 31.2,
    heatLevel: 'HIGH',
    importRecommendation: 'Pico por desarrollo hotelero y vías turísticas; pre-reservar 3 cargadores frontales.'
  },
  {
    id: 'sur',
    province: 'Barahona / Azua / San Juan / Pedernales (Proyecto Turístico)',
    region: 'Sur',
    topMachineRequested: 'Bulldozer LiuGong B160CL & Excavadora 936E',
    monthlyQuotesCount: 47,
    estimatedVolumeUsd: 940000,
    growthRatePercent: 42.0,
    heatLevel: 'MODERATE',
    importRecommendation: 'Expansión de Pedernales y canteras calizas impulsan equipos de movimiento pesado.'
  }
];

interface Props {
  currency?: Currency;
}

export const AdminDemandHeatmap: React.FC<Props> = ({ currency = 'USD' }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  const formatMoney = (amountUsd: number) => {
    if (currency === 'DOP') {
      return `RD$ ${(amountUsd * USD_TO_DOP_RATE).toLocaleString('es-DO', { maximumFractionDigits: 0 })}`;
    }
    return `$${amountUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

  const totalQuotes = REGIONAL_DEMAND_DATA.reduce((acc, r) => acc + r.monthlyQuotesCount, 0);
  const totalVolume = REGIONAL_DEMAND_DATA.reduce((acc, r) => acc + r.estimatedVolumeUsd, 0);

  const filteredRegions = selectedRegion === 'all' 
    ? REGIONAL_DEMAND_DATA 
    : REGIONAL_DEMAND_DATA.filter(r => r.id === selectedRegion);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/30 font-black">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-zinc-900 dark:text-white tracking-tight">
                Mapa de Calor & Demanda Regional Dominicana
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                Predictivo Importaciones
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Analítica de cotizaciones en tiempo real para optimización de pedidos a fábrica y stock en patio Km 22
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setSelectedRegion('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              selectedRegion === 'all' ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-black' : 'text-zinc-500'
            }`}
          >
            Nacional ({totalQuotes})
          </button>
          <button
            onClick={() => setSelectedRegion('sd')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              selectedRegion === 'sd' ? 'bg-amber-500 text-black font-black' : 'text-zinc-500'
            }`}
          >
            Metropolitano
          </button>
          <button
            onClick={() => setSelectedRegion('cibao')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              selectedRegion === 'cibao' ? 'bg-amber-500 text-black font-black' : 'text-zinc-500'
            }`}
          >
            Cibao
          </button>
          <button
            onClick={() => setSelectedRegion('este')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              selectedRegion === 'este' ? 'bg-amber-500 text-black font-black' : 'text-zinc-500'
            }`}
          >
            Este
          </button>
          <button
            onClick={() => setSelectedRegion('sur')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              selectedRegion === 'sur' ? 'bg-amber-500 text-black font-black' : 'text-zinc-500'
            }`}
          >
            Sur
          </button>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">
            Demanda Total Mensual Estimada
          </span>
          <span className="text-xl font-black text-zinc-900 dark:text-white">{formatMoney(totalVolume)}</span>
          <span className="text-[11px] text-emerald-500 font-bold block mt-1">+28.4% vs trimestre anterior</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">
            Región de Mayor Aceleración
          </span>
          <span className="text-base font-black text-amber-500">Polo Sur / Pedernales (+42.0%)</span>
          <span className="text-[11px] text-zinc-400 block mt-1">Impulsado por proyectos viales y hoteleros</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">
            Modelo Estrella Nacional
          </span>
          <span className="text-base font-black text-zinc-900 dark:text-white">JCB 3CX Eco (43% de cuota)</span>
          <span className="text-[11px] text-zinc-400 block mt-1">Líder indiscutible en construcción dominicana</span>
        </div>
      </div>

      {/* Detailed Province Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRegions.map((r) => (
          <div
            key={r.id}
            className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-black text-zinc-900 dark:text-white">{r.province}</h4>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold">{r.region}</span>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                r.heatLevel === 'CRITICAL_HIGH'
                  ? 'bg-rose-500 text-white animate-pulse'
                  : r.heatLevel === 'HIGH'
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
              }`}>
                {r.heatLevel === 'CRITICAL_HIGH' ? 'Fuego Máximo' : r.heatLevel === 'HIGH' ? 'Alta Demanda' : 'Moderado'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 text-center text-xs">
              <div>
                <span className="text-[10px] text-zinc-400 block">Cotizaciones</span>
                <span className="font-black text-zinc-900 dark:text-white">{r.monthlyQuotesCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block">Volumen</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">{formatMoney(r.estimatedVolumeUsd)}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block">Crecimiento</span>
                <span className="font-black text-amber-500">+{r.growthRatePercent}%</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <p className="text-zinc-600 dark:text-zinc-300">
                <strong>Equipo más solicitado:</strong> {r.topMachineRequested}
              </p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/5 p-2 rounded-xl border border-amber-500/20">
                <Ship className="inline w-3 h-3 mr-1" />
                <strong>Recomendación Logística:</strong> {r.importRecommendation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
