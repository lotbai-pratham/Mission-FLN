"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Trophy, RefreshCw, ArrowLeft, Zap, Star, Activity, ShieldAlert, Sparkles } from "lucide-react";
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

const HEALTHY = ["🍎", "🥦", "🍌", "🥕", "🥚", "🥗", "🥛", "🌽", "🍍", "🥑", "🍓", "🍊"];
const UNHEALTHY = ["🍩", "🍟", "🍭", "🍕", "🍔", "🍦", "🥤", "🍫", "🍪"];

export default function HealthyPlate({ onClose }: { onClose?: () => void }) {
  const [gameState, setGameState] = useState<"intro" | "playing" | "complete" | "gameover">("intro");
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(50); // 0-100
  const [plateX, setPlateX] = useState(50); // 0-100% for rendering
  const [foods, setFoods] = useState<Food[]>([]);
  const [sessionXP, setSessionXP] = useState(0);
  const { addXP } = usePoints();
  
  const gameRef = useRef<HTMLDivElement>(null);
  const plateXRef = useRef(50); // For the game loop to read the latest value without re-running
  const scoreRef = useRef(0);
  const healthRef = useRef(50);

  const spawnFood = useCallback(() => {
    const isHealthy = Math.random() > 0.4;
    const newFood: Food = {
      id: Math.random(),
      x: 10 + Math.random() * 80,
      y: -5,
      emoji: isHealthy ? HEALTHY[Math.floor(Math.random() * HEALTHY.length)] : UNHEALTHY[Math.floor(Math.random() * UNHEALTHY.length)],
      isHealthy,
      speed: 4 + Math.random() * 3
    };
    setFoods(prev => [...prev, newFood]);
  }, []);

  // Update refs when state changes (so the game loop can read them)
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { healthRef.current = health; }, [health]);

  useEffect(() => {
    if (gameState === "playing") {
      console.log("Game started, intervals initializing...");
      
      const spawner = setInterval(() => {
        spawnFood();
      }, 800);

      const gameLoop = setInterval(() => {
        setFoods(prev => {
          const next = prev.map(f => ({ ...f, y: f.y + (f.speed / 15) })); // Smooth falling
          
          // Collision detection
          const caught = next.filter(f => f.y > 80 && f.y < 88 && Math.abs(f.x - plateXRef.current) < 12);
          
          if (caught.length > 0) {
            caught.forEach(f => {
              if (f.isHealthy) {
                setScore(s => s + 10);
                setHealth(h => Math.min(100, h + 5));
                addXP(1);
                setSessionXP(p => p + 1);
              } else {
                setScore(s => Math.max(0, s - 5));
                setHealth(h => {
                  const newHealth = h - 12;
                  if (newHealth <= 0) {
                    setGameState("gameover");
                    return 0;
                  }
                  return newHealth;
                });
              }
            });
            return next.filter(f => f.y < 110 && !caught.includes(f));
          }

          // Check win condition
          if (scoreRef.current >= 300) {
             setGameState("complete");
          }

          return next.filter(f => f.y < 110);
        });
      }, 20);

      return () => {
        clearInterval(spawner);
        clearInterval(gameLoop);
      };
    }
  }, [gameState, spawnFood, addXP]); // plateX removed from dependencies!

  const handleMouseMove = (e: React.MouseEvent) => {
    if (gameRef.current) {
      const rect = gameRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const clampedX = Math.min(85, Math.max(15, x));
      setPlateX(clampedX);
      plateXRef.current = clampedX;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (gameRef.current) {
      const rect = gameRef.current.getBoundingClientRect();
      const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
      const clampedX = Math.min(85, Math.max(15, x));
      setPlateX(clampedX);
      plateXRef.current = clampedX;
    }
  };

  const start = () => {
    setScore(0);
    setHealth(50);
    setFoods([]);
    setSessionXP(0);
    plateXRef.current = 50;
    setGameState("playing");
  };

  const getCharacter = (side: 'left' | 'right') => {
    if (health >= 80) return side === 'left' ? "💪🏃" : "🏃‍♀️🔥";
    if (health >= 40) return side === 'left' ? "😊👦" : "👧✨";
    if (health >= 20) return side === 'left' ? "🤢🤒" : "🤒💊";
    return "🚑💨";
  };

  return (
    <div 
      ref={gameRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className="relative w-full md:min-h-[648px] min-h-[500px] bg-gradient-to-br from-emerald-50 via-white to-sky-50 rounded-[40px] overflow-hidden border-4 md:border-8 border-white shadow-2xl flex flex-col font-sans md:cursor-none"
    >
      {/* HUD Header */}
      <div className="relative z-[100] p-4 md:p-6 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-emerald-100">
        <div className="flex gap-4">
          <div className="bg-white px-4 md:px-6 py-2 rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-3">
            <Trophy className="text-emerald-500 w-5 h-5" />
            <span className="font-black text-emerald-900 text-xl">{score}</span>
          </div>
          <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-2xl font-bold flex items-center gap-2 text-xs md:text-sm">
            <Sparkles size={16} /> +{sessionXP} XP
          </div>
        </div>

        {/* Health Meter in Header */}
        <div className="flex-1 max-w-xs md:max-w-md mx-4 md:mx-8">
           <div className="flex justify-between mb-1">
             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Health</span>
             <span className={cn("text-xs font-black", health > 70 ? "text-emerald-500" : health > 30 ? "text-amber-500" : "text-rose-500")}>
               {health}%
             </span>
           </div>
           <div className="h-3 md:h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
             <div 
               className={cn(
                 "h-full rounded-full transition-all duration-300",
                 health > 70 ? "bg-emerald-400" : health > 30 ? "bg-amber-400" : "bg-rose-500 animate-pulse"
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
        {/* SMALL PEOPLE ON SIDES */}
        <div className="absolute inset-x-0 bottom-12 flex justify-between px-6 md:px-16 pointer-events-none z-10">
           <div className="flex flex-col items-center gap-2">
              <div className="text-6xl md:text-8xl filter drop-shadow-xl">{getCharacter('left')}</div>
              <div className="px-3 py-1 bg-white/80 backdrop-blur rounded-full text-[10px] font-black border border-slate-100 shadow-sm uppercase tracking-widest">Sohan</div>
           </div>
           <div className="flex flex-col items-center gap-2">
              <div className="text-6xl md:text-8xl filter drop-shadow-xl">{getCharacter('right')}</div>
              <div className="px-3 py-1 bg-white/80 backdrop-blur rounded-full text-[10px] font-black border border-slate-100 shadow-sm uppercase tracking-widest">Rohan</div>
           </div>
        </div>

        {gameState === "intro" && (
          <div className="absolute inset-0 z-[200] flex flex-col items-center justify-center text-center p-8 bg-white/90 backdrop-blur-xl">
            <div className="flex gap-4 text-7xl md:text-8xl mb-8 animate-bounce">🍎 🥦 🍓</div>
            <h1 className="text-5xl md:text-6xl font-black text-emerald-950 tracking-tighter">आरोग्यदायी आव्हान!</h1>
            <p className="text-emerald-800 text-xl md:text-2xl font-medium max-w-xl leading-relaxed">
              सोहन आणि रोहन यांना सुदृढ बनवा! <br/>
              चांगले अन्न निवडा, जंक फूड टाळा.
            </p>
            <button 
              onClick={start}
              className="mt-8 px-12 py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-[30px] shadow-2xl hover:scale-105 transition-all text-2xl flex items-center gap-4 border-b-8 border-emerald-800"
            >
              खेळ सुरू करा <Zap fill="white" className="w-6 h-6" />
            </button>
          </div>
        )}

        {gameState === "playing" && (
          <>
            {/* Falling Foods */}
            {foods.map(food => (
              <div
                key={food.id}
                className={cn(
                  "absolute text-5xl md:text-6xl select-none",
                  food.isHealthy ? "filter drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]" : "filter drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                )}
                style={{ left: `${food.x}%`, top: `${food.y}%`, transform: `rotate(${food.y * 3}deg)` }}
              >
                {food.emoji}
              </div>
            ))}

            {/* Plate */}
            <div 
              className="absolute bottom-12 -translate-x-1/2 transition-all duration-75 flex flex-col items-center pointer-events-none z-30"
              style={{ left: `${plateX}%` }}
            >
               <div className={cn(
                 "md:w-40 md:h-6 w-28 h-4 rounded-full border-b-4 border-slate-300 shadow-xl transition-colors duration-300",
                 health > 70 ? "bg-emerald-100" : health > 30 ? "bg-white" : "bg-rose-100"
               )} />
               <div className="mt-2 px-4 py-0.5 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg">Plate</div>
            </div>
          </>
        )}

        {gameState === "gameover" && (
          <div className="absolute inset-0 z-[300] flex flex-col items-center justify-center text-center p-8 bg-rose-50/95 backdrop-blur-2xl">
            <ShieldAlert className="w-32 h-32 text-rose-500 mb-6 animate-shake" />
            <h2 className="text-5xl md:text-6xl font-black text-rose-950 tracking-tighter">प्रकृती बिघडली!</h2>
            <p className="text-rose-800 text-xl md:text-2xl font-bold">खूप जास्त जंक फूड खाल्ल्यामुळे मुले आजारी पडली आहेत.</p>
            <button 
              onClick={start}
              className="mt-8 px-10 py-4 bg-rose-600 text-white font-black rounded-3xl shadow-xl hover:scale-105 transition-all flex items-center gap-3 border-b-8 border-rose-800"
            >
              <RefreshCw size={24} /> पुन्हा प्रयत्न करा
            </button>
          </div>
        )}

        {gameState === "complete" && (
          <div className="absolute inset-0 z-[300] flex flex-col items-center justify-center text-center p-8 bg-emerald-50/95 backdrop-blur-2xl animate-in zoom-in duration-500">
            <Trophy className="w-32 h-32 text-yellow-500 fill-yellow-500 mb-6 drop-shadow-2xl animate-bounce" />
            <h2 className="text-6xl font-black text-emerald-950 tracking-tighter">उत्तम पोषण!</h2>
            <div className="bg-white p-6 rounded-[30px] shadow-2xl border-4 border-emerald-100 space-y-2 min-w-[280px]">
              <p className="text-emerald-700 text-2xl font-bold">Health: {health}%</p>
              <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-6 py-2 rounded-full font-black text-xl shadow-inner justify-center">
                 <Sparkles size={20} /> +{sessionXP} XP मिळाले
              </div>
            </div>
            <div className="mt-8 flex gap-4">
              <button 
                onClick={start}
                className="px-10 py-4 bg-emerald-600 text-white font-black rounded-3xl shadow-xl hover:scale-105 transition-all flex items-center gap-2 border-b-8 border-emerald-800"
              >
                <RefreshCw size={24} /> पुन्हा खेळा
              </button>
              {onClose && (
                <button 
                  onClick={onClose}
                  className="px-10 py-4 bg-slate-900 text-white font-black rounded-3xl shadow-xl hover:scale-105 transition-all border-b-8 border-slate-950"
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
