import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Compass, 
  Gauge, 
  Fuel, 
  MapPin, 
  Calendar, 
  Clock, 
  Download, 
  Radio, 
  Navigation2, 
  ChevronRight,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { LiveLinkUnit } from '../../types';

interface RouteWaypoint {
  id: number;
  timestamp: string;
  lat: number;
  lng: number;
  speedKmH: number;
  rpm: number;
  fuelPercent: number;
  heading: number; // 0 - 360
  headingText: string;
  status: 'operating' | 'idle' | 'stopped';
  locationName: string;
}

interface RoutePlaybackModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: LiveLinkUnit | null;
}

// Dominican Reference Corridors Data
const DOMINICAN_ROUTES: Record<string, { name: string; description: string; waypoints: RouteWaypoint[] }> = {
  duarte: {
    name: 'Corredor Autopista Duarte (Km 22 → Bonao)',
    description: 'Ruta de traslado y pruebas en Autopista Duarte desde patio central Km 22',
    waypoints: [
      { id: 1, timestamp: '22 Sep 2026 07:15', lat: 18.5714, lng: -70.0381, speedKmH: 0, rpm: 850, fuelPercent: 94, heading: 320, headingText: 'NW', status: 'idle', locationName: 'Patio Central TMD Km 22' },
      { id: 2, timestamp: '22 Sep 2026 07:35', lat: 18.5982, lng: -70.0620, speedKmH: 22, rpm: 1650, fuelPercent: 93, heading: 315, headingText: 'NW', status: 'operating', locationName: 'Autopista Duarte Km 26 (Pedro Brand)' },
      { id: 3, timestamp: '22 Sep 2026 08:10', lat: 18.6650, lng: -70.1550, speedKmH: 28, rpm: 1850, fuelPercent: 90, heading: 300, headingText: 'WNW', status: 'operating', locationName: 'Peaje Villa Altagracia' },
      { id: 4, timestamp: '22 Sep 2026 08:45', lat: 18.7210, lng: -70.2100, speedKmH: 5, rpm: 950, fuelPercent: 88, heading: 290, headingText: 'WNW', status: 'idle', locationName: 'Parada Técnica Río Haina / Los Guineos' },
      { id: 5, timestamp: '22 Sep 2026 09:30', lat: 18.8250, lng: -70.3200, speedKmH: 24, rpm: 1720, fuelPercent: 85, heading: 330, headingText: 'NNW', status: 'operating', locationName: 'Tramo La Cumbre / Maimón' },
      { id: 6, timestamp: '22 Sep 2026 10:15', lat: 18.9400, lng: -70.4100, speedKmH: 18, rpm: 1600, fuelPercent: 82, heading: 345, headingText: 'NNW', status: 'operating', locationName: 'Entrada Bonao Industrial' },
      { id: 7, timestamp: '22 Sep 2026 11:00', lat: 18.9650, lng: -70.4350, speedKmH: 0, rpm: 0, fuelPercent: 81, heading: 350, headingText: 'N', status: 'stopped', locationName: 'Frente de Cantera Falcondo' }
    ]
  },
  nizao: {
    name: 'Cantera San Cristóbal & Río Nizao',
    description: 'Operación intensiva de carga y acarreo de agregados en cuenca Nizao',
    waypoints: [
      { id: 1, timestamp: '24 Sep 2026 06:45', lat: 18.3800, lng: -70.1500, speedKmH: 0, rpm: 800, fuelPercent: 88, heading: 180, headingText: 'S', status: 'idle', locationName: 'Campamento Nizao Base 1' },
      { id: 2, timestamp: '24 Sep 2026 07:30', lat: 18.3650, lng: -70.1700, speedKmH: 8, rpm: 1450, fuelPercent: 86, heading: 210, headingText: 'SSW', status: 'operating', locationName: 'Frente de Extracción Aluvión 3' },
      { id: 3, timestamp: '24 Sep 2026 09:00', lat: 18.3520, lng: -70.1950, speedKmH: 4, rpm: 1900, fuelPercent: 81, heading: 240, headingText: 'WSW', status: 'operating', locationName: 'Alimentación Planta Trituradora' },
      { id: 4, timestamp: '24 Sep 2026 11:30', lat: 18.3480, lng: -70.2010, speedKmH: 0, rpm: 850, fuelPercent: 78, heading: 240, headingText: 'WSW', status: 'idle', locationName: 'Zona de Espera Volquetas (Ralentí)' },
      { id: 5, timestamp: '24 Sep 2026 13:00', lat: 18.3490, lng: -70.2050, speedKmH: 7, rpm: 1820, fuelPercent: 73, heading: 250, headingText: 'WSW', status: 'operating', locationName: 'Acopio Grava Clasificada #4' },
      { id: 6, timestamp: '24 Sep 2026 15:45', lat: 18.3600, lng: -70.1800, speedKmH: 12, rpm: 1550, fuelPercent: 68, heading: 45, headingText: 'NE', status: 'operating', locationName: 'Retorno a Bahía de Mantenimiento' },
      { id: 7, timestamp: '24 Sep 2026 17:00', lat: 18.3800, lng: -70.1500, speedKmH: 0, rpm: 0, fuelPercent: 66, heading: 0, headingText: 'N', status: 'stopped', locationName: 'Campamento Nizao Base 1 (Apagado)' }
    ]
  },
  montegrande: {
    name: 'Presa Monte Grande (Barahona / Azua)',
    description: 'Movimiento masivo de tierras y compactación de dique en proyecto hidroeléctrico',
    waypoints: [
      { id: 1, timestamp: '25 Sep 2026 06:00', lat: 18.4200, lng: -71.1800, speedKmH: 0, rpm: 820, fuelPercent: 95, heading: 90, headingText: 'E', status: 'idle', locationName: 'Parque de Maquinaria Dique Sur' },
      { id: 2, timestamp: '25 Sep 2026 08:00', lat: 18.4350, lng: -71.1650, speedKmH: 6, rpm: 1950, fuelPercent: 90, heading: 60, headingText: 'ENE', status: 'operating', locationName: 'Corte Talud Izquierdo Aliviadero' },
      { id: 3, timestamp: '25 Sep 2026 10:30', lat: 18.4480, lng: -71.1500, speedKmH: 9, rpm: 1800, fuelPercent: 83, heading: 45, headingText: 'NE', status: 'operating', locationName: 'Terraplén Corona Central Km 0+450' },
      { id: 4, timestamp: '25 Sep 2026 12:00', lat: 18.4500, lng: -71.1480, speedKmH: 0, rpm: 800, fuelPercent: 80, heading: 45, headingText: 'NE', status: 'idle', locationName: 'Relevo de Operadores Corona' },
      { id: 5, timestamp: '25 Sep 2026 14:15', lat: 18.4410, lng: -71.1550, speedKmH: 5, rpm: 1880, fuelPercent: 74, heading: 220, headingText: 'SW', status: 'operating', locationName: 'Escarificación Sub-base Arcillosa' },
      { id: 6, timestamp: '25 Sep 2026 16:30', lat: 18.4300, lng: -71.1700, speedKmH: 10, rpm: 1500, fuelPercent: 69, heading: 235, headingText: 'SW', status: 'operating', locationName: 'Vía Acceso Campamento Monte Grande' },
      { id: 7, timestamp: '25 Sep 2026 18:00', lat: 18.4200, lng: -71.1800, speedKmH: 0, rpm: 0, fuelPercent: 67, heading: 270, headingText: 'W', status: 'stopped', locationName: 'Parque Cerrado Dique Sur (Checklist PDI)' }
    ]
  }
};

export const RoutePlaybackModal: React.FC<RoutePlaybackModalProps> = ({
  isOpen,
  onClose,
  unit
}) => {
  const [selectedRouteKey, setSelectedRouteKey] = useState<string>('duarte');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 4x
  const [daysFilter, setDaysFilter] = useState<'24h' | '3d' | '7d'>('7d');

  const activeRoute = DOMINICAN_ROUTES[selectedRouteKey] || DOMINICAN_ROUTES.duarte;
  const waypoints = activeRoute.waypoints;
  const currentWaypoint = waypoints[currentIndex] || waypoints[0];

  // Animation timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      const stepDuration = 2200 / playbackSpeed;
      timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= waypoints.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, stepDuration);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, waypoints.length]);

  if (!isOpen) return null;

  const handlePlayPause = () => {
    if (currentIndex >= waypoints.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const handleExportGpx = () => {
    const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TMD Dominicana LiveLink Satelital 2026">
  <metadata>
    <name>${unit?.model || 'Maquinaria TMD'} - ${activeRoute.name}</name>
    <desc>Historial satelital CAN-Bus J1939 telemetría oficial</desc>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>${unit?.serialNumber || 'TMD-FLEET'}</name>
    <trkseg>
${waypoints.map(wp => `      <trkpt lat="${wp.lat}" lon="${wp.lng}">
        <time>${wp.timestamp}</time>
        <desc>${wp.locationName} - ${wp.speedKmH} km/h - ${wp.rpm} RPM</desc>
      </trkpt>`).join('\n')}
    </trkseg>
  </trk>
</gpx>`;

    const blob = new Blob([gpxContent], { type: 'application/gpx+xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TMD_GPS_Ruta_${unit?.model || 'Equipo'}_${selectedRouteKey}.gpx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Convert GPS coordinates into 2D SVG canvas points for rendering the trail
  const minLat = Math.min(...waypoints.map(w => w.lat));
  const maxLat = Math.max(...waypoints.map(w => w.lat));
  const minLng = Math.min(...waypoints.map(w => w.lng));
  const maxLng = Math.max(...waypoints.map(w => w.lng));

  const latRange = maxLat - minLat || 0.01;
  const lngRange = maxLng - minLng || 0.01;

  const mapPoints = waypoints.map(wp => {
    // Normalizing to 800 x 360 canvas with 40px padding
    const x = 50 + ((wp.lng - minLng) / lngRange) * 700;
    const y = 310 - ((wp.lat - minLat) / latRange) * 250;
    return { ...wp, x, y };
  });

  const currentPoint = mapPoints[currentIndex] || mapPoints[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 font-mono animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-[5px] max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[2px] bg-amber-400 text-black shadow-md">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[2px] bg-amber-400/20 text-amber-400 border border-amber-400/30">
                  Telemetría LiveLink Satelital 2026
                </span>
                <span className="text-[10px] text-zinc-400">
                  7 Días de Registro J1939
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight mt-0.5 font-display">
                Playback de Rutas: {unit?.model || 'Pala LiuGong 922E'} ({unit?.serialNumber || 'SN: 849-2026-X'})
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportGpx}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border border-zinc-700"
              title="Descargar archivo satelital GPX para QGIS o Google Earth"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Exportar GPX</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-[2px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corridor & Days Filter Selector Bar */}
        <div className="px-4 py-2.5 bg-zinc-950/70 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 uppercase tracking-wider text-[11px]">Corredor RD:</span>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(DOMINICAN_ROUTES).map(([key, route]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedRouteKey(key);
                    setCurrentIndex(0);
                    setIsPlaying(false);
                  }}
                  className={`px-2.5 py-1 rounded-[2px] text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    selectedRouteKey === key
                      ? 'bg-amber-400 text-black shadow-sm'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {route.name.split(' (')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500 uppercase tracking-wider text-[11px]">Periodo:</span>
            <div className="flex gap-1 bg-zinc-900 p-0.5 rounded-[2px] border border-zinc-800">
              {(['24h', '3d', '7d'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setDaysFilter(p)}
                  className={`px-2 py-0.5 rounded-[2px] text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                    daysFilter === p ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Playback Canvas & Live HUD */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Simulated Satellite Map Stage */}
          <div className="relative w-full h-[320px] sm:h-[380px] bg-zinc-950 rounded-[3px] border border-zinc-800 overflow-hidden shadow-inner flex flex-col justify-between">
            
            {/* Grid Lines Pattern */}
            <div 
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #f59e0b 1px, transparent 0)',
                backgroundSize: '24px 24px'
              }}
            />

            {/* Top Overlay Badges */}
            <div className="relative z-10 p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-black/75 backdrop-blur-md border border-zinc-800 text-zinc-300">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold text-amber-400">{currentWaypoint.locationName}</span>
                </span>
                <span className="hidden sm:inline px-2 py-1 rounded-[2px] bg-black/60 border border-zinc-800 text-[10px] text-zinc-400">
                  {currentWaypoint.lat.toFixed(4)}° N, {Math.abs(currentWaypoint.lng).toFixed(4)}° W
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-[2px] text-[10px] font-bold uppercase border ${
                  currentWaypoint.status === 'operating'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : currentWaypoint.status === 'idle'
                      ? 'bg-amber-400/20 text-amber-400 border-amber-400/30'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}>
                  {currentWaypoint.status === 'operating' ? 'En Trabajo' : currentWaypoint.status === 'idle' ? 'Ralentí (>10m)' : 'Detenido'}
                </span>
              </div>
            </div>

            {/* SVG Trail Rendering */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="routeTrailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d97706" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.9" />
                </linearGradient>
              </defs>

              {/* Background Path (Total Planned Route) */}
              <polyline
                points={mapPoints.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#3f3f46"
                strokeWidth="3"
                strokeDasharray="4 4"
              />

              {/* Traversed Path (Traveled so far) */}
              <polyline
                points={mapPoints.slice(0, currentIndex + 1).map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="url(#routeTrailGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Waypoint Markers */}
              {mapPoints.map((pt, idx) => {
                const isPassed = idx <= currentIndex;
                const isCurrent = idx === currentIndex;
                return (
                  <g key={pt.id}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isCurrent ? 7 : 4}
                      fill={isCurrent ? '#f59e0b' : isPassed ? '#fbbf24' : '#27272a'}
                      stroke={isCurrent ? '#ffffff' : '#18181b'}
                      strokeWidth={isCurrent ? '2' : '1'}
                    />
                    {isCurrent && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="14"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        className="animate-ping"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Current Position Pulse Pin (Absolute positioned) */}
            <div 
              className="absolute z-20 transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `${currentPoint.x}px`, top: `${currentPoint.y}px` }}
            >
              <div className="relative flex items-center justify-center">
                <div 
                  className="p-1.5 rounded-full bg-amber-400 text-black shadow-lg border border-white"
                  style={{ transform: `rotate(${currentWaypoint.heading}deg)` }}
                >
                  <Navigation2 className="w-4 h-4 fill-black" />
                </div>
              </div>
            </div>

            {/* Bottom HUD Bar inside Map */}
            <div className="relative z-10 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/60">
              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Velocidad</span>
                  <span className="text-base font-bold text-white flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-amber-400" />
                    {currentWaypoint.speedKmH} <span className="text-[10px] text-zinc-400 font-normal">km/h</span>
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">RPM Motor</span>
                  <span className="text-base font-bold text-cyan-400 font-mono">
                    {currentWaypoint.rpm} <span className="text-[10px] text-zinc-400 font-normal">RPM</span>
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Diésel</span>
                  <span className="text-base font-bold text-emerald-400 flex items-center gap-1">
                    <Fuel className="w-3.5 h-3.5" />
                    {currentWaypoint.fuelPercent}%
                  </span>
                </div>

                <div className="hidden sm:block">
                  <span className="text-[10px] text-zinc-500 uppercase block">Rumbo</span>
                  <span className="text-sm font-bold text-zinc-200 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    {currentWaypoint.heading}° {currentWaypoint.headingText}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-zinc-500 uppercase block">Marca de Tiempo</span>
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1 justify-end">
                  <Clock className="w-3.5 h-3.5" />
                  {currentWaypoint.timestamp}
                </span>
              </div>
            </div>
          </div>

          {/* Scrubber Timeline & Playback Controller */}
          <div className="p-4 bg-zinc-950 rounded-[3px] border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-bold text-zinc-200 uppercase tracking-wider text-[11px]">Línea de Tiempo Satelital</span>
              <span>Punto {currentIndex + 1} de {waypoints.length}</span>
            </div>

            {/* Scrubber Input Range */}
            <input
              type="range"
              min="0"
              max={waypoints.length - 1}
              value={currentIndex}
              onChange={(e) => {
                setCurrentIndex(Number(e.target.value));
                setIsPlaying(false);
              }}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />

            {/* Playback Controls & Speed Toggle */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayPause}
                  className="px-4 py-2 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-wider text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlaying ? 'Pausar' : 'Reproducir'}</span>
                </button>

                <button
                  onClick={handleReset}
                  className="p-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors cursor-pointer"
                  title="Reiniciar al primer punto"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Speed Buttons */}
              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-[2px] border border-zinc-800 text-xs">
                <span className="text-[10px] text-zinc-500 uppercase px-1 hidden sm:inline">Velocidad:</span>
                {[1, 2, 4].map(spd => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2 py-0.5 rounded-[2px] text-xs font-bold transition-colors cursor-pointer ${
                      playbackSpeed === spd
                        ? 'bg-amber-400 text-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Route Summary KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-[3px] bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-500 block text-[10px] uppercase">Distancia Total</span>
              <span className="text-lg font-bold text-white font-mono mt-0.5 block">64.2 km</span>
              <span className="text-[10px] text-zinc-400">Recorrido analizado</span>
            </div>

            <div className="p-3 rounded-[3px] bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-500 block text-[10px] uppercase">Velocidad Máx.</span>
              <span className="text-lg font-bold text-amber-400 font-mono mt-0.5 block">28 km/h</span>
              <span className="text-[10px] text-zinc-400">Límite seguridad obra</span>
            </div>

            <div className="p-3 rounded-[3px] bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-500 block text-[10px] uppercase">Tiempo en Movimiento</span>
              <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">5.4 horas</span>
              <span className="text-[10px] text-zinc-400">Trabajo efectivo</span>
            </div>

            <div className="p-3 rounded-[3px] bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-500 block text-[10px] uppercase">Consumo Estimado</span>
              <span className="text-lg font-bold text-cyan-400 font-mono mt-0.5 block">18.5 gal</span>
              <span className="text-[10px] text-zinc-400">Diésel regular</span>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Datos encriptados CAN-Bus certificados para auditorías de seguros y obras públicas.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
          >
            Cerrar Visor
          </button>
        </div>

      </div>
    </div>
  );
};
