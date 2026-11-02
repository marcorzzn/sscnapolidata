import React, { useState } from 'react';
import rawMuseo from '../data/generated/museo.json';
import rawStoria from '../data/generated/storia.json';
import rawHeritage from '../data/generated/club_heritage_culture.json';
import {
  ALMANAC_RECORDS,
  HISTORICAL_ERAS,
  HistoricalEra,
} from '../data/napoliVerifiedData';
import { NapoliLogoIcon } from './BrandMark';
import {
  Compass,
  Trophy,
  Shield,
  MapPin,
  Clock,
  Calendar,
  Sparkles,
  Flame,
  Award,
} from 'lucide-react';

interface HistoryMuseumSectionProps {
  lang: 'it' | 'en';
  initialSubTab?: 'pionieri_radici' | 'storia_ere' | 'museo_divise' | 'sponsor_storia' | 'maglia_10_numeri' | 'centri_ritiri' | 'derby_rivalita' | 'stemmi_simboli';
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

export const HistoryMuseumSection: React.FC<HistoryMuseumSectionProps> = ({
  lang,
  initialSubTab = 'pionieri_radici',
}) => {
  const [subTab, setSubTab] = useState<
    'pionieri_radici' | 'storia_ere' | 'museo_divise' | 'sponsor_storia' | 'maglia_10_numeri' | 'centri_ritiri' | 'derby_rivalita' | 'stemmi_simboli'
  >(initialSubTab);

  const dbCimeli = (rawMuseo.cimeli || []) as CimelioData[];
  const dbDivise = (rawMuseo.divise || []) as DivisaData[];
  const dbPeriodi = (rawStoria.periodi_storici || []) as PeriodoData[];
  const heritagePresidents = rawHeritage.presidents || [];
  const pioneers = rawHeritage.pioneers || [];
  const pioneerClubs = rawHeritage.pioneer_clubs || [];
  const pioneerGrounds = rawHeritage.pioneer_grounds || [];
  const pioneerMatches = rawHeritage.pioneer_matches || [];
  const nauticalClubs = rawHeritage.nautical_clubs || [];
  const facilities = rawHeritage.facilities || [];
  const camps = rawHeritage.camps || [];
  const derbies = rawHeritage.derbies || [];
  const retiredNumbers = rawHeritage.retired_numbers || [];
  const sponsors = rawHeritage.sponsors || [];
  const symbols = rawHeritage.symbols || [];

  // Selection states
  const [selectedPeriodoId, setSelectedPeriodoId] = useState<number>(dbPeriodi[0]?.id || 1);
  const [selectedCimelioId, setSelectedCimelioId] = useState<number>(dbCimeli[0]?.id || 1);
  const [selectedKitFilter, setSelectedKitFilter] = useState<string>('ALL');
  const [modalItem, setModalItem] = useState<{ type: 'cimelio' | 'divisa'; data: any } | null>(null);

  const activePeriodo = dbPeriodi.find((p) => p.id === selectedPeriodoId) || dbPeriodi[0];
  const activeCimelio = dbCimeli.find((c) => c.id === selectedCimelioId) || dbCimeli[0];

  const filteredDivise =
    selectedKitFilter === 'ALL'
      ? dbDivise
      : selectedKitFilter === 'home'
      ? dbDivise.filter((d) => d.tipo_home_away === 'home')
      : selectedKitFilter === 'away'
      ? dbDivise.filter((d) => d.tipo_home_away === 'away')
      : dbDivise.filter((d) => d.tipo_home_away === 'special' || d.tipo_home_away === 'third');

  return (
    <div className="space-y-8">
      {/* Sub-navigation Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border-hairline)] pb-5">
        <div>
          <div className="text-xs font-mono-tabular text-[#01A0E8] tracking-widest uppercase font-bold">
            {lang === 'it'
              ? 'PATRIMONIO STORICO, SALA MUSEALE & IDENTITÀ CULTURALE'
              : 'HISTORICAL HERITAGE, DIGITAL MUSEUM & CULTURAL IDENTITY'}
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight mt-1">
            {subTab === 'pionieri_radici'
              ? lang === 'it'
                ? 'I Pionieri e le Radici Pre-1926 (Dal 1904 al 1° Agosto 1926)'
                : 'The Pioneers & Pre-1926 Roots (From 1904 to 1 Aug 1926)'
              : subTab === 'storia_ere'
              ? lang === 'it'
                ? 'I Periodi Storici e i 34 Presidenti del Club'
                : 'Historical Eras & 34 Club Presidents'
              : subTab === 'museo_divise'
              ? lang === 'it'
                ? 'Sala Espositiva Cimeli e Divise Storiche'
                : 'Museum Exhibition Hall & Historical Kits'
              : subTab === 'sponsor_storia'
              ? lang === 'it'
                ? 'Cronologia Sponsor Tecnici e Commerciali (45 Stagioni)'
                : 'Technical & Commercial Sponsors (45 Seasons)'
              : subTab === 'maglia_10_numeri'
              ? lang === 'it'
                ? 'La Maglia N° 10 di Diego e i Numeri di Maglia'
                : 'Maradona Retired #10 Jersey & Shirt Numbers'
              : subTab === 'centri_ritiri'
              ? lang === 'it'
                ? 'Centri Tecnici (Soccavo Paradiso) e Sedi dei Ritiri'
                : 'Technical Facilities & Preseason Training Camps'
              : subTab === 'derby_rivalita'
              ? lang === 'it'
                ? 'Derby del Sole, Tradizione e Rivalità Storiche'
                : 'Derby del Sole, Tradition & Historical Rivalries'
              : lang === 'it'
              ? 'Evoluzione Storica degli Stemmi e Simboli Ufficiali'
              : 'Historical Evolution of Official Crests & Symbols'}
          </h2>
        </div>

        {/* Tab switcher buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono-tabular">
          {[
            { id: 'pionieri_radici', label: lang === 'it' ? '01. Pionieri (1904-26)' : '01. Pioneers (1904-26)' },
            { id: 'storia_ere', label: lang === 'it' ? '02. Ere & 34 Presidenti' : '02. Eras & Presidents' },
            { id: 'museo_divise', label: lang === 'it' ? '03. Cimeli & Divise' : '03. Museum & Kits' },
            { id: 'sponsor_storia', label: lang === 'it' ? '04. Sponsor (45 Anni)' : '04. Sponsors History' },
            { id: 'maglia_10_numeri', label: lang === 'it' ? '05. Maglia 10 D10S' : '05. #10 Retired Shirt' },
            { id: 'centri_ritiri', label: lang === 'it' ? '06. Soccavo & Ritiri' : '06. Facilities & Camps' },
            { id: 'derby_rivalita', label: lang === 'it' ? '07. Derby & Rivalità' : '07. Derbies & Rivalries' },
            { id: 'stemmi_simboli', label: lang === 'it' ? '08. Stemmi & Simboli' : '08. Crests & Symbols' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id as any)}
              className={`px-3 py-1.5 whitespace-nowrap border transition-colors cursor-pointer ${
                subTab === t.id
                  ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-hairline)] hover:border-[#01A0E8] hover:text-[var(--text-primary)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          SUBTAB 1: PIONIERI & RADICI PRE-1926 (1904–1926)
         ========================================================================= */}
      {subTab === 'pionieri_radici' && (
        <div className="space-y-8">
          {/* Historical intro */}
          <div className="p-6 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono-tabular text-[#01A0E8] font-bold uppercase">
              <Compass className="w-4 h-4" />
              <span>RADICI GENETICHE DEL CALCIO PARTENOPEO</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              La fondazione della moderna Società Sportiva Calcio Napoli (1° agosto 1926 ad opera dell'industriale
              <strong> Giorgio Ascarelli</strong>) è il punto di arrivo di oltre vent'anni di pionierismo calcistico
              iniziato alla fine del 1904 al porto di Napoli da <strong>William Poths</strong> e <strong>Hector Bayon</strong> con marinai inglesi
              della <em>Cunard Line</em>, proseguito con il <strong>Naples Foot-Ball Club</strong>, l'<strong>Unione Sportiva Internazionale</strong>
              e la fusione nel <strong>Foot-Ball Club Internaples</strong> (1922).
            </p>
          </div>

          {/* 1. I 5 Grandi Fondatori */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono-tabular text-[#01A0E8] uppercase tracking-widest font-bold">
              I PIONIERI FONDATORI (1904 – 1926)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pioneers.map((p: any) => (
                <div key={p.figure_id} className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono-tabular">
                      <span className="text-[#01A0E8] font-bold">{p.role_in_football}</span>
                      <span className="text-[var(--text-secondary)]">{p.period_active}</span>
                    </div>
                    <div className="text-xl font-display font-extrabold mt-1 text-[var(--text-primary)]">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)] font-mono-tabular mt-0.5">
                      Nazionalità: {p.nationality}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-3 leading-relaxed">
                      {p.biography_details}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[var(--border-hairline)] text-[11px] text-[#01A0E8] font-mono-tabular">
                    Impatto: {p.heritage_and_impact}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. I Club Pionieri */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono-tabular text-[#01A0E8] uppercase tracking-widest font-bold">
              I CLUB ANTENATI E LE FUSIONI STORICHE
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pioneerClubs.map((club: any) => (
                <div key={club.club_id} className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] space-y-3 text-xs font-mono-tabular">
                  <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-2">
                    <span className="text-base font-display font-bold text-[var(--text-primary)]">
                      {club.club_name}
                    </span>
                    <span className="text-[#01A0E8] font-bold">
                      {club.foundation_year} – {club.dissolution_year || '1926'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--text-secondary)]">
                    <div>Colori: <strong className="text-[var(--text-primary)]">{club.colors}</strong></div>
                    <div>Campo: <strong className="text-[var(--text-primary)]">{club.home_ground}</strong></div>
                    <div className="col-span-2">Fondatori: {club.founders}</div>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-2 border-t border-[var(--border-hairline)]">
                    {club.history_and_notes}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Campi Pionieri e Radici Nautiche */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] space-y-3 text-xs font-mono-tabular">
              <h4 className="text-xs font-bold text-[#01A0E8] uppercase tracking-wider">
                CAMPI DA GIOCO STORICI (1904–1926)
              </h4>
              <div className="space-y-3">
                {pioneerGrounds.map((g: any) => (
                  <div key={g.ground_id} className="p-3 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
                    <div className="font-bold text-sm text-[var(--text-primary)]">{g.ground_name}</div>
                    <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">{g.location} ({g.period_active})</div>
                    <div className="text-[11px] text-[var(--text-secondary)] mt-1">{g.key_events}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] space-y-3 text-xs font-mono-tabular">
              <h4 className="text-xs font-bold text-[#01A0E8] uppercase tracking-wider">
                CIRCOLI NAUTICI E RADICI MARINARE
              </h4>
              <div className="space-y-3">
                {nauticalClubs.map((nc: any) => (
                  <div key={nc.entry_id} className="p-3 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
                    <div className="font-bold text-sm text-[var(--text-primary)]">{nc.club_name} (Fondata nel {nc.foundation_year})</div>
                    <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">{nc.location}</div>
                    <div className="text-xs text-[var(--text-secondary)] mt-1.5 leading-snug">{nc.napoli_calcio_connection}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBTAB 2: STORIA ERE & 34 PRESIDENTI
         ========================================================================= */}
      {subTab === 'storia_ere' && (
        <div className="space-y-8">
          {/* Era Selector Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {dbPeriodi.map((periodo) => (
              <button
                key={periodo.id}
                onClick={() => setSelectedPeriodoId(periodo.id)}
                className={`p-3 text-left border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedPeriodoId === periodo.id
                    ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold shadow-md'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-hairline)] hover:border-[#01A0E8]'
                }`}
              >
                <div className="font-mono-tabular text-[10px] opacity-75">
                  {periodo.anno_inizio}–{periodo.anno_fine || 'Oggi'}
                </div>
                <div className="font-display font-extrabold text-xs mt-1 leading-tight line-clamp-2">
                  {periodo.nome}
                </div>
              </button>
            ))}
          </div>

          {/* Active Era Detail */}
          {activePeriodo && (
            <div className="p-6 md:p-8 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-4">
                <div>
                  <div className="text-xs font-mono-tabular text-[#01A0E8] uppercase tracking-wider">
                    PERIODO STORICO CERTIFICATO #{activePeriodo.ordine}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-display font-extrabold mt-1">
                    {activePeriodo.nome}
                  </h3>
                </div>
                <span className="px-3 py-1 bg-[var(--bg-primary)] border border-[var(--border-hairline)] font-mono-tabular text-sm font-bold text-[#01A0E8]">
                  {activePeriodo.anno_inizio} – {activePeriodo.anno_fine || 'In Corso'}
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {activePeriodo.descrizione}
              </p>
            </div>
          )}

          {/* Tutti i 34 Presidenti del Club */}
          <div className="space-y-4 pt-4 border-t border-[var(--border-hairline)]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono-tabular text-[#01A0E8] uppercase tracking-widest font-bold">
                CRONOLOGIA COMPLETA DEI 34 PRESIDENTI (1926 – 2026)
              </h3>
              <span className="text-[11px] font-mono-tabular text-[var(--text-secondary)]">
                Da Giorgio Ascarelli ad Aurelio De Laurentiis
              </span>
            </div>

            <div className="bg-[var(--bg-secondary)] border border-[var(--border-hairline)] overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono-tabular">
                <thead>
                  <tr className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)] bg-[var(--bg-primary)]/40">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Presidente</th>
                    <th className="py-3 px-4">Mandato</th>
                    <th className="py-3 px-4">Stagioni Guidate</th>
                    <th className="py-3 px-4">Palmarès & Trofei</th>
                    <th className="py-3 px-4">Note Storiche & Mandato</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-hairline)]">
                  {heritagePresidents.map((pr: any, idx: number) => (
                    <tr key={pr.president_id || idx} className="hover:bg-[var(--bg-primary)]/70">
                      <td className="py-3 px-4 text-center text-[#01A0E8] font-bold">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-bold text-sm text-[var(--text-primary)] whitespace-nowrap">
                        {pr.name}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-[var(--text-secondary)]">
                        {pr.tenure_start} → {pr.tenure_end || 'In carica'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">{pr.seasons || 'n.d.'}</td>
                      <td className="py-3 px-4 font-semibold text-[#01A0E8] whitespace-nowrap">
                        {pr.trophies_won || '—'}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)] text-[11px] leading-snug">
                        {pr.notes_and_events || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBTAB 3: MUSEO & DIVISE
         ========================================================================= */}
      {subTab === 'museo_divise' && (
        <div className="space-y-10">
          {/* Cimeli Storici */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono-tabular text-[#01A0E8] uppercase tracking-widest font-bold">
              REPERTI E CIMELI STORICI DEL MUSEO
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dbCimeli.map((cimelio) => (
                <div
                  key={cimelio.id}
                  onClick={() => setModalItem({ type: 'cimelio', data: cimelio })}
                  className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] hover:border-[#01A0E8] transition-colors cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono-tabular">
                      <span className="text-[#01A0E8] font-bold">{cimelio.data_evento || cimelio.anno}</span>
                      <span className="text-[10px] uppercase text-[var(--text-secondary)] px-1.5 py-0.5 border border-[var(--border-hairline)]">
                        {cimelio.categoria}
                      </span>
                    </div>
                    <div className="font-display font-extrabold text-base mt-2">{cimelio.nome}</div>
                    <p className="text-xs text-[var(--text-secondary)] mt-2 line-clamp-3 leading-relaxed">
                      {cimelio.descrizione}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between text-xs font-mono-tabular text-[var(--text-secondary)]">
                    <span>Custodia: {cimelio.custodia_attuale || 'Archivio'}</span>
                    <span className="text-[#01A0E8]">Scheda →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Divise */}
          <div className="space-y-4 pt-6 border-t border-[var(--border-hairline)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-xs font-mono-tabular text-[#01A0E8] uppercase tracking-widest font-bold">
                DIVISE ICONICHE NELLA STORIA
              </h3>
              <div className="flex items-center gap-2 text-xs font-mono-tabular">
                {['ALL', 'home', 'away', 'special'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelectedKitFilter(f)}
                    className={`px-2.5 py-1 border cursor-pointer ${
                      selectedKitFilter === f
                        ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                        : 'border-[var(--border-hairline)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredDivise.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setModalItem({ type: 'divisa', data: d })}
                  className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] hover:border-[#01A0E8] transition-colors cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono-tabular">
                      <span className="text-[#01A0E8] font-bold">{d.stagione || d.anno}</span>
                      <span className="text-[10px] uppercase text-[var(--text-secondary)]">{d.tipo_home_away}</span>
                    </div>
                    <div className="my-3 py-5 bg-[var(--bg-primary)] border border-[var(--border-hairline)] flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-[#01A0E8] font-mono-tabular">
                        {d.sponsor_commerciale || 'AZZURRO'}
                      </span>
                      <span className="text-[10px] text-[var(--text-secondary)] mt-1">{d.sponsor_tecnico}</span>
                    </div>
                    <div className="text-xs font-semibold line-clamp-2">{d.descrizione}</div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[var(--border-hairline)] text-right text-xs text-[#01A0E8] font-mono-tabular">
                    Dettagli →
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBTAB 4: SPONSOR STORIA (45 ANNI)
         ========================================================================= */}
      {subTab === 'sponsor_storia' && (
        <div className="space-y-6">
          <div className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] space-y-2">
            <h3 className="text-sm font-mono-tabular text-[#01A0E8] font-bold uppercase tracking-wider">
              CRONOLOGIA UFFICIALE DEGLI SPONSOR TECNICI & COMMERCIALI
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Dalla prima apparizione delle sponsorizzazioni sulle maglie negli anni '80 (Snaidero, Cirio, Buitoni, Mars)
              ai partner tecnici d'autore (Ennerre, Umbro, Lotto, Nike, Diadora, Kappa, Macron, EA7 Emporio Armani).
            </p>
          </div>

          <div className="bg-[var(--bg-secondary)] border border-[var(--border-hairline)] overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono-tabular">
              <thead>
                <tr className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)] bg-[var(--bg-primary)]/40">
                  <th className="py-3 px-4">Stagione</th>
                  <th className="py-3 px-4">Sponsor Tecnico</th>
                  <th className="py-3 px-4">Main Sponsor (Fronte)</th>
                  <th className="py-3 px-4">Co-Sponsor / Secondario</th>
                  <th className="py-3 px-4">Back / Retro Sponsor</th>
                  <th className="py-3 px-4">Sleeve (Manica)</th>
                  <th className="py-3 px-4">Colori Divisa Primaria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-hairline)]">
                {sponsors.map((sp: any) => (
                  <tr key={sp.season} className="hover:bg-[var(--bg-primary)]/70">
                    <td className="py-3 px-4 font-bold">{sp.season}</td>
                    <td className="py-3 px-4 font-semibold text-[#01A0E8]">{sp.kit_manufacturer}</td>
                    <td className="py-3 px-4 font-bold text-[var(--text-primary)]">{sp.main_sponsor || '—'}</td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">{sp.co_sponsor || '—'}</td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">{sp.back_sponsor || '—'}</td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">{sp.sleeve_sponsor || '—'}</td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">{sp.primary_kit_colors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBTAB 5: MAGLIA 10 DI MARADONA & NUMERI DI MAGLIA
         ========================================================================= */}
      {subTab === 'maglia_10_numeri' && (
        <div className="space-y-6">
          {retiredNumbers.map((rn: any, idx: number) => (
            <div key={idx} className="p-6 md:p-8 bg-[var(--bg-secondary)] border-2 border-[#01A0E8] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-[#01A0E8] text-[#08090B] font-display font-black text-3xl flex items-center justify-center">
                    {rn.shirt_number}
                  </div>
                  <div>
                    <div className="text-xs font-mono-tabular text-[#01A0E8] font-bold uppercase">
                      MAGLIA RITIRATA UFFICIALMENTE NEL {rn.retirement_year}
                    </div>
                    <div className="text-2xl font-display font-extrabold text-[var(--text-primary)]">
                      {rn.player_name}
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-[#01A0E8]/20 text-[#01A0E8] border border-[#01A0E8] font-mono-tabular text-xs font-bold">
                  PERPETUAL TRIBUTE
                </span>
              </div>

              <div className="space-y-3 pt-3 border-t border-[var(--border-hairline)] text-xs leading-relaxed text-[var(--text-secondary)]">
                <div>
                  <strong className="text-[var(--text-primary)]">Motivazione Ufficiale:</strong>{' '}
                  {rn.historical_rationale}
                </div>
                {rn.serie_c1_exception && (
                  <div className="p-3 bg-[var(--bg-primary)] border border-amber-500/30 text-amber-300 font-mono-tabular text-[11px]">
                    <strong>Eccezione Regolamentare Serie C1 (2004–2006):</strong> {rn.serie_c1_exception}
                  </div>
                )}
                {rn.notable_wearers_pre_retirement && (
                  <div className="text-[11px] font-mono-tabular">
                    Altri indossatori storici pre-ritiro: {rn.notable_wearers_pre_retirement}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          SUBTAB 6: CENTRI TECNICI & RITIRI
         ========================================================================= */}
      {subTab === 'centri_ritiri' && (
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xs font-mono-tabular text-[#01A0E8] uppercase tracking-widest font-bold">
              I CENTRI SPORTIVI E LE STRUTTURE DEL CLUB
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {facilities.map((fac: any) => (
                <div key={fac.facility_id} className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] space-y-3 text-xs font-mono-tabular">
                  <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-2">
                    <span className="font-bold text-sm text-[var(--text-primary)]">{fac.facility_name}</span>
                    <span className="text-[#01A0E8] font-bold">{fac.period_start} – {fac.period_end || 'Oggi'}</span>
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)]">Ubicazione: {fac.location} · Tipo: {fac.facility_type}</div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{fac.description}</p>
                  {fac.key_historical_events && (
                    <div className="pt-2 border-t border-[var(--border-hairline)] text-[11px] text-[#01A0E8]">
                      Eventi chiave: {fac.key_historical_events}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-[var(--border-hairline)]">
            <h3 className="text-xs font-mono-tabular text-[#01A0E8] uppercase tracking-widest font-bold">
              LE SEDI STORICHE DEI RITIRI ESTIVI
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {camps.map((c: any) => (
                <div key={c.camp_id} className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] space-y-2 text-xs font-mono-tabular">
                  <div className="font-bold text-sm text-[var(--text-primary)]">{c.location}</div>
                  <div className="text-[11px] text-[#01A0E8]">{c.venue_name} ({c.period})</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">Stagioni: {c.seasons}</div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-snug pt-1">{c.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBTAB 7: DERBY & RIVALITÀ
         ========================================================================= */}
      {subTab === 'derby_rivalita' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {derbies.map((d: any) => (
              <div key={d.rivalry_id} className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] space-y-3 text-xs font-mono-tabular">
                <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-2">
                  <span className="font-bold text-sm text-[var(--text-primary)]">{d.rivalry_name}</span>
                  <span className="text-[#01A0E8] font-bold">vs {d.opponent_name}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center p-2 bg-[var(--bg-primary)] border border-[var(--border-hairline)]">
                  <div>
                    <div className="text-[10px] text-[var(--text-secondary)]">INCONTRI</div>
                    <div className="font-bold text-sm">{d.total_matches}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--text-secondary)]">V · P · S</div>
                    <div className="font-bold text-sm text-[#01A0E8]">{d.napoli_wins}·{d.draws}·{d.opponent_wins}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--text-secondary)]">GOL</div>
                    <div className="font-bold text-sm">{d.napoli_goals}-{d.opponent_goals}</div>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-1">
                  {d.historical_context}
                </p>
                {d.memorable_matches && (
                  <div className="pt-2 border-t border-[var(--border-hairline)] text-[11px] text-[#01A0E8]">
                    Gare memorabili: {d.memorable_matches}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBTAB 8: EVOLUZIONE DEGLI STEMMI E SIMBOLI UFFICIALI (1926–Presente)
         ========================================================================= */}
      {subTab === 'stemmi_simboli' && (
        <div className="space-y-6">
          <div className="p-6 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono-tabular text-[#01A0E8] font-bold uppercase">
              <Shield className="w-4 h-4" />
              <span>
                {lang === 'it'
                  ? 'CRONISTORIA UFFICIALE DELL’IDENTITÀ VISIVA AZZURRA'
                  : 'OFFICIAL CHRONOLOGY OF NAPOLI VISUAL IDENTITY'}
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {lang === 'it'
                ? 'Dal primo stemma con il Corsiero del Sole del Regno di Napoli nel 1926 alla nascita satirica del "Ciuccio" nel 1928, fino alla celebre N borbonica, ai trionfi dell’era Maradona e al rebranding contemporaneo del 2024.'
                : 'From the first emblem with the Kingdom of Naples rampant horse in 1926 to the satirical birth of "O Ciuccio" in 1928, the iconic Bourbon N, the Maradona triumphs, and the contemporary 2024 rebranding.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {symbols.map((sym: any, idx: number) => (
              <div
                key={idx}
                className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-hairline)] hover:border-[#01A0E8] transition-colors space-y-3 font-mono-tabular text-xs"
              >
                <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-2.5">
                  <span className="font-display font-extrabold text-sm text-[var(--text-primary)]">
                    {sym.symbol_name}
                  </span>
                  <span className="px-2 py-0.5 bg-[#01A0E8]/15 text-[#01A0E8] border border-[#01A0E8]/40 font-bold">
                    {sym.years}
                  </span>
                </div>

                <div className="text-[11px] text-[var(--text-secondary)]">
                  <span className="font-bold">{lang === 'it' ? 'Denominazione: ' : 'Club Name: '}</span>
                  <span className="text-[var(--text-primary)]">{sym.official_club_name}</span>
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                  {sym.description}
                </p>

                {sym.source && (
                  <div className="pt-2 border-t border-[var(--border-hairline)] text-[10px] text-[var(--text-secondary)] opacity-80">
                    <span className="text-[#01A0E8] font-bold">Fonte:</span> {sym.source}
                  </div>
                )}
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
