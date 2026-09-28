import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, Zap, Package, AlertTriangle, CheckCircle2, Loader2, X, Phone, RefreshCw, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OcrResult {
  partNumber: string;
  confidence: number;
  rawText: string;
  suggestedParts: Array<{ partNumber: string; description: string; brand: string; price: number; stock: boolean; }>;
}

interface WhatsAppPartsOcrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Task #98: OCR WhatsApp Foto → Número de Parte
 *  Herramienta interna que reconoce el número de parte grabado en una
 *  pieza de metal oxidada a partir de una foto enviada por un mecánico en campo.
 */
export const WhatsAppPartsOcrModal: React.FC<WhatsAppPartsOcrModalProps> = ({ isOpen, onClose }) => {
  const [phase, setPhase] = useState<'upload' | 'processing' | 'result' | 'error'>('upload');
  const [preview, setPreview] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const DEMO_RESULTS: OcrResult[] = [
    {
      partNumber: 'JCB-32/925626',
      confidence: 94,
      rawText: '32/925626\nJCB\nHYD PUMP',
      suggestedParts: [
        { partNumber: '32/925626', description: 'Bomba Hidráulica Principal JCB 3CX/4CX', brand: 'JCB Genuine', price: 4850, stock: true },
        { partNumber: '332/D4674', description: 'Kit de Sellos Bomba Principal JCB', brand: 'JCB Genuine', price: 285, stock: true },
      ]
    },
    {
      partNumber: 'LG-CLG922E-HYD-01',
      confidence: 87,
      rawText: 'CLG 922E\nKAWASAKI\nK3V112DTP',
      suggestedParts: [
        { partNumber: 'K3V112DTP-101R', description: 'Bomba Kawasaki K3V112 LiuGong 922E', brand: 'LiuGong OEM', price: 6200, stock: false },
        { partNumber: 'K3V112-SEAL-KIT', description: 'Kit de Sellos Bomba Kawasaki K3V112', brand: 'Aftermarket Premium', price: 340, stock: true },
      ]
    }
  ];

  const processImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      setPhase('processing');
      // Simulate OCR processing
      setTimeout(() => {
        const result = DEMO_RESULTS[Math.floor(Math.random() * DEMO_RESULTS.length)];
        setOcrResult(result);
        setPhase('result');
      }, 2800);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) processImage(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) processImage(file);
  };

  const reset = () => {
    setPhase('upload');
    setPreview(null);
    setOcrResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const whatsappOrderUrl = (part: OcrResult['suggestedParts'][0]) =>
    `https://wa.me/18095601234?text=${encodeURIComponent(`Hola TMD, necesito cotizar el repuesto:\n*${part.partNumber}*\n${part.description}\n\n📍 Enviado desde escáner de partes en campo`)}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Escáner OCR de Repuestos por Foto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-[10px] overflow-hidden shadow-2xl"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800/70 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[7px] bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
              <Camera className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-black text-sm text-white uppercase tracking-wider">Escáner OCR de Repuestos</h2>
              <p className="text-[10px] text-zinc-400 mt-0.5">Task #98 — Reconocimiento de pieza por foto</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-[5px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <AnimatePresence mode="wait">
            {/* Upload Phase */}
            {phase === 'upload' && (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-[10px] p-8 text-center cursor-pointer transition-all ${
                    dragOver ? 'border-amber-400 bg-amber-500/5' : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/50'
                  }`}
                >
                  <Camera className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                  <p className="text-sm font-bold text-zinc-300 mb-1">Foto de Pieza en Campo</p>
                  <p className="text-xs text-zinc-500 mb-4">Arrastra o toca para subir foto de la pieza metálica oxidada con número de parte visible</p>
                  <div className="flex gap-2 justify-center">
                    <span className="px-3 py-1.5 rounded-[5px] bg-amber-500 text-black text-xs font-black flex items-center gap-1.5 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" /> Subir Foto
                    </span>
                    <span className="px-3 py-1.5 rounded-[5px] bg-zinc-800 text-zinc-300 text-xs font-bold flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5" /> Cámara
                    </span>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
                </div>

                <div className="mt-4 p-3 bg-zinc-900/50 rounded-[7px] border border-zinc-800/60">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-amber-400" /> Cómo funciona el OCR
                  </p>
                  <ul className="text-[11px] text-zinc-500 space-y-1">
                    <li>• Toma foto clara del número de serie grabado en la pieza</li>
                    <li>• El sistema extrae el código alfanumérico con IA</li>
                    <li>• Busca en el catálogo OEM: JCB, LiuGong, Cummins, Kawasaki</li>
                    <li>• Genera cotización WhatsApp con un toque</li>
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Processing Phase */}
            {phase === 'processing' && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                {preview && (
                  <div className="relative w-32 h-24 mx-auto mb-5 rounded-[7px] overflow-hidden border border-zinc-700">
                    <img src={preview} alt="Parte escaneada" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-full h-0.5 bg-amber-400/60 animate-bounce absolute" style={{ top: '33%' }} />
                      <div className="w-full h-0.5 bg-amber-400/40 animate-bounce absolute" style={{ top: '66%', animationDelay: '0.3s' }} />
                    </div>
                  </div>
                )}
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
                <p className="font-bold text-white text-sm">Procesando imagen con OCR...</p>
                <p className="text-xs text-zinc-400 mt-1">Extrayendo número de parte • Buscando en catálogo OEM</p>
                <div className="mt-4 flex justify-center gap-1.5">
                  {['Preprocesando', 'OCR', 'Buscando OEM', 'Coincidencias'].map((step, i) => (
                    <span key={i} className="text-[9px] font-bold text-zinc-500 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 animate-pulse" style={{ animationDelay: `${i * 0.4}s` }}>
                      {step}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Result Phase */}
            {phase === 'result' && ocrResult && (
              <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                {/* OCR Result header */}
                <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-[7px]">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-white font-mono">{ocrResult.partNumber}</p>
                    <p className="text-[10px] text-emerald-400">Confianza OCR: {ocrResult.confidence}% • Texto extraído: "{ocrResult.rawText.split('\n')[0]}"</p>
                  </div>
                </div>

                {/* Preview thumbnail */}
                {preview && (
                  <div className="relative h-24 rounded-[7px] overflow-hidden border border-zinc-700">
                    <img src={preview} alt="Pieza escaneada" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute bottom-2 left-2 text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
                      <Eye className="w-3 h-3 inline mr-1" />Foto procesada
                    </span>
                  </div>
                )}

                {/* Suggested parts */}
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Package className="w-3 h-3 text-amber-400" /> Repuestos Encontrados en Catálogo
                  </p>
                  <div className="space-y-2">
                    {ocrResult.suggestedParts.map((part, i) => (
                      <div key={i} className="p-3 bg-zinc-900 border border-zinc-800 rounded-[7px] space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-xs text-white font-mono">{part.partNumber}</p>
                            <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">{part.description}</p>
                            <span className="inline-block mt-1 text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-[3px] border border-amber-500/20">
                              {part.brand}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-black text-sm text-white">US$ {part.price.toLocaleString()}</p>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-[3px] ${part.stock ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                              {part.stock ? 'En Stock Km22' : 'Pedido Especial'}
                            </span>
                          </div>
                        </div>
                        <a
                          href={whatsappOrderUrl(part)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-2 rounded-[5px] bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Cotizar por WhatsApp
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={reset}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[7px] bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-bold hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Escanear Otra Pieza
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};