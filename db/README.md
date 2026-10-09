# Database Napoli

Questo schema SQLite (schema.sql) rappresenta la fonte di verità per i dati strutturati di Data Napoli.

**Stato attuale**: i JSON in data/ sono la fonte operativa del sito. Questo database è in fase di popolamento: lo script di importazione carica i dati JSON esistenti nel database. Quando il popolamento sarà completo e verificato, i JSON diventeranno output generato da questo database. Fino ad allora, i JSON restano la fonte di verità per il sito.

Il database è strutturato in livelli:
1. **Livello 1 - Entità di base**: Tabelle anagrafiche, squadre, partite e statistiche consolidate.
2. **Livello 2 - Arricchimento**: Non ancora implementato. Verrà aggiunto quando i dati per popolarlo esisteranno (formazioni, eventi partita, statistiche avanzate come xG).
3. **Livello 3 - Materiale grezzo**: Documenti testuali e foto raccolti tramite il sistema di ingestion, archiviati e collegati alle partite.

## Politica editoriale sull'eredità sportiva

Il Napoli è l'erede legale dell'Internaples (continuità societaria), ma non ne eredita il palmarès sportivo. Il conteggio di titoli, record e statistiche del Napoli parte dal 1926. Questa è una scelta editoriale, non un fatto: se un domani si decidesse diversamente, basta modificare il flag `inherits_sporting_record` nella relazione Internaples→Napoli, senza toccare i dati delle partite.

Lo stesso principio si applica alla Roma rispetto ad Alba-Audace, Fortitudo-Pro Roma e Roman: la Roma è l'erede legale delle tre entità (fusione del 1927), ma non ne eredita i record sportivi.
