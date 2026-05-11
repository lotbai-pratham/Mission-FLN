'use client';

import React, { useState, useCallback } from 'react';
import { usePoints } from '@/lib/points-store';
import GameHeader from '@/components/games/GameHeader';
import { 
  Dices, CheckCircle2, XCircle, HelpCircle, 
  Trophy, RotateCcw, Users, Plus, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── TYPES & DATA ──────────────────────────────────────────────────────────────

type ChallengeType = 'math' | 'marathi' | 'logic';

interface Question {
  id: string;
  type: ChallengeType;
  prompt: string;
  hint: string;
  options: string[];
  answer: string;
}

interface Player {
  id: number;
  name: string;
  pos: number;
  color: string;
  twColor: string;
}

const PLAYER_COLORS = [
  { hex: '#3B82F6', tw: 'bg-blue-500' }, // Blue
  { hex: '#EF4444', tw: 'bg-red-500' },  // Red
  { hex: '#22C55E', tw: 'bg-green-500' },// Green
  { hex: '#EAB308', tw: 'bg-yellow-500' }// Yellow
];

const SNAKES: Record<number, number> = {
  16: 6, 46: 25, 49: 11, 54: 34, 62: 19, 64: 60, 87: 24, 92: 73, 95: 75, 98: 79
};

const LADDERS: Record<number, number> = {
  1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 50: 93, 51: 67, 71: 91, 80: 100
};

// SVG Coordinate Helper
const getCellCenter = (index: number) => {
  if (index < 1 || index > 100) return { x: 5, y: 95 }; // fallback
  const row = Math.floor((index - 1) / 10); // 0 (bottom) to 9 (top)
  const isEvenRow = row % 2 === 0;
  const col = isEvenRow ? (index - 1) % 10 : 9 - ((index - 1) % 10);
  return {
    x: (col * 10) + 5,
    y: (9 - row) * 10 + 5
  };
};

// ── COMPONENT ────────────────────────────────────────────────────────────────

export default function GyanSidi() {
  const { addXP } = usePoints();
  
  // Game State
  const [phase, setPhase] = useState<'setup' | 'idle' | 'question' | 'won'>('setup');
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: 'Player 1', pos: 0, color: PLAYER_COLORS[0].hex, twColor: PLAYER_COLORS[0].tw },
    { id: 2, name: 'Player 2', pos: 0, color: PLAYER_COLORS[1].hex, twColor: PLAYER_COLORS[1].tw }
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  
  const [diceValue, setDiceValue] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [moving, setMoving] = useState(false);
  
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [triggerCell, setTriggerCell] = useState<{ pos: number; type: 'snake' | 'ladder' } | null>(null);
  const [message, setMessage] = useState('Welcome! Setup players to begin.');

  const currentPlayer = players[currentPlayerIndex];

  // ── Utils ──────────────────────────────────────────────────────────────────

  const generateQuestion = useCallback((): Question => {
    const types: ChallengeType[] = ['math', 'marathi', 'logic'];
    const type = types[Math.floor(Math.random() * types.length)];
    const id = Math.random().toString(36).substr(2, 9);

    if (type === 'math') {
      const a = Math.floor(Math.random() * 20) + 5;
      const b = Math.floor(Math.random() * 15) + 2;
      const op = Math.random() > 0.5 ? '+' : '-';
      const ans = op === '+' ? a + b : a - b;
      const prompt = `${a} ${op} ${b} = ?`;
      const options = [ans, ans + 2, ans - 3, ans + 5].sort(() => Math.random() - 0.5).map(String);
      return { id, type, prompt, hint: 'व्यवस्थित बेरीज किंवा वजाबाकी करा', options, answer: String(ans) };
    } 
    
    if (type === 'marathi') {
      const words = [
        { q: 'क + ा = ?', a: 'का', o: ['की', 'कु', 'के'] },
        { q: 'म + ी = ?', a: 'मी', o: ['मा', 'मु', 'मो'] },
        { q: 'स + ो = ?', a: 'सो', o: ['सा', 'से', 'सौ'] },
        { q: 'त + ु = ?', a: 'तु', o: ['ता', 'ती', 'ते'] },
      ];
      const selected = words[Math.floor(Math.random() * words.length)];
      return { 
        id, type, prompt: selected.q, hint: 'मात्रा ओळखा', 
        options: [selected.a, ...selected.o].sort(() => Math.random() - 0.5), 
        answer: selected.a 
      };
    }

    const patterns = [
      { q: '2, 4, 6, ?', a: '8', o: ['7', '9', '10'] },
      { q: 'A, B, A, ?', a: 'B', o: ['A', 'C', 'D'] },
      { q: 'पाच नंतर काय येते?', a: 'सहा', o: ['चार', 'सात', 'आठ'] },
    ];
    const selected = patterns[Math.floor(Math.random() * patterns.length)];
    return { 
      id, type, prompt: selected.q, hint: 'क्रम ओळखा',
      options: [selected.a, ...selected.o].sort(() => Math.random() - 0.5),
      answer: selected.a
    };
  }, []);

  // ── Setup Phase ────────────────────────────────────────────────────────────
  
  const addPlayer = () => {
    if (players.length >= 4) return;
    const newId = Math.max(...players.map(p => p.id), 0) + 1;
    const colorObj = PLAYER_COLORS[players.length];
    setPlayers([...players, { id: newId, name: `Player ${newId}`, pos: 0, color: colorObj.hex, twColor: colorObj.tw }]);
  };

  const removePlayer = (id: number) => {
    if (players.length <= 1) return;
    setPlayers(players.filter(p => p.id !== id));
  };

  const updatePlayerName = (id: number, name: string) => {
    setPlayers(players.map(p => p.id === id ? { ...p, name } : p));
  };

  const startGame = () => {
    if (players.length === 0) return;
    setPhase('idle');
    setCurrentPlayerIndex(0);
    setMessage(`${players[0].name}'s Turn! Roll the dice.`);
  };

  // ── Game Logic ─────────────────────────────────────────────────────────────

  const nextTurn = (customMessage?: string) => {
    const nextIdx = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(nextIdx);
    setMessage(customMessage || `${players[nextIdx].name}'s Turn!`);
  };

  const rollDice = () => {
    if (rolling || moving || phase !== 'idle') return;
    setRolling(true);
    setDiceValue(Math.floor(Math.random() * 6) + 1); // visual flutter
    
    setTimeout(() => {
      setRolling(false);
      const val = Math.floor(Math.random() * 6) + 1;
      setDiceValue(val);
      processMove(val);
    }, 800);
  };

  const updateCurrentPlayerPos = (newPos: number) => {
    setPlayers(prev => prev.map((p, i) => i === currentPlayerIndex ? { ...p, pos: newPos } : p));
  };

  const processMove = async (steps: number) => {
    setMoving(true);
    let currentPos = currentPlayer.pos;
    const targetPos = Math.min(currentPos + steps, 100);

    // Step animation
    for (let i = currentPos + 1; i <= targetPos; i++) {
      updateCurrentPlayerPos(i);
      await new Promise(r => setTimeout(r, 200));
    }

    setMoving(false);

    // Check rules
    if (SNAKES[targetPos]) {
      setTriggerCell({ pos: targetPos, type: 'snake' });
      setActiveQuestion(generateQuestion());
      setPhase('question');
      setMessage(`Oh no ${currentPlayer.name}! Snake bite. Answer to survive!`);
    } else if (LADDERS[targetPos]) {
      setTriggerCell({ pos: targetPos, type: 'ladder' });
      setActiveQuestion(generateQuestion());
      setPhase('question');
      setMessage(`Ladder found ${currentPlayer.name}! Answer to climb!`);
    } else if (targetPos === 100) {
      setPhase('won');
      setMessage(`🎉 ${currentPlayer.name} WINS! 🎉`);
      addXP(100);
    } else {
      nextTurn();
    }
  };

  const handleAnswer = (choice: string) => {
    if (!activeQuestion || !triggerCell) return;
    
    const isCorrect = choice === activeQuestion.answer;
    let nextMsg = '';

    if (isCorrect) {
      addXP(20);
      if (triggerCell.type === 'ladder') {
        const top = LADDERS[triggerCell.pos];
        updateCurrentPlayerPos(top);
        nextMsg = `Correct! ${currentPlayer.name} climbed the ladder.`;
        if (top === 100) {
          setPhase('won');
          setMessage(`🎉 ${currentPlayer.name} WINS! 🎉`);
          setActiveQuestion(null);
          setTriggerCell(null);
          return;
        }
      } else {
        nextMsg = `Lucky! ${currentPlayer.name} escaped the snake.`;
      }
    } else {
      if (triggerCell.type === 'snake') {
        const tail = SNAKES[triggerCell.pos];
        updateCurrentPlayerPos(tail);
        nextMsg = `Wrong! ${currentPlayer.name} slid down the snake.`;
      } else {
        nextMsg = `Wrong! ${currentPlayer.name} missed the ladder.`;
      }
    }
    
    setPhase('idle');
    setActiveQuestion(null);
    setTriggerCell(null);
    nextTurn(nextMsg);
  };

  const resetGame = () => {
    setPlayers(players.map(p => ({ ...p, pos: 0 })));
    setDiceValue(1);
    setRolling(false);
    setMoving(false);
    setPhase('setup');
    setMessage('Welcome! Setup players to begin.');
  };

  // ── Visual Overlays (Snakes & Ladders) ───────────────────────────────────

  const renderOverlays = () => {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 drop-shadow-lg">
        {/* LADDERS */}
        {Object.entries(LADDERS).map(([start, end], i) => {
          const s = getCellCenter(Number(start));
          const e = getCellCenter(end);
          return (
            <g key={`ladder-${i}`}>
              <line x1={`${s.x}%`} y1={`${s.y}%`} x2={`${e.x}%`} y2={`${e.y}%`} stroke="#8B4513" strokeWidth="12" strokeLinecap="round" opacity="0.8" />
              <line x1={`${s.x - 2}%`} y1={`${s.y + 2}%`} x2={`${e.x - 2}%`} y2={`${e.y + 2}%`} stroke="#A0522D" strokeWidth="3" strokeLinecap="round" />
              <line x1={`${s.x + 2}%`} y1={`${s.y - 2}%`} x2={`${e.x + 2}%`} y2={`${e.y - 2}%`} stroke="#A0522D" strokeWidth="3" strokeLinecap="round" />
              {/* Rungs */}
              {[0.2, 0.4, 0.6, 0.8].map(ratio => (
                <line 
                  key={ratio}
                  x1={`${s.x + (e.x - s.x)*ratio - 2}%`} y1={`${s.y + (e.y - s.y)*ratio + 2}%`}
                  x2={`${s.x + (e.x - s.x)*ratio + 2}%`} y2={`${s.y + (e.y - s.y)*ratio - 2}%`}
                  stroke="#DEB887" strokeWidth="4" 
                />
              ))}
            </g>
          );
        })}
        {/* SNAKES */}
        {Object.entries(SNAKES).map(([start, end], i) => {
          const s = getCellCenter(Number(start)); // Head
          const e = getCellCenter(end); // Tail
          // Create a curvy path using bezier curve
          const midX = (s.x + e.x) / 2 + (Math.random() * 10 - 5);
          const midY = (s.y + e.y) / 2 + (Math.random() * 10 - 5);
          return (
            <g key={`snake-${i}`}>
              <path 
                d={`M ${s.x} ${s.y} Q ${midX} ${midY} ${e.x} ${e.y}`} 
                stroke="#22C55E" strokeWidth="8" fill="none" strokeLinecap="round" 
                className="drop-shadow-md"
              />
              <path 
                d={`M ${s.x} ${s.y} Q ${midX} ${midY} ${e.x} ${e.y}`} 
                stroke="#166534" strokeWidth="2" strokeDasharray="4 4" fill="none" 
              />
              {/* Snake Head marker */}
              <circle cx={`${s.x}%`} cy={`${s.y}%`} r="3" fill="#EF4444" />
              <text x={`${s.x}%`} y={`${s.y + 1}%`} fontSize="4" textAnchor="middle" fill="#000">🐍</text>
            </g>
          );
        })}
      </svg>
    );
  };

  const renderCells = () => {
    const cells = [];
    for (let r = 9; r >= 0; r--) {
      for (let c = 0; c < 10; c++) {
        const index = r % 2 === 0 ? r * 10 + c + 1 : r * 10 + (9 - c) + 1;
        
        // Find players on this cell
        const occupants = players.filter(p => p.pos === index);

        cells.push(
          <div 
            key={index} 
            className={cn(
              "relative w-full aspect-square border-[1px] border-clay/50 flex flex-wrap items-center justify-center p-0.5 gap-0.5",
              (r + c) % 2 === 0 ? "bg-[#E2725B]/20" : "bg-[#CC7722]/10"
            )}
          >
            <span className="absolute top-0.5 left-0.5 text-[8px] md:text-[10px] opacity-40 font-bold">{index}</span>
            
            {/* Player Tokens */}
            {occupants.map(p => (
              <div 
                key={p.id}
                className={cn(
                  "z-20 w-3 h-3 md:w-5 md:h-5 rounded-full shadow-lg border-2 border-white transition-all duration-300",
                  p.twColor,
                  (moving && p.id === currentPlayer.id) && "animate-bounce scale-125"
                )}
                title={p.name}
              />
            ))}
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="max-w-5xl mx-auto p-4 flex flex-col items-center">
      <GameHeader title="ज्ञानशिडी (GyanSidi Multiplayer)" score={0} total={0} />

      {phase === 'setup' ? (
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 animate-in zoom-in-95">
          <div className="text-center space-y-2">
            <Users className="w-12 h-12 text-[#CC7722] mx-auto mb-2" />
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">Player Setup</h2>
            <p className="text-sm text-slate-500">Enter names for up to 4 players</p>
          </div>

          <div className="space-y-3">
            {players.map((p, idx) => (
              <div key={p.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">
                <div className={cn("w-6 h-6 rounded-full shadow-inner", p.twColor)} />
                <input 
                  type="text" 
                  value={p.name}
                  onChange={(e) => updatePlayerName(p.id, e.target.value)}
                  className="flex-1 bg-transparent text-sm font-bold outline-none dark:text-white"
                  placeholder={`Player ${idx + 1}`}
                  maxLength={12}
                />
                {players.length > 1 && (
                  <button onClick={() => removePlayer(p.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {players.length < 4 && (
            <button 
              onClick={addPlayer}
              className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 rounded-xl hover:border-[#CC7722] hover:text-[#CC7722] transition-colors flex items-center justify-center gap-2 text-sm font-bold"
            >
              <Plus className="w-4 h-4" /> Add Player
            </button>
          )}

          <button 
            onClick={startGame}
            disabled={players.length === 0}
            className="w-full py-4 bg-gradient-to-r from-[#CC7722] to-[#E2725B] text-white font-black rounded-xl shadow-xl hover:shadow-2xl active:scale-95 transition-all text-lg"
          >
            START GAME
          </button>
        </div>
      ) : (
        <div className="w-full grid lg:grid-cols-4 gap-8 items-start">
          
          {/* LEFT: Game Controls & Players */}
          <div className="lg:col-span-1 space-y-4 order-2 lg:order-1">
            
            <div className={cn(
              "bg-slate-900 border-2 rounded-3xl p-6 shadow-2xl text-center space-y-6 relative overflow-hidden transition-colors duration-500",
              phase === 'idle' ? "border-[#CC7722]" : "border-slate-800"
            )}>
               <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 blur-3xl -mr-12 -mt-12" />
               
               <div className="space-y-1">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Status</p>
                  <p className="text-white font-bold leading-tight text-sm">{message}</p>
               </div>

               {/* Dice Area */}
               <div className="flex flex-col items-center gap-4">
                  <div className={cn(
                    "w-20 h-20 rounded-2xl bg-white shadow-2xl flex items-center justify-center transition-all duration-300",
                    rolling && "animate-spin scale-110",
                    moving && "opacity-50 grayscale"
                  )}>
                     <div className="grid grid-cols-3 gap-1.5 p-2">
                        {Array.from({ length: diceValue }).map((_, i) => (
                          <div key={i} className="w-3 h-3 bg-slate-900 rounded-full" />
                        ))}
                     </div>
                  </div>
                  
                  <button 
                    onClick={rollDice}
                    disabled={rolling || moving || phase !== 'idle'}
                    className={cn(
                      "w-full py-3 rounded-xl font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl",
                      (rolling || moving || phase !== 'idle') 
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                        : "bg-[#CC7722] hover:bg-[#E2725B] text-white"
                    )}
                  >
                    <Dices className="w-5 h-5" /> ROLL
                  </button>
               </div>
            </div>

            {/* Players List */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-4 shadow-sm space-y-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 text-center">Scoreboard</h4>
              {players.map((p, idx) => (
                <div 
                  key={p.id} 
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-xl border-2 transition-all",
                    idx === currentPlayerIndex 
                      ? `border-current bg-slate-50 dark:bg-slate-900` 
                      : "border-transparent opacity-70"
                  )}
                  style={{ color: idx === currentPlayerIndex ? p.color : 'inherit' }}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn("w-4 h-4 rounded-full shadow-sm", p.twColor)} />
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{p.name}</span>
                  </div>
                  <span className="text-xs font-black bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-md text-slate-600 dark:text-slate-300">
                    {p.pos}
                  </span>
                </div>
              ))}
            </div>

            <button onClick={resetGame} className="w-full text-slate-400 hover:text-slate-600 dark:hover:text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 py-2">
               <RotateCcw className="w-3 h-3" /> End Game & Reset
            </button>
          </div>

          {/* CENTER: The Board */}
          <div className="lg:col-span-3 order-1 lg:order-2">
             <div className="bg-[#633A34] p-3 md:p-6 rounded-[24px] md:rounded-[40px] shadow-2xl relative w-full aspect-square max-h-[800px] max-w-[800px] mx-auto">
                {/* Board Grid */}
                <div className="w-full h-full relative border-4 border-[#633A34] rounded-xl overflow-hidden bg-white/90">
                   <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
                     {renderCells()}
                   </div>
                   
                   {/* Draw Snakes and Ladders Overlays */}
                   {renderOverlays()}
                </div>

                {/* Victory Overlay */}
                {phase === 'won' && (
                  <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center z-50 rounded-[24px] md:rounded-[40px] animate-in fade-in duration-700">
                     <div className="w-24 h-24 bg-yellow-400 rounded-3xl flex items-center justify-center shadow-2xl animate-bounce mb-6">
                        <Trophy className="w-12 h-12 text-white" />
                     </div>
                     <h2 className="text-4xl font-black text-white mb-2 text-center px-4">{currentPlayer.name} Wins!</h2>
                     <p className="text-slate-400 mb-8 text-center px-4">Congratulations on mastering the GyanSidi!</p>
                     <button 
                      onClick={resetGame}
                      className="px-8 py-4 bg-[#CC7722] text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all"
                     >
                       Play Again
                     </button>
                  </div>
                )}

                {/* Question Overlay */}
                {phase === 'question' && activeQuestion && (
                  <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md flex items-center justify-center z-50 p-4 rounded-[24px] md:rounded-[40px] animate-in zoom-in duration-300">
                     <div className="max-w-sm w-full bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 text-center border-t-8 border-[#CC7722]">
                        <div className="flex items-center justify-center gap-2 text-[#CC7722]">
                           <HelpCircle className="w-5 h-5" />
                           <span className="font-black uppercase tracking-widest text-xs">{activeQuestion.type} Challenge</span>
                        </div>

                        <div className="space-y-2">
                           <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                              {activeQuestion.prompt}
                           </h3>
                           <p className="text-slate-400 text-xs italic">"{activeQuestion.hint}"</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                           {activeQuestion.options.map((opt, i) => (
                             <button 
                               key={i}
                               onClick={() => handleAnswer(opt)}
                               className="py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-xl font-black text-slate-900 dark:text-white rounded-xl hover:border-[#CC7722] hover:bg-[#CC7722]/10 transition-all active:scale-95"
                             >
                                {opt}
                             </button>
                           ))}
                        </div>
                     </div>
                  </div>
                )}
             </div>
          </div>

        </div>
      )}
    </div>
  );
}
