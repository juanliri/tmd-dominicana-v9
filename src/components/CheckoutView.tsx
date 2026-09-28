import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle2, 
  CreditCard, 
  Building2, 
  Truck, 
  FileText, 
  Phone, 
  Printer, 
  Download,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Calendar,
  DollarSign,
  AlertCircle,
  Zap,
  Check,
  Lock,
  BookmarkCheck,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Crown,
  Tag,
  Clock,
  Repeat,
  PenTool
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { CustomerDetails, PaymentMethod, DeliveryMethod, CompletedOrder, SavedCustomerProfile } from '../types';
import { USD_TO_DOP_RATE } from '../data/catalog';
import { createPurchaseOrder } from '../services/orderService';
import { downloadOrderInvoicePDF } from '../utils/pdfGenerator';
import { triggerRfqCrmInquiryLogging } from '../services/crmService';
import { createFullbayCounterSale } from '../lib/fullbayService';
import { PortalQuote } from '../types';
import { verifyDgiiTaxId, DOMINICAN_RNC_REGISTRY } from '../services/dgiiRncService';
import { DgiiTaxWithholdingBreakdown, DgiiTaxRegime } from './calculator/DgiiTaxWithholdingBreakdown';
import { CardnetAzulPaymentModal, CardPaymentResult } from './checkout/CardnetAzulPaymentModal';
import { QuoteExpirationAlertModal } from './quotes/QuoteExpirationAlertModal';
import { TradeInValuationModal } from './machinery/TradeInValuationModal';

interface CheckoutViewProps {
  onNavigate: (route: string) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ onNavigate }) => {
  const {
    cart,
    machineQuotes,
    updateQuantity,
    removeFromCart,
    removeMachineFromQuote,
    clearCart,
    clearMachineQuotes,
    subtotalUsd,
    discountUsd,
    discountPercentage,
    isProMemberDiscountActive,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    setProMemberDiscount,
    itbisUsd,
    shippingUsd,
    totalUsd,
    totalDop,
    currency,
    setCurrency,
    exchangeRate,
    exchangeRateData,
    refreshExchangeRate,
    isSyncingRate,
    formatPrice,
    savedProfile,
    saveProfile,
    clearSavedProfile
  } = useCart();
  const { currentUser, userProfile } = useAuth();
  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Multi-step progress state (Task #14): 1 = Review Items, 2 = Site & DGII, 3 = Payment Method, 4 = Emission & Signature
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Sprint 7 Modals and Extensions
  const [isCardnetModalOpen, setIsCardnetModalOpen] = useState(false);
  const [isQuoteExpirationModalOpen, setIsQuoteExpirationModalOpen] = useState(false);
  const [isTradeInModalOpen, setIsTradeInModalOpen] = useState(false);
  const [cardPaymentData, setCardPaymentData] = useState<CardPaymentResult | null>(null);
  const [tradeInCredit, setTradeInCredit] = useState<{ creditUsd: number; summary: string } | null>(null);

  // Formal digital signature & technical approval (Step 4)
  const [authorizedSigner, setAuthorizedSigner] = useState('');
  const [signerRole, setSignerRole] = useState('Ing. Residente de Obra / Gerente de Compras');
  const [isSignatureConfirmed, setIsSignatureConfirmed] = useState(true);

  // Toggle for optional Dominican fiscal tax invoice (RNC / DGII B01)
  const [needsFiscalInvoice, setNeedsFiscalInvoice] = useState(false);
  const [taxRegime, setTaxRegime] = useState<DgiiTaxRegime>('REGULAR');

  // Mobile order summary accordion toggle
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  const [customer, setCustomer] = useState<CustomerDetails>({
    fullName: savedProfile?.fullName || '',
    companyName: savedProfile?.companyName || '',
    rncOrCedula: savedProfile?.rncOrCedula || '',
    ncfType: savedProfile?.ncfType || 'B02_CONSUMIDOR_FINAL',
    phone: savedProfile?.phone || '',
    email: savedProfile?.email || '',
    city: savedProfile?.city || 'Santo Domingo',
    deliveryAddress: savedProfile?.deliveryAddress || '',
    paymentMethod: savedProfile?.preferredPayment || 'transfer',
    deliveryMethod: savedProfile?.preferredDelivery || 'pickup_km22',
    isGuest: true,
    saveInfoForFuture: !!savedProfile,
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);

  const hasItems = cart.length > 0 || machineQuotes.length > 0;

  // Auto-fill from saved profile on first mount if available
  useEffect(() => {
    if (savedProfile) {
      setCustomer((prev) => ({
        ...prev,
        fullName: savedProfile.fullName || prev.fullName,
        companyName: savedProfile.companyName || prev.companyName,
        rncOrCedula: savedProfile.rncOrCedula || prev.rncOrCedula,
        ncfType: savedProfile.ncfType || prev.ncfType,
        phone: savedProfile.phone || prev.phone,
        email: savedProfile.email || prev.email,
        city: savedProfile.city || prev.city,
        deliveryAddress: savedProfile.deliveryAddress || prev.deliveryAddress,
        paymentMethod: savedProfile.preferredPayment || prev.paymentMethod,
        deliveryMethod: savedProfile.preferredDelivery || prev.deliveryMethod,
        saveInfoForFuture: true
      }));
      if (savedProfile.rncOrCedula) {
        setNeedsFiscalInvoice(true);
      }
    }
  }, [savedProfile]);

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.fullName.trim() || !customer.phone.trim()) {
      return;
    }
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasItems) return;

    setIsSubmitting(true);

    // If user opted to save info for future purchases, store securely in localStorage
    if (customer.saveInfoForFuture) {
      saveProfile({
        fullName: customer.fullName,
        companyName: customer.companyName,
        rncOrCedula: customer.rncOrCedula,
        ncfType: customer.ncfType,
        phone: customer.phone,
        email: customer.email,
        city: customer.city,
        deliveryAddress: customer.deliveryAddress,
        preferredPayment: customer.paymentMethod,
        preferredDelivery: customer.deliveryMethod,
        savedAt: new Date().toISOString()
      });
    }

    const randomId = `TMD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const effectiveShipping = customer.deliveryMethod === 'pickup_km22' ? 0 : shippingUsd;
    const baseTotalUsd = Math.max(0, subtotalUsd - discountUsd) + itbisUsd + effectiveShipping;
    const appliedTradeInCreditUsd = tradeInCredit ? Math.min(baseTotalUsd, tradeInCredit.creditUsd) : 0;
    const finalTotalUsd = Math.max(0, baseTotalUsd - appliedTradeInCreditUsd);
    const finalTotalDop = Number((finalTotalUsd * exchangeRate).toFixed(2));

    const finalNotes = [
      customer.notes || '',
      cardPaymentData ? `[PAGO APROBADO: ${cardPaymentData.gateway.toUpperCase()} Auth: ${cardPaymentData.authorizationCode} | ${cardPaymentData.cardBrand.toUpperCase()} ****${cardPaymentData.last4}]` : '',
      tradeInCredit ? `[CRÉDITO PERMUTA TRADE-IN APLICADO: -US$ ${tradeInCredit.creditUsd.toLocaleString()} (${tradeInCredit.summary})]` : '',
      authorizedSigner ? `[FIRMA DIGITAL: ${authorizedSigner} (${signerRole})]` : ''
    ].filter(Boolean).join(' • ');

    const newOrder: CompletedOrder = {
      orderId: randomId,
      createdAt: new Date().toLocaleDateString('es-DO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      customer: { ...customer, notes: finalNotes },
      items: [...cart],
      machineQuotes: [...machineQuotes],
      subtotalUsd,
      itbisUsd,
      shippingUsd: effectiveShipping,
      totalUsd: finalTotalUsd,
      totalDop: finalTotalDop,
      status: 'confirmed'
    };

    // Save complete purchase order in orders collection and local persistence
    createPurchaseOrder({
      orderNumber: randomId,
      clientId: currentUser?.uid || 'guest',
      clientEmail: currentUser?.email || customer.email || '',
      clientName: customer.fullName || userProfile?.displayName || 'Cliente TMD',
      companyName: customer.companyName || userProfile?.companyName || '',
      phone: customer.phone || userProfile?.phone || '',
      customer: customer,
      cartItems: cart,
      machineQuotes: machineQuotes,
      subtotalUsd,
      itbisUsd,
      shippingUsd: effectiveShipping,
      totalUsd: finalTotalUsd,
      totalDop: finalTotalDop,
      exchangeRate: exchangeRate,
      currency: currency
    }).catch(err => {
      console.warn('Error saving customer purchase order:', err);
    });

    // If user is authenticated, also sync to Firestore quotes collection for the portal and trigger CRM subcollection logging
    if (currentUser) {
      try {
        const itemsSummaryText = [
          ...cart.map(c => `${c.quantity}x ${c.part.name}`),
          ...machineQuotes.map(m => `Equipo: ${m.machine.name}`)
        ].join(', ').slice(0, 480);

        const quoteDataToSave = {
          quoteNumber: randomId,
          clientId: currentUser.uid,
          clientEmail: currentUser.email || customer.email || '',
          clientName: customer.fullName || userProfile?.displayName || 'Cliente TMD',
          companyName: customer.companyName || userProfile?.companyName || '',
          phone: customer.phone || userProfile?.phone || '',
          status: 'submitted' as const,
          currency: currency,
          subtotal: subtotalUsd,
          itbis: itbisUsd,
          total: finalTotalUsd,
          itemsCount: cart.length + machineQuotes.length,
          itemsSummary: itemsSummaryText || 'Proforma de repuestos/maquinaria',
          notes: customer.notes || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        addDoc(collection(db, 'quotes'), quoteDataToSave).then(docRef => {
          const createdQuote: PortalQuote = { id: docRef.id, ...quoteDataToSave };
          triggerRfqCrmInquiryLogging(createdQuote, {
            source: 'checkout_cart',
            equipmentCategory: machineQuotes.length > 0 ? 'Maquinaria Pesada' : 'Repuestos OEM',
            equipmentInterested: itemsSummaryText,
            rncOrCedula: customer.rncOrCedula || '',
            financingMethod: customer.paymentMethod,
            customerNotes: customer.notes || ''
          }).catch(err => console.warn("CRM trigger logging notice:", err));
        }).catch(err => {
          console.warn("Could not sync quote to Firestore:", err);
        });
      } catch (err) {
        console.warn("Quote firestore sync error:", err);
      }
    }

    // Automatically synchronize parts counter-sale with Fullbay Connect (Warehouse Km 22)
    if (cart.length > 0) {
      createFullbayCounterSale({
        customerId: currentUser?.uid || 'cust-direct',
        customerName: customer.fullName || 'Cliente TMD',
        customerCompany: customer.companyName,
        customerEmail: customer.email,
        customerPhone: customer.phone || '(809) 560-1234',
        rncOrCedula: customer.rncOrCedula,
        paymentMethod: customer.paymentMethod === 'card' ? 'credit_card' : 'bank_transfer',
        subtotalUsd,
        itbisUsd,
        totalUsd: finalTotalUsd,
        totalDop: finalTotalDop,
        items: cart.map(c => ({
          partNumber: c.part.partNumber,
          name: c.part.name,
          brand: c.part.brand,
          quantity: c.quantity,
          unitPriceUsd: c.part.priceUsd,
          totalPriceUsd: c.part.priceUsd * c.quantity,
          binLocation: 'Almacén Central Km 22 - Pasillo A'
        }))
      }).catch(err => {
        console.warn('Fullbay counter sale background sync notice:', err);
      });
    }

    setTimeout(() => {
      setCompletedOrder(newOrder);
      clearCart();
      clearMachineQuotes();
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 500);
  };

  const getWhatsAppMessage = (order: CompletedOrder) => {
    let msg = `*PROFORMA OFICIAL TMD DOMINICANA*\n`;
    msg += `*Orden N°:* ${order.orderId}\n`;
    msg += `*Cliente:* ${order.customer.fullName} ${order.customer.companyName ? `(${order.customer.companyName})` : ''}\n`;
    if (order.customer.rncOrCedula) {
      msg += `*RNC/Cédula:* ${order.customer.rncOrCedula} (${order.customer.ncfType})\n`;
    }
    msg += `*Teléfono:* ${order.customer.phone}\n`;
    msg += `*Entrega:* ${order.customer.deliveryMethod === 'pickup_km22' ? 'Retiro en Sede Km 22 Autopista Duarte' : (order.customer.deliveryAddress || '') + ', ' + order.customer.city}\n\n`;

    if (order.items.length > 0) {
      msg += `*REPUESTOS SOLICITADOS:*\n`;
      order.items.forEach((item) => {
        msg += `- [${item.quantity}x] ${item.part.partNumber} | ${item.part.name} (US$ ${(item.part.priceUsd * item.quantity).toFixed(2)})\n`;
      });
      msg += `\n*Subtotal:* US$ ${order.subtotalUsd.toFixed(2)}\n`;
      msg += `*ITBIS (18%):* US$ ${order.itbisUsd.toFixed(2)}\n`;
      msg += `*Total Repuestos:* US$ ${order.totalUsd.toFixed(2)} / RD$ ${order.totalDop.toLocaleString('es-DO', { maximumFractionDigits: 2 })}\n\n`;
    }

    if (order.machineQuotes && order.machineQuotes.length > 0) {
      msg += `*MAQUINARIA A COTIZAR:*\n`;
      order.machineQuotes.forEach((q) => {
        if (q.estimatedPriceRange) {
          msg += `- ${q.machine.name} (Rango Est.: US$ ${q.estimatedPriceRange.minUsd.toLocaleString()} – US$ ${q.estimatedPriceRange.maxUsd.toLocaleString()})\n`;
        } else {
          msg += `- ${q.machine.name} (Ref: US$ ${q.machine.basePriceUsd.toLocaleString()})\n`;
        }
        if (q.selectedCustomizations && q.selectedCustomizations.length > 0) {
          q.selectedCustomizations.forEach(c => {
            const cost = c.maxPriceUsd > 0 ? ` (+US$ ${c.minPriceUsd} - ${c.maxPriceUsd})` : '';
            msg += `   • ${c.name}${cost}\n`;
          });
        }
      });
      msg += `\n`;
    }

    msg += `*Método de Pago Seleccionado:* ${order.customer.paymentMethod}\n`;
    msg += `Favor confirmar disponibilidad y coordinar despacho.`;
    return encodeURIComponent(msg);
  };

  // 1-Click WhatsApp Express Checkout (Zero-Friction alternative)
  const handleExpressWhatsAppOrder = () => {
    let quickMsg = `*ORDEN EXPRESS DESDE TMD WEB*\n`;
    if (cart.length > 0) {
      quickMsg += `*REPUESTOS EN CARRO:*\n`;
      cart.forEach((item) => {
        quickMsg += `- ${item.quantity}x ${item.part.partNumber} (${item.part.name})\n`;
      });
      quickMsg += `*Total Estimado:* ${formatPrice(totalUsd)}\n\n`;
    }
    if (machineQuotes.length > 0) {
      quickMsg += `*EQUIPOS A COTIZAR:*\n`;
      machineQuotes.forEach((q) => {
        quickMsg += `- ${q.machine.name}\n`;
      });
      quickMsg += `\n`;
    }
    quickMsg += `Hola TMD Dominicana, deseo formalizar este pedido directamente con un asesor.`;
    window.open(`https://wa.me/18095601234?text=${encodeURIComponent(quickMsg)}`, '_blank');
  };

  // If order is completed, show the Streamlined Confirmation Screen
  if (completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 font-display">
        <div className="bg-zinc-950 rounded-[5px] border border-zinc-800 p-6 sm:p-10 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 text-white">
          <div className="text-center pb-6 border-b border-zinc-800">
            <div className="w-16 h-16 rounded-[4px] bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
              PROFORMA Y PEDIDO CONFIRMADO
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 uppercase tracking-tight">
              ORDEN #{completedOrder.orderId}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-mono">
              REGISTRADA EL {completedOrder.createdAt} • TECNOMAQUINARIAS DIESEL S.R.L.
            </p>
          </div>

          {/* Customer & Billing Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-zinc-900 p-4 rounded-[3px] border border-zinc-800 font-mono">
            <div>
              <span className="text-zinc-500 block font-medium uppercase">CLIENTE:</span>
              <span className="font-bold text-white uppercase">
                {completedOrder.customer.fullName} {completedOrder.customer.companyName && `(${completedOrder.customer.companyName})`}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block font-medium uppercase">COMPROBANTE FISCAL:</span>
              <span className="font-bold text-white uppercase">
                {completedOrder.customer.rncOrCedula ? `${completedOrder.customer.rncOrCedula} • ${completedOrder.customer.ncfType}` : 'CONSUMIDOR FINAL (B02)'}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block font-medium uppercase">TELÉFONO / WHATSAPP:</span>
              <span className="font-bold text-white">
                {completedOrder.customer.phone}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block font-medium uppercase">DESPACHO:</span>
              <span className="font-bold text-amber-400 uppercase">
                {completedOrder.customer.deliveryMethod === 'pickup_km22'
                  ? 'RETIRO EN ALMACÉN CENTRAL KM 22 (GRATIS)'
                  : `ENVÍO A: ${completedOrder.customer.deliveryAddress || completedOrder.customer.city}`}
              </span>
            </div>
          </div>

          {/* Fullbay Connect Sync Status */}
          {completedOrder.items.length > 0 && (
            <div className="p-3 rounded-[3px] bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>VENTA DE MOSTRADOR ENVIADA A FULLBAY CONNECT • ALMACÉN KM 22</span>
              </span>
              <span className="font-bold text-[10px] uppercase bg-amber-400/20 text-amber-400 px-2 py-0.5 rounded-[2px] border border-amber-400/30">
                Sincronizado
              </span>
            </div>
          )}

          {/* Items Breakdown */}
          {completedOrder.items.length > 0 && (
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-2">
                REPUESTOS EN LA ORDEN ({completedOrder.items.length})
              </h3>
              <div className="space-y-2 border border-zinc-800 rounded-[3px] divide-y divide-zinc-800 overflow-hidden">
                {completedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs bg-zinc-900">
                    <div className="pr-2">
                      <span className="font-mono font-bold text-amber-400 block">
                        P/N: {item.part.partNumber}
                      </span>
                      <span className="font-bold text-white uppercase">
                        {item.part.name}
                      </span>
                      <span className="text-zinc-400 block text-[11px] font-mono">
                        CANTIDAD: {item.quantity} × US$ {item.part.priceUsd.toFixed(2)}
                      </span>
                    </div>
                    <span className="font-mono font-black text-white shrink-0">
                      US$ {(item.part.priceUsd * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Machinery Quotes Breakdown */}
          {completedOrder.machineQuotes && completedOrder.machineQuotes.length > 0 && (
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-2">
                EQUIPOS DE FLOTA A COTIZAR ({completedOrder.machineQuotes.length})
              </h3>
              <div className="space-y-2 border border-zinc-800 rounded-[3px] divide-y divide-zinc-800 overflow-hidden">
                {completedOrder.machineQuotes.map((q, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs bg-zinc-900">
                    <div>
                      <span className="font-bold text-white block uppercase">
                        {q.machine.name}
                      </span>
                      <span className="text-zinc-400 text-[11px] uppercase font-mono">
                        {q.machine.brand} • MOD. {q.machine.modelCode} • GARANTÍA TMD CARE
                      </span>
                    </div>
                    <span className="font-mono font-bold text-amber-400 shrink-0">
                      US$ {q.machine.basePriceUsd.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment & Bank Details Notice */}
          <div className="p-4 rounded-[3px] bg-zinc-900 border border-zinc-800 text-xs space-y-2 font-mono">
            <span className="font-bold text-white block uppercase">
              CUENTAS BANCARIAS AUTORIZADAS TMD DOMINICANA PARA TRANSFERENCIAS:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-300">
              <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
                <span className="font-bold block uppercase text-amber-400">BANCO POPULAR DOMINICANO (USD):</span>
                <span>CTA. CTE: <strong className="text-white">784-92819-2</strong></span>
              </div>
              <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
                <span className="font-bold block uppercase text-amber-400">BANCO BHD LEÓN (PESOS RD$):</span>
                <span>CTA. CTE: <strong className="text-white">102-83719-0</strong></span>
              </div>
            </div>
          </div>

          {/* Financial Totals */}
          {completedOrder.items.length > 0 && (
            <div className="p-4 rounded-[3px] bg-zinc-900 border border-zinc-800 text-white space-y-2 text-xs font-mono">
              <div className="flex justify-between text-zinc-400 uppercase">
                <span>SUBTOTAL REPUESTOS:</span>
                <span className="text-white">US$ {completedOrder.subtotalUsd.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-400 uppercase">
                <span>ITBIS (18% LEY DOMINICANA):</span>
                <span className="text-white">US$ {completedOrder.itbisUsd.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-400 uppercase">
                <span>DESPACHO / FLETE:</span>
                <span className="text-white">{completedOrder.shippingUsd === 0 ? 'GRATIS (RETIRO KM 22)' : `US$ ${completedOrder.shippingUsd.toFixed(2)}`}</span>
              </div>
              <div className="pt-2 border-t border-zinc-800 flex justify-between items-baseline text-sm sm:text-base font-black">
                <span className="uppercase">TOTAL A PAGAR:</span>
                <div className="text-right">
                  <span className="text-amber-400 block">US$ {completedOrder.totalUsd.toFixed(2)}</span>
                  <span className="text-xs text-zinc-400 font-normal">
                    ≈ RD$ {completedOrder.totalDop.toLocaleString('es-DO', { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
            <a
              href={`https://wa.me/18095601234?text=${getWhatsAppMessage(completedOrder)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 bg-zinc-900 hover:bg-zinc-850 text-emerald-400 border border-zinc-800 font-black uppercase tracking-wider rounded-[3px] text-xs transition-colors shadow-lg cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>ENVIAR PROFORMA POR WHATSAPP</span>
            </a>

            <button
              onClick={() => {
                if (completedOrder) {
                  downloadOrderInvoicePDF(
                    {
                      id: completedOrder.orderId,
                      orderNumber: completedOrder.orderId,
                      clientId: currentUser?.uid || 'guest',
                      clientEmail: completedOrder.customer.email || 'cliente@tmd.rd',
                      clientName: completedOrder.customer.fullName || 'Cliente TMD',
                      companyName: completedOrder.customer.companyName || '',
                      phone: completedOrder.customer.phone || '',
                      items: completedOrder.items.map(i => ({
                        id: i.part.id,
                        name: i.part.name,
                        partNumber: i.part.partNumber,
                        brand: i.part.brand,
                        category: i.part.category || 'Repuestos OEM',
                        priceUsd: i.part.priceUsd,
                        quantity: i.quantity,
                        image: i.part.image || '',
                        isOem: i.part.isOem ?? true,
                        type: 'part' as const
                      })),
                      itemsCount: completedOrder.items.reduce((acc, item) => acc + item.quantity, 0),
                      subtotalUsd: completedOrder.subtotalUsd,
                      itbisUsd: completedOrder.itbisUsd,
                      shippingUsd: completedOrder.shippingUsd,
                      totalUsd: completedOrder.totalUsd,
                      totalDop: completedOrder.totalDop,
                      currency: 'USD',
                      paymentMethod: completedOrder.customer.paymentMethod,
                      paymentStatus: 'pending_verification',
                      deliveryMethod: completedOrder.customer.deliveryMethod,
                      deliveryAddress: completedOrder.customer.deliveryAddress,
                      city: completedOrder.customer.city,
                      ncfType: completedOrder.customer.ncfType,
                      ncfNumber: completedOrder.customer.rncOrCedula ? `B01000${Math.floor(100000 + Math.random() * 900000)}` : '',
                      rncOrCedula: completedOrder.customer.rncOrCedula || '',
                      status: 'processing',
                      trackingNumber: `TMD-LOG-${Math.floor(100000 + Math.random() * 900000)}`,
                      carrier: 'Centro Logístico TMD Km 22 Autopista Duarte',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      timeline: []
                    },
                    `Proforma_DGII_TMD_${completedOrder.orderId}.pdf`
                  );
                }
              }}
              className="inline-flex items-center justify-center gap-2 py-3 px-4 bg-zinc-900 hover:bg-zinc-850 text-amber-400 border border-amber-400/30 font-black uppercase tracking-wider rounded-[3px] text-xs transition-colors cursor-pointer shadow-sm"
              title="Descargar Factura Proforma Oficial DGII (PDF)"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>DESCARGAR PDF</span>
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 py-3 px-4 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 font-black uppercase tracking-wider rounded-[3px] text-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>IMPRIMIR</span>
            </button>

            <button
              onClick={() => {
                setCompletedOrder(null);
                onNavigate('#/portal');
              }}
              className="inline-flex items-center justify-center gap-2 py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase tracking-wider border border-zinc-800 rounded-[3px] text-xs transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>PORTAL CLIENTES</span>
            </button>

            <button
              onClick={() => {
                setCompletedOrder(null);
                onNavigate('#/home');
              }}
              className="inline-flex items-center justify-center gap-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider rounded-[3px] text-xs transition-colors cursor-pointer"
            >
              <span>VOLVER AL INICIO</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 font-display">
      {/* Top Header & Fast Currency Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <button
            onClick={() => onNavigate('#/parts')}
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-400 hover:text-amber-400 transition-colors mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>SEGUIR EXPLORANDO CATÁLOGO</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            CHECKOUT EXPRESS TMD
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Compra de repuestos y proformas oficiales en menos de 1 minuto sin registros forzados.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Saved Customer Status Badge */}
          {savedProfile && (
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 text-amber-400 px-3 py-1 rounded-[3px] text-xs font-black uppercase">
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PERFIL:</span>
              <span>{savedProfile.fullName.split(' ')[0].toUpperCase()}</span>
              <button
                type="button"
                onClick={clearSavedProfile}
                title="Olvidar mis datos"
                className="ml-1 text-zinc-500 hover:text-red-400 text-[10px]"
              >
                (BORRAR)
              </button>
            </div>
          )}

          {/* Currency Toggle & Live DOP Rate Indicator */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-[3px] text-[11px] font-mono text-zinc-300">
              <span className="text-zinc-500 font-bold">TASA:</span>
              <span className="font-bold text-amber-400">1 USD = RD$ {exchangeRate.toFixed(2)}</span>
              <button
                type="button"
                onClick={() => refreshExchangeRate()}
                disabled={isSyncingRate}
                title={`Sincronizar tasa en vivo (${exchangeRateData.source})`}
                className="text-zinc-400 hover:text-amber-400 cursor-pointer transition-colors disabled:opacity-50 ml-0.5"
              >
                <RotateCcw className={`w-3 h-3 ${isSyncingRate ? 'animate-spin text-amber-400' : ''}`} />
              </button>
            </div>

            <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-[4px] border border-zinc-800 font-mono">
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1 rounded-[3px] text-xs font-black uppercase transition-all ${
                  currency === 'USD' ? 'bg-zinc-800 text-amber-400 border border-zinc-700 shadow-xs' : 'text-zinc-400 hover:text-white'
                }`}
              >
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => setCurrency('DOP')}
                className={`px-3 py-1 rounded-[3px] text-xs font-black uppercase transition-all ${
                  currency === 'DOP' ? 'bg-zinc-800 text-amber-400 border border-zinc-700 shadow-xs' : 'text-zinc-400 hover:text-white'
                }`}
              >
                RD$
              </button>
            </div>
          </div>
        </div>
      </div>

      {!hasItems ? (
        <div className="text-center py-16 bg-zinc-950 rounded-[5px] border border-zinc-800 max-w-2xl mx-auto p-8 shadow-sm">
          <ShoppingCart className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h2 className="text-xl font-black text-white uppercase tracking-wider">
            TU CARRITO DE COTIZACIÓN ESTÁ VACÍO
          </h2>
          <p className="text-xs text-zinc-400 mt-2 max-w-sm mx-auto">
            Agrega repuestos genuinos o selecciona maquinaria de flota para emitir tu proforma oficial con crédito fiscal.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <button
              onClick={() => onNavigate('#/parts')}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs rounded-[3px] transition-all cursor-pointer shadow-md"
            >
              VER REPUESTOS GENUINOS
            </button>
            <button
              onClick={() => onNavigate('#/machinery')}
              className="px-5 py-2.5 bg-zinc-900 text-zinc-200 border border-zinc-800 font-black uppercase tracking-wider text-xs rounded-[3px] hover:bg-zinc-800 transition-all cursor-pointer"
            >
              VER CATÁLOGO DE MAQUINARIA
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* CLEAR 4-STAGE INTERACTIVE PROGRESS STEPPER (Task #14) */}
          <div className="bg-zinc-950 rounded-[5px] border border-zinc-800 p-4 shadow-sm">
            <div className="flex items-center justify-between max-w-3xl mx-auto relative">
              {/* Background Connecting track */}
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-zinc-800 -z-0" />
              {/* Dynamic Animated Gold Progress Fill */}
              <div 
                className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-amber-400 transition-all duration-300 -z-0"
                style={{ 
                  width: currentStep === 1 ? '0%' : currentStep === 2 ? '33%' : currentStep === 3 ? '66%' : '94%' 
                }}
              />

              {/* Step 1: Revisión de Artículos */}
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`relative z-10 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-[4px] text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                  currentStep === 1
                    ? 'bg-zinc-800 text-amber-400 border-amber-500/80 shadow-md ring-1 ring-amber-500/40'
                    : currentStep > 1
                    ? 'bg-zinc-900 text-zinc-200 border-zinc-700'
                    : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                }`}
                title="Paso 1: Revisión de Repuestos y Maquinaria"
              >
                {currentStep > 1 ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <span>1</span>}
                <span className="hidden sm:inline">1. ARTÍCULOS</span>
              </button>

              {/* Step 2: Datos de Obra & Fiscalidad DGII */}
              <button
                type="button"
                onClick={() => {
                  if (hasItems) setCurrentStep(2);
                }}
                className={`relative z-10 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-[4px] text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                  currentStep === 2
                    ? 'bg-zinc-800 text-amber-400 border-amber-500/80 shadow-md ring-1 ring-amber-500/40'
                    : currentStep > 2
                    ? 'bg-zinc-900 text-zinc-200 border-zinc-700'
                    : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                }`}
                title="Paso 2: Datos de Obra y Fiscalidad DGII"
              >
                {currentStep > 2 ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <span>2</span>}
                <span className="hidden sm:inline">2. OBRA & DGII</span>
              </button>

              {/* Step 3: Método de Pago & Facilidades */}
              <button
                type="button"
                onClick={() => {
                  if (customer.fullName && customer.phone) setCurrentStep(3);
                }}
                className={`relative z-10 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-[4px] text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                  currentStep === 3
                    ? 'bg-zinc-800 text-amber-400 border-amber-500/80 shadow-md ring-1 ring-amber-500/40'
                    : currentStep > 3
                    ? 'bg-zinc-900 text-zinc-200 border-zinc-700'
                    : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                }`}
                title="Paso 3: Método de Pago y Permuta Trade-In"
              >
                {currentStep > 3 ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <span>3</span>}
                <span className="hidden sm:inline">3. PAGO</span>
              </button>

              {/* Step 4: Emisión Oficial & Firma */}
              <button
                type="button"
                onClick={() => {
                  if (customer.fullName && customer.phone) setCurrentStep(4);
                }}
                className={`relative z-10 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-[4px] text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                  currentStep === 4
                    ? 'bg-zinc-800 text-amber-400 border-amber-500/80 shadow-md ring-1 ring-amber-500/40'
                    : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                }`}
                title="Paso 4: Emisión Oficial y Firma Digital"
              >
                <span>4</span>
                <span className="hidden sm:inline">4. EMISIÓN & FIRMA</span>
              </button>
            </div>
          </div>

          {/* 1-Click Express WhatsApp Action Banner for mobile field operators */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-[5px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[4px] bg-zinc-900 border border-zinc-800 text-amber-400 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black uppercase tracking-wider text-xs sm:text-sm text-white block">
                  ¿EN FAENA U OBRA Y CON PRISA?
                </span>
                <span className="text-[11px] text-zinc-400">
                  Despacha este pedido en 1 solo toque directo al WhatsApp del Almacén Km 22.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleExpressWhatsAppOrder}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-zinc-800 text-xs font-black uppercase tracking-wider rounded-[3px] shadow transition-colors shrink-0 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>PEDIR POR WHATSAPP (1-TOQUE)</span>
            </button>
          </div>

          {/* Mobile Collapsible Summary Banner */}
          <div className="lg:hidden bg-zinc-950 border border-zinc-800 rounded-[5px] p-3.5">
            <button
              type="button"
              onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
              className="w-full flex items-center justify-between text-xs font-black uppercase text-white tracking-wider"
            >
              <span className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-amber-400" />
                <span>RESUMEN: {cart.length} REPUESTOS, {machineQuotes.length} EQUIPOS</span>
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 font-black font-mono">
                <span>{formatPrice(totalUsd)}</span>
                {isMobileSummaryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>

            {isMobileSummaryOpen && (
              <div className="pt-3 mt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                {cart.map((item) => (
                  <div key={item.part.id} className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-600 dark:text-zinc-300 truncate max-w-[200px]">
                      {item.quantity}x {item.part.name}
                    </span>
                    <span className="font-bold">{formatPrice(item.part.priceUsd * item.quantity)}</span>
                  </div>
                ))}
                {machineQuotes.map((q) => (
                  <div key={q.machine.id} className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-600 dark:text-zinc-300">{q.machine.name}</span>
                    <span className="text-amber-500 font-bold">Cotización</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* STEP 1: REVIEW & ADJUST ITEMS */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 bg-zinc-950 rounded-[5px] border border-zinc-800 p-5 sm:p-7 shadow-sm space-y-6 text-white">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                    1. REVISA LOS ARTÍCULOS DE TU PEDIDO
                  </h3>
                  <span className="text-xs text-zinc-400 font-mono">PASO 1 DE 3</span>
                </div>

                {/* Spare Parts in Cart */}
                {cart.length > 0 && (
                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-3">
                      REPUESTOS GENUINOS ({cart.length})
                    </h4>
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div
                          key={item.part.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-[4px] bg-zinc-900 border border-zinc-800"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={item.part.image}
                              alt={item.part.name}
                              className="w-14 h-14 rounded-[3px] object-cover bg-zinc-800 shrink-0 border border-zinc-700"
                            />
                            <div>
                              <span className="font-mono text-[11px] font-bold text-amber-400 block">
                                P/N: {item.part.partNumber}
                              </span>
                              <h5 className="font-bold text-sm text-white uppercase">
                                {item.part.name}
                              </h5>
                              <span className="text-xs text-zinc-400 font-mono">
                                {item.part.brand} • {formatPrice(item.part.priceUsd)} c/u
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                            <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 p-1 rounded-[3px] font-mono">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.part.id, item.quantity - 1)}
                                className="p-1 rounded-[2px] text-zinc-400 hover:text-amber-400 hover:bg-zinc-800"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-6 text-center font-bold text-xs text-white">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.part.id, item.quantity + 1)}
                                className="p-1 rounded-[2px] text-zinc-400 hover:text-amber-400 hover:bg-zinc-800"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="font-mono font-black text-sm text-white min-w-[80px] text-right">
                              {formatPrice(item.part.priceUsd * item.quantity)}
                            </div>

                            <button
                              type="button"
                              onClick={() => removeFromCart(item.part.id)}
                              className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                              title="Eliminar repuesto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Machinery In Quote */}
                {machineQuotes.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-3">
                      EQUIPOS PESADOS PARA PROFORMA ({machineQuotes.length})
                    </h4>
                    <div className="space-y-3">
                      {machineQuotes.map((q) => (
                        <div
                          key={q.machine.id}
                          className="flex items-center justify-between gap-3 p-3.5 rounded-[4px] bg-zinc-900 border border-zinc-800"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={q.machine.image}
                              alt={q.machine.name}
                              className="w-14 h-14 rounded-[3px] object-cover bg-zinc-800 shrink-0 border border-zinc-700"
                            />
                            <div>
                              <span className="text-[11px] font-mono font-bold text-amber-400 block uppercase">
                                {q.machine.brand} • {q.machine.category}
                              </span>
                              <h5 className="font-bold text-sm text-white uppercase">
                                {q.machine.name}
                              </h5>
                              
                              {q.estimatedPriceRange ? (
                                <div className="mt-1 space-y-1 font-mono">
                                  <div className="text-xs font-black text-amber-400 font-display">
                                    Rango Estimado: US$ {q.estimatedPriceRange.minUsd.toLocaleString()} – {q.estimatedPriceRange.maxUsd.toLocaleString()}
                                    <span className="font-normal text-zinc-400 text-[10px] ml-1">
                                      (~RD$ {(q.estimatedPriceRange.minUsd * USD_TO_DOP_RATE).toLocaleString('es-DO', { maximumFractionDigits: 0 })} – {(q.estimatedPriceRange.maxUsd * USD_TO_DOP_RATE).toLocaleString('es-DO', { maximumFractionDigits: 0 })})
                                    </span>
                                  </div>
                                  {q.selectedCustomizations && q.selectedCustomizations.length > 0 && (
                                    <div className="flex items-center gap-1 flex-wrap pt-1">
                                      <span className="text-[10px] px-2 py-0.5 rounded-[2px] bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20 uppercase">
                                        {q.selectedCustomizations.length} OPC. CONFIGURADAS
                                      </span>
                                      {q.selectedCustomizations.slice(0, 3).map((c) => (
                                        <span key={c.id} className="text-[10px] px-1.5 py-0.5 rounded-[2px] bg-zinc-950 text-zinc-300 border border-zinc-800 truncate max-w-[140px] uppercase">
                                          {c.name}
                                        </span>
                                      ))}
                                      {q.selectedCustomizations.length > 3 && (
                                        <span className="text-[10px] text-zinc-500">+{q.selectedCustomizations.length - 3} MÁS</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-zinc-400 font-mono">
                                  INVERSIÓN REFERENCIAL: US$ {q.machine.basePriceUsd.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeMachineFromQuote(q.machine.id)}
                            className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Continue button */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(2);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-8 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs shadow-md transition-all cursor-pointer"
                  >
                    <span>CONTINUAR A DATOS DE OBRA & FISCALIDAD (PASO 2)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sidebar Summary */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-zinc-950 rounded-[5px] border border-zinc-800 p-5 shadow-sm space-y-3 text-xs text-white font-mono">
                  <h4 className="font-black text-sm uppercase tracking-wider text-white pb-2 border-b border-zinc-800 font-display">
                    DESGLOSE FINANCIERO
                  </h4>
                  <div className="flex justify-between text-zinc-400 uppercase">
                    <span>SUBTOTAL REPUESTOS:</span>
                    <span className="font-semibold text-white">{formatPrice(subtotalUsd)}</span>
                  </div>

                  {discountUsd > 0 && (
                    <div className="flex justify-between items-center text-emerald-400 font-bold bg-zinc-900 p-2.5 rounded-[3px] border border-zinc-800">
                      <span className="flex items-center gap-1.5 uppercase">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isProMemberDiscountActive ? 'DESC. TMD PRO-MEMBER' : `CUPÓN ${appliedCoupon}`}:</span>
                      </span>
                      <span>-{formatPrice(discountUsd)} ({discountPercentage}%)</span>
                    </div>
                  )}

                  <div className="flex justify-between text-zinc-400 uppercase">
                    <span>ITBIS (18% LEY DOMINICANA):</span>
                    <span className="font-semibold text-white">{formatPrice(itbisUsd)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400 uppercase">
                    <span>RETIRO EN ALMACÉN KM 22:</span>
                    <span className="font-bold text-emerald-400">GRATIS</span>
                  </div>
                  <div className="pt-3 border-t border-zinc-800 flex justify-between items-baseline">
                    <span className="font-black text-xs text-white uppercase">TOTAL ESTIMADO:</span>
                    <span className="text-lg font-black text-amber-400">{formatPrice(totalUsd)}</span>
                  </div>
                </div>

                {/* Pro-Member Discount & Coupon Box */}
                <div className="bg-zinc-950 rounded-[5px] border border-zinc-800 p-5 shadow-sm space-y-3 text-xs text-white">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <span className="font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span>BENEFICIO TMD PRO-MEMBER</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-[2px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-black">
                      VIP
                    </span>
                  </div>

                  {currentUser ? (
                    <div className="space-y-2.5">
                      <div className="p-3 rounded-[3px] bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white block uppercase">
                            NIVEL {userProfile?.proMemberTier || 'Gold'}
                          </span>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            {(userProfile?.proMemberPoints || 1850).toLocaleString()} PUNTOS ACUMULADOS
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (isProMemberDiscountActive) {
                              setProMemberDiscount(false);
                            } else {
                              setProMemberDiscount(true, 15);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-[3px] font-black uppercase text-xs tracking-wider transition-all cursor-pointer ${
                            isProMemberDiscountActive
                              ? 'bg-zinc-800 text-emerald-400 border border-zinc-700 shadow-xs'
                              : 'bg-amber-500 hover:bg-amber-400 text-black'
                          }`}
                        >
                          {isProMemberDiscountActive ? '✓ 15% APLICADO' : 'ACTIVAR 15% VIP'}
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-mono">
                        LOS MIEMBROS PRO RECIBEN 15% DE DESCUENTO DIRECTO EN REPUESTOS GENUINOS.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 rounded-[3px] bg-zinc-900 border border-zinc-800 space-y-1.5">
                      <span className="font-bold text-white block uppercase">
                        ¿ERES MIEMBRO DE TMD PRO?
                      </span>
                      <p className="text-[11px] text-zinc-400">
                        Inicia sesión para aplicar tu descuento VIP exclusivo de hasta 20% en repuestos y acumular puntos.
                      </p>
                      <button
                        type="button"
                        onClick={() => onNavigate('#/portal')}
                        className="text-xs font-black uppercase tracking-wider text-amber-400 hover:text-amber-300 underline cursor-pointer"
                      >
                        INGRESAR A MI PORTAL &gt;
                      </button>
                    </div>
                  )}

                  {/* Manual Coupon Input */}
                  <div className="pt-2 border-t border-zinc-800 space-y-1.5">
                    <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-amber-400" />
                      <span>CÓDIGO DE CUPÓN PROMOCIONAL</span>
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="EJ: PRO-GOLD-15"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1 px-2.5 py-1.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-xs font-mono uppercase text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!couponInput.trim()) return;
                          const ok = applyCoupon(couponInput);
                          if (ok) {
                            setCouponMessage({ text: `¡Cupón "${couponInput}" aplicado con éxito!`, error: false });
                            setCouponInput('');
                          } else {
                            setCouponMessage({ text: 'Cupón no válido o no reconocido.', error: true });
                          }
                        }}
                        className="px-3 py-1.5 rounded-[3px] bg-zinc-800 hover:bg-zinc-700 text-white font-black uppercase text-xs tracking-wider cursor-pointer border border-zinc-700"
                      >
                        APLICAR
                      </button>
                    </div>
                    {couponMessage && (
                      <p className={`text-[10px] font-mono font-bold ${couponMessage.error ? 'text-red-400' : 'text-emerald-400'}`}>
                        {couponMessage.text}
                      </p>
                    )}
                    {appliedCoupon && !isProMemberDiscountActive && (
                      <div className="flex items-center justify-between text-[11px] text-emerald-400 font-mono font-bold">
                        <span>CUPÓN ACTIVO: {appliedCoupon} (-{discountPercentage}%)</span>
                        <button
                          type="button"
                          onClick={() => {
                            removeCoupon();
                            setCouponMessage(null);
                          }}
                          className="text-zinc-500 hover:text-red-400 underline cursor-pointer"
                        >
                          QUITAR
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: STREAMLINED CONTACT & DELIVERY (GUEST CHECKOUT & MINIMAL FIELDS) */}
          {currentStep === 2 && (
            <form onSubmit={handleStep2Submit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 bg-zinc-950 rounded-[5px] border border-zinc-800 p-5 sm:p-7 shadow-sm space-y-6 text-white">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div>
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                      2. DATOS DE CONTACTO Y DESPACHO EXPRESS
                    </h3>
                    <span className="text-xs text-zinc-400 font-mono">SOLO REQUERIMOS TU NOMBRE Y TELÉFONO PARA COORDINAR.</span>
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">PASO 2 DE 3</span>
                </div>

                {/* Minimal Required Contact Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <label className="block font-bold uppercase text-zinc-300 mb-1">
                      NOMBRE O RAZÓN SOCIAL *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ING. CARLOS PERALTA"
                      value={customer.fullName}
                      onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                      className="w-full p-2.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-zinc-300 mb-1">
                      TELÉFONO / WHATSAPP DE CONTACTO *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="(809) 560-1234"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className="w-full p-2.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Delivery Options */}
                <div>
                  <label className="block font-black uppercase tracking-wider text-xs text-zinc-300 mb-2 font-display">
                    ¿CÓMO DESEAS RECIBIR TU PEDIDO? *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      className={`p-3.5 rounded-[4px] border cursor-pointer transition-all flex flex-col justify-between ${
                        customer.deliveryMethod === 'pickup_km22'
                          ? 'border-amber-500 bg-zinc-900 text-white ring-1 ring-amber-500/40'
                          : 'border-zinc-800 bg-zinc-900/60 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-bold text-xs block uppercase text-white">RETIRO EN ALMACÉN CENTRAL</span>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            AUTOPISTA DUARTE KM 22, SANTO DOMINGO OESTE
                          </span>
                        </div>
                        <input
                          type="radio"
                          name="delivery"
                          checked={customer.deliveryMethod === 'pickup_km22'}
                          onChange={() => setCustomer({ ...customer, deliveryMethod: 'pickup_km22' })}
                          className="accent-amber-500"
                        />
                      </div>
                      <span className="text-[11px] font-mono font-bold text-emerald-400 mt-2 uppercase">
                        GRATIS • DISPONIBLE EN 1 HORA
                      </span>
                    </label>

                    <label
                      className={`p-3.5 rounded-[4px] border cursor-pointer transition-all flex flex-col justify-between ${
                        customer.deliveryMethod === 'nationwide_metropac'
                          ? 'border-amber-500 bg-zinc-900 text-white ring-1 ring-amber-500/40'
                          : 'border-zinc-800 bg-zinc-900/60 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-bold text-xs block uppercase text-white">ENVÍO A PROVINCIAS / OBRA</span>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            METROPAC, CARIBE TOURS O TRANSPORTE TMD
                          </span>
                        </div>
                        <input
                          type="radio"
                          name="delivery"
                          checked={customer.deliveryMethod === 'nationwide_metropac'}
                          onChange={() => setCustomer({ ...customer, deliveryMethod: 'nationwide_metropac' })}
                          className="accent-amber-500"
                        />
                      </div>
                      <span className="text-[11px] font-mono font-bold text-amber-400 mt-2 uppercase">
                        {subtotalUsd >= 500 ? 'GRATIS (PEDIDO > US$ 500)' : 'TARIFA PLANA US$ 25'}
                      </span>
                    </label>
                  </div>

                  {customer.deliveryMethod === 'nationwide_metropac' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-zinc-800 text-xs font-mono">
                      <div>
                        <label className="block font-bold uppercase text-zinc-300 mb-1">CIUDAD / DESTINO</label>
                        <select
                          value={customer.city}
                          onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                          className="w-full p-2.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500 uppercase"
                        >
                          <option>Santo Domingo / D.N.</option>
                          <option>Santiago de los Caballeros</option>
                          <option>Punta Cana / Bávaro</option>
                          <option>La Romana</option>
                          <option>La Vega</option>
                          <option>Puerto Plata</option>
                          <option>Bonao / Monseñor Nouel</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold uppercase text-zinc-300 mb-1">DIRECCIÓN DE ENVÍO</label>
                        <input
                          type="text"
                          placeholder="PARADA O DIRECCIÓN DE OBRA"
                          value={customer.deliveryAddress || ''}
                          onChange={(e) => setCustomer({ ...customer, deliveryAddress: e.target.value })}
                          className="w-full p-2.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 uppercase"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Optional Fiscal Invoice Toggle */}
                <div className="pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setNeedsFiscalInvoice(!needsFiscalInvoice)}
                    className="flex items-center justify-between w-full p-3 rounded-[3px] bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-200"
                  >
                    <span className="flex items-center gap-2 uppercase font-mono">
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>¿REQUIERE COMPROBANTE FISCAL B01 (DGII / RNC)?</span>
                    </span>
                    <span className="text-amber-400 font-mono font-black uppercase text-xs">
                      {needsFiscalInvoice ? 'OCULTAR CAMPOS FISCALES' : '+ AGREGAR RNC'}
                    </span>
                  </button>

                  {needsFiscalInvoice && (() => {
                    const rncVerification = verifyDgiiTaxId(customer.rncOrCedula || '');
                    return (
                      <div className="space-y-3 mt-3 p-3.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-xs font-mono animate-in fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block font-bold uppercase text-zinc-300">
                                RNC O CÉDULA FISCAL
                              </label>
                              {customer.rncOrCedula && (
                                <span className={`text-[10px] font-bold uppercase ${rncVerification.isValid ? 'text-emerald-400' : 'text-amber-400'}`}>
                                  {rncVerification.isValid ? '✓ VÁLIDO DGII' : 'VERIFICANDO'}
                                </span>
                              )}
                            </div>
                            <input
                              type="text"
                              placeholder="1-31-89024-5"
                              value={customer.rncOrCedula || ''}
                              onChange={(e) => {
                                const raw = e.target.value;
                                const verif = verifyDgiiTaxId(raw);
                                setCustomer((prev) => {
                                  const updated = { ...prev, rncOrCedula: verif.formatted || raw };
                                  if (verif.record) {
                                    updated.companyName = verif.record.businessName;
                                    updated.ncfType = verif.record.ncfPreferred;
                                  }
                                  return updated;
                                });
                              }}
                              className="w-full p-2.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 uppercase focus:border-amber-400 focus:outline-none"
                            />
                            {customer.rncOrCedula && (
                              <p className={`text-[10px] mt-1 ${rncVerification.isValid ? 'text-emerald-400' : 'text-zinc-400'}`}>
                                {rncVerification.validationMessage}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block font-bold uppercase text-zinc-300 mb-1">
                              TIPO DE COMPROBANTE DGII
                            </label>
                            <select
                              value={customer.ncfType}
                              onChange={(e: any) => setCustomer({ ...customer, ncfType: e.target.value })}
                              className="w-full p-2.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-white uppercase focus:border-amber-400 focus:outline-none"
                            >
                              <option value="B01_CREDITO_FISCAL">B01 - CRÉDITO FISCAL (EMPRESAS)</option>
                              <option value="B02_CONSUMIDOR_FINAL">B02 - CONSUMIDOR FINAL</option>
                              <option value="B14_REGIMEN_ESPECIAL">B14 - RÉGIMEN ESPECIAL (MINERÍA/ZONA FRANCA)</option>
                              <option value="B15_GUBERNAMENTAL">B15 - GUBERNAMENTAL (OBRAS PÚBLICAS)</option>
                            </select>
                          </div>
                        </div>

                        {/* If contractor record identified, show quick preview */}
                        {rncVerification.record && (
                          <div className="p-2.5 rounded-[3px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between gap-2">
                            <div>
                              <span className="font-bold uppercase block text-[11px] text-white">
                                {rncVerification.record.businessName}
                              </span>
                              <span className="text-[10px] text-zinc-400 block font-sans">
                                {rncVerification.record.category} • Régimen: {rncVerification.record.regime}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded-[2px] bg-emerald-400 text-black font-black text-[9px] uppercase tracking-wider shrink-0">
                              DGII ACTIVO
                            </span>
                          </div>
                        )}

                        {/* Quick Dominican Contractor Presets for Rapid Testing */}
                        <div className="pt-2 border-t border-zinc-800 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-zinc-500 uppercase">Sugerencias RNC:</span>
                          {Object.values(DOMINICAN_RNC_REGISTRY).slice(0, 3).map((reg) => (
                            <button
                              key={reg.rnc}
                              type="button"
                              onClick={() => {
                                setCustomer((prev) => ({
                                  ...prev,
                                  rncOrCedula: reg.rnc,
                                  companyName: reg.businessName,
                                  ncfType: reg.ncfPreferred
                                }));
                              }}
                              className="text-[9px] px-1.5 py-0.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 uppercase cursor-pointer"
                            >
                              {reg.commercialName}
                            </button>
                          ))}
                        </div>

                        {/* Task #70: Desglose Transparente de ITBIS y Retenciones Tributarias DGII */}
                        <div className="pt-3 border-t border-zinc-800">
                          <DgiiTaxWithholdingBreakdown
                            subtotalUsd={subtotalUsd - discountUsd}
                            exchangeRate={exchangeRate}
                            currency={currency}
                            selectedRegime={taxRegime}
                            onRegimeChange={(regime) => {
                              setTaxRegime(regime);
                              if (regime === 'ESTADO_B15') {
                                setCustomer((prev) => ({ ...prev, ncfType: 'B15_GUBERNAMENTAL' }));
                              } else if (regime === 'ZONA_FRANCA_B14') {
                                setCustomer((prev) => ({ ...prev, ncfType: 'B14_REGIMEN_ESPECIAL' }));
                              } else if (regime === 'GRAN_CONTRIBUYENTE' || regime === 'REGULAR') {
                                if (customer.ncfType === 'B02_CONSUMIDOR_FINAL' || customer.ncfType === 'B15_GUBERNAMENTAL' || customer.ncfType === 'B14_REGIMEN_ESPECIAL') {
                                  setCustomer((prev) => ({ ...prev, ncfType: 'B01_CREDITO_FISCAL' }));
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Remember Me / Save Information Securely */}
                <div className="flex items-center gap-2.5 pt-2">
                  <input
                    type="checkbox"
                    id="saveProfile"
                    checked={customer.saveInfoForFuture}
                    onChange={(e) => setCustomer({ ...customer, saveInfoForFuture: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded-[2px]"
                  />
                  <label htmlFor="saveProfile" className="text-xs text-zinc-400 font-mono uppercase cursor-pointer">
                    RECORDAR MIS DATOS PARA FUTURAS COMPRAS Y ÓRDENES EXPRESS
                  </label>
                </div>

                {/* Back and Forward navigation */}
                <div className="pt-4 flex items-center justify-between gap-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="py-2.5 px-5 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-black uppercase tracking-wider text-xs border border-zinc-800 transition-colors cursor-pointer"
                  >
                    VOLVER A ARTÍCULOS
                  </button>

                  <button
                    type="submit"
                    className="py-3 px-8 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>CONTINUAR AL PASO 3: MÉTODO DE PAGO & PERMUTA</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Step 2 summary card */}
              <div className="lg:col-span-4 bg-zinc-950 rounded-[5px] border border-zinc-800 p-5 shadow-sm text-xs font-mono text-white space-y-3">
                <h4 className="font-black text-sm uppercase tracking-wider text-white pb-2 border-b border-zinc-800 font-display">
                  RESUMEN DE ENTREGA
                </h4>
                <div className="flex justify-between">
                  <span className="text-zinc-400 uppercase">DESTINO:</span>
                  <span className="font-bold text-white uppercase">
                    {customer.deliveryMethod === 'pickup_km22' ? 'SEDE CENTRAL KM 22' : customer.city}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 uppercase">FLETE:</span>
                  <span className="font-bold text-emerald-400">
                    {customer.deliveryMethod === 'pickup_km22' ? 'GRATIS' : '$25 USD'}
                  </span>
                </div>
                {discountUsd > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span className="uppercase">DESCUENTO VIP PRO:</span>
                    <span>-{formatPrice(discountUsd)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-zinc-800 flex justify-between items-baseline">
                  <span className="font-black text-xs uppercase">TOTAL A PAGAR:</span>
                  <span className="text-base font-black text-amber-400">
                    {formatPrice(
                      (subtotalUsd - discountUsd) +
                        itbisUsd +
                        (customer.deliveryMethod === 'pickup_km22' ? 0 : shippingUsd)
                    )}
                  </span>
                </div>
              </div>
            </form>
          )}

          {/* STEP 3: PAYMENT METHOD & TRADE-IN APPRAISAL (Task #14, #68, #75) */}
          {currentStep === 3 && (
            <form onSubmit={handleStep3Submit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 bg-zinc-950 rounded-[5px] border border-zinc-800 p-5 sm:p-7 shadow-sm space-y-6 text-white">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div>
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                      3. MÉTODO DE PAGO & FACILIDADES COMERCIALES
                    </h3>
                    <span className="text-xs text-zinc-400 font-mono">SELECCIONA TU FORMA DE PAGO O APLICA PERMUTA DE MAQUINARIA.</span>
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">PASO 3 DE 4</span>
                </div>

                {/* 3 Payment Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label
                    className={`p-4 rounded-[4px] border cursor-pointer transition-all flex flex-col justify-between ${
                      customer.paymentMethod === 'transfer'
                        ? 'border-amber-500 bg-zinc-900 text-white ring-1 ring-amber-500/40'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Building2 className="w-5 h-5 text-amber-400" />
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={customer.paymentMethod === 'transfer'}
                          onChange={() => setCustomer({ ...customer, paymentMethod: 'transfer' })}
                          className="accent-amber-500"
                        />
                      </div>
                      <span className="font-bold text-xs block uppercase text-white">TRANSFERENCIA BANCARIA</span>
                      <span className="text-[11px] text-zinc-400 block mt-1 font-mono">
                        BANCO POPULAR / BHD LEÓN (USD O RD$)
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-mono font-bold mt-2 uppercase">
                      APARTADO INMEDIATO EN KM 22
                    </span>
                  </label>

                  <label
                    className={`p-4 rounded-[4px] border cursor-pointer transition-all flex flex-col justify-between ${
                      customer.paymentMethod === 'card'
                        ? 'border-amber-500 bg-zinc-900 text-white ring-1 ring-amber-500/40'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <CreditCard className="w-5 h-5 text-amber-400" />
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={customer.paymentMethod === 'card'}
                          onChange={() => setCustomer({ ...customer, paymentMethod: 'card' })}
                          className="accent-amber-500"
                        />
                      </div>
                      <span className="font-bold text-xs block uppercase text-white">TARJETA CORPORATIVA</span>
                      <span className="text-[11px] text-zinc-400 block mt-1 font-mono">
                        CARDNET / AZUL DOMINICANA (3D-SECURE 2.0)
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold mt-2 uppercase">
                      DESPACHO EXPRESS &lt; RD$ 150K
                    </span>
                  </label>

                  <label
                    className={`p-4 rounded-[4px] border cursor-pointer transition-all flex flex-col justify-between ${
                      customer.paymentMethod === 'credit_line'
                        ? 'border-amber-500 bg-zinc-900 text-white ring-1 ring-amber-500/40'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <FileText className="w-5 h-5 text-amber-400" />
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={customer.paymentMethod === 'credit_line'}
                          onChange={() => setCustomer({ ...customer, paymentMethod: 'credit_line' })}
                          className="accent-amber-500"
                        />
                      </div>
                      <span className="font-bold text-xs block uppercase text-white">CRÉDITO COMERCIAL TMD</span>
                      <span className="text-[11px] text-zinc-400 block mt-1 font-mono">
                        CUENTA CORRIENTE A 30 DÍAS
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono mt-2 uppercase">
                      CLIENTES EMPRESARIALES ACTIVOS
                    </span>
                  </label>
                </div>

                {/* Cardnet / Azul Interactive Details & Launch Action (Task #75) */}
                {customer.paymentMethod === 'card' && (
                  <div className="p-4 rounded-[3px] bg-zinc-900 border border-amber-500/30 text-xs space-y-3 font-mono">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-[2px] bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase">
                            CARDNET / AZUL DOMINICANA
                          </span>
                          <span className="text-[10px] text-zinc-400 uppercase">
                            VOUCHER FISCAL AUTOMÁTICO
                          </span>
                        </div>
                        <p className="text-zinc-300">
                          Habilita el cobro directo con tarjeta de crédito o débito corporativa para pedidos de emergencia menores a RD$ 150,000 con autenticación biométrica y clave dinámica OTP.
                        </p>
                      </div>
                    </div>

                    {cardPaymentData ? (
                      <div className="p-3 rounded-[2px] bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="font-black text-xs block uppercase">
                            ✓ PAGO AUTORIZADO CON ÉXITO ({cardPaymentData.gateway.toUpperCase()})
                          </span>
                          <span className="text-[11px] text-emerald-300/80 block">
                            AUT: {cardPaymentData.authorizationCode} • {cardPaymentData.cardBrand.toUpperCase()} ****{cardPaymentData.last4} • NCF: {cardPaymentData.ncfReference || 'B0100098492'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCardPaymentData(null);
                            setIsCardnetModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-[2px] bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-700 text-[10px] font-bold uppercase cursor-pointer shrink-0"
                        >
                          CAMBIAR TARJETA
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-zinc-800">
                        <span className="text-[11px] text-zinc-400">
                          Total a Procesar: <strong className="text-amber-400">{formatPrice(totalUsd)}</strong> (RD$ {(totalUsd * exchangeRate).toLocaleString('es-DO', { maximumFractionDigits: 2 })})
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsCardnetModalOpen(true)}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>ABRIR PASARELA CARDNET / AZUL (3D-SECURE 2.0)</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Transfer Details Preview */}
                {customer.paymentMethod === 'transfer' && (
                  <div className="p-4 rounded-[3px] bg-zinc-900 border border-zinc-800 text-xs space-y-1.5 font-mono">
                    <span className="font-bold text-white block uppercase">
                      INSTRUCCIONES DE TRANSFERENCIA:
                    </span>
                    <p className="text-zinc-400">
                      Al confirmar, recibirás tu orden con número fiscal oficial para transferir a nuestras cuentas autorizadas del Banco Popular Dominicano o BHD León. El pedido queda apartado de inmediato en almacén.
                    </p>
                  </div>
                )}

                {/* Credit Line Preview */}
                {customer.paymentMethod === 'credit_line' && (
                  <div className="p-4 rounded-[3px] bg-zinc-900 border border-zinc-800 text-xs space-y-1.5 font-mono">
                    <span className="font-bold text-white block uppercase">
                      CUENTA CORRIENTE TMD DOMINICANA (30 DÍAS):
                    </span>
                    <p className="text-zinc-400">
                      Sujeto a verificación de línea de crédito aprobada con el departamento de administración de TMD. La mercancía se despacha con Conduce Fiscal y Factura B01.
                    </p>
                  </div>
                )}

                {/* Used Machinery Trade-In Valuation Module (Task #68) */}
                <div className="p-4 rounded-[3px] bg-zinc-900 border border-zinc-800 space-y-3 font-mono">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-[2px] bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                        <Repeat className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs uppercase text-white block">
                          ¿TIENE MAQUINARIA USADA PARA ABONAR A ESTA COMPRA? (TRADE-IN)
                        </span>
                        <span className="text-[11px] text-zinc-400 block font-sans">
                          Aceptamos excavadoras, palas, rodillos y retroexcavadoras usadas multimarca (Cat, Komatsu, JCB, LiuGong) con tasación pericial oficial.
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsTradeInOpen(true)}
                      className="w-full sm:w-auto px-4 py-2 rounded-[2px] bg-zinc-950 hover:bg-zinc-850 text-amber-400 border border-amber-400/40 text-xs font-bold uppercase transition-colors shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      <span>{tradeInCredit ? 'MODIFICAR TASACIÓN' : 'TASAR MAQUINARIA USADA'}</span>
                    </button>
                  </div>

                  {tradeInCredit && (
                    <div className="p-3 rounded-[2px] bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-black block uppercase">
                          ✓ CRÉDITO DE TRADE-IN APLICADO: -US$ {tradeInCredit.creditUsd.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-emerald-300/80 block">
                          {tradeInCredit.summary}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTradeInCredit(null)}
                        className="text-zinc-500 hover:text-red-400 text-[11px] underline cursor-pointer"
                      >
                        QUITAR
                      </button>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="pt-4 flex items-center justify-between gap-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="py-2.5 px-5 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-black uppercase tracking-wider text-xs border border-zinc-800 transition-colors cursor-pointer"
                  >
                    VOLVER A DATOS DE OBRA
                  </button>

                  <button
                    type="submit"
                    className="py-3 px-8 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>CONTINUAR A EMISIÓN OFICIAL & FIRMA (PASO 4)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Step 3 Sidebar */}
              <div className="lg:col-span-4 bg-zinc-950 rounded-[5px] border border-zinc-800 p-5 shadow-sm text-xs font-mono text-white space-y-3">
                <h4 className="font-black text-sm uppercase tracking-wider text-white pb-2 border-b border-zinc-800 font-display">
                  RESUMEN DE PAGO
                </h4>
                <div className="flex justify-between">
                  <span className="text-zinc-400 uppercase">MÉTODO:</span>
                  <span className="font-bold text-amber-400 uppercase">
                    {customer.paymentMethod === 'card' ? 'TARJETA CARDNET/AZUL' : customer.paymentMethod === 'transfer' ? 'TRANSFERENCIA' : 'CRÉDITO TMD 30D'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 uppercase">ESTADO DE PAGO:</span>
                  <span className={`font-bold uppercase ${cardPaymentData ? 'text-emerald-400' : 'text-zinc-300'}`}>
                    {cardPaymentData ? 'AUTORIZADO 3DS' : 'PENDIENTE EMISIÓN'}
                  </span>
                </div>
                {tradeInCredit && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span className="uppercase">CRÉDITO PERMUTA:</span>
                    <span>-US$ {tradeInCredit.creditUsd.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-zinc-800 flex justify-between items-baseline">
                  <span className="font-black text-xs uppercase">TOTAL A LIQUIDAR:</span>
                  <span className="text-base font-black text-amber-400">
                    {formatPrice(
                      Math.max(
                        0,
                        (subtotalUsd - discountUsd) +
                          itbisUsd +
                          (customer.deliveryMethod === 'pickup_km22' ? 0 : shippingUsd) -
                          (tradeInCredit ? tradeInCredit.creditUsd : 0)
                      )
                    )}
                  </span>
                </div>
              </div>
            </form>
          )}

          {/* STEP 4: FORMAL EMISSION, 15-DAY VALIDITY GUARANTEE & DIGITAL SIGNATURE (Task #14, #67) */}
          {currentStep === 4 && (
            <form onSubmit={handleFinalSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 bg-zinc-950 rounded-[5px] border border-zinc-800 p-5 sm:p-7 shadow-sm space-y-6 text-white">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div>
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                      4. EMISIÓN OFICIAL, GARANTÍA 15 DÍAS & FIRMA DIGITAL
                    </h3>
                    <span className="text-xs text-zinc-400 font-mono">PASO FINAL • PROFORMA VINCULANTE CON NCF DGII</span>
                  </div>
                  <span className="text-xs text-amber-400 font-mono font-black uppercase">PASO 4 DE 4</span>
                </div>

                {/* Work & Fiscal Order Summary Card */}
                <div className="p-4 rounded-[4px] bg-zinc-900 border border-zinc-800 space-y-2.5 text-xs font-mono">
                  <span className="text-zinc-400 font-bold uppercase block text-[11px]">
                    EXPEDIENTE DE ORDEN Y FISCALIDAD:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-zinc-300">
                    <div>
                      <span className="text-zinc-500 block">CLIENTE / RAZÓN SOCIAL:</span>
                      <strong className="text-white uppercase">{customer.fullName} {customer.companyName && `(${customer.companyName})`}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">RNC / CÉDULA & COMPROBANTE:</span>
                      <strong className="text-white uppercase">
                        {customer.rncOrCedula ? `${customer.rncOrCedula} • ${customer.ncfType}` : 'CONSUMIDOR FINAL (B02)'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">TELÉFONO DE CONTACTO:</span>
                      <strong className="text-white">{customer.phone}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">ENTREGA O RETIRO:</span>
                      <strong className="text-amber-400 uppercase">
                        {customer.deliveryMethod === 'pickup_km22' ? 'RETIRO EN ALMACÉN CENTRAL KM 22' : `ENVÍO A ${customer.deliveryAddress || customer.city}`}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 15-Day Official Quote Expiration Guarantee Card (Task #67) */}
                <div className="p-4 rounded-[4px] bg-zinc-900 border border-amber-500/30 text-xs font-mono space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-[2px] bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black uppercase text-white">
                            GARANTÍA DE PRECIO & TASA OFICIAL (15 DÍAS)
                          </span>
                          <span className="px-1.5 py-0.5 rounded-[2px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase">
                            PROTEGIDO
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-400 font-sans block mt-0.5">
                          Tasa Banco Central (RD$ {exchangeRate.toFixed(2)}) y precios garantizados por 15 días calendario ante fluctuaciones marítimas.
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsQuoteExpirationModalOpen(true)}
                      className="px-3.5 py-2 rounded-[2px] bg-zinc-950 hover:bg-zinc-855 text-amber-400 border border-amber-400/40 text-xs font-bold uppercase transition-colors shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>CONTROL DE VIGENCIA & PRÓRROGA</span>
                    </button>
                  </div>
                </div>

                {/* Digital Signature & Technical Approval Box (Task #14 & #65) */}
                <div className="p-4 rounded-[4px] bg-zinc-900 border border-zinc-800 text-xs font-mono space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <span className="text-white font-bold uppercase flex items-center gap-1.5 font-display text-sm">
                      <PenTool className="w-4 h-4 text-amber-400" />
                      <span>CONFORMIDAD TÉCNICA & FIRMA DIGITAL DEL SOLICITANTE</span>
                    </span>
                    <span className="text-[10px] text-zinc-400">DGII / AUDITABLE</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-400 font-bold uppercase mb-1">
                        NOMBRE COMPLETO DEL FIRMANTE / APODERADO *
                      </label>
                      <input
                        type="text"
                        value={authorizedSigner || customer.fullName}
                        onChange={(e) => setAuthorizedSigner(e.target.value)}
                        placeholder="ING. CARLOS PERALTA"
                        className="w-full p-2.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 font-bold uppercase mb-1">
                        CARGO O ROL DE APROBACIÓN
                      </label>
                      <input
                        type="text"
                        value={signerRole}
                        onChange={(e) => setSignerRole(e.target.value)}
                        placeholder="Ing. Residente de Obra / Gerente de Compras"
                        className="w-full p-2.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 uppercase"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 pt-1">
                    <input
                      type="checkbox"
                      id="signatureConsent"
                      checked={isSignatureConfirmed}
                      onChange={(e) => setIsSignatureConfirmed(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded-[2px] mt-0.5"
                    />
                    <label htmlFor="signatureConsent" className="text-[11px] text-zinc-300 leading-relaxed cursor-pointer font-sans">
                      Declaro conformidad técnica de los ítems cotizados y autorizo la emisión formal de la orden/proforma con validez legal y tributaria ante la DGII por parte de TECNOMAQUINARIAS DIESEL S.R.L.
                    </label>
                  </div>

                  {/* Digital cryptographic stamp preview */}
                  <div className="p-3 rounded-[3px] bg-zinc-950 border border-amber-500/20 text-[10px] text-zinc-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        SELLO DIGITAL TMD: <strong>{authorizedSigner || customer.fullName || 'AUTORIZADO'}</strong> • {signerRole}
                      </span>
                    </span>
                    <span className="text-zinc-500 font-mono shrink-0">
                      EMISIÓN: {new Date().toLocaleDateString('es-DO')} • SEDE KM 22
                    </span>
                  </div>
                </div>

                {/* Final Navigation Buttons */}
                <div className="pt-4 flex items-center justify-between gap-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="py-2.5 px-5 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-black uppercase tracking-wider text-xs border border-zinc-800 transition-colors cursor-pointer"
                  >
                    VOLVER A MÉTODO DE PAGO
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || !isSignatureConfirmed}
                    className="py-3 px-8 rounded-[3px] bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-black uppercase tracking-wider text-xs shadow-xl transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>GENERANDO ORDEN Y PROFORMA...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>CONFIRMAR Y EMITIR PROFORMA OFICIAL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Final Overview Column */}
              <div className="lg:col-span-4 bg-zinc-950 rounded-[5px] border border-zinc-800 p-5 sm:p-7 shadow-lg text-xs space-y-4 font-mono text-white">
                <h4 className="font-black text-sm uppercase tracking-wider text-white pb-2 border-b border-zinc-800 font-display">
                  RESUMEN FINAL DE FACTURACIÓN
                </h4>

                <div className="space-y-2 text-zinc-400">
                  <div className="flex justify-between">
                    <span className="uppercase">CLIENTE:</span>
                    <span className="font-bold text-white uppercase">{customer.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="uppercase">CONTACTO:</span>
                    <span className="font-bold text-white">{customer.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="uppercase">MÉTODO PAGO:</span>
                    <span className="font-bold text-white uppercase">{customer.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="uppercase">DESPACHO:</span>
                    <span className="font-bold text-amber-400 uppercase">
                      {customer.deliveryMethod === 'pickup_km22' ? 'RETIRO KM 22' : `ENVÍO A ${customer.city}`}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800 space-y-2">
                  <div className="flex justify-between uppercase">
                    <span>SUBTOTAL REPUESTOS:</span>
                    <span className="text-white">{formatPrice(subtotalUsd)}</span>
                  </div>
                  {discountUsd > 0 && (
                    <div className="flex justify-between text-emerald-400 font-bold uppercase">
                      <span>DESCUENTO VIP PRO:</span>
                      <span>-{formatPrice(discountUsd)}</span>
                    </div>
                  )}
                  <div className="flex justify-between uppercase">
                    <span>ITBIS (18%):</span>
                    <span className="text-white">{formatPrice(itbisUsd)}</span>
                  </div>
                  <div className="flex justify-between uppercase">
                    <span>ENVÍO:</span>
                    <span className="text-white">{customer.deliveryMethod === 'pickup_km22' ? 'GRATIS' : formatPrice(shippingUsd)}</span>
                  </div>

                  {tradeInCredit && (
                    <div className="flex justify-between text-emerald-400 font-bold uppercase">
                      <span>(-) ABONO TRADE-IN:</span>
                      <span>-US$ {tradeInCredit.creditUsd.toLocaleString()}</span>
                    </div>
                  )}

                  {needsFiscalInvoice && taxRegime === 'ESTADO_B15' && (
                    <div className="pt-2 border-t border-zinc-800/80 space-y-1 text-red-400 text-[11px]">
                      <div className="flex justify-between uppercase">
                        <span>(-) RETENCIÓN 100% ITBIS:</span>
                        <span>-{formatPrice(itbisUsd)}</span>
                      </div>
                      <div className="flex justify-between uppercase">
                        <span>(-) RETENCIÓN 5% ISR ESTADO:</span>
                        <span>-{formatPrice((subtotalUsd - discountUsd) * 0.05)}</span>
                      </div>
                      <div className="flex justify-between uppercase text-emerald-400 font-bold pt-1 border-t border-zinc-800/60">
                        <span>NETO A DESEMBOLSAR:</span>
                        <span>{formatPrice(Math.max(0, (subtotalUsd - discountUsd) * 0.95 + (customer.deliveryMethod === 'pickup_km22' ? 0 : shippingUsd) - (tradeInCredit ? tradeInCredit.creditUsd : 0)))}</span>
                      </div>
                    </div>
                  )}

                  {needsFiscalInvoice && taxRegime === 'GRAN_CONTRIBUYENTE' && (
                    <div className="pt-2 border-t border-zinc-800/80 space-y-1 text-red-400 text-[11px]">
                      <div className="flex justify-between uppercase">
                        <span>(-) RETENCIÓN 30% ITBIS (NORMA 02-05):</span>
                        <span>-{formatPrice(itbisUsd * 0.30)}</span>
                      </div>
                      <div className="flex justify-between uppercase text-emerald-400 font-bold pt-1 border-t border-zinc-800/60">
                        <span>NETO A DESEMBOLSAR:</span>
                        <span>{formatPrice(Math.max(0, (subtotalUsd - discountUsd) + (itbisUsd * 0.70) + (customer.deliveryMethod === 'pickup_km22' ? 0 : shippingUsd) - (tradeInCredit ? tradeInCredit.creditUsd : 0)))}</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-zinc-800 flex justify-between items-baseline">
                    <span className="font-black text-xs text-white uppercase">TOTAL GENERAL:</span>
                    <div className="text-right">
                      <span className="text-lg font-black text-amber-400 block">
                        {formatPrice(
                          Math.max(
                            0,
                            (subtotalUsd - discountUsd) +
                              itbisUsd +
                              (customer.deliveryMethod === 'pickup_km22' ? 0 : shippingUsd) -
                              (tradeInCredit ? tradeInCredit.creditUsd : 0)
                          )
                        )}
                      </span>
                      {currency === 'USD' && (
                        <span className="text-[10px] text-zinc-400 block">
                          ≈ RD${' '}
                          {(
                            Math.max(
                              0,
                              (subtotalUsd - discountUsd) +
                                itbisUsd +
                                (customer.deliveryMethod === 'pickup_km22' ? 0 : shippingUsd) -
                                (tradeInCredit ? tradeInCredit.creditUsd : 0)
                            ) * exchangeRate
                          ).toLocaleString('es-DO', { maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-[3px] bg-zinc-900 border border-zinc-800 flex items-center gap-2 text-[11px] text-zinc-400">
                  <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="uppercase">ORDEN ENCRIPTADA Y TRANSMITIDA A TMD DOMINICANA.</span>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Task #75: Cardnet / Azul Payment Gateway Modal */}
      <CardnetAzulPaymentModal
        isOpen={isCardnetModalOpen}
        onClose={() => setIsCardnetModalOpen(false)}
        totalUsd={Math.max(0, (subtotalUsd - discountUsd) + itbisUsd + (customer.deliveryMethod === 'pickup_km22' ? 0 : shippingUsd) - (tradeInCredit ? tradeInCredit.creditUsd : 0))}
        totalDop={Number((Math.max(0, (subtotalUsd - discountUsd) + itbisUsd + (customer.deliveryMethod === 'pickup_km22' ? 0 : shippingUsd) - (tradeInCredit ? tradeInCredit.creditUsd : 0)) * exchangeRate).toFixed(2))}
        currency={currency}
        clientName={customer.fullName || 'Cliente TMD'}
        clientRnc={customer.rncOrCedula}
        onPaymentSuccess={(authResult) => {
          setCardPaymentData(authResult);
          setCustomer(prev => ({ ...prev, paymentMethod: 'card' }));
          setIsCardnetModalOpen(false);
          setCurrentStep(4);
        }}
      />

      {/* Task #68: Used Machinery Trade-In Appraisal Modal */}
      <TradeInValuationModal
        isOpen={isTradeInOpen}
        onClose={() => setIsTradeInOpen(false)}
        targetMachineName={machineQuotes.length > 0 ? machineQuotes[0].machine.name : 'Repuestos / Maquinaria TMD'}
        targetMachinePriceUsd={totalUsd}
        exchangeRate={exchangeRate}
        onApplyTradeInCredit={(creditUsd, summary) => {
          setTradeInCredit({ creditUsd, summary });
          setIsTradeInOpen(false);
        }}
      />

      {/* Task #67: Quote Expiration & Commercial Extension Modal */}
      <QuoteExpirationAlertModal
        isOpen={isQuoteExpirationModalOpen}
        onClose={() => setIsQuoteExpirationModalOpen(false)}
        quoteId={'TMD-PROFORMA-2026'}
        quoteDate={new Date().toISOString()}
        clientName={customer.fullName || 'Cliente TMD'}
        machineOrItemsSummary={cart.length > 0 ? `${cart.length} Repuestos en Canasta` : (machineQuotes[0]?.machine.name || 'Maquinaria de Flota')}
        totalUsd={Math.max(0, (subtotalUsd - discountUsd) + itbisUsd + (customer.deliveryMethod === 'pickup_km22' ? 0 : shippingUsd) - (tradeInCredit ? tradeInCredit.creditUsd : 0))}
        exchangeRate={exchangeRate}
      />
    </div>
  );
};
