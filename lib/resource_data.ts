import { Play, FileText, Gamepad2, GraduationCap, Laptop, BookOpen, Lightbulb, MonitorPlay, SpellCheck, Binary } from "lucide-react";

export type Resource = {
  title: string;
  category: "Video" | "Article" | "Simulation";
  level?: "Letter" | "Word" | "Para/Story" | "1-9" | "10-99" | "Operations";
  description: string;
  id?: string; // YouTube ID or Component Name
  content?: string; // For articles
  image?: string;
  link?: string;
  tags?: string[];
};

export const VIDEOS: Resource[] = [
  {
    title: "आधारशिला: खेळ आधारित शिक्षण (आठवडा १)",
    category: "Video",
    level: "Letter",
    description: "अंगणवाडीतील मुलांच्या स्वागताची तयारी आणि प्राथमिक खेळ (Week 1 play-based routines and warm-up).",
    id: "S6vX_2A-n_8",
  },
  {
    title: "आधारशिला: खेळ आधारित शिक्षण (आठवडा ८)",
    category: "Video",
    level: "Word",
    description: "चित्र वाचन आणि शब्दांच्या खेळांचे सादरीकरण (Week 8 active picture narration and word games).",
    id: "m6E6A2Y77I4",
  },
  {
    title: "आधारशिला: खेळ आधारित शिक्षण (आठवडा १२)",
    category: "Video",
    level: "1-9",
    description: "अंक ओळख आणि बियांच्या मदतीने गणितीय गट पाडणे (Week 12 number recognition and seed counting play).",
    id: "S9oE66E2E88",
  },
  {
    title: "आधारशिला: खेळ आधारित शिक्षण (आठवडा २२)",
    category: "Video",
    level: "Para/Story",
    description: "जोडाक्षरे आणि प्रगत गोष्टींची ओळख (Week 22 compound letters and advanced storytelling).",
    id: "LmtpWTPA6GM",
  }
];

export const ARTICLES: Resource[] = [
  {
    title: "The Power of Level-Wise Grouping",
    category: "Article",
    description: "Why teaching at the student's current level is 3x more effective than using age-based curriculum.",
    content: "Teaching at the Right Level (TaRL) is an evidence-based pedagogical approach developed by Pratham. The key is to evaluate children on their basic reading and arithmetic skills and then group them by their actual learning level rather than by their grade or age...",
    tags: ["Pedagogy", "Grouping", "TaRL Basics"]
  },
  {
    title: "Using Digital Manipulatives in the Field",
    category: "Article",
    description: "Best practices for using tablets and simulations like 'Bundle Builder' during field visits.",
    content: "When using digital tools in rural classrooms, the focus should still be on student interaction. Let the student touch the screen to 'Tie the Bundle'. This physical interaction reinforces the mental model of 10 ones becoming 1 ten...",
    tags: ["Technology", "Coaching", "Field Work"]
  }
];

export const SIMULATIONS: Resource[] = [
  {
    title: "Number Hunter",
    category: "Simulation",
    level: "1-9",
    description: "Match visual counts to number symbols. Perfect for students at the 'Beginner' level.",
    id: "NumberHunter",
    link: "/resources/simulations?id=number-hunter"
  },
  {
    title: "Bundle Builder",
    category: "Simulation",
    level: "10-99",
    description: "The classic sticks and bundles tool for place-value understanding.",
    id: "BundleBuilder",
    link: "/resources/simulations?id=bundle-builder"
  },
  {
    title: "Addition Master",
    category: "Simulation",
    level: "Operations",
    description: "Solve two-digit addition problems by physically re-bundling sticks.",
    id: "AdditionMaster",
    link: "/resources/simulations?id=addition-master"
  },
  {
    title: "Sound Explorer",
    category: "Simulation",
    level: "Letter",
    description: "Phonics matching game. Match the sound to the correct letter.",
    id: "SoundExplorer",
    link: "/resources/simulations?id=sound-explorer"
  },
  {
    title: "Word Builder",
    category: "Simulation",
    level: "Word",
    description: "Drag Letters to build words. Categorized by phonetic sounds.",
    id: "WordBuilder",
    link: "/resources/simulations?id=word-builder"
  },
  {
    title: "Sentence Architect",
    category: "Simulation",
    level: "Para/Story",
    description: "Sequence stories and paragraphs to build reading comprehension.",
    id: "SentenceArchitect",
    link: "/resources/simulations?id=sentence-arch"
  },
  {
    title: "Flash Math Sprint",
    category: "Simulation",
    tags: ["2v2", "Competitive", "Timer"],
    description: "2v2 Arithmetic Race: Solve addition and subtraction problems against the clock!",
    id: "MathSprint",
    link: "/resources/simulations?id=math-sprint"
  },
  {
    title: "Phonics Sound Duel",
    category: "Simulation",
    tags: ["2v2", "Competitive", "Timer"],
    description: "2v2 Literacy Battle: Match the sound to the correct letter faster than the other team.",
    id: "SoundDuel",
    link: "/resources/simulations?id=sound-duel"
  },
  {
    title: "🛒 Math Mania Market",
    category: "Simulation",
    level: "Operations",
    tags: ["Ultimate", "Marketplace", "All Operations"],
    description: "Ultimate Math Mania — Earn rupees by solving math challenges, then spend them in a full Marathi marketplace across 6 unlockable stalls.",
    id: "math-mania-market",
    link: "/resources/simulations?id=math-mania-market"
  },
  {
    title: "🍬 अक्षर कँडी",
    category: "Simulation",
    level: "Word",
    tags: ["Marathi", "Match-3", "Matra"],
    description: "Candy Crush–style matra matching game. Swap Marathi syllables to line up 3+ of the same vowel sound and clear the board.",
    id: "akshar-crush",
    link: "/resources/simulations?id=akshar-crush"
  },
  {
    title: "📖 Vachan Pravas",
    category: "Simulation",
    level: "Para/Story",
    tags: ["Ultimate", "Marathi", "4 Worlds"],
    description: "Ultimate Marathi Literacy Quest — Journey through 4 worlds (Letters → Words → Sentences → Stories) earning pearls across 24 challenges.",
    id: "vachan-pravas",
    link: "/resources/simulations?id=vachan-pravas"
  },
  {
    title: "🎡 मात्रा चक्र (Matra Chakra)",
    category: "Simulation",
    level: "Word",
    tags: ["Marathi", "Literacy", "Matra"],
    description: "Interactive spinning wheel game for Marathi matra pairing. Pair consonants with the correct matra sound.",
    id: "matra-chakra",
    link: "/resources/simulations?id=matra-chakra"
  },
  {
    title: "🐍 ज्ञानशिडी (GyanSidi)",
    category: "Simulation",
    level: "Operations",
    tags: ["Featured", "Mixed", "Board Game"],
    description: "Indian Village themed Snakes & Ladders with a twist: answer challenges to avoid snakes and climb ladders!",
    id: "gyansidi",
    link: "/resources/simulations?id=gyansidi"
  }
];
