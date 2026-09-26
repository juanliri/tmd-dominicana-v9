/**
 * Dominican Peso (DOP) Currency Rate Sync Service
 * Handles live synchronization with BCRD / Open Exchange rates,
 * local fallback caching with TTL, and reactive broadcast updates.
 */

export const BASELINE_USD_TO_DOP_RATE = 60.50;
const STORAGE_KEY = 'tmd_dop_exchange_rate_data';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour TTL

export interface ExchangeRateData {
  rate: number;
  lastUpdated: string;
  source: 'BCRD Live Feed' | 'Open Exchange' | 'Cached Sync' | 'Official TMD Baseline';
  isLive: boolean;
  bcrdReference?: number;
}

// Initial state loaded from localStorage or baseline
let currentRateData: ExchangeRateData = (() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.rate === 'number' && parsed.rate > 40 && parsed.rate < 100) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return {
    rate: BASELINE_USD_TO_DOP_RATE,
    lastUpdated: new Date().toISOString(),
    source: 'Official TMD Baseline',
    isLive: false
  };
})();

// Listeners for reactive updates
const listeners = new Set<(data: ExchangeRateData) => void>();

export function getLiveExchangeRate(): number {
  return currentRateData.rate;
}

export function getExchangeRateData(): ExchangeRateData {
  return { ...currentRateData };
}

export function subscribeToExchangeRate(callback: (data: ExchangeRateData) => void): () => void {
  listeners.add(callback);
  callback({ ...currentRateData });
  return () => {
    listeners.delete(callback);
  };
}

function notifyListeners() {
  listeners.forEach(cb => {
    try {
      cb({ ...currentRateData });
    } catch (e) {
      console.warn('[CurrencyRateService] Listener error:', e);
    }
  });
}

/**
 * Synchronizes exchange rate from public live currency APIs with graceful fallbacks
 */
export async function syncLiveExchangeRate(forceRefresh: boolean = false): Promise<ExchangeRateData> {
  // Check if current cached rate is still fresh
  if (!forceRefresh) {
    try {
      const lastTime = new Date(currentRateData.lastUpdated).getTime();
      if (!isNaN(lastTime) && Date.now() - lastTime < CACHE_TTL_MS && currentRateData.isLive) {
        return currentRateData;
      }
    } catch {
      // ignore
    }
  }

  // Attempt 1: Fetch from backend proxy endpoint /api/currency/rate (prevents CORS & adblock issues)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const backendRes = await fetch('/api/currency/rate', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (backendRes.ok) {
      const json = await backendRes.json();
      if (json && typeof json.rate === 'number' && json.rate >= 45 && json.rate <= 85) {
        currentRateData = {
          rate: Number(json.rate.toFixed(2)),
          lastUpdated: json.lastUpdated || new Date().toISOString(),
          source: json.source || 'BCRD Live Feed',
          isLive: json.isLive ?? true
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(currentRateData));
        } catch {
          // ignore
        }
        notifyListeners();
        return currentRateData;
      }
    }
  } catch {
    // Continue to direct external attempt
  }

  try {
    // Attempt 2: Direct browser fetch from Open Exchange Rate / Free Forex API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      const dopRate = json?.rates?.DOP;
      if (typeof dopRate === 'number' && dopRate >= 45 && dopRate <= 85) {
        currentRateData = {
          rate: Number(dopRate.toFixed(2)),
          lastUpdated: new Date().toISOString(),
          source: 'Open Exchange',
          isLive: true
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(currentRateData));
        } catch {
          // ignore
        }
        notifyListeners();
        return currentRateData;
      }
    }
  } catch (err) {
    console.warn('[CurrencyRateService] Live rate sync failed, using cached/baseline rate:', err);
  }

  // Graceful fallback to cached or baseline
  return currentRateData;
}
