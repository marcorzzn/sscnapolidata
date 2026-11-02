/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  Download,
  ExternalLink,
  Sun,
  Moon,
  X,
  Calendar,
  MapPin,
  Trophy,
  Users,
  Shield,
  Activity,
  Sparkles,
} from 'lucide-react';
import {
  FEATURED_MATCHES,
  MatchDataStory,
  CoverageStatus,
} from './data/napoliVerifiedData';
import { resolveMatchDataStory } from './data/matchResolver';
import { NapoliLogoIcon } from './components/BrandMark';
import { InfographicExporterModal } from './components/InfographicExporterModal';
import { OggiSection } from './components/OggiSection';
import { MatchesArchiveSection } from './components/MatchesArchiveSection';
import { InteractiveMapsSection } from './components/InteractiveMapsSection';
import { EncyclopediaSection } from './components/EncyclopediaSection';
import { HistoryMuseumSection } from './components/HistoryMuseumSection';
import { StadiumMaradona3D } from './components/StadiumMaradona3D';

type MainSection = 'oggi' | 'partite' | 'mappe' | 'record' | 'storia' | 'stadio';

export default function App() {
  const [activeSection, setActiveSection] = useState<MainSection>('oggi');
  const [lang, setLang] = useState<'it' | 'en'>('it');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Match detail view modal state
  const [detailMatchId, setDetailMatchId] = useState<string | null>(null);
  const [showExporterModal, setShowExporterModal] = useState<boolean>(false);
  const [includePre1926Continuity, setIncludePre1926Continuity] = useState<boolean>(false);

  // Active match data story for detail modal resolved dynamically from 3,916 archive
  const activeDetailMatch: MatchDataStory = useMemo(() => {
    return resolveMatchDataStory(detailMatchId);
  }, [detailMatchId]);

  const formatCoverageLabel = (st: CoverageStatus) => {
    if (st === 'completo') return lang === 'it' ? 'OK / Completo' : 'OK / Complete';
    if (st === 'parziale') return lang === 'it' ? 'Parziale' : 'Partial';
    if (st === 'nd') return lang === 'it' ? 'n.d. (Non disp.)' : 'N/D (Not avail.)';
    if (st === 'na') return lang === 'it' ? 'N/A (Assente)' : 'N/A';
    return lang === 'it' ? 'In arrivo' : 'Pending';
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-150 ${
        theme === 'light' ? 'theme-light' : ''
      } bg-[var(--bg-primary)] text-[var(--text-primary)]`}
    >
      {/* =========================================================================
          TOP NAVBAR
          Left: Authentic Favicon + Title (SSC NAPOLI cyan, DATA dark/light) + Subtitle
          Center: 6 Sections (Oggi, Partite, Mappe, Record, Storia, Stadio)
          Right: Language (IT / EN) & Theme (Dark / Light) Switchers
         ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[var(--bg-primary)]/95 border-b border-[var(--border-hairline)] px-4 md:px-8 py-3 backdrop-blur-md">
        <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-6">
          {/* Brand Mark: Left */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('oggi');
            }}
            className="flex items-center gap-3 shrink-0 group select-none"
          >
            <NapoliLogoIcon size={34} />
            <div className="flex flex-col">
              <div className="text-base sm:text-lg font-display font-extrabold tracking-tight leading-none">
                <span className="text-[#01A0E8]">SSC NAPOLI</span>{' '}
                <span className="text-[var(--text-primary)]">DATA</span>
              </div>
              <div className="text-[11px] font-mono-tabular text-[var(--text-secondary)] mt-0.5 leading-tight">
                Data Napoli, Napoli Analitica
              </div>
            </div>
          </a>

          {/* Navigation Links: 6 Single-Line Items */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[var(--text-secondary)]">
            <button
              onClick={() => setActiveSection('oggi')}
              className={`hover:text-[var(--text-primary)] transition-colors whitespace-nowrap cursor-pointer pb-0.5 ${
                activeSection === 'oggi'
                  ? 'text-[var(--text-primary)] border-b-2 border-[#01A0E8] font-bold'
                  : ''
              }`}
            >
              {lang === 'it' ? 'Oggi' : 'Today'}
            </button>
            <button
              onClick={() => setActiveSection('partite')}
              className={`hover:text-[var(--text-primary)] transition-colors whitespace-nowrap cursor-pointer pb-0.5 ${
                activeSection === 'partite'
                  ? 'text-[var(--text-primary)] border-b-2 border-[#01A0E8] font-bold'
                  : ''
              }`}
            >
              {lang === 'it' ? 'Partite' : 'Matches'}
            </button>
            <button
              onClick={() => setActiveSection('mappe')}
              className={`hover:text-[var(--text-primary)] transition-colors whitespace-nowrap cursor-pointer pb-0.5 ${
                activeSection === 'mappe'
                  ? 'text-[var(--text-primary)] border-b-2 border-[#01A0E8] font-bold'
                  : ''
              }`}
            >
              {lang === 'it' ? 'Mappe' : 'Maps'}
            </button>
            <button
              onClick={() => setActiveSection('record')}
              className={`hover:text-[var(--text-primary)] transition-colors whitespace-nowrap cursor-pointer pb-0.5 ${
                activeSection === 'record'
                  ? 'text-[var(--text-primary)] border-b-2 border-[#01A0E8] font-bold'
                  : ''
              }`}
            >
              {lang === 'it' ? 'Record' : 'Records'}
            </button>
            <button
              onClick={() => setActiveSection('storia')}
              className={`hover:text-[var(--text-primary)] transition-colors whitespace-nowrap cursor-pointer pb-0.5 ${
                activeSection === 'storia'
                  ? 'text-[var(--text-primary)] border-b-2 border-[#01A0E8] font-bold'
                  : ''
              }`}
            >
              {lang === 'it' ? 'Storia' : 'History'}
            </button>
            <button
              onClick={() => setActiveSection('stadio')}
              className={`hover:text-[var(--text-primary)] transition-colors whitespace-nowrap cursor-pointer pb-0.5 ${
                activeSection === 'stadio'
                  ? 'text-[var(--text-primary)] border-b-2 border-[#01A0E8] font-bold'
                  : ''
              }`}
            >
              {lang === 'it' ? 'Stadio' : 'Stadium'}
            </button>
          </nav>

          {/* Right Action Zone: Language & Theme Switchers */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* IT / EN Toggle */}
            <button
              onClick={() => setLang(lang === 'it' ? 'en' : 'it')}
              className="px-2.5 py-1 font-mono-tabular text-xs border border-[var(--border-hairline)] hover:border-[#01A0E8] transition-colors cursor-pointer whitespace-nowrap bg-[var(--bg-secondary)]"
              title={lang === 'it' ? 'Passa alla lingua inglese' : 'Switch to Italian'}
            >
              <span className={lang === 'it' ? 'text-[#01A0E8] font-bold' : 'opacity-50'}>
                IT
              </span>
              <span className="mx-1 opacity-30">/</span>
              <span className={lang === 'en' ? 'text-[#01A0E8] font-bold' : 'opacity-50'}>
                EN
              </span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="px-2.5 py-1 border border-[var(--border-hairline)] hover:border-[#01A0E8] transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap bg-[var(--bg-secondary)]"
              title={theme === 'dark' ? 'Attiva tema chiaro' : 'Attiva tema scuro'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#01A0E8]" />
                  <span className="font-mono-tabular text-[11px] hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#01A0E8]" />
                  <span className="font-mono-tabular text-[11px] hidden sm:inline">Dark</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Section Navigation */}
        <div className="flex lg:hidden items-center gap-1 overflow-x-auto pt-2.5 mt-2 border-t border-[var(--border-hairline)]">
          {(
            [
              { id: 'oggi', it: 'Oggi', en: 'Today' },
              { id: 'partite', it: 'Partite', en: 'Matches' },
              { id: 'mappe', it: 'Mappe', en: 'Maps' },
              { id: 'record', it: 'Record', en: 'Records' },
              { id: 'storia', it: 'Storia', en: 'History' },
              { id: 'stadio', it: 'Stadio', en: 'Stadium' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveSection(t.id)}
              className={`px-3 py-1 text-xs font-mono-tabular border transition-colors whitespace-nowrap ${
                activeSection === t.id
                  ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                  : 'border-[var(--border-hairline)] text-[var(--text-secondary)] bg-[var(--bg-secondary)]'
              }`}
            >
              {lang === 'it' ? t.it : t.en}
            </button>
          ))}
        </div>
      </header>

      {/* =========================================================================
          MAIN CONTENT CONTAINER
         ========================================================================= */}
      <main className="max-w-[1360px] mx-auto px-4 md:px-8 py-8">
        {/* SECTION 1: OGGI (Latest match, Feed, Accadde Oggi, Curiosita) */}
        {activeSection === 'oggi' && (
          <OggiSection
            lang={lang}
            theme={theme}
            onOpenMatchStory={(matchId) => setDetailMatchId(matchId)}
            onNavigateToArchive={() => setActiveSection('partite')}
          />
        )}

        {/* SECTION 2: PARTITE (Clean minimalist season folders archive) */}
        {activeSection === 'partite' && (
          <MatchesArchiveSection
            lang={lang}
            onSelectMatch={(matchId) => setDetailMatchId(matchId)}
          />
        )}

        {/* SECTION 3: MAPPE (High-precision Cartography: Away Stadiums + Naples Homes) */}
        {activeSection === 'mappe' && <InteractiveMapsSection lang={lang} />}

        {/* SECTION 4: RECORD (Sortable Encyclopedia: Placements, Legends, Financials, Tactics, H2H, Referees, Record Matches) */}
        {activeSection === 'record' && (
          <EncyclopediaSection
            lang={lang}
            onSelectMatch={(matchId) => setDetailMatchId(matchId)}
          />
        )}

        {/* SECTION 5: STORIA (Pioneers, Presidents, Museum, Kits, Sponsors, Retired #10) */}
        {activeSection === 'storia' && <HistoryMuseumSection lang={lang} />}

        {/* SECTION 6: STADIO (Interactive 3D Maradona Stadium) */}
        {activeSection === 'stadio' && <StadiumMaradona3D lang={lang} />}
      </main>

      {/* =========================================================================
          GLOBAL FOOTER
         ========================================================================= */}
      <footer className="mt-16 border-t border-[var(--border-hairline)] bg-[var(--bg-secondary)] px-4 md:px-8 py-8">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <NapoliLogoIcon size={34} />
            <div>
              <div className="font-display font-extrabold text-sm tracking-tight">
                <span className="text-[#01A0E8]">SSC NAPOLI</span>{' '}
                <span className="text-[var(--text-primary)]">DATA</span> ·{' '}
                <span className="text-[#01A0E8]">@sscnapolidata</span>
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                Data Napoli, Napoli Analitica — Zero Dati Inventati · Licenza CC BY-SA 4.0 / Dati CC0
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

      {/* =========================================================================
          DETAILED MATCH DATA STORY MODAL
          Contains the full 1:2 card layout with the Export button ONLY visible here!
          NO favicon/logo icon inside the card.
         ========================================================================= */}
      {detailMatchId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-[var(--bg-primary)] border border-[var(--border-hairline)] max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-10 space-y-8 my-auto">
            {/* Modal Top Bar: Close Button + Primary Export Action */}
            <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-4 sticky top-0 bg-[var(--bg-primary)]/95 backdrop-blur-md z-10">
              <div className="font-display font-extrabold text-base tracking-tight">
                <span className="text-[#01A0E8]">SSC NAPOLI</span>{' '}
                <span className="text-[var(--text-primary)]">DATA</span>
                <span className="ml-3 text-xs font-mono-tabular text-[var(--text-secondary)] font-normal">
                  @sscnapolidata
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* EXPORT BUTTON: Prominently and exclusively available when detail is open */}
                <button
                  onClick={() => setShowExporterModal(true)}
                  className="px-4 py-2 text-xs font-mono-tabular font-bold bg-[#01A0E8] text-[#08090B] hover:bg-[#01A0E8]/90 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'it'
                      ? 'Scarica Scheda 1:2'
                      : 'Download 1:2 Card'}
                  </span>
                </button>

                <button
                  onClick={() => setDetailMatchId(null)}
                  className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-hairline)] hover:border-[#01A0E8] transition-colors cursor-pointer"
                  title={lang === 'it' ? 'Chiudi scheda' : 'Close card'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 1. OVERVIEW — GOALS AND KEY CHANCES (Functional Waveform) */}
            <div>
              <div className="text-xs font-mono-tabular text-[var(--text-secondary)] tracking-wider uppercase mb-3">
                {lang === 'it'
                  ? 'OVERVIEW — GOL E OCCASIONI CHIAVE'
                  : 'OVERVIEW — GOALS AND KEY CHANCES'}
              </div>
              <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-hairline)]">
                <div className="flex items-end justify-between gap-2 h-28 pt-2">
                  {activeDetailMatch.waveformBars.map((bar, idx) => (
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
              <p className="text-[11px] text-[var(--text-secondary)] mt-2.5 leading-relaxed font-mono-tabular">
                {lang === 'it'
                  ? activeDetailMatch.waveformCaptionIt
                  : activeDetailMatch.waveformCaptionEn}
              </p>
            </div>

            {/* 2. MATCH HEADER & SCORE */}
            <div className="pt-2">
              <div className="text-sm font-display font-bold tracking-wide">
                {activeDetailMatch.competition} ·{' '}
                {lang === 'it' ? activeDetailMatch.matchdayIt : activeDetailMatch.matchdayEn}
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5 font-mono-tabular">
                {lang === 'it' ? activeDetailMatch.dateDisplayIt : activeDetailMatch.dateDisplayEn} ·{' '}
                {activeDetailMatch.time}
              </div>
              <div className="text-xs text-[var(--text-secondary)] font-mono-tabular">
                {activeDetailMatch.stadium}, {activeDetailMatch.city}
              </div>

              <div className="flex items-center justify-between mt-7 text-base sm:text-lg font-display font-extrabold tracking-wide">
                <span className={activeDetailMatch.homeTeam === 'NAPOLI' ? 'text-[#01A0E8]' : ''}>
                  {activeDetailMatch.homeTeam}
                </span>
                <span className={activeDetailMatch.awayTeam === 'NAPOLI' ? 'text-[#01A0E8]' : ''}>
                  {activeDetailMatch.awayTeam}
                </span>
              </div>

              <div className="text-center my-4">
                <div className="text-6xl sm:text-7xl font-display font-extrabold tracking-tight tabular-nums">
                  <span className={activeDetailMatch.homeTeam === 'NAPOLI' ? 'text-[#01A0E8]' : ''}>
                    {activeDetailMatch.homeGoals}
                  </span>{' '}
                  <span className="text-[#01A0E8]">-</span>{' '}
                  <span className={activeDetailMatch.awayTeam === 'NAPOLI' ? 'text-[#01A0E8]' : ''}>
                    {activeDetailMatch.awayGoals}
                  </span>
                </div>
                <div className="text-xs font-mono-tabular text-[#01A0E8] tracking-widest mt-2 uppercase font-semibold">
                  ● FULL TIME
                </div>
              </div>
            </div>

            {/* MATCH HIGHLIGHT METADATA: Spettatori, Arbitro, Modulo, Note */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[var(--bg-secondary)] border border-[var(--border-hairline)]">
              {/* Spettatori */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--bg-primary)] border border-[var(--border-hairline)] text-[#01A0E8]">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono-tabular uppercase text-[var(--text-secondary)]">
                    {lang === 'it' ? 'Spettatori Ufficiali' : 'Official Attendance'}
                  </div>
                  <div className="text-xs font-mono-tabular font-bold text-[var(--text-primary)]">
                    {activeDetailMatch.attendance
                      ? `${activeDetailMatch.attendance.toLocaleString()} spettatori`
                      : lang === 'it'
                      ? 'Dato n.d.'
                      : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Arbitro */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--bg-primary)] border border-[var(--border-hairline)] text-[#01A0E8]">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono-tabular uppercase text-[var(--text-secondary)]">
                    {lang === 'it' ? 'Direttore di Gara' : 'Match Referee'}
                  </div>
                  <div className="text-xs font-mono-tabular font-bold text-[var(--text-primary)]">
                    {activeDetailMatch.referee || (lang === 'it' ? 'Arbitro federale' : 'Federal referee')}
                  </div>
                </div>
              </div>

              {/* Assetto Tattico */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--bg-primary)] border border-[var(--border-hairline)] text-[#01A0E8]">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono-tabular uppercase text-[var(--text-secondary)]">
                    {lang === 'it' ? 'Assetto Tattico' : 'System of Play'}
                  </div>
                  <div className="text-xs font-mono-tabular font-bold text-[#01A0E8]">
                    {activeDetailMatch.systemOfPlay || (lang === 'it' ? 'Assetto Base' : 'Standard')}
                  </div>
                </div>
              </div>
            </div>

            {/* Note storiche o eventi di rilievo (se presenti) */}
            {activeDetailMatch.notes && (
              <div className="p-3 bg-[#01A0E8]/10 border border-[#01A0E8]/30 flex items-start gap-2.5 text-xs font-mono-tabular text-[var(--text-primary)]">
                <Sparkles className="w-4 h-4 text-[#01A0E8] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#01A0E8] mr-1">
                    {lang === 'it' ? 'NOTIZIE & NOTE DI RILIEVO:' : 'HIGHLIGHTS & HISTORICAL NOTES:'}
                  </span>
                  <span>{activeDetailMatch.notes}</span>
                </div>
              </div>
            )}

            {/* 3. MATCH SUMMARY */}
            <section className="pt-6 border-t border-[var(--border-hairline)]">
              <h3 className="text-xs font-mono-tabular text-[#01A0E8] font-bold tracking-widest uppercase mb-3">
                {lang === 'it' ? 'SINTESI DELLA PARTITA' : 'MATCH SUMMARY'}
              </h3>
              <p className="text-sm md:text-base leading-relaxed">
                {lang === 'it' ? activeDetailMatch.summaryIt : activeDetailMatch.summaryEn}
              </p>
            </section>

            {/* 4. GOAL TIMELINE */}
            <section className="pt-6 border-t border-[var(--border-hairline)]">
              <h3 className="text-xs font-mono-tabular text-[#01A0E8] font-bold tracking-widest uppercase mb-4">
                {lang === 'it' ? 'SEQUENZA DEI GOL' : 'GOAL TIMELINE'}
              </h3>
              <div className="divide-y divide-[var(--border-hairline)]">
                {activeDetailMatch.goals.map((goal, idx) => (
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
                {lang === 'it' ? 'MOMENTI CHIAVE' : 'KEY MOMENTS'}
              </h3>
              <div className="divide-y divide-[var(--border-hairline)]">
                {activeDetailMatch.keyMoments.map((km, idx) => (
                  <div key={idx} className="py-3 flex items-start gap-4 text-xs font-mono-tabular">
                    <div className="w-12 font-bold shrink-0 text-[#01A0E8]">{km.minute}</div>
                    <div>
                      <div className="font-semibold text-[var(--text-primary)]">
                        {lang === 'it' ? km.titleIt : km.titleEn}
                      </div>
                      <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                        {km.team}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 6. SUBSTITUTIONS */}
            <section className="pt-6 border-t border-[var(--border-hairline)]">
              <h3 className="text-xs font-mono-tabular text-[#01A0E8] font-bold tracking-widest uppercase mb-4">
                {lang === 'it' ? 'SOSTITUZIONI' : 'SUBSTITUTIONS'}
              </h3>
              <div className="divide-y divide-[var(--border-hairline)] text-xs font-mono-tabular">
                {activeDetailMatch.substitutions.map((sub, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="w-10 text-[var(--text-secondary)]">{sub.minute}</span>
                      <span>
                        {sub.playerOut ? (
                          <>
                            <span className="text-[var(--text-secondary)]">{sub.playerOut}</span>{' '}
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
                    <span className="text-[11px] text-[var(--text-secondary)]">{sub.team}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 7. DISCIPLINE & LINEUPS */}
            <section className="pt-6 border-t border-[var(--border-hairline)] space-y-5">
              <div>
                <h3 className="text-xs font-mono-tabular text-[#01A0E8] font-bold tracking-widest uppercase mb-3">
                  {lang === 'it' ? 'DISCIPLINA' : 'DISCIPLINE'}
                </h3>
                <div className="p-4 bg-[var(--bg-secondary)] border border-[#01A0E8]/25 text-xs leading-relaxed text-[var(--text-secondary)] font-mono-tabular">
                  {lang === 'it'
                    ? activeDetailMatch.disciplineNoteIt
                    : activeDetailMatch.disciplineNoteEn}
                </div>
              </div>

              {/* DOSSIER ARBITRO CON IL NAPOLI */}
              {activeDetailMatch.refereeDossier && (
                <div>
                  <h3 className="text-xs font-mono-tabular text-[#01A0E8] font-bold tracking-widest uppercase mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#01A0E8]" />
                    <span>
                      {lang === 'it'
                        ? `DOSSIER ARBITRALE: ${activeDetailMatch.refereeDossier.name}`
                        : `REFEREE DOSSIER: ${activeDetailMatch.refereeDossier.name}`}
                    </span>
                  </h3>
                  <div className="p-4 bg-[var(--bg-secondary)] border border-[#01A0E8]/30 font-mono-tabular text-xs space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                      <span className="font-bold text-[var(--text-primary)]">
                        {activeDetailMatch.refereeDossier.name}
                        {activeDetailMatch.refereeDossier.city && (
                          <span className="text-xs text-[var(--text-secondary)] font-normal ml-2">
                            (Sez. {activeDetailMatch.refereeDossier.city})
                          </span>
                        )}
                      </span>
                      <span className="text-[#01A0E8] font-bold">
                        {activeDetailMatch.refereeDossier.winPct}%{' '}
                        {lang === 'it' ? 'Vittorie Napoli' : 'Napoli Win Rate'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[var(--border-hairline)] text-center text-[11px]">
                      <div className="p-2 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
                        <div className="text-[10px] text-[var(--text-secondary)] uppercase">
                          {lang === 'it' ? 'Gare Dirette' : 'Matches'}
                        </div>
                        <div className="font-bold text-base text-[#01A0E8] mt-0.5">
                          {activeDetailMatch.refereeDossier.matches}
                        </div>
                      </div>
                      <div className="p-2 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
                        <div className="text-[10px] text-[var(--text-secondary)] uppercase">
                          {lang === 'it' ? 'Bilancio V-P-S' : 'Record W-D-L'}
                        </div>
                        <div className="font-bold text-base text-[var(--text-primary)] mt-0.5">
                          {activeDetailMatch.refereeDossier.wins}-
                          {activeDetailMatch.refereeDossier.draws}-
                          {activeDetailMatch.refereeDossier.losses}
                        </div>
                      </div>
                      <div className="p-2 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
                        <div className="text-[10px] text-[var(--text-secondary)] uppercase">
                          {lang === 'it' ? 'Cartellini Napoli' : 'Napoli Cards'}
                        </div>
                        <div className="font-bold text-base text-amber-400 mt-0.5">
                          {activeDetailMatch.refereeDossier.yellowCardsNapoli} 🟨{' '}
                          <span className="text-red-400">
                            {activeDetailMatch.refereeDossier.redCardsNapoli} 🟥
                          </span>
                        </div>
                      </div>
                      <div className="p-2 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
                        <div className="text-[10px] text-[var(--text-secondary)] uppercase">
                          {lang === 'it' ? 'Rigori Concessi' : 'Penalties Awarded'}
                        </div>
                        <div className="font-bold text-base text-emerald-400 mt-0.5">
                          {activeDetailMatch.refereeDossier.penaltiesNapoli}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* RIGORI DECISIVI / SHOOTOUT (SE APPLICABILE) */}
              {activeDetailMatch.shootout && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono-tabular">
                  <div className="text-emerald-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4" />
                    <span>
                      {lang === 'it'
                        ? 'SFIDA DECISA AI CALCI DI RIGORE (SHOOTOUT)'
                        : 'MATCH DECIDED ON PENALTY SHOOTOUT'}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">
                    {lang === 'it' ? 'Esito Finale: ' : 'Final Shootout: '}
                    <span className="text-emerald-400">{activeDetailMatch.shootout.result}</span>
                    <span className="text-[var(--text-secondary)] font-normal ml-2">
                      ({activeDetailMatch.shootout.round})
                    </span>
                  </div>
                </div>
              )}

              {/* FORMAZIONI COMPLETE TITOLARI & PANCHINA */}
              {activeDetailMatch.lineupDetails && (
                <div>
                  <h3 className="text-xs font-mono-tabular text-[#01A0E8] font-bold tracking-widest uppercase mb-3">
                    {lang === 'it'
                      ? 'SCHIERAMENTO & FORMAZIONE UFFICIALE'
                      : 'OFFICIAL MATCH LINE-UP'}
                  </h3>

                  <div className="space-y-4">
                    {/* Titolari (Starting XI) */}
                    <div>
                      <div className="text-[10px] font-mono-tabular text-[var(--text-secondary)] uppercase tracking-wider mb-2 font-bold">
                        {lang === 'it' ? 'TITOLARI (STARTING XI)' : 'STARTING XI'}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono-tabular">
                        {activeDetailMatch.lineupDetails.starters.map((p, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="inline-block w-6 h-6 leading-6 text-center text-xs font-bold bg-[#01A0E8] text-[#08090B]">
                                {p.shirtNumber || idx + 1}
                              </span>
                              <span className="font-semibold text-[var(--text-primary)]">
                                {p.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {p.position && (
                                <span className="text-[10px] text-[var(--text-secondary)] px-1.5 py-0.5 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
                                  {p.position}
                                </span>
                              )}
                              {p.isCaptain && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                                  C
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Panchina (Bench) */}
                    {activeDetailMatch.lineupDetails.bench.length > 0 && (
                      <div>
                        <div className="text-[10px] font-mono-tabular text-[var(--text-secondary)] uppercase tracking-wider mb-2 font-bold">
                          {lang === 'it' ? 'A DISPOSIZIONE / PANCHINA' : 'BENCH / SUBSTITUTES'}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono-tabular">
                          {activeDetailMatch.lineupDetails.bench.map((p, idx) => (
                            <div
                              key={idx}
                              className="p-2 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] flex items-center gap-2 text-[11px]"
                            >
                              <span className="inline-block w-5 h-5 leading-5 text-center text-[10px] font-bold bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-hairline)]">
                                {p.shirtNumber || '-'}
                              </span>
                              <span className="truncate text-[var(--text-primary)]">{p.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xs font-mono-tabular text-[#01A0E8] font-bold tracking-widest uppercase mb-3">
                  {lang === 'it' ? 'NOTE FORMAZIONI & DATI GARA' : 'LINE-UPS & MATCH NOTES'}
                </h3>
                <div className="p-4 bg-[var(--bg-secondary)] border border-[#01A0E8]/25 text-xs leading-relaxed text-[var(--text-secondary)] font-mono-tabular">
                  {lang === 'it'
                    ? activeDetailMatch.lineupsNoteIt
                    : activeDetailMatch.lineupsNoteEn}
                </div>
              </div>
            </section>

            {/* 8. COVERAGE STATUS MAP */}
            <section className="pt-6 border-t border-[var(--border-hairline)]">
              <h3 className="text-xs font-mono-tabular text-[#01A0E8] font-bold tracking-widest uppercase mb-4">
                {lang === 'it'
                  ? 'TABELLA COPERTURA E QUALITÀ DATI (cov)'
                  : 'COVERAGE & DATA QUALITY TABLE (cov)'}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-tabular">
                {Object.entries(activeDetailMatch.cov).map(([field, status]) => (
                  <div
                    key={field}
                    className="p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)]"
                  >
                    <div className="text-[10px] text-[var(--text-secondary)] uppercase">{field}</div>
                    <div
                      className={`font-bold mt-0.5 ${
                        status === 'completo'
                          ? 'text-[#01A0E8]'
                          : status === 'na'
                          ? 'opacity-40'
                          : ''
                      }`}
                    >
                      {formatCoverageLabel(status)}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 9. THE ETERNAL MATCH (LA PARTITA ETERNA) */}
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
                    ? 'Vista Ufficiale: Dal 1° Agosto 1926'
                    : 'Official View: Since 1 Aug 1926'}
                </button>
              </div>

              <div className="text-3xl md:text-4xl font-display font-extrabold tracking-tight">
                NAP <span className="text-[var(--text-secondary)] font-normal">vs</span>{' '}
                {activeDetailMatch.eternalMatch.opponentCode}
              </div>

              <div className="grid grid-cols-4 gap-2 my-4 text-center font-mono-tabular">
                <div className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-hairline)]">
                  <div className="text-[10px] text-[var(--text-secondary)]">
                    {lang === 'it' ? 'GARE' : 'MATCHES'}
                  </div>
                  <div className="text-lg font-bold text-[#01A0E8]">
                    {activeDetailMatch.eternalMatch.officialMatches}
                  </div>
                </div>
                <div className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-hairline)]">
                  <div className="text-[10px] text-[var(--text-secondary)]">
                    {lang === 'it' ? 'VITTORIE NAP' : 'NAP WINS'}
                  </div>
                  <div className="text-lg font-bold">
                    {activeDetailMatch.eternalMatch.napoliWins}
                  </div>
                </div>
                <div className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-hairline)]">
                  <div className="text-[10px] text-[var(--text-secondary)]">
                    {lang === 'it' ? 'PAREGGI' : 'DRAWS'}
                  </div>
                  <div className="text-lg font-bold">
                    {activeDetailMatch.eternalMatch.draws}
                  </div>
                </div>
                <div className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-hairline)]">
                  <div className="text-[10px] text-[var(--text-secondary)]">
                    {lang === 'it' ? 'GOL NAP-OPP' : 'GOALS NAP-OPP'}
                  </div>
                  <div className="text-lg font-bold text-[#01A0E8]">
                    {activeDetailMatch.eternalMatch.napoliGoals}–
                    {activeDetailMatch.eternalMatch.opponentGoals}
                  </div>
                </div>
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-mono-tabular">
                {lang === 'it'
                  ? activeDetailMatch.eternalMatch.pre1926EntitiesNoteIt
                  : activeDetailMatch.eternalMatch.pre1926EntitiesNoteEn}
              </p>
            </section>

            {/* 10. BRANDED FOOTER INSIDE CARD (TYPOGRAPHY ONLY, NO FAVICON ICON) */}
            <footer className="pt-6 border-t border-[var(--border-hairline)] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-display font-extrabold">
                    <span className="text-[#01A0E8]">SSC NAPOLI</span>{' '}
                    <span className="text-[var(--text-primary)]">DATA</span>
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 font-mono-tabular">
                    <span>Napoli Analitica</span>
                    <span>·</span>
                    <span className="text-[#01A0E8] font-semibold">@sscnapolidata</span>
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
                {activeDetailMatch.sources.map((src, i) => (
                  <div key={i}>
                    {lang === 'it' ? 'Fonte' : 'Source'} [{i + 1}]: <strong>{src.label}</strong> — {src.detail}
                    {src.provisionalNoteIt && (
                      <div className="text-[#01A0E8] mt-0.5">
                        {lang === 'it' ? 'Nota Metodologica' : 'Methodological Note'}:{' '}
                        {lang === 'it' ? src.provisionalNoteIt : src.provisionalNoteEn}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </footer>
          </div>
        </div>
      )}

      {/* 1:2 Social Infographic Exporter Modal */}
      {showExporterModal && (
        <InfographicExporterModal
          match={activeDetailMatch}
          lang={lang}
          theme={theme}
          onClose={() => setShowExporterModal(false)}
        />
      )}
    </div>
  );
}
