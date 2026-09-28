import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  HardHat, 
  Wrench, 
  ShieldCheck, 
  Calculator, 
  Calendar, 
  FileText, 
  Truck, 
  Check, 
  Plus, 
  RotateCw, 
  QrCode, 
  Layers, 
  Zap, 
  DollarSign, 
  Gauge, 
  Activity, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Sparkles,
  Phone,
  CheckCircle2,
  AlertCircle,
  Download,
  Printer,
  BookOpen,
  Crosshair,
  ClipboardList,
  FileStack,
  Fuel
} from 'lucide-react';
import { Machine, MachineCustomizationOption } from '../../types';
import { useCart } from '../../context/CartContext';
import { USD_TO_DOP_RATE } from '../../data/catalog';
import { LastScannedBadge } from '../common/LastScannedBadge';
import { RecentlyVerifiedBadge } from '../common/RecentlyVerifiedBadge';
import { InventoryAuditTrail } from '../common/InventoryAuditTrail';
import { InventoryLabelPdfModal } from '../common/InventoryLabelPdfModal';
import { downloadProductQrCode } from '../../utils/qrExporter';
import { TractorSalesInquiryModal } from './TractorSalesInquiryModal';
import { generateSingleMachineSpecPdf } from '../../services/catalogPdfExport';
import { InteractiveMachineryFinancing } from '../common/InteractiveMachineryFinancing';
import { getMachinePdfUrls } from '../../data/machinePdfsData';
import { CinematicZoomViewer } from '../common/CinematicZoomViewer';
import { LowboyFreightCalculator } from '../calculator/LowboyFreightCalculator';
import { AvailabilityBadge } from '../common/AvailabilityBadge';
import { PdiInspectionModal } from '../inspection/PdiInspectionModal';
import { MachineFluidsGuideModal } from '../fluids/MachineFluidsGuideModal';
import { GatePassModal } from '../logistics/GatePassModal';
import { OemVsAftermarketMatrix } from '../parts/OemVsAftermarketMatrix';
import { TenderDossierExporterModal } from '../catalog/TenderDossierExporterModal';

interface MachineDetailStudioModalProps {
  machine: Machine | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
  onOpen360?: (machine: Machine) => void;
  onOpenQr?: (machine: Machine) => void;
}

type DetailTab = 'specs' | 'attachments' | 'maintenance' | 'financing' | 'delivery' | 'audit';

interface AttachmentItem {
  id: string;
  name: string;
  category: string;
  priceUsd: number;
  description: string;
  leadTime: string;
  compatibleCategories?: string[];
  recommended?: boolean;
}

const AVAILABLE_OEM_ATTACHMENTS: AttachmentItem[] = [
  {
    id: 'att-hammer',
    name: 'Martillo Hidráulico Soosan / JCB Heavy Duty',
    category: 'Demolición & Fractura',
    priceUsd: 6800,
    description: 'Martillo rompedor de alto impacto con amortiguación de nitrógeno y mangueras blindadas.',
    leadTime: 'Stock Km 22',
    compatibleCategories: ['Excavadoras', 'Retroexcavadoras', 'Minicargadores'],
    recommended: true
  },
  {
    id: 'att-quick-coupler',
    name: 'Acople Rápido Hidráulico Automático (Quick Hitch)',
    category: 'Eficiencia Operativa',
    priceUsd: 1950,
    description: 'Permite intercambiar baldes e implementos desde la cabina en menos de 30 segundos.',
    leadTime: 'Stock Km 22',
    compatibleCategories: ['Excavadoras', 'Retroexcavadoras', 'Minicargadores'],
    recommended: true
  },
  {
    id: 'att-trench-bucket',
    name: 'Cucharón de Zanja Angosto (12" / 300mm)',
    category: 'Excavación Especializada',
    priceUsd: 1200,
    description: 'Balde de zanja reforzado con dientes tipo tigre para canalizaciones eléctricas y de agua.',
    leadTime: 'Stock Km 22',
    compatibleCategories: ['Excavadoras', 'Retroexcavadoras']
  },
  {
    id: 'att-clean-bucket',
    name: 'Cucharón de Limpieza & Talud Inclinable (60" / 1500mm)',
    category: 'Nivelación & Talud',
    priceUsd: 2400,
    description: 'Balde ancho con cilindros basculantes para perfilar cunetas y acabados de precisión.',
    leadTime: '3-5 días',
    compatibleCategories: ['Excavadoras', 'Retroexcavadoras']
  },
  {
    id: 'att-ripper',
    name: 'Escarificador Monodiente (Ripper Tooth Heavy Duty)',
    category: 'Roca & Coralina',
    priceUsd: 1750,
    description: 'Diente de penetración extrema para fracturar roca coralina dominicana y asfalto.',
    leadTime: 'Stock Km 22',
    compatibleCategories: ['Excavadoras', 'Retroexcavadoras']
  },
  {
    id: 'att-telematics-livelink',
    name: 'Módulo Telemático LiveLink™ 4G Pro con Geocerca',
    category: 'Monitoreo & Seguridad',
    priceUsd: 650,
    description: 'Rastreo satelital, horómetro digital, alertas de combustible y diagnóstico de fallas remoto.',
    leadTime: 'Instalación Inmediata',
    recommended: true
  },
  {
    id: 'att-extra-hydraulics',
    name: 'Líneas Hidráulicas Auxiliares de Doble Efecto',
    category: 'Instalación Hidráulica',
    priceUsd: 1450,
    description: 'Circuito hidráulico bidireccional de alto flujo para martillo, cizalla y barrena.',
    leadTime: 'Taller Km 22'
  },
  {
    id: 'att-tropical-ac',
    name: 'Kit de Climatización Tropical Plus (Heavy Dust Filter)',
    category: 'Confort Cabina',
    priceUsd: 1100,
    description: 'Presurización de cabina con filtro ciclónico para canteras de alta polución y calor.',
    leadTime: 'Stock Km 22'
  }
];

export const MachineDetailStudioModal: React.FC<MachineDetailStudioModalProps> = ({
  machine,
  isOpen,
  onClose,
  onNavigate,
  onOpen360,
  onOpenQr
}) => {
  const { addMachineToQuote, formatPrice, currency } = useCart();
  const [activeTab, setActiveTab] = useState<DetailTab>('specs');
  const [selectedAttachmentIds, setSelectedAttachmentIds] = useState<string[]>([]);
  
  // Financing state
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [loanTermMonths, setLoanTermMonths] = useState<number>(48);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(8.5);

  // Delivery quote state
  const [selectedProvince, setSelectedProvince] = useState<string>('Santo Domingo');
  const [testDriveBooked, setTestDriveBooked] = useState<boolean>(false);
  const [isExportingQr, setIsExportingQr] = useState<boolean>(false);
  const [isExportingBankPdf, setIsExportingBankPdf] = useState<boolean>(false);
  const [isLabelPdfModalOpen, setIsLabelPdfModalOpen] = useState<boolean>(false);
  const [isSalesInquiryModalOpen, setIsSalesInquiryModalOpen] = useState<boolean>(false);
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);
  const [isPdiOpen, setIsPdiOpen] = useState<boolean>(false);
  const [isFluidsOpen, setIsFluidsOpen] = useState<boolean>(false);
  const [isGatePassOpen, setIsGatePassOpen] = useState<boolean>(false);
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);

  // Accordion visibility states for secondary technical details (compacts mobile & desktop viewports)
  const [isExtendedSpecsExpanded, setIsExtendedSpecsExpanded] = useState<boolean>(true);
  const [isApplicationsExpanded, setIsApplicationsExpanded] = useState<boolean>(true);
  const [isScheduleExpanded, setIsScheduleExpanded] = useState<boolean>(false);

  // Calculate pricing with attachments
  const attachmentsCostUsd = selectedAttachmentIds.reduce((sum, id) => {
    const found = AVAILABLE_OEM_ATTACHMENTS.find(a => a.id === id);
    return sum + (found ? found.priceUsd : 0);
  }, 0);

  const totalInvestmentUsd = (machine?.basePriceUsd || 0) + attachmentsCostUsd;
  const machinePdfInfo = machine ? getMachinePdfUrls(machine.id) : null;

  const whatsappQuoteUrl = useMemo(() => {
    if (!machine) return '';
    const attachmentsText = selectedAttachmentIds.length > 0 
      ? `%0A• Implementos:%20${selectedAttachmentIds.length}%20seleccionados` 
      : '';
    const message = `Hola%20TMD%20Dominicana,%20solicito%20cotización%20inmediata%20del%20equipo:%0A•%20Modelo:%20${encodeURIComponent(machine.name)}%20(${encodeURIComponent(machine.brand)})%0A•%20Código:%20${encodeURIComponent(machine.modelCode || machine.id)}%0A•%20Inversión%20Estimada:%20$${totalInvestmentUsd.toLocaleString()}%20USD${attachmentsText}%0A•%20Destino:%20${encodeURIComponent(selectedProvince)}`;
    return `https://wa.me/18095601234?text=${message}`;
  }, [machine, selectedAttachmentIds, totalInvestmentUsd, selectedProvince]);

  if (!isOpen || !machine || typeof document === 'undefined') return null;

  // Filter attachments compatible with this machine category
  const relevantAttachments = AVAILABLE_OEM_ATTACHMENTS.filter(att => 
    !att.compatibleCategories || att.compatibleCategories.includes(machine.category)
  );

  const toggleAttachment = (id: string) => {
    setSelectedAttachmentIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Formatting helpers
  const formatMoney = (usdAmount: number) => {
    if (currency === 'DOP') {
      const dop = Math.round(usdAmount * USD_TO_DOP_RATE);
      return `RD$ ${dop.toLocaleString('es-DO')}`;
    }
    return `$${usdAmount.toLocaleString('en-US')} USD`;
  };

  // Monthly leasing calculation
  const downPaymentAmount = totalInvestmentUsd * (downPaymentPercent / 100);
  const amountToFinance = totalInvestmentUsd - downPaymentAmount;
  const monthlyRate = (annualInterestRate / 100) / 12;
  const monthlyPaymentUsd = (amountToFinance * monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths)) / 
    (Math.pow(1 + monthlyRate, loanTermMonths) - 1);

  const handleDownloadBankProformaPdf = async () => {
    if (!machine) return;
    setIsExportingBankPdf(true);
    try {
      await new Promise(r => setTimeout(r, 120));
      const chosenAttachments = selectedAttachmentIds.map(id => {
        const item = AVAILABLE_OEM_ATTACHMENTS.find(a => a.id === id)!;
        return { name: item.name, priceUsd: item.priceUsd };
      });

      const pdf = generateSingleMachineSpecPdf({
        machine,
        clientName: 'Cliente Comercial / Contratista',
        companyName: 'Empresa Dominicana S.R.L.',
        targetBank: 'Banco Popular Dominicano / BHD León / Bagrícola',
        selectedAttachments: chosenAttachments,
        downPaymentPercent,
        loanTermMonths,
        annualInterestRate
      });

      const safeName = `${machine.brand}_${machine.name}`.replace(/[^a-zA-Z0-9-_]/g, '_');
      pdf.save(`Proforma_Bancaria_TMD_${safeName}.pdf`);
    } catch (err) {
      console.error('Error generating single machine bank proforma:', err);
    } finally {
      setIsExportingBankPdf(false);
    }
  };

  const handleAddToQuoteWithCustomizations = () => {
    const selectedCustomizations: MachineCustomizationOption[] = selectedAttachmentIds.map(id => {
      const item = AVAILABLE_OEM_ATTACHMENTS.find(a => a.id === id)!;
      return {
        id: item.id,
        name: item.name,
        category: 'attachments',
        categoryLabel: item.category,
        description: item.description,
        minPriceUsd: item.priceUsd,
        maxPriceUsd: item.priceUsd
      };
    });

    addMachineToQuote(
      machine, 
      true, 
      selectedCustomizations, 
      { minUsd: totalInvestmentUsd, maxUsd: totalInvestmentUsd }
    );

    onClose();
    onNavigate('#/checkout');
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-zinc-900 rounded-[5px] shadow-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[92vh] font-mono">
        
        {/* ============================================================ */}
        {/* TOP HERO MEDIA BAR                                          */}
        {/* ============================================================ */}
        <div className="relative h-56 sm:h-64 bg-zinc-950 shrink-0 overflow-hidden">
          <img
            src={machine.image}
            alt={machine.name}
            className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-700"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('tmd_coming_soon')) {
                target.src = '/images/tmd_coming_soon.jpg';
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
          
          {/* Top Control Buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {/* Cinematic Inspection Zoom Lens Button (Task #12) */}
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              className="px-2.5 py-1 rounded-[2px] bg-zinc-950/90 hover:bg-amber-400 hover:text-black text-amber-400 border border-amber-400/40 text-xs font-bold uppercase transition-all flex items-center gap-1.5 shadow-md cursor-pointer backdrop-blur-md"
              title="Abrir lente cinematográfica de inspección de zapatas, cabina y motor"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Zoom Inspección</span>
            </button>

            {/* Public Tenders Dossier Exporter (Task #74) */}
            <button
              type="button"
              onClick={() => setIsDossierOpen(true)}
              className="px-2.5 py-1 rounded-[2px] bg-zinc-950/90 hover:bg-amber-400 hover:text-black text-amber-400 border border-amber-400/40 text-xs font-bold uppercase transition-all flex items-center gap-1.5 shadow-md cursor-pointer backdrop-blur-md"
              title="Generar Dossier Técnico consolidado para Licitaciones Públicas del Estado Dominicano"
            >
              <FileStack className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dossier Licitación</span>
            </button>

            {onOpen360 && (
              <button
                type="button"
                onClick={() => onOpen360(machine)}
                className="px-2.5 py-1 rounded-[2px] bg-zinc-950/90 hover:bg-amber-400 hover:text-black text-amber-400 border border-amber-400/40 text-xs font-bold uppercase transition-all flex items-center gap-1.5 shadow-md cursor-pointer backdrop-blur-md"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>360° / Video</span>
              </button>
            )}

            {/* Printable PDF Label Sheet Button (Mass Inventory Labeling) */}
            <button
              type="button"
              onClick={() => setIsLabelPdfModalOpen(true)}
              className="px-2.5 py-1 rounded-[2px] bg-zinc-950/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-bold uppercase transition-all flex items-center gap-1.5 shadow-md cursor-pointer backdrop-blur-md"
              title="Generar pliego PDF imprimible con código interno y código QR para etiquetado masivo de almacén"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Rótulos</span>
            </button>

            {/* Direct Official Factory Brochure PDF Download */}
            {machinePdfInfo?.brochurePdfUrl && (
              <a
                href={machinePdfInfo.brochurePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={machinePdfInfo.brochureFileName}
                className="px-2.5 py-1 rounded-[2px] bg-zinc-950/90 hover:bg-amber-400 hover:text-black text-amber-400 border border-amber-400/50 text-xs font-bold uppercase transition-all flex items-center gap-1.5 shadow-md cursor-pointer backdrop-blur-md"
                title="Descargar Catálogo Oficial del Fabricante en PDF de alta resolución"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Catálogo Fábrica</span>
              </a>
            )}

            {/* Direct Official Bank Spec Sheet / Proforma PDF Download */}
            <button
              type="button"
              onClick={handleDownloadBankProformaPdf}
              disabled={isExportingBankPdf}
              className="px-2.5 py-1 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black border border-amber-400 text-xs font-black uppercase transition-all flex items-center gap-1.5 shadow-md cursor-pointer backdrop-blur-md disabled:opacity-50"
              title="Descargar Ficha Técnica Homologada para Banco (Popular, BHD, Bagrícola) en PDF"
            >
              <Download className={`w-3.5 h-3.5 ${isExportingBankPdf ? 'animate-bounce' : ''}`} />
              <span>{isExportingBankPdf ? 'Generando PDF...' : 'Ficha PDF Banco'}</span>
            </button>

            {/* Quick Export QR Code Button for Physical Warehouse Labeling */}
            <button
              type="button"
              onClick={async () => {
                setIsExportingQr(true);
                try {
                  await downloadProductQrCode(machine, 'machinery');
                } catch (err) {
                  console.error('Error exporting QR:', err);
                } finally {
                  setIsExportingQr(false);
                }
              }}
              disabled={isExportingQr}
              className="px-2.5 py-1 rounded-[2px] bg-zinc-950/90 hover:bg-amber-400 hover:text-black text-amber-400 border border-amber-400/40 text-xs font-bold uppercase transition-all flex items-center gap-1.5 shadow-md cursor-pointer backdrop-blur-md"
              title="Descargar Rótulo QR individual para etiquetado físico en patio o almacén"
            >
              <Download className={`w-3.5 h-3.5 ${isExportingQr ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline">Exportar QR</span>
            </button>

            {onOpenQr && (
              <button
                type="button"
                onClick={() => onOpenQr(machine)}
                className="p-1.5 rounded-[2px] bg-zinc-950/90 hover:bg-amber-400 hover:text-black text-zinc-300 border border-zinc-800 transition-all cursor-pointer shadow-md backdrop-blur-md"
                title="Generar QR de Patio"
              >
                <QrCode className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-[2px] bg-zinc-950/90 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer shadow-md backdrop-blur-md border border-zinc-800"
              aria-label="Cerrar Ficha Técnica"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Title & Badges */}
          <div className="absolute bottom-4 left-5 right-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-[2px] bg-amber-400 text-black text-[10px] font-bold uppercase tracking-wider shadow-xs">
                  {machine.brand}
                </span>
                <span className="px-2 py-0.5 rounded-[2px] bg-zinc-900/90 text-zinc-200 text-[10px] font-bold uppercase border border-zinc-800 backdrop-blur-md">
                  {machine.category} • Mod. {machine.modelCode}
                </span>
                <AvailabilityBadge
                  status={machine.inStock ? 'immediate' : (machine.year >= 2025 ? 'transit' : 'factory_order')}
                  variant="pill"
                />
                {/* Recently Verified Status Indicator */}
                <RecentlyVerifiedBadge
                  itemId={machine.id}
                  itemCode={machine.modelCode}
                  itemType="machinery"
                  variant="pill"
                />
                {/* Last Scanned Status Badge */}
                <LastScannedBadge
                  itemId={machine.id}
                  itemCode={machine.modelCode}
                  itemType="machinery"
                  compact={true}
                  showEmptyState={false}
                />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white uppercase tracking-tight">
                {machine.name}
              </h2>
            </div>

            {/* Quick Price Indicator */}
            <div className="text-left sm:text-right bg-zinc-950/90 p-2.5 px-3.5 rounded-[2px] border border-zinc-800 backdrop-blur-md">
              <span className="text-[10px] text-zinc-400 block uppercase font-bold">Inversión Base Estimada:</span>
              <span className="text-base sm:text-lg font-bold text-amber-400 font-mono">
                {formatMoney(machine.basePriceUsd)}
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* STUDIO NAVIGATION TABS                                       */}
        {/* ============================================================ */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-2.5 border-b border-zinc-800 bg-zinc-950 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`px-3.5 py-2 text-xs font-bold rounded-[2px] uppercase transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'specs'
                ? 'bg-amber-400 text-black shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Ficha & Rendimiento</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('attachments')}
            className={`px-3.5 py-2 text-xs font-bold rounded-[2px] uppercase transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'attachments'
                ? 'bg-amber-400 text-black shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Implementos OEM</span>
            {selectedAttachmentIds.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-[1px] bg-zinc-900 text-amber-400 text-[10px] font-bold">
                +{selectedAttachmentIds.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('financing')}
            className={`px-3.5 py-2 text-xs font-bold rounded-[2px] uppercase transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'financing'
                ? 'bg-amber-400 text-black shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Leasing & Cuotas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('maintenance')}
            className={`px-3.5 py-2 text-xs font-bold rounded-[2px] uppercase transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'maintenance'
                ? 'bg-amber-400 text-black shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Garantía & Servicios TMD</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('delivery')}
            className={`px-3.5 py-2 text-xs font-bold rounded-[2px] uppercase transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'delivery'
                ? 'bg-amber-400 text-black shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Entrega & Demo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2 text-xs font-bold rounded-[2px] uppercase transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-amber-400 text-black shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Audit Trail (Últimos 3)</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB CONTENTS                                                 */}
        {/* ============================================================ */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: SPECS & PERFORMANCE */}
          {activeTab === 'specs' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Recently Verified Real-Time Banner (<24h) */}
              <RecentlyVerifiedBadge
                itemId={machine.id}
                itemCode={machine.modelCode}
                itemType="machinery"
                variant="detail-banner"
              />

              {/* Last Scanned Detailed Inventory Audit Card */}
              <LastScannedBadge
                itemId={machine.id}
                itemCode={machine.modelCode}
                itemType="machinery"
                showDetailsAccordion={true}
                showEmptyState={true}
              />

              {/* Audit Trail Section - Last 3 Scans from inventory_logs */}
              <div className="pt-2">
                <InventoryAuditTrail
                  itemId={machine.id}
                  itemCode={machine.modelCode}
                  itemName={machine.name}
                  itemType="machinery"
                  maxEvents={3}
                />
              </div>

              <div className="p-3 bg-zinc-950 rounded-[2px] border border-zinc-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                  Descripción y Respaldo Técnico
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {machine.description}
                </p>
              </div>

              {/* Official Technical Documentation Card (Real Local Verified PDFs) */}
              {machinePdfInfo && (
                <div className="p-3 bg-zinc-950 rounded-[2px] border border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-transparent">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Documentación Técnica Oficial (PDF Verificado)</span>
                    </h4>
                    <span className="text-[10px] text-zinc-500 font-mono">TMD KM 22 • ARCHIVO TÉCNICO</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mb-3">
                    Fichas técnicas de taller homologadas con tolerancias mecánicas y folletos oficiales del fabricante listos para descargar o imprimir.
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {machinePdfInfo.fichaPdfUrl && (
                      <a
                        href={machinePdfInfo.fichaPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={machinePdfInfo.fichaFileName}
                        className="px-3 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        title="Descargar Ficha Técnica de Taller en PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Ficha Técnica Oficial (.PDF)</span>
                      </a>
                    )}
                    {machinePdfInfo.brochurePdfUrl && (
                      <a
                        href={machinePdfInfo.brochurePdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={machinePdfInfo.brochureFileName}
                        className="px-3 py-1.5 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 font-bold text-xs uppercase flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        title="Descargar Folleto Completo del Fabricante"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                        <span>Catálogo de Fábrica (.PDF)</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={handleDownloadBankProformaPdf}
                      disabled={isExportingBankPdf}
                      className="px-3 py-1.5 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-400/30 font-bold text-xs uppercase flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      title="Generar Ficha Homologada para Banco (Bagrícola, Popular, BHD)"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Ficha Bancaria Homologada</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 2x4 Key Specs Matrix */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-2">
                  Especificaciones Técnicas Certificadas
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-0.5">Motor Diésel</span>
                    <span className="font-bold text-xs sm:text-sm text-white uppercase">{machine.engine}</span>
                  </div>
                  <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-0.5">Potencia Nominal</span>
                    <span className="font-bold text-xs sm:text-sm text-amber-400">{machine.powerHp} HP</span>
                  </div>
                  <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-0.5">Peso Operativo</span>
                    <span className="font-bold text-xs sm:text-sm text-white">{machine.operatingWeightKg.toLocaleString()} kg</span>
                  </div>
                  {machine.bucketCapacityM3 && (
                    <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-0.5">Capacidad Cucharón</span>
                      <span className="font-bold text-xs sm:text-sm text-white">{machine.bucketCapacityM3} m³</span>
                    </div>
                  )}
                  <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-0.5">Garantía Fábrica TMD</span>
                    <span className="font-bold text-xs sm:text-sm text-white">3 Años / 5,000 Horas</span>
                  </div>
                  <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-0.5">Soporte Técnico</span>
                    <span className="font-bold text-xs sm:text-sm text-emerald-400">Taller Central Km 22</span>
                  </div>
                </div>
              </div>

              {/* Ficha Técnica Completa — Structured Spec Table */}
              {machine.specs && machine.specs.length > 0 && (
                <div className="rounded-[2px] border border-zinc-800 bg-zinc-950 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setIsExtendedSpecsExpanded(!isExtendedSpecsExpanded)}
                    className="w-full p-2.5 sm:p-3 flex items-center justify-between text-left font-bold text-xs text-white hover:text-amber-400 transition-colors cursor-pointer uppercase"
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Ficha Técnica Completa ({machine.specs.length} parámetros)</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold uppercase">
                      <span>{isExtendedSpecsExpanded ? 'Colapsar' : 'Ver'}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExtendedSpecsExpanded ? 'rotate-180 text-amber-400' : ''}`} />
                    </span>
                  </button>

                  {isExtendedSpecsExpanded && (
                    <div className="border-t border-zinc-800 animate-in fade-in duration-150">
                      <table className="w-full text-xs">
                        <tbody>
                          {machine.specs.map((s, idx) => (
                            <tr
                              key={idx}
                              className={idx % 2 === 0 ? 'bg-zinc-900/60' : 'bg-zinc-950'}
                            >
                              <td className="px-3 py-2 text-zinc-400 font-bold uppercase text-[10px] tracking-wide w-[52%] border-r border-zinc-800">
                                {s.label}
                              </td>
                              <td className="px-3 py-2 text-zinc-100 font-mono font-bold text-right">
                                {s.value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Applications Chips */}
              {machine.applications && machine.applications.length > 0 && (
                <div className="rounded-[2px] border border-zinc-800 bg-zinc-950 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setIsApplicationsExpanded(!isApplicationsExpanded)}
                    className="w-full p-2.5 sm:p-3 flex items-center justify-between text-left font-bold text-xs text-white hover:text-amber-400 transition-colors cursor-pointer uppercase"
                  >
                    <span className="flex items-center gap-2">
                      <HardHat className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Aplicaciones en RD ({machine.applications.length})</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold uppercase">
                      <span>{isApplicationsExpanded ? 'Ocultar' : 'Ver'}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isApplicationsExpanded ? 'rotate-180 text-amber-400' : ''}`} />
                    </span>
                  </button>

                  {isApplicationsExpanded && (
                    <div className="p-3 pt-0 border-t border-zinc-800 animate-in fade-in duration-150">
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {machine.applications.map((app, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-[2px] bg-amber-400/10 text-amber-400 font-bold text-[11px] uppercase border border-amber-400/30">
                            {app}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: OEM ATTACHMENTS & CONFIGURATOR */}
          {activeTab === 'attachments' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="p-3 rounded-[2px] bg-amber-400/10 border border-amber-400/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-bold text-zinc-200">
                    Selecciona implementos originales para agregarlos directamente a tu cotización oficial.
                  </span>
                </div>
                <span className="text-xs font-bold text-amber-400 shrink-0 font-mono">
                  +{formatMoney(attachmentsCostUsd)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {relevantAttachments.map((att) => {
                  const isSelected = selectedAttachmentIds.includes(att.id);
                  return (
                    <div
                      key={att.id}
                      onClick={() => toggleAttachment(att.id)}
                      className={`p-3 rounded-[2px] border transition-all cursor-pointer flex flex-col justify-between select-none ${
                        isSelected
                          ? 'bg-zinc-900 border-amber-400 ring-1 ring-amber-400/50 shadow-sm'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-[9px] uppercase font-bold tracking-wider text-amber-400">
                            {att.category}
                          </span>
                          <span className={`w-4 h-4 rounded-[1px] flex items-center justify-center text-xs font-bold transition-colors ${
                            isSelected ? 'bg-amber-400 text-black' : 'border border-zinc-700 bg-zinc-900'
                          }`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-white uppercase">
                          {att.name}
                        </h5>
                        <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed font-sans">
                          {att.description}
                        </p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">{att.leadTime}</span>
                        <span className="font-bold text-amber-400 font-mono">
                          +{formatMoney(att.priceUsd)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: FINANCING & LEASING CALCULATOR */}
          {activeTab === 'financing' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <InteractiveMachineryFinancing
                machine={machine}
                totalInvestmentUsd={totalInvestmentUsd}
                onOpenDetailedProforma={handleDownloadBankProformaPdf}
              />
            </div>
          )}

          {/* TAB 4: WARRANTY & SERVICE SCHEDULE */}
          {activeTab === 'maintenance' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-[2px] bg-zinc-950 border border-zinc-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <h5 className="text-xs font-bold uppercase tracking-wider text-white">
                      Cobertura Oficial 3 Años / 5,000 Horas
                    </h5>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                    Garantía total contra defectos de manufactura en tren de potencia, bomba hidráulica principal y estructura de chasis con repuestos originales despachados desde Km 22.
                  </p>
                </div>

                <div className="p-3.5 rounded-[2px] bg-zinc-950 border border-zinc-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-400" />
                    <h5 className="text-xs font-bold uppercase tracking-wider text-white">
                      Flota de Asistencia Móvil 24/7
                    </h5>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                    Unidades móviles equipadas con técnicos certificados para mantenimientos programados y diagnósticos computarizados directamente en su obra en cualquier provincia.
                  </p>
                </div>
              </div>

              {/* Cronograma Preventivo Sugerido */}
              <div className="rounded-[2px] border border-zinc-800 bg-zinc-950 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsScheduleExpanded(!isScheduleExpanded)}
                  className="w-full p-2.5 sm:p-3 flex items-center justify-between text-left font-bold text-xs text-white hover:text-amber-400 transition-colors cursor-pointer uppercase"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Cronograma Preventivo Sugerido (250H, 500H, 1000H+)</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold uppercase">
                    <span>{isScheduleExpanded ? 'Ocultar' : 'Ver'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isScheduleExpanded ? 'rotate-180 text-amber-400' : ''}`} />
                  </span>
                </button>

                {isScheduleExpanded && (
                  <div className="p-3 pt-0 border-t border-zinc-800 animate-in fade-in duration-150">
                    <div className="space-y-1.5 text-xs pt-2">
                      <div className="p-2.5 rounded-[2px] bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                        <div>
                          <strong className="text-white block uppercase">Servicio Inicial (250 Horas)</strong>
                          <span className="text-zinc-400 text-[11px] font-sans">Cambio de aceite de motor diésel, filtro de aceite y filtro primario de combustible.</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-[2px] bg-emerald-500/10 text-emerald-400 font-bold text-[9px] uppercase shrink-0 border border-emerald-500/20">
                          Incluido 1er Servicio
                        </span>
                      </div>
                      <div className="p-2.5 rounded-[2px] bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                        <div>
                          <strong className="text-white block uppercase">Servicio Regular (500 Horas)</strong>
                          <span className="text-zinc-400 text-[11px] font-sans">Filtro de aire secundario, trampa de agua, engrase general y chequeo de tensión.</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-[2px] bg-amber-400/10 text-amber-400 font-bold text-[9px] uppercase shrink-0 border border-amber-400/20">
                          Kit Disponible
                        </span>
                      </div>
                      <div className="p-2.5 rounded-[2px] bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                        <div>
                          <strong className="text-white block uppercase">Mantenimiento Mayor (1,000 / 2,000 Horas)</strong>
                          <span className="text-zinc-400 text-[11px] font-sans">Reemplazo de fluido hidráulico, aceite de transmisión y calibración de presiones.</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-[2px] bg-zinc-800 text-zinc-300 font-bold text-[9px] uppercase shrink-0">
                          Taller Central
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions: Fluids Guide (Task #6) & PDI Inspection (Task #16) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFluidsOpen(true)}
                  className="p-3 rounded-[2px] bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-400/40 text-left transition-all flex items-center justify-between gap-2 cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-[2px] bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Fuel className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase text-white group-hover:text-amber-400 block transition-colors">
                        Guía de Capacidades & Fluidos
                      </span>
                      <span className="text-[10px] text-zinc-400 font-sans">
                        Litros y galones de aceite, hidráulico y refrigerante
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsPdiOpen(true)}
                  className="p-3 rounded-[2px] bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 text-left transition-all flex items-center justify-between gap-2 cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-[2px] bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase text-white group-hover:text-emerald-400 block transition-colors">
                        Checklist Pre-Entrega PDI (85 Pts)
                      </span>
                      <span className="text-[10px] text-zinc-400 font-sans">
                        Inspección técnica certificada de taller Km 22
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                </button>
              </div>

              {/* Matriz Comparativa OEM vs Aftermarket (Task #23) */}
              <OemVsAftermarketMatrix className="mt-2" />
            </div>
          )}

          {/* TAB 5: DELIVERY & LOWBOY FREIGHT CALCULATOR (Task #66) */}
          {activeTab === 'delivery' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <LowboyFreightCalculator
                initialWeightKg={machine.operatingWeightKg || 18000}
                initialMachineName={machine.name}
                initialCategory={machine.category}
              />

              <div className="p-3.5 rounded-[2px] bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-white">
                    ¿Desea Probar el Equipo en Patio Antes del Despacho?
                  </h5>
                  <p className="text-xs text-zinc-400 font-sans mt-0.5">
                    Coordinamos prueba de carga y maniobras en el área de excavación en nuestro patio de Km 22 Autopista Duarte.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('success');
                    setTestDriveBooked(true);
                  }}
                  className={`py-2 px-4 rounded-[2px] text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                    testDriveBooked
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-400 text-black hover:bg-amber-300'
                  }`}
                >
                  {testDriveBooked ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>¡Demostración Agendada!</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Agendar Test Drive en Patio</span>
                    </>
                  )}
                </button>
              </div>

              {/* Gate Pass Security Pass Card (Task #84) */}
              <div className="p-3.5 rounded-[2px] bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-amber-400" />
                    <h5 className="text-xs font-bold uppercase tracking-wider text-white">
                      Pase de Puerta Digital con QR (Salida de Garita Km 22)
                    </h5>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans mt-0.5">
                    Genera el ticket de autorización de salida con código QR escaneable por el oficial de seguridad en el portón del Km 22.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGatePassOpen(true)}
                  className="py-2 px-3 rounded-[2px] bg-zinc-900 hover:bg-amber-400 hover:text-black text-amber-400 border border-amber-400/50 text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Emitir Pase Garita</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: AUDIT TRAIL (LAST 3 SCAN EVENTS) */}
          {activeTab === 'audit' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Historial y Registro de Auditoría en Tiempo Real
                  </h4>
                </div>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  Registro cronológico de los últimos 3 escaneos de código QR e inspecciones de inventario físico registrados por personal técnico en Patio Km 22 o Almacén Central.
                </p>
              </div>

              <InventoryAuditTrail
                itemId={machine.id}
                itemCode={machine.modelCode}
                itemName={machine.name}
                itemType="machinery"
                maxEvents={3}
              />
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* MODAL FOOTER ACTIONS                                         */}
        {/* ============================================================ */}
        <div className="p-3.5 sm:p-4 bg-zinc-950 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase block font-bold">Inversión Total Configurada:</span>
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-bold text-amber-400 font-mono">
                {formatMoney(totalInvestmentUsd)}
              </span>
              {selectedAttachmentIds.length > 0 && (
                <span className="text-[11px] text-zinc-500">
                  (+{selectedAttachmentIds.length} implementos)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-[2px] border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs font-bold uppercase hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <a
              href={whatsappQuoteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-[2px] bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Cotizar de inmediato por WhatsApp con un asesor técnico de TMD"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
            <button
              type="button"
              onClick={handleDownloadBankProformaPdf}
              disabled={isExportingBankPdf}
              className="px-3.5 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-400/40 font-bold uppercase text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              title="Descargar Ficha Técnica Homologada para Banco (PDF) con corrida financiera"
            >
              <Download className={`w-3.5 h-3.5 ${isExportingBankPdf ? 'animate-bounce' : ''}`} />
              <span>{isExportingBankPdf ? 'Generando...' : 'PDF Banco'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSalesInquiryModalOpen(true)}
              className="px-3.5 py-1.5 rounded-[2px] bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Solicitar Proforma Oficial para Banco o Compra Directa"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Solicitar Proforma Banco</span>
            </button>
            <button
              id="machinery-studio-request-quote-btn"
              type="button"
              onClick={handleAddToQuoteWithCustomizations}
              className="px-4 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Agregar a Presupuesto</span>
            </button>
          </div>
        </div>

      </div>

      {/* Inventory Label Mass PDF Sheet Generator Modal */}
      <InventoryLabelPdfModal
        isOpen={isLabelPdfModalOpen}
        onClose={() => setIsLabelPdfModalOpen(false)}
        product={machine}
        type="machinery"
      />

      {/* Direct Tractor & Machinery Sales Proforma Inquiry Modal */}
      {isSalesInquiryModalOpen && (
        <TractorSalesInquiryModal
          isOpen={isSalesInquiryModalOpen}
          onClose={() => setIsSalesInquiryModalOpen(false)}
          machine={{
            id: machine.id,
            name: machine.name,
            model: machine.modelCode || machine.name,
            brand: machine.brand || 'LiuGong',
            priceUsd: totalInvestmentUsd,
            category: machine.category
          }}
        />
      )}

      {/* Cinematic Inspection Zoom Lens Lightbox (Task #12) */}
      <CinematicZoomViewer
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        imageUrl={machine.image}
        title={machine.name}
        subtitle={machine.modelCode}
        category={machine.category}
      />

      {/* Task #16 / #88: PDI Inspection Modal */}
      <PdiInspectionModal
        machine={machine}
        isOpen={isPdiOpen}
        onClose={() => setIsPdiOpen(false)}
      />

      {/* Task #6: Fluids and Capacities Guide */}
      <MachineFluidsGuideModal
        machine={machine}
        isOpen={isFluidsOpen}
        onClose={() => setIsFluidsOpen(false)}
      />

      {/* Task #84: Gate Pass Security Pass Modal */}
      <GatePassModal
        machine={machine}
        isOpen={isGatePassOpen}
        onClose={() => setIsGatePassOpen(false)}
      />

      {/* Task #74: Public Tenders Dossier Exporter */}
      <TenderDossierExporterModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        initialSelectedMachineIds={[machine.id]}
      />
    </div>,
    document.body
  );
};
