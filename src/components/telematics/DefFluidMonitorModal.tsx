import React, { useState } from 'react';
import {
  Droplet,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Gauge,
  Thermometer,
  Clock,
  RotateCcw,
  X,
  Info,
  Sliders,
  CheckCircle2,
  Zap,
  TrendingDown
} from 'lucide-react';

interface DefFluidMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineName?: string;
  machineSerial?: string;
}

export const DefFluidMonitorModal: React.FC<DefFluidMonitorModalProps> = ({
  isOpen,
  onClose,
  machineName = 'LiuGong 922E HD (Cummins QSB 6.7 Tier 4F)',
  machineSerial = 'LG922E-DOM-2024-8841'
}) => {
  // Real-time or simulated sensor parameters
  const [defLevelPercent, setDefLevelPercent] = useState<number>(68); // 0-100%
  const [defQualityPercent, setDefQualityPercent] = useState<number>(32.5); // ISO 22241 (optimal 32.5%)
  const [defTempCelsius, setDefTempCelsius] = useState<number>(24.5);
  const [tankCapacityLiters] = useState<number>(45);

  if (!isOpen) return null;

  // Derate Status Logic (Tier 4 Final EPA / EU Stage V)
  let derateStatus: 'NORMAL' | 'WARNING_LOW' | 'DERATE_LV1' | 'DERATE_LV2_INDUCEMENT' = 'NORMAL';
  let derateLabel = 'POTENCIA PLENA (100% TORQUE)';
  let derateColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  let torqueAvailable = 100;

  if (defLevelPercent <= 2.5) {
    derateStatus = 'DERATE_LV2_INDUCEMENT';
    derateLabel = 'DERATE NIVEL 2: RALENTÍ FORZADO (1,200 RPM)';
    derateColor = 'text-rose-400 border-rose-500/40 bg-rose-500/10';
    torqueAvailable = 40;
  } else if (defLevelPercent <= 10) {
    derateStatus = 'DERATE_LV1';
    derateLabel = 'DERATE NIVEL 1: TORQUE REDUCIDO (-25%)';
    derateColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    torqueAvailable = 75;
  } else if (defLevelPercent <= 20) {
    derateStatus = 'WARNING_LOW';
    derateLabel = 'ALERTA NIVEL BAJO (< 20%)';
    derateColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    torqueAvailable = 100;
  }

  const currentLiters = ((defLevelPercent / 100) * tankCapacityLiters).toFixed(1);
  const remainingOperatingHours = (defLevelPercent * 0.42).toFixed(1); // approx 42 hrs at 100%
  const qualityHealthy = defQualityPercent >= 31.8 && defQualityPercent <= 33.2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl text-zinc-200 overflow-hidden font-mono flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[3px] bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Droplet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-cyan-500 text-black uppercase tracking-wider">
                  TIER 4F / SCR • SPN 1761
                </span>
                <span className="text-xs text-zinc-400 font-sans">
                  Monitoreo de Emisiones & AdBlue / Urea
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-white mt-0.5">
                Nivel de Fluido DEF & Sistema Anti-Derate
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Machine Meta Bar */}
        <div className="p-3.5 bg-zinc-900/40 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-zinc-500 text-[10px] block">EQUIPO:</span>
            <span className="text-white font-bold">{machineName}</span>
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] block">ESTADO DE TORQUE SCR:</span>
            <span className={`px-2 py-0.5 rounded-[2px] text-[10px] font-bold border inline-flex items-center gap-1 ${derateColor}`}>
              <Zap className="w-3 h-3" /> {derateLabel}
            </span>
          </div>
        </div>

        {/* Sensor Visualizer */}
        <div className="p-5 space-y-5">
          {/* Tank Level Gauge */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-zinc-400 flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-cyan-400" /> Nivel de Tanque DEF (Urea)
              </span>
              <span className="text-sm font-black text-white font-mono">
                {defLevelPercent}% <span className="text-xs text-zinc-500 font-normal">({currentLiters} / {tankCapacityLiters} Litros)</span>
              </span>
            </div>

            {/* Progress Bar with Color Coding */}
            <div className="h-4 bg-zinc-950 rounded-[2px] border border-zinc-800 overflow-hidden p-0.5 relative">
              <div 
                className={`h-full transition-all duration-500 rounded-[1px] ${
                  defLevelPercent <= 2.5 
                    ? 'bg-rose-500 animate-pulse' 
                    : defLevelPercent <= 10 
                    ? 'bg-rose-500' 
                    : defLevelPercent <= 20 
                    ? 'bg-amber-400' 
                    : 'bg-cyan-500'
                }`}
                style={{ width: `${defLevelPercent}%` }}
              />
              {/* Critical threshold line at 10% */}
              <div className="absolute top-0 bottom-0 left-[10%] w-0.5 bg-rose-500/80 z-10" title="Umbral Derate Nivel 1 (10%)" />
              {/* Inducement threshold line at 2.5% */}
              <div className="absolute top-0 bottom-0 left-[2.5%] w-0.5 bg-red-400 z-10" title="Umbral Inducement Parada (2.5%)" />
            </div>

            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span className="text-rose-400">0% Vacío (Derate)</span>
              <span className="text-amber-400">20% Reserva</span>
              <span className="text-cyan-400">100% Tanque Lleno</span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Autonomy Hours */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> Autonomía de Trabajo
              </div>
              <div className="text-lg font-black text-white">
                ~{remainingOperatingHours} <span className="text-xs font-normal text-zinc-400">Horas</span>
              </div>
              <p className="text-[10px] text-zinc-500 font-sans">
                Consumo: ~1.1 L/h en ciclo de carga pesado
              </p>
            </div>

            {/* DEF Quality ISO 22241 */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Concentración Urea
              </div>
              <div className="text-lg font-black text-white flex items-center gap-1.5">
                {defQualityPercent}%
                {qualityHealthy ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                )}
              </div>
              <p className="text-[10px] text-zinc-500 font-sans">
                Norma ISO 22241 (Óptimo 32.5% ± 0.7%)
              </p>
            </div>

            {/* Tank Temperature */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Temperatura Tanque
              </div>
              <div className="text-lg font-black text-white">
                {defTempCelsius}°C
              </div>
              <p className="text-[10px] text-zinc-500 font-sans">
                Calentador de línea SCR: En Reposo
              </p>
            </div>
          </div>

          {/* Derate Stages Warning Table */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-[3px] p-3.5 space-y-2 text-xs">
            <h4 className="font-bold text-zinc-300 uppercase flex items-center gap-1.5 text-[11px]">
              <Info className="w-3.5 h-3.5 text-cyan-400" /> Escala Oficial de Protección de Motor EPA Tier 4F:
            </h4>
            <div className="space-y-1.5 text-[11px] font-sans">
              <div className="flex items-center justify-between p-1.5 rounded-[2px] bg-zinc-950 border border-zinc-800/80">
                <span className="text-zinc-300 font-mono">&gt; 20% Nivel:</span>
                <span className="text-emerald-400 font-semibold font-mono">Operación Normal (100% Potencia y Torque)</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-[2px] bg-zinc-950 border border-zinc-800/80">
                <span className="text-zinc-300 font-mono">10% - 2.5% Nivel:</span>
                <span className="text-amber-400 font-semibold font-mono">Derate Nivel 1 (-25% Torque, Luz Check Engine)</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-[2px] bg-zinc-950 border border-zinc-800/80">
                <span className="text-zinc-300 font-mono">&lt; 2.5% Nivel:</span>
                <span className="text-rose-400 font-semibold font-mono">Derate Nivel 2 (Ralentí forzado a 1,200 RPM)</span>
              </div>
            </div>
          </div>

          {/* Live Simulator Slider for Field Demo & Technical Testing */}
          <div className="p-3 bg-zinc-900/40 border border-zinc-800/60 rounded-[3px] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-mono flex items-center gap-1.5 text-[10px] uppercase">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Simulador de Telemetría para Pruebas:
              </span>
              <button
                type="button"
                onClick={() => setDefLevelPercent(68)}
                className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Resetear a 68%
              </button>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                value={defLevelPercent}
                onChange={e => setDefLevelPercent(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-white w-10 text-right">
                {defLevelPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Cummins Clean Emissions Module (CEM) • Compatible ISO 22241-1</span>
          <span className="font-mono text-[10px]">TMD Telematics v9</span>
        </div>
      </div>
    </div>
  );
};
