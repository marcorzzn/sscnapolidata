-- Registro delle risorse trovate durante la ricerca (harvest log).
-- Distinto da fonti (catalogo di autorità) e documenti (testo ingestito completo).
-- Stesso URL può comparire più volte se legato a entità diverse.

CREATE TABLE IF NOT EXISTS risorse (
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
);

CREATE INDEX IF NOT EXISTS ix_risorse_tipo ON risorse(tipo);
CREATE INDEX IF NOT EXISTS ix_risorse_stato ON risorse(stato_uso);
CREATE INDEX IF NOT EXISTS ix_risorse_partita ON risorse(partita_id);
CREATE INDEX IF NOT EXISTS ix_risorse_persona ON risorse(persona_id);
CREATE INDEX IF NOT EXISTS ix_risorse_stagione ON risorse(stagione_id);
CREATE INDEX IF NOT EXISTS ix_risorse_data ON risorse(data_consultazione);

CREATE TRIGGER IF NOT EXISTS audit_risorse_insert
AFTER INSERT ON risorse
BEGIN
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, campo, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'risorse', NEW.id, 'I', NULL, NULL,
         json_object(
           'id', NEW.id,
           'url', NEW.url,
           'titolo', NEW.titolo,
           'tipo', NEW.tipo,
           'licenza', NEW.licenza,
           'data_consultazione', NEW.data_consultazione,
           'estratto', NEW.estratto,
           'fatto_estratto', NEW.fatto_estratto,
           'partita_id', NEW.partita_id,
           'persona_id', NEW.persona_id,
           'stagione_id', NEW.stagione_id,
           'fonte_id', NEW.fonte_id,
           'stato_uso', NEW.stato_uso,
           'confidence', NEW.confidence,
           'verifica', NEW.verifica,
           'note', NEW.note
         )
  FROM audit_ctx ctx WHERE ctx.id = 1;
END;

CREATE TRIGGER IF NOT EXISTS audit_risorse_delete
AFTER DELETE ON risorse
BEGIN
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, campo, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'risorse', OLD.id, 'D', NULL,
         json_object(
           'id', OLD.id,
           'url', OLD.url,
           'titolo', OLD.titolo,
           'tipo', OLD.tipo,
           'licenza', OLD.licenza,
           'data_consultazione', OLD.data_consultazione,
           'estratto', OLD.estratto,
           'fatto_estratto', OLD.fatto_estratto,
           'partita_id', OLD.partita_id,
           'persona_id', OLD.persona_id,
           'stagione_id', OLD.stagione_id,
           'fonte_id', OLD.fonte_id,
           'stato_uso', OLD.stato_uso,
           'confidence', OLD.confidence,
           'verifica', OLD.verifica,
           'note', OLD.note
         ),
         NULL
  FROM audit_ctx ctx WHERE ctx.id = 1;
END;

CREATE TRIGGER IF NOT EXISTS audit_risorse_update
AFTER UPDATE ON risorse
BEGIN
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, campo, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'risorse', NEW.id, 'U', 'url', OLD.url, NEW.url
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.url IS NOT NEW.url;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, campo, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'risorse', NEW.id, 'U', 'titolo', OLD.titolo, NEW.titolo
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.titolo IS NOT NEW.titolo;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, campo, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'risorse', NEW.id, 'U', 'tipo', OLD.tipo, NEW.tipo
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.tipo IS NOT NEW.tipo;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, campo, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'risorse', NEW.id, 'U', 'licenza', OLD.licenza, NEW.licenza
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.licenza IS NOT NEW.licenza;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, campo, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'risorse', NEW.id, 'U', 'data_consultazione', OLD.data_consultazione, NEW.data_consultazione
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.data_consultazione IS NOT NEW.data_consultazione;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, campo, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'risorse', NEW.id, 'U', 'estratto', OLD.estratto, NEW.estratto
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.estratto IS NOT NEW.estratto;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, campo, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'risorse', NEW.id, 'U', 'fatto_estratto', OLD.fatto_estratto, NEW.fatto_estratto
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.fatto_estratto IS NOT NEW.fatto_estratto;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, campo, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'risorse', NEW.id, 'U', 'partita_id', OLD.partita_id, NEW.partita_id
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.partita_id IS NOT NEW.partita_id;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, campo, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'risorse', NEW.id, 'U', 'persona_id', OLD.persona_id, NEW.persona_id
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.persona_id IS NOT NEW.persona_id;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, campo, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'risorse', NEW.id, 'U', 'stagione_id', OLD.stagione_id, NEW.stagione_id
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.stagione_id IS NOT NEW.stagione_id;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, campo, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'risorse', NEW.id, 'U', 'fonte_id', OLD.fonte_id, NEW.fonte_id
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.fonte_id IS NOT NEW.fonte_id;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, campo, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'risorse', NEW.id, 'U', 'stato_uso', OLD.stato_uso, NEW.stato_uso
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.stato_uso IS NOT NEW.stato_uso;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, campo, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'risorse', NEW.id, 'U', 'confidence', OLD.confidence, NEW.confidence
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.confidence IS NOT NEW.confidence;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, campo, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'risorse', NEW.id, 'U', 'verifica', OLD.verifica, NEW.verifica
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.verifica IS NOT NEW.verifica;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, campo, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'risorse', NEW.id, 'U', 'note', OLD.note, NEW.note
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.note IS NOT NEW.note;
END;
