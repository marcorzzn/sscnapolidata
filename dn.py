#!/usr/bin/env python3
"""
DATA NAPOLI — CLI Unificata (dn.py)
Strumento da riga di comando per la gestione, audit, arricchimento ed export di SSC Napoli Data (@sscnapolidata).
"""

import os
import sys
import argparse
import json
import sqlite3

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Ensure datanapoli and scripts can be imported
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from datanapoli.db import get_db, session_scope, set_session, DB_PATH
from datanapoli.migrate import run_migrations, stamp_baseline
from datanapoli.audit import get_history, revert_entry, revert_batch, generate_all_triggers_sql
from datanapoli.dump import dump_database, build_database
from datanapoli.export import export_site_data
from datanapoli.check import check_invariants
from datanapoli.importers.csv_importer import import_csv

def print_table(headers, rows):
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

# Subcommand: fix
def handle_fix(args):
    conn = get_db()
    cursor = conn.cursor()
    tabella = args.tabella.lower()
    pk = args.id
    campo = args.campo.lower()
    valore = args.valore
    
    # Cast value if numeric or null
    parsed_val = None if valore.lower() in ('null', 'none') else int(valore) if valore.isdigit() else valore
    
    # Check if table and column exist
    cursor.execute(f"PRAGMA table_info({tabella})")
    cols_info = cursor.fetchall()
    if not cols_info:
        print(f"Errore: Tabella '{tabella}' non trovata.")
        return 1
        
    cols = [c['name'] for c in cols_info]
    if campo not in cols:
        print(f"Errore: Campo '{campo}' non trovato nella tabella '{tabella}'.")
        return 1
        
    pk_cols = [c['name'] for c in cols_info if c['pk'] > 0]
    pk_col = pk_cols[0] if pk_cols else 'id'
    
    # Check existing record
    cursor.execute(f"SELECT * FROM {tabella} WHERE {pk_col} = ?", (pk,))
    existing = cursor.fetchone()
    if not existing:
        print(f"Errore: Record #{pk} non trovato in '{tabella}'.")
        return 1
        
    if args.fonte:
        cursor.execute("SELECT id FROM fonti WHERE id = ?", (args.fonte,))
        if not cursor.fetchone():
            print(f"Errore: Fonte ID {args.fonte} non trovata nella tabella 'fonti'.")
            conn.close()
            return 1

    verificato_val = 1 if args.fonte else (existing['verificato'] if 'verificato' in cols else 0)
    batch_id = f"fix-{args.tabella}-{pk}"
    
    with session_scope(conn, attore=args.attore or 'marco', motivo=args.motivo or 'Correzione manuale CLI dn.py', fonte_id=args.fonte, batch_id=batch_id):
        # Update field
        cursor.execute(f"UPDATE {tabella} SET {campo} = ? WHERE {pk_col} = ?", (parsed_val, pk))
        # If table has verificato column, set it
        if 'verificato' in cols and args.fonte:
            cursor.execute(f"UPDATE {tabella} SET verificato = 1, verificato_da = ?, verificato_il = strftime('%Y-%m-%dT%H:%M:%fZ','now'), fonte_id = ? WHERE {pk_col} = ?", (args.attore or 'marco', args.fonte, pk))
        conn.commit()
        
    print(f"[OK] Record {tabella}#{pk}.{campo} aggiornato con successo a: {parsed_val}")
    if args.fonte:
        print(f"     Record contrassegnato come verificato=1 (Fonte ID: {args.fonte}).")
    conn.close()
    return 0

# Subcommand: history
def handle_history(args):
    conn = get_db()
    rows = get_history(conn, table=args.tabella, pk=args.id, limit=args.limit)
    if not rows:
        print("Nessun evento di audit trovato.")
        conn.close()
        return 0
        
    headers = ["Audit ID", "Timestamp UTC", "Tabella", "PK", "Az", "Campo", "Vecchio -> Nuovo", "Attore / Motivo"]
    formatted = []
    for r in rows:
        v_str = f"{r['vecchio'] or 'NULL'} -> {r['nuovo'] or 'NULL'}" if r['azione'] == 'U' else (r['nuovo'] or r['vecchio'] or '')
        formatted.append([
            r['audit_id'],
            r['ts'][:19],
            r['tabella'],
            r['pk'],
            r['azione'],
            r['campo'] or '-',
            (v_str[:32] + '..') if len(v_str) > 34 else v_str,
            f"{r['attore']} ({r['motivo'] or ''})"
        ])
    print_table(headers, formatted)
    conn.close()
    return 0

# Subcommand: revert
def handle_revert(args):
    conn = get_db()
    if args.audit_id:
        res = revert_entry(conn, args.audit_id, attore=args.attore or 'revert-operator')
        print(f"[OK] Revert completato per audit_id #{args.audit_id}: {res['tabella']}#{res['pk']}.{res['campo']} ripristinato a: {res['restored_value']}")
    elif args.batch:
        results = revert_batch(conn, args.batch, attore=args.attore or 'revert-operator')
        print(f"[OK] Revert completato per batch '{args.batch}': ripristinati {len(results)} campi.")
    else:
        print("Errore: Specificare --audit-id o --batch da annullare.")
        return 1
    conn.close()
    return 0

# Subcommand: merge
def handle_merge(args):
    entita = args.entita.lower()
    if entita not in ('persone', 'squadre'):
        print("Errore: Il merge è supportato per 'persone' o 'squadre'.")
        return 1
        
    id_keep = args.id_tenuto
    id_discard = args.id_scartato
    if id_keep == id_discard:
        print("Errore: id_tenuto e id_scartato non possono coincidere.")
        return 1
        
    conn = get_db()
    cursor = conn.cursor()
    
    batch_id = f"merge-{entita}-{id_keep}-{id_discard}"
    motivo = args.motivo or f"Fusione duplicato #{id_discard} in #{id_keep}"
    
    with session_scope(conn, attore=args.attore or 'marco', motivo=motivo, batch_id=batch_id):
        if entita == 'persone':
            cursor.execute("UPDATE marcatori SET persona_id = ? WHERE persona_id = ?", (id_keep, id_discard))
            cursor.execute("UPDATE presenze_stagionali SET persona_id = ? WHERE persona_id = ?", (id_keep, id_discard))
            cursor.execute("UPDATE partite SET arbitro_id = ? WHERE arbitro_id = ?", (id_keep, id_discard))
            cursor.execute("UPDATE persone SET fuso_in_id = ? WHERE id = ?", (id_keep, id_discard))
        else:
            cursor.execute("UPDATE partite SET squadra_casa_id = ? WHERE squadra_casa_id = ?", (id_keep, id_discard))
            cursor.execute("UPDATE partite SET squadra_trasferta_id = ? WHERE squadra_trasferta_id = ?", (id_keep, id_discard))
            cursor.execute("UPDATE marcatori SET squadra_id = ? WHERE squadra_id = ?", (id_keep, id_discard))
            cursor.execute("UPDATE squadre_alias SET squadra_id = ? WHERE squadra_id = ?", (id_keep, id_discard))
            cursor.execute("UPDATE squadre SET fuso_in_id = ? WHERE id = ?", (id_keep, id_discard))
            
        conn.commit()
        
    print(f"[OK] Merge completato: {entita} #{id_discard} fuso in #{id_keep}. Foreign keys riassegnate e tombstone registrata.")
    conn.close()
    return 0

# Subcommand: add-scorer
def handle_add_scorer(args):
    conn = get_db()
    cursor = conn.cursor()
    
    # Check match
    cursor.execute("SELECT id FROM partite WHERE id = ?", (args.partita_id,))
    if not cursor.fetchone():
        print(f"Errore: Partita #{args.partita_id} non trovata.")
        return 1
        
    # Check player
    cursor.execute("SELECT id, nome_completo FROM persone WHERE id = ? OR LOWER(nome_completo) = LOWER(?)", (args.giocatore, args.giocatore))
    p_row = cursor.fetchone()
    if not p_row:
        print(f"Errore: Giocatore '{args.giocatore}' non trovato in 'persone'. Aggiungilo prima in persone.")
        return 1
    persona_id = p_row['id']
    
    # Check team
    cursor.execute("SELECT id FROM squadre WHERE id = ? OR LOWER(nome) = LOWER(?)", (args.squadra, args.squadra))
    t_row = cursor.fetchone()
    if not t_row:
        print(f"Errore: Squadra '{args.squadra}' non trovata.")
        return 1
    squadra_id = t_row['id']
    
    with session_scope(conn, attore=args.attore or 'marco', motivo=args.motivo or 'Inserimento marcatore singolo', fonte_id=args.fonte):
        cursor.execute("""
            INSERT INTO marcatori (partita_id, persona_id, squadra_id, minuto, tipo, confidence, verificato, fonte_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (args.partita_id, persona_id, squadra_id, args.minuto, args.tipo or 'gol', 'alta' if args.fonte else 'media', 1 if args.fonte else 0, args.fonte))
        conn.commit()
        
    print(f"[OK] Marcatore aggiunto: {p_row['nome_completo']} ({args.minuto}') alla partita #{args.partita_id}.")
    conn.close()
    return 0

# Subcommand: query (wrapper around existing 70_query.py)
def handle_query(args):
    script_path = os.path.join(BASE_DIR, 'scripts', '70_query.py')
    if os.path.exists(script_path):
        import subprocess
        cmd = [sys.executable, script_path] + sys.argv[2:]
        subprocess.run(cmd)
    else:
        print("Script 70_query.py non trovato.")

# Main CLI Parser
def main():
    parser = argparse.ArgumentParser(
        prog="dn",
        description="SSC Napoli Data — CLI per manutenzione database, audit reversibile, arricchimento e export."
    )
    subparsers = parser.add_subparsers(dest="subcommand", help="Sottocomando da eseguire")
    
    # fix
    p_fix = subparsers.add_parser("fix", help="Corregge un singolo campo con tracciamento audit e protezione verificato=1")
    p_fix.add_argument("tabella", help="Nome della tabella (es. partite, marcatori)")
    p_fix.add_argument("id", help="Chiave primaria del record")
    p_fix.add_argument("campo", help="Nome della colonna da modificare")
    p_fix.add_argument("valore", help="Nuovo valore")
    p_fix.add_argument("--motivo", "-m", help="Motivo della correzione (obbligatorio per audit)")
    p_fix.add_argument("--fonte", "-f", type=int, help="ID della fonte certificata (attiva verificato=1)")
    p_fix.add_argument("--attore", "-a", default="marco", help="Nome operatore")
    
    # history
    p_hist = subparsers.add_parser("history", help="Mostra lo storico delle modifiche da audit_log")
    p_hist.add_argument("tabella", nargs="?", help="Filtra per tabella")
    p_hist.add_argument("id", nargs="?", help="Filtra per PK")
    p_hist.add_argument("--limit", "-n", type=int, default=30, help="Numero massimo di eventi")
    
    # revert
    p_rev = subparsers.add_parser("revert", help="Annulla una modifica reversibile dal log di audit")
    p_rev.add_argument("--audit-id", type=int, help="ID specifico di audit_log da annullare")
    p_rev.add_argument("--batch", help="Batch ID completo da annullare in blocco")
    p_rev.add_argument("--attore", default="marco", help="Nome operatore")
    
    # merge
    p_merge = subparsers.add_parser("merge", help="Fonde due record duplicati di persone o squadre riassegnando le FK")
    p_merge.add_argument("entita", choices=["persone", "squadre"], help="Tipo di entità")
    p_merge.add_argument("id_tenuto", type=int, help="ID del record da conservare")
    p_merge.add_argument("id_scartato", type=int, help="ID del record duplicato da fondere")
    p_merge.add_argument("--motivo", "-m", help="Motivo della fusione")
    p_merge.add_argument("--attore", "-a", default="marco", help="Nome operatore")
    
    # add-scorer
    p_scorer = subparsers.add_parser("add-scorer", help="Aggiunge un marcatore a una partita")
    p_scorer.add_argument("--partita-id", type=int, required=True, help="ID partita")
    p_scorer.add_argument("--giocatore", required=True, help="Nome o ID giocatore")
    p_scorer.add_argument("--squadra", default="Napoli", help="Nome o ID squadra")
    p_scorer.add_argument("--minuto", required=True, help="Minuto del gol (es. 42)")
    p_scorer.add_argument("--tipo", default="gol", choices=["gol", "rigore", "autogol"], help="Tipo di marcatura")
    p_scorer.add_argument("--fonte", type=int, help="ID fonte")
    p_scorer.add_argument("--motivo", help="Motivo inserimento")
    p_scorer.add_argument("--attore", default="marco", help="Nome operatore")
    
    # import
    p_imp = subparsers.add_parser("import", help="Import a lotti da file CSV con validazione e dry-run")
    p_imp.add_argument("tipo", choices=[
        "formazioni", "marcatori", "partite", "risorse",
        "presidenti", "luoghi_napoli", "stadi_avversari", "periodi_storici",
        "divise", "cimeli", "cori"
    ], help="Tipo di dato da importare")
    p_imp.add_argument("csv_path", help="Percorso del file CSV")
    p_imp.add_argument("--dry-run", action="store_true", help="Valida solo il file senza scrivere sul database")
    p_imp.add_argument("--attore", default="marco", help="Nome operatore")
    p_imp.add_argument("--fonte", type=int, help="ID fonte certificata")
    p_imp.add_argument("--batch", help="ID personalizzato del lotto")
    
    # check
    p_chk = subparsers.add_parser("check", help="Verifica le invarianti del database (FK, marcatori vs punteggio, date)")
    p_chk.add_argument("--stagione", "-s", help="Filtra verifica su una stagione specifica")
    
    # migrate
    p_mig = subparsers.add_parser("migrate", help="Applica le migrazioni SQL numerate con contatore PRAGMA user_version")
    p_mig.add_argument("--stamp", type=int, help="Imposta user_version senza eseguire le migrazioni precedenti")
    
    # dump
    subparsers.add_parser("dump", help="Esporta il database in dump testuale deterministico in db/dump/ per Git")
    
    # build-db
    subparsers.add_parser("build-db", help="Ricostruisce il database SQLite da migrazioni + dump testuale")
    
    # export
    p_exp = subparsers.add_parser("export", help="Esporta il database in JSON con mappe di copertura cov per il sito web")
    p_exp.add_argument("--all", action="store_true", help="Esporta tutte le partite (non solo pubblicata=1)")
    p_exp.add_argument("--output", "-o", help="Percorso di output personalizzato")
    
    # query
    subparsers.add_parser("query", help="Esegue interrogazioni statistiche (assorbe 70_query.py)")
    
    args, unknown = parser.parse_known_args()
    
    if not args.subcommand:
        parser.print_help()
        return 0
        
    if args.subcommand == "fix":
        return handle_fix(args)
    elif args.subcommand == "history":
        return handle_history(args)
    elif args.subcommand == "revert":
        return handle_revert(args)
    elif args.subcommand == "merge":
        return handle_merge(args)
    elif args.subcommand == "add-scorer":
        return handle_add_scorer(args)
    elif args.subcommand == "import":
        import_csv(args.tipo, args.csv_path, dry_run=args.dry_run, attore=args.attore, fonte_id=args.fonte, batch_id=args.batch)
        return 0
    elif args.subcommand == "check":
        ok = check_invariants(stagione=args.stagione)
        return 0 if ok else 1
    elif args.subcommand == "migrate":
        run_migrations(stamp=args.stamp)
        return 0
    elif args.subcommand == "dump":
        dump_database()
        return 0
    elif args.subcommand == "build-db":
        build_database()
        return 0
    elif args.subcommand == "export":
        export_site_data(output_path=args.output, all_matches=args.all)
        return 0
    elif args.subcommand == "query":
        handle_query(args)
        return 0
    else:
        parser.print_help()
        return 0

if __name__ == '__main__':
    sys.exit(main())
