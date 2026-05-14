"use client";
import React, { useState, useEffect } from "react";
import { Heart, Flower, Sun, CloudRain, ArrowRight, RefreshCw, Star, Info, Users, Home, Smile, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface Scenario {
  id: number;
  situation: string;
  emoji: string;
  character: string;
  correctEmotion: string;
  emotions: string[];
  bestAction: string;
  actions: string[];
  outcome: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    situation: "राहुलचा आवडता आईस्क्रीम खाली पडला.",
    emoji: "🍦",
    character: "राहुल",
    correctEmotion: "दुःखी 😢",
    emotions: ["दुःखी 😢", "रागीट 😠", "आनंदी 😄", "घाबरलेला 😨"],
    bestAction: "तुझा आईस्क्रीम त्याला दे किंवा त्याला समजाव.",
    actions: ["तुझा आईस्क्रीम त्याला दे किंवा त्याला समजाव.", "त्याच्यावर हस.", "तिथून निघून जा.", "त्याला सांग की हे फक्त आईस्क्रीम आहे."],
    outcome: "राहुलला बरे वाटले कारण त्याला समजले की तुला त्याच्या भावनांची काळजी आहे!"
  },
  {
    id: 2,
    situation: "शाळेच्या जेवणाच्या सुट्टीत एक नवीन विद्यार्थी एकटाच बसला आहे.",
    emoji: "🏫",
    character: "नवीन विद्यार्थी",
    correctEmotion: "एकटेपणा 😔",
    emotions: ["एकटेपणा 😔", "उत्साही 🤩", "कंटाळलेला 😑", "झोपलेला 😴"],
    bestAction: "त्याच्याजवळ जा आणि त्याला 'नमस्कार' म्हणा.",
    actions: ["त्याच्याजवळ जा आणि त्याला 'नमस्कार' म्हणा.", "तुझ्या मित्रांसोबत खेळत राहा.", "लांबूनच त्याच्याकडे बघत राहा.", "त्याला सांग की ही तुझी जागा आहे."],
    outcome: "तुम्ही एक नवीन मित्र बनवला! आता त्याला स्वागतार्ह आणि आनंदी वाटत आहे."
  },
  {
    id: 3,
    situation: "सिताने एका चित्रावर खूप मेहनत केली होती, पण चुकून कोणाकडून तरी त्यावर पाणी सांडले.",
    emoji: "🎨",
    character: "सिता",
    correctEmotion: "रागीट 😠",
    emotions: ["रागीट 😠", "आनंदी 😄", "मजेदार 🤣", "गर्विष्ठ 😎"],
    bestAction: "तिला चित्र सुकवण्यासाठी मदत कर किंवा नवीन चित्र काढायला सांग.",
    actions: ["तिला चित्र सुकवण्यासाठी मदत कर किंवा नवीन चित्र काढायला सांग.", "तिला रडू नकोस असे सांग.", "काही हरकत नाही असे म्हण.", "तिच्याकडे दुर्लक्ष कर."],
    outcome: "सिताला तुझ्या मदतीबद्दल आनंद झाला. मित्रासोबत गोष्टी सुधारणे खूप सोपे असते!"
  },
  {
    id: 4,
    situation: "तुझ्या मित्राला संपूर्ण वर्गासमोर बोलायचे आहे आणि तो खूप घाबरला आहे.",
    emoji: "🎤",
    character: "तुझा मित्र",
    correctEmotion: "घाबरलेला 😰",
    emotions: ["घाबरलेला 😰", "रागीट 😠", "शूर 🦁", "भुकेलेला 🍎"],
    bestAction: "त्याला प्रोत्साहन दे आणि म्हण 'तू हे करू शकतोस!'",
    actions: ["त्याला प्रोत्साहन दे आणि म्हण 'तू हे करू शकतोस!'", "त्याला सांग की सगळे तुला बघत आहेत.", "त्याचे लक्ष विचलित करण्यासाठी मजेशीर चेहरे कर.", "वर्गाबाहेर जा."],
    outcome: "तुझ्या प्रोत्साहनामुळे त्याला स्पष्टपणे बोलण्याचा आत्मविश्वास मिळाला!"
  }
];

const GARDEN_FLOWERS = ["🌸", "🌻", "🌷", "🌹", "🌼", "🌺", "🌿", "🌳", "🦋"];

export default function EmpathyHero({ onClose }: { onClose?: () => void }) {
  const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0);
  const [gameState, setGameState] = useState<"feeling" | "action" | "result" | "complete">("feeling");
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [garden, setGarden] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "neutral", text: string } | null>(null);

  const scenario = SCENARIOS[currentScenarioIdx];

  const handleEmotionSelect = (emotion: string) => {
    setSelectedEmotion(emotion);
    if (emotion === scenario.correctEmotion) {
      setFeedback({ type: "success", text: "बरोबर! तू ओळखलेस की त्यांना कसे वाटते." });
      setTimeout(() => {
        setGameState("action");
        setFeedback(null);
      }, 1500);
    } else {
      setFeedback({ type: "neutral", text: "नाही, परिस्थिती पुन्हा एकदा नीट बघ." });
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const handleActionSelect = (action: string) => {
    setSelectedAction(action);
    if (action === scenario.bestAction) {
      setFeedback({ type: "success", text: "खूपच छान! तू खूप दयाळू निवड केलीस." });
      setGarden(prev => [...prev, GARDEN_FLOWERS[Math.floor(Math.random() * GARDEN_FLOWERS.length)]]);
    } else {
      setFeedback({ type: "neutral", text: "दुसरा मार्ग अधिक चांगला असू शकतो. त्यांच्या भावनांचा विचार कर." });
    }
    
    setTimeout(() => {
      setGameState("result");
      setFeedback(null);
    }, 1500);
  };

  const nextScenario = () => {
    if (currentScenarioIdx < SCENARIOS.length - 1) {
      setCurrentScenarioIdx(prev => prev + 1);
      setSelectedEmotion(null);
      setSelectedAction(null);
      setGameState("feeling");
    } else {
      setGameState("complete");
    }
  };

  const restart = () => {
    setCurrentScenarioIdx(0);
    setGarden([]);
    setSelectedEmotion(null);
    setSelectedAction(null);
    setGameState("intro");
  };

  return (
    <div className="relative w-full md:min-h-[648px] min-h-[450px] bg-gradient-to-br from-pink-50 via-rose-50 to-indigo-50 rounded-[40px] overflow-visible border-4 md:border-8 border-white shadow-2xl flex flex-col font-sans">
      {/* Kindness Garden (Background) */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-emerald-100/50 flex items-end px-12 py-4 gap-2 overflow-hidden z-0">
        {garden.map((flower, i) => (
          <div key={i} className="text-4xl animate-bounce-slow" style={{ animationDelay: `${i * 0.2}s` }}>
            {flower}
          </div>
        ))}
        {garden.length === 0 && (
          <p className="text-emerald-800/30 font-black italic uppercase tracking-widest text-sm w-full text-center pb-4">
            तुमची दयाळूपणाची बाग इथे वाढेल...
          </p>
        )}
      </div>

      {/* Floating Sparkles Decor */}
      <div className="absolute top-10 right-10 text-yellow-400/20 animate-pulse"><Sun size={120} /></div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col p-4 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 md:px-6 py-2 md:py-2.5 rounded-full shadow-sm border border-pink-100">
            <Heart className="text-rose-500 fill-rose-500 animate-pulse" size={18} />
            <span className="font-black text-rose-900 uppercase tracking-widest text-[10px] md:text-sm">सहानुभूती नायक</span>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/80 backdrop-blur-md px-6 py-2.5 rounded-full shadow-sm border border-emerald-100 flex items-center gap-2">
               <Flower className="text-emerald-500" size={20} />
               <span className="font-black text-emerald-900">{garden.length} फुले</span>
            </div>
            {onClose && (
              <button onClick={onClose} className="w-11 h-11 flex items-center justify-center bg-white/80 hover:bg-white rounded-full shadow-sm transition-all text-slate-400">
                <RefreshCw size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Game Area */}
        <div className="flex-1 flex flex-col items-center justify-center">

          {(gameState === "feeling" || gameState === "action" || gameState === "result") && (
            <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-12 items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
              {/* Situation Card */}
              <div className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-8 shadow-2xl border-b-8 border-slate-100 relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Smile size={120} /></div>
                <div className="relative z-10 space-y-4 md:space-y-6">
                  <div className="w-14 h-14 md:w-20 md:h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl md:text-5xl shadow-inner">
                    {scenario.emoji}
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[3px] text-indigo-400">परिस्थिती</p>
                    <h2 className="text-lg md:text-2xl font-black text-slate-800 leading-tight md:leading-snug">{scenario.situation}</h2>
                  </div>
                </div>
              </div>

              {/* Options Column */}
              <div className="space-y-6">
                {gameState === "feeling" && (
                  <>
                    <p className="text-center font-black text-slate-400 uppercase tracking-widest text-xs">{scenario.character} ला कसे वाटत असेल?</p>
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                       {scenario.emotions.map((emo, i) => (
                        <button
                          key={i}
                          onClick={() => handleEmotionSelect(emo)}
                          className={cn(
                            "p-3 md:p-5 bg-white hover:bg-rose-50 border-2 border-transparent hover:border-rose-200 rounded-xl md:rounded-3xl font-black text-[10px] md:text-base text-slate-700 transition-all shadow-lg hover:-translate-y-1 active:translate-y-0",
                            selectedEmotion === emo && emo === scenario.correctEmotion && "border-emerald-500 bg-emerald-50 text-emerald-700",
                            selectedEmotion === emo && emo !== scenario.correctEmotion && "border-rose-500 bg-rose-50 text-rose-700 opacity-50"
                          )}
                        >
                          {emo}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {gameState === "action" && (
                  <>
                    <p className="text-center font-black text-slate-400 uppercase tracking-widest text-xs">तुम्ही मदत करण्यासाठी काय कराल?</p>
                    <div className="space-y-2 md:space-y-3">
                      {scenario.actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleActionSelect(act)}
                          className={cn(
                            "w-full p-3 md:p-5 bg-white hover:bg-indigo-50 border-2 border-transparent hover:border-indigo-200 rounded-xl md:rounded-3xl font-bold text-slate-700 text-left transition-all shadow-lg text-xs md:text-base hover:-translate-x-1",
                            selectedAction === act && act === scenario.bestAction && "border-emerald-500 bg-emerald-50 text-emerald-700",
                            selectedAction === act && act !== scenario.bestAction && "border-amber-500 bg-amber-50 text-amber-700"
                          )}
                        >
                          {act}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {gameState === "result" && (
                  <div className="text-center space-y-6 animate-in zoom-in duration-500">
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-6 py-2 rounded-full font-black uppercase tracking-widest text-xs mb-4">
                      <Star size={16} fill="currentColor" /> निकाल
                    </div>
                    <p className="text-2xl font-bold text-slate-700 leading-relaxed italic">"{scenario.outcome}"</p>
                    <button 
                      onClick={nextScenario}
                      className="px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                    >
                      पुढील प्रसंग <ArrowRight />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {gameState === "complete" && (
            <div className="text-center space-y-8 animate-in zoom-in duration-500">
               <div className="relative">
                  <div className="absolute inset-0 animate-ping opacity-20"><Star className="w-32 h-32 text-yellow-400 mx-auto" /></div>
                  <Trophy className="w-32 h-32 text-yellow-500 mx-auto drop-shadow-2xl" />
               </div>
               <div className="space-y-2">
                 <h2 className="text-5xl font-black text-rose-950">तू खरा नायक आहेस!</h2>
                 <p className="text-slate-500 text-xl font-medium">तू यशस्वीरीत्या शोध पूर्ण केला आणि {garden.length} फुले फुलवली.</p>
               </div>
               <div className="flex gap-4 justify-center">
                 <button 
                   onClick={restart}
                   className="px-10 py-4 bg-white text-slate-900 font-black rounded-2xl shadow-xl hover:scale-105 transition-all border-b-4 border-slate-100 flex items-center gap-2"
                 >
                   <RefreshCw size={20} /> पुन्हा खेळा
                 </button>
                 {onClose && (
                   <button 
                    onClick={onClose}
                    className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all"
                  >
                    आर्केडवर परत जा
                  </button>
                 )}
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Feedback HUD */}
      {feedback && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className={cn(
            "px-10 py-6 rounded-[32px] shadow-2xl font-black text-2xl animate-in zoom-in slide-in-from-bottom-8 duration-300",
            feedback.type === "success" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
          )}>
            {feedback.text}
          </div>
        </div>
      )}
    </div>
  );
}
