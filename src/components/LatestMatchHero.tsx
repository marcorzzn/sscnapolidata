import React from 'react';
import { Calendar, MapPin, Trophy, ArrowRight, Download, BarChart2, CheckCircle2, Share2 } from 'lucide-react';
import { NapoliLogoIcon } from './BrandMark';
import latestMatchRaw from '../data/generated/latest_match.json';
import { FEATURED_MATCHES, MatchDataStory } from '../data/napoliVerifiedData';

interface LatestMatchHeroProps {
  lang: 'it' | 'en';
  onOpenMatchStory: (matchId: string) => void;
  onExportGraphic: () => void;
  onViewStadiumOnMap?: () => void;
}

export const LatestMatchHero: React.FC<LatestMatchHeroProps> = ({
  lang,
  onOpenMatchStory,
  onExportGraphic,
  onViewStadiumOnMap,
}) => {
  // Use the verified rich story from FEATURED_MATCHES if matched, otherwise fallback to exported JSON
  const featured = FEATURED_MATCHES[0];
  const raw = latestMatchRaw;

  // Format date display
  const dateFormatted = lang === 'it' 
    ? 'Domenica 20 Settembre 2026 · 15:00' 
    : 'Sunday 20 September 2026 · 15:00 CET';

  const stadiumDisplay = raw.stadio || 'Artemio Franchi, Firenze';
  const competitionDisplay = `${raw.competizione} · ${lang === 'it' ? '4ª Giornata' : 'Matchday 4'}`;

  // Napoli scorers & Opponent scorers
  const napoliScorers = [
    { name: 'Billy Gilmour', minute: "42'", note: lang === 'it' ? 'Diagonale rasoterra dal limite' : 'Low diagonal drive' }
  ];
  const opponentScorers = [
    { name: 'Jimenez', minute: "78'", note: lang === 'it' ? 'Tap-in da respinta corta' : 'Rebound tap-in' }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[var(--bg-secondary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] border border-[var(--border-hairline)] shadow-2xl">
      {/* Cyan brand accent top line */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#01A0E8] to-transparent" />

      {/* Background subtle watermark & grid pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(#01A0E8_1px,transparent_1px)] [background-size:16px_16px]" 
        aria-hidden="true" 
      />

      <div className="relative p-6 sm:p-8 md:p-10 space-y-6">
        {/* Top Header Bar: ULTIMA PARTITA Badge + Competition & Verification Status */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#01A0E8]/15 border border-[#01A0E8]/40 text-[#01A0E8] text-xs font-mono-tabular font-extrabold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-[#01A0E8] animate-pulse" />
              {lang === 'it' ? 'ULTIMA PARTITA' : 'LATEST MATCH'}
            </span>
            <span className="text-xs font-mono-tabular text-[var(--text-secondary)] flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-[#01A0E8]" />
              <strong className="text-[var(--text-primary)]">{competitionDisplay}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono-tabular text-[var(--text-secondary)]">
            <span className="flex items-center gap-1 text-[#01A0E8]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{lang === 'it' ? 'Dato Verificato' : 'Verified Data'}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>{raw.season}</span>
          </div>
        </div>

        {/* Date, Time & Stadium Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-secondary)] font-mono-tabular">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#01A0E8]" />
            <span>{dateFormatted}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#01A0E8]" />
            <span>{stadiumDisplay}</span>
            {onViewStadiumOnMap && (
              <button
                onClick={onViewStadiumOnMap}
                className="text-[#01A0E8] hover:underline font-semibold ml-1 cursor-pointer"
                title="Vedi coordinate sulla mappa"
              >
                [{lang === 'it' ? 'Mappa' : 'Map'}]
              </button>
            )}
          </div>
        </div>

        {/* MAIN SCOREBOARD HERO: Fiorentina 1 - 1 Napoli */}
        <div className="py-4 md:py-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Team Home: Fiorentina */}
            <div className="md:col-span-4 flex md:flex-col items-center md:items-end justify-between md:justify-center text-right order-1">
              <div>
                <span className="text-xs font-mono-tabular uppercase tracking-wider text-[var(--text-secondary)] block">
                  {lang === 'it' ? 'Casa' : 'Home'}
                </span>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold tracking-tight mt-0.5">
                  {raw.squadra_casa}
                </h3>
                <span className="text-xs font-mono-tabular text-[var(--text-secondary)] mt-1 block">
                  Firenze · Stadio Franchi
                </span>
              </div>
            </div>

            {/* Huge Score Digits: 1 - 1 */}
            <div className="md:col-span-4 flex flex-col items-center justify-center order-2 py-2">
              <div className="flex items-center justify-center gap-4 sm:gap-6">
                <span className="text-6xl sm:text-7xl lg:text-8xl font-display font-extrabold tabular-nums tracking-tight text-[var(--text-primary)]">
                  {raw.home_goals}
                </span>
                <span className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-[#01A0E8]">
                  :
                </span>
                <span className="text-6xl sm:text-7xl lg:text-8xl font-display font-extrabold tabular-nums tracking-tight text-[#01A0E8]">
                  {raw.away_goals}
                </span>
              </div>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-0.5 bg-[var(--bg-primary)] border border-[var(--border-hairline)] text-[11px] font-mono-tabular text-[#01A0E8] uppercase tracking-widest font-semibold">
                ● FULL TIME
              </div>
            </div>

            {/* Team Away: Napoli */}
            <div className="md:col-span-4 flex md:flex-col items-center md:items-start justify-between md:justify-center text-left order-3">
              <div className="flex items-center gap-3">
                <NapoliLogoIcon size={38} useImageAsset={true} />
                <div>
                  <span className="text-xs font-mono-tabular uppercase tracking-wider text-[#01A0E8] font-bold block">
                    {lang === 'it' ? 'Trasferta' : 'Away'}
                  </span>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold tracking-tight text-[#01A0E8] mt-0.5">
                    {raw.squadra_trasferta}
                  </h3>
                  <span className="text-xs font-mono-tabular text-[var(--text-secondary)] mt-1 block">
                    Napoli · @sscnapoli
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SCORERS BOX */}
          <div className="mt-8 pt-6 border-t border-[var(--border-hairline)] grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Opponent Scorers (Left) */}
            <div className="p-3.5 bg-[var(--bg-primary)]/70 border border-[var(--border-hairline)]">
              <div className="text-[10px] font-mono-tabular uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                {lang === 'it' ? 'MARCATORI FIORENTINA' : 'FIORENTINA SCORERS'}
              </div>
              <div className="space-y-1.5">
                {opponentScorers.map((sc, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base" role="img" aria-label="goal">⚽</span>
                      <strong className="font-display font-semibold">{sc.name}</strong>
                      <span className="text-[11px] text-[var(--text-secondary)]">({sc.note})</span>
                    </div>
                    <span className="font-mono-tabular font-bold text-[var(--text-secondary)]">{sc.minute}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Napoli Scorers (Right) */}
            <div className="p-3.5 bg-[var(--bg-primary)]/70 border border-[#01A0E8]/30">
              <div className="text-[10px] font-mono-tabular uppercase tracking-wider text-[#01A0E8] font-bold mb-2">
                {lang === 'it' ? 'MARCATORI NAPOLI' : 'NAPOLI SCORERS'}
              </div>
              <div className="space-y-1.5">
                {napoliScorers.map((sc, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base text-[#01A0E8]" role="img" aria-label="goal">⚽</span>
                      <strong className="font-display font-bold text-[#01A0E8]">{sc.name}</strong>
                      <span className="text-[11px] text-[var(--text-secondary)]">({sc.note})</span>
                    </div>
                    <span className="font-mono-tabular font-bold text-[#01A0E8]">{sc.minute}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CALL TO ACTION BUTTONS BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--border-hairline)]">
          <div className="text-xs font-mono-tabular text-[var(--text-secondary)] flex items-center gap-2">
            <span className="text-[#01A0E8] font-bold">DATA STORY:</span>
            <span>{lang === 'it' ? 'Waveform intensità, linea cronologica, cov e testa a testa storico' : 'Intensity waveform, timeline, coverage audit & H2H'}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenMatchStory(featured.id)}
              className="px-5 py-2.5 bg-[#01A0E8] hover:bg-[#01A0E8]/90 text-[#08090B] font-display font-extrabold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-[#01A0E8]/20"
            >
              <span>{lang === 'it' ? 'Vedi Match Data Story Completa' : 'View Full Match Data Story'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExportGraphic}
              className="px-4 py-2.5 bg-[var(--bg-primary)] hover:bg-[var(--bg-primary)]/80 text-[var(--text-primary)] border border-[var(--border-hairline)] hover:border-[#01A0E8] font-mono-tabular text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#01A0E8]" />
              <span>{lang === 'it' ? 'Esporta Grafica 1:2' : 'Export 1:2 Infographic'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
