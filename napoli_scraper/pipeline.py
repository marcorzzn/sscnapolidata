"""
Master Pipeline Orchestrator for SSC Napoli Encyclopedia Scraper.
Coordinates resilient phased execution, checkpointing, and output generation.
"""

from __future__ import annotations
import argparse
import logging
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import List, Optional

from .config import (
    BASE_DIR,
    DIST_DIR,
    NAPOLI_CLUB_ID,
    NAPOLI_SLUG,
    TM_API_BASE,
    TM_HOST,
)
from .fetcher import Fetcher
from .parsers.club import (
    parse_club_profile,
    parse_head_to_head,
    parse_historical_placements,
    parse_manager_history,
    parse_record_players,
    parse_record_transfers,
    parse_trophies,
)
from .parsers.fixtures import parse_match_report, parse_season_fixtures
from .parsers.player import (
    parse_player_injuries,
    parse_player_market_values,
    parse_player_master,
)
from .parsers.squad import parse_season_squad
from .parsers.transfers import parse_season_staff, parse_season_transfers
from .storage import Storage

log = logging.getLogger("napoli_scraper")


class NapoliPipeline:
    def __init__(
        self,
        storage: Optional[Storage] = None,
        fetcher: Optional[Fetcher] = None,
        delay: float = 1.0,
        use_cache: bool = True,
    ):
        self.storage = storage or Storage()
        self.fetcher = fetcher or Fetcher(delay=delay, use_cache=use_cache)
        self.club_id = NAPOLI_CLUB_ID
        self.slug = NAPOLI_SLUG
        self.host = TM_HOST

    def run_club_essentials(self):
        """Scrape club profile, historical placements (1926-present), honours, transfer records, player records."""
        log.info("=== Phase 1: Scraping Club Essentials ===")

        # 1. Club Profile / Datenfakten
        url_profile = f"https://{self.host}/{self.slug}/datenfakten/verein/{self.club_id}"
        res = self.fetcher.fetch_html(url_profile)
        if res.soup:
            prof = parse_club_profile(res.soup, self.club_id)
            self.storage.upsert_club_profile(prof)
            log.info(f"Club profile updated: {prof.get('name')}")

        # 2. Historical Placements across all seasons
        url_places = f"https://{self.host}/{self.slug}/platzierungen/verein/{self.club_id}"
        res = self.fetcher.fetch_html(url_places)
        if res.soup:
            places = parse_historical_placements(res.soup)
            self.storage.upsert_historical_placements(places)
            log.info(f"Historical placements recorded: {len(places)} seasons")

        # 3. Honours / Trophies
        url_erfolge = f"https://{self.host}/{self.slug}/erfolge/verein/{self.club_id}"
        res = self.fetcher.fetch_html(url_erfolge)
        if res.soup:
            trophies = parse_trophies(res.soup)
            self.storage.upsert_trophies(trophies)
            log.info(f"Trophies & Honours recorded: {len(trophies)} titles")

        # 4. Managers History (all managers in club history)
        url_mgrs = f"https://{self.host}/{self.slug}/mitarbeiterhistorie/verein/{self.club_id}/personalie/ab"
        res = self.fetcher.fetch_html(url_mgrs)
        if res.soup:
            mgrs = parse_manager_history(res.soup)
            self.storage.upsert_managers_history(mgrs)
            log.info(f"Historical managers recorded: {len(mgrs)} managers")

        # 5. Head to Head balance against all opponents (all 9 pages)
        for page in range(1, 11):
            url_h2h = f"https://{self.host}/{self.slug}/bilanz/verein/{self.club_id}/page/{page}"
            res = self.fetcher.fetch_html(url_h2h)
            if res.soup:
                h2h = parse_head_to_head(res.soup)
                if not h2h:
                    break
                self.storage.upsert_head_to_head(h2h)
                log.info(f"Head-to-head records page {page}: {len(h2h)} clubs")

        # 6. Top Arrivals (all 6 pages)
        for page in range(1, 8):
            url_arr = f"https://{self.host}/{self.slug}/transferrekorde/verein/{self.club_id}/page/{page}"
            res = self.fetcher.fetch_html(url_arr)
            if res.soup:
                arrivals = parse_record_transfers(res.soup, "arrival")
                if not arrivals:
                    break
                self.storage.upsert_record_transfers(arrivals)
                log.info(f"Record arrivals page {page}: {len(arrivals)} records")

        # 7. Top Departures (all 6 pages)
        for page in range(1, 8):
            url_dep = f"https://{self.host}/{self.slug}/rekordabgaenge/verein/{self.club_id}/page/{page}"
            res = self.fetcher.fetch_html(url_dep)
            if res.soup:
                deps = parse_record_transfers(res.soup, "departure")
                if not deps:
                    break
                self.storage.upsert_record_transfers(deps)
                log.info(f"Record departures page {page}: {len(deps)} records")

        # 8. All-Time Record Players: Appearances (all 10 pages)
        for page in range(1, 11):
            url_apps = f"https://{self.host}/{self.slug}/rekordspieler/verein/{self.club_id}/page/{page}"
            res = self.fetcher.fetch_html(url_apps)
            if res.soup:
                rec_apps = parse_record_players(res.soup, "appearances")
                if not rec_apps:
                    break
                self.storage.upsert_record_players(rec_apps)
                log.info(f"Record appearances page {page}: {len(rec_apps)} records")

        # 9. All-Time Record Players: Goalscorers (all 10 pages)
        for page in range(1, 11):
            url_goals = f"https://{self.host}/{self.slug}/rekordspieler/verein/{self.club_id}/sort/tore.desc/page/{page}"
            res = self.fetcher.fetch_html(url_goals)
            if res.soup:
                rec_goals = parse_record_players(res.soup, "goals")
                if not rec_goals:
                    break
                self.storage.upsert_record_players(rec_goals)
                log.info(f"Record goalscorers page {page}: {len(rec_goals)} records")

        # 10. All-Time Record Players: Assists (all 10 pages)
        for page in range(1, 11):
            url_assists = f"https://{self.host}/{self.slug}/rekordspieler/verein/{self.club_id}/sort/vorlagen.desc/page/{page}"
            res = self.fetcher.fetch_html(url_assists)
            if res.soup:
                rec_assists = parse_record_players(res.soup, "assists")
                if not rec_assists:
                    break
                self.storage.upsert_record_players(rec_assists)
                log.info(f"Record assists page {page}: {len(rec_assists)} records")

        self.storage.mark_task("club_essentials", "all", "completed")

    def run_season(self, season: int):
        """Scrape squad, transfers, staff, and fixtures for a specific season."""
        log.info(f"--- Processing Season {season} ---")

        # 1. Detailed Squad
        url_squad = f"https://{self.host}/{self.slug}/kader/verein/{self.club_id}/saison_id/{season}/plus/1"
        res = self.fetcher.fetch_html(url_squad)
        if res.soup:
            squad_rows = parse_season_squad(res.soup, season)
            self.storage.upsert_season_squad(squad_rows)
            log.info(f"Season {season} squad: {len(squad_rows)} players")

        # 2. Transfers
        url_transfers = f"https://{self.host}/{self.slug}/transfers/verein/{self.club_id}/saison_id/{season}"
        res = self.fetcher.fetch_html(url_transfers)
        if res.soup:
            tr_rows = parse_season_transfers(res.soup, season)
            self.storage.upsert_season_transfers(tr_rows)
            log.info(f"Season {season} transfers: {len(tr_rows)} moves")

        # 3. Fixtures & Results
        url_fixtures = f"https://{self.host}/{self.slug}/spielplan/verein/{self.club_id}/saison_id/{season}"
        res = self.fetcher.fetch_html(url_fixtures)
        if res.soup:
            fix_rows = parse_season_fixtures(res.soup, season)
            self.storage.upsert_season_fixtures(fix_rows)
            log.info(f"Season {season} fixtures: {len(fix_rows)} matches")

        # 4. Staff (for current season or latest available)
        url_staff = f"https://{self.host}/{self.slug}/mitarbeiter/verein/{self.club_id}"
        res = self.fetcher.fetch_html(url_staff)
        if res.soup:
            staff_rows = parse_season_staff(res.soup, season)
            self.storage.upsert_season_staff(staff_rows)

        self.storage.mark_task("season", str(season), "completed")

    def run_seasons(self, seasons: List[int]):
        """Scrape multiple seasons with progress reporting."""
        log.info(f"=== Phase 2: Scraping {len(seasons)} Seasons ===")
        for i, s in enumerate(seasons, 1):
            if self.storage.is_task_completed("season", str(s)):
                log.info(f"[{i}/{len(seasons)}] Season {s} already completed, skipping.")
                continue
            log.info(f"[{i}/{len(seasons)}] Scraping season {s}...")
            try:
                self.run_season(s)
            except Exception as e:
                log.error(f"Error scraping season {s}: {e}")
                self.storage.mark_task("season", str(s), "failed", str(e))

    def run_match_reports(self, limit: Optional[int] = None):
        """Scrape detailed match reports (goals, assists, cards, substitutions) for fixtures."""
        log.info("=== Phase 3: Scraping Detailed Match Reports ===")
        pending = self.storage.get_pending_match_ids()
        if limit:
            pending = pending[:limit]
        log.info(f"Pending match reports to scrape: {len(pending)}")

        for i, mid in enumerate(pending, 1):
            url = f"https://{self.host}/spielbericht/index/spielbericht/{mid}"
            log.info(f"[{i}/{len(pending)}] Match report {mid}...")
            res = self.fetcher.fetch_html(url)
            if res.soup:
                events = parse_match_report(res.soup, mid)
                if events:
                    self.storage.upsert_match_events(events)
                self.storage.mark_task("match_report", mid, "completed")
            elif res.status == 404:
                self.storage.mark_task("match_report", mid, "not_found")
            else:
                self.storage.mark_task("match_report", mid, "failed")

    def run_player_deep(self, player_id: str):
        """
        Deep-dive for a single player:
        1. Master Profile
        2. Clinical / Technical Injury & Absence records (with full cause classification)
        3. Market Value History (via official TM API)
        """
        # 1. Master Profile
        url_profile = f"https://{self.host}/player/profil/spieler/{player_id}"
        res_prof = self.fetcher.fetch_html(url_profile)
        if res_prof.soup:
            master = parse_player_master(res_prof.soup, player_id)
            master["scraped_at"] = datetime.utcnow().isoformat()
            self.storage.upsert_player_master(master)

        # 2. Injuries & Absences
        url_injuries = f"https://{self.host}/player/verletzungen/spieler/{player_id}"
        res_inj = self.fetcher.fetch_html(url_injuries)
        if res_inj.soup:
            injuries = parse_player_injuries(res_inj.soup, player_id)
            if injuries:
                self.storage.upsert_player_injuries(injuries)

        # 3. Market Value History (Official JSON API)
        url_mv_api = f"{TM_API_BASE}/player/{player_id}/market-value-history"
        res_mv = self.fetcher.fetch_json(url_mv_api)
        if res_mv.json_data:
            mv_points = parse_player_market_values(res_mv.json_data, player_id)
            if mv_points:
                self.storage.upsert_player_market_values(mv_points)

        self.storage.mark_task("player_deep", str(player_id), "completed")

    def run_players_deep(self, player_ids: Optional[List[str]] = None, limit: Optional[int] = None):
        """Scrape deep-dive player records for pending player IDs."""
        log.info("=== Phase 4: Scraping Player Deep-Dive (Profile, Injuries, Market Values) ===")
        targets = player_ids or self.storage.get_pending_player_ids()
        if limit:
            targets = targets[:limit]
        log.info(f"Target players to scrape: {len(targets)}")

        for i, pid in enumerate(targets, 1):
            if self.storage.is_task_completed("player_deep", pid):
                continue
            log.info(f"[{i}/{len(targets)}] Scraping player deep-dive for ID {pid}...")
            try:
                self.run_player_deep(pid)
            except Exception as e:
                log.error(f"Error scraping player {pid}: {e}")
                self.storage.mark_task("player_deep", pid, "failed", str(e))

    def export(self, out_dir: Path = DIST_DIR):
        """Export all encyclopedia data to CSV files, master JSON, and ZIP bundle."""
        log.info(f"=== Phase 5: Exporting Encyclopedia Dataset to {out_dir} ===")
        res = self.storage.export_all(out_dir)
        summary = self.storage.get_summary()

        print("\n" + "=" * 60)
        print("SSC NAPOLI ENCYCLOPEDIA - DATASET SUMMARY")
        print("=" * 60)
        for tbl, count in summary.items():
            print(f"  {tbl:25}: {count:6d} records")
        print("-" * 60)
        print(f"  Consolidated JSON: {res['json']}")
        print(f"  ZIP Archive:       {res['zip']}")
        print(f"  Total CSV files:   {res['csv_count']}")
        print("=" * 60 + "\n")
        return res


def main(argv: Optional[List[str]] = None):
    parser = argparse.ArgumentParser(description="SSC Napoli Historical Encyclopedia Scraper & Dataset Builder")
    parser.add_argument(
        "--mode",
        choices=["all", "club", "seasons", "matches", "players", "export"],
        default="all",
        help="Execution mode (default: all)",
    )
    parser.add_argument(
        "--seasons",
        default="2020-2025",
        help="Season range or comma-separated years (e.g. '2023,2024' or '2010-2025' or '1926-2025')",
    )
    parser.add_argument(
        "--player-ids",
        default="",
        help="Specific player IDs to scrape deep-dive for (comma-separated)",
    )
    parser.add_argument(
        "--player-limit",
        type=int,
        default=None,
        help="Limit number of players to scrape deep dive for (useful for batching)",
    )
    parser.add_argument(
        "--match-limit",
        type=int,
        default=None,
        help="Limit number of match reports to scrape",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=1.0,
        help="Delay between requests in seconds (default: 1.0)",
    )
    parser.add_argument(
        "--no-cache",
        action="store_true",
        help="Disable disk caching",
    )
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Enable detailed debug logging",
    )
    args = parser.parse_args(argv)

    logging.basicConfig(
        level=logging.INFO if not args.verbose else logging.DEBUG,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%H:%M:%S",
    )

    # Parse seasons
    season_list: List[int] = []
    if args.seasons.lower() == "all":
        # All historical seasons since foundation 1926 (excluding WWII suspension 1943-1945)
        season_list = [y for y in range(1926, 2026) if y not in (1943, 1944, 1945)]
    elif "-" in args.seasons:
        start_yr, end_yr = args.seasons.split("-")
        season_list = list(range(int(start_yr), int(end_yr) + 1))
    else:
        season_list = [int(s.strip()) for s in args.seasons.split(",") if s.strip()]

    storage = Storage()
    fetcher = Fetcher(delay=args.delay, use_cache=not args.no_cache)
    pipeline = NapoliPipeline(storage=storage, fetcher=fetcher)

    # Specific player IDs if given
    player_ids = [p.strip() for p in args.player_ids.split(",") if p.strip()]

    if args.mode in ("all", "club"):
        pipeline.run_club_essentials()

    if args.mode in ("all", "seasons"):
        pipeline.run_seasons(season_list)

    if args.mode in ("all", "matches"):
        pipeline.run_match_reports(limit=args.match_limit)

    if args.mode in ("all", "players"):
        pipeline.run_players_deep(player_ids=player_ids or None, limit=args.player_limit)

    # Always export at end of any run
    pipeline.export()


if __name__ == "__main__":
    main()
