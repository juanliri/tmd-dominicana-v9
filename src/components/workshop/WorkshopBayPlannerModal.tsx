import React, { useState } from 'react';
import {
  Layers,
  Wrench,
  Clock,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  X,
  Sparkles,
  Download,
  Filter,
  Check,
  Building2,
  Cpu
} from 'lucide-react';

interface WorkshopBayPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WorkshopBay {
  bayNumber: number;
  bayName: string;
  specialty: string;
  status: 'occupied' | 'available' | 'maintenance';
  currentMachine?: string;
  serialNumber?: string;
  workOrderNumber?: string;
  leadMechanic?: string;
  progressPercent?: number;
  estimatedDelivery?: string;
  priority?: 'high' | 'medium' | 'urgent';
}

export const WorkshopBayPlannerModal: React.FC<WorkshopBayPlannerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [bays, setBays] = useState<WorkshopBay[]>([
    {
      bayNumber: 1,
      bayName: 'Bahía 1 (Overhaul Motor)',
      specialty: 'Reconstrucción Mayor Motores Cummins / Isuzu',
      status: 'occupied',
      currentMachine: 'LiuGong 922E HD Excavadora',
      serialNumber: 'LG922E-2024-88412',
      workOrderNumber: 'OT-2026-0841',
      leadMechanic: 'Téc. Héctor Rosario (Master Cummins)',
      progressPercent: 75,
      estimatedDelivery: '2026-03-27',
      priority: 'high'
    },
    {
      bayNumber: 2,
      bayName: 'Bahía 2 (Circuito Hidráulico)',
      specialty: 'Bombas Kawasaki & Válvulas de Alivio 350 Bar',
      status: 'occupied',
      currentMachine: 'JCB JS205 Excavadora',
      serialNumber: 'JCB-JS205-99120',
      workOrderNumber: 'OT-2026-0850',
      leadMechanic: 'Ing. Ramón Valdez (Hidráulica)',
      progressPercent: 40,
      estimatedDelivery: '2026-03-29',
      priority: 'urgent'
    },
    {
      bayNumber: 3,
      bayName: 'Bahía 3 (Tren de Rodaje)',
      specialty: 'Prensa Hidráulica 100T para Pasadores y Cadenas',
      status: 'occupied',
      currentMachine: 'LiuGong CLGB160 Bull-dozer',
      serialNumber: 'B160-2023-5510',
      workOrderNumber: 'OT-2026-0847',
      leadMechanic: 'Téc. Manuel Almonte',
      progressPercent: 90,
      estimatedDelivery: '2026-03-25',
      priority: 'medium'
    },
    {
      bayNumber: 4,
      bayName: 'Bahía 4 (Electrónica & ECM)',
      specialty: 'Calibración J1939 CAN-Bus y Sensores DEF Tier 4F',
      status: 'available',
      specialty: 'Disponible para Diagnóstico Inmediato',
      leadMechanic: 'Ing. David Rosario (Mecatrónica)'
    },
    {
      bayNumber: 5,
      bayName: 'Bahía 5 (Mantenimiento Rápido & PDI)',
      specialty: 'Servicios Preventivos 500h / Checklist PDI 85 Puntos',
      status: 'occupied',
      currentMachine: 'Ammann ASC 110 Rodillo',
      serialNumber: 'AM-110-2025-004',
      workOrderNumber: 'OT-2026-0855',
      leadMechanic: 'Téc. Juan Carlos Mena',
      progressPercent: 60,
      estimatedDelivery: '2026-03-25 04:00 PM',
      priority: 'high'
    },
    {
      bayNumber: 6,
      bayName: 'Bahía 6 (Soldadura & Mecanizado)',
      specialty: 'Reconstrucción de Cucharas, Baldes HD y Barrenado',
      status: 'available',
      specialty: 'Disponible para Trabajos de Torno y Soldadura MIG/TIG',
      leadMechanic: 'Maestro Soldador Santiago Cruz'
    }
  ]);

  if (!isOpen) return null;

  const occupiedCount = bays.filter(b => b.status === 'occupied').length;
  const availableCount = bays.filter(b => b.status === 'available').length;

  const handleExportSchedule = () => {
    let text = `=========================================================================\n`;
    text += `TECNOMAQUINARIAS DIESEL S.R.L. — TALLER CENTRAL KM 22 AUTOPISTA DUARTE\n`;
    text += `CRONOGRAMA DE OCUPACIÓN DE BAHÍAS DE TRABAJO (BAHÍAS 1 A 6)\n`;
    text += `GENERADO: ${new Date().toLocaleString()}\n`;
    text += `=========================================================================\n\n`;

    bays.forEach(b => {
      text += `[BAHÍA #${b.bayNumber}] ${b.bayName.toUpperCase()}\n`;
      text += `ESTADO: ${b.status.toUpperCase()} | ESPECIALIDAD: ${b.specialty}\n`;
      if (b.status === 'occupied') {
        text += `• EQUIPO EN PROCESO: ${b.currentMachine} (Serie: ${b.serialNumber})\n`;
        text += `• ORDEN DE TRABAJO: ${b.workOrderNumber} | MECÁNICO LÍDER: ${b.leadMechanic}\n`;
        text += `• AVANCE: ${b.progressPercent}% | FECHA ESTIMADA ENTREGA: ${b.estimatedDelivery}\n`;
      } else {
        text += `• DISPONIBLE PARA ASIGNACIÓN INMEDIATA\n`;
      }
      text += `-------------------------------------------------------------------------\n`;
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TMD_PLANIFICADOR_BAHIAS_KM22.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl text-zinc-200 overflow-hidden font-mono flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[3px] bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-amber-400 text-black uppercase tracking-wider">
                  TALLER KM 22 • PLANNER
                </span>
                <span className="text-xs text-zinc-400 font-sans">
                  Gestión de Bahías de Desarme
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-white mt-0.5">
                Planificador Visual de Bahías de Trabajo
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

        {/* Toolbar & KPI */}
        <div className="p-3 bg-zinc-900/60 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              {occupiedCount} Bahías Ocupadas
            </span>
            <span className="text-zinc-600">•</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              {availableCount} Bahías Disponibles
            </span>
          </div>

          <button
            onClick={handleExportSchedule}
            className="px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase transition-colors flex items-center gap-1.5 border border-zinc-700 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Exportar Plan de Turnos</span>
          </button>
        </div>

        {/* Bays Grid */}
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-3.5 overflow-y-auto max-h-[70vh] text-xs">
          {bays.map(bay => (
            <div
              key={bay.bayNumber}
              className={`p-4 rounded-[3px] border transition-all ${
                bay.status === 'occupied'
                  ? 'bg-zinc-900/90 border-zinc-800 hover:border-amber-400/40'
                  : 'bg-zinc-900/40 border-dashed border-zinc-800 hover:border-emerald-500/40'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-[1px] bg-zinc-800 text-amber-400 font-bold text-[11px] font-mono">
                      B-{bay.bayNumber}
                    </span>
                    <h3 className="font-bold text-white text-xs">{bay.bayName}</h3>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-sans block mt-0.5">
                    {bay.specialty}
                  </span>
                </div>

                <span className={`px-2 py-0.5 rounded-[2px] text-[10px] font-bold uppercase tracking-wider ${
                  bay.status === 'occupied'
                    ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {bay.status === 'occupied' ? 'En Operación' : 'Libre'}
                </span>
              </div>

              {/* Machine Details if Occupied */}
              {bay.status === 'occupied' && (
                <div className="mt-3 p-3 bg-zinc-950/80 border border-zinc-850 rounded-[2px] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-zinc-200 text-xs block">{bay.currentMachine}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">Serie: {bay.serialNumber}</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded-[2px] bg-zinc-800 text-amber-400 font-bold text-[10px]">
                      {bay.workOrderNumber}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-zinc-400">Avance de Reparación:</span>
                      <span className="font-mono font-bold text-amber-400">{bay.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all"
                        style={{ width: `${bay.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-800/60">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-zinc-500" />
                      {bay.leadMechanic}
                    </span>
                    <span className="text-emerald-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {bay.estimatedDelivery}
                    </span>
                  </div>
                </div>
              )}

              {/* Available State */}
              {bay.status === 'available' && (
                <div className="mt-3 p-3 bg-zinc-950/30 border border-dashed border-zinc-800 rounded-[2px] flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 font-sans">
                    Bahía lista para ingreso de nueva máquina o auxilio 4x4.
                  </span>
                  <button
                    className="px-2.5 py-1 rounded-[2px] bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] uppercase cursor-pointer"
                  >
                    Asignar OT
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 shrink-0">
          <span>Capacidad Instalada: 6 Bahías Simultáneas de Trabajo Pesado • Taller Central Km 22</span>
          <span className="text-amber-400 font-bold font-mono">TMD Workshop Operations</span>
        </div>
      </div>
    </div>
  );
};
