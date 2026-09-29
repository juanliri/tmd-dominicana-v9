import React, { useState, useMemo } from 'react';
import { 
  Leaf, 
  Trees, 
  Wind, 
  CheckCircle, 
  BarChart3, 
  Sparkles, 
  Download, 
  Award, 
  Fuel, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { SAMPLE_ECO_MACHINES, KG_CO2_PER_DIESEL_GALLON, TREES_PER_TON_CO2_PER_YEAR } from '../../data/carbonData';
import { EcoFleetMachineInput, CarbonFootprintReport } from '../../types';

interface EcoCarbonCalculatorViewProps {
  onNavigate?: (route: string) => void;
}

export const EcoCarbonCalculatorView: React.FC<EcoCarbonCalculatorViewProps> = ({ onNavigate }) => {
  const [fleetList, setFleetList] = useState<EcoFleetMachineInput[]>(SAMPLE_ECO_MACHINES);

  // New machine input
  const [newModel, setNewModel] = useState('');
  const [newTier, setNewTier] = useState<EcoFleetMachineInput['tierStandard']>('Tier 3');
  const [newHours, setNewHours] = useState(1800);
  const [newBurnRate, setNewBurnRate] = useState(3.5);

  const report: CarbonFootprintReport = useMemo(() => {
    let totalGallons = 0;

    fleetList.forEach(m => {
      totalGallons += m.annualHours * m.fuelBurnRateGalHr;
    });

    const totalCo2Kg = totalGallons * KG_CO2_PER_DIESEL_GALLON;
    const totalCo2Tons = Number((totalCo2Kg / 1000).toFixed(1));

    // Baseline calculation comparing against legacy Tier 1 / Tier 2 (uses ~25% more fuel)
    const baselineGallons = totalGallons * 1.25;
    const baselineCo2Tons = (baselineGallons * KG_CO2_PER_DIESEL_GALLON) / 1000;
    const ecoSavingsTons = Number((baselineCo2Tons - totalCo2Tons).toFixed(1));
    const trees = Math.round(totalCo2Tons * TREES_PER_TON_CO2_PER_YEAR);

    let complianceScore: CarbonFootprintReport['mimarenaComplianceScore'] = 'Excelente (Clase A)';
    if (fleetList.some(m => m.tierStandard === 'Tier 2')) {
      complianceScore = 'Cumple (Clase B)';
    }

    return {
      totalAnnualFuelGallons: Math.round(totalGallons),
      totalCo2EmissionsTons: totalCo2Tons,
      ecoSavingsVersusOldGenTons: ecoSavingsTons,
      treesToOffset: trees,
      mimarenaComplianceScore: complianceScore
    };
  }, [fleetList]);

  const handleAddMachine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel.trim()) return;

    const newItem: EcoFleetMachineInput = {
      id: `eco-${Date.now()}`,
      model: newModel,
      tierStandard: newTier,
      annualHours: newHours,
      fuelBurnRateGalHr: newBurnRate
    };

    setFleetList(prev => [...prev, newItem]);
    setNewModel('');
  };

  const handleRemoveMachine = (id: string) => {
    setFleetList(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors pb-24">
      {/* Top Banner */}
      <div className="bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 text-white border-b border-zinc-800">
        <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-12 md:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Leaf className="w-3.5 h-3.5" />
              <span>Sostenibilidad & Cumplimiento Ambiental MIMARENA RD</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
              Calculadora de <span className="text-emerald-500">Huella de Carbono & Eco-Eficiencia</span>
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              Mida el impacto ambiental y las emisiones de CO₂ de su parque de maquinaria pesada. Certifique la reducción de gases de efecto invernadero para licitaciones públicas y proyectos con financiamiento internacional (BID / Banco Mundial).
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 -mt-6">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-md">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Wind className="w-4 h-4 text-emerald-500" />
              <span>Emisiones Anuales</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
              {report.totalCo2EmissionsTons.toLocaleString()} <span className="text-xs text-zinc-400">t CO₂eq</span>
            </div>
            <span className="text-[11px] text-zinc-500 mt-1 block">
              {report.totalAnnualFuelGallons.toLocaleString()} galones consumidos
            </span>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-md">
            <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>CO₂ Evitado vs Tier 2</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-500">
              -{report.ecoSavingsVersusOldGenTons.toLocaleString()} <span className="text-xs text-zinc-400">t CO₂</span>
            </div>
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Por motores JCB Ecomax y LiuGong
            </span>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-md">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Trees className="w-4 h-4 text-emerald-600" />
              <span>Árboles para Compensar</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
              {report.treesToOffset.toLocaleString()} <span className="text-xs text-zinc-400">árboles</span>
            </div>
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Equivalente de absorción forestal anual
            </span>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-5 shadow-md">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" />
              <span>Clasificación MIMARENA</span>
            </div>
            <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
              {report.mimarenaComplianceScore}
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1 block">
              Apto para proyectos con norma ISO 14001
            </span>
          </div>
        </div>

        {/* Fleet Composition Table & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Machines Table (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-4">
                <div>
                  <h3 className="text-base font-black text-zinc-900 dark:text-white">
                    Parque de Maquinaria en Evaluación ({fleetList.length} Equipos)
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Cálculo basado en factor de emisión EPA de 10.18 kg CO₂ por galón de combustible diésel
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {fleetList.map(m => {
                  const machineGallons = m.annualHours * m.fuelBurnRateGalHr;
                  const machineCo2 = (machineGallons * KG_CO2_PER_DIESEL_GALLON) / 1000;

                  return (
                    <div
                      key={m.id}
                      className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-zinc-900 dark:text-white text-sm">{m.model}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 font-bold text-[10px]">
                            {m.tierStandard}
                          </span>
                        </div>
                        <div className="text-zinc-500 mt-1">
                          {m.annualHours.toLocaleString()} hrs/año • {m.fuelBurnRateGalHr} gal/h = {machineGallons.toLocaleString()} galones/año
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="text-right">
                          <span className="text-zinc-400 text-[10px] uppercase block">Emisión Anual</span>
                          <strong className="text-sm font-black text-zinc-900 dark:text-white">{machineCo2.toFixed(1)} t CO₂</strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMachine(m.id)}
                          className="text-zinc-400 hover:text-rose-500 p-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Add Machine Form (4 Cols) */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white pb-3 border-b border-zinc-100 dark:border-zinc-800">
                Añadir Equipo a la Flota
              </h3>

              <form onSubmit={handleAddMachine} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Modelo del Equipo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Rodillo LiuGong 6114E"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Estándar de Emisiones
                  </label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold"
                  >
                    <option value="Tier 2">Tier 2 (Convencional antiguo)</option>
                    <option value="Tier 3">Tier 3 (JCB Dieselmax estándar RD)</option>
                    <option value="Tier 4 Final">Tier 4 Final (Bajo NOx y partículas)</option>
                    <option value="Stage V">Stage V (Ultra-eficiente / AdBlue)</option>
                    <option value="Eléctrico">Eléctrico (Cero emisiones directas)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Horas Anuales
                    </label>
                    <input
                      type="number"
                      value={newHours}
                      onChange={(e) => setNewHours(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Galones / Hora
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newBurnRate}
                      onChange={(e) => setNewBurnRate(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-wider text-xs transition-all shadow-md cursor-pointer mt-2"
                >
                  Agregar a la Matriz
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
