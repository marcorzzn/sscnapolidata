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
