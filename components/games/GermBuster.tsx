"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Timer, Trophy, RefreshCw, ArrowLeft, Zap, Hand, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Germ {
  id: number;
  x: number;
  y: number;
  emoji: string;
  size: number;
}

export default function GermBuster({ onClose }: { onClose?: () => void }) {
  const [gameState, setGameState] = useState<"intro" | "playing" | "complete">("intro");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [germs, setGerms] = useState<Germ[]>([]);

  const spawnGerm = useCallback(() => {
    const newGerm: Germ = {
      id: Date.now(),
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      emoji: ["👾", "🦠", "🦠", "👾"][Math.floor(Math.random() * 4)],
      size: Math.random() * 2 + 3 // 3rem to 5rem
    };
    setGerms(prev => [...prev, newGerm]);
  }, []);

  useEffect(() => {
    if (gameState === "playing") {
      const interval = setInterval(() => {
        if (germs.length < 8) spawnGerm();
      }, 800);
      return () => clearInterval(interval);
    }
  }, [gameState, germs.length, spawnGerm]);

  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setGameState("complete");
    }
  }, [gameState, timeLeft]);

  const killGerm = (id: number) => {
    setGerms(prev => prev.filter(g => g.id !== id));
    setScore(s => s + 10);
  };

  const start = () => {
    setScore(0);
    setTimeLeft(30);
    setGerms([]);
    setGameState("playing");
  };

  return (
    <div className="relative w-full md:aspect-video md:min-h-[400px] min-h-[450px] bg-gradient-to-br from-blue-100 to-cyan-50 rounded-[40px] overflow-hidden border-4 md:border-8 border-white shadow-2xl flex flex-col font-sans">
      {/* Background Water Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #0ea5e9 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between items-center">
        <div className="flex gap-4">
          <div className="bg-white/80 backdrop-blur-md px-6 py-2 rounded-2xl shadow-sm border border-blue-100 flex items-center gap-3">
            <Timer className="text-blue-500" />
            <span className="font-black text-blue-900 text-xl">{timeLeft}s</span>
          </div>
          <div className="bg-white/80 backdrop-blur-md px-6 py-2 rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-3">
            <Trophy className="text-emerald-500" />
            <span className="font-black text-emerald-900 text-xl">{score}</span>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors text-slate-400">
            <ArrowLeft size={24} />
          </button>
        )}
      </div>

      {/* Game Stage */}
      <div className="flex-1 relative">
        {gameState === "intro" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-6 z-20">
            <div className="text-8xl animate-bounce">🧼</div>
            <h1 className="text-5xl font-black text-blue-950">स्वच्छता रक्षक</h1>
            <p className="text-blue-700 text-xl font-medium max-w-md">तुमचे हात स्वच्छ करा! साबणाचा वापर करून सर्व जंतूंचा नाश करा.</p>
            <button 
              onClick={start}
              className="px-12 py-5 bg-blue-500 hover:bg-blue-600 text-white font-black rounded-3xl shadow-xl shadow-blue-500/20 hover:scale-105 transition-all text-2xl flex items-center gap-3"
            >
              खेळ सुरू करा <Zap fill="white" />
            </button>
          </div>
        )}

        {gameState === "playing" && (
          <>
            {/* Hands Illustration */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 select-none">
               <div className="md:text-[25rem] text-[15rem] flex gap-10 md:gap-20">
                 <span className="rotate-[-20deg]">✋</span>
                 <span className="rotate-[20deg] scale-x-[-1]">✋</span>
               </div>
            </div>

            {/* Germs */}
            {germs.map(germ => (
              <button
                key={germ.id}
                onClick={() => killGerm(germ.id)}
                className="absolute animate-in zoom-in duration-300 hover:scale-110 transition-transform active:scale-90"
                style={{ left: `${germ.x}%`, top: `${germ.y}%`, fontSize: `${germ.size}rem` }}
              >
                {germ.emoji}
              </button>
            ))}

            {/* Instructions Overlay */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-blue-500/10 px-6 py-2 rounded-full border border-blue-200">
               <p className="text-blue-600 font-black uppercase tracking-widest text-xs">जंतूंवर क्लिक करा!</p>
            </div>
          </>
        )}

        {gameState === "complete" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-6 z-20 animate-in zoom-in duration-500">
            <Sparkles className="w-24 h-24 text-yellow-500 mb-4" />
            <h2 className="text-5xl font-black text-blue-950">छान काम केले!</h2>
            <p className="text-blue-700 text-2xl font-bold">तुमचा स्कोअर: {score}</p>
            <p className="text-emerald-600 font-black text-xl italic">तुमचे हात आता सुरक्षित आहेत! ✨</p>
            <div className="flex gap-4">
              <button 
                onClick={start}
                className="px-10 py-4 bg-blue-500 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center gap-2"
              >
                <RefreshCw size={20} /> पुन्हा खेळा
              </button>
              {onClose && (
                <button 
                  onClick={onClose}
                  className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all"
                >
                  बाहेर पडा
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
