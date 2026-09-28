import React, { useState } from 'react';
import {
  Droplets,
  AlertTriangle,
  Zap,
  ShieldCheck,
  Download,
  Truck,
  ShoppingCart,
  Phone,
  CheckCircle2,
  X,
  Sparkles,
  Gauge
} from 'lucide-react';

interface DefFluidLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineName?: string;
  machineSerial?: string;
  initialDefLevelPercent?: number;
}

export const DefFluidLevelModal: React.FC<DefFluidLevelModalProps> = ({
  isOpen,
  onClose,
  machineName = 'LiuGong 936E HD Tier 4 Final (Cummins QSL9)',
  machineSerial = 'LG936E-DOM-T4F-9902',
  initialDefLevelPercent = 14
}) => {
  const [defLevel, setDefLevel] = useState<number>(initialDefLevelPercent);

  if (!isOpen) return null;

  const tankCapacityLiters = 45;
  const currentLiters = ((defLevel / 100) * tankCapacityLiters).toFixed(1);
  const neededLiters = (tankCapacityLiters - parseFloat(currentLiters)).toFixed(1);

  // Derate status based on DEF level
  let derateStatus: 'normal' | 'warning' | 'derate_stage_1' | 'derate_stage_2' = 'normal';
  if (defLevel < 5) {
    derateStatus = 'derate_stage_2';
  } else if (defLevel < 10) {
    derateStatus = 'derate_stage_1';
  } else if (defLevel <= 20) {
    derateStatus = 'warning';
  }

  const handleExportStatus = () => {
    const text = `=========================================================================\n` +
      `TECNOMAQUINARIAS DIESEL S.R.L. — TELEMETRÍA J1939 SENSOR DEF / ADBLUE\n` +
      `MONITOREO DE SISTEMA DE TRATAMIENTO DE GASES SCR (TIER 4 FINAL / STAGE V)\n` +
      `=========================================================================\n\n` +
      `EQUIPO: ${machineName}\n` +
      `CHASIS / SERIE: ${machineSerial}\n` +
      `CÓDIGO CAN-BUS: J1939 SPN 1761 (Nivel de Tanque DEF)\n` +
      `NIVEL ACTUAL: ${defLevel}% (${currentLiters} / ${tankCapacityLiters} Litros)\n` +
      `ESTADO DE POTENCIA: ${
        derateStatus === 'normal' ? 'POTENCIA COMPLETA (100% HP)' :
        derateStatus === 'warning' ? 'ADVERTENCIA EN CABINA - RELLENO REQUERIDO' :
        derateStatus === 'derate_stage_1' ? 'DEGRADACIÓN DE POTENCIA FASE 1 (-25% TORQUE)' :
        'DEGRADACIÓN SEVERA FASE 2 (-50% POTENCIA - MODO PROTECCIÓN)'
      }\n` +
      `TEMPERATURA DEL TANQUE (SPN 3031): 24.2 °C (Óptima)\n` +
      `SUMINISTRO REQUERIDO PARA 100%: ${neededLiters} Litros de Urea Sintética ISO 22241\n\n` +
      `Almacén Km 22 Autopista Duarte • Despacho de Garrafas y Tambores DEF: (809) 560-1234\n` +
      `=========================================================================\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TMD_DEF_STATUS_${machineSerial}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl text-zinc-200 overflow-hidden font-mono flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[3px] bg-cyan-400/10 border border-cyan-400/30 text-cyan-400">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-cyan-400 text-black uppercase tracking-wider">
                  J1939 SPN 1761 DEF LEVEL
                </span>
                <span className="text-xs text-zinc-400 font-sans">
                  SCR Tier 4F / Stage V
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-white mt-0.5">
                Nivel de Fluido DEF (AdBlue) & Derate
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportStatus}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase transition-all cursor-pointer border border-zinc-700"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Exportar Telemetría</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 text-xs overflow-y-auto max-h-[75vh]">
          {/* Main Visual Tank Indicator & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-zinc-900/60 border border-zinc-800 rounded-[3px] items-center">
            {/* Visual Tank Graphic */}
            <div className="flex flex-col items-center space-y-2">
              <span className="text-[10px] text-zinc-400 uppercase font-bold">Tanque DEF (45L):</span>
              <div className="w-20 h-32 bg-zinc-950 border-2 border-zinc-700 rounded-[4px] p-1 flex flex-col justify-end relative overflow-hidden">
                {/* Level fill */}
                <div
                  style={{ height: `${defLevel}%` }}
                  className={`w-full rounded-[2px] transition-all duration-500 ${
                    defLevel <= 5 ? 'bg-red-500 animate-pulse' :
                    defLevel <= 10 ? 'bg-red-400' :
                    defLevel <= 20 ? 'bg-amber-400' : 'bg-cyan-400'
                  }`}
                />
                <span className="absolute inset-0 flex items-center justify-center font-black text-white text-sm drop-shadow-md">
                  {defLevel}%
                </span>
              </div>
              <span className="text-zinc-400 text-[10px] font-mono">{currentLiters} / {tankCapacityLiters} Litros</span>
            </div>

            {/* Derate & Power Condition */}
            <div className="sm:col-span-2 space-y-3">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block font-bold">ESTADO DE PROTECCIÓN DEL MOTOR:</span>
                <div className={`p-2.5 rounded-[2px] border text-xs font-bold uppercase mt-1 flex items-center gap-2 ${
                  derateStatus === 'normal'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : derateStatus === 'warning'
                    ? 'bg-amber-400/10 border-amber-400/40 text-amber-400'
                    : 'bg-red-500/10 border-red-500/40 text-red-400 animate-pulse'
                }`}>
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    {derateStatus === 'normal' && 'Potencia Nominal Óptima (100% HP)'}
                    {derateStatus === 'warning' && 'Nivel Bajo (14%) - Alerta Preventiva en Display'}
                    {derateStatus === 'derate_stage_1' && 'Degradación Fase 1 (-25% Torque del Motor)'}
                    {derateStatus === 'derate_stage_2' && 'Degradación Fase 2 (-50% Potencia Modo Cojera)'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-[2px]">
                  <span className="text-zinc-500 uppercase block">REQUERIDO P/ 100%</span>
                  <span className="text-sm font-black text-cyan-400 font-mono">{neededLiters} L</span>
                </div>
                <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-[2px]">
                  <span className="text-zinc-500 uppercase block">TEMP TANQUE</span>
                  <span className="text-sm font-black text-white font-mono">24.2 °C</span>
                </div>
              </div>
            </div>
          </div>

          {/* Derate Threshold Stages Table */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-zinc-400 uppercase font-bold block">
              Protocolo Oficial de Degradación de Potencia Tier 4F:
            </span>
            <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] divide-y divide-zinc-800 text-[11px]">
              <div className="p-2.5 flex justify-between items-center">
                <span className="text-emerald-400 font-bold">&gt; 20% Nivel DEF:</span>
                <span className="text-zinc-300">Potencia completa 100%, catalizador SCR en régimen óptimo.</span>
              </div>
              <div className="p-2.5 flex justify-between items-center bg-amber-400/5">
                <span className="text-amber-400 font-bold">10% - 20% DEF (Actual):</span>
                <span className="text-zinc-300">Luz ámbar en tablero LCD. Se aconseja rellenar antes de apagar el motor.</span>
              </div>
              <div className="p-2.5 flex justify-between items-center bg-red-500/5">
                <span className="text-red-400 font-bold">5% - 9% DEF:</span>
                <span className="text-zinc-300">Derate Fase 1: Reducción del 25% del par motor Cummins.</span>
              </div>
              <div className="p-2.5 flex justify-between items-center bg-red-600/10">
                <span className="text-red-500 font-bold">&lt; 5% DEF:</span>
                <span className="text-zinc-300">Derate Fase 2: Velocidad limitada a ralentí alto (Limp-home mode).</span>
              </div>
            </div>
          </div>

          {/* Quick Supply Order Card */}
          <div className="p-3.5 bg-zinc-900 border border-cyan-500/30 rounded-[3px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-white block">¿Requiere suministro de Urea ISO 22241 en obra?</span>
              <span className="text-zinc-400 text-[11px] font-sans">
                Despacho inmediato de garrafas de 5 galones o tambores de 55 galones desde el Km 22.
              </span>
            </div>

            <a
              href="https://wa.me/18095601234?text=Solicito%20despacho%20urgente%20de%20fluido%20DEF%20para%20equipo%20en%20obra"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-[2px] bg-cyan-400 hover:bg-cyan-300 text-black font-black uppercase text-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-all shadow-md"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Pedir DEF en Almacén</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Conforme a Norma de Emisiones EPA Tier 4 Final / EU Stage V
          </span>
          <span className="text-zinc-500 font-mono text-[10px]">TMD Telematics Fleet Core</span>
        </div>
      </div>
    </div>
  );
};
