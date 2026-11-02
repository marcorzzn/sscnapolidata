"""
Parser for Player Master Profile, Clinical/Technical Injury & Absence Records, and Market Value History.
"""

from __future__ import annotations
import re
from typing import Any, Dict, List, Optional
from bs4 import BeautifulSoup

from ..config import (
    classify_absence,
    parse_date,
    parse_height,
    parse_int,
    parse_money,
)


def parse_player_master(soup: BeautifulSoup, player_id: str) -> Dict[str, Any]:
    """Parse comprehensive player profile from header and info-table."""
    res: Dict[str, Any] = {
        "player_id": player_id,
        "full_name": None,
        "display_name": None,
        "birth_date": None,
        "birth_place": None,
        "citizenship": None,
        "height_m": None,
        "foot": None,
        "main_position": None,
        "other_positions": None,
        "agent": None,
        "current_club": None,
        "current_club_id": None,
        "current_market_value_eur": None,
        "highest_market_value_eur": None,
        "highest_market_value_date": None,
        "scraped_at": None,
    }

    # Display name from H1
    h1 = soup.select_one("h1.data-header__headline-wrapper, header.data-header h1")
    if h1:
        res["display_name"] = h1.get_text(" ", strip=True)

    # Info table details
    info: Dict[str, str] = {}
    for row in soup.select("div.info-table span.info-table__content--bold, div.info-table span.info-table__content--regular"):
        parent = row.parent
        if parent:
            label_el = parent.select_one("span.info-table__content--regular")
            val_el = parent.select_one("span.info-table__content--bold")
            if label_el and val_el:
                k = label_el.get_text(strip=True).rstrip(":").lower()
                v = val_el.get_text(" ", strip=True)
                info[k] = v

    # Fallback to general table/list if modern layout differs
    for li in soup.select("ul.data-header__items li"):
        txt = li.get_text(" ", strip=True)
        if ":" in txt:
            k, v = txt.split(":", 1)
            info[k.strip().lower()] = v.strip()

    res["full_name"] = info.get("name in home country") or info.get("full name") or res["display_name"]
    res["birth_place"] = info.get("place of birth") or info.get("geburtsort")
    res["citizenship"] = info.get("citizenship") or info.get("staatsbürgerschaft")

    # Birth date
    if b_raw := (info.get("date of birth/age") or info.get("date of birth") or info.get("geburtsdatum")):
        res["birth_date"] = parse_date(b_raw.split("(")[0])

    # Height
    if h_raw := (info.get("height") or info.get("größe")):
        res["height_m"] = parse_height(h_raw)

    # Foot
    if f_raw := (info.get("foot") or info.get("fuß")):
        res["foot"] = f_raw.capitalize()

    # Agent
    res["agent"] = info.get("player agent") or info.get("spielerberater")

    # Current club
    club_a = soup.select_one("span.data-header__club a, div.data-header__club-info a")
    if club_a:
        res["current_club"] = club_a.get_text(strip=True)
        if cm := re.search(r"/verein/(\d+)", club_a.get("href", "")):
            res["current_club_id"] = cm.group(1)

    # Main position
    pos_el = soup.select_one("dd.detail-position__position, span.data-header__content--position")
    if pos_el:
        res["main_position"] = pos_el.get_text(strip=True)
    elif "position" in info:
        res["main_position"] = info["position"]

    # Market values
    mv_wrapper = soup.select_one(".data-header__market-value-wrapper, .marktwert")
    if mv_wrapper:
        res["current_market_value_eur"] = parse_money(mv_wrapper.get_text(strip=True))

    highest_mv_el = soup.select_one("div.data-header__box--small span.data-header__market-value-wrapper, div.quick-fact__content")
    if highest_mv_el:
        res["highest_market_value_eur"] = parse_money(highest_mv_el.get_text(strip=True))

    return res


def parse_player_injuries(soup: BeautifulSoup, player_id: str) -> List[Dict[str, Any]]:
    """
    Parse complete injury, illness, and suspension history from /player/verletzungen/spieler/{pid}.
    Distinguishes and classifies every absence cause:
    - Physical Injury (hamstring, cruciate tear, broken bone, etc.)
    - Illness / Medical (flu, infection, coronavirus, etc.)
    - Disciplinary / Suspension (yellow card, red card, ban, etc.)
    - Club Exclusion / Technical (fitness, quarantine, internal suspension, etc.)
    - International Duty (AFCON, Asian Cup, etc.)
    """
    rows: List[Dict[str, Any]] = []
    table = soup.select_one("table.items")
    if not table:
        return rows

    for tr in table.select("tbody > tr"):
        cells = tr.select("td")
        if len(cells) < 4:
            continue

        season = cells[0].get_text(strip=True)
        injury_raw = cells[1].get_text(" ", strip=True)
        if not injury_raw:
            continue

        # Classify the absence cause using medical/disciplinary taxonomy
        category = classify_absence(injury_raw)

        from_date = parse_date(cells[2].get_text(strip=True))
        until_date = parse_date(cells[3].get_text(strip=True))

        days_raw = cells[4].get_text(strip=True) if len(cells) > 4 else None
        days_missed = parse_int(days_raw)

        games_cell = cells[5] if len(cells) > 5 else None
        games_raw = games_cell.get_text(strip=True) if games_cell else None
        games_missed = parse_int(games_raw) if (games_raw and games_raw != "-") else 0

        # Clubs affected (for which matches were missed)
        affected_clubs = []
        if games_cell:
            for ca in games_cell.select('a[href*="/verein/"]'):
                c_name = ca.get_text(strip=True) or ca.get("title")
                if c_name and c_name not in affected_clubs:
                    affected_clubs.append(c_name)

        rows.append({
            "player_id": player_id,
            "season": season,
            "injury_raw": injury_raw,
            "category": category,
            "from_date": from_date,
            "until_date": until_date,
            "days_missed": days_missed,
            "games_missed": games_missed,
            "clubs_affected": ", ".join(affected_clubs) if affected_clubs else None,
        })

    return rows


def parse_player_market_values(json_data: Optional[Dict[str, Any]], player_id: str) -> List[Dict[str, Any]]:
    """
    Parse historical market value data points from the official Transfermarkt JSON API:
    https://tmapi.transfermarkt.technology/player/{playerId}/market-value-history
    """
    rows: List[Dict[str, Any]] = []
    if not json_data or not isinstance(json_data, dict):
        return rows

    history = json_data.get("data", {}).get("history", [])
    if not isinstance(history, list):
        return rows

    for item in history:
        if not isinstance(item, dict):
            continue

        mv_obj = item.get("marketValue", {})
        val = mv_obj.get("value")
        det_date = mv_obj.get("determined")

        if val is None or not det_date:
            continue

        rows.append({
            "player_id": player_id,
            "date": det_date,
            "market_value_eur": float(val),
            "age": item.get("age"),
            "club_id": item.get("clubId"),
            "season_id": item.get("seasonId"),
        })

    return rows
