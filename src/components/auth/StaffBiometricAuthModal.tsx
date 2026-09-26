import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Fingerprint, 
  ShieldCheck, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Sparkles, 
  Smartphone, 
  Laptop, 
  Trash2, 
  Plus, 
  RefreshCw, 
  Lock,
  ArrowRight,
  ShieldAlert,
  HardHat
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { 
  BiometricCredentialRecord, 
  BiometricAuthResult,
  getStoredBiometricCredentials,
  removeBiometricCredential,
  detectDeviceName,
  isPlatformAuthenticatorAvailable
} from '../../services/webAuthnService';

interface StaffBiometricAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'login' | 'manage';
  onSuccessLogin?: () => void;
}

export const StaffBiometricAuthModal: React.FC<StaffBiometricAuthModalProps> = ({
  isOpen,
  onClose,
  mode = 'login',
  onSuccessLogin
}) => {
  const { 
    userProfile, 
    signInWithBiometrics, 
    registerBiometrics, 
    isBiometricsSupported, 
    refreshBiometricKeys 
  } = useAuth();

  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [credentialsList, setCredentialsList] = useState<BiometricCredentialRecord[]>([]);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [newDeviceName, setNewDeviceName] = useState<string>('');
  const [selectedStaffEmail, setSelectedStaffEmail] = useState<string>('');
  const [hasPlatformAuth, setHasPlatformAuth] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'scan' | 'keys'>(mode === 'manage' ? 'keys' : 'scan');

  useEffect(() => {
    if (isOpen) {
      loadKeys();
      setScanState('idle');
      setErrorMessage('');
      setNewDeviceName(detectDeviceName());
      isPlatformAuthenticatorAvailable().then(setHasPlatformAuth);
    }
  }, [isOpen, mode]);

  const loadKeys = () => {
    const keys = getStoredBiometricCredentials();
    setCredentialsList(keys);
    if (keys.length > 0 && !selectedStaffEmail) {
      setSelectedStaffEmail(keys[0].userEmail);
    }
  };

  const handleStartBiometricScan = async () => {
    if (credentialsList.length === 0) {
      setErrorMessage('No hay llaves biométricas registradas en este equipo. Registra una primero.');
      setScanState('error');
      return;
    }

    setScanState('scanning');
    setErrorMessage('');

    try {
      const result: BiometricAuthResult = await signInWithBiometrics(
        selectedStaffEmail || undefined
      );

      if (result.success) {
        setScanState('success');
        setTimeout(() => {
          onClose();
          if (onSuccessLogin) onSuccessLogin();
        }, 1200);
      } else {
        setScanState('error');
        setErrorMessage(result.error || 'Verificación biométrica no completada.');
      }
    } catch (err: unknown) {
      setScanState('error');
      const errObj = err as Error;
      setErrorMessage(errObj.message || 'Error de hardware biométrico.');
    }
  };

  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) {
      setErrorMessage('Debes iniciar sesión con Google para enrolar este dispositivo.');
      return;
    }

    setIsRegistering(true);
    setErrorMessage('');

    try {
      const result = await registerBiometrics(newDeviceName || detectDeviceName());
      if (result.success) {
        loadKeys();
        refreshBiometricKeys();
        setActiveTab('keys');
        setScanState('success');
        setTimeout(() => setScanState('idle'), 2000);
      } else {
        setErrorMessage(result.error || 'No se pudo completar el registro biométrico.');
      }
    } catch (err: unknown) {
      const errObj = err as Error;
      setErrorMessage(errObj.message || 'Error durante el enrolamiento WebAuthn.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDeleteKey = (id: string) => {
    if (confirm('¿Deseas desvincular esta llave biométrica de este dispositivo?')) {
      removeBiometricCredential(id);
      loadKeys();
      refreshBiometricKeys();
    }
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div 
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-[5px] shadow-2xl max-w-lg w-full overflow-hidden text-zinc-100 relative font-mono"
      >
        {/* Top Accent Strip */}
        <div className="h-1 w-full bg-amber-400" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[2px] bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-xs shrink-0">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                  Autenticación Biométrica WebAuthn
                </h3>
                <span className="px-1.5 py-0.2 rounded-[2px] text-[9px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-400 border border-amber-400/30">
                  FIDO2
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Touch ID · Face ID · Windows Hello · Llaves de Seguridad
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700 transition-colors cursor-pointer text-xs uppercase"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs (Scan vs Keys) */}
        <div className="px-4 sm:px-5 pt-2 flex items-center gap-2 border-b border-zinc-800 bg-zinc-950">
          <button
            type="button"
            onClick={() => setActiveTab('scan')}
            className={`px-3 py-1.5 text-xs font-bold uppercase transition-all rounded-[2px] cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'scan'
                ? 'bg-amber-400 text-black shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Escanear Biometría</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('keys')}
            className={`px-3 py-1.5 text-xs font-bold uppercase transition-all rounded-[2px] cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'keys'
                ? 'bg-amber-400 text-black shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Llaves Registradas ({credentialsList.length})</span>
          </button>
        </div>

        {/* Main Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* TAB 1: SCANNER VIEW */}
          {activeTab === 'scan' && (
            <div className="space-y-4 text-center">
              {/* Biometric Interactive Scanner Graphic */}
              <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                {/* Outer Glow Ring */}
                <div className={`absolute inset-0 rounded-[4px] transition-all duration-700 ${
                  scanState === 'scanning' ? 'bg-amber-400/20 animate-ping' :
                  scanState === 'success' ? 'bg-emerald-500/20' :
                  scanState === 'error' ? 'bg-rose-500/20' : 'bg-zinc-800/30'
                }`} />

                <div className={`relative w-28 h-28 rounded-[4px] border flex items-center justify-center transition-all duration-300 shadow-2xl ${
                  scanState === 'scanning' ? 'border-amber-400 bg-zinc-950 shadow-amber-400/20' :
                  scanState === 'success' ? 'border-emerald-400 bg-zinc-950 shadow-emerald-500/20 text-emerald-400' :
                  scanState === 'error' ? 'border-rose-500 bg-zinc-950 shadow-rose-500/20 text-rose-400' :
                  'border-zinc-800 bg-zinc-950 text-amber-400 hover:border-zinc-700'
                }`}>
                  {/* Laser Scanning Animation */}
                  {scanState === 'scanning' && (
                    <motion.div 
                      initial={{ y: -35 }}
                      animate={{ y: 35 }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                      className="absolute w-20 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-xs shadow-amber-400"
                    />
                  )}

                  {scanState === 'success' ? (
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
                  ) : scanState === 'error' ? (
                    <AlertTriangle className="w-12 h-12 text-rose-400" />
                  ) : (
                    <Fingerprint className={`w-12 h-12 transition-transform duration-300 ${scanState === 'scanning' ? 'scale-110 text-amber-300' : 'text-amber-400'}`} />
                  )}
                </div>
              </div>

              {/* Status Text */}
              <div className="space-y-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                  {scanState === 'idle' && (credentialsList.length > 0 ? 'Sensor Biométrico Listo' : 'No Hay Llaves Registradas')}
                  {scanState === 'scanning' && 'Autenticando en Hardware de Seguridad...'}
                  {scanState === 'success' && 'Identidad de Staff Verificada'}
                  {scanState === 'error' && 'Error de Verificación'}
                </h4>
                <p className="text-[11px] text-zinc-400 max-w-xs mx-auto leading-relaxed">
                  {scanState === 'idle' && (credentialsList.length > 0 
                    ? 'Coloca tu dedo en el sensor Touch ID / lector o mira a la cámara Face ID.' 
                    : 'Registra este dispositivo primero para habilitar el acceso con 1 toque.')}
                  {scanState === 'scanning' && 'Responde al diálogo nativo de tu sistema operativo o llave física FIDO2.'}
                  {scanState === 'success' && 'Acceso concedido al Centro de Mando Staff y Operaciones.'}
                  {scanState === 'error' && errorMessage}
                </p>
              </div>

              {/* Account Selector if multiple credentials exist */}
              {credentialsList.length > 1 && scanState === 'idle' && (
                <div className="text-left bg-zinc-950 p-3 rounded-[2px] border border-zinc-800 space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Seleccionar Cuenta de Staff:
                  </label>
                  <select
                    value={selectedStaffEmail}
                    onChange={(e) => setSelectedStaffEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-[2px] px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-400 font-mono"
                  >
                    {credentialsList.map(c => (
                      <option key={c.id} value={c.userEmail}>
                        {c.userName} ({c.userEmail}) · {c.deviceName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                {credentialsList.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleStartBiometricScan}
                    disabled={scanState === 'scanning'}
                    className="w-full py-2.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase text-xs tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Fingerprint className="w-4 h-4" />
                    <span>{scanState === 'scanning' ? 'Esperando Hardware...' : 'Escanear Huella / Face ID'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTab('keys')}
                    className="w-full py-2.5 rounded-[2px] bg-zinc-950 text-amber-400 border border-amber-400/40 hover:bg-zinc-800 font-bold uppercase text-xs tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Enrolar Nuevo Dispositivo Biométrico</span>
                  </button>
                )}

                {scanState === 'error' && (
                  <button
                    type="button"
                    onClick={() => {
                      setScanState('idle');
                      setErrorMessage('');
                    }}
                    className="text-[11px] text-zinc-400 hover:text-white transition-colors underline block mx-auto cursor-pointer uppercase font-bold"
                  >
                    Reintentar verificación
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER & MANAGE KEYS */}
          {activeTab === 'keys' && (
            <div className="space-y-4">
              {/* Enrolled Devices List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase text-zinc-400 tracking-wider">
                  <span>Dispositivos Vinculados a este Navegador</span>
                  <span>{credentialsList.length} Activo(s)</span>
                </div>

                {credentialsList.length === 0 ? (
                  <div className="p-4 rounded-[2px] bg-zinc-950 border border-zinc-800 text-center space-y-2">
                    <Key className="w-6 h-6 text-zinc-600 mx-auto" />
                    <p className="text-xs text-zinc-400">
                      No hay credenciales WebAuthn registradas en este equipo.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {credentialsList.map((cred) => (
                      <div 
                        key={cred.id}
                        className="p-3 rounded-[2px] bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-[2px] bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center shrink-0">
                            {cred.deviceName.includes('iPhone') || cred.deviceName.includes('Android') ? (
                              <Smartphone className="w-4 h-4" />
                            ) : (
                              <Laptop className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white uppercase truncate">
                              {cred.deviceName}
                            </p>
                            <p className="text-[11px] text-zinc-400 truncate">
                              {cred.userEmail} · {cred.role.toUpperCase()}
                            </p>
                            <p className="text-[10px] text-zinc-500">
                              Último uso: {new Date(cred.lastUsedAt).toLocaleDateString('es-DO')}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteKey(cred.id)}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-[2px] transition-colors shrink-0 cursor-pointer"
                          title="Eliminar llave"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Register Current Device Section */}
              <div className="pt-3 border-t border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Enrolar Dispositivo Actual</span>
                </h4>

                {userProfile ? (
                  <form onSubmit={handleRegisterDevice} className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                        Nombre Descriptivo del Dispositivo:
                      </label>
                      <input
                        type="text"
                        value={newDeviceName}
                        onChange={(e) => setNewDeviceName(e.target.value)}
                        placeholder="Ej. MacBook Pro M3 - Touch ID"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-[2px] px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-400 font-mono"
                        required
                      />
                    </div>

                    <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-amber-400/30 flex items-center gap-2 text-xs text-amber-300">
                      <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>
                        Se vinculará a la cuenta activa: <strong>{userProfile.email}</strong> ({userProfile.role})
                      </span>
                    </div>

                    {errorMessage && (
                      <div className="p-2.5 rounded-[2px] bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isRegistering}
                      className="w-full py-2 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase text-xs tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Fingerprint className="w-4 h-4" />
                      <span>{isRegistering ? 'Esperando Sensor...' : 'Registrar Sensor Biométrico Ahora'}</span>
                    </button>
                  </form>
                ) : (
                  <div className="p-3 rounded-[2px] bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 space-y-2">
                    <p>
                      Para vincular una nueva llave biométrica, primero inicia sesión con tu cuenta de Staff con Google.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Security Guarantee */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400 uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>FIDO2 WebAuthn Criptografía Asimétrica</span>
          </div>
          <span className="text-zinc-500">TMD Security Suite</span>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
