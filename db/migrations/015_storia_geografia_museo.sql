-- 015_storia_geografia_museo.sql
-- FASE 1: Creazione tabelle per storia, geografia, museo e case del Napoli

-- 1. Stadi Avversari (per la mappa delle trasferte)
CREATE TABLE IF NOT EXISTS stadi_avversari (
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
);
CREATE INDEX IF NOT EXISTS ix_stadi_citta ON stadi_avversari(citta);

-- 2. Coordinate geografiche e stadio avversario su partite
ALTER TABLE partite ADD COLUMN latitudine REAL;
ALTER TABLE partite ADD COLUMN longitudine REAL;
ALTER TABLE partite ADD COLUMN id_stadio_avversario INTEGER REFERENCES stadi_avversari(id);

-- 3. Periodi Storici del Napoli (dalle origini pre-1926 a oggi)
CREATE TABLE IF NOT EXISTS periodi_storici (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    anno_inizio INTEGER NOT NULL,
    anno_fine INTEGER,
    descrizione TEXT NOT NULL,
    colore_esadecimale TEXT DEFAULT '#01A0E8',
    ordine INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS ix_periodi_anni ON periodi_storici(anno_inizio, anno_fine);

-- 4. Presidenti del Napoli
CREATE TABLE IF NOT EXISTS presidenti (
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
);
CREATE INDEX IF NOT EXISTS ix_presidenti_anni ON presidenti(anno_inizio, anno_fine);

-- 5. Luoghi di Napoli (stadi casalinghi, sedi storiche, centri sportivi, ritiri)
CREATE TABLE IF NOT EXISTS luoghi_napoli (
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
);
CREATE INDEX IF NOT EXISTS ix_luoghi_tipo ON luoghi_napoli(tipo);
CREATE INDEX IF NOT EXISTS ix_luoghi_anni ON luoghi_napoli(anno_inizio, anno_fine);

-- 6. Divise Storiche (Home, Away, Third, Speciali)
CREATE TABLE IF NOT EXISTS divise (
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
);
CREATE INDEX IF NOT EXISTS ix_divise_anno ON divise(anno);

-- 7. Cimeli e Trofei (Museo digitale)
CREATE TABLE IF NOT EXISTS cimeli (
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
);
CREATE INDEX IF NOT EXISTS ix_cimeli_anno ON cimeli(anno);

-- 8. Cori della Tifoseria
CREATE TABLE IF NOT EXISTS cori (
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
);
CREATE INDEX IF NOT EXISTS ix_cori_curva ON cori(curva);
