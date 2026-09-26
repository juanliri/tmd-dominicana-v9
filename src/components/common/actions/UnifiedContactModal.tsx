import React, { useState } from 'react';
import { 
  Phone, 
  Send, 
  CheckCircle2, 
  Truck, 
  Wrench, 
  Flame, 
  Cog, 
  FileText,
  MapPin,
  Building2,
  User,
  Check
} from 'lucide-react';
import { TmdModal } from '../tmd-industrial/TmdModal';
import { TmdButton, TmdInput, TmdSelect, TmdBadge } from '../tmd-industrial';

export type ContactIntent = 'quote_machine' | 'order_parts' | 'schedule_service' | 'emergency_sos';

export interface UnifiedContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialIntent?: ContactIntent;
  targetProductName?: string;
}

const DOMINICAN_PROVINCES = [
  'Santo Domingo / Distrito Nacional',
  'Santiago de los Caballeros',
  'La Altagracia (Punta Cana / Bávaro)',
  'San Cristóbal (Km 22 / Haina)',
  'La Vega',
  'Puerto Plata',
  'San Pedro de Macorís',
  'Azua / Baní',
  'Montecristi / Dajabón',
  'Barahona / Pedernales'
];

export const UnifiedContactModal: React.FC<UnifiedContactModalProps> = ({
  isOpen,
  onClose,
  initialIntent = 'quote_machine',
  targetProductName
}) => {
  const [intent, setIntent] = useState<ContactIntent>(initialIntent);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [rnc, setRnc] = useState('');
  const [province, setProvince] = useState(DOMINICAN_PROVINCES[0]);
  const [details, setDetails] = useState(targetProductName ? `Consulta sobre: ${targetProductName}` : '');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 800);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setName('');
    setCompany('');
    setPhone('');
    setRnc('');
    setDetails('');
    onClose();
  };

  const intentTabs = [
    { id: 'quote_machine' as ContactIntent, label: 'Maquinaria', icon: Truck },
    { id: 'order_parts' as ContactIntent, label: 'Repuestos', icon: Cog },
    { id: 'schedule_service' as ContactIntent, label: 'Taller Km 22', icon: Wrench },
    { id: 'emergency_sos' as ContactIntent, label: 'Brigada SOS', icon: Flame }
  ];

  return (
    <TmdModal
      isOpen={isOpen}
      onClose={onClose}
      title="Centro de Contacto & Cotización TMD"
      subtitle="Atención comercial y técnica directa en toda la República Dominicana"
      icon={Phone}
      maxWidth="xl"
    >
      {isSubmitted ? (
        <div className="py-8 text-center space-y-4 font-mono">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-black text-white uppercase">
              ¡Solicitud Transmitida Exitosamente!
            </h4>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Un especialista comercial de TMD Dominicana se comunicará al <span className="text-amber-400 font-bold">{phone || 'número provisto'}</span> en menos de 15 minutos hábiles.
            </p>
          </div>
          <TmdButton variant="primary" size="md" onClick={handleReset}>
            FINALIZAR
          </TmdButton>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 font-mono">
          {/* Intent Selector Tabs */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              TIPO DE SOLICITUD:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {intentTabs.map((tab) => {
                const Icon = tab.icon;
                const isSelected = intent === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setIntent(tab.id)}
                    className={`
                      p-2.5 rounded-[4px] border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer uppercase
                      ${isSelected 
                        ? 'bg-amber-500/15 border-amber-400 text-amber-400 shadow-md' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}
                    `}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-zinc-500'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contact Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TmdInput
              label="NOMBRE O CONTACTO:"
              required
              placeholder="Ej. Ing. Juan Martínez"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <TmdInput
              label="TELÉFONO / WHATSAPP RD:"
              required
              type="tel"
              placeholder="(809) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TmdInput
              label="EMPRESA / CONSTRUCTORA:"
              placeholder="Ej. Constructora del Caribe SRL"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />

            <TmdInput
              label="RNC (DGII FISCAL):"
              placeholder="1-30-XXXXX-X"
              value={rnc}
              onChange={(e) => setRnc(e.target.value)}
            />
          </div>

          <TmdSelect
            label="PROVINCIA O UBICACIÓN DEL PROYECTO:"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            options={DOMINICAN_PROVINCES.map((p) => ({ value: p, label: p }))}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
              DETALLES DEL REQUERIMIENTO O EQUIPO:
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Indica modelo de interés, horas de uso, condiciones de terreno o requerimiento especial..."
              className="w-full bg-zinc-950/90 text-white placeholder-zinc-600 text-sm font-mono border border-zinc-700/80 rounded-[4px] p-3 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-800">
            <TmdButton type="button" variant="ghost" size="md" onClick={onClose}>
              CANCELAR
            </TmdButton>

            <TmdButton
              type="submit"
              variant={intent === 'emergency_sos' ? 'danger' : 'primary'}
              size="md"
              icon={Send}
              isLoading={isLoading}
              loadingText="TRANSMITIENDO..."
            >
              {intent === 'emergency_sos' ? 'DESPACHAR BRIGADA SOS' : 'ENVIAR COTIZACIÓN'}
            </TmdButton>
          </div>
        </form>
      )}
    </TmdModal>
  );
};
