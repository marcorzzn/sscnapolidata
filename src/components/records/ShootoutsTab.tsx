import React from 'react';
import { Trophy, ArrowRight, ShieldCheck, Flame } from 'lucide-react';
import rawShootouts from '../../data/generated/penalties_shootout.json';

interface ShootoutsTabProps {
  lang: 'it' | 'en';
  onSelectMatch?: (matchId: string) => void;
}

export const ShootoutsTab: React.FC<ShootoutsTabProps> = ({
  lang,
  onSelectMatch,
}) => {
  const shootouts = (rawShootouts as any[]) || [];

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="p-6 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono-tabular text-[#01A0E8] font-bold uppercase">
          <Trophy className="w-4 h-4" />
          <span>
            {lang === 'it'
              ? 'TUTTE LE SFIDE DECISI AI CALCI DI RIGORE (18 SHOOTOUT)'
              : 'ALL MATCHES DECIDED BY PENALTY SHOOTOUT (18 SHOOTOUTS)'}
          </span>
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
          {lang === 'it'
            ? 'La storia completa dei calci di rigore decisivi del Napoli: dalla storica Supercoppa 2014 di Doha vinta contro la Juventus, alla finale di Coppa Italia 2020 a Roma, fino alle notti di coppa europea e nazionale.'
            : 'Complete historical record of all Napoli matches decided by penalty shootouts: from the epic 2014 Supercoppa victory against Juventus in Doha to the 2020 Coppa Italia final in Rome.'}
        </p>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-hairline)] overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-mono-tabular">
          <thead>
            <tr className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)] bg-[var(--bg-primary)]/40">
              <th className="py-3 px-3 w-12 text-center">#</th>
              <th className="py-3 px-3">{lang === 'it' ? 'Stagione' : 'Season'}</th>
              <th className="py-3 px-3">{lang === 'it' ? 'Competizione' : 'Competition'}</th>
              <th className="py-3 px-3">{lang === 'it' ? 'Turno' : 'Round'}</th>
              <th className="py-3 px-3">{lang === 'it' ? 'Partita (Casa vs Trasferta)' : 'Match (Home vs Away)'}</th>
              <th className="py-3 px-3 text-center">{lang === 'it' ? 'Punteggio ai Rigori' : 'Penalty Score'}</th>
              <th className="py-3 px-3 text-right">{lang === 'it' ? 'Scheda Partita' : 'Match Card'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-hairline)]">
            {shootouts.map((s, idx) => {
              const isWin = s.result.toLowerCase().includes('win') || s.result.startsWith('10:9') || s.result.includes('Napoli');
              return (
                <tr key={s.shootout_id || idx} className="hover:bg-[var(--bg-primary)]/60 transition-colors">
                  <td className="py-3 px-3 text-center font-bold text-[#01A0E8]">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-3 text-[var(--text-secondary)]">
                    {s.season}
                  </td>
                  <td className="py-3 px-3 font-semibold text-[var(--text-primary)]">
                    {s.competition}
                  </td>
                  <td className="py-3 px-3 text-[var(--text-secondary)]">
                    {s.round}
                  </td>
                  <td className="py-3 px-3 font-bold">
                    <span className={s.home_team.includes('Napoli') ? 'text-[#01A0E8]' : ''}>
                      {s.home_team}
                    </span>{' '}
                    <span className="text-[var(--text-secondary)] font-normal">vs</span>{' '}
                    <span className={s.away_team.includes('Napoli') ? 'text-[#01A0E8]' : ''}>
                      {s.away_team}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2.5 py-1 bg-[#01A0E8]/15 text-[#01A0E8] border border-[#01A0E8]/40 font-bold text-xs inline-block">
                      {s.result}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => {
                        if (onSelectMatch) {
                          onSelectMatch(s.matched_match_id || String(s.shootout_id));
                        }
                      }}
                      className="px-2.5 py-1 bg-[#01A0E8] text-[#08090B] font-bold text-[11px] hover:bg-[#01A0E8]/90 transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>{lang === 'it' ? 'Apri Scheda' : 'Open Card'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

