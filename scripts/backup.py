import os
import sqlite3
import datetime
import glob
import time

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'db', 'datanapoli.sqlite')
BACKUPS_DIR = os.path.join(BASE_DIR, 'db', 'backups')

def create_backup():
    os.makedirs(BACKUPS_DIR, exist_ok=True)
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S_%f')
    backup_path = os.path.join(BACKUPS_DIR, f'datanapoli_{timestamp}.sqlite')
    
    conn = sqlite3.connect(DB_PATH)
    conn.execute(f"VACUUM INTO '{backup_path}'")
    conn.close()
    
    backups = sorted(glob.glob(os.path.join(BACKUPS_DIR, 'datanapoli_*.sqlite')))
    if len(backups) > 10:
        for old_backup in backups[:-10]:
            try:
                os.remove(old_backup)
            except Exception:
                pass
                
    print(f"Backup creato: {backup_path}")
    return backup_path

if __name__ == '__main__':
    create_backup()
