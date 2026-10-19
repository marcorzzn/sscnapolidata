import os
import sqlite3

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'db', 'datanapoli.sqlite')
MIGRATIONS_DIR = os.path.join(BASE_DIR, 'db', 'migrations')

def generate_seed():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Marcatori: we check each match
    cursor.execute('''
    SELECT 
        p.id, p.gol_casa, p.gol_trasferta, p.affluenza,
        (SELECT COUNT(*) FROM marcatori m WHERE m.partita_id = p.id) as count_marcatori
    FROM partite p
    ''')
    matches = cursor.fetchall()
    
    sql = ""
    for m in matches:
        p_id = m['id']
        g_c = m['gol_casa'] if m['gol_casa'] is not None else 0
        g_t = m['gol_trasferta'] if m['gol_trasferta'] is not None else 0
        tot_gol = g_c + g_t
        c_m = m['count_marcatori']
        
        if c_m > 0:
            sql += f"INSERT INTO copertura(tabella, record_id, campo, stato) VALUES ('partite', {p_id}, 'sez:marcatori', 'completo');\n"
        elif tot_gol == 0:
            sql += f"INSERT INTO copertura(tabella, record_id, campo, stato) VALUES ('partite', {p_id}, 'sez:marcatori', 'completo');\n"
        else:
            sql += f"INSERT INTO copertura(tabella, record_id, campo, stato, motivo) VALUES ('partite', {p_id}, 'sez:marcatori', 'nd', 'fonte non riporta');\n"
            
        if m['affluenza'] is None:
            # We'll set it as nd or na depending on the user preference. 
            # User said "Decidi tu il criterio per affluenza: se Wikipedia non la riporta, è nd; se non l'hai ancora controllata, è pending (nessuna riga)."
            # Let's leave it as pending (no row), since we haven't manually checked it.
            pass
        else:
            sql += f"INSERT INTO copertura(tabella, record_id, campo, stato) VALUES ('partite', {p_id}, 'affluenza', 'completo');\n"
            
    conn.close()
    
    with open(os.path.join(MIGRATIONS_DIR, '005_copertura_iniziale.sql'), 'w', encoding='utf-8') as f:
        f.write(sql)
        
if __name__ == '__main__':
    generate_seed()
