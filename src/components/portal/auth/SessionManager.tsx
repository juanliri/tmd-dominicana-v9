import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, ShieldAlert, RefreshCw, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { PIN_STORAGE_KEY } from '../../../data/pinAuthAccounts';

// Session TTL configuration in milliseconds
export const SESSION_CONFIG = {
  PIN_TTL_MS: 4 * 60 * 60 * 1000,        // 4 hours
  BIOMETRIC_TTL_MS: 8 * 60 * 60 * 1000,  // 8 hours
  GOOGLE_TTL_MS: 24 * 60 * 60 * 1000,    // 24 hours
  INACTIVITY_TIMEOUT_MS: 45 * 60 * 1000, // 45 minutes of complete inactivity
  WARNING_THRESHOLD_MS: 5 * 60 * 1000,   // 5 minutes remaining before expiry warning
  CHECK_INTERVAL_MS: 10 * 1000,          // Check clock every 10 seconds
  SESSION_STORAGE_KEY: 'tmd_portal_session_meta'
};

export type AuthMethodType = 'pin' | 'biometric' | 'google' | 'unknown';

export interface SessionMeta {
  authMethod: AuthMethodType;
  authenticatedAt: number;
  expiresAt: number;
  lastActiveAt: number;
  userId: string;
}

interface SessionManagerProps {
  onSessionExpired?: () => void;
  children?: React.ReactNode;
}

export const SessionManager: React.FC<SessionManagerProps> = ({ onSessionExpired, children }) => {
  const { currentUser, userProfile, signOut } = useAuth();
  const [sessionMeta, setSessionMeta] = useState<SessionMeta | null>(null);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isExtending, setIsExtending] = useState<boolean>(false);
  const lastActivityThrottledRef = useRef<number>(Date.now());

  // Determine auth method
  const detectAuthMethod = useCallback((): AuthMethodType => {
    if (typeof window === 'undefined') return 'unknown';
    
    // Check if PIN session exists
    const pinData = localStorage.getItem(PIN_STORAGE_KEY);
    if (pinData) return 'pin';

    // Check if WebAuthn session
    const bioData = sessionStorage.getItem('tmd_biometric_session');
    if (bioData) return 'biometric';

    // Firebase provider check
    if (currentUser?.providerData?.some(p => p.providerId === 'google.com')) {
      return 'google';
    }

    return 'pin';
  }, [currentUser]);

  // Initialize or load session metadata
  const initSession = useCallback(() => {
    if (!currentUser && !userProfile) {
      setSessionMeta(null);
      return;
    }

    const now = Date.now();
    const rawStored = localStorage.getItem(SESSION_CONFIG.SESSION_STORAGE_KEY);
    let meta: SessionMeta | null = null;

    if (rawStored) {
      try {
        const parsed = JSON.parse(rawStored) as SessionMeta;
        if (parsed.userId === (currentUser?.uid || userProfile?.id) && parsed.expiresAt > now) {
          meta = parsed;
        }
      } catch (e) {
        console.warn('Failed parsing stored session meta:', e);
      }
    }

    if (!meta) {
      const method = detectAuthMethod();
      let ttl = SESSION_CONFIG.PIN_TTL_MS;
      if (method === 'biometric') ttl = SESSION_CONFIG.BIOMETRIC_TTL_MS;
      if (method === 'google') ttl = SESSION_CONFIG.GOOGLE_TTL_MS;

      meta = {
        authMethod: method,
        authenticatedAt: now,
        expiresAt: now + ttl,
        lastActiveAt: now,
        userId: currentUser?.uid || userProfile?.id || 'anonymous'
      };

      try {
        localStorage.setItem(SESSION_CONFIG.SESSION_STORAGE_KEY, JSON.stringify(meta));
      } catch (e) {
        console.warn('Could not save session meta:', e);
      }
    }

    setSessionMeta(meta);
  }, [currentUser, userProfile, detectAuthMethod]);

  // Initial setup when user changes
  useEffect(() => {
    initSession();
  }, [initSession]);

  // Touch/Activity heartbeat with throttling (15 seconds)
  const recordActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastActivityThrottledRef.current < 15000) return;
    lastActivityThrottledRef.current = now;

    setSessionMeta(prev => {
      if (!prev) return null;
      const updated: SessionMeta = {
        ...prev,
        lastActiveAt: now
      };
      try {
        localStorage.setItem(SESSION_CONFIG.SESSION_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        // ignore storage errors
      }
      return updated;
    });
  }, []);

  // Listen to user interactions to record activity
  useEffect(() => {
    if (!currentUser && !userProfile) return;

    const handleUserActivity = () => recordActivity();
    window.addEventListener('mousemove', handleUserActivity, { passive: true });
    window.addEventListener('keydown', handleUserActivity, { passive: true });
    window.addEventListener('touchstart', handleUserActivity, { passive: true });
    window.addEventListener('scroll', handleUserActivity, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
    };
  }, [currentUser, userProfile, recordActivity]);

  // Extend Session callback
  const handleExtendSession = async () => {
    setIsExtending(true);
    const now = Date.now();
    const method = sessionMeta?.authMethod || detectAuthMethod();
    let ttl = SESSION_CONFIG.PIN_TTL_MS;
    if (method === 'biometric') ttl = SESSION_CONFIG.BIOMETRIC_TTL_MS;
    if (method === 'google') ttl = SESSION_CONFIG.GOOGLE_TTL_MS;

    const updated: SessionMeta = {
      authMethod: method,
      authenticatedAt: sessionMeta?.authenticatedAt || now,
      expiresAt: now + ttl,
      lastActiveAt: now,
      userId: currentUser?.uid || userProfile?.id || 'anonymous'
    };

    try {
      localStorage.setItem(SESSION_CONFIG.SESSION_STORAGE_KEY, JSON.stringify(updated));
      setSessionMeta(updated);
      setShowWarningModal(false);
    } catch (e) {
      console.warn('Could not extend session in storage:', e);
    } finally {
      setIsExtending(false);
    }
  };

  // Terminate session cleanly
  const handleForceExpire = useCallback(async () => {
    setShowWarningModal(false);
    try {
      localStorage.removeItem(SESSION_CONFIG.SESSION_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    setSessionMeta(null);
    if (onSessionExpired) {
      onSessionExpired();
    } else {
      await signOut();
    }
  }, [onSessionExpired, signOut]);

  // Periodic Clock Check
  useEffect(() => {
    if (!sessionMeta) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeLeft = sessionMeta.expiresAt - now;
      const inactivity = now - sessionMeta.lastActiveAt;

      // Inactivity timeout reached
      if (inactivity > SESSION_CONFIG.INACTIVITY_TIMEOUT_MS) {
        console.warn('Session expired due to inactivity');
        handleForceExpire();
        return;
      }

      // Hard TTL expired
      if (timeLeft <= 0) {
        console.warn('Session TTL expired');
        handleForceExpire();
        return;
      }

      // Within warning threshold
      if (timeLeft <= SESSION_CONFIG.WARNING_THRESHOLD_MS) {
        setRemainingSeconds(Math.max(0, Math.floor(timeLeft / 1000)));
        setShowWarningModal(true);
      } else {
        setShowWarningModal(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionMeta, handleForceExpire]);

  // Cross-tab synchronization via StorageEvent
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SESSION_CONFIG.SESSION_STORAGE_KEY) {
        if (!e.newValue) {
          // Another tab logged out
          setSessionMeta(null);
          setShowWarningModal(false);
        } else {
          try {
            const parsed = JSON.parse(e.newValue);
            setSessionMeta(parsed);
          } catch (err) {
            // ignore
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Format seconds to mm:ss
  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {children}

      {/* Session Expiration Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in font-mono">
          <div className="bg-zinc-950 border border-amber-500/40 rounded-[5px] p-6 max-w-md w-full shadow-2xl shadow-amber-500/10 space-y-5 text-zinc-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-[2px] bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold uppercase tracking-wider text-white">
                  Sesión por Expirar
                </h3>
                <p className="text-xs text-zinc-400">
                  TMD Dominicana · Seguridad de Datos
                </p>
              </div>
            </div>

            <div className="p-4 rounded-[3px] bg-zinc-900/80 border border-zinc-800 text-center space-y-2">
              <span className="text-xs text-zinc-400 uppercase tracking-widest block">
                Tiempo Restante
              </span>
              <div className="text-4xl font-extrabold text-amber-400 tracking-wider">
                {formatCountdown(remainingSeconds)}
              </div>
              <p className="text-xs text-zinc-400">
                Por motivos de seguridad, la sesión se cerrará automáticamente al llegar a cero.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleForceExpire}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[2px] border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
              <button
                type="button"
                onClick={handleExtendSession}
                disabled={isExtending}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[2px] bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
              >
                {isExtending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Extender Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
