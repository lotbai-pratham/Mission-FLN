"use client";

import React from "react";

export type ColorTheme = "color_amber" | "color_sky" | "color_rose" | "color_emerald" | "color_purple";
export type Hat = "hat_crown" | "hat_cap" | "hat_wizard" | null;
export type Accessory = "acc_glasses" | "acc_mask" | null;

interface RobotAvatarProps {
  size?: number;
  className?: string;
  colorTheme?: ColorTheme;
  hat?: Hat;
  accessory?: Accessory;
}

export default function RobotAvatar({
  size = 40,
  className = "",
  colorTheme = "color_amber",
  hat = null,
  accessory = null,
}: RobotAvatarProps) {
  
  // Theme dictionaries
  const themes = {
    color_amber: { head: ["#FFE082", "#FF8F00"], body: ["#FFB300", "#E65100"], stroke: "#E65100" },
    color_sky: { head: ["#BAE6FD", "#0284C7"], body: ["#38BDF8", "#0369A1"], stroke: "#0369A1" },
    color_rose: { head: ["#FECDD3", "#E11D48"], body: ["#FB7185", "#BE123C"], stroke: "#BE123C" },
    color_emerald: { head: ["#A7F3D0", "#059669"], body: ["#34D399", "#047857"], stroke: "#047857" },
    color_purple: { head: ["#E9D5FF", "#9333EA"], body: ["#C084FC", "#7E22CE"], stroke: "#7E22CE" },
  };

  const currentTheme = themes[colorTheme] || themes.color_amber;

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id={`botHead-${colorTheme}`} x1="16" y1="10" x2="48" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={currentTheme.head[0]} />
          <stop offset="100%" stopColor={currentTheme.head[1]} />
        </linearGradient>
        <linearGradient id={`botFace-${colorTheme}`} x1="20" y1="18" x2="44" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFEE0" />
          <stop offset="100%" stopColor="#FFF9C4" />
        </linearGradient>
        <linearGradient id={`botBody-${colorTheme}`} x1="20" y1="44" x2="44" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={currentTheme.body[0]} />
          <stop offset="100%" stopColor={currentTheme.body[1]} />
        </linearGradient>
        <linearGradient id={`eyeGrad-${colorTheme}`} x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <filter id={`shadow-${colorTheme}`} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Body */}
      <path d="M20 46 C20 46 22 58 32 58 C42 58 44 46 44 46 Z" fill={`url(#botBody-${colorTheme})`} filter={`url(#shadow-${colorTheme})`} />
      
      {/* Chest Core */}
      <circle cx="32" cy="51" r="4.5" fill="#E8232A" />
      <circle cx="32" cy="51" r="2.5" fill="#FF5252" className="animate-pulse" />

      {/* Antennas */}
      <rect x="21" y="9" width="4" height="8" rx="2" fill={currentTheme.stroke} />
      <circle cx="23" cy="8" r="2.5" fill={currentTheme.head[0]} />
      <rect x="39" y="9" width="4" height="8" rx="2" fill={currentTheme.stroke} />
      <circle cx="41" cy="8" r="2.5" fill={currentTheme.head[0]} />

      {/* Head */}
      <rect x="16" y="14" width="32" height="28" rx="10" fill={`url(#botHead-${colorTheme})`} filter={`url(#shadow-${colorTheme})`} stroke={currentTheme.stroke} strokeWidth="1" />

      {/* Face Screen */}
      <rect x="20" y="18" width="24" height="20" rx="6" fill={`url(#botFace-${colorTheme})`} stroke="#FFF" strokeWidth="0.5" />

      {/* Blush */}
      <circle cx="23.5" cy="29" r="2.2" fill="#FF8A80" opacity="0.6" />
      <circle cx="40.5" cy="29" r="2.2" fill="#FF8A80" opacity="0.6" />

      {/* Eyes */}
      <g>
        <circle cx="27" cy="25" r="3.2" fill={`url(#eyeGrad-${colorTheme})`} />
        <circle cx="28" cy="24" r="0.9" fill="#FFF" />
      </g>
      <g>
        <circle cx="37" cy="25" r="3.2" fill={`url(#eyeGrad-${colorTheme})`} />
        <circle cx="38" cy="24" r="0.9" fill="#FFF" />
      </g>

      {/* Smile */}
      <path d="M28 32 Q 32 35 36 32" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* --- Accessories --- */}
      {accessory === "acc_glasses" && (
        <g transform="translate(0, -1)">
          {/* Glasses Frame */}
          <rect x="23" y="22" width="8" height="6" rx="2" fill="none" stroke="#000" strokeWidth="1.5" />
          <rect x="33" y="22" width="8" height="6" rx="2" fill="none" stroke="#000" strokeWidth="1.5" />
          <path d="M31 25 L33 25" stroke="#000" strokeWidth="1.5" />
        </g>
      )}

      {accessory === "acc_mask" && (
        <g transform="translate(0, 0)">
          {/* Ninja Mask */}
          <path d="M20 28 L44 28 L44 38 C44 41.31 41.31 44 38 44 L26 44 C22.69 44 20 41.31 20 38 Z" fill="#1E293B" />
        </g>
      )}

      {/* --- Hats --- */}
      {hat === "hat_crown" && (
        <g transform="translate(0, -6)">
          <path d="M20 14 L24 4 L32 10 L40 4 L44 14 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1" strokeLinejoin="round" />
          <circle cx="24" cy="4" r="1.5" fill="#EF4444" />
          <circle cx="32" cy="10" r="1.5" fill="#3B82F6" />
          <circle cx="40" cy="4" r="1.5" fill="#10B981" />
        </g>
      )}

      {hat === "hat_cap" && (
        <g transform="translate(0, -4)">
          <path d="M24 14 C24 8 40 8 40 14" fill="#EF4444" />
          <path d="M40 14 L46 14" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
          <circle cx="32" cy="9" r="1.5" fill="#FCA5A5" />
        </g>
      )}

      {hat === "hat_wizard" && (
        <g transform="translate(0, -6)">
          <path d="M18 16 L46 16 L44 14 L32 0 L20 14 Z" fill="#6366F1" stroke="#4338CA" strokeWidth="1" strokeLinejoin="round" />
          <circle cx="32" cy="8" r="2" fill="#FBBF24" />
        </g>
      )}
    </svg>
  );
}
