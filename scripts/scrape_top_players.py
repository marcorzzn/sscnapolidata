#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Scrapes deep-dive records (Profile, Injuries, Market Values) for top priority Napoli players.
"""

from __future__ import annotations
import sys
import os
import sqlite3
import time

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

sys.stdout.reconfigure(encoding="utf-8")

from napoli_scraper.config import DB_PATH
from napoli_scraper.pipeline import NapoliPipeline
from scripts.fix_and_enrich_db import categorize_injury_uefa

def main(limit: int = 35):
    con = sqlite3.connect(DB_PATH)
    # Get top missing players from 2020-2025 squads ordered by market value
    cur = con.execute("""
        SELECT DISTINCT s.player_id, s.player_name, s.market_value_eur
        FROM season_squads s
        LEFT JOIN players_master m ON s.player_id = m.player_id
        WHERE s.season >= 2020 AND m.player_id IS NULL AND s.player_id IS NOT NULL
        ORDER BY s.season DESC, s.market_value_eur DESC
        LIMIT ?
    """, (limit,))
    targets = cur.fetchall()
    con.close()

    print(f"Starting deep-dive scrape for top {len(targets)} Napoli players...")
    pipeline = NapoliPipeline(delay=0.8, use_cache=True)

    success = 0
    for i, (pid, name, val) in enumerate(targets, 1):
        print(f"[{i}/{len(targets)}] Scraping ID {pid:8} ({name}) - Val: {val} EUR...")
        try:
            pipeline.run_player_deep(pid)
            success += 1
        except Exception as e:
            print(f"  Error on {pid}: {e}")

    print(f"\nDeep-dive completed! {success}/{len(targets)} players scraped successfully.")

    # Re-enrich newly scraped injuries
    print("Re-enriching injuries with UEFA taxonomy and Napoli flags...")
    con = sqlite3.connect(DB_PATH)
    with con:
        squad_pairs = set(con.execute("SELECT player_id, season FROM season_squads").fetchall())
        squad_seasons_map = set()
        for p, s in squad_pairs:
            s_short = f"{str(s)[-2:]}/{str(s+1)[-2:]}"
            squad_seasons_map.add((p, s_short))

        injuries = con.execute("SELECT id, player_id, season, injury_raw, clubs_affected FROM player_injuries WHERE uefa_category IS NULL OR is_napoli IS NULL").fetchall()
        for inj_id, pid, season, raw, clubs in injuries:
            uefa_cat = categorize_injury_uefa(raw)
            is_nap = 1 if (clubs and "napoli" in clubs.lower()) or (
                (not clubs or not clubs.strip()) and (pid, season) in squad_seasons_map
            ) else 0
            con.execute("UPDATE player_injuries SET uefa_category = ?, is_napoli = ? WHERE id = ?", (uefa_cat, is_nap, inj_id))
    con.close()
    print("Enrichment done.")

    # Export updated dataset
    print("Exporting updated dataset...")
    pipeline.export()


if __name__ == "__main__":
    main()
