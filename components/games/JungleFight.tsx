"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Heart, Shield, Swords, Zap, RefreshCw, Trophy, ArrowLeft, Target, BookOpen, Calculator, Sparkles, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateGameScenario } from "@/app/actions/ai";
import { usePoints } from "@/lib/points-store";

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
  attackSymbol: string;
}

const CREATURES = [
  { name: "Wild Tiger", emoji: "🐅", attackSymbol: "🐾" },
  { name: "Jungle Snake", emoji: "🐍", attackSymbol: "💨" },
  { name: "Croc Guardian", emoji: "🐊", attackSymbol: "🐊" },
  { name: "Silverback Gorilla", emoji: "🦍", attackSymbol: "🪨" },
  { name: "Desert Scorpion", emoji: "🦂", attackSymbol: "🦂" },
  { name: "Shadow Jaguar", emoji: "🐆", attackSymbol: "🐾" },
];

export default function JungleFight({ onClose }: { onClose?: () => void }) {
  const [gameState, setGameState] = useState<"fighting" | "question" | "levelup" | "gameover">("fighting");
  const [level, setLevel] = useState(1);
  const [kills, setKills] = useState(0);
  const [playerHealth, setPlayerHealth] = useState(3);
  const [creature, setCreature] = useState<Creature | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [animating, setAnimating] = useState<"player" | "creature" | "projectile" | "creature-projectile" | "block" | "impact" | "impact-player" | "defeat" | "creature-entry" | "creature-attack" | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [projectileType, setProjectileType] = useState<"🥊" | "🦶">("🥊");
  const [sessionXP, setSessionXP] = useState(0);
  const { addXP } = usePoints();
  const spawnRef = useRef(false);

  const spawnCreature = useCallback((lvl: number) => {
    const c = CREATURES[Math.floor(Math.random() * CREATURES.length)];
    const hp = 1; 
    setCreature({ ...c, hp, maxHp: hp });
    setAnimating("creature-entry");
    
    setTimeout(() => {
      setAnimating("creature-projectile");
    }, 600);
  }, []);

  useEffect(() => {
    if (!spawnRef.current) {
      spawnCreature(1);
      spawnRef.current = true;
    }
  }, [spawnCreature]);

  const generateQuestion = (type: "math" | "lang"): Question => {
    if (type === "math") {
      let n1, n2, op = "+", ans;
      if (level === 1) {
        n1 = Math.floor(Math.random() * 10) + 1;
        n2 = Math.floor(Math.random() * 10) + 1;
        ans = n1 + n2;
      } else if (level === 2) {
        n1 = Math.floor(Math.random() * 30) + 10;
        n2 = Math.floor(Math.random() * 20) + 5;
        op = Math.random() > 0.5 ? "+" : "-";
        if (op === "-") {
          if (n1 < n2) [n1, n2] = [n2, n1];
          ans = n1 - n2;
        } else {
          ans = n1 + n2;
        }
      } else if (level === 3) {
        n1 = Math.floor(Math.random() * 50) + 20;
        n2 = Math.floor(Math.random() * 50) + 10;
        op = Math.random() > 0.5 ? "+" : "-";
        if (op === "-") {
          if (n1 < n2) [n1, n2] = [n2, n1];
          ans = n1 - n2;
        } else {
          ans = n1 + n2;
        }
      } else if (level === 4) {
        n1 = Math.floor(Math.random() * 15) + 2;
        n2 = Math.floor(Math.random() * 12) + 2;
        op = "×";
        ans = n1 * n2;
      } else {
        n1 = Math.floor(Math.random() * 100) + 10;
        n2 = Math.floor(Math.random() * 9) + 2;
        op = "÷";
        ans = Math.floor(n1 / n2);
        n1 = ans * n2; // Ensure clean division
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
        { q: "P U _ C H", a: "N" },
        { q: "K I _ K", a: "C" },
      ];
      const selected = words[Math.floor(Math.random() * words.length)];
      const options = [selected.a, "B", "O", "E", "M", "S"].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);
      if (!options.includes(selected.a)) options[0] = selected.a;
      
      return {
        type,
        text: `Complete the word: ${selected.q}`,
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

  const startQuestion = async () => {
    if (level >= 3) {
      setIsAiLoading(true);
      const aiData = await generateGameScenario('jungle-fight', level);
      setIsAiLoading(false);
      
      if (aiData && aiData.problems && aiData.problems.length > 0) {
        const prob = aiData.problems[Math.floor(Math.random() * aiData.problems.length)];
        const options = [prob.a];
        while (options.length < 4) {
          const fake = prob.a + (Math.floor(Math.random() * 20) - 10);
          if (fake >= 0 && !options.includes(fake)) options.push(fake);
        }
        setActiveQuestion({
          type: "math",
          text: prob.q,
          options: options.sort(() => Math.random() - 0.5).map(String),
          answer: String(prob.a)
        });
        setGameState("question");
        return;
      }
    }
    
    setActiveQuestion(generateQuestion(Math.random() > 0.5 ? "math" : "lang"));
    setGameState("question");
  };

  const handleAttack = (type: "math" | "lang") => {
    setProjectileType(type === "math" ? "🦶" : "🥊");
    startQuestion();
  };

  const submitAnswer = (choice: string) => {
    if (!activeQuestion) return;

    if (choice === activeQuestion.answer) {
      setFeedback("correct");
      const earned = level * 5;
      addXP(earned);
      setSessionXP(prev => prev + earned);
      setGameState("fighting");
      
      setAnimating("block");
      
      setTimeout(() => {
        // Step 2: Counter Attack (Projectile)
        setAnimating("projectile");
        
        setTimeout(() => {
          // Step 3: Impact & Defeat
          setAnimating("impact");
          setCreature(prev => prev ? { ...prev, hp: prev.hp - 1 } : null);
          
          setTimeout(() => {
            setAnimating("defeat");
            
            setTimeout(() => {
              setAnimating(null);
              setFeedback(null);
              
              setKills(k => {
                const newKills = k + 1;
                if (newKills > 0 && newKills % 10 === 0) {
                  setGameState("levelup");
                  setLevel(l => l + 1);
                  return newKills;
                }
                spawnCreature(level);
                return newKills;
              });
            }, 500);
          }, 300);
        }, 500);
      }, 500);

    } else {
      setFeedback("wrong");
      setGameState("fighting");
      
      // Step 1: Creature Attack Projectile Hits Player
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
          setAnimating("creature-projectile"); // Reset creature to ready state
          setFeedback(null);
        }, 600);
      }, 500);
    }
  };

  return (
    <div className={cn(
      "relative w-full md:min-h-[648px] min-h-[480px] bg-gradient-to-br from-emerald-950 via-green-900 to-emerald-950 rounded-3xl overflow-visible border-4 border-emerald-800 shadow-2xl flex flex-col font-sans transition-all duration-300",
      animating === "impact-player" ? "animate-shake bg-red-900/40" : ""
    )}>
      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(200px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes flyOut {
          to { transform: translate(300px, -300px) rotate(720deg) scale(0); opacity: 0; }
        }
        @keyframes projectileMove {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(400px) rotate(360deg); }
        }
        @keyframes creatureProjectileMove {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(-400px) rotate(-360deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-15px); }
          75% { transform: translateX(15px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(5deg); }
        }
        @keyframes lunge {
          0% { transform: translateX(0); }
          50% { transform: translateX(-200px) scale(1.3); }
          100% { transform: translateX(0); }
        }
        @keyframes blockPulse {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.5); opacity: 1; border-width: 10px; }
          100% { transform: scale(2); opacity: 0; }
        }
        .animate-slide-in { animation: slideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-fly-out { animation: flyOut 0.8s ease-in forwards; }
        .animate-projectile { animation: projectileMove 0.5s linear forwards; }
        .animate-creature-projectile { animation: creatureProjectileMove 2.5s linear infinite; }
        .animate-shake { animation: shake 0.1s linear infinite; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-lunge { animation: lunge 0.5s ease-in-out forwards; }
        .animate-block { animation: blockPulse 0.5s ease-out forwards; }
      `}</style>

      {/* Jungle Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 text-5xl animate-float opacity-30">🌿</div>
        <div className="absolute top-40 left-40 text-3xl animate-float opacity-10" style={{ animationDelay: '1s' }}>🍃</div>
        <div className="absolute bottom-20 left-10 text-7xl animate-float opacity-20" style={{ animationDelay: '0.5s' }}>🌴</div>
        <div className="absolute top-20 right-40 text-4xl animate-float opacity-10" style={{ animationDelay: '1.5s' }}>🌿</div>
        <div className="absolute bottom-10 right-20 text-6xl animate-float opacity-20" style={{ animationDelay: '2s' }}>🍃</div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20rem] font-black text-black/10 select-none">JUNGLE</div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between items-center text-white">
        <div className="flex gap-2 bg-black/40 px-5 py-2.5 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart key={i} className={cn("w-7 h-7 drop-shadow-lg transition-all", i < playerHealth ? "text-rose-500 fill-rose-500 scale-110" : "text-slate-800 scale-90")} />
          ))}
        </div>
        <div className="flex items-center gap-6">
          <div className="bg-black/40 px-6 py-1.5 rounded-2xl backdrop-blur-md border border-white/10 text-center">
            <p className="text-[10px] font-black uppercase tracking-[3px] text-emerald-400 mb-0.5">Defeated</p>
            <p className="text-2xl font-black">{kills}</p>
          </div>
          <div className="bg-emerald-500/30 px-6 py-1.5 rounded-2xl backdrop-blur-md border border-emerald-500/30 text-center">
            <p className="text-[10px] font-black uppercase tracking-[3px] text-emerald-400 mb-0.5">Stage</p>
            <p className="text-2xl font-black">{level}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2.5 hover:bg-white/10 rounded-full transition-all hover:rotate-90">
            <ArrowLeft className="w-7 h-7" />
          </button>
        )}
      </div>

      {/* Game Stage */}
      <div className="flex-1 relative flex items-center justify-around px-12 overflow-hidden">
        {/* Player */}
        <div className={cn(
          "relative z-20 transition-all duration-300",
          animating === "impact-player" ? "scale-75" : "scale-100"
        )}>
          <div className="md:text-9xl text-7xl filter drop-shadow-[0_0_40px_rgba(59,130,246,0.6)]">🦸</div>
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-blue-600 rounded-full text-[11px] font-black text-white whitespace-nowrap shadow-2xl border border-white/30 uppercase tracking-widest">
            WARRIOR
          </div>
          
          {/* Block Shield Animation */}
          {animating === "block" && (
            <div className="absolute inset-0 z-40 flex items-center justify-center">
              <div className="w-full h-full rounded-full border-4 border-blue-400 animate-block bg-blue-400/20" />
              <ShieldCheck className="w-24 h-24 text-blue-400 absolute" />
            </div>
          )}

          {/* Player Attack Projectile */}
          {animating === "projectile" && (
            <div className="absolute top-1/2 left-full -translate-y-1/2 text-8xl animate-projectile z-50">
              {projectileType}
            </div>
          )}
        </div>

        {/* Creature */}
        {creature && (
          <div className={cn(
            "relative z-20 transition-all",
            animating === "creature-entry" && "animate-slide-in",
            animating === "defeat" && "animate-fly-out",
            animating === "impact" && "animate-shake scale-110",
            animating === "creature-attack" && "animate-lunge"
          )}>
            <div className="md:text-9xl text-7xl filter drop-shadow-[0_0_40px_rgba(244,63,94,0.6)]">{creature.emoji}</div>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-rose-700 rounded-full text-[11px] font-black text-white whitespace-nowrap shadow-2xl border border-white/30 uppercase tracking-[2px]">
              {creature.name}
            </div>
            
            {/* Creature Projectile (Incoming Attack) */}
            {animating === "creature-projectile" && (
              <div className="absolute top-1/2 right-full -translate-y-1/2 text-6xl animate-creature-projectile z-40 opacity-80">
                {creature.attackSymbol}
              </div>
            )}

            {/* Impact FX */}
            {animating === "impact" && (
              <div className="absolute inset-0 flex items-center justify-center text-9xl animate-ping text-yellow-400 z-50">
                💥
              </div>
            )}

            {/* HP Bar */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-40 h-4 bg-black/60 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl">
              <div 
                className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-rose-400 transition-all duration-500" 
                style={{ width: `${(creature.hp / creature.maxHp) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Control UI */}
      <div className="relative z-10 p-4 md:p-6 md:h-52 h-44 bg-gradient-to-t from-black/90 to-black/30 backdrop-blur-2xl border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">

        {gameState === "fighting" && (
          <div className="h-full flex items-center justify-center gap-8">
            <button 
              onClick={() => handleAttack("lang")}
              className="group relative flex-1 max-w-[320px] h-24 md:h-32 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-3xl md:rounded-[40px] p-3 md:p-6 flex items-center gap-3 md:gap-6 hover:scale-110 active:scale-95 transition-all shadow-2xl border-t-2 border-white/20"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-2xl md:rounded-3xl flex items-center justify-center group-hover:rotate-12 transition-all shadow-inner border border-white/10">
                <BookOpen className="w-6 h-6 md:w-9 md:h-9 text-white" />
              </div>
              <div className="text-left">
                <p className="text-xl md:text-3xl font-black text-white italic tracking-tight mb-0.5">PUNCH</p>
                <p className="text-[10px] font-black text-blue-100/60 uppercase tracking-[4px]">Language Skill</p>
              </div>
              <div className="absolute -top-3 -right-3 w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-2xl shadow-2xl border-4 border-white rotate-12">🥊</div>
            </button>

            <button 
              onClick={() => handleAttack("math")}
              className="group relative flex-1 max-w-[320px] h-24 md:h-32 bg-gradient-to-br from-amber-500 to-orange-700 rounded-3xl md:rounded-[40px] p-3 md:p-6 flex items-center gap-3 md:gap-6 hover:scale-110 active:scale-95 transition-all shadow-2xl border-t-2 border-white/20"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-2xl md:rounded-3xl flex items-center justify-center group-hover:-rotate-12 transition-all shadow-inner border border-white/10">
                <Calculator className="w-6 h-6 md:w-9 md:h-9 text-white" />
              </div>
              <div className="text-left">
                <p className="text-xl md:text-3xl font-black text-white italic tracking-tight mb-0.5">KICK</p>
                <p className="text-[10px] font-black text-amber-100/60 uppercase tracking-[4px]">Maths Skill</p>
              </div>
              <div className="absolute -top-3 -right-3 w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-2xl shadow-2xl border-4 border-white -rotate-12">🦶</div>
            </button>
          </div>
        )}

        {gameState === "question" && activeQuestion && (
          <div className="h-full flex flex-col items-center justify-center space-y-6 animate-in fade-in slide-in-from-bottom-6">
            <div className={cn(
              "text-4xl font-black px-12 py-5 rounded-[30px] shadow-2xl border-2 border-white/20 flex items-center gap-5 scale-105",
              activeQuestion.type === "math" ? "bg-amber-500 text-white shadow-amber-500/20" : "bg-blue-600 text-white shadow-blue-500/20"
            )}>
              <Shield className="w-8 h-8 animate-pulse" />
              {activeQuestion.text}
            </div>
            <div className="flex gap-5">
              {activeQuestion.options.map((opt, i) => (
                <button
                  key={i}
                  disabled={!!feedback}
                  onClick={() => submitAnswer(opt)}
                  className={cn(
                    "min-w-[120px] px-10 py-5 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl border-2 border-white/10 transition-all text-2xl shadow-2xl hover:-translate-y-2 active:translate-y-0",
                    feedback === "correct" && opt === activeQuestion.answer ? "bg-emerald-500 border-emerald-400 scale-110 shadow-emerald-500/50" : "",
                    feedback === "wrong" && opt !== activeQuestion.answer ? "opacity-30 blur-[2px]" : ""
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === "levelup" && (
          <div className="h-full flex flex-col items-center justify-center space-y-4 animate-in zoom-in duration-500">
             <div className="flex items-center gap-4 text-emerald-400">
                <Sparkles className="w-12 h-12 animate-spin-slow" />
                <h2 className="text-6xl font-black italic tracking-tighter drop-shadow-[0_0_30px_rgba(52,211,153,0.6)]">LEVEL UP!</h2>
             </div>
             <p className="text-white font-bold text-xl uppercase tracking-[10px]">Prepare for Stage {level}</p>
             <button 
               onClick={() => { setGameState("fighting"); spawnCreature(level); }}
               className="mt-4 px-12 py-4 bg-white text-slate-900 font-black rounded-2xl shadow-2xl hover:scale-105 transition-all"
             >
               CONTINUE HUNT
             </button>
          </div>
        )}

        {gameState === "gameover" && (
          <div className="h-full flex flex-col items-center justify-center space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex flex-col items-center gap-2 text-rose-500 drop-shadow-2xl">
               <div className="flex items-center gap-5">
                 <Trophy className="w-14 h-14" />
                 <h2 className="text-6xl font-black italic tracking-tighter uppercase">Defeated</h2>
               </div>
               <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full font-bold text-sm shadow-inner">
                 <Sparkles size={14} /> +{sessionXP} XP मिळाले
               </div>
            </div>
            <p className="text-slate-400 font-black tracking-[10px] uppercase text-[10px]">Best Score: {kills}</p>
            <button 
              onClick={startGame}
              className="px-12 py-5 bg-white text-slate-900 font-black rounded-2xl shadow-2xl hover:scale-110 transition-all flex items-center gap-3 border-b-8 border-slate-200"
            >
              <RefreshCw className="w-6 h-6" /> TRY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Large Feedback HUD */}
      {feedback && (
        <div className="absolute inset-0 z-50 flex items-center justify-center animate-in zoom-in duration-300 pointer-events-none">
          <div className={cn(
            "text-[15rem] font-black transition-all duration-500 drop-shadow-[0_0_60px_rgba(255,255,255,0.4)]",
            feedback === "correct" ? "text-emerald-400 opacity-80" : "text-rose-500 opacity-80"
          )}>
            {feedback === "correct" ? "🎯" : "💥"}
          </div>
        </div>
      )}
    </div>
  );
}
