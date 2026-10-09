import os
import json
import sqlite3

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_DIR = os.path.join(BASE_DIR, 'db')
DATA_DIR = os.path.join(BASE_DIR, 'data')
DB_PATH = os.path.join(DB_DIR, 'datanapoli.sqlite')

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Query to fetch all matches
query_partite = '''
SELECT 
    p.id,
    p.match_id,
    p.slug,
    p.data as date,
    st.nome as season,
    c.nome as competizione,
    sc.nome as squadra_casa,
    st_away.nome as squadra_trasferta,
    p.gol_casa as home_goals,
    p.gol_trasferta as away_goals,
    p.stadio,
    p.affluenza,
    p.note
FROM partite p
LEFT JOIN stagioni st ON p.stagione_id = st.id
LEFT JOIN competizioni c ON p.competizione_id = c.id
LEFT JOIN squadre sc ON p.squadra_casa_id = sc.id
LEFT JOIN squadre st_away ON p.squadra_trasferta_id = st_away.id
ORDER BY p.data DESC
'''
cursor.execute(query_partite)
rows = cursor.fetchall()

export_data = []

for r in rows:
    match_dict = {
        'match_id': r['match_id'],
        'date': r['date'],
        'season': r['season'],
        'competizione': r['competizione'],
        'squadra_casa': r['squadra_casa'],
        'squadra_trasferta': r['squadra_trasferta'],
        'home_goals': r['home_goals'],
        'away_goals': r['away_goals'],
        'slug': r['slug'],
        'stadio': r['stadio'],
        'affluenza': r['affluenza'],
        'scorers': [],
        'fonti': [],
        'note': r['note'] if r['note'] else ""
    }
    
    # Fonti
    cursor.execute('''
        SELECT f.nome 
        FROM partite_fonti pf 
        JOIN fonti f ON pf.fonte_id = f.id 
        WHERE pf.partita_id = ?
        ORDER BY f.nome
    ''', (r['id'],))
    fonti_rows = cursor.fetchall()
    match_dict['fonti'] = [fr['nome'] for fr in fonti_rows]
    
    # Scorers
    cursor.execute('''
        SELECT m.minuto, p.nome_completo as name, s.nome as team
        FROM marcatori m
        JOIN persone p ON m.persona_id = p.id
        JOIN squadre s ON m.squadra_id = s.id
        WHERE m.partita_id = ?
        ORDER BY m.id
    ''', (r['id'],))
    scorers_rows = cursor.fetchall()
    for sr in scorers_rows:
        match_dict['scorers'].append({
            'name': sr['name'],
            'team': sr['team'],
            'minute': sr['minuto']
        })
        
    export_data.append(match_dict)

conn.close()

with open(os.path.join(DATA_DIR, 'matches_export.json'), 'w', encoding='utf-8') as f:
    json.dump(export_data, f, indent=2, ensure_ascii=False)

# --- CONFRONTO SEMANTICO ---
original_path = os.path.join(DATA_DIR, 'matches.json')
with open(original_path, 'r', encoding='utf-8') as f:
    original_data = json.load(f)

original_dict = {m['match_id']: m for m in original_data}
export_dict = {m['match_id']: m for m in export_data}

in_orig_only = []
in_exp_only = []
diffs = []
identical = 0

for m_id, orig_m in original_dict.items():
    if m_id not in export_dict:
        in_orig_only.append(m_id)
    else:
        exp_m = export_dict[m_id]
        match_diffs = []
        all_keys = set(orig_m.keys()).union(set(exp_m.keys()))
        for k in all_keys:
            orig_val = orig_m.get(k)
            exp_val = exp_m.get(k)
            
            # differenze giustificate
            if k == 'note':
                if (orig_val == [] or orig_val is None) and (exp_val == "" or exp_val is None):
                    continue
            if k == 'scorers':
                if not orig_val and not exp_val:
                    continue
                
            if orig_val != exp_val:
                match_diffs.append({'campo': k, 'valore_originale': orig_val, 'valore_export': exp_val})
                
        if not match_diffs:
            identical += 1
        else:
            diffs.append({'match_id': m_id, 'differenze': match_diffs})

for m_id in export_dict.keys():
    if m_id not in original_dict:
        in_exp_only.append(m_id)

print("--- RIEPILOGO CONFRONTO SEMANTICO ---")
print(f"Record nell'originale: {len(original_dict)}")
print(f"Record nell'export: {len(export_dict)}")
print(f"Record identici (differenze note escluse): {identical}")
print(f"Record con differenze non note: {len(diffs)}")
print(f"Record solo nell'originale: {len(in_orig_only)}")
print(f"Record solo nell'export: {len(in_exp_only)}")

if diffs:
    print("\n--- ELENCO DIFFERENZE NON NOTE ---")
    for d in diffs:
        for diff in d['differenze']:
            print(f"[{d['match_id']}] Campo '{diff['campo']}': orig='{diff['valore_originale']}', exp='{diff['valore_export']}'")
