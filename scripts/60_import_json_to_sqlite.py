import os
import json
import sqlite3

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_DIR = os.path.join(BASE_DIR, 'db')
DATA_DIR = os.path.join(BASE_DIR, 'data')
DB_PATH = os.path.join(DB_DIR, 'datanapoli.sqlite')
SCHEMA_PATH = os.path.join(DB_DIR, 'schema.sql')

# Create DB and apply schema
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()
cursor.execute("PRAGMA foreign_keys = ON;")

with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
    cursor.executescript(f.read())
conn.commit()

stats = {
    'fonti': 0, 'competizioni': 0, 'squadre': 0, 'stagioni': 0,
    'persone': 0, 'partite': 0, 'marcatori': 0, 'presenze': 0,
    'errori': []
}

def split_name(nome_completo):
    parts = nome_completo.split()
    cognome_parts = []
    for p in reversed(parts):
        if not any(c.islower() for c in p) and any(c.isupper() for c in p):
            cognome_parts.insert(0, p)
        else:
            break
    if cognome_parts and len(cognome_parts) < len(parts):
        cognome = " ".join(cognome_parts)
        nome = " ".join(parts[:-len(cognome_parts)])
        return nome, cognome
    return "", ""

# 1. matches.json
try:
    with open(os.path.join(DATA_DIR, 'matches.json'), 'r', encoding='utf-8') as f:
        matches = json.load(f)
    for m in matches:
        for fonte_nome in m.get('fonti', []):
            cursor.execute("INSERT OR IGNORE INTO fonti (nome) VALUES (?)", (fonte_nome,))
            if cursor.rowcount > 0: stats['fonti'] += 1
            
        comp = m.get('competizione')
        comp_id = None
        if comp:
            cursor.execute("INSERT OR IGNORE INTO competizioni (nome) VALUES (?)", (comp,))
            if cursor.rowcount > 0: stats['competizioni'] += 1
            cursor.execute("SELECT id FROM competizioni WHERE nome = ?", (comp,))
            comp_id = cursor.fetchone()[0]
            
        season = m.get('season')
        season_id = None
        if season:
            parts = season.split('-')
            anno_inizio = None
            anno_fine = None
            if len(parts) == 2 and len(parts[0]) == 4 and len(parts[1]) == 2:
                try:
                    anno_inizio = int(parts[0])
                    century = parts[0][:2]
                    anno_fine = int(century + parts[1])
                except:
                    pass
            cursor.execute("INSERT OR IGNORE INTO stagioni (nome, anno_inizio, anno_fine) VALUES (?, ?, ?)", (season, anno_inizio, anno_fine))
            if cursor.rowcount > 0: stats['stagioni'] += 1
            cursor.execute("SELECT id FROM stagioni WHERE nome = ?", (season,))
            season_id = cursor.fetchone()[0]
            
        sq_casa = m.get('squadra_casa')
        sq_trasf = m.get('squadra_trasferta')
        sq_casa_id, sq_trasf_id = None, None
        if sq_casa:
            cursor.execute("INSERT OR IGNORE INTO squadre (nome) VALUES (?)", (sq_casa,))
            if cursor.rowcount > 0: stats['squadre'] += 1
            cursor.execute("SELECT id FROM squadre WHERE nome = ?", (sq_casa,))
            sq_casa_id = cursor.fetchone()[0]
        if sq_trasf:
            cursor.execute("INSERT OR IGNORE INTO squadre (nome) VALUES (?)", (sq_trasf,))
            if cursor.rowcount > 0: stats['squadre'] += 1
            cursor.execute("SELECT id FROM squadre WHERE nome = ?", (sq_trasf,))
            sq_trasf_id = cursor.fetchone()[0]
            
        match_id = m.get('match_id')
        slug = m.get('slug')
        data = m.get('date')
        g_casa = m.get('home_goals')
        g_trasf = m.get('away_goals')
        stadio = m.get('stadio')
        affluenza = m.get('affluenza')
        
        cursor.execute('''
            INSERT INTO partite (match_id, slug, data, stagione_id, competizione_id, squadra_casa_id, squadra_trasferta_id, gol_casa, gol_trasferta, stadio, affluenza)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(match_id) DO UPDATE SET
                slug=excluded.slug,
                data=excluded.data,
                stagione_id=excluded.stagione_id,
                competizione_id=excluded.competizione_id,
                squadra_casa_id=excluded.squadra_casa_id,
                squadra_trasferta_id=excluded.squadra_trasferta_id,
                gol_casa=excluded.gol_casa,
                gol_trasferta=excluded.gol_trasferta,
                stadio=excluded.stadio,
                affluenza=excluded.affluenza
        ''', (match_id, slug, data, season_id, comp_id, sq_casa_id, sq_trasf_id, g_casa, g_trasf, stadio, affluenza))
        if cursor.rowcount > 0: stats['partite'] += 1
        
        cursor.execute("SELECT id FROM partite WHERE match_id = ?", (match_id,))
        partita_id = cursor.fetchone()[0]
        
        for fonte_nome in m.get('fonti', []):
            cursor.execute("SELECT id FROM fonti WHERE nome = ?", (fonte_nome,))
            f_id = cursor.fetchone()[0]
            cursor.execute("INSERT OR IGNORE INTO partite_fonti (partita_id, fonte_id) VALUES (?, ?)", (partita_id, f_id))

except Exception as e:
    stats['errori'].append(f"Errore reading matches.json: {e}")

# 2. master_database_napoli.json
try:
    with open(os.path.join(DATA_DIR, 'master_database_napoli.json'), 'r', encoding='utf-8') as f:
        master = json.load(f)
    for season_data in master:
        season = season_data.get('season')
        if not season: continue
        cursor.execute("SELECT id FROM stagioni WHERE nome = ?", (season,))
        res = cursor.fetchone()
        if not res:
            cursor.execute("INSERT OR IGNORE INTO stagioni (nome) VALUES (?)", (season,))
            season_id = cursor.lastrowid
        else:
            season_id = res[0]
            
        players = season_data.get('matches', []) 
        for p in players:
            raw = p.get('raw_data', {})
            nome_completo = raw.get('Giocatore')
            if not nome_completo: continue
            
            nome, cognome = split_name(nome_completo)
            nazione = raw.get('Nazione')
            data_nascita = raw.get('Data di Nascita')
            luogo = raw.get('Luogo di Nascita')
            ruolo = raw.get('Ruolo')
            
            cursor.execute('''
                INSERT INTO persone (nome_completo, cognome, nome, data_nascita, luogo_nascita, nazionalita, ruolo_principale)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(nome_completo) DO UPDATE SET
                    cognome=excluded.cognome,
                    nome=excluded.nome,
                    data_nascita=excluded.data_nascita,
                    luogo_nascita=excluded.luogo_nascita,
                    nazionalita=excluded.nazionalita,
                    ruolo_principale=excluded.ruolo_principale
            ''', (nome_completo, cognome, nome, data_nascita, luogo, nazione, ruolo))
            if cursor.rowcount > 0: stats['persone'] += 1
            
            cursor.execute("SELECT id FROM persone WHERE nome_completo = ?", (nome_completo,))
            persona_id = cursor.fetchone()[0]
            
            presenze = raw.get('Presenze')
            reti = raw.get('Reti')
            
            cursor.execute('''
                INSERT INTO presenze_stagionali (stagione_id, persona_id, presenze, reti, ruolo)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(stagione_id, persona_id) DO UPDATE SET
                    presenze=excluded.presenze,
                    reti=excluded.reti,
                    ruolo=excluded.ruolo
            ''', (season_id, persona_id, presenze, reti, ruolo))
            if cursor.rowcount > 0: stats['presenze'] += 1

except Exception as e:
    stats['errori'].append(f"Errore reading master database: {e}")

# 3. 20260920-FIO-NAP.json
try:
    filename = '20260920-FIO-NAP.json'
    match_id = filename.replace('.json', '')
    with open(os.path.join(DATA_DIR, filename), 'r', encoding='utf-8') as f:
        single = json.load(f)
        
    cursor.execute("SELECT id FROM partite WHERE match_id = ?", (match_id,))
    res = cursor.fetchone()
    
    slug = single.get('slug')
    stadio = single.get('stadium')
    giornata = single.get('round')
    
    if not res:
        # Partita non presente in matches.json, la creiamo!
        comp = single.get('competition')
        cursor.execute("INSERT OR IGNORE INTO competizioni (nome) VALUES (?)", (comp,))
        cursor.execute("SELECT id FROM competizioni WHERE nome = ?", (comp,))
        comp_id = cursor.fetchone()[0]

        sq_casa = single.get('home_team')
        cursor.execute("INSERT OR IGNORE INTO squadre (nome) VALUES (?)", (sq_casa,))
        cursor.execute("SELECT id FROM squadre WHERE nome = ?", (sq_casa,))
        sq_casa_id = cursor.fetchone()[0]

        sq_trasf = single.get('away_team')
        cursor.execute("INSERT OR IGNORE INTO squadre (nome) VALUES (?)", (sq_trasf,))
        cursor.execute("SELECT id FROM squadre WHERE nome = ?", (sq_trasf,))
        sq_trasf_id = cursor.fetchone()[0]
        
        season_name = '2026-27'
        cursor.execute("INSERT OR IGNORE INTO stagioni (nome, anno_inizio, anno_fine) VALUES (?, ?, ?)", (season_name, 2026, 2027))
        cursor.execute("SELECT id FROM stagioni WHERE nome = ?", (season_name,))
        season_id = cursor.fetchone()[0]

        cursor.execute('''
            INSERT INTO partite (match_id, slug, data, stagione_id, competizione_id, squadra_casa_id, squadra_trasferta_id, gol_casa, gol_trasferta, stadio, giornata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (match_id, slug, single.get('date'), season_id, comp_id, sq_casa_id, sq_trasf_id, single.get('home_goals'), single.get('away_goals'), stadio, giornata))
        stats['partite'] += 1
        cursor.execute("SELECT id FROM partite WHERE match_id = ?", (match_id,))
        partita_id = cursor.fetchone()[0]
    else:
        partita_id = res[0]
        cursor.execute("UPDATE partite SET stadio = ?, giornata = ?, slug = ? WHERE id = ?", (stadio, giornata, slug, partita_id))
        
    # Elimina i vecchi marcatori se per caso eseguiamo lo script due volte
    cursor.execute("DELETE FROM marcatori WHERE partita_id = ?", (partita_id,))
    
    for scorer in single.get('scorers', []):
        s_name = scorer.get('name')
        s_team = scorer.get('team')
        minute = scorer.get('minute')
        
        cursor.execute("SELECT id FROM persone WHERE cognome = ? OR nome_completo LIKE ?", (s_name, f"%{s_name}%"))
        res_p = cursor.fetchone()
        persona_id = res_p[0] if res_p else None
        
        if persona_id is None:
            # Creiamo la persona al volo se non esiste per associare il gol!
            cursor.execute("INSERT INTO persone (nome_completo, cognome) VALUES (?, ?)", (s_name, s_name))
            persona_id = cursor.lastrowid
            stats['persone'] += 1
            
        cursor.execute("SELECT id FROM squadre WHERE nome = ?", (s_team,))
        res_t = cursor.fetchone()
        squadra_id = res_t[0] if res_t else None
        
        cursor.execute('''
            INSERT INTO marcatori (partita_id, persona_id, squadra_id, minuto, tipo)
            VALUES (?, ?, ?, ?, 'gol')
        ''', (partita_id, persona_id, squadra_id, minute))
        stats['marcatori'] += 1
            
except FileNotFoundError:
    pass
except Exception as e:
    stats['errori'].append(f"Errore reading 20260920-FIO-NAP.json: {e}")

conn.commit()
conn.close()

print("--- RIEPILOGO IMPORTAZIONE ---")
for k, v in stats.items():
    if k == 'errori':
        print(f"Errori: {len(v)}")
        for err in v:
            print(" -", err)
    else:
        print(f"{k.capitalize()}: {v}")
