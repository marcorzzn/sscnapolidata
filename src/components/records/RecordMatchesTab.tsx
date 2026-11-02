import React, { useState } from 'react';
import { Trophy, ArrowRight, ExternalLink, Flame, ShieldAlert, Award } from 'lucide-react';
import rawRecordMatches from '../../data/generated/club_record_matches.json';

interface RecordMatchesTabProps {
  lang: 'it' | 'en';
  onSelectMatch?: (matchId: string) => void;
}

export const RecordMatchesTab: React.FC<RecordMatchesTabProps> = ({
  lang,
  onSelectMatch,
}) => {
  const [activeCategory, setActiveCategory] = useState<
    'highest_wins' | 'highest_scoring' | 'highest_defeats'
  >('highest_wins');

  const matches = (rawRecordMatches as any[]).filter(
    (m) => m.category === activeCategory
  );

  return (
    <div className="space-y-6">
      {/* Category selector */}
      <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-3 text-xs font-mono-tabular">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[var(--text-secondary)]">
            {lang === 'it' ? 'CATEGORIA RECORD:' : 'RECORD CATEGORY:'}
          </span>
          <button
            onClick={() => setActiveCategory('highest_wins')}
            className={`px-3 py-1.5 border transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'highest_wins'
                ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                : 'border-[var(--border-hairline)] text-[var(--text-secondary)] hover:border-[#01A0E8]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>{lang === 'it' ? 'Vittorie Più Larghe (Top 15)' : 'Highest Wins (Top 15)'}</span>
          </button>
          <button
            onClick={() => setActiveCategory('highest_scoring')}
            className={`px-3 py-1.5 border transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'highest_scoring'
                ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                : 'border-[var(--border-hairline)] text-[var(--text-secondary)] hover:border-[#01A0E8]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{lang === 'it' ? 'Partite con Più Reti (Top 15)' : 'Highest Scoring Matches (Top 15)'}</span>
          </button>
          <button
            onClick={() => setActiveCategory('highest_defeats')}
            className={`px-3 py-1.5 border transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'highest_defeats'
                ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                : 'border-[var(--border-hairline)] text-[var(--text-secondary)] hover:border-[#01A0E8]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{lang === 'it' ? 'Sconfitte Storiche (Top 15)' : 'Highest Defeats (Top 15)'}</span>
          </button>
        </div>

        <div className="text-[11px] text-[var(--text-secondary)]">
          {lang === 'it'
            ? 'Tutte le gare sono interconnesse: clicca su "Apri Scheda" per il tabellino completo'
            : 'All fixtures are interconnected: click "Open Card" for the full match story'}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-hairline)] overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-mono-tabular">
          <thead>
            <tr className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)] bg-[var(--bg-primary)]/40">
              <th className="py-3 px-3 w-14 text-center">#</th>
              <th className="py-3 px-3">{lang === 'it' ? 'Data Gara' : 'Match Date'}</th>
              <th className="py-3 px-3">{lang === 'it' ? 'Stagione' : 'Season'}</th>
              <th className="py-3 px-3">{lang === 'it' ? 'Competizione & G.' : 'Comp & MD'}</th>
              <th className="py-3 px-3">{lang === 'it' ? 'Casa/Trasf.' : 'H/A'}</th>
              <th className="py-3 px-3">{lang === 'it' ? 'Avversario' : 'Opponent'}</th>
              <th className="py-3 px-3 text-center">{lang === 'it' ? 'Risultato' : 'Result'}</th>
              <th className="py-3 px-3 text-center">{lang === 'it' ? 'Spettatori' : 'Attendance'}</th>
              <th className="py-3 px-3 text-right">{lang === 'it' ? 'Scheda Partita' : 'Match Card'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-hairline)]">
            {matches.map((m: any, idx: number) => (
              <tr key={idx} className="hover:bg-[var(--bg-primary)]/60 transition-colors">
                <td className="py-3 px-3 text-center font-bold text-[#01A0E8]">
                  #{m.rank}
                </td>
                <td className="py-3 px-3 font-semibold text-[var(--text-primary)]">
                  {m.match_date}
                </td>
                <td className="py-3 px-3 text-[var(--text-secondary)]">
                  {m.season}
                </td>
                <td className="py-3 px-3 text-[var(--text-secondary)]">
                  <span>{m.competition}</span>
                  {m.matchday && <span className="opacity-70 ml-1.5">g.{m.matchday}</span>}
                </td>
                <td className="py-3 px-3 font-bold">
                  {m.venue === 'H' ? (
                    <span className="text-[#01A0E8]">{lang === 'it' ? 'Casa' : 'Home'}</span>
                  ) : (
                    <span className="text-[var(--text-secondary)]">{lang === 'it' ? 'Trasferta' : 'Away'}</span>
                  )}
                </td>
                <td className="py-3 px-3 font-bold text-[var(--text-primary)]">
                  {m.opponent}
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="px-2 py-0.5 bg-[#01A0E8]/15 text-[#01A0E8] border border-[#01A0E8]/40 font-bold text-sm">
                    {m.result}
                  </span>
                </td>
                <td className="py-3 px-3 text-center text-[var(--text-secondary)]">
                  {m.attendance !== '-' ? m.attendance : 'n.d.'}
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => {
                      if (onSelectMatch) {
                        onSelectMatch(m.match_id || m.match_date);
                      }
                    }}
                    className="px-2.5 py-1 bg-[#01A0E8] text-[#08090B] font-bold text-[11px] hover:bg-[#01A0E8]/90 transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>{lang === 'it' ? 'Apri Scheda' : 'Open Card'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

