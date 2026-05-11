"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Heart, Shield, Swords, Zap, RefreshCw, Trophy, ArrowLeft, Target, BookOpen, Calculator } from "lucide-react";
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
  const [animating, setAnimating] = useState<"player" | "creature" | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const spawnCreature = useCallback((lvl: number) => {
    const c = CREATURES[Math.floor(Math.random() * CREATURES.length)];
    const hp = 1; // For now, 1 hit kills for faster gameplay flow
    setCreature({ ...c, hp, maxHp: hp });
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
    setActiveQuestion(generateQuestion(type));
    setGameState("question");
  };

  const submitAnswer = (choice: string) => {
    if (!activeQuestion) return;

    if (choice === activeQuestion.answer) {
      setFeedback("correct");
      setAnimating("player");
      setTimeout(() => {
        setCreature(prev => prev ? { ...prev, hp: prev.hp - 1 } : null);
        setAnimating(null);
        setFeedback(null);
        setGameState("fighting");

        // If creature defeated
        setKills(k => {
          const newKills = k + 1;
          if (newKills % 5 === 0) setLevel(l => l + 1);
          spawnCreature(level);
          return newKills;
        });
      }, 1000);
    } else {
      setFeedback("wrong");
      setAnimating("creature");
      setTimeout(() => {
        setPlayerHealth(prev => {
          if (prev <= 1) {
            setGameState("gameover");
            return 0;
          }
          return prev - 1;
        });
        setAnimating(null);
        setFeedback(null);
        setGameState("fighting");
      }, 1000);
    }
  };

  return (
    <div className="relative w-full aspect-video min-h-[400px] bg-gradient-to-br from-emerald-900 via-green-900 to-emerald-950 rounded-3xl overflow-hidden border-4 border-emerald-800 shadow-2xl flex flex-col font-sans">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between items-center text-white">
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart key={i} className={cn("w-6 h-6", i < playerHealth ? "text-rose-500 fill-rose-500" : "text-slate-700")} />
          ))}
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Kills</p>
            <p className="text-xl font-black">{kills}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Level</p>
            <p className="text-xl font-black">{level}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Game Stage */}
      <div className="flex-1 relative flex items-center justify-around px-12">
        {/* Player */}
        <div className={cn(
          "relative transition-all duration-300",
          animating === "player" ? "translate-x-12 scale-110" : "",
          animating === "creature" ? "animate-shake" : ""
        )}>
          <div className="text-8xl filter drop-shadow-2xl">🦸</div>
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 rounded-full text-[10px] font-black text-white whitespace-nowrap shadow-lg">
            YOU
          </div>
        </div>

        {/* VS icon */}
        <div className="text-emerald-500/20 font-black text-6xl italic select-none">VS</div>

        {/* Creature */}
        {creature && (
          <div className={cn(
            "relative transition-all duration-300",
            animating === "creature" ? "-translate-x-12 scale-110" : "",
            animating === "player" ? "animate-shake opacity-50" : ""
          )}>
            <div className="text-8xl filter drop-shadow-2xl">{creature.emoji}</div>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-rose-600 rounded-full text-[10px] font-black text-white whitespace-nowrap shadow-lg">
              {creature.name}
            </div>
            {/* HP Bar */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-24 h-2 bg-slate-800 rounded-full overflow-hidden border border-white/10">
              <div 
                className="h-full bg-rose-500 transition-all duration-500" 
                style={{ width: `${(creature.hp / creature.maxHp) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Control UI */}
      <div className="relative z-10 p-8 h-48 bg-black/20 backdrop-blur-md border-t border-white/10">
        {gameState === "intro" && (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
            <h2 className="text-3xl font-black text-white italic tracking-tighter">JUNGLE FIGHT</h2>
            <button 
              onClick={startGame}
              className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center gap-3"
            >
              <Swords className="w-6 h-6" /> START MISSION
            </button>
          </div>
        )}

        {gameState === "fighting" && (
          <div className="h-full flex items-center justify-center gap-6">
            <button 
              onClick={() => handleAttack("lang")}
              className="group relative flex-1 max-w-[240px] h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-4 flex items-center gap-4 hover:scale-105 transition-all shadow-xl"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-blue-100/70 uppercase">Punch</p>
                <p className="text-xl font-black text-white">LANGUAGE</p>
              </div>
            </button>

            <button 
              onClick={() => handleAttack("math")}
              className="group relative flex-1 max-w-[240px] h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-4 flex items-center gap-4 hover:scale-105 transition-all shadow-xl"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-amber-100/70 uppercase">Kick</p>
                <p className="text-xl font-black text-white">MATH</p>
              </div>
            </button>
          </div>
        )}

        {gameState === "question" && activeQuestion && (
          <div className="h-full flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95">
            <p className={cn(
              "text-2xl font-black px-6 py-2 rounded-2xl shadow-lg",
              activeQuestion.type === "math" ? "bg-amber-500 text-white" : "bg-blue-500 text-white"
            )}>
              {activeQuestion.text}
            </p>
            <div className="flex gap-3">
              {activeQuestion.options.map((opt, i) => (
                <button
                  key={i}
                  disabled={!!feedback}
                  onClick={() => submitAnswer(opt)}
                  className={cn(
                    "px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-black rounded-xl border border-white/20 transition-all",
                    feedback === "correct" && opt === activeQuestion.answer ? "bg-emerald-500 border-emerald-400" : "",
                    feedback === "wrong" && opt !== activeQuestion.answer ? "opacity-50" : ""
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
            <div className="flex items-center gap-3 text-rose-500">
               <Zap className="w-10 h-10 fill-rose-500" />
               <h2 className="text-4xl font-black italic">MISSION FAILED</h2>
            </div>
            <button 
              onClick={startGame}
              className="px-8 py-3 bg-white text-slate-900 font-black rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" /> TRY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Correct/Wrong Overlay */}
      {feedback && (
        <div className="absolute inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200 bg-black/40 backdrop-blur-sm">
          <div className={cn(
            "text-8xl font-black transform scale-150 transition-all duration-500",
            feedback === "correct" ? "text-emerald-400" : "text-rose-500"
          )}>
            {feedback === "correct" ? "✓" : "✗"}
          </div>
        </div>
      )}
    </div>
  );
}
