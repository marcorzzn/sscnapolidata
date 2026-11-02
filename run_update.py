#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SSC Napoli Automated Incremental / Periodic Update Runner.
Supports:
  - Delta updates: latest fixtures, live squad, active player injuries, market values.
  - Full updates: re-scrapes club essentials, historical staff, all seasons.
  - Scheduled execution: easily triggered via Windows Task Scheduler or cron.

Usage:
    # 1. Standard weekly delta update (fast, updates active season):
    python run_update.py --mode delta

    # 2. Force fresh network requests (ignore cache for dynamic pages):
    python run_update.py --mode delta --fresh

    # 3. Full deep update:
    python run_update.py --mode full
"""

from __future__ import annotations
import argparse
import logging
import os
import sqlite3
import sys
import time
from datetime import datetime
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

sys.stdout.reconfigure(encoding="utf-8")

from napoli_scraper.config import DB_PATH, DIST_DIR, NAPOLI_CLUB_ID, NAPOLI_SLUG, TM_HOST
from napoli_scraper.fetcher import Fetcher
from napoli_scraper.pipeline import NapoliPipeline
from napoli_scraper.storage import Storage
from scripts.fix_and_enrich_db import categorize_injury_uefa, step1_fix_trophies, step2_scrape_historical_staff

log = logging.getLogger("napoli_update")


def get_current_season_year() -> int:
    """
    Computes the start year of the active European football season.
    The football calendar runs from July 1 (month 7) to June 30.
    e.g. November 2026 -> 2026 (representing season 2026/2027).
    e.g. March 2027 -> 2026 (representing season 2026/2027).
    """
    now = datetime.now()
    return now.year if now.month >= 7 else now.year - 1


def run_delta_update(pipeline: NapoliPipeline, current_season: int | None = None, fresh: bool = False):
    """
    Performs an incremental update focused on dynamic data:
    1. Club profile / current market values & ranking
    2. Active season fixtures, scores, match events
    3. Active season squad roster & transfers
    4. Active squad members' clinical injuries & absences
    5. Re-classification of injuries (UEFA taxonomy & is_napoli filter)
    6. Database export to dist/
    """
    if current_season is None:
        current_season = get_current_season_year()

    season_label = f"{current_season}/{current_season + 1}"
    log.info(f"=== Starting DELTA UPDATE for SSC Napoli (Season {season_label} - ID: {current_season}) ===")
    storage = pipeline.storage
    fetcher = pipeline.fetcher

    # If fresh requested, temporarily disable cache for this run
    if fresh:
        fetcher.use_cache = False
        log.info("Fresh mode enabled: bypassing disk cache for updated content.")

    # 1. Update Club Profile
    url_profile = f"https://{pipeline.host}/{pipeline.slug}/datenfakten/verein/{pipeline.club_id}"
    log.info("Checking club profile...")
    res = fetcher.fetch_html(url_profile)
    if res.soup:
        from napoli_scraper.parsers.club import parse_club_profile
        prof = parse_club_profile(res.soup, pipeline.club_id)
        storage.upsert_club_profile(prof)
        log.info(f"Club profile updated: {prof.get('name')}")

    # 2. Update Active Season Squad
    url_squad = f"https://{pipeline.host}/{pipeline.slug}/kader/verein/{pipeline.club_id}/saison_id/{current_season}/plus/1"
    log.info(f"Updating Season {current_season} squad...")
    res_squad = fetcher.fetch_html(url_squad)
    if res_squad.soup:
        from napoli_scraper.parsers.squad import parse_season_squad
        squad_rows = parse_season_squad(res_squad.soup, current_season)
        storage.upsert_season_squad(squad_rows)
        log.info(f"Season {current_season} squad updated: {len(squad_rows)} players.")

    # 3. Update Active Season Transfers
    url_transfers = f"https://{pipeline.host}/{pipeline.slug}/transfers/verein/{pipeline.club_id}/saison_id/{current_season}"
    log.info(f"Checking Season {current_season} transfers...")
    res_tr = fetcher.fetch_html(url_transfers)
    if res_tr.soup:
        from napoli_scraper.parsers.transfers import parse_season_transfers
        tr_rows = parse_season_transfers(res_tr.soup, current_season)
        storage.upsert_season_transfers(tr_rows)
        log.info(f"Season {current_season} transfers updated: {len(tr_rows)} moves.")

    # 4. Update Active Season Fixtures & Results
    url_fixtures = f"https://{pipeline.host}/{pipeline.slug}/spielplan/verein/{pipeline.club_id}/saison_id/{current_season}"
    log.info(f"Updating Season {current_season} fixtures & results...")
    res_fix = fetcher.fetch_html(url_fixtures)
    if res_fix.soup:
        from napoli_scraper.parsers.fixtures import parse_season_fixtures
        fix_rows = parse_season_fixtures(res_fix.soup, current_season)
        storage.upsert_season_fixtures(fix_rows)
        log.info(f"Season {current_season} fixtures updated: {len(fix_rows)} matches.")

    # 5. Update Match Reports for any un-scraped completed fixtures
    log.info("Checking new match reports...")
    pipeline.run_match_reports(limit=15)

    # 6. Update Deep-Dive & Injuries for Current Squad Players
    cur_players = storage.conn.execute(
        "SELECT DISTINCT player_id FROM season_squads WHERE season = ?",
        (current_season,)
    ).fetchall()
    pids = [r[0] for r in cur_players if r[0]]
    log.info(f"Updating injuries and market values for {len(pids)} squad players...")

    for i, pid in enumerate(pids, 1):
        try:
            pipeline.run_player_deep(pid)
        except Exception as e:
            log.warning(f"Error updating player {pid}: {e}")

    # 7. Re-enrich and Classify Injuries
    log.info("Re-evaluating UEFA taxonomy and Napoli-tenure injury filters...")
    with storage.conn:
        # Get squad pairs
        squad_pairs = set(
            storage.conn.execute("SELECT player_id, season FROM season_squads").fetchall()
        )
        squad_seasons_map = set()
        for pid, s in squad_pairs:
            s_short = f"{str(s)[-2:]}/{str(s+1)[-2:]}"
            squad_seasons_map.add((pid, s_short))

        injuries = storage.conn.execute(
            "SELECT id, player_id, season, injury_raw, clubs_affected FROM player_injuries"
        ).fetchall()

        for inj_id, pid, season, raw, clubs in injuries:
            uefa_cat = categorize_injury_uefa(raw)
            is_nap = 1 if (clubs and "napoli" in clubs.lower()) or (
                (not clubs or not clubs.strip()) and (pid, season) in squad_seasons_map
            ) else 0

            storage.conn.execute(
                "UPDATE player_injuries SET uefa_category = ?, is_napoli = ? WHERE id = ?",
                (uefa_cat, is_nap, inj_id)
            )

    # 8. Export freshly updated datasets
    log.info("Exporting updated CSVs, JSON, and ZIP bundle...")
    pipeline.export()
    try:
        from datanapoli.export import export_site_data
        log.info("Synchronizing React web application JSON datasets...")
        export_site_data()
    except Exception as exp_err:
        log.warning(f"Note: Site export warning: {exp_err}")
    log.info("=== DELTA UPDATE COMPLETED SUCCESSFULLY ===")


def main():
    parser = argparse.ArgumentParser(description="SSC Napoli Database Periodic Updater")
    parser.add_argument(
        "--mode",
        choices=["delta", "full", "staff", "export"],
        default="delta",
        help="Update mode (delta=fast weekly, full=all seasons, staff=only staff/trophies, export=only export)",
    )
    curr_season_default = get_current_season_year()
    parser.add_argument(
        "--season",
        type=int,
        default=curr_season_default,
        help=f"Season year to update (default: {curr_season_default} for {curr_season_default}/{curr_season_default + 1})",
    )
    parser.add_argument(
        "--fresh",
        action="store_true",
        help="Bypass disk cache to fetch live web data",
    )
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Verbose logging",
    )
    args = parser.parse_args()

    # Setup logging to both console and logfile
    log_dir = BASE_DIR / "logs"
    log_dir.mkdir(exist_ok=True)
    log_file = log_dir / f"update_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"

    logging.basicConfig(
        level=logging.INFO if not args.verbose else logging.DEBUG,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(log_file, encoding="utf-8"),
        ],
    )

    log.info("=" * 60)
    log.info(f"SSC Napoli Update Engine launched at {datetime.now().isoformat()}")
    log.info(f"Mode: {args.mode} | Season: {args.season} | Fresh: {args.fresh}")
    log.info("=" * 60)

    storage = Storage()
    fetcher = Fetcher(delay=1.0, use_cache=not args.fresh)
    pipeline = NapoliPipeline(storage=storage, fetcher=fetcher)

    try:
        if args.mode == "delta":
            run_delta_update(pipeline, current_season=args.season, fresh=args.fresh)
        elif args.mode == "staff":
            step1_fix_trophies(storage.conn, fetcher)
            step2_scrape_historical_staff(storage.conn, fetcher)
            pipeline.export()
        elif args.mode == "full":
            pipeline.run_club_essentials()
            step1_fix_trophies(storage.conn, fetcher)
            step2_scrape_historical_staff(storage.conn, fetcher)
            pipeline.run_seasons([2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025])
            pipeline.run_match_reports(limit=50)
            pipeline.run_players_deep()
            pipeline.export()
        elif args.mode == "export":
            pipeline.export()

        print(f"\nUpdate logged to: {log_file}")
        return 0
    except Exception as e:
        log.exception(f"Update failed with unhandled exception: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
