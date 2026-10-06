import os
import json
import re

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Per ora supportiamo sia matches.json (formato dal nuovo Colab) sia master_database_napoli.json
    json_path_1 = os.path.join(base_dir, 'data', 'matches.json')
    json_path_2 = os.path.join(base_dir, 'data', 'master_database_napoli.json')
    
    data_path = json_path_1 if os.path.exists(json_path_1) else json_path_2
    
    if not os.path.exists(data_path):
        print(f"Nessun file JSON trovato in {base_dir}/data/. Assicurati di inserire il file generato da Colab.")
        return

    with open(data_path, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)

    # Convertiamo i dati raw (che potrebbero essere complessi) nel formato essenziale per l'archivio
    # Il frontend necessita di: slug, date, day, month, home, away, home_goals, away_goals, competition, round, season, venue, scorers, has_full_report
    
    processed_matches = []
    
    # Gestione del formato "master_database" (array di stagioni con dentro le partite)
    # oppure del formato "matches.json" (array flat di partite SQLite)
    
    matches_list = []
    if isinstance(raw_data, list):
        if len(raw_data) > 0 and 'season' in raw_data[0] and 'matches' in raw_data[0]:
            # Formato master_database_napoli.json
            for season_data in raw_data:
                for match in season_data.get('matches', []):
                    matches_list.append(match)
        else:
            # Formato matches.json (SQLite export)
            matches_list = raw_data

    # Mesi in italiano
    mesi = ["GEN", "FEB", "MAR", "APR", "MAG", "GIU", "LUG", "AGO", "SET", "OTT", "NOV", "DIC"]

    for m in matches_list:
        try:
            # Mappatura dai campi del database ai campi del frontend
            # Qui si adatta in base a come il DB SQLite li esporta. Usiamo dei fallback sicuri.
            
            # Formato SQLite proposto dall'utente: data, competizione, squadra_casa, squadra_trasferta, risultato
            date_str = m.get('data', m.get('date', '1926-01-01'))
            
            # Estrazione giorno e mese
            day = "01"
            month = "GEN"
            if len(date_str) >= 10: # YYYY-MM-DD
                try:
                    parts = date_str.split('-')
                    if len(parts) == 3:
                        day = str(int(parts[2]))
                        month_idx = int(parts[1]) - 1
                        if 0 <= month_idx <= 11:
                            month = mesi[month_idx]
                except:
                    pass

            home_team = m.get('squadra_casa', m.get('home', 'Casa'))
            away_team = m.get('squadra_trasferta', m.get('away', 'Trasferta'))
            
            # Risultato "2-1" o home_goals/away_goals
            h_goals, a_goals = None, None
            risultato = m.get('risultato', '')
            if isinstance(risultato, str) and '-' in risultato:
                parts = risultato.split('-')
                if len(parts) == 2 and parts[0].strip().isdigit() and parts[1].strip().isdigit():
                    h_goals = int(parts[0].strip())
                    a_goals = int(parts[1].strip())
            else:
                h_goals = m.get('home_goals', m.get('gol_casa', None))
                a_goals = m.get('away_goals', m.get('gol_trasferta', None))
                
            venue = 'h' if 'napoli' in home_team.lower() else 'a'
            
            slug = m.get('match_id', f"{date_str.replace('-','')}-{home_team[:3].upper()}-{away_team[:3].upper()}")

            processed_matches.append({
                'slug': slug,
                'date': date_str,
                'day': day,
                'month': month,
                'home': home_team,
                'away': away_team,
                'home_goals': h_goals,
                'away_goals': a_goals,
                'competition': m.get('competizione', m.get('competition', 'Amichevole')),
                'round': m.get('round', ''),
                'season': m.get('season', '1926-27'),
                'venue': venue,
                'scorers': m.get('scorers', []),
                'has_full_report': os.path.exists(os.path.join(base_dir, 'partite', f"{slug}.html"))
            })
        except Exception as e:
            print(f"Errore nel parsing di una partita: {e}")
            continue

    # Ordiniamo per data decrescente
    processed_matches.sort(key=lambda x: x['date'], reverse=True)

    # Iniezione nel file archivio/index.html
    html_path = os.path.join(base_dir, 'archivio', 'index.html')
    if not os.path.exists(html_path):
        print(f"Errore: file {html_path} non trovato.")
        return

    with open(html_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    # Regex per trovare l'array MATCHES in JS
    pattern = re.compile(r'(var MATCHES = )\[.*?\];', re.DOTALL)
    
    matches_js_string = json.dumps(processed_matches, indent=4, ensure_ascii=False)
    
    new_html_content = pattern.sub(f'\\1{matches_js_string};', html_content)

    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(new_html_content)

    print(f"Archivio aggiornato con successo: {len(processed_matches)} partite elaborate e iniettate in archivio/index.html.")

if __name__ == '__main__':
    main()
