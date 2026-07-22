"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, ChevronDown, ChevronRight, Globe, Users, Target, Laptop } from 'lucide-react';
import WarliBorder from '@/components/warli/WarliBorder';

export default function AboutLOTB() {
  const [showCohorts, setShowCohorts] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {/* Hero Section */}
      <section className="relative py-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-3xl opacity-20 pointer-events-none">
          <div className="aspect-square w-[500px] rounded-full bg-gradient-to-br from-orange-500 to-amber-500" />
        </div>
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
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

      {/* Projects Section */}
      <section className="py-20 max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Our Projects</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">We implement specialized, high-impact programs designed for specific demographics, geographies, and educational goals.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Project 1: HP Futures */}
          <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">H.P Futures</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-grow">
              In collaboration with UNESCO and Govt. of Himachal Pradesh. Works on CBE, Greening education in schools & Value through Sports. Spread across 8 districts of Himachal covering 3 regions of the Himalayas.
            </p>
          </div>

          {/* Project 2: Gurushala */}
          <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
              <Laptop className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Gurushala</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-grow">
              Innovating education and skilling bridging the digital divide through digital content provided through the platform, capacity building courses for teachers and students (web based and self paced). Also has a Centre for AI in Education established in Varanasi in partnership with DIET Varanasi.
            </p>
          </div>

          {/* Project 3: Majhi Shala */}
          <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 border-2 border-orange-200 dark:border-orange-500/30 shadow-md flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-bl-full -z-10" />
            
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-6">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">माझी शाळा, माझा स्वाभिमान</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              In collaboration with Tribal development department Maharashtra - Works with 500 Ashramschools. Is a holistic school development program working directly with Teachers, Superintendents and Students.
            </p>

            <button 
              onClick={() => setShowCohorts(!showCohorts)}
              className="mt-auto flex items-center justify-center gap-2 w-full py-3 px-4 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-bold rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors"
            >
              About the project {showCohorts ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Expandable Cohorts Section for Majhi Shala */}
        {showCohorts && (
          <div className="mt-8 animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 md:p-12 border border-orange-200 dark:border-orange-500/30 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Capacity Building Cohorts</h3>
                  <p className="text-slate-500 dark:text-slate-400">Select a cohort to view specific engagement models and interventions.</p>
                </div>
                <Users className="w-12 h-12 text-orange-200 dark:text-orange-900/50 hidden md:block" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Link 
                  href="/pedagogy" 
                  className="flex flex-col items-center justify-center p-6 text-center bg-orange-500 hover:bg-orange-600 text-white rounded-2xl shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-1 group"
                >
                  <BookOpen className="w-8 h-8 mb-3 opacity-90 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-sm">Teachers<br/>(1-4)</span>
                </Link>

                <div className="flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-400 rounded-2xl cursor-not-allowed">
                  <Users className="w-8 h-8 mb-3 opacity-50" />
                  <span className="font-bold text-sm">Teachers<br/>(5-7)</span>
                </div>

                <div className="flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-400 rounded-2xl cursor-not-allowed">
                  <Users className="w-8 h-8 mb-3 opacity-50" />
                  <span className="font-bold text-sm">Teachers<br/>(8-12)</span>
                </div>

                <div className="flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-400 rounded-2xl cursor-not-allowed">
                  <BookOpen className="w-8 h-8 mb-3 opacity-50" />
                  <span className="font-bold text-sm">English<br/>Teachers</span>
                </div>

                <div className="flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-400 rounded-2xl cursor-not-allowed">
                  <Target className="w-8 h-8 mb-3 opacity-50" />
                  <span className="font-bold text-sm">Superintendents</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <WarliBorder height={32} className="warli-ink opacity-50 mt-12" />
    </div>
  );
}
