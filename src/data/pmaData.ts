import { PmaPlanTier } from '../types';

export const PMA_PLAN_TIERS: PmaPlanTier[] = [
  {
    id: 'pma-bronze',
    name: 'PMA Bronze • Esencial Fluidos & Filtros',
    badge: 'Bronze',
    targetFleetSize: '1 a 3 Equipos',
    pricePerOperatingHourUsd: 2.85,
    includedServices: [
      'Entrega programada de Kits de Filtros Donaldson / OEM a las 250h y 500h',
      'Descuento del 10% en repuestos de desgaste',
      'Revisión visual de 50 puntos por técnico en obra cada 500h',
      'Acceso al portal digital de historial de mantenimiento'
    ],
    fluidAnalysisIncluded: false,
    emergencyResponseSlaHours: 24,
    discountOnPartsPercent: 10,
    telematicsMonitoringIncluded: false,
    color: 'from-amber-700 to-amber-900'
  },
  {
    id: 'pma-silver',
    name: 'PMA Silver • Preventivo & Telemetría IoT',
    badge: 'Silver',
    targetFleetSize: '3 a 7 Equipos',
    pricePerOperatingHourUsd: 4.40,
    includedServices: [
      'Mano de obra técnica incluida en mantenimientos de 250h, 500h y 1000h',
      'Monitoreo activo LiveLink™ IoT con alertas tempranas de fallas DTC',
      'Muestreo de fluidos SOS cada 500h con análisis espectrométrico de metales',
      'Descuento del 15% en repuestos y lubricantes originales',
      'Certificado de inspección oficial TMD para reventa'
    ],
    fluidAnalysisIncluded: true,
    emergencyResponseSlaHours: 12,
    discountOnPartsPercent: 15,
    telematicsMonitoringIncluded: true,
    color: 'from-zinc-400 to-zinc-600'
  },
  {
    id: 'pma-gold',
    name: 'PMA Gold • Full Coverage & Garantía Total',
    badge: 'Gold',
    targetFleetSize: 'Flotas de más de 8 Equipos / Canteras',
    pricePerOperatingHourUsd: 6.95,
    includedServices: [
      'Cobertura 100% de mano de obra preventiva y correctiva programada',
      'Laboratorio de fluidos SOS ilimitado con diagnósticos predictivos inmediatos',
      'Taller móvil en obra con SLA de respuesta en menos de 4 horas en todo el país',
      'Máquina de respaldo en renta con 50% de bonificación si la parada excede 48h',
      'Descuento del 22% en componentes remanufacturados y rodaje',
      'Capacitación y certificación anual de operadores en TMD Academy'
    ],
    fluidAnalysisIncluded: true,
    emergencyResponseSlaHours: 4,
    discountOnPartsPercent: 22,
    telematicsMonitoringIncluded: true,
    color: 'from-amber-400 to-amber-600'
  }
];
