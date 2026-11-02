#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Option A Statistical Expansion Engine for SSC Napoli.
Scrapes and populates:
1. club_referees (All referees, appearances, W/D/L, yellow/red cards, penalties for/against)
2. penalties_shootout (All historical penalty shootouts)
3. stadium_attendance_history (99 seasons of spectator attendance, averages, sell-outs)
4. national_team_caps (All Napoli players who represented national teams)
5. club_age_records (Youngest & oldest players and goalscorers all-time)
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

log = logging.getLogger("option_a_stats")


def init_option_a_schema(conn: sqlite3.Connection):
    """Create tables for Option A statistical dimensions."""
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
        """)


def scrape_referees(fetcher: Fetcher, conn: sqlite3.Connection):
    log.info("=== Scraping Club Referees History ===")
    url = f"https://{TM_HOST}/ssc-napoli/schiedsrichter/verein/6195"
    res = fetcher.fetch_html(url)
    if not res.soup:
        log.warning("Could not fetch referees page.")
        return

    table = res.soup.select_one("table.items")
    if not table:
        return

    rows = []
    for tr in table.select("tbody > tr"):
        tds = [td.get_text(" ", strip=True) for td in tr.select("td")]
        a = tr.select_one("a[href*='/schiedsrichter/']")
        if not a or len(tds) < 10:
            continue

        ref_name = a.get_text(strip=True)
        href = a.get("href", "")
        rm = re.search(r"/schiedsrichter/(\d+)", href)
        ref_id = rm.group(1) if rm else ""
        if not ref_id:
            continue

        # In table: tds[3] = city, tds[4] = matches, tds[5] = W - D - L
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

        rows.append({
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

    with conn:
        conn.executemany("""
            INSERT OR REPLACE INTO club_referees
            (referee_id, name, city, matches, wins, draws, losses,
             yellow_cards_napoli, second_yellows_napoli, red_cards_napoli, penalties_napoli,
             yellow_cards_opp, second_yellows_opp, red_cards_opp, penalties_opp)
            VALUES (:referee_id, :name, :city, :matches, :wins, :draws, :losses,
                    :yellow_cards_napoli, :second_yellows_napoli, :red_cards_napoli, :penalties_napoli,
                    :yellow_cards_opp, :second_yellows_opp, :red_cards_opp, :penalties_opp)
        """, rows)
    log.info(f"Stored {len(rows)} referees.")


def scrape_shootouts(fetcher: Fetcher, conn: sqlite3.Connection):
    log.info("=== Scraping Penalty Shootouts ===")
    url = f"https://{TM_HOST}/ssc-napoli/elfmeterschiessen/verein/6195"
    res = fetcher.fetch_html(url)
    if not res.soup:
        return

    table = res.soup.select_one("table.items")
    if not table:
        return

    rows = []
    for tr in table.select("tbody > tr"):
        tds = [td.get_text(" ", strip=True) for td in tr.select("td")]
        if len(tds) < 8:
            continue

        comp = tds[0] or tds[2]
        season = tds[3]
        round_name = tds[4]
        home_team = tds[5]
        res_str = tds[7]
        away_team = tds[9] if len(tds) > 9 else ""

        rows.append({
            "competition": comp,
            "season": season,
            "round": round_name,
            "home_team": home_team,
            "away_team": away_team,
            "result": res_str,
            "score_regular": "",
        })

    with conn:
        conn.execute("DELETE FROM penalties_shootout")
        conn.executemany("""
            INSERT INTO penalties_shootout
            (competition, season, round, home_team, away_team, result, score_regular)
            VALUES (:competition, :season, :round, :home_team, :away_team, :result, :score_regular)
        """, rows)
    log.info(f"Stored {len(rows)} penalty shootouts.")


def scrape_attendance(fetcher: Fetcher, conn: sqlite3.Connection):
    log.info("=== Scraping Stadium Attendance History ===")
    url = f"https://{TM_HOST}/ssc-napoli/besucherzahlenentwicklung/verein/6195"
    res = fetcher.fetch_html(url)
    if not res.soup:
        return

    table = res.soup.select_one("table.items")
    if not table:
        return

    rows = []
    for tr in table.select("tbody > tr"):
        tds = [td.get_text(" ", strip=True) for td in tr.select("td")]
        if len(tds) < 6:
            continue

        scode = tds[0]
        # parse season year e.g. '24/25' -> 2024
        s_m = re.match(r"(\d{2})/(\d{2})", scode)
        s_year = None
        if s_m:
            y_first = int(s_m.group(1))
            s_year = (1900 + y_first) if y_first > 26 else (2000 + y_first)

        comp = tds[1]
        matches = parse_int(tds[2])
        sold_out = parse_int(tds[3])
        total_spec = parse_int(tds[4].replace(",", "").replace(".", ""))
        avg_spec = parse_int(tds[5].replace(",", "").replace(".", ""))

        rows.append({
            "season_code": scode,
            "season_year": s_year,
            "competition": comp,
            "matches": matches,
            "sold_out": sold_out,
            "total_spectators": total_spec,
            "avg_spectators": avg_spec,
        })

    with conn:
        conn.executemany("""
            INSERT OR REPLACE INTO stadium_attendance_history
            (season_code, season_year, competition, matches, sold_out, total_spectators, avg_spectators)
            VALUES (:season_code, :season_year, :competition, :matches, :sold_out, :total_spectators, :avg_spectators)
        """, rows)
    log.info(f"Stored {len(rows)} seasons of attendance history.")


def scrape_national_team(fetcher: Fetcher, conn: sqlite3.Connection):
    log.info("=== Scraping National Team Players ===")
    url = f"https://{TM_HOST}/ssc-napoli/nationalspieler/verein/6195"
    res = fetcher.fetch_html(url)
    if not res.soup:
        return

    table = res.soup.select_one("table.items")
    if not table:
        return

    rows = []
    for tr in table.select("tbody > tr"):
        tds = [td.get_text(" ", strip=True) for td in tr.select("td")]
        a = tr.select_one("a[href*='/spieler/']")
        if not a or len(tds) < 6:
            continue

        pname = a.get_text(strip=True)
        pm = re.search(r"/spieler/(\d+)", a.get("href", ""))
        pid = pm.group(1) if pm else ""
        if not pid:
            continue

        pos = tds[3] if len(tds) > 3 else ""
        age = parse_int(tds[4]) if len(tds) > 4 else None
        country = tds[5] if len(tds) > 5 else ""
        caps = parse_int(tds[6]) if len(tds) > 6 else 0
        goals = parse_int(tds[7]) if len(tds) > 7 else 0

        rows.append({
            "player_id": pid,
            "player_name": pname,
            "position": pos,
            "age": age,
            "country": country,
            "caps": caps,
            "goals": goals,
        })

    with conn:
        conn.executemany("""
            INSERT OR REPLACE INTO national_team_caps
            (player_id, player_name, position, age, country, caps, goals)
            VALUES (:player_id, :player_name, :position, :age, :country, :caps, :goals)
        """, rows)
    log.info(f"Stored {len(rows)} national team player caps records.")


def scrape_age_records(fetcher: Fetcher, conn: sqlite3.Connection):
    log.info("=== Scraping Age Records (Youngest & Oldest Players and Scorers) ===")
    
    # 1. Youngest & Oldest appearances
    r_apps = fetcher.fetch_html(f"https://{TM_HOST}/ssc-napoli/juengsteaelteste/verein/6195")
    all_rows = []
    if r_apps.soup:
        for b in r_apps.soup.select("div.box"):
            h2 = b.select_one("h2")
            if not h2: continue
            title = h2.get_text(strip=True).lower()
            cat = None
            if "youngest" in title:
                cat = "youngest_player"
            elif "oldest" in title:
                cat = "oldest_player"
            if not cat: continue

            table = b.select_one("table.items")
            if not table: continue
            for tr in table.select("tbody > tr"):
                tds = [td.get_text(" ", strip=True) for td in tr.select("td")]
                a = tr.select_one("a[href*='/spieler/']")
                if not a or len(tds) < 8: continue
                pm = re.search(r"/spieler/(\d+)", a.get("href", ""))
                pid = pm.group(1) if pm else ""
                rank = parse_int(tds[0])
                pname = a.get_text(strip=True)
                pos = tds[4] if len(tds) > 4 else ""
                mdate = tds[6] if len(tds) > 6 else ""
                res_txt = tds[8] if len(tds) > 8 else ""
                age_str = tds[-1] if tds else ""

                all_rows.append({
                    "category": cat,
                    "rank": rank,
                    "player_id": pid,
                    "player_name": pname,
                    "position": pos,
                    "age_str": age_str,
                    "match_date": mdate,
                    "opponent": "",
                    "result": res_txt,
                    "competition": "",
                })

    # 2. Youngest scorers
    r_ysc = fetcher.fetch_html(f"https://{TM_HOST}/ssc-napoli/juengstetorschuetzen/verein/6195")
    if r_ysc.soup:
        table = r_ysc.soup.select_one("table.items")
        if table:
            for tr in table.select("tbody > tr"):
                tds = [td.get_text(" ", strip=True) for td in tr.select("td")]
                a = tr.select_one("a[href*='/spieler/']")
                if not a or len(tds) < 8: continue
                pm = re.search(r"/spieler/(\d+)", a.get("href", ""))
                pid = pm.group(1) if pm else ""
                rank = parse_int(tds[0])
                pname = a.get_text(strip=True)
                pos = tds[4] if len(tds) > 4 else ""
                mdate = tds[6] if len(tds) > 6 else ""
                res_txt = tds[8] if len(tds) > 8 else ""
                age_str = tds[-1] if tds else ""

                all_rows.append({
                    "category": "youngest_goalscorer",
                    "rank": rank,
                    "player_id": pid,
                    "player_name": pname,
                    "position": pos,
                    "age_str": age_str,
                    "match_date": mdate,
                    "opponent": "",
                    "result": res_txt,
                    "competition": "",
                })

    # 3. Oldest scorers
    r_osc = fetcher.fetch_html(f"https://{TM_HOST}/ssc-napoli/aeltestetorschuetzen/verein/6195")
    if r_osc.soup:
        table = r_osc.soup.select_one("table.items")
        if table:
            for tr in table.select("tbody > tr"):
                tds = [td.get_text(" ", strip=True) for td in tr.select("td")]
                a = tr.select_one("a[href*='/spieler/']")
                if not a or len(tds) < 8: continue
                pm = re.search(r"/spieler/(\d+)", a.get("href", ""))
                pid = pm.group(1) if pm else ""
                rank = parse_int(tds[0])
                pname = a.get_text(strip=True)
                pos = tds[4] if len(tds) > 4 else ""
                mdate = tds[6] if len(tds) > 6 else ""
                res_txt = tds[8] if len(tds) > 8 else ""
                age_str = tds[-1] if tds else ""

                all_rows.append({
                    "category": "oldest_goalscorer",
                    "rank": rank,
                    "player_id": pid,
                    "player_name": pname,
                    "position": pos,
                    "age_str": age_str,
                    "match_date": mdate,
                    "opponent": "",
                    "result": res_txt,
                    "competition": "",
                })

    with conn:
        conn.executemany("""
            INSERT OR REPLACE INTO club_age_records
            (category, rank, player_id, player_name, position, age_str, match_date, opponent, result, competition)
            VALUES (:category, :rank, :player_id, :player_name, :position, :age_str, :match_date, :opponent, :result, :competition)
        """, all_rows)
    log.info(f"Stored {len(all_rows)} age record entries across youngest/oldest appearances and goals.")


def main():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%H:%M:%S",
    )
    conn = sqlite3.connect(DB_PATH)
    init_option_a_schema(conn)
    fetcher = Fetcher(delay=0.2, use_cache=True)

    scrape_referees(fetcher, conn)
    scrape_shootouts(fetcher, conn)
    scrape_attendance(fetcher, conn)
    scrape_national_team(fetcher, conn)
    scrape_age_records(fetcher, conn)

    conn.close()
    print("\n[SUCCESS] Option A stats tables populated!")


if __name__ == "__main__":
    main()
