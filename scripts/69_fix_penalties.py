import csv
import sqlite3
import re

filepath = 'C:\\Users\\marco\\sscnapolidata-remoto\\data\\import\\openfootball.csv'
dbpath = 'C:\\Users\\marco\\sscnapolidata-remoto\\db\\datanapoli.sqlite'

def make_code(name):
    letters = ''.join(c for c in name if c.isalpha())
    return letters[:3].upper() if letters else 'UNK'

with open(filepath, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

for row in rows:
    for field in ['home_raw_name', 'away_raw_name']:
        val = row[field]
        if 'a.e.t.' in val or 'pen.' in val:
            # Estrarre la nota
            m = re.match(r'^(.*?)\s+(ACF Fiorentina|US Cremonese)$', val)
            if m:
                nota = m.group(1).strip()
                vero_nome = m.group(2).strip()
                row[field] = vero_nome
                if row['notes']:
                    row['notes'] += f" | {nota}"
                else:
                    row['notes'] = nota
                    
    # Recalculate match_id
    h_code = make_code(row['home_raw_name']) if 'napoli' not in row['home_raw_name'].lower() else 'NAP'
    a_code = make_code(row['away_raw_name']) if 'napoli' not in row['away_raw_name'].lower() else 'NAP'
    row['match_id'] = f"{row['date'].replace('-', '')}-{h_code}-{a_code}"

with open(filepath, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=rows[0].keys())
    writer.writeheader()
    writer.writerows(rows)

conn = sqlite3.connect(dbpath)
cursor = conn.cursor()
cursor.execute("UPDATE nomi_da_risolvere SET stato='rifiutato' WHERE nome_grezzo LIKE '%a.e.t.%' OR nome_grezzo LIKE '%pen.%'")
conn.commit()
print("Fix applicato su CSV e nomi_da_risolvere aggiornato.")
