import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Award, 
  QrCode, 
  CheckCircle2, 
  Download, 
  ShieldCheck, 
  Calendar, 
  UserCheck, 
  X, 
  Clock, 
  Search, 
  Plus, 
  ExternalLink, 
  BookOpen 
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import { generateQrDataUrl } from '../../utils/qrExporter';

interface OperatorCertificationPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractorName?: string;
}

interface CertifiedOperator {
  id: string;
  name: string;
  cedula: string;
  machineType: string;
  hoursCompleted: number;
  certDate: string;
  expiryDate: string;
  status: 'VIGENTE' | 'POR RENOVAR' | 'VENCIDO';
  score: number;
  qrCodeUrl: string;
}

const INITIAL_OPERATORS: CertifiedOperator[] = [
  {
    id: 'TMD-OP-2026-801',
    name: 'José Ramón Encarnación',
    cedula: '001-1829384-2',
    machineType: 'Excavadora LiuGong 922E / 936E',
    hoursCompleted: 140,
    certDate: '15/01/2026',
    expiryDate: '15/01/2028',
    status: 'VIGENTE',
    score: 98,
    qrCodeUrl: ''
  },
  {
    id: 'TMD-OP-2026-802',
    name: 'Carlos Manuel De los Santos',
    cedula: '012-0938472-1',
    machineType: 'Retroexcavadora JCB 3CX Eco',
    hoursCompleted: 120,
    certDate: '22/02/2026',
    expiryDate: '22/02/2028',
    status: 'VIGENTE',
    score: 94,
    qrCodeUrl: ''
  },
  {
    id: 'TMD-OP-2025-742',
    name: 'Wilson Rafael Polanco',
    cedula: '402-2839102-5',
    machineType: 'Cargador Frontal LiuGong 856H Max',
    hoursCompleted: 160,
    certDate: '10/11/2024',
    expiryDate: '10/11/2026',
    status: 'POR RENOVAR',
    score: 91,
    qrCodeUrl: ''
  }
];

export const OperatorCertificationPortalModal: React.FC<OperatorCertificationPortalModalProps> = ({
  isOpen,
  onClose,
  contractorName = 'Constructora Dominicana S.R.L.'
}) => {
  const [operators, setOperators] = useState<CertifiedOperator[]>(INITIAL_OPERATORS);
  const [selectedOp, setSelectedOp] = useState<CertifiedOperator>(INITIAL_OPERATORS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [activeQrUrl, setActiveQrUrl] = useState<string>('');

  useEffect(() => {
    if (selectedOp) {
      generateQrDataUrl(`https://tmd.com.do/verify/op/${selectedOp.id}`, 180)
        .then(setActiveQrUrl)
        .catch(() => {});
    }
  }, [selectedOp]);

  if (!isOpen) return null;

  const filteredOperators = operators.filter(op => 
    op.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    op.cedula.includes(searchQuery) ||
    op.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownloadCard = () => {
    triggerHaptic('success');
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-zinc-900 border border-zinc-700 rounded-[5px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[2px] bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white font-display uppercase tracking-wide">
                  Certificación de Operadores de Maquinaria Pesada
                </h3>
                <span className="px-2 py-0.5 rounded-[2px] bg-amber-500/10 text-amber-400 text-[10px] font-mono font-bold border border-amber-500/30">
                  TMD Academy & ISO 9001
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Acreditación oficial para operadores de {contractorName} con verificación mediante QR criptográfico
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

        {/* Search & Actions Bar */}
        <div className="px-6 py-3 bg-zinc-950/80 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, cédula o carnet TMD..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-[2px] text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400">
              {filteredOperators.length} operadores acreditados
            </span>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto font-sans">
          {/* Operators List (5 cols) */}
          <div className="lg:col-span-5 space-y-2.5">
            <h4 className="text-xs font-bold text-zinc-400 font-display uppercase tracking-wider">
              Nómina de Operadores Evaluados
            </h4>

            <div className="space-y-2">
              {filteredOperators.map((op) => (
                <div
                  key={op.id}
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedOp(op);
                  }}
                  className={`p-3 rounded-[3px] border transition-all cursor-pointer ${
                    selectedOp.id === op.id
                      ? 'bg-zinc-800/80 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                      : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">{op.name}</span>
                      <span className="text-[11px] font-mono text-zinc-400">Cédula: {op.cedula}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-bold border ${
                      op.status === 'VIGENTE'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {op.status}
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-zinc-800/70 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>{op.machineType}</span>
                    <span className="text-amber-400 font-bold">{op.hoursCompleted}h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Digital Badge Preview (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            <div className="p-6 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border-2 border-amber-500/40 rounded-[5px] shadow-2xl relative overflow-hidden">
              {/* Badge watermark */}
              <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-5 pointer-events-none">
                <Award className="w-64 h-64 text-amber-400" />
              </div>

              {/* Badge Header */}
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[2px] bg-amber-500 flex items-center justify-center text-black font-black font-display text-sm">
                    TMD
                  </div>
                  <div>
                    <h5 className="text-xs font-black tracking-widest text-amber-400 font-display uppercase">
                      TMD DOMINICANA ACADEMY
                    </h5>
                    <p className="text-[10px] font-mono text-zinc-400">
                      CERTIFICACIÓN TÉCNICA OFICIAL DE OPERADOR
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-zinc-400 font-bold">
                  {selectedOp.id}
                </span>
              </div>

              {/* Operator details & QR */}
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="col-span-2 space-y-3">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">Operador Homologado</span>
                    <h4 className="text-base font-black text-white font-display uppercase">
                      {selectedOp.name}
                    </h4>
                    <p className="text-xs font-mono text-zinc-400">Cédula: {selectedOp.cedula}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">Especialidad Certificada</span>
                    <p className="text-xs font-bold text-amber-400 font-display">
                      {selectedOp.machineType}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/70 text-[11px] font-mono">
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Horas Teórico/Prácticas</span>
                      <span className="text-white font-bold">{selectedOp.hoursCompleted} Horas Acreditadas</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Calificación Final</span>
                      <span className="text-emerald-400 font-bold">{selectedOp.score} / 100 Pts</span>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="col-span-1 flex flex-col items-center justify-center p-3 bg-white rounded-[3px] min-h-[120px]">
                  {activeQrUrl ? (
                    <img
                      src={activeQrUrl}
                      alt="QR Verification"
                      className="w-24 h-24 object-contain"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-zinc-200 animate-pulse rounded" />
                  )}
                  <span className="text-[9px] font-mono font-bold text-zinc-900 mt-1 text-center">
                    ESCANEAR VALIDACIÓN
                  </span>
                </div>
              </div>

              {/* Badge Footer */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span>Válido hasta: {selectedOp.expiryDate}</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> Acreditación Verificada en Registro Central
                </span>
              </div>
            </div>

            {/* Modules Included */}
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-[3px] space-y-1.5 text-xs">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                Módulos Aprobados del Programa de Certificación:
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Inspección Pre-Arranque (360° Walkaround)
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Eco-Driving y Ahorro Diésel Tier 3/4F
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Estabilidad de Taludes y Prevención de Vuelcos
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Interpretación de Alertas CAN-bus y SPN
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-400 font-mono">
            Certificaciones avaladas por instructores certificados de fábrica LiuGong & JCB
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadCard}
              className="px-4 py-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-mono text-xs font-bold flex items-center gap-1.5 border border-zinc-700 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{downloadSuccess ? 'CARNET GENERADO' : 'Descargar Carnet PDF'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-[2px] bg-amber-500 hover:bg-amber-400 text-black font-display uppercase tracking-wider text-xs font-bold transition-all cursor-pointer"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
