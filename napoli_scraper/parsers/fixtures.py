"""
Parser for Season Fixtures, Match Results, and Detailed Match Reports (Goals, Cards, Subs).
"""

from __future__ import annotations
import json
import re
from typing import Any, Dict, List, Tuple
from bs4 import BeautifulSoup

from ..config import parse_date, parse_int, TM_HOST


def clean_url(href: str | None) -> str | None:
    if not href:
        return None
    if href.startswith("http"):
        return href
    return f"https://{TM_HOST}{href}"


def parse_season_fixtures(soup: BeautifulSoup, season: int) -> List[Dict[str, Any]]:
    """Parse all matches across all competitions in a season."""
    matches: List[Dict[str, Any]] = []

    tables = soup.select("table")
    for t in tables:
        th_list = [h.get_text(" ", strip=True) for h in t.select("th")]
        if not ("Matchday" in th_list or any("Matchday" in x for x in th_list)):
            continue

        prev = t.find_previous(["h2", "div.content-box-headline"])
        competition = prev.get_text(" ", strip=True) if prev else "Unknown Competition"

        for tr in t.select("tbody > tr"):
            cells = tr.find_all("td", recursive=False)
            if len(cells) < 6:
                continue

            matchday = cells[0].get_text(strip=True)
            date_raw = cells[1].get_text(strip=True)
            time_raw = cells[2].get_text(strip=True) if len(cells) > 2 else None
            venue = cells[3].get_text(strip=True) if len(cells) > 3 else None
            rank_at_match = cells[4].get_text(strip=True) if len(cells) > 4 else None

            # Opponent
            opp_a = tr.select_one('td.no-border-links a[href*="/verein/"]') or tr.select_one('a[href*="/verein/"]')
            opp_name = opp_a.get_text(strip=True) if opp_a else None
            opp_id = None
            if opp_a:
                om = re.search(r"/verein/(\d+)", opp_a.get("href", ""))
                if om:
                    opp_id = om.group(1)

            # System of play
            system_of_play = None
            attendance = None
            for td in cells:
                txt = td.get_text(strip=True)
                if re.match(r"^\d-\d-\d", txt):
                    system_of_play = txt
                elif re.match(r"^\d{1,3}\.\d{3}$", txt):
                    attendance = parse_int(txt)

            # Result and match report link
            report_a = tr.select_one('a[href*="/spielbericht/"]')
            report_url = clean_url(report_a.get("href")) if report_a else None
            result_txt = report_a.get_text(strip=True) if report_a else None

            match_id = None
            if report_a:
                mm = re.search(r"/spielbericht/(\d+)", report_a.get("href", ""))
                if mm:
                    match_id = mm.group(1)

            if not match_id:
                # generate pseudo id if not played yet or missing
                match_id = f"{season}_{competition}_{matchday}_{opp_id}"

            home_goals, away_goals = None, None
            if result_txt and ":" in result_txt:
                parts = result_txt.split(":")
                home_goals = parse_int(parts[0])
                away_goals = parse_int(parts[1])

            matches.append({
                "match_id": match_id,
                "season": season,
                "competition": competition,
                "matchday": matchday,
                "match_date": parse_date(date_raw),
                "match_time": time_raw,
                "venue": venue,
                "rank_at_match": rank_at_match,
                "opponent_id": opp_id,
                "opponent_name": opp_name,
                "system_of_play": system_of_play,
                "attendance": attendance,
                "result": result_txt,
                "home_goals": home_goals,
                "away_goals": away_goals,
                "report_url": report_url,
            })

    return matches


def parse_match_report(soup: BeautifulSoup, match_id: str) -> List[Dict[str, Any]]:
    """Parse detailed match report events (Goals, Cards, Substitutions)."""
    events: List[Dict[str, Any]] = []

    # 1. Goals
    tore_div = soup.select_one("#sb-tore")
    if tore_div:
        for li in tore_div.select("li"):
            txt = li.get_text(" ", strip=True)
            minute_m = re.search(r"(\d+)['\.]", txt)
            minute = int(minute_m.group(1)) if minute_m else 0

            # Scorer: find named link
            named_links = [a for a in li.select("a") if a.get_text(strip=True)]
            scorer_name = None
            scorer_id = None
            assist_name = None
            assist_id = None

            if named_links:
                scorer_name = named_links[0].get_text(strip=True)
                sm = re.search(r"/spieler/(\d+)", named_links[0].get("href", ""))
                scorer_id = sm.group(1) if sm else None

            if len(named_links) > 1 and "Assist:" in txt:
                assist_name = named_links[1].get_text(strip=True)
                am = re.search(r"/spieler/(\d+)", named_links[1].get("href", ""))
                assist_id = am.group(1) if am else None

            # Club link
            club_a = li.select_one('a[href*="/verein/"]')
            club_name = club_a.get_text(strip=True) if club_a else None
            club_id = None
            if club_a:
                cm = re.search(r"/verein/(\d+)", club_a.get("href", ""))
                if cm:
                    club_id = cm.group(1)

            detail = {
                "scorer": scorer_name,
                "scorer_id": scorer_id,
                "assist": assist_name,
                "assist_id": assist_id,
                "raw_description": txt,
            }

            events.append({
                "match_id": match_id,
                "event_type": "goal",
                "minute": minute,
                "stoppage_time": 0,
                "player_id": scorer_id,
                "player_name": scorer_name,
                "club_id": club_id,
                "club_name": club_name,
                "detail_json": json.dumps(detail, ensure_ascii=False),
            })

    # 2. Cards
    karten_div = soup.select_one("#sb-karten")
    if karten_div:
        for li in karten_div.select("li"):
            txt = li.get_text(" ", strip=True)
            minute_m = re.search(r"(\d+)['\.]", txt)
            minute = int(minute_m.group(1)) if minute_m else 0

            stoppage_m = re.search(r"\+(\d+)", txt)
            stoppage = int(stoppage_m.group(1)) if stoppage_m else 0

            named_links = [a for a in li.select("a") if a.get_text(strip=True)]
            player_name = named_links[0].get_text(strip=True) if named_links else None
            player_id = None
            if named_links:
                pm = re.search(r"/spieler/(\d+)", named_links[0].get("href", ""))
                player_id = pm.group(1) if pm else None

            club_a = li.select_one('a[href*="/verein/"]')
            club_name = club_a.get_text(strip=True) if club_a else None
            club_id = None
            if club_a:
                cm = re.search(r"/verein/(\d+)", club_a.get("href", ""))
                if cm:
                    club_id = cm.group(1)

            card_type = "Yellow card"
            low = txt.lower()
            if "red card" in low or "rote karte" in low:
                card_type = "Red card"
            elif "second yellow" in low or "gelb-rot" in low:
                card_type = "Second yellow"

            detail = {"card_type": card_type, "raw": txt}

            events.append({
                "match_id": match_id,
                "event_type": "card",
                "minute": minute,
                "stoppage_time": stoppage,
                "player_id": player_id,
                "player_name": player_name,
                "club_id": club_id,
                "club_name": club_name,
                "detail_json": json.dumps(detail, ensure_ascii=False),
            })

    # 3. Substitutions
    wechsel_div = soup.select_one("#sb-wechsel")
    if wechsel_div:
        for li in wechsel_div.select("li"):
            txt = li.get_text(" ", strip=True)
            minute_m = re.search(r"(\d+)['\.]", txt)
            minute = int(minute_m.group(1)) if minute_m else 0

            stoppage_m = re.search(r"\+(\d+)", txt)
            stoppage = int(stoppage_m.group(1)) if stoppage_m else 0

            named_links = [a for a in li.select("a") if a.get_text(strip=True)]
            player_in_name = named_links[0].get_text(strip=True) if len(named_links) > 0 else None
            player_in_id = None
            if len(named_links) > 0:
                p_in_m = re.search(r"/spieler/(\d+)", named_links[0].get("href", ""))
                player_in_id = p_in_m.group(1) if p_in_m else None

            player_out_name = named_links[1].get_text(strip=True) if len(named_links) > 1 else None
            player_out_id = None
            if len(named_links) > 1:
                p_out_m = re.search(r"/spieler/(\d+)", named_links[1].get("href", ""))
                player_out_id = p_out_m.group(1) if p_out_m else None

            club_a = li.select_one('a[href*="/verein/"]')
            club_name = club_a.get_text(strip=True) if club_a else None
            club_id = None
            if club_a:
                cm = re.search(r"/verein/(\d+)", club_a.get("href", ""))
                if cm:
                    club_id = cm.group(1)

            reason = "Tactical" if "tactical" in txt.lower() else ("Injury" if "injury" in txt.lower() else "Unknown")

            detail = {
                "player_in": player_in_name,
                "player_in_id": player_in_id,
                "player_out": player_out_name,
                "player_out_id": player_out_id,
                "reason": reason,
                "raw": txt,
            }

            events.append({
                "match_id": match_id,
                "event_type": "substitution",
                "minute": minute,
                "stoppage_time": stoppage,
                "player_id": player_in_id,
                "player_name": f"In: {player_in_name} / Out: {player_out_name}",
                "club_id": club_id,
                "club_name": club_name,
                "detail_json": json.dumps(detail, ensure_ascii=False),
            })

    return events
