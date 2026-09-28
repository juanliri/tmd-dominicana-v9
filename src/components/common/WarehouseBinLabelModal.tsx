import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Printer, 
  QrCode, 
  Barcode, 
  MapPin, 
  Copy, 
  Check, 
  Download, 
  Layers, 
  Building2, 
  Tag,
  ShieldCheck,
  Code
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import { Part, Machine } from '../../types';

interface WarehouseBinLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Part | Machine | null;
  itemType?: 'part' | 'machine';
}

export const WarehouseBinLabelModal: React.FC<WarehouseBinLabelModalProps> = ({
  isOpen,
  onClose,
  item,
  itemType = 'part'
}) => {
  const [aisle, setAisle] = useState('A');
  const [column, setColumn] = useState('04');
  const [level, setLevel] = useState('02');
  const [bin, setBin] = useState('B');
  const [minStock, setMinStock] = useState(6);
  const [maxStock, setMaxStock] = useState(24);
  const [printerFormat, setPrinterFormat] = useState<'zebra_100x50' | 'avery_100x50' | 'dymo_4xl'>('zebra_100x50');
  const [copies, setCopies] = useState(1);
  const [showZplCode, setShowZplCode] = useState(false);
  const [copiedZpl, setCopiedZpl] = useState(false);

  if (!isOpen) return null;

  const itemName = item?.name || 'Repuesto OEM TMD';
  const partNumber = (item as Part)?.partNumber || (item as Machine)?.modelCode || 'TMD-OEM-001';
  const brand = item?.brand || 'TMD Dominicana';
  const category = (item as Part)?.category || (item as Machine)?.category || 'Componentes';
  const binLocationCode = `P-${aisle}${column}-N${level}-${bin}`;
  const barcodeValue = partNumber.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

  // Synthetic industrial Zebra Programming Language (ZPL II) code for 100mm x 50mm (800x400 dots at 203 DPI)
  const zplCode = `^XA
^PW800
^LL400
^FO40,30^A0N,28,26^FDTMD DOMINICANA • ALMACÉN KM 22^FS
^FO40,65^A0N,36,34^FD${binLocationCode}^FS
^FO550,30^BQN,2,4^FDQA,https://tmd.com.do/p/${partNumber}^FS
^FO40,110^GB720,2,2^FS
^FO40,125^A0N,30,28^FD${partNumber}^FS
^FO40,165^A0N,24,22^FD${itemName.substring(0, 36).toUpperCase()}^FS
^FO40,195^A0N,20,18^FDMARCA: ${brand.toUpperCase()} | CAT: ${category.toUpperCase()}^FS
^FO40,230^BY3,2,70^BCN,70,Y,N,N^FD${barcodeValue}^FS
^FO550,240^A0N,18,16^FDMIN: ${minStock} | MAX: ${maxStock}^FS
^FO550,265^A0N,18,16^FDESTADO: VERIFICADO^FS
^FO40,345^GB720,2,2^FS
^FO40,360^A0N,20,18^FDRÓTULO INDUSTRIAL ZEBRA/AVERY 100X50MM^FS
^XZ`;

  const handlePrint = () => {
    triggerHaptic('success');
    window.print();
  };

  const handleCopyZpl = () => {
    triggerHaptic('selection');
    navigator.clipboard.writeText(zplCode);
    setCopiedZpl(true);
    setTimeout(() => setCopiedZpl(false), 2000);
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl p-5 sm:p-6 text-white font-mono space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-[2px] bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase">
                LOGÍSTICA & ESTANTERÍAS KM 22
              </span>
              <span className="text-[10px] text-zinc-500">FORMATO ZEBRA / AVERY 100x50 MM</span>
            </div>
            <h3 className="text-base sm:text-lg font-black uppercase tracking-wide text-white font-display">
              GENERADOR DE RÓTULOS INDUSTRIALES PARA RACKS
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Etiqueta autoadhesiva con código QR, Code-128 y coordenadas de pasillo para operarios con PDA.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shelf Coordinates Configuration */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-900 border border-zinc-800 rounded-[3px] p-4 text-xs">
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">PASILLO (RACK):</label>
            <select
              value={aisle}
              onChange={(e) => setAisle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-[2px] p-2 text-amber-400 font-bold uppercase focus:border-amber-400 focus:outline-none"
            >
              <option value="A">Pasillo A (Filtros & Mantenimiento)</option>
              <option value="B">Pasillo B (Fluidos & Lubricantes)</option>
              <option value="C">Pasillo C (Tren de Potencia / Motor)</option>
              <option value="D">Pasillo D (Bombas & Hidráulica)</option>
              <option value="E">Pasillo E (Rodaje & Cadenas)</option>
              <option value="F">Pasillo F (Herramientas & Desgaste)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">COLUMNA:</label>
            <select
              value={column}
              onChange={(e) => setColumn(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-[2px] p-2 text-white font-bold uppercase focus:border-amber-400 focus:outline-none"
            >
              {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '12', '15', '20'].map((col) => (
                <option key={col} value={col}>Columna {col}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">NIVEL (ALTURA):</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-[2px] p-2 text-white font-bold uppercase focus:border-amber-400 focus:outline-none"
            >
              <option value="01">Nivel 01 (Suelo / Carga Pesada)</option>
              <option value="02">Nivel 02 (Picking Manual)</option>
              <option value="03">Nivel 03 (Picking Medio)</option>
              <option value="04">Nivel 04 (Rack Alto)</option>
              <option value="05">Nivel 05 (Tope de Estantería)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">GAVETA / POSICIÓN:</label>
            <select
              value={bin}
              onChange={(e) => setBin(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-[2px] p-2 text-amber-400 font-bold uppercase focus:border-amber-400 focus:outline-none"
            >
              <option value="A">Gaveta A</option>
              <option value="B">Gaveta B</option>
              <option value="C">Gaveta C</option>
              <option value="D">Gaveta D</option>
            </select>
          </div>
        </div>

        {/* PHYSICAL 100mm x 50mm LABEL PREVIEW CANVAS */}
        <div className="flex flex-col items-center justify-center p-4 bg-zinc-900/60 rounded-[3px] border border-zinc-800">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">
            VISTA PREVIA REAL DEL RÓTULO TÉRMICO (100 mm x 50 mm):
          </span>

          <div 
            id="zebra-print-area"
            className="w-full max-w-lg bg-white text-black p-4 rounded-[2px] border-2 border-dashed border-zinc-400 shadow-xl space-y-2 select-none"
            style={{ minHeight: '190px' }}
          >
            {/* Top row */}
            <div className="flex items-start justify-between border-b-2 border-black pb-1.5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider block font-sans">
                  TMD DOMINICANA • ALMACÉN KM 22
                </span>
                <span className="text-xl font-black tracking-tight block font-mono">
                  {binLocationCode}
                </span>
              </div>
              <div className="p-1 border border-black bg-zinc-100 flex flex-col items-center">
                <QrCode className="w-10 h-10 text-black" />
                <span className="text-[7px] font-bold">SCAN PDA</span>
              </div>
            </div>

            {/* Middle row: PN & Name */}
            <div className="py-1">
              <span className="text-sm font-black font-mono block tracking-wide">
                PN: {partNumber}
              </span>
              <span className="text-xs font-bold text-zinc-800 uppercase block line-clamp-1">
                {itemName}
              </span>
              <span className="text-[10px] text-zinc-600 block mt-0.5">
                MARCA: {brand.toUpperCase()} • CAT: {category.toUpperCase()}
              </span>
            </div>

            {/* Bottom row: Code-128 Mock Barcode + Min/Max */}
            <div className="pt-1.5 border-t border-black flex items-end justify-between">
              <div>
                {/* SVG Code-128 representation */}
                <svg className="w-48 h-9" viewBox="0 0 200 40">
                  <rect x="0" y="0" width="3" height="35" fill="black" />
                  <rect x="5" y="0" width="1" height="35" fill="black" />
                  <rect x="8" y="0" width="4" height="35" fill="black" />
                  <rect x="15" y="0" width="2" height="35" fill="black" />
                  <rect x="20" y="0" width="3" height="35" fill="black" />
                  <rect x="26" y="0" width="1" height="35" fill="black" />
                  <rect x="30" y="0" width="5" height="35" fill="black" />
                  <rect x="38" y="0" width="2" height="35" fill="black" />
                  <rect x="43" y="0" width="1" height="35" fill="black" />
                  <rect x="47" y="0" width="4" height="35" fill="black" />
                  <rect x="54" y="0" width="2" height="35" fill="black" />
                  <rect x="59" y="0" width="3" height="35" fill="black" />
                  <rect x="65" y="0" width="1" height="35" fill="black" />
                  <rect x="69" y="0" width="4" height="35" fill="black" />
                  <rect x="76" y="0" width="2" height="35" fill="black" />
                  <rect x="81" y="0" width="5" height="35" fill="black" />
                  <rect x="89" y="0" width="1" height="35" fill="black" />
                  <rect x="93" y="0" width="3" height="35" fill="black" />
                  <rect x="99" y="0" width="2" height="35" fill="black" />
                  <rect x="104" y="0" width="4" height="35" fill="black" />
                  <rect x="111" y="0" width="1" height="35" fill="black" />
                  <rect x="115" y="0" width="5" height="35" fill="black" />
                  <rect x="123" y="0" width="2" height="35" fill="black" />
                  <rect x="128" y="0" width="3" height="35" fill="black" />
                  <rect x="134" y="0" width="1" height="35" fill="black" />
                  <rect x="138" y="0" width="4" height="35" fill="black" />
                  <rect x="145" y="0" width="2" height="35" fill="black" />
                  <rect x="150" y="0" width="5" height="35" fill="black" />
                  <rect x="158" y="0" width="1" height="35" fill="black" />
                  <rect x="162" y="0" width="3" height="35" fill="black" />
                  <rect x="168" y="0" width="2" height="35" fill="black" />
                  <rect x="173" y="0" width="4" height="35" fill="black" />
                  <rect x="180" y="0" width="2" height="35" fill="black" />
                  <rect x="185" y="0" width="4" height="35" fill="black" />
                  <text x="5" y="39" fontSize="6" fontFamily="monospace" fill="black">
                    *{barcodeValue}*
                  </text>
                </svg>
              </div>

              <div className="text-right text-[9px] font-mono font-bold leading-tight">
                <div>MIN: {minStock} UDS</div>
                <div>MAX: {maxStock} UDS</div>
                <div className="text-[7px] text-zinc-500">REV: 2026-TMD</div>
              </div>
            </div>
          </div>
        </div>

        {/* Printer Options & ZPL Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 uppercase text-[10px]">FORMATO DE IMPRESORA:</span>
            <select
              value={printerFormat}
              onChange={(e: any) => setPrinterFormat(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-[2px] px-2.5 py-1 text-white text-xs focus:border-amber-400 focus:outline-none"
            >
              <option value="zebra_100x50">Zebra ZD421 / ZT411 (Térmica 100x50mm)</option>
              <option value="avery_100x50">Avery 5163 / L7163 (Hojas A4 / Carta)</option>
              <option value="dymo_4xl">Dymo LabelWriter 4XL (4" x 2")</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowZplCode(!showZplCode)}
            className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-amber-400 uppercase text-[10px] font-bold cursor-pointer"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showZplCode ? 'OCULTAR CÓDIGO ZPL' : 'VER CÓDIGO ZPL II INDUSTRIAL'}</span>
          </button>
        </div>

        {/* ZPL RAW CODE DRAWER */}
        {showZplCode && (
          <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-[3px] space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-400 uppercase">
                ZPL RAW STREAM (PUERTO RAW 9100 / ENVIAR DIRECTO A IP DE IMPRESORA):
              </span>
              <button
                type="button"
                onClick={handleCopyZpl}
                className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
              >
                {copiedZpl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedZpl ? 'COPIADO' : 'COPIAR ZPL'}</span>
              </button>
            </div>
            <pre className="text-[10px] font-mono text-zinc-300 bg-black/60 p-2 rounded-[2px] overflow-x-auto">
              {zplCode}
            </pre>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[10px] text-zinc-400">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span>UBICACIÓN REGISTRADA: <strong className="text-white">{binLocationCode}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold uppercase text-xs transition-colors cursor-pointer"
            >
              CERRAR
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-6 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase tracking-wider text-xs transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>IMPRIMIR RÓTULO (100x50 MM)</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
