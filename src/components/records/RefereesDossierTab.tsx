import React, { useMemo, useState } from 'react';
import { Shield, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import rawRefereesDossier from '../../data/generated/club_referees_dossier.json';

interface RefereesDossierTabProps {
  lang: 'it' | 'en';
}

type SortField =
  | 'matches'
  | 'name'
  | 'city'
  | 'wins'
  | 'draws'
  | 'losses'
  | 'win_pct'
  | 'yellow_cards_napoli'
  | 'red_cards_napoli'
  | 'penalties_napoli'
  | 'penalties_opp';

type SortDirection = 'asc' | 'desc';

export const RefereesDossierTab: React.FC<RefereesDossierTabProps> = ({ lang }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [minMatches, setMinMatches] = useState(0);
  const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: SortDirection }>({
    field: 'matches',
    direction: 'desc',
  });

  const referees = (rawRefereesDossier as any[]) || [];

  const handleSort = (field: SortField) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const filteredAndSortedReferees = useMemo(() => {
    const list = referees.filter((r) => {
      if (r.matches < minMatches) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (r.name || '').toLowerCase().includes(q) ||
        (r.city || '').toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      const f = sortConfig.field;
      let comp = 0;
      if (f === 'name' || f === 'city') {
        comp = String(a[f] || '').localeCompare(String(b[f] || ''));
      } else if (f === 'win_pct') {
        const pctA = a.matches > 0 ? (a.wins / a.matches) : 0;
        const pctB = b.matches > 0 ? (b.wins / b.matches) : 0;
        comp = pctA - pctB;
      } else {
        comp = (a[f] || 0) - (b[f] || 0);
      }
      return sortConfig.direction === 'asc' ? comp : -comp;
    });
  }, [referees, searchQuery, minMatches, sortConfig]);

  return (
    <div className="space-y-6">
      {/* Overview Intro */}
      <div className="p-6 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono-tabular text-[#01A0E8] font-bold uppercase">
          <Shield className="w-4 h-4" />
          <span>
            {lang === 'it'
              ? 'DOSSIER ARBITRALE COMPLETO (606 DIRETTORI DI GARA)'
              : 'COMPREHENSIVE REFEREES DOSSIER (606 MATCH OFFICIALS)'}
          </span>
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
          {lang === 'it'
            ? 'Registro analitico di tutti i 606 arbitri federali e internazionali che hanno diretto il Napoli dal 1926 ad oggi. Statistiche di vittorie, pareggi, sconfitte, cartellini comminati ed episodi arbitrali (rigori a favore e contro).'
            : 'Analytical record of all 606 federal and international referees who have officiated Napoli fixtures since 1926. Statistics covering wins, draws, losses, disciplinary bookings, and penalty kicks.'}
        </p>

        {/* Filters */}
        <div className="pt-3 border-t border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-4 text-xs font-mono-tabular">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[var(--text-secondary)]">
              {lang === 'it' ? 'FILTRO PRESENZE:' : 'MIN MATCHES:'}
            </span>
            {[0, 5, 10, 20, 30].map((num) => (
              <button
                key={num}
                onClick={() => setMinMatches(num)}
                className={`px-2.5 py-1 border cursor-pointer ${
                  minMatches === num
                    ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                    : 'border-[var(--border-hairline)] text-[var(--text-secondary)] hover:border-[#01A0E8]'
                }`}
              >
                {num === 0 ? (lang === 'it' ? 'Tutti' : 'All') : `${num}+ ${lang === 'it' ? 'gare' : 'matches'}`}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'it' ? 'Cerca arbitro o sezione...' : 'Search referee or city...'}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--bg-primary)] border border-[var(--border-hairline)] focus:border-[#01A0E8] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-hairline)] overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-mono-tabular">
          <thead>
            <tr className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)] bg-[var(--bg-primary)]/40 select-none">
              <th className="py-3 px-3 w-12 text-center">#</th>
              <th
                onClick={() => handleSort('name')}
                className="py-3 px-3 cursor-pointer hover:text-[#01A0E8]"
              >
                <div className="flex items-center gap-1">
                  <span>{lang === 'it' ? 'Direttore di Gara' : 'Referee'}</span>
                  {sortConfig.field === 'name' ? (
                    sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-[#01A0E8]" /> : <ArrowDown className="w-3 h-3 text-[#01A0E8]" />
                  ) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                </div>
              </th>
              <th
                onClick={() => handleSort('city')}
                className="py-3 px-3 cursor-pointer hover:text-[#01A0E8]"
              >
                <div className="flex items-center gap-1">
                  <span>{lang === 'it' ? 'Sezione AIA' : 'City / Section'}</span>
                  {sortConfig.field === 'city' ? (
                    sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-[#01A0E8]" /> : <ArrowDown className="w-3 h-3 text-[#01A0E8]" />
                  ) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                </div>
              </th>
              <th
                onClick={() => handleSort('matches')}
                className="py-3 px-3 text-center cursor-pointer hover:text-[#01A0E8]"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>{lang === 'it' ? 'Gare' : 'Matches'}</span>
                  {sortConfig.field === 'matches' ? (
                    sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-[#01A0E8]" /> : <ArrowDown className="w-3 h-3 text-[#01A0E8]" />
                  ) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                </div>
              </th>
              <th
                onClick={() => handleSort('wins')}
                className="py-3 px-3 text-center cursor-pointer hover:text-[#01A0E8]"
              >
                <span>{lang === 'it' ? 'Vittorie' : 'Wins'}</span>
              </th>
              <th className="py-3 px-3 text-center">
                <span>{lang === 'it' ? 'Pareggi' : 'Draws'}</span>
              </th>
              <th className="py-3 px-3 text-center">
                <span>{lang === 'it' ? 'Sconfitte' : 'Losses'}</span>
              </th>
              <th
                onClick={() => handleSort('win_pct')}
                className="py-3 px-3 text-center cursor-pointer hover:text-[#01A0E8]"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>{lang === 'it' ? '% Vittorie' : 'Win %'}</span>
                  {sortConfig.field === 'win_pct' ? (
                    sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-[#01A0E8]" /> : <ArrowDown className="w-3 h-3 text-[#01A0E8]" />
                  ) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                </div>
              </th>
              <th
                onClick={() => handleSort('yellow_cards_napoli')}
                className="py-3 px-3 text-center cursor-pointer hover:text-[#01A0E8]"
              >
                <span>🟨 Napoli</span>
              </th>
              <th
                onClick={() => handleSort('red_cards_napoli')}
                className="py-3 px-3 text-center cursor-pointer hover:text-[#01A0E8]"
              >
                <span>🟥 Napoli</span>
              </th>
              <th
                onClick={() => handleSort('penalties_napoli')}
                className="py-3 px-3 text-center cursor-pointer hover:text-[#01A0E8]"
              >
                <span>Rig. Pro</span>
              </th>
              <th
                onClick={() => handleSort('penalties_opp')}
                className="py-3 px-3 text-center cursor-pointer hover:text-[#01A0E8]"
              >
                <span>Rig. Contro</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-hairline)]">
            {filteredAndSortedReferees.map((r, idx) => {
              const winPct = r.matches > 0 ? Math.round((r.wins / r.matches) * 100) : 0;
              return (
                <tr key={r.referee_id || idx} className="hover:bg-[var(--bg-primary)]/60 transition-colors">
                  <td className="py-2.5 px-3 text-center font-bold text-[#01A0E8]">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-[var(--text-primary)]">
                    {r.name}
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-secondary)]">
                    {r.city || '—'}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-[#01A0E8]">
                    {r.matches}
                  </td>
                  <td className="py-2.5 px-3 text-center text-emerald-400 font-semibold">
                    {r.wins}
                  </td>
                  <td className="py-2.5 px-3 text-center text-[var(--text-secondary)]">
                    {r.draws}
                  </td>
                  <td className="py-2.5 px-3 text-center text-red-400">
                    {r.losses}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold">
                    <span
                      className={`px-1.5 py-0.5 ${
                        winPct >= 50
                          ? 'text-[#01A0E8] bg-[#01A0E8]/15 border border-[#01A0E8]/30'
                          : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      {winPct}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center text-amber-400 font-semibold">
                    {r.yellow_cards_napoli}
                  </td>
                  <td className="py-2.5 px-3 text-center text-red-400 font-bold">
                    {r.red_cards_napoli}
                  </td>
                  <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">
                    {r.penalties_napoli}
                  </td>
                  <td className="py-2.5 px-3 text-center text-red-400 font-bold">
                    {r.penalties_opp}
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

