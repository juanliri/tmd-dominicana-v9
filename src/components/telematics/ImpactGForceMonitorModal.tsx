import React, { useState } from 'react';
import {
  Compass,
  AlertTriangle,
  ShieldAlert,
  Radio,
  Clock,
  MapPin,
  X,
  Download,
  RotateCcw,
  Zap,
  Activity,
  Sliders,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';

interface ImpactEventLog {
  id: string;
  timestamp: string;
  gForcePeak: number;
  axis: 'X (Frontal/Trasero)' | 'Y (Lateral)' | 'Z (Vertical/Bache)' | 'ROLL (Vuelco)';
  rollAngleDeg: number;
  pitchAngleDeg: number;
  speedKmh: number;
  severity: 'CRITICAL_ROLLOVER' | 'SEVERE_IMPACT' | 'MODERATE_SHOCK' | 'NORMAL_VIBRATION';
  coordinates: string;
  locationName: string;
  insuranceDossierReady: boolean;
}

interface ImpactGForceMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineName?: string;
  machineSerial?: string;
}

export const ImpactGForceMonitorModal: React.FC<ImpactGForceMonitorModalProps> = ({
  isOpen,
  onClose,
  machineName = 'LiuGong 922E HD #EQ-104',
  machineSerial = 'LG922E-DOM-2024-8841'
}) => {
  // Real-time sensor state
  const [currentGForce, setCurrentGForce] = useState<number>(1.1); // normal gravity ~1.0 G
  const [rollAngle, setRollAngle] = useState<number>(4.2); // Degrees roll
  const [pitchAngle, setPitchAngle] = useState<number>(6.8); // Degrees pitch
  const [xAxisG, setXAxisG] = useState<number>(0.15);
  const [yAxisG, setYAxisG] = useState<number>(0.12);
  const [zAxisG, setZAxisG] = useState<number>(1.08);

  const [incidentLogs, setIncidentLogs] = useState<ImpactEventLog[]>([
    {
      id: 'IMP-2026-9041',
      timestamp: '2026-09-24 14:22:18',
      gForcePeak: 4.8,
      axis: 'X (Frontal/Trasero)',
      rollAngleDeg: 12.4,
      pitchAngleDeg: 28.5,
      speedKmh: 14.2,
      severity: 'SEVERE_IMPACT',
      coordinates: '18.4214° N, 70.1143° W',
      locationName: 'Frente de Cantera San Cristóbal (Impacto contra talud de roca)',
      insuranceDossierReady: true
    },
    {
      id: 'IMP-2026-8812',
      timestamp: '2026-09-18 10:05:40',
      gForcePeak: 2.9,
      axis: 'Z (Vertical/Bache)',
      rollAngleDeg: 8.1,
      pitchAngleDeg: 11.0,
      speedKmh: 18.5,
      severity: 'MODERATE_SHOCK',
      coordinates: '18.9142° N, 70.4210° W',
      locationName: 'Paso por bache profundo en camino de acarreo Cerro Maimón',
      insuranceDossierReady: true
    }
  ]);

  if (!isOpen) return null;

  // Severity evaluation
  const isRolloverRisk = Math.abs(rollAngle) > 30 || Math.abs(pitchAngle) > 35;
  const isCriticalImpact = currentGForce >= 3.5;

  const handleSimulateImpact = (gVal: number, rollDeg: number) => {
    setCurrentGForce(gVal);
    setRollAngle(rollDeg);
    setYAxisG(Number((gVal * 0.7).toFixed(2)));
    setXAxisG(Number((gVal * 0.4).toFixed(2)));

    if (gVal >= 3.0 || Math.abs(rollDeg) > 25) {
      const newLog: ImpactEventLog = {
        id: `IMP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleDateString('es-DO', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        gForcePeak: gVal,
        axis: Math.abs(rollDeg) > 25 ? 'ROLL (Vuelco)' : 'X (Frontal/Trasero)',
        rollAngleDeg: rollDeg,
        pitchAngleDeg: pitchAngle,
        speedKmh: 12.0,
        severity: Math.abs(rollDeg) > 35 ? 'CRITICAL_ROLLOVER' : gVal > 4.0 ? 'SEVERE_IMPACT' : 'MODERATE_SHOCK',
        coordinates: '18.4214° N, 70.1143° W',
        locationName: 'Cantera San Cristóbal • Alarma Telemática Satelital',
        insuranceDossierReady: true
      };
      setIncidentLogs(prev => [newLog, ...prev]);
    }
  };

  const handleResetSensor = () => {
    setCurrentGForce(1.05);
    setRollAngle(4.2);
    setPitchAngle(6.8);
    setXAxisG(0.15);
    setYAxisG(0.12);
    setZAxisG(1.02);
  };

  const handleExportCsv = () => {
    const headers = 'ID_EVENTO,FECHA_HORA,FUERZA_G_PICO,EJE_IMPACTO,ANGULO_ROLL,ANGULO_PITCH,VELOCIDAD_KMH,SEVERIDAD,COORDENADAS,UBICACION,EXPEDIENTE_SEGURO\n';
    const rows = incidentLogs.map(l => 
      `"${l.id}","${l.timestamp}","${l.gForcePeak}","${l.axis}","${l.rollAngleDeg}°","${l.pitchAngleDeg}°","${l.speedKmh}","${l.severity}","${l.coordinates}","${l.locationName}","${l.insuranceDossierReady ? 'SI' : 'NO'}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TMD_BLACKBOX_IMPACTOS_${machineSerial}_${new Date().toISOString().slice(0, 10)}.csv`;
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
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-[3px] border ${
              isCriticalImpact || isRolloverRisk
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 animate-pulse'
                : 'bg-amber-400/10 border-amber-400/30 text-amber-400'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-[2px] text-[10px] font-bold uppercase tracking-wider ${
                  isCriticalImpact || isRolloverRisk ? 'bg-rose-500 text-white' : 'bg-amber-400 text-black'
                }`}>
                  ACELERÓMETRO J1939 • CAJA NEGRA
                </span>
                <span className="text-xs text-zinc-400 font-sans">
                  Detección de Golpes, Vuelcos & Aceleración Brusca
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-white mt-0.5">
                Monitor de Impactos & Sensor de Volcadura G-Force
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase transition-all cursor-pointer border border-zinc-700"
              title="Descargar historial de caja negra para peritaje de aseguradoras (Universal/Mapfre)"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Peritaje Seguros</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Machine Status Bar */}
        <div className="p-3.5 bg-zinc-900/40 border-b border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-zinc-500 text-[10px] block">EQUIPO:</span>
            <span className="text-white font-bold">{machineName}</span>
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] block">SERIAL CHASIS:</span>
            <span className="text-zinc-300 font-mono">{machineSerial}</span>
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] block">ESTADO DINÁMICO:</span>
            <span className={`font-bold flex items-center gap-1.5 ${
              isCriticalImpact || isRolloverRisk ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
            }`}>
              {isRolloverRisk ? '⚠️ ALERTA DE VUELCO INMINENTE' : isCriticalImpact ? '⚠️ IMPACTO SEVERO REGISTRADO' : '✓ ESTABILIDAD ESTRUCTURAL NORMAL'}
            </span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Main Gauges: G-Force and Inclinometer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* G-Force Peak Gauge */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-zinc-400 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-amber-400" /> Aceleración Resultante
                </span>
                <span className={`text-xl font-black font-mono ${
                  currentGForce >= 3.5 ? 'text-rose-400' : 'text-white'
                }`}>
                  {currentGForce.toFixed(2)} G
                </span>
              </div>

              {/* G-Force Progress Bar */}
              <div className="h-3.5 bg-zinc-950 rounded-[2px] border border-zinc-800 overflow-hidden relative">
                <div 
                  className={`h-full transition-all duration-300 ${
                    currentGForce >= 3.5 ? 'bg-rose-500' : currentGForce >= 2.5 ? 'bg-amber-400' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, (currentGForce / 6.0) * 100)}%` }}
                />
                {/* 3.5G threshold marker */}
                <div 
                  className="absolute top-0 bottom-0 left-[58.3%] w-0.5 bg-rose-500 z-10" 
                  title="Umbral de Alerta Severa (3.5 G)" 
                />
              </div>

              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>1.0 G (Gravedad)</span>
                <span className="text-amber-400">2.5 G Alerta</span>
                <span className="text-rose-400">&gt; 3.5 G Choque</span>
              </div>

              {/* 3-Axis breakdown */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80 text-[10px]">
                <div className="bg-zinc-950 p-2 rounded-[2px] border border-zinc-800">
                  <span className="text-zinc-500 block">EJE X (Long):</span>
                  <span className="text-zinc-200 font-bold">{xAxisG} G</span>
                </div>
                <div className="bg-zinc-950 p-2 rounded-[2px] border border-zinc-800">
                  <span className="text-zinc-500 block">EJE Y (Lat):</span>
                  <span className="text-zinc-200 font-bold">{yAxisG} G</span>
                </div>
                <div className="bg-zinc-950 p-2 rounded-[2px] border border-zinc-800">
                  <span className="text-zinc-500 block">EJE Z (Vert):</span>
                  <span className="text-zinc-200 font-bold">{zAxisG} G</span>
                </div>
              </div>
            </div>

            {/* Inclinometer: Pitch & Roll */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-zinc-400 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-cyan-400" /> Inclinómetro de Cabina
                </span>
                <span className={`text-xs font-black font-mono px-2 py-0.5 rounded-[2px] ${
                  isRolloverRisk ? 'bg-rose-500 text-white' : 'bg-zinc-950 text-emerald-400 border border-zinc-800'
                }`}>
                  {isRolloverRisk ? 'PELIGRO DE VOLCADURA' : 'ÁNGULO SEGURO'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Roll Angle */}
                <div className="bg-zinc-950 p-3 rounded-[2px] border border-zinc-800 space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase block">INCLINACIÓN LATERAL (ROLL):</span>
                  <div className={`text-lg font-black font-mono ${
                    Math.abs(rollAngle) > 25 ? 'text-rose-400' : 'text-white'
                  }`}>
                    {rollAngle > 0 ? `+${rollAngle}°` : `${rollAngle}°`}
                  </div>
                  <span className="text-[10px] text-zinc-400 font-sans block">Límite volcamiento: ±30°</span>
                </div>

                {/* Pitch Angle */}
                <div className="bg-zinc-950 p-3 rounded-[2px] border border-zinc-800 space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase block">PENDIENTE PITCH (FRONTAL):</span>
                  <div className={`text-lg font-black font-mono ${
                    Math.abs(pitchAngle) > 30 ? 'text-amber-400' : 'text-white'
                  }`}>
                    {pitchAngle > 0 ? `+${pitchAngle}°` : `${pitchAngle}°`}
                  </div>
                  <span className="text-[10px] text-zinc-400 font-sans block">Capacidad pendiente: 35° (70%)</span>
                </div>
              </div>

              {/* Graphic visualizer representation */}
              <div className="p-2.5 bg-zinc-950 rounded-[2px] border border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                <span>Inclinación de chasis respecto al plano horizontal:</span>
                <div 
                  className="w-16 h-4 bg-zinc-800 border border-amber-400/60 rounded-[1px] transition-transform duration-300"
                  style={{ transform: `rotate(${rollAngle}deg)` }}
                  title="Inclinación visual de cabina"
                />
              </div>
            </div>
          </div>

          {/* Test Simulator Controls */}
          <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-[3px] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-mono flex items-center gap-1.5 text-[10px] uppercase">
                <Sliders className="w-3.5 h-3.5 text-amber-400" /> Simulador de Telemetría para Pruebas en Vivo:
              </span>
              <button
                type="button"
                onClick={handleResetSensor}
                className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Restablecer a 1.0G / 4°
              </button>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleSimulateImpact(2.2, 8.0)}
                className="px-2.5 py-1 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] cursor-pointer"
              >
                Simular Bache Fuerte (2.2 G)
              </button>
              <button
                type="button"
                onClick={() => handleSimulateImpact(4.5, 14.0)}
                className="px-2.5 py-1 rounded-[2px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-[11px] cursor-pointer"
              >
                Simular Impacto Cantera (4.5 G)
              </button>
              <button
                type="button"
                onClick={() => handleSimulateImpact(5.8, 38.0)}
                className="px-2.5 py-1 rounded-[2px] bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-[11px] cursor-pointer font-bold"
              >
                Simular Vuelco en Talud (38° Roll)
              </button>
            </div>
          </div>

          {/* Black Box Incident History */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-zinc-400 uppercase flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Bitácora de Caja Negra Satelital (Telematics Black Box)
            </h4>

            <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] divide-y divide-zinc-800 text-xs">
              {incidentLogs.map(log => (
                <div key={log.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.2 rounded-[2px] text-[10px] font-bold ${
                        log.severity === 'CRITICAL_ROLLOVER'
                          ? 'bg-rose-600 text-white'
                          : log.severity === 'SEVERE_IMPACT'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                      }`}>
                        {log.severity === 'CRITICAL_ROLLOVER' ? 'VOLCADURA' : log.severity === 'SEVERE_IMPACT' ? 'CHOQUE SEVERO' : 'IMPACTO MODERADO'}
                      </span>
                      <span className="text-white font-bold">{log.gForcePeak.toFixed(1)} G Pico</span>
                      <span className="text-zinc-500 font-mono text-[10px]">{log.timestamp}</span>
                    </div>

                    <p className="text-zinc-300 font-sans text-xs">{log.locationName}</p>

                    <div className="text-[10px] text-zinc-500 flex items-center gap-3">
                      <span>Eje: {log.axis}</span>
                      <span>&bull;</span>
                      <span>Roll: {log.rollAngleDeg}° / Pitch: {log.pitchAngleDeg}°</span>
                      <span>&bull;</span>
                      <span>Vel: {log.speedKmh} km/h</span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-[2px] border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Dossier Aseguradora Listo
                    </span>
                    <span className="block text-[10px] text-zinc-500 font-mono mt-0.5">{log.coordinates}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Frecuencia de muestreo telemático: 100 Hz (Acelerómetro triaxial Queclink)
          </span>
          <span className="font-mono text-[10px]">TMD Safety Guard v9</span>
        </div>
      </div>
    </div>
  );
};
