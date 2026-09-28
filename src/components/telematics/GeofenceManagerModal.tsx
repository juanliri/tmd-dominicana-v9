import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  MapPin, 
  ShieldAlert, 
  ShieldCheck, 
  Compass, 
  Layers, 
  AlertTriangle, 
  Plus, 
  Download, 
  Share2, 
  Radio, 
  CheckCircle2, 
  Clock, 
  Eye, 
  FileText, 
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

interface GeofenceZone {
  id: string;
  name: string;
  location: string;
  type: 'cantera' | 'carretera' | 'mina' | 'patio';
  areaKm2: number;
  assignedMachines: {
    id: string;
    model: string;
    serial: string;
    status: 'inside' | 'breach' | 'warning';
    lastCoord: string;
    speedKmH: number;
    distanceToBorderM: number;
  }[];
  vertices: { x: number; y: number }[];
  alertRecipients: string[];
  maxSpeedLimitKmH: number;
}

const SAMPLE_GEOFENCES: GeofenceZone[] = [
  {
    id: 'geo-01',
    name: 'Cantera Yaguate - Cemex',
    location: 'San Cristóbal / Yaguate, Rep. Dom.',
    type: 'cantera',
    areaKm2: 4.2,
    assignedMachines: [
      { id: 'm1', model: 'LiuGong 922E', serial: 'LG-922E-0084', status: 'inside', lastCoord: '18.3182° N, 70.1824° W', speedKmH: 14, distanceToBorderM: 240 },
      { id: 'm2', model: 'JCB 3CX Eco', serial: 'JCB-3CX-1102', status: 'inside', lastCoord: '18.3195° N, 70.1802° W', speedKmH: 8, distanceToBorderM: 190 },
      { id: 'm3', model: 'LiuGong 856H', serial: 'LG-856H-0341', status: 'inside', lastCoord: '18.3168° N, 70.1840° W', speedKmH: 18, distanceToBorderM: 310 }
    ],
    vertices: [
      { x: 30, y: 25 },
      { x: 75, y: 20 },
      { x: 88, y: 65 },
      { x: 60, y: 85 },
      { x: 22, y: 70 }
    ],
    alertRecipients: ['+1 (809) 560-1234', 'seguridad@canterayaguate.do'],
    maxSpeedLimitKmH: 25
  },
  {
    id: 'geo-02',
    name: 'Ampliación Autovía del Este',
    location: 'Tramo Boca Chica - Juan Dolio, SPM',
    type: 'carretera',
    areaKm2: 14.8,
    assignedMachines: [
      { id: 'm4', model: 'LiuGong 922E HD', serial: 'LG-922E-0099', status: 'breach', lastCoord: '18.4320° N, 69.5120° W', speedKmH: 29, distanceToBorderM: -320 },
      { id: 'm5', model: 'Ammann ARX 26', serial: 'AMM-ARX-0044', status: 'inside', lastCoord: '18.4290° N, 69.5240° W', speedKmH: 5, distanceToBorderM: 140 }
    ],
    vertices: [
      { x: 15, y: 40 },
      { x: 85, y: 35 },
      { x: 92, y: 55 },
      { x: 18, y: 60 }
    ],
    alertRecipients: ['+1 (809) 701-8899', 'obras@corredoreste.com.do'],
    maxSpeedLimitKmH: 30
  },
  {
    id: 'geo-03',
    name: 'Presa de Monte Grande',
    location: 'Cuenca Río Yaque del Sur, Barahona',
    type: 'mina',
    areaKm2: 18.5,
    assignedMachines: [
      { id: 'm6', model: 'LiuGong 936E', serial: 'LG-936E-0012', status: 'inside', lastCoord: '18.3840° N, 71.1890° W', speedKmH: 12, distanceToBorderM: 650 },
      { id: 'm7', model: 'JCB JS220', serial: 'JCB-JS22-0490', status: 'inside', lastCoord: '18.3810° N, 71.1920° W', speedKmH: 15, distanceToBorderM: 520 }
    ],
    vertices: [
      { x: 25, y: 30 },
      { x: 70, y: 15 },
      { x: 90, y: 45 },
      { x: 80, y: 80 },
      { x: 35, y: 85 }
    ],
    alertRecipients: ['+1 (809) 555-4321', 'montegrande.flota@indrhi.gob.do'],
    maxSpeedLimitKmH: 20
  },
  {
    id: 'geo-04',
    name: 'Patio Taller Central TMD Km 22',
    location: 'Autopista Duarte Km 22, Pedro Brand',
    type: 'patio',
    areaKm2: 0.8,
    assignedMachines: [
      { id: 'm8', model: 'Yanmar VIO35', serial: 'YAN-VIO35-010', status: 'inside', lastCoord: '18.5482° N, 69.9921° W', speedKmH: 0, distanceToBorderM: 110 }
    ],
    vertices: [
      { x: 20, y: 20 },
      { x: 80, y: 20 },
      { x: 80, y: 80 },
      { x: 20, y: 80 }
    ],
    alertRecipients: ['+1 (809) 560-1234', 'seguridad@tmd.com.do'],
    maxSpeedLimitKmH: 15
  }
];

interface GeofenceManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeofenceManagerModal: React.FC<GeofenceManagerModalProps> = ({ isOpen, onClose }) => {
  const [selectedZone, setSelectedZone] = useState<GeofenceZone>(SAMPLE_GEOFENCES[0]);
  const [alertFilter, setAlertFilter] = useState<'all' | 'breach'>('all');
  const [isSimulatingBreach, setIsSimulatingBreach] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  if (!isOpen || typeof document === 'undefined') return null;

  const totalMachines = SAMPLE_GEOFENCES.reduce((acc, z) => acc + z.assignedMachines.length, 0);
  const totalBreaches = SAMPLE_GEOFENCES.reduce(
    (acc, z) => acc + z.assignedMachines.filter((m) => m.status === 'breach').length,
    0
  );

  const handleSimulateAlarm = () => {
    setIsSimulatingBreach(true);
    setShowNotificationToast(true);
    setTimeout(() => {
      setShowNotificationToast(false);
    }, 4500);
  };

  const handleExportGeofenceAudit = () => {
    let report = `========================================================================\n`;
    report += `TMD DOMINICANA - REPORTE FORENSE DE GEOCERCAS Y SALIDA DE OBRA\n`;
    report += `Generado: ${new Date().toLocaleString('es-DO')} | Servidor LiveLink J1939\n`;
    report += `========================================================================\n\n`;
    report += `RESUMEN DE FLOTA MONITOREADA:\n`;
    report += `• Zonas Geocercadas Activas: ${SAMPLE_GEOFENCES.length}\n`;
    report += `• Unidades Monitoreadas: ${totalMachines}\n`;
    report += `• Incursiones / Desviaciones Fuera de Obra: ${totalBreaches}\n\n`;

    SAMPLE_GEOFENCES.forEach((z) => {
      report += `------------------------------------------------------------------------\n`;
      report += `ZONA: ${z.name.toUpperCase()} (${z.location})\n`;
      report += `Área: ${z.areaKm2} km² | Límite Velocidad: ${z.maxSpeedLimitKmH} km/h\n`;
      report += `Alertas Despachadas a: ${z.alertRecipients.join(', ')}\n\n`;
      report += `EQUIPOS ASIGNADOS:\n`;
      z.assignedMachines.forEach((m) => {
        report += ` - [${m.status.toUpperCase()}] ${m.model} (${m.serial})\n`;
        report += `   Coordenadas GPS: ${m.lastCoord} | Vel: ${m.speedKmH} km/h | Distancia Borde: ${m.distanceToBorderM}m\n`;
      });
      report += `\n`;
    });

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TMD_Geocercas_Forense_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-zinc-950 rounded-[5px] border border-zinc-800 max-w-5xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[94vh] flex flex-col overflow-hidden font-mono text-zinc-100">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[3px] bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/20">
              <Compass className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider font-display">
                  LiveLink Telematics J1939 • Módulo de Seguridad
                </span>
                <span className="px-1.5 py-0.2 rounded-[2px] bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20">
                  GPS SATELITAL ACTIVO
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-tight font-display">
                Geocercas Poligonales Dinámicas de Obra
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportGeofenceAudit}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-bold transition-colors cursor-pointer"
              title="Descargar Auditoría de Geocercas TXT"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>EXPORTAR REPORTE</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-[2px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Alert Bar if Breaches exist */}
        {totalBreaches > 0 && (
          <div className="bg-rose-950/40 border border-rose-500/40 rounded-[3px] p-3 flex items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse shrink-0" />
              <div>
                <span className="font-bold text-rose-300 uppercase block font-display">
                  ALERTA CRÍTICA: {totalBreaches} EQUIPO FUERA DE GEOCERCA AUTORIZADA
                </span>
                <span className="text-zinc-400 text-[11px]">
                  LiuGong 922E HD detectado a 320 metros fuera del polígono en Ampliación Autovía del Este.
                </span>
              </div>
            </div>
            <button
              onClick={handleSimulateAlarm}
              className="px-3 py-1.5 rounded-[2px] bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] uppercase tracking-wider shrink-0 transition-colors cursor-pointer"
            >
              NOTIFICAR A OBRA
            </button>
          </div>
        )}

        {/* Toast simulated */}
        {showNotificationToast && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs p-2.5 rounded-[3px] flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Alerta despachada vía WhatsApp y SMS a ingenieros residentes y seguridad de obra.</span>
          </div>
        )}

        {/* Main Grid: Left List of Geofences + Right Interactive Polygon Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden min-h-0">
          
          {/* Left Column: Zone Selector (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-2.5 overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
              <span className="font-bold uppercase tracking-wider text-[10px]">Polígonos Registrados ({SAMPLE_GEOFENCES.length})</span>
              <span className="text-amber-400 text-[10px] font-bold">{totalMachines} Máquinas Vinculadas</span>
            </div>

            {SAMPLE_GEOFENCES.map((zone) => {
              const isSelected = selectedZone.id === zone.id;
              const hasBreach = zone.assignedMachines.some((m) => m.status === 'breach');

              return (
                <div
                  key={zone.id}
                  onClick={() => setSelectedZone(zone)}
                  className={`p-3 rounded-[3px] border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-zinc-900 border-amber-400/80 shadow-md ring-1 ring-amber-400/20'
                      : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <h4 className="font-bold text-white text-xs uppercase tracking-tight truncate max-w-[200px]">
                        {zone.name}
                      </h4>
                    </div>
                    {hasBreach ? (
                      <span className="px-1.5 py-0.5 rounded-[2px] bg-rose-500/20 text-rose-400 text-[9px] font-bold uppercase border border-rose-500/30 animate-pulse">
                        DESVIACIÓN
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-[2px] bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase border border-emerald-500/20">
                        ZONA OK
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-zinc-400 mb-2 truncate">
                    {zone.location}
                  </p>

                  <div className="grid grid-cols-3 gap-1 pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-400">
                    <div>
                      <span className="text-zinc-500 block text-[9px]">ÁREA</span>
                      <span className="text-zinc-200 font-bold">{zone.areaKm2} km²</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9px]">MÁQUINAS</span>
                      <span className="text-amber-400 font-bold">{zone.assignedMachines.length} uds</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9px]">LÍMITE VEL.</span>
                      <span className="text-zinc-200 font-bold">{zone.maxSpeedLimitKmH} km/h</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add Zone Action Card */}
            <div className="p-3 rounded-[3px] border border-dashed border-zinc-800 hover:border-amber-400/50 text-center transition-colors cursor-pointer group mt-1">
              <Plus className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-zinc-400 group-hover:text-zinc-200 uppercase tracking-wider">
                + Trazar Nuevo Polígono en Mapa
              </span>
            </div>
          </div>

          {/* Right Column: Zone Radar & Live Machines (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-3 overflow-y-auto">
            
            {/* SVG Polygon Graphic Visualizer */}
            <div className="bg-zinc-900 rounded-[3px] border border-zinc-800 p-4 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Radar Perimetral 2D • {selectedZone.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">
                  WGS84 UTM 19N • Buffer: 50m
                </span>
              </div>

              {/* Vector Polygon Canvas Simulation */}
              <div className="relative w-full aspect-[16/9] bg-zinc-950 rounded-[3px] border border-zinc-800 flex items-center justify-center overflow-hidden">
                {/* Coordinate Grid Background */}
                <div 
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage: 'linear-gradient(to right, #3f3f46 1px, transparent 1px), linear-gradient(to bottom, #3f3f46 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                  }}
                />

                {/* SVG Polygon overlay */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polygon
                    points={selectedZone.vertices.map((v) => `${v.x},${v.y}`).join(' ')}
                    fill="rgba(245, 158, 11, 0.08)"
                    stroke="#f59e0b"
                    strokeWidth="1.2"
                    strokeDasharray="2 1"
                  />
                  {selectedZone.vertices.map((v, i) => (
                    <circle
                      key={i}
                      cx={v.x}
                      cy={v.y}
                      r="1.6"
                      fill="#f59e0b"
                      stroke="#000"
                      strokeWidth="0.5"
                    />
                  ))}
                </svg>

                {/* Equipment Markers inside or outside */}
                {selectedZone.assignedMachines.map((m, idx) => {
                  const isBreach = m.status === 'breach';
                  // Calculate mock relative positioning inside or outside
                  const posX = isBreach ? 94 : 35 + idx * 20;
                  const posY = isBreach ? 22 : 45 + (idx % 2) * 15;

                  return (
                    <div
                      key={m.id}
                      style={{ left: `${posX}%`, top: `${posY}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10"
                    >
                      <div className="relative">
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                          isBreach 
                            ? 'bg-rose-500 text-white animate-ping' 
                            : 'bg-emerald-400 text-black shadow-md'
                        }`} />
                        <span className={`absolute inset-0 w-3.5 h-3.5 rounded-full ${
                          isBreach ? 'bg-rose-500' : 'bg-emerald-400'
                        }`} />
                      </div>

                      {/* Tooltip Tag */}
                      <div className="mt-1 px-1.5 py-0.5 rounded-[2px] bg-zinc-950/90 border border-zinc-700 text-[9px] text-zinc-200 whitespace-nowrap shadow-lg">
                        <span className="font-bold">{m.model}</span> • {m.speedKmH} km/h
                      </div>
                    </div>
                  );
                })}

                {/* Watermark / Legend */}
                <div className="absolute bottom-2 left-2 bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 px-2 py-1 rounded-[2px] text-[9px] flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-zinc-300">Dentro de Zona</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-rose-400 font-bold">Desviación / Salida</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Machine Table in Selected Zone */}
            <div className="bg-zinc-900 rounded-[3px] border border-zinc-800 p-3 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Equipos en esta Geocerca ({selectedZone.assignedMachines.length})
                </span>
                <span className="text-[10px] text-zinc-400">
                  Transmisión cada 15 segundos
                </span>
              </div>

              <div className="space-y-2 overflow-y-auto max-h-48">
                {selectedZone.assignedMachines.map((m) => (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-[2px] border flex items-center justify-between gap-3 text-xs ${
                      m.status === 'breach'
                        ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {m.status === 'breach' ? (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold text-white uppercase block">
                          {m.model} <span className="text-[10px] text-zinc-400 font-normal">({m.serial})</span>
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {m.lastCoord} • {m.speedKmH} km/h
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      {m.status === 'breach' ? (
                        <span className="px-2 py-0.5 rounded-[2px] bg-rose-600 text-white font-bold text-[9px] uppercase tracking-wider">
                          +{Math.abs(m.distanceToBorderM)}m FUERA
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">
                          {m.distanceToBorderM}m al borde
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notification Dispatch Settings */}
            <div className="bg-zinc-950 rounded-[3px] border border-zinc-800 p-3 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-zinc-300 uppercase text-[10px]">
                  Protocolo Automático de Incursión
                </span>
                <span className="text-[10px] text-amber-400 font-bold">ACTIVO 24/7</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Al detectarse salida no autorizada: disparo inmediato de SMS a superintendencia, sirena en cabina y registro de coordenadas en bitácora judicial.
              </p>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <span className="text-[10px] font-mono">
            TMD LiveLink Geofence Engine v4.2 • Certificado DGII & Aseguradoras
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
