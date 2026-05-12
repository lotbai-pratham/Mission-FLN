"use client";
import React, { useState, useEffect } from "react";
import { Heart, Sparkles, ArrowRight, RefreshCw, Trophy, Home, Book, Map, Stars } from "lucide-react";
import { cn } from "@/lib/utils";

interface Chapter {
  id: number;
  title: string;
  situation: string;
  imageEmoji: string;
  choices: {
    text: string;
    impact: number; // -10 to +20
    feedback: string;
  }[];
}

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: "शाळेचा पहिला प्रसंग",
    situation: "बडी शाळेत जात असताना त्याला दिसले की एका लहान मुलाचे दप्तर खूप जड आहे आणि तो ओझे पेलू शकत नाहीये.",
    imageEmoji: "🎒",
    choices: [
      { 
        text: "त्याला दप्तर उचलण्यात मदत करा.", 
        impact: 20, 
        feedback: "खूप छान! तुमच्या मदतीमुळे तो मुलगा आनंदी झाला." 
      },
      { 
        text: "त्याच्याकडे बघून हसा.", 
        impact: -20, 
        feedback: "अरेरे! तुमच्या हसण्यामुळे त्याला वाईट वाटले." 
      },
      { 
        text: "काहीच न करता पुढे निघून जा.", 
        impact: 0, 
        feedback: "तुम्ही त्याला मदत करण्याची संधी गमावली." 
      }
    ]
  },
  {
    id: 2,
    title: "खेळाचे मैदान",
    situation: "मैदानावर एक मुलगी तिचा चेंडू हरवल्यामुळे रडत आहे. तिला तिचा आवडता खेळ खेळता येत नाहीये.",
    imageEmoji: "⚽",
    choices: [
      { 
        text: "तिला तिचा चेंडू शोधण्यात मदत करा.", 
        impact: 20, 
        feedback: "तुमच्या सहकार्यामुळे तिला तिचा चेंडू सापडला!" 
      },
      { 
        text: "तुमच्याकडे असलेला चेंडू तिला खेळायला द्या.", 
        impact: 20, 
        feedback: "खूपच दयाळू! शेअर केल्यामुळे आनंद द्विगुणित होतो." 
      },
      { 
        text: "तिला म्हणाल 'हे तर नेहमीचेच आहे'.", 
        impact: -10, 
        feedback: "तुमच्या बोलण्यामुळे तिला अधिकच दुःख झाले." 
      }
    ]
  },
  {
    id: 3,
    title: "वर्गातील वेळ",
    situation: "वर्गात एका विद्यार्थ्याने चुकीचे उत्तर दिले आणि काही मुले त्याची थट्टा करू लागली.",
    imageEmoji: "🏫",
    choices: [
      { 
        text: "त्याला धीर द्या आणि म्हणा 'चूक होणे स्वाभाविक आहे'.", 
        impact: 20, 
        feedback: "तुमच्या पाठिंब्यामुळे त्याला आत्मविश्वास मिळाला." 
      },
      { 
        text: "थट्टा करणाऱ्या मुलांना थांबवा.", 
        impact: 20, 
        feedback: "शूर निवड! चुकीच्या गोष्टीला विरोध करणे महत्त्वाचे आहे." 
      },
      { 
        text: "तुम्ही सुद्धा थट्टेत सामील व्हा.", 
        impact: -30, 
        feedback: "खूपच वाईट! दुसऱ्याच्या दुःखात सहभागी होणे चुकीचे आहे." 
      }
    ]
  }
];

export default function BuddyBigDay({ onClose }: { onClose?: () => void }) {
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [gameState, setGameState] = useState<"intro" | "story" | "choice-feedback" | "complete">("intro");
  const [heartValue, setHeartValue] = useState(50); // 0 to 100
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState<number | null>(null);

  const chapter = CHAPTERS[currentChapterIdx];

  const handleChoice = (idx: number) => {
    const choice = chapter.choices[idx];
    setSelectedChoiceIdx(idx);
    setHeartValue(prev => Math.min(100, Math.max(0, prev + choice.impact)));
    setGameState("choice-feedback");
  };

  const nextStep = () => {
    if (currentChapterIdx < CHAPTERS.length - 1) {
      setCurrentChapterIdx(prev => prev + 1);
      setSelectedChoiceIdx(null);
      setGameState("story");
    } else {
      setGameState("complete");
    }
  };

  const restart = () => {
    setCurrentChapterIdx(0);
    setHeartValue(50);
    setSelectedChoiceIdx(null);
    setGameState("intro");
  };

  // Environment saturation based on heart value
  const saturation = heartValue / 100;
  const bgColor = `rgba(244, 63, 94, ${0.05 + saturation * 0.1})`;

  return (
    <div 
      className="relative w-full md:aspect-video md:min-h-[500px] min-h-[480px] rounded-[48px] overflow-hidden border-4 md:border-8 border-white shadow-2xl flex flex-col font-sans transition-colors duration-1000"
      style={{ backgroundColor: heartValue < 30 ? "#f1f5f9" : bgColor }}
    >
      {/* Dynamic Background Saturation Filter */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-1000" 
        style={{ 
          backdropFilter: `saturate(${0.2 + saturation * 1.5}) contrast(${0.9 + saturation * 0.2})`,
          background: `radial-gradient(circle at 50% 50%, transparent 0%, ${heartValue < 40 ? 'rgba(0,0,0,0.1)' : 'transparent'} 100%)`
        }} 
      />

      {/* Header / Heart Meter */}
      <div className="relative z-10 p-4 md:p-8 flex justify-between items-center">
        <div className="flex items-center gap-4 bg-white/40 backdrop-blur-xl px-6 py-3 rounded-3xl border border-white/20 shadow-xl">
           <div className="relative">
             <Heart 
               className={cn(
                 "w-6 h-6 md:w-10 md:h-10 transition-all duration-500", 
                 heartValue > 70 ? "text-rose-500 fill-rose-500 scale-125" : 
                 heartValue < 30 ? "text-slate-400 scale-90" : "text-rose-400 fill-rose-200"
               )} 
             />
             {heartValue > 80 && <Sparkles className="absolute -top-2 -right-2 text-yellow-400 animate-pulse" />}
           </div>
           <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-500">हृदय मीटर</p>
             <div className="w-32 h-3 bg-slate-200 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-1000" 
                 style={{ width: `${heartValue}%` }}
               />
             </div>
           </div>
        </div>

        <div className="bg-white/40 backdrop-blur-xl px-6 py-3 rounded-3xl border border-white/20 shadow-xl flex items-center gap-3">
           <Map className="text-indigo-500" size={24} />
           <span className="font-black text-slate-700 uppercase tracking-widest text-sm">प्रकरण {currentChapterIdx + 1} / {CHAPTERS.length}</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 md:p-8">
        {gameState === "intro" && (
          <div className="text-center space-y-8 animate-in fade-in zoom-in-95 duration-700 max-w-2xl">
            <div className="text-[60px] md:text-[120px] filter drop-shadow-2xl animate-bounce-slow">🦸‍♂️</div>
            <div className="space-y-4">
              <h1 className="text-3xl md:text-6xl font-black text-slate-900 leading-tight">बडीचा <br/><span className="text-rose-500 italic">मोठा दिवस</span></h1>
              <p className="text-xl text-slate-600 font-medium">बडीला त्याच्या शाळेच्या प्रवासात मदत करा. तुमच्या निवडीमुळे जगाचे रंग बदलतील!</p>
            </div>
            <button 
              onClick={() => setGameState("story")}
              className="px-14 py-6 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-3xl shadow-[0_20px_50px_rgba(244,63,94,0.3)] hover:scale-110 active:scale-95 transition-all text-2xl flex items-center gap-4 mx-auto"
            >
              प्रवास सुरू करा <ArrowRight size={32} />
            </button>
          </div>
        )}

        {gameState === "story" && (
          <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-16 items-center animate-in fade-in slide-in-from-right-12 duration-700">
             <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-tr from-rose-500 to-indigo-500 rounded-[60px] opacity-20 blur-2xl group-hover:opacity-30 transition-opacity" />
                 <div className="relative bg-white/60 backdrop-blur-md p-6 md:p-12 rounded-[32px] md:rounded-[56px] border border-white/40 shadow-2xl text-center">
                   <div className="text-7xl md:text-[160px] mb-4 md:mb-8 select-none filter drop-shadow-2xl">{chapter.imageEmoji}</div>
                   <h2 className="text-xl md:text-3xl font-black text-slate-800 leading-relaxed italic">"{chapter.situation}"</h2>
                </div>
             </div>

              <div className="space-y-2 md:space-y-4">
                 <p className="text-center font-black text-slate-400 uppercase tracking-[4px] md:tracking-[6px] text-[10px] mb-4 md:mb-8">आता तुमची पाळी आहे...</p>
                {chapter.choices.map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => handleChoice(i)}
                    className="w-full p-4 md:p-8 bg-white hover:bg-rose-50 border-2 border-transparent hover:border-rose-200 rounded-2xl md:rounded-[32px] text-left transition-all shadow-xl md:hover:-translate-x-3 group flex items-center justify-between"
                  >
                    <span className="text-xs md:text-xl font-bold text-slate-700 leading-tight group-hover:text-rose-600 transition-colors">{choice.text}</span>
                    <div className="w-6 h-6 md:w-12 md:h-12 bg-slate-50 rounded-lg md:rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-rose-500 group-hover:text-white transition-all">
                       <ArrowRight className="w-4 h-4 md:w-6 md:h-6" />
                    </div>
                  </button>
                ))}
             </div>
          </div>
        )}

        {gameState === "choice-feedback" && selectedChoiceIdx !== null && (
          <div className="text-center space-y-10 animate-in zoom-in duration-500 max-w-3xl">
             <div className="relative inline-block">
                <div className="text-[140px] filter drop-shadow-2xl">
                  {chapter.choices[selectedChoiceIdx].impact > 0 ? "✨" : chapter.choices[selectedChoiceIdx].impact < 0 ? "🌧️" : "☁️"}
                </div>
                {chapter.choices[selectedChoiceIdx].impact > 0 && <Stars className="absolute -top-4 -right-4 w-12 h-12 text-yellow-400 animate-spin-slow" />}
             </div>
             <div className="space-y-4">
                <h3 className="text-4xl font-black text-slate-800 leading-tight">
                  {chapter.choices[selectedChoiceIdx].feedback}
                </h3>
                <p className="text-slate-500 text-lg">तुमच्या निवडीमुळे बडीचे हृदय आता अधिक {heartValue > 50 ? 'आनंदी' : 'गंभीर'} झाले आहे.</p>
             </div>
             <button 
                onClick={nextStep}
                className="px-12 py-5 bg-slate-900 text-white font-black rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all text-xl"
              >
                पुढील प्रसंग <ArrowRight className="inline ml-2" />
              </button>
          </div>
        )}

        {gameState === "complete" && (
          <div className="text-center space-y-8 animate-in zoom-in duration-700 max-w-2xl">
             <div className="relative">
                <Trophy className="w-40 h-40 text-yellow-500 mx-auto drop-shadow-[0_20px_50px_rgba(234,179,8,0.4)]" />
                <div className="absolute inset-0 flex items-center justify-center opacity-40">
                   <Stars className="w-64 h-64 text-yellow-300 animate-spin-slow" />
                </div>
             </div>
             <div className="space-y-3">
               <h2 className="text-6xl font-black text-slate-900">प्रवास पूर्ण झाला!</h2>
               <p className="text-2xl text-slate-600 font-medium">तुम्ही बडीच्या आयुष्यात <span className="text-rose-500 font-black">{heartValue}% दयाळूपणा</span> भरलात.</p>
             </div>
             <div className="flex gap-6 justify-center pt-4">
               <button 
                 onClick={restart}
                 className="px-10 py-5 bg-white text-slate-900 font-black rounded-3xl shadow-xl hover:scale-105 transition-all border-b-4 border-slate-200 flex items-center gap-3"
               >
                 <RefreshCw size={24} /> पुन्हा खेळा
               </button>
               {onClose && (
                 <button 
                  onClick={onClose}
                  className="px-10 py-5 bg-rose-500 text-white font-black rounded-3xl shadow-xl hover:scale-105 transition-all flex items-center gap-3"
                >
                  <Home size={24} /> आर्केडवर परत जा
                </button>
               )}
             </div>
          </div>
        )}
      </div>

      {/* Background Saturation Note */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-400 uppercase tracking-[4px] opacity-50 z-10">
        हृदयाच्या रंगाने जग बदलते
      </div>
    </div>
  );
}
