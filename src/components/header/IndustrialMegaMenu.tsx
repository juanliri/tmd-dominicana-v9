import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  ChevronRight, 
  Sparkles, 
  X,
  Pin,
  PinOff,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { OFFICIAL_BRANDS } from '../../data/brandsData';
import { 
  TAB_CONFIGS, 
  type MegaMenuTabId, 
  type IndustrialSegmentKey, 
  type ProductItem, 
  type QuickLinkItem, 
  type SubCategoryItem, 
  type MainTabConfig 
} from './menuData';

export type { 
  MegaMenuTabId, 
  IndustrialSegmentKey, 
  ProductItem, 
  QuickLinkItem, 
  SubCategoryItem, 
  MainTabConfig 
};
export { TAB_CONFIGS };

export interface IndustrialMegaMenuProps {
  initialSegment?: string;
  activeSegment?: string;
  onSelectSegment?: (segment: string) => void;
  onNavigate: (route: string) => void;
  onClose: () => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
}

// Spring animation variants for relaxed, fluid transitions
const tabContentVariants: Variants = {
  initial: { opacity: 0, y: 6, scale: 0.995 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 32,
      mass: 0.8
    }
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.995,
    transition: {
      duration: 0.14,
      ease: 'easeOut'
    }
  }
};

export const IndustrialMegaMenu: React.FC<IndustrialMegaMenuProps> = ({
  initialSegment,
  activeSegment,
  onSelectSegment,
  onNavigate,
  onClose,
  isPinned,
  onTogglePin
}) => {
  const getInitialTab = (): MegaMenuTabId => {
    if (activeSegment === 'contractor_deploy' || activeSegment === 'contractors' || activeSegment === 'rental') return 'contractor_deploy';
    if (activeSegment === 'gov_bids' || activeSegment === 'government' || activeSegment === 'bids' || activeSegment === 'architects') return 'gov_bids';
    if (activeSegment === 'parts' || activeSegment === 'services' || activeSegment === 'parts_service') return 'parts_service';
    if (activeSegment === 'brands') return 'brands';
    return 'heavy_machinery';
  };

  const [activeTab, setActiveTab] = useState<MegaMenuTabId>(getInitialTab());
  const tabHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize activeTab when activeSegment prop changes from parent Header
  useEffect(() => {
    if (!activeSegment) return;
    if (['contractor_deploy', 'contractors', 'rental'].includes(activeSegment)) {
      setActiveTab('contractor_deploy');
    } else if (['gov_bids', 'government', 'bids', 'architects'].includes(activeSegment)) {
      setActiveTab('gov_bids');
    } else if (['parts', 'services', 'parts_service'].includes(activeSegment)) {
      setActiveTab('parts_service');
    } else if (activeSegment === 'brands') {
      setActiveTab('brands');
    } else {
      setActiveTab('heavy_machinery');
    }
  }, [activeSegment]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (tabHoverTimeoutRef.current) clearTimeout(tabHoverTimeoutRef.current);
    };
  }, []);

  // Relaxed hover transition with comfortable 140ms debounce
  const handleTabMouseEnter = (tabId: MegaMenuTabId) => {
    if (tabHoverTimeoutRef.current) clearTimeout(tabHoverTimeoutRef.current);
    tabHoverTimeoutRef.current = setTimeout(() => {
      setActiveTab(tabId);
      if (onSelectSegment) onSelectSegment(tabId);
    }, 140);
  };

  const handleTabClick = (tabId: MegaMenuTabId) => {
    if (tabHoverTimeoutRef.current) clearTimeout(tabHoverTimeoutRef.current);
    if (tabId === 'heavy_machinery') handleActionNavigate('#/machinery-hub');
    else if (tabId === 'contractor_deploy') handleActionNavigate('#/rental-hub');
    else if (tabId === 'parts_service') handleActionNavigate('#/parts-hub');
    else if (tabId === 'gov_bids') handleActionNavigate('#/services-hub');
    else if (tabId === 'brands') handleActionNavigate('#/brands-directory');
    else handleActionNavigate('#/machinery-hub');
  };

  const currentTabConfig = TAB_CONFIGS.find(t => t.id === activeTab) || TAB_CONFIGS[0];

  const handleActionNavigate = (route: string) => {
    onClose();
    if (route.startsWith('tel:')) {
      window.location.href = route;
    } else {
      onNavigate(route);
    }
  };

  const ActiveTabIcon = currentTabConfig.icon;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 font-display">
      {/* 1. TOP HEADER & NAVIGATION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-3 mb-3 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 dark:bg-zinc-900 text-amber-600 dark:text-[#e0a22a] flex items-center justify-center shrink-0 border border-amber-500/20 dark:border-white/[0.08]">
            <ActiveTabIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider truncate">
                {currentTabConfig.label}
              </h3>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[9px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                PATIO KM 22
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate font-sans">
              {currentTabConfig.headline}
            </p>
          </div>
        </div>

        {/* Clean Right Actions */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
          <button
            onClick={() => {
              if (activeTab === 'heavy_machinery') handleActionNavigate('#/machinery-hub');
              else if (activeTab === 'contractor_deploy') handleActionNavigate('#/rental-hub');
              else if (activeTab === 'parts_service') handleActionNavigate('#/parts-hub');
              else if (activeTab === 'gov_bids') handleActionNavigate('#/services-hub');
              else if (activeTab === 'brands') handleActionNavigate('#/brands-directory');
              else handleActionNavigate('#/machinery-hub');
            }}
            className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-[#e0a22a] hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Ver Hub de {currentTabConfig.shortLabel || currentTabConfig.label}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {onTogglePin && (
            <button
              onClick={onTogglePin}
              title={isPinned ? 'Desfijar menú (cierre automático)' : 'Fijar menú para navegación continua'}
              className={`flex items-center gap-1 px-2 py-1 rounded-[3px] text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer border ${
                isPinned
                  ? 'bg-amber-100 dark:bg-[#181824] text-amber-700 dark:text-[#e0a22a] border-amber-300 dark:border-[#e0a22a]/50'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              {isPinned ? <PinOff className="w-3 h-3 text-amber-600 dark:text-[#e0a22a]" /> : <Pin className="w-3 h-3" />}
              <span className="hidden xl:inline">{isPinned ? 'FIJADO' : 'FIJAR'}</span>
            </button>
          )}

          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="p-1 rounded-[3px] text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-zinc-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. INDUSTRIAL CORRIDOR TABS (Seamless 1-hover/1-click switching across all 5 corridors) */}
      <div className="flex items-center gap-1 pb-3 mb-3 border-b border-slate-200/80 dark:border-white/[0.06] overflow-x-auto no-scrollbar">
        {TAB_CONFIGS.map((tab) => {
          const TabIcon = tab.icon;
          const isCurrent = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              onMouseEnter={() => handleTabMouseEnter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                isCurrent
                  ? 'bg-amber-400 text-black shadow-xs font-bold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/80 border border-transparent hover:border-slate-200 dark:hover:border-zinc-700'
              }`}
            >
              <TabIcon className={`w-3.5 h-3.5 ${isCurrent ? 'text-black' : 'text-amber-600 dark:text-[#e0a22a]'}`} />
              <span>{tab.shortLabel || tab.label}</span>
              {tab.id === 'heavy_machinery' && (
                <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-black' : 'bg-emerald-500 animate-pulse'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. REFINED CONTENT: CLEAN CATEGORIES + 1 EDITORIAL SPOTLIGHT */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTab}
          variants={tabContentVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {activeTab === 'brands' ? (
            /* BRAND SHOWCASE */
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-[#e0a22a]" />
                  Marcas Oficiales Homologadas en República Dominicana
                </span>
                <button
                  onClick={() => handleActionNavigate('#/machinery')}
                  className="text-xs font-bold text-amber-600 dark:text-[#e0a22a] hover:underline cursor-pointer"
                >
                  Ver Toda la Flota 2026 →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {OFFICIAL_BRANDS.map(brand => (
                  <button
                    key={brand.id}
                    onClick={() => handleActionNavigate(`#/machinery?brand=${brand.id}`)}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200/90 dark:border-white/[0.08] hover:border-amber-400 dark:hover:border-amber-500/60 hover:bg-slate-100/90 dark:hover:bg-zinc-850 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-[#e0a22a] transition-colors truncate">
                        {brand.name}
                      </span>
                      <span className="text-[8px] font-mono font-bold text-slate-500 dark:text-zinc-400 bg-slate-200/80 dark:bg-zinc-950 px-1 py-0.5 rounded-[2px] border border-slate-300/60 dark:border-white/[0.06]">
                        {brand.country}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 line-clamp-1 font-sans">
                      {brand.category}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* 3 COLUMN PHOTO-RICH CATEGORY DIRECTORY + 1 EDITORIAL SPOTLIGHT */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* Left 3 Photo-Card Category Columns (8-9 cols) */}
              <div className="lg:col-span-8 xl:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {currentTabConfig.subcategories.map(sub => {
                  const SubIcon = sub.icon;
                  return (
                    <div 
                      key={sub.id}
                      className="rounded-xl bg-slate-50 dark:bg-zinc-900/70 border border-slate-200/80 dark:border-white/[0.06] hover:border-amber-400/60 dark:hover:border-white/[0.14] flex flex-col justify-between transition-all group/card overflow-hidden"
                    >
                      {/* Featured Product Photo */}
                      <button
                        onClick={() => handleActionNavigate(sub.featuredProduct.route)}
                        className="relative w-full h-28 xl:h-32 overflow-hidden bg-slate-100 dark:bg-zinc-800/50 cursor-pointer block"
                      >
                        <img
                          src={sub.featuredProduct.image}
                          alt={sub.featuredProduct.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        {/* Product Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded-[2px] text-[8px] font-black uppercase bg-amber-400/90 text-black backdrop-blur-sm">
                              {sub.featuredProduct.brand}
                            </span>
                          </div>
                          <p className="text-[11px] font-bold text-white leading-tight mt-1 line-clamp-1 drop-shadow-md">
                            {sub.featuredProduct.name}
                          </p>
                        </div>
                      </button>

                      <div className="p-3">
                        {/* Subcategory Title */}
                        <div className="flex items-center justify-between gap-1.5 pb-2 mb-2 border-b border-slate-200/80 dark:border-white/[0.06]">
                          <div className="flex items-center gap-2 min-w-0">
                            <SubIcon className="w-3.5 h-3.5 text-amber-600 dark:text-[#e0a22a] shrink-0" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white truncate">
                              {sub.title}
                            </h4>
                          </div>
                          {sub.badge && (
                            <span className="px-1.5 py-0.5 rounded-[2px] text-[8px] font-black uppercase tracking-wider bg-slate-200/80 dark:bg-zinc-800 text-amber-700 dark:text-[#e0a22a] shrink-0 border border-slate-300/60 dark:border-white/[0.06]">
                              {sub.badge}
                            </span>
                          )}
                        </div>

                        {/* Streamlined Quick Links (max 2 for cleaner visual) */}
                        <div className="space-y-0.5 py-1">
                          {sub.quickLinks.slice(0, 2).map((link, lIdx) => (
                            <button
                              key={lIdx}
                              onClick={() => handleActionNavigate(link.route)}
                              className="w-full text-left py-1 px-1.5 rounded-[3px] text-[11px] font-semibold text-slate-600 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/[0.05] flex items-center justify-between group transition-colors cursor-pointer"
                            >
                              <span className="truncate">{link.label}</span>
                              <ChevronRight className="w-3 h-3 text-slate-400 dark:text-zinc-500 group-hover:text-amber-600 dark:group-hover:text-[#e0a22a] group-hover:translate-x-0.5 transition-transform shrink-0" />
                            </button>
                          ))}
                        </div>

                        {/* Direct Category View */}
                        <button
                          onClick={() => handleActionNavigate(sub.linkRoute)}
                          className="w-full mt-1.5 pt-2 border-t border-slate-200/80 dark:border-white/[0.06] text-[11px] font-black uppercase text-amber-700 dark:text-[#e0a22a] hover:text-amber-800 dark:hover:text-white flex items-center justify-between transition-colors cursor-pointer group"
                        >
                          <span>Ver Catálogo</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Single Spotlight Card (3-4 cols) */}
              <div className="lg:col-span-4 xl:col-span-3">
                <div className="h-full rounded-xl bg-zinc-950 text-white border border-slate-200/80 dark:border-white/[0.08] p-4 flex flex-col justify-between relative overflow-hidden group shadow-md">
                  {currentTabConfig.highlight.bannerImg && (
                    <div 
                      className="absolute inset-0 opacity-25 bg-cover bg-center pointer-events-none transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url(${currentTabConfig.highlight.bannerImg})` }} 
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none" />

                  <div className="relative z-10 space-y-1.5">
                    <span className="inline-block px-2 py-0.5 rounded-[2px] text-[8px] font-black uppercase tracking-wider bg-amber-400 text-black shadow-xs font-bold">
                      {currentTabConfig.highlight.badge}
                    </span>
                    <h4 className="text-sm font-black uppercase tracking-wider text-white leading-tight">
                      {currentTabConfig.highlight.title}
                    </h4>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans line-clamp-2">
                      {currentTabConfig.highlight.desc}
                    </p>
                  </div>

                  <div className="relative z-10 pt-4 space-y-2">
                    <button
                      onClick={() => handleActionNavigate(currentTabConfig.highlight.ctaRoute)}
                      className="w-full py-2 px-3 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <span>{currentTabConfig.highlight.ctaLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    {currentTabConfig.highlight.secondaryCta && (
                      <button
                        onClick={() => handleActionNavigate(currentTabConfig.highlight.secondaryCta!.route)}
                        className="w-full py-1.5 px-3 rounded-[3px] bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-zinc-700 cursor-pointer"
                      >
                        <span>{currentTabConfig.highlight.secondaryCta!.label}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 4. CLEAN MICRO-FOOTER */}
      <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-zinc-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
          <span className="font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 text-[10px]">
            SEDE CENTRAL PATIO KM 22, AUTOPISTA DUARTE • DESPACHO INMEDIATO A TODO EL PAÍS
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
          <span>DISTRIBUIDOR OFICIAL RD</span>
          <span className="text-amber-600 dark:text-amber-400">GARANTÍA DE FÁBRICA DIRECTA</span>
        </div>
      </div>
    </div>
  );
};
