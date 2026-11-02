#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Scrapes all available historical Youth Squads:
- Napoli Primavera U19 (2004-2025)
- Napoli Under 18 (2017-2025)
- Napoli Under 17 (2012-2025)
"""

import sys
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

sys.stdout.reconfigure(encoding="utf-8")

from napoli_scraper.config import TM_HOST
from napoli_scraper.fetcher import Fetcher
from napoli_scraper.storage import Storage
from napoli_scraper.parsers.squad import parse_season_squad


def scrape_all_youth():
    storage = Storage()
    fetcher = Fetcher(delay=0.25, use_cache=True)

    targets = [
        ("Napoli Primavera U19", "12819", "ssc-neapel-u19", range(2004, 2026)),
        ("Napoli Under 18", "41577", "ssc-neapel-u18", range(2016, 2026)),
        ("Napoli Under 17", "49743", "ssc-neapel-unter-17", range(2012, 2026)),
    ]

    total_added = 0
    for team_name, cid, slug, seasons in targets:
        print(f"\n=== Scraping {team_name} (ID: {cid}) ===")
        for s in seasons:
            # Check if season already in DB
            count = storage.conn.execute(
                "SELECT COUNT(*) FROM youth_squads WHERE team_name = ? AND season = ?",
                (team_name, s)
            ).fetchone()[0]

            if count > 0:
                print(f"  {team_name} Season {s}: already has {count} players in DB, skipping.")
                continue

            url = f"https://{TM_HOST}/{slug}/kader/verein/{cid}/saison_id/{s}/plus/1"
            res = fetcher.fetch_html(url)
            if not res.soup:
                continue

            sq = parse_season_squad(res.soup, s)
            if not sq:
                print(f"  {team_name} Season {s}: 0 players found on page.")
                continue

            rows = []
            for p in sq:
                rows.append({
                    "team_name": team_name,
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

            storage.upsert_youth_squads(rows)
            total_added += len(rows)
            print(f"  {team_name} Season {s}: stored {len(rows)} players.")

    print(f"\n[DONE] Finished youth squads scraping. Total new records added: {total_added}")
    total_in_db = storage.conn.execute("SELECT COUNT(*) FROM youth_squads").fetchone()[0]
    print(f"Total youth records now in DB: {total_in_db}")


if __name__ == "__main__":
    scrape_all_youth()
