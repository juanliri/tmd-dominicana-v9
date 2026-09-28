import React, { useState } from 'react';
import { 
  Calculator, 
  Fuel, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  BarChart3, 
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DEFAULT_TCO_PROFILES, FUEL_PRICE_PER_GALLON_USD } from '../../data/tcoData';
import { TcoMachineProfile, TcoComparisonResult } from '../../types';
import { useCart } from '../../context/CartContext';
import { UniversalBreadcrumbs } from '../common/navigation/UniversalBreadcrumbs';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';

interface TcoCalculatorViewProps {
  onNavigate?: (route: string) => void;
}

export const TcoCalculatorView: React.FC<TcoCalculatorViewProps> = ({ onNavigate }) => {
  const { formatPrice } = useCart();
  const [profiles] = useState<TcoMachineProfile[]>(DEFAULT_TCO_PROFILES);
  
  const tmdProfiles = profiles.filter(p => p.brand === 'JCB' || p.brand === 'LiuGong');
  const competitorProfiles = profiles.filter(p => p.brand !== 'JCB' && p.brand !== 'LiuGong');

  const [selectedProfileId, setSelectedProfileId] = useState<string>(tmdProfiles[0]?.id || 'tco-jcb-3cx');
  const [selectedCompetitorId, setSelectedCompetitorId] = useState<string>(competitorProfiles[0]?.id || 'tco-cat-420');
  const [annualHours, setAnnualHours] = useState<number>(2000);
  const [years, setYears] = useState<number>(5);
  const [fuelPriceUsd, setFuelPriceUsd] = useState<number>(FUEL_PRICE_PER_GALLON_USD);

  const selectedMachine = profiles.find(p => p.id === selectedProfileId) || tmdProfiles[0];
  const competitorMachine = profiles.find(p => p.id === selectedCompetitorId) || competitorProfiles[0];

  const calculateTco = (machine: TcoMachineProfile): TcoComparisonResult => {
    const totalLifetimeHours = annualHours * years;
    const totalFuelCostUsd = totalLifetimeHours * machine.fuelBurnGalPerHour * fuelPriceUsd;
    const totalMaintenanceCostUsd = totalLifetimeHours * machine.maintenanceCostPerHourUsd;
    const totalTireTrackCostUsd = totalLifetimeHours * machine.undercarriageTireCostPerHourUsd;
    const residualValueUsd = machine.initialPriceUsd * (machine.residualValue5YrsPercent / 100);
    const depreciationCostUsd = machine.initialPriceUsd - residualValueUsd;
    const totalTcoUsd = totalFuelCostUsd + totalMaintenanceCostUsd + totalTireTrackCostUsd + depreciationCostUsd;
    const costPerHourUsd = totalTcoUsd / totalLifetimeHours;

    return {
      machineName: machine.name,
      annualHours,
      years,
      totalFuelCostUsd,
      totalMaintenanceCostUsd,
      totalTireTrackCostUsd,
      depreciationCostUsd,
      totalTcoUsd,
      costPerHourUsd
    };
  };

  const selectedResult = calculateTco(selectedMachine);
  const competitorResult = calculateTco(competitorMachine);
  const totalSavingsUsd = competitorResult.totalTcoUsd - selectedResult.totalTcoUsd;
  const fuelSavingsUsd = competitorResult.totalFuelCostUsd - selectedResult.totalFuelCostUsd;
  const maintenanceSavingsUsd = competitorResult.totalMaintenanceCostUsd - selectedResult.totalMaintenanceCostUsd;

  // Chart dataset
  const chartData = [
    {
      category: 'Combustible Diésel',
      [selectedMachine.name]: Math.round(selectedResult.totalFuelCostUsd),
      [competitorMachine.name]: Math.round(competitorResult.totalFuelCostUsd)
    },
    {
      category: 'Mantenimiento & Filtros',
      [selectedMachine.name]: Math.round(selectedResult.totalMaintenanceCostUsd),
      [competitorMachine.name]: Math.round(competitorResult.totalMaintenanceCostUsd)
    },
    {
      category: 'Orugas / Neumáticos',
      [selectedMachine.name]: Math.round(selectedResult.totalTireTrackCostUsd),
      [competitorMachine.name]: Math.round(competitorResult.totalTireTrackCostUsd)
    },
    {
      category: 'Depreciación Neta',
      [selectedMachine.name]: Math.round(selectedResult.depreciationCostUsd),
      [competitorMachine.name]: Math.round(competitorResult.depreciationCostUsd)
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 transition-colors pb-20 font-mono">
      {/* Top Banner - Compact Commercial Standard */}
      <div className="bg-zinc-950 text-white border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
          {onNavigate && (
            <UniversalBreadcrumbs currentRoute="#/tco" onNavigate={onNavigate} />
          )}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-black uppercase tracking-wider">
                <Calculator className="w-3.5 h-3.5" />
                <span>ANÁLISIS FINANCIERO DE INGENIERÍA • TCO & FLUJO DE CAJA</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug uppercase font-display">
                CALCULADORA DE <span className="text-amber-400">COSTO TOTAL DE PROPIEDAD</span> (TCO)
              </h1>
              <p className="text-xs text-zinc-400 uppercase leading-relaxed">
                El precio de compra representa apenas el 20% del costo real. Compare consumo de diésel, retención de reventa y costo operativo por hora en República Dominicana contra Caterpillar y Komatsu.
              </p>
            </div>

            {onNavigate && (
              <div className="shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('#/machinery')}
                  className="px-4 py-2 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-all cursor-pointer shadow-sm flex items-center gap-1.5 uppercase"
                >
                  <span>VER MAQUINARIA</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        
        {/* Parameters Grid */}
        <div className="bg-zinc-900 rounded-[5px] p-5 shadow-xl border border-zinc-800 space-y-4">
          <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider font-display flex items-center justify-between">
            <span>PARÁMETROS OPERATIVOS & COMPARACIÓN DE FLOTA</span>
            <span className="text-zinc-500 text-[9px]">BASE CÁLCULO: MERCADO DOMINICANO 2026</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
            <div>
              <label className="block font-bold text-amber-400 mb-1 uppercase text-[10px]">
                EQUIPO TMD (JCB / LIUGONG)
              </label>
              <select
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-[3px] bg-zinc-950 border border-amber-500/40 text-white font-bold text-xs focus:outline-none focus:border-amber-400"
              >
                {tmdProfiles.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-zinc-400 mb-1 uppercase text-[10px]">
                COMPETIDOR DE MERCADO
              </label>
              <select
                value={selectedCompetitorId}
                onChange={(e) => setSelectedCompetitorId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-[3px] bg-zinc-950 border border-zinc-700 text-zinc-300 font-bold text-xs focus:outline-none focus:border-amber-400"
              >
                {competitorProfiles.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-zinc-400 mb-1 uppercase text-[10px]">
                HORAS OPERATIVAS / AÑO
              </label>
              <input
                type="number"
                min={500}
                max={5000}
                step={100}
                value={annualHours}
                onChange={(e) => setAnnualHours(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-[3px] bg-zinc-950 border border-zinc-700 text-white font-bold text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-400 mb-1 uppercase text-[10px]">
                HORIZONTE (AÑOS)
              </label>
              <select
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-[3px] bg-zinc-950 border border-zinc-700 text-white font-bold text-xs focus:outline-none focus:border-amber-400"
              >
                <option value={3}>3 AÑOS (CICLO INTENSIVO)</option>
                <option value={5}>5 AÑOS (ESTÁNDAR TCO)</option>
                <option value={7}>7 AÑOS (CICLO EXTENDIDO)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-zinc-400 mb-1 uppercase text-[10px]">
                DIÉSEL (USD/GALÓN)
              </label>
              <input
                type="number"
                min={2.0}
                max={8.0}
                step={0.1}
                value={fuelPriceUsd}
                onChange={(e) => setFuelPriceUsd(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-[3px] bg-zinc-950 border border-zinc-700 text-white font-bold text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Savings & Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900 p-5 rounded-[5px] border border-emerald-500/40 text-white shadow-lg space-y-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 block font-display">
              AHORRO NETO TOTAL ({years} AÑOS)
            </span>
            <div className="text-3xl font-black text-emerald-400 font-mono">
              {formatPrice(Math.max(0, totalSavingsUsd))}
            </div>
            <p className="text-[10px] text-zinc-300 leading-relaxed uppercase">
              Diferencial favorable acumulado en {years} años ({(annualHours * years).toLocaleString()} horas de trabajo).
            </p>
          </div>

          <div className="bg-zinc-900 p-5 rounded-[5px] border border-zinc-800 shadow-md space-y-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 block font-display">
              AHORRO EN DIÉSEL
            </span>
            <div className="text-3xl font-black text-amber-400 font-mono">
              {formatPrice(Math.max(0, fuelSavingsUsd))}
            </div>
            <div className="text-[10px] text-zinc-400 space-y-0.5 uppercase">
              <div>TMD: <strong className="text-zinc-200">{selectedMachine.fuelBurnGalPerHour} GAL/HR</strong></div>
              <div>COMPETIDOR: <strong className="text-rose-400">{competitorMachine.fuelBurnGalPerHour} GAL/HR</strong></div>
            </div>
          </div>

          <div className="bg-zinc-900 p-5 rounded-[5px] border border-zinc-800 shadow-md space-y-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-cyan-400 block font-display">
              COSTO / HORA EFECTIVA
            </span>
            <div className="text-3xl font-black text-white font-mono">
              {formatPrice(selectedResult.costPerHourUsd)} <span className="text-xs font-normal text-zinc-400">/ HR</span>
            </div>
            <p className="text-[10px] text-zinc-400 uppercase leading-relaxed">
              Vs. <strong className="text-rose-400">{formatPrice(competitorResult.costPerHourUsd)} / HR</strong> en competidor (diferencia de {formatPrice(Math.max(0, competitorResult.costPerHourUsd - selectedResult.costPerHourUsd))}/hr).
            </p>
          </div>

          <div className="bg-zinc-900 p-5 rounded-[5px] border border-zinc-800 shadow-md space-y-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block font-display">
              VALOR RESIDUAL (AÑO {years})
            </span>
            <div className="text-3xl font-black text-white font-mono">
              {formatPrice(selectedMachine.initialPriceUsd * (selectedMachine.residualValue5YrsPercent / 100))}
            </div>
            <p className="text-[10px] text-zinc-400 uppercase leading-relaxed">
              Retención del <strong className="text-zinc-200">{selectedMachine.residualValue5YrsPercent}%</strong> respaldada por disponibilidad continua de repuestos TMD.
            </p>
          </div>
        </div>

        {/* Recharts Graphical Breakdown */}
        <div className="bg-zinc-900 rounded-[5px] p-5 sm:p-6 shadow-xl border border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 mb-4 gap-2">
            <div>
              <h3 className="text-sm font-black text-white uppercase font-display">
                DESGLOSE COMPARATIVO ({years} AÑOS / {(annualHours * years).toLocaleString()} HORAS)
              </h3>
              <p className="text-[10px] text-zinc-400 uppercase">
                {selectedMachine.name} vs. {competitorMachine.name}
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] uppercase font-bold">
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-[1px]"></span> {selectedMachine.name}
              </span>
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2.5 h-2.5 bg-zinc-600 rounded-[1px]"></span> {competitorMachine.name}
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 15, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="category" tick={{ fill: '#a1a1aa', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis tick={{ fill: '#a1a1aa', fontSize: 10, fontFamily: 'monospace' }} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(val: any) => [`$${Number(val).toLocaleString()} USD`, '']}
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '4px', color: '#fff', fontFamily: 'monospace', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px', textTransform: 'uppercase' }} />
                <Bar dataKey={selectedMachine.name} fill="#f59e0b" radius={[2, 2, 0, 0]} />
                <Bar dataKey={competitorMachine.name} fill="#71717a" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Financial Summary Table */}
        <div className="bg-zinc-900 rounded-[5px] p-5 shadow-xl border border-zinc-800 space-y-3">
          <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider font-display">
            AUDITORÍA COMPARATIVA LÍNEA POR LÍNEA (USD)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] text-zinc-400 uppercase">
                  <th className="py-2 pr-4">Concepto de Costo Operativo</th>
                  <th className="py-2 px-4 text-right text-amber-400">{selectedMachine.name}</th>
                  <th className="py-2 px-4 text-right text-zinc-400">{competitorMachine.name}</th>
                  <th className="py-2 pl-4 text-right text-emerald-400">Diferencial a Favor TMD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
                <tr>
                  <td className="py-2.5 pr-4 text-zinc-300">Precio Inicial de Adquisición (FOB/CIF)</td>
                  <td className="py-2.5 px-4 text-right text-white">{formatPrice(selectedMachine.initialPriceUsd)}</td>
                  <td className="py-2.5 px-4 text-right text-zinc-400">{formatPrice(competitorMachine.initialPriceUsd)}</td>
                  <td className="py-2.5 pl-4 text-right text-emerald-400 font-bold">
                    {formatPrice(competitorMachine.initialPriceUsd - selectedMachine.initialPriceUsd)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 text-zinc-300">Combustible Diésel Acumulado ({fuelPriceUsd.toFixed(2)} USD/gal)</td>
                  <td className="py-2.5 px-4 text-right text-white">{formatPrice(selectedResult.totalFuelCostUsd)}</td>
                  <td className="py-2.5 px-4 text-right text-zinc-400">{formatPrice(competitorResult.totalFuelCostUsd)}</td>
                  <td className="py-2.5 pl-4 text-right text-emerald-400 font-bold">
                    +{formatPrice(competitorResult.totalFuelCostUsd - selectedResult.totalFuelCostUsd)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 text-zinc-300">Mantenimiento Preventivo & Kits de Filtros</td>
                  <td className="py-2.5 px-4 text-right text-white">{formatPrice(selectedResult.totalMaintenanceCostUsd)}</td>
                  <td className="py-2.5 px-4 text-right text-zinc-400">{formatPrice(competitorResult.totalMaintenanceCostUsd)}</td>
                  <td className="py-2.5 pl-4 text-right text-emerald-400 font-bold">
                    +{formatPrice(competitorResult.totalMaintenanceCostUsd - selectedResult.totalMaintenanceCostUsd)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 text-zinc-300">Tren de Rodaje, Orugas y Neumáticos</td>
                  <td className="py-2.5 px-4 text-right text-white">{formatPrice(selectedResult.totalTireTrackCostUsd)}</td>
                  <td className="py-2.5 px-4 text-right text-zinc-400">{formatPrice(competitorResult.totalTireTrackCostUsd)}</td>
                  <td className="py-2.5 pl-4 text-right text-emerald-400 font-bold">
                    +{formatPrice(competitorResult.totalTireTrackCostUsd - selectedResult.totalTireTrackCostUsd)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 text-zinc-300">Depreciación Neta (Costo menos Reventa al Año {years})</td>
                  <td className="py-2.5 px-4 text-right text-white">{formatPrice(selectedResult.depreciationCostUsd)}</td>
                  <td className="py-2.5 px-4 text-right text-zinc-400">{formatPrice(competitorResult.depreciationCostUsd)}</td>
                  <td className="py-2.5 pl-4 text-right text-emerald-400 font-bold">
                    {formatPrice(competitorResult.depreciationCostUsd - selectedResult.depreciationCostUsd)}
                  </td>
                </tr>
                <tr className="bg-zinc-950/80 font-bold">
                  <td className="py-3 pr-4 text-amber-400 uppercase">Costo Total de Propiedad TCO ({years} Años)</td>
                  <td className="py-3 px-4 text-right text-amber-400 text-sm">{formatPrice(selectedResult.totalTcoUsd)}</td>
                  <td className="py-3 px-4 text-right text-zinc-300 text-sm">{formatPrice(competitorResult.totalTcoUsd)}</td>
                  <td className="py-3 pl-4 text-right text-emerald-400 text-sm font-black">
                    +{formatPrice(totalSavingsUsd)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
