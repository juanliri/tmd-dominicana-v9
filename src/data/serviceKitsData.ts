import { ServiceKitDefinition } from '../types';
import { USD_TO_DOP_RATE } from './catalog';

export const OFFICIAL_SERVICE_KITS: ServiceKitDefinition[] = [
  // 1. LiuGong 922E Excavator - 250h Kit
  {
    id: 'kit-lg922e-250h',
    kitCode: 'KIT-LG-250H',
    brand: 'LiuGong',
    compatibleModels: ['922E', '920E', '925E'],
    intervalHours: 250,
    title: 'Kit de Servicio 250 Horas - LiuGong 922E (Motor Cummins QSB 6.7)',
    description: 'Servicio menor de lubricación y filtración diésel primaria para excavadoras de orugas en trabajo continuo.',
    filterParts: [
      { partNumber: '40C0448', name: 'Filtro de Aceite de Motor Diésel Primario', type: 'oil_filter', quantity: 1 },
      { partNumber: '53C0053', name: 'Filtro Separador de Agua y Combustible (10 micras)', type: 'fuel_filter', quantity: 1 }
    ],
    fluidSpecifications: [
      { name: 'Aceite de Motor 15W-40 CK-4 Heavy Duty', grade: 'API CK-4 / CES 20086', volumeGallons: 5.5 }
    ],
    priceUsd: 385,
    priceDop: Math.round(385 * USD_TO_DOP_RATE),
    inStock: true,
    image: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=600&q=80'
  },
  // 2. LiuGong 922E Excavator - 500h Kit
  {
    id: 'kit-lg922e-500h',
    kitCode: 'KIT-LG-500H',
    brand: 'LiuGong',
    compatibleModels: ['922E', '920E', '925E', '936E'],
    intervalHours: 500,
    title: 'Kit de Servicio 500 Horas - LiuGong 922E Completo (Filtros + Fluidos)',
    description: 'Servicio estándar preventivo con filtración de combustible secundario, aire primario y aceite hidráulico.',
    filterParts: [
      { partNumber: '40C0448', name: 'Filtro de Aceite Motor Diésel OEM', type: 'oil_filter', quantity: 1 },
      { partNumber: '53C0053', name: 'Filtro Separador Agua/Combustible', type: 'fuel_filter', quantity: 1 },
      { partNumber: 'FS19732', name: 'Filtro Secundario Combustible Fleetguard', type: 'fuel_filter', quantity: 1 },
      { partNumber: '40039211', name: 'Filtro de Retorno Circuito Hidráulico', type: 'hydraulic_filter', quantity: 1 },
      { partNumber: 'AF25557', name: 'Elemento Primario Filtro de Aire Donaldson', type: 'air_primary', quantity: 1 }
    ],
    fluidSpecifications: [
      { name: 'Aceite Motor 15W-40 CK-4', grade: 'API CK-4', volumeGallons: 5.5 },
      { name: 'Aceite Hidráulico ISO VG 46', grade: 'Anti-Wear DIN 51524-2', volumeGallons: 10 }
    ],
    priceUsd: 850,
    priceDop: Math.round(850 * USD_TO_DOP_RATE),
    inStock: true,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
  },
  // 3. LiuGong 922E Excavator - 1000h Kit Mayor
  {
    id: 'kit-lg922e-1000h',
    kitCode: 'KIT-LG-1000H',
    brand: 'LiuGong',
    compatibleModels: ['922E', '925E', '930E', '936E'],
    intervalHours: 1000,
    title: 'Kit de Servicio Mayor 1,000 Horas - LiuGong 922E (Overhaul de Filtración)',
    description: 'Kit integral mayor: todos los filtros de succión, retorno, aire de seguridad, mandos finales y refrigerante ELC.',
    filterParts: [
      { partNumber: '40C0448', name: 'Filtro de Aceite Motor OEM', type: 'oil_filter', quantity: 2 },
      { partNumber: 'FS19732', name: 'Filtro Combustible Primario & Secundario', type: 'fuel_filter', quantity: 2 },
      { partNumber: '40039211', name: 'Filtro Retorno & Succión Hidráulica', type: 'hydraulic_filter', quantity: 2 },
      { partNumber: 'AF25557', name: 'Filtro de Aire Primario Donaldson', type: 'air_primary', quantity: 1 },
      { partNumber: 'AF25558', name: 'Filtro de Seguridad Interior Aire', type: 'air_secondary', quantity: 1 }
    ],
    fluidSpecifications: [
      { name: 'Aceite Motor Diésel 15W-40', grade: 'API CK-4', volumeGallons: 6 },
      { name: 'Aceite Mandos Finales 80W-90 GL-5', grade: 'Extreme Pressure', volumeGallons: 4 },
      { name: 'Aceite Hidráulico ISO VG 46', grade: 'ISO 46 Premium', volumeGallons: 20 },
      { name: 'Refrigerante 50/50 ELC Larga Vida', grade: 'ASTM D6210', volumeGallons: 5 }
    ],
    priceUsd: 1650,
    priceDop: Math.round(1650 * USD_TO_DOP_RATE),
    inStock: true,
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80'
  },
  // 4. JCB 3CX Eco Retroexcavadora - 500h Kit
  {
    id: 'kit-jcb3cx-500h',
    kitCode: 'KIT-JCB-500H',
    brand: 'JCB',
    compatibleModels: ['3CX Eco', '4CX', '3DX Super'],
    intervalHours: 500,
    title: 'Kit de Servicio 500 Horas - JCB 3CX Eco (Motor Dieselmax 4.4L)',
    description: 'Kit de filtros genuinos JCB Service Master para retroexcavadora 4x4.',
    filterParts: [
      { partNumber: '320/04133', name: 'Filtro de Aceite JCB Dieselmax', type: 'oil_filter', quantity: 1 },
      { partNumber: '320/07155', name: 'Filtro de Combustible Spin-On JCB', type: 'fuel_filter', quantity: 1 },
      { partNumber: '32/925682', name: 'Filtro de Retorno Tanque Hidráulico', type: 'hydraulic_filter', quantity: 1 },
      { partNumber: '32/917804', name: 'Filtro de Transmisión Syncroshuttle', type: 'hydraulic_filter', quantity: 1 },
      { partNumber: '32/915801', name: 'Elemento Primario de Aire', type: 'air_primary', quantity: 1 }
    ],
    fluidSpecifications: [
      { name: 'Aceite Motor JCB Engine Oil 15W-40', grade: 'API CI-4/CH-4', volumeGallons: 3.5 },
      { name: 'Aceite Transmisión JCB Transmission Fluid', grade: 'ESP-M2C 33G', volumeGallons: 4 }
    ],
    priceUsd: 720,
    priceDop: Math.round(720 * USD_TO_DOP_RATE),
    inStock: true,
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80'
  },
  // 5. LS Tractor MT357 - 250h Kit
  {
    id: 'kit-lsm357-250h',
    kitCode: 'KIT-LS-250H',
    brand: 'LS Tractor',
    compatibleModels: ['MT357', 'MT352', 'MT240', 'XP8090'],
    intervalHours: 250,
    title: 'Kit de Servicio 250 Horas - LS Tractor MT357 Cabina 4WD',
    description: 'Kit de lubricación y filtros originales de fábrica para tractores agrícolas LS Tractor.',
    filterParts: [
      { partNumber: '40007563', name: 'Filtro de Aceite Motor LS Original', type: 'oil_filter', quantity: 1 },
      { partNumber: '40049450', name: 'Filtro Combustible y Separador LS', type: 'fuel_filter', quantity: 1 },
      { partNumber: '40056488', name: 'Filtro Hidráulico de Transmisión HST', type: 'hydraulic_filter', quantity: 1 }
    ],
    fluidSpecifications: [
      { name: 'Aceite Motor Diésel 15W-40', grade: 'API CI-4', volumeGallons: 2.5 },
      { name: 'Fluido Hidráulico Transmisión THF 100', grade: 'Universal Tractor Fluid', volumeGallons: 5 }
    ],
    priceUsd: 410,
    priceDop: Math.round(410 * USD_TO_DOP_RATE),
    inStock: true,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
  },
  // 6. Ammann ARX 26-2 Compactador - 500h Kit
  {
    id: 'kit-ammann-500h',
    kitCode: 'KIT-AMM-500H',
    brand: 'Ammann',
    compatibleModels: ['ARX 26-2', 'ARX 16-2', 'ASC 110'],
    intervalHours: 500,
    title: 'Kit de Mantenimiento 500 Horas - Rodillo Compactador Ammann ARX',
    description: 'Kit de filtros y aceites para motor Kubota y sistema de vibración excéntrico Ammann.',
    filterParts: [
      { partNumber: '16271-32090', name: 'Filtro Aceite Motor Kubota OEM', type: 'oil_filter', quantity: 1 },
      { partNumber: '15221-43170', name: 'Filtro Combustible Diésel', type: 'fuel_filter', quantity: 1 },
      { partNumber: '4-7890122', name: 'Filtro de Circuito de Vibración Hidrostático', type: 'hydraulic_filter', quantity: 1 }
    ],
    fluidSpecifications: [
      { name: 'Aceite Motor 15W-40', grade: 'API CK-4', volumeGallons: 2 },
      { name: 'Aceite Ammann Vibratory Pods ISO 220', grade: 'High Temp Synthetic', volumeGallons: 1.5 }
    ],
    priceUsd: 590,
    priceDop: Math.round(590 * USD_TO_DOP_RATE),
    inStock: true,
    image: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=600&q=80'
  }
];

export const getServiceKitsForBrandAndInterval = (
  brand: string,
  intervalHours?: number
): ServiceKitDefinition[] => {
  return OFFICIAL_SERVICE_KITS.filter((kit) => {
    const brandMatch = kit.brand.toLowerCase() === brand.toLowerCase();
    if (intervalHours) {
      return brandMatch && kit.intervalHours === intervalHours;
    }
    return brandMatch;
  });
};

export const getBestServiceKitForMachine = (
  brand: string,
  model: string,
  currentHorometer: number
): ServiceKitDefinition => {
  // Determine standard next interval based on horometer
  let targetInterval: 250 | 500 | 1000 = 250;
  if (currentHorometer >= 1000) {
    targetInterval = (currentHorometer % 1000 === 0 || currentHorometer % 1000 >= 800) ? 1000 : 500;
  } else if (currentHorometer >= 500) {
    targetInterval = 500;
  }

  const matches = OFFICIAL_SERVICE_KITS.filter(k => 
    k.brand.toLowerCase() === brand.toLowerCase() &&
    k.intervalHours === targetInterval
  );

  if (matches.length > 0) return matches[0];

  const brandMatches = OFFICIAL_SERVICE_KITS.filter(k => k.brand.toLowerCase() === brand.toLowerCase());
  return brandMatches[0] || OFFICIAL_SERVICE_KITS[0];
};
