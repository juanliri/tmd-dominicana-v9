import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  HardHat,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  X,
  FileText,
  User,
  Phone,
  Building2,
  Sparkles,
  Download,
  AlertTriangle
} from 'lucide-react';

interface MachineTestDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMachineName?: string;
  defaultBrand?: string;
}

export const MachineTestDriveModal: React.FC<MachineTestDriveModalProps> = ({
  isOpen,
  onClose,
  defaultMachineName = 'LiuGong 922E HD Excavadora de Orugas',
  defaultBrand = 'LiuGong'
}) => {
  const [machineName, setMachineName] = useState(defaultMachineName);
  const [operatorName, setOperatorName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedDate, setSelectedDate] = useState('2026-04-02');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [testTrackZone, setTestTrackZone] = useState('Zona 2: Banco de Excavación Real & Fuerza de Balde');
  const [hasEpp, setHasEpp] = useState(true);
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedDisclaimer) return;
    setBookingConfirmed(true);
  };

  const handleDownloadTicket = () => {
    let text = `=========================================================================\n`;
    text += `TECNOMAQUINARIAS DIESEL S.R.L. (TMD DOMINICANA)\n`;
    text += `COMPROBANTE OFICIAL DE RESERVA DE TEST DRIVE EN PATIO KM 22\n`;
    text += `TICKET: TST-2026-${Math.floor(1000 + Math.random() * 9000)}\n`;
    text += `=========================================================================\n\n`;

    text += `1. DATOS DE LA DEMOSTRACIÓN TÉCNICA:\n`;
    text += `   - Maquinaria a Evaluar: ${machineName}\n`;
    text += `   - Fecha: ${selectedDate} a las ${selectedTime}\n`;
    text += `   - Pista / Circuito Asignado: ${testTrackZone}\n`;
    text += `   - Ubicación: Patio Central TMD, Km 22 Autopista Duarte, Santo Domingo\n\n`;

    text += `2. OPERADOR / EMPRESA EVALUADORA:\n`;
    text += `   - Empresa: ${companyName || 'Constructora Evaluadora'}\n`;
    text += `   - Operador Responsable: ${operatorName || 'Ingeniero / Operador Delegado'}\n`;
    text += `   - Teléfono de Contacto: ${phone || '(809) 000-0000'}\n\n`;

    text += `3. REQUISITOS OBLIGATORIOS DE SEGURIDAD (OSHA / TMD):\n`;
    text += `   - Uso estricto de EPP: Casco de protección, chaleco reflectivo, botas de seguridad.\n`;
    text += `   - Acompañamiento mandatorio de Especialista de Producto / Demostrador TMD.\n`;
    text += `   - Deslinde de responsabilidad civil aceptado y protocolizado.\n\n`;

    text += `FIRMA ASESOR DEMOSTRADOR TMD: _____________________________\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TMD_TEST_DRIVE_${selectedDate}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl text-zinc-200 overflow-hidden font-mono flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[3px] bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-amber-400 text-black uppercase tracking-wider">
                  PATIO KM 22 • DEMO
                </span>
                <span className="text-xs text-zinc-400 font-sans">
                  Prueba en Terreno Real
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-white mt-0.5">
                Reserva de Test Drive y Demostración
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

        {/* Form Body */}
        {!bookingConfirmed ? (
          <form onSubmit={handleConfirmBooking} className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[70vh] text-xs">
            {/* Machine Selection Header */}
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-[3px] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase block font-display">Maquinaria a Evaluar:</span>
                <span className="font-bold text-white text-xs">{machineName}</span>
              </div>
              <span className="px-2 py-0.5 rounded-[2px] bg-amber-400/10 text-amber-400 border border-amber-400/30 text-[10px] font-bold">
                Patio Central Km 22
              </span>
            </div>

            {/* Track Zone Selection */}
            <div>
              <label className="block text-[11px] text-zinc-300 font-bold uppercase mb-1 font-display">
                Circuito de Prueba Seleccionado:
              </label>
              <select
                value={testTrackZone}
                onChange={e => setTestTrackZone(e.target.value)}
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-[2px] text-xs text-white"
              >
                <option value="Zona 1: Pista de Maniobra & Pendiente 15% (Tracción y Frenado)">
                  Zona 1: Pista de Maniobra & Pendiente 15% (Tracción y Frenado)
                </option>
                <option value="Zona 2: Banco de Excavación Real & Fuerza de Balde">
                  Zona 2: Banco de Excavación Real & Fuerza de Balde
                </option>
                <option value="Zona 3: Simulación de Carga a Camión Volteo Heavy Duty">
                  Zona 3: Simulación de Carga a Camión Volteo Heavy Duty
                </option>
              </select>
            </div>

            {/* Operator and Company Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Nombre del Operador:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez (Operador Certificado)"
                  value={operatorName}
                  onChange={e => setOperatorName(e.target.value)}
                  className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-[2px] text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Empresa Contratista:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Constructora del Caribe S.R.L."
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-[2px] text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Teléfono / WhatsApp:</label>
                <input
                  type="tel"
                  required
                  placeholder="(809) 555-1234"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-[2px] text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase mb-1">Fecha:</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-[2px] text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase mb-1">Hora:</label>
                  <select
                    value={selectedTime}
                    onChange={e => setSelectedTime(e.target.value)}
                    className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-[2px] text-xs text-white"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:30 PM">03:30 PM</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Safety & Legal Disclaimers */}
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-[3px] space-y-2">
              <label className="flex items-start gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasEpp}
                  onChange={e => setHasEpp(e.target.checked)}
                  className="mt-0.5 rounded-[2px] border-zinc-700 text-amber-400"
                />
                <span className="font-sans leading-tight">
                  Confirmo que el operador asistirá con su equipo de protección personal (EPP): casco, botas con puntera de acero y chaleco.
                </span>
              </label>

              <label className="flex items-start gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={acceptedDisclaimer}
                  onChange={e => setAcceptedDisclaimer(e.target.checked)}
                  className="mt-0.5 rounded-[2px] border-zinc-700 text-amber-400"
                />
                <span className="font-sans leading-tight text-amber-300">
                  Acepto el acuerdo de deslinde de responsabilidad y normas de seguridad en patio de maniobras TMD Dominicana.
                </span>
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={!acceptedDisclaimer}
                className={`px-5 py-2.5 rounded-[2px] font-bold text-xs uppercase transition-colors cursor-pointer flex items-center gap-1.5 ${
                  acceptedDisclaimer
                    ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-md'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Confirmar Cita de Test Drive</span>
              </button>
            </div>
          </form>
        ) : (
          /* Confirmation Success Screen */
          <div className="p-6 text-center space-y-4 font-mono">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-black text-white uppercase font-display">
                Demostración Reservada con Éxito
              </h3>
              <p className="text-xs text-zinc-400 font-sans mt-1 max-w-md mx-auto">
                Tu cita para probar la maquinaria en terreno real ha sido agendada en Patio Km 22 con un demostrador técnico asignado.
              </p>
            </div>

            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-[3px] max-w-md mx-auto text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-500">Fecha & Hora:</span>
                <span className="font-bold text-white">{selectedDate} • {selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Equipo:</span>
                <span className="font-bold text-amber-400">{machineName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Circuito:</span>
                <span className="font-bold text-zinc-300">{testTrackZone}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadTicket}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase text-xs rounded-[2px] flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Comprobante</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold uppercase text-xs rounded-[2px] cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 shrink-0">
          <span>Pista de Pruebas Homologada • Km 22 Autopista Duarte, Santo Domingo</span>
          <span className="text-amber-400 font-bold font-mono">TMD Field Operations</span>
        </div>
      </div>
    </div>
  );
};
