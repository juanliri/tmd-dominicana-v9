import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  Cog, 
  ShoppingCart, 
  CheckCircle, 
  Clock, 
  Truck, 
  X, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  Package, 
  Layers, 
  Crosshair, 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronUp,
  RefreshCw, 
  QrCode, 
  FileDown, 
  FileText,
  LayoutGrid, 
  List, 
  ArrowUpDown,
  Filter,
  Flame,
  Building2,
  Wrench,
  Sliders,
  Download,
  Printer,
  RotateCcw,
  Tag
} from 'lucide-react';
import { PARTS_DATA } from '../data/parts';
import { Part, AssemblyType } from '../types';
import { getUnifiedStoreParts } from '../services/cdnCatalogLoader';
import { useCart } from '../context/CartContext';
import { InteractiveSchematicViewer } from './InteractiveSchematicViewer';
import { SCHEMATIC_MACHINES } from '../data/schematics';
import { PartsGridSkeleton } from './skeletons';
import { ProductQrCodeModal } from './ProductQrCodeModal';
import { ExportCatalogPdfModal } from './ExportCatalogPdfModal';
import { PartsMosaicGrid, PartsLayoutMode } from './parts/PartsMosaicGrid';
import { HighDemandPartsSection } from './HighDemandPartsSection';
import { IndustrialSectionDivider } from './common/IndustrialSectionDivider';
import { LastScannedBadge } from './common/LastScannedBadge';
import { RecentlyVerifiedBadge } from './common/RecentlyVerifiedBadge';
import { InventoryAuditTrail } from './common/InventoryAuditTrail';
import { InventoryLabelPdfModal } from './common/InventoryLabelPdfModal';
import { WarehouseBinLabelModal } from './common/WarehouseBinLabelModal';
import { RemanExchangeCatalogModal } from './reman/RemanExchangeCatalogModal';
import { CriticalStockReorderModal } from './parts/CriticalStockReorderModal';
import { MobileTruckInventoryModal } from './parts/MobileTruckInventoryModal';
import { TextHighlight } from './common/TextHighlight';
import { downloadProductQrCode } from '../utils/qrExporter';

interface PartsViewProps {
  onNavigate: (route: string) => void;
  selectedPartId?: string | null;
  onClearSelectedPart?: () => void;
}

type ViewMode = 'mosaic' | 'grid' | 'table';
type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'code_asc' | 'name_asc';

interface PartTableRowProps {
  part: Part;
  formatPrice: (usdPrice: number) => string;
  setActivePartDetail: (part: Part) => void;
  setQrModalPart: (part: Part) => void;
  addToCart: (part: Part) => void;
  searchTerm?: string;
}

const PartTableRow = React.memo<PartTableRowProps>(({
  part,
  formatPrice,
  setActivePartDetail,
  setQrModalPart,
  addToCart,
  searchTerm
}) => {
  return (
    <tr
      className="hover:bg-amber-500/5 dark:hover:bg-zinc-800/50 transition-colors group font-display"
    >
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <img
            src={part.image}
            alt={part.name}
            className="w-10 h-10 object-cover rounded-[3px] bg-zinc-800 shrink-0 group-hover:scale-105 transition-transform"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('tmd_coming_soon')) {
                target.src = '/images/tmd_coming_soon.jpg';
              }
            }}
          />
          <div>
            <span className="font-black text-white text-xs uppercase tracking-tight block group-hover:text-amber-400 transition-colors">
              <TextHighlight text={part.name} query={searchTerm} />
            </span>
            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
              PN: <TextHighlight text={part.partNumber} query={searchTerm} />
            </span>
          </div>
        </div>
      </td>
      <td className="py-3 px-3">
        <span className="px-2 py-0.5 rounded-[3px] bg-zinc-900 border border-zinc-800 font-mono font-bold text-amber-400 text-[10px] uppercase">
          {part.brand}
        </span>
      </td>
      <td className="py-3 px-3 text-zinc-300 text-xs font-bold uppercase">
        {part.category}
      </td>
      <td className="py-3 px-3 text-zinc-400 text-xs font-mono max-w-[160px] truncate uppercase font-bold">
        {part.compatibleModels.join(', ')}
      </td>
      <td className="py-3 px-3">
        {part.stockQty > 0 ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 uppercase">
            <Check className="w-3 h-3 text-emerald-400" />
            <span>DISPONIBLE ({part.stockQty})</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400 uppercase">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>3-5 DÍAS</span>
          </span>
        )}
      </td>
      <td className="py-3 px-3 text-right">
        <span className="font-mono font-black text-white text-xs block">
          {formatPrice(part.priceUsd)}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center justify-center gap-1.5 font-display">
          <button
            onClick={() => setActivePartDetail(part)}
            className="px-2.5 py-1.5 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors"
          >
            FICHA
          </button>
          <RecentlyVerifiedBadge
            itemId={part.id}
            itemCode={part.partNumber}
            itemType="part"
            variant="card-badge"
          />
          <button
            type="button"
            onClick={async () => {
              await downloadProductQrCode(part, 'part');
            }}
            className="p-1.5 rounded-[3px] bg-zinc-900 hover:bg-amber-400 hover:text-black text-amber-400 border border-zinc-800 transition-colors cursor-pointer flex items-center gap-1"
            title="Descargar Rótulo QR para etiquetado de anaquel"
            aria-label={`Exportar QR para ${part.name}`}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[9px] font-mono font-bold">EXPORT QR</span>
          </button>
          <button
            type="button"
            onClick={() => setQrModalPart(part)}
            className="p-1.5 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 hover:text-amber-400 text-zinc-300 border border-zinc-800 transition-colors cursor-pointer"
            title="Generar Código QR para Celular / Anaquel"
            aria-label={`Código QR para ${part.name}`}
          >
            <QrCode className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => addToCart(part)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-[10px] transition-colors shadow-xs cursor-pointer"
          >
            <ShoppingCart className="w-3 h-3" />
            <span>AÑADIR</span>
          </button>
        </div>
      </td>
    </tr>
  );
});
PartTableRow.displayName = 'PartTableRow';

export const PartsView = React.memo<PartsViewProps>(({
  onNavigate,
  selectedPartId,
  onClearSelectedPart
}) => {
  const { addToCart, formatPrice, currency, setCurrency } = useCart();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedBrand, setSelectedBrand] = useState<string>('Todas');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'in_stock' | 'express'>('all');
  const [selectedAssemblyId, setSelectedAssemblyId] = useState<AssemblyType | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [viewMode, setViewMode] = useState<ViewMode>('mosaic');
  const [navigationMode, setNavigationMode] = useState<'load_more' | 'pagination'>('load_more');
  const [visibleCount, setVisibleCount] = useState<number>(8);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showSchematic, setShowSchematic] = useState<boolean>(false);
  const [isLoadingParts, setIsLoadingParts] = useState<boolean>(true);
  const [isSyncingStock, setIsSyncingStock] = useState<boolean>(false);
  const [qrModalPart, setQrModalPart] = useState<Part | null>(null);
  const [labelPdfPart, setLabelPdfPart] = useState<Part | null>(null);
  const [binLabelPart, setBinLabelPart] = useState<Part | null>(null);
  const [isRemanModalOpen, setIsRemanModalOpen] = useState<boolean>(false);
  const [isCriticalStockOpen, setIsCriticalStockOpen] = useState<boolean>(false);
  const [isMobileTruckOpen, setIsMobileTruckOpen] = useState<boolean>(false);
  const [isExportPdfOpen, setIsExportPdfOpen] = useState<boolean>(false);



  const partsTopRef = useRef<HTMLDivElement>(null);
  const partsNavScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollState = () => {
    if (partsNavScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = partsNavScrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  const scrollPartsNav = (direction: 'left' | 'right') => {
    if (partsNavScrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      partsNavScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    checkScrollState();
    const el = partsNavScrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollState, { passive: true });
      window.addEventListener('resize', checkScrollState);
      return () => {
        el.removeEventListener('scroll', checkScrollState);
        window.removeEventListener('resize', checkScrollState);
      };
    }
  }, []);

  // Initial load skeleton simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingParts(false);
    }, 240);
    return () => clearTimeout(timer);
  }, []);

  // Sync category or brand from URL hash (e.g. #/parts?category=Filtros)
  useEffect(() => {
    const handleUrlFilters = () => {
      const fullHash = window.location.hash || '';
      const [, queryString] = fullHash.split('?');
      if (queryString) {
        const params = new URLSearchParams(queryString);
        const c = params.get('category');
        const b = params.get('brand');
        if (c) setSelectedCategory(c);
        if (b) setSearchTerm(b);
      }
    };
    handleUrlFilters();
    window.addEventListener('hashchange', handleUrlFilters);
    return () => window.removeEventListener('hashchange', handleUrlFilters);
  }, []);

  // Update active part detail if selectedPartId is passed/updated via URL or search
  useEffect(() => {
    if (selectedPartId) {
      const found = getUnifiedStoreParts().find((p) => p.id === selectedPartId);
      if (found) {
        setActivePartDetail(found);
      }
    }
  }, [selectedPartId]);

  const handleCategorySelect = useCallback((category: string) => {
    if (category === selectedCategory) return;
    setIsLoadingParts(true);
    setSelectedCategory(category);
    setVisibleCount(8);
    setCurrentPage(1);
    setTimeout(() => setIsLoadingParts(false), 200);
  }, [selectedCategory]);

  const handleAssemblySelect = useCallback((assemblyId: AssemblyType | null) => {
    setIsLoadingParts(true);
    setSelectedAssemblyId(assemblyId);
    setVisibleCount(8);
    setCurrentPage(1);
    if (assemblyId) {
      setSelectedCategory('Todos');
    }
    setTimeout(() => setIsLoadingParts(false), 200);
  }, []);

  const handleRefreshStock = useCallback(() => {
    setIsSyncingStock(true);
    setIsLoadingParts(true);
    setTimeout(() => {
      setIsLoadingParts(false);
      setIsSyncingStock(false);
    }, 350);
  }, []);

  // Master Unified Parts Dataset (CDN Scripts + Local DB)
  const allStoreParts = useMemo(() => {
    return getUnifiedStoreParts();
  }, [isSyncingStock]);

  const [activePartDetail, setActivePartDetail] = useState<Part | null>(() => {
    if (selectedPartId) {
      return getUnifiedStoreParts().find((p) => p.id === selectedPartId) || null;
    }
    return null;
  });

  const categories = [
    'Todos',
    'Filtros',
    'Tren de Rodaje',
    'Hidráulica',
    'Motor Diesel',
    'Desgaste y Balde',
    'Lubricantes',
    'Extinción de Incendios',
    'Concreto',
    'Implementos'
  ];

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 'Todos': allStoreParts.length };
    categories.forEach(cat => {
      if (cat !== 'Todos') {
        counts[cat] = allStoreParts.filter(p => p.category === cat).length;
      }
    });
    return counts;
  }, [allStoreParts]);

  const partsCategoryNavItems = useMemo(() => [
    { id: 'Todos', name: 'Todos los Repuestos', icon: Package },
    { id: 'Filtros', name: 'Filtros & Mantenimiento', icon: Filter },
    { id: 'Tren de Rodaje', name: 'Tren de Rodaje & Orugas', icon: Layers },
    { id: 'Hidráulica', name: 'Bombas & Hidráulica', icon: Sliders },
    { id: 'Motor Diesel', name: 'Motor Diesel & Turbo', icon: Cog },
    { id: 'Desgaste y Balde', name: 'Dientes & Balde', icon: ShieldCheck },
    { id: 'Lubricantes', name: 'Aceites & Lubricantes', icon: CheckCircle },
    { id: 'Extinción de Incendios', name: 'Contra Incendios', icon: Flame },
    { id: 'Concreto', name: 'Plantas de Concreto', icon: Building2 },
    { id: 'Implementos', name: 'Implementos & Acoples', icon: Wrench },
  ], []);

  const assemblyLabels: Record<AssemblyType, string> = {
    powertrain: 'Motor Diésel & Turbo',
    hydraulics: 'Sistema Hidráulico',
    boom_bucket: 'Pluma, Brazo y Balde',
    undercarriage: 'Tren de Rodaje & Orugas',
    cab_electric: 'Cabina & Mandos Eléctricos',
    transmission: 'Transmisión & Embragues'
  };

  const filteredAndSortedParts = useMemo(() => {
    const list = allStoreParts.filter((p) => {
      const matchAssembly = !selectedAssemblyId || p.assemblyId === selectedAssemblyId;
      const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
      const matchBrand = selectedBrand === 'Todas' || p.brand.toLowerCase() === selectedBrand.toLowerCase();
      const matchAvailability = 
        availabilityFilter === 'all' 
          ? true 
          : availabilityFilter === 'in_stock' 
            ? p.stockQty > 0 
            : p.stockQty <= 0;

      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        p.name.toLowerCase().includes(q) ||
        p.partNumber.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.compatibleModels.some((m) => m.toLowerCase().includes(q));

      return matchAssembly && matchCat && matchBrand && matchAvailability && matchSearch;
    });

    return list.sort((a, b) => {
      if (sortBy === 'price_asc') return a.priceUsd - b.priceUsd;
      if (sortBy === 'price_desc') return b.priceUsd - a.priceUsd;
      if (sortBy === 'code_asc') return a.partNumber.localeCompare(b.partNumber);
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      return 0; // relevance
    });
  }, [allStoreParts, selectedCategory, selectedBrand, availabilityFilter, searchTerm, selectedAssemblyId, sortBy]);

  // Slicing and display logic (Load More vs Pagination)
  const totalItems = filteredAndSortedParts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const validPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (validPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const displayedParts = useMemo(() => {
    if (navigationMode === 'load_more') {
      return filteredAndSortedParts.slice(0, visibleCount);
    }
    return filteredAndSortedParts.slice(startIndex, endIndex);
  }, [filteredAndSortedParts, navigationMode, visibleCount, startIndex, endIndex]);

  const handleLoadMore = useCallback(() => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 8, totalItems));
      setIsLoadingMore(false);
    }, 180);
  }, [totalItems]);

  const handleShowAll = useCallback(() => {
    setVisibleCount(totalItems);
  }, [totalItems]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    if (partsTopRef.current) {
      partsTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleResetFilters = useCallback(() => {
    setSelectedCategory('Todos');
    setSelectedBrand('Todas');
    setAvailabilityFilter('all');
    setSelectedAssemblyId(null);
    setSearchTerm('');
    setSortBy('relevance');
    setVisibleCount(8);
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = selectedCategory !== 'Todos' || selectedBrand !== 'Todas' || availabilityFilter !== 'all' || selectedAssemblyId !== null || searchTerm !== '';

  return (
    <div ref={partsTopRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header Banner - Synced with Home Luxury Industrial Style */}
      <div className="mb-6 bg-zinc-950 border border-zinc-800 rounded-[5px] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden font-display">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[3px] bg-zinc-900 border border-zinc-800 text-amber-400 type-badge">
              <Cog className="w-3.5 h-3.5 text-amber-400" />
              <span>CENTRO DE DISTRIBUCIÓN OEM • KM 22 AUTOPISTA DUARTE</span>
            </div>
            <h1 className="text-2xl sm:text-4xl type-section-title text-white">
              REPUESTOS GENUINOS & <span className="text-amber-400">FILTRACIÓN CERTIFICADA</span>
            </h1>
            <p className="text-xs sm:text-sm type-body text-zinc-400 max-w-2xl leading-relaxed font-sans">
              Más de 40,000 números de parte en inventario físico para JCB, Donaldson, Fleetguard, LiuGong, Ammann y Cummins con despacho express en 24h a toda República Dominicana.
            </p>

            {/* Quick Brand Badges */}
            <div className="flex flex-wrap gap-2 pt-1 type-badge">
              <span className="bg-zinc-900 px-2.5 py-1 rounded-[3px] text-amber-400 border border-zinc-800">JCB GENUINE</span>
              <span className="bg-zinc-900 px-2.5 py-1 rounded-[3px] text-white border border-zinc-800">DONALDSON BLUE®</span>
              <span className="bg-zinc-900 px-2.5 py-1 rounded-[3px] text-amber-400 border border-zinc-800">FLEETGUARD CUMMINS</span>
              <span className="bg-zinc-900 px-2.5 py-1 rounded-[3px] text-white border border-zinc-800">LIUGONG OEM</span>
              <span className="bg-zinc-900 px-2.5 py-1 rounded-[3px] text-zinc-300 border border-zinc-800">COMPROBANTE NCF B01</span>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap font-display">
            <button
              type="button"
              onClick={handleRefreshStock}
              disabled={isSyncingStock}
              title="Sincronizar inventario en tiempo real del Almacén Km 22"
              className="px-3 py-2 rounded-[3px] text-[11px] font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border bg-zinc-900 text-zinc-200 border-zinc-800 hover:bg-zinc-800 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isSyncingStock ? 'animate-spin' : ''}`} />
              <span>{isSyncingStock ? 'SINCRONIZANDO...' : 'ACTUALIZAR STOCK'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExportPdfOpen(true)}
              className="px-3 py-2 rounded-[3px] text-[11px] font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-800 shadow-xs"
            >
              <FileDown className="w-3.5 h-3.5 text-amber-400" />
              <span>EXPORTAR PDF</span>
            </button>

            {/* Task #90: TMD Reman Heavy Component Core Exchange */}
            <button
              type="button"
              onClick={() => setIsRemanModalOpen(true)}
              className="px-3 py-2 rounded-[3px] text-[11px] font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-xs"
              title="Programa Core Exchange con componentes remanufacturados y 12m garantía"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>REMAN (-45%)</span>
            </button>

            {/* Sprint 9 Task #92: Automated Reorder Points & Critical Stock Management */}
            <button
              type="button"
              onClick={() => setIsCriticalStockOpen(true)}
              className="px-3 py-2 rounded-[3px] text-[11px] font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border-amber-400/30 shadow-xs"
              title="Monitoreo de Puntos de Reorden y Generador de Órdenes de Compra (PO)"
            >
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>REORDEN STOCK</span>
            </button>

            {/* Task #99: Mobile Service Truck Inventory Sync */}
            <button
              type="button"
              onClick={() => setIsMobileTruckOpen(true)}
              className="px-3 py-2 rounded-[3px] text-[11px] font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-800 shadow-xs"
              title="Control de inventario en camionetas móviles 4x4 y sincronización con almacén Km 22"
            >
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span>STOCK CAMIONETAS 4X4</span>
            </button>

            {/* Task #85: Warehouse Shelf Bin Label Generator (Zebra / Avery 100x50mm) */}
            <button
              type="button"
              onClick={() => {
                if (filteredAndSortedParts.length > 0) {
                  setBinLabelPart(filteredAndSortedParts[0]);
                }
              }}
              className="px-3 py-2 rounded-[3px] text-[11px] font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-800 shadow-xs"
              title="Generar rótulos autoadhesivos Zebra/Avery 100x50mm para racks de almacén"
            >
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              <span>RÓTULOS ZEBRA</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSchematic(!showSchematic)}
              className={`px-3 py-2 rounded-[3px] text-[11px] font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                showSchematic
                  ? 'bg-zinc-800 text-amber-400 border border-amber-500/80 shadow-md'
                  : 'bg-amber-500 hover:bg-amber-400 text-black'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>{showSchematic ? 'OCULTAR ESQUEMA' : 'ESQUEMA INTERACTIVO'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Schematic Viewer */}
      {showSchematic && (
        <div className="mb-6">
          <InteractiveSchematicViewer
            selectedAssemblyId={selectedAssemblyId}
            onSelectAssembly={(assemblyId) => handleAssemblySelect(assemblyId)}
            onSelectPartDetail={(part) => setActivePartDetail(part)}
          />
        </div>
      )}

      {/* ============================================================ */}
      {/* HORIZONTAL SCROLLABLE CATEGORY NAVIGATION BAR                */}
      {/* ============================================================ */}
      <div className="relative mb-6">
        <div className="flex items-center justify-between gap-2 mb-2 px-1 font-display">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-zinc-300">
            <Package className="w-3.5 h-3.5 text-amber-400" />
            <span>CATEGORÍAS DE REPUESTOS OEM</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline uppercase">
            DESLIZA PARA NAVEGAR POR CATEGORÍA
          </span>
        </div>

        <div className="relative bg-zinc-950 rounded-[5px] border border-zinc-800 p-2 shadow-sm">
            {/* Left scroll button */}
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => scrollPartsNav('left')}
                aria-label="Desplazar categorías hacia la izquierda"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-[3px] bg-zinc-900 text-zinc-200 border border-zinc-700 shadow-lg flex items-center justify-center hover:bg-zinc-800 hover:text-amber-400 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Left edge shadow gradient fade */}
            {canScrollLeft && (
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none rounded-l-[5px]" />
            )}

            {/* Scrollable Track */}
            <div
              ref={partsNavScrollRef}
              className="flex items-center gap-2 overflow-x-auto scroll-smooth py-1 px-1 scrollbar-none font-display"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {partsCategoryNavItems.map((item) => {
                const isActive = selectedCategory === item.id;
                const count = categoryCounts[item.id] || 0;
                const IconComponent = item.icon;

                return (
                  <button
                    key={item.id}
                    id={`parts-nav-btn-${item.id}`}
                    type="button"
                    onClick={() => {
                      handleCategorySelect(item.id);
                      const el = document.getElementById(`parts-nav-btn-${item.id}`);
                      if (el && partsNavScrollRef.current) {
                        el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                      }
                    }}
                    className={`group/btn flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-xs font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer select-none border ${
                      isActive
                        ? 'bg-zinc-800 text-amber-400 border-amber-500/80 shadow-md scale-[1.01]'
                        : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className={`p-1 rounded-[3px] transition-colors ${
                      isActive
                        ? 'bg-zinc-950 text-amber-400 border border-zinc-800'
                        : 'bg-zinc-950 text-zinc-400 group-hover/btn:text-amber-400'
                    }`}>
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>

                    <span className="whitespace-nowrap tracking-tight">{item.name.toUpperCase()}</span>

                    <span className={`text-[9px] px-1.5 py-0.5 rounded-[3px] font-mono font-black ${
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

            {/* Right edge shadow gradient fade */}
            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none rounded-r-[5px]" />
            )}

            {/* Right scroll button */}
            {canScrollRight && (
              <button
                type="button"
                onClick={() => scrollPartsNav('right')}
                aria-label="Desplazar categorías hacia la derecha"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-[3px] bg-zinc-900 text-zinc-200 border border-zinc-700 shadow-lg flex items-center justify-center hover:bg-zinc-800 hover:text-amber-400 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      {/* Search & Filter Bar */}
      <div className="bg-zinc-950 p-3.5 sm:p-4 rounded-[5px] border border-zinc-800 shadow-sm space-y-3 mb-6">
        {/* Active Assembly Filter Indicator */}
        {selectedAssemblyId && (
          <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-[3px] flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-white font-bold uppercase">
              <Crosshair className="w-4 h-4 text-amber-400" />
              <span>ENSAMBLE:</span>
              <span className="px-2 py-0.5 rounded-[3px] bg-zinc-800 text-amber-400 font-black border border-zinc-700">
                {assemblyLabels[selectedAssemblyId]}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleAssemblySelect(null)}
              className="text-zinc-400 hover:text-white flex items-center gap-1 font-bold uppercase cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>QUITAR</span>
            </button>
          </div>
        )}

        {/* Search input with instant reset */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="BUSCAR POR NÚMERO DE PARTE OEM, NOMBRE O MODELO (EJ. JCB-320, 922E, BOMBA, FILTRO)..."
              className="w-full pl-9 pr-8 py-2 rounded-[3px] bg-zinc-900 border border-zinc-800 text-white text-xs sm:text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400 uppercase font-mono"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-3 py-2 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-black uppercase tracking-wider font-display border border-zinc-800 transition-colors shrink-0"
              title="Limpiar filtros"
            >
              LIMPIAR
            </button>
          )}
        </div>

        {/* Active Category Indicator */}
        {selectedCategory !== 'Todos' && (
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs font-display">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <span className="uppercase text-[10px] font-mono">CATEGORÍA ACTIVA:</span>
              <span className="px-2 py-0.5 rounded-[3px] bg-zinc-800 text-amber-400 border border-zinc-700 font-black text-[10px] uppercase">
                {selectedCategory}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCategorySelect('Todos')}
              className="text-[10px] font-black uppercase text-amber-400 hover:underline cursor-pointer"
            >
              VER TODOS LOS REPUESTOS
            </button>
          </div>
        )}
      </div>

      {/* PARTS CONTROL BAR: Result counts, Sorting, View Modes & Items per page */}
      <div className="bg-zinc-950 p-3 rounded-[5px] border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 font-display">
        <div className="flex items-center gap-2 text-xs text-zinc-300 w-full sm:w-auto justify-between sm:justify-start font-mono">
          <span>
            {navigationMode === 'load_more' ? (
              <>MOSTRANDO <strong className="text-white">{displayedParts.length}</strong> DE <strong className="text-white">{totalItems}</strong> REPUESTOS OEM</>
            ) : (
              <>MOSTRANDO <strong className="text-white">{totalItems > 0 ? startIndex + 1 : 0}–{endIndex}</strong> DE <strong className="text-white">{totalItems}</strong> REPUESTOS OEM</>
            )}
          </span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 rounded-[3px] bg-zinc-900 text-amber-400 border border-zinc-800 font-bold text-[9px] uppercase">
              FILTROS ACTIVOS
            </span>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {/* Currency Selector Pill */}
          <div className="flex items-center bg-zinc-900 p-1 rounded-[4px] border border-zinc-800 text-xs font-mono">
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`px-2 py-1 rounded-[3px] text-[10px] font-black transition-all cursor-pointer uppercase ${
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
              className={`px-2 py-1 rounded-[3px] text-[10px] font-black transition-all cursor-pointer uppercase ${
                currency === 'DOP'
                  ? 'bg-zinc-800 text-amber-400 border border-zinc-700'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Precios en Pesos Dominicanos (RD$ Banco Central)"
            >
              DOP RD$
            </button>
          </div>

          {/* Availability Filter Pill */}
          <div className="flex items-center bg-zinc-900 p-1 rounded-[4px] border border-zinc-800 text-xs font-display">
            <button
              type="button"
              onClick={() => setAvailabilityFilter('all')}
              className={`px-2 py-1 rounded-[3px] text-[10px] font-black uppercase transition-all cursor-pointer ${
                availabilityFilter === 'all'
                  ? 'bg-zinc-800 text-amber-400 border border-zinc-700'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              TODOS
            </button>
            <button
              type="button"
              onClick={() => setAvailabilityFilter('in_stock')}
              className={`px-2 py-1 rounded-[3px] text-[10px] font-black uppercase transition-all cursor-pointer ${
                availabilityFilter === 'in_stock'
                  ? 'bg-zinc-800 text-amber-400 border border-zinc-700'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Disponible de inmediato en Almacén Km 22"
            >
              KM 22 LISTO
            </button>
          </div>

          {/* Navigation Mode Pill */}
          <div className="flex items-center bg-zinc-900 p-1 rounded-[4px] border border-zinc-800 text-xs font-display">
            <button
              type="button"
              onClick={() => setNavigationMode('load_more')}
              className={`px-2 py-1 rounded-[3px] text-[10px] font-black uppercase transition-all cursor-pointer ${
                navigationMode === 'load_more'
                  ? 'bg-zinc-800 text-amber-400 border border-zinc-700'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              DINÁMICO
            </button>
            <button
              type="button"
              onClick={() => setNavigationMode('pagination')}
              className={`px-2 py-1 rounded-[3px] text-[10px] font-black uppercase transition-all cursor-pointer ${
                navigationMode === 'pagination'
                  ? 'bg-zinc-800 text-amber-400 border border-zinc-700'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              PÁGINAS
            </button>
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1.5 rounded-[4px] border border-zinc-800 text-xs font-mono">
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as SortOption);
                setCurrentPage(1);
              }}
              className="bg-transparent text-zinc-300 font-bold uppercase focus:outline-none cursor-pointer text-[10px]"
            >
              <option value="relevance">RELEVANCIA / STOCK</option>
              <option value="price_asc">PRECIO: MENOR A MAYOR</option>
              <option value="price_desc">PRECIO: MAYOR A MENOR</option>
              <option value="code_asc">CÓDIGO OEM (A-Z)</option>
              <option value="name_asc">NOMBRE (A-Z)</option>
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-zinc-900 p-1 rounded-[4px] border border-zinc-800 gap-0.5 font-display">
            <button
              onClick={() => setViewMode('mosaic')}
              className={`px-2.5 py-1.5 rounded-[3px] text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
                viewMode === 'mosaic'
                  ? 'bg-zinc-800 text-amber-400 border-amber-500/80 shadow-xs'
                  : 'text-zinc-400 hover:text-white border-transparent'
              }`}
              title="Mosaico Industrial Dinámico"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden md:inline">MOSAICO</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1.5 rounded-[3px] text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
                viewMode === 'grid'
                  ? 'bg-zinc-800 text-amber-400 border-amber-500/80 shadow-xs'
                  : 'text-zinc-400 hover:text-white border-transparent'
              }`}
              title="Cuadrícula Uniforme"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">CUADRÍCULA</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1.5 rounded-[3px] text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
                viewMode === 'table'
                  ? 'bg-zinc-800 text-amber-400 border-amber-500/80 shadow-xs'
                  : 'text-zinc-400 hover:text-white border-transparent'
              }`}
              title="Vista de Tabla Industrial"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden md:inline">TABLA</span>
            </button>
          </div>
        </div>
      </div>

      {/* PARTS LISTING CONTENT (Optionally Bounded) */}
      <div className="font-display">
        {isLoadingParts ? (
          <PartsGridSkeleton count={8} />
        ) : filteredAndSortedParts.length === 0 ? (
          <div className="text-center py-16 bg-zinc-950 rounded-[5px] border border-zinc-800 p-8 shadow-xl">
            <Package className="w-12 h-12 text-amber-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-black uppercase tracking-wider text-white">
              NO ENCONTRAMOS ESE REPUESTO EN EL FILTRO ACTUAL
            </h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto font-sans">
              Disponemos de más de 40,000 números de parte en inventario físico en el Km 22. Consúltanos directamente con tu número de serie.
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs rounded-[3px] cursor-pointer shadow-md"
              >
                LIMPIAR BÚSQUEDA
              </button>
            </div>
          </div>
        ) : viewMode === 'table' ? (
          /* INDUSTRIAL HIGH-DENSITY SCANNING TABLE VIEW */
          <div className="bg-zinc-950 rounded-[5px] border border-zinc-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px] font-black">
                  <tr>
                    <th className="py-3 px-4">PARTE OEM / NOMBRE</th>
                    <th className="py-3 px-3">MARCA</th>
                    <th className="py-3 px-3">CATEGORÍA</th>
                    <th className="py-3 px-3">MODELOS COMPATIBLES</th>
                    <th className="py-3 px-3">STOCK KM 22</th>
                    <th className="py-3 px-3 text-right">PRECIO UNITARIO</th>
                    <th className="py-3 px-4 text-center">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {displayedParts.map((part) => (
                    <PartTableRow
                      key={part.id}
                      part={part}
                      formatPrice={formatPrice}
                      setActivePartDetail={setActivePartDetail}
                      setQrModalPart={setQrModalPart}
                      addToCart={addToCart}
                      searchTerm={searchTerm}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* RESPONSIVE SMART INDUSTRIAL MOSAIC GRID */
          <PartsMosaicGrid
            parts={displayedParts}
            layoutMode={viewMode === 'grid' ? 'uniform' : 'mosaic'}
            formatPrice={formatPrice}
            setActivePartDetail={setActivePartDetail}
            setQrModalPart={setQrModalPart}
            addToCart={addToCart}
            searchTerm={searchTerm}
          />
        )}
      </div>

      {/* ============================================================ */}
      {/* COMPACT LOAD MORE OR PAGINATION CONTROLS                      */}
      {/* ============================================================ */}
      {navigationMode === 'load_more' ? (
        totalItems > 0 && (
          <div className="mt-6 p-4 rounded-[5px] bg-zinc-950 border border-zinc-800 text-center space-y-3 shadow-xl font-display">
            <div className="max-w-md mx-auto space-y-1.5 font-mono">
              <div className="flex justify-between text-xs text-zinc-400 font-bold uppercase">
                <span>MOSTRANDO {Math.min(visibleCount, totalItems)} DE {totalItems} REPUESTOS</span>
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
                      <span>CARGANDO REPUESTOS...</span>
                    </>
                  ) : (
                    <>
                      <span>CARGAR MÁS REPUESTOS (+{Math.min(8, totalItems - visibleCount)})</span>
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
                <Check className="w-4 h-4 text-emerald-400" />
                <span>TODOS LOS {totalItems} REPUESTOS OEM ESTÁN VISIBLES</span>
              </span>
            )}
          </div>
        )
      ) : (
        /* SMART COMPACT PAGINATION BAR */
        totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-[5px] bg-zinc-950 border border-zinc-800 shadow-xl font-display">
            <div className="text-xs text-zinc-400 font-mono uppercase font-bold">
              PÁGINA <strong className="text-white">{validPage}</strong> DE <strong className="text-white">{totalPages}</strong> ({totalItems} REPUESTOS)
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

      {/* Industrial Gradient Separator: Catalog to High Demand Dispatch */}
      <div className="mt-12">
        <IndustrialSectionDivider badge="Despacho Express Nacional" />
      </div>

      {/* High Demand Dispatch & Real-Time Logistics Module */}
      <div className="mt-6">
        <HighDemandPartsSection onNavigate={onNavigate} />
      </div>

      {/* Part Technical Modal Detail */}
      {activePartDetail && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-display">
          <div className="w-full max-w-lg bg-zinc-950 rounded-[5px] shadow-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="relative h-48 bg-zinc-900 shrink-0">
              <img
                src={activePartDetail.image}
                alt={activePartDetail.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('tmd_coming_soon')) {
                    target.src = '/images/tmd_coming_soon.jpg';
                  }
                }}
              />
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLabelPdfPart(activePartDetail)}
                  className="px-2.5 py-1.5 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black border border-amber-400 transition-colors cursor-pointer shadow-md flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider"
                  title="Generar Pliego PDF Imprimible para etiquetado masivo de racks y almacén"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">PDF RÓTULOS</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await downloadProductQrCode(activePartDetail, 'part');
                  }}
                  className="px-2.5 py-1.5 rounded-[3px] bg-zinc-950/90 hover:bg-amber-500 hover:text-black text-amber-400 border border-zinc-700 transition-colors cursor-pointer shadow-md flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider"
                  title="Exportar Rótulo QR para anaquel de almacén"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">EXPORTAR QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQrModalPart(activePartDetail)}
                  className="px-2.5 py-1.5 rounded-[3px] bg-zinc-950/90 hover:bg-amber-500 hover:text-black text-amber-400 border border-zinc-700 transition-colors cursor-pointer shadow-md flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider"
                  title="Generar Código QR para ver en Celular"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">QR CELULAR</span>
                </button>
                <button
                  onClick={() => {
                    setActivePartDetail(null);
                    if (onClearSelectedPart) onClearSelectedPart();
                  }}
                  className="p-1.5 rounded-[3px] bg-zinc-950/90 text-zinc-300 hover:text-white border border-zinc-700 transition-colors cursor-pointer"
                  aria-label="Cerrar ficha"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="px-2 py-0.5 rounded-[2px] bg-amber-500 text-black font-mono font-black text-[10px] uppercase">
                    {activePartDetail.brand}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400">PN: {activePartDetail.partNumber}</span>
                  <RecentlyVerifiedBadge
                    itemId={activePartDetail.id}
                    itemCode={activePartDetail.partNumber}
                    itemType="part"
                    variant="pill"
                  />
                  <LastScannedBadge
                    itemId={activePartDetail.id}
                    itemCode={activePartDetail.partNumber}
                    itemType="part"
                    compact={true}
                    showEmptyState={false}
                  />
                </div>
                <h3 className="text-base font-black uppercase text-white">{activePartDetail.name}</h3>
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* RECENTLY VERIFIED REAL-TIME BANNER (<24H) */}
              <RecentlyVerifiedBadge
                itemId={activePartDetail.id}
                itemCode={activePartDetail.partNumber}
                itemType="part"
                variant="detail-banner"
              />

              {/* LAST SCANNED AUDIT BADGE */}
              <LastScannedBadge
                itemId={activePartDetail.id}
                itemCode={activePartDetail.partNumber}
                itemType="part"
                showDetailsAccordion={true}
                showEmptyState={true}
              />

              {/* AUDIT TRAIL - LAST 3 SCANS */}
              <InventoryAuditTrail
                itemId={activePartDetail.id}
                itemCode={activePartDetail.partNumber}
                itemName={activePartDetail.name}
                itemType="part"
                maxEvents={3}
              />

              <p className="text-zinc-300 leading-relaxed font-sans">
                {activePartDetail.description}
              </p>

              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-[4px] space-y-1 font-mono">
                <span className="text-zinc-400 font-bold uppercase block text-[10px]">COMPATIBILIDAD DE FLOTA:</span>
                <span className="text-white font-bold text-xs uppercase">
                  {activePartDetail.compatibleModels.join(', ')}
                </span>
              </div>
            </div>

            <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-zinc-400 block text-[10px] font-mono uppercase font-bold">PRECIO UNITARIO:</span>
                <span className="text-base font-black text-amber-400 font-mono">
                  {formatPrice(activePartDetail.priceUsd)}
                </span>
              </div>
              <div className="flex items-center gap-2 font-display flex-wrap sm:flex-nowrap">
                <a
                  href={`https://wa.me/18095601234?text=Hola%20TMD,%20solicito%20consultar%20disponibilidad%20del%20repuesto:%20${encodeURIComponent(activePartDetail.name)}%20(P/N:%20${encodeURIComponent(activePartDetail.partNumber)})`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-[3px] bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-wider text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Consultar por WhatsApp con Despacho de Repuestos"
                >
                  <span>WHATSAPP</span>
                </a>
                <button
                  id="part-detail-add-cart-btn"
                  type="button"
                  onClick={() => {
                    addToCart(activePartDetail);
                    setActivePartDetail(null);
                  }}
                  className="px-3 py-2 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 font-black uppercase tracking-wider text-xs transition-colors cursor-pointer hidden sm:flex items-center gap-1.5"
                  title="Añadir a cesta"
                >
                  <ShoppingCart className="w-4 h-4 text-amber-400" />
                  <span>AÑADIR</span>
                </button>
                <button
                  id="part-detail-request-quote-btn"
                  type="button"
                  onClick={() => {
                    addToCart(activePartDetail);
                    setActivePartDetail(null);
                    onNavigate('#/checkout');
                  }}
                  className="px-4 py-2 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs transition-colors cursor-pointer shadow-md flex items-center gap-1.5 active:scale-95"
                >
                  <FileText className="w-4 h-4" />
                  <span>COTIZACIÓN</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Product QR Code Modal for Parts */}
      {qrModalPart && (
        <ProductQrCodeModal
          isOpen={true}
          onClose={() => setQrModalPart(null)}
          type="part"
          product={qrModalPart}
        />
      )}

      {/* Inventory Label Mass PDF Sheet Generator Modal */}
      {labelPdfPart && (
        <InventoryLabelPdfModal
          isOpen={true}
          onClose={() => setLabelPdfPart(null)}
          type="part"
          product={labelPdfPart}
        />
      )}

      {/* Export Catalog PDF Modal */}
      <ExportCatalogPdfModal
        isOpen={isExportPdfOpen}
        onClose={() => setIsExportPdfOpen(false)}
        type="parts"
        activeCategory={selectedCategory}
        parts={filteredAndSortedParts}
      />

      {/* Task #85: Warehouse Shelf Bin Label Generator (Zebra / Avery 100x50mm) */}
      {binLabelPart && (
        <WarehouseBinLabelModal
          isOpen={true}
          onClose={() => setBinLabelPart(null)}
          item={binLabelPart}
          itemType="part"
        />
      )}

      {/* Task #90: Reman Heavy Components & Core Exchange Modal */}
      <RemanExchangeCatalogModal
        isOpen={isRemanModalOpen}
        onClose={() => setIsRemanModalOpen(false)}
        onNavigate={onNavigate}
      />

      {/* Task #92: Automated Reorder Points & Critical Stock Management Modal */}
      <CriticalStockReorderModal
        isOpen={isCriticalStockOpen}
        onClose={() => setIsCriticalStockOpen(false)}
      />

      {/* Task #99: Mobile Service Truck Inventory Sync Modal */}
      <MobileTruckInventoryModal
        isOpen={isMobileTruckOpen}
        onClose={() => setIsMobileTruckOpen(false)}
      />
    </div>
  );
});

PartsView.displayName = 'PartsView';
