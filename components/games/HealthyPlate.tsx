"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Trophy, RefreshCw, ArrowLeft, Zap, Star, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface Food {
  id: number;
  x: number;
  y: number;
  emoji: string;
  isHealthy: boolean;
  speed: number;
}

const HEALTHY = ["🍎", "🥦", "🍌", "🥕", "🥚", "🥗", "🥛", "🌽"];
const UNHEALTHY = ["🍩", "🍟", "🍭", "🍕", "🍔", "🍦"];

export default function HealthyPlate({ onClose }: { onClose?: () => void }) {
  const [gameState, setGameState] = useState<"intro" | "playing" | "complete">("intro");
  const [score, setScore] = useState(0);
  const [plateX, setPlateX] = useState(50); // 0-100%
  const [foods, setFoods] = useState<Food[]>([]);
  const gameRef = useRef<HTMLDivElement>(null);

  const spawnFood = useCallback(() => {
    const isHealthy = Math.random() > 0.4;
    const newFood: Food = {
      id: Date.now(),
      x: Math.random() * 90 + 5,
      y: -10,
      emoji: isHealthy ? HEALTHY[Math.floor(Math.random() * HEALTHY.length)] : UNHEALTHY[Math.floor(Math.random() * UNHEALTHY.length)],
      isHealthy,
      speed: Math.random() * 2 + 3
    };
    setFoods(prev => [...prev, newFood]);
  }, []);

  useEffect(() => {
    if (gameState === "playing") {
      const spawner = setInterval(spawnFood, 1000);
      const gameLoop = setInterval(() => {
        setFoods(prev => {
          const next = prev.map(f => ({ ...f, y: f.y + f.speed })).filter(f => f.y < 110);
          
          // Collision detection
          const caught = next.filter(f => f.y > 80 && f.y < 95 && Math.abs(f.x - plateX) < 15);
          if (caught.length > 0) {
            caught.forEach(f => {
              if (f.isHealthy) setScore(s => s + 10);
              else setScore(s => Math.max(0, s - 20));
            });
            return next.filter(f => !caught.includes(f));
          }
          return next;
        });
      }, 50);

      return () => {
        clearInterval(spawner);
        clearInterval(gameLoop);
      };
    }
  }, [gameState, plateX, spawnFood]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (gameRef.current) {
      const rect = gameRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      setPlateX(Math.min(90, Math.max(10, x)));
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (gameRef.current) {
      const rect = gameRef.current.getBoundingClientRect();
      const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
      setPlateX(Math.min(90, Math.max(10, x)));
    }
  };

  const start = () => {
    setScore(0);
    setFoods([]);
    setGameState("playing");
  };

  return (
    <div 
      ref={gameRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className="relative w-full aspect-video md:min-h-[400px] min-h-[280px] bg-gradient-to-br from-emerald-50 to-teal-50 rounded-[40px] overflow-hidden border-4 md:border-8 border-white shadow-2xl flex flex-col font-sans md:cursor-none"
    >
      {/* Background Decor */}
      <div className="absolute top-10 left-10 text-9xl opacity-5 pointer-events-none font-black italic">EAT CLEAN</div>

      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between items-center">
        <div className="bg-white/80 backdrop-blur-md px-6 py-2 rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-3">
          <Trophy className="text-emerald-500" />
          <span className="font-black text-emerald-900 text-xl">{score}</span>
        </div>
        <div className="flex gap-2">
          <Heart className="text-rose-500 fill-rose-500" />
          <span className="font-black text-slate-400">आरोग्यदायी थाळी</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors text-slate-400 cursor-pointer">
            <ArrowLeft size={24} />
          </button>
        )}
      </div>

      {/* Game Stage */}
      <div className="flex-1 relative overflow-hidden">
        {gameState === "intro" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-6 z-20 cursor-default">
            <div className="flex gap-4 text-6xl animate-bounce">🍎 🥦 🌽</div>
            <h1 className="text-5xl font-black text-emerald-950">आरोग्यदायी थाळी</h1>
            <p className="text-emerald-700 text-xl font-medium max-w-md">तुमच्या थाळीत फक्त आरोग्यदायी अन्न गोळा करा! जंक फूड टाळा.</p>
            <button 
              onClick={start}
              className="px-12 py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-3xl shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all text-2xl flex items-center gap-3"
            >
              सुरुवात करा <Zap fill="white" />
            </button>
          </div>
        )}

        {gameState === "playing" && (
          <>
            {/* Falling Foods */}
            {foods.map(food => (
              <div
                key={food.id}
                className="absolute text-5xl select-none"
                style={{ left: `${food.x}%`, top: `${food.y}%` }}
              >
                {food.emoji}
              </div>
            ))}

            {/* Plate */}
            <div 
              className="absolute bottom-4 -translate-x-1/2 transition-all duration-75 flex flex-col items-center pointer-events-none"
              style={{ left: `${plateX}%` }}
            >
               <div className="md:w-32 md:h-6 w-24 h-4 bg-slate-200 rounded-full border-b-4 border-slate-300 shadow-xl" />
               <div className="mt-1 px-3 py-0.5 bg-emerald-500 text-white text-[10px] font-black rounded-full uppercase tracking-tighter shadow-lg">Plate</div>
            </div>

            {/* End Game Trigger */}
            {score >= 200 && setGameState("complete")}
          </>
        )}

        {gameState === "complete" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-6 z-20 animate-in zoom-in duration-500 cursor-default">
            <Star className="w-24 h-24 text-yellow-500 fill-yellow-500 mb-4 animate-pulse" />
            <h2 className="text-5xl font-black text-emerald-950">उत्तम पोषण!</h2>
            <p className="text-emerald-700 text-2xl font-bold">तुमचा स्कोअर: {score}</p>
            <p className="text-slate-500 font-bold text-xl">तुम्ही एक पौष्टिक थाळी तयार केली आहे! 🍱</p>
            <div className="flex gap-4">
              <button 
                onClick={start}
                className="px-10 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center gap-2"
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
