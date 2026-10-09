import sqlite3
import os
import argparse
from rapidfuzz import fuzz
from rapidfuzz.process import extractOne
import re
from unidecode import unidecode

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'db', 'datanapoli.sqlite')

def norm_light(name):
    if not name: return ""
    s = unidecode(name).lower()
    s = re.sub(r"[-.,'’]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

def norm_key(name):
    """
    Rimuove suffissi societari comuni e numeri finali (es. anni) per la ricerca fuzzy.
    """
    n = norm_light(name)
    n = re.sub(r'\b(ssc|ac|fbc|us|as|asd|fc|calcio|club)\b', '', n)
    n = re.sub(r'\b\d{3,4}\b', '', n)  # Rimuove anni tipo 1913, 1909
    n = re.sub(r'[^\w\s]', '', n)
    return ' '.join(n.split())

def traverse_relations(cursor, sq_id, match_date):
    if not match_date: return sq_id
    current_id = sq_id
    visited = set()
    while True:
        visited.add(current_id)
        cursor.execute('''
            SELECT to_squadra_id FROM squadre_relazioni
            WHERE from_squadra_id = ? AND effective_date <= ?
            ORDER BY effective_date DESC LIMIT 1
        ''', (current_id, match_date))
        row = cursor.fetchone()
        if not row:
            break
        next_id = row['to_squadra_id']
        if next_id in visited:
            break # circular
        current_id = next_id
    return current_id

def resolve(cursor, raw_name, source, match_date, competizione=None):
    if not raw_name: return None, None, None
    
    anorm = norm_light(raw_name)
    akey = norm_key(raw_name)
    
    sq_id = None
    method = None
    score = None
    
    cursor.execute('''
        SELECT squadra_id FROM squadre_alias
        WHERE alias_norm = ?
    ''', (anorm,))
    rows = cursor.fetchall()
    if len(rows) == 1:
        sq_id, method, score = rows[0]['squadra_id'], 'alias_esatto', 100.0
    
    if not sq_id:
        cursor.execute('''
            SELECT squadra_id FROM squadre_alias
            WHERE alias_key = ?
        ''', (akey,))
        rows = cursor.fetchall()
        if len(rows) == 1:
            sq_id, method, score = rows[0]['squadra_id'], 'alias_key', 100.0
        
    if not sq_id:
        cursor.execute("SELECT squadra_id, alias_key FROM squadre_alias WHERE alias_key IS NOT NULL AND alias_key != ''")
        alias_list = [(r['squadra_id'], r['alias_key']) for r in cursor.fetchall()]
        if alias_list:
            keys = [a[1] for a in alias_list]
            best = extractOne(akey, keys, scorer=fuzz.token_sort_ratio)
            if best and best[1] >= 97.0:
                best_key = best[0]
                best_club = next(a[0] for a in alias_list if a[1] == best_key)
                second_score = 0
                for club_id, key in alias_list:
                    if club_id != best_club:
                        s = fuzz.token_sort_ratio(akey, key)
                        if s > second_score:
                            second_score = s
                if best[1] - second_score >= 5.0:
                    sq_id, method, score = best_club, 'fuzzy_auto', best[1]
                
    if sq_id:
        final_id = traverse_relations(cursor, sq_id, match_date)
        return final_id, method, score
    else:
        cursor.execute("SELECT id FROM nomi_da_risolvere WHERE nome_grezzo=? AND stato='in_attesa'", (raw_name,))
        if not cursor.fetchone():
            cursor.execute('''
                INSERT INTO nomi_da_risolvere (nome_grezzo, fonte, contesto_data, contesto_competizione, motivo)
                VALUES (?, ?, ?, ?, 'nessun_candidato')
            ''', (raw_name, source, match_date, competizione))
        return None, None, None

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--test', type=str, help="Nome grezzo")
    parser.add_argument('date', nargs='?', default='1927-01-01')
    args = parser.parse_args()
    
    if args.test:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        sq_id, method, score = resolve(cursor, args.test, 'test', args.date)
        if sq_id:
            cursor.execute("SELECT nome FROM squadre WHERE id=?", (sq_id,))
            print(f"Risolto: {cursor.fetchone()['nome']} (metodo: {method}, punteggio: {score})")
        else:
            print("Non risolto.")
        conn.close()
