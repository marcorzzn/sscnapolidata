import os
import sys
import re
import csv
import time
import urllib.request
import urllib.parse
import urllib.error
from bs4 import BeautifulSoup
from datetime import datetime

# Aggiungo la root path per poter importare
BASE_DIR = 'C:\\Users\\marco\\sscnapolidata-remoto'
sys.path.append(BASE_DIR)
try:
    # Use importlib to avoid syntax error on number in module name
    import importlib.util
    spec = importlib.util.spec_from_file_location("import_openfootball", os.path.join(BASE_DIR, "scripts", "66_import_openfootball.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    make_code = mod.make_code
except Exception as e:
    def make_code(name):
        letters = ''.join(c for c in name if c.isalpha())
        return letters[:3].upper() if letters else 'UNK'

WIKI_DIR = os.path.join(BASE_DIR, 'data', 'import', 'wikipedia')
CACHE_DIR = os.path.join(WIKI_DIR, 'cache')
os.makedirs(CACHE_DIR, exist_ok=True)

USER_AGENT = 'DataNapoli/1.0 (https://github.com/marcorzzn/sscnapolidata; contatto nel README)'

def get_page(year):
    y1 = int(year)
    y2 = y1 + 1
    slug_suffix = f"{y1}-{y2}"
    candidates = [
        f"Società_Sportiva_Calcio_Napoli_{slug_suffix}",
        f"Associazione_Calcio_Napoli_{slug_suffix}",
        f"SSC_Napoli_{slug_suffix}"
    ]
    
    cache_file = os.path.join(CACHE_DIR, f"{slug_suffix}.html")
    if os.path.exists(cache_file):
        with open(cache_file, 'r', encoding='utf-8') as f:
            html = f.read()
        # Find which title it was from the comment at the top
        m = re.match(r'<!-- URL: (.*?) -->', html)
        title = m.group(1) if m else "Cached Page"
        return html, title

    for c in candidates:
        url = f"https://it.wikipedia.org/wiki/{c}"
        url_ascii = urllib.parse.quote(url, safe=':/')
        req = urllib.request.Request(url_ascii, headers={'User-Agent': USER_AGENT})
        try:
            time.sleep(1)
            with urllib.request.urlopen(req) as response:
                html = response.read().decode('utf-8')
                # Save cache
                with open(cache_file, 'w', encoding='utf-8') as f:
                    f.write(f"<!-- URL: {url} -->\n" + html)
                return html, url
        except urllib.error.HTTPError as e:
            continue
            
    return None, None

def parse_date(date_str):
    # E.g. "14 settembre 1986, ore 15:00 CEST" -> 1986-09-14
    mesi = {
        'gennaio': '01', 'febbraio': '02', 'marzo': '03', 'aprile': '04',
        'maggio': '05', 'giugno': '06', 'luglio': '07', 'agosto': '08',
        'settembre': '09', 'ottobre': '10', 'novembre': '11', 'dicembre': '12'
    }
    m = re.search(r'(\d{1,2})\s+([a-z]+)\s+(\d{4})', date_str.lower())
    if m:
        d = int(m.group(1))
        mm = mesi.get(m.group(2), '01')
        y = m.group(3)
        return f"{y}-{mm}-{d:02d}"
    return ""

def process_season(year):
    y1 = int(year)
    y2 = y1 + 1
    season_str = f"{y1}-{y2}"
    
    html, url = get_page(year)
    if not html:
        print(f"Stagione {year} non trovata")
        return
        
    soup = BeautifulSoup(html, 'html.parser')
    title = soup.find('h1', id='firstHeading').text
    print(f"Trovata pagina: {title}")
    
    matches = []
    elements = soup.find_all(['h2', 'h3', 'table'])
    current_context = "Sconosciuta"
    
    for el in elements:
        if el.name in ['h2', 'h3']:
            current_context = el.text.replace('[modifica | modifica wikitesto]', '').replace('[modifica]', '').strip()
        elif el.name == 'table' and 'idc-maintable' in el.get('class', []):
            try:
                trs = el.find_all('tr', recursive=False)
                if not trs:
                    tbody = el.find('tbody', recursive=False)
                    if tbody:
                        trs = tbody.find_all('tr', recursive=False)
                        
                if len(trs) == 0: continue
                    
                tds = trs[0].find_all(['td', 'th'], recursive=False)
                if len(tds) < 5: continue
                
                date_raw = tds[0].text.strip()
                match_date = parse_date(date_raw) or f"{y1}-01-01"
                home_raw = tds[1].text.strip()
                
                score_raw = tds[2].text.strip()
                m_score = re.search(r'(\d+)\s*[-–]\s*(\d+)', score_raw)
                h_goals, a_goals = m_score.groups() if m_score else ('', '')
                    
                away_raw = tds[3].text.strip()
                
                # STADIO, SPETTATORI, ARBITRO
                # Use split on <br> to reliably separate them
                stad_cell = tds[4]
                for br in stad_cell.find_all('br'):
                    br.replace_with('|')
                # Inner tables (like arbitro) might not have <br>, they are block elements.
                # So we replace table rows with | too.
                for tr in stad_cell.find_all('tr'):
                    for td in tr.find_all('td'):
                        td.append('|')
                        
                stad_raw = stad_cell.text
                parts = [p.strip() for p in stad_raw.split('|') if p.strip()]
                
                stadium = ''
                attendance = ''
                referee = ''
                
                for p in parts:
                    if p.lower().startswith('arbitro'):
                        referee = p.replace('Arbitro:', '').replace('Arbitro', '').strip()
                    elif 'spett' in p.lower():
                        m_att = re.search(r'(\d[\d\s\.]+)\s*spett', p)
                        if m_att:
                            attendance = m_att.group(1).replace(' ', '').replace('.', '')
                        # what remains is stadium
                        if not stadium:
                            stadium = re.sub(r'\s*\(.*?\)\s*', '', p).strip()
                    else:
                        if not stadium:
                            stadium = p
                        elif not referee:
                            # if it's the referee name alone after "Arbitro:" which was eaten
                            pass
                            
                # Many times referee name is in the next part
                referee_found = False
                for i, p in enumerate(parts):
                    if 'arbitro' in p.lower():
                        ref_val = p.replace('Arbitro:', '').replace('Arbitro', '').strip()
                        if ref_val:
                            referee = ref_val
                        elif i + 1 < len(parts):
                            referee = parts[i+1].strip()
                        referee_found = True
                        break
                        
                stadium = re.sub(r'\s*\(.*?\)\s*', '', stadium).strip()
                
                # MARCATORI
                h_scorers, a_scorers = [], []
                if len(trs) > 1:
                    subtable = trs[1].find('table', class_='idc-subtable')
                    if subtable:
                        for str_el in subtable.find_all('tr'):
                            sub_tds = str_el.find_all('td', recursive=False)
                            if len(sub_tds) >= 3:
                                # Replace <br> with | to split multiple scorers
                                for td in [sub_tds[0], sub_tds[2]]:
                                    for br in td.find_all('br'):
                                        br.replace_with('|')
                                h_parts = [x.strip() for x in sub_tds[0].text.split('|') if x.strip() and x.strip() != 'Marcatori']
                                a_parts = [x.strip() for x in sub_tds[2].text.split('|') if x.strip() and x.strip() != 'Marcatori']
                                
                                h_scorers.extend(h_parts)
                                a_scorers.extend(a_parts)

                comp = current_context
                if any(x in comp for x in ['Serie A', 'Campionato', 'Divisione Nazionale']): comp = 'Serie A'
                elif 'Coppa Italia' in comp: comp = 'Coppa Italia'
                elif any(x in comp for x in ['Coppa UEFA', 'Europa League', 'Coppa delle Fiere']): comp = 'Coppa UEFA'
                elif any(x in comp for x in ['Champions League', 'Coppa dei Campioni']): comp = 'Champions League'
                else: comp = 'Altra Competizione'
                    
                hc = make_code(home_raw) if 'napoli' not in home_raw.lower() else 'NAP'
                ac = make_code(away_raw) if 'napoli' not in away_raw.lower() else 'NAP'
                match_id = f"{match_date.replace('-','')}-{hc}-{ac}"
                
                notes = f"Arbitro: {referee}" if referee else ""
                
                matches.append({
                    'match_id': match_id, 'date': match_date, 'season': season_str,
                    'competition': comp, 'home_raw_name': home_raw, 'away_raw_name': away_raw,
                    'home_goals': h_goals, 'away_goals': a_goals, 'stadium': stadium,
                    'attendance': attendance, 'home_scorers': ', '.join(h_scorers), 'away_scorers': ', '.join(a_scorers),
                    'notes': notes
                })
            except Exception as e:
                print(f"Warning: errore parsing tabella in {season_str} - {e}")
                
    print(f"Estratte {len(matches)} partite.")
    comp_counts = {}
    for m in matches: comp_counts[m['competition']] = comp_counts.get(m['competition'], 0) + 1
    for k, v in comp_counts.items(): print(f"  - {k}: {v}")
        
    csv_file = os.path.join(WIKI_DIR, f"{season_str}.csv")
    if matches:
        with open(csv_file, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=matches[0].keys())
            writer.writeheader()
            writer.writerows(matches)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Uso: python 70_import_wikipedia.py YYYY")
        sys.exit(1)
    process_season(sys.argv[1])
