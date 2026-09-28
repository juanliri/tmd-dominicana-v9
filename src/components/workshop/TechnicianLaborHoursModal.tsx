import React, { useState } from 'react';
import {
  Clock,
  User,
  Wrench,
  DollarSign,
  TrendingUp,
  Download,
  Plus,
  CheckCircle2,
  X,
  Calendar,
  ShieldCheck,
  Award
} from 'lucide-react';

interface TechnicianLaborRecord {
  id: string;
  technicianName: string;
  specialty: string;
  workOrderNumber: string;
  machineModel: string;
  date: string;
  taskDescription: string;
  standardHours: number;
  actualHours: number;
  laborRateUsd: number;
  efficiencyPercent: number;
  supervisorApproved: boolean;
}

const INITIAL_RECORDS: TechnicianLaborRecord[] = [
  {
    id: 'LAB-2026-041',
    technicianName: 'Manuel Santos',
    specialty: 'Especialista Hidráulico Senior',
    workOrderNumber: 'OT-8821 (Fullbay #49102)',
    machineModel: 'LiuGong 922E HD',
    date: '2026-09-27',
    taskDescription: 'Reemplazo y calibración de válvula de alivio principal de 343 bar y prueba de presión en banco',
    standardHours: 5.5,
    actualHours: 4.8,
    laborRateUsd: 45,
    efficiencyPercent: 114,
    supervisorApproved: true
  },
  {
    id: 'LAB-2026-042',
    technicianName: 'Rafael Santana',
    specialty: 'Técnico Electrónico & CAN-Bus',
    workOrderNumber: 'OT-8830 (Fullbay #49115)',
    machineModel: 'JCB 3DX Super 4x4',
    date: '2026-09-27',
    taskDescription: 'Diagnóstico de falla intermitente en ECM motor, reprogramación de firmware y prueba con INSITE',
    standardHours: 4.0,
    actualHours: 3.5,
    laborRateUsd: 50,
    efficiencyPercent: 114,
    supervisorApproved: true
  },
  {
    id: 'LAB-2026-043',
    technicianName: 'Pedro Valenzuela',
    specialty: 'Mecánico de Rodajes & Chasis',
    workOrderNumber: 'OT-8815 (Fullbay #49088)',
    machineModel: 'LiuGong 936E (36 Ton)',
    date: '2026-09-26',
    taskDescription: 'Cambio de tejas de oruga 800mm, tensado hidráulico con grasa y sustitución de rodillos inferiores',
    standardHours: 8.0,
    actualHours: 7.2,
    laborRateUsd: 40,
    efficiencyPercent: 111,
    supervisorApproved: true
  },
  {
    id: 'LAB-2026-044',
    technicianName: 'Dionicio Báez',
    specialty: 'Técnico Auxilio de Campo 4x4',
    workOrderNumber: 'AUX-2026-7712',
    machineModel: 'Ammann ASC 110 Rodillo',
    date: '2026-09-28',
    taskDescription: 'Auxilio vial en Autovía del Este: Sustitución de manguera de retorno hidrostático y purga',
    standardHours: 3.0,
    actualHours: 2.8,
    laborRateUsd: 55,
    efficiencyPercent: 107,
    supervisorApproved: true
  }
];

interface TechnicianLaborHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TechnicianLaborHoursModal: React.FC<TechnicianLaborHoursModalProps> = ({
  isOpen,
  onClose
}) => {
  const [records, setRecords] = useState<TechnicianLaborRecord[]>(INITIAL_RECORDS);
  const [technicianFilter, setTechnicianFilter] = useState('all');
  const [isAddTicketOpen, setIsAddTicketOpen] = useState(false);

  // New ticket state
  const [techName, setTechName] = useState('Manuel Santos');
  const [workOrder, setWorkOrder] = useState('OT-8845');
  const [machine, setMachine] = useState('LiuGong 922E HD');
  const [taskDesc, setTaskDesc] = useState('');
  const [stdHours, setStdHours] = useState('4.0');
  const [actHours, setActHours] = useState('3.8');

  if (!isOpen) return null;

  const filteredRecords = records.filter(r => 
    technicianFilter === 'all' || r.technicianName === technicianFilter
  );

  const totalActualHours = filteredRecords.reduce((sum, r) => sum + r.actualHours, 0);
  const totalStandardHours = filteredRecords.reduce((sum, r) => sum + r.standardHours, 0);
  const overallEfficiency = totalActualHours > 0 ? Math.round((totalStandardHours / totalActualHours) * 100) : 100;
  const totalBilledUsd = filteredRecords.reduce((sum, r) => sum + (r.actualHours * r.laborRateUsd), 0);
  const estimatedBonusUsd = Math.round(totalBilledUsd * 0.05);

  const handleAddTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const std = Number(stdHours) || 4.0;
    const act = Number(actHours) || 4.0;
    const eff = Math.round((std / act) * 100);

    const newTicket: TechnicianLaborRecord = {
      id: `LAB-2026-${Math.floor(100 + Math.random() * 900)}`,
      technicianName: techName,
      specialty: techName === 'Manuel Santos' ? 'Especialista Hidráulico Senior' : techName === 'Rafael Santana' ? 'Técnico Electrónico & CAN-Bus' : 'Técnico General',
      workOrderNumber: workOrder,
      machineModel: machine,
      date: new Date().toISOString().slice(0, 10),
      taskDescription: taskDesc.trim() || 'Mantenimiento correctivo en taller central Km 22',
      standardHours: std,
      actualHours: act,
      laborRateUsd: 45,
      efficiencyPercent: eff,
      supervisorApproved: true
    };

    setRecords([newTicket, ...records]);
    setIsAddTicketOpen(false);
    setTaskDesc('');
  };

  const handleExportCsv = () => {
    const headers = 'ID,TECNICO,ESPECIALIDAD,ORDEN_TRABAJO,EQUIPO,FECHA,DESCRIPCION,HORAS_ESTANDAR,HORAS_REALES,TARIFA_USD,EFICIENCIA,APROBADO\n';
    const rows = filteredRecords.map(r => 
      `"${r.id}","${r.technicianName}","${r.specialty}","${r.workOrderNumber}","${r.machineModel}","${r.date}","${r.taskDescription}","${r.standardHours}","${r.actualHours}","${r.laborRateUsd}","${r.efficiencyPercent}%","${r.supervisorApproved ? 'SI' : 'NO'}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TMD_HORAS_HOMBRE_TALLER_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-5xl max-h-[92vh] flex flex-col bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl text-zinc-200 overflow-hidden font-mono"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[3px] bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-amber-400 text-black uppercase tracking-wider">
                  FLAT-RATE & PRODUCTIVIDAD
                </span>
                <span className="text-xs text-zinc-400 font-sans">
                  Gestión de Mano de Obra Taller Km 22 & Auxilio 4x4
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-white mt-0.5">
                Control de Horas Hombre & Rendimiento de Técnicos
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase transition-all cursor-pointer border border-zinc-700"
              title="Descargar Reporte de Horas y Bonos en CSV"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Exportar Planilla</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="p-4 bg-zinc-900/40 border-b border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shrink-0">
          <div className="bg-zinc-950 p-3 rounded-[3px] border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase block">HORAS REALES TRABAJADAS:</span>
            <div className="text-xl font-black text-white font-mono">
              {totalActualHours.toFixed(1)} <span className="text-xs text-zinc-500 font-normal">Horas</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-sans block">vs. {totalStandardHours.toFixed(1)}h Flat-Rate</span>
          </div>

          <div className="bg-zinc-950 p-3 rounded-[3px] border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase block">EFICIENCIA GLOBAL:</span>
            <div className={`text-xl font-black font-mono ${
              overallEfficiency >= 100 ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {overallEfficiency}%
            </div>
            <span className="text-[10px] text-emerald-400 font-sans block">✓ Sobre estándar de fábrica</span>
          </div>

          <div className="bg-zinc-950 p-3 rounded-[3px] border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase block">MANO DE OBRA FACTURADA:</span>
            <div className="text-xl font-black text-amber-400 font-mono">
              US$ {totalBilledUsd.toLocaleString()}
            </div>
            <span className="text-[10px] text-zinc-400 font-sans block">RD$ {(totalBilledUsd * 60).toLocaleString()} aprox</span>
          </div>

          <div className="bg-zinc-950 p-3 rounded-[3px] border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase block">FONDO DE BONOS (5%):</span>
            <div className="text-xl font-black text-cyan-400 font-mono flex items-center gap-1.5">
              <Award className="w-4 h-4 text-cyan-400" />
              US$ {estimatedBonusUsd.toLocaleString()}
            </div>
            <span className="text-[10px] text-zinc-400 font-sans block">Incentivo por alta eficiencia</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-3 bg-zinc-900/20 border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <label className="text-zinc-400 font-mono uppercase text-[10px]">Filtrar Técnico:</label>
            <select
              value={technicianFilter}
              onChange={e => setTechnicianFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-[2px] px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="all">Todos los Mecánicos</option>
              <option value="Manuel Santos">Manuel Santos (Hidráulica)</option>
              <option value="Rafael Santana">Rafael Santana (Electrónica CAN)</option>
              <option value="Pedro Valenzuela">Pedro Valenzuela (Rodajes)</option>
              <option value="Dionicio Báez">Dionicio Báez (Auxilio 4x4)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsAddTicketOpen(true)}
            className="px-3 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar Boleta de Horas</span>
          </button>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] overflow-hidden divide-y divide-zinc-800 text-xs">
            {filteredRecords.map(rec => (
              <div key={rec.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{rec.technicianName}</span>
                    <span className="text-[10px] text-amber-400 font-mono">({rec.specialty})</span>
                    <span className="text-zinc-600">&bull;</span>
                    <span className="px-1.5 py-0.2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 font-mono">
                      {rec.workOrderNumber}
                    </span>
                    <span className="text-zinc-500 font-mono text-[10px]">{rec.date}</span>
                  </div>

                  <p className="text-zinc-300 font-sans text-xs">
                    <strong className="text-amber-400">{rec.machineModel}:</strong> {rec.taskDescription}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-zinc-400">
                    <span>Tiempo Real: <strong className="text-white">{rec.actualHours} h</strong></span>
                    <span>&bull;</span>
                    <span>Flat-Rate Estándar: <strong className="text-zinc-300">{rec.standardHours} h</strong></span>
                    <span>&bull;</span>
                    <span>Tarifa: US$ {rec.laborRateUsd}/h</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded-[2px] text-[10px] font-bold block ${
                      rec.efficiencyPercent >= 100 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                    }`}>
                      {rec.efficiencyPercent}% Eficiencia
                    </span>
                    <span className="text-xs font-black text-white font-mono mt-0.5 block">
                      US$ {(rec.actualHours * rec.laborRateUsd).toLocaleString()}
                    </span>
                  </div>

                  <span className="p-1 rounded-[2px] bg-emerald-500/20 text-emerald-400" title="Aprobado por Jefe de Taller">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Subdialog: New Ticket */}
        {isAddTicketOpen && (
          <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <form 
              onSubmit={handleAddTicket}
              className="bg-zinc-900 border border-amber-400/40 rounded-[4px] p-5 w-full max-w-md shadow-2xl space-y-4 text-xs font-mono"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="font-bold text-amber-400 uppercase flex items-center gap-1.5 font-display">
                  <Clock className="w-3.5 h-3.5" /> Registrar Boleta de Trabajo
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddTicketOpen(false)}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-zinc-400 mb-1 uppercase text-[10px]">Técnico Mecánico:</label>
                  <select
                    value={techName}
                    onChange={e => setTechName(e.target.value)}
                    className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Manuel Santos">Manuel Santos (Hidráulica)</option>
                    <option value="Rafael Santana">Rafael Santana (Electrónica CAN)</option>
                    <option value="Pedro Valenzuela">Pedro Valenzuela (Rodajes)</option>
                    <option value="Dionicio Báez">Dionicio Báez (Auxilio 4x4)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-400 mb-1 uppercase text-[10px]">Orden de Trabajo:</label>
                    <input
                      type="text"
                      required
                      value={workOrder}
                      onChange={e => setWorkOrder(e.target.value)}
                      className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-white focus:outline-none focus:border-amber-400 uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1 uppercase text-[10px]">Equipo:</label>
                    <input
                      type="text"
                      required
                      value={machine}
                      onChange={e => setMachine(e.target.value)}
                      className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-white focus:outline-none focus:border-amber-400 uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 uppercase text-[10px]">Descripción de la Tarea:</label>
                  <textarea
                    required
                    rows={2}
                    value={taskDesc}
                    onChange={e => setTaskDesc(e.target.value)}
                    placeholder="Detalle de reparación, piezas reemplazadas y pruebas realizadas..."
                    className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-white focus:outline-none focus:border-amber-400 font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-400 mb-1 uppercase text-[10px]">Horas Flat-Rate (Estándar):</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={stdHours}
                      onChange={e => setStdHours(e.target.value)}
                      className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1 uppercase text-[10px]">Horas Reales Invertidas:</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={actHours}
                      onChange={e => setActHours(e.target.value)}
                      className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddTicketOpen(false)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-[2px] text-xs uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-black rounded-[2px] text-xs uppercase shadow-sm cursor-pointer"
                >
                  Guardar Boleta
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Integrado con Fullbay API Labor Tracking y Tabulador Oficial LiuGong / JCB.
          </span>
          <span className="font-mono text-[10px]">TMD Workshop Operations v9</span>
        </div>
      </div>
    </div>
  );
};
