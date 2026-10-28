-- 013_formazioni_eventi_statistiche.sql
-- Nuove colonne di qualità (confidence, verificato, verificato_da, verificato_il, fonte_id, fuso_in_id)
-- e nuove tabelle: partite_formazioni, partite_eventi, partite_statistiche, conflitti_import

-- Colonne qualità su partite
ALTER TABLE partite ADD COLUMN verificato INTEGER NOT NULL DEFAULT 0 CHECK (verificato IN (0,1));
ALTER TABLE partite ADD COLUMN verificato_da TEXT;
ALTER TABLE partite ADD COLUMN verificato_il TEXT;
ALTER TABLE partite ADD COLUMN fonte_id INTEGER REFERENCES fonti(id);
UPDATE partite SET verificato = 1 WHERE verifica = 'verificato';

-- Colonne qualità su persone
ALTER TABLE persone ADD COLUMN verificato INTEGER NOT NULL DEFAULT 0 CHECK (verificato IN (0,1));
ALTER TABLE persone ADD COLUMN verificato_da TEXT;
ALTER TABLE persone ADD COLUMN verificato_il TEXT;
ALTER TABLE persone ADD COLUMN fonte_id INTEGER REFERENCES fonti(id);
ALTER TABLE persone ADD COLUMN fuso_in_id INTEGER REFERENCES persone(id);
UPDATE persone SET verificato = 1 WHERE verifica = 'verificato';

-- Colonne qualità su squadre
ALTER TABLE squadre ADD COLUMN confidence TEXT NOT NULL DEFAULT 'media' CHECK (confidence IN ('alta','media','bassa'));
ALTER TABLE squadre ADD COLUMN verificato INTEGER NOT NULL DEFAULT 0 CHECK (verificato IN (0,1));
ALTER TABLE squadre ADD COLUMN verificato_da TEXT;
ALTER TABLE squadre ADD COLUMN verificato_il TEXT;
ALTER TABLE squadre ADD COLUMN fonte_id INTEGER REFERENCES fonti(id);
ALTER TABLE squadre ADD COLUMN fuso_in_id INTEGER REFERENCES squadre(id);

-- Colonne qualità su marcatori
ALTER TABLE marcatori ADD COLUMN verificato INTEGER NOT NULL DEFAULT 0 CHECK (verificato IN (0,1));
ALTER TABLE marcatori ADD COLUMN verificato_da TEXT;
ALTER TABLE marcatori ADD COLUMN verificato_il TEXT;
ALTER TABLE marcatori ADD COLUMN fonte_id INTEGER REFERENCES fonti(id);
UPDATE marcatori SET verificato = 1 WHERE verifica = 'verificato';

-- Tabelle figlie nuove
CREATE TABLE IF NOT EXISTS partite_formazioni (
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

CREATE TABLE IF NOT EXISTS partite_eventi (
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

CREATE TABLE IF NOT EXISTS partite_statistiche (
    partita_id INTEGER NOT NULL REFERENCES partite(id),
    squadra_id INTEGER NOT NULL REFERENCES squadre(id),
    metrica TEXT NOT NULL,
    valore REAL,
    confidence TEXT NOT NULL DEFAULT 'media' CHECK (confidence IN ('alta','media','bassa')),
    fonte_id INTEGER REFERENCES fonti(id),
    PRIMARY KEY (partita_id, squadra_id, metrica)
);

CREATE TABLE IF NOT EXISTS conflitti_import (
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
