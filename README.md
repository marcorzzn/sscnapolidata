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
│   ├── style.css           design system: token colore, tipografia, tutti i componenti
│   └── favicon.png         logo del profilo X (@sscnapolidata)
├── partite/
│   └── <slug-partita>.html una pagina per partita (es. fiorentina-napoli-2026-09-20.html)
└── README.md
```

## Aggiungere una nuova partita

1. Verificare i dati su almeno una fonte affidabile, in ordine di priorità: fonti ufficiali
   (Lega Serie A, club) → database storici (RSSSF, FBref) → testate giornalistiche affidabili.
2. Copiare la struttura di `partite/fiorentina-napoli-2026-09-20.html` in un nuovo file
   `partite/<squadra1>-<squadra2>-<data>.html`.
3. Aggiungere una `.match-card` in `index.html` che punta alla nuova pagina.
4. Dove un dato (minuto, formazione, statistica) non è verificabile: dichiararlo
   esplicitamente nella pagina stessa, mai stimarlo o ometterlo silenziosamente.

## Design system

Colori, tipografia e ogni componente vivono in `assets/style.css`, condiviso da tutte le
pagine — non duplicare CSS nelle singole pagine partita. Ogni elemento visivo deve
rappresentare un dato reale e citabile: niente grafici o waveform puramente decorativi.

## Stato del progetto

Pilota architetturale: una sola partita verificata manualmente, come prova che schema dati
e design system reggono su dati reali prima di costruire l'automazione (scraping +
GitHub Actions) per le partite successive.
