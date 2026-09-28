import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  ShieldCheck, 
  HelpCircle, 
  CheckCircle2, 
  Percent, 
  ArrowRight,
  Info,
  DollarSign,
  Copy,
  Check
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export type DgiiTaxRegime = 
  | 'REGULAR'              // Empresa Privada / Contribuyente General (B01)
  | 'ESTADO_B15'           // Proveedor del Estado / Obras Públicas (Ley 11-92 Art. 309: 5% ISR + 100% ITBIS retenido)
  | 'GRAN_CONTRIBUYENTE'   // Gran Contribuyente DGII (Norma General 02-05: 30% ITBIS retenido)
  | 'ZONA_FRANCA_B14';     // Régimen Especial / Exento de ITBIS (Ley 8-90 / Ley de Minería)

interface DgiiTaxWithholdingBreakdownProps {
  subtotalUsd: number;
  exchangeRate?: number;
  currency?: 'USD' | 'DOP';
  selectedRegime?: DgiiTaxRegime;
  onRegimeChange?: (regime: DgiiTaxRegime) => void;
  compact?: boolean;
}

export const DgiiTaxWithholdingBreakdown: React.FC<DgiiTaxWithholdingBreakdownProps> = ({
  subtotalUsd,
  exchangeRate = 60.50,
  currency = 'USD',
  selectedRegime: externalRegime,
  onRegimeChange,
  compact = false
}) => {
  const [internalRegime, setInternalRegime] = useState<DgiiTaxRegime>('REGULAR');
  const [copiedCertificate, setCopiedCertificate] = useState(false);

  const activeRegime = externalRegime || internalRegime;

  const handleSelectRegime = (regime: DgiiTaxRegime) => {
    triggerHaptic('selection');
    if (onRegimeChange) {
      onRegimeChange(regime);
    } else {
      setInternalRegime(regime);
    }
  };

  // Tax calculations according to DGII Dominican Republic Tax Code (Ley 11-92)
  const isTaxExempt = activeRegime === 'ZONA_FRANCA_B14';
  const itbisBilledUsd = isTaxExempt ? 0 : subtotalUsd * 0.18;
  const grossTotalUsd = subtotalUsd + itbisBilledUsd;

  let itbisWithholdingRate = 0;
  let isrWithholdingRate = 0;

  if (activeRegime === 'ESTADO_B15') {
    itbisWithholdingRate = 1.00; // 100% ITBIS retenido por el Estado Dominicano
    isrWithholdingRate = 0.05;   // 5% ISR proveedores del Estado (Ley 11-92 Art. 309)
  } else if (activeRegime === 'GRAN_CONTRIBUYENTE') {
    itbisWithholdingRate = 0.30; // 30% ITBIS retenido según Norma 02-05 DGII
    isrWithholdingRate = 0;      // En venta de bienes/repuestos no aplica retención ISR a personas jurídicas
  }

  const itbisWithheldUsd = itbisBilledUsd * itbisWithholdingRate;
  const isrWithheldUsd = subtotalUsd * isrWithholdingRate;
  const totalWithheldUsd = itbisWithheldUsd + isrWithheldUsd;
  const netReceivableUsd = grossTotalUsd - totalWithheldUsd;

  const formatAmount = (usd: number) => {
    if (currency === 'DOP') {
      const dop = usd * exchangeRate;
      return `RD$ ${dop.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `US$ ${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleCopyCertificateSummary = () => {
    triggerHaptic('success');
    const text = `TMD DOMINICANA • ESTIMACIÓN DE RETENCIONES FISCALES DGII
Régimen: ${activeRegime}
Subtotal Billeable: ${formatAmount(subtotalUsd)}
ITBIS Facturado (18%): ${formatAmount(itbisBilledUsd)}
Monto Bruto Factura: ${formatAmount(grossTotalUsd)}
Retención ITBIS (${(itbisWithholdingRate * 100).toFixed(0)}%): -${formatAmount(itbisWithheldUsd)}
Retención ISR (${(isrWithholdingRate * 100).toFixed(0)}%): -${formatAmount(isrWithheldUsd)}
Total Retenciones Tributarias: -${formatAmount(totalWithheldUsd)}
NETO A DESEMBOLSAR / PAGAR: ${formatAmount(netReceivableUsd)}
Tasa Oficial Estimada: RD$ ${exchangeRate.toFixed(2)} por US$ 1.00
Fundamento Legal: Código Tributario Rep. Dom. Ley 11-92 Art. 309 / Normas Generales DGII 02-05 & 07-2014.`;

    navigator.clipboard.writeText(text);
    setCopiedCertificate(true);
    setTimeout(() => setCopiedCertificate(false), 2500);
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-[3px] p-4 text-white font-mono space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-[2px] bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              DESGLOSE TRIBUTARIO DGII & RETENCIONES (REP. DOMINICANA)
            </h4>
            <span className="text-[10px] text-zinc-400">
              Ley 11-92 • Norma 02-05 • Comprobantes B01 / B15 / B14
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyCertificateSummary}
          className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-[2px] bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-amber-400 border border-zinc-800 transition-colors cursor-pointer self-start sm:self-auto"
          title="Copiar desglose tributario para contabilidad"
        >
          {copiedCertificate ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">COPIADO</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>COPIAR ESTIMACIÓN</span>
            </>
          )}
        </button>
      </div>

      {/* Regime Selector Buttons */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-zinc-400 uppercase block">
          SELECCIONE EL PERFIL TRIBUTARIO DEL COMPRADOR:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => handleSelectRegime('REGULAR')}
            className={`p-2.5 rounded-[2px] border text-left transition-all cursor-pointer ${
              activeRegime === 'REGULAR'
                ? 'border-amber-500 bg-amber-500/10 text-white ring-1 ring-amber-500/30'
                : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-900'
            }`}
          >
            <span className="text-[11px] font-black uppercase block text-white">EMPRESA PRIVADA</span>
            <span className="text-[9px] text-zinc-400 block mt-0.5">B01 Crédito Fiscal • Sin retenciones</span>
            <span className="text-[8px] text-amber-400/90 font-bold block mt-1">100% ITBIS al Proveedor</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectRegime('ESTADO_B15')}
            className={`p-2.5 rounded-[2px] border text-left transition-all cursor-pointer ${
              activeRegime === 'ESTADO_B15'
                ? 'border-amber-500 bg-amber-500/10 text-white ring-1 ring-amber-500/30'
                : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-900'
            }`}
          >
            <span className="text-[11px] font-black uppercase block text-white">PROVEEDOR DEL ESTADO</span>
            <span className="text-[9px] text-zinc-400 block mt-0.5">B15 Gubernamental • Obras Públicas</span>
            <span className="text-[8px] text-amber-400/90 font-bold block mt-1">Retiene 5% ISR + 100% ITBIS</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectRegime('GRAN_CONTRIBUYENTE')}
            className={`p-2.5 rounded-[2px] border text-left transition-all cursor-pointer ${
              activeRegime === 'GRAN_CONTRIBUYENTE'
                ? 'border-amber-500 bg-amber-500/10 text-white ring-1 ring-amber-500/30'
                : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-900'
            }`}
          >
            <span className="text-[11px] font-black uppercase block text-white">GRAN CONTRIBUYENTE</span>
            <span className="text-[9px] text-zinc-400 block mt-0.5">Norma DGII 02-05 • Bancos/Industrias</span>
            <span className="text-[8px] text-amber-400/90 font-bold block mt-1">Retiene 30% del ITBIS</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectRegime('ZONA_FRANCA_B14')}
            className={`p-2.5 rounded-[2px] border text-left transition-all cursor-pointer ${
              activeRegime === 'ZONA_FRANCA_B14'
                ? 'border-amber-500 bg-amber-500/10 text-white ring-1 ring-amber-500/30'
                : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-900'
            }`}
          >
            <span className="text-[11px] font-black uppercase block text-white">RÉGIMEN ESPECIAL / ZF</span>
            <span className="text-[9px] text-zinc-400 block mt-0.5">B14 Carnet Exención DGII</span>
            <span className="text-[8px] text-amber-400/90 font-bold block mt-1">0% ITBIS (Tasa Cero)</span>
          </button>
        </div>
      </div>

      {/* Breakdown Calculations Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2px] p-3 space-y-2 text-xs">
        <div className="flex justify-between items-center text-zinc-400">
          <span className="uppercase">SUBTOTAL BIENES / REPUESTOS:</span>
          <span className="text-white font-bold">{formatAmount(subtotalUsd)}</span>
        </div>

        <div className="flex justify-between items-center text-zinc-400">
          <span className="uppercase">
            ITBIS FACTURADO ({isTaxExempt ? 'EXENTO 0%' : '18% LEY TRIBUTARIA'}):
          </span>
          <span className={isTaxExempt ? 'text-emerald-400 font-bold' : 'text-white font-bold'}>
            {formatAmount(itbisBilledUsd)}
          </span>
        </div>

        <div className="flex justify-between items-center font-bold text-zinc-200 pt-1 border-t border-zinc-800/80">
          <span className="uppercase">MONTO TOTAL FACTURADO (BRUTO):</span>
          <span className="text-amber-400">{formatAmount(grossTotalUsd)}</span>
        </div>

        {/* Retentions Area */}
        {totalWithheldUsd > 0 && (
          <div className="pt-2 border-t border-zinc-800 space-y-1.5 text-red-400">
            <div className="flex items-center justify-between text-[11px]">
              <span className="uppercase flex items-center gap-1">
                <span>(-) RETENCIÓN ITBIS ({(itbisWithholdingRate * 100).toFixed(0)}%):</span>
                <span className="text-[9px] text-zinc-500">
                  {activeRegime === 'ESTADO_B15' ? '[Estado retiene 100%]' : '[Norma 02-05]'}
                </span>
              </span>
              <span className="font-bold">-{formatAmount(itbisWithheldUsd)}</span>
            </div>

            {isrWithheldUsd > 0 && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="uppercase flex items-center gap-1">
                  <span>(-) RETENCIÓN 5% ISR PROVEEDORES DEL ESTADO:</span>
                  <span className="text-[9px] text-zinc-500">[Art. 309 Ley 11-92]</span>
                </span>
                <span className="font-bold">-{formatAmount(isrWithheldUsd)}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] font-bold text-red-400/90 pt-1 border-t border-zinc-800/60">
              <span className="uppercase">TOTAL RETENCIONES APLICABLES:</span>
              <span>-{formatAmount(totalWithheldUsd)}</span>
            </div>
          </div>
        )}

        {/* Net Settlement */}
        <div className="pt-2.5 border-t border-zinc-800 flex justify-between items-baseline font-black">
          <div>
            <span className="text-xs uppercase text-emerald-400 block">
              NETO A DESEMBOLSAR / PAGAR POR EL CLIENTE:
            </span>
            <span className="text-[9px] text-zinc-500 uppercase font-sans font-normal">
              {totalWithheldUsd > 0 
                ? 'El cliente entregará cheque/transferencia por este monto neto + cartas de retención DGII'
                : 'Monto total a transferir a TMD Dominicana SRL'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-sm sm:text-base text-emerald-400 block font-mono">
              {formatAmount(netReceivableUsd)}
            </span>
            {currency === 'USD' && (
              <span className="text-[10px] text-zinc-400 font-normal">
                ≈ RD$ {(netReceivableUsd * exchangeRate).toLocaleString('es-DO', { maximumFractionDigits: 2 })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* DGII Legal Footnote Badge */}
      <div className="p-2.5 rounded-[2px] bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-2 text-[10px] text-zinc-400 leading-relaxed font-sans">
        <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-zinc-300 uppercase font-mono">COMPROBANTE VÁLIDO PARA CRÉDITO FISCAL:</strong> TMD Dominicana S.R.L. (RNC 1-31-89024-5) emitirá el NCF correspondiente tras la confirmación de la orden. Para órdenes gubernamentales bajo la Ley 340-06 de Compras y Contrataciones Públicas, adjunte su orden de compra oficial para la emisión de NCF Serie B15.
        </div>
      </div>
    </div>
  );
};
