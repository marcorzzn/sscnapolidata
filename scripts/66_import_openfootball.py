import os
import re
import csv
from datetime import datetime

base_dir = r"C:\Users\marco\openfootball-test\italy"
out_file = r"C:\Users\marco\sscnapolidata-remoto\data\import\openfootball.csv"

re_old = re.compile(r'^\s*(?:[\d:]+\s+)?(.*?)\s+v\s+(.*?)\s+(\d+)\s*-\s*(\d+)(?:\s+\((.*?)\))?')
re_new = re.compile(r'^\s*(?:[\d:]+\s+)?(.*?)\s+(\d+)\s*-\s*(\d+)(?:\s+\((.*?)\))?\s+(.*?)$')
re_date = re.compile(r'^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d+)(?:\s+(\d{4}))?')

def make_code(name):
    letters = ''.join(c for c in name if c.isalpha())
    return letters[:3].upper() if letters else 'UNK'

total_matches = 0
napoli_matches = 0
season_stats = {}
comp_stats = {}
matches_data = []
months = {'Jan':1,'Feb':2,'Mar':3,'Apr':4,'May':5,'Jun':6,'Jul':7,'Aug':8,'Sep':9,'Oct':10,'Nov':11,'Dec':12}

for dp, dn, filenames in os.walk(base_dir):
    season_folder = os.path.basename(dp)
    if not re.match(r'\d{4}-\d{2}', season_folder): continue
    start_year = int(season_folder.split('-')[0])
    
    for f in filenames:
        if not f.endswith('.txt'): continue
        if 'squads' in dp: continue
        if '-full' in f: continue # Skip full to avoid duplicates
        
        filepath = os.path.join(dp, f)
        comp = 'Serie A' if '1-seriea' in f else ('Serie B' if '2-serieb' in f else ('Coppa Italia' if 'cup' in f else ('Serie C' if '3-seriec' in f else 'Altro')))
        
        with open(filepath, 'r', encoding='utf-8') as file:
            lines = file.readlines()
            
        current_date = None
        for i, line in enumerate(lines):
            line = line.rstrip()
            if not line or line.startswith('#') or line.startswith('='): continue
            
            dmatch = re_date.match(line.strip())
            if dmatch:
                month_str = dmatch.group(2)
                day_str = dmatch.group(3)
                year_str = dmatch.group(4)
                m = months[month_str]
                d = int(day_str)
                if year_str: y = int(year_str)
                else: y = start_year if m >= 7 else start_year + 1
                current_date = f"{y:04d}-{m:02d}-{d:02d}"
                continue
            
            match = None
            if ' v ' in line:
                m = re_old.match(line)
                if m:
                    home, away, hg, ag, ht = m.groups()
                    match = (home.strip(), away.strip(), hg, ag, ht)
            elif '-' in line and not line.strip().startswith('['):
                m = re_new.match(line)
                if m:
                    home, hg, ag, ht, away = m.groups()
                    match = (home.strip(), away.strip(), hg, ag, ht)
            
            if match:
                total_matches += 1
                h_name, a_name, hg, ag, ht = match
                
                if 'napoli' in h_name.lower() or 'napoli' in a_name.lower():
                    napoli_matches += 1
                    season_stats[season_folder] = season_stats.get(season_folder, 0) + 1
                    comp_stats[comp] = comp_stats.get(comp, 0) + 1
                    
                    if not current_date: continue
                    h_code = make_code(h_name) if 'napoli' not in h_name.lower() else 'NAP'
                    a_code = make_code(a_name) if 'napoli' not in a_name.lower() else 'NAP'
                    match_id = f"{current_date.replace('-', '')}-{h_code}-{a_code}"
                    
                    matches_data.append({
                        'match_id': match_id,
                        'date': current_date,
                        'season': season_folder,
                        'competition': comp,
                        'home_raw_name': h_name,
                        'away_raw_name': a_name,
                        'home_goals': hg,
                        'away_goals': ag,
                        'stadium': '',
                        'attendance': '',
                        'home_scorers': '',
                        'away_scorers': '',
                        'notes': f"HT: {ht}" if ht else ''
                    })

with open(out_file, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['match_id','date','season','competition','home_raw_name','away_raw_name','home_goals','away_goals','stadium','attendance','home_scorers','away_scorers','notes'])
    writer.writeheader()
    writer.writerows(matches_data)

print(f"Total parsed matches: {total_matches}")
print(f"Napoli matches: {napoli_matches}")
