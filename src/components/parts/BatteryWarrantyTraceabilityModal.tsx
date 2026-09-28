import React, { useState } from 'react';
import { 
  Battery, 
  BatteryCharging, 
  Zap, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  X, 
  FileText, 
  RefreshCw, 
  Check, 
  Gauge,
  Plus
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface BatteryWarrantyTraceabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineSerial?: string;
}

interface BatteryRecord {
  id: string;
  brand: string;
  model: string;
  serialNumber: string;
  batchCode: string;
  voltage: string;
  ccaNominal: number;
  ccaTested: number;
  healthStatus: 'OPTIMA' | 'DEGRADADA' | 'RECLAMO EN PROCESO';
  installedDate: string;
  warrantyExpiry: string;
  warrantyMonths: number;
  machineAssigned: string;
}

const INITIAL_BATTERIES: BatteryRecord[] = [
  {
    id: 'BAT-2025-01',
    brand: 'TMD Heavy Duty',
    model: 'HD-Group 31 Commercial 1000CCA',
    serialNumber: 'TMD-B31-984210',
    batchCode: 'LOTE-Q3-2025-SD',
    voltage: '12V (2x Serie = 24V)',
    ccaNominal: 1000,
    ccaTested: 965,
    healthStatus: 'OPTIMA',
    installedDate: '12/08/2025',
    warrantyExpiry: '12/08/2027',
    warrantyMonths: 24,
    machineAssigned: 'LG-2022-849 (LiuGong 922E)'
  },
  {
    id: 'BAT-2024-88',
    brand: 'Trojan Deep Cycle',
    model: 'Overdrive AGM 31',
    serialNumber: 'TRJ-AGM-44102',
    batchCode: 'LOTE-Q1-2024-USA',
    voltage: '12V',
    ccaNominal: 925,
    ccaTested: 680,
    healthStatus: 'DEGRADADA',
    installedDate: '10/02/2024',
    warrantyExpiry: '10/02/2026',
    warrantyMonths: 24,
    machineAssigned: 'JCB-3CX-190'
  },
  {
    id: 'BAT-2026-03',
    brand: 'Optima RedTop',
    model: 'SpiralCell 34/78',
    serialNumber: 'OPT-RT-88471',
    batchCode: 'LOTE-Q1-2026-MX',
    voltage: '12V',
    ccaNominal: 800,
    ccaTested: 790,
    healthStatus: 'OPTIMA',
    installedDate: '05/01/2026',
    warrantyExpiry: '05/01/2028',
    warrantyMonths: 24,
    machineAssigned: 'LG-856H-302'
  }
];

export const BatteryWarrantyTraceabilityModal: React.FC<BatteryWarrantyTraceabilityModalProps> = ({
  isOpen,
  onClose,
  machineSerial = 'LG-2022-849'
}) => {
  const [batteries, setBatteries] = useState<BatteryRecord[]>(INITIAL_BATTERIES);
  const [selectedBattery, setSelectedBattery] = useState<BatteryRecord>(INITIAL_BATTERIES[0]);
  const [claimSent, setClaimSent] = useState(false);

  if (!isOpen) return null;

  const handleInitiateClaim = () => {
    triggerHaptic('heavy');
    setClaimSent(true);
    setBatteries(prev => prev.map(b => b.id === selectedBattery.id ? { ...b, healthStatus: 'RECLAMO EN PROCESO' } : b));
    setTimeout(() => {
      setClaimSent(false);
    }, 2500);
  };

  const healthPercent = Math.round((selectedBattery.ccaTested / selectedBattery.ccaNominal) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-700 rounded-[5px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[2px] bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Battery className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white font-display uppercase tracking-wide">
                  Trazabilidad & Garantía de Baterías e Inversores
                </h3>
                <span className="px-2 py-0.5 rounded-[2px] bg-amber-500/10 text-amber-400 text-[10px] font-mono font-bold border border-amber-500/30">
                  Control de Lote & Conductancia CCA
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Seguimiento de número de serie, curva de degradación y reemplazo express 24h
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-1 text-zinc-400 hover:text-white rounded-[2px] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto font-sans">
          {/* Battery List (5 cols) */}
          <div className="md:col-span-5 space-y-2.5">
            <h4 className="text-xs font-bold text-zinc-400 font-display uppercase tracking-wider">
              Baterías Registradas en Flota
            </h4>

            <div className="space-y-2">
              {batteries.map((bat) => (
                <div
                  key={bat.id}
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedBattery(bat);
                  }}
                  className={`p-3 rounded-[3px] border transition-all cursor-pointer ${
                    selectedBattery.id === bat.id
                      ? 'bg-zinc-800/80 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                      : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">{bat.brand}</span>
                      <span className="text-[11px] text-zinc-400 font-mono">{bat.model}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-bold border ${
                      bat.healthStatus === 'OPTIMA'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : bat.healthStatus === 'DEGRADADA'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    }`}>
                      {bat.healthStatus}
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-zinc-800/70 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>S/N: {bat.serialNumber}</span>
                    <span className="text-amber-400 font-bold">{bat.ccaTested} CCA</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Battery Details (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-[3px] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white font-display uppercase">
                    {selectedBattery.brand} — {selectedBattery.model}
                  </h4>
                  <span className="text-xs font-mono text-amber-400">
                    Asignada a: {selectedBattery.machineAssigned}
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] text-zinc-500 uppercase block">Garantía Oficial</span>
                  <span className="text-xs font-bold text-emerald-400">{selectedBattery.warrantyMonths} Meses</span>
                </div>
              </div>

              {/* Conductance & CCA Health Gauge */}
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-[2px] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-mono">Conductancia CCA (Medición Midtronics):</span>
                  <span className="font-mono font-bold text-white">
                    {selectedBattery.ccaTested} / {selectedBattery.ccaNominal} CCA ({healthPercent}%)
                  </span>
                </div>

                <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      healthPercent >= 90
                        ? 'bg-emerald-500'
                        : healthPercent >= 75
                        ? 'bg-amber-400'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${healthPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1">
                  <span>Reemplazo sugerido si CCA &lt; 70%</span>
                  <span>Último test: Hace 3 días</span>
                </div>
              </div>

              {/* Metadata Table */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 bg-zinc-900/60 rounded-[2px] border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 block uppercase">Código de Lote de Fábrica</span>
                  <span className="text-zinc-200 font-bold">{selectedBattery.batchCode}</span>
                </div>
                <div className="p-2 bg-zinc-900/60 rounded-[2px] border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 block uppercase">Número de Serie Grabado</span>
                  <span className="text-zinc-200 font-bold">{selectedBattery.serialNumber}</span>
                </div>
                <div className="p-2 bg-zinc-900/60 rounded-[2px] border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 block uppercase">Fecha de Instalación</span>
                  <span className="text-zinc-200">{selectedBattery.installedDate}</span>
                </div>
                <div className="p-2 bg-zinc-900/60 rounded-[2px] border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 block uppercase">Vencimiento de Garantía</span>
                  <span className="text-amber-400 font-bold">{selectedBattery.warrantyExpiry}</span>
                </div>
              </div>
            </div>

            {/* Quick Claim Action Box */}
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-[3px] flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-zinc-300 font-display">¿Falla Prematura o Celda en Corto?</span>
                <p className="text-[11px] text-zinc-500">
                  Reemplazo en patio dentro de las 24 horas con informe técnico de banco.
                </p>
              </div>

              <button
                type="button"
                onClick={handleInitiateClaim}
                disabled={claimSent || selectedBattery.healthStatus === 'RECLAMO EN PROCESO'}
                className="px-3 py-1.5 rounded-[2px] bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 text-black disabled:text-zinc-500 font-display uppercase tracking-wider text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                {claimSent ? 'RECLAMO INICIADO' : 'Tramitar Garantía'}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-400 font-mono">
            TMD Dominicana S.R.L. — Almacén Central de Repuestos & Baterías Km 22
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-display uppercase tracking-wider text-xs font-bold transition-all cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
