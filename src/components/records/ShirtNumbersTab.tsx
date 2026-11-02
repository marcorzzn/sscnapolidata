import React, { useMemo, useState } from 'react';
import { Hash, Award, Star, Search, Shield, ChevronRight } from 'lucide-react';
import rawShirtNumbers from '../../data/generated/shirt_numbers_matrix.json';

interface ShirtNumbersTabProps {
  lang: 'it' | 'en';
}

interface ShirtNumberItem {
  number: number;
  times_worn: number;
  is_retired: boolean;
  retirement_note?: string | null;
  players: {
    player_id: string;
    player_name: string;
    seasons_worn: string;
    is_current: boolean;
  }[];
}

export const ShirtNumbersTab: React.FC<ShirtNumbersTabProps> = ({ lang }) => {
  const shirtNumbers = (rawShirtNumbers as unknown as ShirtNumberItem[]) || [];

  // Default selected number is 10 (Maradona) or 9
  const [selectedNum, setSelectedNum] = useState<number>(10);
  const [searchPlayerQuery, setSearchPlayerQuery] = useState('');

  const selectedItem =
    shirtNumbers.find((s) => s.number === selectedNum) || shirtNumbers[9];

  // Maximum times worn across all numbers (to calculate cyan opacity percentage)
  const maxTimesWorn = useMemo(() => {
    return Math.max(...shirtNumbers.map((s) => s.times_worn), 1);
  }, [shirtNumbers]);

  // Filtered players in selected number inspector
  const filteredPlayers = useMemo(() => {
    if (!selectedItem) return [];
    if (!searchPlayerQuery.trim()) return selectedItem.players;
    const q = searchPlayerQuery.toLowerCase();
    return selectedItem.players.filter(
      (p) =>
        p.player_name.toLowerCase().includes(q) ||
        p.seasons_worn.toLowerCase().includes(q)
    );
  }, [selectedItem, searchPlayerQuery]);

  return (
    <div className="space-y-8">
      {/* Overview Intro */}
      <div className="p-6 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono-tabular text-[#01A0E8] font-bold uppercase">
          <Hash className="w-4 h-4" />
          <span>
            {lang === 'it'
              ? 'ALMANACCO UFFICIALE DEI NUMERI DI MAGLIA (1–99)'
              : 'OFFICIAL SHIRT NUMBERS ALMANAC (1–99)'}
          </span>
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
          {lang === 'it'
            ? 'Mappa termica interattiva di tutti i numeri di maglia dal 1 al 99. L’intensità dell’azzurro riflette quante volte il numero è stato scelto e assegnato. I numeri mai utilizzati hanno sfondo neutro. Clicca su ciascun riquadro per esplorare tutti i calciatori storici che hanno vestito quella maglia.'
            : 'Interactive heat matrix for squad numbers 1 to 99. The intensity of azure indicates frequency of selection. Unused numbers have neutral backgrounds. Click any tile to inspect every historical player who wore that number.'}
        </p>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono-tabular">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-[var(--bg-primary)] border border-[var(--border-hairline)] inline-block opacity-40" />
            <span className="text-[var(--text-secondary)]">
              {lang === 'it' ? 'Mai Usato (0)' : 'Never Used (0)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-[#01A0E8]/25 border border-[#01A0E8]/40 inline-block" />
            <span className="text-[var(--text-secondary)]">
              {lang === 'it' ? 'Uso Raro (1–3)' : 'Rarely Used (1–3)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-[#01A0E8]/60 inline-block" />
            <span className="text-[var(--text-secondary)]">
              {lang === 'it' ? 'Frequente (4–10)' : 'Frequent (4–10)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-[#01A0E8] text-[#08090B] font-bold inline-flex items-center justify-center text-[10px]">
              99
            </span>
            <span className="text-[var(--text-secondary)]">
              {lang === 'it' ? 'Iconico (10+)' : 'Iconic (10+)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-[#01A0E8] border-2 border-amber-400 inline-block" />
            <span className="text-amber-400 font-bold">
              {lang === 'it' ? 'N. 10 Ritirata (D10S)' : '#10 Retired (D10S)'}
            </span>
          </div>
        </div>
      </div>

      {/* MATRIX OF NUMBERS 1 TO 99 */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-hairline)] p-4 sm:p-6">
        <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-14 gap-2">
          {shirtNumbers.map((s) => {
            const isSelected = s.number === selectedNum;
            const ratio = s.times_worn / maxTimesWorn;

            // Background & text color by intensity
            let bgClass = '';
            let textClass = '';
            let borderClass = 'border-[var(--border-hairline)]';

            if (s.number === 10) {
              bgClass = 'bg-[#01A0E8] shadow-lg';
              textClass = 'text-[#08090B] font-black text-sm';
              borderClass = 'border-2 border-amber-400 ring-2 ring-amber-400/30';
            } else if (s.times_worn === 0) {
              bgClass = 'bg-[var(--bg-primary)] opacity-30 hover:opacity-75';
              textClass = 'text-[var(--text-secondary)]';
            } else if (ratio > 0.6) {
              bgClass = 'bg-[#01A0E8] shadow-md';
              textClass = 'text-[#08090B] font-extrabold text-sm';
            } else if (ratio > 0.3) {
              bgClass = 'bg-[#01A0E8]/70';
              textClass = 'text-[#08090B] font-bold';
            } else if (ratio > 0.1) {
              bgClass = 'bg-[#01A0E8]/40';
              textClass = 'text-[var(--text-primary)] font-semibold';
            } else {
              bgClass = 'bg-[#01A0E8]/15';
              textClass = 'text-[#01A0E8]';
            }

            return (
              <button
                key={s.number}
                onClick={() => setSelectedNum(s.number)}
                className={`aspect-square flex flex-col items-center justify-center p-1 border transition-all cursor-pointer relative group ${bgClass} ${textClass} ${borderClass} ${
                  isSelected ? 'ring-2 ring-white scale-105 z-10' : ''
                }`}
                title={
                  lang === 'it'
                    ? `Maglia n. ${s.number}: indossata da ${s.times_worn} calciatori`
                    : `Shirt #${s.number}: worn by ${s.times_worn} players`
                }
              >
                <span className="text-sm md:text-base leading-none">{s.number}</span>
                {s.number === 10 ? (
                  <Star className="w-2.5 h-2.5 text-amber-900 fill-amber-900 mt-0.5" />
                ) : s.times_worn > 0 ? (
                  <span className="text-[9px] font-mono-tabular opacity-75 mt-0.5">
                    {s.times_worn}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* INSPECTOR PANEL FOR SELECTED NUMBER */}
      {selectedItem && (
        <div className="p-6 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-5">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 flex items-center justify-center font-display font-black text-3xl ${
                  selectedItem.number === 10
                    ? 'bg-[#01A0E8] text-[#08090B] border-2 border-amber-400'
                    : selectedItem.times_worn > 0
                    ? 'bg-[#01A0E8] text-[#08090B]'
                    : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-hairline)]'
                }`}
              >
                {selectedItem.number}
              </div>
              <div>
                <div className="text-xs font-mono-tabular text-[#01A0E8] font-bold uppercase">
                  {selectedItem.number === 10
                    ? lang === 'it'
                      ? 'MAGLIA N. 10 RITIRATA (DIEGO ARMANDO MARADONA)'
                      : 'RETIRED SHIRT #10 (DIEGO ARMANDO MARADONA)'
                    : lang === 'it'
                    ? `DETTAGLIO MAGLIA N. ${selectedItem.number}`
                    : `DETAILS FOR SHIRT #${selectedItem.number}`}
                </div>
                <div className="text-xl font-display font-extrabold text-[var(--text-primary)] mt-0.5">
                  {selectedItem.times_worn > 0
                    ? lang === 'it'
                      ? `Indossata da ${selectedItem.times_worn} calciatori azzurri`
                      : `Worn by ${selectedItem.times_worn} Napoli players`
                    : lang === 'it'
                    ? 'Numero mai assegnato nella storia azzurra'
                    : 'Number never assigned in Napoli history'}
                </div>
              </div>
            </div>

            {selectedItem.players.length > 5 && (
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchPlayerQuery}
                  onChange={(e) => setSearchPlayerQuery(e.target.value)}
                  placeholder={lang === 'it' ? 'Cerca calciatore...' : 'Search player...'}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--bg-primary)] border border-[var(--border-hairline)] focus:border-[#01A0E8] outline-none font-mono-tabular"
                />
              </div>
            )}
          </div>

          {/* Retired 10 Rationale */}
          {selectedItem.number === 10 && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/40 text-xs font-mono-tabular space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase">
                <Award className="w-4 h-4" />
                <span>
                  {lang === 'it'
                    ? 'TRIBUTO ETERNO A DIEGO ARMANDO MARADONA'
                    : 'ETERNAL TRIBUTE TO DIEGO ARMANDO MARADONA'}
                </span>
              </div>
              <p className="leading-relaxed text-[var(--text-primary)] font-sans">
                {lang === 'it'
                  ? 'Nell’estate del 2000 la SSC Napoli deliberò il ritiro definitivo della maglia numero 10 in onore di Diego Armando Maradona, protagonista assoluto dei due Scudetti (1987 e 1990), della Coppa UEFA (1989), della Coppa Italia e della Supercoppa. La maglia fu reindossata temporaneamente soltanto in Serie C1 (2004–2006) per obbligo di numerazione fissa 1–11 imposto dai regolamenti federali dell’epoca.'
                  : 'In summer 2000, SSC Napoli officially retired jersey #10 in perpetual honor of Diego Armando Maradona, architect of the 1987 and 1990 Scudetti, 1989 UEFA Cup, Coppa Italia and Supercoppa. It was worn temporarily only during the Serie C1 years (2004–2006) due to strict federation rules requiring 1–11 starter numbering.'}
              </p>
            </div>
          )}

          {/* Table of wearers */}
          {filteredPlayers.length > 0 ? (
            <div className="border border-[var(--border-hairline)] overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono-tabular">
                <thead>
                  <tr className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)] bg-[var(--bg-primary)]/40">
                    <th className="py-2.5 px-3 w-12 text-center">#</th>
                    <th className="py-2.5 px-3">{lang === 'it' ? 'Calciatore' : 'Player'}</th>
                    <th className="py-2.5 px-3">{lang === 'it' ? 'Stagioni con questo numero' : 'Seasons Worn'}</th>
                    <th className="py-2.5 px-3 text-right">{lang === 'it' ? 'Stato' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-hairline)]">
                  {filteredPlayers.map((p, idx) => (
                    <tr key={idx} className="hover:bg-[var(--bg-primary)]/60">
                      <td className="py-2.5 px-3 text-center font-bold text-[#01A0E8]">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[var(--text-primary)]">
                        {p.player_name}
                      </td>
                      <td className="py-2.5 px-3 text-[var(--text-secondary)]">
                        {p.seasons_worn}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {p.is_current ? (
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                            {lang === 'it' ? 'IN ROSA ATTUALE' : 'CURRENT SQUAD'}
                          </span>
                        ) : (
                          <span className="text-[var(--text-secondary)] opacity-60">
                            {lang === 'it' ? 'Storico' : 'Past'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-xs font-mono-tabular text-[var(--text-secondary)]">
              {lang === 'it'
                ? 'Nessun calciatore ha mai indossato questo numero di maglia in gare ufficiali.'
                : 'No player has ever worn this squad number in official matches.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

