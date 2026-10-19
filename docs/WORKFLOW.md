# Workflow

## 1. Correggere una partita
1. Trova l'ID della partita nel DB (tramite query su SQLite).
2. (Opzionale) Esegui python scripts/backup.py se fai modifiche in batch.
3. Modifica i dati direttamente via SQL (es. UPDATE partite SET gol_casa=3 WHERE id=...).
4. I trigger di audit registreranno le modifiche apportate automaticamente in udit_log.

## 2. Aggiungere un marcatore
1. Assicurati che il giocatore esista in persone.
2. Esegui l'INSERT in marcatori con i dati (minuto, partita_id, ecc.).

## 3. Esportare per il sito
- Esegui python scripts/61_export_sqlite_to_json.py.
- Assicurati che partite.pubblicata sia a 1 per le partite che vuoi rendere visibili online.

## 4. Registrare una risorsa trovata
1. Aggiungi una riga in `data/import/risorse.csv` (url, tipo, licenza, data_consultazione, fatto_estratto, e se possibile match_id / persona_nome / stagione).
2. Esegui `python scripts/93_import_risorse.py --csv data/import/risorse.csv`.
3. Per le pagine Wikipedia già scaricate: `python scripts/93_import_risorse.py --from-wikipedia-cache`.
4. Controlla lo stato: `python scripts/93_import_risorse.py --report`.

Regole licenza: Wikipedia = `CC BY-SA 4.0` (riuso con attribuzione); articoli di giornale = `copyright` (fonte dei fatti, testo riscritto); fatti (risultati, date, marcatori) sono liberi.
