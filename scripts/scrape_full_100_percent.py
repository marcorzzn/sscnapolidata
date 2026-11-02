#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SSC Napoli 100% Comprehensive Scraper Engine.
Covers:
  - Phase 1: Historical seasons expansion (1986, 1989 + 2000-2017: squads, transfers, fixtures, staff)
  - Phase 2: All match reports (match events: goals, assists, cards, subs)
  - Phase 3: All pending player deep-dives (profiles, clinical injuries, market values)
  - Phase 4: UEFA taxonomy & Napoli-tenure injury re-classification
  - Phase 5: Final dataset export to CSV, JSON, ZIP
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
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

sys.stdout.reconfigure(encoding="utf-8")

from napoli_scraper.config import DB_PATH, DIST_DIR, NAPOLI_CLUB_ID, NAPOLI_SLUG, TM_HOST
from napoli_scraper.fetcher import Fetcher
from napoli_scraper.pipeline import NapoliPipeline
from napoli_scraper.storage import Storage
from scripts.fix_and_enrich_db import categorize_injury_uefa

log = logging.getLogger("napoli_full_100")


def phase1_expand_seasons(pipeline: NapoliPipeline, seasons: list[int]):
    log.info(f"=== Phase 1: Expanding Historical Seasons ({len(seasons)} seasons) ===")
    storage = pipeline.storage
    fetcher = pipeline.fetcher

    for i, s in enumerate(seasons, 1):
        if storage.is_task_completed("season", str(s)):
            log.info(f"[{i}/{len(seasons)}] Season {s} already completed, skipping.")
            continue

        log.info(f"[{i}/{len(seasons)}] Scraping historical season {s}...")
        try:
            pipeline.run_season(s)
        except Exception as e:
            log.warning(f"Error scraping season {s}: {e}")

    # Map staff for all seasons from staff_history
    log.info("Mapping historical staff for all expanded seasons...")
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


def phase2_match_reports(pipeline: NapoliPipeline, max_reports: int | None = None):
    log.info("=== Phase 2: Scraping Match Reports for All Fixtures ===")
    storage = pipeline.storage
    pending = storage.get_pending_match_ids()
    if max_reports:
        pending = pending[:max_reports]
    log.info(f"Total pending match reports: {len(pending)}")

    for i, mid in enumerate(pending, 1):
        if storage.is_task_completed("match_report", mid):
            continue
        if i % 25 == 0 or i == 1 or i == len(pending):
            log.info(f"[{i}/{len(pending)}] Scraping match report {mid}...")
        try:
            url = f"https://{pipeline.host}/spielbericht/index/spielbericht/{mid}"
            res = pipeline.fetcher.fetch_html(url)
            if res.soup:
                from napoli_scraper.parsers.fixtures import parse_match_report
                events = parse_match_report(res.soup, mid)
                if events:
                    storage.upsert_match_events(events)
                storage.mark_task("match_report", mid, "completed")
            elif res.status == 404:
                storage.mark_task("match_report", mid, "not_found")
            else:
                storage.mark_task("match_report", mid, "failed")
        except Exception as e:
            log.warning(f"Error on match {mid}: {e}")
            storage.mark_task("match_report", mid, "failed", str(e))


def phase3_player_deep_dives(pipeline: NapoliPipeline, max_players: int | None = None):
    log.info("=== Phase 3: Scraping Deep-Dive for All Pending Players ===")
    storage = pipeline.storage
    pending = storage.get_pending_player_ids()
    if max_players:
        pending = pending[:max_players]
    log.info(f"Total pending players to scrape: {len(pending)}")

    for i, pid in enumerate(pending, 1):
        if storage.is_task_completed("player_deep", pid):
            continue
        if i % 10 == 0 or i == 1 or i == len(pending):
            log.info(f"[{i}/{len(pending)}] Deep-dive player ID {pid}...")
        try:
            pipeline.run_player_deep(pid)
        except Exception as e:
            log.warning(f"Error on player {pid}: {e}")
            storage.mark_task("player_deep", pid, "failed", str(e))


def phase4_reclassify_injuries(storage: Storage):
    log.info("=== Phase 4: Normalizing and Classifying All Injuries ===")
    with storage.conn:
        squad_pairs = set(storage.conn.execute("SELECT player_id, season FROM season_squads").fetchall())
        squad_seasons_map = set()
        for p, s in squad_pairs:
            s_short = f"{str(s)[-2:]}/{str(s+1)[-2:]}"
            squad_seasons_map.add((p, s_short))

        injuries = storage.conn.execute("SELECT id, player_id, season, injury_raw, clubs_affected FROM player_injuries").fetchall()
        log.info(f"Classifying {len(injuries)} total injury records...")
        napoli_count = 0
        for inj_id, pid, season, raw, clubs in injuries:
            uefa_cat = categorize_injury_uefa(raw)
            is_nap = 1 if (clubs and "napoli" in clubs.lower()) or (
                (not clubs or not clubs.strip()) and (pid, season) in squad_seasons_map
            ) else 0
            if is_nap == 1:
                napoli_count += 1
            storage.conn.execute(
                "UPDATE player_injuries SET uefa_category = ?, is_napoli = ? WHERE id = ?",
                (uefa_cat, is_nap, inj_id)
            )
        log.info(f"Classification completed: {napoli_count} injuries confirmed as SSC Napoli tenure.")


def main():
    parser = argparse.ArgumentParser(description="SSC Napoli 100% Comprehensive Collection Runner")
    parser.add_argument("--skip-seasons", action="store_true", help="Skip historical seasons expansion")
    parser.add_argument("--skip-matches", action="store_true", help="Skip match reports scraping")
    parser.add_argument("--skip-players", action="store_true", help="Skip player deep dives")
    parser.add_argument("--match-limit", type=int, default=None, help="Limit number of match reports")
    parser.add_argument("--player-limit", type=int, default=None, help="Limit number of players")
    parser.add_argument("--delay", type=float, default=0.5, help="HTTP delay in seconds (default 0.5)")
    args = parser.parse_args()

    log_dir = BASE_DIR / "logs"
    log_dir.mkdir(exist_ok=True)
    log_file = log_dir / f"scrape_100_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%H:%M:%S",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(log_file, encoding="utf-8"),
        ],
    )

    log.info("============================================================")
    log.info("LAUNCHING 100% SSC NAPOLI ENCYCLOPEDIA COLLECTION")
    log.info("============================================================")

    storage = Storage()
    fetcher = Fetcher(delay=args.delay, use_cache=True)
    pipeline = NapoliPipeline(storage=storage, fetcher=fetcher)

    # 1. Historical Seasons expansion (Maradona Scudetti + 2000-2017)
    if not args.skip_seasons:
        historical_seasons = [1986, 1989] + list(range(2000, 2018))
        phase1_expand_seasons(pipeline, historical_seasons)

    # 2. Match Reports
    if not args.skip_matches:
        phase2_match_reports(pipeline, max_reports=args.match_limit)

    # 3. Player Deep-Dives
    if not args.skip_players:
        phase3_player_deep_dives(pipeline, max_players=args.player_limit)

    # 4. Injury Re-classification
    phase4_reclassify_injuries(storage)

    # 5. Export Final Consolidated Dataset
    log.info("=== Phase 5: Exporting Final 100% Dataset ===")
    pipeline.export()

    log.info("============================================================")
    log.info("100% COLLECTION PIPELINE COMPLETED")
    log.info(f"Log written to: {log_file}")
    log.info("============================================================")


if __name__ == "__main__":
    main()
