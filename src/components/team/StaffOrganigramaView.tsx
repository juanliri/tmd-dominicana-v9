import React, { useState } from 'react';
import { 
  StaffMember, 
  STAFF_PROFILES_DATA 
} from '../../data/staffData';
import { 
  ShieldCheck, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  Wrench, 
  TrendingUp, 
  Cpu, 
  Layers, 
  Users,
  CheckCircle2,
  Sparkles,
  MapPin,
  Clock,
  MessageSquare,
  GraduationCap
} from 'lucide-react';

interface StaffOrganigramaViewProps {
  onSelectMember: (member: StaffMember) => void;
  searchQuery?: string;
}

export const StaffOrganigramaView: React.FC<StaffOrganigramaViewProps> = ({
  onSelectMember,
  searchQuery = ''
}) => {
  const [activeDivision, setActiveDivision] = useState<string>('all');

  const getMember = (id: string): StaffMember => {
    return STAFF_PROFILES_DATA.find(m => m.id === id) || STAFF_PROFILES_DATA[0];
  };

  // Executive Leadership (C-Suite & Founders)
  const ceo = getMember('staff-01'); // Eduardo López (CEO)
  const cco = getMember('staff-02'); // Jorge Torres (CCO)
  const cfo = getMember('staff-03'); // Blasina Fabián (CFO)
  const coo = getMember('staff-04'); // Brito Fuentes (COO)
  const postSalesDir = getMember('staff-05'); // Leonardo Encarnación (Dir. Posventa)
  const cio = getMember('staff-10'); // Eduardo E. López (CIO)

  // Divisional Pillars & Specialized Teams
  const commercialTeam = [getMember('staff-07'), getMember('staff-08')]; // Miguel Ángel Cruz, Perkin Soriano
  const operationsTeam = [getMember('staff-09')]; // Carmen Jáquez (Repuestos)
  const serviceTeam = [getMember('staff-06'), getMember('staff-12')]; // Julio Aguasvivas, Edwin Martínez
  const techTeam = [getMember('staff-11')]; // Elvys Alcántara

  // Helper to check search matches
  const isMatch = (member: StaffMember) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(q) ||
      member.role.toLowerCase().includes(q) ||
      member.department.toLowerCase().includes(q) ||
      member.keySpecialties.some((s: string) => s.toLowerCase().includes(q)) ||
      member.certifications.some((c: string) => c.toLowerCase().includes(q))
    );
  };

  const renderStaffCard = (
    member: StaffMember, 
    level: 'ceo' | 'director' | 'manager',
    theme: 'amber' | 'blue' | 'emerald' | 'rose' | 'teal' = 'amber'
  ) => {
    const matched = isMatch(member);
    const isCeo = level === 'ceo';
    const isDirector = level === 'director';

    return (
      <div
        onClick={() => onSelectMember(member)}
        className={`group relative transition-all duration-200 cursor-pointer rounded-[5px] p-3 text-left border font-mono ${
          matched ? 'opacity-100' : 'opacity-35 grayscale'
        } ${
          isCeo
            ? 'bg-zinc-900 border-amber-400 shadow-md hover:border-amber-300'
            : isDirector
            ? 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 shadow-xs hover:border-zinc-700'
            : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-800 hover:border-zinc-700'
        }`}
      >
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-[3px] ${
            isCeo
              ? 'bg-amber-400 text-black font-extrabold'
              : isDirector
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
          }`}>
            {member.department}
          </span>
          <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1 uppercase">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{member.experienceYears}+ AÑOS</span>
          </span>
        </div>

        {/* Member Avatar & Details */}
        <div className="flex items-start gap-2.5">
          <div className="relative shrink-0">
            <img
              src={member.photoUrl}
              alt={member.name}
              referrerPolicy="no-referrer"
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-[3px] object-cover object-top border ${
                isCeo ? 'border-amber-400 ring-1 ring-amber-400/40' : 'border-zinc-700'
              } group-hover:scale-105 transition-transform duration-200`}
            />
            {member.isLeadership && (
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 text-black text-[8px] font-black flex items-center justify-center shadow-xs">
                ★
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-black text-white group-hover:text-amber-400 transition-colors truncate uppercase font-display">
              {member.name}
            </h4>
            <p className="text-[10px] text-amber-400/90 font-bold leading-tight mt-0.5 line-clamp-2 uppercase">
              {member.role}
            </p>
            <p className="text-[9px] text-zinc-500 mt-1 line-clamp-1 flex items-center gap-1 uppercase">
              <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
              <span>{member.location.split(',')[0]}</span>
            </p>
          </div>
        </div>

        {/* Certifications preview */}
        {member.certifications.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-between gap-1 text-[9px] uppercase">
            <span className="text-zinc-400 truncate flex items-center gap-1">
              <Award className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">{member.certifications[0]}</span>
            </span>
            <span className="text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform shrink-0">
              FICHA →
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 font-mono">
      {/* 1. LEVEL 1: EXECUTIVE LEADERSHIP (CEO & C-SUITE) */}
      <div className="p-4 sm:p-6 rounded-[5px] bg-zinc-900 border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="text-center max-w-2xl mx-auto mb-5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[3px] bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] font-black uppercase tracking-wider mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>NIVEL 1 • ALTA DIRECCIÓN & COMITÉ EJECUTIVO</span>
          </span>
          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight uppercase font-display">
            PRESIDENCIA & CONSEJO DIRECTIVO TMD
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Liderazgo estratégico con más de 20 años al servicio del desarrollo de infraestructura, minería y agro en RD.
          </p>
        </div>

        {/* CEO Center Card */}
        <div className="max-w-md mx-auto mb-5">
          {renderStaffCard(ceo, 'ceo', 'amber')}
        </div>

        {/* Direct Subordinate Directors (C-Suite Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-4 border-t border-zinc-800">
          {renderStaffCard(cco, 'director', 'blue')}
          {renderStaffCard(cfo, 'director', 'amber')}
          {renderStaffCard(coo, 'director', 'emerald')}
          {renderStaffCard(postSalesDir, 'director', 'rose')}
          {renderStaffCard(cio, 'director', 'teal')}
        </div>
      </div>

      {/* 2. DIVISIONAL PILLARS & OPERATIONAL TEAMS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2 uppercase font-display">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>DIVISIONES OPERATIVAS & ESPECIALISTAS TÉCNICOS</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Equipos de ingeniería, servicio de campo, posventa y telemática en acción directa.
            </p>
          </div>

          {/* Division Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'TODAS LAS DIVISIONES' },
              { id: 'commercial', label: 'VENTAS & PROYECTOS' },
              { id: 'service', label: 'TALLER & SOS 24/7' },
              { id: 'ops', label: 'REPUESTOS & LOGÍSTICA' },
              { id: 'tech', label: 'IOT & TELEMÁTICA' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveDivision(tab.id)}
                className={`px-2.5 py-1 rounded-[3px] text-xs font-bold transition-all cursor-pointer whitespace-nowrap uppercase ${
                  activeDivision === tab.id
                    ? 'bg-amber-400 text-black font-black shadow-xs'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Pillar A: Comercial & Minería */}
          {(activeDivision === 'all' || activeDivision === 'commercial') && (
            <div className="p-3.5 rounded-[5px] bg-zinc-900 border border-zinc-800 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <h4 className="text-xs font-black text-white uppercase">
                    Ventas & Grandes Cuentas
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">2 Especialistas</span>
              </div>
              <div className="space-y-2">
                {commercialTeam.map(member => (
                  <div key={member.id}>
                    {renderStaffCard(member, 'manager', 'blue')}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pillar B: Servicio Técnico, Taller & SOS */}
          {(activeDivision === 'all' || activeDivision === 'service') && (
            <div className="p-3.5 rounded-[5px] bg-zinc-900 border border-zinc-800 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-rose-400" />
                  <h4 className="text-xs font-black text-white uppercase">
                    Servicio de Campo & SOS
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">2 Especialistas</span>
              </div>
              <div className="space-y-2">
                {serviceTeam.map(member => (
                  <div key={member.id}>
                    {renderStaffCard(member, 'manager', 'rose')}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pillar C: Repuestos & Cadena de Suministro */}
          {(activeDivision === 'all' || activeDivision === 'ops') && (
            <div className="p-3.5 rounded-[5px] bg-zinc-900 border border-zinc-800 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-black text-white uppercase">
                    Repuestos & Suministros
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">1 Especialista</span>
              </div>
              <div className="space-y-2">
                {operationsTeam.map(member => (
                  <div key={member.id}>
                    {renderStaffCard(member, 'manager', 'emerald')}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pillar D: Tecnología, IoT & Redes */}
          {(activeDivision === 'all' || activeDivision === 'tech') && (
            <div className="p-3.5 rounded-[5px] bg-zinc-900 border border-zinc-800 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-black text-white uppercase">
                    IoT & Telemática LiveLink™
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">1 Especialista</span>
              </div>
              <div className="space-y-2">
                {techTeam.map(member => (
                  <div key={member.id}>
                    {renderStaffCard(member, 'manager', 'teal')}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
