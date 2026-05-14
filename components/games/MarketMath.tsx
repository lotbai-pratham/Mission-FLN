"use client";
import React, { useState, useEffect } from 'react';
import { generateGameQuestions } from '@/app/actions/ai';
import { usePoints } from '@/lib/points-store';
import { Sparkles, ShoppingCart, Zap, Trophy } from 'lucide-react';

const ITEMS = [
  { name: 'सफरचंद', emoji: '🍎', price: 5 },
  { name: 'केळे', emoji: '🍌', price: 3 },
  { name: 'पेन्सिल', emoji: '✏️', price: 7 },
  { name: 'खोडरबर', emoji: '🩹', price: 4 },
  { name: 'पुस्तक', emoji: '📚', price: 12 },
  { name: 'बिस्किट', emoji: '🍪', price: 6 },
  { name: 'आंबा', emoji: '🥭', price: 8 },
  { name: 'वही', emoji: '📓', price: 15 },
];

type Mode = 'change' | 'total' | 'canAfford';

function makeRound() {
  const modes: Mode[] = ['change', 'total', 'canAfford'];
  const mode = modes[Math.floor(Math.random() * modes.length)];
  const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
  let question = '', answer = 0, options: number[] = [];
  let wallet = 0;

  if (mode === 'change') {
    wallet = item.price + Math.floor(Math.random() * 10) + 1;
    answer = wallet - item.price;
    question = `तुमच्याकडे ₹${wallet} आहेत. ${item.name} ₹${item.price} ला विकत घेतले. किती पैसे परत मिळतील?`;
    options = [answer, answer + 2, answer - 1 >= 0 ? answer - 1 : answer + 3].sort(() => Math.random() - 0.5);
  } else if (mode === 'total') {
    const qty = Math.floor(Math.random() * 3) + 2;
    answer = item.price * qty;
    question = `${qty} ${item.emoji} ${item.name} प्रत्येकी ₹${item.price}. एकूण किती?`;
    options = [answer, answer + item.price, answer - item.price > 0 ? answer - item.price : answer + 2 * item.price].sort(() => Math.random() - 0.5);
  } else {
    wallet = Math.floor(Math.random() * 15) + 5;
    const canBuy = Math.floor(wallet / item.price);
    answer = canBuy;
    question = `तुमच्याकडे ₹${wallet} आहेत. ${item.name} ₹${item.price} एकाला. किती ${item.name} विकत घेता येतील?`;
    options = [canBuy, canBuy + 1, Math.max(0, canBuy - 1)].sort(() => Math.random() - 0.5);
  }

  return { mode, item, question, answer, options };
}

export default function MarketMath() {
  const [round, setRound] = useState(makeRound);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [questionPool, setQuestionPool] = useState<any[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [sessionXP, setSessionXP] = useState(0);
  const { addXP } = usePoints();

  const fetchAiQuestions = async () => {
    setIsAiLoading(true);
    try {
      const questions = await generateGameQuestions('market-math', Math.floor(score/5) + 1, 5);
      if (questions && questions.length > 0) {
        setQuestionPool(prev => [...prev, ...questions]);
      }
    } catch (e) {
      console.log("AI fetch failed");
    }
    setIsAiLoading(false);
  };

  useEffect(() => {
    fetchAiQuestions();
  }, []);

  function nextRound() {
    if (questionPool.length > 0) {
      const q = questionPool[0];
      setQuestionPool(prev => prev.slice(1));
      setRound({
        mode: 'total',
        item: ITEMS[Math.floor(Math.random() * ITEMS.length)],
        question: q.q,
        answer: q.a,
        options: q.options
      });
      if (questionPool.length < 2) fetchAiQuestions();
    } else {
      setRound(makeRound());
    }
  }

  function pick(n: number) {
    if (feedback) return;
    setChosen(n);
    const correct = n === round.answer;
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
      setScore(s => s + 1);
      addXP(10);
      setSessionXP(prev => prev + 10);
    }
    setTimeout(() => {
      nextRound();
      setFeedback(null);
      setChosen(null);
    }, 1500);
  }


  return (
    <div className="w-full h-full min-h-[600px] bg-slate-50 p-4 md:p-8 rounded-[40px] border-8 border-white shadow-2xl font-sans flex flex-col">
      <div className="max-w-4xl mx-auto w-full space-y-8 flex-1 flex flex-col justify-center">
        
        {/* HUD */}
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100 shrink-0">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🛒</div>
             <div>
               <h2 className="text-xl font-black text-slate-900 tracking-tight">Market Math</h2>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Shopping Challenge</p>
             </div>
           </div>
           
           <div className="flex gap-3">
             <div className="bg-amber-50 px-6 py-3 rounded-2xl border border-amber-100 flex items-center gap-3">
               <Trophy className="text-amber-500 w-5 h-5" />
               <span className="text-xl font-black text-amber-900">{score}</span>
             </div>
             <div className="bg-yellow-100 text-yellow-700 px-4 py-3 rounded-2xl font-black flex items-center gap-2">
               <Sparkles size={16} /> +{sessionXP} XP
             </div>
           </div>
        </div>

        {/* Question Card */}
        <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-xl border-b-8 border-slate-200 relative overflow-hidden flex-1 flex flex-col justify-center min-h-[400px]">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-500" />
          
          <div className="flex flex-col items-center gap-8 text-center mb-12">
            <div className="text-9xl animate-bounce-slow filter drop-shadow-2xl">
              {round.item.emoji}
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-slate-800 leading-tight max-w-3xl tracking-tight">
              {round.question}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {round.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => pick(opt)}
                disabled={!!feedback}
                className={`
                  p-8 text-3xl font-black rounded-[30px] transition-all border-b-8 active:border-b-0 active:translate-y-2
                  ${chosen === opt 
                    ? (feedback === 'correct' ? 'bg-emerald-500 border-emerald-700 text-white scale-105' : 'bg-rose-500 border-rose-700 text-white animate-shake')
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-50 hover:-translate-y-1'
                  }
                `}
              >
                ₹{opt}
              </button>
            ))}
          </div>

          {feedback && (
            <div className={`mt-10 p-6 rounded-3xl text-center font-black text-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 ${
              feedback === 'correct' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              {feedback === 'correct' ? '🎯 शाब्बास! बरोबर उत्तर!' : `❌ ओहो! बरोबर उत्तर ₹${round.answer} होते.`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
