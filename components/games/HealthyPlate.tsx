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
  const [gameState, setGameState] = useState<"playing" | "complete" | "gameover">("playing");
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(50);
  const [plateX, setPlateX] = useState(50);
  const [foods, setFoods] = useState<Food[]>([]);
  const [sessionXP, setSessionXP] = useState(0);
  const { addXP } = usePoints();
  
  const gameRef = useRef<HTMLDivElement>(null);
  const plateXRef = useRef(50);
  const gameStateRef = useRef<string>("playing");
  const startRef = useRef(false);

  // Keep ref in sync
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const spawnFood = useCallback(() => {
    if (gameStateRef.current !== "playing") return;
    
    const isHealthy = Math.random() > 0.4;
    const newFood: Food = {
      id: Date.now() + Math.random(),
      x: 10 + Math.random() * 80,
      y: -10, // Start slightly higher
      emoji: isHealthy ? HEALTHY[Math.floor(Math.random() * HEALTHY.length)] : UNHEALTHY[Math.floor(Math.random() * UNHEALTHY.length)],
      isHealthy,
      speed: 3 + Math.random() * 4 // Randomized speed
    };
    
    setFoods(prev => [...prev, newFood]);
  }, []);

  // Main Game Loop
  useEffect(() => {
    if (gameState !== "playing") return;

    console.log("HEALTHY PLATE: Loop Started");

    const spawner = setInterval(spawnFood, 1000);
    
    const ticker = setInterval(() => {
      setFoods(prev => {
        if (prev.length === 0) return prev;
        
        const next: Food[] = [];
        let hitHealthy = 0;
        let hitJunk = 0;

        for (const f of prev) {
          const newY = f.y + (f.speed / 5); // Slightly faster falling
          
          // Collision detection
          if (newY > 78 && newY < 88 && Math.abs(f.x - plateXRef.current) < 15) {
            if (f.isHealthy) hitHealthy++;
            else hitJunk++;
            continue; // Item caught, don't add to next
          }

          if (newY < 110) {
            next.push({ ...f, y: newY });
          }
        }

        // Apply hits
        if (hitHealthy > 0) {
          setScore(s => s + (hitHealthy * 10));
          setHealth(h => Math.min(100, h + (hitHealthy * 5)));
          addXP(hitHealthy);
          setSessionXP(x => x + hitHealthy);
        }
        if (hitJunk > 0) {
          setScore(s => Math.max(0, s - (hitJunk * 5)));
          setHealth(h => {
            const nh = h - (hitJunk * 15);
            if (nh <= 0) setTimeout(() => setGameState("gameover"), 0);
            return nh < 0 ? 0 : nh;
          });
        }

        return next;
      });
    }, 30);

    return () => {
      clearInterval(spawner);
      clearInterval(ticker);
    };
  }, [gameState, spawnFood, addXP]);

  // Win condition check
  useEffect(() => {
    if (score >= 300 && gameState === "playing") {
      setGameState("complete");
    }
  }, [score, gameState]);

  const handleMove = (clientX: number) => {
    if (!gameRef.current) return;
    const rect = gameRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const clampedX = Math.min(85, Math.max(15, x));
    setPlateX(clampedX);
    plateXRef.current = clampedX;
  };

  const start = useCallback(() => {
    setScore(0);
    setHealth(50);
    setFoods([]);
    setSessionXP(0);
    plateXRef.current = 50;
    setGameState("playing");
  }, []);

  useEffect(() => {
    if (!startRef.current) {
      start();
      startRef.current = true;
    }
  }, [start]);

  const getCharacter = (side: 'left' | 'right') => {
    if (health >= 80) return side === 'left' ? "💪🏃" : "🏃‍♀️🔥";
    if (health >= 40) return side === 'left' ? "😊👦" : "👧✨";
    if (health >= 20) return side === 'left' ? "🤢🤒" : "🤒💊";
    return "🚑💨";
  };

  return (
    <div 
      ref={gameRef}
      onMouseMove={(e) => handleMove(e.clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      className="relative w-full md:min-h-[648px] min-h-[550px] bg-gradient-to-br from-emerald-50 via-white to-sky-50 rounded-[40px] overflow-hidden border-4 md:border-8 border-white shadow-2xl flex flex-col font-sans md:cursor-none"
    >
      {/* HUD Header */}
      <div className="relative z-[100] p-4 md:p-6 flex justify-between items-center bg-white/90 backdrop-blur-md border-b border-emerald-100">
        <div className="flex gap-4">
          <div className="bg-white px-4 md:px-6 py-2 rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-2">
            <Trophy className="text-emerald-500 w-5 h-5" />
            <span className="font-black text-emerald-900 text-xl">{score}</span>
          </div>
          <div className="bg-yellow-100 text-yellow-700 px-3 py-2 rounded-2xl font-bold flex items-center gap-2 text-xs">
            <Sparkles size={14} /> +{sessionXP} XP
          </div>
        </div>

        <div className="flex-1 max-w-xs md:max-w-md mx-4 md:mx-8">
           <div className="h-3 md:h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
             <div 
               className={cn(
                 "h-full rounded-full transition-all duration-300",
                 health > 70 ? "bg-emerald-400" : health > 30 ? "bg-amber-400" : "bg-rose-500 animate-pulse"
               )}
               style={{ width: `${health}%` }}
             />
           </div>
           <div className="flex justify-between mt-1">
             <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Health Status</span>
             <span className="text-[10px] font-black text-slate-600">{health}%</span>
           </div>
        </div>

        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors text-slate-400">
            <ArrowLeft size={24} />
          </button>
        )}
      </div>

      <div className="flex-1 relative overflow-hidden">
        {/* Background Characters */}
        <div className="absolute inset-x-0 bottom-16 flex justify-between px-8 md:px-24 pointer-events-none z-10">
           <div className="flex flex-col items-center gap-2">
              <div className="text-7xl md:text-9xl filter drop-shadow-xl">{getCharacter('left')}</div>
              <div className="px-4 py-1 bg-white/90 rounded-full text-[10px] font-black border border-slate-100 shadow-sm uppercase">Sohan</div>
           </div>
           <div className="flex flex-col items-center gap-2">
              <div className="text-7xl md:text-9xl filter drop-shadow-xl">{getCharacter('right')}</div>
              <div className="px-4 py-1 bg-white/90 rounded-full text-[10px] font-black border border-slate-100 shadow-sm uppercase">Rohan</div>
           </div>
        </div>


        {gameState === "playing" && (
          <>
            {/* The actual falling items */}
            <div className="absolute inset-0 pointer-events-none">
              {foods.map(food => (
                <div
                  key={food.id}
                  className="absolute text-6xl md:text-7xl select-none"
                  style={{ 
                    left: `${food.x}%`, 
                    top: `${food.y}%`, 
                    transform: `translate(-50%, -50%) rotate(${food.y * 2}deg)` 
                  }}
                >
                  {food.emoji}
                </div>
              ))}
            </div>

            {/* Plate UI */}
            <div 
              className="absolute bottom-16 -translate-x-1/2 transition-all duration-75 flex flex-col items-center pointer-events-none z-30"
              style={{ left: `${plateX}%` }}
            >
               <div className={cn(
                 "md:w-48 md:h-8 w-32 h-6 rounded-full border-b-4 border-slate-300 shadow-2xl transition-colors duration-300",
                 health > 70 ? "bg-emerald-100" : health > 30 ? "bg-white" : "bg-rose-100"
               )} />
               <div className="mt-2 px-6 py-1 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase tracking-[4px] shadow-lg">Plate</div>
            </div>
          </>
        )}

        {(gameState === "gameover" || gameState === "complete") && (
          <div className={cn(
            "absolute inset-0 z-[300] flex flex-col items-center justify-center text-center p-8 backdrop-blur-md animate-in zoom-in duration-500",
            gameState === "gameover" ? "bg-rose-50/95" : "bg-emerald-50/95"
          )}>
            {gameState === "gameover" ? (
              <>
                <ShieldAlert className="w-40 h-40 text-rose-500 mb-6 animate-shake" />
                <h2 className="text-6xl font-black text-rose-950">OH NO!</h2>
                <p className="text-rose-800 text-2xl font-bold mt-4">Too much junk food! Try again.</p>
              </>
            ) : (
              <>
                <Trophy className="w-40 h-40 text-yellow-500 fill-yellow-500 mb-6 animate-bounce" />
                <h2 className="text-6xl font-black text-emerald-950">SUPER HEALTHY!</h2>
                <p className="text-emerald-800 text-2xl font-bold mt-4">Total Score: {score}</p>
                <div className="mt-4 bg-yellow-100 text-yellow-700 px-8 py-3 rounded-full font-black text-2xl">
                   +{sessionXP} XP Earned
                </div>
              </>
            )}
            
            <div className="mt-12 flex gap-4">
              <button 
                onClick={start}
                className={cn(
                  "px-12 py-5 text-white font-black rounded-3xl shadow-xl hover:scale-105 transition-all flex items-center gap-3 border-b-8",
                  gameState === "gameover" ? "bg-rose-600 border-rose-800" : "bg-emerald-600 border-emerald-800"
                )}
              >
                <RefreshCw size={24} /> PLAY AGAIN
              </button>
              {onClose && (
                <button 
                  onClick={onClose}
                  className="px-12 py-5 bg-slate-900 text-white font-black rounded-3xl shadow-xl hover:scale-105 transition-all border-b-8 border-slate-950"
                >
                  EXIT
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
