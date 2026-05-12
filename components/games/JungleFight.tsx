"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Heart, Shield, Swords, Zap, RefreshCw, Trophy, ArrowLeft, Target, BookOpen, Calculator, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  type: "math" | "lang";
  text: string;
  options: string[];
  answer: string;
}

interface Creature {
  name: string;
  emoji: string;
  hp: number;
  maxHp: number;
}

const CREATURES = [
  { name: "Wild Tiger", emoji: "🐅" },
  { name: "Jungle Snake", emoji: "🐍" },
  { name: "Croc Guardian", emoji: "🐊" },
  { name: "Silverback Gorilla", emoji: "🦍" },
  { name: "Desert Scorpion", emoji: "🦂" },
  { name: "Shadow Jaguar", emoji: "🐆" },
];

export default function JungleFight({ onClose }: { onClose?: () => void }) {
  const [gameState, setGameState] = useState<"intro" | "fighting" | "question" | "victory" | "gameover">("intro");
  const [level, setLevel] = useState(1);
  const [kills, setKills] = useState(0);
  const [playerHealth, setPlayerHealth] = useState(3);
  const [creature, setCreature] = useState<Creature | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [animating, setAnimating] = useState<"player" | "creature" | "projectile" | "impact" | "defeat" | "creature-entry" | "creature-attack" | "impact-player" | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [projectileType, setProjectileType] = useState<"🥊" | "🦶">("🥊");

  const spawnCreature = useCallback((lvl: number) => {
    const c = CREATURES[Math.floor(Math.random() * CREATURES.length)];
    const hp = 1; 
    setCreature({ ...c, hp, maxHp: hp });
    setAnimating("creature-entry");
    setTimeout(() => setAnimating(null), 500);
  }, []);

  const generateQuestion = (type: "math" | "lang"): Question => {
    if (type === "math") {
      let n1, n2, op = "+", ans;
      if (level === 1) {
        n1 = Math.floor(Math.random() * 10) + 1;
        n2 = Math.floor(Math.random() * 10) + 1;
        ans = n1 + n2;
      } else if (level === 2) {
        n1 = Math.floor(Math.random() * 20) + 5;
        n2 = Math.floor(Math.random() * 20) + 5;
        op = Math.random() > 0.5 ? "+" : "-";
        if (op === "-") {
          if (n1 < n2) [n1, n2] = [n2, n1];
          ans = n1 - n2;
        } else {
          ans = n1 + n2;
        }
      } else {
        n1 = Math.floor(Math.random() * 10) + 2;
        n2 = Math.floor(Math.random() * 5) + 2;
        op = "×";
        ans = n1 * n2;
      }

      const options = [ans];
      while (options.length < 4) {
        const fake = ans + (Math.floor(Math.random() * 10) - 5);
        if (fake >= 0 && !options.includes(fake)) options.push(fake);
      }
      return {
        type,
        text: `${n1} ${op} ${n2} = ?`,
        options: options.sort(() => Math.random() - 0.5).map(String),
        answer: String(ans),
      };
    } else {
      const words = [
        { q: "A _ P L E", a: "P" },
        { q: "B _ N A N A", a: "A" },
        { q: "T _ G E R", a: "I" },
        { q: "S N _ K E", a: "A" },
        { q: "J U N _ L E", a: "G" },
        { q: "F I _ H T", a: "G" },
        { q: "M _ T H", a: "A" },
        { q: "B _ T T L E", a: "A" },
      ];
      const selected = words[Math.floor(Math.random() * words.length)];
      const options = [selected.a, "B", "O", "E", "I", "U"].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);
      if (!options.includes(selected.a)) options[0] = selected.a;
      
      return {
        type,
        text: `Missing letter: ${selected.q}`,
        options: options.sort(() => Math.random() - 0.5),
        answer: selected.a,
      };
    }
  };

  const startGame = () => {
    setGameState("fighting");
    spawnCreature(1);
    setPlayerHealth(3);
    setKills(0);
    setLevel(1);
  };

  const handleAttack = (type: "math" | "lang") => {
    setProjectileType(type === "math" ? "🦶" : "🥊");
    setActiveQuestion(generateQuestion(type));
    setGameState("question");
  };

  const submitAnswer = (choice: string) => {
    if (!activeQuestion) return;

    if (choice === activeQuestion.answer) {
      setFeedback("correct");
      setGameState("fighting");
      
      // Step 1: Throw Projectile
      setAnimating("projectile");
      
      setTimeout(() => {
        // Step 2: Impact
        setAnimating("impact");
        
        setTimeout(() => {
          // Step 3: Defeat
          setAnimating("defeat");
          setCreature(prev => prev ? { ...prev, hp: prev.hp - 1 } : null);
          
          setTimeout(() => {
            setAnimating(null);
            setFeedback(null);
            
            setKills(k => {
              const newKills = k + 1;
              if (newKills % 5 === 0) setLevel(l => l + 1);
              spawnCreature(level);
              return newKills;
            });
          }, 600);
        }, 400);
      }, 600);

    } else {
      setFeedback("wrong");
      setGameState("fighting");
      
      // Creature attacks
      setAnimating("creature-attack");
      
      setTimeout(() => {
        setAnimating("impact-player");
        setPlayerHealth(prev => {
          if (prev <= 1) {
            setGameState("gameover");
            return 0;
          }
          return prev - 1;
        });
        
        setTimeout(() => {
          setAnimating(null);
          setFeedback(null);
        }, 500);
      }, 500);
    }
  };

  return (
    <div className={cn(
      "relative w-full aspect-video min-h-[400px] bg-gradient-to-br from-emerald-950 via-green-900 to-emerald-950 rounded-3xl overflow-hidden border-4 border-emerald-800 shadow-2xl flex flex-col font-sans transition-all duration-300",
      animating === "impact-player" ? "animate-shake bg-red-900/20" : ""
    )}>
      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(200px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes flyOut {
          to { transform: translate(200px, -200px) rotate(360deg); opacity: 0; }
        }
        @keyframes projectileMove {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(300px) rotate(360deg); opacity: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        @keyframes creatureLunge {
          0% { transform: translateX(0); }
          50% { transform: translateX(-100px) scale(1.2); }
          100% { transform: translateX(0); }
        }
        .animate-slide-in { animation: slideIn 0.5s ease-out forwards; }
        .animate-fly-out { animation: flyOut 0.6s ease-in forwards; }
        .animate-projectile { animation: projectileMove 0.6s linear forwards; }
        .animate-shake { animation: shake 0.1s linear infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-lunge { animation: creatureLunge 0.5s ease-in-out; }
      `}</style>

      {/* Jungle Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 text-4xl animate-float opacity-30">🌿</div>
        <div className="absolute top-40 left-40 text-2xl animate-float opacity-20" style={{ animationDelay: '1s' }}>🍃</div>
        <div className="absolute bottom-20 left-20 text-5xl animate-float opacity-40" style={{ animationDelay: '0.5s' }}>🌴</div>
        <div className="absolute top-20 right-40 text-3xl animate-float opacity-20" style={{ animationDelay: '1.5s' }}>🌿</div>
        <div className="absolute bottom-10 right-80 text-4xl animate-float opacity-30" style={{ animationDelay: '2s' }}>🍃</div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between items-center text-white bg-gradient-to-b from-black/40 to-transparent">
        <div className="flex gap-2 bg-black/20 px-4 py-2 rounded-2xl backdrop-blur-sm">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart key={i} className={cn("w-6 h-6 drop-shadow-lg", i < playerHealth ? "text-rose-500 fill-rose-500" : "text-slate-700")} />
          ))}
        </div>
        <div className="flex items-center gap-6">
          <div className="bg-black/20 px-4 py-1 rounded-xl backdrop-blur-sm border border-white/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Trophies</p>
            <p className="text-xl font-black text-center">{kills}</p>
          </div>
          <div className="bg-emerald-500/20 px-4 py-1 rounded-xl backdrop-blur-sm border border-emerald-500/20">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Level</p>
            <p className="text-xl font-black text-center">{level}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Game Stage */}
      <div className="flex-1 relative flex items-center justify-around px-12 overflow-hidden">
        {/* Player */}
        <div className={cn(
          "relative transition-all duration-300 z-20",
          animating === "impact-player" ? "scale-90" : "scale-100"
        )}>
          <div className="text-9xl filter drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">🦸</div>
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 rounded-full text-[10px] font-black text-white whitespace-nowrap shadow-xl border border-white/20">
            WARRIOR
          </div>
          
          {/* Attack Projectile */}
          {animating === "projectile" && (
            <div className="absolute top-1/2 left-full -translate-y-1/2 text-7xl animate-projectile z-30">
              {projectileType}
            </div>
          )}
        </div>

        {/* Creature */}
        {creature && (
          <div className={cn(
            "relative z-20",
            animating === "creature-entry" && "animate-slide-in",
            animating === "defeat" && "animate-fly-out",
            animating === "impact" && "animate-shake",
            animating === "creature-attack" && "animate-lunge"
          )}>
            <div className="text-9xl filter drop-shadow-[0_0_30px_rgba(244,63,94,0.5)]">{creature.emoji}</div>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-rose-600 rounded-full text-[10px] font-black text-white whitespace-nowrap shadow-xl border border-white/20 uppercase tracking-wider">
              {creature.name}
            </div>
            
            {/* Impact Sparkle */}
            {animating === "impact" && (
              <div className="absolute inset-0 flex items-center justify-center text-8xl animate-ping text-yellow-400">
                💥
              </div>
            )}

            {/* HP Bar */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 h-3 bg-black/40 rounded-full overflow-hidden border-2 border-white/10 shadow-lg">
              <div 
                className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-500" 
                style={{ width: `${(creature.hp / creature.maxHp) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Control UI */}
      <div className="relative z-10 p-6 h-48 bg-gradient-to-t from-black/80 to-black/20 backdrop-blur-xl border-t border-white/10">
        {gameState === "intro" && (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center gap-3">
              <Swords className="w-8 h-8 text-emerald-400 animate-pulse" />
              <h2 className="text-4xl font-black text-white italic tracking-tighter drop-shadow-lg">JUNGLE SURVIVAL</h2>
            </div>
            <button 
              onClick={startGame}
              className="group px-12 py-5 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-black rounded-3xl shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-105 transition-all flex items-center gap-3 border-t border-white/20"
            >
              <Zap className="w-6 h-6 fill-white" /> START MISSION
            </button>
          </div>
        )}

        {gameState === "fighting" && !animating && (
          <div className="h-full flex items-center justify-center gap-8">
            <button 
              onClick={() => handleAttack("lang")}
              className="group relative flex-1 max-w-[280px] h-28 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] p-6 flex items-center gap-5 hover:scale-110 active:scale-95 transition-all shadow-2xl border-t border-white/20"
            >
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-all shadow-inner">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-blue-100/60 uppercase tracking-[2px]">Punch Skill</p>
                <p className="text-2xl font-black text-white italic tracking-tight">LANGUAGE</p>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-lg shadow-lg border-2 border-white">🥊</div>
            </button>

            <button 
              onClick={() => handleAttack("math")}
              className="group relative flex-1 max-w-[280px] h-28 bg-gradient-to-br from-amber-500 to-orange-700 rounded-[32px] p-6 flex items-center gap-5 hover:scale-110 active:scale-95 transition-all shadow-2xl border-t border-white/20"
            >
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center group-hover:-rotate-12 transition-all shadow-inner">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-amber-100/60 uppercase tracking-[2px]">Kick Skill</p>
                <p className="text-2xl font-black text-white italic tracking-tight">MATHS</p>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-lg shadow-lg border-2 border-white">🦶</div>
            </button>
          </div>
        )}

        {gameState === "question" && activeQuestion && (
          <div className="h-full flex flex-col items-center justify-center space-y-5 animate-in fade-in slide-in-from-bottom-4">
            <div className={cn(
              "text-3xl font-black px-10 py-4 rounded-3xl shadow-2xl border-2 border-white/10 flex items-center gap-4",
              activeQuestion.type === "math" ? "bg-amber-500 text-white" : "bg-blue-600 text-white"
            )}>
              <Sparkles className="w-6 h-6 animate-spin-slow" />
              {activeQuestion.text}
            </div>
            <div className="flex gap-4">
              {activeQuestion.options.map((opt, i) => (
                <button
                  key={i}
                  disabled={!!feedback}
                  onClick={() => submitAnswer(opt)}
                  className={cn(
                    "min-w-[100px] px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl border-2 border-white/10 transition-all text-xl shadow-xl hover:-translate-y-1 active:translate-y-0",
                    feedback === "correct" && opt === activeQuestion.answer ? "bg-emerald-500 border-emerald-400 shadow-emerald-500/40" : "",
                    feedback === "wrong" && opt !== activeQuestion.answer ? "opacity-30" : ""
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === "gameover" && (
          <div className="h-full flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-4 text-rose-500 drop-shadow-lg">
               <Trophy className="w-12 h-12" />
               <h2 className="text-5xl font-black italic tracking-tighter">DEFEATED</h2>
            </div>
            <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Final Score: {kills} Trophies</p>
            <button 
              onClick={startGame}
              className="px-10 py-4 bg-white text-slate-900 font-black rounded-2xl shadow-2xl hover:scale-105 transition-all flex items-center gap-2 border-b-4 border-slate-200"
            >
              <RefreshCw className="w-5 h-5" /> REAWAKEN
            </button>
          </div>
        )}
      </div>

      {/* Large Feedback Symbols */}
      {feedback && (
        <div className="absolute inset-0 z-50 flex items-center justify-center animate-in zoom-in duration-300 pointer-events-none">
          <div className={cn(
            "text-[12rem] font-black transition-all duration-500 drop-shadow-2xl",
            feedback === "correct" ? "text-emerald-400 opacity-60" : "text-rose-500 opacity-60"
          )}>
            {feedback === "correct" ? "🎯" : "💥"}
          </div>
        </div>
      )}
    </div>
  );
}
