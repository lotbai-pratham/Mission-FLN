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

// Authentic Warli Tribal Figure (Human)
export function DoodleTribalFigure({ className, delay = "0s" }: { className?: string, delay?: string }) {
  return (
    <svg 
      className={cn("absolute pointer-events-none", className)} 
      style={{ animationDelay: delay }}
      width="100" height="120" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg"
    >
      {/* Head */}
      <circle cx="50" cy="20" r="12" fill="currentColor" />
      {/* Upper Triangle (Torso) */}
      <path d="M25,40 L75,40 L50,65 Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      {/* Lower Triangle (Pelvis) */}
      <path d="M50,65 L25,90 L75,90 Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      {/* Arms (dancing/bent) */}
      <path d="M25,40 L10,55 L25,75 M75,40 L90,55 L75,75" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Legs (bent in motion) */}
      <path d="M35,90 L25,115 M65,90 L75,115" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// Authentic Warli Tree (Triangle stack)
export function DoodleWarliTree({ className, delay = "0s" }: { className?: string, delay?: string }) {
  return (
    <svg 
      className={cn("absolute pointer-events-none", className)} 
      style={{ animationDelay: delay }}
      width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"
    >
      {/* Trunk */}
      <path d="M50,95 L50,5" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      {/* Leaves as stacked triangles */}
      <path d="M50,5 L30,35 L70,35 Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M50,25 L15,60 L85,60 Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M50,50 L5,85 L95,85 Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

// Authentic Warli Animal (Horse/Deer)
export function DoodleWarliAnimal({ className, delay = "0s" }: { className?: string, delay?: string }) {
  return (
    <svg 
      className={cn("absolute pointer-events-none", className)} 
      style={{ animationDelay: delay }}
      width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body: Two horizontal triangles joined at the tips */}
      <path d="M15,40 L45,55 L15,70 Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M75,40 L45,55 L75,70 Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      {/* Legs */}
      <path d="M25,70 L25,95 M15,70 L5,95 M65,70 L65,95 M75,70 L85,95" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      {/* Neck and Head */}
      <path d="M75,40 L85,15" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <circle cx="85" cy="15" r="8" fill="currentColor" />
      {/* Horns/Ears */}
      <path d="M83,7 L75,-5 M87,7 L95,-5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      {/* Tail */}
      <path d="M15,40 Q5,30 2,50" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// Authentic Warli Hut
export function DoodleWarliHut({ className, delay = "0s" }: { className?: string, delay?: string }) {
  return (
    <svg 
      className={cn("absolute pointer-events-none", className)} 
      style={{ animationDelay: delay }}
      width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"
    >
      {/* Roof (Triangle) */}
      <path d="M50,10 L10,50 L90,50 Z" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
      {/* Roof thatch lines */}
      <path d="M40,20 L30,50 M60,20 L70,50 M50,10 L50,50 M30,30 L20,50 M70,30 L80,50" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      {/* Walls */}
      <path d="M20,50 L20,95 L80,95 L80,50" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
      {/* Door */}
      <path d="M40,95 L40,65 L60,65 L60,95" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
      {/* Inner wall patterns (dots) */}
      <circle cx="30" cy="70" r="3" fill="currentColor" />
      <circle cx="70" cy="70" r="3" fill="currentColor" />
      <circle cx="30" cy="85" r="3" fill="currentColor" />
      <circle cx="70" cy="85" r="3" fill="currentColor" />
    </svg>
  );
}

// Authentic Warli Sun (Mandala/Circle)
export function DoodleWarliSun({ className, delay = "0s" }: { className?: string, delay?: string }) {
  return (
    <svg 
      className={cn("absolute pointer-events-none animate-[spin_40s_linear_infinite]", className)} 
      style={{ animationDelay: delay }}
      width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"
    >
      {/* Inner solid circle */}
      <circle cx="50" cy="50" r="15" fill="currentColor" />
      {/* Outer rings */}
      <circle cx="50" cy="50" r="28" stroke="currentColor" strokeWidth="3" strokeDasharray="6 6" />
      <circle cx="50" cy="50" r="36" stroke="currentColor" strokeWidth="3" />
      {/* Sun rays */}
      <path d="M50,0 L50,10 M50,90 L50,100 M0,50 L10,50 M90,50 L100,50 M15,15 L25,25 M75,75 L85,85 M15,85 L25,75 M75,25 L85,15" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M30,5 L38,13 M70,5 L62,13 M30,95 L38,87 M70,95 L62,87 M5,30 L13,38 M5,70 L13,62 M95,30 L87,38 M95,70 L87,62" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
