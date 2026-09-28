import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Phone, 
  FileText, 
  RefreshCw, 
  Building2, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface QuoteExpirationAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteId?: string;
  quoteDate?: string; // ISO date
  clientName?: string;
  machineOrItemsSummary?: string;
  totalUsd?: number;
  exchangeRate?: number;
}

export const QuoteExpirationAlertModal: React.FC<QuoteExpirationAlertModalProps> = ({
  isOpen,
  onClose,
  quoteId = 'TMD-COT-2026-8492',
  quoteDate = new Date().toISOString(),
  clientName = 'Cliente Comercial TMD',
  machineOrItemsSummary = 'LiuGong 922E HD (Excavadora 22T)',
  totalUsd = 145000,
  exchangeRate = 60.50
}) => {
  const [extensionDays, setExtensionDays] = useState<number>(0);
  const [extensionRequested, setExtensionRequested] = useState<boolean>(false);

  if (!isOpen) return null;

  const createdTime = new Date(quoteDate).getTime();
  // 15 days validity in ms
  const expirationTime = createdTime + (15 + extensionDays) * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const diffMs = expirationTime - now;

  const daysRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const hoursRemaining = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));

  const isExpired = diffMs <= 0;
  const isUrgent = daysRemaining <= 3 && !isExpired;

  const handleRequestExtension = () => {
    triggerHaptic('success');
    setExtensionDays((prev) => prev + 7);
    setExtensionRequested(true);
  };

  const whatsappMessage = encodeURIComponent(
    `Hola ${clientName}, le escribimos de TMD Dominicana respecto a su Proforma ${quoteId} (${machineOrItemsSummary}). Le recordamos que la validez del precio garantizado y la tasa oficial (RD$ ${exchangeRate.toFixed(2)}) vence en ${daysRemaining} días y ${hoursRemaining} horas. Si desea formalizar o extender el bloqueo de inventario en Km 22, favor contactarnos hoy.`
  );

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl p-5 sm:p-6 text-white font-mono space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-[2px] text-[10px] font-black uppercase ${
                isExpired
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : isUrgent
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}>
                {isExpired ? 'PROFORMA VENCIDA' : isUrgent ? 'VENCIMIENTO INMINENTE (MENOS DE 72H)' : 'PROFORMA VIGENTE (PRECIO GARANTIZADO)'}
              </span>
            </div>
            <h3 className="text-base font-black uppercase text-white font-display">
              CONTROL DE VIGENCIA DE COTIZACIÓN (15 DÍAS)
            </h3>
            <span className="text-[11px] text-zinc-400">
              Folio: <strong className="text-white">{quoteId}</strong> • Cliente: {clientName}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Countdown Clock */}
        <div className={`p-4 rounded-[4px] border text-center space-y-2 ${
          isExpired
            ? 'bg-rose-500/10 border-rose-500/30'
            : isUrgent
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-zinc-900 border-zinc-800'
        }`}>
          <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">
            TIEMPO RESTANTE DE VALIDEZ COMERCIAL:
          </span>

          {isExpired ? (
            <div className="text-xl font-black text-rose-400 uppercase font-display">
              VALIDEZ CADUCADA
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 text-white">
              <div className="bg-zinc-950 px-3 py-2 rounded-[3px] border border-zinc-800">
                <span className="text-2xl sm:text-3xl font-black text-amber-400 block font-mono">
                  {daysRemaining}
                </span>
                <span className="text-[9px] text-zinc-500 uppercase">DÍAS</span>
              </div>
              <span className="text-xl font-black text-zinc-600">:</span>
              <div className="bg-zinc-950 px-3 py-2 rounded-[3px] border border-zinc-800">
                <span className="text-2xl sm:text-3xl font-black text-amber-400 block font-mono">
                  {hoursRemaining}
                </span>
                <span className="text-[9px] text-zinc-500 uppercase">HORAS</span>
              </div>
            </div>
          )}

          <p className="text-[11px] text-zinc-400 font-sans leading-relaxed pt-1">
            {isExpired 
              ? 'Los precios de maquinaria y flete marítimo están sujetos a reconfirmación por fluctuación de tasa y combustible.'
              : `Precio congelado de US$ ${totalUsd.toLocaleString()} a tasa oficial de RD$ ${exchangeRate.toFixed(2)} por US$ 1.00.`}
          </p>
        </div>

        {/* Extension Banner */}
        {extensionRequested && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-[3px] flex items-center gap-2 text-xs text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Prórroga comercial autorizada: Se han agregado <strong className="text-white">+7 días adicionales</strong> a la validez de esta cotización.
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 text-xs pt-1">
          <a
            href={`https://wa.me/18095601234?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-[2px] bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
          >
            <Phone className="w-4 h-4" />
            <span>ENVIAR ALERTA DE VENCIMIENTO POR WHATSAPP</span>
          </a>

          {!extensionRequested && (
            <button
              type="button"
              onClick={handleRequestExtension}
              className="w-full py-2.5 px-4 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-400/30 font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>SOLICITAR PRÓRROGA COMERCIAL (+7 DÍAS)</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-4 rounded-[2px] bg-zinc-900 hover:bg-zinc-850 text-zinc-400 font-bold uppercase text-xs transition-colors cursor-pointer"
          >
            CERRAR GESTOR
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
