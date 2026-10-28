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
  useImageAsset = false,
}) => {
  const [imgError, setImgError] = React.useState(false);
  const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

  if (useImageAsset && !imgError) {
    return (
      <img
        src={`${baseUrl}/assets/aistudio/L_IPogEZ_400x400_77e6c2dc.jpg`}
        alt="SSC Napoli Data"
        width={size}
        height={size}
        onError={() => setImgError(true)}
        className={`rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="SSC Napoli Data geometric N logo"
    >
      <circle cx="50" cy="50" r="50" fill="#01A0E8" />
      {/* Outer vertical strokes and double diagonal of the geometric N */}
      <path
        d="M32 72V28H38.5L63.5 57.5V28H68V72H61.5L36.5 42.5V72H32Z"
        fill="#FFFFFF"
      />
      <line
        x1="34.5"
        y1="35.5"
        x2="63.5"
        y2="69.5"
        stroke="#01A0E8"
        strokeWidth="2.6"
      />
      <line
        x1="36.5"
        y1="29.5"
        x2="65.5"
        y2="63.5"
        stroke="#FFFFFF"
        strokeWidth="3.8"
      />
    </svg>
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
