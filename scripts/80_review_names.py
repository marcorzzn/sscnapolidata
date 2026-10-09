import sqlite3
import os
import re
from unidecode import unidecode

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'db', 'datanapoli.sqlite')

def norm_light(name):
    if not name: return ""
    return unidecode(name).lower().strip()

def norm_key(name):
    n = norm_light(name)
    n = re.sub(r'\b(ssc|ac|fbc|us|as|asd|fc|calcio|club)\b', '', n)
    n = re.sub(r'[^\w\s]', '', n)
    return ' '.join(n.split())

def review_names():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    cursor.execute("SELECT * FROM nomi_da_risolvere WHERE stato='in_attesa'")
    rows = cursor.fetchall()
    
    if not rows:
        print("Nessun nome in attesa di risoluzione.")
        return
        
    for row in rows:
        print("\n" + "="*50)
        print(f"Nome grezzo:   {row['nome_grezzo']}")
        print(f"Fonte:         {row['fonte']}")
        print(f"Data:          {row['contesto_data']}")
        print(f"Competizione:  {row['contesto_competizione']}")
        print(f"Motivo:        {row['motivo']}")
        
        while True:
            print("\nOpzioni:")
            print("1) Assegna a squadra esistente (inserisci ID)")
            print("2) Crea nuova squadra e assegna")
            print("3) Rifiuta / Ignora")
            print("4) Cerca squadre per nome")
            print("S) Salta per ora")
            scelta = input("Scelta: ").strip()
            
            if scelta.lower() == 's':
                break
            elif scelta == '3':
                cursor.execute("UPDATE nomi_da_risolvere SET stato='rifiutato', risolto_il=datetime('now') WHERE id=?", (row['id'],))
                conn.commit()
                print("Segnato come rifiutato.")
                break
            elif scelta == '4':
                cerca = input("Cerca: ").strip()
                cursor.execute("SELECT id, nome_completo FROM squadre WHERE nome_completo LIKE ?", (f'%{cerca}%',))
                for res in cursor.fetchall():
                    print(f"  ID: {res['id']} | Nome: {res['nome_completo']}")
            elif scelta == '1':
                try:
                    sq_id = int(input("Inserisci ID squadra: ").strip())
                    cursor.execute("SELECT nome FROM squadre WHERE id=?", (sq_id,))
                    sq = cursor.fetchone()
                    if not sq:
                        print("ID non trovato.")
                        continue
                    
                    anorm = norm_light(row['nome_grezzo'])
                    akey = norm_key(row['nome_grezzo'])
                    try:
                        cursor.execute('''
                            INSERT INTO squadre_alias (squadra_id, alias, alias_norm, alias_key, alias_type, source, confidence)
                            VALUES (?, ?, ?, ?, 'manual', 'manuale', 'alta')
                        ''', (sq_id, row['nome_grezzo'], anorm, akey))
                    except sqlite3.IntegrityError:
                        pass 
                    
                    cursor.execute('''
                        UPDATE nomi_da_risolvere 
                        SET stato='risolto', squadra_risolta_id=?, risolto_da='umano', risolto_il=datetime('now') 
                        WHERE id=?
                    ''', (sq_id, row['id']))
                    conn.commit()
                    print(f"Assegnato a {sq['nome']}.")
                    break
                except ValueError:
                    print("ID non valido.")
            elif scelta == '2':
                nome_completo = input("Nome completo nuova squadra: ").strip()
                if not nome_completo: continue
                nome = input("Nome breve: ").strip() or nome_completo
                
                cursor.execute("INSERT INTO squadre (nome, nome_completo) VALUES (?, ?)", (nome, nome_completo))
                sq_id = cursor.lastrowid
                
                anorm = norm_light(row['nome_grezzo'])
                akey = norm_key(row['nome_grezzo'])
                cursor.execute('''
                    INSERT INTO squadre_alias (squadra_id, alias, alias_norm, alias_key, alias_type, source, confidence)
                    VALUES (?, ?, ?, ?, 'manual', 'manuale', 'alta')
                ''', (sq_id, row['nome_grezzo'], anorm, akey))
                
                cursor.execute('''
                    UPDATE nomi_da_risolvere 
                    SET stato='risolto', squadra_risolta_id=?, risolto_da='umano', risolto_il=datetime('now') 
                    WHERE id=?
                ''', (sq_id, row['id']))
                conn.commit()
                print(f"Creata nuova squadra '{nome_completo}' e assegnata.")
                break

    conn.close()

if __name__ == '__main__':
    review_names()
