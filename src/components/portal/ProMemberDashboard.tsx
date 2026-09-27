import React, { useState, useEffect } from 'react';
import {
  Crown,
  Sparkles,
  Star,
  ShieldCheck,
  Award,
  CheckCircle2,
  Clock,
  Wrench,
  Tag,
  Copy,
  Check,
  Gift,
  ArrowRight,
  TrendingUp,
  Percent,
  ShoppingBag,
  Truck,
  FileText,
  ChevronRight,
  Zap,
  Info,
  Layers,
  Calendar,
  Settings,
  HelpCircle,
  QrCode,
  Flame,
  AlertCircle,
  Calculator,
  Radio
} from 'lucide-react';
import { UserProfile, ServiceWorkOrder, LoyaltyPointsRecord, ProMemberReward, ProMemberDiscountTier } from '../../types';
import { 
  PRO_TIERS, 
  getProTierForPoints, 
  PRO_MEMBER_DISCOUNTS, 
  PRO_REWARDS_CATALOG, 
  getStoredProPoints, 
  saveStoredProPoints,
  getStoredPointsLedger,
  saveStoredPointsLedger,
  getStoredRedeemedRewards,
  saveStoredRedeemedReward
} from '../../data/proMemberData';
import { USD_TO_DOP_RATE } from '../../data/catalog';
import { useCart } from '../../context/CartContext';
import { getLocalServiceHistory, generateDemoServiceHistory } from '../../services/serviceHistoryService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ProTierCard } from './promember/ProTierCard';
import { ProQrPassModal } from './promember/ProQrPassModal';
import { ProRewardsCatalog } from './promember/ProRewardsCatalog';
import { ProPointsLedger } from './promember/ProPointsLedger';
import { ProRoiCalculator } from './promember/ProRoiCalculator';

interface ProMemberDashboardProps {
  currentUser: { uid: string; email?: string | null; displayName?: string | null } | null;
  userProfile: UserProfile | null;
  onNavigate: (route: string) => void;
  onOpenServiceTab?: () => void;
  onOpenLiveLinkTab?: () => void;
}

export const ProMemberDashboard: React.FC<ProMemberDashboardProps> = ({
  currentUser,
  userProfile,
  onNavigate,
  onOpenServiceTab,
  onOpenLiveLinkTab
}) => {
  const { applyCoupon, setProMemberDiscount, isProMemberDiscountActive, appliedCoupon, formatPrice, showToast } = useCart();

  // Active subtab inside Pro-Member dashboard
  const [subTab, setSubTab] = useState<'discounts' | 'points' | 'history' | 'roi'>('discounts');
  
  // QR Pass Modal state
  const [showQrPassModal, setShowQrPassModal] = useState<boolean>(false);
  
  // Loyalty points state
  const [points, setPoints] = useState<number>(() => {
    return userProfile?.proMemberPoints || getStoredProPoints(1850);
  });

  const [ledger, setLedger] = useState<LoyaltyPointsRecord[]>(() => {
    return getStoredPointsLedger(userProfile?.displayName || currentUser?.displayName || 'Ing. Manuel Tavares');
  });

  const [redeemedRewardIds, setRedeemedRewardIds] = useState<string[]>(() => {
    return getStoredRedeemedRewards();
  });

  // UI state for copy feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);

  // Service history records
  const [serviceOrders, setServiceOrders] = useState<ServiceWorkOrder[]>([]);

  useEffect(() => {
    const localOrders = getLocalServiceHistory();
    if (localOrders && localOrders.length > 0) {
      setServiceOrders(localOrders);
    } else {
      const demoOrders = generateDemoServiceHistory(
        currentUser?.uid || 'usr-demo-01',
        userProfile?.displayName || currentUser?.displayName || 'Ing. Manuel Tavares',
        userProfile?.companyName || 'Constructora & Agregados del Cibao'
      );
      setServiceOrders(demoOrders);
    }
  }, [currentUser, userProfile]);

  // Sync points when userProfile loads
  useEffect(() => {
    if (userProfile?.proMemberPoints && userProfile.proMemberPoints !== points) {
      setPoints(userProfile.proMemberPoints);
      saveStoredProPoints(userProfile.proMemberPoints);
    }
  }, [userProfile]);

  const tierInfo = getProTierForPoints(points);
  const memberNumber = userProfile?.proMemberNumber || 'TMD-PRO-8492';
  const memberName = userProfile?.displayName || currentUser?.displayName || 'Ing. Manuel Tavares';
  const companyName = userProfile?.companyName || 'Constructora & Agregados del Cibao S.R.L.';
  const memberSince = userProfile?.proMemberSince || '2024';

  // Progress to next tier
  const nextTier = tierInfo.tier === 'Silver' ? PRO_TIERS.Gold : tierInfo.tier === 'Gold' ? PRO_TIERS.Platinum : null;
  const pointsToNext = nextTier ? Math.max(0, nextTier.minPoints - points) : 0;
  const progressPercent = nextTier 
    ? Math.min(100, Math.round(((points - tierInfo.minPoints) / (nextTier.minPoints - tierInfo.minPoints)) * 100))
    : 100;

  // Handle coupon copy
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Handle applying coupon directly to active cart
  const handleApplyDiscountToCart = (code: string) => {
    applyCoupon(code);
    handleCopyCode(code);
  };

  // Handle redeeming rewards
  const handleRedeemReward = async (reward: ProMemberReward) => {
    if (points < reward.pointsCost) {
      showToast(`Necesitas ${reward.pointsCost - points} puntos adicionales para canjear esta recompensa.`);
      return;
    }

    const newPoints = points - reward.pointsCost;
    setPoints(newPoints);
    saveStoredProPoints(newPoints);

    // Save to redeemed list
    saveStoredRedeemedReward(reward.id);
    setRedeemedRewardIds((prev) => [...prev, reward.id]);

    // Create new transaction in ledger
    const newRecord: LoyaltyPointsRecord = {
      id: `red-${Date.now()}`,
      date: new Date().toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' }),
      activity: `Canje de Recompensa: ${reward.title}`,
      points: reward.pointsCost,
      type: 'redeemed',
      category: 'redemption',
      orderReference: reward.code
    };

    const updatedLedger = [newRecord, ...ledger];
    setLedger(updatedLedger);
    saveStoredPointsLedger(updatedLedger);

    // If reward is a discount voucher, activate it immediately in Cart
    if (reward.category === 'discount') {
      applyCoupon(reward.code);
    }

    // Attempt Firebase sync if logged in
    if (currentUser?.uid) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          proMemberPoints: newPoints,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Could not update points in Firestore, kept in local storage', err);
      }
    }

    setRedeemSuccess(`¡Has canjeado con éxito "${reward.title}"! Tu código es: ${reward.code}`);
  };

  // Service stats calculations
  const totalCompletedServices = serviceOrders.filter((o) => o.status === 'completed' || o.status === 'in_progress').length;
  const certifiedHours = serviceOrders.reduce((acc, o) => Math.max(acc, o.horometerHours || 0), 2450);
  const totalPartsInstalled = serviceOrders.reduce((acc, o) => acc + (o.installedParts?.length || 0), 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. HERO DIGITAL PRO-MEMBER CARD & TIER STATUS */}
      <ProTierCard
        memberName={memberName}
        companyName={companyName}
        memberNumber={memberNumber}
        memberSince={memberSince}
        points={points}
        tierInfo={tierInfo}
        nextTier={nextTier}
        progressPercent={progressPercent}
        pointsToNext={pointsToNext}
        isProMemberDiscountActive={isProMemberDiscountActive}
        onActivateDiscount={(active, percent) => {
          setProMemberDiscount(active, percent);
          if (active) showToast(`¡Descuento VIP del ${percent}% activado en su sesión!`);
        }}
        onOpenQrPass={() => setShowQrPassModal(true)}
        onCopyCode={handleCopyCode}
        copiedCode={copiedCode}
      />

      {/* LIVELINK TELEMATICS QUICK ALERT BANNER */}
      {onOpenLiveLinkTab && (
        <div className="p-4 sm:p-5 rounded-[5px] bg-gradient-to-r from-zinc-900 via-neutral-900 to-amber-950 text-white border border-amber-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-[3px] bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/30">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black font-display uppercase tracking-wider text-amber-400">LiveLink™ IoT Telemetría Activa</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <p className="text-xs text-zinc-300 mt-0.5 font-sans">
                Monitorea en tiempo real horómetros, temperaturas críticas de refrigerante/hidráulico y geocercas satelitales en canteras.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenLiveLinkTab}
            className="px-4 py-2.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-black font-display uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow shrink-0 cursor-pointer active:scale-95"
          >
            <span>Ver Telemetría en Vivo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* SUCCESS BANNER WHEN REWARD IS REDEEMED */}
      {redeemSuccess && (
        <div className="p-4 rounded-[3px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-semibold flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{redeemSuccess}</span>
          </div>
          <button
            onClick={() => setRedeemSuccess(null)}
            className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* 2. SUBTABS NAVIGATION */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setSubTab('discounts')}
          className={`px-4 py-2.5 rounded-[2px] text-xs font-black font-display uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'discounts'
              ? 'bg-amber-400 text-black shadow-sm'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Descuentos Exclusivos en Repuestos</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-[2px] text-[10px] font-mono font-bold bg-amber-600/20 text-current">
            {PRO_MEMBER_DISCOUNTS.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('points')}
          className={`px-4 py-2.5 rounded-[2px] text-xs font-black font-display uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'points'
              ? 'bg-amber-400 text-black shadow-sm'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Puntos de Fidelidad & Recompensas</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-[2px] text-[10px] font-mono font-bold bg-amber-600/20 text-current">
            {points.toLocaleString()} pts
          </span>
        </button>

        <button
          onClick={() => setSubTab('history')}
          className={`px-4 py-2.5 rounded-[2px] text-xs font-black font-display uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'history'
              ? 'bg-amber-400 text-black shadow-sm'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Historial de Servicios de Maquinaria</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-[2px] text-[10px] font-mono font-bold bg-amber-600/20 text-current">
            {totalCompletedServices}
          </span>
        </button>

        <button
          onClick={() => setSubTab('roi')}
          className={`px-4 py-2.5 rounded-[2px] text-xs font-black font-display uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'roi'
              ? 'bg-amber-400 text-black shadow-sm'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Calculadora de Retorno ROI</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-[2px] text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
            Ahorro VIP
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EXCLUSIVE DISCOUNTS FOR SPARE PARTS                                */}
      {/* ========================================================================= */}
      {subTab === 'discounts' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black font-display uppercase tracking-tight text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-400" />
                <span>Cupones y Descuentos Exclusivos en Repuestos Genuinos</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1 font-sans">
                Como usuario registrado TMD Pro, tienes acceso inmediato a tarifas preferenciales en filtración, rodaje, fluidos y desgaste.
              </p>
            </div>

            <button
              onClick={() => onNavigate('#/parts')}
              className="px-4 py-2 rounded-[2px] text-xs font-black font-display uppercase tracking-wider bg-zinc-800 text-white hover:bg-zinc-700 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer border border-zinc-700"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>Explorar Catálogo de Repuestos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Discount Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch">
            {PRO_MEMBER_DISCOUNTS.map((disc) => {
              const isApplied = appliedCoupon === disc.couponCode;
              return (
                <div
                  key={disc.id}
                  className={`p-5 rounded-[3px] border transition-all flex flex-col justify-between h-full gap-4 ${
                    isApplied
                      ? 'bg-amber-950/20 border-amber-400/60 shadow-md ring-1 ring-amber-400/30'
                      : 'bg-zinc-900 border-zinc-800 hover:border-amber-400/40 shadow-xs'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-[2px] text-xs font-black font-display uppercase tracking-wider bg-amber-400 text-black">
                        {disc.badgeText}
                      </span>
                      {isApplied && (
                        <span className="text-[11px] font-black text-emerald-400 flex items-center gap-1 font-mono">
                          <Check className="w-3 h-3" />
                          <span>Aplicado en Carrito</span>
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold font-display uppercase tracking-tight text-sm text-white">
                      {disc.category}
                    </h4>

                    <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                      {disc.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-zinc-800">
                    {/* Coupon Code Block */}
                    <div className="flex items-center justify-between p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
                      <div>
                        <span className="text-[9px] uppercase font-black text-zinc-500 block tracking-wider font-display">
                          Código de Cupón VIP
                        </span>
                        <span className="font-mono text-xs font-black text-amber-400">
                          {disc.couponCode}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopyCode(disc.couponCode)}
                        className="px-2.5 py-1.5 rounded-[2px] text-xs font-bold text-zinc-300 hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Copiar código"
                      >
                        {copiedCode === disc.couponCode ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 text-[11px] font-mono">¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="text-[11px] font-mono">Copiar</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleApplyDiscountToCart(disc.couponCode)}
                        className={`py-2 px-3 rounded-[2px] text-xs font-black font-display uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isApplied
                            ? 'bg-emerald-500 text-black'
                            : 'bg-amber-400 hover:bg-amber-300 text-black'
                        }`}
                      >
                        {isApplied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Activo</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5" />
                            <span>Aplicar</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => onNavigate('#/parts')}
                        className="py-2 px-3 rounded-[2px] text-xs font-bold font-display uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-all flex items-center justify-center gap-1 cursor-pointer border border-zinc-750"
                      >
                        <span>Ver Piezas</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Guarantee & Genuine Certification Callout */}
          <div className="p-5 rounded-[3px] bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[2px] bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-extrabold font-display uppercase tracking-tight text-xs text-white">
                  Garantía de Fábrica OEM TMD
                </h5>
                <p className="text-[11px] text-zinc-400 font-sans">
                  Todos los repuestos con descuento Pro-Member cuentan con garantía de 6 a 12 meses y despacho directo desde Santo Domingo Km 22.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('#/checkout')}
              className="px-4 py-2 rounded-[2px] text-xs font-black font-display uppercase tracking-wider bg-amber-400 hover:bg-amber-300 text-black transition-all self-start sm:self-auto shrink-0 flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Ver Carrito con Descuento</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LOYALTY POINTS & REWARDS CATALOG                                  */}
      {/* ========================================================================= */}
      {subTab === 'points' && (
        <div className="space-y-8">
          <ProRewardsCatalog
            points={points}
            redeemedRewardIds={redeemedRewardIds}
            onRedeemReward={handleRedeemReward}
          />

          {/* How to earn points breakdown */}
          <div className="p-5 rounded-[3px] bg-zinc-900/70 border border-zinc-800 space-y-4">
            <h4 className="font-black font-display uppercase tracking-tight text-sm text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>¿Cómo acumular más Puntos TMD Pro?</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="font-mono text-amber-400 font-black text-sm block">+1 a 1.5 Pts</span>
                <span className="font-bold text-white block">Por cada US$ 1 Facturado</span>
                <p className="text-[11px] text-zinc-400 font-sans">En repuestos genuinos, filtros y lubricantes adquiridos en plataforma.</p>
              </div>

              <div className="p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="font-mono text-amber-400 font-black text-sm block">+250 Pts</span>
                <span className="font-bold text-white block">Ficha de Flota Registrada</span>
                <p className="text-[11px] text-zinc-400 font-sans">Por cada excavadora, rodillo o tractor registrado en tu portal.</p>
              </div>

              <div className="p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="font-mono text-amber-400 font-black text-sm block">+350 Pts</span>
                <span className="font-bold text-white block">Mantenimiento a Tiempo</span>
                <p className="text-[11px] text-zinc-400 font-sans">Por completar los mantenimientos preventivos cada 250h / 500h sin retraso.</p>
              </div>

              <div className="p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="font-mono text-amber-400 font-black text-sm block">+150 Pts</span>
                <span className="font-bold text-white block">Calificación de Taller Móvil</span>
                <p className="text-[11px] text-zinc-400 font-sans">Por validar y firmar digitalmente la orden de servicio en obra.</p>
              </div>
            </div>
          </div>

          <ProPointsLedger ledger={ledger} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SERVICE HISTORY & FLEET TECHNICAL HEALTH SUMMARY                   */}
      {/* ========================================================================= */}
      {subTab === 'history' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black font-display uppercase tracking-tight text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                <span>Historial de Servicios Técnicos & Trazabilidad de Flota</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1 font-sans">
                Registro de mantenimientos preventivos y correctivos ejecutados con repuestos genuinos certificados por TMD.
              </p>
            </div>

            <button
              onClick={() => onOpenServiceTab ? onOpenServiceTab() : onNavigate('#/portal?tab=service_history')}
              className="px-4 py-2 rounded-[2px] text-xs font-black font-display uppercase tracking-wider bg-amber-400 hover:bg-amber-300 text-black transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-md"
            >
              <span>Abrir Módulo de Mantenimiento</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-4 rounded-[3px] bg-zinc-900 border border-zinc-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider font-display">
                Órdenes Completadas
              </span>
              <div className="text-2xl font-black text-white mt-1 font-mono">
                {totalCompletedServices}
              </div>
              <span className="text-[10px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>100% Conformes</span>
              </span>
            </div>

            <div className="p-4 rounded-[3px] bg-zinc-900 border border-zinc-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider font-display">
                Horas Certificadas
              </span>
              <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                {certifiedHours.toLocaleString()} <span className="text-xs font-normal">hrs</span>
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block font-sans">
                Horómetros sincronizados
              </span>
            </div>

            <div className="p-4 rounded-[3px] bg-zinc-900 border border-zinc-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider font-display">
                Repuestos OEM Instalados
              </span>
              <div className="text-2xl font-black text-white mt-1 font-mono">
                {totalPartsInstalled > 0 ? totalPartsInstalled : 14}
              </div>
              <span className="text-[10px] text-emerald-400 font-bold mt-1 block font-sans">
                Garantía vigente
              </span>
            </div>

            <div className="p-4 rounded-[3px] bg-zinc-900 border border-zinc-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider font-display">
                Taller Móvil en Obra
              </span>
              <div className="text-2xl font-black text-white mt-1 font-mono">
                5 Visitas
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block font-sans">
                Km 28 Duarte & Cap Cana
              </span>
            </div>
          </div>

          {/* Work Orders List */}
          <div className="space-y-3">
            {serviceOrders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-[3px] bg-zinc-900 border border-zinc-800 hover:border-amber-400/40 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-[2px] border border-amber-500/20">
                      {order.orderNumber}
                    </span>

                    <span className="px-2.5 py-1 rounded-[2px] text-xs font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{order.status === 'completed' ? 'Completado' : 'En Curso'}</span>
                    </span>

                    <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      <span>{order.completedDate || order.scheduledDate || 'Completado'}</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black font-display uppercase tracking-tight text-sm text-white">
                      {order.machineModel} {order.equipmentUnitId ? `(${order.equipmentUnitId})` : ''}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5 font-sans">
                      {order.serviceType} • Horómetro: <strong className="font-mono text-amber-400">{order.horometerHours || 0} hrs</strong> • Técnico: {order.assignedTechnician || 'TMD Service'}
                    </p>
                  </div>

                  {/* Installed parts preview */}
                  {order.installedParts && order.installedParts.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 font-display">Repuestos:</span>
                      {order.installedParts.slice(0, 3).map((p, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-[2px] bg-zinc-800 text-[11px] font-mono text-zinc-300 border border-zinc-750"
                        >
                          {p.partNumber} ({p.name})
                        </span>
                      ))}
                      {order.installedParts.length > 3 && (
                        <span className="text-[10px] text-zinc-500 font-bold font-mono">
                          +{order.installedParts.length - 3} más
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col sm:items-end justify-between gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-800">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block font-display">
                      Total Facturado
                    </span>
                    <span className="text-sm font-black text-white font-mono">
                      US$ {order.totalCostUsd?.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenServiceTab ? onOpenServiceTab() : onNavigate('#/portal?tab=service_history')}
                    className="px-3 py-1.5 rounded-[2px] text-xs font-bold text-amber-400 hover:bg-amber-500/10 transition-colors flex items-center gap-1 cursor-pointer font-display uppercase tracking-wider"
                  >
                    <span>Ver Hoja Técnica</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: FLEET ROI & PROFITABILITY CALCULATOR                               */}
      {/* ========================================================================= */}
      {subTab === 'roi' && (
        <ProRoiCalculator
          tierInfo={tierInfo}
          onActivateDiscount={(active, percent) => {
            setProMemberDiscount(active, percent);
            if (active) showToast(`¡Descuento VIP del ${percent}% activado en su sesión! Tarifa Pro aplicada.`);
          }}
          onNavigate={onNavigate}
          showToast={showToast}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: PASE DIGITAL PRO-MEMBER QR (MOSTRADOR KM 22)                       */}
      {/* ========================================================================= */}
      <ProQrPassModal
        isOpen={showQrPassModal}
        onClose={() => setShowQrPassModal(false)}
        memberName={memberName}
        companyName={companyName}
        memberNumber={memberNumber}
        userProfile={userProfile}
        tierInfo={tierInfo}
        onCopyCode={handleCopyCode}
      />
    </div>
  );
};
