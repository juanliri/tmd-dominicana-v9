export type Currency = 'USD' | 'DOP';

export type MachineBrand = 
  | 'JCB' 
  | 'LiuGong' 
  | 'Kubota' 
  | 'LS Tractor' 
  | 'Yanmar' 
  | 'Ammann' 
  | 'IMER' 
  | 'AFEX' 
  | 'Yomel' 
  | 'Orsi' 
  | 'Celli'
  | string;

export type MachineCategory = 
  | 'Excavadoras' 
  | 'Retroexcavadoras' 
  | 'Tractores' 
  | 'Compactación' 
  | 'Cargadores' 
  | 'Minicargadores'
  | 'Plantas de Concreto'
  | 'Sistemas Contra Incendios'
  | 'Implementos Agrícolas'
  | 'Manipuladores'
  | 'Cosechadoras'
  | string;

export interface Machine {
  id: string;
  sku?: string;
  name: string;
  brand: MachineBrand;
  category: MachineCategory;
  modelCode: string;
  year: number;
  image: string;
  powerHp: number;
  enginePowerHp?: number;
  operatingWeightKg: number;
  bucketCapacityM3?: number;
  engine: string;
  description: string;
  inStock: boolean;
  featured: boolean;
  warrantyMonths?: number;
  basePriceUsd: number;
  specs: {
    label: string;
    value: string;
  }[];
  applications: string[];
}

export type AssemblyType = 
  | 'powertrain' 
  | 'hydraulics' 
  | 'boom_bucket' 
  | 'undercarriage' 
  | 'cab_electric' 
  | 'transmission';

export interface MachineAssembly {
  id: AssemblyType;
  name: string;
  category: string;
  description: string;
  hotspot: {
    x: number; // percentage 0-100 on blueprint
    y: number; // percentage 0-100 on blueprint
  };
  calloutNumber: number;
  maintenanceInterval: string;
  recommendedInspection: string;
  associatedPartIds: string[];
}

export interface Part {
  id: string;
  sku?: string;
  partNumber: string;
  name: string;
  brand: string;
  category: 'Filtros' | 'Tren de Rodaje' | 'Hidráulica' | 'Motor Diesel' | 'Desgaste y Balde' | 'Lubricantes' | 'Extinción de Incendios' | 'Concreto' | 'Implementos' | string;
  assemblyId?: AssemblyType;
  compatibleModels: string[];
  priceUsd: number;
  stockQty: number;
  stockKm22?: number;
  image: string;
  description: string;
  isOem: boolean;
  deliveryTimeHours: number;
  crossReferences?: string[];
  engineCompatibilities?: string[];
  warehouseLocation?: string;
  priceDop?: number;
  itbisUsd?: number;
  totalWithItbisUsd?: number;
}

export interface CartItem {
  part: Part;
  quantity: number;
}

export interface MachineCustomizationOption {
  id: string;
  name: string;
  category: 'attachments' | 'cabin' | 'powertrain_hydraulics' | 'technology_safety' | 'undercarriage_tires' | 'warranty_service';
  categoryLabel: string;
  description: string;
  minPriceUsd: number;
  maxPriceUsd: number;
  isIncludedDefault?: boolean;
  exclusiveGroup?: string; // for mutually exclusive groups (e.g. cabin_type, warranty_level, undercarriage_type)
  applicableCategories?: string[]; // if only for specific machine categories, empty = all
  specsBadge?: string;
}

export interface MachineQuoteItem {
  machine: Machine;
  notes?: string;
  needFinancing?: boolean;
  selectedCustomizations?: MachineCustomizationOption[];
  estimatedPriceRange?: {
    minUsd: number;
    maxUsd: number;
  };
}

export type PaymentMethod = 'transfer' | 'card' | 'credit_line' | 'cash_pickup';

export type DeliveryMethod = 'pickup_km22' | 'nationwide_metropac' | 'express_jobsite';

export type DominicanNcfType = 'B01_CREDITO_FISCAL' | 'B02_CONSUMIDOR_FINAL' | 'B14_REGIMEN_ESPECIAL' | 'B15_GUBERNAMENTAL' | string;

export interface CustomerDetails {
  fullName: string;
  companyName?: string;
  rncOrCedula?: string;
  ncfType: DominicanNcfType;
  phone: string;
  email?: string;
  city: string;
  deliveryAddress?: string;
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  isGuest: boolean;
  saveInfoForFuture: boolean;
  notes?: string;
}

export interface SavedCustomerProfile {
  fullName: string;
  companyName?: string;
  rncOrCedula?: string;
  ncfType?: DominicanNcfType;
  phone: string;
  email?: string;
  city?: string;
  deliveryAddress?: string;
  preferredPayment?: PaymentMethod;
  preferredDelivery?: DeliveryMethod;
  savedAt: string;
}

export interface CompletedOrder {
  orderId: string;
  createdAt: string;
  customer: CustomerDetails;
  items: CartItem[];
  machineQuotes?: MachineQuoteItem[];
  subtotalUsd: number;
  itbisUsd: number;
  shippingUsd: number;
  totalUsd: number;
  totalDop: number;
  status: 'confirmed' | 'processing';
}

export interface OrderItemDetail {
  id: string;
  name: string;
  partNumber?: string;
  brand: string;
  category?: string;
  priceUsd: number;
  quantity: number;
  image?: string;
  isOem?: boolean;
  type: 'part' | 'machine';
  notes?: string;
}

export interface OrderTimelineEvent {
  status: string;
  title: string;
  description: string;
  timestamp: string;
  location?: string;
}

export interface CustomerPurchaseOrder {
  id: string;
  orderNumber: string;
  clientId: string;
  clientEmail: string;
  clientName: string;
  companyName?: string;
  phone: string;
  items: OrderItemDetail[];
  itemsCount: number;
  subtotalUsd: number;
  itbisUsd: number;
  shippingUsd: number;
  totalUsd: number;
  totalDop: number;
  currency: 'USD' | 'DOP';
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending_verification' | 'credit_approved' | 'on_delivery';
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  city?: string;
  ncfType?: 'B01_CREDITO_FISCAL' | 'B02_CONSUMIDOR_FINAL' | string;
  ncfNumber?: string;
  rncOrCedula?: string;
  status: 'pending' | 'processing' | 'ready_for_pickup' | 'in_transit' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  carrier?: string;
  estimatedDeliveryDate?: string;
  timeline: OrderTimelineEvent[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractorTestimonial {
  id: string;
  author: string;
  role: string;
  company: string;
  city: string;
  province: string;
  region: 'Norte / Cibao' | 'Este' | 'Gran Santo Domingo' | 'Sur';
  sector: 'Vial y Carreteras' | 'Minería y Canteras' | 'Construcción y Edificaciones' | 'Agroindustria';
  project: string;
  rating: number;
  date: string;
  equipmentUsed: string[];
  review: string;
  highlightMetric: {
    value: string;
    label: string;
  };
  verifiedContractor: boolean;
}

export type UserRole = 'client' | 'staff' | 'admin' | 'CLIENT' | 'STAFF' | 'ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  companyName?: string;
  phone?: string;
  role: UserRole;
  rnc?: string;
  maintenanceAlertsEnabled?: boolean;
  maintenanceReminderThresholdHours?: number; // default 100
  notifyByWhatsApp?: boolean;
  notifyByBrowserPush?: boolean;
  // TMD Pro-Member Loyalty & VIP fields
  isProMember?: boolean;
  proMemberTier?: 'Silver' | 'Gold' | 'Platinum';
  proMemberPoints?: number;
  proMemberSince?: string;
  proMemberNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyPointsRecord {
  id: string;
  date: string;
  activity: string;
  points: number;
  type: 'earned' | 'redeemed';
  orderReference?: string;
  category?: 'part_purchase' | 'service_order' | 'bonus' | 'redemption' | 'equipment_registration';
}

export interface ProMemberReward {
  id: string;
  title: string;
  pointsCost: number;
  description: string;
  code: string;
  category: 'discount' | 'service' | 'merchandise' | 'shipping';
  valueEstimateUsd: number;
  badge?: string;
}

export interface ProMemberDiscountTier {
  id: string;
  category: string;
  discountPercentage: number;
  couponCode: string;
  minPurchaseUsd?: number;
  description: string;
  badgeText: string;
  applicableTo: 'all_parts' | 'filters' | 'undercarriage' | 'fluids' | 'get';
}

export type CrmFunnelStage = 
  | 'new_inquiry'           // Nueva solicitud RFQ recibida en Firestore
  | 'contacted'             // Primer contacto realizado por asesor comercial
  | 'technical_evaluation'  // Validación de aplicación técnica, terreno y aditamentos
  | 'commercial_proposal'   // Proforma formal con desglose fiscal y financiamiento
  | 'negotiation'           // Revisión de condiciones de pago, leasing o entrega
  | 'won'                   // Cerrada Ganada (Orden confirmada)
  | 'lost';                 // Cerrada Perdida

export type CrmInquirySource = 
  | 'portal_rfq' 
  | 'checkout_cart' 
  | 'quick_calculator' 
  | 'machine_customizer' 
  | 'direct_inquiry' 
  | 'catalog_lead';

export type CrmBuyerIntent = 'high' | 'medium' | 'exploratory';
export type CrmInquiryPriority = 'urgent' | 'high' | 'medium' | 'standard';

export interface CrmInquiryActivity {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  fromStage?: CrmFunnelStage;
  toStage?: CrmFunnelStage;
  notes?: string;
}

export interface CrmInquiry {
  id: string;
  quoteId: string;
  quoteNumber: string;
  clientId: string;
  clientEmail: string;
  clientName: string;
  companyName?: string;
  phone: string;
  rncOrCedula?: string;
  source: CrmInquirySource;
  funnelStage: CrmFunnelStage;
  dealValueUsd: number;
  dealValueDop: number;
  currency: 'USD' | 'DOP';
  equipmentCategory?: string;
  equipmentInterested?: string;
  buyerIntent: CrmBuyerIntent;
  leadScore: number; // 0 - 100
  assignedSalesRep: string;
  assignedSalesEmail: string;
  assignedSalesPhone?: string;
  followUpDueDate: string;
  priority: CrmInquiryPriority;
  lossReason?: 'price' | 'delivery_time' | 'competitor_brand' | 'financing_declined' | 'project_delayed' | 'other' | string;
  lossNotes?: string;
  wonDate?: string;
  itemsCount: number;
  itemsSummary: string;
  customerNotes?: string;
  financingMethod?: string;
  downPaymentUsd?: number;
  activityLog: CrmInquiryActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface CrmFunnelMetrics {
  totalInquiries: number;
  totalPipelineUsd: number;
  weightedPipelineUsd: number;
  closedWonUsd: number;
  closedLostUsd: number;
  overallWinRatePercent: number;
  avgDealSizeUsd: number;
  avgDaysToClose: number;
  stageCounts: Record<CrmFunnelStage, number>;
  stageValuesUsd: Record<CrmFunnelStage, number>;
  stageConversionRates: {
    inquiryToContact: number;
    contactToTechEval: number;
    techEvalToProposal: number;
    proposalToNegotiation: number;
    negotiationToWon: number;
  };
}

export interface PortalQuote {
  id: string;
  quoteNumber: string;
  clientId: string;
  clientEmail: string;
  clientName: string;
  companyName?: string;
  rnc?: string;
  phone?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'in_review';
  currency: 'USD' | 'DOP';
  subtotal: number;
  itbis: number;
  total: number;
  itemsCount: number;
  itemsSummary: string;
  notes?: string;
  assignedStaffId?: string;
  crmInquiryId?: string;
  crmFunnelStage?: CrmFunnelStage;
  crmLeadScore?: number;
  assignedSalesRep?: string;
  // DGII Fiscal Invoicing Integration
  ncfType?: 'B01_CREDITO_FISCAL' | 'B02_CONSUMIDOR_FINAL' | string;
  ncfNumber?: string;
  // Anticipos y Gestión de Cobros (Patio Km 22)
  downPaymentAmountUsd?: number;
  downPaymentMethod?: 'banco_popular' | 'banco_bhd' | 'banreservas' | 'scotiabank' | 'efectivo_caja' | string;
  downPaymentReference?: string;
  downPaymentDate?: string;
  downPaymentVerified?: boolean;
  balanceDueUsd?: number;
  // Trade-In Retoma de Maquinaria Usada
  tradeInDeductionUsd?: number;
  tradeInAllowance?: number;
  tradeInEquipmentName?: string | null;
  tradeInEquipmentBrand?: string | null;
  tradeInEquipmentYear?: number | null;
  tradeInEquipmentHours?: number | null;
  tradeInStatus?: 'pending_inspection' | 'approved_deduction' | 'none';
  // Patio Km 22 Gate Pass (Pase de Salida)
  gatePassAuthorized?: boolean;
  gatePassCode?: string;
  gatePassIssuedAt?: string;
  gatePassBay?: string;
  gatePassDriverName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdvancePaymentRecord {
  id: string;
  quoteId: string;
  quoteNumber: string;
  clientId: string;
  clientName: string;
  companyName?: string;
  amountUsd: number;
  amountDop: number;
  bank: 'Banco Popular Dominicano' | 'Banco BHD' | 'Banreservas' | 'Scotiabank República Dominicana' | 'Caja Central Km 22';
  referenceNumber: string;
  paymentType: 'reserva_30' | 'inicial_50' | 'saldo_final' | 'abono_libre';
  status: 'verified' | 'pending_verification' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface TradeInEvaluation {
  id: string;
  quoteId?: string;
  clientName: string;
  phone: string;
  equipmentBrand: string;
  equipmentModel: string;
  year: number;
  operatingHours: number;
  engineCondition: 'excelente' | 'bueno' | 'regular' | 'requiere_overhaul';
  hydraulicsCondition: 'excelente' | 'bueno' | 'regular' | 'fuga_menor';
  undercarriagePercent: number; // 0 - 100%
  estimatedAppraisalUsd: number;
  tmdOfferUsd: number;
  inspectionStatus: 'evaluacion_preliminar' | 'inspeccion_km22' | 'aprobada' | 'rechazada';
  appraiserName?: string;
  inspectionNotes?: string;
  createdAt: string;
}

export interface ServiceKitDefinition {
  id: string;
  kitCode: string;
  brand: MachineBrand;
  compatibleModels: string[];
  intervalHours: 250 | 500 | 1000 | 2000;
  title: string;
  description: string;
  filterParts: {
    partNumber: string;
    name: string;
    type: 'oil_filter' | 'fuel_filter' | 'hydraulic_filter' | 'air_primary' | 'air_secondary';
    quantity: number;
  }[];
  fluidSpecifications: {
    name: string;
    grade: string;
    volumeGallons: number;
  }[];
  priceUsd: number;
  priceDop: number;
  inStock: boolean;
  image?: string;
}

export interface InstalledServicePart {
  id?: string;
  partNumber: string;
  name: string;
  partName?: string;
  brand: string;
  category?: string;
  quantity: number;
  unitPriceUsd?: number;
  unitCostUsd?: number;
  totalPriceUsd?: number;
  totalCostUsd?: number;
  status?: string;
  isOem?: boolean;
  warrantyPeriod?: string;
  serialBatch?: string;
}

export interface RegisteredEquipment {
  id: string;
  unitId: string; // e.g. "EX-01" or "Ficha #01"
  brand: string;
  model: string;
  serialNumber: string;
  year?: number;
  currentHorometer: number;
  lastServiceDate?: string;
  nextServiceHours: number;
  serviceIntervalHours?: number; // e.g. 250, 500, 1000
  nextServiceDate?: string;
  reminderThresholdHours?: number; // default 100
  reminderAutoEnabled?: boolean;
  lastReminderSentAt?: string;
  jobsiteLocation?: string;
  assignedOperator?: string;
  status: 'active' | 'in_service' | 'idle' | 'retired';
  image?: string;
  clientId?: string;
  clientEmail?: string;
  companyName?: string;
  vin?: string;
}

export interface ServiceWorkOrder {
  id: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  companyName?: string;
  equipmentUnitId?: string;
  equipmentBrand?: string;
  machineModel: string;
  machineSerial: string;
  equipmentYear?: number;
  horometerHours?: number;
  serviceType: 
    | 'preventive_250h' 
    | 'preventive_500h' 
    | 'preventive_1000h' 
    | 'hydraulic_repair' 
    | 'engine_overhaul' 
    | 'undercarriage' 
    | 'electrical_diagnostic'
    | 'bucket_wear_repair'
    | 'certified_safety_inspection';
  serviceCategory?: string;
  location: string;
  workshopName?: string;
  priority: 'routine' | 'urgent' | 'emergency';
  status: 'requested' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  assignedTechnician?: string;
  technicianTitle?: string;
  scheduledDate?: string;
  completedDate?: string;
  description: string;
  workPerformed?: string;
  technicianNotes?: string;
  diagnosticReport?: string;
  installedParts?: InstalledServicePart[];
  installedPartsCount?: number;
  nextServiceDueHours?: number;
  nextServiceDueDate?: string;
  totalLaborCostUsd?: number;
  totalPartsCostUsd?: number;
  totalCostUsd?: number;
  totalCostDop?: number;
  warrantyMonths?: number;
  warrantyHours?: number;
  estimatedHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMachine {
  id: string;
  name: string;
  brand: string;
  category: string;
  modelCode: string;
  year: number;
  powerHp?: number;
  operatingWeightKg?: number;
  basePriceUsd: number;
  inStock: boolean;
  stockQty: number;
  minStockAlert?: number;
  serialNumber?: string;
  location?: string;
  status: 'available' | 'reserved' | 'sold' | 'maintenance';
  image?: string;
  description?: string;
  updatedAt: string;
}

export interface InventoryAlert {
  id: string;
  itemType: 'machine' | 'part';
  itemId: string;
  title: string;
  code: string; // modelCode or partNumber
  brand: string;
  category: string;
  currentStock: number;
  minStock: number;
  severity: 'out_of_stock' | 'critical';
  location?: string;
  image?: string;
  updatedAt: string;
}

export interface InventoryPart {
  id: string;
  partNumber: string;
  name: string;
  brand: string;
  category: string;
  priceUsd: number;
  stockQty: number;
  minStockAlert?: number;
  locationBin?: string;
  isOem: boolean;
  compatibleModels?: string[];
  image?: string;
  description?: string;
  deliveryTimeHours?: number;
  updatedAt: string;
}

export type NotificationType = 'quote_status' | 'special_offer' | 'service_update' | 'maintenance_due' | 'system';

export interface AppNotification {
  id: string;
  userId: string; // specific user UID or 'all' for broadcasts
  title: string;
  body: string;
  type: NotificationType;
  quoteId?: string;
  quoteNumber?: string;
  offerCode?: string;
  discountPercent?: number;
  validUntil?: string;
  targetCategory?: string;
  equipmentId?: string;
  equipmentUnitId?: string;
  equipmentModel?: string;
  currentHorometer?: number;
  nextServiceHours?: number;
  hoursRemaining?: number;
  serviceTypeRecommended?: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface FinancingPlan {
  machineId: string;
  machineName: string;
  modelCode: string;
  priceUsd: number;
  downPaymentPercent: number;
  downPaymentAmountUsd: number;
  financedPrincipalUsd: number;
  durationMonths: number;
  annualInterestRate: number;
  monthlyPaymentUsd: number;
  monthlyPaymentDop: number;
  totalFinancedPaidUsd: number;
  totalInterestPaidUsd: number;
}

export interface TmdWorkshop {
  id: string;
  name: string;
  province: string;
  region: 'Santo Domingo' | 'Cibao / Norte' | 'Este' | 'Sur';
  address: string;
  coordinates: [number, number]; // [lat, lng]
  phone: string;
  whatsapp: string;
  email: string;
  schedule: string;
  isMainHub?: boolean;
  hasMobileUnits: boolean;
  mobileUnitsCount: number;
  certifications: string[];
  specialties: string[];
  emergencyPhone?: string;
  manager: string;
}

// ==========================================
// JCB LIVELINK TELEMATICS & IOT TYPES
// ==========================================

export interface LiveLinkFaultCode {
  code: string;
  system: 'Motor Diesel' | 'Sistema Hidráulico' | 'Transmisión' | 'Emisiones DEF' | 'Eléctrico / CAN Bus';
  severity: 'critical' | 'warning' | 'info';
  description: string;
  spnFmi?: string; // Standard J1939 SPN-FMI code
  timestamp: string;
  active: boolean;
}

export interface LiveLinkUnit {
  id: string;
  vin: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  customerName: string;
  customerCompany: string;
  customerEmail?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    province: string;
  };
  lastKnownLocation?: {
    lat: number;
    lng: number;
    address: string;
    province: string;
  };
  status: 'running' | 'idle' | 'stopped' | 'offline';
  horometerHours: number;
  operatingHours?: number;
  fuelLevelPercent: number;
  fuelConsumptionLph: number; // Liters per hour
  defLevelPercent: number;
  batteryVoltage: number;
  engineCoolantTempC: number;
  hydraulicOilTempC: number;
  lastCommunication: string;
  geofenceStatus: 'inside' | 'breach' | 'disabled';
  geofenceName: string;
  serviceCountdownHours: number;
  faultCodes: LiveLinkFaultCode[];
  immobilizerActive: boolean;
  canBusHealth: 'optimal' | 'warning' | 'fault';
}

export interface LiveLinkTelemetrySummary {
  totalUnits: number;
  runningUnits: number;
  idleUnits: number;
  stoppedUnits: number;
  offlineUnits: number;
  criticalAlertsCount: number;
  avgFleetFuelConsumption: number;
  fleetHealthScore: number;
}

// ==========================================
// FULLBAY HEAVY-DUTY SHOP MANAGEMENT TYPES
// ==========================================

export interface FullbayPartLineItem {
  partNumber: string;
  name: string;
  brand: string;
  quantity: number;
  unitCostUsd: number;
  totalCostUsd: number;
  status: 'in_stock' | 'allocated' | 'requested';
  binLocation?: string;
}

export type FullbayOrderStatus = 
  | 'triage' 
  | 'scheduled' 
  | 'in_progress' 
  | 'waiting_parts' 
  | 'quality_check' 
  | 'invoiced' 
  | 'closed';

export interface FullbayWorkOrder {
  id: string;
  fullbayOrderNumber: string; // e.g. "FB-2026-4412"
  customerId: string;
  customerName: string;
  customerCompany: string;
  customerPhone?: string;
  unitFicha: string;
  unitVin: string;
  unitModel: string;
  unitBrand: string;
  unitHorometer: number;
  status: FullbayOrderStatus;
  priority: 'routine' | 'urgent' | 'emergency';
  serviceDepartment: 
    | 'Taller Central Km 22' 
    | 'Unidad Móvil Campo 24/7' 
    | 'Hidráulica y Banqueo' 
    | 'Overhaul Motores';
  assignedTechnicianId: string;
  assignedTechnicianName: string;
  technicianClockStatus: 'clocked_in' | 'on_break' | 'clocked_out';
  technicianLaborHours: number;
  laborRateUsd: number;
  complaint: string;
  cause?: string;
  correction: string;
  partsRequired: FullbayPartLineItem[];
  totalLaborUsd: number;
  totalPartsUsd: number;
  totalAmountUsd: number;
  totalAmountDop: number;
  ncfType: 'B01_CREDITO_FISCAL' | 'B02_CONSUMIDOR_FINAL';
  ncfNumber?: string;
  estimateApproved?: boolean;
  estimateApprovedBy?: string;
  estimateApprovedAt?: string;
  estimateApprovedNotes?: string;
  livelinkSynced: boolean;
  livelinkFaultCodeRef?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FullbayCounterSale {
  id: string;
  counterSaleNumber: string;
  customerId?: string;
  customerName: string;
  customerCompany?: string;
  customerEmail?: string;
  customerPhone?: string;
  rncOrCedula?: string;
  ncfType: 'B01_CREDITO_FISCAL' | 'B02_CONSUMIDOR_FINAL';
  ncfNumber: string;
  items: Array<{
    partNumber: string;
    name: string;
    brand: string;
    quantity: number;
    unitPriceUsd: number;
    totalPriceUsd: number;
    binLocation?: string;
  }>;
  subtotalUsd: number;
  itbisUsd: number;
  totalUsd: number;
  totalDop: number;
  paymentMethod: 'credit_card' | 'bank_transfer' | 'cash_pickup';
  paymentStatus: 'paid' | 'pending';
  warehouseOrigin: string;
  createdAt: string;
}

export interface IntegrationsHealthStatus {
  status: 'healthy' | 'degraded' | 'critical';
  timestamp: string;
  services: {
    cloudRun: { status: 'operational'; uptimeHours: number; memoryMb: number; latencyMs: number };
    fullbayConnect: { status: 'operational' | 'degraded'; latencyMs: number; activeShopId: string; lastSyncTime: string };
    jcbLiveLink: { status: 'operational' | 'degraded'; unitsOnline: number; latencyMs: number; feedStandard: string };
    kubotaAemp: { status: 'operational' | 'degraded'; unitsOnline: number; latencyMs: number; standard: string };
    geminiAi: { status: 'operational' | 'fallback_ready'; model: string; latencyMs: number };
    dgiiFiscalService: { status: 'operational'; activeSequenceYear: number };
  };
}

export interface FullbayTechnician {
  id: string;
  name: string;
  title: string;
  specialty: string;
  assignedMobileUnit?: string;
  currentOrderId: string | null;
  efficiencyRating: number;
  certifications: string[];
  phone: string;
  status: 'available' | 'working' | 'in_field' | 'off_duty';
}

// =========================================================================
// FASE XI: RENTA DE MAQUINARIA PESADA Y LOGÍSTICA DE TRANSPORTE
// =========================================================================
export interface RentalEquipment {
  id: string;
  name: string;
  brand: string;
  category: string;
  model: string;
  image: string;
  imageUrl?: string;
  dayRateUsd: number;
  weekRateUsd: number;
  monthRateUsd: number;
  operatorRateDayUsd: number;
  minRentalDays: number;
  availabilityStatus: 'available' | 'reserved' | 'in_project';
  baseLocation: 'Km 22 Autopista Duarte' | 'Santiago Base Norte' | 'Punta Cana Base Este';
  specs: {
    powerHp: number;
    weightTons: number;
    bucketM3?: number;
    fuelConsumptionLph: number;
  };
  features: string[];
}

export interface RentalQuoteCalculation {
  equipmentId: string;
  rentalPeriodDays: number;
  withOperator: boolean;
  destinationProvince: string;
  lowboyFreightUsd: number;
  equipmentRateUsd: number;
  operatorCostUsd: number;
  refundableDepositUsd: number;
  subtotalUsd: number;
  itbisUsd: number;
  totalUsd: number;
  totalDop: number;
}

// =========================================================================
// FASE XII: LABORATORIO DE ANÁLISIS DE ACEITES Y FLUIDOS SOS / TRIBOLOGÍA
// =========================================================================
export type FluidCompartment = 
  | 'Motor Diésel' 
  | 'Sistema Hidráulico' 
  | 'Transmisión PowerShift' 
  | 'Mandos Finales / Diferencial'
  | 'Refrigerante ELC';

export type OilSeverity = 'normal' | 'caution' | 'critical';

export interface OilSampleReport {
  id: string;
  sampleNumber: string; // e.g. "SOS-2026-8812"
  unitFicha: string;
  unitVin: string;
  unitModel: string;
  unitBrand: string;
  customerName: string;
  customerCompany: string;
  compartment: FluidCompartment;
  oilBrandGrade: string; // e.g. "15W-40 CK-4 Heavy Duty"
  fluidHours: number;
  machineHorometer: number;
  samplingDate: string;
  reportDate: string;
  severity: OilSeverity;
  wearMetals: {
    ironPpm: number;      // Fe
    copperPpm: number;    // Cu
    leadPpm: number;      // Pb
    chromiumPpm: number;  // Cr
    aluminumPpm: number;  // Al
    tinPpm: number;       // Sn
  };
  contaminants: {
    siliconPpm: number;            // Polvo de cantera / Si
    sootPercent: number;           // Hollín de combustión
    waterPercent: number;          // Humedad
    fuelDilutionPercent: number;   // Fuga de inyectores
  };
  physicalProps: {
    viscosity100c: number; // cSt
    tbn: number;           // Total Base Number
  };
  diagnosisSummary: string;
  technicalRecommendation: string;
  recommendedPartKitId?: string;
  analystName: string;
}

// =========================================================================
// FASE XIII: CENTRO DE DOCUMENTACIÓN TÉCNICA Y BOLETINES DE SERVICIO (TSB)
// =========================================================================
export type TechDocType = 
  | 'operator_manual' 
  | 'parts_catalog' 
  | 'workshop_manual' 
  | 'tsb_bulletin' 
  | 'hydraulic_schematic' 
  | 'electrical_diagram';

export interface TechnicalDocument {
  id: string;
  title: string;
  docType: TechDocType;
  brand: string;
  modelCode: string;
  codeRef: string;
  fileSizeBytes: string;
  publishDate: string;
  language: 'Español' | 'English' | 'Bilingüe';
  summary: string;
  downloadCount: number;
  isProOnly: boolean;
}

// =========================================================================
// FASE XIV: ACADEMIA DE OPERADORES Y CERTIFICACIÓN TÉCNICA TMD
// =========================================================================
export interface AcademyCourse {
  id: string;
  code: string;
  title: string;
  category: 'Operación Segura' | 'Mantenimiento Preventivo' | 'Diagnóstico Hidráulico' | 'Eficiencia Eco-Drive';
  targetMachinery: string;
  durationHours: number;
  modality: 'Presencial Km 22' | 'In-Situ en Cantera / Obra' | 'Teórico-Práctico';
  level: 'Nivel I (Básico)' | 'Nivel II (Intermedio)' | 'Nivel Máster (Avanzado)';
  priceUsd: number;
  description: string;
  syllabus: string[];
  nextSchedule: string;
  seatsAvailable: number;
}

export interface CertifiedOperatorBadge {
  id: string;
  licenseNumber: string; // e.g. "TMD-OP-8924"
  operatorName: string;
  cedula: string;
  company: string;
  photoUrl: string;
  approvedMachines: string[];
  certificationLevel: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expiring_soon' | 'expired';
}

// =========================================================================
// FASE XV: REMAN & PROGRAMA DE INTERCAMBIO DE CASCOS (CORE EXCHANGE)
// =========================================================================
export interface RemanComponent {
  id: string;
  sku: string;
  name: string;
  category: 'Motores Diésel' | 'Bombas Hidráulicas' | 'Transmisiones' | 'Turbocargadores' | 'Cilindros Hidráulicos' | 'Motores de Giro' | 'Mandos Finales' | string;
  brand: 'JCB' | 'Cummins' | 'Kawasaki' | 'Carraro' | 'Holset' | 'ZF' | 'Rexroth' | 'Nabtesco' | string;
  compatibleMachines: string[];
  priceRemanUsd: number;
  coreCreditUsd: number; // Reembolso por entrega de casco usado
  netPriceUsd: number;
  warrantyMonths: number;
  dynoCertified: boolean;
  dynoTestReportRef: string;
  leadTimeDays: number;
  stockQty: number;
  image: string;
  description: string;
}

// =========================================================================
// FASE XVI: TRADE-IN Y MERCADO DE USADOS CERTIFICADOS TMD (150 PUNTOS)
// =========================================================================
export interface UsedMachineListing {
  id: string;
  slug: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  hours: number;
  serialNumberMasked: string;
  priceUsd: number;
  certifiedInspectionScore: number; // 0 - 100%
  inspectionReportDocRef: string;
  warrantyMonths: number;
  location: string;
  status: 'available' | 'reserved' | 'sold';
  features: string[];
  imageUrl: string;
  cabinType: string;
  undercarriageConditionPercent: number;
}

// =========================================================================
// FASE XVII: CALCULADORA DE TCO (COSTO TOTAL DE PROPIEDAD) & COMBUSTIBLE
// =========================================================================
export interface TcoMachineProfile {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  initialPriceUsd: number;
  fuelBurnGalPerHour: number; // Galones por hora diésel
  maintenanceCostPerHourUsd: number;
  undercarriageTireCostPerHourUsd: number;
  residualValue5YrsPercent: number;
}

export interface TcoComparisonResult {
  machineName: string;
  annualHours: number;
  years: number;
  totalFuelCostUsd: number;
  totalMaintenanceCostUsd: number;
  totalTireTrackCostUsd: number;
  depreciationCostUsd: number;
  totalTcoUsd: number;
  costPerHourUsd: number;
}

// =========================================================================
// FASE XVIII: PÓLIZAS DE SERVICIO Y CONTRATOS DE MANTENIMIENTO PMA / CVA
// =========================================================================
export interface PmaPlanTier {
  id: string;
  name: string;
  badge: string;
  targetFleetSize: string;
  pricePerOperatingHourUsd: number;
  includedServices: string[];
  fluidAnalysisIncluded: boolean;
  emergencyResponseSlaHours: number;
  discountOnPartsPercent: number;
  telematicsMonitoringIncluded: boolean;
  color: string;
}

// =========================================================================
// FASE XIX: CENTRO DE MANDO DE EMERGENCIAS Y TALLERES MÓVILES 24/7
// =========================================================================
export interface EmergencyServiceTruck {
  id: string;
  unitCode: string; // e.g. "TMD-MOBILE-04"
  baseLocation: 'Km 22 Duarte (Central)' | 'Santiago / Cibao' | 'Punta Cana / Este' | 'Barahona / Sur';
  driverTechnician: string;
  specialty: 'Diagnóstico Hidráulico & Eléctrico' | 'Mecánica Pesada & Motores' | 'Soldadura & Orugas en Campo';
  currentStatus: 'available' | 'en_route' | 'on_site' | 'standby';
  currentLat: number;
  currentLng: number;
  equippedWithCrane: boolean;
  onboardOilRecoverySystem: boolean;
}

export interface EmergencyTicket {
  id: string;
  ticketNumber: string;
  clientName: string;
  phone: string;
  locationAddress: string;
  zone: 'Santo Domingo' | 'Cibao' | 'Este' | 'Sur' | 'Noroeste';
  machineModel: string;
  faultDescription: string;
  severity: 'URGENTE_PARADA' | 'ALERTA_OPERATIVA' | 'MANTENIMIENTO_URGENTE';
  status: 'recibido' | 'asignado' | 'en_camino' | 'en_sitio' | 'resuelto';
  assignedUnitCode?: string;
  createdAt: string;
  estimatedArrivalMin: number;
}

// =========================================================================
// FASE XX: CALCULADORA DE HUELLA DE CARBONO Y ECO-EFICIENCIA MIMARENA
// =========================================================================
export interface EcoFleetMachineInput {
  id: string;
  model: string;
  tierStandard: 'Tier 2' | 'Tier 3' | 'Tier 4 Final' | 'Stage V' | 'Eléctrico';
  annualHours: number;
  fuelBurnRateGalHr: number;
}

export interface CarbonFootprintReport {
  totalAnnualFuelGallons: number;
  totalCo2EmissionsTons: number;
  ecoSavingsVersusOldGenTons: number;
  treesToOffset: number;
  mimarenaComplianceScore: 'Excelente (Clase A)' | 'Cumple (Clase B)' | 'Requiere Renovación';
}// =========================================================================
// FASE XX.2: SISTEMA DE AUDITORÍA DE ACCIONES ADMINISTRATIVAS INMUTABLES
// =========================================================================
export type AdminAuditActionType = 
  | 'INVENTORY_STOCK_UPDATE'
  | 'PRICE_UPDATE'
  | 'BULK_IMPORT'
  | 'MACHINE_CREATED'
  | 'MACHINE_DELETED'
  | 'PART_CREATED'
  | 'PART_DELETED'
  | 'USER_ROLE_PROMOTION'
  | 'QUOTE_STATUS_OVERRIDE'
  | 'SECURITY_ALERT';

export type AuditTargetCollection = 
  | 'inventory_machines'
  | 'inventory_parts'
  | 'maquinaria'
  | 'repuestos'
  | 'users'
  | 'quotes'
  | 'orders'
  | 'bulk_batch';

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  actorUid: string;
  actorEmail: string;
  actorName: string;
  actorRole: 'admin' | 'staff' | 'system';
  actionType: AdminAuditActionType;
  targetEntity: AuditTargetCollection;
  targetId: string;
  targetName: string;
  previousValue?: string | Record<string, any>;
  newValue?: string | Record<string, any>;
  diffSummary?: string;
  details: string;
  ipAddress?: string;
  location?: string;
  status: 'SUCCESS' | 'FLAGGED' | 'WARNING';
  immutable: boolean;
  checksum?: string;
}

// =========================================================================
// BITÁCORA DE ESCANEOS QR DE INVENTARIO (INVENTORY_LOGS)
// =========================================================================
export interface ScanLocationMetadata {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  altitude?: number | null;
  zoneName: string;
  facility: string;
  address: string;
  source: 'gps' | 'manual_zone' | 'facility_default';
}

export interface InventoryScanLog {
  id: string;
  scannedAt: string; // ISO 8601 string
  timestamp: number; // Unix ms
  staffUid: string;
  staffEmail: string;
  staffName: string;
  staffRole: 'staff' | 'admin';
  itemType: 'machinery' | 'part';
  itemId: string;
  itemName: string;
  itemBrand: string;
  itemCode: string;
  rawCode: string;
  scanMethod: 'camera' | 'upload' | 'manual';
  location: ScanLocationMetadata;
  deviceInfo?: {
    userAgent: string;
    platform: string;
  };
  notes?: string;
  status?: 'verified' | 'inspected' | 'flagged' | 'pending';
  synced: boolean;
  createdAt: string;
}

// =========================================================================
// FASE 15.2: CALENDARIO INTERACTIVO Y DISPONIBILIDAD PATIO KM 22
// =========================================================================
export type PatioBookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rescheduled';

export type PatioTrackZone = 
  | 'pista_1_excavacion'
  | 'pista_2_rampa'
  | 'pista_3_confinado'
  | 'pista_4_velocidad'
  | 'pista_5_agricola';

export interface PatioTimeSlotInfo {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  period: 'mañana' | 'tarde';
}

export interface PatioTestDriveBooking {
  id: string;
  machineId: string;
  machineName: string;
  machineBrand: string;
  machineCategory: string;
  machineModel: string;
  machineImage?: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // "08:30 AM - 10:00 AM"
  timeSlotId: string; // "slot_0830"
  status: PatioBookingStatus;
  operatorName: string;
  companyName?: string;
  clientEmail: string;
  phone: string;
  licenseCategory: string;
  testFocus: string;
  trackZone: PatioTrackZone;
  trackZoneName: string;
  instructorRequested: boolean;
  assignedInstructor: string;
  assignedInstructorPhone?: string;
  telemetryRequired: boolean;
  safetyEquipmentConfirmed: boolean;
  qrAccessPass: string;
  clientNotes?: string;
  staffNotes?: string;
  machineOperatingHours?: number;
  fuelLevelPercent?: number;
  clientId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatioMachineAvailability {
  id: string; // machineId
  machineId: string;
  machineName: string;
  machineBrand: string;
  machineCategory: string;
  isAvailable: boolean;
  currentStatus: 'disponible' | 'en_pista' | 'mantenimiento' | 'reservado_vip';
  currentTrackZone?: string;
  nextAvailableSlot?: string;
  blockedDates?: string[];
  blockedSlots?: { date: string; slotId: string; reason: string }[];
  totalCompletedDemos: number;
  instructorLead: string;
  fuelLevel: number;
  operatingHours: number;
  lastInspectionDate: string;
  updatedAt: string;
}

// =========================================================================
// TRACTOR SALES CATALOG & CRM LEADS (FIRESTORE SCHEMA)
// Collections: /machinery_listings, /specifications, /sales_leads
// =========================================================================

export type MachineryListingStatus = 'available' | 'reserved' | 'sold' | 'in_transit' | 'patio_demo';

export interface MachineryListing {
  id: string;
  listingCode: string; // e.g. "TMD-EQ-2026-001"
  brand: 'LiuGong' | 'JCB' | 'LS Tractor' | 'Kubota' | 'Yanmar' | 'Ammann' | 'Imer' | string;
  model: string;
  year: number;
  category: 'excavadoras' | 'cargadores' | 'retroexcavadoras' | 'tractores_agricolas' | 'compactadores' | 'manipuladores' | 'minicargadores';
  commercialTitle: string;
  description: string;
  status: MachineryListingStatus;
  condition: 'brand_new' | 'certified_used' | 'reman';
  basePriceUsd: number;
  promotionalPriceUsd?: number;
  downPaymentPercent: number; // e.g. 20%
  stockLocation: 'Patio Km 22 Autopista Duarte' | 'Almacén Santiago' | 'En Tránsito Marítimo';
  serialNumberOrVin?: string;
  operatingHours: number;
  warrantyPeriodMonths: number; // e.g. 24 months
  warrantyHours: number; // e.g. 4000 hours
  deliveryTimelineDays: number; // e.g. 1-3 days
  specId: string; // Ref to /specifications/{specId}
  heroImage: string;
  galleryImages: string[];
  telematicsReady: boolean;
  telematicsProvider?: 'JCB LiveLink' | 'KubotaNOW' | 'Generic AEMP';
  featured: boolean;
  published: boolean;
  inquiriesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MachinerySpecification {
  id: string; // matches specId or listingId
  listingId: string;
  engine: {
    make: string;
    model: string;
    ratedPowerHp: number;
    ratedRpm: number;
    displacementLiters: number;
    cylinders: number;
    aspiration: 'Turbocharged Intercooled' | 'Naturally Aspirated';
    emissionStandard: 'Tier 3' | 'Tier 4 Final' | 'Stage V';
  };
  hydraulics: {
    systemType: 'Load Sensing' | 'Open Center' | 'Closed Center';
    mainPumpType: string;
    maxFlowLpm: number;
    reliefPressureBar: number;
  };
  transmission: {
    type: 'Powershift' | 'Hydrostatic' | 'KVT CVT' | 'Synchro Shuttle';
    forwardGears: number;
    reverseGears: number;
    maxSpeedKmh: number;
  };
  dimensionsAndWeight: {
    operatingWeightKg: number;
    overallLengthMm: number;
    overallWidthMm: number;
    overallHeightMm: number;
    groundClearanceMm: number;
    bucketCapacityM3?: number;
    diggingDepthMm?: number;
    dumpHeightMm?: number;
  };
  capacitiesLiters: {
    fuelTank: number;
    hydraulicTank: number;
    engineOil: number;
    coolant: number;
    defTank?: number;
  };
  standardEquipment: string[];
  optionalPackages: string[];
  updatedAt: string;
}

export type SalesLeadStatus = 'new' | 'contacted' | 'quote_sent' | 'demo_scheduled' | 'negotiating' | 'won' | 'lost';

export interface MachinerySalesLead {
  id: string;
  listingId: string;
  machineTitle: string;
  machineBrand: string;
  machineModel: string;
  estimatedPriceUsd: number;
  customerName: string;
  companyName?: string;
  email: string;
  phone: string;
  province: string;
  preferredContactMethod: 'whatsapp' | 'phone' | 'email';
  acquisitionType: 'cash_purchase' | 'bank_financing' | 'operating_lease' | 'trade_in';
  preferredBank?: 'Banco Popular Dominicano' | 'BHD León' | 'Banco Agrícola' | 'Banreservas' | 'Propio TMD';
  hasTradeIn: boolean;
  tradeInDetails?: {
    brand: string;
    model: string;
    year: number;
    estimatedValueUsd?: number;
  };
  urgency: 'immediate' | '15_to_30_days' | '1_to_3_months' | 'budget_planning';
  status: SalesLeadStatus;
  assignedSalesRepName?: string;
  assignedSalesRepEmail?: string;
  notes?: string;
  source: 'web_listing' | 'machine_detail_modal' | 'qr_flyer' | 'patio_km22';
  createdAt: string;
  updatedAt: string;
}

// =========================================================================
// FULLBAY CONNECT CLIENT API TYPES
// =========================================================================

export interface FullbayEquipment {
  id: string;
  customerId: string;
  unitVin: string;
  unitFicha: string;
  make: string;
  model: string;
  year: number;
  licensePlate?: string;
  meterType: 'HOURS' | 'MILES';
  currentMeterReading: number;
  status: 'ACTIVE' | 'IN_SHOP' | 'INACTIVE';
  lastServiceDate?: string;
  nextServiceMeterReading?: number;
  telematicsVinMatch?: string;
}

export interface FullbayActiveRepairOrder {
  orderId: string;
  fullbayOrderNumber: string;
  customerId: string;
  customerName: string;
  unitFicha: string;
  unitVin: string;
  unitModel: string;
  status: 'in_queue' | 'diagnostic' | 'waiting_on_parts' | 'in_progress' | 'ready_for_review' | 'completed';
  assignedTechnician: {
    id: string;
    name: string;
  };
  serviceLocation: 'Shop Km 22' | 'Mobile Field Truck #01' | 'Mobile Field Truck #03';
  complaintSummary: string;
  laborHoursTracked: number;
  laborRateUsd: number;
  totalLaborUsd: number;
  allocatedPartsCount: number;
  totalPartsUsd: number;
  totalEstimatedAmountUsd: number;
  digitalApprovalStatus: 'pending' | 'approved' | 'rejected';
  digitalApprovedAt?: string;
  openedAt: string;
  updatedAt: string;
}

export interface FullbayInventoryPart {
  partId: string;
  partNumber: string;
  description: string;
  oemBrand: string;
  category: string;
  quantityOnHand: number;
  quantityAllocated: number;
  quantityAvailable: number;
  binLocation: string;
  unitCostUsd: number;
  retailPriceUsd: number;
  reorderPoint: number;
  isOemOriginal: boolean;
  warehouseCode: string;
}

export interface FullbayServiceRequestPayload {
  customerId: string;
  customerName: string;
  customerPhone: string;
  unitVin: string;
  unitFicha: string;
  currentHorometer: number;
  priority: 'routine' | 'urgent' | 'emergency';
  complaint: string;
  locationDetails: string;
  livelinkFaultRef?: string;
}




