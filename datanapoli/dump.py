import os
import json
import sqlite3
from .db import get_db, DB_PATH, DUMP_DIR, ROOT_DIR
from .migrate import run_migrations
from .audit import generate_all_triggers_sql

TABLES_ORDER = [
    'fonti',
    'competizioni',
    'squadre',
    'squadre_relazioni',
    'squadre_alias',
    'squadre_id_esterni',
    'stagioni',
    'persone',
    'partite',
    'marcatori',
    'presenze_stagionali',
    'partite_fonti',
    'documenti',
    'foto',
    'partite_documenti',
    'partite_foto',
    'risorse',
    'copertura',
    'copertura_regole',
    'partite_formazioni',
    'partite_eventi',
    'partite_statistiche',
    'nomi_da_risolvere',
    'risoluzione_nomi',
    'stadi_avversari',
    'periodi_storici',
    'presidenti',
    'luoghi_napoli',
    'divise',
    'cimeli',
    'cori'
]

def dump_database(db_path=None, dump_dir=None):
    """
    Exports every table ordered deterministically by primary key to text files in db/dump/.
    Produces stable, git-diff friendly SQL INSERT statements.
    """
    target_dir = dump_dir or DUMP_DIR
    os.makedirs(target_dir, exist_ok=True)
    
    conn = get_db(db_path)
    cursor = conn.cursor()
    
    manifest = {'tables': {}, 'exported_at': None}
    
    # Discover available tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT IN ('audit_log', 'sessione', 'audit_ctx', 'schema_migrazioni', 'documenti_fts', 'documenti_fts_config', 'documenti_fts_data', 'documenti_fts_docsize', 'documenti_fts_idx')")
    available_tables = {r['name'] for r in cursor.fetchall()}
    
    ordered_tables = [t for t in TABLES_ORDER if t in available_tables]
    # Add any extra tables
    for t in sorted(available_tables - set(ordered_tables)):
        ordered_tables.append(t)
        
    for table in ordered_tables:
        cursor.execute(f"PRAGMA table_info({table})")
        cols_info = cursor.fetchall()
        col_names = [c['name'] for c in cols_info]
        pk_cols = [c['name'] for c in cols_info if c['pk'] > 0]
        
        order_clause = f"ORDER BY {', '.join(pk_cols)}" if pk_cols else "ORDER BY rowid"
        
        cursor.execute(f"SELECT * FROM {table} {order_clause}")
        rows = cursor.fetchall()
        
        file_path = os.path.join(target_dir, f"{table}.sql")
        with open(file_path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(f"-- Deterministic dump for table {table} (rows: {len(rows)})\n")
            f.write(f"-- Columns: {', '.join(col_names)}\n\n")
            
            for row in rows:
                values_escaped = []
                for val in row:
                    if val is None:
                        values_escaped.append("NULL")
                    elif isinstance(val, (int, float)):
                        values_escaped.append(str(val))
                    else:
                        s_val = str(val).replace("'", "''")
                        values_escaped.append(f"'{s_val}'")
                        
                f.write(f"INSERT INTO {table} ({', '.join(col_names)}) VALUES ({', '.join(values_escaped)});\n")
                
        manifest['tables'][table] = len(rows)
        print(f"Dumped {table}: {len(rows)} rows -> {table}.sql")
        
    manifest_path = os.path.join(target_dir, "manifest.json")
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
        
    conn.close()
    print(f"\nDeterministic dump complete in {target_dir}. Ready for Git tracking.")

def build_database(db_path=None, dump_dir=None):
    """
    Reconstructs the SQLite database from migrations and deterministic dump files.
    """
    target_path = db_path or DB_PATH
    source_dir = dump_dir or DUMP_DIR
    
    if os.path.exists(target_path):
        backup_copy = target_path + ".bak"
        if os.path.exists(backup_copy):
            os.remove(backup_copy)
        os.rename(target_path, backup_copy)
        print(f"Existing DB renamed to {os.path.basename(backup_copy)}")
        
    print(f"Building new database at {target_path}...")
    run_migrations(target_path)
    
    conn = get_db(target_path)
    cursor = conn.cursor()
    
    # Temporarily disable foreign keys and triggers during bulk load
    cursor.execute("PRAGMA foreign_keys = OFF;")
    
    manifest_path = os.path.join(source_dir, "manifest.json")
    if os.path.exists(manifest_path):
        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest = json.load(f)
        tables_to_load = [t for t in TABLES_ORDER if t in manifest.get('tables', {})]
    else:
        tables_to_load = [os.path.splitext(f)[0] for f in sorted(os.listdir(source_dir)) if f.endswith('.sql')]
        
    for table in tables_to_load:
        sql_file = os.path.join(source_dir, f"{table}.sql")
        if not os.path.exists(sql_file):
            continue
            
        with open(sql_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        cursor.executescript("BEGIN;\n" + content + "\nCOMMIT;")
        cursor.execute(f"SELECT COUNT(1) FROM {table}")
        count = cursor.fetchone()[0]
        print(f"Loaded {table}: {count} rows")
        
    cursor.execute("PRAGMA foreign_keys = ON;")
    cursor.execute("PRAGMA foreign_key_check;")
    errors = cursor.fetchall()
    if errors:
        print(f"Warning: {len(errors)} foreign key inconsistencies found after build-db.")
    else:
        print("Foreign key check passed with 0 errors.")
        
    # Re-apply triggers
    triggers_sql = generate_all_triggers_sql(cursor)
    cursor.executescript(triggers_sql)
    conn.commit()
    conn.close()
    print("Database build complete and audit triggers registered.")
