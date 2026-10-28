import os
import sys
import glob
import sqlite3
from .db import get_db, create_backup, DB_PATH, MIGRATIONS_DIR, DB_DIR

SCHEMA_SQL_PATH = os.path.join(DB_DIR, 'schema.sql')

def ensure_migration_tracking(conn):
    conn.execute("""
    CREATE TABLE IF NOT EXISTS schema_migrazioni (
      versione INTEGER PRIMARY KEY,
      nome TEXT NOT NULL,
      applicata_il TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );
    """)
    conn.commit()

def get_user_version(conn):
    cursor = conn.cursor()
    cursor.execute("PRAGMA user_version;")
    return cursor.fetchone()[0]

def set_user_version(conn, version):
    conn.execute(f"PRAGMA user_version = {int(version)};")
    conn.commit()

def generate_schema_sql(conn):
    """
    Generates a read-only consolidated schema.sql file from sqlite_master.
    """
    cursor = conn.cursor()
    lines = [
        "-- GENERATED AUTOMATICALLY BY dn.py migrate. DO NOT EDIT DIRECTLY.",
        f"-- Current PRAGMA user_version: {get_user_version(conn)}",
        "PRAGMA foreign_keys = ON;\n"
    ]
    
    # Tables
    cursor.execute("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    for row in cursor.fetchall():
        if row['sql']:
            lines.append(f"{row['sql']};\n")
            
    # Views
    cursor.execute("SELECT name, sql FROM sqlite_master WHERE type='view' ORDER BY name")
    for row in cursor.fetchall():
        if row['sql']:
            lines.append(f"{row['sql']};\n")

    # Indexes
    cursor.execute("SELECT name, sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL ORDER BY name")
    for row in cursor.fetchall():
        if row['sql']:
            lines.append(f"{row['sql']};\n")

    content = "\n".join(lines)
    with open(SCHEMA_SQL_PATH, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Generated consolidated schema dump in {SCHEMA_SQL_PATH}")

def stamp_baseline(target_version=10):
    """
    Stamps an existing database up to target_version without re-running older migrations.
    """
    conn = get_db()
    ensure_migration_tracking(conn)
    current = get_user_version(conn)
    if current < target_version:
        set_user_version(conn, target_version)
        print(f"Stamped database PRAGMA user_version to {target_version}.")
    conn.close()

def run_migrations(db_path=None, stamp=None):
    """
    Runs pending numbered SQL migrations in sequential order.
    """
    path = db_path or DB_PATH
    conn = get_db(path)
    ensure_migration_tracking(conn)
    
    current_uv = get_user_version(conn)
    
    # If DB has schema_migrazioni populated with 10 rows but user_version is 0, align them
    cursor = conn.cursor()
    cursor.execute("SELECT MAX(versione) FROM schema_migrazioni")
    max_rec = cursor.fetchone()[0] or 0
    if current_uv == 0 and max_rec > 0:
        current_uv = max_rec
        set_user_version(conn, current_uv)
        print(f"Aligned PRAGMA user_version to {current_uv} from existing schema_migrazioni.")
        
    if stamp is not None:
        set_user_version(conn, stamp)
        print(f"Stamped PRAGMA user_version to {stamp}.")
        conn.close()
        return

    migration_files = sorted(glob.glob(os.path.join(MIGRATIONS_DIR, '*.sql')))
    applied_count = 0
    
    for mig_file in migration_files:
        base = os.path.basename(mig_file)
        try:
            num = int(base.split('_')[0])
        except (ValueError, IndexError):
            continue
            
        if num > current_uv:
            print(f"Applying migration {base} (version {num})...")
            
            # Safe backup before applying
            backup_file = create_backup(path, prefix=f"mig_{num}")
            if backup_file:
                print(f"  [Backup created: {os.path.basename(backup_file)}]")
                
            with open(mig_file, 'r', encoding='utf-8') as f:
                sql_content = f.read()
                
            try:
                # Execute migration script in transaction
                cursor.executescript("BEGIN;\n" + sql_content + "\nCOMMIT;")
                
                # Update user_version and record
                set_user_version(conn, num)
                conn.execute(
                    "INSERT OR REPLACE INTO schema_migrazioni (versione, nome, applicata_il) VALUES (?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))",
                    (num, base)
                )
                conn.commit()
                current_uv = num
                applied_count += 1
                print(f"  Migration {base} applied successfully (user_version = {num}).")
            except Exception as e:
                conn.rollback()
                print(f"ERROR applying migration {base}: {e}", file=sys.stderr)
                conn.close()
                sys.exit(1)
                
    if applied_count == 0:
        print(f"Database schema is up to date (PRAGMA user_version = {current_uv}).")
    else:
        print(f"Successfully applied {applied_count} migrations. Current user_version = {current_uv}.")
        
    # Generate schema.sql
    generate_schema_sql(conn)
    conn.close()

if __name__ == '__main__':
    run_migrations()
