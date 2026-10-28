# GUIDA PER I CONTRIBUTORI — SSC NAPOLI DATA (@sscnapolidata)

Ti ringraziamo per l'interesse a contribuire a **DATA NAPOLI**! L'obiettivo del progetto è costruire un archivio enciclopedico e analitico rigoroso, aperto e completamente tracciabile sulla storia della SSC Napoli.

Per mantenere l'integrità del database, tutti i contributi devono rispettare le seguenti regole tassative.

---

## 📜 Regole d'Oro per la Contribuzione

### 1. Nessun Dato Inventato o Dedotto
- Non è ammesso indovinare o interpolare dati mancanti. Se una cronaca dell'epoca non menziona l'arbitro, il campo resta `NULL` e la sezione viene registrata con stato `nd` (non disponibile) nella tabella `copertura`.
- Per le statistiche avanzate o metriche assenti per limiti tecnologici (es. xG negli anni '80), lo stato corretto è `na` (non applicabile per natura).

### 2. Ogni Dato Richiede una Fonte Esplicita
- Qualsiasi dato aggiunto o corretto deve essere supportato da una fonte documentata (Report ufficiale Lega Serie A, RSSSF, Almanacco Panini, archivio storico, articolo di giornale accreditato).
- Includi sempre l'URL, il volume o il riferimento bibliografico.
- Rispetta le licenze: i fatti storici (date, risultati, marcatori) sono liberi; i testi di cronaca o foto coperte da copyright non possono essere duplicati testualmente ma vanno riassunti o citati con attribuzione (es. Wikipedia IT sotto licenza CC BY-SA 4.0).

### 3. File di Arricchimento in `data/import/`
- Tutti i contributi a lotti (es. formazioni storiche, elenchi spettatori, eventi) devono essere preparati come file CSV nella cartella:
  ```
  data/import/<sezione>/<nome_file>.csv
  ```
- Usa le intestazioni standard indicate in `docs/WORKFLOWS.md` e `docs/DATA_MODEL.md`.

---

## 🛠️ Checklist Prima di Inviare una Pull Request

Prima di aprire una PR su GitHub, assicurati di aver eseguito localmente i seguenti comandi:

1. **Validazione con Dry Run**:
   ```powershell
   python dn.py import formazioni data/import/formazioni/tua_stagione.csv --dry-run
   ```
2. **Import definitivo e verifica invarianti**:
   ```powershell
   python dn.py import formazioni data/import/formazioni/tua_stagione.csv --attore tuo_username
   python dn.py check
   ```
   *La PR non può essere accettata se `dn check` rileva violazioni di foreign key o marcatori ingiustificati.*
3. **Rigenerazione del Dump Deterministico per Git**:
   ```powershell
   python dn.py dump
   ```
   *Includi i file generati in `db/dump/*.sql` nel tuo commit: questo consente ai revisori di vedere l'esatta riga modificata nel diff di GitHub.*
4. **Verifica che il binario SQLite non sia tracciato**:
   ```powershell
   git status
   ```
   *`db/datanapoli.sqlite` deve risultare ignorato da `.gitignore`.*

Grazie per contribuire a preservare con accuratezza scientifica e passione la memoria sportiva del Napoli!
