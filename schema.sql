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
    documento_id INTEGER,
    data_raccolta TEXT,
    note TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(documento_id) REFERENCES documenti(id)
);

CREATE TABLE IF NOT EXISTS partite (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT,
    avversario TEXT,
    risultato TEXT,
    competizione TEXT,
    fonte TEXT,
    squadra_casa TEXT,
    squadra_trasferta TEXT,
    stagione TEXT,
    giornata TEXT,
    marcatori TEXT,
    arbitro TEXT,
    stadio TEXT,
    documento_id INTEGER REFERENCES documenti(id),
    confidence TEXT,
    note TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

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
