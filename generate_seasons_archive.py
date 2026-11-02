import sqlite3
import json
import os

db_path = r'sscnapolidata\db\datanapoli.sqlite'
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
c = conn.cursor()

# Get all fixtures
c.execute("""
    SELECT 
        match_id, season, competition, matchday, match_date, match_time,
        venue, opponent_name, system_of_play, attendance, result,
        home_goals, away_goals
    FROM season_fixtures
    ORDER BY match_date DESC
""")
all_fixtures = c.fetchall()

# Group by season
seasons_map = {}
for r in all_fixtures:
    s_year = r['season']
    if s_year not in seasons_map:
        seasons_map[s_year] = {
            'season_year': s_year,
            'season_label': f"{s_year}-{str(s_year + 1)[-2:]}",
            'matches_count': 0,
            'wins': 0,
            'draws': 0,
            'losses': 0,
            'goals_for': 0,
            'goals_against': 0,
            'competitions': set(),
            'notable_badge': None,
            'matches': []
        }
    
    venue = r['venue'] # 'H' or 'A'
    is_home = (venue == 'H')
    hg = r['home_goals'] if r['home_goals'] is not None else 0
    ag = r['away_goals'] if r['away_goals'] is not None else 0
    
    # Calculate result for Napoli
    # in season_fixtures, home_goals is home team, away_goals is away team
    # if venue == 'H', Napoli is home
    if is_home:
        nap_goals = hg
        opp_goals = ag
    else:
        nap_goals = ag
        opp_goals = hg
        
    if nap_goals > opp_goals:
        res = 'V'
    elif nap_goals == opp_goals:
        res = 'N'
    else:
        res = 'P'
        
    s_data = seasons_map[s_year]
    s_data['matches_count'] += 1
    if res == 'V':
        s_data['wins'] += 1
    elif res == 'N':
        s_data['draws'] += 1
    else:
        s_data['losses'] += 1
        
    s_data['goals_for'] += nap_goals
    s_data['goals_against'] += opp_goals
    comp = r['competition'] or 'Serie A'
    s_data['competitions'].add(comp)
    
    s_data['matches'].append({
        'id': r['match_id'],
        'date': r['match_date'],
        'time': r['match_time'] or '15:00',
        'competition': comp,
        'matchday': r['matchday'] or '',
        'is_home': is_home,
        'venue_letter': venue,
        'home_team': 'Napoli' if is_home else r['opponent_name'],
        'away_team': r['opponent_name'] if is_home else 'Napoli',
        'home_goals': hg,
        'away_goals': ag,
        'result_for_napoli': res,
        'attendance': r['attendance'],
    })

# Add notable badges for landmark seasons
notable_map = {
    1986: '🏆 1° Scudetto & Coppa Italia',
    1989: '🏆 2° Scudetto & Supercoppa',
    2022: '🏆 3° Scudetto Tricolore',
    1988: '🏆 Coppa UEFA 1989',
    1961: '🏆 Coppa Italia in Serie B',
    1975: '🏆 Coppa Italia & Coppa Italo-Inglese',
    2011: '🏆 Coppa Italia 2012',
    2013: '🏆 Coppa Italia & Supercoppa 2014',
    2019: '🏆 Coppa Italia 2020',
    2017: '⭐ 91 Punti Record Serie A',
}

sorted_seasons = []
for s_year in sorted(seasons_map.keys(), reverse=True):
    s_obj = seasons_map[s_year]
    s_obj['competitions'] = sorted(list(s_obj['competitions']))
    if s_year in notable_map:
        s_obj['notable_badge'] = notable_map[s_year]
    sorted_seasons.append(s_obj)

print(f"Exporting {len(sorted_seasons)} seasons...")

out_dirs = [
    r'sscnapolidata\src\data\generated',
    r'sscnapolidata\public\data',
    r'sscnapolidata\data\exports'
]

for od in out_dirs:
    os.makedirs(od, exist_ok=True)
    with open(os.path.join(od, 'seasons_archive.json'), 'w', encoding='utf-8') as f:
        json.dump(sorted_seasons, f, indent=2, ensure_ascii=False)

print("seasons_archive.json exported successfully!")
conn.close()

