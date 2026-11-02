import React from 'react';
import { Award, Globe, TrendingUp, ShieldCheck } from 'lucide-react';
import rawFinancialsTactics from '../../data/generated/club_financials_tactics.json';

interface UefaRankingsTabProps {
  lang: 'it' | 'en';
}

export const UefaRankingsTab: React.FC<UefaRankingsTabProps> = ({ lang }) => {
  const uefaRankings = (rawFinancialsTactics.uefa_rankings || []) as any[];

  return (
    <div className="space-y-6">
      {/* Overview Intro */}
      <div className="p-6 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono-tabular text-[#01A0E8] font-bold uppercase">
          <Globe className="w-4 h-4" />
          <span>
            {lang === 'it'
              ? 'RANKING UEFA UFFICIALE PER CLUB (2008–2026)'
              : 'OFFICIAL UEFA CLUB COEFFICIENT RANKINGS (2008–2026)'}
          </span>
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
          {lang === 'it'
            ? 'L’evoluzione della posizione del Napoli nel Ranking UEFA per Club dal ritorno in Europa nel 2008 (Coppa Intertoto) ad oggi. Punti coefficiente stagionali, coefficiente quinquennale aggregato e massimo turno raggiunto nelle competizioni UEFA.'
            : 'Evolution of Napoli UEFA Club Coefficient Ranking since the 2008 European return. Seasonal coefficients, 5-year rolling points, and competition milestones.'}
        </p>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-hairline)] overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-mono-tabular">
          <thead>
            <tr className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)] bg-[var(--bg-primary)]/40">
              <th className="py-3 px-3">{lang === 'it' ? 'Stagione' : 'Season'}</th>
              <th className="py-3 px-3 text-center">{lang === 'it' ? 'Posizione UEFA' : 'UEFA Rank'}</th>
              <th className="py-3 px-3 text-right">{lang === 'it' ? 'Coeff. Stagione' : 'Season Coeff.'}</th>
              <th className="py-3 px-3 text-right">{lang === 'it' ? 'Coeff. Quinquennale' : '5-Year Coeff.'}</th>
              <th className="py-3 px-3">{lang === 'it' ? 'Massimo Turno Raggiunto' : 'Competition Reached'}</th>
              <th className="py-3 px-3 text-center">{lang === 'it' ? 'Gare (V-P-S)' : 'Matches (W-D-L)'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-hairline)]">
            {uefaRankings.map((r, idx) => (
              <tr key={idx} className="hover:bg-[var(--bg-primary)]/60 transition-colors">
                <td className="py-3 px-3 font-bold text-[var(--text-primary)]">
                  {r.season}
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="px-2.5 py-0.5 bg-[#01A0E8]/15 text-[#01A0E8] border border-[#01A0E8]/40 font-bold text-xs inline-block">
                    #{r.rank}
                  </span>
                </td>
                <td className="py-3 px-3 text-right font-semibold text-[var(--text-primary)]">
                  {Number(r.seasonal_coefficient).toFixed(3)}
                </td>
                <td className="py-3 px-3 text-right font-bold text-[#01A0E8]">
                  {Number(r.five_year_coefficient).toFixed(3)}
                </td>
                <td className="py-3 px-3 text-[var(--text-secondary)]">
                  {r.competition_reached}
                </td>
                <td className="py-3 px-3 text-center text-[var(--text-secondary)]">
                  {r.matches_played > 0
                    ? `${r.matches_played} (${r.wins}-${r.draws}-${r.losses})`
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

