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
import { ServicesDropdown } from './header/ServicesDropdown';
import { TMDLogo } from './common/BrandLogos';
import { NetworkPingBadge } from './common/NetworkPingBadge';
import { BcrdCurrencyRatesModal } from './finance/BcrdCurrencyRatesModal';

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
  const { theme, toggleTheme, isCanteraMode, toggleCanteraMode } = useTheme();
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
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [isMenuPinned, setIsMenuPinned] = useState(false);
  const [activeSegment, setActiveSegment] = useState<IndustrialSegmentKey>('construction');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState<IndustrialSegmentKey | null>('construction');
  const [isBcrdModalOpen, setIsBcrdModalOpen] = useState<boolean>(false);

  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const servicesDropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
        if (servicesDropdownTimeoutRef.current) {
          clearTimeout(servicesDropdownTimeoutRef.current);
          servicesDropdownTimeoutRef.current = null;
        }
        setIsMenuPinned(false);
        setMegaMenuOpen(false);
        setServicesDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
          closeTimeoutRef.current = null;
        }
        if (servicesDropdownTimeoutRef.current) {
          clearTimeout(servicesDropdownTimeoutRef.current);
          servicesDropdownTimeoutRef.current = null;
        }
        setIsMenuPinned(false);
        setMegaMenuOpen(false);
        setServicesDropdownOpen(false);
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
    handleCloseServicesDropdownImmediately();
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

  // Services Dropdown Handlers
  const handleOpenServicesDropdown = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (servicesDropdownTimeoutRef.current) {
      clearTimeout(servicesDropdownTimeoutRef.current);
      servicesDropdownTimeoutRef.current = null;
    }
    setMegaMenuOpen(false);
    setServicesDropdownOpen(true);
  };

  const handleScheduleServicesDropdownClose = () => {
    if (servicesDropdownTimeoutRef.current) {
      clearTimeout(servicesDropdownTimeoutRef.current);
    }
    servicesDropdownTimeoutRef.current = setTimeout(() => {
      setServicesDropdownOpen(false);
    }, 250);
  };

  const handleCancelServicesDropdownClose = () => {
    if (servicesDropdownTimeoutRef.current) {
      clearTimeout(servicesDropdownTimeoutRef.current);
      servicesDropdownTimeoutRef.current = null;
    }
  };

  const handleCloseServicesDropdownImmediately = () => {
    if (servicesDropdownTimeoutRef.current) {
      clearTimeout(servicesDropdownTimeoutRef.current);
      servicesDropdownTimeoutRef.current = null;
    }
    setServicesDropdownOpen(false);
  };

  const handleNav = (route: string) => {
    handleForceCloseMegaMenu();
    handleCloseServicesDropdownImmediately();
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
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950 text-slate-900 dark:text-white shadow-xs dark:shadow-md">
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
            <span className="text-slate-300 dark:text-zinc-700">/</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-black">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ADMIN HQ</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400 pl-2 border-l border-slate-200 dark:border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Supabase Cloud · Vercel Edge</span>
            </div>
          </div>

          {/* Admin Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Showroom Exit */}
            <button
              onClick={() => handleNav('#/home')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white border border-slate-300 dark:border-zinc-800 text-xs font-bold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Ver Showroom</span>
            </button>

            {/* Currency selector for admin valuations */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 rounded-lg p-0.5 border border-slate-300 dark:border-zinc-800">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${currency === 'USD' ? 'bg-amber-500 text-black' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                USD
              </button>
              <button
                onClick={() => setCurrency('DOP')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${currency === 'DOP' ? 'bg-amber-500 text-black' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                DOP
              </button>
            </div>

            {/* Notifications */}
            <button
              onClick={openNotificationPanel}
              className="relative p-2 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
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
              aria-label="Alternar tema claro/oscuro"
              className="p-2 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* User Session Info */}
            {currentUser && (
              <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-zinc-800 text-xs">
                <div className="text-right">
                  <div className="font-bold text-slate-900 dark:text-white leading-none">
                    {userProfile?.displayName || currentUser.email?.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-semibold mt-0.5">
                    {role || 'Admin'}
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-zinc-900 transition-colors"
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
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-zinc-950/80 backdrop-blur-md text-slate-800 dark:text-white shadow-xs dark:shadow-md">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 max-w-[1780px] mx-auto h-15 flex items-center justify-between gap-4 bg-transparent">
          <div className="flex items-center gap-3">
            <button onClick={() => handleNav('#/home')} className="flex items-center gap-2 cursor-pointer group" title="Ir al Showroom Principal">
              <TMDLogo variant="responsive" className="h-8 sm:h-9 group-hover:scale-105 transition-transform" />
              <div className="hidden sm:block pl-3 border-l border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                    {isAdmin ? 'PORTAL ADMINISTRATIVO' : isStaff ? 'PORTAL DE OFICINA & STAFF' : 'PORTAL DE CLIENTES'}
                  </span>
                  <span className="text-amber-500 font-bold text-xs">RD</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400">
                  {isAdmin || isStaff ? 'Cotizaciones DGII, Despacho Km 22 y Clientes' : 'Flota, Facturación NCF y Servicios'}
                </span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Catalog Access */}
            <button
              onClick={() => handleNav('#/machinery')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900/70 dark:hover:bg-zinc-800 text-slate-700 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white border border-slate-200 dark:border-white/10 text-xs font-bold transition-all cursor-pointer backdrop-blur-sm"
            >
              <HardHat className="w-3.5 h-3.5 text-amber-500" />
              <span>Ver Catálogo Maquinaria</span>
            </button>

            {/* Offline PWA Vault */}
            <button
              onClick={openVaultModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer backdrop-blur-sm ${
                !effectiveOnline || isSimulatedOffline
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40'
                  : syncState === 'syncing'
                  ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30'
                  : 'bg-slate-100 dark:bg-zinc-900/70 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-white/10 hover:border-amber-500'
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
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900/70 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
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
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900/70 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Alternar tema claro/oscuro"
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900/70 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Admin HQ shortcut if user is admin */}
            {isAdmin && (
              <button
                onClick={() => handleNav('#/admin-dashboard')}
                className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 text-amber-600 dark:text-amber-400 border border-slate-300 dark:border-zinc-700 text-xs font-black cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
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
          ? 'bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border-b border-slate-200/60 dark:border-white/[0.08] shadow-lg shadow-black/5 dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]' 
          : 'bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/[0.06] shadow-xs'
      }`}
      onMouseLeave={() => {
        handleScheduleMegaMenuClose();
        handleScheduleServicesDropdownClose();
      }}
    >
      {/* Streamlined Top Micro-Bar — 3 Clean Zones */}
      <div 
        onMouseEnter={() => {
          handleCloseMegaMenuImmediately();
          handleCloseServicesDropdownImmediately();
        }}
        className="bg-slate-100/80 dark:bg-zinc-950/75 backdrop-blur-md text-slate-600 dark:text-zinc-400 text-[11px] py-1.5 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-slate-200/50 dark:border-white/[0.05] hidden sm:flex items-center justify-between gap-3"
      >
        {/* Zone 1: Distributor Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1.5 text-slate-800 dark:text-zinc-200 font-bold uppercase tracking-wider text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
            <span className="text-amber-600 dark:text-brand-gold">DISTRIBUIDOR OFICIAL</span> REPÚBLICA DOMINICANA
          </span>
          <span className="text-slate-300 dark:text-zinc-700 hidden xl:inline">·</span>
          <span className="hidden xl:inline text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 tracking-wider">
            PATIO KM 22, AUTOPISTA DUARTE
          </span>
        </div>

        {/* Zone 2: Omnibox Search Bar */}
        {onOpenSearch && (
          <div className="hidden lg:flex items-center flex-1 max-w-xs xl:max-w-md mx-3">
            <button
              onClick={onOpenSearch}
              aria-label="Buscar en catálogo, repuestos y fichas"
              className="w-full flex items-center justify-between px-3 py-1 rounded-[4px] bg-white dark:bg-[#0c0c10] border border-slate-200 dark:border-white/[0.08] hover:border-amber-400 dark:hover:border-brand-gold-dark/50 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-2xs group"
              title="Buscar catálogo, repuestos o fichas técnicas (⌘K o Ctrl+K)"
            >
              <span className="flex items-center gap-2 text-[11px] font-medium">
                <Search className="w-3.5 h-3.5 text-amber-500 dark:text-brand-gold group-hover:scale-110 transition-transform" />
                <span className="truncate">Buscar maquinaria, repuestos o fichas...</span>
              </span>
              <kbd className="inline-flex items-center px-1.5 py-0.5 rounded-[2px] text-[9px] font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 shrink-0">
                ⌘K
              </kbd>
            </button>
          </div>
        )}

        {/* Zone 3: Compact Utilities */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Hotline */}
          <a
            href="tel:18095601234"
            className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-brand-gold transition-colors font-medium text-[10px] uppercase tracking-wider"
          >
            <Phone className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
            <strong className="text-slate-900 dark:text-white font-mono font-bold">(809) 560-1234</strong>
          </a>

          <div className="h-3 w-px bg-slate-200 dark:bg-white/[0.08]" />

          {/* Currency Switcher + Rate */}
          <div className="flex items-center gap-1.5 font-mono">
            <div className="flex items-center gap-0.5 bg-white dark:bg-zinc-950 rounded-[3px] p-0.5 border border-slate-200 dark:border-white/[0.08]">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-1.5 py-0.5 rounded-[2px] text-[10px] font-black uppercase transition-colors cursor-pointer ${
                  currency === 'USD' 
                    ? 'bg-amber-100 dark:bg-[#1c1c24] text-amber-700 dark:text-brand-gold border border-amber-300 dark:border-brand-gold-dark/50 shadow-xs' 
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                USD
              </button>
              <button
                onClick={() => setCurrency('DOP')}
                className={`px-1.5 py-0.5 rounded-[2px] text-[10px] font-black uppercase transition-colors cursor-pointer ${
                  currency === 'DOP' 
                    ? 'bg-amber-100 dark:bg-[#1c1c24] text-amber-700 dark:text-brand-gold border border-amber-300 dark:border-brand-gold-dark/50 shadow-xs' 
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                RD$
              </button>
            </div>

            <button
              onClick={() => setIsBcrdModalOpen(true)}
              title={`Tasa Oficial Banco Central (BCRD): 1 USD = RD$ ${exchangeRate.toFixed(2)} (${exchangeRateData.source}). Clic para ver tasas y banca múltiple.`}
              className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-300 dark:border-white/[0.08] hover:border-amber-400 text-[10px] text-slate-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 transition-all cursor-pointer font-mono active:scale-[0.98]"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${exchangeRateData.isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-bold">RD$ {exchangeRate.toFixed(2)}</span>
            </button>
          </div>

          <div className="h-3 w-px bg-slate-200 dark:bg-white/[0.08]" />

          {/* Theme Toggle (Compact) */}
          <button
            onClick={toggleTheme}
            aria-label="Alternar tema claro/oscuro"
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#14141c] transition-colors cursor-pointer border border-slate-200 dark:border-white/[0.08] text-[10px] font-black uppercase"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-brand-gold" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
          </button>

          {/* Cantera Solar Mode */}
          <button
            onClick={toggleCanteraMode}
            aria-label="Alternar modo cantera de alto contraste solar"
            title={isCanteraMode ? 'Desactivar modo cantera solar' : 'Activar modo cantera solar'}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] text-[10px] font-black uppercase transition-all cursor-pointer border ${
              isCanteraMode
                ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 border-slate-200 dark:border-white/[0.08] hover:bg-slate-200/60 dark:hover:bg-[#14141c]'
            }`}
          >
            <Mountain className={`w-3 h-3 ${isCanteraMode ? 'text-black' : 'text-amber-500 dark:text-amber-400'}`} />
          </button>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="w-full px-3.5 sm:px-6 lg:px-10 xl:px-12 max-w-[1780px] mx-auto h-15 sm:h-16 flex items-center justify-between gap-3 sm:gap-4 transition-all">
        {/* Brand Logo */}
        <button
          onClick={() => handleNav('#/home')}
          onMouseEnter={() => {
            handleCloseMegaMenuImmediately();
            handleCloseServicesDropdownImmediately();
          }}
          className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer shrink-0"
        >
          <TMDLogo variant="responsive" className="h-8 sm:h-10 group-hover:scale-103 transition-transform" />
        </button>

        {/* Primary Desktop Navigation Links: Streamlined 6-Corridor Architecture */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 font-display">
          {/* 1. INICIO */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => handleNav('#/home')}
            onMouseEnter={() => {
              handleCloseMegaMenuImmediately();
              handleCloseServicesDropdownImmediately();
            }}
            className={`px-3 py-1.5 rounded-[5px] text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
              currentRoute === '#/home' && !megaMenuOpen && !servicesDropdownOpen
                ? 'text-slate-900 dark:text-white bg-slate-200 dark:bg-zinc-800/90 border border-slate-300 dark:border-zinc-700 shadow-xs'
                : 'text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            INICIO
          </motion.button>

          {/* 2. MAQUINARIA ▾ */}
          <motion.button
            whileHover={{ y: -1, transition: { type: 'spring', stiffness: 500, damping: 25 } }}
            whileTap={{ scale: 0.97 }}
            onMouseEnter={() => handleOpenMegaMenu('heavy_machinery')}
            onClick={() => {
              handleCloseMegaMenuImmediately();
              handleCloseServicesDropdownImmediately();
              handleNav('#/machinery');
            }}
            aria-expanded={megaMenuOpen && (activeSegment === 'heavy_machinery' || activeSegment === 'construction')}
            className={`flex items-center gap-1 px-2.5 xl:px-3 py-1.5 rounded-[5px] text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
              currentRoute === '#/machinery' || currentRoute === '#/machinery-hub'
                ? 'text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-zinc-900 border border-amber-300 dark:border-amber-500/50 shadow-inner'
                : 'text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            <span>MAQUINARIA</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${
              megaMenuOpen && (activeSegment === 'heavy_machinery' || activeSegment === 'construction') ? 'rotate-180 text-amber-500 dark:text-amber-400' : 'text-slate-400 dark:text-zinc-400'
            }`} />
          </motion.button>

          {/* 3. RENTA ▾ */}
          <motion.button
            whileHover={{ y: -1, transition: { type: 'spring', stiffness: 500, damping: 25 } }}
            whileTap={{ scale: 0.97 }}
            onMouseEnter={() => handleOpenMegaMenu('contractor_deploy')}
            onClick={() => {
              handleCloseMegaMenuImmediately();
              handleCloseServicesDropdownImmediately();
              handleNav('#/rental');
            }}
            aria-expanded={megaMenuOpen && (activeSegment === 'contractor_deploy' || activeSegment === 'contractors')}
            className={`flex items-center gap-1 px-2.5 xl:px-3 py-1.5 rounded-[5px] text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
              currentRoute === '#/rental' || currentRoute === '#/rental-hub'
                ? 'text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-zinc-900 border border-amber-300 dark:border-amber-500/50 shadow-inner'
                : 'text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            <span>RENTA</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${
              megaMenuOpen && (activeSegment === 'contractor_deploy' || activeSegment === 'contractors') ? 'rotate-180 text-amber-500 dark:text-amber-400' : 'text-slate-400 dark:text-zinc-400'
            }`} />
          </motion.button>

          {/* 4. REPUESTOS ▾ */}
          <motion.button
            whileHover={{ y: -1, transition: { type: 'spring', stiffness: 500, damping: 25 } }}
            whileTap={{ scale: 0.97 }}
            onMouseEnter={() => handleOpenMegaMenu('parts')}
            onClick={() => {
              handleCloseMegaMenuImmediately();
              handleCloseServicesDropdownImmediately();
              handleNav('#/parts');
            }}
            aria-expanded={megaMenuOpen && (activeSegment === 'parts' || activeSegment === 'parts_service')}
            className={`flex items-center gap-1 px-2.5 xl:px-3 py-1.5 rounded-[5px] text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
              currentRoute === '#/parts' || currentRoute === '#/parts-hub'
                ? 'text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-zinc-900 border border-amber-300 dark:border-amber-500/50 shadow-inner'
                : 'text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            <span>REPUESTOS</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${
              megaMenuOpen && (activeSegment === 'parts' || activeSegment === 'parts_service') ? 'rotate-180 text-amber-500 dark:text-amber-400' : 'text-slate-400 dark:text-zinc-400'
            }`} />
          </motion.button>

          {/* 5. SERVICIOS ▾ */}
          <div className="relative">
            <motion.button
              whileHover={{ y: -1, transition: { type: 'spring', stiffness: 500, damping: 25 } }}
              whileTap={{ scale: 0.97 }}
              onMouseEnter={handleOpenServicesDropdown}
              onClick={() => {
                handleCloseMegaMenuImmediately();
                handleCloseServicesDropdownImmediately();
                handleNav('#/service');
              }}
              aria-expanded={servicesDropdownOpen}
              className={`flex items-center gap-1 px-2.5 xl:px-3 py-1.5 rounded-[5px] text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
                servicesDropdownOpen || currentRoute === '#/service' || currentRoute === '#/services-hub' || ['#/tech-docs', '#/about', '#/trade-in', '#/emergency-dispatch', '#/oil-lab', '#/livelink'].includes(currentRoute)
                  ? 'text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-zinc-900 border border-amber-300 dark:border-amber-500/50 shadow-inner'
                  : 'text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60'
              }`}
            >
              <span>SERVICIOS</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${
                servicesDropdownOpen ? 'rotate-180 text-amber-500 dark:text-amber-400' : 'text-slate-400 dark:text-zinc-400'
              }`} />
            </motion.button>

            <ServicesDropdown
              isOpen={servicesDropdownOpen}
              onClose={handleCloseServicesDropdownImmediately}
              onNavigate={handleNav}
              onMouseEnter={handleCancelServicesDropdownClose}
              onMouseLeave={handleScheduleServicesDropdownClose}
            />
          </div>

          {/* 6. PORTAL */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              handleCloseMegaMenuImmediately();
              handleCloseServicesDropdownImmediately();
              handleNav('#/portal');
            }}
            onMouseEnter={() => {
              handleCloseMegaMenuImmediately();
              handleCloseServicesDropdownImmediately();
            }}
            className={`flex items-center gap-1 px-2.5 xl:px-3 py-1.5 rounded-[5px] text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
              currentRoute === '#/portal'
                ? 'text-slate-900 dark:text-white bg-slate-200 dark:bg-zinc-800/90 border border-slate-300 dark:border-zinc-700'
                : 'text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            <span>{isAdmin ? 'ADMIN' : isStaff ? 'OFICINA' : 'MI PORTAL'}</span>
            {(isAdmin || isStaff) && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-100 text-amber-800 dark:bg-zinc-700 dark:text-amber-400 border border-amber-300 dark:border-zinc-600">
                Staff
              </span>
            )}
          </motion.button>
        </nav>

        {/* Right Action Icons & Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Notifications Bell (Moved from micro-bar for better visibility) */}
          <button
            onClick={openNotificationPanel}
            onMouseEnter={() => {
              handleCloseMegaMenuImmediately();
              handleCloseServicesDropdownImmediately();
            }}
            aria-label="Ver notificaciones"
            title="Notificaciones"
            className="relative p-2 rounded-lg bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-brand-gold transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white dark:border-[#09090f] animate-pulse" />
            )}
          </button>

          {/* Quick Omnibox Search Button on Mobile & Tablets (Shown when top bar search is hidden on < lg) */}
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              onMouseEnter={() => {
                handleCloseMegaMenuImmediately();
                handleCloseServicesDropdownImmediately();
              }}
              aria-label="Buscar en catálogo"
              className="lg:hidden p-2 rounded-lg bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-brand-gold transition-colors cursor-pointer"
              title="Buscar (⌘K)"
            >
              <Search className="w-4 h-4 text-amber-500 dark:text-brand-gold" />
            </button>
          )}

          {/* Quick QR Code Scanner Button */}
          {onOpenQrScanner && (
            <button
              onClick={onOpenQrScanner}
              onMouseEnter={() => {
                handleCloseMegaMenuImmediately();
                handleCloseServicesDropdownImmediately();
              }}
              aria-label="Escanear código QR de maquinaria o repuesto"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-brand-gold hover:border-amber-400 dark:hover:border-brand-gold-dark/50 transition-colors cursor-pointer group"
              title="Escanear Código QR Industrial (Ctrl+Shift+Q)"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-600 dark:text-brand-gold group-hover:scale-110 transition-transform" />
              <span className="hidden xl:inline text-xs font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-white">QR SCAN</span>
            </button>
          )}

          {/* Cart / Cotización Button */}
          <button
            onClick={() => handleNav('#/checkout')}
            onMouseEnter={() => {
              handleCloseMegaMenuImmediately();
              handleCloseServicesDropdownImmediately();
            }}
            aria-label="Ver cotización y carrito"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-black uppercase tracking-wider text-xs transition-all cursor-pointer border ${
              totalBadges > 0
                ? 'bg-amber-400 hover:bg-amber-500 text-black border-amber-500 shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-950 dark:hover:bg-[#14141c] text-slate-800 dark:text-zinc-200 border-slate-200 dark:border-white/[0.08]'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5 text-inherit" />
            <span className="hidden sm:inline">
              {totalQuotesCount > 0 && totalCartCount === 0 ? 'COTIZACIÓN' : 'CARRITO'}
            </span>
            {totalBadges > 0 && (
              <span className="w-4 h-4 rounded-[2px] bg-black text-amber-400 text-[10px] font-black flex items-center justify-center">
                {totalBadges}
              </span>
            )}
          </button>

          {/* Admin HQ Button (Conditional for admin) */}
          {isAdmin && (
            <button
              onClick={() => handleNav('#/admin-dashboard')}
              onMouseEnter={() => {
                handleCloseMegaMenuImmediately();
                handleCloseServicesDropdownImmediately();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all border border-slate-200 dark:border-white/[0.08] bg-slate-100 dark:bg-zinc-950 hover:bg-slate-200 dark:hover:bg-[#14141c] text-amber-700 dark:text-brand-gold cursor-pointer"
              title="Panel Administrativo"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span className="hidden md:inline">ADMIN HQ</span>
            </button>
          )}

          {/* Staff Ops Button (Conditional for staff only) */}
          {isStaff && !isAdmin && (
            <button
              onClick={() => handleNav('#/portal')}
              onMouseEnter={() => {
                handleCloseMegaMenuImmediately();
                handleCloseServicesDropdownImmediately();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-800 dark:text-amber-400 cursor-pointer"
              title="Consola de Oficina & Ventas"
            >
              <HardHat className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden md:inline">STAFF OPS</span>
            </button>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menú"
            className="lg:hidden p-2 rounded-lg text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-white/[0.08] hover:bg-slate-200 dark:hover:bg-[#14141c] transition-colors cursor-pointer"
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

      {/* Task #51: Official BCRD Currency Rates & Bank Spread Simulator Modal */}
      <BcrdCurrencyRatesModal
        isOpen={isBcrdModalOpen}
        onClose={() => setIsBcrdModalOpen(false)}
      />
    </header>
  );
};
