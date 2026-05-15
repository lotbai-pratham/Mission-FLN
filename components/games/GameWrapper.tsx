"use client";
import React, { useState } from "react";
import GameIntro from "./GameIntro";

interface GameWrapperProps {
  children: React.ReactNode;
  title: string;
  emoji: string;
  instructions: string[];
  accentColor?: "emerald" | "orange" | "blue" | "rose" | "violet" | "amber";
}

export default function GameWrapper({ 
  children, 
  title, 
  emoji, 
  instructions, 
  accentColor = "blue" 
}: GameWrapperProps) {
  const [hasStarted, setHasStarted] = useState(false);

  if (!hasStarted) {
    return (
      <div className="w-full h-full min-h-[600px] relative bg-slate-50 rounded-[40px] overflow-auto border-8 border-white shadow-2xl flex items-center justify-center">
        <GameIntro
          title={title}
          emoji={emoji}
          instructions={instructions}
          accentColor={accentColor}
          onStart={() => setHasStarted(true)}
        />
      </div>
    );
  }

  return <>{children}</>;
}
