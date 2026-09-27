import React from 'react';
import { createPortal } from 'react-dom';
import { Crown, Sparkles, CheckCircle2, Copy, X } from 'lucide-react';
import { UserProfile } from '../../../types';

interface ProQrPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
  companyName: string;
  memberNumber: string;
  userProfile: UserProfile | null;
  tierInfo: {
    tier: string;
    partsDiscountPercent: number;
    textColor: string;
    badgeBorder: string;
  };
  onCopyCode: (text: string) => void;
}

export const ProQrPassModal: React.FC<ProQrPassModalProps> = ({
  isOpen,
  onClose,
  memberName,
  companyName,
  memberNumber,
  userProfile,
  tierInfo,
  onCopyCode
}) => {
  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-mono">
      <div className="bg-zinc-950 border border-amber-400/40 rounded-[5px] p-6 sm:p-8 max-w-sm w-full shadow-2xl relative text-center space-y-5">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-[2px] bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[2px] text-xs font-black font-display uppercase tracking-wider bg-amber-400 text-black shadow-md">
            <Crown className="w-3.5 h-3.5" />
            <span>Pase Digital TMD Pro</span>
          </div>
          <h3 className="text-xl font-black font-display uppercase tracking-tight text-white pt-2">
            {memberName}
          </h3>
          <p className="text-xs text-zinc-400">
            {companyName}
          </p>
          <div className="text-[11px] text-amber-400 font-mono pt-1">
            ID: <strong className="text-white">{memberNumber}</strong> {userProfile?.rnc ? `• RNC: ${userProfile.rnc}` : ''}
          </div>
        </div>

        {/* High-Contrast SVG QR Code Visual */}
        <div className="bg-white p-4 rounded-[3px] inline-block shadow-lg mx-auto border-4 border-amber-400/20">
          <svg
            className="w-44 h-44 mx-auto text-zinc-950"
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            {/* Outer corner square Top-Left */}
            <rect x="5" y="5" width="26" height="26" rx="2" fill="currentColor" />
            <rect x="9" y="9" width="18" height="18" rx="1" fill="white" />
            <rect x="13" y="13" width="10" height="10" rx="1" fill="currentColor" />

            {/* Outer corner square Top-Right */}
            <rect x="69" y="5" width="26" height="26" rx="2" fill="currentColor" />
            <rect x="73" y="9" width="18" height="18" rx="1" fill="white" />
            <rect x="77" y="13" width="10" height="10" rx="1" fill="currentColor" />

            {/* Outer corner square Bottom-Left */}
            <rect x="5" y="69" width="26" height="26" rx="2" fill="currentColor" />
            <rect x="9" y="73" width="18" height="18" rx="1" fill="white" />
            <rect x="13" y="77" width="10" height="10" rx="1" fill="currentColor" />

            {/* Dynamic Pattern Elements for authenticity */}
            <rect x="36" y="8" width="5" height="5" />
            <rect x="46" y="8" width="5" height="5" />
            <rect x="56" y="8" width="5" height="5" />
            <rect x="36" y="18" width="5" height="5" />
            <rect x="56" y="18" width="5" height="5" />
            <rect x="46" y="24" width="5" height="5" />

            {/* Center Data Matrix */}
            <rect x="38" y="38" width="24" height="24" rx="2" fill="#d97706" />
            <rect x="42" y="42" width="16" height="16" rx="1" fill="white" />
            <rect x="46" y="46" width="8" height="8" rx="1" fill="#d97706" />

            {/* Additional barcode dots */}
            <rect x="8" y="38" width="5" height="5" />
            <rect x="18" y="38" width="5" height="5" />
            <rect x="24" y="46" width="5" height="5" />
            <rect x="8" y="52" width="5" height="5" />
            <rect x="18" y="58" width="5" height="5" />

            <rect x="68" y="38" width="5" height="5" />
            <rect x="78" y="38" width="5" height="5" />
            <rect x="88" y="46" width="5" height="5" />
            <rect x="74" y="52" width="5" height="5" />
            <rect x="84" y="58" width="5" height="5" />

            <rect x="38" y="68" width="5" height="5" />
            <rect x="48" y="68" width="5" height="5" />
            <rect x="58" y="74" width="5" height="5" />
            <rect x="42" y="82" width="5" height="5" />
            <rect x="52" y="88" width="5" height="5" />
          </svg>
          <div className="text-[10px] font-mono text-zinc-600 font-bold mt-1">
            TMD-SCAN-VERIFIED-{memberNumber}
          </div>
        </div>

        {/* Counter instructions */}
        <div className="text-xs text-zinc-300 bg-zinc-900/80 p-3 rounded-[3px] border border-zinc-800 space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Beneficio Activo: -{tierInfo.partsDiscountPercent}% en Mostrador</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Muestre esta pantalla al despachador de almacén para aplicar su tarifa VIP directamente al comprobante fiscal B01.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => onCopyCode(`TMD-PRO-MEMBER:${memberNumber}:${memberName}`)}
            className="py-2.5 px-3 rounded-[2px] text-xs font-bold font-display uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copiar ID</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-3 rounded-[2px] text-xs font-black font-display uppercase tracking-wider bg-amber-400 hover:bg-amber-300 text-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Listo</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
