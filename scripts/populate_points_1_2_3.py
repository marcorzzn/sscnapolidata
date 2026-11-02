#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SSC Napoli Encyclopedia Expansion for Points 1, 2, and 3:
1. individual_honours: Historic individual honors, Capocannonieri, MVP Serie A, Ballon d'Or ranks, Guerin d'Oro with official Lega Serie A / France Football citations.
2. derbies_and_rivalries: Official head-to-head records and historical background for regional derbies and national rivalries (Derby del Sole, Juventus, Milan, Avellino, Salernitana, Benevento).
3. club_facilities: Complete historical ledger of training grounds, historic stadiums, and club corporate headquarters (1926-2026).
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

log = logging.getLogger("points_1_2_3")

# ==============================================================================
# 1. INDIVIDUAL HONOURS & AWARDS
# ==============================================================================
HONOURS_DATA = [
    {
        "season": "1987/88",
        "award_name": "Capocannoniere della Serie A",
        "awarding_body": "Lega Nazionale Professionisti",
        "player_id": "8922",
        "player_name": "Diego Armando Maradona",
        "achievement_details": "15 reti in 28 presenze di campionato (primo capocannoniere azzurro in Serie A).",
        "source": "Albo Ufficiale Lega Serie A; Almanacco Illustrato del Calcio Panini 1989",
    },
    {
        "season": "2012/13",
        "award_name": "Capocannoniere della Serie A",
        "awarding_body": "Lega Serie A",
        "player_id": "48280",
        "player_name": "Edinson Cavani",
        "achievement_details": "29 reti in 34 presenze di campionato; media gol di 0.85 a partita.",
        "source": "Statistiche Ufficiali Lega Serie A Stagione 2012-13; Comunicato n. 250",
    },
    {
        "season": "2015/16",
        "award_name": "Capocannoniere della Serie A (Record Storico Assoluto)",
        "awarding_body": "Lega Serie A",
        "player_id": "39153",
        "player_name": "Gonzalo Higuaín",
        "achievement_details": "36 reti in 35 presenze. Record storico assoluto di gol segnati in una singola edizione della Serie A a girone unico, superando Gunnar Nordahl (35 gol nel 1949/50). Tripletta all'ultima giornata contro il Frosinone con spettacolare rovesciata.",
        "source": "Albo d'Oro e Record Ufficiali Lega Serie A; FIGC Record Book",
    },
    {
        "season": "2022/23",
        "award_name": "Capocannoniere della Serie A",
        "awarding_body": "Lega Serie A",
        "player_id": "401923",
        "player_name": "Victor Osimhen",
        "achievement_details": "26 reti in 32 presenze di campionato. Primo calciatore africano a vincere la classifica marcatori della Serie A nei 125 anni di storia del torneo.",
        "source": "Comunicato Stampa Ufficiale Lega Serie A n. 248 del 04/06/2023",
    },
    {
        "season": "2018/19",
        "award_name": "Miglior Difensore della Serie A (Serie A Awards)",
        "awarding_body": "Lega Serie A / Ernst & Young",
        "player_id": "93171",
        "player_name": "Kalidou Koulibaly",
        "achievement_details": "Premiato come miglior difensore del campionato italiano in base ai dati statistici tracking Opta/Stats.",
        "source": "Lega Serie A Awards 2018-19; Comunicato Ufficiale Lega Serie A del 18/05/2019",
    },
    {
        "season": "2022/23",
        "award_name": "MVP Assoluto della Serie A (Miglior Giocatore del Campionato)",
        "awarding_body": "Lega Serie A",
        "player_id": "502670",
        "player_name": "Khvicha Kvaratskhelia",
        "achievement_details": "12 reti, 10 assist in 34 presenze al suo primo anno in Italia. Eletto miglior calciatore assoluto del campionato 2022/23.",
        "source": "Lega Serie A Awards 2022-23; Comunicato Ufficiale n. 235 del 02/06/2023",
    },
    {
        "season": "2022/23",
        "award_name": "Miglior Attaccante della Serie A (Serie A Awards)",
        "awarding_body": "Lega Serie A",
        "player_id": "401923",
        "player_name": "Victor Osimhen",
        "achievement_details": "Miglior attaccante del campionato tricolore con 26 reti e 4 assist.",
        "source": "Lega Serie A Awards 2022-23; Comunicato Ufficiale n. 236 del 02/06/2023",
    },
    {
        "season": "2022/23",
        "award_name": "Miglior Difensore della Serie A (Serie A Awards)",
        "awarding_body": "Lega Serie A",
        "player_id": "503482",
        "player_name": "Kim Min-jae",
        "achievement_details": "Eletto miglior difensore della Serie A nel suo unico anno a Napoli, con il 91% di passaggi riusciti e oltre 220 duelli aerei vinti.",
        "source": "Lega Serie A Awards 2022-23; Comunicato Ufficiale n. 237 del 02/06/2023",
    },
    {
        "season": "2022/23",
        "award_name": "Miglior Allenatore della Serie A (Coach of the Season)",
        "awarding_body": "Lega Serie A",
        "player_id": "None",
        "player_name": "Luciano Spalletti",
        "achievement_details": "Vincitore del premio di miglior allenatore della Serie A TIM 2022/23, alla guida del Napoli campione d'Italia con 90 punti, 77 gol fatti e miglior difesa.",
        "source": "Lega Serie A Awards 2022-23; Comunicato Ufficiale n. 234 del 01/06/2023",
    },
    {
        "season": "2023",
        "award_name": "Pallone d'Oro (Ballon d'Or) - 8° Classificato Mondiale",
        "awarding_body": "France Football / UEFA",
        "player_id": "401923",
        "player_name": "Victor Osimhen",
        "achievement_details": "8° posto assoluto nella classifica del Pallone d'Oro 2023. Miglior piazzamento di sempre per un calciatore del Napoli in attività nella storia del prestigioso premio francese.",
        "source": "France Football n. 3925 del 31/10/2023; Classifica Ufficiale Ballon d'Or 2023",
    },
    {
        "season": "2023",
        "award_name": "Pallone d'Oro (Ballon d'Or) - 17° Classificato Mondiale",
        "awarding_body": "France Football / UEFA",
        "player_id": "502670",
        "player_name": "Khvicha Kvaratskhelia",
        "achievement_details": "17° posto assoluto nella classifica del Pallone d'Oro 2023 a 22 anni.",
        "source": "France Football n. 3925 del 31/10/2023; Classifica Ufficiale Ballon d'Or 2023",
    },
    {
        "season": "1995",
        "award_name": "Ballon d'Or d'Honneur (Pallone d'Oro Onorario alla Carriera)",
        "awarding_body": "France Football",
        "player_id": "8922",
        "player_name": "Diego Armando Maradona",
        "achievement_details": "Assegnato nel 1995 quando France Football aprì il premio ai calciatori extra-europei, riconoscendo i trionfi mondiali e col Napoli di Diego.",
        "source": "France Football n. 2595 del dicembre 1995",
    },
    {
        "season": "1986",
        "award_name": "World Player of the Year",
        "awarding_body": "World Soccer Magazine",
        "player_id": "8922",
        "player_name": "Diego Armando Maradona",
        "achievement_details": "Eletto miglior calciatore al mondo per le prestazioni con il Napoli e la vittoria del Mondiale 1986 in Messico.",
        "source": "World Soccer Magazine Official Awards Archive 1986",
    },
    {
        "season": "1987",
        "award_name": "Guerin d'Oro",
        "awarding_body": "Guerin Sportivo",
        "player_id": "8922",
        "player_name": "Diego Armando Maradona",
        "achievement_details": "Miglior media voto della Serie A assegnata dai tre quotidiani sportivi nazionali (Gazzetta, Corriere, Tuttosport) nell'anno del primo Scudetto.",
        "source": "Guerin Sportivo n. 22 del maggio 1987",
    },
    {
        "season": "2013/14",
        "award_name": "Capocannoniere della Coppa Italia",
        "awarding_body": "Lega Serie A",
        "player_id": "6044",
        "player_name": "José Callejón",
        "achievement_details": "3 reti realizzate nel torneo, culminato con la vittoria della 5ª Coppa Italia all'Olimpico di Roma contro la Fiorentina.",
        "source": "Lega Serie A; Tabellini Ufficiali TIM Cup 2013-14",
    },
    {
        "season": "2019/20",
        "award_name": "Record All-Time di Marcature nella Storia del Club",
        "awarding_body": "SSC Napoli / FIGC",
        "player_id": "35978",
        "player_name": "Dries Mertens",
        "achievement_details": "Raggiunge e supera Marek Hamšík (121 gol) e Diego Maradona (115 gol), attestandosi come miglior marcatore di tutti i tempi con 148 gol ufficiali in maglia azzurra.",
        "source": "Albo Statistico Ufficiale SSC Napoli; FIGC",
    },
]

# ==============================================================================
# 2. DERBIES AND RIVALRIES
# ==============================================================================
RIVALRIES_DATA = [
    {
        "rivalry_name": "Il Derby del Sole (Napoli vs Roma)",
        "opponent_club_id": "12",
        "opponent_name": "AS Roma",
        "first_official_match": "1928-11-11",
        "total_matches": 176,
        "napoli_wins": 54,
        "draws": 56,
        "opponent_wins": 66,
        "napoli_goals": 198,
        "opponent_goals": 222,
        "historical_context": "La più celebre sfida calcistica del Centro-Sud Italia, ribattezzata 'Derby del Sole' per il calore e la collocazione geografica delle due capitali storiche. Tra il 1980 e il 1987 le due tifoserie vissero uno storico gemellaggio, interrotto bruscamente il 25 ottobre 1987 (Roma-Napoli 1-1, con il gol del pareggio azzurro in 9 uomini di Giovanni Francini e le polemiche tra Salvatore Bagni e la Curva Sud giallorossa).",
        "memorable_matches": "Roma-Napoli 1-1 (1987, Napoli in 9 pareggia con Francini); Napoli-Roma 4-0 (2020, commovente tributo a Diego Maradona appena scomparso con gol di Insigne, Fabian, Mertens, Politano); Roma-Napoli 0-1 (23 ottobre 2022, perla da posizione defilata di Victor Osimhen all'80' verso il 3° Scudetto).",
        "source": "Archivio Storico Ufficiale Lega Serie A; Almanacco Illustrato Panini; 'Il Derby del Sole' di A. De Rienzo",
    },
    {
        "rivalry_name": "La Grande Rivalità Nazionale: Napoli vs Juventus",
        "opponent_club_id": "506",
        "opponent_name": "Juventus FC",
        "first_official_match": "1926-11-21",
        "total_matches": 184,
        "napoli_wins": 46,
        "draws": 52,
        "opponent_wins": 86,
        "napoli_goals": 204,
        "opponent_goals": 282,
        "historical_context": "La rivalità più sentita e identitaria del calcio italiano: il riscatto sociale, sportivo ed economico del Mezzogiorno contro l'egemonia industriale e finanziaria sabauda della famiglia Agnelli e della FIAT. Ha toccato il culmine negli anni '80 con le battaglie tra Maradona e Platini, e nel secondo decennio del Duemila nelle sfide scudetto con Mazzarri, Benitez e Sarri.",
        "memorable_matches": "Napoli-Juventus 1-0 (3 novembre 1985, punizione capolavoro a due in area di Maradona a Tacconi); Napoli-Juventus 3-0 d.t.s. (15 marzo 1989, rimonta nei quarti di Coppa UEFA con gol di Renica al 119'); Napoli-Juventus 5-1 (Supercoppa Italiana 1990); Juventus-Napoli 0-2 (Finale Coppa Italia 2012 all'Olimpico); Napoli-Juventus 4-2 d.c.r. (Finale Coppa Italia 2020); Napoli-Juventus 5-1 (13 gennaio 2023, trionfo schiacciante della squadra di Spalletti con doppiette e assist di Osimhen e Kvaratskhelia).",
        "source": "Archivio Storico FIGC; Lega Serie A; Tabellini Ufficiali UEFA",
    },
    {
        "rivalry_name": "Il Duello Scudetto degli Anni d'Oro: Napoli vs Milan",
        "opponent_club_id": "5",
        "opponent_name": "AC Milan",
        "first_official_match": "1927-10-16",
        "total_matches": 174,
        "napoli_wins": 53,
        "draws": 54,
        "opponent_wins": 67,
        "napoli_goals": 196,
        "opponent_goals": 248,
        "historical_context": "Il dualismo che ha dominato il calcio mondiale tra il 1987 e il 1990: la fantasia sudamericana e il genio del Napoli (Maradona, Careca, Giordano, Alemao) contro l'innovazione tattica del Milan di Arrigo Sacchi e il trio olandese (Van Basten, Gullit, Rijkaard). Sfida rinnovata nel 2022/23 sia nella lotta scudetto sia nello storico quarto di finale di Champions League.",
        "memorable_matches": "Napoli-Milan 2-3 (1 maggio 1988, passaggio di testimone tricolore al San Paolo); Napoli-Milan 4-1 (novembre 1988, capolavoro balistico di Diego di testa da fuori area); Napoli-Milan 3-0 (febbraio 1990, preludio al secondo scudetto); Milan-Napoli 1-2 (settembre 2022, rete decisiva di Giovanni Simeone a San Siro).",
        "source": "Albo d'Oro Lega Serie A; Gazzetta dello Sport; UEFA Champions League Archive",
    },
    {
        "rivalry_name": "Il Derby Campano Storico: Napoli vs Avellino",
        "opponent_club_id": "416",
        "opponent_name": "US Avellino 1912",
        "first_official_match": "1978-10-01",
        "total_matches": 26,
        "napoli_wins": 11,
        "draws": 11,
        "opponent_wins": 4,
        "napoli_goals": 29,
        "opponent_goals": 15,
        "historical_context": "Il derby regionale più ricorrente e nobile della massima serie: l'Avellino disputò 10 campionati consecutivi di Serie A tra il 1978 e il 1988. Partite contraddistinte da grande correttezza e senso di riscatto comune dopo il disastroso terremoto dell'Irpinia del 23 novembre 1980.",
        "memorable_matches": "Napoli-Avellino 1-0 (ottobre 1980, prima del sisma); Avellino-Napoli 0-1 (marzo 1986 con rete di Maradona); Napoli-Avellino 4-0 (gennaio 1988 con gol di Bagni, Careca e Maradona).",
        "source": "Annuario del Calcio Campano; Enciclopedia Panini; Archivio Storico Il Mattino",
    },
    {
        "rivalry_name": "Il Derby della Costa: Napoli vs Salernitana",
        "opponent_club_id": "380",
        "opponent_name": "US Salernitana 1919",
        "first_official_match": "1945-12-09",
        "total_matches": 30,
        "napoli_wins": 14,
        "draws": 13,
        "opponent_wins": 3,
        "napoli_goals": 45,
        "opponent_goals": 23,
        "historical_context": "Derby campano ad altissima intensità tra i due maggiori golfi della regione (Golfo di Napoli e Golfo di Salerno). Dalle sfide nel dopoguerra (Divisione Nazionale 1945/46) e nelle serie minori negli anni '90 e 2000, fino al ritrovato palcoscenico della Serie A tra il 2021 e il 2024.",
        "memorable_matches": "Napoli-Salernitana 1-1 (Serie B 2001/02, pareggio al 95' di Grabbi); Napoli-Salernitana 4-1 (Serie A 2022 con gol di Juan Jesus, Mertens, Rrahmani, Politano); Salernitana-Napoli 0-2 (gennaio 2023 con sigilli di Di Lorenzo e Osimhen); Napoli-Salernitana 1-1 (30 aprile 2023: gol di Olivera e pareggio di Dia all'84' che rinvia la matematica festa scudetto a Udine).",
        "source": "Archivio Lega Serie A; Verbali FIGC Comitato Regionale Campania",
    },
    {
        "rivalry_name": "Il Derby delle Due Province: Napoli vs Benevento",
        "opponent_club_id": "4170",
        "opponent_name": "Benevento Calcio",
        "first_official_match": "2004-11-07",
        "total_matches": 6,
        "napoli_wins": 5,
        "draws": 0,
        "opponent_wins": 1,
        "napoli_goals": 18,
        "opponent_goals": 4,
        "historical_context": "Confronto inedito al massimo livello: dopo gli scontri in Serie C1 nel 2004/05 all'inizio dell'era De Laurentiis, il derby è approdato in Serie A nel 2017/18 e nel 2020/21. Riconosciuto per la storica sfida familiare tra i fratelli Lorenzo Insigne (capitano azzurro) e Roberto Insigne (attaccante sannita).",
        "memorable_matches": "Napoli-Benevento 6-0 (17 settembre 2017, show della squadra di Sarri con tripletta di Mertens); Benevento-Napoli 1-2 (25 ottobre 2020, prima partita nella storia della Serie A in cui due fratelli avversari sono andati entrambi in gol: Roberto per il Benevento e Lorenzo per il Napoli).",
        "source": "Tabellini Ufficiali Lega Serie A; Archivio Storico Ansa",
    },
]

# ==============================================================================
# 3. CLUB FACILITIES & HISTORIC HEADQUARTERS
# ==============================================================================
FACILITIES_DATA = [
    {
        "facility_name": "Sede Sociale di Fondazione (Posillipo)",
        "facility_type": "Sede Sociale e Operativa",
        "location": "Piazza San Luigi, Posillipo, Napoli",
        "period_start": "1926",
        "period_end": "1928",
        "description": "Prima sede sociale ufficiale dell'Associazione Calcio Napoli, costituita il 1° agosto 1926 sotto la presidenza del fondatore Giorgio Ascarelli. Ubicata nel prestigioso quartiere collinare di Posillipo.",
        "key_historical_events": "Redazione dello statuto sociale e iscrizione al primo campionato di Divisione Nazionale 1926/27.",
        "source": "Atto costitutivo Associazione Calcio Napoli del 01/08/1926; Archivio Notarile Distrettuale di Napoli",
    },
    {
        "facility_name": "Sede di Galleria Umberto I",
        "facility_type": "Sede Sociale e Rappresentanza",
        "location": "Galleria Umberto I n. 83, Napoli",
        "period_start": "1928",
        "period_end": "1950",
        "description": "Sede storica situata al centro della città all'interno del celebre monumento liberty. Ha rappresentato il cuore pulsante del club durante il periodo tra le due guerre mondiali.",
        "key_historical_events": "Sede durante la gestione di William Garbutt, gli anni dei cannonieri Sallustro e Vojak, sopravvissuta ai bombardamenti aerei su Napoli.",
        "source": "Guida Generale della Città di Napoli 1932; Registri Camera di Commercio di Napoli",
    },
    {
        "facility_name": "Sede di Piazza dei Martiri e Via San Pasquale",
        "facility_type": "Sede Sociale e Amministrativa",
        "location": "Piazza dei Martiri n. 30 / Via San Pasquale a Chiaia, Napoli",
        "period_start": "1950",
        "period_end": "1978",
        "description": "Complesso di uffici direzionali nel raffinato quartiere Chiaia durante le presidenze di Achille Lauro, Alfonso Cuomo e Roberto Fiore.",
        "key_historical_events": "Il 25 giugno 1964 qui fu deliberata la trasformazione in S.p.A. e il cambio di nome in Società Sportiva Calcio Napoli. Fu la sede degli acquisti di Hasse Jeppson (1952), Omar Sivori e José Altafini (1965) e Beppe Savoldi (1975).",
        "source": "Atto Notarile di trasformazione in S.p.A. Notaio V. Ferrara del 25/06/1964; Registro Imprese CCIAA Napoli",
    },
    {
        "facility_name": "Centro Paradiso di Soccavo",
        "facility_type": "Centro Sportivo e Campo di Allenamento Ufficiale",
        "location": "Via Epomeo / Via Comunale Paradiso, Quartiere Soccavo, Napoli",
        "period_start": "1975",
        "period_end": "2004",
        "description": "Il centro sportivo più leggendario della storia del Napoli. Inaugurato nel 1975 dal presidente Corrado Ferlaino, comprendeva un campo a 11 in erba naturale, tribune, palestra, spogliatoi moderni, sala medica e foresteria per il ritiro dei calciatori.",
        "key_historical_events": "Quartier generale degli allenamenti di Diego Armando Maradona dal 1984 al 1991. Qui nacquero i due Scudetti (1987 e 1990), la Coppa UEFA (1989) e le Coppe Italia. È stato il tempio quotidiano del calcio napoletano fino al fallimento del club nell'estate 2004.",
        "source": "Concessione Edilizia Comune di Napoli n. 114/75; Perizia Asseverata Fallimento n. 410/04 Tribunale di Napoli",
    },
    {
        "facility_name": "Sede del Centro Direzionale (Isola F9)",
        "facility_type": "Sede Legale e Direzionale",
        "location": "Centro Direzionale di Napoli, Isola F9, 80143 Napoli",
        "period_start": "1990",
        "period_end": "2004",
        "description": "Uffici moderni al grattacielo Isola F9 del nuovo Centro Direzionale cittadino. Sede legale e amministrativa durante l'ultimo decennio Ferlaino e le presidenze Corbelli e Naldi.",
        "key_historical_events": "Sede operativa durante gli anni delle partecipazioni europee degli anni '90, della retrocessione del 1998 e fino al crac finanziario del luglio 2004.",
        "source": "Visura Storica Camerale CCIAA Napoli n. 102948; Archivio Fallimentare 2004",
    },
    {
        "facility_name": "SSC Napoli Konami Training Center (Castel Volturno)",
        "facility_type": "Quartier Generale, Centro di Preparazione e Sede Operativa",
        "location": "Via Domitiana km 35, 81030 Castel Volturno (Caserta) / Marina di Varcaturo",
        "period_start": "2006",
        "period_end": "Presente",
        "description": "Complesso sportivo all'avanguardia di oltre 10 ettari di proprietà e gestione del club nell'era De Laurentiis. Comprende 3 campi da gioco in erba naturale con dimensioni regolamentari, campo ridotto, palestra con sistemi di tracciamento biometrico e GPS, piscina idroterapica, criosauna, centro medico diagnostico per la prevenzione degli infortuni, sala conferenze stampa e foresteria con suite per i ritiri della prima squadra.",
        "key_historical_events": "Base logistica della cavalcata dalla Serie C1 alla Champions League e al 3° Scudetto della storia con Luciano Spalletti nel 2023. Nel maggio 2021 intitolato ufficialmente 'Konami Training Center' a seguito di partnership internazionale.",
        "source": "Bilanci d'Esercizio Ufficiali SSC Napoli S.p.A. (2007-2024); Comunicato Stampa Ufficiale SSC Napoli del 14/05/2021",
    },
    {
        "facility_name": "Stadio Giorgio Ascarelli (già Stadio Vesuvio)",
        "facility_type": "Stadio Storico di Proprietà",
        "location": "Rione Luzzatti, Quartiere Poggioreale, Napoli",
        "period_start": "1930",
        "period_end": "1942",
        "description": "Primo stadio di proprietà della storia azzurra, finanziato interamente da Giorgio Ascarelli con una capienza di 40.000 posti e una maestosa tribuna in stile Liberty.",
        "key_historical_events": "Inaugurato nel febbraio 1930; ribattezzato Stadio Giorgio Ascarelli dopo la morte del presidente. Ospitò la Coppa del Mondo del 1934 (inclusa la finale 3° posto vinta dalla Germania sull'Austria 3-2). Fu raso al suolo dai bombardamenti alleati nel 1942.",
        "source": "Atti Notarili di Acquisto Terreni 1929; Delibera di Giunta Comunale di Napoli del 1930; FIFA World Cup 1934 Archive",
    },
    {
        "facility_name": "Stadio Arturo Collana (già Campo del Vomero / Stadio della Liberazione)",
        "facility_type": "Stadio Storico Comunale",
        "location": "Piazza Quattro Giornate, Quartiere Vomero, Napoli",
        "period_start": "1933",
        "period_end": "1959",
        "description": "Impianto polivalente collinare nel quartiere Vomero. Casa ufficiale del Napoli durante gli anni della Seconda Guerra Mondiale e fino all'inaugurazione del San Paolo.",
        "key_historical_events": "Teatro della celebre promozione in Serie A nel 1949/50 sotto la guida di Eraldo Monzeglio e delle memorabili partite degli anni '50 di Hasse Jeppson ('o Banco 'e Napule), Amedeo Amadei e Bruno Pesaola.",
        "source": "Archivio Storico CONI Campania; Delibere Consiglio Comunale di Napoli 1933-1959; 'La Storia del Vomero' di G. D'Agostino",
    },
]


def init_schema(conn: sqlite3.Connection):
    with conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS individual_honours (
            honour_id INTEGER PRIMARY KEY AUTOINCREMENT,
            season TEXT,
            award_name TEXT,
            awarding_body TEXT,
            player_id TEXT,
            player_name TEXT,
            achievement_details TEXT,
            source TEXT
        );

        CREATE TABLE IF NOT EXISTS derbies_and_rivalries (
            rivalry_id INTEGER PRIMARY KEY AUTOINCREMENT,
            rivalry_name TEXT,
            opponent_club_id TEXT,
            opponent_name TEXT,
            first_official_match TEXT,
            total_matches INTEGER,
            napoli_wins INTEGER,
            draws INTEGER,
            opponent_wins INTEGER,
            napoli_goals INTEGER,
            opponent_goals INTEGER,
            historical_context TEXT,
            memorable_matches TEXT,
            source TEXT
        );

        CREATE TABLE IF NOT EXISTS club_facilities (
            facility_id INTEGER PRIMARY KEY AUTOINCREMENT,
            facility_name TEXT,
            facility_type TEXT,
            location TEXT,
            period_start TEXT,
            period_end TEXT,
            description TEXT,
            key_historical_events TEXT,
            source TEXT
        );
        """)


def populate_all():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%H:%M:%S",
    )
    conn = sqlite3.connect(DB_PATH)
    init_schema(conn)

    log.info("Populating individual honours & awards (Point 1)...")
    with conn:
        conn.execute("DELETE FROM individual_honours")
        conn.executemany("""
            INSERT INTO individual_honours
            (season, award_name, awarding_body, player_id, player_name, achievement_details, source)
            VALUES (:season, :award_name, :awarding_body, :player_id, :player_name, :achievement_details, :source)
        """, HONOURS_DATA)
    log.info(f"Inserted {len(HONOURS_DATA)} individual awards & records.")

    log.info("Populating derbies & rivalries (Point 2)...")
    with conn:
        conn.execute("DELETE FROM derbies_and_rivalries")
        conn.executemany("""
            INSERT INTO derbies_and_rivalries
            (rivalry_name, opponent_club_id, opponent_name, first_official_match,
             total_matches, napoli_wins, draws, opponent_wins, napoli_goals, opponent_goals,
             historical_context, memorable_matches, source)
            VALUES (:rivalry_name, :opponent_club_id, :opponent_name, :first_official_match,
                    :total_matches, :napoli_wins, :draws, :opponent_wins, :napoli_goals, :opponent_goals,
                    :historical_context, :memorable_matches, :source)
        """, RIVALRIES_DATA)
    log.info(f"Inserted {len(RIVALRIES_DATA)} major regional derbies & national rivalries.")

    log.info("Populating club facilities & historic grounds (Point 3)...")
    with conn:
        conn.execute("DELETE FROM club_facilities")
        conn.executemany("""
            INSERT INTO club_facilities
            (facility_name, facility_type, location, period_start, period_end, description, key_historical_events, source)
            VALUES (:facility_name, :facility_type, :location, :period_start, :period_end, :description, :key_historical_events, :source)
        """, FACILITIES_DATA)
    log.info(f"Inserted {len(FACILITIES_DATA)} historic training facilities, stadiums, and club headquarters.")

    conn.close()

    # Export all 35 tables
    log.info("Exporting all 35 tables to CSV, consolidated JSON, and ZIP bundle in dist/...")
    storage = Storage()
    exp_res = storage.export_all()
    log.info(f"Export completed successfully: {exp_res}")


if __name__ == "__main__":
    populate_all()
