import { useId } from "react";

interface SimantrixMarkProps {
  /** Rendered width and height in px; or size it with `className` (e.g. `size-9`). */
  size?: number;
  className?: string;
  /** Accessible name; pass "" when a visible "Simantrix" wordmark sits next to it. */
  title?: string;
}

/**
 * Simantrix "SX" monogram: white S and X on the brand violet, with the X's second
 * stroke in cyan. Drawn as paths, so it renders the same everywhere without a font.
 * Keep in sync with `src/app/icon.svg` (the favicon).
 */
export function SimantrixMark({ size = 32, className, title = "Simantrix" }: SimantrixMarkProps) {
  const uid = useId();
  const bg = `${uid}-bg`;
  const border = `${uid}-border`;
  const cyanGrad = `${uid}-cyan`;
  const purpleGrad = `${uid}-purple`;
  const transGrad = `${uid}-trans`;
  const glow = `${uid}-glow`;

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={bg} cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#081328" />
          <stop offset="70%" stopColor="#020611" />
          <stop offset="100%" stopColor="#00030B" />
        </radialGradient>
        <linearGradient id={border} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#D946EF" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id={cyanGrad} x1="20%" y1="10%" x2="80%" y2="70%">
          <stop offset="0%" stopColor="#00F5FF" />
          <stop offset="45%" stopColor="#0091FF" />
          <stop offset="100%" stopColor="#0051FF" />
        </linearGradient>
        <linearGradient id={purpleGrad} x1="80%" y1="90%" x2="20%" y2="30%">
          <stop offset="0%" stopColor="#FF1493" />
          <stop offset="45%" stopColor="#C026D3" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <linearGradient id={transGrad} x1="30%" y1="30%" x2="70%" y2="70%">
          <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#A855F7" stopOpacity="0.8" />
        </linearGradient>
        <filter id={glow} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${bg})`} />
      <rect x="0.5" y="0.5" width="63" height="63" rx="15.5" fill="none" stroke={`url(#${border})`} strokeWidth="1" />
      <g transform="translate(6.5, 6.5) scale(0.51)">
        <ellipse cx="50" cy="35" rx="28" ry="20" fill="#00F5FF" opacity="0.18" filter={`url(#${glow})`} />
        <ellipse cx="50" cy="65" rx="28" ry="20" fill="#C026D3" opacity="0.18" filter={`url(#${glow})`} />
        <path d="M 55 12 C 57.5 12 59 13.5 59 16 L 59 32 C 59 34 57.5 35 55 35 C 52.5 35 51 34 51 32 L 51 16 C 51 13.5 52.5 12 55 12 Z" fill="#00F5FF" />
        <path d="M 55 16 C 45 16 33 22 26 31 C 21 38 21 44 26 48 L 46 38 C 50 36 57 32 68 38 C 76 43 78 50 74 57 L 74 48 C 77 42 75 36 68 32 C 57 26 50 28 44 31 L 28 39 C 33 30 43 24 55 24 Z" fill={`url(#${cyanGrad})`} />
        <path d="M 42 33 L 64 44 C 70 47 74 52 74 58 C 74 64 70 69 64 72 L 40 60 C 34 57 30 52 30 46 C 30 40 34 35 42 33 Z" fill={`url(#${transGrad})`} opacity="0.8" />
        <path d="M 45 88 C 42.5 88 41 86.5 41 84 L 41 68 C 41 66 42.5 65 45 65 C 47.5 65 49 66 49 68 L 49 84 C 49 86.5 47.5 88 45 88 Z" fill="#FF1493" />
        <path d="M 45 84 C 55 84 67 78 74 69 C 79 62 79 56 74 52 L 54 62 C 50 64 43 68 32 62 C 24 57 22 50 26 43 L 26 52 C 23 58 25 64 32 68 C 43 74 50 72 56 69 L 72 61 C 67 70 57 76 45 76 Z" fill={`url(#${purpleGrad})`} />
        <path d="M 51 16 C 51 13.5 52.5 12 55 12 C 57.5 12 59 13.5 59 16 L 59 28" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
        <path d="M 26 31 C 33 22 45 16 55 16" stroke="#E0F7FF" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
        <path d="M 49 84 C 49 86.5 47.5 88 45 88 C 42.5 88 41 86.5 41 84 L 41 72" stroke="#FFD6F0" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
        <path d="M 74 69 C 67 78 55 84 45 84" stroke="#FF80DF" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
      </g>
    </svg>
  );
}
