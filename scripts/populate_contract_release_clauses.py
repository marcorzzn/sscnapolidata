#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SSC Napoli Contract Release Clauses (Clausole Rescisorie Storiche) Engine.
Populates:
- contract_release_clauses: Complete historical ledger of contractual buy-out / release clauses
  stipulated by SSC Napoli, including both executed clauses (Cavani, Higuaín, Kim, Lavezzi, Albiol),
  renegotiated/active clauses (Osimhen), expired/unexercised clauses (Zieliński, Koulibaly, Mertens, Hysaj),
  and notable inbound clause acquisitions (Fabián Ruiz from Real Betis).
"""

from __future__ import annotations
import logging
import sqlite3
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

sys.stdout.reconfigure(encoding="utf-8")

from napoli_scraper.config import DB_PATH
from napoli_scraper.storage import Storage

log = logging.getLogger("release_clauses")

RELEASE_CLAUSES_DATA = [
    {
        "player_id": "50571",
        "player_name": "Ezequiel Lavezzi",
        "clause_amount_eur": 30000000,
        "clause_amount_text": "30.000.000 €",
        "contract_signing_date": "2010-02-09",
        "contract_expiry_date": "2015-06-30",
        "clause_scope": "Valida per tutti i club (Italia ed Estero)",
        "status": "Esercitata",
        "exercising_club": "Paris Saint-Germain",
        "exercising_date": "2012-07-02",
        "official_balance_sheet_amount_eur": 28950000,
        "details_and_notes": "Prima grande clausola rescissoria dell'era De Laurentiis ad essere esercitata. Il Paris Saint-Germain di Leonardo e Ancelotti versò l'importo concordato; a bilancio SSC Napoli 2012/13 fu iscritta una plusvalenza netta di 27,5 milioni di euro.",
        "source": "Bilancio d'Esercizio SSC Napoli S.p.A. al 30/06/2013; Comunicato Ufficiale SSC Napoli del 02/07/2012",
    },
    {
        "player_id": "48280",
        "player_name": "Edinson Cavani",
        "clause_amount_eur": 64000000,
        "clause_amount_text": "64.000.000 €",
        "contract_signing_date": "2012-08-31",
        "contract_expiry_date": "2017-06-30",
        "clause_scope": "Valida per club esteri e italiani con pagamento unico o fideiussione bancaria di prima classe",
        "status": "Esercitata",
        "exercising_club": "Paris Saint-Germain",
        "exercising_date": "2013-07-16",
        "official_balance_sheet_amount_eur": 64000000,
        "details_and_notes": "Il PSG pagò l'intera clausola rescissoria di 64 milioni di euro (record assoluto per il calcio italiano all'epoca). I proventi finanziarono la straordinaria campagna acquisti di Rafa Benítez (Higuaín, Mertens, Albiol, Callejón).",
        "source": "Bilancio d'Esercizio SSC Napoli S.p.A. al 30/06/2014; Comunicato Ufficiale SSC Napoli del 16/07/2013",
    },
    {
        "player_id": "39153",
        "player_name": "Gonzalo Higuaín",
        "clause_amount_eur": 90000000,
        "clause_amount_text": "90.000.000 € (2 rate annuali da 45.000.000 €)",
        "contract_signing_date": "2013-07-27",
        "contract_expiry_date": "2018-06-30",
        "clause_scope": "Valida per tutti i club con scadenza esercizio fissata al 31 luglio di ciascun anno; pagamento rateizzabile in due esercizi contabili da 45.000.000 € ciascuno se attivata dal club",
        "status": "Esercitata",
        "exercising_club": "Juventus FC",
        "exercising_date": "2016-07-26",
        "official_balance_sheet_amount_eur": 90000000,
        "details_and_notes": "Dopo la stagione record da 36 gol in Serie A, la Juventus comunicò alla Lega Calcio l'esercizio formale della clausola rescissoria pagabile in due rate annuali da 45 milioni di euro. Ha generato a bilancio 2016/17 la più grande plusvalenza nella storia del club (86,5 milioni di euro netti).",
        "source": "Bilancio d'Esercizio SSC Napoli S.p.A. al 30/06/2017; Comunicato Ufficiale Juventus FC S.p.A. del 26/07/2016; Delibera Lega Serie A",
    },
    {
        "player_id": "503482",
        "player_name": "Kim Min-jae",
        "clause_amount_eur": 50000000,
        "clause_amount_text": "50.000.000 € (variabile fino a 58.000.000 € in base al fatturato)",
        "contract_signing_date": "2022-07-27",
        "contract_expiry_date": "2025-06-30",
        "clause_scope": "Valida esclusivamente per club esteri, esercitabile unicamente nella finestra temporale dal 1° al 15 luglio di ciascun anno, parametrizzata al fatturato del club acquirente",
        "status": "Esercitata",
        "exercising_club": "Bayern Monaco",
        "exercising_date": "2023-07-18",
        "official_balance_sheet_amount_eur": 50000000,
        "details_and_notes": "Il Bayern Monaco ha esercitato la clausola estera versando 50 milioni di euro al termine della stagione del 3° Scudetto, in cui il sudcoreano è stato eletto Miglior Difensore della Serie A.",
        "source": "Bilancio d'Esercizio SSC Napoli S.p.A. al 30/06/2024; Comunicato Ufficiale FC Bayern München del 18/07/2023",
    },
    {
        "player_id": "401530",
        "player_name": "Victor Osimhen",
        "clause_amount_eur": 130000000,
        "clause_amount_text": "130.000.000 € (poi rinegoziata a 75.000.000 € per l'estero)",
        "contract_signing_date": "2023-12-23",
        "contract_expiry_date": "2026-06-30",
        "clause_scope": "Inizialmente valida sia per club esteri che con restrizioni per l'Italia (130M€). A settembre 2024 rinegoziata con clausola rescissoria di 75M€ valida unicamente per club esteri, non valida per club italiani (con opzione di estensione contrattuale al 2027 in caso di mancata cessione entro giugno 2025)",
        "status": "Rinegoziata / Attiva per l'estero (75M€)",
        "exercising_club": None,
        "exercising_date": None,
        "official_balance_sheet_amount_eur": None,
        "details_and_notes": "Rinnovo record a 10 milioni netti a stagione firmato il 23 dicembre 2023 con clausola rescissoria originaria di 130 milioni. Nel settembre 2024, a seguito del mancato trasferimento a titolo definitivo in Premier/Saudi Pro League e del prestito secco al Galatasaray, la clausola è stata rimodulata a 75 milioni di euro per l'estero con opzione di estensione al 2027 a favore del Napoli.",
        "source": "Comunicato Ufficiale SSC Napoli del 23/12/2023; Accordi Contrattuali di Prestito SSC Napoli - Galatasaray SK del 03/09/2024; Relazione di Gestione 2024",
    },
    {
        "player_id": "181136",
        "player_name": "Piotr Zieliński",
        "clause_amount_eur": 65000000,
        "clause_amount_text": "65.000.000 €",
        "contract_signing_date": "2020-08-31",
        "contract_expiry_date": "2024-06-30",
        "clause_scope": "Valida esclusivamente per i club esteri",
        "status": "Scaduta / Non esercitata (svincolato a parametro zero)",
        "exercising_club": None,
        "exercising_date": None,
        "official_balance_sheet_amount_eur": None,
        "details_and_notes": "Clausola di protezione internazionale da 65 milioni di euro fissata nell'agosto 2020. Mai esercitata da club esteri; nell'estate 2023 rifiutata offerta araba dell'Al-Ahli. Il calciatore ha poi lasciato il club a parametro zero il 30 giugno 2024 trasferendosi all'Inter.",
        "source": "Comunicato Ufficiale SSC Napoli del 31/08/2020; Bilancio d'Esercizio SSC Napoli 2021-2024",
    },
    {
        "player_id": "93171",
        "player_name": "Kalidou Koulibaly",
        "clause_amount_eur": 150000000,
        "clause_amount_text": "150.000.000 €",
        "contract_signing_date": "2018-09-01",
        "contract_expiry_date": "2023-06-30",
        "clause_scope": "Valida esclusivamente per club esteri a decorrere dall'estate 2020",
        "status": "Non esercitata (ceduto successivamente a trattativa libera per 38.000.000 € al Chelsea)",
        "exercising_club": None,
        "exercising_date": None,
        "official_balance_sheet_amount_eur": None,
        "details_and_notes": "La clausola rescissoria più alta mai inserita dal Napoli (150 milioni di euro), voluta dal presidente De Laurentiis per blindare il difensore senegalese contro gli assalti di Manchester City e PSG. A un anno dalla scadenza contrattuale, nel luglio 2022 è stato ceduto a trattativa al Chelsea per 38 milioni di euro più bonus.",
        "source": "Dichiarazioni Ufficiali CdA SSC Napoli; Bilancio SSC Napoli 2018/19 e 2022/23",
    },
    {
        "player_id": "56416",
        "player_name": "Dries Mertens",
        "clause_amount_eur": 28000000,
        "clause_amount_text": "28.000.000 €",
        "contract_signing_date": "2017-05-27",
        "contract_expiry_date": "2020-06-30",
        "clause_scope": "Valida esclusivamente per club esteri, esercitabile solo nelle prime settimane di luglio",
        "status": "Scaduta / Non esercitata (rinnovato poi nel 2020 fino al 2022 senza clausola)",
        "exercising_club": None,
        "exercising_date": None,
        "official_balance_sheet_amount_eur": None,
        "details_and_notes": "Inserita nel maggio 2017 al termine della prima stagione da centravanti (34 gol stagionali). Nonostante il forte interesse di club cinesi ed europei, il calciatore ha sempre rifiutato ogni trasferimento, diventando il miglior marcatore di tutti i tempi del Napoli (148 gol).",
        "source": "Comunicato Ufficiale SSC Napoli del 27/05/2017; Bilancio d'Esercizio SSC Napoli 2017/18",
    },
    {
        "player_id": "15452",
        "player_name": "Raúl Albiol",
        "clause_amount_eur": 5000000,
        "clause_amount_text": "5.000.000 €",
        "contract_signing_date": "2016-09-23",
        "contract_expiry_date": "2020-06-30",
        "clause_scope": "Valida per club spagnoli della Liga",
        "status": "Esercitata",
        "exercising_club": "Villarreal CF",
        "exercising_date": "2019-07-04",
        "official_balance_sheet_amount_eur": 5000000,
        "details_and_notes": "Il Villarreal ha esercitato la clausola rescissoria di 5 milioni di euro per riportare il difensore spagnolo in patria dopo sei stagioni ad altissimo rendimento a Napoli.",
        "source": "Bilancio d'Esercizio SSC Napoli S.p.A. al 30/06/2020; Comunicato Ufficiale Villarreal CF del 04/07/2019",
    },
    {
        "player_id": "200053",
        "player_name": "Elseid Hysaj",
        "clause_amount_eur": 50000000,
        "clause_amount_text": "50.000.000 €",
        "contract_signing_date": "2016-10-05",
        "contract_expiry_date": "2021-06-30",
        "clause_scope": "Valida esclusivamente per i club esteri",
        "status": "Scaduta / Non esercitata (svincolato a parametro zero alla Lazio nel 2021)",
        "exercising_club": None,
        "exercising_date": None,
        "official_balance_sheet_amount_eur": None,
        "details_and_notes": "Fissata nel rinnovo quinquennale durante la gestione Sarri per respingere offerte dalla Premier League (Chelsea).",
        "source": "Comunicato Ufficiale SSC Napoli del 05/10/2016; Bilancio SSC Napoli 2017-2021",
    },
    {
        "player_id": "317482",
        "player_name": "Marko Rog",
        "clause_amount_eur": 60000000,
        "clause_amount_text": "60.000.000 €",
        "contract_signing_date": "2016-08-29",
        "contract_expiry_date": "2021-06-30",
        "clause_scope": "Valida esclusivamente per l'estero",
        "status": "Non esercitata (ceduto successivamente al Cagliari per 15M€)",
        "exercising_club": None,
        "exercising_date": None,
        "official_balance_sheet_amount_eur": None,
        "details_and_notes": "Inserita nel contratto stipulato all'arrivo dalla Dinamo Zagabria per tutelare l'investimento societario.",
        "source": "Contratti depositati in Lega Serie A; Bilancio SSC Napoli 2016/17",
    },
    {
        "player_id": "168948",
        "player_name": "Nikola Maksimović",
        "clause_amount_eur": 55000000,
        "clause_amount_text": "55.000.000 €",
        "contract_signing_date": "2016-08-31",
        "contract_expiry_date": "2021-06-30",
        "clause_scope": "Valida esclusivamente per l'estero",
        "status": "Scaduta / Non esercitata (svincolato a parametro zero nel 2021)",
        "exercising_club": None,
        "exercising_date": None,
        "official_balance_sheet_amount_eur": None,
        "details_and_notes": "Clausola estera inserita al momento del riscatto dal Torino nell'estate 2016.",
        "source": "Contratti depositati in Lega Serie A; Bilancio SSC Napoli 2016/17",
    },
    {
        "player_id": "307562",
        "player_name": "Fabián Ruiz",
        "clause_amount_eur": 30000000,
        "clause_amount_text": "30.000.000 € (Clausola di acquisto esercitata dal Napoli)",
        "contract_signing_date": "2018-07-05",
        "contract_expiry_date": "2023-06-30",
        "clause_scope": "Clausola rescissoria di svincolo della RFEF (Spagna) pagata dalla SSC Napoli per tesserare il calciatore",
        "status": "Esercitata in entrata dal Napoli",
        "exercising_club": "SSC Napoli (ai danni del Real Betis)",
        "exercising_date": "2018-07-05",
        "official_balance_sheet_amount_eur": 30000000,
        "details_and_notes": "Il Napoli ha depositato presso la Liga spagnola (RFEF) i 30 milioni di euro della clausola rescissoria del centrocampista andaluso, acquistandolo direttamente senza trattativa con il club andaluso. Nel contratto con il Napoli non fu poi inserita clausola rescissoria (ceduto al PSG nel 2022 per 23M€).",
        "source": "Comunicato Ufficiale Real Betis Balompié del 05/07/2018; Bilancio SSC Napoli al 30/06/2019",
    },
    {
        "player_id": "502670",
        "player_name": "Khvicha Kvaratskhelia",
        "clause_amount_eur": 100000000,
        "clause_amount_text": "100.000.000 € - 120.000.000 € (In negoziazione nel rinnovo contrattuale)",
        "contract_signing_date": "2022-07-01",
        "contract_expiry_date": "2027-06-30",
        "clause_scope": "Proposta dall'entourage (Jugheli) con richiesta di clausola da 80-100M€, controproposta della società fissata oltre i 110-120M€ per l'estero",
        "status": "In negoziazione (contratto originario privo di clausola rescissoria)",
        "exercising_club": None,
        "exercising_date": None,
        "official_balance_sheet_amount_eur": None,
        "details_and_notes": "Il contratto quinquennale originario stipulato nel 2022 all'arrivo dalla Dinamo Batumi (13,3M€) non conteneva alcuna clausola rescissoria. Le trattative di adeguamento contrattuale condotte nel corso del 2024 hanno avuto come fulcro l'introduzione di una clausola per l'estero, richiesta dall'entourage a 80-100M€ e dal Napoli a oltre 110M€.",
        "source": "Bilancio SSC Napoli al 30/06/2023; Conferenze stampa ufficiali Antonio Conte e Giovanni Manna 2024",
    },
]


def init_release_clauses_schema(conn: sqlite3.Connection):
    with conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS contract_release_clauses (
            clause_id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id TEXT,
            player_name TEXT,
            clause_amount_eur INTEGER,
            clause_amount_text TEXT,
            contract_signing_date TEXT,
            contract_expiry_date TEXT,
            clause_scope TEXT,
            status TEXT,
            exercising_club TEXT,
            exercising_date TEXT,
            official_balance_sheet_amount_eur INTEGER,
            details_and_notes TEXT,
            source TEXT
        );
        """)


def populate_release_clauses():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%H:%M:%S",
    )
    conn = sqlite3.connect(DB_PATH)
    init_release_clauses_schema(conn)

    log.info("Populating contract release clauses...")
    with conn:
        conn.execute("DELETE FROM contract_release_clauses")
        conn.executemany("""
            INSERT INTO contract_release_clauses
            (player_id, player_name, clause_amount_eur, clause_amount_text, contract_signing_date, contract_expiry_date,
             clause_scope, status, exercising_club, exercising_date, official_balance_sheet_amount_eur, details_and_notes, source)
            VALUES
            (:player_id, :player_name, :clause_amount_eur, :clause_amount_text, :contract_signing_date, :contract_expiry_date,
             :clause_scope, :status, :exercising_club, :exercising_date, :official_balance_sheet_amount_eur, :details_and_notes, :source)
        """, RELEASE_CLAUSES_DATA)

    conn.close()
    log.info(f"Successfully populated {len(RELEASE_CLAUSES_DATA)} contract release clauses in SQLite!")

    log.info("Re-exporting all tables to CSV, JSON, and ZIP bundle in dist/...")
    storage = Storage()
    exp_res = storage.export_all()
    log.info(f"Export finished successfully: {exp_res}")


if __name__ == "__main__":
    populate_release_clauses()
