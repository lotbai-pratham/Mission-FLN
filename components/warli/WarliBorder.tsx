"use client";

import { useId } from "react";

type WarliBorderProps = {
  height?: number;
  flip?: boolean;
  variant?: "figures" | "zigzag";
  className?: string;
};

// Decorative repeating strip inspired by Warli tribal art (Maharashtra) —
// alternating tree, dancing figure and dot motifs for larger bands,
// or a simple zigzag for thin edges like the navbar.
export default function WarliBorder({
  height = 24,
  flip = false,
  variant = "figures",
  className = "",
}: WarliBorderProps) {
  const patternId = `warli-${variant}-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <svg
      aria-hidden="true"
      className={className}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      style={flip ? { transform: "scaleY(-1)" } : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {variant === "figures" ? (
          <pattern id={patternId} x="0" y="0" width="64" height={height} patternUnits="userSpaceOnUse">
            <line x1="0" y1={height - 2} x2="64" y2={height - 2} stroke="currentColor" strokeWidth="1" opacity="0.5" />

            {/* Tree: stacked triangles on a trunk */}
            <path d={`M8 ${height - 2} L8 ${height - 6}`} stroke="currentColor" strokeWidth="1.2" />
            <path d={`M3.5 ${height - 6} L8 ${height - 15} L12.5 ${height - 6} Z`} fill="currentColor" opacity="0.9" />
            <path d={`M5 ${height - 11} L8 ${height - 18} L11 ${height - 11} Z`} fill="currentColor" />

            {/* Dancer: circle head, two triangles joined at the waist, mid-step limbs */}
            <circle cx="30" cy={height - 17.5} r="1.6" fill="currentColor" />
            <path d={`M26.5 ${height - 15} L33.5 ${height - 15} L30 ${height - 9.5} Z`} fill="currentColor" />
            <path d={`M30 ${height - 9.5} L26.5 ${height - 4} L33.5 ${height - 4} Z`} fill="currentColor" />
            <path d={`M26.5 ${height - 15} L22 ${height - 18}`} stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            <path d={`M33.5 ${height - 15} L38 ${height - 13}`} stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            <path d={`M26.5 ${height - 4} L23 ${height - 1.5}`} stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            <path d={`M33.5 ${height - 4} L36.5 ${height - 1}`} stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />

            {/* Dot */}
            <circle cx="52" cy={height - 4.5} r="1.5" fill="currentColor" opacity="0.7" />
          </pattern>
        ) : (
          <pattern id={patternId} x="0" y="0" width="16" height={height} patternUnits="userSpaceOnUse">
            <path
              d={`M0 ${height} L8 0 L16 ${height}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              opacity="0.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </pattern>
        )}
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
