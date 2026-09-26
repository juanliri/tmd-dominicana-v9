import React from 'react';
import { 
  HardHat, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ArrowRight, 
  Award, 
  ChevronRight,
  TrendingUp,
  Layers
} from 'lucide-react';

interface ProjectsCaseStudiesViewProps {
  onNavigate: (route: string) => void;
}

const PROJECTS_DATA = [
  {
    title: 'Circunvalación Los Alcarrizos & Conexión Duarte',
    client: 'Consorcio Vial Dominicano / MOPC',
    location: 'Santo Domingo Oeste / Los Alcarrizos',
    equipmentUsed: ['6x Excavadoras LiuGong 922E', '4x Retroexcavadoras JCB 3CX', '3x Rodillos Ammann ASC110'],
    summary: 'Apertura de rasante, movimiento masivo de tierras y compactación de terraplén en tiempo récord con disponibilidad de flota del 98.4%.',
    stats: { earthMoved: '450,000 m³', uptime: '98.4%', hoursOperated: '12,800 hrs' },
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80',
    tag: 'Infraestructura Vial'
  },
  {
    title: 'Desarrollo Hotelero & Residencial Punta Cana - Macao',
    client: 'Constructora Codelpa / Grupo Turístico',
    location: 'Bávaro - Punta Cana, La Altagracia',
    equipmentUsed: ['5x Manipuladores Telescópicos JCB 540-170', '2x Mini-Excavadoras JCB 8035', '4x Generadores Diésel Cummins'],
    summary: 'Montaje de estructuras verticales, izaje seguro de materiales a 17 metros y adecuación de áreas de piscinas con cero incidentes de seguridad.',
    stats: { heightsReached: '17.0 m', uptime: '99.1%', hoursOperated: '8,400 hrs' },
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    tag: 'Turismo & Construcción Vertical'
  },
  {
    title: 'Extracción & Trituración en Cantera de Áridos Pedernales',
    client: 'Consorcio Minero del Sur / Alianzas Público-Privadas',
    location: 'Cabo Rojo / Pedernales',
    equipmentUsed: ['4x Excavadoras Pesadas LiuGong 936E (36T)', '2x Palas Cargadoras LiuGong 856H', 'Flota de Camiones Articulados'],
    summary: 'Rendimiento severo en extracción de caliza y áridos para las obras del nuevo polo turístico de Pedernales con asistencia de taller móvil SOS permanente.',
    stats: { tonsMoved: '850,000 Ton', uptime: '97.8%', hoursOperated: '16,200 hrs' },
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
    tag: 'Minería & Canteras'
  },
  {
    title: 'Ampliación de Canales de Riego & Fomento Arrocero',
    client: 'Asociación de Productores del Bajo Yuna',
    location: 'Nagua / San Francisco de Macorís, Duarte',
    equipmentUsed: ['8x Tractores Agrícolas LS Tractor Plus 90', '3x Retroexcavadoras JCB 3CX Eco'],
    summary: 'Adecuación de compuertas hidráulicas, preparación de tierras arroceras y mantenimiento preventivo con kit de filtros Donaldson OEM en finca.',
    stats: { hectaresPrepped: '3,200 Ha', uptime: '99.5%', hoursOperated: '6,100 hrs' },
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80',
    tag: 'Agroindustria & Riego'
  }
];

export const ProjectsCaseStudiesView: React.FC<ProjectsCaseStudiesViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 font-mono">
      {/* 1. Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2.5">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[3px] bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wider">
          <HardHat className="w-3.5 h-3.5" />
          <span>INFRAESTRUCTURA DOMINICANA EN MOVIMIENTO</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase font-display">
          CASOS DE ÉXITO & <span className="text-amber-400">PROYECTOS EN RD</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Conozca cómo las principales constructoras, mineras y consorcios viales de la República Dominicana potencian su rendimiento con la maquinaria y el soporte posventa de TMD.
        </p>
      </div>

      {/* 2. Projects Showcase Grid */}
      <div className="space-y-6">
        {PROJECTS_DATA.map((proj, pIdx) => (
          <div
            key={pIdx}
            className="rounded-[5px] bg-zinc-900 border border-zinc-800 overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12"
          >
            {/* Image Column */}
            <div className="lg:col-span-5 relative aspect-video lg:aspect-auto border-b lg:border-b-0 lg:border-r border-zinc-800">
              <img
                src={proj.image}
                alt={proj.title}
                className="w-full h-full object-cover grayscale-25 hover:grayscale-0 transition-all duration-300"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2 py-0.5 rounded-[3px] bg-black/85 backdrop-blur-xs text-amber-400 font-black text-[10px] uppercase border border-amber-500/30">
                  {proj.tag}
                </span>
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-7 p-5 sm:p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-[11px] font-bold text-amber-400 uppercase">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{proj.location}</span>
                  <span>•</span>
                  <span className="text-zinc-500">{proj.client}</span>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-white uppercase font-display">
                  {proj.title}
                </h3>

                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  {proj.summary}
                </p>

                {/* Equipment Used Tags */}
                <div className="pt-2">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
                    FLOTA DESPLEGADA:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.equipmentUsed.map((eq, eIdx) => (
                      <span
                        key={eIdx}
                        className="px-2 py-0.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-[10px] font-bold text-zinc-300 uppercase"
                      >
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Metric stats row */}
              <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-5">
                  {Object.entries(proj.stats).map(([k, val], sIdx) => (
                    <div key={sIdx}>
                      <span className="text-xs font-mono font-black text-white block uppercase">
                        {val}
                      </span>
                      <span className="text-[9px] text-zinc-500 uppercase tracking-wider">
                        {k.replace(/([A-Z])/g, ' $1')}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onNavigate('#/machinery')}
                  className="px-3 py-1.5 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>EQUIPOS SIMILARES</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
