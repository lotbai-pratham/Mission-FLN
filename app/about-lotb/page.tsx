import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Globe, Laptop, Target, ArrowRight, ExternalLink } from 'lucide-react';
import WarliBorder from '@/components/warli/WarliBorder';

export default function AboutLOTB() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {/* Hero Section */}
      <section className="relative py-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-3xl opacity-20 pointer-events-none">
          <div className="aspect-square w-[500px] rounded-full bg-gradient-to-br from-orange-500 to-amber-500" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <Link href="/" className="inline-flex items-center text-slate-500 hover:text-amber-500 mb-8 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-sm font-bold mb-6">
                <BookOpen className="w-4 h-4" /> Learn Out of The Box
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                Empowering Education Since 2012
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Learn out of the Box (LOTB) is a vertical program of Pratham Education Foundation. We implement multiple projects with various donors and geographies, contributing to the field of education for over a decade.
              </p>
            </div>
            <div className="relative rounded-[32px] overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
              <div className="aspect-[4/3] bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center p-8 relative">
                <img src="/digital-classroom.png" alt="LOTB Impact" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50" />
                <h2 className="relative z-10 text-4xl font-black text-white text-center drop-shadow-md">Global Impact.<br/>Local Execution.</h2>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Vertical Bars Section */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Our Projects</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">We implement specialized, high-impact programs designed for specific demographics, geographies, and educational goals.</p>
        </div>

        {/* 3 Tall Rectangular Bars */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          
          {/* Project 1: HP Futures */}
          <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
            {/* Image Placeholder */}
            <div className="h-48 bg-slate-200 dark:bg-slate-700 relative">
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-widest bg-blue-900/5">
                [ HP Futures Image ]
              </div>
              <img src="/placeholder-hp.jpg" alt="" className="w-full h-full object-cover opacity-0" />
            </div>
            
            <div className="p-8 flex flex-col flex-grow">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 shrink-0">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">H.P Futures</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-8 flex-grow">
                In collaboration with UNESCO and Govt. of Himachal Pradesh. Works on CBE, Greening education in schools & Value through Sports. Spread across 8 districts of Himachal covering 3 regions of the Himalayas.
              </p>
              
              {/* Links & Button */}
              <div className="space-y-3 mt-auto">
                <div className="space-y-2 mb-6">
                  <a href="#" className="flex items-center text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                    <ExternalLink className="w-3.5 h-3.5 mr-2" /> Read Project Report
                  </a>
                  <a href="#" className="flex items-center text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                    <ExternalLink className="w-3.5 h-3.5 mr-2" /> UNESCO Collaboration Details
                  </a>
                </div>
                <Link href="#" className="flex items-center justify-center gap-2 w-full py-4 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-colors">
                  About the Project
                </Link>
              </div>
            </div>
          </div>

          {/* Project 2: Majhi Shala (Center focus) */}
          <div className="bg-white dark:bg-slate-800 rounded-[32px] border-2 border-orange-400 dark:border-orange-500 shadow-xl flex flex-col overflow-hidden relative transform md:-translate-y-4 hover:-translate-y-6 transition-all z-10">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-bl-full pointer-events-none" />
            
            {/* Image Placeholder */}
            <div className="h-56 bg-slate-200 dark:bg-slate-700 relative">
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-widest bg-orange-900/5">
                [ MSMS Image ]
              </div>
              <img src="/placeholder-msms.jpg" alt="" className="w-full h-full object-cover opacity-0" />
            </div>

            <div className="p-8 flex flex-col flex-grow">
              <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white mb-6 shrink-0 shadow-lg shadow-orange-500/30">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">माझी शाळा, माझा स्वाभिमान</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-8 flex-grow font-medium">
                In collaboration with Tribal development department Maharashtra - Works with 500 Ashramschools. Is a holistic school development program working directly with Teachers, Superintendents and Students.
              </p>
              
              {/* Central Primary Button */}
              <div className="mt-auto">
                <Link href="/about-lotb/msms" className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02]">
                  About the Project <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Project 3: Gurushala */}
          <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
            {/* Image Placeholder */}
            <div className="h-48 bg-slate-200 dark:bg-slate-700 relative">
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-widest bg-indigo-900/5">
                [ Gurushala Image ]
              </div>
              <img src="/placeholder-gurushala.jpg" alt="" className="w-full h-full object-cover opacity-0" />
            </div>

            <div className="p-8 flex flex-col flex-grow">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 shrink-0">
                <Laptop className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Gurushala</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-8 flex-grow">
                Innovating education and skilling bridging the digital divide through digital content provided through the platform, capacity building courses for teachers and students. Also has a Centre for AI in Education established in partnership with DIET Varanasi.
              </p>
              
              {/* Links & Button */}
              <div className="space-y-3 mt-auto">
                <div className="space-y-2 mb-6">
                  <a href="#" className="flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                    <ExternalLink className="w-3.5 h-3.5 mr-2" /> Visit Gurushala Platform
                  </a>
                  <a href="#" className="flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                    <ExternalLink className="w-3.5 h-3.5 mr-2" /> Centre for AI Details
                  </a>
                </div>
                <Link href="#" className="flex items-center justify-center gap-2 w-full py-4 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-colors">
                  About the Project
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      <WarliBorder height={32} className="warli-ink opacity-50 mt-12" />
    </div>
  );
}
