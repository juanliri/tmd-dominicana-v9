import { TechnicalDocument } from '../types';

export const TECHNICAL_DOCS_DATA: TechnicalDocument[] = [
  {
    id: 'doc-jcb-3cx-manual',
    title: 'Manual de Operación y Mantenimiento Diario - Retroexcavadora JCB 3CX / 4CX',
    docType: 'operator_manual',
    brand: 'JCB',
    modelCode: '3CX EcoPlus / 4CX',
    codeRef: 'OM-JCB-9821-ES',
    fileSizeBytes: '14.2 MB',
    publishDate: '2026-01-15',
    language: 'Español',
    summary: 'Guía oficial para operadores: inspección diaria 360°, tabla de lubricación y engrase cada 10h/50h/500h, capacidades de fluidos y procedimientos de seguridad.',
    downloadCount: 384,
    isProOnly: false
  },
  {
    id: 'doc-liugong-922e-parts',
    title: 'Catálogo de Repuestos y Despiece de Conjuntos - Excavadora LiuGong 922E HD',
    docType: 'parts_catalog',
    brand: 'LiuGong',
    modelCode: '922E HD Cummins 6BTA',
    codeRef: 'PC-LG-922E-REV4',
    fileSizeBytes: '28.6 MB',
    publishDate: '2025-11-20',
    language: 'Bilingüe',
    summary: 'Despiece explosivo completo de motor Cummins, bomba hidráulica principal Kawasaki K3V112, mandos finales, rodillos inferiores y balde reforzado.',
    downloadCount: 512,
    isProOnly: true
  },
  {
    id: 'doc-cummins-6b-overhaul',
    title: 'Manual de Taller y Reconstrucción de Motor Diésel Cummins 6BTAA5.9',
    docType: 'workshop_manual',
    brand: 'Cummins',
    modelCode: '6BT / 6BTA 5.9L',
    codeRef: 'WM-CUM-3666087',
    fileSizeBytes: '42.1 MB',
    publishDate: '2025-08-10',
    language: 'Español',
    summary: 'Especificaciones de torque de culata, calibración de holgura de válvulas en frío, sincronización de piñón de bomba de inyección Bosch VE/en línea y tolerancias de cigueñal.',
    downloadCount: 890,
    isProOnly: true
  },
  {
    id: 'doc-tsb-jcb-hyd-relief',
    title: 'Boletín Técnico de Servicio TSB-2026-04: Calibración de Válvula de Alivio Principal MRV',
    docType: 'tsb_bulletin',
    brand: 'JCB',
    modelCode: '3CX / 4CX / 5CX',
    codeRef: 'TSB-JCB-2026-04',
    fileSizeBytes: '3.8 MB',
    publishDate: '2026-03-02',
    language: 'Español',
    summary: 'Procedimiento de ajuste de presión hidráulica a 250 bar (3625 PSI) con manómetros digitales TMD para optimizar fuerza de rotura en excavación profunda.',
    downloadCount: 176,
    isProOnly: true
  },
  {
    id: 'doc-schematic-liugong-elec',
    title: 'Esquema Eléctrico y Distribución de Fusibles / Relés - LiuGong 922E / 925E',
    docType: 'electrical_diagram',
    brand: 'LiuGong',
    modelCode: '922E HD',
    codeRef: 'WD-LG-ELEC-2026',
    fileSizeBytes: '8.4 MB',
    publishDate: '2026-02-18',
    language: 'Bilingüe',
    summary: 'Diagrama de cableado a color de módulo de control ECM de motor, monitor de cabina, sensor de presión piloto y arnés de parada de emergencia.',
    downloadCount: 245,
    isProOnly: true
  },
  {
    id: 'doc-donaldson-filtration-guide',
    title: 'Guía Maestra de Filtración y Eficiencia en Aire / Diésel para Clima Tropical y Polvo',
    docType: 'operator_manual',
    brand: 'Donaldson',
    modelCode: 'TopSpin / Blue Clean',
    codeRef: 'DG-FLT-2026-DOM',
    fileSizeBytes: '9.1 MB',
    publishDate: '2026-04-12',
    language: 'Español',
    summary: 'Instrucciones para la instalación de prefiltradores centrífugos TopSpin y filtros de combustible con separación coalescente de agua para prevenir desgaste abrasivo.',
    downloadCount: 670,
    isProOnly: false
  }
];
