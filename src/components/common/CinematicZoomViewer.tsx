import React, { useState, useRef, MouseEvent, TouchEvent } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  Crosshair, 
  SunMedium, 
  Layers, 
  ShieldCheck,
  HardHat
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface CinematicZoomViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  subtitle?: string;
  category?: string;
}

export const CinematicZoomViewer: React.FC<CinematicZoomViewerProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  subtitle,
  category
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1.8);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isPanning, setIsPanning] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [activeZone, setActiveZone] = useState<'all' | 'tracks' | 'cab' | 'engine'>('all');
  const imageContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setPosition({ x, y });
  };

  const handleZoomChange = (delta: number) => {
    triggerHaptic('light');
    setZoomLevel(prev => Math.min(4.5, Math.max(1, +(prev + delta).toFixed(1))));
  };

  const resetZoom = () => {
    triggerHaptic('selection');
    setZoomLevel(1);
    setPosition({ x: 50, y: 50 });
    setActiveZone('all');
  };

  const focusZone = (zone: 'all' | 'tracks' | 'cab' | 'engine') => {
    triggerHaptic('medium');
    setActiveZone(zone);
    if (zone === 'tracks') {
      setPosition({ x: 50, y: 80 }); // lower bottom for tracks
      setZoomLevel(2.5);
    } else if (zone === 'cab') {
      setPosition({ x: 35, y: 35 }); // mid-upper for cab
      setZoomLevel(2.8);
    } else if (zone === 'engine') {
      setPosition({ x: 75, y: 40 }); // rear compartment
      setZoomLevel(3.0);
    } else {
      setPosition({ x: 50, y: 50 });
      setZoomLevel(1.5);
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[100000] flex flex-col bg-black/95 backdrop-blur-2xl text-white font-mono animate-in fade-in duration-200 select-none overflow-hidden"
      onClick={onClose}
    >
      {/* Top Bar: Title & Controls */}
      <div 
        className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-zinc-800 bg-zinc-950/80 z-20 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[2px] bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Crosshair className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-[2px] border border-amber-500/20">
                LENTE CINEMÁTICO • INSPECCIÓN DE DETALLE
              </span>
              {category && (
                <span className="text-[10px] text-zinc-400 font-bold uppercase hidden sm:inline">
                  {category}
                </span>
              )}
            </div>
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white truncate max-w-md font-display mt-0.5">
              {title}
            </h2>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-[2px] p-0.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => handleZoomChange(-0.5)}
              disabled={zoomLevel <= 1}
              className="p-1.5 hover:bg-zinc-800 rounded disabled:opacity-30 cursor-pointer text-zinc-300 hover:text-white"
              title="Alejar"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 min-w-14 text-center text-amber-400 font-mono text-[11px]">
              {(zoomLevel * 100).toFixed(0)}%
            </span>
            <button
              type="button"
              onClick={() => handleZoomChange(0.5)}
              disabled={zoomLevel >= 4.5}
              className="p-1.5 hover:bg-zinc-800 rounded disabled:opacity-30 cursor-pointer text-zinc-300 hover:text-white"
              title="Acercar"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reset Zoom */}
          <button
            type="button"
            onClick={resetZoom}
            className="p-2 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer"
            title="Restablecer encuadre"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* High Contrast Solar Mode Filter */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setHighContrast(!highContrast);
            }}
            className={`p-2 rounded-[2px] border text-xs transition-all cursor-pointer ${
              highContrast 
                ? 'bg-amber-400 text-black border-amber-300 font-bold' 
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
            }`}
            title="Alternar contraste de textura mecánica"
          >
            <SunMedium className="w-3.5 h-3.5" />
          </button>

          {/* Close Lightbox */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              onClose();
            }}
            className="p-2 rounded-[2px] bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 transition-all cursor-pointer ml-1"
            title="Cerrar visor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Inspection Canvas Area */}
      <div 
        ref={imageContainerRef}
        onMouseMove={handleMouseMove}
        onClick={(e) => e.stopPropagation()}
        className="relative flex-1 overflow-hidden flex items-center justify-center cursor-crosshair bg-black"
      >
        {/* Reticle Overlay Guide Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20 z-10">
          <div className="w-full h-full border border-amber-500/20 grid grid-cols-4 grid-rows-4" />
          <div 
            className="absolute border border-dashed border-amber-400/60 rounded-full w-24 h-24 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-75 ease-out shadow-[0_0_15px_rgba(251,191,36,0.3)]"
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
          >
            <div className="absolute top-1/2 left-0 right-0 h-px bg-amber-400/80 -translate-y-1/2" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-amber-400/80 -translate-x-1/2" />
          </div>
        </div>

        {/* Dynamic Zoomed Image */}
        <div 
          className="w-full h-full flex items-center justify-center transition-transform duration-100 ease-out"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: `${position.x}% ${position.y}%`,
            filter: highContrast ? 'contrast(135%) brightness(105%) saturate(120%)' : 'none'
          }}
        >
          <img
            src={imageUrl}
            alt={title}
            className="max-w-full max-h-full object-contain pointer-events-none"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/images/tmd_coming_soon.jpg';
            }}
          />
        </div>

        {/* Corner HUD Telemetry Coordinates */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none bg-zinc-950/80 border border-zinc-800 p-2 rounded-[2px] text-[10px] space-y-0.5 backdrop-blur-md">
          <div className="text-amber-400 font-bold uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            MICROSCOPIO DE TALLER TMD • ACTIVO
          </div>
          <div className="text-zinc-400 font-mono">
            ENCUADRE: X:{position.x.toFixed(1)}% | Y:{position.y.toFixed(1)}% | MAG: {zoomLevel.toFixed(1)}X
          </div>
        </div>
      </div>

      {/* Bottom Preset Inspection Toolbar */}
      <div 
        className="px-4 sm:px-6 py-2.5 bg-zinc-950 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[10px] text-zinc-500 font-bold uppercase hidden sm:inline">
            ENFOQUE PRECONFIGURADO:
          </span>
          <button
            type="button"
            onClick={() => focusZone('all')}
            className={`px-2.5 py-1 rounded-[2px] text-[10px] font-bold uppercase transition-all cursor-pointer ${
              activeZone === 'all' 
                ? 'bg-amber-400 text-black font-black' 
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
            }`}
          >
            Vista Completa
          </button>
          <button
            type="button"
            onClick={() => focusZone('tracks')}
            className={`px-2.5 py-1 rounded-[2px] text-[10px] font-bold uppercase transition-all cursor-pointer ${
              activeZone === 'tracks' 
                ? 'bg-amber-400 text-black font-black' 
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
            }`}
          >
            Tren de Rodaje & Orugas
          </button>
          <button
            type="button"
            onClick={() => focusZone('cab')}
            className={`px-2.5 py-1 rounded-[2px] text-[10px] font-bold uppercase transition-all cursor-pointer ${
              activeZone === 'cab' 
                ? 'bg-amber-400 text-black font-black' 
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
            }`}
          >
            Cabina ROPS & Mandos
          </button>
          <button
            type="button"
            onClick={() => focusZone('engine')}
            className={`px-2.5 py-1 rounded-[2px] text-[10px] font-bold uppercase transition-all cursor-pointer ${
              activeZone === 'engine' 
                ? 'bg-amber-400 text-black font-black' 
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
            }`}
          >
            Compartimento Motor
          </button>
        </div>

        <div className="text-[10px] text-zinc-400 hidden lg:flex items-center gap-2">
          <HardHat className="w-3.5 h-3.5 text-amber-400" />
          <span>Mueva el cursor para desplazar la lente de aumento sobre pernos, pasadores y mangueras hidráulicas.</span>
        </div>
      </div>
    </div>,
    document.body
  );
};
