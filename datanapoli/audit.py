import json
import sqlite3
from .db import set_session, session_scope

AUDITED_TABLES = [
    'partite', 
    'marcatori', 
    'persone', 
    'squadre', 
    'squadre_relazioni', 
    'squadre_alias', 
    'partite_formazioni', 
    'partite_eventi', 
    'partite_statistiche', 
    'copertura',
    'stadi_avversari',
    'periodi_storici',
    'presidenti',
    'luoghi_napoli',
    'divise',
    'cimeli',
    'cori'
]

def generate_all_triggers_sql(cursor):
    """
    Generates INSERT, DELETE and per-column UPDATE triggers for all audited tables.
    Triggers read contextual metadata (attore, motivo, fonte_id, batch_id) from sessione (id=1).
    """
    statements = []
    
    for table in AUDITED_TABLES:
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table,))
        if not cursor.fetchone():
            continue
            
        cursor.execute(f"PRAGMA table_info({table})")
        columns_info = cursor.fetchall()
        cols = [(c['name'] if isinstance(c, sqlite3.Row) else c[1]) for c in columns_info if (c['name'] if isinstance(c, sqlite3.Row) else c[1]) not in ('created_at', 'aggiornato_il', 'updated_at')]
        pk_cols = [(c['name'] if isinstance(c, sqlite3.Row) else c[1]) for c in columns_info if (c['pk'] if isinstance(c, sqlite3.Row) else c[5]) > 0]
        
        if not pk_cols:
            pk_expr = "NEW.id"
            old_pk_expr = "OLD.id"
        elif len(pk_cols) == 1:
            pk_expr = f"NEW.{pk_cols[0]}"
            old_pk_expr = f"OLD.{pk_cols[0]}"
        else:
            pk_expr = " || '|' || ".join([f"CAST(NEW.{p} AS TEXT)" for p in pk_cols])
            old_pk_expr = " || '|' || ".join([f"CAST(OLD.{p} AS TEXT)" for p in pk_cols])
            
        # INSERT Trigger
        json_insert_args = []
        for c in cols:
            json_insert_args.append(f"'{c}', NEW.{c}")
        statements.append(f"""
CREATE TRIGGER IF NOT EXISTS trg_{table}_ai AFTER INSERT ON {table}
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    '{table}',
    {pk_expr},
    'I',
    NULL,
    NULL,
    json_object({', '.join(json_insert_args)}),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END;
""")

        # DELETE Trigger
        json_delete_args = []
        for c in cols:
            json_delete_args.append(f"'{c}', OLD.{c}")
        statements.append(f"""
CREATE TRIGGER IF NOT EXISTS trg_{table}_ad AFTER DELETE ON {table}
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    '{table}',
    {old_pk_expr},
    'D',
    NULL,
    json_object({', '.join(json_delete_args)}),
    NULL,
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END;
""")

        # UPDATE Triggers per column with WHEN OLD.c IS NOT NEW.c
        for c in cols:
            if c in pk_cols:
                continue
            statements.append(f"""
CREATE TRIGGER IF NOT EXISTS trg_{table}_u_{c} AFTER UPDATE OF {c} ON {table}
WHEN OLD.{c} IS NOT NEW.{c}
BEGIN
  INSERT INTO audit_log (tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id)
  VALUES (
    '{table}',
    {pk_expr},
    'U',
    '{c}',
    json_quote(OLD.{c}),
    json_quote(NEW.{c}),
    COALESCE((SELECT attore FROM sessione WHERE id = 1), 'sconosciuto'),
    (SELECT motivo FROM sessione WHERE id = 1),
    (SELECT fonte_id FROM sessione WHERE id = 1),
    (SELECT batch_id FROM sessione WHERE id = 1)
  );
END;
""")

    return "\n".join(statements)

def get_history(conn, table=None, pk=None, limit=50):
    """
    Retrieves audit trail entries filtered by table and/or pk.
    """
    cursor = conn.cursor()
    query = "SELECT audit_id, ts, tabella, pk, azione, campo, vecchio, nuovo, attore, motivo, fonte_id, batch_id FROM audit_log"
    params = []
    clauses = []
    
    if table:
        clauses.append("tabella = ?")
        params.append(table)
    if pk is not None:
        clauses.append("pk = ?")
        params.append(str(pk))
        
    if clauses:
        query += " WHERE " + " AND ".join(clauses)
        
    query += " ORDER BY ts DESC, audit_id DESC LIMIT ?"
    params.append(limit)
    
    cursor.execute(query, params)
    return cursor.fetchall()

def revert_entry(conn, audit_id, attore='revert-operator'):
    """
    Reverts a specific audit_id entry by writing back the old value.
    The revert itself is executed as a normal UPDATE, creating a new audit entry.
    """
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_log WHERE audit_id = ?", (audit_id,))
    entry = cursor.fetchone()
    if not entry:
        raise ValueError(f"Audit log #{audit_id} not found.")
        
    tabella = entry['tabella']
    pk = entry['pk']
    campo = entry['campo']
    vecchio_json = entry['vecchio']
    azione = entry['azione']
    
    if azione != 'U' or not campo:
        raise ValueError(f"Revert is currently supported for UPDATE actions (audit_id #{audit_id} is action '{azione}').")
        
    # Parse old value from JSON quote
    old_value = json.loads(vecchio_json) if vecchio_json is not None else None
    
    with session_scope(conn, attore=attore, motivo=f"Revert di audit_id #{audit_id}", batch_id=f"revert-{audit_id}"):
        # Determine PK column name
        cursor.execute(f"PRAGMA table_info({tabella})")
        cols = cursor.fetchall()
        pk_cols = [c['name'] for c in cols if c['pk'] > 0]
        pk_col = pk_cols[0] if pk_cols else 'id'
        
        cursor.execute(f"UPDATE {tabella} SET {campo} = ? WHERE {pk_col} = ?", (old_value, pk))
        conn.commit()
        
    return {
        'audit_id': audit_id,
        'tabella': tabella,
        'pk': pk,
        'campo': campo,
        'restored_value': old_value
    }

def revert_batch(conn, batch_id, attore='revert-operator'):
    """
    Reverts all modifications performed in a given batch_id in reverse order.
    """
    cursor = conn.cursor()
    cursor.execute(
        "SELECT audit_id FROM audit_log WHERE batch_id = ? AND azione = 'U' ORDER BY ts DESC, audit_id DESC",
        (batch_id,)
    )
    entries = cursor.fetchall()
    if not entries:
        raise ValueError(f"No reversible entries found for batch_id '{batch_id}'.")
        
    results = []
    for row in entries:
        res = revert_entry(conn, row['audit_id'], attore=attore)
        results.append(res)
    return results
