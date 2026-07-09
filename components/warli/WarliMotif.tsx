type WarliMotifProps = {
  variant: "dancer" | "tree" | "sun" | "deer" | "hut";
  size?: number;
  className?: string;
};

// Single accent doodle in the Warli tribal-art style (Maharashtra) — for
// corner accents, hero flourishes and empty states. Colored via currentColor
// so callers control tint/opacity with Tailwind text-* classes.
//
// Follows the traditional Warli convention: a human figure is two triangles
// joined at the tip (torso apex-down, pelvis apex-up), animals are a single
// solid body silhouette with thin stick legs, and trees/huts are stacked
// triangles — see https://en.wikipedia.org/wiki/Warli_painting
export default function WarliMotif({ variant, size = 40, className = "" }: WarliMotifProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {variant === "dancer" && (
        <g>
          <circle cx="20" cy="6.5" r="2.6" fill="currentColor" />
          <path d="M14 9.5 L26 9.5 L20 19.5 Z" fill="currentColor" />
          <path d="M20 19.5 L14 30 L26 30 Z" fill="currentColor" />
          <path d="M14 9.5 L6 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M26 9.5 L33 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M14 30 L9 38" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M26 30 L30.5 37.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      )}

      {variant === "tree" && (
        <g fill="currentColor">
          <path d="M19.3 37 L19.3 24" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M9 25 L19.5 9 L30 25 Z" opacity="0.9" />
          <path d="M12.5 17 L19.5 4 L26.5 17 Z" />
        </g>
      )}

      {variant === "sun" && (
        <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="20" cy="20" r="5.5" fill="currentColor" stroke="none" />
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * Math.PI) / 4;
            const x1 = 20 + Math.cos(angle) * 8.5;
            const y1 = 20 + Math.sin(angle) * 8.5;
            const x2 = 20 + Math.cos(angle) * 13;
            const y2 = 20 + Math.sin(angle) * 13;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
        </g>
      )}

      {variant === "deer" && (
        <g>
          <path d="M4 23.5 L17.5 15.5 L33 20.5 L18 29 Z" fill="currentColor" />
          <path d="M33 20.5 L38 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="39" cy="9.5" r="2" fill="currentColor" />
          <path d="M37.5 8 L35.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M40 8 L42 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M4 23.5 L1 27.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M10 27 L9 34.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M15.5 28.5 L15 35.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M21 28 L22 35.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M26 25.5 L28 33" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      )}

      {variant === "hut" && (
        <g fill="currentColor">
          <path d="M7 23 L20 7 L33 23 Z" />
          <rect x="11.5" y="23" width="17" height="11" />
          <rect x="17.5" y="27.5" width="5" height="6.5" fill="var(--background, #fff)" />
        </g>
      )}
    </svg>
  );
}
