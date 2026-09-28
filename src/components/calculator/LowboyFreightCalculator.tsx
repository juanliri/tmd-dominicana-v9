import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  Send, 
  FileText, 
  ExternalLink,
  Info,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { USD_TO_DOP_RATE } from '../../data/catalog';
import { triggerHaptic } from '../../utils/haptics';

export interface DominicanProvinceRoute {
  id: string;
  name: string;
  region: 'Norte / Cibao' | 'Sur' | 'Este' | 'Gran Santo Domingo';
  distanceKmFromKm22: number;
  tollStationsCount: number;
  estimatedTransitHours: number;
  requiresSpecialMopcEscortDefault?: boolean;
}

export const DOMINICAN_PROVINCES_ROUTES: DominicanProvinceRoute[] = [
  // Gran Santo Domingo & Alrededores
  { id: 'sd-dn', name: 'Santo Domingo & Distrito Nacional', region: 'Gran Santo Domingo', distanceKmFromKm22: 24, tollStationsCount: 1, estimatedTransitHours: 1.0 },
  { id: 'sd-este', name: 'Santo Domingo Este / San Isidro / Boca Chica', region: 'Gran Santo Domingo', distanceKmFromKm22: 45, tollStationsCount: 2, estimatedTransitHours: 1.5 },
  { id: 'sd-norte', name: 'Santo Domingo Norte / Villa Mella', region: 'Gran Santo Domingo', distanceKmFromKm22: 28, tollStationsCount: 1, estimatedTransitHours: 1.2 },
  { id: 'sc-haina', name: 'San Cristóbal / Bajos de Haina / Nigua', region: 'Sur', distanceKmFromKm22: 36, tollStationsCount: 1, estimatedTransitHours: 1.3 },
  { id: 'monte-plata', name: 'Monte Plata / Bayaguana / Yamasá', region: 'Gran Santo Domingo', distanceKmFromKm22: 62, tollStationsCount: 1, estimatedTransitHours: 1.8 },

  // Región Norte / Cibao (Autopista Duarte Corridor)
  { id: 'bonao', name: 'Monseñor Nouel (Bonao / Piedra Blanca)', region: 'Norte / Cibao', distanceKmFromKm22: 68, tollStationsCount: 1, estimatedTransitHours: 1.5 },
  { id: 'la-vega', name: 'La Vega (Concepción / Jarabacoa)', region: 'Norte / Cibao', distanceKmFromKm22: 108, tollStationsCount: 2, estimatedTransitHours: 2.2 },
  { id: 'cotui', name: 'Sánchez Ramírez (Cotuí / Pueblo Viejo Minera)', region: 'Norte / Cibao', distanceKmFromKm22: 95, tollStationsCount: 2, estimatedTransitHours: 2.0 },
  { id: 'santiago', name: 'Santiago de los Caballeros (Licey / Tamboril)', region: 'Norte / Cibao', distanceKmFromKm22: 145, tollStationsCount: 2, estimatedTransitHours: 2.8 },
  { id: 'sfm', name: 'Duarte (San Francisco de Macorís)', region: 'Norte / Cibao', distanceKmFromKm22: 128, tollStationsCount: 2, estimatedTransitHours: 2.5 },
  { id: 'espaillat', name: 'Espaillat (Moca / Gaspar Hernández)', region: 'Norte / Cibao', distanceKmFromKm22: 158, tollStationsCount: 2, estimatedTransitHours: 3.0 },
  { id: 'puerto-plata', name: 'Puerto Plata (Sosúa / Cabarete / Luperón)', region: 'Norte / Cibao', distanceKmFromKm22: 198, tollStationsCount: 3, estimatedTransitHours: 3.8 },
  { id: 'valverde', name: 'Valverde (Mao / Esperanza)', region: 'Norte / Cibao', distanceKmFromKm22: 192, tollStationsCount: 2, estimatedTransitHours: 3.6 },
  { id: 'montecristi', name: 'Montecristi / Pepillo Salcedo (Manzanillo)', region: 'Norte / Cibao', distanceKmFromKm22: 275, tollStationsCount: 3, estimatedTransitHours: 5.0 },
  { id: 'samana', name: 'Samaná (Santa Bárbara / Las Terrenas)', region: 'Norte / Cibao', distanceKmFromKm22: 168, tollStationsCount: 3, estimatedTransitHours: 3.2 },

  // Región Este (Autopista Las Américas & Autovía del Este)
  { id: 'spm', name: 'San Pedro de Macorís / Guayacanes', region: 'Este', distanceKmFromKm22: 88, tollStationsCount: 2, estimatedTransitHours: 1.8 },
  { id: 'la-romana', name: 'La Romana / Casa de Campo / Bayahíbe', region: 'Este', distanceKmFromKm22: 132, tollStationsCount: 2, estimatedTransitHours: 2.4 },
  { id: 'punta-cana', name: 'La Altagracia (Punta Cana / Bávaro / Higüey)', region: 'Este', distanceKmFromKm22: 195, tollStationsCount: 3, estimatedTransitHours: 3.5 },
  { id: 'el-seibo', name: 'El Seibo / Miches', region: 'Este', distanceKmFromKm22: 165, tollStationsCount: 2, estimatedTransitHours: 3.2 },
  { id: 'hato-mayor', name: 'Hato Mayor del Rey / Sabana de la Mar', region: 'Este', distanceKmFromKm22: 122, tollStationsCount: 2, estimatedTransitHours: 2.4 },

  // Región Sur (Carretera Sánchez & Circunvalación Baní/Azua)
  { id: 'bani', name: 'Peravia (Baní / Matanzas / Salinas)', region: 'Sur', distanceKmFromKm22: 78, tollStationsCount: 1, estimatedTransitHours: 1.6 },
  { id: 'azua', name: 'Azua de Compostela (Peralta / Estebanía)', region: 'Sur', distanceKmFromKm22: 135, tollStationsCount: 1, estimatedTransitHours: 2.5 },
  { id: 'san-juan', name: 'San Juan de la Maguana / Las Matas', region: 'Sur', distanceKmFromKm22: 215, tollStationsCount: 1, estimatedTransitHours: 3.8 },
  { id: 'barahona', name: 'Barahona / Bahía de Neiba / Enriquillo', region: 'Sur', distanceKmFromKm22: 208, tollStationsCount: 1, estimatedTransitHours: 3.6 },
  { id: 'pedernales', name: 'Pedernales / Proyecto Turístico Cabo Rojo', region: 'Sur', distanceKmFromKm22: 325, tollStationsCount: 1, estimatedTransitHours: 5.5, requiresSpecialMopcEscortDefault: true }
];

export interface LowboyFreightCalculatorProps {
  initialWeightKg?: number;
  initialMachineName?: string;
  initialCategory?: string;
  onSelectRoute?: (route: DominicanProvinceRoute, totalUsd: number) => void;
}

export const LowboyFreightCalculator: React.FC<LowboyFreightCalculatorProps> = ({
  initialWeightKg = 16000,
  initialMachineName = 'Maquinaria TMD',
  initialCategory = 'Excavadora / Retroexcavadora',
  onSelectRoute
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>('santiago');
  const [weightTier, setWeightTier] = useState<'light' | 'medium' | 'heavy'>(() => {
    if (initialWeightKg > 20000) return 'heavy';
    if (initialWeightKg < 8000) return 'light';
    return 'medium';
  });
  const [includeReturnTrip, setIncludeReturnTrip] = useState<boolean>(false);
  const [needMopcEscort, setNeedMopcEscort] = useState<boolean>(initialWeightKg > 22000);

  const route = DOMINICAN_PROVINCES_ROUTES.find(r => r.id === selectedRouteId) || DOMINICAN_PROVINCES_ROUTES[0];

  // Pricing Model (Based on Dominican Heavy Haulage Market Rates):
  // Light (Mini, <8T): Lowboy 2 ejes -> Base $220 + $2.80/km
  // Medium (8T-20T): Lowboy 3 ejes -> Base $380 + $3.90/km
  // Heavy (>20T): Lowboy 4 ejes cuello de ganso -> Base $550 + $5.40/km
  const getRates = () => {
    switch (weightTier) {
      case 'light':
        return { baseUsd: 220, perKmUsd: 2.80, lowboyType: 'Cama Baja 2 Ejes (Hasta 8T)' };
      case 'heavy':
        return { baseUsd: 550, perKmUsd: 5.40, lowboyType: 'Cama Baja Cuello de Ganso 4 Ejes (20T - 45T)' };
      default:
        return { baseUsd: 380, perKmUsd: 3.90, lowboyType: 'Cama Baja Estándar 3 Ejes (8T - 20T)' };
    }
  };

  const rates = getRates();
  const effectiveDistanceKm = includeReturnTrip ? route.distanceKmFromKm22 * 2 : route.distanceKmFromKm22;
  const mileageCostUsd = effectiveDistanceKm * rates.perKmUsd;
  const baseCostUsd = rates.baseUsd;
  const tollsCostUsd = route.tollStationsCount * (includeReturnTrip ? 2 : 1) * 12; // Approx USD$12 per heavy axle toll
  const escortCostUsd = needMopcEscort ? 180 : 0; // Pilot escort car & MOPC oversized authorization

  const totalFreightUsd = Math.round(baseCostUsd + mileageCostUsd + tollsCostUsd + escortCostUsd);
  const totalFreightDop = Math.round(totalFreightUsd * USD_TO_DOP_RATE);

  const handleWhatsAppDispatch = () => {
    triggerHaptic('success');
    const msg = encodeURIComponent(
      `🚜 *COTIZACIÓN DE TRANSPORTE CAMA BAJA (LOWBOY) TMD*\n\n` +
      `*Equipo:* ${initialMachineName} (${initialCategory})\n` +
      `*Tipo de Unidad:* ${rates.lowboyType}\n` +
      `*Origen:* Km 22 Autopista Duarte, Pedro Brand, RD\n` +
      `*Destino Obra:* ${route.name} (${route.region})\n` +
      `*Distancia:* ${route.distanceKmFromKm22} km (Tiempo est: ${route.estimatedTransitHours} hrs)\n` +
      `*Modalidad:* ${includeReturnTrip ? 'Ida y Retorno' : 'Solo Ida'}\n` +
      `*Escolta de Seguridad:* ${needMopcEscort ? 'Sí (Incluida)' : 'No requerida'}\n` +
      `*Total Flete Estimado:* US$${totalFreightUsd.toLocaleString()} (RD$${totalFreightDop.toLocaleString()})\n\n` +
      `_Solicito confirmación de disponibilidad de chofer y rampa para despacho inmediato._`
    );
    window.open(`https://wa.me/18297628000?text=${msg}`, '_blank');
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-[4px] p-4 sm:p-5 font-mono text-white space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[2px] bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 font-display">
              COTIZADOR DE FLETES CAMA BAJA (LOWBOY PROVINCIAL)
            </h4>
            <p className="text-[10px] text-zinc-400">
              Despacho oficial con rampa hidráulica desde Patio Central Km 22 Autopista Duarte hacia cualquier provincia de RD.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-[2px] border border-amber-500/20 self-start sm:self-auto">
          MOPC & DIGESETT CERTIFICADO
        </span>
      </div>

      {/* Grid Configuration Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
            Provincia / Proyecto Destino:
          </label>
          <select
            value={selectedRouteId}
            onChange={(e) => {
              triggerHaptic('selection');
              setSelectedRouteId(e.target.value);
            }}
            className="w-full text-xs font-bold p-2.5 rounded-[2px] border border-zinc-800 bg-zinc-900 text-white focus:outline-none focus:border-amber-400"
          >
            {DOMINICAN_PROVINCES_ROUTES.map(r => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.distanceKmFromKm22} km • {r.region})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
            Tipo de Cama Baja por Tonelaje:
          </label>
          <select
            value={weightTier}
            onChange={(e) => {
              triggerHaptic('selection');
              setWeightTier(e.target.value as any);
            }}
            className="w-full text-xs font-bold p-2.5 rounded-[2px] border border-zinc-800 bg-zinc-900 text-white focus:outline-none focus:border-amber-400"
          >
            <option value="light">Cama Baja 2 Ejes (&lt; 8 Toneladas)</option>
            <option value="medium">Cama Baja 3 Ejes (8T - 20 Toneladas)</option>
            <option value="heavy">Cuello de Ganso 4 Ejes (20T - 45T)</option>
          </select>
        </div>

        <div className="flex flex-col justify-between">
          <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
            Opciones de Trayecto:
          </label>
          <div className="flex items-center gap-2 pt-1">
            <label className="flex items-center gap-1.5 text-[11px] text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeReturnTrip}
                onChange={(e) => {
                  triggerHaptic('light');
                  setIncludeReturnTrip(e.target.checked);
                }}
                className="rounded accent-amber-400 cursor-pointer"
              />
              <span>Ida y Vuelta (Retorno)</span>
            </label>

            <label className="flex items-center gap-1.5 text-[11px] text-zinc-300 cursor-pointer ml-2">
              <input
                type="checkbox"
                checked={needMopcEscort}
                onChange={(e) => {
                  triggerHaptic('light');
                  setNeedMopcEscort(e.target.checked);
                }}
                className="rounded accent-amber-400 cursor-pointer"
              />
              <span>Escolta MOPC</span>
            </label>
          </div>
        </div>
      </div>

      {/* Transit Logistics HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-[3px] bg-zinc-900 border border-zinc-800/80 text-[11px]">
        <div>
          <span className="text-zinc-500 uppercase text-[9px] block">Distancia Km 22:</span>
          <span className="font-bold text-white text-xs">{route.distanceKmFromKm22} km {includeReturnTrip ? `(${route.distanceKmFromKm22 * 2} km total)` : ''}</span>
        </div>
        <div>
          <span className="text-zinc-500 uppercase text-[9px] block">Tiempo en Ruta:</span>
          <span className="font-bold text-amber-400 text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {route.estimatedTransitHours} horas est.
          </span>
        </div>
        <div>
          <span className="text-zinc-500 uppercase text-[9px] block">Estaciones de Peaje:</span>
          <span className="font-bold text-white text-xs">{route.tollStationsCount} {includeReturnTrip ? 'x2 pasos' : 'estaciones'}</span>
        </div>
        <div>
          <span className="text-zinc-500 uppercase text-[9px] block">Rampa / Aseguramiento:</span>
          <span className="font-bold text-emerald-400 text-xs">Cadenas Grado 100</span>
        </div>
      </div>

      {/* Financial Summary & Dispatch WhatsApp Button */}
      <div className="p-3.5 rounded-[3px] bg-zinc-900/90 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[10px] text-zinc-400 uppercase font-bold">
            Tarifa Total de Transporte Estimada:
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
              US$ {totalFreightUsd.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-zinc-300 font-mono">
              (RD$ {totalFreightDop.toLocaleString()})
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 block mt-0.5">
            Incluye combustible diésel, chofer certificado, peajes y póliza de carga en tránsito.
          </span>
        </div>

        <button
          type="button"
          onClick={handleWhatsAppDispatch}
          className="px-4 py-2.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Solicitar Cama Baja WhatsApp</span>
        </button>
      </div>
    </div>
  );
};
