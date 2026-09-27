import React, { useState, useRef, useEffect } from 'react';
import { 
  Wrench, 
  ShoppingCart, 
  Sun, 
  Moon, 
  Phone, 
  Menu, 
  X, 
  ShieldCheck, 
  Search, 
  Bell, 
  ChevronDown, 
  ArrowRight, 
  Truck, 
  HardHat, 
  Cog, 
  Calendar, 
  Shield, 
  Layers,
  Flame,
  CheckCircle2,
  RefreshCw,
  WifiOff,
  UserCheck,
  Mountain,
  ChevronRight,
  Activity,
  ArrowLeft,
  LogOut,
  Radio,
  Compass,
  Building2,
  Sparkles,
  Users,
  Pin,
  PinOff,
  Landmark,
  QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useOfflineSync } from '../context/OfflineSyncContext';
import { IndustrialMegaMenu, IndustrialSegmentKey } from './header/IndustrialMegaMenu';
import { MobileTabletIndustrialMenu } from './header/MobileTabletIndustrialMenu';
import { TMDLogo } from './common/BrandLogos';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenSearch?: () => void;
  onOpenTour?: () => void;
  onOpenQrScanner?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentRoute, 
  onNavigate,
  onOpenSearch,
  onOpenTour,
  onOpenQrScanner
}) => {
  const { theme, toggleTheme } = useTheme();
  const { 
    totalCartCount, 
    totalQuotesCount, 
    currency, 
    setCurrency, 
    exchangeRate, 
    exchangeRateData, 
    isSyncingRate, 
    refreshExchangeRate 
  } = useCart();
  const { currentUser, userProfile, isAdmin, isStaff, isClient, role, signOut } = useAuth();
  const { unreadCount, openNotificationPanel } = useNotifications();
  const { effectiveOnline, isSimulatedOffline, syncState, syncProgress, openVaultModal } = useOfflineSync();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [isMenuPinned, setIsMenuPinned] = useState(false);
  const [activeSegment, setActiveSegment] = useState<IndustrialSegmentKey>('construction');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState<IndustrialSegmentKey | null>('construction');

  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  const totalBadges = totalCartCount + totalQuotesCount;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global outside click and Escape key listeners to cleanly dismiss menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
          closeTimeoutRef.current = null;
        }
        setIsMenuPinned(false);
        setMegaMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
          closeTimeoutRef.current = null;
        }
        setIsMenuPinned(false);
        setMegaMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOpenMegaMenu = (segment: IndustrialSegmentKey) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActiveSegment(segment);
    setMegaMenuOpen(true);
  };

  const handleScheduleMegaMenuClose = () => {
    // If user pinned the menu for continuous exploration, do not auto-close on mouse leave
    if (isMenuPinned) return;
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 320);
  };

  const handleCloseMegaMenuImmediately = () => {
    // If pinned, hovering adjacent non-menu items will not prematurely close the menu unless intentional
    if (isMenuPinned) return;
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setMegaMenuOpen(false);
  };

  const handleForceCloseMegaMenu = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsMenuPinned(false);
    setMegaMenuOpen(false);
  };

  const handleMegaMenuCancelClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleNav = (route: string) => {
    handleForceCloseMegaMenu();
    setMobileMenuOpen(false);
    onNavigate(route);
  };

  const isCheckoutMode = currentRoute === '#/checkout';
  const isAdminMode = ['#/admin', '#/admin-dashboard'].includes(currentRoute);
  const isPortalMode = currentRoute === '#/portal';
  const isWorkspaceMode = ['#/fullbay', '#/livelink'].includes(currentRoute);

  // -------------------------------------------------------------
  // 1. ADMIN HQ MODULE HEADER (Clean, dense, strictly administrative)
  // -------------------------------------------------------------
  if (isAdminMode) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950 text-white shadow-md">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 max-w-[1780px] mx-auto h-14 flex items-center justify-between gap-4">
          {/* Brand & Admin Badge */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleNav('#/home')} 
              className="flex items-center gap-2 cursor-pointer group"
              title="Ir al Showroom Público"
            >
              <TMDLogo variant="responsive" className="h-8 sm:h-9 group-hover:scale-105 transition-transform" />
            </button>
            <span className="text-zinc-700">/</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ADMIN HQ</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-zinc-400 pl-2 border-l border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Firestore En Vivo</span>
            </div>
          </div>

          {/* Admin Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Showroom Exit */}
            <button
              onClick={() => handleNav('#/home')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-bold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Ver Showroom</span>
            </button>

            {/* Currency selector for admin valuations */}
            <div className="hidden sm:flex items-center gap-1 bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${currency === 'USD' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'}`}
              >
                USD
              </button>
              <button
                onClick={() => setCurrency('DOP')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${currency === 'DOP' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'}`}
              >
                DOP
              </button>
            </div>

            {/* Notifications */}
            <button
              onClick={openNotificationPanel}
              className="relative p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
              title="Notificaciones Administrativas"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
              title="Alternar Tema"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Session Info */}
            {currentUser && (
              <div className="hidden md:flex items-center gap-2 pl-2 border-l border-zinc-800 text-xs">
                <div className="text-right">
                  <div className="font-bold text-white leading-none">
                    {userProfile?.displayName || currentUser.email?.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-amber-400 uppercase font-semibold mt-0.5">
                    {role || 'Admin'}
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-900 transition-colors"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }

  // -------------------------------------------------------------
  // 2. PORTAL CLIENTES MODULE HEADER (Clean, customer-centric)
  // -------------------------------------------------------------
  if (isPortalMode) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-zinc-950/80 backdrop-blur-md text-white">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 max-w-[1780px] mx-auto h-15 flex items-center justify-between gap-4 bg-transparent">
          <div className="flex items-center gap-3">
            <button onClick={() => handleNav('#/home')} className="flex items-center gap-2 cursor-pointer group" title="Ir al Showroom Principal">
              <TMDLogo variant="responsive" className="h-8 sm:h-9 group-hover:scale-105 transition-transform" />
              <div className="hidden sm:block pl-3 border-l border-white/10">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-extrabold text-sm tracking-tight text-white">
                    {isAdmin ? 'PORTAL ADMINISTRATIVO' : isStaff ? 'PORTAL DE OFICINA & STAFF' : 'PORTAL DE CLIENTES'}
                  </span>
                  <span className="text-amber-400 font-bold text-xs">RD</span>
                </div>
                <span className="text-[10px] font-semibold text-zinc-400">
                  {isAdmin || isStaff ? 'Cotizaciones DGII, Despacho Km 22 y Clientes' : 'Flota, Facturación NCF y Servicios'}
                </span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Catalog Access */}
            <button
              onClick={() => handleNav('#/machinery')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 text-xs font-bold transition-all cursor-pointer backdrop-blur-sm"
            >
              <HardHat className="w-3.5 h-3.5 text-amber-500" />
              <span>Ver Catálogo Maquinaria</span>
            </button>

            {/* Offline PWA Vault */}
            <button
              onClick={openVaultModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer backdrop-blur-sm ${
                !effectiveOnline || isSimulatedOffline
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : syncState === 'syncing'
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  : 'bg-zinc-900/70 text-zinc-300 border-white/10 hover:border-amber-500'
              }`}
              title="Bóveda Técnica Offline PWA"
            >
              {syncState === 'syncing' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
              ) : !effectiveOnline || isSimulatedOffline ? (
                <WifiOff className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <HardHat className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span className="hidden md:inline">
                {syncState === 'syncing' ? `Sincronizando ${syncProgress}%` : !effectiveOnline ? 'Modo Mina' : 'Bóveda PWA'}
              </span>
            </button>

            {/* Cart / Proforma badge */}
            <button
              onClick={() => handleNav('#/checkout')}
              aria-label="Ver carrito y proformas"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer backdrop-blur-sm ${
                totalBadges > 0
                  ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-sm'
                  : 'bg-zinc-900/70 text-zinc-300 border border-white/10 hover:border-white/20'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {totalBadges > 0 && (
                <span className="w-4 h-4 rounded-full bg-black text-white text-[10px] font-black flex items-center justify-center">
                  {totalBadges}
                </span>
              )}
            </button>

            {/* Notifications */}
            <button
              onClick={openNotificationPanel}
              className="relative p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-900/70 border border-transparent hover:border-white/10 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-900/70 border border-transparent hover:border-white/10 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-300" />}
            </button>

            {/* Admin HQ shortcut if user is admin */}
            {isAdmin && (
              <button
                onClick={() => handleNav('#/admin-dashboard')}
                className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 text-amber-400 border border-zinc-700 text-xs font-black cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin HQ</span>
              </button>
            )}
          </div>
        </div>
      </header>
    );
  }

  // -------------------------------------------------------------
  // 3. WORKSPACE HEADER (LiveLink & Fullbay Shop Manager)
  // -------------------------------------------------------------
  if (isWorkspaceMode) {
    const workspaceTitle = 
      currentRoute === '#/livelink' ? 'Telemetría Satelital LiveLink™' : 'Taller Fullbay HD & Órdenes';

    return (
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 max-w-[1780px] mx-auto h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => handleNav('#/home')} className="flex items-center gap-2 cursor-pointer group" title="Ir al Showroom Principal">
              <TMDLogo variant="responsive" className="h-7 sm:h-8 group-hover:scale-105 transition-transform" />
            </button>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {currentRoute === '#/livelink' ? <Radio className="w-4 h-4 text-amber-500 animate-pulse" /> : <Wrench className="w-4 h-4 text-amber-500" />}
              <span>{workspaceTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct Switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
              <button
                onClick={() => handleNav('#/livelink')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${currentRoute === '#/livelink' ? 'bg-amber-500 text-black shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-white'}`}
              >
                LiveLink
              </button>
              <button
                onClick={() => handleNav('#/fullbay')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${currentRoute === '#/fullbay' ? 'bg-amber-500 text-black shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-white'}`}
              >
                Fullbay Taller
              </button>
            </div>

            <button
              onClick={() => handleNav('#/home')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              Showroom
            </button>

            <button
              onClick={openVaultModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500 cursor-pointer"
              title="Bóveda PWA"
            >
              <HardHat className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden md:inline">Bóveda PWA</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
            </button>
          </div>
        </div>
      </header>
    );
  }

  // -------------------------------------------------------------
  // 4. FOCUS / CHECKOUT HEADER (Linear, distraction-free)
  // -------------------------------------------------------------
  if (isCheckoutMode) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 max-w-[1780px] mx-auto h-16 flex items-center justify-between gap-4">
          <button 
            onClick={() => handleNav('#/home')} 
            className="flex items-center gap-3 text-left focus:outline-none cursor-pointer"
          >
            <TMDLogo variant="responsive" className="h-8 sm:h-10 hover:scale-102 transition-transform" />
            <div className="hidden sm:block pl-3 border-l border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                Checkout & Proforma Fiscal NCF
              </span>
            </div>
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handleNav('#/machinery')}
              className="text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-amber-500 transition-colors"
            >
              ← Volver al Catálogo
            </button>
            <a
              href="https://wa.me/18095601234?text=Hola%20TMD,%20requiero%20asistencia%20en%20el%20checkout"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Ayuda 24/7</span>
            </a>
          </div>
        </div>
      </header>
    );
  }

  // -------------------------------------------------------------
  // 5. MAIN PUBLIC SHOWROOM HEADER
  // -------------------------------------------------------------
  return (
    <header 
      ref={headerRef}
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#06060a]/95 backdrop-blur-xl border-b border-white/[0.08] shadow-lg shadow-black/50' 
          : 'bg-[#0a0a10]/90 backdrop-blur-xl border-b border-white/[0.06]'
      }`}
      onMouseLeave={handleScheduleMegaMenuClose}
    >
      {/* Sleek Top Micro-Bar (On top of menu bar) */}
      <div 
        onMouseEnter={handleCloseMegaMenuImmediately}
        className="bg-[#050508]/95 backdrop-blur-md text-zinc-400 text-[11px] py-1.5 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-white/[0.06] hidden sm:flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-zinc-200 font-bold uppercase tracking-wider text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
            <span className="text-brand-gold">DISTRIBUIDOR OFICIAL</span> REPÚBLICA DOMINICANA
          </span>
          <span className="text-zinc-700 hidden md:inline">•</span>
          <span className="hidden md:inline text-[10px] uppercase font-bold text-zinc-400 tracking-wider">SEDE CENTRAL KM 22, AUTOPISTA DUARTE</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Emergencias 24/7 Hotline */}
          <a
            href="tel:18095601234"
            className="flex items-center gap-1.5 text-zinc-300 hover:text-brand-gold transition-colors font-medium text-[10px] uppercase tracking-wider"
          >
            <Phone className="w-3 h-3 text-emerald-400" />
            <span className="hidden lg:inline text-zinc-400">EMERGENCIAS 24/7: </span>
            <strong className="text-white font-mono font-bold">+1 (809) 560-1234</strong>
          </a>

          <div className="h-3 w-px bg-white/[0.08]" />

          {/* Currency Switcher & Live Rate Sync */}
          <div className="flex items-center gap-1.5 font-mono">
            <div className="flex items-center gap-0.5 bg-[#09090e] rounded-[3px] p-0.5 border border-white/[0.08]">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-1.5 py-0.5 rounded-[2px] text-[10px] font-black uppercase transition-colors cursor-pointer ${
                  currency === 'USD' ? 'bg-[#181824] text-brand-gold border border-brand-gold-dark/50 shadow-xs' : 'text-zinc-400 hover:text-white'
                }`}
              >
                USD
              </button>
              <button
                onClick={() => setCurrency('DOP')}
                className={`px-1.5 py-0.5 rounded-[2px] text-[10px] font-black uppercase transition-colors cursor-pointer ${
                  currency === 'DOP' ? 'bg-[#181824] text-brand-gold border border-brand-gold-dark/50 shadow-xs' : 'text-zinc-400 hover:text-white'
                }`}
              >
                RD$
              </button>
            </div>

            <button
              onClick={refreshExchangeRate}
              disabled={isSyncingRate}
              title={`Tasa en vivo: 1 USD = RD$ ${exchangeRate.toFixed(2)} (${exchangeRateData.source}). Click para actualizar.`}
              className="hidden xl:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-zinc-900 border border-zinc-800 text-[9px] text-zinc-400 hover:text-amber-400 hover:border-amber-400/40 transition-all cursor-pointer"
            >
              <span className={`w-1 h-1 rounded-full ${exchangeRateData.isLive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span>RD$ {exchangeRate.toFixed(2)}</span>
              <RefreshCw className={`w-2.5 h-2.5 ${isSyncingRate ? 'animate-spin text-amber-400' : 'text-zinc-500'}`} />
            </button>
          </div>

          <div className="h-3 w-px bg-white/[0.08]" />

          {/* Theme Switcher Moved to Top of Menu Bar */}
          <button
            onClick={toggleTheme}
            aria-label="Alternar tema claro/oscuro"
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-zinc-300 hover:text-white hover:bg-[#12121c] transition-colors cursor-pointer border border-white/[0.08] text-[10px] font-black uppercase"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-brand-gold" /> : <Moon className="w-3.5 h-3.5 text-zinc-300" />}
            <span className="hidden lg:inline">{theme === 'dark' ? 'OSCURO' : 'CLARO'}</span>
          </button>

          {/* Notifications Bell Moved to Top of Menu Bar */}
          <button
            onClick={openNotificationPanel}
            aria-label="Ver notificaciones"
            title="Notificaciones"
            className="relative p-1 rounded-[3px] text-zinc-300 hover:text-white hover:bg-[#12121c] transition-colors cursor-pointer border border-white/[0.08]"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
            )}
          </button>

          {/* Pin Mega Menu Toggle */}
          <button
            onClick={() => setIsMenuPinned(!isMenuPinned)}
            title={isMenuPinned ? 'Desfijar menú (cierre automático)' : 'Fijar menú para navegación continua'}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer border ${
              isMenuPinned
                ? 'bg-[#181824] text-brand-gold border-brand-gold-dark/50'
                : 'text-zinc-400 hover:text-zinc-200 border-white/[0.08] hover:bg-[#12121c]'
            }`}
          >
            {isMenuPinned ? <PinOff className="w-3 h-3 text-brand-gold" /> : <Pin className="w-3 h-3" />}
            <span className="hidden xl:inline">{isMenuPinned ? 'FIJADO' : 'FIJAR'}</span>
          </button>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="w-full px-3.5 sm:px-6 lg:px-10 xl:px-12 max-w-[1780px] mx-auto h-15 sm:h-16 flex items-center justify-between gap-3 sm:gap-4 transition-all">
        {/* Brand Logo */}
        <button
          onClick={() => handleNav('#/home')}
          onMouseEnter={handleCloseMegaMenuImmediately}
          className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer shrink-0"
        >
          <TMDLogo variant="responsive" className="h-8 sm:h-10 group-hover:scale-103 transition-transform" />
        </button>

        {/* Primary Desktop Navigation Links: Icon-Free, Short, Bold ALL CAPS */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 font-display">
          {/* INICIO */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => handleNav('#/home')}
            onMouseEnter={handleCloseMegaMenuImmediately}
            className={`px-3 py-1.5 rounded-[5px] text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
              currentRoute === '#/home' && !megaMenuOpen
                ? 'text-white bg-zinc-800/90 border border-zinc-700 shadow-xs'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            INICIO
          </motion.button>

          {/* Trigger 1: MAQUINARIA */}
          <motion.button
            whileHover={{ y: -1, transition: { type: 'spring', stiffness: 500, damping: 25 } }}
            whileTap={{ scale: 0.97 }}
            onMouseEnter={() => handleOpenMegaMenu('heavy_machinery')}
            onClick={() => {
              handleCloseMegaMenuImmediately();
              handleNav('#/machinery');
            }}
            aria-expanded={megaMenuOpen && (activeSegment === 'heavy_machinery' || activeSegment === 'construction')}
            className={`flex items-center gap-1 px-2.5 xl:px-3 py-1.5 rounded-[5px] text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
              currentRoute === '#/machinery'
                ? 'text-amber-400 bg-zinc-900 border border-amber-500/50 shadow-inner'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <span>MAQUINARIA</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${
              megaMenuOpen && (activeSegment === 'heavy_machinery' || activeSegment === 'construction') ? 'rotate-180 text-amber-400' : 'text-zinc-400'
            }`} />
          </motion.button>

          {/* Trigger 2: RENTA */}
          <motion.button
            whileHover={{ y: -1, transition: { type: 'spring', stiffness: 500, damping: 25 } }}
            whileTap={{ scale: 0.97 }}
            onMouseEnter={() => handleOpenMegaMenu('contractor_deploy')}
            onClick={() => {
              handleCloseMegaMenuImmediately();
              handleNav('#/rental');
            }}
            aria-expanded={megaMenuOpen && (activeSegment === 'contractor_deploy' || activeSegment === 'contractors')}
            className={`flex items-center gap-1 px-2.5 xl:px-3 py-1.5 rounded-[5px] text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
              currentRoute === '#/rental'
                ? 'text-amber-400 bg-zinc-900 border border-amber-500/50 shadow-inner'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <span>RENTA</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${
              megaMenuOpen && (activeSegment === 'contractor_deploy' || activeSegment === 'contractors') ? 'rotate-180 text-amber-400' : 'text-zinc-400'
            }`} />
          </motion.button>

          {/* Trigger 3: REPUESTOS */}
          <motion.button
            whileHover={{ y: -1, transition: { type: 'spring', stiffness: 500, damping: 25 } }}
            whileTap={{ scale: 0.97 }}
            onMouseEnter={() => handleOpenMegaMenu('parts')}
            onClick={() => {
              handleCloseMegaMenuImmediately();
              handleNav('#/parts');
            }}
            aria-expanded={megaMenuOpen && (activeSegment === 'parts' || activeSegment === 'parts_service')}
            className={`flex items-center gap-1 px-2.5 xl:px-3 py-1.5 rounded-[5px] text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
              currentRoute === '#/parts'
                ? 'text-amber-400 bg-zinc-900 border border-amber-500/50 shadow-inner'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <span>REPUESTOS</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${
              megaMenuOpen && (activeSegment === 'parts' || activeSegment === 'parts_service') ? 'rotate-180 text-amber-400' : 'text-zinc-400'
            }`} />
          </motion.button>

          {/* Trigger 4: SERVICIOS */}
          <motion.button
            whileHover={{ y: -1, transition: { type: 'spring', stiffness: 500, damping: 25 } }}
            whileTap={{ scale: 0.97 }}
            onMouseEnter={handleCloseMegaMenuImmediately}
            onClick={() => {
              handleCloseMegaMenuImmediately();
              handleNav('#/service');
            }}
            className={`flex items-center gap-1 px-2.5 xl:px-3 py-1.5 rounded-[5px] text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
              currentRoute === '#/service'
                ? 'text-amber-400 bg-zinc-900 border border-amber-500/50 shadow-inner'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <span>SERVICIOS</span>
          </motion.button>

          {/* Trigger 5: LICITACIONES */}
          <motion.button
            whileHover={{ y: -1, transition: { type: 'spring', stiffness: 500, damping: 25 } }}
            whileTap={{ scale: 0.97 }}
            onMouseEnter={() => handleOpenMegaMenu('gov_bids')}
            onClick={() => {
              handleCloseMegaMenuImmediately();
              handleNav('#/tech-docs');
            }}
            aria-expanded={megaMenuOpen && (activeSegment === 'gov_bids' || activeSegment === 'government')}
            className={`flex items-center gap-1 px-2.5 xl:px-3 py-1.5 rounded-[5px] text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
              currentRoute === '#/tech-docs'
                ? 'text-amber-400 bg-zinc-900 border border-amber-500/50 shadow-inner'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <span>LICITACIONES</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${
              megaMenuOpen && (activeSegment === 'gov_bids' || activeSegment === 'government') ? 'rotate-180 text-amber-400' : 'text-zinc-400'
            }`} />
          </motion.button>

          {/* Trigger 6: NOSOTROS */}
          <motion.button
            whileHover={{ y: -1, transition: { type: 'spring', stiffness: 500, damping: 25 } }}
            whileTap={{ scale: 0.97 }}
            onMouseEnter={handleCloseMegaMenuImmediately}
            onClick={() => {
              handleCloseMegaMenuImmediately();
              handleNav('#/about');
            }}
            className={`flex items-center gap-1 px-2.5 xl:px-3 py-1.5 rounded-[5px] text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
              currentRoute === '#/about'
                ? 'text-amber-400 bg-zinc-900 border border-amber-500/50 shadow-inner'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <span>NOSOTROS</span>
          </motion.button>

          {/* PORTAL */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              handleCloseMegaMenuImmediately();
              handleNav('#/portal');
            }}
            onMouseEnter={handleCloseMegaMenuImmediately}
            className={`flex items-center gap-1 px-2.5 xl:px-3 py-1.5 rounded-[5px] text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
              currentRoute === '#/portal'
                ? 'text-white bg-zinc-800/90 border border-zinc-700'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <span>{isAdmin ? 'PORTAL ADMIN' : isStaff ? 'PORTAL OFICINA' : 'PORTAL'}</span>
            {(isAdmin || isStaff) && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-zinc-700 text-amber-400 border border-zinc-600">
                Staff
              </span>
            )}
          </motion.button>
        </nav>

        {/* Right Action Icons & Controls (Streamlined: Theme & Notifications moved to top bar) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Omnibox Search Button */}
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              onMouseEnter={handleCloseMegaMenuImmediately}
              aria-label="Buscar en catálogo"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#09090f] border border-white/[0.08] text-zinc-300 hover:text-white hover:border-brand-gold-dark/50 transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-brand-gold" />
              <span className="hidden xl:inline text-xs font-black uppercase tracking-wider text-zinc-400">BUSCAR...</span>
              <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono font-black bg-[#14141c] text-brand-gold border border-white/[0.08]">
                ⌘K
              </kbd>
            </button>
          )}

          {/* Quick QR Code Scanner Button */}
          {onOpenQrScanner && (
            <button
              onClick={onOpenQrScanner}
              onMouseEnter={handleCloseMegaMenuImmediately}
              aria-label="Escanear código QR de maquinaria o repuesto"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#09090f] border border-white/[0.08] text-zinc-300 hover:text-brand-gold hover:border-brand-gold-dark/50 transition-colors cursor-pointer group"
              title="Escanear Código QR Industrial (Ctrl+Shift+Q)"
            >
              <QrCode className="w-3.5 h-3.5 text-brand-gold group-hover:scale-110 transition-transform" />
              <span className="hidden xl:inline text-xs font-black uppercase tracking-wider text-zinc-400 group-hover:text-white">QR SCAN</span>
            </button>
          )}

          {/* Cart / Cotización Button */}
          <button
            onClick={() => handleNav('#/checkout')}
            onMouseEnter={handleCloseMegaMenuImmediately}
            aria-label="Ver cotización y carrito"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-black uppercase tracking-wider text-xs transition-all cursor-pointer border ${
              totalBadges > 0
                ? 'bg-brand-gold-dark hover:bg-brand-gold text-black border-brand-gold-dark shadow-sm'
                : 'bg-[#09090f] hover:bg-[#14141c] text-zinc-200 border-white/[0.08]'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5 text-inherit" />
            <span className="hidden sm:inline">
              {totalQuotesCount > 0 && totalCartCount === 0 ? 'COTIZACIÓN' : 'CARRITO'}
            </span>
            {totalBadges > 0 && (
              <span className="w-4 h-4 rounded-[2px] bg-black text-brand-gold text-[10px] font-black flex items-center justify-center">
                {totalBadges}
              </span>
            )}
          </button>

          {/* Admin HQ Button (Conditional for admin) */}
          {isAdmin && (
            <button
              onClick={() => handleNav('#/admin-dashboard')}
              onMouseEnter={handleCloseMegaMenuImmediately}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all border border-white/[0.08] bg-[#09090f] hover:bg-[#14141c] text-brand-gold cursor-pointer"
              title="Panel Administrativo"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">ADMIN HQ</span>
            </button>
          )}

          {/* Staff Ops Button (Conditional for staff only) */}
          {isStaff && !isAdmin && (
            <button
              onClick={() => handleNav('#/portal')}
              onMouseEnter={handleCloseMegaMenuImmediately}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all border border-amber-500/30 bg-amber-950/30 hover:bg-amber-900/30 text-amber-400 cursor-pointer"
              title="Consola de Oficina & Ventas"
            >
              <HardHat className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">STAFF OPS</span>
            </button>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menú"
            className="lg:hidden p-2 rounded-lg text-zinc-200 bg-[#09090f] border border-white/[0.08] hover:bg-[#14141c] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* SEGMENTED INDUSTRIAL MEGA MENU (FLYOUT WITH BUTTERY SPRING ANIMATIONS & BACKDROP) */}
      <AnimatePresence>
        {megaMenuOpen && (
          <>
            {/* Click-away backdrop overlay — 10% content blur effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={handleForceCloseMegaMenu}
              className="hidden lg:block fixed inset-0 top-[105px] bg-black/20 backdrop-blur-[8px] z-30 pointer-events-auto cursor-pointer"
            />
            {/* Hover-bridge safe zone: invisible hit box eliminating any gap between header and menu */}
            <div 
              className="hidden lg:block absolute top-full left-0 right-0 h-4 z-40"
              onMouseEnter={handleMegaMenuCancelClose}
            />
            <motion.div 
              initial={{ opacity: 0, y: -10, scaleY: 0.985, originY: 0 }}
              animate={{ opacity: 1, y: 0, scaleY: 1, originY: 0 }}
              exit={{ opacity: 0, y: -8, scaleY: 0.99, originY: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 340, 
                damping: 30, 
                mass: 0.75,
                opacity: { duration: 0.16, ease: "easeOut" }
              }}
              className="hidden lg:block absolute top-full left-0 right-0 w-full bg-white/98 dark:bg-zinc-950/98 backdrop-blur-2xl border-b border-zinc-200/90 dark:border-zinc-800/90 shadow-2xl z-50 overflow-hidden"
              onMouseEnter={handleMegaMenuCancelClose}
              onMouseLeave={handleScheduleMegaMenuClose}
            >
              <IndustrialMegaMenu
                initialSegment={activeSegment}
                activeSegment={activeSegment}
                onSelectSegment={setActiveSegment}
                onNavigate={handleNav}
                onClose={handleForceCloseMegaMenu}
                isPinned={isMenuPinned}
                onTogglePin={() => setIsMenuPinned(prev => !prev)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CLEAN SEGMENTED RESPONSIVE MOBILE & TABLET INDUSTRIAL MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Click-away backdrop overlay for tablet/mobile — 10% content blur effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 top-[60px] sm:top-[105px] bg-black/40 backdrop-blur-[8px] z-30 pointer-events-auto"
            />

            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ 
                type: "spring", 
                stiffness: 350, 
                damping: 28, 
                mass: 0.75,
                opacity: { duration: 0.16 } 
              }}
              className="lg:hidden absolute top-full left-0 right-0 w-full z-40 border-t border-zinc-200/80 dark:border-white/[0.08] shadow-2xl overflow-hidden"
            >
              <MobileTabletIndustrialMenu
                currentRoute={currentRoute}
                onNavigate={handleNav}
                onClose={() => setMobileMenuOpen(false)}
                onOpenSearch={onOpenSearch}
                onOpenQrScanner={onOpenQrScanner}
                initialTab={activeSegment as any}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
