import React, { useState, useEffect, useCallback } from 'react';
import { 
  Crown, 
  HardHat, 
  Shield, 
  Delete, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Lock, 
  RefreshCw 
} from 'lucide-react';
import { 
  getLockoutState, 
  recordFailedAttempt, 
  resetFailedAttempts, 
  logAuthEvent 
} from '../../../services/authSecurity';
import { UserRole } from '../../../types';
import { triggerHaptic } from '../../../utils/haptics';

interface PinPadInputProps {
  onVerifyPin: (pin: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  onQuickAccess?: (role: 'client' | 'staff' | 'admin') => Promise<void> | void;
  loading?: boolean;
}

export const PinPadInput: React.FC<PinPadInputProps> = ({
  onVerifyPin,
  onQuickAccess,
  loading = false
}) => {
  const [pinDigits, setPinDigits] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [lockoutState, setLockoutState] = useState(getLockoutState());

  // Countdown timer for lockout
  useEffect(() => {
    if (!lockoutState.isLocked) return;

    const interval = setInterval(() => {
      const current = getLockoutState();
      setLockoutState(current);
      if (!current.isLocked) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutState.isLocked]);

  // Execute PIN verification
  const executePin = useCallback(async (pin: string) => {
    if (lockoutState.isLocked || isVerifying || loading) return;

    setIsVerifying(true);
    setPinError(null);

    try {
      const res = await onVerifyPin(pin);

      if (!res.success) {
        triggerHaptic('error');
        const lockout = recordFailedAttempt();
        setLockoutState(getLockoutState());

        await logAuthEvent({
          eventType: 'login_failed',
          method: 'pin',
          details: `Intento fallido con PIN (Intento ${lockout.remainingSeconds > 0 ? 5 : 'registrado'})`
        });

        if (lockout.isLocked) {
          setPinError(`Terminal bloqueada temporalmente por seguridad (${lockout.remainingSeconds}s)`);
        } else {
          setPinError(res.error || 'PIN incorrecto. Ingrese 1111 (Cliente), 2222 (Staff) o 3333 (Admin).');
        }
        setPinDigits('');
      } else {
        triggerHaptic('success');
        resetFailedAttempts();
        await logAuthEvent({
          eventType: 'login_success',
          method: 'pin',
          role: res.role,
          details: `Inicio de sesión exitoso como ${res.role?.toUpperCase()}`
        });
        setPinSuccess(`¡Acceso concedido como ${res.role?.toUpperCase()}!`);
      }
    } catch (e: any) {
      triggerHaptic('error');
      setPinError('Error de autenticación: ' + (e?.message || 'Intente nuevamente'));
      setPinDigits('');
    } finally {
      setIsVerifying(false);
    }
  }, [lockoutState.isLocked, isVerifying, loading, onVerifyPin]);

  const handleDigitPress = (digit: string) => {
    if (lockoutState.isLocked || isVerifying || loading) return;
    if (pinDigits.length >= 4) return;

    triggerHaptic('light');
    const newPin = pinDigits + digit;
    setPinDigits(newPin);
    setPinError(null);

    if (newPin.length === 4) {
      executePin(newPin);
    }
  };

  const handleDeleteDigit = () => {
    if (lockoutState.isLocked || isVerifying || loading) return;
    triggerHaptic('selection');
    setPinDigits(prev => prev.slice(0, -1));
    setPinError(null);
  };

  const handleClearPin = () => {
    if (lockoutState.isLocked || isVerifying || loading) return;
    triggerHaptic('selection');
    setPinDigits('');
    setPinError(null);
  };

  const handleQuickRole = async (role: 'client' | 'staff' | 'admin') => {
    if (lockoutState.isLocked || isVerifying || loading) return;
    triggerHaptic('medium');
    if (onQuickAccess) {
      setIsVerifying(true);
      try {
        await onQuickAccess(role);
      } finally {
        setIsVerifying(false);
      }
    } else {
      const pinMap = { client: '1111', staff: '2222', admin: '3333' };
      executePin(pinMap[role]);
    }
  };

  // Keyboard numpad listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key >= '0' && e.key <= '9') {
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDeleteDigit();
      } else if (e.key === 'Escape') {
        handleClearPin();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pinDigits, lockoutState.isLocked, isVerifying, loading]);

  return (
    <div className="space-y-2.5 font-mono">
      {/* Lockout Warning Banner */}
      {lockoutState.isLocked && (
        <div className="p-2.5 rounded bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <Lock className="w-4 h-4 text-rose-400 shrink-0" />
          <div className="flex-1">
            <span className="font-bold uppercase tracking-wider block">Terminal Bloqueada</span>
            <span className="text-[11px] text-zinc-300">
              Reintente en <strong className="text-rose-400 font-mono">{lockoutState.remainingSeconds}s</strong>
            </span>
          </div>
        </div>
      )}

      {/* Feedback Alerts */}
      {pinError && !lockoutState.isLocked && (
        <div className="p-2 rounded bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-1.5 font-sans">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
          <span>{pinError}</span>
        </div>
      )}

      {pinSuccess && (
        <div className="p-2 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-1.5 font-sans">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
          <span>{pinSuccess}</span>
        </div>
      )}

      {/* 3 Quick Access Account Cards */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
          <span>CUENTAS DEMO CON ACCESO RÁPIDO:</span>
          <span className="text-amber-400 font-mono">1111 / 2222 / 3333</span>
        </div>

        {/* Account 1: Cliente VIP */}
        <div className="p-2 rounded bg-black/60 border border-amber-400/30 hover:border-amber-400/80 transition-all flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded bg-amber-400/15 text-amber-400 border border-amber-400/30 flex items-center justify-center font-black shrink-0">
              <Crown className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-white uppercase truncate">
                  Ing. Manuel Tavares
                </span>
                <span className="px-1 py-0.2 rounded bg-amber-400 text-black text-[8px] font-black uppercase">
                  CLIENTE VIP
                </span>
              </div>
              <p className="text-[9px] text-zinc-400 truncate">Constructora Tavares S.R.L.</p>
            </div>
          </div>
          <button
            type="button"
            disabled={isVerifying || loading || lockoutState.isLocked}
            onClick={() => handleQuickRole('client')}
            className="px-2.5 py-1.5 rounded bg-amber-400 hover:bg-amber-300 text-black font-black text-[10px] uppercase shrink-0 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
          >
            {isVerifying ? 'ENTRANDO...' : 'ENTRAR • 1111'}
          </button>
        </div>

        {/* Account 2: Staff Técnico */}
        <div className="p-2 rounded bg-black/60 border border-sky-400/30 hover:border-sky-400/80 transition-all flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded bg-sky-400/15 text-sky-400 border border-sky-400/30 flex items-center justify-center font-black shrink-0">
              <HardHat className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-white uppercase truncate">
                  Carlos Mendoza
                </span>
                <span className="px-1 py-0.2 rounded bg-sky-400 text-black text-[8px] font-black uppercase">
                  STAFF TÉCNICO
                </span>
              </div>
              <p className="text-[9px] text-zinc-400 truncate">Jefe de Taller & Patio Km 22</p>
            </div>
          </div>
          <button
            type="button"
            disabled={isVerifying || loading || lockoutState.isLocked}
            onClick={() => handleQuickRole('staff')}
            className="px-2.5 py-1.5 rounded bg-sky-400 hover:bg-sky-300 text-black font-black text-[10px] uppercase shrink-0 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
          >
            {isVerifying ? 'ENTRANDO...' : 'ENTRAR • 2222'}
          </button>
        </div>

        {/* Account 3: Admin General */}
        <div className="p-2 rounded bg-black/60 border border-purple-400/30 hover:border-purple-400/80 transition-all flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded bg-purple-400/15 text-purple-400 border border-purple-400/30 flex items-center justify-center font-black shrink-0">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-white uppercase truncate">
                  Juan Liriano
                </span>
                <span className="px-1 py-0.2 rounded bg-purple-500 text-white text-[8px] font-black uppercase">
                  ADMIN TOTAL
                </span>
              </div>
              <p className="text-[9px] text-zinc-400 truncate">Director General TMD</p>
            </div>
          </div>
          <button
            type="button"
            disabled={isVerifying || loading || lockoutState.isLocked}
            onClick={() => handleQuickRole('admin')}
            className="px-2.5 py-1.5 rounded bg-purple-500 hover:bg-purple-400 text-white font-black text-[10px] uppercase shrink-0 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
          >
            {isVerifying ? 'ENTRANDO...' : 'ENTRAR • 3333'}
          </button>
        </div>
      </div>

      {/* 4-Digit Indicator Display */}
      <div className="pt-2 border-t border-white/10 space-y-2">
        <div className="flex items-center justify-center gap-3 py-1">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pinDigits.length > index;
            const isCurrent = pinDigits.length === index && !lockoutState.isLocked;
            return (
              <div
                key={index}
                className={`w-10 h-11 rounded flex items-center justify-center text-lg font-black font-mono transition-all ${
                  isFilled
                    ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                    : isCurrent
                      ? 'bg-slate-100 dark:bg-zinc-900 border-2 border-amber-500 dark:border-amber-400 text-amber-600 dark:text-amber-400 animate-pulse'
                      : 'bg-slate-100 dark:bg-zinc-900/80 border border-slate-300 dark:border-white/15 text-slate-400 dark:text-zinc-600'
                }`}
              >
                {isFilled ? '●' : '-'}
              </div>
            );
          })}
        </div>

        {/* Compact Numeric Keypad Grid */}
        <div className="grid grid-cols-3 gap-1.5 max-w-[240px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={lockoutState.isLocked || isVerifying || loading}
              onClick={() => handleDigitPress(digit)}
              className="h-9 rounded bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 active:bg-amber-400 active:text-black border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-mono font-bold text-sm transition-all cursor-pointer touch-manipulation disabled:opacity-40"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            disabled={lockoutState.isLocked || isVerifying || loading}
            onClick={handleClearPin}
            className="h-9 rounded bg-slate-200 dark:bg-zinc-950 hover:bg-slate-300 dark:hover:bg-zinc-800 active:scale-95 border border-slate-300 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white font-mono text-[9px] font-bold uppercase transition-all cursor-pointer touch-manipulation disabled:opacity-40"
            title="Borrar todo"
          >
            BORRAR
          </button>
          <button
            type="button"
            disabled={lockoutState.isLocked || isVerifying || loading}
            onClick={() => handleDigitPress('0')}
            className="h-9 rounded bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 active:bg-amber-400 active:text-black border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-mono font-bold text-sm transition-all cursor-pointer touch-manipulation disabled:opacity-40"
          >
            0
          </button>
          <button
            type="button"
            disabled={lockoutState.isLocked || isVerifying || loading}
            onClick={handleDeleteDigit}
            className="h-9 rounded bg-slate-200 dark:bg-zinc-950 hover:bg-slate-300 dark:hover:bg-zinc-800 active:scale-95 border border-slate-300 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer touch-manipulation disabled:opacity-40"
            title="Retroceso"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
