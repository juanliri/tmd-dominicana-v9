import React, { useState } from 'react';
import { 
  Leaf, 
  Trees, 
  ShieldCheck, 
  Download, 
  FileText, 
  Award, 
  Sparkles, 
  BarChart3, 
  Plus, 
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { SAMPLE_ECO_MACHINES, KG_CO2_PER_DIESEL_GALLON, TREES_PER_TON_CO2_PER_YEAR } from '../../data/carbonData';
import { EcoFleetMachineInput, CarbonFootprintReport } from '../../types';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend 
} from 'recharts';

interface CarbonFootprintViewProps {
  onNavigate?: (route: string) => void;
}

export const CarbonFootprintView: React.FC<CarbonFootprintViewProps> = ({ onNavigate }) => {
  const [fleetMachines, setFleetMachines] = useState<EcoFleetMachineInput[]>(SAMPLE_ECO_MACHINES);
  const [newModel, setNewModel] = useState('Rodillo Ammann ASC 110 (Tier 3)');
  const [newTier, setNewTier] = useState<'Tier 2' | 'Tier 3' | 'Tier 4 Final' | 'Stage V' | 'Eléctrico'>('Tier 3');
  const [newHours, setNewHours] = useState<number>(1500);
  const [newBurnRate, setNewBurnRate] = useState<number>(3.2);

  const handleAddMachine = (e: React.FormEvent) => {
    e.preventDefault();
    const item: EcoFleetMachineInput = {
      id: `eco-${Date.now()}`,
      model: newModel,
      tierStandard: newTier,
      annualHours: newHours,
      fuelBurnRateGalHr: newBurnRate
    };
    setFleetMachines(prev => [...prev, item]);
  };

  const handleRemoveMachine = (id: string) => {
    setFleetMachines(prev => prev.filter(m => m.id !== id));
  };

  // Calculations
  const calculateReport = (): CarbonFootprintReport => {
    let totalGallons = 0;
    let oldGenGallons = 0;

    fleetMachines.forEach(m => {
      const gallons = m.annualHours * m.fuelBurnRateGalHr;
      totalGallons += gallons;

      // Comparative older tier equivalent burn (+25%)
      const oldBurn = m.tierStandard === 'Tier 4 Final' || m.tierStandard === 'Stage V'
        ? m.fuelBurnRateGalHr * 1.3
        : m.tierStandard === 'Tier 3'
        ? m.fuelBurnRateGalHr * 1.15
        : m.fuelBurnRateGalHr;

      oldGenGallons += m.annualHours * oldBurn;
    });

    const totalCo2Kg = totalGallons * KG_CO2_PER_DIESEL_GALLON;
    const totalCo2Tons = totalCo2Kg / 1000;

    const oldCo2Kg = oldGenGallons * KG_CO2_PER_DIESEL_GALLON;
    const oldCo2Tons = oldCo2Kg / 1000;

    const ecoSavingsTons = Math.max(0, oldCo2Tons - totalCo2Tons);
    const treesToOffset = Math.round(totalCo2Tons * TREES_PER_TON_CO2_PER_YEAR);

    let mimarenaComplianceScore: 'Excelente (Clase A)' | 'Cumple (Clase B)' | 'Requiere Renovación' = 'Cumple (Clase B)';
    if (ecoSavingsTons > 15 || fleetMachines.every(m => m.tierStandard !== 'Tier 2')) {
      mimarenaComplianceScore = 'Excelente (Clase A)';
    }

    return {
      totalAnnualFuelGallons: Math.round(totalGallons),
      totalCo2EmissionsTons: Number(totalCo2Tons.toFixed(1)),
      ecoSavingsVersusOldGenTons: Number(ecoSavingsTons.toFixed(1)),
      treesToOffset,
      mimarenaComplianceScore
    };
  };

  const report = calculateReport();

  // Pie chart data
  const pieData = fleetMachines.map(m => ({
    name: m.model,
    value: Math.round((m.annualHours * m.fuelBurnRateGalHr * KG_CO2_PER_DIESEL_GALLON) / 1000)
  }));

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 transition-colors pb-24">
      {/* Top Banner */}
      <div className="bg-zinc-900 border-b border-zinc-800 text-white relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-600" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[2px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono uppercase tracking-wider mb-3">
              <Leaf className="w-3.5 h-3.5" />
              <span>Eco-Eficiencia & Auditoría Ambiental MIMARENA RD • Norma TMD-ECO</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white mb-3">
              Calculadora de <span className="text-emerald-400">Huella de Carbono</span> en Obra
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans max-w-2xl">
              Evalúe las emisiones anuales de CO₂ de su parque de maquinaria pesada, certifique la reducción de emisiones con motores Tier 3 / Stage V y cumpla con los pliegos ambientales de licitaciones públicas y privadas.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5">
        
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 p-4 rounded-[5px] border border-zinc-800 shadow-2xl">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Consumo Total Combustible
            </span>
            <div className="text-2xl font-mono font-bold text-white mb-1">
              {report.totalAnnualFuelGallons.toLocaleString()} <span className="text-xs font-mono text-zinc-500">Gal/Año</span>
            </div>
            <span className="text-[11px] text-zinc-500 font-sans">Diésel bajo en azufre</span>
          </div>

          <div className="bg-zinc-900 p-4 rounded-[5px] border border-zinc-800 shadow-2xl">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 block mb-1">
              Emisiones Anuales de CO₂
            </span>
            <div className="text-2xl font-mono font-bold text-rose-400 mb-1">
              {report.totalCo2EmissionsTons} <span className="text-xs font-mono text-zinc-500">Ton CO₂e</span>
            </div>
            <span className="text-[11px] text-zinc-500 font-sans">Factor EPA: 10.18 kg/gal</span>
          </div>

          <div className="bg-zinc-900 p-4 rounded-[5px] border border-zinc-800 shadow-2xl">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block mb-1">
              Ahorro Ecológico vs Tier 2
            </span>
            <div className="text-2xl font-mono font-bold text-emerald-400 mb-1">
              -{report.ecoSavingsVersusOldGenTons} <span className="text-xs font-mono text-zinc-500">Ton Evitadas</span>
            </div>
            <span className="text-[11px] text-zinc-500 font-sans">Common-rail TMD & Stage V</span>
          </div>

          <div className="bg-zinc-900 p-4 rounded-[5px] border border-emerald-500/40 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-400" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block mb-1 flex items-center gap-1.5">
              <Trees className="w-3.5 h-3.5" />
              <span>Mitigación / Reforestación</span>
            </span>
            <div className="text-2xl font-mono font-bold text-emerald-300 mb-1">
              {report.treesToOffset.toLocaleString()} <span className="text-xs font-mono text-emerald-400/80">Árboles</span>
            </div>
            <span className="text-[11px] text-zinc-400 font-sans">Para balance neutral 100%</span>
          </div>
        </div>

        {/* Fleet Composition & Machine Addition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          
          {/* Machines Table & Addition Form (7 cols) */}
          <div className="lg:col-span-7 bg-zinc-900 rounded-[5px] p-5 sm:p-6 shadow-2xl border border-zinc-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold uppercase tracking-tight text-white">
                Inventario de Flota para Auditoría Verde
              </h3>
              <span className="px-2 py-0.5 rounded-[2px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-[10px] uppercase">
                {fleetMachines.length} Equipos Registrados
              </span>
            </div>

            <div className="space-y-2">
              {fleetMachines.map(m => {
                const machineCo2Tons = ((m.annualHours * m.fuelBurnRateGalHr * KG_CO2_PER_DIESEL_GALLON) / 1000).toFixed(1);

                return (
                  <div
                    key={m.id}
                    className="p-3 rounded-[3px] bg-zinc-950 border border-zinc-800 text-xs flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span className="uppercase text-xs">{m.model}</span>
                        <span className="px-1.5 py-0.5 rounded-[2px] bg-zinc-900 border border-zinc-700 text-[10px] font-mono text-zinc-300">
                          {m.tierStandard}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400 mt-1">
                        {m.annualHours} hrs/año • {m.fuelBurnRateGalHr} Gal/hr • <strong className="text-rose-400">{machineCo2Tons} Ton CO₂</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveMachine(m.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 rounded-[2px] transition-colors cursor-pointer"
                      title="Eliminar equipo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Add Machine Form */}
            <form onSubmit={handleAddMachine} className="pt-4 border-t border-zinc-800 space-y-3 text-xs font-sans">
              <span className="font-mono font-bold uppercase text-[11px] tracking-wider text-zinc-300 block">
                Agregar Máquina a la Evaluación:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Modelo / Equipo</label>
                  <input
                    type="text"
                    required
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-xs focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Norma de Emisión</label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-xs focus:border-emerald-400 focus:outline-none cursor-pointer"
                  >
                    <option value="Stage V">Stage V (Ultra Baja Emisión)</option>
                    <option value="Tier 4 Final">Tier 4 Final</option>
                    <option value="Tier 3">Tier 3 (Estándar República Dominicana)</option>
                    <option value="Tier 2">Tier 2 (Maquinaria Antigua)</option>
                    <option value="Eléctrico">100% Eléctrico / Cero Emisión</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Horas Operación / Año</label>
                  <input
                    type="number"
                    min={100}
                    max={6000}
                    value={newHours}
                    onChange={(e) => setNewHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-xs focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Consumo (Gal/Hora)</label>
                  <input
                    type="number"
                    step={0.1}
                    min={0.5}
                    max={20}
                    value={newBurnRate}
                    onChange={(e) => setNewBurnRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-xs focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-[2px] bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Incorporar Equipo a la Flota</span>
              </button>
            </form>
          </div>

          {/* Pie Breakdown & MIMARENA Certification (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-zinc-900 rounded-[5px] p-5 shadow-2xl border border-zinc-800">
              <h3 className="text-base font-bold uppercase tracking-tight text-white mb-1">
                Distribución de Emisiones por Máquina
              </h3>
              <p className="text-xs text-zinc-400 font-sans mb-3">
                Toneladas de CO₂ generadas anualmente
              </p>

              <div className="h-64 w-full p-2 bg-zinc-950 border border-zinc-800 rounded-[3px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      label={(entry) => `${entry.value} Ton`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '3px', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Compliance Badge Card */}
            <div className="p-5 rounded-[5px] bg-zinc-900 border border-zinc-800 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-400" />
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-[2px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block">Clasificación Ambiental:</span>
                  <div className="text-base font-mono font-bold text-emerald-400">{report.mimarenaComplianceScore}</div>
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed mb-4 font-sans">
                Su parque de maquinaria cumple con los estándares exigidos para contratos de infraestructura del Ministerio de Medio Ambiente y Recursos Naturales (MIMARENA).
              </p>

              <a
                href={`https://wa.me/18095601234?text=Hola%20TMD,%20solicito%20el%20Certificado%20Oficial%20de%20Eco-Eficiencia%20y%20Huella%20de%20Carbono%20para%20mi%20flota%20de%20${fleetMachines.length}%20equipos`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Solicitar Certificado Sellado para Licitación</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
