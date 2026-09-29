import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Fuel, 
  DollarSign, 
  TrendingDown, 
  BarChart3, 
  Sparkles, 
  CheckCircle2, 
  Download, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { DEFAULT_TCO_PROFILES, FUEL_PRICE_PER_GALLON_USD } from '../../data/tcoData';
import { TcoMachineProfile, TcoComparisonResult } from '../../types';
import { useCart } from '../../context/CartContext';
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
  const { formatPrice, currency, showToast } = useCart();
  
  // Interactive Slider States
  const [annualOperatingHours, setAnnualOperatingHours] = useState<number>(1800); // Typical Dominican construction shift
  const [fuelPricePerGallon, setFuelPricePerGallon] = useState<number>(FUEL_PRICE_PER_GALLON_USD);
  const [ownershipYears, setOwnershipYears] = useState<number>(5);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('tco-jcb-3cx');
  const [operatorHourlyWage, setOperatorHourlyWage] = useState<number>(4.50); // ~$250-300 DOP / hr

  const activeMachine = useMemo(() => {
    return DEFAULT_TCO_PROFILES.find(p => p.id === selectedProfileId) || DEFAULT_TCO_PROFILES[0];
  }, [selectedProfileId]);

  // Calculate detailed TCO for all profiles to generate comparison
  const calculatedResults: (TcoComparisonResult & { profile: TcoMachineProfile })[] = useMemo(() => {
    const totalLifetimeHours = annualOperatingHours * ownershipYears;

    return DEFAULT_TCO_PROFILES.map(profile => {
      const totalFuelGallons = profile.fuelBurnGalPerHour * totalLifetimeHours;
      const totalFuelCost = totalFuelGallons * fuelPricePerGallon;
      const totalMaintenanceCost = profile.maintenanceCostPerHourUsd * totalLifetimeHours;
      const totalTireTrackCost = profile.undercarriageTireCostPerHourUsd * totalLifetimeHours;
      
      // Depreciation
      const residualValue = profile.initialPriceUsd * (profile.residualValue5YrsPercent / 100);
      const depreciationCost = profile.initialPriceUsd - residualValue;
      const totalOperatorCost = operatorHourlyWage * totalLifetimeHours;

      const totalTco = totalFuelCost + totalMaintenanceCost + totalTireTrackCost + depreciationCost + totalOperatorCost;
      const costPerHour = totalTco / totalLifetimeHours;

      return {
        machineName: profile.name,
        annualHours: annualOperatingHours,
        years: ownershipYears,
        totalFuelCostUsd: Math.round(totalFuelCost),
        totalMaintenanceCostUsd: Math.round(totalMaintenanceCost),
        totalTireTrackCostUsd: Math.round(totalTireTrackCost),
        depreciationCostUsd: Math.round(depreciationCost),
        totalTcoUsd: Math.round(totalTco),
        costPerHourUsd: Number(costPerHour.toFixed(2)),
        profile
      };
    });
  }, [annualOperatingHours, fuelPricePerGallon, ownershipYears, operatorHourlyWage]);

  const activeResult = useMemo(() => {
    return calculatedResults.find(r => r.profile.id === selectedProfileId) || calculatedResults[0];
  }, [calculatedResults, selectedProfileId]);

  // Benchmark difference compared to generic competitor
  const genericCompetitor = calculatedResults.find(r => r.profile.id === 'tco-competitor-standard') || calculatedResults[calculatedResults.length - 1];
  const fuelSavingsVsGeneric = genericCompetitor.totalFuelCostUsd - activeResult.totalFuelCostUsd;
  const netTcoSavingsVsGeneric = genericCompetitor.totalTcoUsd - activeResult.totalTcoUsd;

  // Chart data formatting
  const chartData = useMemo(() => {
    return calculatedResults.map(r => ({
      name: r.profile.model,
      'Combustible Diésel': r.totalFuelCostUsd,
      'Mantenimiento & Filtros': r.totalMaintenanceCostUsd,
      'Desgaste Tren / Gomas': r.totalTireTrackCostUsd,
      'Depreciación Neta': r.depreciationCostUsd
    }));
  }, [calculatedResults]);

  const handleExportReport = () => {
    showToast(`Informe ejecutivo TCO para ${activeMachine.name} (${ownershipYears} años) preparado para descarga.`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 transition-colors pb-24" id="tco-calculator-container">
      {/* Hero Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 text-white relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />
        <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-10 md:py-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[2px] bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[11px] font-mono uppercase tracking-wider mb-3">
              <Calculator className="w-3.5 h-3.5" />
              <span>Simulador Financiero & Retorno de Inversión (ROI) • Norma TMD-TCO</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white mb-3">
              Calculadora de <span className="text-amber-400">Costo Total de Propiedad (TCO)</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans max-w-2xl">
              El costo real de un equipo pesado no es solo el desembolso inicial: el consumo de combustible diésel y el valor residual determinan más del 70% de la rentabilidad del activo. Proyecte el costo horario real por metro cúbico en República Dominicana.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 -mt-5">
        
        {/* Main Grid: Parameter Controls & Output Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Parameter Controls (4 Cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-zinc-900 rounded-[5px] p-5 border border-zinc-800 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                  Parámetros de Operación
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[2px] bg-amber-400/10 text-amber-400 border border-amber-400/30 uppercase">
                  Mercado RD
                </span>
              </div>

              {/* Machine Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-2">
                  Seleccionar Equipo a Evaluar:
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {DEFAULT_TCO_PROFILES.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProfileId(p.id)}
                      className={`p-3 rounded-[3px] text-left transition-all border text-xs cursor-pointer flex items-center justify-between ${
                        selectedProfileId === p.id
                          ? 'bg-amber-400 text-black border-amber-400 font-black shadow-xs'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold uppercase tracking-wide text-xs">{p.name}</div>
                        <div className={`text-[10px] font-mono mt-0.5 ${selectedProfileId === p.id ? 'text-black/80 font-bold' : 'text-zinc-500'}`}>
                          {p.category} • {formatPrice(p.initialPriceUsd)}
                        </div>
                      </div>
                      <span className={`text-[11px] font-mono font-bold ${selectedProfileId === p.id ? 'text-black' : 'text-amber-400'}`}>
                        {p.fuelBurnGalPerHour} gal/h
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Annual Hours Slider */}
              <div className="space-y-2 pt-3 border-t border-zinc-800">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400 uppercase text-[11px]">Horas Anuales de Trabajo:</span>
                  <span className="text-amber-400 font-bold">{annualOperatingHours.toLocaleString()} hrs/año</span>
                </div>
                <input
                  type="range"
                  min="600"
                  max="3500"
                  step="50"
                  value={annualOperatingHours}
                  onChange={(e) => setAnnualOperatingHours(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-zinc-950 rounded-none border border-zinc-800"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>600h (1 turno)</span>
                  <span>1,800h (Estándar RD)</span>
                  <span>3,500h (Cantera 24/7)</span>
                </div>
              </div>

              {/* Diesel Fuel Price Slider */}
              <div className="space-y-2 pt-3 border-t border-zinc-800">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400 uppercase text-[11px]">Precio Diésel (USD / Galón):</span>
                  <span className="text-amber-400 font-bold">${fuelPricePerGallon.toFixed(2)} USD <span className="text-zinc-500 text-[10px]">(~RD${(fuelPricePerGallon * 60).toFixed(0)})</span></span>
                </div>
                <input
                  type="range"
                  min="3.00"
                  max="6.50"
                  step="0.05"
                  value={fuelPricePerGallon}
                  onChange={(e) => setFuelPricePerGallon(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-zinc-950 rounded-none border border-zinc-800"
                />
              </div>

              {/* Ownership Horizon Slider */}
              <div className="space-y-2 pt-3 border-t border-zinc-800">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400 uppercase text-[11px]">Horizonte de Evaluación:</span>
                  <span className="text-amber-400 font-bold">{ownershipYears} Años</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[3, 5, 7, 10].map(y => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setOwnershipYears(y)}
                      className={`py-1.5 rounded-[2px] text-xs font-mono font-bold transition-all cursor-pointer border ${
                        ownershipYears === y
                          ? 'bg-amber-400 text-black border-amber-400 font-bold'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      {y}A
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Direct Action Box */}
            <div className="bg-zinc-900 rounded-[5px] p-5 border border-zinc-800 text-white space-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-400" />
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Asesoría de Flotas TMD</span>
              </div>
              <h3 className="text-sm font-bold uppercase tracking-tight text-white leading-snug">
                ¿Desea estructurar una renovación de flota completa?
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Nuestros ingenieros de aplicaciones realizan estudios de ciclo en mina y cantera para optimizar la capacidad de acarreo por hora.
              </p>
              <button
                type="button"
                onClick={handleExportReport}
                className="w-full py-2.5 px-3 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-black" />
                <span>Descargar Estudio TCO (PDF)</span>
              </button>
            </div>
          </div>

          {/* Right Column: Output Metrics & Comparative Visuals (8 Cols) */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* Top Score Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-zinc-900 rounded-[5px] p-4 border border-zinc-800 shadow-md">
                <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 tracking-wider block mb-1">
                  Costo Total de Propiedad ({ownershipYears} Años)
                </span>
                <div className="text-2xl font-mono font-bold text-white">
                  {formatPrice(activeResult.totalTcoUsd)}
                </div>
                <span className="text-[11px] text-zinc-500 font-sans mt-1 block">
                  Incluye combustible, filtros y depreciación
                </span>
              </div>

              <div className="bg-zinc-900 rounded-[5px] p-4 border border-zinc-800 shadow-md">
                <span className="text-[10px] font-mono font-bold uppercase text-amber-400 tracking-wider block mb-1">
                  Costo Operativo por Hora
                </span>
                <div className="text-2xl font-mono font-bold text-amber-400">
                  ${activeResult.costPerHourUsd.toFixed(2)} <span className="text-xs text-zinc-500">USD/hr</span>
                </div>
                <span className="text-[11px] text-zinc-400 font-mono mt-1 block">
                  ~RD$ {(activeResult.costPerHourUsd * 60).toFixed(0)} / hr operativa
                </span>
              </div>

              <div className="bg-zinc-900 rounded-[5px] p-4 border border-zinc-800 shadow-md">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 tracking-wider block mb-1">
                  Ahorro en Diésel vs Tier 2
                </span>
                <div className="text-2xl font-mono font-bold text-emerald-400">
                  {fuelSavingsVsGeneric > 0 ? `+${formatPrice(fuelSavingsVsGeneric)}` : '$0'}
                </div>
                <span className="text-[11px] text-zinc-400 font-sans mt-1 block">
                  Tecnología Eco-Hydraulics TMD
                </span>
              </div>
            </div>

            {/* Breakdown Bars & Details */}
            <div className="bg-zinc-900 rounded-[5px] p-5 sm:p-6 border border-zinc-800 space-y-5 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-2">
                <div>
                  <h3 className="text-base font-bold uppercase tracking-tight text-white">
                    Distribución de Costos: {activeMachine.name}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400">
                    Proyección acumulada sobre {(annualOperatingHours * ownershipYears).toLocaleString()} horas de ciclo activo
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400 px-2 py-1 rounded-[2px] bg-amber-400/10 border border-amber-400/30 uppercase">
                  {activeMachine.residualValue5YrsPercent}% Valor Resale
                </span>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                    <Fuel className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-mono uppercase text-[10px]">Diésel Total</span>
                  </div>
                  <div className="text-base font-mono font-bold text-white">
                    {formatPrice(activeResult.totalFuelCostUsd)}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {Math.round((activeResult.totalFuelCostUsd / activeResult.totalTcoUsd) * 100)}% del total
                  </span>
                </div>

                <div className="p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                    <DollarSign className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-mono uppercase text-[10px]">Mantenimiento</span>
                  </div>
                  <div className="text-base font-mono font-bold text-white">
                    {formatPrice(activeResult.totalMaintenanceCostUsd)}
                  </div>
                  <span className="text-[10px] font-sans text-zinc-500">
                    Filtros y fluidos OEM
                  </span>
                </div>

                <div className="p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                    <span className="font-mono uppercase text-[10px]">Depreciación Neta</span>
                  </div>
                  <div className="text-base font-mono font-bold text-white">
                    {formatPrice(activeResult.depreciationCostUsd)}
                  </div>
                  <span className="text-[10px] font-sans text-zinc-500">
                    Inicial menos resale
                  </span>
                </div>

                <div className="p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-mono uppercase text-[10px]">Tren / Neumáticos</span>
                  </div>
                  <div className="text-base font-mono font-bold text-white">
                    {formatPrice(activeResult.totalTireTrackCostUsd)}
                  </div>
                  <span className="text-[10px] font-sans text-zinc-500">
                    Orugas o gomas HD
                  </span>
                </div>
              </div>

              {/* Comparative Recharts Chart */}
              <div className="pt-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-3">
                  Comparativa de Costo Total (TCO) entre Modelos (USD)
                </span>
                <div className="h-64 sm:h-72 w-full p-2 bg-zinc-950 border border-zinc-800 rounded-[3px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="#52525b" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#a1a1aa' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                      <Tooltip 
                        formatter={(val: any) => [formatPrice(Number(val) || 0), '']}
                        contentStyle={{ backgroundColor: '#09090b', borderRadius: '3px', border: '1px solid #27272a', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#a1a1aa' }} />
                      <Bar dataKey="Combustible Diésel" stackId="a" fill="#f59e0b" />
                      <Bar dataKey="Mantenimiento & Filtros" stackId="a" fill="#3b82f6" />
                      <Bar dataKey="Desgaste Tren / Gomas" stackId="a" fill="#8b5cf6" />
                      <Bar dataKey="Depreciación Neta" stackId="a" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Quick Navigation to other tools */}
            <div className="p-4 rounded-[5px] bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold uppercase tracking-wide text-white">¿Desea reducir aún más su costo de mantenimiento?</div>
                  <div className="text-zinc-400">Contrate una póliza de servicio PMA Gold con telemetría IoT LiveLink™ incluida.</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('#/pma-contracts')}
                className="px-3.5 py-2 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold uppercase tracking-wider shrink-0 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Ver Planes PMA</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
