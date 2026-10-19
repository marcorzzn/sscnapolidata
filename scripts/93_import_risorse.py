"""Importa e aggiorna il registro risorse (harvest log).

Uso:
  python scripts/93_import_risorse.py --csv data/import/risorse.csv
  python scripts/93_import_risorse.py --from-wikipedia-cache
  python scripts/93_import_risorse.py --report
"""
import argparse
import csv
import glob
import os
import re
import sqlite3
from datetime import date, datetime, timezone

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'db', 'datanapoli.sqlite')
DEFAULT_CSV = os.path.join(BASE_DIR, 'data', 'import', 'risorse.csv')
WIKI_CACHE = os.path.join(BASE_DIR, 'data', 'import', 'wikipedia', 'cache')

TIPI = {
    'wikipedia', 'articolo', 'foto', 'report_lega', 'database',
    'libro', 'video', 'documento_ufficiale', 'altro',
}
LICENZE = {'CC BY-SA 4.0', 'copyright', 'pubblico dominio', 'sconosciuta'}
STATI = {'da_usare', 'usato', 'da_verificare', 'scartato'}
CONFIDENCE = {'alta', 'media', 'bassa'}
VERIFICA = {'da_verificare', 'verificato'}
DATE_RE = re.compile(r'^\d{4}-\d{2}-\d{2}$')
URL_COMMENT_RE = re.compile(r'<!-- URL: (.*?) -->')
H1_RE = re.compile(r'<h1[^>]*id="firstHeading"[^>]*>\s*(?:<span[^>]*>)?(.*?)(?:</span>)?\s*</h1>', re.I | re.S)


def blank(value):
    if value is None:
        return None
    text = str(value).strip()
    return text if text else None


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute('PRAGMA foreign_keys = ON;')
    return conn


def set_audit_ctx(cursor, motivo):
    cursor.execute(
        '''UPDATE audit_ctx SET batch_id = ?, utente = ?, motivo = ?, fonte_id = NULL WHERE id = 1''',
        (datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ'), '93_import_risorse', motivo),
    )


def find_season_id(cursor, nome):
    nome = blank(nome)
    if not nome:
        return None
    cursor.execute('SELECT id FROM stagioni WHERE nome = ?', (nome,))
    row = cursor.fetchone()
    if row:
        return row['id']
    m = re.match(r'^(\d{4})-(\d{2})$', nome)
    if m:
        start = int(m.group(1))
        end = str(start + 1)
        alt = f'{start}-{end}'
        cursor.execute('SELECT id FROM stagioni WHERE nome = ?', (alt,))
        row = cursor.fetchone()
        if row:
            return row['id']
    m = re.match(r'^(\d{4})-(\d{4})$', nome)
    if m:
        short = f"{m.group(1)}-{m.group(2)[-2:]}"
        cursor.execute('SELECT id FROM stagioni WHERE nome = ?', (short,))
        row = cursor.fetchone()
        if row:
            return row['id']
    return None


def find_partita_id(cursor, partita_id, match_id):
    if blank(partita_id):
        try:
            return int(partita_id)
        except ValueError:
            raise ValueError(f'partita_id non numerico: {partita_id}')
    match_id = blank(match_id)
    if not match_id:
        return None
    cursor.execute('SELECT id FROM partite WHERE match_id = ?', (match_id,))
    row = cursor.fetchone()
    if not row:
        raise ValueError(f'match_id non trovato: {match_id}')
    return row['id']


def find_persona_id(cursor, persona_id, persona_nome):
    if blank(persona_id):
        try:
            return int(persona_id)
        except ValueError:
            raise ValueError(f'persona_id non numerico: {persona_id}')
    persona_nome = blank(persona_nome)
    if not persona_nome:
        return None
    cursor.execute(
        'SELECT id FROM persone WHERE lower(nome_completo) = lower(?)',
        (persona_nome,),
    )
    rows = cursor.fetchall()
    if len(rows) == 1:
        return rows[0]['id']
    cursor.execute(
        'SELECT id FROM persone WHERE lower(cognome) = lower(?)',
        (persona_nome,),
    )
    rows = cursor.fetchall()
    if len(rows) == 1:
        return rows[0]['id']
    if len(rows) > 1:
        raise ValueError(f'persona ambigua: {persona_nome}')
    raise ValueError(f'persona non trovata: {persona_nome}')


def validate_row(row):
    url = blank(row.get('url'))
    if not url:
        raise ValueError('url obbligatorio')
    tipo = blank(row.get('tipo')) or 'altro'
    if tipo not in TIPI:
        raise ValueError(f'tipo non valido: {tipo}')
    licenza = blank(row.get('licenza')) or 'sconosciuta'
    if licenza not in LICENZE:
        raise ValueError(f'licenza non valida: {licenza}')
    data_cons = blank(row.get('data_consultazione')) or date.today().isoformat()
    if not DATE_RE.match(data_cons):
        raise ValueError(f'data_consultazione non ISO: {data_cons}')
    stato = blank(row.get('stato_uso')) or 'da_usare'
    if stato not in STATI:
        raise ValueError(f'stato_uso non valido: {stato}')
    confidence = blank(row.get('confidence')) or 'media'
    if confidence not in CONFIDENCE:
        raise ValueError(f'confidence non valida: {confidence}')
    verifica = blank(row.get('verifica')) or 'da_verificare'
    if verifica not in VERIFICA:
        raise ValueError(f'verifica non valida: {verifica}')
    return {
        'url': url,
        'titolo': blank(row.get('titolo')),
        'tipo': tipo,
        'licenza': licenza,
        'data_consultazione': data_cons,
        'estratto': blank(row.get('estratto')),
        'fatto_estratto': blank(row.get('fatto_estratto')),
        'stato_uso': stato,
        'confidence': confidence,
        'verifica': verifica,
        'note': blank(row.get('note')),
        'fonte_id': int(row['fonte_id']) if blank(row.get('fonte_id')) else None,
    }


def upsert_risorsa(cursor, payload):
    cursor.execute(
        '''
        SELECT id FROM risorse
        WHERE url_norm = lower(trim(?))
          AND partita_key = COALESCE(?, 0)
          AND persona_key = COALESCE(?, 0)
          AND stagione_key = COALESCE(?, 0)
        ''',
        (payload['url'], payload.get('partita_id'), payload.get('persona_id'), payload.get('stagione_id')),
    )
    existing = cursor.fetchone()
    fields = (
        'url', 'titolo', 'tipo', 'licenza', 'data_consultazione', 'estratto',
        'fatto_estratto', 'partita_id', 'persona_id', 'stagione_id', 'fonte_id',
        'stato_uso', 'confidence', 'verifica', 'note',
    )
    if existing:
        assignments = ', '.join(f'{name} = ?' for name in fields)
        values = [payload.get(name) for name in fields]
        values.append(existing['id'])
        cursor.execute(
            f'UPDATE risorse SET {assignments}, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            values,
        )
        return 'updated'
    placeholders = ', '.join('?' for _ in fields)
    cursor.execute(
        f'INSERT INTO risorse ({", ".join(fields)}) VALUES ({placeholders})',
        [payload.get(name) for name in fields],
    )
    return 'inserted'


def import_csv(csv_path):
    conn = get_db()
    cursor = conn.cursor()
    set_audit_ctx(cursor, f'import csv {os.path.basename(csv_path)}')
    stats = {'inserted': 0, 'updated': 0, 'errors': []}
    with open(csv_path, 'r', encoding='utf-8-sig', newline='') as handle:
        reader = csv.DictReader(handle)
        for line_idx, raw in enumerate(reader, start=2):
            try:
                payload = validate_row(raw)
                payload['partita_id'] = find_partita_id(cursor, raw.get('partita_id'), raw.get('match_id'))
                payload['persona_id'] = find_persona_id(cursor, raw.get('persona_id'), raw.get('persona_nome'))
                stagione_id = find_season_id(cursor, raw.get('stagione'))
                if blank(raw.get('stagione_id')):
                    stagione_id = int(raw['stagione_id'])
                payload['stagione_id'] = stagione_id
                result = upsert_risorsa(cursor, payload)
                stats[result] += 1
            except Exception as exc:
                stats['errors'].append(f'riga {line_idx}: {exc}')
    conn.commit()
    conn.close()
    return stats


def title_from_html(html, fallback):
    match = H1_RE.search(html)
    if not match:
        return fallback
    text = re.sub(r'<[^>]+>', '', match.group(1))
    text = re.sub(r'\s+', ' ', text).strip()
    return text or fallback


def import_wikipedia_cache():
    conn = get_db()
    cursor = conn.cursor()
    set_audit_ctx(cursor, 'import cache wikipedia')
    stats = {'inserted': 0, 'updated': 0, 'errors': []}
    for path in sorted(glob.glob(os.path.join(WIKI_CACHE, '*.html'))):
        try:
            with open(path, 'r', encoding='utf-8') as handle:
                html = handle.read(8000)
            url_match = URL_COMMENT_RE.search(html)
            if not url_match:
                stats['errors'].append(f'{os.path.basename(path)}: URL cache assente')
                continue
            url = url_match.group(1).strip()
            season_name = os.path.splitext(os.path.basename(path))[0]
            titolo = title_from_html(html, season_name.replace('-', ' '))
            mtime = datetime.fromtimestamp(os.path.getmtime(path)).date().isoformat()
            payload = validate_row({
                'url': url,
                'titolo': titolo,
                'tipo': 'wikipedia',
                'licenza': 'CC BY-SA 4.0',
                'data_consultazione': mtime,
                'estratto': None,
                'fatto_estratto': 'pagina stagione in cache locale',
                'stato_uso': 'da_usare',
                'note': f'cache:{os.path.basename(path)}',
            })
            payload['partita_id'] = None
            payload['persona_id'] = None
            payload['stagione_id'] = find_season_id(cursor, season_name)
            payload['fonte_id'] = None
            result = upsert_risorsa(cursor, payload)
            stats[result] += 1
        except Exception as exc:
            stats['errors'].append(f'{os.path.basename(path)}: {exc}')
    conn.commit()
    conn.close()
    return stats


def report():
    conn = get_db()
    cursor = conn.cursor()
    print('--- REPORT RISORSE ---')
    try:
        cursor.execute('SELECT COUNT(*) AS n FROM risorse')
    except sqlite3.OperationalError:
        print('Tabella risorse assente. Esegui python scripts/migrate.py')
        conn.close()
        return
    print(f"Totale: {cursor.fetchone()['n']}")
    print('\n[Per stato_uso]')
    cursor.execute('SELECT stato_uso, COUNT(*) AS n FROM risorse GROUP BY stato_uso ORDER BY n DESC')
    for row in cursor.fetchall():
        print(f"  {row['stato_uso']}: {row['n']}")
    print('\n[Per tipo]')
    cursor.execute('SELECT tipo, COUNT(*) AS n FROM risorse GROUP BY tipo ORDER BY n DESC')
    for row in cursor.fetchall():
        print(f"  {row['tipo']}: {row['n']}")
    print('\n[Per licenza]')
    cursor.execute('SELECT licenza, COUNT(*) AS n FROM risorse GROUP BY licenza ORDER BY n DESC')
    for row in cursor.fetchall():
        print(f"  {row['licenza']}: {row['n']}")
    conn.close()


def print_stats(stats):
    print(f"Inserite: {stats['inserted']}")
    print(f"Aggiornate: {stats['updated']}")
    if stats['errors']:
        print(f"Errori: {len(stats['errors'])}")
        for err in stats['errors'][:30]:
            print(f"  {err}")
        if len(stats['errors']) > 30:
            print(f"  ... altri {len(stats['errors']) - 30}")


def main():
    parser = argparse.ArgumentParser(description='Importa il registro risorse')
    parser.add_argument('--csv', nargs='?', const=DEFAULT_CSV, help='CSV da importare')
    parser.add_argument('--from-wikipedia-cache', action='store_true', help='Registra le pagine Wikipedia già in cache')
    parser.add_argument('--report', action='store_true', help='Stampa conteggi per stato, tipo e licenza')
    args = parser.parse_args()

    if not os.path.exists(DB_PATH):
        raise SystemExit(f'Database non trovato: {DB_PATH}')

    ran = False
    if args.from_wikipedia_cache:
        print('Cache Wikipedia:')
        print_stats(import_wikipedia_cache())
        ran = True
    if args.csv:
        print(f'CSV {args.csv}:')
        print_stats(import_csv(args.csv))
        ran = True
    if args.report or not ran:
        report()


if __name__ == '__main__':
    main()
