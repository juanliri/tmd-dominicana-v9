import { LoyaltyPointsRecord, ProMemberReward, ProMemberDiscountTier } from '../types';
import { USD_TO_DOP_RATE } from './catalog';

export interface ProTierInfo {
  tier: 'Silver' | 'Gold' | 'Platinum';
  name: string;
  minPoints: number;
  maxPoints: number;
  colorHex: string;
  bgGradient: string;
  badgeBorder: string;
  textColor: string;
  partsDiscountPercent: number;
  pointsMultiplier: string;
  benefits: string[];
}

export const PRO_TIERS: Record<'Silver' | 'Gold' | 'Platinum', ProTierInfo> = {
  Silver: {
    tier: 'Silver',
    name: 'TMD Pro Silver',
    minPoints: 0,
    maxPoints: 999,
    colorHex: '#94A3B8',
    bgGradient: 'from-slate-700 via-zinc-800 to-zinc-900',
    badgeBorder: 'border-slate-400/40',
    textColor: 'text-slate-300',
    partsDiscountPercent: 10,
    pointsMultiplier: '1x',
    benefits: [
      '10% Descuento directo en repuestos genuinos OEM',
      'Acumulación de 1 Punto por cada US$ 1 facturado',
      'Despacho prioritario en patio Km 22 Autopista Duarte',
      'Acceso a consultas técnicas por WhatsApp con jefe de taller'
    ]
  },
  Gold: {
    tier: 'Gold',
    name: 'TMD Pro Gold Contractor',
    minPoints: 1000,
    maxPoints: 2499,
    colorHex: '#F59E0B',
    bgGradient: 'from-amber-600 via-amber-700 to-zinc-900',
    badgeBorder: 'border-amber-500/50',
    textColor: 'text-amber-400',
    partsDiscountPercent: 15,
    pointsMultiplier: '1.25x',
    benefits: [
      '15% Descuento permanente en repuestos, filtros y rodajes',
      'Acumulación acelerada de 1.25 Puntos por cada US$ 1',
      '1 Kit de análisis espectrométrico de aceite trimestral sin costo',
      'Asignación preferente de Taller Móvil en obra en <4 horas',
      'Línea VIP directa con soporte de fábrica LiuGong y JCB'
    ]
  },
  Platinum: {
    tier: 'Platinum',
    name: 'TMD Pro Platinum Fleet Master',
    minPoints: 2500,
    maxPoints: 99999,
    colorHex: '#E2E8F0',
    bgGradient: 'from-zinc-300 via-amber-200 to-amber-500',
    badgeBorder: 'border-amber-400',
    textColor: 'text-amber-300',
    partsDiscountPercent: 20,
    pointsMultiplier: '1.5x',
    benefits: [
      '20% Descuento máximo exclusivo en toda la tienda de repuestos',
      'Acumulación máxima de 1.5 Puntos por cada US$ 1',
      'Flete y despacho express gratis a cualquier provincia de RD',
      'Inspección preventiva bimensual en obra con técnico certificado',
      'Condiciones de crédito y financiamiento con tasa preferencial'
    ]
  }
};

export const getProTierForPoints = (points: number): ProTierInfo => {
  if (points >= 2500) return PRO_TIERS.Platinum;
  if (points >= 1000) return PRO_TIERS.Gold;
  return PRO_TIERS.Silver;
};

// Exclusive spare parts discount vouchers for Pro-Members
export const PRO_MEMBER_DISCOUNTS: ProMemberDiscountTier[] = [
  {
    id: 'disc-filters',
    category: 'Filtración & Mantenimiento Genuino',
    discountPercentage: 15,
    couponCode: 'PRO-FILTERS-15',
    description: 'Aplica a filtros de aceite, combustible, aire primario y separadores de agua Donaldson y OEM LiuGong/JCB.',
    badgeText: '15% OFF Filtros',
    applicableTo: 'filters'
  },
  {
    id: 'disc-undercarriage',
    category: 'Rodaje, Cadenas & Zapatas Heavy-Duty',
    discountPercentage: 12,
    couponCode: 'PRO-UNDERCARRIAGE-12',
    description: 'Descuento en cadenas selladas y lubricadas, rodillos superiores/inferiores y ruedas guía para excavadoras.',
    badgeText: '12% OFF Rodaje',
    applicableTo: 'undercarriage'
  },
  {
    id: 'disc-fluids',
    category: 'Lubricantes & Fluidos Hidráulicos',
    discountPercentage: 10,
    couponCode: 'PRO-LUBES-10',
    description: 'Válido para tambores (55 gal) y cubetas (5 gal) de aceite hidráulico ISO 46 / 68 y motor 15W40 CI-4.',
    badgeText: '10% OFF Aceites',
    applicableTo: 'fluids'
  },
  {
    id: 'disc-get',
    category: 'Puntas, Adaptadores & Cuchillas GET',
    discountPercentage: 18,
    couponCode: 'PRO-GET-18',
    description: 'Para dientes tipo Caterpillar J-Series, pasadores de retención y cuchillas de motoniveladora.',
    badgeText: '18% OFF Herramientas de Corte',
    applicableTo: 'get'
  },
  {
    id: 'disc-vip-all',
    category: 'Cualquier Repuesto Genuino en Catálogo',
    discountPercentage: 15,
    couponCode: 'PRO-MEMBER-VIP',
    description: 'Cupón general de miembro registrado TMD Pro aplicable al subtotal de cualquier pedido de repuestos.',
    badgeText: '15% OFF Global Pro',
    applicableTo: 'all_parts'
  }
];

// Catalog of redeemable loyalty rewards
export const PRO_REWARDS_CATALOG: ProMemberReward[] = [
  {
    id: 'rew-bonus-25',
    title: 'Bono US$ 25 en Repuestos Genuinos',
    pointsCost: 350,
    description: 'Cupón de crédito de US$ 25 (~RD$ 1,512) aplicable inmediatamente a cualquier compra de repuestos o lubricantes.',
    code: 'BONO25-PRO',
    category: 'discount',
    valueEstimateUsd: 25,
    badge: 'Popular'
  },
  {
    id: 'rew-oil-analysis',
    title: 'Kit de Análisis Espectrométrico de Aceite',
    pointsCost: 600,
    description: 'Toma de muestra y reporte de laboratorio certificado de desgaste de motor o sistema hidráulico.',
    code: 'LAB-OIL-FREE',
    category: 'service',
    valueEstimateUsd: 55,
    badge: 'Servicio Técnico'
  },
  {
    id: 'rew-bonus-50',
    title: 'Bono US$ 50 en Filtros Heavy-Duty',
    pointsCost: 750,
    description: 'Crédito directo de US$ 50 (~RD$ 3,025) para paquetes de filtros de mantenimiento 500h o 1,000h.',
    code: 'BONO50-FILTERS',
    category: 'discount',
    valueEstimateUsd: 50,
    badge: 'Mayor Ahorro'
  },
  {
    id: 'rew-express-shipping',
    title: 'Flete Express Bonificado a Cualquier Provincia',
    pointsCost: 300,
    description: 'Envío gratuito en 24h a Santiago, Punta Cana, Barahona o Samaná para pedidos de repuestos de emergencia.',
    code: 'FLETE-PRO-FREE',
    category: 'shipping',
    valueEstimateUsd: 25
  },
  {
    id: 'rew-mobile-inspection',
    title: 'Inspección Preventiva en Obra (Taller Móvil)',
    pointsCost: 1400,
    description: 'Visita presencial de una unidad móvil TMD a su cantera o proyecto con diagnóstico computarizado y reporte de 50 puntos.',
    code: 'INSPECCION-CAMPO-0',
    category: 'service',
    valueEstimateUsd: 120,
    badge: 'VIP Obra'
  },
  {
    id: 'rew-gear-vest',
    title: 'Chaleco de Seguridad Alta Visibilidad TMD Contractor',
    pointsCost: 450,
    description: 'Chaleco reflectivo industrial reforzado clase 3 con bordado oficial TMD Dominicana y bolsillo para tableta.',
    code: 'MERCH-VEST-PRO',
    category: 'merchandise',
    valueEstimateUsd: 35
  }
];

// Initial demo points activity ledger for registered contractors
export const getInitialLoyaltyRecords = (userName: string = 'Cliente'): LoyaltyPointsRecord[] => [
  {
    id: 'pts-reg-01',
    date: '15 Ene 2026',
    activity: 'Bienvenida Registro Plataforma TMD Pro',
    points: 250,
    type: 'earned',
    category: 'bonus'
  },
  {
    id: 'pts-eq-02',
    date: '02 Feb 2026',
    activity: 'Registro de Ficha de Flota (Excavadora LiuGong 922E)',
    points: 200,
    type: 'earned',
    category: 'equipment_registration'
  },
  {
    id: 'pts-serv-03',
    date: '15 Feb 2026',
    activity: 'Servicio Preventivo 500 Horas Completado (OT-2026-0891)',
    points: 350,
    type: 'earned',
    orderReference: 'OT-2026-0891',
    category: 'service_order'
  },
  {
    id: 'pts-part-04',
    date: '18 Mar 2026',
    activity: 'Compra de Kit de Filtros y Dientes J-350 (Pedido ORD-2026-4412)',
    points: 450,
    type: 'earned',
    orderReference: 'ORD-2026-4412',
    category: 'part_purchase'
  },
  {
    id: 'pts-serv-05',
    date: '02 Jul 2026',
    activity: 'Diagnóstico Hidráulico en Cantera (OT-2026-0924)',
    points: 250,
    type: 'earned',
    orderReference: 'OT-2026-0924',
    category: 'service_order'
  },
  {
    id: 'pts-part-06',
    date: '12 Ago 2026',
    activity: 'Suministro de 2 Tambores Aceite Hidráulico ISO 46 (ORD-2026-7821)',
    points: 350,
    type: 'earned',
    orderReference: 'ORD-2026-7821',
    category: 'part_purchase'
  }
];

const LOCAL_PRO_POINTS_KEY = 'tmd-pro-member-points';
const LOCAL_PRO_RECORDS_KEY = 'tmd-pro-member-records';
const LOCAL_PRO_REDEEMED_KEY = 'tmd-pro-member-redeemed';

export const getStoredProPoints = (defaultPoints: number = 1850): number => {
  try {
    const saved = localStorage.getItem(LOCAL_PRO_POINTS_KEY);
    return saved ? parseInt(saved, 10) : defaultPoints;
  } catch {
    return defaultPoints;
  }
};

export const saveStoredProPoints = (points: number) => {
  try {
    localStorage.setItem(LOCAL_PRO_POINTS_KEY, points.toString());
  } catch (e) {
    console.warn('Could not save points to local storage', e);
  }
};

export const getStoredPointsLedger = (userName: string = 'Cliente'): LoyaltyPointsRecord[] => {
  try {
    const saved = localStorage.getItem(LOCAL_PRO_RECORDS_KEY);
    return saved ? JSON.parse(saved) : getInitialLoyaltyRecords(userName);
  } catch {
    return getInitialLoyaltyRecords(userName);
  }
};

export const saveStoredPointsLedger = (records: LoyaltyPointsRecord[]) => {
  try {
    localStorage.setItem(LOCAL_PRO_RECORDS_KEY, JSON.stringify(records));
  } catch (e) {
    console.warn('Could not save points records', e);
  }
};

export const getStoredRedeemedRewards = (): string[] => {
  try {
    const saved = localStorage.getItem(LOCAL_PRO_REDEEMED_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const saveStoredRedeemedReward = (rewardId: string) => {
  try {
    const current = getStoredRedeemedRewards();
    localStorage.setItem(LOCAL_PRO_REDEEMED_KEY, JSON.stringify([...current, rewardId]));
  } catch (e) {
    console.warn('Could not save redeemed reward', e);
  }
};
