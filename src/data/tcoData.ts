import { TcoMachineProfile } from '../types';

export const DEFAULT_TCO_PROFILES: TcoMachineProfile[] = [
  // TMD Official Lineup
  {
    id: 'tco-jcb-3cx',
    name: 'JCB 3CX Eco Turbo (TMD)',
    brand: 'JCB',
    model: '3CX Eco Stage V',
    category: 'Retroexcavadora',
    initialPriceUsd: 89500,
    fuelBurnGalPerHour: 2.1, // EcoDig / EcoRoad - Consumo ultra eficiente en gal/hora
    maintenanceCostPerHourUsd: 4.80, // Filtros y aceites TMD Care
    undercarriageTireCostPerHourUsd: 2.20,
    residualValue5YrsPercent: 52 // Excelente valor de reventa en el mercado dominicano
  },
  {
    id: 'tco-liugong-922e',
    name: 'LiuGong 922E HD Excavator (TMD)',
    brand: 'LiuGong',
    model: '922E HD Cummins',
    category: 'Excavadora 22T',
    initialPriceUsd: 138000,
    fuelBurnGalPerHour: 4.6, // Cummins 6BTAA motor eficiente
    maintenanceCostPerHourUsd: 6.90,
    undercarriageTireCostPerHourUsd: 3.80,
    residualValue5YrsPercent: 48
  },
  {
    id: 'tco-liugong-856h',
    name: 'LiuGong 856H Wheel Loader (TMD)',
    brand: 'LiuGong',
    model: '856H Max ZF',
    category: 'Pala Cargadora 5T',
    initialPriceUsd: 125000,
    fuelBurnGalPerHour: 4.2,
    maintenanceCostPerHourUsd: 6.20,
    undercarriageTireCostPerHourUsd: 4.50,
    residualValue5YrsPercent: 49
  },

  // Direct Market Competitors in Dominican Republic
  {
    id: 'tco-cat-420',
    name: 'Caterpillar 420F2 / 420 (Competidor)',
    brand: 'Caterpillar',
    model: '420F2 IT',
    category: 'Retroexcavadora',
    initialPriceUsd: 114000, // Alto sobreprecio inicial
    fuelBurnGalPerHour: 2.7, // Mayor consumo de diésel por hora
    maintenanceCostPerHourUsd: 6.95, // Repuestos y filtros más costosos
    undercarriageTireCostPerHourUsd: 2.60,
    residualValue5YrsPercent: 53
  },
  {
    id: 'tco-cat-320',
    name: 'Caterpillar 320 GC (Competidor)',
    brand: 'Caterpillar',
    model: '320 GC',
    category: 'Excavadora 22T',
    initialPriceUsd: 182000,
    fuelBurnGalPerHour: 5.4,
    maintenanceCostPerHourUsd: 9.20,
    undercarriageTireCostPerHourUsd: 4.40,
    residualValue5YrsPercent: 52
  },
  {
    id: 'tco-komatsu-wb97',
    name: 'Komatsu WB97R-5 (Competidor)',
    brand: 'Komatsu',
    model: 'WB97R-5',
    category: 'Retroexcavadora',
    initialPriceUsd: 104500,
    fuelBurnGalPerHour: 2.5,
    maintenanceCostPerHourUsd: 6.40,
    undercarriageTireCostPerHourUsd: 2.45,
    residualValue5YrsPercent: 47
  },
  {
    id: 'tco-komatsu-pc200',
    name: 'Komatsu PC200-8 (Competidor)',
    brand: 'Komatsu',
    model: 'PC200-8',
    category: 'Excavadora 22T',
    initialPriceUsd: 168000,
    fuelBurnGalPerHour: 5.1,
    maintenanceCostPerHourUsd: 8.60,
    undercarriageTireCostPerHourUsd: 4.10,
    residualValue5YrsPercent: 48
  },
  {
    id: 'tco-competitor-standard',
    name: 'Marca Importada Genérica / Sin Soporte Local',
    brand: 'Genérica / Tier 2',
    model: 'Standard 20T',
    category: 'Excavadora Convencional',
    initialPriceUsd: 128000,
    fuelBurnGalPerHour: 5.9,
    maintenanceCostPerHourUsd: 9.80, // Falta de filtros OEM y paradas técnicas no programadas
    undercarriageTireCostPerHourUsd: 4.60,
    residualValue5YrsPercent: 28 // Depreciación drástica por falta de respaldo
  }
];

export const FUEL_PRICE_PER_GALLON_USD = 4.25; // Diésel regular en República Dominicana (~RD$ 255 / galón)
