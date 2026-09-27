import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Wrench, 
  AlertCircle, 
  FileCheck, 
  Truck, 
  DollarSign, 
  User, 
  Calendar, 
  ChevronRight,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { FullbayActiveRepairOrder } from '../../types';
import { USD_TO_DOP_RATE } from '../../data/catalog';

interface WorkshopLiveTimelineProps {
  order: FullbayActiveRepairOrder;
  onApproveEstimate?: (orderId: string) => Promise<void>;
  onContactServiceAdvisor?: (order: FullbayActiveRepairOrder) => void;
}

type TimelineStepKey = 'received' | 'diagnostic' | 'estimate_approval' | 'in_progress' | 'quality_testing' | 'ready_for_pickup';

interface TimelineStep {
  key: TimelineStepKey;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    key: 'received',
    label: '1. Ingreso a Patio / Taller',
    sublabel: 'Recepción Km 22 e inspección pericial 360°',
    icon: Truck
  },
  {
    key: 'diagnostic',
    label: '2. Diagnóstico & Escáner',
    sublabel: 'Conexión a LiveLink / CAN-Bus y lectura de fallas',
    icon: Wrench
  },
  {
    key: 'estimate_approval',
    label: '3. Presupuesto & Aprobación',
    sublabel: 'Desglose de repuestos OEM y mano de obra',
    icon: FileCheck
  },
  {
    key: 'in_progress',
    label: '4. Ejecución en Bahía',
    sublabel: 'Intervención mecánica por técnicos certificados',
    icon: Clock
  },
  {
    key: 'quality_testing',
    label: '5. Prueba de Carga & Calidad',
    sublabel: 'Ciclos de presión hidráulica y calibración',
    icon: ShieldCheck
  },
  {
    key: 'ready_for_pickup',
    label: '6. Listo para Retiro',
    sublabel: 'Facturación B01 y despacho a obra',
    icon: CheckCircle2
  }
];

export const WorkshopLiveTimeline: React.FC<WorkshopLiveTimelineProps> = ({
  order,
  onApproveEstimate,
  onContactServiceAdvisor
}) => {
  const [approving, setApproving] = useState<boolean>(false);
  const [approvedLocally, setApprovedLocally] = useState<boolean>(order.digitalApprovalStatus === 'approved');

  // Map Fullbay status to current step index
  const getStepIndex = (status: FullbayActiveRepairOrder['status']): number => {
    switch (status) {
      case 'in_queue':
        return 0;
      case 'diagnostic':
        return 1;
      case 'waiting_on_parts':
        return 2;
      case 'in_progress':
        return 3;
      case 'ready_for_review':
        return 4;
      case 'completed':
        return 5;
      default:
        return 2;
    }
  };

  const currentIndex = getStepIndex(order.status);
  const totalDop = (order.totalEstimatedAmountUsd || 0) * USD_TO_DOP_RATE;

  const handleApprove = async () => {
    setApproving(true);
    try {
      if (onApproveEstimate) {
        await onApproveEstimate(order.orderId);
      }
      setApprovedLocally(true);
    } catch (e) {
      console.error('Error approving estimate:', e);
      setApprovedLocally(true);
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-[5px] border border-zinc-800 p-4 sm:p-6 shadow-sm space-y-5 font-mono">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-[2px] bg-amber-400 text-black font-black text-xs uppercase font-mono">
              Orden Activa Fullbay: {order.fullbayOrderNumber}
            </span>
            <span className="text-[10px] text-zinc-400 font-bold uppercase font-display tracking-wider">
              Bahía: {order.serviceLocation}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-white uppercase font-display tracking-tight mt-1">
            {order.unitModel} ({order.unitFicha})
          </h3>
          <span className="text-xs text-zinc-400 font-mono">
            VIN / Chasis: {order.unitVin} • Cliente: {order.customerName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onContactServiceAdvisor && (
            <button
              type="button"
              onClick={() => onContactServiceAdvisor(order)}
              className="px-3 py-1.5 rounded-[2px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-display uppercase tracking-wider text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Asesor</span>
            </button>
          )}
        </div>
      </div>

      {/* Complaint / Diagnostic Note */}
      <div className="p-3 rounded-[3px] bg-zinc-950/60 border border-zinc-800 text-xs">
        <span className="text-[10px] text-amber-400 font-bold uppercase block mb-0.5 font-display tracking-wider">
          Síntoma Reportado & Motivo de Ingreso:
        </span>
        <p className="text-zinc-300 leading-relaxed font-sans">
          {order.complaintSummary}
        </p>
        <div className="mt-2 flex items-center gap-4 text-[11px] text-zinc-400 flex-wrap">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3 text-amber-400" />
            Mecánico Asignado: <strong className="text-white">{order.assignedTechnician.name}</strong>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-sky-400" />
            Horas Registradas: <strong className="text-white font-mono">{order.laborHoursTracked} hrs</strong>
          </span>
        </div>
      </div>

      {/* Visual Live Progress Stepper */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider font-display">
            Progreso en Vivo de la Orden en Taller
          </span>
          <span className="text-[11px] font-bold text-amber-400 font-mono">
            Fase Actual: {TIMELINE_STEPS[Math.min(currentIndex, TIMELINE_STEPS.length - 1)].label}
          </span>
        </div>

        {/* Stepper Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {TIMELINE_STEPS.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div 
                key={step.key}
                className={`p-3 rounded-[3px] border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'bg-amber-400/10 border-amber-400 text-amber-400 shadow-xs'
                    : isCompleted
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                      : 'bg-zinc-950/40 border-zinc-800 text-zinc-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`p-1.5 rounded-[2px] ${
                    isCurrent 
                      ? 'bg-amber-400 text-black font-black' 
                      : isCompleted 
                        ? 'bg-emerald-500 text-black' 
                        : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <step.icon className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span className="text-[9px] font-mono font-bold">
                    0{idx + 1}
                  </span>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold leading-tight font-display uppercase tracking-tight">
                    {step.label.replace(/^\d+\.\s*/, '')}
                  </h4>
                  <p className="text-[9px] text-zinc-400 leading-tight mt-0.5 line-clamp-2 font-sans">
                    {step.sublabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Estimate Digital Approval Card */}
      {order.totalEstimatedAmountUsd && (
        <div className="p-4 rounded-[3px] bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block font-display">
              Presupuesto Homologado de Taller (Mano de Obra & Piezas OEM)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-amber-400 font-mono">
                US$ {order.totalEstimatedAmountUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-zinc-400 font-sans">
                (Aprox. RD$ {Math.round(totalDop).toLocaleString('es-DO')} con NCF B01)
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 flex items-center gap-3">
              <span>Mano de Obra: <strong className="text-white font-mono">US$ {order.totalLaborUsd?.toFixed(2)}</strong></span>
              <span>•</span>
              <span>Repuestos ({order.allocatedPartsCount}): <strong className="text-white font-mono">US$ {order.totalPartsUsd?.toFixed(2)}</strong></span>
            </div>
          </div>

          <div>
            {approvedLocally ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-[2px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold uppercase font-display tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Presupuesto Aprobado Digitalmente</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleApprove}
                disabled={approving}
                className="px-4 py-2 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50 font-display tracking-wider"
              >
                <FileCheck className="w-4 h-4" />
                <span>{approving ? 'Firmando...' : 'Aprobar Presupuesto con 1 Clic'}</span>
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
