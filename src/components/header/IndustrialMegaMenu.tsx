import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles, 
  Phone, 
  FileCheck, 
  Building2, 
  Pin, 
  PinOff,
  X,
  CheckCircle2,
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
  initial: { opacity: 0, y: 8, scale: 0.995 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 380,
      damping: 30,
      mass: 0.8,
      staggerChildren: 0.04,
      delayChildren: 0.02
    }
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.995,
    transition: {
      duration: 0.16,
      ease: 'easeOut'
    }
  }
};

const columnSpringVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 380,
      damping: 28,
      mass: 0.8
    }
  }
};

const brandCardSpringVariants: Variants = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 26,
      mass: 0.7
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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-5 font-display">
      {/* 1. RELAXED TOP HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-3.5 mb-5 gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-[4px] bg-zinc-900 text-amber-400 flex items-center justify-center shrink-0 border border-zinc-800">
            <ActiveTabIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h3 className="text-sm font-black text-white uppercase tracking-wider truncate">
                {currentTabConfig.label}
              </h3>
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[3px] text-[10px] font-black uppercase tracking-wider bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                PATIO KM 22 • ENTREGA INMEDIATA
              </span>
            </div>
            <p className="text-xs text-zinc-400 truncate mt-0.5 font-sans">
              {currentTabConfig.headline}
            </p>
          </div>
        </div>

        {/* Action Pills & Controls */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            onClick={() => handleActionNavigate('#/checkout')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-xs font-black uppercase tracking-wider text-zinc-200 border border-zinc-800 transition-colors cursor-pointer"
          >
            <FileCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>COTIZADOR NCF DGII</span>
          </button>

          <a
            href="tel:18095601234"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-xs font-black uppercase tracking-wider text-emerald-400 border border-zinc-800 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono">(809) 560-1234</span>
          </a>

          {onTogglePin && (
            <button
              onClick={onTogglePin}
              title={isPinned ? 'Desfijar menú' : 'Fijar menú para navegación continua'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                isPinned
                  ? 'bg-zinc-800 text-amber-400 border-amber-500/60'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-800'
              }`}
            >
              {isPinned ? <PinOff className="w-3.5 h-3.5 text-amber-400" /> : <Pin className="w-3.5 h-3.5" />}
              <span className="hidden xl:inline">{isPinned ? 'FIJADO' : 'FIJAR'}</span>
            </button>
          )}

          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="p-1.5 rounded-[3px] text-zinc-400 hover:text-white hover:bg-zinc-850 transition-colors cursor-pointer border border-transparent hover:border-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. RELAXED CONTENT CONTAINER WITH SPRING ANIMATIONS */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTab}
          variants={tabContentVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {activeTab === 'brands' ? (
            /* ========================================================= */
            /* PABELLÓN DE MARCAS OFICIALES - RELAXED GALLERY VIEW       */
            /* ========================================================= */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>PABELLÓN DE MARCAS HOMOLOGADAS EN REPÚBLICA DOMINICANA</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5 font-sans">
                    Garantía directa de fábrica respaldada por TMD, soporte técnico local en Patio Km 22 y repuestos 100% genuinos.
                  </p>
                </div>
                <button
                  onClick={() => handleActionNavigate('#/machinery')}
                  className="text-xs font-black uppercase tracking-wider text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>VER TODAS LAS MAQUINARIAS</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {OFFICIAL_BRANDS.map(brand => (
                  <motion.button
                    key={brand.id}
                    variants={brandCardSpringVariants}
                    whileHover={{ y: -3, scale: 1.015, transition: { type: "spring", stiffness: 450, damping: 22 } }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleActionNavigate(`#/machinery?brand=${brand.id}`)}
                    className="group text-left p-3.5 rounded-[5px] bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/60 hover:bg-zinc-850 transition-colors hover:shadow-md cursor-pointer"
                  >
                    <div className="aspect-16/10 rounded-[3px] overflow-hidden mb-3 bg-zinc-800 relative">
                      {brand.bannerImage ? (
                        <img 
                          src={brand.bannerImage} 
                          alt={brand.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-sm text-zinc-400">
                          {brand.name}
                        </div>
                      )}
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-[2px] bg-zinc-950/90 text-[9px] font-black uppercase text-amber-400 border border-zinc-800">
                        {brand.country}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-white group-hover:text-amber-400 transition-colors">
                        {brand.name}
                      </h4>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5 font-sans">
                      {brand.category}
                    </p>
                    <div className="mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                      <span className="text-emerald-400">STOCK KM 22</span>
                      <span className="text-amber-400 font-black">GARANTÍA DIRECTA</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* AIRY 3-COLUMN TYPOGRAPHIC NAVIGATION & EDITORIAL HERO     */
            /* ========================================================= */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* Left 3 Subcategory Columns (8-9 Cols) */}
              <div className="lg:col-span-8 xl:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {currentTabConfig.subcategories.map(sub => {
                  const SubIcon = sub.icon;
                  const feat = sub.featuredProduct;

                  return (
                    <motion.div 
                      key={sub.id} 
                      variants={columnSpringVariants}
                      whileHover={{ y: -2, transition: { type: "spring", stiffness: 450, damping: 25 } }}
                      className="p-4 rounded-[5px] bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between hover:border-amber-500/50 transition-colors duration-200"
                    >
                      <div>
                        {/* Subcategory Header */}
                        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-zinc-800">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-[3px] bg-zinc-800 text-amber-400 flex items-center justify-center shrink-0 border border-zinc-700">
                              <SubIcon className="w-4 h-4" />
                            </div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-white truncate">
                              {sub.title}
                            </h4>
                          </div>
                          {sub.badge && (
                            <span className="px-2 py-0.5 rounded-[2px] text-[9px] font-black uppercase tracking-wider bg-zinc-800 text-amber-400 border border-zinc-700 shrink-0">
                              {sub.badge}
                            </span>
                          )}
                        </div>

                        {/* 1 Single Featured Product Card with crisp photography */}
                        {feat && (
                          <motion.div 
                            whileHover={{ y: -2, scale: 1.015, transition: { type: "spring", stiffness: 450, damping: 22 } }}
                            whileTap={{ scale: 0.985 }}
                            onClick={() => handleActionNavigate(feat.route)}
                            className="group p-2.5 rounded-[4px] bg-zinc-950 border border-zinc-800 hover:border-amber-500/60 hover:shadow-sm transition-all cursor-pointer mb-3.5"
                          >
                            <div className="aspect-16/10 rounded-[3px] bg-zinc-900 overflow-hidden relative mb-2">
                              <img 
                                src={feat.image} 
                                alt={feat.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                              />
                              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-[2px] text-[8px] font-black uppercase bg-amber-500 text-black">
                                {feat.brand}
                              </span>
                            </div>
                            <h5 className="text-xs font-black uppercase tracking-wider text-white truncate group-hover:text-amber-400 transition-colors">
                              {feat.name}
                            </h5>
                            <p className="text-[11px] text-zinc-400 truncate mt-0.5 font-sans">
                              {feat.spec}
                            </p>
                          </motion.div>
                        )}

                        {/* Relaxed Typographic Quick Links */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-1">
                            LÍNEAS DESTACADAS:
                          </span>
                          {sub.quickLinks.map((link, lIdx) => (
                            <motion.button
                              key={lIdx}
                              whileHover={{ x: 3, transition: { type: "spring", stiffness: 500, damping: 25 } }}
                              onClick={() => handleActionNavigate(link.route)}
                              className="w-full text-left py-1 px-1.5 rounded-[3px] text-xs font-bold uppercase tracking-wide text-zinc-300 hover:text-amber-400 hover:bg-zinc-800 flex items-center justify-between group transition-colors cursor-pointer"
                            >
                              <span className="truncate">{link.label}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Direct Category Access */}
                      <div className="pt-3 mt-3 border-t border-zinc-800">
                        <button
                          onClick={() => handleActionNavigate(sub.linkRoute)}
                          className="w-full py-1.5 px-2 text-xs font-black uppercase tracking-wider text-amber-400 hover:bg-zinc-800 rounded-[3px] transition-colors flex items-center justify-between group cursor-pointer"
                        >
                          <span>VER CATÁLOGO DE {sub.title}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform shrink-0" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Right Feature Showcase Hero Card (3-4 Cols) */}
              <motion.div variants={columnSpringVariants} className="lg:col-span-4 xl:col-span-3 h-full">
                <div className="h-full rounded-[5px] bg-zinc-900 text-white p-5 border border-zinc-800 flex flex-col justify-between relative overflow-hidden shadow-lg min-h-[340px]">
                  {currentTabConfig.highlight.bannerImg && (
                    <div 
                      className="absolute inset-0 opacity-25 bg-cover bg-center pointer-events-none transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${currentTabConfig.highlight.bannerImg})` }} 
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/85 to-zinc-950/30 pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-[3px] text-[9px] font-black uppercase tracking-wider bg-amber-500 text-black shadow-xs">
                        {currentTabConfig.highlight.badge}
                      </span>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </div>

                    <h4 className="text-base font-black uppercase tracking-wider text-white mt-2 leading-snug">
                      {currentTabConfig.highlight.title}
                    </h4>
                    <p className="text-xs text-zinc-300 mt-2 leading-relaxed font-sans font-normal">
                      {currentTabConfig.highlight.desc}
                    </p>

                    <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center gap-2 text-[11px] text-emerald-400 font-black uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>PATIO KM 22 • ENTREGA INMEDIATA</span>
                    </div>
                  </div>

                  <div className="relative z-10 pt-5 space-y-2">
                    <motion.button
                      whileHover={{ scale: 1.015, transition: { type: "spring", stiffness: 400, damping: 20 } }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => handleActionNavigate(currentTabConfig.highlight.ctaRoute)}
                      className="w-full py-2.5 px-4 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                    >
                      <span>{currentTabConfig.highlight.ctaLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>

                    {currentTabConfig.highlight.secondaryCta ? (
                      <motion.button
                        whileHover={{ scale: 1.01, transition: { type: "spring", stiffness: 400, damping: 20 } }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => handleActionNavigate(currentTabConfig.highlight.secondaryCta!.route)}
                        className="w-full py-2 px-3 rounded-[3px] bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors border border-zinc-800 cursor-pointer"
                      >
                        <Building2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>{currentTabConfig.highlight.secondaryCta!.label}</span>
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.01, transition: { type: "spring", stiffness: 400, damping: 20 } }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => handleActionNavigate('#/portal')}
                        className="w-full py-2 px-3 rounded-[3px] bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors border border-zinc-800 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>PORTAL DE CLIENTES & FLOTAS</span>
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Clean Micro-Footer */}
          <div className="mt-5 pt-3.5 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
              <span className="font-bold uppercase tracking-wider text-zinc-200 text-[11px]">
                SEDE CENTRAL PATIO KM 22, AUTOPISTA DUARTE • DESPACHO INMEDIATO A TODO EL PAÍS
              </span>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              <span>DISTRIBUIDORES OFICIALES: JCB • LIUGONG • AMMANN</span>
              <span className="text-amber-400">GARANTÍA DE FÁBRICA DIRECTA</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

