import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  X,
  Building2,
  User,
  Phone,
  Mail,
  Copy,
  Check,
  ExternalLink,
  HardHat,
  Eye,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { PortalQuote, Currency } from '../../types';
import { USD_TO_DOP_RATE } from '../../data/catalog';

export interface PeriodQuoteItem {
  id: string;
  quoteNumber: string;
  clientName: string;
  companyName: string;
  clientEmail: string;
  phone: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'in_review';
  currency: 'USD' | 'DOP';
  subtotal: number;
  itbis: number;
  total: number;
  itemsSummary: string;
  equipmentCategory: string;
  createdAt: string;
  isRealFirestore: boolean;
  notes?: string;
  location?: string;
}

interface PeriodQuotesDetailViewProps {
  periodKey: string; // YYYY-MM
  periodLabel: string; // E.g. "Sep 2026"
  currency: Currency;
  stats: {
    solicitudes: number;
    aprobadas: number;
    montoUsd: number;
    conversionRate: string;
  };
  quotesList: PeriodQuoteItem[];
  allPeriods: { key: string; label: string }[];
  onSelectPeriod: (key: string) => void;
  onClose: () => void;
  onNavigateToQuotes?: () => void;
}

export const PeriodQuotesDetailView: React.FC<PeriodQuotesDetailViewProps> = ({
  periodKey,
  periodLabel,
  currency,
  stats,
  quotesList,
  allPeriods,
  onSelectPeriod,
  onClose,
  onNavigateToQuotes
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'in_review' | 'submitted' | 'rejected'>('all');
  const [selectedQuoteForModal, setSelectedQuoteForModal] = useState<PeriodQuoteItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Helper to format currency
  const formatMoney = (amountUsd: number) => {
    if (currency === 'DOP') {
      const dop = amountUsd * USD_TO_DOP_RATE;
      return `RD$ ${dop.toLocaleString('es-DO', { maximumFractionDigits: 0 })}`;
    }
    return `$${amountUsd.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Find index for previous / next period navigation
  const currentPeriodIndex = allPeriods.findIndex(p => p.key === periodKey);
  const prevPeriod = currentPeriodIndex > 0 ? allPeriods[currentPeriodIndex - 1] : null;
  const nextPeriod = currentPeriodIndex < allPeriods.length - 1 ? allPeriods[currentPeriodIndex + 1] : null;

  // Filtered quotes based on search and status
  const filteredQuotes = useMemo(() => {
    return quotesList.filter(q => {
      // Status filter
      if (statusFilter === 'approved' && q.status !== 'approved') return false;
      if (statusFilter === 'in_review' && q.status !== 'in_review') return false;
      if (statusFilter === 'submitted' && q.status !== 'submitted' && q.status !== 'draft') return false;
      if (statusFilter === 'rejected' && q.status !== 'rejected') return false;

      // Search filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const numMatch = q.quoteNumber.toLowerCase().includes(term);
        const nameMatch = q.clientName.toLowerCase().includes(term);
        const compMatch = q.companyName.toLowerCase().includes(term);
        const itemsMatch = q.itemsSummary.toLowerCase().includes(term);
        const catMatch = q.equipmentCategory.toLowerCase().includes(term);
        return numMatch || nameMatch || compMatch || itemsMatch || catMatch;
      }
      return true;
    });
  }, [quotesList, statusFilter, searchTerm]);

  // Status counts
  const statusCounts = useMemo(() => {
    return {
      all: quotesList.length,
      approved: quotesList.filter(q => q.status === 'approved').length,
      in_review: quotesList.filter(q => q.status === 'in_review').length,
      submitted: quotesList.filter(q => q.status === 'submitted' || q.status === 'draft').length,
      rejected: quotesList.filter(q => q.status === 'rejected').length
    };
  }, [quotesList]);

  const handleCopyQuoteNum = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedId(num);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div 
      id="period-quotes-detail-section"
      className="bg-white dark:bg-zinc-900 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6 transition-all animate-fadeIn"
    >
      {/* HEADER WITH PERIOD TITLE & PERIOD NAVIGATOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-500 text-zinc-950 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Vista de Detalle Activa
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              Período: {periodKey}
            </span>
          </div>
          <h3 className="text-lg sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-amber-500 shrink-0" />
            Presupuestos y Proformas de {periodLabel}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Haga clic en cualquier otro punto de la gráfica de tendencias para alternar entre períodos
          </p>
        </div>

        {/* Period Navigation Controls & Close Button */}
        <div className="flex items-center gap-2 self-start md:self-center">
          {/* Quick Month Switcher Dropdown */}
          <select
            value={periodKey}
            onChange={(e) => onSelectPeriod(e.target.value)}
            className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-bold px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            {allPeriods.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>

          {/* Prev / Next Month Buttons */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-xl p-0.5 border border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => prevPeriod && onSelectPeriod(prevPeriod.key)}
              disabled={!prevPeriod}
              title={prevPeriod ? `Ir a ${prevPeriod.label}` : 'Primer período'}
              className="p-1.5 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => nextPeriod && onSelectPeriod(nextPeriod.key)}
              disabled={!nextPeriod}
              title={nextPeriod ? `Ir a ${nextPeriod.label}` : 'Último período'}
              className="p-1.5 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Close Detail View Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-500/15 hover:text-rose-500 text-zinc-500 transition-all border border-zinc-200 dark:border-zinc-700 cursor-pointer"
            title="Cerrar Vista de Detalle"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PERIOD SUMMARY KPI STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
            Total Solicitudes
          </span>
          <div className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mt-1">
            {stats.solicitudes}
          </div>
          <span className="text-[11px] text-zinc-400 mt-0.5 block">
            {periodLabel}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
            Aprobadas / Emitidas
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.aprobadas} <span className="text-xs font-bold font-mono">({stats.conversionRate}%)</span>
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5 block">
            Tasa de cierre en el mes
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/25">
          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
            Volumen Monetario ({currency})
          </span>
          <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {formatMoney(stats.montoUsd)}
          </div>
          <span className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5 block">
            Facturación y cotizaciones
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25">
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
            Promedio / Cotización
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {formatMoney(stats.solicitudes > 0 ? stats.montoUsd / stats.solicitudes : 0)}
          </div>
          <span className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5 block">
            Ticket promedio del mes
          </span>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, constructora, equipo (JCB, LiuGong, filtros) o número de cotización..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-zinc-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Todas ({statusCounts.all})
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
              statusFilter === 'approved'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Aprobadas ({statusCounts.approved})
          </button>
          <button
            onClick={() => setStatusFilter('in_review')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
              statusFilter === 'in_review'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20'
            }`}
          >
            <Clock className="w-3 h-3" />
            En Negociación ({statusCounts.in_review})
          </button>
          <button
            onClick={() => setStatusFilter('submitted')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
              statusFilter === 'submitted'
                ? 'bg-amber-500 text-zinc-950 font-black shadow-sm'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
            }`}
          >
            <Clock className="w-3 h-3" />
            Pendientes ({statusCounts.submitted})
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
              statusFilter === 'rejected'
                ? 'bg-zinc-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <XCircle className="w-3 h-3" />
            Rechazadas ({statusCounts.rejected})
          </button>
        </div>
      </div>

      {/* QUOTES LIST TABLE / CARDS */}
      <div className="space-y-3">
        {filteredQuotes.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/20">
            <FileText className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
              No se encontraron presupuestos en este período con los filtros aplicados.
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Pruebe cambiando el término de búsqueda o seleccionando otro estado.
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="mt-3 px-3 py-1.5 rounded-lg bg-amber-500 text-zinc-950 text-xs font-bold hover:bg-amber-400 cursor-pointer"
              >
                Restablecer Filtros
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredQuotes.map((q) => {
              const isApproved = q.status === 'approved';
              const isInReview = q.status === 'in_review';
              const isPending = q.status === 'submitted' || q.status === 'draft';
              const isRejected = q.status === 'rejected';

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border transition-all hover:shadow-md ${
                    isApproved
                      ? 'bg-white dark:bg-zinc-900 border-emerald-500/30 hover:border-emerald-500'
                      : isInReview
                      ? 'bg-white dark:bg-zinc-900 border-blue-500/30 hover:border-blue-500'
                      : isPending
                      ? 'bg-white dark:bg-zinc-900 border-amber-500/30 hover:border-amber-500'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* Left: Identifier, Client and Equipment */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Quote Number with copy button */}
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs font-black text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700">
                            {q.quoteNumber}
                          </span>
                          <button
                            onClick={() => handleCopyQuoteNum(q.quoteNumber)}
                            className="p-1 text-zinc-400 hover:text-amber-500 transition-colors"
                            title="Copiar número de cotización"
                          >
                            {copiedId === q.quoteNumber ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 ${
                            isApproved
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : isInReview
                              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                              : isPending
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              : 'bg-zinc-500/15 text-zinc-500 border border-zinc-500/30'
                          }`}
                        >
                          {isApproved && <CheckCircle2 className="w-2.5 h-2.5" />}
                          {isInReview && <Clock className="w-2.5 h-2.5" />}
                          {isPending && <Clock className="w-2.5 h-2.5" />}
                          {isRejected && <XCircle className="w-2.5 h-2.5" />}
                          {isApproved
                            ? 'Aprobada'
                            : isInReview
                            ? 'En Negociación'
                            : isPending
                            ? 'Pendiente'
                            : 'Rechazada'}
                        </span>

                        {/* Real vs Period Benchmark Badge */}
                        {q.isRealFirestore ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            En Vivo ERP Cloud
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                            Registro Histórico TMD
                          </span>
                        )}

                        <span className="text-[11px] text-zinc-400">
                          {q.createdAt}
                        </span>
                      </div>

                      {/* Client and Company */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-extrabold text-zinc-900 dark:text-white flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-amber-500" />
                          {q.companyName}
                        </span>
                        <span className="text-zinc-400">•</span>
                        <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                          {q.clientName}
                        </span>
                        {q.location && (
                          <>
                            <span className="text-zinc-400">•</span>
                            <span className="text-zinc-500 text-[11px]">{q.location}</span>
                          </>
                        )}
                      </div>

                      {/* Items and Machinery Description */}
                      <div className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-1.5 pt-0.5">
                        <HardHat className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {q.itemsSummary}
                        </span>
                      </div>
                    </div>

                    {/* Right: Amounts and Action Buttons */}
                    <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-100 dark:border-zinc-800">
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                          Monto Proforma
                        </span>
                        <div className="text-base sm:text-lg font-black text-zinc-900 dark:text-white font-mono">
                          {formatMoney(q.total)}
                        </div>
                        <span className="text-[10px] text-zinc-500 block">
                          Incluye ITBIS 18%
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedQuoteForModal(q)}
                          className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-500/15 hover:text-amber-600 dark:hover:text-amber-400 text-zinc-700 dark:text-zinc-300 text-xs font-bold border border-zinc-200 dark:border-zinc-700 transition-all flex items-center gap-1 cursor-pointer"
                          title="Ver desglose de la proforma"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-500" />
                          <span>Ver Detalle</span>
                        </button>

                        {onNavigateToQuotes && (
                          <button
                            onClick={onNavigateToQuotes}
                            className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer"
                            title="Gestionar en Pestaña de Cotizaciones"
                          >
                            <ExternalLink className="w-4 h-4 text-zinc-500" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 text-xs">
        <span className="text-zinc-500">
          Mostrando {filteredQuotes.length} de {quotesList.length} presupuestos correspondientes a {periodLabel}
        </span>
        <div className="flex items-center gap-2">
          {onNavigateToQuotes && (
            <button
              onClick={onNavigateToQuotes}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              Gestionar Todas las Cotizaciones en Panel
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs transition-all cursor-pointer"
          >
            Cerrar Detalle
          </button>
        </div>
      </div>

      {/* PROFORMA PREVIEW MODAL */}
      {selectedQuoteForModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 max-w-xl w-full p-6 shadow-2xl space-y-5 relative">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black text-amber-600 dark:text-amber-400">
                    {selectedQuoteForModal.quoteNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {selectedQuoteForModal.status.toUpperCase()}
                  </span>
                </div>
                <h4 className="text-lg font-black text-zinc-900 dark:text-white">
                  Proforma Oficial TMD Dominicana
                </h4>
                <p className="text-xs text-zinc-500">
                  Emitida para {selectedQuoteForModal.companyName} • {selectedQuoteForModal.createdAt}
                </p>
              </div>

              <button
                onClick={() => setSelectedQuoteForModal(null)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Info */}
            <div className="space-y-4 text-xs">
              {/* Client and Company Grid */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Empresa / Contratista
                  </span>
                  <span className="font-bold text-zinc-900 dark:text-white mt-0.5 block">
                    {selectedQuoteForModal.companyName}
                  </span>
                  <span className="text-zinc-500 block mt-0.5">
                    {selectedQuoteForModal.clientName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Contacto & Ubicación
                  </span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300 mt-0.5 block flex items-center gap-1">
                    <Phone className="w-3 h-3 text-amber-500" />
                    {selectedQuoteForModal.phone}
                  </span>
                  <span className="text-zinc-500 block mt-0.5 flex items-center gap-1 truncate">
                    <Mail className="w-3 h-3 text-amber-500" />
                    {selectedQuoteForModal.clientEmail}
                  </span>
                </div>
              </div>

              {/* Items Detail */}
              <div className="space-y-2">
                <span className="font-extrabold text-zinc-900 dark:text-white block">
                  Concepto y Especificación Técnica
                </span>
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                  <div className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <HardHat className="w-4 h-4 text-amber-500" />
                    {selectedQuoteForModal.itemsSummary}
                  </div>
                  {selectedQuoteForModal.notes && (
                    <p className="text-zinc-500 dark:text-zinc-400 italic text-[11px]">
                      "{selectedQuoteForModal.notes}"
                    </p>
                  )}
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 text-[11px] text-zinc-500 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Garantía TMD Oficial: 1 Año / 2,000 Horas
                    </span>
                    <span>•</span>
                    <span>Despacho: Almacén Km 22 Pedro Brand</span>
                  </div>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 font-mono">
                <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300">
                  <span>Subtotal Neto:</span>
                  <span>{formatMoney(selectedQuoteForModal.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300">
                  <span>ITBIS (18%):</span>
                  <span>{formatMoney(selectedQuoteForModal.itbis)}</span>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-amber-500/30 text-base font-black text-zinc-950 dark:text-amber-400">
                  <span>Total Proforma ({currency}):</span>
                  <span>{formatMoney(selectedQuoteForModal.total)}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => handleCopyQuoteNum(selectedQuoteForModal.quoteNumber)}
                className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedId === selectedQuoteForModal.quoteNumber ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Folio</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setSelectedQuoteForModal(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-black text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
