import React, { useState } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Check, 
  X, 
  AlertCircle, 
  Building2, 
  Hash, 
  Calendar, 
  DollarSign, 
  QrCode,
  Zap
} from 'lucide-react';
import { PortalQuote } from '../../../types';
import { USD_TO_DOP_RATE } from '../../../data/catalog';

interface NcfGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  quote: PortalQuote | null;
  onAssignNcf: (quoteId: string, ncfNumber: string, ncfType: string, rnc: string) => Promise<void> | void;
}

export const NcfGenerator: React.FC<NcfGeneratorProps> = ({
  isOpen,
  onClose,
  quote,
  onAssignNcf
}) => {
  if (!isOpen || !quote) return null;

  const [ncfType, setNcfType] = useState<'B01' | 'B02' | 'B14' | 'B15'>('B01');
  const [sequenceNumber, setSequenceNumber] = useState<string>(() => {
    // Random 8-digit sequence number mock for demo
    const randomSeq = Math.floor(10000000 + Math.random() * 90000000);
    return String(randomSeq);
  });
  const [rnc, setRnc] = useState<string>(quote.rnc || '1-31-45678-9');
  const [companyName, setCompanyName] = useState<string>(quote.companyName || quote.clientName || 'Constructora Nacional S.R.L.');
  const [itbisRate] = useState<number>(0.18);
  const [itbisRetention, setItbisRetention] = useState<number>(0); // 0%, 30%, 100%
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cleanRnc = rnc.replace(/\D/g, '');
  const isRncValid = cleanRnc.length === 9 || cleanRnc.length === 11;
  const fullNcf = `${ncfType}${sequenceNumber.padStart(8, '0')}`;

  const totalUsd = quote.total || 0;
  const itbisAmountUsd = totalUsd * itbisRate / (1 + itbisRate);
  const subtotalUsd = totalUsd - itbisAmountUsd;
  const retentionUsd = itbisAmountUsd * (itbisRetention / 100);
  const netPayableUsd = totalUsd - retentionUsd;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRncValid) {
      setErrorMsg('El RNC debe contener 9 dígitos (empresas) u 11 dígitos (cédula física).');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);
      await onAssignNcf(quote.id, fullNcf, `${ncfType}_CREDITO_FISCAL`, rnc);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al emitir NCF digital.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-mono text-xs">
      <div className="bg-zinc-950 border border-amber-500/40 rounded-[5px] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col text-white">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[3px] bg-amber-400 text-black flex items-center justify-center font-black shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-[2px] border border-amber-400/30">
                  DGII República Dominicana
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {quote.quoteNumber || 'TMD-COT'}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black uppercase text-white font-display mt-0.5 tracking-tight">
                Emisión de Comprobante Fiscal Digital (NCF)
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[80vh]">
          {errorMsg && (
            <div className="p-3 rounded-[3px] bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Sequence Generation Box */}
          <div className="p-4 rounded-[3px] bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold text-zinc-400">
                Secuencia Fiscal Autorizada por DGII
              </span>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Válida hasta 31/12/2026</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Tipo de NCF</label>
                <select
                  value={ncfType}
                  onChange={(e) => setNcfType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-amber-400 font-black cursor-pointer text-xs"
                >
                  <option value="B01">B01 - Crédito Fiscal</option>
                  <option value="B02">B02 - Consumidor Final</option>
                  <option value="B14">B14 - Régimen Especial</option>
                  <option value="B15">B15 - Gubernamental</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Número de Comprobante Completo</label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={fullNcf}
                    className="w-full px-3 py-2 rounded-[2px] bg-zinc-950 border border-amber-500/40 text-amber-400 font-black font-mono text-sm tracking-widest focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const rand = Math.floor(10000000 + Math.random() * 90000000);
                      setSequenceNumber(String(rand));
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] px-2 py-0.5 rounded-[2px] bg-zinc-800 text-zinc-300 hover:text-white uppercase font-bold cursor-pointer"
                  >
                    Generar Nuevo
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Client Fiscal Identity */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs uppercase text-zinc-300 flex items-center gap-1.5 font-display">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Datos Fiscales del Contribuyente Receptor</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">
                  RNC o Cédula *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={rnc}
                    onChange={(e) => setRnc(e.target.value)}
                    placeholder="1-31-45678-9"
                    className={`w-full px-3 py-2 rounded-[2px] bg-zinc-900 border text-xs font-mono font-bold focus:outline-hidden ${
                      isRncValid ? 'border-emerald-500/50 text-white' : 'border-rose-500/50 text-rose-300'
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isRncValid ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <span className="text-[10px] text-rose-400 font-bold">9 u 11 dígitos</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">
                  Razón Social / Nombre Comercial *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-[2px] bg-zinc-900 border border-zinc-800 text-xs font-bold text-white focus:outline-hidden font-sans"
                />
              </div>
            </div>
          </div>

          {/* Financial Breakdown & ITBIS */}
          <div className="p-4 rounded-[3px] bg-zinc-900 border border-zinc-800 space-y-2.5">
            <h4 className="font-bold text-xs uppercase text-zinc-300 font-display">
              Desglose Fiscal (Tasa USD/DOP: {USD_TO_DOP_RATE})
            </h4>

            <div className="space-y-1.5 pt-1 text-xs">
              <div className="flex justify-between items-center text-zinc-400">
                <span>Subtotal Gravado (18%):</span>
                <span className="font-mono text-zinc-200">
                  US$ {subtotalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (RD$ {(subtotalUsd * USD_TO_DOP_RATE).toLocaleString('es-DO', { maximumFractionDigits: 0 })})
                </span>
              </div>

              <div className="flex justify-between items-center text-zinc-400">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <span>ITBIS Liquidado (18%):</span>
                </span>
                <span className="font-mono text-amber-400 font-bold">
                  +US$ {itbisAmountUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (RD$ {(itbisAmountUsd * USD_TO_DOP_RATE).toLocaleString('es-DO', { maximumFractionDigits: 0 })})
                </span>
              </div>

              {/* Retención ITBIS selector */}
              <div className="flex justify-between items-center pt-1 border-t border-zinc-800 text-zinc-400">
                <div className="flex items-center gap-2">
                  <span>Retención ITBIS:</span>
                  <select
                    value={itbisRetention}
                    onChange={(e) => setItbisRetention(Number(e.target.value))}
                    className="px-2 py-0.5 rounded-[2px] bg-zinc-950 border border-zinc-700 text-[10px] text-zinc-300"
                  >
                    <option value={0}>0% (Sin Retención)</option>
                    <option value={30}>30% (Bienes / Empresas)</option>
                    <option value={100}>100% (Servicios / Estado)</option>
                  </select>
                </div>
                {retentionUsd > 0 && (
                  <span className="font-mono text-rose-400 font-bold">
                    -US$ {retentionUsd.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-zinc-800 font-bold text-sm">
                <span className="text-white">Total Factura Fiscal:</span>
                <span className="font-mono text-emerald-400 text-base">
                  US$ {netPayableUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer uppercase font-bold text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !isRncValid}
              className="px-4 py-2 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 text-xs"
            >
              <Zap className="w-3.5 h-3.5 fill-black" />
              <span>{saving ? 'Emitiendo...' : 'Asignar & Emitir NCF'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
