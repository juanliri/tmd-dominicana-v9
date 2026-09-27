/**
 * TMD Dominicana - Monthly Dynamic Business Configuration Service
 * Provides centralized management of frequent business variables:
 * - Central Bank DOP/USD exchange rates
 * - Banking promo financing annual percentage rates (APR)
 * - Hero promotional campaign marquee & banners
 * - Emergency roadside/field technical dispatch numbers
 * - Pro-Member seasonal coupon vouchers
 * - Operating hours & holiday scheduling
 * 
 * Supports local persistence, reactive subscriptions, and cloud sync (Supabase/Firestore).
 */

export interface MonthlyBusinessConfig {
  exchangeRateDopUsd: number;
  financingAnnualRatePct: number;
  leasingTermsMonthsMax: number;
  topPromoHeadline: string;
  topPromoSubtitle: string;
  topPromoTargetRoute: string;
  topPromoActive: boolean;
  emergencyHotline: string;
  whatsappCommercial: string;
  patioOperationalHours: string;
  activeProDiscountCode: string;
  proPartsDiscountPct: number;
  proLaborDiscountPct: number;
  dgiiTaxYear: string;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}

const STORAGE_KEY = 'tmd_monthly_business_config_v1';

export const DEFAULT_BUSINESS_CONFIG: MonthlyBusinessConfig = {
  exchangeRateDopUsd: 60.50,
  financingAnnualRatePct: 9.95,
  leasingTermsMonthsMax: 60,
  topPromoHeadline: 'FERIA DE INFRAESTRUCTURA & MINERÍA RD 2026',
  topPromoSubtitle: '0% Inicial en excavadoras LiuGong 922E y financiamiento preferencial con Banco Popular y BHD',
  topPromoTargetRoute: '#/machinery',
  topPromoActive: true,
  emergencyHotline: '+1 (809) 560-1234',
  whatsappCommercial: '+1 (829) 555-0199',
  patioOperationalHours: 'Lunes a Viernes: 7:30 AM - 6:00 PM | Sábados: 8:00 AM - 1:00 PM',
  activeProDiscountCode: 'TMDPRO2026',
  proPartsDiscountPct: 15,
  proLaborDiscountPct: 20,
  dgiiTaxYear: '2026',
  lastUpdatedBy: 'Gerencia General TMD',
  lastUpdatedAt: new Date().toISOString()
};

let activeConfig: MonthlyBusinessConfig = (() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.exchangeRateDopUsd === 'number') {
        return { ...DEFAULT_BUSINESS_CONFIG, ...parsed };
      }
    }
  } catch {
    // fallback
  }
  return { ...DEFAULT_BUSINESS_CONFIG };
})();

const configListeners = new Set<(cfg: MonthlyBusinessConfig) => void>();

export function getBusinessConfig(): MonthlyBusinessConfig {
  return { ...activeConfig };
}

export function subscribeToBusinessConfig(cb: (cfg: MonthlyBusinessConfig) => void): () => void {
  configListeners.add(cb);
  cb({ ...activeConfig });
  return () => {
    configListeners.delete(cb);
  };
}

export function updateBusinessConfig(
  updates: Partial<MonthlyBusinessConfig>, 
  updatedBy: string = 'Administrador TMD'
): MonthlyBusinessConfig {
  activeConfig = {
    ...activeConfig,
    ...updates,
    lastUpdatedBy: updatedBy,
    lastUpdatedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activeConfig));
  } catch (e) {
    console.warn('[BusinessConfigService] LocalStorage write error:', e);
  }

  // Broadcast to all active listeners in the current tab
  configListeners.forEach(cb => {
    try {
      cb({ ...activeConfig });
    } catch (err) {
      console.error('[BusinessConfigService] Listener notification error:', err);
    }
  });

  return { ...activeConfig };
}

export function resetBusinessConfigToDefault(): MonthlyBusinessConfig {
  activeConfig = { ...DEFAULT_BUSINESS_CONFIG, lastUpdatedAt: new Date().toISOString() };
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  configListeners.forEach(cb => cb({ ...activeConfig }));
  return { ...activeConfig };
}
