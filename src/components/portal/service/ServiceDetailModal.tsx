import React from 'react';
import { 
  Wrench, 
  Clock, 
  FileText, 
  CheckCircle2, 
  Printer, 
  Download,
  X, 
  Building2, 
  Truck, 
  Tag, 
  Calendar 
} from 'lucide-react';
import { ServiceWorkOrder, InstalledServicePart } from '../../../types';
import { downloadWorkOrderPDF } from '../../../utils/pdfGenerator';

interface ServiceDetailModalProps {
  order: ServiceWorkOrder | null;
  onClose: () => void;
  onApproveEstimate: (orderId: string, approved: boolean) => Promise<void>;
  onNavigate: (route: string) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  order,
  onClose,
  onApproveEstimate,
  onNavigate
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn font-mono">
      <div className="bg-zinc-900 w-full max-w-2xl rounded-[5px] border border-zinc-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[2px] bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400">
                  ORDEN #{order.orderNumber}
                </span>
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-zinc-800 text-zinc-300 uppercase font-mono">
                  {order.status}
                </span>
                {order.machineModel && (
                  <span className="text-xs text-zinc-400 font-bold font-display uppercase tracking-wider">
                    • {order.machineModel}
                  </span>
                )}
              </div>
              <h3 className="text-base font-black uppercase text-white font-display tracking-tight">
                {order.serviceType ? order.serviceType.replace(/_/g, ' ').toUpperCase() : 'MANTENIMIENTO PREVENTIVO'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-[2px] bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs text-zinc-200">
          {/* Machine & Station Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950 p-4 rounded-[3px] border border-zinc-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 block font-display">Unidad</span>
              <span className="font-bold text-white font-mono">{order.equipmentUnitId || order.machineSerial || 'MAQ-01'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 block font-display">Horómetro</span>
              <span className="font-bold text-amber-400 font-mono">{order.horometerHours || 2450} hrs</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 block font-display">Fecha Servicio</span>
              <span className="font-bold text-white font-mono">{order.scheduledDate || order.completedDate || '2026-09-20'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 block font-display">Ubicación</span>
              <span className="font-bold text-white truncate block">{order.location || 'Km 22 Duarte'}</span>
            </div>
          </div>

          {/* Description & Work Executed */}
          <div className="space-y-1.5">
            <span className="text-[11px] uppercase font-bold text-zinc-400 font-display">Descripción del Trabajo:</span>
            <p className="p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800 font-sans leading-relaxed text-zinc-300">
              {order.description || 'Mantenimiento preventivo integral de 500 horas, reemplazo de filtros de aceite y combustible, chequeo de presiones hidráulicas y engrase general.'}
            </p>
            {order.diagnosticReport && (
              <div className="mt-2 p-3 rounded-[3px] bg-amber-500/10 border border-amber-500/20 text-xs">
                <span className="text-[10px] font-black uppercase text-amber-400 block mb-0.5 font-display">Diagnóstico y Presiones</span>
                <p className="font-mono text-zinc-300">{order.diagnosticReport}</p>
              </div>
            )}
          </div>

          {/* Technician & Suggestion */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-zinc-500 font-display">Técnico Asignado</span>
              <p className="font-bold text-white text-sm">
                {order.assignedTechnician || 'Carlos Mendoza (Patio Km 22)'}
              </p>
              <p className="text-[10px] text-zinc-400 font-semibold pt-1 font-sans">
                Certificación Gold Caterpillar & JCB
              </p>
            </div>

            <div className="p-4 rounded-[3px] bg-amber-500/10 border border-amber-500/20 space-y-1 text-xs">
              <span className="text-[10px] font-black uppercase text-amber-400 font-display">Próximo Mantenimiento Sugerido</span>
              <p className="text-white font-bold text-sm font-mono">
                {order.nextServiceDueHours ? `${order.nextServiceDueHours.toLocaleString()} Horas` : '+250 hrs / 90 días'}
              </p>
              <p className="text-[11px] text-zinc-300 font-sans">
                Estimado: {order.nextServiceDueDate || 'Diciembre 2026'}
              </p>
            </div>
          </div>

          {/* Installed Parts Table */}
          {order.installedParts && order.installedParts.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] uppercase font-bold text-zinc-400 font-display">Repuestos & Filtros Instalados:</span>
              <div className="border border-zinc-800 rounded-[3px] overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[320px]">
                  <thead className="bg-zinc-950 text-zinc-400 font-bold font-display uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Código OEM</th>
                      <th className="p-2.5">Descripción</th>
                      <th className="p-2.5 text-center">Cant</th>
                      <th className="p-2.5 text-right">Precio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {order.installedParts.map((part, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-mono text-amber-400 font-bold">{part.partNumber}</td>
                        <td className="p-2.5 font-sans font-semibold text-zinc-200">{part.name}</td>
                        <td className="p-2.5 text-center font-mono text-zinc-300">{part.quantity}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-white">US$ {(part.totalPriceUsd || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Fullbay Estimate Approval Card */}
          <div className="p-4 rounded-[3px] bg-zinc-950 border border-amber-400/30 space-y-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs uppercase font-display tracking-wider">Aprobación Digital Fullbay Connect</span>
              </div>
              <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-amber-400/20 text-amber-400 border border-amber-400/40 uppercase font-mono">
                {order.status === 'requested' || order.status === 'scheduled' ? 'Pendiente Aprobación' : 'Aprobado'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-300">
              <span>Mano de obra: <strong className="text-white font-mono">US$ {(order.totalLaborCostUsd || 180).toFixed(2)}</strong></span>
              <span>Repuestos: <strong className="text-white font-mono">US$ {(order.totalPartsCostUsd || 74.5).toFixed(2)}</strong></span>
              <span className="text-sm font-black text-amber-400 font-mono">Total: US$ {(order.totalCostUsd || 254.5).toFixed(2)}</span>
            </div>

            {order.status !== 'in_progress' && order.status !== 'completed' ? (
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onApproveEstimate(order.id, true)}
                  className="flex-1 py-2 px-3 rounded-[2px] bg-emerald-500 hover:bg-emerald-400 text-black font-black font-display uppercase tracking-wider text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Aprobar Presupuesto & Iniciar Reparación</span>
                </button>
                <button
                  type="button"
                  onClick={() => onApproveEstimate(order.id, false)}
                  className="py-2 px-3 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold font-display uppercase tracking-wider text-xs transition-all cursor-pointer border border-zinc-700"
                >
                  <span>Solicitar Ajuste</span>
                </button>
              </div>
            ) : (
              <div className="p-2 rounded-[2px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Presupuesto aprobado y orden en ejecución en Taller Central Km 22.</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadWorkOrderPDF(order)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-black font-black font-display uppercase tracking-wider rounded-[2px] text-xs transition-colors cursor-pointer shadow-md"
              title="Descargar Orden de Servicio Oficial en formato PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Orden PDF</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold font-display uppercase tracking-wider rounded-[2px] text-xs transition-colors cursor-pointer"
              title="Imprimir resumen de servicio"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-400" />
              <span>Imprimir</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigate('#/service');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-black font-display uppercase tracking-wider rounded-[2px] text-xs transition-colors cursor-pointer shadow-md"
            >
              <Wrench className="w-4 h-4" />
              <span>Programar Servicio</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold font-display uppercase tracking-wider rounded-[2px] text-xs transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
