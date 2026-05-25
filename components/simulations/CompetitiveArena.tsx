'use client';
import { useState, useEffect, ReactNode } from 'react';
import { Timer, Trophy, Users, RotateCcw, Play, Swords, Star, Medal, X } from 'lucide-react';
import { cn } from "@/lib/utils";

type GameState = 'waiting' | 'running' | 'finished';

interface CompetitiveArenaProps {
  title: string;
  description: string;
  icon: ReactNode;
  duration?: number;
  player1?: { id: string; name: string } | null;
  player2?: { id: string; name: string } | null;
  onClose?: () => void;
  onGameEnd?: (winner: 'A' | 'B' | 'Draw', scores: { a: number, b: number }) => void;
  children: (props: {
    gameState: GameState;
    addPoint: (team: 'A' | 'B') => void;
    scores: { a: number; b: number };
  }) => ReactNode;
}

export default function CompetitiveArena({
  title,
  description,
  icon,
  duration = 60,
  player1,
  player2,
  onClose,
  onGameEnd,
  children
}: CompetitiveArenaProps) {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [timeLeft, setTimeLeft] = useState(duration);
  const [scores, setScores] = useState({ a: 0, b: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleFinish = async (winner: 'A' | 'B' | 'Draw', finalScores: { a: number, b: number }) => {
    setGameState('finished');
    if (onGameEnd) {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);
      try {
        await onGameEnd(winner, finalScores);
        setSubmitSuccess(true);
      } catch (err: any) {
        console.error(err);
        setSubmitError(err.message || 'Failed to save battle log');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'running' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'running') {
      const winner = scores.a > scores.b ? 'A' : scores.b > scores.a ? 'B' : 'Draw';
      handleFinish(winner, scores);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, scores]);

  const startGame = () => {
    setScores({ a: 0, b: 0 });
    setTimeLeft(duration);
    setGameState('running');
    setSubmitSuccess(false);
    setSubmitError(null);
  };

  const addPoint = (team: 'A' | 'B') => {
    if (gameState !== 'running') return;
    setScores(prev => ({ ...prev, [team.toLowerCase()]: prev[team.toLowerCase() as 'a' | 'b'] + 1 }));
  };

  const p1Name = player1?.name ?? 'Player 1';
  const p2Name = player2?.name ?? 'Player 2';
  const winner = scores.a > scores.b ? p1Name : scores.b > scores.a ? p2Name : 'Draw';

  return (
    <div className="bg-slate-950 rounded-3xl md:rounded-[48px] border border-slate-800 shadow-2xl p-4 md:p-8 max-w-6xl mx-auto overflow-y-auto md:overflow-hidden relative md:min-h-[750px] flex flex-col text-white">
      
      {/* HUD: Timer & Title */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 mb-4 md:mb-12 relative z-10">
        <div className="flex items-center gap-4 md:gap-6">
           <div className="p-3 md:p-4 bg-blue-600 rounded-2xl md:rounded-[28px] shadow-lg shadow-blue-600/20">
              {icon}
           </div>
           <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1">
                 <Swords className="w-3 h-3" /> 2v2 Competitive Battle
              </div>
              <h2 className="text-xl md:text-3xl font-black tracking-tight">{title}</h2>
           </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end">
           <div className={cn(
             "px-6 md:px-8 py-2 md:py-4 rounded-2xl md:rounded-[32px] border-2 flex items-center gap-3 md:gap-4 transition-all",
             timeLeft <= 10 ? "bg-red-500/10 border-red-500 text-red-500 animate-pulse" : "bg-white/5 border-white/10 text-white"
           )}>
              <Timer className="w-6 h-6 md:w-8 md:h-8" />
              <span className="text-2xl md:text-4xl font-black font-mono tracking-tighter w-8 md:w-12">{timeLeft}s</span>
           </div>
           <div className="flex items-center gap-2">
              {gameState === 'running' && (
                <button 
                   onClick={() => {
                     const winner = scores.a > scores.b ? 'A' : scores.b > scores.a ? 'B' : 'Draw';
                     handleFinish(winner, scores);
                   }}
                   className="px-5 py-3 md:px-6 md:py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-[10px] md:text-xs transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-emerald-600/20 shrink-0"
                >
                   <Medal className="w-4.5 h-4.5 text-yellow-300 fill-yellow-300" /> SUBMIT & FINISH
                </button>
              )}
              <button 
                 onClick={startGame}
                 className="p-3 md:p-5 bg-white text-black hover:bg-blue-500 hover:text-white rounded-[20px] md:rounded-[28px] transition-all active:scale-90"
                 title="Restart Game"
              >
                 <RotateCcw className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              {onClose && (
                <button 
                   onClick={onClose}
                   className="p-3 md:p-5 bg-red-600/20 border border-red-600/50 text-red-500 hover:bg-red-600 hover:text-white rounded-[20px] md:rounded-[28px] transition-all active:scale-90"
                   title="Exit Arena"
                >
                   <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              )}
           </div>
        </div>
      </div>

      {/* THE ARENA */}
      <div className="flex-1 relative flex flex-col items-stretch">
         
         {/* WAIT OVERLAY */}
         {gameState === 'waiting' && (
           <div className="absolute inset-0 z-20 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="text-center space-y-2">
                 <h3 className="text-3xl md:text-5xl font-black">Ready for Battle?</h3>
                 <p className="text-slate-400 font-medium text-sm md:text-base">{description}</p>
              </div>
              <button 
                 onClick={startGame}
                 className="group px-8 md:px-12 py-4 md:py-6 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl md:rounded-[32px] shadow-2xl shadow-blue-600/40 active:scale-95 transition-all text-lg md:text-2xl flex items-center gap-4"
              >
                 START COMPETITION <Play className="w-6 h-6 md:w-8 md:h-8 fill-current" />
              </button>
              <div className="flex items-center gap-12 pt-8 opacity-40">
                 <div className="flex flex-col items-center gap-2"><Users className="w-8 h-8" /><span className="text-[10px] font-black uppercase">2 Students</span></div>
                 <div className="text-xl font-black">VS</div>
                 <div className="flex flex-col items-center gap-2"><Users className="w-8 h-8" /><span className="text-[10px] font-black uppercase">2 Students</span></div>
              </div>
           </div>
         )}

         {/* GAME RUNNING */}
         <div className={cn("flex-1 transition-all duration-700", gameState === 'waiting' ? 'blur-2xl opacity-20 scale-95 pointer-events-none' : '')}>
            {children({ gameState, addPoint, scores })}
         </div>

         {/* FINISHED OVERLAY */}
         {gameState === 'finished' && (
           <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-105 duration-1000 bg-slate-950/90 backdrop-blur-xl rounded-[40px]">
              <div className="relative">
                 <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-20 animate-pulse"></div>
                 <Trophy className="w-20 h-20 md:w-32 md:h-32 text-yellow-500 mb-4 md:mb-8 relative z-10" />
              </div>
              <h3 className="text-4xl md:text-6xl font-black mb-2 tracking-tighter">
                 {winner === 'Draw' ? "IT'S A DRAW!" : `${winner} WINS!`}
              </h3>
              <p className="text-slate-500 text-sm font-bold mb-2">{p1Name} vs {p2Name}</p>
              
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-12 mb-4 md:mb-8">
                 <div className="text-center p-4 md:p-6 bg-white/5 rounded-3xl border border-white/10 min-w-[120px] md:min-w-[180px]">
                    <div className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{p1Name}</div>
                    <div className="text-3xl md:text-5xl font-black text-blue-500">{scores.a}</div>
                 </div>
                 <div className="text-center p-4 md:p-6 bg-white/5 rounded-3xl border border-white/10 min-w-[120px] md:min-w-[180px]">
                    <div className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{p2Name}</div>
                    <div className="text-3xl md:text-5xl font-black text-emerald-500">{scores.b}</div>
                 </div>
              </div>

              {/* Submission Log */}
              <div className="mb-8 flex flex-col items-center justify-center gap-2">
                 {isSubmitting && (
                   <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
                     <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                     Submitting Battle Log Live...
                   </div>
                 )}
                 {submitSuccess && (
                   <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                     <span className="text-emerald-400">●</span>
                     ✓ Battle Saved Live to Database!
                   </div>
                 )}
                 {submitError && (
                   <div className="flex items-center gap-2 text-rose-400 text-xs font-black uppercase tracking-wider bg-rose-500/10 px-4 py-2 rounded-full border border-rose-500/20">
                     <span>⚠️</span>
                     Error: {submitError}
                   </div>
                 )}
              </div>

              <button 
                 onClick={startGame}
                 className="px-10 py-5 bg-white text-black font-black rounded-3xl hover:bg-blue-500 hover:text-white transition-all active:scale-95 text-sm md:text-base"
              >
                 REPLAY BATTLE
              </button>
           </div>
         )}
      </div>

      {/* TEAM HUD (Bottom) */}
      <div className="mt-4 md:mt-8 flex items-center justify-between pointer-events-none">
         <div className={cn("px-4 md:px-8 py-2 md:py-4 rounded-2xl md:rounded-3xl border-2 transition-all flex items-center gap-2 md:gap-4", scores.a >= scores.b ? "bg-blue-600/20 border-blue-600 text-blue-400" : "bg-white/5 border-white/10 text-white")}>
            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-blue-600"></div>
            <span className="text-[8px] md:text-xs font-black uppercase tracking-widest">{p1Name}: <span className="text-lg md:text-2xl ml-1 md:ml-2">{scores.a}</span></span>
         </div>
         <div className={cn("px-4 md:px-8 py-2 md:py-4 rounded-2xl md:rounded-3xl border-2 transition-all flex items-center gap-2 md:gap-4", scores.b >= scores.a ? "bg-emerald-600/20 border-emerald-600 text-emerald-400" : "bg-white/5 border-white/10 text-white")}>
            <span className="text-[8px] md:text-xs font-black uppercase tracking-widest">{p2Name}: <span className="text-lg md:text-2xl mr-1 md:ml-2">{scores.b}</span></span>
            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-emerald-600"></div>
         </div>
      </div>
    </div>
  );
}
