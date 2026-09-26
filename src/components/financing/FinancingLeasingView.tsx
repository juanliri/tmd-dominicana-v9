import React, { useState } from 'react';
import { 
  Landmark, 
  Calculator, 
  CheckCircle2, 
  FileSpreadsheet, 
  ShieldCheck, 
  Building,
  Scale
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { MACHINES_DATA, USD_TO_DOP_RATE } from '../../data/catalog';
import { UniversalBreadcrumbs } from '../common/navigation/UniversalBreadcrumbs';
import { 
  TmdButton, 
  TmdCard, 
  TmdBadge, 
  TmdSelect 
} from '../common/tmd-industrial';

interface FinancingLeasingViewProps {
  onNavigate: (route: string) => void;
}

const BANK_PARTNERS = [
  {
    name: 'Banco Popular Dominicano',
    badge: 'Leasing Equipos Pesados',
    badgeVariant: 'amber' as const,
    rateText: 'Tasas preferenciales desde 8.95% USD / 12.5% DOP',
    termText: 'Plazos de 12 hasta 60 meses con cuota residual',
    requirements: ['Estados financieros auditados (últimos 2 años)', 'RNC activo y al día en DGII', 'Proforma oficial TMD Dominicana']
  },
  {
    name: 'Banco BHD',
    badge: 'Crédito Constructor & Pymes',
    badgeVariant: 'cyan' as const,
    rateText: 'Financiamiento hasta el 80% del valor FOB/CIF',
    termText: 'Períodos de gracia para proyectos de infraestructura',
    requirements: ['Contrato de obra o flujo de caja proyectado', 'Garantía del equipo con GPS LiveLink™', 'Cédula/Poder de representantes legales']
  },
  {
    name: 'Banco de Reservas (Banreservas)',
    badge: 'Sector Público & Agropecuario',
    badgeVariant: 'emerald' as const,
    rateText: 'Línea de crédito especial para contratistas MOPC',
    termText: 'Facilidades de desembolso contra cubicaciones',
    requirements: ['Cubicaciones aprobadas o licitación pública', 'Certificación de distribuidor TMD', 'Póliza de seguro todo riesgo contratista']
  }
];

const TAX_EXEMPTIONS = [
  {
    title: 'Ley 28-01 / 12-21 (Desarrollo Fronterizo)',
    desc: 'Exoneración total de aranceles e ITBIS para maquinaria pesada destinada a proyectos productivos en las provincias fronterizas (Pedernales, Montecristi, Dajabón, Elías Piña, Jimaní).',
    benefit: 'Ahorro de hasta 18% ITBIS + Gravámenes Aduanales'
  },
  {
    title: 'Régimen de Fomento Agrícola (Ley de Fomento Agropecuario)',
    desc: 'Tractores agrícolas y excavadoras para adecuación de terrenos de cultivo están libres de aranceles de importación.',
    benefit: 'Tasa 0% arancel aduanero'
  },
  {
    title: 'Ley 158-01 (CONFOTUR - Turismo)',
    desc: 'Exención de impuestos de importación para equipos pesados utilizados en el desarrollo de infraestructuras hoteleras y turísticas calificadas.',
    benefit: '100% Exención de ITBIS y Arancel'
  }
];

export const FinancingLeasingView: React.FC<FinancingLeasingViewProps> = ({ onNavigate }) => {
  const [selectedMachineId, setSelectedMachineId] = useState<string>(MACHINES_DATA[0]?.id || '');
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [termMonths, setTermMonths] = useState<number>(36);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(8.95);
  const [includeInsurance, setIncludeInsurance] = useState<boolean>(true);

  const selectedMachine = MACHINES_DATA.find((m) => m.id === selectedMachineId) || MACHINES_DATA[0];
  const machinePrice = selectedMachine ? selectedMachine.basePriceUsd : 100000;
  
  const downPaymentAmount = (machinePrice * downPaymentPercent) / 100;
  const loanPrincipal = machinePrice - downPaymentAmount;
  
  const monthlyRate = annualInterestRate / 100 / 12;
  const monthlyBasePayment = monthlyRate > 0 
    ? (loanPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) / (Math.pow(1 + monthlyRate, termMonths) - 1)
    : loanPrincipal / termMonths;
  
  const estimatedInsuranceMonthly = includeInsurance ? (machinePrice * 0.012) / 12 : 0;
  const totalMonthlyPayment = Math.round(monthlyBasePayment + estimatedInsuranceMonthly);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 text-white font-mono">
      {/* Universal Breadcrumbs */}
      <UniversalBreadcrumbs currentRoute="#/financing" onNavigate={onNavigate} />

      {/* 1. Hero Header */}
      <TmdCard variant="machined" className="p-6 sm:p-8 space-y-3">
        <TmdBadge variant="amber" icon={Landmark}>
          SOLUCIONES DE CAPITAL & RESPALDO BANCARIO TMD
        </TmdBadge>
        <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-wider font-display">
          FINANCIAMIENTO & LEASING DE <span className="text-amber-400">MAQUINARIA PESADA</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 uppercase leading-relaxed max-w-3xl">
          Adquiere tu flota con planes de arrendamiento financiero a medida, tasas competitivas con la banca dominicana y asesoría en exoneraciones fiscales DGII / Aduanas.
        </p>
      </TmdCard>

      {/* 2. Interactive Financing Simulator */}
      <TmdCard variant="accent" className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Input Controls */}
        <div className="lg:col-span-7 space-y-5">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-black text-amber-400 uppercase tracking-wider mb-1 font-display">
              <Calculator className="w-3.5 h-3.5" />
              <span>SIMULADOR DE CUOTA MENSUAL ESTIMADA</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase font-display">
              CONFIGURA TU ARRENDAMIENTO FINANCIERO
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            {/* Machine Selection using TmdSelect */}
            <TmdSelect
              label="SELECCIONA LA MÁQUINA DE INTERÉS:"
              value={selectedMachineId}
              onChange={(e) => setSelectedMachineId(e.target.value)}
              options={MACHINES_DATA.map((m) => ({
                value: m.id,
                label: `${m.brand} ${m.modelCode} - ${m.name} (US$ ${m.basePriceUsd.toLocaleString()})`
              }))}
            />

            {/* Down Payment Slider */}
            <div>
              <div className="flex justify-between text-zinc-300 mb-1">
                <span className="font-bold uppercase text-[11px]">INICIAL / PRONTO PAGO: {downPaymentPercent}%</span>
                <span className="font-mono text-amber-400 font-black">US$ {downPaymentAmount.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-zinc-900 rounded-[2px]"
              />
              <div className="flex justify-between text-[9px] text-zinc-500 mt-1 font-mono uppercase">
                <span>10% MÍNIMO</span>
                <span>30% TÍPICO</span>
                <span>50% MÁXIMO</span>
              </div>
            </div>

            {/* Loan Term Selection */}
            <div>
              <label className="block text-zinc-400 font-bold mb-1.5 uppercase text-[10px]">
                PLAZO DEL FINANCIAMIENTO:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[12, 24, 36, 48].map((months) => (
                  <TmdButton
                    key={months}
                    type="button"
                    variant={termMonths === months ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setTermMonths(months)}
                  >
                    {months}M
                  </TmdButton>
                ))}
              </div>
            </div>

            {/* Interest Rate & Insurance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <TmdSelect
                label="TASA ANUAL ESTIMADA (USD):"
                value={annualInterestRate.toString()}
                onChange={(e) => setAnnualInterestRate(Number(e.target.value))}
                options={[
                  { value: '7.95', label: '7.95% (Corporativa Preferencial)' },
                  { value: '8.95', label: '8.95% (Estándar Banreservas / Popular)' },
                  { value: '9.5', label: '9.50% (Pyme Referencial)' },
                  { value: '11.0', label: '11.00% (Crédito Flexible)' }
                ]}
              />

              <div className="flex items-center gap-2.5 p-3 rounded-[4px] bg-zinc-900/90 border border-zinc-700/80 mt-auto">
                <input
                  type="checkbox"
                  id="inc-ins"
                  checked={includeInsurance}
                  onChange={(e) => setIncludeInsurance(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded-[2px] cursor-pointer"
                />
                <label htmlFor="inc-ins" className="text-zinc-300 text-[11px] font-bold cursor-pointer uppercase">
                  SEGURO TODO RIESGO (+US$ {Math.round(estimatedInsuranceMonthly)}/MES)
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Calculated Summary Card */}
        <div className="lg:col-span-5 bg-zinc-900/90 rounded-[5px] border border-zinc-700/80 p-6 sm:p-7 space-y-5 flex flex-col justify-between font-mono">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1">
              CUOTA MENSUAL PROYECTADA
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                US$ {totalMonthlyPayment.toLocaleString()}
              </span>
              <span className="text-xs text-zinc-400">/ MES</span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1 font-mono uppercase">
              APROX. RD$ {(totalMonthlyPayment * USD_TO_DOP_RATE).toLocaleString()} / MES (TASA {USD_TO_DOP_RATE})
            </p>
          </div>

          <div className="space-y-2 py-3.5 border-y border-zinc-800 text-[11px] uppercase">
            <div className="flex justify-between text-zinc-400">
              <span>VALOR DEL EQUIPO:</span>
              <span className="font-mono text-zinc-200">US$ {machinePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>MONTO FINANCIADO:</span>
              <span className="font-mono text-zinc-200">US$ {loanPrincipal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>PLAZO ACORDADO:</span>
              <span className="font-mono text-zinc-200">{termMonths} CUOTAS MENSUALES</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>TELEMETRÍA LIVELINK™:</span>
              <span className="font-mono text-emerald-400 font-bold">INCLUIDA SIN COSTO</span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <TmdButton
              variant="glow"
              size="lg"
              fullWidth
              icon={FileSpreadsheet}
              onClick={() => onNavigate('#/checkout')}
            >
              EMITIR PROFORMA BANCARIA FORMAL
            </TmdButton>
            <p className="text-[9px] text-zinc-500 text-center leading-snug uppercase">
              *Valores referenciales sujetos a aprobación crediticia de la entidad financiera.
            </p>
          </div>
        </div>
      </TmdCard>

      {/* 3. Bank Partners in Dominican Republic */}
      <div className="space-y-4 font-mono">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-display">
              ALIANZAS ESTRATÉGICAS
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase font-display">
              BANCOS E INSTITUCIONES FINANCIERAS ALIADAS
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BANK_PARTNERS.map((bank, bIdx) => (
            <TmdCard
              key={bIdx}
              variant="machined"
              className="p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TmdBadge variant={bank.badgeVariant} size="xs">
                    {bank.badge}
                  </TmdBadge>
                </div>
                <h3 className="text-sm font-black text-white mb-1 uppercase font-display">
                  {bank.name}
                </h3>
                <p className="text-xs font-bold text-amber-400 mb-1 uppercase">
                  {bank.rateText}
                </p>
                <p className="text-[11px] text-zinc-400 uppercase">
                  {bank.termText}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-800 text-xs space-y-1.5 uppercase">
                <span className="text-[9px] font-bold uppercase text-zinc-500 block">REQUISITOS PRINCIPALES:</span>
                {bank.requirements.map((req, rIdx) => (
                  <div key={rIdx} className="flex items-start gap-1.5 text-zinc-300 text-[10px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </TmdCard>
          ))}
        </div>
      </div>

      {/* 4. Tax Exemptions & Incentives in RD */}
      <TmdCard variant="default" className="p-6 space-y-5 font-mono">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-amber-400 mb-1 font-display">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>MARCO LEGAL & BENEFICIOS FISCALES</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white uppercase font-display">
            EXONERACIONES DE IMPUESTOS & LEYES ESPECIALES
          </h3>
          <p className="text-xs text-zinc-400 mt-1 uppercase">
            Nuestro departamento corporativo asiste en la tramitación de certificaciones ante Hacienda y DGII para proyectos acogidos a regímenes especiales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TAX_EXEMPTIONS.map((tax, tIdx) => (
            <div key={tIdx} className="p-4 rounded-[3px] bg-zinc-900/80 border border-zinc-800 space-y-2">
              <h4 className="text-xs font-black text-amber-400 uppercase font-display">{tax.title}</h4>
              <p className="text-[10px] text-zinc-300 leading-relaxed uppercase">{tax.desc}</p>
              <div className="pt-2 border-t border-zinc-800/80">
                <span className="text-[9px] font-bold text-emerald-400 block uppercase">
                  BENEFICIO: {tax.benefit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </TmdCard>
    </div>
  );
};
