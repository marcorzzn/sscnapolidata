import os
import csv
import sqlite3
import re
import traceback
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'db', 'datanapoli.sqlite')
CSV_PATH = sys.argv[1] if len(sys.argv) > 1 else os.path.join(BASE_DIR, 'data', 'import', 'esempio.csv')

sys.path.append(BASE_DIR)
import importlib.util
spec = importlib.util.spec_from_file_location("resolve_names", os.path.join(BASE_DIR, "scripts", "65_resolve_names.py"))
resolve_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(resolve_module)
resolve = resolve_module.resolve

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def parse_season(season_str):
    parts = season_str.split('-')
    if len(parts) == 2:
        start = int(parts[0])
        end_short = int(parts[1])
        century = (start // 100) * 100
        end = century + end_short
        if end < start:
            end += 100
        return start, end
    return None, None

def get_or_create_season(cursor, season_str):
    cursor.execute("SELECT id FROM stagioni WHERE nome = ?", (season_str,))
    row = cursor.fetchone()
    if row: return row['id']
    start, end = parse_season(season_str)
    cursor.execute("INSERT INTO stagioni (nome, anno_inizio, anno_fine) VALUES (?, ?, ?)", (season_str, start, end))
    return cursor.lastrowid

def get_or_create_competition(cursor, name):
    cursor.execute("SELECT id FROM competizioni WHERE nome = ?", (name,))
    row = cursor.fetchone()
    if row: return row['id']
    cursor.execute("INSERT INTO competizioni (nome) VALUES (?)", (name,))
    return cursor.lastrowid

def get_or_create_person(cursor, cognome, context_list):
    cursor.execute("SELECT id FROM persone WHERE LOWER(cognome) = LOWER(?)", (cognome,))
    rows = cursor.fetchall()
    if rows:
        return rows[0]['id']
    cursor.execute("INSERT INTO persone (nome_completo, cognome) VALUES (?, ?)", (cognome.capitalize(), cognome.capitalize()))
    context_list.append(cognome)
    return cursor.lastrowid

def process_bulk_csv(csv_path):
    conn = get_db()
    cursor = conn.cursor()
    
    stats = {
        'imported': 0,
        'updated': 0,
        'scorers': 0,
        'persons_created': [],
        'quarantena': 0,
        'errors': []
    }
    
    try:
        with open(csv_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            line_idx = 1
            for row in reader:
                line_idx += 1
                try:
                    match_id = row['match_id'].strip()
                    if not match_id: continue
                    
                    match_date = row['date'].strip()
                    home_raw = row['home_raw_name'].strip()
                    away_raw = row['away_raw_name'].strip()
                    comp_name = row['competition'].strip()
                    
                    home_id, home_method, home_score = resolve(cursor, home_raw, 'bulk_csv', match_date, comp_name)
                    away_id, away_method, away_score = resolve(cursor, away_raw, 'bulk_csv', match_date, comp_name)
                    
                    if not home_id or not away_id:
                        stats['quarantena'] += 1
                        continue
                        
                    stagione_id = get_or_create_season(cursor, row['season'].strip())
                    comp_id = get_or_create_competition(cursor, comp_name)
                    
                    cursor.execute("SELECT id FROM partite WHERE match_id = ?", (match_id,))
                    existing = cursor.fetchone()
                    
                    home_goals = int(row['home_goals']) if row['home_goals'].strip() else None
                    away_goals = int(row['away_goals']) if row['away_goals'].strip() else None
                    stadio = row['stadium'].strip() if row['stadium'].strip() else None
                    affluenza = int(row['attendance'].replace('\xa0', '').replace(' ', '').replace('.', '')) if row.get('attendance') and row['attendance'].strip() else None
                    note = row['notes'].strip() if row['notes'].strip() else None
                    
                    partita_id = None
                    if existing:
                        partita_id = existing['id']
                        cursor.execute('''
                            UPDATE partite 
                            SET data=?, stagione_id=?, competizione_id=?, squadra_casa_id=?, squadra_trasferta_id=?,
                                gol_casa=?, gol_trasferta=?, stadio=?, affluenza=?, note=?,
                                home_raw_name=?, away_raw_name=?
                            WHERE id=?
                        ''', (match_date, stagione_id, comp_id, home_id, away_id, home_goals, away_goals, stadio, affluenza, note, home_raw, away_raw, partita_id))
                        stats['updated'] += 1
                        cursor.execute("DELETE FROM marcatori WHERE partita_id = ?", (partita_id,))
                    else:
                        cursor.execute('''
                            INSERT INTO partite (match_id, slug, data, stagione_id, competizione_id, squadra_casa_id, squadra_trasferta_id,
                                                 gol_casa, gol_trasferta, stadio, affluenza, note, home_raw_name, away_raw_name)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ''', (match_id, match_id.lower(), match_date, stagione_id, comp_id, home_id, away_id,
                              home_goals, away_goals, stadio, affluenza, note, home_raw, away_raw))
                        partita_id = cursor.lastrowid
                        stats['imported'] += 1
                        
                    # Save resolution log
                    cursor.execute("INSERT INTO risoluzione_nomi (partita_id, lato, nome_grezzo, fonte, squadra_id, metodo, punteggio) VALUES (?, ?, ?, ?, ?, ?, ?)",
                                   (partita_id, 'casa', home_raw, 'bulk_csv', home_id, home_method, home_score))
                    cursor.execute("INSERT INTO risoluzione_nomi (partita_id, lato, nome_grezzo, fonte, squadra_id, metodo, punteggio) VALUES (?, ?, ?, ?, ?, ?, ?)",
                                   (partita_id, 'trasferta', away_raw, 'bulk_csv', away_id, away_method, away_score))
                        
                    def parse_scorers(scorers_str, squadra_id):
                        if not scorers_str: return
                        parts = [s.strip() for s in scorers_str.split(',') if s.strip()]
                        last_name = None
                        for part in parts:
                            m1 = re.match(r"^(.*?)\s+(\d+)(?:['′’]+)?\s*(\(.*?\))?$", part)
                            m2 = re.match(r"^(\d+)(?:['′’]+)?\s*(?:\((.*?)\))?\s*(.*?)$", part)
                            m3 = re.match(r"^(\d+)(?:['′’]+)?$", part)
                            
                            name = None
                            minute = None
                            tipo = 'gol'
                            
                            if m1 and m1.group(1).strip() and not m1.group(1).strip().isdigit():
                                name, minute = m1.group(1).strip(), m1.group(2)
                                if m1.group(3): 
                                    tipo = 'autogol' if 'aut' in str(m1.group(3)).lower() else 'rigore' if 'rig' in str(m1.group(3)).lower() else 'gol'
                            elif m2:
                                minute, name = m2.group(1), m2.group(3).strip()
                                if not name:
                                    name = last_name
                                if m2.group(2): 
                                    tipo = 'autogol' if 'aut' in str(m2.group(2)).lower() else 'rigore' if 'rig' in str(m2.group(2)).lower() else 'gol'
                            elif m3:
                                minute = m3.group(1)
                                name = last_name
                            
                            if name and minute:
                                person_id = get_or_create_person(cursor, name, stats['persons_created'])
                                cursor.execute(
                                    "INSERT INTO marcatori (partita_id, persona_id, squadra_id, minuto, tipo) VALUES (?, ?, ?, ?, ?)",
                                    (partita_id, person_id, squadra_id, minute, tipo)
                                )
                                stats['scorers'] += 1
                                last_name = name

                    parse_scorers(row.get('home_scorers', '').strip(), home_id)
                    parse_scorers(row.get('away_scorers', '').strip(), away_id)
                            
                except Exception as e:
                    stats['errors'].append(f"Riga {line_idx}: {str(e)}")
                    
            conn.commit()
    except Exception as e:
        print(f"Errore fatale: {e}")
        traceback.print_exc()
    finally:
        conn.close()
        
    print("--- RIEPILOGO BULK IMPORT ---")
    print(f"Partite importate da zero: {stats['imported']}")
    print(f"Partite aggiornate: {stats['updated']}")
    print(f"Partite in quarantena nomi: {stats['quarantena']}")
    print(f"Marcatori parsati e inseriti: {stats['scorers']}")
    print(f"Persone create ex-novo: {len(stats['persons_created'])}")
    if stats['persons_created']:
        print(f" Nomi: {', '.join(stats['persons_created'])}")
    print(f"Errori: {len(stats['errors'])}")
    for e in stats['errors']:
        print(f" - {e}")

if __name__ == '__main__':
    process_bulk_csv(CSV_PATH)
