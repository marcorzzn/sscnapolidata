import os
import sqlite3
import glob

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'db', 'datanapoli.sqlite')
MIGRATIONS_DIR = os.path.join(BASE_DIR, 'db', 'migrations')

import sys
sys.path.insert(0, os.path.join(BASE_DIR, 'scripts'))
from backup import create_backup

def ensure_schema_migrations_exists(conn):
    conn.execute('''
    CREATE TABLE IF NOT EXISTS schema_migrazioni (
      versione INTEGER PRIMARY KEY,
      nome TEXT NOT NULL,
      applicata_il TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    );
    ''')
    conn.commit()

def apply_migrations():
    conn = sqlite3.connect(DB_PATH)
    ensure_schema_migrations_exists(conn)
    
    # Get applied migrations
    cursor = conn.cursor()
    cursor.execute("SELECT versione FROM schema_migrazioni")
    applied = {row[0] for row in cursor.fetchall()}
    
    # Get available migrations
    migrations = sorted(glob.glob(os.path.join(MIGRATIONS_DIR, '*.sql')))
    
    for mig_path in migrations:
        filename = os.path.basename(mig_path)
        try:
            versione = int(filename.split('_')[0])
        except ValueError:
            continue
            
        if versione not in applied:
            print(f"Applicazione migrazione {filename}...")
            
            # Backup before applying
            create_backup()
            
            with open(mig_path, 'r', encoding='utf-8') as f:
                sql = f.write() if False else f.read()
            
            try:
                # Start transaction explicitly in case we need it, but executescript automatically uses BEGIN
                cursor.executescript('BEGIN;\n' + sql + '\nCOMMIT;')
                
                # Register migration
                cursor.execute("INSERT INTO schema_migrazioni (versione, nome) VALUES (?, ?)", (versione, filename))
                conn.commit()
                print(f"Migrazione {filename} applicata con successo.")
            except Exception as e:
                conn.rollback()
                print(f"Errore nell'applicazione della migrazione {filename}: {e}")
                conn.close()
                sys.exit(1)
                
    conn.close()
    print("Tutte le migrazioni sono state applicate.")

if __name__ == '__main__':
    apply_migrations()
