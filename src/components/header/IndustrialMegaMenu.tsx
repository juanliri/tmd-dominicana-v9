import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  ChevronRight, 
  Sparkles, 
  X
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

  // Relaxed hover transition with comfortable 160ms debounce
  const handleTabMouseEnter = (tabId: MegaMenuTabId) => {
    if (tabHoverTimeoutRef.current) clearTimeout(tabHoverTimeoutRef.current);
    tabHoverTimeoutRef.current = setTimeout(() => {
      setActiveTab(tabId);
      if (onSelectSegment) onSelectSegment(tabId);
    }, 160);
  };

  const handleTabClick = (tabId: MegaMenuTabId) => {
    if (tabHoverTimeoutRef.current) clearTimeout(tabHoverTimeoutRef.current);
    setActiveTab(tabId);
    if (onSelectSegment) onSelectSegment(tabId);
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
      {/* 1. SLEEK MINIMAL HEADER BAR */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-white/[0.08] pb-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-[4px] bg-zinc-900 text-[#e0a22a] flex items-center justify-center shrink-0 border border-white/[0.08]">
            <ActiveTabIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider truncate">
                {currentTabConfig.label}
              </h3>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[9px] font-mono font-bold uppercase text-emerald-400 bg-emerald-950/40 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                PATIO KM 22
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 truncate font-sans">
              {currentTabConfig.headline}
            </p>
          </div>
        </div>

        {/* Clean Right Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              if (activeTab === 'heavy_machinery') handleActionNavigate('#/machinery');
              else if (activeTab === 'contractor_deploy') handleActionNavigate('#/rental');
              else if (activeTab === 'parts_service') handleActionNavigate('#/parts');
              else if (activeTab === 'gov_bids') handleActionNavigate('#/tech-docs');
              else handleActionNavigate('#/machinery');
            }}
            className="text-xs font-black uppercase tracking-wider text-[#e0a22a] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Ver Hub de {currentTabConfig.shortLabel || currentTabConfig.label}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="p-1.5 rounded-[3px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer border border-transparent hover:border-zinc-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. REFINED CONTENT: CLEAN CATEGORIES + 1 EDITORIAL SPOTLIGHT */}
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
                <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#e0a22a]" />
                  Marcas Oficiales Homologadas en República Dominicana
                </span>
                <button
                  onClick={() => handleActionNavigate('#/machinery')}
                  className="text-xs font-bold text-[#e0a22a] hover:underline cursor-pointer"
                >
                  Ver Toda la Flota 2026 →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {OFFICIAL_BRANDS.map(brand => (
                  <button
                    key={brand.id}
                    onClick={() => handleActionNavigate(`#/machinery?brand=${brand.id}`)}
                    className="p-2.5 rounded-lg bg-zinc-900/90 border border-white/[0.08] hover:border-[#d99b26]/60 hover:bg-zinc-850 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-black text-white group-hover:text-[#e0a22a] transition-colors truncate">
                        {brand.name}
                      </span>
                      <span className="text-[8px] font-mono text-zinc-400 bg-zinc-950 px-1 py-0.5 rounded-[2px] border border-white/[0.06]">
                        {brand.country}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 line-clamp-1 font-sans">
                      {brand.category}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* 3 COLUMN CATEGORY DIRECTORY + 1 SPOTLIGHT */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* Left 3 Category Columns (8-9 cols) */}
              <div className="lg:col-span-8 xl:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {currentTabConfig.subcategories.map(sub => {
                  const SubIcon = sub.icon;
                  return (
                    <div 
                      key={sub.id}
                      className="p-3.5 rounded-lg bg-zinc-900/70 border border-white/[0.06] hover:border-white/[0.12] flex flex-col justify-between transition-colors"
                    >
                      <div>
                        {/* Subcategory Title */}
                        <div className="flex items-center justify-between gap-1.5 pb-2 mb-2 border-b border-white/[0.06]">
                          <div className="flex items-center gap-2 min-w-0">
                            <SubIcon className="w-3.5 h-3.5 text-[#e0a22a] shrink-0" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-white truncate">
                              {sub.title}
                            </h4>
                          </div>
                          {sub.badge && (
                            <span className="px-1.5 py-0.5 rounded-[2px] text-[8px] font-black uppercase tracking-wider bg-zinc-800 text-[#e0a22a] shrink-0">
                              {sub.badge}
                            </span>
                          )}
                        </div>

                        {/* Typographic Quick Links */}
                        <div className="space-y-1 py-1">
                          {sub.quickLinks.map((link, lIdx) => (
                            <button
                              key={lIdx}
                              onClick={() => handleActionNavigate(link.route)}
                              className="w-full text-left py-1 px-1.5 rounded-[3px] text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.05] flex items-center justify-between group transition-colors cursor-pointer"
                            >
                              <span className="truncate">{link.label}</span>
                              <ChevronRight className="w-3 h-3 text-zinc-500 group-hover:text-[#e0a22a] group-hover:translate-x-0.5 transition-transform shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Direct Category View */}
                      <button
                        onClick={() => handleActionNavigate(sub.linkRoute)}
                        className="mt-2 pt-2 border-t border-white/[0.06] text-[11px] font-black uppercase text-[#e0a22a] hover:text-white flex items-center justify-between transition-colors cursor-pointer group"
                      >
                        <span>Ver modelos</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Right Single Spotlight Card (3-4 cols) */}
              <div className="lg:col-span-4 xl:col-span-3">
                <div className="h-full rounded-lg bg-zinc-900 border border-white/[0.08] p-4 flex flex-col justify-between relative overflow-hidden group">
                  {currentTabConfig.highlight.bannerImg && (
                    <div 
                      className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url(${currentTabConfig.highlight.bannerImg})` }} 
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none" />

                  <div className="relative z-10 space-y-1.5">
                    <span className="inline-block px-2 py-0.5 rounded-[2px] text-[8px] font-black uppercase tracking-wider bg-[#d99b26] text-black shadow-xs">
                      {currentTabConfig.highlight.badge}
                    </span>
                    <h4 className="text-sm font-black uppercase tracking-wider text-white leading-tight">
                      {currentTabConfig.highlight.title}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans line-clamp-2">
                      {currentTabConfig.highlight.desc}
                    </p>
                  </div>

                  <div className="relative z-10 pt-4">
                    <button
                      onClick={() => handleActionNavigate(currentTabConfig.highlight.ctaRoute)}
                      className="w-full py-2 px-3 rounded-[3px] bg-[#d99b26] hover:bg-[#e0a22a] text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <span>{currentTabConfig.highlight.ctaLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

