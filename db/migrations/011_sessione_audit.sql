-- 011_sessione_audit.sql
-- Migrazione unificata per sessione e audit_log (standard SQLite + Python stdlib)

DROP TRIGGER IF EXISTS audit_partite_insert;
DROP TRIGGER IF EXISTS audit_partite_delete;
DROP TRIGGER IF EXISTS audit_partite_update;
DROP TRIGGER IF EXISTS audit_marcatori_insert;
DROP TRIGGER IF EXISTS audit_marcatori_delete;
DROP TRIGGER IF EXISTS audit_marcatori_update;
DROP TRIGGER IF EXISTS audit_persone_insert;
DROP TRIGGER IF EXISTS audit_persone_delete;
DROP TRIGGER IF EXISTS audit_persone_update;
DROP TRIGGER IF EXISTS audit_squadre_alias_insert;
DROP TRIGGER IF EXISTS audit_squadre_alias_delete;
DROP TRIGGER IF EXISTS audit_squadre_alias_update;
DROP TRIGGER IF EXISTS audit_foto_insert;
DROP TRIGGER IF EXISTS audit_foto_delete;
DROP TRIGGER IF EXISTS audit_foto_update;
DROP TRIGGER IF EXISTS audit_documenti_insert;
DROP TRIGGER IF EXISTS audit_documenti_delete;
DROP TRIGGER IF EXISTS audit_documenti_update;
DROP TRIGGER IF EXISTS audit_risorse_insert;
DROP TRIGGER IF EXISTS audit_risorse_delete;
DROP TRIGGER IF EXISTS audit_risorse_update;

CREATE TABLE IF NOT EXISTS sessione (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  attore TEXT,
  motivo TEXT,
  fonte_id INTEGER,
  batch_id TEXT
);
INSERT OR IGNORE INTO sessione(id, attore, motivo, fonte_id, batch_id) 
VALUES (1, 'sconosciuto', 'Inizializzazione', NULL, NULL);

CREATE TABLE IF NOT EXISTS audit_log_v2 (
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
);

INSERT INTO audit_log_v2 (audit_id, ts, tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
SELECT 
  audit_id,
  COALESCE(timestamp_utc, strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  tabella,
  CAST(record_id AS TEXT),
  operazione,
  campo,
  json_quote(valore_precedente),
  json_quote(valore_nuovo),
  COALESCE(utente, 'sconosciuto'),
  motivo,
  fonte_id,
  batch_id
FROM audit_log;

DROP TABLE audit_log;
ALTER TABLE audit_log_v2 RENAME TO audit_log;

CREATE INDEX IF NOT EXISTS ix_audit_ts ON audit_log(ts);
CREATE INDEX IF NOT EXISTS ix_audit_rec ON audit_log(tabella, pk, campo, ts);
CREATE INDEX IF NOT EXISTS ix_audit_batch ON audit_log(batch_id);
