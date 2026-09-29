import React from 'react';
import { Gift, Sparkles, Check } from 'lucide-react';
import { ProMemberReward } from '../../../types';
import { PRO_REWARDS_CATALOG } from '../../../data/proMemberData';
import { USD_TO_DOP_RATE } from '../../../data/catalog';

interface ProRewardsCatalogProps {
  points: number;
  redeemedRewardIds: string[];
  onRedeemReward: (reward: ProMemberReward) => void;
}

export const ProRewardsCatalog: React.FC<ProRewardsCatalogProps> = ({
  points,
  redeemedRewardIds,
  onRedeemReward
}) => {
  return (
    <div className="space-y-4 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-black font-display uppercase tracking-tight text-white flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-400" />
            <span>Catálogo de Canje de Recompensas TMD Pro</span>
          </h3>
          <p className="text-xs text-zinc-400 font-sans">
            Canjea tus puntos acumulados por bonos de compra, análisis de fluidos y servicios técnicos para tus equipos.
          </p>
        </div>
        <div className="text-xs font-mono font-black text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-[2px] border border-amber-500/20 self-start sm:self-auto">
          Balance disponible: {points.toLocaleString()} pts
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch">
        {PRO_REWARDS_CATALOG.map((reward) => {
          const canAfford = points >= reward.pointsCost;
          const isAlreadyRedeemed = redeemedRewardIds.includes(reward.id);

          return (
            <div
              key={reward.id}
              className="p-5 rounded-[3px] bg-zinc-900 border border-zinc-800 hover:border-amber-400/40 transition-all flex flex-col justify-between h-full gap-4 shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-[2px] text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {reward.pointsCost} Puntos
                  </span>
                  {reward.badge && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-[2px] bg-zinc-800 text-zinc-300">
                      {reward.badge}
                    </span>
                  )}
                </div>

                <h4 className="font-bold font-display uppercase tracking-tight text-sm text-white">
                  {reward.title}
                </h4>

                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  {reward.description}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                    Valor Estimado
                  </span>
                  <span className="text-xs font-black text-white font-mono">
                    US$ {reward.valueEstimateUsd} <span className="text-[10px] font-normal text-zinc-500">(~RD$ {(reward.valueEstimateUsd * USD_TO_DOP_RATE).toLocaleString()})</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onRedeemReward(reward)}
                  disabled={!canAfford}
                  className={`px-3.5 py-2 rounded-[2px] text-xs font-black font-display uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                    canAfford
                      ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-md shadow-amber-500/20'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  {isAlreadyRedeemed ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Canjear De Nuevo</span>
                    </>
                  ) : canAfford ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Canjear Ahora</span>
                    </>
                  ) : (
                    <span>Faltan {reward.pointsCost - points} pts</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
