import { MachineAssembly, AssemblyType } from '../types';

export interface SchematicMachine {
  id: string;
  name: string;
  category: string;
  modelCode: string;
  description: string;
  assemblies: MachineAssembly[];
}

export const SCHEMATIC_MACHINES: SchematicMachine[] = [
  {
    id: 'liugong-922e',
    name: 'LiuGong 922E HD (Excavadora de Oruga 22T)',
    category: 'Excavadora Hidráulica',
    modelCode: 'LG-922E-CUM-QSB6.7',
    description: 'Diagrama técnico del tren motriz, hidráulica proporcional Kawasaki K3V y sistema de rodaje Berco HD.',
    assemblies: [
      {
        id: 'boom_bucket',
        name: 'Pluma, Brazo y Balde de Excavación',
        category: 'Desgaste y Balde',
        calloutNumber: 1,
        hotspot: { x: 84, y: 62 },
        description: 'Conjunto frontal de excavación sometido a esfuerzos de corte y fricción severa en roca. Incluye balde HD de 1.1 m³, labios de desgaste, dientes forjados y bulones de articulación.',
        maintenanceInterval: 'Engrase cada 10 Horas / Inspección de holgura cada 250 Horas',
        recommendedInspection: 'Verificar desgaste en puntas antes de comprometer el labio porta-adaptador. Lubricar pasadores con grasa de extrema presión TMD Li-Complex.',
        associatedPartIds: ['part-02-liugong-bucket-teeth', 'part-09-bucket-pins-bushings']
      },
      {
        id: 'hydraulics',
        name: 'Sistema Hidráulico Principal & Bombas',
        category: 'Hidráulica de Alta Presión',
        calloutNumber: 2,
        hotspot: { x: 38, y: 46 },
        description: 'Circuito hidráulico tándem de 350 bar. Bomba doble de pistones de caudal variable Kawasaki K3V112DT, bloque de válvulas de control central y mangueras blindadas.',
        maintenanceInterval: 'Cambio de aceite hidráulico cada 2,000 Horas / Filtros cada 500 Horas',
        recommendedInspection: 'Monitorear temperatura del aceite (no exceder 82°C en clima dominicano). Usar aceite anti-desgaste ISO VG 68 certificado.',
        associatedPartIds: ['part-03-hydraulic-pump', 'part-06-hydraulic-oil-drum', 'part-08-jcb-seal-kit']
      },
      {
        id: 'powertrain',
        name: 'Compartimento Motor Diésel Cummins QSB 6.7',
        category: 'Motor Diésel & Turbo',
        calloutNumber: 3,
        hotspot: { x: 22, y: 38 },
        description: 'Unidad de potencia turboalimentada de 6 cilindros en línea, inyección Common Rail de alta presión Bosch, radiadores tropicalizados y filtración multicapa.',
        maintenanceInterval: 'Cambio de aceite y filtros cada 250 - 500 Horas',
        recommendedInspection: 'Drenar diariamente el sedimentador de agua del combustible diésel. Chequear tensión de correa y soplado de filtros de aire primarios.',
        associatedPartIds: ['part-04-cummins-injector', 'part-11-turbo-holset', 'part-01-jcb-filter-kit']
      },
      {
        id: 'undercarriage',
        name: 'Tren de Rodaje & Orugas Berco HD',
        category: 'Tren de Rodaje',
        calloutNumber: 4,
        hotspot: { x: 48, y: 84 },
        description: 'Chasis inferior reforzado tipo X con cadenas selladas y lubricadas (SALT), rodillos inferiores Duo-Cone, rueda tensora amortiguada y mando final planetario con sprocket.',
        maintenanceInterval: 'Inspección de tensión de cadena cada 50 Horas / Nivel de mandos finales cada 500 Horas',
        recommendedInspection: 'Limpiar barro acumulado entre rodillos al final de jornada. Reemplazar zapatas rotas para evitar torsión excéntrica sobre los eslabones.',
        associatedPartIds: ['part-05-track-roller', 'part-10-sprocket-drive', 'part-12-track-group-link']
      },
      {
        id: 'cab_electric',
        name: 'Cabina ROPS/FOPS, Mandos & Sistema 24V',
        category: 'Cabina & Controles',
        calloutNumber: 5,
        hotspot: { x: 44, y: 30 },
        description: 'Módulo de operador presurizado con aire acondicionado tropicalizado, consolas de mandos piloto proporcionales con servoválvulas Rexroth y alternador 24V con pantalla LCD.',
        maintenanceInterval: 'Filtro de cabina cada 250 Horas / Inspección de alternador cada 500 Horas',
        recommendedInspection: 'Verificar hermeticidad de sellos de puerta contra polvo de cantera y revisar bornes de batería por corrosión salina.',
        associatedPartIds: ['part-13-cab-pilot-joystick', 'part-14-alternator-tropicalized']
      }
    ]
  },
  {
    id: 'jcb-3cx',
    name: 'JCB 3CX Eco (Retroexcavadora 4x4)',
    category: 'Retroexcavadora',
    modelCode: 'JCB-3CX-ECO-T4F',
    description: 'Esquema cinemático de equipo versátil: cargador frontal, retroexcavadora telescópica, motor JCB Dieselmax y transmisión Powershift.',
    assemblies: [
      {
        id: 'boom_bucket',
        name: 'Brazo Trasero & Balde Zanjeador',
        category: 'Desgaste y Balde',
        calloutNumber: 1,
        hotspot: { x: 18, y: 52 },
        description: 'Pluma curvada de excavación con balde zanjeador de 600 mm, cilindros de giro con amortiguación de fin de carrera y pasadores cementados.',
        maintenanceInterval: 'Engrase cada 10 Horas / Puntas cada inspección visual',
        recommendedInspection: 'Verificar juego radial en bulón central del pivote rey (Kingpost). Usar grasa de sulfonato de calcio TMD.',
        associatedPartIds: ['part-02-liugong-bucket-teeth', 'part-09-bucket-pins-bushings']
      },
      {
        id: 'hydraulics',
        name: 'Circuito Hidráulico & Cilindros de Levante',
        category: 'Hidráulica de Alta Presión',
        calloutNumber: 2,
        hotspot: { x: 62, y: 55 },
        description: 'Sistema hidráulico de centro abierto o cerrado según versión con bomba de engranajes Parker/JCB y cilindros hidráulicos de doble efecto con sellos Hallite.',
        maintenanceInterval: 'Filtro de retorno hidráulico cada 500 Horas',
        recommendedInspection: 'Comprobar vástagos de cilindros por golpes de piedras que dañen los retenes y causen fugas de aceite.',
        associatedPartIds: ['part-08-jcb-seal-kit', 'part-06-hydraulic-oil-drum']
      },
      {
        id: 'powertrain',
        name: 'Motor JCB Dieselmax 4.4L & Filtros',
        category: 'Motor Diésel & Turbo',
        calloutNumber: 3,
        hotspot: { x: 68, y: 44 },
        description: 'Motor diésel de alto par a bajas revoluciones con inyección mecánica o electrónica, turbocompresor refrigerado por agua y kit de filtros de 500 horas.',
        maintenanceInterval: 'Kit completo de filtros cada 500 Horas',
        recommendedInspection: 'Reemplazar siempre el kit de 4 filtros juntos (aceite, combustible primario, secundario y aire) para sostener la garantía TMD MasterCare.',
        associatedPartIds: ['part-01-jcb-filter-kit', 'part-04-cummins-injector']
      },
      {
        id: 'transmission',
        name: 'Transmisión Powershift & Ejes 4WD',
        category: 'Transmisión & Tracción',
        calloutNumber: 4,
        hotspot: { x: 50, y: 72 },
        description: 'Caja de 4 marchas sincronizadas Powershift con inversor electrohidráulico, convertidor de torque y diferenciales autoblocantes Heavy Duty.',
        maintenanceInterval: 'Aceite de transmisión cada 1,000 Horas / Filtro cada 500 Horas',
        recommendedInspection: 'Chequear presión de calibración del paquete de embragues de avance y retroceso en banco.',
        associatedPartIds: ['part-15-transmission-filter-zf', 'part-07-ls-clutch-kit']
      }
    ]
  },
  {
    id: 'liugong-856h',
    name: 'LiuGong CLG856H (Cargador Frontal 5T)',
    category: 'Pala Cargadora',
    modelCode: 'LG-856H-CUM-ZF',
    description: 'Estructura modular de cargador de cantera: balde de 3.0 m³, motor Cummins 6.7L, transmisión Powershift ZF 4WG200 y frenos húmedos multidiscos.',
    assemblies: [
      {
        id: 'boom_bucket',
        name: 'Varillaje en Z & Balde de Cantera 3.0 m³',
        category: 'Desgaste y Balde',
        calloutNumber: 1,
        hotspot: { x: 88, y: 58 },
        description: 'Geometría cinemática tipo Z-Bar de máxima fuerza de desprendimiento, cuchillas atornillables reversibles y segmentos de protección entre dientes.',
        maintenanceInterval: 'Engrase cada 10 Horas / Rotación de cuchillas según desgaste',
        recommendedInspection: 'Apretar pernos de cuchillas a torque especificado de fábrica tras las primeras 50 horas de trabajo.',
        associatedPartIds: ['part-02-liugong-bucket-teeth', 'part-09-bucket-pins-bushings']
      },
      {
        id: 'transmission',
        name: 'Transmisión Automática ZF 4WG200',
        category: 'Transmisión Powershift',
        calloutNumber: 2,
        hotspot: { x: 45, y: 64 },
        description: 'Transmisión alemana ZF de 4 velocidades adelante y 3 atrás, controlada por microprocesador con función Kick-Down automática para penetración en pila de agregados.',
        maintenanceInterval: 'Filtro ZF cada 500 Horas / Aceite cada 1,000 Horas',
        recommendedInspection: 'Monitorear microfiltración magnética en cada servicio para detectar desgaste de discos de embrague.',
        associatedPartIds: ['part-15-transmission-filter-zf', 'part-07-ls-clutch-kit']
      },
      {
        id: 'powertrain',
        name: 'Motor Cummins QSB 6.7L Fase Tropical',
        category: 'Motor Diésel',
        calloutNumber: 3,
        hotspot: { x: 20, y: 45 },
        description: 'Potencia de 220 HP con ventilador hidráulico reversible para limpieza automática de los radiadores en plantas de asfalto y hormigón.',
        maintenanceInterval: 'Mantenimiento preventivo cada 250 Horas',
        recommendedInspection: 'Activar ciclo de soplado inverso del ventilador en ambientes de alto polvo de trituración de áridos.',
        associatedPartIds: ['part-04-cummins-injector', 'part-11-turbo-holset', 'part-01-jcb-filter-kit']
      },
      {
        id: 'hydraulics',
        name: 'Dirección Articulada & Cilindros de Volteo',
        category: 'Hidráulica de Potencia',
        calloutNumber: 4,
        hotspot: { x: 55, y: 50 },
        description: 'Bomba hidráulica de pistones con dirección con sensor de carga Orbitrol, mangueras blindadas de 4 mallas de acero y válvulas de freno regenerativo.',
        maintenanceInterval: 'Inspección de mangueras cada 250 Horas',
        recommendedInspection: 'Comprobar articulación central de pivote oscilante y apriete de bridas de presión SAE 6000.',
        associatedPartIds: ['part-03-hydraulic-pump', 'part-06-hydraulic-oil-drum']
      }
    ]
  }
];
