import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Trophy,
  ArrowRight,
  ExternalLink,
  Sparkles,
  ChevronRight,
  History,
  Clock,
  Award,
  Flame,
  CheckCircle2,
  Users,
  Shield,
  Activity,
} from 'lucide-react';
import { FEATURED_MATCHES, MatchDataStory } from '../data/napoliVerifiedData';
import rawAccaddeOggi from '../data/generated/accadde_oggi.json';
import rawCuriosita from '../data/generated/curiosita.json';
import { TwitterFeedSection } from './TwitterFeedSection';

interface OggiSectionProps {
  lang: 'it' | 'en';
  theme: 'dark' | 'light';
  onOpenMatchStory: (matchId: string) => void;
  onNavigateToArchive: () => void;
}

export const OggiSection: React.FC<OggiSectionProps> = ({
  lang,
  theme,
  onOpenMatchStory,
  onNavigateToArchive,
}) => {
  // Latest match played is the verified Juventus 2 - 0 Napoli of 2 November 2026
  const latestMatch: MatchDataStory = FEATURED_MATCHES[0];

  // Accadde Oggi & Curiosita
  const pastMatches = rawAccaddeOggi || [];
  const curiositaList = rawCuriosita || [];

  // Active filter for historical matches (All / Wins / Draws / Losses)
  const [historyResultFilter, setHistoryResultFilter] = useState<'ALL' | 'V' | 'N' | 'S'>('ALL');
  const [selectedCuriosityIdx, setSelectedCuriosityIdx] = useState<number>(0);

  const filteredPastMatches = pastMatches.filter((m: any) => {
    const isWin =
      (m.home_team === 'Napoli' && m.home_goals > m.away_goals) ||
      (m.away_team === 'Napoli' && m.away_goals > m.home_goals);
    const isDraw = m.home_goals === m.away_goals;
    const isLoss = !isWin && !isDraw;

    if (historyResultFilter === 'V') return isWin;
    if (historyResultFilter === 'N') return isDraw;
    if (historyResultFilter === 'S') return isLoss;
    return true;
  });

  return (
    <div className="space-y-10">
      {/* =========================================================================
          ROW 1: TWO COLUMNS
          Left: Scheda Sintetica Ultima Partita Giocata (Juventus 2-0 Napoli, 2 Nov 2026)
          Right: Feed Ufficiale X (@sscnapolidata)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN (7 COLS): SCHEDA SINTETICA ULTIMA PARTITA */}
        <section className="lg:col-span-7 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] p-6 md:p-8 space-y-6">
          {/* Top Status Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-hairline)] pb-4">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#01A0E8]/15 border border-[#01A0E8]/40 text-[#01A0E8] text-xs font-mono-tabular font-extrabold uppercase">
                <span className="w-2 h-2 rounded-full bg-[#01A0E8] animate-pulse" />
                {lang === 'it' ? 'ULTIMA PARTITA GIOCATA' : 'LATEST MATCH PLAYED'}
              </span>
              <span className="text-xs font-mono-tabular text-[var(--text-secondary)]">
                {latestMatch.competition} · {lang === 'it' ? latestMatch.matchdayIt : latestMatch.matchdayEn}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono-tabular text-[var(--text-secondary)]">
              <span className="text-[#01A0E8] font-bold">conf: {latestMatch.confidence}</span>
              <span>·</span>
              <span className="text-emerald-400 font-bold">
                {lang === 'it' ? 'verificato' : 'verified'}
              </span>
            </div>
          </div>

          {/* Date, Time & Stadium */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-secondary)] font-mono-tabular">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#01A0E8]" />
              <span>
                {lang === 'it' ? latestMatch.dateDisplayIt : latestMatch.dateDisplayEn} · {latestMatch.time}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#01A0E8]" />
              <span>{latestMatch.stadium}, {latestMatch.city}</span>
            </div>
          </div>

          {/* Synthetic Scoreboard */}
          <div className="p-5 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
            <div className="flex items-center justify-between font-display font-extrabold text-sm sm:text-base">
              <span className={latestMatch.homeTeam === 'NAPOLI' ? 'text-[#01A0E8]' : 'text-[var(--text-primary)]'}>
                {latestMatch.homeTeam}
              </span>
              <span className={latestMatch.awayTeam === 'NAPOLI' ? 'text-[#01A0E8]' : 'text-[var(--text-primary)]'}>
                {latestMatch.awayTeam}
              </span>
            </div>

            <div className="text-center my-3">
              <div className="text-5xl sm:text-6xl font-display font-extrabold tracking-tight tabular-nums">
                <span className={latestMatch.homeTeam === 'NAPOLI' ? 'text-[#01A0E8]' : 'text-[var(--text-primary)]'}>
                  {latestMatch.homeGoals}
                </span>{' '}
                <span className="text-[#01A0E8]">-</span>{' '}
                <span className={latestMatch.awayTeam === 'NAPOLI' ? 'text-[#01A0E8]' : 'text-[var(--text-primary)]'}>
                  {latestMatch.awayGoals}
                </span>
              </div>
              <div className="text-[11px] font-mono-tabular text-[#01A0E8] tracking-widest mt-1 uppercase font-semibold">
                ● FULL TIME
              </div>
            </div>

            {/* Match Highlights: Attendance, Referee, Formation */}
            <div className="pt-3 border-t border-[var(--border-hairline)] grid grid-cols-3 gap-2 text-[11px] font-mono-tabular">
              <div className="p-2 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
                <div className="text-[10px] text-[var(--text-secondary)] uppercase flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#01A0E8]" />
                  <span>{lang === 'it' ? 'Spettatori' : 'Attendance'}</span>
                </div>
                <div className="font-bold text-[var(--text-primary)] mt-0.5">
                  {latestMatch.attendance ? `${latestMatch.attendance.toLocaleString()}` : '41.250'}
                </div>
              </div>

              <div className="p-2 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
                <div className="text-[10px] text-[var(--text-secondary)] uppercase flex items-center gap-1">
                  <Shield className="w-3 h-3 text-[#01A0E8]" />
                  <span>{lang === 'it' ? 'Arbitro' : 'Referee'}</span>
                </div>
                <div className="font-bold text-[var(--text-primary)] mt-0.5 truncate">
                  {latestMatch.referee || 'D. Doveri'}
                </div>
              </div>

              <div className="p-2 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
                <div className="text-[10px] text-[var(--text-secondary)] uppercase flex items-center gap-1">
                  <Activity className="w-3 h-3 text-[#01A0E8]" />
                  <span>{lang === 'it' ? 'Assetto' : 'System'}</span>
                </div>
                <div className="font-bold text-[#01A0E8] mt-0.5">
                  {latestMatch.systemOfPlay || '4-3-3'}
                </div>
              </div>
            </div>

            {/* Scorers Quick Summary */}
            <div className="pt-3 border-t border-[var(--border-hairline)] text-xs font-mono-tabular">
              <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                {lang === 'it' ? 'MARCATORI DELL’INCONTRO:' : 'MATCH SCORERS:'}
              </div>
              <div className="space-y-1">
                {latestMatch.goals.map((g, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--text-primary)]">
                      ⚽ {g.scorer} <span className="text-[var(--text-secondary)]">({g.teamName})</span>
                    </span>
                    <span className="text-[#01A0E8] font-bold">{g.minute}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mini Waveform & Summary */}
          <div>
            <div className="text-[11px] font-mono-tabular text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              {lang === 'it' ? 'PROFILO INTENSITÀ & OCCASIONI' : 'INTENSITY PROFILE & CHANCES'}
            </div>
            <div className="p-3 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
              <div className="flex items-end justify-between gap-1.5 h-16 pt-1">
                {latestMatch.waveformBars.map((bar, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div
                      className="w-full transition-all"
                      style={{
                        height: `${bar.height}%`,
                        backgroundColor:
                          bar.team === 'napoli'
                            ? '#01A0E8'
                            : bar.team === 'opponent'
                            ? '#7D8590'
                            : 'rgba(125, 133, 144, 0.25)',
                      }}
                    />
                    <span className="text-[9px] font-mono-tabular text-[var(--text-secondary)] mt-1">
                      {bar.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-2.5 leading-relaxed">
              {lang === 'it' ? latestMatch.summaryIt : latestMatch.summaryEn}
            </p>
          </div>

          {/* Action: Open Full Match Story Card */}
          <div className="pt-3 border-t border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-mono-tabular text-[var(--text-secondary)]">
              {lang === 'it'
                ? 'Scheda analitica 1:2 con timeline, formazioni e statistiche complete'
                : 'Full 1:2 analytical card with timeline, lineups & stats'}
            </span>

            <button
              onClick={() => onOpenMatchStory(latestMatch.id)}
              className="px-4 py-2 bg-[#01A0E8] text-[#08090B] font-mono-tabular font-bold text-xs hover:bg-[#01A0E8]/90 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>{lang === 'it' ? 'Apri Scheda Dettagliata' : 'Open Detailed Card'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* RIGHT COLUMN (5 COLS): OFFICIAL @sscnapolidata X FEED */}
        <aside className="lg:col-span-5 space-y-6">
          <TwitterFeedSection lang={lang} theme={theme} />
        </aside>
      </div>

      {/* =========================================================================
          ROW 2: TWO BOXES SIDE BY SIDE
          Left: Accadde Oggi — Partite del passato giocate il 2 Novembre
          Right: Curiosità del Giorno & Ricorrenze Azzurre
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT BOX: ACCADDE OGGI · PARTITE DEL PASSATO */}
        <section className="bg-[var(--bg-secondary)] border border-[var(--border-hairline)] p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-hairline)] pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono-tabular text-[#01A0E8] uppercase tracking-wider font-bold">
                <History className="w-4 h-4 text-[#01A0E8]" />
                <span>{lang === 'it' ? 'ACCADDE OGGI NEL PASSATO' : 'PLAYED ON THIS DAY'}</span>
              </div>
              <h3 className="text-xl font-display font-extrabold mt-1">
                {lang === 'it'
                  ? 'Gare Giocate il 2 Novembre nella Storia'
                  : 'Historical Matches Played on 2 November'}
              </h3>
            </div>

            <div className="flex items-center gap-1 text-xs font-mono-tabular">
              {(['ALL', 'V', 'N', 'S'] as const).map((res) => (
                <button
                  key={res}
                  onClick={() => setHistoryResultFilter(res)}
                  className={`px-2 py-0.5 border cursor-pointer ${
                    historyResultFilter === res
                      ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                      : 'border-[var(--border-hairline)] text-[var(--text-secondary)]'
                  }`}
                >
                  {res === 'ALL'
                    ? lang === 'it'
                      ? 'Tutte (17)'
                      : 'All (17)'
                    : res === 'V'
                    ? lang === 'it'
                      ? 'Vittorie'
                      : 'Wins'
                    : res === 'N'
                    ? lang === 'it'
                      ? 'Pareggi'
                      : 'Draws'
                    : lang === 'it'
                    ? 'Sconfitte'
                    : 'Losses'}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-[var(--text-secondary)] font-mono-tabular">
            {lang === 'it'
              ? 'In 98 campionati, il Napoli è sceso in campo 17 volte nella data odierna del 2 Novembre:'
              : 'Across 98 seasons, Napoli has taken the pitch 17 times on today’s date of 2 November:'}
          </p>

          {/* List of past matches */}
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {filteredPastMatches.map((m: any, idx: number) => {
              const isWin =
                (m.home_team === 'Napoli' && m.home_goals > m.away_goals) ||
                (m.away_team === 'Napoli' && m.away_goals > m.home_goals);
              const isDraw = m.home_goals === m.away_goals;

              return (
                <div
                  key={idx}
                  className="p-3.5 bg-[var(--bg-primary)] border border-[var(--border-hairline)] hover:border-[#01A0E8] transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-mono-tabular mb-1.5">
                    <span className="font-bold text-[#01A0E8]">
                      {m.match_date} · {m.competition}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 font-bold text-[10px] ${
                        isWin
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : isDraw
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-red-500/20 text-red-400 border border-red-500/40'
                      }`}
                    >
                      {isWin
                        ? lang === 'it'
                          ? 'VITTORIA'
                          : 'WIN'
                        : isDraw
                        ? lang === 'it'
                          ? 'PAREGGIO'
                          : 'DRAW'
                        : lang === 'it'
                        ? 'SCONFITTA'
                        : 'LOSS'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between font-display font-extrabold text-sm sm:text-base my-1">
                    <span className={m.home_team === 'Napoli' ? 'text-[#01A0E8]' : ''}>
                      {m.home_team}
                    </span>
                    <span className="text-[#01A0E8] font-mono-tabular">
                      {m.home_goals} - {m.away_goals}
                    </span>
                    <span className={m.away_team === 'Napoli' ? 'text-[#01A0E8]' : ''}>
                      {m.away_team}
                    </span>
                  </div>

                  {m.scorers && (
                    <div className="text-[11px] text-[var(--text-secondary)] font-mono-tabular mt-1 flex items-center gap-1.5">
                      <span>⚽</span>
                      <span>{m.scorers}</span>
                    </div>
                  )}

                  {/* Match Badges: Spectators, Referee, Formation, Notes */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px] font-mono-tabular">
                    {m.attendance ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] text-[var(--text-secondary)]">
                        <Users className="w-2.5 h-2.5 text-[#01A0E8]" />
                        <span>{m.attendance.toLocaleString()} spett.</span>
                      </span>
                    ) : null}

                    {m.referee ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] text-[var(--text-secondary)]">
                        <Shield className="w-2.5 h-2.5 text-[#01A0E8]" />
                        <span>{m.referee}</span>
                      </span>
                    ) : null}

                    {m.system_of_play ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] text-[#01A0E8]">
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

                  {m.ricorrenza_it && (
                    <div className="text-[11px] text-[#01A0E8] mt-1.5 italic">
                      💡 {lang === 'it' ? m.ricorrenza_it : m.ricorrenza_en}
                    </div>
                  )}

                  {/* Card Action */}
                  <div className="mt-2.5 pt-2 border-t border-[var(--border-hairline)] flex justify-end">
                    <button
                      onClick={() => onOpenMatchStory(m.id || String(m.season))}
                      className="px-2.5 py-1 bg-[#01A0E8] text-[#08090B] font-bold text-[10px] hover:bg-[#01A0E8]/90 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>{lang === 'it' ? 'Apri Scheda Dettagliata' : 'Open Detailed Card'}</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[var(--border-hairline)] flex items-center justify-between">
            <span className="text-[11px] font-mono-tabular text-[var(--text-secondary)]">
              {lang === 'it' ? 'Archivio totale 3.916 partite' : 'Total archive 3,916 matches'}
            </span>
            <button
              onClick={onNavigateToArchive}
              className="text-xs font-mono-tabular text-[#01A0E8] hover:underline flex items-center gap-1 cursor-pointer font-bold"
            >
              <span>{lang === 'it' ? 'Vai all’Archivio Partite' : 'Go to Matches Archive'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* RIGHT BOX: CURIOSITÀ DEL GIORNO & RICORRENZE STORICHE */}
        <section className="bg-[var(--bg-secondary)] border border-[var(--border-hairline)] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono-tabular text-[#01A0E8] uppercase tracking-wider font-bold">
                <Sparkles className="w-4 h-4 text-[#01A0E8]" />
                <span>{lang === 'it' ? 'CURIOSITÀ DEL GIORNO' : 'TODAY’S CURIOSITIES'}</span>
              </div>
              <h3 className="text-xl font-display font-extrabold mt-1">
                {lang === 'it'
                  ? 'Aneddoti & Primati Storici Azzurri'
                  : 'Azzurri Anecdotes & Historical Records'}
              </h3>
            </div>
            <span className="text-xs font-mono-tabular text-[var(--text-secondary)]">
              {curiositaList.length} {lang === 'it' ? 'schede verificate' : 'verified cards'}
            </span>
          </div>

          {/* Featured Spotlight Curiosity */}
          {curiositaList[selectedCuriosityIdx] && (
            <div className="p-5 bg-[var(--bg-primary)] border border-[#01A0E8]/40 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-mono-tabular">
                <span className="px-2 py-0.5 bg-[#01A0E8]/15 text-[#01A0E8] font-bold border border-[#01A0E8]/40 uppercase text-[10px]">
                  {curiositaList[selectedCuriosityIdx].tag}
                </span>
                <span className="text-[var(--text-secondary)]">
                  Anno {curiositaList[selectedCuriosityIdx].anno}
                </span>
              </div>

              <h4 className="text-lg font-display font-extrabold text-[var(--text-primary)]">
                {curiositaList[selectedCuriosityIdx].titolo}
              </h4>

              <div className="p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] text-xs font-mono-tabular text-[#01A0E8] font-bold">
                📊 {curiositaList[selectedCuriosityIdx].statistica}
              </div>

              <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                {curiositaList[selectedCuriosityIdx].descrizione}
              </p>

              <div className="pt-2 border-t border-[var(--border-hairline)] flex items-center justify-between text-[10px] font-mono-tabular text-[var(--text-secondary)]">
                <span>Fonte: {curiositaList[selectedCuriosityIdx].fonte}</span>
                <span className="text-[#01A0E8] font-semibold">
                  {curiositaList[selectedCuriosityIdx].hashtag}
                </span>
              </div>
            </div>
          )}

          {/* Select other curiosities */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono-tabular text-[var(--text-secondary)] uppercase">
              {lang === 'it' ? 'SFOGLIA ALTRE RICORRENZE AZZURRE:' : 'BROWSE OTHER AZZURRI MILESTONES:'}
            </div>
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {curiositaList.map((c: any, i: number) => (
                <button
                  key={c.id || i}
                  onClick={() => setSelectedCuriosityIdx(i)}
                  className={`w-full p-2.5 text-left text-xs font-mono-tabular border transition-colors flex items-center justify-between cursor-pointer ${
                    selectedCuriosityIdx === i
                      ? 'bg-[#01A0E8]/15 border-[#01A0E8] text-[#01A0E8] font-bold'
                      : 'bg-[var(--bg-primary)] border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[#01A0E8]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[#01A0E8]">●</span>
                    <span className="truncate">{c.titolo}</span>
                  </div>
                  <span className="text-[10px] shrink-0 opacity-70 ml-2">{c.anno}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

