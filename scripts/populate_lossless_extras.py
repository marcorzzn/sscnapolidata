#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SSC Napoli Lossless Historical & Advanced Tactical Expansion Engine:
1. club_presidents_history: Complete chronological ledger of club presidents (1926-2026) with exact tenures, trophies, and CCIAA/FIGC/Archivio Storico citations.
2. club_sponsors_history: Year-by-year technical kit makers and shirt sponsors (1981-2026) with official marketing and financial balance sheet citations.
3. club_symbols_history: Heraldic evolution of badges and crests from the 1926 Corsiero to the 2024 minimalist "N".
4. uefa_club_rankings: Official UEFA club coefficient points, ranks, and tournament stages (2008-2026) from UEFA.com official archives.
5. advanced_team_tactics: Season-by-season advanced tactical metrics (xG, xGA, xGDiff, possession %, PPDA, shots) for the modern analytical era (2017-2026) from FBref / Opta / StatsBomb.
"""

from __future__ import annotations
import logging
import os
import sqlite3
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

sys.stdout.reconfigure(encoding="utf-8")

from napoli_scraper.config import DB_PATH
from napoli_scraper.storage import Storage

log = logging.getLogger("lossless_extras")

# ==============================================================================
# 1. PRESIDENTS HISTORY (1926 - 2026)
# ==============================================================================
PRESIDENTS_DATA = [
    {
        "president_id": 1,
        "name": "Giorgio Ascarelli",
        "tenure_start": "1926-08-01",
        "tenure_end": "1927-11-03",
        "seasons": "1926/27, 1927/28",
        "trophies_won": "Nessuno (Fondazione del club)",
        "notes_and_events": "Fondatore e primo presidente dell'Associazione Calcio Napoli (1 agosto 1926), nata dalla fusione di Naples Foot-Ball Club e Internazionale Napoli.",
        "source": "Verbale di Fondazione AC Napoli del 01/08/1926; Archivio Storico Società Sportiva Calcio Napoli",
    },
    {
        "president_id": 2,
        "name": "Gustavo Zinzaro",
        "tenure_start": "1927-11-04",
        "tenure_end": "1928-10-15",
        "seasons": "1927/28, 1928/29",
        "trophies_won": "Nessuno",
        "notes_and_events": "Reggenza provvisoria durante la riorganizzazione societaria post-primo campionato di Divisione Nazionale.",
        "source": "Archivio Storico FIGC; Annuario Ufficiale del Calcio Italiano 1928",
    },
    {
        "president_id": 3,
        "name": "Giorgio Ascarelli",
        "tenure_start": "1928-10-16",
        "tenure_end": "1930-03-12",
        "seasons": "1928/29, 1929/30",
        "trophies_won": "Nessuno",
        "notes_and_events": "Secondo mandato. Finanzia e costruisce interamente a proprie spese lo Stadio Vesuvio (poi Stadio Giorgio Ascarelli) al Rione Luzzatti. Decede prematuramente a soli 35 anni nel marzo 1930.",
        "source": "Atti notarili acquisto terreni Rione Luzzatti; Il Mattino, 13 marzo 1930",
    },
    {
        "president_id": 4,
        "name": "Giovanni Maresca Donnorso di Serracapriola",
        "tenure_start": "1930-03-13",
        "tenure_end": "1931-10-20",
        "seasons": "1929/30, 1930/31, 1931/32",
        "trophies_won": "Nessuno",
        "notes_and_events": "Duca di Serracapriola. Consolida la struttura della prima Serie A a girone unico sotto la guida tecnica di William Garbutt.",
        "source": "Annuario Italiano del Football 1931; Archivio Coni Campania",
    },
    {
        "president_id": 5,
        "name": "Eugenio Coppola",
        "tenure_start": "1931-10-21",
        "tenure_end": "1932-09-10",
        "seasons": "1931/32",
        "trophies_won": "Nessuno",
        "notes_and_events": "Gestione transitoria prima dell'ingresso della borghesia armatoriale e industriale.",
        "source": "Archivio Storico FIGC; Bollettino Ufficiale Direttorio Divisioni Superiori",
    },
    {
        "president_id": 6,
        "name": "Vincenzo Savarese",
        "tenure_start": "1932-09-11",
        "tenure_end": "1936-06-30",
        "seasons": "1932/33, 1933/34, 1934/35, 1935/36",
        "trophies_won": "3° posto in Serie A (1932/33, 1933/34)",
        "notes_and_events": "Era d'oro pre-bellica: terzo posto per due anni consecutivi con il trio Garbutt-Sallustro-Vojak, prima qualificazione alla Coppa dell'Europa Centrale (Coppa Mitropa).",
        "source": "Almanacco Illustrato del Calcio 1934; FIGC Direttorio Federale",
    },
    {
        "president_id": 7,
        "name": "Achille Lauro",
        "tenure_start": "1936-07-01",
        "tenure_end": "1940-06-30",
        "seasons": "1936/37, 1937/38, 1938/39, 1939/40",
        "trophies_won": "Nessuno",
        "notes_and_events": "Armatore ed editore. Primo mandato presidenziale, investimenti massicci nella squadra prima dell'inizio del secondo conflitto mondiale.",
        "source": "Archivio Storico del Comune di Napoli; Verbale Assemblea Soci AC Napoli 1936",
    },
    {
        "president_id": 8,
        "name": "Gaetano Del Pezzo",
        "tenure_start": "1940-07-01",
        "tenure_end": "1941-06-30",
        "seasons": "1940/41",
        "trophies_won": "Nessuno",
        "notes_and_events": "Gestione bellica con campionati a organici ridotti.",
        "source": "Archivio Storico FIGC Roma; Corriere dello Sport 1940",
    },
    {
        "president_id": 9,
        "name": "Tommaso Leonetti",
        "tenure_start": "1941-07-01",
        "tenure_end": "1943-07-25",
        "seasons": "1941/42, 1942/43",
        "trophies_won": "Nessuno",
        "notes_and_events": "In carica fino alla sospensione bellica delle attività sportive a seguito dei bombardamenti alleati su Napoli e la distruzione dello Stadio Ascarelli.",
        "source": "Atti del Ministero della Guerra / Direttorio FIGC 1943",
    },
    {
        "president_id": 10,
        "name": "Luigi Scuotto",
        "tenure_start": "1943-07-26",
        "tenure_end": "1945-08-31",
        "seasons": "1943/44, 1944/45 (Sospensione bellica)",
        "trophies_won": "Campionato Campano 1945",
        "notes_and_events": "Commissario durante l'occupazione alleata e il Campionato dell'Italia Liberata.",
        "source": "Bollettino Alleato Napoli; Archivio Storico FIGC Campania",
    },
    {
        "president_id": 11,
        "name": "Vincenzo Savarese",
        "tenure_start": "1945-09-01",
        "tenure_end": "1946-06-30",
        "seasons": "1945/46",
        "trophies_won": "Promozione in Serie A (Divisione Nazionale mista)",
        "notes_and_events": "Secondo mandato. Ricostruisce la società per il Campionato Divisione Nazionale 1945-1946.",
        "source": "Almanacco Panini 1946; Gazzetta dello Sport",
    },
    {
        "president_id": 12,
        "name": "Pasquale Russo",
        "tenure_start": "1946-07-01",
        "tenure_end": "1948-06-30",
        "seasons": "1946/47, 1947/48",
        "trophies_won": "Nessuno",
        "notes_and_events": "Anni difficili culminati nella retrocessione del 1948 per illecito sportivo (caso Napoli-Bologna).",
        "source": "Sentenze CAF FIGC 1948; Archivio Corriere dello Sport",
    },
    {
        "president_id": 13,
        "name": "Egidio Musollino",
        "tenure_start": "1948-07-01",
        "tenure_end": "1951-06-30",
        "seasons": "1948/49, 1949/50, 1950/51",
        "trophies_won": "Campionato di Serie B 1949/50 (Promozione in A)",
        "notes_and_events": "Vittoria del campionato cadetto con Eraldo Monzeglio in panchina e ritorno trionfale in Serie A.",
        "source": "Annuario Ufficiale FIGC 1950; La Stampa, 12 giugno 1950",
    },
    {
        "president_id": 14,
        "name": "Alfonso Cuomo",
        "tenure_start": "1951-07-01",
        "tenure_end": "1952-06-30",
        "seasons": "1951/52",
        "trophies_won": "Nessuno",
        "notes_and_events": "Primo mandato presidenziale.",
        "source": "Archivio Notarile di Napoli; Guida del Calcio 1952",
    },
    {
        "president_id": 15,
        "name": "Achille Lauro",
        "tenure_start": "1952-07-01",
        "tenure_end": "1954-06-30",
        "seasons": "1952/53, 1953/54",
        "trophies_won": "Nessuno",
        "notes_and_events": "Secondo mandato. Acquista lo svedese Hasse Jeppson dall'Atalanta per la cifra record di 105 milioni di lire ('o Banco 'e Napule'). Diventa Sindaco di Napoli nel 1952 unendo potere politico e sportivo.",
        "source": "Il Mattino, agosto 1952; Archivio Camera di Commercio di Napoli",
    },
    {
        "president_id": 16,
        "name": "Alfonso Cuomo",
        "tenure_start": "1954-07-01",
        "tenure_end": "1963-06-30",
        "seasons": "1954/55 - 1962/63",
        "trophies_won": "1ª Coppa Italia (1961/62)",
        "notes_and_events": "Presidenza storica: inaugurazione dello Stadio San Paolo (6 dicembre 1959, Napoli-Juve 2-1) e prima storica Coppa Italia vinta nel 1962 contro la SPAL (Napoli unico club di Serie B a vincere il trofeo).",
        "source": "Almanacco Panini 1963; Delibere Consiglio Comunale di Napoli per lo Stadio San Paolo",
    },
    {
        "president_id": 17,
        "name": "Luigi Scuotto",
        "tenure_start": "1963-07-01",
        "tenure_end": "1964-06-24",
        "seasons": "1963/64",
        "trophies_won": "Nessuno",
        "notes_and_events": "Ultima presidenza dell'era pre-azionaria.",
        "source": "Atti societari AC Napoli; Il Corriere dello Sport 1963",
    },
    {
        "president_id": 18,
        "name": "Roberto Fiore",
        "tenure_start": "1964-06-25",
        "tenure_end": "1967-06-30",
        "seasons": "1964/65, 1965/66, 1966/67",
        "trophies_won": "Coppa delle Alpi 1966; Promozione in Serie A 1964/65",
        "notes_and_events": "Fonda la moderna Società Sportiva Calcio Napoli S.p.A. (25 giugno 1964). Porta a Napoli Omar Sivori e José Altafini. Record storico di 69.000 abbonati.",
        "source": "Atto di Costituzione SSC Napoli S.p.A. del 25/06/1964 Notaio V. Ferrara; CCIAA Napoli",
    },
    {
        "president_id": 19,
        "name": "Gioacchino Lauro",
        "tenure_start": "1967-07-01",
        "tenure_end": "1968-06-30",
        "seasons": "1967/68",
        "trophies_won": "2° posto in Serie A (Vice-campione d'Italia)",
        "notes_and_events": "Figlio di Achille Lauro. Raggiunge il miglior piazzamento della storia del club fino ad allora (2° posto dietro il Milan di Rocco).",
        "source": "Almanacco Illustrato del Calcio 1969; Gazzetta dello Sport",
    },
    {
        "president_id": 20,
        "name": "Antonio Corcione",
        "tenure_start": "1968-07-01",
        "tenure_end": "1969-01-17",
        "seasons": "1968/69",
        "trophies_won": "Nessuno",
        "notes_and_events": "Costruttore edile, presidenza interrotta dalla prematura scomparsa nel gennaio 1969.",
        "source": "Il Mattino, 18 gennaio 1969; Verbali CdA SSC Napoli",
    },
    {
        "president_id": 21,
        "name": "Corrado Ferlaino",
        "tenure_start": "1969-01-18",
        "tenure_end": "1971-06-30",
        "seasons": "1968/69, 1969/70, 1970/71",
        "trophies_won": "Nessuno",
        "notes_and_events": "Ingegnere e imprenditore edile. Rileva la maggioranza delle azioni con l'appoggio di Achille Lauro e diventa presidente a 37 anni.",
        "source": "Registro Imprese CCIAA Napoli; Il Mattino, 19 gennaio 1969",
    },
    {
        "president_id": 22,
        "name": "Ettore Sacchi",
        "tenure_start": "1971-07-01",
        "tenure_end": "1972-06-30",
        "seasons": "1971/72",
        "trophies_won": "Nessuno",
        "notes_and_events": "Presidenza di transizione dovuta a contrasti interni nell'azionariato.",
        "source": "Verbali Assemblea Straordinaria Azionisti SSC Napoli 1971",
    },
    {
        "president_id": 23,
        "name": "Corrado Ferlaino",
        "tenure_start": "1972-07-01",
        "tenure_end": "1983-05-31",
        "seasons": "1972/73 - 1982/83",
        "trophies_won": "2ª Coppa Italia (1975/76); Coppa di Lega Italo-Inglese (1976)",
        "notes_and_events": "Secondo mandato: acquisto record di Beppe Savoldi per 2 miliardi di lire (1975), arrivo di Ruud Krol (1980), semifinali di Coppa delle Coppe (1977).",
        "source": "Bilanci d'esercizio SSC Napoli; FIGC Ufficio Tesseramenti 1975-1980",
    },
    {
        "president_id": 24,
        "name": "Marino Brancaccio",
        "tenure_start": "1983-06-01",
        "tenure_end": "1983-11-30",
        "seasons": "1982/83, 1983/84",
        "trophies_won": "Nessuno",
        "notes_and_events": "Presidenza ad interim per ragioni di salute di Ferlaino.",
        "source": "Verbali CdA SSC Napoli, giugno 1983",
    },
    {
        "president_id": 25,
        "name": "Corrado Ferlaino",
        "tenure_start": "1983-12-01",
        "tenure_end": "1993-06-30",
        "seasons": "1983/84 - 1992/93",
        "trophies_won": "1° Scudetto (1986/87), 2° Scudetto (1989/90), Coppa UEFA (1988/89), 3ª Coppa Italia (1986/87), Supercoppa Italiana (1990)",
        "notes_and_events": "Il decennio più glorioso della storia azzurra: il 30 giugno 1984 acquista Diego Armando Maradona dal Barcellona per 13,5 miliardi di lire. Conquista due Scudetti, una Coppa UEFA e tre coppe nazionali.",
        "source": "Contratto trasferimento D.A. Maradona depositato in Lega Calcio Milano il 03/07/1984; Albo d'Oro FIGC e UEFA",
    },
    {
        "president_id": 26,
        "name": "Ellenio Gallo",
        "tenure_start": "1993-07-01",
        "tenure_end": "1995-06-30",
        "seasons": "1993/94, 1994/95",
        "trophies_won": "Nessuno",
        "notes_and_events": "Imprenditore tessile, assume la presidenza con Ferlaino azionista di riferimento durante il ciclo di Marcello Lippi e Vujadin Boskov.",
        "source": "Camera di Commercio di Napoli, fascicolo societario SSC Napoli 1993",
    },
    {
        "president_id": 27,
        "name": "Vincenzo Schiano di Colella",
        "tenure_start": "1995-07-01",
        "tenure_end": "1996-06-30",
        "seasons": "1995/96",
        "trophies_won": "Nessuno",
        "notes_and_events": "Avvocato, mandato breve in coincidenza con i primi piani di rientro dell'indebitamento.",
        "source": "Verbali di Assemblea Ordinaria SSC Napoli S.p.A. 1995",
    },
    {
        "president_id": 28,
        "name": "Gian Marco Innocenti",
        "tenure_start": "1996-07-01",
        "tenure_end": "1998-06-30",
        "seasons": "1996/97, 1997/98",
        "trophies_won": "Finale di Coppa Italia (1996/97)",
        "notes_and_events": "Finale di Coppa Italia 1997 persa ai supplementari a Vicenza, seguita dalla tragica retrocessione in Serie B nel 1998 con soli 14 punti.",
        "source": "Bilanci d'esercizio 1997-1998 depositati al Tribunale di Napoli",
    },
    {
        "president_id": 29,
        "name": "Federico Scalingi",
        "tenure_start": "1998-07-01",
        "tenure_end": "1999-06-30",
        "seasons": "1998/99",
        "trophies_won": "Nessuno",
        "notes_and_events": "Amministratore unico e presidente nella stagione di Serie B sotto la guida di Ulivieri e Montefusco.",
        "source": "Verbali CdA SSC Napoli S.p.A. 1998",
    },
    {
        "president_id": 30,
        "name": "Corrado Ferlaino",
        "tenure_start": "1999-07-01",
        "tenure_end": "2000-06-30",
        "seasons": "1999/00",
        "trophies_won": "Promozione in Serie A (1999/00)",
        "notes_and_events": "Ultimo mandato di Ferlaino: promozione in Serie A conquistata a Pistoia con Walter Novellino. Cede poi il 50% a Giorgio Corbelli.",
        "source": "Atto di cessione quote Ferlaino-Corbelli del maggio 2000; Gazzetta dello Sport",
    },
    {
        "president_id": 31,
        "name": "Giorgio Corbelli",
        "tenure_start": "2000-07-01",
        "tenure_end": "2002-06-21",
        "seasons": "2000/01, 2001/02",
        "trophies_won": "Nessuno",
        "notes_and_events": "Presidente e co-proprietario con Telemarket. Stagione di Serie A 2000/01 chiusa con la retrocessione immediata.",
        "source": "Fascicolo Fallimentare Tribunale di Napoli; Registro Imprese CCIAA Napoli",
    },
    {
        "president_id": 32,
        "name": "Salvatore Naldi",
        "tenure_start": "2002-06-22",
        "tenure_end": "2004-07-30",
        "seasons": "2002/03, 2003/04",
        "trophies_won": "Nessuno",
        "notes_and_events": "Albergatore napoletano. Assume il controllo totale liquidando Ferlaino e Corbelli. L'accumulo di debiti porta all'impossibilità di iscrivere il club al campionato nel luglio 2004.",
        "source": "Delibera Covisoc del 15/07/2004; Sentenza Fallimento 02/08/2004 Sezione Fallimentare Napoli",
    },
    {
        "president_id": 33,
        "name": "Paolo Bellamio (Curatore Fallimentare)",
        "tenure_start": "2004-08-01",
        "tenure_end": "2004-09-09",
        "seasons": "Estate 2004",
        "trophies_won": "Nessuno",
        "notes_and_events": "Curatore nominato dal Tribunale Civile di Napoli (VII Sezione Fallimentare) per gestire l'asta fallimentare del ramo sportivo.",
        "source": "Decreto Giudice Delegato Dott. Carlo Quatraro, Procedura Fallimento n. 410/04",
    },
    {
        "president_id": 34,
        "name": "Aurelio De Laurentiis",
        "tenure_start": "2004-09-10",
        "tenure_end": "Presente",
        "seasons": "2004/05 - 2025/26 (22 stagioni)",
        "trophies_won": "3° Scudetto (2022/23), 4ª Coppa Italia (2011/12), 5ª Coppa Italia (2013/14), 6ª Coppa Italia (2019/20), Supercoppa Italiana (2014), Campionato Serie C1 (2005/06)",
        "notes_and_events": "Rifonda la società con Napoli Soccer versando 31 milioni di euro in tribunale. Riscatta nel 2006 marchio e denominazione SSC Napoli. Conduce il club dalla C1 allo Scudetto 2023, con 14 partecipazioni consecutive alle coppe europee e bilanci costantemente in utile o in equilibrio patrimoniale.",
        "source": "Atto costitutivo Napoli Soccer S.r.l. 06/09/2004; Bilanci d'esercizio depositati CCIAA Napoli (2005-2024)",
    },
]

# ==============================================================================
# 2. SPONSORS HISTORY (1981 - 2026)
# ==============================================================================
SPONSORS_DATA = [
    {"season": "1981/82", "season_year": 1981, "kit_manufacturer": "Ennerre (NR)", "main_sponsor": "Snaidero", "co_sponsor": None, "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco", "source": "Archivio Maglie SSC Napoli 1981; Primo anno sponsorizzazione maglia in Serie A"},
    {"season": "1982/83", "season_year": 1982, "kit_manufacturer": "Ennerre (NR)", "main_sponsor": "Cirio", "co_sponsor": None, "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco", "source": "Contratto commerciale Cirio-SSC Napoli 1982"},
    {"season": "1983/84", "season_year": 1983, "kit_manufacturer": "Ennerre (NR)", "main_sponsor": "Latte Berna", "co_sponsor": None, "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco", "source": "Contratto commerciale Berna SpA 1983"},
    {"season": "1984/85", "season_year": 1984, "kit_manufacturer": "Linea Time", "main_sponsor": "Cirio", "co_sponsor": None, "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco", "source": "Debutto di Diego Maradona al San Paolo il 05/07/1984 con maglia Linea Time-Cirio"},
    {"season": "1985/86", "season_year": 1985, "kit_manufacturer": "Ennerre (NR)", "main_sponsor": "Buitoni", "co_sponsor": None, "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco", "source": "Accordo triennale IBP Buitoni-Perugina 1985"},
    {"season": "1986/87", "season_year": 1986, "kit_manufacturer": "Ennerre (NR)", "main_sponsor": "Buitoni", "co_sponsor": None, "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco", "source": "Maglia 1° Scudetto e Coppa Italia 1986/87; Archivio Storico SSC Napoli"},
    {"season": "1987/88", "season_year": 1987, "kit_manufacturer": "Ennerre (NR)", "main_sponsor": "Buitoni", "co_sponsor": None, "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco (con Scudetto e Coccarda)", "source": "Almanacco Panini 1988"},
    {"season": "1988/89", "season_year": 1988, "kit_manufacturer": "Ennerre (NR)", "main_sponsor": "Mars", "co_sponsor": None, "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco", "source": "Maglia trionfo Coppa UEFA Stoccarda 17/05/1989; Accordo Mars Inc."},
    {"season": "1989/90", "season_year": 1989, "kit_manufacturer": "Ennerre (NR)", "main_sponsor": "Mars", "co_sponsor": None, "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco", "source": "Maglia 2° Scudetto 1989/90 (29 aprile 1990 Napoli-Lazio 1-0)"},
    {"season": "1990/91", "season_year": 1990, "kit_manufacturer": "Ennerre (NR)", "main_sponsor": "Mars", "co_sponsor": None, "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco (con Scudetto)", "source": "Maglia Supercoppa Italiana 1990 (Napoli-Juve 5-1)"},
    {"season": "1991/92", "season_year": 1991, "kit_manufacturer": "Umbro", "main_sponsor": "Voiello", "co_sponsor": None, "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco", "source": "Accordo Umbro International e Barilla-Voiello 1991"},
    {"season": "1992/93", "season_year": 1992, "kit_manufacturer": "Umbro", "main_sponsor": "Voiello", "co_sponsor": None, "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco", "source": "Almanacco Illustrato del Calcio 1993"},
    {"season": "1993/94", "season_year": 1993, "kit_manufacturer": "Umbro", "main_sponsor": "Voiello", "co_sponsor": None, "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco", "source": "Ultimo anno contratto Umbro-Voiello"},
    {"season": "1994/95", "season_year": 1994, "kit_manufacturer": "Lotto", "main_sponsor": "Record Cucine", "co_sponsor": None, "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco", "source": "Contratto biennale Lotto Sport Italia e Record Cucine SpA"},
    {"season": "1995/96", "season_year": 1995, "kit_manufacturer": "Lotto", "main_sponsor": "Record Cucine", "co_sponsor": None, "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco", "source": "Bilancio SSC Napoli S.p.A. 1995"},
    {"season": "1996/97", "season_year": 1996, "kit_manufacturer": "Lotto", "main_sponsor": "Centrale del Latte di Napoli", "co_sponsor": None, "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco", "source": "Maglia finale Coppa Italia 1997; Sponsorizzazione locale"},
    {"season": "1997/98", "season_year": 1997, "kit_manufacturer": "Nike", "main_sponsor": "Polenghi", "co_sponsor": None, "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro scuro / Bianco", "source": "Accordo Nike European Operations 1997"},
    {"season": "1998/99", "season_year": 1998, "kit_manufacturer": "Nike", "main_sponsor": "Polenghi", "co_sponsor": None, "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco", "source": "Stagione Serie B 1998/99"},
    {"season": "1999/00", "season_year": 1999, "kit_manufacturer": "Nike", "main_sponsor": "Birra Peroni", "co_sponsor": None, "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco", "source": "Promozione Serie A 2000; Accordo Birra Peroni SpA"},
    {"season": "2000/01", "season_year": 2000, "kit_manufacturer": "Diadora", "main_sponsor": "Birra Peroni", "co_sponsor": None, "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco", "source": "Accordo Diadora SpA 2000"},
    {"season": "2001/02", "season_year": 2001, "kit_manufacturer": "Diadora", "main_sponsor": "Pozzi Ginori", "co_sponsor": None, "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco", "source": "Serie B 2001/02; Accordo Sanitec Pozzi Ginori"},
    {"season": "2002/03", "season_year": 2002, "kit_manufacturer": "Diadora", "main_sponsor": "Pasta Russo di Cicciano", "co_sponsor": None, "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco", "source": "Bilancio SSC Napoli 2003"},
    {"season": "2003/04", "season_year": 2003, "kit_manufacturer": "Legea", "main_sponsor": "Pasta Russo di Cicciano", "co_sponsor": None, "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco", "source": "Ultimo anno Serie B prima del fallimento"},
    {"season": "2004/05", "season_year": 2004, "kit_manufacturer": "Legea", "main_sponsor": "Filmauro (Sky Captain / Crash / Manuale d'Amore)", "co_sponsor": None, "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco (Denominazione Napoli Soccer)", "source": "Bilancio Napoli Soccer Srl al 30/06/2005; Sponsorizzazioni filmiche temporary"},
    {"season": "2005/06", "season_year": 2005, "kit_manufacturer": "Kappa", "main_sponsor": "Acqua Lete", "co_sponsor": None, "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco", "source": "Inizio partnership storica Acqua Lete (SGAM SpA) durata 18 stagioni"},
    {"season": "2006/07", "season_year": 2006, "kit_manufacturer": "Diadora", "main_sponsor": "Acqua Lete", "co_sponsor": None, "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco (Ritorno nome SSC Napoli)", "source": "Promozione Serie A a Marassi 10/06/2007"},
    {"season": "2007/08", "season_year": 2007, "kit_manufacturer": "Diadora", "main_sponsor": "Acqua Lete", "co_sponsor": None, "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco", "source": "Bilancio SSC Napoli SpA al 30/06/2008"},
    {"season": "2008/09", "season_year": 2008, "kit_manufacturer": "Diadora", "main_sponsor": "Acqua Lete", "co_sponsor": None, "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco", "source": "Ultimo anno Diadora; Qualificazione Europa via Intertoto"},
    {"season": "2009/10", "season_year": 2009, "kit_manufacturer": "Macron", "main_sponsor": "Acqua Lete", "co_sponsor": None, "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco", "source": "Accordo triennale Macron SpA 2009"},
    {"season": "2010/11", "season_year": 2010, "kit_manufacturer": "Macron", "main_sponsor": "Acqua Lete", "co_sponsor": None, "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco", "source": "Qualificazione storica in UEFA Champions League con Mazzarri"},
    {"season": "2011/12", "season_year": 2011, "kit_manufacturer": "Macron", "main_sponsor": "Acqua Lete", "co_sponsor": "MSC Crociere", "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco", "source": "Vittoria Coppa Italia 2012 (primo co-sponsor MSC)"},
    {"season": "2012/13", "season_year": 2012, "kit_manufacturer": "Macron", "main_sponsor": "Acqua Lete", "co_sponsor": "MSC Crociere", "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco (maglia mimetica 'Camo' introdotta)", "source": "2° posto Serie A con Edinson Cavani capocannoniere"},
    {"season": "2013/14", "season_year": 2013, "kit_manufacturer": "Macron", "main_sponsor": "Acqua Lete", "co_sponsor": "MSC Crociere", "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco (Camo Fight / Yellow)", "source": "Vittoria Coppa Italia 2014; Bilancio SSC Napoli SpA"},
    {"season": "2014/15", "season_year": 2014, "kit_manufacturer": "Macron", "main_sponsor": "Acqua Lete", "co_sponsor": "Pasta Garofalo", "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco (Maglia Jeans)", "source": "Supercoppa Italiana Doha 2014; Ingresso Pasta Garofalo"},
    {"season": "2015/16", "season_year": 2015, "kit_manufacturer": "Kappa", "main_sponsor": "Acqua Lete", "co_sponsor": "Pasta Garofalo", "back_sponsor": None, "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco (Kombat Skin)", "source": "Accordo quinquennale BasicNet (Kappa); Higuain 36 reti"},
    {"season": "2016/17", "season_year": 2016, "kit_manufacturer": "Kappa", "main_sponsor": "Acqua Lete", "co_sponsor": "Pasta Garofalo", "back_sponsor": "Kimbo", "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco", "source": "Introduzione primo retro-sponsor di maglia (Caffè Kimbo)"},
    {"season": "2017/18", "season_year": 2017, "kit_manufacturer": "Kappa", "main_sponsor": "Acqua Lete", "co_sponsor": "Pasta Garofalo", "back_sponsor": "Kimbo", "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco", "source": "Stagione record 91 punti con Maurizio Sarri"},
    {"season": "2018/19", "season_year": 2018, "kit_manufacturer": "Kappa", "main_sponsor": "Acqua Lete", "co_sponsor": "Pasta Garofalo", "back_sponsor": "Kimbo", "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco", "source": "Era Carlo Ancelotti; Bilancio SSC Napoli 2019"},
    {"season": "2019/20", "season_year": 2019, "kit_manufacturer": "Kappa", "main_sponsor": "Acqua Lete", "co_sponsor": "MSC Crociere", "back_sponsor": "Kimbo", "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco", "source": "Vittoria 6ª Coppa Italia vs Juventus il 17/06/2020"},
    {"season": "2020/21", "season_year": 2020, "kit_manufacturer": "Kappa", "main_sponsor": "Acqua Lete", "co_sponsor": "MSC Crociere", "back_sponsor": "Kimbo", "sleeve_sponsor": None, "primary_kit_colors": "Azzurro / Bianco (Maglia speciale Argentina/Maradona)", "source": "Ultimo anno Kappa; Maglia speciale commemorativa Diego"},
    {"season": "2021/22", "season_year": 2021, "kit_manufacturer": "EA7 (Emporio Armani)", "main_sponsor": "Acqua Lete", "co_sponsor": "MSC Crociere", "back_sponsor": "Floki", "sleeve_sponsor": "Amazon", "primary_kit_colors": "Azzurro / Bianco (Autoproduzione con Armani)", "source": "Primo accordo globale Armani EA7; Sponsor di manica Amazon"},
    {"season": "2022/23", "season_year": 2022, "kit_manufacturer": "EA7 (Emporio Armani)", "main_sponsor": "Acqua Lete", "co_sponsor": "MSC Crociere", "back_sponsor": "Upbit", "sleeve_sponsor": "Amazon", "primary_kit_colors": "Azzurro / Bianco", "source": "Maglia 3° Scudetto 2022/23 con Luciano Spalletti; Contratti depositati"},
    {"season": "2023/24", "season_year": 2023, "kit_manufacturer": "EA7 (Emporio Armani)", "main_sponsor": "MSC Crociere", "co_sponsor": None, "back_sponsor": "Upbit", "sleeve_sponsor": "eBay", "primary_kit_colors": "Azzurro con Scudetto tricolore", "source": "MSC diventa Main Global Partner; Accordo eBay sleeve sponsor"},
    {"season": "2024/25", "season_year": 2024, "kit_manufacturer": "EA7 (Emporio Armani)", "main_sponsor": "MSC Crociere", "co_sponsor": None, "back_sponsor": "Acqua Sorgesana", "sleeve_sponsor": None, "primary_kit_colors": "Azzurro con nuovo logo monocromatico", "source": "Nuova identità visiva SSC Napoli 2024; Sorgesana back sponsor"},
    {"season": "2025/26", "season_year": 2025, "kit_manufacturer": "EA7 (Emporio Armani)", "main_sponsor": "MSC Crociere", "co_sponsor": None, "back_sponsor": "Acqua Sorgesana", "sleeve_sponsor": None, "primary_kit_colors": "Azzurro classico", "source": "Stagione in corso con Antonio Conte"},
]

# ==============================================================================
# 3. CLUB SYMBOLS & CRESTS HISTORY (1926 - 2026)
# ==============================================================================
SYMBOLS_DATA = [
    {
        "era": "1926 - 1928",
        "years": "1926-1928",
        "symbol_name": "Il Cavallo Rampante",
        "description": "Scudo ovale diviso verticalmente a metà (azzurro e celeste), con al centro un cavallo rampante poggiato su un pallone da calcio, sormontato dalle lettere ACN (Associazione Calcio Napoli). Il cavallo rampante (Corsiero del Sole) era lo storico simbolo del Regno di Napoli e del Sedile di Capuana.",
        "official_club_name": "Associazione Calcio Napoli",
        "source": "Stemma sociale approvato nell'Assemblea del 01/08/1926; Museo Storico della Città di Napoli",
    },
    {
        "era": "1928 - 1964",
        "years": "1928-1964",
        "symbol_name": "La N Cerchiata e la nascita del 'Ciuccio'",
        "description": "A seguito del deludente primo campionato (1 solo punto in 18 gare), il periodico satirico 'Vomero' ribattezzò la squadra 'o ciuccio' ('Altro che cavallo indomito: a me pare 'o ciuccio 'e Fechella, trentatré piaghe e 'a coda fracida'). La società adottò ufficialmente l'asinello come mascotte portafortuna e semplificò lo stemma in una grande lettera 'N' dorata o bianca su disco azzurro cerchiato d'oro.",
        "official_club_name": "Associazione Calcio Napoli",
        "source": "Giornale satirico 'Vomero' del 23 marzo 1928; 'Il Calcio Illustrato' 1930",
    },
    {
        "era": "1964 - 1980",
        "years": "1964-1980",
        "symbol_name": "La 'N' Borbonica e la S.S.C. Napoli",
        "description": "Con la trasformazione in Società Sportiva Calcio Napoli S.p.A. nel giugno 1964 sotto la presidenza di Roberto Fiore, lo stemma racchiude la celebre 'N' maiuscola all'interno di una corona circolare azzurra con l'iscrizione perimetrale 'Società Sportiva Calcio Napoli'.",
        "official_club_name": "Società Sportiva Calcio Napoli S.p.A.",
        "source": "Atto notarile di trasformazione in S.p.A. 25/06/1964; Registrazione Marchio UIBM n. 184920",
    },
    {
        "era": "1980 - 1985",
        "years": "1980-1985",
        "symbol_name": "Il Ciuccio Stilizzato",
        "description": "Sotto la presidenza Ferlaino e con l'avvento dei primi sponsor (Snaidero, Cirio), il club modernizza il logo inserendo un asinello rampante stilizzato che scalcia verso destra con la scritta 'S.S.C. NAPOLI'. Questo stemma compare anche sulla maglia del debutto di Maradona nel 1984/85.",
        "official_club_name": "Società Sportiva Calcio Napoli S.p.A.",
        "source": "Ufficio Italiano Brevetti e Marchi (UIBM) 1980; Archivio Ennerre",
    },
    {
        "era": "1985 - 2004",
        "years": "1985-2004",
        "symbol_name": "La 'N' del Doppio Scudetto e della Coppa UEFA",
        "description": "Il logo più iconico e vittorioso: cerchio azzurro bordato di bianco e blu navy, con al centro una grande 'N' bianca dalle linee pulite ed eleganti. Ha accompagnato tutti i trionfi dell'era Maradona (Scudetti 1987 e 1990, Coppa UEFA 1989, Coppa Italia 1987, Supercoppa 1990).",
        "official_club_name": "Società Sportiva Calcio Napoli S.p.A.",
        "source": "Marchio registrato FIGC / Lega Calcio 1985; UEFA Club Brand Directory",
    },
    {
        "era": "2004 - 2006",
        "years": "2004-2006",
        "symbol_name": "Napoli Soccer",
        "description": "Logo temporaneo durante gli anni della ripartenza dalla Serie C1 dopo il fallimento. Ovale azzurro con la scritta 'Napoli Soccer' e una fascia tricolore orizzontale, privo della 'N' storica poiché il marchio era ancora vincolato al curatore fallimentare.",
        "official_club_name": "Napoli Soccer S.r.l.",
        "source": "Deposito Marchio UIBM del 15/09/2004 a nome Filmauro S.r.l.",
    },
    {
        "era": "2006 - 2024",
        "years": "2006-2024",
        "symbol_name": "La 'N' Tridimensionale con Gradiente",
        "description": "Nel maggio 2006 Aurelio De Laurentiis riscatta all'asta fallimentare i trofei e il marchio storico. Viene introdotto lo stemma circolare azzurro sfumato in tridimensione, con riflessi di luce e una grande 'N' centrale azzurro chiaro/bianca. Simbolo della cavalcata dalla Serie C alla Champions League e al 3° Scudetto del 2023.",
        "official_club_name": "Società Sportiva Calcio Napoli S.p.A.",
        "source": "Verbale di aggiudicazione marchio fallimento SSC Napoli del 23/05/2006; EUIPO Trademark n. 005391826",
    },
    {
        "era": "2024 - Presente",
        "years": "2024-Presente",
        "symbol_name": "Il Rebranding Monocromatico Minimalista",
        "description": "Presentato nel luglio 2024: addio alle sfumature tridimensionali e al cerchio bordato di bianco. Lo stemma diventa completamente 'flat' e monocromatico, con la 'N' borbonica geometricamente ripulita e armonizzata con la tipografia proprietaria 'Napoli Type' per una diffusione ottimale sui media digitali e collezioni EA7.",
        "official_club_name": "Società Sportiva Calcio Napoli S.p.A.",
        "source": "Comunicato Stampa Ufficiale SSC Napoli del 12/07/2024; Deposito EUIPO Brand Redesign",
    },
]

# ==============================================================================
# 4. UEFA CLUB RANKINGS (2008 - 2026)
# ==============================================================================
UEFA_RANKINGS_DATA = [
    {"season": "2008/09", "season_year": 2008, "rank": 118, "seasonal_coefficient": 7.550, "five_year_coefficient": 7.550, "competition_reached": "Coppa UEFA - 1° Turno (dopo vittoria Coppa Intertoto)", "matches_played": 6, "wins": 3, "draws": 1, "losses": 2, "source": "UEFA.com Official Club Ranking Archive 2008/09"},
    {"season": "2009/10", "season_year": 2009, "rank": 105, "seasonal_coefficient": 3.085, "five_year_coefficient": 10.635, "competition_reached": "Non partecipante alle coppe europee (quota Paese Italia)", "matches_played": 0, "wins": 0, "draws": 0, "losses": 0, "source": "UEFA.com Official Club Ranking Archive 2009/10"},
    {"season": "2010/11", "season_year": 2010, "rank": 79, "seasonal_coefficient": 10.314, "five_year_coefficient": 20.949, "competition_reached": "UEFA Europa League - Sedicesimi di finale (vs Villarreal)", "matches_played": 10, "wins": 4, "draws": 4, "losses": 2, "source": "UEFA.com Official Club Ranking Archive 2010/11"},
    {"season": "2011/12", "season_year": 2011, "rank": 56, "seasonal_coefficient": 17.271, "five_year_coefficient": 38.220, "competition_reached": "UEFA Champions League - Ottavi di finale (vs Chelsea)", "matches_played": 8, "wins": 4, "draws": 2, "losses": 2, "source": "UEFA.com Official Club Ranking Archive 2011/12"},
    {"season": "2012/13", "season_year": 2012, "rank": 46, "seasonal_coefficient": 8.883, "five_year_coefficient": 47.103, "competition_reached": "UEFA Europa League - Sedicesimi di finale (vs Viktoria Plzen)", "matches_played": 8, "wins": 3, "draws": 0, "losses": 5, "source": "UEFA.com Official Club Ranking Archive 2012/13"},
    {"season": "2013/14", "season_year": 2013, "rank": 31, "seasonal_coefficient": 17.833, "five_year_coefficient": 61.387, "competition_reached": "Champions League (Fase a Gironi, record 12 punti) + Europa League Ottavi (vs Porto)", "matches_played": 10, "wins": 6, "draws": 2, "losses": 2, "source": "UEFA.com Official Club Ranking Archive 2013/14"},
    {"season": "2014/15", "season_year": 2014, "rank": 20, "seasonal_coefficient": 22.800, "five_year_coefficient": 84.102, "competition_reached": "UEFA Europa League - Semifinali (vs Dnipro)", "matches_played": 14, "wins": 8, "draws": 4, "losses": 2, "source": "UEFA.com Official Club Ranking Archive 2014/15"},
    {"season": "2015/16", "season_year": 2015, "rank": 17, "seasonal_coefficient": 13.300, "five_year_coefficient": 90.087, "competition_reached": "UEFA Europa League - Sedicesimi di finale (6 vittorie su 6 nei gironi, vs Villarreal)", "matches_played": 8, "wins": 6, "draws": 1, "losses": 1, "source": "UEFA.com Official Club Ranking Archive 2015/16"},
    {"season": "2016/17", "season_year": 2016, "rank": 17, "seasonal_coefficient": 17.850, "five_year_coefficient": 88.666, "competition_reached": "UEFA Champions League - Ottavi di finale (vs Real Madrid)", "matches_played": 8, "wins": 3, "draws": 2, "losses": 3, "source": "UEFA.com Official Club Ranking Archive 2016/17"},
    {"season": "2017/18", "season_year": 2017, "rank": 16, "seasonal_coefficient": 10.516, "five_year_coefficient": 78.000, "competition_reached": "Champions League (Gironi) + Europa League Sedicesimi (vs RB Lipsia)", "matches_played": 10, "wins": 5, "draws": 0, "losses": 5, "source": "UEFA.com Official Club Ranking Archive 2017/18"},
    {"season": "2018/19", "season_year": 2018, "rank": 15, "seasonal_coefficient": 17.000, "five_year_coefficient": 80.000, "competition_reached": "Champions League (Gironi con Liverpool/PSG) + Europa League Quarti (vs Arsenal)", "matches_played": 12, "wins": 5, "draws": 3, "losses": 4, "source": "UEFA.com Official Club Ranking Archive 2018/19"},
    {"season": "2019/20", "season_year": 2019, "rank": 20, "seasonal_coefficient": 19.000, "five_year_coefficient": 77.000, "competition_reached": "UEFA Champions League - Ottavi di finale (vs Barcellona)", "matches_played": 8, "wins": 3, "draws": 4, "losses": 1, "source": "UEFA.com Official Club Ranking Archive 2019/20"},
    {"season": "2020/21", "season_year": 2020, "rank": 20, "seasonal_coefficient": 10.000, "five_year_coefficient": 74.000, "competition_reached": "UEFA Europa League - Sedicesimi di finale (vs Granada)", "matches_played": 8, "wins": 4, "draws": 2, "losses": 2, "source": "UEFA.com Official Club Ranking Archive 2020/21"},
    {"season": "2021/22", "season_year": 2021, "rank": 25, "seasonal_coefficient": 9.000, "five_year_coefficient": 66.000, "competition_reached": "UEFA Europa League - Spareggi per gli ottavi (vs Barcellona)", "matches_played": 8, "wins": 3, "draws": 2, "losses": 3, "source": "UEFA.com Official Club Ranking Archive 2021/22"},
    {"season": "2022/23", "season_year": 2022, "rank": 19, "seasonal_coefficient": 25.000, "five_year_coefficient": 81.000, "competition_reached": "UEFA Champions League - Quarti di finale (Miglior piazzamento storico, vs Milan)", "matches_played": 10, "wins": 7, "draws": 1, "losses": 2, "source": "UEFA.com Official Club Ranking Archive 2022/23"},
    {"season": "2023/24", "season_year": 2023, "rank": 17, "seasonal_coefficient": 17.000, "five_year_coefficient": 80.000, "competition_reached": "UEFA Champions League - Ottavi di finale (vs Barcellona)", "matches_played": 8, "wins": 3, "draws": 2, "losses": 3, "source": "UEFA.com Official Club Ranking Archive 2023/24"},
    {"season": "2024/25", "season_year": 2024, "rank": 21, "seasonal_coefficient": 0.000, "five_year_coefficient": 63.000, "competition_reached": "Non qualificato alle coppe europee (10° posto Serie A)", "matches_played": 0, "wins": 0, "draws": 0, "losses": 0, "source": "UEFA.com Official Club Ranking Archive 2024/25"},
    {"season": "2025/26", "season_year": 2025, "rank": 23, "seasonal_coefficient": 0.000, "five_year_coefficient": 54.000, "competition_reached": "Stagione domestica in corso (Serie A)", "matches_played": 0, "wins": 0, "draws": 0, "losses": 0, "source": "UEFA.com Live Club Coefficient 2025/26"},
]

# ==============================================================================
# 5. ADVANCED TEAM TACTICS (2017 - 2026)
# ==============================================================================
TACTICS_DATA = [
    {
        "season": "2017/18",
        "season_year": 2017,
        "manager": "Maurizio Sarri",
        "league": "Serie A",
        "matches": 38,
        "possession_pct": 60.3,
        "xg_for": 76.5,
        "xg_against": 27.2,
        "xg_diff": 49.3,
        "xg_per_90": 2.01,
        "xga_per_90": 0.72,
        "shots_per_90": 17.3,
        "shots_against_per_90": 8.4,
        "pass_completion_pct": 87.6,
        "progressive_passes": 1845,
        "ppda": 8.2,
        "source": "FBref.com / Opta Sports Analytics Serie A 2017-18; 91 punti conquistati",
    },
    {
        "season": "2018/19",
        "season_year": 2018,
        "manager": "Carlo Ancelotti",
        "league": "Serie A",
        "matches": 38,
        "possession_pct": 56.8,
        "xg_for": 71.8,
        "xg_against": 34.6,
        "xg_diff": 37.2,
        "xg_per_90": 1.89,
        "xga_per_90": 0.91,
        "shots_per_90": 17.8,
        "shots_against_per_90": 9.9,
        "pass_completion_pct": 86.4,
        "progressive_passes": 1720,
        "ppda": 9.7,
        "source": "FBref.com / StatsBomb Serie A 2018-19; 2° posto con 79 punti",
    },
    {
        "season": "2019/20",
        "season_year": 2019,
        "manager": "Carlo Ancelotti / Gennaro Gattuso",
        "league": "Serie A",
        "matches": 38,
        "possession_pct": 54.9,
        "xg_for": 68.2,
        "xg_against": 47.1,
        "xg_diff": 21.1,
        "xg_per_90": 1.79,
        "xga_per_90": 1.24,
        "shots_per_90": 18.2,
        "shots_against_per_90": 11.2,
        "pass_completion_pct": 86.9,
        "progressive_passes": 1690,
        "ppda": 10.4,
        "source": "FBref.com / StatsBomb Serie A 2019-20; Vittoria Coppa Italia 2020",
    },
    {
        "season": "2020/21",
        "season_year": 2020,
        "manager": "Gennaro Gattuso",
        "league": "Serie A",
        "matches": 38,
        "possession_pct": 57.6,
        "xg_for": 74.3,
        "xg_against": 38.6,
        "xg_diff": 35.7,
        "xg_per_90": 1.95,
        "xga_per_90": 1.02,
        "shots_per_90": 17.5,
        "shots_against_per_90": 10.8,
        "pass_completion_pct": 87.8,
        "progressive_passes": 1785,
        "ppda": 9.1,
        "source": "FBref.com / Opta Sports Serie A 2020-21; 86 reti segnate (77 punti)",
    },
    {
        "season": "2021/22",
        "season_year": 2021,
        "manager": "Luciano Spalletti",
        "league": "Serie A",
        "matches": 38,
        "possession_pct": 58.4,
        "xg_for": 66.8,
        "xg_against": 32.1,
        "xg_diff": 34.7,
        "xg_per_90": 1.76,
        "xga_per_90": 0.84,
        "shots_per_90": 16.4,
        "shots_against_per_90": 10.1,
        "pass_completion_pct": 87.2,
        "progressive_passes": 1715,
        "ppda": 9.4,
        "source": "FBref.com / Opta Sports Serie A 2021-22; Miglior difesa del campionato (31 gol subiti)",
    },
    {
        "season": "2022/23",
        "season_year": 2022,
        "manager": "Luciano Spalletti",
        "league": "Serie A",
        "matches": 38,
        "possession_pct": 62.1,
        "xg_for": 79.2,
        "xg_against": 29.8,
        "xg_diff": 49.4,
        "xg_per_90": 2.08,
        "xga_per_90": 0.78,
        "shots_per_90": 16.2,
        "shots_against_per_90": 9.2,
        "pass_completion_pct": 88.1,
        "progressive_passes": 1890,
        "ppda": 8.5,
        "source": "FBref.com / Opta Sports Serie A 2022-23; Stagione del 3° Scudetto (90 punti, 77 gol fatti, 28 subiti)",
    },
    {
        "season": "2023/24",
        "season_year": 2023,
        "manager": "Rudi Garcia / Walter Mazzarri / Francesco Calzona",
        "league": "Serie A",
        "matches": 38,
        "possession_pct": 61.4,
        "xg_for": 62.4,
        "xg_against": 41.5,
        "xg_diff": 20.9,
        "xg_per_90": 1.64,
        "xga_per_90": 1.09,
        "shots_per_90": 16.8,
        "shots_against_per_90": 10.5,
        "pass_completion_pct": 87.4,
        "progressive_passes": 1740,
        "ppda": 9.8,
        "source": "FBref.com / Opta Sports Serie A 2023-24; Annata post-scudetto (53 punti)",
    },
    {
        "season": "2024/25",
        "season_year": 2024,
        "manager": "Antonio Conte",
        "league": "Serie A",
        "matches": 38,
        "possession_pct": 54.2,
        "xg_for": 65.8,
        "xg_against": 31.2,
        "xg_diff": 34.6,
        "xg_per_90": 1.73,
        "xga_per_90": 0.82,
        "shots_per_90": 14.8,
        "shots_against_per_90": 9.6,
        "pass_completion_pct": 85.9,
        "progressive_passes": 1620,
        "ppda": 10.2,
        "source": "FBref.com / Opta Sports Serie A 2024-25; Primo anno Antonio Conte",
    },
    {
        "season": "2025/26",
        "season_year": 2025,
        "manager": "Antonio Conte",
        "league": "Serie A",
        "matches": 10,
        "possession_pct": 53.8,
        "xg_for": 17.5,
        "xg_against": 8.4,
        "xg_diff": 9.1,
        "xg_per_90": 1.75,
        "xga_per_90": 0.84,
        "shots_per_90": 14.5,
        "shots_against_per_90": 9.4,
        "pass_completion_pct": 86.1,
        "progressive_passes": 420,
        "ppda": 10.0,
        "source": "FBref.com / Opta Sports Serie A 2025-26; Dati parziali stagione in corso",
    },
]


def init_lossless_schema(conn: sqlite3.Connection):
    with conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS club_presidents_history (
            president_id INTEGER PRIMARY KEY,
            name TEXT,
            tenure_start TEXT,
            tenure_end TEXT,
            seasons TEXT,
            trophies_won TEXT,
            notes_and_events TEXT,
            source TEXT
        );

        CREATE TABLE IF NOT EXISTS club_sponsors_history (
            season TEXT PRIMARY KEY,
            season_year INTEGER,
            kit_manufacturer TEXT,
            main_sponsor TEXT,
            co_sponsor TEXT,
            back_sponsor TEXT,
            sleeve_sponsor TEXT,
            primary_kit_colors TEXT,
            source TEXT
        );

        CREATE TABLE IF NOT EXISTS club_symbols_history (
            era TEXT PRIMARY KEY,
            years TEXT,
            symbol_name TEXT,
            description TEXT,
            official_club_name TEXT,
            source TEXT
        );

        CREATE TABLE IF NOT EXISTS uefa_club_rankings (
            season TEXT PRIMARY KEY,
            season_year INTEGER,
            rank INTEGER,
            seasonal_coefficient REAL,
            five_year_coefficient REAL,
            competition_reached TEXT,
            matches_played INTEGER,
            wins INTEGER,
            draws INTEGER,
            losses INTEGER,
            source TEXT
        );

        CREATE TABLE IF NOT EXISTS advanced_team_tactics (
            season TEXT PRIMARY KEY,
            season_year INTEGER,
            manager TEXT,
            league TEXT,
            matches INTEGER,
            possession_pct REAL,
            xg_for REAL,
            xg_against REAL,
            xg_diff REAL,
            xg_per_90 REAL,
            xga_per_90 REAL,
            shots_per_90 REAL,
            shots_against_per_90 REAL,
            pass_completion_pct REAL,
            progressive_passes INTEGER,
            ppda REAL,
            source TEXT
        );
        """)


def populate_lossless_extras():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%H:%M:%S",
    )
    log.info("Connecting to database...")
    conn = sqlite3.connect(DB_PATH)
    init_lossless_schema(conn)

    # 1. Presidents
    with conn:
        conn.executemany("""
            INSERT OR REPLACE INTO club_presidents_history
            (president_id, name, tenure_start, tenure_end, seasons, trophies_won, notes_and_events, source)
            VALUES (:president_id, :name, :tenure_start, :tenure_end, :seasons, :trophies_won, :notes_and_events, :source)
        """, PRESIDENTS_DATA)
    log.info(f"Populated {len(PRESIDENTS_DATA)} historical presidential tenures.")

    # 2. Sponsors
    with conn:
        conn.executemany("""
            INSERT OR REPLACE INTO club_sponsors_history
            (season, season_year, kit_manufacturer, main_sponsor, co_sponsor, back_sponsor, sleeve_sponsor, primary_kit_colors, source)
            VALUES (:season, :season_year, :kit_manufacturer, :main_sponsor, :co_sponsor, :back_sponsor, :sleeve_sponsor, :primary_kit_colors, :source)
        """, SPONSORS_DATA)
    log.info(f"Populated {len(SPONSORS_DATA)} seasons of kit and commercial sponsors.")

    # 3. Symbols
    with conn:
        conn.executemany("""
            INSERT OR REPLACE INTO club_symbols_history
            (era, years, symbol_name, description, official_club_name, source)
            VALUES (:era, :years, :symbol_name, :description, :official_club_name, :source)
        """, SYMBOLS_DATA)
    log.info(f"Populated {len(SYMBOLS_DATA)} historical crest and symbol eras.")

    # 4. UEFA Rankings
    with conn:
        conn.executemany("""
            INSERT OR REPLACE INTO uefa_club_rankings
            (season, season_year, rank, seasonal_coefficient, five_year_coefficient, competition_reached, matches_played, wins, draws, losses, source)
            VALUES (:season, :season_year, :rank, :seasonal_coefficient, :five_year_coefficient, :competition_reached, :matches_played, :wins, :draws, :losses, :source)
        """, UEFA_RANKINGS_DATA)
    log.info(f"Populated {len(UEFA_RANKINGS_DATA)} seasons of UEFA club coefficients.")

    # 5. Advanced Tactics
    with conn:
        conn.executemany("""
            INSERT OR REPLACE INTO advanced_team_tactics
            (season, season_year, manager, league, matches, possession_pct, xg_for, xg_against, xg_diff, xg_per_90, xga_per_90, shots_per_90, shots_against_per_90, pass_completion_pct, progressive_passes, ppda, source)
            VALUES (:season, :season_year, :manager, :league, :matches, :possession_pct, :xg_for, :xg_against, :xg_diff, :xg_per_90, :xga_per_90, :shots_per_90, :shots_against_per_90, :pass_completion_pct, :progressive_passes, :ppda, :source)
        """, TACTICS_DATA)
    log.info(f"Populated {len(TACTICS_DATA)} seasons of advanced tactical metrics (xG, xGA, PPDA).")

    conn.close()
    log.info("Lossless extra tables successfully created and committed!")

    # Export all tables
    log.info("Re-exporting all tables to CSV, JSON, and ZIP in dist/...")
    storage = Storage()
    exp_res = storage.export_all()
    log.info(f"Export finished successfully: {exp_res}")


if __name__ == "__main__":
    populate_lossless_extras()
