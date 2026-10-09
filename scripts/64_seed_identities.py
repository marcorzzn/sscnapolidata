import sqlite3
import os
from unidecode import unidecode
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'db', 'datanapoli.sqlite')

def norm_light(name):
    return unidecode(name).lower().strip()

def norm_key(name):
    n = norm_light(name)
    n = re.sub(r'\b(ssc|ac|fbc|us|as|asd|fc|calcio|club)\b', '', n)
    n = re.sub(r'[^\w\s]', '', n)
    return ' '.join(n.split())

def seed_identities():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    teams = [
        ('Naples Foot-Ball Club', 'Naples Foot-Ball Club'),
        ('US Internazionale Napoli', 'US Internazionale Napoli'),
        ('FBC Internaples', 'FBC Internaples'),
        ('SSC Napoli', 'Napoli'),
        ('Alba-Audace', 'Alba-Audace'),
        ('Fortitudo-Pro Roma', 'Fortitudo-Pro Roma'),
        ('Roman', 'Roman'),
        ('AS Roma', 'Roma'),
        ('Ambrosiana', 'Ambrosiana'),
        ('FC Internazionale Milano', 'Inter'),
        ('Juventus FC', 'Juventus'),
        ('AC Milan', 'Milan')
    ]
    
    team_ids = {}
    for nome_completo, nome in teams:
        cursor.execute("SELECT id FROM squadre WHERE nome_completo = ? OR nome = ?", (nome_completo, nome))
        row = cursor.fetchone()
        if not row:
            cursor.execute("INSERT INTO squadre (nome, nome_completo) VALUES (?, ?)", (nome, nome_completo))
            team_ids[nome] = cursor.lastrowid
        else:
            team_ids[nome] = row['id']
            cursor.execute("UPDATE squadre SET nome_completo = ? WHERE id = ?", (nome_completo, row['id']))
            
    rels = [
        ('Naples Foot-Ball Club', 'FBC Internaples', 'merger', 1, 0, '1922-01-01'), # La fusione del 1922 non trasferisce palmares
        ('US Internazionale Napoli', 'FBC Internaples', 'merger', 1, 0, '1922-01-01'), # La fusione del 1922 non trasferisce palmares
        ('FBC Internaples', 'Napoli', 'rename_new_entity', 1, 0, '1926-08-01'),
        ('Alba-Audace', 'Roma', 'merger', 1, 0, '1927-07-22'),
        ('Fortitudo-Pro Roma', 'Roma', 'merger', 1, 0, '1927-07-22'),
        ('Roman', 'Roma', 'merger', 1, 0, '1927-07-22'),
        ('Inter', 'Ambrosiana', 'rename_new_entity', 1, 1, '1928-08-31'),
        ('Ambrosiana', 'Inter', 'rename_new_entity', 1, 1, '1945-10-27')
    ]
    
    cursor.execute("DELETE FROM squadre_relazioni")
    for from_t, to_t, rel_type, inh_leg, inh_sport, eff_date in rels:
        from_id = team_ids[from_t]
        to_id = team_ids[to_t]
        cursor.execute('''
            INSERT INTO squadre_relazioni (from_squadra_id, to_squadra_id, rel_type, inherits_legal, inherits_sporting_record, source, confidence, effective_date)
            VALUES (?, ?, ?, ?, ?, 'manuale', 'media', ?)
        ''', (from_id, to_id, rel_type, inh_leg, inh_sport, eff_date))
        
    aliases = {
        'Napoli': ['Napoli', 'SSC Napoli', 'Associazione Calcio Napoli', 'AC Napoli', 'Societa Sportiva Calcio Napoli'],
        'FBC Internaples': ['Internaples', 'FBC Internaples', 'Foot-Ball Club Internazionale-Naples'],
        'Naples Foot-Ball Club': ['Naples FBC', 'Naples', 'Naples Foot-Ball Club'],
        'US Internazionale Napoli': ['Internazionale Napoli', 'US Internazionale Napoli'],
        'Roma': ['Roma', 'AS Roma', 'Associazione Sportiva Roma'],
        'Alba-Audace': ['Alba-Audace', 'Alba Roma', 'Audace'],
        'Fortitudo-Pro Roma': ['Fortitudo-Pro Roma', 'Fortitudo', 'Pro Roma'],
        'Roman': ['Roman', 'Roman FC'],
        'Inter': ['Inter', 'FC Internazionale Milano', 'Internazionale', 'FC Internazionale'],
        'Ambrosiana': ['Ambrosiana', 'Ambrosiana-Inter', 'AS Ambrosiana', 'AS Ambrosiana-Inter'],
        'Juventus': ['Juventus', 'Juventus FC'],
        'Milan': ['Milan', 'AC Milan']
    }
    
    cursor.execute("DELETE FROM squadre_alias")
    for t_name, alias_list in aliases.items():
        t_id = team_ids[t_name]
        for al in alias_list:
            anorm = norm_light(al)
            akey = norm_key(al)
            try:
                cursor.execute('''
                    INSERT INTO squadre_alias (squadra_id, alias, alias_norm, alias_key, alias_type, source, confidence)
                    VALUES (?, ?, ?, ?, 'official', 'manuale', 'media')
                ''', (t_id, al, anorm, akey))
            except sqlite3.IntegrityError:
                pass
                
    conn.commit()
    conn.close()
    print("Identità e relazioni create con successo.")

if __name__ == '__main__':
    seed_identities()
