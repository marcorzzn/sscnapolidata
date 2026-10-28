-- 014_audit_triggers.sql
-- Trigger di audit generati automaticamente per sessione e audit_log


CREATE TRIGGER IF NOT EXISTS trg_partite_ai AFTER INSERT ON partite
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_ad AFTER DELETE ON partite
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_u_match_id AFTER UPDATE OF match_id ON partite
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_u_slug AFTER UPDATE OF slug ON partite
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_u_data AFTER UPDATE OF data ON partite
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_u_stagione_id AFTER UPDATE OF stagione_id ON partite
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_u_competizione_id AFTER UPDATE OF competizione_id ON partite
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_u_giornata AFTER UPDATE OF giornata ON partite
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_u_squadra_casa_id AFTER UPDATE OF squadra_casa_id ON partite
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_u_squadra_trasferta_id AFTER UPDATE OF squadra_trasferta_id ON partite
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_u_home_raw_name AFTER UPDATE OF home_raw_name ON partite
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_u_away_raw_name AFTER UPDATE OF away_raw_name ON partite
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_u_gol_casa AFTER UPDATE OF gol_casa ON partite
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_u_gol_trasferta AFTER UPDATE OF gol_trasferta ON partite
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_u_stadio AFTER UPDATE OF stadio ON partite
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_u_affluenza AFTER UPDATE OF affluenza ON partite
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_u_arbitro_id AFTER UPDATE OF arbitro_id ON partite
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_u_note AFTER UPDATE OF note ON partite
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_u_pubblicata AFTER UPDATE OF pubblicata ON partite
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_u_confidence AFTER UPDATE OF confidence ON partite
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_u_verifica AFTER UPDATE OF verifica ON partite
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_u_verificato AFTER UPDATE OF verificato ON partite
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_u_verificato_da AFTER UPDATE OF verificato_da ON partite
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_u_verificato_il AFTER UPDATE OF verificato_il ON partite
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_u_fonte_id AFTER UPDATE OF fonte_id ON partite
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
END;


CREATE TRIGGER IF NOT EXISTS trg_marcatori_ai AFTER INSERT ON marcatori
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
END;


CREATE TRIGGER IF NOT EXISTS trg_marcatori_ad AFTER DELETE ON marcatori
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
END;


CREATE TRIGGER IF NOT EXISTS trg_marcatori_u_partita_id AFTER UPDATE OF partita_id ON marcatori
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
END;


CREATE TRIGGER IF NOT EXISTS trg_marcatori_u_persona_id AFTER UPDATE OF persona_id ON marcatori
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
END;


CREATE TRIGGER IF NOT EXISTS trg_marcatori_u_squadra_id AFTER UPDATE OF squadra_id ON marcatori
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
END;


CREATE TRIGGER IF NOT EXISTS trg_marcatori_u_minuto AFTER UPDATE OF minuto ON marcatori
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
END;


CREATE TRIGGER IF NOT EXISTS trg_marcatori_u_tipo AFTER UPDATE OF tipo ON marcatori
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
END;


CREATE TRIGGER IF NOT EXISTS trg_marcatori_u_note AFTER UPDATE OF note ON marcatori
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
END;


CREATE TRIGGER IF NOT EXISTS trg_marcatori_u_confidence AFTER UPDATE OF confidence ON marcatori
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
END;


CREATE TRIGGER IF NOT EXISTS trg_marcatori_u_verifica AFTER UPDATE OF verifica ON marcatori
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
END;


CREATE TRIGGER IF NOT EXISTS trg_marcatori_u_verificato AFTER UPDATE OF verificato ON marcatori
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
END;


CREATE TRIGGER IF NOT EXISTS trg_marcatori_u_verificato_da AFTER UPDATE OF verificato_da ON marcatori
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
END;


CREATE TRIGGER IF NOT EXISTS trg_marcatori_u_verificato_il AFTER UPDATE OF verificato_il ON marcatori
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
END;


CREATE TRIGGER IF NOT EXISTS trg_marcatori_u_fonte_id AFTER UPDATE OF fonte_id ON marcatori
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
END;


CREATE TRIGGER IF NOT EXISTS trg_persone_ai AFTER INSERT ON persone
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
END;


CREATE TRIGGER IF NOT EXISTS trg_persone_ad AFTER DELETE ON persone
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
END;


CREATE TRIGGER IF NOT EXISTS trg_persone_u_nome_completo AFTER UPDATE OF nome_completo ON persone
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
END;


CREATE TRIGGER IF NOT EXISTS trg_persone_u_cognome AFTER UPDATE OF cognome ON persone
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
END;


CREATE TRIGGER IF NOT EXISTS trg_persone_u_nome AFTER UPDATE OF nome ON persone
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
END;


CREATE TRIGGER IF NOT EXISTS trg_persone_u_data_nascita AFTER UPDATE OF data_nascita ON persone
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
END;


CREATE TRIGGER IF NOT EXISTS trg_persone_u_luogo_nascita AFTER UPDATE OF luogo_nascita ON persone
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
END;


CREATE TRIGGER IF NOT EXISTS trg_persone_u_nazionalita AFTER UPDATE OF nazionalita ON persone
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
END;


CREATE TRIGGER IF NOT EXISTS trg_persone_u_ruolo_principale AFTER UPDATE OF ruolo_principale ON persone
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
END;


CREATE TRIGGER IF NOT EXISTS trg_persone_u_confidence AFTER UPDATE OF confidence ON persone
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
END;


CREATE TRIGGER IF NOT EXISTS trg_persone_u_verifica AFTER UPDATE OF verifica ON persone
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
END;


CREATE TRIGGER IF NOT EXISTS trg_persone_u_verificato AFTER UPDATE OF verificato ON persone
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
END;


CREATE TRIGGER IF NOT EXISTS trg_persone_u_verificato_da AFTER UPDATE OF verificato_da ON persone
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
END;


CREATE TRIGGER IF NOT EXISTS trg_persone_u_verificato_il AFTER UPDATE OF verificato_il ON persone
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
END;


CREATE TRIGGER IF NOT EXISTS trg_persone_u_fonte_id AFTER UPDATE OF fonte_id ON persone
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
END;


CREATE TRIGGER IF NOT EXISTS trg_persone_u_fuso_in_id AFTER UPDATE OF fuso_in_id ON persone
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_ai AFTER INSERT ON squadre
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_ad AFTER DELETE ON squadre
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_u_nome AFTER UPDATE OF nome ON squadre
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_u_nome_completo AFTER UPDATE OF nome_completo ON squadre
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_u_citta AFTER UPDATE OF citta ON squadre
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_u_stadio_principale AFTER UPDATE OF stadio_principale ON squadre
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_u_confidence AFTER UPDATE OF confidence ON squadre
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_u_verificato AFTER UPDATE OF verificato ON squadre
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_u_verificato_da AFTER UPDATE OF verificato_da ON squadre
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_u_verificato_il AFTER UPDATE OF verificato_il ON squadre
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_u_fonte_id AFTER UPDATE OF fonte_id ON squadre
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_u_fuso_in_id AFTER UPDATE OF fuso_in_id ON squadre
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_relazioni_ai AFTER INSERT ON squadre_relazioni
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_relazioni_ad AFTER DELETE ON squadre_relazioni
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_relazioni_u_from_squadra_id AFTER UPDATE OF from_squadra_id ON squadre_relazioni
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_relazioni_u_to_squadra_id AFTER UPDATE OF to_squadra_id ON squadre_relazioni
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_relazioni_u_rel_type AFTER UPDATE OF rel_type ON squadre_relazioni
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_relazioni_u_effective_date AFTER UPDATE OF effective_date ON squadre_relazioni
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_relazioni_u_inherits_legal AFTER UPDATE OF inherits_legal ON squadre_relazioni
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_relazioni_u_inherits_sporting_record AFTER UPDATE OF inherits_sporting_record ON squadre_relazioni
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_relazioni_u_source AFTER UPDATE OF source ON squadre_relazioni
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_relazioni_u_confidence AFTER UPDATE OF confidence ON squadre_relazioni
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_relazioni_u_note AFTER UPDATE OF note ON squadre_relazioni
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_alias_ai AFTER INSERT ON squadre_alias
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_alias_ad AFTER DELETE ON squadre_alias
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_alias_u_squadra_id AFTER UPDATE OF squadra_id ON squadre_alias
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_alias_u_alias AFTER UPDATE OF alias ON squadre_alias
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_alias_u_alias_norm AFTER UPDATE OF alias_norm ON squadre_alias
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_alias_u_alias_key AFTER UPDATE OF alias_key ON squadre_alias
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_alias_u_alias_type AFTER UPDATE OF alias_type ON squadre_alias
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_alias_u_valid_from AFTER UPDATE OF valid_from ON squadre_alias
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_alias_u_valid_to AFTER UPDATE OF valid_to ON squadre_alias
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_alias_u_source_scope AFTER UPDATE OF source_scope ON squadre_alias
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_alias_u_source AFTER UPDATE OF source ON squadre_alias
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
END;


CREATE TRIGGER IF NOT EXISTS trg_squadre_alias_u_confidence AFTER UPDATE OF confidence ON squadre_alias
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_formazioni_ai AFTER INSERT ON partite_formazioni
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_formazioni_ad AFTER DELETE ON partite_formazioni
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_formazioni_u_partita_id AFTER UPDATE OF partita_id ON partite_formazioni
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_formazioni_u_squadra_id AFTER UPDATE OF squadra_id ON partite_formazioni
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_formazioni_u_persona_id AFTER UPDATE OF persona_id ON partite_formazioni
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_formazioni_u_numero_maglia AFTER UPDATE OF numero_maglia ON partite_formazioni
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_formazioni_u_ruolo AFTER UPDATE OF ruolo ON partite_formazioni
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_formazioni_u_titolare AFTER UPDATE OF titolare ON partite_formazioni
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_formazioni_u_capitano AFTER UPDATE OF capitano ON partite_formazioni
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_formazioni_u_minuto_in AFTER UPDATE OF minuto_in ON partite_formazioni
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_formazioni_u_minuto_out AFTER UPDATE OF minuto_out ON partite_formazioni
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_formazioni_u_confidence AFTER UPDATE OF confidence ON partite_formazioni
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_formazioni_u_verificato AFTER UPDATE OF verificato ON partite_formazioni
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_formazioni_u_fonte_id AFTER UPDATE OF fonte_id ON partite_formazioni
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_eventi_ai AFTER INSERT ON partite_eventi
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_eventi_ad AFTER DELETE ON partite_eventi
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_eventi_u_partita_id AFTER UPDATE OF partita_id ON partite_eventi
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_eventi_u_minuto AFTER UPDATE OF minuto ON partite_eventi
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_eventi_u_recupero AFTER UPDATE OF recupero ON partite_eventi
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_eventi_u_tipo AFTER UPDATE OF tipo ON partite_eventi
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_eventi_u_squadra_id AFTER UPDATE OF squadra_id ON partite_eventi
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_eventi_u_persona_id AFTER UPDATE OF persona_id ON partite_eventi
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_eventi_u_persona2_id AFTER UPDATE OF persona2_id ON partite_eventi
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_eventi_u_nota AFTER UPDATE OF nota ON partite_eventi
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_eventi_u_confidence AFTER UPDATE OF confidence ON partite_eventi
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_eventi_u_verificato AFTER UPDATE OF verificato ON partite_eventi
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_eventi_u_fonte_id AFTER UPDATE OF fonte_id ON partite_eventi
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_statistiche_ai AFTER INSERT ON partite_statistiche
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_statistiche_ad AFTER DELETE ON partite_statistiche
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_statistiche_u_valore AFTER UPDATE OF valore ON partite_statistiche
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_statistiche_u_confidence AFTER UPDATE OF confidence ON partite_statistiche
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
END;


CREATE TRIGGER IF NOT EXISTS trg_partite_statistiche_u_fonte_id AFTER UPDATE OF fonte_id ON partite_statistiche
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
END;


CREATE TRIGGER IF NOT EXISTS trg_copertura_ai AFTER INSERT ON copertura
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
END;


CREATE TRIGGER IF NOT EXISTS trg_copertura_ad AFTER DELETE ON copertura
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
END;


CREATE TRIGGER IF NOT EXISTS trg_copertura_u_stato AFTER UPDATE OF stato ON copertura
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
END;


CREATE TRIGGER IF NOT EXISTS trg_copertura_u_motivo AFTER UPDATE OF motivo ON copertura
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
END;


CREATE TRIGGER IF NOT EXISTS trg_copertura_u_fonte_id AFTER UPDATE OF fonte_id ON copertura
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
END;
