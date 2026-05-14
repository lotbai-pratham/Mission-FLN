"use client";
import React, { useState, useEffect } from "react";
import { Timer, Trophy, RefreshCw, ArrowLeft, Zap, CheckCircle2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoutineStep {
  id: string;
  emoji: string;
  text: string;
  order: number;
}

const STEPS: RoutineStep[] = [
  { id: "1", emoji: "🌅", text: "लवकर उठणे", order: 1 },
  { id: "2", emoji: "🪥", text: "दात घासणे", order: 2 },
  { id: "3", emoji: "🚿", text: "अंघोळ करणे", order: 3 },
  { id: "4", emoji: "👕", text: "स्वच्छ कपडे घालणे", order: 4 },
  { id: "5", emoji: "🥣", text: "नाश्ता करणे", order: 5 },
  { id: "6", emoji: "🎒", text: "शाळेत जाणे", order: 6 },
];

export default function DailyRoutine({ onClose }: { onClose?: () => void }) {
  const [gameState, setGameState] = useState<"playing" | "complete">("playing");
  const [currentSteps, setCurrentSteps] = useState<RoutineStep[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    if (gameState === "playing") {
      setCurrentSteps([...STEPS].sort(() => Math.random() - 0.5));
    }
  }, [gameState]);

  const moveStep = (from: number, to: number) => {
    const next = [...currentSteps];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setCurrentSteps(next);
  };

  const checkOrder = () => {
    const isRight = currentSteps.every((step, i) => step.order === i + 1);
    if (isRight) {
      setIsCorrect(true);
      setTimeout(() => setGameState("complete"), 1000);
    } else {
      // Small shake or red highlight
    }
  };

  return (
    <div className="relative w-full md:min-h-[648px] min-h-[450px] bg-gradient-to-br from-indigo-50 via-slate-50 to-emerald-50 rounded-[48px] overflow-visible border-4 md:border-8 border-white shadow-2xl flex flex-col font-sans transition-colors duration-1000">
      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between items-center">
        <div className="bg-white/80 backdrop-blur-md px-6 py-2 rounded-2xl shadow-sm border border-indigo-100 flex items-center gap-3">
          <Trophy className="text-indigo-500" />
          <span className="font-black text-indigo-900 uppercase tracking-widest text-xs">माझी दिनचर्या</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors text-slate-400">
            <ArrowLeft size={24} />
          </button>
        )}
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-8">

        {gameState === "playing" && (
          <div className="w-full max-w-2xl space-y-4">
            <div className="grid grid-cols-1 gap-2">
              {currentSteps.map((step, i) => (
                <div 
                  key={step.id}
                  className="flex items-center gap-2 md:gap-4 bg-white p-2 md:p-4 rounded-xl md:rounded-2xl shadow-md border-b-4 border-slate-100 group hover:border-indigo-200 transition-all"
                >
                  <div className="flex flex-col gap-1 items-center scale-90">
                    <button onClick={() => i > 0 && moveStep(i, i - 1)} className="text-slate-300 hover:text-indigo-500 disabled:opacity-0" disabled={i === 0}>▲</button>
                    <button onClick={() => i < currentSteps.length - 1 && moveStep(i, i + 1)} className="text-slate-300 hover:text-indigo-500 disabled:opacity-0" disabled={i === currentSteps.length - 1}>▼</button>
                  </div>
                  <div className="text-2xl md:text-4xl">{step.emoji}</div>
                  <div className="flex-1 font-bold text-slate-700 text-sm md:text-lg">{step.text}</div>
                  <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center font-black text-slate-300">
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={checkOrder}
              className={cn(
                "w-full py-5 rounded-[24px] font-black text-xl shadow-xl transition-all flex items-center justify-center gap-3",
                isCorrect ? "bg-emerald-500 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"
              )}
            >
              {isCorrect ? <CheckCircle2 /> : "क्रम तपासा"}
            </button>
          </div>
        )}

        {gameState === "complete" && (
          <div className="text-center space-y-6 animate-in zoom-in duration-500">
            <div className="text-8xl mb-6">🏆</div>
            <h2 className="text-5xl font-black text-indigo-950">अभिनंदन!</h2>
            <p className="text-indigo-700 text-2xl font-bold">तुम्ही सकाळची दिनचर्या योग्य लावली आहे.</p>
            <p className="text-slate-500 font-bold text-xl italic">एक आरोग्यदायी सुरुवात, एक चांगला दिवस! ☀️</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => { setGameState("playing"); setIsCorrect(false); }}
                className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center gap-2"
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
