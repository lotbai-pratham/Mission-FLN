'use client';
import { useState, useEffect } from 'react';
import { Package, Swords } from 'lucide-react';
import CompetitiveArena from './CompetitiveArena';
import { cn } from '@/lib/utils';
import { recordBattleResult } from '@/app/actions';
import { useLanguage } from '@/context/LanguageContext';
import { useNonRepeatingGenerator } from '@/lib/game-utils';

function newTarget() {
  // Two-digit numbers only: tens 1–9, ones 0–9
  const tens = Math.floor(Math.random() * 9) + 1;
  const ones = Math.floor(Math.random() * 10);
  return { tens, ones, value: tens * 10 + ones };
}

interface PlayerBoardProps {
  color: 'indigo' | 'violet';
  bundles: number;
  sticks: number;
  target: { tens: number; ones: number; value: number };
  feedback: 'idle' | 'success' | 'error';
  disabled: boolean;
  onBundle: () => void;
  onStick: () => void;
  onRemoveBundle: () => void;
  onRemoveStick: () => void;
}

function PlayerBoard({ color, bundles, sticks, target, feedback, disabled, onBundle, onStick, onRemoveBundle, onRemoveStick }: PlayerBoardProps) {
  const { t, tNum } = useLanguage();
  const c = color === 'indigo'
    ? { bg: 'bg-indigo-600', light: 'bg-indigo-500/20', border: 'border-indigo-500', text: 'text-indigo-400', label: t('Team A') }
    : { bg: 'bg-violet-600', light: 'bg-violet-500/20', border: 'border-violet-500', text: 'text-violet-400', label: t('Team B') };

  const correct = bundles === target.tens && sticks === target.ones;

  return (
    <div className={cn(
      'flex-1 p-6 flex flex-col items-center gap-4 transition-all',
      feedback === 'success' ? `${c.light} border-l border-r ${c.border}` :
      feedback === 'error' ? 'bg-red-600/10' : 'bg-slate-900/40'
    )}>
      <div className={cn('text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full', c.light, c.text)}>
        {c.label}
      </div>

      {/* Bundles row */}
      <div className="w-full space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{t('Bundles (Tens)')}</span>
          <span className={cn('font-black text-lg', c.text)}>{tNum(bundles)}</span>
        </div>
        <div className="min-h-[60px] bg-white/5 rounded-2xl p-2 flex flex-wrap gap-2 items-center">
          {Array.from({ length: bundles }).map((_, i) => (
            <div key={i} className="w-8 h-12 bg-orange-400 border-2 border-orange-500 rounded relative flex items-center justify-center shadow">
              <div className="w-full h-1 bg-blue-500 absolute top-1/2 -translate-y-1/2" />
              <span className="text-[8px] font-black text-white absolute bottom-0.5">{tNum(10)}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={onBundle} disabled={disabled || bundles >= 9}
            className={cn('flex-1 py-2 rounded-xl text-xs font-black text-white transition-all active:scale-95', c.bg, 'disabled:opacity-30')}>
            {t('+ Bundle')}
          </button>
          <button onClick={onRemoveBundle} disabled={disabled || bundles === 0}
            className="w-10 py-2 rounded-xl text-xs font-black bg-white/10 text-slate-300 transition-all active:scale-95 disabled:opacity-30">
            −
          </button>
        </div>
      </div>

      {/* Sticks row */}
      <div className="w-full space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{t('Sticks (Ones)')}</span>
          <span className={cn('font-black text-lg', c.text)}>{tNum(sticks)}</span>
        </div>
        <div className="min-h-[48px] bg-white/5 rounded-2xl p-2 flex flex-wrap gap-1 items-center">
          {Array.from({ length: sticks }).map((_, i) => (
            <div key={i} className="w-2.5 h-10 bg-orange-200 border border-orange-400 rounded-full" />
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={onStick} disabled={disabled || sticks >= 9}
            className={cn('flex-1 py-2 rounded-xl text-xs font-black text-white transition-all active:scale-95', c.bg, 'disabled:opacity-30')}>
            {t('+ Stick')}
          </button>
          <button onClick={onRemoveStick} disabled={disabled || sticks === 0}
            className="w-10 py-2 rounded-xl text-xs font-black bg-white/10 text-slate-300 transition-all active:scale-95 disabled:opacity-30">
            −
          </button>
        </div>
      </div>

      {/* Number display */}
      <div className={cn(
        'w-full py-3 rounded-2xl text-center font-black text-3xl border-2 transition-all',
        correct ? `${c.border} ${c.text} ${c.light}` : 'border-white/10 text-white/30'
      )}>
        {tNum(bundles * 10 + sticks)}
      </div>
    </div>
  );
}

export default function TiliBundleDuel({ player1, player2, schoolId, classNum, onClose }: any) {
  const { t, tNum } = useLanguage();

  const { generateUnique } = useNonRepeatingGenerator(
    () => {
      const tens = Math.floor(Math.random() * 9) + 1;
      const ones = Math.floor(Math.random() * 10);
      return { tens, ones, value: tens * 10 + ones };
    },
    (item) => `${item.value}`
  );

  const [target, setTarget] = useState(() => generateUnique());
  const [aB, setAB] = useState(0); const [aS, setAS] = useState(0);
  const [bB, setBB] = useState(0); const [bS, setBS] = useState(0);
  const [fbA, setFbA] = useState<'idle' | 'success' | 'error'>('idle');
  const [fbB, setFbB] = useState<'idle' | 'success' | 'error'>('idle');

  const checkA = (nb: number, ns: number, addPoint: (t: 'A' | 'B') => void) => {
    if (nb === target.tens && ns === target.ones) {
      setFbA('success'); addPoint('A');
      setTimeout(() => { const t = generateUnique(); setTarget(t); setAB(0); setAS(0); setFbA('idle'); }, 800);
    }
  };
  const checkB = (nb: number, ns: number, addPoint: (t: 'A' | 'B') => void) => {
    if (nb === target.tens && ns === target.ones) {
      setFbB('success'); addPoint('B');
      setTimeout(() => { const t = generateUnique(); setTarget(t); setBB(0); setBS(0); setFbB('idle'); }, 800);
    }
  };

  const handleEnd = async (winner: 'A' | 'B' | 'Draw', _scores: any) => {
    if (!player1 || !player2 || !schoolId) return;
    await recordBattleResult({
      schoolId, classNum: classNum || 3, subject: 'numeracy', level: 2,
      gameSlug: 'tili-bundle-duel',
      player1Id: player1.id, player2Id: player2.id,
      winnerId: winner === 'A' ? player1.id : winner === 'B' ? player2.id : null
    });
  };

  return (
    <CompetitiveArena
      title={t("Tili Bundle Duel")}
      description={t("Make the number using bundles and sticks!")}
      icon={<Package className="w-10 h-10 text-white" />}
      duration={90}
      player1={player1}
      player2={player2}
      onClose={onClose}
      onGameEnd={handleEnd}
    >
      {({ gameState, addPoint }) => (
        <div className="flex-1 flex flex-col gap-4">
          {/* Target number */}
          <div className="flex justify-center">
            <div className="bg-yellow-400 text-black px-10 py-3 rounded-[32px] font-black text-center">
              <div className="text-[10px] uppercase tracking-widest opacity-60">{t("Make the Number")}</div>
              <div className="text-5xl">{tNum(target.value)}</div>
              <div className="text-xs opacity-60">{tNum(target.tens)} {t("Tens")} + {tNum(target.ones)} {t("Ones")}</div>
            </div>
          </div>

          <div className="flex-1 flex gap-px bg-white/5 overflow-hidden rounded-[40px] border border-white/5">
            <PlayerBoard color="indigo" bundles={aB} sticks={aS} target={target} feedback={fbA}
              disabled={gameState !== 'running'}
              onBundle={() => { const nb = aB + 1; setAB(nb); checkA(nb, aS, addPoint); }}
              onStick={() => { const ns = aS + 1; setAS(ns); checkA(aB, ns, addPoint); }}
              onRemoveBundle={() => setAB(v => Math.max(0, v - 1))}
              onRemoveStick={() => setAS(v => Math.max(0, v - 1))} />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-slate-950 rounded-full border border-white/10 shadow-2xl z-10">
              <Swords className="w-8 h-8 text-yellow-500 animate-bounce" />
            </div>

            <PlayerBoard color="violet" bundles={bB} sticks={bS} target={target} feedback={fbB}
              disabled={gameState !== 'running'}
              onBundle={() => { const nb = bB + 1; setBB(nb); checkB(nb, bS, addPoint); }}
              onStick={() => { const ns = bS + 1; setBS(ns); checkB(bB, ns, addPoint); }}
              onRemoveBundle={() => setBB(v => Math.max(0, v - 1))}
              onRemoveStick={() => setBS(v => Math.max(0, v - 1))} />
          </div>
        </div>
      )}
    </CompetitiveArena>
  );
}

