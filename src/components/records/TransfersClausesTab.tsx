import React, { useMemo, useState } from 'react';
import { DollarSign, Search, ShieldCheck, ArrowRight, ArrowUpRight, ArrowDownLeft, Users } from 'lucide-react';
import rawAlmanacco from '../../data/generated/almanacco_records.json';
import rawSeasonTransfers from '../../data/generated/season_transfers_all.json';
import rawSeasonSquads from '../../data/generated/season_squads_all.json';

interface TransfersClausesTabProps {
  lang: 'it' | 'en';
}

export const TransfersClausesTab: React.FC<TransfersClausesTabProps> = ({ lang }) => {
  const [subView, setSubView] = useState<'buys' | 'sales' | 'clauses' | 'all_transfers' | 'squads'>('buys');
  const [searchQuery, setSearchQuery] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('ALL');
  const [squadSeasonFilter, setSquadSeasonFilter] = useState<number>(2025);

  const recordTransfers = (rawAlmanacco.record_transfers || []) as any[];
  const releaseClauses = (rawAlmanacco.contract_release_clauses || []) as any[];
  const allTransfers = (rawSeasonTransfers as any[]) || [];
  const allSquads = (rawSeasonSquads as any[]) || [];

  // Available seasons for historical transfers ledger
  const availableSeasons = useMemo(() => {
    const sSet = new Set<string>();
    allTransfers.forEach((t) => {
      if (t.season) sSet.add(t.season);
    });
    return Array.from(sSet).sort().reverse();
  }, [allTransfers]);

  // Available seasons for historical squads
  const availableSquadSeasons = useMemo(() => {
    const sSet = new Set<number>();
    allSquads.forEach((s) => {
      if (s.season) sSet.add(s.season);
    });
    return Array.from(sSet).sort((a, b) => b - a);
  }, [allSquads]);

  // Filtered record transfers (buys or sales)
  const filteredRecordTransfers = useMemo(() => {
    return recordTransfers
      .filter((rt) =>
        subView === 'buys'
          ? rt.record_type.includes('buy') || rt.record_type.includes('in')
          : rt.record_type.includes('sale') || rt.record_type.includes('out')
      )
      .filter((rt) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          (rt.player_name || '').toLowerCase().includes(q) ||
          (rt.other_club || '').toLowerCase().includes(q)
        );
      });
  }, [recordTransfers, subView, searchQuery]);

  // Filtered all historical transfers
  const filteredAllTransfers = useMemo(() => {
    return allTransfers
      .filter((t) => (seasonFilter === 'ALL' ? true : t.season === seasonFilter))
      .filter((t) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          (t.player_name || '').toLowerCase().includes(q) ||
          (t.other_club || '').toLowerCase().includes(q)
        );
      });
  }, [allTransfers, seasonFilter, searchQuery]);

  // Filtered squads for the selected season
  const filteredSquads = useMemo(() => {
    return allSquads
      .filter((s) => s.season === squadSeasonFilter)
      .filter((s) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          (s.player_name || '').toLowerCase().includes(q) ||
          (s.position || '').toLowerCase().includes(q) ||
          (s.nationalities || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        // Group by position roughly: GK -> DF -> MF -> FW
        const getWeight = (pos: string = '') => {
          if (pos.includes('Goalkeeper')) return 1;
          if (pos.includes('Back') || pos.includes('Defender')) return 2;
          if (pos.includes('Midfield')) return 3;
          return 4;
        };
        return getWeight(a.position) - getWeight(b.position);
      });
  }, [allSquads, squadSeasonFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Sub-view switcher */}
      <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-3 text-xs font-mono-tabular">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSubView('buys')}
            className={`px-3 py-1.5 border transition-colors cursor-pointer flex items-center gap-1.5 ${
              subView === 'buys'
                ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                : 'border-[var(--border-hairline)] text-[var(--text-secondary)] hover:border-[#01A0E8]'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'it' ? 'Record Acquisti' : 'Record Buys'}</span>
          </button>
          <button
            onClick={() => setSubView('sales')}
            className={`px-3 py-1.5 border transition-colors cursor-pointer flex items-center gap-1.5 ${
              subView === 'sales'
                ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                : 'border-[var(--border-hairline)] text-[var(--text-secondary)] hover:border-[#01A0E8]'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'it' ? 'Record Cessioni' : 'Record Sales'}</span>
          </button>
          <button
            onClick={() => setSubView('clauses')}
            className={`px-3 py-1.5 border transition-colors cursor-pointer flex items-center gap-1.5 ${
              subView === 'clauses'
                ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                : 'border-[var(--border-hairline)] text-[var(--text-secondary)] hover:border-[#01A0E8]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{lang === 'it' ? 'Clausole Rescissorie (14)' : 'Release Clauses (14)'}</span>
          </button>
          <button
            onClick={() => setSubView('all_transfers')}
            className={`px-3 py-1.5 border transition-colors cursor-pointer flex items-center gap-1.5 ${
              subView === 'all_transfers'
                ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                : 'border-[var(--border-hairline)] text-[var(--text-secondary)] hover:border-[#01A0E8]'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>{lang === 'it' ? 'Storico Trasferimenti (1926–2026)' : 'Transfers History (1926–2026)'}</span>
          </button>
          <button
            onClick={() => setSubView('squads')}
            className={`px-3 py-1.5 border transition-colors cursor-pointer flex items-center gap-1.5 ${
              subView === 'squads'
                ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                : 'border-[var(--border-hairline)] text-[var(--text-secondary)] hover:border-[#01A0E8]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{lang === 'it' ? 'Rose Complete (1926–2026)' : 'Squad Rosters (1926–2026)'}</span>
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          {subView === 'all_transfers' && (
            <select
              value={seasonFilter}
              onChange={(e) => setSeasonFilter(e.target.value)}
              className="px-2 py-1.5 text-xs bg-[var(--bg-primary)] border border-[var(--border-hairline)] text-[var(--text-primary)] outline-none"
            >
              <option value="ALL">{lang === 'it' ? 'Tutte le Stagioni' : 'All Seasons'}</option>
              {availableSeasons.slice(0, 30).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}

          {subView === 'squads' && (
            <select
              value={squadSeasonFilter}
              onChange={(e) => setSquadSeasonFilter(Number(e.target.value))}
              className="px-2 py-1.5 text-xs bg-[var(--bg-primary)] border border-[var(--border-hairline)] text-[var(--text-primary)] outline-none"
            >
              {availableSquadSeasons.map((s) => (
                <option key={s} value={s}>
                  {lang === 'it' ? `Stagione ${s}/${(s + 1).toString().slice(2)}` : `Season ${s}/${(s + 1).toString().slice(2)}`}
                </option>
              ))}
            </select>
          )}

          <div className="relative w-48 sm:w-56">
            <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'it' ? 'Cerca calciatore, club...' : 'Search player, club...'}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--bg-primary)] border border-[var(--border-hairline)] focus:border-[#01A0E8] outline-none"
            />
          </div>
        </div>
      </div>

      {/* 1 & 2. RECORD BUYS / SALES TABLE */}
      {(subView === 'buys' || subView === 'sales') && (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-hairline)] overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono-tabular">
            <thead>
              <tr className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)] bg-[var(--bg-primary)]/40">
                <th className="py-3 px-3 w-12 text-center">#</th>
                <th className="py-3 px-3">{lang === 'it' ? 'Calciatore' : 'Player'}</th>
                <th className="py-3 px-3">{lang === 'it' ? 'Stagione' : 'Season'}</th>
                <th className="py-3 px-3">{lang === 'it' ? 'Ruolo' : 'Position'}</th>
                <th className="py-3 px-3">{lang === 'it' ? 'Club Controparte' : 'Counterpart Club'}</th>
                <th className="py-3 px-3 text-right">{lang === 'it' ? 'Cifra Trasferimento' : 'Transfer Fee'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-hairline)]">
              {filteredRecordTransfers.map((rt: any, idx: number) => (
                <tr key={idx} className="hover:bg-[var(--bg-primary)]/60 transition-colors">
                  <td className="py-3 px-3 text-center font-bold text-[#01A0E8]">
                    #{rt.rank || idx + 1}
                  </td>
                  <td className="py-3 px-3 font-bold text-sm text-[var(--text-primary)]">
                    {rt.player_name}
                  </td>
                  <td className="py-3 px-3 text-[var(--text-secondary)]">
                    {rt.season}
                  </td>
                  <td className="py-3 px-3 text-[var(--text-secondary)]">
                    {rt.position || '—'}
                  </td>
                  <td className="py-3 px-3 text-[var(--text-primary)]">
                    {rt.other_club}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-sm text-[#01A0E8]">
                    {rt.fee_display || rt.fee_text || (rt.fee_numeric_eur ? `€ ${(rt.fee_numeric_eur / 1000000).toFixed(1)}M` : '—')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. RELEASE CLAUSES TABLE */}
      {subView === 'clauses' && (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-hairline)] overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono-tabular">
            <thead>
              <tr className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)] bg-[var(--bg-primary)]/40">
                <th className="py-3 px-3 w-12 text-center">#</th>
                <th className="py-3 px-3">{lang === 'it' ? 'Calciatore' : 'Player'}</th>
                <th className="py-3 px-3 text-right">{lang === 'it' ? 'Valore Clausola' : 'Clause Amount'}</th>
                <th className="py-3 px-3 text-center">{lang === 'it' ? 'Stato' : 'Status'}</th>
                <th className="py-3 px-3">{lang === 'it' ? 'Club Acquirente' : 'Exercising Club'}</th>
                <th className="py-3 px-3">{lang === 'it' ? 'Data Esercizio' : 'Exercise Date'}</th>
                <th className="py-3 px-3">{lang === 'it' ? 'Dettagli & Note Legali' : 'Details & Legal Notes'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-hairline)]">
              {releaseClauses.map((c: any, idx: number) => (
                <tr key={idx} className="hover:bg-[var(--bg-primary)]/60 transition-colors">
                  <td className="py-3 px-3 text-center font-bold text-[#01A0E8]">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-3 font-bold text-sm text-[var(--text-primary)]">
                    {c.player_name}
                  </td>
                  <td className="py-3 px-3 text-right font-extrabold text-[#01A0E8] text-sm whitespace-nowrap">
                    {c.clause_amount_text || `€ ${(c.clause_amount_eur / 1000000).toFixed(1)}M`}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 font-bold text-[10px] ${
                        c.status === 'Esercitata'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-[var(--text-primary)]">
                    {c.exercising_club || '—'}
                  </td>
                  <td className="py-3 px-3 text-[var(--text-secondary)] whitespace-nowrap">
                    {c.exercising_date || '—'}
                  </td>
                  <td className="py-3 px-3 text-[var(--text-secondary)] max-w-xs text-[11px] leading-relaxed">
                    {c.details_and_notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. ALL HISTORICAL TRANSFERS LEDGER */}
      {subView === 'all_transfers' && (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-hairline)] overflow-x-auto">
          <div className="p-3 bg-[var(--bg-primary)] border-b border-[var(--border-hairline)] text-xs text-[var(--text-secondary)] font-mono-tabular">
            {lang === 'it'
              ? `Visualizzati ${filteredAllTransfers.length} trasferimenti storici registrati a bilancio`
              : `Showing ${filteredAllTransfers.length} historical balance sheet transfers`}
          </div>
          <table className="w-full text-left text-xs border-collapse font-mono-tabular">
            <thead>
              <tr className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)] bg-[var(--bg-primary)]/40">
                <th className="py-2.5 px-3">{lang === 'it' ? 'Stagione' : 'Season'}</th>
                <th className="py-2.5 px-3 text-center">{lang === 'it' ? 'Direzione' : 'Type'}</th>
                <th className="py-2.5 px-3">{lang === 'it' ? 'Calciatore' : 'Player'}</th>
                <th className="py-2.5 px-3 text-center">{lang === 'it' ? 'Età' : 'Age'}</th>
                <th className="py-2.5 px-3">{lang === 'it' ? 'Club Controparte' : 'Counterpart Club'}</th>
                <th className="py-2.5 px-3 text-right">{lang === 'it' ? 'Cifra / Formula' : 'Fee / Formula'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-hairline)]">
              {filteredAllTransfers.slice(0, 100).map((t: any, idx: number) => (
                <tr key={idx} className="hover:bg-[var(--bg-primary)]/60 transition-colors">
                  <td className="py-2 px-3 font-semibold text-[var(--text-secondary)]">
                    {t.season}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold ${
                        t.direction === 'in'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {t.direction === 'in' ? (lang === 'it' ? 'ACQUISTO' : 'IN') : (lang === 'it' ? 'CESSIONE' : 'OUT')}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-bold text-[var(--text-primary)]">
                    {t.player_name}
                  </td>
                  <td className="py-2 px-3 text-center text-[var(--text-secondary)]">
                    {t.age || '—'}
                  </td>
                  <td className="py-2 px-3 text-[var(--text-primary)]">
                    {t.other_club || '—'}
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-[#01A0E8]">
                    {t.fee_raw || (t.fee_eur > 0 ? `€ ${(t.fee_eur / 1000000).toFixed(2)}M` : '—')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. HISTORICAL SQUADS ROSTER */}
      {subView === 'squads' && (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-hairline)] overflow-x-auto">
          <div className="p-3 bg-[var(--bg-primary)] border-b border-[var(--border-hairline)] flex items-center justify-between text-xs text-[var(--text-secondary)] font-mono-tabular">
            <span>
              {lang === 'it'
                ? `Rosa Ufficiale Stagione ${squadSeasonFilter}/${(squadSeasonFilter + 1).toString().slice(2)} — ${filteredSquads.length} calciatori registrati`
                : `Official Squad Season ${squadSeasonFilter}/${(squadSeasonFilter + 1).toString().slice(2)} — ${filteredSquads.length} registered players`}
            </span>
            <span className="text-[#01A0E8] font-bold">
              {lang === 'it' ? 'Archivio Storico Ufficiale' : 'Official Historical Archive'}
            </span>
          </div>
          <table className="w-full text-left text-xs border-collapse font-mono-tabular">
            <thead>
              <tr className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)] bg-[var(--bg-primary)]/40">
                <th className="py-2.5 px-3 text-center w-12">{lang === 'it' ? 'N°' : 'No.'}</th>
                <th className="py-2.5 px-3">{lang === 'it' ? 'Calciatore' : 'Player'}</th>
                <th className="py-2.5 px-3">{lang === 'it' ? 'Ruolo' : 'Position'}</th>
                <th className="py-2.5 px-3 text-center">{lang === 'it' ? 'Età' : 'Age'}</th>
                <th className="py-2.5 px-3">{lang === 'it' ? 'Nazionalità' : 'Nationality'}</th>
                <th className="py-2.5 px-3 text-center">{lang === 'it' ? 'Altezza' : 'Height'}</th>
                <th className="py-2.5 px-3 text-right">{lang === 'it' ? 'Valore (€)' : 'Value (€)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-hairline)]">
              {filteredSquads.map((p: any, idx: number) => (
                <tr key={idx} className="hover:bg-[var(--bg-primary)]/60 transition-colors">
                  <td className="py-2.5 px-3 text-center font-bold text-[#01A0E8]">
                    {p.shirt_number || '—'}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-sm text-[var(--text-primary)]">
                    {p.player_name}
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-secondary)]">
                    <span className="px-1.5 py-0.5 bg-[var(--bg-primary)] border border-[var(--border-hairline)] text-[10px]">
                      {p.position || 'N/A'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center text-[var(--text-secondary)]">
                    {p.age || '—'}
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-primary)]">
                    {p.nationalities || 'Italia'}
                  </td>
                  <td className="py-2.5 px-3 text-center text-[var(--text-secondary)]">
                    {p.height_m ? `${p.height_m} m` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#01A0E8]">
                    {p.market_value_eur ? `€ ${(p.market_value_eur / 1000000).toFixed(2)}M` : '—'}
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

