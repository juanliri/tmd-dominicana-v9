export interface Machine360Frame {
  angle: number; // 0 to 360
  label: string; // e.g. 'Frente (0°)', 'Perspectiva Delantera Derecha (45°)', 'Costado Derecho (90°)', etc.
  image: string;
  compassBearing: string; // 'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'
}

export interface MachineVideoWalkaround {
  id: string;
  title: string;
  category: 'exterior' | 'cabina' | 'trabajo' | 'mantenimiento';
  duration: string;
  resolution: string;
  thumbnail: string;
  videoUrl: string; // Direct MP4 or responsive video stream
  description: string;
  highlightPoints: string[];
}

export interface MachineGalleryPhoto {
  id: string;
  title: string;
  category: 'Exterior' | 'Cabina' | 'Motor' | 'Hidráulica' | 'Tren de Rodaje' | 'Implementos';
  image: string;
  zoomImage: string;
  caption: string;
  technicalDetail: string;
}

export interface MachineInspectionHotspot {
  id: string;
  title: string;
  category: string;
  angleTarget: number; // Suggested angle frame to view this hotspot
  x: number; // percentage 0-100 on viewport
  y: number; // percentage 0-100 on viewport
  shortDescription: string;
  engineeringSpecs: string;
  inspectionCriteria: string;
  warrantyCoverage: string;
  status: 'optimal' | 'verified' | 'certified';
}

export interface MachineCadDimension {
  overallLengthM: number;
  overallWidthM: number;
  overallHeightM: number;
  maxDiggingDepthM?: number;
  maxReachM?: number;
  groundClearanceMm: number;
  trackShoeWidthMm?: number;
  wheelbaseMm?: number;
  turningRadiusM: number;
  operatorComparisonNote: string;
}

export interface Machine360Package {
  machineId: string;
  modelName: string;
  brand: string;
  tagline: string;
  badge360: string;
  dronePreviewAvailable: boolean;
  soundType: 'excavator' | 'backhoe' | 'tractor' | 'loader';
  frames: Machine360Frame[];
  videos: MachineVideoWalkaround[];
  gallery: MachineGalleryPhoto[];
  hotspots: MachineInspectionHotspot[];
  dimensions: MachineCadDimension;
  dominicanJobsiteStory: {
    client: string;
    location: string;
    operatingHours: number;
    fuelEfficiency: string;
    testimonial: string;
  };
}

export const MACHINES_360_DATA: Record<string, Machine360Package> = {
  'jcb-3cx-eco': {
    machineId: 'jcb-3cx-eco',
    modelName: 'Retroexcavadora JCB 3CX Eco 4x4',
    brand: 'JCB',
    tagline: 'Versatilidad legendaria y potencia británica probada en canteras y urbanismos de República Dominicana.',
    badge360: 'Escaneo 360° & Tour Virtual HD',
    dronePreviewAvailable: true,
    soundType: 'backhoe',
    frames: [
      { angle: 0, label: 'Frente Directo (0°)', compassBearing: 'N', image: '/assets/machinery/classic_robust_yellow_jcb_3cx_backhoe.jpg' },
      { angle: 30, label: 'Ángulo Delantero Derecho (30°)', compassBearing: 'NNE', image: '/assets/machinery/modern_jcb_3cx_eco_backhoe_excavator.jpg' },
      { angle: 60, label: 'Tres Cuartos Delantero (60°)', compassBearing: 'ENE', image: '/assets/machinery/rugged_jcb_3cx_eco_backhoe_loader.jpg' },
      { angle: 90, label: 'Costado Derecho Completo (90°)', compassBearing: 'E', image: '/assets/machinery/heavy_duty_yellow_jcb_3cx_eco.jpg' },
      { angle: 135, label: 'Posterior Derecho & Brazo Extensible (135°)', compassBearing: 'SE', image: '/assets/machinery/jcb_3cx_eco_compact_front_loader.jpg' },
      { angle: 180, label: 'Posterior Directo & Estabilizadores (180°)', compassBearing: 'S', image: '/assets/machinery/rugged_yellow_jcb_3cx_eco_4x4.jpg' },
      { angle: 225, label: 'Posterior Izquierdo (225°)', compassBearing: 'SW', image: '/assets/machinery/JCB_3CX.jpg' },
      { angle: 270, label: 'Costado Izquierdo Cabina & Motor (270°)', compassBearing: 'W', image: '/assets/machinery/JCB_3CX-14.jpg' },
      { angle: 315, label: 'Tres Cuartos Frontal Izquierdo (315°)', compassBearing: 'NW', image: '/assets/machinery/classic_robust_yellow_jcb_3cx_backhoe.jpg' },
    ],
    videos: [
      {
        id: 'jcb-vid-1',
        title: 'Paseo 360° & Características Exteriores',
        category: 'exterior',
        duration: '1:45',
        resolution: '4K Ultra HD',
        thumbnail: '/assets/machinery/classic_robust_yellow_jcb_3cx_backhoe.jpg',
        videoUrl: '/videos/tmd-patio-km22.mp4',
        description: 'Recorrido perimetral detallado mostrando el chasis reforzado de una pieza, balde frontal 6 en 1 y brazo de excavación con extensión Extradig.',
        highlightPoints: ['Estructura monobloque soldada', 'Líneas hidráulicas auxiliares', 'Protección de cilindros']
      },
      {
        id: 'jcb-vid-2',
        title: 'Tour en Cabina CommandPlus & Mandos',
        category: 'cabina',
        duration: '2:15',
        resolution: '1080p 60fps',
        thumbnail: '/assets/machinery/modern_jcb_3cx_eco_backhoe_excavator.jpg',
        videoUrl: '/videos/tmd-patio-km22.mp4',
        description: 'Visibilidad panorámica de 360°, aire acondicionado tropicalizado de alta capacidad y mandos joystick servoasistidos con ergonomía automotriz.',
        highlightPoints: ['A/C Tropicalizado para calor dominicano', 'Asiento con suspensión neumática', 'Display digital multifunción']
      },
      {
        id: 'jcb-vid-3',
        title: 'Prueba de Carga & Excavación en Roca Caliza',
        category: 'trabajo',
        duration: '2:40',
        resolution: '4K 60fps',
        thumbnail: '/assets/machinery/heavy_duty_yellow_jcb_3cx_eco.jpg',
        videoUrl: '/videos/tmd-patio-km22.mp4',
        description: 'Demostración de fuerza de desprendimiento de 6,227 kgf y ciclo rápido de carga en cantera de Santo Domingo Oeste.',
        highlightPoints: ['Fuerza de arranque excepcional', 'Tracción 4x4 Powershift', 'Bloqueo diferencial proporcional']
      }
    ],
    gallery: [
      {
        id: 'jcb-g1',
        title: 'Conjunto Frontal & Balde Cargador 1.0 m³',
        category: 'Exterior',
        image: '/assets/machinery/classic_robust_yellow_jcb_3cx_backhoe.jpg',
        zoomImage: '/assets/machinery/classic_robust_yellow_jcb_3cx_backhoe.jpg',
        caption: 'Cilindros de paralelismo automático y cuchilla de desgaste Hardox 450 para movimiento ágil de áridos.',
        technicalDetail: 'Capacidad colmada de 1,000 L, altura de descarga a 2.74 m sobre camiones volteo de 16-24 m³.'
      },
      {
        id: 'jcb-g2',
        title: 'Interior de Cabina Presurizada ROPS/FOPS',
        category: 'Cabina',
        image: '/assets/machinery/modern_jcb_3cx_eco_backhoe_excavator.jpg',
        zoomImage: '/assets/machinery/modern_jcb_3cx_eco_backhoe_excavator.jpg',
        caption: 'Nivel sonoro interior reducido a 74 dBA con climatizador reforzado y filtro de partículas de carbón.',
        technicalDetail: 'Asiento giratorio 180° para cambio instantáneo entre mando frontal y posterior.'
      },
      {
        id: 'jcb-g3',
        title: 'Compartimento Motor JCB EcoMAX 4.4L',
        category: 'Motor',
        image: '/assets/machinery/heavy_duty_yellow_jcb_3cx_eco.jpg',
        zoomImage: '/assets/machinery/heavy_duty_yellow_jcb_3cx_eco.jpg',
        caption: 'Motor turbo intercooler sin filtro de partículas DPF, altamente tolerante al diésel comercial dominicano.',
        technicalDetail: 'Par motor de 400 Nm a solo 1,200 RPM, optimizando hasta 16% de ahorro de combustible.'
      },
      {
        id: 'jcb-g4',
        title: 'Brazo Extensible Extradig & Zanjado',
        category: 'Implementos',
        image: '/assets/machinery/rugged_jcb_3cx_eco_backhoe_loader.jpg',
        zoomImage: '/assets/machinery/rugged_jcb_3cx_eco_backhoe_loader.jpg',
        caption: 'Brazo curvo de fundición de acero con extensión telescópica de 1.2 metros adicionales.',
        technicalDetail: 'Profundidad máxima de 5.46 metros ideal para zanjas de drenaje pluvial y acueductos.'
      }
    ],
    hotspots: [
      {
        id: 'hs-jcb-cab',
        title: 'Cabina Climatizada CommandPlus',
        category: 'Cabina & Seguridad',
        angleTarget: 0,
        x: 48,
        y: 35,
        shortDescription: 'Estructura certificada ROPS/FOPS con cristales tintados de seguridad y A/C de 8.5 kW.',
        engineeringSpecs: 'Certificación ISO 3471 (ROPS) / ISO 3449 (FOPS Nivel II). Filtración de aire doble etapa.',
        inspectionCriteria: 'Revisar sellado de empaques de puerta cada 500 horas y carga de gas refrigerante anual.',
        warrantyCoverage: '2 Años de garantía total en componentes eléctricos y compresor de climatización.',
        status: 'certified'
      },
      {
        id: 'hs-jcb-engine',
        title: 'Motor Diésel JCB EcoMAX 4.4L Tier 3',
        category: 'Tren Motriz',
        angleTarget: 270,
        x: 42,
        y: 52,
        shortDescription: '92 HP a 2,200 RPM con inyección Common Rail y separador de agua primario Donaldson.',
        engineeringSpecs: 'Cilindrada 4,400 cc, 4 cilindros en línea, turboalimentado. Inyección electrónica Bosch.',
        inspectionCriteria: 'Cambio de aceite y filtros cada 500 horas. Drenaje de trampa de agua semanal.',
        warrantyCoverage: '3,000 Horas o 2 Años con respaldo oficial TMD MasterCare en Km 22.',
        status: 'certified'
      },
      {
        id: 'hs-jcb-loader',
        title: 'Balde Cargador 6 en 1 con Horquillas',
        category: 'Cinemática Frontal',
        angleTarget: 60,
        x: 75,
        y: 65,
        shortDescription: 'Capacidad 1.0 m³ con mandíbula hidráulica para agarre de tuberías, postes y escombros.',
        engineeringSpecs: 'Fuerza de desprendimiento 6,227 kgf. Altura de volteo a 2.74 m. Cuchilla atornillable doble vida.',
        inspectionCriteria: 'Engrase de pasadores con grasa de litio EP-2 cada 10 horas de servicio pesado.',
        warrantyCoverage: '1 Año en componentes estructurales y cilindros hidráulicos.',
        status: 'verified'
      },
      {
        id: 'hs-jcb-extradig',
        title: 'Brazo de Excavación Extradig',
        category: 'Sistema de Zanjado',
        angleTarget: 135,
        x: 25,
        y: 45,
        shortDescription: 'Extensión telescópica que incrementa el alcance a 6.54 m y profundidad a 5.46 m.',
        engineeringSpecs: 'Fundición nodular de alta resistencia a torsión. Tubería auxiliar para martillo hidráulico.',
        inspectionCriteria: 'Verificar holgura de placas de deslizamiento de teflón cada 250 horas.',
        warrantyCoverage: '2 Años de respaldo en estructura de pluma y balancín.',
        status: 'certified'
      }
    ],
    dimensions: {
      overallLengthM: 5.62,
      overallWidthM: 2.35,
      overallHeightM: 3.61,
      maxDiggingDepthM: 5.46,
      maxReachM: 6.54,
      groundClearanceMm: 370,
      turningRadiusM: 4.15,
      operatorComparisonNote: 'Altura de cabina de 3.61 m ofrece al operador una línea de visión superior a 2.1 m sobre el nivel de suelo.'
    },
    dominicanJobsiteStory: {
      client: 'Constructora del Este S.A.',
      location: 'Autopista del Coral, Punta Cana',
      operatingHours: 2450,
      fuelEfficiency: '6.8 Galones / Jornada de 8 Horas',
      testimonial: 'La 3CX Eco nos ha dado el menor costo por metro cúbico movido en nuestras obras viales. El soporte móvil de TMD en la zona Este es inmediato.'
    }
  },

  'liugong-922e': {
    machineId: 'liugong-922e',
    modelName: 'Excavadora Hidráulica LiuGong 922E HD',
    brand: 'LiuGong',
    tagline: 'Fuerza de excavación brutal de 22 toneladas con tren de rodaje Heavy Duty para minería y roca.',
    badge360: 'Inspección 360° de Grado Minero',
    dronePreviewAvailable: true,
    soundType: 'excavator',
    frames: [
      { angle: 0, label: 'Frente Directo Chasis & Balde (0°)', compassBearing: 'N', image: '/assets/machinery/LiuGong_922E_Excavator_Official_Photo.jpg' },
      { angle: 30, label: 'Perspectiva Oruga Derecha & Pluma (30°)', compassBearing: 'NNE', image: '/assets/machinery/heavy_22_ton_liugong_922e_tracked.jpg' },
      { angle: 60, label: 'Costado Derecho 3/4 (60°)', compassBearing: 'ENE', image: '/assets/machinery/heavy_liugong_922e_hd_22_ton.jpg' },
      { angle: 90, label: 'Lateral Derecho & Compartimento de Bombas (90°)', compassBearing: 'E', image: '/assets/machinery/liugong_922e_hd_heavy_duty_hydraulic.jpg' },
      { angle: 135, label: 'Tres Cuartos Posterior & Contrapeso (135°)', compassBearing: 'SE', image: '/assets/machinery/liugong_922e_heavy_hydraulic_excavator_with.jpg' },
      { angle: 180, label: 'Posterior Directo & Radiadores (180°)', compassBearing: 'S', image: '/assets/machinery/LiuGong_922E_Long_Reach_Official_Photo.jpg' },
      { angle: 225, label: 'Posterior Izquierdo & Cabina (225°)', compassBearing: 'SW', image: '/assets/machinery/heavy_22_ton_liugong_922e_tracked.jpg' },
      { angle: 270, label: 'Lateral Izquierdo Completo con Oruga 600mm (270°)', compassBearing: 'W', image: '/assets/machinery/LiuGong_922E_Excavator_Official_Photo.jpg' },
      { angle: 315, label: 'Tres Cuartos Frontal Izquierdo (315°)', compassBearing: 'NW', image: '/assets/machinery/heavy_liugong_922e_hd_22_ton.jpg' },
    ],
    videos: [
      {
        id: 'lg922-vid-1',
        title: 'Walkaround 360° & Chasis HD Minero',
        category: 'exterior',
        duration: '2:10',
        resolution: '4K Ultra HD',
        thumbnail: '/assets/machinery/LiuGong_922E_Excavator_Official_Photo.jpg',
        videoUrl: '/videos/tmd-patio-km22.mp4',
        description: 'Inspección de las zapatas de oruga de 600 mm con triple garra, guías de oruga de longitud completa y bastidor en X sellado.',
        highlightPoints: ['Bastidor en X soldado por robot', 'Guías de oruga para roca', 'Chapa de desgaste inferior de 6 mm']
      },
      {
        id: 'lg922-vid-2',
        title: 'Cabina ROPS con Insonorización & Clima Tropical',
        category: 'cabina',
        duration: '1:50',
        resolution: '1080p 60fps',
        thumbnail: '/assets/machinery/heavy_22_ton_liugong_922e_tracked.jpg',
        videoUrl: '/videos/tmd-patio-km22.mp4',
        description: 'Pantalla LCD multifunción a color de 7 pulgadas con 6 modos de trabajo (Power, Economy, Fine, Lifting, Breaker, Attachment).',
        highlightPoints: ['Pantalla digital con diagnóstico de fallas', 'A/C de 6,000 Frigorías', 'Cámara de reversa gran angular']
      },
      {
        id: 'lg922-vid-3',
        title: 'Desmonte y Excavación en Roca Viva (Bonao)',
        category: 'trabajo',
        duration: '3:05',
        resolution: '4K 60fps',
        thumbnail: '/assets/machinery/liugong_922e_hd_heavy_duty_hydraulic.jpg',
        videoUrl: '/videos/tmd-patio-km22.mp4',
        description: 'Rendimiento en ciclo de carga de 11.2 segundos y fuerza en balde de 152.5 kN operando con balde para roca de 1.2 m³.',
        highlightPoints: ['Fuerza de desprendimiento 152.5 kN', 'Bomba Kawasaki 2 x 224 L/min', 'Sistema hidráulico regenerativo']
      }
    ],
    gallery: [
      {
        id: 'lg922-g1',
        title: 'Pluma y Balancín Reforzados con Placas Internas',
        category: 'Implementos',
        image: '/assets/machinery/heavy_liugong_922e_hd_22_ton.jpg',
        zoomImage: '/assets/machinery/heavy_liugong_922e_hd_22_ton.jpg',
        caption: 'Fundiciones macizas en pie de pluma y cabeza de balancín para soportar esfuerzos severos de torsión.',
        technicalDetail: 'Pluma estándar de 5.71 m y balancín HD de 2.91 m con tubería para martillo instalada de fábrica.'
      },
      {
        id: 'lg922-g2',
        title: 'Compartimento Hidráulico Kawasaki Japonés',
        category: 'Hidráulica',
        image: '/assets/machinery/LiuGong_922E_Excavator_Official_Photo.jpg',
        zoomImage: '/assets/machinery/LiuGong_922E_Excavator_Official_Photo.jpg',
        caption: 'Bomba doble de pistones axiales Kawasaki K3V112DTP de caudal variable y válvula de control principal Kawasaki.',
        technicalDetail: 'Flujo total de 448 L/min a 34.3 MPa (37.3 MPa con Power Boost activado).'
      },
      {
        id: 'lg922-g3',
        title: 'Motor Cummins QSB6.7 Turbo Tier 3',
        category: 'Motor',
        image: '/assets/machinery/heavy_22_ton_liugong_922e_tracked.jpg',
        zoomImage: '/assets/machinery/heavy_22_ton_liugong_922e_tracked.jpg',
        caption: '6 cilindros con turbocompresor Holset y sistema de filtrado de combustible Fleetguard de 3 etapas.',
        technicalDetail: 'Potencia neta de 161 HP (120 kW) a 2,000 RPM con 708 Nm de torque a 1,500 RPM.'
      },
      {
        id: 'lg922-g4',
        title: 'Tren de Rodaje HD con Rodillos Sellados de por Vida',
        category: 'Tren de Rodaje',
        image: '/assets/machinery/technical_photography_of_excavator_undercarriage_track.jpg',
        zoomImage: '/assets/machinery/technical_photography_of_excavator_undercarriage_track.jpg',
        caption: '49 zapatas por lado de triple garra en acero forjado con tratamiento térmico profundo.',
        technicalDetail: 'Presión sobre el suelo reducida a 47 kPa para óptima flotación en terrenos fangosos o taludes.'
      }
    ],
    hotspots: [
      {
        id: 'hs-lg922-engine',
        title: 'Motor Cummins QSB6.7 Diesel',
        category: 'Planta Motriz',
        angleTarget: 180,
        x: 52,
        y: 40,
        shortDescription: '161 HP con bomba de combustible Common Rail y prefiltro separador de agua para clima caribeño.',
        engineeringSpecs: '6.7 Litros, 6 cilindros en línea. Mantenimiento cada 500 horas. Diésel regular o B5.',
        inspectionCriteria: 'Verificar nivel de refrigerante anticorrosivo y estado de correas serpentinas semanalmente.',
        warrantyCoverage: '2 Años o 3,000 Horas con soporte de repuestos en stock permanente en Km 22.',
        status: 'certified'
      },
      {
        id: 'hs-lg922-hydraulics',
        title: 'Bomba Principal Kawasaki K3V112',
        category: 'Sistema Hidráulico',
        angleTarget: 90,
        x: 65,
        y: 55,
        shortDescription: 'Doble bomba de pistones axiales que entrega 448 L/min a 343 bar de presión de trabajo.',
        engineeringSpecs: 'Sistema de detección de carga negativo con válvulas de regeneración en pluma y balancín.',
        inspectionCriteria: 'Cambio de aceite hidráulico ISO VG 46 cada 2,000 horas, filtro de retorno cada 500 horas.',
        warrantyCoverage: 'Garantía oficial completa respaldada por técnicos certificados por LiuGong Global.',
        status: 'certified'
      },
      {
        id: 'hs-lg922-undercarriage',
        title: 'Tren de Rodaje Heavy Duty Orugas 600mm',
        category: 'Rodaje & Tracción',
        angleTarget: 270,
        x: 48,
        y: 72,
        shortDescription: 'Orugas reforzadas con guías continuas antidescarrilamiento para avance en rocas afiladas.',
        engineeringSpecs: 'Zapatas de 600 mm, 8 rodillos inferiores y 2 superiores sellados con sellos duo-cone.',
        inspectionCriteria: 'Medir tensión de cadena (deflexión recomendada 25-40 mm) cada 100 horas.',
        warrantyCoverage: '1 Año o 2,000 Horas en componentes de desgaste del tren de rodaje.',
        status: 'verified'
      },
      {
        id: 'hs-lg922-bucket',
        title: 'Balde de Roca 1.2 m³ Hardox',
        category: 'Herramienta de Corte',
        angleTarget: 0,
        x: 20,
        y: 65,
        shortDescription: 'Fabricado con planchas de desgaste lateral y fondo en acero antidesgaste Hardox 450.',
        engineeringSpecs: '5 dientes forjados con sistema de fijación vertical y protectores de labios laterales.',
        inspectionCriteria: 'Comprobar desgaste de dientes y pernos de retención diariamente.',
        warrantyCoverage: 'Garantía estructural contra defectos de fábrica de 12 meses.',
        status: 'certified'
      }
    ],
    dimensions: {
      overallLengthM: 9.68,
      overallWidthM: 2.98,
      overallHeightM: 3.05,
      maxDiggingDepthM: 6.56,
      maxReachM: 9.87,
      groundClearanceMm: 440,
      trackShoeWidthMm: 600,
      turningRadiusM: 2.85,
      operatorComparisonNote: 'El radio de giro de la cola es de solo 2.85 m, permitiendo trabajar en frentes de corte estrechos junto a camiones.'
    },
    dominicanJobsiteStory: {
      client: 'Consorcio Minero Dominicano',
      location: 'Cotuí / Bonao, Monseñor Nouel',
      operatingHours: 3820,
      fuelEfficiency: '4.9 Galones / Hora en ciclo continuo',
      testimonial: 'La 922E HD compite de tú a tú con las marcas tradicionales pero con repuestos que cuestan hasta un 35% menos y entrega el mismo día desde TMD.'
    }
  },

  'ls-tractor-plus100': {
    machineId: 'ls-tractor-plus100',
    modelName: 'Tractor Agrícola LS Tractor Plus 100 4WD',
    brand: 'LS Tractor',
    tagline: 'Líder surcoreano de tecnología agroindustrial para caña, arroz y ganadería en campos dominicanos.',
    badge360: 'Tour 360° Agroindustrial',
    dronePreviewAvailable: false,
    soundType: 'tractor',
    frames: [
      { angle: 0, label: 'Frente Directo Capó & Eje Delantero (0°)', compassBearing: 'N', image: '/assets/machinery/heavy_blue_agricultural_tractor_ls_mt7.jpg' },
      { angle: 45, label: 'Perspectiva Frontal Derecha (45°)', compassBearing: 'NE', image: '/assets/machinery/high_horsepower_blue_ls_tractor_mt7.jpg' },
      { angle: 90, label: 'Costado Derecho Depósito & Neumático R38 (90°)', compassBearing: 'E', image: '/assets/machinery/rugged_blue_heavy_ls_tractor_mt7.jpg' },
      { angle: 135, label: 'Tres Cuartos Trasero & Enganche de 3 Puntos (135°)', compassBearing: 'SE', image: '/assets/machinery/ls_tractor_mt7_agricultural_heavy_tractor.jpg' },
      { angle: 180, label: 'Posterior Directo TDF & Válvulas Remotas (180°)', compassBearing: 'S', image: '/assets/machinery/modern_high_performance_farm_tractor_with.jpg' },
      { angle: 225, label: 'Tres Cuartos Posterior Izquierdo (225°)', compassBearing: 'SW', image: '/assets/machinery/rugged_utility_farm_tractor_with_heavy.jpg' },
      { angle: 270, label: 'Costado Izquierdo Cabina Panorámica (270°)', compassBearing: 'W', image: '/assets/machinery/heavy_blue_agricultural_tractor_ls_mt7.jpg' },
      { angle: 315, label: 'Tres Cuartos Frontal Izquierdo (315°)', compassBearing: 'NW', image: '/assets/machinery/high_horsepower_blue_ls_tractor_mt7.jpg' },
    ],
    videos: [
      {
        id: 'ls100-vid-1',
        title: 'Walkaround 360° & Eje Delantero Sellado',
        category: 'exterior',
        duration: '1:35',
        resolution: '1080p Full HD',
        thumbnail: '/assets/machinery/heavy_blue_agricultural_tractor_ls_mt7.jpg',
        videoUrl: '/videos/tmd-patio-km22.mp4',
        description: 'Eje delantero cónico sellado para trabajo en fangales de arroz y suelos anegados sin riesgo de filtración de agua.',
        highlightPoints: ['Eje delantero estanco para arrozal', 'Radio de giro de 40° con freno', 'Contrapesos delanteros de 400 kg']
      },
      {
        id: 'ls100-vid-2',
        title: 'Cabina Climatizada 360° & Transmisión Synchro Shuttle',
        category: 'cabina',
        duration: '2:00',
        resolution: '1080p 60fps',
        thumbnail: '/assets/machinery/rugged_blue_heavy_ls_tractor_mt7.jpg',
        videoUrl: '/videos/tmd-patio-km22.mp4',
        description: 'Visibilidad panorámica con vidrios curvados, aislamiento térmico para sol caribeño e inversor de marcha al volante.',
        highlightPoints: ['20 marchas hacia adelante x 20 hacia atrás con Creeper', 'Asiento ergonómico con apoyabrazos', 'Radio Bluetooth']
      }
    ],
    gallery: [
      {
        id: 'ls-g1',
        title: 'Toma de Fuerza (TDF) & Enganche Categoría II',
        category: 'Implementos',
        image: '/assets/machinery/ls_tractor_mt7_agricultural_heavy_tractor.jpg',
        zoomImage: '/assets/machinery/ls_tractor_mt7_agricultural_heavy_tractor.jpg',
        caption: 'TDF electrohidráulica independiente de 3 velocidades (540 / 750 / 1000 RPM) y levante de 3,800 kg.',
        technicalDetail: '3 pares de válvulas remotas traseras para operar rastras pesadas, sembradoras y remolques basculantes.'
      },
      {
        id: 'ls-g2',
        title: 'Motor Iveco FPT Turbo Intercooler 105 HP',
        category: 'Motor',
        image: '/assets/machinery/high_horsepower_blue_ls_tractor_mt7.jpg',
        zoomImage: '/assets/machinery/high_horsepower_blue_ls_tractor_mt7.jpg',
        caption: 'Motor de 4 cilindros con altísimo torque a bajas revoluciones para arrastre continuo.',
        technicalDetail: 'Consumo optimizado de hasta 18% menos diésel en labores de preparación de suelos.'
      }
    ],
    hotspots: [
      {
        id: 'hs-ls-pto',
        title: 'Enganche de 3 Puntos & TDF Independiente',
        category: 'Enganche Posterior',
        angleTarget: 180,
        x: 50,
        y: 65,
        shortDescription: 'Capacidad de levante de 3,800 kg a las rótulas con cilindros auxiliares de asistencia.',
        engineeringSpecs: 'TDF con accionamiento electrohidráulico por botón en tablero o guardabarros trasero.',
        inspectionCriteria: 'Engrasar brazos telescópicos cada 50 horas y comprobar nivel de aceite de transmisión.',
        warrantyCoverage: '2 Años de garantía de fábrica con repuestos originales LS en Km 22.',
        status: 'certified'
      },
      {
        id: 'hs-ls-frontaxle',
        title: 'Eje Delantero Sellado Tipo Cónico',
        category: 'Tracción 4WD',
        angleTarget: 0,
        x: 50,
        y: 75,
        shortDescription: 'Diseño hermético exclusivo que previene la entrada de barro líquido y agua en arrozales.',
        engineeringSpecs: 'Transmisión por engranajes cónicos, sin crucetas expuestas ni retenes vulnerables.',
        inspectionCriteria: 'Verificar nivel de aceite para engranajes SAE 85W-140 cada 250 horas.',
        warrantyCoverage: '2 Años de garantía total en componentes de tracción.',
        status: 'certified'
      }
    ],
    dimensions: {
      overallLengthM: 4.35,
      overallWidthM: 2.18,
      overallHeightM: 2.78,
      groundClearanceMm: 465,
      wheelbaseMm: 2360,
      turningRadiusM: 3.95,
      operatorComparisonNote: 'El despeje al suelo de 465 mm evita daños a cultivos altos como plátano, yuca y caña de azúcar.'
    },
    dominicanJobsiteStory: {
      client: 'Agropecuaria Cibao Norte',
      location: 'La Vega / Jima Abajo, Rep. Dom.',
      operatingHours: 1980,
      fuelEfficiency: '2.8 Galones / Hora en fangueo de arroz',
      testimonial: 'El eje delantero sellado nos cambió la vida en el cultivo de arroz. Cero entradas de fango y la cabina con A/C protege al tractorista en las tardes más calurosas.'
    }
  },

  'liugong-clg856h': {
    machineId: 'liugong-clg856h',
    modelName: 'Cargador Frontal LiuGong CLG856H',
    brand: 'LiuGong',
    tagline: 'Capacidad de carga de 5 toneladas con transmisión alemana ZF para plantas de hormigón y canteras.',
    badge360: 'Inspección 360° Canteras & Puertos',
    dronePreviewAvailable: true,
    soundType: 'loader',
    frames: [
      { angle: 0, label: 'Frente Directo Balde 3.2 m³ (0°)', compassBearing: 'N', image: '/assets/machinery/LiuGong_856H_Wheel_Loader_Official_Photo.jpg' },
      { angle: 45, label: 'Perspectiva Delantera Derecha (45°)', compassBearing: 'NE', image: '/assets/machinery/LiuGong_856H_Wheel_Loader_Official_Photo.jpg' },
      { angle: 90, label: 'Costado Derecho & Articulación Central (90°)', compassBearing: 'E', image: '/assets/machinery/LiuGong_856H_Wheel_Loader_Official_Photo.jpg' },
      { angle: 135, label: 'Tres Cuartos Posterior & Radiador (135°)', compassBearing: 'SE', image: '/assets/machinery/LiuGong_856H_Wheel_Loader_Official_Photo.jpg' },
      { angle: 180, label: 'Posterior Directo & Capó Basculante (180°)', compassBearing: 'S', image: '/assets/machinery/LiuGong_856H_Wheel_Loader_Official_Photo.jpg' },
      { angle: 225, label: 'Tres Cuartos Posterior Izquierdo (225°)', compassBearing: 'SW', image: '/assets/machinery/LiuGong_856H_Wheel_Loader_Official_Photo.jpg' },
      { angle: 270, label: 'Costado Izquierdo Cabina Panorámica (270°)', compassBearing: 'W', image: '/assets/machinery/LiuGong_856H_Wheel_Loader_Official_Photo.jpg' },
      { angle: 315, label: 'Tres Cuartos Frontal Izquierdo (315°)', compassBearing: 'NW', image: '/assets/machinery/LiuGong_856H_Wheel_Loader_Official_Photo.jpg' },
    ],
    videos: [
      {
        id: 'clg856-vid-1',
        title: 'Walkaround 360° & Cinemática en Z de Carga',
        category: 'exterior',
        duration: '1:55',
        resolution: '4K Ultra HD',
        thumbnail: '/assets/machinery/LiuGong_856H_Wheel_Loader_Official_Photo.jpg',
        videoUrl: '/videos/tmd-patio-km22.mp4',
        description: 'Geometría de elevación en Z para fuerza de desprendimiento de 162 kN y llenado óptimo de tolvas y camiones de 30 m³.',
        highlightPoints: ['Fuerza de desprendimiento 162 kN', 'Transmisión ZF automática', 'Balde para agregados 3.2 m³']
      }
    ],
    gallery: [
      {
        id: 'clg856-g1',
        title: 'Balde de Alta Capacidad 3.2 m³ con Cuchilla Atornillable',
        category: 'Implementos',
        image: '/assets/machinery/LiuGong_856H_Wheel_Loader_Official_Photo.jpg',
        zoomImage: '/assets/machinery/LiuGong_856H_Wheel_Loader_Official_Photo.jpg',
        caption: 'Carga útil de 5,000 kg para despacho rápido de grava, arena lavada y clinker.',
        technicalDetail: 'Tiempo de ciclo total (levantar, descargar, bajar) de solo 9.8 segundos.'
      }
    ],
    hotspots: [
      {
        id: 'hs-clg856-trans',
        title: 'Transmisión Automática ZF Alemana',
        category: 'Tren de Fuerza',
        angleTarget: 90,
        x: 55,
        y: 60,
        shortDescription: 'Powershift con control electrohidráulico y función Kick-Down para penetración en pilas.',
        engineeringSpecs: '4 marchas hacia adelante y 3 hacia atrás. Acople directo para máxima eficiencia.',
        inspectionCriteria: 'Control de presión de embrague y reemplazo de microfiltro ZF cada 1,000 horas.',
        warrantyCoverage: '2 Años de garantía con servicio técnico en taller central Km 22.',
        status: 'certified'
      }
    ],
    dimensions: {
      overallLengthM: 8.42,
      overallWidthM: 2.97,
      overallHeightM: 3.48,
      groundClearanceMm: 430,
      turningRadiusM: 6.25,
      operatorComparisonNote: 'Altura máxima al pasador del balde de 4.16 m permite cargar tolvas altas de plantas de asfalto y hormigón.'
    },
    dominicanJobsiteStory: {
      client: 'Agregados & Concretos del Norte',
      location: 'Santiago de los Caballeros',
      operatingHours: 4100,
      fuelEfficiency: '4.2 Galones / Hora en carga de tolva',
      testimonial: 'El cargador 856H no para nunca. Despachamos más de 120 camiones diarios en la planta y la suavidad de la transmisión ZF reduce la fatiga del operador.'
    }
  }
};

/**
 * Returns 360 data package for a given machine ID, or fallback constructed package.
 */
export function getMachine360Package(machineId: string, fallbackMachine?: { name: string; brand: string; category: string; image: string }): Machine360Package {
  if (MACHINES_360_DATA[machineId]) {
    return MACHINES_360_DATA[machineId];
  }

  // Generate generic dynamic 360 package for remaining catalog machines
  const name = fallbackMachine?.name || 'Maquinaria Pesada TMD';
  const brand = fallbackMachine?.brand || 'LiuGong';
  const img = fallbackMachine?.image || '/assets/machinery/LiuGong_922E_Excavator_Official_Photo.jpg';

  return {
    machineId,
    modelName: name,
    brand,
    tagline: `Rendimiento industrial de alto nivel con garantía de fábrica y servicio de repuestos TMD Dominicana en el Km 22.`,
    badge360: 'Visualización Interactiva 360°',
    dronePreviewAvailable: false,
    soundType: 'excavator',
    frames: [
      { angle: 0, label: 'Vista Frontal (0°)', compassBearing: 'N', image: img },
      { angle: 45, label: 'Ángulo Frontal Derecho (45°)', compassBearing: 'NE', image: '/assets/machinery/heavy_22_ton_liugong_922e_tracked.jpg' },
      { angle: 90, label: 'Costado Derecho (90°)', compassBearing: 'E', image: '/assets/machinery/heavy_liugong_922e_hd_22_ton.jpg' },
      { angle: 180, label: 'Vista Posterior (180°)', compassBearing: 'S', image: '/assets/machinery/LiuGong_922E_Long_Reach_Official_Photo.jpg' },
      { angle: 270, label: 'Costado Izquierdo (270°)', compassBearing: 'W', image: '/assets/machinery/liugong_922e_heavy_hydraulic_excavator_with.jpg' },
    ],
    videos: [
      {
        id: `${machineId}-vid-1`,
        title: 'Inspección de Obra & Paseo Virtual',
        category: 'exterior',
        duration: '1:30',
        resolution: '1080p HD',
        thumbnail: img,
        videoUrl: '/videos/tmd-patio-km22.mp4',
        description: `Demostración de capacidades operativas y ergonomía del modelo ${name} en República Dominicana.`,
        highlightPoints: ['Estructura Heavy Duty', 'Garantía 2 Años', 'Taller Móvil Km 22']
      }
    ],
    gallery: [
      {
        id: `${machineId}-g1`,
        title: `Vista General ${name}`,
        category: 'Exterior',
        image: img,
        zoomImage: img,
        caption: `Equipo listo para despacho inmediato desde el patio central de TMD Dominicana en Autopista Duarte.`,
        technicalDetail: 'Configuración tropicalizada para clima húmedo y altas temperaturas de RD.'
      }
    ],
    hotspots: [
      {
        id: `hs-${machineId}-core`,
        title: 'Cabina & Mandos de Control',
        category: 'Seguridad & Ergonomía',
        angleTarget: 0,
        x: 50,
        y: 40,
        shortDescription: 'Estructura ROPS/FOPS con climatización reforzada y mandos intuitivos de alta precisión.',
        engineeringSpecs: 'Certificación internacional de seguridad con filtros antipolvo dobles.',
        inspectionCriteria: 'Inspección periódica cada 250 horas de trabajo.',
        warrantyCoverage: '2 Años de garantía TMD MasterCare.',
        status: 'certified'
      }
    ],
    dimensions: {
      overallLengthM: 6.5,
      overallWidthM: 2.4,
      overallHeightM: 3.1,
      groundClearanceMm: 380,
      turningRadiusM: 4.5,
      operatorComparisonNote: 'Dimensiones estandarizadas para fácil traslado en lowboy por las carreteras dominicanas sin permisos especiales de sobreancho.'
    },
    dominicanJobsiteStory: {
      client: 'Contratista Vial Asociado TMD',
      location: 'Santo Domingo / Autopista Duarte',
      operatingHours: 1200,
      fuelEfficiency: 'Excelente relación de consumo por hora',
      testimonial: 'Equipos confiables y el respaldo directo de piezas en el Km 22 nos garantiza cumplir los cronogramas de entrega.'
    }
  };
}
