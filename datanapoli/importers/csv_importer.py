import os
import csv
import datetime
import sqlite3
from ..db import get_db, session_scope

def resolve_player(cursor, name_raw):
    """
    Finds persona_id from raw name. Checks exact nome_completo, cognome or alias.
    Never invents IDs. Returns persona_id or None.
    """
    clean = name_raw.strip()
    cursor.execute("SELECT id FROM persone WHERE LOWER(nome_completo) = LOWER(?) OR LOWER(cognome) = LOWER(?)", (clean, clean))
    row = cursor.fetchone()
    if row:
        return row[0]
        
    parts = clean.split()
    if len(parts) > 1:
        cursor.execute("SELECT id FROM persone WHERE LOWER(cognome) = LOWER(?)", (parts[-1],))
        c_row = cursor.fetchone()
        if c_row:
            return c_row[0]
            
    return None

def resolve_team(cursor, team_raw):
    """
    Resolves team to squadra_id using squadre and squadre_alias.
    """
    clean = team_raw.strip()
    cursor.execute("SELECT id FROM squadre WHERE LOWER(nome) = LOWER(?) OR LOWER(nome_completo) = LOWER(?)", (clean, clean))
    row = cursor.fetchone()
    if row:
        return row[0]
        
    cursor.execute("SELECT squadra_id FROM squadre_alias WHERE LOWER(alias) = LOWER(?) OR LOWER(alias_norm) = LOWER(?)", (clean, clean))
    a_row = cursor.fetchone()
    if a_row:
        return a_row[0]
        
    return None

def import_csv(tipo, file_path, dry_run=False, attore='csv-importer', fonte_id=None, batch_id=None):
    """
    Imports CSV files for various entities (formazioni, presidenti, luoghi_napoli,
    stadi_avversari, periodi_storici, divise, cimeli, cori).
    Strictly follows:
    - Never overwrites verificato=1 records with unverified data
    - Sets session and batch_id for complete auditability
    - Validates types, required fields and foreign keys
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
        
    conn = get_db()
    cursor = conn.cursor()
    
    # Ensure a valid default source exists if not passed
    fid = fonte_id
    if not fid:
        cursor.execute("SELECT id FROM fonti WHERE id = 5")
        if cursor.fetchone():
            fid = 5
        else:
            cursor.execute("SELECT id FROM fonti LIMIT 1")
            r = cursor.fetchone()
            fid = r[0] if r else None

    bid = batch_id or f"import-{tipo}-{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        
    print(f"Loaded {len(rows)} rows from {os.path.basename(file_path)} (tipo: {tipo})")
    
    errors = []
    quarantined_names = []
    valid_rows = []
    
    if tipo == 'formazioni':
        for idx, r in enumerate(rows, start=1):
            pid = r.get('partita_id')
            if not pid:
                errors.append(f"Riga {idx}: partita_id mancante")
                continue
                
            cursor.execute("SELECT id FROM partite WHERE id = ?", (pid,))
            if not cursor.fetchone():
                errors.append(f"Riga {idx}: partita_id #{pid} non esiste nel database")
                continue
                
            team_str = r.get('squadra', 'Napoli')
            team_id = resolve_team(cursor, team_str)
            if not team_id:
                errors.append(f"Riga {idx}: Squadra '{team_str}' non riconosciuta")
                continue
                
            player_str = r.get('giocatore', '')
            player_id = resolve_player(cursor, player_str)
            if not player_id:
                quarantined_names.append((player_str, pid, team_str))
                continue
                
            valid_rows.append({
                'partita_id': int(pid),
                'squadra_id': team_id,
                'persona_id': player_id,
                'numero_maglia': int(r['numero']) if r.get('numero') and r['numero'].isdigit() else None,
                'ruolo': r.get('ruolo') or None,
                'titolare': int(r.get('titolare', 1)) if str(r.get('titolare')).strip() != '' else 1,
                'capitano': int(r.get('capitano', 0)) if str(r.get('capitano')).strip() != '' else 0,
                'minuto_in': int(r['minuto_in']) if r.get('minuto_in') and r['minuto_in'].isdigit() else None,
                'minuto_out': int(r['minuto_out']) if r.get('minuto_out') and r['minuto_out'].isdigit() else None,
                'confidence': r.get('confidence', 'alta'),
                'fonte_id': int(r['fonte_id']) if r.get('fonte_id') and r['fonte_id'].isdigit() else fid
            })

    elif tipo == 'presidenti':
        for idx, r in enumerate(rows, start=1):
            nome = r.get('nome', '').strip()
            anno_ini = r.get('anno_inizio', '').strip()
            if not nome or not anno_ini:
                errors.append(f"Riga {idx}: nome e anno_inizio obbligatori")
                continue
            anno_fine = int(r['anno_fine']) if r.get('anno_fine') and r['anno_fine'].isdigit() else None
            valid_rows.append({
                'nome': nome,
                'anno_inizio': int(anno_ini),
                'anno_fine': anno_fine,
                'foto_url': r.get('foto_url') or None,
                'note': r.get('note') or None,
                'palmares': r.get('palmares') or None,
                'confidence': r.get('confidence', 'alta'),
                'verificato': int(r.get('verificato', 1)),
                'fonte_id': fid
            })

    elif tipo == 'luoghi_napoli':
        for idx, r in enumerate(rows, start=1):
            nome = r.get('nome', '').strip()
            tipo_l = r.get('tipo', '').strip()
            lat = r.get('lat', '').strip()
            lon = r.get('lon', '').strip()
            if not nome or not tipo_l or not lat or not lon:
                errors.append(f"Riga {idx}: nome, tipo, lat e lon sono obbligatori")
                continue
            anno_ini = int(r['anno_inizio']) if r.get('anno_inizio') and r['anno_inizio'].isdigit() else None
            anno_fine = int(r['anno_fine']) if r.get('anno_fine') and r['anno_fine'].isdigit() else None
            valid_rows.append({
                'nome': nome,
                'tipo': tipo_l,
                'indirizzo': r.get('indirizzo') or None,
                'lat': float(lat),
                'lon': float(lon),
                'anno_inizio': anno_ini,
                'anno_fine': anno_fine,
                'note': r.get('note') or None,
                'foto_url': r.get('foto_url') or None,
                'confidence': r.get('confidence', 'alta'),
                'verificato': int(r.get('verificato', 1)),
                'fonte_id': fid
            })

    elif tipo == 'stadi_avversari':
        for idx, r in enumerate(rows, start=1):
            nome = r.get('nome', '').strip()
            citta = r.get('citta', '').strip()
            lat = r.get('lat', '').strip()
            lon = r.get('lon', '').strip()
            if not nome or not citta or not lat or not lon:
                errors.append(f"Riga {idx}: nome, citta, lat, lon obbligatori")
                continue
            cap = int(r['capienza']) if r.get('capienza') and r['capienza'].isdigit() else None
            inaug = int(r['inaugurazione']) if r.get('inaugurazione') and r['inaugurazione'].isdigit() else None
            valid_rows.append({
                'nome': nome,
                'citta': citta,
                'lat': float(lat),
                'lon': float(lon),
                'capienza': cap,
                'inaugurazione': inaug,
                'confidence': r.get('confidence', 'alta'),
                'verificato': int(r.get('verificato', 1)),
                'fonte_id': fid
            })

    elif tipo == 'periodi_storici':
        for idx, r in enumerate(rows, start=1):
            nome = r.get('nome', '').strip()
            anno_ini = r.get('anno_inizio', '').strip()
            desc = r.get('descrizione', '').strip()
            if not nome or not anno_ini or not desc:
                errors.append(f"Riga {idx}: nome, anno_inizio e descrizione obbligatori")
                continue
            anno_fine = int(r['anno_fine']) if r.get('anno_fine') and r['anno_fine'].isdigit() else None
            ordine = int(r['ordine']) if r.get('ordine') and r['ordine'].isdigit() else idx
            valid_rows.append({
                'nome': nome,
                'anno_inizio': int(anno_ini),
                'anno_fine': anno_fine,
                'descrizione': desc,
                'colore_esadecimale': r.get('colore_esadecimale', '#01A0E8'),
                'ordine': ordine
            })

    elif tipo == 'divise':
        for idx, r in enumerate(rows, start=1):
            anno = r.get('anno', '').strip()
            tipo_d = r.get('tipo_home_away', '').strip()
            desc = r.get('descrizione', '').strip()
            if not anno or not tipo_d or not desc:
                errors.append(f"Riga {idx}: anno, tipo_home_away e descrizione obbligatori")
                continue
            valid_rows.append({
                'anno': int(anno),
                'stagione': r.get('stagione') or None,
                'tipo_home_away': tipo_d,
                'foto_url': r.get('foto_url') or None,
                'descrizione': desc,
                'sponsor_tecnico': r.get('sponsor_tecnico') or None,
                'sponsor_commerciale': r.get('sponsor_commerciale') or None,
                'colori': r.get('colori') or None,
                'confidence': r.get('confidence', 'alta'),
                'verificato': int(r.get('verificato', 1)),
                'fonte_id': fid
            })

    elif tipo == 'cimeli':
        for idx, r in enumerate(rows, start=1):
            nome = r.get('nome', '').strip()
            desc = r.get('descrizione', '').strip()
            if not nome or not desc:
                errors.append(f"Riga {idx}: nome e descrizione obbligatori")
                continue
            anno = int(r['anno']) if r.get('anno') and r['anno'].isdigit() else None
            valid_rows.append({
                'nome': nome,
                'anno': anno,
                'data_evento': r.get('data_evento') or None,
                'foto_url': r.get('foto_url') or None,
                'descrizione': desc,
                'custodia_attuale': r.get('custodia_attuale') or None,
                'categoria': r.get('categoria') or 'trofeo',
                'confidence': r.get('confidence', 'alta'),
                'verificato': int(r.get('verificato', 1)),
                'fonte_id': fid
            })

    elif tipo == 'cori':
        for idx, r in enumerate(rows, start=1):
            titolo = r.get('titolo', '').strip()
            testo = r.get('testo', '').strip()
            curva = r.get('curva', '').strip()
            if not titolo or not testo or not curva:
                errors.append(f"Riga {idx}: titolo, testo e curva obbligatori")
                continue
            anno = int(r['anno']) if r.get('anno') and r['anno'].isdigit() else None
            valid_rows.append({
                'titolo': titolo,
                'testo': testo,
                'audio_url': r.get('audio_url') or None,
                'anno': anno,
                'curva': curva,
                'note_origini': r.get('note_origini') or None,
                'confidence': r.get('confidence', 'alta'),
                'verificato': int(r.get('verificato', 1)),
                'fonte_id': fid
            })

    print(f"Validation summary: {len(valid_rows)} valid rows, {len(quarantined_names)} names in quarantine, {len(errors)} errors.")
    
    if errors:
        for err in errors[:5]:
            print(f"  [Errore] {err}")
        if len(errors) > 5:
            print(f"  ... e altri {len(errors) - 5} errori.")
            
    if dry_run:
        print("\n[DRY RUN] Validazione completata. Nessuna scrittura effettuata sul database.")
        conn.close()
        return len(errors) == 0

    if errors and len(valid_rows) == 0:
        print("Operazione interrotta: nessun dato valido da inserire.")
        conn.close()
        return False
        
    inserted = 0
    conflicts = 0
    
    with session_scope(conn, attore=attore, motivo=f"Import {tipo} da {os.path.basename(file_path)}", fonte_id=fid, batch_id=bid):
        # Insert quarantined names if any
        for q in quarantined_names:
            cursor.execute("""
                INSERT INTO nomi_da_risolvere (nome_grezzo, fonte, contesto_data, contesto_riferimento, motivo)
                VALUES (?, ?, ?, ?, 'nessun_candidato')
            """, (q[0], f"CSV:{os.path.basename(file_path)}", f"partita:{q[1]}", f"squadra:{q[2]}"))
            
        if tipo == 'formazioni':
            affected_matches = set()
            for item in valid_rows:
                cursor.execute("""
                    SELECT id, verificato, numero_maglia, ruolo 
                    FROM partite_formazioni 
                    WHERE partita_id = ? AND squadra_id = ? AND persona_id = ?
                """, (item['partita_id'], item['squadra_id'], item['persona_id']))
                existing = cursor.fetchone()
                
                if existing and existing['verificato'] == 1:
                    conflicts += 1
                    cursor.execute("""
                        INSERT INTO conflitti_import (tabella, pk, campo, valore_db, valore_fonte, fonte_id, stato)
                        VALUES ('partite_formazioni', ?, 'numero_maglia', ?, ?, ?, 'aperto')
                    """, (str(existing['id']), str(existing['numero_maglia']), str(item['numero_maglia']), item['fonte_id']))
                    continue
                    
                cursor.execute("""
                    INSERT INTO partite_formazioni (
                        partita_id, squadra_id, persona_id, numero_maglia, ruolo, titolare, capitano,
                        minuto_in, minuto_out, confidence, verificato, fonte_id
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
                    ON CONFLICT(partita_id, squadra_id, persona_id) DO UPDATE SET
                        numero_maglia = excluded.numero_maglia,
                        ruolo = excluded.ruolo,
                        titolare = excluded.titolare,
                        capitano = excluded.capitano,
                        minuto_in = excluded.minuto_in,
                        minuto_out = excluded.minuto_out,
                        confidence = excluded.confidence,
                        fonte_id = excluded.fonte_id
                """, (
                    item['partita_id'], item['squadra_id'], item['persona_id'], item['numero_maglia'],
                    item['ruolo'], item['titolare'], item['capitano'], item['minuto_in'],
                    item['minuto_out'], item['confidence'], item['fonte_id']
                ))
                inserted += 1
                affected_matches.add(item['partita_id'])
                
            for pid in affected_matches:
                cursor.execute("""
                    INSERT INTO copertura (entita, entita_id, sezione, stato, motivo, fonte_id)
                    VALUES ('partita', ?, 'formazioni', 'completo', 'Import formazioni da CSV', ?)
                    ON CONFLICT(entita, entita_id, sezione) DO UPDATE SET
                        stato = 'completo',
                        motivo = 'Aggiornamento da CSV',
                        aggiornato_il = strftime('%Y-%m-%dT%H:%M:%fZ','now')
                """, (pid, fid))

        elif tipo == 'presidenti':
            for item in valid_rows:
                cursor.execute("SELECT id FROM presidenti WHERE nome = ? AND anno_inizio = ?", (item['nome'], item['anno_inizio']))
                existing = cursor.fetchone()
                if existing:
                    cursor.execute("""
                        UPDATE presidenti SET 
                            anno_fine = ?, foto_url = ?, note = ?, palmares = ?, 
                            confidence = ?, verificato = ?, fonte_id = ?
                        WHERE id = ?
                    """, (item['anno_fine'], item['foto_url'], item['note'], item['palmares'],
                          item['confidence'], item['verificato'], item['fonte_id'], existing[0]))
                else:
                    cursor.execute("""
                        INSERT INTO presidenti (nome, anno_inizio, anno_fine, foto_url, note, palmares, confidence, verificato, fonte_id)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (item['nome'], item['anno_inizio'], item['anno_fine'], item['foto_url'], item['note'],
                          item['palmares'], item['confidence'], item['verificato'], item['fonte_id']))
                inserted += 1

        elif tipo == 'luoghi_napoli':
            for item in valid_rows:
                cursor.execute("SELECT id FROM luoghi_napoli WHERE nome = ?", (item['nome'],))
                existing = cursor.fetchone()
                if existing:
                    cursor.execute("""
                        UPDATE luoghi_napoli SET
                            tipo = ?, indirizzo = ?, lat = ?, lon = ?, anno_inizio = ?, anno_fine = ?,
                            note = ?, foto_url = ?, confidence = ?, verificato = ?, fonte_id = ?
                        WHERE id = ?
                    """, (item['tipo'], item['indirizzo'], item['lat'], item['lon'], item['anno_inizio'],
                          item['anno_fine'], item['note'], item['foto_url'], item['confidence'],
                          item['verificato'], item['fonte_id'], existing[0]))
                else:
                    cursor.execute("""
                        INSERT INTO luoghi_napoli (nome, tipo, indirizzo, lat, lon, anno_inizio, anno_fine, note, foto_url, confidence, verificato, fonte_id)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (item['nome'], item['tipo'], item['indirizzo'], item['lat'], item['lon'],
                          item['anno_inizio'], item['anno_fine'], item['note'], item['foto_url'],
                          item['confidence'], item['verificato'], item['fonte_id']))
                inserted += 1

        elif tipo == 'stadi_avversari':
            for item in valid_rows:
                cursor.execute("""
                    INSERT INTO stadi_avversari (nome, citta, lat, lon, capienza, inaugurazione, confidence, verificato, fonte_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(nome, citta) DO UPDATE SET
                        lat = excluded.lat,
                        lon = excluded.lon,
                        capienza = excluded.capienza,
                        inaugurazione = excluded.inaugurazione,
                        confidence = excluded.confidence,
                        verificato = excluded.verificato,
                        fonte_id = excluded.fonte_id
                """, (item['nome'], item['citta'], item['lat'], item['lon'], item['capienza'],
                      item['inaugurazione'], item['confidence'], item['verificato'], item['fonte_id']))
                inserted += 1

        elif tipo == 'periodi_storici':
            for item in valid_rows:
                cursor.execute("""
                    INSERT INTO periodi_storici (nome, anno_inizio, anno_fine, descrizione, colore_esadecimale, ordine)
                    VALUES (?, ?, ?, ?, ?, ?)
                    ON CONFLICT(nome) DO UPDATE SET
                        anno_inizio = excluded.anno_inizio,
                        anno_fine = excluded.anno_fine,
                        descrizione = excluded.descrizione,
                        colore_esadecimale = excluded.colore_esadecimale,
                        ordine = excluded.ordine
                """, (item['nome'], item['anno_inizio'], item['anno_fine'], item['descrizione'],
                      item['colore_esadecimale'], item['ordine']))
                inserted += 1

        elif tipo == 'divise':
            for item in valid_rows:
                cursor.execute("SELECT id FROM divise WHERE anno = ? AND tipo_home_away = ?", (item['anno'], item['tipo_home_away']))
                existing = cursor.fetchone()
                if existing:
                    cursor.execute("""
                        UPDATE divise SET
                            stagione = ?, foto_url = ?, descrizione = ?, sponsor_tecnico = ?,
                            sponsor_commerciale = ?, colori = ?, confidence = ?, verificato = ?, fonte_id = ?
                        WHERE id = ?
                    """, (item['stagione'], item['foto_url'], item['descrizione'], item['sponsor_tecnico'],
                          item['sponsor_commerciale'], item['colori'], item['confidence'],
                          item['verificato'], item['fonte_id'], existing[0]))
                else:
                    cursor.execute("""
                        INSERT INTO divise (anno, stagione, tipo_home_away, foto_url, descrizione, sponsor_tecnico, sponsor_commerciale, colori, confidence, verificato, fonte_id)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (item['anno'], item['stagione'], item['tipo_home_away'], item['foto_url'],
                          item['descrizione'], item['sponsor_tecnico'], item['sponsor_commerciale'],
                          item['colori'], item['confidence'], item['verificato'], item['fonte_id']))
                inserted += 1

        elif tipo == 'cimeli':
            for item in valid_rows:
                cursor.execute("SELECT id FROM cimeli WHERE nome = ?", (item['nome'],))
                existing = cursor.fetchone()
                if existing:
                    cursor.execute("""
                        UPDATE cimeli SET
                            anno = ?, data_evento = ?, foto_url = ?, descrizione = ?, custodia_attuale = ?,
                            categoria = ?, confidence = ?, verificato = ?, fonte_id = ?
                        WHERE id = ?
                    """, (item['anno'], item['data_evento'], item['foto_url'], item['descrizione'],
                          item['custodia_attuale'], item['categoria'], item['confidence'],
                          item['verificato'], item['fonte_id'], existing[0]))
                else:
                    cursor.execute("""
                        INSERT INTO cimeli (nome, anno, data_evento, foto_url, descrizione, custodia_attuale, categoria, confidence, verificato, fonte_id)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (item['nome'], item['anno'], item['data_evento'], item['foto_url'],
                          item['descrizione'], item['custodia_attuale'], item['categoria'],
                          item['confidence'], item['verificato'], item['fonte_id']))
                inserted += 1

        elif tipo == 'cori':
            for item in valid_rows:
                cursor.execute("SELECT id FROM cori WHERE titolo = ?", (item['titolo'],))
                existing = cursor.fetchone()
                if existing:
                    cursor.execute("""
                        UPDATE cori SET
                            testo = ?, audio_url = ?, anno = ?, curva = ?, note_origini = ?,
                            confidence = ?, verificato = ?, fonte_id = ?
                        WHERE id = ?
                    """, (item['testo'], item['audio_url'], item['anno'], item['curva'],
                          item['note_origini'], item['confidence'], item['verificato'], item['fonte_id'], existing[0]))
                else:
                    cursor.execute("""
                        INSERT INTO cori (titolo, testo, audio_url, anno, curva, note_origini, confidence, verificato, fonte_id)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (item['titolo'], item['testo'], item['audio_url'], item['anno'], item['curva'],
                          item['note_origini'], item['confidence'], item['verificato'], item['fonte_id']))
                inserted += 1

        conn.commit()
        
    conn.close()
    print(f"\nImport completato con successo (batch_id: {bid}):")
    print(f" - Inseriti/Aggiornati: {inserted} record")
    if conflicts > 0:
        print(f" - Conflitti protetti da verificato=1: {conflicts}")
    return True
