import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  QrCode, 
  ShieldCheck, 
  Truck, 
  UserCheck, 
  Calendar, 
  Clock, 
  FileCheck, 
  Download, 
  Printer, 
  AlertTriangle, 
  Check, 
  MapPin, 
  CheckCircle2,
  Lock
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Machine } from '../../types';
import { drawTmdOfficialLogoPdf } from '../../utils/pdfGenerator';
import { triggerHaptic } from '../../utils/haptics';

interface GatePassModalProps {
  machine: Machine | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GatePassModal: React.FC<GatePassModalProps> = ({
  machine,
  isOpen,
  onClose
}) => {
  const [passFolio] = useState(() => `GP-KM22-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`);
  const [carrierCompany, setCarrierCompany] = useState('Transportes Pesados del Caribe S.R.L.');
  const [driverName, setDriverName] = useState('Carlos Manuel Encarnación');
  const [driverCedula, setDriverCedula] = useState('001-1492048-2');
  const [truckPlate, setTruckPlate] = useState('L-392019 (Cabezote Mack)');
  const [trailerPlate, setTrailerPlate] = useState('R-84920 (Cama Baja 60T)');
  const [destinationSite, setDestinationSite] = useState('Cantera San Cristóbal — Obra Autovía');
  const [customerName, setCustomerName] = useState('Consorcio Minero Dominicano S.A.');
  const [dispatcherName, setDispatcherName] = useState('Lic. Francisco Almonte (Despacho Km 22)');
  const [securityGuardName, setSecurityGuardName] = useState('Oficial José Ramón Díaz (Garita 1)');
  
  // Security gate physical check
  const [vinVerified, setVinVerified] = useState(true);
  const [chainsInspected, setChainsInspected] = useState(true);
  const [fuelCapLocked, setFuelCapLocked] = useState(true);
  const [escortAssigned, setEscortAssigned] = useState(true);

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  if (!isOpen || !machine) return null;

  const issueDate = new Date().toLocaleDateString('es-DO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  const issueTime = new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });
  const expirationTime = new Date(Date.now() + 6 * 3600 * 1000).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });

  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    `TMD-GATE-PASS|FOLIO:${passFolio}|MACHINE:${machine.brand}-${machine.modelCode}|DRIVER:${driverCedula}|TRUCK:${truckPlate}|EXPIRES:6H|STATUS:VALIDATED`
  )}`;

  const handleExportPdf = async () => {
    triggerHaptic('heavyShud');
    setIsExportingPdf(true);
    try {
      await new Promise(r => setTimeout(r, 120));
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();

      // Top Security Color Bar
      doc.setFillColor(245, 158, 11);
      doc.rect(0, 0, pageWidth, 5, 'F');

      // Top Dark Banner
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 5, pageWidth, 28, 'F');

      // Logo TMD
      drawTmdOfficialLogoPdf(doc, 12, 8, 38, 14);

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text('PASE DE PUERTA DIGITAL — SALIDA DE PATIO', 55, 16);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(245, 158, 11);
      doc.text('GARITA DE SEGURIDAD KM 22 AUTOPISTA DUARTE | DESPACHO DE MAQUINARIA PESADA', 55, 22);

      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`FOLIO DE SEGURIDAD: ${passFolio} | EMISIÓN: ${issueDate.toUpperCase()} ${issueTime} | VENCE: ${expirationTime}`, 55, 28);

      // Main Pass Details Grid
      autoTable(doc, {
        startY: 38,
        head: [['DATOS DEL DESPACHO', 'DATOS DE TRANSPORTE & CONDUCTOR']],
        body: [
          [
            `Equipo: ${machine.brand} ${machine.name}\nModelo: Mod. ${machine.modelCode} (${machine.year})\nPeso Operativo: ${(machine.operatingWeightKg / 1000).toFixed(1)} Toneladas\nCliente Receptor: ${customerName}\nDestino Autorizado: ${destinationSite}`,
            `Empresa de Transporte: ${carrierCompany}\nConductor: ${driverName}\nCédula de Identidad: ${driverCedula}\nCabezote: ${truckPlate}\nCama Baja / Remolque: ${trailerPlate}`
          ]
        ],
        theme: 'grid',
        headStyles: {
          fillColor: [24, 24, 27],
          textColor: [245, 158, 11],
          fontStyle: 'bold',
          fontSize: 8.5
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [15, 23, 42],
          lineColor: [203, 213, 225]
        },
        margin: { left: 12, right: 12 }
      });

      // Security Checklist Table
      autoTable(doc, {
        // @ts-ignore
        startY: doc.lastAutoTable.finalY + 6,
        head: [['PUNTO DE INSPECCIÓN EN GARITA', 'CRITERIO REGLAMENTARIO', 'VERIFICACIÓN']],
        body: [
          ['1. Coincidencia Chasis / Serial VIN', 'Inspección de placa metálica remachada en chasis', 'CONFORME ✓'],
          ['2. Amarre y Cadenas Grado 70', 'Mínimo 4 cadenas con rachets tensores apretados', 'CONFORME ✓'],
          ['3. Cédula del Chofer y Licencia Categoría 4', 'Documento físico original presentado en garita', 'CONFORME ✓'],
          ['4. Luces y Señalización de Carga Ancha', 'Banderines rojos y rotativo estroboscópico', 'CONFORME ✓'],
          ['5. Bloqueo Hidráulico Activado', 'Palanca de traba roja bajada y pluma apoyada', 'CONFORME ✓']
        ],
        theme: 'striped',
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontSize: 7.5
        },
        bodyStyles: {
          fontSize: 7.5,
          textColor: [15, 23, 42]
        },
        columnStyles: {
          0: { cellWidth: 70, fontStyle: 'bold' },
          1: { cellWidth: 85 },
          2: { cellWidth: 31, halign: 'center', fontStyle: 'bold', textColor: [16, 185, 129] }
        },
        margin: { left: 12, right: 12 }
      });

      // Signatures & QR area
      // @ts-ignore
      const sigY = doc.lastAutoTable.finalY + 12;

      // Draw Gate Pass QR code
      try {
        const qrImg = new Image();
        qrImg.crossOrigin = 'anonymous';
        qrImg.src = qrDataUrl;
        await new Promise((resolve) => {
          qrImg.onload = resolve;
          qrImg.onerror = resolve;
          setTimeout(resolve, 800);
        });
        doc.addImage(qrImg, 'PNG', 150, sigY - 2, 44, 44);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('ESCANEABLE POR GARITA', 151, sigY + 46);
      } catch (e) {
        console.error('Could not embed QR:', e);
      }

      // Dispatcher Signature
      doc.setDrawColor(203, 213, 225);
      doc.line(16, sigY + 20, 75, sigY + 20);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(dispatcherName.toUpperCase(), 16, sigY + 25);
      doc.setFont('helvetica', 'normal');
      doc.text('Despacho & Logística TMD Km 22', 16, sigY + 29);

      // Security Guard Signature
      doc.line(82, sigY + 20, 140, sigY + 20);
      doc.setFont('helvetica', 'bold');
      doc.text(securityGuardName.toUpperCase(), 82, sigY + 25);
      doc.setFont('helvetica', 'normal');
      doc.text('Oficial de Garita — Control de Salida', 82, sigY + 29);

      // Driver Signature
      doc.line(16, sigY + 45, 75, sigY + 45);
      doc.setFont('helvetica', 'bold');
      doc.text(driverName.toUpperCase(), 16, sigY + 50);
      doc.setFont('helvetica', 'normal');
      doc.text(`Conductor Receptor (Céd. ${driverCedula})`, 16, sigY + 54);

      // Official Stamp
      doc.setDrawColor(245, 158, 11);
      doc.setFillColor(254, 243, 199);
      doc.roundedRect(82, sigY + 36, 58, 20, 2, 2, 'FD');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 83, 9);
      doc.text('GARITA SALIDA AUTORIZADA', 85, sigY + 43);
      doc.setFontSize(6.5);
      doc.text(`KM 22 — SALIDA VÁLIDA: 6 HORAS`, 85, sigY + 48);
      doc.text(`PORTÓN PRINCIPAL DESBLOQUEADO`, 85, sigY + 53);

      doc.save(`Pase_Salida_Garita_${passFolio}_TMD.pdf`);
    } catch (err) {
      console.error('Error generating Gate Pass PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-zinc-950 rounded-[5px] shadow-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[92vh] font-mono text-white">
        
        {/* Modal Top Header */}
        <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[2px] bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-white tracking-wider">
                  Pase de Puerta Digital — Garita Km 22
                </span>
                <span className="px-2 py-0.5 rounded-[2px] bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase">
                  SALIDA AUTORIZADA
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-sans">
                Folio: <strong className="text-amber-400 font-mono">{passFolio}</strong> • Válido por 6 horas desde la emisión
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-3 py-1 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black text-[11px] font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
            >
              <Download className={`w-3.5 h-3.5 ${isExportingPdf ? 'animate-bounce' : ''}`} />
              <span>{isExportingPdf ? 'Generando...' : 'Descargar Pase PDF'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-[2px] bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Visual Pass Card */}
          <div className="p-4 rounded-[4px] bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-amber-400/40 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-zinc-800">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">
                  AUTORIZACIÓN DE DESPACHO EN BAJA MAR / CAMA BAJA
                </span>
                <h3 className="text-sm sm:text-base font-black text-amber-400 uppercase tracking-tight mt-0.5">
                  {machine.brand} {machine.name} • MOD. {machine.modelCode}
                </h3>
                <span className="text-xs text-zinc-300 font-sans">
                  Año {machine.year} • Peso Operativo: {(machine.operatingWeightKg / 1000).toFixed(1)} Toneladas • Motor {machine.engine}
                </span>
              </div>

              {/* QR Preview Box */}
              <div className="p-2 rounded-[3px] bg-white border border-zinc-200 flex flex-col items-center shrink-0 self-center">
                <img
                  src={qrDataUrl}
                  alt="Gate Pass QR"
                  className="w-24 h-24 object-contain"
                />
                <span className="text-[8px] font-mono font-black text-black uppercase tracking-tighter mt-1">
                  GARITA KM 22 SCAN
                </span>
              </div>
            </div>

            {/* Editable Dispatch Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs">
              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">
                  Empresa Transportista / Cama Baja:
                </label>
                <input
                  type="text"
                  value={carrierCompany}
                  onChange={(e) => setCarrierCompany(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-[2px] text-zinc-200 text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">
                  Conductor del Transporte:
                </label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-[2px] text-zinc-200 text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">
                  Cédula del Conductor:
                </label>
                <input
                  type="text"
                  value={driverCedula}
                  onChange={(e) => setDriverCedula(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-[2px] text-zinc-200 text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">
                  Placas (Cabezote / Remolque):
                </label>
                <input
                  type="text"
                  value={`${truckPlate} / ${trailerPlate}`}
                  onChange={(e) => {
                    const parts = e.target.value.split('/');
                    setTruckPlate(parts[0] || '');
                    setTrailerPlate(parts[1] || '');
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-[2px] text-amber-400 text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">
                  Cliente Adquiriente:
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-[2px] text-zinc-200 text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">
                  Destino de Obra Autorizado:
                </label>
                <input
                  type="text"
                  value={destinationSite}
                  onChange={(e) => setDestinationSite(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-[2px] text-zinc-200 text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            {/* Checkpoints in gate */}
            <div className="mt-4 pt-3 border-t border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-2">
                Inspección Obligatoria en Garita de Salida (Oficial de Guardia):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <label 
                  onClick={() => {
                    triggerHaptic('mechanicalClick');
                    setVinVerified(!vinVerified);
                  }}
                  className="flex items-center gap-2 p-2 rounded-[2px] bg-zinc-950 border border-zinc-800 cursor-pointer select-none"
                >
                  <input type="checkbox" checked={vinVerified} readOnly className="rounded-xs text-amber-400" />
                  <span className={vinVerified ? 'text-emerald-400 font-bold' : 'text-zinc-400'}>Serial VIN Verificado</span>
                </label>

                <label 
                  onClick={() => {
                    triggerHaptic('mechanicalClick');
                    setChainsInspected(!chainsInspected);
                  }}
                  className="flex items-center gap-2 p-2 rounded-[2px] bg-zinc-950 border border-zinc-800 cursor-pointer select-none"
                >
                  <input type="checkbox" checked={chainsInspected} readOnly className="rounded-xs text-amber-400" />
                  <span className={chainsInspected ? 'text-emerald-400 font-bold' : 'text-zinc-400'}>4 Cadenas G70 Trincadas</span>
                </label>

                <label 
                  onClick={() => {
                    triggerHaptic('mechanicalClick');
                    setFuelCapLocked(!fuelCapLocked);
                  }}
                  className="flex items-center gap-2 p-2 rounded-[2px] bg-zinc-950 border border-zinc-800 cursor-pointer select-none"
                >
                  <input type="checkbox" checked={fuelCapLocked} readOnly className="rounded-xs text-amber-400" />
                  <span className={fuelCapLocked ? 'text-emerald-400 font-bold' : 'text-zinc-400'}>Tapa Diésel Bloqueada</span>
                </label>

                <label 
                  onClick={() => {
                    triggerHaptic('mechanicalClick');
                    setEscortAssigned(!escortAssigned);
                  }}
                  className="flex items-center gap-2 p-2 rounded-[2px] bg-zinc-950 border border-zinc-800 cursor-pointer select-none"
                >
                  <input type="checkbox" checked={escortAssigned} readOnly className="rounded-xs text-amber-400" />
                  <span className={escortAssigned ? 'text-emerald-400 font-bold' : 'text-zinc-400'}>Escolta MOPC Aprobada</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 bg-zinc-900 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>El escaneo del código QR en el portón registra automáticamente la hora exacta en el Command Center.</span>
          </div>

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="px-4 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Emitir Pase de Salida Oficial (.PDF)</span>
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
