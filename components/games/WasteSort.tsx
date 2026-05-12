import React, { useState, useEffect, useCallback, useRef } from "react";
import { Trophy, RefreshCw, Zap, Trash2, CheckCircle2, Sparkles, Home, Star, Gift } from "lucide-react";
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
  currentX: number;
  currentY: number;
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
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [currentPrize, setCurrentPrize] = useState("🏆");
  const [dragOverBin, setDragOverBin] = useState<"wet" | "dry" | null>(null);
  const { addXP } = usePoints();
  const pileAreaRef = useRef<HTMLDivElement>(null);
  const wetBinRef = useRef<HTMLDivElement>(null);
  const dryBinRef = useRef<HTMLDivElement>(null);

  const generatePile = useCallback(async (lvl: number) => {
    setIsAiLoading(true);
    let items: any[] = [...TRASH_ITEMS_BASE];
    
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
      console.log("AI fetch failed");
    }

    const count = 10 + (lvl * 3);
    const newPile: TrashItem[] = [];
    
    for (let i = 0; i < count; i++) {
      const base = items[Math.floor(Math.random() * items.length)];
      const x = 10 + Math.random() * 80;
      const y = 10 + Math.random() * 50; // KEEP ITEMS IN TOP 60% TO AVOID BINS
      newPile.push({
        id: `item-${Date.now()}-${i}`,
        ...base,
        x,
        y,
        currentX: x,
        currentY: y,
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

  const onDragStart = (id: string, e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== "playing") return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const item = pile.find(i => i.id === id);
    if (!item || !pileAreaRef.current) return;

    const rect = pileAreaRef.current.getBoundingClientRect();
    const itemX = (item.currentX / 100) * rect.width;
    const itemY = (item.currentY / 100) * rect.height;

    setDragOffset({
      x: clientX - (rect.left + itemX),
      y: clientY - (rect.top + itemY)
    });
    setDraggedId(id);
  };

  const onDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!draggedId || !pileAreaRef.current) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const rect = pileAreaRef.current.getBoundingClientRect();
    const newX = ((clientX - rect.left - dragOffset.x) / rect.width) * 100;
    const newY = ((clientY - rect.top - dragOffset.y) / rect.height) * 100;

    setPile(prev => prev.map(item => 
      item.id === draggedId ? { ...item, currentX: newX, currentY: newY } : item
    ));

    // Collision detection with bins
    const checkBin = (ref: React.RefObject<HTMLDivElement | null>) => {
      if (!ref.current) return false;
      const binRect = ref.current.getBoundingClientRect();
      return (
        clientX > binRect.left &&
        clientX < binRect.right &&
        clientY > binRect.top &&
        clientY < binRect.bottom
      );
    };

    if (checkBin(wetBinRef)) setDragOverBin("wet");
    else if (checkBin(dryBinRef)) setDragOverBin("dry");
    else setDragOverBin(null);
  }, [draggedId, dragOffset]);

  const onDragEnd = useCallback(() => {
    if (!draggedId) return;

    const item = pile.find(i => i.id === draggedId);
    if (item && dragOverBin) {
      if (item.type === dragOverBin) {
        // Correct Sort
        addXP(5);
        setSessionXP(prev => prev + 5);
        setScore(s => s + 10);
        setPile(prev => prev.filter(i => i.id !== draggedId));
        
        // Check for level complete
        setPile(current => {
          if (current.length === 0) setGameState("prizereveal");
          return current;
        });
      } else {
        // Wrong Sort - Reset position
        setPile(prev => prev.map(i => 
          i.id === draggedId ? { ...i, currentX: i.x, currentY: i.y } : i
        ));
      }
    } else {
      // Released in void - Reset position
      setPile(prev => prev.map(i => 
        i.id === draggedId ? { ...i, currentX: i.x, currentY: i.y } : i
      ));
    }

    setDraggedId(null);
    setDragOverBin(null);
  }, [draggedId, dragOverBin, pile, addXP]);

  useEffect(() => {
    if (draggedId) {
      window.addEventListener('mousemove', onDragMove);
      window.addEventListener('mouseup', onDragEnd);
      window.addEventListener('touchmove', onDragMove);
      window.addEventListener('touchend', onDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onDragMove);
      window.removeEventListener('mouseup', onDragEnd);
      window.removeEventListener('touchmove', onDragMove);
      window.removeEventListener('touchend', onDragEnd);
    };
  }, [draggedId, onDragMove, onDragEnd]);

  const nextLevel = async () => {
    const nextLvl = level + 1;
    if (nextLvl > 5) setGameState("complete");
    else {
      setLevel(nextLvl);
      await generatePile(nextLvl);
      setGameState("playing");
    }
  };

  return (
    <div className="relative w-full md:min-h-[648px] min-h-[500px] bg-[#fdf8f3] rounded-[40px] overflow-hidden border-4 md:border-8 border-white shadow-2xl flex flex-col font-sans">
      {/* HUD Header */}
      <div className="relative z-[100] p-4 md:p-6 flex justify-between items-center bg-white/40 backdrop-blur-sm border-b border-orange-100">
        <div className="flex gap-4">
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
          <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-bold text-xs flex items-center gap-2">
            <Sparkles size={12} /> +{sessionXP} XP
          </div>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors text-slate-400">
              <Home size={24} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/sandpaper.png')]">
        {gameState === "intro" && (
          <div className="absolute inset-0 z-[200] flex items-center justify-center bg-orange-50/90 backdrop-blur-md p-8">
            <div className="text-center space-y-6 max-w-xl animate-in fade-in zoom-in-95 duration-500">
              <div className="text-9xl mb-6">♻️</div>
              <h1 className="text-5xl font-black text-orange-950 tracking-tighter">कचरा शोध (Waste Search)</h1>
              <p className="text-orange-700 text-xl font-medium leading-relaxed">
                कचरा उचलून (Drag) योग्य कचरापेटीत टाका! <br/>
                सर्व कचरा साफ करा आणि खजिना शोधा.
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
            <div ref={pileAreaRef} className="absolute inset-x-4 md:inset-x-12 inset-t-4 md:inset-t-12 h-[60%] bg-white/30 rounded-[3rem] border-4 border-dashed border-orange-200/50 shadow-inner overflow-hidden">
               {/* Hidden Prize at the bottom */}
               <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                 <div className="text-[150px] md:text-[250px] grayscale blur-[2px]">{currentPrize}</div>
               </div>

               {/* Items */}
               {pile.map((item) => (
                 <div
                   key={item.id}
                   onMouseDown={(e) => onDragStart(item.id, e)}
                   onTouchStart={(e) => onDragStart(item.id, e)}
                   style={{
                     left: `${item.currentX}%`,
                     top: `${item.currentY}%`,
                     transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${draggedId === item.id ? item.scale * 1.5 : item.scale})`,
                     zIndex: draggedId === item.id ? 500 : Math.floor(item.y),
                     touchAction: 'none'
                   }}
                   className={cn(
                     "absolute text-5xl md:text-7xl transition-transform duration-75 select-none cursor-grab active:cursor-grabbing drop-shadow-lg",
                     draggedId === item.id ? "filter drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]" : "hover:scale-110"
                   )}
                 >
                   {item.emoji}
                 </div>
               ))}
            </div>

            {/* Instruction Overlay */}
            {!draggedId && pile.length > 0 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur px-6 py-2 rounded-full border border-orange-100 shadow-xl animate-bounce">
                <p className="text-orange-900 font-black text-sm uppercase tracking-widest italic">कचरा ओढून पेटीत टाका! (Drag to sort)</p>
              </div>
            )}

            {/* Bins Area - Bottom 40% */}
            <div className="absolute bottom-0 left-0 right-0 h-[40%] flex items-center justify-center gap-4 md:gap-12 px-4 md:px-12 pointer-events-none">
              <div 
                ref={wetBinRef}
                className={cn(
                  "pointer-events-auto relative flex-1 max-w-[160px] md:max-w-[250px] h-40 md:h-56 bg-emerald-500 rounded-[40px] p-4 transition-all shadow-2xl border-b-8 border-emerald-700 flex flex-col items-center justify-center gap-2",
                  dragOverBin === "wet" ? "scale-110 ring-8 ring-emerald-400 brightness-110" : "hover:scale-105"
                )}
              >
                <div className="text-4xl md:text-7xl">🥬</div>
                <p className="font-black text-white text-xs md:text-xl uppercase tracking-tighter">ओला कचरा (Wet)</p>
                <div className="absolute -top-4 -right-4 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center text-xl md:text-2xl shadow-lg border-2 border-emerald-100">🟢</div>
              </div>

              <div 
                ref={dryBinRef}
                className={cn(
                  "pointer-events-auto relative flex-1 max-w-[160px] md:max-w-[250px] h-40 md:h-56 bg-blue-500 rounded-[40px] p-4 transition-all shadow-2xl border-b-8 border-blue-700 flex flex-col items-center justify-center gap-2",
                  dragOverBin === "dry" ? "scale-110 ring-8 ring-blue-400 brightness-110" : "hover:scale-105"
                )}
              >
                <div className="text-4xl md:text-7xl">📄</div>
                <p className="font-black text-white text-xs md:text-xl uppercase tracking-tighter">सुका कचरा (Dry)</p>
                <div className="absolute -top-4 -right-4 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center text-xl md:text-2xl shadow-lg border-2 border-blue-100">🔵</div>
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
                 <h2 className="text-6xl font-black text-orange-950 tracking-tighter italic">खजिना सापडला!</h2>
                 <p className="text-orange-900 text-2xl font-bold">तुम्ही परिसर स्वच्छ केला आहे! ✨</p>
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
              <h1 className="text-6xl font-black text-slate-900 tracking-tighter italic uppercase">Mission Accomplished!</h1>
              <p className="text-emerald-700 text-2xl font-bold">तुम्ही सर्व कचऱ्याचे ढिगारे साफ केले आहेत!</p>
              
              <div className="bg-white p-8 rounded-[40px] shadow-2xl border-4 border-emerald-100 space-y-4 min-w-[320px]">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Total Score</p>
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
      </div>
    </div>
  );
}
