import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  MapPin, 
  RotateCcw, 
  Calendar, 
  ChevronRight, 
  Layers, 
  ExternalLink,
  ShieldCheck,
  Building2,
  Truck,
  Sparkles,
  Phone,
  Clock,
  Compass,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import patioPosterImg from '../../assets/images/patio_km22_video_poster_1789964094212.jpg';
import jcbActionImg from '../../assets/images/jcb_patio_demo_action_1789964105395.jpg';

// Official TMD Patio Km 22 Authentic Drone & Ground Video (served from /videos/tmd-patio-km22.mp4)
const VIDEO_STREAM_SOURCES = [
  '/videos/tmd-patio-km22.mp4'
];

interface VideoChapter {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  seconds: number;
  badge: string;
  image: string;
  specs: { label: string; value: string }[];
}

const VIDEO_CHAPTERS: VideoChapter[] = [
  {
    id: 'ch1',
    title: 'Vista Aérea Patio Km 22 & Showroom',
    subtitle: '15,000+ m² de patio de pruebas, pista de tierra y exhibición oficial TMD en Autopista Duarte.',
    time: '0:00',
    seconds: 0,
    badge: 'Patio Principal',
    image: '/images/video_ch1_patio.jpg',
    specs: [
      { label: 'Área Total', value: '15,000 m²' },
      { label: 'Ubicación', value: 'Km 22 Duarte' },
      { label: 'Capacidad', value: '100+ Equipos' }
    ]
  },
  {
    id: 'ch2',
    title: 'Flota JCB & Patio de Maniobras',
    subtitle: 'Línea de retroexcavadoras JCB 3CX Eco y maquinaria pesada lista para entrega inmediata en obra.',
    time: '0:04',
    seconds: 4,
    badge: 'Flota JCB Oficial',
    image: '/images/video_ch2_jcb_patio.jpg',
    specs: [
      { label: 'Retroexcavadoras', value: 'JCB 3CX Eco 4x4' },
      { label: 'Disponibilidad', value: 'En Stock Patio' },
      { label: 'Garantía', value: '2,000 Horas / TMD' }
    ]
  },
  {
    id: 'ch3',
    title: 'Demostración Dinámica & Minicargadores',
    subtitle: 'Pruebas de excavación y maniobrabilidad en terreno real con minicargador de oruga y retro.',
    time: '0:08',
    seconds: 8,
    badge: 'Demostración en Vivo',
    image: '/images/video_ch3_minicargador.jpg',
    specs: [
      { label: 'Maniobrabilidad', value: 'Radio Giro Cero' },
      { label: 'Levante Radial', value: 'Alta Capacidad' },
      { label: 'Telemetría', value: 'LiveLink™ Activo' }
    ]
  },
  {
    id: 'ch4',
    title: 'Taller Central 12 Bahías & Entrega',
    subtitle: 'Naves de servicio técnico especializado, grúas puente de 15T y área de entrega inmediata.',
    time: '0:13',
    seconds: 13,
    badge: 'Taller Mayor',
    image: '/images/video_ch4_taller.jpg',
    specs: [
      { label: 'Bahías', value: '12 Líneas HD' },
      { label: 'Grúas Puente', value: '15 Toneladas' },
      { label: 'Soporte', value: '24/7 en Campo' }
    ]
  }
];

export interface PatioKm22DroneVideoShowcaseProps {
  onScheduleTestDrive?: () => void;
  onNavigate?: (route: string) => void;
  compact?: boolean;
}

export const PatioKm22DroneVideoShowcase: React.FC<PatioKm22DroneVideoShowcaseProps> = ({
  onScheduleTestDrive,
  onNavigate,
  compact = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(17.67);
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState<boolean>(false);
  const [sourceIndex, setSourceIndex] = useState<number>(0);
  const [hasPlaybackError, setHasPlaybackError] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);

  const currentSrc = VIDEO_STREAM_SOURCES[sourceIndex] || VIDEO_STREAM_SOURCES[0];
  const activeChapter = VIDEO_CHAPTERS[activeChapterIndex] || VIDEO_CHAPTERS[0];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      if (Number.isFinite(time)) {
        setCurrentTime(time);

        const chapterIdx = VIDEO_CHAPTERS.reduce((acc, ch, idx) => {
          if (time >= ch.seconds) return idx;
          return acc;
        }, 0);

        if (chapterIdx !== activeChapterIndex) {
          setActiveChapterIndex(chapterIdx);
        }
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const vidDuration = videoRef.current.duration;
      if (Number.isFinite(vidDuration) && vidDuration > 0) {
        setDuration(vidDuration);
      }
    }
    setIsBuffering(false);
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setIsBuffering(false);
    } else {
      setIsBuffering(true);
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsBuffering(false);
          })
          .catch(() => {
            if (!isMuted && videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play()
                .then(() => {
                  setIsPlaying(true);
                  setIsBuffering(false);
                })
                .catch(() => {
                  setIsPlaying(false);
                  setIsBuffering(false);
                });
            } else {
              setIsPlaying(false);
              setIsBuffering(false);
            }
          });
      }
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleSeek = (seconds: number) => {
    if (videoRef.current && Number.isFinite(seconds)) {
      const safeTime = Math.max(0, Math.min(seconds, duration || 81));
      videoRef.current.currentTime = safeTime;
      setCurrentTime(safeTime);
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleChapterSelect = (index: number) => {
    setActiveChapterIndex(index);
    const targetSec = VIDEO_CHAPTERS[index].seconds;
    handleSeek(targetSec);
  };

  const handleVideoError = () => {
    setHasPlaybackError(true);
    setIsBuffering(false);
  };

  const handleRetryPlayback = () => {
    setHasPlaybackError(false);
    setSourceIndex(0);
    setIsBuffering(true);
    if (videoRef.current) {
      videoRef.current.src = VIDEO_STREAM_SOURCES[0];
      videoRef.current.load();
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const openFullscreenModal = () => {
    if (videoRef.current && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    setIsFullscreenModalOpen(true);
  };

  const closeFullscreenModal = () => {
    if (modalVideoRef.current && videoRef.current) {
      const modalTime = modalVideoRef.current.currentTime;
      if (Number.isFinite(modalTime)) {
        videoRef.current.currentTime = modalTime;
        setCurrentTime(modalTime);
      }
    }
    setIsFullscreenModalOpen(false);
  };

  const formatSeconds = (sec: number) => {
    if (!Number.isFinite(sec) || isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div id="patio-km22-video-showcase" className="w-full font-mono">
      <div className="rounded-[5px] overflow-hidden border border-zinc-800 bg-zinc-950 shadow-lg relative transition-all">
        {/* Sleek, Compact Header Bar */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-3.5 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-black text-white flex items-center gap-1.5 uppercase font-display tracking-tight">
              <span>RECORRIDO HD SEDE CENTRAL KM 22</span>
              <span className="text-zinc-600 hidden sm:inline">•</span>
              <span className="text-zinc-400 text-[11px] font-mono font-normal hidden sm:inline">Autopista Duarte, Sto. Dgo. Oeste</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onScheduleTestDrive && (
              <button
                type="button"
                onClick={onScheduleTestDrive}
                className="px-2.5 py-1 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer uppercase shadow-xs"
              >
                <Calendar className="w-3 h-3" />
                <span>AGENDAR DEMO</span>
              </button>
            )}
            <button
              type="button"
              onClick={openFullscreenModal}
              className="p-1 rounded-[3px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Pantalla Completa"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Space-Optimized Stage Grid: Responsive Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Responsive 16:9 Video Player (8 Cols on Desktop) */}
          <div className="lg:col-span-8 relative aspect-video bg-black overflow-hidden flex items-center justify-center group">
            {/* HTML5 Video Player */}
            <video
              ref={videoRef}
              src={currentSrc}
              poster={activeChapter.image}
              playsInline
              muted={isMuted}
              loop
              preload="metadata"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onError={handleVideoError}
              onWaiting={() => setIsBuffering(true)}
              onPlaying={() => {
                setIsBuffering(false);
                setIsPlaying(true);
              }}
              onCanPlay={() => setIsBuffering(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-cover object-center"
            />

            {/* Buffering Indicator */}
            {isBuffering && isPlaying && !hasPlaybackError && (
              <div className="absolute inset-0 z-15 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[1px] pointer-events-none">
                <div className="w-8 h-8 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin mb-1.5" />
                <span className="text-[10px] font-bold text-amber-300 bg-black/80 px-2 py-0.5 rounded-[2px] border border-amber-400/30 uppercase">
                  Cargando transmisión...
                </span>
              </div>
            )}

            {/* Play/Pause Center Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <button
                type="button"
                onClick={togglePlayPause}
                className={`w-14 h-14 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-2xl hover:scale-105 transition-all cursor-pointer pointer-events-auto ${
                  isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
                }`}
                title={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current text-black" />
                ) : (
                  <Play className="w-6 h-6 fill-current ml-0.5 text-black" />
                )}
              </button>
            </div>

            {/* Top Right Floating Live Tag */}
            <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 pointer-events-none">
              <span className="px-2 py-0.5 rounded-[2px] bg-black/80 backdrop-blur-xs text-[9px] font-mono font-bold text-amber-400 border border-amber-400/30">
                1080P • 60 FPS
              </span>
            </div>

            {/* Compact Bottom Scrubber Bar */}
            <div className="absolute bottom-0 inset-x-0 p-3 z-20 text-white pointer-events-auto bg-gradient-to-t from-black/90 via-black/50 to-transparent">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={togglePlayPause}
                  className="text-amber-400 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>

                <div 
                  className="flex-1 h-1.5 bg-zinc-700/80 hover:h-2 rounded-[1px] overflow-hidden cursor-pointer relative transition-all"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percent = Math.max(0, Math.min(1, clickX / rect.width));
                    handleSeek(percent * duration);
                  }}
                >
                  <div 
                    className="h-full bg-amber-400 rounded-[1px]"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>

                <span className="text-[10px] font-mono text-zinc-300 shrink-0">
                  {formatSeconds(currentTime)} / {formatSeconds(duration)}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    const nextRate = playbackRate === 1 ? 1.25 : playbackRate === 1.25 ? 1.5 : 1;
                    setPlaybackRate(nextRate);
                  }}
                  className="px-1.5 py-0.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-[9px] font-mono font-bold text-zinc-200 transition-colors cursor-pointer shrink-0 uppercase"
                  title="Velocidad de reproducción"
                >
                  {playbackRate}x
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1 rounded-[2px] text-zinc-300 hover:text-white transition-colors cursor-pointer shrink-0"
                  title={isMuted ? 'Activar Audio' : 'Silenciar'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Chapter Pills & Telemetry (4 Cols on Desktop) */}
          <div className="lg:col-span-4 p-3.5 bg-zinc-900 border-t lg:border-t-0 lg:border-l border-zinc-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  PUNTOS DESTACADOS
                </span>
                <span className="text-[9px] text-zinc-500 font-mono uppercase">4 ESCENAS OFICIALES</span>
              </div>

              {/* 4 Chapter Selector Buttons */}
              <div className="space-y-1.5">
                {VIDEO_CHAPTERS.map((ch, idx) => {
                  const isActive = activeChapterIndex === idx;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => handleChapterSelect(idx)}
                      className={`w-full p-2 rounded-[3px] text-left transition-all border flex items-center gap-2 cursor-pointer ${
                        isActive
                          ? 'bg-amber-400/10 border-amber-400 text-white'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-[2px] ${
                        isActive ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {ch.time}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className={`text-xs font-bold truncate block uppercase font-display ${isActive ? 'text-amber-400' : 'text-zinc-200'}`}>
                          {ch.title}
                        </span>
                        <span className="text-[10px] text-zinc-400 truncate block mt-0.5 font-sans">
                          {ch.subtitle}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Chapter Details Card */}
            <div className="p-2.5 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-black text-amber-400">
                  {activeChapter.badge}
                </span>
                <span className="text-[9px] text-zinc-400 font-mono">
                  {activeChapter.specs[0]?.label}: <strong className="text-zinc-200">{activeChapter.specs[0]?.value}</strong>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1 pt-1 border-t border-zinc-800 text-[9px] uppercase">
                {activeChapter.specs.slice(1).map((s, i) => (
                  <div key={i} className="text-zinc-400">
                    <span>{s.label}: </span>
                    <strong className="text-zinc-200">{s.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Action Strip */}
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs gap-2">
              {onScheduleTestDrive && (
                <button
                  type="button"
                  onClick={onScheduleTestDrive}
                  className="flex-1 py-1.5 px-2.5 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>PROBAR EN PATIO</span>
                </button>
              )}
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('#/machinery')}
                  className="py-1.5 px-2.5 rounded-[3px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer uppercase"
                >
                  <span>EQUIPOS</span>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Video Modal */}
      {isFullscreenModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fadeIn font-mono">
          <div className="w-full max-w-5xl bg-zinc-950 rounded-[5px] border border-zinc-800 overflow-hidden shadow-2xl relative">
            <div className="p-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded-[2px] bg-amber-400 text-black text-[9px] font-black uppercase">
                  4K DRONE TOUR
                </span>
                <h3 className="text-xs sm:text-sm font-black text-white uppercase font-display">
                  INSTALACIONES TMD KM 22 DUARTE
                </h3>
              </div>
              <button
                type="button"
                onClick={closeFullscreenModal}
                className="p-1 rounded-[3px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer uppercase text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center">
              <video
                ref={modalVideoRef}
                src={currentSrc}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
