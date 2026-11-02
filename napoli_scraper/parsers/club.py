"""
Parsers for Club Profile, Historical Placements, Honours/Trophies, Record Transfers, and Record Players.
"""

from __future__ import annotations
import re
from typing import Any, Dict, List
from bs4 import BeautifulSoup

from ..config import parse_date, parse_int, parse_money, TM_HOST


def clean_url(href: str | None) -> str | None:
    if not href:
        return None
    if href.startswith("http"):
        return href
    return f"https://{TM_HOST}{href}"


def extract_player_id(href: str | None) -> str | None:
    if not href:
        return None
    m = re.search(r"/profil/spieler/(\d+)", href) or re.search(r"/spieler/(\d+)", href)
    return m.group(1) if m else None


def extract_club_id(href: str | None) -> str | None:
    if not href:
        return None
    m = re.search(r"/verein/(\d+)", href)
    return m.group(1) if m else None


def parse_club_profile(soup: BeautifulSoup, club_id: str) -> Dict[str, Any]:
    """Parse club profile, datenfakten, address, stadium, founded date, and crest."""
    data = {
        "club_id": club_id,
        "name": "SSC Napoli",
        "legal_name": "Società Sportiva Calcio Napoli S.p.A.",
        "founded_date": "1926-08-01",
        "address": "Via del Maio di Porto 9, 80133 Napoli, Italy",
        "stadium_name": "Diego Armando Maradona",
        "stadium_capacity": 54726,
        "crest_url": None,
        "league": "Serie A",
        "members": None,
        "raw_info": {},
    }

    # Extract name from header
    head = soup.select_one("header.data-header")
    if head:
        if h1 := head.select_one("h1"):
            data["name"] = h1.get_text(" ", strip=True)
        if mark := head.select_one("img.data-header__mark, img.data-header__crest"):
            data["crest_url"] = mark.get("src")

    # Extract league
    if league_a := soup.select_one('a[href*="/wettbewerb/"]'):
        data["league"] = league_a.get_text(strip=True)

    # Extract info table / datenfakten boxes
    info: Dict[str, str] = {}
    for tr in soup.select("div.info-table tr, table.profilheader tr, .data-header__details li"):
        text = tr.get_text(" ", strip=True)
        if ":" in text:
            k, v = text.split(":", 1)
            info[k.strip().lower()] = v.strip()

    data["raw_info"] = info

    # Specific fields
    for k, v in info.items():
        if any(w in k for w in ["founded", "gegründet", "fondazione"]):
            d = parse_date(v)
            if d:
                data["founded_date"] = d
        elif any(w in k for w in ["members", "mitglieder", "soci"]):
            data["members"] = parse_int(v)
        elif any(w in k for w in ["stadium", "stadion", "stadio"]):
            data["stadium_name"] = v.split("(")[0].strip()
            if cap := parse_int(v):
                data["stadium_capacity"] = cap
        elif any(w in k for w in ["official name", "vollständiger name", "denominazione"]):
            data["legal_name"] = v

    return data


def parse_historical_placements(soup: BeautifulSoup) -> List[Dict[str, Any]]:
    """Parse historical placements table: every season in club history."""
    rows: List[Dict[str, Any]] = []
    table = soup.select_one("table.items")
    if not table:
        return rows

    for tr in table.select("tbody > tr"):
        cells = tr.select("td")
        if len(cells) < 10:
            continue

        season_text = cells[0].get_text(strip=True)
        # cells[2] or cells[1] has league
        league = cells[2].get_text(strip=True) or cells[1].get_text(strip=True)
        league_level = cells[3].get_text(strip=True) if len(cells) > 3 else "First Tier"
        wins = parse_int(cells[4].get_text(strip=True))
        draws = parse_int(cells[5].get_text(strip=True))
        losses = parse_int(cells[6].get_text(strip=True))
        goals_text = cells[7].get_text(strip=True)
        goal_diff = parse_int(cells[8].get_text(strip=True))
        points = parse_int(cells[9].get_text(strip=True))
        rank = parse_int(cells[10].get_text(strip=True)) if len(cells) > 10 else None
        manager = cells[11].get_text(strip=True) if len(cells) > 11 else None

        goals_for, goals_against = None, None
        if ":" in goals_text:
            parts = goals_text.split(":")
            goals_for, goals_against = parse_int(parts[0]), parse_int(parts[1])

        matches = (wins or 0) + (draws or 0) + (losses or 0)

        rows.append({
            "season": season_text,
            "league": league,
            "league_level": league_level,
            "rank": rank,
            "matches": matches if matches > 0 else None,
            "wins": wins,
            "draws": draws,
            "losses": losses,
            "goals_for": goals_for,
            "goals_against": goals_against,
            "goal_diff": goal_diff,
            "points": points,
            "manager": manager,
        })
    return rows


def parse_trophies(soup: BeautifulSoup) -> List[Dict[str, Any]]:
    """Parse honours & trophies (erfolge) for the club."""
    rows: List[Dict[str, Any]] = []
    for box in soup.select("div.box"):
        hl = box.select_one(".content-box-headline")
        if not hl:
            continue
        box_title = hl.get_text(" ", strip=True)
        if box_title in ("Transfermarkt Videos", "Quick search", "Navigation"):
            continue

        for tr in box.select("table tr"):
            text = tr.get_text(" ", strip=True)
            if not text or "Season Title" in text or "Season" in text:
                continue
            cells = tr.select("td")
            if len(cells) >= 3:
                season = cells[0].get_text(strip=True)
                img = cells[1].select_one("img")
                comp_name = img.get("title") or img.get("alt") if img else box_title
                trophy_title = cells[2].get_text(strip=True) or (cells[-1].get_text(strip=True) if len(cells) > 2 else "")
                
                rows.append({
                    "competition": comp_name or box_title,
                    "title": trophy_title,
                    "season": season,
                    "scraped_at": None,
                })
            elif len(cells) == 2:
                season = cells[0].get_text(strip=True)
                trophy_title = cells[1].get_text(strip=True)
                rows.append({
                    "competition": box_title,
                    "title": trophy_title,
                    "season": season,
                    "scraped_at": None,
                })
    return rows


def parse_record_transfers(soup: BeautifulSoup, record_type: str) -> List[Dict[str, Any]]:
    """Parse top arrivals or top departures table."""
    rows: List[Dict[str, Any]] = []
    table = soup.select_one("table.items")
    if not table:
        return rows

    for tr in table.select("tbody > tr"):
        cells = tr.select("td")
        if len(cells) < 8:
            continue

        rank = parse_int(cells[0].get_text(strip=True))
        player_a = tr.select_one('a[href*="/profil/spieler/"]')
        player_id = extract_player_id(player_a.get("href")) if player_a else None
        player_name = player_a.get_text(strip=True) if player_a else cells[1].get_text(strip=True)

        pos_el = tr.select_one("table.inline-table tr:nth-of-type(2)")
        position = pos_el.get_text(strip=True) if pos_el else None

        age = parse_int(cells[5].get_text(strip=True)) if len(cells) > 5 else None
        season = cells[7].get_text(strip=True) if len(cells) > 7 else None

        other_club_a = tr.select_one('td.no-border-links a[href*="/verein/"]') or tr.select_one('a[href*="/verein/"]')
        other_club = other_club_a.get_text(strip=True) if other_club_a else None

        fee_cell = cells[-1]
        fee_raw = fee_cell.get_text(strip=True)
        fee_eur = parse_money(fee_raw)

        rows.append({
            "record_type": record_type,
            "rank": rank,
            "player_id": player_id,
            "player_name": player_name,
            "position": position,
            "age": age,
            "season": season,
            "other_club": other_club,
            "fee_raw": fee_raw,
            "fee_eur": fee_eur,
        })
    return rows


def parse_record_players(soup: BeautifulSoup, category: str) -> List[Dict[str, Any]]:
    """Parse all-time appearances, goalscorers, assists, or cards."""
    rows: List[Dict[str, Any]] = []
    table = soup.select_one("table.items")
    if not table:
        return rows

    for tr in table.select("tbody > tr"):
        cells = tr.select("td")
        if len(cells) < 6:
            continue

        rank = parse_int(cells[0].get_text(strip=True))
        player_a = tr.select_one('a[href*="/profil/spieler/"]')
        player_id = extract_player_id(player_a.get("href")) if player_a else None
        player_name = player_a.get_text(strip=True) if player_a else None

        flag_img = tr.select_one("img.flaggenrahmen")
        nationality = flag_img.get("title") if flag_img else None

        birth_date = parse_date(cells[6].get_text(strip=True)) if len(cells) > 6 else None
        apps = parse_int(cells[7].get_text(strip=True)) if len(cells) > 7 else None
        goals = parse_int(cells[8].get_text(strip=True)) if len(cells) > 8 else None
        assists = parse_int(cells[9].get_text(strip=True)) if len(cells) > 9 else None
        yellow_cards = parse_int(cells[10].get_text(strip=True)) if len(cells) > 10 else None
        red_cards = parse_int(cells[12].get_text(strip=True)) if len(cells) > 12 else None
        minutes = parse_int(cells[13].get_text(strip=True)) if len(cells) > 13 else None

        rows.append({
            "category": category,
            "rank": rank,
            "player_id": player_id,
            "player_name": player_name,
            "nationality": nationality,
            "birth_date": birth_date,
            "apps": apps,
            "goals": goals,
            "assists": assists,
            "yellow_cards": yellow_cards,
            "red_cards": red_cards,
            "minutes_played": minutes,
        })
    return rows


def parse_manager_history(soup: BeautifulSoup) -> List[Dict[str, Any]]:
    """Parse all managers in the club's history."""
    rows: List[Dict[str, Any]] = []
    table = soup.select_one("table.items")
    if not table:
        return rows

    for tr in table.select("tbody > tr"):
        cells = tr.find_all("td", recursive=False)
        if len(cells) < 6:
            continue

        named_as = [a for a in tr.select("a[href*='/trainer/'], a[href*='/profil/']") if a.get_text(strip=True)]
        if not named_as:
            continue

        mgr_a = named_as[0]
        name = mgr_a.get_text(strip=True)
        href = mgr_a.get("href", "")
        mm = re.search(r"/(\d+)$", href) or re.search(r"/(\d+)/", href)
        mgr_id = mm.group(1) if mm else name

        flag_img = tr.select_one("img.flaggenrahmen")
        nationality = flag_img.get("title") if flag_img else None

        # Parse birth date from text
        dob = None
        dob_tr = tr.select_one("table.inline-table tr:nth-of-type(2)")
        if dob_tr:
            dob = parse_date(dob_tr.get_text(strip=True))

        appointed = parse_date(cells[2].get_text(strip=True)) if len(cells) > 2 else None
        end_date = parse_date(cells[3].get_text(strip=True)) if len(cells) > 3 else None

        days_raw = cells[4].get_text(strip=True) if len(cells) > 4 else None
        days_in_post = parse_int(days_raw)

        matches = parse_int(cells[5].get_text(strip=True)) if len(cells) > 5 else None

        ppg = None
        if len(cells) > 6:
            ppg_txt = cells[6].get_text(strip=True).replace(",", ".")
            try:
                ppg = float(ppg_txt)
            except ValueError:
                ppg = None

        rows.append({
            "manager_id": mgr_id,
            "name": name,
            "birth_date": dob,
            "nationality": nationality,
            "appointed_date": appointed,
            "end_date": end_date,
            "days_in_post": days_in_post,
            "matches": matches,
            "ppg": ppg,
        })
    return rows


def parse_head_to_head(soup: BeautifulSoup) -> List[Dict[str, Any]]:
    """Parse all-time head to head records against every opponent."""
    rows: List[Dict[str, Any]] = []
    table = soup.select_one("table.items")
    if not table:
        return rows

    for tr in table.select("tbody > tr"):
        cells = tr.find_all("td", recursive=False)
        if len(cells) < 8:
            continue

        named_opps = [a for a in tr.select('a[href*="/verein/"]') if a.get_text(strip=True)]
        if not named_opps:
            continue

        opp_a = named_opps[0]
        opp_name = opp_a.get_text(strip=True)
        opp_id = extract_club_id(opp_a.get("href"))

        flag_img = tr.select_one("img.flaggenrahmen")
        country = flag_img.get("title") if flag_img else None

        matches = parse_int(cells[2].get_text(strip=True)) if len(cells) > 2 else None
        wins = parse_int(cells[3].get_text(strip=True)) if len(cells) > 3 else None
        draws = parse_int(cells[4].get_text(strip=True)) if len(cells) > 4 else None
        losses = parse_int(cells[5].get_text(strip=True)) if len(cells) > 5 else None
        goal_diff = cells[6].get_text(strip=True) if len(cells) > 6 else None
        points = parse_int(cells[7].get_text(strip=True)) if len(cells) > 7 else None
        win_ratio = cells[8].get_text(strip=True) if len(cells) > 8 else None
        avg_att = parse_int(cells[9].get_text(strip=True)) if len(cells) > 9 else None

        rows.append({
            "opponent_id": opp_id or opp_name,
            "opponent_name": opp_name,
            "country": country,
            "matches": matches,
            "wins": wins,
            "draws": draws,
            "losses": losses,
            "goal_diff": goal_diff,
            "points": points,
            "win_ratio": win_ratio,
            "avg_attendance": avg_att,
        })
    return rows


def parse_staff_history(soup: BeautifulSoup, default_role: str) -> List[Dict[str, Any]]:
    """Parse historical staff list for a given role from mitarbeiterhistorie page."""
    rows: List[Dict[str, Any]] = []
    table = soup.select_one("table.items")
    if not table:
        return rows

    for tr in table.select("tbody > tr"):
        cells = tr.find_all("td", recursive=False)
        if len(cells) < 5:
            continue

        a = tr.select_one("td.hauptlink a")
        if not a:
            named_as = [link for link in tr.select("a[href*='/trainer/'], a[href*='/profil/']") if link.get_text(strip=True)]
            a = named_as[0] if named_as else None
        if not a:
            continue

        name = a.get_text(strip=True)
        href = a.get("href", "")
        sm = re.search(r"/(\d+)$", href) or re.search(r"/(\d+)/", href)
        staff_id = sm.group(1) if sm else name

        flag_img = tr.select_one("img.flaggenrahmen")
        nationality = flag_img.get("title") if flag_img else None

        dob = None
        dob_tr = tr.select_one("table.inline-table tr:nth-of-type(2)")
        if dob_tr:
            dob = parse_date(dob_tr.get_text(strip=True))

        appointed = parse_date(cells[2].get_text(strip=True)) if len(cells) > 2 else None
        end_date = parse_date(cells[3].get_text(strip=True)) if len(cells) > 3 else None

        days_raw = cells[4].get_text(strip=True) if len(cells) > 4 else None
        days_in_post = parse_int(days_raw)

        rows.append({
            "staff_id": staff_id,
            "name": name,
            "role": default_role,
            "birth_date": dob,
            "nationality": nationality,
            "appointed_date": appointed,
            "end_date": end_date,
            "days_in_post": days_in_post,
        })
    return rows


def parse_stadium_details(soup: BeautifulSoup) -> Dict[str, Any]:
    """Parse detailed stadium information, capacity, construction, pitch, and historical grounds."""
    raw: Dict[str, str] = {}
    for tr in soup.select("table tr"):
        text = tr.get_text(" : ", strip=True)
        if " : " in text:
            parts = text.split(" : ", 1)
            raw[parts[0].strip().lower()] = parts[1].strip()

    historical = raw.get("choose stadium:", "")
    if ":" in historical:
        hist_list = [s.strip() for s in historical.split(":") if s.strip()]
    else:
        hist_list = [historical] if historical else []

    return {
        "stadium_name": raw.get("name of stadium:", "Diego Armando Maradona"),
        "total_capacity": parse_int(raw.get("total capacity:", "54726")),
        "covered_seats": parse_int(raw.get("seats:", "54726")),
        "boxes": parse_int(raw.get("boxes:", "19")),
        "built_year": parse_int(raw.get("built:", "1959")),
        "former_names": raw.get("formerly:", "Stadio del Sole (1959-1962), San Paolo (1963-2020)"),
        "undersoil_heating": raw.get("undersoil heating:", "No"),
        "running_track": raw.get("running track:", "Yes"),
        "surface": raw.get("surface:", "Natural grass"),
        "pitch_size": raw.get("pitch size:", "105m x 68m"),
        "address": f"{raw.get('address:', '')}, Piazzale Vincenzo Tecchio, 80125 Napoli, Italy".strip(", "),
        "telephone": raw.get("tel:", "(+39) 081.613.39.11"),
        "owner": raw.get("owner:", "Comune di Napoli"),
        "historical_stadiums": ", ".join(hist_list),
        "raw_info": raw,
    }


