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

export type Pathway = "akshargandh" | "pushpgandh" | "shabdgandh" | "pankti" | "samay" | "mashaal" | "early_graders" | "sel_health" | "arena";

export type Item = {
  id: string;
  title: string;
  level: string;
  battleLevel?: number;
  battleSubject?: 'literacy' | 'numeracy';
  subject: string;
  emoji: string;
  component: (props: any) => React.ReactNode;
  tag?: string;
  instructions: string[];
  accentColor?: "emerald" | "orange" | "blue" | "rose" | "violet" | "amber";
  pathway?: Pathway;
  /** Optional per-item override for "who this is for" — falls back to PATHWAY_AUDIENCE. */
  audience?: string;
};

// One curated "who it's for" line per pathway, tied to ASER levels — used by
// GameDetailPanel so every item gets a meaningful audience blurb without
// hand-authoring one for all 50+ catalog entries individually.
export const PATHWAY_AUDIENCE: Record<Pathway, string> = {
  akshargandh: "Children just starting out — can't yet recognize letters (ASER Beginner–Letter level).",
  pushpgandh: "Children who know their letters and are moving into reading whole words (ASER Letter–Word level).",
  shabdgandh: "Children reading words already, building toward paragraphs and stories (ASER Word–Paragraph level).",
  pankti: "Children starting numeracy — recognizing single-digit numbers (ASER Beginner–Number level).",
  samay: "Children working with two-digit numbers and place value (ASER 10–99 level).",
  mashaal: "Children ready for addition, subtraction, multiplication and division (ASER Operations level).",
  early_graders: "Younger students in early grades — quick warm-ups and fun practice, any level.",
  sel_health: "All students — social-emotional skills, hygiene and health habits, not level-gated.",
  arena: "Any two students at a matching level, playing head-to-head.",
};

const DEFAULT_AUDIENCE = "Students at any level looking for extra practice.";

export function getAudience(item: Item): string {
  return item.audience ?? (item.pathway ? PATHWAY_AUDIENCE[item.pathway] : undefined) ?? DEFAULT_AUDIENCE;
}

export const SIMS: Item[] = [
  { 
    id: "marathi-letters", title: "अक्षर ओळख (Letters)", level: "Letter", battleLevel: 1, battleSubject: "literacy", subject: "Battle", emoji: "अ", tag: "Marathi", 
    instructions: ["स्क्रीनवर दिसणारे अक्षर ओळखा.", "दिलेल्या पर्यायातून योग्य उच्चार निवडा.", "जास्तीत जास्त अक्षरे ओळखून गुण मिळवा.", "वेळेचे भान ठेवा!", "तुमची भाषा सुधारण्यास मदत होईल."], 
    accentColor: "emerald", pathway: "akshargandh", component: (p) => <LetterFlash {...p} /> 
  },
  { 
    id: "marathi-words", title: "शब्द वाचन (Words)", level: "Word", battleLevel: 2, battleSubject: "literacy", subject: "Battle", emoji: "📖", tag: "Marathi", 
    instructions: ["दिलेला शब्द काळजीपूर्वक वाचा.", "त्या शब्दाचा अर्थ किंवा योग्य जोडी शोधा.", "वेगवान वाचनाचा सराव करा.", "शब्दसंग्रह वाढवण्यासाठी मदत होईल.", "अचूकतेवर लक्ष द्या!"], 
    accentColor: "blue", pathway: "pushpgandh", component: (p) => <WordRace {...p} /> 
  },
  { 
    id: "marathi-sent", title: "वाक्य पूर्ण करा", level: "Paragraph", battleLevel: 3, battleSubject: "literacy", subject: "Battle", emoji: "📝", tag: "Marathi", 
    instructions: ["दिलेले अपूर्ण वाक्य वाचा.", "वाक्याचा अर्थ समजून घ्या.", "योग्य शब्द निवडून वाक्य पूर्ण करा.", "व्याकरणाकडे लक्ष द्या.", "अर्थपूर्ण वाक्य तयार करा."], 
    accentColor: "violet", pathway: "shabdgandh", component: (p) => <SentenceFill {...p} /> 
  },
  { 
    id: "math-duel-b", title: "Math Duel", level: "Operations", battleLevel: 4, battleSubject: "numeracy", subject: "Battle", emoji: "⚡", tag: "± / ÷", 
    instructions: ["दोन खेळाडूंमधील गणिताची लढत!", "बेरीज, वजाबाकी, गुणाकार आणि भागाकार सोडवा.", "तुमच्या प्रतिस्पर्ध्यापेक्षा वेगाने उत्तर द्या.", "चुकीचे उत्तर दिल्यास गुण कमी होतील.", "गणितात मास्टर व्हा!"], 
    accentColor: "orange", pathway: "arena", component: (p) => <MathDuel {...p} /> 
  },
  { 
    id: "num-race-b", title: "Number Race", level: "10-99", battleLevel: 2, battleSubject: "numeracy", subject: "Battle", emoji: "🏁", tag: "Compare", 
    instructions: ["दोन संख्यांची तुलना करा.", "मोठी किंवा लहान संख्या ओळखा.", "वेगाने उत्तर देऊन शर्यत जिंका.", "संख्यांच्या ओळखीचा सराव करा.", "सर्वोच्च गुण मिळवण्याचा प्रयत्न करा."], 
    accentColor: "amber", pathway: "arena", component: (p) => <NumberRace {...p} /> 
  },
  { 
    id: "pv-battle-b", title: "Place Value Battle", level: "100-999", battleLevel: 3, battleSubject: "numeracy", subject: "Battle", emoji: "🏛️", tag: "H-T-O", 
    instructions: ["शतक, दशक आणि एकक ओळखा.", "दिलेल्या संख्येची स्थानिक किंमत सांगा.", "स्थानिक किमतीच्या लढाईत जिंका.", "मोठ्या संख्या समजून घेण्यास मदत होईल.", "अचूक उत्तर देऊन विजय मिळवा!"], 
    accentColor: "blue", pathway: "arena", component: (p) => <PlaceValueBattle {...p} /> 
  },
  { 
    id: "math-sprint", title: "Math Sprint", level: "10-99", battleLevel: 2, battleSubject: "numeracy", subject: "Battle", emoji: "⚡", tag: "60s Race", 
    instructions: ["६० सेकंदात जास्तीत जास्त गणितं सोडवा.", "बेरीज आणि वजाबाकीचा वेगवान सराव.", "तुमचा वैयक्तिक विक्रम मोडा.", "वेग आणि अचूकता यांचा मेळ घाला.", "दररोज सराव करून मास्टर बना!"], 
    accentColor: "rose", pathway: "arena", component: (p) => <MathSprint {...p} /> 
  },
  { 
    id: "sound-duel", title: "Sound Duel", level: "Letter", battleLevel: 1, battleSubject: "literacy", subject: "Battle", emoji: "🎙️", tag: "60s Race", 
    instructions: ["अक्षराचा आवाज ओळखा.", "दिलेल्या पर्यायातून योग्य अक्षर निवडा.", "आवाजाच्या जोड्या वेगाने लावा.", "तुमचे ऐकण्याचे कौशल्य सुधारा.", "६० सेकंदांच्या चॅलेंजमध्ये जिंका!"], 
    accentColor: "violet", pathway: "arena", component: (p) => <SoundDuel {...p} /> 
  },
  { 
    id: "number-hunter", title: "Number Hunter", level: "1-9", battleLevel: 1, subject: "Math", emoji: "🔢", 
    instructions: ["दिलेली संख्या स्क्रीनवर शोधा.", "लपलेल्या संख्यांना टॅप करा.", "संख्यांची ओळख पक्की करा.", "कमी वेळात शोधून गुण मिळवा.", "मजा करत गणित शिका!"], 
    accentColor: "emerald", pathway: "pankti", component: (p) => <NumberHunter {...p} /> 
  },
  { 
    id: "bundle-builder", title: "Bundle Builder", level: "10-99", battleLevel: 2, subject: "Math", emoji: "📦", 
    instructions: ["दहाच्या काड्यांचे बंडल तयार करा.", "एकक आणि दशक समजून घ्या.", "दिलेली संख्या काड्या वापरून बनवा.", "गणिताची पायाभरणी मजबूत करा.", "बंडल बनवण्यात पटाईत व्हा!"], 
    accentColor: "orange", pathway: "samay", component: (p) => <BundleBuilder {...p} /> 
  },
  { 
    id: "addition-master", title: "Addition Master", level: "Operations", battleLevel: 3, subject: "Math", emoji: "➕", 
    instructions: ["दोन संख्यांची बेरीज करा.", "हासिल (Carry) च्या गणितांचा सराव करा.", "योग्य उत्तर निवडून पुढे जा.", "कठिण पातळीची गणितं सोडवा.", "बेरीज करण्यात मास्टर बना!"], 
    accentColor: "blue", pathway: "mashaal", component: (p) => <AdditionMaster {...p} /> 
  },
  { 
    id: "sound-explorer", title: "Sound Explorer", level: "Letter", battleLevel: 1, subject: "Literacy", emoji: "🔊", 
    instructions: ["वेगवेगळे आवाज ऐका.", "आवाजावरून अक्षर किंवा शब्द ओळखा.", "नवीन आवाज एक्सप्लोर करा.", "उच्चारांचा सराव करा.", "साउंड्सच्या जगात फिरा!"], 
    accentColor: "amber", pathway: "akshargandh", component: (p) => <SoundExplorer {...p} /> 
  },
  { 
    id: "word-builder", title: "Word Builder", level: "Word", battleLevel: 2, subject: "Literacy", emoji: "🔤", 
    instructions: ["अक्षरे जोडून नवीन शब्द बनवा.", "अर्थपूर्ण शब्द तयार करण्यावर भर द्या.", "तुमचा शब्दसंग्रह वाढवा.", "स्पेलिंग किंवा काना-मात्रा तपासा.", "शब्दांचे जादूगार बना!"], 
    accentColor: "emerald", pathway: "pushpgandh", component: (p) => <WordBuilder {...p} /> 
  },
  { 
    id: "sentence-arch", title: "Sentence Architect", level: "Para/Story", battleLevel: 4, subject: "Literacy", emoji: "📜", 
    instructions: ["शब्दांची योग्य क्रमाने मांडणी करा.", "अर्थपूर्ण वाक्य तयार करा.", "वाक्यरचना सुधारण्यास मदत होईल.", "कथा पूर्ण करण्यासाठी वाक्य बनवा.", "लेखनाचा सराव करा."], 
    accentColor: "violet", pathway: "shabdgandh", component: (p) => <SentenceArchitect {...p} /> 
  },
  { 
    id: "chaudakhadi", title: "चौदाखडी Chart", level: "Letter", battleLevel: 1, subject: "Literacy", emoji: "क", tag: "Marathi", 
    instructions: ["मराठी चौदाखडीचा अभ्यास करा.", "स्वर आणि व्यंजन यांची जोडी ओळखा.", "काना, मात्रा, वेलांटी यांचा सराव करा.", "उच्चारांमधील फरक समजून घ्या.", "वाचनाचा पाया पक्का करा."], 
    accentColor: "orange", pathway: "akshargandh", component: (p) => <Chaudakhadi {...p} /> 
  },
  { 
    id: "story-reader", title: "Story Reader", level: "Story", battleLevel: 4, subject: "Literacy", emoji: "📚", 
    instructions: ["दिलेली गोष्ट लक्षपूर्वक वाचा.", "गोष्टीतील मजकूर समजून घ्या.", "विचारलेल्या प्रश्नांची उत्तरे द्या.", "तुमचे वाचन कौशल्य वाढवा.", "मजेशीर गोष्टींचा आनंद घ्या!"], 
    accentColor: "blue", pathway: "shabdgandh", component: (p) => <StoryReader {...p} /> 
  },
  { 
    id: "number-line", title: "Number Line", level: "1-9", battleLevel: 1, subject: "Math", emoji: "📏", 
    instructions: ["संख्या रेषेवरील संख्या ओळखा.", "रिकाम्या जागी योग्य संख्या भरा.", "संख्यांचा क्रम आणि अंतर शिका.", "उजवीकडे किंवा डावीकडे जाणे समजून घ्या.", "संख्या रेषा मास्टर करा!"], 
    accentColor: "rose", pathway: "pankti", component: (p) => <NumberLine {...p} /> 
  },
  { 
    id: "math-mania-market", title: "🛒 Math Mania Market", level: "Operations", battleLevel: 4, subject: "Math", emoji: "🛒", tag: "Ultimate", 
    instructions: ["बाजारात खरेदीला जा!", "वस्तूंच्या किमतींची बेरीज करा.", "दुकानदाराला किती पैसे द्यावे लागतील ते ठरवा.", "परत मिळणारे पैसे मोजा.", "खऱ्या आयुष्यातील गणिताचा सराव करा."], 
    accentColor: "amber", pathway: "mashaal", component: (p) => <MathManiaMarket {...p} /> 
  },
  { 
    id: "vachan-pravas", title: "📖 Vachan Pravas", level: "Story", battleLevel: 4, subject: "Literacy", emoji: "📖", tag: "Ultimate", 
    instructions: ["वाचनाचा प्रवास सुरू करा!", "परिच्छेद आणि गोष्टी वाचून शिका.", "नवीन शब्दांचा सराव करा.", "प्रश्नोत्तरांद्वारे तुमची समज तपासा.", "एक उत्तम वाचक बना!"], 
    accentColor: "emerald", pathway: "shabdgandh", component: (p) => <VachanPravas {...p} /> 
  },
  { 
    id: "akshar-crush", title: "🍬 अक्षर कँडी", level: "Word", battleLevel: 2, subject: "Literacy", emoji: "🍬", tag: "Marathi", 
    instructions: ["एकाच आवाजाची अक्षरे एकत्र करा.", "शब्द पूर्ण करण्यासाठी कँडी निवडा.", "मजा करत मराठी शब्द शिका.", "तुमचा स्कोअर वाढवण्यासाठी वेगाने खेळा.", "अक्षर कँडीचे किंग बना!"], 
    accentColor: "rose", pathway: "pushpgandh", component: (p) => <AksharCrush {...p} /> 
  },
  { 
    id: "matra-chakra", title: "🎡 मात्रा चक्र", level: "Word", battleLevel: 2, subject: "Literacy", emoji: "🎡", tag: "Marathi", 
    instructions: ["मात्रांचे चक्र फिरवा!", "योग्य मात्रा लावून शब्द पूर्ण करा.", "काना, मात्रा, वेलांटीचा खेळ खेळा.", "वाचनातील अचूकता वाढवा.", "चक्रातील सर्व आव्हाने पूर्ण करा."], 
    accentColor: "violet", pathway: "pushpgandh", component: (p) => <MatraChakra {...p} /> 
  },
  { 
    id: "gyansidi", title: "🐍 ज्ञानशिडी", level: "Operations", battleLevel: 3, subject: "Mixed", emoji: "🐍", tag: "Featured", 
    instructions: ["साप आणि शिडीचा खेळ गणितासोबत!", "दिलेले गणित सोडवून फासा टाका.", "शिडीने वर जा आणि सापापासून वाचा.", "सर्व आव्हाने पार करून शेवटपर्यंत पोहोचा.", "मित्रांसोबत किंवा एकट्याने खेळा!"], 
    accentColor: "emerald", pathway: "arena", component: (p) => <GyanSidi {...p} /> 
  },
  { 
    id: "fraction-viz", title: "🍰 Fractions Explorer", level: "Operations", battleLevel: 4, subject: "Math", emoji: "🍰", 
    instructions: ["अपूर्णांक (Fractions) समजून घ्या.", "केक किंवा पिझ्झाचे भाग करा.", "अंशा आणि छेद यांची ओळख पक्की करा.", "वेगवेगळे भाग جوडून पूर्ण वस्तू बनवा.", "अपूर्णांकांच्या जगात मजा करा!"], 
    accentColor: "rose", pathway: "mashaal", component: (p) => <FractionViz {...p} /> 
  },
  { 
    id: "digital-abacus", title: "🧮 Digital Abacus", level: "10-99", battleLevel: 2, subject: "Math", emoji: "🧮", 
    instructions: ["अॅबॅकसवर मणी मोजा.", "दिलेली संख्या मण्यांच्या सहाय्याने दाखवा.", "गणित सोडवण्याची नवीन पद्धत शिका.", "एकाग्रता आणि वेग वाढवा.", "डिजिटल अॅबॅकसमध्ये पारंगत व्हा!"], 
    accentColor: "blue", pathway: "samay", component: (p) => <DigitalAbacus {...p} /> 
  },
  { 
    id: "division-sim", title: "➗ Division Fun", level: "Operations", battleLevel: 4, subject: "Math", emoji: "➗", 
    instructions: ["वस्तूंचे समान वाटप करा.", "भागाकार (Division) सोप्या पद्धतीने शिका.", "पाढ्यांचा वापर करून उत्तरे द्या.", "किती उरले (Remainder) ते तपासा.", "भागाकार करण्यात मास्टर बना!"], 
    accentColor: "orange", pathway: "mashaal", component: (p) => <DivisionSim {...p} /> 
  },
  { 
    id: "equal-sharing", title: "🍎 Equal Sharing", level: "Operations", battleLevel: 3, subject: "Math", emoji: "🍎", 
    instructions: ["सफरचंदांचे मित्रांमध्ये समान वाटप करा.", "प्रत्येकाला किती मिळतील ते मोजा.", "भागाकाराची सुरुवात समजून घ्या.", "समानतेचे नियम शिका.", "सर्वांना सारखेच फळ द्या!"], 
    accentColor: "emerald", pathway: "mashaal", component: (p) => <EqualSharing {...p} /> 
  },
  { 
    id: "multi-sim", title: "✖️ Multiplier", level: "Operations", battleLevel: 4, subject: "Math", emoji: "✖️", 
    instructions: ["गुणाकार (Multiplication) शिका.", "पाढ्यांचा सराव करा.", "संख्यांचा गुणा करून उत्तर शोधा.", "वेगवेगळी आव्हाने पूर्ण करा.", "गुणाकारात हुशार व्हा!"], 
    accentColor: "violet", pathway: "mashaal", component: (p) => <MultiplicationSim {...p} /> 
  },
  { 
    id: "repeat-add", title: "➕ Repeated Addition", level: "Operations", battleLevel: 3, subject: "Math", emoji: "➕", 
    instructions: ["एकाच संख्येची वारंवार बेरीज करा.", "बेरीज आणि गुणाकार यातील संबंध शिका.", "संख्यांचे गट मोजा.", "गणिताची सोपी ट्रिक शिका.", "पायरीने बेरीज करत पुढे जा."], 
    accentColor: "blue", pathway: "mashaal", component: (p) => <RepeatedAddition {...p} /> 
  },
  { 
    id: "sankhya-chakra", title: "☸️ संख्या चक्र", level: "1-999", battleLevel: 3, subject: "Math", emoji: "☸️", 
    instructions: ["संख्यांचे चक्र फिरवा!", "दिलेली संख्या बनवण्यासाठी चक्र फिरवा.", "शतक, दशक, एकक यांची ओळख करा.", "मोठ्या संख्या वाचण्याचा सराव करा.", "चक्रातील सर्व संख्या शोधा."], 
    accentColor: "amber", pathway: "early_graders", component: (p) => <SankhyaChakra {...p} /> 
  },
  { 
    id: "tili-duel", title: "🎋 Bundle Duel", level: "10-99", battleLevel: 2, subject: "Battle", emoji: "🎋", 
    instructions: ["काड्यांच्या बंडलची लढाई!", "प्रतिस्पर्ध्यापेक्षा वेगाने संख्या बनवा.", "बंडल आणि सुट्या काड्या मोजा.", "दशक-एकक संकल्पना पक्की करा.", "लढाई जिंका आणि गुण मिळवा!"], 
    accentColor: "emerald", pathway: "arena", component: (p) => <TiliBundleDuel {...p} /> 
  },
];

export const GAMES: Item[] = [
  { 
    id: "g-oddone", title: "Odd One Out", level: "Beginner", battleLevel: 0, subject: "Literacy", emoji: "🔍", 
    instructions: ["सर्वात वेगळा फोटो किंवा शब्द शोधा.", "गटात न बसणारा पर्याय ओळखा.", "वेगाने शोधून गुण मिळवा.", "तुमचे निरीक्षण कौशल्य सुधारा.", "सर्व पातळ्या पूर्ण करा!"], 
    accentColor: "amber", pathway: "early_graders", component: (p) => <OddOneOut {...p} /> 
  },
  { 
    id: "g-letters", title: "Letter Explorer", level: "Letter", battleLevel: 1, subject: "Literacy", emoji: "🔤", 
    instructions: ["दिलेले अक्षर स्क्रीनवर शोधा.", "योग्य अक्षरावर क्लिक करा.", "मुळाक्षरांचा सराव करा.", "अक्षरांच्या जोड्या लावा.", "एकाग्रतेने खेळा!"], 
    accentColor: "emerald", pathway: "akshargandh", component: (p) => <LetterPicker {...p} /> 
  },
  { 
    id: "g-missing", title: "Missing Letter", level: "Word", battleLevel: 2, subject: "Literacy", emoji: "🔡", 
    instructions: ["शब्दातील गाळलेले अक्षर भरा.", "अर्थपूर्ण शब्द पूर्ण करा.", "स्पेलिंग किंवा मात्रांचा सराव करा.", "नवनवीन शब्द शिका.", "अचूक अक्षरावर टॅप करा."], 
    accentColor: "blue", pathway: "pushpgandh", component: (p) => <MissingLetter {...p} /> 
  },
  { 
    id: "g-fish", title: "Fish Word Catch", level: "Word", battleLevel: 2, subject: "Literacy", emoji: "🐟", 
    instructions: ["योग्य शब्दाची मासोळी पकडा!", "पाण्यात पोहणारे शब्द काळजीपूर्वक वाचा.", "दिलेल्या प्रश्नाचे उत्तर शोधा.", "वेगाने आणि अचूकपणे पकडा.", "तुमची शब्दसंपदा वाढवा!"], 
    accentColor: "blue", pathway: "pushpgandh", component: (p) => <FishGame {...p} /> 
  },
  { 
    id: "g-rhyme", title: "Rhyme Time", level: "Word", battleLevel: 2, subject: "Literacy", emoji: "🎵", 
    instructions: ["यमक जुळणारे (Rhyming) शब्द शोधा.", "दिलेल्या शब्दाशी जुळणारा शब्द निवडा.", "ध्वनींचा आणि यमकांचा सराव करा.", "संगीतमय शब्दांचा आनंद घ्या.", "सर्व जोड्या अचूक लावा!"], 
    accentColor: "rose", pathway: "pushpgandh", component: (p) => <RhymeTime {...p} /> 
  },
  { 
    id: "g-sentence", title: "Sentence Builder", level: "Paragraph", battleLevel: 3, subject: "Literacy", emoji: "📝", 
    instructions: ["शब्दांना योग्य क्रमाने लावा.", "अर्थपूर्ण वाक्य तयार करा.", "वाक्यरचनेचे नियम शिका.", "परिच्छेद पूर्ण करण्यासाठी वाक्य बनवा.", "लेखनाचा सराव करा."], 
    accentColor: "violet", pathway: "shabdgandh", component: (p) => <SentenceBuilder {...p} /> 
  },
  { 
    id: "g-story", title: "Story Sequence", level: "Paragraph", battleLevel: 3, subject: "Literacy", emoji: "📖", 
    instructions: ["कथेतील चित्र किंवा वाक्य योग्य क्रमाने लावा.", "गोष्ट समजून घेऊन मांडणी करा.", "तार्किक विचारशक्ती वाढवा.", "कथा पूर्ण करून वाचा.", "एक छान गोष्टी सांगणारे बना!"], 
    accentColor: "blue", pathway: "shabdgandh", component: (p) => <StorySequence {...p} /> 
  },
  { 
    id: "g-truefalse", title: "True or False", level: "Story", battleLevel: 4, subject: "Literacy", emoji: "✅", 
    instructions: ["दिलेले वाक्य बरोबर की चूक ते ओळखा.", "गोष्टीतील माहितीवर आधारित उत्तरे द्या.", "वाचनाची समज तपासा.", "वेगाने विचार करून उत्तर द्या.", "तुमचा स्कोअर तपासा!"], 
    accentColor: "emerald", pathway: "shabdgandh", component: (p) => <TrueFalse {...p} /> 
  },
  { 
    id: "g-bigger", title: "Bigger or Smaller", level: "Beginner", battleLevel: 0, subject: "Numeracy", emoji: "🔢", 
    instructions: ["दोन संख्यांची किंवा गटांची तुलना करा.", "मोठी किंवा लहान संख्या ओळखा.", "चिन्हांचा योग्य वापर करा.", "संख्यांमधील फरक शिका.", "वेगाने उत्तर देऊन गुण मिळवा."], 
    accentColor: "blue", pathway: "pankti", component: (p) => <BiggerSmaller {...p} /> 
  },
  { 
    id: "g-counting", title: "Count the Stones", level: "Beginner", battleLevel: 0, subject: "Numeracy", emoji: "🪨", 
    instructions: ["स्क्रीनवरील वस्तू मोजा.", "योग्य संख्या निवडा.", "मोजणीचा (Counting) सराव करा.", "चुकीचे उत्तर आल्यास पुन्हा प्रयत्न करा.", "मजा करत गणित शिका!"], 
    accentColor: "amber", pathway: "pankti", component: (p) => <CountingStones {...p} /> 
  },
  { 
    id: "g-numbertrain", title: "Number Train", level: "1–9", battleLevel: 1, subject: "Numeracy", emoji: "🚂", 
    instructions: ["रेल्वेच्या डब्यांवरील संख्यांचा क्रम लावा.", "गाळलेली संख्या शोधून डबा पूर्ण करा.", "संख्यांचा चढता आणि उतरता क्रम शिका.", "रेल्वेला वेळेवर मार्गस्थ करा.", "संख्यांची ओळख पक्की करा."], 
    accentColor: "rose", pathway: "pankti", component: (p) => <NumberTrain {...p} /> 
  },
  { 
    id: "g-weights", title: "Balance the Scale", level: "10–99", battleLevel: 2, subject: "Numeracy", emoji: "⚖️", 
    instructions: ["तराजूच्या दोन्ही बाजू समान करा.", "दिलेल्या संख्यांची बेरीज किंवा वजाबाकी करा.", "वजन संतुलित ठेवण्यासाठी योग्य संख्या निवडा.", "गणिताचे संतुलन शिका.", "तराजूचे मास्टर बना!"], 
    accentColor: "violet", pathway: "samay", component: (p) => <WeightMatcher {...p} /> 
  },
  { 
    id: "g-placevalue", title: "Place Value Builder", level: "10–99", battleLevel: 2, subject: "Numeracy", emoji: "🏗️", 
    instructions: ["दशक आणि एकक वापरून संख्या बनवा.", "स्थानिक किमतीनुसार ठोकळे रचा.", "संख्यांची रचना समजून घ्या.", "दिलेली संख्या अचूक तयार करा.", "गणितात बिल्डर बना!"], 
    accentColor: "emerald", pathway: "samay", component: (p) => <PlaceValue {...p} /> 
  },
  { 
    id: "g-bonds", title: "Number Bonds", level: "Addition", battleLevel: 3, subject: "Numeracy", emoji: "🔗", 
    instructions: ["संख्यांच्या जोड्या (Number Bonds) ओळखा.", "पूर्ण संख्या बनवण्यासाठी उरलेला भाग शोधा.", "बेरीज आणि वजाबाकीचा सराव करा.", "गणितातील संबंध समजून घ्या.", "सर्व साखळ्या पूर्ण करा!"], 
    accentColor: "blue", pathway: "samay", component: (p) => <NumberBonds {...p} /> 
  },
  { 
    id: "g-market", title: "Market Math", level: "Operations",  battleLevel: 4, subject: "Numeracy", emoji: "🛒", 
    instructions: ["बाजारात खरेदी करा आणि पैशांचे हिशोब करा.", "एकूण किंमत किंवा उरलेले पैसे काढा.", "प्रश्नाचे नीट वाचन करून योग्य उत्तर द्या.", "प्रत्येक अचूक उत्तरासाठी XP मिळवा.", "हिशोबात मास्टर व्हा!"], 
    accentColor: "amber", pathway: "mashaal", component: (p) => <MarketMath {...p} /> 
  },
  { 
    id: "g-river", title: "Number River", level: "Operations",  battleLevel: 4, subject: "Numeracy", emoji: "🌊", 
    instructions: ["बेडकाला नदी पार करण्यास मदत करा!", "गणिताचे कोडे सोडवून योग्य दगडावर उडी मारा.", "बेरीज आणि वजाबाकीचा वेगवान सराव.", "नदीच्या दुसऱ्या तीरावर सुरक्षित पोहोचा.", "मजा करत गणित शिका!"], 
    accentColor: "blue", pathway: "mashaal", component: (p) => <NumberRiver {...p} /> 
  },
  { 
    id: "g-clock", title: "Clock Reader", level: "Life Skills", battleLevel: 0, subject: "Bonus", emoji: "🕐", 
    instructions: ["घड्याळातील वेळ ओळखा.", "तास आणि मिनिटे समजून घ्या.", "दिलेली वेळ घड्याळात दाखवा.", "दैनंदिन जीवनातील महत्त्वाचे कौशल्य शिका.", "वेळेचे नियोजन करायला शिका!"], 
    accentColor: "rose", pathway: "early_graders", component: (p) => <ClockReader {...p} /> 
  },
  { 
    id: "g-sorting", title: "Sorting Hat", level: "Cross-level", battleLevel: 0, subject: "Bonus", emoji: "🎩", 
    instructions: ["वस्तूंचे त्यांच्या गुणधर्मांनुसार वर्गीकरण करा.", "योग्य गटात वस्तू टाका.", "साम्य आणि फरक ओळखायला शिका.", "वेगवान वर्गीकरणाचा सराव करा.", "टोपीला योग्य उत्तर द्या!"], 
    accentColor: "violet", pathway: "early_graders", component: (p) => <SortingHat {...p} /> 
  },
  { 
    id: "g-matra", title: "Matra Practice", level: "Word", battleLevel: 2, subject: "Literacy", emoji: "ि", tag: "Marathi", 
    instructions: ["मराठी मात्रांचा योग्य सराव करा.", "अक्षराला योग्य काना, मात्रा, वेलांटी लावा.", "उच्चारानुसार शब्दातील फरक शिका.", "वाचनातील शुद्धता वाढवा.", "मराठी लेखनात हुशार व्हा!"], 
    accentColor: "orange", pathway: "pushpgandh", component: (p) => <MatraPractice {...p} /> 
  },
  { 
    id: "g-jungle", title: "Jungle Fight", level: "Operations", battleLevel: 3, subject: "Mixed", emoji: "🐅", tag: "Featured", 
    instructions: ["जंगलात प्राण्यांची गणिताची लढाई!", "तुमच्या प्राण्याला ताकद देण्यासाठी गणित सोडवा.", "प्रतिस्पर्ध्यावर मात करून विजय मिळवा.", "वेग आणि अचूकता वापरून खेळा.", "जंगलाचा राजा बना!"], 
    accentColor: "emerald", pathway: "arena", component: (p) => <JungleFight {...p} /> 
  },
  { 
    id: "g-empathy", title: "सहानुभूती नायक", level: "Social Skills", battleLevel: 0, subject: "SEL", emoji: "❤️", tag: "Featured", 
    instructions: ["दुसऱ्यांच्या भावना समजून घ्यायला शिका.", "योग्य सामाजिक निर्णय निवडा.", "मैत्री आणि मदतीचे महत्त्व समजून घ्या.", "एक चांगले माणूस बनण्याचा सराव करा.", "सहानुभूतीचा नायक बना!"], 
    accentColor: "rose", pathway: "sel_health", component: (p) => <EmpathyHero {...p} /> 
  },
  { 
    id: "g-buddy", title: "बडीचा मोठा दिवस", level: "Story Mode", battleLevel: 0, subject: "SEL", emoji: "🦸‍♂️", tag: "Featured", 
    instructions: ["बडीला त्याच्या दिवसाचे नियोजन करायला मदत करा.", "चांगल्या सवयी आणि शिस्त शिका.", "विविध प्रसंगात योग्य मार्ग निवडा.", "कथेचा आनंद घेत निर्णय घ्या.", "बडीचा दिवस खास बनवा!"], 
    accentColor: "blue", pathway: "sel_health", component: (p) => <BuddyBigDay {...p} /> 
  },
  { 
    id: "g-germs", title: "स्वच्छता रक्षक", level: "Hygiene", battleLevel: 0, subject: "Health", emoji: "🧼", tag: "Health", 
    instructions: ["जंतूंना हरवून स्वतःचे संरक्षण करा!", "हात धुणे आणि स्वच्छतेचे नियम शिका.", "रोग टाळण्यासाठी योग्य कृती निवडा.", "आरोग्याबद्दलची जागरूकता वाढवा.", "स्वच्छतेचे रक्षक बना!"], 
    accentColor: "emerald", pathway: "sel_health", component: (p) => <GermBuster {...p} /> 
  },
  { 
    id: "g-plate", title: "आरोग्यदायी थाळी", level: "Nutrition", battleLevel: 0, subject: "Health", emoji: "🍏", tag: "Health", 
    instructions: ["तुमची पौष्टिक थाळी तयार करा.", "फळे, भाज्या आणि अन्नाचे महत्त्व शिका.", "आरोग्यासाठी काय चांगले आहे ते ओळखा.", "संतुलित आहाराची सवय लावा.", "एक सुदृढ बालक बना!"], 
    accentColor: "amber", pathway: "sel_health", component: (p) => <HealthyPlate {...p} /> 
  },
  { 
    id: "g-routine", title: "माझी दिनचर्या", level: "Habits", battleLevel: 0, subject: "Health", emoji: "⏰", tag: "Health", 
    instructions: ["दिवसाच्या कामांचा योग्य क्रम लावा.", "सकाळपासून रात्रीपर्यंतच्या सवयी शिका.", "वेळेचे महत्त्व समजून घ्या.", "चांगली दिनचर्या तयार करा.", "एक शिस्तबद्ध व्यक्ती बना!"], 
    accentColor: "orange", pathway: "sel_health", component: (p) => <DailyRoutine {...p} /> 
  },
  { 
    id: "g-waste", title: "कचरा व्यवस्थापन", level: "Environment", battleLevel: 0, subject: "Health", emoji: "♻️", tag: "Health", 
    instructions: ["ओला आणि सुका कचरा वेगळा करा.", "पुनर्वापर (Recycle) चे महत्त्व शिका.", "परिसर स्वच्छ ठेवण्यासाठी मदत करा.", "पर्यावरणाचे मित्र बना.", "कचरा कुंडीतच टाका!"], 
    accentColor: "emerald", pathway: "sel_health", component: (p) => <WasteSort {...p} /> 
  },
];

export const ALL = [...SIMS, ...GAMES];
