# Architettura del Progetto

Il progetto SSC Napoli Data è composto da due parti:
1. **Database SQLite (datanapoli.sqlite)**: contiene l'intero archivio enciclopedico di partite, marcatori, formazioni, ecc. È gestito tramite script Python (scripts/) e non è committato in git.
2. **Sito web statico (Astro)**: genera HTML da JSON esportati e da Markdown. Non è una wiki: niente editing dal browser. MediaWiki resta un'ipotesi futura, quando ci saranno contributori reali; i testi restano in Markdown perché sia convertibile.

## Flusso DB -> Export -> Sito
1. I dati vengono inseriti/modificati nel DB SQLite.
2. Le risorse trovate in ricerca (URL, licenza, estratto) si registrano in `risorse` con `scripts/93_import_risorse.py`. Non sostituiscono `fonti` (catalogo di autorità) né `documenti` (testo ingestito).
3. Le partite marcate come pubblicata=1 vengono esportate tramite scripts/61_export_sqlite_to_json.py nel file data/matches.json (o matches_export.json).
4. Astro legge i JSON in build (`getStaticPaths`) e i Markdown delle content collections, e pubblica HTML statico su GitHub Pages.

## Backup e Migrazioni
- Le migrazioni SQL sono contenute in db/migrations/ e vengono applicate da scripts/migrate.py.
- Prima di ogni migrazione (o modifica batch), uno script di backup (scripts/backup.py) esegue un VACUUM INTO per salvare un'istantanea del DB in db/backups/.
- La cartella db/backups/ è ignorata in git.
