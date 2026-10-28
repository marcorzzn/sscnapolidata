import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, RefreshCw, MessageSquare, CheckCircle2, ShieldCheck } from 'lucide-react';
import { NapoliLogoIcon, WaveformSkyline } from './BrandMark';
import { X_FEED_POSTS } from '../data/napoliVerifiedData';

interface TwitterFeedSectionProps {
  lang: 'it' | 'en';
  theme: 'dark' | 'light';
}

export const TwitterFeedSection: React.FC<TwitterFeedSectionProps> = ({ lang, theme }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [feedMode, setFeedMode] = useState<'official' | 'curated'>('official');
  const [widgetLoaded, setWidgetLoaded] = useState<boolean>(false);

  useEffect(() => {
    // Dynamically inject official Twitter widgets.js
    const scriptId = 'twitter-wjs';
    const existingScript = document.getElementById(scriptId);

    const loadWidgets = () => {
      if ((window as any).twttr && (window as any).twttr.widgets) {
        (window as any).twttr.widgets.load(containerRef.current);
        setWidgetLoaded(true);
      }
    };

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      script.charset = 'utf-8';
      script.onload = () => {
        loadWidgets();
      };
      document.body.appendChild(script);
    } else {
      loadWidgets();
    }
  }, [theme, feedMode]);

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-hairline)] overflow-hidden space-y-0">
      {/* Waveform Skyline Header with official brand profile */}
      <div className="relative h-28 bg-[#01A0E8] flex items-end overflow-hidden px-4 pt-3">
        <WaveformSkyline height={75} className="opacity-95" />
      </div>

      <div className="p-6">
        {/* Profile Avatar & Follow Button */}
        <div className="flex items-end justify-between -mt-12 mb-3 relative z-10">
          <div className="p-1 bg-[var(--bg-secondary)] rounded-full shadow-md">
            <NapoliLogoIcon size={56} useImageAsset={true} />
          </div>
          <a
            href="https://x.com/sscnapolidata"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 text-xs font-bold bg-[#01A0E8] text-[#08090B] hover:bg-[#01A0E8]/90 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>{lang === 'it' ? 'Segui su X' : 'Follow on X'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-lg font-display font-extrabold">SSC Napoli Data</h3>
            <CheckCircle2 className="w-4 h-4 text-[#01A0E8] fill-[#01A0E8]/20" />
          </div>
          <div className="text-xs text-[var(--text-secondary)] font-mono-tabular">
            @sscnapolidata
          </div>
        </div>

        <p className="text-xs mt-2.5 text-[var(--text-primary)] leading-relaxed">
          Data Napoli, Napoli Analitica.{' '}
          {lang === 'it'
            ? 'Ogni tanto do i numeri sul @sscnapoli, qualche volta potrei dare i numeri e basta. Archivio statistico e visualizzazioni.'
            : 'Statistical analysis and visual breakdowns on @sscnapoli. Historical archive with primary source verification.'}
        </p>

        {/* Mode Switcher Tabs */}
        <div className="mt-4 pt-4 border-t border-[var(--border-hairline)] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-[var(--bg-primary)] p-1 border border-[var(--border-hairline)] text-xs font-mono-tabular">
            <button
              onClick={() => setFeedMode('official')}
              className={`px-3 py-1 transition-colors cursor-pointer ${
                feedMode === 'official'
                  ? 'bg-[#01A0E8] text-[#08090B] font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {lang === 'it' ? 'Live Feed X (Embed)' : 'Live X Feed'}
            </button>
            <button
              onClick={() => setFeedMode('curated')}
              className={`px-3 py-1 transition-colors cursor-pointer ${
                feedMode === 'curated'
                  ? 'bg-[#01A0E8] text-[#08090B] font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {lang === 'it' ? 'Thread Verificati' : 'Verified Posts'}
            </button>
          </div>

          <a
            href="https://x.com/sscnapolidata"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-mono-tabular text-[#01A0E8] hover:underline hidden sm:inline-flex items-center gap-1"
          >
            <span>x.com/sscnapolidata</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* OFFICIAL X WIDGET EMBED CONTAINER */}
        {feedMode === 'official' && (
          <div ref={containerRef} className="mt-4 min-h-[420px] max-h-[640px] overflow-y-auto pr-1">
            <a
              className="twitter-timeline"
              data-theme={theme}
              data-chrome="noheader nofooter noborders transparent"
              data-tweet-limit="5"
              data-dnt="true"
              href="https://twitter.com/sscnapolidata?ref_src=twsrc%5Etfw"
            >
              <div className="p-6 text-center text-xs font-mono-tabular text-[var(--text-secondary)] border border-[var(--border-hairline)] bg-[var(--bg-primary)]">
                <div className="w-6 h-6 border-2 border-[#01A0E8] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <span>{lang === 'it' ? 'Caricamento feed ufficiale di @sscnapolidata da X...' : 'Loading official @sscnapolidata feed from X...'}</span>
              </div>
            </a>
          </div>
        )}

        {/* CURATED VERIFIED POSTS FALLBACK / NATIVE CARDS */}
        {feedMode === 'curated' && (
          <div className="mt-4 divide-y divide-[var(--border-hairline)] max-h-[640px] overflow-y-auto pr-1">
            {X_FEED_POSTS.map((post) => (
              <div key={post.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono-tabular">
                  <div className="flex items-center gap-2">
                    <NapoliLogoIcon size={20} useImageAsset={true} />
                    <span className="font-bold">SSC Napoli Data</span>
                    <span className="text-[var(--text-secondary)]">· {post.date}</span>
                  </div>
                </div>

                <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                  {lang === 'it' ? post.textIt : post.textEn}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] font-mono-tabular">
                  <span className="text-[#01A0E8] font-semibold">
                    Fonte: {post.citedSource}
                  </span>
                  <span className="text-[var(--text-secondary)]">
                    {post.hashtags.join(' ')}
                  </span>
                </div>

                <div className="p-2 bg-[var(--bg-primary)] border border-[var(--border-hairline)] text-[11px] text-[var(--text-secondary)] flex items-start gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#01A0E8] shrink-0 mt-0.5" />
                  <span>
                    {lang === 'it' ? post.verificationMethodIt : post.verificationMethodEn}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
