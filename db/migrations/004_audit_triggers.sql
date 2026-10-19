CREATE TRIGGER IF NOT EXISTS audit_partite_insert
AFTER INSERT ON partite
BEGIN
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'partite', NEW.id, 'I', NULL,
         json_object('id', NEW.id, 'match_id', NEW.match_id, 'slug', NEW.slug, 'data', NEW.data, 'stagione_id', NEW.stagione_id, 'competizione_id', NEW.competizione_id, 'giornata', NEW.giornata, 'squadra_casa_id', NEW.squadra_casa_id, 'squadra_trasferta_id', NEW.squadra_trasferta_id, 'home_raw_name', NEW.home_raw_name, 'away_raw_name', NEW.away_raw_name, 'gol_casa', NEW.gol_casa, 'gol_trasferta', NEW.gol_trasferta, 'stadio', NEW.stadio, 'affluenza', NEW.affluenza, 'arbitro_id', NEW.arbitro_id, 'note', NEW.note, 'pubblicata', NEW.pubblicata, 'confidence', NEW.confidence, 'verifica', NEW.verifica)
  FROM audit_ctx ctx WHERE ctx.id = 1;
END;

CREATE TRIGGER IF NOT EXISTS audit_partite_delete
AFTER DELETE ON partite
BEGIN
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'partite', OLD.id, 'D',
         json_object('id', OLD.id, 'match_id', OLD.match_id, 'slug', OLD.slug, 'data', OLD.data, 'stagione_id', OLD.stagione_id, 'competizione_id', OLD.competizione_id, 'giornata', OLD.giornata, 'squadra_casa_id', OLD.squadra_casa_id, 'squadra_trasferta_id', OLD.squadra_trasferta_id, 'home_raw_name', OLD.home_raw_name, 'away_raw_name', OLD.away_raw_name, 'gol_casa', OLD.gol_casa, 'gol_trasferta', OLD.gol_trasferta, 'stadio', OLD.stadio, 'affluenza', OLD.affluenza, 'arbitro_id', OLD.arbitro_id, 'note', OLD.note, 'pubblicata', OLD.pubblicata, 'confidence', OLD.confidence, 'verifica', OLD.verifica),
         NULL
  FROM audit_ctx ctx WHERE ctx.id = 1;
END;

CREATE TRIGGER IF NOT EXISTS audit_partite_update
AFTER UPDATE ON partite
BEGIN
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'partite', NEW.id, 'U', OLD.match_id, NEW.match_id
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.match_id IS NOT NEW.match_id;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'partite', NEW.id, 'U', OLD.slug, NEW.slug
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.slug IS NOT NEW.slug;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'partite', NEW.id, 'U', OLD.data, NEW.data
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.data IS NOT NEW.data;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'partite', NEW.id, 'U', OLD.stagione_id, NEW.stagione_id
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.stagione_id IS NOT NEW.stagione_id;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'partite', NEW.id, 'U', OLD.competizione_id, NEW.competizione_id
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.competizione_id IS NOT NEW.competizione_id;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'partite', NEW.id, 'U', OLD.giornata, NEW.giornata
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.giornata IS NOT NEW.giornata;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'partite', NEW.id, 'U', OLD.squadra_casa_id, NEW.squadra_casa_id
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.squadra_casa_id IS NOT NEW.squadra_casa_id;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'partite', NEW.id, 'U', OLD.squadra_trasferta_id, NEW.squadra_trasferta_id
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.squadra_trasferta_id IS NOT NEW.squadra_trasferta_id;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'partite', NEW.id, 'U', OLD.home_raw_name, NEW.home_raw_name
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.home_raw_name IS NOT NEW.home_raw_name;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'partite', NEW.id, 'U', OLD.away_raw_name, NEW.away_raw_name
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.away_raw_name IS NOT NEW.away_raw_name;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'partite', NEW.id, 'U', OLD.gol_casa, NEW.gol_casa
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.gol_casa IS NOT NEW.gol_casa;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'partite', NEW.id, 'U', OLD.gol_trasferta, NEW.gol_trasferta
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.gol_trasferta IS NOT NEW.gol_trasferta;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'partite', NEW.id, 'U', OLD.stadio, NEW.stadio
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.stadio IS NOT NEW.stadio;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'partite', NEW.id, 'U', OLD.affluenza, NEW.affluenza
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.affluenza IS NOT NEW.affluenza;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'partite', NEW.id, 'U', OLD.arbitro_id, NEW.arbitro_id
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.arbitro_id IS NOT NEW.arbitro_id;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'partite', NEW.id, 'U', OLD.note, NEW.note
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.note IS NOT NEW.note;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'partite', NEW.id, 'U', OLD.pubblicata, NEW.pubblicata
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.pubblicata IS NOT NEW.pubblicata;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'partite', NEW.id, 'U', OLD.confidence, NEW.confidence
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.confidence IS NOT NEW.confidence;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'partite', NEW.id, 'U', OLD.verifica, NEW.verifica
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.verifica IS NOT NEW.verifica;
END;

CREATE TRIGGER IF NOT EXISTS audit_marcatori_insert
AFTER INSERT ON marcatori
BEGIN
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'marcatori', NEW.id, 'I', NULL,
         json_object('id', NEW.id, 'partita_id', NEW.partita_id, 'persona_id', NEW.persona_id, 'squadra_id', NEW.squadra_id, 'minuto', NEW.minuto, 'tipo', NEW.tipo, 'note', NEW.note, 'confidence', NEW.confidence, 'verifica', NEW.verifica)
  FROM audit_ctx ctx WHERE ctx.id = 1;
END;

CREATE TRIGGER IF NOT EXISTS audit_marcatori_delete
AFTER DELETE ON marcatori
BEGIN
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'marcatori', OLD.id, 'D',
         json_object('id', OLD.id, 'partita_id', OLD.partita_id, 'persona_id', OLD.persona_id, 'squadra_id', OLD.squadra_id, 'minuto', OLD.minuto, 'tipo', OLD.tipo, 'note', OLD.note, 'confidence', OLD.confidence, 'verifica', OLD.verifica),
         NULL
  FROM audit_ctx ctx WHERE ctx.id = 1;
END;

CREATE TRIGGER IF NOT EXISTS audit_marcatori_update
AFTER UPDATE ON marcatori
BEGIN
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'marcatori', NEW.id, 'U', OLD.partita_id, NEW.partita_id
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.partita_id IS NOT NEW.partita_id;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'marcatori', NEW.id, 'U', OLD.persona_id, NEW.persona_id
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.persona_id IS NOT NEW.persona_id;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'marcatori', NEW.id, 'U', OLD.squadra_id, NEW.squadra_id
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.squadra_id IS NOT NEW.squadra_id;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'marcatori', NEW.id, 'U', OLD.minuto, NEW.minuto
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.minuto IS NOT NEW.minuto;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'marcatori', NEW.id, 'U', OLD.tipo, NEW.tipo
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.tipo IS NOT NEW.tipo;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'marcatori', NEW.id, 'U', OLD.note, NEW.note
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.note IS NOT NEW.note;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'marcatori', NEW.id, 'U', OLD.confidence, NEW.confidence
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.confidence IS NOT NEW.confidence;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'marcatori', NEW.id, 'U', OLD.verifica, NEW.verifica
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.verifica IS NOT NEW.verifica;
END;

CREATE TRIGGER IF NOT EXISTS audit_persone_insert
AFTER INSERT ON persone
BEGIN
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'persone', NEW.id, 'I', NULL,
         json_object('id', NEW.id, 'nome_completo', NEW.nome_completo, 'cognome', NEW.cognome, 'nome', NEW.nome, 'data_nascita', NEW.data_nascita, 'luogo_nascita', NEW.luogo_nascita, 'nazionalita', NEW.nazionalita, 'ruolo_principale', NEW.ruolo_principale, 'confidence', NEW.confidence, 'verifica', NEW.verifica)
  FROM audit_ctx ctx WHERE ctx.id = 1;
END;

CREATE TRIGGER IF NOT EXISTS audit_persone_delete
AFTER DELETE ON persone
BEGIN
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'persone', OLD.id, 'D',
         json_object('id', OLD.id, 'nome_completo', OLD.nome_completo, 'cognome', OLD.cognome, 'nome', OLD.nome, 'data_nascita', OLD.data_nascita, 'luogo_nascita', OLD.luogo_nascita, 'nazionalita', OLD.nazionalita, 'ruolo_principale', OLD.ruolo_principale, 'confidence', OLD.confidence, 'verifica', OLD.verifica),
         NULL
  FROM audit_ctx ctx WHERE ctx.id = 1;
END;

CREATE TRIGGER IF NOT EXISTS audit_persone_update
AFTER UPDATE ON persone
BEGIN
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'persone', NEW.id, 'U', OLD.nome_completo, NEW.nome_completo
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.nome_completo IS NOT NEW.nome_completo;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'persone', NEW.id, 'U', OLD.cognome, NEW.cognome
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.cognome IS NOT NEW.cognome;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'persone', NEW.id, 'U', OLD.nome, NEW.nome
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.nome IS NOT NEW.nome;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'persone', NEW.id, 'U', OLD.data_nascita, NEW.data_nascita
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.data_nascita IS NOT NEW.data_nascita;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'persone', NEW.id, 'U', OLD.luogo_nascita, NEW.luogo_nascita
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.luogo_nascita IS NOT NEW.luogo_nascita;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'persone', NEW.id, 'U', OLD.nazionalita, NEW.nazionalita
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.nazionalita IS NOT NEW.nazionalita;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'persone', NEW.id, 'U', OLD.ruolo_principale, NEW.ruolo_principale
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.ruolo_principale IS NOT NEW.ruolo_principale;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'persone', NEW.id, 'U', OLD.confidence, NEW.confidence
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.confidence IS NOT NEW.confidence;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'persone', NEW.id, 'U', OLD.verifica, NEW.verifica
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.verifica IS NOT NEW.verifica;
END;

CREATE TRIGGER IF NOT EXISTS audit_squadre_alias_insert
AFTER INSERT ON squadre_alias
BEGIN
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'squadre_alias', NEW.id, 'I', NULL,
         json_object('id', NEW.id, 'squadra_id', NEW.squadra_id, 'alias', NEW.alias, 'alias_norm', NEW.alias_norm, 'alias_key', NEW.alias_key, 'alias_type', NEW.alias_type, 'valid_from', NEW.valid_from, 'valid_to', NEW.valid_to, 'source_scope', NEW.source_scope, 'source', NEW.source, 'confidence', NEW.confidence)
  FROM audit_ctx ctx WHERE ctx.id = 1;
END;

CREATE TRIGGER IF NOT EXISTS audit_squadre_alias_delete
AFTER DELETE ON squadre_alias
BEGIN
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'squadre_alias', OLD.id, 'D',
         json_object('id', OLD.id, 'squadra_id', OLD.squadra_id, 'alias', OLD.alias, 'alias_norm', OLD.alias_norm, 'alias_key', OLD.alias_key, 'alias_type', OLD.alias_type, 'valid_from', OLD.valid_from, 'valid_to', OLD.valid_to, 'source_scope', OLD.source_scope, 'source', OLD.source, 'confidence', OLD.confidence),
         NULL
  FROM audit_ctx ctx WHERE ctx.id = 1;
END;

CREATE TRIGGER IF NOT EXISTS audit_squadre_alias_update
AFTER UPDATE ON squadre_alias
BEGIN
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'squadre_alias', NEW.id, 'U', OLD.squadra_id, NEW.squadra_id
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.squadra_id IS NOT NEW.squadra_id;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'squadre_alias', NEW.id, 'U', OLD.alias, NEW.alias
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.alias IS NOT NEW.alias;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'squadre_alias', NEW.id, 'U', OLD.alias_norm, NEW.alias_norm
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.alias_norm IS NOT NEW.alias_norm;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'squadre_alias', NEW.id, 'U', OLD.alias_key, NEW.alias_key
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.alias_key IS NOT NEW.alias_key;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'squadre_alias', NEW.id, 'U', OLD.alias_type, NEW.alias_type
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.alias_type IS NOT NEW.alias_type;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'squadre_alias', NEW.id, 'U', OLD.valid_from, NEW.valid_from
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.valid_from IS NOT NEW.valid_from;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'squadre_alias', NEW.id, 'U', OLD.valid_to, NEW.valid_to
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.valid_to IS NOT NEW.valid_to;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'squadre_alias', NEW.id, 'U', OLD.source_scope, NEW.source_scope
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.source_scope IS NOT NEW.source_scope;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'squadre_alias', NEW.id, 'U', OLD.source, NEW.source
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.source IS NOT NEW.source;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'squadre_alias', NEW.id, 'U', OLD.confidence, NEW.confidence
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.confidence IS NOT NEW.confidence;
END;

CREATE TRIGGER IF NOT EXISTS audit_foto_insert
AFTER INSERT ON foto
BEGIN
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'foto', NEW.id, 'I', NULL,
         json_object('id', NEW.id, 'percorso_file', NEW.percorso_file, 'didascalia', NEW.didascalia, 'fonte', NEW.fonte, 'data_scatto', NEW.data_scatto, 'data_raccolta', NEW.data_raccolta, 'documento_id', NEW.documento_id, 'note', NEW.note)
  FROM audit_ctx ctx WHERE ctx.id = 1;
END;

CREATE TRIGGER IF NOT EXISTS audit_foto_delete
AFTER DELETE ON foto
BEGIN
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'foto', OLD.id, 'D',
         json_object('id', OLD.id, 'percorso_file', OLD.percorso_file, 'didascalia', OLD.didascalia, 'fonte', OLD.fonte, 'data_scatto', OLD.data_scatto, 'data_raccolta', OLD.data_raccolta, 'documento_id', OLD.documento_id, 'note', OLD.note),
         NULL
  FROM audit_ctx ctx WHERE ctx.id = 1;
END;

CREATE TRIGGER IF NOT EXISTS audit_foto_update
AFTER UPDATE ON foto
BEGIN
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'foto', NEW.id, 'U', OLD.percorso_file, NEW.percorso_file
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.percorso_file IS NOT NEW.percorso_file;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'foto', NEW.id, 'U', OLD.didascalia, NEW.didascalia
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.didascalia IS NOT NEW.didascalia;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'foto', NEW.id, 'U', OLD.fonte, NEW.fonte
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.fonte IS NOT NEW.fonte;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'foto', NEW.id, 'U', OLD.data_scatto, NEW.data_scatto
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.data_scatto IS NOT NEW.data_scatto;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'foto', NEW.id, 'U', OLD.data_raccolta, NEW.data_raccolta
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.data_raccolta IS NOT NEW.data_raccolta;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'foto', NEW.id, 'U', OLD.documento_id, NEW.documento_id
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.documento_id IS NOT NEW.documento_id;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'foto', NEW.id, 'U', OLD.note, NEW.note
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.note IS NOT NEW.note;
END;

CREATE TRIGGER IF NOT EXISTS audit_documenti_insert
AFTER INSERT ON documenti
BEGIN
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'documenti', NEW.id, 'I', NULL,
         json_object('id', NEW.id, 'titolo', NEW.titolo, 'testo_completo', NEW.testo_completo, 'fonte', NEW.fonte, 'url', NEW.url, 'data_raccolta', NEW.data_raccolta, 'tipo', NEW.tipo, 'confidence', NEW.confidence, 'collector', NEW.collector, 'note', NEW.note, 'updated_at', NEW.updated_at)
  FROM audit_ctx ctx WHERE ctx.id = 1;
END;

CREATE TRIGGER IF NOT EXISTS audit_documenti_delete
AFTER DELETE ON documenti
BEGIN
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'documenti', OLD.id, 'D',
         json_object('id', OLD.id, 'titolo', OLD.titolo, 'testo_completo', OLD.testo_completo, 'fonte', OLD.fonte, 'url', OLD.url, 'data_raccolta', OLD.data_raccolta, 'tipo', OLD.tipo, 'confidence', OLD.confidence, 'collector', OLD.collector, 'note', OLD.note, 'updated_at', OLD.updated_at),
         NULL
  FROM audit_ctx ctx WHERE ctx.id = 1;
END;

CREATE TRIGGER IF NOT EXISTS audit_documenti_update
AFTER UPDATE ON documenti
BEGIN
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'documenti', NEW.id, 'U', OLD.titolo, NEW.titolo
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.titolo IS NOT NEW.titolo;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'documenti', NEW.id, 'U', OLD.testo_completo, NEW.testo_completo
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.testo_completo IS NOT NEW.testo_completo;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'documenti', NEW.id, 'U', OLD.fonte, NEW.fonte
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.fonte IS NOT NEW.fonte;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'documenti', NEW.id, 'U', OLD.url, NEW.url
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.url IS NOT NEW.url;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'documenti', NEW.id, 'U', OLD.data_raccolta, NEW.data_raccolta
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.data_raccolta IS NOT NEW.data_raccolta;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'documenti', NEW.id, 'U', OLD.tipo, NEW.tipo
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.tipo IS NOT NEW.tipo;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'documenti', NEW.id, 'U', OLD.confidence, NEW.confidence
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.confidence IS NOT NEW.confidence;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'documenti', NEW.id, 'U', OLD.collector, NEW.collector
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.collector IS NOT NEW.collector;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'documenti', NEW.id, 'U', OLD.note, NEW.note
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.note IS NOT NEW.note;
  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, valore_precedente, valore_nuovo)
  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, 'documenti', NEW.id, 'U', OLD.updated_at, NEW.updated_at
  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.updated_at IS NOT NEW.updated_at;
END;

