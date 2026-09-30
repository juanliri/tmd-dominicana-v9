import { Machine, Part } from '../types';
import { MACHINES_DATA } from '../data/catalog';
import { PARTS_DATA } from '../data/parts';
import { IN_HOUSE_MACHINERY_CATALOG, IN_HOUSE_PARTS_CATALOG } from '../data/inHouseCatalogs';
import { EXTENDED_MACHINES_DATA } from './firestoreCatalogService';
import { OFFICIAL_MACHINERY_CATALOG } from '../data/officialCatalogs';

export interface CdnScriptModule {
  id: string;
  name: string;
  url: string;
  globalKey: string;
  alternateKeys?: string[];
  brand: string;
  productType: 'machinery' | 'parts' | 'mixed' | 'registry';
  expectedCount?: number;
}

export const TMD_CDN_MODULES: CdnScriptModule[] = [
  {
    id: 'multibrand_registry',
    name: 'TMD Multibrand Registry Engine',
    url: 'https://tmd-dominicana-v9.vercel.app/assets/tmd_multibrand_registry.js',
    globalKey: 'TMD_BRAND_REGISTRY',
    alternateKeys: ['TMD_MULTIBRAND_REGISTRY', 'TMD_REGISTRY', 'tmdMultibrandRegistry'],
    brand: 'All',
    productType: 'registry',
  },
  {
    id: 'jcb_catalog',
    name: 'JCB Heavy Machinery & Attachments (106 items)',
    url: 'https://tmd-dominicana-v9.vercel.app/assets/tmd_jcb_catalog_data.js',
    globalKey: 'TMD_JCB_CATALOG',
    alternateKeys: ['TMD_JCB_DATA', 'tmdJcbCatalog', 'JCB_CATALOG_DATA'],
    brand: 'JCB',
    productType: 'machinery',
    expectedCount: 127,
  },
  {
    id: 'liugong_catalog',
    name: 'LiuGong Heavy Excavators & Loaders',
    url: 'https://tmd-dominicana-v9.vercel.app/assets/tmd_liugong_catalog_data.js',
    globalKey: 'TMD_LIUGONG_CATALOG',
    alternateKeys: ['TMD_LIUGONG_DATA', 'tmdLiugongCatalog', 'LIUGONG_CATALOG_DATA'],
    brand: 'LiuGong',
    productType: 'machinery',
    expectedCount: 14,
  },
  {
    id: 'kubota_catalog',
    name: 'Kubota Agricultural & Construction (58 items)',
    url: 'https://tmd-dominicana-v9.vercel.app/assets/tmd_kubota_catalog_data.js',
    globalKey: 'TMD_KUBOTA_CATALOG',
    alternateKeys: ['TMD_KUBOTA_DATA', 'tmdKubotaCatalog', 'KUBOTA_CATALOG_DATA'],
    brand: 'Kubota',
    productType: 'machinery',
    expectedCount: 15,
  },
  {
    id: 'ls_tractor_catalog',
    name: 'LS Tractor Korea & USA (24 items)',
    url: 'https://tmd-dominicana-v9.vercel.app/assets/tmd_ls_tractor_catalog_data.js',
    globalKey: 'TMD_LSTRACTOR_CATALOG',
    alternateKeys: ['TMD_LS_TRACTOR_CATALOG', 'tmdLsTractorCatalog', 'LS_TRACTOR_CATALOG_DATA'],
    brand: 'LS Tractor',
    productType: 'machinery',
    expectedCount: 12,
  },
  {
    id: 'yanmar_catalog',
    name: 'Yanmar Tractors & Rice Harvesters (28 items)',
    url: 'https://tmd-dominicana-v9.vercel.app/assets/tmd_yanmar_catalog_data.js',
    globalKey: 'TMD_YANMAR_CATALOG',
    alternateKeys: ['TMD_YANMAR_DATA', 'tmdYanmarCatalog', 'YANMAR_CATALOG_DATA'],
    brand: 'Yanmar',
    productType: 'machinery',
    expectedCount: 12,
  },
  {
    id: 'ammann_catalog',
    name: 'Ammann Compaction & Rollers (38 items)',
    url: 'https://tmd-dominicana-v9.vercel.app/assets/tmd_ammann_catalog_data.js',
    globalKey: 'TMD_AMMANN_CATALOG',
    alternateKeys: ['TMD_AMMANN_DATA', 'tmdAmmannCatalog', 'AMMANN_CATALOG_DATA'],
    brand: 'Ammann',
    productType: 'machinery',
    expectedCount: 14,
  },
  {
    id: 'imer_catalog',
    name: 'IMER Group Concrete Machinery & Mixers',
    url: 'https://tmd-dominicana-v9.vercel.app/assets/tmd_imer_catalog_data.js',
    globalKey: 'TMD_IMER_CATALOG',
    alternateKeys: ['TMD_IMER_DATA', 'tmdImerCatalog', 'IMER_CATALOG_DATA'],
    brand: 'IMER',
    productType: 'machinery',
    expectedCount: 12,
  },
  {
    id: 'afex_catalog',
    name: 'AFEX Fire Suppression Heavy Systems',
    url: 'https://tmd-dominicana-v9.vercel.app/assets/tmd_afex_catalog_data.js',
    globalKey: 'TMD_AFEX_CATALOG',
    alternateKeys: ['TMD_AFEX_DATA', 'tmdAfexCatalog', 'AFEX_CATALOG_DATA'],
    brand: 'AFEX',
    productType: 'mixed',
    expectedCount: 13,
  },
  {
    id: 'yomel_orsi_celli_data',
    name: 'Yomel, Orsi & Celli Agricultural Implements',
    url: 'https://tmd-dominicana-v9.vercel.app/assets/tmd_yomel_orsi_celli_data.js',
    globalKey: 'TMD_IMPLEMENTS_CATALOG',
    alternateKeys: ['TMD_YOMEL_ORSI_CELLI_DATA', 'TMD_AGRICULTURAL_IMPLEMENTS', 'tmdYomelOrsiCelliData'],
    brand: 'Yomel / Orsi / Celli',
    productType: 'mixed',
    expectedCount: 14,
  },
];

// Official fallback items directly from manufacturer specifications
export const CDN_CATALOG_FALLBACK_MACHINES: Machine[] = OFFICIAL_MACHINERY_CATALOG;

// High-res photo resolver by equipment type and brand
function resolveMachineImageUrl(item: any, brand: string, category: string): string {
  if (typeof item.image === 'string' && item.image.startsWith('http')) {
    return item.image;
  }
  if (Array.isArray(item.images) && typeof item.images[0] === 'string' && item.images[0].startsWith('http')) {
    return item.images[0];
  }

  const b = (brand || '').toLowerCase();
  const c = (category || '').toLowerCase();

  if (b.includes('liugong')) {
    if (c.includes('cargador') || c.includes('loader')) {
      return '/assets/machinery/LiuGong_856H_Wheel_Loader_Official_Photo.jpg';
    }
    if (c.includes('motoniveladora') || c.includes('grader')) {
      return '/assets/machinery/LiuGong_922E_Excavator_Official_Photo.jpg';
    }
    if (c.includes('bulldozer') || c.includes('topador')) {
      return '/assets/machinery/heavy_liugong_922e_hd_22_ton.jpg';
    }
    return '/assets/machinery/LiuGong_922E_Long_Reach_Official_Photo.jpg';
  }

  if (b.includes('kubota')) {
    if (c.includes('mini') || c.includes('excavador')) {
      return '/assets/machinery/Kubota_Main-Category-Excavators-2048x1152.jpg';
    }
    if (c.includes('ctl') || c.includes('cargador')) {
      return '/assets/machinery/Kubota_Main-Category-Utility-Tractor-Implements.jpg';
    }
    return '/assets/machinery/Kubota_Industry-construction-1360x765.jpg';
  }

  if (b.includes('ls tractor')) {
    return '/assets/machinery/heavy_blue_agricultural_tractor_ls_mt7.jpg';
  }

  if (b.includes('yanmar')) {
    if (c.includes('cosechadora') || c.includes('harvester')) {
      return '/assets/machinery/rugged_utility_farm_tractor_with_heavy.jpg';
    }
    return '/assets/machinery/modern_high_performance_farm_tractor_with.jpg';
  }

  if (c.includes('manipulador') || c.includes('loadall')) {
    return '/assets/machinery/jcb_loadall_531_70_telescopic_handler.jpg';
  }

  if (c.includes('mini') && c.includes('cargador')) {
    return '/assets/machinery/JCB_250.jpg';
  }

  return '/assets/machinery/heavy_duty_yellow_jcb_3cx_eco.jpg';
}

// Helper to normalize any incoming item from CDN window objects into a Machine
function normalizeCdnItemToMachine(item: any, fallbackBrand: string): Machine {
  const brand = (item.brand || fallbackBrand || 'JCB') as any;
  const rawCat = String(item.subcategoryName || item.category || item.subcategory || item.series || 'Excavadoras');
  let category: any = 'Excavadoras';
  const lCat = rawCat.toLowerCase();
  if (lCat.includes('retro') || lCat.includes('backhoe')) {
    category = 'Retroexcavadoras';
  } else if ((lCat.includes('mini') && lCat.includes('cargador')) || lCat.includes('ctl') || lCat.includes('skid')) {
    category = 'Minicargadores';
  } else if (lCat.includes('excavador') || lCat.includes('excavator')) {
    category = 'Excavadoras';
  } else if (lCat.includes('cargador') || lCat.includes('wheel loader') || lCat.includes('pala')) {
    category = 'Cargadores';
  } else if (lCat.includes('tractor')) {
    category = 'Tractores';
  } else if (lCat.includes('rodillo') || lCat.includes('compacta') || lCat.includes('roller')) {
    category = 'Compactación';
  } else if (lCat.includes('concreto') || lCat.includes('hormigon') || lCat.includes('mixer') || lCat.includes('planta')) {
    category = 'Plantas de Concreto';
  } else if (lCat.includes('incendio') || lCat.includes('afex') || lCat.includes('fire') || lCat.includes('supresion')) {
    category = 'Sistemas Contra Incendios';
  } else if (lCat.includes('implemento') || lCat.includes('desbrozadora') || lCat.includes('rotocultivador') || lCat.includes('fresadora') || lCat.includes('mower') || lCat.includes('tiller')) {
    category = 'Implementos Agrícolas';
  } else if (lCat.includes('manipulador') || lCat.includes('telehandler') || lCat.includes('loadall')) {
    category = 'Manipuladores';
  } else if (lCat.includes('aditamento') || lCat.includes('attachment') || lCat.includes('martillo') || lCat.includes('balde') || lCat.includes('cazo')) {
    category = 'Aditamentos e Implementos';
  } else {
    category = rawCat;
  }

  const modelCode = String(item.modelCode || item.code || item.model || item.sku || 'TMD-STD');
  const name = String(item.title || item.name || (item.model ? `${brand} ${item.model}` : 'Equipo TMD Certificado'));
  const id = String(item.id || `${brand}-${modelCode}`).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  
  const priceUsd = Number(item.priceUSD || item.priceUsd || item.price || item.basePriceUsd || (item.priceDOP ? Math.round(item.priceDOP / 59.5) : 45000));
  const powerHp = Number(item.powerHp || item.netPowerHp || item.engineHP || item.hp || item.power || 0);
  const operatingWeightKg = Number(
    item.operatingWeightKg ||
    item.weightKg ||
    (item.operatingWeight ? parseInt(String(item.operatingWeight).replace(/[^0-9]/g, '')) : 0) ||
    0
  );

  let specs: { label: string; value: string }[] = [];
  if (Array.isArray(item.specs) && item.specs.length > 0) {
    specs = item.specs;
  } else if (item.highlights?.es && Array.isArray(item.highlights.es)) {
    specs = item.highlights.es.map((h: string, idx: number) => ({
      label: `Especificación ${idx + 1}`,
      value: h
    }));
  } else {
    specs = [
      { label: 'Garantía TMD Care', value: '2 Años o 2,000 Horas Oficial de Fábrica' },
      { label: 'Soporte y Repuestos', value: 'Almacén Central Autopista Duarte Km 22' },
      { label: 'Disponibilidad', value: item.inStock !== false ? 'Entrega Inmediata en Patio' : 'Sobre Pedido Directo de Planta' }
    ];
  }

  let applications: string[] = ['Construcción e Infraestructura', 'Movimiento de Tierras', 'Minería y Canteras'];
  if (Array.isArray(item.applications) && item.applications.length > 0) {
    applications = item.applications;
  } else if (item.applications?.es && Array.isArray(item.applications.es)) {
    applications = item.applications.es;
  }

  return {
    id,
    name,
    brand,
    category,
    modelCode,
    year: Number(item.year || 2026),
    image: resolveMachineImageUrl(item, brand, category),
    powerHp,
    operatingWeightKg,
    bucketCapacityM3: item.bucketCapacityM3 ? Number(item.bucketCapacityM3) : undefined,
    engine: String(item.engine || item.engineModel || item.engineBrand || 'Diésel Industrial Certificado'),
    description: String(
      item.description ||
      item.tagline ||
      item.overview ||
      (item.highlights?.es ? item.highlights.es.join('. ') : 'Equipo oficial certificado respaldado por TMD Dominicana en Autopista Duarte Km 22.')
    ),
    inStock: item.inStock !== false,
    featured: Boolean(item.featured),
    basePriceUsd: priceUsd,
    specs,
    applications
  };
}

/**
 * Inspect the global window context to load data injected by the CDN script tags
 */
export function loadAllCdnProducts(): {
  machines: Machine[];
  parts: Part[];
  loadedModules: { id: string; name: string; loaded: boolean; count: number }[];
} {
  const loadedModules: { id: string; name: string; loaded: boolean; count: number }[] = [];
  const cdnMachines: Machine[] = [];
  const cdnParts: Part[] = [];

  const globalWin = typeof window !== 'undefined' ? (window as any) : {};

  TMD_CDN_MODULES.forEach((mod) => {
    let rawData: any = globalWin[mod.globalKey];

    // Check alternate keys
    if (!rawData && mod.alternateKeys) {
      for (const alt of mod.alternateKeys) {
        if (globalWin[alt]) {
          rawData = globalWin[alt];
          break;
        }
      }
    }

    if (rawData) {
      // Robust multi-format extraction:
      let items: any[] = [];
      if (typeof rawData.getAllProducts === 'function') {
        items = rawData.getAllProducts();
      } else if (rawData.machines && rawData.attachments) {
        items = [...rawData.machines, ...rawData.attachments];
      } else if (Array.isArray(rawData)) {
        items = rawData;
      } else if (Array.isArray(rawData.items)) {
        items = rawData.items;
      } else if (Array.isArray(rawData.products)) {
        items = rawData.products;
      } else if (Array.isArray(rawData.catalog)) {
        items = rawData.catalog;
      } else if (Array.isArray(rawData.data)) {
        items = rawData.data;
      }

      const count = items.length;
      loadedModules.push({
        id: mod.id,
        name: mod.name,
        loaded: true,
        count: count > 0 ? count : (mod.expectedCount || 1)
      });

      if (Array.isArray(items)) {
        items.forEach((item: any) => {
          const isPart = Boolean(
            item.partNumber ||
            mod.productType === 'parts' ||
            item.category === 'attachments' ||
            item.subcategory === 'attachments' ||
            item.category === 'Filtros' ||
            item.category === 'Aceites'
          );

          if (isPart) {
            const partId = String(item.id || item.sku || `part-${item.partNumber || Math.random().toString(36).substr(2, 7)}`).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
            cdnParts.push({
              id: partId,
              partNumber: String(item.partNumber || item.sku || item.model || 'OEM-PART'),
              name: String(item.name || item.title || item.model || 'Componente Certificado'),
              brand: String(item.brand || mod.brand),
              category: (item.category || item.subcategoryName || 'Filtros') as any,
              compatibleModels: Array.isArray(item.compatibleModels) && item.compatibleModels.length > 0
                ? item.compatibleModels
                : [`Equipos ${mod.brand} Series`],
              priceUsd: Number(item.priceUSD || item.priceUsd || item.price || 150),
              stockQty: Number(item.stockQty || 15),
              image: resolveMachineImageUrl(item, mod.brand, item.category || 'parts'),
              description: String(item.description || item.tagline || 'Repuesto genuino de alta durabilidad con garantía oficial TMD.'),
              isOem: item.isOem !== false,
              deliveryTimeHours: Number(item.deliveryTimeHours || 24)
            });
          }

          // Even if attachment, also add to machinery so it shows in the full store
          cdnMachines.push(normalizeCdnItemToMachine(item, mod.brand));
        });
      }
    } else {
      loadedModules.push({
        id: mod.id,
        name: mod.name,
        loaded: false,
        count: 0
      });
    }
  });

  // Always include rich in-house and fallback catalog entries so the store works completely offline/in-house
  const combinedFallback = [
    ...IN_HOUSE_MACHINERY_CATALOG,
    ...EXTENDED_MACHINES_DATA,
    ...CDN_CATALOG_FALLBACK_MACHINES
  ];
  
  // Merge deduplicating by ID
  const map = new Map<string, Machine>();
  combinedFallback.forEach(m => map.set(m.id, m));
  cdnMachines.forEach(m => map.set(m.id, m));

  const partsMap = new Map<string, Part>();
  [...IN_HOUSE_PARTS_CATALOG, ...PARTS_DATA, ...cdnParts].forEach(p => {
    const key = p.id || p.partNumber;
    partsMap.set(key, p);
  });

  const finalMachines = Array.from(map.values());
  const finalParts = Array.from(partsMap.values());

  return {
    machines: finalMachines,
    parts: finalParts,
    loadedModules
  };
}

/**
 * Returns complete aggregated machines across local datasets + CDN Vercel scripts
 */
export function getUnifiedStoreMachinery(): Machine[] {
  const { machines } = loadAllCdnProducts();
  return machines;
}

/**
 * Returns complete aggregated parts across local datasets + CDN Vercel scripts
 */
export function getUnifiedStoreParts(): Part[] {
  const { parts } = loadAllCdnProducts();
  return parts;
}
