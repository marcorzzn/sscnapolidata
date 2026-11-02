"""
Parser for Season Transfers (Arrivals & Departures) and Club Staff.
"""

from __future__ import annotations
import re
from typing import Any, Dict, List
from bs4 import BeautifulSoup

from ..config import parse_date, parse_int, parse_money


def parse_season_transfers(soup: BeautifulSoup, season: int) -> List[Dict[str, Any]]:
    """Parse all transfer arrivals and departures for a specific season."""
    rows: List[Dict[str, Any]] = []

    # Look through tables
    for box in soup.select("div.box"):
        hl = box.select_one(".content-box-headline")
        hl_text = hl.get_text(" ", strip=True).lower() if hl else ""

        direction = None
        if any(w in hl_text for w in ["arrival", "zugang", "entrat", "arrivi"]):
            direction = "in"
        elif any(w in hl_text for w in ["departure", "abgang", "uscit"]):
            direction = "out"

        table = box.select_one("table.items")
        if not table or not direction:
            continue

        for tr in table.select("tbody > tr"):
            cells = tr.find_all("td", recursive=False)
            if not cells:
                continue

            player_a = tr.select_one('a[href*="/profil/spieler/"]')
            if not player_a:
                continue

            href = player_a.get("href", "")
            pid_m = re.search(r"/profil/spieler/(\d+)", href) or re.search(r"/spieler/(\d+)", href)
            player_id = pid_m.group(1) if pid_m else None
            player_name = player_a.get_text(strip=True)

            age = parse_int(cells[1].get_text(strip=True)) if len(cells) > 1 else None

            # Other club
            other_club = None
            other_club_id = None
            club_a = tr.select_one('td.no-border-links a[href*="/verein/"]') or tr.select_one('a[href*="/verein/"]')
            if club_a:
                other_club = club_a.get_text(strip=True)
                cm = re.search(r"/verein/(\d+)", club_a.get("href", ""))
                if cm:
                    other_club_id = cm.group(1)

            # Market value
            mv_val = None
            for td in cells:
                if "rechts" in td.get("class", []):
                    mv_cand = parse_money(td.get_text(strip=True))
                    if mv_cand is not None and mv_cand > 0:
                        mv_val = mv_cand
                        break

            # Fee
            fee_td = cells[-1]
            fee_raw = fee_td.get_text(strip=True)
            fee_eur = parse_money(fee_raw)

            low = fee_raw.lower()
            fee_type = "unknown"
            if "free" in low or "ablösefrei" in low or "gratuito" in low:
                fee_type = "free"
            elif "loan" in low or "prestito" in low or "leihe" in low:
                fee_type = "loan"
            elif "end of loan" in low or "fine prestito" in low:
                fee_type = "end_of_loan"
            elif fee_eur is not None and fee_eur > 0:
                fee_type = "fee"

            # Stable transfer_id
            transfer_id = f"{season}_{direction}_{player_id}_{other_club_id}"

            rows.append({
                "transfer_id": transfer_id,
                "season": season,
                "direction": direction,
                "player_id": player_id,
                "player_name": player_name,
                "age": age,
                "market_value_eur": mv_val,
                "other_club": other_club,
                "other_club_id": other_club_id,
                "fee_raw": fee_raw,
                "fee_eur": fee_eur,
                "fee_type": fee_type,
            })

    return rows


def parse_season_staff(soup: BeautifulSoup, season: int) -> List[Dict[str, Any]]:
    """Parse club staff, coaching staff, medical team, and management."""
    rows: List[Dict[str, Any]] = []

    for t in soup.select("table"):
        th_list = [h.get_text(" ", strip=True) for h in t.select("th")]
        if not ("Name/Position" in th_list or any("Name" in x for x in th_list)):
            continue

        for tr in t.select("tbody > tr"):
            cells = tr.find_all("td", recursive=False)
            if not cells:
                continue

            staff_a = tr.select_one("table.inline-table a") or tr.select_one("a[href*='/profil/']")
            if not staff_a:
                continue

            href = staff_a.get("href", "")
            sid_m = re.search(r"/(\d+)$", href) or re.search(r"/(\d+)/", href)
            staff_id = sid_m.group(1) if sid_m else staff_a.get_text(strip=True)
            name = staff_a.get_text(strip=True)

            role_el = tr.select_one("table.inline-table tr:nth-of-type(2)")
            role = role_el.get_text(strip=True) if role_el else (cells[1].get_text(strip=True) if len(cells) > 1 else None)
            age = parse_int(cells[1].get_text(strip=True)) if len(cells) > 1 else None

            flag_img = tr.select_one("img.flaggenrahmen")
            nationality = flag_img.get("title") if flag_img else None

            joined_date = None
            contract_until = None
            if len(cells) > 3:
                joined_date = parse_date(cells[3].get_text(strip=True))
            if len(cells) > 4:
                contract_until = parse_date(cells[4].get_text(strip=True))

            rows.append({
                "season": season,
                "staff_id": staff_id,
                "name": name,
                "role": role,
                "age": age,
                "nationality": nationality,
                "joined_date": joined_date,
                "contract_until": contract_until,
            })

    return rows
