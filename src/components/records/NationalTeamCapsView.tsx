import React from 'react';
import { Globe, Trophy, Star } from 'lucide-react';
import rawAlmanacco from '../../data/generated/almanacco_records.json';

interface NationalTeamCapsViewProps {
  lang: 'it' | 'en';
}

export const NationalTeamCapsView: React.FC<NationalTeamCapsViewProps> = ({ lang }) => {
  const caps = (rawAlmanacco.national_team_caps || []) as any[];

  return (
    <div className="space-y-6">
      <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] flex items-center justify-between text-xs font-mono-tabular">
        <div className="flex items-center gap-2 text-[#01A0E8] font-bold uppercase">
          <Globe className="w-4 h-4" />
          <span>
            {lang === 'it'
              ? 'AZZURRI IN NAZIONALE & CAMPIONI DEL MONDO'
              : 'NAPOLI PLAYERS IN NATIONAL TEAMS & WORLD CUP WINNERS'}
          </span>
        </div>
        <div className="text-[11px] text-[var(--text-secondary)]">
          {lang === 'it'
            ? 'Tesserati del Napoli campioni del mondo e record di presenze internazionali'
            : 'World Cup champions and international appearance records'}
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-hairline)] overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-mono-tabular">
          <thead>
            <tr className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)] bg-[var(--bg-primary)]/40">
              <th className="py-3 px-3 w-12 text-center">#</th>
              <th className="py-3 px-3">{lang === 'it' ? 'Calciatore' : 'Player'}</th>
              <th className="py-3 px-3">{lang === 'it' ? 'Ruolo' : 'Position'}</th>
              <th className="py-3 px-3">{lang === 'it' ? 'Nazionale' : 'Country'}</th>
              <th className="py-3 px-3 text-center">{lang === 'it' ? 'Presenze' : 'Caps'}</th>
              <th className="py-3 px-3 text-center">{lang === 'it' ? 'Gol' : 'Goals'}</th>
              <th className="py-3 px-3">{lang === 'it' ? 'Trionfi / Titoli con la Nazionale' : 'Titles Won with National Team'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-hairline)]">
            {caps.map((c: any, idx: number) => {
              const isWorldChampion = (c.titles_won || '').includes('Campione del Mondo') || (c.titles_won || '').includes('World Cup');
              return (
                <tr key={idx} className="hover:bg-[var(--bg-primary)]/60 transition-colors">
                  <td className="py-3 px-3 text-center font-bold text-[#01A0E8]">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-3 font-bold text-sm text-[var(--text-primary)]">
                    <div className="flex items-center gap-1.5">
                      <span>{c.player_name}</span>
                      {isWorldChampion && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[var(--text-secondary)]">
                    {c.position || '—'}
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#01A0E8]">
                    {c.country}
                  </td>
                  <td className="py-3 px-3 text-center font-bold">
                    {c.caps}
                  </td>
                  <td className="py-3 px-3 text-center text-emerald-400 font-bold">
                    {c.goals !== undefined ? c.goals : '—'}
                  </td>
                  <td className="py-3 px-3 text-[var(--text-secondary)] font-semibold">
                    {c.titles_won ? (
                      <span className={isWorldChampion ? 'text-amber-400 font-bold' : ''}>
                        {c.titles_won}
                      </span>
                    ) : (
                      '—'
                    )}
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

