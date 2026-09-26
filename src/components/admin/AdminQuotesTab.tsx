import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Eye, 
  Phone, 
  Mail, 
  Building2, 
  DollarSign, 
  Trash2, 
  AlertCircle,
  ExternalLink,
  MessageCircle,
  User,
  Calendar,
  X
} from 'lucide-react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { PortalQuote, Currency } from '../../types';
import { USD_TO_DOP_RATE } from '../../data/catalog';
import { sendQuoteStatusNotification } from '../../services/notificationService';

interface AdminQuotesTabProps {
  quotes: PortalQuote[];
  currency: Currency;
  onRefresh?: () => void;
}

export const AdminQuotesTab: React.FC<AdminQuotesTabProps> = ({
  quotes,
  currency
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_review' | 'approved' | 'rejected'>('all');
  const [selectedQuote, setSelectedQuote] = useState<PortalQuote | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const formatMoney = (amountUsd: number) => {
    if (currency === 'DOP') {
      const dop = amountUsd * USD_TO_DOP_RATE;
      return `RD$ ${dop.toLocaleString('es-DO', { maximumFractionDigits: 0 })}`;
    }
    return `$${amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const filteredQuotes = quotes.filter(q => {
    // Status filter
    if (statusFilter === 'pending' && q.status !== 'submitted' && q.status !== 'draft') return false;
    if (statusFilter === 'in_review' && q.status !== 'in_review') return false;
    if (statusFilter === 'approved' && q.status !== 'approved') return false;
    if (statusFilter === 'rejected' && q.status !== 'rejected') return false;

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const numMatch = q.quoteNumber?.toLowerCase().includes(term);
      const nameMatch = q.clientName?.toLowerCase().includes(term);
      const emailMatch = q.clientEmail?.toLowerCase().includes(term);
      const companyMatch = q.companyName?.toLowerCase().includes(term);
      const phoneMatch = q.phone?.includes(term);
      return numMatch || nameMatch || emailMatch || companyMatch || phoneMatch;
    }
    return true;
  });

  const handleUpdateStatus = async (quoteId: string, newStatus: PortalQuote['status']) => {
    try {
      setUpdatingId(quoteId);
      const quoteRef = doc(db, 'quotes', quoteId);
      await updateDoc(quoteRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      // Dispatch push and in-app real-time notification to the quote owner
      const targetQuote = quotes.find(q => q.id === quoteId);
      if (targetQuote) {
        await sendQuoteStatusNotification(targetQuote, newStatus);
      }

      setActionSuccess(`Presupuesto actualizado a: ${newStatus.toUpperCase()}`);
      setTimeout(() => setActionSuccess(null), 3000);
      if (selectedQuote && selectedQuote.id === quoteId) {
        setSelectedQuote(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.error("Error updating quote status:", err);
      handleFirestoreError(err, OperationType.UPDATE, `quotes/${quoteId}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    if (!window.confirm("¿Está seguro de eliminar esta cotización de Firestore permanentemente?")) {
      return;
    }
    try {
      setUpdatingId(quoteId);
      await deleteDoc(doc(db, 'quotes', quoteId));
      setActionSuccess("Cotización eliminada correctamente");
      setTimeout(() => setActionSuccess(null), 3000);
      if (selectedQuote?.id === quoteId) setSelectedQuote(null);
    } catch (err) {
      console.error("Error deleting quote:", err);
      handleFirestoreError(err, OperationType.DELETE, `quotes/${quoteId}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = quotes.filter(q => q.status === 'submitted' || q.status === 'draft').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {actionSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-amber-500 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Control Bar: Search & Status Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por # cotización, cliente, empresa, teléfono..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Status Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            Todas ({quotes.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'pending'
                ? 'bg-amber-500 text-black'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Pendientes ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('in_review')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === 'in_review'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20'
            }`}
          >
            En Revisión ({quotes.filter(q => q.status === 'in_review').length})
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === 'approved'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            Aprobadas ({quotes.filter(q => q.status === 'approved').length})
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === 'rejected'
                ? 'bg-red-600 text-white'
                : 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20'
            }`}
          >
            Rechazadas ({quotes.filter(q => q.status === 'rejected').length})
          </button>
        </div>
      </div>

      {/* Quotes List / Table */}
      {filteredQuotes.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <FileText className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <h3 className="font-extrabold text-zinc-900 dark:text-white">No se encontraron solicitudes</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            {searchTerm ? 'Pruebe con otros términos de búsqueda.' : 'No hay presupuestos bajo este filtro en Firestore.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuotes.map((quote) => {
            const isPending = quote.status === 'submitted' || quote.status === 'draft';
            const isApproved = quote.status === 'approved';
            const isInReview = quote.status === 'in_review';
            const isRejected = quote.status === 'rejected';

            return (
              <div
                key={quote.id}
                className={`p-5 rounded-2xl bg-white dark:bg-zinc-900 border transition-all shadow-sm ${
                  isPending 
                    ? 'border-amber-500/50 hover:border-amber-500 bg-amber-500/[0.02]' 
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-black text-sm text-zinc-900 dark:text-white">
                        {quote.quoteNumber || quote.id.slice(0, 8)}
                      </span>
                      {/* Status Badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold flex items-center gap-1 ${
                        isPending 
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                          : isInReview
                            ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30'
                            : isApproved
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border border-zinc-500/30'
                      }`}>
                        {isPending && <Clock className="w-3 h-3" />}
                        {isInReview && <Clock className="w-3 h-3" />}
                        {isApproved && <CheckCircle2 className="w-3 h-3" />}
                        {isRejected && <XCircle className="w-3 h-3" />}
                        {isPending ? 'Pendiente Aprobación' : isInReview ? 'En Negociación' : isApproved ? 'Aprobada' : 'Rechazada'}
                      </span>

                      <span className="text-xs text-zinc-400">
                        {new Date(quote.createdAt).toLocaleDateString('es-DO', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                      <span className="font-bold text-zinc-900 dark:text-zinc-200 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        {quote.clientName || 'Cliente Particular'}
                      </span>
                      {quote.companyName && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                          {quote.companyName}
                        </span>
                      )}
                      {quote.phone && (
                        <a 
                          href={`tel:${quote.phone}`} 
                          className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {quote.phone}
                        </a>
                      )}
                      {quote.clientEmail && (
                        <span className="flex items-center gap-1 text-zinc-500">
                          <Mail className="w-3.5 h-3.5" />
                          {quote.clientEmail}
                        </span>
                      )}
                    </div>

                    {/* Summary excerpt */}
                    {quote.itemsSummary && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 italic line-clamp-1 mt-1">
                        Items: {quote.itemsSummary}
                      </p>
                    )}
                  </div>

                  {/* Financial Total & Fast Actions */}
                  <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-100 dark:border-zinc-800">
                    <div className="text-left lg:text-right pr-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block tracking-wider">Monto Total</span>
                      <span className="font-mono font-black text-lg text-zinc-900 dark:text-white block">
                        {formatMoney(quote.total)}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {quote.itemsCount || 1} ítems • ITBIS incl.
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedQuote(quote)}
                        className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors"
                        title="Ver detalle completo"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {isPending && (
                        <>
                          <button
                            disabled={updatingId === quote.id}
                            onClick={() => handleUpdateStatus(quote.id, 'approved')}
                            className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs transition-colors flex items-center gap-1"
                            title="Aprobar Presupuesto"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Aprobar</span>
                          </button>
                          <button
                            disabled={updatingId === quote.id}
                            onClick={() => handleUpdateStatus(quote.id, 'in_review')}
                            className="px-3 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-xs transition-colors"
                            title="Poner En Revisión"
                          >
                            Revisar
                          </button>
                        </>
                      )}

                      {isInReview && (
                        <button
                          disabled={updatingId === quote.id}
                          onClick={() => handleUpdateStatus(quote.id, 'approved')}
                          className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Aprobar</span>
                        </button>
                      )}

                      {!isRejected && (
                        <button
                          disabled={updatingId === quote.id}
                          onClick={() => handleUpdateStatus(quote.id, 'rejected')}
                          className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Rechazar presupuesto"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        disabled={updatingId === quote.id}
                        onClick={() => handleDeleteQuote(quote.id)}
                        className="p-2 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Eliminar de Firestore"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div>
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block">
                  Detalle de Solicitud de Presupuesto
                </span>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                  Cotización {selectedQuote.quoteNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Client Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 text-xs">
              <div>
                <span className="text-zinc-400 block">Cliente Solicitante</span>
                <span className="font-extrabold text-zinc-900 dark:text-white text-sm block mt-0.5">
                  {selectedQuote.clientName}
                </span>
                {selectedQuote.companyName && (
                  <span className="text-zinc-600 dark:text-zinc-300 font-medium block">
                    {selectedQuote.companyName}
                  </span>
                )}
              </div>
              <div>
                <span className="text-zinc-400 block">Contacto Directo</span>
                <div className="flex items-center gap-3 mt-1">
                  {selectedQuote.phone && (
                    <a
                      href={`https://wa.me/1${selectedQuote.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg hover:bg-emerald-500/20"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      WhatsApp
                    </a>
                  )}
                  {selectedQuote.clientEmail && (
                    <a
                      href={`mailto:${selectedQuote.clientEmail}`}
                      className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg hover:bg-blue-500/20"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Email
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Summary description of items */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Resumen de Equipos y Repuestos</h4>
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                {selectedQuote.itemsSummary || 'Detalle no especificado.'}
              </div>
            </div>

            {/* Client Notes */}
            {selectedQuote.notes && (
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Instrucciones o Notas del Cliente</h4>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
                  {selectedQuote.notes}
                </div>
              </div>
            )}

            {/* Financial Totals */}
            <div className="p-4 rounded-2xl bg-zinc-900 text-white space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal Estimado</span>
                <span className="font-mono">{formatMoney(selectedQuote.subtotal || selectedQuote.total / 1.18)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>ITBIS Ley 18%</span>
                <span className="font-mono">{formatMoney(selectedQuote.itbis || selectedQuote.total - (selectedQuote.total / 1.18))}</span>
              </div>
              <div className="flex justify-between text-base font-black text-amber-400 pt-2 border-t border-zinc-800">
                <span>Total Presupuestado</span>
                <span className="font-mono">{formatMoney(selectedQuote.total)}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              {selectedQuote.status !== 'approved' && (
                <button
                  onClick={() => handleUpdateStatus(selectedQuote.id, 'approved')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aprobar Presupuesto</span>
                </button>
              )}
              {selectedQuote.status !== 'in_review' && (
                <button
                  onClick={() => handleUpdateStatus(selectedQuote.id, 'in_review')}
                  className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-xs transition-colors"
                >
                  Poner en Negociación
                </button>
              )}
              <button
                onClick={() => setSelectedQuote(null)}
                className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-extrabold text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
