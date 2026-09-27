import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  updateDoc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { CustomerPurchaseOrder, OrderItemDetail, CustomerDetails, CartItem, MachineQuoteItem } from '../types';
import { USD_TO_DOP_RATE } from '../data/catalog';
import { getExchangeRateData } from './currencyRateService';

const ORDERS_COLLECTION = 'orders';
const LOCAL_ORDERS_KEY = 'tmd-customer-orders';

export const createPurchaseOrder = async (params: {
  orderNumber: string;
  clientId: string;
  clientEmail: string;
  clientName: string;
  companyName?: string;
  phone: string;
  customer: CustomerDetails;
  cartItems: CartItem[];
  machineQuotes?: MachineQuoteItem[];
  subtotalUsd: number;
  itbisUsd: number;
  shippingUsd: number;
  totalUsd: number;
  totalDop?: number;
  exchangeRate?: number;
  currency?: 'USD' | 'DOP';
}): Promise<CustomerPurchaseOrder> => {
  const items: OrderItemDetail[] = [
    ...params.cartItems.map((c) => ({
      id: c.part.id,
      name: c.part.name,
      partNumber: c.part.partNumber,
      brand: c.part.brand,
      category: c.part.category,
      priceUsd: c.part.priceUsd,
      quantity: c.quantity,
      image: c.part.image,
      isOem: c.part.isOem,
      type: 'part' as const
    })),
    ...(params.machineQuotes || []).map((m) => ({
      id: m.machine.id,
      name: m.machine.name,
      partNumber: m.machine.modelCode,
      brand: m.machine.brand,
      category: m.machine.category,
      priceUsd: m.machine.basePriceUsd,
      quantity: 1,
      image: m.machine.image,
      isOem: true,
      type: 'machine' as const,
      notes: m.needFinancing ? 'Cotización con financiamiento solicitado' : ''
    }))
  ];

  const now = new Date().toISOString();
  const orderId = params.orderNumber.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();

  const isPickup = params.customer.deliveryMethod === 'pickup_km22';
  const carrier = isPickup 
    ? 'Retiro en Centro Logístico TMD Km 22 Autopista Duarte'
    : params.customer.deliveryMethod === 'express_jobsite' 
      ? 'Flota TMD Móvil Directo a Obra'
      : 'MetroPac Encomiendas RD';

  const newOrder: CustomerPurchaseOrder = {
    id: orderId,
    orderNumber: params.orderNumber,
    clientId: params.clientId || 'guest',
    clientEmail: params.clientEmail || params.customer.email || 'cliente@tmd.com.do',
    clientName: params.clientName || params.customer.fullName || 'Cliente TMD',
    companyName: params.companyName || params.customer.companyName || '',
    phone: params.phone || params.customer.phone || '',
    items,
    itemsCount: items.reduce((acc, item) => acc + item.quantity, 0),
    subtotalUsd: params.subtotalUsd,
    itbisUsd: params.itbisUsd,
    shippingUsd: params.shippingUsd,
    totalUsd: params.totalUsd,
    totalDop: params.totalDop ?? Number((params.totalUsd * (params.exchangeRate || getExchangeRateData().rate || USD_TO_DOP_RATE)).toFixed(2)),
    currency: params.currency || 'USD',
    paymentMethod: params.customer.paymentMethod,
    paymentStatus: params.customer.paymentMethod === 'card' ? 'paid' : 'pending_verification',
    deliveryMethod: params.customer.deliveryMethod,
    deliveryAddress: params.customer.deliveryAddress || (isPickup ? 'Autopista Duarte Km 22, Santo Domingo Oeste' : ''),
    city: params.customer.city || 'Santo Domingo',
    ncfType: params.customer.ncfType,
    ncfNumber: params.customer.rncOrCedula ? `B01000${Math.floor(100000 + Math.random() * 900000)}` : '',
    rncOrCedula: params.customer.rncOrCedula || '',
    status: 'processing',
    trackingNumber: `TMD-LOG-${Math.floor(100000 + Math.random() * 900000)}`,
    carrier,
    estimatedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('es-DO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }),
    timeline: [
      {
        status: 'pending',
        title: 'Pedido Registrado',
        description: 'La orden fue recibida por nuestro sistema y asignada al centro de distribución TMD.',
        timestamp: now,
        location: 'Sede Central Km 22'
      },
      {
        status: 'processing',
        title: 'En Preparación y Validación de Stock',
        description: 'El equipo de almacén está empaquetando los repuestos originales con control de calidad.',
        timestamp: now,
        location: 'Almacén Central TMD'
      }
    ],
    notes: params.customer.notes || '',
    createdAt: now,
    updatedAt: now
  };

  // Save in LocalStorage for client-side persistence
  saveOrderToLocalStorage(newOrder);

  // If online & Firebase available, save to Firestore with stripped undefined
  try {
    const cleanPayload = JSON.parse(JSON.stringify(newOrder));
    const orderDocRef = doc(db, ORDERS_COLLECTION, orderId);
    await setDoc(orderDocRef, cleanPayload);
  } catch (err) {
    console.warn('Firestore orders sync failed (fallback to local state):', err);
  }

  return newOrder;
};

// Local storage helper
export const getLocalOrders = (): CustomerPurchaseOrder[] => {
  try {
    const data = localStorage.getItem(LOCAL_ORDERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveOrderToLocalStorage = (order: CustomerPurchaseOrder) => {
  try {
    const existing = getLocalOrders();
    const updated = [order, ...existing.filter((o) => o.id !== order.id && o.orderNumber !== order.orderNumber)];
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not save order to local storage', e);
  }
};

// Seed demo purchase orders for rich experience
export const generateDemoOrders = (userId: string, userEmail: string, userName: string): CustomerPurchaseOrder[] => {
  return [
    {
      id: 'ord-tmd-2026-8942',
      orderNumber: 'TMD-2026-8942',
      clientId: userId,
      clientEmail: userEmail,
      clientName: userName || 'Ing. Manuel Tavares',
      companyName: 'Constructora del Caribe S.R.L.',
      phone: '+1 (809) 560-1234',
      items: [
        {
          id: 'p-jcb-filter-01',
          name: 'Filtro de Aceite de Motor Original JCB',
          partNumber: '320/04133',
          brand: 'JCB Genuine',
          category: 'Filtros',
          priceUsd: 48.50,
          quantity: 4,
          image: '/assets/parts/jcb_fuel_filter_oem.jpg',
          isOem: true,
          type: 'part'
        },
        {
          id: 'p-jcb-hyd-02',
          name: 'Filtro Hidráulico Principal de Alta Presión',
          partNumber: '32/925346',
          brand: 'JCB Genuine',
          category: 'Hidráulica',
          priceUsd: 115.00,
          quantity: 2,
          image: '/assets/parts/hydraulic_control_valve_bench.jpg',
          isOem: true,
          type: 'part'
        },
        {
          id: 'p-wear-teeth-01',
          name: 'Puntas de Diente de Balde Tipo Escarificador',
          partNumber: '531-03205',
          brand: 'LiuGong OEM',
          category: 'Desgaste y Balde',
          priceUsd: 38.00,
          quantity: 6,
          image: '/assets/parts/bucket_tooth_monotooth.jpg',
          isOem: true,
          type: 'part'
        }
      ],
      itemsCount: 12,
      subtotalUsd: 652.00,
      itbisUsd: 117.36,
      shippingUsd: 25.00,
      totalUsd: 794.36,
      totalDop: 794.36 * USD_TO_DOP_RATE,
      currency: 'USD',
      paymentMethod: 'card',
      paymentStatus: 'paid',
      deliveryMethod: 'express_jobsite',
      deliveryAddress: 'Proyecto Circunvalación Norte Km 14, Tramo 2, Santiago',
      city: 'Santiago',
      ncfType: 'B01_CREDITO_FISCAL',
      ncfNumber: 'B01000847291',
      rncOrCedula: '131-89421-2',
      status: 'in_transit',
      trackingNumber: 'TMD-LOG-884920',
      carrier: 'Flota Móvil TMD Express - Unidad #04',
      estimatedDeliveryDate: 'Hoy - 4:30 PM',
      timeline: [
        {
          status: 'pending',
          title: 'Orden Confirmada & Pago Procesado',
          description: 'Pago aprobado mediante tarjeta de crédito corporativa Visa.',
          timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
          location: 'Pasarela Digital TMD'
        },
        {
          status: 'processing',
          title: 'Empaque y Control de Calidad',
          description: 'Verificación de números de parte OEM y sellos de seguridad.',
          timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
          location: 'Almacén Central Km 22'
        },
        {
          status: 'in_transit',
          title: 'En Ruta hacia el Frente de Obra',
          description: 'Camioneta técnica TMD en trayecto por Autopista Duarte.',
          timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
          location: 'Santiago de los Caballeros'
        }
      ],
      notes: 'Entregar en el campamento principal de la obra con el encargado Ing. Almonte.',
      createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
    },
    {
      id: 'ord-tmd-2026-7210',
      orderNumber: 'TMD-2026-7210',
      clientId: userId,
      clientEmail: userEmail,
      clientName: userName || 'Ing. Manuel Tavares',
      companyName: 'Constructora del Caribe S.R.L.',
      phone: '+1 (809) 560-1234',
      items: [
        {
          id: 'p-undercarriage-track-01',
          name: 'Cadena Sellada y Lubricada con Zapatas 600mm',
          partNumber: 'UC-922E-600',
          brand: 'LiuGong Heavy Undercarriage',
          category: 'Tren de Rodaje',
          priceUsd: 1450.00,
          quantity: 2,
          image: '/assets/parts/steel_track_chain_sprocket.jpg',
          isOem: true,
          type: 'part'
        },
        {
          id: 'p-ls-belt-01',
          name: 'Kit de Correas Serpentina y Alternador para Tractor LS',
          partNumber: 'LS-40039211',
          brand: 'LS Tractor Genuine',
          category: 'Motor Diesel',
          priceUsd: 85.00,
          quantity: 3,
          image: '/assets/parts/engine_gaskets_overhaul_kit.jpg',
          isOem: true,
          type: 'part'
        }
      ],
      itemsCount: 5,
      subtotalUsd: 3155.00,
      itbisUsd: 567.90,
      shippingUsd: 0.00,
      totalUsd: 3722.90,
      totalDop: 3722.90 * USD_TO_DOP_RATE,
      currency: 'USD',
      paymentMethod: 'transfer',
      paymentStatus: 'paid',
      deliveryMethod: 'pickup_km22',
      deliveryAddress: 'Autopista Duarte Km 22, Santo Domingo Oeste',
      city: 'Santo Domingo',
      ncfType: 'B01_CREDITO_FISCAL',
      ncfNumber: 'B01000789123',
      rncOrCedula: '131-89421-2',
      status: 'delivered',
      trackingNumber: 'TMD-PICKUP-4921',
      carrier: 'Retirado por Chofer Autorizado (Ficha #12)',
      estimatedDeliveryDate: 'Entregado con Conduce',
      timeline: [
        {
          status: 'pending',
          title: 'Orden Recibida',
          description: 'Transferencia verificada en Banco Popular Dominicano.',
          timestamp: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
          location: 'Finanzas TMD'
        },
        {
          status: 'ready_for_pickup',
          title: 'Listo en Mostrador de Repuestos',
          description: 'Piezas preparadas en bahía de despacho #2.',
          timestamp: new Date(Date.now() - 13 * 24 * 3600 * 1000).toISOString(),
          location: 'Sede Central Km 22'
        },
        {
          status: 'delivered',
          title: 'Entregado Satisfactoriamente',
          description: 'Firma de conduce y factura fiscal B01 entregada.',
          timestamp: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
          location: 'Mostrador Central'
        }
      ],
      notes: 'Retiro programado con camión plataforma de la empresa.',
      createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString()
    }
  ];
};
