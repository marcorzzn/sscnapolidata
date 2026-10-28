import React, { useState } from 'react';
import rawMuseo from '../data/generated/museo.json';
import rawStoria from '../data/generated/storia.json';
import {
  ALMANAC_RECORDS,
  HISTORICAL_ERAS,
  HistoricalEra,
} from '../data/napoliVerifiedData';
import { NapoliLogoIcon } from './BrandMark';

interface HistoryMuseumSectionProps {
  lang: 'it' | 'en';
  initialSubTab?: 'storia_ere' | 'museo_divise' | 'almanacco';
}

interface CimelioData {
  id: number;
  nome: string;
  anno: number | null;
  data_evento: string | null;
  foto_url: string | null;
  descrizione: string;
  custodia_attuale: string | null;
  categoria: string;
}

interface DivisaData {
  id: number;
  anno: number;
  stagione: string;
  tipo_home_away: string;
  foto_url: string | null;
  descrizione: string;
  sponsor_tecnico: string | null;
  sponsor_commerciale: string | null;
  colori: string | null;
}

interface PeriodoData {
  id: number;
  nome: string;
  anno_inizio: number;
  anno_fine: number | null;
  descrizione: string;
  colore_esadecimale: string;
  ordine: number;
}

interface PresidenteData {
  id: number;
  nome: string;
  anno_inizio: number;
  anno_fine: number | null;
  foto_url: string | null;
  note: string | null;
  palmares: string | null;
}

export const HistoryMuseumSection: React.FC<HistoryMuseumSectionProps> = ({
  lang,
  initialSubTab = 'storia_ere',
}) => {
  const [subTab, setSubTab] = useState<'storia_ere' | 'museo_divise' | 'almanacco'>(initialSubTab);

  const dbCimeli = (rawMuseo.cimeli || []) as CimelioData[];
  const dbDivise = (rawMuseo.divise || []) as DivisaData[];
  const dbPeriodi = (rawStoria.periodi_storici || []) as PeriodoData[];
  const dbPresidenti = (rawStoria.presidenti || []) as PresidenteData[];

  // Selection states
  const [selectedPeriodoId, setSelectedPeriodoId] = useState<number>(dbPeriodi[0]?.id || 1);
  const [selectedCimelioId, setSelectedCimelioId] = useState<number>(dbCimeli[0]?.id || 1);
  const [selectedKitFilter, setSelectedKitFilter] = useState<string>('ALL');
  const [selectedAlmanacCat, setSelectedAlmanacCat] = useState<string>('ALL');
  const [modalItem, setModalItem] = useState<{ type: 'cimelio' | 'divisa'; data: any } | null>(null);

  const activePeriodo = dbPeriodi.find((p) => p.id === selectedPeriodoId) || dbPeriodi[0];
  const activeCimelio = dbCimeli.find((c) => c.id === selectedCimelioId) || dbCimeli[0];

  const filteredDivise = selectedKitFilter === 'ALL'
    ? dbDivise
    : selectedKitFilter === 'home'
    ? dbDivise.filter((d) => d.tipo_home_away === 'home')
    : selectedKitFilter === 'away'
    ? dbDivise.filter((d) => d.tipo_home_away === 'away')
    : dbDivise.filter((d) => d.tipo_home_away === 'special' || d.tipo_home_away === 'third');

  const filteredRecords =
    selectedAlmanacCat === 'ALL'
      ? ALMANAC_RECORDS
      : ALMANAC_RECORDS.filter((r) => r.category === selectedAlmanacCat);

  return (
    <div className="space-y-8">
      {/* Sub-navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-5">
        <div>
          <div className="text-xs font-mono-tabular text-[#01A0E8] tracking-widest uppercase">
            {lang === 'it'
              ? 'ENCICLOPEDIA STORICA, SALA MUSEALE & ALMANACCO CERTIFICATO'
              : 'HISTORICAL ENCYCLOPEDIA, MUSEUM HALL & CERTIFIED ALMANAC'}
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight mt-1">
            {subTab === 'storia_ere'
              ? lang === 'it'
                ? 'Sezione Storica: I Periodi e i Grandi Presidenti del Napoli'
                : 'Historical Section: Eras & Legendary Presidents of Napoli'
              : subTab === 'museo_divise'
              ? lang === 'it'
                ? 'Sala Espositiva Museo Digitale & Archivio Storico Divise'
                : 'Digital Museum Exhibition Hall & Historical Kits Archive'
              : lang === 'it'
              ? 'Almanacco Ufficiale: Marcatori, Presenze, Allenatori e Record'
              : 'Official Almanac: Top Scorers, Appearances, Coaches & Records'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSubTab('storia_ere')}
            className={`px-4 py-2 text-xs font-bold tracking-wide border transition-colors cursor-pointer whitespace-nowrap ${
              subTab === 'storia_ere'
                ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8]'
                : 'bg-transparent text-[var(--text-primary)] border-[var(--border-hairline)] hover:border-[#01A0E8]'
            }`}
          >
            {lang === 'it' ? '01. Storia & Presidenti' : '01. History & Presidents'}
          </button>
          <button
            onClick={() => setSubTab('museo_divise')}
            className={`px-4 py-2 text-xs font-bold tracking-wide border transition-colors cursor-pointer whitespace-nowrap ${
              subTab === 'museo_divise'
                ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8]'
                : 'bg-transparent text-[var(--text-primary)] border-[var(--border-hairline)] hover:border-[#01A0E8]'
            }`}
          >
            {lang === 'it' ? '02. Museo & Divise' : '02. Museum & Kits'}
          </button>
          <button
            onClick={() => setSubTab('almanacco')}
            className={`px-4 py-2 text-xs font-bold tracking-wide border transition-colors cursor-pointer whitespace-nowrap ${
              subTab === 'almanacco'
                ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8]'
                : 'bg-transparent text-[var(--text-primary)] border-[var(--border-hairline)] hover:border-[#01A0E8]'
            }`}
          >
            {lang === 'it' ? '03. Almanacco & Record' : '03. Almanac & Records'}
          </button>
        </div>
      </div>

      {/* =========================================================================
          SUBTAB 1: STORIA DEI PERIODI & PRESIDENTI
          ========================================================================= */}
      {subTab === 'storia_ere' && (
        <div className="space-y-8">
          {/* Era Horizontal Card Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {dbPeriodi.map((periodo) => {
              const isSelected = periodo.id === activePeriodo?.id;
              return (
                <button
                  key={periodo.id}
                  onClick={() => setSelectedPeriodoId(periodo.id)}
                  className={`p-4 text-left border transition-colors cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#01A0E8]/15 border-[#01A0E8]'
                      : 'bg-[var(--bg-secondary)] border-[var(--border-hairline)] hover:border-[#01A0E8]/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono-tabular">
                      <span className="text-[#01A0E8] font-bold">
                        {periodo.anno_inizio}–{periodo.anno_fine || 'Oggi'}
                      </span>
                      <span className="text-[var(--text-secondary)]">#{periodo.ordine}</span>
                    </div>
                    <div className="text-sm font-display font-extrabold mt-1.5 line-clamp-2">
                      {periodo.nome}
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[var(--border-hairline)] text-[10px] font-mono-tabular text-[var(--text-secondary)]">
                    {periodo.anno_fine && periodo.anno_fine <= 1926
                      ? 'ORIGINI PRE-FONDAZIONE'
                      : 'ERA UFFICIALE CALCIO NAPOLI'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Period Detail View */}
          {activePeriodo && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 p-6 md:p-8 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-hairline)] pb-4">
                  <div>
                    <span className="text-xs font-mono-tabular text-[#01A0E8]">
                      PERIODO STORICO CERTIFICATO #{activePeriodo.ordine}
                    </span>
                    <h3 className="text-2xl font-display font-extrabold mt-1">
                      {activePeriodo.nome}
                    </h3>
                  </div>
                  <span className="px-3 py-1 font-mono-tabular font-bold text-xs bg-[#01A0E8]/20 border border-[#01A0E8] text-[#01A0E8]">
                    {activePeriodo.anno_inizio} – {activePeriodo.anno_fine || 'Presente'}
                  </span>
                </div>

                <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                  {activePeriodo.descrizione}
                </p>

                <div className="p-4 bg-[var(--bg-primary)] border border-[var(--border-hairline)] flex items-center justify-between font-mono-tabular text-xs">
                  <span className="text-[#01A0E8]">COLORE IDENTIFICATIVO EPOCA:</span>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: activePeriodo.colore_esadecimale }}
                    />
                    <span>{activePeriodo.colore_esadecimale}</span>
                  </div>
                </div>
              </div>

              {/* Presidential Timeline List */}
              <div className="lg:col-span-5 p-6 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
                  <h4 className="text-xs font-mono-tabular text-[#01A0E8] uppercase tracking-wider">
                    {lang === 'it' ? 'I PRESIDENTI DEL NAPOLI' : 'PRESIDENTS OF NAPOLI'}
                  </h4>
                  <span className="text-xs font-mono-tabular text-[var(--text-secondary)]">
                    {dbPresidenti.length} Mandati Registrati
                  </span>
                </div>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {dbPresidenti.map((pres) => (
                    <div
                      key={pres.id}
                      className="p-3 bg-[var(--bg-primary)] border border-[var(--border-hairline)] space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs font-mono-tabular">
                        <span className="font-bold text-white text-sm">{pres.nome}</span>
                        <span className="text-[#01A0E8]">
                          {pres.anno_inizio}–{pres.anno_fine || 'Oggi'}
                        </span>
                      </div>
                      {pres.palmares && (
                        <div className="text-[11px] font-mono-tabular text-amber-300 font-semibold">
                          ★ {pres.palmares}
                        </div>
                      )}
                      {pres.note && (
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          {pres.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SUBTAB 2: SALA MUSEO INTERATTIVA & ARCHIVIO DIVISE
          ========================================================================= */}
      {subTab === 'museo_divise' && (
        <div className="space-y-8">
          {/* Relics Exhibition Hall */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Gallery Grid */}
            <div className="lg:col-span-7 p-6 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3 mb-5">
                  <div>
                    <span className="text-xs font-mono-tabular text-[#01A0E8] uppercase">
                      {lang === 'it'
                        ? 'SALA ESPOSITIVA DEI CIMELI E TROFEI UFFICIALI'
                        : 'OFFICIAL RELICS & TROPHIES EXHIBITION HALL'}
                    </span>
                    <h3 className="text-xl font-display font-bold mt-0.5">
                      {lang === 'it'
                        ? 'I Reperti Sacri della Storia Azzurra'
                        : 'Sacred Relics of Azzurri History'}
                    </h3>
                  </div>
                  <span className="text-xs font-mono-tabular text-[var(--text-secondary)]">
                    {dbCimeli.length} Reperti in Esposizione
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {dbCimeli.map((cim) => {
                    const isSelected = cim.id === activeCimelio?.id;
                    return (
                      <button
                        key={cim.id}
                        onClick={() => setSelectedCimelioId(cim.id)}
                        className={`p-4 text-left border transition-colors cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#01A0E8]/15 border-[#01A0E8]'
                            : 'bg-[var(--bg-primary)] border-[var(--border-hairline)] hover:border-[#01A0E8]/50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-mono-tabular text-[#01A0E8]">
                            <span className="uppercase">{cim.categoria}</span>
                            <span>{cim.anno || 'Storico'}</span>
                          </div>
                          <div className="text-sm font-display font-extrabold mt-1.5">
                            {cim.nome}
                          </div>
                        </div>
                        <div className="mt-3 pt-2 border-t border-[var(--border-hairline)] text-[11px] text-[var(--text-secondary)] font-mono-tabular truncate">
                          {cim.custodia_attuale || 'Bacheca SSC Napoli'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-[var(--border-hairline)] text-xs font-mono-tabular text-[var(--text-secondary)]">
                Clicca su qualsiasi reperto per visualizzare la scheda tecnica museale dettagliata
              </div>
            </div>

            {/* Selected Relic Accession Detail Card */}
            {activeCimelio && (
              <div className="lg:col-span-5 p-6 bg-[#0B0E13] border border-[#01A0E8]/40 text-white flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono-tabular text-[#01A0E8] tracking-widest uppercase">
                    SCHEDA CATALOGRAFICA MUSEALE #{activeCimelio.id} · {activeCimelio.categoria.toUpperCase()}
                  </div>
                  <h3 className="text-2xl font-display font-extrabold mt-1">
                    {activeCimelio.nome}
                  </h3>

                  {/* Showcase Visual Box */}
                  <div className="my-5 h-44 bg-[#08090B] border border-white/10 flex flex-col items-center justify-center relative p-4 text-center">
                    <svg width="84" height="84" viewBox="0 0 100 100" fill="none">
                      <circle cx="50" cy="50" r="42" stroke="rgba(1, 160, 232, 0.3)" strokeWidth="1.5" />
                      <path
                        d="M32 26H68L63 58C61 66 55 70 50 70C45 70 39 66 37 58L32 26Z"
                        stroke="#01A0E8"
                        strokeWidth="2.5"
                        fill="rgba(1, 160, 232, 0.15)"
                      />
                      <path d="M44 70V80H56V70" stroke="#FFFFFF" strokeWidth="2" />
                      <rect x="36" y="80" width="28" height="6" fill="#01A0E8" />
                    </svg>
                    <span className="mt-2 text-[11px] font-mono-tabular text-[#01A0E8]">
                      {activeCimelio.data_evento || `Anno ${activeCimelio.anno}`}
                    </span>
                  </div>

                  <p className="text-sm text-[#D0D7E2] leading-relaxed">
                    {activeCimelio.descrizione}
                  </p>

                  <dl className="mt-5 divide-y divide-white/10 text-xs font-mono-tabular">
                    <div className="py-2 flex justify-between gap-4">
                      <dt className="text-[#9BA5B4]">CUSTODIA ATTUALE</dt>
                      <dd className="text-right text-[#01A0E8] font-bold">
                        {activeCimelio.custodia_attuale || 'Archivio Storico SSC Napoli'}
                      </dd>
                    </div>
                    <div className="py-2 flex justify-between gap-4">
                      <dt className="text-[#9BA5B4]">DATA DI RIFERIMENTO</dt>
                      <dd className="text-right text-white">
                        {activeCimelio.data_evento || activeCimelio.anno}
                      </dd>
                    </div>
                    <div className="py-2 flex justify-between gap-4">
                      <dt className="text-[#9BA5B4]">CATEGORIA REPERTO</dt>
                      <dd className="text-right text-white uppercase">
                        {activeCimelio.categoria}
                      </dd>
                    </div>
                  </dl>
                </div>

                <button
                  onClick={() => setModalItem({ type: 'cimelio', data: activeCimelio })}
                  className="mt-6 w-full py-2.5 bg-[#01A0E8] text-[#08090B] font-mono-tabular font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-white transition-colors"
                >
                  Apri Scheda Reperto ad Alta Risoluzione
                </button>
              </div>
            )}
          </div>

          {/* Historical Kit Archive (Archivio Storico Divise) */}
          <div className="p-6 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-4">
              <div>
                <span className="text-xs font-mono-tabular text-[#01A0E8] uppercase">
                  {lang === 'it'
                    ? 'ARCHIVIO STORICO DELLE DIVISE UFFICIALI'
                    : 'OFFICIAL MATCH KITS HISTORICAL ARCHIVE'}
                </span>
                <h3 className="text-xl font-display font-bold mt-0.5">
                  {lang === 'it'
                    ? 'Evoluzione delle Maglie Iconiche (1986 – 2023)'
                    : 'Evolution of Iconic Kits (1986 – 2023)'}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'ALL', it: 'Tutte le Divise', en: 'All Kits' },
                  { id: 'home', it: 'Solo Casa (Home)', en: 'Home Only' },
                  { id: 'away', it: 'Solo Trasferta (Away)', en: 'Away Only' },
                  { id: 'special', it: 'Speciali & Third', en: 'Special & Third' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedKitFilter(f.id)}
                    className={`px-3 py-1 text-xs font-mono-tabular border transition-colors cursor-pointer ${
                      selectedKitFilter === f.id
                        ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                        : 'border-[var(--border-hairline)] text-[var(--text-secondary)] hover:border-[#01A0E8]'
                    }`}
                  >
                    {lang === 'it' ? f.it : f.en}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredDivise.map((divisa) => (
                <div
                  key={divisa.id}
                  onClick={() => setModalItem({ type: 'divisa', data: divisa })}
                  className="p-5 bg-[var(--bg-primary)] border border-[var(--border-hairline)] hover:border-[#01A0E8] transition-colors cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono-tabular">
                      <span className="text-[#01A0E8] font-bold">
                        {divisa.stagione || divisa.anno}
                      </span>
                      <span className="uppercase text-[10px] px-1.5 py-0.5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)]">
                        {divisa.tipo_home_away}
                      </span>
                    </div>

                    {/* Geometric Shirt Icon Representation */}
                    <div className="my-4 py-6 bg-[#0B0E13] border border-white/10 flex flex-col items-center justify-center">
                      <svg width="84" height="76" viewBox="0 0 100 90" fill="none">
                        <path
                          d="M30 14L12 28L20 44L30 38V82H70V38L80 44L88 28L70 14H60L50 24L40 14H30Z"
                          fill={divisa.tipo_home_away === 'away' ? '#FFFFFF' : '#01A0E8'}
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />
                        {divisa.sponsor_commerciale && (
                          <text
                            x="50"
                            y="52"
                            textAnchor="middle"
                            fill={divisa.tipo_home_away === 'away' ? '#01A0E8' : '#FFFFFF'}
                            fontSize="9"
                            fontWeight="800"
                            fontFamily="JetBrains Mono, monospace"
                          >
                            {divisa.sponsor_commerciale.split(' ')[0]}
                          </text>
                        )}
                      </svg>
                      <span className="mt-2 text-[10px] font-mono-tabular text-[#9BA5B4]">
                        {divisa.sponsor_tecnico || 'Ufficiale'}
                      </span>
                    </div>

                    <div className="text-sm font-bold mt-1 line-clamp-2">
                      {divisa.descrizione.slice(0, 75)}...
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between text-xs font-mono-tabular">
                    <span className="text-[#01A0E8]">{divisa.sponsor_commerciale || 'Nessun sponsor'}</span>
                    <span className="text-[var(--text-secondary)] text-[11px]">Dettagli →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBTAB 3: ALMANACCO & RECORD
          ========================================================================= */}
      {subTab === 'almanacco' && (
        <div className="space-y-6">
          <div className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-mono-tabular text-[#01A0E8] uppercase tracking-wider">
              {lang === 'it' ? 'ALMANACCO UFFICIALE & RECORD' : 'OFFICIAL ALMANAC & RECORDS'}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'ALL', it: 'Tutti', en: 'All' },
                { id: 'marcatori', it: 'Marcatori All-Time', en: 'Top Scorers' },
                { id: 'presenze', it: 'Presenze All-Time', en: 'Appearances' },
                { id: 'allenatori', it: 'Allenatori', en: 'Coaches' },
                { id: 'primati', it: 'Primati Squadra', en: 'Club Records' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedAlmanacCat(c.id)}
                  className={`px-3 py-1 text-xs font-mono-tabular border transition-colors cursor-pointer ${
                    selectedAlmanacCat === c.id
                      ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                      : 'border-[var(--border-hairline)] text-[var(--text-secondary)] hover:border-[#01A0E8]'
                  }`}
                >
                  {lang === 'it' ? c.it : c.en}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRecords.map((rec) => (
              <div
                key={rec.id}
                className="p-5 bg-[var(--bg-primary)] border border-[var(--border-hairline)] flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-mono-tabular text-[#01A0E8] uppercase">
                    {rec.category.toUpperCase()}
                  </div>
                  <h4 className="text-lg font-display font-extrabold mt-1">
                    {lang === 'it' ? rec.titleIt : rec.titleEn}
                  </h4>
                  <div className="my-3 text-3xl font-display font-black text-[#01A0E8] font-mono-tabular">
                    {rec.recordValue}
                  </div>
                  <div className="text-sm font-bold text-white">{rec.holder}</div>
                  <div className="text-xs text-[var(--text-secondary)] font-mono-tabular mt-0.5">
                    {rec.period}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[var(--border-hairline)] text-xs text-[var(--text-secondary)]">
                  {lang === 'it' ? rec.contextIt : rec.contextEn}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          INTERACTIVE POPUP MODAL FOR CIMELI & DIVISE
          ========================================================================= */}
      {modalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0B0E13] border border-[#01A0E8] max-w-xl w-full p-6 text-white space-y-4 relative">
            <button
              onClick={() => setModalItem(null)}
              className="absolute top-4 right-4 text-[#9BA5B4] hover:text-white font-mono-tabular text-sm cursor-pointer"
            >
              [CHIUDI ✕]
            </button>

            <div className="text-xs font-mono-tabular text-[#01A0E8] tracking-widest uppercase">
              {modalItem.type === 'cimelio' ? 'REPERTO STORICO MUSEALE' : 'DIVISA UFFICIALE SSC NAPOLI'}
            </div>

            <h3 className="text-2xl font-display font-black">
              {modalItem.type === 'cimelio'
                ? modalItem.data.nome
                : `${modalItem.data.stagione || modalItem.data.anno} · ${modalItem.data.tipo_home_away.toUpperCase()}`}
            </h3>

            <p className="text-sm text-[#D0D7E2] leading-relaxed">
              {modalItem.data.descrizione}
            </p>

            <div className="p-4 bg-[#08090B] border border-white/10 font-mono-tabular text-xs space-y-2">
              {modalItem.type === 'cimelio' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-[#9BA5B4]">Data Evento:</span>
                    <span className="text-white font-bold">{modalItem.data.data_evento || modalItem.data.anno}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9BA5B4]">Custodia:</span>
                    <span className="text-[#01A0E8] font-bold">{modalItem.data.custodia_attuale}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9BA5B4]">Categoria:</span>
                    <span className="text-white uppercase">{modalItem.data.categoria}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-[#9BA5B4]">Sponsor Tecnico:</span>
                    <span className="text-white font-bold">{modalItem.data.sponsor_tecnico || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9BA5B4]">Sponsor Commerciale:</span>
                    <span className="text-[#01A0E8] font-bold">{modalItem.data.sponsor_commerciale || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9BA5B4]">Colori Ufficiali:</span>
                    <span className="text-white">{modalItem.data.colori}</span>
                  </div>
                </>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setModalItem(null)}
                className="px-5 py-2 bg-[#01A0E8] text-[#08090B] font-mono-tabular font-bold text-xs uppercase cursor-pointer hover:bg-white transition-colors"
              >
                Chiudi Scheda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
