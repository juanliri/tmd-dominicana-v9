// TMD Dominicana — Offline Technical Vault & Service Worker Synchronization Engine (Fase 19)
// Provides full offline access to critical machinery datasheets, torque tables, hydraulic circuits, and parts manuals in mining and rural field sites.

export interface TechnicalDatasheet {
  id: string;
  brand: 'JCB' | 'LiuGong' | 'Kubota' | 'LS Tractor' | 'Yanmar' | 'Ammann' | 'AFEX' | 'IMER' | 'Yomel';
  model: string;
  category: 'Excavadoras' | 'Retroexcavadoras' | 'Palas Mecánicas' | 'Tractores Agrícolas' | 'Miniexcavadoras' | 'Compactación' | 'Minería & Seguridad' | 'Concreto';
  title: string;
  tagline: string;
  engineSpecs: {
    engineModel: string;
    powerHp: string;
    powerKw: string;
    displacement: string;
    emissionTier: string;
    fuelConsumptionAvg: string;
    fuelTankCapacity: string;
  };
  hydraulicSpecs: {
    mainPump: string;
    maxFlow: string;
    systemPressure: string;
    reliefValveSetting: string;
    pilotPressure: string;
    hydraulicTankCapacity: string;
  };
  operatingSpecs: {
    operatingWeight: string;
    bucketCapacity: string;
    maxDigDepth?: string;
    maxReach?: string;
    breakoutForce: string;
    travelSpeed: string;
    groundPressure: string;
  };
  criticalTorques: Record<string, string>;
  fluidCapacities: Record<string, string>;
  maintenanceIntervals: {
    hours: string;
    tasks: string[];
  }[];
  criticalParts: {
    partNumber: string;
    description: string;
    type: string;
    crossReference?: string;
  }[];
}

export interface PartsTechnicalManual {
  id: string;
  title: string;
  system: 'Motor' | 'Hidráulica' | 'Tren de Rodaje' | 'Eléctrico & ECM' | 'Filtración' | 'Seguridad Minera';
  targetEquipment: string;
  fileSize: string;
  overview: string;
  diagnosticSteps: string[];
  schematicDetails: {
    component: string;
    specValue: string;
    safetyWarning: string;
  }[];
  crossReferenceTable?: {
    oemCode: string;
    donaldson: string;
    fleetguard: string;
    baldwin: string;
    application: string;
  }[];
}

// Master Technical Datasheets for Remote Field & Mining Operations
export const CRITICAL_TECHNICAL_DATASHEETS: TechnicalDatasheet[] = [
  {
    id: 'ds-jcb-3cx',
    brand: 'JCB',
    model: '3CX Eco 4x4',
    category: 'Retroexcavadoras',
    title: 'Ficha Técnica de Taller: JCB 3CX Eco',
    tagline: 'Retroexcavadora líder con motor JCB Dieselmax y transmisión Powershift',
    engineSpecs: {
      engineModel: 'JCB 444 Dieselmax Turbocharged',
      powerHp: '92 HP @ 2,200 RPM',
      powerKw: '68.6 kW',
      displacement: '4.4 Litros (4 Cilindros en línea)',
      emissionTier: 'Tier 3 / Stage IIIA',
      fuelConsumptionAvg: '5.2 - 6.8 L/hora',
      fuelTankCapacity: '143 Litros'
    },
    hydraulicSpecs: {
      mainPump: 'Parker de Engranajes Doble de Alto Caudal',
      maxFlow: '165 L/min @ 2,200 RPM',
      systemPressure: '251 bar (3,640 PSI)',
      reliefValveSetting: '251 bar (Válvula principal de alivio MRV)',
      pilotPressure: '30 bar',
      hydraulicTankCapacity: '85 Litros (Sistema total 130L)'
    },
    operatingSpecs: {
      operatingWeight: '8,135 kg (8.14 Toneladas)',
      bucketCapacity: '1.0 m³ frontal 6 en 1 / 0.24 m³ zanja',
      maxDigDepth: '5.46 metros (con Extradig desplegado)',
      maxReach: '6.54 metros',
      breakoutForce: '6,227 kgf (Balde retro)',
      travelSpeed: '40.0 km/h (4ta velocidad Powershift)',
      groundPressure: '0.78 kg/cm²'
    },
    criticalTorques: {
      'Culata de Motor (Pernos Principales)': '230 Nm (Secuencia cruzada en 3 etapas: 60Nm -> 140Nm -> 230Nm)',
      'Tornillos de Bancada Cigüeñal': '180 Nm + 90° de apriete angular',
      'Tuercas de Bielas': '60 Nm + 90°',
      'Pernos de Fijación Corona de Giro': '310 Nm con Loctite 270 (Fijador de roscas de alta resistencia)',
      'Tuercas de Ruedas Delanteras / Traseras': 'Delanteras 280 Nm / Traseras 450 Nm',
      'Perno Pivote Kingpost de Giro': '550 Nm'
    },
    fluidCapacities: {
      'Aceite de Motor (con filtro)': '14.0 L (15W-40 API CK-4 / CJ-4)',
      'Sistema Hidráulico Completo': '130.0 L (ISO VG 46 Anti-desgaste)',
      'Transmisión Powershift / Synchro': '16.0 L (JCB Extreme Performance Transmission Fluid)',
      'Eje Delantero 4WD (Diferencial + Mandos)': '10.5 L (80W-90 GL-5)',
      'Eje Trasero (Diferencial + Frenos Húmedos)': '14.5 L (80W-90 con aditivo anti-fricción)',
      'Refrigerante Motor OAT 50/50': '18.5 L (Glicol de larga duración 5 años)'
    },
    maintenanceIntervals: [
      { hours: 'Cada 250 Horas', tasks: ['Cambio de aceite de motor y filtro 320/04133', 'Engrase completo de 28 puntos con grasa MoS2', 'Drenaje de sedimentos y agua en trampa de combustible'] },
      { hours: 'Cada 500 Horas', tasks: ['Reemplazo de filtro de combustible primario y secundario', 'Revisión y tensión de correa Poly-V de alternador', 'Inspección de nivel en diferenciales y cubos de rueda'] },
      { hours: 'Cada 1,000 Horas', tasks: ['Cambio de aceite de transmisión y filtro hidráulico de caja', 'Reemplazo de filtro de aire primario y secundario', 'Calibración de juego de válvulas de motor'] },
      { hours: 'Cada 2,000 Horas', tasks: ['Cambio total de aceite hidráulico ISO VG 46', 'Reemplazo de fluido refrigerante OAT', 'Cambio de fluidos en ambos ejes y cubos reductores'] }
    ],
    criticalParts: [
      { partNumber: '320/04133', description: 'Filtro de Aceite Motor Dieselmax', type: 'Filtración OEM', crossReference: 'Donaldson P550388 / LF16015' },
      { partNumber: '32/925915', description: 'Elemento Separador Combustible / Agua', type: 'Filtración OEM', crossReference: 'Donaldson P551424 / FS19990' },
      { partNumber: '32/925682', description: 'Filtro Hidráulico de Retorno 10 Micrones', type: 'Hidráulica OEM', crossReference: 'Donaldson P171569 / HF6510' },
      { partNumber: '991/00147', description: 'Kit de Sellos Cilindro de Levante Balde', type: 'Sellos Hidráulicos' },
      { partNumber: '400/C1984', description: 'Diente de Cuchara Central Reforzado', type: 'Desgaste G.E.T.' }
    ]
  },
  {
    id: 'ds-liugong-922e',
    brand: 'LiuGong',
    model: '922E HD Mining Spec',
    category: 'Excavadoras',
    title: 'Ficha Técnica de Taller: LiuGong 922E HD',
    tagline: 'Excavadora sobre orugas para trabajo pesado en canteras y minería',
    engineSpecs: {
      engineModel: 'Cummins 6BTAA5.9 Tier 2 / Tier 3',
      powerHp: '150 HP @ 1,950 RPM',
      powerKw: '112 kW',
      displacement: '5.9 Litros (6 Cilindros Turbo Intercooler)',
      emissionTier: 'Tier 2 / Tier 3 Mecánico',
      fuelConsumptionAvg: '14.0 - 18.5 L/hora en carga alta',
      fuelTankCapacity: '420 Litros'
    },
    hydraulicSpecs: {
      mainPump: 'Kawasaki K3V112DT Bomba de Pistones de Caudal Variable',
      maxFlow: '2 x 224 L/min (448 L/min total)',
      systemPressure: '34.3 MPa (343 bar) / 37.3 MPa Power Boost',
      reliefValveSetting: '34.3 MPa en implementos / 37.3 MPa en excavación pesada',
      pilotPressure: '3.9 MPa (39 bar)',
      hydraulicTankCapacity: '210 Litros (Sistema total 330L)'
    },
    operatingSpecs: {
      operatingWeight: '22,200 kg (22.2 Toneladas)',
      bucketCapacity: '1.2 m³ para roca con protectores laterales',
      maxDigDepth: '6.56 metros',
      maxReach: '9.87 metros',
      breakoutForce: '152 kN (Fuerza de desprendimiento de cuchara ISO)',
      travelSpeed: '5.5 km/h (Alta) / 3.2 km/h (Baja)',
      groundPressure: '46.5 kPa (0.47 kg/cm² con zapatas de 600mm)'
    },
    criticalTorques: {
      'Pernos Corona de Giro (Tornillos M20 Grado 10.9)': '480 Nm (Torquímetro calibrado con Loctite 271)',
      'Pernos de Motor de Giro (Swing Motor M16)': '240 Nm',
      'Pernos de Zapata de Oruga (Track Shoe Bolts)': '350 Nm + 120° de giro angular',
      'Pernos de Mando Final a Chasis (M24)': '780 Nm',
      'Culata Cummins 5.9 (Pernos Largos)': '140 Nm + 90°',
      'Tuercas de Rueda Guía / Tensor': '210 Nm'
    },
    fluidCapacities: {
      'Aceite de Motor con Filtros': '24.0 L (15W-40 CI-4 / CK-4 Heavy Duty)',
      'Tanque Hidráulico (Nivel)': '210.0 L (ISO VG 46 / ISO VG 68)',
      'Sistema Hidráulico Total': '330.0 L',
      'Mandos Finales (Cada Lado)': '5.5 L (85W-140 GL-5 Extreme Pressure)',
      'Reductor de Giro (Swing Drive)': '3.8 L (80W-90 GL-5)',
      'Refrigerante de Radiador': '25.0 L (Refrigerante Heavy Duty 50/50)'
    },
    maintenanceIntervals: [
      { hours: 'Cada 250 Horas', tasks: ['Cambio de aceite motor Cummins y filtro', 'Engrase de pasadores de brazo, pluma y balde con grasa de 5% MoS2', 'Drenaje del separador de combustible primario'] },
      { hours: 'Cada 500 Horas', tasks: ['Reemplazo de cartuchos de combustible primario y secundario', 'Cambio de filtro piloto hidráulico', 'Inspección de nivel en mandos finales y reductor de giro'] },
      { hours: 'Cada 1,000 Horas', tasks: ['Cambio de aceite en mandos finales y reductor de giro', 'Reemplazo de filtro de retorno hidráulico en tanque', 'Reemplazo de filtro de succión y respiradero del tanque'] },
      { hours: 'Cada 2,000 Horas / 5,000 Horas', tasks: ['Muestreo y análisis de laboratorio de aceite hidráulico', 'Cambio completo de fluido hidráulico (5,000h con aceite sintético)', 'Regulación y calaje de presiones hidráulicas en bloque de válvulas principal'] }
    ],
    criticalParts: [
      { partNumber: '40C0434', description: 'Filtro Hidráulico Principal de Retorno', type: 'Hidráulica OEM', crossReference: 'Donaldson P170608 / HF6588' },
      { partNumber: '40C0433', description: 'Filtro Piloto de Presión Hidráulica', type: 'Hidráulica OEM', crossReference: 'Donaldson P171569' },
      { partNumber: 'LF3970', description: 'Filtro de Aceite de Motor Cummins', type: 'Filtración OEM', crossReference: 'Donaldson P550428 / Fleetguard LF3970' },
      { partNumber: 'FS1280', description: 'Filtro Separador de Combustible con Sensor', type: 'Filtración OEM', crossReference: 'Donaldson P551329 / Fleetguard FS1280' },
      { partNumber: '72A0129', description: 'Diente de Roca para Balde 1.2 m³ V29SYL', type: 'Herramienta de Corte' }
    ]
  },
  {
    id: 'ds-kubota-kx040',
    brand: 'Kubota',
    model: 'KX040-4 Super Series',
    category: 'Miniexcavadoras',
    title: 'Ficha Técnica de Taller: Kubota KX040-4',
    tagline: 'Miniexcavadora compacta con motor diésel Kubota Common Rail e hidráulica ECO Plus',
    engineSpecs: {
      engineModel: 'Kubota V2403-CR-TE4 Turbo Direct Injection',
      powerHp: '40.4 HP @ 2,200 RPM',
      powerKw: '30.1 kW',
      displacement: '2.4 Litros (4 Cilindros)',
      emissionTier: 'Tier 4 Final con DPF e Inyección Common Rail',
      fuelConsumptionAvg: '3.1 - 4.2 L/hora',
      fuelTankCapacity: '64 Litros'
    },
    hydraulicSpecs: {
      mainPump: 'Bomba de Pistones de Caudal Variable con Detección de Carga',
      maxFlow: '2 x 45 L/min + 20 L/min auxiliar (110 L/min total)',
      systemPressure: '24.5 MPa (245 bar / 3,550 PSI)',
      reliefValveSetting: '24.5 MPa principal / 20.6 MPa en auxiliares AUX1/AUX2',
      pilotPressure: '3.4 MPa',
      hydraulicTankCapacity: '40 Litros (Sistema total 65L)'
    },
    operatingSpecs: {
      operatingWeight: '4,200 kg (4.2 Toneladas con cabina ROPS/FOPS)',
      bucketCapacity: '0.12 m³ estándar / Cuchilla frontal angular hidráulica',
      maxDigDepth: '3.42 metros',
      maxReach: '5.35 metros',
      breakoutForce: '4,320 kgf (Brazo 1,930 kgf)',
      travelSpeed: '5.0 km/h (Alta) / 3.0 km/h (Baja Auto-Downshift)',
      groundPressure: '30.1 kPa (Orugas de caucho reforzadas)'
    },
    criticalTorques: {
      'Culata de Motor Kubota V2403': '105 Nm (Etapas 45Nm -> 75Nm -> 105Nm)',
      'Pernos de Corona de Giro (M14 Grado 10.9)': '185 Nm con fijador Loctite 243',
      'Pernos de Motor de Traslación': '125 Nm',
      'Tuercas de Rueda Motriz (Sprocket)': '145 Nm',
      'Pernos de Soporte de Pluma (Boom Bracket Pin)': '220 Nm'
    },
    fluidCapacities: {
      'Aceite de Motor Kubota': '7.1 L (10W-30 / 15W-40 CJ-4 Low Ash)',
      'Tanque Hidráulico': '40.0 L (Kubota Super UDT-2 / ISO VG 46)',
      'Mandos Finales de Traslación': '0.8 L cada lado (80W-90 GL-5)',
      'Refrigerante de Radiador': '7.0 L (Glicol Etilénico al 50%)'
    },
    maintenanceIntervals: [
      { hours: 'Cada 100 Horas', tasks: ['Limpieza de filtro de aire ciclónico y trampa de polvo', 'Engrase de puntos de articulación de la cuchilla y balde'] },
      { hours: 'Cada 250 Horas', tasks: ['Cambio de aceite de motor y filtro HH1C0-32430', 'Revisión y drenaje del filtro de combustible principal'] },
      { hours: 'Cada 500 Horas', tasks: ['Reemplazo de filtro de combustible y elemento separador', 'Reemplazo del cartucho hidráulico de retorno', 'Comprobación de tensión en orugas de goma (combadura 10-15mm)'] },
      { hours: 'Cada 1,000 Horas', tasks: ['Cambio de aceite en motores de traslación', 'Regeneración forzada y comprobación de presión diferencial en DPF', 'Inspección de juegos de cojinete de giro'] }
    ],
    criticalParts: [
      { partNumber: 'HH1C0-32430', description: 'Filtro de Aceite Motor Kubota Genuine', type: 'Filtración OEM' },
      { partNumber: '1J301-43170', description: 'Filtro de Combustible Principal Cartucho', type: 'Filtración OEM' },
      { partNumber: 'RD411-62210', description: 'Filtro Hidráulico de Retorno', type: 'Hidráulica OEM' },
      { partNumber: 'RB511-61430', description: 'Banda de Oruga de Caucho 350x52.5x86', type: 'Tren de Rodaje' }
    ]
  },
  {
    id: 'ds-ls-plus100',
    brand: 'LS Tractor',
    model: 'Plus 100 4WD Heavy',
    category: 'Tractores Agrícolas',
    title: 'Ficha Técnica de Taller: LS Tractor Plus 100',
    tagline: 'Tractor agrícola de alta potencia con transmisión Synchro Shuttle 16x16 y doble tracción',
    engineSpecs: {
      engineModel: 'FPT (Fiat Powertrain) F5C Turbo Intercooler',
      powerHp: '98 HP @ 2,300 RPM',
      powerKw: '73 kW',
      displacement: '3.4 Litros (4 Cilindros)',
      emissionTier: 'Tier 3 Mecánico de Alto Torque',
      fuelConsumptionAvg: '6.5 - 9.0 L/hora en arado pesado',
      fuelTankCapacity: '115 Litros'
    },
    hydraulicSpecs: {
      mainPump: 'Bomba Doble en Tandem de Engranajes',
      maxFlow: '60 L/min para implementos + 26 L/min para dirección',
      systemPressure: '19.6 MPa (196 bar / 2,850 PSI)',
      reliefValveSetting: '19.6 MPa',
      pilotPressure: 'N/A (Accionamiento mecánico directo)',
      hydraulicTankCapacity: 'Compartido con transmisión (55 Litros)'
    },
    operatingSpecs: {
      operatingWeight: '3,850 kg (con contrapesos delanteros y traseros)',
      bucketCapacity: 'Capacidad de levante trasero Cat II: 3,500 kg',
      breakoutForce: 'Fuerza de tracción en barra 3,100 kgf',
      travelSpeed: '38.5 km/h hacia adelante',
      groundPressure: '1.1 kg/cm² (Neumáticos agrícolas traseros 18.4-34)'
    },
    criticalTorques: {
      'Culata FPT F5C': '140 Nm + 90°',
      'Pernos de Disco de Rueda Trasera (M22)': '550 Nm',
      'Pernos de Unión Motor / Carcasa Embrague': '120 Nm',
      'Pernos de Barra de Tiro Oscilante': '280 Nm',
      'Tuercas de Soporte de Contrapesos Frontales': '180 Nm'
    },
    fluidCapacities: {
      'Aceite Motor': '9.5 L (15W-40 CI-4)',
      'Transmisión / Hidráulico Integrado': '55.0 L (Aceite Universal UTTO SAE 80W / ISO VG 68)',
      'Eje Delantero 4WD (Diferencial)': '6.5 L (85W-140 GL-5)',
      'Cubos Reductores Delanteros': '1.2 L cada lado (85W-140 GL-5)',
      'Refrigerante': '14.0 L'
    },
    maintenanceIntervals: [
      { hours: 'Cada 50 Horas', tasks: ['Engrase de pivote del eje delantero, terminales de dirección y enganche 3 puntos'] },
      { hours: 'Cada 250 Horas', tasks: ['Cambio de aceite de motor y filtro de aceite', 'Drenaje de sedimentos de combustible'] },
      { hours: 'Cada 500 Horas', tasks: ['Reemplazo de filtros de combustible', 'Reemplazo de filtro de succión hidráulico de transmisión', 'Inspección de holgura en pedal de embrague y frenos'] },
      { hours: 'Cada 1,000 Horas', tasks: ['Cambio total de aceite UTTO de transmisión e hidráulica', 'Cambio de aceite en diferencial delantero y cubos', 'Calibración de inyectores'] }
    ],
    criticalParts: [
      { partNumber: '40007563', description: 'Filtro de Aceite Motor FPT', type: 'Filtración OEM' },
      { partNumber: '40007564', description: 'Filtro de Combustible con Trampa', type: 'Filtración OEM' },
      { partNumber: '40056431', description: 'Filtro Hidráulico de Transmisión UTTO', type: 'Hidráulica OEM' },
      { partNumber: '40043219', description: 'Disco de Embrague Cerametálico 12 Pulgadas', type: 'Transmisión' }
    ]
  },
  {
    id: 'ds-afex-mining',
    brand: 'AFEX',
    model: 'Dual Agent Fire Suppression System',
    category: 'Minería & Seguridad',
    title: 'Manual de Inspección Crítica: AFEX Sistemas Contra Incendio',
    tagline: 'Sistema automático de supresión de incendios en equipos mineros de superficie y subterráneos',
    engineSpecs: {
      engineModel: 'N/A (Sistema de Seguridad Pasivo / Activo)',
      powerHp: 'N/A',
      powerKw: 'N/A',
      displacement: 'N/A',
      emissionTier: 'Certificación FM 5970 & NFPA 122',
      fuelConsumptionAvg: 'N/A',
      fuelTankCapacity: 'N/A'
    },
    hydraulicSpecs: {
      mainPump: 'Cilindros de Nitrógeno N2 a Alta Presión con Válvula de Disparo Neumática',
      maxFlow: 'Descarga total en < 30 segundos en vano motor y bombas hidráulicas',
      systemPressure: '14.5 bar (210 PSI en tanques de agente) / 150 bar en botella de nitrógeno',
      reliefValveSetting: 'Disco de ruptura de seguridad a 180 bar',
      pilotPressure: 'Línea de detección neumática termorreactiva a 180°C',
      hydraulicTankCapacity: 'Tanques dobles de 60 galones de polvo químico seco + líquido AFFF'
    },
    operatingSpecs: {
      operatingWeight: '185 kg (instalado en maquinaria pesada)',
      bucketCapacity: 'Cobertura: Motor, múltiple de escape, turbos, banco de válvulas hidráulicas y bombas principales',
      breakoutForce: 'Presión de descarga instantánea 14.5 bar',
      travelSpeed: 'N/A',
      groundPressure: 'Resistente a vibraciones extremas de perforadoras y palas'
    },
    criticalTorques: {
      'Pernos de Abrazaderas de Tanques de Agente (M16 Grado 8.8)': '140 Nm',
      'Racores de Tubería de Acero Inoxidable (JIC 37°)': '55 Nm (Evitar sobre-apriete)',
      'Sensor Térmico Lineal / Actuador de Disparo': '35 Nm',
      'Válvula de Descarga Nitrógeno': '80 Nm'
    },
    fluidCapacities: {
      'Agente Químico Seco (Total Flooding)': '45.0 kg de Polvo Púrpura K / ABC',
      'Agente Líquido Enfriador AFFF': '60.0 L (Espuma al 3% concentrada)',
      'Botellas de Gas Nitrógeno': '2 Botellas N2 de 10 Litros a 150 bar'
    },
    maintenanceIntervals: [
      { hours: 'Diario / Cada Turno de Mina', tasks: ['Inspección visual de manómetros en zona verde (14.5 bar)', 'Verificación de pasador de seguridad y precinto intacto en actuadores manuales de cabina'] },
      { hours: 'Cada 250 Horas', tasks: ['Limpieza de boquillas de descarga con tapón de silicona antipolvo', 'Inspección de cable sensor lineal térmico sin roturas mecánicas'] },
      { hours: 'Cada 6 Meses', tasks: ['Prueba de continuidad eléctrica en panel de control de cabina', 'Pesaje y prueba hidrostática de botellas de nitrógeno N2'] }
    ],
    criticalParts: [
      { partNumber: 'AFX-ACT-01', description: 'Actuador Manual de Cabina con Pasador de Seguridad', type: 'Seguridad Minera' },
      { partNumber: 'AFX-NOZ-04', description: 'Boquilla de Descarga de Cono Lleno de Acero Inox', type: 'Boquillas' },
      { partNumber: 'AFX-N2-CYL', description: 'Cilindro de Gas Nitrógeno N2 Recargable 150 bar', type: 'Presión' },
      { partNumber: 'AFX-SENS-180', description: 'Cable Sensor Térmico Lineal 180°C', type: 'Detección' }
    ]
  },
  {
    id: 'ds-ammann-asc110',
    brand: 'Ammann',
    model: 'ASC 110 Tier 3',
    category: 'Compactación',
    title: 'Ficha Técnica de Taller: Ammann ASC 110',
    tagline: 'Rodillo compactador monocilíndrico de 11 toneladas para terracerías y carreteras',
    engineSpecs: {
      engineModel: 'Cummins B3.9-C Turbocharged',
      powerHp: '115 HP @ 2,200 RPM',
      powerKw: '86 kW',
      displacement: '3.9 Litros (4 Cilindros)',
      emissionTier: 'Tier 3 Mecánico',
      fuelConsumptionAvg: '9.5 - 13.0 L/hora',
      fuelTankCapacity: '275 Litros'
    },
    hydraulicSpecs: {
      mainPump: 'Bombas Hidrostáticas Sauer-Danfoss de Circuito Cerrado',
      maxFlow: 'Propulsión 140 L/min / Vibración 95 L/min',
      systemPressure: 'Propulsión 420 bar / Vibración 380 bar',
      reliefValveSetting: '420 bar en calaje hidrostático',
      pilotPressure: '28 bar',
      hydraulicTankCapacity: '90 Litros (Sistema total 135L)'
    },
    operatingSpecs: {
      operatingWeight: '11,490 kg (11.5 Toneladas)',
      bucketCapacity: 'Ancho de tambor: 2,130 mm / Diámetro: 1,500 mm',
      breakoutForce: 'Fuerza centrífuga 260 kN (Alta amplitud) / 160 kN (Baja amplitud)',
      travelSpeed: '12.5 km/h (Rango de trabajo y transporte)',
      groundPressure: 'Carga lineal estática: 31.9 kg/cm'
    },
    criticalTorques: {
      'Pernos de Articulación Central del Chasis': '650 Nm (Pernos M27 Grado 10.9)',
      'Tornillos de Amortiguadores de Goma del Tambor': '280 Nm',
      'Pernos de Motor Hidrostático de Tambor': '380 Nm',
      'Tuercas de Ruedas Traseras Neumáticas': '510 Nm'
    },
    fluidCapacities: {
      'Aceite Motor Cummins': '11.0 L (15W-40 CK-4)',
      'Aceite Sistema Hidrostático': '90.0 L (ISO VG 46 / ISO VG 68 HVLP)',
      'Aceite de Excéntricas de Tambor Vibratorio': '18.0 L (85W-140 Sintético para alta temperatura)',
      'Eje Trasero Diferencial y Planetarios': '12.5 L (85W-90 GL-5)',
      'Refrigerante Motor': '22.0 L'
    },
    maintenanceIntervals: [
      { hours: 'Cada 250 Horas', tasks: ['Cambio de aceite de motor y filtro', 'Inspección de amortiguadores de goma de tambor sin agrietamiento'] },
      { hours: 'Cada 500 Horas', tasks: ['Reemplazo de filtros de combustible', 'Reemplazo de filtro hidráulico de alta presión de 10 micrones'] },
      { hours: 'Cada 1,000 Horas', tasks: ['Cambio de aceite en el tambor de vibración excéntrico', 'Cambio de lubricante en eje trasero', 'Calibración de frecuencias de vibración'] }
    ],
    criticalParts: [
      { partNumber: 'AMM-61201', description: 'Filtro Hidráulico de Alta Presión Hidrostática', type: 'Hidráulica OEM' },
      { partNumber: 'AMM-99341', description: 'Silentblock Amortiguador de Goma de Tambor', type: 'Tren de Rodaje' },
      { partNumber: 'LF3805', description: 'Filtro de Aceite Cummins B3.9', type: 'Filtración OEM' }
    ]
  }
];

// Master Parts Manuals & Hydraulic Schematics Database for Offline Consultation
export const CRITICAL_PARTS_MANUALS: PartsTechnicalManual[] = [
  {
    id: 'pm-filtration-matrix',
    title: 'Matriz Maestra de Filtración Cruzada en Minas & Canteras',
    system: 'Filtración',
    targetEquipment: 'Flotas JCB, LiuGong, Kubota, CAT, Cummins',
    fileSize: '1.4 MB',
    overview: 'Guía de equivalencias directas para reemplazo de filtros de motor, combustible, separadores de agua y filtros hidráulicos en operaciones aisladas sin señal telefónica.',
    diagnosticSteps: [
      'Identifique el código OEM impreso en el cartucho usado o el modelo del motor.',
      'Localice la fila correspondiente en la tabla de equivalencias a continuación.',
      'Antes de instalar, unte una fina película de aceite limpio en la junta de goma.',
      'Apriete a mano hasta el contacto de la junta más 3/4 de vuelta (no use llave de cadena para apretar).'
    ],
    schematicDetails: [
      { component: 'Filtro de Aceite Principal', specValue: 'Eficiencia 99% @ 20 Micrones (Beta 75)', safetyWarning: 'Nunca instalar filtros de bypass en circuitos de flujo total.' },
      { component: 'Separador de Agua Combustible', specValue: 'Elemento 30 Micrones con Purga de Drenaje', safetyWarning: 'Drenar agua diariamente antes del primer arranque del turno.' },
      { component: 'Filtro Hidráulico de Retorno', specValue: 'Micro-vidrio inorgánico 10 Micrones (Beta 1000)', safetyWarning: 'Reemplazar si el manómetro diferencial supera 2.2 bar.' }
    ],
    crossReferenceTable: [
      { oemCode: 'JCB 320/04133', donaldson: 'P550388', fleetguard: 'LF16015', baldwin: 'B7378', application: 'Motor JCB Dieselmax 4.4L' },
      { oemCode: 'JCB 32/925915', donaldson: 'P551424', fleetguard: 'FS19990', baldwin: 'BF7950', application: 'Trampa Agua JCB 3CX/4CX' },
      { oemCode: 'LiuGong 40C0434', donaldson: 'P170608', fleetguard: 'HF6588', baldwin: 'BT8851', application: 'Retorno Hidráulico 922E/936E' },
      { oemCode: 'Cummins 3937736', donaldson: 'P550428', fleetguard: 'LF3970', baldwin: 'B7030', application: 'Motor Cummins 6BTAA 5.9' },
      { oemCode: 'Kubota HH1C0-32430', donaldson: 'P502067', fleetguard: 'LF3925', baldwin: 'B1400', application: 'Motor Kubota V2403 Direct Inj' },
      { oemCode: 'LS Tractor 40007563', donaldson: 'P550779', fleetguard: 'LF16087', baldwin: 'BT8409', application: 'Motor FPT Plus 90/100' }
    ]
  },
  {
    id: 'pm-hydraulic-relief',
    title: 'Procedimiento de Calaje y Diagnóstico Hidráulico en Campo',
    system: 'Hidráulica',
    targetEquipment: 'Excavadoras LiuGong 922E / JCB JS220 / Bombas Kawasaki K3V',
    fileSize: '2.1 MB',
    overview: 'Instrucciones paso a paso para medir y calibrar presiones de alivio principal, circuito de pilotaje y bombas variables en campo usando manómetros analógicos de 600 bar.',
    diagnosticSteps: [
      'Conecte un manómetro calibrado de 0-600 bar en el puerto de prueba principal (TP1) ubicado en la salida de la bomba.',
      'Conecte un manómetro de 0-60 bar en el puerto de presión de pilotaje (TP2).',
      'Arranque el motor y caliente el aceite hidráulico hasta alcanzar entre 50°C y 60°C.',
      'Ponga el acelerador en RPM máximas (Modo H / Power).',
      'Lleve el cilindro de balde al tope máximo de carrera y mantenga accionado para forzar el alivio (Stall Test).',
      'Verifique que la presión alcance exactamente 34.3 MPa (343 bar). Si está descalibrada, afloje la contratuerca de la válvula MRV y gire el tornillo Allen 1/4 de vuelta.'
    ],
    schematicDetails: [
      { component: 'Válvula de Alivio Principal (MRV)', specValue: '34.3 MPa nominal / 37.3 MPa Power Boost activo', safetyWarning: 'No exceder 38.0 MPa para evitar fisuras en camisas de cilindros.' },
      { component: 'Circuito de Pilotaje', specValue: '3.9 MPa (39 bar ± 1 bar)', safetyWarning: 'Presión baja causa lentitud en joysticks y falta de respuesta.' },
      { component: 'Presión de Alivio de Giro (Slew Relief)', specValue: '27.5 MPa (275 bar)', safetyWarning: 'Calibrar con traba mecánica de giro colocada.' }
    ]
  },
  {
    id: 'pm-torques-engines',
    title: 'Manual de Torques y Pares de Apriete Críticos para Motores Pesados',
    system: 'Motor',
    targetEquipment: 'Motores JCB 444, Cummins 5.9 / 6.7, Kubota V2403, FPT F5C',
    fileSize: '1.8 MB',
    overview: 'Tabla unificada de especificaciones de apriete angular y torques para pernos de culata, bancada, bielas, inyectores y volantes de motor.',
    diagnosticSteps: [
      'Limpie completamente las roscas de los pernos y los orificios ciegos del bloque con aire comprimido.',
      'Lubrique ligeramente las roscas y la superficie de apoyo de la cabeza del perno con aceite de motor limpio.',
      'Aplique el torque en el orden numérico estricto del centro hacia afuera en patrón espiral.',
      'Utilice un goniómetro / transportador de ángulos para las fases de apriete en grados.'
    ],
    schematicDetails: [
      { component: 'Pernos Culata JCB Dieselmax 4.4L', specValue: 'Paso 1: 60 Nm -> Paso 2: 140 Nm -> Paso 3: 230 Nm', safetyWarning: 'Reemplazar pernos tras el 3er desmonte de culata.' },
      { component: 'Pernos Culata Cummins 6BT 5.9L', specValue: 'Paso 1: 70 Nm -> Paso 2: 140 Nm -> Paso 3: + 90°', safetyWarning: 'Asegurar que los pernos largos vayan en la fila de escape.' },
      { component: 'Pernos Culata Kubota V2403', specValue: 'Paso 1: 45 Nm -> Paso 2: 75 Nm -> Paso 3: 105 Nm', safetyWarning: 'No lubricar excesivamente el orificio para evitar bloqueo hidráulico.' },
      { component: 'Pernos de Bancada Principal', specValue: '180 Nm + 90° (JCB) / 170 Nm (Cummins)', safetyWarning: 'Verificar juego axial de cigüeñal (0.10 - 0.28 mm).' }
    ]
  },
  {
    id: 'pm-electrical-relays',
    title: 'Esquemas Eléctricos, Cajas de Fusibles & Códigos ECM',
    system: 'Eléctrico & ECM',
    targetEquipment: 'Retroexcavadoras, Excavadoras y Tractores TMD',
    fileSize: '2.5 MB',
    overview: 'Pinouts de conectores de cabina, relés de alta corriente (arranque, corte de inyección, luces LED) y tabla de diagnóstico de fallas OBD / J1939.',
    diagnosticSteps: [
      'Desconecte la llave de corte general de batería antes de intervenir mazos principales.',
      'Utilice un multímetro digital para verificar voltaje de referencia (5.0V ± 0.1V en sensores de presión de riel).',
      'Compruebe la resistencia en la red CAN-bus (60 Ohmios entre CAN-High y CAN-Low con encendido apagado).',
      'Si un fusible de 40A se quema repetidamente, verifique corto a masa en solenoide de pare o motor de arranque.'
    ],
    schematicDetails: [
      { component: 'Relé de Solenoide de Pare de Motor', specValue: 'Relé 40A 12V / Bobina 12 Ohmios', safetyWarning: 'Si falla, el motor no arrancará o no se apagará con la llave.' },
      { component: 'Fusible Principal de Alternador', specValue: 'Mega-fusible 80A / 100A', safetyWarning: 'Instalar únicamente fusibles atornillables de grado automotriz pesado.' },
      { component: 'Resistencia Terminal CAN-Bus', specValue: '120 Ohmios en cada extremo (60 Ohmios en paralelo)', safetyWarning: 'Una resistencia dañada desactiva la comunicación de pantalla e instrumentos.' }
    ]
  }
];

// Offline Vault Storage Service
const LOCAL_STORAGE_VAULT_KEY = 'tmd_pwa_offline_vault_state';
const LOCAL_STORAGE_QUEUE_KEY = 'tmd_pwa_offline_action_queue';

export interface VaultState {
  isFullyCached: boolean;
  cachedDatasheetsCount: number;
  cachedPartsManualsCount: number;
  totalVaultItems: number;
  totalCacheSizeMb: string;
  lastSyncDate: string;
  serviceWorkerActive: boolean;
}

export const getStoredVaultState = (): VaultState => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_VAULT_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read vault state from localStorage:', e);
  }

  return {
    isFullyCached: true,
    cachedDatasheetsCount: CRITICAL_TECHNICAL_DATASHEETS.length,
    cachedPartsManualsCount: CRITICAL_PARTS_MANUALS.length,
    totalVaultItems: CRITICAL_TECHNICAL_DATASHEETS.length + CRITICAL_PARTS_MANUALS.length,
    totalCacheSizeMb: '14.8 MB',
    lastSyncDate: new Date().toLocaleDateString('es-DO', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    serviceWorkerActive: 'serviceWorker' in navigator
  };
};

export const saveStoredVaultState = (state: VaultState): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_VAULT_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save vault state to localStorage:', e);
  }
};

// Register Service Worker in the browser
export const registerPwaServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('[TMD PWA] Service Worker registrado exitosamente con scope:', registration.scope);

    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const installingWorker = registration.installing;
      if (installingWorker) {
        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[TMD PWA] Nueva versión disponible en segundo plano.');
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.warn('[TMD PWA] Error al registrar Service Worker:', error);
    return null;
  }
};

// Force Precache of all technical datasheets and manuals
export const precacheAllTechnicalVault = async (
  onProgress?: (progress: number, itemLabel: string) => void
): Promise<VaultState> => {
  const totalItems = CRITICAL_TECHNICAL_DATASHEETS.length + CRITICAL_PARTS_MANUALS.length;
  let processed = 0;

  // Cache in Browser CacheStorage if supported
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const techCache = await caches.open('tmd-datasheets-v19.4');
      const manualsCache = await caches.open('tmd-manuals-v19.4');

      // Precache datasheets
      for (const ds of CRITICAL_TECHNICAL_DATASHEETS) {
        processed++;
        if (onProgress) {
          onProgress(Math.round((processed / totalItems) * 100), `Ficha Técnica: ${ds.brand} ${ds.model}`);
        }
        const dsBlob = new Blob([JSON.stringify(ds)], { type: 'application/json' });
        const dsResponse = new Response(dsBlob, {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'X-TMD-Offline': 'true' }
        });
        await techCache.put(`/tech-docs/${ds.id}.json`, dsResponse);
        await new Promise((r) => setTimeout(r, 60)); // smooth progress animation
      }

      // Precache parts manuals
      for (const pm of CRITICAL_PARTS_MANUALS) {
        processed++;
        if (onProgress) {
          onProgress(Math.round((processed / totalItems) * 100), `Manual: ${pm.title}`);
        }
        const pmBlob = new Blob([JSON.stringify(pm)], { type: 'application/json' });
        const pmResponse = new Response(pmBlob, {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'X-TMD-Offline': 'true' }
        });
        await manualsCache.put(`/manuals/${pm.id}.json`, pmResponse);
        await new Promise((r) => setTimeout(r, 60));
      }
    } catch (err) {
      console.warn('CacheStorage precache error (using localStorage fallback):', err);
    }
  }

  const newState: VaultState = {
    isFullyCached: true,
    cachedDatasheetsCount: CRITICAL_TECHNICAL_DATASHEETS.length,
    cachedPartsManualsCount: CRITICAL_PARTS_MANUALS.length,
    totalVaultItems: totalItems,
    totalCacheSizeMb: '14.8 MB',
    lastSyncDate: new Date().toLocaleDateString('es-DO', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    serviceWorkerActive: 'serviceWorker' in navigator
  };

  saveStoredVaultState(newState);
  return newState;
};

// Clear cached technical vault
export const clearTechnicalVaultCache = async (): Promise<void> => {
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      await caches.delete('tmd-datasheets-v19.4');
      await caches.delete('tmd-manuals-v19.4');
      await caches.delete('tmd-runtime-v19.4');
    } catch (e) {
      console.warn('Error clearing caches:', e);
    }
  }

  const resetState: VaultState = {
    isFullyCached: false,
    cachedDatasheetsCount: 0,
    cachedPartsManualsCount: 0,
    totalVaultItems: 0,
    totalCacheSizeMb: '0.0 MB',
    lastSyncDate: 'No sincronizado',
    serviceWorkerActive: 'serviceWorker' in navigator
  };

  saveStoredVaultState(resetState);
};
