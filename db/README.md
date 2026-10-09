# Database Napoli

Questo schema SQLite (schema.sql) rappresenta la fonte di verità per i dati strutturati di Data Napoli.

**Stato attuale**: i JSON in data/ sono la fonte operativa del sito. Questo database è in fase di popolamento: lo script di importazione carica i dati JSON esistenti nel database. Quando il popolamento sarà completo e verificato, i JSON diventeranno output generato da questo database. Fino ad allora, i JSON restano la fonte di verità per il sito.

Il database è strutturato in livelli:
1. **Livello 1 - Entità di base**: Tabelle anagrafiche, squadre, partite e statistiche consolidate.
2. **Livello 2 - Arricchimento**: Non ancora implementato. Verrà aggiunto quando i dati per popolarlo esisteranno (formazioni, eventi partita, statistiche avanzate come xG).
3. **Livello 3 - Materiale grezzo**: Documenti testuali e foto raccolti tramite il sistema di ingestion, archiviati e collegati alle partite.
