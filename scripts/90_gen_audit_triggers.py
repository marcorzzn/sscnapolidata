import os
import sqlite3

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'db', 'datanapoli.sqlite')
MIGRATIONS_DIR = os.path.join(BASE_DIR, 'db', 'migrations')

TABLES = ['partite', 'marcatori', 'persone', 'squadre_alias', 'foto', 'documenti', 'risorse']

def gen_triggers():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    sql = ""
    for table in TABLES:
        cursor.execute(f"PRAGMA table_info({table})")
        columns = [row['name'] for row in cursor.fetchall() if row['name'] != 'created_at']
        
        # INSERT Trigger
        sql += f"CREATE TRIGGER IF NOT EXISTS audit_{table}_insert\n"
        sql += f"AFTER INSERT ON {table}\n"
        sql += "BEGIN\n"
        sql += "  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, campo, valore_precedente, valore_nuovo)\n"
        sql += f"  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, '{table}', NEW.id, 'I', NULL, NULL,\n"
        json_args = []
        for c in columns:
            json_args.append(f"'{c}'")
            json_args.append(f"NEW.{c}")
        sql += f"         json_object({', '.join(json_args)})\n"
        sql += "  FROM audit_ctx ctx WHERE ctx.id = 1;\n"
        sql += "END;\n\n"
        
        # DELETE Trigger
        sql += f"CREATE TRIGGER IF NOT EXISTS audit_{table}_delete\n"
        sql += f"AFTER DELETE ON {table}\n"
        sql += "BEGIN\n"
        sql += "  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, campo, valore_precedente, valore_nuovo)\n"
        sql += f"  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, '{table}', OLD.id, 'D', NULL,\n"
        json_args = []
        for c in columns:
            json_args.append(f"'{c}'")
            json_args.append(f"OLD.{c}")
        sql += f"         json_object({', '.join(json_args)}),\n"
        sql += "         NULL\n"
        sql += "  FROM audit_ctx ctx WHERE ctx.id = 1;\n"
        sql += "END;\n\n"
        
        # UPDATE Trigger
        sql += f"CREATE TRIGGER IF NOT EXISTS audit_{table}_update\n"
        sql += f"AFTER UPDATE ON {table}\n"
        sql += "BEGIN\n"
        for c in columns:
            if c == 'id': continue
            sql += f"  INSERT INTO audit_log (batch_id, utente, motivo, fonte_id, tabella, record_id, operazione, campo, valore_precedente, valore_nuovo)\n"
            sql += f"  SELECT ctx.batch_id, ctx.utente, ctx.motivo, ctx.fonte_id, '{table}', NEW.id, 'U', '{c}', OLD.{c}, NEW.{c}\n"
            sql += f"  FROM audit_ctx ctx WHERE ctx.id = 1 AND OLD.{c} IS NOT NEW.{c};\n"
        sql += "END;\n\n"
        
    conn.close()
    
    with open(os.path.join(MIGRATIONS_DIR, '008_new_audit_triggers.sql'), 'w', encoding='utf-8') as f:
        f.write(sql)
        
if __name__ == '__main__':
    gen_triggers()
