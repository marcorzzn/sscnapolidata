import React, { useState } from 'react';
import { Users, ArrowRight, Trophy, BarChart2 } from 'lucide-react';
import rawStadiumAttendance from '../../data/generated/stadium_attendance_all.json';

interface StadiumAttendanceTabProps {
  lang: 'it' | 'en';
  onSelectMatch?: (matchId: string) => void;
}

export const StadiumAttendanceTab: React.FC<StadiumAttendanceTabProps> = ({
  lang,
  onSelectMatch,
}) => {
  const [subView, setSubView] = useState<'top_matches' | 'yearly_average'>('top_matches');

  const topMatches = (rawStadiumAttendance as any).top_matches || [];
  const yearlyHistory = (rawStadiumAttendance as any).history || [];

  return (
    <div className="space-y-6">
      {/* Sub-view toggle */}
      <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-3 text-xs font-mono-tabular">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubView('top_matches')}
            className={`px-3 py-1.5 border transition-colors cursor-pointer flex items-center gap-1.5 ${
              subView === 'top_matches'
                ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                : 'border-[var(--border-hairline)] text-[var(--text-secondary)] hover:border-[#01A0E8]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>
              {lang === 'it'
                ? 'Partite Record per Spettatori (Top 25)'
                : 'Record Attendance Matches (Top 25)'}
            </span>
          </button>
          <button
            onClick={() => setSubView('yearly_average')}
            className={`px-3 py-1.5 border transition-colors cursor-pointer flex items-center gap-1.5 ${
              subView === 'yearly_average'
                ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                : 'border-[var(--border-hairline)] text-[var(--text-secondary)] hover:border-[#01A0E8]'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>
              {lang === 'it'
                ? 'Media Presenze Anno per Anno (1926–2026)'
                : 'Yearly Attendance Averages (1926–2026)'}
            </span>
          </button>
        </div>

        <div className="text-[11px] text-[var(--text-secondary)]">
          {lang === 'it'
            ? 'Dati ufficiali SIAE / Lega Calcio sulle presenze allo stadio'
            : 'Official attendance counts verified via SIAE / Lega Calcio'}
        </div>
      </div>

      {/* TOP MATCHES VIEW */}
      {subView === 'top_matches' && (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-hairline)] overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono-tabular">
            <thead>
              <tr className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)] bg-[var(--bg-primary)]/40">
                <th className="py-3 px-3 w-12 text-center">#</th>
                <th className="py-3 px-3">{lang === 'it' ? 'Spettatori' : 'Attendance'}</th>
                <th className="py-3 px-3">{lang === 'it' ? 'Data Gara' : 'Match Date'}</th>
                <th className="py-3 px-3">{lang === 'it' ? 'Competizione' : 'Competition'}</th>
                <th className="py-3 px-3">{lang === 'it' ? 'Partita' : 'Fixture'}</th>
                <th className="py-3 px-3 text-center">{lang === 'it' ? 'Risultato' : 'Score'}</th>
                <th className="py-3 px-3">{lang === 'it' ? 'Direttore di Gara' : 'Referee'}</th>
                <th className="py-3 px-3 text-right">{lang === 'it' ? 'Scheda' : 'Card'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-hairline)]">
              {topMatches.map((m: any, idx: number) => (
                <tr key={idx} className="hover:bg-[var(--bg-primary)]/60 transition-colors">
                  <td className="py-3 px-3 text-center font-bold text-[#01A0E8]">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-3 font-bold text-base text-[#01A0E8]">
                    {m.attendance.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-semibold text-[var(--text-primary)]">
                    {m.match_date}
                  </td>
                  <td className="py-3 px-3 text-[var(--text-secondary)]">
                    {m.competition} {m.matchday ? `(g.${m.matchday})` : ''}
                  </td>
                  <td className="py-3 px-3 font-bold">
                    <span className={m.home_team === 'Napoli' ? 'text-[#01A0E8]' : ''}>
                      {m.home_team}
                    </span>{' '}
                    <span className="text-[var(--text-secondary)] font-normal">vs</span>{' '}
                    <span className={m.away_team === 'Napoli' ? 'text-[#01A0E8]' : ''}>
                      {m.away_team}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-bold">
                    {m.home_goals} - {m.away_goals}
                  </td>
                  <td className="py-3 px-3 text-[var(--text-secondary)]">
                    {m.referee || '—'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => {
                        if (onSelectMatch) {
                          onSelectMatch(String(m.match_id));
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
      )}

      {/* YEARLY AVERAGE HISTORY VIEW */}
      {subView === 'yearly_average' && (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-hairline)] overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono-tabular">
            <thead>
              <tr className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)] bg-[var(--bg-primary)]/40">
                <th className="py-3 px-3">{lang === 'it' ? 'Stagione' : 'Season'}</th>
                <th className="py-3 px-3">{lang === 'it' ? 'Competizione' : 'Competition'}</th>
                <th className="py-3 px-3 text-center">{lang === 'it' ? 'Gare Casalinghe' : 'Home Matches'}</th>
                <th className="py-3 px-3 text-right">{lang === 'it' ? 'Totale Spettatori' : 'Total Attendance'}</th>
                <th className="py-3 px-3 text-right">{lang === 'it' ? 'Media per Partita' : 'Average Attendance'}</th>
                <th className="py-3 px-3 text-center">{lang === 'it' ? 'Gare Sold Out' : 'Sold Out Matches'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-hairline)]">
              {yearlyHistory.map((h: any, idx: number) => (
                <tr key={idx} className="hover:bg-[var(--bg-primary)]/60 transition-colors">
                  <td className="py-3 px-3 font-bold text-[var(--text-primary)]">
                    {h.season_code}
                  </td>
                  <td className="py-3 px-3 text-[var(--text-secondary)]">
                    {h.competition}
                  </td>
                  <td className="py-3 px-3 text-center font-semibold">
                    {h.matches}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-[var(--text-primary)]">
                    {h.total_spectators ? h.total_spectators.toLocaleString() : '—'}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-[#01A0E8]">
                    {h.avg_spectators ? h.avg_spectators.toLocaleString() : '—'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {h.sold_out > 0 ? (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                        {h.sold_out}
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
      )}
    </div>
  );
};

