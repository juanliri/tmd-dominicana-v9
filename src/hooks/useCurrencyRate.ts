import { useState, useEffect, useCallback } from 'react';
import { 
  ExchangeRateData, 
  getExchangeRateData, 
  getLiveExchangeRate, 
  subscribeToExchangeRate, 
  syncLiveExchangeRate,
  BASELINE_USD_TO_DOP_RATE
} from '../services/currencyRateService';

export interface UseCurrencyRateReturn {
  exchangeRate: number;
  rateData: ExchangeRateData;
  isLoading: boolean;
  error: string | null;
  refetchRate: (force?: boolean) => Promise<ExchangeRateData>;
  convertToDop: (amountUsd: number) => number;
  formatDop: (amountUsd: number) => string;
  formatPriceWithCurrency: (amountUsd: number, currency?: 'USD' | 'DOP') => string;
}

/**
 * Custom React Hook: useCurrencyRate
 * Fetches, caches in localStorage, and reactive-subscribes to live Central Bank / Forex USD/DOP exchange rates.
 * Dynamically converts and formats product prices across the application.
 */
export function useCurrencyRate(): UseCurrencyRateReturn {
  const [rateData, setRateData] = useState<ExchangeRateData>(getExchangeRateData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Subscribe to shared rate state updates
    const unsubscribe = subscribeToExchangeRate((updatedData) => {
      setRateData(updatedData);
    });

    // 2. Perform background sync if cache expired or on initial boot
    setIsLoading(true);
    syncLiveExchangeRate(false)
      .then((data) => {
        setRateData(data);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Error al sincronizar tasa de cambio.');
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      unsubscribe();
    };
  }, []);

  const refetchRate = useCallback(async (force = true): Promise<ExchangeRateData> => {
    setIsLoading(true);
    setError(null);
    try {
      const freshData = await syncLiveExchangeRate(force);
      setRateData(freshData);
      return freshData;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Fallo en la sincronización.';
      setError(msg);
      return getExchangeRateData();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const convertToDop = useCallback((amountUsd: number): number => {
    const rate = rateData.rate || BASELINE_USD_TO_DOP_RATE;
    return Number((amountUsd * rate).toFixed(2));
  }, [rateData.rate]);

  const formatDop = useCallback((amountUsd: number): string => {
    const amountDop = convertToDop(amountUsd);
    return `RD$ ${amountDop.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [convertToDop]);

  const formatPriceWithCurrency = useCallback((amountUsd: number, currency: 'USD' | 'DOP' = 'USD'): string => {
    if (currency === 'DOP') {
      return formatDop(amountUsd);
    }
    return `US$ ${amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [formatDop]);

  return {
    exchangeRate: rateData.rate || BASELINE_USD_TO_DOP_RATE,
    rateData,
    isLoading,
    error,
    refetchRate,
    convertToDop,
    formatDop,
    formatPriceWithCurrency
  };
}
