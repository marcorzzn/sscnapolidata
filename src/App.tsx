/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  Download,
  ExternalLink,
  Search,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import {
  FEATURED_MATCHES,
  ARCHIVE_MATCHES,
  X_FEED_POSTS,
  MatchDataStory,
  CoverageStatus,
} from './data/napoliVerifiedData';
import { NapoliLogoIcon, WaveformSkyline } from './components/BrandMark';
import { InfographicExporterModal } from './components/InfographicExporterModal';
import { InteractiveMapsSection } from './components/InteractiveMapsSection';
import { HistoryMuseumSection } from './components/HistoryMuseumSection';
import { StadiumMaradona3D } from './components/StadiumMaradona3D';
import { ArchitectureAuditSection } from './components/ArchitectureAuditSection';
import { LatestMatchHero } from './components/LatestMatchHero';
import { CuriositaSection } from './components/CuriositaSection';
import { TwitterFeedSection } from './components/TwitterFeedSection';

type MainSection =
  | 'match_story'
  | 'archive_maps'
  | 'history_museum'
  | 'stadium_3d'
  | 'architecture_db';

export default function App() {
  const [activeSection, setActiveSection] = useState<MainSection>('match_story');
  const [lang, setLang] = useState<'it' | 'en'>('it');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Selected Match Data Story
  const [selectedMatchId, setSelectedMatchId] = useState<string>(FEATURED_MATCHES[0].id);
  const [showExporterModal, setShowExporterModal] = useState<boolean>(false);
  const [includePre1926Continuity, setIncludePre1926Continuity] = useState<boolean>(false);

  // Archive Filters
  const [compFilter, setCompFilter] = useState<string>('ALL');
  const [resultFilter, setResultFilter] = useState<string>('ALL');
  const [covFilter, setCovFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeMatch: MatchDataStory = useMemo(
    () => FEATURED_MATCHES.find((m) => m.id === selectedMatchId) || FEATURED_MATCHES[0],
    [selectedMatchId]
  );

  const filteredArchive = useMemo(() => {
    return ARCHIVE_MATCHES.filter((row) => {
      if (compFilter !== 'ALL' && row.competition !== compFilter) return false;
      if (resultFilter !== 'ALL' && row.resultForNapoli !== resultFilter) return false;
      if (covFilter !== 'ALL' && row.covStatus !== covFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const hay = `${row.homeTeam} ${row.awayTeam} ${row.season} ${row.scorersSummary} ${row.city}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [compFilter, resultFilter, covFilter, searchQuery]);

  const formatCoverageLabel = (st: CoverageStatus) => {
    if (st === 'completo') return lang === 'it' ? 'OK / Completo' : 'OK / Complete';
    if (st === 'parziale') return lang === 'it' ? 'Parziale' : 'Partial';
    if (st === 'nd') return lang === 'it' ? 'n.d. (Non disp. in fonte)' : 'n.d. (Not in source)';
    if (st === 'na') return lang === 'it' ? 'N/A (Assente per natura)' : 'N/A (By nature)';
    return lang === 'it' ? 'In arrivo (Pending)' : 'Pending';
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-150 ${
        theme === 'light' ? 'theme-light' : ''
      } bg-[var(--bg-primary)] text-[var(--text-primary)]`}
    >
      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="sticky top-0 z-40 bg-[var(--bg-primary)]/95 border-b border-[var(--border-hairline)] px-4 md:px-8 py-3.5">
        <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Brand Title (Single Line) */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('match_story');
            }}
            className="flex items-center gap-2.5 text-lg font-display font-extrabold tracking-tight whitespace-nowrap shrink-0"
          >
            <NapoliLogoIcon size={28} />
            <span>
              SSC <span className="text-[#01A0E8]">NAPOLI DATA</span>
            </span>
          </a>

          {/* Zone 2: 5 Concise Single-Line Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[var(--text-secondary)]">
            <button
              onClick={() => setActiveSection('match_story')}
              className={`hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activeSection === 'match_story'
                  ? 'text-[var(--text-primary)] border-b-2 border-[#01A0E8] font-semibold'
                  : ''
              }`}
            >
              {lang === 'it' ? 'Partita & Feed X' : 'Match & X Feed'}
            </button>
            <button
              onClick={() => setActiveSection('archive_maps')}
              className={`hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activeSection === 'archive_maps'
                  ? 'text-[var(--text-primary)] border-b-2 border-[#01A0E8] font-semibold'
                  : ''
              }`}
            >
              {lang === 'it' ? 'Archivio & Mappe' : 'Archive & Maps'}
            </button>
            <button
              onClick={() => setActiveSection('history_museum')}
              className={`hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activeSection === 'history_museum'
                  ? 'text-[var(--text-primary)] border-b-2 border-[#01A0E8] font-semibold'
                  : ''
              }`}
            >
              {lang === 'it' ? 'Storia & Museo' : 'History & Museum'}
            </button>
            <button
              onClick={() => setActiveSection('stadium_3d')}
              className={`hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activeSection === 'stadium_3d'
                  ? 'text-[var(--text-primary)] border-b-2 border-[#01A0E8] font-semibold'
                  : ''
              }`}
            >
              {lang === 'it' ? 'Stadio Maradona 3D' : '3D Maradona Stadium'}
            </button>
            <button
              onClick={() => setActiveSection('architecture_db')}
              className={`hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activeSection === 'architecture_db'
                  ? 'text-[var(--text-primary)] border-b-2 border-[#01A0E8] font-semibold'
                  : ''
              }`}
            >
              {lang === 'it' ? 'Architettura & DB' : 'Architecture & DB'}
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => setShowExporterModal(true)}
              className="px-4 py-2 text-xs font-bold bg-[#01A0E8] text-[#08090B] hover:bg-[#01A0E8]/90 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{lang === 'it' ? 'Esporta Scheda 1:2' : 'Export 1:2 Card'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Secondary Editorial Utility Bar (Slogan, Handle, Mobile Nav, Language IT/EN & Theme Switcher) */}
      <div className="border-b border-[var(--border-hairline)] bg-[var(--bg-secondary)] px-4 md:px-8 py-2.5">
        <div className="max-w-[1360px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-[var(--text-secondary)] font-mono-tabular">
            <span className="font-semibold text-[var(--text-primary)]">
              Data Napoli, Napoli Analitica
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-[#01A0E8] font-semibold">@sscnapolidata</span>
            <span aria-hidden="true" className="hidden sm:inline">
              ·
            </span>
            <span className="hidden sm:inline">
              {lang === 'it'
                ? '2.816 Partite · 4.879 Marcatori · Zero Dati Inventati'
                : '2,816 Matches · 4,879 Scorers · Zero Invented Data'}
            </span>
          </div>

          {/* Mobile Section Switcher + Global IT/EN and Dark/Light Toggles */}
          <div className="flex items-center gap-3">
            <div className="flex lg:hidden items-center gap-1 overflow-x-auto">
              {(
                [
                  { id: 'match_story', label: 'Scheda' },
                  { id: 'archive_maps', label: 'Mappe' },
                  { id: 'history_museum', label: 'Museo' },
                  { id: 'stadium_3d', label: '3D' },
                  { id: 'architecture_db', label: 'DB' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveSection(t.id)}
                  className={`px-2 py-1 text-[11px] font-mono-tabular border ${
                    activeSection === t.id
                      ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                      : 'border-[var(--border-hairline)] text-[var(--text-secondary)]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* IT / EN Switch */}
            <button
              onClick={() => setLang(lang === 'it' ? 'en' : 'it')}
              className="px-2.5 py-1 font-mono-tabular text-xs border border-[var(--border-hairline)] hover:border-[#01A0E8] transition-colors cursor-pointer whitespace-nowrap"
              title="Cambia lingua / Switch language"
            >
              <span className={lang === 'it' ? 'text-[#01A0E8] font-bold' : 'opacity-60'}>
                IT
              </span>
              <span className="mx-1 opacity-40">/</span>
              <span className={lang === 'en' ? 'text-[#01A0E8] font-bold' : 'opacity-60'}>
                EN
              </span>
            </button>

            {/* Dark / Light Theme Switch */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="px-2.5 py-1 border border-[var(--border-hairline)] hover:border-[#01A0E8] transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="Cambia tema Chiaro/Scuro"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#01A0E8]" />
                  <span className="font-mono-tabular text-[11px]">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#01A0E8]" />
                  <span className="font-mono-tabular text-[11px]">Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-[1360px] mx-auto px-4 md:px-8 py-8">
        {activeSection === 'match_story' && (
          <div className="space-y-10">
            {/* 1. HERO SECTION: LATEST MATCH PLAYED (FIORENTINA 1-1 NAPOLI) */}
            <LatestMatchHero
              lang={lang}
              onOpenMatchStory={(id) => {
                setSelectedMatchId(id);
                const el = document.getElementById('match-data-story');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              onExportGraphic={() => setShowExporterModal(true)}
              onViewStadiumOnMap={() => setActiveSection('archive_maps')}
            />

            {/* Match Selector Bar */}
            <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono-tabular text-[#01A0E8] font-bold uppercase">
                  {lang === 'it' ? 'SCHEDE MATCH DATA STORY DISPONIBILI:' : 'AVAILABLE MATCH DATA STORIES:'}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {FEATURED_MATCHES.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMatchId(m.id)}
                      className={`px-3 py-1.5 text-xs font-mono-tabular border transition-colors cursor-pointer whitespace-nowrap ${
                        selectedMatchId === m.id
                          ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                          : 'bg-[var(--bg-primary)] text-[var(--text-primary)] border-[var(--border-hairline)] hover:border-[#01A0E8]'
                      }`}
                    >
                      {m.homeCode} {m.homeGoals}-{m.awayGoals} {m.awayCode} ({m.dateIso.slice(0, 7)})
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono-tabular text-[var(--text-secondary)]">
                <span>
                  confidence:{' '}
                  <strong className="text-[#01A0E8]">{activeMatch.confidence}</strong>
                </span>
                <span>·</span>
                <span>
                  verificato:{' '}
                  <strong className="text-[#01A0E8]">{activeMatch.verificato}</strong>
                </span>
              </div>
            </div>

            {/* 2-Column Asymmetric Layout: Vertical Match Data Story (Left 7 cols) + Embedded @sscnapolidata X Feed (Right 5 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: VERTICAL MATCH DATA STORY (Matches exact design of user's light.png & dark.png) */}
              <article id="match-data-story" className="lg:col-span-7 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] p-6 md:p-10 space-y-8 scroll-mt-20">
                {/* Card Header with DATA NAPOLI & @sscnapolidata */}
                <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-4">
                  <div className="font-display font-extrabold text-base tracking-tight">
                    <span>DATA </span>
                    <span className="text-[#01A0E8]">NAPOLI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <NapoliLogoIcon size={22} />
                    <span className="text-xs font-semibold text-[#01A0E8]">
                      @sscnapolidata
                    </span>
                  </div>
                </div>

                {/* 1. OVERVIEW — GOALS AND KEY CHANCES (Functional Waveform) */}
                <div>
                  <div className="text-xs font-mono-tabular text-[var(--text-secondary)] tracking-wider uppercase mb-3">
                    {lang === 'it'
                      ? 'OVERVIEW — GOL E OCCASIONI CHIAVE'
                      : 'OVERVIEW — GOALS AND KEY CHANCES'}
                  </div>
                  <div className="p-4 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
                    <div className="flex items-end justify-between gap-2 h-28 pt-2">
                      {activeMatch.waveformBars.map((bar, idx) => (
                        <div
                          key={idx}
                          className="flex-1 flex flex-col items-center justify-end h-full group relative"
                        >
                          <div
                            className="w-full transition-opacity group-hover:opacity-90"
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
                          <span className="text-[11px] font-mono-tabular text-[var(--text-secondary)] mt-2">
                            {bar.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-2.5 leading-relaxed">
                    {lang === 'it'
                      ? activeMatch.waveformCaptionIt
                      : activeMatch.waveformCaptionEn}
                  </p>
                </div>

                {/* 2. MATCH HEADER & SCORE */}
                <div className="pt-2">
                  <div className="text-sm font-display font-bold tracking-wide">
                    {activeMatch.competition} ·{' '}
                    {lang === 'it' ? activeMatch.matchdayIt : activeMatch.matchdayEn}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {lang === 'it' ? activeMatch.dateDisplayIt : activeMatch.dateDisplayEn} ·{' '}
                    {activeMatch.time}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {activeMatch.stadium}, {activeMatch.city}
                  </div>

                  <div className="flex items-center justify-between mt-7 text-sm md:text-base font-display font-bold tracking-wide">
                    <span>{activeMatch.homeTeam}</span>
                    <span>{activeMatch.awayTeam}</span>
                  </div>

                  <div className="text-center my-4">
                    <div className="text-6xl md:text-7xl font-display font-extrabold tracking-tight tabular-nums">
                      {activeMatch.homeGoals}{' '}
                      <span className="text-[#01A0E8]">-</span> {activeMatch.awayGoals}
                    </div>
                    <div className="text-xs font-mono-tabular text-[#01A0E8] tracking-widest mt-2">
                      ● FULL TIME
                    </div>
                  </div>
                </div>

                {/* 3. MATCH SUMMARY */}
                <section className="pt-6 border-t border-[var(--border-hairline)]">
                  <h3 className="text-xs font-mono-tabular text-[#01A0E8] font-bold tracking-widest uppercase mb-3">
                    MATCH SUMMARY
                  </h3>
                  <p className="text-sm md:text-base leading-relaxed">
                    {lang === 'it' ? activeMatch.summaryIt : activeMatch.summaryEn}
                  </p>
                </section>

                {/* 4. GOAL TIMELINE */}
                <section className="pt-6 border-t border-[var(--border-hairline)]">
                  <h3 className="text-xs font-mono-tabular text-[#01A0E8] font-bold tracking-widest uppercase mb-4">
                    GOAL TIMELINE
                  </h3>
                  <div className="divide-y divide-[var(--border-hairline)]">
                    {activeMatch.goals.map((goal, idx) => (
                      <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-start gap-5">
                        <div className="w-16 shrink-0">
                          <div className="text-3xl md:text-4xl font-display font-extrabold text-[#01A0E8] tabular-nums leading-none">
                            {goal.minute}
                          </div>
                          <div className="text-[10px] font-mono-tabular text-[var(--text-secondary)] mt-1">
                            {goal.half}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-base font-display font-bold">{goal.scorer}</div>
                          <div className="text-[11px] font-mono-tabular text-[var(--text-secondary)]">
                            {goal.teamName}
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                            {lang === 'it' ? goal.descriptionIt : goal.descriptionEn}
                          </p>
                          <div className="mt-2 inline-block px-2 py-0.5 bg-[#01A0E8]/15 border border-[#01A0E8]/40 text-xs font-mono-tabular font-bold text-[#01A0E8]">
                            {goal.partialScore}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 5. KEY MOMENTS */}
                <section className="pt-6 border-t border-[var(--border-hairline)]">
                  <h3 className="text-xs font-mono-tabular text-[#01A0E8] font-bold tracking-widest uppercase mb-4">
                    KEY MOMENTS
                  </h3>
                  <div className="divide-y divide-[var(--border-hairline)]">
                    {activeMatch.keyMoments.map((km, idx) => (
                      <div key={idx} className="py-3 flex items-start gap-4 text-xs">
                        <div className="w-12 font-mono-tabular font-bold shrink-0">
                          {km.minute}
                        </div>
                        <div>
                          <div className="font-semibold">
                            {lang === 'it' ? km.titleIt : km.titleEn}
                          </div>
                          <div className="text-[10px] font-mono-tabular text-[var(--text-secondary)] mt-0.5">
                            {km.team}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 6. MATCH FLOW (Vertical Timeline with strict chronological verification) */}
                <section className="pt-6 border-t border-[var(--border-hairline)]">
                  <h3 className="text-xs font-mono-tabular text-[#01A0E8] font-bold tracking-widest uppercase mb-4">
                    MATCH FLOW
                  </h3>
                  <div className="relative pl-5 border-l border-[#01A0E8]/35 space-y-5 text-xs">
                    <div className="text-[10px] font-mono-tabular text-[var(--text-secondary)] uppercase tracking-wider">
                      FIRST HALF
                    </div>
                    {activeMatch.waveformBars
                      .filter((b) => b.label !== "0'" && b.label !== 'FT')
                      .map((b, i) => (
                        <div key={i} className="relative">
                          <span className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-[#01A0E8]" />
                          <div className="font-mono-tabular text-[#01A0E8] font-bold">
                            {b.label}
                          </div>
                          <div className="font-medium mt-0.5">
                            {lang === 'it' ? b.eventNoteIt : b.eventNoteEn}
                          </div>
                        </div>
                      ))}
                  </div>
                  {activeMatch.id === '2026-09-20-fiorentina-napoli' && (
                    <p className="text-[11px] text-[var(--text-secondary)] mt-4 leading-relaxed">
                      {lang === 'it'
                        ? 'Il palo di Olivera (Napoli) e le sostituzioni prive di minuto ufficiale sono esclusi da questa linea temporale per non implicare una collocazione oraria non verificata; restano documentati nelle rispettive sezioni.'
                        : "Olivera's post (Napoli) and the substitutions with no official minute are left off this line, to avoid implying an unverified time placement; they remain in the sections above."}
                    </p>
                  )}
                </section>

                {/* 7. SUBSTITUTIONS */}
                <section className="pt-6 border-t border-[var(--border-hairline)]">
                  <h3 className="text-xs font-mono-tabular text-[#01A0E8] font-bold tracking-widest uppercase mb-4">
                    SUBSTITUTIONS
                  </h3>
                  <div className="divide-y divide-[var(--border-hairline)] text-xs">
                    {activeMatch.substitutions.map((sub, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <span className="w-10 font-mono-tabular text-[var(--text-secondary)]">
                            {sub.minute}
                          </span>
                          <span>
                            {sub.playerOut ? (
                              <>
                                <span className="text-[var(--text-secondary)]">
                                  {sub.playerOut}
                                </span>{' '}
                                <span className="text-[#01A0E8]">→</span>{' '}
                                <strong>{sub.playerIn}</strong>
                              </>
                            ) : (
                              <>
                                {sub.noteIt && (
                                  <span className="text-[var(--text-secondary)] mr-1.5">
                                    {lang === 'it' ? sub.noteIt : sub.noteEn}:
                                  </span>
                                )}
                                <strong>{sub.playerIn}</strong>
                              </>
                            )}
                          </span>
                        </div>
                        <span className="font-mono-tabular text-[11px] text-[var(--text-secondary)]">
                          {sub.team}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 8. DISCIPLINE & 9. LINE-UPS & MATCH DATA (Honest ND / Pending Declaration) */}
                <section className="pt-6 border-t border-[var(--border-hairline)] space-y-5">
                  <div>
                    <h3 className="text-xs font-mono-tabular text-[#01A0E8] font-bold tracking-widest uppercase mb-3">
                      DISCIPLINE
                    </h3>
                    <div className="p-4 bg-[var(--bg-primary)] border border-[#01A0E8]/25 text-xs leading-relaxed text-[var(--text-secondary)]">
                      {lang === 'it'
                        ? activeMatch.disciplineNoteIt
                        : activeMatch.disciplineNoteEn}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-mono-tabular text-[#01A0E8] font-bold tracking-widest uppercase mb-3">
                      LINE-UPS & MATCH DATA
                    </h3>
                    <div className="p-4 bg-[var(--bg-primary)] border border-[#01A0E8]/25 text-xs leading-relaxed text-[var(--text-secondary)]">
                      {lang === 'it' ? activeMatch.lineupsNoteIt : activeMatch.lineupsNoteEn}
                    </div>
                  </div>
                </section>

                {/* 10. FINAL DATA & COVERAGE MAP */}
                <section className="pt-6 border-t border-[var(--border-hairline)]">
                  <h3 className="text-xs font-mono-tabular text-[#01A0E8] font-bold tracking-widest uppercase mb-4">
                    FINAL DATA & TABELLA COPERTURA (cov)
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-4 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
                      <div className="text-[10px] font-mono-tabular text-[var(--text-secondary)]">
                        RESULT
                      </div>
                      <div className="text-2xl font-display font-extrabold text-[#01A0E8] mt-1 tabular-nums">
                        {activeMatch.homeGoals}–{activeMatch.awayGoals}
                      </div>
                    </div>
                    <div className="p-4 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
                      <div className="text-[10px] font-mono-tabular text-[var(--text-secondary)]">
                        COMPETITION
                      </div>
                      <div className="text-sm font-display font-bold mt-1.5">
                        {activeMatch.competition}
                      </div>
                      <div className="text-[10px] text-[var(--text-secondary)]">
                        {activeMatch.season}
                      </div>
                    </div>
                    <div className="p-4 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
                      <div className="text-[10px] font-mono-tabular text-[var(--text-secondary)]">
                        TOTAL GOALS
                      </div>
                      <div className="text-2xl font-display font-extrabold mt-1 tabular-nums">
                        {activeMatch.homeGoals + activeMatch.awayGoals}
                      </div>
                    </div>
                    <div className="p-4 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
                      <div className="text-[10px] font-mono-tabular text-[var(--text-secondary)]">
                        STADIUM
                      </div>
                      <div className="text-xs font-bold mt-1.5">{activeMatch.stadium}</div>
                      <div className="text-[10px] text-[var(--text-secondary)]">
                        {activeMatch.city}
                      </div>
                    </div>
                  </div>

                  {/* Coverage Dictionary (completo / parziale / nd / na / pending) */}
                  <div className="mt-3 p-4 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
                    <div className="text-[10px] font-mono-tabular text-[#01A0E8] uppercase tracking-wider mb-2.5">
                      STATO COPERTURA SEZIONI (TABELLA copertura)
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-tabular">
                      {Object.entries(activeMatch.cov).map(([field, status]) => (
                        <div
                          key={field}
                          className="p-2 bg-[var(--bg-secondary)] border border-[var(--border-hairline)]"
                        >
                          <div className="text-[10px] text-[var(--text-secondary)]">{field}</div>
                          <div
                            className={`font-bold mt-0.5 ${
                              status === 'completo'
                                ? 'text-[#01A0E8]'
                                : status === 'na'
                                ? 'opacity-50'
                                : ''
                            }`}
                          >
                            {formatCoverageLabel(status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* 11. THE ETERNAL MATCH (LA PARTITA ETERNA) */}
                <section className="pt-6 border-t border-[var(--border-hairline)]">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <h3 className="text-xs font-mono-tabular text-[#01A0E8] font-bold tracking-widest uppercase">
                      THE ETERNAL MATCH (LA PARTITA ETERNA)
                    </h3>
                    <button
                      onClick={() => setIncludePre1926Continuity(!includePre1926Continuity)}
                      className="text-[11px] font-mono-tabular text-[#01A0E8] underline cursor-pointer"
                    >
                      {includePre1926Continuity
                        ? lang === 'it'
                          ? 'Vista: Con Entità Pre-1926 (inherits_legal=1)'
                          : 'View: Including Pre-1926 Entities'
                        : lang === 'it'
                        ? 'Vista Ufficiale: Dal 1° Agosto 1926 (inherits_sporting_record=1)'
                        : 'Official View: Since 1 Aug 1926 (inherits_sporting_record=1)'}
                    </button>
                  </div>

                  <div className="text-3xl md:text-4xl font-display font-extrabold tracking-tight">
                    NAP <span className="text-[var(--text-secondary)] font-normal">vs</span>{' '}
                    {activeMatch.eternalMatch.opponentCode}
                  </div>

                  <div className="grid grid-cols-4 gap-2 my-4 text-center font-mono-tabular">
                    <div className="p-3 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
                      <div className="text-[10px] text-[var(--text-secondary)]">GARE</div>
                      <div className="text-lg font-bold text-[#01A0E8]">
                        {activeMatch.eternalMatch.officialMatches}
                      </div>
                    </div>
                    <div className="p-3 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
                      <div className="text-[10px] text-[var(--text-secondary)]">VITTORIE NAP</div>
                      <div className="text-lg font-bold">
                        {activeMatch.eternalMatch.napoliWins}
                      </div>
                    </div>
                    <div className="p-3 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
                      <div className="text-[10px] text-[var(--text-secondary)]">PAREGGI</div>
                      <div className="text-lg font-bold">{activeMatch.eternalMatch.draws}</div>
                    </div>
                    <div className="p-3 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
                      <div className="text-[10px] text-[var(--text-secondary)]">GOL NAP-OPP</div>
                      <div className="text-lg font-bold text-[#01A0E8]">
                        {activeMatch.eternalMatch.napoliGoals}–
                        {activeMatch.eternalMatch.opponentGoals}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {lang === 'it'
                      ? activeMatch.eternalMatch.pre1926EntitiesNoteIt
                      : activeMatch.eternalMatch.pre1926EntitiesNoteEn}
                  </p>
                </section>

                {/* 12. BRANDED FOOTER WITH GEOMETRIC N, @sscnapolidata & CONSOLIDATED SOURCES */}
                <footer className="pt-6 border-t border-[var(--border-hairline)] space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <NapoliLogoIcon size={36} useImageAsset={true} />
                      <div>
                        <div className="text-sm font-display font-extrabold">
                          SSC NAPOLI DATA
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                          <span>Napoli Analitica</span>
                          <span>·</span>
                          <span className="text-[#01A0E8] font-semibold">@sscnapolidata</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowExporterModal(true)}
                      className="px-4 py-2 text-xs font-mono-tabular font-bold border border-[#01A0E8] text-[#01A0E8] hover:bg-[#01A0E8] hover:text-[#08090B] transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>
                        {lang === 'it'
                          ? 'Scarica Scheda 1:2 (@sscnapolidata)'
                          : 'Download 1:2 Card (@sscnapolidata)'}
                      </span>
                    </button>
                  </div>

                  <div className="text-[11px] text-[var(--text-secondary)] space-y-1 font-mono-tabular">
                    {activeMatch.sources.map((src, i) => (
                      <div key={i}>
                        Fonti [{i + 1}]: <strong>{src.label}</strong> — {src.detail}
                        {src.provisionalNoteIt && (
                          <div className="text-[#01A0E8] mt-0.5">
                            Nota Metodologica:{' '}
                            {lang === 'it' ? src.provisionalNoteIt : src.provisionalNoteEn}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </footer>
              </article>

              {/* RIGHT COLUMN: OFFICIAL @sscnapolidata X FEED & BANNER (WIDGETS.JS EMBED + VERIFIED POSTS) */}
              <aside className="lg:col-span-5 space-y-6">
                <TwitterFeedSection lang={lang} theme={theme} />
              </aside>
            </div>

            {/* 3. SECTION "DAL DATABASE · CURIOSITÀ VERIFICATE" */}
            <div className="pt-8 border-t border-[var(--border-hairline)]">
              <CuriositaSection lang={lang} />
            </div>
          </div>
        )}

        {activeSection === 'archive_maps' && (
          <div className="space-y-12">
            {/* Interactive Progressive Maps (Away Stadiums with Progressive Pin Numbers + Homes of Napoli) */}
            <InteractiveMapsSection lang={lang} />

            {/* Filterable Match Archive (1926–2026) */}
            <div className="space-y-6 pt-8 border-t border-[var(--border-hairline)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-mono-tabular text-[#01A0E8] uppercase tracking-widest">
                    ARCHIVIO STORICO INTERROGABILE (1926 – 2026)
                  </div>
                  <h2 className="text-2xl font-display font-extrabold mt-1">
                    {lang === 'it'
                      ? 'Archivio Partite con Filtri Multipli e Stato Copertura'
                      : 'Match Archive with Multi-Filters & Coverage Status'}
                  </h2>
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      lang === 'it'
                        ? 'Cerca avversario, marcatore, anno...'
                        : 'Search opponent, scorer, year...'
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--bg-secondary)] border border-[var(--border-hairline)] focus:border-[#01A0E8] outline-none"
                  />
                </div>
              </div>

              {/* Filter Controls */}
              <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono-tabular text-[var(--text-secondary)]">
                    COMPETIZIONE:
                  </span>
                  {(
                    [
                      'ALL',
                      'Serie A',
                      'Coppa Italia',
                      'UEFA Champions League',
                      'Coppa UEFA',
                      'Supercoppa Italiana',
                    ] as const
                  ).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCompFilter(c)}
                      className={`px-2.5 py-1 font-mono-tabular border cursor-pointer ${
                        compFilter === c
                          ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                          : 'border-[var(--border-hairline)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {c === 'ALL' ? (lang === 'it' ? 'Tutte' : 'All') : c}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono-tabular text-[var(--text-secondary)]">ESITO:</span>
                  {(['ALL', 'V', 'P', 'S'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setResultFilter(r)}
                      className={`px-2.5 py-1 font-mono-tabular border cursor-pointer ${
                        resultFilter === r
                          ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                          : 'border-[var(--border-hairline)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {r === 'ALL' ? (lang === 'it' ? 'Tutti' : 'All') : r}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono-tabular text-[var(--text-secondary)]">
                    COPERTURA:
                  </span>
                  {(['ALL', 'completo', 'parziale', 'nd'] as const).map((cv) => (
                    <button
                      key={cv}
                      onClick={() => setCovFilter(cv)}
                      className={`px-2.5 py-1 font-mono-tabular border cursor-pointer ${
                        covFilter === cv
                          ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                          : 'border-[var(--border-hairline)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {cv.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Archive Table */}
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-hairline)] overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-hairline)] font-mono-tabular text-[var(--text-secondary)]">
                      <th className="py-3 px-4">Data & Stagione</th>
                      <th className="py-3 px-4">Competizione</th>
                      <th className="py-3 px-4">Incontro</th>
                      <th className="py-3 px-4">Risultato</th>
                      <th className="py-3 px-4">Marcatori / Note</th>
                      <th className="py-3 px-4">Copertura & Qualità</th>
                      <th className="py-3 px-4 text-right">Scheda</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-hairline)]">
                    {filteredArchive.map((row) => (
                      <tr key={row.id} className="hover:bg-[var(--bg-primary)]/60">
                        <td className="py-3.5 px-4 font-mono-tabular whitespace-nowrap">
                          <div className="font-bold">{row.date}</div>
                          <div className="text-[11px] text-[var(--text-secondary)]">
                            {row.season}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono-tabular whitespace-nowrap">
                          {row.competition}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-sm">
                            {row.homeTeam} – {row.awayTeam}
                          </div>
                          <div className="text-[11px] text-[var(--text-secondary)]">
                            {row.venue}, {row.city}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono-tabular whitespace-nowrap">
                          <span className="text-base font-display font-extrabold text-[#01A0E8]">
                            {row.homeGoals} – {row.awayGoals}
                          </span>
                          <span className="ml-2 text-[11px] text-[var(--text-secondary)]">
                            ({row.resultForNapoli})
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                          {row.scorersSummary}
                        </td>
                        <td className="py-3.5 px-4 font-mono-tabular whitespace-nowrap">
                          <div className="text-[#01A0E8] font-semibold">
                            cov: {row.covStatus}
                          </div>
                          <div className="text-[10px] text-[var(--text-secondary)]">
                            conf: {row.confidence} · verif: {row.verificato}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {row.linkedStoryId ? (
                            <button
                              onClick={() => {
                                setSelectedMatchId(row.linkedStoryId!);
                                setActiveSection('match_story');
                              }}
                              className="px-3 py-1 bg-[#01A0E8] text-[#08090B] font-mono-tabular font-bold text-xs cursor-pointer"
                            >
                              Apri Scheda
                            </button>
                          ) : (
                            <span className="text-[11px] font-mono-tabular text-[var(--text-secondary)]">
                              In Archivio DB
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'history_museum' && <HistoryMuseumSection lang={lang} />}

        {activeSection === 'stadium_3d' && <StadiumMaradona3D lang={lang} />}

        {activeSection === 'architecture_db' && <ArchitectureAuditSection lang={lang} />}
      </main>

      {/* GLOBAL FOOTER */}
      <footer className="mt-16 border-t border-[var(--border-hairline)] bg-[var(--bg-secondary)] px-4 md:px-8 py-8">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <NapoliLogoIcon size={36} />
            <div>
              <div className="font-display font-extrabold text-sm tracking-tight">
                SSC NAPOLI DATA · <span className="text-[#01A0E8]">@sscnapolidata</span>
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                Data Napoli, Napoli Analitica — Zero Dati Inventati · Licenza Contenuti CC BY-SA 4.0 / Dati CC0
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono-tabular text-[var(--text-secondary)]">
            <a
              href="https://marcorzzn.github.io/sscnapolidata/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#01A0E8] transition-colors inline-flex items-center gap-1"
            >
              <span>marcorzzn.github.io/sscnapolidata</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>·</span>
            <a
              href="https://x.com/sscnapolidata"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#01A0E8] transition-colors inline-flex items-center gap-1"
            >
              <span>x.com/sscnapolidata</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* 1:2 Social Infographic Exporter Modal */}
      {showExporterModal && (
        <InfographicExporterModal
          match={activeMatch}
          lang={lang}
          theme={theme}
          onClose={() => setShowExporterModal(false)}
        />
      )}
    </div>
  );
}
