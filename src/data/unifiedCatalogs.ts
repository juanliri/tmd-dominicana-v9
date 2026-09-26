/**
 * TMD DOMINICANA — UNIFIED MULTI-BRAND CATALOG REGISTRY & PRICE VERIFICATION
 * Tecnomaquinarias Diesel S.R.L.
 *
 * Consolidates technical specifications, official prices (USD and DOP via TMD engine),
 * warranties, and attachments across all 8 certified brands:
 * 1. JCB (106 machines & attachments)
 * 2. LiuGong (Heavy excavators, loaders, graders, dozers)
 * 3. Kubota (BX/L/M Tractors, KX Mini-excavators, SVL CTLs)
 * 4. LS Tractor (MT1, XJ, MT2, MT3, MT4, MT5)
 * 5. Yanmar (SA, YT, YM, EF, Rice Harvesters AG6, Transplanters AP)
 * 6. Ammann (Soil & asphalt rollers, vibratory plates, rammers)
 * 7. IMER Group (Concrete batching plants, mixers, pumps, vibrators)
 * 8. AFEX (Automated Fire Suppression Systems NFPA 17A)
 */

export interface CatalogBrandSummary {
  id: string;
  name: string;
  totalProducts: number;
  currency: string;
  warranty: string;
  origin: string;
  categories: string[];
}

export const CATALOG_BRANDS: CatalogBrandSummary[] = [
  {
    id: 'JCB',
    name: 'JCB Heavy Products & Attachments',
    totalProducts: 106,
    currency: 'USD',
    warranty: 'Garantía TMD Oficial: 2,000 Horas / 1 Año con Cobertura Km 22',
    origin: 'Reino Unido / Global',
    categories: ['Minicargadores de Oruga (CTL)', 'Retroexcavadoras (3CX/4CX)', 'Minicargadores de Ruedas', 'Excavadoras de Oruga', 'Mini-Excavadoras', 'Manipuladores (Loadall)', 'Palas Cargadoras', 'Montacargas Todo Terreno', 'Compactadores y Rodillos', 'Volquetes de Obra', 'Martillos Hidráulicos', 'Baldes y Cucharones', 'Horquillas Portapalet', 'Fresadoras y Zanjadoras', 'Garras y Pinzas', 'Desbrozadoras Forestales']
  },
  {
    id: 'LIUGONG',
    name: 'LiuGong Heavy Machinery',
    totalProducts: 13,
    currency: 'USD',
    warranty: '2 años / 2,000 horas de garantía de fábrica',
    origin: 'China / Global',
    categories: ['Cargadores de Rueda (835T, 856T, 878T)', 'Mini Excavadoras (906E, 908E, 915E)', 'Excavadoras de Cadena (922E, 925E, 930E, 950E)', 'Motoniveladoras (4180D, 4215D)', 'Bulldozers (B160CL, B230)']
  },
  {
    id: 'KUBOTA',
    name: 'Kubota Agricultural & Construction',
    totalProducts: 58,
    currency: 'USD',
    warranty: 'Garantía oficial Kubota / TMD Care',
    origin: 'Japón / EE.UU.',
    categories: ['Tractores Sub-Compactos (BX1880, BX23S, BX2680)', 'Tractores Compactos (L3301, L3901, L4701, L5460)', 'Tractores Utilitarios (M5-091, M6-111)', 'Mini Excavadoras (KX018, KX033, KX040, KX057)', 'Compact Track Loaders (SVL65-2S, SVL75-2S)']
  },
  {
    id: 'LSTRACTOR',
    name: 'LS Tractor Korea & USA',
    totalProducts: 24,
    currency: 'USD',
    warranty: '2 años / sin límite de horas (tractores)',
    origin: 'Corea del Sur / EE.UU.',
    categories: ['Tractores Sub-Compactos (MT122, MT125, XJ2025H)', 'Tractores Compactos (MT225S, MT225HE, MT235E, MT240E, MT345, MT357)', 'Tractores Utilitarios (MT445, MT473C, MT573CPS)']
  },
  {
    id: 'YANMAR',
    name: 'Yanmar Agriculture & Rice Solutions',
    totalProducts: 28,
    currency: 'USD',
    warranty: '2 años de garantía — motor y transmisión',
    origin: 'Japón',
    categories: ['Tractores Compactos (SA221, SA324, YT235, YT347, YT359)', 'Tractores Utilitarios (YM359D, YM489D)', 'Motocultores (EF453T)', 'Cosechadoras de Arroz (AG600, AG6 II)', 'Trasplantadoras de Arroz (AP4, AP6R)']
  },
  {
    id: 'AMMANN',
    name: 'Ammann Group Compaction',
    totalProducts: 38,
    currency: 'USD',
    warranty: '2 años (partes) / 1 año (motor)',
    origin: 'Suiza',
    categories: ['Rodillos de Suelo (ARS 50, ARS 70, ARS 100, ARS 130)', 'Rodillos de Asfalto (ARX 12, ARX 26, ARX 90)', 'Placas Vibratorias (APF 15, APF 30, APF 60)', 'Apisonadores / Saltarines (ACR 60, ACR 80)', 'Accesorios Hidráulicos (APA 20, APA 50)']
  },
  {
    id: 'IMER',
    name: 'IMER Group Concrete Machinery',
    totalProducts: 24,
    currency: 'USD',
    warranty: '1 año / 1,000 horas',
    origin: 'Italia',
    categories: ['Plantas Móviles de Concreto (MCBP 30, MCBP 60, Sprint 350)', 'Mezcladoras Industriales (BM 750, MC 1200, MC 2000)', 'Mezcladoras de Mortero (MONO 200, MONO 500)', 'Bombas de Concreto (PUMP 25 C, PUMP 50 D)', 'Vibradores de Inmersión (VIB 38, VIB 65)']
  },
  {
    id: 'AFEX',
    name: 'AFEX Fire Suppression Systems',
    totalProducts: 18,
    currency: 'USD',
    warranty: '5 años en componentes del sistema (Certificación NFPA 17A / FM Global)',
    origin: 'EE.UU. / Australia',
    categories: ['Sistemas para Maquinaria de Construcción', 'Sistemas para Maquinaria Agrícola', 'Sistemas para Maquinaria Pesada (Minería)', 'Detección y Control (LHD, Paneles)', 'Servicio y Recarga']
  }
];

/**
 * Global exchange rate verification engine
 */
export const VERIFIED_EXCHANGE_RATE = 60.5; // Dominican Peso (DOP) per USD (Current Banco Central / Market)

export function convertUsdToDop(usd: number): number {
  return Math.round(usd * VERIFIED_EXCHANGE_RATE);
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDop(amount: number): string {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    maximumFractionDigits: 0
  }).format(amount);
}
