#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
High-Performance Historical Match Reports Scraping Engine for SSC Napoli.
Fetches all pending match reports (1926-1999) using concurrent workers,
caches raw responses, parses match events (goals, cards, substitutions),
and persists them into SQLite DB.
"""

from __future__ import annotations
import logging
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

sys.stdout.reconfigure(encoding="utf-8")

from napoli_scraper.config import TM_HOST
from napoli_scraper.fetcher import Fetcher
from napoli_scraper.storage import Storage
from napoli_scraper.parsers.fixtures import parse_match_report

log = logging.getLogger("scrape_match_reports")


def process_match(mid: str, url: str) -> tuple[str, str, List[Dict[str, Any]]]:
    """Fetch and parse a single match report. Returns (mid, status, events)."""
    fetcher = Fetcher(delay=0.15, use_cache=True)
    full_url = url if url.startswith("http") else f"https://{TM_HOST}{url}"
    
    res = fetcher.fetch_html(full_url)
    if res.soup:
        events = parse_match_report(res.soup, mid)
        return mid, "completed", events
    elif res.status == 404:
        return mid, "not_found", []
    else:
        return mid, "failed", []


def run_historical_match_reports(max_workers: int = 4, chunk_size: int = 100):
    log_dir = BASE_DIR / "logs"
    log_dir.mkdir(exist_ok=True)
    log_file = log_dir / f"scrape_match_reports_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%H:%M:%S",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(log_file, encoding="utf-8"),
        ],
    )

    storage = Storage()
    
    # Query pending matches
    query = """
        SELECT f.match_id, f.season, f.match_date, f.opponent_name, f.report_url
        FROM season_fixtures f
        LEFT JOIN scrape_progress p ON p.task_type = 'match_report' AND p.task_id = f.match_id
        WHERE (p.status IS NULL OR p.status != 'completed') 
          AND f.report_url IS NOT NULL AND f.report_url != ''
        ORDER BY f.season DESC, f.match_date DESC
    """
    pending_rows = storage.conn.execute(query).fetchall()
    total_pending = len(pending_rows)

    log.info("=" * 65)
    log.info(f"STARTING HISTORICAL MATCH REPORTS EXTRACTION")
    log.info(f"Total pending fixtures to process: {total_pending}")
    log.info(f"Workers: {max_workers} | Rate: ~0.15s delay with gzip cache")
    log.info("=" * 65)

    if total_pending == 0:
        log.info("No pending match reports found! All fixtures already scraped.")
        return

    processed_count = 0
    total_events_added = 0
    start_time = time.time()

    # Process in chunks to manage memory and commit periodically
    for offset in range(0, total_pending, chunk_size):
        chunk = pending_rows[offset : offset + chunk_size]
        chunk_futures = {}

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            for row in chunk:
                mid, season, mdate, opp, url = row
                fut = executor.submit(process_match, mid, url)
                chunk_futures[fut] = (mid, season, mdate, opp)

            batch_events = []
            for fut in as_completed(chunk_futures):
                mid, season, mdate, opp = chunk_futures[fut]
                try:
                    res_mid, status, events = fut.result()
                    if status == "completed":
                        if events:
                            batch_events.extend(events)
                        storage.mark_task("match_report", res_mid, "completed")
                    elif status == "not_found":
                        storage.mark_task("match_report", res_mid, "not_found")
                    else:
                        storage.mark_task("match_report", res_mid, "failed")
                except Exception as exc:
                    log.warning(f"Error processing match {mid}: {exc}")
                    storage.mark_task("match_report", mid, "failed", str(exc))

                processed_count += 1

        # Commit batch events to database
        if batch_events:
            storage.upsert_match_events(batch_events)
            total_events_added += len(batch_events)

        elapsed = time.time() - start_time
        pct = (processed_count / total_pending) * 100
        rate = processed_count / elapsed if elapsed > 0 else 0
        rem_sec = (total_pending - processed_count) / rate if rate > 0 else 0

        log.info(
            f"Progress: [{processed_count}/{total_pending}] {pct:.1f}% | "
            f"+{len(batch_events)} events (total new: {total_events_added}) | "
            f"Speed: {rate:.1f} m/s | ETA: {rem_sec/60:.1f} min"
        )

    log.info("=" * 65)
    log.info(f"FINISHED SCRAPING HISTORICAL MATCH REPORTS!")
    log.info(f"Processed: {processed_count} matches in {time.time()-start_time:.1f}s")
    log.info(f"Total new events added: {total_events_added}")
    
    total_events_in_db = storage.conn.execute("SELECT COUNT(*) FROM match_events").fetchone()[0]
    log.info(f"Total match events now in DB: {total_events_in_db}")
    log.info("=" * 65)

    # Re-export master dataset
    log.info("Re-exporting all tables to CSV, JSON, and ZIP...")
    storage.export_all()
    log.info("Export completed successfully.")


if __name__ == "__main__":
    run_historical_match_reports(max_workers=4, chunk_size=100)
