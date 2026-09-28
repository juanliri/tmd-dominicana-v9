import React, { useState } from 'react';
import { 
  X, 
  Zap, 
  BatteryCharging, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Download, 
  ShieldCheck, 
  Truck, 
  Gauge, 
  Wrench,
  Clock,
  Sparkles
} from 'lucide-react';
import { LiveLinkUnit } from '../../types';

interface BatteryHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: LiveLinkUnit | null;
}

export const BatteryHealthModal: React.FC<BatteryHealthModalProps> = ({
  isOpen,
  onClose,
  unit
}) => {
  const [requestedKit, setRequestedKit] = useState(false);

  if (!isOpen) return null;

  // Real-time simulated 24V bus metrics
  const isEngineRunning = unit?.status === 'running';
  const batteryVoltage = isEngineRunning ? 28.2 : 24.9; // Alternator charging vs rest
  const alternatorVoltage = isEngineRunning ? 28.3 : 0;
  const healthPercent = 91; // State of Health (SOH)
  const ccaRating = 1120; // Cold Cranking Amps out of 1200
  const internalResistanceMOhms = 4.2; // <5 mOhms is optimal

  const isVoltageWarning = !isEngineRunning && batteryVoltage < 23.4;
  const isVoltageCritical = !isEngineRunning && batteryVoltage < 22.8;

  const handleExportElectricalReport = () => {
    const reportText = `=====================================================
TMD DOMINICANA - INSPECCIÓN DEL SISTEMA ELÉCTRICO 24V (CAN-BUS)
=====================================================
Equipo: ${unit?.model || 'LiuGong / JCB'} | Serie: ${unit?.serialNumber || 'TMD-FLEET'}
Fecha: ${new Date().toLocaleDateString('es-DO')} ${new Date().toLocaleTimeString('es-DO')}
Módulo Telemático: J1939 ECU Electrical Monitor

1. PARÁMETROS DEL BUS DE 24V DC:
   - Estado del Motor: ${isEngineRunning ? 'EN MARCHA (Carga Activa)' : 'APAGADO (En Reposo)'}
   - Voltaje en Bornes de Batería: ${batteryVoltage} V (Rango óptimo reposo: 24.8V - 25.6V)
   - Tensión del Alternador: ${alternatorVoltage > 0 ? alternatorVoltage + ' V (Regulación Delco Remy OK)' : 'Inactivo (Motor detenido)'}
   - Corriente de Arranque en Frío (CCA): ${ccaRating} CCA de 1200 CCA (${healthPercent}% SOH)
   - Resistencia Interna: ${internalResistanceMOhms} mΩ (Excelente, sin sulfatación)

2. DIAGNÓSTICO DE COMPONENTES:
   - Banco de Baterías 12V x 2 en Serie: Estado Óptimo (91% Vida Útil)
   - Diodos y Regulador del Alternador: Sin oscilaciones parásitas (Ripple < 0.2V)
   - Solenoide del Motor de Arranque: Resistencia de contacto dentro de norma OEM

3. RECOMENDACIONES DE SERVICIO TMD:
   - Limpieza periódica de terminales con grasa dieléctrica en ambientes salinos o de cantera.
   - Siguiente prueba de descarga pesada programada para el mantenimiento preventivo de las 500h.
=====================================================
Certificado oficial de taller central Km 22, Autopista Duarte.
`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TMD_Reporte_Electrico_24V_${unit?.model || 'Equipo'}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 font-mono animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-[5px] max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[2px] bg-amber-400 text-black shadow-md">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[2px] bg-amber-400/20 text-amber-400 border border-amber-400/30">
                  Monitoreo Sistema Eléctrico 24V (Task #54)
                </span>
                <span className="text-[10px] text-zinc-400">
                  Sensor CAN-Bus SPN 168
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight mt-0.5 font-display">
                Diagnóstico de Batería & Alternador: {unit?.model || 'LiuGong 922E'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportElectricalReport}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border border-zinc-700"
              title="Descargar reporte eléctrico oficial"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Exportar TXT</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-[2px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Main 24V Live Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Battery Voltage Card */}
            <div className="p-4 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span className="uppercase font-bold text-[10px]">Tensión del Banco 24V</span>
                <BatteryCharging className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-amber-400 font-mono">{batteryVoltage.toFixed(1)} V</span>
                <span className="text-xs text-zinc-400 font-bold uppercase">
                  {isEngineRunning ? '(Carga Activa)' : '(En Reposo)'}
                </span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-[1px] overflow-hidden">
                <div 
                  className={`h-full rounded-[1px] ${batteryVoltage >= 24.5 ? 'bg-emerald-400' : 'bg-rose-500'}`}
                  style={{ width: `${Math.min(100, (batteryVoltage / 30) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-500 block">Rango nominal en reposo: 24.8V – 25.6V DC</span>
            </div>

            {/* Alternator Status Card */}
            <div className="p-4 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span className="uppercase font-bold text-[10px]">Alternador Heavy Duty</span>
                <Activity className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-mono">
                  {isEngineRunning ? `${alternatorVoltage.toFixed(1)} V` : '0.0 V'}
                </span>
                <span className="text-xs text-emerald-400 font-bold">
                  {isEngineRunning ? 'REGULANDO OK' : 'MOTOR DETENIDO'}
                </span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-[1px] overflow-hidden">
                <div 
                  className="h-full bg-cyan-400 rounded-[1px]"
                  style={{ width: isEngineRunning ? '94%' : '0%' }}
                />
              </div>
              <span className="text-[10px] text-zinc-500 block">Regulación de carga óptima: 27.8V – 28.6V DC</span>
            </div>

            {/* State of Health (SOH) */}
            <div className="p-4 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span className="uppercase font-bold text-[10px]">Salud de Acumuladores (SOH)</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-400 font-mono">{healthPercent}%</span>
                <span className="text-xs text-zinc-400">({ccaRating} CCA)</span>
              </div>
              <div className="text-[10px] text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-800">
                <span>Resistencia interna:</span>
                <strong className="text-white font-mono">{internalResistanceMOhms} mΩ (Excelente)</strong>
              </div>
            </div>

          </div>

          {/* Diagnostic Interpretation Table */}
          <div className="p-4 bg-zinc-950 rounded-[3px] border border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
              <Gauge className="w-4 h-4 text-amber-400" />
              <span>Semáforo de Diagnóstico Eléctrico J1939</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-[2px] bg-zinc-900 border border-emerald-500/30 space-y-1">
                <span className="font-bold text-emerald-400 uppercase text-[10px] block">
                  🟢 Estado Óptimo (24.8V – 28.5V)
                </span>
                <p className="text-zinc-400 text-[11px] leading-relaxed font-sans">
                  Arranque instantáneo en obra. Alternador entregando amperaje completo para luces LED y aire acondicionado.
                </p>
              </div>

              <div className="p-3 rounded-[2px] bg-zinc-900 border border-amber-400/30 space-y-1">
                <span className="font-bold text-amber-400 uppercase text-[10px] block">
                  🟡 Advertencia (23.4V – 24.5V)
                </span>
                <p className="text-zinc-400 text-[11px] leading-relaxed font-sans">
                  Descarga leve por inactividad prolongada o consumo residual en reposo. Se recomienda inspección de bornes.
                </p>
              </div>

              <div className="p-3 rounded-[2px] bg-zinc-900 border border-rose-500/30 space-y-1">
                <span className="font-bold text-rose-400 uppercase text-[10px] block">
                  🔴 Estado Crítico (&lt;22.8V)
                </span>
                <p className="text-zinc-400 text-[11px] leading-relaxed font-sans">
                  Riesgo inminente de fallo de arranque de la máquina. Requiere carga externa o recambio de baterías 12V.
                </p>
              </div>
            </div>
          </div>

          {/* 1-Click Spare Batteries Kit Dispatch Request */}
          <div className="p-4 rounded-[3px] bg-gradient-to-r from-amber-950/20 via-zinc-950 to-zinc-950 border border-amber-400/30 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-[2px] bg-amber-400 text-black shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-white uppercase tracking-wider text-xs font-display">
                  Kit de Baterías OEM Heavy Duty (2x 12V 1200 CCA)
                </h5>
                <p className="text-[11px] text-zinc-400 font-sans">
                  Despacho exprés desde almacén central Km 22 con entrega en obra o cantera en menos de 2 horas.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setRequestedKit(true)}
              disabled={requestedKit}
              className={`px-4 py-2 rounded-[2px] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                requestedKit
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                  : 'bg-amber-400 hover:bg-amber-300 text-black'
              }`}
            >
              {requestedKit ? '✓ Solicitud Recibida en Taller' : 'Pedir Kit de Baterías (US$ 480)'}
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sensores de tensión certificados bajo norma SAE J1939-11.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
