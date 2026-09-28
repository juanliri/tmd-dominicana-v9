import React, { useState } from 'react';
import { 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  Cpu, 
  Search, 
  Sparkles, 
  X, 
  FileText,
  Clock,
  ShieldCheck,
  RefreshCw,
  Eye
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface WhatsappPartOcrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPart?: (partNumber: string) => void;
}

interface DetectedOcrResult {
  partNumber: string;
  brand: string;
  description: string;
  category: string;
  confidence: number;
  stockKm22: number;
  priceUsd: number;
  priceDop: number;
  oemEquivalent: string;
}

const SAMPLE_OCR_DETECTIONS: DetectedOcrResult[] = [
  {
    partNumber: 'LG40C0032',
    brand: 'LiuGong OEM',
    description: 'Bomba Principal Hidráulica de Pistones Axiales 350 Bar',
    category: 'Hidráulica de Potencia',
    confidence: 97.4,
    stockKm22: 4,
    priceUsd: 2850,
    priceDop: 171000,
    oemEquivalent: 'Rexroth A8VO107 / Kawasaki K3V112DT'
  },
  {
    partNumber: 'JCB-320/08560',
    brand: 'JCB Genuine',
    description: 'Inyector Common Rail Electrónico Delphi Diésel Tier 3',
    category: 'Inyección & Motor',
    confidence: 94.8,
    stockKm22: 12,
    priceUsd: 480,
    priceDop: 28800,
    oemEquivalent: 'Delphi 28342997'
  },
  {
    partNumber: 'FS19732',
    brand: 'Fleetguard / Cummins',
    description: 'Filtro Separador Diésel/Agua con Vaso Decantador Transparente',
    category: 'Filtración Diésel',
    confidence: 99.1,
    stockKm22: 45,
    priceUsd: 65,
    priceDop: 3900,
    oemEquivalent: 'Cummins 3973233'
  },
  {
    partNumber: '408107-00012',
    brand: 'Ammann / Yanmar',
    description: 'Solenoide de Parada de Combustible 24V Heavy-Duty',
    category: 'Sistema Eléctrico 24V',
    confidence: 91.3,
    stockKm22: 8,
    priceUsd: 145,
    priceDop: 8700,
    oemEquivalent: 'Yanmar 119233-77932'
  }
];

export const WhatsappPartOcrScannerModal: React.FC<WhatsappPartOcrScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectPart
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [detectedResult, setDetectedResult] = useState<DetectedOcrResult | null>(null);
  const [manualPartInput, setManualPartInput] = useState('');
  const [clientPhone, setClientPhone] = useState('809-555-0199');
  const [machineContext, setMachineContext] = useState('Excavadora LiuGong 922E (Serie LG-2022-849)');
  const [notes, setNotes] = useState('Pieza desmontada por fuga de presión en bancada.');

  if (!isOpen) return null;

  const handleSimulatedUpload = (sampleIndex: number = 0) => {
    triggerHaptic('medium');
    setIsScanning(true);
    setDetectedResult(null);

    // Simulated image thumbnail based on detected part
    const sample = SAMPLE_OCR_DETECTIONS[sampleIndex];
    setSelectedImage(`https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80`);

    setTimeout(() => {
      setIsScanning(false);
      setDetectedResult(sample);
      setManualPartInput(sample.partNumber);
      triggerHaptic('success');
    }, 1600);
  };

  const handleSendToWhatsapp = () => {
    triggerHaptic('heavy');
    const pNumber = detectedResult ? detectedResult.partNumber : manualPartInput || 'LG40C0032';
    const desc = detectedResult ? detectedResult.description : 'Repuesto de maquinaria pesada';
    const brand = detectedResult ? detectedResult.brand : 'TMD OEM';
    const stock = detectedResult ? `${detectedResult.stockKm22} unidades en Almacén Km 22` : 'Consultar stock';

    const message = `*SOLICITUD DE REPUESTO DE EMERGENCIA (FOTO-OCR TMD)* 🚜⚡
*Parte Identificada:* ${pNumber}
*Descripción:* ${desc}
*Marca:* ${brand}
*Stock Indicado:* ${stock}
*Equipo:* ${machineContext}
*Teléfono Contacto:* ${clientPhone}
*Comentarios:* ${notes}

_Enviado desde TMD Dominicana V9.0 (Reconocimiento Inteligente OCR Mostrador Km 22)_`;

    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/18092008630?text=${encoded}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-700 rounded-[5px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[2px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white font-display uppercase tracking-wide">
                  Reconocimiento OCR de Repuesto & Pedido WhatsApp
                </h3>
                <span className="px-2 py-0.5 rounded-[2px] bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                  IA de Visión TMD
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Suba o capture la foto de la pieza grabada u oxidada para extraer el P/N y cotizar en Almacén Km 22
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-1 text-zinc-400 hover:text-white rounded-[2px] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto font-sans">
          {/* Upload / Capture Dropzone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-dashed border-zinc-700 hover:border-amber-400/60 rounded-[3px] p-6 bg-zinc-950/60 flex flex-col items-center justify-center text-center transition-all group">
              <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-amber-400 group-hover:bg-amber-400/10 transition-colors mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white font-display uppercase tracking-wider">
                Capturar o Cargar Fotografía
              </h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                Formatos JPG, PNG, WEBP. Asegúrese de que el código alfanumérico grabado esté visible.
              </p>

              <div className="flex flex-wrap gap-2 justify-center mt-4">
                <button
                  type="button"
                  onClick={() => handleSimulatedUpload(0)}
                  disabled={isScanning}
                  className="px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 border border-zinc-600 font-mono font-bold flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Foto Bomba LG40C</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulatedUpload(1)}
                  disabled={isScanning}
                  className="px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 border border-zinc-600 font-mono font-bold flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Foto Inyector JCB</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulatedUpload(2)}
                  disabled={isScanning}
                  className="px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 border border-zinc-600 font-mono font-bold flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Foto Filtro FS19732</span>
                </button>
              </div>
            </div>

            {/* Preview & Scanner Animation */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-[3px] p-4 flex flex-col justify-between relative overflow-hidden min-h-[220px]">
              {isScanning ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-400/20 border-t-emerald-400 animate-spin" />
                    <div className="absolute inset-2 rounded-full border-2 border-amber-400/20 border-b-amber-400 animate-spin animate-reverse" />
                    <div className="absolute inset-0 flex items-center justify-center text-amber-400">
                      <Cpu className="w-6 h-6 animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                      Aplicando Filtros de Contraste & Binarización...
                    </p>
                    <p className="text-[11px] text-zinc-500 font-mono">
                      Extrayendo patrones alfanuméricos de fundición pesada
                    </p>
                  </div>
                  {/* Laser Scan line effect */}
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
                </div>
              ) : detectedResult ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Coincidencia Detectada ({detectedResult.confidence}%)
                    </span>
                    <span className="px-2 py-0.5 rounded-[2px] bg-zinc-800 text-[10px] font-mono text-zinc-300">
                      Almacén Km 22
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-zinc-400">Número de Parte OEM:</span>
                      <span className="text-base font-black font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-[2px] border border-amber-400/30">
                        {detectedResult.partNumber}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-zinc-400">Descripción:</span>
                      <span className="text-white font-medium text-right max-w-[210px] truncate">
                        {detectedResult.description}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-zinc-400">Marca / Fabricante:</span>
                      <span className="text-zinc-200 font-bold">{detectedResult.brand}</span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-zinc-400">Stock Inmediato:</span>
                      <span className="text-emerald-400 font-bold font-mono">
                        {detectedResult.stockKm22} Unidades Listas
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs pt-1 border-t border-zinc-800">
                      <span className="text-zinc-400">Precio Lista:</span>
                      <span className="text-sm font-black font-mono text-white">
                        US$ {detectedResult.priceUsd.toLocaleString()} <span className="text-[10px] font-normal text-zinc-500 font-sans">/ RD$ {detectedResult.priceDop.toLocaleString()}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 space-y-2">
                  <Camera className="w-8 h-8 text-zinc-600" />
                  <p className="text-xs font-mono">Ninguna captura procesada aún.</p>
                  <p className="text-[11px] text-zinc-600 max-w-xs text-center">
                    Seleccione un ejemplo o cargue una foto para ejecutar el motor OCR interno.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Form and Context Information */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-[3px] p-4 space-y-4">
            <h4 className="text-xs font-bold text-zinc-300 font-display uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              Datos Complementarios para el Asesor de Repuestos
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                  Número de Parte Identificado / Corregido
                </label>
                <input
                  type="text"
                  value={manualPartInput}
                  onChange={(e) => setManualPartInput(e.target.value)}
                  placeholder="Ej: LG40C0032"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-[2px] px-3 py-2 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                  Maquinaria / Modelo Asignado
                </label>
                <input
                  type="text"
                  value={machineContext}
                  onChange={(e) => setMachineContext(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-[2px] px-3 py-2 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                  Teléfono Móvil o WhatsApp de Contacto
                </label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-[2px] px-3 py-2 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                  Notas de Campo / Condición de Falla
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-[2px] px-3 py-2 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-zinc-950 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-zinc-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Respuesta oficial en menos de 15 minutos en horario de taller (Lun-Sáb)</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-display uppercase tracking-wider text-xs font-bold transition-all"
            >
              Cerrar
            </button>

            <button
              type="button"
              onClick={handleSendToWhatsapp}
              className="w-full sm:w-auto px-5 py-2 rounded-[2px] bg-emerald-600 hover:bg-emerald-500 text-white font-display uppercase tracking-wider text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Despachar por WhatsApp Mostrador</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
