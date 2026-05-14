"use client";
import React, { use, Suspense } from "react";
import { ALL } from "@/lib/sim-data";
import { usePoints } from "@/lib/points-store";
import { useRouter } from "next/navigation";
import { ArrowLeft, Gamepad2, Info } from "lucide-react";
import Link from "next/link";
import GameWrapper from "@/components/games/GameWrapper";

export default function DirectPlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const game = ALL.find(g => g.id === id);

  if (!game) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-white p-12 rounded-[40px] shadow-2xl border-4 border-slate-100 max-w-md">
          <div className="text-8xl mb-6">🏜️</div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Game Not Found</h1>
          <p className="text-slate-500 mt-4 font-medium">The game link you're using seems to be broken or the game has been moved.</p>
          <Link 
            href="/resources/simulations"
            className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all"
          >
            <Gamepad2 size={20} /> Browse Arcade
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-[9999] flex flex-col overflow-hidden">
      {/* Minimalistic Top Bar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-xl shadow-sm">
            {game.emoji}
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 leading-none">{game.title}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Direct Play Mode</p>
          </div>
        </div>
        
        <Link 
          href="/resources/simulations"
          className="flex items-center gap-2 text-slate-400 hover:text-orange-500 transition-colors text-xs font-bold bg-slate-50 px-4 py-2 rounded-xl"
        >
          <ArrowLeft size={14} /> Full Arcade
        </Link>
      </div>

      {/* Full Screen Game Area */}
      <div className="flex-1 relative overflow-auto bg-slate-50 flex items-center justify-center">
         <div className="w-full h-full max-w-7xl mx-auto md:p-8 p-0 flex flex-col items-center justify-center">
            <Suspense fallback={
              <div className="flex flex-col items-center gap-4 animate-pulse">
                <div className="w-20 h-20 bg-slate-200 rounded-3xl" />
                <div className="h-4 w-32 bg-slate-200 rounded-full" />
              </div>
            }>
              <GameWrapper
                title={game.title}
                emoji={game.emoji}
                instructions={game.instructions}
                accentColor={game.accentColor as any}
              >
                {game.component({ 
                  isDirect: true, 
                  onClose: () => router.push('/resources/simulations') 
                })}
              </GameWrapper>
            </Suspense>
         </div>
      </div>

      {/* Subtle Footer */}
      <div className="bg-white border-t border-slate-100 px-4 py-2 flex justify-center items-center shrink-0">
         <p className="text-[9px] font-black text-slate-300 uppercase tracking-[4px]">Powered by FLN Hub Arcade</p>
      </div>
    </div>
  );
}
