"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Trophy, RefreshCw, ArrowLeft, Zap, Star, Heart, Activity, Thermometer, ShieldAlert, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePoints } from "@/lib/points-store";

interface Food {
  id: number;
  x: number;
  y: number;
  emoji: string;
  isHealthy: boolean;
  speed: number;
}

const HEALTHY = ["🍎", "🥦", "🍌", "🥕", "🥚", "🥗", "🥛", "🌽", "🍍", "🥑"];
const UNHEALTHY = ["🍩", " Fries", "🍭", "🍕", "🍔", "🍦", "🥤", "🍩"];

export default function HealthyPlate({ onClose }: { onClose?: () => void }) {
  const [gameState, setGameState] = useState<"intro" | "playing" | "complete" | "gameover">("intro");
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(50); // 0-100
  const [plateX, setPlateX] = useState(50); // 0-100%
  const [foods, setFoods] = useState<Food[]>([]);
  const [sessionXP, setSessionXP] = useState(0);
  const { addXP } = usePoints();
  const gameRef = useRef<HTMLDivElement>(null);

  const spawnFood = useCallback(() => {
    const isHealthy = Math.random() > 0.45;
    const newFood: Food = {
      id: Date.now(),
      x: Math.random() * 80 + 10,
      y: -10,
      emoji: isHealthy ? HEALTHY[Math.floor(Math.random() * HEALTHY.length)] : UNHEALTHY[Math.floor(Math.random() * UNHEALTHY.length)],
      isHealthy,
      speed: Math.random() * 1.5 + 2.5
    };
    setFoods(prev => [...prev, newFood]);
  }, []);

  useEffect(() => {
    if (gameState === "playing") {
      const spawner = setInterval(spawnFood, 1200);
      const gameLoop = setInterval(() => {
        setFoods(prev => {
          const next = prev.map(f => ({ ...f, y: f.y + f.speed })).filter(f => f.y < 110);
          
          // Collision detection
          const caught = next.filter(f => f.y > 75 && f.y < 90 && Math.abs(f.x - plateX) < 12);
          if (caught.length > 0) {
            caught.forEach(f => {
              if (f.isHealthy) {
                setScore(s => s + 10);
                setHealth(h => Math.min(100, h + 8));
                addXP(2);
                setSessionXP(p => p + 2);
              } else {
                setScore(s => Math.max(0, s - 5));
                setHealth(h => {
                  const newHealth = h - 15;
                  if (newHealth <= 0) {
                    setGameState("gameover");
                    return 0;
                  }
                  return newHealth;
                });
              }
            });
            return next.filter(f => !caught.includes(f));
          }
          return next;
        });
      }, 30);

      return () => {
        clearInterval(spawner);
        clearInterval(gameLoop);
      };
    }
  }, [gameState, plateX, spawnFood, addXP]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (gameRef.current) {
      const rect = gameRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      setPlateX(Math.min(85, Math.max(15, x)));
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (gameRef.current) {
      const rect = gameRef.current.getBoundingClientRect();
      const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
      setPlateX(Math.min(85, Math.max(15, x)));
    }
  };

  const start = () => {
    setScore(0);
    setHealth(50);
    setFoods([]);
    setSessionXP(0);
    setGameState("playing");
  };

  const getCharacter = (side: 'left' | 'right') => {
    if (health >= 80) return side === 'left' ? "💪🏃‍♂️" : "🏃‍♀️🔥";
    if (health >= 40) return side === 'left' ? "😊👦" : "👧✨";
    if (health >= 20) return side === 'left' ? "🤢🛌" : "🛌💊";
    return "💀🚑";
  };

  return (
    <div 
      ref={gameRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className="relative w-full md:min-h-[648px] min-h-[500px] bg-gradient-to-br from-emerald-50 via-white to-sky-50 rounded-[40px] overflow-hidden border-4 md:border-8 border-white shadow-2xl flex flex-col font-sans md:cursor-none"
    >
      {/* HUD Header */}
      <div className="relative z-50 p-4 md:p-6 flex justify-between items-center bg-white/60 backdrop-blur-md border-b border-emerald-100">
        <div className="flex gap-4">
          <div className="bg-white/90 px-6 py-2 rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-3">
            <Trophy className="text-emerald-500 w-5 h-5" />
            <span className="font-black text-emerald-900 text-xl">{score}</span>
          </div>
          <div className="hidden md:flex bg-yellow-100 text-yellow-700 px-4 py-2 rounded-2xl font-bold items-center gap-2">
            <Sparkles size={16} /> +{sessionXP} XP
          </div>
        </div>

        {/* Health Meter in Header */}
        <div className="flex-1 max-w-md mx-8">
           <div className="flex justify-between mb-1">
             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Health Level</span>
             <span className={cn("text-xs font-black", health > 70 ? "text-emerald-500" : health > 30 ? "text-amber-500" : "text-rose-500")}>
               {health}%
             </span>
           </div>
           <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5 shadow-inner">
             <div 
               className={cn(
                 "h-full rounded-full transition-all duration-500 shadow-sm",
                 health > 70 ? "bg-gradient-to-r from-emerald-400 to-green-500" : 
                 health > 30 ? "bg-gradient-to-r from-amber-400 to-orange-500" : 
                 "bg-gradient-to-r from-rose-500 to-red-600 animate-pulse"
               )}
               style={{ width: `${health}%` }}
             />
           </div>
        </div>

        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors text-slate-400 cursor-pointer">
            <ArrowLeft size={24} />
          </button>
        )}
      </div>

      <div className="flex-1 relative overflow-hidden">
        {/* Background Visuals */}
        <div className="absolute inset-0 flex justify-between px-4 md:px-12 items-end pb-20 pointer-events-none opacity-40">
           <div className="text-[150px] md:text-[250px] filter drop-shadow-2xl transition-all duration-1000 grayscale-[0.2]">
             {getCharacter('left')}
           </div>
           <div className="text-[150px] md:text-[250px] filter drop-shadow-2xl transition-all duration-1000 grayscale-[0.2]">
             {getCharacter('right')}
           </div>
        </div>

        {gameState === "intro" && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center text-center p-8 bg-white/80 backdrop-blur-xl">
            <div className="flex gap-4 text-8xl mb-8 animate-bounce">🍎 🍕 🥦</div>
            <h1 className="text-6xl font-black text-emerald-950 tracking-tighter">आरोग्यदायी आव्हान!</h1>
            <p className="text-emerald-800 text-2xl font-medium max-w-xl leading-relaxed">
              तुमचे मित्र सोहन आणि रोहन यांना सुदृढ बनवा! <br/>
              पौष्टिक अन्न खाल्ल्यास ते मजबूत होतील, पण जंक फूडने ते आजारी पडतील.
            </p>
            <button 
              onClick={start}
              className="mt-8 px-16 py-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-[30px] shadow-2xl shadow-emerald-500/30 hover:scale-105 transition-all text-3xl flex items-center gap-4 border-b-8 border-emerald-800"
            >
              खेळ सुरू करा <Zap fill="white" className="w-8 h-8" />
            </button>
          </div>
        )}

        {gameState === "playing" && (
          <>
            {/* Health Meter Label */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur px-6 py-2 rounded-full border border-emerald-100 shadow-xl flex items-center gap-2">
              <Activity className={cn("w-5 h-5", health > 30 ? "text-emerald-500" : "text-rose-500 animate-pulse")} />
              <p className="text-slate-800 font-black text-sm uppercase tracking-widest italic">
                {health > 70 ? "तुम्ही खूप सुदृढ आहात!" : health > 30 ? "चांगले चालू आहे!" : "सावध रहा! आजारी पडू शकता."}
              </p>
            </div>

            {/* Falling Foods */}
            {foods.map(food => (
              <div
                key={food.id}
                className={cn(
                  "absolute text-6xl md:text-7xl select-none transition-transform duration-200",
                  food.isHealthy ? "filter drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]" : "filter drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                )}
                style={{ left: `${food.x}%`, top: `${food.y}%`, transform: `rotate(${food.y * 2}deg)` }}
              >
                {food.emoji}
              </div>
            ))}

            {/* Plate */}
            <div 
              className="absolute bottom-10 -translate-x-1/2 transition-all duration-75 flex flex-col items-center pointer-events-none z-30"
              style={{ left: `${plateX}%` }}
            >
               <div className={cn(
                 "md:w-48 md:h-8 w-32 h-6 rounded-full border-b-8 border-slate-300 shadow-2xl transition-colors duration-300",
                 health > 70 ? "bg-emerald-100 border-emerald-300" : health > 30 ? "bg-slate-200" : "bg-rose-100 border-rose-300"
               )} />
               <div className="mt-2 px-6 py-1 bg-slate-900 text-white text-[12px] font-black rounded-full uppercase tracking-[4px] shadow-lg">Plate</div>
            </div>

            {/* Win Condition */}
            {score >= 500 && setGameState("complete")}
          </>
        )}

        {gameState === "gameover" && (
          <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center text-center p-8 bg-rose-50/95 backdrop-blur-2xl">
            <ShieldAlert className="w-40 h-40 text-rose-500 mb-6 animate-shake" />
            <h2 className="text-7xl font-black text-rose-950 tracking-tighter">तुमची प्रकृती बिघडली!</h2>
            <p className="text-rose-800 text-2xl font-bold max-w-lg">खूप जास्त जंक फूड खाल्ल्यामुळे सोहन आणि रोहन आजारी पडले आहेत.</p>
            <div className="mt-8 flex gap-4">
              <button 
                onClick={start}
                className="px-12 py-5 bg-rose-600 text-white font-black rounded-3xl shadow-xl hover:scale-105 transition-all flex items-center gap-3 border-b-8 border-rose-800"
              >
                <RefreshCw size={24} /> पुन्हा प्रयत्न करा
              </button>
            </div>
          </div>
        )}

        {gameState === "complete" && (
          <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center text-center p-8 bg-emerald-50/95 backdrop-blur-2xl animate-in zoom-in duration-500">
            <Trophy className="w-40 h-40 text-yellow-500 fill-yellow-500 mb-6 drop-shadow-2xl animate-bounce" />
            <h2 className="text-7xl font-black text-emerald-950 tracking-tighter">उत्तम पोषण!</h2>
            <div className="bg-white p-8 rounded-[40px] shadow-2xl border-4 border-emerald-100 space-y-4 min-w-[320px]">
              <p className="text-emerald-700 text-3xl font-bold">Health Level: {health}%</p>
              <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-8 py-3 rounded-full font-black text-2xl shadow-inner animate-pulse justify-center">
                 <Sparkles className="animate-pulse" /> +{sessionXP} XP मिळाले
              </div>
            </div>
            <p className="text-slate-500 font-bold text-xl mt-4">तुमच्या आरोग्यदायी सवयींमुळे सोहन आणि रोहन खूप आनंदी आहेत! 🏃‍♂️🌟</p>
            <div className="mt-8 flex gap-4">
              <button 
                onClick={start}
                className="px-12 py-5 bg-emerald-600 text-white font-black rounded-3xl shadow-xl hover:scale-105 transition-all flex items-center gap-3 border-b-8 border-emerald-800"
              >
                <RefreshCw size={24} /> पुन्हा खेळा
              </button>
              {onClose && (
                <button 
                  onClick={onClose}
                  className="px-12 py-5 bg-slate-900 text-white font-black rounded-3xl shadow-xl hover:scale-105 transition-all border-b-8 border-slate-950"
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
