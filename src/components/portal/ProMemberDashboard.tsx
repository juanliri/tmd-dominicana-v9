import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Download,
  Printer,
  X,
  Share2,
  Radio,
  Activity,
  Thermometer,
  ShieldAlert
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

  // Fleet ROI Calculator state
  const [fleetSize, setFleetSize] = useState<number>(4);
  const [monthlySpendPerMachine, setMonthlySpendPerMachine] = useState<number>(850);
  const [operatingHours, setOperatingHours] = useState<number>(180);
  
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
  const [selectedReward, setSelectedReward] = useState<ProMemberReward | null>(null);
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
    setSelectedReward(null);
  };

  // Service stats calculations
  const totalCompletedServices = serviceOrders.filter((o) => o.status === 'completed' || o.status === 'in_progress').length;
  const certifiedHours = serviceOrders.reduce((acc, o) => Math.max(acc, o.horometerHours || 0), 2450);
  const totalPartsInstalled = serviceOrders.reduce((acc, o) => acc + (o.installedParts?.length || 0), 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. HERO DIGITAL PRO-MEMBER CARD & TIER STATUS */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950 border border-amber-500/30 text-white shadow-2xl">
        {/* Background glow & metallic carbon pattern */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/20 via-amber-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Card Left: Identity & Badges */}
          <div className="space-y-4 max-w-xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-black shadow-md">
                <Crown className="w-3.5 h-3.5" />
                <span>TMD Pro-Member</span>
              </span>

              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${tierInfo.badgeBorder} ${tierInfo.textColor} bg-zinc-900/80`}>
                <Sparkles className="w-3 h-3" />
                <span>Nivel {tierInfo.tier}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" />
                <span>Verificado 2026</span>
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                <span>{memberName}</span>
              </h2>
              <p className="text-sm font-semibold text-zinc-400 mt-1">
                {companyName}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-300 pt-1">
              <div className="bg-zinc-900/90 px-3 py-1.5 rounded-xl border border-zinc-800 flex items-center gap-2">
                <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">ID Pro:</span>
                <span className="font-mono text-amber-400 font-black">{memberNumber}</span>
                <button
                  onClick={() => handleCopyCode(memberNumber)}
                  className="text-zinc-400 hover:text-white transition-colors"
                  title="Copiar ID Pro"
                >
                  {copiedCode === memberNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="bg-zinc-900/90 px-3 py-1.5 rounded-xl border border-zinc-800 flex items-center gap-2">
                <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Miembro Desde:</span>
                <span className="font-bold text-zinc-200">{memberSince}</span>
              </div>

              <div className="bg-zinc-900/90 px-3 py-1.5 rounded-xl border border-zinc-800 flex items-center gap-2">
                <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Descuento Repuestos:</span>
                <span className="font-black text-amber-400">-{tierInfo.partsDiscountPercent}% Directo</span>
              </div>
            </div>
          </div>

          {/* Card Right: Points Balance Box & Next Tier Progress */}
          <div className="bg-zinc-900/95 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 w-full lg:w-80 shrink-0 shadow-lg space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400 block">
                  Puntos Acumulados
                </span>
                <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight flex items-baseline gap-1">
                  <span>{points.toLocaleString()}</span>
                  <span className="text-xs font-bold text-zinc-400">pts</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Award className="w-6 h-6" />
              </div>
            </div>

            {/* Approximate cash value */}
            <div className="text-xs text-zinc-400 bg-zinc-950/80 px-3 py-2 rounded-xl border border-zinc-800/60 flex justify-between items-center">
              <span>Valor Canjeable:</span>
              <span className="font-bold text-zinc-200">
                ~US$ {Math.round(points / 10)} / RD$ {Math.round((points / 10) * USD_TO_DOP_RATE).toLocaleString()}
              </span>
            </div>

            {/* Next Tier Progression */}
            {nextTier ? (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-zinc-400">Progreso a {nextTier.name}:</span>
                  <span className="text-amber-400">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-zinc-400 block text-right">
                  Faltan <strong className="text-white">{pointsToNext.toLocaleString()} pts</strong> para subir de nivel
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>¡Estatus Máximo Platinum Alcanzado!</span>
              </div>
            )}

            {/* Quick Action in Card */}
            <button
              onClick={() => {
                setProMemberDiscount(true, tierInfo.partsDiscountPercent);
              }}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isProMemberDiscountActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/20'
              }`}
            >
              {isProMemberDiscountActive ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Descuento Activado en Carrito (-{tierInfo.partsDiscountPercent}%)</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-black" />
                  <span>Activar -{tierInfo.partsDiscountPercent}% en Mi Carrito</span>
                </>
              )}
            </button>

            {/* Show Digital QR Pass Button */}
            <button
              type="button"
              onClick={() => setShowQrPassModal(true)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700/80 cursor-pointer shadow-sm"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Pase Digital QR (Mostrador Km 22)</span>
            </button>
          </div>
        </div>
      </div>

      {/* LIVELINK TELEMATICS QUICK ALERT BANNER */}
      {onOpenLiveLinkTab && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-zinc-900 via-neutral-900 to-amber-950 text-white border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-amber-400">LiveLink™ IoT Telemetría Activa</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <p className="text-xs text-zinc-300 mt-0.5">
                Monitorea en tiempo real horómetros, temperaturas críticas de refrigerante/hidráulico y geocercas satelitales en canteras.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenLiveLinkTab}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow shrink-0 cursor-pointer active:scale-95"
          >
            <span>Ver Telemetría en Vivo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* SUCCESS BANNER WHEN REWARD IS REDEEMED */}
      {redeemSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-sm font-semibold flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{redeemSuccess}</span>
          </div>
          <button
            onClick={() => setRedeemSuccess(null)}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* 2. SUBTABS NAVIGATION */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <button
          onClick={() => setSubTab('discounts')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'discounts'
              ? 'bg-amber-500 text-black shadow-sm font-black'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Descuentos Exclusivos en Repuestos</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-600/20 text-current">
            {PRO_MEMBER_DISCOUNTS.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('points')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'points'
              ? 'bg-amber-500 text-black shadow-sm font-black'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Puntos de Fidelidad & Recompensas</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-600/20 text-current">
            {points.toLocaleString()} pts
          </span>
        </button>

        <button
          onClick={() => setSubTab('history')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'history'
              ? 'bg-amber-500 text-black shadow-sm font-black'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Historial de Servicios de Maquinaria</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-600/20 text-current">
            {totalCompletedServices}
          </span>
        </button>

        <button
          onClick={() => setSubTab('roi')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'roi'
              ? 'bg-amber-500 text-black shadow-sm font-black'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Calculadora de Retorno ROI</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
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
              <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-500" />
                <span>Cupones y Descuentos Exclusivos en Repuestos Genuinos</span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Como usuario registrado TMD Pro, tienes acceso inmediato a tarifas preferenciales en filtración, rodaje, fluidos y desgaste.
              </p>
            </div>

            <button
              onClick={() => onNavigate('#/parts')}
              className="px-4 py-2 rounded-xl text-xs font-extrabold bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
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
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between h-full gap-4 ${
                    isApplied
                      ? 'bg-amber-500/10 border-amber-500/60 dark:bg-amber-950/20 shadow-md ring-1 ring-amber-500/30'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40 shadow-xs'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-black">
                        {disc.badgeText}
                      </span>
                      {isApplied && (
                        <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Aplicado en Carrito</span>
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white">
                      {disc.category}
                    </h4>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {disc.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    {/* Coupon Code Block */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                      <div>
                        <span className="text-[9px] uppercase font-black text-zinc-400 block tracking-wider">
                          Código de Cupón VIP
                        </span>
                        <span className="font-mono text-xs font-black text-amber-600 dark:text-amber-400">
                          {disc.couponCode}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopyCode(disc.couponCode)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Copiar código"
                      >
                        {copiedCode === disc.couponCode ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500 text-[11px]">¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="text-[11px]">Copiar</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleApplyDiscountToCart(disc.couponCode)}
                        className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isApplied
                            ? 'bg-emerald-500 text-white'
                            : 'bg-amber-500 hover:bg-amber-400 text-black'
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
                        className="py-2 px-3 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-all flex items-center justify-center gap-1 cursor-pointer"
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
          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-extrabold text-xs text-zinc-900 dark:text-white">
                  Garantía de Fábrica OEM TMD
                </h5>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Todos los repuestos con descuento Pro-Member cuentan con garantía de 6 a 12 meses y despacho directo desde Santo Domingo Km 22.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('#/checkout')}
              className="px-4 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-black transition-all self-start sm:self-auto shrink-0 flex items-center gap-1.5 cursor-pointer"
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
          {/* Rewards Catalog */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                  <Gift className="w-5 h-5 text-amber-500" />
                  <span>Catálogo de Canje de Recompensas TMD Pro</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Canjea tus puntos acumulados por bonos de compra, análisis de fluidos y servicios técnicos para tus equipos.
                </p>
              </div>
              <div className="text-xs font-mono font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 self-start sm:self-auto">
                Balance disponible: {points.toLocaleString()} pts
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch">
              {PRO_REWARDS_CATALOG.map((reward) => {
                const canAfford = points >= reward.pointsCost;
                const isAlreadyRedeemed = redeemedRewardIds.includes(reward.id);

                return (
                  <div
                    key={reward.id}
                    className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40 transition-all flex flex-col justify-between h-full gap-4 shadow-xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          {reward.pointsCost} Puntos
                        </span>
                        {reward.badge && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                            {reward.badge}
                          </span>
                        )}
                      </div>

                      <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white">
                        {reward.title}
                      </h4>

                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {reward.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                          Valor Estimado
                        </span>
                        <span className="text-xs font-black text-zinc-900 dark:text-white">
                          US$ {reward.valueEstimateUsd} <span className="text-[10px] font-normal text-zinc-500">(~RD$ {(reward.valueEstimateUsd * USD_TO_DOP_RATE).toLocaleString()})</span>
                        </span>
                      </div>

                      <button
                        onClick={() => handleRedeemReward(reward)}
                        disabled={!canAfford}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/20'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                        }`}
                      >
                        {isAlreadyRedeemed ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Canjear De Nuevo</span>
                          </>
                        ) : canAfford ? (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Canjear Ahora</span>
                          </>
                        ) : (
                          <span>Faltan {reward.pointsCost - points} pts</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* How to earn points breakdown */}
          <div className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h4 className="font-black text-sm text-zinc-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <span>¿Cómo acumular más Puntos TMD Pro?</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="font-mono text-amber-500 font-black text-sm block">+1 a 1.5 Pts</span>
                <span className="font-bold text-zinc-900 dark:text-white block">Por cada US$ 1 Facturado</span>
                <p className="text-[11px] text-zinc-500">En repuestos genuinos, filtros y lubricantes adquiridos en plataforma.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="font-mono text-amber-500 font-black text-sm block">+250 Pts</span>
                <span className="font-bold text-zinc-900 dark:text-white block">Ficha de Flota Registrada</span>
                <p className="text-[11px] text-zinc-500">Por cada excavadora, rodillo o tractor registrado en tu portal.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="font-mono text-amber-500 font-black text-sm block">+350 Pts</span>
                <span className="font-bold text-zinc-900 dark:text-white block">Mantenimiento a Tiempo</span>
                <p className="text-[11px] text-zinc-500">Por completar los mantenimientos preventivos cada 250h / 500h sin retraso.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="font-mono text-amber-500 font-black text-sm block">+150 Pts</span>
                <span className="font-bold text-zinc-900 dark:text-white block">Calificación de Taller Móvil</span>
                <p className="text-[11px] text-zinc-500">Por validar y firmar digitalmente la orden de servicio en obra.</p>
              </div>
            </div>
          </div>

          {/* Points Transaction Ledger */}
          <div className="space-y-3">
            <h4 className="font-black text-sm text-zinc-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Historial y Libro de Puntos Pro</span>
            </h4>

            <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 font-bold uppercase tracking-wider text-[10px] border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="p-3.5">Fecha</th>
                      <th className="p-3.5">Concepto / Actividad</th>
                      <th className="p-3.5">Referencia</th>
                      <th className="p-3.5 text-right">Puntos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
                    {ledger.map((rec) => (
                      <tr key={rec.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="p-3.5 whitespace-nowrap text-zinc-500">
                          {rec.date}
                        </td>
                        <td className="p-3.5 font-semibold text-zinc-900 dark:text-white">
                          {rec.activity}
                        </td>
                        <td className="p-3.5 whitespace-nowrap font-mono text-zinc-500">
                          {rec.orderReference || '—'}
                        </td>
                        <td className="p-3.5 whitespace-nowrap text-right font-black font-mono">
                          {rec.type === 'earned' ? (
                            <span className="text-emerald-500">+{rec.points} pts</span>
                          ) : (
                            <span className="text-rose-500">-{rec.points} pts</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SERVICE HISTORY & FLEET TECHNICAL HEALTH SUMMARY                   */}
      {/* ========================================================================= */}
      {subTab === 'history' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-500" />
                <span>Historial de Servicios Técnicos & Trazabilidad de Flota</span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Registro de mantenimientos preventivos y correctivos ejecutados con repuestos genuinos certificados por TMD.
              </p>
            </div>

            <button
              onClick={() => onOpenServiceTab ? onOpenServiceTab() : onNavigate('#/portal?tab=service_history')}
              className="px-4 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-black transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <span>Abrir Módulo de Mantenimiento</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                Órdenes Completadas
              </span>
              <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
                {totalCompletedServices}
              </div>
              <span className="text-[10px] text-emerald-500 font-bold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>100% Conformes</span>
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                Horas Certificadas
              </span>
              <div className="text-2xl font-black text-amber-500 font-mono mt-1">
                {certifiedHours.toLocaleString()} <span className="text-xs font-normal">hrs</span>
              </div>
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Horómetros sincronizados
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                Repuestos OEM Instalados
              </span>
              <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
                {totalPartsInstalled > 0 ? totalPartsInstalled : 14}
              </div>
              <span className="text-[10px] text-emerald-500 font-bold mt-1 block">
                Garantía vigente
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                Taller Móvil en Obra
              </span>
              <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
                5 Visitas
              </div>
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Km 28 Duarte & Cap Cana
              </span>
            </div>
          </div>

          {/* Work Orders List */}
          <div className="space-y-3">
            {serviceOrders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                      {order.orderNumber}
                    </span>

                    <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{order.status === 'completed' ? 'Completado' : 'En Curso'}</span>
                    </span>

                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{order.completedDate || order.scheduledDate || 'Completado'}</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-sm text-zinc-900 dark:text-white">
                      {order.machineModel} {order.equipmentUnitId ? `(${order.equipmentUnitId})` : ''}
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                      {order.serviceType} • Horómetro: <strong className="font-mono">{order.horometerHours || 0} hrs</strong> • Técnico: {order.assignedTechnician || 'TMD Service'}
                    </p>
                  </div>

                  {/* Installed parts preview */}
                  {order.installedParts && order.installedParts.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] uppercase font-bold text-zinc-400">Repuestos:</span>
                      {order.installedParts.slice(0, 3).map((p, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono text-zinc-700 dark:text-zinc-300"
                        >
                          {p.partNumber} ({p.name})
                        </span>
                      ))}
                      {order.installedParts.length > 3 && (
                        <span className="text-[10px] text-zinc-400 font-bold">
                          +{order.installedParts.length - 3} más
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col sm:items-end justify-between gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                      Total Facturado
                    </span>
                    <span className="text-sm font-black text-zinc-900 dark:text-white font-mono">
                      US$ {order.totalCostUsd?.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenServiceTab ? onOpenServiceTab() : onNavigate('#/portal?tab=service_history')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors flex items-center gap-1 cursor-pointer"
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
      {subTab === 'roi' && (() => {
        const partsDiscount = tierInfo.partsDiscountPercent; // 15% for Gold
        const annualPartsSpend = fleetSize * monthlySpendPerMachine * 12;
        const partsSavingsAnnual = annualPartsSpend * (partsDiscount / 100);
        const preventedDowntimeHours = fleetSize * 14;
        const downtimeSavingsAnnual = preventedDowntimeHours * 85;
        const diagnosticVisitsSavings = fleetSize * 2 * 250;
        const totalAnnualSavingsUsd = Math.round(partsSavingsAnnual + downtimeSavingsAnnual + diagnosticVisitsSavings);
        const totalAnnualSavingsDop = Math.round(totalAnnualSavingsUsd * USD_TO_DOP_RATE);
        const roiPercent = Math.round((totalAnnualSavingsUsd / (annualPartsSpend || 1)) * 100);

        return (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Description */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-amber-500" />
                  <span>Calculadora de Retorno de Inversión (ROI) para Flotas Pro</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Proyecte el impacto económico de su membresía: ahorro directo del 15% en repuestos genuinos, cero tiempos muertos por filtración OEM y diagnósticos en obra incluidos.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Nivel {tierInfo.tier}: -{partsDiscount}% Garantizado</span>
                </span>
              </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Sliders Input Column */}
              <div className="lg:col-span-6 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider text-xs border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  Parámetros de su Flota de Maquinaria
                </h4>

                {/* Slider 1: Fleet Count */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">
                      1. Número de Equipos en Operación (Excavadoras, Retroexcavadoras, Rodillos):
                    </span>
                    <span className="font-mono font-black text-amber-500 text-sm">
                      {fleetSize} {fleetSize === 1 ? 'Unidad' : 'Unidades'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={25}
                    value={fleetSize}
                    onChange={(e) => setFleetSize(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>1 equipo</span>
                    <span>10 equipos</span>
                    <span>25 equipos</span>
                  </div>
                </div>

                {/* Slider 2: Monthly Parts & Filters Spend per Unit */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">
                      2. Consumo Mensual Promedio en Repuestos y Filtros por Equipo:
                    </span>
                    <span className="font-mono font-black text-amber-500 text-sm">
                      US$ {monthlySpendPerMachine.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={200}
                    max={3000}
                    step={50}
                    value={monthlySpendPerMachine}
                    onChange={(e) => setMonthlySpendPerMachine(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>US$ 200/mes</span>
                    <span>US$ 1,500/mes</span>
                    <span>US$ 3,000/mes</span>
                  </div>
                </div>

                {/* Slider 3: Monthly Working Hours */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">
                      3. Horas de Operación Mensuales Promedio por Unidad:
                    </span>
                    <span className="font-mono font-black text-amber-500 text-sm">
                      {operatingHours} hrs/mes
                    </span>
                  </div>
                  <input
                    type="range"
                    min={80}
                    max={300}
                    step={10}
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>80 hrs (Obra Ligera)</span>
                    <span>180 hrs (Estándar)</span>
                    <span>300 hrs (Doble Turno)</span>
                  </div>
                </div>

                {/* Technical Note */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-700 dark:text-zinc-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                    <span>Criterio Técnico Certificado TMD</span>
                  </div>
                  <p>
                    Las pérdidas por paradas no programadas se calculan a una tarifa estándar de <strong>US$ 85/hora</strong> en proyectos de construcción civil en República Dominicana.
                  </p>
                </div>
              </div>

              {/* Real-time ROI Summary Card */}
              <div className="lg:col-span-6 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 sm:p-7 rounded-3xl border border-amber-500/30 text-white shadow-xl flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-black text-amber-400 tracking-wider">
                      Resumen de Beneficio Neto Anual Pro
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      +{roiPercent}% ROI
                    </span>
                  </div>

                  <div className="mt-4">
                    <span className="text-[11px] text-zinc-400 font-bold block uppercase">Ahorro Económico Total Proyectado:</span>
                    <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight mt-1">
                      US$ {totalAnnualSavingsUsd.toLocaleString()}
                    </div>
                    <div className="text-xs font-semibold text-zinc-400 mt-0.5">
                      Equivalente a <strong className="text-white">RD$ {totalAnnualSavingsDop.toLocaleString()}</strong> (Tasa: {USD_TO_DOP_RATE})
                    </div>
                  </div>

                  {/* Financial Breakdown Table */}
                  <div className="mt-6 space-y-2.5 pt-4 border-t border-zinc-800 text-xs">
                    <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/60">
                      <span className="text-zinc-400 flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-amber-400" />
                        <span>Descuento Directo ({partsDiscount}% en Facturas):</span>
                      </span>
                      <span className="font-mono font-bold text-white">
                        +US$ {Math.round(partsSavingsAnnual).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/60">
                      <span className="text-zinc-400 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span>Evitación de Tiempos Muertos ({preventedDowntimeHours}h no paradas):</span>
                      </span>
                      <span className="font-mono font-bold text-white">
                        +US$ {downtimeSavingsAnnual.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-zinc-400 flex items-center gap-2">
                        <Truck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Diagnósticos Gratuitos en Obra ({fleetSize * 2} visitas):</span>
                      </span>
                      <span className="font-mono font-bold text-white">
                        +US$ {diagnosticVisitsSavings.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="space-y-2 pt-4 border-t border-zinc-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setProMemberDiscount(true, partsDiscount);
                        showToast(`¡Descuento VIP del ${partsDiscount}% activado en su sesión! Tarifa Pro aplicada.`);
                      }}
                      className="py-3 px-4 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <Zap className="w-4 h-4 fill-black" />
                      <span>Activar -{partsDiscount}% Ahora</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigate('#/parts')}
                      className="py-3 px-4 rounded-xl text-xs font-extrabold bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-amber-400" />
                      <span>Adquirir Kits de Filtros</span>
                    </button>
                  </div>

                  <p className="text-[10px] text-zinc-500 text-center pt-1">
                    Cálculos aplicables a flotas corporativas registradas bajo RNC en Tecnomaquinarias Diesel S.R.L.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL: PASE DIGITAL PRO-MEMBER QR (MOSTRADOR KM 22)                       */}
      {/* ========================================================================= */}
      {showQrPassModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-md w-full bg-zinc-950 rounded-3xl border-2 border-amber-500/50 shadow-2xl overflow-hidden relative text-white">
            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => setShowQrPassModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors z-10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Pass Header */}
            <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 p-5 text-black">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-6 h-6 fill-black" />
                  <span className="font-black text-sm uppercase tracking-wider">TMD Pro-Member Pass</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-black text-amber-400">
                  Nivel {tierInfo.tier}
                </span>
              </div>
              <h3 className="text-xl font-black mt-2 tracking-tight">
                Pase Digital de Mostrador
              </h3>
              <p className="text-xs font-semibold text-black/80">
                Autopista Duarte Km 22, Pedro Brand • Santiago • Punta Cana
              </p>
            </div>

            {/* Pass Body with Member Data & QR */}
            <div className="p-6 space-y-5 text-center">
              <div>
                <div className="text-lg font-black text-white">{memberName}</div>
                <div className="text-xs font-semibold text-amber-400">{companyName}</div>
                <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                  ID: <strong className="text-white">{memberNumber}</strong> {userProfile?.rnc ? `• RNC: ${userProfile.rnc}` : ''}
                </div>
              </div>

              {/* High-Contrast SVG QR Code Visual */}
              <div className="bg-white p-4 rounded-2xl inline-block shadow-lg mx-auto border-4 border-amber-500/20">
                <svg
                  className="w-44 h-44 mx-auto text-zinc-950"
                  viewBox="0 0 100 100"
                  fill="currentColor"
                >
                  {/* Outer corner square Top-Left */}
                  <rect x="5" y="5" width="26" height="26" rx="2" fill="currentColor" />
                  <rect x="9" y="9" width="18" height="18" rx="1" fill="white" />
                  <rect x="13" y="13" width="10" height="10" rx="1" fill="currentColor" />

                  {/* Outer corner square Top-Right */}
                  <rect x="69" y="5" width="26" height="26" rx="2" fill="currentColor" />
                  <rect x="73" y="9" width="18" height="18" rx="1" fill="white" />
                  <rect x="77" y="13" width="10" height="10" rx="1" fill="currentColor" />

                  {/* Outer corner square Bottom-Left */}
                  <rect x="5" y="69" width="26" height="26" rx="2" fill="currentColor" />
                  <rect x="9" y="73" width="18" height="18" rx="1" fill="white" />
                  <rect x="13" y="77" width="10" height="10" rx="1" fill="currentColor" />

                  {/* Dynamic Pattern Elements for authenticity */}
                  <rect x="36" y="8" width="5" height="5" />
                  <rect x="46" y="8" width="5" height="5" />
                  <rect x="56" y="8" width="5" height="5" />
                  <rect x="36" y="18" width="5" height="5" />
                  <rect x="56" y="18" width="5" height="5" />
                  <rect x="46" y="24" width="5" height="5" />

                  {/* Center Data Matrix */}
                  <rect x="38" y="38" width="24" height="24" rx="2" fill="#d97706" />
                  <rect x="42" y="42" width="16" height="16" rx="1" fill="white" />
                  <rect x="46" y="46" width="8" height="8" rx="1" fill="#d97706" />

                  {/* Additional barcode dots */}
                  <rect x="8" y="38" width="5" height="5" />
                  <rect x="18" y="38" width="5" height="5" />
                  <rect x="24" y="46" width="5" height="5" />
                  <rect x="8" y="52" width="5" height="5" />
                  <rect x="18" y="58" width="5" height="5" />

                  <rect x="68" y="38" width="5" height="5" />
                  <rect x="78" y="38" width="5" height="5" />
                  <rect x="88" y="46" width="5" height="5" />
                  <rect x="74" y="52" width="5" height="5" />
                  <rect x="84" y="58" width="5" height="5" />

                  <rect x="38" y="68" width="5" height="5" />
                  <rect x="48" y="68" width="5" height="5" />
                  <rect x="58" y="74" width="5" height="5" />
                  <rect x="42" y="82" width="5" height="5" />
                  <rect x="52" y="88" width="5" height="5" />
                </svg>
                <div className="text-[10px] font-mono text-zinc-600 font-bold mt-1">
                  TMD-SCAN-VERIFIED-{memberNumber}
                </div>
              </div>

              {/* Counter instructions */}
              <div className="text-xs text-zinc-300 bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Beneficio Activo: -{tierInfo.partsDiscountPercent}% en Mostrador</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Muestre esta pantalla al despachador de almacén para aplicar su tarifa VIP directamente al comprobante fiscal B01.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`TMD-PRO-MEMBER:${memberNumber}:${memberName}`);
                    showToast('¡Código de socio copiado al portapapeles!');
                  }}
                  className="py-2.5 px-3 rounded-xl text-xs font-extrabold bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar ID</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowQrPassModal(false)}
                  className="py-2.5 px-3 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Listo</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
