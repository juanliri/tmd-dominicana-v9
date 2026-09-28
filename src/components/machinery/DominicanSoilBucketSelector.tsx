import React, { useState } from 'react';
import { 
  Mountain, 
  Wrench, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Layers, 
  ChevronRight, 
  Plus, 
  HardHat,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { Machine } from '../../types';
import { triggerHaptic } from '../../utils/haptics';

interface DominicanSoilBucketSelectorProps {
  machine?: Machine | null;
  onSelectAttachment?: (attachmentName: string, priceUsd: number) => void;
  className?: string;
}

interface SoilRecommendation {
  soilId: string;
  soilName: string;
  region: string;
  hardnessMohs: string;
  recommendedBucketName: string;
  bucketTypeTag: string;
  steelGrade: string;
  cuttingEdgeMm: number;
  teethType: string;
  capacityM3: number;
  hourlyProductionM3: number;
  priceUsd: number;
  description: string;
  operationalTip: string;
}

const DOMINICAN_SOIL_RECOMMENDATIONS: SoilRecommendation[] = [
  {
    soilId: 'coral_rock',
    soilName: 'Roca Coralina y Caliza de Cantera',
    region: 'Bávaro, Cap Cana, San Cristóbal, Baní',
    hardnessMohs: '4.5 - 6.0 Mohs (Alta Abrasión)',
    recommendedBucketName: 'Balde de Roca Extrema Heavy Duty (HD Rock)',
    bucketTypeTag: 'ROCA HD HARDOX 500',
    steelGrade: 'Blindaje Hardox 500 + Protectores de Labio',
    cuttingEdgeMm: 45,
    teethType: 'Dientes Tipo Tigre Gemelo (Twin Tiger) de Penetración',
    capacityM3: 1.15,
    hourlyProductionM3: 95,
    priceUsd: 3850,
    description: 'Estructura reforzada en el fondo con costillas antidesgaste soldadas en rombo para soportar el impacto repetitivo contra roca caliza coralina.',
    operationalTip: 'Evite hacer palanca lateral excesiva; penetre en fracturas naturales de la roca para reducir el consumo de combustible diésel hasta un 18%.'
  },
  {
    soilId: 'cibao_clay',
    soilName: 'Arcilla Plástica y Zanjas de Riego',
    region: 'La Vega, Moca, San Francisco, Cotuí',
    hardnessMohs: '1.5 - 2.5 Mohs (Cohesivo)',
    recommendedBucketName: 'Balde de Limpieza y Talud Inclinable (Tilting 60")',
    bucketTypeTag: 'PERFILADO & TALUD',
    steelGrade: 'Acero Estructural de Alta Resistencia Q345B / A572',
    cuttingEdgeMm: 30,
    teethType: 'Cuchilla Lisa Reversible con Doble Bisel',
    capacityM3: 0.95,
    hourlyProductionM3: 140,
    priceUsd: 2400,
    description: 'Diseño ancho de perfil bajo con doble cilindro hidráulico basculante (±45°) ideal para cunetas viales, limpieza de canales y taludes.',
    operationalTip: 'La cuchilla corrida evita el desmoronamiento de paredes en zanjas para tuberías de agua potable o drenaje pluvial.'
  },
  {
    soilId: 'alluvial_gravel',
    soilName: 'Grava y Aluvión de Río para Dragado',
    region: 'Río Nizao, Río Haina, Río Yaque del Norte',
    hardnessMohs: '3.5 - 5.0 Mohs (Fricción Media)',
    recommendedBucketName: 'Balde Esqueleto / Clasificador de Piedra Bola',
    bucketTypeTag: 'CRIBADO & CLASIFICACIÓN',
    steelGrade: 'Barras de Acero Redondas Forjadas de 35mm',
    cuttingEdgeMm: 35,
    teethType: 'Dientes de Roca con Adaptadores Roscados',
    capacityM3: 1.25,
    hourlyProductionM3: 165,
    priceUsd: 3100,
    description: 'Separación inmediata del material fino (arena) mientras retiene piedras mayores a 3 pulgadas directamente en el lecho del río o planta de lavado.',
    operationalTip: 'Reduce el volumen de transporte inútil enviando únicamente el agregado clasificado a la tolva del triturador secundario.'
  },
  {
    soilId: 'urban_trench',
    soilName: 'Canalizaciones Urbanas & Asfalto',
    region: 'Gran Santo Domingo, Santiago Centro',
    hardnessMohs: 'Pavimento & Concreto Urbano',
    recommendedBucketName: 'Cucharón de Zanja Angosto (12" / 300mm)',
    bucketTypeTag: 'ZANJAS COMPACTAS',
    steelGrade: 'Refuerzos Laterales de Acero NM400',
    cuttingEdgeMm: 25,
    teethType: '3 Dientes Centrales Estrechos',
    capacityM3: 0.35,
    hourlyProductionM3: 65,
    priceUsd: 1200,
    description: 'Ancho micrométrico para minimizar la rotura de asfalto y hormigón en calles públicas durante tendido de fibra óptica y tuberías.',
    operationalTip: 'Ahorra hasta un 40% en costos de asfalto de reposición al generar una zanja limpia con bordes verticales paralelos.'
  }
];

export const DominicanSoilBucketSelector: React.FC<DominicanSoilBucketSelectorProps> = ({
  machine,
  onSelectAttachment,
  className = ''
}) => {
  const [selectedSoilId, setSelectedSoilId] = useState<string>('coral_rock');
  const [isAdded, setIsAdded] = useState<boolean>(false);

  const activeRec = DOMINICAN_SOIL_RECOMMENDATIONS.find(x => x.soilId === selectedSoilId) || DOMINICAN_SOIL_RECOMMENDATIONS[0];

  const handleAdd = () => {
    triggerHaptic('successThump');
    setIsAdded(true);
    if (onSelectAttachment) {
      onSelectAttachment(activeRec.recommendedBucketName, activeRec.priceUsd);
    }
    setTimeout(() => setIsAdded(false), 2500);
  };

  return (
    <div className={`p-4 rounded-[4px] bg-zinc-950 border border-zinc-800 font-mono text-white ${className}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[2px] bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
            <Mountain className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
              Selector de Baldes por Geología de Suelo Dominicano
            </h4>
            <p className="text-[11px] text-zinc-400 font-sans">
              Recomendación técnica del implemento óptimo para maximizar m³/hora y evitar desgaste prematuro de pluma.
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-[2px] bg-zinc-900 border border-zinc-700 text-zinc-300 text-[10px] font-bold uppercase shrink-0">
          Geotecnia RD • Hardox 500
        </span>
      </div>

      {/* Soil Selector Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
        {DOMINICAN_SOIL_RECOMMENDATIONS.map(item => (
          <button
            key={item.soilId}
            type="button"
            onClick={() => {
              triggerHaptic('mechanicalClick');
              setSelectedSoilId(item.soilId);
            }}
            className={`p-2 rounded-[3px] text-left transition-all border cursor-pointer ${
              selectedSoilId === item.soilId
                ? 'bg-zinc-900 border-amber-400 ring-1 ring-amber-400/40 shadow-xs'
                : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/40'
            }`}
          >
            <span className="text-[9px] font-bold uppercase text-amber-400 block truncate">
              {item.region.split(',')[0]}
            </span>
            <span className="text-xs font-bold text-white uppercase block truncate mt-0.5">
              {item.soilName}
            </span>
          </button>
        ))}
      </div>

      {/* Selected Recommendation Card */}
      <div className="mt-3 p-4 rounded-[3px] bg-gradient-to-br from-zinc-900 to-zinc-950 border border-amber-400/30 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-[2px] bg-amber-400 text-black text-[9px] font-black uppercase tracking-wider font-mono">
                {activeRec.bucketTypeTag}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                Dureza: <strong className="text-zinc-200">{activeRec.hardnessMohs}</strong>
              </span>
            </div>
            <h5 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
              {activeRec.recommendedBucketName}
            </h5>
            <span className="text-xs text-zinc-400 font-sans block mt-0.5">
              Zona Operativa: <strong className="text-amber-400 font-mono">{activeRec.region}</strong>
            </span>
          </div>

          <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-start gap-1 shrink-0">
            <span className="text-[9px] text-zinc-400 uppercase font-bold">Inversión Implemento:</span>
            <span className="text-base sm:text-lg font-black text-amber-400 font-mono">
              +${activeRec.priceUsd.toLocaleString('en-US')} USD
            </span>
          </div>
        </div>

        {/* Technical Specs Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 pb-3 text-xs border-b border-zinc-800/80">
          <div>
            <span className="text-zinc-500 text-[9px] block uppercase font-bold">Capacidad Nominal:</span>
            <span className="font-bold text-white font-mono text-xs">{activeRec.capacityM3} m³</span>
          </div>
          <div>
            <span className="text-zinc-500 text-[9px] block uppercase font-bold">Producción Estimada:</span>
            <span className="font-bold text-emerald-400 font-mono text-xs flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>{activeRec.hourlyProductionM3} m³/hora</span>
            </span>
          </div>
          <div>
            <span className="text-zinc-500 text-[9px] block uppercase font-bold">Espesor de Cuchilla:</span>
            <span className="font-bold text-amber-400 font-mono text-xs">{activeRec.cuttingEdgeMm} mm</span>
          </div>
          <div>
            <span className="text-zinc-500 text-[9px] block uppercase font-bold">Dientes / Puntas:</span>
            <span className="font-bold text-zinc-200 text-[10px] truncate block">{activeRec.teethType}</span>
          </div>
        </div>

        {/* Operational Description & Tip */}
        <div className="pt-3 text-xs space-y-2">
          <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
            {activeRec.description}
          </p>
          <div className="p-2.5 rounded-[2px] bg-amber-400/10 border border-amber-400/20 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-zinc-200 font-sans leading-relaxed">
              <strong>Consejo de Cantera:</strong> {activeRec.operationalTip}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
            Fabricación e instalación en taller central Km 22 con acople rápido garantizado.
          </span>
          <button
            type="button"
            onClick={handleAdd}
            className={`py-1.5 px-3 rounded-[2px] text-xs font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer ml-auto shadow-xs ${
              isAdded 
                ? 'bg-emerald-500 text-black' 
                : 'bg-amber-400 hover:bg-amber-300 text-black'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>¡Agregado a Cotización!</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Seleccionar este Balde</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
