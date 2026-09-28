import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  ShieldCheck,
  AlertCircle,
  Clock,
  DollarSign,
  Download,
  X,
  CheckCircle2,
  Navigation,
  Compass,
  FileText
} from 'lucide-react';

interface DominicanProvinceFreight {
  id: string;
  name: string;
  region: 'Norte / Cibao' | 'Este' | 'Sur' | 'Gran Santo Domingo';
  distanceKmFromKm22: number;
  tollBoothsCount: number;
  transitHoursEst: number;
  baseRateUsd20Ton: number;
}

const PROVINCES_DATA: DominicanProvinceFreight[] = [
  { id: 'dn', name: 'Distrito Nacional / Santo Domingo', region: 'Gran Santo Domingo', distanceKmFromKm22: 24, tollBoothsCount: 0, transitHoursEst: 1.5, baseRateUsd20Ton: 350 },
  { id: 'sc', name: 'San Cristóbal / Haina', region: 'Sur', distanceKmFromKm22: 38, tollBoothsCount: 1, transitHoursEst: 1.5, baseRateUsd20Ton: 450 },
  { id: 'stgo', name: 'Santiago de los Caballeros', region: 'Norte / Cibao', distanceKmFromKm22: 135, tollBoothsCount: 2, transitHoursEst: 3.5, baseRateUsd20Ton: 850 },
  { id: 'lv', name: 'La Vega / Bonao', region: 'Norte / Cibao', distanceKmFromKm22: 95, tollBoothsCount: 1, transitHoursEst: 2.5, baseRateUsd20Ton: 650 },
  { id: 'pp', name: 'Puerto Plata', region: 'Norte / Cibao', distanceKmFromKm22: 198, tollBoothsCount: 2, transitHoursEst: 4.5, baseRateUsd20Ton: 1100 },
  { id: 'spm', name: 'San Pedro de Macorís', region: 'Este', distanceKmFromKm22: 98, tollBoothsCount: 3, transitHoursEst: 2.5, baseRateUsd20Ton: 700 },
  { id: 'lr', name: 'La Romana / Casa de Campo', region: 'Este', distanceKmFromKm22: 135, tollBoothsCount: 4, transitHoursEst: 3.0, baseRateUsd20Ton: 900 },
  { id: 'alt', name: 'La Altagracia (Punta Cana / Bávaro)', region: 'Este', distanceKmFromKm22: 215, tollBoothsCount: 5, transitHoursEst: 4.5, baseRateUsd20Ton: 1250 },
  { id: 'az', name: 'Azua / Baní', region: 'Sur', distanceKmFromKm22: 115, tollBoothsCount: 2, transitHoursEst: 3.0, baseRateUsd20Ton: 780 },
  { id: 'bar', name: 'Barahona (Zona Minera)', region: 'Sur', distanceKmFromKm22: 195, tollBoothsCount: 2, transitHoursEst: 4.5, baseRateUsd20Ton: 1200 },
  { id: 'sam', name: 'Samaná / Las Terrenas', region: 'Norte / Cibao', distanceKmFromKm22: 175, tollBoothsCount: 4, transitHoursEst: 4.0, baseRateUsd20Ton: 1150 },
  { id: 'mc', name: 'Montecristi / Dajabón (Frontera)', region: 'Norte / Cibao', distanceKmFromKm22: 260, tollBoothsCount: 2, transitHoursEst: 6.0, baseRateUsd20Ton: 1550 },
  { id: 'ped', name: 'Pedernales (Proyecto Cabo Rojo)', region: 'Sur', distanceKmFromKm22: 320, tollBoothsCount: 2, transitHoursEst: 7.5, baseRateUsd20Ton: 1850 }
];

interface LowboyFreightCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineName?: string;
  machineWeightTon?: number;
  exchangeRate?: number;
  onApplyFreight?: (freightUsd: number, destinationName: string) => void;
}

export const LowboyFreightCalculatorModal: React.FC<LowboyFreightCalculatorModalProps> = ({
  isOpen,
  onClose,
  machineName = 'LiuGong 922E HD (22 Toneladas)',
  machineWeightTon = 22,
  exchangeRate = 60.0,
  onApplyFreight
}) => {
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('stgo');
  const [includeEscortVehicle, setIncludeEscortVehicle] = useState<boolean>(machineWeightTon > 25);
  const [includeMopcPermit, setIncludeMopcPermit] = useState<boolean>(true);
  const [unloadingCraneAssistance, setUnloadingCraneAssistance] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentProvince = PROVINCES_DATA.find(p => p.id === selectedProvinceId) || PROVINCES_DATA[2];

  // Weight Multiplier
  const weightMultiplier = machineWeightTon <= 12 ? 0.8 : machineWeightTon <= 25 ? 1.0 : 1.35;
  
  // Base Lowboy Cost
  const baseFreightUsd = Math.round(currentProvince.baseRateUsd20Ton * weightMultiplier);
  
  // Toll Fees (RD$ 100-300 per booth roundtrip for heavy trucks)
  const tollsCostUsd = Math.round((currentProvince.tollBoothsCount * 600) / exchangeRate);

  // Escort truck (RD$ 12,000 / ~US$ 200)
  const escortCostUsd = includeEscortVehicle ? 200 : 0;

  // MOPC Over-dimension permit (US$ 75)
  const mopcPermitUsd = includeMopcPermit ? 75 : 0;

  // Unloading crane assistance (US$ 250)
  const craneCostUsd = unloadingCraneAssistance ? 250 : 0;

  const totalFreightUsd = baseFreightUsd + tollsCostUsd + escortCostUsd + mopcPermitUsd + craneCostUsd;
  const totalFreightDop = Math.round(totalFreightUsd * exchangeRate);

  const handleApply = () => {
    if (onApplyFreight) {
      onApplyFreight(totalFreightUsd, currentProvince.name);
    }
    onClose();
  };

  const handleExportRouteDoc = () => {
    const doc = `=================================================================\n` +
      `TECNOMAQUINARIAS DIESEL S.R.L. — HOJA DE RUTA LOGÍSTICA\n` +
      `TRANSPORTE ESPECIALIZADO EN CAMA BAJA (LOWBOY)\n` +
      `=================================================================\n\n` +
      `ORIGEN: Sede Central Km 22, Autopista Duarte, Sto Dgo Oeste\n` +
      `DESTINO: ${currentProvince.name} (${currentProvince.region})\n` +
      `EQUIPO: ${machineName} | Peso: ${machineWeightTon} Toneladas\n` +
      `DISTANCIA: ${currentProvince.distanceKmFromKm22} km\n` +
      `TIEMPO ESTIMADO EN RUTA: ${currentProvince.transitHoursEst} Horas\n` +
      `PEAJES RD VIAL EN RUTA: ${currentProvince.tollBoothsCount} Estaciones\n` +
      `CAMIÓN ESCOLTA DE SEGURIDAD: ${includeEscortVehicle ? 'SÍ (Obligatorio)' : 'NO REQUERIDO'}\n` +
      `PERMISO SOBREDIMENSIONADO MOPC: ${includeMopcPermit ? 'SÍ (Válido)' : 'NO'}\n\n` +
      `DESGLOSE DE COSTOS LOGÍSTICOS:\n` +
      `- Flete Base Cama Baja: US$ ${baseFreightUsd.toLocaleString()}\n` +
      `- Peajes RD Vial Estimados: US$ ${tollsCostUsd.toLocaleString()}\n` +
      `- Vehículo Escolta con Estrobos: US$ ${escortCostUsd.toLocaleString()}\n` +
      `- Permiso de Tránsito MOPC: US$ ${mopcPermitUsd.toLocaleString()}\n` +
      `- Asistencia Grúa Descarga: US$ ${craneCostUsd.toLocaleString()}\n` +
      `-----------------------------------------------------------------\n` +
      `TOTAL FLETE LOGÍSTICO: US$ ${totalFreightUsd.toLocaleString()} (RD$ ${totalFreightDop.toLocaleString()})\n` +
      `=================================================================\n` +
      `COORDINACIÓN 24/7 PATIO KM 22: (809) 560-1234 | logistica@tmd.do\n`;

    const blob = new Blob([doc], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TMD_HOJA_RUTA_FLETE_${currentProvince.id.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl text-zinc-200 overflow-hidden font-mono"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[3px] bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-amber-400 text-black uppercase tracking-wider">
                  LOGÍSTICA NACIONAL TMD
                </span>
                <span className="text-xs text-zinc-400 font-sans">
                  Transporte en Cama Baja a Nivel Nacional
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-white mt-0.5">
                Cotizador de Flete en Cama Baja (Lowboy)
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Machine & Origin Bar */}
        <div className="p-3.5 bg-zinc-900/40 border-b border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs shrink-0">
          <div>
            <span className="text-zinc-500 text-[10px] block">PUNTO DE SALIDA:</span>
            <span className="text-amber-400 font-bold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" /> Sede Central Km 22, Autopista Duarte
            </span>
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] block">EQUIPO A TRANSPORTAR:</span>
            <span className="text-white font-bold">{machineName}</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {/* Destination Province Selector */}
          <div className="space-y-1.5">
            <label className="block text-zinc-300 font-bold uppercase text-[11px]">
              Seleccione Provincia o Destino en Obra:
            </label>
            <select
              value={selectedProvinceId}
              onChange={e => setSelectedProvinceId(e.target.value)}
              className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-[2px] text-white text-xs font-mono font-bold focus:outline-none focus:border-amber-400"
            >
              {PROVINCES_DATA.map(prov => (
                <option key={prov.id} value={prov.id}>
                  {prov.name} ({prov.region}) — {prov.distanceKmFromKm22} km / ~{prov.transitHoursEst}h
                </option>
              ))}
            </select>
          </div>

          {/* Route Details Card */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-zinc-900 border border-zinc-800 rounded-[3px] text-center">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">DISTANCIA IDA:</span>
              <span className="text-base font-black text-white font-mono">{currentProvince.distanceKmFromKm22} km</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">TIEMPO ESTIMADO:</span>
              <span className="text-base font-black text-amber-400 font-mono">{currentProvince.transitHoursEst} Horas</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">PEAJES RD VIAL:</span>
              <span className="text-base font-black text-cyan-400 font-mono">{currentProvince.tollBoothsCount} Casetas</span>
            </div>
          </div>

          {/* Special Logistics Checkboxes */}
          <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-[3px] space-y-3">
            <span className="text-[10px] text-zinc-400 uppercase font-mono font-bold block">
              Servicios Logísticos Especiales & Seguridad MOPC:
            </span>

            <label className="flex items-center gap-2.5 cursor-pointer text-zinc-300 select-none">
              <input
                type="checkbox"
                checked={includeMopcPermit}
                onChange={e => setIncludeMopcPermit(e.target.checked)}
                className="w-4 h-4 rounded-[2px] bg-zinc-950 border-zinc-700 text-amber-400 focus:ring-0"
              />
              <div>
                <span className="font-bold">Permiso de Carga Sobredimensionada MOPC (+US$ 75)</span>
                <span className="text-[10px] text-zinc-500 block font-sans">
                  Gestión y autorización ministerial para circular por autopistas nacionales.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-zinc-300 select-none">
              <input
                type="checkbox"
                checked={includeEscortVehicle}
                onChange={e => setIncludeEscortVehicle(e.target.checked)}
                className="w-4 h-4 rounded-[2px] bg-zinc-950 border-zinc-700 text-amber-400 focus:ring-0"
              />
              <div>
                <span className="font-bold">Vehículo Escolta de Seguridad con Banderas & Estrobos (+US$ 200)</span>
                <span className="text-[10px] text-zinc-500 block font-sans">
                  Camioneta guía delantera requerida por ley para equipos de más de 25 toneladas o 3.0m de ancho.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-zinc-300 select-none">
              <input
                type="checkbox"
                checked={unloadingCraneAssistance}
                onChange={e => setUnloadingCraneAssistance(e.target.checked)}
                className="w-4 h-4 rounded-[2px] bg-zinc-950 border-zinc-700 text-amber-400 focus:ring-0"
              />
              <div>
                <span className="font-bold">Asistencia de Grúa Telescópica para Descarga (+US$ 250)</span>
                <span className="text-[10px] text-zinc-500 block font-sans">
                  Recomendado para implementos pesados o si la obra no cuenta con rampa de tierra.
                </span>
              </div>
            </label>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] p-3.5 space-y-2">
            <div className="flex justify-between text-zinc-400">
              <span>Flete Cama Baja ({machineWeightTon} Ton):</span>
              <span className="text-white font-bold">US$ {baseFreightUsd.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Peajes RD Vial ({currentProvince.tollBoothsCount} Casetas):</span>
              <span className="text-white font-bold">US$ {tollsCostUsd.toLocaleString()}</span>
            </div>
            {includeMopcPermit && (
              <div className="flex justify-between text-zinc-400">
                <span>Permiso MOPC Carga Ancha:</span>
                <span className="text-white font-bold">US$ {mopcPermitUsd}</span>
              </div>
            )}
            {includeEscortVehicle && (
              <div className="flex justify-between text-zinc-400">
                <span>Camión Escolta con Señalización:</span>
                <span className="text-white font-bold">US$ {escortCostUsd}</span>
              </div>
            )}
            {unloadingCraneAssistance && (
              <div className="flex justify-between text-zinc-400">
                <span>Grúa Asistencial en Destino:</span>
                <span className="text-white font-bold">US$ {craneCostUsd}</span>
              </div>
            )}

            <div className="pt-2 border-t border-zinc-800 flex justify-between items-baseline">
              <span className="text-xs font-black uppercase text-white">TOTAL FLETE LOGÍSTICO:</span>
              <div className="text-right">
                <span className="text-lg font-black text-amber-400 block">
                  US$ {totalFreightUsd.toLocaleString()}
                </span>
                <span className="text-[11px] text-zinc-500 font-sans">
                  ≈ RD$ {totalFreightDop.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs">
          <button
            type="button"
            onClick={handleExportRouteDoc}
            className="w-full sm:w-auto px-3 py-2 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 flex items-center justify-center gap-1.5 uppercase font-bold text-[11px] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Descargar Hoja de Ruta</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-3 py-2 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs uppercase cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 sm:flex-none px-4 py-2 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Aplicar Flete a Cotización</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
