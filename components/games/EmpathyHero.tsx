"use client";
import React, { useState, useEffect } from "react";
import { Heart, Flower, Sun, CloudRain, ArrowRight, RefreshCw, Star, Info, Users, Home, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

interface Scenario {
  id: number;
  situation: string;
  emoji: string;
  character: string;
  correctEmotion: string;
  emotions: string[];
  bestAction: string;
  actions: string[];
  outcome: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    situation: "Rahul dropped his favorite ice cream cone on the ground.",
    emoji: "🍦",
    character: "Rahul",
    correctEmotion: "Sad 😢",
    emotions: ["Sad 😢", "Angry 😠", "Happy 😄", "Scared 😨"],
    bestAction: "Offer to share yours or comfort him.",
    actions: ["Offer to share yours or comfort him.", "Laugh at him.", "Walk away.", "Tell him it's just ice cream."],
    outcome: "Rahul feels better because he knows you care about his feelings!"
  },
  {
    id: 2,
    situation: "A new student is sitting all alone during the school lunch break.",
    emoji: "🏫",
    character: "The New Student",
    correctEmotion: "Lonely 😔",
    emotions: ["Lonely 😔", "Excited 🤩", "Bored 😑", "Sleepy 😴"],
    bestAction: "Go sit with them and say hello.",
    actions: ["Go sit with them and say hello.", "Keep playing with your friends.", "Stare at them from far away.", "Tell them they are in your spot."],
    outcome: "You just made a new friend! They feel welcomed and happy now."
  },
  {
    id: 3,
    situation: "Sita worked hard on a drawing, but someone accidentally spilled water on it.",
    emoji: "🎨",
    character: "Sita",
    correctEmotion: "Upset 😠",
    emotions: ["Upset 😠", "Happy 😄", "Funny 🤣", "Proud 😎"],
    bestAction: "Help her dry it or offer to draw a new one together.",
    actions: ["Help her dry it or offer to draw a new one together.", "Tell her to stop crying.", "Say it's not a big deal.", "Ignore her."],
    outcome: "Sita appreciates your help. It's much easier to fix things with a friend!"
  },
  {
    id: 4,
    situation: "Your friend is nervous because they have to speak in front of the whole class.",
    emoji: "🎤",
    character: "Your Friend",
    correctEmotion: "Nervous 😰",
    emotions: ["Nervous 😰", "Angry 😠", "Brave 🦁", "Hungry 🍎"],
    bestAction: "Give them a thumbs up and tell them 'You can do it!'",
    actions: ["Give them a thumbs up and tell them 'You can do it!'", "Tell them everyone is watching.", "Make funny faces to distract them.", "Leave the room."],
    outcome: "Your encouragement gave them the confidence to speak clearly!"
  }
];

const GARDEN_FLOWERS = ["🌸", "🌻", "🌷", "🌹", "🌼", "🌺", "🌿", "🌳", "🦋"];

export default function EmpathyHero({ onClose }: { onClose?: () => void }) {
  const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0);
  const [gameState, setGameState] = useState<"intro" | "feeling" | "action" | "result" | "complete">("intro");
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [garden, setGarden] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "neutral", text: string } | null>(null);

  const scenario = SCENARIOS[currentScenarioIdx];

  const handleEmotionSelect = (emotion: string) => {
    setSelectedEmotion(emotion);
    if (emotion === scenario.correctEmotion) {
      setFeedback({ type: "success", text: "That's right! You recognized how they feel." });
      setTimeout(() => {
        setGameState("action");
        setFeedback(null);
      }, 1500);
    } else {
      setFeedback({ type: "neutral", text: "Not quite. Look closely at the situation again." });
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const handleActionSelect = (action: string) => {
    setSelectedAction(action);
    if (action === scenario.bestAction) {
      setFeedback({ type: "success", text: "Amazing! That was a very kind and empathetic choice." });
      setGarden(prev => [...prev, GARDEN_FLOWERS[Math.floor(Math.random() * GARDEN_FLOWERS.length)]]);
    } else {
      setFeedback({ type: "neutral", text: "There might be a kinder way to respond. Think about their feelings." });
    }
    
    setTimeout(() => {
      setGameState("result");
      setFeedback(null);
    }, 1500);
  };

  const nextScenario = () => {
    if (currentScenarioIdx < SCENARIOS.length - 1) {
      setCurrentScenarioIdx(prev => prev + 1);
      setSelectedEmotion(null);
      setSelectedAction(null);
      setGameState("feeling");
    } else {
      setGameState("complete");
    }
  };

  const restart = () => {
    setCurrentScenarioIdx(0);
    setGarden([]);
    setSelectedEmotion(null);
    setSelectedAction(null);
    setGameState("intro");
  };

  return (
    <div className="relative w-full aspect-video min-h-[500px] bg-gradient-to-br from-pink-50 via-rose-50 to-indigo-50 rounded-[40px] overflow-hidden border-8 border-white shadow-2xl flex flex-col font-sans">
      {/* Kindness Garden (Background) */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-emerald-100/50 flex items-end px-12 py-4 gap-2 overflow-hidden z-0">
        {garden.map((flower, i) => (
          <div key={i} className="text-4xl animate-bounce-slow" style={{ animationDelay: `${i * 0.2}s` }}>
            {flower}
          </div>
        ))}
        {garden.length === 0 && (
          <p className="text-emerald-800/30 font-black italic uppercase tracking-widest text-sm w-full text-center pb-4">
            Your Kindness Garden will grow here...
          </p>
        )}
      </div>

      {/* Floating Sparkles Decor */}
      <div className="absolute top-10 right-10 text-yellow-400/20 animate-pulse"><Sun size={120} /></div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-6 py-2.5 rounded-full shadow-sm border border-pink-100">
            <Heart className="text-rose-500 fill-rose-500 animate-pulse" size={24} />
            <span className="font-black text-rose-900 uppercase tracking-widest text-sm">Empathy Hero</span>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/80 backdrop-blur-md px-6 py-2.5 rounded-full shadow-sm border border-emerald-100 flex items-center gap-2">
               <Flower className="text-emerald-500" size={20} />
               <span className="font-black text-emerald-900">{garden.length} Blooms</span>
            </div>
            {onClose && (
              <button onClick={onClose} className="w-11 h-11 flex items-center justify-center bg-white/80 hover:bg-white rounded-full shadow-sm transition-all text-slate-400">
                <RefreshCw size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Game Area */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {gameState === "intro" && (
            <div className="text-center space-y-6 max-w-xl animate-in fade-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Users size={48} className="text-rose-500" />
              </div>
              <h1 className="text-5xl font-black text-rose-950 leading-tight">Welcome to the<br/><span className="text-rose-500">Kindness Quest!</span></h1>
              <p className="text-slate-600 text-lg">Understand feelings, help your friends, and watch your Kindness Garden grow.</p>
              <button 
                onClick={() => setGameState("feeling")}
                className="px-12 py-5 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-3xl shadow-xl shadow-rose-500/20 hover:scale-105 transition-all flex items-center gap-3 mx-auto text-xl"
              >
                START QUEST <ArrowRight />
              </button>
            </div>
          )}

          {(gameState === "feeling" || gameState === "action" || gameState === "result") && (
            <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-12 items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
              {/* Situation Card */}
              <div className="bg-white rounded-[40px] p-8 shadow-2xl border-b-8 border-slate-100 relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Smile size={120} /></div>
                <div className="relative z-10 space-y-6">
                  <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-5xl shadow-inner">
                    {scenario.emoji}
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[3px] text-indigo-400">The Situation</p>
                    <h2 className="text-2xl font-black text-slate-800 leading-snug">{scenario.situation}</h2>
                  </div>
                </div>
              </div>

              {/* Options Column */}
              <div className="space-y-6">
                {gameState === "feeling" && (
                  <>
                    <p className="text-center font-black text-slate-400 uppercase tracking-widest text-xs">How is {scenario.character} feeling?</p>
                    <div className="grid grid-cols-2 gap-4">
                      {scenario.emotions.map((emo, i) => (
                        <button
                          key={i}
                          onClick={() => handleEmotionSelect(emo)}
                          className={cn(
                            "p-5 bg-white hover:bg-rose-50 border-2 border-transparent hover:border-rose-200 rounded-3xl font-black text-slate-700 transition-all shadow-lg hover:-translate-y-1 active:translate-y-0",
                            selectedEmotion === emo && emo === scenario.correctEmotion && "border-emerald-500 bg-emerald-50 text-emerald-700",
                            selectedEmotion === emo && emo !== scenario.correctEmotion && "border-rose-500 bg-rose-50 text-rose-700 opacity-50"
                          )}
                        >
                          {emo}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {gameState === "action" && (
                  <>
                    <p className="text-center font-black text-slate-400 uppercase tracking-widest text-xs">What should you do to help?</p>
                    <div className="space-y-3">
                      {scenario.actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleActionSelect(act)}
                          className={cn(
                            "w-full p-5 bg-white hover:bg-indigo-50 border-2 border-transparent hover:border-indigo-200 rounded-3xl font-bold text-slate-700 text-left transition-all shadow-lg hover:-translate-x-1",
                            selectedAction === act && act === scenario.bestAction && "border-emerald-500 bg-emerald-50 text-emerald-700",
                            selectedAction === act && act !== scenario.bestAction && "border-amber-500 bg-amber-50 text-amber-700"
                          )}
                        >
                          {act}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {gameState === "result" && (
                  <div className="text-center space-y-6 animate-in zoom-in duration-500">
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-6 py-2 rounded-full font-black uppercase tracking-widest text-xs mb-4">
                      <Star size={16} fill="currentColor" /> Result
                    </div>
                    <p className="text-2xl font-bold text-slate-700 leading-relaxed italic">"{scenario.outcome}"</p>
                    <button 
                      onClick={nextScenario}
                      className="px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                    >
                      CONTINUE QUEST <ArrowRight />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {gameState === "complete" && (
            <div className="text-center space-y-8 animate-in zoom-in duration-500">
               <div className="relative">
                  <div className="absolute inset-0 animate-ping opacity-20"><Star className="w-32 h-32 text-yellow-400 mx-auto" /></div>
                  <Trophy className="w-32 h-32 text-yellow-500 mx-auto drop-shadow-2xl" />
               </div>
               <div className="space-y-2">
                 <h2 className="text-5xl font-black text-rose-950">You are a True Hero!</h2>
                 <p className="text-slate-500 text-xl font-medium">You completed the quest and bloomed {garden.length} flowers.</p>
               </div>
               <div className="flex gap-4 justify-center">
                 <button 
                   onClick={restart}
                   className="px-10 py-4 bg-white text-slate-900 font-black rounded-2xl shadow-xl hover:scale-105 transition-all border-b-4 border-slate-100 flex items-center gap-2"
                 >
                   <RefreshCw size={20} /> PLAY AGAIN
                 </button>
                 {onClose && (
                   <button 
                    onClick={onClose}
                    className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all"
                  >
                    RETURN TO ARCADE
                  </button>
                 )}
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Feedback HUD */}
      {feedback && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className={cn(
            "px-10 py-6 rounded-[32px] shadow-2xl font-black text-2xl animate-in zoom-in slide-in-from-bottom-8 duration-300",
            feedback.type === "success" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
          )}>
            {feedback.text}
          </div>
        </div>
      )}
    </div>
  );
}
