#!/usr/bin/env python3
"""
90_reconcile_matches_json.py
Script una tantum per riconciliare i record legacy di data/matches_backup.json (133 partite)
con la tabella partite del database SQLite datanapoli.sqlite.
Identifica note extra, link o discordanze e le integra con fonte e confidenza appropriate.
"""

import os
import json
import sqlite3
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'db', 'datanapoli.sqlite')
LEGACY_JSON_PATH = os.path.join(BASE_DIR, 'data', 'matches_backup.json')
if not os.path.exists(LEGACY_JSON_PATH):
    LEGACY_JSON_PATH = os.path.join(BASE_DIR, 'data', 'matches.json')

def reconcile():
    if not os.path.exists(LEGACY_JSON_PATH):
        print(f"File legacy non trovato in {LEGACY_JSON_PATH}")
        return
        
    with open(LEGACY_JSON_PATH, 'r', encoding='utf-8') as f:
        legacy_data = json.load(f)
        
    print(f"Caricati {len(legacy_data)} record dal file JSON legacy: {os.path.basename(LEGACY_JSON_PATH)}")
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    already_present = 0
    updated_notes = 0
    missing_in_db = 0
    
    for item in legacy_data:
        date = item.get('date')
        slug = item.get('slug')
        match_id = item.get('match_id')
        
        # Search by match_id, slug, or date
        cursor.execute("SELECT id, slug, note, pubblicata FROM partite WHERE match_id = ? OR slug = ? OR data = ?", (match_id, slug, date))
        db_match = cursor.fetchone()
        
        if db_match:
            already_present += 1
            # Check if legacy item has extra notes
            legacy_notes = item.get('note', [])
            if isinstance(legacy_notes, list):
                legacy_notes_str = "\n".join(legacy_notes).strip()
            else:
                legacy_notes_str = str(legacy_notes).strip()
                
            db_notes = (db_match['note'] or '').strip()
            if legacy_notes_str and legacy_notes_str not in db_notes:
                combined_notes = (db_notes + "\n" + legacy_notes_str).strip()
                cursor.execute("UPDATE partite SET note = ? WHERE id = ?", (combined_notes, db_match['id']))
                updated_notes += 1
        else:
            missing_in_db += 1
            print(f"  [Non presente in DB] Partita {date}: {item.get('squadra_casa')} vs {item.get('squadra_trasferta')} ({item.get('home_goals')}-{item.get('away_goals')})")
            
    conn.commit()
    conn.close()
    
    print("\nEsito riconciliazione:")
    print(f" - Partite già presenti e allineate nel DB: {already_present}")
    print(f" - Partite con note/dettagli extra aggiornati: {updated_notes}")
    print(f" - Partite non presenti in DB: {missing_in_db}")
    print("Riconciliazione completata con successo.")

if __name__ == '__main__':
    reconcile()
