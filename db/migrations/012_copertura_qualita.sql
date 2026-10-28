-- 012_copertura_qualita.sql
-- Tabella copertura v2 con stati (completo, parziale, nd, na, pending), copertura_regole e vista v_copertura_partite

CREATE TABLE IF NOT EXISTS copertura_v2 (
  entita TEXT NOT NULL,
  entita_id INTEGER NOT NULL,
  sezione TEXT NOT NULL,
  stato TEXT NOT NULL CHECK (stato IN ('completo','parziale','nd','na','pending')),
  motivo TEXT,
  fonte_id INTEGER REFERENCES fonti(id),
  aggiornato_il TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (entita, entita_id, sezione)
);

INSERT OR IGNORE INTO copertura_v2 (entita, entita_id, sezione, stato, motivo, fonte_id, aggiornato_il)
SELECT 
  CASE WHEN tabella = 'partite' THEN 'partita' ELSE tabella END,
  record_id,
  CASE WHEN campo = 'sez:marcatori' THEN 'marcatori' ELSE campo END,
  stato,
  motivo,
  fonte_id,
  aggiornato_il
FROM copertura;

DROP TABLE copertura;
ALTER TABLE copertura_v2 RENAME TO copertura;

CREATE TABLE IF NOT EXISTS copertura_regole (
  sezione TEXT NOT NULL,
  data_da TEXT,
  data_a TEXT,
  stato TEXT NOT NULL CHECK (stato IN ('na','nd')),
  motivo TEXT NOT NULL
);

INSERT OR IGNORE INTO copertura_regole (sezione, data_da, data_a, stato, motivo)
VALUES ('xg', NULL, '2009-12-31', 'na', 'xG non esistono prima del 2010');

DROP VIEW IF EXISTS v_copertura_partite;
CREATE VIEW v_copertura_partite AS
WITH sezioni(sezione) AS (
  VALUES ('marcatori'), ('arbitro'), ('affluenza'), ('stadio'), ('formazioni'), ('eventi'), ('statistiche'), ('xg')
)
SELECT 
  p.id AS partita_id,
  s.sezione,
  COALESCE(
    c.stato,
    cr.stato,
    CASE 
      WHEN s.sezione = 'marcatori' AND (p.gol_casa + p.gol_trasferta = 0) THEN 'completo'
      WHEN s.sezione = 'marcatori' AND EXISTS (SELECT 1 FROM marcatori m WHERE m.partita_id = p.id) THEN 'completo'
      WHEN s.sezione = 'arbitro' AND p.arbitro_id IS NOT NULL THEN 'completo'
      WHEN s.sezione = 'stadio' AND p.stadio IS NOT NULL AND p.stadio != '' THEN 'completo'
      WHEN s.sezione = 'affluenza' AND p.affluenza IS NOT NULL THEN 'completo'
      ELSE 'pending'
    END
  ) AS stato_effettivo
FROM partite p
CROSS JOIN sezioni s
LEFT JOIN copertura c ON c.entita = 'partita' AND c.entita_id = p.id AND c.sezione = s.sezione
LEFT JOIN copertura_regole cr ON cr.sezione = s.sezione 
  AND (cr.data_da IS NULL OR p.data >= cr.data_da)
  AND (cr.data_a IS NULL OR p.data <= cr.data_a);
