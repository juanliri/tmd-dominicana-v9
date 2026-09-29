import React, { useState } from 'react';
import { 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  QrCode, 
  ShieldCheck, 
  Send, 
  Copy, 
  Check, 
  Search, 
  Filter, 
  MapPin, 
  User, 
  ExternalLink,
  ChevronRight,
  HardHat
} from 'lucide-react';

const getBayWhatsAppUrl = (bay: YardBay) => {
  const lines = [
    `🎟️ *TMD DOMINICANA | PASE DE SALIDA AUTORIZADO*`,
    `📍 *PATIO CENTRAL KM 22 - AUTOPISTA DUARTE*`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `✅ *CÓDIGO DE SALIDA:* \`${bay.gatePassCode}\``,
    `🚜 *Equipo:* ${bay.machineModel} (${bay.serial})`,
    `🏢 *Bahía:* ${bay.bayName}`,
    `🚚 *Transporte / Chofer:* ${bay.carrierDriver}`,
    `📍 *Destino:* ${bay.destination}`,
    `🔒 *Inspección PDI:* ${bay.pdiStatus}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `🔒 Autorizado por Gerencia de Patio Km 22 y Control de Salida.`
  ];
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(lines.join('\n'))}`;
};

export interface YardBay {
  id: string;
  bayName: string;
  machineModel: string;
  serial: string;
  status: 'ready_dispatch' | 'pdi_inspect' | 'available' | 'reserved' | 'rented';
  statusLabel: string;
  destination: string;
  pdiStatus: string;
  assignedTech: string;
  gatePassCode: string;
  gatePassAuthorized: boolean;
  balanceCleared: boolean;
  carrierDriver: string;
}

interface DispatchQueueProps {
  initialBays?: YardBay[];
  onToggleGatePass?: (bayId: string) => void;
}

const DEFAULT_YARD_BAYS: YardBay[] = [
  {
    id: 'BAY-A1',
    bayName: 'Bahía A-1 (Excavación)',
    machineModel: 'JCB 3CX Eco Backhoe Loader',
    serial: 'JCB3CX-DOM-8942',
    status: 'ready_dispatch',
    statusLabel: 'Lista para Despacho',
    destination: 'Proyecto Autovía Samaná / Constructora Rizek',
    pdiStatus: 'Aprobado 60/60 Puntos',
    assignedTech: 'Ing. Carlos Peña',
    gatePassCode: 'GP-2026-8812',
    gatePassAuthorized: true,
    balanceCleared: true,
    carrierDriver: 'Rafael Santana (Lowboy Furgón #04)'
  },
  {
    id: 'BAY-A2',
    bayName: 'Bahía A-2 (Tierras)',
    machineModel: 'LiuGong 922E HD Excavator',
    serial: 'LG922E-2025-1104',
    status: 'pdi_inspect',
    statusLabel: 'PDI en Inspección',
    destination: 'Cantera San Cristóbal / Áridos del Sur',
    pdiStatus: 'Calibración de Bomba Hidráulica (45/60)',
    assignedTech: 'Técnico Roberto Valdez',
    gatePassCode: 'GP-2026-8813',
    gatePassAuthorized: false,
    balanceCleared: false,
    carrierDriver: 'Pendiente Asignación'
  },
  {
    id: 'BAY-B1',
    bayName: 'Bahía B-1 (Agrícola)',
    machineModel: 'LS Tractor MT357 Hydro',
    serial: 'LSMT-DOM-5520',
    status: 'available',
    statusLabel: 'Disponible Showroom',
    destination: 'Sede Central Km 22 (Venta Inmediata)',
    pdiStatus: 'Inspección PDI Completa',
    assignedTech: 'Patio TMD',
    gatePassCode: 'GP-2026-8814',
    gatePassAuthorized: false,
    balanceCleared: true,
    carrierDriver: 'Showroom Km 22'
  },
  {
    id: 'BAY-B2',
    bayName: 'Bahía B-2 (Compactación)',
    machineModel: 'Ammann ARX 26-2 Roller',
    serial: 'AMM-ARX-2024-77',
    status: 'reserved',
    statusLabel: 'Reservada con Inicial (50%)',
    destination: 'Alcaldía Sto Dgo Norte / Obras Públicas',
    pdiStatus: 'Pendiente Traslado Lowboy',
    assignedTech: 'Ing. Marcos Díaz',
    gatePassCode: 'GP-2026-8815',
    gatePassAuthorized: true,
    balanceCleared: true,
    carrierDriver: 'Transporte Díaz & Asocs.'
  },
  {
    id: 'BAY-C1',
    bayName: 'Bahía C-1 (Minería)',
    machineModel: 'LiuGong 856H Wheel Loader',
    serial: 'LG856H-2024-991',
    status: 'rented',
    statusLabel: 'En Alquiler Activo',
    destination: 'Mina Pueblo Viejo / Barrick Subcontratista',
    pdiStatus: 'Supervisión LiveLink Activa (1,240 hrs)',
    assignedTech: 'Unidad Móvil 02',
    gatePassCode: 'GP-2026-8816',
    gatePassAuthorized: true,
    balanceCleared: true,
    carrierDriver: 'Transporte Pesado Cibao'
  }
];

export const DispatchQueue: React.FC<DispatchQueueProps> = ({
  initialBays = DEFAULT_YARD_BAYS,
  onToggleGatePass
}) => {
  const [bays, setBays] = useState<YardBay[]>(initialBays);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready_dispatch' | 'pdi_inspect' | 'reserved' | 'rented'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeQrModalBay, setActiveQrModalBay] = useState<YardBay | null>(null);

  const handleToggle = (bayId: string) => {
    if (onToggleGatePass) {
      onToggleGatePass(bayId);
    }
    setBays(prev => prev.map(b => {
      if (b.id === bayId) {
        const nextState = !b.gatePassAuthorized;
        return {
          ...b,
          gatePassAuthorized: nextState,
          status: nextState ? 'ready_dispatch' : 'pdi_inspect',
          statusLabel: nextState ? 'Pase de Salida Emitido' : 'PDI en Inspección'
        };
      }
      return b;
    }));
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredBays = bays.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (
        b.machineModel.toLowerCase().includes(term) ||
        b.serial.toLowerCase().includes(term) ||
        b.destination.toLowerCase().includes(term) ||
        b.carrierDriver.toLowerCase().includes(term) ||
        b.gatePassCode.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const authorizedCount = bays.filter(b => b.gatePassAuthorized).length;

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* 1. DISPATCH STATS HEADER */}
      <div className="p-4 sm:p-5 rounded-[5px] bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[3px] bg-amber-400 text-black flex items-center justify-center font-black shrink-0 shadow-sm">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white uppercase tracking-tight font-display">
                Patio Km 22 & Cola de Despacho de Maquinaria
              </h3>
              <span className="px-2 py-0.5 rounded-[2px] text-[9px] font-black uppercase bg-amber-400/20 text-amber-400 border border-amber-400/30">
                PDI & GATE PASS
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Control de bahías de preparación, inspección PDI 60 puntos y validación de cobro previo a salida de patio.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-right">
            <span className="text-[10px] text-zinc-500 uppercase block font-bold">Despachos Autorizados:</span>
            <span className="text-sm font-black text-amber-400">{authorizedCount} / {bays.length} Unidades</span>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & FILTER */}
      <div className="p-3 bg-zinc-900 rounded-[5px] border border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex-1 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por equipo, serie, chofer lowboy o proyecto destino..."
            className="w-full pl-9 pr-3 py-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-hidden focus:border-amber-400 font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-zinc-300 font-bold uppercase cursor-pointer text-xs"
          >
            <option value="all">TODOS LOS ESTADOS</option>
            <option value="ready_dispatch">LISTAS PARA DESPACHO</option>
            <option value="pdi_inspect">PDI EN INSPECCIÓN</option>
            <option value="reserved">RESERVADAS (ANTICIPO)</option>
            <option value="rented">EN ALQUILER ACTIVO</option>
          </select>
        </div>
      </div>

      {/* 3. YARD BAYS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch">
        {filteredBays.map((bay) => {
          const isReady = bay.gatePassAuthorized;

          return (
            <div
              key={bay.id}
              className={`p-4 rounded-[3px] border transition-all flex flex-col justify-between h-full gap-3 shadow-sm ${
                isReady
                  ? 'bg-zinc-900/90 border-emerald-500/40 hover:border-emerald-500/60'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="space-y-2.5">
                {/* Bay Header */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-[2px] border border-amber-400/20">
                    {bay.bayName}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-[2px] text-[10px] font-black uppercase flex items-center gap-1 ${
                      isReady
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {isReady ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    <span>{bay.statusLabel}</span>
                  </span>
                </div>

                {/* Machine Details */}
                <div>
                  <h4 className="font-black text-sm text-white font-sans uppercase">
                    {bay.machineModel}
                  </h4>
                  <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    Serie: <strong className="text-zinc-200">{bay.serial}</strong>
                  </p>
                </div>

                {/* Destination & Transport */}
                <div className="p-3 rounded-[2px] bg-zinc-950/80 border border-zinc-800/80 space-y-1.5 text-[11px]">
                  <div className="flex items-start gap-1.5 text-zinc-300">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span className="leading-tight font-sans">{bay.destination}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-zinc-400 pt-0.5">
                    <Truck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="font-sans truncate">Chofer: <strong className="text-zinc-200">{bay.carrierDriver}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5 text-zinc-400 pt-0.5">
                    <HardHat className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span>Técnico PDI: <strong className="text-zinc-300">{bay.assignedTech}</strong></span>
                  </div>
                </div>

                {/* PDI Check & Balance */}
                <div className="flex items-center justify-between text-[10px] pt-1">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{bay.pdiStatus}</span>
                  </span>

                  <span className={`font-bold ${bay.balanceCleared ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {bay.balanceCleared ? 'Saldo Liquidado' : 'Saldo Pendiente'}
                  </span>
                </div>
              </div>

              {/* Bay Bottom Actions */}
              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveQrModalBay(bay)}
                    className="p-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    title="Ver QR Pase de Salida"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyCode(bay.gatePassCode)}
                    className="px-2 py-1 rounded-[2px] bg-zinc-800 text-[10px] text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer font-mono font-bold"
                  >
                    {copiedCode === bay.gatePassCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{bay.gatePassCode}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={getBayWhatsAppUrl(bay)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-[2px] bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                    title="Enviar Pase por WhatsApp"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleToggle(bay.id)}
                    className={`px-2.5 py-1.5 rounded-[2px] text-[10px] font-black uppercase transition-all cursor-pointer ${
                      isReady
                        ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                        : 'bg-amber-400 text-black hover:bg-amber-300'
                    }`}
                  >
                    {isReady ? 'Autorizado' : 'Autorizar Salida'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* QR GATE PASS MODAL */}
      {activeQrModalBay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-950 border border-amber-500/40 rounded-[5px] p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-[2px] border border-amber-400/30">
                PATIO KM 22 • SEGURIDAD CENTRAL
              </span>
              <h3 className="text-base font-black text-white uppercase font-display pt-1 tracking-tight">
                Pase de Salida Oficial
              </h3>
              <p className="text-xs text-zinc-400 font-sans">
                {activeQrModalBay.machineModel} ({activeQrModalBay.serial})
              </p>
            </div>

            {/* Simulated QR Code SVG */}
            <div className="p-3 bg-white rounded-[3px] inline-block mx-auto border-2 border-amber-400/40">
              <svg className="w-32 h-32 mx-auto text-zinc-950" viewBox="0 0 100 100" fill="currentColor">
                <rect x="5" y="5" width="26" height="26" rx="2" />
                <rect x="9" y="9" width="18" height="18" fill="white" />
                <rect x="13" y="13" width="10" height="10" />
                <rect x="69" y="5" width="26" height="26" rx="2" />
                <rect x="73" y="9" width="18" height="18" fill="white" />
                <rect x="77" y="13" width="10" height="10" />
                <rect x="5" y="69" width="26" height="26" rx="2" />
                <rect x="9" y="73" width="18" height="18" fill="white" />
                <rect x="13" y="77" width="10" height="10" />
                <rect x="38" y="38" width="24" height="24" fill="#f59e0b" />
                <rect x="44" y="44" width="12" height="12" fill="white" />
              </svg>
              <span className="text-[10px] font-mono text-zinc-600 font-black block mt-1">
                {activeQrModalBay.gatePassCode}
              </span>
            </div>

            <div className="p-3 rounded-[3px] bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-500">Destino:</span>
                <span className="font-bold text-white truncate max-w-[180px]">{activeQrModalBay.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Transporte:</span>
                <span className="font-bold text-white">{activeQrModalBay.carrierDriver}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveQrModalBay(null)}
              className="w-full py-2.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase cursor-pointer text-xs"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
