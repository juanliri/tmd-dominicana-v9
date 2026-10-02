import React, { useEffect, useState } from 'react';
import { 
  X, 
  FileText, 
  Wrench, 
  Package, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  Printer, 
  ExternalLink, 
  Building2, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Calendar, 
  DollarSign, 
  Truck, 
  MapPin, 
  Share2, 
  Check, 
  ChevronRight,
  Layers,
  ArrowRight,
  XCircle
} from 'lucide-react';
import { PortalQuote, ServiceWorkOrder, CustomerPurchaseOrder } from '../../types';
import { USD_TO_DOP_RATE } from '../../data/catalog';
import { generateQuotePDF, downloadOrderInvoicePDF, downloadWorkOrderPDF } from '../../utils/pdfGenerator';
import { getQuoteWhatsAppUrl } from '../../utils/whatsappMessaging';

export type DrawerDetailItem = 
  | { type: 'quote'; data: PortalQuote }
  | { type: 'workOrder'; data: ServiceWorkOrder }
  | { type: 'purchase'; data: CustomerPurchaseOrder };

interface PortalDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: DrawerDetailItem | null;
  onApproveQuote?: (quoteId: string) => void;
  onRejectQuote?: (quoteId: string) => void;
  isStaffOrAdmin?: boolean;
}

export const PortalDetailDrawer: React.FC<PortalDetailDrawerProps> = ({
  isOpen,
  onClose,
  item,
  onApproveQuote,
  onRejectQuote,
  isStaffOrAdmin = false
}) => {
  const [quoteStatusOverride, setQuoteStatusOverride] = useState<PortalQuote['status'] | null>(null);

  // Reset override whenever a different quote/item is selected
  useEffect(() => {
    setQuoteStatusOverride(null);
  }, [item?.type === 'quote' ? item.data.id : null]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const currentQuoteStatus: PortalQuote['status'] | null = item.type === 'quote' ? (quoteStatusOverride || item.data.status) : null;

  const handleDownloadQuotePdf = (quote: PortalQuote) => {
    try {
      const doc = generateQuotePDF({ quote });
      doc.save(`Proforma_${quote.quoteNumber}.pdf`);
    } catch (e) {
      console.error('Error downloading quote PDF:', e);
    }
  };

  const handleShareQuoteWhatsApp = (quote: PortalQuote) => {
    const url = getQuoteWhatsAppUrl(quote, quote.phone);
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[95] overflow-hidden animate-in fade-in duration-200">
      {/* Dimmed backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside className="w-screen max-w-md sm:max-w-lg bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
          
          {/* Drawer Header */}
          <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-900/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                {item.type === 'quote' && <FileText className="w-4 h-4" />}
                {item.type === 'workOrder' && <Wrench className="w-4 h-4" />}
                {item.type === 'purchase' && <Package className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  {item.type === 'quote' && 'Cotización B01 & Proforma Fiscal'}
                  {item.type === 'workOrder' && 'Orden de Taller Fullbay Km 22'}
                  {item.type === 'purchase' && 'Pedido de Repuestos & Despacho'}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white truncate font-display">
                  {item.type === 'quote' && item.data.quoteNumber}
                  {item.type === 'workOrder' && item.data.orderNumber}
                  {item.type === 'purchase' && item.data.orderNumber}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer transition-colors"
              title="Cerrar panel (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-zinc-300">
            {/* ========================================================= */}
            {/* QUOTE VIEW */}
            {/* ========================================================= */}
            {item.type === 'quote' && (
              <>
                {/* Status & DGII Verification Banner */}
                <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Estado de Proforma</span>
                    <span className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      currentQuoteStatus === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : currentQuoteStatus === 'rejected'
                        ? 'bg-zinc-800 text-amber-400 border border-amber-500/30'
                        : currentQuoteStatus === 'in_review'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                        : 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                    }`}>
                      {currentQuoteStatus === 'approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {(currentQuoteStatus === 'submitted' || currentQuoteStatus === 'draft') && (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      {currentQuoteStatus === 'in_review' && <Clock className="w-3.5 h-3.5" />}
                      {currentQuoteStatus === 'rejected' && <AlertCircle className="w-3.5 h-3.5" />}
                      <span className="uppercase">
                        {currentQuoteStatus === 'approved' 
                          ? 'Aprobada' 
                          : currentQuoteStatus === 'rejected' 
                          ? 'Desestimada' 
                          : currentQuoteStatus === 'in_review' 
                          ? 'En Revisión' 
                          : 'Enviada'}
                      </span>
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Comprobante DGII</span>
                    <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-amber-400 mt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{item.data.ncfType || 'B01 CRÉDITO FISCAL'}</span>
                    </span>
                  </div>
                </div>

                {/* Machine Details Card */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Equipo Cotizado & Especificaciones</span>
                  </h4>
                  <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-bold text-white font-display">
                          {item.data.itemsSummary || 'Maquinaria Pesada TMD'}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {item.data.companyName} · Entrega Inmediata Km 22
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-400 text-[10px] font-bold font-mono">
                        AÑO 2026
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80 text-xs">
                      <div>
                        <span className="text-zinc-500 block text-[10px] uppercase">Garantía Fábrica:</span>
                        <span className="text-zinc-200 font-semibold">2,000 Horas / 1 Año</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px] uppercase">Telemetría:</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          LiveLink™ Satelital 2 Años
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                    <span>Desglose Fiscal NCF (DGII 606/607)</span>
                  </h4>
                  <div className="p-4 rounded-lg bg-zinc-900/90 border border-zinc-800 space-y-2.5 text-xs">
                    <div className="flex justify-between text-zinc-400">
                      <span>Subtotal Equipamiento:</span>
                      <span className="font-mono text-zinc-200">US$ {item.data.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>ITBIS (18% Ley Dominicana):</span>
                      <span className="font-mono text-zinc-200">US$ {item.data.itbis.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="pt-2 border-t border-zinc-800 flex justify-between items-baseline">
                      <span className="text-sm font-bold text-white uppercase">Total Final Proforma:</span>
                      <div className="text-right">
                        <span className="text-base font-bold text-amber-400 font-mono">
                          US$ {item.data.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="block text-[10px] text-zinc-400 font-mono">
                          ≈ RD$ {(item.data.total * USD_TO_DOP_RATE).toLocaleString('en-US', { minimumFractionDigits: 2 })} DOP
                        </span>
                      </div>
                    </div>

                    {item.data.downPaymentAmountUsd ? (
                      <div className="mt-2 p-2.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>Anticipo Pagado:</span>
                          <span className="font-mono">US$ {item.data.downPaymentAmountUsd.toLocaleString()}</span>
                        </div>
                        <p className="text-[10px] text-amber-200/80">
                          Ref. Bancaria: {item.data.downPaymentReference || 'Verificada en Pasarela TMD'} ({item.data.downPaymentMethod || 'Banco Popular'})
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Customer Information Card */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Datos del Cliente & Facturación</span>
                  </h4>
                  <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs">
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Razón Social:</span>
                      <span className="text-white font-bold">{item.data.companyName || item.data.clientName}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-zinc-500 block text-[10px]">RNC / Cédula:</span>
                        <span className="text-zinc-200 font-mono">{item.data.rnc || '1-31-89472-1'}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Contacto:</span>
                        <span className="text-zinc-200">{item.data.clientName}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-800/80">
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Teléfono:</span>
                        <span className="text-zinc-200">{item.data.phone || '+1 (809) 560-1234'}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Correo:</span>
                        <span className="text-zinc-200 truncate block">{item.data.clientEmail}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadQuotePdf(item.data)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors cursor-pointer border border-zinc-700"
                    >
                      <Download className="w-4 h-4 text-amber-400" />
                      <span>Descargar PDF B01</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShareQuoteWhatsApp(item.data)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-bold transition-colors cursor-pointer border border-emerald-500/40"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </button>
                  </div>

                  {/* Staff / Admin Actions */}
                  {isStaffOrAdmin && currentQuoteStatus !== 'approved' && currentQuoteStatus !== 'rejected' && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setQuoteStatusOverride('approved');
                          onApproveQuote?.(item.data.id);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase transition-colors cursor-pointer shadow-sm"
                      >
                        <Check className="w-4 h-4" />
                        <span>Aprobar Proforma</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setQuoteStatusOverride('rejected');
                          onRejectQuote?.(item.data.id);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors cursor-pointer border border-zinc-700"
                      >
                        <X className="w-4 h-4" />
                        <span>Desestimar</span>
                      </button>
                    </div>
                  )}

                  {/* Client Direct Purchase / Approval Action */}
                  {!isStaffOrAdmin && currentQuoteStatus !== 'approved' && currentQuoteStatus !== 'rejected' && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setQuoteStatusOverride('approved');
                          onApproveQuote?.(item.data.id);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase transition-all cursor-pointer shadow-md"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Aceptar Proforma & Confirmar Pedido</span>
                      </button>
                    </div>
                  )}

                  {/* Approved Status Notice */}
                  {currentQuoteStatus === 'approved' && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Cotización Aprobada Exitosamente • NCF Fiscal DGII Asignado</span>
                    </div>
                  )}

                  {/* Desestimada Status with One-Click Reactivation */}
                  {currentQuoteStatus === 'rejected' && (
                    <div className="space-y-2 pt-2 animate-in fade-in">
                      <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-700/80 text-zinc-300 text-xs font-medium flex items-center gap-2.5">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Esta proforma fue marcada como desestimada. Puede reactivarla de inmediato según los términos oficiales de TMD.</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setQuoteStatusOverride('approved');
                            onApproveQuote?.(item.data.id);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase transition-all cursor-pointer shadow-sm"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Reactivar & Comprar</span>
                        </button>
                        <a
                          href={getQuoteWhatsAppUrl(item.data)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Ajustar Términos</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ========================================================= */}
            {/* WORK ORDER VIEW */}
            {/* ========================================================= */}
            {item.type === 'workOrder' && (
              <>
                <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Bahía en Taller</span>
                    <span className="text-xs font-bold text-white mt-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{item.data.workshopName || 'Bahía 01 Fullbay HD'}</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Prioridad</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.data.priority === 'emergency' 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}>
                      {item.data.priority.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Equipo en Servicio</h4>
                  <p className="text-base font-bold text-white font-display">{item.data.machineModel}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Chasis / Serial:</span>
                      <span className="font-mono text-zinc-300">{item.data.machineSerial || 'VIN-TMD-2026'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Horómetro Ingreso:</span>
                      <span className="font-mono text-zinc-300">{item.data.horometerHours || 1200} hrs</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Diagnóstico Técnico</h4>
                  <p className="text-zinc-300 leading-relaxed">
                    {item.data.description || 'Mantenimiento preventivo regular según manual OEM.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => downloadWorkOrderPDF(item.data)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors cursor-pointer border border-zinc-700"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Descargar Orden de Servicio PDF</span>
                </button>
              </>
            )}

            {/* ========================================================= */}
            {/* PURCHASE ORDER VIEW */}
            {/* ========================================================= */}
            {item.type === 'purchase' && (
              <>
                <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Número de Guía</span>
                    <span className="text-xs font-mono font-bold text-amber-400 mt-1">
                      {item.data.trackingNumber || 'TMD-LOG-LOCAL'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Estado Despacho</span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 mt-1">
                      <Truck className="w-3.5 h-3.5" />
                      <span>{item.data.status.toUpperCase()}</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Piezas y Repuestos</h4>
                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-2">
                    {item.data.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs pb-2 border-b border-zinc-800/80 last:border-0 last:pb-0">
                        <div>
                          <p className="font-semibold text-white">{it.name}</p>
                          <p className="text-[10px] text-zinc-500 font-mono">P/N: {it.partNumber} · Cant: {it.quantity}</p>
                        </div>
                        <span className="font-mono text-zinc-200">US$ {(it.priceUsd * it.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-zinc-900/90 border border-zinc-800 flex justify-between items-baseline text-xs">
                  <span className="font-bold uppercase text-white">Total Pagado:</span>
                  <span className="text-base font-bold text-amber-400 font-mono">
                    US$ {item.data.totalUsd.toLocaleString()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => downloadOrderInvoicePDF(item.data)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Factura Fiscal NCF</span>
                </button>
              </>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Presione ESC para cerrar</span>
            <div className="flex items-center gap-1 text-zinc-400">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>TMD Dominicana Km 22</span>
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
};
