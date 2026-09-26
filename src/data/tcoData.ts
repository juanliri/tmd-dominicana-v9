import { TcoMachineProfile } from '../types';

export const DEFAULT_TCO_PROFILES: TcoMachineProfile[] = [
  {
    id: 'tco-jcb-3cx',
    name: 'JCB 3CX Eco Turbo',
    brand: 'JCB',
    model: '3CX Eco',
    category: 'Retroexcavadora',
    initialPriceUsd: 89500,
    fuelBurnGalPerHour: 2.1, // Galones por hora promedio en ciclo mixto
    maintenanceCostPerHourUsd: 4.80,
    undercarriageTireCostPerHourUsd: 2.20,
    residualValue5YrsPercent: 48
  },
  {
    id: 'tco-liugong-922e',
    name: 'LiuGong 922E HD Excavator',
    brand: 'LiuGong',
    model: '922E HD',
    category: 'Excavadora 22T',
    initialPriceUsd: 138000,
    fuelBurnGalPerHour: 4.6,
    maintenanceCostPerHourUsd: 6.90,
    undercarriageTireCostPerHourUsd: 3.80,
    residualValue5YrsPercent: 44
  },
  {
    id: 'tco-liugong-856h',
    name: 'LiuGong 856H Wheel Loader',
    brand: 'LiuGong',
    model: '856H Max',
    category: 'Pala Cargadora 5T',
    initialPriceUsd: 125000,
    fuelBurnGalPerHour: 4.2,
    maintenanceCostPerHourUsd: 6.20,
    undercarriageTireCostPerHourUsd: 4.50,
    residualValue5YrsPercent: 46
  },
  {
    id: 'tco-competitor-standard',
    name: 'Marca Competidora Genérica (Tier 2 Antiguo)',
    brand: 'Genérica / Usada',
    model: 'Standard 20T',
    category: 'Excavadora Convencional',
    initialPriceUsd: 130000,
    fuelBurnGalPerHour: 5.9, // Mayor consumo de combustible
    maintenanceCostPerHourUsd: 8.50,
    undercarriageTireCostPerHourUsd: 4.20,
    residualValue5YrsPercent: 32
  }
];

export const FUEL_PRICE_PER_GALLON_USD = 4.25; // Diesel en República Dominicana ~250 DOP / galón
