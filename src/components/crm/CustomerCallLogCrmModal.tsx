import React, { useState } from 'react';
import {
  PhoneCall,
  Calendar,
  Building2,
  User,
  Clock,
  CheckCircle2,
  Plus,
  X,
  Sparkles,
  Download,
  MapPin,
  MessageSquare,
  Search,
  Filter,
  Briefcase
} from 'lucide-react';

interface CustomerCallLogCrmModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClientName?: string;
  defaultRnc?: string;
}

interface CallLogEntry {
  id: string;
  clientName: string;
  contactPerson: string;
  phone: string;
  type: 'phone_call' | 'km22_visit' | 'site_visit' | 'whatsapp';
  date: string;
  machineInterest: string;
  summary: string;
  nextStep: string;
  nextStepDate: string;
  repName: string;
  status: 'follow_up' | 'closed_won' | 'waiting_bank' | 'quote_sent';
}

export const CustomerCallLogCrmModal: React.FC<CustomerCallLogCrmModalProps> = ({
  isOpen,
  onClose,
  defaultClientName = 'Constructora Malespín S.R.L.',
  defaultRnc = '1-01-02412-2'
}) => {
  const [logs, setLogs] = useState<CallLogEntry[]>([
    {
      id: 'log-101',
      clientName: defaultClientName,
      contactPerson: 'Ing. Carlos Mendoza (Gerente de Maquinaria)',
      phone: '(809) 567-8900',
      type: 'km22_visit',
      date: '2026-03-24 10:30 AM',
      machineInterest: 'LiuGong 922E HD Excavadora (2 Uds)',
      summary: 'Inspección física en patio Km 22. Prueba de arranque y recorrido hidráulico satisfactorio. Requieren cotización formal con leasing Banco Popular a 48 meses.',
      nextStep: 'Enviar proforma con carta de garantía y dossier técnico.',
      nextStepDate: '2026-03-26',
      repName: 'Lic. Marcos Valenzuela (Asesor Senior)',
      status: 'waiting_bank'
    },
    {
      id: 'log-102',
      clientName: 'Ingeniería & Concretos Cibao',
      contactPerson: 'Ing. Rafael Batista',
      phone: '(809) 582-1200',
      type: 'phone_call',
      date: '2026-03-22 03:15 PM',
      machineInterest: 'Pala Cargadora LiuGong 856H',
      summary: 'Llamada de seguimiento post-cotización. Consultó sobre disponibilidad de balde para roca de 3.5 m³. Se confirmó stock en almacén Km 22.',
      nextStep: 'Agendar prueba de campo en cantera de Santiago.',
      nextStepDate: '2026-03-29',
      repName: 'Ing. David Rosario (Especialista Minería)',
      status: 'follow_up'
    },
    {
      id: 'log-103',
      clientName: 'Consorcio Vial Del Este',
      contactPerson: 'Lic. Laura Peña (Compras)',
      phone: '(829) 450-3344',
      type: 'whatsapp',
      date: '2026-03-20 11:00 AM',
      machineInterest: 'Rodillo Compactador Ammann ASC 110',
      summary: 'Confirmaron aprobación de flete en lowboy hacia Autovía Miches. Se remitió pase de puerta de garita Km 22.',
      nextStep: 'Recepción de anticipo 30% vía transferencia Banreservas.',
      nextStepDate: '2026-03-25',
      repName: 'Lic. Marcos Valenzuela',
      status: 'closed_won'
    }
  ]);

  const [isAddingLog, setIsAddingLog] = useState(false);
  const [newClient, setNewClient] = useState(defaultClientName);
  const [newContact, setNewContact] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newType, setNewType] = useState<CallLogEntry['type']>('phone_call');
  const [newMachine, setNewMachine] = useState('LiuGong 922E HD');
  const [newSummary, setNewSummary] = useState('');
  const [newNextStep, setNewNextStep] = useState('');
  const [newNextDate, setNewNextDate] = useState('2026-04-02');
  const [newStatus, setNewStatus] = useState<CallLogEntry['status']>('follow_up');

  if (!isOpen) return null;

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSummary.trim()) return;

    const entry: CallLogEntry = {
      id: `log-${Date.now().toString().slice(-4)}`,
      clientName: newClient || 'Cliente TMD',
      contactPerson: newContact || 'Contacto Comercial',
      phone: newPhone || '(809) 560-1234',
      type: newType,
      date: new Date().toLocaleString('es-DO', { dateStyle: 'short', timeStyle: 'short' }),
      machineInterest: newMachine,
      summary: newSummary,
      nextStep: newNextStep,
      nextStepDate: newNextDate,
      repName: 'Asesor Comercial TMD',
      status: newStatus
    };

    setLogs([entry, ...logs]);
    setIsAddingLog(false);
    setNewSummary('');
    setNewNextStep('');
  };

  const handleExportTxt = () => {
    let content = `=========================================================================\n`;
    content += `TECNOMAQUINARIAS DIESEL S.R.L. — BITÁCORA CRM DE SEGUIMIENTO COMERCIAL\n`;
    content += `CLIENTE: ${defaultClientName} • RNC: ${defaultRnc}\n`;
    content += `GENERADO: ${new Date().toLocaleString()}\n`;
    content += `=========================================================================\n\n`;

    logs.forEach((l, idx) => {
      content += `[REGISTRO #${idx + 1}] ${l.date} — ${l.type.toUpperCase()}\n`;
      content += `CLIENTE: ${l.clientName} | CONTACTO: ${l.contactPerson} (${l.phone})\n`;
      content += `EQUIPO DE INTERÉS: ${l.machineInterest}\n`;
      content += `ASESOR RESPONSABLE: ${l.repName}\n`;
      content += `ESTADO COMERCIAL: ${l.status.toUpperCase()}\n`;
      content += `RESUMEN: ${l.summary}\n`;
      content += `PRÓXIMO COMPROMISO: ${l.nextStep} (Plazo: ${l.nextStepDate})\n`;
      content += `-------------------------------------------------------------------------\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TMD_CRM_BITACORA_${defaultClientName.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl text-zinc-200 overflow-hidden font-mono flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[3px] bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-amber-400 text-black uppercase tracking-wider">
                  CRM TMD • SEGUIMIENTO
                </span>
                <span className="text-xs text-zinc-400 font-sans">
                  Bitácora de Visitas y Llamadas
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-white mt-0.5">
                Registro de Actividad Comercial
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-3 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white text-xs">{defaultClientName}</span>
            <span className="text-zinc-500 font-mono text-[11px]">(RNC: {defaultRnc})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingLog(!isAddingLog)}
              className="px-2.5 py-1 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingLog ? 'Cerrar Formulario' : 'Nuevo Registro'}</span>
            </button>

            <button
              onClick={handleExportTxt}
              className="px-2.5 py-1 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase transition-colors flex items-center gap-1 border border-zinc-700 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Exportar Bitácora</span>
            </button>
          </div>
        </div>

        {/* Add Log Form */}
        {isAddingLog && (
          <form onSubmit={handleSaveLog} className="p-4 bg-zinc-900/95 border-b border-zinc-800 text-xs space-y-3">
            <div className="font-bold text-amber-400 uppercase text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Registrar Nueva Interacción con Contratista:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[10px] text-zinc-400 uppercase block mb-1">Tipo de Contacto:</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value as any)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded-[2px] text-white text-xs"
                >
                  <option value="phone_call">Llamada Telefónica</option>
                  <option value="km22_visit">Visita al Patio Km 22</option>
                  <option value="site_visit">Reunión en Obra</option>
                  <option value="whatsapp">Mensajería WhatsApp</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase block mb-1">Contacto / Cargo:</label>
                <input
                  type="text"
                  placeholder="Ej: Ing. Pedro Santana"
                  value={newContact}
                  onChange={e => setNewContact(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded-[2px] text-white text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase block mb-1">Equipo de Interés:</label>
                <input
                  type="text"
                  placeholder="Ej: LiuGong 922E HD"
                  value={newMachine}
                  onChange={e => setNewMachine(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded-[2px] text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] text-zinc-400 uppercase block mb-1">Resumen de la Conversación:</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detalles de precios, especificaciones técnicas discutidas..."
                  value={newSummary}
                  onChange={e => setNewSummary(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded-[2px] text-white text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase block mb-1">Próximo Paso / Compromiso:</label>
                <textarea
                  rows={2}
                  placeholder="Ej: Enviar proforma con tasa leasing Banco Popular..."
                  value={newNextStep}
                  onChange={e => setNewNextStep(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded-[2px] text-white text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingLog(false)}
                className="px-3 py-1.5 rounded-[2px] bg-zinc-800 text-zinc-300 text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs cursor-pointer"
              >
                Guardar en CRM
              </button>
            </div>
          </form>
        )}

        {/* Logs List */}
        <div className="p-4 sm:p-5 space-y-3 overflow-y-auto max-h-[60vh] text-xs">
          {logs.map(log => (
            <div
              key={log.id}
              className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-[3px] space-y-2 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-[2px] border ${
                    log.type === 'km22_visit'
                      ? 'bg-amber-400/10 border-amber-400/30 text-amber-400'
                      : log.type === 'phone_call'
                      ? 'bg-sky-400/10 border-sky-400/30 text-sky-400'
                      : 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400'
                  }`}>
                    {log.type === 'km22_visit' && <MapPin className="w-4 h-4" />}
                    {log.type === 'phone_call' && <PhoneCall className="w-4 h-4" />}
                    {log.type === 'whatsapp' && <MessageSquare className="w-4 h-4" />}
                    {log.type === 'site_visit' && <Briefcase className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-bold text-white text-xs block">{log.contactPerson}</span>
                    <span className="text-[10px] text-zinc-400 font-sans">{log.clientName} • {log.phone}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold uppercase tracking-wider bg-zinc-800 border border-zinc-700 text-amber-400 block mb-1">
                    {log.status === 'waiting_bank' && 'Esperando Banco'}
                    {log.status === 'follow_up' && 'Seguimiento Activo'}
                    {log.status === 'closed_won' && 'Cierre Exitoso'}
                    {log.status === 'quote_sent' && 'Proforma Enviada'}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">{log.date}</span>
                </div>
              </div>

              {/* Machine & Summary */}
              <div className="p-2.5 bg-zinc-950/60 border border-zinc-850 rounded-[2px] space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-amber-400 font-bold">Interés: {log.machineInterest}</span>
                  <span className="text-zinc-500 text-[10px]">Asesor: {log.repName}</span>
                </div>
                <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                  {log.summary}
                </p>
              </div>

              {/* Next Step */}
              {log.nextStep && (
                <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-800/60">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Compromiso: {log.nextStep}</span>
                  </div>
                  <span className="text-zinc-500 font-mono">Límite: {log.nextStepDate}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 shrink-0">
          <span>Sincronizado con CRM Central TMD • {logs.length} Interacciones Registradas</span>
          <span className="text-amber-400 font-bold font-mono">TMD Commercial Core</span>
        </div>
      </div>
    </div>
  );
};
