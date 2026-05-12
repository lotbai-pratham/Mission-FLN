import React, { useState, useEffect, useCallback, useRef } from "react";
import { Trophy, RefreshCw, ArrowLeft, Zap, Trash2, CheckCircle2, Sparkles, Home, Star, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateGameQuestions } from "@/app/actions/ai";
import { usePoints } from "@/lib/points-store";

interface TrashItem {
  id: string;
  emoji: string;
  name: string;
  type: "wet" | "dry";
  x: number;
  y: number;
  rotation: number;
  scale: number;
  isSorted: boolean;
}

const TRASH_ITEMS_BASE = [
  { emoji: "🍌", name: "केळीचे साल", type: "wet" },
  { emoji: "📄", name: "कागद", type: "dry" },
  { emoji: "🍼", name: "प्लास्टिक बाटली", type: "dry" },
  { emoji: "🍎", name: "सफरचंदाचे तुकडे", type: "wet" },
  { emoji: "📦", name: "पुठ्ठा", type: "dry" },
  { emoji: "🥬", name: "भाजीपाला", type: "wet" },
  { emoji: "🥫", name: "कॅन", type: "dry" },
  { emoji: "🍉", name: "कलिंगडाचे साल", type: "wet" },
  { emoji: "🍞", name: "शिळी भाकरी", type: "wet" },
  { emoji: "🥤", name: "प्लास्टिक कप", type: "dry" },
  { emoji: "🦴", name: "हाडे", type: "wet" },
  { emoji: "📰", name: "वर्तमानपत्र", type: "dry" },
];

const PRIZES = ["🏆", "🥇", "💎", "🎁", "⭐", "🦄", "🌈", "🍦"];

export default function WasteSort({ onClose }: { onClose?: () => void }) {
  const [gameState, setGameState] = useState<"intro" | "playing" | "prizereveal" | "complete">("intro");
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);
  const [pile, setPile] = useState<TrashItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [currentPrize, setCurrentPrize] = useState("🏆");
  const { addXP } = usePoints();
  const pileRef = useRef<HTMLDivElement>(null);

  const generatePile = useCallback(async (lvl: number) => {
    setIsAiLoading(true);
    let items: any[] = [...TRASH_ITEMS_BASE];
    
    // Try to get some AI items
    try {
      const aiQuestions = await generateGameQuestions('waste-sort', lvl, 5);
      if (aiQuestions && aiQuestions.length > 0) {
        const aiItems = aiQuestions.map((q: any) => ({
          emoji: q.options[0],
          name: q.q,
          type: q.a === 'wet' || q.a.includes('ओला') ? 'wet' : 'dry'
        }));
        items = [...items, ...aiItems];
      }
    } catch (e) {
      console.log("AI fetch failed, using base items");
    }

    const count = 10 + (lvl * 3); // More items per level
    const newPile: TrashItem[] = [];
    
    for (let i = 0; i < count; i++) {
      const base = items[Math.floor(Math.random() * items.length)];
      newPile.push({
        id: `item-${Date.now()}-${i}`,
        ...base,
        x: 10 + Math.random() * 80, // 10% to 90%
        y: 10 + Math.random() * 70, // 10% to 80%
        rotation: Math.random() * 360,
        scale: 0.8 + Math.random() * 0.5,
        isSorted: false,
      });
    }

    setPile(newPile);
    setCurrentPrize(PRIZES[Math.floor(Math.random() * PRIZES.length)]);
    setIsAiLoading(false);
  }, []);

  const start = async () => {
    setScore(0);
    setLevel(1);
    setSessionXP(0);
    await generatePile(1);
    setGameState("playing");
  };

  const handleItemClick = (id: string) => {
    if (gameState !== "playing") return;
    setSelectedId(id);
    setFeedback(null);
  };

  const handleSort = (type: "wet" | "dry") => {
    if (!selectedId || feedback) return;
    
    const item = pile.find(i => i.id === selectedId);
    if (!item) return;

    if (item.type === type) {
      setFeedback("correct");
      addXP(5);
      setSessionXP(prev => prev + 5);
      setScore(s => s + 10);
      
      setTimeout(() => {
        setPile(prev => prev.filter(i => i.id !== selectedId));
        setSelectedId(null);
        setFeedback(null);
        
        // Check if pile is empty or very small
        setPile(current => {
          if (current.length === 0) {
            setGameState("prizereveal");
          }
          return current;
        });
      }, 500);
    } else {
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 800);
    }
  };

  const nextLevel = async () => {
    const nextLvl = level + 1;
    if (nextLvl > 5) {
      setGameState("complete");
    } else {
      setLevel(nextLvl);
      await generatePile(nextLvl);
      setGameState("playing");
    }
  };

  return (
    <div className="relative w-full md:min-h-[648px] min-h-[500px] bg-[#fdf8f3] rounded-[40px] overflow-hidden border-4 md:border-8 border-white shadow-2xl flex flex-col font-sans">
      {/* HUD Header */}
      <div className="relative z-50 p-4 md:p-6 flex justify-between items-center bg-white/40 backdrop-blur-sm border-b border-orange-100">
        <div className="flex gap-2 md:gap-4">
          <div className="bg-white/90 px-4 md:px-6 py-2 rounded-2xl shadow-sm border border-orange-100 flex items-center gap-2">
            <Star className="text-amber-500 fill-amber-500 w-4 h-4" />
            <span className="font-black text-orange-950 text-sm md:text-xl">Level {level}</span>
          </div>
          <div className="bg-white/90 px-4 md:px-6 py-2 rounded-2xl shadow-sm border border-orange-100 flex items-center gap-2">
            <Trophy className="text-orange-500 w-4 h-4" />
            <span className="font-black text-orange-900 text-sm md:text-xl">{score}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAiLoading && (
            <div className="flex items-center gap-2 text-orange-400 bg-orange-50 px-3 py-1 rounded-full animate-pulse">
               <Sparkles className="w-4 h-4" />
               <span className="text-[10px] font-bold uppercase tracking-tighter">AI Generating Pile...</span>
            </div>
          )}
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors text-slate-400">
              <Home size={24} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/sandpaper.png')]">
        {gameState === "intro" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-orange-50/90 backdrop-blur-md p-8">
            <div className="text-center space-y-6 max-w-xl animate-in fade-in zoom-in-95 duration-500">
              <div className="text-9xl mb-6 drop-shadow-2xl">♻️</div>
              <h1 className="text-5xl font-black text-orange-950 tracking-tighter">कचरा शोध (Waste Search)</h1>
              <p className="text-orange-700 text-xl font-medium leading-relaxed">
                कचऱ्याच्या ढिगाऱ्याखाली लपलेला खजिना शोधा! <br/>
                एक-एक वस्तू निवडा आणि योग्य कचरापेटीत टाका.
              </p>
              <button 
                onClick={start}
                className="px-12 py-5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-[30px] shadow-2xl shadow-orange-500/30 hover:scale-105 transition-all text-2xl flex items-center gap-3 mx-auto border-b-8 border-orange-700"
              >
                खेळ सुरू करा <Zap fill="white" />
              </button>
            </div>
          </div>
        )}

        {gameState === "playing" && (
          <>
            {/* The Pile Area */}
            <div ref={pileRef} className="absolute inset-0 m-4 md:m-12 bg-white/30 rounded-[3rem] border-4 border-dashed border-orange-200/50 shadow-inner overflow-hidden">
               {/* Hidden Prize at the bottom */}
               <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                 <div className="text-[150px] md:text-[250px] grayscale blur-[2px]">{currentPrize}</div>
               </div>

               {/* Items */}
               {pile.map((item) => (
                 <button
                   key={item.id}
                   onClick={() => handleItemClick(item.id)}
                   style={{
                     left: `${item.x}%`,
                     top: `${item.y}%`,
                     transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${selectedId === item.id ? item.scale * 1.3 : item.scale})`,
                     zIndex: selectedId === item.id ? 100 : Math.floor(item.y)
                   }}
                   className={cn(
                     "absolute text-5xl md:text-7xl transition-all duration-300 hover:brightness-110 active:scale-90 select-none cursor-pointer drop-shadow-lg",
                     selectedId === item.id ? "filter drop-shadow-[0_0_20px_rgba(255,255,255,1)] brightness-125" : "hover:scale-110"
                   )}
                 >
                   {item.emoji}
                   {selectedId === item.id && (
                     <div className="absolute -top-4 -right-4 bg-orange-500 text-white p-1 rounded-full shadow-lg animate-bounce">
                       <Star size={16} fill="white" />
                     </div>
                   )}
                 </button>
               ))}
            </div>

            {/* Instruction Overlay */}
            {!selectedId && pile.length > 0 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur px-6 py-2 rounded-full border border-orange-100 shadow-xl animate-bounce">
                <p className="text-orange-900 font-black text-sm uppercase tracking-widest">वस्तू निवडा! (Select an item)</p>
              </div>
            )}

            {/* Bins - Fixed at Bottom */}
            <div className="absolute bottom-8 left-0 right-0 z-[200] px-4 md:px-12 pointer-events-none">
              <div className="flex gap-4 md:gap-12 w-full max-w-4xl mx-auto justify-center">
                <button 
                  onClick={() => handleSort("wet")}
                  className={cn(
                    "pointer-events-auto group relative flex-1 max-w-[140px] md:max-w-[220px] h-32 md:h-44 bg-emerald-500 hover:bg-emerald-400 rounded-[32px] p-4 transition-all shadow-2xl hover:-translate-y-2 border-b-8 border-emerald-700 flex flex-col items-center justify-center gap-2",
                    selectedId ? "ring-4 ring-white animate-pulse" : "opacity-80 grayscale-[0.3]"
                  )}
                >
                  <div className="text-3xl md:text-5xl">🥬</div>
                  <p className="font-black text-white text-[10px] md:text-lg uppercase tracking-tighter">ओला कचरा (Wet)</p>
                  <div className="absolute -top-3 -right-3 w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center text-sm md:text-xl shadow-lg border-2 border-emerald-100">🟢</div>
                </button>

                <button 
                  onClick={() => handleSort("dry")}
                  className={cn(
                    "pointer-events-auto group relative flex-1 max-w-[140px] md:max-w-[220px] h-32 md:h-44 bg-blue-500 hover:bg-blue-400 rounded-[32px] p-4 transition-all shadow-2xl hover:-translate-y-2 border-b-8 border-blue-700 flex flex-col items-center justify-center gap-2",
                    selectedId ? "ring-4 ring-white animate-pulse" : "opacity-80 grayscale-[0.3]"
                  )}
                >
                  <div className="text-3xl md:text-5xl">📄</div>
                  <p className="font-black text-white text-[10px] md:text-lg uppercase tracking-tighter">सुका कचरा (Dry)</p>
                  <div className="absolute -top-3 -right-3 w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center text-sm md:text-xl shadow-lg border-2 border-blue-100">🔵</div>
                </button>
              </div>
            </div>
          </>
        )}

        {gameState === "prizereveal" && (
          <div className="absolute inset-0 z-[300] flex items-center justify-center bg-amber-500/20 backdrop-blur-sm p-8">
            <div className="text-center space-y-8 animate-in zoom-in duration-700">
               <div className="relative inline-block">
                 <div className="text-[180px] md:text-[250px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-bounce">{currentPrize}</div>
                 <div className="absolute inset-0 animate-ping opacity-50 bg-white rounded-full blur-3xl -z-10" />
               </div>
               <div className="space-y-4">
                 <h2 className="text-6xl font-black text-orange-950 tracking-tighter">खजिना सापडला!</h2>
                 <p className="text-orange-900 text-2xl font-bold italic">तुम्ही परिसर स्वच्छ केला आहे! ✨</p>
                 <button 
                    onClick={nextLevel}
                    className="px-12 py-5 bg-orange-600 text-white font-black rounded-[30px] shadow-2xl hover:scale-110 transition-all flex items-center gap-3 mx-auto border-b-8 border-orange-800"
                  >
                    पुढील पातळी (Next Level) <Zap fill="white" />
                  </button>
               </div>
            </div>
          </div>
        )}

        {gameState === "complete" && (
          <div className="absolute inset-0 z-[400] flex items-center justify-center bg-emerald-50/95 backdrop-blur-xl p-8">
            <div className="text-center space-y-6 animate-in zoom-in duration-500 max-w-2xl">
              <CheckCircle2 className="w-24 h-24 text-emerald-500 mx-auto" />
              <h1 className="text-6xl font-black text-slate-900 tracking-tighter italic">शुद्ध हवा, शुद्ध मन!</h1>
              <p className="text-emerald-700 text-2xl font-bold">तुम्ही सर्व {level-1} कचऱ्याचे ढिगारे साफ केले आहेत!</p>
              
              <div className="bg-white p-8 rounded-[40px] shadow-2xl border-4 border-emerald-100 space-y-4">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-slate-500 font-black uppercase tracking-widest text-sm">एकूण गुण (Total Score)</p>
                  <p className="text-6xl font-black text-slate-900">{score}</p>
                </div>
                <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-6 py-2 rounded-full font-black text-xl shadow-inner animate-bounce justify-center">
                   <Sparkles className="animate-pulse" /> +{sessionXP} XP मिळाले
                </div>
              </div>

              <div className="flex gap-4 justify-center pt-8">
                <button 
                  onClick={start}
                  className="px-10 py-4 bg-emerald-600 text-white font-black rounded-3xl shadow-xl hover:scale-105 transition-all flex items-center gap-2 border-b-8 border-emerald-800"
                >
                  <RefreshCw size={20} /> पुन्हा खेळा
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
          </div>
        )}

        {/* HUD Feedback */}
        {feedback && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[500] pointer-events-none animate-in zoom-in duration-300">
            <div className={cn(
              "text-9xl filter drop-shadow-2xl",
              feedback === "correct" ? "scale-125" : "animate-shake"
            )}>
              {feedback === "correct" ? "🎯" : "❌"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
