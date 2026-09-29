import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, MachineQuoteItem, Part, Machine, Currency, SavedCustomerProfile, MachineCustomizationOption } from '../types';
import { USD_TO_DOP_RATE } from '../data/catalog';
import { 
  ExchangeRateData, 
  getExchangeRateData, 
  subscribeToExchangeRate, 
  syncLiveExchangeRate 
} from '../services/currencyRateService';

interface CartContextType {
  cart: CartItem[];
  machineQuotes: MachineQuoteItem[];
  currency: Currency;
  setCurrency: (c: Currency) => void;
  exchangeRate: number;
  exchangeRateData: ExchangeRateData;
  isSyncingRate: boolean;
  refreshExchangeRate: () => Promise<void>;
  formatPrice: (amountUsd: number) => string;
  addToCart: (part: Part, qty?: number) => void;
  removeFromCart: (partId: string) => void;
  updateQuantity: (partId: string, qty: number) => void;
  clearCart: () => void;
  addMachineToQuote: (
    machine: Machine, 
    needFinancing?: boolean,
    customizations?: MachineCustomizationOption[],
    estimatedPriceRange?: { minUsd: number; maxUsd: number }
  ) => void;
  removeMachineFromQuote: (machineId: string) => void;
  clearMachineQuotes: () => void;
  totalCartCount: number;
  totalQuotesCount: number;
  subtotalUsd: number;
  discountPercentage: number;
  discountUsd: number;
  appliedCoupon: string | null;
  isProMemberDiscountActive: boolean;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  setProMemberDiscount: (active: boolean, percentage?: number) => void;
  itbisUsd: number;
  shippingUsd: number;
  totalUsd: number;
  totalDop: number;
  notification: string | null;
  showToast: (msg: string) => void;
  dismissNotification: () => void;
  savedProfile: SavedCustomerProfile | null;
  saveProfile: (profile: SavedCustomerProfile) => void;
  clearSavedProfile: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem('tmd-currency');
      if (saved === 'DOP' || saved === 'USD') return saved;
    } catch {
      // ignore
    }
    return 'USD';
  });

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem('tmd-currency', c);
    } catch {
      // ignore
    }
  };

  const [exchangeRateData, setExchangeRateData] = useState<ExchangeRateData>(getExchangeRateData);
  const [isSyncingRate, setIsSyncingRate] = useState<boolean>(false);

  useEffect(() => {
    // Subscribe to rate updates
    const unsubscribe = subscribeToExchangeRate((data) => {
      setExchangeRateData(data);
    });

    // Attempt live sync on background boot
    syncLiveExchangeRate(false);

    return () => {
      unsubscribe();
    };
  }, []);

  const refreshExchangeRate = async () => {
    setIsSyncingRate(true);
    try {
      const updated = await syncLiveExchangeRate(true);
      setExchangeRateData(updated);
      showToast(`Tasa de cambio actualizada: US$ 1.00 = RD$ ${updated.rate.toFixed(2)} (${updated.source})`);
    } catch {
      showToast('No se pudo sincronizar la tasa en vivo, usando tasa oficial.');
    } finally {
      setIsSyncingRate(false);
    }
  };

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('tmd-cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [machineQuotes, setMachineQuotes] = useState<MachineQuoteItem[]>(() => {
    try {
      const saved = localStorage.getItem('tmd-quotes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(() => {
    try {
      return localStorage.getItem('tmd-applied-coupon') || null;
    } catch {
      return null;
    }
  });

  const [discountPercentage, setDiscountPercentage] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('tmd-discount-percent');
      return saved ? parseFloat(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [isProMemberDiscountActive, setIsProMemberDiscountActive] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tmd-pro-discount-active') === 'true';
    } catch {
      return false;
    }
  });

  const [savedProfile, setSavedProfile] = useState<SavedCustomerProfile | null>(() => {
    try {
      const saved = localStorage.getItem('tmd-saved-profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('tmd-cart', JSON.stringify(cart));
    } catch {
      // ignore storage error
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('tmd-quotes', JSON.stringify(machineQuotes));
    } catch {
      // ignore storage error
    }
  }, [machineQuotes]);

  const saveProfile = (profile: SavedCustomerProfile) => {
    try {
      localStorage.setItem('tmd-saved-profile', JSON.stringify(profile));
      setSavedProfile(profile);
      showToast('Datos de contacto y facturación guardados para futuras compras.');
    } catch {
      // ignore storage error
    }
  };

  const clearSavedProfile = () => {
    try {
      localStorage.removeItem('tmd-saved-profile');
      setSavedProfile(null);
      showToast('Información guardada eliminada con éxito.');
    } catch {
      // ignore storage error
    }
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  const addToCart = (part: Part, qty = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.part.id === part.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + qty
        };
        return next;
      }
      return [...prev, { part, quantity: qty }];
    });
    showToast(`"${part.name.slice(0, 32)}..." agregado al carrito.`);
  };

  const removeFromCart = (partId: string) => {
    setCart((prev) => prev.filter((item) => item.part.id !== partId));
  };

  const updateQuantity = (partId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(partId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.part.id === partId ? { ...item, quantity: qty } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const addMachineToQuote = (
    machine: Machine, 
    needFinancing = true,
    customizations?: MachineCustomizationOption[],
    estimatedPriceRange?: { minUsd: number; maxUsd: number }
  ) => {
    setMachineQuotes((prev) => {
      const existingIndex = prev.findIndex((q) => q.machine.id === machine.id);
      const newItem: MachineQuoteItem = {
        machine,
        needFinancing,
        selectedCustomizations: customizations,
        estimatedPriceRange: estimatedPriceRange
      };

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = newItem;
        return updated;
      }
      return [...prev, newItem];
    });
    
    if (customizations && customizations.length > 0) {
      showToast(`"${machine.name}" configurado (${customizations.length} opciones) añadido a cotización.`);
    } else {
      showToast(`"${machine.name}" añadido a tu solicitud de cotización.`);
    }
  };

  const removeMachineFromQuote = (machineId: string) => {
    setMachineQuotes((prev) => prev.filter((q) => q.machine.id !== machineId));
  };

  const clearMachineQuotes = () => {
    setMachineQuotes([]);
  };

  const applyCoupon = (code: string): boolean => {
    const trimmed = code.trim().toUpperCase();
    let percent = 0;
    if (trimmed === 'PRO-FILTERS-15' || trimmed === 'PRO-MEMBER-VIP' || trimmed === 'PRO-GOLD-15') {
      percent = 15;
    } else if (trimmed === 'PRO-GET-18') {
      percent = 18;
    } else if (trimmed === 'PRO-UNDERCARRIAGE-12') {
      percent = 12;
    } else if (trimmed === 'PRO-LUBES-10') {
      percent = 10;
    } else if (trimmed === 'PRO-PLATINUM-20' || trimmed === 'PRO-VIP-20') {
      percent = 20;
    } else if (trimmed === 'PRO-SILVER-10') {
      percent = 10;
    } else if (trimmed === 'BONO25-PRO' || trimmed === 'BONO50-FILTERS') {
      percent = 15;
    }

    if (percent > 0) {
      setAppliedCoupon(trimmed);
      setDiscountPercentage(percent);
      setIsProMemberDiscountActive(true);
      try {
        localStorage.setItem('tmd-applied-coupon', trimmed);
        localStorage.setItem('tmd-discount-percent', percent.toString());
        localStorage.setItem('tmd-pro-discount-active', 'true');
      } catch {
        // ignore
      }
      showToast(`¡Cupón ${trimmed} aplicado! ${percent}% de descuento en repuestos.`);
      return true;
    }

    showToast(`El código "${code}" no es válido o ha expirado.`);
    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountPercentage(0);
    setIsProMemberDiscountActive(false);
    try {
      localStorage.removeItem('tmd-applied-coupon');
      localStorage.removeItem('tmd-discount-percent');
      localStorage.removeItem('tmd-pro-discount-active');
    } catch {
      // ignore
    }
    showToast('Descuento de cupón removido.');
  };

  const setProMemberDiscount = (active: boolean, percentage: number = 15) => {
    setIsProMemberDiscountActive(active);
    const effPercent = active ? percentage : 0;
    setDiscountPercentage(effPercent);
    if (active && !appliedCoupon) {
      setAppliedCoupon('PRO-MEMBER-VIP');
    } else if (!active) {
      setAppliedCoupon(null);
    }
    try {
      localStorage.setItem('tmd-pro-discount-active', active ? 'true' : 'false');
      localStorage.setItem('tmd-discount-percent', effPercent.toString());
    } catch {
      // ignore
    }
    if (active) {
      showToast(`¡Beneficio TMD Pro-Member activado! ${percentage}% de descuento aplicado.`);
    } else {
      showToast('Descuento Pro-Member desactivado.');
    }
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalQuotesCount = machineQuotes.length;

  const subtotalUsd = cart.reduce((acc, item) => acc + item.part.priceUsd * item.quantity, 0);
  const discountUsd = (isProMemberDiscountActive || discountPercentage > 0) 
    ? Number(((subtotalUsd * (discountPercentage / 100))).toFixed(2))
    : 0;
  const taxableSubtotalUsd = Math.max(0, subtotalUsd - discountUsd);
  const itbisUsd = Number((taxableSubtotalUsd * 0.18).toFixed(2)); // 18% ITBIS Dominican Republic
  const shippingUsd = subtotalUsd > 0 ? (subtotalUsd >= 500 ? 0 : 25) : 0; // Free shipping over $500
  const totalUsd = taxableSubtotalUsd + itbisUsd + shippingUsd;
  const activeExchangeRate = exchangeRateData.rate || USD_TO_DOP_RATE;
  const totalDop = totalUsd * activeExchangeRate;

  const formatPrice = (amountUsd: number): string => {
    if (currency === 'DOP') {
      const amountDop = amountUsd * activeExchangeRate;
      return `RD$ ${amountDop.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `US$ ${amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        machineQuotes,
        currency,
        setCurrency,
        exchangeRate: activeExchangeRate,
        exchangeRateData,
        isSyncingRate,
        refreshExchangeRate,
        formatPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        addMachineToQuote,
        removeMachineFromQuote,
        clearMachineQuotes,
        totalCartCount,
        totalQuotesCount,
        subtotalUsd,
        discountPercentage,
        discountUsd,
        appliedCoupon,
        isProMemberDiscountActive,
        applyCoupon,
        removeCoupon,
        setProMemberDiscount,
        itbisUsd,
        shippingUsd,
        totalUsd,
        totalDop,
        notification,
        showToast,
        dismissNotification: () => setNotification(null),
        savedProfile,
        saveProfile,
        clearSavedProfile
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
