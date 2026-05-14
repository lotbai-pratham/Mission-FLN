"use client";
import React from "react";

// Simulations
import BundleBuilder from "@/components/simulations/BundleBuilder";
import NumberHunter from "@/components/simulations/NumberHunter";
import AdditionMaster from "@/components/simulations/AdditionMaster";
import SoundExplorer from "@/components/simulations/SoundExplorer";
import WordBuilder from "@/components/simulations/WordBuilder";
import SentenceArchitect from "@/components/simulations/SentenceArchitect";
import MathSprint from "@/components/simulations/MathSprint";
import SoundDuel from "@/components/simulations/SoundDuel";
import FractionViz from "@/components/simulations/FractionViz";
import DigitalAbacus from "@/components/simulations/DigitalAbacus";
import DivisionSim from "@/components/simulations/DivisionSim";
import EqualSharing from "@/components/simulations/EqualSharing";
import MultiplicationSim from "@/components/simulations/MultiplicationSim";
import RepeatedAddition from "@/components/simulations/RepeatedAddition";
import SankhyaChakra from "@/components/simulations/SankhyaChakra";
import TiliBundleDuel from "@/components/simulations/TiliBundleDuel";
import LetterFlash from "@/components/simulations/LetterFlash";
import WordRace from "@/components/simulations/WordRace";
import SentenceFill from "@/components/simulations/SentenceFill";
import MathDuel from "@/components/simulations/MathDuel";
import NumberRace from "@/components/simulations/NumberRace";
import PlaceValueBattle from "@/components/simulations/PlaceValueBattle";
import StoryReader from "@/components/simulations/StoryReader";
import Chaudakhadi from "@/components/simulations/Chaudakhadi";
import NumberLine from "@/components/simulations/NumberLine";
import MathManiaMarket from "@/components/simulations/MathManiaMarket";
import VachanPravas from "@/components/simulations/VachanPravas";
import AksharCrush from "@/components/simulations/AksharCrush";
import MatraChakra from "@/components/simulations/MatraChakra";
import GyanSidi from "@/components/simulations/GyanSidi";

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
import JungleFight from "@/components/games/JungleFight";
import EmpathyHero from "@/components/games/EmpathyHero";
import BuddyBigDay from "@/components/games/BuddyBigDay";
import GermBuster from "@/components/games/GermBuster";
import HealthyPlate from "@/components/games/HealthyPlate";
import DailyRoutine from "@/components/games/DailyRoutine";
import WasteSort from "@/components/games/WasteSort";

export type Item = {
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

export const SIMS: Item[] = [
  { id: "marathi-letters", title: "अक्षर ओळख (Letters)", level: "Letter",     battleLevel: 1, battleSubject: "literacy",  subject: "Battle", emoji: "अ",  tag: "Marathi",   component: (p) => <LetterFlash {...p} /> },
  { id: "marathi-words",   title: "शब्द वाचन (Words)",   level: "Word",       battleLevel: 2, battleSubject: "literacy",  subject: "Battle", emoji: "📖", tag: "Marathi",   component: (p) => <WordRace {...p} /> },
  { id: "marathi-sent",    title: "वाक्य पूर्ण करा",     level: "Paragraph",  battleLevel: 3, battleSubject: "literacy",  subject: "Battle", emoji: "📝", tag: "Marathi",   component: (p) => <SentenceFill {...p} /> },
  { id: "math-duel-b",     title: "Math Duel",           level: "Operations", battleLevel: 4, battleSubject: "numeracy",  subject: "Battle", emoji: "⚡", tag: "± / ÷",    component: (p) => <MathDuel {...p} /> },
  { id: "num-race-b",      title: "Number Race",         level: "10-99",      battleLevel: 2, battleSubject: "numeracy",  subject: "Battle", emoji: "🏁", tag: "Compare",  component: (p) => <NumberRace {...p} /> },
  { id: "pv-battle-b",     title: "Place Value Battle",  level: "100-999",    battleLevel: 3, battleSubject: "numeracy",  subject: "Battle", emoji: "🏛️", tag: "H-T-O",   component: (p) => <PlaceValueBattle {...p} /> },
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
  { id: "fraction-viz",     title: "🍰 Fractions Explorer", level: "Operations", battleLevel: 4, subject: "Math",     emoji: "🍰", component: (p) => <FractionViz {...p} /> },
  { id: "digital-abacus",   title: "🧮 Digital Abacus",    level: "10-99",      battleLevel: 2, subject: "Math",     emoji: "🧮", component: (p) => <DigitalAbacus {...p} /> },
  { id: "division-sim",     title: "➗ Division Fun",       level: "Operations", battleLevel: 4, subject: "Math",     emoji: "➗", component: (p) => <DivisionSim {...p} /> },
  { id: "equal-sharing",    title: "🍎 Equal Sharing",      level: "Operations", battleLevel: 3, subject: "Math",     emoji: "🍎", component: (p) => <EqualSharing {...p} /> },
  { id: "multi-sim",        title: "✖️ Multiplier",         level: "Operations", battleLevel: 4, subject: "Math",     emoji: "✖️", component: (p) => <MultiplicationSim {...p} /> },
  { id: "repeat-add",       title: "➕ Repeated Addition",  level: "Operations", battleLevel: 3, subject: "Math",     emoji: "➕", component: (p) => <RepeatedAddition {...p} /> },
  { id: "sankhya-chakra",   title: "☸️ संख्या चक्र",       level: "1-999",      battleLevel: 3, subject: "Math",     emoji: "☸️", component: (p) => <SankhyaChakra {...p} /> },
  { id: "tili-duel",        title: "🎋 Bundle Duel",        level: "10-99",      battleLevel: 2, subject: "Battle",   emoji: "🎋", component: (p) => <TiliBundleDuel {...p} /> },
];

export const GAMES: Item[] = [
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
  { id: "g-empathy", title: "सहानुभूती नायक",       level: "Social Skills", battleLevel: 0, subject: "SEL",      emoji: "❤️", tag: "Featured", component: (p) => <EmpathyHero {...p} /> },
  { id: "g-buddy",   title: "बडीचा मोठा दिवस",     level: "Story Mode",   battleLevel: 0, subject: "SEL",      emoji: "🦸‍♂️", tag: "Featured", component: (p) => <BuddyBigDay {...p} /> },
  { id: "g-germs",   title: "स्वच्छता रक्षक",       level: "Hygiene",      battleLevel: 0, subject: "Health",   emoji: "🧼", tag: "Health",   component: (p) => <GermBuster {...p} /> },
  { id: "g-plate",   title: "आरोग्यदायी थाळी",     level: "Nutrition",    battleLevel: 0, subject: "Health",   emoji: "🍏", tag: "Health",   component: (p) => <HealthyPlate {...p} /> },
  { id: "g-routine", title: "माझी दिनचर्या",       level: "Habits",       battleLevel: 0, subject: "Health",   emoji: "⏰", tag: "Health",   component: (p) => <DailyRoutine {...p} /> },
  { id: "g-waste",   title: "कचरा व्यवस्थापन",     level: "Environment",  battleLevel: 0, subject: "Health",   emoji: "♻️", tag: "Health",   component: (p) => <WasteSort {...p} /> },
];

export const ALL = [...SIMS, ...GAMES];
