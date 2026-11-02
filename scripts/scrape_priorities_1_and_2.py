#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SSC Napoli Scraping Engine for Priorities 1 & 2:
  - Priority 2:
      1. Squad Shirt Numbers History (1-99 all-time wearers with seasons)
      2. Record Matches (Highest wins, highest defeats, highest scoring matches)
      3. Youth / Primavera (U19 squads 2023, 2024, 2025)
  - Priority 1:
      4. Complete 68 historical seasons (1926 to 1999) squads, transfers, fixtures, staff mapping
      5. Match reports for fixtures
  - Final Export:
      6. Consolidate into 20 CSV files, master JSON, and ZIP archive
"""

from __future__ import annotations
import argparse
import logging
import os
import re
import sqlite3
import sys
import time
from datetime import datetime
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

sys.stdout.reconfigure(encoding="utf-8")

from napoli_scraper.config import DB_PATH, DIST_DIR, NAPOLI_CLUB_ID, NAPOLI_SLUG, TM_HOST, parse_date, parse_int
from napoli_scraper.fetcher import Fetcher
from napoli_scraper.pipeline import NapoliPipeline
from napoli_scraper.storage import Storage
from napoli_scraper.parsers.squad import parse_season_squad
from napoli_scraper.parsers.transfers import parse_season_transfers
from napoli_scraper.parsers.fixtures import parse_season_fixtures, parse_match_report
from scripts.fix_and_enrich_db import categorize_injury_uefa

log = logging.getLogger("napoli_p1_p2")


# ==============================================================================
# PRIORITY 2 PARSERS & FETCHERS
# ==============================================================================

def scrape_shirt_numbers(fetcher: Fetcher, storage: Storage):
    log.info("=== [Priority 2] Scraping Squad Shirt Numbers History ===")
    url = f"https://{TM_HOST}/{NAPOLI_SLUG}/rueckennummern/verein/{NAPOLI_CLUB_ID}"
    res = fetcher.fetch_html(url)
    if not res.soup:
        log.warning("Could not fetch shirt numbers page.")
        return

    rows = []
    for box in res.soup.select("div.box"):
        table = box.select_one("table")
        if not table:
            continue
        for tr in table.select("tr"):
            td_num = tr.select_one("td.zentriert.hauptlink, td.zentriert.s16")
            if not td_num:
                continue
            num_str = td_num.get_text(strip=True)
            if not num_str.isdigit():
                continue
            num = int(num_str)

            td_players = tr.find_all("td", recursive=False)
            if len(td_players) < 2:
                continue
            cell = td_players[1]

            # 1. Current wearer inside inline-table
            current_a = cell.select_one("table.inline-table a[href*='/spieler/']")
            if current_a:
                pid = re.search(r"/spieler/(\d+)", current_a.get("href", "")).group(1)
                pname = current_a.get_text(strip=True)
                sub_tr = cell.select_one("table.inline-table tr:nth-of-type(2)")
                seasons = sub_tr.get_text(strip=True) if sub_tr else "current"
                rows.append({
                    "shirt_number": num,
                    "player_id": pid,
                    "player_name": pname,
                    "seasons_worn": seasons,
                    "is_current": 1,
                })

            # 2. Historical wearers in div
            hist_div = cell.select_one("div")
            if hist_div:
                for span in hist_div.select("span.hauptlink"):
                    a = span.select_one("a[href*='/spieler/']")
                    if not a:
                        continue
                    href = a.get("href", "")
                    pid_m = re.search(r"/spieler/(\d+)", href)
                    pid = pid_m.group(1) if pid_m else ""
                    pname = a.get_text(strip=True)
                    next_txt = ""
                    nxt = span.next_sibling
                    while nxt and (not hasattr(nxt, "name") or nxt.name != "span"):
                        if isinstance(nxt, str):
                            next_txt += nxt
                        elif hasattr(nxt, "get_text"):
                            next_txt += nxt.get_text()
                        nxt = nxt.next_sibling
                    seasons = next_txt.strip(" ,()\xa0\n\t")
                    rows.append({
                        "shirt_number": num,
                        "player_id": pid,
                        "player_name": pname,
                        "seasons_worn": seasons,
                        "is_current": 0,
                    })

    storage.upsert_club_shirt_numbers(rows)
    log.info(f"Squad shirt numbers stored: {len(rows)} player records across all numbers.")


def scrape_record_matches(fetcher: Fetcher, storage: Storage):
    log.info("=== [Priority 2] Scraping Record Matches & Extremes ===")
    categories = [
        ("highest_wins", f"https://{TM_HOST}/{NAPOLI_SLUG}/rekordspiele/verein/{NAPOLI_CLUB_ID}/sort/differenz.desc"),
        ("highest_defeats", f"https://{TM_HOST}/{NAPOLI_SLUG}/rekordspiele/verein/{NAPOLI_CLUB_ID}/sort/differenz.asc"),
        ("highest_scoring", f"https://{TM_HOST}/{NAPOLI_SLUG}/rekordspiele/verein/{NAPOLI_CLUB_ID}/sort/tore.desc"),
    ]

    all_matches = []
    for cat_name, base_url in categories:
        for page in range(1, 4):  # top 3 pages for each category
            url = f"{base_url}/page/{page}"
            res = fetcher.fetch_html(url)
            if not res.soup:
                break
            table = res.soup.select_one("div.box table.items")
            if not table:
                break

            page_rows = 0
            for tr in table.select("tbody > tr"):
                tds = [td.get_text(" ", strip=True) for td in tr.select("td")]
                if len(tds) < 8:
                    continue
                rank = parse_int(tds[0])
                m_date = parse_date(tds[1]) if len(tds) > 1 else None
                season = tds[2] if len(tds) > 2 else None
                mday = tds[3] if len(tds) > 3 else None
                comp = tds[4] if len(tds) > 4 else None
                venue = tds[7] if len(tds) > 7 else None
                opp = tds[9] if len(tds) > 9 else (tds[8] if len(tds) > 8 else "")
                att = tds[10] if len(tds) > 10 else None
                res_txt = tds[-1] if tds else None

                all_matches.append({
                    "category": cat_name,
                    "rank": rank,
                    "match_date": m_date or tds[1],
                    "season": season,
                    "matchday": mday,
                    "competition": comp,
                    "venue": venue,
                    "opponent": opp,
                    "attendance": att,
                    "result": res_txt,
                })
                page_rows += 1

            if page_rows == 0:
                break

    storage.upsert_club_record_matches(all_matches)
    log.info(f"Record matches stored: {len(all_matches)} records across highest wins, defeats, scoring.")


def scrape_youth_squads(fetcher: Fetcher, storage: Storage):
    log.info("=== [Priority 2] Scraping Napoli Primavera U19 Squads ===")
    u19_club_id = "12819"
    u19_slug = "ssc-neapel-u19"
    seasons = [2023, 2024, 2025]

    all_youth = []
    for s in seasons:
        url = f"https://{TM_HOST}/{u19_slug}/kader/verein/{u19_club_id}/saison_id/{s}/plus/1"
        res = fetcher.fetch_html(url)
        if res.soup:
            squad = parse_season_squad(res.soup, s)
            for p in squad:
                all_youth.append({
                    "team_name": "Napoli Primavera U19",
                    "season": s,
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
            log.info(f"Primavera U19 Season {s}: {len(squad)} players.")

    storage.upsert_youth_squads(all_youth)
    log.info(f"Total youth/Primavera records stored: {len(all_youth)}.")


# ==============================================================================
# PRIORITY 1: ALL 68 HISTORICAL SEASONS (1926 - 1999)
# ==============================================================================

def scrape_historical_seasons_1926_1999(pipeline: NapoliPipeline):
    log.info("=== [Priority 1] Scraping All Remaining Historical Seasons (1926-1999) ===")
    storage = pipeline.storage
    fetcher = pipeline.fetcher

    existing_cur = storage.conn.execute("SELECT DISTINCT season FROM season_squads").fetchall()
    existing_seasons = set(r[0] for r in existing_cur)

    # 1926 through 1999, omitting 1943-1945 (WWII suspension)
    target_seasons = [y for y in range(1926, 2000) if y not in (1943, 1944, 1945) and y not in existing_seasons]
    log.info(f"Seasons to scrape: {len(target_seasons)} historical seasons.")

    for i, s in enumerate(target_seasons, 1):
        if storage.is_task_completed("season", str(s)):
            continue
        log.info(f"[{i}/{len(target_seasons)}] Scraping historical season {s}...")
        try:
            # 1. Squad
            url_squad = f"https://{pipeline.host}/{pipeline.slug}/kader/verein/{pipeline.club_id}/saison_id/{s}/plus/1"
            res_squad = fetcher.fetch_html(url_squad)
            if res_squad.soup:
                sq_rows = parse_season_squad(res_squad.soup, s)
                if sq_rows:
                    storage.upsert_season_squad(sq_rows)

            # 2. Transfers
            url_transfers = f"https://{pipeline.host}/{pipeline.slug}/transfers/verein/{pipeline.club_id}/saison_id/{s}"
            res_tr = fetcher.fetch_html(url_transfers)
            if res_tr.soup:
                tr_rows = parse_season_transfers(res_tr.soup, s)
                if tr_rows:
                    storage.upsert_season_transfers(tr_rows)

            # 3. Fixtures
            url_fixtures = f"https://{pipeline.host}/{pipeline.slug}/spielplan/verein/{pipeline.club_id}/saison_id/{s}"
            res_fix = fetcher.fetch_html(url_fixtures)
            if res_fix.soup:
                fix_rows = parse_season_fixtures(res_fix.soup, s)
                if fix_rows:
                    storage.upsert_season_fixtures(fix_rows)

            storage.mark_task("season", str(s), "completed")
        except Exception as e:
            log.warning(f"Error on season {s}: {e}")
            storage.mark_task("season", str(s), "failed", str(e))

    # Map staff for all seasons
    log.info("Mapping historical staff from staff_history across all 1926-2026 seasons...")
    with storage.conn:
        all_seasons_cur = storage.conn.execute("SELECT DISTINCT season FROM season_squads ORDER BY season").fetchall()
        all_seasons = [r[0] for r in all_seasons_cur]
        for s in all_seasons:
            s_start = f"{s}-07-01"
            s_end = f"{s+1}-06-30"
            rows = storage.conn.execute("""
                SELECT staff_id, name, role, birth_date, nationality, appointed_date, end_date
                FROM staff_history
                WHERE (appointed_date IS NOT NULL AND appointed_date <= ?)
                  AND (end_date IS NULL OR end_date = '' OR end_date >= ?)
            """, (s_end, s_start)).fetchall()

            for row in rows:
                sid, name, role, dob, nat, app, end_d = row
                age = None
                if dob:
                    try:
                        age = s - int(dob[:4])
                    except Exception:
                        pass
                storage.conn.execute("""
                    INSERT OR REPLACE INTO season_staff
                    (season, staff_id, name, role, age, nationality, joined_date, contract_until)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (s, sid, name, role, age, nat, app, end_d))


def scrape_all_pending_match_reports(pipeline: NapoliPipeline, max_limit: int | None = None):
    log.info("=== Scraping match reports for pending fixtures ===")
    storage = pipeline.storage
    pending = storage.get_pending_match_ids()
    if max_limit:
        pending = pending[:max_limit]
    log.info(f"Pending match reports: {len(pending)}")

    for i, mid in enumerate(pending, 1):
        if storage.is_task_completed("match_report", mid):
            continue
        if i % 50 == 0 or i == 1 or i == len(pending):
            log.info(f"[{i}/{len(pending)}] Match report {mid}...")
        try:
            url = f"https://{pipeline.host}/spielbericht/index/spielbericht/{mid}"
            res = pipeline.fetcher.fetch_html(url)
            if res.soup:
                events = parse_match_report(res.soup, mid)
                if events:
                    storage.upsert_match_events(events)
                storage.mark_task("match_report", mid, "completed")
            elif res.status == 404:
                storage.mark_task("match_report", mid, "not_found")
            else:
                storage.mark_task("match_report", mid, "failed")
        except Exception as e:
            storage.mark_task("match_report", mid, "failed", str(e))


def main():
    log_dir = BASE_DIR / "logs"
    log_dir.mkdir(exist_ok=True)
    log_file = log_dir / f"scrape_p1_p2_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%H:%M:%S",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(log_file, encoding="utf-8"),
        ],
    )

    log.info("=" * 60)
    log.info("STARTING EXECUTION: PRIORITIES 1 & 2 FOR SSC NAPOLI")
    log.info("=" * 60)

    storage = Storage()
    fetcher = Fetcher(delay=0.35, use_cache=True)
    pipeline = NapoliPipeline(storage=storage, fetcher=fetcher)

    # 1. PRIORITY 2: Shirt numbers, record matches, youth squad
    scrape_shirt_numbers(fetcher, storage)
    scrape_record_matches(fetcher, storage)
    scrape_youth_squads(fetcher, storage)

    # 2. PRIORITY 1: All 68 historical seasons (1926-1999)
    scrape_historical_seasons_1926_1999(pipeline)

    # 3. Match reports for any new fixtures
    scrape_all_pending_match_reports(pipeline, max_limit=300)

    # 4. Final Export
    log.info("Exporting complete 20-table dataset...")
    pipeline.export()

    log.info("=" * 60)
    log.info("PRIORITIES 1 & 2 COMPLETED SUCCESSFULLY!")
    log.info(f"Log written to: {log_file}")
    log.info("=" * 60)


if __name__ == "__main__":
    main()
