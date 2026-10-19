import sqlite3
import subprocess
import sys
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
conn = sqlite3.connect(os.path.join(BASE_DIR, 'db', 'datanapoli.sqlite'))
cursor = conn.cursor()

print("--- VERIFICA DB ---")
cursor.execute("SELECT COUNT(*) FROM partite")
print(f"Partite: {cursor.fetchone()[0]}")

cursor.execute("SELECT COUNT(*) FROM marcatori")
print(f"Marcatori: {cursor.fetchone()[0]}")
conn.close()

print("\n--- QUERY VS JUVENTUS ---")
subprocess.run([sys.executable, 'scripts/70_query.py', 'vs', 'juventus'], cwd=BASE_DIR)

print("\n--- QUERY ETERNA JUVENTUS ---")
subprocess.run([sys.executable, 'scripts/70_query.py', 'eterna', 'juventus'], cwd=BASE_DIR)

print("\n--- QUARANTENA ---")
subprocess.run([sys.executable, 'scripts/68_report_quarantine.py'], cwd=BASE_DIR)

