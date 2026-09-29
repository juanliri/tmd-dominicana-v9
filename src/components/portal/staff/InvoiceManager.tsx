import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  Plus, 
  Send, 
  Building2, 
  DollarSign, 
  CreditCard, 
  ShieldCheck, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { PortalQuote, Currency } from '../../../types';
import { USD_TO_DOP_RATE } from '../../../data/catalog';
import { getQuoteWhatsAppUrl } from '../../../utils/whatsappMessaging';

interface InvoiceManagerProps {
  quotes: PortalQuote[];
  currency: Currency;
  onOpenCreateQuote?: () => void;
  onOpenNcfModal?: (quote: PortalQuote) => void;
  onExportPdf?: (quote: PortalQuote) => void;
  onUpdateQuoteStatus?: (quoteId: string, status: PortalQuote['status']) => void;
}

export const InvoiceManager: React.FC<InvoiceManagerProps> = ({
  quotes,
  currency,
  onOpenCreateQuote,
  onOpenNcfModal,
  onExportPdf,
  onUpdateQuoteStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [ncfTypeFilter, setNcfTypeFilter] = useState<'all' | 'B01' | 'B02' | 'B14' | 'B15'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'advance' | 'pending'>('all');

  const formatPrice = (usd: number) => {
    if (currency === 'DOP') {
      return `RD$ ${(usd * USD_TO_DOP_RATE).toLocaleString('es-DO', { maximumFractionDigits: 0 })}`;
    }
    return `US$ ${usd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

  const filteredQuotes = quotes.filter((q) => {
    // NCF type filter
    if (ncfTypeFilter !== 'all') {
      if (ncfTypeFilter === 'B01' && !q.ncfType?.includes('B01') && !q.ncfNumber?.startsWith('B01')) return false;
      if (ncfTypeFilter === 'B02' && !q.ncfType?.includes('B02') && !q.ncfNumber?.startsWith('B02')) return false;
      if (ncfTypeFilter === 'B14' && !q.ncfType?.includes('B14') && !q.ncfNumber?.startsWith('B14')) return false;
      if (ncfTypeFilter === 'B15' && !q.ncfType?.includes('B15') && !q.ncfNumber?.startsWith('B15')) return false;
    }

    // Payment status filter
    if (paymentFilter !== 'all') {
      const isPaid = (q.downPaymentAmountUsd || 0) >= (q.total || 0);
      const hasAdvance = (q.downPaymentAmountUsd || 0) > 0 && !isPaid;
      const isPending = !q.downPaymentAmountUsd || q.downPaymentAmountUsd === 0;

      if (paymentFilter === 'paid' && !isPaid) return false;
      if (paymentFilter === 'advance' && !hasAdvance) return false;
      if (paymentFilter === 'pending' && !isPending) return false;
    }

    // Search query
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchClient = q.clientName?.toLowerCase().includes(term);
      const matchCompany = q.companyName?.toLowerCase().includes(term);
      const matchNcf = q.ncfNumber?.toLowerCase().includes(term);
      const matchRnc = q.rnc?.toLowerCase().includes(term);
      const matchQuote = q.quoteNumber?.toLowerCase().includes(term);
      return matchClient || matchCompany || matchNcf || matchRnc || matchQuote;
    }

    return true;
  });

  // Aggregated KPIs
  const totalBilledUsd = quotes.reduce((acc, q) => acc + (q.total || 0), 0);
  const totalItbisUsd = quotes.reduce((acc, q) => acc + (q.itbis || (q.total ? q.total * 0.18 / 1.18 : 0)), 0);
  const totalAdvancesCollectedUsd = quotes.reduce((acc, q) => acc + (q.downPaymentAmountUsd || 0), 0);
  const totalReceivableUsd = Math.max(0, totalBilledUsd - totalAdvancesCollectedUsd);

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* 1. FINANCIAL SUMMARY KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-[3px] bg-zinc-900 border border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] font-bold uppercase mb-1">
            <span>FACTURACIÓN TOTAL DGII</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-white font-mono">
            {formatPrice(totalBilledUsd)}
          </div>
          <span className="text-[10px] text-zinc-500 uppercase">{quotes.length} COMPROBANTES FISCALES</span>
        </div>

        <div className="p-3.5 rounded-[3px] bg-zinc-900 border border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] font-bold uppercase mb-1">
            <span>ITBIS 18% GENERADO</span>
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-amber-400 font-mono">
            {formatPrice(totalItbisUsd)}
          </div>
          <span className="text-[10px] text-zinc-500 uppercase">DECLARACIÓN MENSUAL 607</span>
        </div>

        <div className="p-3.5 rounded-[3px] bg-zinc-900 border border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] font-bold uppercase mb-1">
            <span>ANTICIPOS COBRADOS</span>
            <CreditCard className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-sky-400 font-mono">
            {formatPrice(totalAdvancesCollectedUsd)}
          </div>
          <span className="text-[10px] text-zinc-500 uppercase">POPULAR • BHD • RESERVAS</span>
        </div>

        <div className="p-3.5 rounded-[3px] bg-zinc-900 border border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] font-bold uppercase mb-1">
            <span>SALDO POR COBRAR</span>
            <Clock className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-rose-400 font-mono">
            {formatPrice(totalReceivableUsd)}
          </div>
          <span className="text-[10px] text-zinc-500 uppercase">PRE-ENTREGA EN PATIO KM 22</span>
        </div>
      </div>

      {/* 2. FILTER & TOOLBAR */}
      <div className="p-3 bg-zinc-900 rounded-[5px] border border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex-1 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por N° NCF, proforma, cliente, empresa o RNC..."
            className="w-full pl-9 pr-3 py-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-hidden focus:border-amber-400 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* NCF Type Select */}
          <select
            value={ncfTypeFilter}
            onChange={(e) => setNcfTypeFilter(e.target.value as any)}
            className="px-2.5 py-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-zinc-300 font-bold uppercase cursor-pointer text-xs"
          >
            <option value="all">TODOS LOS NCF</option>
            <option value="B01">B01 - CRÉDITO FISCAL</option>
            <option value="B02">B02 - CONSUMIDOR FINAL</option>
            <option value="B14">B14 - RÉGIMEN ESPECIAL</option>
            <option value="B15">B15 - GUBERNAMENTAL</option>
          </select>

          {/* Payment Status Select */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            className="px-2.5 py-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-zinc-300 font-bold uppercase cursor-pointer text-xs"
          >
            <option value="all">TODOS LOS PAGOS</option>
            <option value="paid">100% PAGADO</option>
            <option value="advance">ANTICIPO REGISTRADO</option>
            <option value="pending">PENDIENTE DE PAGO</option>
          </select>

          {onOpenCreateQuote && (
            <button
              type="button"
              onClick={onOpenCreateQuote}
              className="px-3.5 py-2 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black flex items-center gap-1.5 uppercase transition-all shadow-xs cursor-pointer text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>NUEVA FACTURA / PROFORMA</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. INVOICE TABLE */}
      <div className="rounded-[3px] border border-zinc-800 bg-zinc-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">COMPROBANTE (NCF)</th>
                <th className="p-3">CLIENTE / RNC</th>
                <th className="p-3">DESCRIPCIÓN</th>
                <th className="p-3 text-right">SUBTOTAL</th>
                <th className="p-3 text-right">ITBIS 18%</th>
                <th className="p-3 text-right">TOTAL</th>
                <th className="p-3 text-center">ESTADO COBRO</th>
                <th className="p-3 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 font-medium">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-500 font-sans">
                    No se encontraron facturas o proformas bajo los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((q) => {
                  const hasNcf = Boolean(q.ncfNumber);
                  const isPaid = (q.downPaymentAmountUsd || 0) >= (q.total || 0);
                  const hasAdvance = (q.downPaymentAmountUsd || 0) > 0 && !isPaid;
                  const itbisAmount = q.itbis || (q.total ? (q.total * 0.18) / 1.18 : 0);
                  const subtotalAmount = (q.total || 0) - itbisAmount;

                  return (
                    <tr key={q.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-3 whitespace-nowrap">
                        {hasNcf ? (
                          <div className="space-y-0.5">
                            <span className="font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-[2px] border border-amber-400/30">
                              {q.ncfNumber}
                            </span>
                            <span className="text-[10px] text-zinc-500 block uppercase pt-0.5">
                              {q.ncfType?.replace(/_/g, ' ') || 'NCF B01'}
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase block">
                              PENDIENTE NCF
                            </span>
                            {onOpenNcfModal && (
                              <button
                                type="button"
                                onClick={() => onOpenNcfModal(q)}
                                className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-amber-400/20 text-amber-400 border border-amber-400/40 hover:bg-amber-400 hover:text-black transition-colors cursor-pointer uppercase"
                              >
                                Emitir NCF
                              </button>
                            )}
                          </div>
                        )}
                        <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                          {q.quoteNumber || 'TMD-COT'}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-white font-sans uppercase">
                          {q.companyName || q.clientName || 'Cliente'}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono">
                          RNC: <strong className="text-zinc-300">{q.rnc || '1-31-45678-9'}</strong>
                        </div>
                      </td>

                      <td className="p-3 max-w-xs truncate text-zinc-300 font-sans">
                        {q.itemsSummary || 'Maquinaria pesada & repuestos genuinos OEM'}
                      </td>

                      <td className="p-3 text-right font-mono text-zinc-300">
                        {formatPrice(subtotalAmount)}
                      </td>

                      <td className="p-3 text-right font-mono text-amber-400">
                        {formatPrice(itbisAmount)}
                      </td>

                      <td className="p-3 text-right font-mono font-bold text-white">
                        {formatPrice(q.total || 0)}
                      </td>

                      <td className="p-3 text-center whitespace-nowrap">
                        {isPaid ? (
                          <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>100% Pagado</span>
                          </span>
                        ) : hasAdvance ? (
                          <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-black uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Anticipo {formatPrice(q.downPaymentAmountUsd || 0)}</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-black uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20 inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>Pendiente</span>
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-right whitespace-nowrap space-x-1">
                        {onExportPdf && (
                          <button
                            type="button"
                            onClick={() => onExportPdf(q)}
                            className="p-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                            title="Exportar PDF con Formato Fiscal DGII"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <a
                          href={getQuoteWhatsAppUrl(q)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex p-1.5 rounded-[2px] bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                          title="Enviar Desglose Fiscal por WhatsApp"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
