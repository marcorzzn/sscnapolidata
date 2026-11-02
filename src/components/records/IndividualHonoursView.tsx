import React from 'react';
import { Award, Trophy, Star } from 'lucide-react';
import rawAlmanacco from '../../data/generated/almanacco_records.json';

interface IndividualHonoursViewProps {
  lang: 'it' | 'en';
}

export const IndividualHonoursView: React.FC<IndividualHonoursViewProps> = ({ lang }) => {
  const honours = (rawAlmanacco.individual_honours || []) as any[];

  return (
    <div className="space-y-6">
      <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] flex items-center justify-between text-xs font-mono-tabular">
        <div className="flex items-center gap-2 text-[#01A0E8] font-bold uppercase">
          <Award className="w-4 h-4" />
          <span>
            {lang === 'it'
              ? 'ALBO D’ORO DEI PREMI E RICONOSCIMENTI INDIVIDUALI'
              : 'INDIVIDUAL HONOURS & AWARDS ROLL OF HONOUR'}
          </span>
        </div>
        <div className="text-[11px] text-[var(--text-secondary)]">
          {lang === 'it'
            ? 'Capocannonieri, MVP Serie A, Panchina d’Oro e premi internazionali'
            : 'Top Scorers, Serie A MVPs, Golden Bench and international awards'}
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-hairline)] overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-mono-tabular">
          <thead>
            <tr className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)] bg-[var(--bg-primary)]/40">
              <th className="py-3 px-3 w-12 text-center">#</th>
              <th className="py-3 px-3">{lang === 'it' ? 'Stagione' : 'Season'}</th>
              <th className="py-3 px-3">{lang === 'it' ? 'Vincitore / Tesserato' : 'Winner / Member'}</th>
              <th className="py-3 px-3">{lang === 'it' ? 'Premio Ufficiale' : 'Official Award'}</th>
              <th className="py-3 px-3">{lang === 'it' ? 'Ente / Organizzatore' : 'Awarding Body'}</th>
              <th className="py-3 px-3">{lang === 'it' ? 'Dettagli & Statistica' : 'Details & Record'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-hairline)]">
            {honours.map((h: any, idx: number) => (
              <tr key={idx} className="hover:bg-[var(--bg-primary)]/60 transition-colors">
                <td className="py-3 px-3 text-center font-bold text-[#01A0E8]">
                  {idx + 1}
                </td>
                <td className="py-3 px-3 font-semibold text-[var(--text-secondary)]">
                  {h.season}
                </td>
                <td className="py-3 px-3 font-bold text-sm text-[var(--text-primary)]">
                  {h.player_name || h.recipient_name}
                </td>
                <td className="py-3 px-3 font-bold text-[#01A0E8]">
                  {h.award_name}
                </td>
                <td className="py-3 px-3 text-[var(--text-secondary)]">
                  {h.awarding_body}
                </td>
                <td className="py-3 px-3 text-[var(--text-secondary)]">
                  {h.details || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

