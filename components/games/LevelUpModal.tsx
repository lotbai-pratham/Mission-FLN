"use client";

import React, { useEffect, useState } from "react";
import { getBadgeForLevel } from "@/lib/points-store";
import { Sparkles, Trophy, Share2, Check, X } from "lucide-react";
import { sfx } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface LevelUpModalProps {
  isOpen: boolean;
  level: number;
  onClose: () => void;
}

export default function LevelUpModal({ isOpen, level, onClose }: LevelUpModalProps) {
  const [copied, setCopied] = useState(false);
  const badge = getBadgeForLevel(level);

  useEffect(() => {
    if (isOpen) {
      // Play a satisfying succession of success sounds
      sfx.playSuccess();
      const t1 = setTimeout(() => sfx.playSuccess(), 150);
      const t2 = setTimeout(() => sfx.playSuccess(), 300);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const shareText = `🏆 Level Up! I just reached Level ${level} on FLN Hub Arcade and unlocked the "${badge.name}" (${badge.emoji}) Badge! 🚀\n\nJoin the learning adventure and test your skills here! #FLNHub #Education #Gamification`;

  const handleCopyShare = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* Modal Card container */}
      <div className="relative max-w-lg w-full bg-slate-900 border border-slate-800 rounded-[40px] p-8 text-center shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-500">
        
        {/* Animated Background Glow */}
        <div className={cn("absolute -top-32 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[120px] opacity-40 animate-pulse bg-gradient-to-r", badge.color)} />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Celebration */}
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-black uppercase tracking-widest animate-bounce">
            <Sparkles className="w-3.5 h-3.5 fill-yellow-400" /> Milestone Unlocked!
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">नवीन पातळी गाठली! 🚀</h2>
          <p className="text-slate-400 text-sm font-semibold">You have officially leveled up!</p>
        </div>

        {/* Big Badge Badge Showcase */}
        <div className="my-8 relative z-10 flex flex-col items-center">
          <div className={cn(
            "w-32 h-32 rounded-full bg-gradient-to-tr flex items-center justify-center text-6xl shadow-2xl relative animate-pulse", 
            badge.color
          )}>
            {badge.emoji}
            {/* Tiny stars around badge */}
            <div className="absolute -top-2 -left-2 text-2xl animate-ping">✨</div>
            <div className="absolute -bottom-2 -right-2 text-2xl animate-ping delay-500">✨</div>
          </div>

          <div className="mt-6 space-y-2">
            <p className="text-xs font-black uppercase text-slate-500 tracking-[0.25em]">Your New Badge</p>
            <h3 className={cn(
              "text-3xl font-black bg-gradient-to-r bg-clip-text text-transparent leading-none py-1",
              badge.color
            )}>
              {badge.name}
            </h3>
            <p className="text-sm font-black text-blue-400 uppercase tracking-widest">Level {level}</p>
          </div>

          {/* Description Box */}
          <div className="mt-4 max-w-sm px-6 py-4 rounded-2xl bg-slate-800/50 border border-slate-800/80">
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-semibold">
              "{badge.description}"
            </p>
          </div>
        </div>

        {/* LinkedIn-style Share Mockup */}
        <div className="relative z-10 bg-slate-950/60 rounded-3xl p-5 border border-slate-800 text-left space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white font-black text-xs">in</div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">LinkedIn Share Mockup</span>
            </div>
            <button 
              onClick={handleCopyShare}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all",
                copied ? "bg-green-500 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
              )}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" /> Copy Link Post
                </>
              )}
            </button>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-300 text-[11px] font-medium font-mono whitespace-pre-wrap select-all">
            {shareText}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 relative z-10 flex gap-4 justify-center">
          <button 
            onClick={onClose}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-105 transition-all active:scale-95 text-base"
          >
            पुढे चला ➡️ (Continue)
          </button>
        </div>

      </div>
    </div>
  );
}
