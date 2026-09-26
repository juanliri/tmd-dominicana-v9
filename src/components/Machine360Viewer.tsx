import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  RotateCw, 
  Play, 
  Pause, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Compass, 
  Layers, 
  Video, 
  Image as ImageIcon, 
  Crosshair, 
  Ruler, 
  Info, 
  HardHat, 
  ShieldCheck, 
  Wrench, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  FileText, 
  Calculator, 
  Eye, 
  Move,
  Flame,
  Award
} from 'lucide-react';
import { Machine } from '../types';
import { 
  getMachine360Package, 
  Machine360Package, 
  MachineInspectionHotspot, 
  MachineVideoWalkaround, 
  MachineGalleryPhoto 
} from '../data/machineMedia360';
import { dieselAudio } from '../utils/engineAudio';
import { useCart } from '../context/CartContext';

interface Machine360ViewerProps {
  machine: Machine;
  onNavigate?: (route: string) => void;
  onOpenEstimate?: (machine: Machine) => void;
  onOpenCalculator?: (machine: Machine) => void;
  initialTab?: '360' | 'video' | 'gallery' | 'dimensions';
}

export const Machine360Viewer: React.FC<Machine360ViewerProps> = ({
  machine,
  onNavigate,
  onOpenEstimate,
  onOpenCalculator,
  initialTab = '360'
}) => {
  const { addMachineToQuote, formatPrice } = useCart();
  const mediaPackage = useMemo(() => getMachine360Package(machine.id, machine), [machine]);

  const [activeTab, setActiveTab] = useState<'360' | 'video' | 'gallery' | 'dimensions'>(initialTab);

  // 360 Turn-table State
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1); // 1x or 2x
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [selectedHotspot, setSelectedHotspot] = useState<MachineInspectionHotspot | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [audioVolume, setAudioVolume] = useState<number>(0.2);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [showBlueprintOverlay, setShowBlueprintOverlay] = useState<boolean>(false);

  // Video State
  const [activeVideo, setActiveVideo] = useState<MachineVideoWalkaround>(mediaPackage.videos[0]);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Gallery State
  const [activeGalleryPhoto, setActiveGalleryPhoto] = useState<MachineGalleryPhoto>(mediaPackage.gallery[0]);
  const [galleryCategory, setGalleryCategory] = useState<string>('Todos');
  const [isMagnifierActive, setIsMagnifierActive] = useState<boolean>(false);
  const [magnifierPos, setMagnifierPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const turntableAreaRef = useRef<HTMLDivElement | null>(null);

  const totalFrames = mediaPackage.frames.length;
  const currentFrame = mediaPackage.frames[currentFrameIndex] || mediaPackage.frames[0];

  // Auto-rotation timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isAutoRotating && activeTab === '360') {
      const delay = rotationSpeed === 1 ? 160 : 90;
      interval = setInterval(() => {
        setCurrentFrameIndex((prev) => (prev + 1) % totalFrames);
      }, delay);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoRotating, rotationSpeed, totalFrames, activeTab]);

  // Audio Engine Cleanup
  useEffect(() => {
    return () => {
      dieselAudio.stop();
    };
  }, []);

  const handleToggleAudio = async () => {
    if (isAudioPlaying) {
      dieselAudio.stop();
      setIsAudioPlaying(false);
    } else {
      try {
        const started = await dieselAudio.start(mediaPackage.soundType, audioVolume);
        setIsAudioPlaying(started);
      } catch (err) {
        console.warn('Could not start audio playback:', err);
        setIsAudioPlaying(false);
      }
    }
  };

  const handleVolumeChange = (vol: number) => {
    setAudioVolume(vol);
    dieselAudio.setVolume(vol);
  };

  // Mouse / Touch Drag Rotation handlers
  const handlePointerDown = (clientX: number) => {
    setIsDragging(true);
    setDragStartX(clientX);
    if (isAutoRotating) {
      setIsAutoRotating(false);
    }
  };

  const handlePointerMove = (clientX: number) => {
    if (!isDragging) return;
    const deltaX = clientX - dragStartX;
    const threshold = 18; // px per frame step

    if (Math.abs(deltaX) >= threshold) {
      const steps = Math.floor(Math.abs(deltaX) / threshold);
      const direction = deltaX > 0 ? 1 : -1; // Drag right -> rotate right

      setCurrentFrameIndex((prev) => {
        let next = prev + (direction * steps);
        if (next < 0) next = totalFrames - (Math.abs(next) % totalFrames);
        return next % totalFrames;
      });

      setDragStartX(clientX);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handlePresetAngle = (targetAngle: number) => {
    // Find closest frame to angle
    let closestIndex = 0;
    let minDiff = 360;
    mediaPackage.frames.forEach((f, idx) => {
      const diff = Math.min(Math.abs(f.angle - targetAngle), 360 - Math.abs(f.angle - targetAngle));
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });
    setCurrentFrameIndex(closestIndex);
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Magnifier mouse move handler
  const handleMagnifierMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMagnifierPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  // Filtered gallery photos
  const filteredGallery = useMemo(() => {
    if (galleryCategory === 'Todos') return mediaPackage.gallery;
    return mediaPackage.gallery.filter((p) => p.category === galleryCategory);
  }, [mediaPackage.gallery, galleryCategory]);

  return (
    <div 
      ref={containerRef}
      className={`bg-zinc-950 text-white rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-[100] rounded-none' : 'w-full'
      }`}
    >
      {/* Top Bar / Header */}
      <div className="p-4 sm:p-5 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>360° Studio TMD</span>
          </span>
          <div>
            <h2 className="text-base sm:text-xl font-extrabold text-white flex items-center gap-2">
              {machine.name}
              <span className="text-xs font-mono font-bold text-amber-400 bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-700">
                {machine.brand}
              </span>
            </h2>
            <p className="text-xs text-zinc-400 hidden sm:block">
              {mediaPackage.tagline}
            </p>
          </div>
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-2xl border border-zinc-800 self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab('360')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === '360'
                ? 'bg-amber-500 text-black font-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Giro 360°</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'video'
                ? 'bg-amber-500 text-black font-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video & Cabina ({mediaPackage.videos.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'gallery'
                ? 'bg-amber-500 text-black font-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Galería HD ({mediaPackage.gallery.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dimensions')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'dimensions'
                ? 'bg-amber-500 text-black font-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>Plano CAD</span>
          </button>
        </div>
      </div>

      {/* MAIN VIEWPORT CONTAINER */}
      <div className="relative flex-1 min-h-[420px] sm:min-h-[520px] flex flex-col bg-zinc-950 overflow-hidden">
        {/* TAB 1: 360 INTERACTIVE TURNTABLE */}
        {activeTab === '360' && (
          <div className="relative flex-1 flex flex-col justify-between select-none">
            {/* 360 Viewport Stage */}
            <div 
              ref={turntableAreaRef}
              onMouseDown={(e) => handlePointerDown(e.clientX)}
              onMouseMove={(e) => handlePointerMove(e.clientX)}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
              onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
              onTouchEnd={handlePointerUp}
              className="relative flex-1 flex items-center justify-center p-4 cursor-grab active:cursor-grabbing overflow-hidden bg-radial from-zinc-900 via-zinc-950 to-black"
            >
              {/* Studio Grid Floor Reflection & Lighting */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
              <div className="absolute bottom-6 w-3/4 h-8 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              
              {/* Turntable Base Ring Indicator */}
              <div className="absolute bottom-10 w-80 sm:w-[500px] h-20 border border-amber-500/20 rounded-[100%] pointer-events-none flex items-center justify-center">
                <div className="w-full h-full border border-dashed border-zinc-700/60 rounded-[100%]" />
              </div>

              {/* Main Machine Image with smooth zoom */}
              <div 
                className="relative transition-transform duration-150 ease-out max-w-4xl w-full flex items-center justify-center"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <img
                  src={currentFrame.image}
                  alt={`${machine.name} ángulo ${currentFrame.angle}°`}
                  draggable={false}
                  className="w-full max-h-[380px] sm:max-h-[440px] object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)] pointer-events-none"
                />

                {/* Blueprint Wireframe Overlay (if active) */}
                {showBlueprintOverlay && (
                  <div className="absolute inset-0 border-2 border-dashed border-amber-400/70 rounded-2xl bg-amber-500/5 backdrop-blur-[1px] flex flex-col justify-between p-4 pointer-events-none animate-in fade-in duration-300">
                    <div className="flex justify-between text-[11px] font-mono font-bold text-amber-400 bg-black/80 px-3 py-1 rounded-md border border-amber-500/40 w-fit">
                      <span>CAD ESQUEMA: {machine.modelCode}</span>
                      <span className="ml-3">H: {mediaPackage.dimensions.overallHeightM}m | L: {mediaPackage.dimensions.overallLengthM}m</span>
                    </div>
                    <div className="flex justify-between items-end text-[10px] font-mono text-amber-400 bg-black/80 px-3 py-1 rounded-md border border-amber-500/40">
                      <span>DESPEJE: {mediaPackage.dimensions.groundClearanceMm} mm</span>
                      <span>RADIO GIRO: {mediaPackage.dimensions.turningRadiusM} m</span>
                    </div>
                  </div>
                )}

                {/* Interactive 3D Inspection Hotspots */}
                {showHotspots && !showBlueprintOverlay && mediaPackage.hotspots.map((hs) => {
                  // Calculate angle visibility (visible within +/- 60 degrees of target angle)
                  const diff = Math.min(
                    Math.abs(currentFrame.angle - hs.angleTarget),
                    360 - Math.abs(currentFrame.angle - hs.angleTarget)
                  );
                  const isVisible = diff <= 60;
                  if (!isVisible) return null;

                  const isSelected = selectedHotspot?.id === hs.id;

                  return (
                    <div
                      key={hs.id}
                      style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedHotspot(isSelected ? null : hs);
                        }}
                        className={`group relative flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-all shadow-xl ${
                          isSelected
                            ? 'bg-amber-400 text-black scale-125 ring-4 ring-amber-400/40'
                            : 'bg-zinc-950/90 text-amber-400 border border-amber-400/80 hover:bg-amber-500 hover:text-black hover:scale-110'
                        }`}
                        title={hs.title}
                      >
                        <Crosshair className="w-4 h-4 animate-pulse" />
                        
                        {/* Ping animation ripple */}
                        <span className="absolute -inset-1 rounded-full bg-amber-400/30 animate-ping pointer-events-none" />

                        {/* Tooltip Tag */}
                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-zinc-900/95 border border-zinc-700 text-white text-[11px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-30">
                          {hs.title}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Drag Prompt Hint Pill */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-800 text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5 pointer-events-none shadow-md">
                <Move className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Arrastra para girar 360° o usa los controles</span>
              </div>

              {/* Angle Dial & Compass Bearing Badge */}
              <div className="absolute bottom-4 left-4 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-2xl p-2.5 flex items-center gap-3 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-700 flex flex-col items-center justify-center">
                  <Compass className="w-4 h-4 text-amber-400 mb-0.5" />
                  <span className="text-[10px] font-mono font-black text-amber-400">{currentFrame.compassBearing}</span>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Ángulo de Giro</div>
                  <div className="text-sm font-black font-mono text-white flex items-center gap-1">
                    <span>{currentFrame.angle}°</span>
                    <span className="text-xs text-zinc-500 font-normal">({currentFrame.label.split('(')[0]})</span>
                  </div>
                </div>
              </div>

              {/* Floating Quick Action Overlay (Right) */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                {/* Audio Engine Simulator Toggle */}
                <button
                  type="button"
                  onClick={handleToggleAudio}
                  className={`p-2.5 rounded-xl border backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                    isAudioPlaying
                      ? 'bg-amber-500 text-black border-amber-400 font-black'
                      : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white'
                  }`}
                  title={isAudioPlaying ? 'Apagar sonido de motor diésel' : 'Encender sonido de motor diésel sintetizado'}
                >
                  {isAudioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span className="text-xs hidden sm:inline">{isAudioPlaying ? 'Motor Diésel ON' : 'Audio Motor'}</span>
                </button>

                {/* Blueprint CAD Wireframe Toggle */}
                <button
                  type="button"
                  onClick={() => setShowBlueprintOverlay(!showBlueprintOverlay)}
                  className={`p-2.5 rounded-xl border backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                    showBlueprintOverlay
                      ? 'bg-amber-500 text-black border-amber-400 font-black'
                      : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white'
                  }`}
                  title="Superponer esquema técnico CAD"
                >
                  <Layers className="w-4 h-4" />
                  <span className="text-xs hidden sm:inline">Capa CAD</span>
                </button>

                {/* Hotspots Toggle */}
                <button
                  type="button"
                  onClick={() => setShowHotspots(!showHotspots)}
                  className={`p-2.5 rounded-xl border backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                    showHotspots
                      ? 'bg-zinc-800 text-amber-400 border-zinc-700'
                      : 'bg-zinc-900/80 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                  }`}
                  title={showHotspots ? 'Ocultar puntos de inspección' : 'Mostrar puntos de inspección'}
                >
                  <Crosshair className="w-4 h-4" />
                  <span className="text-xs hidden sm:inline">Puntos</span>
                </button>

                {/* Zoom Controls */}
                <div className="flex bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-xl overflow-hidden shadow-md">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(2, z + 0.25))}
                    disabled={zoomLevel >= 2}
                    className="p-2 hover:bg-zinc-800 text-zinc-300 hover:text-white disabled:opacity-40 cursor-pointer"
                    title="Acercar (Zoom In)"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
                    disabled={zoomLevel <= 1}
                    className="p-2 hover:bg-zinc-800 text-zinc-300 hover:text-white disabled:opacity-40 cursor-pointer"
                    title="Alejar (Zoom Out)"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                </div>

                {/* Fullscreen Toggle */}
                <button
                  type="button"
                  onClick={handleToggleFullscreen}
                  className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 backdrop-blur-md transition-all cursor-pointer shadow-md"
                  title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Bottom 360 Rotation Control Bar */}
            <div className="p-4 bg-zinc-900/90 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Play / Auto-rotate & Speed */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
                <button
                  type="button"
                  onClick={() => setIsAutoRotating(!isAutoRotating)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                    isAutoRotating
                      ? 'bg-amber-500 text-black shadow-amber-500/20'
                      : 'bg-zinc-800 text-white hover:bg-zinc-700'
                  }`}
                >
                  {isAutoRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isAutoRotating ? 'Pausar Giro' : 'Auto-Giro 360°'}</span>
                </button>

                {isAutoRotating && (
                  <button
                    type="button"
                    onClick={() => setRotationSpeed((s) => (s === 1 ? 2 : 1))}
                    className="px-2.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-mono font-bold cursor-pointer"
                    title="Alternar velocidad de giro"
                  >
                    {rotationSpeed}x
                  </button>
                )}

                {/* Frame Step Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentFrameIndex((prev) => (prev - 1 + totalFrames) % totalFrames)}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                    title="Ángulo Anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentFrameIndex((prev) => (prev + 1) % totalFrames)}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                    title="Siguiente Ángulo"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Angle Slider Dial */}
              <div className="flex-1 w-full max-w-md flex items-center gap-3">
                <span className="text-[11px] font-mono text-zinc-400">0°</span>
                <input
                  type="range"
                  min="0"
                  max={totalFrames - 1}
                  value={currentFrameIndex}
                  onChange={(e) => {
                    if (isAutoRotating) setIsAutoRotating(false);
                    setCurrentFrameIndex(Number(e.target.value));
                  }}
                  className="flex-1 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-[11px] font-mono text-zinc-400">360°</span>
              </div>

              {/* Preset Perspectives */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
                <button
                  type="button"
                  onClick={() => handlePresetAngle(0)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                    currentFrame.angle === 0 ? 'bg-amber-500 text-black font-black' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  Frente
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetAngle(90)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                    currentFrame.angle === 90 ? 'bg-amber-500 text-black font-black' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  Derecha
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetAngle(180)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                    currentFrame.angle === 180 ? 'bg-amber-500 text-black font-black' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  Posterior
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetAngle(270)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                    currentFrame.angle === 270 ? 'bg-amber-500 text-black font-black' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  Izquierda
                </button>
              </div>
            </div>

            {/* Selected Hotspot Detailed Drawer */}
            {selectedHotspot && (
              <div className="p-4 sm:p-5 bg-zinc-900 border-t border-amber-500/40 animate-in slide-in-from-bottom-6 duration-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase border border-amber-500/30">
                        {selectedHotspot.category}
                      </span>
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Inspección Certificada TMD</span>
                      </span>
                    </div>
                    <h4 className="text-base font-extrabold text-white">
                      {selectedHotspot.title}
                    </h4>
                    <p className="text-xs text-zinc-300">
                      {selectedHotspot.shortDescription}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedHotspot(null)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs pt-3 border-t border-zinc-800">
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-400 text-[10px] font-bold uppercase block mb-1">Especificación de Ingeniería</span>
                    <span className="text-zinc-200 font-medium">{selectedHotspot.engineeringSpecs}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-400 text-[10px] font-bold uppercase block mb-1">Criterio de Mantenimiento</span>
                    <span className="text-zinc-200 font-medium">{selectedHotspot.inspectionCriteria}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-400 text-[10px] font-bold uppercase block mb-1">Garantía Aplicable</span>
                    <span className="text-amber-400 font-semibold">{selectedHotspot.warrantyCoverage}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VIDEO WALKAROUND & IN-CABIN EXPERIENCE */}
        {activeTab === 'video' && (
          <div className="p-4 sm:p-6 space-y-6 flex-1 flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
              {/* Video Player Main Stage */}
              <div className="lg:col-span-2 space-y-4 flex flex-col justify-between">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-xl group">
                  <video
                    ref={videoRef}
                    src={activeVideo.videoUrl}
                    poster={activeVideo.thumbnail}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover"
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLVideoElement;
                      if (!target.src.includes('/videos/tmd-patio-km22.mp4')) {
                        target.src = '/videos/tmd-patio-km22.mp4';
                        target.load();
                      }
                    }}
                  />

                  {/* Resolution Badge */}
                  <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono font-bold text-amber-400 border border-amber-500/30">
                    {activeVideo.resolution}
                  </div>
                </div>

                {/* Video Info Card */}
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {activeVideo.title}
                    </h3>
                    <span className="text-xs font-mono text-zinc-400">
                      Duración: {activeVideo.duration}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {activeVideo.description}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {activeVideo.highlightPoints.map((point, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 text-[11px] font-medium border border-zinc-700 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3 h-3 text-amber-400" />
                        <span>{point}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Video Playlist / Camera Angle Switcher */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
                  <Video className="w-3.5 h-3.5" />
                  <span>Cámaras & Tomas Disponibles</span>
                </h4>

                <div className="space-y-2.5">
                  {mediaPackage.videos.map((vid) => (
                    <button
                      key={vid.id}
                      type="button"
                      onClick={() => {
                        setActiveVideo(vid);
                        if (videoRef.current) {
                          videoRef.current.currentTime = 0;
                          videoRef.current.play();
                        }
                      }}
                      className={`w-full p-3 rounded-2xl text-left transition-all border flex gap-3 cursor-pointer ${
                        activeVideo.id === vid.id
                          ? 'bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/40'
                          : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                        <img
                          src={vid.thumbnail}
                          alt={vid.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play className="w-5 h-5 text-white drop-shadow" />
                        </div>
                        <span className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-white">
                          {vid.duration}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <h5 className="font-bold text-xs text-white truncate">
                          {vid.title}
                        </h5>
                        <p className="text-[11px] text-zinc-400 line-clamp-2">
                          {vid.description}
                        </p>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-zinc-800 text-amber-400">
                          {vid.category}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Field Test Story Box */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Award className="w-4 h-4" />
                    <span>Prueba en Terreno Dominicano</span>
                  </div>
                  <p className="text-zinc-300 italic">
                    "{mediaPackage.dominicanJobsiteStory.testimonial}"
                  </p>
                  <div className="flex justify-between text-[11px] text-zinc-400 pt-1 border-t border-amber-500/20">
                    <span>{mediaPackage.dominicanJobsiteStory.client}</span>
                    <span className="text-amber-400 font-semibold">{mediaPackage.dominicanJobsiteStory.fuelEfficiency}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ULTRA HD GALLERY & MAGNIFIER LENS */}
        {activeTab === 'gallery' && (
          <div className="p-4 sm:p-6 space-y-5 flex-1 flex flex-col">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {['Todos', 'Exterior', 'Cabina', 'Motor', 'Hidráulica', 'Tren de Rodaje', 'Implementos'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setGalleryCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    galleryCategory === cat
                      ? 'bg-amber-500 text-black font-black'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
              {/* Main Photo Magnifier Display */}
              <div className="lg:col-span-2 space-y-4">
                <div 
                  onMouseEnter={() => setIsMagnifierActive(true)}
                  onMouseLeave={() => setIsMagnifierActive(false)}
                  onMouseMove={handleMagnifierMove}
                  className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-xl cursor-crosshair group"
                >
                  <img
                    src={activeGalleryPhoto.image}
                    alt={activeGalleryPhoto.title}
                    className="w-full h-full object-cover"
                  />

                  {/* Magnifying Glass Zoom Lens Preview */}
                  {isMagnifierActive && (
                    <div
                      style={{
                        left: `${magnifierPos.x}%`,
                        top: `${magnifierPos.y}%`,
                        backgroundImage: `url(${activeGalleryPhoto.zoomImage})`,
                        backgroundPosition: `${magnifierPos.x}% ${magnifierPos.y}%`,
                        backgroundSize: '300%'
                      }}
                      className="absolute w-44 h-44 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-amber-400 shadow-2xl pointer-events-none z-30 bg-no-repeat ring-4 ring-black/40"
                    />
                  )}

                  {/* Prompt badge */}
                  <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-zinc-300 pointer-events-none flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pasa el cursor para lupa de aumento 3x</span>
                  </div>
                </div>

                {/* Photo Caption & Detail */}
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm sm:text-base text-white">
                      {activeGalleryPhoto.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-amber-400 text-[10px] font-bold uppercase">
                      {activeGalleryPhoto.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    {activeGalleryPhoto.caption}
                  </p>
                  <p className="text-[11px] text-zinc-400 font-mono pt-1 border-t border-zinc-800">
                    <strong>Ficha Técnica:</strong> {activeGalleryPhoto.technicalDetail}
                  </p>
                </div>
              </div>

              {/* Thumbnail List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500">
                  Fotografías de Detalle ({filteredGallery.length})
                </h4>

                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {filteredGallery.map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => setActiveGalleryPhoto(photo)}
                      className={`p-2 rounded-2xl text-left transition-all border flex gap-2.5 cursor-pointer ${
                        activeGalleryPhoto.id === photo.id
                          ? 'bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/40'
                          : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800'
                      }`}
                    >
                      <div className="w-20 h-14 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                        <img
                          src={photo.image}
                          alt={photo.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-xs text-white truncate">
                          {photo.title}
                        </h5>
                        <p className="text-[10px] text-zinc-400 line-clamp-1">
                          {photo.caption}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CAD BLUEPRINT & DIMENSIONS AR SCALE */}
        {activeTab === 'dimensions' && (
          <div className="p-4 sm:p-6 space-y-6 flex-1 flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* CAD Schematic Visual Stage */}
              <div className="lg:col-span-2 relative aspect-[16/10] rounded-2xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col justify-between overflow-hidden">
                {/* Background CAD grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f615_1px,transparent_1px),linear-gradient(to_bottom,#3b82f615_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-amber-400">
                      CAD DIMENSIONES OFICIALES • {machine.modelCode}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">Escala 1:50</span>
                </div>

                {/* Machine Silhouette & Operator Scale Comparison */}
                <div className="relative z-10 flex items-end justify-center gap-8 py-4">
                  {/* Operator Silhouette (1.80m) */}
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-16 bg-zinc-600 rounded-t-full relative flex items-center justify-center">
                      <HardHat className="w-3.5 h-3.5 text-amber-400 absolute -top-2" />
                    </div>
                    <span className="text-[9px] font-mono text-zinc-400 mt-1">Operador (1.80 m)</span>
                  </div>

                  {/* Machine Image */}
                  <div className="relative max-w-lg">
                    <img
                      src={mediaPackage.frames[0].image}
                      alt={machine.name}
                      className="w-full max-h-52 object-contain opacity-90"
                    />

                    {/* Height line indicator */}
                    <div className="absolute -left-4 top-0 bottom-0 border-l-2 border-dashed border-amber-400 flex flex-col justify-between items-start text-[10px] font-mono text-amber-400 pl-1">
                      <span>{mediaPackage.dimensions.overallHeightM} m</span>
                      <span>0 m</span>
                    </div>

                    {/* Length line indicator */}
                    <div className="absolute -bottom-4 left-0 right-0 border-b-2 border-dashed border-amber-400 flex justify-between items-end text-[10px] font-mono text-amber-400 pt-1">
                      <span>0 m</span>
                      <span>L: {mediaPackage.dimensions.overallLengthM} m</span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 text-[11px] text-zinc-400 bg-black/60 p-3 rounded-xl border border-zinc-800">
                  <strong>Facilidad de Transporte:</strong> {mediaPackage.dimensions.operatorComparisonNote}
                </div>
              </div>

              {/* Technical Measurement Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Matriz de Cotas y Medidas</span>
                </h4>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-0.5">Largo Total</span>
                    <span className="text-base font-black text-white">{mediaPackage.dimensions.overallLengthM} m</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-0.5">Ancho Total</span>
                    <span className="text-base font-black text-white">{mediaPackage.dimensions.overallWidthM} m</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-0.5">Alto Transporte</span>
                    <span className="text-base font-black text-white">{mediaPackage.dimensions.overallHeightM} m</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-0.5">Despeje al Suelo</span>
                    <span className="text-base font-black text-white">{mediaPackage.dimensions.groundClearanceMm} mm</span>
                  </div>
                  {mediaPackage.dimensions.maxDiggingDepthM && (
                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-0.5">Profundidad Máx.</span>
                      <span className="text-base font-black text-amber-400">{mediaPackage.dimensions.maxDiggingDepthM} m</span>
                    </div>
                  )}
                  {mediaPackage.dimensions.maxReachM && (
                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-0.5">Alcance Máximo</span>
                      <span className="text-base font-black text-amber-400">{mediaPackage.dimensions.maxReachM} m</span>
                    </div>
                  )}
                  <div className="col-span-2 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-0.5">Radio de Giro de Trabajo</span>
                    <span className="text-sm font-black text-white">{mediaPackage.dimensions.turningRadiusM} metros</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER ACTIONS BAR */}
      <div className="p-4 sm:p-5 bg-zinc-900 border-t border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-[10px] text-zinc-400 uppercase font-bold block">Inversión Base TMD</span>
            <span className="text-lg font-black text-white">
              {formatPrice(machine.basePriceUsd)}
            </span>
          </div>
          <div className="hidden md:block h-8 w-px bg-zinc-800" />
          <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Garantía Oficial 2 Años o 3,000 Horas</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenCalculator && (
            <button
              type="button"
              onClick={() => onOpenCalculator(machine)}
              className="py-2.5 px-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-zinc-700"
            >
              <Calculator className="w-4 h-4 text-amber-400" />
              <span>Calcular Cuotas</span>
            </button>
          )}

          {onOpenEstimate && (
            <button
              type="button"
              onClick={() => onOpenEstimate(machine)}
              className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <FileText className="w-4 h-4" />
              <span>Cotizar Proforma & PDF</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              addMachineToQuote(machine);
              if (onNavigate) {
                onNavigate('#/checkout');
              }
            }}
            className="py-2.5 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-zinc-700"
          >
            <span>Agregar a Proforma</span>
            <ChevronRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
