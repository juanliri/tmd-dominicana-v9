import { ContractorTestimonial } from '../types';

export const CONTRACTOR_TESTIMONIALS: ContractorTestimonial[] = [
  {
    id: 'test-1',
    author: 'Ing. Carlos Medina',
    role: 'Gerente General de Operaciones',
    company: 'Constructora del Este S.A.',
    city: 'Punta Cana',
    province: 'La Altagracia',
    region: 'Este',
    sector: 'Vial y Carreteras',
    project: 'Ampliación Boulevard Turístico & Accesos Hoteleros Miches - Bávaro',
    rating: 5,
    date: 'Febrero 2026',
    equipmentUsed: ['JCB 3CX Eco', 'LiuGong 922E HD'],
    review: 'Trabajar en roca coralina en la zona este exige equipos que aguanten castigo continuo con cero fisuras en brazos. Las dos retroexcavadoras JCB 3CX y la excavadora LiuGong 922E han superado 2,400 horas de faena sin una sola falla hidráulica. Cuando requerimos filtros de mantenimiento Donaldson, el taller móvil de TMD despachó las piezas en menos de 4 horas directamente a la obra.',
    highlightMetric: {
      value: '+2,400 hrs',
      label: 'Operación continua en roca coralina sin paradas'
    },
    verifiedContractor: true
  },
  {
    id: 'test-2',
    author: 'Rafael Peralta',
    role: 'Director de Mecanización Agrícola',
    company: 'Agropecuaria Cibao Norte',
    city: 'La Vega',
    province: 'La Vega',
    region: 'Norte / Cibao',
    sector: 'Agroindustria',
    project: 'Preparación de Suelos & Cosecha Mecanizada de Arroz en Valle del Yuna',
    rating: 5,
    date: 'Enero 2026',
    equipmentUsed: ['LS Tractor Plus 100 4WD'],
    review: 'El suelo fangoso en los arrozales del Cibao arruina transmisiones ordinarias. Adquirimos una flota de tres tractores LS Plus 100 con rodado arrocero y la reducción de diésel por hectárea ha sido del 18.5%. El respaldo del equipo de servicio técnico de TMD desde el Km 22 ha sido impecable con revisiones programadas.',
    highlightMetric: {
      value: '-18.5%',
      label: 'Reducción de consumo de combustible diésel'
    },
    verifiedContractor: true
  },
  {
    id: 'test-3',
    author: 'Ing. Mercedes Valenzuela',
    role: 'Directora de Planta y Extracción',
    company: 'Consorcio Minero Dominicano',
    city: 'Bonao',
    province: 'Monseñor Nouel',
    region: 'Norte / Cibao',
    sector: 'Minería y Canteras',
    project: 'Cantera de Agregados, Mármol y Grava Clasificada',
    rating: 5,
    date: 'Marzo 2026',
    equipmentUsed: ['LiuGong CLG856H', 'LiuGong 922E HD'],
    review: 'En cantera de agregados el desgaste de balde y pasadores es brutal. El cargador frontal CLG856H con transmisión ZF alemana mueve más de 450 toneladas por turno sin forzar temperatura en el motor Cummins. La garantía TMD MasterCare de 2 años nos dio la certidumbre financiera que ningún importador genérico nos ofreció.',
    highlightMetric: {
      value: '450 Ton/turno',
      label: 'Rendimiento promedio de carga en tolva'
    },
    verifiedContractor: true
  },
  {
    id: 'test-4',
    author: 'Ing. Franklyn Santana',
    role: 'Director Residente de Obra',
    company: 'Ingeniería & Estructuras Metropolitanas S.R.L.',
    city: 'Santo Domingo Norte',
    province: 'Santo Domingo',
    region: 'Gran Santo Domingo',
    sector: 'Vial y Carreteras',
    project: 'Circunvalación de Santo Domingo (Tramo II) y Puentes',
    rating: 5,
    date: 'Diciembre 2025',
    equipmentUsed: ['LiuGong CLG6114E', 'JCB 205 HD'],
    review: 'El rodillo compactador LiuGong CLG6114E logró el 98% Proctor estándar en solo 4 pasadas sobre base granular, lo que aceleró la recepción de capas por parte de supervisión del MOPC. La relación costo-beneficio frente a marcas tradicionales americanas es incomparable, con repuestos siempre en almacén central.',
    highlightMetric: {
      value: '4 Pasadas',
      label: 'Para 98% de compactación Proctor estándar'
    },
    verifiedContractor: true
  },
  {
    id: 'test-5',
    author: 'Lic. Alejandro Guzmán',
    role: 'Contratista Principal',
    company: 'Desarrollos Civiles del Sur',
    city: 'Pedernales / Cabo Rojo',
    province: 'Pedernales',
    region: 'Sur',
    sector: 'Construcción y Edificaciones',
    project: 'Infraestructura Urbana & Vías del Polo Turístico Cabo Rojo',
    rating: 5,
    date: 'Febrero 2026',
    equipmentUsed: ['JCB 3CX Eco', 'Ammann ARX 26'],
    review: 'Operar en el suroeste profundo a más de 300 km de la capital siempre representaba un riesgo logístico para piezas y lubricantes. TMD nos habilitó despacho directo vía Metro Pac y camión de taller programado cada 500 horas. Excelente atención comercial y soporte post-venta para proyectos estratégicos.',
    highlightMetric: {
      value: '< 24 Horas',
      label: 'Despacho de kits de filtros al Suroeste'
    },
    verifiedContractor: true
  },
  {
    id: 'test-6',
    author: 'Ing. Marino Almonte',
    role: 'Socio Fundador',
    company: 'Movimiento de Tierras del Cibao S.R.L.',
    city: 'Santiago de los Caballeros',
    province: 'Santiago',
    region: 'Norte / Cibao',
    sector: 'Construcción y Edificaciones',
    project: 'Plataformas Industriales & Naves en Zona Franca Santiago',
    rating: 5,
    date: 'Enero 2026',
    equipmentUsed: ['LiuGong 922E HD', 'JCB 3CX Eco'],
    review: 'La asesoría de TMD para tramitar el leasing con Banco Popular fue rápida y transparente. En 72 horas teníamos aprobada la línea y la máquina entregada con inspección PDI completa. La cabina con aire acondicionado reforzado para clima dominicano mantiene a nuestros operadores rindiendo turnos dobles sin fatiga.',
    highlightMetric: {
      value: '72 Horas',
      label: 'Aprobación de leasing y entrega en Santiago'
    },
    verifiedContractor: true
  },
  {
    id: 'test-7',
    author: 'Arq. Belkis Rosario',
    role: 'Gerente de Proyectos',
    company: 'Rosario & Asociados Constructores',
    city: 'Distrito Nacional',
    province: 'Distrito Nacional',
    region: 'Gran Santo Domingo',
    sector: 'Construcción y Edificaciones',
    project: 'Torres Residenciales en Piantini y Naco (Excavación de Sótanos)',
    rating: 5,
    date: 'Febrero 2026',
    equipmentUsed: ['Yanmar SV08-1C', 'LiuGong 9035E'],
    review: 'Para la excavación de 4 niveles de sótanos en pleno polígono central necesitábamos mini-excavadoras que maniobraran en espacios ultra reducidos con cero emisión excesiva. La Yanmar y la mini LiuGong 9035E nos permitieron cumplir el cronograma 2 semanas antes de lo pactado.',
    highlightMetric: {
      value: '-14 Días',
      label: 'Adelanto en cronograma de excavación profunda'
    },
    verifiedContractor: true
  },
  {
    id: 'test-8',
    author: 'Ing. Joaquín De Los Santos',
    role: 'Superintendente de Maquinaria',
    company: 'Ingenio & Cañaverales del Este',
    city: 'La Romana',
    province: 'La Romana',
    region: 'Este',
    sector: 'Agroindustria',
    project: 'Corte, Nivelación y Drenajes en Plantaciones de Caña',
    rating: 5,
    date: 'Marzo 2026',
    equipmentUsed: ['LS Tractor MT7.101', 'JCB 3CX Eco'],
    review: 'El calor y polvo en zafra azucarera exigen radiadores con malla anti-obstrucción y filtros de aire de servicio pesado. Los tractores LS serie MT7 entregados por TMD vienen configurados con paquetes tropicales reales que previenen recalentamientos incluso a 38°C al mediodía.',
    highlightMetric: {
      value: '100% Uptime',
      label: 'Disponibilidad durante temporada completa de zafra'
    },
    verifiedContractor: true
  }
];

export const CONTRACTOR_STATS = {
  averageRating: 4.97,
  totalReviews: 142,
  provincesCovered: 31,
  fleetUptimeRate: '99.1%',
  satisfactionRate: '99.4%',
  totalHoursLogged: '+185,000 hrs',
  dgiiCompliantContracts: '100%'
};
