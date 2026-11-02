import React, { useMemo, useState } from 'react';
import {
  Trophy,
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  Award,
  Search,
  ChevronRight,
  Filter,
  BarChart3,
  Calendar,
  ShieldCheck,
  Zap,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Hash,
  Globe,
  Shield,
  Clock,
  Flame,
  ShieldAlert,
} from 'lucide-react';
import rawAlmanacco from '../data/generated/almanacco_records.json';
import rawFinancialsTactics from '../data/generated/club_financials_tactics.json';
import rawReferees from '../data/generated/club_referees.json';
import rawInjuries from '../data/generated/player_injuries_stats.json';
import { RecordMatchesTab } from './records/RecordMatchesTab';
import { AgeRecordsTab } from './records/AgeRecordsTab';
import { ShirtNumbersTab } from './records/ShirtNumbersTab';
import { RefereesDossierTab } from './records/RefereesDossierTab';
import { ShootoutsTab } from './records/ShootoutsTab';
import { UefaRankingsTab } from './records/UefaRankingsTab';
import { StadiumAttendanceTab } from './records/StadiumAttendanceTab';
import { TransfersClausesTab } from './records/TransfersClausesTab';
import { IndividualHonoursView } from './records/IndividualHonoursView';
import { NationalTeamCapsView } from './records/NationalTeamCapsView';

interface EncyclopediaSectionProps {
  lang: 'it' | 'en';
  onSelectMatch?: (matchId: string) => void;
}

type SubTab =
  | 'piazzamenti'
  | 'palmares'
  | 'leggende'
  | 'mercato'
  | 'partite_record'
  | 'record_anagrafici'
  | 'almanacco_numeri'
  | 'arbitri'
  | 'rigori_decisivi'
  | 'ranking_uefa'
  | 'presenze_stadio'
  | 'allenatori'
  | 'finanze'
  | 'tattica'
  | 'head_to_head'
  | 'infortuni';

type SortDirection = 'asc' | 'desc';

// Helper for clickable sort header
function SortHeader({
  label,
  columnKey,
  activeKey,
  direction,
  onSort,
  align = 'left',
}: {
  label: string;
  columnKey: string;
  activeKey: string;
  direction: SortDirection;
  onSort: (key: string) => void;
  align?: 'left' | 'center' | 'right';
}) {
  const isActive = activeKey === columnKey;
  return (
    <th
      onClick={() => onSort(columnKey)}
      className={`py-3 px-3 cursor-pointer select-none hover:text-[#01A0E8] transition-colors ${
        align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      <div
        className={`inline-flex items-center gap-1 ${
          align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'
        }`}
      >
        <span>{label}</span>
        {isActive ? (
          direction === 'asc' ? (
            <ArrowUp className="w-3 h-3 text-[#01A0E8]" />
          ) : (
            <ArrowDown className="w-3 h-3 text-[#01A0E8]" />
          )
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-30" />
        )}
      </div>
    </th>
  );
}

export const EncyclopediaSection: React.FC<EncyclopediaSectionProps> = ({
  lang,
  onSelectMatch,
}) => {
  const [activeTab, setActiveTab] = useState<SubTab>('piazzamenti');
  const [palmaresSubView, setPalmaresSubView] = useState<'trophies' | 'individual_honours'>('trophies');
  const [legendsSubView, setLegendsSubView] = useState<'club_records' | 'national_teams'>('club_records');

  // Filter states
  const [searchPlacement, setSearchPlacement] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');

  const [recordPlayerCat, setRecordPlayerCat] = useState<
    'appearances' | 'goals' | 'assists' | 'yellow_cards' | 'minutes'
  >('appearances');
  const [searchPlayer, setSearchPlayer] = useState('');

  const [transferType, setTransferType] = useState<'buys' | 'sales'>('buys');
  const [searchTransfer, setSearchTransfer] = useState('');

  const [searchManager, setSearchManager] = useState('');
  const [managerMinMatches, setManagerMinMatches] = useState(0);

  const [searchOpponent, setSearchOpponent] = useState('');

  // Tab-specific sorting states
  const [sortPlacements, setSortPlacements] = useState<{ key: string; dir: SortDirection }>({
    key: 'season',
    dir: 'desc',
  });
  const [sortPlayers, setSortPlayers] = useState<{ key: string; dir: SortDirection }>({
    key: 'value',
    dir: 'desc',
  });
  const [sortTransfers, setSortTransfers] = useState<{ key: string; dir: SortDirection }>({
    key: 'fee',
    dir: 'desc',
  });
  const [sortManagers, setSortManagers] = useState<{ key: string; dir: SortDirection }>({
    key: 'matches',
    dir: 'desc',
  });
  const [sortFinancials, setSortFinancials] = useState<{ key: string; dir: SortDirection }>({
    key: 'season',
    dir: 'desc',
  });
  const [sortTactics, setSortTactics] = useState<{ key: string; dir: SortDirection }>({
    key: 'season',
    dir: 'desc',
  });
  const [sortH2H, setSortH2H] = useState<{ key: string; dir: SortDirection }>({
    key: 'matches',
    dir: 'desc',
  });
  const [sortInjuries, setSortInjuries] = useState<{ key: string; dir: SortDirection }>({
    key: 'days',
    dir: 'desc',
  });

  const toggleSort = (
    setter: React.Dispatch<React.SetStateAction<{ key: string; dir: SortDirection }>>,
    key: string
  ) => {
    setter((prev) => {
      if (prev.key === key) {
        return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
      }
      return { key, dir: 'desc' };
    });
  };

  // Raw data imports
  const placements = rawAlmanacco.placements || [];
  const trophies = rawAlmanacco.trophies || [];
  const recordPlayers = rawAlmanacco.record_players || [];
  const recordTransfers = rawAlmanacco.record_transfers || [];
  const releaseClauses = rawAlmanacco.contract_release_clauses || [];
  const managers = rawAlmanacco.managers_history || [];
  const headToHead = rawAlmanacco.head_to_head || [];
  const individualHonours = rawAlmanacco.individual_honours || [];

  const financials = rawFinancialsTactics.financials || [];
  const tactics = rawFinancialsTactics.tactics || [];
  const uefaRankings = rawFinancialsTactics.uefa_rankings || [];

  const injuriesByCategory = rawInjuries.by_category || [];
  const topInjured = rawInjuries.top_injured_players || [];

  // 1. FILTERED & SORTED PLACEMENTS
  const filteredPlacements = useMemo(() => {
    const list = placements.filter((p: any) => {
      if (tierFilter !== 'ALL' && p.league !== tierFilter) return false;
      if (searchPlacement.trim() !== '') {
        const q = searchPlacement.toLowerCase();
        const hay = `${p.season} ${p.league} ${p.manager || ''} ${p.rank}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return [...list].sort((a: any, b: any) => {
      const k = sortPlacements.key;
      let comp = 0;
      if (k === 'season') {
        comp = String(a.season).localeCompare(String(b.season));
      } else if (k === 'league') {
        comp = String(a.league).localeCompare(String(b.league));
      } else if (k === 'rank') {
        const numA = parseInt(a.rank) || 99;
        const numB = parseInt(b.rank) || 99;
        comp = numA - numB;
      } else if (k === 'matches') {
        comp = (a.matches || 0) - (b.matches || 0);
      } else if (k === 'wins') {
        comp = (a.wins || 0) - (b.wins || 0);
      } else if (k === 'goals') {
        comp = (a.goals_for || 0) - (b.goals_for || 0);
      } else if (k === 'goal_diff') {
        comp = (a.goal_diff || 0) - (b.goal_diff || 0);
      } else if (k === 'points') {
        comp = (a.points || 0) - (b.points || 0);
      } else if (k === 'manager') {
        comp = String(a.manager || '').localeCompare(String(b.manager || ''));
      }
      return sortPlacements.dir === 'asc' ? comp : -comp;
    });
  }, [placements, tierFilter, searchPlacement, sortPlacements]);

  // 2. FILTERED & SORTED RECORD PLAYERS
  const filteredRecordPlayers = useMemo(() => {
    const list = recordPlayers
      .filter((rp: any) => rp.category === recordPlayerCat)
      .filter((rp: any) => {
        if (!searchPlayer.trim()) return true;
        return (rp.player_name || '').toLowerCase().includes(searchPlayer.toLowerCase());
      });

    return [...list].sort((a: any, b: any) => {
      let comp = 0;
      if (sortPlayers.key === 'player_name') {
        comp = String(a.player_name || '').localeCompare(String(b.player_name || ''));
      } else if (sortPlayers.key === 'position') {
        comp = String(a.position || '').localeCompare(String(b.position || ''));
      } else if (sortPlayers.key === 'value') {
        comp = (Number(a.stat_value) || 0) - (Number(b.stat_value) || 0);
      } else if (sortPlayers.key === 'tenure') {
        comp = String(a.tenure || '').localeCompare(String(b.tenure || ''));
      }
      return sortPlayers.dir === 'asc' ? comp : -comp;
    });
  }, [recordPlayers, recordPlayerCat, searchPlayer, sortPlayers]);

  // 3. FILTERED & SORTED TRANSFERS
  const filteredTransfers = useMemo(() => {
    const list = recordTransfers
      .filter((rt: any) =>
        transferType === 'buys'
          ? rt.record_type.includes('buy') || rt.record_type.includes('in')
          : rt.record_type.includes('sale') || rt.record_type.includes('out')
      )
      .filter((rt: any) => {
        if (!searchTransfer.trim()) return true;
        return (
          (rt.player_name || '').toLowerCase().includes(searchTransfer.toLowerCase()) ||
          (rt.other_club || '').toLowerCase().includes(searchTransfer.toLowerCase())
        );
      });

    return [...list].sort((a: any, b: any) => {
      let comp = 0;
      if (sortTransfers.key === 'date') {
        comp = String(a.transfer_date || a.season || '').localeCompare(
          String(b.transfer_date || b.season || '')
        );
      } else if (sortTransfers.key === 'player_name') {
        comp = String(a.player_name || '').localeCompare(String(b.player_name || ''));
      } else if (sortTransfers.key === 'other_club') {
        comp = String(a.other_club || '').localeCompare(String(b.other_club || ''));
      } else if (sortTransfers.key === 'fee') {
        comp = (Number(a.fee_numeric_eur) || 0) - (Number(b.fee_numeric_eur) || 0);
      }
      return sortTransfers.dir === 'asc' ? comp : -comp;
    });
  }, [recordTransfers, transferType, searchTransfer, sortTransfers]);

  // 4. FILTERED & SORTED MANAGERS
  const filteredManagers = useMemo(() => {
    const list = managers
      .filter((m: any) => (m.matches || 0) >= managerMinMatches)
      .filter((m: any) => {
        if (!searchManager.trim()) return true;
        return (m.name || '').toLowerCase().includes(searchManager.toLowerCase());
      });

    return [...list].sort((a: any, b: any) => {
      let comp = 0;
      if (sortManagers.key === 'name') {
        comp = String(a.name || '').localeCompare(String(b.name || ''));
      } else if (sortManagers.key === 'nationality') {
        comp = String(a.nationality || '').localeCompare(String(b.nationality || ''));
      } else if (sortManagers.key === 'tenure') {
        comp = String(a.tenure || '').localeCompare(String(b.tenure || ''));
      } else if (sortManagers.key === 'matches') {
        comp = (a.matches || 0) - (b.matches || 0);
      } else if (sortManagers.key === 'wins') {
        comp = (a.wins || 0) - (b.wins || 0);
      } else if (sortManagers.key === 'win_pct') {
        comp = (a.win_pct || 0) - (b.win_pct || 0);
      } else if (sortManagers.key === 'pts_per_match') {
        comp = (a.pts_per_match || 0) - (b.pts_per_match || 0);
      }
      return sortManagers.dir === 'asc' ? comp : -comp;
    });
  }, [managers, managerMinMatches, searchManager, sortManagers]);

  // 5. SORTED FINANCIALS
  const sortedFinancials = useMemo(() => {
    return [...financials].sort((a: any, b: any) => {
      let comp = 0;
      if (sortFinancials.key === 'season') {
        comp = String(a.season).localeCompare(String(b.season));
      } else if (sortFinancials.key === 'revenue') {
        comp = (a.revenue_total || 0) - (b.revenue_total || 0);
      } else if (sortFinancials.key === 'wages') {
        comp = (a.staff_cost || 0) - (b.staff_cost || 0);
      } else if (sortFinancials.key === 'amortization') {
        comp = (a.amortization || 0) - (b.amortization || 0);
      } else if (sortFinancials.key === 'net_profit') {
        comp = (a.net_profit || 0) - (b.net_profit || 0);
      } else if (sortFinancials.key === 'net_debt') {
        comp = (a.net_debt || 0) - (b.net_debt || 0);
      }
      return sortFinancials.dir === 'asc' ? comp : -comp;
    });
  }, [financials, sortFinancials]);

  // 6. SORTED TACTICS
  const sortedTactics = useMemo(() => {
    return [...tactics].sort((a: any, b: any) => {
      let comp = 0;
      if (sortTactics.key === 'season') {
        comp = String(a.season).localeCompare(String(b.season));
      } else if (sortTactics.key === 'formation') {
        comp = String(a.primary_formation || '').localeCompare(String(b.primary_formation || ''));
      } else if (sortTactics.key === 'possession') {
        comp = (a.possession_avg || 0) - (b.possession_avg || 0);
      } else if (sortTactics.key === 'xg') {
        comp = (a.xg_total || 0) - (b.xg_total || 0);
      } else if (sortTactics.key === 'xga') {
        comp = (a.xga_total || 0) - (b.xga_total || 0);
      }
      return sortTactics.dir === 'asc' ? comp : -comp;
    });
  }, [tactics, sortTactics]);

  // 7. FILTERED & SORTED HEAD TO HEAD
  const filteredH2H = useMemo(() => {
    const list = headToHead.filter((h: any) => {
      if (!searchOpponent.trim()) return true;
      return (h.opponent_name || '').toLowerCase().includes(searchOpponent.toLowerCase());
    });

    return [...list].sort((a: any, b: any) => {
      let comp = 0;
      if (sortH2H.key === 'opponent_name') {
        comp = String(a.opponent_name || '').localeCompare(String(b.opponent_name || ''));
      } else if (sortH2H.key === 'matches') {
        comp = (a.matches || 0) - (b.matches || 0);
      } else if (sortH2H.key === 'wins') {
        comp = (a.wins || 0) - (b.wins || 0);
      } else if (sortH2H.key === 'draws') {
        comp = (a.draws || 0) - (b.draws || 0);
      } else if (sortH2H.key === 'losses') {
        comp = (a.losses || 0) - (b.losses || 0);
      } else if (sortH2H.key === 'goals_for') {
        comp = (a.goals_for || 0) - (b.goals_for || 0);
      } else if (sortH2H.key === 'goals_against') {
        comp = (a.goals_against || 0) - (b.goals_against || 0);
      } else if (sortH2H.key === 'win_pct') {
        const pctA = a.matches ? (a.wins / a.matches) * 100 : 0;
        const pctB = b.matches ? (b.wins / b.matches) * 100 : 0;
        comp = pctA - pctB;
      }
      return sortH2H.dir === 'asc' ? comp : -comp;
    });
  }, [headToHead, searchOpponent, sortH2H]);

  // 8. SORTED INJURIES
  const sortedInjuries = useMemo(() => {
    return [...topInjured].sort((a: any, b: any) => {
      let comp = 0;
      if (sortInjuries.key === 'player_name') {
        comp = String(a.player_name || '').localeCompare(String(b.player_name || ''));
      } else if (sortInjuries.key === 'injury_type') {
        comp = String(a.injury_type || '').localeCompare(String(b.injury_type || ''));
      } else if (sortInjuries.key === 'days') {
        comp = (a.days_out || 0) - (b.days_out || 0);
      } else if (sortInjuries.key === 'matches') {
        comp = (a.matches_missed || 0) - (b.matches_missed || 0);
      } else if (sortInjuries.key === 'season') {
        comp = String(a.season || '').localeCompare(String(b.season || ''));
      }
      return sortInjuries.dir === 'asc' ? comp : -comp;
    });
  }, [topInjured, sortInjuries]);

  // Group trophies
  const groupedTrophies = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const t of trophies) {
      const comp = t.competition || 'Altro';
      if (!map[comp]) map[comp] = [];
      map[comp].push(t);
    }
    return map;
  }, [trophies]);

  return (
    <div className="space-y-8">
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border-hairline)] pb-5">
        <div>
          <div className="text-xs font-mono-tabular text-[#01A0E8] uppercase tracking-widest font-bold">
            {lang === 'it' ? 'ENCICLOPEDIA & RECORD DEL NAPOLI' : 'NAPOLI ENCYCLOPEDIA & RECORDS'}
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight mt-1">
            {lang === 'it'
              ? 'Almanacco, Record & Statistiche Storiche'
              : 'Almanac, Records & Historical Stats'}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1.5 font-mono-tabular">
            {lang === 'it'
              ? '98 Campionati · 41 Trofei · 82 Allenatori · Bilanci Ufficiali · Tassonomia Completa'
              : '98 Seasons · 41 Trophies · 82 Managers · Official Financials · Complete Taxonomy'}
          </p>
        </div>

        {/* STAT BADGES */}
        <div className="flex items-center gap-2 font-mono-tabular">
          <div className="px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] text-right">
            <div className="text-[10px] text-[var(--text-secondary)] uppercase">
              {lang === 'it' ? 'Stagioni Serie A' : 'Serie A Seasons'}
            </div>
            <div className="text-sm font-bold text-[#01A0E8]">80+</div>
          </div>
          <div className="px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] text-right">
            <div className="text-[10px] text-[var(--text-secondary)] uppercase">
              {lang === 'it' ? 'Trofei Maggiori' : 'Major Trophies'}
            </div>
            <div className="text-sm font-bold text-[#01A0E8]">12</div>
          </div>
        </div>
      </div>

      {/* HORIZONTAL TAB NAVIGATION */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[var(--border-hairline)] text-xs font-mono-tabular">
        {(
          [
            {
              id: 'piazzamenti',
              label: lang === 'it' ? 'Piazzamenti' : 'Placements',
              icon: Calendar,
            },
            {
              id: 'palmares',
              label: lang === 'it' ? 'Palmarès' : 'Honours',
              icon: Trophy,
            },
            {
              id: 'leggende',
              label: lang === 'it' ? 'Leggende' : 'Legends',
              icon: Users,
            },
            {
              id: 'mercato',
              label: lang === 'it' ? 'Calciomercato' : 'Transfers',
              icon: DollarSign,
            },
            {
              id: 'partite_record',
              label: lang === 'it' ? 'Partite Record' : 'Record Matches',
              icon: Flame,
            },
            {
              id: 'record_anagrafici',
              label: lang === 'it' ? 'Record Anagrafici' : 'Age Records',
              icon: Clock,
            },
            {
              id: 'almanacco_numeri',
              label: lang === 'it' ? 'Numeri di Maglia' : 'Shirt Numbers',
              icon: Hash,
            },
            {
              id: 'arbitri',
              label: lang === 'it' ? 'Dossier Arbitri' : 'Referees Dossier',
              icon: Shield,
            },
            {
              id: 'rigori_decisivi',
              label: lang === 'it' ? 'Rigori Decisivi' : 'Shootouts',
              icon: ShieldCheck,
            },
            {
              id: 'ranking_uefa',
              label: lang === 'it' ? 'Ranking UEFA' : 'UEFA Ranking',
              icon: Globe,
            },
            {
              id: 'presenze_stadio',
              label: lang === 'it' ? 'Presenze Stadio' : 'Attendance',
              icon: Users,
            },
            {
              id: 'allenatori',
              label: lang === 'it' ? 'Allenatori' : 'Managers',
              icon: Award,
            },
            {
              id: 'finanze',
              label: lang === 'it' ? 'Bilanci' : 'Financials',
              icon: TrendingUp,
            },
            {
              id: 'tattica',
              label: lang === 'it' ? 'Tattica' : 'Tactics',
              icon: Activity,
            },
            {
              id: 'head_to_head',
              label: lang === 'it' ? 'Testa a Testa' : 'Head-to-Head',
              icon: BarChart3,
            },
            {
              id: 'infortuni',
              label: lang === 'it' ? 'Infortuni' : 'Injuries',
              icon: Zap,
            },
          ] as const
        ).map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3.5 py-2 whitespace-nowrap flex items-center gap-2 border transition-colors cursor-pointer ${
                activeTab === t.id
                  ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold shadow-sm'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-hairline)] hover:border-[#01A0E8] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: PIAZZAMENTI STORICI (1926 - 2026)
         ========================================================================= */}
      {activeTab === 'piazzamenti' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-hairline)]">
              <div className="text-[10px] font-mono-tabular text-[var(--text-secondary)] uppercase">
                {lang === 'it' ? 'SCUDETTI TRICOLORE' : 'LEAGUE TITLES (SCUDETTI)'}
              </div>
              <div className="text-2xl font-display font-extrabold text-[#01A0E8] mt-1">3</div>
              <div className="text-[11px] text-[var(--text-secondary)] font-mono-tabular mt-0.5">
                1986-87 · 1989-90 · 2022-23
              </div>
            </div>
            <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-hairline)]">
              <div className="text-[10px] font-mono-tabular text-[var(--text-secondary)] uppercase">
                {lang === 'it' ? 'SECONDI POSTI' : 'RUNNERS-UP'}
              </div>
              <div className="text-2xl font-display font-extrabold text-[var(--text-primary)] mt-1">
                8
              </div>
              <div className="text-[11px] text-[var(--text-secondary)] font-mono-tabular mt-0.5">
                1968, 1975, 1988, 1989, 2013, 2016, 2018, 2019
              </div>
            </div>
            <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-hairline)]">
              <div className="text-[10px] font-mono-tabular text-[var(--text-secondary)] uppercase">
                {lang === 'it' ? 'CAMPIONATI DISPUTATI' : 'SEASONS PLAYED'}
              </div>
              <div className="text-2xl font-display font-extrabold text-[var(--text-primary)] mt-1">
                {placements.length}
              </div>
              <div className="text-[11px] text-[var(--text-secondary)] font-mono-tabular mt-0.5">
                {lang === 'it' ? 'Dal 1926/27 al 2025/26' : 'From 1926/27 to 2025/26'}
              </div>
            </div>
            <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-hairline)]">
              <div className="text-[10px] font-mono-tabular text-[var(--text-secondary)] uppercase">
                {lang === 'it' ? 'RECORD PUNTI SERIE A' : 'POINTS RECORD SERIE A'}
              </div>
              <div className="text-2xl font-display font-extrabold text-[#01A0E8] mt-1">91</div>
              <div className="text-[11px] text-[var(--text-secondary)] font-mono-tabular mt-0.5">
                {lang === 'it' ? 'Stagione 2017-18 (Sarri)' : 'Season 2017-18 (Sarri)'}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-4 text-xs font-mono-tabular">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[var(--text-secondary)]">
                {lang === 'it' ? 'CAMPIONATO:' : 'LEAGUE:'}
              </span>
              {['ALL', 'Serie A', 'Serie B', 'Serie C1 - B'].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setTierFilter(tier)}
                  className={`px-2.5 py-1 border cursor-pointer ${
                    tierFilter === tier
                      ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                      : 'border-[var(--border-hairline)] text-[var(--text-secondary)]'
                  }`}
                >
                  {tier === 'ALL' ? (lang === 'it' ? 'Tutti i Livelli' : 'All Tiers') : tier}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchPlacement}
                onChange={(e) => setSearchPlacement(e.target.value)}
                placeholder={
                  lang === 'it' ? 'Cerca stagione, allenatore...' : 'Search season, manager...'
                }
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--bg-primary)] border border-[var(--border-hairline)] focus:border-[#01A0E8] outline-none"
              />
            </div>
          </div>

          {/* Placements Table with Clickable Sort Columns */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-hairline)] overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono-tabular">
              <thead>
                <tr className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)] bg-[var(--bg-primary)]/40">
                  <SortHeader
                    label={lang === 'it' ? 'Stagione' : 'Season'}
                    columnKey="season"
                    activeKey={sortPlacements.key}
                    direction={sortPlacements.dir}
                    onSort={(k) => toggleSort(setSortPlacements, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? 'Lega & Livello' : 'League & Tier'}
                    columnKey="league"
                    activeKey={sortPlacements.key}
                    direction={sortPlacements.dir}
                    onSort={(k) => toggleSort(setSortPlacements, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? 'Posizione' : 'Position'}
                    columnKey="rank"
                    activeKey={sortPlacements.key}
                    direction={sortPlacements.dir}
                    onSort={(k) => toggleSort(setSortPlacements, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? 'Gare' : 'Matches'}
                    columnKey="matches"
                    activeKey={sortPlacements.key}
                    direction={sortPlacements.dir}
                    align="center"
                    onSort={(k) => toggleSort(setSortPlacements, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? 'V · P · S' : 'W · D · L'}
                    columnKey="wins"
                    activeKey={sortPlacements.key}
                    direction={sortPlacements.dir}
                    align="center"
                    onSort={(k) => toggleSort(setSortPlacements, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? 'Gol F-S (Diff)' : 'Goals For-Ag (Diff)'}
                    columnKey="goals"
                    activeKey={sortPlacements.key}
                    direction={sortPlacements.dir}
                    align="center"
                    onSort={(k) => toggleSort(setSortPlacements, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? 'Punti' : 'Points'}
                    columnKey="points"
                    activeKey={sortPlacements.key}
                    direction={sortPlacements.dir}
                    align="center"
                    onSort={(k) => toggleSort(setSortPlacements, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? 'Allenatore / Guida Tecnica' : 'Manager / Head Coach'}
                    columnKey="manager"
                    activeKey={sortPlacements.key}
                    direction={sortPlacements.dir}
                    onSort={(k) => toggleSort(setSortPlacements, k)}
                  />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-hairline)]">
                {filteredPlacements.map((p: any, idx: number) => {
                  const isScudetto = p.rank === '1' && p.league === 'Serie A';
                  const isPodium = (p.rank === '2' || p.rank === '3') && p.league === 'Serie A';
                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-[var(--bg-primary)]/70 ${
                        isScudetto ? 'bg-[#01A0E8]/10 font-semibold' : isPodium ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="py-3 px-3 whitespace-nowrap font-bold">
                        {p.season}
                        {isScudetto && <span className="ml-2 text-xs">🇮🇹 🏆</span>}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 border border-[var(--border-hairline)] text-[10px]">
                          {p.league}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`font-bold text-sm ${
                            isScudetto ? 'text-[#01A0E8]' : isPodium ? 'text-amber-400' : ''
                          }`}
                        >
                          {p.rank}° {lang === 'it' ? 'Posto' : 'Place'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">{p.matches}</td>
                      <td className="py-3 px-3 text-center text-[var(--text-secondary)]">
                        {p.wins} · {p.draws} · {p.losses}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {p.goals_for}:{p.goals_against}{' '}
                        <span className={p.goal_diff > 0 ? 'text-[#01A0E8]' : 'text-red-400'}>
                          ({p.goal_diff > 0 ? `+${p.goal_diff}` : p.goal_diff})
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-sm text-[#01A0E8]">
                        {p.points}
                      </td>
                      <td className="py-3 px-3 text-[var(--text-secondary)] whitespace-nowrap">
                        {p.manager || (lang === 'it' ? 'n.d.' : 'N/A')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: PALMARÈS & TROFEI UFFICIALI (41 Titoli)
         ========================================================================= */}
      {activeTab === 'palmares' && (
        <div className="space-y-6">
          {/* Sub-view Switcher */}
          <div className="flex items-center gap-2 border-b border-[var(--border-hairline)] pb-3 font-mono-tabular text-xs">
            <button
              onClick={() => setPalmaresSubView('trophies')}
              className={`px-3 py-1.5 border cursor-pointer transition-colors ${
                palmaresSubView === 'trophies'
                  ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold shadow-sm'
                  : 'bg-[var(--bg-secondary)] border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {lang === 'it' ? 'Trofei Ufficiali di Squadra (41 Titoli)' : 'Official Club Trophies (41 Titles)'}
            </button>
            <button
              onClick={() => setPalmaresSubView('individual_honours')}
              className={`px-3 py-1.5 border cursor-pointer transition-colors ${
                palmaresSubView === 'individual_honours'
                  ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold shadow-sm'
                  : 'bg-[var(--bg-secondary)] border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {lang === 'it' ? 'Premi Individuali & Capocannonieri' : 'Individual Honours & Top Scorers'}
            </button>
          </div>

          {palmaresSubView === 'individual_honours' ? (
            <IndividualHonoursView lang={lang} />
          ) : (
            <>
              <div className="p-6 bg-[var(--bg-secondary)] border border-[var(--border-hairline)]">
                <h3 className="text-sm font-mono-tabular text-[#01A0E8] font-bold uppercase tracking-wider mb-2">
                  {lang === 'it'
                    ? 'BACHECA TROFEI UFFICIALI (ALMANACCO COMPLETO)'
                    : 'OFFICIAL TROPHY CABINET (COMPLETE ALMANAC)'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {lang === 'it'
                    ? 'Il palmarès della Società Sportiva Calcio Napoli include trofei nazionali di massimo livello, trionfi continentali UEFA, tornei italo-britannici ed europei minori riconosciuti negli almanacchi storici.'
                    : 'The honours of Società Sportiva Calcio Napoli include top-tier national trophies, UEFA continental silverware, and historic Anglo-Italian tournaments recognized in official annals.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(groupedTrophies).map(([competition, list]: [string, any[]]) => (
                  <div
                    key={competition}
                    className="bg-[var(--bg-secondary)] border border-[var(--border-hairline)] p-5 space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
                        <div className="font-display font-extrabold text-lg text-[var(--text-primary)]">
                          {competition}
                        </div>
                        <span className="px-2 py-0.5 bg-[#01A0E8] text-[#08090B] font-mono-tabular font-bold text-xs">
                          {list.length} {list.length === 1 ? (lang === 'it' ? 'Titolo' : 'Title') : (lang === 'it' ? 'Titoli' : 'Titles')}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2.5">
                        {list.map((tr: any) => (
                          <div
                            key={tr.id}
                            className="p-3 bg-[var(--bg-primary)] border border-[var(--border-hairline)] flex items-center justify-between text-xs font-mono-tabular"
                          >
                            <div className="flex items-center gap-2.5">
                              <Trophy className="w-3.5 h-3.5 text-[#01A0E8]" />
                              <span className="font-semibold">{tr.title}</span>
                            </div>
                            <span className="text-[#01A0E8] font-bold">{tr.season}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-[10px] text-[var(--text-secondary)] font-mono-tabular pt-2 border-t border-[var(--border-hairline)]">
                      {lang === 'it'
                        ? 'Fonte: Archivio Ufficiale Lega Serie A / UEFA / FIGC'
                        : 'Source: Official Archive Lega Serie A / UEFA / FIGC'}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: LEGGENDE & RECORD ALL-TIME
         ========================================================================= */}
      {activeTab === 'leggende' && (
        <div className="space-y-6">
          {/* Sub-view Switcher */}
          <div className="flex items-center gap-2 border-b border-[var(--border-hairline)] pb-3 font-mono-tabular text-xs">
            <button
              onClick={() => setLegendsSubView('club_records')}
              className={`px-3 py-1.5 border cursor-pointer transition-colors ${
                legendsSubView === 'club_records'
                  ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold shadow-sm'
                  : 'bg-[var(--bg-secondary)] border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {lang === 'it' ? 'Record Presenze & Reti Club' : 'Club Appearances & Goal Records'}
            </button>
            <button
              onClick={() => setLegendsSubView('national_teams')}
              className={`px-3 py-1.5 border cursor-pointer transition-colors ${
                legendsSubView === 'national_teams'
                  ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold shadow-sm'
                  : 'bg-[var(--bg-secondary)] border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {lang === 'it' ? 'Azzurri in Nazionale & Campioni del Mondo' : 'International Caps & World Champions'}
            </button>
          </div>

          {legendsSubView === 'national_teams' ? (
            <NationalTeamCapsView lang={lang} />
          ) : (
            <>
              {/* Sub-navigation */}
              <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-4 text-xs font-mono-tabular">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[var(--text-secondary)]">
                    {lang === 'it' ? 'RECORD ALL-TIME:' : 'ALL-TIME RECORDS:'}
                  </span>
                  {(
                    [
                      { id: 'appearances', it: 'Presenze', en: 'Appearances' },
                      { id: 'goals', it: 'Marcatori', en: 'Top Scorers' },
                      { id: 'assists', it: 'Assist-Man', en: 'Assists' },
                      { id: 'yellow_cards', it: 'Cartellini', en: 'Cards' },
                      { id: 'minutes', it: 'Minuti Giocati', en: 'Minutes Played' },
                    ] as const
                  ).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setRecordPlayerCat(c.id)}
                      className={`px-3 py-1.5 border cursor-pointer ${
                        recordPlayerCat === c.id
                          ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                          : 'border-[var(--border-hairline)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {lang === 'it' ? c.it : c.en}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchPlayer}
                    onChange={(e) => setSearchPlayer(e.target.value)}
                    placeholder={lang === 'it' ? 'Cerca calciatore...' : 'Search player...'}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--bg-primary)] border border-[var(--border-hairline)] focus:border-[#01A0E8] outline-none"
                  />
                </div>
              </div>

              {/* Record Players Table with Clickable Sort Columns */}
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-hairline)] overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-mono-tabular">
                  <thead>
                    <tr className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)] bg-[var(--bg-primary)]/40">
                      <th className="py-3 px-3 text-center w-12">#</th>
                      <SortHeader
                        label={lang === 'it' ? 'Calciatore' : 'Player'}
                        columnKey="player_name"
                        activeKey={sortPlayers.key}
                        direction={sortPlayers.dir}
                        onSort={(k) => toggleSort(setSortPlayers, k)}
                      />
                      <SortHeader
                        label={lang === 'it' ? 'Ruolo' : 'Position'}
                        columnKey="position"
                        activeKey={sortPlayers.key}
                        direction={sortPlayers.dir}
                        onSort={(k) => toggleSort(setSortPlayers, k)}
                      />
                      <SortHeader
                        label={
                          recordPlayerCat === 'goals'
                            ? lang === 'it'
                              ? 'Reti Ufficiali'
                              : 'Official Goals'
                            : recordPlayerCat === 'appearances'
                            ? lang === 'it'
                              ? 'Gare Ufficiali'
                              : 'Official Matches'
                            : recordPlayerCat === 'assists'
                            ? lang === 'it'
                              ? 'Assist Vincenti'
                              : 'Assists'
                            : recordPlayerCat === 'minutes'
                            ? lang === 'it'
                              ? 'Minuti Totali'
                              : 'Total Minutes'
                            : lang === 'it'
                            ? 'Cartellini'
                            : 'Cards'
                        }
                        columnKey="value"
                        activeKey={sortPlayers.key}
                        direction={sortPlayers.dir}
                        align="center"
                        onSort={(k) => toggleSort(setSortPlayers, k)}
                      />
                      <SortHeader
                        label={lang === 'it' ? 'Militanza / Anni' : 'Tenure / Period'}
                        columnKey="tenure"
                        activeKey={sortPlayers.key}
                        direction={sortPlayers.dir}
                        onSort={(k) => toggleSort(setSortPlayers, k)}
                      />
                      <th className="py-3 px-3 text-right">
                        {lang === 'it' ? 'Nazionalità' : 'Nationality'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-hairline)]">
                    {filteredRecordPlayers.map((rp: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[var(--bg-primary)]/60">
                        <td className="py-3 px-3 text-center text-[var(--text-secondary)] font-bold">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap font-bold text-sm">
                          {rp.player_name}
                        </td>
                        <td className="py-3 px-3 text-[var(--text-secondary)]">
                          {rp.position || (lang === 'it' ? 'n.d.' : 'N/A')}
                        </td>
                        <td className="py-3 px-3 text-center font-display font-extrabold text-base text-[#01A0E8]">
                          {rp.stat_value}
                        </td>
                        <td className="py-3 px-3 text-[var(--text-secondary)] whitespace-nowrap">
                          {rp.tenure || (lang === 'it' ? 'n.d.' : 'N/A')}
                        </td>
                        <td className="py-3 px-3 text-right text-[var(--text-secondary)]">
                          {rp.nationality || 'ITA'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: CALCIOMERCATO & CLAUSOLE & TRASFERIMENTI STORICI
         ========================================================================= */}
      {activeTab === 'mercato' && (
        <TransfersClausesTab lang={lang} />
      )}

      {/* =========================================================================
          TAB: PARTITE RECORD
         ========================================================================= */}
      {activeTab === 'partite_record' && (
        <RecordMatchesTab lang={lang} onSelectMatch={onSelectMatch} />
      )}

      {/* =========================================================================
          TAB: RECORD ANAGRAFICI
         ========================================================================= */}
      {activeTab === 'record_anagrafici' && (
        <AgeRecordsTab lang={lang} />
      )}

      {/* =========================================================================
          TAB: ALMANACCO NUMERI DI MAGLIA
         ========================================================================= */}
      {activeTab === 'almanacco_numeri' && (
        <ShirtNumbersTab lang={lang} />
      )}

      {/* =========================================================================
          TAB: DOSSIER ARBITRI
         ========================================================================= */}
      {activeTab === 'arbitri' && (
        <RefereesDossierTab lang={lang} />
      )}

      {/* =========================================================================
          TAB: RIGORI DECISIVI & SHOOTOUTS
         ========================================================================= */}
      {activeTab === 'rigori_decisivi' && (
        <ShootoutsTab lang={lang} onSelectMatch={onSelectMatch} />
      )}

      {/* =========================================================================
          TAB: RANKING UEFA
         ========================================================================= */}
      {activeTab === 'ranking_uefa' && (
        <UefaRankingsTab lang={lang} />
      )}

      {/* =========================================================================
          TAB: PRESENZE STADIO & RECORD AFFLUENZA
         ========================================================================= */}
      {activeTab === 'presenze_stadio' && (
        <StadiumAttendanceTab lang={lang} onSelectMatch={onSelectMatch} />
      )}

      {/* =========================================================================
          TAB 5: ALLENATORI STORICI
         ========================================================================= */}
      {activeTab === 'allenatori' && (
        <div className="space-y-6">
          <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-4 text-xs font-mono-tabular">
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-secondary)]">
                {lang === 'it' ? 'FILTRO PARTITE MINIME:' : 'MINIMUM MATCHES FILTER:'}
              </span>
              {[0, 20, 50, 100].map((m) => (
                <button
                  key={m}
                  onClick={() => setManagerMinMatches(m)}
                  className={`px-2.5 py-1 border cursor-pointer ${
                    managerMinMatches === m
                      ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                      : 'border-[var(--border-hairline)] text-[var(--text-secondary)]'
                  }`}
                >
                  &gt;= {m} {lang === 'it' ? 'Gare' : 'Matches'}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchManager}
                onChange={(e) => setSearchManager(e.target.value)}
                placeholder={lang === 'it' ? 'Cerca allenatore...' : 'Search manager...'}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--bg-primary)] border border-[var(--border-hairline)] focus:border-[#01A0E8] outline-none"
              />
            </div>
          </div>

          {/* Managers Table with Clickable Sort Columns */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-hairline)] overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono-tabular">
              <thead>
                <tr className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)] bg-[var(--bg-primary)]/40">
                  <SortHeader
                    label={lang === 'it' ? 'Allenatore' : 'Manager'}
                    columnKey="name"
                    activeKey={sortManagers.key}
                    direction={sortManagers.dir}
                    onSort={(k) => toggleSort(setSortManagers, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? 'Nazionalità' : 'Nationality'}
                    columnKey="nationality"
                    activeKey={sortManagers.key}
                    direction={sortManagers.dir}
                    onSort={(k) => toggleSort(setSortManagers, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? 'Periodo' : 'Tenure'}
                    columnKey="tenure"
                    activeKey={sortManagers.key}
                    direction={sortManagers.dir}
                    onSort={(k) => toggleSort(setSortManagers, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? 'Panchine' : 'Matches'}
                    columnKey="matches"
                    activeKey={sortManagers.key}
                    direction={sortManagers.dir}
                    align="center"
                    onSort={(k) => toggleSort(setSortManagers, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? 'Vittorie' : 'Wins'}
                    columnKey="wins"
                    activeKey={sortManagers.key}
                    direction={sortManagers.dir}
                    align="center"
                    onSort={(k) => toggleSort(setSortManagers, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? '% Vittorie' : 'Win %'}
                    columnKey="win_pct"
                    activeKey={sortManagers.key}
                    direction={sortManagers.dir}
                    align="center"
                    onSort={(k) => toggleSort(setSortManagers, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? 'Punti/Gara' : 'Points/Match'}
                    columnKey="pts_per_match"
                    activeKey={sortManagers.key}
                    direction={sortManagers.dir}
                    align="right"
                    onSort={(k) => toggleSort(setSortManagers, k)}
                  />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-hairline)]">
                {filteredManagers.map((m: any, idx: number) => (
                  <tr key={idx} className="hover:bg-[var(--bg-primary)]/60">
                    <td className="py-3 px-3 font-bold text-sm whitespace-nowrap">{m.name}</td>
                    <td className="py-3 px-3 text-[var(--text-secondary)]">{m.nationality}</td>
                    <td className="py-3 px-3 text-[var(--text-secondary)] whitespace-nowrap">
                      {m.tenure}
                    </td>
                    <td className="py-3 px-3 text-center font-bold">{m.matches}</td>
                    <td className="py-3 px-3 text-center text-emerald-400 font-bold">{m.wins}</td>
                    <td className="py-3 px-3 text-center font-bold text-[#01A0E8]">
                      {m.win_pct ? `${m.win_pct}%` : (lang === 'it' ? 'n.d.' : 'N/A')}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#01A0E8]">
                      {m.pts_per_match?.toFixed(2) || (lang === 'it' ? 'n.d.' : 'N/A')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: BILANCI & FINANZE (2004 - 2024)
         ========================================================================= */}
      {activeTab === 'finanze' && (
        <div className="space-y-6">
          <div className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] text-xs text-[var(--text-secondary)] leading-relaxed">
            {lang === 'it'
              ? 'Dati economico-finanziari ufficiali estratti dai bilanci della SSC Napoli S.p.A. depositati presso la Camera di Commercio dal 2004 al 2024 (Gestione Aurelio De Laurentiis).'
              : 'Official financial statements extracted from SSC Napoli S.p.A. annual filings deposited at the Chamber of Commerce from 2004 to 2024 (Aurelio De Laurentiis administration).'}
          </div>

          {/* Financials Table with Clickable Sort Columns */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-hairline)] overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono-tabular">
              <thead>
                <tr className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)] bg-[var(--bg-primary)]/40">
                  <SortHeader
                    label={lang === 'it' ? 'Esercizio' : 'Fiscal Year'}
                    columnKey="season"
                    activeKey={sortFinancials.key}
                    direction={sortFinancials.dir}
                    onSort={(k) => toggleSort(setSortFinancials, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? 'Fatturato Totale' : 'Total Revenue'}
                    columnKey="revenue"
                    activeKey={sortFinancials.key}
                    direction={sortFinancials.dir}
                    align="right"
                    onSort={(k) => toggleSort(setSortFinancials, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? 'Costo Personale' : 'Staff Wages'}
                    columnKey="wages"
                    activeKey={sortFinancials.key}
                    direction={sortFinancials.dir}
                    align="right"
                    onSort={(k) => toggleSort(setSortFinancials, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? 'Ammortamenti' : 'Amortization'}
                    columnKey="amortization"
                    activeKey={sortFinancials.key}
                    direction={sortFinancials.dir}
                    align="right"
                    onSort={(k) => toggleSort(setSortFinancials, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? 'Risultato Netto' : 'Net Profit/Loss'}
                    columnKey="net_profit"
                    activeKey={sortFinancials.key}
                    direction={sortFinancials.dir}
                    align="right"
                    onSort={(k) => toggleSort(setSortFinancials, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? 'Posizione Finanziaria' : 'Net Debt'}
                    columnKey="net_debt"
                    activeKey={sortFinancials.key}
                    direction={sortFinancials.dir}
                    align="right"
                    onSort={(k) => toggleSort(setSortFinancials, k)}
                  />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-hairline)]">
                {sortedFinancials.map((f: any, idx: number) => {
                  const isProfitable = (f.net_profit || 0) >= 0;
                  return (
                    <tr key={idx} className="hover:bg-[var(--bg-primary)]/60">
                      <td className="py-3 px-3 font-bold whitespace-nowrap">{f.season}</td>
                      <td className="py-3 px-3 text-right font-bold text-[var(--text-primary)]">
                        €{((f.revenue_total || 0) / 1000000).toFixed(1)}M
                      </td>
                      <td className="py-3 px-3 text-right text-[var(--text-secondary)]">
                        €{((f.staff_cost || 0) / 1000000).toFixed(1)}M
                      </td>
                      <td className="py-3 px-3 text-right text-[var(--text-secondary)]">
                        €{((f.amortization || 0) / 1000000).toFixed(1)}M
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-bold ${
                          isProfitable ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isProfitable ? '+' : ''}€{((f.net_profit || 0) / 1000000).toFixed(1)}M
                      </td>
                      <td className="py-3 px-3 text-right text-[#01A0E8]">
                        €{((f.net_debt || 0) / 1000000).toFixed(1)}M
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: TATTICA & STATISTICHE AVANZATE (xG)
         ========================================================================= */}
      {activeTab === 'tattica' && (
        <div className="space-y-6">
          <div className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] text-xs text-[var(--text-secondary)] leading-relaxed">
            {lang === 'it'
              ? 'Metriche avanzate di rendimento tattico stagionale, possesso palla medio ed Expected Goals (xG vs xGA).'
              : 'Advanced season tactical performance metrics, average possession percentage, and Expected Goals (xG vs xGA).'}
          </div>

          <div className="bg-[var(--bg-secondary)] border border-[var(--border-hairline)] overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono-tabular">
              <thead>
                <tr className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)] bg-[var(--bg-primary)]/40">
                  <SortHeader
                    label={lang === 'it' ? 'Stagione' : 'Season'}
                    columnKey="season"
                    activeKey={sortTactics.key}
                    direction={sortTactics.dir}
                    onSort={(k) => toggleSort(setSortTactics, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? 'Modulo Prevalente' : 'Primary Formation'}
                    columnKey="formation"
                    activeKey={sortTactics.key}
                    direction={sortTactics.dir}
                    onSort={(k) => toggleSort(setSortTactics, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? 'Possesso Medio %' : 'Avg Possession %'}
                    columnKey="possession"
                    activeKey={sortTactics.key}
                    direction={sortTactics.dir}
                    align="center"
                    onSort={(k) => toggleSort(setSortTactics, k)}
                  />
                  <SortHeader
                    label="xG Generati"
                    columnKey="xg"
                    activeKey={sortTactics.key}
                    direction={sortTactics.dir}
                    align="center"
                    onSort={(k) => toggleSort(setSortTactics, k)}
                  />
                  <SortHeader
                    label="xGA Concessi"
                    columnKey="xga"
                    activeKey={sortTactics.key}
                    direction={sortTactics.dir}
                    align="center"
                    onSort={(k) => toggleSort(setSortTactics, k)}
                  />
                  <th className="py-3 px-3 text-right">
                    {lang === 'it' ? 'Delta xG' : 'xG Delta'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-hairline)]">
                {sortedTactics.map((t: any, idx: number) => {
                  const delta = (t.xg_total || 0) - (t.xga_total || 0);
                  return (
                    <tr key={idx} className="hover:bg-[var(--bg-primary)]/60">
                      <td className="py-3 px-3 font-bold whitespace-nowrap">{t.season}</td>
                      <td className="py-3 px-3 text-[#01A0E8] font-bold">
                        {t.primary_formation || '4-3-3'}
                      </td>
                      <td className="py-3 px-3 text-center">{t.possession_avg}%</td>
                      <td className="py-3 px-3 text-center font-bold">{t.xg_total?.toFixed(1)}</td>
                      <td className="py-3 px-3 text-center text-[var(--text-secondary)]">
                        {t.xga_total?.toFixed(1)}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-bold ${
                          delta > 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 8: TESTA A TESTA (205 CLUB AFFRONTATI)
         ========================================================================= */}
      {activeTab === 'head_to_head' && (
        <div className="space-y-6">
          <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-4 text-xs font-mono-tabular">
            <span className="text-[var(--text-secondary)]">
              {lang === 'it'
                ? `BILANCIO CONFRONTI DIRETTI (${filteredH2H.length} SQUADRE):`
                : `HEAD-TO-HEAD RECORDS (${filteredH2H.length} TEAMS):`}
            </span>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchOpponent}
                onChange={(e) => setSearchOpponent(e.target.value)}
                placeholder={lang === 'it' ? 'Cerca squadra avversaria...' : 'Search opponent team...'}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--bg-primary)] border border-[var(--border-hairline)] focus:border-[#01A0E8] outline-none"
              />
            </div>
          </div>

          <div className="bg-[var(--bg-secondary)] border border-[var(--border-hairline)] overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono-tabular">
              <thead>
                <tr className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)] bg-[var(--bg-primary)]/40">
                  <SortHeader
                    label={lang === 'it' ? 'Club Avversario' : 'Opponent Club'}
                    columnKey="opponent_name"
                    activeKey={sortH2H.key}
                    direction={sortH2H.dir}
                    onSort={(k) => toggleSort(setSortH2H, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? 'Partite Totali' : 'Total Matches'}
                    columnKey="matches"
                    activeKey={sortH2H.key}
                    direction={sortH2H.dir}
                    align="center"
                    onSort={(k) => toggleSort(setSortH2H, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? 'Vittorie' : 'Wins'}
                    columnKey="wins"
                    activeKey={sortH2H.key}
                    direction={sortH2H.dir}
                    align="center"
                    onSort={(k) => toggleSort(setSortH2H, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? 'Pareggi' : 'Draws'}
                    columnKey="draws"
                    activeKey={sortH2H.key}
                    direction={sortH2H.dir}
                    align="center"
                    onSort={(k) => toggleSort(setSortH2H, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? 'Sconfitte' : 'Losses'}
                    columnKey="losses"
                    activeKey={sortH2H.key}
                    direction={sortH2H.dir}
                    align="center"
                    onSort={(k) => toggleSort(setSortH2H, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? 'Gol Fatti' : 'Goals Scored'}
                    columnKey="goals_for"
                    activeKey={sortH2H.key}
                    direction={sortH2H.dir}
                    align="center"
                    onSort={(k) => toggleSort(setSortH2H, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? 'Gol Subiti' : 'Goals Conceded'}
                    columnKey="goals_against"
                    activeKey={sortH2H.key}
                    direction={sortH2H.dir}
                    align="center"
                    onSort={(k) => toggleSort(setSortH2H, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? '% Vittoria' : 'Win Rate %'}
                    columnKey="win_pct"
                    activeKey={sortH2H.key}
                    direction={sortH2H.dir}
                    align="right"
                    onSort={(k) => toggleSort(setSortH2H, k)}
                  />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-hairline)]">
                {filteredH2H.map((h: any, idx: number) => {
                  const winRate = h.matches ? ((h.wins / h.matches) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={idx} className="hover:bg-[var(--bg-primary)]/60">
                      <td className="py-3 px-3 font-bold text-sm whitespace-nowrap">
                        {h.opponent_name}
                      </td>
                      <td className="py-3 px-3 text-center font-bold">{h.matches}</td>
                      <td className="py-3 px-3 text-center text-emerald-400 font-bold">{h.wins}</td>
                      <td className="py-3 px-3 text-center text-amber-300 font-bold">{h.draws}</td>
                      <td className="py-3 px-3 text-center text-rose-400 font-bold">{h.losses}</td>
                      <td className="py-3 px-3 text-center text-[#01A0E8]">{h.goals_for}</td>
                      <td className="py-3 px-3 text-center text-[var(--text-secondary)]">
                        {h.goals_against}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-[#01A0E8]">
                        {winRate}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 9: CLINICA INFORTUNI
         ========================================================================= */}
      {activeTab === 'infortuni' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {injuriesByCategory.slice(0, 4).map((c: any, i: number) => (
              <div
                key={i}
                className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] text-xs font-mono-tabular"
              >
                <div className="text-[10px] text-[var(--text-secondary)] uppercase">
                  {c.category}
                </div>
                <div className="text-xl font-bold text-[#01A0E8] mt-1">{c.cases_count} casi</div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  Media {c.avg_days_out} {lang === 'it' ? 'giorni di stop' : 'days out'}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[var(--bg-secondary)] border border-[var(--border-hairline)] overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono-tabular">
              <thead>
                <tr className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)] bg-[var(--bg-primary)]/40">
                  <SortHeader
                    label={lang === 'it' ? 'Calciatore' : 'Player'}
                    columnKey="player_name"
                    activeKey={sortInjuries.key}
                    direction={sortInjuries.dir}
                    onSort={(k) => toggleSort(setSortInjuries, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? 'Diagnosi Clinica' : 'Clinical Diagnosis'}
                    columnKey="injury_type"
                    activeKey={sortInjuries.key}
                    direction={sortInjuries.dir}
                    onSort={(k) => toggleSort(setSortInjuries, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? 'Stagione' : 'Season'}
                    columnKey="season"
                    activeKey={sortInjuries.key}
                    direction={sortInjuries.dir}
                    align="center"
                    onSort={(k) => toggleSort(setSortInjuries, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? 'Giorni Assenza' : 'Days Out'}
                    columnKey="days"
                    activeKey={sortInjuries.key}
                    direction={sortInjuries.dir}
                    align="center"
                    onSort={(k) => toggleSort(setSortInjuries, k)}
                  />
                  <SortHeader
                    label={lang === 'it' ? 'Partite Saltate' : 'Matches Missed'}
                    columnKey="matches"
                    activeKey={sortInjuries.key}
                    direction={sortInjuries.dir}
                    align="right"
                    onSort={(k) => toggleSort(setSortInjuries, k)}
                  />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-hairline)]">
                {sortedInjuries.map((inj: any, idx: number) => (
                  <tr key={idx} className="hover:bg-[var(--bg-primary)]/60">
                    <td className="py-3 px-3 font-bold whitespace-nowrap">{inj.player_name}</td>
                    <td className="py-3 px-3 text-[var(--text-secondary)]">{inj.injury_type}</td>
                    <td className="py-3 px-3 text-center">{inj.season}</td>
                    <td className="py-3 px-3 text-center font-bold text-amber-400">
                      {inj.days_out} {lang === 'it' ? 'gg' : 'days'}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#01A0E8]">
                      {inj.matches_missed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
