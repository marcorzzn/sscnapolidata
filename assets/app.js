/* ============================================================
   DATA NAPOLI — tema (chiaro/scuro) e lingua (IT/EN)
   Persistenza in localStorage. Il bootstrap del tema/lingua che
   evita il flash del valore sbagliato vive in un piccolo script
   inline in <head> di ogni pagina — questo file applica il
   dizionario e gestisce i click sui due toggle.
   ============================================================ */

window.DN_I18N = {
  it: {
    latest_match: "ULTIMA PARTITA",
    mc_meta_generic: "Scheda completa → gol, match flow, sostituzioni",
    hero_tagline: "Analisi matematica, visuale e statistica di ogni partita del Napoli. Solo dati verificati: dove una fonte non conferma un dettaglio, la pagina lo dichiara invece di stimarlo.",
    intensity_label: "ANDAMENTO — GOL E OCCASIONI PIÙ RILEVANTI",
    key_moments_label: "OCCASIONI CHIAVE",
    first_half: "PRIMO TEMPO",
    second_half: "SECONDO TEMPO",
    lineups_matchdata_label: "FORMAZIONI &amp; MATCH DATA",
    discipline_label: "DISCIPLINE",
    final_data_label: "FINAL DATA",
    eterna_label: "LA PARTITA ETERNA",
    fd_result: "RISULTATO",
    fd_competition: "COMPETIZIONE",
    fd_goals: "GOL TOTALI",
    fd_stadium: "STADIO",
    fd_stats_note: "POSSESSO \u00b7 TIRI \u00b7 XG",
    fd_stats_nd: "Non disponibile \u2014 fonte non verificata al momento della redazione",
    na_minute: "n.d.",
    min_na_label: "min. n.d.",
    st_asterisk: "s.t.*",

    m20260920_intensity_note: "Altezza = tipo evento (gol = massima, palo/traversa = media, cambio = minima) \u00b7 colore = squadra. *Gol Fiorentina: minuto non specificato dalla fonte, collocato dopo il 23' come riportato nella cronaca.",
    m20260920_mc_label: "SERIE A \u00b7 GIORNATA 5 \u00b7 20 SETTEMBRE 2026",
    m20260920_meta_matchday: "GIORNATA 5 \u00b7 2026/27",
    m20260920_meta_datetime: "Domenica 20 settembre 2026 \u00b7 ore 12:30",
    m20260920_meta_stadium: "Stadio Artemio Franchi, Firenze",
    m20260920_summary: "Il Napoli passa in vantaggio nel primo tempo ma non riesce a difendere il risultato: la Fiorentina reagisce a inizio ripresa e agguanta il pareggio. Punto che lascia la squadra di Allegri a 6 punti dal terzetto di vertice Roma-Inter-Lazio.",
    m20260920_goal1_phase: "1\u00b0 T",
    m20260920_goal1_note: "Sugli sviluppi di un calcio d'angolo. Nessun assist ufficialmente attribuito dalla fonte consultata.",
    m20260920_goal2_phase: "inizio 2\u00b0T*",
    m20260920_goal2_note: "Tiro deviato da Marin. *Minuto esatto non specificato dalla fonte consultata: riportato solo come \"a inizio ripresa\".",
    m20260920_km1: "<b>Traversa di Atta</b> (assist Mastantuono)",
    m20260920_km2: "<b>Traversa di Fagioli</b> (assist Mastantuono)",
    m20260920_km3: "<b>Palo colpito da Olivera</b>, nella stessa fase di gioco che ha preceduto il gol di Gilmour",
    m20260920_flow1: "<b>Traversa</b> \u2014 Atta (assist Mastantuono)",
    m20260920_flow2: "<b>Traversa</b> \u2014 Fagioli (assist Mastantuono)",
    m20260920_flow4: "<b>GOAL</b> \u2014 Jimenez, deviato da Marin",
    m20260920_flow5: "Anguissa dentro",
    m20260920_flow_note: "Il palo di Olivera (Napoli) e le sostituzioni senza minuto ufficiale non compaiono su questa linea, per non suggerire una collocazione temporale non verificata: restano nelle sezioni sopra.",
    m20260920_sub1: "<span class=\"sub-in\">Anguissa</span> dentro",
    m20260920_sub5: "Entrati nella ripresa: <span class=\"sub-in\">Beto, Goncalves, Gnonto, Valdepenas</span>",
    m20260920_disc_note: "<b>Cartellini non riportati dalla fonte.</b> La cronaca ANSA non menziona ammonizioni o espulsioni per questa partita. Sezione da integrare se disponibile un tabellino ufficiale.",
    m20260920_unverified_p1: "<b>Non pubblicate in questa scheda.</b> La fonte consultata cita solo alcuni giocatori in campo (tra gli altri, per il Napoli: Gilmour e Lobotka a centrocampo, Rrahmani-Marin centrali, Lang sulla sinistra, Hojlund con De Bruyne, Politano, Di Lorenzo; per la Fiorentina: De Gea, Viery, Fagioli, Atta, Njie, Mastantuono, Pellegrino) \u2014 non l'undici completo ufficiale.",
    m20260920_unverified_p2: "Statistiche di squadra (tiri, possesso, corner, cartellini) non trovate su fonte verificata al momento della redazione. Sezione da completare quando disponibile un tabellino ufficiale, non stimata.",
    m20260920_eterna_note: "<b>Sezione in costruzione.</b> L'aggregato storico cumulato (gol segnati/subiti, V/P/S da tutti i precedenti ufficiali dal primo incontro) sar\u00e0 calcolato automaticamente una volta completato il database storico. Mostrer\u00e0 ogni singolo incontro come voce cliccabile che porta alla data, alla competizione e al risultato di quella partita.<br><br>Nel registro di continuit\u00e0 societaria \u00e8 in corso la verifica: i precedenti eventualmente disputati contro entit\u00e0 storiche collegate alla Fiorentina saranno gestiti con doppia lettura (con / senza), non decisi in silenzio.",
    m20260920_sources: "Fonti: ANSA, \"Serie A: il Napoli non decolla, segna Gilmour ma la Fiorentina lo riprende\" (ansa.it, 20/09/2026)<br>Calendario e giornata: fantacalcio.it \u2014 Serie A 2026/27"
  },
  en: {
    latest_match: "LATEST MATCH",
    mc_meta_generic: "Full match report \u2192 goals, match flow, substitutions",
    hero_tagline: "Mathematical, visual and statistical analysis of every Napoli match. Verified data only: where a source doesn't confirm a detail, the page states so instead of estimating it.",
    intensity_label: "OVERVIEW \u2014 GOALS AND KEY CHANCES",
    key_moments_label: "KEY MOMENTS",
    first_half: "FIRST HALF",
    second_half: "SECOND HALF",
    lineups_matchdata_label: "LINE-UPS &amp; MATCH DATA",
    discipline_label: "DISCIPLINE",
    final_data_label: "FINAL DATA",
    eterna_label: "THE ETERNAL MATCH",
    fd_result: "RESULT",
    fd_competition: "COMPETITION",
    fd_goals: "TOTAL GOALS",
    fd_stadium: "STADIUM",
    fd_stats_note: "POSSESSION \u00b7 SHOTS \u00b7 XG",
    fd_stats_nd: "Not available \u2014 no verified source at time of writing",
    na_minute: "N/A",
    min_na_label: "min. n/a",
    st_asterisk: "2H*",

    m20260920_intensity_note: "Bar height = event type (goal = maximum, post/crossbar = medium, substitution = minimum) \u00b7 colour = team. *Fiorentina's goal: exact minute not specified by the source, placed after the 23' mark as reported.",
    m20260920_mc_label: "SERIE A \u00b7 MATCHDAY 5 \u00b7 20 SEPTEMBER 2026",
    m20260920_meta_matchday: "MATCHDAY 5 \u00b7 2026/27",
    m20260920_meta_datetime: "Sunday 20 September 2026 \u00b7 12:30",
    m20260920_meta_stadium: "Artemio Franchi Stadium, Florence",
    m20260920_summary: "Napoli go ahead in the first half but can't hold on to the lead: Fiorentina respond early in the second half and level the score. The point leaves Allegri's side 6 points off the top trio of Roma-Inter-Lazio.",
    m20260920_goal1_phase: "1H",
    m20260920_goal1_note: "From a corner-kick situation. No assist officially credited by the source consulted.",
    m20260920_goal2_phase: "early 2H*",
    m20260920_goal2_note: "Shot deflected by Marin. *Exact minute not specified by the source consulted: reported only as \"early in the second half\".",
    m20260920_km1: "<b>Crossbar hit \u2014 Atta</b> (assist: Mastantuono)",
    m20260920_km2: "<b>Crossbar hit \u2014 Fagioli</b> (assist: Mastantuono)",
    m20260920_km3: "<b>Post hit by Olivera</b>, in the same passage of play that preceded Gilmour's goal",
    m20260920_flow1: "<b>Crossbar</b> \u2014 Atta (assist: Mastantuono)",
    m20260920_flow2: "<b>Crossbar</b> \u2014 Fagioli (assist: Mastantuono)",
    m20260920_flow4: "<b>GOAL</b> \u2014 Jimenez, deflected by Marin",
    m20260920_flow5: "Anguissa on",
    m20260920_flow_note: "Olivera's post (Napoli) and the substitutions with no official minute are left off this line, to avoid implying an unverified time placement: they remain in the sections above.",
    m20260920_sub1: "<span class=\"sub-in\">Anguissa</span> on",
    m20260920_sub5: "On in the second half: <span class=\"sub-in\">Beto, Goncalves, Gnonto, Valdepenas</span>",
    m20260920_disc_note: "<b>Cards not reported by the source.</b> The ANSA match report does not mention any bookings or red cards for this match. Section to be updated if an official match report becomes available.",
    m20260920_unverified_p1: "<b>Not published on this page.</b> The source consulted names only a few players on the pitch (among others, for Napoli: Gilmour and Lobotka in midfield, Rrahmani-Marin at centre-back, Lang on the left, Hojlund with De Bruyne, Politano, Di Lorenzo; for Fiorentina: De Gea, Viery, Fagioli, Atta, Njie, Mastantuono, Pellegrino) \u2014 not the full official line-up.",
    m20260920_unverified_p2: "Team statistics (shots, possession, corners, cards) not found on a verified source at time of writing. Section to be completed once an official match report is available \u2014 not estimated.",
    m20260920_eterna_note: "<b>Section under construction.</b> The cumulative historical aggregate (goals scored/conceded, W/D/L from all official matches since their first encounter) will be calculated automatically once the historical database is complete. Each individual match will be clickable, showing date, competition and result.<br><br>The corporate continuity register is being verified: any matches played against historical entities related to Fiorentina will be handled with a dual reading (with / without), never decided silently.",
    m20260920_sources: "Sources: ANSA, \"Serie A: il Napoli non decolla, segna Gilmour ma la Fiorentina lo riprende\" (ansa.it, 20/09/2026)<br>Fixture list and matchday: fantacalcio.it \u2014 Serie A 2026/27"
  }
};

(function () {
  function applyLang(lang) {
    document.documentElement.setAttribute("lang", lang);
    var dict = window.DN_I18N[lang] || window.DN_I18N.it;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key] != null) el.innerHTML = dict[key];
    });
    var pill = document.querySelector("[data-lang-toggle]");
    if (pill) pill.textContent = lang === "it" ? "EN" : "IT";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }
  function currentLang() {
    return document.documentElement.getAttribute("lang") === "en" ? "en" : "it";
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyLang(currentLang());
  });

  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-theme-toggle]")) {
      var nextTheme = currentTheme() === "light" ? "dark" : "light";
      localStorage.setItem("dn-theme", nextTheme);
      applyTheme(nextTheme);
    }
    if (e.target.closest("[data-lang-toggle]")) {
      var nextLang = currentLang() === "it" ? "en" : "it";
      localStorage.setItem("dn-lang", nextLang);
      applyLang(nextLang);
    }
  });
})();
