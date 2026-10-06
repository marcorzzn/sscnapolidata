import os
import json
from jinja2 import Environment, FileSystemLoader

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, 'data', 'matches.json')
    templates_dir = os.path.join(base_dir, 'scripts', 'templates')
    output_dir = os.path.join(base_dir, 'partite')

    os.makedirs(output_dir, exist_ok=True)
    env = Environment(loader=FileSystemLoader(templates_dir))
    
    try:
        template = env.get_template('match.html')
    except Exception as e:
        print(f"Error loading template: {e}")
        return

    if not os.path.exists(data_path):
        print(f"Nessun file JSON trovato in {data_path}")
        return

    with open(data_path, 'r', encoding='utf-8') as f:
        matches = json.load(f)

    count = 0
    for match in matches:
        try:
            date_clean = match.get('date', '1926-01-01').replace('-', '')
            home_short = match.get('squadra_casa', 'XXX')[:3].upper()
            away_short = match.get('squadra_trasferta', 'XXX')[:3].upper()
            slug = match.get('match_id', f"{date_clean}-{home_short}-{away_short}")

            output_file = os.path.join(output_dir, f"{slug}.html")

            html_content = template.render(match=match, slug=slug)

            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(html_content)
                
            count += 1
            
        except Exception as e:
            print(f"Error processing match {match.get('match_id')}: {e}")

    print(f"✅ Generazione completata: create {count} schede partita HTML.")

if __name__ == '__main__':
    main()
