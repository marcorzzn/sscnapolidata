# SSC Napoli Data (@sscnapolidata)

**Data Napoli, Napoli Analitica** — Enciclopedia digitale, archivio storico verificato, audit trail reversibile, mappe interattive e visualizzatore 3D dedicati alla Società Sportiva Calcio Napoli.

Pubblicato su GitHub Pages: [https://marcorzzn.github.io/sscnapolidata/](https://marcorzzn.github.io/sscnapolidata/)

---

## ⚡ Principi Architetturali Fondamentali
1. **Nessun dato inventato**: ogni dato fattuale o storico deriva da fonti verificate (Report Ufficiale Lega Serie A, RSSSF, OpenFootball, Almanacco Panini, Wikipedia IT CC BY-SA 4.0). Le assenze di dati sono dichiarate in modo trasparente (`nd`, `na`, `pending`).
2. **Nessun dato perso (Audit Reversibile)**: ogni scrittura o modifica passa dalla CLI `dn.py`, che imposta il contesto di sessione (`attore`, `motivo`, `fonte_id`, `batch_id`) e attiva trigger per-column su `audit_log`. Ogni modifica è annullabile con `dn revert`.
3. **Qualità su 2 assi**: `confidence` (alta, media, bassa) separata da `verificato` (0 o 1). Gli importer automatici non sovrascrivono mai record con `verificato = 1`; eventuali discrepanze vengono isolate in `conflitti_import`.
4. **Git è la verità permanente**: `datanapoli.sqlite` resta in `.gitignore`, mentre `db/dump/` contiene il dump testuale deterministico ordinato per chiave primaria. Chiunque può ricreare il DB da zero con `python dn.py build-db`.
5. **Brand Identity & Social Exporter**: icona con **N geometrica** su sfondo ciano `#01A0E8`, profilo a frequenza d'onda del Vesuvio e del Golfo, ed esportatore di schede social 1:2 con handle `@sscnapolidata`.

---

## 🚀 Quickstart

### 1. Prerequisiti
- **Python 3.12+** (stdlib standard: nessun ORM o tool esterno richiesto)
- **Node.js 20+** (per l'applicazione web React + Vite + Three.js)

### 2. Gestione Database con CLI `dn.py`
```powershell
# Esegui le migrazioni numerate su SQLite (con backup automatico)
python dn.py migrate

# Verifica le invarianti e la qualità del dato (FK, marcatori vs risultato, date)
python dn.py check

# Genera il dump testuale deterministico per Git
python dn.py dump

# Ricostruisci il database SQLite da zero (migrazioni + dump)
python dn.py build-db

# Esporta i dati JSON con mappa di copertura 'cov' per il sito web
python dn.py export
```

### 3. Avvio Applicazione Web Locale
```powershell
# Installa le dipendenze frontend
npm install --legacy-peer-deps

# Avvia il server di sviluppo locale
npm run dev

# Genera la build di produzione statica
npm run build
```

---

## 🛠️ Comandi Principali CLI `dn.py`

| Sottocomando | Descrizione |
|---|---|
| `dn fix <tabella> <id> <campo> <valore> --motivo "..." --fonte <id>` | Corregge un campo, traccia l'audit log e imposta `verificato=1`. |
| `dn history [tabella] [id]` | Visualizza lo storico cronologico delle modifiche e dei vecchi/nuovi valori. |
| `dn revert --audit-id <id>` | Annulla in modo reversibile una modifica ripristinando il vecchio valore. |
| `dn revert --batch <batch_id>` | Annulla in blocco un intero lotto di modifiche correlate. |
| `dn add-scorer --partita-id <id> --giocatore <nome> --minuto <m>` | Inserisce un marcatore collegando l'identità del giocatore. |
| `dn import formazioni <file.csv> [--dry-run]` | Importa formazioni da CSV; protegge i record verificati e isola i nomi sconosciuti in quarantena. |
| `dn merge persone <id_tenuto> <id_scartato>` | Fonde due entità duplicate, riassegna le FK e crea un record tombstone `fuso_in_id`. |
| `dn check [--stagione <anno>]` | Controlla integrità referenziale, somme gol, date anomale e stati di copertura. |
| `dn query ...` | Interroga statistiche su partite, squadre, stagioni e marcatori. |

---

## 📁 Struttura della Repository

```
/
├── dn.py                       # CLI unificata
├── datanapoli/                 # Pacchetto Python core
│   ├── db.py                   # Connessione, foreign keys ON, session scope, backup
│   ├── migrate.py              # Runner migrazioni con PRAGMA user_version
│   ├── audit.py                # Generatore trigger table_info, history, revert
│   ├── dump.py                 # Dump testuale deterministico e build-db
│   ├── export.py               # DB -> JSON con mappe cov (null preservation)
│   ├── check.py                # Verifica invarianti
│   └── importers/              # Importatori CSV validati e resistenti ai conflitti
├── db/
│   ├── datanapoli.sqlite       # Database SQLite (in .gitignore)
│   ├── schema.sql              # DDL consolidato generato (solo lettura)
│   ├── migrations/             # Migrazioni numerate SQL (001_baseline .. 014_audit)
│   ├── dump/                   # Dump testuale deterministico per Git (fonti di verità)
│   └── backups/                # Backup automatici pre-migrazione e pre-scrittura
├── src/                        # Applicazione Web React 19 + TypeScript + Vite
│   ├── components/             # BrandMark, InfographicExporter, Stadium3D, Museum, Audit
│   ├── data/                   # Dataset certificato e mapping analitici
│   └── App.tsx                 # Core UI con switch temi (Dark/Light) e lingue (IT/EN)
├── public/                     # Asset statici, icone N geometrica, banner e loghi
├── docs/                       # Documentazione tecnica approfondita
│   ├── ARCHITECTURE.md         # Architettura, flusso dati, Git vs .gitignore
│   ├── DATA_MODEL.md           # DDL, convenzioni date/stagioni, stati di copertura
│   └── WORKFLOWS.md            # Ricette operative step-by-step
└── CONTRIBUTING.md             # Guida e requisiti per i contributori
```

---

## ⚖️ Conformità, Etica e Privacy
- **Zero Profilazione**: nessun cookie, nessun tracker esterno, zero raccolta di dati personali.
- **Licenze e Diritti**: citazione rigorosa di ogni fonte. Testi derivati da Wikipedia rilasciati sotto licenza **CC BY-SA 4.0**.
- **Gestione del Danno**: qualsiasi errore di correzione può essere annullato istantaneamente tramite `dn revert`.
