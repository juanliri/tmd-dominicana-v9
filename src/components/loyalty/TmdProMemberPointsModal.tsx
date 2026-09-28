import React, { useState } from 'react';
import {
  Award,
  Gift,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  X,
  CreditCard,
  Building2,
  ArrowRight,
  TrendingUp,
  Ticket
} from 'lucide-react';

interface TmdProMemberPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractorName?: string;
  rnc?: string;
}

interface RewardItem {
  id: string;
  title: string;
  pointsCost: number;
  usdValue: number;
  category: string;
  description: string;
}

export const TmdProMemberPointsModal: React.FC<TmdProMemberPointsModalProps> = ({
  isOpen,
  onClose,
  contractorName = 'Constructora Malespín S.R.L.',
  rnc = '1-01-02412-2'
}) => {
  const [pointsBalance, setPointsBalance] = useState<number>(3480);
  const [memberTier, setMemberTier] = useState<'Plata' | 'Oro' | 'Platino'>('Oro');
  const [redeemedVoucher, setRedeemedVoucher] = useState<string | null>(null);

  const rewards: RewardItem[] = [
    {
      id: 'rew-01',
      title: 'Kit de Filtros Motor Cummins 500h',
      pointsCost: 500,
      usdValue: 95,
      category: 'Repuestos Genuinos',
      description: 'Filtro de aceite, filtro primario de combustible con trampa de agua y filtro secundario.'
    },
    {
      id: 'rew-02',
      title: 'Diagnóstico en Obra con Camión Taller 4x4',
      pointsCost: 1200,
      usdValue: 240,
      category: 'Servicio Técnico',
      description: 'Visita de técnico senior con escáner de diagnóstico Cummins InPower/JCB ServiceMaster.'
    },
    {
      id: 'rew-03',
      title: 'Juego Completo de Dientes HD de Balde (5 Uds)',
      pointsCost: 2000,
      usdValue: 380,
      category: 'Herramientas de Corte (G.E.T.)',
      description: 'Puntas de penetración reforzadas 1U3352 con pasadores de retención para roca abrasiva.'
    },
    {
      id: 'rew-04',
      title: 'Flete Gratuito en Cama Baja TMD (Santo Domingo)',
      pointsCost: 3500,
      usdValue: 700,
      category: 'Logística Pesada',
      description: 'Movilización de excavadora o rodillo en lowboy cama baja de 50 toneladas dentro del Gran Santo Domingo.'
    }
  ];

  const transactions = [
    { id: 'tx-1', date: '2026-03-20', desc: 'Compra Repuestos Factura B0100049212', points: '+680 pts', type: 'earn' },
    { id: 'tx-2', date: '2026-03-10', desc: 'Mantenimiento 1,000h Excavadora 922E', points: '+450 pts', type: 'earn' },
    { id: 'tx-3', date: '2026-02-18', desc: 'Canje de Cupón Diagnóstico Escáner', points: '-1,200 pts', type: 'redeem' },
    { id: 'tx-4', date: '2026-01-25', desc: 'Adquisición Rodillo Ammann ASC 110', points: '+3,550 pts', type: 'earn' }
  ];

  if (!isOpen) return null;

  const handleRedeemReward = (reward: RewardItem) => {
    if (pointsBalance < reward.pointsCost) return;
    setPointsBalance(pointsBalance - reward.pointsCost);
    setRedeemedVoucher(`VOUCHER-TMD-${Math.floor(100000 + Math.random() * 900000)}`);
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
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-amber-400 text-black uppercase tracking-wider">
                  CLUB PRO-MEMBER TMD
                </span>
                <span className="text-xs text-zinc-400 font-sans">
                  Fidelización & Beneficios
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-white mt-0.5">
                Puntos & Beneficios de Flota
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

        {/* Balance & Tier Card */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-amber-950/20 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div>
            <span className="text-[10px] text-zinc-400 uppercase font-display block">Titular del Programa:</span>
            <span className="font-bold text-white text-sm">{contractorName}</span>
            <span className="text-[10px] text-zinc-500 font-mono block">RNC: {rnc}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block font-display">
                Puntos Disponibles
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                {pointsBalance.toLocaleString()} <span className="text-xs text-amber-400">PTS</span>
              </span>
            </div>

            <div className="p-3 rounded-[3px] bg-zinc-950 border border-amber-400/30 text-center">
              <span className="text-[9px] text-zinc-400 uppercase block">Nivel Actual</span>
              <span className="text-xs font-black text-amber-400 uppercase font-display flex items-center gap-1 justify-center mt-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {memberTier}
              </span>
            </div>
          </div>
        </div>

        {/* Voucher Alert if redeemed */}
        {redeemedVoucher && (
          <div className="p-3 bg-emerald-500/10 border-b border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              <span>Cupón Canjeado con Éxito: <strong>{redeemedVoucher}</strong> (Presentar en mostrador Km 22)</span>
            </div>
            <button
              onClick={() => setRedeemedVoucher(null)}
              className="text-emerald-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Rewards Catalog */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[60vh] text-xs">
          <span className="font-bold text-white text-[11px] uppercase tracking-wider block font-display">
            Catálogo de Recompensas Disponibles:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rewards.map(reward => {
              const canAfford = pointsBalance >= reward.pointsCost;
              return (
                <div
                  key={reward.id}
                  className={`p-3.5 rounded-[3px] border space-y-2 flex flex-col justify-between ${
                    canAfford
                      ? 'bg-zinc-900 border-zinc-800 hover:border-amber-400/40'
                      : 'bg-zinc-900/40 border-zinc-850 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-1.5 py-0.5 rounded-[2px] bg-zinc-800 text-amber-400 font-bold text-[9px] uppercase">
                        {reward.category}
                      </span>
                      <span className="text-zinc-400 font-mono text-[10px]">
                        Valor: US$ {reward.usdValue}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-xs font-display">
                      {reward.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                      {reward.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                    <span className="font-mono font-bold text-amber-400 text-xs">
                      {reward.pointsCost} Puntos
                    </span>
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => handleRedeemReward(reward)}
                      className={`px-3 py-1 rounded-[2px] text-xs font-bold uppercase transition-colors cursor-pointer ${
                        canAfford
                          ? 'bg-amber-400 hover:bg-amber-300 text-black'
                          : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Canjear' : 'Puntos Insuficientes'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Points Movement History */}
          <div className="pt-2">
            <span className="font-bold text-white text-[11px] uppercase tracking-wider block font-display mb-2">
              Historial de Movimientos de Puntos:
            </span>
            <div className="space-y-1.5">
              {transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between p-2.5 bg-zinc-900 border border-zinc-800 rounded-[2px] text-xs">
                  <div>
                    <span className="font-bold text-zinc-200 block text-xs">{t.desc}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{t.date}</span>
                  </div>
                  <span className={`font-mono font-bold ${
                    t.type === 'earn' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {t.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 shrink-0">
          <span>Acumulas 1 punto por cada US$ 10 facturados en repuestos o servicios</span>
          <span className="text-amber-400 font-bold font-mono">TMD Pro-Member Core</span>
        </div>
      </div>
    </div>
  );
};
