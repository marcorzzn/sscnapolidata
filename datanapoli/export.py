import os
import json
import math
import sqlite3
from .db import get_db, DB_PATH, ROOT_DIR, DATA_DIR

SAN_PAOLO_LAT = 40.827967
SAN_PAOLO_LON = 14.193008

def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)

def normalize_season(s):
    if s and len(s) == 9 and s[4] == '-':
        return f"{s[:4]}-{s[7:]}"
    return s

def export_site_data(db_path=None, output_path=None, all_matches=False):
    """
    Exports matches and all specialized domain modules (maps, museum, history, chants)
    from SQLite to clean, deterministic JSON files for both data/exports/ and the React Vite web app.
    """
    conn = get_db(db_path)
    cursor = conn.cursor()
    
    exports_dir = os.path.join(DATA_DIR, 'exports')
    public_data_dir = os.path.join(ROOT_DIR, 'public', 'data')
    src_data_dir = os.path.join(ROOT_DIR, 'src', 'data', 'generated')
    
    for d in [exports_dir, public_data_dir, src_data_dir]:
        os.makedirs(d, exist_ok=True)
        
    # =========================================================================
    # 1. MATCHES EXPORT (matches.json)
    # =========================================================================
    where_clause = "" if all_matches else "WHERE p.pubblicata = 1"
    query = f"""
    SELECT 
        p.id,
        p.match_id,
        p.slug,
        p.data AS date,
        st.nome AS season,
        c.nome AS competizione,
        sc.nome AS squadra_casa,
        st_away.nome AS squadra_trasferta,
        p.gol_casa AS home_goals,
        p.gol_trasferta AS away_goals,
        p.stadio,
        p.affluenza,
        p.note,
        p.confidence,
        p.verificato,
        p.latitudine,
        p.longitudine,
        p.id_stadio_avversario
    FROM partite p
    LEFT JOIN stagioni st ON p.stagione_id = st.id
    LEFT JOIN competizioni c ON p.competizione_id = c.id
    LEFT JOIN squadre sc ON p.squadra_casa_id = sc.id
    LEFT JOIN squadre st_away ON p.squadra_trasferta_id = st_away.id
    {where_clause}
    ORDER BY p.data DESC
    """
    cursor.execute(query)
    matches_rows = cursor.fetchall()
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='view' AND name='v_copertura_partite'")
    has_cov_view = cursor.fetchone() is not None
    
    cov_by_match = {}
    if has_cov_view:
        cursor.execute("SELECT partita_id, sezione, stato_effettivo FROM v_copertura_partite")
        for row in cursor.fetchall():
            pid = row['partita_id']
            if pid not in cov_by_match:
                cov_by_match[pid] = {}
            cov_by_match[pid][row['sezione']] = row['stato_effettivo']
            
    export_list = []
    
    for r in matches_rows:
        pid = r['id']
        
        # Scorers
        cursor.execute("""
            SELECT m.minuto, p.nome_completo AS name, s.nome AS team, m.tipo
            FROM marcatori m
            JOIN persone p ON m.persona_id = p.id
            JOIN squadre s ON m.squadra_id = s.id
            WHERE m.partita_id = ?
            ORDER BY m.id
        """, (pid,))
        scorers = [{
            'name': sr['name'],
            'team': sr['team'],
            'minute': sr['minuto'],
            'type': sr['tipo'] or 'gol'
        } for sr in cursor.fetchall()]
            
        # Lineups
        formazioni = []
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='partite_formazioni'")
        if cursor.fetchone():
            cursor.execute("""
                SELECT pf.numero_maglia, pf.ruolo, pf.titolare, pf.capitano, pf.minuto_in, pf.minuto_out,
                       p.nome_completo AS name, s.nome AS team
                FROM partite_formazioni pf
                JOIN persone p ON pf.persona_id = p.id
                JOIN squadre s ON pf.squadra_id = s.id
                WHERE pf.partita_id = ?
                ORDER BY pf.titolare DESC, pf.numero_maglia ASC
            """, (pid,))
            for frow in cursor.fetchall():
                formazioni.append({
                    'name': frow['name'],
                    'team': frow['team'],
                    'number': frow['numero_maglia'],
                    'role': frow['ruolo'],
                    'starter': bool(frow['titolare']),
                    'captain': bool(frow['capitano']),
                    'minute_in': frow['minuto_in'],
                    'minute_out': frow['minuto_out']
                })
                
        # Sources
        cursor.execute("""
            SELECT f.nome 
            FROM partite_fonti pf 
            JOIN fonti f ON pf.fonte_id = f.id 
            WHERE pf.partita_id = ?
            ORDER BY f.nome
        """, (pid,))
        fonti = [fr['nome'] for fr in cursor.fetchall()]
        
        raw_notes = r['note']
        notes_list = [n.strip() for n in raw_notes.split('\n') if n.strip()] if raw_notes else []
        
        match_cov = cov_by_match.get(pid, {
            'marcatori': 'completo' if len(scorers) > 0 or (r['home_goals'] or 0) + (r['away_goals'] or 0) == 0 else 'nd',
            'formazioni': 'completo' if len(formazioni) > 0 else 'pending',
            'arbitro': 'pending',
            'stadio': 'completo' if r['stadio'] else 'pending',
            'affluenza': 'completo' if r['affluenza'] is not None else 'nd',
            'xg': 'na' if r['date'] < '2010-01-01' else 'pending'
        })
        
        match_obj = {
            'id': r['slug'] or r['match_id'] or str(pid),
            'partita_id': pid,
            'match_id': r['match_id'],
            'date': r['date'],
            'season': normalize_season(r['season']),
            'competizione': r['competizione'],
            'squadra_casa': r['squadra_casa'],
            'squadra_trasferta': r['squadra_trasferta'],
            'home_goals': r['home_goals'],
            'away_goals': r['away_goals'],
            'slug': r['slug'],
            'stadio': r['stadio'] if r['stadio'] else None,
            'affluenza': r['affluenza'] if r['affluenza'] is not None else None,
            'latitudine': r['latitudine'],
            'longitudine': r['longitudine'],
            'id_stadio_avversario': r['id_stadio_avversario'],
            'confidence': r['confidence'] or 'media',
            'verificato': bool(r['verificato']),
            'scorers': scorers,
            'formazioni': formazioni,
            'fonti': fonti,
            'note': notes_list,
            'cov': match_cov
        }
        export_list.append(match_obj)
        
    target_matches_file = output_path or os.path.join(DATA_DIR, 'matches.json')
    with open(target_matches_file, 'w', encoding='utf-8') as f:
        json.dump(export_list, f, indent=2, ensure_ascii=False)
        
    public_matches_file = os.path.join(public_data_dir, 'matches.json')
    with open(public_matches_file, 'w', encoding='utf-8') as f:
        json.dump(export_list, f, indent=2, ensure_ascii=False)

    # =========================================================================
    # 2. MAPPA DELLE TRASFERTE (mappe_trasferte.json)
    # =========================================================================
    cursor.execute("""
        SELECT 
            s.id,
            s.nome AS stadio,
            s.citta,
            s.lat,
            s.lon,
            s.capienza,
            s.inaugurazione,
            COUNT(p.id) AS match_count
        FROM stadi_avversari s
        JOIN partite p ON p.id_stadio_avversario = s.id
        GROUP BY s.id
        ORDER BY match_count DESC, s.citta ASC
    """)
    stadi_trasferte_rows = cursor.fetchall()
    
    mappe_trasferte = []
    for s_row in stadi_trasferte_rows:
        s_id = s_row['id']
        lat = s_row['lat']
        lon = s_row['lon']
        distance = haversine_km(SAN_PAOLO_LAT, SAN_PAOLO_LON, lat, lon)
        
        # All matches played at this away stadium
        cursor.execute("""
            SELECT 
                p.id,
                p.data,
                st.nome AS stagione,
                c.nome AS competizione,
                sc.nome AS casa,
                st_away.nome AS trasferta,
                p.gol_casa,
                p.gol_trasferta
            FROM partite p
            LEFT JOIN stagioni st ON p.stagione_id = st.id
            LEFT JOIN competizioni c ON p.competizione_id = c.id
            LEFT JOIN squadre sc ON p.squadra_casa_id = sc.id
            LEFT JOIN squadre st_away ON p.squadra_trasferta_id = st_away.id
            WHERE p.id_stadio_avversario = ?
            ORDER BY p.data ASC
        """, (s_id,))
        partite_stadio = []
        for idx, m in enumerate(cursor.fetchall(), start=1):
            gc = m['gol_casa'] if m['gol_casa'] is not None else 0
            gt = m['gol_trasferta'] if m['gol_trasferta'] is not None else 0
            # Napoli is away
            esito = 'V' if gt > gc else ('N' if gt == gc else 'P')
            anno = int(m['data'][:4]) if m['data'] else None
            partite_stadio.append({
                'id': m['id'],
                'progressivo': idx,
                'data': m['data'],
                'anno': anno,
                'stagione': normalize_season(m['stagione']),
                'competizione': m['competizione'] or 'Serie A',
                'casa': m['casa'],
                'trasferta': m['trasferta'],
                'gol_casa': gc,
                'gol_trasferta': gt,
                'punteggio': f"{gc}-{gt}",
                'esito': esito
            })
            
        mappe_trasferte.append({
            'id': s_id,
            'stadio': s_row['stadio'],
            'citta': s_row['citta'],
            'lat': lat,
            'lon': lon,
            'capienza': s_row['capienza'],
            'inaugurazione': s_row['inaugurazione'],
            'distance_km': distance,
            'count': s_row['match_count'],
            'partite': partite_stadio
        })

    # =========================================================================
    # 3. MAPPA DELLE CASE DEL NAPOLI (mappe_case.json)
    # =========================================================================
    cursor.execute("""
        SELECT id, nome, tipo, indirizzo, lat, lon, anno_inizio, anno_fine, note, foto_url
        FROM luoghi_napoli
        ORDER BY tipo ASC, anno_inizio ASC
    """)
    mappe_case = [{
        'id': lr['id'],
        'nome': lr['nome'],
        'tipo': lr['tipo'],
        'indirizzo': lr['indirizzo'],
        'lat': lr['lat'],
        'lon': lr['lon'],
        'anno_inizio': lr['anno_inizio'],
        'anno_fine': lr['anno_fine'],
        'note': lr['note'],
        'foto_url': lr['foto_url']
    } for lr in cursor.fetchall()]

    # =========================================================================
    # 4. MUSEO E DIVISE (museo.json)
    # =========================================================================
    cursor.execute("""
        SELECT id, nome, anno, data_evento, foto_url, descrizione, custodia_attuale, categoria
        FROM cimeli
        ORDER BY anno ASC, id ASC
    """)
    cimeli_list = [{
        'id': cr['id'],
        'nome': cr['nome'],
        'anno': cr['anno'],
        'data_evento': cr['data_evento'],
        'foto_url': cr['foto_url'],
        'descrizione': cr['descrizione'],
        'custodia_attuale': cr['custodia_attuale'],
        'categoria': cr['categoria']
    } for cr in cursor.fetchall()]

    cursor.execute("""
        SELECT id, anno, stagione, tipo_home_away, foto_url, descrizione, sponsor_tecnico, sponsor_commerciale, colori
        FROM divise
        ORDER BY anno ASC
    """)
    divise_list = [{
        'id': dr['id'],
        'anno': dr['anno'],
        'stagione': dr['stagione'],
        'tipo_home_away': dr['tipo_home_away'],
        'foto_url': dr['foto_url'],
        'descrizione': dr['descrizione'],
        'sponsor_tecnico': dr['sponsor_tecnico'],
        'sponsor_commerciale': dr['sponsor_commerciale'],
        'colori': dr['colori']
    } for dr in cursor.fetchall()]
    
    museo_obj = {
        'cimeli': cimeli_list,
        'divise': divise_list
    }

    # =========================================================================
    # 5. STORIA E PRESIDENTI (storia.json)
    # =========================================================================
    cursor.execute("""
        SELECT id, nome, anno_inizio, anno_fine, descrizione, colore_esadecimale, ordine
        FROM periodi_storici
        ORDER BY ordine ASC, anno_inizio ASC
    """)
    periodi_list = [{
        'id': pr['id'],
        'nome': pr['nome'],
        'anno_inizio': pr['anno_inizio'],
        'anno_fine': pr['anno_fine'],
        'descrizione': pr['descrizione'],
        'colore_esadecimale': pr['colore_esadecimale'],
        'ordine': pr['ordine']
    } for pr in cursor.fetchall()]

    cursor.execute("""
        SELECT id, nome, anno_inizio, anno_fine, foto_url, note, palmares
        FROM presidenti
        ORDER BY anno_inizio ASC, id ASC
    """)
    presidenti_list = [{
        'id': pres['id'],
        'nome': pres['nome'],
        'anno_inizio': pres['anno_inizio'],
        'anno_fine': pres['anno_fine'],
        'foto_url': pres['foto_url'],
        'note': pres['note'],
        'palmares': pres['palmares']
    } for pres in cursor.fetchall()]

    storia_obj = {
        'periodi_storici': periodi_list,
        'presidenti': presidenti_list
    }

    # =========================================================================
    # 6. CORI (cori.json)
    # =========================================================================
    cursor.execute("""
        SELECT id, titolo, testo, audio_url, anno, curva, note_origini
        FROM cori
        ORDER BY curva ASC, anno ASC
    """)
    cori_list = [{
        'id': cr['id'],
        'titolo': cr['titolo'],
        'testo': cr['testo'],
        'audio_url': cr['audio_url'],
        'anno': cr['anno'],
        'curva': cr['curva'],
        'note_origini': cr['note_origini']
    } for cr in cursor.fetchall()]

    # 7. CURIOSITA & LATEST MATCH
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='curiosita'")
    has_curiosita = cursor.fetchone() is not None
    curiosita_list = []
    if has_curiosita:
        cursor.execute("SELECT id, titolo, tag, statistica, descrizione, fonte, anno, hashtag FROM curiosita ORDER BY id ASC")
        curiosita_list = [{
            'id': row['id'],
            'titolo': row['titolo'],
            'tag': row['tag'],
            'statistica': row['statistica'],
            'descrizione': row['descrizione'],
            'fonte': row['fonte'],
            'anno': row['anno'],
            'hashtag': row['hashtag']
        } for row in cursor.fetchall()]

    latest_match = export_list[0] if export_list else None

    # Write all json bundles to data/exports/, public/data/, and src/data/generated/
    file_payloads = {
        'mappe_trasferte.json': mappe_trasferte,
        'mappe_case.json': mappe_case,
        'museo.json': museo_obj,
        'storia.json': storia_obj,
        'cori.json': cori_list,
        'curiosita.json': curiosita_list,
        'latest_match.json': latest_match,
    }

    for fname, payload in file_payloads.items():
        # 1. data/exports/
        with open(os.path.join(exports_dir, fname), 'w', encoding='utf-8') as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)
        # 2. public/data/
        with open(os.path.join(public_data_dir, fname), 'w', encoding='utf-8') as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)
        # 3. src/data/generated/
        with open(os.path.join(src_data_dir, fname), 'w', encoding='utf-8') as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)

    conn.close()
    print("=" * 60)
    print("DATA NAPOLI — EXPORT COMPLETATO CON SUCCESSO")
    print("=" * 60)
    print(f" -> {len(export_list)} partite esportate in matches.json")
    print(f" -> {len(mappe_trasferte)} stadi avversari aggregati in data/exports/mappe_trasferte.json")
    print(f" -> {len(mappe_case)} luoghi storici in data/exports/mappe_case.json")
    print(f" -> {len(cimeli_list)} cimeli e {len(divise_list)} divise in data/exports/museo.json")
    print(f" -> {len(periodi_list)} periodi e {len(presidenti_list)} presidenti in data/exports/storia.json")
    print(f" -> {len(cori_list)} cori in data/exports/cori.json")
    print(f"File sincronizzati in: data/exports/, public/data/, src/data/generated/")
    return {
        'matches': export_list,
        'mappe_trasferte': mappe_trasferte,
        'mappe_case': mappe_case,
        'museo': museo_obj,
        'storia': storia_obj,
        'cori': cori_list
    }
