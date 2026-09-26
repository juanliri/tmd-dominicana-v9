import { EcoFleetMachineInput } from '../types';

export const SAMPLE_ECO_MACHINES: EcoFleetMachineInput[] = [
  {
    id: 'eco-1',
    model: 'JCB 3CX Eco Turbo (Tier 3)',
    tierStandard: 'Tier 3',
    annualHours: 1800,
    fuelBurnRateGalHr: 2.1
  },
  {
    id: 'eco-2',
    model: 'Excavadora LiuGong 922E HD (Tier 3)',
    tierStandard: 'Tier 3',
    annualHours: 2200,
    fuelBurnRateGalHr: 4.6
  },
  {
    id: 'eco-3',
    model: 'Pala Cargadora LiuGong 856H (Stage V)',
    tierStandard: 'Stage V',
    annualHours: 1600,
    fuelBurnRateGalHr: 4.1
  }
];

// Constantes estándar de emisiones diésel (EPA & MIMARENA RD)
// 1 galón de diésel produce ~10.180 kg de CO2
export const KG_CO2_PER_DIESEL_GALLON = 10.18;
export const TREES_PER_TON_CO2_PER_YEAR = 45; // Árboles requeridos para absorber 1 tonelada de CO2 al año
