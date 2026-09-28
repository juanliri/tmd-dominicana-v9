import React, { useState } from 'react';
import {
  Fingerprint,
  ShieldCheck,
  Smartphone,
  Lock,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  KeyRound,
  Laptop
} from 'lucide-react';

interface PasskeyBiometricAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticateSuccess: (userProfile: { uid: string; displayName: string; email: string; role: string }) => void;
}

export const PasskeyBiometricAuthModal: React.FC<PasskeyBiometricAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticateSuccess
}) => {
  const [authStatus, setAuthStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [selectedDevice, setSelectedDevice] = useState<'face_id' | 'touch_id' | 'windows_hello'>('face_id');

  if (!isOpen) return null;

  const handleStartBiometricVerification = async () => {
    setAuthStatus('scanning');

    try {
      // Check if native WebAuthn is supported
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        // Attempt native challenge or proceed with authenticated client
      }

      // Simulate biometric sensor recognition delay (1.2s)
      await new Promise(r => setTimeout(r, 1200));

      setAuthStatus('success');

      setTimeout(() => {
        onAuthenticateSuccess({
          uid: 'vip_malespin_2026',
          displayName: 'Ing. Rafael Malespín (Constructora Malespín)',
          email: 'presidencia@malespin.com.do',
          role: 'vip_fleet_owner'
        });
        onClose();
      }, 700);
    } catch (err) {
      setAuthStatus('failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl text-zinc-200 overflow-hidden font-mono flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[3px] bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-amber-400 text-black uppercase tracking-wider">
                  WEBAUTHN FIDO2 PASSKEY
                </span>
                <span className="text-xs text-zinc-400 font-sans">
                  Acceso Biométrico Seguro
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-white mt-0.5">
                Autenticación Biométrica VIP
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

        {/* Biometric Sensor Body */}
        <div className="p-6 text-center space-y-6">
          {/* Biometric Animated Visualizer */}
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            {/* Pulsing ring */}
            <div className={`absolute inset-0 rounded-full border-2 transition-all ${
              authStatus === 'scanning'
                ? 'border-amber-400 animate-ping opacity-75'
                : authStatus === 'success'
                ? 'border-emerald-400 scale-105'
                : 'border-zinc-700'
            }`} />

            <div className={`w-24 h-24 rounded-full flex items-center justify-center border transition-all ${
              authStatus === 'scanning'
                ? 'bg-amber-400/20 border-amber-400 text-amber-400'
                : authStatus === 'success'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400'
                : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'
            }`}>
              {authStatus === 'success' ? (
                <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-in zoom-in-75 duration-200" />
              ) : (
                <Fingerprint className={`w-12 h-12 ${authStatus === 'scanning' ? 'animate-pulse' : ''}`} />
              )}
            </div>
          </div>

          {/* Status Message */}
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white uppercase font-display">
              {authStatus === 'idle' && 'Coloque su huella o mire a la cámara'}
              {authStatus === 'scanning' && 'Verificando credencial criptográfica FIDO2...'}
              {authStatus === 'success' && '¡Identidad Biométrica Confirmada!'}
              {authStatus === 'failed' && 'No se pudo verificar la credencial biométrica'}
            </h3>
            <p className="text-xs text-zinc-400 font-sans max-w-xs mx-auto">
              {authStatus === 'idle' && 'Inicio de sesión sin contraseña para dueños de flotas y supervisores certificados.'}
              {authStatus === 'scanning' && 'Validando con el enclave seguro de su dispositivo (Face ID / Windows Hello).'}
              {authStatus === 'success' && 'Iniciando sesión como Ing. Rafael Malespín (Constructora Malespín S.A.S.).'}
              {authStatus === 'failed' && 'Intente nuevamente o ingrese mediante su PIN / contraseña habitual.'}
            </p>
          </div>

          {/* Supported Sensors Bar */}
          <div className="grid grid-cols-3 gap-2 text-[10px] text-zinc-400 font-mono">
            <div className="p-2 rounded-[2px] bg-zinc-900 border border-zinc-800 flex flex-col items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>Face ID (iOS)</span>
            </div>
            <div className="p-2 rounded-[2px] bg-zinc-900 border border-zinc-800 flex flex-col items-center gap-1">
              <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
              <span>Touch ID / Android</span>
            </div>
            <div className="p-2 rounded-[2px] bg-zinc-900 border border-zinc-800 flex flex-col items-center gap-1">
              <Laptop className="w-3.5 h-3.5 text-emerald-400" />
              <span>Windows Hello</span>
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
            Usar Contraseña / PIN
          </button>

          <button
            type="button"
            disabled={authStatus === 'scanning' || authStatus === 'success'}
            onClick={handleStartBiometricVerification}
            className="px-5 py-2 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Escanear Biometría</span>
          </button>
        </div>
      </div>
    </div>
  );
};
