#!/usr/bin/env python3
"""
scripts/seed_storia_geografia.py
Popolamento iniziale e arricchimento dati storici e geografici (FASE 2):
1. Importazione di presidenti, luoghi_napoli, stadi_avversari, periodi_storici, divise, cimeli, cori da CSV.
2. Geolocalizzazione partite: collegamento stadi avversari a partite in trasferta e coordinate a partite in casa.
"""

import os
import sys
import sqlite3

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from datanapoli.db import get_db, session_scope
from datanapoli.importers.csv_importer import import_csv

TEAM_STADIUM_MAP = {
    'Juventus': ('Allianz Stadium', 'Torino'),
    'Torino': ('Stadio Olimpico Grande Torino', 'Torino'),
    'Roma': ('Stadio Olimpico', 'Roma'),
    'Lazio': ('Stadio Olimpico', 'Roma'),
    'Milan': ('Stadio Giuseppe Meazza', 'Milano'),
    'Inter': ('Stadio Giuseppe Meazza', 'Milano'),
    'Ambrosiana': ('Stadio Giuseppe Meazza', 'Milano'),
    'Ambrosiana-Inter': ('Stadio Giuseppe Meazza', 'Milano'),
    'Internazionale': ('Stadio Giuseppe Meazza', 'Milano'),
    'Fiorentina': ('Stadio Artemio Franchi', 'Firenze'),
    'Bologna': ('Stadio Renato Dall\'Ara', 'Bologna'),
    'Genoa': ('Stadio Luigi Ferraris', 'Genova'),
    'Sampdoria': ('Stadio Luigi Ferraris', 'Genova'),
    'Atalanta': ('Gewiss Stadium', 'Bergamo'),
    'Verona': ('Stadio Marcantonio Bentegodi', 'Verona'),
    'Hellas Verona': ('Stadio Marcantonio Bentegodi', 'Verona'),
    'Udinese': ('Bluenergy Stadium', 'Udine'),
    'Cagliari': ('Unipol Domus', 'Cagliari'),
    'Venezia': ('Stadio Pier Luigi Penzo', 'Venezia'),
    'Parma': ('Stadio Ennio Tardini', 'Parma'),
    'Como': ('Stadio Giuseppe Sinigaglia', 'Como'),
    'Lecce': ('Stadio Via del Mare', 'Lecce'),
    'Salernitana': ('Stadio Arechi', 'Salerno'),
    'Sassuolo': ('Mapei Stadium', 'Reggio Emilia'),
    'Reggiana': ('Mapei Stadium', 'Reggio Emilia'),
    'Empoli': ('Stadio Carlo Castellani', 'Empoli'),
    'Cremonese': ('Stadio Giovanni Zini', 'Cremona'),
    'Palermo': ('Stadio Renzo Barbera', 'Palermo'),
    'Brescia': ('Stadio Mario Rigamonti', 'Brescia'),
    'Bari': ('Stadio San Nicola', 'Bari'),
    'Pescara': ('Stadio Adriatico', 'Pescara'),
    'Cesena': ('Orogel Stadium-Dino Manuzzi', 'Cesena'),
    'SPAL': ('Stadio Paolo Mazza', 'Ferrara'),
}

def seed_all():
    print("=== FASE 2: POPOLAMENTO DATI STORICI E GEOGRAFICI ===")
    import_dir = os.path.join(BASE_DIR, 'data', 'import')
    
    entities = [
        ('stadi_avversari', 'stadi_avversari.csv'),
        ('periodi_storici', 'periodi_storici.csv'),
        ('presidenti', 'presidenti.csv'),
        ('luoghi_napoli', 'luoghi_napoli.csv'),
        ('divise', 'divise.csv'),
        ('cimeli', 'cimeli.csv'),
        ('cori', 'cori.csv'),
    ]
    
    for entity, filename in entities:
        path = os.path.join(import_dir, filename)
        if os.path.exists(path):
            print(f"\n--> Importazione {entity} da {filename}...")
            import_csv(entity, path, attore='data-engineer', batch_id=f"seed-{entity}-fase2")
        else:
            print(f"[!] File {path} non trovato, salto.")

    # Geolocalizzazione partite
    conn = get_db()
    cursor = conn.cursor()
    
    print("\n--> Geolocalizzazione partite e associazione stadi avversari...")
    
    # 1. Recupera id degli stadi avversari con coordinate
    cursor.execute("SELECT id, nome, citta, lat, lon FROM stadi_avversari")
    stadi_rows = cursor.fetchall()
    stadi_dict = {(r['nome'], r['citta']): (r['id'], r['lat'], r['lon']) for r in stadi_rows}
    
    linked_away = 0
    with session_scope(conn, attore='data-engineer', motivo='Associazione stadi avversari e geolocalizzazione trasferte', batch_id='seed-geoloc-partite'):
        for team_name, (stadium_name, city) in TEAM_STADIUM_MAP.items():
            if (stadium_name, city) not in stadi_dict:
                continue
            stadio_id, lat, lon = stadi_dict[(stadium_name, city)]
            
            # Trova squadra id
            cursor.execute("SELECT id FROM squadre WHERE LOWER(nome) = LOWER(?)", (team_name,))
            sq_row = cursor.fetchone()
            if not sq_row:
                continue
            sq_id = sq_row[0]
            
            # Aggiorna partite in trasferta
            cursor.execute("""
                UPDATE partite
                SET id_stadio_avversario = ?, latitudine = ?, longitudine = ?
                WHERE squadra_casa_id = ? AND squadra_trasferta_id = 1
            """, (stadio_id, lat, lon, sq_id))
            linked_away += cursor.rowcount
            
        # 2. Geolocalizza partite casalinghe (Stadio Diego Armando Maradona / San Paolo)
        lat_maradona = 40.827967
        lon_maradona = 14.193008
        cursor.execute("""
            UPDATE partite
            SET latitudine = ?, longitudine = ?,
                stadio = COALESCE(stadio, 'Stadio Diego Armando Maradona')
            WHERE squadra_casa_id = 1 AND squadra_trasferta_id != 1
              AND (latitudine IS NULL OR longitudine IS NULL)
        """, (lat_maradona, lon_maradona))
        linked_home = cursor.rowcount
        
        conn.commit()

    conn.close()
    print(f"[OK] Geolocalizzazione completata:")
    print(f"     - Partite in trasferta collegate a stadi avversari: {linked_away}")
    print(f"     - Partite casalinghe geolocalizzate al San Paolo/Maradona: {linked_home}")

if __name__ == '__main__':
    seed_all()
