export type CoverageStatus = 'completo' | 'parziale' | 'nd' | 'na' | 'pending';
export type ConfidenceLevel = 'alta' | 'media' | 'bassa';

export interface GoalEvent {
  minute: string;
  half: string;
  scorer: string;
  team: 'NAP' | 'OPP';
  teamName: string;
  descriptionIt: string;
  descriptionEn: string;
  partialScore: string;
  assist?: string | null;
  exactMinuteKnown: boolean;
}

export interface KeyMoment {
  minute: string;
  titleIt: string;
  titleEn: string;
  team: string;
  type: 'goal' | 'woodwork' | 'sub' | 'card' | 'var';
  inChronologicalFlow: boolean;
}

export interface SubstitutionEvent {
  minute: string;
  playerOut?: string;
  playerIn: string;
  team: 'NAP' | 'OPP';
  noteIt?: string;
  noteEn?: string;
}

export interface MatchDataStory {
  id: string;
  season: string;
  competition: string;
  matchdayIt: string;
  matchdayEn: string;
  dateIso: string;
  dateDisplayIt: string;
  dateDisplayEn: string;
  time: string;
  stadium: string;
  city: string;
  lat: number;
  lon: number;
  isHome: boolean;
  homeTeam: string;
  awayTeam: string;
  homeCode: string;
  awayCode: string;
  homeGoals: number;
  awayGoals: number;
  htScore: string | null;
  attendance: number | null;
  referee: string | null;
  confidence: ConfidenceLevel;
  verificato: 0 | 1;
  pubblicata: 0 | 1;
  summaryIt: string;
  summaryEn: string;
  waveformBars: {
    label: string;
    height: number; // 10 to 100
    team: 'neutral' | 'napoli' | 'opponent';
    eventNoteIt: string;
    eventNoteEn: string;
  }[];
  waveformCaptionIt: string;
  waveformCaptionEn: string;
  goals: GoalEvent[];
  keyMoments: KeyMoment[];
  substitutions: SubstitutionEvent[];
  disciplineNoteIt: string;
  disciplineNoteEn: string;
  lineupsNoteIt: string;
  lineupsNoteEn: string;
  stats: {
    possessionHome: number | null;
    possessionAway: number | null;
    shotsHome: number | null;
    shotsAway: number | null;
    shotsOnTargetHome: number | null;
    shotsOnTargetAway: number | null;
    xgHome: number | null;
    xgAway: number | null;
    cornersHome: number | null;
    cornersAway: number | null;
  };
  cov: Record<string, CoverageStatus>;
  eternalMatch: {
    opponentName: string;
    opponentCode: string;
    officialMatches: number;
    napoliWins: number;
    draws: number;
    opponentWins: number;
    napoliGoals: number;
    opponentGoals: number;
    pre1926EntitiesNoteIt: string;
    pre1926EntitiesNoteEn: string;
    withPre1926Matches?: {
      matches: number;
      napoliWins: number;
      draws: number;
      opponentWins: number;
      entityName: string;
    };
  };
  sources: {
    label: string;
    detail: string;
    tier: 1 | 2 | 3;
    provisionalNoteIt?: string;
    provisionalNoteEn?: string;
  }[];
}

export const FEATURED_MATCHES: MatchDataStory[] = [
  {
    id: '2026-09-20-fiorentina-napoli',
    season: '2026-27',
    competition: 'SERIE A',
    matchdayIt: 'GIORNATA 5 · 2026/27',
    matchdayEn: 'MATCHDAY 5 · 2026/27',
    dateIso: '2026-09-20',
    dateDisplayIt: 'Domenica 20 Settembre 2026',
    dateDisplayEn: 'Sunday 20 September 2026',
    time: '12:30',
    stadium: 'Artemio Franchi Stadium',
    city: 'Firenze',
    lat: 43.7808,
    lon: 11.2826,
    isHome: false,
    homeTeam: 'FIORENTINA',
    awayTeam: 'NAPOLI',
    homeCode: 'FIO',
    awayCode: 'NAP',
    homeGoals: 1,
    awayGoals: 1,
    htScore: '0-1',
    attendance: null,
    referee: null,
    confidence: 'alta',
    verificato: 1,
    pubblicata: 1,
    summaryIt:
      'Il Napoli passa in vantaggio nel primo tempo ma non riesce a difendere il risultato: la Fiorentina risponde a inizio ripresa e fissa il punteggio in parità. Il punto lascia la squadra a 6 lunghezze dal terzetto di testa formato da Roma, Inter e Lazio.',
    summaryEn:
      "Napoli go ahead in the first half but can't hold on to the lead: Fiorentina respond early in the second half and level the score. The point leaves Allegri's side 6 points off the top trio of Roma-Inter-Lazio.",
    waveformBars: [
      { label: "0'", height: 14, team: 'neutral', eventNoteIt: 'Calcio d’inizio', eventNoteEn: 'Kick-off' },
      { label: "17'", height: 52, team: 'opponent', eventNoteIt: 'Traversa — Atta (assist: Mastantuono)', eventNoteEn: 'Crossbar — Atta (assist: Mastantuono)' },
      { label: "19'", height: 52, team: 'opponent', eventNoteIt: 'Traversa — Fagioli (assist: Mastantuono)', eventNoteEn: 'Crossbar — Fagioli (assist: Mastantuono)' },
      { label: "23'", height: 100, team: 'napoli', eventNoteIt: 'GOL — B. Gilmour (0-1 Napoli)', eventNoteEn: 'GOAL — B. Gilmour (0-1 Napoli)' },
      { label: '2H*', height: 100, team: 'opponent', eventNoteIt: 'GOL — A. Jimenez, deviazione di Marin (1-1)*', eventNoteEn: 'GOAL — A. Jimenez, deflected by Marin (1-1)*' },
      { label: "90'", height: 26, team: 'napoli', eventNoteIt: 'Sostituzione — Anguissa in campo', eventNoteEn: 'Substitution — Anguissa on' },
      { label: 'FT', height: 14, team: 'neutral', eventNoteIt: 'Triplice fischio (1-1)', eventNoteEn: 'Full Time (1-1)' },
    ],
    waveformCaptionIt:
      'Altezza barra = tipo evento (gol = massimo, palo/traversa = medio, sostituzione = minimo) · colore = squadra. *Gol Fiorentina: minuto esatto non specificato dalla fonte, collocato a inizio ripresa come riportato.',
    waveformCaptionEn:
      "Bar height = event type (goal = maximum, post/crossbar = medium, substitution = minimum) · colour = team. *Fiorentina's goal: exact minute not specified by the source, placed after the 23' mark as reported.",
    goals: [
      {
        minute: "23'",
        half: '1H',
        scorer: 'B. Gilmour',
        team: 'NAP',
        teamName: 'NAPOLI',
        descriptionIt:
          'Sugli sviluppi di un calcio d’angolo. Nessun assist ufficialmente accreditato dalla fonte consultata.',
        descriptionEn:
          'From a corner-kick situation. No assist officially credited by the source consulted.',
        partialScore: '0–1',
        assist: null,
        exactMinuteKnown: true,
      },
      {
        minute: '—',
        half: 'early 2H*',
        scorer: 'A. Jimenez',
        team: 'OPP',
        teamName: 'FIORENTINA',
        descriptionIt:
          'Tiro deviato da Marin. *Minuto esatto non specificato dalla fonte consultata: riportato solo come "in avvio di ripresa".',
        descriptionEn:
          'Shot deflected by Marin. *Exact minute not specified by the source consulted: reported only as "early in the second half".',
        partialScore: '1–1',
        assist: null,
        exactMinuteKnown: false,
      },
    ],
    keyMoments: [
      {
        minute: "17'",
        titleIt: 'Traversa colpita — Atta (assist: Mastantuono)',
        titleEn: 'Crossbar hit — Atta (assist: Mastantuono)',
        team: 'FIORENTINA',
        type: 'woodwork',
        inChronologicalFlow: true,
      },
      {
        minute: "19'",
        titleIt: 'Traversa colpita — Fagioli (assist: Mastantuono)',
        titleEn: 'Crossbar hit — Fagioli (assist: Mastantuono)',
        team: 'FIORENTINA',
        type: 'woodwork',
        inChronologicalFlow: true,
      },
      {
        minute: 'N/A',
        titleIt: 'Palo colpito da Olivera, nella stessa azione che ha preceduto il gol di Gilmour',
        titleEn: "Post hit by Olivera, in the same passage of play that preceded Gilmour's goal",
        team: 'NAPOLI',
        type: 'woodwork',
        inChronologicalFlow: false,
      },
    ],
    substitutions: [
      { minute: "90'", playerIn: 'Anguissa', team: 'NAP' },
      { minute: 'N/A', playerOut: 'Højlund', playerIn: 'Lucca', team: 'NAP' },
      { minute: 'N/A', playerOut: 'Lang', playerIn: 'Neres', team: 'NAP' },
      { minute: 'N/A', playerOut: 'Politano', playerIn: 'Favasuli', team: 'NAP' },
      {
        minute: 'N/A',
        playerIn: 'Beto, Goncalves, Gnonto, Valdepenas',
        team: 'OPP',
        noteIt: 'Entrati nel secondo tempo',
        noteEn: 'On in the second half',
      },
    ],
    disciplineNoteIt:
      'Cartellini non riportati dalla fonte. Il resoconto ANSA non menziona ammonizioni o espulsioni per questa gara. Sezione da aggiornare alla pubblicazione del report ufficiale Lega Serie A.',
    disciplineNoteEn:
      'Cards not reported by the source. The ANSA match report does not mention any bookings or red cards for this match. Section to be updated if an official match report becomes available.',
    lineupsNoteIt:
      'Non pubblicate in questa scheda. La fonte consultata cita solo alcuni giocatori scesi in campo (tra gli altri, per il Napoli: Gilmour e Lobotka a centrocampo, Rrahmani-Marin centrali, Lang a sinistra, Højlund con De Bruyne, Politano, Di Lorenzo; per la Fiorentina: De Gea, Viti, Fagioli, Atta, Njie, Mastantuono, Pellegrino) — non l’undici ufficiale completo. Statistiche di squadra (tiri, possesso, corner, cartellini) non reperite su fonte verificata al momento della stesura — mai stimate.',
    lineupsNoteEn:
      'Not published on this page. The source consulted names only a few players on the pitch (among others, for Napoli: Gilmour and Lobotka in midfield, Rrahmani-Marin at centre-back, Lang on the left, Højlund with De Bruyne, Politano, Di Lorenzo; for Fiorentina: De Gea, Viti, Fagioli, Atta, Njie, Mastantuono, Pellegrino) — not the full official line-up. Team statistics (shots, possession, corners, cards) not found on a verified source at time of writing — not estimated.',
    stats: {
      possessionHome: null,
      possessionAway: null,
      shotsHome: null,
      shotsAway: null,
      shotsOnTargetHome: null,
      shotsOnTargetAway: null,
      xgHome: null,
      xgAway: null,
      cornersHome: null,
      cornersAway: null,
    },
    cov: {
      risultato: 'completo',
      marcatori: 'parziale',
      formazioni: 'parziale',
      eventi: 'nd',
      statistiche: 'pending',
      arbitro: 'pending',
      affluenza: 'pending',
      xg: 'pending',
    },
    eternalMatch: {
      opponentName: 'Fiorentina',
      opponentCode: 'FIO',
      officialMatches: 171,
      napoliWins: 62,
      draws: 50,
      opponentWins: 59,
      napoliGoals: 204,
      opponentGoals: 201,
      pre1926EntitiesNoteIt:
        'Il registro di continuità societaria è verificato: AC Fiorentina fondata il 29 agosto 1926 dalla fusione tra CS Firenze e PG Libertas. Nessun precedente pre-1926 confluito nel computo sportivo.',
      pre1926EntitiesNoteEn:
        'The corporate continuity register is verified: AC Fiorentina founded 29 August 1926 from the merger of CS Firenze and PG Libertas. No pre-1926 fixtures merged into the sporting record.',
    },
    sources: [
      {
        label: 'ANSA',
        detail: '"Serie A: il Napoli non decolla, segna Gilmour ma la Fiorentina lo riprende" (ansa.it, 20/09/2026)',
        tier: 3,
      },
      {
        label: 'Fantacalcio.it',
        detail: 'Calendario e giornata — Serie A 2026/27',
        tier: 2,
      },
    ],
  },
  {
    id: '2026-10-17-venezia-napoli',
    season: '2026-27',
    competition: 'SERIE A',
    matchdayIt: 'GIORNATA 8 · 2026/27',
    matchdayEn: 'MATCHDAY 8 · 2026/27',
    dateIso: '2026-10-17',
    dateDisplayIt: 'Sabato 17 Ottobre 2026',
    dateDisplayEn: 'Saturday 17 October 2026',
    time: '15:00',
    stadium: 'Stadio Pier Luigi Penzo',
    city: 'Venezia',
    lat: 45.4278,
    lon: 12.3636,
    isHome: false,
    homeTeam: 'VENEZIA',
    awayTeam: 'NAPOLI',
    homeCode: 'VEN',
    awayCode: 'NAP',
    homeGoals: 0,
    awayGoals: 2,
    htScore: '0-1',
    attendance: 11240,
    referee: 'Doveri',
    confidence: 'alta',
    verificato: 1,
    pubblicata: 1,
    summaryIt:
      'Dati estratti dal Report Ufficiale Lega Serie A (stampato il 17/10 alle 17:15). Il documento precisa che le statistiche diventano definitive dopo 24 ore e le sanzioni disciplinari sono ufficiose fino a omologazione del Giudice Sportivo. Nota di verifica: "Rigori parati: 1" nella scheda di Stanković è privo di riscontro nella cronologia eventi ed è marcato da_verificare.',
    summaryEn:
      'Data extracted from the Official Lega Serie A Match Report (printed 17/10 at 17:15). The document states statistics are finalized after 24 hours and disciplinary sanctions are provisional until ratification. Verification note: "Penalties saved: 1" in Stanković’s sheet lacks corroboration in the event log and is flagged to_verify.',
    waveformBars: [
      { label: "0'", height: 15, team: 'neutral', eventNoteIt: 'Inizio gara al Penzo', eventNoteEn: 'Kick-off at Penzo' },
      { label: "31'", height: 100, team: 'napoli', eventNoteIt: 'GOL — Politano (0-1 Napoli)', eventNoteEn: 'GOAL — Politano (0-1 Napoli)' },
      { label: "45'", height: 35, team: 'neutral', eventNoteIt: 'Fine primo tempo (0-1)', eventNoteEn: 'Half-time (0-1)' },
      { label: "64'", height: 55, team: 'napoli', eventNoteIt: 'Palo interno — Lobotka', eventNoteEn: 'Inside post — Lobotka' },
      { label: "78'", height: 100, team: 'napoli', eventNoteIt: 'GOL — Højlund (0-2 Napoli)', eventNoteEn: 'GOAL — Højlund (0-2 Napoli)' },
      { label: 'FT', height: 20, team: 'neutral', eventNoteIt: 'Finale 0-2 · Report Lega 17:15', eventNoteEn: 'Full Time 0-2 · Lega Report 17:15' },
    ],
    waveformCaptionIt:
      'Fonte primaria: Report Ufficiale Lega Serie A (stato: provvisorio pre-24h, stampato 17/10 ore 17:15).',
    waveformCaptionEn:
      'Primary source: Official Lega Serie A Report (status: provisional pre-24h, printed 17/10 at 17:15).',
    goals: [
      {
        minute: "31'",
        half: '1H',
        scorer: 'M. Politano',
        team: 'NAP',
        teamName: 'NAPOLI',
        descriptionIt: 'Conclusione mancina sul secondo palo su assist certificato di Di Lorenzo.',
        descriptionEn: 'Left-footed finish inside the far post, official assist credited to Di Lorenzo.',
        partialScore: '0–1',
        assist: 'G. Di Lorenzo',
        exactMinuteKnown: true,
      },
      {
        minute: "78'",
        half: '2H',
        scorer: 'R. Højlund',
        team: 'NAP',
        teamName: 'NAPOLI',
        descriptionIt: 'Attacco alla profondità centrale, assist certificato da Report Lega.',
        descriptionEn: 'Central run in behind, assist officially credited by Lega Report.',
        partialScore: '0–2',
        assist: 'S. Lobotka',
        exactMinuteKnown: true,
      },
    ],
    keyMoments: [
      {
        minute: "31'",
        titleIt: 'GOL — Politano (assist: Di Lorenzo)',
        titleEn: 'GOAL — Politano (assist: Di Lorenzo)',
        team: 'NAPOLI',
        type: 'goal',
        inChronologicalFlow: true,
      },
      {
        minute: "64'",
        titleIt: 'Palo colpito — Lobotka dal limite',
        titleEn: 'Post hit — Lobotka from the edge of the box',
        team: 'NAPOLI',
        type: 'woodwork',
        inChronologicalFlow: true,
      },
      {
        minute: "78'",
        titleIt: 'GOL — Højlund (assist: Lobotka)',
        titleEn: 'GOAL — Højlund (assist: Lobotka)',
        team: 'NAPOLI',
        type: 'goal',
        inChronologicalFlow: true,
      },
    ],
    substitutions: [
      { minute: "68'", playerOut: 'Politano', playerIn: 'Neres', team: 'NAP' },
      { minute: "79'", playerOut: 'Højlund', playerIn: 'Lucca', team: 'NAP' },
      { minute: "84'", playerOut: 'Gilmour', playerIn: 'Anguissa', team: 'NAP' },
    ],
    disciplineNoteIt:
      'Sanzioni disciplinari ufficiose fino ad omologazione del Giudice Sportivo (come da dicitura Report Lega Serie A stampato alle 17:15).',
    disciplineNoteEn:
      'Disciplinary sanctions unofficial until formal ratification by the Sporting Judge (as stated on the 17:15 Lega Serie A Report).',
    lineupsNoteIt:
      'Formazioni complete estratte dal Report Ufficiale Lega Serie A. Anomalia documentata in conflitti_import: la scheda individuale di Stanković riporta "Rigori parati: 1", ma la cronologia ufficiale non registra alcun calcio di rigore (stato: da_verificare).',
    lineupsNoteEn:
      'Full lineups extracted from the Official Lega Serie A Report. Documented anomaly in conflitti_import: Stanković’s player sheet lists "Penalties saved: 1", whereas the official match chronology records zero penalties (status: to_verify).',
    stats: {
      possessionHome: 41,
      possessionAway: 59,
      shotsHome: 8,
      shotsAway: 16,
      shotsOnTargetHome: 2,
      shotsOnTargetAway: 7,
      xgHome: 0.64,
      xgAway: 1.92,
      cornersHome: 4,
      cornersAway: 8,
    },
    cov: {
      risultato: 'completo',
      marcatori: 'completo',
      formazioni: 'completo',
      eventi: 'parziale',
      statistiche: 'completo',
      arbitro: 'completo',
      affluenza: 'completo',
      xg: 'completo',
    },
    eternalMatch: {
      opponentName: 'Venezia',
      opponentCode: 'VEN',
      officialMatches: 34,
      napoliWins: 18,
      draws: 11,
      opponentWins: 5,
      napoliGoals: 52,
      opponentGoals: 26,
      pre1926EntitiesNoteIt:
        'Tutti i precedenti ufficiali sono posteriori al 1° agosto 1926.',
      pre1926EntitiesNoteEn:
        'All official encounters occurred after 1 August 1926.',
    },
    sources: [
      {
        label: 'Lega Serie A — Match Report Ufficiale',
        detail: 'Stampato il 17/10/2026 ore 17:15 (Stato: provvisorio pre-24h)',
        tier: 1,
        provisionalNoteIt:
          'Statistiche definitive dopo 24h; sanzioni ufficiose fino a omologazione; "Rigori parati: 1" (Stanković) segnato da_verificare.',
        provisionalNoteEn:
          'Statistics final after 24h; sanctions unofficial until ratification; "Penalties saved: 1" (Stanković) flagged to_verify.',
      },
    ],
  },
  {
    id: '1987-05-10-napoli-fiorentina',
    season: '1986-87',
    competition: 'SERIE A',
    matchdayIt: 'GIORNATA 29 · 1986/87 (1° SCUDETTO)',
    matchdayEn: 'MATCHDAY 29 · 1986/87 (1ST SCUDETTO)',
    dateIso: '1987-05-10',
    dateDisplayIt: 'Domenica 10 Maggio 1987',
    dateDisplayEn: 'Sunday 10 May 1987',
    time: '16:00',
    stadium: 'Stadio San Paolo',
    city: 'Napoli',
    lat: 40.8279,
    lon: 14.193,
    isHome: true,
    homeTeam: 'NAPOLI',
    awayTeam: 'FIORENTINA',
    homeCode: 'NAP',
    awayCode: 'FIO',
    homeGoals: 1,
    awayGoals: 1,
    htScore: '1-1',
    attendance: 82977,
    referee: 'Pierluigi Pairetto',
    confidence: 'alta',
    verificato: 1,
    pubblicata: 1,
    summaryIt:
      'Con il pareggio per 1-1 contro la Fiorentina alla penultima giornata, l’SSC Napoli conquista matematicamente il primo Scudetto della sua storia (dal 1926). Rete di Andrea Carnevale al 29’ dopo triangolazione Giordano-Maradona; pareggio su punizione di Roberto Baggio al 39’.',
    summaryEn:
      'With a 1-1 draw against Fiorentina on Matchday 29, SSC Napoli mathematically secure the first Scudetto in club history (since 1926). Goal by Andrea Carnevale in the 29th minute following a Giordano-Maradona combination; equalizer by Roberto Baggio via free-kick in the 39th minute.',
    waveformBars: [
      { label: "0'", height: 20, team: 'neutral', eventNoteIt: 'Inizio al San Paolo (82.977 spettatori)', eventNoteEn: 'Kick-off at San Paolo (82,977 attendance)' },
      { label: "29'", height: 100, team: 'napoli', eventNoteIt: 'GOL — A. Carnevale (1-0 Napoli)', eventNoteEn: 'GOAL — A. Carnevale (1-0 Napoli)' },
      { label: "39'", height: 100, team: 'opponent', eventNoteIt: 'GOL — R. Baggio (1-1 Fiorentina)', eventNoteEn: 'GOAL — R. Baggio (1-1 Fiorentina)' },
      { label: "63'", height: 32, team: 'napoli', eventNoteIt: 'Sostituzione — Bigliardi per Carnevale', eventNoteEn: 'Substitution — Bigliardi for Carnevale' },
      { label: 'FT', height: 85, team: 'napoli', eventNoteIt: '1° Scudetto matematico SSC Napoli', eventNoteEn: '1st Mathematical Scudetto SSC Napoli' },
    ],
    waveformCaptionIt:
      'Copertura: xG marcato come NA per regola (copertura_regole: data <= 2009-12-31).',
    waveformCaptionEn:
      'Coverage: xG marked as NA by rule (copertura_regole: date <= 2009-12-31).',
    goals: [
      {
        minute: "29'",
        half: '1H',
        scorer: 'A. Carnevale',
        team: 'NAP',
        teamName: 'NAPOLI',
        descriptionIt: 'Azione corale Maradona-Giordano, assist di tacco di Giordano per Carnevale.',
        descriptionEn: 'Team move Maradona-Giordano, backheel assist by Giordano for Carnevale.',
        partialScore: '1–0',
        assist: 'B. Giordano',
        exactMinuteKnown: true,
      },
      {
        minute: "39'",
        half: '1H',
        scorer: 'R. Baggio',
        team: 'OPP',
        teamName: 'FIORENTINA',
        descriptionIt: 'Calcio di punizione diretto dal limite dell’area (primo gol in Serie A di Baggio).',
        descriptionEn: 'Direct free-kick from the edge of the box (Baggio’s first Serie A goal).',
        partialScore: '1–1',
        assist: null,
        exactMinuteKnown: true,
      },
    ],
    keyMoments: [
      {
        minute: "29'",
        titleIt: 'GOL — Andrea Carnevale (1-0)',
        titleEn: 'GOAL — Andrea Carnevale (1-0)',
        team: 'NAPOLI',
        type: 'goal',
        inChronologicalFlow: true,
      },
      {
        minute: "39'",
        titleIt: 'GOL — Roberto Baggio su punizione (1-1)',
        titleEn: 'GOAL — Roberto Baggio free-kick (1-1)',
        team: 'FIORENTINA',
        type: 'goal',
        inChronologicalFlow: true,
      },
    ],
    substitutions: [
      { minute: "63'", playerOut: 'Carnevale', playerIn: 'Bigliardi', team: 'NAP' },
      { minute: "75'", playerOut: 'Romano', playerIn: 'Muro', team: 'NAP' },
    ],
    disciplineNoteIt: 'Nessun espulso. Tabellino storico verificato.',
    disciplineNoteEn: 'No red cards. Verified historical match sheet.',
    lineupsNoteIt:
      'Napoli (Garella; Bruscolotti, Volpecina, Bagni, Ferrario, Renica, Carnevale, De Napoli, Giordano, Maradona, Romano — All. Ottavio Bianchi). Statistiche avanzate (xG, PPDA) assenti per natura storica (NA pre-2010).',
    lineupsNoteEn:
      'Napoli (Garella; Bruscolotti, Volpecina, Bagni, Ferrario, Renica, Carnevale, De Napoli, Giordano, Maradona, Romano — Coach Ottavio Bianchi). Advanced metrics (xG, PPDA) absent by historical nature (NA pre-2010).',
    stats: {
      possessionHome: null,
      possessionAway: null,
      shotsHome: null,
      shotsAway: null,
      shotsOnTargetHome: null,
      shotsOnTargetAway: null,
      xgHome: null,
      xgAway: null,
      cornersHome: 6,
      cornersAway: 4,
    },
    cov: {
      risultato: 'completo',
      marcatori: 'completo',
      formazioni: 'completo',
      eventi: 'completo',
      statistiche: 'nd',
      arbitro: 'completo',
      affluenza: 'completo',
      xg: 'na',
    },
    eternalMatch: {
      opponentName: 'Fiorentina',
      opponentCode: 'FIO',
      officialMatches: 171,
      napoliWins: 62,
      draws: 50,
      opponentWins: 59,
      napoliGoals: 204,
      opponentGoals: 201,
      pre1926EntitiesNoteIt:
        'Computo dal 1926 (inherits_sporting_record = 0 per Internaples/Naples FBC).',
      pre1926EntitiesNoteEn:
        'Count from 1926 (inherits_sporting_record = 0 for Internaples/Naples FBC).',
    },
    sources: [
      {
        label: 'RSSSF — Italy Championship 1986/87',
        detail: 'Archivio storico verificato (Maurizio Mariani / RSSSF)',
        tier: 2,
      },
      {
        label: 'Almanacco Illustrato del Calcio Panini 1988',
        detail: 'Tabellino ufficiale 29ª giornata e spettatori Stadiapostcards',
        tier: 2,
      },
    ],
  },
];

export interface ArchiveMatchRow {
  id: string;
  date: string;
  season: string;
  competition: 'Serie A' | 'Coppa Italia' | 'UEFA Champions League' | 'Coppa UEFA' | 'Supercoppa Italiana';
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
  venue: string;
  city: string;
  isHome: boolean;
  resultForNapoli: 'V' | 'P' | 'S';
  scorersSummary: string;
  covStatus: CoverageStatus;
  confidence: ConfidenceLevel;
  verificato: 0 | 1;
  linkedStoryId?: string;
}

export const ARCHIVE_MATCHES: ArchiveMatchRow[] = [
  {
    id: '2026-10-24-napoli-roma',
    date: '2026-10-24',
    season: '2026-27',
    competition: 'Serie A',
    homeTeam: 'Napoli',
    awayTeam: 'Roma',
    homeGoals: 1,
    awayGoals: 0,
    venue: 'Stadio Diego Armando Maradona',
    city: 'Napoli',
    isHome: true,
    resultForNapoli: 'V',
    scorersSummary: "Lukaku 54'",
    covStatus: 'completo',
    confidence: 'alta',
    verificato: 1,
  },
  {
    id: '2026-10-17-venezia-napoli',
    date: '2026-10-17',
    season: '2026-27',
    competition: 'Serie A',
    homeTeam: 'Venezia',
    awayTeam: 'Napoli',
    homeGoals: 0,
    awayGoals: 2,
    venue: 'Stadio Pier Luigi Penzo',
    city: 'Venezia',
    isHome: false,
    resultForNapoli: 'V',
    scorersSummary: "Politano 31', Højlund 78'",
    covStatus: 'completo',
    confidence: 'alta',
    verificato: 1,
    linkedStoryId: '2026-10-17-venezia-napoli',
  },
  {
    id: '2026-09-20-fiorentina-napoli',
    date: '2026-09-20',
    season: '2026-27',
    competition: 'Serie A',
    homeTeam: 'Fiorentina',
    awayTeam: 'Napoli',
    homeGoals: 1,
    awayGoals: 1,
    venue: 'Stadio Artemio Franchi',
    city: 'Firenze',
    isHome: false,
    resultForNapoli: 'P',
    scorersSummary: "Gilmour 23' (N), Jimenez 2H* (F)",
    covStatus: 'parziale',
    confidence: 'alta',
    verificato: 1,
    linkedStoryId: '2026-09-20-fiorentina-napoli',
  },
  {
    id: '2023-05-04-udinese-napoli',
    date: '2023-05-04',
    season: '2022-23',
    competition: 'Serie A',
    homeTeam: 'Udinese',
    awayTeam: 'Napoli',
    homeGoals: 1,
    awayGoals: 1,
    venue: 'Dacia Arena (Stadio Friuli)',
    city: 'Udine',
    isHome: false,
    resultForNapoli: 'P',
    scorersSummary: "Lovrić 13' (U), Osimhen 52' (N) — 3° Scudetto",
    covStatus: 'completo',
    confidence: 'alta',
    verificato: 1,
  },
  {
    id: '2022-10-04-ajax-napoli',
    date: '2022-10-04',
    season: '2022-23',
    competition: 'UEFA Champions League',
    homeTeam: 'Ajax',
    awayTeam: 'Napoli',
    homeGoals: 1,
    awayGoals: 6,
    venue: 'Johan Cruijff ArenA',
    city: 'Amsterdam',
    isHome: false,
    resultForNapoli: 'V',
    scorersSummary: "Raspadori 18', 47', Di Lorenzo 33', Zieliński 45', Kvaratskhelia 63', Simeone 81'",
    covStatus: 'completo',
    confidence: 'alta',
    verificato: 1,
  },
  {
    id: '2020-06-17-napoli-juventus-ci',
    date: '2020-06-17',
    season: '2019-20',
    competition: 'Coppa Italia',
    homeTeam: 'Napoli',
    awayTeam: 'Juventus',
    homeGoals: 0,
    awayGoals: 0,
    venue: 'Stadio Olimpico (4-2 d.c.r.)',
    city: 'Roma',
    isHome: false,
    resultForNapoli: 'V',
    scorersSummary: '0-0 (4-2 rigori: Insigne, Politano, Maksimović, Milik)',
    covStatus: 'completo',
    confidence: 'alta',
    verificato: 1,
  },
  {
    id: '2014-12-22-juventus-napoli-sc',
    date: '2014-12-22',
    season: '2014-15',
    competition: 'Supercoppa Italiana',
    homeTeam: 'Juventus',
    awayTeam: 'Napoli',
    homeGoals: 2,
    awayGoals: 2,
    venue: 'Jassim Bin Hamad Stadium (5-6 d.c.r.)',
    city: 'Doha',
    isHome: false,
    resultForNapoli: 'V',
    scorersSummary: "Higuaín 68', 118' (5-6 d.c.r.)",
    covStatus: 'completo',
    confidence: 'alta',
    verificato: 1,
  },
  {
    id: '1990-04-29-napoli-lazio',
    date: '1990-04-29',
    season: '1989-90',
    competition: 'Serie A',
    homeTeam: 'Napoli',
    awayTeam: 'Lazio',
    homeGoals: 1,
    awayGoals: 0,
    venue: 'Stadio San Paolo',
    city: 'Napoli',
    isHome: true,
    resultForNapoli: 'V',
    scorersSummary: "Baroni 7' — 2° Scudetto",
    covStatus: 'completo',
    confidence: 'alta',
    verificato: 1,
  },
  {
    id: '1989-05-17-stoccarda-napoli',
    date: '1989-05-17',
    season: '1988-89',
    competition: 'Coppa UEFA',
    homeTeam: 'Stoccarda',
    awayTeam: 'Napoli',
    homeGoals: 3,
    awayGoals: 3,
    venue: 'Neckarstadion',
    city: 'Stoccarda',
    isHome: false,
    resultForNapoli: 'P',
    scorersSummary: "Alemão 18', Ferrara 39', Careca 62' — Vittoria Coppa UEFA",
    covStatus: 'completo',
    confidence: 'alta',
    verificato: 1,
  },
  {
    id: '1987-05-10-napoli-fiorentina',
    date: '1987-05-10',
    season: '1986-87',
    competition: 'Serie A',
    homeTeam: 'Napoli',
    awayTeam: 'Fiorentina',
    homeGoals: 1,
    awayGoals: 1,
    venue: 'Stadio San Paolo',
    city: 'Napoli',
    isHome: true,
    resultForNapoli: 'P',
    scorersSummary: "Carnevale 29' (N), Baggio 39' (F) — 1° Scudetto",
    covStatus: 'completo',
    confidence: 'alta',
    verificato: 1,
    linkedStoryId: '1987-05-10-napoli-fiorentina',
  },
  {
    id: '1962-06-21-napoli-spal-ci',
    date: '1962-06-21',
    season: '1961-62',
    competition: 'Coppa Italia',
    homeTeam: 'Napoli',
    awayTeam: 'SPAL',
    homeGoals: 2,
    awayGoals: 1,
    venue: 'Stadio Olimpico',
    city: 'Roma',
    isHome: false,
    resultForNapoli: 'V',
    scorersSummary: "Corelli 12', Ronzon 78' — 1ª Coppa Italia (da squadra di Serie B)",
    covStatus: 'parziale',
    confidence: 'alta',
    verificato: 1,
  },
  {
    id: '1926-10-03-napoli-inter',
    date: '1926-10-03',
    season: '1926-27',
    competition: 'Serie A',
    homeTeam: 'Napoli',
    awayTeam: 'Inter',
    homeGoals: 0,
    awayGoals: 3,
    venue: 'Campo Militare dell’Arenaccia',
    city: 'Napoli',
    isHome: true,
    resultForNapoli: 'S',
    scorersSummary: '1ª gara ufficiale assoluta AC Napoli (Divisione Nazionale)',
    covStatus: 'nd',
    confidence: 'alta',
    verificato: 1,
  },
];

export interface AwayTravelMatch {
  matchOrder: number;
  date: string;
  season: string;
  city: string;
  stadium: string;
  opponent: string;
  competition: string;
  score: string;
  lat: number;
  lon: number;
  distanceKm: number; // Haversine from Stadio Maradona (40.8279, 14.1930)
}

// Away matches demonstrating the Progressive Pin Numbering logic (multiple trips to Rome, Milan, Turin, etc.)
export const AWAY_TRAVEL_MATCHES: AwayTravelMatch[] = [
  {
    matchOrder: 1,
    date: '2026-08-23',
    season: '2026-27',
    city: 'Verona',
    stadium: 'Stadio Marcantonio Bentegodi',
    opponent: 'Hellas Verona',
    competition: 'Serie A · G1',
    score: '1-2',
    lat: 45.4354,
    lon: 10.9686,
    distanceKm: 572,
  },
  {
    matchOrder: 2,
    date: '2026-09-20',
    season: '2026-27',
    city: 'Firenze',
    stadium: 'Stadio Artemio Franchi',
    opponent: 'Fiorentina',
    competition: 'Serie A · G5',
    score: '1-1',
    lat: 43.7808,
    lon: 11.2826,
    distanceKm: 408,
  },
  {
    matchOrder: 3,
    date: '2026-10-03',
    season: '2026-27',
    city: 'Roma',
    stadium: 'Stadio Olimpico',
    opponent: 'Lazio',
    competition: 'Serie A · G7',
    score: '1-1',
    lat: 41.9341,
    lon: 12.4547,
    distanceKm: 192,
  },
  {
    matchOrder: 4,
    date: '2026-10-17',
    season: '2026-27',
    city: 'Venezia',
    stadium: 'Stadio Pier Luigi Penzo',
    opponent: 'Venezia',
    competition: 'Serie A · G8',
    score: '0-2',
    lat: 45.4278,
    lon: 12.3636,
    distanceKm: 534,
  },
  {
    matchOrder: 5,
    date: '2026-10-29',
    season: '2026-27',
    city: 'Milano',
    stadium: 'Stadio Giuseppe Meazza (San Siro)',
    opponent: 'Milan',
    competition: 'Serie A · G10',
    score: '0-2',
    lat: 45.4781,
    lon: 9.124,
    distanceKm: 661,
  },
  {
    matchOrder: 6,
    date: '2026-11-10',
    season: '2026-27',
    city: 'Milano',
    stadium: 'Stadio Giuseppe Meazza (San Siro)',
    opponent: 'Inter',
    competition: 'Serie A · G12',
    score: '1-1',
    lat: 45.4781,
    lon: 9.124,
    distanceKm: 661,
  },
  {
    matchOrder: 7,
    date: '2026-12-01',
    season: '2026-27',
    city: 'Torino',
    stadium: 'Stadio Olimpico Grande Torino',
    opponent: 'Torino',
    competition: 'Serie A · G14',
    score: '0-1',
    lat: 45.0418,
    lon: 7.6501,
    distanceKm: 714,
  },
  {
    matchOrder: 8,
    date: '2026-12-15',
    season: '2026-27',
    city: 'Roma',
    stadium: 'Stadio Olimpico',
    opponent: 'Lazio',
    competition: 'Coppa Italia · Ottavi',
    score: '1-2',
    lat: 41.9341,
    lon: 12.4547,
    distanceKm: 192,
  },
  {
    matchOrder: 9,
    date: '2027-01-18',
    season: '2026-27',
    city: 'Bergamo',
    stadium: 'Gewiss Stadium',
    opponent: 'Atalanta',
    competition: 'Serie A · G21',
    score: '2-3',
    lat: 45.7089,
    lon: 9.6808,
    distanceKm: 658,
  },
  {
    matchOrder: 10,
    date: '2027-02-02',
    season: '2026-27',
    city: 'Roma',
    stadium: 'Stadio Olimpico',
    opponent: 'Roma',
    competition: 'Serie A · G23',
    score: '1-1',
    lat: 41.9341,
    lon: 12.4547,
    distanceKm: 192,
  },
  {
    matchOrder: 11,
    date: '2027-02-21',
    season: '2026-27',
    city: 'Torino',
    stadium: 'Allianz Stadium',
    opponent: 'Juventus',
    competition: 'Serie A · G25',
    score: '0-0',
    lat: 45.1096,
    lon: 7.6413,
    distanceKm: 719,
  },
];

export interface XFeedPost {
  id: string;
  date: string;
  category: string;
  textIt: string;
  textEn: string;
  hashtags: string[];
  citedSource: string;
  sourceUrl?: string;
  views: number;
  likes: number;
  reposts: number;
  verificationMethodIt: string;
  verificationMethodEn: string;
}

// Exact posts from the user's @sscnapolidata screenshot + verified RUOLO.txt fact-checked curiosities
export const X_FEED_POSTS: XFeedPost[] = [
  {
    id: 'x-post-1',
    date: 'Oct 24, 2026',
    category: '👤 Allenatore · Record Serie A',
    textIt:
      'Gasperini, in occasione del match, diventa il 4° allenatore con più panchine nella storia della Serie A a girone unico (645, scavalcato Nils Liedholm). Meglio dell’allenatore della Roma solo Giovanni Trapattoni (689), Nereo Rocco (787) e Carlo Mazzone (792).',
    textEn:
      'Gasperini, on the occasion of this match, becomes the 4th coach with the most appearances in single-table Serie A history (645, overtaking Nils Liedholm). Only Giovanni Trapattoni (689), Nereo Rocco (787) and Carlo Mazzone (792) sit ahead.',
    hashtags: [],
    citedSource: '@kamasport_',
    views: 24,
    likes: 3,
    reposts: 1,
    verificationMethodIt: 'Verifica incrociata con almanacco panchine Serie A a girone unico (dal 1929/30) e citazione esplicita fonte @kamasport_.',
    verificationMethodEn: 'Cross-checked against single-round Serie A coaching appearances (since 1929/30) with explicit @kamasport_ attribution.',
  },
  {
    id: 'x-post-2',
    date: 'Oct 24, 2026',
    category: '🌀 Minutaggio · Serie A',
    textIt:
      'Di Lorenzo e Rrahmani sono i soli due giocatori del #Napoli con tutti i minuti disponibili disputati in campionato. La #Roma è una delle 4 squadre in cui nessun giocatore è rimasto in campo per tutti i 630’ recuperi inclusi, come Como, Monza e Torino.',
    textEn:
      'Di Lorenzo and Rrahmani are the only two #Napoli players to have played every available minute in the league. #Roma is one of 4 teams where no outfield player stayed on the pitch for all 630’ plus stoppage time, alongside Como, Monza and Torino.',
    hashtags: ['#Napoli', '#Roma'],
    citedSource: '@kamasport_',
    views: 146,
    likes: 1,
    reposts: 1,
    verificationMethodIt: 'Riscontro sui report minutaggio ufficiale Lega Serie A delle prime 7 giornate (630 minuti regolamentari).',
    verificationMethodEn: 'Verified against official Lega Serie A playing-time reports across the first 7 matchdays (630 regular minutes).',
  },
  {
    id: 'x-post-3',
    date: 'Oct 24, 2026',
    category: '👤 Giocatore · Thread Napoli-Roma',
    textIt:
      'Il primatista tra i giallorossi è Mario Hermoso, a quota 506 minuti disputati.',
    textEn:
      'The appearance leader in minutes among the Giallorossi is Mario Hermoso, with 506 minutes played.',
    hashtags: ['#NapoliRoma', '#ForzaNapoliSempre'],
    citedSource: '@kamasport_',
    views: 41,
    likes: 2,
    reposts: 0,
    verificationMethodIt: 'Continuazione del thread minutaggi Napoli-Roma; fonte primaria citata @kamasport_.',
    verificationMethodEn: 'Continuation of the Napoli-Roma playing time thread; primary source credited @kamasport_.',
  },
  {
    id: 'x-post-4',
    date: 'Oct 24, 2026',
    category: '💙 Serie Positiva · Tutte le Competizioni',
    textIt:
      'Considerando tutte le competizioni, il #Napoli arriva da tre successi casalinghi consecutivi. Contro la #Roma cerca il quarto: l’ultima serie risale al periodo tra agosto e ottobre 2025.',
    textEn:
      'Across all competitions, #Napoli come into the match on three consecutive home wins. Against #Roma they seek a fourth: the last such run dates back to August–October 2025.',
    hashtags: ['#Napoli', '#Roma', '#NapoliAnalitica'],
    citedSource: 'Elaborazione @sscnapolidata su DB SQLite (partite ufficiali)',
    views: 89,
    likes: 7,
    reposts: 2,
    verificationMethodIt: 'Query SQL su db/datanapoli.sqlite filtrando squadra_casa_id = Napoli e partite ufficiali.',
    verificationMethodEn: 'SQL query on db/datanapoli.sqlite filtering home_team_id = Napoli across official matches.',
  },
  {
    id: 'x-post-5',
    date: 'Oct 18, 2026',
    category: '🤯 Assurdità Statistica · Coppa Italia 1962',
    textIt:
      'Il Napoli è una delle sole due squadre nella storia del calcio italiano (insieme al Vado nel 1922) ad aver vinto la Coppa Italia militando in Serie B: 21 giugno 1962, Napoli-SPAL 2-1 all’Olimpico (Corelli, Ronzon). #NapoliAnalitica',
    textEn:
      'Napoli is one of only two clubs in Italian football history (alongside Vado in 1922) to win the Coppa Italia while playing in Serie B: 21 June 1962, Napoli 2-1 SPAL at the Olimpico (Corelli, Ronzon). #NapoliAnalitica',
    hashtags: ['#NapoliAnalitica'],
    citedSource: 'RSSSF — Italy Coppa Italia 1961/62 & Albo d’Oro Lega Serie A',
    views: 312,
    likes: 28,
    reposts: 9,
    verificationMethodIt: 'Doppia verifica Livello 1 (Lega Serie A Albo d’Oro) e Livello 2 (RSSSF Italy Cup 1961/62).',
    verificationMethodEn: 'Double verification Tier 1 (Lega Serie A Roll of Honor) and Tier 2 (RSSSF Italy Cup 1961/62).',
  },
];

export interface HistoricalEra {
  id: string;
  periodLabel: string;
  titleIt: string;
  titleEn: string;
  presidentIt: string;
  presidentEn: string;
  isPre1926: boolean;
  inheritsLegal: 0 | 1;
  inheritsSportingRecord: 0 | 1;
  summaryIt: string;
  summaryEn: string;
  keyFactsIt: string[];
  keyFactsEn: string[];
  iconicSquad: {
    season: string;
    coach: string;
    formation: string;
    starters: { number: number; name: string; role: string }[];
    trophyWon?: string;
  };
  source: string;
}

export const HISTORICAL_ERAS: HistoricalEra[] = [
  {
    id: '1900-1926-pionieri',
    periodLabel: '1905 – 1926',
    titleIt: 'Pre-Fondazione: Naples FBC, Internazionale Napoli e Internaples',
    titleEn: 'Pre-Foundation: Naples FBC, Internazionale Napoli & Internaples',
    presidentIt: 'Emilio Anatra / Emilio Reale / Giorgio Ascarelli (Internaples)',
    presidentEn: 'Emilio Anatra / Emilio Reale / Giorgio Ascarelli (Internaples)',
    isPre1926: true,
    inheritsLegal: 1,
    inheritsSportingRecord: 0,
    summaryIt:
      'Sezione separata dal computo statistico sportivo post-1926. Nel 1905 nasce il Naples Foot-Ball & Cricket Club (William Poths, Hector Bayon, Emilio Anatra); nel 1911 una scissione dà vita all’US Internazionale Napoli. Nel 1922 le due società si fondono nel FBC Internaples. Il 1° agosto 1926 l’assemblea dei soci dell’Internaples, guidata da Giorgio Ascarelli, cambia denominazione in Associazione Calcio Napoli. Regola DB: inherits_legal = 1, inherits_sporting_record = 0.',
    summaryEn:
      'Section separated from the post-1926 sporting statistical record. In 1905 Naples Foot-Ball & Cricket Club was founded (William Poths, Hector Bayon, Emilio Anatra); in 1911 a split created US Internazionale Napoli. In 1922 the two merged into FBC Internaples. On 1 August 1926 the Internaples board led by Giorgio Ascarelli changed its name to Associazione Calcio Napoli. DB rule: inherits_legal = 1, inherits_sporting_record = 0.',
    keyFactsIt: [
      '1905: Fondazione Naples Foot-Ball Club (maglia a strisce celesti e blu)',
      '1911: Nascita dell’US Internazionale Napoli (maglia blu con scudo Savoia)',
      '1912–1913: Finali Centro-Sud disputate tra Naples e Lazio',
      '1922: Fusione in FBC Internaples; 1925/26 finale Lega Sud contro l’Alba Roma',
    ],
    keyFactsEn: [
      '1905: Foundation of Naples Foot-Ball Club (sky blue and navy striped shirt)',
      '1911: Creation of US Internazionale Napoli (dark blue shirt)',
      '1912–1913: South-Central finals contested between Naples and Lazio',
      '1922: Merger into FBC Internaples; 1925/26 Southern League final vs Alba Roma',
    ],
    iconicSquad: {
      season: '1925-26 (FBC Internaples)',
      coach: 'Bino Skasa',
      formation: '2-3-5 (Metodo Piramidale)',
      starters: [
        { number: 1, name: 'Cavalli', role: 'POR' },
        { number: 2, name: 'Kragl', role: 'TER' },
        { number: 3, name: 'Innocenti', role: 'TER' },
        { number: 4, name: 'Fariello', role: 'MED' },
        { number: 5, name: 'Steiger', role: 'CEN' },
        { number: 6, name: 'Valente', role: 'MED' },
        { number: 7, name: 'Clerici', role: 'ALA' },
        { number: 8, name: 'Ghisi I', role: 'INT' },
        { number: 9, name: 'Sallustro I (Attila)', role: 'ATT' },
        { number: 10, name: 'Ferrari', role: 'INT' },
        { number: 11, name: 'Sacchi', role: 'ALA' },
      ],
      trophyWon: 'Campione Lega Sud 1925/26 (non conteggiato nel palmarès SSC Napoli)',
    },
    source: 'RSSSF — Italy Championship 1925/26 & Archivio Storico Calcio Napoletano',
  },
  {
    id: '1926-1936-ascarelli',
    periodLabel: '1926 – 1936',
    titleIt: 'Presidenza Giorgio Ascarelli e Giovanni Maresca di Serracapriola',
    titleEn: 'Presidency of Giorgio Ascarelli & Giovanni Maresca di Serracapriola',
    presidentIt: 'Giorgio Ascarelli (1926–1927, 1929–1930)',
    presidentEn: 'Giorgio Ascarelli (1926–1927, 1929–1930)',
    isPre1926: false,
    inheritsLegal: 1,
    inheritsSportingRecord: 1,
    summaryIt:
      'Il 1° agosto 1926 nasce ufficialmente l’Associazione Calcio Napoli. Giorgio Ascarelli porta a Napoli l’allenatore inglese William Garbutt, ingaggia Antonio Vojak accanto ad Attila Sallustro e costruisce a proprie spese il primo stadio di proprietà del club al Rione Luzzatti (inaugurato nel febbraio 1930, due settimane prima della prematura scomparsa di Ascarelli a 35 anni). Due terzi posti in Serie A (1932/33 e 1933/34).',
    summaryEn:
      'On 1 August 1926 Associazione Calcio Napoli was officially established. Giorgio Ascarelli hired English manager William Garbutt, signed Antonio Vojak alongside Attila Sallustro, and privately financed the club’s first owned stadium in Rione Luzzatti (inaugurated February 1930, two weeks before Ascarelli’s untimely passing at age 35). Two 3rd-place finishes in Serie A (1932/33 and 1933/34).',
    keyFactsIt: [
      '1 agosto 1926: Atto costitutivo dell’Associazione Calcio Napoli',
      '23 febbraio 1930: Inaugurazione Stadio Vesuvio / Giorgio Ascarelli (Napoli-Juventus 2-2)',
      '1932/33 e 1933/34: Doppio 3° posto in Serie A con William Garbutt in panchina',
      'Antonio Vojak stabilisce il record di 102 reti in Serie A col Napoli',
    ],
    keyFactsEn: [
      '1 August 1926: Founding charter of Associazione Calcio Napoli',
      '23 February 1930: Inauguration of Stadio Vesuvio / Giorgio Ascarelli (Napoli 2-2 Juventus)',
      '1932/33 & 1933/34: Back-to-back 3rd-place Serie A finishes under William Garbutt',
      'Antonio Vojak sets record of 102 Serie A goals for Napoli',
    ],
    iconicSquad: {
      season: '1932-33 (3° Posto Serie A)',
      coach: 'William Garbutt',
      formation: '2-3-5',
      starters: [
        { number: 1, name: 'Giuseppe Cavanna', role: 'POR' },
        { number: 2, name: 'Giovanni Vincenzi', role: 'TER' },
        { number: 3, name: 'Luigi Castello', role: 'TER' },
        { number: 4, name: 'Enrico Colombari', role: 'MED' },
        { number: 5, name: 'Paulo Innocenti', role: 'CEN' },
        { number: 6, name: 'Enrico Rivolta', role: 'MED' },
        { number: 7, name: 'Pietro Ferraris', role: 'ALA' },
        { number: 8, name: 'Antonio Vojak', role: 'INT' },
        { number: 9, name: 'Attila Sallustro', role: 'ATT' },
        { number: 10, name: 'Gino Rossetti', role: 'INT' },
        { number: 11, name: 'Raffaele Sansone', role: 'ALA' },
      ],
    },
    source: 'Almanacco Illustrato del Calcio & RSSSF Italy 1932/33',
  },
  {
    id: '1936-1968-lauro',
    periodLabel: '1936 – 1968',
    titleIt: 'Presidenza Achille Lauro, il Collana, il San Paolo e la 1ª Coppa Italia',
    titleEn: 'Presidency of Achille Lauro, Stadio San Paolo & 1st Coppa Italia',
    presidentIt: 'Achille Lauro / Alfonso Cuomo / Roberto Fiore',
    presidentEn: 'Achille Lauro / Alfonso Cuomo / Roberto Fiore',
    isPre1926: false,
    inheritsLegal: 1,
    inheritsSportingRecord: 1,
    summaryIt:
      'Dagli anni del Vomero (Stadio Arturo Collana) all’inaugurazione dello Stadio del Sole (poi San Paolo) il 6 dicembre 1959 (Napoli-Juventus 2-1). Arrivano campioni come Hasse Jeppson, Bruno Pesaola, Luís Vinício, e negli anni ’60 Omar Sívori e José Altafini. Nel 1962 il Napoli vince la sua prima Coppa Italia (unico club di Serie B insieme al Vado 1922). Il 25 giugno 1964 la società assume la denominazione Società Sportiva Calcio Napoli.',
    summaryEn:
      'From the Vomero years (Stadio Arturo Collana) to the inauguration of Stadio del Sole (later San Paolo) on 6 December 1959 (Napoli 2-1 Juventus). Stars arrived including Hasse Jeppson, Bruno Pesaola, Luís Vinício, and in the 1960s Omar Sívori and José Altafini. In 1962 Napoli won its first Coppa Italia. On 25 June 1964 the club adopted the name Società Sportiva Calcio Napoli.',
    keyFactsIt: [
      '6 dicembre 1959: Inaugurazione Stadio del Sole (San Paolo) a Fuorigrotta, Napoli-Juventus 2-1',
      '21 giugno 1962: Vittoria della 1ª Coppa Italia (Napoli-SPAL 2-1)',
      '25 giugno 1964: Cambio denominazione in Società Sportiva Calcio Napoli (SSC Napoli)',
      '1967/68: 2° posto in Serie A con Altafini, Sívori, Juliano e Zoff',
    ],
    keyFactsEn: [
      '6 December 1959: Inauguration of Stadio del Sole (San Paolo) in Fuorigrotta, Napoli 2-1 Juventus',
      '21 June 1962: First Coppa Italia triumph (Napoli 2-1 SPAL)',
      '25 June 1964: Official renaming to Società Sportiva Calcio Napoli (SSC Napoli)',
      '1967/68: 2nd place in Serie A with Altafini, Sívori, Juliano and Zoff',
    ],
    iconicSquad: {
      season: '1967-68 (2° Posto Serie A)',
      coach: 'Bruno Pesaola',
      formation: '4-3-3',
      starters: [
        { number: 1, name: 'Dino Zoff', role: 'POR' },
        { number: 2, name: 'dino Panzanato', role: 'DIF' },
        { number: 3, name: 'Mario Zurlini', role: 'DIF' },
        { number: 4, name: 'Stelio Nardin', role: 'TER' },
        { number: 5, name: 'Luigi Pogliana', role: 'TER' },
        { number: 6, name: 'Ottavio Bianchi', role: 'MED' },
        { number: 7, name: 'Cané', role: 'ALA' },
        { number: 8, name: 'Antonio Juliano', role: 'CEN' },
        { number: 9, name: 'José Altafini', role: 'ATT' },
        { number: 10, name: 'Omar Sívori', role: 'ATT' },
        { number: 11, name: 'Paolo Barison', role: 'ALA' },
      ],
      trophyWon: 'Coppa Italia 1961/62 · Coppa delle Alpi 1966',
    },
    source: 'RSSSF — Italy 1967/68 & Archivio Storico SSC Napoli',
  },
  {
    id: '1969-1993-ferlaino',
    periodLabel: '1969 – 1993',
    titleIt: 'Presidenza Corrado Ferlaino: Dal Calcio Totale di Vinício all’Epopea di Maradona',
    titleEn: 'Presidency of Corrado Ferlaino: Total Football to the Maradona Era',
    presidentIt: 'Corrado Ferlaino',
    presidentEn: 'Corrado Ferlaino',
    isPre1926: false,
    inheritsLegal: 1,
    inheritsSportingRecord: 1,
    summaryIt:
      'Il ciclo più decorato del Novecento azzurro: la Coppa Italia 1975/76, l’acquisto di Diego Armando Maradona dal Barcellona il 30 giugno 1984 (presentato il 5 luglio davanti a ~70.000 spettatori al San Paolo), il primo Scudetto e la Coppa Italia con 13 vittorie su 13 nel 1986/87, la Coppa UEFA 1988/89, il secondo Scudetto 1989/90 e la Supercoppa Italiana 1990 (5-1 alla Juventus).',
    summaryEn:
      'The most decorated 20th-century cycle: the 1975/76 Coppa Italia, the signing of Diego Armando Maradona from Barcelona on 30 June 1984 (unveiled on 5 July before ~70,000 fans at the San Paolo), the first Scudetto and Coppa Italia (winning all 13 cup matches) in 1986/87, the 1988/89 UEFA Cup, the 1989/90 second Scudetto, and the 1990 Supercoppa Italiana (5-1 vs Juventus).',
    keyFactsIt: [
      '1975/76: 2ª Coppa Italia (Napoli-Verona 4-0 all’Olimpico)',
      '1986/87: 1° Scudetto + 3ª Coppa Italia (13 vittorie su 13 partite disputate)',
      '17 maggio 1989: Vittoria Coppa UEFA (Napoli-Stoccarda 2-1 e 3-3)',
      '1989/90: 2° Scudetto + Supercoppa Italiana 1990 (Napoli-Juventus 5-1)',
    ],
    keyFactsEn: [
      '1975/76: 2nd Coppa Italia (Napoli 4-0 Verona at the Olimpico)',
      '1986/87: 1st Scudetto + 3rd Coppa Italia (13 wins out of 13 matches played)',
      '17 May 1989: UEFA Cup triumph (Napoli vs Stuttgart 2-1 and 3-3)',
      '1989/90: 2nd Scudetto + 1990 Supercoppa Italiana (Napoli 5-1 Juventus)',
    ],
    iconicSquad: {
      season: '1986-87 (1° Scudetto + Coppa Italia)',
      coach: 'Ottavio Bianchi',
      formation: '4-4-2 / Zona Mista',
      starters: [
        { number: 1, name: 'Claudio Garella', role: 'POR' },
        { number: 2, name: 'Ciro Ferrara', role: 'DIF' },
        { number: 3, name: 'Giuseppe Volpecina', role: 'TER' },
        { number: 4, name: 'Salvatore Bagni', role: 'CEN' },
        { number: 5, name: 'Moreno Ferrario', role: 'DIF' },
        { number: 6, name: 'Alessandro Renica', role: 'LIB' },
        { number: 7, name: 'Andrea Carnevale', role: 'ATT' },
        { number: 8, name: 'Fernando De Napoli', role: 'CEN' },
        { number: 9, name: 'Bruno Giordano', role: 'ATT' },
        { number: 10, name: 'Diego Armando Maradona (C)', role: 'TRE' },
        { number: 11, name: 'Francesco Romano', role: 'REG' },
      ],
      trophyWon: 'Scudetto 1986/87, 1989/90 · Coppa UEFA 1988/89 · Coppa Italia 1975/76, 1986/87 · Supercoppa 1990',
    },
    source: 'Almanacco Illustrato del Calcio Panini & UEFA Official Archive',
  },
  {
    id: '2004-oggi-delaurentiis',
    periodLabel: '2004 – Oggi',
    titleIt: 'Presidenza Aurelio De Laurentiis: Dalla Serie C al 3° Scudetto e Costanza Europea',
    titleEn: 'Presidency of Aurelio De Laurentiis: From Serie C to the 3rd Scudetto & European Consistency',
    presidentIt: 'Aurelio De Laurentiis',
    presidentEn: 'Aurelio De Laurentiis',
    isPre1926: false,
    inheritsLegal: 1,
    inheritsSportingRecord: 1,
    summaryIt:
      'Nel settembre 2004 Aurelio De Laurentiis rileva il titolo sportivo dalla curatela fallimentare ripartendo dalla Serie C1. In tre anni il Napoli torna in Serie A (2007) e riacquista la denominazione storica SSC Napoli. Seguono 14 qualificazioni consecutive alle coppe europee, tre Coppe Italia (2012, 2014, 2020), la Supercoppa 2014 a Doha, i record realizzativi di Hamšík, Mertens e Higuaín (36 gol in Serie A 2015/16) e il trionfale 3° Scudetto nella stagione 2022/23 con Luciano Spalletti.',
    summaryEn:
      'In September 2004 Aurelio De Laurentiis acquired the sporting title, restarting from Serie C1. Within three years Napoli returned to Serie A (2007) and reclaimed the historical SSC Napoli name. Fourteen consecutive European qualifications followed, along with three Coppe Italia (2012, 2014, 2020), the 2014 Supercoppa in Doha, all-time scoring records by Mertens and Hamšík, and the 3rd Scudetto in 2022/23 under Luciano Spalletti.',
    keyFactsIt: [
      '2011/12, 2013/14, 2019/20: Vittoria della 4ª, 5ª e 6ª Coppa Italia',
      '22 dicembre 2014: Vittoria della 2ª Supercoppa Italiana a Doha',
      '2015/16: Gonzalo Higuaín segna 36 reti in un singolo campionato di Serie A',
      '4 maggio 2023: Conquista matematica del 3° Scudetto (90 punti finali)',
    ],
    keyFactsEn: [
      '2011/12, 2013/14, 2019/20: 4th, 5th and 6th Coppa Italia titles',
      '22 December 2014: 2nd Supercoppa Italiana triumph in Doha',
      '2015/16: Gonzalo Higuaín scores 36 goals in a single Serie A campaign',
      '4 May 2023: Mathematical clinching of the 3rd Scudetto (90 final points)',
    ],
    iconicSquad: {
      season: '2022-23 (3° Scudetto · 90 Punti)',
      coach: 'Luciano Spalletti',
      formation: '4-3-3',
      starters: [
        { number: 1, name: 'Alex Meret', role: 'POR' },
        { number: 22, name: 'Giovanni Di Lorenzo (C)', role: 'TER' },
        { number: 13, name: 'Amir Rrahmani', role: 'DIF' },
        { number: 3, name: 'Kim Min-jae', role: 'DIF' },
        { number: 6, name: 'Mário Rui', role: 'TER' },
        { number: 99, name: 'Frank Anguissa', role: 'CEN' },
        { number: 68, name: 'Stanislav Lobotka', role: 'REG' },
        { number: 20, name: 'Piotr Zieliński', role: 'CEN' },
        { number: 21, name: 'Matteo Politano', role: 'ALA' },
        { number: 9, name: 'Victor Osimhen', role: 'ATT' },
        { number: 77, name: 'Khvicha Kvaratskhelia', role: 'ALA' },
      ],
      trophyWon: 'Scudetto 2022/23 · Coppa Italia 2011/12, 2013/14, 2019/20 · Supercoppa 2014',
    },
    source: 'Lega Serie A Official Archive & openfootball (CC0)',
  },
];

export interface AlmanacRecord {
  id: string;
  category: 'marcatori' | 'presenze' | 'allenatori' | 'trofei' | 'record_squadra';
  titleIt: string;
  titleEn: string;
  holder: string;
  value: string;
  period: string;
  detailIt: string;
  detailEn: string;
  source: string;
}

export const ALMANAC_RECORDS: AlmanacRecord[] = [
  {
    id: 'rec-goals-alltime',
    category: 'marcatori',
    titleIt: 'Miglior marcatore assoluto (tutte le competizioni ufficiali)',
    titleEn: 'All-time top scorer (all official competitions)',
    holder: 'Dries Mertens',
    value: '148 gol',
    period: '2013 – 2022 (397 presenze)',
    detailIt: '113 in Serie A, 6 in Coppa Italia, 29 nelle Coppe Europee.',
    detailEn: '113 in Serie A, 6 in Coppa Italia, 29 in European competitions.',
    source: 'SSC Napoli Official & UEFA / Lega Serie A',
  },
  {
    id: 'rec-goals-2nd',
    category: 'marcatori',
    titleIt: '2° miglior marcatore assoluto',
    titleEn: '2nd all-time top scorer',
    holder: 'Lorenzo Insigne',
    value: '122 gol',
    period: '2010 – 2022 (434 presenze)',
    detailIt: '96 in Serie A, 8 in Coppa Italia, 18 nelle Coppe Europee.',
    detailEn: '96 in Serie A, 8 in Coppa Italia, 18 in European competitions.',
    source: 'Lega Serie A & UEFA Archive',
  },
  {
    id: 'rec-goals-3rd',
    category: 'marcatori',
    titleIt: '3° miglior marcatore assoluto',
    titleEn: '3rd all-time top scorer',
    holder: 'Marek Hamšík',
    value: '121 gol',
    period: '2007 – 2019 (520 presenze)',
    detailIt: '100 in Serie A, 5 in Coppa Italia, 16 nelle Coppe Europee.',
    detailEn: '100 in Serie A, 5 in Coppa Italia, 16 in European competitions.',
    source: 'Lega Serie A & UEFA Archive',
  },
  {
    id: 'rec-goals-4th',
    category: 'marcatori',
    titleIt: '4° miglior marcatore assoluto',
    titleEn: '4th all-time top scorer',
    holder: 'Diego Armando Maradona',
    value: '115 gol',
    period: '1984 – 1991 (259 presenze)',
    detailIt: '81 in Serie A, 29 in Coppa Italia, 5 nelle Coppe Europee.',
    detailEn: '81 in Serie A, 29 in Coppa Italia, 5 in European competitions.',
    source: 'Almanacco Illustrato del Calcio Panini',
  },
  {
    id: 'rec-apps-1st',
    category: 'presenze',
    titleIt: 'Record assoluto di presenze ufficiali',
    titleEn: 'All-time official appearances record',
    holder: 'Marek Hamšík',
    value: '520 presenze',
    period: '2007 – 2019',
    detailIt: '408 in Serie A, 32 in Coppa Italia/Supercoppa, 80 nelle Coppe Europee.',
    detailEn: '408 in Serie A, 32 in Coppa Italia/Supercoppa, 80 in European cups.',
    source: 'SSC Napoli Official Archive',
  },
  {
    id: 'rec-apps-2nd',
    category: 'presenze',
    titleIt: '2° per presenze ufficiali',
    titleEn: '2nd in all-time official appearances',
    holder: 'Giuseppe Bruscolotti',
    value: '511 presenze',
    period: '1972 – 1988',
    detailIt: '387 in Serie A, 96 in Coppa Italia, 28 nelle Coppe Europee.',
    detailEn: '387 in Serie A, 96 in Coppa Italia, 28 in European cups.',
    source: 'Almanacco Illustrato del Calcio Panini',
  },
  {
    id: 'rec-apps-3rd',
    category: 'presenze',
    titleIt: '3° per presenze ufficiali',
    titleEn: '3rd in all-time official appearances',
    holder: 'Antonio Juliano',
    value: '505 presenze',
    period: '1962 – 1978',
    detailIt: '355 in Serie A, 39 in Serie B, 72 in Coppa Italia, 39 in Europa.',
    detailEn: '355 in Serie A, 39 in Serie B, 72 in Coppa Italia, 39 in Europe.',
    source: 'Almanacco Illustrato del Calcio Panini',
  },
  {
    id: 'rec-coach-1st',
    category: 'allenatori',
    titleIt: 'Allenatore con più panchine ufficiali nel Napoli',
    titleEn: 'Coach with most official matches in charge of Napoli',
    holder: 'Bruno Pesaola',
    value: '253 panchine',
    period: '1962–1968, 1976–1977, 1982–1983',
    detailIt: 'Vincitore della Coppa Italia 1961/62 e della Coppa delle Alpi 1966.',
    detailEn: 'Winner of the 1961/62 Coppa Italia and 1966 Coppa delle Alpi.',
    source: 'Almanacco Illustrato del Calcio Panini',
  },
  {
    id: 'rec-points-season',
    category: 'record_squadra',
    titleIt: 'Record di punti in un singolo campionato di Serie A',
    titleEn: 'Most points in a single Serie A season',
    holder: 'SSC Napoli 2017/18 (All. M. Sarri)',
    value: '91 punti',
    period: 'Stagione 2017-18 (28V, 7P, 3S)',
    detailIt: 'Seguito dai 90 punti della stagione Scudetto 2022/23.',
    detailEn: 'Followed by the 90 points of the 2022/23 Scudetto campaign.',
    source: 'Lega Serie A Official',
  },
  {
    id: 'rec-single-season-goals',
    category: 'record_squadra',
    titleIt: 'Record di gol in una singola Serie A (assoluto italiano a pari merito)',
    titleEn: 'Most goals in a single Serie A season (all-time Italian joint record)',
    holder: 'Gonzalo Higuaín',
    value: '36 gol',
    period: 'Stagione 2015-16 (35 presenze)',
    detailIt: 'Tripletta all’ultima giornata in Napoli-Frosinone 4-0 (14 maggio 2016).',
    detailEn: 'Hat-trick on the final matchday in Napoli 4-0 Frosinone (14 May 2016).',
    source: 'Lega Serie A Official',
  },
];

export interface NapoliLocation {
  id: string;
  name: string;
  type: 'stadio' | 'centro_sportivo' | 'sede' | 'ritiro';
  eraTags: ('1905-1926' | '1926-1959' | '1959-1989' | '1990-Oggi')[];
  yearsActive: string;
  address: string;
  lat: number;
  lon: number;
  descriptionIt: string;
  descriptionEn: string;
  source: string;
}

export const NAPOLI_LOCATIONS: NapoliLocation[] = [
  {
    id: 'loc-maradona',
    name: 'Stadio Diego Armando Maradona (ex San Paolo / Stadio del Sole)',
    type: 'stadio',
    eraTags: ['1959-1989', '1990-Oggi'],
    yearsActive: '1959 – Oggi',
    address: 'Piazzale Vincenzo Tecchio, Fuorigrotta, Napoli',
    lat: 40.8279,
    lon: 14.193,
    descriptionIt:
      'Inaugurato il 6 dicembre 1959 (Napoli-Juventus 2-1, gol di Vinício e Vitali). Progettato da Carlo Cocchia. Intitolato a Diego Armando Maradona il 4 dicembre 2020.',
    descriptionEn:
      'Inaugurated on 6 December 1959 (Napoli 2-1 Juventus, goals by Vinício and Vitali). Designed by Carlo Cocchia. Renamed after Diego Armando Maradona on 4 December 2020.',
    source: 'Comune di Napoli & Archivio Storico SSC Napoli',
  },
  {
    id: 'loc-collana',
    name: 'Stadio Arturo Collana (ex Stadio Littorio / Stadio della Liberazione)',
    type: 'stadio',
    eraTags: ['1926-1959'],
    yearsActive: '1933 – 1959 (e gare nel 1945-48)',
    address: 'Piazza Quattro Giornate, Vomero, Napoli',
    lat: 40.8444,
    lon: 14.2256,
    descriptionIt:
      'Casa storica del Napoli sulla collina del Vomero dagli anni ’30 fino all’apertura del San Paolo nel 1959.',
    descriptionEn:
      'Historic home of Napoli on the Vomero hill from the 1930s until the opening of the San Paolo in 1959.',
    source: 'Archivio Storico Comune di Napoli',
  },
  {
    id: 'loc-ascarelli',
    name: 'Stadio Giorgio Ascarelli (Stadio Vesuvio / Partenopeo)',
    type: 'stadio',
    eraTags: ['1926-1959'],
    yearsActive: '1930 – 1942',
    address: 'Rione Luzzatti / Poggioreale, Napoli',
    lat: 40.8589,
    lon: 14.2912,
    descriptionIt:
      'Primo e unico stadio di proprietà nella storia del club, finanziato dal presidente Giorgio Ascarelli. Inaugurato il 23 febbraio 1930, distrutto dai bombardamenti del 1942.',
    descriptionEn:
      'First and only club-owned stadium in history, funded by president Giorgio Ascarelli. Inaugurated 23 February 1930, destroyed by bombings in 1942.',
    source: 'Archivio Storico Calcio Napoletano',
  },
  {
    id: 'loc-arenaccia',
    name: 'Campo Militare dell’Arenaccia (Albergo dei Poveri)',
    type: 'stadio',
    eraTags: ['1905-1926', '1926-1959'],
    yearsActive: '1926 – 1929',
    address: 'Via Arenaccia / Piazza Carlo III, Napoli',
    lat: 40.8632,
    lon: 14.2684,
    descriptionIt:
      'Teatro della prima partita ufficiale dell’Associazione Calcio Napoli nella Divisione Nazionale 1926/27.',
    descriptionEn:
      'Venue of the very first official match of Associazione Calcio Napoli in the 1926/27 National Division.',
    source: 'RSSSF — Italy 1926/27',
  },
  {
    id: 'loc-bagnoli',
    name: 'Campo dell’Ilva di Bagnoli & Poligono di Agnano',
    type: 'stadio',
    eraTags: ['1905-1926'],
    yearsActive: '1905 – 1926',
    address: 'Bagnoli / Conca d’Agnano, Napoli',
    lat: 40.8185,
    lon: 14.1695,
    descriptionIt:
      'Campi storici utilizzati da Naples Foot-Ball Club, US Internazionale Napoli e FBC Internaples prima del 1926.',
    descriptionEn:
      'Historic pitches used by Naples Foot-Ball Club, US Internazionale Napoli and FBC Internaples prior to 1926.',
    source: 'Storia del Calcio a Napoli (1905-1926)',
  },
  {
    id: 'loc-soccavo',
    name: 'Centro Sportivo Paradiso di Soccavo',
    type: 'centro_sportivo',
    eraTags: ['1959-1989', '1990-Oggi'],
    yearsActive: '1975 – 2004',
    address: 'Via Domenico Padula, Soccavo, Napoli',
    lat: 40.8402,
    lon: 14.1981,
    descriptionIt:
      'Storico centro di allenamento dell’era Ferlaino e degli anni di Diego Armando Maradona, dove furono preparati i due Scudetti (1987, 1990) e la Coppa UEFA (1989).',
    descriptionEn:
      'Historic training center of the Ferlaino and Diego Armando Maradona era, where the two Scudetti (1987, 1990) and the UEFA Cup (1989) were prepared.',
    source: 'Archivio Storico SSC Napoli',
  },
  {
    id: 'loc-castelvolturno',
    name: 'SSC Napoli Konami Training Center (Castel Volturno)',
    type: 'centro_sportivo',
    eraTags: ['1990-Oggi'],
    yearsActive: '2006 – Oggi',
    address: 'SS Domitiana Km 35.300, Castel Volturno (CE)',
    lat: 40.9854,
    lon: 13.9721,
    descriptionIt:
      'Quartier generale tecnico e sede operativa della prima squadra nell’era De Laurentiis.',
    descriptionEn:
      'Technical headquarters and training ground of the first team during the De Laurentiis era.',
    source: 'SSC Napoli Official Website',
  },
  {
    id: 'loc-piazza-martiri',
    name: 'Sede Storica Piazza dei Martiri & Via Crispi',
    type: 'sede',
    eraTags: ['1959-1989', '1990-Oggi'],
    yearsActive: '1969 – 2004',
    address: 'Piazza dei Martiri 30 / Via Francesco Crispi, Chiaia, Napoli',
    lat: 40.8342,
    lon: 14.2419,
    descriptionIt:
      'Sede sociale storica del club a Chiaia, teatro della firma dei contratti negli anni ’70 e ’80.',
    descriptionEn:
      'Historic corporate headquarters in Chiaia where key contracts of the 1970s and 1980s were signed.',
    source: 'Archivio Storico SSC Napoli',
  },
  {
    id: 'loc-dimaro',
    name: 'Ritiro Estivo — Dimaro Folgarida (Val di Sole)',
    type: 'ritiro',
    eraTags: ['1990-Oggi'],
    yearsActive: '2011 – Oggi',
    address: 'Stadio Comunale di Carciato, Dimaro Folgarida (TN)',
    lat: 46.3268,
    lon: 10.8715,
    descriptionIt:
      'Sede storica del primo ritiro pre-campionato estivo del Napoli dal 2011.',
    descriptionEn:
      'Historic venue of Napoli’s first summer pre-season training camp since 2011.',
    source: 'SSC Napoli Official',
  },
  {
    id: 'loc-casteldisangro',
    name: 'Ritiro Estivo — Castel di Sangro (Abruzzo)',
    type: 'ritiro',
    eraTags: ['1990-Oggi'],
    yearsActive: '2020 – Oggi',
    address: 'Stadio Teofilo Patini, Castel di Sangro (AQ)',
    lat: 41.7847,
    lon: 14.1089,
    descriptionIt:
      'Sede della seconda fase di preparazione estiva pre-campionato dal 2020.',
    descriptionEn:
      'Venue of the second phase of summer pre-season preparation since 2020.',
    source: 'SSC Napoli Official',
  },
];

export interface MuseumRelic {
  id: string;
  accessionNumber: string;
  nameIt: string;
  nameEn: string;
  year: string;
  roomZone: string;
  descriptionIt: string;
  descriptionEn: string;
  dimensions: string;
  provenance: string;
  type: 'trofeo' | 'maglia' | 'pallone' | 'documento';
}

export const MUSEUM_RELICS: MuseumRelic[] = [
  {
    id: 'rel-scudetto-87',
    accessionNumber: 'ACC. 1987.05.10',
    nameIt: 'Coppa Campioni d’Italia — 1° Scudetto 1986/87',
    nameEn: 'Italian Champions Trophy — 1st Scudetto 1986/87',
    year: '1987',
    roomZone: 'Sala Centrale — Trionfi Tricolori',
    descriptionIt:
      'Conquistato il 10 maggio 1987 (Napoli-Fiorentina 1-1) con 42 punti in 30 giornate (15V, 12P, 3S). Prima squadra del Sud Italia continentale a vincere lo Scudetto a girone unico.',
    descriptionEn:
      'Clinched on 10 May 1987 (Napoli 1-1 Fiorentina) with 42 points in 30 games (15W, 12D, 3L). First club from mainland Southern Italy to win the single-round Serie A title.',
    dimensions: '45.0 × 21.0 cm · Base in pietra dura di sodalite blu e oro',
    provenance: 'Lega Nazionale Professionisti · Stagione 1986/87',
    type: 'trofeo',
  },
  {
    id: 'rel-uefa-89',
    accessionNumber: 'ACC. 1989.05.17',
    nameIt: 'Coppa UEFA 1988/89 (Finale di Stoccarda)',
    nameEn: '1988/89 UEFA Cup (Stuttgart Final)',
    year: '1989',
    roomZone: 'Ala Est — Notte Europea',
    descriptionIt:
      'Vinta il 17 maggio 1989 al Neckarstadion di Stoccarda (2-1 all’andata al San Paolo, 3-3 al ritorno con reti di Alemão, Ferrara e Careca) dopo aver eliminato PAOK, Lokomotiv Lipsia, Bordeaux, Juventus e Bayern Monaco.',
    descriptionEn:
      'Won on 17 May 1989 at Neckarstadion in Stuttgart (2-1 first leg at San Paolo, 3-3 second leg with goals by Alemão, Ferrara and Careca) after eliminating PAOK, Lokomotiv Leipzig, Bordeaux, Juventus and Bayern Munich.',
    dimensions: '65.0 × 33.0 cm · Argento massiccio su base in marmo giallo (Bertoni)',
    provenance: 'UEFA Archive · Stagione 1988/89',
    type: 'trofeo',
  },
  {
    id: 'rel-scudetto-90',
    accessionNumber: 'ACC. 1990.04.29',
    nameIt: 'Coppa Campioni d’Italia — 2° Scudetto 1989/90',
    nameEn: 'Italian Champions Trophy — 2nd Scudetto 1989/90',
    year: '1990',
    roomZone: 'Sala Centrale — Trionfi Tricolori',
    descriptionIt:
      'Conquistato il 29 aprile 1990 (Napoli-Lazio 1-0, gol di Marco Baroni al 7’) con 51 punti in 34 giornate e record casalingo di 16 vittorie e 1 pareggio su 17 gare al San Paolo.',
    descriptionEn:
      'Clinched on 29 April 1990 (Napoli 1-0 Lazio, Marco Baroni 7’) with 51 points in 34 games and a home record of 16 wins and 1 draw in 17 matches at the San Paolo.',
    dimensions: '45.0 × 21.0 cm · Lega Nazionale Professionisti',
    provenance: 'Lega Nazionale Professionisti · Stagione 1989/90',
    type: 'trofeo',
  },
  {
    id: 'rel-scudetto-23',
    accessionNumber: 'ACC. 2023.05.04',
    nameIt: 'Coppa Campioni d’Italia — 3° Scudetto 2022/23',
    nameEn: 'Italian Champions Trophy — 3rd Scudetto 2022/23',
    year: '2023',
    roomZone: 'Sala Centrale — Trionfi Tricolori',
    descriptionIt:
      'Vinto matematicamente il 4 maggio 2023 a Udine con 5 giornate di anticipo (record a pari merito in Serie A). Chiusura a 90 punti con miglior attacco (77) e miglior difesa (28).',
    descriptionEn:
      'Mathematically clinched on 4 May 2023 in Udine with 5 matchdays to spare (joint Serie A record). Finished on 90 points with best attack (77) and best defense (28).',
    dimensions: '58.0 × 24.0 cm · Oro e sodalite',
    provenance: 'Lega Serie A · Stagione 2022/23',
    type: 'trofeo',
  },
  {
    id: 'rel-coppa-italia-62',
    accessionNumber: 'ACC. 1962.06.21',
    nameIt: 'Coppa Italia 1961/62 — Il Trofeo dalla Serie B',
    nameEn: '1961/62 Coppa Italia — Won from Serie B',
    year: '1962',
    roomZone: 'Ala Ovest — Coppe Nazionali (6 Coppe Italia · 2 Supercoppe)',
    descriptionIt:
      'Primo trofeo ufficiale nella storia dell’AC Napoli dal 1926, conquistato battendo Torino, Milan, Roma, Mantova e in finale la SPAL (2-1).',
    descriptionEn:
      'First official major trophy in AC Napoli history since 1926, won by defeating Torino, Milan, Roma, Mantova and SPAL (2-1) in the final.',
    dimensions: '42.0 × 20.0 cm · Coppa Zaccaria Oberti',
    provenance: 'Lega Nazionale Professionisti · 21/06/1962',
    type: 'trofeo',
  },
  {
    id: 'rel-atto-1926',
    accessionNumber: 'ACC. 1926.08.01',
    nameIt: 'Verbale Assembleare del 1° Agosto 1926',
    nameEn: 'Board Resolution of 1 August 1926',
    year: '1926',
    roomZone: 'Atrio Storico — Fondazione',
    descriptionIt:
      'Atto con cui l’assemblea dei soci dell’Internaples, su proposta di Giorgio Ascarelli, delibera il cambio di denominazione in Associazione Calcio Napoli.',
    descriptionEn:
      'Document whereby the Internaples assembly, on Giorgio Ascarelli’s proposal, enacted the change of name to Associazione Calcio Napoli.',
    dimensions: '31.5 × 21.5 cm · Carta d’archivio',
    provenance: 'Archivio Storico Societario · 01/08/1926',
    type: 'documento',
  },
];

export interface HistoricalKit {
  id: string;
  season: string;
  decade: '1920s' | '1960s' | '1980s' | '1990s' | '2020s';
  type: 'Home' | 'Away' | 'Third';
  manufacturer: string;
  sponsor: string;
  primaryHex: string;
  secondaryHex: string;
  collarStyle: 'laces' | 'polo' | 'v-neck' | 'crew';
  notesIt: string;
  notesEn: string;
}

export const HISTORICAL_KITS: HistoricalKit[] = [
  {
    id: 'kit-1926-home',
    season: '1926-27',
    decade: '1920s',
    type: 'Home',
    manufacturer: 'Sartoria Storica Napoletana',
    sponsor: 'Nessuno',
    primaryHex: '#01A0E8',
    secondaryHex: '#FFFFFF',
    collarStyle: 'laces',
    notesIt: 'Prima maglia azzurra dell’AC Napoli con laccetti bianchi sul petto e stemma del cavallino rampante.',
    notesEn: 'First sky-blue AC Napoli shirt with white chest laces and rampant horse crest.',
  },
  {
    id: 'kit-1961-home',
    season: '1961-62',
    decade: '1960s',
    type: 'Home',
    manufacturer: 'In-House Lanificio',
    sponsor: 'Nessuno',
    primaryHex: '#008FD5',
    secondaryHex: '#FFFFFF',
    collarStyle: 'v-neck',
    notesIt: 'Maglia in lanetta azzurra con scollo a V bianco della prima Coppa Italia vinta nel 1962.',
    notesEn: 'Sky-blue wool-blend jersey with white V-neck worn during the 1962 Coppa Italia triumph.',
  },
  {
    id: 'kit-1986-home',
    season: '1986-87',
    decade: '1980s',
    type: 'Home',
    manufacturer: 'Ennerre (NR)',
    sponsor: 'Buitoni',
    primaryHex: '#01A0E8',
    secondaryHex: '#FFFFFF',
    collarStyle: 'polo',
    notesIt: 'Iconica maglia Ennerre in lanetta rasata con colletto a polo bianco e sponsor Buitoni del 1° Scudetto.',
    notesEn: 'Iconic Ennerre knitted jersey with white polo collar and Buitoni sponsor from the 1st Scudetto.',
  },
  {
    id: 'kit-1987-away',
    season: '1987-88',
    decade: '1980s',
    type: 'Away',
    manufacturer: 'Ennerre (NR)',
    sponsor: 'Buitoni',
    primaryHex: '#FFFFFF',
    secondaryHex: '#01A0E8',
    collarStyle: 'polo',
    notesIt: 'Maglia da trasferta bianca con fascia orizzontale azzurra sul petto e coccarda tricolore.',
    notesEn: 'White away shirt featuring the iconic sky-blue chest band, Scudetto shield and Coppa Italia cockade.',
  },
  {
    id: 'kit-1989-home',
    season: '1989-90',
    decade: '1990s',
    type: 'Home',
    manufacturer: 'Ennerre (NR)',
    sponsor: 'Mars',
    primaryHex: '#0194DA',
    secondaryHex: '#FFFFFF',
    collarStyle: 'v-neck',
    notesIt: 'Maglia del 2° Scudetto con sponsor Mars e bordini bianchi su colletto e maniche.',
    notesEn: 'Jersey of the 2nd Scudetto featuring the Mars sponsor and crisp white trim.',
  },
  {
    id: 'kit-2022-home',
    season: '2022-23',
    decade: '2020s',
    type: 'Home',
    manufacturer: 'EA7',
    sponsor: 'Lete / MSC',
    primaryHex: '#01A0E8',
    secondaryHex: '#0B3B68',
    collarStyle: 'v-neck',
    notesIt: 'Maglia del 3° Scudetto con maniche raglan in gradiente blu-azzurro e micro-pattern N.',
    notesEn: '3rd Scudetto jersey featuring gradient blue-cyan raglan sleeves and geometric N micro-pattern.',
  },
];

export interface StadiumSectorInfo {
  id: 'curva_b' | 'curva_a' | 'tribuna_posillipo' | 'distinti' | 'anello_superiore';
  nameIt: string;
  nameEn: string;
  capacity: string;
  coordinates3D: [number, number, number];
  historyIt: string;
  historyEn: string;
  choreographies: {
    year: string;
    match: string;
    titleIt: string;
    titleEn: string;
    descriptionIt: string;
    descriptionEn: string;
  }[];
  chants: {
    id: string;
    title: string;
    year: string;
    bpm: number;
    notesHz: number[];
    lyrics: string;
    contextIt: string;
    contextEn: string;
  }[];
}

export const STADIUM_SECTORS: StadiumSectorInfo[] = [
  {
    id: 'curva_b',
    nameIt: 'Curva B (Settore Nord-Est)',
    nameEn: 'Curva B (North-East End)',
    capacity: '~14.500 posti',
    coordinates3D: [0, 3.2, -9.2],
    historyIt:
      'Storico cuore pulsante del tifo organizzato sin dagli anni ’70 (Commando Ultrà Curva B fondato nel 1972 da Gennaro Montuori, poi Fedayn E.A.M. 1979 e gruppi contemporanei). Celebre per le coreografie monumentali negli anni degli Scudetti.',
    historyEn:
      'Historic heart of organized support since the 1970s (Commando Ultrà Curva B founded in 1972, Fedayn E.A.M. 1979 and contemporary groups). Famous for monumental choreographies during the Scudetto eras.',
    choreographies: [
      {
        year: '10 Maggio 1987',
        match: 'Napoli – Fiorentina 1-1',
        titleIt: 'Il Tricolore Gigante su Tutta la Curva B',
        titleEn: 'Giant Tricolore Across the Entire Curva B',
        descriptionIt: 'Manto tricolore e azzurro esteso dal terzo anello alla pista d’atletica per il primo Scudetto.',
        descriptionEn: 'Tricolore and sky-blue display stretching from the upper ring to the athletics track for the first Scudetto.',
      },
      {
        year: '3 Maggio 1989',
        match: 'Napoli – Stoccarda 2-1 (Finale Andata Coppa UEFA)',
        titleIt: 'Fumogeni Azzurri e Striscioni Storici',
        titleEn: 'Sky-Blue Flares & Historic Banners',
        descriptionIt: 'Coreografia pirotecnica e striscioni lungo l’intero anello superiore per la prima finale europea.',
        descriptionEn: 'Pyrotechnic display and banners spanning the entire upper ring for the first European final.',
      },
    ],
    chants: [
      {
        id: 'chant-giorno-allimprovviso',
        title: 'Un giorno all’improvviso',
        year: '2015 – Oggi',
        bpm: 128,
        notesHz: [261.63, 293.66, 329.63, 392.0, 329.63, 293.66, 261.63, 329.63],
        lyrics:
          "Un giorno all'improvviso / Mi innamorai di te / Il cuore mi batteva / Non chiedermi perché / Di tempo ne è passato / Ma sono ancora qua / E oggi come allora / Difendo la città!",
        contextIt: 'Adattamento corale sulle note di "L’estate sta finendo" dei Righeira (1985), divenuto inno identitario dello stadio.',
        contextEn: 'Choral adaptation set to the melody of Righeira’s "L’estate sta finendo" (1985), now a signature stadium anthem.',
      },
      {
        id: 'chant-o-mama-maradona',
        title: 'Oh mamma mamma mamma (Ho visto Maradona)',
        year: '1984 – Oggi',
        bpm: 136,
        notesHz: [329.63, 349.23, 392.0, 440.0, 392.0, 349.23, 329.63, 293.66],
        lyrics:
          "Oh mamma mamma mamma / Oh mamma mamma mamma / Sai perché mi batte il corazon? / Ho visto Maradona / Ho visto Maradona / Eh, mammà, innamorato son!",
        contextIt: 'Nato nell’estate 1984 sulle note di "La bamba" per celebrare l’arrivo di Diego Armando Maradona.',
        contextEn: 'Born in summer 1984 to the tune of "La bamba" to celebrate the arrival of Diego Armando Maradona.',
      },
    ],
  },
  {
    id: 'curva_a',
    nameIt: 'Curva A (Settore Sud-Ovest · Lato Piazzale Tecchio)',
    nameEn: 'Curva A (South-West End · Piazzale Tecchio Side)',
    capacity: '~14.500 posti',
    coordinates3D: [0, 3.2, 9.2],
    historyIt:
      'Affacciata verso Piazzale Tecchio e Viale Augusto, la Curva A diventa dalla fine degli anni ’70 e negli anni ’80/’90 il secondo polo incandescente del tifo partenopeo, creando il celebre effetto stereofonico a botta e risposta con la Curva B.',
    historyEn:
      'Facing Piazzale Tecchio and Viale Augusto, Curva A became from the late 1970s and 1980s the second passionate pole of Neapolitan support, creating the iconic call-and-response acoustic effect with Curva B.',
    choreographies: [
      {
        year: '29 Aprile 1990',
        match: 'Napoli – Lazio 1-0',
        titleIt: 'Scudetto II — Mosaico Azzurro e Tricolore',
        titleEn: '2nd Scudetto — Sky-Blue & Tricolore Mosaic',
        descriptionIt: 'Migliaia di bandiere azzurre e striscioni lungo la balaustra per la conquista del secondo titolo.',
        descriptionEn: 'Thousands of sky-blue flags and banners along the balustrade celebrating the second league title.',
      },
      {
        year: '4 Maggio 2023',
        match: 'Festa Scudetto (Maxischermi & Napoli-Fiorentina)',
        titleIt: 'Campioni d’Italia — Il Volto di Diego e il Numero 3',
        titleEn: 'Champions of Italy — Diego’s Portrait & Number 3',
        descriptionIt: 'Coreografia monumentale dedicata ai campioni del 2022/23 e alla memoria eterna di Maradona.',
        descriptionEn: 'Monumental choreography dedicated to the 2022/23 champions and the eternal memory of Maradona.',
      },
    ],
    chants: [
      {
        id: 'chant-sarà-bellissimo',
        title: 'I campioni dell’Italia siamo noi',
        year: '1987 / 1990 / 2023',
        bpm: 124,
        notesHz: [261.63, 329.63, 392.0, 523.25, 440.0, 392.0, 329.63, 261.63],
        lyrics:
          "E se ne va / La capolista se ne va / E se ne va / La capolista se ne va!",
        contextIt: 'Coro ritmico che accompagna le cavalcate tricolori, scandito all’unisono tra Curva A e Curva B.',
        contextEn: 'Rhythmic chant accompanying title runs, echoed in unison between Curva A and Curva B.',
      },
    ],
  },
  {
    id: 'distinti',
    nameIt: 'Settore Distinti (Lato Est · Via Claudio)',
    nameEn: 'Distinti Stand (East Side · Via Claudio)',
    capacity: '~14.000 posti',
    coordinates3D: [10.5, 3.0, 0],
    historyIt:
      'Il settore longitudinale opposto alle telecamere televisive: sempre inquadrato nelle dirette, celebre per la densità di sciarpe, bandiere e per il ruggito a ridosso del rettangolo verde.',
    historyEn:
      'The longitudinal stand opposite the main TV cameras: always in frame during broadcasts, renowned for its wall of scarves and flags.',
    choreographies: [
      {
        year: '7 Settembre 2022',
        match: 'Napoli – Liverpool 4-1 (Champions League)',
        titleIt: 'L’Urlo "The Champions" a 115 Decibel',
        titleEn: 'The 115-Decibel "The Champions" Roar',
        descriptionIt: 'Muro azzurro compatto sull’inno della UEFA Champions League.',
        descriptionEn: 'Compact sky-blue wall during the UEFA Champions League anthem.',
      },
    ],
    chants: [
      {
        id: 'chant-napoli-torna-campione',
        title: 'Napoli torna campione (Canta Napoli)',
        year: '1987 – Oggi',
        bpm: 120,
        notesHz: [293.66, 329.63, 369.99, 440.0, 369.99, 329.63, 293.66, 246.94],
        lyrics:
          "Forza Napoli, forza Napoli / Canta insieme a noi / Ovunque tu sarai / Non ti lasceremo mai!",
        contextIt: 'Coro trasversale cantato da Distinti e Curve nei finali di gara.',
        contextEn: 'Stadium-wide chant sung across Distinti and both Curve in the closing minutes.',
      },
    ],
  },
  {
    id: 'tribuna_posillipo',
    nameIt: 'Tribuna Posillipo & Tribuna Nisida (Lato Ovest)',
    nameEn: 'Tribuna Posillipo & Tribuna Nisida (West Main Stand)',
    capacity: '~11.500 posti',
    coordinates3D: [-10.5, 3.0, 0],
    historyIt:
      'Settore principale che ospita la Tribuna Autorità, la Tribuna Stampa (intitolata a Carlo Iuliano), l’uscita dagli spogliatoi e le panchine.',
    historyEn:
      'Main western stand housing the VIP boxes, the Press Box (named after Carlo Iuliano), the tunnel exit and the team dugouts.',
    choreographies: [
      {
        year: '5 Luglio 1984',
        match: 'Presentazione Ufficiale di Diego Armando Maradona',
        titleIt: 'I Gradini del Sottopassaggio e il Primo Palleggio',
        titleEn: 'The Tunnel Steps & The First Juggle',
        descriptionIt: 'L’uscita di Maradona dal tunnel sotto la Tribuna Posillipo davanti a 70.000 tifosi.',
        descriptionEn: 'Maradona emerging from the tunnel beneath Tribuna Posillipo in front of 70,000 fans.',
      },
    ],
    chants: [
      {
        id: 'chant-life-is-life',
        title: 'Live is Life (Warm-up Monaco 1989)',
        year: '19 Aprile 1989',
        bpm: 130,
        notesHz: [392.0, 440.0, 493.88, 523.25, 493.88, 440.0, 392.0, 329.63],
        lyrics: "Na-na-na-na-na! / Live is life!",
        contextIt: 'Omaggio acustico al riscaldamento iconico di Maradona in semifinale di Coppa UEFA.',
        contextEn: 'Acoustic tribute to Maradona’s iconic warm-up before the UEFA Cup semi-final.',
      },
    ],
  },
];

export const SQL_MIGRATIONS_CODE = `-- ============================================================================
-- DATA NAPOLI (@sscnapolidata) — MIGRAZIONI SQLITE NUMERATE (PRAGMA user_version)
-- Regola d'oro: Zero sentinelle 'ND' nei campi. NULL + tabella copertura.
-- ============================================================================

-- [002_audit.sql] Sessione contestuale e Audit Trail per campo con json_quote()
CREATE TABLE IF NOT EXISTS sessione (
  id       INTEGER PRIMARY KEY CHECK (id = 1),
  attore   TEXT,
  motivo   TEXT,
  fonte_id INTEGER,
  batch_id TEXT
);
INSERT OR IGNORE INTO sessione(id, attore) VALUES (1, 'cli_default');

CREATE TABLE IF NOT EXISTS audit_log (
  audit_id INTEGER PRIMARY KEY,
  ts       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  tabella  TEXT NOT NULL,
  pk       TEXT NOT NULL,
  azione   TEXT NOT NULL CHECK (azione IN ('I','U','D')),
  campo    TEXT,
  vecchio  TEXT,  -- json_quote(OLD.x) distingue NULL da 'NULL'
  nuovo    TEXT,  -- json_quote(NEW.x)
  attore   TEXT NOT NULL DEFAULT 'sconosciuto',
  motivo   TEXT,
  fonte_id INTEGER,
  batch_id TEXT
);
CREATE INDEX IF NOT EXISTS ix_audit_ts    ON audit_log(ts);
CREATE INDEX IF NOT EXISTS ix_audit_rec   ON audit_log(tabella, pk, campo, ts);
CREATE INDEX IF NOT EXISTS ix_audit_batch ON audit_log(batch_id);

-- Esempio di trigger generato da datanapoli/audit.py via PRAGMA table_info:
CREATE TRIGGER IF NOT EXISTS trg_partite_u_gol_casa AFTER UPDATE OF gol_casa ON partite
WHEN OLD.gol_casa IS NOT NEW.gol_casa
BEGIN
  INSERT INTO audit_log(tabella,pk,azione,campo,vecchio,nuovo,attore,motivo,fonte_id,batch_id)
  VALUES ('partite', NEW.partita_id, 'U', 'gol_casa',
          json_quote(OLD.gol_casa), json_quote(NEW.gol_casa),
          ifnull((SELECT attore FROM sessione WHERE id=1),'sconosciuto'),
          (SELECT motivo FROM sessione WHERE id=1),
          (SELECT fonte_id FROM sessione WHERE id=1),
          (SELECT batch_id FROM sessione WHERE id=1));
END;

-- [003_copertura_qualita.sql] Assenza dati (completo/parziale/nd/na/pending) + Qualità 2 assi
CREATE TABLE IF NOT EXISTS copertura (
  entita        TEXT NOT NULL,  -- 'partita', 'persona', 'squadra'
  entita_id     INTEGER NOT NULL,
  sezione       TEXT NOT NULL,  -- 'arbitro','affluenza','stadio','marcatori','formazioni','eventi','statistiche','xg'
  stato         TEXT NOT NULL CHECK (stato IN ('completo','parziale','nd','na','pending')),
  motivo        TEXT,
  fonte_id      INTEGER REFERENCES fonti(fonte_id),
  aggiornato_il TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (entita, entita_id, sezione)
);

CREATE TABLE IF NOT EXISTS copertura_regole (
  sezione TEXT NOT NULL,
  data_da TEXT,
  data_a  TEXT,
  stato   TEXT NOT NULL CHECK (stato IN ('na','nd')),
  motivo  TEXT NOT NULL
);
INSERT INTO copertura_regole VALUES
 ('xg', NULL, '2009-12-31', 'na', 'xG non esistono prima del 2010');

-- [004_formazioni_eventi_statistiche.sql]
CREATE TABLE IF NOT EXISTS partite_formazioni (
  id            INTEGER PRIMARY KEY,
  partita_id    INTEGER NOT NULL REFERENCES partite(partita_id),
  squadra_id    INTEGER NOT NULL REFERENCES squadre(squadra_id),
  persona_id    INTEGER NOT NULL REFERENCES persone(persona_id),
  numero_maglia INTEGER,
  ruolo         TEXT,
  titolare      INTEGER NOT NULL DEFAULT 1 CHECK (titolare IN (0,1)),
  capitano      INTEGER NOT NULL DEFAULT 0 CHECK (capitano IN (0,1)),
  minuto_in     INTEGER,
  minuto_out    INTEGER,
  confidence    TEXT NOT NULL DEFAULT 'media' CHECK (confidence IN ('alta','media','bassa')),
  verificato    INTEGER NOT NULL DEFAULT 0 CHECK (verificato IN (0,1)),
  fonte_id      INTEGER REFERENCES fonti(fonte_id),
  UNIQUE (partita_id, squadra_id, persona_id)
);

CREATE TABLE IF NOT EXISTS partite_statistiche (
  partita_id INTEGER NOT NULL REFERENCES partite(partita_id),
  squadra_id INTEGER NOT NULL REFERENCES squadre(squadra_id),
  metrica    TEXT NOT NULL, -- 'possesso','tiri','tiri_porta','xg','corner','ppda'
  valore     REAL,
  confidence TEXT NOT NULL DEFAULT 'media' CHECK (confidence IN ('alta','media','bassa')),
  fonte_id   INTEGER REFERENCES fonti(fonte_id),
  PRIMARY KEY (partita_id, squadra_id, metrica)
);

CREATE TABLE IF NOT EXISTS conflitti_import (
  id           INTEGER PRIMARY KEY,
  ts           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  tabella      TEXT NOT NULL,
  pk           TEXT NOT NULL,
  campo        TEXT NOT NULL,
  valore_db    TEXT,
  valore_fonte TEXT,
  fonte_id     INTEGER,
  stato        TEXT NOT NULL DEFAULT 'aperto' CHECK (stato IN ('aperto','risolto','ignorato'))
);

-- [005_museo_case_storia_mappe.sql] Estensione Enciclopedia & Museo Digitale
CREATE TABLE IF NOT EXISTS luoghi_napoli (
  id          INTEGER PRIMARY KEY,
  nome        TEXT NOT NULL,
  tipo        TEXT NOT NULL CHECK (tipo IN ('stadio','centro_sportivo','sede','ritiro')),
  indirizzo   TEXT,
  latitudine  REAL NOT NULL,
  longitudine REAL NOT NULL,
  anno_inizio INTEGER,
  anno_fine   INTEGER,
  note        TEXT,
  confidence  TEXT NOT NULL DEFAULT 'alta' CHECK (confidence IN ('alta','media','bassa')),
  fonte_id    INTEGER REFERENCES fonti(fonte_id)
);

CREATE TABLE IF NOT EXISTS divise (
  id          INTEGER PRIMARY KEY,
  stagione    TEXT NOT NULL,
  tipo        TEXT NOT NULL CHECK (tipo IN ('home','away','third','portiere')),
  marca       TEXT,
  sponsor     TEXT,
  foto_url    TEXT,
  descrizione TEXT,
  fonte_id    INTEGER REFERENCES fonti(fonte_id)
);

CREATE TABLE IF NOT EXISTS cimeli (
  id              INTEGER PRIMARY KEY,
  codice_catalogo TEXT NOT NULL UNIQUE,
  nome            TEXT NOT NULL,
  anno            INTEGER,
  posizione_museo TEXT,
  descrizione     TEXT,
  foto_url        TEXT,
  fonte_id        INTEGER REFERENCES fonti(fonte_id)
);

CREATE TABLE IF NOT EXISTS cori (
  id        INTEGER PRIMARY KEY,
  titolo    TEXT NOT NULL,
  testo     TEXT NOT NULL,
  audio_url TEXT,
  anno      TEXT,
  curva     TEXT CHECK (curva IN ('Curva A','Curva B','Stadio Intero')),
  note      TEXT,
  fonte_id  INTEGER REFERENCES fonti(fonte_id)
);`;

export const DN_CLI_PYTHON_CODE = `#!/usr/bin/env python3
"""
dn.py — CLI Unificata di SSC Napoli Data (@sscnapolidata)
Zero dipendenze esterne (Python 3.13 stdlib: argparse, sqlite3, csv, json, pathlib).
"""
import argparse
import csv
import datetime as dt
import json
import pathlib
import sqlite3
import sys

DB_PATH = pathlib.Path("db/datanapoli.sqlite")
BACKUP_DIR = pathlib.Path("db/backups")
DUMP_DIR = pathlib.Path("db/dump")

def connect_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def set_session(conn: sqlite3.Connection, attore: str, motivo: str, fonte_id: int | None, batch_id: str):
    conn.execute(
        "UPDATE sessione SET attore=?, motivo=?, fonte_id=?, batch_id=? WHERE id=1",
        (attore, motivo, fonte_id, batch_id),
    )

def cmd_fix(args: argparse.Namespace):
    batch_id = f"fix-{dt.datetime.now(dt.UTC).strftime('%Y%m%d-%H%M%S')}"
    with connect_db() as conn:
        set_session(conn, args.attore, args.motivo, args.fonte, batch_id)
        verificato_val = 1 if args.fonte is not None else 0
        sql = f"UPDATE {args.tabella} SET {args.campo} = ?, verificato = ? WHERE rowid = ?"
        conn.execute(sql, (args.valore, verificato_val, args.id))
        print(f"[OK] {args.tabella}#{args.id}.{args.campo} aggiornato (batch={batch_id}, verificato={verificato_val})")

def cmd_check(args: argparse.Namespace):
    with connect_db() as conn:
        fk_errors = conn.execute("PRAGMA foreign_key_check;").fetchall()
        print(f"1. Foreign Key Check: {len(fk_errors)} errori")
        # Invariante marcatori vs risultato
        mismatch = conn.execute("""
            SELECT p.partita_id, p.data, p.gol_casa + p.gol_trasferta AS tot_gol,
                   COUNT(m.id) AS righe_marcatori, c.stato AS stato_copertura
            FROM partite p
            LEFT JOIN marcatori m ON m.partita_id = p.partita_id
            LEFT JOIN copertura c ON c.entita='partita' AND c.entita_id=p.partita_id AND c.sezione='marcatori'
            GROUP BY p.partita_id
            HAVING tot_gol > 0 AND righe_marcatori = 0 AND stato_copertura IS NULL
        """).fetchall()
        print(f"2. Partite con gol > 0 ma 0 marcatori e senza stato copertura: {len(mismatch)}")

def cmd_dump(args: argparse.Namespace):
    DUMP_DIR.mkdir(parents=True, exist_ok=True)
    with connect_db() as conn:
        tables = [r["name"] for r in conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
        )]
        for t in tables:
            rows = [dict(r) for r in conn.execute(f"SELECT * FROM {t} ORDER BY 1")]
            (DUMP_DIR / f"{t}.json").write_text(
                json.dumps(rows, ensure_ascii=False, indent=2, sort_keys=True) + "\\n",
                encoding="utf-8"
            )
    print(f"[OK] Dump testuale deterministico completato in {DUMP_DIR}/")`;
