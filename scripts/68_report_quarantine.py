import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'db', 'datanapoli.sqlite')

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

cursor.execute("SELECT motivo, COUNT(*) as c FROM nomi_da_risolvere WHERE stato='in_attesa' GROUP BY motivo ORDER BY c DESC")
rows = cursor.fetchall()

print("--- NOMI IN QUARANTENA PER MOTIVO ---")
for r in rows:
    print(f"{r['motivo']}: {r['c']}")

cursor.execute("SELECT nome_grezzo, motivo FROM nomi_da_risolvere WHERE stato='in_attesa'")
print("\n--- DETTAGLIO NOMI ---")
for r in cursor.fetchall():
    print(f"- {r['nome_grezzo']} ({r['motivo']})")
