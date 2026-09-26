import { OilSampleReport } from '../types';

export const DEMO_OIL_REPORTS: OilSampleReport[] = [
  {
    id: 'rep-sos-001',
    sampleNumber: 'SOS-2026-8812',
    unitFicha: 'EX-01',
    unitVin: 'JCB5CX-DOM-99120',
    unitModel: 'JCB 3CX EcoPlus',
    unitBrand: 'JCB',
    customerName: 'Constructora del Cibao S.R.L.',
    customerCompany: 'Constructora del Cibao S.R.L.',
    compartment: 'Motor Diésel',
    oilBrandGrade: '15W-40 CK-4 Heavy Duty',
    fluidHours: 490,
    machineHorometer: 3240,
    samplingDate: '2026-09-14',
    reportDate: '2026-09-16',
    severity: 'normal',
    wearMetals: {
      ironPpm: 18,
      copperPpm: 4,
      leadPpm: 2,
      chromiumPpm: 1,
      aluminumPpm: 3,
      tinPpm: 0
    },
    contaminants: {
      siliconPpm: 8,
      sootPercent: 0.6,
      waterPercent: 0.0,
      fuelDilutionPercent: 0.8
    },
    physicalProps: {
      viscosity100c: 14.2,
      tbn: 8.5
    },
    diagnosisSummary: 'Condición de fluido y desgaste dentro de especificaciones nominales de JCB Power Systems.',
    technicalRecommendation: 'Mantener intervalo regular de 500 horas. Próximo muestreo programado en 3,740 horas.',
    analystName: 'Ing. Marcos Rosario - Certificación Tribología CLS / TMD'
  },
  {
    id: 'rep-sos-002',
    sampleNumber: 'SOS-2026-8840',
    unitFicha: 'EX-04',
    unitVin: 'LG922E-RD-2023-441',
    unitModel: 'LiuGong 922E HD',
    unitBrand: 'LiuGong',
    customerName: 'Agregados & Canteras del Este',
    customerCompany: 'Agregados & Canteras del Este S.A.',
    compartment: 'Sistema Hidráulico',
    oilBrandGrade: 'ISO VG 68 Anti-Desgaste',
    fluidHours: 1950,
    machineHorometer: 4850,
    samplingDate: '2026-09-17',
    reportDate: '2026-09-19',
    severity: 'caution',
    wearMetals: {
      ironPpm: 42,
      copperPpm: 28,
      leadPpm: 8,
      chromiumPpm: 3,
      aluminumPpm: 12,
      tinPpm: 2
    },
    contaminants: {
      siliconPpm: 38,
      sootPercent: 0.1,
      waterPercent: 0.05,
      fuelDilutionPercent: 0.0
    },
    physicalProps: {
      viscosity100c: 64.0,
      tbn: 2.1
    },
    diagnosisSummary: 'Ingreso moderado de silicio (polvo ambiental de cantera) detectado por sello de vástago o respiradero defectuoso.',
    technicalRecommendation: 'Inspeccionar respiradero del tanque hidráulico Donaldson y cambiar elementos filtrantes de retorno. Monitorear bomba de pistones en 100 horas.',
    recommendedPartKitId: 'fil-hyd-01',
    analystName: 'Ing. Rafael Peña - Especialista en Sistemas Hidráulicos TMD'
  },
  {
    id: 'rep-sos-003',
    sampleNumber: 'SOS-2026-8875',
    unitFicha: 'RO-02',
    unitVin: 'AMM-ASC110-8910',
    unitModel: 'Ammann ASC 110',
    unitBrand: 'Ammann',
    customerName: 'Pavimentos & Vías Urbanas',
    customerCompany: 'Pavimentos & Vías Urbanas S.R.L.',
    compartment: 'Motor Diésel',
    oilBrandGrade: '15W-40 CI-4 Plus',
    fluidHours: 610,
    machineHorometer: 2190,
    samplingDate: '2026-09-18',
    reportDate: '2026-09-20',
    severity: 'critical',
    wearMetals: {
      ironPpm: 95,
      copperPpm: 64,
      leadPpm: 35,
      chromiumPpm: 9,
      aluminumPpm: 26,
      tinPpm: 6
    },
    contaminants: {
      siliconPpm: 55,
      sootPercent: 2.8,
      waterPercent: 0.25,
      fuelDilutionPercent: 4.2
    },
    physicalProps: {
      viscosity100c: 11.2,
      tbn: 3.4
    },
    diagnosisSummary: 'Severa dilución por combustible diésel (4.2%) provocando caída brusca de viscosidad y fricción metal-metal en metales de biela (Cobre/Plomo).',
    technicalRecommendation: 'DETENCIÓN INMEDIATA de la unidad. Comprobar inyectores diésel por goteo o fuga en bomba de alta presión. No operar sin cambio de aceite y filtros.',
    recommendedPartKitId: 'fil-mot-cummins-6b',
    analystName: 'Ing. Carlos Medina - Director Laboratorio SOS TMD'
  }
];

export const WEAR_THRESHOLDS = {
  iron: { normal: 30, caution: 60 },
  copper: { normal: 15, caution: 35 },
  lead: { normal: 10, caution: 20 },
  silicon: { normal: 15, caution: 30 },
  fuelDilution: { normal: 1.5, caution: 3.0 }
};
