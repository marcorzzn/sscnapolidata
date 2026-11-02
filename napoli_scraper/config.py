"""
Configuration, constants, regex helpers, and taxonomy classification.
"""

from __future__ import annotations
import re
from datetime import datetime
from pathlib import Path

# Club constants
NAPOLI_CLUB_ID = "6195"
NAPOLI_SLUG = "ssc-napoli"
TM_HOST = "www.transfermarkt.com"
TM_API_BASE = "https://tmapi.transfermarkt.technology"

# Storage paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DIST_DIR = BASE_DIR / "data" / "exports"
CACHE_DIR = BASE_DIR / ".cache" / "napoli"
DB_PATH = BASE_DIR / "db" / "datanapoli.sqlite"
if not DB_PATH.exists() and (DATA_DIR / "napoli_encyclopedia.db").exists():
    DB_PATH = DATA_DIR / "napoli_encyclopedia.db"

# Headers
DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,it;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "DNT": "1",
    "Connection": "keep-alive",
}

API_HEADERS = {
    "User-Agent": DEFAULT_HEADERS["User-Agent"],
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.9",
    "Origin": f"https://{TM_HOST}",
    "Referer": f"https://{TM_HOST}/",
}

# Money parsing
MONEY_RE = re.compile(
    r"(?:€|EUR|\$|£)?\s*(?P<num>\d[\d.,\s]*)\s*"
    r"(?P<suf>bn|mrd|mld|млрд|mio\.?|mil\.?|млн|百万|m\.?|k|tsd\.?|тыс\.?|千)?",
    re.IGNORECASE,
)
SUFFIX_MULTIPLIERS = {
    "bn": 1_000_000_000,
    "mrd": 1_000_000_000,
    "mld": 1_000_000_000,
    "m": 1_000_000,
    "mio": 1_000_000,
    "mio.": 1_000_000,
    "mil": 1_000_000,
    "mil.": 1_000_000,
    "k": 1_000,
    "tsd": 1_000,
    "tsd.": 1_000,
}

MONTH_MAP = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
    "gen": 1, "mag": 5, "giu": 6, "lug": 7, "ago": 8, "set": 9, "ott": 10, "dic": 12,
}


def parse_money(text: str | None) -> float | None:
    """Extract money amount in EUR from text strings."""
    if not text:
        return None
    cleaned = text.strip()
    if cleaned in ("-", "?", "Free transfer", "free transfer", "loan", "Loan", "End of loan", "Draft"):
        return 0.0 if "free" in cleaned.lower() else None

    m = MONEY_RE.search(cleaned)
    if not m:
        return None

    raw = m.group("num").replace(" ", "").rstrip(".,")
    suf = (m.group("suf") or "").lower()
    if not raw:
        return None

    has_dot, has_comma = "." in raw, "," in raw
    if has_dot and has_comma:
        # e.g. 1.250,50 -> 1250.50 or 1,250.50 -> 1250.50
        if raw.rfind(",") > raw.rfind("."):
            raw = raw.replace(".", "").replace(",", ".")
        else:
            raw = raw.replace(",", "")
    elif has_comma:
        # e.g. 15,00 or 150,000
        if re.search(r",\d{1,2}$", raw):
            raw = raw.replace(",", ".")
        else:
            raw = raw.replace(",", "")
    elif has_dot and not suf and re.search(r"\.\d{3}$", raw):
        raw = raw.replace(".", "")

    try:
        val = float(raw)
    except ValueError:
        return None

    mult = SUFFIX_MULTIPLIERS.get(suf, 1)
    return float(val * mult)


def parse_date(text: str | None) -> str | None:
    """Normalize date string to standard ISO YYYY-MM-DD."""
    if not text:
        return None
    t = text.strip()
    if not t or t in ("-", "?", "N/A"):
        return None

    # DD/MM/YYYY or DD.MM.YYYY
    if m := re.search(r"(\d{1,2})[./](\d{1,2})[./](\d{4})", t):
        day, month, year = int(m.group(1)), int(m.group(2)), int(m.group(3))
        try:
            return datetime(year, month, day).strftime("%Y-%m-%d")
        except ValueError:
            pass

    # YYYY-MM-DD
    if m := re.search(r"(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})", t):
        year, month, day = int(m.group(1)), int(m.group(2)), int(m.group(3))
        try:
            return datetime(year, month, day).strftime("%Y-%m-%d")
        except ValueError:
            pass

    # Month DD, YYYY or DD Month YYYY (e.g. Jul 21, 2000 or 21 Jul 2000)
    if m := re.search(r"([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})", t):
        mo_str, day, year = m.group(1).lower(), int(m.group(2)), int(m.group(3))
        mo = MONTH_MAP.get(mo_str)
        if mo:
            try:
                return datetime(year, mo, day).strftime("%Y-%m-%d")
            except ValueError:
                pass

    if m := re.search(r"(\d{1,2})\s+([A-Za-z]{3})[a-z]*\.?,?\s+(\d{4})", t):
        day, mo_str, year = int(m.group(1)), m.group(2).lower(), int(m.group(3))
        mo = MONTH_MAP.get(mo_str)
        if mo:
            try:
                return datetime(year, mo, day).strftime("%Y-%m-%d")
            except ValueError:
                pass

    return None


def parse_int(text: str | None) -> int | None:
    """Extract integer from string, removing thousand separators."""
    if not text:
        return None
    cleaned = (text or "").replace(".", "").replace(",", "").replace("'", "").strip()
    if m := re.search(r"\d+", cleaned):
        return int(m.group())
    return None


def parse_height(text: str | None) -> float | None:
    """Extract height in meters (e.g. 1,88 m -> 1.88, 188 cm -> 1.88)."""
    if not text:
        return None
    if m := re.search(r"(\d)[.,](\d{1,2})\s*m", text):
        return float(f"{m.group(1)}.{m.group(2).ljust(2, '0')}")
    if m := re.search(r"(\d{3})\s*cm", text):
        return round(int(m.group(1)) / 100.0, 2)
    return None


# ==============================================================================
# Absence & Injury Taxonomy Classification
# ==============================================================================

SUSPENSION_KEYWORDS = {
    "suspension", "yellow card", "red card", "second yellow", "match penalty",
    "disciplinary", "doping ban", "banned", "squalifica", "ammonizione", "espulsione",
    "gelbsperre", "rotsperre", "gelb-rote",
}

ILLNESS_KEYWORDS = {
    "flu", "influenza", "cold", "fever", "virus", "corona virus", "covid", "infection",
    "stomach", "gastric", "bronchitis", "tonsillitis", "illness", "krank", "malattia",
    "appendicitis", "pneumonia", "convalescence",
}

EXCLUSION_KEYWORDS = {
    "quarantine", "internal suspension", "not in squad", "squad exclusion",
    "training deficit", "fitness", "rest", "conditioning", "suspended by club",
    "in second team", "contractual issues", "transfer talks",
}

NATIONAL_TEAM_KEYWORDS = {
    "national team", "international duty", "afcon", "asian cup", "olympics",
    "world cup", "copa america", "nazionale",
}

PHYSICAL_INJURY_KEYWORDS = {
    "muscle", "fiber", "tear", "ligament", "cruciate", "acl", "mcl", "ankle",
    "knee", "hamstring", "adductor", "thigh", "calf", "groin", "broken", "fracture",
    "concussion", "head", "facial", "jaw", "shoulder", "elbow", "wrist", "foot",
    "toe", "heel", "achilles", "tendon", "strain", "sprain", "bruise", "contusion",
    "laceration", "meniscus", "pubic", "hernia", "back", "lumbago", "vertebra",
    "collateral", "cartilage", "rib", "collateral", "syndesmotic", "knock", "infortunio",
}


def classify_absence(reason_text: str | None) -> str:
    """
    Classify player absence / injury reason into standard taxonomy categories:
    - Physical Injury
    - Illness / Medical
    - Disciplinary / Suspension
    - Club Exclusion / Technical
    - International Duty
    - Other
    """
    if not reason_text:
        return "Unknown"
    txt = reason_text.lower().strip()

    # Check suspensions first (rules out 'yellow card' false match)
    if any(k in txt for k in SUSPENSION_KEYWORDS):
        return "Disciplinary / Suspension"

    # Check national duty
    if any(k in txt for k in NATIONAL_TEAM_KEYWORDS):
        return "International Duty"

    # Check non-medical exclusions
    if any(k in txt for k in EXCLUSION_KEYWORDS):
        return "Club Exclusion / Technical"

    # Check medical illnesses
    if any(k in txt for k in ILLNESS_KEYWORDS):
        return "Illness / Medical"

    # Check physical trauma & injuries
    if any(k in txt for k in PHYSICAL_INJURY_KEYWORDS):
        return "Physical Injury"

    return "Other"
