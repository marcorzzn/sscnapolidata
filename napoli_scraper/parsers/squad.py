"""
Parser for Season Squads (Roster).
"""

from __future__ import annotations
import re
from typing import Any, Dict, List
from bs4 import BeautifulSoup

from ..config import parse_date, parse_height, parse_int, parse_money


def parse_season_squad(soup: BeautifulSoup, season: int) -> List[Dict[str, Any]]:
    """Parse complete season squad roster."""
    rows: List[Dict[str, Any]] = []
    table = soup.select_one("#yw1 table.items") or soup.select_one("table.items")
    if not table:
        return rows

    current_group = None

    for tr in table.select("tbody > tr"):
        cells = tr.find_all("td", recursive=False)
        if not cells:
            continue

        # Check if this row is a position group header (e.g. "Goalkeepers", "Defenders")
        if len(cells) == 1 or "tfoot" in tr.parent.name:
            txt = tr.get_text(" ", strip=True)
            if txt:
                current_group = txt
            continue

        player_a = tr.select_one('a[href*="/profil/spieler/"]')
        if not player_a:
            continue

        href = player_a.get("href", "")
        pid_m = re.search(r"/profil/spieler/(\d+)", href) or re.search(r"/spieler/(\d+)", href)
        if not pid_m:
            continue
        player_id = pid_m.group(1)
        player_name = player_a.get_text(strip=True)

        # Shirt number
        shirt_num = None
        nr_cell = tr.select_one("td.rn_nummer, div.rn_nummer")
        if nr_cell:
            shirt_num = parse_int(nr_cell.get_text(strip=True))

        # Position (from inline table or cell)
        nested_tr = tr.select("table.inline-table tr")
        position = None
        if len(nested_tr) > 1:
            position = nested_tr[1].get_text(strip=True)

        # Flags / Nationalities
        nationalities = [img.get("title") for img in tr.select("img.flaggenrahmen") if img.get("title")]
        nat_str = ", ".join(nationalities) if nationalities else None

        # Details from remaining cells (by class or index)
        birth_date = None
        age = None
        height_m = None
        foot = None
        joined_date = None
        contract_until = None
        signed_from_club = None
        signed_from_id = None
        market_val = None

        for td in cells:
            cls = td.get("class", [])
            txt = td.get_text(" ", strip=True)

            # Zentriert cells usually hold birth date, height, foot, joined, contract
            if "zentriert" in cls:
                if "(" in txt and ")" in txt and any(c.isdigit() for c in txt):
                    # e.g. May 14, 1997 (27)
                    birth_date = parse_date(txt.split("(")[0])
                    age_m = re.search(r"\((\d+)\)", txt)
                    if age_m:
                        age = int(age_m.group(1))
                elif any(h in txt for h in ["m", "cm"]):
                    height_m = parse_height(txt)
                elif txt.lower() in ("right", "left", "both", "destro", "sinistro", "rechts", "links"):
                    foot = txt.capitalize()
                elif re.search(r"\d{1,2}[./]\d{1,2}[./]\d{4}", txt) or any(m in txt.lower() for m in ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]):
                    # Could be joined or contract
                    d = parse_date(txt)
                    if d:
                        if not joined_date:
                            joined_date = d
                        else:
                            contract_until = d

            # Market value cell
            if "rechts" in cls and "hauptlink" in cls:
                val = parse_money(txt)
                if val is not None:
                    market_val = val

            # Signed from
            club_a = td.select_one('a[href*="/verein/"]')
            if club_a and not signed_from_club:
                signed_from_club = club_a.get_text(strip=True)
                cm = re.search(r"/verein/(\d+)", club_a.get("href", ""))
                if cm:
                    signed_from_id = cm.group(1)

        rows.append({
            "season": season,
            "player_id": player_id,
            "player_name": player_name,
            "shirt_number": shirt_num,
            "position_group": current_group,
            "position": position,
            "birth_date": birth_date,
            "age": age,
            "nationalities": nat_str,
            "height_m": height_m,
            "foot": foot,
            "joined_date": joined_date,
            "contract_until": contract_until,
            "market_value_eur": market_val,
            "signed_from_club": signed_from_club,
            "signed_from_id": signed_from_id,
        })

    return rows
