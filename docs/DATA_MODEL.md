# MODELLO DATI E CONVENZIONI — DATA NAPOLI

Questo documento definisce lo schema relazionale del database SQLite, le convenzioni di standardizzazione dei tipi di dato e la semantica dei livelli di qualità e copertura.

---

## 1. Convenzioni Obbligatorie sui Tipi di Dato

1. **Date**:
   - Sempre formato ISO 8601 esteso: `YYYY-MM-DD` in colonna `TEXT` (es. `1987-05-10`, `2026-09-20`).
   - Permette confronti alfabetici diretti (`BETWEEN`, `>=`, `<=`), ordinamenti naturali e funzioni SQLite `strftime()`.
2. **Stagioni**:
   - Stringa a 7 caratteri nella forma `YYYY-YY` (es. `1986-87`, `2022-23`, `2026-27`).
   - Per stagioni estese o atipiche precedenti al 1930 viene mantenuto il formato a 4 cifre per anno singolo o `YYYY-YY`.
3. **Nomi di Squadre e Persone**:
   - **Forma Canonica**: registrata nella colonna `nome` / `nome_completo`.
   - **Alias e Varianti Grafiche**: non sporcano la tabella primaria ma vivono in `squadre_alias` con indicazione del tipo (`official`, `historical`, `abbreviation`, `typo`).
   - **Quarantena Nomi**: qualsiasi stringa non risolta con certezza al 100% viene archiviata in `nomi_da_risolvere`. È fatto divieto assoluto di inventare o indovinare identità.
4. **Valori Mancanti**:
   - Nei campi scalari (es. `gol_casa`, `affluenza`, `stadio`), un dato assente è **sempre `NULL`**. Mai stringhe vuote `""` o sentinelle `'ND'`.

---

## 2. Qualità del Dato: Confidence e Verifica (2 Assi)

I dati non mischiano affidabilità della fonte e controllo umano: sono separati in due colonne distinte:

```sql
confidence TEXT NOT NULL DEFAULT 'media' CHECK (confidence IN ('alta','media','bassa')),
verificato INTEGER NOT NULL DEFAULT 0 CHECK (verificato IN (0,1)),
verificato_da TEXT,
verificato_il TEXT,
fonte_id INTEGER REFERENCES fonti(id)
```

| Colonna | Valori | Significato Operativo |
|---|---|---|
| `confidence` | `'alta'` | Fonte primaria o ufficiale (Report Lega Serie A, documenti ufficiali club, referti arbitrali). |
| | `'media'` | Database storici autorevoli o fonti secondarie consolidate (RSSSF, openfootball, Almanacco Panini). |
| | `'bassa'` | Fonti di cronaca informale, articoli non firmati o testate minori non riscontrate. |
| `verificato` | `1` | **Record protetto**. Il dato è stato controllato e confermato manualmente. Gli importatori automatici non possono sovrascriverlo. |
| | `0` | Dato inserito automaticamente ma non ancora revisionato da un curatore umano. |

### Tabella Conflitti di Import (`conflitti_import`)
Se uno script di import automatico (es. `71_run_wikipedia_all.py` o `66_import_openfootball.py`) individua un valore contrastante rispetto a una riga con `verificato = 1`, lo script **non applica la modifica**, ma genera un record in `conflitti_import`:

```sql
CREATE TABLE conflitti_import (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    tabella TEXT NOT NULL,
    pk TEXT NOT NULL,
    campo TEXT NOT NULL,
    valore_db TEXT,
    valore_fonte TEXT,
    fonte_id INTEGER,
    stato TEXT NOT NULL DEFAULT 'aperto' CHECK (stato IN ('aperto','risolto','ignorato'))
);
```

---

## 3. Gestione Assenza Dati: I 5 Stati di Copertura

L'assenza di dati per una sezione o entità è governata dalla tabella `copertura`:

```sql
CREATE TABLE copertura (
  entita TEXT NOT NULL, -- 'partita', 'persona', 'squadra'
  entita_id INTEGER NOT NULL,
  sezione TEXT NOT NULL, -- 'marcatori','formazioni','arbitro','affluenza','stadio','eventi','statistiche','xg'
  stato TEXT NOT NULL CHECK (stato IN ('completo','parziale','nd','na','pending')),
  motivo TEXT,
  fonte_id INTEGER REFERENCES fonti(id),
  aggiornato_il TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (entita, entita_id, sezione)
);
```

### Regole "per natura" (`copertura_regole`)
Per dati che non possono esistere prima di determinate date per ragioni storiche o tecnologiche:

```sql
CREATE TABLE copertura_regole (
  sezione TEXT NOT NULL,
  data_da TEXT,
  data_a TEXT,
  stato TEXT NOT NULL CHECK (stato IN ('na','nd')),
  motivo TEXT NOT NULL
);
INSERT INTO copertura_regole VALUES ('xg', NULL, '2009-12-31', 'na', 'xG non esistono prima del 2010');
```

### Significato dei 5 Stati:

| Stato | Significato | Resa nel Sito |
|---|---|---|
| `completo` | Il dato è interamente presente e confermato. | Visualizzato normalmente. |
| `parziale` | Righe presenti ma incomplete (es. solo 8 titolari su 11). | Mostrato con badge "Parziale". |
| `nd` | **Non disponibile nella fonte**. La fonte storica consultata non riporta l'informazione. | "n.d." |
| `na` | **Non applicabile per natura** (es. Expected Goals negli anni '80). | Sezione nascosta o marcata "N/A". |
| `pending` | **In arrivo**. Il dato esiste nella storia ma non è stato ancora digitalizzato. | "In arrivo" |

### Precedenza della Vista `v_copertura_partite`
1. Se esiste una riga esplicita in `copertura`, ha priorità massima.
2. Altrimenti, se si applica una regola temporale da `copertura_regole`, si usa lo stato della regola (`na` o `nd`).
3. Altrimenti, se i dati nel DB sono sufficienti (es. marcatori presenti o partita terminata 0-0), deduce `completo`.
4. Altrimenti, applica il default implicito `pending`.

---

## 4. Nuove Tabelle Figlie (Schema Consolidato)

### `partite_formazioni`
```sql
CREATE TABLE partite_formazioni (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    partita_id INTEGER NOT NULL REFERENCES partite(id),
    squadra_id INTEGER NOT NULL REFERENCES squadre(id),
    persona_id INTEGER NOT NULL REFERENCES persone(id),
    numero_maglia INTEGER,
    ruolo TEXT,
    titolare INTEGER NOT NULL DEFAULT 1 CHECK (titolare IN (0,1)),
    capitano INTEGER NOT NULL DEFAULT 0 CHECK (capitano IN (0,1)),
    minuto_in INTEGER,
    minuto_out INTEGER,
    confidence TEXT NOT NULL DEFAULT 'media' CHECK (confidence IN ('alta','media','bassa')),
    verificato INTEGER NOT NULL DEFAULT 0 CHECK (verificato IN (0,1)),
    fonte_id INTEGER REFERENCES fonti(id),
    UNIQUE (partita_id, squadra_id, persona_id)
);
```

### `partite_eventi` (Cartellini, Sostituzioni, Rigori Sbagliati)
```sql
CREATE TABLE partite_eventi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    partita_id INTEGER NOT NULL REFERENCES partite(id),
    minuto INTEGER,
    recupero INTEGER,
    tipo TEXT NOT NULL CHECK (tipo IN ('ammonizione','espulsione','sostituzione','rigore_sbagliato','altro')),
    squadra_id INTEGER REFERENCES squadre(id),
    persona_id INTEGER REFERENCES persone(id),
    persona2_id INTEGER REFERENCES persone(id),
    nota TEXT,
    confidence TEXT NOT NULL DEFAULT 'media' CHECK (confidence IN ('alta','media','bassa')),
    verificato INTEGER NOT NULL DEFAULT 0 CHECK (verificato IN (0,1)),
    fonte_id INTEGER REFERENCES fonti(id)
);
```

### `partite_statistiche` (Formato Lungo Estendibile)
```sql
CREATE TABLE partite_statistiche (
    partita_id INTEGER NOT NULL REFERENCES partite(id),
    squadra_id INTEGER NOT NULL REFERENCES squadre(id),
    metrica TEXT NOT NULL, -- 'possesso','tiri','tiri_porta','xg','corner',...
    valore REAL,
    confidence TEXT NOT NULL DEFAULT 'media' CHECK (confidence IN ('alta','media','bassa')),
    fonte_id INTEGER REFERENCES fonti(id),
    PRIMARY KEY (partita_id, squadra_id, metrica)
);
```
