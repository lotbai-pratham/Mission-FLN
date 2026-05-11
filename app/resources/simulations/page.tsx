"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowLeft, Zap, Trophy, Gamepad2, ChevronRight, Eye, EyeOff, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePoints } from "@/lib/points-store";
import { useEffect } from "react";

// Simulations
import BundleBuilder from "@/components/simulations/BundleBuilder";
import NumberHunter from "@/components/simulations/NumberHunter";
import AdditionMaster from "@/components/simulations/AdditionMaster";
import SoundExplorer from "@/components/simulations/SoundExplorer";
import WordBuilder from "@/components/simulations/WordBuilder";
import SentenceArchitect from "@/components/simulations/SentenceArchitect";
import MathSprint from "@/components/simulations/MathSprint";
import SoundDuel from "@/components/simulations/SoundDuel";
import BattleMatchmaker from "@/components/simulations/BattleMatchmaker";

// Restored Missing Sims
import FractionViz from "@/components/simulations/FractionViz";
import DigitalAbacus from "@/components/simulations/DigitalAbacus";
import DivisionSim from "@/components/simulations/DivisionSim";
import EqualSharing from "@/components/simulations/EqualSharing";
import MultiplicationSim from "@/components/simulations/MultiplicationSim";
import RepeatedAddition from "@/components/simulations/RepeatedAddition";
import SankhyaChakra from "@/components/simulations/SankhyaChakra";
import TiliBundleDuel from "@/components/simulations/TiliBundleDuel";

// New 2v2 Games
import LetterFlash from "@/components/simulations/LetterFlash";
import WordRace from "@/components/simulations/WordRace";
import SentenceFill from "@/components/simulations/SentenceFill";
import MathDuel from "@/components/simulations/MathDuel";
import NumberRace from "@/components/simulations/NumberRace";
import PlaceValueBattle from "@/components/simulations/PlaceValueBattle";

// Games
import CountingStones from "@/components/games/CountingStones";
import BiggerSmaller from "@/components/games/BiggerSmaller";
import LetterPicker from "@/components/games/LetterPicker";
import OddOneOut from "@/components/games/OddOneOut";
import FishGame from "@/components/games/FishGame";
import MissingLetter from "@/components/games/MissingLetter";
import RhymeTime from "@/components/games/RhymeTime";
import TrueFalse from "@/components/games/TrueFalse";
import SentenceBuilder from "@/components/games/SentenceBuilder";
import StorySequence from "@/components/games/StorySequence";
import NumberTrain from "@/components/games/NumberTrain";
import WeightMatcher from "@/components/games/WeightMatcher";
import PlaceValue from "@/components/games/PlaceValue";
import NumberBonds from "@/components/games/NumberBonds";
import MarketMath from "@/components/games/MarketMath";
import NumberRiver from "@/components/games/NumberRiver";
import ClockReader from "@/components/games/ClockReader";
import SortingHat from "@/components/games/SortingHat";
import MatraPractice from "@/components/games/MatraPractice";
import StoryReader from "@/components/simulations/StoryReader";
import Chaudakhadi from "@/components/simulations/Chaudakhadi";
import NumberLine from "@/components/simulations/NumberLine";
import MathManiaMarket from "@/components/simulations/MathManiaMarket";
import VachanPravas from "@/components/simulations/VachanPravas";
import AksharCrush from "@/components/simulations/AksharCrush";
import MatraChakra from "@/components/simulations/MatraChakra";
import GyanSidi from "@/components/simulations/GyanSidi";
import JungleFight from "@/components/games/JungleFight";

type Item = {
  id: string;
  title: string;
  level: string;
  battleLevel?: number;
  battleSubject?: 'literacy' | 'numeracy';
  subject: string;
  emoji: string;
  component: (props: any) => React.ReactNode;
  tag?: string
};

const SIMS: Item[] = [
  // 2v2 Marathi Literacy
  { id: "marathi-letters", title: "अक्षर ओळख (Letters)", level: "Letter",     battleLevel: 1, battleSubject: "literacy",  subject: "Battle", emoji: "अ",  tag: "Marathi",   component: (p) => <LetterFlash {...p} /> },
  { id: "marathi-words",   title: "शब्द वाचन (Words)",   level: "Word",       battleLevel: 2, battleSubject: "literacy",  subject: "Battle", emoji: "📖", tag: "Marathi",   component: (p) => <WordRace {...p} /> },
  { id: "marathi-sent",    title: "वाक्य पूर्ण करा",     level: "Paragraph",  battleLevel: 3, battleSubject: "literacy",  subject: "Battle", emoji: "📝", tag: "Marathi",   component: (p) => <SentenceFill {...p} /> },

  // 2v2 Numeracy
  { id: "math-duel-b",     title: "Math Duel",           level: "Operations", battleLevel: 4, battleSubject: "numeracy",  subject: "Battle", emoji: "⚡", tag: "± / ÷",    component: (p) => <MathDuel {...p} /> },
  { id: "num-race-b",      title: "Number Race",         level: "10-99",      battleLevel: 2, battleSubject: "numeracy",  subject: "Battle", emoji: "🏁", tag: "Compare",  component: (p) => <NumberRace {...p} /> },
  { id: "pv-battle-b",     title: "Place Value Battle",  level: "100-999",    battleLevel: 3, battleSubject: "numeracy",  subject: "Battle", emoji: "🏛️", tag: "H-T-O",   component: (p) => <PlaceValueBattle {...p} /> },

  // Original Sims
  { id: "math-sprint",     title: "Math Sprint",         level: "10-99",      battleLevel: 2, battleSubject: "numeracy",  subject: "Battle", emoji: "⚡", tag: "60s Race",  component: (p) => <MathSprint {...p} /> },
  { id: "sound-duel",      title: "Sound Duel",          level: "Letter",     battleLevel: 1, battleSubject: "literacy",  subject: "Battle", emoji: "🎙️", tag: "60s Race", component: (p) => <SoundDuel {...p} /> },
  
  { id: "number-hunter",   title: "Number Hunter",      level: "1-9",        battleLevel: 1, subject: "Math",     emoji: "🔢", component: (p) => <NumberHunter {...p} /> },
  { id: "bundle-builder",  title: "Bundle Builder",     level: "10-99",      battleLevel: 2, subject: "Math",     emoji: "📦", component: (p) => <BundleBuilder {...p} /> },
  { id: "addition-master", title: "Addition Master",    level: "Operations", battleLevel: 3, subject: "Math",     emoji: "➕", component: (p) => <AdditionMaster {...p} /> },
  { id: "sound-explorer",  title: "Sound Explorer",     level: "Letter",     battleLevel: 1, subject: "Literacy", emoji: "🔊", component: (p) => <SoundExplorer {...p} /> },
  { id: "word-builder",    title: "Word Builder",       level: "Word",       battleLevel: 2, subject: "Literacy", emoji: "🔤", component: (p) => <WordBuilder {...p} /> },
  { id: "sentence-arch",    title: "Sentence Architect",  level: "Para/Story", battleLevel: 4, subject: "Literacy", emoji: "📜", component: (p) => <SentenceArchitect {...p} /> },
  { id: "chaudakhadi",      title: "चौदाखडी Chart",       level: "Letter",     battleLevel: 1, subject: "Literacy", emoji: "क", tag: "Marathi", component: (p) => <Chaudakhadi {...p} /> },
  { id: "story-reader",     title: "Story Reader",        level: "Story",      battleLevel: 4, subject: "Literacy", emoji: "📚", component: (p) => <StoryReader {...p} /> },
  { id: "number-line",      title: "Number Line",         level: "1-9",        battleLevel: 1, subject: "Math",     emoji: "📏", component: (p) => <NumberLine {...p} /> },
  { id: "math-mania-market",title: "🛒 Math Mania Market", level: "Operations", battleLevel: 4, subject: "Math",     emoji: "🛒", tag: "Ultimate", component: (p) => <MathManiaMarket {...p} /> },
  { id: "vachan-pravas",    title: "📖 Vachan Pravas",    level: "Story",      battleLevel: 4, subject: "Literacy", emoji: "📖", tag: "Ultimate", component: (p) => <VachanPravas {...p} /> },
  { id: "akshar-crush",     title: "🍬 अक्षर कँडी",       level: "Word",       battleLevel: 2, subject: "Literacy", emoji: "🍬", tag: "Marathi",  component: (p) => <AksharCrush {...p} /> },
  { id: "matra-chakra",     title: "🎡 मात्रा चक्र",       level: "Word",       battleLevel: 2, subject: "Literacy", emoji: "🎡", tag: "Marathi",  component: (p) => <MatraChakra {...p} /> },
  { id: "gyansidi",         title: "🐍 ज्ञानशिडी",       level: "Operations", battleLevel: 3, subject: "Mixed",    emoji: "🐍", tag: "Featured", component: (p) => <GyanSidi {...p} /> },
  
  // Restored
  { id: "fraction-viz",     title: "🍰 Fractions Explorer", level: "Operations", battleLevel: 4, subject: "Math",     emoji: "🍰", component: (p) => <FractionViz {...p} /> },
  { id: "digital-abacus",   title: "🧮 Digital Abacus",    level: "10-99",      battleLevel: 2, subject: "Math",     emoji: "🧮", component: (p) => <DigitalAbacus {...p} /> },
  { id: "division-sim",     title: "➗ Division Fun",       level: "Operations", battleLevel: 4, subject: "Math",     emoji: "➗", component: (p) => <DivisionSim {...p} /> },
  { id: "equal-sharing",    title: "🍎 Equal Sharing",      level: "Operations", battleLevel: 3, subject: "Math",     emoji: "🍎", component: (p) => <EqualSharing {...p} /> },
  { id: "multi-sim",        title: "✖️ Multiplier",         level: "Operations", battleLevel: 4, subject: "Math",     emoji: "✖️", component: (p) => <MultiplicationSim {...p} /> },
  { id: "repeat-add",       title: "➕ Repeated Addition",  level: "Operations", battleLevel: 3, subject: "Math",     emoji: "➕", component: (p) => <RepeatedAddition {...p} /> },
  { id: "sankhya-chakra",   title: "☸️ संख्या चक्र",       level: "1-999",      battleLevel: 3, subject: "Math",     emoji: "☸️", component: (p) => <SankhyaChakra {...p} /> },
  { id: "tili-duel",        title: "🎋 Bundle Duel",        level: "10-99",      battleLevel: 2, subject: "Battle",   emoji: "🎋", component: (p) => <TiliBundleDuel {...p} /> },
];

const GAMES: Item[] = [
  { id: "g-oddone",   title: "Odd One Out",        level: "Beginner",    battleLevel: 0, subject: "Literacy", emoji: "🔍", component: (p) => <OddOneOut {...p} /> },
  { id: "g-letters",  title: "Letter Explorer",    level: "Letter",      battleLevel: 1, subject: "Literacy", emoji: "🔤", component: (p) => <LetterPicker {...p} /> },
  { id: "g-missing",  title: "Missing Letter",     level: "Word",        battleLevel: 2, subject: "Literacy", emoji: "🔡", component: (p) => <MissingLetter {...p} /> },
  { id: "g-fish",     title: "Fish Word Catch",    level: "Word",        battleLevel: 2, subject: "Literacy", emoji: "🐟", component: (p) => <FishGame {...p} /> },
  { id: "g-rhyme",    title: "Rhyme Time",         level: "Word",        battleLevel: 2, subject: "Literacy", emoji: "🎵", component: (p) => <RhymeTime {...p} /> },
  { id: "g-sentence", title: "Sentence Builder",   level: "Paragraph",   battleLevel: 3, subject: "Literacy", emoji: "📝", component: (p) => <SentenceBuilder {...p} /> },
  { id: "g-story",    title: "Story Sequence",     level: "Paragraph",   battleLevel: 3, subject: "Literacy", emoji: "📖", component: (p) => <StorySequence {...p} /> },
  { id: "g-true",     title: "True or False",      level: "Story",       battleLevel: 4, subject: "Literacy", emoji: "✅", component: (p) => <TrueFalse {...p} /> },
  { id: "g-bigger",   title: "Bigger or Smaller",  level: "Beginner",    battleLevel: 0, subject: "Numeracy", emoji: "🔢", component: (p) => <BiggerSmaller {...p} /> },
  { id: "g-counting", title: "Count the Stones",   level: "Beginner",    battleLevel: 0, subject: "Numeracy", emoji: "🪨", component: (p) => <CountingStones {...p} /> },
  { id: "g-train",    title: "Number Train",       level: "1–9",         battleLevel: 1, subject: "Numeracy", emoji: "🚂", component: (p) => <NumberTrain {...p} /> },
  { id: "g-weights",  title: "Balance the Scale",  level: "10–99",       battleLevel: 2, subject: "Numeracy", emoji: "⚖️", component: (p) => <WeightMatcher {...p} /> },
  { id: "g-place",    title: "Place Value Builder", level: "10–99",       battleLevel: 2, subject: "Numeracy", emoji: "🏗️", component: (p) => <PlaceValue {...p} /> },
  { id: "g-bonds",    title: "Number Bonds",       level: "Addition",    battleLevel: 3, subject: "Numeracy", emoji: "🔗", component: (p) => <NumberBonds {...p} /> },
  { id: "g-market",   title: "Market Math",        level: "Operations",  battleLevel: 4, subject: "Numeracy", emoji: "🛒", component: (p) => <MarketMath {...p} /> },
  { id: "g-river",    title: "Number River",       level: "Operations",  battleLevel: 4, subject: "Numeracy", emoji: "🌊", component: (p) => <NumberRiver {...p} /> },
  { id: "g-clock",    title: "Clock Reader",       level: "Life Skills", battleLevel: 0, subject: "Bonus",    emoji: "🕐", component: (p) => <ClockReader {...p} /> },
  { id: "g-sorting",  title: "Sorting Hat",        level: "Cross-level", battleLevel: 0, subject: "Bonus",    emoji: "🎩", component: (p) => <SortingHat {...p} /> },
  { id: "g-matra",   title: "Matra Practice",     level: "Word",        battleLevel: 2, subject: "Literacy", emoji: "ि",  tag: "Marathi", component: (p) => <MatraPractice {...p} /> },
  { id: "g-jungle",  title: "Jungle Fight",       level: "Operations",  battleLevel: 3, subject: "Mixed",    emoji: "🐅", tag: "Featured", component: (p) => <JungleFight {...p} /> },
];

const ALL = [...SIMS, ...GAMES];

const SECTIONS = [
  { label: "🎡 New & Featured",      filter: (i: Item) => i.tag === "Featured" || i.tag === "Marathi", accent: "from-amber-400 to-orange-500", glow: "shadow-orange-500/40", ring: "ring-amber-400", active: "bg-gradient-to-r from-amber-400 to-orange-500 text-white" },
  { label: "⚡ Battle Arena",         filter: (i: Item) => i.subject === "Battle",   accent: "from-orange-500 to-red-500",   glow: "shadow-orange-500/40",  ring: "ring-orange-400",   active: "bg-gradient-to-r from-orange-500 to-red-500 text-white" },
  { label: "📦 Numeracy Simulations", filter: (i: Item) => i.subject === "Math" || i.subject === "Numeracy",     accent: "from-blue-500 to-indigo-600",  glow: "shadow-blue-500/40",    ring: "ring-blue-400",     active: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white" },
  { label: "📜 Literacy Simulations", filter: (i: Item) => i.subject === "Literacy", accent: "from-violet-500 to-purple-600", glow: "shadow-violet-500/40", ring: "ring-violet-400", active: "bg-gradient-to-r from-violet-500 to-purple-600 text-white" },
  { label: "🎁 Bonus",                filter: (i: Item) => (i.subject === "Bonus" || i.subject === "Mixed"),    accent: "from-pink-500 to-rose-500",    glow: "shadow-pink-500/40",    ring: "ring-pink-400",     active: "bg-gradient-to-r from-pink-500 to-rose-500 text-white" },
];

export default function SimulationsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const userSchoolId = (session?.user as any)?.schoolId ?? undefined;
  const { xp, level } = usePoints();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [showMatchmaker, setShowMatchmaker] = useState(false);
  const [battleContext, setBattleContext] = useState<any>(null);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);

  // Load hidden IDs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('arcade_hidden_sims');
    if (saved) setHiddenIds(JSON.parse(saved));
    
    // Read active ID from URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id && ALL.some(i => i.id === id)) {
      setActiveId(id);
    }
  }, []);

  const toggleVisibility = (id: string) => {
    const next = hiddenIds.includes(id) 
      ? hiddenIds.filter(x => x !== id) 
      : [...hiddenIds, id];
    setHiddenIds(next);
    localStorage.setItem('arcade_hidden_sims', JSON.stringify(next));
  };

  const handleSimSelect = (id: string) => {
    const item = ALL.find(i => i.id === id);
    if (item?.subject === 'Battle') {
      setShowMatchmaker(true);
    }
    setActiveId(id);
    setBattleContext(null);
    window.history.pushState({}, '', `?id=${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLibrary = () => {
    setActiveId(null);
    setBattleContext(null);
    setShowMatchmaker(false);
    window.history.pushState({}, '', window.location.pathname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeArena = () => {
    setBattleContext(null);
    setShowMatchmaker(false);
  };

  const active = activeId ? ALL.find(s => s.id === activeId) : null;
  const activeSection = active ? (SECTIONS.find(s => s.filter(active)) ?? SECTIONS[0]) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">

      {/* Arcade Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 border border-slate-700">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <Link href="/resources" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-3 h-3" /> Back to Implementation Corner
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/40">
                <Gamepad2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">Simulations & Games</h1>
                <p className="text-slate-400 text-sm font-medium">Level-wise interactive tools for students & teachers</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <StatBadge icon="⚡" label="Your XP" value={xp} color="from-amber-400 to-orange-500" shadow="shadow-orange-500/40" />
            <StatBadge icon="🆙" label="Level" value={level} color="from-indigo-500 to-blue-600" shadow="shadow-indigo-500/40" />
            <StatBadge icon="🎮" label="Tools" value={ALL.length} color="from-slate-700 to-slate-800" />
          </div>
        </div>
      </div>

      {!active ? (
        /* ================= LIBRARY VIEW ================= */
        <div className="space-y-12 animate-in fade-in zoom-in-95 duration-300">
          {SECTIONS.map(section => {
            const items = ALL.filter(section.filter).filter(i => isAdmin || !hiddenIds.includes(i.id));
            if (items.length === 0) return null;
            
            return (
              <div key={section.label} className="space-y-4">
                <div className="flex items-center gap-3 border-b-2 border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className={`text-2xl font-black bg-gradient-to-r ${section.accent} bg-clip-text text-transparent`}>
                    {section.label}
                  </h2>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                    {items.length}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {items.map(item => {
                    const isHidden = hiddenIds.includes(item.id);
                    return (
                      <div key={item.id} className="relative group h-full">
                        <button 
                          onClick={() => handleSimSelect(item.id)}
                          className={cn(
                            "w-full h-full flex flex-col p-4 rounded-2xl border-2 transition-all duration-300 text-left bg-white dark:bg-slate-800/80 hover:-translate-y-1 hover:shadow-xl",
                            isHidden ? "opacity-50 grayscale border-slate-200" : `border-transparent hover:${section.ring} hover:border-transparent focus:ring-2 focus:${section.ring}`
                          )}
                        >
                          <div className={`w-12 h-12 rounded-xl mb-3 flex items-center justify-center text-3xl shadow-inner bg-gradient-to-br ${section.accent} text-white`}>
                            {item.emoji}
                          </div>
                          <div className="flex-1 space-y-1">
                            <h3 className="font-bold text-slate-800 dark:text-white leading-tight">{item.title}</h3>
                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Lvl: {item.level}</p>
                          </div>
                          {item.tag && !isHidden && (
                            <span className="inline-block mt-3 text-[10px] font-black px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 w-fit">
                              {item.tag}
                            </span>
                          )}
                          {isHidden && (
                            <span className="inline-block mt-3 text-[10px] font-black px-2 py-0.5 rounded bg-red-100 text-red-600 w-fit">
                              HIDDEN
                            </span>
                          )}
                        </button>
                        
                        {/* Admin Toggle Overlay */}
                        {isAdmin && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleVisibility(item.id); }}
                            className="absolute top-2 right-2 z-20 p-2 text-slate-400 hover:text-blue-500 bg-white/80 backdrop-blur-md rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                            title={isHidden ? "Show Game" : "Hide Game"}
                          >
                            {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= ACTIVE GAME VIEW ================= */
        <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
          
          <button 
            onClick={handleBackToLibrary}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white text-sm font-bold bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl hover:shadow-md transition-all w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Library
          </button>
          
          {/* Active game header label */}
          <div className={`flex items-center gap-4 px-6 py-4 rounded-3xl bg-gradient-to-r ${activeSection?.accent} shadow-xl ${activeSection?.glow} text-white`}>
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-4xl drop-shadow-md">
               {active.emoji}
            </div>
            <div className="flex-1">
              <p className="font-black text-2xl leading-tight drop-shadow-sm">{active.title}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-black tracking-widest uppercase shadow-sm">Level: {active.level}</span>
                <span className="bg-black/20 px-2 py-0.5 rounded text-[11px] font-black tracking-widest uppercase shadow-sm">{active.subject}</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-white/20 rounded-2xl px-4 py-2 backdrop-blur-sm shadow-inner">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,1)]" />
              <span className="text-sm font-black tracking-widest text-white/90">LIVE</span>
            </div>
          </div>

          {/* Game area */}
          <div className="bg-white dark:bg-slate-900/40 rounded-[2rem] p-3 md:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
            {active.component({ 
              player1: battleContext?.p1, 
              player2: battleContext?.p2,
              schoolId: battleContext?.schoolId,
              classNum: battleContext?.classNum,
              onClose: closeArena
            })}
          </div>

          <BattleMatchmaker
            isOpen={showMatchmaker}
            onClose={() => setShowMatchmaker(false)}
            subject={active.battleSubject ?? 'literacy'}
            level={active.battleLevel ?? 1}
            gameTitle={active.title}
            userSchoolId={userSchoolId}
            isAdmin={isAdmin}
            onMatchComplete={(p1, p2, schoolId, classNum) => {
              setBattleContext({ p1, p2, schoolId, classNum });
              setShowMatchmaker(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

function StatBadge({ icon, label, value, color, shadow }: { icon: string; label: string; value: number | string; color: string; shadow?: string }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r ${color} ${shadow} shadow-lg text-white`}>
      <span className="text-2xl drop-shadow-sm">{icon}</span>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-white/70">{label}</p>
        <p className="text-xl font-black leading-none drop-shadow-sm">{value}</p>
      </div>
    </div>
  );
}
