import sqlite3
import os
import sys
import importlib.util

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'db', 'datanapoli.sqlite')

spec = importlib.util.spec_from_file_location("resolve_names", os.path.join(BASE_DIR, "scripts", "65_resolve_names.py"))
resolve_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(resolve_module)
resolve = resolve_module.resolve
norm_light = resolve_module.norm_light

MAPPING = {
    'Sassuolo Calcio': ('Sassuolo', 'US Sassuolo Calcio'),
    'Chievo Verona': ('Chievo', 'AC ChievoVerona'),
    'Empoli FC': ('Empoli', 'Empoli FC'),
    'Hellas Verona FC': ('Hellas Verona', 'Hellas Verona FC'),
    'Bologna FC 1909': ('Bologna', 'Bologna FC 1909'),
    'Torino FC': ('Torino', 'Torino FC'),
    'Genoa CFC': ('Genoa', 'Genoa CFC'),
    'UC Sampdoria': ('Sampdoria', 'UC Sampdoria'),
    'US Lecce': ('Lecce', 'US Lecce'),
    'Cagliari Calcio': ('Cagliari', 'Cagliari Calcio'),
    'Udinese Calcio': ('Udinese', 'Udinese Calcio'),
    'SS Lazio': ('Lazio', 'SS Lazio'),
    'AS Roma': ('Roma', 'AS Roma'),
    'Parma Calcio 1913': ('Parma', 'Parma Calcio 1913'),
    'ACF Fiorentina': ('Fiorentina', 'ACF Fiorentina'),
    'Atalanta BC': ('Atalanta', 'Atalanta BC'),
    'FC Crotone': ('Crotone', 'FC Crotone'),
    'Benevento Calcio': ('Benevento', 'Benevento Calcio'),
    'SPAL': ('SPAL', 'SPAL 2013'),
    'Frosinone Calcio': ('Frosinone', 'Frosinone Calcio'),
    'Brescia Calcio': ('Brescia', 'Brescia Calcio'),
    'US Salernitana 1919': ('Salernitana', 'US Salernitana 1919'),
    'Spezia Calcio': ('Spezia', 'Spezia Calcio'),
    'Venezia FC': ('Venezia', 'Venezia FC'),
    'AC Monza': ('Monza', 'AC Monza'),
    'US Cremonese': ('Cremonese', 'US Cremonese'),
    'AS Cittadella': ('Cittadella', 'AS Cittadella'),
    'Pisa SC': ('Pisa', 'Pisa SC'),
    'Como 1907': ('Como', 'Como 1907'),
    'AS Livorno': ('Livorno', 'AS Livorno'),
    'Calcio Catania': ('Catania', 'Calcio Catania'),
    'Lazio Roma': ('Lazio', 'SS Lazio'),
    'US Palermo': ('Palermo', 'Palermo FC'),
    'AC Cesena': ('Cesena', 'AC Cesena'),
    'Carpi FC': ('Carpi', 'Carpi FC'),
    'Delfino Pescara': ('Pescara', 'Delfino Pescara 1936'),
    'SPAL 2013 Ferrara': ('SPAL', 'SPAL 2013'),
    'Modena FC': ('Modena', 'Modena FC'),
    'Palermo FC': ('Palermo', 'Palermo FC')
}

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()
cursor.execute('PRAGMA foreign_keys = ON')

for raw_name, (nome_canonico, nome_completo) in MAPPING.items():
    cursor.execute("SELECT id FROM squadre WHERE nome = ?", (nome_canonico,))
    row = cursor.fetchone()
    if row:
        squadra_id = row['id']
    else:
        cursor.execute("INSERT INTO squadre (nome, nome_completo) VALUES (?, ?)", (nome_canonico, nome_completo))
        squadra_id = cursor.lastrowid
        
    for alias in [raw_name, nome_canonico, nome_completo]:
        a_norm = norm_light(alias)
        try:
            cursor.execute("INSERT INTO squadre_alias (squadra_id, alias, alias_norm, alias_key, alias_type, source, confidence) VALUES (?, ?, ?, ?, 'common', 'seed', 'alta')",
                           (squadra_id, alias, a_norm, a_norm))
        except sqlite3.IntegrityError:
            pass

conn.commit()

cursor.execute("SELECT id, nome_grezzo FROM nomi_da_risolvere WHERE stato='in_attesa'")
in_attesa = cursor.fetchall()
risolti = 0

for row in in_attesa:
    sq_id, method, score = resolve(cursor, row['nome_grezzo'], 're_resolve', None)
    if sq_id:
        cursor.execute("UPDATE nomi_da_risolvere SET stato='risolto', squadra_risolta_id=? WHERE id=?", (sq_id, row['id']))
        risolti += 1

conn.commit()
print(f"Risolti {risolti} su {len(in_attesa)} in attesa.")
