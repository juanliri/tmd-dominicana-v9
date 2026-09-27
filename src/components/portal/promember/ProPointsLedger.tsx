import React from 'react';
import { Clock } from 'lucide-react';
import { LoyaltyPointsRecord } from '../../../types';

interface ProPointsLedgerProps {
  ledger: LoyaltyPointsRecord[];
}

export const ProPointsLedger: React.FC<ProPointsLedgerProps> = ({ ledger }) => {
  return (
    <div className="space-y-3 font-mono">
      <h4 className="font-black font-display uppercase tracking-tight text-sm text-white flex items-center gap-2">
        <Clock className="w-4 h-4 text-amber-400" />
        <span>Historial y Libro de Puntos Pro</span>
      </h4>

      <div className="overflow-hidden rounded-[3px] border border-zinc-800 bg-zinc-900 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-zinc-400 font-bold font-display uppercase tracking-wider text-[10px] border-b border-zinc-800">
              <tr>
                <th className="p-3.5">Fecha</th>
                <th className="p-3.5">Concepto / Actividad</th>
                <th className="p-3.5">Referencia</th>
                <th className="p-3.5 text-right">Puntos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {ledger.map((rec) => (
                <tr key={rec.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-3.5 whitespace-nowrap text-zinc-400 font-mono">
                    {rec.date}
                  </td>
                  <td className="p-3.5 font-semibold text-zinc-200 font-sans">
                    {rec.activity}
                  </td>
                  <td className="p-3.5 whitespace-nowrap font-mono text-zinc-400">
                    {rec.orderReference || '—'}
                  </td>
                  <td className="p-3.5 whitespace-nowrap text-right font-black font-mono">
                    {rec.type === 'earned' ? (
                      <span className="text-emerald-400">+{rec.points} pts</span>
                    ) : (
                      <span className="text-rose-400">-{rec.points} pts</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
