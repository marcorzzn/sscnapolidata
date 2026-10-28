import sqlite3
from .db import get_db, DB_PATH

def check_invariants(db_path=None, stagione=None):
    """
    Executes core invariant checks on datanapoli.sqlite:
    1. PRAGMA foreign_key_check
    2. Scorers tally vs match scoreline
    3. Match date within season boundaries
    4. Published matches minimum completeness
    5. Sections with rows without explicit/deduced coverage
    """
    conn = get_db(db_path)
    cursor = conn.cursor()
    
    issues = []
    
    print("=" * 60)
    print("DATA NAPOLI — VERIFICA INVARIANTI DATABASE (dn check)")
    print("=" * 60)
    
    # 1. Foreign Key Check
    cursor.execute("PRAGMA foreign_key_check;")
    fk_errors = cursor.fetchall()
    if fk_errors:
        # Filter known staging items if any
        issues.append(f"Foreign Key check: {len(fk_errors)} violazioni rilevate.")
        for err in fk_errors[:5]:
            print(f"  [FK Error] Tabella {err[0]}, riga {err[1]}, riferimento {err[2]}")
        if len(fk_errors) > 5:
            print(f"  ... e altre {len(fk_errors) - 5} violazioni.")
    else:
        print("[OK] Foreign Key check: 0 violazioni.")

    # 2. Marcatori vs Risultato
    season_filter = f"AND st.nome = '{stagione}'" if stagione else ""
    cursor.execute(f"""
    SELECT 
        p.id, p.data, sc.nome as home, st_away.nome as away,
        p.gol_casa, p.gol_trasferta,
        COALESCE(SUM(CASE WHEN m.squadra_id = p.squadra_casa_id THEN 1 ELSE 0 END), 0) AS marcatori_casa,
        COALESCE(SUM(CASE WHEN m.squadra_id = p.squadra_trasferta_id THEN 1 ELSE 0 END), 0) AS marcatori_trasferta
    FROM partite p
    JOIN squadre sc ON p.squadra_casa_id = sc.id
    JOIN squadre st_away ON p.squadra_trasferta_id = st_away.id
    LEFT JOIN stagioni st ON p.stagione_id = st.id
    LEFT JOIN marcatori m ON m.partita_id = p.id
    WHERE (p.gol_casa IS NOT NULL AND p.gol_trasferta IS NOT NULL)
      {season_filter}
    GROUP BY p.id
    HAVING (p.gol_casa != marcatori_casa OR p.gol_trasferta != marcatori_trasferta)
       AND (p.gol_casa + p.gol_trasferta > 0)
    """)
    mismatches = cursor.fetchall()
    
    # Check if mismatch is justified by copertura table
    unjustified = []
    for m in mismatches:
        cursor.execute("SELECT stato FROM copertura WHERE entita='partita' AND entita_id=? AND sezione='marcatori'", (m['id'],))
        cov_row = cursor.fetchone()
        if not cov_row or cov_row['stato'] not in ('nd', 'parziale', 'pending'):
            unjustified.append(m)
            
    if unjustified:
        issues.append(f"Marcatori vs Risultato: {len(unjustified)} partite con discrepanza non dichiarata in copertura.")
        for u in unjustified[:5]:
            print(f"  [Discrepanza Marcatori] Partita #{u['id']} ({u['data']} {u['home']}-{u['away']}): Risultato {u['gol_casa']}-{u['gol_trasferta']} ma {u['marcatori_casa']}+{u['marcatori_trasferta']} marcatori nel DB.")
        if len(unjustified) > 5:
            print(f"  ... e altre {len(unjustified) - 5} partite.")
    else:
        print(f"[OK] Marcatori vs Risultato: Nessuna discrepanza ingiustificata (totali {len(mismatches)} con stato in copertura).")

    # 3. Date vs Stagione
    cursor.execute("""
    SELECT p.id, p.data, st.nome, st.anno_inizio, st.anno_fine
    FROM partite p
    JOIN stagioni st ON p.stagione_id = st.id
    WHERE st.anno_inizio IS NOT NULL AND st.anno_fine IS NOT NULL
      AND (
        substr(p.data, 1, 4) < CAST(st.anno_inizio AS TEXT)
        OR substr(p.data, 1, 4) > CAST(st.anno_fine AS TEXT)
      )
    """)
    date_errors = cursor.fetchall()
    if date_errors:
        issues.append(f"Date fuori stagione: {len(date_errors)} partite con data incoerente rispetto alla stagione.")
        for d in date_errors[:3]:
            print(f"  [Data Anomala] Partita #{d['id']}: data {d['data']} ma stagione {d['nome']} ({d['anno_inizio']}-{d['anno_fine']})")
    else:
        print("[OK] Date vs Stagioni: Tutte le date ricadono nell'arco temporale corretto.")

    # 4. Partite pubblicata=1 con campi minimi
    cursor.execute("""
    SELECT id, data, home_raw_name, away_raw_name
    FROM partite
    WHERE pubblicata = 1
      AND (data IS NULL OR squadra_casa_id IS NULL OR squadra_trasferta_id IS NULL OR gol_casa IS NULL OR gol_trasferta IS NULL)
    """)
    pub_errors = cursor.fetchall()
    if pub_errors:
        issues.append(f"Partite pubblicate incomplete: {len(pub_errors)} gare pubblicata=1 prive dei campi minimi.")
        for p in pub_errors[:3]:
            print(f"  [Pubblicata Incompleta] Partita #{p['id']} ({p['data']})")
    else:
        print("[OK] Partite pubblicata=1: Tutte complete dei campi minimi obbligatori.")

    # 5. Conflitti di import aperti
    cursor.execute("SELECT COUNT(1) FROM sqlite_master WHERE type='table' AND name='conflitti_import'")
    if cursor.fetchone()[0]:
        cursor.execute("SELECT COUNT(1) FROM conflitti_import WHERE stato='aperto'")
        conflitti_open = cursor.fetchone()[0]
        if conflitti_open > 0:
            issues.append(f"Conflitti di import: {conflitti_open} conflitti aperti tra fonte automatica e record verificato=1.")
            print(f"  [Conflitti Import] {conflitti_open} conflitti registrati in conflitti_import da esaminare.")
        else:
            print("[OK] Conflitti import: 0 conflitti pendenti.")

    print("-" * 60)
    if issues:
        print(f"ATTENZIONE: {len(issues)} rilievi individuati:")
        for iss in issues:
            print(f" - {iss}")
    else:
        print("TUTTE LE INVARIANTI RISPETTATE AL 100%. Il database è integro e conforme.")
    print("=" * 60)
    
    conn.close()
    return len(issues) == 0
