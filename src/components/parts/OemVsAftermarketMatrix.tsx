import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  TrendingDown, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  HelpCircle,
  FileText,
  Sliders,
  Sparkles
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface ComparisonCategory {
  id: string;
  name: string;
  component: string;
  oemPriceUsd: number;
  aftermarketPriceUsd: number;
  oemHoursLife: number;
  aftermarketHoursLife: number;
  downtimeRiskOem: string;
  downtimeRiskAftermarket: string;
  warrantyOem: string;
  warrantyAftermarket: string;
  verdict: string;
}

const COMPARISON_DATA: ComparisonCategory[] = [
  {
    id: 'fuel_filters',
    name: 'Filtros de Combustible Primario / Decantador',
    component: 'Elemento separador de agua para sistema Common Rail 1800 bar',
    oemPriceUsd: 48,
    aftermarketPriceUsd: 22,
    oemHoursLife: 500,
    aftermarketHoursLife: 180,
    downtimeRiskOem: '0.2% (Medio filtrante sintético 4 micras retiene agua emulsionada)',
    downtimeRiskAftermarket: '28.4% (Papel de celulosa poroso permite paso de agua a inyectores piezoeléctricos)',
    warrantyOem: 'Garantía Total TMD 12 meses / Respaldo de Inyectores',
    warrantyAftermarket: 'Sin garantía ante contaminación o daño secundario de motor',
    verdict: 'Una falla en un inyector Common Rail cuesta US$ 1,450. El filtro genérico ahorra US$ 26 pero arriesga US$ 6,000 en reparación de inyección.'
  },
  {
    id: 'hydraulic_filters',
    name: 'Filtro Hidráulico de Retorno Alta Presión',
    component: 'Cartucho de microfibra de vidrio con válvula de derivación calibrada',
    oemPriceUsd: 85,
    aftermarketPriceUsd: 38,
    oemHoursLife: 1000,
    aftermarketHoursLife: 350,
    downtimeRiskOem: '0.1% (Capacidad de retención de polvo beta ratio βx(c) ≥ 1000)',
    downtimeRiskAftermarket: '34.0% (Colapso prematuro del núcleo metálico y apertura no deseada del bypass)',
    warrantyOem: 'Garantía extendida de bomba hidráulica Kawasaki/Parker',
    warrantyAftermarket: 'Nula. Pérdida inmediata de garantía del banco de válvulas',
    verdict: 'El bypass abierto en un filtro genérico envía virutas metálicas directamente a la bomba principal de 340 bar, causando avería total.'
  },
  {
    id: 'bucket_teeth',
    name: 'Puntas de Balde & Pasadores de Roca Coralina',
    component: 'Diente forjado de acero aleado con alto contenido de manganeso',
    oemPriceUsd: 65,
    aftermarketPriceUsd: 32,
    oemHoursLife: 600,
    aftermarketHoursLife: 210,
    downtimeRiskOem: 'Bajo (Dureza 52-56 HRC hasta el núcleo sin quiebre frágil)',
    downtimeRiskAftermarket: 'Alto (Dureza superficial de 40 HRC; fractura de pasadores en cantera de roca)',
    warrantyOem: 'Reemplazo 100% gratuito si presenta fisura o desprendimiento',
    warrantyAftermarket: 'Sin reposición por desgaste abrasivo',
    verdict: 'El costo por hora del OEM es US$ 0.10/h vs US$ 0.15/h del aftermarket, rindiendo casi el triple en terreno dominicano.'
  },
  {
    id: 'pins_bushings',
    name: 'Pasadores y Bujes Cementados de Pluma / Brazo',
    component: 'Acero templado por inducción con ranuras helicoidales de lubricación',
    oemPriceUsd: 195,
    aftermarketPriceUsd: 95,
    oemHoursLife: 3000,
    aftermarketHoursLife: 900,
    downtimeRiskOem: 'Mínimo (Holgura axial < 0.8 mm tras 2,000 horas de excavación)',
    downtimeRiskAftermarket: 'Severo (Ovalización prematura del ojo de la pluma que obliga a barrenar chasis)',
    warrantyOem: 'Garantía estructural de articulación 2 años',
    warrantyAftermarket: 'Sin garantía estructural',
    verdict: 'Barrenar y recuperar un ojo de pluma ovalizado cuesta RD$ 180,000 en taller. El buje OEM previene la deformación del chasis.'
  },
  {
    id: 'engine_oil',
    name: 'Aceite de Motor Diésel Heavy Duty 15W-40 (Cubeta 5 Gal)',
    component: 'Aceite básico Grupo II con paquete de aditivos de alta reserva alcalina (TBN 10.5)',
    oemPriceUsd: 98,
    aftermarketPriceUsd: 65,
    oemHoursLife: 250,
    aftermarketHoursLife: 150,
    downtimeRiskOem: 'Bajo (Dispersa hollín y neutraliza ácido sulfúrico del diésel caribeño)',
    downtimeRiskAftermarket: 'Alto (Pérdida rápida de viscosidad a 95°C y formación de lodos en cárter)',
    warrantyOem: 'Certificado de análisis S.O.S. avalado por fábrica',
    warrantyAftermarket: 'Sin análisis espectrométrico de desgaste',
    verdict: 'El aceite original preserva la película lubricante en los cojinetes de biela y bancada ante el calor extremo de las canteras.'
  }
];

export const OemVsAftermarketMatrix: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [selectedCatId, setSelectedCatId] = useState<string>('fuel_filters');
  const [fleetSize, setFleetSize] = useState<number>(3);
  const [annualHours, setAnnualHours] = useState<number>(1800);

  const activeData = COMPARISON_DATA.find(x => x.id === selectedCatId) || COMPARISON_DATA[0];

  // Calculations
  const oemCostPerHour = activeData.oemPriceUsd / activeData.oemHoursLife;
  const aftermarketCostPerHour = activeData.aftermarketPriceUsd / activeData.aftermarketHoursLife;
  const hourlySavings = aftermarketCostPerHour - oemCostPerHour;
  const annualFleetOemCost = Math.round(oemCostPerHour * annualHours * fleetSize);
  const annualFleetAftermarketCost = Math.round(aftermarketCostPerHour * annualHours * fleetSize);
  const annualNetSavings = annualFleetAftermarketCost - annualFleetOemCost;

  return (
    <div className={`p-4 rounded-[4px] bg-zinc-950 border border-zinc-800 font-mono text-white ${className}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[2px] bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
              Matriz Comparativa: Repuestos Originales OEM vs Aftermarket
            </h4>
            <p className="text-[11px] text-zinc-400 font-sans">
              Análisis empírico de durabilidad en horas, riesgo de parada técnica y costo operativo real por hora.
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-[2px] bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase shrink-0">
          Ahorro Real OEM: -{Math.round(((aftermarketCostPerHour - oemCostPerHour) / aftermarketCostPerHour) * 100)}% Costo/Hora
        </span>
      </div>

      {/* Component Selector Tabs */}
      <div className="flex gap-1.5 pt-3 pb-2 overflow-x-auto scrollbar-none">
        {COMPARISON_DATA.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              triggerHaptic('mechanicalClick');
              setSelectedCatId(item.id);
            }}
            className={`px-3 py-1.5 rounded-[2px] text-[10px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer border ${
              selectedCatId === item.id
                ? 'bg-amber-400 text-black border-amber-400 font-black shadow-xs'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* Main Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
        
        {/* OEM Column */}
        <div className="p-3.5 rounded-[3px] bg-zinc-900/80 border border-emerald-500/40 relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <span className="px-2 py-0.5 rounded-[2px] bg-emerald-500 text-black text-[9px] font-black uppercase tracking-wider">
              TMD OEM ORIGINAL
            </span>
          </div>

          <h5 className="text-xs font-black text-emerald-400 uppercase tracking-tight mb-2">
            {activeData.name} (Genuino)
          </h5>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
              <span className="text-zinc-400 text-[11px]">Precio Adquisición:</span>
              <span className="font-bold text-white font-mono">${activeData.oemPriceUsd} USD</span>
            </div>

            <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
              <span className="text-zinc-400 text-[11px]">Vida Útil Certificada:</span>
              <span className="font-bold text-emerald-400 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{activeData.oemHoursLife} Horas</span>
              </span>
            </div>

            <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
              <span className="text-zinc-400 text-[11px]">Costo Operativo Real:</span>
              <span className="font-black text-amber-400 text-sm font-mono">
                ${oemCostPerHour.toFixed(3)} USD / hora
              </span>
            </div>

            <div className="flex items-start justify-between gap-2 pb-1 border-b border-zinc-800">
              <span className="text-zinc-400 text-[11px] shrink-0">Riesgo de Parada:</span>
              <span className="text-right text-[10px] text-zinc-300 font-sans">
                {activeData.downtimeRiskOem}
              </span>
            </div>

            <div className="flex items-start justify-between gap-2">
              <span className="text-zinc-400 text-[11px] shrink-0">Garantía de Fábrica:</span>
              <span className="text-right text-[10px] text-emerald-400 font-bold font-sans">
                ✓ {activeData.warrantyOem}
              </span>
            </div>
          </div>
        </div>

        {/* Aftermarket Column */}
        <div className="p-3.5 rounded-[3px] bg-zinc-900/40 border border-zinc-800 relative">
          <div className="absolute top-2 right-2">
            <span className="px-2 py-0.5 rounded-[2px] bg-zinc-800 text-zinc-400 text-[9px] font-bold uppercase tracking-wider">
              GENÉRICO ALTERNATIVO
            </span>
          </div>

          <h5 className="text-xs font-black text-zinc-300 uppercase tracking-tight mb-2">
            Copia Genérica Comercial
          </h5>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
              <span className="text-zinc-400 text-[11px]">Precio Adquisición:</span>
              <span className="font-bold text-zinc-300 font-mono line-through text-zinc-500 mr-2">
                ${activeData.aftermarketPriceUsd} USD
              </span>
            </div>

            <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
              <span className="text-zinc-400 text-[11px]">Vida Útil Estimada:</span>
              <span className="font-bold text-rose-400 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{activeData.aftermarketHoursLife} Horas (-{Math.round((1 - activeData.aftermarketHoursLife / activeData.oemHoursLife) * 100)}%)</span>
              </span>
            </div>

            <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
              <span className="text-zinc-400 text-[11px]">Costo Operativo Real:</span>
              <span className="font-bold text-rose-400 text-sm font-mono">
                ${aftermarketCostPerHour.toFixed(3)} USD / hora
              </span>
            </div>

            <div className="flex items-start justify-between gap-2 pb-1 border-b border-zinc-800">
              <span className="text-zinc-400 text-[11px] shrink-0">Riesgo de Parada:</span>
              <span className="text-right text-[10px] text-rose-300 font-sans">
                {activeData.downtimeRiskAftermarket}
              </span>
            </div>

            <div className="flex items-start justify-between gap-2">
              <span className="text-zinc-400 text-[11px] shrink-0">Garantía:</span>
              <span className="text-right text-[10px] text-rose-400 font-sans">
                ✗ {activeData.warrantyAftermarket}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Technical Verdict Callout */}
      <div className="mt-3 p-3 rounded-[3px] bg-amber-400/10 border border-amber-400/30 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider block">
            Dictamen Técnico de Taller Km 22:
          </span>
          <p className="text-xs text-zinc-200 font-sans mt-0.5 leading-relaxed">
            {activeData.verdict}
          </p>
        </div>
      </div>

      {/* Fleet Simulator Slider */}
      <div className="mt-3 pt-3 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-xs">
        <div>
          <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">
            Tamaño de Flota ({fleetSize} Máquinas):
          </label>
          <input
            type="range"
            min="1"
            max="15"
            value={fleetSize}
            onChange={(e) => setFleetSize(parseInt(e.target.value))}
            className="w-full accent-amber-400 h-1 bg-zinc-800 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">
            Horas / Máquina al Año ({annualHours} h):
          </label>
          <input
            type="range"
            min="800"
            max="3000"
            step="100"
            value={annualHours}
            onChange={(e) => setAnnualHours(parseInt(e.target.value))}
            className="w-full accent-amber-400 h-1 bg-zinc-800 rounded-lg cursor-pointer"
          />
        </div>

        <div className="p-2 rounded-[2px] bg-zinc-900 border border-zinc-800 text-right">
          <span className="text-[9px] text-zinc-400 uppercase block font-bold">Ahorro Anual Proyectado (OEM):</span>
          <span className="text-base font-black text-emerald-400 font-mono">
            +${annualNetSavings.toLocaleString('en-US')} USD / año
          </span>
        </div>
      </div>

    </div>
  );
};
