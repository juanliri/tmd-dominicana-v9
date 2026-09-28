import React, { useState } from 'react';
import {
  Clock,
  Flame,
  TrendingDown,
  AlertTriangle,
  Download,
  Calendar,
  Fuel,
  DollarSign,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface IdleTimeProductivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineName?: string;
  machineSerial?: string;
  totalEngineHours?: number;
}

export const IdleTimeProductivityModal: React.FC<IdleTimeProductivityModalProps> = ({
  isOpen,
  onClose,
  machineName = 'LiuGong 922E HD Excavadora #04',
  machineSerial = 'LG922E-DOM-8841',
  totalEngineHours = 1420
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'lifetime'>('week');

  if (!isOpen) return null;

  // Working metrics
  const productiveHours = Math.round(totalEngineHours * 0.68);
  const idleHours = totalEngineHours - productiveHours;
  const idlePercentage = Math.round((idleHours / totalEngineHours) * 100);

  // Wasted fuel calculations (average 4.2 Liters/hour in idle for 22T excavator)
  const wastedFuelLiters = Math.round(idleHours * 4.2);
  const wastedFuelGal = Math.round(wastedFuelLiters / 3.785);
  const wastedCostUsd = Math.round(wastedFuelGal * 4.45); // US$ 4.45 per gallon of Optimum Diesel in DR
  const wastedCostDop = (wastedCostUsd * 60.5).toLocaleString('es-DO', { maximumFractionDigits: 0 });

  // Weekly daily breakdown
  const dailyData = [
    { day: 'Lun', productive: 7.2, idle: 2.1 },
    { day: 'Mar', productive: 8.0, idle: 1.5 },
    { day: 'Mié', productive: 6.5, idle: 3.2 },
    { day: 'Jue', productive: 7.8, idle: 1.8 },
    { day: 'Vie', productive: 8.5, idle: 1.2 },
    { day: 'Sáb', productive: 4.0, idle: 1.0 }
  ];

  const handleExportReport = () => {
    const text = `=========================================================================\n` +
      `TECNOMAQUINARIAS DIESEL S.R.L. — REPORTE DE HORAS EN RALENTÍ VS PRODUCTIVAS\n` +
      `AUDITORÍA DE DESPERDICIO DE COMBUSTIBLE DIÉSEL (TELEMETRÍA J1939)\n` +
      `=========================================================================\n\n` +
      `EQUIPO: ${machineName}\n` +
      `CHASIS / SERIE: ${machineSerial}\n` +
      `HORAS TOTALES DE MOTOR: ${totalEngineHours} h\n` +
      `HORAS PRODUCTIVAS DE EXCAVACIÓN: ${productiveHours} h (68%)\n` +
      `HORAS EN RALENTÍ (MOTOR ENCENDIDO SIN TRABAJAR): ${idleHours} h (${idlePercentage}%)\n\n` +
      `IMPACTO FINANCIERO Y PÉRDIDA ESTIMADA:\n` +
      `- Combustible Desperdiciado: ${wastedFuelLiters.toLocaleString()} Litros (${wastedFuelGal.toLocaleString()} Galones)\n` +
      `- Costo Financiero Estimado: US$ ${wastedCostUsd.toLocaleString()} (RD$ ${wastedCostDop})\n` +
      `- Recomendación de Fábrica: Habilitar apagado automático de motor tras 5 min de inactividad.\n\n` +
      `Fecha de Emisión: ${new Date().toLocaleDateString('es-DO')} • Centro de Operaciones TMD Km 22\n` +
      `=========================================================================\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TMD_AUDITORIA_RALENTI_${machineSerial}.txt`;
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
            <div className="p-2.5 rounded-[3px] bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-amber-400 text-black uppercase tracking-wider">
                  TELEMETRÍA J1939 PRODUCTIVIDAD
                </span>
                <span className="text-xs text-zinc-400 font-sans">
                  {machineSerial}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-white mt-0.5">
                Ralentí vs. Horas Productivas
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase transition-all cursor-pointer border border-zinc-700"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Exportar Auditoría</span>
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
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-[3px] text-center">
              <span className="text-[10px] text-zinc-500 uppercase block">TOTAL HORÓMETRO</span>
              <span className="text-lg font-black text-white">{totalEngineHours} h</span>
              <span className="text-[10px] text-zinc-500 block">ECU Cummins</span>
            </div>

            <div className="p-3 bg-zinc-900 border border-emerald-500/30 rounded-[3px] text-center">
              <span className="text-[10px] text-emerald-400 uppercase block font-bold">HORAS TRABAJO</span>
              <span className="text-lg font-black text-emerald-400">{productiveHours} h</span>
              <span className="text-[10px] text-zinc-500 block">68% Productivo</span>
            </div>

            <div className="p-3 bg-zinc-900 border border-amber-400/40 rounded-[3px] text-center">
              <span className="text-[10px] text-amber-400 uppercase block font-bold">HORAS RALENTÍ</span>
              <span className="text-lg font-black text-amber-400">{idleHours} h</span>
              <span className="text-[10px] text-amber-400/80 block">{idlePercentage}% Inactivo</span>
            </div>

            <div className="p-3 bg-zinc-900 border border-red-500/40 rounded-[3px] text-center">
              <span className="text-[10px] text-red-400 uppercase block font-bold">DIÉSEL PERDIDO</span>
              <span className="text-lg font-black text-red-400">US$ {wastedCostUsd.toLocaleString()}</span>
              <span className="text-[10px] text-zinc-500 block">RD$ {wastedCostDop}</span>
            </div>
          </div>

          {/* Progress Visualizer Ratio Bar */}
          <div className="space-y-1.5 p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-[3px]">
            <div className="flex justify-between text-xs">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                Productivo: {productiveHours} h (68%)
              </span>
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                Ralentí: {idleHours} h ({idlePercentage}%)
              </span>
            </div>

            <div className="w-full h-4 bg-zinc-800 rounded-[2px] overflow-hidden flex">
              <div style={{ width: '68%' }} className="h-full bg-emerald-500" />
              <div style={{ width: '32%' }} className="h-full bg-amber-400" />
            </div>
          </div>

          {/* Weekly Daily Comparison Bars */}
          <div className="space-y-2">
            <span className="text-[10px] text-zinc-400 uppercase font-bold block">
              Desglose Semanal por Día (Horas Productivas vs Ralentí):
            </span>
            <div className="grid grid-cols-6 gap-2">
              {dailyData.map((d, i) => (
                <div key={i} className="p-2 bg-zinc-900 border border-zinc-800 rounded-[2px] text-center space-y-1">
                  <span className="text-[11px] font-bold text-white block">{d.day}</span>
                  <div className="space-y-0.5">
                    <span className="text-emerald-400 text-[10px] block font-bold">{d.productive}h</span>
                    <span className="text-amber-400 text-[10px] block">{d.idle}h ral.</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Advisory Callout */}
          <div className="p-3 bg-amber-400/10 border border-amber-400/30 rounded-[3px] flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] font-sans text-zinc-300 space-y-0.5">
              <strong className="text-amber-400 font-mono text-xs block">Recomendación TMD para Reducción de Costos:</strong>
              <p>
                El porcentaje de ralentí de este equipo (32%) supera el estándar óptimo de obras pesadas (&lt;20%).
                Se sugiere programar el apagado automático de motor tras 5 minutos de inactividad a través del display LCD de la cabina.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Monitoreo Satelital LiveLink™ Activo
          </span>
          <span className="text-zinc-500 font-mono text-[10px]">TMD Telematics Fleet Core</span>
        </div>
      </div>
    </div>
  );
};
