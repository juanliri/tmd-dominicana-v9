import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  FileStack, 
  Download, 
  ShieldCheck, 
  Building2, 
  Check, 
  Calendar, 
  Layers, 
  FileText, 
  Sparkles,
  CheckSquare,
  Square
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Machine } from '../../types';
import { MACHINES_DATA } from '../../data/catalog';
import { drawTmdOfficialLogoPdf } from '../../utils/pdfGenerator';
import { triggerHaptic } from '../../utils/haptics';

interface TenderDossierExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedMachineIds?: string[];
}

export const TenderDossierExporterModal: React.FC<TenderDossierExporterModalProps> = ({
  isOpen,
  onClose,
  initialSelectedMachineIds = []
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (initialSelectedMachineIds.length > 0) return initialSelectedMachineIds;
    // Default select first 3 machines
    return MACHINES_DATA.slice(0, 3).map(m => m.id);
  });

  const [tenderRef, setTenderRef] = useState('MOPC-CCC-LPN-2026-0084');
  const [tenderTitle, setTenderTitle] = useState('Suministro de Maquinaria Pesada para Infraestructura Vial');
  const [contractorName, setContractorName] = useState('Consorcio Constructor Metropolitano S.R.L.');
  const [contractorRnc, setContractorRnc] = useState('1-31-84920-4');
  const [entityName, setEntityName] = useState('Ministerio de Obras Públicas y Comunicaciones (MOPC)');
  const [includeIsoCert, setIncludeIsoCert] = useState(true);
  const [includeWarrantyLetter, setIncludeWarrantyLetter] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const toggleSelectMachine = (id: string) => {
    triggerHaptic('mechanicalClick');
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    triggerHaptic('mechanicalClick');
    if (selectedIds.length === MACHINES_DATA.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(MACHINES_DATA.map(m => m.id));
    }
  };

  const selectedMachines = MACHINES_DATA.filter(m => selectedIds.includes(m.id));

  const handleExportDossierPdf = async () => {
    triggerHaptic('heavyShud');
    setIsExporting(true);
    try {
      await new Promise(r => setTimeout(r, 150));
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const currentDate = new Date().toLocaleDateString('es-DO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // ==========================================
      // PAGE 1: DOSSIER COVER PAGE
      // ==========================================
      doc.setFillColor(15, 23, 42); // Dark Navy Slate
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Golden Accent Stripe
      doc.setFillColor(245, 158, 11);
      doc.rect(0, 0, pageWidth, 6, 'F');
      doc.rect(0, pageHeight - 6, pageWidth, 6, 'F');

      // TMD Official Logo centered
      drawTmdOfficialLogoPdf(doc, (pageWidth - 70) / 2, 45, 70, 24);

      // Main Titles
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.text('DOSSIER TÉCNICO DE MAQUINARIA', pageWidth / 2, 90, { align: 'center' });

      doc.setFontSize(11);
      doc.setTextColor(245, 158, 11);
      doc.text('HOMOLOGACIÓN TÉCNICA PARA COMPRAS & LICITACIONES PÚBLICAS', pageWidth / 2, 98, { align: 'center' });

      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text('REPÚBLICA DOMINICANA — LEY 340-06 DE COMPRAS Y CONTRATACIONES', pageWidth / 2, 105, { align: 'center' });

      // Tender Box in Cover
      doc.setFillColor(30, 41, 59);
      doc.setDrawColor(245, 158, 11);
      doc.setLineWidth(0.5);
      doc.roundedRect(25, 125, pageWidth - 50, 68, 3, 3, 'FD');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(245, 158, 11);
      doc.text('REFERENCIA OFICIAL DE LA LICITACIÓN:', 32, 134);

      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text(tenderRef, 32, 142);

      doc.setFontSize(8.5);
      doc.setTextColor(226, 232, 240);
      doc.text(`Objeto: ${tenderTitle}`, 32, 150);
      doc.text(`Entidad Contratante: ${entityName}`, 32, 157);
      doc.text(`Consorcio Oferente: ${contractorName}`, 32, 164);
      doc.text(`RNC del Oferente: ${contractorRnc}`, 32, 171);
      doc.text(`Equipos Incluidos: ${selectedMachines.length} Unidades Certificadas TMD`, 32, 178);
      doc.text(`Fecha de Presentación: ${currentDate.toUpperCase()}`, 32, 185);

      // Bottom Cover Notice
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('Distribuido y respaldado por TMD Dominicana S.R.L. | RNC 1-32-09482-1', pageWidth / 2, pageHeight - 16, { align: 'center' });
      doc.text('Sede Central: Km 22 Autopista Duarte, Santo Domingo Oeste | Tel: 809-560-8200', pageWidth / 2, pageHeight - 11, { align: 'center' });

      // ==========================================
      // PAGE 2: CONSOLIDATED FLEET TABLE
      // ==========================================
      doc.addPage();

      // Top Accent
      doc.setFillColor(245, 158, 11);
      doc.rect(0, 0, pageWidth, 4, 'F');

      // Header Banner
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 4, pageWidth, 22, 'F');
      drawTmdOfficialLogoPdf(doc, 12, 7, 34, 12);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text('MATRIZ CONSOLIDADA DE ESPECIFICACIONES TÉCNICAS', 50, 14);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(245, 158, 11);
      doc.text(`LICITACIÓN: ${tenderRef} | OFERENTE: ${contractorName.toUpperCase()}`, 50, 20);

      // Consolidated table rows
      const matrixRows = selectedMachines.map((m, idx) => [
        (idx + 1).toString(),
        m.name,
        m.brand,
        m.modelCode,
        m.engine,
        `${m.powerHp} HP`,
        `${(m.operatingWeightKg / 1000).toFixed(1)} T`,
        m.bucketCapacityM3 ? `${m.bucketCapacityM3} m³` : 'N/A',
        `${m.warrantyMonths || 36} Meses`
      ]);

      autoTable(doc, {
        startY: 32,
        head: [['#', 'EQUIPO OFERTADO', 'MARCA', 'MODELO', 'MOTOR CERTIFICADO', 'POTENCIA', 'PESO OP.', 'CAP. BALDE', 'GARANTÍA']],
        body: matrixRows,
        theme: 'striped',
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [245, 158, 11],
          fontStyle: 'bold',
          fontSize: 7.5
        },
        bodyStyles: {
          fontSize: 7.2,
          textColor: [15, 23, 42]
        },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 42, fontStyle: 'bold' },
          2: { cellWidth: 20 },
          3: { cellWidth: 22, fontStyle: 'bold' },
          4: { cellWidth: 38 },
          5: { cellWidth: 18, halign: 'center' },
          6: { cellWidth: 16, halign: 'center' },
          7: { cellWidth: 18, halign: 'center' },
          8: { cellWidth: 18, halign: 'center', fontStyle: 'bold' }
        },
        margin: { left: 12, right: 12 }
      });

      // @ts-ignore
      let curY = doc.lastAutoTable.finalY + 8;

      // Manufacturer Authorized Letter Statement
      if (includeWarrantyLetter) {
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(12, curY, pageWidth - 24, 46, 2, 2, 'FD');

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('CARTA DE RESPALDO Y DISTRIBUCIÓN OFICIAL DE FÁBRICA — TMD DOMINICANA:', 16, curY + 7);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.setTextColor(51, 65, 85);
        doc.text('Por medio del presente documento, TMD Dominicana S.R.L. certifica que todos los equipos descritos en este dossier son unidades', 16, curY + 14);
        doc.text('nuevas de fábrica (año 2026), importadas legalmente bajo el régimen aduanero de la República Dominicana, y cuentan con el suministro', 16, curY + 19);
        doc.text('garantizado de repuestos originales OEM y servicio técnico durante un mínimo de 10 años en el territorio nacional.', 16, curY + 24);
        doc.text('Asimismo, garantizamos la disponibilidad de auxilio técnico móvil en obra en un plazo máximo de 24 a 48 horas en cualquier provincia.', 16, curY + 29);

        // Sign line
        doc.setDrawColor(203, 213, 225);
        doc.line(16, curY + 40, 75, curY + 40);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');
        doc.text('ING. GERENCIA COMERCIAL & TALLER', 16, curY + 43);
        doc.text('TMD Dominicana S.R.L. — Km 22 Autopista Duarte', 16, curY + 45.5);

        curY += 52;
      }

      // Compliance Badges Box
      if (includeIsoCert && curY < 235) {
        doc.setFillColor(254, 243, 199);
        doc.setDrawColor(245, 158, 11);
        doc.roundedRect(12, curY, pageWidth - 24, 24, 2, 2, 'FD');

        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(180, 83, 9);
        doc.text('ESTÁNDARES INTERNACIONALES DE FABRICACIÓN Y SEGURIDAD CERTIFICADOS:', 16, curY + 6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.8);
        doc.setTextColor(30, 41, 59);
        doc.text('• ISO 9001:2015 (Gestión de Calidad) & ISO 14001:2015 (Gestión Ambiental de Fábrica)', 16, curY + 11);
        doc.text('• Certificación de Estructura Antivuelco Cabina ROPS (ISO 3471) y Protección contra Caída de Objetos FOPS (ISO 3449)', 16, curY + 15);
        doc.text('• Cumplimiento de Emisiones de Escape según Directivas EPA Tier 2 / Tier 3 y homologación aduanera dominicana INDOCAL', 16, curY + 19);
      }

      doc.save(`Dossier_Licitacion_${tenderRef.replace(/[^a-zA-Z0-9]/g, '_')}_TMD.pdf`);
    } catch (err) {
      console.error('Error generating tender dossier:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-zinc-950 rounded-[5px] shadow-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[92vh] font-mono text-white">
        
        {/* Modal Top Header */}
        <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[2px] bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <FileStack className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-white tracking-wider">
                  Exportador de Fichas Técnicas para Licitaciones Públicas
                </span>
                <span className="px-2 py-0.5 rounded-[2px] bg-amber-400 text-black text-[10px] font-black uppercase">
                  Ley 340-06 RD
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-sans">
                Genera un Dossier Técnico consolidado con portada oficial, matriz de especificaciones y cartas de garantía de fábrica.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportDossierPdf}
              disabled={isExporting || selectedIds.length === 0}
              className="px-3 py-1 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black text-[11px] font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
            >
              <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'Compilando Dossier...' : `Generar Dossier (${selectedIds.length})`}</span>
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

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          
          {/* Tender Metadata Inputs */}
          <div className="p-3.5 rounded-[3px] bg-zinc-900 border border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">
                No. de Referencia / Licitación Pública:
              </label>
              <input
                type="text"
                value={tenderRef}
                onChange={(e) => setTenderRef(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-[2px] text-amber-400 font-bold text-xs focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">
                Entidad Pública o Privada Convocante:
              </label>
              <input
                type="text"
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-[2px] text-zinc-200 text-xs focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">
                Nombre del Consorcio / Empresa Ofertante:
              </label>
              <input
                type="text"
                value={contractorName}
                onChange={(e) => setContractorName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-[2px] text-zinc-200 text-xs focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">
                RNC del Ofertante:
              </label>
              <input
                type="text"
                value={contractorRnc}
                onChange={(e) => setContractorRnc(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-[2px] text-zinc-200 text-xs focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">
                Objeto / Título del Proceso de Compras:
              </label>
              <input
                type="text"
                value={tenderTitle}
                onChange={(e) => setTenderTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-[2px] text-zinc-200 text-xs focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          {/* Machine Selection Grid */}
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
              <span className="text-xs font-bold uppercase text-white tracking-wider">
                Seleccionar Maquinaria a Incluir ({selectedIds.length} seleccionadas)
              </span>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[10px] font-bold text-amber-400 hover:text-amber-300 uppercase cursor-pointer"
              >
                {selectedIds.length === MACHINES_DATA.length ? 'Deseleccionar Todos' : 'Seleccionar Todo el Catálogo'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MACHINES_DATA.map((machine) => {
                const isSelected = selectedIds.includes(machine.id);
                return (
                  <div
                    key={machine.id}
                    onClick={() => toggleSelectMachine(machine.id)}
                    className={`p-2.5 rounded-[3px] border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                      isSelected
                        ? 'bg-zinc-900 border-amber-400 ring-1 ring-amber-400/40'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-5 h-5 rounded-[2px] bg-zinc-950 border border-zinc-700 flex items-center justify-center shrink-0">
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[10px] font-bold text-amber-400 uppercase">
                            {machine.brand}
                          </span>
                          <span className="text-xs font-bold text-white truncate uppercase">
                            {machine.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-sans block truncate">
                          Mod. {machine.modelCode} • {machine.powerHp} HP • {(machine.operatingWeightKg / 1000).toFixed(1)}T
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                      {machine.category}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional Options */}
          <div className="p-3 rounded-[3px] bg-zinc-900/40 border border-zinc-800 flex flex-wrap items-center gap-4 text-xs">
            <label 
              onClick={() => {
                triggerHaptic('mechanicalClick');
                setIncludeWarrantyLetter(!includeWarrantyLetter);
              }}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <input type="checkbox" checked={includeWarrantyLetter} readOnly className="rounded-xs text-amber-400" />
              <span className={includeWarrantyLetter ? 'text-white font-bold' : 'text-zinc-400'}>
                Incluir Carta de Respaldo Oficial del Distribuidor TMD (10 Años Repuestos)
              </span>
            </label>

            <label 
              onClick={() => {
                triggerHaptic('mechanicalClick');
                setIncludeIsoCert(!includeIsoCert);
              }}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <input type="checkbox" checked={includeIsoCert} readOnly className="rounded-xs text-amber-400" />
              <span className={includeIsoCert ? 'text-white font-bold' : 'text-zinc-400'}>
                Incluir Certificaciones de Seguridad ISO 9001 / ROPS FOPS Nivel II
              </span>
            </label>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 bg-zinc-900 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
            <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Formato homologado según los pliegos de condiciones del Estado Dominicano y bancos multilaterales (BID / Banco Mundial).</span>
          </div>

          <button
            type="button"
            onClick={handleExportDossierPdf}
            disabled={isExporting || selectedIds.length === 0}
            className="px-4 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Compilar y Descargar Dossier PDF</span>
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
