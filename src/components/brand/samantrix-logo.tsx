import { useId } from "react";

interface SamantrixMarkProps {
  /** Rendered width and height in px; or size it with `className` (e.g. `size-9`). */
  size?: number;
  className?: string;
  /** Accessible name; pass "" when a visible "Samantrix" wordmark sits next to it. */
  title?: string;
}

/**
 * Samantrix "SX" monogram: white S and X on the brand violet, with the X's second
 * stroke in cyan. Drawn as paths, so it renders the same everywhere without a font.
 * Keep in sync with `src/app/icon.svg` (the favicon).
 */
export function SamantrixMark({ size, className, title = "Samantrix" }: SamantrixMarkProps) {
  const uid = useId();
  const bg = `${uid}-bg`;

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
        <linearGradient id={bg} x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#9a82ff" />
          <stop offset=".55" stopColor="#7c5cff" />
          <stop offset="1" stopColor="#5a2fe6" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill={`url(#${bg})`} />
      <rect x="1" y="1" width="62" height="62" rx="17" fill="none" stroke="#fff" strokeOpacity=".22" strokeWidth="2" />
      <g fill="none" strokeLinecap="round" strokeWidth="6">
        <path
          stroke="#fff"
          d="M30 21C28 18.9 25.3 17.6 22.2 17.6c-4.8 0-8.4 2.8-8.4 6.9 0 4.2 3.6 5.8 8.4 7.4 5 1.7 8.6 3.6 8.6 8.2 0 4.3-3.7 6.6-8.6 6.6-3.6 0-6.8-1.4-9.1-3.9"
        />
        <path stroke="#fff" d="M36.6 17.8 51 46.2" />
        <path stroke="#7ee0ff" d="M51 17.8 36.6 46.2" />
      </g>
    </svg>
  );
}
