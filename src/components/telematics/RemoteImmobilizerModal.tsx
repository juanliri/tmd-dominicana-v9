import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  AlertTriangle,
  ShieldAlert,
  Radio,
  Clock,
  KeyRound,
  CheckCircle2,
  X,
  MapPin,
  Cpu,
  Flame,
  Power
} from 'lucide-react';

interface RemoteImmobilizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineName?: string;
  machineSerial?: string;
  currentLocation?: string;
}

interface ImmobilizerCommandLog {
  id: string;
  timestamp: string;
  action: 'LOCK' | 'UNLOCK';
  operator: string;
  authorizedByPin: boolean;
  ecuResponseTimeMs: number;
  coordinates: string;
  notes: string;
}

export const RemoteImmobilizerModal: React.FC<RemoteImmobilizerModalProps> = ({
  isOpen,
  onClose,
  machineName = 'LiuGong 922E HD #EQ-104',
  machineSerial = 'LG922E-DOM-2024-8841',
  currentLocation = 'Cantera San Cristóbal (18.4214° N, 70.1143° W)'
}) => {
  const [isImmobilized, setIsImmobilized] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmStep, setConfirmStep] = useState(false);
  const [reason, setReason] = useState('Fin de jornada laboral / Protocolo nocturno antirrobo');

  const [commandLogs, setCommandLogs] = useState<ImmobilizerCommandLog[]>([
    {
      id: 'CMD-9941',
      timestamp: '2026-09-27 19:00:22',
      action: 'LOCK',
      operator: 'Ing. Marcos Guzmán (Gerente de Flota)',
      authorizedByPin: true,
      ecuResponseTimeMs: 420,
      coordinates: '18.4214° N, 70.1143° W',
      notes: 'Bloqueo nocturno de seguridad programado.'
    },
    {
      id: 'CMD-9942',
      timestamp: '2026-09-28 06:30:10',
      action: 'UNLOCK',
      operator: 'Ing. Marcos Guzmán (Gerente de Flota)',
      authorizedByPin: true,
      ecuResponseTimeMs: 380,
      coordinates: '18.4214° N, 70.1143° W',
      notes: 'Desbloqueo inicio de turno minero diurno.'
    }
  ]);

  if (!isOpen) return null;

  const handleExecuteToggle = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin !== '2026') {
      setPinError('Código PIN de seguridad incorrecto. Comuníquese con TMD Seguridad.');
      return;
    }

    setPinError('');
    setIsProcessing(true);

    setTimeout(() => {
      const newStatus = !isImmobilized;
      setIsImmobilized(newStatus);
      setIsProcessing(false);
      setConfirmStep(false);
      setPin('');

      const newLog: ImmobilizerCommandLog = {
        id: `CMD-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleDateString('es-DO', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        action: newStatus ? 'LOCK' : 'UNLOCK',
        operator: 'Usuario Autorizado TMD (PIN Verificado)',
        authorizedByPin: true,
        ecuResponseTimeMs: Math.floor(320 + Math.random() * 150),
        coordinates: '18.4214° N, 70.1143° W',
        notes: reason
      };

      setCommandLogs(prev => [newLog, ...prev]);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl text-zinc-200 overflow-hidden font-mono flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-[3px] border ${
              isImmobilized 
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-400' 
                : 'bg-amber-400/10 border-amber-400/30 text-amber-400'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-[2px] text-[10px] font-bold uppercase tracking-wider ${
                  isImmobilized ? 'bg-rose-500 text-white' : 'bg-amber-400 text-black'
                }`}>
                  CAN-BUS J1939 • SPN 520201
                </span>
                <span className="text-xs text-zinc-400 font-sans">
                  Telemetría Satelital de Emergencia
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-white mt-0.5">
                Inmovilización Remota Antirrobo de Motor
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

        {/* Machine Status Bar */}
        <div className="p-4 bg-zinc-900/40 border-b border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div>
            <span className="text-zinc-500 text-[10px] block">EQUIPO:</span>
            <span className="text-white font-bold">{machineName}</span>
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] block">SERIAL DE CHASIS:</span>
            <span className="text-zinc-300 font-mono">{machineSerial}</span>
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] block">ESTADO DE INYECCIÓN ECU:</span>
            <span className={`font-bold flex items-center gap-1.5 ${
              isImmobilized ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {isImmobilized ? (
                <>
                  <Lock className="w-3.5 h-3.5" /> MOTOR INMOVILIZADO
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5" /> ENCENDIDO HABILITADO
                </>
              )}
            </span>
          </div>
        </div>

        {/* Action Panel */}
        <div className="p-5 space-y-5">
          {/* Warning Banner */}
          <div className="p-3.5 bg-amber-500/10 border border-amber-400/30 rounded-[3px] flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1 font-sans">
              <p className="font-bold text-amber-300">
                Protocolo de Doble Factor de Seguridad Satelital
              </p>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                El comando corta la alimentación del solenoide de inyección diésel mediante el módem telemático Queclink J1939. La máquina no podrá ser encendida ni con la llave original hasta que se envíe el comando de liberación firmado con PIN.
              </p>
            </div>
          </div>

          {!confirmStep ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] p-5 flex flex-col items-center text-center space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all ${
                isImmobilized
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-lg shadow-rose-950/50'
                  : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
              }`}>
                {isImmobilized ? <Lock className="w-8 h-8" /> : <Power className="w-8 h-8" />}
              </div>

              <div>
                <h3 className="text-base font-bold text-white uppercase font-display">
                  {isImmobilized ? 'El equipo se encuentra BLOQUEADO' : 'El equipo se encuentra OPERATIVO'}
                </h3>
                <p className="text-xs text-zinc-400 font-sans max-w-md mt-1">
                  {isImmobilized
                    ? 'La ECU del motor rechaza cualquier intento de arranque. Para permitir la operación del turno de trabajo, proceda a la liberación con PIN.'
                    : 'La inyección diésel y el arranque eléctrico están activos. Presione inmovilizar para activar la protección antirrobo en caso de emergencia o descanso.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setConfirmStep(true)}
                className={`px-6 py-2.5 rounded-[2px] font-black uppercase text-xs tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-2 ${
                  isImmobilized
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50'
                }`}
              >
                {isImmobilized ? (
                  <>
                    <Unlock className="w-4 h-4" /> Desbloquear & Habilitar Motor
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" /> Inmovilizar Motor Inmediatamente
                  </>
                )}
              </button>
            </div>
          ) : (
            <form onSubmit={handleExecuteToggle} className="bg-zinc-900 border border-amber-400/40 rounded-[3px] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" /> Confirmación con PIN de Seguridad
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">PIN demo: 2026</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1 font-mono uppercase text-[10px]">
                    Motivo de la acción telemática:
                  </label>
                  <select
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Fin de jornada laboral / Protocolo nocturno antirrobo">
                      Fin de jornada laboral / Protocolo nocturno antirrobo
                    </option>
                    <option value="Alerta de salida de geocerca no autorizada">
                      Alerta de salida de geocerca no autorizada (Posible Hurto)
                    </option>
                    <option value="Mantenimiento preventivo mayor en proceso (Seguridad LOTO)">
                      Mantenimiento preventivo mayor en proceso (Seguridad LOTO)
                    </option>
                    <option value="Avería crítica detectada (Protección de motor por sobrecalentamiento)">
                      Avería crítica detectada (Protección de motor)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-mono uppercase text-[10px]">
                    Ingrese PIN de 4 dígitos de Gerencia TMD:
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    placeholder="••••"
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-[2px] text-center text-lg tracking-widest text-amber-400 font-mono focus:outline-none focus:border-amber-400"
                  />
                  {pinError && (
                    <p className="text-rose-400 text-[11px] font-sans mt-1">
                      {pinError}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => { setConfirmStep(false); setPin(''); setPinError(''); }}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-[2px] text-xs uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || pin.length < 4}
                  className={`px-4 py-2 rounded-[2px] font-black uppercase text-xs shadow-sm cursor-pointer flex items-center gap-1.5 ${
                    isImmobilized
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  } disabled:opacity-50`}
                >
                  {isProcessing ? (
                    <>
                      <Radio className="w-3.5 h-3.5 animate-spin" /> Enviando Trama CAN...
                    </>
                  ) : isImmobilized ? (
                    <>
                      <Unlock className="w-3.5 h-3.5" /> Confirmar Desbloqueo
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" /> Confirmar Inmovilización
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Audit Command Logs */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-zinc-400 uppercase flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Bitácora de Comandos Satelitales
            </h4>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-[3px] divide-y divide-zinc-800/80 text-[11px] max-h-36 overflow-y-auto">
              {commandLogs.map(log => (
                <div key={log.id} className="p-2.5 flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.2 rounded-[2px] text-[9px] font-bold ${
                        log.action === 'LOCK'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {log.action === 'LOCK' ? 'BLOQUEO INYECCIÓN' : 'LIBERACIÓN MOTOR'}
                      </span>
                      <span className="text-zinc-500 font-mono text-[10px]">{log.timestamp}</span>
                    </div>
                    <p className="text-zinc-300 font-sans text-xs">{log.notes}</p>
                    <p className="text-zinc-500 text-[10px]">{log.operator} • Latencia ECU: {log.ecuResponseTimeMs}ms</p>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono shrink-0">{log.id}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Enlace Satelital Iridium / 4G Activo (Latencia 380 ms)
          </span>
          <span className="font-mono text-[10px]">TMD Security Core v9</span>
        </div>
      </div>
    </div>
  );
};
