import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Filter, 
  Search, 
  FileText, 
  Check, 
  Phone, 
  X, 
  ExternalLink, 
  SlidersHorizontal, 
  HardHat, 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  Calculator, 
  Send, 
  Sparkles, 
  Scale, 
  RefreshCw, 
  RotateCw, 
  Video, 
  Eye, 
  QrCode, 
  FileDown, 
  Sliders, 
  LayoutGrid, 
  List, 
  ArrowUpDown, 
  CheckCircle2, 
  Calendar,
  Layers,
  Wrench,
  ChevronDown,
  ChevronUp,
  Zap,
  Package,
  ArrowRight,
  Truck,
  Building2,
  Flame,
  Compass,
  Award,
  Radio,
  Download,
  MonitorPlay,
  FileStack
} from 'lucide-react';
import { MACHINES_DATA } from '../data/catalog';
import { Machine } from '../types';
import { getUnifiedStoreMachinery } from '../services/cdnCatalogLoader';
import { downloadProductQrCode } from '../utils/qrExporter';
import { RecentlyVerifiedBadge } from './common/RecentlyVerifiedBadge';
import { useCart } from '../context/CartContext';
import { useComparison } from '../context/ComparisonContext';
import { PriceEstimateModal } from './PriceEstimateModal';
import { MachineryGridSkeleton } from './skeletons';
import { MachineryFinancingCalculator } from './MachineryFinancingCalculator';
import { MachineQuickCalculatorModal } from './MachineQuickCalculatorModal';
import { Machine360Modal } from './Machine360Modal';
import { ProductQrCodeModal } from './ProductQrCodeModal';
import { ExportCatalogPdfModal } from './ExportCatalogPdfModal';
import { TenderDossierExporterModal } from './catalog/TenderDossierExporterModal';
import { MachineCustomizerModal } from './MachineCustomizerModal';
import { TestDriveBookingModal } from './media/TestDriveBookingModal';
import { DominicanOperationalVideos } from './media/DominicanOperationalVideos';
import { FleetAcquisitionFilterBar, FleetConditionFilter } from './machinery/FleetAcquisitionFilterBar';
import { MachineDetailStudioModal } from './machinery/MachineDetailStudioModal';
import { MachineryMosaicGrid, MosaicLayoutMode } from './machinery/MachineryMosaicGrid';
import { PublicLiveLinkSimulatorModal } from './telematics/PublicLiveLinkSimulatorModal';
import { IndustrialSectionDivider } from './common/IndustrialSectionDivider';
import { MachineryFacetFilterDrawer, FacetFilterState } from './machinery/MachineryFacetFilterDrawer';
import { ShowroomKioskModeModal } from './showroom/ShowroomKioskModeModal';
import { LowboyFreightCalculatorModal } from './logistics/LowboyFreightCalculatorModal';
import { MachineExplodedViewModal } from './machinery/MachineExplodedViewModal';
import { MachineTestDriveModal } from './machinery/MachineTestDriveModal';
import { triggerHaptic } from '../utils/haptics';
import { USD_TO_DOP_RATE } from '../data/catalog';
import jcbBannerImg from '../assets/images/jcb_machinery_banner_1789963695284.jpg';
import { motion, AnimatePresence, type Variants } from 'motion/react';

const machineryContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04
    }
  }
};

const machineryTableStaggerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.035,
      delayChildren: 0.02
    }
  }
};

const tableRowVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } 
  }
};

const machineryFadeInItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

interface MachineryViewProps {
  onNavigate: (route: string) => void;
  selectedMachineId?: string | null;
  onClearSelectedMachine?: () => void;
}

type ViewMode = 'mosaic' | 'grid' | 'table';
type NavigationMode = 'load_more' | 'pagination';
type SortOption = 'featured' | 'price_asc' | 'price_desc' | 'power_desc' | 'weight_desc' | 'name_asc';
type PowerFilter = 'all' | 'under_80' | '80_150' | '150_250' | 'over_250';

interface MachineTableRowProps {
  machine: Machine;
  formatEquiposPrice: (usdPrice: number) => string;
  showMonthlyLeasing: boolean;
  getMonthlyLeasingEstimate: (usdPrice: number) => string;
  handleOpenSpecs: (machine: Machine) => void;
  setQrModalMachine: (machine: Machine) => void;
  setActive360Tab: (tab: '360' | 'video' | 'gallery' | 'dimensions') => void;
  setActive360Machine: (machine: Machine) => void;
  addMachineToQuote: (machine: Machine) => void;
  onNavigate: (route: string) => void;
}

const MachineTableRow = React.memo<MachineTableRowProps>(({
  machine,
  formatEquiposPrice,
  showMonthlyLeasing,
  getMonthlyLeasingEstimate,
  handleOpenSpecs,
  setQrModalMachine,
  setActive360Tab,
  setActive360Machine,
  addMachineToQuote,
  onNavigate
}) => {
  return (
    <motion.tr 
      variants={tableRowVariants}
      className="hover:bg-amber-500/5 dark:hover:bg-zinc-800/50 transition-colors group font-display"
    >
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <img
            src={machine.image}
            alt={machine.name}
            className="w-12 h-10 object-cover rounded-[3px] bg-zinc-800 shrink-0 group-hover:scale-105 transition-transform"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('tmd_coming_soon')) {
                target.src = '/images/tmd_coming_soon.jpg';
              }
            }}
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-black text-white text-xs uppercase tracking-tight block group-hover:text-amber-400 transition-colors">
                {machine.name}
              </span>
              <RecentlyVerifiedBadge
                itemId={machine.id}
                itemCode={machine.modelCode}
                itemType="machinery"
                variant="card-badge"
              />
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">
              MOD. {machine.modelCode} • {machine.year}
            </span>
          </div>
        </div>
      </td>
      <td className="py-3 px-3">
        <span className="px-2 py-0.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-amber-400 text-[10px] font-mono font-bold uppercase">
          {machine.brand}
        </span>
      </td>
      <td className="py-3 px-3 text-zinc-300 text-xs font-bold uppercase">
        {machine.category}
      </td>
      <td className="py-3 px-3 font-mono text-zinc-300 text-xs font-bold">
        {machine.powerHp} HP
      </td>
      <td className="py-3 px-3 font-mono text-zinc-300 text-xs font-bold">
        {machine.operatingWeightKg.toLocaleString()} KG
      </td>
      <td className="py-3 px-3 text-right">
        <span className="font-mono font-black text-white text-xs block">
          {formatEquiposPrice(machine.basePriceUsd)}
        </span>
        {showMonthlyLeasing && (
          <span className="text-[9px] font-mono text-amber-400 block uppercase font-bold">
            LEASING: {getMonthlyLeasingEstimate(machine.basePriceUsd)}
          </span>
        )}
        <span className="text-[9px] text-zinc-400 font-mono uppercase font-bold">
          PATIO KM 22
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center justify-center gap-1.5 font-display">
          <button
            onClick={() => handleOpenSpecs(machine)}
            className="px-2.5 py-1.5 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
            title="Ver Ficha Técnica"
          >
            FICHA
          </button>
          <button
            type="button"
            onClick={async () => {
              await downloadProductQrCode(machine, 'machinery');
            }}
            className="p-1.5 rounded-[3px] bg-zinc-900 hover:bg-amber-400 hover:text-black text-amber-400 border border-zinc-800 transition-colors cursor-pointer flex items-center gap-1"
            title="Exportar QR para rotulado de patio / almacén"
            aria-label={`Exportar QR para ${machine.name}`}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[9px] font-mono font-bold">EXPORT QR</span>
          </button>
          <button
            type="button"
            onClick={() => setQrModalMachine(machine)}
            className="p-1.5 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 hover:text-amber-400 text-zinc-300 border border-zinc-800 transition-colors cursor-pointer"
            title="Generar Código QR para Móvil"
            aria-label={`Código QR para ${machine.name}`}
          >
            <QrCode className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setActive360Tab('360');
              setActive360Machine(machine);
            }}
            className="p-1.5 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-zinc-800 transition-colors cursor-pointer"
            title="Giro 360°"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              addMachineToQuote(machine);
              onNavigate('#/checkout');
            }}
            className="px-3 py-1.5 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-[10px] transition-colors shadow-xs cursor-pointer"
          >
            COTIZAR
          </button>
        </div>
      </td>
    </motion.tr>
  );
});
MachineTableRow.displayName = 'MachineTableRow';

export const MachineryView = React.memo<MachineryViewProps>(({
  onNavigate,
  selectedMachineId,
  onClearSelectedMachine
}) => {
  const { addMachineToQuote, formatPrice, currency, setCurrency } = useCart();
  const { 
    toggleMachineCompare, 
    isComparing, 
    openComparison, 
    selectedMachines, 
    maxMachines 
  } = useComparison();

  const [fleetCondition, setFleetCondition] = useState<FleetConditionFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedBrand, setSelectedBrand] = useState<string>('Todas');
  const [powerFilter, setPowerFilter] = useState<PowerFilter>('all');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [viewMode, setViewMode] = useState<ViewMode>('mosaic');
  const [navigationMode, setNavigationMode] = useState<NavigationMode>('load_more');
  const [showMonthlyLeasing, setShowMonthlyLeasing] = useState<boolean>(false);
  
  // Dynamic Load More & Pagination States
  const [visibleCount, setVisibleCount] = useState<number>(6);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(6);
  
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState<boolean>(false);
  const [isFacetDrawerOpen, setIsFacetDrawerOpen] = useState<boolean>(false);
  const [facetFilters, setFacetFilters] = useState<FacetFilterState>({
    brands: [],
    tonnageRange: [],
    powerRange: [],
    fuelTypes: [],
    availability: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const catalogTopRef = useRef<HTMLDivElement>(null);
  const categoryNavScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollState = () => {
    if (categoryNavScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryNavScrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  const scrollNav = (direction: 'left' | 'right') => {
    if (categoryNavScrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      categoryNavScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    checkScrollState();
    const el = categoryNavScrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollState, { passive: true });
      window.addEventListener('resize', checkScrollState);
      return () => {
        el.removeEventListener('scroll', checkScrollState);
        window.removeEventListener('resize', checkScrollState);
      };
    }
  }, []);

  // Machine Quick Calculator Modal State
  const [calculatorMachine, setCalculatorMachine] = useState<Machine | null>(null);


  // Filter Accordion Collapsible Sections
  const [isBrandFilterOpen, setIsBrandFilterOpen] = useState<boolean>(true);
  const [isPowerFilterOpen, setIsPowerFilterOpen] = useState<boolean>(true);

  // Machine Customizer Modal State
  const [customizerMachine, setCustomizerMachine] = useState<Machine | null>(null);

  // Machine QR Code Modal State
  const [qrModalMachine, setQrModalMachine] = useState<Machine | null>(null);

  // Export PDF Modal State
  const [isExportPdfOpen, setIsExportPdfOpen] = useState<boolean>(false);
  const [isTenderDossierOpen, setIsTenderDossierOpen] = useState<boolean>(false);

  // Field Test Drive Demo Modal State
  const [isTestDriveOpen, setIsTestDriveOpen] = useState<boolean>(false);
  const [testDriveMachine, setTestDriveMachine] = useState<Machine | null>(null);

  // LiveLink Telematics Simulator Modal State
  const [isLiveLinkModalOpen, setIsLiveLinkModalOpen] = useState<boolean>(false);
  const [isKioskOpen, setIsKioskOpen] = useState<boolean>(false);
  const [isLowboyOpen, setIsLowboyOpen] = useState<boolean>(false);

  // Machine 360 & Advanced Video/Gallery Modal State
  const [active360Machine, setActive360Machine] = useState<Machine | null>(null);
  const [active360Tab, setActive360Tab] = useState<'360' | 'video' | 'gallery' | 'dimensions'>('360');
  const [isExplodedViewOpen, setIsExplodedViewOpen] = useState(false);
  const [isPatioDemoOpen, setIsPatioDemoOpen] = useState(false);


  // Simulated initial fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 280);
    return () => clearTimeout(timer);
  }, []);

  // Sync brand or category filters from URL hash (e.g. #/machinery?brand=JCB)
  useEffect(() => {
    const handleUrlFilters = () => {
      const fullHash = window.location.hash || '';
      const [, queryString] = fullHash.split('?');
      if (queryString) {
        const params = new URLSearchParams(queryString);
        const b = params.get('brand');
        const c = params.get('category');
        if (b) setSelectedBrand(b);
        if (c) setSelectedCategory(c);
      }
    };
    handleUrlFilters();
    window.addEventListener('hashchange', handleUrlFilters);
    return () => window.removeEventListener('hashchange', handleUrlFilters);
  }, []);

  const formatEquiposPrice = useCallback((usdPrice: number) => {
    if (currency === 'DOP') {
      const dop = Math.round(usdPrice * USD_TO_DOP_RATE);
      return `RD$ ${dop.toLocaleString('es-DO')}`;
    }
    return `$${usdPrice.toLocaleString('en-US')} USD`;
  }, [currency]);

  const getMonthlyLeasingEstimate = useCallback((usdPrice: number) => {
    const financed = usdPrice * 0.8;
    const monthlyRate = 0.085 / 12;
    const months = 60;
    const payment = (financed * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    if (currency === 'DOP') {
      return `RD$ ${Math.round(payment * USD_TO_DOP_RATE).toLocaleString('es-DO')}/mes`;
    }
    return `$${Math.round(payment).toLocaleString('en-US')}/mes`;
  }, [currency]);

  // Master Unified Store Dataset
  const allStoreMachines = useMemo(() => {
    return getUnifiedStoreMachinery();
  }, [isSyncing]);

  // Technical Specs Modal
  const [activeModalMachine, setActiveModalMachine] = useState<Machine | null>(() => {
    if (selectedMachineId) {
      return getUnifiedStoreMachinery().find((m) => m.id === selectedMachineId) || null;
    }
    return null;
  });

  // Interactive 'Request Price Estimate' Tool Modal
  const [estimateMachine, setEstimateMachine] = useState<Machine | null>(null);

  // Update active modal machine when selectedMachineId is passed/updated via URL or search
  useEffect(() => {
    if (selectedMachineId) {
      const found = getUnifiedStoreMachinery().find((m) => m.id === selectedMachineId);
      if (found) {
        setActiveModalMachine(found);
      }
    }
  }, [selectedMachineId]);

  const handleCategoryChange = useCallback((category: string) => {
    if (category === selectedCategory) return;
    setIsLoading(true);
    setSelectedCategory(category);
    setVisibleCount(6);
    setCurrentPage(1);
    setIsMobileFiltersOpen(false);
    setTimeout(() => setIsLoading(false), 180);
  }, [selectedCategory]);

  const handleBrandChange = useCallback((brand: string) => {
    if (brand === selectedBrand) return;
    setIsLoading(true);
    setSelectedBrand(brand);
    setVisibleCount(6);
    setCurrentPage(1);
    setTimeout(() => setIsLoading(false), 180);
  }, [selectedBrand]);

  const handleConditionChange = useCallback((condition: FleetConditionFilter) => {
    setFleetCondition(condition);
    setVisibleCount(6);
    setCurrentPage(1);
  }, []);

  const handleRefreshInventory = () => {
    setIsSyncing(true);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSyncing(false);
    }, 350);
  };

  const categories = [
    'Todas',
    'Retroexcavadoras',
    'Excavadoras',
    'Cargadores',
    'Minicargadores',
    'Tractores',
    'Compactación',
    'Manipuladores',
    'Plantas de Concreto',
    'Sistemas Contra Incendios',
    'Implementos Agrícolas',
    'Cosechadoras'
  ];

  const categoryNavItems = useMemo(() => [
    { id: 'Todas', name: 'Todas las Máquinas', icon: Layers },
    { id: 'Excavadoras', name: 'Excavadoras', icon: HardHat },
    { id: 'Retroexcavadoras', name: 'Retroexcavadoras', icon: Truck },
    { id: 'Cargadores', name: 'Cargadores Frontales', icon: Package },
    { id: 'Minicargadores', name: 'Minicargadores', icon: Zap },
    { id: 'Tractores', name: 'Tractores Agrícolas', icon: Compass },
    { id: 'Compactación', name: 'Compactación & Rodillos', icon: SlidersHorizontal },
    { id: 'Manipuladores', name: 'Manipuladores', icon: ArrowUpDown },
    { id: 'Plantas de Concreto', name: 'Plantas de Concreto', icon: Building2 },
    { id: 'Sistemas Contra Incendios', name: 'Contra Incendios', icon: Flame },
    { id: 'Implementos Agrícolas', name: 'Implementos', icon: Wrench },
    { id: 'Cosechadoras', name: 'Cosechadoras', icon: Sparkles }
  ], []);
  
  const brands = [
    'Todas',
    'JCB',
    'LiuGong',
    'Kubota',
    'LS Tractor',
    'Yanmar',
    'Ammann',
    'IMER',
    'AFEX'
  ];

  // Calculate counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 'Todas': allStoreMachines.length };
    categories.forEach(cat => {
      if (cat !== 'Todas') {
        counts[cat] = allStoreMachines.filter(m => m.category === cat).length;
      }
    });
    return counts;
  }, [allStoreMachines]);

  // Calculate counts per brand
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = { 'Todas': allStoreMachines.length };
    brands.forEach(b => {
      if (b !== 'Todas') {
        counts[b] = allStoreMachines.filter(m => m.brand.toLowerCase() === b.toLowerCase()).length;
      }
    });
    return counts;
  }, [allStoreMachines]);

  // Calculate condition counts for fleet acquisition filter bar
  const conditionCounts = useMemo(() => {
    return {
      all: allStoreMachines.length,
      new: allStoreMachines.filter(m => m.year >= 2025).length,
      cpo: allStoreMachines.filter(m => m.inStock).length,
      rental: allStoreMachines.filter(m => ['Excavadoras', 'Retroexcavadoras', 'Cargadores', 'Compactación', 'Minicargadores'].includes(m.category)).length,
    };
  }, [allStoreMachines]);

  const filteredAndSortedMachines = useMemo(() => {
    const list = allStoreMachines.filter((m) => {
      const matchCategory = selectedCategory === 'Todas' || m.category === selectedCategory;
      const matchBrand = selectedBrand === 'Todas' || m.brand.toLowerCase() === selectedBrand.toLowerCase();
      const matchStock = !onlyInStock || m.inStock;
      
      let matchCondition = true;
      if (fleetCondition === 'new') matchCondition = m.year >= 2025;
      else if (fleetCondition === 'cpo') matchCondition = m.inStock;
      else if (fleetCondition === 'rental') matchCondition = ['Excavadoras', 'Retroexcavadoras', 'Cargadores', 'Compactación', 'Minicargadores'].includes(m.category);

      let matchPower = true;
      if (powerFilter === 'under_80') matchPower = m.powerHp < 80;
      else if (powerFilter === '80_150') matchPower = m.powerHp >= 80 && m.powerHp <= 150;
      else if (powerFilter === '150_250') matchPower = m.powerHp > 150 && m.powerHp <= 250;
      else if (powerFilter === 'over_250') matchPower = m.powerHp > 250;

      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        m.name.toLowerCase().includes(q) ||
        m.modelCode.toLowerCase().includes(q) ||
        m.brand.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q);

      // Facet Filters (Sprint 11 Task #18)
      let matchFacetBrands = true;
      if (facetFilters.brands.length > 0) {
        matchFacetBrands = facetFilters.brands.includes(m.brand);
      }

      let matchFacetTonnage = true;
      if (facetFilters.tonnageRange.length > 0) {
        matchFacetTonnage = facetFilters.tonnageRange.some(t => {
          if (t === 'mini') return m.operatingWeightKg <= 6000;
          if (t === 'medium') return m.operatingWeightKg > 6000 && m.operatingWeightKg <= 15000;
          if (t === 'heavy') return m.operatingWeightKg > 15000 && m.operatingWeightKg <= 25000;
          if (t === 'extra_heavy') return m.operatingWeightKg > 25000;
          return true;
        });
      }

      let matchFacetPower = true;
      if (facetFilters.powerRange.length > 0) {
        matchFacetPower = facetFilters.powerRange.some(p => {
          if (p === 'low') return m.powerHp <= 60;
          if (p === 'mid') return m.powerHp > 60 && m.powerHp <= 120;
          if (p === 'high') return m.powerHp > 120 && m.powerHp <= 200;
          if (p === 'ultra') return m.powerHp > 200;
          return true;
        });
      }

      let matchFacetAvailability = true;
      if (facetFilters.availability.length > 0) {
        matchFacetAvailability = facetFilters.availability.some(a => {
          if (a === 'in_stock') return m.inStock;
          if (a === 'transit') return !m.inStock && m.year >= 2025;
          if (a === 'factory') return !m.inStock && m.year < 2025;
          return true;
        });
      }

      return matchCategory && matchBrand && matchStock && matchCondition && matchPower && matchSearch && matchFacetBrands && matchFacetTonnage && matchFacetPower && matchFacetAvailability;
    });

    return list.sort((a, b) => {
      if (sortBy === 'price_asc') return a.basePriceUsd - b.basePriceUsd;
      if (sortBy === 'price_desc') return b.basePriceUsd - a.basePriceUsd;
      if (sortBy === 'power_desc') return b.powerHp - a.powerHp;
      if (sortBy === 'weight_desc') return b.operatingWeightKg - a.operatingWeightKg;
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      return 0; // featured default
    });
  }, [allStoreMachines, selectedCategory, selectedBrand, fleetCondition, powerFilter, onlyInStock, searchTerm, sortBy, facetFilters]);

  // Total results
  const totalItems = filteredAndSortedMachines.length;

  // Dynamic Grid Visible Items calculation
  const displayedMachines = useMemo(() => {
    if (navigationMode === 'load_more') {
      return filteredAndSortedMachines.slice(0, visibleCount);
    } else {
      const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
      const validPage = Math.min(Math.max(currentPage, 1), totalPages);
      const startIndex = (validPage - 1) * itemsPerPage;
      return filteredAndSortedMachines.slice(startIndex, startIndex + itemsPerPage);
    }
  }, [filteredAndSortedMachines, navigationMode, visibleCount, currentPage, itemsPerPage, totalItems]);

  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const validPage = Math.min(Math.max(currentPage, 1), totalPages);

  // Dynamic filter state key to trigger staggered cascade animations when filtering
  const filterKey = useMemo(() => {
    return `${selectedCategory}_${selectedBrand}_${fleetCondition}_${powerFilter}_${onlyInStock}_${searchTerm}_${sortBy}_${currentPage}`;
  }, [selectedCategory, selectedBrand, fleetCondition, powerFilter, onlyInStock, searchTerm, sortBy, currentPage]);

  const handleLoadMore = useCallback(() => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + 6, totalItems));
      setIsLoadingMore(false);
    }, 180);
  }, [totalItems]);

  const handleShowAll = useCallback(() => {
    setVisibleCount(totalItems);
  }, [totalItems]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    if (catalogTopRef.current) {
      catalogTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleOpenSpecs = useCallback((machine: Machine) => {
    setActiveModalMachine(machine);
  }, []);

  const handleCloseSpecs = useCallback(() => {
    setActiveModalMachine(null);
    if (onClearSelectedMachine) {
      onClearSelectedMachine();
    }
  }, [onClearSelectedMachine]);

  const handleOpenEstimate = useCallback((machine: Machine) => {
    setEstimateMachine(machine);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFleetCondition('all');
    setSelectedBrand('Todas');
    setSelectedCategory('Todas');
    setPowerFilter('all');
    setOnlyInStock(false);
    setSearchTerm('');
    setSortBy('featured');
    setVisibleCount(6);
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = 
    fleetCondition !== 'all' ||
    selectedCategory !== 'Todas' || 
    selectedBrand !== 'Todas' || 
    powerFilter !== 'all' || 
    onlyInStock || 
    searchTerm !== '';

  return (
    <motion.div 
      ref={catalogTopRef} 
      variants={machineryContainerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
    >
      {/* 1. TIER-1 DEPARTMENT LANDING HUB HERO (Apple/Tesla Grade) */}
      <motion.div variants={machineryFadeInItem} className="mb-6 rounded-[5px] overflow-hidden border border-zinc-800 bg-zinc-950 relative shadow-2xl">
        <div className="relative min-h-[220px] sm:min-h-[260px] flex items-center p-6 sm:p-8 lg:p-10 overflow-hidden">
          {/* Background image with luxury atmospheric dark gradient */}
          <div className="absolute inset-0">
            <img 
              src={jcbBannerImg} 
              alt="Flota de Maquinaria Pesada JCB y LiuGong TMD Dominicana" 
              className="w-full h-full object-cover object-center brightness-75 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/30" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-3xl space-y-3 font-display">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-black/80 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider backdrop-blur-md">
              <HardHat className="w-3.5 h-3.5 text-amber-400" />
              <span>DEPARTAMENTO DE MAQUINARIA PESADA • PATIO KM 22</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-tight">
              FLOTA OFICIAL &amp; <span className="text-amber-400">ENTREGA INMEDIATA</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 font-sans max-w-2xl leading-relaxed">
              Distribuidor oficial exclusivo JCB y LiuGong en República Dominicana. Más de 39 modelos pesados 0 Horas con garantía de fábrica, leasing comercial pre-aprobado en 24h y respaldo técnico de 12 bahías en Autopista Duarte.
            </p>

            {/* Quick Trust Pillars & Utility Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="flex items-center gap-1.5 bg-black/70 px-2.5 py-1 rounded-[3px] border border-white/[0.1] text-[11px] font-mono font-bold uppercase text-zinc-300 backdrop-blur-md">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Garantía Oficial 2 Años / 2,000h</span>
              </span>
              <span className="flex items-center gap-1.5 bg-black/70 px-2.5 py-1 rounded-[3px] border border-white/[0.1] text-[11px] font-mono font-bold uppercase text-zinc-300 backdrop-blur-md">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>15,000 m² Patio Km 22</span>
              </span>

              {/* Quick Action Buttons inside Hero */}
              <button
                type="button"
                onClick={() => setIsLiveLinkModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[3px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-mono text-[11px] font-bold uppercase border border-amber-500/50 backdrop-blur-md transition-all cursor-pointer"
                title="Probar simulador de telemetría satelital LiveLink"
              >
                <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Simulador LiveLink™</span>
              </button>

              <button
                type="button"
                onClick={handleRefreshInventory}
                disabled={isSyncing}
                title="Sincronizar disponibilidad en tiempo real"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-black/70 hover:bg-zinc-800 text-zinc-300 font-mono text-[11px] font-bold uppercase border border-white/[0.1] backdrop-blur-md transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sincronizando...' : 'Stock en Vivo'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  setIsExplodedViewOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-black/70 hover:bg-zinc-800 text-zinc-300 font-mono text-[11px] font-bold uppercase border border-white/[0.1] backdrop-blur-md transition-all cursor-pointer"
                title="Visor de planos y capas mecánicas desmontables 3D"
              >
                <Layers className="w-3 h-3 text-amber-400" />
                <span>Despiece 3D</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  setIsPatioDemoOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-black/70 hover:bg-zinc-800 text-zinc-300 font-mono text-[11px] font-bold uppercase border border-amber-400/40 text-amber-400 backdrop-blur-md transition-all cursor-pointer"
                title="Reserva de prueba y demostración real en patio Km 22"
              >
                <HardHat className="w-3 h-3 text-amber-400" />
                <span>Test Drive</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExportPdfOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-black/70 hover:bg-zinc-800 text-zinc-300 font-mono text-[11px] font-bold uppercase border border-white/[0.1] backdrop-blur-md transition-all cursor-pointer"
              >
                <FileDown className="w-3 h-3 text-amber-400" />
                <span>Exportar PDF</span>
              </button>

              <button
                onClick={openComparison}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-amber-500 text-black font-mono text-[11px] font-black uppercase transition-all cursor-pointer shadow-md"
              >
                <Scale className="w-3 h-3 text-black" />
                <span>Comparar ({selectedMachines.length}/{maxMachines})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Spotlight "Especial de Flota" (Deal of the Month) */}
        {MACHINES_DATA[0] && (
          <div className="bg-zinc-900/95 border-t border-zinc-800 p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 font-display">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative w-20 h-16 sm:w-24 sm:h-20 rounded-[3px] overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0">
                <img 
                  src={MACHINES_DATA[0].image} 
                  alt={MACHINES_DATA[0].name} 
                  className="w-full h-full object-cover" 
                />
                <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded-[2px] text-[8px] font-mono font-black bg-amber-500 text-black uppercase">
                  DESTACADO
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                    {MACHINES_DATA[0].brand} • MOD. {MACHINES_DATA[0].modelCode}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-[2px] bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                    STOCK EN KM 22
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-white uppercase truncate">
                  {MACHINES_DATA[0].name}
                </h4>
                <p className="text-[11px] text-zinc-400 font-mono">
                  {MACHINES_DATA[0].powerHp} HP • {MACHINES_DATA[0].operatingWeightKg.toLocaleString()} kg • Motor {MACHINES_DATA[0].engine}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-zinc-800">
              <div className="text-left md:text-right font-mono">
                <span className="text-[10px] text-zinc-400 uppercase block">Inversión Desde</span>
                <span className="text-base sm:text-lg font-black text-amber-400 block leading-tight">
                  {formatEquiposPrice(MACHINES_DATA[0].basePriceUsd)}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold block">
                  Leasing {getMonthlyLeasingEstimate(MACHINES_DATA[0].basePriceUsd)}/mes
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setActive360Tab('360');
                    setActive360Machine(MACHINES_DATA[0]);
                  }}
                  className="p-2 sm:px-3 sm:py-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-black uppercase transition-colors cursor-pointer border border-zinc-700 flex items-center gap-1"
                  title="Ver Giro 360°"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">360°</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenSpecs(MACHINES_DATA[0])}
                  className="px-3.5 py-2 rounded-[2px] bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1"
                >
                  <span>Ver Ficha</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* ============================================================ */}
      {/* UNIFIED STREAMLINED TOP CONTROL & NAVIGATION BAR             */}
      {/* ============================================================ */}
      <motion.div variants={machineryFadeInItem} className="space-y-3.5 mb-6">
        {/* Fleet Condition & Acquisition Mode Segmented Bar */}
        <FleetAcquisitionFilterBar
          activeCondition={fleetCondition}
          onChangeCondition={handleConditionChange}
          totalCounts={conditionCounts}
        />

        {/* Clean Horizontal Category Navigation Bar */}
        <div className="relative bg-zinc-950 rounded-[5px] border border-zinc-800 p-1.5 sm:p-2 shadow-xs group/nav font-display">
          {/* Left scroll control arrow */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollNav('left')}
              aria-label="Desplazar categorías hacia la izquierda"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-[3px] bg-zinc-900 text-zinc-200 border border-zinc-700 shadow-md flex items-center justify-center hover:bg-zinc-800 hover:text-amber-400 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none rounded-l-[5px]" />
          )}

          {/* Scrollable Category Track */}
          <div
            ref={categoryNavScrollRef}
            className="flex items-center gap-1.5 overflow-x-auto scroll-smooth py-0.5 px-1 scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categoryNavItems.map((item) => {
              const isActive = selectedCategory === item.id;
              const count = categoryCounts[item.id] || 0;
              const IconComponent = item.icon;

              if (item.id !== 'Todas' && count === 0) return null;

              return (
                <button
                  key={item.id}
                  id={`cat-nav-btn-${item.id}`}
                  type="button"
                  onClick={() => {
                    handleCategoryChange(item.id);
                    const el = document.getElementById(`cat-nav-btn-${item.id}`);
                    if (el && categoryNavScrollRef.current) {
                      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    }
                  }}
                  className={`group/btn flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer select-none border ${
                    isActive
                      ? 'bg-zinc-800 text-amber-400 border-amber-500/80 shadow-xs'
                      : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white border-zinc-800'
                  }`}
                >
                  <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-zinc-400 group-hover/btn:text-amber-400'}`} />
                  <span className="whitespace-nowrap tracking-tight">{item.name.toUpperCase()}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-[2px] font-mono font-black ${
                    isActive
                      ? 'bg-zinc-950 text-amber-400 border border-zinc-700'
                      : 'bg-zinc-950 text-zinc-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none rounded-r-[5px]" />
          )}

          {/* Right scroll control arrow */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollNav('right')}
              aria-label="Desplazar categorías hacia la derecha"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-[3px] bg-zinc-900 text-zinc-200 border border-zinc-700 shadow-md flex items-center justify-center hover:bg-zinc-800 hover:text-amber-400 transition-all cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Clean Controls & Search Bar (Level with Catalog Top) */}
        <div className="bg-zinc-950 p-2.5 sm:p-3 rounded-[5px] border border-zinc-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 font-display">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setVisibleCount(6);
                setCurrentPage(1);
              }}
              placeholder="BUSCAR MODELO O PALABRA CLAVE (EJ. 3CX, 922E, 4WD)..."
              className="w-full pl-9 pr-8 py-1.5 sm:py-2 rounded-[3px] bg-zinc-900 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400 uppercase font-mono transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setVisibleCount(6);
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Tools: Counter, Currency, Sorting, View Toggle */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-between md:justify-end">
            {/* Task #18: Facet Filter Trigger Button */}
            <button
              type="button"
              onClick={() => setIsFacetDrawerOpen(true)}
              className={`px-2.5 py-1.5 rounded-[3px] text-xs font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer border ${
                (facetFilters.brands.length + facetFilters.tonnageRange.length + facetFilters.powerRange.length + facetFilters.availability.length) > 0
                  ? 'bg-amber-400 text-black border-amber-400 font-black'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
              }`}
              title="Abrir Filtros Multifaceta Colapsables en Acordeón"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>FACETAS {(facetFilters.brands.length + facetFilters.tonnageRange.length + facetFilters.powerRange.length + facetFilters.availability.length) > 0 ? `(${facetFilters.brands.length + facetFilters.tonnageRange.length + facetFilters.powerRange.length + facetFilters.availability.length})` : ''}</span>
            </button>
            {/* Active Category Badge if filtered */}
            {selectedCategory !== 'Todas' && (
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[3px] bg-zinc-900 text-amber-400 text-xs font-black uppercase border border-zinc-800">
                <span>{selectedCategory.toUpperCase()}</span>
                <button
                  type="button"
                  onClick={() => handleCategoryChange('Todas')}
                  className="hover:text-white cursor-pointer p-0.5"
                  title="Quitar filtro de categoría"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Total Results Count */}
            <span className="text-xs text-zinc-400 font-mono px-1 hidden sm:inline uppercase">
              <strong className="text-white">{totalItems}</strong> MODELOS
            </span>

            {/* Currency Selector Pill */}
            <div className="flex items-center bg-zinc-900 p-0.5 rounded-[4px] border border-zinc-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-2 py-1 rounded-[3px] text-[10px] font-black uppercase transition-all cursor-pointer ${
                  currency === 'USD'
                    ? 'bg-zinc-800 text-amber-400 border border-zinc-700'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Precios en Dólares Estadounidenses (USD)"
              >
                USD $
              </button>
              <button
                type="button"
                onClick={() => setCurrency('DOP')}
                className={`px-2 py-1 rounded-[3px] text-[10px] font-black uppercase transition-all cursor-pointer ${
                  currency === 'DOP'
                    ? 'bg-zinc-800 text-amber-400 border border-zinc-700'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Precios en Pesos Dominicanos (RD$)"
              >
                DOP RD$
              </button>
            </div>

            {/* Leasing Estimate Toggle Button */}
            <button
              type="button"
              onClick={() => setShowMonthlyLeasing(!showMonthlyLeasing)}
              className={`px-2.5 py-1 rounded-[3px] text-xs font-black uppercase tracking-wider transition-all border flex items-center gap-1.5 cursor-pointer ${
                showMonthlyLeasing
                  ? 'bg-zinc-800 text-amber-400 border-amber-500/80 shadow-xs'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
              }`}
              title="Activar cálculo aproximado de cuota leasing mensual"
            >
              <Calculator className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">LEASING</span>
            </button>

            {/* Public Tenders Dossier Exporter (Task #74) */}
            <button
              type="button"
              onClick={() => setIsTenderDossierOpen(true)}
              className="px-2.5 py-1 rounded-[3px] text-xs font-black uppercase tracking-wider transition-all border flex items-center gap-1.5 cursor-pointer bg-zinc-900 text-amber-400 border-amber-400/40 hover:bg-amber-400 hover:text-black shadow-xs"
              title="Generar Dossier Técnico consolidado para Licitaciones Públicas del Estado Dominicano (MOPC/INAPA/CPB)"
            >
              <FileStack className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">DOSSIER LICITACIÓN</span>
            </button>

            {/* Task #8: Showroom Kiosk Mode Presentation Button */}
            <button
              type="button"
              onClick={() => setIsKioskOpen(true)}
              className="px-2.5 py-1 rounded-[3px] text-xs font-black uppercase tracking-wider transition-all border flex items-center gap-1.5 cursor-pointer bg-zinc-900 text-amber-400 border-amber-400/40 hover:bg-amber-400 hover:text-black shadow-xs"
              title="Activar Modo Kiosco Pantalla Completa para Salas de Ventas y Ferias"
            >
              <MonitorPlay className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">MODO KIOSCO</span>
            </button>

            {/* Task #66: Nationwide Lowboy Heavy Freight Calculator */}
            <button
              type="button"
              onClick={() => setIsLowboyOpen(true)}
              className="px-2.5 py-1 rounded-[3px] text-xs font-black uppercase tracking-wider transition-all border flex items-center gap-1.5 cursor-pointer bg-zinc-900 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500 hover:text-black shadow-xs"
              title="Cotizar Flete en Cama Baja (Lowboy) a Cualquier Provincia"
            >
              <Truck className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">FLETES LOWBOY</span>
            </button>

            {/* Sorting Select */}
            <div className="flex items-center gap-1.5 bg-zinc-900 px-2 py-1 rounded-[3px] border border-zinc-800 text-xs font-mono">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortOption);
                  setVisibleCount(6);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-zinc-300 font-bold uppercase focus:outline-none cursor-pointer text-[10px]"
              >
                <option value="featured">DESTACADOS TMD</option>
                <option value="price_asc">PRECIO: MENOR A MAYOR</option>
                <option value="price_desc">PRECIO: MAYOR A MENOR</option>
                <option value="power_desc">POTENCIA HP (MAYOR)</option>
                <option value="weight_desc">PESO OPERATIVO (MAYOR)</option>
                <option value="name_asc">NOMBRE (A-Z)</option>
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-zinc-900 p-0.5 rounded-[4px] border border-zinc-800 gap-0.5 font-display">
              <button
                type="button"
                onClick={() => setViewMode('mosaic')}
                className={`p-1.5 rounded-[3px] transition-all cursor-pointer ${
                  viewMode === 'mosaic'
                    ? 'bg-zinc-800 text-amber-400 border border-zinc-700'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Mosaico Industrial"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-[3px] transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-zinc-800 text-amber-400 border border-zinc-700'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Cuadrícula Uniforme"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-[3px] transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-zinc-800 text-amber-400 border border-zinc-700'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Tabla Técnica"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Reset Filters button if active */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-1.5 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-zinc-800 text-xs font-bold transition-colors cursor-pointer"
                title="Limpiar todos los filtros"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ============================================================ */}
      {/* MAIN LAYOUT: ENTERPRISE FILTER SIDEBAR + PRODUCT CARDS       */}
      {/* Both columns start at the EXACT SAME vertical height level   */}
      {/* ============================================================ */}
      <motion.div variants={machineryFadeInItem} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ============================================================ */}
        {/* LEFT COLUMN: ENTERPRISE FILTER SIDEBAR (Desktop Sticky)     */}
        {/* ============================================================ */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-24 self-start space-y-4 font-display">
          <div className="bg-zinc-950 rounded-[5px] border border-zinc-800 p-4 shadow-xl space-y-4">
            
            {/* Sidebar Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-[3px] bg-zinc-900 text-amber-400 border border-zinc-800">
                  <Filter className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-white uppercase tracking-wider block">
                    FILTROS DE FLOTA
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {totalItems} EQUIPOS DISPONIBLES
                  </span>
                </div>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[10px] font-black uppercase tracking-wider text-amber-400 hover:text-amber-300 cursor-pointer"
                >
                  RESTABLECER
                </button>
              )}
            </div>

            {/* INSTANT IN-STOCK TOGGLE */}
            <div className="p-2.5 rounded-[4px] bg-zinc-900 border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${onlyInStock ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse' : 'bg-zinc-600'}`} />
                <span className="text-xs font-black uppercase tracking-wider text-zinc-200">
                  STOCK INMEDIATO (KM 22)
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={onlyInStock}
                onClick={() => {
                  setOnlyInStock(!onlyInStock);
                  setVisibleCount(6);
                  setCurrentPage(1);
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  onlyInStock ? 'bg-emerald-500' : 'bg-zinc-800 border border-zinc-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    onlyInStock ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* BRANDS FILTER SECTION (Accordion Collapsible) */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsBrandFilterOpen(!isBrandFilterOpen)}
                className="w-full flex items-center justify-between mb-2 text-left cursor-pointer group"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider group-hover:text-amber-400 transition-colors">
                    FABRICANTE / MARCA
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono font-black">
                    ({brands.length - 1})
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-400 transition-transform ${isBrandFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {isBrandFilterOpen && (
                <div className="grid grid-cols-2 gap-1.5 animate-in fade-in">
                  {brands.map((b) => {
                    const isActive = selectedBrand === b;
                    const count = brandCounts[b] || 0;
                    if (b !== 'Todas' && count === 0) return null;

                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() => handleBrandChange(b)}
                        className={`px-2.5 py-1.5 rounded-[3px] text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-between border ${
                          isActive
                            ? 'bg-zinc-800 text-amber-400 border-amber-500/80 shadow-xs'
                            : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850'
                        }`}
                      >
                        <span className="truncate">{b === 'Todas' ? 'TODAS' : b}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-[2px] font-mono font-black ${
                          isActive ? 'bg-zinc-950 text-amber-400' : 'bg-zinc-950 text-zinc-400'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* POWER FILTER (HP - Accordion Collapsible) */}
            <div className="pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsPowerFilterOpen(!isPowerFilterOpen)}
                className="w-full flex items-center justify-between mb-2 text-left cursor-pointer group"
              >
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider group-hover:text-amber-400 transition-colors">
                  RANGO DE POTENCIA (HP)
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-400 transition-transform ${isPowerFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {isPowerFilterOpen && (
                <div className="grid grid-cols-2 gap-1.5 text-xs animate-in fade-in">
                  {[
                    { id: 'all', label: 'CUALQUIER HP' },
                    { id: 'under_80', label: '< 80 HP' },
                    { id: '80_150', label: '80 - 150 HP' },
                    { id: '150_250', label: '150 - 250 HP' },
                    { id: 'over_250', label: '> 250 HP' },
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => {
                        setPowerFilter(tier.id as PowerFilter);
                        setVisibleCount(6);
                        setCurrentPage(1);
                      }}
                      className={`px-2.5 py-1.5 rounded-[3px] text-[10px] font-black uppercase tracking-wider text-center transition-all cursor-pointer border ${
                        powerFilter === tier.id
                          ? 'bg-zinc-800 text-amber-400 border-amber-500/80 shadow-xs'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-850'
                      }`}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* OFFICIAL TMD WORKSHOP & SERVICES CARD */}
            <div className="pt-3 border-t border-zinc-800">
              <div className="p-3 rounded-[4px] bg-zinc-900 border border-zinc-800 text-xs">
                <div className="flex items-center gap-1.5 font-black uppercase tracking-wider text-white mb-1">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>RESPALDO OFICIAL TMD</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed mb-2.5 font-sans">
                  Taller central Km 22 Autopista Duarte. Servicio móvil SOS 24/7 en las 32 provincias de RD.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('#/parts')}
                    className="flex-1 py-1.5 px-2 rounded-[3px] bg-zinc-950 hover:bg-zinc-850 text-amber-400 font-black uppercase tracking-wider text-[10px] border border-zinc-800 text-center transition-colors cursor-pointer"
                  >
                    REPUESTOS OEM
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('#/rental')}
                    className="flex-1 py-1.5 px-2 rounded-[3px] bg-zinc-950 hover:bg-zinc-850 text-zinc-300 hover:text-white font-black uppercase tracking-wider text-[10px] border border-zinc-800 text-center transition-colors cursor-pointer"
                  >
                    FLOTA RENTA
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: PRODUCT CARDS GRID (9 cols)                   */}
        {/* Starts DIRECTLY at the exact initial height of the sidebar  */}
        {/* ============================================================ */}
        <main className="lg:col-span-9 space-y-5 font-display">
          
          {/* DYNAMIC MACHINERY GRID / TABLE CONTENT */}
          <div>
            <AnimatePresence mode="wait">
              {isLoading ? (
                <MachineryGridSkeleton key="skeleton" count={navigationMode === 'load_more' ? visibleCount : itemsPerPage} />
              ) : displayedMachines.length === 0 ? (
                <motion.div
                  key="empty-results"
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-16 bg-zinc-950 rounded-[5px] border border-zinc-800 p-8 shadow-xl"
                >
                  <HardHat className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                    NO SE ENCONTRARON MODELOS CON ESTOS FILTROS
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto font-sans">
                    Intenta seleccionando otra categoría o limpiando la búsqueda para ver la flota completa disponible.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs rounded-[3px] transition-all cursor-pointer shadow-md"
                  >
                    RESTABLECER FILTROS
                  </button>
                </motion.div>
              ) : viewMode === 'table' ? (
                /* INDUSTRIAL HIGH-DENSITY SCANNING TABLE VIEW */
                <motion.div
                  key={`table-${filterKey}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.28 }}
                  className="bg-zinc-950 rounded-[5px] border border-zinc-800 overflow-hidden shadow-xl"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px] font-black">
                        <tr>
                          <th className="py-3 px-4">EQUIPO / MODELO</th>
                          <th className="py-3 px-3">MARCA</th>
                          <th className="py-3 px-3">CATEGORÍA</th>
                          <th className="py-3 px-3">POTENCIA</th>
                          <th className="py-3 px-3">PESO</th>
                          <th className="py-3 px-3 text-right">INVERSIÓN DESDE</th>
                          <th className="py-3 px-4 text-center">ACCIONES</th>
                        </tr>
                      </thead>
                      <motion.tbody 
                        variants={machineryTableStaggerVariants}
                        initial="hidden"
                        animate="visible"
                        className="divide-y divide-zinc-800"
                      >
                        {displayedMachines.map((machine) => (
                          <MachineTableRow
                            key={machine.id}
                            machine={machine}
                            formatEquiposPrice={formatEquiposPrice}
                            showMonthlyLeasing={showMonthlyLeasing}
                            getMonthlyLeasingEstimate={getMonthlyLeasingEstimate}
                            handleOpenSpecs={handleOpenSpecs}
                            setQrModalMachine={setQrModalMachine}
                            setActive360Tab={setActive360Tab}
                            setActive360Machine={setActive360Machine}
                            addMachineToQuote={addMachineToQuote}
                            onNavigate={onNavigate}
                          />
                        ))}
                      </motion.tbody>
                    </table>
                  </div>
                </motion.div>
              ) : (
                /* RESPONSIVE SMART INDUSTRIAL MOSAIC GRID */
                <MachineryMosaicGrid
                  key={`mosaic-${filterKey}`}
                  machines={displayedMachines}
                  layoutMode={viewMode === 'grid' ? 'uniform' : 'mosaic'}
                  isComparing={isComparing}
                  toggleMachineCompare={toggleMachineCompare}
                  handleOpenSpecs={handleOpenSpecs}
                  setActive360Machine={setActive360Machine}
                  setActive360Tab={setActive360Tab}
                  setQrModalMachine={setQrModalMachine}
                  setCustomizerMachine={setCustomizerMachine}
                  setCalculatorMachine={setCalculatorMachine}
                  addMachineToQuote={addMachineToQuote}
                  onNavigate={onNavigate}
                  formatEquiposPrice={formatEquiposPrice}
                  showMonthlyLeasing={showMonthlyLeasing}
                  getMonthlyLeasingEstimate={getMonthlyLeasingEstimate}
                />
              )}
            </AnimatePresence>
          </div>

          {/* ============================================================ */}
          {/* LOAD MORE TRIGGER OR PAGINATION CONTROLS                     */}
          {/* ============================================================ */}
          {navigationMode === 'load_more' ? (
            /* Progressive Load More Trigger */
            totalItems > 0 && (
              <div className="mt-6 p-4 rounded-[5px] bg-zinc-950 border border-zinc-800 text-center space-y-3 shadow-xl">
                <div className="max-w-md mx-auto space-y-1.5 font-mono">
                  <div className="flex justify-between text-xs text-zinc-400 font-bold uppercase">
                    <span>MOSTRANDO {Math.min(visibleCount, totalItems)} DE {totalItems} MODELOS</span>
                    <span>{Math.round((Math.min(visibleCount, totalItems) / totalItems) * 100)}%</span>
                  </div>
                  {/* Visual Progress Bar */}
                  <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <div 
                      className="h-full bg-amber-400 transition-all duration-300"
                      style={{ width: `${(Math.min(visibleCount, totalItems) / totalItems) * 100}%` }}
                    />
                  </div>
                </div>

                {visibleCount < totalItems ? (
                  <div className="flex items-center justify-center gap-2 pt-1 flex-wrap font-display">
                    <button
                      type="button"
                      disabled={isLoadingMore}
                      onClick={handleLoadMore}
                      className="px-6 py-2.5 rounded-[3px] bg-amber-500 hover:bg-amber-400 active:scale-98 text-black font-black uppercase tracking-wider text-xs transition-all cursor-pointer shadow-md flex items-center gap-2"
                    >
                      {isLoadingMore ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-black" />
                          <span>CARGANDO MODELOS...</span>
                        </>
                      ) : (
                        <>
                          <span>CARGAR MÁS MODELOS (+{Math.min(6, totalItems - visibleCount)})</span>
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleShowAll}
                      className="px-4 py-2.5 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-black uppercase tracking-wider text-xs border border-zinc-800 transition-all cursor-pointer"
                    >
                      MOSTRAR TODOS ({totalItems})
                    </button>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-black uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>TODOS LOS {totalItems} MODELOS CERTIFICADOS ESTÁN VISIBLES</span>
                  </span>
                )}
              </div>
            )
          ) : (
            /* Traditional Pagination Controls */
            totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-[5px] bg-zinc-950 border border-zinc-800 shadow-xl font-display">
                <div className="text-xs text-zinc-400 font-mono uppercase font-bold">
                  PÁGINA <strong className="text-white">{validPage}</strong> DE <strong className="text-white">{totalPages}</strong> ({totalItems} MODELOS)
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange(validPage - 1)}
                    disabled={validPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-[3px] border border-zinc-800 bg-zinc-900 text-xs font-black uppercase tracking-wider text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>ANTERIOR</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 rounded-[3px] text-xs font-mono font-black transition-all cursor-pointer ${
                        validPage === page
                          ? 'bg-amber-500 text-black shadow-md'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(validPage + 1)}
                    disabled={validPage === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-[3px] border border-zinc-800 bg-zinc-900 text-xs font-black uppercase tracking-wider text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    <span>SIGUIENTE</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          )}
        </main>
      </motion.div>

      {/* MOBILE FILTERS DRAWER */}
      {isMobileFiltersOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 font-display">
          <div className="w-full max-w-lg bg-zinc-950 rounded-t-[5px] sm:rounded-[5px] max-h-[85vh] overflow-y-auto p-5 border border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-4 h-4 text-amber-400" />
                <span>FILTRAR MAQUINARIA</span>
              </h3>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-1 rounded-[3px] text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stock Inmediato Toggle */}
            <div className="p-3 rounded-[4px] bg-zinc-900 border border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-200">
                STOCK INMEDIATO (KM 22)
              </span>
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 accent-amber-500"
              />
            </div>

            {/* Categories */}
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-300 block mb-2">
                FAMILIAS DE EQUIPOS:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-3 py-2 rounded-[3px] text-xs font-black uppercase tracking-wider text-left truncate border ${
                      selectedCategory === cat
                        ? 'bg-zinc-800 text-amber-400 border-amber-500/80 shadow-xs'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-300 block mb-2">
                MARCAS OFICIALES:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => handleBrandChange(b)}
                    className={`px-2.5 py-1.5 rounded-[3px] text-xs font-black uppercase tracking-wider border ${
                      selectedBrand === b
                        ? 'bg-zinc-800 text-amber-400 border-amber-500/80 shadow-xs'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-800'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Power (HP) */}
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-300 block mb-2">
                POTENCIA (HP):
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'all', label: 'CUALQUIER HP' },
                  { id: 'under_80', label: '< 80 HP' },
                  { id: '80_150', label: '80 - 150 HP' },
                  { id: '150_250', label: '150 - 250 HP' },
                  { id: 'over_250', label: '> 250 HP' },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setPowerFilter(tier.id as PowerFilter)}
                    className={`px-2.5 py-1.5 rounded-[3px] text-xs font-black uppercase tracking-wider border ${
                      powerFilter === tier.id
                        ? 'bg-zinc-800 text-amber-400 border-amber-500/80 shadow-xs'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-800'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex gap-2 font-display">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-2.5 rounded-[3px] bg-zinc-900 text-xs font-black uppercase tracking-wider text-zinc-300 border border-zinc-800 hover:text-white cursor-pointer"
              >
                LIMPIAR TODO
              </button>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="flex-1 py-2.5 rounded-[3px] bg-amber-500 text-black text-xs font-black uppercase tracking-wider cursor-pointer shadow-md"
              >
                APLICAR ({totalItems})
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Industrial Separator: Financial Suite */}
      <div className="mt-12">
        <IndustrialSectionDivider badge="Simulador Financiero & Leasing" />
      </div>

      {/* Featured Financing Calculator Section */}
      <div className="mt-6">
        <MachineryFinancingCalculator onOpenDetailedEstimate={(m) => handleOpenEstimate(m)} />
      </div>

      {/* Industrial Separator: Field Demonstrations */}
      <div className="mt-10">
        <IndustrialSectionDivider badge="Demostraciones en Canteras Dominicanas" />
      </div>

      {/* Dominican Operational Videos & Quarry Demonstrations */}
      <div id="dominican-videos-section" className="mt-6 scroll-mt-24">
        <DominicanOperationalVideos
          onScheduleTestDrive={() => {
            setTestDriveMachine(null);
            setIsTestDriveOpen(true);
          }}
        />
      </div>

      {/* Comprehensive Machine Detail Studio Modal */}
      <MachineDetailStudioModal
        machine={activeModalMachine}
        isOpen={Boolean(activeModalMachine)}
        onClose={handleCloseSpecs}
        onNavigate={onNavigate}
        onOpen360={(m) => {
          setActive360Machine(m);
        }}
        onOpenQr={(m) => {
          setQrModalMachine(m);
        }}
      />

      {/* Machine 360 View & Video Modal */}
      {active360Machine && (
        <Machine360Modal
          machine={active360Machine}
          initialTab={active360Tab}
          isOpen={true}
          onClose={() => setActive360Machine(null)}
          onNavigate={onNavigate}
        />
      )}

      {/* Machine Quick Financing Calculator Modal */}
      {calculatorMachine && (
        <MachineQuickCalculatorModal
          machine={calculatorMachine}
          isOpen={true}
          onClose={() => setCalculatorMachine(null)}
          onNavigate={onNavigate}
        />
      )}

      {/* Machine Customizer Modal */}
      {customizerMachine && (
        <MachineCustomizerModal
          machine={customizerMachine}
          isOpen={true}
          onClose={() => setCustomizerMachine(null)}
          onNavigate={onNavigate}
        />
      )}

      {/* Machine QR Code Modal */}
      {qrModalMachine && (
        <ProductQrCodeModal
          isOpen={true}
          onClose={() => setQrModalMachine(null)}
          type="machinery"
          product={qrModalMachine}
        />
      )}

      {/* Export Catalog PDF Modal */}
      <ExportCatalogPdfModal
        isOpen={isExportPdfOpen}
        onClose={() => setIsExportPdfOpen(false)}
        type="machinery"
        activeCategory={selectedCategory}
        activeBrand={selectedBrand}
        machines={filteredAndSortedMachines}
      />

      {/* Public Tenders Dossier Exporter (Task #74) */}
      <TenderDossierExporterModal
        isOpen={isTenderDossierOpen}
        onClose={() => setIsTenderDossierOpen(false)}
        initialSelectedMachineIds={filteredAndSortedMachines.slice(0, 4).map(m => m.id)}
      />

      {/* Test Drive Booking Modal */}
      {isTestDriveOpen && (
        <TestDriveBookingModal
          preselectedMachine={testDriveMachine}
          isOpen={true}
          onClose={() => setIsTestDriveOpen(false)}
        />
      )}

      {/* Public LiveLink Telematics Simulator Modal */}
      <PublicLiveLinkSimulatorModal
        isOpen={isLiveLinkModalOpen}
        onClose={() => setIsLiveLinkModalOpen(false)}
        onNavigate={onNavigate}
      />


      {/* Task #18: Multifacet Collapsible Accordion Filter Drawer */}
      <MachineryFacetFilterDrawer
        isOpen={isFacetDrawerOpen}
        onClose={() => setIsFacetDrawerOpen(false)}
        filters={facetFilters}
        onChange={setFacetFilters}
        onReset={() => setFacetFilters({ brands: [], tonnageRange: [], powerRange: [], fuelTypes: [], availability: [] })}
        totalFilteredCount={totalItems}
      />

      {/* Task #8: Showroom Kiosk Presentation Modal */}
      <ShowroomKioskModeModal
        isOpen={isKioskOpen}
        onClose={() => setIsKioskOpen(false)}
        onSelectMachine={(machineId) => {
          const found = MACHINES_DATA.find(m => m.id === machineId);
          if (found) {
            setActiveModalMachine(found);
          }
        }}
      />

      {/* Task #66: Lowboy Heavy Equipment Freight Calculator Modal */}
      <LowboyFreightCalculatorModal
        isOpen={isLowboyOpen}
        onClose={() => setIsLowboyOpen(false)}
        machineName={filteredAndSortedMachines[0]?.name || 'LiuGong 922E HD'}
        machineWeightTon={filteredAndSortedMachines[0]?.operatingWeightKg ? Math.round(filteredAndSortedMachines[0].operatingWeightKg / 1000) : 22}
      />

      {/* Task #7: Machine Exploded View & 3D Mechanical Layers Modal */}
      <MachineExplodedViewModal
        isOpen={isExplodedViewOpen}
        onClose={() => setIsExplodedViewOpen(false)}
        machineName={activeModalMachine?.name || MACHINES_DATA[0]?.name}
        machineModel={activeModalMachine?.modelCode || MACHINES_DATA[0]?.modelCode}
      />

      {/* Task #91: Machine Real Field Test Drive Booking Modal */}
      <MachineTestDriveModal
        isOpen={isPatioDemoOpen}
        onClose={() => setIsPatioDemoOpen(false)}
        defaultMachineName={activeModalMachine?.name || MACHINES_DATA[0]?.name}
        defaultBrand={activeModalMachine?.brand || MACHINES_DATA[0]?.brand}
      />

    </motion.div>
  );
});

MachineryView.displayName = 'MachineryView';
