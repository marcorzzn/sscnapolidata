# ARCHITETTURA TECNICA — DATA NAPOLI (@sscnapolidata)

Questo documento illustra l'architettura complessiva del sistema, il ciclo di vita del dato, il flusso tra database, dump deterministico e sito web, e la distinzione tra file tracciati in Git e file ignorati.

---

## 1. I Sei Pilastri Architetturali

Il progetto adotta un'infrastruttura pragmatica e manutenibile basata esclusivamente su **standard aperti** (SQLite + Python standard library sul backend, React + Vite per la visualizzazione web):

1. **Migrazioni Numerate in SQL Puro**:
   - I file di migrazione risiedono in `db/migrations/<NNN>_<nome>.sql`.
   - Il contatore nativo di SQLite `PRAGMA user_version` traccia lo stato della versione senza dipendenze da framework esterni (come Alembic o Yoyo).
   - Ogni migrazione viene eseguita in una transazione e preceduta da un backup non bloccante via `sqlite3.Connection.backup()`.

2. **Audit Trail con Contesto di Sessione**:
   - Un'unica tabella `sessione` (con riga singola `id = 1`) definisce il contesto dell'operazione (`attore`, `motivo`, `fonte_id`, `batch_id`).
   - Trigger generati automaticamente (`trg_<tabella>_u_<campo>`) intercettano ogni aggiornamento solo se il valore effettivo è cambiato (`WHEN OLD.col IS NOT NEW.col`).
   - Il vecchio e il nuovo valore vengono salvati come JSON quotato (`json_quote()`) per distinguere inequivocabilmente `NULL` dalla stringa `'NULL'`.
   - Nessuna modifica è irreversibile: il comando `dn revert` ripristina lo stato precedente attraverso una normale istruzione `UPDATE`, che a sua volta viene registrata nel log.

3. **Assenza Dati con NULL e Tabella Copertura**:
   - Vietate le sentinelle nei campi scalari (es. `gol_casa = 'ND'`): rompono i tipi INTEGER, falsano `SUM/AVG` e complicano le query.
   - Lo stato di completezza di ogni sezione (`marcatori`, `arbitro`, `affluenza`, `stadio`, `formazioni`, `eventi`, `statistiche`, `xg`) è modellato nella tabella `copertura` e nella tabella temporale `copertura_regole` (es. `xG` assente per natura prima del 2010).
   - La vista `v_copertura_partite` valuta la precedenza: eccezione esplicita -> regola temporale -> dedotto dai dati -> `pending`.

4. **Qualità del Dato su Due Assi (Confidence & Verifica)**:
   - Due colonne distinte:
     - `confidence`: affidabilità della fonte (`alta`, `media`, `bassa`).
     - `verificato`: controllo manuale certificato (`0` o `1`), con colonne `verificato_da`, `verificato_il`, `fonte_id`.
   - **Regola di Protezione degli Importer**: gli script automatici (Wikipedia, OpenFootball) **non possono mai sovrascrivere** un record con `verificato = 1`. In caso di conflitto, la proposta viene registrata nella tabella `conflitti_import` per successiva revisione umana.

5. **Entry Point Unico CLI `dn.py`**:
   - Tutti gli interventi manuali, le migrazioni, i controlli di integrità e gli export passano dalla CLI `dn.py`.
   - I vecchi script rimangono modulari o richiamati come wrapper senza riscritture traumatiche.

6. **Git è la Verità Permanente (Zero Dati Persi)**:
   - Il file binario `datanapoli.sqlite` non è committato in Git (diff illeggibili, rischio di corruzione binaria).
   - Il comando `dn dump` serializza l'intero database in file SQL testuali in `db/dump/`, ordinati rigidamente per chiave primaria.
   - Git registra ogni correzione come un diff di una singola riga di testo. Con `dn build-db`, chiunque può ricreare il database SQLite in modo perfettamente identico.

---

## 2. Flusso dei Dati: DB -> Dump/Export -> Sito Web

```
+--------------------------------------------------------------+
|                    FONTI DATI ACCREDITATE                   |
| Report Lega Serie A, RSSSF, OpenFootball, Almanacchi Panini, |
| Wikipedia IT (CC BY-SA 4.0), Cronache storiche               |
+--------------------------------------------------------------+
                               |
                               v
                     +-------------------+
                     | CLI dn.py import  | (con --dry-run e
                     | e dn.py fix       | protezione verificato=1)
                     +-------------------+
                               |
                               v
              +---------------------------------+
              |     SQLite datanapoli.sqlite    |
              | (Audit triggers, copertura v2,  |
              |  foreign keys ON, sessione id=1)|
              +---------------------------------+
                    /                     \
       (dn.py dump)/                       \(dn.py export)
                  v                         v
       +--------------------+      +--------------------+
       |  db/dump/*.sql     |      | data/matches.json  |
       | Dump deterministico|      | (Mappe cov, null   |
       | tracciato in GIT   |      |  preservati)       |
       +--------------------+      +--------------------+
                  |                         |
                  v                         v
       +--------------------+      +--------------------+
       | GitHub Repository  |      | App React + Vite   |
       | (Diff testuali     |      | (GitHub Pages /    |
       |  leggibili a riga) |      |  dist statico)     |
       +--------------------+      +--------------------+
```

---

## 3. Matrice Git: Cosa è versionato e cosa no

| Cartella / File | In Git? | Rationale |
|---|---|---|
| `db/datanapoli.sqlite` | **NO (.gitignore)** | File binario; git diff illeggibile; rischio merge conflicts binari distruttivi. |
| `db/backups/` | **NO (.gitignore)** | File binari temporanei di sicurezza locale generati pre-migrazione. |
| `db/dump/*.sql` | **SÌ** | **Fonte di verità duratura**. Testo puro, ordinato per PK. Mostra correzioni chiare nei diff di commit e PR. |
| `db/migrations/*.sql` | **SÌ** | Storico immutabile dell'evoluzione dello schema. |
| `db/schema.sql` | **SÌ** | Schema DDL consolidato generato automaticamente dopo `dn migrate`. |
| `data/import/*.csv` | **SÌ** | File di arricchimento compilati a mano o revisionati prima dell'ingest. |
| `data/matches.json` | **SÌ** | Dataset esportato per consumo del frontend e GitHub Pages. |
| `src/` e `public/` | **SÌ** | Codice sorgente dell'interfaccia utente React 19, visualizzatore 3D e asset visivi. |
| `node_modules/`, `dist/`| **NO (.gitignore)** | Dipendenze e artefatti di compilazione generati automaticamente. |

---

## 4. Ricostruzione Deterministica da Zero (`dn build-db`)

Se un collaboratore clona il repository o se si lavora su una nuova macchina:
1. `python dn.py build-db`:
   - Crea un database vuoto.
   - Esegue in ordine le migrazioni da `001_baseline.sql` a `014_audit_triggers.sql`.
   - Carica tutte le righe dai dump testuali `db/dump/*.sql`.
   - Verifica la conformità delle chiavi esterne con `PRAGMA foreign_key_check`.
2. Il database SQLite locale è identico a quello di produzione, pronto per interrogazioni o interventi.
