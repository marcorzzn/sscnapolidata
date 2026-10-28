import os
import sqlite3
import datetime
import glob
from contextlib import contextmanager

# Base paths
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_DIR = os.path.join(ROOT_DIR, 'db')
DB_PATH = os.path.join(DB_DIR, 'datanapoli.sqlite')
BACKUPS_DIR = os.path.join(DB_DIR, 'backups')
MIGRATIONS_DIR = os.path.join(DB_DIR, 'migrations')
DUMP_DIR = os.path.join(DB_DIR, 'dump')
DATA_DIR = os.path.join(ROOT_DIR, 'data')

def get_db(db_path=None):
    """
    Returns an SQLite connection with PRAGMA foreign_keys=ON and Row row_factory.
    """
    path = db_path or DB_PATH
    os.makedirs(os.path.dirname(path), exist_ok=True)
    conn = sqlite3.connect(path, timeout=30.0)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.row_factory = sqlite3.Row
    return conn

def create_backup(db_path=None, prefix='datanapoli'):
    """
    Creates a consistent backup using SQLite's native backup API.
    """
    os.makedirs(BACKUPS_DIR, exist_ok=True)
    ts = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = os.path.join(BACKUPS_DIR, f"{prefix}_{ts}.backup")
    
    src_path = db_path or DB_PATH
    if not os.path.exists(src_path):
        return None
        
    src = sqlite3.connect(src_path, timeout=30.0)
    dst = sqlite3.connect(backup_path)
    with dst:
        src.backup(dst)
    dst.close()
    src.close()
    
    # Prune old backups, keep last 15
    backups = sorted(glob.glob(os.path.join(BACKUPS_DIR, f"{prefix}_*.backup")))
    if len(backups) > 15:
        for b in backups[:-15]:
            try:
                os.remove(b)
            except OSError:
                pass
                
    return backup_path

def set_session(conn, attore='sconosciuto', motivo=None, fonte_id=None, batch_id=None):
    """
    Sets the single row in the sessione table (id=1) for audit triggers.
    """
    conn.execute("""
        INSERT INTO sessione (id, attore, motivo, fonte_id, batch_id)
        VALUES (1, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          attore = excluded.attore,
          motivo = excluded.motivo,
          fonte_id = excluded.fonte_id,
          batch_id = excluded.batch_id;
    """, (attore or 'sconosciuto', motivo, fonte_id, batch_id))
    conn.commit()

@contextmanager
def session_scope(conn, attore='sconosciuto', motivo=None, fonte_id=None, batch_id=None):
    """
    Context manager to set and cleanly reset audit session context.
    """
    cursor = conn.cursor()
    cursor.execute("SELECT attore, motivo, fonte_id, batch_id FROM sessione WHERE id = 1")
    prev = cursor.fetchone()
    
    set_session(conn, attore=attore, motivo=motivo, fonte_id=fonte_id, batch_id=batch_id)
    try:
        yield conn
    finally:
        if prev:
            set_session(conn, attore=prev['attore'], motivo=prev['motivo'], fonte_id=prev['fonte_id'], batch_id=prev['batch_id'])
        else:
            set_session(conn, attore='sconosciuto', motivo='Reset', fonte_id=None, batch_id=None)
