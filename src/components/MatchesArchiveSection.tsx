import React, { useMemo, useState } from 'react';
import {
  Folder,
  FolderOpen,
  Calendar,
  ChevronDown,
  ChevronRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users,
  Shield,
  Activity,
  Sparkles,
} from 'lucide-react';
import rawSeasons from '../data/generated/seasons_archive.json';

interface MatchEvent {
  type: 'goal' | 'card' | 'substitution';
  min: string;
  scorer?: string;
  assist?: string;
  player?: string;
  card?: string;
  sub_in?: string;
  sub_out?: string;
  desc?: string;
  reason?: string;
}

interface SeasonMatch {
  id: string;
  date: string;
  time: string;
  competition: string;
  matchday: string;
  is_home: boolean;
  venue_letter: string;
  home_team: string;
  away_team: string;
  home_goals: number;
  away_goals: number;
  result_for_napoli: 'V' | 'N' | 'P';
  attendance: number | null;
  referee?: string | null;
  system_of_play?: string | null;
  events?: MatchEvent[];
  notes?: string | null;
}

interface SeasonData {
  season_year: number;
  season_label: string;
  matches_count: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  competitions: string[];
  notable_badge: string | null;
  matches: SeasonMatch[];
}

interface MatchesArchiveSectionProps {
  lang: 'it' | 'en';
  onSelectMatch: (matchId: string) => void;
}

type SortField = 'date' | 'competition' | 'teams' | 'score' | 'result' | 'attendance';
type SortDirection = 'asc' | 'desc';

export const MatchesArchiveSection: React.FC<MatchesArchiveSectionProps> = ({
  lang,
  onSelectMatch,
}) => {
  const seasons = (rawSeasons as unknown as SeasonData[]) || [];

  // Expanded season IDs (default open latest 2026/27)
  const [expandedSeasons, setExpandedSeasons] = useState<Record<number, boolean>>({
    [seasons[0]?.season_year || 2026]: true,
  });

  // Season-specific filters
  const [compFilters, setCompFilters] = useState<Record<number, string>>({});
  const [venueFilters, setVenueFilters] = useState<Record<number, string>>({});
  const [resultFilters, setResultFilters] = useState<Record<number, string>>({});

  // Season-specific sort configurations
  const [seasonSorts, setSeasonSorts] = useState<
    Record<number, { field: SortField; direction: SortDirection }>
  >({});

  // Global search for season, opponent, referee or scorer
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSeason = (sYear: number) => {
    setExpandedSeasons((prev) => ({
      ...prev,
      [sYear]: !prev[sYear],
    }));
  };

  const handleSort = (sYear: number, field: SortField) => {
    setSeasonSorts((prev) => {
      const current = prev[sYear] || { field: 'date', direction: 'asc' };
      if (current.field === field) {
        return {
          ...prev,
          [sYear]: {
            field,
            direction: current.direction === 'asc' ? 'desc' : 'asc',
          },
        };
      }
      return {
        ...prev,
        [sYear]: {
          field,
          direction: 'asc',
        },
      };
    });
  };

  const filteredSeasons = useMemo(() => {
    if (!searchQuery.trim()) return seasons;
    const q = searchQuery.toLowerCase();
    return seasons.filter((s) => {
      const matchesSeason =
        s.season_label.toLowerCase().includes(q) ||
        String(s.season_year).includes(q) ||
        (s.notable_badge || '').toLowerCase().includes(q);
      const matchesAnyMatch = s.matches.some(
        (m) =>
          m.home_team.toLowerCase().includes(q) ||
          m.away_team.toLowerCase().includes(q) ||
          m.competition.toLowerCase().includes(q) ||
          (m.referee || '').toLowerCase().includes(q) ||
          (m.notes || '').toLowerCase().includes(q) ||
          (m.events || []).some(
            (e) =>
              (e.scorer || '').toLowerCase().includes(q) ||
              (e.player || '').toLowerCase().includes(q)
          )
      );
      return matchesSeason || matchesAnyMatch;
    });
  }, [seasons, searchQuery]);

  return (
    <div className="space-y-8">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-hairline)] pb-5">
        <div>
          <div className="text-xs font-mono-tabular text-[#01A0E8] uppercase tracking-widest font-bold">
            {lang === 'it' ? 'ARCHIVIO STORICO GENERALE' : 'GENERAL HISTORICAL ARCHIVE'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight mt-1">
            {lang === 'it'
              ? 'Archivio Partite per Stagione (1926 – 2026)'
              : 'Match Archive by Season (1926 – 2026)'}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-mono-tabular mt-1">
            {lang === 'it'
              ? '3.916 Gare con Spettatori Ufficiali, Arbitri, Moduli Tattici, Eventi e Ordinamento'
              : '3,916 Matches with Official Attendance, Referees, Formations, Events & Sorting'}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'it'
                ? 'Cerca anno, avversario, arbitro, marcatore...'
                : 'Search year, opponent, referee, scorer...'
            }
            className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--bg-secondary)] border border-[var(--border-hairline)] focus:border-[#01A0E8] outline-none font-mono-tabular"
          />
        </div>
      </div>

      {/* SEASONS LIST (FOLDERS ACCORDION) */}
      <div className="space-y-3">
        {filteredSeasons.map((s) => {
          const isExpanded = !!expandedSeasons[s.season_year];
          const activeComp = compFilters[s.season_year] || 'ALL';
          const activeVenue = venueFilters[s.season_year] || 'ALL';
          const activeRes = resultFilters[s.season_year] || 'ALL';
          const currentSort = seasonSorts[s.season_year] || { field: 'date', direction: 'asc' };

          let seasonMatches = s.matches.filter((m) => {
            if (activeComp !== 'ALL' && m.competition !== activeComp) return false;
            if (activeVenue === 'H' && !m.is_home) return false;
            if (activeVenue === 'A' && m.is_home) return false;
            if (activeRes !== 'ALL' && m.result_for_napoli !== activeRes) return false;
            if (searchQuery.trim()) {
              const q = searchQuery.toLowerCase();
              const matchHay = `${m.home_team} ${m.away_team} ${m.date} ${m.referee || ''} ${
                m.notes || ''
              }`.toLowerCase();
              const matchesScorer = (m.events || []).some(
                (e) =>
                  (e.scorer || '').toLowerCase().includes(q) ||
                  (e.player || '').toLowerCase().includes(q)
              );
              if (!matchHay.includes(q) && !s.season_label.toLowerCase().includes(q) && !matchesScorer) {
                return false;
              }
            }
            return true;
          });

          // Sort matches according to active column
          seasonMatches = [...seasonMatches].sort((a, b) => {
            let comp = 0;
            if (currentSort.field === 'date') {
              comp = a.date.localeCompare(b.date);
            } else if (currentSort.field === 'competition') {
              comp = a.competition.localeCompare(b.competition);
            } else if (currentSort.field === 'teams') {
              const oppA = a.home_team === 'Napoli' ? a.away_team : a.home_team;
              const oppB = b.home_team === 'Napoli' ? b.away_team : b.home_team;
              comp = oppA.localeCompare(oppB);
            } else if (currentSort.field === 'score') {
              const goalsA = a.home_goals + a.away_goals;
              const goalsB = b.home_goals + b.away_goals;
              comp = goalsA - goalsB;
            } else if (currentSort.field === 'result') {
              comp = a.result_for_napoli.localeCompare(b.result_for_napoli);
            } else if (currentSort.field === 'attendance') {
              comp = (a.attendance || 0) - (b.attendance || 0);
            }
            return currentSort.direction === 'asc' ? comp : -comp;
          });

          return (
            <div
              key={s.season_year}
              className="bg-[var(--bg-secondary)] border border-[var(--border-hairline)] overflow-hidden transition-all"
            >
              {/* Folder Header */}
              <button
                onClick={() => toggleSeason(s.season_year)}
                className="w-full p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-left hover:bg-[var(--bg-primary)]/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-none bg-[var(--bg-primary)] border border-[var(--border-hairline)] flex items-center justify-center text-[#01A0E8]">
                    {isExpanded ? (
                      <FolderOpen className="w-4 h-4 text-[#01A0E8]" />
                    ) : (
                      <Folder className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-display font-extrabold text-base sm:text-lg">
                        {lang === 'it' ? `Stagione ${s.season_label}` : `Season ${s.season_label}`}
                      </span>
                      {s.notable_badge && (
                        <span className="px-2 py-0.5 bg-[#01A0E8]/15 border border-[#01A0E8] text-[#01A0E8] font-mono-tabular text-[11px] font-bold">
                          {s.notable_badge}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] font-mono-tabular mt-0.5">
                      {s.matches_count} {lang === 'it' ? 'partite' : 'matches'} ·{' '}
                      <span className="text-[#01A0E8] font-semibold">
                        {s.wins} {lang === 'it' ? 'V' : 'W'}
                      </span>{' '}
                      ·{' '}
                      <span>
                        {s.draws} {lang === 'it' ? 'P' : 'D'}
                      </span>{' '}
                      ·{' '}
                      <span>
                        {s.losses} {lang === 'it' ? 'S' : 'L'}
                      </span>{' '}
                      · {lang === 'it' ? 'Gol' : 'Goals'}: {s.goals_for}-{s.goals_against}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono-tabular text-[var(--text-secondary)] hidden sm:inline">
                    {isExpanded
                      ? lang === 'it'
                        ? 'Chiudi cartella'
                        : 'Close folder'
                      : lang === 'it'
                      ? 'Espandi cartella'
                      : 'Open folder'}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-[#01A0E8]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
                  )}
                </div>
              </button>

              {/* Folder Contents */}
              {isExpanded && (
                <div className="border-t border-[var(--border-hairline)] bg-[var(--bg-primary)]/50 p-4 sm:p-6 space-y-4">
                  {/* Inside Filters */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono-tabular p-3 bg-[var(--bg-secondary)] border border-[var(--border-hairline)]">
                    {/* Competition Filter */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[var(--text-secondary)]">
                        {lang === 'it' ? 'COMPETIZIONE:' : 'COMPETITION:'}
                      </span>
                      <button
                        onClick={() =>
                          setCompFilters((prev) => ({ ...prev, [s.season_year]: 'ALL' }))
                        }
                        className={`px-2 py-0.5 border cursor-pointer ${
                          activeComp === 'ALL'
                            ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                            : 'border-[var(--border-hairline)] text-[var(--text-secondary)]'
                        }`}
                      >
                        {lang === 'it' ? 'Tutte' : 'All'}
                      </button>
                      {s.competitions.map((comp) => (
                        <button
                          key={comp}
                          onClick={() =>
                            setCompFilters((prev) => ({ ...prev, [s.season_year]: comp }))
                          }
                          className={`px-2 py-0.5 border cursor-pointer ${
                            activeComp === comp
                              ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                              : 'border-[var(--border-hairline)] text-[var(--text-secondary)]'
                          }`}
                        >
                          {comp}
                        </button>
                      ))}
                    </div>

                    {/* Venue & Result Filter */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-[var(--text-secondary)]">
                          {lang === 'it' ? 'LUOGO:' : 'VENUE:'}
                        </span>
                        {[
                          { id: 'ALL', it: 'Tutti', en: 'All' },
                          { id: 'H', it: 'Casa', en: 'Home' },
                          { id: 'A', it: 'Trasferta', en: 'Away' },
                        ].map((v) => (
                          <button
                            key={v.id}
                            onClick={() =>
                              setVenueFilters((prev) => ({ ...prev, [s.season_year]: v.id }))
                            }
                            className={`px-2 py-0.5 border cursor-pointer ${
                              activeVenue === v.id
                                ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                                : 'border-[var(--border-hairline)] text-[var(--text-secondary)]'
                            }`}
                          >
                            {lang === 'it' ? v.it : v.en}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[var(--text-secondary)]">
                          {lang === 'it' ? 'ESITO:' : 'OUTCOME:'}
                        </span>
                        {(
                          [
                            { id: 'ALL', it: 'Tutti', en: 'All' },
                            { id: 'V', it: 'Vittorie', en: 'Wins' },
                            { id: 'N', it: 'Pareggi', en: 'Draws' },
                            { id: 'P', it: 'Sconfitte', en: 'Losses' },
                          ] as const
                        ).map((r) => (
                          <button
                            key={r.id}
                            onClick={() =>
                              setResultFilters((prev) => ({ ...prev, [s.season_year]: r.id }))
                            }
                            className={`px-2 py-0.5 border cursor-pointer ${
                              activeRes === r.id
                                ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                                : 'border-[var(--border-hairline)] text-[var(--text-secondary)]'
                            }`}
                          >
                            {lang === 'it' ? r.it : r.en}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Matches Table with Clickable Sort Columns */}
                  <div className="bg-[var(--bg-secondary)] border border-[var(--border-hairline)] overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse font-mono-tabular">
                      <thead>
                        <tr className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)] bg-[var(--bg-primary)]/40 select-none">
                          <th
                            onClick={() => handleSort(s.season_year, 'date')}
                            className="py-2.5 px-3 cursor-pointer hover:text-[#01A0E8] transition-colors"
                          >
                            <div className="flex items-center gap-1">
                              <span>{lang === 'it' ? 'Data' : 'Date'}</span>
                              {currentSort.field === 'date' ? (
                                currentSort.direction === 'asc' ? (
                                  <ArrowUp className="w-3 h-3 text-[#01A0E8]" />
                                ) : (
                                  <ArrowDown className="w-3 h-3 text-[#01A0E8]" />
                                )
                              ) : (
                                <ArrowUpDown className="w-3 h-3 opacity-40" />
                              )}
                            </div>
                          </th>
                          <th
                            onClick={() => handleSort(s.season_year, 'competition')}
                            className="py-2.5 px-3 cursor-pointer hover:text-[#01A0E8] transition-colors"
                          >
                            <div className="flex items-center gap-1">
                              <span>{lang === 'it' ? 'Competizione' : 'Competition'}</span>
                              {currentSort.field === 'competition' ? (
                                currentSort.direction === 'asc' ? (
                                  <ArrowUp className="w-3 h-3 text-[#01A0E8]" />
                                ) : (
                                  <ArrowDown className="w-3 h-3 text-[#01A0E8]" />
                                )
                              ) : (
                                <ArrowUpDown className="w-3 h-3 opacity-40" />
                              )}
                            </div>
                          </th>
                          <th
                            onClick={() => handleSort(s.season_year, 'teams')}
                            className="py-2.5 px-3 cursor-pointer hover:text-[#01A0E8] transition-colors"
                          >
                            <div className="flex items-center gap-1">
                              <span>{lang === 'it' ? 'Incontro & Dettagli Gara' : 'Fixture & Details'}</span>
                              {currentSort.field === 'teams' ? (
                                currentSort.direction === 'asc' ? (
                                  <ArrowUp className="w-3 h-3 text-[#01A0E8]" />
                                ) : (
                                  <ArrowDown className="w-3 h-3 text-[#01A0E8]" />
                                )
                              ) : (
                                <ArrowUpDown className="w-3 h-3 opacity-40" />
                              )}
                            </div>
                          </th>
                          <th
                            onClick={() => handleSort(s.season_year, 'score')}
                            className="py-2.5 px-3 text-center cursor-pointer hover:text-[#01A0E8] transition-colors"
                          >
                            <div className="flex items-center justify-center gap-1">
                              <span>{lang === 'it' ? 'Risultato' : 'Score'}</span>
                              {currentSort.field === 'score' ? (
                                currentSort.direction === 'asc' ? (
                                  <ArrowUp className="w-3 h-3 text-[#01A0E8]" />
                                ) : (
                                  <ArrowDown className="w-3 h-3 text-[#01A0E8]" />
                                )
                              ) : (
                                <ArrowUpDown className="w-3 h-3 opacity-40" />
                              )}
                            </div>
                          </th>
                          <th
                            onClick={() => handleSort(s.season_year, 'result')}
                            className="py-2.5 px-3 text-center cursor-pointer hover:text-[#01A0E8] transition-colors"
                          >
                            <div className="flex items-center justify-center gap-1">
                              <span>{lang === 'it' ? 'Esito' : 'Result'}</span>
                              {currentSort.field === 'result' ? (
                                currentSort.direction === 'asc' ? (
                                  <ArrowUp className="w-3 h-3 text-[#01A0E8]" />
                                ) : (
                                  <ArrowDown className="w-3 h-3 text-[#01A0E8]" />
                                )
                              ) : (
                                <ArrowUpDown className="w-3 h-3 opacity-40" />
                              )}
                            </div>
                          </th>
                          <th className="py-2.5 px-3 text-right">
                            {lang === 'it' ? 'Scheda' : 'Card'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-hairline)]">
                        {seasonMatches.map((m) => {
                          const goalEvents = (m.events || []).filter((e) => e.type === 'goal');
                          return (
                            <tr key={m.id} className="hover:bg-[var(--bg-primary)]/60">
                              <td className="py-2.5 px-3 whitespace-nowrap font-semibold">
                                {m.date}
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap text-[var(--text-secondary)]">
                                <div>{m.competition}</div>
                                {m.matchday && (
                                  <div className="text-[10px] opacity-75">{m.matchday}</div>
                                )}
                              </td>
                              <td className="py-2.5 px-3">
                                {/* Teams line */}
                                <div className="font-bold text-sm">
                                  <span
                                    className={
                                      m.home_team === 'Napoli' ? 'text-[#01A0E8]' : ''
                                    }
                                  >
                                    {m.home_team}
                                  </span>{' '}
                                  <span className="text-[var(--text-secondary)] font-normal">
                                    vs
                                  </span>{' '}
                                  <span
                                    className={
                                      m.away_team === 'Napoli' ? 'text-[#01A0E8]' : ''
                                    }
                                  >
                                    {m.away_team}
                                  </span>
                                </div>

                                {/* Goals/Scorers preview if available */}
                                {goalEvents.length > 0 && (
                                  <div className="text-[11px] text-[var(--text-secondary)] mt-1 flex flex-wrap items-center gap-2">
                                    <span className="text-emerald-400">⚽</span>
                                    <span>
                                      {goalEvents
                                        .map((g) => `${g.scorer || 'Gol'} ${g.min}`)
                                        .join(', ')}
                                    </span>
                                  </div>
                                )}

                                {/* Match detail badges: Spectators, Referee, Formation, Notes */}
                                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] font-mono-tabular">
                                  {m.attendance ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[var(--bg-primary)] border border-[var(--border-hairline)] text-[var(--text-secondary)]">
                                      <Users className="w-2.5 h-2.5 text-[#01A0E8]" />
                                      <span>{m.attendance.toLocaleString()} spett.</span>
                                    </span>
                                  ) : null}

                                  {m.referee ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[var(--bg-primary)] border border-[var(--border-hairline)] text-[var(--text-secondary)]">
                                      <Shield className="w-2.5 h-2.5 text-[#01A0E8]" />
                                      <span>{m.referee}</span>
                                    </span>
                                  ) : null}

                                  {m.system_of_play ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[var(--bg-primary)] border border-[var(--border-hairline)] text-[#01A0E8]">
                                      <Activity className="w-2.5 h-2.5" />
                                      <span>{m.system_of_play}</span>
                                    </span>
                                  ) : null}

                                  {m.notes ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#01A0E8]/10 text-[#01A0E8] border border-[#01A0E8]/30">
                                      <Sparkles className="w-2.5 h-2.5" />
                                      <span className="truncate max-w-[200px]">{m.notes}</span>
                                    </span>
                                  ) : null}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-sm tabular-nums whitespace-nowrap">
                                {m.home_goals} - {m.away_goals}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span
                                  className={`inline-block w-5 h-5 leading-5 text-center text-[10px] font-bold ${
                                    m.result_for_napoli === 'V'
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                      : m.result_for_napoli === 'N'
                                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                      : 'bg-red-500/20 text-red-400 border border-red-500/40'
                                  }`}
                                >
                                  {lang === 'it'
                                    ? m.result_for_napoli
                                    : m.result_for_napoli === 'V'
                                    ? 'W'
                                    : m.result_for_napoli === 'N'
                                    ? 'D'
                                    : 'L'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  onClick={() => onSelectMatch(m.id)}
                                  className="px-2.5 py-1 bg-[#01A0E8] text-[#08090B] font-bold text-[11px] hover:bg-[#01A0E8]/90 transition-colors cursor-pointer"
                                >
                                  {lang === 'it' ? 'Apri Scheda' : 'Open Card'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
