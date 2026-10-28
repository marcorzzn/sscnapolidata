# RICETTE OPERATIVE E WORKFLOW — DATA NAPOLI

Questo documento descrive le procedure pratiche da seguire per ogni tipologia di intervento manuale, arricchimento a lotti, correzione o ripristino nel database di SSC Napoli Data.

---

## Ricetta 1: Correggere un Campo Errato (es. Risultato da 2-1 a 1-1)

Quando si scopre che una fonte automatica ha importato un valore errato:

1. **Trova l'ID della partita o dell'entità**:
   ```powershell
   python dn.py query partite --stagione 1986-87
   ```
2. **Esegui la correzione con `dn fix` specificando motivo e fonte**:
   ```powershell
   python dn.py fix partite 1234 gol_casa 1 --motivo "Risultato errato su Wikipedia IT; verificato su Almanacco Panini" --fonte 5
   ```
   *Cosa succede internamente:*
   - La CLI imposta la sessione con attore, motivo, fonte certificata e batch ID.
   - Viene eseguito l'aggiornamento.
   - Il trigger registra vecchio (`2`) e nuovo (`1`) valore in `audit_log`.
   - Il record viene marcato come `verificato = 1`: nessun futuro import automatico potrà più alterarlo.
3. **Verifica la registrazione nell'audit log**:
   ```powershell
   python dn.py history partite 1234
   ```
4. **Verifica la coerenza complessiva**:
   ```powershell
   python dn.py check
   ```

---

## Ricetta 2: Annullare un Errore (Revert Reversibile)

Se una correzione conteneva a sua volta un errore o è stata applicata al record sbagliato:

### Annullare una singola modifica per Audit ID:
```powershell
# Visualizza l'ID della modifica incriminata
python dn.py history partite 1234

# Esegui il revert
python dn.py revert --audit-id 8812 --attore marco
```

### Annullare un intero lotto (Batch Revert):
```powershell
python dn.py revert --batch fix-2026-10-18-a --attore marco
```

*Nota di sicurezza:* Ogni revert è implementato come una normale istruzione `UPDATE` che ripristina il valore precedente, venendo a sua volta interamente tracciata nel log di audit. Nessuna operazione distrugge la cronologia.

---

## Ricetta 3: Arricchire le Formazioni di una Stagione tramite CSV

Per aggiungere formazioni storiche a lotti (es. stagione 1986-87):

1. **Compila il file CSV in `data/import/formazioni/1986-87.csv`**:
   ```csv
   partita_id,squadra,numero,giocatore,ruolo,titolare,minuto_in,minuto_out,fonte_id,confidence
   1234,Napoli,1,Garella,P,1,,,5,alta
   1234,Napoli,10,Maradona,,1,,,5,alta
   1234,Napoli,14,Bigliardi,,0,63,,5,alta
   ```
2. **Lancia la validazione preventiva senza scrivere (`--dry-run`)**:
   ```powershell
   python dn.py import formazioni data/import/formazioni/1986-87.csv --dry-run
   ```
   *Lo script verifica la validità delle FK e delle identità.*
3. **Esegui l'import definitivo**:
   ```powershell
   python dn.py import formazioni data/import/formazioni/1986-87.csv --attore marco --fonte 5
   ```
   *I record con `verificato = 1` non vengono sovrascritti, i nomi sconosciuti finiscono in quarantena (`nomi_da_risolvere`), e `copertura` per la sezione formazioni viene aggiornata a `completo`.*
4. **Verifica le invarianti della stagione**:
   ```powershell
   python dn.py check --stagione 1986-87
   ```

---

## Ricetta 4: Aggiungere un Singolo Marcatore Dimenticato

Per aggiungere rapidamente un gol mancante:
```powershell
python dn.py add-scorer --partita-id 1234 --giocatore "Diego Armando Maradona" --squadra "Napoli" --minuto 42 --tipo gol --fonte 5 --motivo "Recupero tabellino ufficiale"
```

---

## Ricetta 5: Fondere Record Duplicati (Merge Persone o Squadre)

Quando un giocatore o una squadra è stata creata due volte con varianti minime:

1. **Individua l'ID da conservare e quello da scartare**:
   - `id_tenuto`: 501 (es. "Diego Armando Maradona")
   - `id_scartato`: 542 (es. "Diego Maradona")
2. **Lancia il comando di merge**:
   ```powershell
   python dn.py merge persone 501 542 --motivo "Normalizzazione duplicato anagrafico"
   ```
   *Cosa succede:*
   - Tutte le chiavi esterne in `marcatori`, `presenze_stagionali`, `partite.arbitro_id` e formazioni vengono riassegnate all'`id_tenuto`.
   - Il record scartato riceve `fuso_in_id = 501`, rimanendo risolvibile come tombstone per non rompere URL storici o riferimenti esterni.

---

## Ricetta 6: Ciclo di Pubblicazione sul Sito Web

Quando i dati nel database sono pronti e verificati:

1. **Verifica invarianti di coerenza**:
   ```powershell
   python dn.py check
   ```
2. **Genera il dump testuale deterministico per Git**:
   ```powershell
   python dn.py dump
   ```
3. **Esporta il JSON con mappa di copertura per il frontend**:
   ```powershell
   python dn.py export
   ```
4. **Compila e verifica l'applicazione web statica**:
   ```powershell
   npm run build
   ```
5. **Esegui il commit e push su GitHub**:
   ```powershell
   git add db/dump/ data/matches.json public/
   git commit -m "Aggiornamento dataset storico e schede partite verificate"
   git push origin main
   ```
