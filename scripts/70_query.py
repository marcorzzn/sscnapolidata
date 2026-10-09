import sys
import argparse
import sqlite3
import json
import os
import sys
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'db', 'datanapoli.sqlite')

def get_db():
    if not os.path.exists(DB_PATH):
        print(f"Errore: Database non trovato in {DB_PATH}")
        sys.exit(1)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def print_table(headers, rows, as_json=False):
    if as_json:
        data = [dict(zip(headers, row)) for row in rows]
        print(json.dumps(data, indent=2, ensure_ascii=False))
        return

    if not rows:
        print("Nessun risultato trovato.")
        return

    str_rows = [[str(item) if item is not None else "" for item in row] for row in rows]
    col_widths = [max(len(str(item)) for item in col) for col in zip(*([headers] + str_rows))]
    
    header_str = " | ".join(f"{h:<{w}}" for h, w in zip(headers, col_widths))
    separator = "-+-".join("-" * w for w in col_widths)
    
    print(header_str)
    print(separator)
    for row in str_rows:
        print(" | ".join(f"{item:<{w}}" for item, w in zip(row, col_widths)))

def cmd_stagioni(args):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT s.nome as stagione, s.anno_inizio, s.anno_fine, COUNT(p.id) as n_partite
        FROM stagioni s
        LEFT JOIN partite p ON s.id = p.stagione_id
        GROUP BY s.id
        ORDER BY s.anno_inizio ASC
    ''')
    rows = cursor.fetchall()
    print_table(["Stagione", "Inizio", "Fine", "Partite"], [[r['stagione'], r['anno_inizio'], r['anno_fine'], r['n_partite']] for r in rows], args.json)

def cmd_squadre(args):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT 
            sq.nome,
            COUNT(p.id) as n_partite,
            SUM(CASE WHEN p.squadra_casa_id = n.id THEN p.gol_casa ELSE p.gol_trasferta END) as gol_fatti,
            SUM(CASE WHEN p.squadra_casa_id = n.id THEN p.gol_trasferta ELSE p.gol_casa END) as gol_subiti
        FROM squadre sq
        LEFT JOIN partite p ON p.squadra_casa_id = sq.id OR p.squadra_trasferta_id = sq.id
        LEFT JOIN squadre n ON n.nome = 'Napoli'
        WHERE sq.nome != 'Napoli'
        GROUP BY sq.id
        ORDER BY n_partite DESC, sq.nome ASC
    ''')
    rows = cursor.fetchall()
    print_table(["Squadra", "Partite", "Gol Fatti (Napoli)", "Gol Subiti (Napoli)"], [[r['nome'], r['n_partite'], r['gol_fatti'], r['gol_subiti']] for r in rows], args.json)

def cmd_competizioni(args):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT c.nome, COUNT(p.id) as n_partite
        FROM competizioni c
        LEFT JOIN partite p ON c.id = p.competizione_id
        GROUP BY c.id
        ORDER BY n_partite DESC
    ''')
    rows = cursor.fetchall()
    print_table(["Competizione", "Partite"], [[r['nome'], r['n_partite']] for r in rows], args.json)

def _query_matches(conn, where_clause, params, order_by="p.data ASC"):
    cursor = conn.cursor()
    cursor.execute(f'''
        SELECT p.data, c.nome as competizione, sc.nome as squadra_casa, st.nome as squadra_trasferta, 
               p.gol_casa, p.gol_trasferta
        FROM partite p
        LEFT JOIN competizioni c ON p.competizione_id = c.id
        LEFT JOIN squadre sc ON p.squadra_casa_id = sc.id
        LEFT JOIN squadre st ON p.squadra_trasferta_id = st.id
        WHERE {where_clause}
        ORDER BY {order_by}
    ''', params)
    return cursor.fetchall()

def cmd_stagione(args):
    conn = get_db()
    rows = _query_matches(conn, "p.stagione_id = (SELECT id FROM stagioni WHERE nome = ?)", (args.nome,))
    print_table(["Data", "Competizione", "Squadra Casa", "Squadra Trasferta", "Gol Casa", "Gol Trasferta"], 
                [[r['data'], r['competizione'], r['squadra_casa'], r['squadra_trasferta'], r['gol_casa'], r['gol_trasferta']] for r in rows], args.json)

def cmd_anno(args):
    conn = get_db()
    rows = _query_matches(conn, "strftime('%Y', p.data) = ?", (str(args.anno),))
    print_table(["Data", "Competizione", "Squadra Casa", "Squadra Trasferta", "Gol Casa", "Gol Trasferta"], 
                [[r['data'], r['competizione'], r['squadra_casa'], r['squadra_trasferta'], r['gol_casa'], r['gol_trasferta']] for r in rows], args.json)

def cmd_intervallo(args):
    conn = get_db()
    rows = _query_matches(conn, "strftime('%Y', p.data) >= ? AND strftime('%Y', p.data) <= ?", (str(args.start), str(args.end)))
    print_table(["Data", "Competizione", "Squadra Casa", "Squadra Trasferta", "Gol Casa", "Gol Trasferta"], 
                [[r['data'], r['competizione'], r['squadra_casa'], r['squadra_trasferta'], r['gol_casa'], r['gol_trasferta']] for r in rows], args.json)

def calc_vs(rows):
    v = p = s = gf = gs = 0
    for r in rows:
        gc, gt = r['gol_casa'], r['gol_trasferta']
        if gc is None or gt is None: continue
        sc = r['squadra_casa']
        if sc.lower() == 'napoli':
            gf += gc
            gs += gt
            if gc > gt: v += 1
            elif gc < gt: s += 1
            else: p += 1
        else:
            gf += gt
            gs += gc
            if gt > gc: v += 1
            elif gt < gc: s += 1
            else: p += 1
    return v, p, s, gf, gs

def cmd_vs(args, order="DESC"):
    conn = get_db()
    rows = _query_matches(conn, "(sc.nome LIKE ? OR st.nome LIKE ?) AND (sc.nome = 'Napoli' OR st.nome = 'Napoli')", 
                          (f'%{args.avversario}%', f'%{args.avversario}%'), order_by=f"p.data {order}")
    print_table(["Data", "Competizione", "Squadra Casa", "Squadra Trasferta", "Risultato"], 
                [[r['data'], r['competizione'], r['squadra_casa'], r['squadra_trasferta'], f"{r['gol_casa']}-{r['gol_trasferta']}"] for r in rows], args.json)
    if not args.json and rows:
        v, p, s, gf, gs = calc_vs(rows)
        print(f"\nRiepilogo: {v}V {p}P {s}S, {gf} gol fatti, {gs} gol subiti")

def cmd_eterna(args):
    if not args.json:
        print(f"La Partita Eterna: Napoli vs {args.avversario.capitalize()}\n")
    if not args.json:
        print("Nota: il database contiene solo le partite importate finora (133 partite, 4 stagioni). L'aggregato storico completo richiede il popolamento dell'archivio 1926-oggi.\n")
    cmd_vs(args, order="ASC")

def cmd_marcatori(args):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT p.nome_completo, sq.nome as squadra, COUNT(m.id) as n_gol, group_concat(m.minuto, ', ') as minuti
        FROM marcatori m
        JOIN persone p ON m.persona_id = p.id
        JOIN squadre sq ON m.squadra_id = sq.id
        JOIN partite part ON m.partita_id = part.id
        JOIN stagioni st ON part.stagione_id = st.id
        WHERE st.nome = ?
        GROUP BY p.id, sq.id
        ORDER BY n_gol DESC
    ''', (args.stagione,))
    rows = cursor.fetchall()
    print_table(["Giocatore", "Squadra", "Gol", "Minuti"], [[r['nome_completo'], r['squadra'], r['n_gol'], r['minuti']] for r in rows], args.json)

def cmd_gol(args):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT part.data, sc.nome || ' - ' || st.nome as partita, m.minuto, sq.nome as squadra, p.nome_completo
        FROM marcatori m
        JOIN persone p ON m.persona_id = p.id
        JOIN partite part ON m.partita_id = part.id
        JOIN squadre sc ON part.squadra_casa_id = sc.id
        JOIN squadre st ON part.squadra_trasferta_id = st.id
        JOIN squadre sq ON m.squadra_id = sq.id
        WHERE p.cognome LIKE ?
        ORDER BY part.data ASC
    ''', (f'%{args.cognome}%',))
    rows = cursor.fetchall()
    print_table(["Data", "Partita", "Minuto", "Squadra", "Marcatore"], [[r['data'], r['partita'], r['minuto'], r['squadra'], r['nome_completo']] for r in rows], args.json)

def cmd_cerca(args):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM documenti")
    if cursor.fetchone()[0] == 0:
        if not args.json:
            print("Nessun documento nell'archivio. Usa ingest/ingest.py per aggiungerne.")
        return
        
    cursor.execute('''
        SELECT d.id, d.titolo, d.fonte, d.data_raccolta, substr(d.testo_completo, 1, 200) || '...' as estratto
        FROM documenti_fts fts
        JOIN documenti d ON fts.rowid = d.id
        WHERE documenti_fts MATCH ?
        ORDER BY rank
    ''', (args.testo,))
    rows = cursor.fetchall()
    print_table(["ID", "Titolo", "Fonte", "Data", "Estratto"], [[r['id'], r['titolo'], r['fonte'], r['data_raccolta'], r['estratto']] for r in rows], args.json)

def print_help():
    help_text = """
Utilizzo: python scripts/70_query.py <comando> [argomenti] [--json]

Comandi disponibili:
  stagioni                      Elenca tutte le stagioni
  squadre                       Elenca tutte le squadre affrontate
  competizioni                  Elenca le competizioni
  stagione <nome>               Tutte le partite di una stagione (es. '1986-87')
  anno <YYYY>                   Tutte le partite di un anno solare (es. '1986')
  intervallo <YYYY> <YYYY>      Partite in un intervallo di anni (es. '1986 1990')
  vs <avversario>               I precedenti contro una squadra (es. 'juventus')
  eterna <avversario>           La Partita Eterna: storico completo
  marcatori <stagione>          Marcatori di una stagione
  gol <cognome>                 Tutti i gol di un giocatore
  cerca <testo>                 Ricerca full-text nei documenti testuali
  help                          Mostra questo messaggio di aiuto
"""
    print(help_text)

def main():
    if len(sys.argv) < 2 or sys.argv[1] in ('help', '-h', '--help'):
        print_help()
        sys.exit(0)
        
    args_list = sys.argv[1:]
    as_json = '--json' in args_list
    if as_json:
        args_list.remove('--json')
        
    if not args_list:
        print_help()
        sys.exit(0)
        
    cmd = args_list[0].lower()
    
    class Args:
        pass
    args = Args()
    args.json = as_json
    
    try:
        if cmd == 'stagioni':
            cmd_stagioni(args)
        elif cmd == 'squadre':
            cmd_squadre(args)
        elif cmd == 'competizioni':
            cmd_competizioni(args)
        elif cmd == 'stagione':
            if len(args_list) < 2: raise ValueError("Specificare nome stagione")
            args.nome = args_list[1]
            cmd_stagione(args)
        elif cmd == 'anno':
            if len(args_list) < 2: raise ValueError("Specificare anno")
            args.anno = args_list[1]
            cmd_anno(args)
        elif cmd == 'intervallo':
            if len(args_list) < 3: raise ValueError("Specificare anno inizio e fine")
            args.start, args.end = args_list[1], args_list[2]
            cmd_intervallo(args)
        elif cmd == 'vs':
            if len(args_list) < 2: raise ValueError("Specificare avversario")
            args.avversario = " ".join(args_list[1:])
            cmd_vs(args)
        elif cmd == 'eterna':
            if len(args_list) < 2: raise ValueError("Specificare avversario")
            args.avversario = " ".join(args_list[1:])
            cmd_eterna(args)
        elif cmd == 'marcatori':
            if len(args_list) < 2: raise ValueError("Specificare stagione")
            args.stagione = args_list[1]
            cmd_marcatori(args)
        elif cmd == 'gol':
            if len(args_list) < 2: raise ValueError("Specificare cognome giocatore")
            args.cognome = args_list[1]
            cmd_gol(args)
        elif cmd == 'cerca':
            if len(args_list) < 2: raise ValueError("Specificare testo da cercare")
            args.testo = " ".join(args_list[1:])
            cmd_cerca(args)
        else:
            print(f"Comando '{cmd}' non riconosciuto.")
            print_help()
    except Exception as e:
        if not as_json:
            print(f"Errore: {e}")

if __name__ == '__main__':
    main()
