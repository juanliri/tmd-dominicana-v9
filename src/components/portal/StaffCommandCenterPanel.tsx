import React, { useState } from 'react';
import {
  LayoutGrid,
  Zap,
  FileText,
  Wrench,
  Truck,
  CreditCard,
  QrCode,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  Users,
  Search,
  ExternalLink,
  ArrowUpRight,
  HardHat,
  ChevronRight,
  Plus,
  RefreshCw,
  Phone,
  Layers,
  Database,
  Sliders,
  DollarSign,
  FileSpreadsheet
} from 'lucide-react';
import { PortalQuote, ServiceWorkOrder, UserProfile, Currency } from '../../types';
import { USD_TO_DOP_RATE } from '../../data/catalog';
import { getLocalFleet } from '../../services/serviceHistoryService';
import { getQuoteWhatsAppUrl, getWorkOrderDispatchWhatsAppUrl } from '../../utils/whatsappMessaging';
import { ScanFrequencyMiniChart } from './ScanFrequencyMiniChart';
import { RecentScans } from './RecentScans';

interface StaffCommandCenterPanelProps {
  quotes: PortalQuote[];
  workOrders: ServiceWorkOrder[];
  allUsers: UserProfile[];
  currency: Currency;
  onOpenCreateQuote: () => void;
  onSelectWorkflowSection: (section: string) => void;
  onNavigate: (route: string) => void;
  onExportQuotePdf: (quote: PortalQuote) => void;
  onOpenQrScanner?: () => void;
}

export const StaffCommandCenterPanel: React.FC<StaffCommandCenterPanelProps> = ({
  quotes,
  workOrders,
  allUsers,
  currency,
  onOpenCreateQuote,
  onSelectWorkflowSection,
  onNavigate,
  onExportQuotePdf,
  onOpenQrScanner
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'urgent' | 'sales' | 'service'>('all');

  // Computed live metrics
  const pendingQuotes = quotes.filter(q => q.status === 'submitted' || q.status === 'in_review' || q.status === 'draft');
  const totalPipelineUsd = quotes.reduce((acc, q) => acc + (q.total || 0), 0);
  const totalPipelineDop = totalPipelineUsd * USD_TO_DOP_RATE;

  const activeWorkOrders = workOrders.filter(w => w.status === 'in_progress' || w.status === 'scheduled' || w.status === 'requested');
  const urgentOrders = workOrders.filter(w => w.priority === 'emergency' || w.priority === 'urgent');

  const fleet = getLocalFleet();
  const fleetNeedingService = fleet.filter(f => f.currentHorometer >= (f.nextServiceHours - 50));

  const formatMoney = (usdAmount: number) => {
    if (currency === 'DOP') {
      return `RD$ ${(usdAmount * USD_TO_DOP_RATE).toLocaleString('es-DO', { maximumFractionDigits: 0 })}`;
    }
    return `US$ ${usdAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 font-sans">
      {/* EXECUTIVE COMMAND BANNER */}
      <div className="relative overflow-hidden rounded-[5px] bg-zinc-900 border border-zinc-800 p-5 md:p-6 shadow-xl text-white">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[2px] bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] font-black uppercase tracking-wider">
              <Zap className="w-3 h-3 fill-amber-400" />
              <span>CENTRO DE MANDO TMD STAFF & OPERACIONES</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-display">
              COMMAND CENTER <span className="text-amber-400">HQ</span>
            </h2>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              Panel unificado para personal de ventas técnicas, despachos en Patio Km 22, facturación DGII, taller móvil y gestión de cuentas corporativas.
            </p>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenCreateQuote}
              className="px-3.5 py-2 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black font-black text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer uppercase"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>NUEVA PROFORMA</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('#/admin')}
              className="px-3.5 py-2 rounded-[3px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer uppercase"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
              <span>ADMIN HQ FULL</span>
            </button>
          </div>
        </div>

        {/* 4 CRITICAL LIVE METRIC TILES */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-zinc-800">
          {/* Tile 1: Pipeline Cotizaciones */}
          <div 
            onClick={() => onSelectWorkflowSection('sales_quotes')}
            className="p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800 hover:border-amber-400/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-zinc-400 text-[10px] font-bold uppercase">
              <span>PIPELINE PROFORMAS</span>
              <FileText className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-white mt-1">
              {formatMoney(totalPipelineUsd)}
            </div>
            <div className="flex items-center gap-1 text-[9px] text-amber-400 mt-1 uppercase">
              <Clock className="w-3 h-3" />
              <span>{pendingQuotes.length} PENDIENTES DE CIERRE</span>
            </div>
          </div>

          {/* Tile 2: Taller & Campo */}
          <div 
            onClick={() => onSelectWorkflowSection('service_dispatch')}
            className="p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-zinc-400 text-[10px] font-bold uppercase">
              <span>ÓRDENES DE SERVICIO</span>
              <Wrench className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-white mt-1">
              {activeWorkOrders.length} <span className="text-xs font-normal text-zinc-400">ACTIVAS</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-emerald-400 mt-1 uppercase">
              <CheckCircle2 className="w-3 h-3" />
              <span>{urgentOrders.length} EN CAMPO / URGENTES</span>
            </div>
          </div>

          {/* Tile 3: Patio Km 22 */}
          <div 
            onClick={() => onSelectWorkflowSection('patio_dispatch')}
            className="p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800 hover:border-sky-500/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-zinc-400 text-[10px] font-bold uppercase">
              <span>PATIO KM 22 & SALIDAS</span>
              <Truck className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-white mt-1">
              GATE PASS QR
            </div>
            <div className="flex items-center gap-1 text-[9px] text-sky-400 mt-1 uppercase">
              <QrCode className="w-3 h-3" />
              <span>DESPACHOS Y LOWBOYS</span>
            </div>
          </div>

          {/* Tile 4: Anticipos Bancarios */}
          <div 
            onClick={() => onSelectWorkflowSection('advances_ledger')}
            className="p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800 hover:border-purple-500/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-zinc-400 text-[10px] font-bold uppercase">
              <span>ANTICIPOS & BANCOS</span>
              <CreditCard className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-white mt-1">
              LIBRO MAYOR
            </div>
            <div className="flex items-center gap-1 text-[9px] text-purple-400 mt-1 uppercase">
              <Building2 className="w-3 h-3" />
              <span>POPULAR / BHD / BANRESERVAS</span>
            </div>
          </div>
        </div>
      </div>

      {/* FAST DISPATCH & WORKFLOW SWITCHER LAUNCHPAD */}
      <div className="bg-zinc-900 rounded-[5px] border border-zinc-800 p-4 sm:p-5 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[3px] bg-amber-400/10 text-amber-400 flex items-center justify-center font-bold">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider font-display">
                Módulos de Operaciones Rápidas
              </h3>
              <p className="text-[11px] text-zinc-400">Acceso inmediato a herramientas administrativas internas</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">TMD-OPS-2026</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Action 1 */}
          <button
            type="button"
            onClick={() => onSelectWorkflowSection('sales_quotes')}
            className="p-3.5 rounded-[3px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-400/40 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-7 h-7 rounded-[2px] bg-amber-400 text-black flex items-center justify-center font-black">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 transition-colors" />
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors uppercase">
              1. PROFORMAS & COTIZACIONES
            </h4>
            <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
              Emisión de proformas oficiales, cálculo de márgenes y exportación PDF para clientes.
            </p>
          </button>

          {/* Action 2 */}
          <button
            type="button"
            onClick={() => onSelectWorkflowSection('invoices_dgii')}
            className="p-3.5 rounded-[3px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/40 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-7 h-7 rounded-[2px] bg-emerald-500 text-black flex items-center justify-center font-black">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors uppercase">
              2. FACTURACIÓN NCF (B01/B02)
            </h4>
            <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
              Emisión de comprobantes fiscales DGII, desglose ITBIS 18% y retenciones de ley.
            </p>
          </button>

          {/* Action 3 */}
          <button
            type="button"
            onClick={() => onSelectWorkflowSection('dgii_reports')}
            className="p-3.5 rounded-[3px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-400/40 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-7 h-7 rounded-[2px] bg-amber-400/20 text-amber-400 border border-amber-400/30 flex items-center justify-center font-black">
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 transition-colors" />
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors uppercase">
              3. REPORTES DGII 606/607
            </h4>
            <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
              Formatos mensuales Norma 07-2018, exportación CSV oficial y conciliación fiscal IT-1.
            </p>
          </button>

          {/* Action 4 */}
          <button
            type="button"
            onClick={() => onSelectWorkflowSection('preventive_maintenance')}
            className="p-3.5 rounded-[3px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/40 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-7 h-7 rounded-[2px] bg-emerald-600 text-white flex items-center justify-center font-black">
                <HardHat className="w-3.5 h-3.5" />
              </div>
              <span className="px-1.5 py-0.5 rounded-[2px] bg-emerald-500/20 text-emerald-400 text-[9px] font-bold font-mono uppercase">
                {fleetNeedingService.length} ALERTAS
              </span>
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors uppercase">
              4. RADAR PREVENTIVO
            </h4>
            <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
              Monitoreo de intervalos 250h/500h/1000h, kits de filtros OEM y alertas WhatsApp a clientes.
            </p>
          </button>

          {/* Action 5 */}
          <button
            type="button"
            onClick={() => onSelectWorkflowSection('advances_ledger')}
            className="p-3.5 rounded-[3px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-sky-500/40 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-7 h-7 rounded-[2px] bg-sky-500 text-black flex items-center justify-center font-black">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-sky-400 transition-colors" />
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors uppercase">
              5. ANTICIPOS & BANCOS
            </h4>
            <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
              Transferencias y depósitos Banco Popular, BHD y Banreservas vinculados a proformas.
            </p>
          </button>

          {/* Action 6 */}
          <button
            type="button"
            onClick={() => onSelectWorkflowSection('patio_dispatch')}
            className="p-3.5 rounded-[3px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-400/40 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-7 h-7 rounded-[2px] bg-amber-600 text-white flex items-center justify-center font-black">
                <QrCode className="w-3.5 h-3.5" />
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 transition-colors" />
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors uppercase">
              6. PATIO KM 22 & GATE PASS
            </h4>
            <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
              Gate Pass con QR para garita, autorización de transporte en cama baja (Lowboy) y remisión.
            </p>
          </button>

          {/* Action 7 */}
          <button
            type="button"
            onClick={() => onSelectWorkflowSection('service_dispatch')}
            className="p-3.5 rounded-[3px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/40 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-7 h-7 rounded-[2px] bg-emerald-600 text-white flex items-center justify-center font-black">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors uppercase">
              7. DESPACHO WHATSAPP
            </h4>
            <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
              Ficha técnica, coordenadas GPS de la obra y repuestos requeridos a mecánicos en ruta.
            </p>
          </button>

          {/* Action 8 */}
          <button
            type="button"
            onClick={() => onSelectWorkflowSection('client_accounts')}
            className="p-3.5 rounded-[3px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-purple-500/40 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-7 h-7 rounded-[2px] bg-purple-600 text-white flex items-center justify-center font-black">
                <Users className="w-3.5 h-3.5" />
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-purple-400 transition-colors" />
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors uppercase">
              8. DIRECTORIO & RNC
            </h4>
            <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
              Clientes registrados, historial de compras, RNC fiscal y membresías TMD Pro-Member.
            </p>
          </button>
        </div>
      </div>

      {/* PENDING PROFORMA ACTION QUEUE */}
      <div className="bg-zinc-900 rounded-[5px] border border-zinc-800 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-zinc-800">
          <div>
            <h3 className="text-xs font-black text-white flex items-center gap-1.5 uppercase font-display">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>BANDEJA DE PROFORMAS PENDIENTES</span>
            </h3>
            <p className="text-[11px] text-zinc-400">Cotizaciones creadas recientemente que requieren contacto comercial</p>
          </div>
          <button
            type="button"
            onClick={() => onSelectWorkflowSection('sales_quotes')}
            className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer uppercase font-mono"
          >
            <span>VER TODAS ({quotes.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {pendingQuotes.length === 0 ? (
          <div className="p-6 text-center rounded-[3px] bg-zinc-950 border border-dashed border-zinc-800">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-zinc-200 uppercase">¡Bandeja al día!</p>
            <p className="text-[11px] text-zinc-500">No hay cotizaciones pendientes de revisión o seguimiento.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {pendingQuotes.slice(0, 5).map((q) => {
              const waUrl = getQuoteWhatsAppUrl(q, '8095601234');
              return (
                <div key={q.id} className="py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2 hover:bg-zinc-800/40 p-2 rounded-[3px] transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[2px] bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center font-mono font-bold text-xs">
                      #{q.quoteNumber?.slice(-4) || 'PRO'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white uppercase">
                          {q.clientName || 'Cliente TMD'}
                        </span>
                        {q.companyName && (
                          <span className="text-[10px] text-zinc-400 uppercase font-mono">({q.companyName})</span>
                        )}
                        <span className="px-1.5 py-0.2 rounded-[2px] text-[9px] font-black uppercase bg-amber-400/20 text-amber-400 border border-amber-400/30">
                          {q.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[10px] text-zinc-400 mt-0.5 font-mono">
                        <span className="uppercase">{q.itemsCount || 1} EQUIPO(S)</span>
                        <span>•</span>
                        <span className="font-mono font-bold text-white">
                          {formatMoney(q.total || 0)}
                        </span>
                        {q.createdAt && (
                          <>
                            <span>•</span>
                            <span>{new Date(q.createdAt).toLocaleDateString('es-DO')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                      type="button"
                      onClick={() => onExportQuotePdf(q)}
                      className="px-2.5 py-1 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors cursor-pointer uppercase"
                    >
                      PDF DGII
                    </button>
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-[2px] bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition-colors uppercase"
                      >
                        <Phone className="w-3 h-3" />
                        <span>WHATSAPP</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* YARD INVENTORY LOGS & QR SCAN FREQUENCY MODULE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recharts Scan Frequency Mini-Chart (Last 7 Days) */}
        <ScanFrequencyMiniChart
          onViewAllLogs={() => onSelectWorkflowSection('inventory_logs')}
          onOpenScanner={onOpenQrScanner}
        />

        {/* Recent Scans Component (Last 5 Logs from inventory_logs) */}
        <RecentScans
          limitCount={5}
          onViewAllLogs={() => onSelectWorkflowSection('inventory_logs')}
          onOpenScanner={onOpenQrScanner}
          onNavigateToItem={(type, id) => {
            onNavigate(type === 'machinery' ? `#/machinery?id=${id}` : `#/parts?id=${id}`);
          }}
        />
      </div>
    </div>
  );
};
