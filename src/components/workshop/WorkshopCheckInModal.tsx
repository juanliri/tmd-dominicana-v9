import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Wrench, 
  Camera, 
  Fuel, 
  Clock, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Truck, 
  Printer, 
  Download, 
  Phone, 
  Eye, 
  Check, 
  QrCode,
  Building2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import { Machine } from '../../types';

interface WorkshopCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  machine?: Machine | null;
}

type PerimeterSide = 'frontal' | 'posterior' | 'lateral_izq' | 'lateral_der';
type ConditionStatus = 'impecable' | 'desgaste_leve' | 'abolladura' | 'fuga_visible' | 'dano_critico';

interface PerimeterCheck {
  status: ConditionStatus;
  notes: string;
  photoUrl: string;
}

export const WorkshopCheckInModal: React.FC<WorkshopCheckInModalProps> = ({
  isOpen,
  onClose,
  machine
}) => {
  const [folioNumber] = useState<string>(() => `TMD-REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [horometer, setHorometer] = useState<number>(2450);
  const [fuelLevel, setFuelLevel] = useState<number>(50); // 0 to 100%
  const [clientName, setClientName] = useState<string>('Consorcio Vial Metropolitano S.R.L.');
  const [clientRnc, setClientRnc] = useState<string>('1-31-89024-5');
  const [driverName, setDriverName] = useState<string>('Carlos M. Santana (Céd. 001-0892341-2)');
  const [lowboyPlate, setLowboyPlate] = useState<string>('L-409122 (Transportes Cibao)');
  const [assignedBay, setAssignedBay] = useState<number>(1);
  const [serviceReason, setServiceReason] = useState<string>('Mantenimiento Preventivo PMA 2,500 Horas + Escaneo ECM');
  const [receiverTech, setReceiverTech] = useState<string>('Ing. Ricardo Céspedes (Jefe de Taller Km 22)');

  // 4-side perimeter inspection state
  const [perimeter, setPerimeter] = useState<Record<PerimeterSide, PerimeterCheck>>({
    frontal: {
      status: 'desgaste_leve',
      notes: 'Cucharón con desgaste habitual en calzas. Pasadores con engrase adecuado.',
      photoUrl: '/images/tmd_coming_soon.jpg'
    },
    posterior: {
      status: 'impecable',
      notes: 'Contrapeso sin golpes mayores. Luces traseras y rejilla intactas.',
      photoUrl: '/images/tmd_coming_soon.jpg'
    },
    lateral_izq: {
      status: 'impecable',
      notes: 'Cabina y cristales en perfecto estado. Tensión de oruga dentro de tolerancia.',
      photoUrl: '/images/tmd_coming_soon.jpg'
    },
    lateral_der: {
      status: 'desgaste_leve',
      notes: 'Puerta de bombas con rayón superficial. Sin fugas visibles en mangueras principales.',
      photoUrl: '/images/tmd_coming_soon.jpg'
    }
  });

  // Accessories Checklist
  const [custodyItems, setCustodyItems] = useState({
    masterKey: true,
    fireExtinguisher: true,
    operatorManual: false,
    strobeBeacon: true,
    dieselCapLocked: true,
    sealedBatteries: true,
    bucketTeethClean: true
  });

  const [activeSideTab, setActiveSideTab] = useState<PerimeterSide>('frontal');
  const [isActaGenerated, setIsActaGenerated] = useState<boolean>(false);

  if (!isOpen) return null;

  const machineName = machine?.name || 'LiuGong 922E HD (Excavadora 22T)';
  const machineVin = machine?.modelCode ? `${machine.modelCode}-RD-2026` : 'CLG-922E-008921';

  const conditionLabels: Record<ConditionStatus, { label: string; color: string; badgeBg: string }> = {
    impecable: { label: 'IMPECABLE / SIN DAÑOS', color: 'text-emerald-400', badgeBg: 'bg-emerald-500/10 border-emerald-500/30' },
    desgaste_leve: { label: 'DESGASTE OPERATIVO NORMAL', color: 'text-amber-400', badgeBg: 'bg-amber-500/10 border-amber-500/30' },
    abolladura: { label: 'ABOLLADURA O RAYÓN LEVE', color: 'text-orange-400', badgeBg: 'bg-orange-500/10 border-orange-500/30' },
    fuga_visible: { label: 'FUGA DE ACEITE VISIBLE', color: 'text-red-400', badgeBg: 'bg-red-500/10 border-red-500/30' },
    dano_critico: { label: 'DAÑO ESTRUCTURAL CRÍTICO', color: 'text-rose-500', badgeBg: 'bg-rose-500/20 border-rose-500/40' }
  };

  const sideTitles: Record<PerimeterSide, { title: string; subtitle: string }> = {
    frontal: { title: '1. VISTA FRONTAL', subtitle: 'Cucharón, Brazo, Pluma, Luces Frontales' },
    posterior: { title: '2. VISTA POSTERIOR', subtitle: 'Contrapeso, Radiador, Silenciador, Luces' },
    lateral_izq: { title: '3. LATERAL IZQUIERDO', subtitle: 'Cabina ROPS/FOPS, Espejos, Rodillo Guía' },
    lateral_der: { title: '4. LATERAL DERECHO', subtitle: 'Compartimiento Bombas, Baterías, Tanque Diésel' }
  };

  const handleUpdateSideStatus = (side: PerimeterSide, status: ConditionStatus) => {
    triggerHaptic('selection');
    setPerimeter((prev) => ({
      ...prev,
      [side]: { ...prev[side], status }
    }));
  };

  const handleUpdateSideNotes = (side: PerimeterSide, notes: string) => {
    setPerimeter((prev) => ({
      ...prev,
      [side]: { ...prev[side], notes }
    }));
  };

  const toggleCustodyItem = (key: keyof typeof custodyItems) => {
    triggerHaptic('selection');
    setCustodyItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerateActa = () => {
    triggerHaptic('success');
    setIsActaGenerated(true);
  };

  const handlePrintActa = () => {
    window.print();
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl p-5 sm:p-6 text-white font-mono space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-[2px] bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase">
                TALLER CENTRAL KM 22 • PROTOCOLO PERICIAL
              </span>
              <span className="text-[10px] text-zinc-500">FOLIO: {folioNumber}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black uppercase tracking-wide text-white font-display">
              ACTA DE RECEPCIÓN PERICIAL DE EQUIPOS PESADOS
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Inspección de ingreso perimetral (4 lados), nivel de diésel, horómetro y custodia de accesorios.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-zinc-900 rounded-[2px] border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">EQUIPO & SERIE (VIN)</span>
            <strong className="text-white uppercase block truncate">{machineName}</strong>
            <span className="text-[10px] text-amber-400 font-bold block">{machineVin}</span>
          </div>

          <div className="p-3 bg-zinc-900 rounded-[2px] border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">HORÓMETRO DE INGRESO</span>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <input
                type="number"
                value={horometer}
                onChange={(e) => setHorometer(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-[2px] px-2 py-1 text-white font-mono font-bold focus:border-amber-400 focus:outline-none"
              />
              <span className="text-[10px] text-zinc-400">HRS</span>
            </div>
          </div>

          <div className="p-3 bg-zinc-900 rounded-[2px] border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">PROPIETARIO / RNC</span>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-[2px] px-2 py-1 text-white text-[11px] uppercase focus:border-amber-400 focus:outline-none"
              placeholder="EMPRESA PROPIETARIA"
            />
            <span className="text-[10px] text-zinc-400 block font-mono">RNC: {clientRnc}</span>
          </div>

          <div className="p-3 bg-zinc-900 rounded-[2px] border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">BAHÍA ASIGNADA</span>
            <select
              value={assignedBay}
              onChange={(e) => setAssignedBay(Number(e.target.value))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-[2px] px-2 py-1 text-amber-400 font-bold uppercase focus:border-amber-400 focus:outline-none"
            >
              <option value={1}>Bahía 1: PDI & Diagnóstico</option>
              <option value={2}>Bahía 2: Overhaul Motor</option>
              <option value={3}>Bahía 3: Banco Hidráulico</option>
              <option value={4}>Bahía 4: Tren de Rodaje</option>
              <option value={5}>Bahía 5: Pintura & Detallado</option>
              <option value={6}>Bahía 6: Entrega & Carga</option>
            </select>
          </div>
        </div>

        {/* Fuel Level Selector (Gauge) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-bold uppercase text-zinc-300">
              <Fuel className="w-4 h-4 text-amber-400" />
              <span>NIVEL DE COMBUSTIBLE EN TANQUE:</span>
            </span>
            <span className="text-amber-400 font-black font-mono">
              {fuelLevel}% ({fuelLevel <= 25 ? '1/4' : fuelLevel <= 50 ? '1/2' : fuelLevel <= 75 ? '3/4' : 'LLENO'})
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-zinc-500 uppercase">E (Vacío)</span>
            <input
              type="range"
              min={0}
              max={100}
              step={12.5}
              value={fuelLevel}
              onChange={(e) => setFuelLevel(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <span className="text-[10px] text-zinc-500 uppercase">F (Lleno)</span>
          </div>

          <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
            <span>0%</span>
            <span>1/4</span>
            <span>1/2</span>
            <span>3/4</span>
            <span>FULL</span>
          </div>
        </div>

        {/* 4-Side Perimeter Inspection Workspace */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Camera className="w-4 h-4" />
              <span>INSPECCIÓN FOTOGRÁFICA PERIMETRAL (4 CARAS):</span>
            </h4>
            <span className="text-[10px] text-zinc-400 uppercase">PROTOCOLO ANTIFRAUDE TMD</span>
          </div>

          {/* 4 Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['frontal', 'posterior', 'lateral_izq', 'lateral_der'] as PerimeterSide[]).map((side) => {
              const current = perimeter[side];
              const isActive = activeSideTab === side;
              const cond = conditionLabels[current.status];

              return (
                <button
                  key={side}
                  type="button"
                  onClick={() => setActiveSideTab(side)}
                  className={`p-2.5 rounded-[2px] border text-left transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-zinc-950 border-amber-400 ring-1 ring-amber-400/40 text-white' 
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="text-[11px] font-black uppercase block text-white">
                    {sideTitles[side].title}
                  </span>
                  <span className={`text-[9px] font-bold block mt-1 uppercase truncate ${cond.color}`}>
                    {cond.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Side Detail Card */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-[2px] p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h5 className="text-xs font-black text-white uppercase">
                  {sideTitles[activeSideTab].title} • {sideTitles[activeSideTab].subtitle}
                </h5>
                <span className="text-[10px] text-zinc-400">
                  Califique el estado físico y registre hallazgos visibles antes de ingresar a bahía.
                </span>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['impecable', 'desgaste_leve', 'abolladura', 'fuga_visible', 'dano_critico'] as ConditionStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleUpdateSideStatus(activeSideTab, st)}
                    className={`text-[9px] font-bold uppercase px-2 py-1 rounded-[2px] border transition-colors cursor-pointer ${
                      perimeter[activeSideTab].status === st
                        ? `${conditionLabels[st].badgeBg} ${conditionLabels[st].color}`
                        : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes Field */}
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                OBSERVACIONES PERICIALES ({sideTitles[activeSideTab].title}):
              </label>
              <textarea
                value={perimeter[activeSideTab].notes}
                onChange={(e) => handleUpdateSideNotes(activeSideTab, e.target.value)}
                rows={2}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-[2px] p-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                placeholder="Especifique detalles del estado, ralladuras, soldaduras previas, o fugas observadas..."
              />
            </div>
          </div>
        </div>

        {/* Custody Checklist */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] p-4 space-y-3">
          <span className="text-xs font-black uppercase text-amber-400 block pb-1 border-b border-zinc-800">
            INVENTARIO DE ACCESORIOS Y CUSTODIA AL INGRESO:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            {[
              { key: 'masterKey', label: 'Llave Maestra Original' },
              { key: 'fireExtinguisher', label: 'Extintor 20 lbs PQS' },
              { key: 'operatorManual', label: 'Manual de Operación' },
              { key: 'strobeBeacon', label: 'Baliza Estroboscópica' },
              { key: 'dieselCapLocked', label: 'Tapa Diésel con Llave' },
              { key: 'sealedBatteries', label: 'Baterías Selladas' },
              { key: 'bucketTeethClean', label: 'Dientes de Balde Completos' }
            ].map((item) => {
              const isChecked = custodyItems[item.key as keyof typeof custodyItems];
              return (
                <div
                  key={item.key}
                  onClick={() => toggleCustodyItem(item.key as keyof typeof custodyItems)}
                  className={`p-2 rounded-[2px] border transition-colors cursor-pointer flex items-center justify-between select-none ${
                    isChecked ? 'bg-zinc-950 border-amber-400/50 text-white' : 'bg-zinc-950/40 border-zinc-800 text-zinc-500'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase truncate">{item.label}</span>
                  <span className={`w-3.5 h-3.5 rounded-[1px] flex items-center justify-center text-[10px] font-bold ${
                    isChecked ? 'bg-amber-400 text-black' : 'border border-zinc-700'
                  }`}>
                    {isChecked && '✓'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transportation Platform & Driver Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-zinc-900 rounded-[2px] border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-400 font-bold uppercase block">
              CHOFER DE PLATAFORMA / CAMA BAJA:
            </span>
            <input
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-[2px] p-2 text-white text-[11px] uppercase focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="p-3 bg-zinc-900 rounded-[2px] border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-400 font-bold uppercase block">
              PLACA CAMA BAJA & COMPAÑÍA TRANSPORTE:
            </span>
            <input
              type="text"
              value={lowboyPlate}
              onChange={(e) => setLowboyPlate(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-[2px] p-2 text-white text-[11px] uppercase focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>FOLIO OFICIAL: {folioNumber}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold uppercase text-xs transition-colors cursor-pointer"
            >
              CERRAR
            </button>

            <button
              type="button"
              onClick={handlePrintActa}
              className="py-2 px-4 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-400/30 font-bold uppercase text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>IMPRIMIR ACTA</span>
            </button>

            <button
              type="button"
              onClick={handleGenerateActa}
              className="py-2 px-5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase tracking-wider text-xs transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>EMITIR ACTA DE INGRESO</span>
            </button>
          </div>
        </div>

        {/* Confirmation Banner when emitted */}
        {isActaGenerated && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-[3px] flex items-center justify-between text-xs text-emerald-300 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Acta pericial <strong className="text-white">{folioNumber}</strong> registrada exitosamente en Taller Km 22 Duarte. Copia enviada a expedientes de clientes.
              </span>
            </div>
            <a
              href={`https://wa.me/18095601234?text=Estimado%20cliente%2C%20le%20confirmamos%20el%20ingreso%20de%20su%20equipo%20${encodeURIComponent(machineName)}%20al%20Taller%20Km%2022%20de%20TMD%20Dominicana.%20Folio%20Acta%3A%20${folioNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-black bg-emerald-400 px-2.5 py-1 rounded-[2px] uppercase shrink-0"
            >
              <Phone className="w-3 h-3" />
              <span>NOTIFICAR POR WHATSAPP</span>
            </a>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
