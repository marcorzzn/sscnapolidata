-- Livello 1: entità di base
CREATE TABLE IF NOT EXISTS fonti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT UNIQUE NOT NULL,
    url TEXT,
    tipo TEXT,        -- 'ufficiale', 'database', 'testata', 'wiki'
    affidabilita TEXT -- 'alta', 'media', 'bassa'
);

CREATE TABLE IF NOT EXISTS competizioni (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT UNIQUE NOT NULL,
    ambito TEXT,   -- 'nazionale', 'internazionale'
    livello TEXT   -- 'prima', 'seconda', 'coppa'
);

CREATE TABLE IF NOT EXISTS squadre (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT UNIQUE NOT NULL,
    nome_completo TEXT,
    citta TEXT,
    stadio_principale TEXT
);

CREATE TABLE IF NOT EXISTS stagioni (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT UNIQUE NOT NULL,  -- es. '1986-87'
    anno_inizio INTEGER,
    anno_fine INTEGER
);

CREATE TABLE IF NOT EXISTS persone (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_completo TEXT UNIQUE NOT NULL,
    cognome TEXT,
    nome TEXT,
    data_nascita TEXT,
    luogo_nascita TEXT,
    nazionalita TEXT,
    ruolo_principale TEXT  -- 'portiere', 'difensore', 'centrocampista', 'attaccante', 'allenatore'
);

CREATE TABLE IF NOT EXISTS partite (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id TEXT UNIQUE,       -- es. '20250523-NAP-CAG'
    slug TEXT UNIQUE,           -- es. 'fiorentina-napoli-2026-09-20'
    data TEXT NOT NULL,
    stagione_id INTEGER REFERENCES stagioni(id),
    competizione_id INTEGER REFERENCES competizioni(id),
    giornata TEXT,
    squadra_casa_id INTEGER REFERENCES squadre(id),
    squadra_trasferta_id INTEGER REFERENCES squadre(id),
    gol_casa INTEGER,
    gol_trasferta INTEGER,
    stadio TEXT,
    affluenza INTEGER,
    arbitro_id INTEGER REFERENCES persone(id),
    note TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS marcatori (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    partita_id INTEGER NOT NULL REFERENCES partite(id),
    persona_id INTEGER REFERENCES persone(id),
    squadra_id INTEGER REFERENCES squadre(id),
    minuto TEXT,
    tipo TEXT,   -- 'gol', 'autogol', 'rigore'
    note TEXT
);

CREATE TABLE IF NOT EXISTS presenze_stagionali (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stagione_id INTEGER NOT NULL REFERENCES stagioni(id),
    persona_id INTEGER NOT NULL REFERENCES persone(id),
    presenze INTEGER,
    reti INTEGER,
    ruolo TEXT,
    fonte_id INTEGER REFERENCES fonti(id),
    UNIQUE(stagione_id, persona_id)
);

CREATE TABLE IF NOT EXISTS partite_fonti (
    partita_id INTEGER NOT NULL REFERENCES partite(id),
    fonte_id INTEGER NOT NULL REFERENCES fonti(id),
    PRIMARY KEY (partita_id, fonte_id)
);

-- Livello 3: materiale grezzo (dal sistema ingest)
CREATE TABLE IF NOT EXISTS documenti (
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
);

CREATE TABLE IF NOT EXISTS foto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    percorso_file TEXT UNIQUE,
    didascalia TEXT,
    fonte TEXT,
    data_scatto TEXT,
    data_raccolta TEXT,
    documento_id INTEGER REFERENCES documenti(id),
    note TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS partite_documenti (
    partita_id INTEGER NOT NULL REFERENCES partite(id),
    documento_id INTEGER NOT NULL REFERENCES documenti(id),
    PRIMARY KEY (partita_id, documento_id)
);

CREATE TABLE IF NOT EXISTS partite_foto (
    partita_id INTEGER NOT NULL REFERENCES partite(id),
    foto_id INTEGER NOT NULL REFERENCES foto(id),
    PRIMARY KEY (partita_id, foto_id)
);

-- Indici per le query frequenti
CREATE INDEX IF NOT EXISTS idx_partite_data ON partite(data);
CREATE INDEX IF NOT EXISTS idx_partite_stagione ON partite(stagione_id);
CREATE INDEX IF NOT EXISTS idx_marcatori_partita ON marcatori(partita_id);
CREATE INDEX IF NOT EXISTS idx_presenze_stagione ON presenze_stagionali(stagione_id);
CREATE INDEX IF NOT EXISTS idx_foto_documento ON foto(documento_id);

-- Ricerca full-text sui documenti
CREATE VIRTUAL TABLE IF NOT EXISTS documenti_fts USING fts5(
    titolo,
    testo_completo,
    content='documenti',
    content_rowid='id'
);

CREATE TRIGGER IF NOT EXISTS documenti_ai AFTER INSERT ON documenti BEGIN
    INSERT INTO documenti_fts(rowid, titolo, testo_completo)
    VALUES (new.id, new.titolo, new.testo_completo);
END;

CREATE TRIGGER IF NOT EXISTS documenti_ad AFTER DELETE ON documenti BEGIN
    INSERT INTO documenti_fts(documenti_fts, rowid, titolo, testo_completo)
    VALUES ('delete', old.id, old.titolo, old.testo_completo);
END;

CREATE TRIGGER IF NOT EXISTS documenti_au AFTER UPDATE ON documenti BEGIN
    INSERT INTO documenti_fts(documenti_fts, rowid, titolo, testo_completo)
    VALUES ('delete', old.id, old.titolo, old.testo_completo);
    INSERT INTO documenti_fts(rowid, titolo, testo_completo)
    VALUES (new.id, new.titolo, new.testo_completo);
END;
