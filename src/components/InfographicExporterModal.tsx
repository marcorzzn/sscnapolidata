import React, { useRef, useState } from 'react';
import { Download, X, Check } from 'lucide-react';
import { MatchDataStory } from '../data/napoliVerifiedData';
import { NapoliLogoIcon } from './BrandMark';

interface InfographicExporterModalProps {
  match: MatchDataStory;
  lang: 'it' | 'en';
  theme: 'dark' | 'light';
  onClose: () => void;
}

export const InfographicExporterModal: React.FC<InfographicExporterModalProps> = ({
  match,
  lang,
  theme,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [exportTheme, setExportTheme] = useState<'dark' | 'light'>(theme);
  const [downloaded, setDownloaded] = useState(false);

  const generateAndDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1:2 Vertical Format (1080 x 2160 px for crisp social export)
    const W = 1080;
    const H = 2160;
    canvas.width = W;
    canvas.height = H;

    const isDark = exportTheme === 'dark';
    const bg = isDark ? '#08090B' : '#F4F5F6';
    const panelBg = isDark ? '#0E1116' : '#FFFFFF';
    const textPrimary = isDark ? '#FFFFFF' : '#08090B';
    const textSecondary = isDark ? '#9BA5B4' : '#4A5464';
    const cyan = '#01A0E8';
    const divider = isDark ? 'rgba(1, 160, 232, 0.32)' : 'rgba(1, 144, 212, 0.35)';

    // Background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Top Header Bar with Geometric N Logo and @sscnapolidata
    const padX = 72;
    let y = 76;

    // Brand Title: DATA NAPOLI
    ctx.font = '800 30px Archivo, sans-serif';
    ctx.fillStyle = textPrimary;
    ctx.fillText('SSC ', padX, y);
    const sscW = ctx.measureText('SSC ').width;
    ctx.fillStyle = cyan;
    ctx.fillText('NAPOLI DATA', padX + sscW, y);

    // Right side: Geometric N Circle + @sscnapolidata
    const circleX = W - padX - 235;
    const circleY = y - 10;
    ctx.beginPath();
    ctx.arc(circleX, circleY, 20, 0, Math.PI * 2);
    ctx.fillStyle = cyan;
    ctx.fill();

    // Draw Geometric N inside circle
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(circleX - 7, circleY + 9);
    ctx.lineTo(circleX - 7, circleY - 9);
    ctx.lineTo(circleX + 7, circleY + 7);
    ctx.moveTo(circleX - 7, circleY - 4);
    ctx.lineTo(circleX + 7, circleY + 10);
    ctx.lineTo(circleX + 7, circleY - 9);
    ctx.stroke();

    ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = cyan;
    ctx.fillText('@sscnapolidata', circleX + 30, y - 2);

    y += 48;
    ctx.font = '600 18px "JetBrains Mono", monospace';
    ctx.fillStyle = textSecondary;
    ctx.fillText(
      lang === 'it'
        ? 'PANORAMICA — GOL E OCCASIONI CHIAVE'
        : 'OVERVIEW — GOALS AND KEY CHANCES',
      padX,
      y
    );

    // Waveform Box
    y += 24;
    const waveBoxH = 190;
    ctx.fillStyle = panelBg;
    ctx.fillRect(padX, y, W - padX * 2, waveBoxH);
    ctx.strokeStyle = divider;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(padX, y, W - padX * 2, waveBoxH);

    const bars = match.waveformBars;
    const innerW = W - padX * 2 - 64;
    const barGap = 16;
    const barW = (innerW - barGap * (bars.length - 1)) / bars.length;
    const maxBarH = 120;
    const baseLineY = y + 142;

    bars.forEach((b, i) => {
      const bx = padX + 32 + i * (barW + barGap);
      const bh = Math.max(12, (b.height / 100) * maxBarH);
      ctx.fillStyle =
        b.team === 'napoli'
          ? cyan
          : b.team === 'opponent'
          ? isDark
            ? '#7D8590'
            : '#8C95A2'
          : isDark
          ? '#2B313A'
          : '#DCE0E6';
      ctx.fillRect(bx, baseLineY - bh, barW, bh);

      ctx.font = '500 16px "JetBrains Mono", monospace';
      ctx.fillStyle = textSecondary;
      ctx.textAlign = 'center';
      ctx.fillText(b.label, bx + barW / 2, baseLineY + 28);
    });
    ctx.textAlign = 'left';

    y += waveBoxH + 54;

    // Match Metadata
    ctx.font = '700 24px Archivo, sans-serif';
    ctx.fillStyle = textPrimary;
    ctx.fillText(
      `${match.competition} · ${lang === 'it' ? match.matchdayIt : match.matchdayEn}`,
      padX,
      y
    );
    y += 34;
    ctx.font = '400 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = textSecondary;
    ctx.fillText(
      `${lang === 'it' ? match.dateDisplayIt : match.dateDisplayEn} · ${match.time} · ${match.stadium}, ${match.city}`,
      padX,
      y
    );

    // Teams & Huge Scoreline
    y += 66;
    ctx.font = '700 32px Archivo, sans-serif';
    ctx.fillStyle = textPrimary;
    ctx.fillText(match.homeTeam, padX, y);
    ctx.textAlign = 'right';
    ctx.fillText(match.awayTeam, W - padX, y);

    y += 105;
    ctx.textAlign = 'center';
    ctx.font = '800 128px Archivo, sans-serif';
    ctx.fillStyle = textPrimary;
    ctx.fillText(`${match.homeGoals} - ${match.awayGoals}`, W / 2, y);

    y += 42;
    ctx.font = '600 20px "JetBrains Mono", monospace';
    ctx.fillStyle = cyan;
    ctx.fillText('● FULL TIME', W / 2, y);
    ctx.textAlign = 'left';

    // Section Divider: MATCH SUMMARY
    y += 58;
    ctx.fillStyle = cyan;
    ctx.font = '700 20px "JetBrains Mono", monospace';
    ctx.fillText(lang === 'it' ? 'SINTESI PARTITA' : 'MATCH SUMMARY', padX, y);
    ctx.strokeStyle = divider;
    ctx.beginPath();
    ctx.moveTo(padX + 220, y - 7);
    ctx.lineTo(W - padX, y - 7);
    ctx.stroke();

    y += 40;
    ctx.fillStyle = textPrimary;
    ctx.font = '400 24px "Plus Jakarta Sans", sans-serif';
    const summaryText = lang === 'it' ? match.summaryIt : match.summaryEn;
    const words = summaryText.split(' ');
    let line = '';
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      if (ctx.measureText(testLine).width > W - padX * 2 && i > 0) {
        ctx.fillText(line, padX, y);
        line = words[i] + ' ';
        y += 36;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, padX, y);

    // Section: GOAL TIMELINE
    y += 60;
    ctx.fillStyle = cyan;
    ctx.font = '700 20px "JetBrains Mono", monospace';
    ctx.fillText('GOAL TIMELINE', padX, y);
    ctx.beginPath();
    ctx.moveTo(padX + 195, y - 7);
    ctx.lineTo(W - padX, y - 7);
    ctx.stroke();

    match.goals.forEach((g) => {
      y += 62;
      ctx.font = '800 56px Archivo, sans-serif';
      ctx.fillStyle = cyan;
      ctx.fillText(g.minute, padX, y);

      ctx.font = '700 28px Archivo, sans-serif';
      ctx.fillStyle = textPrimary;
      ctx.fillText(g.scorer, padX + 135, y - 18);

      ctx.font = '600 18px "JetBrains Mono", monospace';
      ctx.fillStyle = textSecondary;
      ctx.fillText(`${g.teamName} · [${g.partialScore}]`, padX + 135, y + 10);

      y += 38;
      ctx.font = '400 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = textSecondary;
      const desc = lang === 'it' ? g.descriptionIt : g.descriptionEn;
      ctx.fillText(desc.slice(0, 82) + (desc.length > 82 ? '...' : ''), padX + 135, y);
    });

    // Section: COVERAGE & VERIFICATION STATUS
    y += 70;
    ctx.fillStyle = cyan;
    ctx.font = '700 20px "JetBrains Mono", monospace';
    ctx.fillText(
      lang === 'it' ? 'COPERTURA DATI & RIGORE METODOLOGICO' : 'DATA COVERAGE & RIGOR',
      padX,
      y
    );

    y += 26;
    ctx.fillStyle = panelBg;
    ctx.fillRect(padX, y, W - padX * 2, 165);
    ctx.strokeStyle = divider;
    ctx.strokeRect(padX, y, W - padX * 2, 165);

    const covEntries = Object.entries(match.cov);
    covEntries.forEach(([key, status], idx) => {
      const col = idx % 4;
      const row = Math.floor(idx / 4);
      const cx = padX + 28 + col * 225;
      const cy = y + 54 + row * 68;
      ctx.font = '500 17px "JetBrains Mono", monospace';
      ctx.fillStyle = textSecondary;
      ctx.fillText(key.toUpperCase(), cx, cy);
      ctx.font = '700 20px "JetBrains Mono", monospace';
      ctx.fillStyle = status === 'completo' ? cyan : textPrimary;
      ctx.fillText(status.toUpperCase(), cx, cy + 26);
    });

    // Section: THE ETERNAL MATCH
    y += 225;
    ctx.fillStyle = cyan;
    ctx.font = '700 20px "JetBrains Mono", monospace';
    ctx.fillText('THE ETERNAL MATCH (DAL 1926)', padX, y);

    y += 56;
    ctx.font = '800 54px Archivo, sans-serif';
    ctx.fillStyle = textPrimary;
    ctx.fillText(`NAP vs ${match.eternalMatch.opponentCode}`, padX, y);

    ctx.font = '600 24px "JetBrains Mono", monospace';
    ctx.fillStyle = textSecondary;
    ctx.fillText(
      `${match.eternalMatch.officialMatches} Gare · ${match.eternalMatch.napoliWins}V · ${match.eternalMatch.draws}P · ${match.eternalMatch.opponentWins}S · Gol ${match.eternalMatch.napoliGoals}-${match.eternalMatch.opponentGoals}`,
      padX + 350,
      y - 10
    );

    // Permanent Branded Footer with N Logo, @sscnapolidata, Slogan, and Sources
    const footerY = H - 185;
    ctx.strokeStyle = divider;
    ctx.beginPath();
    ctx.moveTo(padX, footerY - 30);
    ctx.lineTo(W - padX, footerY - 30);
    ctx.stroke();

    // Draw Footer N Circle Logo
    const fCircleX = padX + 26;
    const fCircleY = footerY + 18;
    ctx.beginPath();
    ctx.arc(fCircleX, fCircleY, 26, 0, Math.PI * 2);
    ctx.fillStyle = cyan;
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(fCircleX - 9, fCircleY + 12);
    ctx.lineTo(fCircleX - 9, fCircleY - 12);
    ctx.lineTo(fCircleX + 9, fCircleY + 9);
    ctx.moveTo(fCircleX - 9, fCircleY - 5);
    ctx.lineTo(fCircleX + 9, fCircleY + 13);
    ctx.lineTo(fCircleX + 9, fCircleY - 12);
    ctx.stroke();

    ctx.font = '800 26px Archivo, sans-serif';
    ctx.fillStyle = textPrimary;
    ctx.fillText('SSC NAPOLI DATA', padX + 68, footerY + 12);

    ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = cyan;
    ctx.fillText('Data Napoli, Napoli Analitica · @sscnapolidata', padX + 68, footerY + 40);

    ctx.font = '400 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = textSecondary;
    match.sources.forEach((s, idx) => {
      ctx.fillText(
        `Fonte [${idx + 1}]: ${s.label} — ${s.detail}`,
        padX,
        footerY + 86 + idx * 26
      );
    });

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `sscnapolidata-${match.id}-${exportTheme}-1x2.png`;
    a.click();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0E1116] border border-[#01A0E8]/35 text-white p-6 md:p-8 my-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <NapoliLogoIcon size={32} />
            <div>
              <h3 className="text-lg font-bold tracking-tight font-display">
                {lang === 'it'
                  ? 'Esporta Scheda Infografica 1:2 (@sscnapolidata)'
                  : 'Export 1:2 Match Infographic (@sscnapolidata)'}
              </h3>
              <p className="text-xs text-[#9BA5B4]">
                {lang === 'it'
                  ? 'Formato verticale 1:2 con logo N geometrico, handle @sscnapolidata e fonti certificate.'
                  : '1:2 vertical format with geometric N logo, @sscnapolidata handle, and verified sources.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#9BA5B4] hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9BA5B4] font-mono-tabular">
              {lang === 'it' ? 'Tema Scheda:' : 'Card Theme:'}
            </span>
            <button
              onClick={() => setExportTheme('dark')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors border ${
                exportTheme === 'dark'
                  ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-semibold'
                  : 'bg-transparent text-white border-white/20 hover:border-white/40'
              }`}
            >
              Dark (#08090B)
            </button>
            <button
              onClick={() => setExportTheme('light')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors border ${
                exportTheme === 'light'
                  ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-semibold'
                  : 'bg-transparent text-white border-white/20 hover:border-white/40'
              }`}
            >
              Light (#F4F5F6)
            </button>
          </div>

          <button
            onClick={generateAndDownloadPng}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#01A0E8] text-[#08090B] font-bold text-xs tracking-wide hover:bg-[#01A0E8]/90 transition-colors cursor-pointer"
          >
            {downloaded ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            <span>
              {downloaded
                ? lang === 'it'
                  ? 'PNG 1:2 Scaricato'
                  : '1:2 PNG Downloaded'
                : lang === 'it'
                ? 'Scarica PNG 1:2 (1080×2160)'
                : 'Download 1:2 PNG (1080×2160)'}
            </span>
          </button>
        </div>

        {/* Live Visual Preview of the 1:2 Card */}
        <div className="flex justify-center bg-[#08090B] p-4 border border-white/10 max-h-[62vh] overflow-y-auto">
          <div
            className={`w-full max-w-[380px] p-6 border transition-colors ${
              exportTheme === 'dark'
                ? 'bg-[#08090B] text-white border-[#01A0E8]/35'
                : 'bg-[#F4F5F6] text-[#08090B] border-[#0190D4]/35'
            }`}
            style={{ aspectRatio: '1 / 2' }}
          >
            {/* Header with Logo and Handle */}
            <div className="flex items-center justify-between pb-3 border-b border-[#01A0E8]/30">
              <div className="font-display font-extrabold text-sm tracking-tight">
                <span>DATA </span>
                <span className="text-[#01A0E8]">NAPOLI</span>
              </div>
              <div className="flex items-center gap-1.5">
                <NapoliLogoIcon size={18} />
                <span className="text-xs font-semibold text-[#01A0E8]">@sscnapolidata</span>
              </div>
            </div>

            {/* Waveform */}
            <div className="mt-4">
              <div className="text-[10px] font-mono-tabular opacity-65 tracking-wider uppercase mb-2">
                OVERVIEW — GOALS AND KEY CHANCES
              </div>
              <div
                className={`p-3 border ${
                  exportTheme === 'dark'
                    ? 'bg-[#0E1116] border-white/10'
                    : 'bg-white border-black/10'
                }`}
              >
                <div className="flex items-end justify-between gap-1.5 h-16">
                  {match.waveformBars.map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <div
                        className="w-full"
                        style={{
                          height: `${bar.height}%`,
                          backgroundColor:
                            bar.team === 'napoli'
                              ? '#01A0E8'
                              : bar.team === 'opponent'
                              ? '#7D8590'
                              : 'rgba(125,133,144,0.28)',
                        }}
                      />
                      <span className="text-[9px] font-mono-tabular opacity-65">{bar.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Match Identity & Scoreline */}
            <div className="mt-5">
              <div className="text-xs font-bold tracking-tight">
                {match.competition} · {lang === 'it' ? match.matchdayIt : match.matchdayEn}
              </div>
              <div className="text-[11px] opacity-70">
                {lang === 'it' ? match.dateDisplayIt : match.dateDisplayEn} · {match.stadium}
              </div>

              <div className="flex items-center justify-between mt-4 text-xs font-bold">
                <span>{match.homeTeam}</span>
                <span>{match.awayTeam}</span>
              </div>
              <div className="text-center my-2">
                <div className="text-5xl font-display font-extrabold tracking-tight tabular-nums">
                  {match.homeGoals}{' '}
                  <span className="text-[#01A0E8]">-</span> {match.awayGoals}
                </div>
                <div className="text-[10px] font-mono-tabular text-[#01A0E8] mt-1 tracking-widest">
                  ● FULL TIME
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-4 pt-3 border-t border-[#01A0E8]/25">
              <div className="text-[10px] font-mono-tabular text-[#01A0E8] font-bold tracking-wider mb-1.5">
                MATCH SUMMARY
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                {lang === 'it' ? match.summaryIt : match.summaryEn}
              </p>
            </div>

            {/* Goal Timeline */}
            <div className="mt-4 pt-3 border-t border-[#01A0E8]/25">
              <div className="text-[10px] font-mono-tabular text-[#01A0E8] font-bold tracking-wider mb-2">
                GOAL TIMELINE
              </div>
              <div className="space-y-2.5">
                {match.goals.map((g, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="text-xl font-display font-extrabold text-[#01A0E8] w-10 shrink-0 tabular-nums">
                      {g.minute}
                    </div>
                    <div className="text-[11px]">
                      <div className="font-bold">{g.scorer}</div>
                      <div className="opacity-70 text-[10px]">
                        {g.teamName} · {g.partialScore}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Branded Footer */}
            <div className="mt-6 pt-3 border-t border-[#01A0E8]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <NapoliLogoIcon size={22} />
                <div>
                  <div className="text-[11px] font-display font-bold leading-none">
                    SSC NAPOLI DATA
                  </div>
                  <div className="text-[10px] text-[#01A0E8] font-medium">
                    Napoli Analitica · @sscnapolidata
                  </div>
                </div>
              </div>
              <div className="text-[9px] font-mono-tabular opacity-65 text-right">
                ZERO INVENTED DATA
              </div>
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};
