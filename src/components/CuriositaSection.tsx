import React, { useState } from 'react';
import { Database, Sparkles, CheckCircle2, Copy, Check, ExternalLink, Hash, Award } from 'lucide-react';
import { NapoliLogoIcon } from './BrandMark';
import curiositaData from '../data/generated/curiosita.json';

interface CuriositaSectionProps {
  lang: 'it' | 'en';
}

export const CuriositaSection: React.FC<CuriositaSectionProps> = ({ lang }) => {
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const tags = ['ALL', 'RECORD', 'SCUDETTI', 'COPPE', 'MERCATO'];

  const filteredItems = curiositaData.filter((item) => {
    if (selectedTag === 'ALL') return true;
    if (selectedTag === 'RECORD') return item.tag.includes('RECORD');
    if (selectedTag === 'SCUDETTI') return item.tag.includes('SCUDETTO') || item.tag.includes('SPALLETTI') || item.tag.includes('DOPPIETTA');
    if (selectedTag === 'COPPE') return item.tag.includes('COPPA');
    if (selectedTag === 'MERCATO') return item.tag.includes('CALCIOMERCATO');
    return true;
  });

  const handleCopy = (item: typeof curiositaData[0]) => {
    const textToCopy = `🔵 ${item.titolo}\n📊 ${item.statistica}\n\n${item.descrizione}\n\n📌 Fonte: ${item.fonte}\n${item.hashtag} via @sscnapolidata`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <section id="dal-database" className="space-y-6 scroll-mt-20">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-tabular text-[#01A0E8] font-bold uppercase tracking-wider">
            <Database className="w-3.5 h-3.5" />
            <span>{lang === 'it' ? 'DAL DATABASE · CURIOSITÀ VERIFICATE' : 'FROM DATABASE · VERIFIED CURIOSITIES'}</span>
          </div>
          <h2 className="text-2xl font-display font-extrabold mt-1 tracking-tight">
            {lang === 'it' ? 'Pillole Statistiche & Record Storici' : 'Statistical Pills & Historical Records'}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {lang === 'it' 
              ? 'Fatti, numeri e primati azzurri estratti direttamente dal database con certificazione delle fonti primarie.' 
              : 'Facts, figures, and historical records extracted from our database with primary source verification.'}
          </p>
        </div>

        {/* Filter Tags */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono-tabular">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(t)}
              className={`px-2.5 py-1 border transition-colors cursor-pointer ${
                selectedTag === t
                  ? 'bg-[#01A0E8] text-[#08090B] border-[#01A0E8] font-bold'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-hairline)] hover:border-[#01A0E8]'
              }`}
            >
              {t === 'ALL' ? (lang === 'it' ? 'Tutte (5)' : 'All (5)') : t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Editorial Cards (X / Social Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <article
            key={item.id}
            className="flex flex-col justify-between bg-[var(--bg-secondary)] border border-[var(--border-hairline)] hover:border-[#01A0E8]/60 transition-all duration-200 p-5 md:p-6 shadow-sm hover:shadow-md relative group"
          >
            {/* Top row: Avatar + Handle + Tag badge */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <NapoliLogoIcon size={32} useImageAsset={true} />
                  <div>
                    <div className="text-xs font-display font-bold flex items-center gap-1">
                      <span>SSC Napoli Data</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#01A0E8] fill-[#01A0E8]/20" />
                    </div>
                    <div className="text-[11px] font-mono-tabular text-[var(--text-secondary)]">
                      @sscnapolidata · {item.anno}
                    </div>
                  </div>
                </div>

                <span className="px-2 py-0.5 text-[10px] font-mono-tabular font-extrabold uppercase bg-[#01A0E8]/10 text-[#01A0E8] border border-[#01A0E8]/30">
                  {item.tag}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base font-display font-extrabold tracking-tight group-hover:text-[#01A0E8] transition-colors">
                {item.titolo}
              </h3>

              {/* Highlight Stat Box */}
              <div className="p-3 bg-[var(--bg-primary)] border-l-2 border-[#01A0E8] text-xs font-mono-tabular font-bold text-[#01A0E8] leading-snug">
                {item.statistica}
              </div>

              {/* Description */}
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {item.descrizione}
              </p>
            </div>

            {/* Bottom Section: Verified Source Box + Action Bar */}
            <div className="mt-5 pt-4 border-t border-[var(--border-hairline)] space-y-3">
              {/* Source verification box */}
              <div className="p-2.5 bg-[var(--bg-primary)] border border-[var(--border-hairline)] flex items-start gap-2 text-[11px] text-[var(--text-secondary)] font-mono-tabular">
                <Award className="w-3.5 h-3.5 text-[#01A0E8] shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <strong className="text-[var(--text-primary)]">Fonte Primaria:</strong>{' '}
                  <span>{item.fonte}</span>
                </div>
              </div>

              {/* Hashtags and Copy Button */}
              <div className="flex items-center justify-between text-xs font-mono-tabular">
                <span className="text-[11px] text-[var(--text-secondary)] truncate mr-2">
                  {item.hashtag}
                </span>

                <button
                  onClick={() => handleCopy(item)}
                  className="px-2.5 py-1 text-[11px] bg-[var(--bg-primary)] hover:bg-[#01A0E8] hover:text-[#08090B] text-[var(--text-primary)] border border-[var(--border-hairline)] hover:border-[#01A0E8] transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                  title="Copia pillola formattata per X"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3 h-3 text-green-400" />
                      <span className="font-bold text-green-400">{lang === 'it' ? 'Copiato!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-[#01A0E8]" />
                      <span>{lang === 'it' ? 'Condividi' : 'Share'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
