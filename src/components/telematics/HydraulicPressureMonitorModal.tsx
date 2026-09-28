import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Activity, 
  Gauge, 
  AlertTriangle, 
  ShieldCheck, 
  Download, 
  Clock, 
  CheckCircle2, 
  Sliders, 
  Zap, 
  Layers, 
  TrendingUp, 
  Info 
} from 'lucide-react';
import { LiveLinkUnit } from '../../types';

interface HydraulicIncident {
  id: string;
  timestamp: string;
  peakPressureBar: number;
  durationSeconds: number;
  cylinderAffected: string;
  operatorAlertLevel: 'warning' | 'critical';
  quarryLocation: string;
}

const SAMPLE_INCIDENTS: HydraulicIncident[] = [
  {
    id: 'HYD-091',
    timestamp: 'Hoy, 08:42 AM',
    peakPressureBar: 352,
    durationSeconds: 4.8,
    cylinderAffected: 'Cilindro de Cuchara (Apertura contra banco de basalto)',
    operatorAlertLevel: 'critical',
    quarryLocation: 'Cantera Yaguate - Frente 3'
  },
  {
    id: 'HYD-092',
    timestamp: 'Hoy, 07:15 AM',
    peakPressureBar: 341,
    durationSeconds: 3.2,
    cylinderAffected: 'Cilindro de Balancín (Levante de roca sobredimensionada)',
    operatorAlertLevel: 'warning',
    quarryLocation: 'Cantera Yaguate - Frente 1'
  },
  {
    id: 'HYD-093',
    timestamp: 'Ayer, 04:20 PM',
    peakPressureBar: 348,
    durationSeconds: 5.1,
    cylinderAffected: 'Cilindro de Cuchara (Traba mecánica en estrato calizo)',
    operatorAlertLevel: 'critical',
    quarryLocation: 'Cantera Yaguate - Frente 2'
  }
];

interface HydraulicPressureMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: LiveLinkUnit | null;
}

export const HydraulicPressureMonitorModal: React.FC<HydraulicPressureMonitorModalProps> = ({
  isOpen,
  onClose,
  unit
}) => {
  const [currentPressureBar, setCurrentPressureBar] = useState<number>(318);
  const [reliefValvePressureBar] = useState<number>(343);
  const [pilotPressureBar] = useState<number>(39);
  const [pumpVolumetricEff] = useState<number>(94.5);
  const [isSimulatingLoad, setIsSimulatingLoad] = useState<boolean>(false);

  if (!isOpen || typeof document === 'undefined') return null;

  const machineName = unit?.name || 'LiuGong 922E HD';
  const serialCode = unit?.vin || 'LG-922E-0084';
  const hydOilTemp = unit?.hydraulicOilTempC || 76;

  const handleSimulateOverload = () => {
    setIsSimulatingLoad(true);
    setCurrentPressureBar(352);
    setTimeout(() => {
      setCurrentPressureBar(318);
      setIsSimulatingLoad(false);
    }, 2800);
  };

  const isOverload = currentPressureBar >= 345;
  const isHighLoad = currentPressureBar >= 320 && currentPressureBar < 345;

  const handleExportHydraulicAudit = () => {
    let report = `========================================================================\n`;
    report += `TMD DOMINICANA - AUDITORÍA DE PRESIÓN HIDRÁULICA Y SOBREESFUERZO EN ROCA\n`;
    report += `Generado: ${new Date().toLocaleString('es-DO')} | Transductor J1939 CAN-Bus\n`;
    report += `Equipo: ${machineName} (${serialCode})\n`;
    report += `========================================================================\n\n`;

    report += `1. PARÁMETROS DEL CIRCUITO HIDRÁULICO PRINCIPAL:\n`;
    report += `• Presión Actual de Trabajo: ${currentPressureBar} Bar (${Math.round(currentPressureBar * 14.5038)} PSI)\n`;
    report += `• Calibración Válvula de Alivio Principal (Main Relief): ${reliefValvePressureBar} Bar\n`;
    report += `• Presión del Circuito de Pilotaje: ${pilotPressureBar} Bar\n`;
    report += `• Temperatura de Aceite Hidráulico ISO VG 46: ${hydOilTemp}°C (Óptimo 65-80°C)\n`;
    report += `• Eficiencia Volumétrica de Bombas Kawasaki: ${pumpVolumetricEff}%\n\n`;

    report += `2. BITÁCORA DE PICOS DE PRESIÓN EN CANTERA (>340 BAR):\n`;
    SAMPLE_INCIDENTS.forEach((inc) => {
      report += `[${inc.id}] ${inc.timestamp} | Pico: ${inc.peakPressureBar} Bar | Duración: ${inc.durationSeconds}s\n`;
      report += `• Cilindro: ${inc.cylinderAffected}\n`;
      report += `• Ubicación: ${inc.quarryLocation}\n`;
      report += `• Nivel de Alerta: ${inc.operatorAlertLevel.toUpperCase()}\n`;
      report += `------------------------------------------------------------------------\n`;
    });

    report += `\nRECOMENDACIÓN TÉCNICA DEL TALLER CENTRAL KM 22:\n`;
    report += `Se constata que el operador incurre en sobrepresión reiterada en estrato de basalto duro. Se sugiere instruir en técnica de corte escalonado para evitar desgaste prematuro de sellos y fatiga en bombas.\n`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TMD_Presion_Hidraulica_${serialCode}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-zinc-950 rounded-[5px] border border-zinc-800 max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[94vh] flex flex-col overflow-hidden font-mono text-zinc-100">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[3px] bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Gauge className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider font-display">
                  LiveLink J1939 • Transductores de Presión Hidráulica 350 Bar
                </span>
                <span className={`px-1.5 py-0.2 rounded-[2px] text-[10px] font-mono font-bold border ${
                  isOverload
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                    : isHighLoad
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {isOverload ? 'SOBREESFUERZO CRÍTICO' : isHighLoad ? 'CARGA SEVERA DE ROCA' : 'PRESIÓN NOMINAL OK'}
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-tight font-display">
                Sensor de Presión Hidráulica de Cuchara
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportHydraulicAudit}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>REPORTE TXT</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-[2px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real-Time Pressure Visualizer Gauge */}
        <div className="bg-zinc-900 rounded-[3px] border border-zinc-800 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block font-display">
                Transductor Cilindro de Cuchara (Presión Cabezal)
              </span>
              <p className="text-[11px] text-zinc-500">
                {machineName} &bull; Serial: {serialCode} &bull; Puerto J1939 CAN 250kbps
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSimulateOverload}
                disabled={isSimulatingLoad}
                className="px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold uppercase transition-colors cursor-pointer border border-zinc-700 flex items-center gap-1"
              >
                <Zap className={`w-3.5 h-3.5 ${isSimulatingLoad ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
                <span>Simular Golpe en Basalto (352 Bar)</span>
              </button>
            </div>
          </div>

          {/* Large Gauge Display Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-zinc-950 p-4 rounded-[2px] border border-zinc-800 sm:col-span-2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Presión Principal en Vivo</span>
                <div className={`text-4xl font-black font-mono mt-1 ${
                  isOverload ? 'text-rose-400' : isHighLoad ? 'text-amber-400' : 'text-cyan-400'
                }`}>
                  {currentPressureBar} <span className="text-base font-normal text-zinc-400">BAR</span>
                </div>
                <span className="text-[11px] text-zinc-400 font-mono mt-1 block">
                  ≈ {Math.round(currentPressureBar * 14.5038).toLocaleString()} PSI
                </span>
              </div>

              {/* Progress Arc Bar */}
              <div className="space-y-1.5 mt-3">
                <div className="w-full bg-zinc-800 h-2.5 rounded-[1px] overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isOverload ? 'bg-rose-500' : isHighLoad ? 'bg-amber-400' : 'bg-cyan-400'
                    }`}
                    style={{ width: `${Math.min(100, (currentPressureBar / 380) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                  <span>0 Bar</span>
                  <span>250 Bar (Normal)</span>
                  <span>320 Bar (Severo)</span>
                  <span>350 Bar (Alivio)</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 p-4 rounded-[2px] border border-zinc-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Alivio Principal</span>
                <div className="text-2xl font-black text-white font-mono mt-1">
                  {reliefValvePressureBar} <span className="text-xs font-normal text-zinc-400">BAR</span>
                </div>
                <span className="text-[10px] text-emerald-400 mt-1 block font-mono">
                  Válvula calibrada OK
                </span>
              </div>
              <div className="pt-2 border-t border-zinc-800 text-[10px] text-zinc-500 font-mono">
                Margen actual: {reliefValvePressureBar - currentPressureBar} bar
              </div>
            </div>

            <div className="bg-zinc-950 p-4 rounded-[2px] border border-zinc-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Circuito Pilotaje</span>
                <div className="text-2xl font-black text-white font-mono mt-1">
                  {pilotPressureBar} <span className="text-xs font-normal text-zinc-400">BAR</span>
                </div>
                <span className="text-[10px] text-zinc-400 mt-1 block font-mono">
                  Aceite Temp: {hydOilTemp}°C
                </span>
              </div>
              <div className="pt-2 border-t border-zinc-800 text-[10px] text-zinc-500 font-mono">
                Eficiencia: {pumpVolumetricEff}%
              </div>
            </div>
          </div>
        </div>

        {/* Forensic Log of High Pressure Spikes */}
        <div className="bg-zinc-900 rounded-[3px] border border-zinc-800 p-4 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2 shrink-0">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-display">
              Registro Forense de Sobreesfuerzos en Roca Dura ({SAMPLE_INCIDENTS.length} Eventos)
            </span>
            <span className="text-[10px] text-zinc-400">
              Disparo Automático al Exceder 340 Bar por &gt; 3 segundos
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto flex-1 pr-1">
            {SAMPLE_INCIDENTS.map((inc) => (
              <div
                key={inc.id}
                className="p-3 rounded-[2px] bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400 text-xs font-mono">{inc.id}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{inc.timestamp}</span>
                    <span className={`px-1.5 py-0.2 rounded-[2px] text-[9px] font-bold uppercase border ${
                      inc.operatorAlertLevel === 'critical'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        : 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                    }`}>
                      {inc.operatorAlertLevel === 'critical' ? 'ALIVIO DISPARADO' : 'PRESIÓN ALTA'}
                    </span>
                  </div>

                  <p className="text-zinc-200 font-bold">
                    {inc.cylinderAffected}
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Ubicación: {inc.quarryLocation} &bull; Duración del pico: {inc.durationSeconds}s
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-lg font-black text-rose-400 font-mono block">
                    {inc.peakPressureBar} BAR
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    +{inc.peakPressureBar - reliefValvePressureBar} Bar s/alivio
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <span className="text-[10px] font-mono">
            TMD LiveLink Hydraulic Pressure Core v4.9 • Algoritmo Anti-Cavitación
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-[10px] tracking-wider transition-colors cursor-pointer"
          >
            Cerrar Monitor
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
