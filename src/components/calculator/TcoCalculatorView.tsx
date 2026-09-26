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
  const [selectedProfileId, setSelectedProfileId] = useState<string>(DEFAULT_TCO_PROFILES[0].id);
  const [annualHours, setAnnualHours] = useState<number>(2000);
  const [years, setYears] = useState<number>(5);
  const [fuelPriceUsd, setFuelPriceUsd] = useState<number>(FUEL_PRICE_PER_GALLON_USD);

  const selectedMachine = profiles.find(p => p.id === selectedProfileId) || profiles[0];
  const competitorMachine = profiles.find(p => p.id === 'tco-competitor-standard') || profiles[3];

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

  // Chart dataset
  const chartData = [
    {
      category: 'Combustible Diésel',
      [selectedMachine.name]: Math.round(selectedResult.totalFuelCostUsd),
      'Competidor Genérico': Math.round(competitorResult.totalFuelCostUsd)
    },
    {
      category: 'Mantenimiento & Filtros',
      [selectedMachine.name]: Math.round(selectedResult.totalMaintenanceCostUsd),
      'Competidor Genérico': Math.round(competitorResult.totalMaintenanceCostUsd)
    },
    {
      category: 'Orugas / Neumáticos',
      [selectedMachine.name]: Math.round(selectedResult.totalTireTrackCostUsd),
      'Competidor Genérico': Math.round(competitorResult.totalTireTrackCostUsd)
    },
    {
      category: 'Depreciación Neta',
      [selectedMachine.name]: Math.round(selectedResult.depreciationCostUsd),
      'Competidor Genérico': Math.round(competitorResult.depreciationCostUsd)
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
                El precio de compra representa apenas el 20% del costo real. Compare consumo de diésel, retención de reventa y costo operativo por hora en República Dominicana.
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
          <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider font-display">
            PARÁMETROS OPERATIVOS DE PROYECTO
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-bold text-zinc-400 mb-1 uppercase text-[10px]">
                MODELO A EVALUAR
              </label>
              <select
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-[3px] bg-zinc-950 border border-zinc-700 text-white font-bold text-xs focus:outline-none focus:border-amber-400"
              >
                {profiles.filter(p => p.id !== 'tco-competitor-standard').map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
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
                HORIZONTE EVALUACIÓN (AÑOS)
              </label>
              <select
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-[3px] bg-zinc-950 border border-zinc-700 text-white font-bold text-xs focus:outline-none focus:border-amber-400"
              >
                <option value={3}>3 AÑOS (CICLO CORTO)</option>
                <option value={5}>5 AÑOS (ESTÁNDAR TMD)</option>
                <option value={7}>7 AÑOS (CICLO EXTENDIDO)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-zinc-400 mb-1 uppercase text-[10px]">
                PRECIO DIÉSEL (USD / GALÓN)
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900 p-5 rounded-[5px] border border-emerald-500/30 text-white shadow-lg space-y-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 block font-display">
              AHORRO NETO TOTAL ESTIMADO ({years} AÑOS)
            </span>
            <div className="text-3xl font-black text-emerald-400 font-mono">
              {formatPrice(Math.max(0, totalSavingsUsd))}
            </div>
            <p className="text-[10px] text-zinc-300 leading-relaxed uppercase">
              Diferencial positivo por inyección common-rail optimizada y menor desgaste respecto a tecnología estándar.
            </p>
          </div>

          <div className="bg-zinc-900 p-5 rounded-[5px] border border-zinc-800 shadow-md space-y-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 block font-display">
              COSTO OPERATIVO REAL / HORA ({selectedMachine.name})
            </span>
            <div className="text-3xl font-black text-white font-mono">
              {formatPrice(selectedResult.costPerHourUsd)} <span className="text-xs font-normal text-zinc-400">/ HR</span>
            </div>
            <div className="text-[10px] text-zinc-400 space-y-0.5 uppercase">
              <div>CONSUMO: <strong className="text-zinc-200">{selectedMachine.fuelBurnGalPerHour} GAL/HR</strong></div>
              <div>VS. COMPETIDOR: <strong className="text-rose-400">{competitorMachine.fuelBurnGalPerHour} GAL/HR</strong></div>
            </div>
          </div>

          <div className="bg-zinc-900 p-5 rounded-[5px] border border-zinc-800 shadow-md space-y-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block font-display">
              VALOR RESIDUAL REVENTA (AÑO {years})
            </span>
            <div className="text-3xl font-black text-white font-mono">
              {formatPrice(selectedMachine.initialPriceUsd * (selectedMachine.residualValue5YrsPercent / 100))}
            </div>
            <p className="text-[10px] text-zinc-400 uppercase leading-relaxed">
              Retención del <strong className="text-zinc-200">{selectedMachine.residualValue5YrsPercent}%</strong> del valor inicial gracias al soporte oficial de repuestos TMD en RD.
            </p>
          </div>
        </div>

        {/* Recharts Graphical Breakdown */}
        <div className="bg-zinc-900 rounded-[5px] p-5 sm:p-6 shadow-xl border border-zinc-800">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
            <div>
              <h3 className="text-sm font-black text-white uppercase font-display">
                DESGLOSE COMPARATIVO DE COSTOS TOTALES ({years} AÑOS / {(annualHours * years).toLocaleString()} HORAS)
              </h3>
              <p className="text-[10px] text-zinc-400 uppercase">
                Comparativa de costos acumulados entre tecnología TMD y competidor estándar
              </p>
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
                <Bar dataKey="Competidor Genérico" fill="#52525b" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
