"""
SQLite Storage Engine and Exporter for Napoli Encyclopedia.
Provides ACID transactions, upsert idempotency, and automated export to JSON/CSV/ZIP.
"""

from __future__ import annotations
import csv
import json
import sqlite3
import zipfile
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Iterable, List

from .config import DB_PATH, DATA_DIR, DIST_DIR


class Storage:
    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = db_path
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(str(self.db_path), check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self.conn.execute("PRAGMA journal_mode = WAL;")
        self.conn.execute("PRAGMA synchronous = NORMAL;")
        self.init_db()

    def init_db(self):
        """Create all encyclopedia tables with proper primary keys and indexes."""
        with self.conn:
            self.conn.executescript("""
            -- Club Profile & Facts
            CREATE TABLE IF NOT EXISTS club_profile (
                club_id TEXT PRIMARY KEY,
                name TEXT,
                legal_name TEXT,
                founded_date TEXT,
                address TEXT,
                stadium_name TEXT,
                stadium_capacity INTEGER,
                crest_url TEXT,
                league TEXT,
                members INTEGER,
                raw_info TEXT,
                scraped_at TEXT
            );

            -- Detailed Stadium & Grounds History
            CREATE TABLE IF NOT EXISTS club_stadium (
                stadium_name TEXT PRIMARY KEY,
                total_capacity INTEGER,
                covered_seats INTEGER,
                boxes INTEGER,
                built_year INTEGER,
                former_names TEXT,
                undersoil_heating TEXT,
                running_track TEXT,
                surface TEXT,
                pitch_size TEXT,
                address TEXT,
                telephone TEXT,
                owner TEXT,
                historical_stadiums TEXT,
                raw_info TEXT,
                scraped_at TEXT
            );

            -- Historical Squad Shirt Numbers
            CREATE TABLE IF NOT EXISTS club_shirt_numbers (
                shirt_number INTEGER,
                player_id TEXT,
                player_name TEXT,
                seasons_worn TEXT,
                is_current INTEGER,
                PRIMARY KEY (shirt_number, player_id, seasons_worn)
            );

            -- Historical Record Matches (Highest Wins, Defeats, Scoring)
            CREATE TABLE IF NOT EXISTS club_record_matches (
                category TEXT,
                rank INTEGER,
                match_date TEXT,
                season TEXT,
                matchday TEXT,
                competition TEXT,
                venue TEXT,
                opponent TEXT,
                attendance TEXT,
                result TEXT,
                PRIMARY KEY (category, rank, match_date, opponent)
            );

            -- Youth & Primavera Squads
            CREATE TABLE IF NOT EXISTS youth_squads (
                team_name TEXT,
                season INTEGER,
                player_id TEXT,
                player_name TEXT,
                position TEXT,
                birth_date TEXT,
                age INTEGER,
                nationalities TEXT,
                height_m REAL,
                foot TEXT,
                joined_date TEXT,
                contract_until TEXT,
                market_value_eur REAL,
                signed_from_club TEXT,
                signed_from_id TEXT,
                PRIMARY KEY (team_name, season, player_id)
            );

            -- Official Financial Balance Sheets (Bilanci d'Esercizio SSC Napoli S.p.A.)
            CREATE TABLE IF NOT EXISTS club_financials (
                season TEXT PRIMARY KEY,
                season_year INTEGER,
                league TEXT,
                total_revenues_eur REAL,
                tv_rights_eur REAL,
                matchday_revenues_eur REAL,
                commercial_sponsorship_eur REAL,
                player_trading_profit_eur REAL,
                other_revenues_eur REAL,
                personnel_costs_eur REAL,
                amortization_players_eur REAL,
                operating_costs_eur REAL,
                net_profit_loss_eur REAL,
                net_equity_eur REAL,
                net_financial_position_eur REAL,
                notes TEXT,
                source TEXT
            );

            -- Historical League Placements (every season in club history)
            CREATE TABLE IF NOT EXISTS historical_placements (
                season TEXT,
                league TEXT,
                league_level TEXT,
                rank INTEGER,
                matches INTEGER,
                wins INTEGER,
                draws INTEGER,
                losses INTEGER,
                goals_for INTEGER,
                goals_against INTEGER,
                goal_diff INTEGER,
                points INTEGER,
                manager TEXT,
                PRIMARY KEY (season, league)
            );

            -- Club Honours & Trophies
            CREATE TABLE IF NOT EXISTS trophies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                competition TEXT,
                title TEXT,
                season TEXT,
                scraped_at TEXT,
                UNIQUE (competition, title, season)
            );

            -- Transfer Records (top arrivals & top departures)
            CREATE TABLE IF NOT EXISTS record_transfers (
                record_type TEXT, -- 'arrival' or 'departure'
                rank INTEGER,
                player_id TEXT,
                player_name TEXT,
                position TEXT,
                age INTEGER,
                season TEXT,
                other_club TEXT,
                fee_raw TEXT,
                fee_eur REAL,
                PRIMARY KEY (record_type, rank, player_id, season)
            );

            -- Record Players (Appearances, Top Scorers, Assists, Cards)
            CREATE TABLE IF NOT EXISTS record_players (
                category TEXT, -- 'appearances', 'goals', 'assists', 'yellow_cards', 'red_cards'
                rank INTEGER,
                player_id TEXT,
                player_name TEXT,
                nationality TEXT,
                birth_date TEXT,
                apps INTEGER,
                goals INTEGER,
                assists INTEGER,
                yellow_cards INTEGER,
                red_cards INTEGER,
                minutes_played INTEGER,
                PRIMARY KEY (category, rank, player_id)
            );

            -- Season Squads (per season roster)
            CREATE TABLE IF NOT EXISTS season_squads (
                season INTEGER,
                player_id TEXT,
                player_name TEXT,
                shirt_number INTEGER,
                position_group TEXT,
                position TEXT,
                birth_date TEXT,
                age INTEGER,
                nationalities TEXT,
                height_m REAL,
                foot TEXT,
                joined_date TEXT,
                contract_until TEXT,
                market_value_eur REAL,
                signed_from_club TEXT,
                signed_from_id TEXT,
                PRIMARY KEY (season, player_id)
            );

            -- Season Transfers (all transfers in/out per season)
            CREATE TABLE IF NOT EXISTS season_transfers (
                transfer_id TEXT PRIMARY KEY,
                season INTEGER,
                direction TEXT, -- 'in' or 'out'
                player_id TEXT,
                player_name TEXT,
                age INTEGER,
                market_value_eur REAL,
                other_club TEXT,
                other_club_id TEXT,
                fee_raw TEXT,
                fee_eur REAL,
                fee_type TEXT
            );

            -- Season Staff & Managers
            CREATE TABLE IF NOT EXISTS season_staff (
                season INTEGER,
                staff_id TEXT,
                name TEXT,
                role TEXT,
                age INTEGER,
                nationality TEXT,
                joined_date TEXT,
                contract_until TEXT,
                PRIMARY KEY (season, staff_id, role)
            );

            -- Season Fixtures & Results
            CREATE TABLE IF NOT EXISTS season_fixtures (
                match_id TEXT PRIMARY KEY,
                season INTEGER,
                competition TEXT,
                matchday TEXT,
                match_date TEXT,
                match_time TEXT,
                venue TEXT, -- 'H' or 'A'
                rank_at_match TEXT,
                opponent_id TEXT,
                opponent_name TEXT,
                system_of_play TEXT,
                attendance INTEGER,
                result TEXT,
                home_goals INTEGER,
                away_goals INTEGER,
                report_url TEXT
            );

            -- Match Events (Goals, Cards, Substitutions)
            CREATE TABLE IF NOT EXISTS match_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                match_id TEXT,
                event_type TEXT, -- 'goal', 'card', 'substitution'
                minute INTEGER,
                stoppage_time INTEGER,
                player_id TEXT,
                player_name TEXT,
                club_id TEXT,
                club_name TEXT,
                detail_json TEXT,
                UNIQUE (match_id, event_type, minute, player_id, club_id)
            );

            -- Master Players Registry
            CREATE TABLE IF NOT EXISTS players_master (
                player_id TEXT PRIMARY KEY,
                full_name TEXT,
                display_name TEXT,
                birth_date TEXT,
                birth_place TEXT,
                citizenship TEXT,
                height_m REAL,
                foot TEXT,
                main_position TEXT,
                other_positions TEXT,
                agent TEXT,
                current_club TEXT,
                current_club_id TEXT,
                current_market_value_eur REAL,
                highest_market_value_eur REAL,
                highest_market_value_date TEXT,
                scraped_at TEXT
            );

            -- Historical Managers Registry
            CREATE TABLE IF NOT EXISTS managers_history (
                manager_id TEXT,
                name TEXT,
                birth_date TEXT,
                nationality TEXT,
                appointed_date TEXT,
                end_date TEXT,
                days_in_post INTEGER,
                matches INTEGER,
                ppg REAL,
                PRIMARY KEY (manager_id, appointed_date)
            );

            -- Head-to-Head Balance Against All Opponents
            CREATE TABLE IF NOT EXISTS head_to_head (
                opponent_id TEXT PRIMARY KEY,
                opponent_name TEXT,
                country TEXT,
                matches INTEGER,
                wins INTEGER,
                draws INTEGER,
                losses INTEGER,
                goal_diff TEXT,
                points INTEGER,
                win_ratio TEXT,
                avg_attendance INTEGER
            );

            -- Player Injuries & Absences (with clinical / technical reason classification)
            CREATE TABLE IF NOT EXISTS player_injuries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT,
                season TEXT,
                injury_raw TEXT,
                category TEXT, -- 'Physical Injury', 'Illness / Medical', 'Disciplinary / Suspension', etc.
                from_date TEXT,
                until_date TEXT,
                days_missed INTEGER,
                games_missed INTEGER,
                clubs_affected TEXT,
                UNIQUE (player_id, season, injury_raw, from_date)
            );

            -- Player Market Value History (clean historical valuations)
            CREATE TABLE IF NOT EXISTS player_market_values (
                player_id TEXT,
                date TEXT,
                market_value_eur REAL,
                age INTEGER,
                club_id TEXT,
                season_id INTEGER,
                PRIMARY KEY (player_id, date)
            );

            -- Progress tracking / checkpointing
            CREATE TABLE IF NOT EXISTS scrape_progress (
                task_type TEXT,
                task_id TEXT,
                status TEXT, -- 'completed', 'failed', 'empty'
                error_message TEXT,
                updated_at TEXT,
                PRIMARY KEY (task_type, task_id)
            );

            -- Indexes for high-speed queries
            CREATE INDEX IF NOT EXISTS idx_season_squads_pid ON season_squads(player_id);
            CREATE INDEX IF NOT EXISTS idx_season_transfers_pid ON season_transfers(player_id);
            CREATE INDEX IF NOT EXISTS idx_season_fixtures_season ON season_fixtures(season);
            CREATE INDEX IF NOT EXISTS idx_match_events_match ON match_events(match_id);
            CREATE INDEX IF NOT EXISTS idx_injuries_pid ON player_injuries(player_id);
            CREATE INDEX IF NOT EXISTS idx_mv_pid ON player_market_values(player_id);
            """)

    # --------------------------------------------------------------------------
    # Progress & Checkpointing
    # --------------------------------------------------------------------------
    def is_task_completed(self, task_type: str, task_id: str) -> bool:
        cur = self.conn.cursor()
        cur.execute(
            "SELECT status FROM scrape_progress WHERE task_type = ? AND task_id = ?",
            (task_type, str(task_id)),
        )
        row = cur.fetchone()
        return row is not None and row["status"] == "completed"

    def mark_task(self, task_type: str, task_id: str, status: str, error_message: str | None = None):
        with self.conn:
            self.conn.execute(
                """
                INSERT OR REPLACE INTO scrape_progress (task_type, task_id, status, error_message, updated_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (task_type, str(task_id), status, error_message, datetime.utcnow().isoformat()),
            )

    # --------------------------------------------------------------------------
    # Upsert Operations
    # --------------------------------------------------------------------------
    def upsert_club_profile(self, data: Dict[str, Any]):
        with self.conn:
            self.conn.execute(
                """
                INSERT OR REPLACE INTO club_profile
                (club_id, name, legal_name, founded_date, address, stadium_name,
                 stadium_capacity, crest_url, league, members, raw_info, scraped_at)
                VALUES (:club_id, :name, :legal_name, :founded_date, :address, :stadium_name,
                        :stadium_capacity, :crest_url, :league, :members, :raw_info, :scraped_at)
                """,
                {
                    "club_id": data.get("club_id"),
                    "name": data.get("name"),
                    "legal_name": data.get("legal_name"),
                    "founded_date": data.get("founded_date"),
                    "address": data.get("address"),
                    "stadium_name": data.get("stadium_name"),
                    "stadium_capacity": data.get("stadium_capacity"),
                    "crest_url": data.get("crest_url"),
                    "league": data.get("league"),
                    "members": data.get("members"),
                    "raw_info": json.dumps(data.get("raw_info", {}), ensure_ascii=False),
                    "scraped_at": datetime.utcnow().isoformat(),
                },
            )

    def upsert_club_stadium(self, data: Dict[str, Any]):
        with self.conn:
            self.conn.execute(
                """
                INSERT OR REPLACE INTO club_stadium
                (stadium_name, total_capacity, covered_seats, boxes, built_year, former_names,
                 undersoil_heating, running_track, surface, pitch_size, address, telephone,
                 owner, historical_stadiums, raw_info, scraped_at)
                VALUES (:stadium_name, :total_capacity, :covered_seats, :boxes, :built_year, :former_names,
                        :undersoil_heating, :running_track, :surface, :pitch_size, :address, :telephone,
                        :owner, :historical_stadiums, :raw_info, :scraped_at)
                """,
                {
                    "stadium_name": data.get("stadium_name"),
                    "total_capacity": data.get("total_capacity"),
                    "covered_seats": data.get("covered_seats"),
                    "boxes": data.get("boxes"),
                    "built_year": data.get("built_year"),
                    "former_names": data.get("former_names"),
                    "undersoil_heating": data.get("undersoil_heating"),
                    "running_track": data.get("running_track"),
                    "surface": data.get("surface"),
                    "pitch_size": data.get("pitch_size"),
                    "address": data.get("address"),
                    "telephone": data.get("telephone"),
                    "owner": data.get("owner"),
                    "historical_stadiums": data.get("historical_stadiums"),
                    "raw_info": json.dumps(data.get("raw_info", {}), ensure_ascii=False),
                    "scraped_at": datetime.utcnow().isoformat(),
                },
            )

    def upsert_club_shirt_numbers(self, rows: List[Dict[str, Any]]):
        with self.conn:
            self.conn.executemany(
                """
                INSERT OR REPLACE INTO club_shirt_numbers
                (shirt_number, player_id, player_name, seasons_worn, is_current)
                VALUES (:shirt_number, :player_id, :player_name, :seasons_worn, :is_current)
                """,
                rows,
            )

    def upsert_club_record_matches(self, rows: List[Dict[str, Any]]):
        with self.conn:
            self.conn.executemany(
                """
                INSERT OR REPLACE INTO club_record_matches
                (category, rank, match_date, season, matchday, competition, venue, opponent, attendance, result)
                VALUES (:category, :rank, :match_date, :season, :matchday, :competition, :venue, :opponent, :attendance, :result)
                """,
                rows,
            )

    def upsert_youth_squads(self, rows: List[Dict[str, Any]]):
        with self.conn:
            self.conn.executemany(
                """
                INSERT OR REPLACE INTO youth_squads
                (team_name, season, player_id, player_name, position, birth_date, age,
                 nationalities, height_m, foot, joined_date, contract_until,
                 market_value_eur, signed_from_club, signed_from_id)
                VALUES (:team_name, :season, :player_id, :player_name, :position, :birth_date, :age,
                        :nationalities, :height_m, :foot, :joined_date, :contract_until,
                        :market_value_eur, :signed_from_club, :signed_from_id)
                """,
                rows,
            )

    def upsert_club_financials(self, rows: List[Dict[str, Any]]):
        with self.conn:
            self.conn.executemany(
                """
                INSERT OR REPLACE INTO club_financials
                (season, season_year, league, total_revenues_eur, tv_rights_eur,
                 matchday_revenues_eur, commercial_sponsorship_eur, player_trading_profit_eur,
                 other_revenues_eur, personnel_costs_eur, amortization_players_eur,
                 operating_costs_eur, net_profit_loss_eur, net_equity_eur,
                 net_financial_position_eur, notes, source)
                VALUES (:season, :season_year, :league, :total_revenues_eur, :tv_rights_eur,
                        :matchday_revenues_eur, :commercial_sponsorship_eur, :player_trading_profit_eur,
                        :other_revenues_eur, :personnel_costs_eur, :amortization_players_eur,
                        :operating_costs_eur, :net_profit_loss_eur, :net_equity_eur,
                        :net_financial_position_eur, :notes, :source)
                """,
                rows,
            )

    def upsert_historical_placements(self, rows: List[Dict[str, Any]]):
        with self.conn:
            self.conn.executemany(
                """
                INSERT OR REPLACE INTO historical_placements
                (season, league, league_level, rank, matches, wins, draws, losses,
                 goals_for, goals_against, goal_diff, points, manager)
                VALUES (:season, :league, :league_level, :rank, :matches, :wins, :draws, :losses,
                        :goals_for, :goals_against, :goal_diff, :points, :manager)
                """,
                rows,
            )

    def upsert_trophies(self, rows: List[Dict[str, Any]]):
        with self.conn:
            self.conn.executemany(
                """
                INSERT OR IGNORE INTO trophies (competition, title, season, scraped_at)
                VALUES (:competition, :title, :season, :scraped_at)
                """,
                rows,
            )

    def upsert_record_transfers(self, rows: List[Dict[str, Any]]):
        with self.conn:
            self.conn.executemany(
                """
                INSERT OR REPLACE INTO record_transfers
                (record_type, rank, player_id, player_name, position, age, season, other_club, fee_raw, fee_eur)
                VALUES (:record_type, :rank, :player_id, :player_name, :position, :age, :season, :other_club, :fee_raw, :fee_eur)
                """,
                rows,
            )

    def upsert_record_players(self, rows: List[Dict[str, Any]]):
        with self.conn:
            self.conn.executemany(
                """
                INSERT OR REPLACE INTO record_players
                (category, rank, player_id, player_name, nationality, birth_date, apps, goals, assists, yellow_cards, red_cards, minutes_played)
                VALUES (:category, :rank, :player_id, :player_name, :nationality, :birth_date, :apps, :goals, :assists, :yellow_cards, :red_cards, :minutes_played)
                """,
                rows,
            )

    def upsert_season_squad(self, rows: List[Dict[str, Any]]):
        with self.conn:
            self.conn.executemany(
                """
                INSERT OR REPLACE INTO season_squads
                (season, player_id, player_name, shirt_number, position_group, position, birth_date,
                 age, nationalities, height_m, foot, joined_date, contract_until, market_value_eur,
                 signed_from_club, signed_from_id)
                VALUES (:season, :player_id, :player_name, :shirt_number, :position_group, :position,
                        :birth_date, :age, :nationalities, :height_m, :foot, :joined_date,
                        :contract_until, :market_value_eur, :signed_from_club, :signed_from_id)
                """,
                rows,
            )

    def upsert_season_transfers(self, rows: List[Dict[str, Any]]):
        with self.conn:
            self.conn.executemany(
                """
                INSERT OR REPLACE INTO season_transfers
                (transfer_id, season, direction, player_id, player_name, age, market_value_eur,
                 other_club, other_club_id, fee_raw, fee_eur, fee_type)
                VALUES (:transfer_id, :season, :direction, :player_id, :player_name, :age,
                        :market_value_eur, :other_club, :other_club_id, :fee_raw, :fee_eur, :fee_type)
                """,
                rows,
            )

    def upsert_season_staff(self, rows: List[Dict[str, Any]]):
        with self.conn:
            self.conn.executemany(
                """
                INSERT OR REPLACE INTO season_staff
                (season, staff_id, name, role, age, nationality, joined_date, contract_until)
                VALUES (:season, :staff_id, :name, :role, :age, :nationality, :joined_date, :contract_until)
                """,
                rows,
            )

    def upsert_season_fixtures(self, rows: List[Dict[str, Any]]):
        with self.conn:
            self.conn.executemany(
                """
                INSERT OR REPLACE INTO season_fixtures
                (match_id, season, competition, matchday, match_date, match_time, venue,
                 rank_at_match, opponent_id, opponent_name, system_of_play, attendance,
                 result, home_goals, away_goals, report_url)
                VALUES (:match_id, :season, :competition, :matchday, :match_date, :match_time,
                        :venue, :rank_at_match, :opponent_id, :opponent_name, :system_of_play,
                        :attendance, :result, :home_goals, :away_goals, :report_url)
                """,
                rows,
            )

    def upsert_match_events(self, rows: List[Dict[str, Any]]):
        with self.conn:
            self.conn.executemany(
                """
                INSERT OR REPLACE INTO match_events
                (match_id, event_type, minute, stoppage_time, player_id, player_name, club_id, club_name, detail_json)
                VALUES (:match_id, :event_type, :minute, :stoppage_time, :player_id, :player_name, :club_id, :club_name, :detail_json)
                """,
                rows,
            )

    def upsert_player_master(self, p: Dict[str, Any]):
        with self.conn:
            self.conn.execute(
                """
                INSERT OR REPLACE INTO players_master
                (player_id, full_name, display_name, birth_date, birth_place, citizenship,
                 height_m, foot, main_position, other_positions, agent, current_club,
                 current_club_id, current_market_value_eur, highest_market_value_eur,
                 highest_market_value_date, scraped_at)
                VALUES (:player_id, :full_name, :display_name, :birth_date, :birth_place,
                        :citizenship, :height_m, :foot, :main_position, :other_positions,
                        :agent, :current_club, :current_club_id, :current_market_value_eur,
                        :highest_market_value_eur, :highest_market_value_date, :scraped_at)
                """,
                p,
            )

    def upsert_managers_history(self, rows: List[Dict[str, Any]]):
        with self.conn:
            self.conn.executemany(
                """
                INSERT OR REPLACE INTO managers_history
                (manager_id, name, birth_date, nationality, appointed_date, end_date, days_in_post, matches, ppg)
                VALUES (:manager_id, :name, :birth_date, :nationality, :appointed_date, :end_date, :days_in_post, :matches, :ppg)
                """,
                rows,
            )

    def upsert_head_to_head(self, rows: List[Dict[str, Any]]):
        with self.conn:
            self.conn.executemany(
                """
                INSERT OR REPLACE INTO head_to_head
                (opponent_id, opponent_name, country, matches, wins, draws, losses, goal_diff, points, win_ratio, avg_attendance)
                VALUES (:opponent_id, :opponent_name, :country, :matches, :wins, :draws, :losses, :goal_diff, :points, :win_ratio, :avg_attendance)
                """,
                rows,
            )

    def upsert_player_injuries(self, rows: List[Dict[str, Any]]):
        with self.conn:
            self.conn.executemany(
                """
                INSERT OR IGNORE INTO player_injuries
                (player_id, season, injury_raw, category, from_date, until_date, days_missed, games_missed, clubs_affected)
                VALUES (:player_id, :season, :injury_raw, :category, :from_date, :until_date, :days_missed, :games_missed, :clubs_affected)
                """,
                rows,
            )

    def upsert_player_market_values(self, rows: List[Dict[str, Any]]):
        with self.conn:
            self.conn.executemany(
                """
                INSERT OR REPLACE INTO player_market_values
                (player_id, date, market_value_eur, age, club_id, season_id)
                VALUES (:player_id, :date, :market_value_eur, :age, :club_id, :season_id)
                """,
                rows,
            )

    # --------------------------------------------------------------------------
    # Discovery Queries
    # --------------------------------------------------------------------------
    def get_all_player_ids(self) -> List[str]:
        """Return list of distinct player IDs discovered across squads, transfers, records."""
        cur = self.conn.cursor()
        cur.execute("""
            SELECT DISTINCT player_id FROM season_squads WHERE player_id IS NOT NULL AND player_id != ''
            UNION
            SELECT DISTINCT player_id FROM season_transfers WHERE player_id IS NOT NULL AND player_id != ''
            UNION
            SELECT DISTINCT player_id FROM record_players WHERE player_id IS NOT NULL AND player_id != ''
            UNION
            SELECT DISTINCT player_id FROM record_transfers WHERE player_id IS NOT NULL AND player_id != ''
        """)
        return [row[0] for row in cur.fetchall()]

    def get_pending_player_ids(self) -> List[str]:
        """Return player IDs that have not yet had their deep dive (master/injuries/mv) scraped."""
        all_ids = set(self.get_all_player_ids())
        cur = self.conn.cursor()
        cur.execute("SELECT task_id FROM scrape_progress WHERE task_type = 'player_deep' AND status = 'completed'")
        completed = {row[0] for row in cur.fetchall()}
        return sorted(list(all_ids - completed))

    def get_pending_match_ids(self) -> List[str]:
        """Return match IDs from fixtures that haven't had their match reports scraped."""
        cur = self.conn.cursor()
        cur.execute("""
            SELECT f.match_id FROM season_fixtures f
            LEFT JOIN scrape_progress p ON p.task_type = 'match_report' AND p.task_id = f.match_id
            WHERE (p.status IS NULL OR p.status != 'completed')
              AND f.report_url IS NOT NULL AND f.report_url != ''
        """)
        return [row[0] for row in cur.fetchall()]

    # --------------------------------------------------------------------------
    # Summary Statistics
    # --------------------------------------------------------------------------
    def get_summary(self) -> Dict[str, int]:
        """Count records across all encyclopedia tables."""
        tables = [
            "club_profile", "club_stadium", "club_financials", "club_shirt_numbers", "club_record_matches",
            "historical_placements", "trophies", "record_transfers",
            "record_players", "managers_history", "head_to_head", "staff_history",
            "season_squads", "season_transfers", "season_staff",
            "season_fixtures", "match_events", "players_master", "player_injuries",
            "player_market_values", "youth_squads"
        ]
        stats = {}
        cur = self.conn.cursor()
        for t in tables:
            try:
                cur.execute(f"SELECT COUNT(*) FROM {t}")
                stats[t] = cur.fetchone()[0]
            except Exception:
                stats[t] = 0
        return stats

    # --------------------------------------------------------------------------
    # Exporters (CSV, JSON, ZIP)
    # --------------------------------------------------------------------------
    def export_all(self, out_dir: Path = DIST_DIR) -> Dict[str, Path]:
        """Export all encyclopedia tables to individual CSV files, one master JSON, and a ZIP bundle."""
        out_dir.mkdir(parents=True, exist_ok=True)
        cur = self.conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT IN ('sqlite_sequence', 'scrape_progress') AND name NOT LIKE '%_fts%' ORDER BY name")
        tables = [r[0] for r in cur.fetchall()]

        master_data: Dict[str, List[Dict[str, Any]]] = {}
        csv_files: List[Path] = []

        for t in tables:
            cur.execute(f"SELECT * FROM `{t}`")
            raw_rows = cur.fetchall()
            rows = []
            for r in raw_rows:
                d = {}
                for k, v in dict(r).items():
                    if isinstance(v, bytes):
                        try:
                            d[k] = v.decode("utf-8")
                        except Exception:
                            d[k] = v.hex()
                    else:
                        d[k] = v
                rows.append(d)
            master_data[t] = rows

            # Export CSV
            if rows:
                csv_path = out_dir / f"napoli_{t}.csv"
                keys = list(rows[0].keys())
                with csv_path.open("w", newline="", encoding="utf-8-sig") as f:
                    w = csv.DictWriter(f, fieldnames=keys, extrasaction="ignore")
                    w.writeheader()
                    w.writerows(rows)
                csv_files.append(csv_path)

        # Export consolidated JSON
        json_path = out_dir / "napoli_encyclopedia_complete.json"
        json_path.write_text(json.dumps(master_data, ensure_ascii=False, indent=2), encoding="utf-8")

        # Export ZIP archive
        zip_path = out_dir / "ssc_napoli_encyclopedia_dataset.zip"
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            zf.write(json_path, arcname=json_path.name)
            for cp in csv_files:
                zf.write(cp, arcname=cp.name)

        return {
            "json": json_path,
            "zip": zip_path,
            "csv_count": len(csv_files),
        }
