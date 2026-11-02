#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fixes and Enriches SSC Napoli Encyclopedia DB:
1. Re-scrapes and updates trophies with authentic titles and competitions.
2. Scrapes full historical staff by role from TM mitarbeiterhistorie, populates staff_history,
   and maps accurate season_staff rosters for all seasons (2018-2026).
3. Adds and populates 'is_napoli' and 'uefa_category' in player_injuries.
"""

from __future__ import annotations
import sys
import os
import re
import sqlite3
from datetime import datetime
from typing import Any, Dict, List

# Add parent directory to sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

sys.stdout.reconfigure(encoding="utf-8")

from napoli_scraper.config import DB_PATH, NAPOLI_CLUB_ID, NAPOLI_SLUG, TM_HOST, parse_date, parse_int
from napoli_scraper.fetcher import Fetcher
from napoli_scraper.parsers.club import parse_staff_history, parse_trophies

def categorize_injury_uefa(raw: str | None) -> str:
    raw_l = (raw or "").lower()
    if any(k in raw_l for k in ["hamstring", "biceps femoris", "flessore", "bicipite femorale"]):
        return "Muscolare: Flessori"
    elif any(k in raw_l for k in ["adductor", "groin", "pubalgia", "adduttore", "inguine"]):
        return "Muscolare: Adduttori/Inguine"
    elif any(k in raw_l for k in ["calf", "soleus", "gastrocnemius", "polpaccio"]):
        return "Muscolare: Polpaccio"
    elif any(k in raw_l for k in ["quadriceps", "rectus femoris", "quadricipite"]):
        return "Muscolare: Quadricipite"
    elif any(k in raw_l for k in ["muscle", "muscular", "thigh", "strain", "fiber", "muscolare", "coscia"]):
        return "Muscolare: Altro/Coscia"
    elif any(k in raw_l for k in ["cruciate", "acl", "mcl", "knee", "meniscus", "ginocchio", "crociato", "collaterale"]):
        return "Articolare: Ginocchio"
    elif any(k in raw_l for k in ["ankle", "foot", "metatarsal", "caviglia", "piede", "distorsione caviglia", "syndesmotic"]):
        return "Articolare: Caviglia/Piede"
    elif any(k in raw_l for k in ["shoulder", "elbow", "wrist", "hand", "spalla", "gomito"]):
        return "Articolare: Spalla/Braccio"
    elif any(k in raw_l for k in ["fracture", "broken", "bone", "facial", "jaw", "frattura", "trauma cranico", "vertebra"]):
        return "Trauma Osseo/Frattura"
    elif any(k in raw_l for k in ["knock", "bruise", "contusion", "dead leg", "contusione", "ematoma", "trauma"]):
        return "Contusione/Trauma Diretto"
    elif any(k in raw_l for k in ["corona", "covid", "flu", "influenza", "fever", "virus", "infection", "ill", "stomach", "gastric", "bronchitis", "faringite"]):
        return "Patologia Medica/Covid/Influenza"
    elif any(k in raw_l for k in ["tendon", "achilles", "patellar", "tendine"]):
        return "Tendinopatia/Tendine"
    elif any(k in raw_l for k in ["lumbago", "back", "schiena", "lombalgia"]):
        return "Rachide/Lombalgia"
    elif any(k in raw_l for k in ["quarantine", "fitness", "rest", "not in squad", "training deficit"]):
        return "Condizionamento/Riposo"
    else:
        return "Altro/Non specificato"


def step1_fix_trophies(con: sqlite3.Connection, fetcher: Fetcher):
    print("=== STEP 1: Updating Trophies & Honours ===")
    url = f"https://{TM_HOST}/{NAPOLI_SLUG}/erfolge/verein/{NAPOLI_CLUB_ID}"
    res = fetcher.fetch_html(url)
    if not res.soup:
        print("Failed to fetch trophies page.")
        return

    trophies = parse_trophies(res.soup)
    print(f"Parsed {len(trophies)} trophies/honours.")

    now_iso = datetime.utcnow().isoformat()
    # Delete old bad records
    with con:
        con.execute("DELETE FROM trophies")
        for t in trophies:
            con.execute(
                """
                INSERT OR REPLACE INTO trophies (competition, title, season, scraped_at)
                VALUES (?, ?, ?, ?)
                """,
                (t["competition"], t["title"], t["season"], now_iso),
            )
    print(f"Successfully inserted {len(trophies)} trophies.")


def step2_scrape_historical_staff(con: sqlite3.Connection, fetcher: Fetcher):
    print("\n=== STEP 2: Scraping Complete Historical Staff by Role ===")

    # Ensure staff_history table exists
    with con:
        con.execute("""
            CREATE TABLE IF NOT EXISTS staff_history (
                staff_id TEXT,
                name TEXT,
                role TEXT,
                birth_date TEXT,
                nationality TEXT,
                appointed_date TEXT,
                end_date TEXT,
                days_in_post INTEGER,
                PRIMARY KEY (staff_id, role, appointed_date)
            )
        """)

    roles_to_scrape = [
        (1, "Manager"),
        (2, "Assistant Manager"),
        (3, "Goalkeeping Coach"),
        (63, "Athletic Coach"),
        (22, "Fitness Coach"),
        (38, "Technical Coach"),
        (146, "Match Analyst"),
        (70, "Video Analyst"),
        (54, "Sporting Director"),
        (46, "Head of Medical"),
        (19, "Club Doctor"),
        (12, "Physiotherapist"),
        (55, "Team Manager"),
    ]

    all_history_records = []
    for role_id, role_name in roles_to_scrape:
        url = f"https://{TM_HOST}/{NAPOLI_SLUG}/mitarbeiterhistorie/verein/{NAPOLI_CLUB_ID}/personalie_id/{role_id}/plus/1"
        res = fetcher.fetch_html(url)
        if res.soup:
            records = parse_staff_history(res.soup, role_name)
            print(f"  Role '{role_name}' (ID {role_id}): {len(records)} staff members found.")
            all_history_records.extend(records)

    # Insert into staff_history
    with con:
        con.execute("DELETE FROM staff_history")
        for r in all_history_records:
            con.execute("""
                INSERT OR REPLACE INTO staff_history
                (staff_id, name, role, birth_date, nationality, appointed_date, end_date, days_in_post)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                r["staff_id"], r["name"], r["role"], r["birth_date"],
                r["nationality"], r["appointed_date"], r["end_date"], r["days_in_post"]
            ))
    print(f"Total staff history records inserted: {len(all_history_records)}")

    # Now populate season_staff accurately for seasons 2018..2025
    print("\nMapping historical staff into season_staff for seasons 2018-2025...")
    seasons = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]
    with con:
        con.execute("DELETE FROM season_staff")
        total_mapped = 0
        for s in seasons:
            s_start = f"{s}-07-01"
            s_end = f"{s+1}-06-30"

            # Staff member was active during season if:
            # appointed_date <= s_end AND (end_date IS NULL OR end_date >= s_start)
            rows = con.execute("""
                SELECT staff_id, name, role, birth_date, nationality, appointed_date, end_date
                FROM staff_history
                WHERE (appointed_date IS NOT NULL AND appointed_date <= ?)
                  AND (end_date IS NULL OR end_date = '' OR end_date >= ?)
            """, (s_end, s_start)).fetchall()

            for row in rows:
                sid, name, role, dob, nat, app, end_d = row
                # Calculate approximate age at season start
                age = None
                if dob:
                    try:
                        birth_yr = int(dob[:4])
                        age = s - birth_yr
                    except Exception:
                        pass

                con.execute("""
                    INSERT OR REPLACE INTO season_staff
                    (season, staff_id, name, role, age, nationality, joined_date, contract_until)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (s, sid, name, role, age, nat, app, end_d))
                total_mapped += 1

            print(f"  Season {s} ({s}/{str(s+1)[-2:]}): {len(rows)} staff members registered.")
    print(f"Total season_staff rows mapped: {total_mapped}")


def step3_refine_injuries(con: sqlite3.Connection):
    print("\n=== STEP 3: Enriching and Filtering Player Injuries ===")

    # Add columns if not present
    existing_cols = [c[1] for c in con.execute("PRAGMA table_info(player_injuries)").fetchall()]
    with con:
        if "is_napoli" not in existing_cols:
            con.execute("ALTER TABLE player_injuries ADD COLUMN is_napoli INTEGER DEFAULT 0")
            print("Added column 'is_napoli'.")
        if "uefa_category" not in existing_cols:
            con.execute("ALTER TABLE player_injuries ADD COLUMN uefa_category TEXT")
            print("Added column 'uefa_category'.")

    # Fetch all squad player-season pairs to know who was in Napoli in which season
    squad_rows = con.execute("SELECT season, player_id FROM season_squads").fetchall()
    napoli_player_seasons = set()
    for s, pid in squad_rows:
        s_short = f"{str(s)[-2:]}/{str(s+1)[-2:]}"  # e.g. 2020 -> 20/21
        napoli_player_seasons.add((pid, s_short))

    # Also map year of injury to season
    # Season 20/21 covers 2020-09-01 to 2021-06-30 etc.
    all_injuries = con.execute("SELECT id, player_id, season, injury_raw, from_date, clubs_affected FROM player_injuries").fetchall()
    print(f"Processing {len(all_injuries)} injury records...")

    updated_count = 0
    napoli_count = 0
    with con:
        for inj_id, pid, season, raw, from_date, clubs in all_injuries:
            uefa_cat = categorize_injury_uefa(raw)

            # Determine if this injury occurred while representing Napoli:
            # 1. Explicitly tagged with Napoli in clubs_affected
            # 2. OR clubs_affected is NULL and the player was part of Napoli squad for that season
            is_napoli = 0
            if clubs and "napoli" in clubs.lower():
                is_napoli = 1
            elif (not clubs or clubs.strip() == "") and (pid, season) in napoli_player_seasons:
                is_napoli = 1

            if is_napoli == 1:
                napoli_count += 1

            con.execute("""
                UPDATE player_injuries
                SET uefa_category = ?, is_napoli = ?
                WHERE id = ?
            """, (uefa_cat, is_napoli, inj_id))
            updated_count += 1

    print(f"Updated {updated_count} injury records. Infortuni Napoli: {napoli_count}.")


def main():
    print("=" * 60)
    print("SSC Napoli Database Enrichment & Bug Fixing Routine")
    print("=" * 60)

    con = sqlite3.connect(DB_PATH)
    fetcher = Fetcher(delay=0.5, use_cache=True)

    try:
        step1_fix_trophies(con, fetcher)
        step2_scrape_historical_staff(con, fetcher)
        step3_refine_injuries(con)
        print("\nAll enrichment steps completed successfully!")
    finally:
        con.close()


if __name__ == "__main__":
    main()
