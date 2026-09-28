import React, { useState } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles, 
  Phone, 
  FileCheck, 
  Building2, 
  X, 
  CheckCircle2, 
  Search, 
  HardHat, 
  Sun, 
  Moon, 
  Bell, 
  WifiOff, 
  RefreshCw, 
  UserCheck, 
  Shield, 
  Layers, 
  FileText,
  ExternalLink,
  ChevronDown,
  QrCode,
  Mountain
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TMDLogo } from '../common/BrandLogos';
import { OFFICIAL_BRANDS } from '../../data/brandsData';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useOfflineSync } from '../../context/OfflineSyncContext';
import { 
  TAB_CONFIGS, 
  type MegaMenuTabId, 
  type MainTabConfig, 
  type SubCategoryItem 
} from './menuData';

interface MobileTabletIndustrialMenuProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onClose: () => void;
  onOpenSearch?: () => void;
  onOpenQrScanner?: () => void;
  initialTab?: string;
}

export const MobileTabletIndustrialMenu: React.FC<MobileTabletIndustrialMenuProps> = ({
  currentRoute,
  onNavigate,
  onClose,
  onOpenSearch,
  onOpenQrScanner,
  initialTab = 'heavy_machinery'
}) => {
  const { theme, toggleTheme, isCanteraMode, toggleCanteraMode } = useTheme();
  const { currency, setCurrency, totalCartCount, totalQuotesCount } = useCart();
  const { currentUser, userProfile, isAdmin, isStaff, role } = useAuth();
  const { unreadCount, openNotificationPanel } = useNotifications();
  const { effectiveOnline, isSimulatedOffline, syncState, syncProgress, openVaultModal } = useOfflineSync();

  const normalizeTab = (tab: string): MegaMenuTabId => {
    if (tab === 'construction' || tab === 'machinery' || tab === 'heavy_machinery') return 'heavy_machinery';
    if (tab === 'contractors' || tab === 'contractor_deploy' || tab === 'rental') return 'contractor_deploy';
    if (tab === 'government' || tab === 'bids' || tab === 'gov_bids') return 'gov_bids';
    if (tab === 'parts' || tab === 'services' || tab === 'parts_service') return 'parts_service';
    if (tab === 'brands') return 'brands';
    return 'heavy_machinery';
  };

  const [activeTab, setActiveTab] = useState<MegaMenuTabId>(() => normalizeTab(initialTab));
  const [expandedSubcategory, setExpandedSubcategory] = useState<string | null>(null);

  const currentTabConfig: MainTabConfig = TAB_CONFIGS.find(t => t.id === activeTab) || TAB_CONFIGS[0];

  const handleActionNavigate = (route: string) => {
    onClose();
    if (route.startsWith('tel:')) {
      window.location.href = route;
    } else {
      onNavigate(route);
    }
  };

  const handleSubcategoryToggle = (subId: string) => {
    setExpandedSubcategory(prev => (prev === subId ? null : subId));
  };

  const ActiveIcon = currentTabConfig.icon;
  const totalBadges = totalCartCount + totalQuotesCount;

  return (
    <div className="w-full flex flex-col max-h-[86vh] sm:max-h-[82vh] overflow-hidden bg-white/98 dark:bg-[#0c0d10]/98 backdrop-blur-2xl text-zinc-900 dark:text-white">
      {/* 1. TOP MOBILE/TABLET TOOLBAR & SEARCH */}
      <div className="p-3.5 sm:p-4 border-b border-zinc-200/80 dark:border-white/[0.08] space-y-3 bg-zinc-50/70 dark:bg-zinc-900/50">
        {/* Mobile Brand Banner */}
        <div className="flex items-center justify-between pb-1 border-b border-zinc-200 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <TMDLogo variant="icon-only" className="h-6 sm:h-7" />
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 font-display">
              TECNOMAQUINARIAS DIESEL
            </span>
          </div>
          <span className="px-1.5 py-0.5 rounded-[2px] bg-zinc-200 dark:bg-zinc-800 text-[9px] font-mono font-bold text-zinc-600 dark:text-zinc-400">
            OFICIAL RD
          </span>
        </div>

        {/* Search Input Bar Trigger & QR Scanner Button */}
        <div className="flex items-center gap-2">
          {onOpenSearch && (
            <button
              onClick={() => {
                onClose();
                onOpenSearch();
              }}
              className="flex-1 flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300 shadow-xs hover:border-amber-500 transition-colors cursor-pointer min-w-0"
            >
              <span className="flex items-center gap-2.5 truncate">
                <Search className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="truncate">Buscar catálogo o repuestos...</span>
              </span>
              <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 shrink-0">
                ⌘K
              </kbd>
            </button>
          )}

          {onOpenQrScanner && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenQrScanner();
              }}
              className="px-3 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0 transition-colors uppercase"
              title="Escanear Código QR"
            >
              <QrCode className="w-4 h-4" />
              <span className="text-[11px] font-black">Escanear</span>
            </button>
          )}
        </div>

        {/* Horizontal Navigation Segment Tabs (Matches Desktop Navigation) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
          {TAB_CONFIGS.map(tab => {
            const TabIcon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'heavy_machinery') handleActionNavigate('#/machinery-hub');
                  else if (tab.id === 'contractor_deploy') handleActionNavigate('#/rental-hub');
                  else if (tab.id === 'parts_service') handleActionNavigate('#/parts-hub');
                  else if (tab.id === 'gov_bids') handleActionNavigate('#/services-hub');
                  else if (tab.id === 'brands') handleActionNavigate('#/brands-directory');
                  else handleActionNavigate('#/machinery-hub');
                }}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 select-none cursor-pointer ${
                  isCurrent
                    ? 'text-black bg-amber-500 shadow-sm shadow-amber-500/20'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white bg-white dark:bg-zinc-800/80 border border-zinc-200/70 dark:border-zinc-700/60'
                }`}
              >
                <TabIcon className={`w-3.5 h-3.5 ${isCurrent ? 'text-black' : 'text-amber-500'}`} />
                <span>{tab.shortLabel || tab.label}</span>
                {tab.id === 'heavy_machinery' && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-black' : 'bg-amber-500 animate-pulse'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SCROLLABLE TAB CONTENT (TABLET 2-COLUMN & MOBILE ADAPTIVE) */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4">
        {/* Tab Context Banner: 1-Tap Direct Landing Navigation */}
        <button
          type="button"
          onClick={() => {
            if (activeTab === 'heavy_machinery') handleActionNavigate('#/machinery-hub');
            else if (activeTab === 'contractor_deploy') handleActionNavigate('#/rental-hub');
            else if (activeTab === 'parts_service') handleActionNavigate('#/parts-hub');
            else if (activeTab === 'gov_bids') handleActionNavigate('#/services-hub');
            else if (activeTab === 'brands') handleActionNavigate('#/brands-directory');
            else handleActionNavigate('#/machinery-hub');
          }}
          className="w-full flex items-center justify-between bg-zinc-100/70 dark:bg-zinc-900/60 hover:bg-amber-500/10 dark:hover:bg-zinc-800/80 p-3 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 hover:border-amber-500/40 transition-all cursor-pointer group text-left"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ActiveIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-black text-zinc-900 dark:text-white truncate group-hover:text-amber-500 transition-colors">
                {currentTabConfig.label}
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                {currentTabConfig.headline}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black bg-amber-500 text-black shadow-xs shrink-0 group-hover:bg-amber-400">
            <span>Abrir Landing</span>
            <ChevronRight className="w-3 h-3 stroke-[2.5]" />
          </span>
        </button>

        {/* TAB 5: MARCAS OFICIALES (SPECIAL BRAND PAVILION GRID) */}
        {activeTab === 'brands' ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
              {OFFICIAL_BRANDS.map(brand => (
                <button
                  key={brand.id}
                  onClick={() => handleActionNavigate(`#/machinery?brand=${brand.id}`)}
                  className="group text-left p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/60 transition-all cursor-pointer"
                >
                  <div className="aspect-16/10 rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 relative mb-2">
                    {brand.bannerImage ? (
                      <img 
                        src={brand.bannerImage} 
                        alt={brand.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-xs text-zinc-400">
                        {brand.name}
                      </div>
                    )}
                    <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] font-black bg-black/75 text-amber-400">
                      {brand.country}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors truncate">
                      {brand.name}
                    </h4>
                    <ChevronRight className="w-3 h-3 text-zinc-400 group-hover:text-amber-500 shrink-0" />
                  </div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                    {brand.category}
                  </p>
                </button>
              ))}
            </div>

            {/* Direct All Machinery Link */}
            <button
              onClick={() => handleActionNavigate('#/machinery')}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Ver Todo el Catálogo de Maquinarias</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* TABS 1-4: RESPONSIVE 2-COLUMN (TABLET) OR STACKED (MOBILE) */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            {/* Left Subcategories (8 Cols on Tablet) */}
            <div className="md:col-span-7 xl:col-span-8 space-y-3">
              {currentTabConfig.subcategories.map(sub => {
                const SubIcon = sub.icon;
                const feat = sub.featuredProduct;
                const isExpanded = expandedSubcategory === sub.id;

                return (
                  <div
                    key={sub.id}
                    className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/60 overflow-hidden"
                  >
                    {/* Subcategory Header Accordion / Trigger */}
                    <div 
                      onClick={() => handleSubcategoryToggle(sub.id)}
                      className="p-3 sm:p-3.5 flex items-center justify-between cursor-pointer select-none hover:bg-zinc-100/60 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                          <SubIcon className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-xs font-black text-zinc-900 dark:text-white truncate">
                          {sub.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {sub.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                            {sub.badge}
                          </span>
                        )}
                        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-amber-500' : ''}`} />
                      </div>
                    </div>

                    {/* Collapsible / Expandable Details */}
                    {isExpanded ? (
                      <div className="p-3 sm:p-3.5 bg-white dark:bg-zinc-950/80 border-t border-zinc-200/60 dark:border-zinc-800/60 space-y-3">
                        {/* Featured Product Card */}
                        {feat && (
                          <div
                            onClick={() => handleActionNavigate(feat.route)}
                            className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-3 hover:border-amber-500/60 transition-colors cursor-pointer"
                          >
                            <div className="w-16 h-12 rounded-lg bg-zinc-200 dark:bg-zinc-800 overflow-hidden shrink-0 relative">
                              <img 
                                src={feat.image} 
                                alt={feat.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[8px] font-black uppercase px-1 py-0.2 bg-amber-500 text-black rounded">
                                  {feat.brand}
                                </span>
                                <span className="text-xs font-black text-zinc-900 dark:text-white truncate">
                                  {feat.name}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                                {feat.spec}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-amber-500 shrink-0" />
                          </div>
                        )}

                        {/* Quick Links List */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block px-1">
                            Líneas Destacadas:
                          </span>
                          {sub.quickLinks.map((link, lIdx) => (
                            <button
                              key={lIdx}
                              onClick={() => handleActionNavigate(link.route)}
                              className="w-full text-left py-1.5 px-2 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/5 flex items-center justify-between transition-colors cursor-pointer"
                            >
                              <span className="truncate">{link.label}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            </button>
                          ))}
                        </div>

                        {/* Direct Category View Button */}
                        <button
                          onClick={() => handleActionNavigate(sub.linkRoute)}
                          className="w-full py-1.5 px-2.5 rounded-lg text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 flex items-center justify-between cursor-pointer"
                        >
                          <span>Ver catálogo completo de {sub.title}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      /* Preview Quick Actions when Collapsed (Fast 1-tap navigation) */
                      <div className="px-3 pb-2.5 pt-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        {sub.quickLinks.slice(0, 2).map((link, lIdx) => (
                          <button
                            key={lIdx}
                            onClick={() => handleActionNavigate(link.route)}
                            className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-amber-500 bg-white dark:bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60 shrink-0 whitespace-nowrap cursor-pointer"
                          >
                            {link.label.split('(')[0]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Editorial Highlight Banner (5 Cols on Tablet) */}
            <div className="md:col-span-5 xl:col-span-4">
              <div className="rounded-2xl bg-zinc-900 text-white p-4 sm:p-5 border border-zinc-800 relative overflow-hidden shadow-lg space-y-3">
                {currentTabConfig.highlight.bannerImg && (
                  <div 
                    className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none"
                    style={{ backgroundImage: `url(${currentTabConfig.highlight.bannerImg})` }} 
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/85 to-zinc-950/40 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500 text-black">
                      {currentTabConfig.highlight.badge}
                    </span>
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                  </div>

                  <h4 className="text-sm font-black text-white leading-snug">
                    {currentTabConfig.highlight.title}
                  </h4>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed line-clamp-3">
                    {currentTabConfig.highlight.desc}
                  </p>
                </div>

                <div className="relative z-10 pt-2 space-y-2">
                  <button
                    onClick={() => handleActionNavigate(currentTabConfig.highlight.ctaRoute)}
                    className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>{currentTabConfig.highlight.ctaLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {currentTabConfig.highlight.secondaryCta && (
                    <button
                      onClick={() => handleActionNavigate(currentTabConfig.highlight.secondaryCta!.route)}
                      className="w-full py-1.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-zinc-700 cursor-pointer"
                    >
                      <Building2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>{currentTabConfig.highlight.secondaryCta!.label}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. DIRECT CORE PORTAL & HQ ACCESS SHORTCUTS */}
        <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => handleActionNavigate('#/rental')}
            className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-left hover:border-amber-500 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-zinc-900 dark:text-white font-bold text-xs">
              <span>Renta Flota</span>
              <ChevronRight className="w-3 h-3 text-zinc-400" />
            </div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
              Lowboy & Operadores
            </span>
          </button>

          <button
            onClick={() => handleActionNavigate('#/parts')}
            className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-left hover:border-amber-500 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-zinc-900 dark:text-white font-bold text-xs">
              <span>Repuestos OEM</span>
              <ChevronRight className="w-3 h-3 text-zinc-400" />
            </div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
              +35,000 en Stock
            </span>
          </button>

          <button
            onClick={() => handleActionNavigate('#/portal')}
            className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-left hover:border-amber-500 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 font-extrabold text-xs">
              <span>{isAdmin ? 'Portal Admin' : isStaff ? 'Portal Oficina' : 'Portal Clientes'}</span>
              <UserCheck className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
              Flotas, NCF & Estado
            </span>
          </button>

          <button
            onClick={() => handleActionNavigate('#/checkout')}
            className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-left hover:border-amber-500 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-zinc-900 dark:text-white font-bold text-xs">
              <span>Cotizador DGII</span>
              <FileCheck className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
              NCF Formal B15/B01
            </span>
          </button>
        </div>

        {/* 3.1 DIRECT ACCESS TO ALL SECONDARY SERVICES (PARITY WITH DESKTOP SERVICES DROPDOWN) */}
        <div className="pt-2.5 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono flex items-center gap-1.5">
              <Wrench className="w-3 h-3 text-amber-500" />
              Más Servicios & Taller en Obra
            </span>
            <span className="text-[9px] text-zinc-400 font-mono">11 Especialidades</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={() => handleActionNavigate('#/service')}
              className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-left hover:border-amber-500 transition-colors flex items-center justify-between cursor-pointer"
            >
              <div className="min-w-0">
                <span className="text-xs font-bold text-zinc-900 dark:text-white block truncate">Taller Central</span>
                <span className="text-[9px] text-zinc-500 dark:text-zinc-400 block truncate">12 Bahías & Overhaul</span>
              </div>
              <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
            </button>

            <button
              onClick={() => handleActionNavigate('#/emergency-dispatch')}
              className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-left hover:border-rose-500 transition-colors flex items-center justify-between cursor-pointer"
            >
              <div className="min-w-0">
                <span className="text-xs font-bold text-rose-700 dark:text-rose-400 block truncate">SOS 24/7 en Obra</span>
                <span className="text-[9px] text-rose-600/70 dark:text-rose-400/70 block truncate">Taller Móvil 4x4</span>
              </div>
              <ChevronRight className="w-3 h-3 text-rose-400 shrink-0" />
            </button>

            <button
              onClick={() => handleActionNavigate('#/oil-lab')}
              className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-left hover:border-amber-500 transition-colors flex items-center justify-between cursor-pointer"
            >
              <div className="min-w-0">
                <span className="text-xs font-bold text-zinc-900 dark:text-white block truncate">Lab de Aceites</span>
                <span className="text-[9px] text-zinc-500 dark:text-zinc-400 block truncate">Espectrometría S.O.S.</span>
              </div>
              <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
            </button>

            <button
              onClick={() => handleActionNavigate('#/livelink')}
              className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-left hover:border-amber-500 transition-colors flex items-center justify-between cursor-pointer"
            >
              <div className="min-w-0">
                <span className="text-xs font-bold text-zinc-900 dark:text-white block truncate">JCB LiveLink™</span>
                <span className="text-[9px] text-zinc-500 dark:text-zinc-400 block truncate">GPS & Horómetros</span>
              </div>
              <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
            </button>

            <button
              onClick={() => handleActionNavigate('#/trade-in')}
              className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-left hover:border-amber-500 transition-colors flex items-center justify-between cursor-pointer"
            >
              <div className="min-w-0">
                <span className="text-xs font-bold text-zinc-900 dark:text-white block truncate">Trade-In Usados</span>
                <span className="text-[9px] text-zinc-500 dark:text-zinc-400 block truncate">Avalúo en 24h</span>
              </div>
              <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
            </button>

            <button
              onClick={() => handleActionNavigate('#/about')}
              className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-left hover:border-amber-500 transition-colors flex items-center justify-between cursor-pointer"
            >
              <div className="min-w-0">
                <span className="text-xs font-bold text-zinc-900 dark:text-white block truncate">Sobre TMD</span>
                <span className="text-[9px] text-zinc-500 dark:text-zinc-400 block truncate">Directiva & Historia</span>
              </div>
              <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
            </button>
          </div>

          {/* Specialist Tools Horizontal Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => handleActionNavigate('#/tco')}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700 shrink-0 whitespace-nowrap cursor-pointer hover:border-amber-500 transition-colors"
            >
              📊 Calculadora TCO
            </button>
            <button
              onClick={() => handleActionNavigate('#/pma-contracts')}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700 shrink-0 whitespace-nowrap cursor-pointer hover:border-amber-500 transition-colors"
            >
              🛡️ Contratos PMA
            </button>
            <button
              onClick={() => handleActionNavigate('#/academy')}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700 shrink-0 whitespace-nowrap cursor-pointer hover:border-amber-500 transition-colors"
            >
              🎓 Academia Operadores
            </button>
            <button
              onClick={() => handleActionNavigate('#/reman')}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700 shrink-0 whitespace-nowrap cursor-pointer hover:border-amber-500 transition-colors"
            >
              ♻️ Centro REMAN
            </button>
          </div>
        </div>
      </div>

      {/* 4. EXECUTIVE BOTTOM CONTROL BAR (CURRENCY, THEME, NOTIFICATIONS, EMERGENCY, PWA) */}
      <div className="p-3 sm:p-4 pb-20 sm:pb-4 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/90 dark:bg-zinc-950 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        {/* Emergencias 24/7 Hotline Button & Bio Link */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="tel:18095601234"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-black font-extrabold text-xs shadow-xs"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Emergencias 24/7: +1 (809) 560-1234</span>
          </a>
          <button
            onClick={() => handleActionNavigate('#/bio')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 text-amber-400 font-extrabold text-xs border border-zinc-700 hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Bio-Link & Redes</span>
          </button>
        </div>

        {/* System Utilities */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Currency Switcher */}
          <div className="flex items-center gap-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => setCurrency('USD')}
              className={`px-2 py-1 rounded text-[10px] font-black transition-colors cursor-pointer ${
                currency === 'USD' ? 'bg-amber-500 text-black' : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              USD
            </button>
            <button
              onClick={() => setCurrency('DOP')}
              className={`px-2 py-1 rounded text-[10px] font-black transition-colors cursor-pointer ${
                currency === 'DOP' ? 'bg-amber-500 text-black' : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              RD$
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Alternar tema"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-800" />}
          </button>

          {/* Cantera Solar Mode (Task #11) */}
          <button
            onClick={toggleCanteraMode}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isCanteraMode 
                ? 'bg-amber-400 text-black shadow-[0_0_8px_rgba(251,191,36,0.6)] font-bold' 
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-white'
            }`}
            title={isCanteraMode ? 'Desactivar Modo Cantera Solar' : 'Activar Modo Cantera (Alto Contraste Solar)'}
          >
            <Mountain className={`w-4 h-4 ${isCanteraMode ? 'text-black' : 'text-amber-500'}`} />
          </button>

          {/* Notifications */}
          <button
            onClick={() => {
              onClose();
              openNotificationPanel();
            }}
            className="relative p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
            title="Notificaciones"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>

          {/* Offline PWA Vault */}
          <button
            onClick={() => {
              onClose();
              openVaultModal();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold cursor-pointer"
            title="Bóveda Offline PWA"
          >
            <HardHat className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">PWA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
