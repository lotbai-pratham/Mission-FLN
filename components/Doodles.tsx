"use client";

import { cn } from "@/lib/utils";

// Floating Star Doodle
export function DoodleStar({ className, delay = "0s" }: { className?: string, delay?: string }) {
  return (
    <svg 
      className={cn("absolute opacity-40 animate-pulse pointer-events-none", className)} 
      style={{ animationDelay: delay, animationDuration: '4s' }}
      width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M50 5 L61 39 L95 39 L68 60 L78 95 L50 75 L22 95 L32 60 L5 39 L39 39 L50 5Z" 
            fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// Squiggle Doodle
export function DoodleSquiggle({ className, delay = "0s" }: { className?: string, delay?: string }) {
  return (
    <svg 
      className={cn("absolute opacity-30 animate-bounce pointer-events-none", className)} 
      style={{ animationDelay: delay, animationDuration: '6s' }}
      width="64" height="24" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5 20 Q 15 5, 25 20 T 45 20 T 65 20 T 85 20 T 105 20" 
            stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// Tribal Sun/Flower Doodle
export function DoodleSun({ className, delay = "0s" }: { className?: string, delay?: string }) {
  return (
    <svg 
      className={cn("absolute opacity-25 animate-spin pointer-events-none", className)} 
      style={{ animationDelay: delay, animationDuration: '20s' }}
      width="56" height="56" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="15" stroke="currentColor" strokeWidth="4" fill="none" />
      <path d="M50 15 L50 5 M85 50 L95 50 M50 85 L50 95 M15 50 L5 50 M75 25 L82 18 M75 75 L82 82 M25 75 L18 82 M25 25 L18 18" 
            stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

// Abstract Loop Doodle
export function DoodleLoop({ className, delay = "0s" }: { className?: string, delay?: string }) {
  return (
    <svg 
      className={cn("absolute opacity-30 pointer-events-none animate-pulse", className)} 
      style={{ animationDelay: delay, animationDuration: '5s' }}
      width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20 50 C20 10, 80 10, 80 50 C80 90, 20 90, 50 50 C80 10, 20 10, 20 50 Z" 
            stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// Cloud Doodle
export function DoodleCloud({ className, delay = "0s" }: { className?: string, delay?: string }) {
  return (
    <svg 
      className={cn("absolute opacity-30 animate-pulse pointer-events-none", className)} 
      style={{ animationDelay: delay, animationDuration: '6s' }}
      width="48" height="32" viewBox="0 0 40 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M10 18a6 6 0 0 1 0-12 8 8 0 0 1 15-2 6 6 0 0 1 5 10h-2" />
    </svg>
  );
}

// Tribal figure (Warli inspired)
export function DoodleTribalFigure({ className, delay = "0s" }: { className?: string, delay?: string }) {
  return (
    <svg 
      className={cn("absolute opacity-25 pointer-events-none", className)} 
      style={{ animationDelay: delay }}
      width="48" height="64" viewBox="0 0 60 100" fill="none" xmlns="http://www.w3.org/2000/svg"
    >
      {/* Head */}
      <circle cx="30" cy="15" r="8" fill="none" stroke="currentColor" strokeWidth="3" />
      {/* Body Triangles */}
      <path d="M30 25 L15 50 L45 50 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M30 75 L15 50 L45 50 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      {/* Arms */}
      <path d="M15 50 L5 30 M45 50 L55 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      {/* Legs */}
      <path d="M25 75 L15 95 M35 75 L45 95" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
