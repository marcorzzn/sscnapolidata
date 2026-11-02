#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
High-Performance Match Lineups Parser for SSC Napoli.
Reads all cached match reports from .cache/napoli,
extracts Starters (Starting XI), Substitutes (Bench), Captains, and Positions
for both Napoli and opponents, and inserts them into SQLite table `match_lineups`.
"""

from __future__ import annotations
import gzip
import logging
import os
import re
import sqlite3
import sys
import time
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path
from typing import Any, Dict, List, Optional
import bs4

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

sys.stdout.reconfigure(encoding="utf-8")

from napoli_scraper.config import DB_PATH, CACHE_DIR, parse_int
from napoli_scraper.storage import Storage

log = logging.getLogger("match_lineups")


def parse_lineups_from_html(file_path: str) -> List[Dict[str, Any]]:
    """Parse starters and bench from a single cached match report."""
    try:
        with gzip.open(file_path, "rb") as gz:
            raw = gz.read().decode("utf-8", errors="ignore")
    except Exception:
        return []

    if "spielbericht" not in raw.lower():
        return []
    if "formation-player-container" not in raw and "ersatzbank" not in raw and "aufstellung-box" not in raw:
        return []

    soup = bs4.BeautifulSoup(raw, "lxml")

    # 1. Match ID
    m_url = soup.find("link", rel="canonical")
    url = m_url.get("href", "") if m_url else ""
    mid_m = re.search(r"/spielbericht/(\d+)", url)
    if not mid_m:
        mid_m = re.search(r"spielbericht/(\d+)", raw[:2500])
    if not mid_m:
        return []
    mid = mid_m.group(1)

    # 2. Teams
    teams = soup.select(".sb-vereinslink")
    home_name = teams[0].get_text(strip=True) if len(teams) > 0 else "Home"
    away_name = teams[1].get_text(strip=True) if len(teams) > 1 else "Away"

    is_napoli_home = 1 if "napoli" in home_name.lower() else 0
    is_napoli_away = 1 if "napoli" in away_name.lower() else 0

    box = soup.select_one(".aufstellung-box")
    if not box:
        return []

    records = []

    # Format A: Pitch sides (.large-7.aufstellung-vereinsseite)
    pitch_sides = box.select("div.large-7.aufstellung-vereinsseite")
    if len(pitch_sides) >= 2:
        # Home starters
        for p in pitch_sides[0].select(".formation-player-container"):
            rec = extract_starter(p, mid, home_name, is_napoli_home)
            if rec: records.append(rec)
        # Away starters
        for p in pitch_sides[1].select(".formation-player-container"):
            rec = extract_starter(p, mid, away_name, is_napoli_away)
            if rec: records.append(rec)
    elif len(pitch_sides) == 1:
        for p in pitch_sides[0].select(".formation-player-container"):
            rec = extract_starter(p, mid, home_name if is_napoli_home else away_name, 1 if (is_napoli_home or is_napoli_away) else 0)
            if rec: records.append(rec)

    # Format B: Bench tables (table.ersatzbank)
    bench_tables = box.select("table.ersatzbank")
    if len(bench_tables) >= 2:
        for tr in bench_tables[0].select("tr"):
            rec = extract_bench(tr, mid, home_name, is_napoli_home)
            if rec: records.append(rec)
        for tr in bench_tables[1].select("tr"):
            rec = extract_bench(tr, mid, away_name, is_napoli_away)
            if rec: records.append(rec)
    elif len(bench_tables) == 1:
        for tr in bench_tables[0].select("tr"):
            rec = extract_bench(tr, mid, home_name if is_napoli_home else away_name, 1 if (is_napoli_home or is_napoli_away) else 0)
            if rec: records.append(rec)

    return records


def extract_starter(elem: bs4.element.Tag, match_id: str, team_name: str, is_napoli: int) -> Optional[Dict[str, Any]]:
    a = elem.find("a", href=lambda h: h and "/spieler/" in h)
    if not a:
        return None
    pname = a.get_text(strip=True)
    m = re.search(r"/spieler/(\d+)", a.get("href", ""))
    pid = m.group(1) if m else ""
    if not pid:
        return None

    num_el = elem.select_one(".tm-shirt-number")
    num = parse_int(num_el.get_text(strip=True)) if num_el else None
    pos_el = elem.select_one(".formation-subtitle")
    pos = pos_el.get_text(strip=True) if pos_el else ""
    is_cap = 1 if elem.select_one(".kapitaenicon-formation") else 0

    return {
        "match_id": match_id,
        "team_name": team_name,
        "is_napoli": is_napoli,
        "player_id": pid,
        "player_name": pname,
        "shirt_number": num,
        "position": pos,
        "lineup_role": "starter",
        "is_captain": is_cap,
    }


def extract_bench(tr: bs4.element.Tag, match_id: str, team_name: str, is_napoli: int) -> Optional[Dict[str, Any]]:
    a = tr.find("a", href=lambda h: h and "/spieler/" in h)
    if not a:
        return None
    pname = a.get_text(strip=True)
    m = re.search(r"/spieler/(\d+)", a.get("href", ""))
    pid = m.group(1) if m else ""
    if not pid:
        return None

    tds = [td.get_text(strip=True) for td in tr.select("td")]
    num = None
    pos = ""
    for td in tds:
        if td.isdigit():
            num = int(td)
        elif len(td) <= 4 and td.isupper():
            pos = td

    is_cap = 1 if tr.select_one(".kapitaenicon") else 0

    return {
        "match_id": match_id,
        "team_name": team_name,
        "is_napoli": is_napoli,
        "player_id": pid,
        "player_name": pname,
        "shirt_number": num,
        "position": pos,
        "lineup_role": "bench",
        "is_captain": is_cap,
    }


def populate_all_lineups():
    log_dir = BASE_DIR / "logs"
    log_dir.mkdir(exist_ok=True)
    log_file = log_dir / f"match_lineups_{int(time.time())}.log"

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%H:%M:%S",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(log_file, encoding="utf-8"),
        ],
    )

    conn = sqlite3.connect(DB_PATH)
    with conn:
        conn.execute("""
        CREATE TABLE IF NOT EXISTS match_lineups (
            match_id TEXT,
            team_name TEXT,
            is_napoli INTEGER,
            player_id TEXT,
            player_name TEXT,
            shirt_number INTEGER,
            position TEXT,
            lineup_role TEXT,
            is_captain INTEGER,
            PRIMARY KEY (match_id, player_id, lineup_role)
        );
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_lineups_match ON match_lineups(match_id);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_lineups_player ON match_lineups(player_id);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_lineups_napoli ON match_lineups(is_napoli);")

    cache_dir = Path(CACHE_DIR)
    all_files = [str(cache_dir / f) for f in os.listdir(cache_dir) if f.endswith(".html.gz")]
    log.info(f"Scanning {len(all_files)} cached files for match lineups...")

    total_records = 0
    batch_records = []
    start_time = time.time()
    matches_with_lineups = 0

    for i, fpath in enumerate(all_files, 1):
        recs = parse_lineups_from_html(fpath)
        if recs:
            batch_records.extend(recs)
            matches_with_lineups += 1

        if len(batch_records) >= 5000 or i == len(all_files):
            if batch_records:
                with conn:
                    conn.executemany("""
                        INSERT OR REPLACE INTO match_lineups
                        (match_id, team_name, is_napoli, player_id, player_name, shirt_number, position, lineup_role, is_captain)
                        VALUES (:match_id, :team_name, :is_napoli, :player_id, :player_name, :shirt_number, :position, :lineup_role, :is_captain)
                    """, batch_records)
                total_records += len(batch_records)
                batch_records.clear()

        if i % 500 == 0 or i == len(all_files):
            elapsed = time.time() - start_time
            log.info(f"[{i}/{len(all_files)}] files scanned | {matches_with_lineups} matches parsed | {total_records} lineups stored ({elapsed:.1f}s)")

    conn.close()
    log.info("=" * 60)
    log.info(f"MATCH LINEUPS EXTRACTION COMPLETED!")
    log.info(f"Total lineups stored: {total_records} across {matches_with_lineups} matches.")
    log.info(f"Elapsed time: {time.time()-start_time:.1f}s")
    log.info("=" * 60)


if __name__ == "__main__":
    populate_all_lineups()
