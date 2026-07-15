export const dynamic = 'force-dynamic';
import { getStudentProfile } from "@/app/actions";
import { User, BookOpen, Calculator, MapPin, Calendar, Lightbulb, GraduationCap, Flame, ArrowRight, Clock, ShieldCheck, TrendingUp, Minus, TrendingDown, Sparkles, Gamepad2, Trophy, Star, Target } from "lucide-react";
import Link from "next/link";
import { LITERACY_ACTIVITIES, NUMERACY_ACTIVITIES, PedagogyActivity } from "@/lib/pedagogy_data";
import ProgressChart from "@/components/ProgressChart";
import { cookies } from 'next/headers';
import { translations, Language } from "@/context/LanguageContext";

const LEVEL_LABELS_LIT = ['Beginner', 'Letter', 'Word', 'Paragraph', 'Story'];
const LEVEL_LABELS_NUM = ['Beginner', 'Num 1-9', 'Num 10-99', 'Addition', 'Subtraction', 'Math Division'];

const GAME_SLUG_TO_TITLE: Record<string, string> = {
  // Arena / Battle slugs
  'marathi-letters': 'अक्षर ओळख (Letter Flash)',
  'marathi-words': 'शब्द वाचन (Word Race)',
  'marathi-sent': 'वाक्य पूर्ण करा (Sentence Fill)',
  'math-duel-b': 'Math Duel',
  'num-race-b': 'Number Race',
  'pv-battle-b': 'Place Value Battle',
  'math-sprint': 'Math Sprint',
  'sound-duel': 'Sound Duel',
  'tili-duel': 'Bundle Duel',
  'gyansidi': '🐍 ज्ञानशिडी (GyanSidi)',
  'g-jungle': 'Jungle Fight',
  // Practise simulations
  'number-hunter': 'Number Hunter',
  'bundle-builder': 'Bundle Builder',
  'addition-master': 'Addition Master',
  'sound-explorer': 'Sound Explorer',
  'word-builder': 'Word Builder',
  'sentence-arch': 'Sentence Architect',
  'chaudakhadi': 'चौदाखडी Chart',
  'story-reader': 'Story Reader',
  'number-line': 'Number Line',
  'math-mania-market': '🛒 Math Mania Market',
  'vachan-pravas': '📖 Vachan Pravas',
  'akshar-crush': '🍬 अक्षर कँडी',
  'matra-chakra': '🎡 मात्रा चक्र',
  'fraction-viz': '🍰 Fractions Explorer',
  'digital-abacus': '🧮 Digital Abacus',
  'division-sim': '➗ Division Fun',
  'equal-sharing': '🍎 Equal Sharing',
  'multi-sim': '✖️ Multiplier',
  'repeat-add': '➕ Repeated Addition',
  'sankhya-chakra': '☸️ संख्या चक्र',
  // Practice games
  'g-oddone': 'Odd One Out',
  'g-letters': 'Letter Explorer',
  'g-missing': 'Missing Letter',
  'g-fish': 'Fish Word Catch',
  'g-rhyme': 'Rhyme Time',
  'g-sentence': 'Sentence Builder',
  'g-story': 'Story Sequence',
  'g-truefalse': 'True or False',
  'g-bigger': 'Bigger or Smaller',
  'g-counting': 'Count the Stones',
  'g-numbertrain': 'Number Train',
  'g-weights': 'Balance the Scale',
  'g-placevalue': 'Place Value Builder',
  'g-bonds': 'Number Bonds',
  'g-market': 'Market Math',
  'g-river': 'Number River',
  'g-clock': 'Clock Reader',
  'g-sorting': 'Sorting Hat',
  'g-matra': 'Matra Practice',
  'g-empathy': '❤️ सहानूभूती नायक (Empathy Hero)',
  'g-buddy': '🦸‍♂️ बडीचा मोठा दिवस (Buddy\'s Big Day)',
  'g-germs': '🧼 स्वच्छता रक्षक (Germ Buster)',
  'g-plate': '🍏 आरोग्यदायी थाळी (Healthy Plate)',
  'g-routine': '⏰ माझी दिनचर्या (Daily Routine)',
  'g-waste': '♻️ कचरा व्यवस्थापन (Waste Sort)',
};

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const student = await getStudentProfile(resolvedParams.id);
  
  const cookieStore = await cookies();
  const langCookie = cookieStore.get('app-language')?.value as Language | undefined;
  const lang: Language = (langCookie === 'en' || langCookie === 'hi' || langCookie === 'mr') ? langCookie : 'en';
  const t = (key: string): string => {
    return translations[lang]?.[key] ?? key;
  };
  
  if (!student) return <div className="p-10 text-center text-slate-500">{t('Student not found.')}</div>;

  const latestAssessment = student.assessments[0]; // Ordered by date desc
  const litLevel = latestAssessment?.literacyLevel ?? -1;
  const dbNumLevel = latestAssessment?.numeracyLevel ?? -1;
  const numLevel = dbNumLevel === 6 ? 5 : dbNumLevel === 5 ? 4 : dbNumLevel;

  const litActivities = LITERACY_ACTIVITIES[litLevel] || [];
  const numActivities = NUMERACY_ACTIVITIES[numLevel] || [];

  // Gameplay Calculations
  const battlesAsP1 = student.battlesAsP1 || [];
  const battlesAsP2 = student.battlesAsP2 || [];
  const battleCount = battlesAsP1.length + battlesAsP2.length;
  const singleGameCount = student.singleGames?.length || 0;
  
  const totalPracticeSeconds = student.singleGames?.reduce((sum, g) => sum + g.duration, 0) || 0;
  const estimatedBattleSeconds = battleCount * 60; // Estimate 1 minute per battle
  const totalPlaytimeSeconds = totalPracticeSeconds + estimatedBattleSeconds;

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const battles = [
    ...battlesAsP1.map((b: any) => ({ ...b, role: 'P1' as const })),
    ...battlesAsP2.map((b: any) => ({ ...b, role: 'P2' as const }))
  ].sort((a: any, b: any) => new Date(b.conductedAt).getTime() - new Date(a.conductedAt).getTime());

  // Derived Gamification Metrics
  const totalXP = (student.singleGames?.reduce((sum, g) => sum + g.score, 0) || 0) + (battleCount * 20); // battles give 20 XP each
  const derivedLevel = Math.floor(Math.sqrt(totalXP / 10)) + 1; // Simple progression curve
  const battlesWon = battles.filter(b => b.winnerId === student.id).length;
  const winRate = battleCount > 0 ? Math.round((battlesWon / battleCount) * 100) : 0;
  
  // Most played game logic
  const gameCounts: Record<string, number> = {};
  student.singleGames?.forEach(g => {
    gameCounts[g.gameSlug] = (gameCounts[g.gameSlug] || 0) + 1;
  });
  battles.forEach(b => {
    gameCounts[b.gameSlug] = (gameCounts[b.gameSlug] || 0) + 1;
  });
  let mostPlayedGameSlug = "None";
  let maxPlayed = 0;
  for (const [slug, count] of Object.entries(gameCounts)) {
    if (count > maxPlayed) {
      mostPlayedGameSlug = slug;
      maxPlayed = count;
    }
  }
  const mostPlayedGame = maxPlayed > 0 ? (GAME_SLUG_TO_TITLE[mostPlayedGameSlug] || mostPlayedGameSlug) : t("N/A");

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in zoom-in-95 duration-500">
       
       <Link href="/students" className="text-sm font-bold flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors">
         ← {t('Back to Directory')}
       </Link>

       {/* Enhanced Profile Header Card */}
       <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 sm:p-10 border border-slate-700 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
            
            {/* Avatar & Level Ring */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-slate-800 p-1 relative z-10 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/30">
                <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-indigo-400" />
                </div>
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-xs px-4 py-1.5 rounded-full border-2 border-slate-900 shadow-lg whitespace-nowrap z-20">
                {t('Level')} {derivedLevel}
              </div>
            </div>

            {/* Student Info */}
            <div className="flex-1 text-center md:text-left space-y-3">
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <span className="text-[10px] font-black tracking-widest bg-white/10 text-white px-3 py-1 rounded-full uppercase backdrop-blur-md border border-white/10">
                    {t('FLN Progress Report')}
                  </span>
                  <span className="text-[10px] font-black tracking-wider bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/20 uppercase">
                    UID: {student.uid}
                  </span>
               </div>
               
               <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">{student.name}</h1>
               
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm font-medium text-slate-300">
                  <span className="flex items-center gap-1.5 bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700"><MapPin className="w-4 h-4 text-slate-400"/> {student.school.name}</span>
                  <span className="flex items-center gap-1.5 bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700"><GraduationCap className="w-4 h-4 text-slate-400"/> {t('Class')} {student.class}</span>
                  <span className="flex items-center gap-1.5 bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700">{t(student.gender)}</span>
               </div>
            </div>

            {/* Action & XP */}
            <div className="flex flex-col items-center md:items-end gap-4 min-w-[140px]">
               <div className="text-center md:text-right">
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{t('Total XP')}</p>
                 <div className="flex items-center justify-center md:justify-end gap-2 text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
                   <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                   {totalXP.toLocaleString()}
                 </div>
               </div>
               <Link href="/assessments/live" className="w-full justify-center px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 font-black rounded-2xl shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all flex items-center gap-2 hover:scale-105 active:scale-95">
                 <Target className="w-5 h-5 text-indigo-600"/> {t('Assess')}
               </Link>
            </div>
          </div>
       </div>

       {/* Enhanced Gameplay & Practice Stats Grid */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Practice Games', value: singleGameCount, icon: Gamepad2, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Arena Battles', value: battleCount, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
            { label: 'Win Rate', value: `${winRate}%`, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            { label: 'Playtime', value: formatTime(totalPlaytimeSeconds), icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' }
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group">
               <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <stat.icon className="w-5 h-5" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{t(stat.label)}</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{stat.value}</p>
               </div>
            </div>
          ))}
       </div>
       
       {/* Most Played Game Banner */}
       {maxPlayed > 0 && (
         <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/10 dark:to-fuchsia-900/10 border border-violet-100 dark:border-violet-900/30 rounded-3xl p-5 flex items-center justify-between shadow-sm">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center">
               <Sparkles className="w-5 h-5" />
             </div>
             <div>
               <p className="text-[10px] font-black text-violet-400 dark:text-violet-500 uppercase tracking-widest">{t('Favorite Simulation')}</p>
               <p className="font-bold text-slate-800 dark:text-slate-200">{mostPlayedGame}</p>
             </div>
           </div>
           <div className="text-right">
             <p className="text-2xl font-black text-violet-600 dark:text-violet-400">{maxPlayed}</p>
             <p className="text-[10px] font-black text-violet-400 dark:text-violet-500 uppercase tracking-widest">{t('Plays')}</p>
           </div>
         </div>
       )}

       {/* Pedagogy Interventions */}
       {latestAssessment ? (
         <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-500"/>
              </div>
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{t('Recommended Pedagogy Activities')}</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
               {/* Literacy Recommendation */}
               <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border-2 border-orange-100 dark:border-orange-900/30 shadow-lg shadow-orange-100/50 dark:shadow-none relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 dark:bg-orange-900/10 rounded-bl-full -mr-4 -mt-4 pointer-events-none"></div>
                  
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-black uppercase tracking-[0.2em] text-[10px]">
                      <BookOpen className="w-4 h-4"/> {t('Literacy Focus')}
                    </div>
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm">
                      {t(LEVEL_LABELS_LIT[litLevel] || 'Beginner')}
                    </span>
                  </div>
                  
                  <div className="space-y-4 relative z-10">
                    {litActivities.length > 0 ? litActivities.map((act, i) => (
                      <div key={i} className="group p-4 bg-orange-50/50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-900/30 hover:bg-orange-100/50 dark:hover:bg-orange-900/20 transition-colors">
                         <h3 className="text-sm font-bold text-orange-900 dark:text-orange-200 mb-1 flex justify-between items-center">
                           {t(act.title)}
                           <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                         </h3>
                         <p className="text-xs text-orange-800/70 dark:text-orange-300/70 leading-relaxed mb-3">{t(act.description)}</p>
                         <div className="flex flex-wrap gap-1.5">
                            {act.materials.map((m, j) => (
                              <span key={j} className="text-[9px] font-bold bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-md border border-orange-200/50 dark:border-orange-800/50">{t(m)}</span>
                            ))}
                         </div>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-orange-400/50 bg-orange-50/30 dark:bg-orange-900/10 rounded-3xl border border-dashed border-orange-200 dark:border-orange-900/30 text-xs font-bold">
                         {t('No specific activities mapped.')}
                      </div>
                    )}
                  </div>
               </div>

               {/* Numeracy Recommendation */}
               <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border-2 border-emerald-100 dark:border-emerald-900/30 shadow-lg shadow-emerald-100/50 dark:shadow-none relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/10 rounded-bl-full -mr-4 -mt-4 pointer-events-none"></div>
                  
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-[0.2em] text-[10px]">
                      <Calculator className="w-4 h-4"/> {t('Numeracy Focus')}
                    </div>
                    <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm">
                      {t(LEVEL_LABELS_NUM[numLevel] || 'Beginner')}
                    </span>
                  </div>
                  
                  <div className="space-y-4 relative z-10">
                    {numActivities.length > 0 ? numActivities.map((act, i) => (
                      <div key={i} className="group p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20 transition-colors">
                         <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 mb-1 flex justify-between items-center">
                           {t(act.title)}
                           <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                         </h3>
                         <p className="text-xs text-emerald-800/70 dark:text-emerald-300/70 leading-relaxed mb-3">{t(act.description)}</p>
                         <div className="flex flex-wrap gap-1.5">
                            {act.materials.map((m, j) => (
                              <span key={j} className="text-[9px] font-bold bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-800/50">{t(m)}</span>
                            ))}
                         </div>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-emerald-400/50 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-3xl border border-dashed border-emerald-200 dark:border-emerald-900/30 text-xs font-bold">
                         {t('No specific activities mapped.')}
                      </div>
                    )}
                  </div>
               </div>
            </div>

            {/* Progress Chart */}
            {student.assessments.length > 0 && (
              <div className="mt-12">
                <ProgressChart assessments={student.assessments} />
              </div>
            )}

            {/* Assessment Audit Trail */}
            <div className="mt-12 space-y-6">
               <div className="flex items-center justify-between px-2">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                     <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-500"/>
                   </div>
                   <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{t('Assessment Timeline')}</h2>
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{student.assessments.length} {t('Records')}</span>
               </div>

               <div className="relative ml-5 pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-6 py-2">
                  {student.assessments.map((a: any, idx: number) => {
                    const prevA = student.assessments[idx + 1];
                    const litGrowth = prevA ? a.literacyLevel - prevA.literacyLevel : 0;
                    const numGrowth = prevA ? a.numeracyLevel - prevA.numeracyLevel : 0;
                    
                    const hasImproved = litGrowth > 0 || numGrowth > 0;
                    const isNewest = idx === 0;

                    return (
                      <div key={a.id} className="relative group">
                         {/* Timeline Dot */}
                         <div className={`absolute -left-[41px] top-4 w-4 h-4 rounded-full border-4 z-10 transition-transform group-hover:scale-125 ${isNewest ? 'bg-white dark:bg-slate-900 border-blue-500' : 'bg-slate-200 dark:bg-slate-700 border-white dark:border-slate-900'}`}></div>
                         
                         <div className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border transition-all ${isNewest ? 'border-blue-100 dark:border-blue-900/50 shadow-md' : 'border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md'}`}>
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                               {/* Meta Info */}
                               <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                     <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest ${isNewest ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                       {a.term}
                                     </span>
                                     <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{a.assessorName}</span>
                                     {hasImproved && (
                                       <span className="flex items-center gap-1 text-[9px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 px-2 py-0.5 rounded-full ml-2">
                                         <TrendingUp className="w-3 h-3" /> {t('Improved')}
                                       </span>
                                     )}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-slate-400 font-medium pl-1">
                                     <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(a.date).toLocaleDateString()}</span>
                                     <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                               </div>
                               
                               {/* Results */}
                               <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-2xl self-start">
                                  {/* Literacy Result */}
                                  <div className="flex items-center gap-2 px-3">
                                     <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                       <BookOpen className="w-4 h-4 text-orange-500" />
                                     </div>
                                     <div>
                                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('Literacy')}</p>
                                       <div className="flex items-center gap-1.5">
                                         <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                            {t(LEVEL_LABELS_LIT[a.literacyLevel] || 'Beginner')}
                                         </span>
                                         {litGrowth > 0 && <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-1 rounded">+{litGrowth}</span>}
                                       </div>
                                     </div>
                                  </div>
                                  <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                                  {/* Numeracy Result */}
                                  <div className="flex items-center gap-2 px-3">
                                     <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                       <Calculator className="w-4 h-4 text-emerald-500" />
                                     </div>
                                     <div>
                                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('Numeracy')}</p>
                                       <div className="flex items-center gap-1.5">
                                         <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                            {t(LEVEL_LABELS_NUM[a.numeracyLevel === 6 ? 5 : a.numeracyLevel === 5 ? 4 : a.numeracyLevel] || 'Beginner')}
                                         </span>
                                         {numGrowth > 0 && <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-1 rounded">+{numGrowth}</span>}
                                       </div>
                                     </div>
                                  </div>
                                </div>
                            </div>
                         </div>
                      </div>
                    );
                  })}
               </div>
            </div>

         </div>
       ) : (
         <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
            <h3 className="text-xl font-bold text-slate-400">{t('No Assessments Yet')}</h3>
            <p className="text-slate-500 mt-2">{t('Test this student to generate personalized Pedagogy curriculum recommendations.')}</p>
         </div>
       )}

       {/* Dual Gameplay & Battle Records History */}
       {(singleGameCount > 0 || battleCount > 0) ? (
         <div className="grid md:grid-cols-2 gap-6 mt-12">
            
            {/* Practice Game Records */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
               <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                     <Gamepad2 className="w-5 h-5 text-blue-600 dark:text-blue-500"/>
                   </div>
                   <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">{t('Practice Records')}</h2>
                 </div>
                 <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-full">{singleGameCount}</span>
               </div>
               
               {singleGameCount > 0 ? (
                 <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                   {student.singleGames.map((game: any) => (
                     <div key={game.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                       <div className="overflow-hidden">
                         <span className="block font-bold text-slate-800 dark:text-white truncate text-sm mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                           {GAME_SLUG_TO_TITLE[game.gameSlug] || game.gameSlug}
                         </span>
                         <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                           <Calendar className="w-3 h-3" /> {new Date(game.conductedAt).toLocaleDateString()}
                         </span>
                       </div>
                       <div className="flex items-center gap-4 text-right">
                         <div>
                           <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t('Time')}</p>
                           <p className="text-xs font-mono font-bold text-slate-500">
                             {formatTime(game.duration)}
                           </p>
                         </div>
                         <div className="bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-xl border border-amber-100 dark:border-amber-900/30">
                           <p className="text-[9px] text-amber-500 font-bold uppercase tracking-wider mb-0.5">{t('XP')}</p>
                           <p className="text-sm font-black text-amber-600 dark:text-amber-500">+{game.score}</p>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs font-bold">
                    {t('No practice sessions logged yet.')}
                 </div>
               )}
            </div>

            {/* Arena Battle History */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
               <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                     <Flame className="w-5 h-5 text-orange-600 dark:text-orange-500"/>
                   </div>
                   <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">{t('Arena Battles')}</h2>
                 </div>
                 <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-full">{battleCount}</span>
               </div>
               
               {battleCount > 0 ? (
                 <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                   {battles.map((battle: any) => {
                     const isWinner = battle.winnerId === student.id;
                     const isDraw = battle.winnerId === null;
                     const opponentName = battle.role === 'P1' ? battle.player2.name : battle.player1.name;
                     
                     return (
                       <div key={battle.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                         <div className="overflow-hidden">
                           <span className="block font-bold text-slate-800 dark:text-white truncate text-sm mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                             {GAME_SLUG_TO_TITLE[battle.gameSlug] || battle.gameSlug}
                           </span>
                           <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 truncate max-w-[150px]">
                             <User className="w-3 h-3" /> vs {opponentName}
                           </span>
                         </div>
                         <div className="flex items-center gap-4 text-right">
                           <div className="hidden sm:block">
                             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t('Date')}</p>
                             <p className="text-[10px] font-bold text-slate-500">
                               {new Date(battle.conductedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                             </p>
                           </div>
                           <div className={`px-3 py-2 rounded-xl border ${
                             isDraw ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' :
                             isWinner ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30' :
                             'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/30'
                           }`}>
                             {isDraw ? (
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('Draw')}</span>
                             ) : isWinner ? (
                               <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{t('Won')} 🏆</span>
                             ) : (
                               <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">{t('Lost')}</span>
                             )}
                           </div>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               ) : (
                 <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs font-bold">
                    {t('No arena battles played yet.')}
                 </div>
               )}
            </div>

         </div>
       ) : null}
    </div>
  );
}
