import React, { useState } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  ShieldCheck, 
  Tag, 
  Clock, 
  Truck, 
  Zap, 
  ShoppingBag 
} from 'lucide-react';
import { USD_TO_DOP_RATE } from '../../../data/catalog';

interface ProRoiCalculatorProps {
  tierInfo: {
    tier: string;
    partsDiscountPercent: number;
  };
  onActivateDiscount: (active: boolean, discountPercent: number) => void;
  onNavigate: (route: string) => void;
  showToast: (msg: string) => void;
}

export const ProRoiCalculator: React.FC<ProRoiCalculatorProps> = ({
  tierInfo,
  onActivateDiscount,
  onNavigate,
  showToast
}) => {
  const [fleetSize, setFleetSize] = useState<number>(4);
  const [monthlySpendPerMachine, setMonthlySpendPerMachine] = useState<number>(850);
  const [operatingHours, setOperatingHours] = useState<number>(180);

  const partsDiscount = tierInfo.partsDiscountPercent;
  const annualPartsSpend = fleetSize * monthlySpendPerMachine * 12;
  const partsSavingsAnnual = annualPartsSpend * (partsDiscount / 100);
  const preventedDowntimeHours = fleetSize * 14;
  const downtimeSavingsAnnual = preventedDowntimeHours * 85;
  const diagnosticVisitsSavings = fleetSize * 2 * 250;
  const totalAnnualSavingsUsd = Math.round(partsSavingsAnnual + downtimeSavingsAnnual + diagnosticVisitsSavings);
  const totalAnnualSavingsDop = Math.round(totalAnnualSavingsUsd * USD_TO_DOP_RATE);
  const roiPercent = Math.round((totalAnnualSavingsUsd / (annualPartsSpend || 1)) * 100);

  return (
    <div className="space-y-6 animate-fadeIn font-mono">
      {/* Header Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black font-display uppercase tracking-tight text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            <span>Calculadora de Retorno de Inversión (ROI) para Flotas Pro</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Proyecte el impacto económico de su membresía: ahorro directo del {partsDiscount}% en repuestos genuinos, cero tiempos muertos y diagnósticos en obra.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-[2px] text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Nivel {tierInfo.tier}: -{partsDiscount}% Garantizado</span>
          </span>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Input Column */}
        <div className="lg:col-span-6 bg-zinc-900 p-6 rounded-[3px] border border-zinc-800 shadow-sm space-y-6">
          <h4 className="text-xs font-black font-display text-white uppercase tracking-wider border-b border-zinc-800 pb-2">
            Parámetros de su Flota de Maquinaria
          </h4>

          {/* Slider 1: Fleet Count */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-zinc-300">
                1. Equipos en Operación (Excavadoras, Retro, Rodillos):
              </span>
              <span className="font-mono font-black text-amber-400 text-sm">
                {fleetSize} {fleetSize === 1 ? 'Unidad' : 'Unidades'}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={25}
              value={fleetSize}
              onChange={(e) => setFleetSize(Number(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-[2px] appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>1 equipo</span>
              <span>10 equipos</span>
              <span>25 equipos</span>
            </div>
          </div>

          {/* Slider 2: Monthly Parts & Filters Spend per Unit */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-zinc-300">
                2. Consumo Mensual Promedio en Repuestos/Filtros por Equipo:
              </span>
              <span className="font-mono font-black text-amber-400 text-sm">
                US$ {monthlySpendPerMachine.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={200}
              max={3000}
              step={50}
              value={monthlySpendPerMachine}
              onChange={(e) => setMonthlySpendPerMachine(Number(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-[2px] appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>US$ 200/mes</span>
              <span>US$ 1,500/mes</span>
              <span>US$ 3,000/mes</span>
            </div>
          </div>

          {/* Slider 3: Monthly Working Hours */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-zinc-300">
                3. Horas de Operación Mensuales Promedio por Unidad:
              </span>
              <span className="font-mono font-black text-amber-400 text-sm">
                {operatingHours} hrs/mes
              </span>
            </div>
            <input
              type="range"
              min={80}
              max={300}
              step={10}
              value={operatingHours}
              onChange={(e) => setOperatingHours(Number(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-[2px] appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>80 hrs (Obra Ligera)</span>
              <span>180 hrs (Estándar)</span>
              <span>300 hrs (Doble Turno)</span>
            </div>
          </div>

          {/* Technical Note */}
          <div className="p-3.5 rounded-[3px] bg-zinc-950/70 border border-zinc-800 text-[11px] text-zinc-400 space-y-1 font-sans">
            <div className="flex items-center gap-1.5 font-bold text-zinc-200">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Criterio Técnico Certificado TMD</span>
            </div>
            <p>
              Las pérdidas por paradas no programadas se calculan a una tarifa estándar de <strong className="text-white">US$ 85/hora</strong> en proyectos de construcción civil en República Dominicana.
            </p>
          </div>
        </div>

        {/* Real-time ROI Summary Card */}
        <div className="lg:col-span-6 bg-zinc-900/90 p-6 sm:p-7 rounded-[3px] border border-amber-400/30 text-white shadow-xl flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-black font-display text-amber-400 tracking-wider">
                Resumen de Beneficio Neto Anual Pro
              </span>
              <span className="px-2.5 py-0.5 rounded-[2px] text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                +{roiPercent}% ROI
              </span>
            </div>

            <div className="mt-4">
              <span className="text-[11px] text-zinc-400 font-bold block uppercase">
                Ahorro Económico Total Proyectado:
              </span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight mt-1">
                US$ {totalAnnualSavingsUsd.toLocaleString()}
              </div>
              <div className="text-xs font-semibold text-zinc-400 mt-0.5 font-sans">
                Equivalente a <strong className="text-white font-mono">RD$ {totalAnnualSavingsDop.toLocaleString()}</strong> (Tasa: {USD_TO_DOP_RATE})
              </div>
            </div>

            {/* Financial Breakdown Table */}
            <div className="mt-6 space-y-2.5 pt-4 border-t border-zinc-800 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/60">
                <span className="text-zinc-400 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Descuento Directo ({partsDiscount}% en Facturas):</span>
                </span>
                <span className="font-mono font-bold text-white">
                  +US$ {Math.round(partsSavingsAnnual).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/60">
                <span className="text-zinc-400 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>Evitación de Tiempos Muertos ({preventedDowntimeHours}h):</span>
                </span>
                <span className="font-mono font-bold text-white">
                  +US$ {downtimeSavingsAnnual.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5">
                <span className="text-zinc-400 flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Diagnósticos Gratuitos en Obra ({fleetSize * 2} visitas):</span>
                </span>
                <span className="font-mono font-bold text-white">
                  +US$ {diagnosticVisitsSavings.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="space-y-2 pt-4 border-t border-zinc-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onActivateDiscount(true, partsDiscount);
                  showToast(`¡Descuento VIP del ${partsDiscount}% activado en su sesión! Tarifa Pro aplicada.`);
                }}
                className="py-3 px-4 rounded-[2px] text-xs font-black font-display uppercase tracking-wider bg-amber-400 hover:bg-amber-300 text-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>Activar -{partsDiscount}% Ahora</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('#/parts')}
                className="py-3 px-4 rounded-[2px] text-xs font-bold font-display uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>Adquirir Kits de Filtros</span>
              </button>
            </div>

            <p className="text-[10px] text-zinc-500 text-center pt-1 font-sans">
              Cálculos aplicables a flotas corporativas registradas bajo RNC en Tecnomaquinarias Diesel S.R.L.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
