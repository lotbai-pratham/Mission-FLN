import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Users, Target, CheckCircle2, ChevronRight, Play } from 'lucide-react';
import WarliBorder from '@/components/warli/WarliBorder';

export default function MSMSPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      
      {/* Header */}
      <section className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 pt-16 pb-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <Link href="/about-lotb" className="inline-flex items-center text-slate-500 hover:text-orange-500 mb-8 transition-colors font-medium text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
              <Target className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-orange-600 dark:text-orange-500 font-bold uppercase tracking-widest text-xs mb-1">
                Project Detail
              </h2>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
                माझी शाळा, माझा स्वाभिमान
              </h1>
            </div>
          </div>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
            In collaboration with the Tribal Development Department of Maharashtra, MSMS is a holistic school development program reaching 500 Ashramschools. Our targeted capacity-building cohorts ensure specialized, high-impact engagement at every level of the ecosystem.
          </p>
        </div>
      </section>

      {/* Cohorts Grid */}
      <section className="py-16 max-w-4xl mx-auto px-4 space-y-8">
        
        <div className="mb-10">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            Capacity Building Cohorts
          </h2>
          <p className="text-slate-500 mt-2">Select an intervention to launch the dedicated platform module.</p>
        </div>

        {/* Cohort 1: Teachers 1-4 (ACTIVE) */}
        <div className="bg-white dark:bg-slate-800 rounded-[32px] border-2 border-orange-400 shadow-xl overflow-hidden group">
          <div className="md:flex items-stretch">
            {/* Image Placeholder */}
            <div className="md:w-2/5 bg-slate-100 dark:bg-slate-900 relative min-h-[200px] border-r border-slate-100 dark:border-slate-700">
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-widest bg-orange-900/5">
                [ Teachers 1-4 Image ]
              </div>
              <img src="/placeholder-t14.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-0" />
            </div>
            
            <div className="md:w-3/5 p-8 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 text-xs font-bold mb-4 w-max">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                Active Intervention
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-orange-500" />
                Teachers (1-4)
              </h3>
              
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                Foundational Literacy and Numeracy (FLN) engagement. Teachers are trained to track classroom outcomes, conduct diagnostic assessments, and deliver tailored pedagogy using the Mission Mode approach.
              </p>
              
              <Link 
                href="/pedagogy" 
                className="flex items-center justify-center gap-2 w-full sm:w-auto self-start px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:-translate-y-0.5"
              >
                <Play className="w-4 h-4 fill-current" /> Launch Intervention
              </Link>
            </div>
          </div>
        </div>

        {/* Cohort 2: Teachers 5-7 (INACTIVE) */}
        <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden opacity-75 grayscale-[0.3]">
          <div className="md:flex items-stretch">
            <div className="md:w-2/5 bg-slate-100 dark:bg-slate-900 relative min-h-[160px] border-r border-slate-100 dark:border-slate-700">
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-widest">
                [ Teachers 5-7 Image ]
              </div>
            </div>
            <div className="md:w-3/5 p-8 flex flex-col justify-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
                <Users className="w-5 h-5 text-slate-400" />
                Teachers (5-7)
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Subject-specific pedagogical strategies focusing on transitioning students from foundational skills to advanced comprehension and applied problem-solving.
              </p>
              <button disabled className="px-6 py-3 bg-slate-100 dark:bg-slate-700/50 text-slate-400 font-bold rounded-xl cursor-not-allowed w-max flex items-center gap-2">
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        {/* Cohort 3: Teachers 8-12 (INACTIVE) */}
        <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden opacity-75 grayscale-[0.3]">
          <div className="md:flex items-stretch">
            <div className="md:w-2/5 bg-slate-100 dark:bg-slate-900 relative min-h-[160px] border-r border-slate-100 dark:border-slate-700">
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-widest">
                [ Teachers 8-12 Image ]
              </div>
            </div>
            <div className="md:w-3/5 p-8 flex flex-col justify-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
                <Users className="w-5 h-5 text-slate-400" />
                Teachers (8-12)
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Higher secondary capacity building focused on exam readiness, digital literacy, and preparing tribal students for competitive career trajectories.
              </p>
              <button disabled className="px-6 py-3 bg-slate-100 dark:bg-slate-700/50 text-slate-400 font-bold rounded-xl cursor-not-allowed w-max flex items-center gap-2">
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        {/* Cohort 4: English Teachers (INACTIVE) */}
        <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden opacity-75 grayscale-[0.3]">
          <div className="md:flex items-stretch">
            <div className="md:w-2/5 bg-slate-100 dark:bg-slate-900 relative min-h-[160px] border-r border-slate-100 dark:border-slate-700">
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-widest">
                [ English Image ]
              </div>
            </div>
            <div className="md:w-3/5 p-8 flex flex-col justify-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-slate-400" />
                English Teachers
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Specialized language acquisition programs focusing on spoken English, phonics, and communication skills to bridge the regional language gap.
              </p>
              <button disabled className="px-6 py-3 bg-slate-100 dark:bg-slate-700/50 text-slate-400 font-bold rounded-xl cursor-not-allowed w-max flex items-center gap-2">
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        {/* Cohort 5: Superintendents (INACTIVE) */}
        <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden opacity-75 grayscale-[0.3]">
          <div className="md:flex items-stretch">
            <div className="md:w-2/5 bg-slate-100 dark:bg-slate-900 relative min-h-[160px] border-r border-slate-100 dark:border-slate-700">
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-widest">
                [ Supt. Image ]
              </div>
            </div>
            <div className="md:w-3/5 p-8 flex flex-col justify-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
                <Target className="w-5 h-5 text-slate-400" />
                Superintendents
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Administrative leadership training focused on data-driven management, school hygiene, ecosystem tracking, and fostering a positive residential environment.
              </p>
              <button disabled className="px-6 py-3 bg-slate-100 dark:bg-slate-700/50 text-slate-400 font-bold rounded-xl cursor-not-allowed w-max flex items-center gap-2">
                Coming Soon
              </button>
            </div>
          </div>
        </div>

      </section>
      
      <WarliBorder height={32} className="warli-ink opacity-50 mt-12" />
    </div>
  );
}
