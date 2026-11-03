import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  useImageAsset?: boolean;
}

/**
 * Geometric "N" Brand Mark of SSC Napoli Data (@sscnapolidata)
 * Matches the exact double-diagonal linear geometry on #01A0E8 cyan background.
 */
export const NapoliLogoIcon: React.FC<LogoProps> = ({
  size = 32,
  className = '',
  useImageAsset = true,
}) => {
  const [imgSrc, setImgSrc] = React.useState<string | null>(null);
  const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const primarySrc = `${baseUrl}/favicon.png`;
  const fallbackSrc = `${baseUrl}/icon-192.png`;

  return (
    <img
      src={imgSrc || primarySrc}
      alt="SSC Napoli Data"
      width={size}
      height={size}
      onError={() => {
        if (!imgSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
      className={`rounded-full object-contain shrink-0 ${className}`}
    />
  );
};

interface WaveformProps {
  values?: number[];
  height?: number;
  className?: string;
  interactive?: boolean;
  onBarSelect?: (index: number) => void;
  selectedIndex?: number | null;
  labels?: string[];
}

/**
 * Functional Waveform / Audio-Spectrum Skyline
 * Inspired by the @sscnapolidata banner (Vesuvius dual-peak profile + lighthouse + match intensity bars)
 */
export const WaveformSkyline: React.FC<WaveformProps> = ({
  values,
  height = 64,
  className = '',
  interactive = false,
  onBarSelect,
  selectedIndex = null,
  labels = [],
}) => {
  // Default profile reflects the Vesuvius + Monte Somma dual peak and Gulf skyline from the banner
  const defaultProfile = [
    12, 14, 18, 28, 22, 34, 30, 26, 20, 16, 24, 32, 38, 44, 50, 56, 62, 68, 72,
    65, 58, 52, 59, 67, 75, 84, 92, 98, 93, 86, 79, 72, 65, 58, 52, 46, 40, 35,
    30, 25, 21, 17, 14, 11, 9, 8, 22, 8, 6, 5,
  ];

  const data = values && values.length > 0 ? values : defaultProfile;

  return (
    <div className={`w-full select-none ${className}`}>
      <div
        className="flex items-end justify-between gap-[2px] w-full"
        style={{ height: `${height}px` }}
      >
        {data.map((val, idx) => {
          const clamped = Math.max(6, Math.min(100, val));
          const isSelected = selectedIndex === idx;
          return (
            <div
              key={idx}
              onClick={() => interactive && onBarSelect && onBarSelect(idx)}
              title={labels[idx] ? `${labels[idx]} (${val})` : undefined}
              className={`flex-1 transition-opacity duration-150 ${
                interactive ? 'cursor-pointer hover:opacity-100' : ''
              }`}
              style={{
                height: `${clamped}%`,
                backgroundColor: isSelected
                  ? '#FFFFFF'
                  : clamped > 60
                  ? '#01A0E8'
                  : 'rgba(1, 160, 232, 0.42)',
                opacity: isSelected ? 1 : 0.9,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
