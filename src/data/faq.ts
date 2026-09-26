export interface FAQItem {
  id: string;
  category: 'machinery' | 'financing' | 'parts' | 'warranty';
  categoryLabel: string;
  question: string;
  answer: string;
  keyPoints?: string[];
  actionLabel?: string;
  actionRoute?: string;
  actionType?: 'estimate' | 'route' | 'whatsapp' | 'call' | 'calc';
}

export const FAQ_DATA: FAQItem[] = [
  // 1. MAQUINARIA PESADA & CONFIGURACIÓN DOMINICANA
  {
    id: 'faq-mach-1',
    category: 'machinery',
    categoryLabel: 'Maquinaria Pesada & Rendimiento',
    question: '¿Vienen las maquinarias adaptadas para el clima tropical y calidad de combustible diésel de República Dominicana?',
    answer: 'Sí. Todos los equipos importados y distribuidos por TMD (JCB, LiuGong, LS Tractor, Ammann) vienen configurados de fábrica con especificación Heavy Duty Tropicalizada. Esto incluye radiadores de aluminio sobredimensionados de disipación térmica para operar bajo temperaturas caribeñas de +38°C a pleno sol, paquetes de prefiltros ciclónicos con trampa de agua Donaldson para proteger el sistema de inyección ante diésel comercial regular, y cabinas presurizadas con aire acondicionado reforzado de alto flujo.',
    keyPoints: [
      'Radiadores sobredimensionados diseñados para faenas continuas a +38°C',
      'Prefiltrado centrífugo y trampa de agua para diésel dominicano',
      'Cabinas ROPS/FOPS presurizadas con aire acondicionado tropicalizado'
    ],
    actionLabel: 'Ver Catálogo de Maquinaria',
    actionRoute: '#/machinery',
    actionType: 'route'
  },
  {
    id: 'faq-mach-2',
    category: 'machinery',
    categoryLabel: 'Maquinaria Pesada & Rendimiento',
    question: '¿Puedo realizar una prueba técnica o Test Drive en el Patio de Pruebas del Km 22 antes de comprar?',
    answer: 'Totalmente. TMD cuenta con un patio de pruebas técnicas de más de 12,000 m² en nuestra Sede Central en el Km 22 de la Autopista Duarte. Usted o su operador calificado pueden probar retroexcavadoras, cargadores, tractores y excavadoras en condiciones reales de empuje, excavación y carga sobre bancos de material, acompañados por un ingeniero de aplicación.',
    keyPoints: [
      'Patio de pruebas real de 12,000 m² en Autopista Duarte Km 22',
      'Evaluación en banco de tierra y roca con su propio operador',
      'Telemetría en vivo para verificar consumo diésel en tiempo real'
    ],
    actionLabel: 'Agendar Test Drive en Km 22',
    actionType: 'whatsapp'
  },
  {
    id: 'faq-mach-3',
    category: 'machinery',
    categoryLabel: 'Maquinaria Pesada & Rendimiento',
    question: '¿Aceptan maquinaria usada como parte de pago (Trade-In / Retoma)?',
    answer: 'Sí. Contamos con un programa oficial de Retoma (Trade-In) donde inspeccionamos su equipo usado mediante una auditoría técnica certificada de 150 puntos (motor, presión hidráulica, desgaste de orugas/neumáticos y estructura). El valor de tasación se aplica directamente como parte del inicial de su máquina nueva o seminueva certificada TMD.',
    keyPoints: [
      'Auditoría técnica transparente de 150 puntos en su obra o en nuestro patio',
      'Recepción de marcas reconocidas como abono al inicial',
      'Traspaso legal y cierre expedito sin complicaciones'
    ],
    actionLabel: 'Solicitar Avalúo de Trade-In',
    actionRoute: '#/trade-in',
    actionType: 'route'
  },

  // 2. FINANCIAMIENTO & LEASING BANCARIO
  {
    id: 'faq-fin-1',
    category: 'financing',
    categoryLabel: 'Financiamiento & Facturación Fiscal',
    question: '¿Qué facilidades de financiamiento y leasing bancario ofrecen en República Dominicana?',
    answer: 'TMD mantiene convenios corporativos preferenciales con las principales entidades financieras del país: Banco Popular Dominicano, Banco BHD, Banreservas, Banco BDI y Scotiabank. Ofrecemos estructuras de Leasing Financiero y Operativo que permiten deducir el 100% de las cuotas como gasto operacional de su empresa constructora ante la DGII, además de créditos comerciales directos estructurados para contratistas con proyectos de infraestructura en marcha.',
    keyPoints: [
      'Convenios con Banco Popular, BHD y Banreservas',
      'Plazos flexibles desde 12 hasta 60 meses con tasas competitivas',
      'Beneficios fiscales y deducción total de cuotas por leasing DGII'
    ],
    actionLabel: 'Calcular Cuota Mensual',
    actionType: 'calc'
  },
  {
    id: 'faq-fin-2',
    category: 'financing',
    categoryLabel: 'Financiamiento & Facturación Fiscal',
    question: '¿Cuál es el porcentaje de inicial requerido y cuánto demora la pre-calificación?',
    answer: 'El inicial estándar oscila entre el 15% y el 20% del valor del equipo, ajustándose al perfil crediticio de su empresa, historial comercial y garantías. Gracias a nuestros canales ejecutivos dedicados en la banca dominicana, emitimos pre-aprobaciones preliminares en 48 a 72 horas laborables tras recibir los estados financieros y documentos básicos de la constructora.',
    keyPoints: [
      'Iniciales desde 15% al 20% según perfil crediticio',
      'Pre-calificación ejecutiva en 48 a 72 horas laborables',
      'Acompañamiento integral de nuestro oficial de crédito corporativo'
    ],
    actionLabel: 'Hablar con Asesor de Crédito',
    actionType: 'whatsapp'
  },
  {
    id: 'faq-fin-3',
    category: 'financing',
    categoryLabel: 'Financiamiento & Facturación Fiscal',
    question: '¿Emiten Comprobantes Fiscales válidos para Crédito Fiscal (NCF Tipo B01) y licitaciones estatales?',
    answer: 'Absolutamente. Todas nuestras cotizaciones, ventas de maquinaria, contratos de renta y repuestos se facturan con Comprobantes Fiscales de Crédito Fiscal (NCF Tipo B01 o Gubernamental Tipo B15) válidos ante la DGII y la Dirección General de Contrataciones Públicas (DGCP). Cumplimos estrictamente con la normativa tributaria dominicana.',
    keyPoints: [
      'Facturas con NCF válidas para deducción de ITBIS y Gasto ISR',
      'RNC verificado: 1-01-85732-1 y Registro de Proveedores del Estado (RPE)',
      'Cotizaciones proforma válidas para licitaciones públicas del MOPC / INAPA / INDRHI'
    ],
    actionLabel: 'Solicitar Cotización con NCF',
    actionRoute: '#/checkout',
    actionType: 'route'
  },

  // 3. REPUESTOS & LOGÍSTICA NACIONAL
  {
    id: 'faq-parts-1',
    category: 'parts',
    categoryLabel: 'Repuestos OEM & Despacho Inmediato',
    question: '¿Cuentan con stock físico de repuestos en el país o se debe esperar importación?',
    answer: 'Mantenemos un almacén central de más de 4,500 m² ubicado estratégicamente en el Km 22 de la Autopista Duarte, Santo Domingo Oeste, con más de 18,000 líneas de ítems en inventario permanente. Disponemos de repuestos de alta rotación para entrega el mismo día: kits completos de filtros de 250h/500h/1000h, cuchillas, puntas y pasadores de balde, cadenas y rodillos de oruga, bombas hidráulicas y correas.',
    keyPoints: [
      'Almacén central en Autopista Duarte Km 22 con stock permanente',
      'Más de 18,000 ítems listos para despacho inmediato',
      'Componentes originales genuinos JCB, LiuGong, Cummins, ZF y Bosch'
    ],
    actionLabel: 'Consultar Almacén de Repuestos',
    actionRoute: '#/parts',
    actionType: 'route'
  },
  {
    id: 'faq-parts-2',
    category: 'parts',
    categoryLabel: 'Repuestos OEM & Despacho Inmediato',
    question: '¿Cómo coordinan los envíos al interior del país (Cibao, Este, Sur)?',
    answer: 'Para el Gran Santo Domingo realizamos despachos directos a obra con flotilla propia en 2 a 4 horas. Para obras en provincias (Santiago, Punta Cana, La Vega, Puerto Plata, Barahona, etc.), contamos con envíos prioritarios diarios a través de Metro Pac, Caribe Tours, Expreso Bávaro y transportistas de carga pesada, con entregas habituales en menos de 24 horas.',
    keyPoints: [
      'Despacho el mismo día en Santo Domingo y Distrito Nacional (2-4h)',
      'Envíos diarios vía Metro Pac y Caribe Tours a todo el territorio nacional',
      'Servicio de emergencia express directo al frente de obra'
    ],
    actionLabel: 'Pedir Repuesto Vía WhatsApp',
    actionType: 'whatsapp'
  },
  {
    id: 'faq-parts-3',
    category: 'parts',
    categoryLabel: 'Repuestos OEM & Despacho Inmediato',
    question: '¿Qué garantía tienen los repuestos genuinos OEM instalados por TMD?',
    answer: 'Todos los repuestos suministrados por TMD son partes OEM genuinas de fábrica. Cada componente cuenta con garantía de fábrica contra defectos de fabricación e incluye respaldo técnico adicional cuando la instalación es realizada por nuestros mecánicos certificados en nuestro taller Fullbay o en su obra.',
    keyPoints: [
      'Garantía directa de fabricante en repuestos 100% originales',
      'Trazabilidad de números de parte OEM de fábrica',
      'Opciones de instalación certificada con garantía de mano de obra'
    ],
    actionLabel: 'Ver Líneas de Repuestos',
    actionRoute: '#/parts',
    actionType: 'route'
  },

  // 4. GARANTÍA & TALLER MÓVIL EN OBRA
  {
    id: 'faq-war-1',
    category: 'warranty',
    categoryLabel: 'Garantía MasterCare & Soporte Técnico',
    question: '¿Qué cubre el programa de Garantía Oficial TMD MasterCare y qué duración tiene?',
    answer: 'El programa TMD MasterCare ofrece cobertura integral de hasta 2 años o 4,000 horas de operación (lo que ocurra primero) en el tren de fuerza principal: motor diésel, bloque, culata, turbocompresor, transmisión, mandos finales y sistema hidráulico principal. Incluye la Inspección Previa a la Entrega (PDI de 60 puntos) y la supervisión del primer servicio preventivo.',
    keyPoints: [
      'Hasta 2 años o 4,000 horas de cobertura oficial de fábrica',
      'Respaldo de tren de fuerza: motor, transmisión e hidráulica',
      'PDI certificado antes de despacho a la obra'
    ],
    actionLabel: 'Detalles de MasterCare',
    actionRoute: '#/service',
    actionType: 'route'
  },
  {
    id: 'faq-war-2',
    category: 'warranty',
    categoryLabel: 'Garantía MasterCare & Soporte Técnico',
    question: '¿Cómo opera el Taller Móvil SOS 24/7 si un equipo sufre una falla en un proyecto remoto?',
    answer: 'Disponemos de unidades móviles 4x4 equipadas como talleres de diagnóstico in situ con generador eléctrico, compresor, herramienta hidráulica de alta presión y software de escáner electrónico oficial. Nuestros técnicos se trasladan a cualquier provincia de la República Dominicana para evaluar y solucionar fallas en el menor tiempo posible, minimizando el tiempo muerto en su faena.',
    keyPoints: [
      'Camionetas 4x4 con equipamiento de taller y diagnóstico computarizado',
      'Cobertura de asistencia técnica en las 31 provincias',
      'Técnicos certificados con formación directa de fábrica'
    ],
    actionLabel: 'Solicitar Asistencia Técnica Móvil',
    actionRoute: '#/emergency-dispatch',
    actionType: 'route'
  }
];
