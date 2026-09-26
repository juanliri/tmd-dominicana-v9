import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Play, 
  Video, 
  MapPin, 
  Gauge, 
  Fuel, 
  HardHat, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Layers,
  Award
} from 'lucide-react';
import patioPosterImg from '../../assets/images/patio_km22_video_poster_1789964094212.jpg';
import jcbActionImg from '../../assets/images/jcb_patio_demo_action_1789964105395.jpg';

interface OperationalVideo {
  id: string;
  title: string;
  machineName: string;
  brand: 'JCB' | 'LiuGong' | 'LS Tractor' | 'Kubota' | 'TMD';
  location: string;
  projectType: string;
  duration: string;
  thumbnailUrl: string;
  videoUrl?: string;
  telemetryHighlights: {
    cycleTimeSec: number;
    fuelRateLitersPerHour: number;
    payloadTon: number;
    elevationMeters: number;
  };
  summary: string;
  chapters?: { time: string; label: string }[];
}

const DOMINICAN_VIDEOS: OperationalVideo[] = [
  {
    id: 'vid-00',
    title: 'Sede Central Km 22 & Pistas de Prueba en Patio',
    machineName: 'Flota Multimarca Oficial TMD (JCB, Yanmar, LS)',
    brand: 'TMD',
    location: 'Autopista Duarte Km 22, Pedro Brand',
    projectType: 'Exhibición 15,000m², Pista de Prueba y Talleres',
    duration: '1:21 min',
    thumbnailUrl: patioPosterImg,
    videoUrl: '/videos/tmd-patio-km22.mp4',
    telemetryHighlights: {
      cycleTimeSec: 8.4,
      fuelRateLitersPerHour: 6.2,
      payloadTon: 15.0,
      elevationMeters: 65
    },
    summary: 'Recorrido aéreo y en tierra: valla oficial "La #1 del Mundo", demostración de retroexcavadoras JCB 3CX, minicargador con levante radial de 2.26m, manipulador Loadall de 20 metros y bahías de servicio.',
    chapters: [
      { time: '0:00', label: 'Valla Km 22 y Flota Yanmar/LS Tractor' },
      { time: '0:26', label: 'JCB 3CX en Patio de Grava' },
      { time: '0:36', label: 'Minicargador Levante 2.26m' },
      { time: '0:52', label: 'Manipulador Loadall 20m' },
      { time: '1:00', label: 'Mega Taller Central & Bahías' }
    ]
  },
  {
    id: 'vid-01',
    title: 'LiuGong 922E Excavadora en Extracción de Caliza',
    machineName: 'Excavadora LiuGong 922E HD',
    brand: 'LiuGong',
    location: 'Cantera San Cristóbal / Baní',
    projectType: 'Minería no metálica & Trituración',
    duration: '3:45 min',
    thumbnailUrl: '/images/video_ch1_patio.jpg',
    videoUrl: '/videos/tmd-patio-km22.mp4',
    telemetryHighlights: {
      cycleTimeSec: 13.8,
      fuelRateLitersPerHour: 14.2,
      payloadTon: 22.5,
      elevationMeters: 185
    },
    summary: 'Rendimiento en ciclo continuo cargando volquetas de 18m³ con balde de roca reforzado Hardox 450 en temperaturas de 34°C sin sobrecalentamiento.'
  },
  {
    id: 'vid-02',
    title: 'JCB 3CX Eco Retroexcavadora en Autovía del Este',
    machineName: 'Retroexcavadora JCB 3CX Eco',
    brand: 'JCB',
    location: 'Punta Cana — Miches',
    projectType: 'Infraestructura Vial y Zanjas',
    duration: '2:50 min',
    thumbnailUrl: '/images/video_ch2_jcb_patio.jpg',
    videoUrl: '/videos/tmd-patio-km22.mp4',
    telemetryHighlights: {
      cycleTimeSec: 11.2,
      fuelRateLitersPerHour: 6.8,
      payloadTon: 8.5,
      elevationMeters: 25
    },
    summary: 'Apertura de zanjas para fibra óptica y canaletas de drenaje con sistema EcoDig de JCB logrando un 16% de ahorro en gasoil regular.'
  },
  {
    id: 'vid-03',
    title: 'Tractor LS Plus 100 en Arrozales del Cibao',
    machineName: 'Tractor Agrícola LS Plus 100 4WD',
    brand: 'LS Tractor',
    location: 'Valle del Yuna / Bonao / La Vega',
    projectType: 'Fangueo y Preparación de Suelo Inundado',
    duration: '4:10 min',
    thumbnailUrl: '/images/video_ch3_minicargador.jpg',
    videoUrl: '/videos/tmd-patio-km22.mp4',
    telemetryHighlights: {
      cycleTimeSec: 9.5,
      fuelRateLitersPerHour: 7.4,
      payloadTon: 4.2,
      elevationMeters: 120
    },
    summary: 'Tracción total 4WD con ruedas arroceras y sellos mecánicos herméticos protegiendo la transmisión contra agua y lodo abrasivo.'
  }
];

interface Props {
  onScheduleTestDrive?: () => void;
}

export const DominicanOperationalVideos = React.memo<Props>(({ onScheduleTestDrive }) => {
  const [selectedVideo, setSelectedVideo] = useState<OperationalVideo>(DOMINICAN_VIDEOS[0]);
  const [isPlayingModal, setIsPlayingModal] = useState<boolean>(false);

  return (
    <div className="space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-zinc-900 rounded-[5px] border border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-[2px] text-[9px] font-black uppercase tracking-wider bg-amber-400 text-black">
              MULTIMEDIA RD
            </span>
            <h3 className="text-sm sm:text-base font-black text-white tracking-tight uppercase font-display">
              PRUEBAS EN TERRENO & RENDIMIENTO DOMINICANO
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5 font-sans">
            Grabaciones de alta definición en canteras, carreteras y plantaciones agrícolas del país.
          </p>
        </div>

        {onScheduleTestDrive && (
          <button
            onClick={onScheduleTestDrive}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-black transition-colors self-start sm:self-auto cursor-pointer uppercase shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>AGENDAR DEMO EN PATIO KM 22</span>
          </button>
        )}
      </div>

      {/* Main Video Stage & Telemetry Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Large Video Player Preview */}
        <div className="lg:col-span-2 rounded-[5px] overflow-hidden bg-black border border-zinc-800 shadow-xl relative aspect-video flex items-center justify-center group">
          <img
            src={selectedVideo.thumbnailUrl}
            alt={selectedVideo.title}
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

          {/* Center Play Trigger */}
          <button
            onClick={() => setIsPlayingModal(true)}
            className="relative z-10 w-14 h-14 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer"
          >
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </button>

          {/* Video Metadata Overlay */}
          <div className="absolute bottom-0 inset-x-0 p-4 z-10 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-1.5 py-0.5 rounded-[2px] text-[9px] font-black bg-amber-400 text-black uppercase">
                  {selectedVideo.brand}
                </span>
                <span className="text-xs text-zinc-300 flex items-center gap-1 uppercase text-[11px]">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  {selectedVideo.location}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-black uppercase font-display">{selectedVideo.title}</h4>
              <p className="text-xs text-zinc-400 line-clamp-1 font-sans">{selectedVideo.summary}</p>
            </div>

            <span className="px-2 py-0.5 rounded-[2px] bg-black/80 backdrop-blur-xs border border-white/10 text-xs font-mono font-bold shrink-0">
              {selectedVideo.duration}
            </span>
          </div>
        </div>

        {/* Telemetry Highlights Panel */}
        <div className="p-4 rounded-[5px] bg-zinc-900 text-white border border-zinc-800 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-1.5 text-amber-400 mb-1.5">
              <Gauge className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-wider">TELEMETRÍA DE LA PRUEBA</span>
            </div>
            <h4 className="text-xs sm:text-sm font-black text-white uppercase font-display">{selectedVideo.machineName}</h4>
            <p className="text-[10px] text-zinc-400 mt-0.5 uppercase">{selectedVideo.projectType}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-[3px] bg-zinc-950 border border-zinc-800">
              <span className="text-[9px] text-zinc-400 block uppercase">TIEMPO DE CICLO</span>
              <span className="text-sm font-black text-amber-400 font-mono">
                {selectedVideo.telemetryHighlights.cycleTimeSec} seg
              </span>
            </div>

            <div className="p-2.5 rounded-[3px] bg-zinc-950 border border-zinc-800">
              <span className="text-[9px] text-zinc-400 block uppercase">CONSUMO PROMEDIO</span>
              <span className="text-sm font-black text-emerald-400 font-mono flex items-center gap-1">
                <Fuel className="w-3 h-3" />
                {selectedVideo.telemetryHighlights.fuelRateLitersPerHour} L/h
              </span>
            </div>

            <div className="p-2.5 rounded-[3px] bg-zinc-950 border border-zinc-800">
              <span className="text-[9px] text-zinc-400 block uppercase">CAPACIDAD / CARGA</span>
              <span className="text-sm font-black text-white font-mono">
                {selectedVideo.telemetryHighlights.payloadTon} Ton
              </span>
            </div>

            <div className="p-2.5 rounded-[3px] bg-zinc-950 border border-zinc-800">
              <span className="text-[9px] text-zinc-400 block uppercase">ELEVACIÓN OBRA</span>
              <span className="text-sm font-black text-white font-mono">
                {selectedVideo.telemetryHighlights.elevationMeters} msnm
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800">
            <p className="text-[10px] text-zinc-500 leading-relaxed uppercase">
              Datos registrados por módem LiveLink™ 4G en tiempo real durante la jornada.
            </p>
          </div>
        </div>
      </div>

      {/* Video Playlist Selector Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {DOMINICAN_VIDEOS.map((vid) => (
          <button
            key={vid.id}
            onClick={() => setSelectedVideo(vid)}
            className={`p-2.5 rounded-[3px] text-left transition-all border flex items-center gap-2.5 cursor-pointer ${
              selectedVideo.id === vid.id
                ? 'bg-amber-500/10 border-amber-400 text-white ring-1 ring-amber-400'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
            }`}
          >
            <div className="relative w-14 h-10 rounded-[2px] overflow-hidden shrink-0 bg-black">
              <img src={vid.thumbnailUrl} alt={vid.title} className="w-full h-full object-cover opacity-80" />
              <Play className="w-3.5 h-3.5 text-white absolute inset-0 m-auto" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black truncate uppercase font-display">{vid.title}</p>
              <span className="text-[9px] text-zinc-500 block truncate uppercase">📍 {vid.location}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Video Playback Modal */}
      {isPlayingModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-zinc-950 rounded-[5px] overflow-hidden border border-zinc-800 shadow-2xl">
            <div className="p-3.5 bg-zinc-900 flex items-center justify-between text-white border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded-[2px] bg-amber-400 text-black text-[9px] font-black uppercase">
                    {selectedVideo.brand}
                  </span>
                  <h4 className="text-xs sm:text-sm font-black uppercase font-display">{selectedVideo.title}</h4>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5 uppercase">Demostración en {selectedVideo.location} • Duración {selectedVideo.duration}</p>
              </div>
              <button
                onClick={() => setIsPlayingModal(false)}
                className="p-1.5 rounded-[3px] bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer uppercase text-xs font-mono"
              >
                CERRAR ✕
              </button>
            </div>
            
            <div className="aspect-video w-full relative bg-black overflow-hidden flex items-center justify-center">
              <video
                src={selectedVideo.videoUrl || "/videos/tmd-patio-km22.mp4"}
                poster={selectedVideo.thumbnailUrl}
                controls
                autoPlay
                playsInline
                preload="metadata"
                onError={(e) => {
                  const target = e.currentTarget as HTMLVideoElement;
                  if (target.src !== window.location.origin + '/videos/tmd-patio-km22.mp4') {
                    target.src = '/videos/tmd-patio-km22.mp4';
                    target.load();
                    target.play().catch(() => {});
                  }
                }}
                className="w-full h-full object-cover"
              />

              <div className="absolute top-3 left-3 z-10 pointer-events-none">
                <span className="px-2 py-0.5 rounded-[2px] bg-black/80 backdrop-blur-xs border border-white/20 text-white text-[10px] font-black flex items-center gap-1.5 uppercase font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Transmisión HD • Patio Km 22
                </span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
});

DominicanOperationalVideos.displayName = 'DominicanOperationalVideos';
