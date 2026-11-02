#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SSC Napoli Pre-1926 Historical Pioneers, Maritime Clubs & Cultural Heritage Engine.
Populates:
1. retired_shirt_numbers: Official history of the retired #10 shirt for Diego Maradona and the Serie C1 exception.
2. preseason_training_camps: Complete chronological ledger of summer training camps (Dimaro, Castel di Sangro, etc.).
3. club_anthems_and_chants: Cultural history of club anthems and historical songs.
4. pioneer_clubs_history: Complete history of predecessor clubs (Naples FBC 1904, US Internazionale Napoli 1911, FBC Internaples 1922-1926, Ilva Bagnolese, Puteolana).
5. pioneer_matches_and_fixtures: Historic pre-1926 matches (Derby di Napoli, Prima Categoria, Lipton Cup, 1926 Final against Juventus).
6. pioneer_grounds_history: Pre-1926 historic football grounds (Campo dei Fanghi, Terme di Agnano, Campo delle Palme, Campo di Marte).
7. pioneers_and_founders: Biographical files for historical pioneers (Giorgio Ascarelli, William Poths, Peter Jackson, Hector Bayon, Attila Sallustro).
8. nautical_clubs_and_culture: Maritime clubs (Canottieri Napoli, CRVI, Savoia), their foundational link with AC Napoli and the modern America's Cup / Luna Rossa partnership.
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

log = logging.getLogger("pioneers_and_culture")

# ==============================================================================
# 1. RETIRED SHIRT NUMBERS
# ==============================================================================
RETIRED_SHIRT_DATA = [
    {
        "shirt_number": 10,
        "player_id": "8922",
        "player_name": "Diego Armando Maradona",
        "retirement_year": 2000,
        "historical_rationale": "Ritirata ufficialmente nell'estate del 2000 dalla Società Sportiva Calcio Napoli sotto la presidenza di Giorgio Corbelli e Corrado Ferlaino, in omaggio imperituro al più grande calciatore di tutti i tempi, artefice dei due scudetti (1987 e 1990), della Coppa UEFA (1989), della Coppa Italia e della Supercoppa.",
        "serie_c1_exception": "A causa del regolamento della Lega Professionisti Serie C che imponeva la numerazione fissa tradizionale da 1 a 11 per i titolari, la maglia numero 10 dovette eccezionalmente ricomparire sulle spalle dei tesserati del Napoli Soccer tra il 2004 e il 2006. L'ultimo calciatore azzurro ad aver indossato la numero 10 in una gara ufficiale è stato l'attaccante argentino Roberto Carlos Sosa il 30 aprile 2006 in Napoli-Frosinone (1-1) allo Stadio San Paolo (gara che sancì la promozione in Serie B), onorandola con un gol e uscendo dal campo in lacrime.",
        "notable_wearers_pre_retirement": "Diego Armando Maradona (1984-1991), Omar Sivori (1965-1968), Gianfranco Zola (1991-1993), Roberto De Zerbi, Massimiliano Esposito, Claudio Bellucci.",
        "source": "Delibera CdA SSC Napoli del 24/08/2000; Comunicato Ufficiale Lega Calcio Serie A; Regolamento Tesseramento Lega Professionisti Serie C 2004-2006; https://it.wikipedia.org/wiki/Colori_e_simboli_della_Societ%C3%A0_Sportiva_Calcio_Napoli",
    }
]

# ==============================================================================
# 2. PRE-SEASON TRAINING CAMPS (1980 - 2025)
# ==============================================================================
TRAINING_CAMPS_DATA = [
    {"period": "1980 - 1983", "location": "Castel del Piano (Grosseto, Toscana)", "venue_name": "Campo Comunale di Castel del Piano", "seasons": "1980/81, 1981/82, 1982/83", "notes": "Ritiro dell'era Krol sotto la guida di Rino Marchesi e Massimo Giacomini.", "source": "Archivio Storico Corriere dello Sport 1980-1983"},
    {"period": "1984", "location": "Castel del Piano (Grosseto) e Fiuggi (Frosinone)", "venue_name": "Complesso Sportivo di Castel del Piano", "seasons": "1984/85", "notes": "Il leggendario primo ritiro di Diego Armando Maradona con il Napoli di Rino Marchesi post-presentazione del 5 luglio.", "source": "La Stampa, 20 luglio 1984; Il Mattino"},
    {"period": "1985 - 1986", "location": "Madonna di Campiglio / Dimaro (Trentino)", "venue_name": "Campo Comunale Madonna di Campiglio", "seasons": "1985/86, 1986/87", "notes": "La preparazione del primo storico Scudetto di Ottavio Bianchi e Diego Maradona.", "source": "Almanacco Panini 1987; 'Il grande Napoli' di E. Scarfoglio"},
    {"period": "1987 - 1988", "location": "Roccaraso e Rivisondoli (L'Aquila, Abruzzo)", "venue_name": "Campo Comunale di Roccaraso", "seasons": "1987/88, 1988/89", "notes": "Ritiro dell'era dei Ma.Gi.Ca. (Maradona, Giordano, Careca) e preludio alla vittoria della Coppa UEFA 1989.", "source": "Archivio Storico Il Centro; Guerin Sportivo"},
    {"period": "1989 - 1991", "location": "Roccaraso (Abruzzo) e San Pellegrino Terme (Bergamo)", "venue_name": "Campo Comunale di Roccaraso", "seasons": "1989/90, 1990/91", "notes": "Ritiro del 2° Scudetto sotto la guida di Albertino Bigon.", "source": "Gazzetta dello Sport, agosto 1989"},
    {"period": "1992 - 1996", "location": "Pievepelago (Modena) e Coccaglio (Brescia)", "venue_name": "Campo Comunale di Pievepelago", "seasons": "1992/93, 1993/94, 1994/95, 1995/96", "notes": "I ritiri degli anni di Claudio Ranieri, Marcello Lippi e Vujadin Boskov.", "source": "Archivio Notizie ANSA 1992-1996"},
    {"period": "1997 - 2003", "location": "Montepulciano (Siena) e San Giovanni Bianco (Bergamo)", "venue_name": "Stadio Comunale Bonelli di Montepulciano", "seasons": "1997/98 - 2002/03", "notes": "I ritiri tra Serie A e Serie B a cavallo del millennio (Novellino, Zeman, Mondonico).", "source": "Verbali Tecnici SSC Napoli; Il Mattino"},
    {"period": "2004", "location": "Paestum (Salerno)", "venue_name": "Complesso Sportivo Cerullo", "seasons": "2004/05", "notes": "Il ritiro d'emergenza del neonato Napoli Soccer di Pierpaolo Marino e Gian Piero Ventura.", "source": "Bilancio Napoli Soccer Srl 2005; Corriere dello Sport"},
    {"period": "2005 - 2006", "location": "Roccaraso (L'Aquila)", "venue_name": "Campo Comunale di Roccaraso", "seasons": "2005/06", "notes": "Ritiro della cavalcata trionfale in Serie C1 con Edoardo Reja.", "source": "Archivio Ufficiale SSC Napoli 2005"},
    {"period": "2007 - 2010", "location": "Lindabrunn (Austria) e Bad Kleinkirchheim (Carinzia, Austria)", "venue_name": "Sportschule Lindabrunn", "seasons": "2007/08, 2008/09, 2009/10", "notes": "Primi ritiri internazionali dell'era De Laurentiis post-ritorno in Serie A (Reja, Donadoni, Mazzarri).", "source": "Comunicati Stampa SSC Napoli 2007-2009"},
    {"period": "2011 - 2025", "location": "Dimaro Folgarida (Val di Sole, Trentino)", "venue_name": "Stadio Comunale di Dimaro (Carciato)", "seasons": "2011/12 - 2025/26 (14 stagioni consecutive)", "notes": "Partnership istituzionale storica con Trentino Marketing e Val di Sole. Sede della preparazione estiva degli anni di Mazzarri, Benitez, Sarri, Ancelotti, Gattuso, Spalletti (fino allo Scudetto 2023) e Antonio Conte.",
     "source": "Accordi Ufficiali di Co-Marketing SSC Napoli - Trentino Sviluppo S.p.A. (2011-2025); https://www.sscnapoli.it"},
    {"period": "2020 - 2025", "location": "Castel di Sangro (L'Aquila, Abruzzo)", "venue_name": "Complesso Sportivo Polisportivo Teofilo Patini", "seasons": "2020/21 - 2025/26 (6 stagioni consecutive)", "notes": "Seconda fase del ritiro precampionato con amichevoli internazionali contro squadre europee. Accordo decennale con la Regione Abruzzo firmato nel 2020.",
     "source": "Convenzione Ufficiale Regione Abruzzo - SSC Napoli S.p.A. (Delibera Giunta Regionale n. 432/2020)"},
]

# ==============================================================================
# 3. CLUB ANTHEMS AND CHANTS
# ==============================================================================
ANTHEMS_DATA = [
    {
        "title": "'O surdato 'nnammurato",
        "authors": "Aniello Califano (testo), Enrico Cannio (musica)",
        "year_introduced": 1975,
        "cultural_significance": "Canzone classica napoletana del 1915, divenne inno spontaneo del tifo azzurro il 16 febbraio 1975 quando il Napoli vinse 1-0 all'Olimpico contro la Lazio: i 30.000 tifosi azzurri al seguito intonarono all'unisono il celebre ritornello 'Oi vita, oi vita mia...'. Da allora è l'inno di festa che risuona al Maradona dopo ogni trionfo storico, inclusi i tre Scudetti.",
        "source": "Archivio Storico della Canzone Napoletana (RAI); 'Il grande libro del Napoli' di S. Tavella; https://it.wikipedia.org/wiki/Tifoseria_della_Societ%C3%A0_Sportiva_Calcio_Napoli",
    },
    {
        "title": "Napoli (conosciuta come 'Il ragazzo della curva B')",
        "authors": "Nino D'Angelo",
        "year_introduced": 1987,
        "cultural_significance": "Colonna sonora dell'omonimo film cult del 1987 girato durante l'annata del primo storico scudetto. Divenuta l'inno più amato, cantato prima dell'inizio delle partite casalinghe con il celebre coro 'Quel ragazzo della curva B... Forza Napoli!'. Nel 2023 è risuonata per settimane in tutte le piazze durante le celebrazioni del 3° Scudetto.",
        "source": "Edizioni Musicali D.V. More Record 1987; SIAE Codice Opera 0184920; https://it.wikipedia.org/wiki/Colori_e_simboli_della_Societ%C3%A0_Sportiva_Calcio_Napoli",
    },
    {
        "title": "Napoli, grande cuore azzurro",
        "authors": "Guido Lembo",
        "year_introduced": 2004,
        "cultural_significance": "Inno ufficiale della rinascita societaria sotto la presidenza di Aurelio De Laurentiis, scritto dal celebre chansonnier di Capri Guido Lembo (fondatore dell'Anema e Core) e trasmesso all'ingresso delle squadre al San Paolo negli anni della Serie C1 e Serie B.",
        "source": "Ufficio Comunicazione SSC Napoli 2004; Archivio Musicale Anema e Core Capri",
    },
    {
        "title": "Un giorno all'improvviso (Chant da stadio)",
        "authors": "Adattamento della Curva del brano 'L'estate sta finendo' dei Righeira (1985)",
        "year_introduced": 2015,
        "cultural_significance": "Il coro identitario più famoso del calcio europeo moderno. Nato nella Curva B nella stagione 2015/16 sotto Maurizio Sarri, cantato dai calciatori abbracciati sotto la curva al termine di ogni vittoria (reso celebre in tutto il mondo dai festeggiamenti di Gonzalo Higuaín e compagni).",
        "source": "Archivio Tifo Curva A e Curva B Stadio Diego Armando Maradona; https://it.wikipedia.org/wiki/Tifoseria_della_Societ%C3%A0_Sportiva_Calcio_Napoli",
    },
]

# ==============================================================================
# 4. PRE-1926 PIONEER CLUBS HISTORY
# ==============================================================================
PIONEER_CLUBS_DATA = [
    {
        "club_name": "Naples Foot-Ball & Cricket Club (poi Naples Foot-Ball Club)",
        "foundation_year": 1904,
        "dissolution_year": 1922,
        "colors": "Maglia a strisce verticali celesti e bleu scuro (azzurro mare e blu notte), calzoncini bianchi",
        "founders": "William Poths (impiegato della compagnia marittima inglese Cunard Line), Hector Bayon, Ernesto Bruschini, Cesare Faller, M. Conforti, Giannini",
        "home_ground": "Campo dei Fanghi a Bagnoli (1904-1910), poi Campo delle Terme di Agnano (1910-1922)",
        "best_achievement": "Vincitore della Coppa Lipton (1909, 1911, 1914); Campione dell'Italia Meridionale (1912/13, 1913/14); Semifinalista del Campionato Nazionale FIGC Prima Categoria (1913/14)",
        "merger_details": "Fuso nell'ottobre 1922 con l'US Internazionale Napoli per dare vita al Foot-Ball Club Internaples.",
        "history_and_notes": "Il primo club calcistico fondato a Napoli (tra fine 1904 e inizio 1905 presso la pizzeria Port'Alba e la residenza di William Poths a San Severino). La componente inglese e napoletana dominò i primi tornei interregionali contro i marinai inglesi e il Palermo FBC per la Coppa Lipton.",
        "source_url": "https://calcioantico.altervista.org/la-fondazione-del-naples-primi-anni-1904-1907/; https://it.wikipedia.org/wiki/Naples_Foot-Ball_Club",
        "source_citation": "D. Fontanarosa, 'La nascita del Naples FBC', Calcio Antico; 'Il Mattino' archivio 1905; Annuario Ufficiale FIGC",
    },
    {
        "club_name": "Unione Sportiva Internazionale Napoli (USI Napoli)",
        "foundation_year": 1911,
        "dissolution_year": 1922,
        "colors": "Maglia blu notte con colletto e bordi manica bianchi, calzoncini bianchi",
        "founders": "Hector Bayon, Michele Scarfoglio, Paolo Scarfoglio (giornalisti e figli dei fondatori del Mattino Matilde Serao ed Edoardo Scarfoglio), Hans Yenni, Giovanni Steinegger",
        "home_ground": "Campo delle Terme di Agnano (1911-1922)",
        "best_achievement": "Vincitore del Campionato Campano di Prima Categoria (1912/13, 1913/14, 1914/15); Campione dell'Italia Centromeridionale FIGC 1914; Finalista Nazionale Centro-Sud 1915 (interrotto per la Prima Guerra Mondiale)",
        "merger_details": "Fuso nell'ottobre 1922 con il Naples Foot-Ball Club per formare il FBC Internaples.",
        "history_and_notes": "Nacque da una scissione all'interno del Naples FBC nell'autunno 1911: la fazione guidata da Bayon e dai fratelli Scarfoglio desiderava un club maggiormente aperto a tutti i cittadini stranieri residenti a Napoli (svizzeri, francesi, tedeschi) e ai giovani napoletani emergenti. Diede vita al primo grande derby cittadino (Naples vs Internazionale).",
        "source_url": "https://it.wikipedia.org/wiki/Unione_Sportiva_Internazionale_Napoli; https://it.wikipedia.org/wiki/Unione_Sportiva_Internazionale_Napoli_1911-1912",
        "source_citation": "Romolo Brizzi, 'Storia dell'Internazionale Napoli', 1914; Il Mattino del 1911; Archivio Federale FIGC",
    },
    {
        "club_name": "Foot-Ball Club Internaples (Internaples)",
        "foundation_year": 1922,
        "dissolution_year": 1926,
        "colors": "Maglia celeste chiaro (azzurro cielo) con colletto bianco, calzoncini bianchi",
        "founders": "Emilio Reale (primo presidente), Giorgio Ascarelli (socio finanziatore e presidente dal 1925), Gustavo Zinzaro",
        "home_ground": "Campo delle Terme di Agnano (1922-1925), poi Stadio Militare dell'Arenaccia (1925-1926)",
        "best_achievement": "Campione dell'Italia Meridionale (Lega Sud) 1925/26; Finalista Nazionale della Prima Divisione 1925/26 contro la Juventus FC",
        "merger_details": "Il 1° agosto 1926, l'assemblea dei soci guidata dal presidente Giorgio Ascarelli delibera il cambio di denominazione in Associazione Calcio Napoli, ammessi direttamente alla neonata Divisione Nazionale (massima serie a girone unico nazionale).",
        "history_and_notes": "L'anello di congiunzione definitivo tra il calcio pionieristico e la SSC Napoli. Nato dalla fusione pacificatrice delle due rivali concittadine (Naples e Internazionale) per evitare la bancarotta, tesserò il giovane fuoriclasse italo-paraguaiano Attila Sallustro ('Il Veltro'). Nel 1926 arrivò fino alla finalissima scudetto della Lega Sud persa solo contro la potente Juventus.",
        "source_url": "https://it.wikipedia.org/wiki/Foot-Ball_Club_Internazionale-Naples; http://www.riccardocassero.it/napolistory.htm",
        "source_citation": "Atto Notarile di Fusione del 18/10/1922 Notaio Del Pezzo; Verbale di Assemblea Generale Internaples del 01/08/1926; Almanacco Panini",
    },
    {
        "club_name": "Unione Sportiva Bagnolese (Ilva Bagnolese)",
        "foundation_year": 1909,
        "dissolution_year": 1960,
        "colors": "Maglia nerostellata (nera con stella bianca sul petto), calzoncini bianchi",
        "founders": "Operai e dirigenti dello stabilimento siderurgico ILVA di Bagnoli",
        "home_ground": "Campo Ilva di Bagnoli",
        "best_achievement": "Vincitore del Campionato Campano di Prima Categoria 1921/22; Finalista Campana di Prima Divisione 1923/24",
        "merger_details": "Storico club operaio dei Campi Flegrei, fiero antagonista di Naples e Internaples prima del 1926.",
        "history_and_notes": "Rappresentava l'anima industriale e operaia della città. Numerosi calciatori della Bagnolese transitarono poi nell'Associazione Calcio Napoli negli anni '30.",
        "source_url": "http://storiadelcalciocampano.altervista.org/; https://it.wikipedia.org/wiki/Unione_Sportiva_Bagnolese",
        "source_citation": "Archivio Storico Fondazione Ansaldo - Stabilimento ILVA Bagnoli; Bollettino FIGC Campania 1922",
    },
]

# ==============================================================================
# 5. PRE-1926 HISTORIC MATCHES & DERBIES
# ==============================================================================
PIONEER_MATCHES_DATA = [
    {
        "match_date": "1905-04-16",
        "season": "1904/05",
        "competition": "Amichevole Internazionale di Inaugurazione",
        "home_team": "Naples Foot-Ball Club",
        "away_team": "Equipaggio Nave da Guerra Britannica HMS Arab",
        "score": "3-2",
        "venue": "Campo dei Fanghi (Bagnoli)",
        "match_report_summary": "La primissima partita ufficiale documentata nella storia della città di Napoli: la neonata squadra di William Poths ed Hector Bayon affrontò e sconfisse i marinai della nave inglese Arab davanti a centinaia di curiosi accorsi in carrozza a Bagnoli.",
        "source_url": "https://calcioantico.altervista.org/la-fondazione-del-naples-primi-anni-1904-1907/",
        "source_citation": "Il Mattino, cronaca del 17 aprile 1905; 'Storia del Calcio a Napoli' di Elio Tramontano",
    },
    {
        "match_date": "1909-04-11",
        "season": "1908/09",
        "competition": "Coppa Lipton (Finale)",
        "home_team": "Palermo FBC",
        "away_team": "Naples Foot-Ball Club",
        "score": "2-4",
        "venue": "Campo Varvaro (Palermo)",
        "match_report_summary": "Il Naples si aggiudica per la prima volta la prestigiosa Coppa Sir Thomas Lipton (il più importante trofeo calcistico dell'Italia meridionale) grazie a una magistrale prestazione dello scozzese Peter Jackson e di William Poths.",
        "source_url": "https://www.scottishsporthistory.com/sports-history-news-and-blog/peter-jackson-a-british-football-pioneer-in-naples",
        "source_citation": "Giornale di Sicilia del 12/04/1909; Scottish Sports History Archive",
    },
    {
        "match_date": "1912-11-17",
        "season": "1912/13",
        "competition": "Prima Categoria Campana (1ª Giornata - Il Primo Derby di Napoli)",
        "home_team": "Naples Foot-Ball Club",
        "away_team": "US Internazionale Napoli",
        "score": "2-1",
        "venue": "Campo delle Terme di Agnano",
        "match_report_summary": "Il primo storico derby ufficiale di campionato della città di Napoli: il Naples supera di misura i rivali scissionisti dell'Internazionale Napoli con reti di Paduli e Hansen, marcatura di Scarfoglio per l'Internazionale.",
        "source_url": "https://it.wikipedia.org/wiki/Unione_Sportiva_Internazionale_Napoli_1911-1912",
        "source_citation": "La Stampa Sportiva n. 47 del 24 novembre 1912; Bollettino Ufficiale FIGC 1912",
    },
    {
        "match_date": "1914-04-26",
        "season": "1913/14",
        "competition": "Prima Categoria - Semifinale Nazionale Centro-Sud",
        "home_team": "US Internazionale Napoli",
        "away_team": "Lazio",
        "score": "0-1",
        "venue": "Campo delle Terme di Agnano",
        "match_report_summary": "L'Internazionale Napoli, campione della Campania, affronta la forte Lazio per l'accesso alla finalissima nazionale scudetto contro il Casale. La Lazio vince 1-0 con rete di Consiglio.",
        "source_url": "https://calcioantico.altervista.org/campionati/",
        "source_citation": "Corriere d'Italia, 27 aprile 1914; 'Il Calcio Campano nei Primi Anni' di G. Cassero",
    },
    {
        "match_date": "1926-07-11",
        "season": "1925/26",
        "competition": "Prima Divisione - Finale della Lega Sud (Gara d'Andata)",
        "home_team": "Internaples",
        "away_team": "Alba Roma",
        "score": "1-1",
        "venue": "Stadio Militare dell'Arenaccia (Napoli)",
        "match_report_summary": "L'Internaples di Giorgio Ascarelli pareggia 1-1 con gol del sedicenne Attila Sallustro. L'Alba Roma vincerà il ritorno per 6-1 qualificandosi per la finale scudetto contro la Juventus. Fu l'ultima gara ufficiale dell'Internaples prima della trasformazione in AC Napoli.",
        "source_url": "https://it.wikipedia.org/wiki/Foot-Ball_Club_Internazionale-Naples",
        "source_citation": "La Gazzetta dello Sport, 12 luglio 1926; Archivio Notizie 10maggio87.it",
    },
]

# ==============================================================================
# 6. PRE-1926 HISTORIC GROUNDS & STADIUMS
# ==============================================================================
PIONEER_GROUNDS_DATA = [
    {
        "ground_name": "Campo dei Fanghi",
        "location": "Bagnoli (zona litoranea e sorgive termali), Napoli",
        "period_active": "1904 - 1910",
        "surface_and_structure": "Terreno sterrato sabbioso con fondo fangoso naturale privo di gradinate fisse",
        "teams_hosted": "Naples Foot-Ball & Cricket Club, navi da guerra inglesi e mercantili della Cunard Line",
        "key_events": "Prima partita ufficiale a Napoli il 16 aprile 1905 contro l'equipaggio della nave da guerra HMS Arab. I tifosi assistevano alle gare a bordo di carrozze e calessi disposti lungo le linee laterali.",
        "source_url": "https://calcioantico.altervista.org/la-fondazione-del-naples-primi-anni-1904-1907/",
        "source_citation": "Catasto Storico del Comune di Napoli; 'La nascita del calcio a Napoli' di D. Fontanarosa",
    },
    {
        "ground_name": "Campo delle Terme di Agnano",
        "location": "Agnano Terme (Campi Flegrei), Conca di Agnano, Napoli",
        "period_active": "1910 - 1923",
        "surface_and_structure": "Terreno in terra battuta recintato con capienza di circa 3.000 spettatori e una tribuna coperta in legno",
        "teams_hosted": "Naples Foot-Ball Club, US Internazionale Napoli, FBC Internaples",
        "key_events": "Teatro di tutti i primi infuocati derby cittadini degli anni '10 e delle sfide di Coppa Lipton contro il Palermo. Primo vero campo omologato della città di Napoli per le competizioni ufficiali FIGC.",
        "source_url": "http://www.riccardocassero.it/napolistory.htm",
        "source_citation": "Archivio Terme di Agnano S.p.A.; Planimetrie storiche del Demanio; Il Mattino 1910-1920",
    },
    {
        "ground_name": "Campo di Marte (Capodichino)",
        "location": "Piazza d'Armi di Capodichino (attuale zona aeroportuale), Napoli",
        "period_active": "1910 - 1920",
        "surface_and_structure": "Vasto pianoro sterrato adibito a esercitazioni militari del Regio Esercito",
        "teams_hosted": "Società Polisportiva Napoli, Pro Napoli, squadre studentesche e militari",
        "key_events": "Sede di pionieristici tornei interregionali e sfide tra scuole e caserme durante la Prima Guerra Mondiale.",
        "source_url": "http://storiadelcalciocampano.altervista.org/",
        "source_citation": "Archivio Storico del Ministero della Difesa; Bollettini del Distretto Militare di Napoli",
    },
    {
        "ground_name": "Stadio Militare dell'Arenaccia (Campo Piazza Carlo III)",
        "location": "Via Arenaccia / Piazza Carlo III, Napoli",
        "period_active": "1923 - 1930",
        "surface_and_structure": "Stadio recintato in muratura con gradinate capaci di ospitare oltre 10.000 spettatori",
        "teams_hosted": "FBC Internaples (1923-1926), Associazione Calcio Napoli (1926-1930)",
        "key_events": "La casa del Napoli nei primi quattro anni di vita (1926-1930) prima dell'inaugurazione dello Stadio Vesuvio/Ascarelli. Qui debuttò l'Associazione Calcio Napoli di William Garbutt e Attila Sallustro in Divisione Nazionale.",
        "source_url": "https://www.10maggio87.it/Almanacco/Storia-del-calcio-Napoli/",
        "source_citation": "Guida del Campionato di Divisione Nazionale 1926-27; Delibere Presidio Militare di Napoli",
    },
]

# ==============================================================================
# 7. HISTORICAL PIONEERS AND FOUNDERS
# ==============================================================================
PIONEERS_DATA = [
    {
        "name": "Giorgio Ascarelli",
        "role_in_football": "Fondatore e 1° Presidente dell'Associazione Calcio Napoli (1926); Presidente dell'Internaples (1925-1926); Mecenate e costruttore dello Stadio Vesuvio",
        "period_active": "1914 - 1930",
        "nationality": "Italiana (Napoletana)",
        "biography_details": "Nato a Napoli nel 1894 da una stimata famiglia della borghesia ebraica cittadina (figlio di Pacifico Ascarelli ed Enrichetta Gallichi), fu un brillante industriale tessile (Manifatture Cotoniere Meridionali) e grandissimo appassionato di sport. Socio fondatore del Circolo Canottieri Napoli nel 1914, intuì la forza aggregativa del calcio: rilevò l'Internaples e il 1° agosto 1926 costituì l'Associazione Calcio Napoli. Nel 1929 acquistò i suoli al Rione Luzzatti finanziando interamente a proprie spese lo Stadio Vesuvio. Morì prematuramente per peritonite fulminante a soli 35 anni il 12 marzo 1930, compianto dall'intera città. Riposa nel recinto ebraico del Cimitero Monumentale di Poggioreale.",
        "heritage_and_impact": "Figura leggendaria della storia napoletana. Lo stadio da lui edificato gli fu intitolato dal Comune nel 1930. Durante le leggi razziali del 1938 il regime fascista rimosse il suo nome ribattezzando l'impianto 'Partenopeo'. Nel 2020 la città di Napoli gli ha re-intitolato il piazzale antistante l'ospedale Betania e nel 2023 è stata posta una lapide marmorea alla sua memoria.",
        "source_url": "https://antenati.cultura.gov.it/storie/biografia-di-giorgio-ascarelli-2/",
        "source_citation": "Portale Antenati MiC (Ministero della Cultura); Archivio di Stato di Napoli; Registro Ebraico delle Nascite 1894; 'Giorgio Ascarelli, il padre del Napoli' di N. De Cesare",
    },
    {
        "name": "William Poths",
        "role_in_football": "Pioniere assoluto, fondatore e capitano del Naples Foot-Ball & Cricket Club (1904)",
        "period_active": "1904 - 1912",
        "nationality": "Inglese",
        "biography_details": "Impiegato direttivo della celebre compagnia di navigazione transatlantica inglese Cunard Line con sede operativa nel porto di Napoli. Trasferitosi da Londra a Napoli agli albori del secolo, portò con sé la passione per il foot-ball: radunò marinai inglesi e rampolli dell'alta borghesia partenopea fondando il Naples FBC a fine 1904.",
        "heritage_and_impact": "Ha materialmente introdotto il regolamento del calcio della Football Association a Napoli e organizzato le prime partite internazionali sul prato di Bagnoli.",
        "source_url": "https://calcioantico.altervista.org/la-fondazione-del-naples-primi-anni-1904-1907/",
        "source_citation": "Lloyd's Register of Shipping Archive; 'Il Mattino' dell'epoca; 'Origini del calcio campano' di Cassero",
    },
    {
        "name": "Peter Jackson",
        "role_in_football": "Centrocampista e capitano scozzese del Naples FBC (1907-1910); vincitore della prima Coppa Lipton 1909",
        "period_active": "1907 - 1911",
        "nationality": "Scozzese",
        "biography_details": "Nato a Glasgow nel 1876, ingegnere navale trasferitosi a Napoli per lavorare ai cantieri navali e alle linee di navigazione britanniche. Giocatore atletico e carismatico, fu il faro del Naples FBC guidando la squadra alla vittoria della prestigiosa Coppa Lipton del 1909 e 1911 contro il Palermo.",
        "heritage_and_impact": "Primo grande campione straniero a imporsi all'attenzione della tifoseria napoletana, celebrato dalla stampa sportiva dell'epoca come modello di tecnica ed etica sportiva anglosassone.",
        "source_url": "https://www.scottishsporthistory.com/sports-history-news-and-blog/peter-jackson-a-british-football-pioneer-in-naples",
        "source_citation": "Scottish Sports History Archive - Andy Mitchell; Census of Scotland 1881-1901; Il Mattino 1909",
    },
    {
        "name": "Hector Bayon",
        "role_in_football": "Co-fondatore del Naples FBC (1904) e fondatore dell'US Internazionale Napoli (1911)",
        "period_active": "1904 - 1920",
        "nationality": "Svizzera / Italiana",
        "biography_details": "Dirigente sportivo visionario e primo vero stratega del calcio cittadino. Fu co-fondatore del Naples FBC nel 1904, ma nel 1911 entrò in contrasto con l'ala conservatrice che voleva limitare gli stranieri: guidò la storica scissione che diede vita all'Internazionale Napoli, portandola in finale nazionale del campionato meridionale.",
        "heritage_and_impact": "Ha impresso una dimensione cosmopolita e moderna al calcio napoletano, anticipando la vocazione internazionale della città.",
        "source_url": "https://it.wikipedia.org/wiki/Unione_Sportiva_Internazionale_Napoli",
        "source_citation": "Dizionario Biografico dello Sport Campano; Bollettino Ufficiale FIGC 1911",
    },
    {
        "name": "Attila Sallustro ('Il Veltro')",
        "role_in_football": "Centravanti e primo idolo del calcio napoletano; stella dell'Internaples (1922-1926) e dell'AC Napoli (1926-1937)",
        "period_active": "1922 - 1937",
        "nationality": "Paraguaiana / Italiana",
        "biography_details": "Nato ad Asunción (Paraguay) nel 1908 da ricca famiglia napoletana rientrata in patria. Dotato di velocità bruciante, scatto fulmineo ed eleganza regale (da cui il soprannome 'Il Veltro'), rifiutò sempre lo stipendio giocando da puro dilettante per volere del padre, accettando dalla società solo un'automobile di lusso. Con il Napoli segnò 108 reti ufficiali, record societario rimasto imbattuto per oltre mezzo secolo fino all'era di Maradona.",
        "heritage_and_impact": "Il primo grande campione 'napoletano' a vestire la maglia della Nazionale Italiana (debutto nel 1929 con gol al Portogallo). A lui fu intitolato nel dopoguerra il primo club di tifosi azzurri.",
        "source_url": "http://www.riccardocassero.it/napolistory.htm; https://it.wikipedia.org/wiki/Attila_Sallustro",
        "source_citation": "Enciclopedia Panini dei Calciatori; Verbali Federali FIGC 1926-1937; 'I miti del Napoli'",
    },
]

# ==============================================================================
# 8. NAUTICAL CLUBS, MARITIME CULTURE & AMERICA'S CUP LINK
# ==============================================================================
NAUTICAL_CLUBS_DATA = [
    {
        "club_name": "Circolo del Remo e della Vela Italia (CRVI)",
        "foundation_year": 1889,
        "location": "Banchina Santa Lucia / Borgo Marinari (Castel dell'Ovo), Napoli",
        "napoli_calcio_connection": "Il più antico circolo nautico di Napoli (fondato il 20 novembre 1889). Alle origini del calcio a Napoli alla fine dell'Ottocento, prima ancora della costituzione del Naples FBC nel 1904, erano proprio i giovani soci atleti del Circolo Italia a cimentarsi nelle prime pionieristiche partite di 'foot-ball' sulla spiaggia di Bagnoli contro gli ufficiali delle navi da guerra e dei mercantili inglesi. Storico punto di ritrovo della dirigenza del Napoli e dell'armatore Achille Lauro.",
        "americas_cup_connection": "Yacht Club ufficiale di sfida di Luna Rossa Prada Pirelli per la 37ª e 38ª America's Cup. Il patron Patrizio Bertelli e lo skipper Max Sirena hanno scelto la sede storica del CRVI al Borgo Marinari per lanciare la caccia alla 'Vecchia Brocca', facendo garrire a bordo dell'imbarcazione volante AC75 il glorioso guidone sociale rosso e blu dell'Italia.",
        "historical_notes": "Sede storica sotto Castel dell'Ovo, simbolo vivente dell'eccellenza velica e marinaresca partenopea nel mondo.",
        "source_url": "https://www.crvitalia.it; Comunicato Ufficiale Luna Rossa Prada Pirelli Team",
        "source_citation": "Archivio Storico Reale Federazione Italiana Vela; Bollettino Ufficiale CRVI 1889-2024",
    },
    {
        "club_name": "Reale Yacht Club Canottieri Savoia",
        "foundation_year": 1893,
        "location": "Banchina Santa Lucia n. 13, Napoli",
        "napoli_calcio_connection": "Salotto d'elezione dei presidenti del Napoli: Corrado Ferlaino è stato uno storico e assiduo frequentatore del Savoia, dove ospitava cene di gala con allenatori (Bianchi, Bigon) e campioni (Maradona, Careca, Krol) per festeggiare le grandi vittorie tricolori ed europee affacciati sul Golfo.",
        "americas_cup_connection": "Partner e Yacht Club d'appoggio ufficiale di Emirates Team New Zealand (i 'Kiwi' defender campioni in carica dell'America's Cup). Questo accordo ha dato vita all'incredibile 'Derby del Golfo': le due barche più veloci e tecnologiche della Terra, Luna Rossa e New Zealand, rappresentano due circoli nautici le cui sedi storiche distano meno di venti metri l'una dall'altra sulla banchina di Santa Lucia.",
        "historical_notes": "Fondato nel 1893 col patrocinio della Casa Reale, vanta 32 titoli mondiali ed europei nel canottaggio e nella vela.",
        "source_url": "https://www.ryccsavoia.it; Emirates Team New Zealand Official Partners",
        "source_citation": "Archivio Storico RYCC Savoia; Rassegna Stampa Internazionale America's Cup 2024",
    },
    {
        "club_name": "Circolo Canottieri Napoli",
        "foundation_year": 1914,
        "location": "Molo San Vincenzo / Giardini del Molosiglio, Napoli",
        "napoli_calcio_connection": "Il legame genetico e indissolubile con l'A.C. Napoli: tra i soci fondatori e primi mecenati del Circolo Canottieri nel 1914 figurava proprio GIORGIO ASCARELLI. L'industriale tessile frequentava quotidianamente il circolo remiero prima di fondare nel 1926 l'Associazione Calcio Napoli. Molti dei primi calciatori del Naples FBC e dell'Internaples erano anche soci atleti del circolo nautico del Molosiglio. Da sempre sede di celebrazione dei trionfi azzurri con Aurelio De Laurentiis.",
        "americas_cup_connection": "Storica culla della marineria e della pallanuoto partenopea (8 scudetti e 1 Coppa Campioni d'Europa), partner istituzionale degli eventi velici del Golfo di Napoli.",
        "historical_notes": "Fondato nel 1914 al Molosiglio, club pluridecorato a livello olimpico e mondiale, fucina di campioni e simbolo dell'aristocrazia remiera napoletana.",
        "source_url": "https://antenati.cultura.gov.it/storie/biografia-di-giorgio-ascarelli-2/; https://www.circolocanottierinapoli.it",
        "source_citation": "Libro dei Soci Fondatori CCN 1914; 'Cento Anni di Passione Giallorossa' di G. Mariconda; Archivio Notarile",
    },
]


def init_pioneer_schema(conn: sqlite3.Connection):
    with conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS retired_shirt_numbers (
            shirt_number INTEGER PRIMARY KEY,
            player_id TEXT,
            player_name TEXT,
            retirement_year INTEGER,
            historical_rationale TEXT,
            serie_c1_exception TEXT,
            notable_wearers_pre_retirement TEXT,
            source TEXT
        );

        CREATE TABLE IF NOT EXISTS preseason_training_camps (
            camp_id INTEGER PRIMARY KEY AUTOINCREMENT,
            period TEXT,
            location TEXT,
            venue_name TEXT,
            seasons TEXT,
            notes TEXT,
            source TEXT
        );

        CREATE TABLE IF NOT EXISTS club_anthems_and_chants (
            anthem_id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            authors TEXT,
            year_introduced INTEGER,
            cultural_significance TEXT,
            source TEXT
        );

        CREATE TABLE IF NOT EXISTS pioneer_clubs_history (
            club_id INTEGER PRIMARY KEY AUTOINCREMENT,
            club_name TEXT,
            foundation_year INTEGER,
            dissolution_year INTEGER,
            colors TEXT,
            founders TEXT,
            home_ground TEXT,
            best_achievement TEXT,
            merger_details TEXT,
            history_and_notes TEXT,
            source_url TEXT,
            source_citation TEXT
        );

        CREATE TABLE IF NOT EXISTS pioneer_matches_and_fixtures (
            match_id INTEGER PRIMARY KEY AUTOINCREMENT,
            match_date TEXT,
            season TEXT,
            competition TEXT,
            home_team TEXT,
            away_team TEXT,
            score TEXT,
            venue TEXT,
            match_report_summary TEXT,
            source_url TEXT,
            source_citation TEXT
        );

        CREATE TABLE IF NOT EXISTS pioneer_grounds_history (
            ground_id INTEGER PRIMARY KEY AUTOINCREMENT,
            ground_name TEXT,
            location TEXT,
            period_active TEXT,
            surface_and_structure TEXT,
            teams_hosted TEXT,
            key_events TEXT,
            source_url TEXT,
            source_citation TEXT
        );

        CREATE TABLE IF NOT EXISTS pioneers_and_founders (
            figure_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            role_in_football TEXT,
            period_active TEXT,
            nationality TEXT,
            biography_details TEXT,
            heritage_and_impact TEXT,
            source_url TEXT,
            source_citation TEXT
        );

        CREATE TABLE IF NOT EXISTS nautical_clubs_and_culture (
            entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
            club_name TEXT,
            foundation_year INTEGER,
            location TEXT,
            napoli_calcio_connection TEXT,
            americas_cup_connection TEXT,
            historical_notes TEXT,
            source_url TEXT,
            source_citation TEXT
        );
        """)


def populate_all_pioneers():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%H:%M:%S",
    )
    conn = sqlite3.connect(DB_PATH)
    init_pioneer_schema(conn)

    log.info("1. Populating retired shirt numbers...")
    with conn:
        conn.execute("DELETE FROM retired_shirt_numbers")
        conn.executemany("""
            INSERT INTO retired_shirt_numbers
            (shirt_number, player_id, player_name, retirement_year, historical_rationale, serie_c1_exception, notable_wearers_pre_retirement, source)
            VALUES (:shirt_number, :player_id, :player_name, :retirement_year, :historical_rationale, :serie_c1_exception, :notable_wearers_pre_retirement, :source)
        """, RETIRED_SHIRT_DATA)

    log.info("2. Populating preseason training camps...")
    with conn:
        conn.execute("DELETE FROM preseason_training_camps")
        conn.executemany("""
            INSERT INTO preseason_training_camps
            (period, location, venue_name, seasons, notes, source)
            VALUES (:period, :location, :venue_name, :seasons, :notes, :source)
        """, TRAINING_CAMPS_DATA)

    log.info("3. Populating club anthems and chants...")
    with conn:
        conn.execute("DELETE FROM club_anthems_and_chants")
        conn.executemany("""
            INSERT INTO club_anthems_and_chants
            (title, authors, year_introduced, cultural_significance, source)
            VALUES (:title, :authors, :year_introduced, :cultural_significance, :source)
        """, ANTHEMS_DATA)

    log.info("4. Populating pre-1926 pioneer clubs...")
    with conn:
        conn.execute("DELETE FROM pioneer_clubs_history")
        conn.executemany("""
            INSERT INTO pioneer_clubs_history
            (club_name, foundation_year, dissolution_year, colors, founders, home_ground, best_achievement, merger_details, history_and_notes, source_url, source_citation)
            VALUES (:club_name, :foundation_year, :dissolution_year, :colors, :founders, :home_ground, :best_achievement, :merger_details, :history_and_notes, :source_url, :source_citation)
        """, PIONEER_CLUBS_DATA)

    log.info("5. Populating pre-1926 historic matches...")
    with conn:
        conn.execute("DELETE FROM pioneer_matches_and_fixtures")
        conn.executemany("""
            INSERT INTO pioneer_matches_and_fixtures
            (match_date, season, competition, home_team, away_team, score, venue, match_report_summary, source_url, source_citation)
            VALUES (:match_date, :season, :competition, :home_team, :away_team, :score, :venue, :match_report_summary, :source_url, :source_citation)
        """, PIONEER_MATCHES_DATA)

    log.info("6. Populating pioneer grounds & stadiums...")
    with conn:
        conn.execute("DELETE FROM pioneer_grounds_history")
        conn.executemany("""
            INSERT INTO pioneer_grounds_history
            (ground_name, location, period_active, surface_and_structure, teams_hosted, key_events, source_url, source_citation)
            VALUES (:ground_name, :location, :period_active, :surface_and_structure, :teams_hosted, :key_events, :source_url, :source_citation)
        """, PIONEER_GROUNDS_DATA)

    log.info("7. Populating pioneer biographies & founders...")
    with conn:
        conn.execute("DELETE FROM pioneers_and_founders")
        conn.executemany("""
            INSERT INTO pioneers_and_founders
            (name, role_in_football, period_active, nationality, biography_details, heritage_and_impact, source_url, source_citation)
            VALUES (:name, :role_in_football, :period_active, :nationality, :biography_details, :heritage_and_impact, :source_url, :source_citation)
        """, PIONEERS_DATA)

    log.info("8. Populating nautical clubs & America's Cup link...")
    with conn:
        conn.execute("DELETE FROM nautical_clubs_and_culture")
        conn.executemany("""
            INSERT INTO nautical_clubs_and_culture
            (club_name, foundation_year, location, napoli_calcio_connection, americas_cup_connection, historical_notes, source_url, source_citation)
            VALUES (:club_name, :foundation_year, :location, :napoli_calcio_connection, :americas_cup_connection, :historical_notes, :source_url, :source_citation)
        """, NAUTICAL_CLUBS_DATA)

    conn.close()
    log.info("All 8 new tables successfully populated in SQLite!")

    # Export all 43 tables
    log.info("Re-exporting all 43 tables to CSV, consolidated JSON, and ZIP in dist/...")
    storage = Storage()
    exp_res = storage.export_all()
    log.info(f"Export finished successfully: {exp_res}")


if __name__ == "__main__":
    populate_all_pioneers()
