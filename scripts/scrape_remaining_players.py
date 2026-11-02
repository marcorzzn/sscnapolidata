#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Deep-dive scraper for all remaining players in SSC Napoli history.
"""

from __future__ import annotations
import sys
import os
import sqlite3
import time
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

sys.stdout.reconfigure(encoding="utf-8")

from napoli_scraper.config import DB_PATH
from napoli_scraper.fetcher import Fetcher
from napoli_scraper.pipeline import NapoliPipeline
from napoli_scraper.storage import Storage
from scripts.fix_and_enrich_db import categorize_injury_uefa


def main():
    con = sqlite3.connect(DB_PATH)
    all_pids = set(r[0] for r in con.execute("""
        SELECT DISTINCT player_id FROM season_squads WHERE player_id IS NOT NULL AND player_id != ''
        UNION
        SELECT DISTINCT player_id FROM season_transfers WHERE player_id IS NOT NULL AND player_id != ''
        UNION
        SELECT DISTINCT player_id FROM club_shirt_numbers WHERE player_id IS NOT NULL AND player_id != ''
    """).fetchall())

    in_master = set(r[0] for r in con.execute("SELECT player_id FROM players_master").fetchall())
    missing = sorted(list(all_pids - in_master))
    con.close()

    print(f"Total players in history: {len(all_pids)}")
    print(f"Already in players_master: {len(in_master)}")
    print(f"Starting deep-dive scrape for remaining {len(missing)} players...")

    storage = Storage()
    fetcher = Fetcher(delay=0.35, use_cache=True)
    pipeline = NapoliPipeline(storage=storage, fetcher=fetcher)

    success = 0
    for i, pid in enumerate(missing, 1):
        if i % 25 == 0 or i == 1 or i == len(missing):
            print(f"[{i}/{len(missing)}] Scraping deep dive for player ID {pid}...")
        try:
            pipeline.run_player_deep(pid)
            success += 1
        except Exception as e:
            pass

    print(f"\nPlayer deep-dive phase completed! {success}/{len(missing)} scraped.")

    # Re-classify all injuries
    print("Re-classifying injuries with UEFA taxonomy and Napoli tenure...")
    with storage.conn:
        squad_pairs = set(storage.conn.execute("SELECT player_id, season FROM season_squads").fetchall())
        squad_seasons_map = set()
        for p, s in squad_pairs:
            s_short = f"{str(s)[-2:]}/{str(s+1)[-2:]}"
            squad_seasons_map.add((p, s_short))

        injuries = storage.conn.execute("SELECT id, player_id, season, injury_raw, clubs_affected FROM player_injuries WHERE uefa_category IS NULL OR is_napoli IS NULL").fetchall()
        for inj_id, pid, season, raw, clubs in injuries:
            uefa_cat = categorize_injury_uefa(raw)
            is_nap = 1 if (clubs and "napoli" in clubs.lower()) or (
                (not clubs or not clubs.strip()) and (pid, season) in squad_seasons_map
            ) else 0
            storage.conn.execute("UPDATE player_injuries SET uefa_category = ?, is_napoli = ? WHERE id = ?", (uefa_cat, is_nap, inj_id))

    # Export
    print("Exporting updated complete dataset...")
    pipeline.export()


if __name__ == "__main__":
    main()
