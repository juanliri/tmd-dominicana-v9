import React, { useState } from 'react';
import {
  QrCode,
  ShieldCheck,
  Download,
  Copy,
  Check,
  ExternalLink,
  FileText,
  Printer,
  X,
  Building2,
  Calendar,
  Lock
} from 'lucide-react';

interface DgiiElectronicInvoiceQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber?: string;
  eNcf?: string;
  rncBuyer?: string;
  buyerName?: string;
  totalDop?: number;
  totalUsd?: number;
}

export const DgiiElectronicInvoiceQrModal: React.FC<DgiiElectronicInvoiceQrModalProps> = ({
  isOpen,
  onClose,
  orderNumber = 'PRO-2026-8812',
  eNcf = 'E31000004921',
  rncBuyer = '1-01-02412-2',
  buyerName = 'CONSTRUCTORA MEJÍA ARCALÁ S.A.S.',
  totalDop = 8950000,
  totalUsd = 149166
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const rncIssuer = '1-01-84920-1'; // TMD Dominicana RNC
  const issuerName = 'TECNOMAQUINARIAS DIESEL S.R.L.';
  const securityCode = 'A89F4C';
  const issueDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const signatureTimestamp = new Date().toISOString();

  // Official DGII e-CF validation URL format according to Ley 32-23
  const cleanRncBuyer = rncBuyer.replace(/[^0-9]/g, '') || '000000000';
  const dgiiVerificationUrl = `https://ecf.dgii.gov.do/fe/consultatimbre?RncEmisor=101849201&RncComprador=${cleanRncBuyer}&eNCF=${eNcf}&MontoTotal=${Math.round(totalDop)}&CodigoSeguridad=${securityCode}&FechaEmision=${issueDate}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(dgiiVerificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl text-zinc-200 overflow-hidden font-mono flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[3px] bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-amber-400 text-black uppercase tracking-wider">
                  LEY 32-23 • e-CF
                </span>
                <span className="text-xs text-zinc-400 font-sans">
                  Facturación Electrónica República Dominicana
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-white mt-0.5">
                Código QR de Validación Fiscal DGII
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Fiscal Stamp Visual Card */}
          <div className="bg-white text-black p-5 rounded-[4px] shadow-lg border border-zinc-300 flex flex-col sm:flex-row items-center gap-5">
            {/* QR Code Matrix (Stylized Crisp SVG Representation) */}
            <div className="w-36 h-36 bg-black p-2 rounded-[3px] flex flex-col justify-between shrink-0 shadow-sm relative group">
              <div className="flex justify-between">
                <div className="w-9 h-9 border-4 border-white bg-black flex items-center justify-center">
                  <div className="w-3 h-3 bg-white" />
                </div>
                <div className="w-9 h-9 border-4 border-white bg-black flex items-center justify-center">
                  <div className="w-3 h-3 bg-white" />
                </div>
              </div>

              {/* Pseudo QR Data Grid pattern */}
              <div className="grid grid-cols-6 gap-1 my-1 px-1">
                <div className="h-1 bg-white col-span-2" />
                <div className="h-1 bg-white col-span-4" />
                <div className="h-1 bg-white col-span-3" />
                <div className="h-1 bg-white col-span-3" />
                <div className="h-1 bg-white col-span-5" />
                <div className="h-1 bg-white col-span-1" />
              </div>

              <div className="flex justify-between items-end">
                <div className="w-9 h-9 border-4 border-white bg-black flex items-center justify-center">
                  <div className="w-3 h-3 bg-white" />
                </div>
                <div className="text-[7px] text-zinc-300 font-mono font-bold tracking-tighter">
                  DGII e-CF
                </div>
              </div>
            </div>

            {/* Official e-CF Details */}
            <div className="space-y-1.5 flex-1 w-full text-[11px] font-mono leading-tight">
              <div className="border-b border-zinc-200 pb-1 flex justify-between items-center">
                <span className="font-black text-xs text-zinc-900 tracking-tight">TIMBRE FISCAL ELECTRÓNICO</span>
                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-[2px]">
                  VÁLIDO DGII
                </span>
              </div>

              <div className="text-zinc-600 text-[10px]">
                Emisor: <strong className="text-zinc-900">{issuerName}</strong>
              </div>
              <div className="text-zinc-600 text-[10px]">
                RNC Emisor: <strong className="text-zinc-900">{rncIssuer}</strong>
              </div>
              <div className="text-zinc-600 text-[10px]">
                e-NCF: <strong className="text-amber-800 font-bold">{eNcf}</strong>
              </div>
              <div className="text-zinc-600 text-[10px]">
                RNC Receptor: <strong className="text-zinc-900">{rncBuyer}</strong>
              </div>
              <div className="text-zinc-600 text-[10px]">
                Monto: <strong className="text-zinc-900">RD$ {totalDop.toLocaleString()}</strong> (US$ {totalUsd.toLocaleString()})
              </div>
              <div className="text-zinc-500 text-[9px] pt-1 border-t border-zinc-200">
                Código Seguridad: <span className="font-bold text-zinc-800">{securityCode}</span> • Fecha: {new Date().toLocaleDateString('es-DO')}
              </div>
            </div>
          </div>

          {/* Validation Link Box */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] p-3 space-y-1.5">
            <span className="text-[10px] text-zinc-400 uppercase font-mono block">
              URL Oficial de Consulta Pública de Timbre (DGII Portal):
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={dgiiVerificationUrl}
                className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-[10px] text-zinc-300 font-mono truncate select-all"
              />
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-[2px] text-[10px] font-bold uppercase transition-colors shrink-0 cursor-pointer flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-[3px] flex items-start gap-2.5 text-[11px] text-zinc-400 font-sans">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              Comprobante fiscal electrónico emitido bajo la Ley General No. 32-23 de Facturación Electrónica de la República Dominicana. Este código QR permite a la DGII y al comprador validar en tiempo real el crédito fiscal deducible de ITBIS.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 flex items-center gap-1.5 uppercase font-bold text-[11px] cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Imprimir Timbre</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-[11px] shadow-sm cursor-pointer"
          >
            Listo / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
