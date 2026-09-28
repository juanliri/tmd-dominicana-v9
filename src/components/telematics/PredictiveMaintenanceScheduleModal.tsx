import React, { useState } from 'react';
import { 
  Wrench, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Package, 
  ShieldCheck, 
  X, 
  Gauge, 
  Droplet,
  Truck,
  RotateCcw
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface PredictiveMaintenanceScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineSerial?: string;
  currentHours?: number;
  onBookService?: () => void;
}

interface MaintenanceInterval {
  hours: number;
  title: string;
  description: string;
  status: 'COMPLETADO' | 'PRÓXIMO' | 'FUTURO';
  kitCode: string;
  kitPriceUsd: number;
  items: string[];
}

export const PredictiveMaintenanceScheduleModal: React.FC<PredictiveMaintenanceScheduleModalProps> = ({
  isOpen,
  onClose,
  machineSerial = 'LG-2022-849',
  currentHours = 1488.5,
  onBookService
}) => {
  const [selectedInterval, setSelectedInterval] = useState<number>(1500);
  const [isBooked, setIsBooked] = useState(false);

  if (!isOpen) return null;

  const nextServiceHours = 1500;
  const hoursRemaining = Math.max(0, Number((nextServiceHours - currentHours).toFixed(1)));
  const progressPercent = Math.min(100, Math.round(((currentHours % 250) / 250) * 100));

  const intervals: MaintenanceInterval[] = [
    {
      hours: 1000,
      title: 'Servicio Mayor 1,000 Horas',
      description: 'Cambio de fluidos de transmisión, engrase axial y filtros hidráulicos',
      status: 'COMPLETADO',
      kitCode: 'KIT-PM-1000-LG922',
      kitPriceUsd: 890,
      items: ['Aceite Transmisión SAE 30', 'Filtro Piloto Hidráulico', 'Filtros Combustible FS19732', 'Engrase 36 Puntos']
    },
    {
      hours: 1250,
      title: 'Servicio Preventivo 1,250 Horas',
      description: 'Cambio de aceite de motor diésel Cummins 15W-40 y filtro de lubricación',
      status: 'COMPLETADO',
      kitCode: 'KIT-PM-250-LG922',
      kitPriceUsd: 380,
      items: ['Aceite Valvoline Premium Blue 15W-40 (6 Gal)', 'Filtro Aceite LF16015', 'Inspección Correas Alternador']
    },
    {
      hours: 1500,
      title: 'Servicio Intermedio 1,500 Horas',
      description: 'Filtración diésel completa, cartucho de aire primario y chequeo de holguras',
      status: 'PRÓXIMO',
      kitCode: 'KIT-PM-500-LG922',
      kitPriceUsd: 620,
      items: ['Filtro Primario de Aire AF25139M', 'Filtro Secundario de Seguridad AF25140M', 'Filtro Separador Agua FS19732', 'Regulación de Válvulas']
    },
    {
      hours: 2000,
      title: 'Servicio Master Overhaul 2,000 Horas',
      description: 'Reemplazo total fluido hidráulico ISO VG 46 (240L), mandos finales y calibración de presiones',
      status: 'FUTURO',
      kitCode: 'KIT-PM-2000-LG922',
      kitPriceUsd: 2450,
      items: ['Tambor 55 Gal Fluido Hidráulico ISO VG 46 (x4)', 'Aceite Engranajes 85W-140 Mandos Finales', 'Filtro Retorno Hidráulico HF28910', 'Prueba Banco 350 Bar']
    }
  ];

  const handleConfirmBooking = () => {
    triggerHaptic('success');
    setIsBooked(true);
    if (onBookService) onBookService();
    setTimeout(() => {
      setIsBooked(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-700 rounded-[5px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[2px] bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white font-display uppercase tracking-wide">
                  Mantenimiento Predictivo Basado en Horómetro J1939
                </h3>
                <span className="px-2 py-0.5 rounded-[2px] bg-amber-500/10 text-amber-400 text-[10px] font-mono font-bold border border-amber-500/30">
                  Telemetría LiveLink
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Cálculo de desgaste acumulado y programación preventiva para la unidad {machineSerial}
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

        {/* Current Hours Banner */}
        <div className="px-6 py-4 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Gauge className="w-8 h-8 text-amber-400" />
            <div>
              <div className="text-[11px] font-mono text-zinc-400 uppercase">Horómetro CAN-Bus Actual</div>
              <div className="text-2xl font-black font-mono text-white tracking-wider">
                {currentHours.toLocaleString()} <span className="text-xs font-normal text-zinc-400">horas operativas</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[11px] font-mono text-zinc-400 uppercase">Próximo Servicio Oficial</div>
              <div className="text-base font-black font-mono text-amber-400">
                1,500.0 h <span className="text-xs font-normal text-zinc-300">({hoursRemaining} h restantes)</span>
              </div>
            </div>

            <div className="w-36 bg-zinc-800 rounded-full h-3 border border-zinc-700 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-amber-400 h-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto font-sans">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-300 font-display uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              Matriz de Intervalos Programados TMD
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {intervals.map((inv) => (
                <div
                  key={inv.hours}
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedInterval(inv.hours);
                  }}
                  className={`p-4 rounded-[3px] border transition-all cursor-pointer ${
                    selectedInterval === inv.hours
                      ? 'bg-zinc-900 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                      : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-base font-black font-mono text-white block">
                        {inv.hours.toLocaleString()} Horas
                      </span>
                      <span className="text-xs font-bold text-zinc-300 font-display">{inv.title}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-bold border ${
                      inv.status === 'COMPLETADO'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : inv.status === 'PRÓXIMO'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}>
                      {inv.status}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 mb-3">{inv.description}</p>

                  <div className="space-y-1 pt-2 border-t border-zinc-800/80">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-zinc-500">Kit OEM: {inv.kitCode}</span>
                      <span className="text-amber-400 font-bold">US$ {inv.kitPriceUsd.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Interval Detail & Spare Parts List */}
          {selectedInterval && (
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-[3px] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-display uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-amber-400" />
                  Contenido del Kit de Repuestos para Servicio de {selectedInterval} Horas
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  Almacén Central Km 22 (Listo para Despacho)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {intervals.find(i => i.hours === selectedInterval)?.items.map((it, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-zinc-900 border border-zinc-800 rounded-[2px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-zinc-300 font-mono text-[11px]">{it}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-zinc-950 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-zinc-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Conserva la garantía OEM de 2 años / 4,000 horas de fábrica</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-display uppercase tracking-wider text-xs font-bold transition-all cursor-pointer"
            >
              Cerrar
            </button>

            <button
              type="button"
              onClick={handleConfirmBooking}
              disabled={isBooked}
              className="w-full sm:w-auto px-5 py-2 rounded-[2px] bg-amber-500 hover:bg-amber-400 text-black font-display uppercase tracking-wider text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <Wrench className="w-4 h-4" />
              <span>{isBooked ? 'KIT AGENDADO CON ÉXITO' : 'Agendar Kit & Taller Km 22'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
