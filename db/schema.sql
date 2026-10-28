CREATE TABLE fonti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT UNIQUE NOT NULL,
    url TEXT,
    tipo TEXT,        -- 'ufficiale', 'database', 'testata', 'wiki'
    affidabilita TEXT -- 'alta', 'media', 'bassa'
)
;
CREATE TABLE sqlite_sequence(name,seq)
;
CREATE TABLE competizioni (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT UNIQUE NOT NULL,
    ambito TEXT,   -- 'nazionale', 'internazionale'
    livello TEXT   -- 'prima', 'seconda', 'coppa'
)
;
CREATE TABLE squadre (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT UNIQUE NOT NULL,
    nome_completo TEXT,
    citta TEXT,
    stadio_principale TEXT
, confidence TEXT NOT NULL DEFAULT 'media' CHECK (confidence IN ('alta','media','bassa')), verificato INTEGER NOT NULL DEFAULT 0 CHECK (verificato IN (0,1)), verificato_da TEXT, verificato_il TEXT, fonte_id INTEGER REFERENCES fonti(id), fuso_in_id INTEGER REFERENCES squadre(id))
;
CREATE TABLE stagioni (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT UNIQUE NOT NULL,  -- es. '1986-87'
    anno_inizio INTEGER,
    anno_fine INTEGER
)
;
CREATE TABLE persone (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_completo TEXT UNIQUE NOT NULL,
    cognome TEXT,
    nome TEXT,
    data_nascita TEXT,
    luogo_nascita TEXT,
    nazionalita TEXT,
    ruolo_principale TEXT  -- 'portiere', 'difensore', 'centrocampista', 'attaccante', 'allenatore'
, confidence TEXT NOT NULL DEFAULT 'media' CHECK (confidence IN ('alta','media','bassa')), verifica TEXT NOT NULL DEFAULT 'da_verificare' CHECK (verifica IN ('da_verificare','verificato')), verificato INTEGER NOT NULL DEFAULT 0 CHECK (verificato IN (0,1)), verificato_da TEXT, verificato_il TEXT, fonte_id INTEGER REFERENCES fonti(id), fuso_in_id INTEGER REFERENCES persone(id))
;
CREATE TABLE partite (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id TEXT UNIQUE,       -- es. '20250523-NAP-CAG'
    slug TEXT UNIQUE,           -- es. 'fiorentina-napoli-2026-09-20'
    data TEXT NOT NULL,
    stagione_id INTEGER REFERENCES stagioni(id),
    competizione_id INTEGER REFERENCES competizioni(id),
    giornata TEXT,
    squadra_casa_id INTEGER REFERENCES squadre(id),
    squadra_trasferta_id INTEGER REFERENCES squadre(id),
    home_raw_name TEXT,
    away_raw_name TEXT,
    gol_casa INTEGER,
    gol_trasferta INTEGER,
    stadio TEXT,
    affluenza INTEGER,
    arbitro_id INTEGER REFERENCES persone(id),
    note TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
, pubblicata INTEGER DEFAULT 0, confidence TEXT NOT NULL DEFAULT 'media' CHECK (confidence IN ('alta','media','bassa')), verifica TEXT NOT NULL DEFAULT 'da_verificare' CHECK (verifica IN ('da_verificare','verificato')), verificato INTEGER NOT NULL DEFAULT 0 CHECK (verificato IN (0,1)), verificato_da TEXT, verificato_il TEXT, fonte_id INTEGER REFERENCES fonti(id), latitudine REAL, longitudine REAL, id_stadio_avversario INTEGER REFERENCES stadi_avversari(id))
;
CREATE TABLE marcatori (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    partita_id INTEGER NOT NULL REFERENCES partite(id),
    persona_id INTEGER REFERENCES persone(id),
    squadra_id INTEGER REFERENCES squadre(id),
    minuto TEXT,
    tipo TEXT,   -- 'gol', 'autogol', 'rigore'
    note TEXT
, confidence TEXT NOT NULL DEFAULT 'media' CHECK (confidence IN ('alta','media','bassa')), verifica TEXT NOT NULL DEFAULT 'da_verificare' CHECK (verifica IN ('da_verificare','verificato')), verificato INTEGER NOT NULL DEFAULT 0 CHECK (verificato IN (0,1)), verificato_da TEXT, verificato_il TEXT, fonte_id INTEGER REFERENCES fonti(id))
;
CREATE TABLE presenze_stagionali (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stagione_id INTEGER NOT NULL REFERENCES stagioni(id),
    persona_id INTEGER NOT NULL REFERENCES persone(id),
    presenze INTEGER,
    reti INTEGER,
    ruolo TEXT,
    fonte_id INTEGER REFERENCES fonti(id),
    UNIQUE(stagione_id, persona_id)
)
;
CREATE TABLE partite_fonti (
    partita_id INTEGER NOT NULL REFERENCES partite(id),
    fonte_id INTEGER NOT NULL REFERENCES fonti(id),
    PRIMARY KEY (partita_id, fonte_id)
)
;
CREATE TABLE documenti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titolo TEXT,
    testo_completo TEXT,
    fonte TEXT,
    url TEXT,
    data_raccolta TEXT,
    tipo TEXT,
    confidence TEXT,
    collector TEXT,
    note TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
)
;
CREATE TABLE foto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    percorso_file TEXT UNIQUE,
    didascalia TEXT,
    fonte TEXT,
    data_scatto TEXT,
    data_raccolta TEXT,
    documento_id INTEGER REFERENCES documenti(id),
    note TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
;
CREATE TABLE partite_documenti (
    partita_id INTEGER NOT NULL REFERENCES partite(id),
    documento_id INTEGER NOT NULL REFERENCES documenti(id),
    PRIMARY KEY (partita_id, documento_id)
)
;
CREATE TABLE partite_foto (
    partita_id INTEGER NOT NULL REFERENCES partite(id),
    foto_id INTEGER NOT NULL REFERENCES foto(id),
    PRIMARY KEY (partita_id, foto_id)
)
;
CREATE INDEX idx_partite_data ON partite(data)
;
CREATE INDEX idx_partite_stagione ON partite(stagione_id)
;
CREATE INDEX idx_marcatori_partita ON marcatori(partita_id)
;
CREATE INDEX idx_presenze_stagione ON presenze_stagionali(stagione_id)
;
CREATE INDEX idx_foto_documento ON foto(documento_id)
;
CREATE VIRTUAL TABLE documenti_fts USING fts5(
    titolo,
    testo_completo,
    content='documenti',
    content_rowid='id'
)
;
CREATE TABLE 'documenti_fts_data'(id INTEGER PRIMARY KEY, block BLOB)
;
CREATE TABLE 'documenti_fts_idx'(segid, term, pgno, PRIMARY KEY(segid, term)) WITHOUT ROWID
;
CREATE TABLE 'documenti_fts_docsize'(id INTEGER PRIMARY KEY, sz BLOB)
;
CREATE TABLE 'documenti_fts_config'(k PRIMARY KEY, v) WITHOUT ROWID
;
CREATE TRIGGER documenti_ai AFTER INSERT ON documenti BEGIN
    INSERT INTO documenti_fts(rowid, titolo, testo_completo)
    VALUES (new.id, new.titolo, new.testo_completo);
END
;
CREATE TRIGGER documenti_ad AFTER DELETE ON documenti BEGIN
    INSERT INTO documenti_fts(documenti_fts, rowid, titolo, testo_completo)
    VALUES ('delete', old.id, old.titolo, old.testo_completo);
END
;
CREATE TRIGGER documenti_au AFTER UPDATE ON documenti BEGIN
    INSERT INTO documenti_fts(documenti_fts, rowid, titolo, testo_completo)
    VALUES ('delete', old.id, old.titolo, old.testo_completo);
    INSERT INTO documenti_fts(rowid, titolo, testo_completo)
    VALUES (new.id, new.titolo, new.testo_completo);
END
;
CREATE TABLE squadre_relazioni (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_squadra_id INTEGER NOT NULL REFERENCES squadre(id),
  to_squadra_id   INTEGER NOT NULL REFERENCES squadre(id),
  rel_type TEXT NOT NULL CHECK (rel_type IN
    ('rename_new_entity','merger','legal_succession','split','revival')),
  effective_date TEXT,
  inherits_legal INTEGER NOT NULL CHECK (inherits_legal IN (0,1)),
  inherits_sporting_record INTEGER NOT NULL CHECK (inherits_sporting_record IN (0,1)),
  source TEXT NOT NULL,
  confidence TEXT NOT NULL CHECK (confidence IN ('alta','media','bassa')),
  note TEXT,
  CHECK (from_squadra_id <> to_squadra_id)
)
;
CREATE INDEX ix_sqrel_to ON squadre_relazioni(to_squadra_id)
;
CREATE INDEX ix_sqrel_from ON squadre_relazioni(from_squadra_id)
;
CREATE TABLE squadre_alias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  squadra_id INTEGER NOT NULL REFERENCES squadre(id),
  alias TEXT NOT NULL,
  alias_norm TEXT NOT NULL,
  alias_key TEXT NOT NULL,
  alias_type TEXT NOT NULL CHECK (alias_type IN
    ('official','common','historical','abbreviation','source_specific','typo')),
  valid_from TEXT,
  valid_to TEXT,
  source_scope TEXT,
  source TEXT NOT NULL,
  confidence TEXT NOT NULL CHECK (confidence IN ('alta','media','bassa')),
  UNIQUE (squadra_id, alias_norm, source_scope, valid_from)
)
;
CREATE INDEX ix_alias_norm ON squadre_alias(alias_norm)
;
CREATE INDEX ix_alias_key ON squadre_alias(alias_key)
;
CREATE TABLE squadre_id_esterni (
  squadra_id INTEGER NOT NULL REFERENCES squadre(id),
  system TEXT NOT NULL,
  ext_id TEXT NOT NULL,
  source TEXT NOT NULL,
  PRIMARY KEY (system, ext_id)
)
;
CREATE TABLE risoluzione_nomi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  partita_id INTEGER REFERENCES partite(id),
  lato TEXT CHECK (lato IN ('casa','trasferta')),
  nome_grezzo TEXT NOT NULL,
  fonte TEXT NOT NULL,
  squadra_id INTEGER REFERENCES squadre(id),
  metodo TEXT NOT NULL CHECK (metodo IN
    ('id_esterno','alias_esatto','alias_key','fuzzy_auto','manuale')),
  punteggio REAL,
  risolto_il TEXT NOT NULL DEFAULT (datetime('now'))
)
;
CREATE TABLE nomi_da_risolvere (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome_grezzo TEXT NOT NULL,
  fonte TEXT NOT NULL,
  contesto_data TEXT,
  contesto_competizione TEXT,
  contesto_riferimento TEXT,
  candidati TEXT,
  motivo TEXT NOT NULL CHECK (motivo IN
    ('nessun_candidato','candidati_multipli','punteggio_basso','conflitto_date')),
  stato TEXT NOT NULL DEFAULT 'in_attesa' CHECK (stato IN ('in_attesa','risolto','rifiutato')),
  squadra_risolta_id INTEGER REFERENCES squadre(id),
  risolto_da TEXT,
  risolto_il TEXT
)
;
CREATE INDEX ix_nomi_stato ON nomi_da_risolvere(stato)
;
CREATE TABLE schema_migrazioni (
      versione INTEGER PRIMARY KEY,
      nome TEXT NOT NULL,
      applicata_il TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    )
;
CREATE TABLE audit_ctx (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  batch_id TEXT,
  utente TEXT,
  motivo TEXT,
  fonte_id INTEGER REFERENCES fonti(id)
)
;
CREATE TABLE risorse (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  titolo TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN (
    'wikipedia',
    'articolo',
    'foto',
    'report_lega',
    'database',
    'libro',
    'video',
    'documento_ufficiale',
    'altro'
  )),
  licenza TEXT NOT NULL DEFAULT 'sconosciuta' CHECK (licenza IN (
    'CC BY-SA 4.0',
    'copyright',
    'pubblico dominio',
    'sconosciuta'
  )),
  data_consultazione TEXT NOT NULL CHECK (
    data_consultazione GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
  ),
  estratto TEXT,
  fatto_estratto TEXT,
  partita_id INTEGER REFERENCES partite(id),
  persona_id INTEGER REFERENCES persone(id),
  stagione_id INTEGER REFERENCES stagioni(id),
  fonte_id INTEGER REFERENCES fonti(id),
  stato_uso TEXT NOT NULL DEFAULT 'da_usare' CHECK (stato_uso IN (
    'da_usare',
    'usato',
    'da_verificare',
    'scartato'
  )),
  confidence TEXT NOT NULL DEFAULT 'media' CHECK (confidence IN ('alta','media','bassa')),
  verifica TEXT NOT NULL DEFAULT 'da_verificare' CHECK (verifica IN ('da_verificare','verificato')),
  note TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  url_norm TEXT GENERATED ALWAYS AS (lower(trim(url))) STORED,
  partita_key INTEGER GENERATED ALWAYS AS (COALESCE(partita_id, 0)) STORED,
  persona_key INTEGER GENERATED ALWAYS AS (COALESCE(persona_id, 0)) STORED,
  stagione_key INTEGER GENERATED ALWAYS AS (COALESCE(stagione_id, 0)) STORED,
  UNIQUE (url_norm, partita_key, persona_key, stagione_key)
)
;
CREATE INDEX ix_risorse_tipo ON risorse(tipo)
;
CREATE INDEX ix_risorse_stato ON risorse(stato_uso)
;
CREATE INDEX ix_risorse_partita ON risorse(partita_id)
;
CREATE INDEX ix_risorse_persona ON risorse(persona_id)
;
CREATE INDEX ix_risorse_stagione ON risorse(stagione_id)
;
CREATE INDEX ix_risorse_data ON risorse(data_consultazione)
;
CREATE TABLE sessione (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  attore TEXT,
  motivo TEXT,
  fonte_id INTEGER,
  batch_id TEXT
)
;
CREATE TABLE "audit_log" (
  audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  tabella TEXT NOT NULL,
  pk TEXT NOT NULL,
  azione TEXT NOT NULL CHECK (azione IN ('I','U','D')),
  campo TEXT,
  vecchio TEXT,
  nuovo TEXT,
  attore TEXT NOT NULL DEFAULT 'sconosciuto',
  motivo TEXT,
  fonte_id INTEGER,
  batch_id TEXT
)
;
CREATE INDEX ix_audit_ts ON audit_log(ts)
;
CREATE INDEX ix_audit_rec ON audit_log(tabella, pk, campo, ts)
;
CREATE INDEX ix_audit_batch ON audit_log(batch_id)
;
CREATE TABLE "copertura" (
  entita TEXT NOT NULL,
  entita_id INTEGER NOT NULL,
  sezione TEXT NOT NULL,
  stato TEXT NOT NULL CHECK (stato IN ('completo','parziale','nd','na','pending')),
  motivo TEXT,
  fonte_id INTEGER REFERENCES fonti(id),
  aggiornato_il TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (entita, entita_id, sezione)
)
;
CREATE TABLE copertura_regole (
  sezione TEXT NOT NULL,
  data_da TEXT,
  data_a TEXT,
  stato TEXT NOT NULL CHECK (stato IN ('na','nd')),
  motivo TEXT NOT NULL
)
;
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
)
;
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
)
;
CREATE TABLE partite_statistiche (
    partita_id INTEGER NOT NULL REFERENCES partite(id),
    squadra_id INTEGER NOT NULL REFERENCES squadre(id),
    metrica TEXT NOT NULL,
    valore REAL,
    confidence TEXT NOT NULL DEFAULT 'media' CHECK (confidence IN ('alta','media','bassa')),
    fonte_id INTEGER REFERENCES fonti(id),
    PRIMARY KEY (partita_id, squadra_id, metrica)
)
;
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
)
;
CREATE TRIGGER trg_partite_ai AFTER INSERT ON partite
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite',
    NEW.id,
    'I',
    NULL,
    NULL,
    json_object('id', NEW.id, 'match_id', NEW.match_id, 'slug', NEW.slug, 'data', NEW.data, 'stagione_id', NEW.stagione_id, 'competizione_id', NEW.competizione_id, 'giornata', NEW.giornata, 'squadra_casa_id', NEW.squadra_casa_id, 'squadra_trasferta_id', NEW.squadra_trasferta_id, 'home_raw_name', NEW.home_raw_name, 'away_raw_name', NEW.away_raw_name, 'gol_casa', NEW.gol_casa, 'gol_trasferta', NEW.gol_trasferta, 'stadio', NEW.stadio, 'affluenza', NEW.affluenza, 'arbitro_id', NEW.arbitro_id, 'note', NEW.note, 'pubblicata', NEW.pubblicata, 'confidence', NEW.confidence, 'verifica', NEW.verifica, 'verificato', NEW.verificato, 'verificato_da', NEW.verificato_da, 'verificato_il', NEW.verificato_il, 'fonte_id', NEW.fonte_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_ad AFTER DELETE ON partite
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite',
    OLD.id,
    'D',
    NULL,
    json_object('id', OLD.id, 'match_id', OLD.match_id, 'slug', OLD.slug, 'data', OLD.data, 'stagione_id', OLD.stagione_id, 'competizione_id', OLD.competizione_id, 'giornata', OLD.giornata, 'squadra_casa_id', OLD.squadra_casa_id, 'squadra_trasferta_id', OLD.squadra_trasferta_id, 'home_raw_name', OLD.home_raw_name, 'away_raw_name', OLD.away_raw_name, 'gol_casa', OLD.gol_casa, 'gol_trasferta', OLD.gol_trasferta, 'stadio', OLD.stadio, 'affluenza', OLD.affluenza, 'arbitro_id', OLD.arbitro_id, 'note', OLD.note, 'pubblicata', OLD.pubblicata, 'confidence', OLD.confidence, 'verifica', OLD.verifica, 'verificato', OLD.verificato, 'verificato_da', OLD.verificato_da, 'verificato_il', OLD.verificato_il, 'fonte_id', OLD.fonte_id),
    NULL,
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_u_match_id AFTER UPDATE OF match_id ON partite
WHEN OLD.match_id IS NOT NEW.match_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite',
    NEW.id,
    'U',
    'match_id',
    json_quote(OLD.match_id),
    json_quote(NEW.match_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_u_slug AFTER UPDATE OF slug ON partite
WHEN OLD.slug IS NOT NEW.slug
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite',
    NEW.id,
    'U',
    'slug',
    json_quote(OLD.slug),
    json_quote(NEW.slug),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_u_data AFTER UPDATE OF data ON partite
WHEN OLD.data IS NOT NEW.data
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite',
    NEW.id,
    'U',
    'data',
    json_quote(OLD.data),
    json_quote(NEW.data),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_u_stagione_id AFTER UPDATE OF stagione_id ON partite
WHEN OLD.stagione_id IS NOT NEW.stagione_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite',
    NEW.id,
    'U',
    'stagione_id',
    json_quote(OLD.stagione_id),
    json_quote(NEW.stagione_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_u_competizione_id AFTER UPDATE OF competizione_id ON partite
WHEN OLD.competizione_id IS NOT NEW.competizione_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite',
    NEW.id,
    'U',
    'competizione_id',
    json_quote(OLD.competizione_id),
    json_quote(NEW.competizione_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_u_giornata AFTER UPDATE OF giornata ON partite
WHEN OLD.giornata IS NOT NEW.giornata
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite',
    NEW.id,
    'U',
    'giornata',
    json_quote(OLD.giornata),
    json_quote(NEW.giornata),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_u_squadra_casa_id AFTER UPDATE OF squadra_casa_id ON partite
WHEN OLD.squadra_casa_id IS NOT NEW.squadra_casa_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite',
    NEW.id,
    'U',
    'squadra_casa_id',
    json_quote(OLD.squadra_casa_id),
    json_quote(NEW.squadra_casa_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_u_squadra_trasferta_id AFTER UPDATE OF squadra_trasferta_id ON partite
WHEN OLD.squadra_trasferta_id IS NOT NEW.squadra_trasferta_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite',
    NEW.id,
    'U',
    'squadra_trasferta_id',
    json_quote(OLD.squadra_trasferta_id),
    json_quote(NEW.squadra_trasferta_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_u_home_raw_name AFTER UPDATE OF home_raw_name ON partite
WHEN OLD.home_raw_name IS NOT NEW.home_raw_name
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite',
    NEW.id,
    'U',
    'home_raw_name',
    json_quote(OLD.home_raw_name),
    json_quote(NEW.home_raw_name),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_u_away_raw_name AFTER UPDATE OF away_raw_name ON partite
WHEN OLD.away_raw_name IS NOT NEW.away_raw_name
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite',
    NEW.id,
    'U',
    'away_raw_name',
    json_quote(OLD.away_raw_name),
    json_quote(NEW.away_raw_name),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_u_gol_casa AFTER UPDATE OF gol_casa ON partite
WHEN OLD.gol_casa IS NOT NEW.gol_casa
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite',
    NEW.id,
    'U',
    'gol_casa',
    json_quote(OLD.gol_casa),
    json_quote(NEW.gol_casa),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_u_gol_trasferta AFTER UPDATE OF gol_trasferta ON partite
WHEN OLD.gol_trasferta IS NOT NEW.gol_trasferta
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite',
    NEW.id,
    'U',
    'gol_trasferta',
    json_quote(OLD.gol_trasferta),
    json_quote(NEW.gol_trasferta),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_u_stadio AFTER UPDATE OF stadio ON partite
WHEN OLD.stadio IS NOT NEW.stadio
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite',
    NEW.id,
    'U',
    'stadio',
    json_quote(OLD.stadio),
    json_quote(NEW.stadio),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_u_affluenza AFTER UPDATE OF affluenza ON partite
WHEN OLD.affluenza IS NOT NEW.affluenza
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite',
    NEW.id,
    'U',
    'affluenza',
    json_quote(OLD.affluenza),
    json_quote(NEW.affluenza),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_u_arbitro_id AFTER UPDATE OF arbitro_id ON partite
WHEN OLD.arbitro_id IS NOT NEW.arbitro_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite',
    NEW.id,
    'U',
    'arbitro_id',
    json_quote(OLD.arbitro_id),
    json_quote(NEW.arbitro_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_u_note AFTER UPDATE OF note ON partite
WHEN OLD.note IS NOT NEW.note
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite',
    NEW.id,
    'U',
    'note',
    json_quote(OLD.note),
    json_quote(NEW.note),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_u_pubblicata AFTER UPDATE OF pubblicata ON partite
WHEN OLD.pubblicata IS NOT NEW.pubblicata
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite',
    NEW.id,
    'U',
    'pubblicata',
    json_quote(OLD.pubblicata),
    json_quote(NEW.pubblicata),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_u_confidence AFTER UPDATE OF confidence ON partite
WHEN OLD.confidence IS NOT NEW.confidence
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite',
    NEW.id,
    'U',
    'confidence',
    json_quote(OLD.confidence),
    json_quote(NEW.confidence),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_u_verifica AFTER UPDATE OF verifica ON partite
WHEN OLD.verifica IS NOT NEW.verifica
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite',
    NEW.id,
    'U',
    'verifica',
    json_quote(OLD.verifica),
    json_quote(NEW.verifica),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_u_verificato AFTER UPDATE OF verificato ON partite
WHEN OLD.verificato IS NOT NEW.verificato
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite',
    NEW.id,
    'U',
    'verificato',
    json_quote(OLD.verificato),
    json_quote(NEW.verificato),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_u_verificato_da AFTER UPDATE OF verificato_da ON partite
WHEN OLD.verificato_da IS NOT NEW.verificato_da
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite',
    NEW.id,
    'U',
    'verificato_da',
    json_quote(OLD.verificato_da),
    json_quote(NEW.verificato_da),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_u_verificato_il AFTER UPDATE OF verificato_il ON partite
WHEN OLD.verificato_il IS NOT NEW.verificato_il
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite',
    NEW.id,
    'U',
    'verificato_il',
    json_quote(OLD.verificato_il),
    json_quote(NEW.verificato_il),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_u_fonte_id AFTER UPDATE OF fonte_id ON partite
WHEN OLD.fonte_id IS NOT NEW.fonte_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite',
    NEW.id,
    'U',
    'fonte_id',
    json_quote(OLD.fonte_id),
    json_quote(NEW.fonte_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_marcatori_ai AFTER INSERT ON marcatori
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'marcatori',
    NEW.id,
    'I',
    NULL,
    NULL,
    json_object('id', NEW.id, 'partita_id', NEW.partita_id, 'persona_id', NEW.persona_id, 'squadra_id', NEW.squadra_id, 'minuto', NEW.minuto, 'tipo', NEW.tipo, 'note', NEW.note, 'confidence', NEW.confidence, 'verifica', NEW.verifica, 'verificato', NEW.verificato, 'verificato_da', NEW.verificato_da, 'verificato_il', NEW.verificato_il, 'fonte_id', NEW.fonte_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_marcatori_ad AFTER DELETE ON marcatori
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'marcatori',
    OLD.id,
    'D',
    NULL,
    json_object('id', OLD.id, 'partita_id', OLD.partita_id, 'persona_id', OLD.persona_id, 'squadra_id', OLD.squadra_id, 'minuto', OLD.minuto, 'tipo', OLD.tipo, 'note', OLD.note, 'confidence', OLD.confidence, 'verifica', OLD.verifica, 'verificato', OLD.verificato, 'verificato_da', OLD.verificato_da, 'verificato_il', OLD.verificato_il, 'fonte_id', OLD.fonte_id),
    NULL,
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_marcatori_u_partita_id AFTER UPDATE OF partita_id ON marcatori
WHEN OLD.partita_id IS NOT NEW.partita_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'marcatori',
    NEW.id,
    'U',
    'partita_id',
    json_quote(OLD.partita_id),
    json_quote(NEW.partita_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_marcatori_u_persona_id AFTER UPDATE OF persona_id ON marcatori
WHEN OLD.persona_id IS NOT NEW.persona_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'marcatori',
    NEW.id,
    'U',
    'persona_id',
    json_quote(OLD.persona_id),
    json_quote(NEW.persona_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_marcatori_u_squadra_id AFTER UPDATE OF squadra_id ON marcatori
WHEN OLD.squadra_id IS NOT NEW.squadra_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'marcatori',
    NEW.id,
    'U',
    'squadra_id',
    json_quote(OLD.squadra_id),
    json_quote(NEW.squadra_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_marcatori_u_minuto AFTER UPDATE OF minuto ON marcatori
WHEN OLD.minuto IS NOT NEW.minuto
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'marcatori',
    NEW.id,
    'U',
    'minuto',
    json_quote(OLD.minuto),
    json_quote(NEW.minuto),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_marcatori_u_tipo AFTER UPDATE OF tipo ON marcatori
WHEN OLD.tipo IS NOT NEW.tipo
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'marcatori',
    NEW.id,
    'U',
    'tipo',
    json_quote(OLD.tipo),
    json_quote(NEW.tipo),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_marcatori_u_note AFTER UPDATE OF note ON marcatori
WHEN OLD.note IS NOT NEW.note
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'marcatori',
    NEW.id,
    'U',
    'note',
    json_quote(OLD.note),
    json_quote(NEW.note),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_marcatori_u_confidence AFTER UPDATE OF confidence ON marcatori
WHEN OLD.confidence IS NOT NEW.confidence
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'marcatori',
    NEW.id,
    'U',
    'confidence',
    json_quote(OLD.confidence),
    json_quote(NEW.confidence),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_marcatori_u_verifica AFTER UPDATE OF verifica ON marcatori
WHEN OLD.verifica IS NOT NEW.verifica
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'marcatori',
    NEW.id,
    'U',
    'verifica',
    json_quote(OLD.verifica),
    json_quote(NEW.verifica),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_marcatori_u_verificato AFTER UPDATE OF verificato ON marcatori
WHEN OLD.verificato IS NOT NEW.verificato
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'marcatori',
    NEW.id,
    'U',
    'verificato',
    json_quote(OLD.verificato),
    json_quote(NEW.verificato),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_marcatori_u_verificato_da AFTER UPDATE OF verificato_da ON marcatori
WHEN OLD.verificato_da IS NOT NEW.verificato_da
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'marcatori',
    NEW.id,
    'U',
    'verificato_da',
    json_quote(OLD.verificato_da),
    json_quote(NEW.verificato_da),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_marcatori_u_verificato_il AFTER UPDATE OF verificato_il ON marcatori
WHEN OLD.verificato_il IS NOT NEW.verificato_il
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'marcatori',
    NEW.id,
    'U',
    'verificato_il',
    json_quote(OLD.verificato_il),
    json_quote(NEW.verificato_il),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_marcatori_u_fonte_id AFTER UPDATE OF fonte_id ON marcatori
WHEN OLD.fonte_id IS NOT NEW.fonte_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'marcatori',
    NEW.id,
    'U',
    'fonte_id',
    json_quote(OLD.fonte_id),
    json_quote(NEW.fonte_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_persone_ai AFTER INSERT ON persone
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'persone',
    NEW.id,
    'I',
    NULL,
    NULL,
    json_object('id', NEW.id, 'nome_completo', NEW.nome_completo, 'cognome', NEW.cognome, 'nome', NEW.nome, 'data_nascita', NEW.data_nascita, 'luogo_nascita', NEW.luogo_nascita, 'nazionalita', NEW.nazionalita, 'ruolo_principale', NEW.ruolo_principale, 'confidence', NEW.confidence, 'verifica', NEW.verifica, 'verificato', NEW.verificato, 'verificato_da', NEW.verificato_da, 'verificato_il', NEW.verificato_il, 'fonte_id', NEW.fonte_id, 'fuso_in_id', NEW.fuso_in_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_persone_ad AFTER DELETE ON persone
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'persone',
    OLD.id,
    'D',
    NULL,
    json_object('id', OLD.id, 'nome_completo', OLD.nome_completo, 'cognome', OLD.cognome, 'nome', OLD.nome, 'data_nascita', OLD.data_nascita, 'luogo_nascita', OLD.luogo_nascita, 'nazionalita', OLD.nazionalita, 'ruolo_principale', OLD.ruolo_principale, 'confidence', OLD.confidence, 'verifica', OLD.verifica, 'verificato', OLD.verificato, 'verificato_da', OLD.verificato_da, 'verificato_il', OLD.verificato_il, 'fonte_id', OLD.fonte_id, 'fuso_in_id', OLD.fuso_in_id),
    NULL,
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_persone_u_nome_completo AFTER UPDATE OF nome_completo ON persone
WHEN OLD.nome_completo IS NOT NEW.nome_completo
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'persone',
    NEW.id,
    'U',
    'nome_completo',
    json_quote(OLD.nome_completo),
    json_quote(NEW.nome_completo),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_persone_u_cognome AFTER UPDATE OF cognome ON persone
WHEN OLD.cognome IS NOT NEW.cognome
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'persone',
    NEW.id,
    'U',
    'cognome',
    json_quote(OLD.cognome),
    json_quote(NEW.cognome),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_persone_u_nome AFTER UPDATE OF nome ON persone
WHEN OLD.nome IS NOT NEW.nome
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'persone',
    NEW.id,
    'U',
    'nome',
    json_quote(OLD.nome),
    json_quote(NEW.nome),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_persone_u_data_nascita AFTER UPDATE OF data_nascita ON persone
WHEN OLD.data_nascita IS NOT NEW.data_nascita
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'persone',
    NEW.id,
    'U',
    'data_nascita',
    json_quote(OLD.data_nascita),
    json_quote(NEW.data_nascita),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_persone_u_luogo_nascita AFTER UPDATE OF luogo_nascita ON persone
WHEN OLD.luogo_nascita IS NOT NEW.luogo_nascita
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'persone',
    NEW.id,
    'U',
    'luogo_nascita',
    json_quote(OLD.luogo_nascita),
    json_quote(NEW.luogo_nascita),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_persone_u_nazionalita AFTER UPDATE OF nazionalita ON persone
WHEN OLD.nazionalita IS NOT NEW.nazionalita
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'persone',
    NEW.id,
    'U',
    'nazionalita',
    json_quote(OLD.nazionalita),
    json_quote(NEW.nazionalita),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_persone_u_ruolo_principale AFTER UPDATE OF ruolo_principale ON persone
WHEN OLD.ruolo_principale IS NOT NEW.ruolo_principale
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'persone',
    NEW.id,
    'U',
    'ruolo_principale',
    json_quote(OLD.ruolo_principale),
    json_quote(NEW.ruolo_principale),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_persone_u_confidence AFTER UPDATE OF confidence ON persone
WHEN OLD.confidence IS NOT NEW.confidence
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'persone',
    NEW.id,
    'U',
    'confidence',
    json_quote(OLD.confidence),
    json_quote(NEW.confidence),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_persone_u_verifica AFTER UPDATE OF verifica ON persone
WHEN OLD.verifica IS NOT NEW.verifica
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'persone',
    NEW.id,
    'U',
    'verifica',
    json_quote(OLD.verifica),
    json_quote(NEW.verifica),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_persone_u_verificato AFTER UPDATE OF verificato ON persone
WHEN OLD.verificato IS NOT NEW.verificato
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'persone',
    NEW.id,
    'U',
    'verificato',
    json_quote(OLD.verificato),
    json_quote(NEW.verificato),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_persone_u_verificato_da AFTER UPDATE OF verificato_da ON persone
WHEN OLD.verificato_da IS NOT NEW.verificato_da
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'persone',
    NEW.id,
    'U',
    'verificato_da',
    json_quote(OLD.verificato_da),
    json_quote(NEW.verificato_da),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_persone_u_verificato_il AFTER UPDATE OF verificato_il ON persone
WHEN OLD.verificato_il IS NOT NEW.verificato_il
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'persone',
    NEW.id,
    'U',
    'verificato_il',
    json_quote(OLD.verificato_il),
    json_quote(NEW.verificato_il),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_persone_u_fonte_id AFTER UPDATE OF fonte_id ON persone
WHEN OLD.fonte_id IS NOT NEW.fonte_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'persone',
    NEW.id,
    'U',
    'fonte_id',
    json_quote(OLD.fonte_id),
    json_quote(NEW.fonte_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_persone_u_fuso_in_id AFTER UPDATE OF fuso_in_id ON persone
WHEN OLD.fuso_in_id IS NOT NEW.fuso_in_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'persone',
    NEW.id,
    'U',
    'fuso_in_id',
    json_quote(OLD.fuso_in_id),
    json_quote(NEW.fuso_in_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_ai AFTER INSERT ON squadre
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre',
    NEW.id,
    'I',
    NULL,
    NULL,
    json_object('id', NEW.id, 'nome', NEW.nome, 'nome_completo', NEW.nome_completo, 'citta', NEW.citta, 'stadio_principale', NEW.stadio_principale, 'confidence', NEW.confidence, 'verificato', NEW.verificato, 'verificato_da', NEW.verificato_da, 'verificato_il', NEW.verificato_il, 'fonte_id', NEW.fonte_id, 'fuso_in_id', NEW.fuso_in_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_ad AFTER DELETE ON squadre
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre',
    OLD.id,
    'D',
    NULL,
    json_object('id', OLD.id, 'nome', OLD.nome, 'nome_completo', OLD.nome_completo, 'citta', OLD.citta, 'stadio_principale', OLD.stadio_principale, 'confidence', OLD.confidence, 'verificato', OLD.verificato, 'verificato_da', OLD.verificato_da, 'verificato_il', OLD.verificato_il, 'fonte_id', OLD.fonte_id, 'fuso_in_id', OLD.fuso_in_id),
    NULL,
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_u_nome AFTER UPDATE OF nome ON squadre
WHEN OLD.nome IS NOT NEW.nome
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre',
    NEW.id,
    'U',
    'nome',
    json_quote(OLD.nome),
    json_quote(NEW.nome),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_u_nome_completo AFTER UPDATE OF nome_completo ON squadre
WHEN OLD.nome_completo IS NOT NEW.nome_completo
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre',
    NEW.id,
    'U',
    'nome_completo',
    json_quote(OLD.nome_completo),
    json_quote(NEW.nome_completo),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_u_citta AFTER UPDATE OF citta ON squadre
WHEN OLD.citta IS NOT NEW.citta
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre',
    NEW.id,
    'U',
    'citta',
    json_quote(OLD.citta),
    json_quote(NEW.citta),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_u_stadio_principale AFTER UPDATE OF stadio_principale ON squadre
WHEN OLD.stadio_principale IS NOT NEW.stadio_principale
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre',
    NEW.id,
    'U',
    'stadio_principale',
    json_quote(OLD.stadio_principale),
    json_quote(NEW.stadio_principale),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_u_confidence AFTER UPDATE OF confidence ON squadre
WHEN OLD.confidence IS NOT NEW.confidence
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre',
    NEW.id,
    'U',
    'confidence',
    json_quote(OLD.confidence),
    json_quote(NEW.confidence),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_u_verificato AFTER UPDATE OF verificato ON squadre
WHEN OLD.verificato IS NOT NEW.verificato
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre',
    NEW.id,
    'U',
    'verificato',
    json_quote(OLD.verificato),
    json_quote(NEW.verificato),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_u_verificato_da AFTER UPDATE OF verificato_da ON squadre
WHEN OLD.verificato_da IS NOT NEW.verificato_da
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre',
    NEW.id,
    'U',
    'verificato_da',
    json_quote(OLD.verificato_da),
    json_quote(NEW.verificato_da),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_u_verificato_il AFTER UPDATE OF verificato_il ON squadre
WHEN OLD.verificato_il IS NOT NEW.verificato_il
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre',
    NEW.id,
    'U',
    'verificato_il',
    json_quote(OLD.verificato_il),
    json_quote(NEW.verificato_il),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_u_fonte_id AFTER UPDATE OF fonte_id ON squadre
WHEN OLD.fonte_id IS NOT NEW.fonte_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre',
    NEW.id,
    'U',
    'fonte_id',
    json_quote(OLD.fonte_id),
    json_quote(NEW.fonte_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_u_fuso_in_id AFTER UPDATE OF fuso_in_id ON squadre
WHEN OLD.fuso_in_id IS NOT NEW.fuso_in_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre',
    NEW.id,
    'U',
    'fuso_in_id',
    json_quote(OLD.fuso_in_id),
    json_quote(NEW.fuso_in_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_relazioni_ai AFTER INSERT ON squadre_relazioni
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre_relazioni',
    NEW.id,
    'I',
    NULL,
    NULL,
    json_object('id', NEW.id, 'from_squadra_id', NEW.from_squadra_id, 'to_squadra_id', NEW.to_squadra_id, 'rel_type', NEW.rel_type, 'effective_date', NEW.effective_date, 'inherits_legal', NEW.inherits_legal, 'inherits_sporting_record', NEW.inherits_sporting_record, 'source', NEW.source, 'confidence', NEW.confidence, 'note', NEW.note),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_relazioni_ad AFTER DELETE ON squadre_relazioni
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre_relazioni',
    OLD.id,
    'D',
    NULL,
    json_object('id', OLD.id, 'from_squadra_id', OLD.from_squadra_id, 'to_squadra_id', OLD.to_squadra_id, 'rel_type', OLD.rel_type, 'effective_date', OLD.effective_date, 'inherits_legal', OLD.inherits_legal, 'inherits_sporting_record', OLD.inherits_sporting_record, 'source', OLD.source, 'confidence', OLD.confidence, 'note', OLD.note),
    NULL,
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_relazioni_u_from_squadra_id AFTER UPDATE OF from_squadra_id ON squadre_relazioni
WHEN OLD.from_squadra_id IS NOT NEW.from_squadra_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre_relazioni',
    NEW.id,
    'U',
    'from_squadra_id',
    json_quote(OLD.from_squadra_id),
    json_quote(NEW.from_squadra_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_relazioni_u_to_squadra_id AFTER UPDATE OF to_squadra_id ON squadre_relazioni
WHEN OLD.to_squadra_id IS NOT NEW.to_squadra_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre_relazioni',
    NEW.id,
    'U',
    'to_squadra_id',
    json_quote(OLD.to_squadra_id),
    json_quote(NEW.to_squadra_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_relazioni_u_rel_type AFTER UPDATE OF rel_type ON squadre_relazioni
WHEN OLD.rel_type IS NOT NEW.rel_type
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre_relazioni',
    NEW.id,
    'U',
    'rel_type',
    json_quote(OLD.rel_type),
    json_quote(NEW.rel_type),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_relazioni_u_effective_date AFTER UPDATE OF effective_date ON squadre_relazioni
WHEN OLD.effective_date IS NOT NEW.effective_date
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre_relazioni',
    NEW.id,
    'U',
    'effective_date',
    json_quote(OLD.effective_date),
    json_quote(NEW.effective_date),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_relazioni_u_inherits_legal AFTER UPDATE OF inherits_legal ON squadre_relazioni
WHEN OLD.inherits_legal IS NOT NEW.inherits_legal
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre_relazioni',
    NEW.id,
    'U',
    'inherits_legal',
    json_quote(OLD.inherits_legal),
    json_quote(NEW.inherits_legal),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_relazioni_u_inherits_sporting_record AFTER UPDATE OF inherits_sporting_record ON squadre_relazioni
WHEN OLD.inherits_sporting_record IS NOT NEW.inherits_sporting_record
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre_relazioni',
    NEW.id,
    'U',
    'inherits_sporting_record',
    json_quote(OLD.inherits_sporting_record),
    json_quote(NEW.inherits_sporting_record),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_relazioni_u_source AFTER UPDATE OF source ON squadre_relazioni
WHEN OLD.source IS NOT NEW.source
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre_relazioni',
    NEW.id,
    'U',
    'source',
    json_quote(OLD.source),
    json_quote(NEW.source),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_relazioni_u_confidence AFTER UPDATE OF confidence ON squadre_relazioni
WHEN OLD.confidence IS NOT NEW.confidence
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre_relazioni',
    NEW.id,
    'U',
    'confidence',
    json_quote(OLD.confidence),
    json_quote(NEW.confidence),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_relazioni_u_note AFTER UPDATE OF note ON squadre_relazioni
WHEN OLD.note IS NOT NEW.note
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre_relazioni',
    NEW.id,
    'U',
    'note',
    json_quote(OLD.note),
    json_quote(NEW.note),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_alias_ai AFTER INSERT ON squadre_alias
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre_alias',
    NEW.id,
    'I',
    NULL,
    NULL,
    json_object('id', NEW.id, 'squadra_id', NEW.squadra_id, 'alias', NEW.alias, 'alias_norm', NEW.alias_norm, 'alias_key', NEW.alias_key, 'alias_type', NEW.alias_type, 'valid_from', NEW.valid_from, 'valid_to', NEW.valid_to, 'source_scope', NEW.source_scope, 'source', NEW.source, 'confidence', NEW.confidence),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_alias_ad AFTER DELETE ON squadre_alias
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre_alias',
    OLD.id,
    'D',
    NULL,
    json_object('id', OLD.id, 'squadra_id', OLD.squadra_id, 'alias', OLD.alias, 'alias_norm', OLD.alias_norm, 'alias_key', OLD.alias_key, 'alias_type', OLD.alias_type, 'valid_from', OLD.valid_from, 'valid_to', OLD.valid_to, 'source_scope', OLD.source_scope, 'source', OLD.source, 'confidence', OLD.confidence),
    NULL,
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_alias_u_squadra_id AFTER UPDATE OF squadra_id ON squadre_alias
WHEN OLD.squadra_id IS NOT NEW.squadra_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre_alias',
    NEW.id,
    'U',
    'squadra_id',
    json_quote(OLD.squadra_id),
    json_quote(NEW.squadra_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_alias_u_alias AFTER UPDATE OF alias ON squadre_alias
WHEN OLD.alias IS NOT NEW.alias
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre_alias',
    NEW.id,
    'U',
    'alias',
    json_quote(OLD.alias),
    json_quote(NEW.alias),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_alias_u_alias_norm AFTER UPDATE OF alias_norm ON squadre_alias
WHEN OLD.alias_norm IS NOT NEW.alias_norm
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre_alias',
    NEW.id,
    'U',
    'alias_norm',
    json_quote(OLD.alias_norm),
    json_quote(NEW.alias_norm),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_alias_u_alias_key AFTER UPDATE OF alias_key ON squadre_alias
WHEN OLD.alias_key IS NOT NEW.alias_key
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre_alias',
    NEW.id,
    'U',
    'alias_key',
    json_quote(OLD.alias_key),
    json_quote(NEW.alias_key),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_alias_u_alias_type AFTER UPDATE OF alias_type ON squadre_alias
WHEN OLD.alias_type IS NOT NEW.alias_type
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre_alias',
    NEW.id,
    'U',
    'alias_type',
    json_quote(OLD.alias_type),
    json_quote(NEW.alias_type),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_alias_u_valid_from AFTER UPDATE OF valid_from ON squadre_alias
WHEN OLD.valid_from IS NOT NEW.valid_from
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre_alias',
    NEW.id,
    'U',
    'valid_from',
    json_quote(OLD.valid_from),
    json_quote(NEW.valid_from),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_alias_u_valid_to AFTER UPDATE OF valid_to ON squadre_alias
WHEN OLD.valid_to IS NOT NEW.valid_to
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre_alias',
    NEW.id,
    'U',
    'valid_to',
    json_quote(OLD.valid_to),
    json_quote(NEW.valid_to),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_alias_u_source_scope AFTER UPDATE OF source_scope ON squadre_alias
WHEN OLD.source_scope IS NOT NEW.source_scope
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre_alias',
    NEW.id,
    'U',
    'source_scope',
    json_quote(OLD.source_scope),
    json_quote(NEW.source_scope),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_alias_u_source AFTER UPDATE OF source ON squadre_alias
WHEN OLD.source IS NOT NEW.source
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre_alias',
    NEW.id,
    'U',
    'source',
    json_quote(OLD.source),
    json_quote(NEW.source),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_squadre_alias_u_confidence AFTER UPDATE OF confidence ON squadre_alias
WHEN OLD.confidence IS NOT NEW.confidence
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'squadre_alias',
    NEW.id,
    'U',
    'confidence',
    json_quote(OLD.confidence),
    json_quote(NEW.confidence),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_formazioni_ai AFTER INSERT ON partite_formazioni
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_formazioni',
    NEW.id,
    'I',
    NULL,
    NULL,
    json_object('id', NEW.id, 'partita_id', NEW.partita_id, 'squadra_id', NEW.squadra_id, 'persona_id', NEW.persona_id, 'numero_maglia', NEW.numero_maglia, 'ruolo', NEW.ruolo, 'titolare', NEW.titolare, 'capitano', NEW.capitano, 'minuto_in', NEW.minuto_in, 'minuto_out', NEW.minuto_out, 'confidence', NEW.confidence, 'verificato', NEW.verificato, 'fonte_id', NEW.fonte_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_formazioni_ad AFTER DELETE ON partite_formazioni
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_formazioni',
    OLD.id,
    'D',
    NULL,
    json_object('id', OLD.id, 'partita_id', OLD.partita_id, 'squadra_id', OLD.squadra_id, 'persona_id', OLD.persona_id, 'numero_maglia', OLD.numero_maglia, 'ruolo', OLD.ruolo, 'titolare', OLD.titolare, 'capitano', OLD.capitano, 'minuto_in', OLD.minuto_in, 'minuto_out', OLD.minuto_out, 'confidence', OLD.confidence, 'verificato', OLD.verificato, 'fonte_id', OLD.fonte_id),
    NULL,
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_formazioni_u_partita_id AFTER UPDATE OF partita_id ON partite_formazioni
WHEN OLD.partita_id IS NOT NEW.partita_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_formazioni',
    NEW.id,
    'U',
    'partita_id',
    json_quote(OLD.partita_id),
    json_quote(NEW.partita_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_formazioni_u_squadra_id AFTER UPDATE OF squadra_id ON partite_formazioni
WHEN OLD.squadra_id IS NOT NEW.squadra_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_formazioni',
    NEW.id,
    'U',
    'squadra_id',
    json_quote(OLD.squadra_id),
    json_quote(NEW.squadra_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_formazioni_u_persona_id AFTER UPDATE OF persona_id ON partite_formazioni
WHEN OLD.persona_id IS NOT NEW.persona_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_formazioni',
    NEW.id,
    'U',
    'persona_id',
    json_quote(OLD.persona_id),
    json_quote(NEW.persona_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_formazioni_u_numero_maglia AFTER UPDATE OF numero_maglia ON partite_formazioni
WHEN OLD.numero_maglia IS NOT NEW.numero_maglia
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_formazioni',
    NEW.id,
    'U',
    'numero_maglia',
    json_quote(OLD.numero_maglia),
    json_quote(NEW.numero_maglia),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_formazioni_u_ruolo AFTER UPDATE OF ruolo ON partite_formazioni
WHEN OLD.ruolo IS NOT NEW.ruolo
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_formazioni',
    NEW.id,
    'U',
    'ruolo',
    json_quote(OLD.ruolo),
    json_quote(NEW.ruolo),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_formazioni_u_titolare AFTER UPDATE OF titolare ON partite_formazioni
WHEN OLD.titolare IS NOT NEW.titolare
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_formazioni',
    NEW.id,
    'U',
    'titolare',
    json_quote(OLD.titolare),
    json_quote(NEW.titolare),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_formazioni_u_capitano AFTER UPDATE OF capitano ON partite_formazioni
WHEN OLD.capitano IS NOT NEW.capitano
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_formazioni',
    NEW.id,
    'U',
    'capitano',
    json_quote(OLD.capitano),
    json_quote(NEW.capitano),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_formazioni_u_minuto_in AFTER UPDATE OF minuto_in ON partite_formazioni
WHEN OLD.minuto_in IS NOT NEW.minuto_in
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_formazioni',
    NEW.id,
    'U',
    'minuto_in',
    json_quote(OLD.minuto_in),
    json_quote(NEW.minuto_in),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_formazioni_u_minuto_out AFTER UPDATE OF minuto_out ON partite_formazioni
WHEN OLD.minuto_out IS NOT NEW.minuto_out
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_formazioni',
    NEW.id,
    'U',
    'minuto_out',
    json_quote(OLD.minuto_out),
    json_quote(NEW.minuto_out),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_formazioni_u_confidence AFTER UPDATE OF confidence ON partite_formazioni
WHEN OLD.confidence IS NOT NEW.confidence
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_formazioni',
    NEW.id,
    'U',
    'confidence',
    json_quote(OLD.confidence),
    json_quote(NEW.confidence),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_formazioni_u_verificato AFTER UPDATE OF verificato ON partite_formazioni
WHEN OLD.verificato IS NOT NEW.verificato
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_formazioni',
    NEW.id,
    'U',
    'verificato',
    json_quote(OLD.verificato),
    json_quote(NEW.verificato),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_formazioni_u_fonte_id AFTER UPDATE OF fonte_id ON partite_formazioni
WHEN OLD.fonte_id IS NOT NEW.fonte_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_formazioni',
    NEW.id,
    'U',
    'fonte_id',
    json_quote(OLD.fonte_id),
    json_quote(NEW.fonte_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_eventi_ai AFTER INSERT ON partite_eventi
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_eventi',
    NEW.id,
    'I',
    NULL,
    NULL,
    json_object('id', NEW.id, 'partita_id', NEW.partita_id, 'minuto', NEW.minuto, 'recupero', NEW.recupero, 'tipo', NEW.tipo, 'squadra_id', NEW.squadra_id, 'persona_id', NEW.persona_id, 'persona2_id', NEW.persona2_id, 'nota', NEW.nota, 'confidence', NEW.confidence, 'verificato', NEW.verificato, 'fonte_id', NEW.fonte_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_eventi_ad AFTER DELETE ON partite_eventi
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_eventi',
    OLD.id,
    'D',
    NULL,
    json_object('id', OLD.id, 'partita_id', OLD.partita_id, 'minuto', OLD.minuto, 'recupero', OLD.recupero, 'tipo', OLD.tipo, 'squadra_id', OLD.squadra_id, 'persona_id', OLD.persona_id, 'persona2_id', OLD.persona2_id, 'nota', OLD.nota, 'confidence', OLD.confidence, 'verificato', OLD.verificato, 'fonte_id', OLD.fonte_id),
    NULL,
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_eventi_u_partita_id AFTER UPDATE OF partita_id ON partite_eventi
WHEN OLD.partita_id IS NOT NEW.partita_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_eventi',
    NEW.id,
    'U',
    'partita_id',
    json_quote(OLD.partita_id),
    json_quote(NEW.partita_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_eventi_u_minuto AFTER UPDATE OF minuto ON partite_eventi
WHEN OLD.minuto IS NOT NEW.minuto
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_eventi',
    NEW.id,
    'U',
    'minuto',
    json_quote(OLD.minuto),
    json_quote(NEW.minuto),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_eventi_u_recupero AFTER UPDATE OF recupero ON partite_eventi
WHEN OLD.recupero IS NOT NEW.recupero
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_eventi',
    NEW.id,
    'U',
    'recupero',
    json_quote(OLD.recupero),
    json_quote(NEW.recupero),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_eventi_u_tipo AFTER UPDATE OF tipo ON partite_eventi
WHEN OLD.tipo IS NOT NEW.tipo
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_eventi',
    NEW.id,
    'U',
    'tipo',
    json_quote(OLD.tipo),
    json_quote(NEW.tipo),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_eventi_u_squadra_id AFTER UPDATE OF squadra_id ON partite_eventi
WHEN OLD.squadra_id IS NOT NEW.squadra_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_eventi',
    NEW.id,
    'U',
    'squadra_id',
    json_quote(OLD.squadra_id),
    json_quote(NEW.squadra_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_eventi_u_persona_id AFTER UPDATE OF persona_id ON partite_eventi
WHEN OLD.persona_id IS NOT NEW.persona_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_eventi',
    NEW.id,
    'U',
    'persona_id',
    json_quote(OLD.persona_id),
    json_quote(NEW.persona_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_eventi_u_persona2_id AFTER UPDATE OF persona2_id ON partite_eventi
WHEN OLD.persona2_id IS NOT NEW.persona2_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_eventi',
    NEW.id,
    'U',
    'persona2_id',
    json_quote(OLD.persona2_id),
    json_quote(NEW.persona2_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_eventi_u_nota AFTER UPDATE OF nota ON partite_eventi
WHEN OLD.nota IS NOT NEW.nota
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_eventi',
    NEW.id,
    'U',
    'nota',
    json_quote(OLD.nota),
    json_quote(NEW.nota),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_eventi_u_confidence AFTER UPDATE OF confidence ON partite_eventi
WHEN OLD.confidence IS NOT NEW.confidence
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_eventi',
    NEW.id,
    'U',
    'confidence',
    json_quote(OLD.confidence),
    json_quote(NEW.confidence),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_eventi_u_verificato AFTER UPDATE OF verificato ON partite_eventi
WHEN OLD.verificato IS NOT NEW.verificato
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_eventi',
    NEW.id,
    'U',
    'verificato',
    json_quote(OLD.verificato),
    json_quote(NEW.verificato),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_eventi_u_fonte_id AFTER UPDATE OF fonte_id ON partite_eventi
WHEN OLD.fonte_id IS NOT NEW.fonte_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_eventi',
    NEW.id,
    'U',
    'fonte_id',
    json_quote(OLD.fonte_id),
    json_quote(NEW.fonte_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_statistiche_ai AFTER INSERT ON partite_statistiche
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_statistiche',
    CAST(NEW.partita_id AS TEXT) || '|' || CAST(NEW.squadra_id AS TEXT) || '|' || CAST(NEW.metrica AS TEXT),
    'I',
    NULL,
    NULL,
    json_object('partita_id', NEW.partita_id, 'squadra_id', NEW.squadra_id, 'metrica', NEW.metrica, 'valore', NEW.valore, 'confidence', NEW.confidence, 'fonte_id', NEW.fonte_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_statistiche_ad AFTER DELETE ON partite_statistiche
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_statistiche',
    CAST(OLD.partita_id AS TEXT) || '|' || CAST(OLD.squadra_id AS TEXT) || '|' || CAST(OLD.metrica AS TEXT),
    'D',
    NULL,
    json_object('partita_id', OLD.partita_id, 'squadra_id', OLD.squadra_id, 'metrica', OLD.metrica, 'valore', OLD.valore, 'confidence', OLD.confidence, 'fonte_id', OLD.fonte_id),
    NULL,
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_statistiche_u_valore AFTER UPDATE OF valore ON partite_statistiche
WHEN OLD.valore IS NOT NEW.valore
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_statistiche',
    CAST(NEW.partita_id AS TEXT) || '|' || CAST(NEW.squadra_id AS TEXT) || '|' || CAST(NEW.metrica AS TEXT),
    'U',
    'valore',
    json_quote(OLD.valore),
    json_quote(NEW.valore),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_statistiche_u_confidence AFTER UPDATE OF confidence ON partite_statistiche
WHEN OLD.confidence IS NOT NEW.confidence
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_statistiche',
    CAST(NEW.partita_id AS TEXT) || '|' || CAST(NEW.squadra_id AS TEXT) || '|' || CAST(NEW.metrica AS TEXT),
    'U',
    'confidence',
    json_quote(OLD.confidence),
    json_quote(NEW.confidence),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_statistiche_u_fonte_id AFTER UPDATE OF fonte_id ON partite_statistiche
WHEN OLD.fonte_id IS NOT NEW.fonte_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite_statistiche',
    CAST(NEW.partita_id AS TEXT) || '|' || CAST(NEW.squadra_id AS TEXT) || '|' || CAST(NEW.metrica AS TEXT),
    'U',
    'fonte_id',
    json_quote(OLD.fonte_id),
    json_quote(NEW.fonte_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_copertura_ai AFTER INSERT ON copertura
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'copertura',
    CAST(NEW.entita AS TEXT) || '|' || CAST(NEW.entita_id AS TEXT) || '|' || CAST(NEW.sezione AS TEXT),
    'I',
    NULL,
    NULL,
    json_object('entita', NEW.entita, 'entita_id', NEW.entita_id, 'sezione', NEW.sezione, 'stato', NEW.stato, 'motivo', NEW.motivo, 'fonte_id', NEW.fonte_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_copertura_ad AFTER DELETE ON copertura
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'copertura',
    CAST(OLD.entita AS TEXT) || '|' || CAST(OLD.entita_id AS TEXT) || '|' || CAST(OLD.sezione AS TEXT),
    'D',
    NULL,
    json_object('entita', OLD.entita, 'entita_id', OLD.entita_id, 'sezione', OLD.sezione, 'stato', OLD.stato, 'motivo', OLD.motivo, 'fonte_id', OLD.fonte_id),
    NULL,
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_copertura_u_stato AFTER UPDATE OF stato ON copertura
WHEN OLD.stato IS NOT NEW.stato
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'copertura',
    CAST(NEW.entita AS TEXT) || '|' || CAST(NEW.entita_id AS TEXT) || '|' || CAST(NEW.sezione AS TEXT),
    'U',
    'stato',
    json_quote(OLD.stato),
    json_quote(NEW.stato),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_copertura_u_motivo AFTER UPDATE OF motivo ON copertura
WHEN OLD.motivo IS NOT NEW.motivo
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'copertura',
    CAST(NEW.entita AS TEXT) || '|' || CAST(NEW.entita_id AS TEXT) || '|' || CAST(NEW.sezione AS TEXT),
    'U',
    'motivo',
    json_quote(OLD.motivo),
    json_quote(NEW.motivo),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_copertura_u_fonte_id AFTER UPDATE OF fonte_id ON copertura
WHEN OLD.fonte_id IS NOT NEW.fonte_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'copertura',
    CAST(NEW.entita AS TEXT) || '|' || CAST(NEW.entita_id AS TEXT) || '|' || CAST(NEW.sezione AS TEXT),
    'U',
    'fonte_id',
    json_quote(OLD.fonte_id),
    json_quote(NEW.fonte_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TABLE stadi_avversari (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    citta TEXT NOT NULL,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    capienza INTEGER,
    inaugurazione INTEGER,
    confidence TEXT NOT NULL DEFAULT 'alta' CHECK (confidence IN ('alta','media','bassa')),
    verificato INTEGER NOT NULL DEFAULT 1 CHECK (verificato IN (0,1)),
    fonte_id INTEGER REFERENCES fonti(id),
    UNIQUE (nome, citta)
)
;
CREATE INDEX ix_stadi_citta ON stadi_avversari(citta)
;
CREATE TABLE periodi_storici (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    anno_inizio INTEGER NOT NULL,
    anno_fine INTEGER,
    descrizione TEXT NOT NULL,
    colore_esadecimale TEXT DEFAULT '#01A0E8',
    ordine INTEGER DEFAULT 0
)
;
CREATE INDEX ix_periodi_anni ON periodi_storici(anno_inizio, anno_fine)
;
CREATE TABLE presidenti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    anno_inizio INTEGER NOT NULL,
    anno_fine INTEGER,
    foto_url TEXT,
    note TEXT,
    palmares TEXT,
    confidence TEXT NOT NULL DEFAULT 'alta' CHECK (confidence IN ('alta','media','bassa')),
    verificato INTEGER NOT NULL DEFAULT 1 CHECK (verificato IN (0,1)),
    fonte_id INTEGER REFERENCES fonti(id)
)
;
CREATE INDEX ix_presidenti_anni ON presidenti(anno_inizio, anno_fine)
;
CREATE TABLE luoghi_napoli (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('stadio','sede','centro_sportivo','ritiro','monumento','altro')),
    indirizzo TEXT,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    anno_inizio INTEGER,
    anno_fine INTEGER,
    note TEXT,
    foto_url TEXT,
    confidence TEXT NOT NULL DEFAULT 'alta' CHECK (confidence IN ('alta','media','bassa')),
    verificato INTEGER NOT NULL DEFAULT 1 CHECK (verificato IN (0,1)),
    fonte_id INTEGER REFERENCES fonti(id)
)
;
CREATE INDEX ix_luoghi_tipo ON luoghi_napoli(tipo)
;
CREATE INDEX ix_luoghi_anni ON luoghi_napoli(anno_inizio, anno_fine)
;
CREATE TABLE divise (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    anno INTEGER NOT NULL,
    stagione TEXT,
    tipo_home_away TEXT NOT NULL CHECK (tipo_home_away IN ('home','away','third','special','portiere')),
    foto_url TEXT,
    descrizione TEXT NOT NULL,
    sponsor_tecnico TEXT,
    sponsor_commerciale TEXT,
    colori TEXT,
    confidence TEXT NOT NULL DEFAULT 'alta' CHECK (confidence IN ('alta','media','bassa')),
    verificato INTEGER NOT NULL DEFAULT 1 CHECK (verificato IN (0,1)),
    fonte_id INTEGER REFERENCES fonti(id)
)
;
CREATE INDEX ix_divise_anno ON divise(anno)
;
CREATE TABLE cimeli (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    anno INTEGER,
    data_evento TEXT,
    foto_url TEXT,
    descrizione TEXT NOT NULL,
    custodia_attuale TEXT,
    categoria TEXT CHECK (categoria IN ('trofeo','maglia','pallone','documento','medaglia','altro')),
    confidence TEXT NOT NULL DEFAULT 'alta' CHECK (confidence IN ('alta','media','bassa')),
    verificato INTEGER NOT NULL DEFAULT 1 CHECK (verificato IN (0,1)),
    fonte_id INTEGER REFERENCES fonti(id)
)
;
CREATE INDEX ix_cimeli_anno ON cimeli(anno)
;
CREATE TABLE cori (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titolo TEXT NOT NULL,
    testo TEXT NOT NULL,
    audio_url TEXT,
    anno INTEGER,
    curva TEXT NOT NULL CHECK (curva IN ('Curva B','Curva A','Distinti','Generale','Storico')),
    note_origini TEXT,
    confidence TEXT NOT NULL DEFAULT 'alta' CHECK (confidence IN ('alta','media','bassa')),
    verificato INTEGER NOT NULL DEFAULT 1 CHECK (verificato IN (0,1)),
    fonte_id INTEGER REFERENCES fonti(id)
)
;
CREATE INDEX ix_cori_curva ON cori(curva)
;
CREATE TRIGGER trg_partite_u_latitudine AFTER UPDATE OF latitudine ON partite
WHEN OLD.latitudine IS NOT NEW.latitudine
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite',
    NEW.id,
    'U',
    'latitudine',
    json_quote(OLD.latitudine),
    json_quote(NEW.latitudine),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_u_longitudine AFTER UPDATE OF longitudine ON partite
WHEN OLD.longitudine IS NOT NEW.longitudine
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite',
    NEW.id,
    'U',
    'longitudine',
    json_quote(OLD.longitudine),
    json_quote(NEW.longitudine),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_partite_u_id_stadio_avversario AFTER UPDATE OF id_stadio_avversario ON partite
WHEN OLD.id_stadio_avversario IS NOT NEW.id_stadio_avversario
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'partite',
    NEW.id,
    'U',
    'id_stadio_avversario',
    json_quote(OLD.id_stadio_avversario),
    json_quote(NEW.id_stadio_avversario),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_stadi_avversari_ai AFTER INSERT ON stadi_avversari
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'stadi_avversari',
    NEW.id,
    'I',
    NULL,
    NULL,
    json_object('id', NEW.id, 'nome', NEW.nome, 'citta', NEW.citta, 'lat', NEW.lat, 'lon', NEW.lon, 'capienza', NEW.capienza, 'inaugurazione', NEW.inaugurazione, 'confidence', NEW.confidence, 'verificato', NEW.verificato, 'fonte_id', NEW.fonte_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_stadi_avversari_ad AFTER DELETE ON stadi_avversari
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'stadi_avversari',
    OLD.id,
    'D',
    NULL,
    json_object('id', OLD.id, 'nome', OLD.nome, 'citta', OLD.citta, 'lat', OLD.lat, 'lon', OLD.lon, 'capienza', OLD.capienza, 'inaugurazione', OLD.inaugurazione, 'confidence', OLD.confidence, 'verificato', OLD.verificato, 'fonte_id', OLD.fonte_id),
    NULL,
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_stadi_avversari_u_nome AFTER UPDATE OF nome ON stadi_avversari
WHEN OLD.nome IS NOT NEW.nome
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'stadi_avversari',
    NEW.id,
    'U',
    'nome',
    json_quote(OLD.nome),
    json_quote(NEW.nome),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_stadi_avversari_u_citta AFTER UPDATE OF citta ON stadi_avversari
WHEN OLD.citta IS NOT NEW.citta
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'stadi_avversari',
    NEW.id,
    'U',
    'citta',
    json_quote(OLD.citta),
    json_quote(NEW.citta),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_stadi_avversari_u_lat AFTER UPDATE OF lat ON stadi_avversari
WHEN OLD.lat IS NOT NEW.lat
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'stadi_avversari',
    NEW.id,
    'U',
    'lat',
    json_quote(OLD.lat),
    json_quote(NEW.lat),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_stadi_avversari_u_lon AFTER UPDATE OF lon ON stadi_avversari
WHEN OLD.lon IS NOT NEW.lon
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'stadi_avversari',
    NEW.id,
    'U',
    'lon',
    json_quote(OLD.lon),
    json_quote(NEW.lon),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_stadi_avversari_u_capienza AFTER UPDATE OF capienza ON stadi_avversari
WHEN OLD.capienza IS NOT NEW.capienza
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'stadi_avversari',
    NEW.id,
    'U',
    'capienza',
    json_quote(OLD.capienza),
    json_quote(NEW.capienza),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_stadi_avversari_u_inaugurazione AFTER UPDATE OF inaugurazione ON stadi_avversari
WHEN OLD.inaugurazione IS NOT NEW.inaugurazione
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'stadi_avversari',
    NEW.id,
    'U',
    'inaugurazione',
    json_quote(OLD.inaugurazione),
    json_quote(NEW.inaugurazione),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_stadi_avversari_u_confidence AFTER UPDATE OF confidence ON stadi_avversari
WHEN OLD.confidence IS NOT NEW.confidence
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'stadi_avversari',
    NEW.id,
    'U',
    'confidence',
    json_quote(OLD.confidence),
    json_quote(NEW.confidence),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_stadi_avversari_u_verificato AFTER UPDATE OF verificato ON stadi_avversari
WHEN OLD.verificato IS NOT NEW.verificato
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'stadi_avversari',
    NEW.id,
    'U',
    'verificato',
    json_quote(OLD.verificato),
    json_quote(NEW.verificato),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_stadi_avversari_u_fonte_id AFTER UPDATE OF fonte_id ON stadi_avversari
WHEN OLD.fonte_id IS NOT NEW.fonte_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'stadi_avversari',
    NEW.id,
    'U',
    'fonte_id',
    json_quote(OLD.fonte_id),
    json_quote(NEW.fonte_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_periodi_storici_ai AFTER INSERT ON periodi_storici
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'periodi_storici',
    NEW.id,
    'I',
    NULL,
    NULL,
    json_object('id', NEW.id, 'nome', NEW.nome, 'anno_inizio', NEW.anno_inizio, 'anno_fine', NEW.anno_fine, 'descrizione', NEW.descrizione, 'colore_esadecimale', NEW.colore_esadecimale, 'ordine', NEW.ordine),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_periodi_storici_ad AFTER DELETE ON periodi_storici
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'periodi_storici',
    OLD.id,
    'D',
    NULL,
    json_object('id', OLD.id, 'nome', OLD.nome, 'anno_inizio', OLD.anno_inizio, 'anno_fine', OLD.anno_fine, 'descrizione', OLD.descrizione, 'colore_esadecimale', OLD.colore_esadecimale, 'ordine', OLD.ordine),
    NULL,
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_periodi_storici_u_nome AFTER UPDATE OF nome ON periodi_storici
WHEN OLD.nome IS NOT NEW.nome
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'periodi_storici',
    NEW.id,
    'U',
    'nome',
    json_quote(OLD.nome),
    json_quote(NEW.nome),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_periodi_storici_u_anno_inizio AFTER UPDATE OF anno_inizio ON periodi_storici
WHEN OLD.anno_inizio IS NOT NEW.anno_inizio
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'periodi_storici',
    NEW.id,
    'U',
    'anno_inizio',
    json_quote(OLD.anno_inizio),
    json_quote(NEW.anno_inizio),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_periodi_storici_u_anno_fine AFTER UPDATE OF anno_fine ON periodi_storici
WHEN OLD.anno_fine IS NOT NEW.anno_fine
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'periodi_storici',
    NEW.id,
    'U',
    'anno_fine',
    json_quote(OLD.anno_fine),
    json_quote(NEW.anno_fine),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_periodi_storici_u_descrizione AFTER UPDATE OF descrizione ON periodi_storici
WHEN OLD.descrizione IS NOT NEW.descrizione
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'periodi_storici',
    NEW.id,
    'U',
    'descrizione',
    json_quote(OLD.descrizione),
    json_quote(NEW.descrizione),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_periodi_storici_u_colore_esadecimale AFTER UPDATE OF colore_esadecimale ON periodi_storici
WHEN OLD.colore_esadecimale IS NOT NEW.colore_esadecimale
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'periodi_storici',
    NEW.id,
    'U',
    'colore_esadecimale',
    json_quote(OLD.colore_esadecimale),
    json_quote(NEW.colore_esadecimale),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_periodi_storici_u_ordine AFTER UPDATE OF ordine ON periodi_storici
WHEN OLD.ordine IS NOT NEW.ordine
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'periodi_storici',
    NEW.id,
    'U',
    'ordine',
    json_quote(OLD.ordine),
    json_quote(NEW.ordine),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_presidenti_ai AFTER INSERT ON presidenti
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'presidenti',
    NEW.id,
    'I',
    NULL,
    NULL,
    json_object('id', NEW.id, 'nome', NEW.nome, 'anno_inizio', NEW.anno_inizio, 'anno_fine', NEW.anno_fine, 'foto_url', NEW.foto_url, 'note', NEW.note, 'palmares', NEW.palmares, 'confidence', NEW.confidence, 'verificato', NEW.verificato, 'fonte_id', NEW.fonte_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_presidenti_ad AFTER DELETE ON presidenti
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'presidenti',
    OLD.id,
    'D',
    NULL,
    json_object('id', OLD.id, 'nome', OLD.nome, 'anno_inizio', OLD.anno_inizio, 'anno_fine', OLD.anno_fine, 'foto_url', OLD.foto_url, 'note', OLD.note, 'palmares', OLD.palmares, 'confidence', OLD.confidence, 'verificato', OLD.verificato, 'fonte_id', OLD.fonte_id),
    NULL,
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_presidenti_u_nome AFTER UPDATE OF nome ON presidenti
WHEN OLD.nome IS NOT NEW.nome
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'presidenti',
    NEW.id,
    'U',
    'nome',
    json_quote(OLD.nome),
    json_quote(NEW.nome),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_presidenti_u_anno_inizio AFTER UPDATE OF anno_inizio ON presidenti
WHEN OLD.anno_inizio IS NOT NEW.anno_inizio
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'presidenti',
    NEW.id,
    'U',
    'anno_inizio',
    json_quote(OLD.anno_inizio),
    json_quote(NEW.anno_inizio),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_presidenti_u_anno_fine AFTER UPDATE OF anno_fine ON presidenti
WHEN OLD.anno_fine IS NOT NEW.anno_fine
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'presidenti',
    NEW.id,
    'U',
    'anno_fine',
    json_quote(OLD.anno_fine),
    json_quote(NEW.anno_fine),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_presidenti_u_foto_url AFTER UPDATE OF foto_url ON presidenti
WHEN OLD.foto_url IS NOT NEW.foto_url
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'presidenti',
    NEW.id,
    'U',
    'foto_url',
    json_quote(OLD.foto_url),
    json_quote(NEW.foto_url),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_presidenti_u_note AFTER UPDATE OF note ON presidenti
WHEN OLD.note IS NOT NEW.note
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'presidenti',
    NEW.id,
    'U',
    'note',
    json_quote(OLD.note),
    json_quote(NEW.note),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_presidenti_u_palmares AFTER UPDATE OF palmares ON presidenti
WHEN OLD.palmares IS NOT NEW.palmares
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'presidenti',
    NEW.id,
    'U',
    'palmares',
    json_quote(OLD.palmares),
    json_quote(NEW.palmares),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_presidenti_u_confidence AFTER UPDATE OF confidence ON presidenti
WHEN OLD.confidence IS NOT NEW.confidence
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'presidenti',
    NEW.id,
    'U',
    'confidence',
    json_quote(OLD.confidence),
    json_quote(NEW.confidence),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_presidenti_u_verificato AFTER UPDATE OF verificato ON presidenti
WHEN OLD.verificato IS NOT NEW.verificato
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'presidenti',
    NEW.id,
    'U',
    'verificato',
    json_quote(OLD.verificato),
    json_quote(NEW.verificato),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_presidenti_u_fonte_id AFTER UPDATE OF fonte_id ON presidenti
WHEN OLD.fonte_id IS NOT NEW.fonte_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'presidenti',
    NEW.id,
    'U',
    'fonte_id',
    json_quote(OLD.fonte_id),
    json_quote(NEW.fonte_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_luoghi_napoli_ai AFTER INSERT ON luoghi_napoli
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'luoghi_napoli',
    NEW.id,
    'I',
    NULL,
    NULL,
    json_object('id', NEW.id, 'nome', NEW.nome, 'tipo', NEW.tipo, 'indirizzo', NEW.indirizzo, 'lat', NEW.lat, 'lon', NEW.lon, 'anno_inizio', NEW.anno_inizio, 'anno_fine', NEW.anno_fine, 'note', NEW.note, 'foto_url', NEW.foto_url, 'confidence', NEW.confidence, 'verificato', NEW.verificato, 'fonte_id', NEW.fonte_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_luoghi_napoli_ad AFTER DELETE ON luoghi_napoli
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'luoghi_napoli',
    OLD.id,
    'D',
    NULL,
    json_object('id', OLD.id, 'nome', OLD.nome, 'tipo', OLD.tipo, 'indirizzo', OLD.indirizzo, 'lat', OLD.lat, 'lon', OLD.lon, 'anno_inizio', OLD.anno_inizio, 'anno_fine', OLD.anno_fine, 'note', OLD.note, 'foto_url', OLD.foto_url, 'confidence', OLD.confidence, 'verificato', OLD.verificato, 'fonte_id', OLD.fonte_id),
    NULL,
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_luoghi_napoli_u_nome AFTER UPDATE OF nome ON luoghi_napoli
WHEN OLD.nome IS NOT NEW.nome
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'luoghi_napoli',
    NEW.id,
    'U',
    'nome',
    json_quote(OLD.nome),
    json_quote(NEW.nome),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_luoghi_napoli_u_tipo AFTER UPDATE OF tipo ON luoghi_napoli
WHEN OLD.tipo IS NOT NEW.tipo
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'luoghi_napoli',
    NEW.id,
    'U',
    'tipo',
    json_quote(OLD.tipo),
    json_quote(NEW.tipo),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_luoghi_napoli_u_indirizzo AFTER UPDATE OF indirizzo ON luoghi_napoli
WHEN OLD.indirizzo IS NOT NEW.indirizzo
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'luoghi_napoli',
    NEW.id,
    'U',
    'indirizzo',
    json_quote(OLD.indirizzo),
    json_quote(NEW.indirizzo),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_luoghi_napoli_u_lat AFTER UPDATE OF lat ON luoghi_napoli
WHEN OLD.lat IS NOT NEW.lat
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'luoghi_napoli',
    NEW.id,
    'U',
    'lat',
    json_quote(OLD.lat),
    json_quote(NEW.lat),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_luoghi_napoli_u_lon AFTER UPDATE OF lon ON luoghi_napoli
WHEN OLD.lon IS NOT NEW.lon
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'luoghi_napoli',
    NEW.id,
    'U',
    'lon',
    json_quote(OLD.lon),
    json_quote(NEW.lon),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_luoghi_napoli_u_anno_inizio AFTER UPDATE OF anno_inizio ON luoghi_napoli
WHEN OLD.anno_inizio IS NOT NEW.anno_inizio
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'luoghi_napoli',
    NEW.id,
    'U',
    'anno_inizio',
    json_quote(OLD.anno_inizio),
    json_quote(NEW.anno_inizio),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_luoghi_napoli_u_anno_fine AFTER UPDATE OF anno_fine ON luoghi_napoli
WHEN OLD.anno_fine IS NOT NEW.anno_fine
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'luoghi_napoli',
    NEW.id,
    'U',
    'anno_fine',
    json_quote(OLD.anno_fine),
    json_quote(NEW.anno_fine),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_luoghi_napoli_u_note AFTER UPDATE OF note ON luoghi_napoli
WHEN OLD.note IS NOT NEW.note
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'luoghi_napoli',
    NEW.id,
    'U',
    'note',
    json_quote(OLD.note),
    json_quote(NEW.note),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_luoghi_napoli_u_foto_url AFTER UPDATE OF foto_url ON luoghi_napoli
WHEN OLD.foto_url IS NOT NEW.foto_url
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'luoghi_napoli',
    NEW.id,
    'U',
    'foto_url',
    json_quote(OLD.foto_url),
    json_quote(NEW.foto_url),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_luoghi_napoli_u_confidence AFTER UPDATE OF confidence ON luoghi_napoli
WHEN OLD.confidence IS NOT NEW.confidence
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'luoghi_napoli',
    NEW.id,
    'U',
    'confidence',
    json_quote(OLD.confidence),
    json_quote(NEW.confidence),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_luoghi_napoli_u_verificato AFTER UPDATE OF verificato ON luoghi_napoli
WHEN OLD.verificato IS NOT NEW.verificato
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'luoghi_napoli',
    NEW.id,
    'U',
    'verificato',
    json_quote(OLD.verificato),
    json_quote(NEW.verificato),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_luoghi_napoli_u_fonte_id AFTER UPDATE OF fonte_id ON luoghi_napoli
WHEN OLD.fonte_id IS NOT NEW.fonte_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'luoghi_napoli',
    NEW.id,
    'U',
    'fonte_id',
    json_quote(OLD.fonte_id),
    json_quote(NEW.fonte_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_divise_ai AFTER INSERT ON divise
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'divise',
    NEW.id,
    'I',
    NULL,
    NULL,
    json_object('id', NEW.id, 'anno', NEW.anno, 'stagione', NEW.stagione, 'tipo_home_away', NEW.tipo_home_away, 'foto_url', NEW.foto_url, 'descrizione', NEW.descrizione, 'sponsor_tecnico', NEW.sponsor_tecnico, 'sponsor_commerciale', NEW.sponsor_commerciale, 'colori', NEW.colori, 'confidence', NEW.confidence, 'verificato', NEW.verificato, 'fonte_id', NEW.fonte_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_divise_ad AFTER DELETE ON divise
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'divise',
    OLD.id,
    'D',
    NULL,
    json_object('id', OLD.id, 'anno', OLD.anno, 'stagione', OLD.stagione, 'tipo_home_away', OLD.tipo_home_away, 'foto_url', OLD.foto_url, 'descrizione', OLD.descrizione, 'sponsor_tecnico', OLD.sponsor_tecnico, 'sponsor_commerciale', OLD.sponsor_commerciale, 'colori', OLD.colori, 'confidence', OLD.confidence, 'verificato', OLD.verificato, 'fonte_id', OLD.fonte_id),
    NULL,
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_divise_u_anno AFTER UPDATE OF anno ON divise
WHEN OLD.anno IS NOT NEW.anno
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'divise',
    NEW.id,
    'U',
    'anno',
    json_quote(OLD.anno),
    json_quote(NEW.anno),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_divise_u_stagione AFTER UPDATE OF stagione ON divise
WHEN OLD.stagione IS NOT NEW.stagione
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'divise',
    NEW.id,
    'U',
    'stagione',
    json_quote(OLD.stagione),
    json_quote(NEW.stagione),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_divise_u_tipo_home_away AFTER UPDATE OF tipo_home_away ON divise
WHEN OLD.tipo_home_away IS NOT NEW.tipo_home_away
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'divise',
    NEW.id,
    'U',
    'tipo_home_away',
    json_quote(OLD.tipo_home_away),
    json_quote(NEW.tipo_home_away),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_divise_u_foto_url AFTER UPDATE OF foto_url ON divise
WHEN OLD.foto_url IS NOT NEW.foto_url
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'divise',
    NEW.id,
    'U',
    'foto_url',
    json_quote(OLD.foto_url),
    json_quote(NEW.foto_url),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_divise_u_descrizione AFTER UPDATE OF descrizione ON divise
WHEN OLD.descrizione IS NOT NEW.descrizione
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'divise',
    NEW.id,
    'U',
    'descrizione',
    json_quote(OLD.descrizione),
    json_quote(NEW.descrizione),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_divise_u_sponsor_tecnico AFTER UPDATE OF sponsor_tecnico ON divise
WHEN OLD.sponsor_tecnico IS NOT NEW.sponsor_tecnico
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'divise',
    NEW.id,
    'U',
    'sponsor_tecnico',
    json_quote(OLD.sponsor_tecnico),
    json_quote(NEW.sponsor_tecnico),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_divise_u_sponsor_commerciale AFTER UPDATE OF sponsor_commerciale ON divise
WHEN OLD.sponsor_commerciale IS NOT NEW.sponsor_commerciale
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'divise',
    NEW.id,
    'U',
    'sponsor_commerciale',
    json_quote(OLD.sponsor_commerciale),
    json_quote(NEW.sponsor_commerciale),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_divise_u_colori AFTER UPDATE OF colori ON divise
WHEN OLD.colori IS NOT NEW.colori
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'divise',
    NEW.id,
    'U',
    'colori',
    json_quote(OLD.colori),
    json_quote(NEW.colori),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_divise_u_confidence AFTER UPDATE OF confidence ON divise
WHEN OLD.confidence IS NOT NEW.confidence
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'divise',
    NEW.id,
    'U',
    'confidence',
    json_quote(OLD.confidence),
    json_quote(NEW.confidence),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_divise_u_verificato AFTER UPDATE OF verificato ON divise
WHEN OLD.verificato IS NOT NEW.verificato
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'divise',
    NEW.id,
    'U',
    'verificato',
    json_quote(OLD.verificato),
    json_quote(NEW.verificato),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_divise_u_fonte_id AFTER UPDATE OF fonte_id ON divise
WHEN OLD.fonte_id IS NOT NEW.fonte_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'divise',
    NEW.id,
    'U',
    'fonte_id',
    json_quote(OLD.fonte_id),
    json_quote(NEW.fonte_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_cimeli_ai AFTER INSERT ON cimeli
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'cimeli',
    NEW.id,
    'I',
    NULL,
    NULL,
    json_object('id', NEW.id, 'nome', NEW.nome, 'anno', NEW.anno, 'data_evento', NEW.data_evento, 'foto_url', NEW.foto_url, 'descrizione', NEW.descrizione, 'custodia_attuale', NEW.custodia_attuale, 'categoria', NEW.categoria, 'confidence', NEW.confidence, 'verificato', NEW.verificato, 'fonte_id', NEW.fonte_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_cimeli_ad AFTER DELETE ON cimeli
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'cimeli',
    OLD.id,
    'D',
    NULL,
    json_object('id', OLD.id, 'nome', OLD.nome, 'anno', OLD.anno, 'data_evento', OLD.data_evento, 'foto_url', OLD.foto_url, 'descrizione', OLD.descrizione, 'custodia_attuale', OLD.custodia_attuale, 'categoria', OLD.categoria, 'confidence', OLD.confidence, 'verificato', OLD.verificato, 'fonte_id', OLD.fonte_id),
    NULL,
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_cimeli_u_nome AFTER UPDATE OF nome ON cimeli
WHEN OLD.nome IS NOT NEW.nome
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'cimeli',
    NEW.id,
    'U',
    'nome',
    json_quote(OLD.nome),
    json_quote(NEW.nome),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_cimeli_u_anno AFTER UPDATE OF anno ON cimeli
WHEN OLD.anno IS NOT NEW.anno
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'cimeli',
    NEW.id,
    'U',
    'anno',
    json_quote(OLD.anno),
    json_quote(NEW.anno),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_cimeli_u_data_evento AFTER UPDATE OF data_evento ON cimeli
WHEN OLD.data_evento IS NOT NEW.data_evento
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'cimeli',
    NEW.id,
    'U',
    'data_evento',
    json_quote(OLD.data_evento),
    json_quote(NEW.data_evento),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_cimeli_u_foto_url AFTER UPDATE OF foto_url ON cimeli
WHEN OLD.foto_url IS NOT NEW.foto_url
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'cimeli',
    NEW.id,
    'U',
    'foto_url',
    json_quote(OLD.foto_url),
    json_quote(NEW.foto_url),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_cimeli_u_descrizione AFTER UPDATE OF descrizione ON cimeli
WHEN OLD.descrizione IS NOT NEW.descrizione
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'cimeli',
    NEW.id,
    'U',
    'descrizione',
    json_quote(OLD.descrizione),
    json_quote(NEW.descrizione),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_cimeli_u_custodia_attuale AFTER UPDATE OF custodia_attuale ON cimeli
WHEN OLD.custodia_attuale IS NOT NEW.custodia_attuale
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'cimeli',
    NEW.id,
    'U',
    'custodia_attuale',
    json_quote(OLD.custodia_attuale),
    json_quote(NEW.custodia_attuale),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_cimeli_u_categoria AFTER UPDATE OF categoria ON cimeli
WHEN OLD.categoria IS NOT NEW.categoria
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'cimeli',
    NEW.id,
    'U',
    'categoria',
    json_quote(OLD.categoria),
    json_quote(NEW.categoria),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_cimeli_u_confidence AFTER UPDATE OF confidence ON cimeli
WHEN OLD.confidence IS NOT NEW.confidence
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'cimeli',
    NEW.id,
    'U',
    'confidence',
    json_quote(OLD.confidence),
    json_quote(NEW.confidence),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_cimeli_u_verificato AFTER UPDATE OF verificato ON cimeli
WHEN OLD.verificato IS NOT NEW.verificato
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'cimeli',
    NEW.id,
    'U',
    'verificato',
    json_quote(OLD.verificato),
    json_quote(NEW.verificato),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_cimeli_u_fonte_id AFTER UPDATE OF fonte_id ON cimeli
WHEN OLD.fonte_id IS NOT NEW.fonte_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'cimeli',
    NEW.id,
    'U',
    'fonte_id',
    json_quote(OLD.fonte_id),
    json_quote(NEW.fonte_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_cori_ai AFTER INSERT ON cori
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'cori',
    NEW.id,
    'I',
    NULL,
    NULL,
    json_object('id', NEW.id, 'titolo', NEW.titolo, 'testo', NEW.testo, 'audio_url', NEW.audio_url, 'anno', NEW.anno, 'curva', NEW.curva, 'note_origini', NEW.note_origini, 'confidence', NEW.confidence, 'verificato', NEW.verificato, 'fonte_id', NEW.fonte_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_cori_ad AFTER DELETE ON cori
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'cori',
    OLD.id,
    'D',
    NULL,
    json_object('id', OLD.id, 'titolo', OLD.titolo, 'testo', OLD.testo, 'audio_url', OLD.audio_url, 'anno', OLD.anno, 'curva', OLD.curva, 'note_origini', OLD.note_origini, 'confidence', OLD.confidence, 'verificato', OLD.verificato, 'fonte_id', OLD.fonte_id),
    NULL,
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_cori_u_titolo AFTER UPDATE OF titolo ON cori
WHEN OLD.titolo IS NOT NEW.titolo
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'cori',
    NEW.id,
    'U',
    'titolo',
    json_quote(OLD.titolo),
    json_quote(NEW.titolo),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_cori_u_testo AFTER UPDATE OF testo ON cori
WHEN OLD.testo IS NOT NEW.testo
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'cori',
    NEW.id,
    'U',
    'testo',
    json_quote(OLD.testo),
    json_quote(NEW.testo),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_cori_u_audio_url AFTER UPDATE OF audio_url ON cori
WHEN OLD.audio_url IS NOT NEW.audio_url
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'cori',
    NEW.id,
    'U',
    'audio_url',
    json_quote(OLD.audio_url),
    json_quote(NEW.audio_url),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_cori_u_anno AFTER UPDATE OF anno ON cori
WHEN OLD.anno IS NOT NEW.anno
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'cori',
    NEW.id,
    'U',
    'anno',
    json_quote(OLD.anno),
    json_quote(NEW.anno),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_cori_u_curva AFTER UPDATE OF curva ON cori
WHEN OLD.curva IS NOT NEW.curva
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'cori',
    NEW.id,
    'U',
    'curva',
    json_quote(OLD.curva),
    json_quote(NEW.curva),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_cori_u_note_origini AFTER UPDATE OF note_origini ON cori
WHEN OLD.note_origini IS NOT NEW.note_origini
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'cori',
    NEW.id,
    'U',
    'note_origini',
    json_quote(OLD.note_origini),
    json_quote(NEW.note_origini),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_cori_u_confidence AFTER UPDATE OF confidence ON cori
WHEN OLD.confidence IS NOT NEW.confidence
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'cori',
    NEW.id,
    'U',
    'confidence',
    json_quote(OLD.confidence),
    json_quote(NEW.confidence),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_cori_u_verificato AFTER UPDATE OF verificato ON cori
WHEN OLD.verificato IS NOT NEW.verificato
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'cori',
    NEW.id,
    'U',
    'verificato',
    json_quote(OLD.verificato),
    json_quote(NEW.verificato),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END
;
CREATE TRIGGER trg_cori_u_fonte_id AFTER UPDATE OF fonte_id ON cori
WHEN OLD.fonte_id IS NOT NEW.fonte_id
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    'cori',
    NEW.id,
    'U',
    'fonte_id',
    json_quote(OLD.fonte_id),
    json_quote(NEW.fonte_id),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END;