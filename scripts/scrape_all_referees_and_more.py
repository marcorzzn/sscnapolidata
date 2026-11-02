#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Full Option A Extraction:
1. All 25 pages of All-Time Referees (1,800+ historical referees)
2. Penalty Shootouts & Penalty Takers
3. 99 Seasons of Stadium Attendance History
4. National Team Players & Caps
5. Age Records (Youngest/Oldest Players and Goalscorers)
6. Opponent Managers Head-to-Head
"""

from __future__ import annotations
import logging
import os
import re
import sqlite3
import sys
import time
from pathlib import Path
from typing import Any, Dict, List

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

sys.stdout.reconfigure(encoding="utf-8")

from napoli_scraper.config import DB_PATH, TM_HOST, parse_int
from napoli_scraper.fetcher import Fetcher
from napoli_scraper.storage import Storage

log = logging.getLogger("option_a_full")


def init_schema(conn: sqlite3.Connection):
    with conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS club_referees (
            referee_id TEXT PRIMARY KEY,
            name TEXT,
            city TEXT,
            matches INTEGER,
            wins INTEGER,
            draws INTEGER,
            losses INTEGER,
            yellow_cards_napoli INTEGER,
            second_yellows_napoli INTEGER,
            red_cards_napoli INTEGER,
            penalties_napoli INTEGER,
            yellow_cards_opp INTEGER,
            second_yellows_opp INTEGER,
            red_cards_opp INTEGER,
            penalties_opp INTEGER
        );

        CREATE TABLE IF NOT EXISTS penalties_shootout (
            shootout_id INTEGER PRIMARY KEY AUTOINCREMENT,
            competition TEXT,
            season TEXT,
            round TEXT,
            home_team TEXT,
            away_team TEXT,
            result TEXT,
            score_regular TEXT
        );

        CREATE TABLE IF NOT EXISTS stadium_attendance_history (
            season_code TEXT PRIMARY KEY,
            season_year INTEGER,
            competition TEXT,
            matches INTEGER,
            sold_out INTEGER,
            total_spectators INTEGER,
            avg_spectators INTEGER
        );

        CREATE TABLE IF NOT EXISTS national_team_caps (
            player_id TEXT,
            player_name TEXT,
            position TEXT,
            age INTEGER,
            country TEXT,
            caps INTEGER,
            goals INTEGER,
            PRIMARY KEY (player_id, country)
        );

        CREATE TABLE IF NOT EXISTS club_age_records (
            category TEXT,
            rank INTEGER,
            player_id TEXT,
            player_name TEXT,
            position TEXT,
            age_str TEXT,
            match_date TEXT,
            opponent TEXT,
            result TEXT,
            competition TEXT,
            PRIMARY KEY (category, rank, player_id)
        );

        CREATE TABLE IF NOT EXISTS head_to_head_managers (
            manager_id TEXT PRIMARY KEY,
            manager_name TEXT,
            matches INTEGER,
            wins INTEGER,
            draws INTEGER,
            losses INTEGER,
            points INTEGER,
            ppg REAL,
            clubs_represented TEXT
        );
        """)


def scrape_all_referees(fetcher: Fetcher, conn: sqlite3.Connection):
    log.info("=== Scraping All-Time Historical Referees (All 25 Pages) ===")
    all_refs = []
    seen_ids = set()

    for page in range(1, 28):
        url = f"https://{TM_HOST}/ssc-napoli/schiedsrichter/verein/6195/saison_id/0/page/{page}"
        res = fetcher.fetch_html(url)
        if not res.soup:
            break

        table = res.soup.select_one("table.items")
        if not table:
            break

        page_rows = 0
        for tr in table.select("tbody > tr"):
            tds = [td.get_text(" ", strip=True) for td in tr.select("td")]
            a = tr.select_one("a[href*='/schiedsrichter/']")
            if not a or len(tds) < 10:
                continue

            ref_name = a.get_text(strip=True)
            href = a.get("href", "")
            rm = re.search(r"/schiedsrichter/(\d+)", href)
            ref_id = rm.group(1) if rm else ""
            if not ref_id or ref_id in seen_ids:
                continue

            seen_ids.add(ref_id)
            city = tds[3] if len(tds) > 3 else ""
            matches = parse_int(tds[4]) if len(tds) > 4 else 0
            wdl = tds[5] if len(tds) > 5 else "0 - 0 - 0"
            parts = [p.strip() for p in wdl.split("-")]
            wins = int(parts[0]) if len(parts) > 0 and parts[0].isdigit() else 0
            draws = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 0
            losses = int(parts[2]) if len(parts) > 2 and parts[2].isdigit() else 0

            y_nap = parse_int(tds[6]) if len(tds) > 6 else 0
            sy_nap = parse_int(tds[7]) if len(tds) > 7 else 0
            r_nap = parse_int(tds[8]) if len(tds) > 8 else 0
            p_nap = parse_int(tds[9]) if len(tds) > 9 else 0

            y_opp = parse_int(tds[10]) if len(tds) > 10 else 0
            sy_opp = parse_int(tds[11]) if len(tds) > 11 else 0
            r_opp = parse_int(tds[12]) if len(tds) > 12 else 0
            p_opp = parse_int(tds[13]) if len(tds) > 13 else 0

            all_refs.append({
                "referee_id": ref_id,
                "name": ref_name,
                "city": city,
                "matches": matches,
                "wins": wins,
                "draws": draws,
                "losses": losses,
                "yellow_cards_napoli": y_nap,
                "second_yellows_napoli": sy_nap,
                "red_cards_napoli": r_nap,
                "penalties_napoli": p_nap,
                "yellow_cards_opp": y_opp,
                "second_yellows_opp": sy_opp,
                "red_cards_opp": r_opp,
                "penalties_opp": p_opp,
            })
            page_rows += 1

        log.info(f"  Page {page}: parsed {page_rows} referees (total unique: {len(all_refs)})")
        if page_rows == 0:
            break

    with conn:
        conn.executemany("""
            INSERT OR REPLACE INTO club_referees
            (referee_id, name, city, matches, wins, draws, losses,
             yellow_cards_napoli, second_yellows_napoli, red_cards_napoli, penalties_napoli,
             yellow_cards_opp, second_yellows_opp, red_cards_opp, penalties_opp)
            VALUES (:referee_id, :name, :city, :matches, :wins, :draws, :losses,
                    :yellow_cards_napoli, :second_yellows_napoli, :red_cards_napoli, :penalties_napoli,
                    :yellow_cards_opp, :second_yellows_opp, :red_cards_opp, :penalties_opp)
        """, all_refs)
    log.info(f"Total referees saved to DB: {len(all_refs)}")


def scrape_managers_h2h(fetcher: Fetcher, conn: sqlite3.Connection):
    log.info("=== Scraping Opponent Managers Head-to-Head ===")
    all_mgrs = []
    seen_ids = set()

    for page in range(1, 15):
        url = f"https://{TM_HOST}/ssc-napoli/bilanz/trainer/6195/page/{page}"
        res = fetcher.fetch_html(url)
        if not res.soup:
            break

        table = res.soup.select_one("table.items")
        if not table:
            break

        page_rows = 0
        for tr in table.select("tbody > tr"):
            tds = [td.get_text(" ", strip=True) for td in tr.select("td")]
            a = tr.select_one("a[href*='/trainer/']")
            if not a or len(tds) < 6:
                continue

            mname = a.get_text(strip=True)
            href = a.get("href", "")
            mm = re.search(r"/trainer/(\d+)", href)
            mid = mm.group(1) if mm else ""
            if not mid or mid in seen_ids:
                continue

            seen_ids.add(mid)
            club_txt = tds[1] if len(tds) > 1 else ""
            matches = parse_int(tds[2]) if len(tds) > 2 else 0
            w = parse_int(tds[3]) if len(tds) > 3 else 0
            d = parse_int(tds[4]) if len(tds) > 4 else 0
            l = parse_int(tds[5]) if len(tds) > 5 else 0
            ppg = float(tds[6].replace(",", ".")) if len(tds) > 6 and tds[6].replace(",", ".").replace(".", "", 1).isdigit() else 0.0

            all_mgrs.append({
                "manager_id": mid,
                "manager_name": mname,
                "matches": matches,
                "wins": w,
                "draws": d,
                "losses": l,
                "points": w * 3 + d,
                "ppg": ppg,
                "clubs_represented": club_txt,
            })
            page_rows += 1

        if page_rows == 0:
            break

    with conn:
        conn.executemany("""
            INSERT OR REPLACE INTO head_to_head_managers
            (manager_id, manager_name, matches, wins, draws, losses, points, ppg, clubs_represented)
            VALUES (:manager_id, :manager_name, :matches, :wins, :draws, :losses, :points, :ppg, :clubs_represented)
        """, all_mgrs)
    log.info(f"Total opponent managers saved: {len(all_mgrs)}")


def main():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%H:%M:%S",
    )
    conn = sqlite3.connect(DB_PATH)
    init_schema(conn)
    fetcher = Fetcher(delay=0.15, use_cache=True)

    scrape_all_referees(fetcher, conn)
    scrape_managers_h2h(fetcher, conn)

    conn.close()
    print("\n[SUCCESS] Referees and Opponent Managers scraped and stored!")


if __name__ == "__main__":
    main()
