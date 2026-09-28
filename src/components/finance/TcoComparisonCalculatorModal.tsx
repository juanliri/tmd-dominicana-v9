import React, { useState } from 'react';
import {
  TrendingDown,
  DollarSign,
  ShieldCheck,
  Fuel,
  Wrench,
  Download,
  X,
  CheckCircle2,
  FileText,
  BarChart2,
  Sliders,
  Award
} from 'lucide-react';

interface TcoComparisonCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineName?: string;
  machineBasePriceUsd?: number;
  competitorBrand?: string;
  competitorBasePriceUsd?: number;
}

export const TcoComparisonCalculatorModal: React.FC<TcoComparisonCalculatorModalProps> = ({
  isOpen,
  onClose,
  machineName = 'LiuGong 922E HD Excavadora 22 Ton',
  machineBasePriceUsd = 165000,
  competitorBrand = 'Marca Competidora Premium (Tier 1)',
  competitorBasePriceUsd = 238000
}) => {
  // Operational simulation parameters
  const [annualHours, setAnnualHours] = useState<number>(2000); // 2000 hrs/year
  const [yearsProjected, setYearsProjected] = useState<number>(5); // 5-year TCO
  const [dieselPricePerGallonUsd, setDieselPricePerGallonUsd] = useState<number>(4.65); // ~RD$ 279/galón

  if (!isOpen) return null;

  const totalOperatingHours = annualHours * yearsProjected;

  // Fuel Consumption (Liters per hour)
  // Cummins QSB6.7 (LiuGong) ~14.2 L/h (3.75 gal/h) vs Competitor ~16.8 L/h (4.44 gal/h)
  const tmdGallonsPerHour = 3.75;
  const competitorGallonsPerHour = 4.44;

  const tmdTotalFuelGallons = Math.round(totalOperatingHours * tmdGallonsPerHour);
  const competitorTotalFuelGallons = Math.round(totalOperatingHours * competitorGallonsPerHour);

  const tmdFuelCostUsd = Math.round(tmdTotalFuelGallons * dieselPricePerGallonUsd);
  const competitorFuelCostUsd = Math.round(competitorTotalFuelGallons * dieselPricePerGallonUsd);
  const fuelSavingsUsd = competitorFuelCostUsd - tmdFuelCostUsd;

  // Maintenance & OEM Filters (PMA 10,000h)
  const tmdMaintenanceCostUsd = Math.round(totalOperatingHours * 1.85);
  const competitorMaintenanceCostUsd = Math.round(totalOperatingHours * 2.80);
  const maintenanceSavingsUsd = competitorMaintenanceCostUsd - tmdMaintenanceCostUsd;

  // Initial Purchase Price Difference (Capex)
  const capexSavingsUsd = competitorBasePriceUsd - machineBasePriceUsd;

  // Estimated 5-Year Residual Value (Trade-In Buyback ~40%)
  const tmdResidualValueUsd = Math.round(machineBasePriceUsd * 0.40);
  const competitorResidualValueUsd = Math.round(competitorBasePriceUsd * 0.42);

  // Total Cost of Ownership Net Formula
  // TCO = Acquisition + Fuel + Maintenance - Residual
  const tmdNetTcoUsd = machineBasePriceUsd + tmdFuelCostUsd + tmdMaintenanceCostUsd - tmdResidualValueUsd;
  const competitorNetTcoUsd = competitorBasePriceUsd + competitorFuelCostUsd + competitorMaintenanceCostUsd - competitorResidualValueUsd;
  const netTcoSavingsUsd = competitorNetTcoUsd - tmdNetTcoUsd;

  const handleExportTcoDossier = () => {
    const report = `=========================================================================\n` +
      `TECNOMAQUINARIAS DIESEL S.R.L. — REPORTE EJECUTIVO DE TCO (5 AÑOS)\n` +
      `ANÁLISIS DE COSTO TOTAL DE PROPIEDAD PARA JUNTA DIRECTIVA & BANCOS\n` +
      `=========================================================================\n\n` +
      `EQUIPO ANALIZADO: ${machineName}\n` +
      `EQUIPO COMPARADO: ${competitorBrand}\n` +
      `HORIZONTE TEMPORAL: ${yearsProjected} Años (${totalOperatingHours.toLocaleString()} Horas Totales de Operación)\n` +
      `PRECIO ESTIMADO COMBUSTIBLE DIÉSEL: US$ ${dieselPricePerGallonUsd.toFixed(2)} / Galón\n\n` +
      `1. INVERSIÓN INICIAL (CAPEX):\n` +
      `   - TMD LiuGong: US$ ${machineBasePriceUsd.toLocaleString()}\n` +
      `   - Competidor: US$ ${competitorBasePriceUsd.toLocaleString()}\n` +
      `   --> Ahorro Directo de Capital: US$ ${capexSavingsUsd.toLocaleString()}\n\n` +
      `2. CONSUMO DE COMBUSTIBLE DIÉSEL (${totalOperatingHours.toLocaleString()} HORAS):\n` +
      `   - TMD LiuGong (Motor Cummins 3.75 gal/h): US$ ${tmdFuelCostUsd.toLocaleString()} (${tmdTotalFuelGallons.toLocaleString()} galones)\n` +
      `   - Competidor (4.44 gal/h): US$ ${competitorFuelCostUsd.toLocaleString()} (${competitorTotalFuelGallons.toLocaleString()} galones)\n` +
      `   --> Ahorro Neto en Diésel: US$ ${fuelSavingsUsd.toLocaleString()}\n\n` +
      `3. MANTENIMIENTO PREVENTIVO Y REPUESTOS OEM:\n` +
      `   - TMD LiuGong: US$ ${tmdMaintenanceCostUsd.toLocaleString()}\n` +
      `   - Competidor: US$ ${competitorMaintenanceCostUsd.toLocaleString()}\n` +
      `   --> Ahorro en Mantenimiento: US$ ${maintenanceSavingsUsd.toLocaleString()}\n\n` +
      `4. VALOR RESIDUAL / TRADE-IN PERMUTA (AÑO 5):\n` +
      `   - TMD LiuGong (40% Garantizado): US$ ${tmdResidualValueUsd.toLocaleString()}\n` +
      `   - Competidor (42%): US$ ${competitorResidualValueUsd.toLocaleString()}\n\n` +
      `-------------------------------------------------------------------------\n` +
      `RESULTADO NETO TCO A 5 AÑOS:\n` +
      `TCO TMD LIUGONG: US$ ${tmdNetTcoUsd.toLocaleString()}\n` +
      `TCO COMPETIDOR:  US$ ${competitorNetTcoUsd.toLocaleString()}\n` +
      `AHORRO TOTAL PARA EL CONTRATISTA: US$ ${netTcoSavingsUsd.toLocaleString()}\n` +
      `=========================================================================\n` +
      `Certificado por División Financiera TMD Dominicana. Sede Km 22 Autopista Duarte.\n`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TMD_INFORME_EJECUTIVO_TCO_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-3xl max-h-[92vh] flex flex-col bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl text-zinc-200 overflow-hidden font-mono"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[3px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-emerald-500 text-black uppercase tracking-wider">
                  ANÁLISIS FINANCIERO TCO
                </span>
                <span className="text-xs text-zinc-400 font-sans">
                  Total Cost of Ownership a 5 Años
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-white mt-0.5">
                Costo Total de Propiedad: TMD vs. Competencia
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportTcoDossier}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase transition-all cursor-pointer border border-zinc-700"
              title="Descargar Informe TCO en texto para Comité de Compras / Banco"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Dossier Ejecutivo</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Big Savings Hero Banner */}
        <div className="p-4 bg-gradient-to-r from-emerald-950/40 via-zinc-900/50 to-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] text-emerald-400 uppercase font-mono font-bold block">
              AHORRO INTEGRAL TOTAL ESTIMADO (5 AÑOS / 10,000 HORAS):
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              US$ {netTcoSavingsUsd.toLocaleString()}
            </div>
            <span className="text-[11px] text-zinc-400 font-sans">
              (Equivalente a más de RD$ {(netTcoSavingsUsd * 60).toLocaleString()} en flujo de caja)
            </span>
          </div>

          <div className="text-right hidden sm:block">
            <span className="px-2.5 py-1 rounded-[2px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase">
              Retorno Rápido de Inversión
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs">
          {/* Interactive Simulation Sliders */}
          <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-[3px] space-y-3">
            <span className="text-[10px] text-zinc-400 uppercase font-mono font-bold flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" /> Parámetros de Operación en Cantera / Obra:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-zinc-400">Horas Operativas al Año:</span>
                  <span className="text-white font-bold">{annualHours} h/año ({totalOperatingHours.toLocaleString()}h total)</span>
                </div>
                <input
                  type="range"
                  min="1200"
                  max="3000"
                  step="100"
                  value={annualHours}
                  onChange={e => setAnnualHours(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-zinc-400">Precio Diésel Estimado:</span>
                  <span className="text-white font-bold">US$ {dieselPricePerGallonUsd.toFixed(2)} / Galón</span>
                </div>
                <input
                  type="range"
                  min="3.50"
                  max="6.00"
                  step="0.05"
                  value={dieselPricePerGallonUsd}
                  onChange={e => setDieselPricePerGallonUsd(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] overflow-hidden">
            <div className="grid grid-cols-3 p-3 bg-zinc-900/90 border-b border-zinc-800 font-bold uppercase text-[10px] text-zinc-400">
              <span>Concepto de Costo (5 Años)</span>
              <span className="text-right text-amber-400">TMD LiuGong</span>
              <span className="text-right text-zinc-300">{competitorBrand.slice(0, 18)}</span>
            </div>

            <div className="divide-y divide-zinc-800/80">
              {/* Row 1: Capex */}
              <div className="grid grid-cols-3 p-3 items-center">
                <div>
                  <span className="font-bold text-white block">1. Precio Adquisición (Capex)</span>
                  <span className="text-[10px] text-zinc-500 font-sans">Precio FOB / Km 22 con ITBIS</span>
                </div>
                <div className="text-right font-black font-mono text-white">
                  US$ {machineBasePriceUsd.toLocaleString()}
                </div>
                <div className="text-right font-black font-mono text-zinc-400">
                  US$ {competitorBasePriceUsd.toLocaleString()}
                </div>
              </div>

              {/* Row 2: Fuel */}
              <div className="grid grid-cols-3 p-3 items-center">
                <div>
                  <span className="font-bold text-white block">2. Combustible Diésel</span>
                  <span className="text-[10px] text-emerald-400 font-sans">Motor Cummins (3.75 vs. 4.44 gal/h)</span>
                </div>
                <div className="text-right font-black font-mono text-white">
                  US$ {tmdFuelCostUsd.toLocaleString()}
                </div>
                <div className="text-right font-black font-mono text-zinc-400">
                  US$ {competitorFuelCostUsd.toLocaleString()}
                </div>
              </div>

              {/* Row 3: Maintenance */}
              <div className="grid grid-cols-3 p-3 items-center">
                <div>
                  <span className="font-bold text-white block">3. Mantenimiento Preventivo</span>
                  <span className="text-[10px] text-zinc-500 font-sans">Kits de filtros y aceites OEM</span>
                </div>
                <div className="text-right font-black font-mono text-white">
                  US$ {tmdMaintenanceCostUsd.toLocaleString()}
                </div>
                <div className="text-right font-black font-mono text-zinc-400">
                  US$ {competitorMaintenanceCostUsd.toLocaleString()}
                </div>
              </div>

              {/* Row 4: Residual Value */}
              <div className="grid grid-cols-3 p-3 items-center bg-zinc-950/40">
                <div>
                  <span className="font-bold text-emerald-400 block">(-) Valor Residual Trade-In</span>
                  <span className="text-[10px] text-zinc-500 font-sans">Recompra garantizada TMD en permuta</span>
                </div>
                <div className="text-right font-black font-mono text-emerald-400">
                  -US$ {tmdResidualValueUsd.toLocaleString()}
                </div>
                <div className="text-right font-black font-mono text-zinc-500">
                  -US$ {competitorResidualValueUsd.toLocaleString()}
                </div>
              </div>

              {/* Total TCO Row */}
              <div className="grid grid-cols-3 p-3.5 items-center bg-zinc-950 text-sm font-black border-t-2 border-zinc-700">
                <span className="uppercase text-white">TCO NETO TOTAL:</span>
                <span className="text-right font-mono text-amber-400">
                  US$ {tmdNetTcoUsd.toLocaleString()}
                </span>
                <span className="text-right font-mono text-zinc-400">
                  US$ {competitorNetTcoUsd.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Key Advantages Checklist */}
          <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-[3px] space-y-2">
            <span className="text-[10px] text-zinc-400 uppercase font-mono font-bold block">
              Ventajas Financieras Estratégicas para su Flota:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-300 font-sans">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Ahorro inicial de capital para reinvertir en implementos u obras.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Eficiencia diésel certificada con bomba hidráulica Kawasaki.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Repuestos OEM disponibles 24/7 en el Km 22 a -30% vs. marcas tradicionales.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Programa Trade-In formal para renovación garantizada al 5to año.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 shrink-0">
          <span>Metodología estándar ISO 15686-5 para cálculo de ciclo de vida de maquinaria pesada.</span>
          <span className="font-mono text-[10px]">TMD Financial Engineering v9</span>
        </div>
      </div>
    </div>
  );
};
