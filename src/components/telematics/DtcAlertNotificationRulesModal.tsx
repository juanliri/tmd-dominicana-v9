import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Smartphone, 
  Mail, 
  MessageSquare, 
  ShieldAlert, 
  CheckCircle2, 
  Sliders, 
  X, 
  Radio, 
  Clock, 
  Send,
  UserCheck,
  Check
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface DtcAlertNotificationRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineSerial?: string;
}

interface AlertRule {
  spn: string;
  code: string;
  description: string;
  severity: 'CRÍTICA' | 'ALTA' | 'MODERADA';
  channels: { sms: boolean; email: boolean; push: boolean; whatsapp: boolean };
  recipient: string;
  active: boolean;
}

const INITIAL_RULES: AlertRule[] = [
  {
    spn: 'SPN 110 FMI 0',
    code: 'DTC-E110',
    description: 'Temperatura Alta Refrigerante Motor Cummins (>105°C)',
    severity: 'CRÍTICA',
    channels: { sms: true, email: true, push: true, whatsapp: true },
    recipient: 'Ing. Jefe de Taller & Supervisor de Obra',
    active: true
  },
  {
    spn: 'SPN 100 FMI 1',
    code: 'DTC-E100',
    description: 'Presión Crítica Baja Aceite Motor (<1.2 Bar)',
    severity: 'CRÍTICA',
    channels: { sms: true, email: true, push: true, whatsapp: true },
    recipient: 'Ing. Jefe de Taller & Operador',
    active: true
  },
  {
    spn: 'SPN 1081 FMI 0',
    code: 'DTC-H1081',
    description: 'Sobreesfuerzo Hidráulico Pico Cuchara (>345 Bar)',
    severity: 'ALTA',
    channels: { sms: false, email: true, push: true, whatsapp: true },
    recipient: 'Supervisor de Flota',
    active: true
  },
  {
    spn: 'SPN 4364 FMI 18',
    code: 'DTC-SCR43',
    description: 'Nivel Bajo Urea / DEF Tier 4F (<10% con Derate Inminente)',
    severity: 'ALTA',
    channels: { sms: false, email: true, push: true, whatsapp: false },
    recipient: 'Encargado de Abastecimiento',
    active: true
  },
  {
    spn: 'SPN 168 FMI 1',
    code: 'DTC-B168',
    description: 'Voltaje Eléctrico 24V Anormal / Alternador Desconectado (<23.2V)',
    severity: 'MODERADA',
    channels: { sms: false, email: true, push: false, whatsapp: false },
    recipient: 'Mecánico Electricista Asignado',
    active: false
  }
];

export const DtcAlertNotificationRulesModal: React.FC<DtcAlertNotificationRulesModalProps> = ({
  isOpen,
  onClose,
  machineSerial = 'LG-2022-849'
}) => {
  const [rules, setRules] = useState<AlertRule[]>(INITIAL_RULES);
  const [testSent, setTestSent] = useState(false);
  const [phoneRecipient, setPhoneRecipient] = useState('+1 (809) 555-8291');
  const [emailRecipient, setEmailRecipient] = useState('operaciones@constructora.com.do');

  if (!isOpen) return null;

  const toggleChannel = (index: number, channel: 'sms' | 'email' | 'push' | 'whatsapp') => {
    triggerHaptic('light');
    setRules(prev => prev.map((r, i) => {
      if (i === index) {
        return {
          ...r,
          channels: {
            ...r.channels,
            [channel]: !r.channels[channel]
          }
        };
      }
      return r;
    }));
  };

  const toggleRuleActive = (index: number) => {
    triggerHaptic('medium');
    setRules(prev => prev.map((r, i) => i === index ? { ...r, active: !r.active } : r));
  };

  const handleSendTestBroadcast = () => {
    triggerHaptic('heavy');
    setTestSent(true);
    setTimeout(() => {
      setTestSent(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-700 rounded-[5px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[2px] bg-red-500/10 border border-red-500/30 text-red-400">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white font-display uppercase tracking-wide">
                  Reglas de Alerta Push & SMS ante DTC Críticos J1939
                </h3>
                <span className="px-2 py-0.5 rounded-[2px] bg-red-500/10 text-red-400 text-[10px] font-mono font-bold border border-red-500/30">
                  Despacho Inmediato 24/7
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Configuración de difusión por WhatsApp, SMS y correo satelital para la unidad {machineSerial}
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

        {/* Recipients bar */}
        <div className="px-6 py-3 bg-zinc-950/80 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-zinc-400 font-mono">DESTINATARIOS DE EMERGENCIA:</span>
            <div className="flex items-center gap-2">
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <input
                type="text"
                value={phoneRecipient}
                onChange={(e) => setPhoneRecipient(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-[2px] px-2 py-0.5 text-zinc-200 font-mono text-[11px] focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <input
                type="text"
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-[2px] px-2 py-0.5 text-zinc-200 font-mono text-[11px] focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSendTestBroadcast}
            disabled={testSent}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 rounded-[2px] font-mono font-bold text-[11px] flex items-center gap-1.5 transition-all"
          >
            {testSent ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Send className="w-3.5 h-3.5" />}
            <span>{testSent ? 'TEST TRANSMITIDO' : 'PROBAR DIFUSIÓN'}</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4 overflow-y-auto font-sans">
          <div className="border border-zinc-800 rounded-[3px] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 border-b border-zinc-800 text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Código DTC / SPN</th>
                  <th className="py-2.5 px-3">Falla Detectada</th>
                  <th className="py-2.5 px-3">Severidad</th>
                  <th className="py-2.5 px-3 text-center">Canales Activos</th>
                  <th className="py-2.5 px-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {rules.map((rule, idx) => (
                  <tr key={rule.code} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-3 font-mono">
                      <span className="font-bold text-white block">{rule.spn}</span>
                      <span className="text-[10px] text-zinc-500">{rule.code}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-zinc-200 font-medium block">{rule.description}</span>
                      <span className="text-[11px] text-zinc-400">Para: {rule.recipient}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-bold border ${
                        rule.severity === 'CRÍTICA'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : rule.severity === 'ALTA'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      }`}>
                        {rule.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => toggleChannel(idx, 'whatsapp')}
                          className={`px-2 py-1 rounded-[2px] text-[10px] font-mono font-bold transition-all ${
                            rule.channels.whatsapp
                              ? 'bg-emerald-500 text-black'
                              : 'bg-zinc-800 text-zinc-500'
                          }`}
                        >
                          WA
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleChannel(idx, 'sms')}
                          className={`px-2 py-1 rounded-[2px] text-[10px] font-mono font-bold transition-all ${
                            rule.channels.sms
                              ? 'bg-amber-400 text-black'
                              : 'bg-zinc-800 text-zinc-500'
                          }`}
                        >
                          SMS
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleChannel(idx, 'push')}
                          className={`px-2 py-1 rounded-[2px] text-[10px] font-mono font-bold transition-all ${
                            rule.channels.push
                              ? 'bg-blue-500 text-white'
                              : 'bg-zinc-800 text-zinc-500'
                          }`}
                        >
                          PUSH
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleChannel(idx, 'email')}
                          className={`px-2 py-1 rounded-[2px] text-[10px] font-mono font-bold transition-all ${
                            rule.channels.email
                              ? 'bg-zinc-200 text-black'
                              : 'bg-zinc-800 text-zinc-500'
                          }`}
                        >
                          MAIL
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggleRuleActive(idx)}
                        className={`px-2.5 py-1 rounded-[2px] text-[10px] font-mono font-bold transition-all ${
                          rule.active
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                        }`}
                      >
                        {rule.active ? 'ACTIVA' : 'PAUSADA'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Audit note */}
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-[3px] flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Tiempo medio de despacho satelital: <strong>2.4 segundos</strong> tras detección en CAN-bus</span>
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              Módem Queclink GL500M 4G/LTE Cat-M1
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-400 font-mono">
            {rules.filter(r => r.active).length} de {rules.length} reglas operando en vivo
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-[2px] bg-amber-500 hover:bg-amber-400 text-black font-display uppercase tracking-wider text-xs font-bold transition-all cursor-pointer"
          >
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};
