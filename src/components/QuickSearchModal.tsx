import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  X, 
  HardHat, 
  Cog, 
  ArrowRight, 
  Command, 
  Sliders, 
  Cpu, 
  Wrench, 
  ShieldCheck, 
  Phone, 
  Scale,
  Sparkles,
  Layers,
  CornerDownLeft,
  Truck,
  FlaskConical,
  BookOpen,
  GraduationCap,
  RotateCcw,
  Award,
  Calculator,
  AlertTriangle,
  Leaf,
  QrCode,
  Clock,
  CheckCircle2,
  TrendingUp,
  Tag,
  PackageCheck,
  Plus,
  ShoppingCart,
  Check,
  Trash2
} from 'lucide-react';
import { Machine, Part } from '../types';
import { getUnifiedStoreMachinery, getUnifiedStoreParts } from '../services/cdnCatalogLoader';
import { useCart } from '../context/CartContext';
import { useComparison } from '../context/ComparisonContext';
import { ProductQrCodeModal } from './ProductQrCodeModal';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
  onSelectMachine?: (machineId: string) => void;
  onSelectPart?: (partId: string) => void;
  onOpenQrScanner?: () => void;
}

// Accent & Diacritics Normalizer
function normalizeSearchText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Subsequence and typo-tolerant Levenshtein distance calculator
function getLevenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Subsequence check (e.g. "j3cx" matches "jcb 3cx")
function isSubsequence(pattern: string, text: string): boolean {
  let pIdx = 0;
  let tIdx = 0;
  while (pIdx < pattern.length && tIdx < text.length) {
    if (pattern[pIdx] === text[tIdx]) {
      pIdx++;
    }
    tIdx++;
  }
  return pIdx === pattern.length;
}

// Highlight matched query substring helper
function highlightMatches(text: string, queryTokens: string[]) {
  if (!text || queryTokens.length === 0) return text;
  
  // Create regex pattern matching all query tokens
  const validTokens = queryTokens.filter(t => t.length > 0);
  if (validTokens.length === 0) return text;
  
  const pattern = new RegExp(`(${validTokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(pattern);

  return parts.map((part, i) => {
    const isMatch = validTokens.some(t => normalizeSearchText(t) === normalizeSearchText(part));
    if (isMatch) {
      return (
        <mark 
          key={i} 
          className="bg-amber-500/25 dark:bg-amber-400/30 text-amber-950 dark:text-amber-200 font-extrabold px-0.5 rounded"
        >
          {part}
        </mark>
      );
    }
    return part;
  });
}

const POPULAR_SEARCH_SUGGESTIONS = [
  'JCB 3CX Eco',
  'LiuGong 922E',
  'Kubota KX033-4',
  'Filtro de Aceite JCB',
  'LS Tractor MT225',
  'Yanmar Harvester',
  'Ammann ASC 110 Rodillo',
  'LiveLink IoT',
  'Pólizas PMA 500h',
  'Dientes de Balde'
];

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectMachine,
  onSelectPart,
  onOpenQrScanner
}) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'machinery' | 'parts' | 'actions'>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);
  
  const { formatPrice, addToCart } = useCart();
  const { openComparison, toggleMachineCompare, isComparing } = useComparison();
  const [qrModalItem, setQrModalItem] = useState<{ product: Machine | Part; type: 'machinery' | 'part' } | null>(null);
  const [addedPartFeedback, setAddedPartFeedback] = useState<string | null>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tmd_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveSearchQuery = (searchQuery: string) => {
    const clean = searchQuery.trim();
    if (!clean || clean.length < 2) return;
    try {
      const currentList = (() => {
        try {
          const stored = localStorage.getItem('tmd_recent_searches');
          return stored ? JSON.parse(stored) : recentSearches;
        } catch {
          return recentSearches;
        }
      })();
      const updated = [clean, ...currentList.filter((s: string) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('tmd_recent_searches', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const removeRecentSearch = (e: React.MouseEvent, targetQuery: string) => {
    e.stopPropagation();
    try {
      const updated = recentSearches.filter((s) => s.toLowerCase() !== targetQuery.toLowerCase());
      setRecentSearches(updated);
      localStorage.setItem('tmd_recent_searches', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('tmd_recent_searches');
    } catch {
      // ignore
    }
  };

  // Quick system actions and tools
  const quickActions = useMemo(() => [
    {
      id: 'act-configurator',
      title: 'Configurador Interactivo de Maquinaria 2026',
      subtitle: 'Simula aditamentos hidráulicos, powertrain y financiamiento',
      category: 'Herramientas',
      keywords: ['configurador', 'maquinaria', 'aditamentos', 'financiar', 'precio', 'cotizar'],
      icon: Sliders,
      action: () => onNavigate('#/machinery')
    },
    {
      id: 'act-livelink',
      title: 'Telemetría Satelital LiveLink™ IoT',
      subtitle: 'Monitoreo en tiempo real de horómetros y ubicación de flotas',
      category: 'Tecnología',
      keywords: ['livelink', 'telemetria', 'iot', 'satelital', 'gps', 'horometro', 'jcb', 'fallas', 'canbus'],
      icon: Cpu,
      action: () => onNavigate('#/livelink')
    },
    {
      id: 'act-fullbay',
      title: 'Taller & Órdenes de Trabajo Fullbay',
      subtitle: 'Diagnóstico mecánico, pruebas hidráulicas y banco de motores',
      category: 'Servicios',
      keywords: ['fullbay', 'taller', 'mantenimiento', 'mecanico', 'orden', 'reparacion', 'km22', 'overhaul'],
      icon: Wrench,
      action: () => onNavigate('#/fullbay')
    },
    {
      id: 'act-pro-member',
      title: 'Portal de Membresía TMD Pro',
      subtitle: 'Estatus Gold/Platinum, puntos acumulados y 15% de descuento',
      category: 'Clientes',
      keywords: ['pro', 'membresia', 'puntos', 'descuento', 'gold', 'platinum', 'beneficios', 'vip'],
      icon: ShieldCheck,
      action: () => onNavigate('#/portal?tab=pro_member')
    },
    {
      id: 'act-rental',
      title: 'Renta de Maquinaria Pesada & Flete Lowboy',
      subtitle: 'Cotizador interactivo de renta por día, semana o mes con operador',
      category: 'Flota',
      keywords: ['renta', 'alquiler', 'lowboy', 'flete', 'operador', 'retroexcavadora', 'pala', 'rodillo'],
      icon: Truck,
      action: () => onNavigate('#/rental')
    },
    {
      id: 'act-oil-lab',
      title: 'Laboratorio de Fluidos & Tribología SOS',
      subtitle: 'Espectrometría ICP de aceites, metales de desgaste y diagnóstico predictivo',
      category: 'Diagnóstico',
      keywords: ['aceite', 'laboratorio', 'tribologia', 'sos', 'fluidos', 'icp', 'desgaste', 'analisis'],
      icon: FlaskConical,
      action: () => onNavigate('#/oil-lab')
    },
    {
      id: 'act-manuals',
      title: 'Manuales de Taller & Boletines TSB',
      subtitle: 'Despieces de repuestos, torques y esquemas hidráulicos / eléctricos',
      category: 'Documentación',
      keywords: ['manual', 'tsb', 'esquema', 'diagrama', 'despiece', 'catalogo', 'torque', 'documento'],
      icon: BookOpen,
      action: () => onNavigate('#/manuals')
    },
    {
      id: 'act-academy',
      title: 'Academia de Operadores TMD & Validador de Carnets',
      subtitle: 'Certificaciones de operación segura y verificación de licencias',
      category: 'Capacitación',
      keywords: ['academia', 'operador', 'carnet', 'certificacion', 'capacitacion', 'licencia', 'curso'],
      icon: GraduationCap,
      action: () => onNavigate('#/academy')
    },
    {
      id: 'act-reman',
      title: 'TMD Reman • Intercambio de Cascos & Motores Overhaul',
      subtitle: 'Componentes reconstruidos certificados con crédito por entrega de núcleo usado',
      category: 'Componentes',
      keywords: ['reman', 'casco', 'intercambio', 'overhaul', 'motor', 'bomba', 'reconstruido', 'cummins'],
      icon: RotateCcw,
      action: () => onNavigate('#/reman')
    },
    {
      id: 'act-tradein',
      title: 'Trade-In & Mercado de Usados Certificados (150 Pts)',
      subtitle: 'Avalúo de maquinaria usada para entrega a cambio y flota de segunda mano',
      category: 'Usados',
      keywords: ['tradein', 'usado', 'retoma', 'avaluo', 'segunda', 'cambio', 'inspeccion'],
      icon: Award,
      action: () => onNavigate('#/trade-in')
    },
    {
      id: 'act-tco',
      title: 'Calculadora Financiera de TCO & Diésel',
      subtitle: 'Costo total de propiedad a 5 años, consumo galón/hora y valor residual RD',
      category: 'Finanzas',
      keywords: ['tco', 'calculadora', 'diesel', 'consumo', 'costo', 'combustible', 'galones', 'residual'],
      icon: Calculator,
      action: () => onNavigate('#/tco-calculator')
    },
    {
      id: 'act-pma',
      title: 'Pólizas de Mantenimiento Preventivo PMA / CVA',
      subtitle: 'Contratos por hora trabajada con despacho automático de kits de filtros',
      category: 'Pólizas',
      keywords: ['pma', 'cva', 'poliza', 'contrato', 'mantenimiento', 'filtros', 'preventivo'],
      icon: ShieldCheck,
      action: () => onNavigate('#/pma-contracts')
    },
    {
      id: 'act-emergency',
      title: 'Despacho de Talleres Móviles & Auxilio SOS 24/7',
      subtitle: 'Rescate de maquinaria detenida en obra con grúa telescópica y laboratorio portátil',
      category: 'Emergencias',
      keywords: ['emergencia', 'auxilio', 'sos', 'movil', 'campo', '247', 'rescate', 'grua'],
      icon: AlertTriangle,
      action: () => onNavigate('#/emergency-dispatch')
    },
    {
      id: 'act-carbon',
      title: 'Calculadora de Huella de Carbono MIMARENA',
      subtitle: 'Auditoría ambiental de emisiones CO₂ y árboles de offset para licitaciones',
      category: 'Ambiental',
      keywords: ['carbono', 'huella', 'co2', 'mimarena', 'ambiental', 'emisiones', 'arboles'],
      icon: Leaf,
      action: () => onNavigate('#/carbon-footprint')
    },
    {
      id: 'act-compare',
      title: 'Comparador Técnico de Equipos',
      subtitle: 'Compara hasta 4 máquinas lado a lado en potencia y peso',
      category: 'Herramientas',
      keywords: ['comparar', 'comparador', 'especificaciones', 'vs', 'lado a lado'],
      icon: Scale,
      action: () => openComparison()
    },
    {
      id: 'act-whatsapp',
      title: 'Atención Directa por WhatsApp (Km 22)',
      subtitle: 'Habla con un asesor técnico de ventas o repuestos ahora',
      category: 'Contacto',
      keywords: ['whatsapp', 'contacto', 'asesor', 'telefono', 'km22', 'ayuda'],
      icon: Phone,
      action: () => window.open('https://wa.me/18095601234?text=Hola%20TMD,%20necesito%20asistencia%20inmediata', '_blank')
    }
  ], [onNavigate, openComparison]);

  // Load datasets
  const allMachines = useMemo(() => getUnifiedStoreMachinery(), []);
  const allParts = useMemo(() => getUnifiedStoreParts(), []);

  // Pre-indexed search data structures
  const indexedMachines = useMemo(() => {
    return allMachines.map((m) => {
      const normName = normalizeSearchText(m.name);
      const normBrand = normalizeSearchText(m.brand);
      const normCat = normalizeSearchText(m.category);
      const normCode = normalizeSearchText(m.modelCode);
      const compactCode = normCode.replace(/\s+/g, '');
      const normEngine = normalizeSearchText(m.engine || '');
      const normApps = (m.applications || []).map(a => normalizeSearchText(a)).join(' ');
      const normSpecs = (m.specs || []).map(s => `${normalizeSearchText(s.label)} ${normalizeSearchText(s.value)}`).join(' ');
      const normDesc = normalizeSearchText(m.description || '');

      const searchCorpus = `${normName} ${normBrand} ${normCat} ${normCode} ${compactCode} ${normEngine} ${normApps} ${normSpecs} ${normDesc}`;

      return {
        item: m,
        normName,
        normBrand,
        normCat,
        normCode,
        compactCode,
        searchCorpus,
      };
    });
  }, [allMachines]);

  const indexedParts = useMemo(() => {
    return allParts.map((p) => {
      const normName = normalizeSearchText(p.name);
      const normPartNo = normalizeSearchText(p.partNumber);
      const compactPartNo = normPartNo.replace(/\s+/g, '');
      const normBrand = normalizeSearchText(p.brand);
      const normCat = normalizeSearchText(p.category);
      const normCompat = (p.compatibleModels || []).map(c => normalizeSearchText(c)).join(' ');
      const normDesc = normalizeSearchText(p.description || '');

      const searchCorpus = `${normName} ${normPartNo} ${compactPartNo} ${normBrand} ${normCat} ${normCompat} ${normDesc}`;

      return {
        item: p,
        normName,
        normPartNo,
        compactPartNo,
        normBrand,
        normCat,
        normCompat,
        searchCorpus,
      };
    });
  }, [allParts]);

  const indexedActions = useMemo(() => {
    return quickActions.map((a) => {
      const normTitle = normalizeSearchText(a.title);
      const normSub = normalizeSearchText(a.subtitle);
      const normCat = normalizeSearchText(a.category);
      const normKw = (a.keywords || []).map(k => normalizeSearchText(k)).join(' ');
      const searchCorpus = `${normTitle} ${normSub} ${normCat} ${normKw}`;

      return {
        item: a,
        normTitle,
        normSub,
        normCat,
        searchCorpus,
      };
    });
  }, [quickActions]);

  // Available brands in catalogue
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    allMachines.forEach(m => brandsSet.add(m.brand));
    allParts.forEach(p => brandsSet.add(p.brand));
    return Array.from(brandsSet).sort();
  }, [allMachines, allParts]);

  // Predictive Real-time Search Algorithm
  const { results, queryTokens, topPredictiveSuggestion } = useMemo(() => {
    const rawQuery = query.trim();
    const normQ = normalizeSearchText(rawQuery);
    const compactQ = normQ.replace(/\s+/g, '');
    const tokens = normQ.split(' ').filter(t => t.length > 0);

    if (tokens.length === 0) {
      // Default empty state: Top featured machines & high-demand parts
      let defaultMachines = allMachines.filter(m => m.featured || m.inStock);
      if (selectedBrand !== 'all') {
        defaultMachines = defaultMachines.filter(m => m.brand.toLowerCase() === selectedBrand.toLowerCase());
      }
      if (onlyInStock) {
        defaultMachines = defaultMachines.filter(m => m.inStock);
      }

      let defaultParts = allParts.filter(p => p.stockQty > 0);
      if (selectedBrand !== 'all') {
        defaultParts = defaultParts.filter(p => p.brand.toLowerCase() === selectedBrand.toLowerCase());
      }

      return {
        results: {
          machines: defaultMachines.slice(0, 6),
          parts: defaultParts.slice(0, 6),
          actions: quickActions.slice(0, 8),
        },
        queryTokens: [],
        topPredictiveSuggestion: null
      };
    }

    // Scoring Engine for Machines
    const scoredMachines: { item: Machine; score: number }[] = [];
    indexedMachines.forEach(({ item, normName, normBrand, normCat, normCode, compactCode, searchCorpus }) => {
      if (selectedBrand !== 'all' && item.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
        return;
      }
      if (onlyInStock && !item.inStock) {
        return;
      }

      let score = 0;

      // Exact Code / SKU match
      if (compactCode === compactQ || normCode === normQ) {
        score += 220;
      } else if (compactCode.startsWith(compactQ) || normCode.startsWith(normQ)) {
        score += 150;
      } else if (compactCode.includes(compactQ)) {
        score += 110;
      }

      // Brand exact or prefix match
      if (normBrand === normQ) {
        score += 90;
      } else if (normBrand.startsWith(normQ)) {
        score += 70;
      } else if (normBrand.includes(normQ)) {
        score += 50;
      }

      // Name / Title match
      if (normName.startsWith(normQ)) {
        score += 85;
      } else if (normName.includes(normQ)) {
        score += 65;
      }

      // Category match
      if (normCat.includes(normQ)) {
        score += 50;
      }

      // Token-by-token evaluation
      let matchedTokensCount = 0;
      for (const token of tokens) {
        let tokenFound = false;
        if (normCode.includes(token) || compactCode.includes(token)) {
          score += 40;
          tokenFound = true;
        } else if (normBrand.includes(token)) {
          score += 30;
          tokenFound = true;
        } else if (normName.includes(token)) {
          score += 25;
          tokenFound = true;
        } else if (normCat.includes(token)) {
          score += 20;
          tokenFound = true;
        } else if (searchCorpus.includes(token)) {
          score += 15;
          tokenFound = true;
        } else {
          // Typo tolerance / fuzzy match on words with length >= 4
          if (token.length >= 4) {
            const words = searchCorpus.split(' ');
            for (const w of words) {
              if (Math.abs(w.length - token.length) <= 1) {
                const dist = getLevenshteinDistance(token, w);
                if (dist <= 1) {
                  score += 20;
                  tokenFound = true;
                  break;
                }
              }
            }
          }
          if (!tokenFound && isSubsequence(token, compactCode)) {
            score += 15;
            tokenFound = true;
          }
        }
        if (tokenFound) matchedTokensCount++;
      }

      // Must match at least a significant proportion of tokens if query is multi-word
      if (tokens.length > 1 && matchedTokensCount < Math.ceil(tokens.length * 0.6)) {
        return;
      }

      if (score > 0) {
        // Boosts
        if (item.inStock) score += 10;
        if (item.featured) score += 5;
        scoredMachines.push({ item, score });
      }
    });

    scoredMachines.sort((a, b) => b.score - a.score);

    // Scoring Engine for Parts
    const scoredParts: { item: Part; score: number }[] = [];
    indexedParts.forEach(({ item, normName, normPartNo, compactPartNo, normBrand, normCat, searchCorpus }) => {
      if (selectedBrand !== 'all' && item.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
        return;
      }
      if (onlyInStock && item.stockQty <= 0) {
        return;
      }

      let score = 0;

      // Exact Part Number match
      if (compactPartNo === compactQ || normPartNo === normQ) {
        score += 240;
      } else if (compactPartNo.startsWith(compactQ) || normPartNo.startsWith(normQ)) {
        score += 160;
      } else if (compactPartNo.includes(compactQ)) {
        score += 115;
      }

      // Brand exact or prefix match
      if (normBrand === normQ) {
        score += 80;
      } else if (normBrand.startsWith(normQ)) {
        score += 60;
      }

      // Name match
      if (normName.startsWith(normQ)) {
        score += 80;
      } else if (normName.includes(normQ)) {
        score += 55;
      }

      // Category match
      if (normCat.includes(normQ)) {
        score += 45;
      }

      // Token-by-token evaluation
      let matchedTokensCount = 0;
      for (const token of tokens) {
        let tokenFound = false;
        if (normPartNo.includes(token) || compactPartNo.includes(token)) {
          score += 45;
          tokenFound = true;
        } else if (normBrand.includes(token)) {
          score += 30;
          tokenFound = true;
        } else if (normName.includes(token)) {
          score += 25;
          tokenFound = true;
        } else if (normCat.includes(token)) {
          score += 20;
          tokenFound = true;
        } else if (searchCorpus.includes(token)) {
          score += 15;
          tokenFound = true;
        } else {
          if (token.length >= 4) {
            const words = searchCorpus.split(' ');
            for (const w of words) {
              if (Math.abs(w.length - token.length) <= 1) {
                const dist = getLevenshteinDistance(token, w);
                if (dist <= 1) {
                  score += 20;
                  tokenFound = true;
                  break;
                }
              }
            }
          }
          if (!tokenFound && isSubsequence(token, compactPartNo)) {
            score += 15;
            tokenFound = true;
          }
        }
        if (tokenFound) matchedTokensCount++;
      }

      if (tokens.length > 1 && matchedTokensCount < Math.ceil(tokens.length * 0.6)) {
        return;
      }

      if (score > 0) {
        if (item.stockQty > 0) score += 10;
        if (item.isOem) score += 5;
        scoredParts.push({ item, score });
      }
    });

    scoredParts.sort((a, b) => b.score - a.score);

    // Scoring Engine for Quick Actions
    const scoredActions: { item: any; score: number }[] = [];
    indexedActions.forEach(({ item, normTitle, normSub, normCat, searchCorpus }) => {
      let score = 0;

      if (normTitle.includes(normQ)) {
        score += 90;
      } else if (normSub.includes(normQ)) {
        score += 60;
      } else if (normCat.includes(normQ)) {
        score += 45;
      }

      for (const token of tokens) {
        if (normTitle.includes(token)) {
          score += 30;
        } else if (normSub.includes(token)) {
          score += 20;
        } else if (searchCorpus.includes(token)) {
          score += 15;
        }
      }

      if (score > 0) {
        scoredActions.push({ item, score });
      }
    });

    scoredActions.sort((a, b) => b.score - a.score);

    // Compute Predictive Auto-Complete Ghost Suggestion
    let topPredictive: string | null = null;
    if (rawQuery.length >= 2) {
      if (scoredMachines.length > 0 && scoredMachines[0].score >= 80) {
        const topM = scoredMachines[0].item;
        topPredictive = `${topM.brand} ${topM.modelCode} ${topM.name}`;
      } else if (scoredParts.length > 0 && scoredParts[0].score >= 80) {
        const topP = scoredParts[0].item;
        topPredictive = `${topP.brand} ${topP.partNumber} ${topP.name}`;
      } else if (scoredActions.length > 0) {
        topPredictive = scoredActions[0].item.title;
      }
    }

    return {
      results: {
        machines: scoredMachines.map(sm => sm.item).slice(0, 15),
        parts: scoredParts.map(sp => sp.item).slice(0, 15),
        actions: scoredActions.map(sa => sa.item).slice(0, 8),
      },
      queryTokens: tokens,
      topPredictiveSuggestion: topPredictive
    };
  }, [query, indexedMachines, indexedParts, indexedActions, selectedBrand, onlyInStock, allMachines, allParts, quickActions]);

  // Flattened items for keyboard navigation based on activeTab
  const flatItems = useMemo(() => {
    const items: Array<{ type: 'action' | 'machine' | 'part'; data: any }> = [];
    
    if (activeTab === 'all' || activeTab === 'actions') {
      results.actions.forEach(a => items.push({ type: 'action', data: a }));
    }
    if (activeTab === 'all' || activeTab === 'machinery') {
      results.machines.forEach(m => items.push({ type: 'machine', data: m }));
    }
    if (activeTab === 'all' || activeTab === 'parts') {
      results.parts.forEach(p => items.push({ type: 'part', data: p }));
    }
    return items;
  }, [results, activeTab]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeTab, selectedBrand, onlyInStock]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setActiveTab('all');
      setSelectedBrand('all');
      setOnlyInStock(false);
    }
  }, [isOpen]);

  // Auto-scroll selected element into view
  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, flatItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatItems.length) % Math.max(1, flatItems.length));
    } else if (e.key === 'Tab' && topPredictiveSuggestion && query.trim()) {
      e.preventDefault();
      setQuery(topPredictiveSuggestion);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = flatItems[selectedIndex];
      if (current) {
        saveSearchQuery(query || current.data.name || current.data.title);
        if (current.type === 'action') {
          onClose();
          current.data.action();
        } else if (current.type === 'machine') {
          onClose();
          if (onSelectMachine) onSelectMachine(current.data.id);
          onNavigate('#/machinery');
        } else if (current.type === 'part') {
          onClose();
          if (onSelectPart) onSelectPart(current.data.id);
          onNavigate('#/parts');
        }
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    inputRef.current?.focus();
  };

  const handleAddToCartQuick = (e: React.MouseEvent, part: Part) => {
    e.stopPropagation();
    addToCart(part, 1);
    setAddedPartFeedback(part.id);
    setTimeout(() => setAddedPartFeedback(null), 1800);
  };

  const handleToggleComparisonQuick = (e: React.MouseEvent, machine: Machine) => {
    e.stopPropagation();
    toggleMachineCompare(machine.id);
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div 
      id="quick-search-modal-backdrop"
      className="fixed inset-0 z-[99999] flex items-start justify-center pt-8 sm:pt-14 px-3 sm:px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="quick-search-modal-panel"
        className="w-full max-w-4xl bg-zinc-900 rounded-[5px] shadow-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-150 font-mono"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Top Omnibox Search Input */}
        <div className="p-3.5 sm:p-4 border-b border-zinc-800 flex items-center gap-3 bg-zinc-950">
          <div className="w-8 h-8 rounded-[3px] bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/30">
            <Search className="w-4 h-4" />
          </div>
          
          <div className="relative flex-1 flex items-center">
            <input
              ref={inputRef}
              id="quick-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="BUSCAR POR MARCA, MODELO, P/N O COMANDO (EJ. JCB 3CX, 320/07155, FILTRO)..."
              className="w-full bg-transparent border-none text-white placeholder-zinc-500 focus:outline-none text-sm sm:text-base font-mono font-bold uppercase"
              autoComplete="off"
              spellCheck="false"
            />
            {topPredictiveSuggestion && query.trim() && (
              <div 
                onClick={() => setQuery(topPredictiveSuggestion)}
                className="hidden md:flex items-center gap-1.5 absolute right-2 text-xs font-semibold px-2 py-0.5 rounded-[2px] bg-amber-400/10 text-amber-400 border border-amber-400/20 cursor-pointer hover:bg-amber-400/20 transition-colors uppercase"
                title="Presiona Tab para autocompletar"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="truncate max-w-xs">{topPredictiveSuggestion}</span>
                <kbd className="px-1 py-0.2 rounded bg-amber-400/20 text-[10px] font-mono font-bold">Tab</kbd>
              </div>
            )}
          </div>

          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-[2px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Borrar búsqueda"
              aria-label="Borrar texto"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {onOpenQrScanner && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenQrScanner();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-amber-400 hover:text-white border border-amber-500/40 hover:border-amber-400 text-xs font-bold uppercase transition-colors cursor-pointer shrink-0"
              title="Escanear Código QR Industrial"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline text-[11px] font-black">Escanear QR</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-[2px] bg-zinc-800 text-zinc-300 border border-zinc-700">
              ESC
            </span>
          </div>
        </div>

        {/* Filter Category Tabs & Quick Facets */}
        <div className="flex flex-col border-b border-zinc-800 bg-zinc-950/80">
          <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 overflow-x-auto text-xs">
            {/* Main Category Tabs */}
            <div className="flex items-center gap-1.5 shrink-0">
              {[
                { id: 'all', label: 'TODO', count: results.actions.length + results.machines.length + results.parts.length },
                { id: 'machinery', label: 'MAQUINARIA', count: results.machines.length, icon: HardHat },
                { id: 'parts', label: 'REPUESTOS OEM', count: results.parts.length, icon: Cog },
                { id: 'actions', label: 'COMANDOS', count: results.actions.length, icon: Command },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] font-bold transition-all cursor-pointer text-xs uppercase ${
                      isActive
                        ? 'bg-amber-400 text-black font-black shadow-xs'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-white border border-transparent'
                    }`}
                  >
                    {Icon && <Icon className="w-3 h-3" />}
                    <span>{tab.label}</span>
                    <span className={`text-[9px] px-1 rounded-[2px] font-mono font-bold ${isActive ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* In-Stock Filter Toggle */}
            <button
              onClick={() => setOnlyInStock(!onlyInStock)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 uppercase ${
                onlyInStock
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'text-zinc-400 hover:text-zinc-200 border border-zinc-800 bg-zinc-900'
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>SOLO EN STOCK RD</span>
            </button>
          </div>

          {/* Brand Filter Sub-Bar */}
          <div className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-zinc-950 border-t border-zinc-800/80 overflow-x-auto text-[10px] no-scrollbar">
            <span className="text-zinc-500 font-bold uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
              <Tag className="w-2.5 h-2.5" />
              <span>MARCA:</span>
            </span>
            <button
              onClick={() => setSelectedBrand('all')}
              className={`px-2 py-0.5 rounded-[2px] font-bold transition-all cursor-pointer whitespace-nowrap uppercase ${
                selectedBrand === 'all'
                  ? 'bg-amber-400 text-black font-black'
                  : 'text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              TODAS
            </button>
            {availableBrands.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`px-2 py-0.5 rounded-[2px] font-bold transition-all cursor-pointer whitespace-nowrap uppercase ${
                  selectedBrand === b
                    ? 'bg-amber-400 text-black font-black'
                    : 'text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Predictive Suggestions & Popular Searches Banner when Query is short */}
        {(!query.trim() || query.length < 2) && (
          <div className="p-3 bg-zinc-950 border-b border-zinc-800">
            {recentSearches.length > 0 && (
              <div className="mb-2.5 p-2.5 rounded-[3px] bg-zinc-900 border border-zinc-800 shadow-xs">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-300 uppercase text-[11px]">
                    <div className="w-4 h-4 rounded-[2px] bg-amber-400/20 text-amber-400 flex items-center justify-center">
                      <Clock className="w-2.5 h-2.5" />
                    </div>
                    <span>Búsquedas Recientes</span>
                    <span className="text-[9px] font-mono font-bold px-1 rounded-[2px] bg-zinc-800 text-zinc-400 border border-zinc-700">
                      {recentSearches.length}/5
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={clearRecentSearches}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] text-[10px] font-bold text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent transition-all cursor-pointer uppercase"
                    title="Limpiar todo el historial de búsquedas recientes"
                    aria-label="Limpiar historial de búsquedas recientes"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                    <span>LIMPIAR</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recentSearches.map((s, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectSuggestion(s)}
                      className="group flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded-[2px] text-[11px] font-bold bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-amber-400 hover:text-white transition-all cursor-pointer"
                    >
                      <Clock className="w-2.5 h-2.5 text-zinc-500 group-hover:text-amber-400 transition-colors shrink-0" />
                      <span className="truncate max-w-[180px] uppercase">{s}</span>
                      <button
                        type="button"
                        onClick={(e) => removeRecentSearch(e, s)}
                        className="p-0.5 rounded-[2px] text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                        title={`Eliminar "${s}"`}
                        aria-label={`Eliminar búsqueda ${s}`}
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <span className="font-bold text-[10px] text-zinc-400 uppercase flex items-center gap-1 mb-1">
                <TrendingUp className="w-2.5 h-2.5 text-amber-400" />
                <span>Tendencias Oficiales TMD</span>
              </span>
              <div className="flex flex-wrap gap-1">
                {POPULAR_SEARCH_SUGGESTIONS.map((term, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion(term)}
                    className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-amber-400 hover:text-black hover:border-amber-400 transition-all cursor-pointer uppercase"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Results List */}
        <div ref={resultsContainerRef} className="overflow-y-auto p-3 space-y-2 divide-y divide-zinc-800/60">
          {flatItems.length === 0 ? (
            <div className="text-center py-10 px-4 text-zinc-500 space-y-2.5">
              <div className="w-10 h-10 rounded-[3px] bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                <Search className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-white uppercase">
                No encontramos coincidencias para "{query}".
              </p>
              <p className="text-[11px] max-w-md mx-auto text-zinc-400 leading-relaxed">
                Verifica que el número de parte o modelo esté bien escrito. Si buscas una pieza no listada o importación especial, contáctanos en Patio Km 22 al <strong>+1 (809) 560-1234</strong>.
              </p>
              <div className="pt-1">
                <button
                  onClick={() => {
                    setQuery('');
                    setSelectedBrand('all');
                    setOnlyInStock(false);
                  }}
                  className="px-3 py-1.5 rounded-[2px] bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-colors cursor-pointer uppercase"
                >
                  Restablecer Filtros
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {flatItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;

                if (item.type === 'action') {
                  const act = item.data;
                  const Icon = act.icon;
                  return (
                    <div
                      key={act.id}
                      ref={isSelected ? selectedItemRef : null}
                      onClick={() => {
                        saveSearchQuery(act.title);
                        onClose();
                        act.action();
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between p-2.5 rounded-[3px] cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-400/10 border border-amber-400/40 text-amber-300 shadow-xs'
                          : 'hover:bg-zinc-800/60 border border-transparent text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-2 rounded-[2px] shrink-0 ${isSelected ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-300'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold flex items-center gap-1.5 flex-wrap uppercase">
                            <span>{highlightMatches(act.title, queryTokens)}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-[2px] bg-zinc-800 text-zinc-400 border border-zinc-700">
                              {act.category}
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                            {highlightMatches(act.subtitle, queryTokens)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 shrink-0 pl-2">
                        {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-amber-400" />}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                }

                if (item.type === 'machine') {
                  const m = item.data as Machine;
                  const inComp = isComparing(m.id);

                  return (
                    <div
                      key={m.id}
                      ref={isSelected ? selectedItemRef : null}
                      onClick={() => {
                        saveSearchQuery(`${m.brand} ${m.modelCode}`);
                        onClose();
                        if (onSelectMachine) onSelectMachine(m.id);
                        onNavigate('#/machinery');
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between p-2.5 rounded-[3px] cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-400/10 border border-amber-400/40 shadow-xs'
                          : 'hover:bg-zinc-800/60 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={m.image}
                          alt={m.name}
                          className="w-14 h-14 rounded-[3px] object-cover bg-zinc-950 shrink-0 border border-zinc-800"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-[2px] bg-amber-400 text-black">
                              {m.brand}
                            </span>
                            <span className="text-xs font-mono text-white font-black">
                              {highlightMatches(m.modelCode, queryTokens)}
                            </span>
                            <span className="text-[9px] px-1 py-0.2 rounded-[2px] font-bold bg-zinc-800 text-zinc-300">
                              {m.category}
                            </span>
                            {m.inStock ? (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-[2px] bg-emerald-500/20 text-emerald-400 font-bold flex items-center gap-1 uppercase">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>Stock Km 22</span>
                              </span>
                            ) : (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-[2px] bg-zinc-800 text-zinc-500 font-bold uppercase">
                                Sobre Pedido
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs font-bold text-white truncate mt-0.5 uppercase">
                            {highlightMatches(m.name, queryTokens)}
                          </h4>

                          <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5 flex-wrap font-mono">
                            <span>{m.powerHp} HP</span>
                            <span>•</span>
                            <span>{m.operatingWeightKg?.toLocaleString()} kg</span>
                            <span>•</span>
                            <span>{m.engine}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Quick Actions */}
                      <div className="flex items-center gap-1.5 pl-2 shrink-0">
                        <div className="text-right hidden sm:block">
                          <span className="text-xs font-bold text-amber-400 block font-mono">
                            {formatPrice(m.basePriceUsd)}
                          </span>
                          <span className="text-[9px] text-zinc-500 uppercase font-mono">Garantía oficial</span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleToggleComparisonQuick(e, m)}
                          className={`p-1.5 rounded-[2px] transition-all cursor-pointer ${
                            inComp
                              ? 'bg-blue-600 text-white'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                          }`}
                          title={inComp ? 'En Comparación' : 'Comparar Especificaciones'}
                          aria-label={`Comparar ${m.name}`}
                        >
                          <Scale className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQrModalItem({ product: m, type: 'machinery' });
                          }}
                          className="p-1.5 rounded-[2px] bg-zinc-800 hover:bg-amber-400 hover:text-black text-zinc-300 transition-colors cursor-pointer"
                          title="Generar Ficha Móvil QR"
                          aria-label={`Código QR para ${m.name}`}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>

                        <ArrowRight className="w-3.5 h-3.5 text-zinc-500 hidden sm:block" />
                      </div>
                    </div>
                  );
                }

                if (item.type === 'part') {
                  const p = item.data as Part;
                  const isAdded = addedPartFeedback === p.id;

                  return (
                    <div
                      key={p.id}
                      ref={isSelected ? selectedItemRef : null}
                      onClick={() => {
                        saveSearchQuery(`${p.brand} ${p.partNumber}`);
                        onClose();
                        if (onSelectPart) onSelectPart(p.id);
                        onNavigate('#/parts');
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between p-2.5 rounded-[3px] cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-400/10 border border-amber-400/40 shadow-xs'
                          : 'hover:bg-zinc-800/60 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-12 h-12 rounded-[3px] object-cover bg-zinc-950 shrink-0 border border-zinc-800"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono font-bold text-amber-400 px-1 py-0.2 rounded-[2px] bg-amber-400/10 border border-amber-400/20">
                              {highlightMatches(p.partNumber, queryTokens)}
                            </span>
                            <span className="text-[11px] font-bold text-zinc-300 uppercase">{p.brand}</span>
                            <span className="text-[9px] px-1 py-0.2 rounded-[2px] bg-zinc-800 text-zinc-400 font-bold uppercase">
                              {p.category}
                            </span>
                            {p.stockQty > 0 ? (
                              <span className="text-[9px] px-1 py-0.2 rounded-[2px] font-bold bg-emerald-500/20 text-emerald-400 uppercase">
                                {p.stockQty} en Patio Km 22
                              </span>
                            ) : (
                              <span className="text-[9px] px-1 py-0.2 rounded-[2px] font-bold bg-zinc-800 text-zinc-400 uppercase">
                                Importación 24h
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs font-bold text-white truncate mt-0.5 uppercase">
                            {highlightMatches(p.name, queryTokens)}
                          </h4>

                          <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                            Para: {p.compatibleModels?.slice(0, 3).join(', ')}
                          </div>
                        </div>
                      </div>

                      {/* Right Quick Actions */}
                      <div className="flex items-center gap-1.5 pl-2 shrink-0">
                        <div className="text-right hidden sm:block">
                          <span className="text-xs font-bold text-white block font-mono">
                            {formatPrice(p.priceUsd)}
                          </span>
                          <span className="text-[9px] text-zinc-500 font-mono uppercase">OEM Certificado</span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleAddToCartQuick(e, p)}
                          className={`p-1.5 rounded-[2px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            isAdded
                              ? 'bg-emerald-500 text-white'
                              : 'bg-amber-400 hover:bg-amber-300 text-black shadow-xs'
                          }`}
                          title="Agregar al Carrito"
                          aria-label={`Agregar ${p.name} al carrito`}
                        >
                          {isAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQrModalItem({ product: p, type: 'part' });
                          }}
                          className="p-1.5 rounded-[2px] bg-zinc-800 hover:bg-amber-400 hover:text-black text-zinc-300 transition-colors cursor-pointer"
                          title="Generar Ficha Móvil QR"
                          aria-label={`Código QR para ${p.name}`}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>

                        <ArrowRight className="w-3.5 h-3.5 text-zinc-500 hidden sm:block" />
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          )}
        </div>

        {/* Footer Navigation & Shortcut Hints */}
        <div className="p-2.5 sm:p-3 bg-zinc-950 border-t border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] text-zinc-400">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 rounded-[2px] bg-zinc-800 font-mono text-[9px] text-zinc-300">↑↓</kbd>
              <span>Navegar</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 rounded-[2px] bg-zinc-800 font-mono text-[9px] text-zinc-300">↵</kbd>
              <span>Abrir</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 rounded-[2px] bg-zinc-800 font-mono text-[9px] text-zinc-300">Esc</kbd>
              <span>Cerrar</span>
            </span>
            {topPredictiveSuggestion && query.trim() && (
              <span className="hidden md:flex items-center gap-1">
                <kbd className="px-1 py-0.2 rounded-[2px] bg-amber-400/20 text-amber-400 font-mono text-[9px]">Tab</kbd>
                <span>Autocompletar</span>
              </span>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[9px] font-mono text-zinc-500 overflow-x-auto max-w-full">
            <span className="text-zinc-400 font-bold uppercase hidden md:inline">Atajos Globales:</span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1 py-0.2 rounded-[2px] bg-zinc-900 border border-zinc-800 text-amber-400">Ctrl+M</kbd>
              <span>Maquinaria</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1 py-0.2 rounded-[2px] bg-zinc-900 border border-zinc-800 text-amber-400">Ctrl+P</kbd>
              <span>Repuestos</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1 py-0.2 rounded-[2px] bg-zinc-900 border border-zinc-800 text-amber-400">Ctrl+T</kbd>
              <span>Taller</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1 py-0.2 rounded-[2px] bg-zinc-900 border border-zinc-800 text-amber-400">Ctrl+Q</kbd>
              <span>Cotizar</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1 py-0.2 rounded-[2px] bg-zinc-900 border border-zinc-800 text-amber-400">Ctrl+L</kbd>
              <span>Telemetría</span>
            </span>
          </div>
        </div>
      </div>

      {/* Product QR Code Modal inside Search */}
      {qrModalItem && (
        <ProductQrCodeModal
          isOpen={true}
          onClose={() => setQrModalItem(null)}
          type={qrModalItem.type}
          product={qrModalItem.product}
        />
      )}
    </div>,
    document.body
  );
};
