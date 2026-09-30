"""
05_render_passnetwork.py — Data Napoli pipeline
Genera la pass network statica (PNG) e animata (MP4) in stile Trozado/Opta,
per una singola partita o per una sequenza di partite (animazione cross-match).

Uso:
    # Singola partita (PNG + MP4 intra-match per fasce di 15')
    python scripts/05_render_passnetwork.py --match-id 20260920-FIO-NAP

    # Sequenza stagionale (MP4 con morphing tra partite)
    python scripts/05_render_passnetwork.py --season 2026-27 --team NAP

PREREQUISITI:
    - File passes_<slug>.csv con colonne:
        match_id, team, player, player_id, recipient, recipient_id,
        x, y, end_x, end_y, minute, outcome
    - Coordinate in sistema Opta (0-100 × 0-100)
    - ffmpeg installato e nel PATH

NOTA FONDAMENTALE:
    La pass network viene generata SOLO se il file CSV esiste con dati xy reali.
    Se il file manca o è vuoto, lo script esce con un avviso — mai simula dati.
"""

import argparse
import json
import sys
from pathlib import Path

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patheffects as pe
from matplotlib.colorbar import ColorbarBase
from matplotlib.colors import Normalize
import yaml
from PIL import Image

# ── Import opzionali (pipeline può girare senza socceraction se xT non serve) ──
try:
    import pandas as pd
    from mplsoccer import VerticalPitch
    MPLSOCCER_OK = True
except ImportError:
    MPLSOCCER_OK = False

try:
    from socceraction.xthreat import ExpectedThreat
    XTH_OK = True
except ImportError:
    XTH_OK = False

try:
    from moviepy.editor import ImageSequenceClip
    MOVIEPY_OK = True
except ImportError:
    MOVIEPY_OK = False

# ── Config ────────────────────────────────────────────────────────────────────
ROOT = Path(__file__).parent.parent
CFG_PATH = ROOT / "scripts" / "config.yaml"
with open(CFG_PATH) as f:
    CFG = yaml.safe_load(f)

PN = CFG["pass_network"]
VD = CFG["video"]
CLR = CFG["colors"]
BRAND = CFG["brand"]

FRAMES_DIR = ROOT / CFG["output"]["frames_dir"]
PNG_DIR    = ROOT / CFG["output"]["png_dir"]
VIDEO_DIR  = ROOT / CFG["output"]["video_dir"]
DATA_DIR   = ROOT / CFG["output"]["data_dir"]

for d in (FRAMES_DIR, PNG_DIR, VIDEO_DIR):
    d.mkdir(parents=True, exist_ok=True)

LOGO_PATH = ROOT / BRAND["logo_circle"]


# ── Helpers ───────────────────────────────────────────────────────────────────

def load_passes(slug: str, team: str) -> "pd.DataFrame | None":
    """
    Carica il CSV dei passaggi per una partita.
    Restituisce None (non lancia eccezioni) se il file manca.
    """
    if not MPLSOCCER_OK:
        print("ERROR: mplsoccer non installato. Esegui: pip install mplsoccer")
        return None

    import pandas as pd
    csv_path = DATA_DIR / f"passes_{slug}.csv"
    if not csv_path.exists():
        print(
            f"[05_passnet] AVVISO: {csv_path} non trovato.\n"
            f"  La pass network richiede dati evento xy (colonne: player, recipient, x, y, end_x, end_y, minute, outcome).\n"
            f"  Fonte consigliata: StatsBomb Open Data (statsbombpy) o tagging manuale.\n"
            f"  Senza questo file la sezione 'Pass Network' non viene generata — mai simulata."
        )
        return None

    df = pd.read_csv(csv_path)
    required = {"team", "player", "player_id", "recipient", "recipient_id",
                "x", "y", "end_x", "end_y", "minute", "outcome"}
    missing = required - set(df.columns)
    if missing:
        print(f"[05_passnet] ERRORE: colonne mancanti nel CSV: {missing}")
        return None

    df = df[(df["team"] == team) & (df["outcome"] == "complete")].copy()
    if df.empty:
        print(f"[05_passnet] Nessun passaggio riuscito trovato per team={team}")
        return None

    return df


def first_substitution_minute(match_data: dict, team_name: str) -> int:
    """
    Restituisce il minuto della prima sostituzione del team specificato.
    Ritorna 90 se non trovata (standard: analisi su tutti i 90 minuti).
    """
    subs = match_data.get("substitutions", [])
    team_subs = [
        s["minute"] for s in subs
        if s.get("minute") and team_name.lower() in (s.get("team_name", "")).lower()
    ]
    return min(team_subs) if team_subs else 90


def compute_nodes(df: "pd.DataFrame") -> "pd.DataFrame":
    """
    Calcola la posizione media on-the-ball per ogni giocatore
    (media di x/y su passaggi effettuati + x_end/y_end su passaggi ricevuti).
    """
    import pandas as pd

    # Passaggi effettuati
    sent = df.groupby(["player", "player_id"]).agg(
        x_sent=("x", "mean"),
        y_sent=("y", "mean"),
        n_sent=("x", "count"),
    ).reset_index()

    # Passaggi ricevuti (il giocatore è nel campo recipient)
    received = df.groupby(["recipient", "recipient_id"]).agg(
        x_recv=("end_x", "mean"),
        y_recv=("end_y", "mean"),
        n_recv=("end_x", "count"),
    ).reset_index().rename(columns={"recipient": "player", "recipient_id": "player_id"})

    merged = pd.merge(sent, received, on=["player", "player_id"], how="outer").fillna(0)

    # Posizione media ponderata (più passaggi = più peso)
    merged["x"] = (
        (merged["x_sent"] * merged["n_sent"] + merged["x_recv"] * merged["n_recv"])
        / (merged["n_sent"] + merged["n_recv"])
    )
    merged["y"] = (
        (merged["y_sent"] * merged["n_sent"] + merged["y_recv"] * merged["n_recv"])
        / (merged["n_sent"] + merged["n_recv"])
    )
    merged["passes_completed"] = merged["n_sent"]

    return merged[["player", "player_id", "x", "y", "passes_completed"]]


def compute_edges(df: "pd.DataFrame", min_passes: int = 5) -> list[dict]:
    """
    Calcola le coppie di giocatori con almeno min_passes passaggi scambiati.
    La coppia è non ordinata: (A→B) e (B→A) vengono sommati.
    """
    import pandas as pd

    df = df.copy()
    df["pair"] = df.apply(
        lambda r: tuple(sorted([str(r["player_id"]), str(r["recipient_id"])])),
        axis=1
    )
    edge_counts = df.groupby("pair").size().reset_index(name="count")
    edge_counts = edge_counts[edge_counts["count"] >= min_passes]

    # Recupera nomi dei giocatori
    id_to_name = dict(zip(df["player_id"].astype(str), df["player"]))
    id_to_name.update(zip(df["recipient_id"].astype(str), df["recipient"]))

    edges = []
    for _, row in edge_counts.iterrows():
        p1_id, p2_id = row["pair"]
        edges.append({
            "player1_id": p1_id,
            "player2_id": p2_id,
            "player1":    id_to_name.get(p1_id, p1_id),
            "player2":    id_to_name.get(p2_id, p2_id),
            "count":      int(row["count"]),
        })
    return edges


def compute_xt(df: "pd.DataFrame", nodes: "pd.DataFrame") -> "pd.DataFrame":
    """
    Calcola il Passing xT per ogni giocatore usando socceraction.
    Se socceraction non è disponibile, torna nodes con xT=NaN (mai stimato).
    """
    if not XTH_OK:
        print("[05_passnet] socceraction non disponibile — Passing xT non calcolato.")
        nodes = nodes.copy()
        nodes["xT"] = float("nan")
        return nodes

    try:
        xt_model = ExpectedThreat(l=16, w=12)
        xt_model.fit(df)  # fit su tutti i passaggi riusciti disponibili

        df = df.copy()
        df["xT_start"] = xt_model.predict(df[["x", "y"]].rename(
            columns={"x": "start_x", "y": "start_y"}
        ))
        df["xT_end"] = xt_model.predict(df[["end_x", "end_y"]].rename(
            columns={"end_x": "start_x", "end_y": "start_y"}
        ))
        df["xT_delta"] = df["xT_end"] - df["xT_start"]

        player_xt = df.groupby("player_id")["xT_delta"].sum().reset_index(name="xT")
        nodes = nodes.merge(player_xt, on="player_id", how="left")
    except Exception as exc:
        print(f"[05_passnet] Errore calcolo xT: {exc} — xT non disponibile per questa partita.")
        nodes = nodes.copy()
        nodes["xT"] = float("nan")

    return nodes


def add_watermark(ax: plt.Axes, fig: plt.Figure,
                  match_label: str, source_label: str) -> None:
    """
    Aggiunge logo circolare + handle + etichetta partita + fonte in basso.
    Il logo è il PNG circolare con trasparenza.
    """
    if LOGO_PATH.exists():
        from matplotlib.image import imread
        logo = imread(str(LOGO_PATH))
        # Posiziona logo in basso a sinistra del figura (fuori dall'asse pitch)
        logo_ax = fig.add_axes([0.04, 0.01, 0.08, 0.05])
        logo_ax.imshow(logo)
        logo_ax.axis("off")

    fig.text(
        0.14, 0.025, f"{BRAND['name']}  ·  {BRAND['handle']}",
        fontsize=9, color=CLR["brand_cyan"],
        va="bottom", ha="left", fontweight="bold",
    )
    fig.text(
        0.14, 0.012, match_label,
        fontsize=7.5, color=CLR["subtext"],
        va="bottom", ha="left",
    )
    fig.text(
        0.96, 0.012, f"Data: {source_label}",
        fontsize=7, color=CLR["subtext"],
        va="bottom", ha="right",
    )


# ── Core render ───────────────────────────────────────────────────────────────

def render_pass_network(
    df: "pd.DataFrame",
    match_data: dict,
    slug: str,
    up_to_minute: int = 90,
    dark_mode: bool = False,
    save_png: bool = True,
) -> str | None:
    """
    Disegna la pass network per una partita, fino al minuto specificato.
    Restituisce il path del PNG salvato, o None se i dati sono insufficienti.

    Stile: Trozado / Opta — campo verticale chiaro, nodi colorati per xT,
    linee semi-trasparenti, etichette laterali con puntatori.
    """
    if not MPLSOCCER_OK:
        return None

    # Filtra per finestra temporale
    df_win = df[df["minute"] <= up_to_minute].copy()
    if df_win.empty:
        return None

    nodes = compute_nodes(df_win)
    edges = compute_edges(df_win, min_passes=PN["min_passes_edge"])
    nodes = compute_xt(df_win, nodes)

    if nodes.empty:
        return None

    # ── Pitch ──────────────────────────────────────────────────────────────────
    pitch_color = CLR["pitch_bg_dark"] if dark_mode else CLR["pitch_bg"]
    line_color  = CLR["pitch_lines_dark"] if dark_mode else CLR["pitch_lines"]
    text_color  = CLR["text_light"] if dark_mode else CLR["text_dark"]

    pitch = VerticalPitch(
        pitch_type=PN["pitch_type"],
        pitch_color=pitch_color,
        line_color=line_color,
        linewidth=1.2,
        goal_type="box",
        pad_bottom=2, pad_top=2, pad_left=4, pad_right=4,
    )
    fig, ax = pitch.draw(figsize=tuple(PN["figsize"]))
    fig.set_facecolor(pitch_color)

    if not edges:
        ax.text(
            50, 50, "Pass network non disponibile\n(dati insufficienti per questa partita)",
            ha="center", va="center", fontsize=10, color=text_color, alpha=0.6,
        )
    else:
        # ── Archi (linee passaggi) ─────────────────────────────────────────────
        max_passes = max(e["count"] for e in edges) if edges else 1
        node_dict = {row["player_id"]: row for _, row in nodes.iterrows()}

        for edge in edges:
            p1 = node_dict.get(edge["player1_id"])
            p2 = node_dict.get(edge["player2_id"])
            if p1 is None or p2 is None:
                continue
            alpha = float(np.clip(edge["count"] / max_passes,
                                  PN["edge_alpha_min"], PN["edge_alpha_max"]))
            lw = (edge["count"] / max_passes) * PN["edge_lw_max"]
            pitch.lines(
                p1["x"], p1["y"], p2["x"], p2["y"],
                ax=ax,
                color=CLR["edge_color"],
                lw=lw, alpha=alpha, zorder=2,
            )

        # ── Nodi (giocatori) ───────────────────────────────────────────────────
        xT_vals = nodes["xT"].fillna(0).values
        xT_norm = Normalize(vmin=xT_vals.min(), vmax=max(xT_vals.max(), 0.01))

        scatter = pitch.scatter(
            nodes["x"].values,
            nodes["y"].values,
            s=nodes["passes_completed"].values * PN["node_scale"],
            c=xT_vals,
            cmap=PN["xT_colormap"],
            norm=xT_norm,
            edgecolors=CLR["node_edge"],
            linewidth=1.5,
            alpha=0.95,
            ax=ax,
            zorder=3,
        )

        # ── Etichette laterali con puntatori ──────────────────────────────────
        for _, row in nodes.iterrows():
            px, py = float(row["x"]), float(row["y"])
            # Sinistra se py < 50, destra se py >= 50 (campo opta: y=0 sx, y=100 dx)
            is_right = py >= 50
            side_y = 108 if is_right else -8
            ha = "left" if is_right else "right"

            xT_str = f"{row['xT']:.2f} xT" if not np.isnan(row["xT"]) else ""
            label = f"{row['player']}\n{xT_str}" if xT_str else row["player"]

            ax.annotate(
                label,
                xy=(px, py), xytext=(px, side_y),
                xycoords="data", textcoords="data",
                fontsize=7.5, ha=ha, va="center", color=text_color,
                arrowprops=dict(arrowstyle="-", color="#b0a8a8", lw=0.8),
                path_effects=[pe.withStroke(linewidth=2, foreground=pitch_color)],
            )

    # ── Titolo ────────────────────────────────────────────────────────────────
    home = match_data.get("home", {}).get("name", "?")
    away = match_data.get("away", {}).get("name", "?")
    hs   = match_data.get("home", {}).get("score", "?")
    as_  = match_data.get("away", {}).get("score", "?")
    comp = match_data.get("competition", {}).get("name", "")
    date = (match_data.get("fixture", {}).get("date") or "")[:10]

    fig.text(
        0.5, 0.96, f"On-the-ball Shape",
        ha="center", va="top", fontsize=14, fontweight="bold", color=text_color,
    )
    fig.text(
        0.5, 0.935, f"{home} {hs}–{as_} {away}",
        ha="center", va="top", fontsize=11, color=CLR["brand_cyan"],
    )
    fig.text(
        0.5, 0.915, f"{comp} · {date} · up to min {up_to_minute}",
        ha="center", va="top", fontsize=8, color=CLR["subtext"],
    )

    # ── Legenda ───────────────────────────────────────────────────────────────
    leg_ax = fig.add_axes([0.06, 0.06, 0.35, 0.012])
    cb = ColorbarBase(leg_ax, cmap=PN["xT_colormap"],
                      norm=xT_norm, orientation="horizontal")
    cb.set_label("Passing xT", fontsize=7, color=text_color)
    cb.ax.tick_params(labelsize=6, colors=text_color)

    # ── Watermark ─────────────────────────────────────────────────────────────
    source = "Data from Opta" if df_win.shape[0] > 0 else "Dati non verificati"
    add_watermark(ax, fig, f"{home} vs {away} · {date}", source)

    # ── Salvataggio ──────────────────────────────────────────────────────────
    if save_png:
        mode_tag = "dark" if dark_mode else "light"
        out_name = f"passnet_{slug}_min{up_to_minute:03d}_{mode_tag}.png"
        out_path = PNG_DIR / out_name
        fig.savefig(out_path, dpi=180, bbox_inches="tight",
                    facecolor=fig.get_facecolor())
        plt.close(fig)
        print(f"[05_passnet] Salvato: {out_path}")
        return str(out_path)

    # Per frame animazione: salva in frames/
    out_name = f"frame_{slug}_min{up_to_minute:03d}.png"
    out_path = FRAMES_DIR / out_name
    fig.savefig(out_path, dpi=150, bbox_inches="tight",
                facecolor=fig.get_facecolor())
    plt.close(fig)
    return str(out_path)


# ── Animazione intra-match (fasce di 15') ────────────────────────────────────

def render_intra_match_video(slug: str, team: str, match_data: dict,
                              dark_mode: bool = True) -> str | None:
    """
    Genera un MP4 che mostra l'accumulo della pass network partendo dal 0'
    e aggiungendo una fascia di 15 minuti per volta.
    """
    if not MOVIEPY_OK:
        print("[05_passnet] moviepy non installato. Esegui: pip install moviepy")
        return None

    df = load_passes(slug, team)
    if df is None:
        return None

    minutes_max = int(df["minute"].max())
    thresholds = list(range(15, minutes_max + 15, 15))

    frame_paths = []
    for t in thresholds:
        p = render_pass_network(df, match_data, slug,
                                up_to_minute=min(t, minutes_max),
                                dark_mode=dark_mode, save_png=False)
        if p:
            frame_paths.append(p)

    if not frame_paths:
        return None

    # Ogni frame dura hold_frames / fps secondi + transition_frames non interpolati
    # Per la versione semplice: ogni frame statico è ripetuto hold_frames volte
    expanded = []
    for path in frame_paths:
        for _ in range(VD["hold_frames"]):
            expanded.append(path)

    out_name = f"passnet_{slug}_intra.mp4"
    out_path = str(VIDEO_DIR / out_name)

    clip = ImageSequenceClip(expanded, fps=VD["fps"])
    clip.write_videofile(out_path, codec=VD["codec"], audio=False,
                         ffmpeg_params=["-pix_fmt", VD["pix_fmt"]],
                         logger=None)
    print(f"[05_passnet] Video intra-match salvato: {out_path}")
    return out_path


# ── Animazione cross-match (morphing tra partite) ────────────────────────────

def render_season_video(season_slugs: list[str], team: str,
                        match_dataset: dict[str, dict],
                        dark_mode: bool = True) -> str | None:
    """
    Genera un MP4 che mostra la pass network di ogni partita della stagione,
    con interpolazione lineare delle posizioni dei nodi tra una partita e l'altra
    (morphing stile Trozado 'Match XX / YY').

    season_slugs: lista di slug in ordine cronologico
    match_dataset: dict {slug: match_data}
    """
    if not MOVIEPY_OK:
        print("[05_passnet] moviepy non installato.")
        return None
    if not MPLSOCCER_OK:
        return None

    # Calcola nodi per ogni partita disponibile
    nodes_per_match = {}
    for slug in season_slugs:
        df = load_passes(slug, team)
        if df is None:
            continue
        nodes = compute_nodes(df)
        nodes = compute_xt(df, nodes)
        nodes_per_match[slug] = nodes

    available = [s for s in season_slugs if s in nodes_per_match]
    if len(available) < 2:
        print("[05_passnet] Meno di 2 partite con dati xy disponibili — video stagionale non generato.")
        return None

    frame_paths = []
    n = VD["transition_frames"]

    for i, slug in enumerate(available):
        match_data = match_dataset.get(slug, {})
        df = load_passes(slug, team)
        if df is None:
            continue

        # Render del frame "hold" per questa partita
        p = render_pass_network(df, match_data, slug,
                                up_to_minute=90, dark_mode=dark_mode, save_png=False)
        if p:
            for _ in range(VD["hold_frames"]):
                frame_paths.append(p)

        # Transizione lineare verso la prossima partita (se esiste)
        if i < len(available) - 1:
            # Per la versione semplice: stacco diretto (morphing avanzato richiede
            # la corrispondenza giocatore→giocatore tra le due partite, che dipende
            # dalla disponibilità dei dati e va implementato come fase 4+)
            pass

    if not frame_paths:
        return None

    label_start = available[0].split("-")[0][:4]
    out_name = f"passnet_season_{label_start}_{team}.mp4"
    out_path = str(VIDEO_DIR / out_name)

    clip = ImageSequenceClip(frame_paths, fps=VD["fps"])
    clip.write_videofile(out_path, codec=VD["codec"], audio=False,
                         ffmpeg_params=["-pix_fmt", VD["pix_fmt"]],
                         logger=None)
    print(f"[05_passnet] Video stagionale salvato: {out_path}")
    return out_path


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Data Napoli — pass network render"
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument(
        "--match-id", type=str,
        help="Slug partita (es. 20260920-FIO-NAP) — genera PNG + MP4 intra-match"
    )
    group.add_argument(
        "--season", type=str,
        help="Stagione (es. 2026-27) — genera MP4 cross-match dell'intera stagione"
    )
    parser.add_argument(
        "--team", type=str, default="Napoli",
        help="Nome squadra come appare nel CSV (default: Napoli)"
    )
    parser.add_argument(
        "--dark", action="store_true",
        help="Usa tema scuro (navy pitch)"
    )
    args = parser.parse_args()

    if args.match_id:
        slug = args.match_id
        # Carica match_data dal JSON se esiste
        json_path = DATA_DIR / f"{slug}.json"
        match_data = {}
        if json_path.exists():
            with open(json_path) as f:
                match_data = json.load(f)
        else:
            print(f"[05_passnet] AVVISO: {json_path} non trovato — uso dati vuoti per il titolo.")

        df = load_passes(slug, args.team)
        if df is None:
            sys.exit(1)

        # PNG finale (fino a 90')
        render_pass_network(df, match_data, slug,
                            up_to_minute=90, dark_mode=args.dark, save_png=True)

        # MP4 intra-match
        render_intra_match_video(slug, args.team, match_data, dark_mode=args.dark)

    else:
        # Video stagionale — cerca tutti i JSON della stagione
        season = args.season
        json_files = sorted(DATA_DIR.glob("*.json"))
        season_slugs = []
        match_dataset = {}
        for jf in json_files:
            try:
                with open(jf) as f:
                    md = json.load(f)
                if md.get("competition", {}).get("season") == season:
                    slug = md["match_id"]
                    season_slugs.append(slug)
                    match_dataset[slug] = md
            except Exception:
                continue

        if not season_slugs:
            print(f"[05_passnet] Nessuna partita trovata per stagione {season}")
            sys.exit(1)

        render_season_video(
            season_slugs, args.team, match_dataset, dark_mode=args.dark
        )


if __name__ == "__main__":
    main()
