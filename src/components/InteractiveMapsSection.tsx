import React, { useMemo, useState } from 'react';
import rawAwayStadiums from '../data/generated/mappe_trasferte.json';
import rawNapoliHomes from '../data/generated/mappe_case.json';
import { NapoliLogoIcon } from './BrandMark';

export interface AwayMatch {
  id: number;
  progressivo: number;
  data: string;
  anno: number;
  stagione: string;
  competizione: string;
  casa: string;
  trasferta: string;
  gol_casa: number;
  gol_trasferta: number;
  punteggio: string;
  esito: 'V' | 'N' | 'P';
}

export interface AwayStadiumData {
  id: number;
  stadio: string;
  citta: string;
  lat: number;
  lon: number;
  capienza: number | null;
  inaugurazione: number | null;
  distance_km: number;
  count: number;
  partite: AwayMatch[];
}

export interface NapoliHomeData {
  id: number;
  nome: string;
  tipo: 'stadio' | 'centro_sportivo' | 'sede' | 'ritiro' | 'monumento' | 'altro';
  indirizzo: string | null;
  lat: number;
  lon: number;
  anno_inizio: number | null;
  anno_fine: number | null;
  note: string | null;
  foto_url: string | null;
}

interface InteractiveMapsProps {
  lang: 'it' | 'en';
  initialSubTab?: 'away_progressive' | 'napoli_homes';
}

// High-precision Italy Projection matching official geographic borders
function projectItalyCoords(lat: number, lon: number): { x: number; y: number } {
  const minLat = 36.5;
  const maxLat = 47.2;
  const minLon = 6.4;
  const maxLon = 18.8;
  const x = ((lon - minLon) / (maxLon - minLon)) * 520 + 40;
  const y = ((maxLat - lat) / (maxLat - minLat)) * 600 + 40;
  return { x, y };
}

// High-precision Gulf of Naples Projection
function projectNaplesUrbanCoords(lat: number, lon: number): { x: number; y: number } {
  if (lat > 41.5) {
    if (lat > 45) return { x: 500, y: 78 }; // Dimaro Folgarida
    return { x: 500, y: 145 }; // Castel di Sangro
  }
  const minLat = 40.50;
  const maxLat = 40.95;
  const minLon = 13.90;
  const maxLon = 14.45;
  const x = ((lon - minLon) / (maxLon - minLon)) * 500 + 40;
  const y = ((maxLat - lat) / (maxLat - minLat)) * 380 + 40;
  return { x, y };
}

const ITALY_MAINLAND_PATH = "M 87.4,231.8 L 97.9,229.0 L 108.4,225.0 L 121.4,211.0 L 127.2,202.6 L 146.1,196.4 L 157.8,202.1 L 167.5,203.7 L 177.5,210.5 L 183.8,213.8 L 201.5,226.7 L 204.0,244.7 L 211.5,257.6 L 213.2,279.4 L 228.7,289.5 L 237.9,306.9 L 242.1,308.0 L 264.4,320.4 L 266.5,326.5 L 284.5,344.5 L 301.3,362.4 L 317.6,372.0 L 327.3,373.6 L 340.7,375.9 L 355.8,377.6 L 357.9,390.5 L 361.6,397.2 L 367.5,397.8 L 373.0,396.6 L 378.8,401.7 L 378.8,404.5 L 374.6,408.4 L 372.5,411.8 L 383.9,408.4 L 390.6,405.6 L 399.8,416.8 L 398.5,424.1 L 411.5,434.2 L 427.1,440.9 L 430.8,448.2 L 436.7,471.8 L 448.5,503.7 L 438.4,517.8 L 437.5,531.2 L 429.6,541.9 L 427.9,549.7 L 434.2,559.8 L 445.9,557.0 L 452.6,541.3 L 465.6,527.9 L 466.5,514.4 L 482.8,509.3 L 490.0,495.3 L 490.4,478.5 L 471.1,466.2 L 464.4,458.9 L 469.0,444.9 L 473.2,433.1 L 478.2,423.6 L 493.7,416.8 L 513.9,426.9 L 525.6,440.9 L 541.5,455.0 L 547.4,435.3 L 523.9,407.9 L 497.1,390.5 L 479.1,380.4 L 454.3,369.7 L 438.8,352.3 L 449.7,343.9 L 450.1,338.3 L 442.2,335.5 L 425.8,336.1 L 418.3,334.4 L 400.6,331.6 L 379.7,318.1 L 367.5,305.2 L 357.9,289.5 L 353.7,278.3 L 347.4,258.7 L 341.9,244.7 L 338.2,240.7 L 326.0,235.1 L 313.0,224.5 L 298.7,216.1 L 289.5,208.2 L 283.2,195.9 L 284.9,177.4 L 288.7,165.0 L 286.6,151.0 L 288.7,139.3 L 304.2,133.1 L 318.9,129.7 L 333.5,125.2 L 341.9,119.1 L 349.5,126.9 L 353.7,129.7 L 346.1,79.3 L 308.4,73.6 L 283.2,68.0 L 253.9,51.2 L 211.9,59.6 L 186.8,84.9 L 149.0,93.3 L 100.8,110.1 L 59.7,116.8 L 69.4,135.3 L 52.6,157.8 L 65.2,197.0 L 86.1,225.0 L 87.4,231.8 Z";
const ITALY_SICILY_PATH = "M 427.9,540.2 L 410.7,543.6 L 379.7,552.0 L 359.5,553.6 L 332.3,549.2 L 321.0,545.8 L 311.7,551.4 L 305.5,546.4 L 296.2,554.8 L 292.9,567.1 L 299.6,575.5 L 310.5,579.4 L 341.1,594.6 L 355.4,605.8 L 369.2,608.0 L 379.7,626.0 L 394.4,628.8 L 404.0,631.6 L 412.8,608.0 L 409.9,598.5 L 404.4,583.9 L 413.2,564.3 L 424.1,545.2 L 427.9,540.2 Z";
const ITALY_SARDINIA_PATH = "M 157.0,374.2 L 171.3,380.4 L 170.0,392.1 L 177.5,400.0 L 181.3,424.1 L 177.5,438.1 L 178.4,448.2 L 176.3,471.8 L 170.8,492.5 L 154.1,487.5 L 149.9,500.9 L 134.4,507.7 L 126.0,498.7 L 123.9,477.4 L 126.0,455.0 L 127.2,429.7 L 120.5,412.3 L 115.9,391.0 L 123.9,396.6 L 137.3,392.1 L 157.0,374.2 Z";

const NAPLES_COASTLINE_PATH = "M 85.5,99.1 L 121.8,141.3 L 194.5,175.1 L 203.6,158.2 L 240.0,149.8 L 276.4,154.0 L 280.9,170.9 L 312.7,170.9 L 335.5,148.1 L 358.2,143.0 L 371.8,132.9 L 403.6,131.2 L 440.0,151.5 L 453.6,162.4 L 467.3,179.3 L 540.0,208.9 L 567.3,255.3 L 521.8,280.7 L 476.4,310.2 L 440.0,331.3 L 430.9,356.7";
const NAPLES_CAPRI_PATH = "M 317.3,379.5 L 347.3,371.0 L 367.3,373.6 L 349.1,382.8 L 317.3,379.5";
const NAPLES_ISCHIA_PATH = "M 21.8,217.3 L 67.3,208.9 L 94.5,230.0 L 67.3,251.1 L 21.8,242.7 L 21.8,217.3";
const NAPLES_PROCIDA_PATH = "M 140.0,200.4 L 158.2,192.0 L 167.3,208.9 L 149.1,213.1 L 140.0,200.4";
const NAPLES_VESUVIUS_PATH = "M 503.6,137.1 L 521.8,145.6 L 530.9,154.0 L 512.7,158.2 L 485.5,149.8 L 503.6,137.1";

const SAN_PAOLO_COORDS = projectItalyCoords(40.827967, 14.193008);

export const InteractiveMapsSection: React.FC<InteractiveMapsProps> = ({
  lang,
  initialSubTab = 'away_progressive',
}) => {
  const [subTab, setSubTab] = useState<'away_progressive' | 'napoli_homes'>(initialSubTab);

  // Cast imported JSON data to strongly typed structures
  const awayStadiums = rawAwayStadiums as unknown as AwayStadiumData[];
  const napoliHomes = rawNapoliHomes as unknown as NapoliHomeData[];

  // =========================================================================
  // STATE: MAP 1 (AWAY MATCHES & PROGRESSIVE PINS)
  // =========================================================================
  const [minYear, setMinYear] = useState<number>(1926);
  const [maxYear, setMaxYear] = useState<number>(2026);
  const [selectedStadiumId, setSelectedStadiumId] = useState<number>(
    awayStadiums[0]?.id || 2 // Default: Stadio Olimpico Roma
  );

  // Era filter presets for Map 1
  const setAwayEraPreset = (start: number, end: number) => {
    setMinYear(start);
    setMaxYear(end);
  };

  // Filter away matches dynamically by year range
  const filteredStadiums = useMemo(() => {
    return awayStadiums
      .map((st) => {
        const matchesInRange = st.partite.filter(
          (m) => m.anno >= minYear && m.anno <= maxYear
        );
        return {
          ...st,
          filteredCount: matchesInRange.length,
          filteredPartite: matchesInRange,
        };
      })
      .filter((st) => st.filteredCount > 0)
      .sort((a, b) => b.filteredCount - a.filteredCount);
  }, [awayStadiums, minYear, maxYear]);

  // Overall totals for the active filter
  const totalFilteredMatches = useMemo(() => {
    return filteredStadiums.reduce((acc, st) => acc + st.filteredCount, 0);
  }, [filteredStadiums]);

  const totalFilteredKm = useMemo(() => {
    return filteredStadiums.reduce(
      (acc, st) => acc + st.distance_km * 2 * st.filteredCount,
      0
    );
  }, [filteredStadiums]);

  // Active stadium detail
  const selectedStadium = useMemo(() => {
    return (
      filteredStadiums.find((st) => st.id === selectedStadiumId) ||
      filteredStadiums[0] ||
      null
    );
  }, [filteredStadiums, selectedStadiumId]);

  // Record stats for selected stadium in active range
  const selectedRecord = useMemo(() => {
    if (!selectedStadium) return { v: 0, n: 0, p: 0, gf: 0, gs: 0 };
    let v = 0,
      n = 0,
      p = 0,
      gf = 0,
      gs = 0;
    selectedStadium.filteredPartite.forEach((m) => {
      gf += m.gol_trasferta;
      gs += m.gol_casa;
      if (m.esito === 'V') v++;
      else if (m.esito === 'N') n++;
      else p++;
    });
    return { v, n, p, gf, gs };
  }, [selectedStadium]);

  // =========================================================================
  // STATE: MAP 2 (NAPOLI HOMES & TEMPORAL FILTER)
  // =========================================================================
  const [selectedHomeYear, setSelectedHomeYear] = useState<number>(1987);
  const [selectedHomeType, setSelectedHomeType] = useState<
    'ALL' | 'stadio' | 'centro_sportivo' | 'sede' | 'ritiro' | 'monumento'
  >('ALL');
  const [selectedHomeId, setSelectedHomeId] = useState<number>(napoliHomes[0]?.id || 1);

  // Filter homes active in selected year
  const filteredHomes = useMemo(() => {
    return napoliHomes.filter((loc) => {
      const typeMatches = selectedHomeType === 'ALL' || loc.tipo === selectedHomeType;
      const yearMatches =
        (loc.anno_inizio === null || loc.anno_inizio <= selectedHomeYear) &&
        (loc.anno_fine === null || loc.anno_fine >= selectedHomeYear);
      return typeMatches && yearMatches;
    });
  }, [napoliHomes, selectedHomeYear, selectedHomeType]);

  const activeHomeLocation = useMemo(() => {
    return (
      filteredHomes.find((l) => l.id === selectedHomeId) ||
      filteredHomes[0] ||
      napoliHomes[0]
    );
  }, [filteredHomes, selectedHomeId, napoliHomes]);

  return (
    <div className="space-y-8">
      {/* Top Header & Sub-Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-5">
        <div>
          <div className="text-xs font-mono-tabular text-[#01A0E8] tracking-widest uppercase">
            {lang === 'it'
              ? 'ATLANTE GEOGRAFICO & STORICO CERTIFICATO'
              : 'CERTIFIED GEOGRAPHIC & HISTORICAL ATLAS'}
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight mt-1">
            {subTab === 'away_progressive'
              ? lang === 'it'
                ? 'Mappa delle Trasferte: Puntine Progressive & Fasci di Linee'
                : 'Away Matches Map: Progressive Pins & Trajectory Bundles'
              : lang === 'it'
              ? 'Le "Case" del Napoli: Stadi, Sedi, Centri Sportivi e Ritiri'
              : 'The "Homes" of Napoli: Stadiums, HQs, Training Grounds & Retreats'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('away_progressive')}
            className={`px-4 py-2 text-xs font-bold tracking-wide border transition-colors cursor-pointer whitespace-nowrap ${
              subTab === 'away_progressive'
                ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8]'
                : 'bg-transparent text-[var(--text-primary)] border-[var(--border-hairline)] hover:border-[#01A0E8]'
            }`}
          >
            {lang === 'it' ? '01. Mappa Trasferte (Puntine & Linee)' : '01. Away Travel Map'}
          </button>
          <button
            onClick={() => setSubTab('napoli_homes')}
            className={`px-4 py-2 text-xs font-bold tracking-wide border transition-colors cursor-pointer whitespace-nowrap ${
              subTab === 'napoli_homes'
                ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8]'
                : 'bg-transparent text-[var(--text-primary)] border-[var(--border-hairline)] hover:border-[#01A0E8]'
            }`}
          >
            {lang === 'it' ? '02. Le "Case" del Napoli (Filtro Anno)' : '02. Homes of Napoli'}
          </button>
        </div>
      </div>

      {subTab === 'away_progressive' ? (
        /* =========================================================================
           MAP 1: TRASFERTE PROGRESSIVE (LINEE + PUNTINE CON BADGE NUMERICO)
           ========================================================================= */
        <div className="space-y-6">
          {/* Controls: Presets & Year Slider */}
          <div className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono-tabular text-[#01A0E8] font-semibold">
                  {lang === 'it'
                    ? `FILTRO TEMPORALE TRASFERTE: ${minYear} – ${maxYear}`
                    : `AWAY MATCHES TIME FILTER: ${minYear} – ${maxYear}`}
                </span>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {lang === 'it'
                    ? 'Regola delle puntine progressive: tutte le partite nello stesso stadio/città convergono su una singola puntina con il badge del conteggio e una linea di spessore proporzionale dal San Paolo.'
                    : 'Progressive pin rule: all away trips to the same stadium consolidate into a single pin badge showing the match count and a scaled trajectory line from San Paolo.'}
                </p>
              </div>

              {/* Statistics Counter Chips */}
              <div className="flex items-center gap-6 font-mono-tabular">
                <div>
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    {lang === 'it' ? 'PARTITE FILTRATE' : 'FILTERED MATCHES'}
                  </div>
                  <div className="text-xl font-bold text-[#01A0E8] tabular-nums">
                    {totalFilteredMatches.toLocaleString('it-IT')}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    {lang === 'it' ? 'STADI ATTIVI' : 'ACTIVE STADIUMS'}
                  </div>
                  <div className="text-xl font-bold tabular-nums">
                    {filteredStadiums.length}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    {lang === 'it' ? 'KM PERCORSI A/R' : 'ROUND-TRIP KM'}
                  </div>
                  <div className="text-xl font-bold text-[#01A0E8] tabular-nums">
                    {Math.round(totalFilteredKm).toLocaleString('it-IT')} km
                  </div>
                </div>
              </div>
            </div>

            {/* Historical Era Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-hairline)]">
              <span className="text-xs font-mono-tabular text-[var(--text-secondary)] mr-1">
                {lang === 'it' ? 'PERIODI CHIAVE:' : 'KEY ERAS:'}
              </span>
              {[
                { label: 'Tutta la Storia (1926–2026)', start: 1926, end: 2026 },
                { label: 'Pionieri & Anni \'30-\'50 (1926–1959)', start: 1926, end: 1959 },
                { label: 'Apertura San Paolo & Anni \'70 (1960–1983)', start: 1960, end: 1983 },
                { label: 'Era Maradona & Gloria (1984–1991)', start: 1984, end: 1991 },
                { label: 'Transizione & C (1992–2006)', start: 1992, end: 2006 },
                { label: 'Era De Laurentiis & 3° Scudetto (2007–2026)', start: 2007, end: 2026 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setAwayEraPreset(preset.start, preset.end)}
                  className={`px-2.5 py-1 text-xs font-mono-tabular border transition-colors cursor-pointer ${
                    minYear === preset.start && maxYear === preset.end
                      ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                      : 'bg-transparent text-[var(--text-primary)] border-[var(--border-hairline)] hover:border-[#01A0E8]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Slider Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-mono-tabular mb-1">
                  <span className="text-[var(--text-secondary)]">
                    {lang === 'it' ? 'Anno Inizio' : 'Start Year'}
                  </span>
                  <span className="text-[#01A0E8] font-bold">{minYear}</span>
                </div>
                <input
                  type="range"
                  min={1926}
                  max={maxYear}
                  value={minYear}
                  onChange={(e) => setMinYear(Number(e.target.value))}
                  className="w-full accent-[#01A0E8] cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs font-mono-tabular mb-1">
                  <span className="text-[var(--text-secondary)]">
                    {lang === 'it' ? 'Anno Fine' : 'End Year'}
                  </span>
                  <span className="text-[#01A0E8] font-bold">{maxYear}</span>
                </div>
                <input
                  type="range"
                  min={minYear}
                  max={2026}
                  value={maxYear}
                  onChange={(e) => setMaxYear(Number(e.target.value))}
                  className="w-full accent-[#01A0E8] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Map + Detail Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Vector Map Container */}
            <div className="lg:col-span-7 bg-[#0B0E13] border border-[#01A0E8]/30 p-4 relative flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-2">
                <div className="flex items-center gap-2">
                  <NapoliLogoIcon size={20} />
                  <span className="text-xs font-mono-tabular text-white font-semibold uppercase">
                    STADIO MARADONA ({totalFilteredMatches}) → {filteredStadiums.length} STADI AVVERSARI
                  </span>
                </div>
                <span className="text-[11px] font-mono-tabular text-[#01A0E8]">
                  @sscnapolidata · Linea Geodetica Haversine
                </span>
              </div>

              <svg
                viewBox="0 0 600 680"
                className="w-full h-auto max-h-[580px] select-none"
                role="img"
                aria-label="Mappa delle trasferte con puntine progressive e linee di fascio"
              >
                {/* Subtle Coordinate Grid */}
                {[100, 200, 300, 400, 500, 600].map((gy) => (
                  <line
                    key={`gy-${gy}`}
                    x1={20}
                    y1={gy}
                    x2={580}
                    y2={gy}
                    stroke="rgba(1, 160, 232, 0.08)"
                    strokeWidth="1"
                  />
                ))}
                {[100, 200, 300, 400, 500].map((gx) => (
                  <line
                    key={`gx-${gx}`}
                    x1={gx}
                    y1={20}
                    x2={gx}
                    y2={660}
                    stroke="rgba(1, 160, 232, 0.08)"
                    strokeWidth="1"
                  />
                ))}

                {/* High-Fidelity Cartographic Outline of Italy Peninsula & Alpine Border */}
                <path
                  d={ITALY_MAINLAND_PATH}
                  fill="rgba(1, 160, 232, 0.05)"
                  stroke="#01A0E8"
                  strokeWidth="1.8"
                  strokeOpacity="0.45"
                  className="transition-all"
                />
                {/* Sicily */}
                <path
                  d={ITALY_SICILY_PATH}
                  fill="rgba(1, 160, 232, 0.05)"
                  stroke="#01A0E8"
                  strokeWidth="1.6"
                  strokeOpacity="0.4"
                />
                {/* Sardinia */}
                <path
                  d={ITALY_SARDINIA_PATH}
                  fill="rgba(1, 160, 232, 0.05)"
                  stroke="#01A0E8"
                  strokeWidth="1.6"
                  strokeOpacity="0.4"
                />

                {/* Trajectory Lines from San Paolo to Each Stadium */}
                {filteredStadiums.map((st) => {
                  const target = projectItalyCoords(st.lat, st.lon);
                  const isSelected = selectedStadium?.id === st.id;

                  // Curvature offset towards the Tyrrhenian / Adriatic to create an elegant flight arc
                  const deltaX = target.x - SAN_PAOLO_COORDS.x;
                  const deltaY = target.y - SAN_PAOLO_COORDS.y;
                  const midX = (SAN_PAOLO_COORDS.x + target.x) / 2 - deltaY * 0.12;
                  const midY = (SAN_PAOLO_COORDS.y + target.y) / 2 + deltaX * 0.12;

                  // Scale stroke width and opacity with match count
                  const strokeWidth = isSelected
                    ? 3.2
                    : Math.min(4.5, Math.max(1.2, Math.sqrt(st.filteredCount) * 0.35));
                  const strokeOpacity = isSelected
                    ? 0.95
                    : Math.min(0.85, 0.35 + (st.filteredCount / 100) * 0.45);

                  return (
                    <path
                      key={`line-${st.id}`}
                      d={`M ${SAN_PAOLO_COORDS.x} ${SAN_PAOLO_COORDS.y} Q ${midX} ${midY} ${target.x} ${target.y}`}
                      fill="none"
                      stroke={isSelected ? '#FFFFFF' : '#01A0E8'}
                      strokeWidth={strokeWidth}
                      strokeOpacity={strokeOpacity}
                      className="transition-all duration-300"
                    />
                  );
                })}

                {/* Napoli Home Hub Pin (Stadio Diego Armando Maradona) */}
                <g transform={`translate(${SAN_PAOLO_COORDS.x}, ${SAN_PAOLO_COORDS.y})`}>
                  <circle r={20} fill="rgba(1, 160, 232, 0.22)" />
                  <circle r={12} fill="#01A0E8" stroke="#FFFFFF" strokeWidth="2.5" />
                  <text
                    x={0}
                    y={4}
                    textAnchor="middle"
                    fill="#08090B"
                    fontSize="10"
                    fontWeight="900"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    ★
                  </text>
                  <text
                    x={18}
                    y={4}
                    fill="#FFFFFF"
                    fontSize="11.5"
                    fontWeight="800"
                    fontFamily="Archivo, sans-serif"
                  >
                    SAN PAOLO / MARADONA
                  </text>
                </g>

                {/* Progressive Stadium Pins with Exact Numbered Badges */}
                {filteredStadiums.map((st) => {
                  const coords = projectItalyCoords(st.lat, st.lon);
                  const isSelected = selectedStadium?.id === st.id;
                  const badgeRadius = st.filteredCount >= 100 ? 15 : st.filteredCount >= 10 ? 13 : 11;

                  return (
                    <g
                      key={`pin-${st.id}`}
                      transform={`translate(${coords.x}, ${coords.y})`}
                      onClick={() => setSelectedStadiumId(st.id)}
                      className="cursor-pointer group"
                    >
                      {/* Pulse ring for selected pin */}
                      {isSelected && (
                        <circle
                          r={badgeRadius + 6}
                          fill="none"
                          stroke="#FFFFFF"
                          strokeWidth="1.5"
                          strokeDasharray="4 2"
                        />
                      )}

                      {/* Main Badge Pin in Cyan #01A0E8 */}
                      <circle
                        r={badgeRadius}
                        fill={isSelected ? '#FFFFFF' : '#01A0E8'}
                        stroke="#08090B"
                        strokeWidth="2.5"
                        className="transition-transform duration-200 group-hover:scale-110"
                      />

                      {/* Progressive Counter Number */}
                      <text
                        x={0}
                        y={3.5}
                        textAnchor="middle"
                        fill={isSelected ? '#08090B' : '#FFFFFF'}
                        fontSize={st.filteredCount >= 100 ? '9.5' : '10.5'}
                        fontWeight="900"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {st.filteredCount}
                      </text>

                      {/* City & Match Count Tag */}
                      <rect
                        x={badgeRadius + 4}
                        y={-9}
                        width={st.citta.length * 7.5 + (st.filteredCount >= 100 ? 44 : 36)}
                        height={18}
                        fill="#08090B"
                        stroke={isSelected ? '#FFFFFF' : 'rgba(1, 160, 232, 0.45)'}
                        strokeWidth="1"
                      />
                      <text
                        x={badgeRadius + 8}
                        y={3.5}
                        fill={isSelected ? '#FFFFFF' : '#01A0E8'}
                        fontSize="10"
                        fontWeight="700"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {st.citta} ({st.filteredCount})
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-[#9BA5B4] font-mono-tabular">
                <span>
                  {lang === 'it'
                    ? 'Clicca su una puntina per ispezionare il bilancio e tutte le partite giocate in quello stadio'
                    : 'Click any pin to inspect the head-to-head record and full match list for that stadium'}
                </span>
                <span>LAT 40.8279° N · LON 14.1930° E</span>
              </div>
            </div>

            {/* Stadium Details Panel & Matches List */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-6">
              {selectedStadium && (
                <div className="p-6 bg-[var(--bg-secondary)] border border-[#01A0E8]/40">
                  <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
                    <div>
                      <span className="text-xs font-mono-tabular text-[#01A0E8] uppercase">
                        {lang === 'it' ? 'STADIO AVVERSARIO' : 'AWAY STADIUM'} · {selectedStadium.citta}
                      </span>
                      <h3 className="text-2xl font-display font-extrabold mt-0.5">
                        {selectedStadium.stadio}
                      </h3>
                      <div className="text-xs text-[var(--text-secondary)] font-mono-tabular mt-0.5">
                        {selectedStadium.distance_km} km da Fuorigrotta
                        {selectedStadium.capienza && ` · Capienza: ${selectedStadium.capienza.toLocaleString('it-IT')}`}
                        {selectedStadium.inaugurazione && ` · Inaugurato nel ${selectedStadium.inaugurazione}`}
                      </div>
                    </div>
                    <div className="text-right font-mono-tabular">
                      <div className="text-xs text-[var(--text-secondary)]">
                        {lang === 'it' ? 'PARTITE TOTALI' : 'TOTAL MATCHES'}
                      </div>
                      <div className="text-2xl font-black text-[#01A0E8]">
                        {selectedStadium.filteredCount}
                      </div>
                    </div>
                  </div>

                  {/* W/D/L Balance Badges */}
                  <div className="grid grid-cols-4 gap-2 my-4 text-center font-mono-tabular">
                    <div className="p-2 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
                      <div className="text-[10px] text-[var(--text-secondary)]">
                        {lang === 'it' ? 'VITTORIE' : 'WINS'}
                      </div>
                      <div className="text-base font-bold text-emerald-400">
                        {selectedRecord.v}
                      </div>
                    </div>
                    <div className="p-2 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
                      <div className="text-[10px] text-[var(--text-secondary)]">
                        {lang === 'it' ? 'PAREGGI' : 'DRAWS'}
                      </div>
                      <div className="text-base font-bold text-amber-300">
                        {selectedRecord.n}
                      </div>
                    </div>
                    <div className="p-2 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
                      <div className="text-[10px] text-[var(--text-secondary)]">
                        {lang === 'it' ? 'SCONFITTE' : 'LOSSES'}
                      </div>
                      <div className="text-base font-bold text-rose-400">
                        {selectedRecord.p}
                      </div>
                    </div>
                    <div className="p-2 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
                      <div className="text-[10px] text-[var(--text-secondary)]">GOL (F-S)</div>
                      <div className="text-base font-bold text-[#01A0E8]">
                        {selectedRecord.gf}-{selectedRecord.gs}
                      </div>
                    </div>
                  </div>

                  {/* Chronological Matches Scroll List */}
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {selectedStadium.filteredPartite.map((m) => (
                      <div
                        key={m.id}
                        className="p-3 bg-[var(--bg-primary)] border border-[var(--border-hairline)] flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-mono-tabular text-[#01A0E8] font-semibold text-[11px]">
                            {m.data} · {m.stagione} · {m.competizione}
                          </div>
                          <div className="font-bold text-sm mt-0.5">
                            {m.casa} vs {m.trasferta}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-bold font-mono-tabular border ${
                              m.esito === 'V'
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                : m.esito === 'N'
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                : 'bg-rose-500/20 border-rose-500 text-rose-300'
                            }`}
                          >
                            {m.esito}
                          </span>
                          <span className="text-base font-black font-mono-tabular px-2 py-0.5 border border-[#01A0E8]/35 text-[#01A0E8]">
                            {m.punteggio}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Stadiums Quick Selector Table */}
              <div className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] flex-1">
                <h4 className="text-xs font-mono-tabular text-[#01A0E8] uppercase tracking-wider mb-3">
                  {lang === 'it'
                    ? `CLASSIFICA TRASFERTE (${filteredStadiums.length} STADI)`
                    : `AWAY STADIUMS RANKING (${filteredStadiums.length} STADIUMS)`}
                </h4>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {filteredStadiums.map((st, idx) => (
                    <button
                      key={st.id}
                      onClick={() => setSelectedStadiumId(st.id)}
                      className={`w-full text-left px-3 py-2 border transition-colors flex items-center justify-between text-xs cursor-pointer ${
                        selectedStadium?.id === st.id
                          ? 'bg-[#01A0E8]/15 border-[#01A0E8] font-bold'
                          : 'bg-[var(--bg-primary)] border-[var(--border-hairline)] hover:border-[#01A0E8]/40'
                      }`}
                    >
                      <span className="font-mono-tabular truncate">
                        <span className="text-[var(--text-secondary)] mr-2">#{idx + 1}</span>
                        {st.stadio} ({st.citta})
                      </span>
                      <span className="font-mono-tabular font-bold text-[#01A0E8] shrink-0 ml-2">
                        {st.filteredCount} {st.filteredCount === 1 ? 'gara' : 'gare'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
           MAP 2: LE CASE DEL NAPOLI (FILTRO ANNO & LUOGHI STORICI)
           ========================================================================= */
        <div className="space-y-6">
          {/* Year Slider & Category Selector */}
          <div className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono-tabular text-[#01A0E8] font-semibold">
                  {lang === 'it'
                    ? `ANNO SELEZIONATO: ${selectedHomeYear}`
                    : `SELECTED YEAR: ${selectedHomeYear}`}
                </span>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {lang === 'it'
                    ? 'Muovi il cursore per esplorare quali stadi, sedi storiche, centri sportivi o ritiri erano attivi in quell\'anno.'
                    : 'Slide across the timeline to reveal which stadiums, headquarters, training grounds, or retreats were active in that specific year.'}
                </p>
              </div>

              {/* Quick Year Slider */}
              <div className="flex items-center gap-3 font-mono-tabular">
                <span className="text-xs text-[var(--text-secondary)]">1926</span>
                <input
                  type="range"
                  min={1926}
                  max={2026}
                  value={selectedHomeYear}
                  onChange={(e) => setSelectedHomeYear(Number(e.target.value))}
                  className="w-48 sm:w-64 accent-[#01A0E8] cursor-pointer"
                />
                <span className="text-xs text-[#01A0E8] font-bold">2026</span>
                <span className="text-lg font-black text-[#01A0E8] px-2 py-0.5 border border-[#01A0E8]">
                  {selectedHomeYear}
                </span>
              </div>
            </div>

            {/* Historical Era Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-hairline)]">
              <span className="text-xs font-mono-tabular text-[var(--text-secondary)] mr-1">
                {lang === 'it' ? 'SELEZIONA EPOCA:' : 'SELECT ERA:'}
              </span>
              {[
                { label: '1926 (Fondazione Ascarelli)', year: 1926 },
                { label: '1935 (Stadio Vesuvio)', year: 1935 },
                { label: '1959 (Inaugurazione San Paolo)', year: 1959 },
                { label: '1970 (Era Ferlaino / Carità)', year: 1970 },
                { label: '1987 (1° Scudetto / Soccavo)', year: 1987 },
                { label: '1990 (2° Scudetto & Murales)', year: 1990 },
                { label: '2023 (3° Scudetto & Castel Volturno)', year: 2023 },
              ].map((era) => (
                <button
                  key={era.label}
                  onClick={() => setSelectedHomeYear(era.year)}
                  className={`px-2.5 py-1 text-xs font-mono-tabular border transition-colors cursor-pointer ${
                    selectedHomeYear === era.year
                      ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                      : 'bg-transparent text-[var(--text-primary)] border-[var(--border-hairline)] hover:border-[#01A0E8]'
                  }`}
                >
                  {era.label}
                </button>
              ))}
            </div>

            {/* Type Filter */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-hairline)]">
              <span className="text-xs font-mono-tabular text-[var(--text-secondary)] mr-1">
                {lang === 'it' ? 'TIPOLOGIA:' : 'TYPE:'}
              </span>
              {[
                { id: 'ALL', it: 'Tutti i Luoghi', en: 'All Locations' },
                { id: 'stadio', it: 'Stadi Casalinghi', en: 'Home Stadiums' },
                { id: 'centro_sportivo', it: 'Centri Sportivi', en: 'Training Grounds' },
                { id: 'sede', it: 'Sedi Sociali', en: 'Headquarters' },
                { id: 'ritiro', it: 'Ritiri Precampionato', en: 'Retreats' },
                { id: 'monumento', it: 'Monumenti & Murales', en: 'Monuments' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedHomeType(t.id as any)}
                  className={`px-2.5 py-1 text-xs border transition-colors cursor-pointer ${
                    selectedHomeType === t.id
                      ? 'border-[#01A0E8] text-[#01A0E8] font-bold bg-[#01A0E8]/10'
                      : 'border-[var(--border-hairline)] text-[var(--text-secondary)]'
                  }`}
                >
                  {lang === 'it' ? t.it : t.en}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Cartographic Map of Naples Area */}
            <div className="lg:col-span-7 bg-[#0B0E13] border border-[#01A0E8]/30 p-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-2">
                <span className="text-xs font-mono-tabular text-white font-semibold">
                  {lang === 'it'
                    ? `NAPOLI E DINTORNI NEL ${selectedHomeYear} (${filteredHomes.length} LUOGHI ATTIVI)`
                    : `NAPLES IN ${selectedHomeYear} (${filteredHomes.length} ACTIVE LOCATIONS)`}
                </span>
                <span className="text-[11px] font-mono-tabular text-[#01A0E8]">
                  GOLFO DI NAPOLI · FUORIGROTTA · VOMERO · CHIAIA
                </span>
              </div>

              <svg
                viewBox="0 0 600 460"
                className="w-full h-auto select-none"
                role="img"
                aria-label="Mappa delle Case del Napoli"
              >
                {/* Urban Grid */}
                {[80, 160, 240, 320, 400].map((gy) => (
                  <line
                    key={gy}
                    x1={20}
                    y1={gy}
                    x2={580}
                    y2={gy}
                    stroke="rgba(1, 160, 232, 0.08)"
                    strokeWidth="1"
                  />
                ))}
                {/* Detailed High-Fidelity Gulf of Naples Coastline */}
                <path
                  d={NAPLES_COASTLINE_PATH}
                  fill="none"
                  stroke="#01A0E8"
                  strokeWidth="2.4"
                  strokeOpacity="0.65"
                />
                {/* Capri Island */}
                <path
                  d={NAPLES_CAPRI_PATH}
                  fill="rgba(1, 160, 232, 0.15)"
                  stroke="#01A0E8"
                  strokeWidth="1.5"
                  strokeOpacity="0.7"
                />
                <text x="335" y="395" fill="#01A0E8" fontSize="9" fontFamily="JetBrains Mono, monospace">CAPRI</text>
                {/* Ischia Island */}
                <path
                  d={NAPLES_ISCHIA_PATH}
                  fill="rgba(1, 160, 232, 0.15)"
                  stroke="#01A0E8"
                  strokeWidth="1.5"
                  strokeOpacity="0.7"
                />
                <text x="35" y="235" fill="#01A0E8" fontSize="9" fontFamily="JetBrains Mono, monospace">ISCHIA</text>
                {/* Procida Island */}
                <path
                  d={NAPLES_PROCIDA_PATH}
                  fill="rgba(1, 160, 232, 0.15)"
                  stroke="#01A0E8"
                  strokeWidth="1.5"
                  strokeOpacity="0.7"
                />
                <text x="142" y="185" fill="#01A0E8" fontSize="8" fontFamily="JetBrains Mono, monospace">PROCIDA</text>
                {/* Mount Vesuvius Profile */}
                <path
                  d={NAPLES_VESUVIUS_PATH}
                  fill="rgba(255, 255, 255, 0.05)"
                  stroke="rgba(1, 160, 232, 0.4)"
                  strokeWidth="1.2"
                  strokeDasharray="3 2"
                />
                <text x="490" y="145" fill="rgba(255, 255, 255, 0.4)" fontSize="9" fontFamily="JetBrains Mono, monospace">VESUVIO 1.281m</text>
                <text
                  x={230}
                  y={420}
                  fill="rgba(1, 160, 232, 0.35)"
                  fontSize="13"
                  fontFamily="JetBrains Mono, monospace"
                  letterSpacing="4"
                >
                  GOLFO DI NAPOLI
                </text>

                {/* Inset Box for Summer Retreats (Trentino & Abruzzo) */}
                <rect
                  x={420}
                  y={30}
                  width={155}
                  height={150}
                  fill="rgba(14, 17, 22, 0.9)"
                  stroke="rgba(1, 160, 232, 0.35)"
                  strokeDasharray="4 2"
                />
                <text
                  x={432}
                  y={50}
                  fill="#01A0E8"
                  fontSize="10"
                  fontWeight="700"
                  fontFamily="JetBrains Mono, monospace"
                >
                  RITIRI ESTIVI (ITALIA)
                </text>

                {/* Render Filtered Location Pins */}
                {filteredHomes.map((loc, index) => {
                  const pt = projectNaplesUrbanCoords(loc.lat, loc.lon);
                  const isSelected = activeHomeLocation.id === loc.id;
                  return (
                    <g
                      key={loc.id}
                      transform={`translate(${pt.x}, ${pt.y})`}
                      onClick={() => setSelectedHomeId(loc.id)}
                      className="cursor-pointer group"
                    >
                      {isSelected && (
                        <circle
                          r={16}
                          fill="none"
                          stroke="#FFFFFF"
                          strokeWidth="1.5"
                          strokeDasharray="3 2"
                        />
                      )}
                      <circle
                        r={isSelected ? 12 : 9}
                        fill={isSelected ? '#FFFFFF' : '#01A0E8'}
                        stroke="#08090B"
                        strokeWidth="2"
                        className="transition-transform duration-200 group-hover:scale-110"
                      />
                      <text
                        x={0}
                        y={3.5}
                        textAnchor="middle"
                        fill="#08090B"
                        fontSize="9.5"
                        fontWeight="800"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {index + 1}
                      </text>
                      <text
                        x={14}
                        y={4}
                        fill={isSelected ? '#FFFFFF' : '#01A0E8'}
                        fontSize="10.5"
                        fontWeight="700"
                        fontFamily="Plus Jakarta Sans, sans-serif"
                      >
                        {loc.nome.split('(')[0].trim().slice(0, 24)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Location Detail Card */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-6">
              {activeHomeLocation && (
                <div className="p-6 bg-[var(--bg-secondary)] border border-[#01A0E8]/40">
                  <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
                    <div>
                      <span className="text-xs font-mono-tabular text-[#01A0E8] uppercase">
                        {activeHomeLocation.tipo.replace('_', ' ')}
                      </span>
                      <h3 className="text-xl font-display font-extrabold mt-0.5">
                        {activeHomeLocation.nome}
                      </h3>
                    </div>
                    <span className="text-xs font-mono-tabular px-2.5 py-1 bg-[#01A0E8]/20 border border-[#01A0E8] text-[#01A0E8] font-bold">
                      {activeHomeLocation.anno_inizio || '1926'} – {activeHomeLocation.anno_fine || 'Oggi'}
                    </span>
                  </div>

                  <div className="text-xs text-[var(--text-secondary)] font-mono-tabular mt-2">
                    {activeHomeLocation.indirizzo} ({activeHomeLocation.lat.toFixed(4)}° N, {activeHomeLocation.lon.toFixed(4)}° E)
                  </div>

                  <p className="text-sm leading-relaxed mt-4 text-[var(--text-primary)]">
                    {activeHomeLocation.note}
                  </p>

                  {activeHomeLocation.foto_url && (
                    <div className="mt-4 p-2 bg-[var(--bg-primary)] border border-[var(--border-hairline)] text-center text-xs font-mono-tabular text-[var(--text-secondary)]">
                      Immagine / Archivio: {activeHomeLocation.foto_url}
                    </div>
                  )}
                </div>
              )}

              {/* List of active locations in selected year */}
              <div className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] space-y-2 max-h-72 overflow-y-auto">
                <div className="text-xs font-mono-tabular text-[#01A0E8] uppercase tracking-wider mb-2">
                  {lang === 'it'
                    ? `LUOGHI ATTIVI NEL ${selectedHomeYear} (${filteredHomes.length})`
                    : `ACTIVE PLACES IN ${selectedHomeYear} (${filteredHomes.length})`}
                </div>
                {filteredHomes.map((loc, idx) => (
                  <button
                    key={loc.id}
                    onClick={() => setSelectedHomeId(loc.id)}
                    className={`w-full text-left p-3 border transition-colors flex items-center justify-between gap-2 text-xs cursor-pointer ${
                      activeHomeLocation.id === loc.id
                        ? 'bg-[#01A0E8]/15 border-[#01A0E8] font-bold'
                        : 'bg-[var(--bg-primary)] border-[var(--border-hairline)] hover:border-[#01A0E8]/40'
                    }`}
                  >
                    <span className="truncate">
                      <span className="font-mono-tabular text-[#01A0E8] mr-2">#{idx + 1}</span>
                      {loc.nome}
                    </span>
                    <span className="text-[11px] font-mono-tabular text-[var(--text-secondary)] shrink-0">
                      {loc.anno_inizio || '1926'}–{loc.anno_fine || 'Oggi'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
