# BLUEPRINT — DATA NAPOLI
### Napoli Analitica — piano di progettazione completo

*Documento vivo: va aggiornato ogni volta che una decisione di prodotto cambia. Vive
idealmente nel repository come `docs/BLUEPRINT.md`, accanto al codice che descrive.*

---

## 0. Executive summary

Data Napoli è una piattaforma web statica (GitHub Pages) per l'analisi matematica,
visuale e statistica di ogni partita della SSC Napoli, con l'ambizione di coprire
l'intero archivio storico del club dal **1° agosto 1926** a oggi. Non è un sito di
risultati: è uno strumento di analisi avanzata pensato per far cogliere dettagli che il
tifoso medio non nota, con un linguaggio grafico editoriale — non un poster sportivo, non
un'estetica da ESPN/Sky/FIFA.

Il principio che sovrasta ogni altra decisione tecnica o di design è descritto in
sezione 1: **nessun dato viene mai inventato, stimato o dedotto**. Ogni altra scelta
architetturale discende da questo vincolo.

Stato a oggi: repository GitHub (`marcorzzn/sscnapolidata`) ancora vuota (un solo commit,
README segnaposto). Un pilota completo — una partita reale, verificata e interamente
implementata — è pronto ma non ancora caricato. Questo documento è il piano che guida
tutto ciò che viene dopo.

---

## 1. Principio fondativo (non negoziabile)

- Nessun dato — minuto, formazione, statistica, nome, assist, distanza, coordinata,
  affluenza — viene mai inventato, stimato, arrotondato o "ragionevolmente dedotto".
  Dove una fonte non conferma un dettaglio, l'interfaccia lo dichiara esplicitamente
  invece di ometterlo in silenzio o di indovinarlo.
- Ogni elemento visivo deve essere **funzionale**: deve rappresentare un dato reale e
  tracciabile. Vietati grafici o motivi decorativi senza funzione (principio già
  applicato correggendo la waveform della scheda pilota).
- Gerarchia delle fonti, sempre in quest'ordine: **fonti ufficiali** (Lega Serie A, club,
  FIGC, UEFA/FIFA, organizzatori di competizione) → **database storici/statistici
  riconosciuti** (RSSSF, FBref, Transfermarkt, Understat, Worldfootball) → **testate
  giornalistiche affidabili** (ANSA, Gazzetta dello Sport, Corriere dello Sport, ecc.) →
  **altre fonti solo come pista**, mai come prova unica.
- Se due fonti sono in disaccordo su un dato: non mischiarle, segnalare la discrepanza o
  scartare il dato.
- Se un calcolo viene derivato da dati verificati (una distanza, un'età, un intervallo di
  giorni), va sempre dichiarato *come* è stato calcolato e da quali dati di partenza —
  mai presentato come se fosse un dato grezzo.
- Regola guida finale, valida per ogni funzionalità di questo documento: **meglio una
  pagina/grafico con meno informazioni che uno con anche un solo dato inventato.**

---

## 2. Identità di brand & design system

Già implementato in `assets/style.css` del repository.

| Token | Valore | Fonte |
|---|---|---|
| Azzurro/cyan elettrico | `#01A0E8` | campionato dai pixel di logo e banner del profilo X |
| Nero editoriale (sfondo) | `#08090B` | scelta editoriale (non nelle immagini originali, che hanno sfondo bianco nello screenshot) |
| Bianco | `#FFFFFF` | logo e testi |
| Tipografia titoli/numeri | Space Grotesk | grottesco geometrico, Google Fonts |
| Tipografia corpo/microtesto | Inter | alta leggibilità a dimensioni piccole |

Principi di stile:
- Nero dominante, grandi porzioni di spazio negativo, azzurro **solo come accento** (mai
  riempimento indiscriminato).
- Eco "grafica italiana di alto livello anni '20 resa moderna": griglia rigorosa, numeri
  grandi e geometrici, ornamento minimo, gerarchia tipografica netta — non decorazione.
- Linguaggio "waveform" del banner riusato **solo in forma funzionale** (es. il grafico
  "andamento" della scheda partita: altezza barra = tipo evento, colore = squadra).
- Iconografia lineare, minimale, coerente con il segno geometrico della "N" del logo. No
  icone 3D, no emoji, no illustrazioni cartoon.
- Layout mobile-first, colonna verticale singola, mai esteso in orizzontale.
- Favicon: il logo circolare azzurro con "N" bianca fornito dall'utente (asset reale, mai
  ricreato o reinterpretato).
- Toggle lingua italiano/inglese e toggle tema chiaro/scuro presenti su ogni pagina.

---

## 3. Inventario funzionalità

### 3.1 Esperienza generale
- Toggle IT/EN persistente su tutte le pagine.
- Toggle tema chiaro/scuro persistente su tutte le pagine.
- Layout mobile-first verticale; desktop come colonna centrata, non layout esteso.
- Favicon e branding coerenti su ogni pagina (header con wordmark linkato alla home,
  footer con logo e handle @sscnapolidata).
- Embed del profilo X (@sscnapolidata) disponibile come blocco riutilizzabile nella
  home o in una pagina dedicata.

### 3.2 Scheda partita (una pagina per partita)
Sezioni minime, ciascuna presente **solo se il dato è verificato** (altrimenti
dichiarata esplicitamente come non disponibile, mai stimata):
- Header: competizione, giornata/turno, data, stadio, loghi squadre, risultato in grande,
  FULL TIME.
- Match Summary: sintesi editoriale oggettiva, 2-4 righe.
- Goal Timeline: minuto, marcatore, squadra, assist se ufficialmente attribuito,
  risultato progressivo.
- Match Flow: linea cronologica verticale che unisce gol e occasioni chiave — già
  prototipata nel pilota, con distinzione visiva tra eventi a minuto certo e a minuto non
  specificato.
- Occasioni chiave / key moments.
- Formazioni iniziali, presentate come diagramma editoriale (non schermata stile FIFA),
  con analisi **reparto per reparto** (portiere / difesa / centrocampo / attacco) — vedi
  sezione 3.4.
- Sostituzioni, con frecce geometriche semplici, ordine cronologico.
- Cartellini (ammoniti, espulsi, secondi gialli).
- Match Data / statistiche di squadra: possesso, tiri, tiri in porta, corner, falli,
  fuorigioco, xG — solo le metriche realmente disponibili, mai tutte per forza.
  Visualizzazione editoriale (barre sottili o confronto A/B), mai una tabella Excel.
- **La Partita Eterna** (nuova, sezione dedicata — dettagliata in 3.2.1).
- Final Data: riepilogo compatto di risultato, possesso, tiri, corner, cartellini, xG.
- Footer: logo Data Napoli, handle @sscnapolidata, fonti puntuali elencate (nome fonte +
  data di consultazione, non "fonte: internet").
- Scheda esportabile come immagine per i social (formato verticale 1:2, 2048×4096px),
  sempre con logo e handle — secondo il template infografica già pronto (sezione 7.3).

#### 3.2.1 "La Partita Eterna"
Per ogni partita, una sezione che mostra il **punteggio complessivo cumulato** tra Napoli
e l'avversario, sommando ogni singolo precedente ufficiale dal primo incontro storico.
Regole di implementazione:
- È un **aggregato calcolato**, non un dato inserito a mano: si ricava sommando la tabella
  `matches` filtrata per la coppia di club (con il registro di continuità societaria di
  sezione 4.2 applicato — es. il caso Alba Roma / AS Roma va risolto lì, non qui).
- Deve essere **cliccabile**: ogni incontro storico che ha contribuito alla somma si apre
  mostrando data, risultato e competizione di quel preciso precedente.
- Finché l'archivio storico (fase 3 della roadmap) non è completo, l'aggregato va
  etichettato esplicitamente come "calcolato sui precedenti finora verificati nel
  database" — mai presentato come definitivo se il backfill non è terminato.
- Se per un avversario esiste un caso di continuità societaria dubbia (fusioni, cambi di
  denominazione), la sezione deve permettere di vedere **entrambe le letture** (con/senza
  i precedenti dell'entità storica), non sceglierne una in silenzio.

### 3.3 Archivio storico
- Copertura: ogni partita ufficiale della SSC Napoli dal 1° agosto 1926 a oggi, per
  quanto verificabile.
- Consultabile e **sortabile con etichette multiple**: competizione, stagione, avversario,
  risultato, sede (casa/trasferta), stadio, decennio, allenatore, tipo di evento
  presente (es. solo partite con espulsioni), e altre etichette che emergeranno con lo
  sviluppo dello schema dati.
- Ogni partita storica, quando la scheda è disponibile, resta scaricabile/condivisibile
  come grafica informativa (stesso formato della scheda partita corrente).
- Le partite più datate (pre-anni 2000, in particolare pre-anni '90) avranno
  necessariamente meno sezioni compilate — coerente col principio fondativo: si mostra
  quel che è verificato, non si completa artificialmente.

### 3.4 Analisi visuale reparto per reparto
- Diagramma formazioni con raggruppamento esplicito per reparto (portiere / difesa /
  centrocampo / attacco), stile diagramma editoriale con nodi e linee sottili.
- Statistiche aggregate per reparto dove la fonte dati lo consente (es. precisione
  passaggi medi del reparto difensivo) — **livello di dettaglio dipendente dal
  provider**: Understat/FBref (via `soccerdata`) offrono buone statistiche a livello
  giocatore aggregabili per reparto; metriche di posizionamento/tracking (altezza media
  della linea difensiva, compattezza) restano tipicamente riservate a provider a
  pagamento (Opta/StatsBomb) e vanno segnalate come non disponibili finché non si trova
  una fonte gratuita verificabile — mai stimate.
- Shot map con coordinate reali dei tiri: fattibile gratuitamente via Understat per la
  Serie A, una volta collegata la pipeline (fase 2 della roadmap).
- Pass network: più fragile senza provider a pagamento; da valutare con fonti gratuite
  (es. scraping WhoScored via `soccerdata`) solo se si trova una fonte sufficientemente
  affidabile da citare.

### 3.5 Mappa trasferte stagionali
Per ogni stagione, una mappa geografica con le trasferte del Napoli.
- Ogni partita **in trasferta** aggiunge una linea tra lo stadio di casa del Napoli
  (Stadio Diego Armando Maradona) e lo stadio della squadra avversaria che ospita quel
  preciso incontro.
- *Interpretazione adottata* (da confermare con l'utente): le partite casalinghe del
  Napoli non generano una linea di viaggio, perché non comportano spostamento della
  squadra — compaiono comunque sulla mappa/calendario stagionale, ma a distanza zero.
  Se l'intento era diverso (es. includere anche gli spostamenti generati dalle partite
  casalinghe in altre competizioni), va specificato.
- **Non è un tracker live**: la mappa si aggiorna quando una partita viene aggiunta al
  database (a fine gara, come tutto il resto della pipeline), non in tempo reale durante
  gli spostamenti della squadra.
- Distanza calcolata come distanza ortodromica (great-circle) tra le coordinate reali dei
  due stadi. Ogni coordinata deve avere una fonte dichiarata (es. OpenStreetMap,
  Wikipedia con verifica incrociata) — mai stimata a occhio. Il metodo di calcolo va
  sempre dichiarato accanto al numero, mai presentato come dato grezzo.
- Somma cumulativa dei km percorsi in stagione, aggiornata partita per partita.
- Stile: coerente col design system (linee sottili azzurre su sfondo nero, nessun
  elemento 3D/mappa fotorealistica — un globo o una proiezione piatta stilizzata,
  editoriale, non un widget da app di viaggi).

### 3.6 Query engine trasversale / confronti storici
- Costruttore di query libere sull'intero archivio (una volta popolato), esportabili come
  grafico condivisibile con logo e handle.
- Esempi esplicitamente richiesti:
  - confronto dei marcatori di **tutte** le squadre del Napoli di ogni epoca;
  - infortuni per tipologia, giocatore coinvolto e allenatore in carica al momento
    dell'infortunio;
  - qualunque altra query storica (serie di risultati, sequenze, andamenti per
    competizione, per stadio, per avversario).
- Ogni risultato di query resta soggetto al principio fondativo: se il dato sottostante
  non è verificato per l'intero periodo richiesto, la query lo segnala invece di
  restituire un grafico silenziosamente incompleto.

### 3.7 Curiosità / aneddoti
- Modulo editoriale che genera aneddoti storici e statistici (Napoli e avversario di
  turno) seguendo il template già pronto (sezione 7.3): gerarchia di fonti a 4 livelli,
  doppia conferma per ogni dato sorprendente, mai clickbait, scarto di qualunque
  curiosità non verificabile.
- Output pensato per essere pubblicato su X, con possibilità di embed del profilo
  @sscnapolidata sulla pagina web.

### 3.8 Export ed embed social
- Ogni scheda partita, ogni infografica di serie storica, ogni risultato di query e ogni
  mappa trasferte deve poter essere scaricata come immagine pronta per i social, sempre
  con logo Data Napoli e handle @sscnapolidata — redazione professionale, loghi corretti
  delle squadre coinvolte.
- Embed del profilo X disponibile sulla pagina statica GitHub Pages.

---

## 4. Architettura dati

Ogni tabella/entità sotto ha, implicitamente, un campo `fonte` obbligatorio sui fatti che
riporta (e `verificato_da` opzionale per la seconda conferma) — è l'implementazione a
livello di schema del principio fondativo: se manca la fonte, il campo resta nullo e la
UI mostra "non disponibile", mai un'interpolazione.

| Entità | Contenuto | Note |
|---|---|---|
| `clubs` | id, nome attuale, nomi storici, anno fondazione | — |
| `club_lineage` | coppia club storico → club attuale, stato (`stessa_società` / `successione_riconosciuta` / `fusione_parziale` / `nessuna_continuità` / `da_verificare`), fonte, nota | governa sia gli H2H sia "La Partita Eterna" |
| `competitions` | id, nome, tipo (campionato/coppa/internazionale) | — |
| `seasons` | id, anno inizio/fine | — |
| `stadiums` | id, nome, nomi storici, città, **latitudine, longitudine, fonte coordinate** | le coordinate alimentano la mappa trasferte |
| `matches` | id, data, ora, stadio, competizione, giornata, squadra casa/trasferta, risultato, arbitro, affluenza, fonte | — |
| `match_events` | id, match_id, minuto (o "non specificato"), tipo (gol/cartellino/sub/VAR), giocatore, squadra, dettagli, fonte | — |
| `lineups` | match_id, squadra, giocatore, ruolo, titolare/subentrato, modulo | solo se ufficialmente verificato |
| `match_stats` | match_id, squadra, metrica, valore, fonte, provider | — |
| `players` / `managers` | anagrafiche | — |
| `injuries` | giocatore, tipo, data inizio/fine, fonte | alimenta le query per tipologia/allenatore |
| `sources` | url, tipo, data di consultazione | referenziata da ogni altra tabella |

Due elementi **derivati**, mai inseriti a mano (per non creare una seconda fonte di
verità che può andare fuori sincrono con `matches`):
- **`season_travel`**: vista calcolata da `matches` + `stadiums`, una riga per trasferta
  stagionale con distanza e km cumulativi.
- **`h2h_ledger`** ("La Partita Eterna"): vista calcolata da `matches` filtrata tramite
  `club_lineage`, aggregata per coppia di club.

---

## 5. Catalogo componenti visivi

| Componente | Stato | Dati richiesti |
|---|---|---|
| Header punteggio | ✅ prototipato nel pilota | risultato, competizione, stadio |
| Event-intensity chart (sparkline eventi) | ✅ prototipato, reso funzionale | eventi con minuto/tipo/squadra |
| Match Flow (linea cronologica) | ✅ prototipato | eventi con minuto o fase nota |
| Goal timeline | ✅ prototipato | gol con minuto, marcatore, assist se noto |
| Substitutions | ✅ prototipato (parziale) | cambi con minuto se noto |
| Formazioni — diagramma editoriale reparto/reparto | da costruire | XI ufficiale completo |
| Match stats a barre | da costruire | tabellino ufficiale (tiri, possesso, corner...) |
| Shot map con xG | da costruire, dipende da pipeline Understat | coordinate tiro |
| Pass network | da valutare, provider gratuiti fragili | dati posizionali |
| Mappa trasferte stagionali | da costruire (nuovo requisito) | coordinate stadi, calendario stagione |
| "La Partita Eterna" (ledger cumulativo) | da costruire (nuovo requisito) | intero storico H2H + registro continuità |
| Grafici cross-era (marcatori storici, infortuni) | da costruire | query engine + injuries |
| Infografica social esportabile | template testuale pronto, da automatizzare il rendering PNG | dataset partita completo |

---

## 6. Struttura del sito

- **Home** — hero con tagline, ultima partita in evidenza, eventualmente embed X.
- **Archivio Partite** — filtro/ordinamento multi-etichetta, dal 1926 a oggi.
- **Scheda Partita** — sezione 3.2, incluso "La Partita Eterna".
- **Trasferte** (per stagione) — la mappa di sezione 3.5.
- **Esplora / Query** — costruttore di query trasversali (sezione 3.6).
- **Curiosità** — feed editoriale (sezione 3.7).
- **Giocatori & Allenatori** — anagrafiche con statistiche aggregate.
- **Impostazioni** — lingua, tema.

---

## 7. Pipeline tecnica e automazione

### 7.1 Fonti dati gratuite discusse
- Eventi/formazioni/cartellini: API-Football (piano free, 100 richieste/giorno) o
  Football-Data.org.
- xG, coordinate tiri, statistiche avanzate: `soccerdata` (estrae da FBref, Understat).
- Generazione grafica: `mplsoccer` (Python) per export statici, componenti SVG/Canvas
  lato web per l'esperienza interattiva sul sito.

### 7.2 Automazione
- GitHub Actions programmata o manuale (trigger a fine partita): scarica dati, aggiorna
  il JSON verificato della partita, rigenera la pagina dal template, fa commit e deploy.
- Il repository resta statico (GitHub Pages): nessun backend, tutta la logica di raccolta
  dati vive nella action, non nel browser dell'utente finale.

### 7.3 Template di contenuto già pronti
- Prompt per generare l'infografica social verticale 1:2 di ogni partita (stesso
  principio fondativo, "meglio omettere una sezione che inventare un dato").
- Prompt per generare le "curiosità" storiche/statistiche (gerarchia fonti a 4 livelli,
  doppia conferma, mai clickbait).

### 7.4 Da HTML scritto a mano a generazione da template
Passo di transizione già individuato: estrarre dalla scheda pilota un template con
placeholder, alimentato da un JSON verificato per partita — così ogni nuova partita non
richiede di riscrivere l'HTML, solo di compilare/validare il JSON.

---

## 8. Roadmap a fasi

| Fase | Contenuto | Stato |
|---|---|---|
| 0 | Design system (`assets/style.css`, token, tipografia, waveform funzionale) | ✅ completata |
| 1 | Schema dati (sezione 4) + registro continuità club + template/generatore da JSON | 🔶 in corso — pilota su una partita fatto a mano, template ancora da estrarre |
| 2 | Automazione partita per partita (GitHub Actions, stagione corrente) | da avviare |
| 3 | Backfill storico dal 1° agosto 1926 | da avviare, fase più onerosa |
| 4 | Query engine trasversale + pagine giocatori/allenatori | da avviare |
| 5 | Modulo curiosità automatizzato | da avviare |
| 6 *(nuova)* | Mappa trasferte stagionali (sezione 3.5) — dipende da `stadiums` con coordinate, quindi da fase 1 completata | da avviare |
| 7 *(nuova)* | "La Partita Eterna" (sezione 3.2.1) — dipende dal backfill storico (fase 3) per essere davvero significativa; il componente UI può però essere costruito prima, mostrando l'aggregato parziale | da avviare |

---

## 9. Stato attuale del progetto

- Repository `marcorzzn/sscnapolidata`: **vuota**, un solo commit con README
  segnaposto — confermato controllando la repo in data odierna.
- Pronto ma non ancora caricato: `index.html`, `README.md`, `assets/style.css`,
  `assets/app.js`, `assets/favicon.png`, `partite/fiorentina-napoli-2026-09-20.html` —
  una partita reale (Fiorentina-Napoli 1-1, Serie A Giornata 5, 20 settembre 2026)
  interamente verificata su ANSA e fantacalcio.it, usata come "walking skeleton" per
  validare schema dati e design system insieme prima di costruire l'automazione.
- Tema chiaro/scuro e lingua IT/EN (sezione 3.1) sono già implementati su entrambe le
  pagine esistenti — non più solo un requisito in attesa.
- È già stato preparato un prompt tecnico dedicato per un agente con accesso reale a
  git/filesystem (es. Claude Code) per eseguire il push e attivare GitHub Pages.

---

## 10. Governance e checklist di verifica

Prima di pubblicare qualunque contenuto (scheda partita, infografica, risultato di
query), verificare:
- [ ] Ogni dato riportato ha una fonte dichiarata e verificabile.
- [ ] Nessun minuto, formazione, statistica, distanza o coordinata è stato stimato o
      dedotto.
- [ ] Dove un dato manca, è dichiarato esplicitamente come non disponibile, non omesso in
      silenzio né indovinato.
- [ ] Se due fonti sono in disaccordo, la discrepanza è segnalata o il dato è scartato.
- [ ] Ogni elemento visivo rappresenta un dato reale — nessuna decorazione priva di
      funzione.
- [ ] I casi di continuità societaria coinvolti (H2H, "La Partita Eterna") sono risolti
      tramite `club_lineage`, mai assunti implicitamente.
- [ ] Loghi, handle (@sscnapolidata) e attribuzioni sono corretti su ogni asset
      esportabile.
