"use client";
import React from "react";
import { Zap, ChevronRight, Info, Target, MousePointer2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameIntroProps {
  title: string;
  emoji: string;
  instructions: string[];
  onStart: () => void;
  accentColor?: "emerald" | "orange" | "blue" | "rose" | "violet" | "amber";
}

const COLORS = {
  emerald: "from-emerald-500 to-teal-600 text-emerald-950 bg-emerald-50 ring-emerald-500",
  orange: "from-orange-500 to-red-600 text-orange-950 bg-orange-50 ring-orange-500",
  blue: "from-blue-500 to-indigo-600 text-blue-950 bg-blue-50 ring-blue-500",
  rose: "from-rose-500 to-pink-600 text-rose-950 bg-rose-50 ring-rose-500",
  violet: "from-violet-500 to-purple-600 text-violet-950 bg-violet-50 ring-violet-500",
  amber: "from-amber-400 to-orange-500 text-amber-950 bg-amber-50 ring-amber-400",
};

const BUTTON_COLORS = {
  emerald: "bg-emerald-600 hover:bg-emerald-500 border-emerald-800 shadow-emerald-500/30",
  orange: "bg-orange-600 hover:bg-orange-500 border-orange-800 shadow-orange-500/30",
  blue: "bg-blue-600 hover:bg-blue-500 border-blue-800 shadow-blue-500/30",
  rose: "bg-rose-600 hover:bg-rose-500 border-rose-800 shadow-rose-500/30",
  violet: "bg-violet-600 hover:bg-violet-500 border-violet-800 shadow-violet-500/30",
  amber: "bg-amber-500 hover:bg-amber-400 border-amber-700 shadow-amber-500/30",
};

export default function GameIntro({ title, emoji, instructions, onStart, accentColor = "blue" }: GameIntroProps) {
  return (
    <div className="absolute inset-0 z-[500] flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={cn("absolute -top-20 -left-20 w-64 h-64 rounded-full blur-[100px] opacity-20 animate-pulse", COLORS[accentColor].split(' ')[0])} />
        <div className={cn("absolute -bottom-20 -right-20 w-64 h-64 rounded-full blur-[100px] opacity-20 animate-pulse delay-700", COLORS[accentColor].split(' ')[1])} />
      </div>

      <div className="relative bg-white/90 backdrop-blur-2xl p-8 md:p-12 rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border-4 border-white max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Emoji Icon */}
        <div className="flex justify-center">
           <div className={cn("w-32 h-32 md:w-40 md:h-40 rounded-[40px] flex items-center justify-center text-7xl md:text-8xl shadow-inner animate-bounce-slow", COLORS[accentColor])}>
             {emoji}
           </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900">{title}</h1>
          <div className={cn("h-1.5 w-24 mx-auto rounded-full bg-gradient-to-r", COLORS[accentColor])} />
        </div>

        {/* Instructions */}
        <div className="grid grid-cols-1 gap-3 text-left">
          {instructions.map((text, i) => (
            <div 
              key={i} 
              className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all hover:translate-x-2 group"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:rotate-12", COLORS[accentColor])}>
                 {i === 0 && <Target size={18} />}
                 {i === 1 && <MousePointer2 size={18} />}
                 {i === 2 && <Info size={18} />}
                 {i === 3 && <ChevronRight size={18} />}
                 {i >= 4 && <Zap size={18} />}
              </div>
              <p className="text-slate-700 font-bold text-sm md:text-base leading-tight">
                {text}
              </p>
            </div>
          ))}
        </div>

        {/* Start Button */}
        <button 
          onClick={onStart}
          className={cn(
            "w-full py-6 text-white font-black rounded-[30px] shadow-2xl transition-all text-2xl flex items-center justify-center gap-4 border-b-8 active:border-b-0 active:translate-y-2",
            BUTTON_COLORS[accentColor]
          )}
        >
          START GAME <Zap fill="white" className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
