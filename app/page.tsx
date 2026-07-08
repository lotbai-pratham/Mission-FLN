import Link from "next/link";
import { 
  BookOpen, 
  Calculator, 
  ChevronRight, 
  GraduationCap, 
  HelpingHand, 
  Heart, 
  LayoutDashboard, 
  Lightbulb, 
  MapPin, 
  ShieldCheck, 
  Trophy,
  ClipboardPlus,
  Users,
  Landmark,
  Award,
  RefreshCw,
  Sparkles,
  LogIn,
  ArrowRight
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen -mt-4 bg-slate-50 dark:bg-slate-900/10">
      
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
        {/* Glow Decorations */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-3xl opacity-20 dark:opacity-10 pointer-events-none">
          <div className="aspect-square w-[500px] rounded-full bg-gradient-to-br from-orange-500 to-amber-500" />
        </div>
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 blur-3xl opacity-15 dark:opacity-10 pointer-events-none">
          <div className="aspect-square w-[400px] rounded-full bg-gradient-to-br from-orange-500 to-amber-500" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left side text */}
            <div className="lg:col-span-7 text-left flex flex-col items-start">
              {/* Mission FLN Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-850/30 mb-6">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Mission FLN
              </div>

              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl mb-6 leading-tight">
                Building <br />
                <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 bg-clip-text text-transparent">Foundational Literacy and Numeracy</span>
              </h1>

              <div className="text-sm font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-8 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Understanding the journey of the students of government tribal ashramshalas.
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link
                  href="/pedagogy"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-2xl shadow-xl shadow-amber-500/20 transition-all hover:-translate-y-1 active:translate-y-0"
                >
                  The Pedagogy <BookOpen className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Right side image */}
            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-2 rounded-[40px] bg-gradient-to-tr from-orange-500 to-amber-500 opacity-20 blur-xl animate-pulse pointer-events-none" />
              <div className="relative rounded-[36px] overflow-hidden border-4 border-white dark:border-slate-900 shadow-2xl shadow-slate-200/50 dark:shadow-none bg-slate-100">
                <img 
                  src="/ashramshala-students.png" 
                  alt="Students learning activity" 
                  className="w-full h-auto aspect-[4/3] object-cover hover:scale-105 transition-all duration-500"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-white text-xs font-semibold">
                  <span className="bg-amber-500 text-[10px] px-2.5 py-0.5 rounded-full uppercase mr-2 tracking-wider">Active Learning</span>
                  Students smiling, learning, and performing activities in the classroom.
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Target Audience Section ("Whom is it for?") */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">Designed for the Ecosystem</h2>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">Who Uses Mission FLN?</h3>
            <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Connecting teachers, learners, and administrators to ensure no child is left behind.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: Teachers */}
            <div className="bg-white dark:bg-slate-850 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none flex flex-col justify-between hover:scale-[1.02] transition-all">
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Teachers & Educators</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    Conduct quick assessments, divide classrooms into targeted 'Teaching at the Right Level' (TaRL) groups, and manage interactive multiplayer classroom learning games.
                  </p>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  Track classroom outcomes <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Card 2: Students */}
            <div className="bg-white dark:bg-slate-850 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none flex flex-col justify-between hover:scale-[1.02] transition-all">
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Students & Learners</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    Play fun 2v2 competitive math and language mini-games. Complete tasks, earn points, climb student leaderboards, and master foundational concepts with peer support.
                  </p>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                  Play educational battles <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Card 3: Administration */}
            <div className="bg-white dark:bg-slate-850 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none flex flex-col justify-between hover:scale-[1.02] transition-all">
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Landmark className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Administration & POs</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    Monitor growth velocity across divisions, view live benchmark charts, compile reports, and track overall institutional performance in real-time.
                  </p>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-500 flex items-center gap-1">
                  View administrative metrics <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Core Platform Capabilities Section */}
      <section className="py-24 bg-white dark:bg-slate-950 border-t border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <div>
              <div className="inline-block p-2 px-4 rounded-full bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 font-bold text-xs mb-6 uppercase tracking-wider">
                Core Features
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white sm:text-4xl mb-6">
                Designed to Drive Real Classroom Impact
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-medium">
                Mission FLN combines interactive gamified assessments with granular diagnostic dashboards. It provides educators with the tools they need to track student progress from mother-tongue word recognition to long division.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Feature 1 */}
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">Offline-First Sync</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Caches logs locally and pushes battle results to the server when connected.</p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">NIPUN Bharat Aligned</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Track reading levels and numeracy categories defined by national goals.</p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">AI Assistant</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Chat live with "Ask Pratham!" for diagnostic guidance and instructions.</p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                    <LayoutDashboard className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">Cohort Benchmarks</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Instantly identify underperforming cohorts and track velocity indicators.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Real photo visual display */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-500 rounded-3xl blur-2xl opacity-10 pointer-events-none animate-pulse" />
              <div className="relative rounded-[36px] overflow-hidden border-4 border-white dark:border-slate-900 shadow-2xl bg-slate-100">
                <img 
                  src="/students-activity.jpg" 
                  alt="Students learning activity" 
                  className="w-full h-auto aspect-[4/3] object-cover hover:scale-105 transition-all duration-500"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-white text-xs font-semibold">
                  <span className="bg-amber-500 text-[10px] px-2.5 py-0.5 rounded-full uppercase mr-2 tracking-wider">Assessment</span>
                  Students engaging in digital tablet group activities and peer duels.
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Target Timelines */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-3xl opacity-20 pointer-events-none">
          <div className="aspect-square w-[500px] rounded-full bg-orange-500" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <div>
              <h3 className="text-4xl font-black mb-8 leading-tight">
                NIPUN Bharat & <br />
                <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">National Education Policy</span>
              </h3>
              <div className="space-y-8">
                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">NEP 2020: The Universal Vision</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">Achieving universal Foundational Literacy & Numeracy is declared the highest priority of the entire educational system.</p>
                  </div>
                </div>
                
                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">NIPUN Bharat: Clear Timelines</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">A national goal seeking to ensure that every student reaches universal FLN levels by 2026-27.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timelines and Kids Image Block */}
            <div className="relative rounded-[36px] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md p-6 space-y-6">
              <img 
                src="/camp-kids.jpg" 
                alt="Pratham kids camp group" 
                className="w-full h-48 object-cover rounded-2xl shadow-inner border border-white/5"
              />
              <div className="space-y-5 text-left">
                <h4 className="text-2xl font-black text-center mb-2">Current Learning Reach</h4>
                
                {/* Language Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-300">
                    <span>Language (L4 Story)</span>
                    <span className="text-amber-400 font-black">57% Competent</span>
                  </div>
                  <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 w-[57%]" />
                  </div>
                </div>

                {/* Maths Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-300">
                    <span>Maths (L3 Division)</span>
                    <span className="text-amber-400 font-black">29% Competent</span>
                  </div>
                  <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 w-[29%]" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Target Action Portals */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">Access Your Mission FLN Portal</h3>
            <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm">Select your section to log in or start classroom assessments.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Student portal */}
            <div className="p-8 rounded-[32px] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between items-start space-y-8">
              <div className="space-y-4">
                <div className="p-3 bg-orange-500/10 text-orange-600 rounded-xl inline-block">
                  <Trophy className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Student Arcade</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Launch interactive games (Tili Bundle Duel, Math Duel) for direct in-class multiplayer learning sessions.</p>
              </div>
              <Link href="/resources" className="inline-flex items-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-all w-full justify-center">
                Launch Simulations <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Teacher portal */}
            <div className="p-8 rounded-[32px] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between items-start space-y-8">
              <div className="space-y-4">
                <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl inline-block">
                  <LogIn className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Teacher Portal</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Sign in to perform assessments, record pupil scores, configure classroom settings, and check leaderboard lists.</p>
              </div>
              <Link href="/signin" className="inline-flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-all w-full justify-center">
                Teacher Sign In <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Admin portal */}
            <div className="p-8 rounded-[32px] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between items-start space-y-8 md:col-span-2 lg:col-span-1">
              <div className="space-y-4">
                <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-xl inline-block">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Analyze state and division level cohort benchmarking, verify system integrity, and download reports.</p>
              </div>
              <Link href="/dashboard" className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white dark:text-slate-200 font-bold rounded-xl text-xs border border-slate-700 transition-all w-full justify-center">
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400 text-xs italic">
          Mission FLN © 2026 — Developed in partnership with the Pratham Education Foundation.
        </div>
      </footer>

    </div>
  );
}
