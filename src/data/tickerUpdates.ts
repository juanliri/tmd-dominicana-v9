export interface TickerUpdate {
  id: string;
  type: 'arrival' | 'discount' | 'service' | 'logistics';
  badge: string;
  badgeColor: 'amber' | 'emerald' | 'sky' | 'purple';
  time: string;
  headline: string;
  detail: string;
  actionText?: string;
  actionRoute?: string;
}

export const TICKER_UPDATES: TickerUpdate[] = [
  {
    id: 'up-01',
    type: 'arrival',
    badge: 'LLEGADA PUERTO',
    badgeColor: 'amber',
    time: 'Hoy 08:30 AM',
    headline: 'Embarque Arribado a Puerto Río Haina',
    detail: '6 Retroexcavadoras JCB 3CX Eco 2026 listas para inspección PDI y entrega inmediata en patio Km 22.',
    actionText: 'Ver JCB 3CX',
    actionRoute: '#/machinery'
  },
  {
    id: 'up-02',
    type: 'discount',
    badge: 'OFERTA TALLER',
    badgeColor: 'emerald',
    time: 'Vigente hasta fin de mes',
    headline: '20% Descuento en Kits de Filtros OEM',
    detail: 'Al realizar cambio de aceite diésel en nuestro taller del Km 22 o con unidad móvil en obra.',
    actionText: 'Ver Repuestos',
    actionRoute: '#/parts'
  },
  {
    id: 'up-03',
    type: 'arrival',
    badge: 'PATIO KM 22',
    badgeColor: 'sky',
    time: 'Ayer 04:15 PM',
    headline: 'Nueva Excavadora LiuGong 922E HD Disponible',
    detail: 'Equipada con motor Cummins QSB 6.7, balde para cantera y zapatas de 600mm. Entrega inmediata.',
    actionText: 'Ver Ficha Técnica',
    actionRoute: '#/machinery'
  },
  {
    id: 'up-04',
    type: 'service',
    badge: 'TALLER MÓVIL',
    badgeColor: 'purple',
    time: 'En Ruta',
    headline: 'Camioneta 4x4 de Diagnóstico en el Cibao',
    detail: 'Técnicos certificados escaneando flotas en Santiago, La Vega y Moca sin costo de viáticos de traslado.',
    actionText: 'Agendar Visita',
    actionRoute: '#/service'
  },
  {
    id: 'up-05',
    type: 'arrival',
    badge: 'AGRO & GANADERÍA',
    badgeColor: 'amber',
    time: 'Nuevo Stock',
    headline: 'Tractores LS Plus 100 4WD con Cabina Climatizada',
    detail: 'Arribaron 4 unidades con transmisión Power Shuttle para proyectos de arroz y caña de azúcar.',
    actionText: 'Cotizar Tractor',
    actionRoute: '#/machinery'
  },
  {
    id: 'up-06',
    type: 'logistics',
    badge: 'DESPACHO RD',
    badgeColor: 'sky',
    time: 'Operativo 24h',
    headline: 'Envíos Diarios Prioritarios por MetroPac & Caribe Tours',
    detail: 'Repuestos despachados el mismo día con entrega en menos de 24 horas a Punta Cana, Samaná y Barahona.',
    actionText: 'Pedir Repuestos',
    actionRoute: '#/parts'
  },
  {
    id: 'up-07',
    type: 'discount',
    badge: 'LEASING BANCARIO',
    badgeColor: 'emerald',
    time: 'Convenio Especial',
    headline: 'Tasas Preferenciales con Banco Popular y BHD',
    detail: 'Aprobación ejecutiva en 48 horas con inicial desde 15% para contratistas de obras de infraestructura.',
    actionText: 'Calcular Cuota',
    actionRoute: '#/home'
  }
];
