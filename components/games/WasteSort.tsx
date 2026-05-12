"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Timer, Trophy, RefreshCw, ArrowLeft, Zap, Trash2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrashItem {
  id: number;
  emoji: string;
  name: string;
  type: "wet" | "dry";
}

const TRASH_ITEMS: TrashItem[] = [
  { id: 1, emoji: "🍌", name: "केळीचे साल", type: "wet" },
  { id: 2, emoji: "📄", name: "कागद", type: "dry" },
  { id: 3, emoji: "🍼", name: "प्लास्टिक बाटली", type: "dry" },
  { id: 4, emoji: "🍎", name: "सफरचंदाचे तुकडे", type: "wet" },
  { id: 5, emoji: "📦", name: "पुठ्ठा", type: "dry" },
  { id: 6, emoji: "🥬", name: "भाजीपाला", type: "wet" },
  { id: 7, emoji: "🥫", name: "कॅन", type: "dry" },
  { id: 8, emoji: "🍉", name: "कलिंगडाचे साल", type: "wet" },
];

export default function WasteSort({ onClose }: { onClose?: () => void }) {
  const [gameState, setGameState] = useState<"intro" | "playing" | "complete">("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const handleSort = (type: "wet" | "dry") => {
    const item = TRASH_ITEMS[currentIndex];
    if (item.type === type) {
      setScore(s => s + 10);
      setFeedback("correct");
    } else {
      setFeedback("wrong");
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentIndex < TRASH_ITEMS.length - 1) {
        setCurrentIndex(c => c + 1);
      } else {
        setGameState("complete");
      }
    }, 1000);
  };

  const start = () => {
    setScore(0);
    setCurrentIndex(0);
    setGameState("playing");
  };

  return (
    <div className="relative w-full md:aspect-video md:min-h-[400px] min-h-[450px] bg-gradient-to-br from-orange-50 to-amber-50 rounded-[40px] overflow-hidden border-4 md:border-8 border-white shadow-2xl flex flex-col font-sans">
      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between items-center">
        <div className="bg-white/80 backdrop-blur-md px-6 py-2 rounded-2xl shadow-sm border border-orange-100 flex items-center gap-3">
          <Trophy className="text-orange-500" />
          <span className="font-black text-orange-900 text-xl">{score}</span>
        </div>
        <div className="flex gap-2">
          <Trash2 className="text-orange-400" />
          <span className="font-black text-slate-400 uppercase tracking-widest text-xs">कचरा व्यवस्थापन</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors text-slate-400">
            <ArrowLeft size={24} />
          </button>
        )}
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-8">
        {gameState === "intro" && (
          <div className="text-center space-y-6 max-w-xl animate-in fade-in zoom-in-95 duration-500">
            <div className="text-8xl mb-6">♻️</div>
            <h1 className="text-5xl font-black text-orange-950">कचरा व्यवस्थापन</h1>
            <p className="text-orange-700 text-xl font-medium">ओला आणि सुका कचरा योग्य कचरापेटीत टाका.</p>
            <button 
              onClick={start}
              className="px-12 py-5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-3xl shadow-xl shadow-orange-500/20 hover:scale-105 transition-all text-2xl flex items-center gap-3 mx-auto"
            >
              सुरुवात करा <Zap fill="white" />
            </button>
          </div>
        )}

        {gameState === "playing" && (
          <div className="w-full flex flex-col items-center gap-12">
            {/* Current Item Card */}
            <div className={cn(
              "relative bg-white p-4 md:p-8 rounded-[30px] md:rounded-[40px] shadow-2xl border-4 transition-all duration-300 w-40 h-40 md:w-64 md:h-64 flex flex-col items-center justify-center gap-2 md:gap-4",
              feedback === "correct" ? "border-emerald-400 scale-110" : 
              feedback === "wrong" ? "border-rose-400 animate-shake" : "border-slate-50"
            )}>
              <div className="text-6xl md:text-[100px] leading-none">{TRASH_ITEMS[currentIndex].emoji}</div>
              <p className="font-black text-slate-600 uppercase tracking-widest text-[10px] md:text-sm">{TRASH_ITEMS[currentIndex].name}</p>
              
              {feedback && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-[36px]">
                  <span className="text-6xl">{feedback === "correct" ? "🎯" : "❌"}</span>
                </div>
              )}
            </div>

            {/* Bins */}
            <div className="flex gap-4 md:gap-12 w-full max-w-3xl justify-center">
               <button 
                onClick={() => !feedback && handleSort("wet")}
                className="group relative flex-1 max-w-[150px] md:max-w-[200px] h-32 md:h-48 bg-emerald-500 hover:bg-emerald-400 rounded-3xl p-4 md:p-6 transition-all shadow-xl hover:-translate-y-2 border-b-8 border-emerald-700 flex flex-col items-center justify-center gap-2 md:gap-4"
               >
                 <div className="text-4xl md:text-6xl group-hover:scale-110 transition-all">🥬</div>
                 <p className="font-black text-white text-sm md:text-xl uppercase tracking-tighter">ओला कचरा</p>
                 <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3 w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center text-sm md:text-xl shadow-lg">🟢</div>
               </button>

               <button 
                onClick={() => !feedback && handleSort("dry")}
                className="group relative flex-1 max-w-[150px] md:max-w-[200px] h-32 md:h-48 bg-blue-500 hover:bg-blue-400 rounded-3xl p-4 md:p-6 transition-all shadow-xl hover:-translate-y-2 border-b-8 border-blue-700 flex flex-col items-center justify-center gap-2 md:gap-4"
               >
                 <div className="text-4xl md:text-6xl group-hover:scale-110 transition-all">📄</div>
                 <p className="font-black text-white text-sm md:text-xl uppercase tracking-tighter">सुका कचरा</p>
                 <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3 w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center text-sm md:text-xl shadow-lg">🔵</div>
               </button>
            </div>
          </div>
        )}

        {gameState === "complete" && (
          <div className="text-center space-y-6 animate-in zoom-in duration-500">
            <CheckCircle2 className="w-24 h-24 text-emerald-500 mx-auto" />
            <h2 className="text-5xl font-black text-orange-950">मस्तच!</h2>
            <p className="text-orange-700 text-2xl font-bold">तुमचा स्कोअर: {score}</p>
            <p className="text-slate-500 font-bold text-xl italic">कचरा वेगळा करा, पृथ्वीला मदत करा! 🌍</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={start}
                className="px-10 py-4 bg-orange-600 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center gap-2"
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
