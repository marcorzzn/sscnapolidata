import React, { useState } from 'react';
import { Clock, UserCheck, Flame, Award, History } from 'lucide-react';
import rawAgeRecords from '../../data/generated/club_age_records.json';

interface AgeRecordsTabProps {
  lang: 'it' | 'en';
}

export const AgeRecordsTab: React.FC<AgeRecordsTabProps> = ({ lang }) => {
  const [category, setCategory] = useState<
    'youngest_player' | 'youngest_goalscorer' | 'oldest_player' | 'oldest_goalscorer'
  >('youngest_player');

  const records = (rawAgeRecords as any[]).filter((r) => r.category === category);

  return (
    <div className="space-y-6">
      {/* Category selector */}
      <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-3 text-xs font-mono-tabular">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCategory('youngest_player')}
            className={`px-3 py-1.5 border transition-colors cursor-pointer flex items-center gap-1.5 ${
              category === 'youngest_player'
                ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                : 'border-[var(--border-hairline)] text-[var(--text-secondary)] hover:border-[#01A0E8]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{lang === 'it' ? 'Più Giovani a Esordire (Top 25)' : 'Youngest Debutants (Top 25)'}</span>
          </button>
          <button
            onClick={() => setCategory('youngest_goalscorer')}
            className={`px-3 py-1.5 border transition-colors cursor-pointer flex items-center gap-1.5 ${
              category === 'youngest_goalscorer'
                ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                : 'border-[var(--border-hairline)] text-[var(--text-secondary)] hover:border-[#01A0E8]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{lang === 'it' ? 'Marcatori Più Giovani (Top 25)' : 'Youngest Goalscorers (Top 25)'}</span>
          </button>
          <button
            onClick={() => setCategory('oldest_player')}
            className={`px-3 py-1.5 border transition-colors cursor-pointer flex items-center gap-1.5 ${
              category === 'oldest_player'
                ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                : 'border-[var(--border-hairline)] text-[var(--text-secondary)] hover:border-[#01A0E8]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{lang === 'it' ? 'Più Anziani a Giocare (Top 25)' : 'Oldest Players (Top 25)'}</span>
          </button>
          <button
            onClick={() => setCategory('oldest_goalscorer')}
            className={`px-3 py-1.5 border transition-colors cursor-pointer flex items-center gap-1.5 ${
              category === 'oldest_goalscorer'
                ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                : 'border-[var(--border-hairline)] text-[var(--text-secondary)] hover:border-[#01A0E8]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{lang === 'it' ? 'Marcatori Più Anziani (Top 20)' : 'Oldest Goalscorers (Top 20)'}</span>
          </button>
        </div>

        <div className="text-[11px] text-[var(--text-secondary)]">
          {lang === 'it'
            ? 'Record anagrafici ufficiali calcolati al giorno della gara'
            : 'Official chronological age records calculated on matchday'}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-hairline)] overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-mono-tabular">
          <thead>
            <tr className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)] bg-[var(--bg-primary)]/40">
              <th className="py-3 px-3 w-14 text-center">#</th>
              <th className="py-3 px-3">{lang === 'it' ? 'Calciatore' : 'Player'}</th>
              <th className="py-3 px-3">{lang === 'it' ? 'Ruolo' : 'Position'}</th>
              <th className="py-3 px-3">{lang === 'it' ? 'Età Esatta' : 'Exact Age'}</th>
              <th className="py-3 px-3">{lang === 'it' ? 'Data Gara' : 'Match Date'}</th>
              <th className="py-3 px-3">{lang === 'it' ? 'Avversario' : 'Opponent'}</th>
              <th className="py-3 px-3 text-center">{lang === 'it' ? 'Risultato' : 'Result'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-hairline)]">
            {records.map((r: any, idx: number) => (
              <tr key={idx} className="hover:bg-[var(--bg-primary)]/60 transition-colors">
                <td className="py-3 px-3 text-center font-bold text-[#01A0E8]">
                  #{r.rank}
                </td>
                <td className="py-3 px-3 font-bold text-[var(--text-primary)]">
                  {r.player_name}
                </td>
                <td className="py-3 px-3 text-[var(--text-secondary)]">
                  {r.position || '—'}
                </td>
                <td className="py-3 px-3 font-bold text-[#01A0E8]">
                  {r.age_str}
                </td>
                <td className="py-3 px-3 text-[var(--text-secondary)]">
                  {r.match_date || '—'}
                </td>
                <td className="py-3 px-3 text-[var(--text-primary)]">
                  {r.opponent || '—'}
                </td>
                <td className="py-3 px-3 text-center">
                  {r.result ? (
                    <span className="px-2 py-0.5 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
                      {r.result}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

