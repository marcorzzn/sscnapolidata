# PROMPT TECNICO — setup e push del repository "Data Napoli"
### (v2 — aggiornato con tema chiaro/scuro e lingua IT/EN)

Questo documento va incollato per intero come istruzione iniziale a un LLM/agente con
accesso a filesystem locale, shell e git (es. Claude Code, o strumento equivalente con
permessi di push su GitHub). Non è una richiesta generica: contiene contenuto file
esatto da scrivere byte-per-byte, non da riformulare, abbreviare o "migliorare" in corso
d'opera. Sostituisce integralmente qualunque versione precedente di questo prompt: se ne
esiste già una nel repository o altrove, questa la rimpiazza — i file sono cambiati.

---

## 0. Ruolo e compito

Sei un agente con accesso a filesystem, shell e git. Il tuo compito, in ordine:

1. Ricreare esattamente la struttura di file della sezione 5 in una working copy del
   repository GitHub `marcorzzn/sscnapolidata` (attualmente vuoto: solo un README
   segnaposto).
2. Committare e pushare su `main` (comandi in sezione 7).
3. Guidare l'utente ad attivare GitHub Pages (sezione 8).
4. Da questo momento in poi, per qualunque sviluppo futuro su questo repository,
   rispettare senza eccezioni i principi della sezione 1 — sono vincolanti quanto le
   istruzioni operative, non un contesto descrittivo da ignorare dopo il primo push.

---

## 1. Principio non negoziabile del progetto (vale per SEMPRE, non solo per questo push)

- **Zero dati inventati, stimati, dedotti o completati automaticamente.** Se un dato
  (minuto, formazione, statistica, nome, assist, fonte) non è verificato da una fonte
  consultabile, va dichiarato esplicitamente come non disponibile nella UI — mai
  indovinato, arrotondato, o "ragionevolmente assunto". Questo vale anche per le
  traduzioni inglesi: sono una resa fedele dello stesso dato verificato, mai
  un'occasione per aggiungere dettagli assenti dalla fonte italiana.
- **Ogni elemento visivo deve essere funzionale**, cioè rappresentare un dato reale e
  tracciabile. Vietati grafici, istogrammi o waveform puramente decorativi.
- **Gerarchia delle fonti**: 1) fonti ufficiali (Lega Serie A, club, FIGC, UEFA,
  organizzatori di competizione) → 2) database storici e statistici riconosciuti
  (RSSSF, FBref, Transfermarkt, Understat) → 3) testate giornalistiche affidabili
  (ANSA, Gazzetta dello Sport, Corriere dello Sport, ecc.) → 4) altre fonti solo come
  pista di ricerca, mai come prova unica di un dato.
- **Se due fonti sono in disaccordo**: non mischiare i dati, indicare la discrepanza o
  scartare il dato.
- **Regola guida finale**: meglio una pagina con meno informazioni che una con anche un
  solo dato inventato.

---

## 2. Contesto del progetto

"Data Napoli" (sottotitolo "Napoli Analitica", omaggio a "Napoli Petrolifera" di
Carosone) è una piattaforma web statica, ospitata su GitHub Pages, per l'analisi
matematica, visuale e statistica di ogni partita della SSC Napoli — con l'ambizione, nel
tempo, di coprire l'intero archivio storico dal 1° agosto 1926. Account X di
riferimento: `@sscnapolidata`. Un blueprint di progettazione completo esiste come
documento separato (fornito all'utente in una fase precedente): copre l'intero elenco di
funzionalità (archivio storico, query trasversali, mappa trasferte stagionali, "La
Partita Eterna" — aggregato H2H cumulativo cliccabile — modulo curiosità, ecc.). Questo
prompt copre solo l'implementazione già pronta da pushare ora; il blueprint resta la
guida per tutto ciò che viene dopo.

---

## 3. Identità di brand & design system

Già implementato in `assets/style.css` del repository.

| Token | Valore (tema scuro, default) | Valore (tema chiaro) |
|---|---|---|
| Azzurro/cyan elettrico (`--cyan`) | `#01A0E8` | invariato — costante di brand |
| Sfondo (`--bg`) | `#08090B` | `#F4F5F6` |
| Pannelli (`--panel`) | `#0E1013` | `#FFFFFF` |
| Testo primario (`--white`) | `#FFFFFF` | `#08090B` |

- Tipografia: **Space Grotesk** (titoli/numeri) + **Inter** (corpo/microtesto), via
  Google Fonts.
- Layout mobile-first, colonna singola centrata, `max-width: 460px`.
- Ogni colore vive come variabile CSS in `:root` e viene interamente ridefinito sotto
  `html[data-theme="light"]` — nessuna regola di componente usa più un colore
  hardcoded: è così che il tema chiaro funziona su tutto il sito senza toccare i
  componenti.
- Linguaggio "waveform" del banner riusato **solo in forma funzionale** (grafico
  "andamento": altezza barra = tipo evento, colore = squadra).

---

## 4. Tema chiaro/scuro e lingua IT/EN — già implementati

- **Tema**: un piccolo script inline in `<head>` di ogni pagina legge
  `localStorage['dn-theme']` (o la preferenza di sistema se non impostata) e imposta
  `data-theme` su `<html>` **prima** che la pagina venga disegnata, per evitare il flash
  del tema sbagliato. Il colore di brand (`--cyan`) resta identico in entrambi i temi.
- **Lingua**: stesso meccanismo per `localStorage['dn-lang']` (default `it`), applicato
  su `<html lang="...">`. Il dizionario testi vive in `assets/app.js`
  (`window.DN_I18N`), con due tipi di chiave:
  - chiavi **senza prefisso**: testo di interfaccia riusato da qualunque pagina futura
    (es. `first_half`, `key_moments_label`) — si definiscono una sola volta.
  - chiavi **`m<slug>_*`**: contenuto specifico di una partita (riassunto, note sui
    gol, fonti). Quando esisterà il generatore da JSON (fase 1 della roadmap), queste
    chiavi verranno prodotte automaticamente invece che scritte a mano.
- I due pulsanti di controllo (pillola lingua, icona sole/luna) vivono in `.brand-row`
  di ogni pagina e sono già cablati in `assets/app.js`.
- **Per ogni nuova pagina partita**: copiare lo script di bootstrap in `<head>`, il tag
  `<script src="../assets/app.js" defer>` prima di `</body>`, e aggiungere le nuove
  chiavi `m<slug>_*` (in **entrambe** le lingue) in `assets/app.js` — mai lasciare una
  chiave definita solo in una lingua.

---

## 5. Struttura file da creare nel repository

```
/
├── index.html
├── README.md
├── assets/
│   ├── style.css
│   ├── app.js
│   └── favicon.png      (binario — vedi nota sezione 6)
└── partite/
    └── fiorentina-napoli-2026-09-20.html
```

---

## 6. Contenuto esatto dei file

Copia questi contenuti **byte per byte** nei rispettivi path. Non parafrasare, non
"pulire", non aggiungere/rimuovere nulla in questa fase — è codice già rivisto
dall'utente.

### `README.md`

```markdown
# Data Napoli

**Napoli Analitica** — analisi matematica, visuale e statistica di ogni partita del Napoli.

Sito statico pensato per GitHub Pages. Principio fondativo: **nessun dato è mai stimato,
dedotto o inventato**. Dove una fonte non conferma un dettaglio, la pagina lo dichiara
esplicitamente invece di ometterlo in silenzio o di indovinarlo.

## Struttura

```
/
├── index.html              home page — elenco partite
├── assets/
│   ├── style.css           design system: token colore, tipografia, tutti i componenti,
│   │                       incluse le variabili del tema chiaro (`html[data-theme="light"]`)
│   ├── app.js              motore tema chiaro/scuro + lingua IT/EN, e dizionario testi
│   └── favicon.png         logo del profilo X (@sscnapolidata)
├── partite/
│   └── <slug-partita>.html una pagina per partita (es. fiorentina-napoli-2026-09-20.html)
└── README.md
```

## Aggiungere una nuova partita

1. Verificare i dati su almeno una fonte affidabile, in ordine di priorità: fonti ufficiali
   (Lega Serie A, club) → database storici (RSSSF, FBref) → testate giornalistiche affidabili.
2. Copiare la struttura di `partite/fiorentina-napoli-2026-09-20.html` in un nuovo file
   `partite/<squadra1>-<squadra2>-<data>.html`, incluso lo script di bootstrap in `<head>`
   e il tag `<script src="../assets/app.js" defer>` prima di `</body>`.
3. Aggiungere una `.match-card` in `index.html` che punta alla nuova pagina.
4. Ogni testo specifico della partita (riassunto, note sui gol, fonti...) va aggiunto come
   coppia di chiavi `m<slug>_*` in **entrambi** i dizionari (`it` ed `en`) di `assets/app.js`,
   con l'elemento HTML corrispondente marcato `data-i18n="m<slug>_chiave"`. Le label
   d'interfaccia generiche (es. `first_half`, `key_moments_label`) sono già definite una
   volta sola e si riusano automaticamente in ogni nuova pagina.
5. Dove un dato (minuto, formazione, statistica) non è verificabile: dichiararlo
   esplicitamente nella pagina stessa, mai stimarlo o ometterlo silenziosamente — vale
   anche per la traduzione inglese: è una resa fedele dello stesso dato, mai un'occasione
   per aggiungere dettagli non presenti nella fonte italiana.

## Tema e lingua

Ogni pagina applica tema (chiaro/scuro) e lingua (IT/EN) leggendoli da `localStorage`
tramite un piccolo script inline in `<head>` (evita il flash del valore sbagliato), poi
`assets/app.js` applica il dizionario testi e gestisce i click sui due pulsanti in
`.brand-row`. Il colore di brand (`--cyan`) resta identico in entrambi i temi; cambiano
solo sfondo, pannelli e testo.

## Design system

Colori, tipografia e ogni componente vivono in `assets/style.css`, condiviso da tutte le
pagine — non duplicare CSS nelle singole pagine partita. Ogni elemento visivo deve
rappresentare un dato reale e citabile: niente grafici o waveform puramente decorativi.

## Stato del progetto

Pilota architetturale: una sola partita verificata manualmente, come prova che schema dati
e design system reggono su dati reali prima di costruire l'automazione (scraping +
GitHub Actions) per le partite successive.

```

### `index.html`

```html
<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Data Napoli — Napoli Analitica</title>
<link rel="icon" href="assets/favicon.png">
<script>
  // Bootstrap tema/lingua PRIMA del render, per evitare il flash del valore sbagliato.
  // La logica completa (dizionario, click sui toggle) è in assets/app.js.
  (function(){
    var theme = localStorage.getItem('dn-theme');
    if(!theme){ theme = (window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark'; }
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('lang', localStorage.getItem('dn-lang') || 'it');
  })();
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/style.css">
</head>
<body>
<div class="page">

  <div class="brand-row">
    <a class="brand" href="index.html">DATA <span>NAPOLI</span></a>
    <div class="brand-right">
      <div class="handle">@sscnapolidata</div>
      <button class="toggle-pill" data-lang-toggle type="button" aria-label="Cambia lingua / Change language">EN</button>
      <button class="toggle-icon" data-theme-toggle type="button" aria-label="Cambia tema / Change theme">
        <svg class="icon-to-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"/></svg>
        <svg class="icon-to-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.2A8.2 8.2 0 1 1 9.8 4a6.6 6.6 0 0 0 10.2 10.2Z"/></svg>
      </button>
    </div>
  </div>

  <div class="hero">
    <p class="eyebrow">Napoli Analitica</p>
    <p class="tagline" data-i18n="hero_tagline">Analisi matematica, visuale e statistica di ogni partita del Napoli. Solo dati verificati: dove una fonte non conferma un dettaglio, la pagina lo dichiara invece di stimarlo.</p>
  </div>

  <section>
    <div class="label" data-i18n="latest_match">ULTIMA PARTITA</div>
    <a class="match-card" href="partite/fiorentina-napoli-2026-09-20.html">
      <div class="mc-label" data-i18n="m20260920_mc_label">SERIE A · GIORNATA 5 · 20 SETTEMBRE 2026</div>
      <div class="mc-score">FIORENTINA 1–1 NAPOLI</div>
      <div class="mc-meta" data-i18n="mc_meta_generic">Scheda completa → gol, match flow, sostituzioni</div>
    </a>
  </section>

  <footer>
    <div class="foot-brand">
      <div class="foot-mark">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 20V4L20 20V4" stroke="#08090B" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div>
        <div class="foot-name">DATA NAPOLI</div>
        <div class="foot-sub">Napoli Analitica · @sscnapolidata</div>
      </div>
    </div>
  </footer>

</div>
<script src="assets/app.js" defer></script>
</body>
</html>

```

### `assets/style.css`

```css
/* ============================================================
   DATA NAPOLI — design system condiviso
   Token colore campionati direttamente da logo e banner del
   profilo X @sscnapolidata. Ogni componente qui dentro deve
   restare riusabile da più pagine: se serve uno stile una tantum,
   va nella pagina, non qui.
   ============================================================ */

:root{
  --cyan:#01A0E8;
  --cyan-dim:rgba(1,160,232,.35);
  --cyan-faint:rgba(1,160,232,.12);
  --bg:#08090B;
  --panel:#0E1013;
  --white:#FFFFFF;
  --dim:rgba(255,255,255,.58);
  --dimmer:rgba(255,255,255,.36);
  --ink-strong:rgba(255,255,255,.86);
  --ibar-base:rgba(255,255,255,.16);
  --ibar-fio:rgba(255,255,255,.4);
}
html[data-theme="light"]{
  --bg:#F4F5F6;
  --panel:#FFFFFF;
  --white:#08090B;
  --dim:rgba(8,9,11,.6);
  --dimmer:rgba(8,9,11,.38);
  --cyan-faint:rgba(1,160,232,.10);
  --cyan-dim:rgba(1,160,232,.4);
  --ink-strong:rgba(8,9,11,.82);
  --ibar-base:rgba(8,9,11,.13);
  --ibar-fio:rgba(8,9,11,.36);
}
html{transition:none;background:var(--bg);}
body{transition:background-color .15s ease, color .15s ease;}
*{box-sizing:border-box;margin:0;padding:0;}
body{
  background:var(--bg);
  color:var(--white);
  font-family:'Inter',sans-serif;
  -webkit-font-smoothing:antialiased;
  display:flex;
  justify-content:center;
}
.page{width:100%;max-width:460px;padding:0 0 48px;}
.display{font-family:'Space Grotesk',sans-serif;}

/* header / brand */
.brand-row{display:flex;align-items:center;justify-content:space-between;padding:18px 20px 0;}
.brand{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:13px;letter-spacing:.14em;
       color:var(--white);text-decoration:none;}
.brand span{color:var(--cyan);}
.handle{font-size:12px;color:var(--dim);}

/* event-intensity chart: ogni barra rappresenta un evento verificato (altezza=tipo, colore=squadra) */
.intensity{padding:22px 20px 0;}
.intensity-label{font-size:10px;letter-spacing:.14em;color:var(--dim);margin-bottom:14px;}
.intensity-chart{display:flex;align-items:flex-end;gap:6px;height:60px;
                  border-bottom:1px solid var(--cyan-faint);}
.ibar{flex:1;min-height:4px;border-radius:2px 2px 0 0;position:relative;background:var(--ibar-base);}
.ibar.nap{background:var(--cyan);}
.ibar.fio{background:var(--ibar-fio);}
.itick{position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:7px;
       font-size:9px;color:var(--dimmer);white-space:nowrap;font-family:'Space Grotesk',sans-serif;}
.intensity-note{font-size:10px;color:var(--dimmer);margin-top:24px;line-height:1.5;}

.meta{padding:18px 20px 0;font-size:12px;letter-spacing:.08em;color:var(--dim);
      display:flex;flex-direction:column;gap:3px;}
.meta b{color:var(--white);font-weight:600;}

/* scoreboard */
.scoreboard{padding:22px 20px 6px;}
.teams-row{display:flex;align-items:center;justify-content:space-between;gap:10px;}
.team{flex:1;text-align:center;font-size:13px;font-weight:600;letter-spacing:.04em;line-height:1.25;}
.team.home{text-align:left;}
.team.away{text-align:right;}
.score{display:flex;align-items:baseline;justify-content:center;gap:14px;
      font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:64px;line-height:1;}
.score .dash{color:var(--cyan);font-size:36px;}
.ft-tag{text-align:center;margin-top:10px;font-size:11px;letter-spacing:.18em;color:var(--dim);}
.ft-dot{display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--cyan);margin-right:6px;}

section{padding:26px 20px 0;}
.label{font-size:11px;letter-spacing:.16em;color:var(--cyan);font-weight:600;margin-bottom:12px;
       display:flex;align-items:center;gap:8px;}
.label::after{content:"";flex:1;height:1px;background:var(--cyan-faint);}

.summary p{font-size:14.5px;line-height:1.6;color:var(--ink-strong);}

/* goal timeline */
.goal-row{display:flex;gap:14px;padding:14px 0;border-top:1px solid var(--cyan-faint);}
.goal-row:first-of-type{border-top:none;}
.goal-min{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:30px;color:var(--cyan);
           min-width:58px;line-height:1;}
.goal-min small{display:block;font-size:9px;color:var(--dimmer);font-weight:500;margin-top:3px;letter-spacing:.06em;}
.goal-body{flex:1;}
.goal-scorer{font-weight:600;font-size:14.5px;}
.goal-team{font-size:11px;color:var(--dim);letter-spacing:.06em;margin-top:2px;}
.goal-note{font-size:12px;color:var(--dimmer);margin-top:5px;line-height:1.45;}
.goal-run{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:13px;color:var(--white);
          background:var(--cyan-faint);border:1px solid var(--cyan-dim);border-radius:3px;
          padding:2px 8px;display:inline-block;margin-top:7px;}

/* eventi generici (occasioni, cartellini...) */
.event-row{display:flex;gap:14px;padding:11px 0;border-top:1px solid var(--cyan-faint);align-items:flex-start;}
.event-row:first-of-type{border-top:none;}
.event-min{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:15px;color:var(--white);
           min-width:58px;}
.event-min small{display:block;font-size:9px;color:var(--dimmer);font-weight:500;margin-top:2px;letter-spacing:.05em;}
.event-body{flex:1;font-size:13px;line-height:1.5;}
.event-body b{font-weight:600;}
.event-team{font-size:10.5px;color:var(--dim);letter-spacing:.06em;}

/* match flow — linea cronologica verticale */
.flow-phase{font-size:10.5px;letter-spacing:.16em;color:var(--dimmer);margin:18px 0 10px;font-weight:600;}
.flow-phase:first-of-type{margin-top:2px;}
.flow-track{position:relative;margin-left:5px;padding-left:24px;border-left:2px solid var(--cyan-faint);}
.flow-item{position:relative;padding:11px 0;}
.flow-item::before{content:"";position:absolute;left:-31px;top:15px;width:10px;height:10px;
                   border-radius:50%;background:var(--cyan);box-sizing:border-box;}
.flow-item.open::before{background:var(--bg);border:2px solid var(--cyan);}
.flow-min{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:12.5px;color:var(--cyan);}
.flow-item.open .flow-min{color:var(--dim);font-weight:600;font-style:italic;}
.flow-desc{font-size:13px;margin-top:3px;line-height:1.4;}
.flow-desc b{font-weight:600;}
.flow-tag{font-size:10px;color:var(--dim);letter-spacing:.06em;margin-left:6px;}
.flow-run{font-family:'Space Grotesk',sans-serif;font-size:10.5px;color:var(--white);
          background:var(--cyan-faint);border:1px solid var(--cyan-dim);border-radius:3px;
          padding:1px 6px;margin-left:6px;}
.flow-note{font-size:11px;color:var(--dimmer);line-height:1.6;margin-top:14px;}

/* sostituzioni */
.sub-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid var(--cyan-faint);}
.sub-row:first-of-type{border-top:none;}
.sub-min{font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:600;color:var(--dim);min-width:42px;}
.sub-names{flex:1;font-size:13.5px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.sub-out{color:var(--dim);}
.sub-arrow{color:var(--cyan);}
.sub-in{font-weight:600;}
.sub-team-tag{font-size:10px;letter-spacing:.08em;color:var(--dimmer);margin-left:auto;}

/* stato dati non ancora verificati — mai un dato finto, ma nemmeno un buco muto */
.empty-state{border:1px solid var(--cyan-dim);border-radius:4px;padding:16px 16px;background:var(--panel);}
.empty-state p{font-size:12.5px;line-height:1.6;color:var(--dim);}
.empty-state p+p{margin-top:8px;}
.empty-state b{color:var(--white);}

/* card partita, usata nella home */
.match-card{display:block;text-decoration:none;color:inherit;border:1px solid var(--cyan-dim);
            border-radius:4px;padding:18px;background:var(--panel);transition:border-color .15s ease;}
.match-card:hover{border-color:var(--cyan);}
.match-card .mc-label{font-size:10px;letter-spacing:.14em;color:var(--dim);margin-bottom:10px;}
.match-card .mc-score{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:22px;}
.match-card .mc-meta{font-size:11px;color:var(--dim);margin-top:8px;}

/* home */
.eyebrow{text-transform:uppercase;letter-spacing:.16em;color:var(--dim);font-size:11px;}
.hero{padding:40px 20px 8px;}
.hero .tagline{font-size:13px;color:var(--ink-strong);margin-top:18px;line-height:1.6;}

/* controlli lingua / tema — presenti su ogni pagina */
.brand-right{display:flex;align-items:center;gap:12px;}
.toggle-pill{font-family:'Space Grotesk',sans-serif;font-size:10px;font-weight:700;letter-spacing:.06em;
            color:var(--dim);background:transparent;border:1px solid var(--cyan-dim);border-radius:20px;
            padding:4px 9px;cursor:pointer;line-height:1;}
.toggle-pill:hover{border-color:var(--cyan);color:var(--white);}
.toggle-icon{background:transparent;border:none;color:var(--dim);cursor:pointer;padding:4px;
             display:flex;align-items:center;justify-content:center;}
.toggle-icon:hover{color:var(--cyan);}
.toggle-icon svg{width:17px;height:17px;display:block;}
.icon-to-dark{display:none;}
html[data-theme="light"] .icon-to-light{display:none;}
html[data-theme="light"] .icon-to-dark{display:block;}

/* footer */
footer{padding:0 20px;margin-top:42px;}
.foot-brand{display:flex;align-items:center;gap:10px;}
.foot-mark{width:26px;height:26px;border-radius:50%;background:var(--cyan);display:flex;align-items:center;justify-content:center;}
.foot-mark svg{width:13px;height:13px;}
.foot-name{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:13px;letter-spacing:.06em;}
.foot-sub{font-size:11px;color:var(--dim);}
.sources{margin-top:16px;font-size:11px;color:var(--dimmer);line-height:1.7;}
.sources a{color:var(--dim);}

@media (min-width:520px){
  .page{border-left:1px solid var(--cyan-faint);border-right:1px solid var(--cyan-faint);}
}

```

### `assets/app.js`

```javascript
/* ============================================================
   DATA NAPOLI — tema (chiaro/scuro) e lingua (IT/EN)
   Persistenza in localStorage. Il bootstrap del tema/lingua che
   evita il flash del valore sbagliato vive in un piccolo script
   inline in <head> di ogni pagina — questo file applica il
   dizionario e gestisce i click sui due toggle.

   Convenzione chiavi dizionario:
   - chiavi senza prefisso: testo di interfaccia riusato da
     qualunque pagina (label di sezione, parole ricorrenti).
   - chiavi con prefisso m<slug>_: contenuto specifico di UNA
     partita (riassunto, note sui gol, fonti...). Quando esisterà
     il generatore da JSON (fase 1 della roadmap), queste chiavi
     verranno prodotte automaticamente invece che scritte a mano.

   Il valore del dizionario può contenere HTML semplice (<b>, <span>
   con classi già esistenti nel CSS) perché viene applicato con
   innerHTML: è testo scritto da chi mantiene il sito, non input
   dell'utente, quindi non c'è rischio di iniezione.
   ============================================================ */

window.DN_I18N = {
  it: {
    latest_match: "ULTIMA PARTITA",
    mc_meta_generic: "Scheda completa → gol, match flow, sostituzioni",
    hero_tagline: "Analisi matematica, visuale e statistica di ogni partita del Napoli. Solo dati verificati: dove una fonte non conferma un dettaglio, la pagina lo dichiara invece di stimarlo.",
    intensity_label: "ANDAMENTO — GOL E OCCASIONI PIÙ RILEVANTI",
    key_moments_label: "OCCASIONI CHIAVE",
    first_half: "PRIMO TEMPO",
    second_half: "SECONDO TEMPO",
    lineups_matchdata_label: "FORMAZIONI &amp; MATCH DATA",
    na_minute: "n.d.",
    min_na_label: "min. n.d.",
    st_asterisk: "s.t.*",

    m20260920_intensity_note: "Altezza = tipo evento (gol = massima, palo/traversa = media, cambio = minima) · colore = squadra. *Gol Fiorentina: minuto non specificato dalla fonte, collocato dopo il 23' come riportato nella cronaca.",
    m20260920_mc_label: "SERIE A · GIORNATA 5 · 20 SETTEMBRE 2026",
    m20260920_meta_matchday: "GIORNATA 5 · 2026/27",
    m20260920_meta_datetime: "Domenica 20 settembre 2026 · ore 12:30",
    m20260920_meta_stadium: "Stadio Artemio Franchi, Firenze",
    m20260920_summary: "Il Napoli passa in vantaggio nel primo tempo ma non riesce a difendere il risultato: la Fiorentina reagisce a inizio ripresa e agguanta il pareggio. Punto che lascia la squadra di Allegri a 6 punti dal terzetto di vertice Roma-Inter-Lazio.",
    m20260920_goal1_phase: "1° T",
    m20260920_goal1_note: "Sugli sviluppi di un calcio d'angolo. Nessun assist ufficialmente attribuito dalla fonte consultata.",
    m20260920_goal2_phase: "inizio 2°T*",
    m20260920_goal2_note: "Tiro deviato da Marin. *Minuto esatto non specificato dalla fonte consultata: riportato solo come \"a inizio ripresa\".",
    m20260920_km1: "<b>Traversa di Atta</b> (assist Mastantuono)",
    m20260920_km2: "<b>Traversa di Fagioli</b> (assist Mastantuono)",
    m20260920_km3: "<b>Palo colpito da Olivera</b>, nella stessa fase di gioco che ha preceduto il gol di Gilmour",
    m20260920_flow1: "<b>Traversa</b> — Atta (assist Mastantuono)",
    m20260920_flow2: "<b>Traversa</b> — Fagioli (assist Mastantuono)",
    m20260920_flow4: "<b>GOAL</b> — Jimenez, deviato da Marin",
    m20260920_flow5: "Anguissa dentro",
    m20260920_flow_note: "Il palo di Olivera (Napoli) e le sostituzioni senza minuto ufficiale non compaiono su questa linea, per non suggerire una collocazione temporale non verificata: restano nelle sezioni sopra.",
    m20260920_sub1: "<span class=\"sub-in\">Anguissa</span> dentro",
    m20260920_sub5: "Entrati nella ripresa: <span class=\"sub-in\">Beto, Goncalves, Gnonto, Valdepenas</span>",
    m20260920_unverified_p1: "<b>Non pubblicate in questa scheda.</b> La fonte consultata cita solo alcuni giocatori in campo (tra gli altri, per il Napoli: Gilmour e Lobotka a centrocampo, Rrahmani-Marin centrali, Lang sulla sinistra, Hojlund con De Bruyne, Politano, Di Lorenzo; per la Fiorentina: De Gea, Viery, Fagioli, Atta, Njie, Mastantuono, Pellegrino) — non l'undici completo ufficiale.",
    m20260920_unverified_p2: "Statistiche di squadra (tiri, possesso, corner, cartellini) non trovate su fonte verificata al momento della redazione. Sezione da completare quando disponibile un tabellino ufficiale, non stimata.",
    m20260920_sources: "Fonti: ANSA, \"Serie A: il Napoli non decolla, segna Gilmour ma la Fiorentina lo riprende\" (ansa.it, 20/09/2026)<br>Calendario e giornata: fantacalcio.it — Serie A 2026/27"
  },
  en: {
    latest_match: "LATEST MATCH",
    mc_meta_generic: "Full match report → goals, match flow, substitutions",
    hero_tagline: "Mathematical, visual and statistical analysis of every Napoli match. Verified data only: where a source doesn't confirm a detail, the page states so instead of estimating it.",
    intensity_label: "OVERVIEW — GOALS AND KEY CHANCES",
    key_moments_label: "KEY MOMENTS",
    first_half: "FIRST HALF",
    second_half: "SECOND HALF",
    lineups_matchdata_label: "LINE-UPS &amp; MATCH DATA",
    na_minute: "N/A",
    min_na_label: "min. n/a",
    st_asterisk: "2H*",

    m20260920_intensity_note: "Bar height = event type (goal = maximum, post/crossbar = medium, substitution = minimum) · colour = team. *Fiorentina's goal: exact minute not specified by the source, placed after the 23' mark as reported.",
    m20260920_mc_label: "SERIE A · MATCHDAY 5 · 20 SEPTEMBER 2026",
    m20260920_meta_matchday: "MATCHDAY 5 · 2026/27",
    m20260920_meta_datetime: "Sunday 20 September 2026 · 12:30",
    m20260920_meta_stadium: "Artemio Franchi Stadium, Florence",
    m20260920_summary: "Napoli go ahead in the first half but can't hold on to the lead: Fiorentina respond early in the second half and level the score. The point leaves Allegri's side 6 points off the top trio of Roma-Inter-Lazio.",
    m20260920_goal1_phase: "1H",
    m20260920_goal1_note: "From a corner-kick situation. No assist officially credited by the source consulted.",
    m20260920_goal2_phase: "early 2H*",
    m20260920_goal2_note: "Shot deflected by Marin. *Exact minute not specified by the source consulted: reported only as \"early in the second half\".",
    m20260920_km1: "<b>Crossbar hit — Atta</b> (assist: Mastantuono)",
    m20260920_km2: "<b>Crossbar hit — Fagioli</b> (assist: Mastantuono)",
    m20260920_km3: "<b>Post hit by Olivera</b>, in the same passage of play that preceded Gilmour's goal",
    m20260920_flow1: "<b>Crossbar</b> — Atta (assist: Mastantuono)",
    m20260920_flow2: "<b>Crossbar</b> — Fagioli (assist: Mastantuono)",
    m20260920_flow4: "<b>GOAL</b> — Jimenez, deflected by Marin",
    m20260920_flow5: "Anguissa on",
    m20260920_flow_note: "Olivera's post (Napoli) and the substitutions with no official minute are left off this line, to avoid implying an unverified time placement: they remain in the sections above.",
    m20260920_sub1: "<span class=\"sub-in\">Anguissa</span> on",
    m20260920_sub5: "On in the second half: <span class=\"sub-in\">Beto, Goncalves, Gnonto, Valdepenas</span>",
    m20260920_unverified_p1: "<b>Not published on this page.</b> The source consulted names only a few players on the pitch (among others, for Napoli: Gilmour and Lobotka in midfield, Rrahmani-Marin at centre-back, Lang on the left, Hojlund with De Bruyne, Politano, Di Lorenzo; for Fiorentina: De Gea, Viery, Fagioli, Atta, Njie, Mastantuono, Pellegrino) — not the full official line-up.",
    m20260920_unverified_p2: "Team statistics (shots, possession, corners, cards) not found on a verified source at time of writing. Section to be completed once an official match report is available — not estimated.",
    m20260920_sources: "Sources: ANSA, \"Serie A: il Napoli non decolla, segna Gilmour ma la Fiorentina lo riprende\" (ansa.it, 20/09/2026)<br>Fixture list and matchday: fantacalcio.it — Serie A 2026/27"
  }
};

(function () {
  function applyLang(lang) {
    document.documentElement.setAttribute("lang", lang);
    var dict = window.DN_I18N[lang] || window.DN_I18N.it;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key] != null) el.innerHTML = dict[key];
    });
    var pill = document.querySelector("[data-lang-toggle]");
    if (pill) pill.textContent = lang === "it" ? "EN" : "IT";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }
  function currentLang() {
    return document.documentElement.getAttribute("lang") === "en" ? "en" : "it";
  }

  document.addEventListener("DOMContentLoaded", function () {
    // il bootstrap inline in <head> ha già impostato data-theme e lang:
    // qui applichiamo il dizionario e agganciamo i due toggle.
    applyLang(currentLang());
  });

  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-theme-toggle]")) {
      var nextTheme = currentTheme() === "light" ? "dark" : "light";
      localStorage.setItem("dn-theme", nextTheme);
      applyTheme(nextTheme);
    }
    if (e.target.closest("[data-lang-toggle]")) {
      var nextLang = currentLang() === "it" ? "en" : "it";
      localStorage.setItem("dn-lang", nextLang);
      applyLang(nextLang);
    }
  });
})();

```

### `partite/fiorentina-napoli-2026-09-20.html`

```html
<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Fiorentina 1–1 Napoli — Data Napoli</title>
<link rel="icon" href="../assets/favicon.png">
<script>
  // Bootstrap tema/lingua PRIMA del render, per evitare il flash del valore sbagliato.
  // La logica completa (dizionario, click sui toggle) è in assets/app.js.
  (function(){
    var theme = localStorage.getItem('dn-theme');
    if(!theme){ theme = (window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark'; }
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('lang', localStorage.getItem('dn-lang') || 'it');
  })();
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/style.css">
<!--
  DATA NAPOLI — scheda partita (pilota architettura)
  Ogni dato riportato è tracciabile a una fonte elencata in fondo alla pagina.
  Nessun minuto, formazione o statistica non confermata è stato stimato o dedotto:
  dove la fonte non specifica un dettaglio, la sezione lo dichiara esplicitamente
  invece di ometterlo silenziosamente o inventarlo.
  Fonti: ANSA (ansa.it, 20/09/2026) · fantacalcio.it (calendario Serie A 2026/27)

  Traduzione EN: stessi fatti della fonte italiana, resi in inglese in assets/app.js
  (chiavi m20260920_*) — non è una nuova ricerca, solo una resa fedele dello stesso dato.
-->
</head>
<body>
<div class="page">

  <div class="brand-row">
    <a class="brand" href="../index.html">DATA <span>NAPOLI</span></a>
    <div class="brand-right">
      <div class="handle">@sscnapolidata</div>
      <button class="toggle-pill" data-lang-toggle type="button" aria-label="Cambia lingua / Change language">EN</button>
      <button class="toggle-icon" data-theme-toggle type="button" aria-label="Cambia tema / Change theme">
        <svg class="icon-to-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"/></svg>
        <svg class="icon-to-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.2A8.2 8.2 0 1 1 9.8 4a6.6 6.6 0 0 0 10.2 10.2Z"/></svg>
      </button>
    </div>
  </div>

  <div class="intensity">
    <div class="intensity-label" data-i18n="intensity_label">ANDAMENTO — GOL E OCCASIONI PIÙ RILEVANTI</div>
    <div class="intensity-chart">
      <div class="ibar" style="height:12%"><span class="itick">0'</span></div>
      <div class="ibar fio" style="height:50%"><span class="itick">17'</span></div>
      <div class="ibar fio" style="height:50%"><span class="itick">19'</span></div>
      <div class="ibar nap" style="height:100%"><span class="itick">23'</span></div>
      <div class="ibar fio" style="height:100%"><span class="itick" data-i18n="st_asterisk">s.t.*</span></div>
      <div class="ibar nap" style="height:20%"><span class="itick">90'</span></div>
      <div class="ibar" style="height:12%"><span class="itick">FT</span></div>
    </div>
    <div class="intensity-note" data-i18n="m20260920_intensity_note">Altezza = tipo evento (gol = massima, palo/traversa = media, cambio = minima) · colore = squadra. *Gol Fiorentina: minuto non specificato dalla fonte, collocato dopo il 23' come riportato nella cronaca.</div>
  </div>

  <div class="meta">
    <div><b>SERIE A</b> · <span data-i18n="m20260920_meta_matchday">GIORNATA 5 · 2026/27</span></div>
    <div data-i18n="m20260920_meta_datetime">Domenica 20 settembre 2026 · ore 12:30</div>
    <div data-i18n="m20260920_meta_stadium">Stadio Artemio Franchi, Firenze</div>
  </div>

  <div class="scoreboard">
    <div class="teams-row">
      <div class="team home">FIORENTINA</div>
      <div class="team away">NAPOLI</div>
    </div>
    <div class="score">
      <span>1</span><span class="dash">–</span><span>1</span>
    </div>
    <div class="ft-tag"><span class="ft-dot"></span>FULL TIME</div>
  </div>

  <section class="summary">
    <div class="label">MATCH SUMMARY</div>
    <p data-i18n="m20260920_summary">Il Napoli passa in vantaggio nel primo tempo ma non riesce a difendere il risultato: la Fiorentina reagisce a inizio ripresa e agguanta il pareggio. Punto che lascia la squadra di Allegri a 6 punti dal terzetto di vertice Roma-Inter-Lazio.</p>
  </section>

  <section class="goals">
    <div class="label">GOAL TIMELINE</div>

    <div class="goal-row">
      <div class="goal-min">23'<small data-i18n="m20260920_goal1_phase">1° T</small></div>
      <div class="goal-body">
        <div class="goal-scorer">B. Gilmour</div>
        <div class="goal-team">NAPOLI</div>
        <div class="goal-note" data-i18n="m20260920_goal1_note">Sugli sviluppi di un calcio d'angolo. Nessun assist ufficialmente attribuito dalla fonte consultata.</div>
        <div class="goal-run">0–1</div>
      </div>
    </div>

    <div class="goal-row">
      <div class="goal-min">45+'<small data-i18n="m20260920_goal2_phase">inizio 2°T*</small></div>
      <div class="goal-body">
        <div class="goal-scorer">A. Jimenez</div>
        <div class="goal-team">FIORENTINA</div>
        <div class="goal-note" data-i18n="m20260920_goal2_note">Tiro deviato da Marin. *Minuto esatto non specificato dalla fonte consultata: riportato solo come "a inizio ripresa".</div>
        <div class="goal-run">1–1</div>
      </div>
    </div>
  </section>

  <section class="key-moments">
    <div class="label" data-i18n="key_moments_label">OCCASIONI CHIAVE</div>

    <div class="event-row">
      <div class="event-min">17'</div>
      <div class="event-body"><span data-i18n="m20260920_km1"><b>Traversa di Atta</b> (assist Mastantuono)</span> <div class="event-team">FIORENTINA</div></div>
    </div>
    <div class="event-row">
      <div class="event-min">19'</div>
      <div class="event-body"><span data-i18n="m20260920_km2"><b>Traversa di Fagioli</b> (assist Mastantuono)</span> <div class="event-team">FIORENTINA</div></div>
    </div>
    <div class="event-row">
      <div class="event-min" data-i18n="na_minute">n.d.</div>
      <div class="event-body"><span data-i18n="m20260920_km3"><b>Palo colpito da Olivera</b>, nella stessa fase di gioco che ha preceduto il gol di Gilmour</span> <div class="event-team">NAPOLI</div></div>
    </div>
  </section>

  <section class="matchflow">
    <div class="label">MATCH FLOW</div>

    <div class="flow-phase" data-i18n="first_half">PRIMO TEMPO</div>
    <div class="flow-track">
      <div class="flow-item">
        <div class="flow-min">17'</div>
        <div class="flow-desc"><span data-i18n="m20260920_flow1"><b>Traversa</b> — Atta (assist Mastantuono)</span> <span class="flow-tag">FIO</span></div>
      </div>
      <div class="flow-item">
        <div class="flow-min">19'</div>
        <div class="flow-desc"><span data-i18n="m20260920_flow2"><b>Traversa</b> — Fagioli (assist Mastantuono)</span> <span class="flow-tag">FIO</span></div>
      </div>
      <div class="flow-item">
        <div class="flow-min">23'</div>
        <div class="flow-desc"><b>GOAL</b> — Gilmour <span class="flow-tag">NAP</span><span class="flow-run">0–1</span></div>
      </div>
    </div>

    <div class="flow-phase" data-i18n="second_half">SECONDO TEMPO</div>
    <div class="flow-track">
      <div class="flow-item open">
        <div class="flow-min" data-i18n="min_na_label">min. n.d.</div>
        <div class="flow-desc"><span data-i18n="m20260920_flow4"><b>GOAL</b> — Jimenez, deviato da Marin</span> <span class="flow-tag">FIO</span><span class="flow-run">1–1</span></div>
      </div>
      <div class="flow-item">
        <div class="flow-min">90'</div>
        <div class="flow-desc"><span data-i18n="m20260920_flow5">Anguissa dentro</span> <span class="flow-tag">NAP</span></div>
      </div>
    </div>

    <div class="flow-note" data-i18n="m20260920_flow_note">Il palo di Olivera (Napoli) e le sostituzioni senza minuto ufficiale non compaiono su questa linea, per non suggerire una collocazione temporale non verificata: restano nelle sezioni sopra.</div>
  </section>

  <section class="subs">
    <div class="label">SUBSTITUTIONS</div>

    <div class="sub-row">
      <div class="sub-min">90'</div>
      <div class="sub-names" data-i18n="m20260920_sub1"><span class="sub-in">Anguissa</span> dentro</div>
      <div class="sub-team-tag">NAP</div>
    </div>
    <div class="sub-row">
      <div class="sub-min" data-i18n="na_minute">n.d.</div>
      <div class="sub-names"><span class="sub-out">Højlund</span> <span class="sub-arrow">→</span> <span class="sub-in">Lucca</span></div>
      <div class="sub-team-tag">NAP</div>
    </div>
    <div class="sub-row">
      <div class="sub-min" data-i18n="na_minute">n.d.</div>
      <div class="sub-names"><span class="sub-out">Lang</span> <span class="sub-arrow">→</span> <span class="sub-in">Neres</span></div>
      <div class="sub-team-tag">NAP</div>
    </div>
    <div class="sub-row">
      <div class="sub-min" data-i18n="na_minute">n.d.</div>
      <div class="sub-names"><span class="sub-out">Politano</span> <span class="sub-arrow">→</span> <span class="sub-in">Favasuli</span></div>
      <div class="sub-team-tag">NAP</div>
    </div>
    <div class="sub-row">
      <div class="sub-min" data-i18n="na_minute">n.d.</div>
      <div class="sub-names" data-i18n="m20260920_sub5">Entrati nella ripresa: <span class="sub-in">Beto, Goncalves, Gnonto, Valdepenas</span></div>
      <div class="sub-team-tag">FIO</div>
    </div>
  </section>

  <section class="unverified">
    <div class="label" data-i18n="lineups_matchdata_label">FORMAZIONI &amp; MATCH DATA</div>
    <div class="empty-state">
      <p data-i18n="m20260920_unverified_p1"><b>Non pubblicate in questa scheda.</b> La fonte consultata cita solo alcuni giocatori in campo (tra gli altri, per il Napoli: Gilmour e Lobotka a centrocampo, Rrahmani-Marin centrali, Lang sulla sinistra, Hojlund con De Bruyne, Politano, Di Lorenzo; per la Fiorentina: De Gea, Viery, Fagioli, Atta, Njie, Mastantuono, Pellegrino) — non l'undici completo ufficiale.</p>
      <p data-i18n="m20260920_unverified_p2">Statistiche di squadra (tiri, possesso, corner, cartellini) non trovate su fonte verificata al momento della redazione. Sezione da completare quando disponibile un tabellino ufficiale, non stimata.</p>
    </div>
  </section>

  <footer>
    <div class="foot-brand">
      <div class="foot-mark">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 20V4L20 20V4" stroke="#08090B" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div>
        <div class="foot-name">DATA NAPOLI</div>
        <div class="foot-sub">Napoli Analitica · @sscnapolidata</div>
      </div>
    </div>
    <div class="sources" data-i18n="m20260920_sources">
      Fonti: ANSA, "Serie A: il Napoli non decolla, segna Gilmour ma la Fiorentina lo riprende" (ansa.it, 20/09/2026)<br>
      Calendario e giornata: fantacalcio.it — Serie A 2026/27
    </div>
  </footer>

</div>
<script src="../assets/app.js" defer></script>
</body>
</html>

```

### `assets/favicon.png`

Asset **binario**, non incluso come testo in questo prompt per scelta deliberata (non
va mai incollato un asset binario come base64 in un prompt/PR). È il logo circolare
azzurro con "N" bianca del profilo X `@sscnapolidata`, già scaricato dall'utente nella
conversazione in cui è stato generato questo documento. Se non lo trovi nella working
directory o tra gli allegati forniti, **chiedilo esplicitamente all'utente** prima di
procedere: non generare un'icona sostitutiva né un placeholder — per lo stesso principio
della sezione 1, non si inventa un asset del brand.

---

## 7. Comandi da eseguire

```bash
# se il repository non è già clonato in locale
git clone https://github.com/marcorzzn/sscnapolidata.git
cd sscnapolidata

mkdir -p assets partite

# scrivi qui i quattro file di testo della sezione 6 con il loro contenuto esatto,
# e copia assets/favicon.png dal file fornito dall'utente (vedi nota sopra)

git add .
git commit -m "Pilota: home + scheda partita Fiorentina-Napoli 1-1 (20/09/2026), design system, tema chiaro/scuro e lingua IT/EN"
git push origin main
```

---

## 8. Dopo il push: attivare GitHub Pages

Nel repository su github.com: **Settings → Pages → Build and deployment → "Deploy from a
branch"** → branch `main`, cartella `/ (root)` → **Save**. Il sito sarà raggiungibile su
`https://marcorzzn.github.io/sscnapolidata/` dopo 1-2 minuti.

---

## 9. Checklist di verifica finale

- [ ] La home (`index.html`) carica e la card della partita porta a
      `partite/fiorentina-napoli-2026-09-20.html`
- [ ] La pagina partita carica correttamente `../assets/style.css`,
      `../assets/app.js` e `../assets/favicon.png` (percorsi relativi, la pagina vive
      in `partite/`)
- [ ] Il pulsante tema (icona sole/luna) alterna correttamente sfondo/testo su
      **entrambe** le pagine, senza flash al caricamento
- [ ] Il pulsante lingua (pillola IT/EN) traduce **tutto** il testo marcato
      `data-i18n`, incluse le etichette generiche e i contenuti specifici della
      partita — nessuna parola italiana residua quando si passa a EN
- [ ] Nessun file `.html` contiene un blocco `<style>` incorporato duplicato — il CSS
      deve venire solo da `assets/style.css`
- [ ] Il favicon compare nella tab del browser su entrambe le pagine
- [ ] Il sito è leggibile su schermo mobile stretto, in entrambi i temi

---

## 10. Roadmap per continuare il progetto (contesto per sessioni future su questo repo)

- **Fase 0 — Design system**: completata (`assets/style.css`), incluso il tema chiaro.
- **Tema/lingua**: completati (`assets/app.js`), da estendere con nuove chiavi
  `m<slug>_*` a ogni nuova partita.
- **Fase 1 — Schema dati e registro continuità club**: in corso. Prossimo passo
  naturale: estrarre da `partite/fiorentina-napoli-2026-09-20.html` un **template** con
  placeholder, alimentato da un file JSON verificato per partita (che genererebbe anche
  le chiavi `m<slug>_*` in entrambe le lingue automaticamente), invece di scrivere
  l'HTML a mano per ogni nuova partita. Il registro di continuità societaria va
  progettato come tabella separata dalle partite, con stato esplicito per ogni caso
  dubbio (`stessa_società` / `successione_riconosciuta` / `fusione_parziale` /
  `nessuna_continuità` / `da_verificare`) — mai continuità implicita.
- **Fase 2 — Automazione partita per partita**: GitHub Actions che dopo ogni gara scarica
  i dati (API-Football o Football-Data.org per eventi, soccerdata/Understat per xG),
  aggiorna il JSON e rigenera la pagina dal template.
- **Fase 3 — Backfill storico dal 1° agosto 1926**: la parte più onerosa. Verifica
  manuale rigorosa, procedendo probabilmente a ritroso per decenni, applicando il
  registro di continuità caso per caso.
- **Fase 4 — Query engine trasversale**: confronti tra epoche, pagine anagrafiche
  giocatori/allenatori.
- **Fase 5 — Modulo curiosità**: automazione della ricerca aneddoti storici con
  gerarchia di fonti a 4 livelli e doppia conferma per ogni dato sorprendente.
- **Fase 6 — Mappa trasferte stagionali**: dipende da coordinate stadi verificate.
- **Fase 7 — "La Partita Eterna"**: aggregato H2H cumulativo cliccabile, dipende dal
  backfill storico per essere davvero significativo (il componente UI può però essere
  costruito prima, mostrando l'aggregato parziale con l'avvertenza esplicita che copre
  solo i precedenti finora verificati).

---

## 11. Due template di contenuto già pronti, da riusare quando servirà

L'utente ha già due prompt testuali completi, prodotti in una fase precedente del
progetto, non riportati qui per lunghezza ma disponibili su richiesta:

1. Un prompt per generare l'**infografica social verticale 1:2** di ogni partita (fondo
   nero, azzurro elettrico come accento, waveform solo in forma funzionale, stessa
   regola "mai inventare, meglio omettere una sezione").
2. Un prompt per generare **"curiosità"** statistiche/storiche su Napoli e avversario per
   X, con gerarchia di fonti a 4 livelli, doppia conferma per i dati sorprendenti, e
   scarto di qualunque curiosità non verificabile.

Qualunque contenuto tu produca a partire da questi due template eredita comunque, senza
eccezioni, i principi della sezione 1.
