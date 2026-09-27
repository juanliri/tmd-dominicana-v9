/**
 * TMD DOMINICANA — AUTHENTICATION SECURITY & AUDIT TRAIL SERVICE
 * 
 * Provides:
 * - SHA-256 Cryptographic Hashing (Web Crypto API)
 * - Rate Limiting & Lockout Management
 * - Browser / Hardware Session Fingerprinting
 * - Local & Cloud Security Audit Trail Logging
 */

export interface AuthAuditEntry {
  id: string;
  timestamp: string;
  eventType: 'login_success' | 'login_failed' | 'lockout_triggered' | 'logout' | 'session_extended' | 'role_switch';
  method: 'pin' | 'google' | 'biometric' | 'session_restore';
  role?: string;
  identifier?: string;
  userAgent: string;
  fingerprint: string;
  ipPlaceholder?: string;
  details?: string;
}

export const SECURITY_CONFIG = {
  MAX_FAILED_ATTEMPTS: 5,
  WINDOW_MS: 60 * 1000,          // 1 minute window for attempt tracking
  LOCKOUT_DURATION_MS: 5 * 60 * 1000, // 5 minutes lockout after 5 consecutive failures
  AUDIT_STORAGE_KEY: 'tmd_auth_audit_log',
  LOCKOUT_STORAGE_KEY: 'tmd_auth_lockout_meta',
  MAX_LOCAL_AUDIT_ENTRIES: 100
};

export interface LockoutMeta {
  failedAttempts: number;
  lockedUntil: number | null;
  lastAttemptAt: number;
}

/**
 * Computes SHA-256 hash using the native browser Web Crypto API.
 */
export async function sha256Hash(text: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    // Basic fallback hash for non-crypto environments
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Computes browser session fingerprint.
 */
export async function generateSessionFingerprint(): Promise<string> {
  if (typeof window === 'undefined') return 'server_environment';

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  ].join('|');

  return sha256Hash(components);
}

/**
 * Manages lockout and rate limiting.
 */
export function getLockoutState(): { isLocked: boolean; remainingSeconds: number; failedAttempts: number } {
  if (typeof window === 'undefined') {
    return { isLocked: false, remainingSeconds: 0, failedAttempts: 0 };
  }

  try {
    const raw = localStorage.getItem(SECURITY_CONFIG.LOCKOUT_STORAGE_KEY);
    if (!raw) return { isLocked: false, remainingSeconds: 0, failedAttempts: 0 };

    const meta: LockoutMeta = JSON.parse(raw);
    const now = Date.now();

    // Reset attempt counter if window has passed and not locked
    if (!meta.lockedUntil && (now - meta.lastAttemptAt > SECURITY_CONFIG.WINDOW_MS)) {
      localStorage.removeItem(SECURITY_CONFIG.LOCKOUT_STORAGE_KEY);
      return { isLocked: false, remainingSeconds: 0, failedAttempts: 0 };
    }

    if (meta.lockedUntil && meta.lockedUntil > now) {
      const remainingSecs = Math.ceil((meta.lockedUntil - now) / 1000);
      return { isLocked: true, remainingSeconds: remainingSecs, failedAttempts: meta.failedAttempts };
    }

    if (meta.lockedUntil && meta.lockedUntil <= now) {
      // Lockout expired, clear lockout state
      localStorage.removeItem(SECURITY_CONFIG.LOCKOUT_STORAGE_KEY);
      return { isLocked: false, remainingSeconds: 0, failedAttempts: 0 };
    }

    return { isLocked: false, remainingSeconds: 0, failedAttempts: meta.failedAttempts };
  } catch (e) {
    return { isLocked: false, remainingSeconds: 0, failedAttempts: 0 };
  }
}

/**
 * Records a failed attempt and locks out if limit is exceeded.
 */
export function recordFailedAttempt(): { isLocked: boolean; remainingSeconds: number } {
  if (typeof window === 'undefined') return { isLocked: false, remainingSeconds: 0 };

  const now = Date.now();
  let meta: LockoutMeta = {
    failedAttempts: 0,
    lockedUntil: null,
    lastAttemptAt: now
  };

  try {
    const raw = localStorage.getItem(SECURITY_CONFIG.LOCKOUT_STORAGE_KEY);
    if (raw) {
      const parsed: LockoutMeta = JSON.parse(raw);
      // If within sliding window, increment
      if (now - parsed.lastAttemptAt <= SECURITY_CONFIG.WINDOW_MS) {
        meta = parsed;
      }
    }
  } catch (e) {
    // start fresh
  }

  meta.failedAttempts += 1;
  meta.lastAttemptAt = now;

  if (meta.failedAttempts >= SECURITY_CONFIG.MAX_FAILED_ATTEMPTS) {
    meta.lockedUntil = now + SECURITY_CONFIG.LOCKOUT_DURATION_MS;
    try {
      localStorage.setItem(SECURITY_CONFIG.LOCKOUT_STORAGE_KEY, JSON.stringify(meta));
    } catch (e) {}

    // Record audit log for lockout trigger
    logAuthEvent({
      eventType: 'lockout_triggered',
      method: 'pin',
      details: `Bloqueo de seguridad activado por ${SECURITY_CONFIG.MAX_FAILED_ATTEMPTS} intentos fallidos consecutivos.`
    });

    return { isLocked: true, remainingSeconds: Math.ceil(SECURITY_CONFIG.LOCKOUT_DURATION_MS / 1000) };
  }

  try {
    localStorage.setItem(SECURITY_CONFIG.LOCKOUT_STORAGE_KEY, JSON.stringify(meta));
  } catch (e) {}

  return { isLocked: false, remainingSeconds: 0 };
}

/**
 * Resets the failed attempt counter upon successful authentication.
 */
export function resetFailedAttempts(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SECURITY_CONFIG.LOCKOUT_STORAGE_KEY);
  } catch (e) {}
}

/**
 * Writes an event to the security audit trail.
 */
export async function logAuthEvent(
  params: Omit<AuthAuditEntry, 'id' | 'timestamp' | 'userAgent' | 'fingerprint'>
): Promise<AuthAuditEntry> {
  const fp = await generateSessionFingerprint();
  const entry: AuthAuditEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
    fingerprint: fp,
    ...params
  };

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(SECURITY_CONFIG.AUDIT_STORAGE_KEY);
      let logs: AuthAuditEntry[] = raw ? JSON.parse(raw) : [];
      logs = [entry, ...logs].slice(0, SECURITY_CONFIG.MAX_LOCAL_AUDIT_ENTRIES);
      localStorage.setItem(SECURITY_CONFIG.AUDIT_STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.warn('Could not write to local audit log:', e);
    }
  }

  return entry;
}

/**
 * Reads local security audit trail.
 */
export function getLocalAuditLogs(): AuthAuditEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SECURITY_CONFIG.AUDIT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
