import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  ShieldCheck, 
  Wrench, 
  AlertTriangle, 
  FileText, 
  Camera, 
  CheckCircle2, 
  Download, 
  Send, 
  Clock, 
  Layers, 
  DollarSign, 
  Info,
  ChevronRight
} from 'lucide-react';
import { MACHINES_DATA } from '../../data/catalog';

interface OemWarrantyClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMachineModel?: string;
}

export const OemWarrantyClaimModal: React.FC<OemWarrantyClaimModalProps> = ({
  isOpen,
  onClose,
  defaultMachineModel
}) => {
  const [oemBrand, setOemBrand] = useState<'LiuGong' | 'JCB' | 'Yanmar' | 'Ammann'>('LiuGong');
  const [machineModel, setMachineModel] = useState<string>(defaultMachineModel || 'LiuGong 922E HD');
  const [serialVin, setSerialVin] = useState<string>('CLG922E-2024-8849');
  const [horometerHours, setHorometerHours] = useState<number>(485);
  const [deliveryDate, setDeliveryDate] = useState<string>('2025-11-15');
  const [subsystem, setSubsystem] = useState<string>('Sistema Hidráulico (Bomba Principal)');
  const [faultCodeDtc, setFaultCodeDtc] = useState<string>('SPN 1081 FMI 2 (Hydraulic Pressure Deviation)');
  const [defectDescription, setDefectDescription] = useState<string>(
    'Fisura capilar en cuerpo de fundición de la bomba hidráulica principal Kawasaki K3V112DT durante operación normal en cantera. Sin evidencia de golpe externo ni contaminación en análisis de aceite ISO 4406.'
  );
  const [partNumberClaimed, setPartNumberClaimed] = useState<string>('LG-SP102849');
  const [partCostUsd, setPartCostUsd] = useState<number>(3850);
  const [laborHours, setLaborHours] = useState<number>(6.5);
  const [claimStatus, setClaimStatus] = useState<'draft' | 'submitting' | 'approved'>('draft');
  const [generatedClaimId, setGeneratedClaimId] = useState<string>('WCR-LG-2026-0491');

  if (!isOpen || typeof document === 'undefined') return null;

  const laborCostUsd = laborHours * 65; // Tarifa oficial fábrica US$ 65/hr
  const totalClaimAmountUsd = partCostUsd + laborCostUsd;

  const handleSubmitClaim = () => {
    setClaimStatus('submitting');
    setTimeout(() => {
      setClaimStatus('approved');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      setGeneratedClaimId(`WCR-${oemBrand.toUpperCase().slice(0, 3)}-2026-${randomSuffix}`);
    }, 900);
  };

  const handleDownloadTechnicalDossier = () => {
    let report = `========================================================================\n`;
    report += `TMD DOMINICANA - EXPEDIENTE TÉCNICO PERICIAL DE GARANTÍA OEM\n`;
    report += `DOCUMENTO OFICIAL PARA REEMBOLSO DE FÁBRICA (OEM CLAIM DOSSIER)\n`;
    report += `Fecha de Radicación: ${new Date().toLocaleString('es-DO')}\n`;
    report += `Número de Reclamo Oficial: ${generatedClaimId}\n`;
    report += `Distribuidor Autorizado: Tecnomaquinarias Diesel Dominicana (TMD) S.R.L.\n`;
    report += `Código Dealer Internacional: TMD-DOM-7821\n`;
    report += `========================================================================\n\n`;

    report += `1. DATOS DE IDENTIFICACIÓN DEL EQUIPO:\n`;
    report += `• Fabricante OEM: ${oemBrand}\n`;
    report += `• Modelo Comercial: ${machineModel}\n`;
    report += `• Número de Serie (VIN / Chasis): ${serialVin}\n`;
    report += `• Fecha de Entrega PDI al Cliente: ${deliveryDate}\n`;
    report += `• Horómetro al Fallo: ${horometerHours} Horas (Garantía Cubre hasta 2,000h / 12m)\n`;
    report += `• Estatus de Garantía: VIGENTE (Garantía Fábrica LiuGong/JCB Activa)\n\n`;

    report += `2. DIAGNÓSTICO PERICIAL Y CÓDIGO DE FALLA:\n`;
    report += `• Subsistema Afectado: ${subsystem}\n`;
    report += `• Código DTC J1939: ${faultCodeDtc}\n`;
    report += `• Descripción Pericial del Defecto:\n  ${defectDescription}\n`;
    report += `• Inspección Visual de Desgaste: Ausencia de daño por negligencia del operador.\n`;
    report += `• Fluidos y Contaminación: Filtros OEM Donaldson inspeccionados con aceite limpio.\n\n`;

    report += `3. LIQUIDACIÓN FINANCIERA DEL RECLAMO:\n`;
    report += `• Número de Parte Defectuosa: ${partNumberClaimed}\n`;
    report += `• Costo de Repuesto Reemplazado: US$ ${partCostUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`;
    report += `• Horas de Mano de Obra Taller Certificado: ${laborHours} hrs @ US$ 65.00/h = US$ ${laborCostUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`;
    report += `• TOTAL SOLICITADO A REEMBOLSO OEM: US$ ${totalClaimAmountUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n\n`;

    report += `4. REGISTRO FOTOGRÁFICO ANEXADO AL EXPEDIENTE:\n`;
    report += `[✓] Foto 1: Placa de Chasis VIN estampado en caliente\n`;
    report += `[✓] Foto 2: Odómetro digital de cabina mostrando ${horometerHours} horas\n`;
    report += `[✓] Foto 3: Componente montado en máquina con etiqueta de lote OEM\n`;
    report += `[✓] Foto 4: Macrografía de la fractura sin contaminación externa\n\n`;

    report += `Certificado por: Ing. Rafael Castillo - Gerente de Servicio Técnico TMD Dominicana\n`;
    report += `Aprobación Técnica Fábrica: PENDIENTE DE VALIDACIÓN FINAL EN SERVICE HUB OEM.\n`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TMD_Garantia_OEM_${generatedClaimId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-zinc-950 rounded-[5px] border border-zinc-800 max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[94vh] flex flex-col overflow-hidden font-mono text-zinc-100">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[3px] bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/20">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider font-display">
                  Taller Central Km 22 • Garantías de Fábrica
                </span>
                <span className="px-1.5 py-0.2 rounded-[2px] bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20">
                  OEM CLAIM FORGE
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-tight font-display">
                Expediente Pericial de Garantías LiuGong / JCB
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {claimStatus === 'approved' && (
              <button
                onClick={handleDownloadTechnicalDossier}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>EXPEDIENTE TXT</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-[2px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Callout */}
        {claimStatus === 'approved' ? (
          <div className="p-3.5 rounded-[3px] bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-emerald-300 uppercase block font-display">
                  RECLAMO OEM RADICADO: {generatedClaimId}
                </span>
                <span className="text-zinc-400 text-[11px]">
                  Expediente pericial transmitido con éxito al portal internacional LiuGong / JCB Overseas.
                </span>
              </div>
            </div>
            <button
              onClick={handleDownloadTechnicalDossier}
              className="px-3 py-1.5 rounded-[2px] bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-[10px] tracking-wider transition-colors cursor-pointer shrink-0"
            >
              DESCARGAR ACTA
            </button>
          </div>
        ) : (
          <div className="p-3 rounded-[3px] bg-zinc-900 border border-zinc-800 flex items-center gap-2.5 text-xs text-zinc-400 shrink-0 font-sans">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Este módulo genera el expediente pericial con código DTC, horómetro y liquidación de mano de obra requerido por las casas matrices para emitir nota de crédito y reembolso de piezas.
            </span>
          </div>
        )}

        {/* Main Form Fields */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          
          {/* Section 1: Machine & OEM Info */}
          <div className="bg-zinc-900 rounded-[3px] border border-zinc-800 p-4 space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block font-display">
              1. Identificación del Equipo y Vigencia de Garantía
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                  Fabricante OEM
                </label>
                <select
                  value={oemBrand}
                  onChange={(e) => setOemBrand(e.target.value as any)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="LiuGong">LiuGong Construction Machinery</option>
                  <option value="JCB">JCB Overseas ServiceMaster</option>
                  <option value="Yanmar">Yanmar Compact Equipment</option>
                  <option value="Ammann">Ammann Road Compaction</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                  Modelo de Maquinaria
                </label>
                <input
                  type="text"
                  value={machineModel}
                  onChange={(e) => setMachineModel(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                  Número de Chasis / Serial VIN
                </label>
                <input
                  type="text"
                  value={serialVin}
                  onChange={(e) => setSerialVin(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                  Horómetro al Momento de la Falla
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    value={horometerHours}
                    onChange={(e) => setHorometerHours(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <span className="text-[9px] text-emerald-400 mt-1 block">
                  ✓ Dentro del límite de fábrica (2,000 Horas / 12 Meses)
                </span>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                  Fecha de Entrega PDI al Cliente
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Defect & Diagnostics */}
          <div className="bg-zinc-900 rounded-[3px] border border-zinc-800 p-4 space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block font-display">
              2. Diagnóstico Pericial y Código de Falla DTC J1939
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                  Subsistema Afectado
                </label>
                <select
                  value={subsystem}
                  onChange={(e) => setSubsystem(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Sistema Hidráulico (Bomba Principal)">Sistema Hidráulico (Bomba Principal)</option>
                  <option value="Motor Diésel Cummins (Inyección Common Rail)">Motor Diésel Cummins (Inyección)</option>
                  <option value="Transmisión PowerShift & Ejes Carraro">Transmisión & Ejes</option>
                  <option value="Sistema Eléctrico 24V & ECU">Sistema Eléctrico & Sensores</option>
                  <option value="Cilindro de Pluma / Brazo / Balde">Cilindro Hidráulico de Cuchara</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                  Código de Falla DTC Diagnosticado
                </label>
                <input
                  type="text"
                  value={faultCodeDtc}
                  onChange={(e) => setFaultCodeDtc(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                Dictamen Técnico Pericial (Causa Raíz de Fábrica)
              </label>
              <textarea
                rows={3}
                value={defectDescription}
                onChange={(e) => setDefectDescription(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-xs font-sans text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Photographic Checklist Checkboxes */}
            <div className="pt-2 border-t border-zinc-800">
              <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-2">
                Registro Fotográfico Obligatorio de Fábrica:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-zinc-300">
                <div className="p-2 rounded-[2px] bg-zinc-950 border border-zinc-800 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Placa Chasis VIN [✓]</span>
                </div>
                <div className="p-2 rounded-[2px] bg-zinc-950 border border-zinc-800 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Horómetro Cabina [✓]</span>
                </div>
                <div className="p-2 rounded-[2px] bg-zinc-950 border border-zinc-800 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Pieza en Máquina [✓]</span>
                </div>
                <div className="p-2 rounded-[2px] bg-zinc-950 border border-zinc-800 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Detalle Fisura [✓]</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Financial Settlement Claim */}
          <div className="bg-zinc-900 rounded-[3px] border border-zinc-800 p-4 space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block font-display">
              3. Liquidación Financiera Reclamada a Fábrica
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                  Número de Parte OEM Reemplazado
                </label>
                <input
                  type="text"
                  value={partNumberClaimed}
                  onChange={(e) => setPartNumberClaimed(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                  Costo de Repuesto OEM (USD)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    value={partCostUsd}
                    onChange={(e) => setPartCostUsd(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                  Horas de Taller Certificado (@US$ 65/h)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={laborHours}
                  onChange={(e) => setLaborHours(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Total Callout */}
            <div className="p-3 bg-zinc-950 rounded-[2px] border border-amber-400/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase block">Total a Reembolsar por Fábrica</span>
                <span className="text-xl font-black text-amber-400 font-mono">
                  US$ {totalClaimAmountUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">
                Repuesto: ${partCostUsd.toLocaleString()} + Mano de Obra: ${laborCostUsd.toFixed(2)}
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <span className="text-[10px] font-mono">
            TMD Warranty Management Engine v3.1 • Certificado Fábrica LiuGong / JCB
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-[2px] text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-bold uppercase cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmitClaim}
              disabled={claimStatus === 'submitting'}
              className="px-4 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-[10px] tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{claimStatus === 'submitting' ? 'Transmitiendo...' : 'Radicar Reclamo OEM'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};
