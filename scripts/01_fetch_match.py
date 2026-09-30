"""
01_fetch_match.py — Data Napoli pipeline
Scarica gli eventi di una singola partita (o dell'ultima partita del Napoli)
da API-Football o Football-Data.org e li salva in data/<slug>.json.

Uso:
    python scripts/01_fetch_match.py --match-id 20260920-FIO-NAP
    python scripts/01_fetch_match.py --latest          # ultima partita Napoli

NOTA FONDAMENTALE (principio fondativo del progetto):
    Nessun dato viene mai inventato, stimato o dedotto.
    Se un campo non è disponibile nella risposta API, viene salvato come null
    e la UI lo dichiara esplicitamente come "non disponibile".
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path

import requests
import yaml

# ── Config ────────────────────────────────────────────────────────────────────
ROOT = Path(__file__).parent.parent
CFG_PATH = ROOT / "scripts" / "config.yaml"

with open(CFG_PATH) as f:
    CFG = yaml.safe_load(f)

DATA_DIR = ROOT / CFG["output"]["data_dir"]
DATA_DIR.mkdir(parents=True, exist_ok=True)

# API-Football — imposta la tua chiave come variabile d'ambiente:
#   $env:API_FOOTBALL_KEY = "la_tua_chiave"
API_KEY = os.environ.get("API_FOOTBALL_KEY", "")
API_FOOTBALL_BASE = "https://v3.football.api-sports.io"
NAPOLI_ID = 492  # ID Napoli su API-Football (verificare alla prima chiamata)


# ── Helpers ───────────────────────────────────────────────────────────────────

def api_football_get(endpoint: str, params: dict) -> dict:
    """Chiama l'API-Football con autenticazione."""
    if not API_KEY:
        sys.exit(
            "ERROR: API_FOOTBALL_KEY non impostata.\n"
            "Esporta la chiave: $env:API_FOOTBALL_KEY = 'xxx'"
        )
    headers = {"x-rapidapi-key": API_KEY, "x-rapidapi-host": "v3.football.api-sports.io"}
    url = f"{API_FOOTBALL_BASE}/{endpoint}"
    resp = requests.get(url, headers=headers, params=params, timeout=15)
    resp.raise_for_status()
    return resp.json()


def build_match_slug(match: dict) -> str:
    """Costruisce lo slug della partita es. '20260920-FIO-NAP'."""
    date = match.get("fixture", {}).get("date", "")[:10].replace("-", "")
    home = match.get("teams", {}).get("home", {}).get("name", "HOM")[:3].upper()
    away = match.get("teams", {}).get("away", {}).get("name", "AWA")[:3].upper()
    return f"{date}-{home}-{away}"


def normalize_match(raw: dict, stats_raw: list, events_raw: list) -> dict:
    """
    Trasforma la risposta grezza API-Football in un dizionario conforme
    allo schema dati del progetto (sezione 4.3 del blueprint).
    I campi non disponibili sono esplicitamente null — mai stimati.
    """
    fixture = raw.get("fixture", {})
    teams   = raw.get("teams", {})
    goals   = raw.get("goals", {})
    league  = raw.get("league", {})

    def safe(d, *keys, default=None):
        """Naviga un dizionario annidato senza lanciare eccezioni."""
        cur = d
        for k in keys:
            if not isinstance(cur, dict):
                return default
            cur = cur.get(k, default)
        return cur

    # Statistiche di squadra — solo quelle realmente presenti
    stats_by_team = {}
    for ts in stats_raw:
        team_id = safe(ts, "team", "id")
        stats_by_team[team_id] = {
            s["type"]: s["value"] for s in ts.get("statistics", [])
            if s.get("value") is not None
        }

    # Formazioni — solo se disponibili
    lineups_data = raw.get("lineups", [])
    lineups = {}
    for lu in lineups_data:
        team_id = safe(lu, "team", "id")
        lineups[str(team_id)] = {
            "formation": lu.get("formation"),          # null se non disponibile
            "formation_source": "API-Football",
            "xi": [
                {
                    "player_id": safe(p, "player", "id"),
                    "name":      safe(p, "player", "name"),
                    "number":    safe(p, "player", "number"),
                    "pos":       safe(p, "player", "pos"),
                    "grid":      safe(p, "player", "grid"),
                    "is_starter": True,
                }
                for p in lu.get("startXI", [])
            ] + [
                {
                    "player_id": safe(p, "player", "id"),
                    "name":      safe(p, "player", "name"),
                    "number":    safe(p, "player", "number"),
                    "pos":       safe(p, "player", "pos"),
                    "grid":      None,
                    "is_starter": False,
                }
                for p in lu.get("substitutes", [])
            ],
        }

    # Goal timeline — solo eventi gol con minuto verificato
    goals_list = [
        {
            "minute":           safe(e, "time", "elapsed"),
            "minute_extra":     safe(e, "time", "extra"),        # recupero
            "player_name":      safe(e, "player", "name"),
            "player_id":        safe(e, "player", "id"),
            "assist_name":      safe(e, "assist", "name"),       # null se no assist ufficiale
            "assist_id":        safe(e, "assist", "id"),
            "team_id":          safe(e, "team", "id"),
            "type":             safe(e, "type"),    # "Goal" | "Own Goal" | "Penalty"
            "detail":           safe(e, "detail"),
            "source":           "API-Football",
        }
        for e in events_raw
        if safe(e, "type") in ("Goal", "Own Goal")
    ]

    # Sostituzioni
    subs_list = [
        {
            "minute":     safe(e, "time", "elapsed"),
            "out_name":   safe(e, "player", "name"),
            "out_id":     safe(e, "player", "id"),
            "in_name":    safe(e, "assist", "name"),  # API-Football usa "assist" per il subentrato
            "in_id":      safe(e, "assist", "id"),
            "team_id":    safe(e, "team", "id"),
            "source":     "API-Football",
        }
        for e in events_raw
        if safe(e, "type") == "subst"
    ]

    # Cartellini
    cards_list = [
        {
            "minute":      safe(e, "time", "elapsed"),
            "player_name": safe(e, "player", "name"),
            "player_id":   safe(e, "player", "id"),
            "team_id":     safe(e, "team", "id"),
            "card_type":   safe(e, "detail"),   # "Yellow Card" | "Red Card" | "Yellow Red Card"
            "source":      "API-Football",
        }
        for e in events_raw
        if safe(e, "type") == "Card"
    ]

    home_id = safe(teams, "home", "id")
    away_id = safe(teams, "away", "id")

    return {
        "match_id":      build_match_slug(raw),
        "fetched_at":    datetime.utcnow().isoformat() + "Z",
        "source":        "API-Football",
        "competition": {
            "name":      safe(league, "name"),
            "country":   safe(league, "country"),
            "season":    safe(league, "season"),
            "round":     safe(league, "round"),
        },
        "fixture": {
            "date":      fixture.get("date"),
            "venue":     safe(fixture, "venue", "name"),
            "city":      safe(fixture, "venue", "city"),
            "referee":   fixture.get("referee"),     # null se non disponibile
            "status":    safe(fixture, "status", "long"),
        },
        "home": {
            "club_id":   home_id,
            "name":      safe(teams, "home", "name"),
            "score":     goals.get("home"),
        },
        "away": {
            "club_id":   away_id,
            "name":      safe(teams, "away", "name"),
            "score":     goals.get("away"),
        },
        "goals":         goals_list,
        "substitutions": subs_list,
        "cards":         cards_list,
        "lineups":       lineups,
        "stats": {
            "provider":  "API-Football",
            "home":      stats_by_team.get(home_id, {}),
            "away":      stats_by_team.get(away_id, {}),
        },
        # Dati xy passaggi: non forniti da API-Football (richiedono Opta/StatsBomb/WhoScored)
        "passes_xy":      None,
        "passes_xy_note": (
            "Dati posizionali (xy) non disponibili da API-Football. "
            "Per la pass network, usare 02_fetch_passes_xy.py con fonte alternativa."
        ),
    }


# ── Main ──────────────────────────────────────────────────────────────────────

def fetch_match(match_api_id: int) -> dict:
    """Scarica fixture + statistiche + eventi per un match ID API-Football."""
    print(f"[01_fetch] Scarico match API-Football ID={match_api_id} ...")

    fixture_resp = api_football_get("fixtures", {"id": match_api_id})
    if not fixture_resp.get("response"):
        sys.exit(f"ERROR: nessuna risposta per match ID {match_api_id}")

    raw = fixture_resp["response"][0]

    stats_resp  = api_football_get("fixtures/statistics", {"fixture": match_api_id})
    events_resp = api_football_get("fixtures/events",     {"fixture": match_api_id})
    lineup_resp = api_football_get("fixtures/lineups",    {"fixture": match_api_id})

    # Integra le formazioni nel raw dict (API-Football le restituisce separatamente)
    raw["lineups"] = lineup_resp.get("response", [])

    stats_raw  = stats_resp.get("response", [])
    events_raw = events_resp.get("response", [])

    return normalize_match(raw, stats_raw, events_raw)


def fetch_latest_napoli() -> dict:
    """Trova l'ultima partita giocata dal Napoli e la scarica."""
    print("[01_fetch] Cerco l'ultima partita del Napoli ...")
    resp = api_football_get("fixtures", {
        "team":   NAPOLI_ID,
        "last":   1,
        "status": "FT",   # solo partite finite
    })
    matches = resp.get("response", [])
    if not matches:
        sys.exit("ERROR: nessuna partita trovata per il Napoli.")

    fixture_id = matches[0]["fixture"]["id"]
    print(f"[01_fetch] Trovata partita ID={fixture_id}")
    return fetch_match(fixture_id)


def main():
    parser = argparse.ArgumentParser(description="Data Napoli — fetch match data")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--match-id",  type=int, help="API-Football fixture ID")
    group.add_argument("--latest",    action="store_true", help="Ultima partita Napoli")
    args = parser.parse_args()

    if args.latest:
        data = fetch_latest_napoli()
    else:
        data = fetch_match(args.match_id)

    slug = data["match_id"]
    out_path = DATA_DIR / f"{slug}.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"[01_fetch] Salvato: {out_path}")
    return str(out_path)


if __name__ == "__main__":
    main()
