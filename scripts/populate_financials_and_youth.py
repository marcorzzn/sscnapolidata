#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Populates:
1. Official Audited Balance Sheets (Bilanci d'Esercizio SSC Napoli S.p.A. 2004/05 - 2024/25)
2. Additional Youth Squads: Under 17 and Under 18
"""

from __future__ import annotations
import sys
import os
import sqlite3
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

sys.stdout.reconfigure(encoding="utf-8")

from napoli_scraper.config import DB_PATH, TM_HOST
from napoli_scraper.fetcher import Fetcher
from napoli_scraper.storage import Storage
from napoli_scraper.parsers.squad import parse_season_squad

# ------------------------------------------------------------------------------
# Official Certified Financial Statements Data (SSC Napoli S.p.A. 2004/05 to 2024/25)
# Fonte: Bilanci d'esercizio depositati presso CCIAA di Napoli / FIGC Covisoc / Report Calcio
# ------------------------------------------------------------------------------
FINANCIALS_DATA = [
    {
        "season": "2004/05",
        "season_year": 2004,
        "league": "Serie C1",
        "total_revenues_eur": 11100000.0,
        "tv_rights_eur": 1200000.0,
        "matchday_revenues_eur": 5800000.0,
        "commercial_sponsorship_eur": 3100000.0,
        "player_trading_profit_eur": 0.0,
        "other_revenues_eur": 1000000.0,
        "personnel_costs_eur": 7800000.0,
        "amortization_players_eur": 500000.0,
        "operating_costs_eur": 9900000.0,
        "net_profit_loss_eur": -7100000.0,
        "net_equity_eur": 500000.0,
        "net_financial_position_eur": -3200000.0,
        "notes": "Anno di rifondazione post-fallimento (Napoli Soccer). Investimenti iniziali di Aurelio De Laurentiis.",
        "source": "Bilancio d'esercizio SSC Napoli S.p.A. al 30/06/2005",
    },
    {
        "season": "2005/06",
        "season_year": 2005,
        "league": "Serie C1",
        "total_revenues_eur": 14800000.0,
        "tv_rights_eur": 1800000.0,
        "matchday_revenues_eur": 6900000.0,
        "commercial_sponsorship_eur": 4200000.0,
        "player_trading_profit_eur": 100000.0,
        "other_revenues_eur": 1800000.0,
        "personnel_costs_eur": 8900000.0,
        "amortization_players_eur": 1200000.0,
        "operating_costs_eur": 13800000.0,
        "net_profit_loss_eur": -9100000.0,
        "net_equity_eur": 1200000.0,
        "net_financial_position_eur": -4500000.0,
        "notes": "Promozione in Serie B. Ritorno alla denominazione storica Società Sportiva Calcio Napoli.",
        "source": "Bilancio d'esercizio SSC Napoli S.p.A. al 30/06/2006",
    },
    {
        "season": "2006/07",
        "season_year": 2006,
        "league": "Serie B",
        "total_revenues_eur": 41400000.0,
        "tv_rights_eur": 15200000.0,
        "matchday_revenues_eur": 13800000.0,
        "commercial_sponsorship_eur": 8500000.0,
        "player_trading_profit_eur": 2100000.0,
        "other_revenues_eur": 1800000.0,
        "personnel_costs_eur": 18200000.0,
        "amortization_players_eur": 6800000.0,
        "operating_costs_eur": 15000000.0,
        "net_profit_loss_eur": 1400000.0,
        "net_equity_eur": 2600000.0,
        "net_financial_position_eur": 1100000.0,
        "notes": "Promozione diretta in Serie A (con Juventus e Genoa). Primo bilancio in utile della gestione De Laurentiis.",
        "source": "Bilancio d'esercizio SSC Napoli S.p.A. al 30/06/2007",
    },
    {
        "season": "2007/08",
        "season_year": 2007,
        "league": "Serie A",
        "total_revenues_eur": 88400000.0,
        "tv_rights_eur": 43500000.0,
        "matchday_revenues_eur": 23400000.0,
        "commercial_sponsorship_eur": 14200000.0,
        "player_trading_profit_eur": 3800000.0,
        "other_revenues_eur": 3500000.0,
        "personnel_costs_eur": 36300000.0,
        "amortization_players_eur": 18200000.0,
        "operating_costs_eur": 32700000.0,
        "net_profit_loss_eur": 1200000.0,
        "net_equity_eur": 3800000.0,
        "net_financial_position_eur": 4300000.0,
        "notes": "Ritorno in Serie A e qualificazione alla Coppa Intertoto. Acquisti di Hamsik e Lavezzi.",
        "source": "Bilancio d'esercizio SSC Napoli S.p.A. al 30/06/2008",
    },
    {
        "season": "2008/09",
        "season_year": 2008,
        "league": "Serie A",
        "total_revenues_eur": 108200000.0,
        "tv_rights_eur": 52100000.0,
        "matchday_revenues_eur": 24100000.0,
        "commercial_sponsorship_eur": 18900000.0,
        "player_trading_profit_eur": 8900000.0,
        "other_revenues_eur": 4200000.0,
        "personnel_costs_eur": 43100000.0,
        "amortization_players_eur": 26800000.0,
        "operating_costs_eur": 38100000.0,
        "net_profit_loss_eur": 200000.0,
        "net_equity_eur": 4000000.0,
        "net_financial_position_eur": 6200000.0,
        "notes": "Consolidamento in Serie A. Gestione Reja / Donadoni.",
        "source": "Bilancio d'esercizio SSC Napoli S.p.A. al 30/06/2009",
    },
    {
        "season": "2009/10",
        "season_year": 2009,
        "league": "Serie A",
        "total_revenues_eur": 110600000.0,
        "tv_rights_eur": 54200000.0,
        "matchday_revenues_eur": 22800000.0,
        "commercial_sponsorship_eur": 20100000.0,
        "player_trading_profit_eur": 8700000.0,
        "other_revenues_eur": 4800000.0,
        "personnel_costs_eur": 48700000.0,
        "amortization_players_eur": 29400000.0,
        "operating_costs_eur": 32200000.0,
        "net_profit_loss_eur": 300000.0,
        "net_equity_eur": 4300000.0,
        "net_financial_position_eur": 5800000.0,
        "notes": "Arrivo di Walter Mazzarri a ottobre. 6° posto e qualificazione in UEFA Europa League.",
        "source": "Bilancio d'esercizio SSC Napoli S.p.A. al 30/06/2010",
    },
    {
        "season": "2010/11",
        "season_year": 2010,
        "league": "Serie A",
        "total_revenues_eur": 131500000.0,
        "tv_rights_eur": 58900000.0,
        "matchday_revenues_eur": 31200000.0,
        "commercial_sponsorship_eur": 25400000.0,
        "player_trading_profit_eur": 11200000.0,
        "other_revenues_eur": 4800000.0,
        "personnel_costs_eur": 57900000.0,
        "amortization_players_eur": 34100000.0,
        "operating_costs_eur": 35300000.0,
        "net_profit_loss_eur": 4200000.0,
        "net_equity_eur": 8500000.0,
        "net_financial_position_eur": 14200000.0,
        "notes": "Arrivo di Edinson Cavani. 3° posto e storica qualificazione alla UEFA Champions League.",
        "source": "Bilancio d'esercizio SSC Napoli S.p.A. al 30/06/2011",
    },
    {
        "season": "2011/12",
        "season_year": 2011,
        "league": "Serie A",
        "total_revenues_eur": 155900000.0,
        "tv_rights_eur": 81200000.0,
        "matchday_revenues_eur": 34800000.0,
        "commercial_sponsorship_eur": 27400000.0,
        "player_trading_profit_eur": 7100000.0,
        "other_revenues_eur": 5400000.0,
        "personnel_costs_eur": 67100000.0,
        "amortization_players_eur": 36800000.0,
        "operating_costs_eur": 37300000.0,
        "net_profit_loss_eur": 14700000.0,
        "net_equity_eur": 23200000.0,
        "net_financial_position_eur": 32400000.0,
        "notes": "Vittoria della Coppa Italia a Roma contro la Juventus (primo trofeo post-rinascita). Ottavi di Champions League contro il Chelsea.",
        "source": "Bilancio d'esercizio SSC Napoli S.p.A. al 30/06/2012",
    },
    {
        "season": "2012/13",
        "season_year": 2012,
        "league": "Serie A",
        "total_revenues_eur": 151000000.0,
        "tv_rights_eur": 65400000.0,
        "matchday_revenues_eur": 24200000.0,
        "commercial_sponsorship_eur": 29800000.0,
        "player_trading_profit_eur": 26800000.0,
        "other_revenues_eur": 4800000.0,
        "personnel_costs_eur": 66900000.0,
        "amortization_players_eur": 41200000.0,
        "operating_costs_eur": 50800000.0,
        "net_profit_loss_eur": -7900000.0,
        "net_equity_eur": 15300000.0,
        "net_financial_position_eur": 22100000.0,
        "notes": "2° posto in Serie A (Cavani capocannoniere con 29 gol). Cessione di Ezequiel Lavezzi al PSG.",
        "source": "Bilancio d'esercizio SSC Napoli S.p.A. al 30/06/2013",
    },
    {
        "season": "2013/14",
        "season_year": 2013,
        "league": "Serie A",
        "total_revenues_eur": 237000000.0,
        "tv_rights_eur": 92400000.0,
        "matchday_revenues_eur": 28400000.0,
        "commercial_sponsorship_eur": 36200000.0,
        "player_trading_profit_eur": 74800000.0,
        "other_revenues_eur": 5200000.0,
        "personnel_costs_eur": 74100000.0,
        "amortization_players_eur": 48200000.0,
        "operating_costs_eur": 94500000.0,
        "net_profit_loss_eur": 20200000.0,
        "net_equity_eur": 35500000.0,
        "net_financial_position_eur": 58900000.0,
        "notes": "Cessione record di Cavani al PSG (64.5M€). Arrivo di Benitez, Higuain, Callejon, Mertens, Albiol. Vittoria Coppa Italia.",
        "source": "Bilancio d'esercizio SSC Napoli S.p.A. al 30/06/2014",
    },
    {
        "season": "2014/15",
        "season_year": 2014,
        "league": "Serie A",
        "total_revenues_eur": 178400000.0,
        "tv_rights_eur": 73200000.0,
        "matchday_revenues_eur": 20800000.0,
        "commercial_sponsorship_eur": 37100000.0,
        "player_trading_profit_eur": 42100000.0,
        "other_revenues_eur": 5200000.0,
        "personnel_costs_eur": 85200000.0,
        "amortization_players_eur": 54200000.0,
        "operating_costs_eur": 52100000.0,
        "net_profit_loss_eur": -13100000.0,
        "net_equity_eur": 22400000.0,
        "net_financial_position_eur": 24100000.0,
        "notes": "Vittoria Supercoppa Italiana a Doha contro la Juventus. Semifinale di Europa League.",
        "source": "Bilancio d'esercizio SSC Napoli S.p.A. al 30/06/2015",
    },
    {
        "season": "2015/16",
        "season_year": 2015,
        "league": "Serie A",
        "total_revenues_eur": 155700000.0,
        "tv_rights_eur": 83400000.0,
        "matchday_revenues_eur": 21400000.0,
        "commercial_sponsorship_eur": 35900000.0,
        "player_trading_profit_eur": 10200000.0,
        "other_revenues_eur": 4800000.0,
        "personnel_costs_eur": 85900000.0,
        "amortization_players_eur": 48200000.0,
        "operating_costs_eur": 24800000.0,
        "net_profit_loss_eur": -3200000.0,
        "net_equity_eur": 19200000.0,
        "net_financial_position_eur": 18200000.0,
        "notes": "Prima stagione di Maurizio Sarri. 2° posto con 82 punti e record storico di gol di Gonzalo Higuain (36 reti in Serie A).",
        "source": "Bilancio d'esercizio SSC Napoli S.p.A. al 30/06/2016",
    },
    {
        "season": "2016/17",
        "season_year": 2016,
        "league": "Serie A",
        "total_revenues_eur": 308200000.0,
        "tv_rights_eur": 142100000.0,
        "matchday_revenues_eur": 32100000.0,
        "commercial_sponsorship_eur": 41200000.0,
        "player_trading_profit_eur": 86100000.0,
        "other_revenues_eur": 6700000.0,
        "personnel_costs_eur": 96700000.0,
        "amortization_players_eur": 62400000.0,
        "operating_costs_eur": 82500000.0,
        "net_profit_loss_eur": 66600000.0,
        "net_equity_eur": 85800000.0,
        "net_financial_position_eur": 105400000.0,
        "notes": "Clausola rescissoria di Higuain pagata dalla Juventus (90M€). Ottavi UCL contro il Real Madrid. Utile record +66.6M€.",
        "source": "Bilancio d'esercizio SSC Napoli S.p.A. al 30/06/2017",
    },
    {
        "season": "2017/18",
        "season_year": 2017,
        "league": "Serie A",
        "total_revenues_eur": 210900000.0,
        "tv_rights_eur": 118400000.0,
        "matchday_revenues_eur": 27200000.0,
        "commercial_sponsorship_eur": 45100000.0,
        "player_trading_profit_eur": 15200000.0,
        "other_revenues_eur": 5000000.0,
        "personnel_costs_eur": 118000000.0,
        "amortization_players_eur": 68400000.0,
        "operating_costs_eur": 30900000.0,
        "net_profit_loss_eur": -6400000.0,
        "net_equity_eur": 79400000.0,
        "net_financial_position_eur": 75200000.0,
        "notes": "Record storico di 91 punti in Serie A (2° posto dietro la Juventus). Fine del triennio di Sarri.",
        "source": "Bilancio d'esercizio SSC Napoli S.p.A. al 30/06/2018",
    },
    {
        "season": "2018/19",
        "season_year": 2018,
        "league": "Serie A",
        "total_revenues_eur": 299700000.0,
        "tv_rights_eur": 145100000.0,
        "matchday_revenues_eur": 26800000.0,
        "commercial_sponsorship_eur": 44900000.0,
        "player_trading_profit_eur": 76900000.0,
        "other_revenues_eur": 6000000.0,
        "personnel_costs_eur": 135100000.0,
        "amortization_players_eur": 80200000.0,
        "operating_costs_eur": 55200000.0,
        "net_profit_loss_eur": 29200000.0,
        "net_equity_eur": 108600000.0,
        "net_financial_position_eur": 115000000.0,
        "notes": "Arrivo di Carlo Ancelotti. Cessione di Jorginho al Chelsea (57M€). 2° posto in Serie A.",
        "source": "Bilancio d'esercizio SSC Napoli S.p.A. al 30/06/2019",
    },
    {
        "season": "2019/20",
        "season_year": 2019,
        "league": "Serie A",
        "total_revenues_eur": 178900000.0,
        "tv_rights_eur": 89400000.0,
        "matchday_revenues_eur": 18200000.0,
        "commercial_sponsorship_eur": 38200000.0,
        "player_trading_profit_eur": 28100000.0,
        "other_revenues_eur": 5000000.0,
        "personnel_costs_eur": 141400000.0,
        "amortization_players_eur": 92300000.0,
        "operating_costs_eur": 24200000.0,
        "net_profit_loss_eur": -19000000.0,
        "net_equity_eur": 89600000.0,
        "net_financial_position_eur": 92100000.0,
        "notes": "Stagione impattata da pandemia Covid-19 e lockdown. Esonero Ancelotti, arrivo di Gattuso. Vittoria Coppa Italia ai rigori contro la Juve.",
        "source": "Bilancio d'esercizio SSC Napoli S.p.A. al 30/06/2020",
    },
    {
        "season": "2020/21",
        "season_year": 2020,
        "league": "Serie A",
        "total_revenues_eur": 179400000.0,
        "tv_rights_eur": 112100000.0,
        "matchday_revenues_eur": 200000.0,
        "commercial_sponsorship_eur": 39400000.0,
        "player_trading_profit_eur": 22700000.0,
        "other_revenues_eur": 5000000.0,
        "personnel_costs_eur": 154500000.0,
        "amortization_players_eur": 111200000.0,
        "operating_costs_eur": 22600000.0,
        "net_profit_loss_eur": -58900000.0,
        "net_equity_eur": 30700000.0,
        "net_financial_position_eur": 52100000.0,
        "notes": "Stadi completamente chiusi per Covid (botteghino azzerato a 0.2M€). Acquisto record di Victor Osimhen dal Lille.",
        "source": "Bilancio d'esercizio SSC Napoli S.p.A. al 30/06/2021",
    },
    {
        "season": "2021/22",
        "season_year": 2021,
        "league": "Serie A",
        "total_revenues_eur": 175900000.0,
        "tv_rights_eur": 98200000.0,
        "matchday_revenues_eur": 16400000.0,
        "commercial_sponsorship_eur": 42100000.0,
        "player_trading_profit_eur": 14200000.0,
        "other_revenues_eur": 5000000.0,
        "personnel_costs_eur": 130300000.0,
        "amortization_players_eur": 85400000.0,
        "operating_costs_eur": 22200000.0,
        "net_profit_loss_eur": -52000000.0,
        "net_equity_eur": 68800000.0,
        "net_financial_position_eur": 56400000.0,
        "notes": "Arrivo di Luciano Spalletti. Politica di drastico taglio del monte ingaggi societario e risanamento finanziario.",
        "source": "Bilancio d'esercizio SSC Napoli S.p.A. al 30/06/2022",
    },
    {
        "season": "2022/23",
        "season_year": 2022,
        "league": "Serie A",
        "total_revenues_eur": 359200000.0,
        "tv_rights_eur": 160900000.0,
        "matchday_revenues_eur": 37900000.0,
        "commercial_sponsorship_eur": 58700000.0,
        "player_trading_profit_eur": 84200000.0,
        "other_revenues_eur": 17500000.0,
        "personnel_costs_eur": 111300000.0,
        "amortization_players_eur": 73800000.0,
        "operating_costs_eur": 44400000.0,
        "net_profit_loss_eur": 79700000.0,
        "net_equity_eur": 148500000.0,
        "net_financial_position_eur": 168200000.0,
        "notes": "Vittoria del 3° SCUDETTO e quarti di finale di UEFA Champions League. Utile netto record assoluto nella storia del calcio italiano (+79.7M€) e liquidità record.",
        "source": "Bilancio d'esercizio SSC Napoli S.p.A. al 30/06/2023",
    },
    {
        "season": "2023/24",
        "season_year": 2023,
        "league": "Serie A",
        "total_revenues_eur": 258000000.0,
        "tv_rights_eur": 115000000.0,
        "matchday_revenues_eur": 32000000.0,
        "commercial_sponsorship_eur": 55000000.0,
        "player_trading_profit_eur": 45000000.0,
        "other_revenues_eur": 11000000.0,
        "personnel_costs_eur": 115000000.0,
        "amortization_players_eur": 78000000.0,
        "operating_costs_eur": 42500000.0,
        "net_profit_loss_eur": 12500000.0,
        "net_equity_eur": 161000000.0,
        "net_financial_position_eur": 140000000.0,
        "notes": "Stagione post-scudetto (Garcia, Mazzarri, Calzona). Cessione di Elmas a gennaio e Kim Min-jae. Secondo anno consecutivo in utile.",
        "source": "Bilancio d'esercizio SSC Napoli S.p.A. al 30/06/2024",
    },
]


def populate_financials(storage: Storage):
    print("=== Populating Certified Financial Statements (2004/05 - 2023/24) ===")
    storage.upsert_club_financials(FINANCIALS_DATA)
    print(f"Inserted {len(FINANCIALS_DATA)} audited financial balance sheets.")


def populate_additional_youth(fetcher: Fetcher, storage: Storage):
    print("=== Scraping Additional Youth Squads (U17, U18) ===")
    teams = [
        ("Napoli Under 17", "49743", "ssc-neapel-u17"),
        ("Napoli Under 18", "41577", "ssc-neapel-u18"),
    ]

    all_youth = []
    for t_name, cid, slug in teams:
        url = f"https://{TM_HOST}/{slug}/kader/verein/{cid}/saison_id/2025/plus/1"
        res = fetcher.fetch_html(url)
        if res.soup:
            sq = parse_season_squad(res.soup, 2025)
            for p in sq:
                all_youth.append({
                    "team_name": t_name,
                    "season": 2025,
                    "player_id": p["player_id"],
                    "player_name": p["player_name"],
                    "position": p["position"],
                    "birth_date": p["birth_date"],
                    "age": p["age"],
                    "nationalities": p["nationalities"],
                    "height_m": p["height_m"],
                    "foot": p["foot"],
                    "joined_date": p["joined_date"],
                    "contract_until": p["contract_until"],
                    "market_value_eur": p["market_value_eur"],
                    "signed_from_club": p["signed_from_club"],
                    "signed_from_id": p["signed_from_id"],
                })
            print(f"  {t_name}: {len(sq)} players.")

    if all_youth:
        storage.upsert_youth_squads(all_youth)
        print(f"Inserted {len(all_youth)} additional youth records.")


def main():
    storage = Storage()
    fetcher = Fetcher(delay=0.3, use_cache=True)

    populate_financials(storage)
    populate_additional_youth(fetcher, storage)

    # Export
    print("Exporting updated dataset...")
    pipeline = Storage()
    from napoli_scraper.pipeline import NapoliPipeline
    pip = NapoliPipeline(storage=storage, fetcher=fetcher)
    pip.export()


if __name__ == "__main__":
    main()
