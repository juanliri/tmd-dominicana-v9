import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  Phone,
  MessageCircle,
  X,
  Sparkles,
  Link,
  ShieldCheck
} from 'lucide-react';

interface WhatsAppShortLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineOrQuoteName?: string;
  totalUsd?: number;
  quoteId?: string;
}

export const WhatsAppShortLinkModal: React.FC<WhatsAppShortLinkModalProps> = ({
  isOpen,
  onClose,
  machineOrQuoteName = 'LiuGong 922E HD Excavadora 22 Ton',
  totalUsd = 165000,
  quoteId = 'Q-84920'
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shortCode = quoteId.replace(/[^0-9]/g, '') || '84920';
  const shortUrl = `https://tmd.com.do/q/${shortCode}`;

  const messageText = `Estimado Colega / Dueño de Constructora,\n\n` +
    `Le comparto la proforma técnica oficial de *${machineOrQuoteName}* emitida por *TecnoMaquinarias Diesel S.R.L.*:\n\n` +
    `• Inversión Ref: US$ ${totalUsd.toLocaleString()} (Stock Km 22 Autopista Duarte)\n` +
    `• Garantía Oficial: 24 Meses / 4,000 Horas TMD Care\n` +
    `• Enlace directo con ficha técnica, planos y telemetría:\n` +
    `${shortUrl}\n\n` +
    `Atentamente,\nDivisión Comercial TMD Dominicana • (809) 560-1234`;

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(messageText)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl text-zinc-200 overflow-hidden font-mono flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[3px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-emerald-500 text-black uppercase tracking-wider">
                  ENLACE RÁPIDO EJECUTIVO
                </span>
                <span className="text-xs text-zinc-400 font-sans">
                  Compartir Proforma con Directivos
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-white mt-0.5">
                Generador de Enlace Corto WhatsApp
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

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Machine preview strip */}
          <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-[3px] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block font-bold">PROFORMA VINCULADA:</span>
              <span className="font-bold text-white text-xs">{machineOrQuoteName}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-500 uppercase block">VALOR ESTIMADO:</span>
              <span className="font-bold text-amber-400 font-mono text-xs">US$ {totalUsd.toLocaleString()}</span>
            </div>
          </div>

          {/* Short URL Box */}
          <div className="space-y-1.5">
            <label className="block text-zinc-400 text-[10px] uppercase font-bold">
              Enlace Corto Oficial TMD (Con Vista Previa Enriquecida):
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-2.5 bg-zinc-900 border border-zinc-800 rounded-[2px] text-amber-400 font-bold font-mono text-xs truncate flex items-center gap-2">
                <Link className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span>{shortUrl}</span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-2.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-300" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Message Preview Box */}
          <div className="space-y-1.5">
            <label className="block text-zinc-400 text-[10px] uppercase font-bold">
              Vista Previa del Mensaje para el Dueño de Constructora:
            </label>
            <div className="p-3.5 bg-zinc-900/90 border border-zinc-800 rounded-[3px] text-zinc-300 text-[11px] font-sans whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto">
              {messageText}
            </div>
          </div>

          {/* QR Code quick preview */}
          <div className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-[3px] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white p-1 rounded-[2px] flex items-center justify-center shrink-0">
                <QrCode className="w-10 h-10 text-black" />
              </div>
              <div>
                <span className="font-bold text-white block">Escaneo Inmediato en Pantalla</span>
                <span className="text-[10px] text-zinc-500 font-sans block">
                  Permite al cliente escanear con la cámara de su celular sin enviar mensaje previo.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-xs shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 uppercase cursor-pointer"
          >
            Cerrar
          </button>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 rounded-[2px] bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs transition-all cursor-pointer flex items-center gap-2 shadow-md"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Enviar por WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
