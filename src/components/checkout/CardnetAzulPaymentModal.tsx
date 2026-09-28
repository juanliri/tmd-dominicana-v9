import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Building2, 
  Smartphone, 
  KeyRound, 
  AlertCircle, 
  RefreshCw,
  Check,
  FileText
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface CardnetAzulPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalUsd: number;
  totalDop: number;
  currency: 'USD' | 'DOP';
  clientName: string;
  clientRnc?: string;
  onPaymentSuccess: (authData: CardPaymentResult) => void;
}

export interface CardPaymentResult {
  gateway: 'cardnet' | 'azul';
  authorizationCode: string;
  cardBrand: 'visa' | 'mastercard' | 'amex';
  last4: string;
  cardholderName: string;
  timestamp: string;
  ncfReference?: string;
}

export const CardnetAzulPaymentModal: React.FC<CardnetAzulPaymentModalProps> = ({
  isOpen,
  onClose,
  totalUsd,
  totalDop,
  currency,
  clientName,
  clientRnc,
  onPaymentSuccess
}) => {
  const [gateway, setGateway] = useState<'cardnet' | 'azul'>('cardnet');
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState(clientName || '');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [step, setStep] = useState<'input' | '3ds_challenge' | 'success'>('input');
  const [otpCode, setOtpCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [authResult, setAuthResult] = useState<CardPaymentResult | null>(null);

  if (!isOpen) return null;

  // Format Card Number
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format Expiry MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setExpiry(raw);
  };

  const getCardBrand = (num: string): 'visa' | 'mastercard' | 'amex' => {
    const cleaned = num.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'visa';
    if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    return 'visa';
  };

  const currentBrand = getCardBrand(cardNumber);

  const handleSubmitCard = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('selection');
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      // Trigger 3D Secure Dominican banking simulation
      setStep('3ds_challenge');
    }, 1200);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');
    setIsProcessing(true);

    setTimeout(() => {
      const auth: CardPaymentResult = {
        gateway,
        authorizationCode: `${gateway.toUpperCase()}-AUTH-${Math.floor(100000 + Math.random() * 900000)}`,
        cardBrand: currentBrand,
        last4: cardNumber.replace(/\s/g, '').slice(-4) || '8842',
        cardholderName: cardholderName.toUpperCase(),
        timestamp: new Date().toISOString(),
        ncfReference: clientRnc ? `B01000${Math.floor(100000 + Math.random() * 900000)}` : 'B02000849201'
      };

      setAuthResult(auth);
      setStep('success');
      setIsProcessing(false);
      onPaymentSuccess(auth);
    }, 1500);
  };

  const displayAmount = currency === 'DOP'
    ? `RD$ ${totalDop.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `US$ ${totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
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
              <span className="px-2 py-0.5 rounded-[2px] bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase">
                PASARELA CORPORATIVA • ENCRIPTACIÓN SSL 256-BIT
              </span>
            </div>
            <h3 className="text-base font-black uppercase text-white font-display">
              PAGO CON TARJETA CORPORATIVA (REPUESTOS)
            </h3>
            <span className="text-[11px] text-zinc-400">
              Certificado Cardnet / Azul para pedidos express
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Card Details Input */}
        {step === 'input' && (
          <form onSubmit={handleSubmitCard} className="space-y-4 text-xs">
            {/* Gateway Toggle: Cardnet vs Azul */}
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1.5">
                PROCESADOR BANCARIO DOMINICANO:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGateway('cardnet')}
                  className={`p-2.5 rounded-[2px] border text-left transition-all cursor-pointer ${
                    gateway === 'cardnet'
                      ? 'bg-amber-500/10 border-amber-400 text-white ring-1 ring-amber-400/40'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="text-[11px] font-black uppercase block text-white">CARDNET</span>
                  <span className="text-[9px] text-zinc-400 block mt-0.5">Consorcio Tarjetas Dominicanas</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGateway('azul')}
                  className={`p-2.5 rounded-[2px] border text-left transition-all cursor-pointer ${
                    gateway === 'azul'
                      ? 'bg-amber-500/10 border-amber-400 text-white ring-1 ring-amber-400/40'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="text-[11px] font-black uppercase block text-white">AZUL</span>
                  <span className="text-[9px] text-zinc-400 block mt-0.5">Servicios Digitales Banco Popular</span>
                </button>
              </div>
            </div>

            {/* Total to Charge Callout */}
            <div className="p-3 rounded-[3px] bg-zinc-900 border border-zinc-800 flex items-center justify-between">
              <span className="text-[11px] text-zinc-400 uppercase">MONTO A COBRAR EN LÍNEA:</span>
              <span className="text-base font-black text-amber-400 font-mono">
                {displayAmount}
              </span>
            </div>

            {/* Cardholder Name */}
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                NOMBRE EN LA TARJETA / EMPRESA:
              </label>
              <input
                type="text"
                required
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="CONSORCIO VIAL METROPOLITANO SRL"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-[2px] p-2.5 text-white uppercase focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Card Number */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">
                  NÚMERO DE TARJETA CORPORATIVA:
                </label>
                <span className="text-[10px] font-black uppercase text-amber-400">
                  {currentBrand.toUpperCase()}
                </span>
              </div>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="4000 1234 5678 9010"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-[2px] pl-9 pr-3 py-2.5 text-white font-mono font-bold tracking-wider focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Expiry & CVV */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                  VENCIMIENTO (MM/AA):
                </label>
                <input
                  type="text"
                  required
                  value={expiry}
                  onChange={handleExpiryChange}
                  placeholder="12/28"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-[2px] p-2.5 text-white font-mono text-center font-bold focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">
                    CÓDIGO CVV / CVC:
                  </label>
                  <Lock className="w-3 h-3 text-zinc-500" />
                </div>
                <input
                  type="password"
                  required
                  maxLength={4}
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                  placeholder="123"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-[2px] p-2.5 text-white font-mono text-center font-bold focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Trust badge */}
            <div className="p-2.5 rounded-[2px] bg-zinc-900/60 border border-zinc-800 flex items-center gap-2 text-[10px] text-zinc-400">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Conexión cifrada directa con Cardnet Dominicana y Red de Bancos Locales. TMD no almacena los datos de su tarjeta.</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing || cardNumber.replace(/\s/g, '').length < 15 || !expiry || !cvv}
              className="w-full py-3 px-4 rounded-[2px] bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-black uppercase tracking-wider text-xs transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>CONECTANDO CON BANCO EMISOR...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>CONTINUAR A VALIDACIÓN 3D-SECURE ({displayAmount})</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: 3D Secure Dominican Bank Challenge */}
        {step === '3ds_challenge' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs animate-in fade-in">
            <div className="p-4 rounded-[3px] bg-blue-500/10 border border-blue-500/30 text-blue-300 space-y-2">
              <div className="flex items-center gap-2 font-bold uppercase text-[11px] text-white">
                <Smartphone className="w-4 h-4 text-blue-400" />
                <span>AUTENTICACIÓN 3D-SECURE 2.0 • BANCO POPULAR / BHD</span>
              </div>
              <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                Hemos enviado un código de seguridad de 6 dígitos vía SMS al teléfono registrado en su tarjeta terminada en <strong className="text-white">{cardNumber.slice(-4) || '8842'}</strong>.
              </p>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                INGRESE CÓDIGO DE AUTORIZACIÓN SMS (TOKEN DE UN SOLO USO):
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="849201"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-[2px] pl-9 pr-3 py-3 text-white font-mono text-center text-lg font-black tracking-widest focus:border-amber-400 focus:outline-none"
                />
              </div>
              <span className="text-[9px] text-zinc-500 block mt-1 text-center font-sans">
                Código de simulación pre-aprobado: Digite cualquier número de 6 dígitos (ej: 849201)
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="py-2.5 px-4 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold uppercase text-xs transition-colors cursor-pointer"
              >
                MODIFICAR DATOS
              </button>

              <button
                type="submit"
                disabled={isProcessing || otpCode.length < 4}
                className="flex-1 py-3 px-4 rounded-[2px] bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-black font-black uppercase tracking-wider text-xs transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AUTORIZANDO CARGO...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>VERIFICAR & AUTORIZAR PAGO</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Payment Approved Voucher */}
        {step === 'success' && authResult && (
          <div className="space-y-4 text-xs animate-in zoom-in-95">
            <div className="p-4 rounded-[3px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-sm sm:text-base font-black uppercase text-white font-display">
                ¡TRANSACCIÓN APROBADA EXITOSAMENTE!
              </h4>
              <p className="text-[11px] text-zinc-300 font-sans">
                El cargo por <strong className="text-white">{displayAmount}</strong> ha sido procesado por {authResult.gateway.toUpperCase()}.
              </p>
            </div>

            {/* Voucher Details */}
            <div className="p-3 bg-zinc-900 rounded-[2px] border border-zinc-800 space-y-2 font-mono text-[11px]">
              <div className="flex justify-between text-zinc-400">
                <span className="uppercase">CÓDIGO DE AUTORIZACIÓN:</span>
                <span className="text-amber-400 font-bold">{authResult.authorizationCode}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span className="uppercase">TARJETA PROCESADA:</span>
                <span className="text-white font-bold">{authResult.cardBrand.toUpperCase()} •••• {authResult.last4}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span className="uppercase">TITULAR:</span>
                <span className="text-white font-bold">{authResult.cardholderName}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span className="uppercase">COMPROBANTE DGII ASIGNADO:</span>
                <span className="text-emerald-400 font-bold">{authResult.ncfReference}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-4 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase tracking-wider text-xs transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <span>CONTINUAR A CONFIRMACIÓN DE ORDEN</span>
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
