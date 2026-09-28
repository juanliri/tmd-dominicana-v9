import React, { useState, useMemo } from 'react';
import {
  Wrench,
  ShieldCheck,
  AlertTriangle,
  Clock,
  User,
  CheckCircle2,
  Calendar,
  Search,
  Filter,
  Plus,
  ArrowRight,
  RotateCcw,
  Download,
  X,
  FileCheck,
  Scale,
  Gauge,
  Cpu,
  Layers
} from 'lucide-react';

export interface CalibratedTool {
  id: string;
  code: string;
  name: string;
  category: 'torque' | 'pressure' | 'hydraulic_puller' | 'electronic_diagnostic' | 'fluid_optical';
  specifications: string;
  brand: string;
  model: string;
  serialNumber: string;
  status: 'available' | 'on_loan' | 'calibration_due' | 'maintenance';
  lastCalibrationDate: string;
  nextCalibrationDate: string;
  calibrationCertificate: string;
  certifiedLab: string;
  currentLoan?: {
    technicianName: string;
    technicianId: string;
    workOrderNumber: string;
    equipmentTarget: string;
    borrowedAt: string;
    expectedReturn: string;
  };
}

const INITIAL_TOOLS: CalibratedTool[] = [
  {
    id: 'TOOL-001',
    code: 'TRQ-1000-01',
    name: 'Torquímetro de Quiebre Pesado 1,000 Nm',
    category: 'torque',
    specifications: 'Rango 200 - 1,000 Nm | Cuadrante 1" | Precisión ±3%',
    brand: 'Stahlwille / Snap-on',
    model: 'MANOSKOP 730N/100',
    serialNumber: 'SN-STH-994821',
    status: 'on_loan',
    lastCalibrationDate: '2026-04-10',
    nextCalibrationDate: '2027-04-10',
    calibrationCertificate: 'INDOCAL-CAL-2026-8819',
    certifiedLab: 'INDOCAL Metrología Nacional',
    currentLoan: {
      technicianName: 'Carlos Peña',
      technicianId: 'TECH-004',
      workOrderNumber: 'OT-84920',
      equipmentTarget: 'LiuGong 922E (Perno de Corona de Giro)',
      borrowedAt: '2026-09-28 07:45',
      expectedReturn: '2026-09-28 17:00'
    }
  },
  {
    id: 'TOOL-002',
    code: 'MAN-600-02',
    name: 'Manómetro Digital Hidráulico 600 Bar con Datalogger',
    category: 'pressure',
    specifications: '0 - 600 Bar (0-8,700 PSI) | Transductor cerámico J1939 | Acople Rápido M16x2',
    brand: 'Parker / Stauff',
    model: 'Serviceman Plus SP3',
    serialNumber: 'SN-PTC-440182',
    status: 'available',
    lastCalibrationDate: '2026-06-15',
    nextCalibrationDate: '2027-06-15',
    calibrationCertificate: 'METROCAR-CAL-2026-4412',
    certifiedLab: 'Metrología del Caribe S.R.L.',
  },
  {
    id: 'TOOL-003',
    code: 'EXT-050-01',
    name: 'Extractor Hidráulico Universal 50 Toneladas',
    category: 'hydraulic_puller',
    specifications: 'Capacidad 50 Tn | Bomba Neumohidráulica 700 Bar | Carrera 159 mm',
    brand: 'Enerpac',
    model: 'BPH-502 Heavy Duty',
    serialNumber: 'SN-ENP-781033',
    status: 'available',
    lastCalibrationDate: '2026-01-20',
    nextCalibrationDate: '2027-01-20',
    calibrationCertificate: 'INDOCAL-PRES-2026-1033',
    certifiedLab: 'INDOCAL Metrología Nacional',
  },
  {
    id: 'TOOL-004',
    code: 'CAN-DIAG-01',
    name: 'Interfaz de Diagnóstico J1939 / CAN-Bus Inline 7',
    category: 'electronic_diagnostic',
    specifications: 'Protocolos RP1210C, J1939, J1708, ISO 15765 | Bluetooth & USB Militar',
    brand: 'Cummins / LiuGong Diagnostic Link',
    model: 'Inline 7 Wireless Edition',
    serialNumber: 'SN-CUM-INL7-0049',
    status: 'on_loan',
    lastCalibrationDate: '2026-08-01',
    nextCalibrationDate: '2027-08-01',
    calibrationCertificate: 'OEM-VERIF-CUM-8921',
    certifiedLab: 'LiuGong OEM Diagnostics Division',
    currentLoan: {
      technicianName: 'Miguel Rosario',
      technicianId: 'TECH-002',
      workOrderNumber: 'OT-85012',
      equipmentTarget: 'JCB 426ZX (Diagnóstico ECU Transmisión ZF)',
      borrowedAt: '2026-09-28 09:15',
      expectedReturn: '2026-09-28 13:00'
    }
  },
  {
    id: 'TOOL-005',
    code: 'OPT-DEF-01',
    name: 'Refractómetro Digital Clínico DEF (Urea) & Refrigerante OAT',
    category: 'fluid_optical',
    specifications: 'Escala DEF 0-50% Urea ±0.1% | Glicol -50°C | Compensación Temp Automática',
    brand: 'Misco Palm Abbe',
    model: 'PA202x Heavy Fleet Edition',
    serialNumber: 'SN-MSC-90214',
    status: 'calibration_due',
    lastCalibrationDate: '2025-09-10',
    nextCalibrationDate: '2026-09-10',
    calibrationCertificate: 'INDOCAL-OPT-2025-3004',
    certifiedLab: 'INDOCAL Metrología Nacional',
  },
  {
    id: 'TOOL-006',
    code: 'TRQ-400-02',
    name: 'Torquímetro Digital de Ángulo & Par 400 Nm',
    category: 'torque',
    specifications: 'Rango 40 - 400 Nm + Giro Angular 360° | Cuadrante 3/4" | Memoria 50 lecturas',
    brand: 'Snap-on TechAngle',
    model: 'ATECH3FR400',
    serialNumber: 'SN-SNP-55912',
    status: 'available',
    lastCalibrationDate: '2026-05-22',
    nextCalibrationDate: '2027-05-22',
    calibrationCertificate: 'SNAPON-CAL-2026-1184',
    certifiedLab: 'Snap-on Certified Calibration Lab USA',
  }
];

interface CalibratedToolInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalibratedToolInventoryModal: React.FC<CalibratedToolInventoryModalProps> = ({
  isOpen,
  onClose
}) => {
  const [tools, setTools] = useState<CalibratedTool[]>(INITIAL_TOOLS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Checkout Loan Form State
  const [selectedToolForLoan, setSelectedToolForLoan] = useState<CalibratedTool | null>(null);
  const [techName, setTechName] = useState('Carlos Peña');
  const [workOrder, setWorkOrder] = useState('OT-85100');
  const [targetEquipment, setTargetEquipment] = useState('LiuGong 856H #EQ-108');
  const [expectedHours, setExpectedHours] = useState('4');

  // Filter tools
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || tool.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || tool.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [tools, searchQuery, categoryFilter, statusFilter]);

  // Handle Tool Loan Checkout
  const handleCheckoutLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToolForLoan) return;

    const updated = tools.map(t => {
      if (t.id === selectedToolForLoan.id) {
        return {
          ...t,
          status: 'on_loan' as const,
          currentLoan: {
            technicianName: techName,
            technicianId: `TECH-00${Math.floor(Math.random() * 5) + 1}`,
            workOrderNumber: workOrder,
            equipmentTarget: targetEquipment,
            borrowedAt: new Date().toLocaleDateString('es-DO', { hour: '2-digit', minute: '2-digit' }),
            expectedReturn: `En ${expectedHours} horas (${new Date(Date.now() + Number(expectedHours) * 3600000).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })})`
          }
        };
      }
      return t;
    });

    setTools(updated);
    setSelectedToolForLoan(null);
  };

  // Handle Tool Return
  const handleReturnTool = (toolId: string) => {
    const updated = tools.map(t => {
      if (t.id === toolId) {
        return {
          ...t,
          status: 'available' as const,
          currentLoan: undefined
        };
      }
      return t;
    });
    setTools(updated);
  };

  // Export ISO 9001 Bitácora
  const handleExportIsoLog = () => {
    const headers = 'CODIGO,HERRAMIENTA,MARCA_MODELO,SERIAL,ESTADO,ULTIMA_CALIBRACION,PROXIMA_CALIBRACION,CERTIFICADO,LABORATORIO,PRESTADO_A,ORDEN_TRABAJO\n';
    const rows = tools.map(t => 
      `"${t.code}","${t.name}","${t.brand} ${t.model}","${t.serialNumber}","${t.status}","${t.lastCalibrationDate}","${t.nextCalibrationDate}","${t.calibrationCertificate}","${t.certifiedLab}","${t.currentLoan?.technicianName || 'EN_ALMACEN'}","${t.currentLoan?.workOrderNumber || 'N/A'}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TMD_CONTROL_HERRAMIENTAS_CALIBRADAS_ISO9001_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-5xl max-h-[92vh] flex flex-col bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl text-zinc-200 overflow-hidden font-mono"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400/10 border border-amber-400/30 rounded-[3px] text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-amber-400 text-black uppercase tracking-wider">
                  ISO 9001 / INDOCAL
                </span>
                <span className="text-xs text-zinc-400 font-sans">
                  Gestión de Metrología & Taller Km 22
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-white mt-0.5">
                Control de Herramientas Especiales & Calibradas
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportIsoLog}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase transition-all cursor-pointer border border-zinc-700"
              title="Descargar Bitácora Oficial en Formato CSV / Excel"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Exportar Bitácora</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="p-4 bg-zinc-900/40 border-b border-zinc-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por código, torquímetro, manómetro, serial..."
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-[2px] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-[2px] text-xs text-zinc-300 focus:outline-none focus:border-amber-400/50 cursor-pointer"
            >
              <option value="all">Todas las Categorías</option>
              <option value="torque">Torquímetros de Alto Rango</option>
              <option value="pressure">Presión Hidráulica (600 Bar)</option>
              <option value="hydraulic_puller">Extractores 50 Tn</option>
              <option value="electronic_diagnostic">CAN-Bus & Diagnóstico</option>
              <option value="fluid_optical">Óptica / DEF / Refrigerante</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-[2px] text-xs text-zinc-300 focus:outline-none focus:border-amber-400/50 cursor-pointer"
            >
              <option value="all">Todos los Estados</option>
              <option value="available">Disponibles</option>
              <option value="on_loan">En Préstamo</option>
              <option value="calibration_due">Calibración Vencida</option>
            </select>
          </div>
        </div>

        {/* Content: Tool Cards & Loan Management */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredTools.map(tool => {
              const isAvailable = tool.status === 'available';
              const isOnLoan = tool.status === 'on_loan';
              const isCalibDue = tool.status === 'calibration_due';

              return (
                <div
                  key={tool.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-[3px] p-4 flex flex-col justify-between hover:border-zinc-700 transition-all shadow-sm"
                >
                  <div className="space-y-3">
                    {/* Top Meta & Status Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-zinc-950 border border-zinc-800 text-amber-400">
                        {tool.code}
                      </span>
                      {isAvailable && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> DISPONIBLE
                        </span>
                      )}
                      {isOnLoan && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <Clock className="w-3 h-3" /> EN PRÉSTAMO
                        </span>
                      )}
                      {isCalibDue && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          <AlertTriangle className="w-3 h-3" /> CALIBRACIÓN VENCIDA
                        </span>
                      )}
                    </div>

                    {/* Tool Name & Spec */}
                    <div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">
                        {tool.name}
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-sans mt-0.5 line-clamp-2">
                        {tool.specifications}
                      </p>
                    </div>

                    {/* Hardware Info */}
                    <div className="text-[10px] bg-zinc-950/70 p-2 rounded-[2px] border border-zinc-800/80 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Marca / Modelo:</span>
                        <span className="text-zinc-300 font-bold">{tool.brand} {tool.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Serial Único:</span>
                        <span className="text-zinc-300 font-mono">{tool.serialNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Cert. Calibración:</span>
                        <span className="text-amber-400/90 font-mono">{tool.calibrationCertificate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Próx. Calibración:</span>
                        <span className={isCalibDue ? 'text-rose-400 font-bold' : 'text-zinc-300'}>
                          {tool.nextCalibrationDate}
                        </span>
                      </div>
                    </div>

                    {/* Active Loan Details if checked out */}
                    {isOnLoan && tool.currentLoan && (
                      <div className="text-[11px] bg-amber-400/5 p-2.5 rounded-[2px] border border-amber-400/20 space-y-1 font-sans">
                        <div className="flex items-center gap-1.5 text-amber-400 font-bold font-mono text-[10px] uppercase">
                          <User className="w-3 h-3" /> Técnico Asignado:
                        </div>
                        <div className="text-zinc-200 font-semibold">
                          {tool.currentLoan.technicianName} ({tool.currentLoan.workOrderNumber})
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          Destino: {tool.currentLoan.equipmentTarget}
                        </div>
                        <div className="text-[10px] text-amber-400/80 font-mono">
                          Entrega: {tool.currentLoan.expectedReturn}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Strip */}
                  <div className="pt-3 mt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                    {isAvailable && (
                      <button
                        onClick={() => setSelectedToolForLoan(tool)}
                        className="w-full py-1.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase rounded-[2px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Prestar a Técnico</span>
                      </button>
                    )}

                    {isOnLoan && (
                      <button
                        onClick={() => handleReturnTool(tool.id)}
                        className="w-full py-1.5 bg-zinc-800 hover:bg-emerald-600 hover:text-white text-zinc-200 text-xs font-bold uppercase rounded-[2px] flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-zinc-700"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Registrar Devolución</span>
                      </button>
                    )}

                    {isCalibDue && (
                      <button
                        disabled
                        className="w-full py-1.5 bg-rose-950/40 border border-rose-800/40 text-rose-400 text-xs font-bold uppercase rounded-[2px] flex items-center justify-center gap-1.5 opacity-80 cursor-not-allowed"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Bloqueado por Calibración</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTools.length === 0 && (
            <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800 rounded-[3px] space-y-2">
              <Scale className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-bold text-zinc-400">
                No se encontraron herramientas con los filtros seleccionados.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setCategoryFilter('all'); setStatusFilter('all'); }}
                className="text-xs text-amber-400 hover:underline cursor-pointer"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Modal Sub-Dialog: Checkout Tool to Technician */}
        {selectedToolForLoan && (
          <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <form 
              onSubmit={handleCheckoutLoan}
              className="bg-zinc-900 border border-amber-400/40 rounded-[4px] p-5 w-full max-w-md shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-black uppercase text-white font-display">
                    Formulario de Préstamo de Herramienta
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedToolForLoan(null)}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-2.5 bg-zinc-950 rounded-[2px] border border-zinc-800 text-xs">
                <span className="text-zinc-500 font-mono">Herramienta:</span>
                <p className="text-amber-400 font-bold">{selectedToolForLoan.code} - {selectedToolForLoan.name}</p>
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Certificado: {selectedToolForLoan.calibrationCertificate}</p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1 font-mono uppercase text-[10px]">Técnico Responsable:</label>
                  <select
                    value={techName}
                    onChange={e => setTechName(e.target.value)}
                    className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Carlos Peña">Carlos Peña (Técnico Mecánico Senior)</option>
                    <option value="Miguel Rosario">Miguel Rosario (Especialista Electrónica CAN-Bus)</option>
                    <option value="Junior Alcántara">Junior Alcántara (Técnico Hidráulico)</option>
                    <option value="Dionicio Báez">Dionicio Báez (Taller Móvil 4x4)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-mono uppercase text-[10px]">Orden de Trabajo (OT) / Caso:</label>
                  <input
                    type="text"
                    required
                    value={workOrder}
                    onChange={e => setWorkOrder(e.target.value)}
                    placeholder="Ej. OT-85210"
                    className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-mono uppercase text-[10px]">Equipo Destino / Procedimiento:</label>
                  <input
                    type="text"
                    required
                    value={targetEquipment}
                    onChange={e => setTargetEquipment(e.target.value)}
                    placeholder="Ej. LiuGong 922E #EQ-104 - Ajuste de Orugas"
                    className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-mono uppercase text-[10px]">Tiempo Estimado de Uso:</label>
                  <select
                    value={expectedHours}
                    onChange={e => setExpectedHours(e.target.value)}
                    className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="2">2 Horas (Operación Rápida)</option>
                    <option value="4">4 Horas (Medio Turno)</option>
                    <option value="8">8 Horas (Jornada Completa)</option>
                    <option value="24">24 Horas (Despacho a Mina en Campo)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedToolForLoan(null)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-[2px] text-xs uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-black rounded-[2px] text-xs uppercase shadow-sm cursor-pointer"
                >
                  Confirmar Salida de Almacén
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer ISO 9001 Compliance Stamp */}
        <div className="p-3.5 bg-zinc-950 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Certificación de trazabilidad metrológica INDOCAL / ISO 9001:2015 TMD Taller Km 22.
            </span>
          </div>
          <div className="text-[10px] text-zinc-500 font-mono">
            {tools.filter(t => t.status === 'available').length} disponibles • {tools.filter(t => t.status === 'on_loan').length} prestadas • {tools.filter(t => t.status === 'calibration_due').length} vencidas
          </div>
        </div>
      </div>
    </div>
  );
};
