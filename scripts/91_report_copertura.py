import os
import sqlite3

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'db', 'datanapoli.sqlite')

def report():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    print("--- REPORT COPERTURA ---")
    
    # Per decennio:
    print("\\n[Decennio] Marcatori Completi / Totale")
    cursor.execute('''
    SELECT 
        (CAST(substr(p.data, 1, 4) AS INTEGER) / 10) * 10 as decennio,
        COUNT(p.id) as totale_partite,
        SUM(CASE WHEN c.stato = 'completo' THEN 1 ELSE 0 END) as marcatori_completi
    FROM partite p
    LEFT JOIN copertura c ON p.id = c.record_id AND c.tabella = 'partite' AND c.campo = 'sez:marcatori'
    GROUP BY decennio
    ORDER BY decennio DESC
    ''')
    for r in cursor.fetchall():
        print(f"{r['decennio']}s: {r['marcatori_completi']} / {r['totale_partite']}")
        
    print("\\n[Affluenza]")
    cursor.execute('''
    SELECT 
        SUM(CASE WHEN affluenza IS NULL THEN 1 ELSE 0 END) as affluenza_mancante,
        SUM(CASE WHEN affluenza IS NULL AND c.stato = 'nd' THEN 1 ELSE 0 END) as nd,
        SUM(CASE WHEN affluenza IS NULL AND c.stato IS NULL THEN 1 ELSE 0 END) as pending
    FROM partite p
    LEFT JOIN copertura c ON p.id = c.record_id AND c.tabella = 'partite' AND c.campo = 'affluenza'
    ''')
    r = cursor.fetchone()
    print(f"Partite senza affluenza: {r['affluenza_mancante']}")
    print(f"  Di cui 'nd' (fonte non riporta): {r['nd']}")
    print(f"  Di cui pending (da cercare): {r['pending']}")
    
    conn.close()

if __name__ == '__main__':
    report()
