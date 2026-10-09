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
    'SPAL 2013 Ferrara': ('SPAL', 'SPAL 2013 Ferrara'),
    'Modena FC': ('Modena', 'Modena FC'),
    'Palermo FC': ('Palermo', 'Palermo FC'),
    'Pro Vercelli': ('Pro Vercelli', 'FC Pro Vercelli 1892'),
    'Sampierdarenese': ('Sampierdarenese', 'AC Sampierdarenese'),
    'Liguria': ('Liguria', 'AC Liguria'),
    'Novese': ('Novese', 'US Novese'),
    'Casale': ('Casale', 'AS Casale'),
    'Stoccarda': ('Stoccarda', 'VfB Stuttgart'),
    'Porto': ('Porto', 'FC Porto'),
    'Real Sociedad': ('Real Sociedad', 'Real Sociedad'),
    'Burnley': ('Burnley', 'Burnley FC'),
    'Spartak Mosca': ('Spartak Mosca', 'Spartak Mosca'),
    'AIK': ('AIK', 'AIK Solna'),
    'APOEL': ('APOEL', 'APOEL FC'),
    'AZ': ('AZ Alkmaar', 'AZ Alkmaar'),
    'Admira Vienna': ('Admira Vienna', 'FC Admira Wacker Modling'),
    'Ajax': ('Ajax', 'AFC Ajax'),
    'AlbinoLeffe': ('AlbinoLeffe', 'UC AlbinoLeffe'),
    'Alessandria': ('Alessandria', 'US Alessandria Calcio 1912'),
    'Alzano Virescit': ('Alzano Virescit', 'Alzano Virescit'),
    'Ancona': ('Ancona', 'US Ancona'),
    'Anconitana': ('Ancona', 'US Ancona'),
    'Anconitana-Bianchi': ('Ancona', 'US Ancona'),
    'Anderlecht': ('Anderlecht', 'RSC Anderlecht'),
    'Andrea Doria': ('Andrea Doria', 'SG Andrea Doria'),
    'Arezzo': ('Arezzo', 'US Arezzo'),
    'Arsenaltaranto': ('Taranto', 'Taranto FC 1927'),
    'Ascoli': ('Ascoli', 'Ascoli Calcio 1898 FC'),
    'Avellino': ('Avellino', 'US Avellino 1912'),
    'Bangor City': ('Bangor City', 'Bangor City FC'),
    'Bank Ostrava OKD': ('Banik Ostrava', 'FC Banik Ostrava'),
    'Baník Ostrava OKD': ('Banik Ostrava', 'FC Banik Ostrava'),
    'Bari': ('Bari', 'SSC Bari'),
    'Barletta': ('Barletta', 'Barletta 1922'),
    'Bayern Monaco': ('Bayern Monaco', 'FC Bayern Monaco'),
    'Benfica': ('Benfica', 'SL Benfica'),
    'Biellese': ('Biellese', 'AS Biellese'),
    'Boavista': ('Boavista', 'Boavista FC'),
    'Bod/Glimt': ('Bodo/Glimt', 'FK Bodo/Glimt'),
    'Bodø/Glimt': ('Bodo/Glimt', 'FK Bodo/Glimt'),
    'Bordeaux': ('Bordeaux', 'FC Girondins de Bordeaux'),
    'Brindisi': ('Brindisi', 'Brindisi FC'),
    'Casertana': ('Casertana', 'Casertana FC'),
    'Catanzaro': ('Catanzaro', 'US Catanzaro 1929'),
    'Cavese': ('Cavese', 'Cavese 1919'),
    'Chelsea': ('Chelsea', 'Chelsea FC'),
    'Cosenza': ('Cosenza', 'Cosenza Calcio'),
    'Dinamo Tbilisi': ('Dinamo Tbilisi', 'FC Dinamo Tbilisi'),
    'Dnipro': ('Dnipro', 'FC Dnipro'),
    'Eintracht Francoforte': ('Eintracht Francoforte', 'Eintracht Francoforte'),
    'Elfsborg': ('Elfsborg', 'IF Elfsborg'),
    'Fanfulla': ('Fanfulla', 'ASD Fanfulla'),
    'Fermana': ('Fermana', 'Fermana FC'),
    'Fidelis Andria': ('Fidelis Andria', 'Fidelis Andria 2018'),
    'Fiumana': ('Fiumana', 'CS Fiumana'),
    'Foggia': ('Foggia', 'Calcio Foggia 1920'),
    'Foggia & Incedit': ('Foggia', 'Calcio Foggia 1920'),
    'Genova 1893': ('Genoa', 'Genoa CFC'),
    'Granada': ('Granada', 'Granada CF'),
    'Grasshopper': ('Grasshopper', 'Grasshopper Club Zurich'),
    'Kaiserslautern': ('Kaiserslautern', '1. FC Kaiserslautern'),
    'L.R. Vicenza': ('Vicenza', 'LR Vicenza'),
    'Lanerossi Vicenza': ('Vicenza', 'LR Vicenza'),
    'La Dominante': ('La Dominante', 'FBC La Dominante'),
    'Lanciano': ('Virtus Lanciano', 'SS Virtus Lanciano 1924'),
    'Lecco': ('Lecco', 'Calcio Lecco 1912'),
    'Leeds Utd': ('Leeds Utd', 'Leeds United FC'),
    'Legnano': ('Legnano', 'AC Legnano'),
    'Liverpool': ('Liverpool', 'Liverpool FC'),
    'Lokomotive Lipsia': ('Lokomotive Lipsia', '1. FC Lokomotive Lipsia'),
    'Lucchese': ('Lucchese', 'Lucchese 1905'),
    'MATER': ('MATER', 'MATER Roma'),
    'Manchester City': ('Manchester City', 'Manchester City FC'),
    'Mantova': ('Mantova', 'Mantova 1911'),
    'Messina': ('Messina', 'ACR Messina'),
    'Metz': ('Metz', 'FC Metz'),
    'Milano': ('Milan', 'AC Milan'),
    'Novara': ('Novara', 'Novara FC'),
    'OFK Belgrado': ('OFK Belgrado', 'OFK Belgrado'),
    'Odense': ('Odense', 'Odense Boldklub'),
    'Olympiakos': ('Olympiakos', 'Olympiakos FC'),
    'PAOK': ('PAOK', 'PAOK FC'),
    'PSV': ('PSV', 'PSV Eindhoven'),
    'Padova': ('Padova', 'Calcio Padova'),
    'Palermo-Juventina': ('Palermo', 'Palermo FC'),
    'Paniōnios': ('Panionios', 'Panionios GSS'),
    'Paris Saint-Germain': ('Paris Saint-Germain', 'Paris Saint-Germain FC'),
    'Perugia': ('Perugia', 'AC Perugia Calcio'),
    'Piacenza': ('Piacenza', 'Piacenza Calcio 1919'),
    'Pistoiese': ('Pistoiese', 'US Pistoiese 1921'),
    'Potenza': ('Potenza', 'Potenza Calcio'),
    'Prato': ('Prato', 'AC Prato'),
    'Pro Livorno': ('Pro Livorno', 'Pro Livorno 1919'),
    'Pro Patria': ('Pro Patria', 'Aurora Pro Patria 1919'),
    'Pro Sesto': ('Pro Sesto', 'Pro Sesto 1913'),
    'Radnički Niš': ('Radnicki Nis', 'Radnicki Nis'),
    'Rapid Bucarest': ('Rapid Bucarest', 'FC Rapid Bucarest'),
    'Ravenna': ('Ravenna', 'Ravenna FC 1913'),
    'Real Madrid': ('Real Madrid', 'Real Madrid CF'),
    'Reggiana': ('Reggiana', 'AC Reggiana 1919'),
    'Reggina': ('Reggina', 'Reggina 1914'),
    'Rijeka': ('Rijeka', 'HNK Rijeka'),
    'Rimini': ('Rimini', 'Rimini FC'),
    'SPAL 2013 Ferrara': ('SPAL', 'SPAL 2013 Ferrara'),
    'Sambenedettese': ('Sambenedettese', 'AS Sambenedettese'),
    'Savoia': ('Savoia', 'US Savoia 1908'),
    'Savona': ('Savona', 'Savona FBC'),
    'Seregno': ('Seregno', 'Seregno Calcio'),
    'Sestrese': ('Sestrese', 'FS Sestrese Calcio 1919'),
    'Siena': ('Siena', 'ACN Siena 1904'),
    'Simmenthal-Monza': ('Monza', 'AC Monza'),
    'Siracusa': ('Siracusa', 'Siracusa Calcio 1924'),
    'Skonto': ('Skonto', 'Skonto Riga'),
    'Sorrento': ('Sorrento', 'Sorrento Calcio 1945'),
    'Southampton': ('Southampton', 'Southampton FC'),
    'Sporting Lisbona': ('Sporting Lisbona', 'Sporting CP'),
    'Standard Liegi': ('Standard Liegi', 'Standard Liegi'),
    'Steaua Bucarest': ('Steaua Bucarest', 'FCSB'),
    'Talmone Torino': ('Torino', 'Torino FC'),
    'Taranto': ('Taranto', 'Taranto FC 1927'),
    'Ternana': ('Ternana', 'Ternana Calcio'),
    'Tolosa': ('Tolosa', 'Toulouse FC'),
    'Torpedo Mosca': ('Torpedo Mosca', 'Torpedo Mosca'),
    'Trani': ('Trani', 'Vigor Trani Calcio'),
    'Treviso': ('Treviso', 'Treviso FBC 1993'),
    'Triestina': ('Triestina', 'US Triestina Calcio 1918'),
    'Utrecht': ('Utrecht', 'FC Utrecht'),
    'Valencia': ('Valencia', 'Valencia CF'),
    'Varese': ('Varese', 'Citta di Varese'),
    'Verona': ('Hellas Verona', 'Hellas Verona FC'),
    'Vicenza': ('Vicenza', 'LR Vicenza'),
    'Videoton': ('Videoton', 'Fehervar FC'),
    'Viktoria Plzeň': ('Viktoria Plzen', 'FC Viktoria Plzen'),
    'Villarreal': ('Villarreal', 'Villarreal CF'),
    'Vllaznia': ('Vllaznia', 'KF Vllaznia'),
    'Werder Brema': ('Werder Brema', 'SV Werder Brema'),
    'Wettingen': ('Wettingen', 'FC Wettingen'),
    'Wiener SK': ('Wiener SK', 'Wiener Sport-Club'),
    'jpesti Dzsa': ('Ujpest', 'Ujpest FC'),
    'Újpesti Dózsa': ('Ujpest', 'Ujpest FC'),
    'Śląsk Breslavia': ('Slask Breslavia', 'WKS Slask Breslavia')
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
