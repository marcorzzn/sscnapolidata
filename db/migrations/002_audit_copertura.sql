
CREATE TABLE IF NOT EXISTS schema_migrazioni (
  versione INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  applicata_il TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

CREATE TABLE IF NOT EXISTS audit_ctx (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  batch_id TEXT,
  utente TEXT,
  motivo TEXT,
  fonte_id INTEGER REFERENCES fonti(id)
);
INSERT OR IGNORE INTO audit_ctx(id) VALUES (1);

CREATE TABLE IF NOT EXISTS audit_log (
  audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp_utc TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  batch_id TEXT,
  utente TEXT,
  motivo TEXT,
  fonte_id INTEGER REFERENCES fonti(id),
  tabella TEXT NOT NULL,
  record_id INTEGER NOT NULL,
  operazione TEXT NOT NULL CHECK (operazione IN ('I','U','D')),
  valore_precedente TEXT,
  valore_nuovo TEXT
);
CREATE INDEX IF NOT EXISTS ix_audit_rec ON audit_log(tabella, record_id, timestamp_utc);
CREATE INDEX IF NOT EXISTS ix_audit_ts ON audit_log(timestamp_utc);

CREATE TABLE IF NOT EXISTS copertura (
  copertura_id INTEGER PRIMARY KEY AUTOINCREMENT,
  tabella TEXT NOT NULL,
  record_id INTEGER NOT NULL,
  campo TEXT NOT NULL,
  stato TEXT NOT NULL CHECK (stato IN ('completo','parziale','nd','na')),
  motivo TEXT,
  fonte_id INTEGER REFERENCES fonti(id),
  aggiornato_il TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  UNIQUE (tabella, record_id, campo)
);
CREATE INDEX IF NOT EXISTS ix_copertura_lookup ON copertura(tabella, record_id);
CREATE INDEX IF NOT EXISTS ix_copertura_stato ON copertura(stato);
