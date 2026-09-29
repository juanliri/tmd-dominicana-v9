import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  GraduationCap, 
  Award, 
  ShieldCheck, 
  CheckCircle, 
  Users, 
  Calendar, 
  Clock, 
  BookOpen, 
  Search, 
  QrCode, 
  Phone,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { ACADEMY_COURSES, DEMO_VERIFIED_OPERATORS } from '../../data/academyData';
import { AcademyCourse, CertifiedOperatorBadge } from '../../types';
import { useCart } from '../../context/CartContext';

interface OperatorAcademyViewProps {
  onNavigate?: (route: string) => void;
}

export const OperatorAcademyView: React.FC<OperatorAcademyViewProps> = ({ onNavigate }) => {
  const { formatPrice } = useCart();
  const [courses] = useState<AcademyCourse[]>(ACADEMY_COURSES);
  const [selectedCourse, setSelectedCourse] = useState<AcademyCourse | null>(null);
  const [enrollModalOpen, setEnrollModalOpen] = useState<boolean>(false);
  const [enrollSuccess, setEnrollSuccess] = useState<boolean>(false);

  // Operator verification state
  const [searchQuery, setSearchQuery] = useState<string>('TMD-OP-8924');
  const [verifiedOperator, setVerifiedOperator] = useState<CertifiedOperatorBadge | null>(DEMO_VERIFIED_OPERATORS[0]);
  const [searchNotFound, setSearchNotFound] = useState<boolean>(false);

  const handleVerifyOperator = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    const found = DEMO_VERIFIED_OPERATORS.find(
      op => op.licenseNumber.toLowerCase() === query || op.cedula.toLowerCase().includes(query) || op.operatorName.toLowerCase().includes(query)
    );

    if (found) {
      setVerifiedOperator(found);
      setSearchNotFound(false);
    } else {
      setVerifiedOperator(null);
      setSearchNotFound(true);
    }
  };

  const handleOpenEnroll = (course: AcademyCourse) => {
    setSelectedCourse(course);
    setEnrollModalOpen(true);
  };

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnrollSuccess(true);
    setTimeout(() => {
      setEnrollModalOpen(false);
      setEnrollSuccess(false);
      setSelectedCourse(null);
    }, 2400);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 transition-colors pb-24 font-mono">
      {/* Top Banner */}
      <div className="bg-zinc-950 text-white border-b border-zinc-800">
        <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8 sm:py-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-mono font-bold uppercase tracking-wider mb-2.5">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>TMD ACADEMY • CENTRO DE CAPACITACIÓN PESADA</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-wider font-display text-white mb-2">
              CERTIFICACIÓN DE <span className="text-amber-400">OPERADORES & TÉCNICOS</span> EN RD
            </h1>
            <p className="text-xs text-zinc-400 font-mono uppercase leading-relaxed">
              Programas avalados por distribuidores de JCB y LiuGong. Formación práctica en campo para maximizar la productividad de la maquinaria, reducir el consumo de combustible diésel y prevenir accidentes en obra.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 mt-6">
        
        {/* Verification Engine Box */}
        <div className="bg-zinc-950 rounded-[5px] p-4 sm:p-6 border border-zinc-800 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>VALIDADOR OFICIAL DE LICENCIAS DE OPERADOR</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase font-display">
                VERIFICAR CARNET / LICENCIA TMD
              </h2>
              <p className="text-xs text-zinc-400 uppercase">
                Audite en tiempo real la validez del carnet de cualquier operador para ingreso a proyectos mineros o canteras.
              </p>
            </div>

            <form onSubmit={handleVerifyOperator} className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="NO. LICENCIA (EJ. TMD-OP-8924) O CÉDULA..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-[3px] bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 uppercase focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase transition-all cursor-pointer shrink-0"
              >
                VALIDAR
              </button>
            </form>
          </div>

          {/* Verification Result Card */}
          {verifiedOperator && (
            <div className="mt-4 p-4 rounded-[4px] bg-zinc-900 text-white border border-zinc-800 shadow-md">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-20 h-24 rounded-[3px] overflow-hidden bg-zinc-800 border border-amber-500/40 shrink-0">
                  <img 
                    src={verifiedOperator.photoUrl} 
                    alt={verifiedOperator.operatorName} 
                    className="w-full h-full object-cover" 
                  />
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase mb-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>LICENCIA VIGENTE & CERTIFICADA</span>
                  </div>

                  <h3 className="text-base font-bold text-white uppercase font-display">
                    {verifiedOperator.operatorName}
                  </h3>
                  <div className="text-[11px] text-zinc-400 uppercase space-y-0.5 mt-0.5">
                    <div>NO. LICENCIA: <strong className="text-amber-400 font-mono">{verifiedOperator.licenseNumber}</strong> • CÉDULA: <strong className="text-zinc-200">{verifiedOperator.cedula}</strong></div>
                    <div>EMPRESA: <strong className="text-zinc-200">{verifiedOperator.company}</strong></div>
                    <div>CATEGORÍA: <strong className="text-white">{verifiedOperator.certificationLevel}</strong></div>
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5 justify-center sm:justify-start">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">EQUIPOS HOMOLOGADOS:</span>
                    {verifiedOperator.approvedMachines.map(m => (
                      <span key={m} className="px-2 py-0.5 rounded-[3px] bg-zinc-950 text-amber-400 text-[10px] font-bold border border-zinc-800 uppercase">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-center sm:text-right shrink-0 border-t sm:border-t-0 sm:border-l border-zinc-800 pt-3 sm:pt-0 sm:pl-4">
                  <div className="w-14 h-14 bg-zinc-950 border border-zinc-800 p-1 rounded-[3px] mx-auto sm:ml-auto mb-1 flex items-center justify-center text-amber-400 font-bold text-[9px] uppercase">
                    QR OK
                  </div>
                  <span className="text-[9px] text-zinc-500 uppercase block">VIGENCIA HASTA:</span>
                  <strong className="text-xs text-white uppercase">{verifiedOperator.expiryDate}</strong>
                </div>
              </div>
            </div>
          )}

          {searchNotFound && (
            <div className="mt-4 p-4 rounded-[4px] bg-zinc-900 border border-rose-500/30 text-rose-400 text-center text-xs uppercase">
              NO SE ENCONTRÓ NINGUNA CREDENCIAL REGISTRADA CON <strong>"{searchQuery}"</strong>. COMPRUEBE EL NÚMERO DE LICENCIA O COMUNÍQUESE CON TMD ACADEMY.
            </div>
          )}
        </div>

        {/* Available Academy Courses */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white uppercase font-display">
                CURSOS Y CERTIFICACIONES ACTIVAS
              </h2>
              <p className="text-xs text-zinc-400 uppercase">
                INSTALACIONES CENTRALES EN KM 22 DUARTE Y PROGRAMAS IN-SITU PARA PROYECTOS
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courses.map(course => (
              <div
                key={course.id}
                className="bg-zinc-950 rounded-[5px] p-4 sm:p-5 border border-zinc-800 shadow-md hover:border-zinc-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-[3px] bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">
                      {course.level}
                    </span>
                    <span className="text-xs font-mono font-bold text-zinc-500">
                      {course.code}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white uppercase font-display mb-1.5 leading-snug">
                    {course.title}
                  </h3>

                  <p className="text-[11px] text-zinc-400 uppercase leading-relaxed mb-3">
                    {course.description}
                  </p>

                  <div className="space-y-1 py-2 px-2.5 rounded-[3px] bg-zinc-900 text-[10px] text-zinc-400 font-mono uppercase mb-3 border border-zinc-800">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>DURACIÓN: <strong className="text-zinc-200">{course.durationHours} HORAS</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-amber-400" />
                      <span>{course.nextSchedule}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-emerald-400" />
                      <span>CUPOS: <strong className="text-emerald-400">{course.seatsAvailable} PLAZAS</strong></span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold uppercase text-zinc-500 block mb-1">
                      TEMARIO PRINCIPAL:
                    </span>
                    <ul className="space-y-0.5">
                      {course.syllabus.slice(0, 3).map((syl, i) => (
                        <li key={i} className="text-[10px] text-zinc-400 uppercase flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                          <span className="truncate">{syl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-zinc-500 uppercase block">INVERSIÓN:</span>
                    <div className="text-sm font-black text-amber-400">
                      {formatPrice(course.priceUsd)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenEnroll(course)}
                    className="px-3 py-1.5 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>INSCRIBIRSE</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Enrollment Modal */}
      {enrollModalOpen && selectedCourse && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 rounded-[5px] p-6 max-w-md w-full border border-zinc-800 shadow-2xl relative font-mono text-white">
            {enrollSuccess ? (
              <div className="text-center py-6">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <h3 className="text-base font-black text-white uppercase font-display mb-1">
                  ¡INSCRIPCIÓN RESERVADA!
                </h3>
                <p className="text-xs text-zinc-400 uppercase">
                  LA SECRETARÍA ACADÉMICA DE TMD SE PONDRÁ EN CONTACTO PARA REMITIR LA CONFIRMACIÓN DE PAGO E INSTRUCCIONES DE EPI.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3.5">
                  <div>
                    <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">
                      TMD ACADEMY RD
                    </span>
                    <h3 className="text-sm font-black uppercase text-white font-display">
                      INSCRIPCIÓN DE PARTICIPANTE
                    </h3>
                  </div>
                  <button onClick={() => setEnrollModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                    ✕
                  </button>
                </div>

                <div className="p-2.5 rounded-[3px] bg-zinc-900 border border-zinc-800 mb-3.5 text-xs uppercase">
                  <div className="font-bold text-white font-display">{selectedCourse.title}</div>
                  <div className="text-zinc-400 text-[10px]">{selectedCourse.nextSchedule}</div>
                  <div className="text-amber-400 font-black mt-0.5">PRECIO: {formatPrice(selectedCourse.priceUsd)}</div>
                </div>

                <form onSubmit={handleEnrollSubmit} className="space-y-3 text-xs uppercase">
                  <div>
                    <label className="block font-bold text-zinc-300 mb-1">
                      NOMBRE DEL PARTICIPANTE U OPERADOR
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MANUEL DE JESÚS SANTOS"
                      className="w-full px-3 py-1.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-white uppercase focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-300 mb-1">
                      CÉDULA / PASAPORTE
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="001-XXXXXXX-X"
                      className="w-full px-3 py-1.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-white uppercase focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-300 mb-1">
                      EMPRESA O CONTRATISTA (OPCIONAL)
                    </label>
                    <input
                      type="text"
                      placeholder="CONSTRUCTORA DEL ESTE S.A."
                      className="w-full px-3 py-1.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-white uppercase focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEnrollModalOpen(false)}
                      className="px-4 py-1.5 rounded-[3px] text-zinc-400 font-bold hover:bg-zinc-900 border border-zinc-800 cursor-pointer"
                    >
                      CANCELAR
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-1.5 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black font-black uppercase shadow-md cursor-pointer"
                    >
                      CONFIRMAR RESERVA
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
