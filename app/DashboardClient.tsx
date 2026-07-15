"use client";

import { useState, useEffect, useTransition, Fragment } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell, AreaChart, Area, LineChart, Line
} from 'recharts';
import { BookOpen, Calculator, Users, School, Filter, TrendingUp, LayoutDashboard, Search, Sparkles, AlertCircle, TrendingDown, Trophy, Medal, Lightbulb, Gamepad2, Target, ClipboardList, Clock, CheckCircle2, Activity, X } from 'lucide-react';
import { getDashboardStats, getStrugglingStudents, getGrowthVelocity, getInterventionPlan, getPORankings, getStudentLeaderboard, getSchoolRankings, getSchoolStudentsDetails } from "@/app/actions";
import { getImplementationAnalytics } from "@/app/actions/implementation";
import { useLanguage } from "@/context/LanguageContext";

const LIT_LABELS = ['Beginner', 'Letter', 'Word', 'Paragraph', 'Story'];
const NUM_LABELS = ['Beginner', '1-9', '10-99', 'Addition', 'Subtraction', 'Division'];
const LIT_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];
const NUM_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#ec4899'];
const TERM_COLORS: Record<string, string> = { Baseline: '#6366f1', Midline: '#f59e0b', Endline: '#22c55e' };
const TERMS = ['Baseline', 'Midline', 'Endline'];

export default function DashboardClient({ initialStats, hierarchy }: { initialStats: any; hierarchy: any[] }) {
  const { t } = useLanguage();
  const [stats, setStats] = useState(initialStats);
  const [isPending, startTransition] = useTransition();
  const [divId, setDivId] = useState("");
  const [poId, setPoId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [term, setTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'ranking' | 'school-ranking' | 'students' | 'implementation'>('trends');
  useEffect(() => {
  // Clear struggling list whenever the Project Office changes to avoid stale critical alerts
  setStruggling([]);
}, [poId]);
  const [selectedClass, setSelectedClass] = useState<number | 'all'>('all');
  const [rankings, setRankings] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardMode, setLeaderboardMode] = useState<'best' | 'help'>('best');
  const [trendType, setTrendType] = useState<'literacy' | 'numeracy'>('literacy');
  const [showPct, setShowPct] = useState(true);
  const [struggling, setStruggling] = useState<any[]>([]);
  const [velocity, setVelocity] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [implData, setImplData] = useState<any>(null);
  const [implPeriod, setImplPeriod] = useState<'7d' | '30d' | 'all'>('30d');
  const [schoolRankings, setSchoolRankings] = useState<any[]>([]);
  const [selectedSchoolForDetails, setSelectedSchoolForDetails] = useState<any>(null);
  const [schoolStudentsDetails, setSchoolStudentsDetails] = useState<any[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  const activeDivision = hierarchy.find(d => d.id === divId);

  // Function to load all dashboard data based on current filters
  const fetchData = async () => {

        startTransition(async () => {
          const newStats = await getDashboardStats({ divisionId: divId, projectOfficeId: poId, schoolId, term, classNum: selectedClass });
          setStats(newStats);

          const v = await getGrowthVelocity({ divisionId: divId, projectOfficeId: poId, schoolId, classNum: selectedClass });
          setVelocity(v);

          if (schoolId) {
            const s = await getStrugglingStudents(schoolId, selectedClass);
            setStruggling(s);
          } else {
            setStruggling([]);
          }

          const r = await getPORankings(divId || undefined, selectedClass);
          setRankings(r);

          const sr = await getSchoolRankings(divId || undefined, poId || undefined, selectedClass);
          setSchoolRankings(sr);

          const l = await getStudentLeaderboard({
            divisionId: divId || undefined,
            projectOfficeId: poId || undefined,
            schoolId: schoolId || undefined,
            classNum: selectedClass,
            sortBy: leaderboardMode
          });
          setLeaderboard(l);

          const impl = await getImplementationAnalytics({
            divisionId: divId || undefined,
            projectOfficeId: poId || undefined,
            schoolId: schoolId || undefined,
            period: implPeriod,
          });
          setImplData(impl);
        });
  };
  const pos = activeDivision ? activeDivision.projectOffices : [];
  const activePO = pos.find((p: any) => p.id === poId);
  const schools = activePO ? activePO.schools : [];
  

  useEffect(() => {
    // Load data initially and whenever any filter changes
    fetchData();
  }, [divId, poId, schoolId, term, selectedClass, implPeriod, leaderboardMode]);


  // --- Build chart data for the selected class + type ---
  function buildChartData(type: 'literacy' | 'numeracy') {
    const labels = type === 'literacy' ? LIT_LABELS : NUM_LABELS;
    const numLevels = labels.length;

    let breakdown: Record<string, { total: number; levels: Record<number, { count: number; pct: number }> }>;

    if (selectedClass === 'all') {
      breakdown = stats.overallBreakdown?.[type] ?? {};
    } else {
      breakdown = stats.classBreakdown?.[type]?.[selectedClass] ?? {};
    }

    // One row per level; columns per term
    return labels.map((label, lvl) => {
      const row: any = { name: label };
      for (const t of TERMS) {
        const data = breakdown[t];
        row[`${t}_pct`] = data?.levels?.[lvl]?.pct ?? 0;
        row[`${t}_count`] = data?.levels?.[lvl]?.count ?? 0;
        row[`${t}_total`] = data?.total ?? 0;
      }
      return row;
    });
  }

  // For the overview term charts — returns % normalised within each term
  const [selectedYear, setSelectedYear] = useState("2025-2026");

  const availableYears = Array.from(new Set((stats.allAssessments || []).map((a: any) => String(a.academicYear)))).filter(Boolean).sort().reverse() as string[];
  if (availableYears.length === 0) availableYears.push("2025-2026");

  useEffect(() => {
    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0] as string);
    }
  }, [availableYears, selectedYear]);

  const formatTermData = (dataArray: any[], type: 'lit' | 'num', asPct: boolean, targetYear: string) => {
    const filteredArray = (dataArray || []).filter((a: any) => a.academicYear === targetYear);
    const labels = type === 'lit' ? LIT_LABELS : NUM_LABELS;
    const key = type === 'lit' ? 'literacyLevel' : 'numeracyLevel';
    const termTotals: Record<string, number> = {};
    TERMS.forEach(t => {
      termTotals[t] = filteredArray
        .filter((item: any) => item.term === t)
        .reduce((sum: number, item: any) => sum + item._count.studentId, 0);
    });
    return labels.map((label, level) => {
      const entry: any = { name: label };
      TERMS.forEach(t => {
        let count = 0;
        if (type === 'num') {
          const matchingItems = filteredArray.filter((item: any) => {
            const dbLvl = item[key];
            const mappedLvl = dbLvl === 6 ? 5 : dbLvl === 5 ? 4 : dbLvl;
            return mappedLvl === level && item.term === t;
          });
          count = matchingItems.reduce((acc: number, item: any) => acc + item._count.studentId, 0);
        } else {
          const found = filteredArray.find((item: any) => item[key] === level && item.term === t);
          count = found ? found._count.studentId : 0;
        }
        entry[t] = asPct ? (termTotals[t] > 0 ? Math.round((count / termTotals[t]) * 100) : 0) : count;
      });
      return entry;
    });
  };


  const formatOpsData = (allAssessments: any[], asPct: boolean, targetYear: string) => {
    const filtered = (allAssessments || []).filter((a: any) => a.academicYear === targetYear);
    return ['addition', 'subtraction', 'division'].map(op => {
      const entry: any = { name: op[0].toUpperCase() + op.slice(1) };
      TERMS.forEach(t => {
        const termAssessments = filtered.filter((a: any) => a.term === t);
        const total = termAssessments.length;
        const count = termAssessments.filter((curr: any) => {
          if (op === 'addition') return curr.addition || curr.numeracyLevel >= 3;
          if (op === 'subtraction') return curr.subtraction || curr.numeracyLevel >= 4;
          if (op === 'division') return curr.division || curr.numeracyLevel >= 6;
          return false;
        }).length;
        entry[t] = asPct ? (total > 0 ? Math.round((count / total) * 100) : 0) : count;
      });
      return entry;
    });
  };

  const litChartData = buildChartData('literacy');
  const numChartData = buildChartData('numeracy');
  const availableClasses: number[] = stats.availableClasses ?? [];

  // Custom tooltip for % + count
  const TrendTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-4 text-sm min-w-[180px]">
        <p className="font-extrabold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
        {payload.map((p: any) => {
          const term = p.dataKey.replace('_pct', '');
          const count = p.payload[`${term}_count`];
          const total = p.payload[`${term}_total`];
          return (
            <div key={term} className="flex items-center justify-between gap-4 mb-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.fill }} />
                <span className="text-slate-500">{term}</span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-slate-800 dark:text-slate-100">{p.value}%</span>
                <span className="text-slate-400 text-xs ml-1">({count ?? 0}/{total ?? 0})</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700">


      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-center">
          {/* Refresh Button */}
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
          >
            Refresh
          </button>
        <div className="flex items-center gap-2 text-slate-400 font-bold px-2 shrink-0">
          <Filter className="w-5 h-5" /><span className="hidden lg:inline text-sm">{t('Filters') || 'Filters'}:</span>
        </div>
        <select value={term} onChange={e => setTerm(e.target.value)} className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 text-sm border-none">
          <option value="">{t('All Terms') || 'All Terms'}</option>
          {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={divId} onChange={e => { setDivId(e.target.value); setPoId(""); setSchoolId(""); setStruggling([]); }} className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 text-sm border-none">
          <option value="">{t('All Divisions')}</option>
          {hierarchy.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select value={poId} onChange={e => { setPoId(e.target.value); setSchoolId(""); setStruggling([]); }} disabled={!divId} className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 text-sm border-none disabled:opacity-50">
          <option value="">{t('All Project Offices')}</option>
          {pos.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={schoolId} onChange={e => setSchoolId(e.target.value)} disabled={!poId} className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 text-sm border-none disabled:opacity-50">
          <option value="">{t('All Schools')}</option>
          {schools.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 text-sm border-none">
          <option value="all">{t('All Classes')}</option>
          {availableClasses.map(cls => <option key={cls} value={cls}>Class {cls}</option>)}
        </select>
        {isPending && <span className="text-sm font-bold text-blue-500 animate-pulse shrink-0">Updating…</span>}
      </div>

      {/* State FLN Targets (NIPUN Bharat Target vs Current) */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-8 border border-slate-800 shadow-xl relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 rounded-full text-indigo-300 text-xs font-black uppercase tracking-wider">
              <Target className="w-3.5 h-3.5 animate-pulse" /> {t('NIPUN Bharat Targets') || 'NIPUN Bharat Targets'}
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              {t('NIPUN Bharat Mission')}
            </h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              {t('The NIPUN Bharat Mission targets 100% foundational literacy and numeracy proficiency for all grade-level students. We monitor student progress through targeted baseline and endline assessments to bridge the learning gap.')}
            </p>
          </div>
          
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* Language / Literacy Target */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('Literacy (L4 Story Reading)')}</p>
                  <h3 className="text-4xl font-black text-white mt-1">{(velocity?.literacyScore ?? 0)}%</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden relative">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${velocity?.literacyScore ?? 0}%` }} />
                  </div>
                  <span className="text-xs font-black text-blue-400 shrink-0">{t('Target')} 100%</span>
                </div>
              </div>
            </div>

            {/* Maths / Numeracy Target */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('Numeracy (L3 Division)')}</p>
                  <h3 className="text-4xl font-black text-white mt-1">{(velocity?.numeracyScore ?? 0)}%</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Calculator className="w-5 h-5" />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden relative">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${velocity?.numeracyScore ?? 0}%` }} />
                  </div>
                  <span className="text-xs font-black text-emerald-400 shrink-0">{t('Target')} 100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 transition-opacity ${isPending ? 'opacity-50' : ''}`}>
        <KPI label={t("Total Students")} value={stats.totalStudents} icon={<Users className="w-5 h-5" />} color="blue" />
        <KPI label={t("Total Schools") || "Total Schools"} value={stats.totalSchools} icon={<School className="w-5 h-5" />} color="emerald" />
        <KPI label={t("Arena Engagement")} value={stats.totalArenaBattles ?? 0} icon={<Sparkles className="w-5 h-5" />} color="blue" suffix={` ${t('Arena Engagement') !== 'Arena Engagement' ? '' : 'Battles'}`} />
        <KPI label={t("Single Games")} value={stats.totalSingleGames ?? 0} icon={<Gamepad2 className="w-5 h-5" />} color="orange" suffix={` ${t('Single Games') !== 'Single Games' ? '' : 'Games'}`} />
      </div>

      {/* STRUGGLING STUDENTS ALERT */}
      {struggling.length > 0 && (
        <div className="animate-in slide-in-from-top-4 duration-500 my-8">
          <div className="bg-red-50 dark:bg-red-950/20 rounded-[40px] p-8 border border-red-100 dark:border-red-900/30 flex flex-col md:flex-row items-center gap-8 shadow-xl shadow-red-500/5">
             <div className="w-20 h-20 bg-red-500 rounded-[32px] flex items-center justify-center shadow-2xl shadow-red-500/20 shrink-0">
                <AlertCircle className="w-10 h-10 text-white" />
             </div>
             <div className="flex-1 space-y-2">
                <h3 className="text-xl font-black text-red-900 dark:text-red-400">Critical: {struggling.length} Students with Zero Progress</h3>
                <p className="text-red-700 dark:text-red-500/70 font-medium">These students have not moved from their Baseline level. Recommended: Intensive 10-day Bootcamp.</p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                   {struggling.slice(0, 10).map((s: any) => (
                      <div key={s.id} className="px-3 py-1.5 bg-white dark:bg-red-900/40 rounded-xl text-xs font-bold text-red-600 border border-red-200 dark:border-red-800 flex items-center gap-2">
                         <TrendingDown className="w-3 h-3" /> {s.name} (Lvl {s.baselineLevel ?? 0} → {s.latestLevel})
                      </div>
                   ))}
                </div>
             </div>
             <button 
               onClick={async () => {
                 setIsGeneratingPlan(true);
                 const p = await getInterventionPlan(struggling);
                 setPlan(p);
                 setIsGeneratingPlan(false);
               }}
               disabled={isGeneratingPlan}
               className="px-8 py-4 bg-red-600 text-white font-black rounded-3xl hover:bg-red-700 transition-all shadow-lg shrink-0 uppercase tracking-widest text-[10px] disabled:opacity-50"
             >
                {isGeneratingPlan ? "Analyzing..." : "Generate Intervention"}
             </button>
          </div>
        </div>
      )}

      {/* INTERVENTION PLAN DISPLAY */}
      {plan && (
        <div className="animate-in zoom-in-95 duration-500 my-8">
           <div className="bg-white dark:bg-slate-900 border-2 border-blue-500 rounded-[48px] p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl -mr-32 -mt-32" />
              <button onClick={() => setPlan(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 font-bold">Close X</button>
              
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Sparkles className="w-6 h-6" />
                 </div>
                 <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{plan.title}</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                 <div className="space-y-6">
                    <div>
                       <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Core Focus</p>
                       <p className="text-xl font-bold text-slate-700 dark:text-slate-200 leading-relaxed">{plan.focus}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Required Resources</p>
                       <div className="flex flex-wrap gap-2">
                          {plan.resources.map((r: string) => (
                             <span key={r} className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700">{r}</span>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Milestone Schedule</p>
                    <div className="space-y-4">
                       {plan.schedule.map((s: any) => (
                          <div key={s.day} className="flex gap-4">
                             <div className="w-12 text-blue-600 font-black text-sm pt-0.5">D{s.day}</div>
                             <div className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">{s.activity}</div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-fit border border-slate-200 dark:border-slate-800 flex-wrap gap-1">
        {([
          ['trends', t('Target Tracking') || 'Level Trends', TrendingUp],
          ['overview', t('Growth from years') || 'Growth from years', LayoutDashboard],
          ['ranking', t('P.O. Rank') || 'P.O. Rank', Trophy],
          ['school-ranking', t('School Rank') || 'School Rank', School],
          ['students', t('Student Leaderboard') || 'Student Leaderboard', Medal],
          ['implementation', t('Implementation Tracker') || 'Implementation Tracker', ClipboardList],
        ] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === id ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* TAB: LEVEL TRENDS */}
      {activeTab === 'trends' && (
        <div className={`space-y-5 transition-opacity ${isPending ? 'opacity-50' : ''}`}>

          {/* Controls */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Type toggle */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1">
              <button onClick={() => setTrendType('literacy')}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${trendType === 'literacy' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                <BookOpen className="w-4 h-4 inline mr-1" />Literacy
              </button>
              <button onClick={() => setTrendType('numeracy')}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${trendType === 'numeracy' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
                <Calculator className="w-4 h-4 inline mr-1" />Numeracy
              </button>
            </div>



            <span className="text-xs text-slate-400 ml-auto">
              % normalised within each term — totals differ across terms
            </span>
          </div>

          {/* Main trend chart */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
              {trendType === 'literacy' ? '📚 Literacy' : '🔢 Numeracy'} Level Distribution by Term
              {selectedClass !== 'all' && <span className="ml-2 text-blue-600">— Class {selectedClass}</span>}
            </h2>
            <p className="text-xs text-slate-400 mb-6">Each bar shows % of assessed students at that level within the term. Hover for actual counts.</p>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendType === 'literacy' ? litChartData : numChartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${v}%`} domain={[0, 100]} />
                  <Tooltip content={<TrendTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '16px' }}
                    formatter={(value) => value.replace('_pct', '')} />
                  {TERMS.map(t => (
                    <Bar key={t} dataKey={`${t}_pct`} name={t} fill={TERM_COLORS[t]} radius={[4, 4, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary table */}
          <SummaryTable
            type={trendType}
            selectedClass={selectedClass}
            overallBreakdown={stats.overallBreakdown}
            classBreakdown={stats.classBreakdown}
          />
        </div>
      )}

      {/* TAB: OVERVIEW / ACADEMIC YEAR GROWTH */}
      {activeTab === 'overview' && (
        <div className={`space-y-6 transition-opacity ${isPending ? 'opacity-50' : ''}`}>
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <label className="text-sm font-bold text-slate-500">Academic Year:</label>
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500">
                {availableYears.map((y: string) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1">
              <button onClick={() => setShowPct(true)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${showPct ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                %
              </button>
              <button onClick={() => setShowPct(false)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${!showPct ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                #
              </button>
            </div>
          </div>
          
          <BarCard title={`Literacy Levels by Term (${showPct ? '%' : '#'})`} icon="📚" data={formatTermData(stats.literacies, 'lit', showPct, selectedYear)} percentage={showPct} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarCard title={`Numeracy Levels by Term (${showPct ? '%' : '#'})`} icon="🔢" data={formatTermData(stats.numeracies, 'num', showPct, selectedYear)} percentage={showPct} />
            <BarCard title={`Operations Mastery by Term (${showPct ? '%' : '#'})`} icon="➕" data={formatOpsData(stats.allAssessments, showPct, selectedYear)} percentage={showPct} />
          </div>
        </div>
      )}

      {/* TAB: RANKING */}
      {activeTab === 'ranking' && (
        <div className={`space-y-6 animate-in slide-in-from-bottom-4 duration-500 ${isPending ? 'opacity-50' : ''}`}>
           <div className="bg-white dark:bg-slate-900 rounded-[48px] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl">
              <div className="flex items-center justify-between mb-10">
                 <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                       <Trophy className="w-8 h-8 text-yellow-500" /> {t('Project Office Leaderboard (Endline Only)') || 'Project Office Leaderboard (Endline Only)'}
                    </h2>
                    <p className="text-slate-500 font-medium mt-1">{t('Ranking based on student story reading and subtraction mastery rates in Endline assessments.')}</p>
                 </div>
                 <div className="hidden md:flex gap-2">
                    <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-[10px] font-black text-blue-600 uppercase tracking-widest border border-blue-100 dark:border-blue-800">
                       {t('Top Performer')}: {rankings[0]?.name || "N/A"}
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 {rankings.map((po, index) => (
                    <div key={po.id} className="group relative bg-slate-50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 transition-all hover:shadow-xl hover:-translate-y-1">
                       <div className="flex flex-col md:flex-row items-center gap-8">
                          {/* Rank */}
                          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
                             {index === 0 && <Medal className="w-8 h-8 text-yellow-500" />}
                             {index === 1 && <Medal className="w-8 h-8 text-slate-400" />}
                             {index === 2 && <Medal className="w-8 h-8 text-orange-400" />}
                             {index > 2 && <span className="text-xl font-black text-slate-300">#{index + 1}</span>}
                          </div>

                          <div className="flex-1 space-y-4">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <h3 className="text-xl font-black text-slate-800 dark:text-white">{po.name}</h3>
                                   <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-wider">{t('Project Office')}</span>
                                </div>
                                <div className="text-right">
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Efficiency Score')}</p>
                                   <p className="text-2xl font-black text-blue-600">{po.score}%</p>
                                </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Story Progress */}
                                <div className="space-y-2">
                                   <div className="flex justify-between text-[11px] font-bold">
                                      <span className="text-slate-500 uppercase tracking-wider">{t('Story Reading')}</span>
                                      <span className="text-slate-800 dark:text-slate-200">{po.storyPct}%</span>
                                   </div>
                                   <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                      <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${po.storyPct}%` }} />
                                   </div>
                                </div>
                                {/* Subtraction Progress */}
                                <div className="space-y-2">
                                   <div className="flex justify-between text-[11px] font-bold">
                                      <span className="text-slate-500 uppercase tracking-wider">{t('Subtraction Mastery')}</span>
                                      <span className="text-slate-800 dark:text-slate-200">{po.subtractionPct}%</span>
                                   </div>
                                   <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                      <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${po.subtractionPct}%` }} />
                                   </div>
                                </div>
                             </div>
                          </div>

                          <div className="shrink-0 text-center px-6 border-l border-slate-100 dark:border-slate-800 hidden lg:block">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Assessed')}</p>
                             <p className="text-xl font-black text-slate-800 dark:text-slate-100">{po.totalAssessed}</p>
                          </div>
                       </div>
                    </div>
                 ))}

                 {rankings.length === 0 && (
                    <div className="py-20 text-center space-y-4">
                       <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                          <AlertCircle className="w-10 h-10 text-slate-300" />
                       </div>
                       <p className="text-slate-400 font-bold">{t('No ranking data available for selected filters.')}</p>
                    </div>
                 )}
               </div>
            </div>
         </div>
      )}

      {/* TAB: SCHOOL RANKING */}
      {activeTab === 'school-ranking' && (
        <div className={`space-y-6 animate-in slide-in-from-bottom-4 duration-500 ${isPending ? 'opacity-50' : ''}`}>
           <div className="bg-white dark:bg-slate-900 rounded-[48px] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl">
              <div className="flex items-center justify-between mb-10">
                 <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                       <School className="w-8 h-8 text-blue-500" /> {t('School FLN Leaderboard') || 'School FLN Leaderboard'}
                    </h2>
                    <p className="text-slate-500 font-medium mt-1">{t('Ranking based on student story reading and subtraction mastery rates. Click on a school to view student details.')}</p>
                 </div>
                 <div className="hidden md:flex gap-2">
                    <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-[10px] font-black text-blue-600 uppercase tracking-widest border border-blue-100 dark:border-blue-800">
                       {t('Top School')}: {schoolRankings[0]?.name || "N/A"}
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 {schoolRankings.map((school, index) => (
                    <div 
                      key={school.id} 
                      onClick={async () => {
                        setIsLoadingStudents(true);
                        setSelectedSchoolForDetails(school);
                        const students = await getSchoolStudentsDetails(school.id, selectedClass);
                        setSchoolStudentsDetails(students);
                        setIsLoadingStudents(false);
                      }}
                      className="group relative bg-slate-50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                    >
                       <div className="flex flex-col md:flex-row items-center gap-8">
                          {/* Rank */}
                          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
                             {index === 0 && <Medal className="w-8 h-8 text-yellow-500" />}
                             {index === 1 && <Medal className="w-8 h-8 text-slate-400" />}
                             {index === 2 && <Medal className="w-8 h-8 text-orange-400" />}
                             {index > 2 && <span className="text-xl font-black text-slate-300">#{index + 1}</span>}
                          </div>

                          <div className="flex-1 space-y-4 w-full">
                             <div className="flex items-center justify-between">
                                <div>
                                   <div className="flex items-center gap-3">
                                      <h3 className="text-xl font-black text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">{school.name}</h3>
                                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-bold uppercase tracking-wider">School</span>
                                   </div>
                                   <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded shadow-sm border border-slate-200 dark:border-slate-700">UDISE: {school.udiseCode}</span>
                                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{school.poName} • {school.divName}</span>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('Score')}</p>
                                   <p className="text-2xl font-black text-blue-600">{school.score}%</p>
                                </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Story Progress */}
                                <div className="space-y-2">
                                   <div className="flex justify-between text-[11px] font-bold">
                                      <span className="text-slate-500 uppercase tracking-wider">{t('Story Reading')}</span>
                                      <span className="text-slate-800 dark:text-slate-200">{school.storyPct}%</span>
                                   </div>
                                   <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                      <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${school.storyPct}%` }} />
                                   </div>
                                </div>
                                {/* Subtraction Progress */}
                                <div className="space-y-2">
                                   <div className="flex justify-between text-[11px] font-bold">
                                      <span className="text-slate-500 uppercase tracking-wider">{t('Subtraction Mastery')}</span>
                                      <span className="text-slate-800 dark:text-slate-200">{school.subtractionPct}%</span>
                                   </div>
                                   <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                      <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${school.subtractionPct}%` }} />
                                   </div>
                                </div>
                             </div>
                          </div>

                          <div className="shrink-0 text-center px-6 border-l border-slate-100 dark:border-slate-800 hidden lg:block">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Total Assessed')}</p>
                             <p className="text-xl font-black text-slate-800 dark:text-slate-100">{school.totalAssessed}</p>
                          </div>
                       </div>
                    </div>
                 ))}

                 {schoolRankings.length === 0 && (
                    <div className="py-20 text-center space-y-4">
                       <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                          <AlertCircle className="w-10 h-10 text-slate-300" />
                       </div>
                       <p className="text-slate-400 font-bold">{t('No school ranking data available for selected filters.')}</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* TAB: STUDENT LEADERBOARD */}
      {activeTab === 'students' && (
        <div className={`space-y-6 animate-in slide-in-from-bottom-4 duration-500 ${isPending ? 'opacity-50' : ''}`}>
          <div className="bg-white dark:bg-slate-900 rounded-[48px] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                  {leaderboardMode === 'best' ? (
                    <>
                      <Medal className="w-8 h-8 text-yellow-500" /> {t('Best Performing Students')}
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-8 h-8 text-red-500 animate-pulse" /> {t('Students Needing Most Help')}
                    </>
                  )}
                </h2>
                <p className="text-slate-500 font-medium mt-1">
                  {leaderboardMode === 'best' 
                    ? t('Based on FLN levels, game participation, and battle victories')
                    : t('Students with the lowest progress or activity levels')}
                </p>
              </div>

              {/* Floating-style pill toggle for Best vs Needs Help */}
              <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/30 shadow-sm shrink-0">
                <button
                  onClick={() => setLeaderboardMode('best')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                    leaderboardMode === 'best'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  {t('Best Performing') || 'Best Performing'}
                </button>
                <button
                  onClick={() => setLeaderboardMode('help')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                    leaderboardMode === 'help'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
                  }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  {t('Needs Help') || 'Needs Help'}
                </button>
              </div>
            </div>

            {/* Top 3 Podium Card Grid */}
            {leaderboard.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {leaderboard.slice(0, 3).map((stu, index) => {
                  const medalColors = leaderboardMode === 'best' ? [
                    'from-yellow-400 to-amber-500 text-yellow-950 border-amber-300', // Gold
                    'from-slate-300 to-slate-400 text-slate-900 border-slate-200',   // Silver
                    'from-orange-400 to-amber-600 text-orange-950 border-orange-300' // Bronze
                  ] : [
                    'from-red-500 to-rose-600 text-white border-red-400 shadow-red-500/10', // High Critical
                    'from-orange-500 to-red-500 text-white border-orange-400 shadow-orange-500/10', // Medium Critical
                    'from-amber-500 to-orange-500 text-white border-amber-400 shadow-amber-500/10'  // Low Critical
                  ];
                  const podiumTitles = leaderboardMode === 'best'
                    ? [t('1st Place') || '1st Place', t('2nd Place') || '2nd Place', t('3rd Place') || '3rd Place']
                    : [t('Critical 1') || 'Critical 1', t('Critical 2') || 'Critical 2', t('Critical 3') || 'Critical 3'];
                  return (
                    <div key={stu.id} className="relative bg-slate-50 dark:bg-slate-850 hover:bg-white dark:hover:bg-slate-800 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col justify-between overflow-hidden">
                      {/* Decorative corner tag for Rank */}
                      <div className={`absolute top-0 right-0 px-5 py-2.5 bg-gradient-to-r ${medalColors[index]} text-[10px] font-black rounded-bl-3xl shadow-sm uppercase tracking-wider`}>
                        {podiumTitles[index]}
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mt-4">
                          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-800">
                            {stu.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-800 dark:text-white text-base truncate max-w-[150px]">{stu.name}</h4>
                            <p className="text-[10px] text-slate-400 font-medium">{stu.uid}</p>
                          </div>
                        </div>
                        
                        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 font-medium">
                          <p className="truncate">🏫 {stu.schoolName}</p>
                          <p className="truncate">🏢 {stu.poName} • {stu.divName}</p>
                          <p>📚 {t('Class')} {stu.classNum}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <div>
                             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t('Literacy')}</p>
                             <span className="inline-block mt-1 px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-bold">
                               {t(LIT_LABELS[stu.litLevel]) || LIT_LABELS[stu.litLevel]}
                             </span>
                          </div>
                          <div>
                             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t('Numeracy')}</p>
                             <span className="inline-block mt-1 px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-bold">
                               {t(NUM_LABELS[stu.numLevel === 6 ? 5 : stu.numLevel === 5 ? 4 : stu.numLevel]) || NUM_LABELS[stu.numLevel === 6 ? 5 : stu.numLevel === 5 ? 4 : stu.numLevel]}
                             </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-between items-end">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <Gamepad2 className="w-3.5 h-3.5 text-orange-500" />
                            <span>{t('Games Played')}: <strong>{stu.gamesPlayed}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                            <span>{t('Victories')}: <strong>{stu.victories}</strong></span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">{t('Performance Score')}</p>
                          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{stu.totalScore}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Rest of Leaderboard */}
            {leaderboard.length > 3 && (
              <div className="bg-slate-50 dark:bg-slate-800/20 rounded-[32px] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-850 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-850">
                        <th className="text-center px-4 py-4 w-16">{t('Rank') || 'Rank'}</th>
                        <th className="text-left px-6 py-4">{t('Student') || 'Student'}</th>
                        <th className="text-left px-6 py-4">{t('Location') || 'Location'}</th>
                        <th className="text-center px-4 py-4">{t('FLN Status') || 'FLN Status'}</th>
                        <th className="text-center px-4 py-4">{t('Engagement') || 'Engagement'}</th>
                        <th className="text-right px-6 py-4">{t('Score') || 'Score'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {leaderboard.slice(3).map((stu, index) => (
                        <tr key={stu.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-4 text-center font-black text-slate-400">
                            #{index + 4}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-extrabold text-slate-700 dark:text-slate-200">{stu.name}</div>
                            <div className="text-[10px] text-slate-400 font-medium">{stu.uid} • {t('Class')} {stu.classNum}</div>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                            <div>{stu.schoolName}</div>
                            <div className="text-[10px] text-slate-400">{stu.poName} • {stu.divName}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-1 items-center">
                              <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-bold">
                                L: {t(LIT_LABELS[stu.litLevel]) || LIT_LABELS[stu.litLevel]}
                              </span>
                              <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-bold">
                                N: {t(NUM_LABELS[stu.numLevel === 6 ? 5 : stu.numLevel === 5 ? 4 : stu.numLevel]) || NUM_LABELS[stu.numLevel === 6 ? 5 : stu.numLevel === 5 ? 4 : stu.numLevel]}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center text-xs text-slate-500 font-medium">
                            <div>🎮 {stu.gamesPlayed} {t('Games') || 'Games'}</div>
                            <div className="text-[10px] text-yellow-600">🏆 {stu.victories} {t('Victories')}</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-black text-base text-blue-600 dark:text-blue-400">{stu.totalScore}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {leaderboard.length === 0 && (
              <div className="py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-10 h-10 text-slate-300" />
                </div>
                <p className="text-slate-400 font-bold">{t('No students found matching current filters.')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: IMPLEMENTATION TRACKER */}
      {activeTab === 'implementation' && (
        <div className={`space-y-6 animate-in slide-in-from-bottom-4 duration-500 ${isPending ? 'opacity-50' : ''}`}>

          {/* Period Toggle */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <ClipboardList className="w-7 h-7 text-indigo-500" />
                {t('Implementation Tracker')}
              </h2>
              <p className="text-slate-500 font-medium mt-0.5 text-sm">{t('Track school-wise 90-minute cycle implementation and activity completion.')}</p>
            </div>
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1">
              {(['7d', '30d', 'all'] as const).map(p => (
                <button key={p} onClick={() => setImplPeriod(p)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    implPeriod === p ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}>
                  {p === '7d' ? t('7 Days') : p === '30d' ? t('30 Days') : t('All Time')}
                </button>
              ))}
            </div>
          </div>

          {/* KPI Cards */}
          {implData && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm border-l-4 border-l-indigo-500">
                <div className="flex items-center gap-2 mb-2 text-indigo-500"><School className="w-5 h-5" /></div>
                <p className="text-sm font-semibold text-slate-500 mb-1">{t('Active Schools')}</p>
                <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">{implData.kpis.activeSchools}<span className="text-base font-bold text-slate-400">/{implData.kpis.totalSchools}</span></h3>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm border-l-4 border-l-blue-500">
                <div className="flex items-center gap-2 mb-2 text-blue-500"><Activity className="w-5 h-5" /></div>
                <p className="text-sm font-semibold text-slate-500 mb-1">{t('Total Sessions')}</p>
                <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">{implData.kpis.totalSessions}</h3>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm border-l-4 border-l-amber-500">
                <div className="flex items-center gap-2 mb-2 text-amber-500"><Clock className="w-5 h-5" /></div>
                <p className="text-sm font-semibold text-slate-500 mb-1">{t('Avg Duration')}</p>
                <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">{implData.kpis.avgDuration}<span className="text-base font-bold text-slate-400"> min</span></h3>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm border-l-4 border-l-emerald-500">
                <div className="flex items-center gap-2 mb-2 text-emerald-500"><CheckCircle2 className="w-5 h-5" /></div>
                <p className="text-sm font-semibold text-slate-500 mb-1">{t('Avg Completion')}</p>
                <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">{implData.kpis.avgCompletion}<span className="text-base font-bold text-slate-400">%</span></h3>
              </div>
            </div>
          )}

          {/* School-wise Heatmap Table */}
          {implData && implData.schoolTable.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-2">
                  <School className="w-4 h-4 text-indigo-500" /> {t('School-wise Implementation Status')}
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {implData.schoolTable.filter((s: any) => s.status === 'active').length} {t('active')} · {implData.schoolTable.filter((s: any) => s.status === 'stale').length} {t('stale')} · {implData.schoolTable.filter((s: any) => s.status === 'inactive').length} {t('inactive')}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="text-left px-6 py-3">{t('School')}</th>
                      <th className="text-left px-4 py-3">{t('P.O. / Division')}</th>
                      <th className="text-center px-4 py-3">{t('Sessions')}</th>
                      <th className="text-center px-4 py-3">{t('Last Session')}</th>
                      <th className="text-center px-4 py-3">{t('Avg Duration')}</th>
                      <th className="text-center px-4 py-3">{t('Completion')}</th>
                      <th className="text-center px-4 py-3">{t('Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {implData.schoolTable.map((school: any) => {
                      const statusColors: Record<string, string> = {
                        active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                        stale: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                        inactive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                      };
                      const statusIcons: Record<string, string> = { active: '🟢', stale: '🟡', inactive: '🔴' };
                      const lastSessionText = school.lastSession
                        ? (() => {
                            const days = Math.floor((Date.now() - new Date(school.lastSession).getTime()) / (1000 * 60 * 60 * 24));
                            if (days === 0) return t('Today');
                            if (days === 1) return `1 ${t('day ago')}`;
                            return `${days} ${t('days ago')}`;
                          })()
                        : t('Never');
                      return (
                        <tr key={school.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-3 font-semibold text-slate-700 dark:text-slate-200">{school.name}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">
                            <div>{school.poName}</div>
                            <div className="text-[10px] text-slate-400">{school.divName}</div>
                          </td>
                          <td className="px-4 py-3 text-center font-black text-slate-700 dark:text-slate-200">{school.totalSessions}</td>
                          <td className="px-4 py-3 text-center text-xs text-slate-500">{lastSessionText}</td>
                          <td className="px-4 py-3 text-center text-xs font-medium text-slate-600">{school.avgDuration > 0 ? `${school.avgDuration}m` : '—'}</td>
                          <td className="px-4 py-3 text-center">
                            {school.completionRate > 0 ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 transition-all" style={{ width: `${school.completionRate}%` }} />
                                </div>
                                <span className="text-xs font-bold text-slate-600">{school.completionRate}%</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[school.status]}`}>
                              {statusIcons[school.status]} {t(school.status)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Charts Row: Activity Breakdown + Weekly Trend */}
          {implData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Completion Breakdown */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> {t('Activity Completion Rates')}
                </h3>
                <p className="text-xs text-slate-400 mb-5">{t('Which activities are teachers completing vs skipping?')}</p>
                {implData.activityBreakdown.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {implData.activityBreakdown.map((act: any) => (
                      <div key={act.name} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{act.name}</span>
                          <span className="font-black text-slate-800 dark:text-slate-200 shrink-0 ml-2">{act.rate}%
                            <span className="text-slate-400 font-normal ml-1">({act.completed}/{act.total})</span>
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-700 ${
                            act.rate >= 75 ? 'bg-emerald-500' : act.rate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`} style={{ width: `${act.rate}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-slate-400 text-sm">{t('No activity data yet')}</div>
                )}
              </div>

              {/* Weekly Trend */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" /> {t('Weekly Session Frequency')}
                </h3>
                <p className="text-xs text-slate-400 mb-5">{t('Sessions per week over the last 12 weeks')}</p>
                {implData.weeklyTrend.some((w: any) => w.sessions > 0) ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={implData.weeklyTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="implGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={8} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: any) => [`${value} sessions`]} />
                        <Area type="monotone" dataKey="sessions" stroke="#6366f1" strokeWidth={2.5} fill="url(#implGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-slate-400 text-sm">{t('No session data yet')}</div>
                )}
              </div>
            </div>
          )}

          {/* Empty state */}
          {(!implData || implData.kpis.totalSessions === 0) && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-20 border border-slate-100 dark:border-slate-800 shadow-sm text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                <ClipboardList className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-slate-400 font-bold">{t('No implementation sessions recorded yet.')}</p>
              <p className="text-sm text-slate-400">{t('Teachers can log sessions from the Classroom Implementation.')}</p>
            </div>
          )}
        </div>
      )}

      {/* STUDENT DETAILS POPUP */}
      {selectedSchoolForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                  <School className="w-6 h-6 text-blue-500" />
                  {selectedSchoolForDetails.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-2 mb-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-700/50 px-2 py-0.5 rounded shadow-sm">UDISE: {selectedSchoolForDetails.udiseCode}</span>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{selectedSchoolForDetails.poName} • {selectedSchoolForDetails.divName}</span>
                </div>
                <p className="text-slate-500 text-sm font-medium mt-1">
                  Total Assessed: <span className="font-bold text-slate-700 dark:text-slate-300">{selectedSchoolForDetails.totalAssessed}</span> | 
                  Score: <span className="font-bold text-blue-600">{selectedSchoolForDetails.score}%</span>
                </p>
              </div>
              <button 
                onClick={() => setSelectedSchoolForDetails(null)}
                className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-900/50">
              {isLoadingStudents ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-slate-500 font-medium animate-pulse">Loading student data...</p>
                </div>
              ) : schoolStudentsDetails.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-bold">No students found with endline data in this school.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {schoolStudentsDetails.map((s: any) => (
                    <div key={s.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{s.name}</div>
                        <div className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-md">Grade {s.classNum}</div>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-2">
                        <div className="flex items-center gap-1.5 font-medium">
                           <BookOpen className="w-4 h-4 text-blue-500" />
                           <span className={s.litLevel >= 4 ? 'text-green-600 font-bold' : 'text-slate-600 dark:text-slate-400'}>
                             {LIT_LABELS[s.litLevel] || 'Beginner'}
                           </span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                           <Calculator className="w-4 h-4 text-emerald-500" />
                           <span className={s.numLevel >= 4 ? 'text-green-600 font-bold' : 'text-slate-600 dark:text-slate-400'}>
                             {NUM_LABELS[s.numLevel] || 'Beginner'}
                           </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryTable({ type, selectedClass, overallBreakdown, classBreakdown }: any) {
  const { t } = useLanguage();
  const labels = type === 'literacy' ? LIT_LABELS : NUM_LABELS;
  const breakdown = selectedClass === 'all' ? overallBreakdown?.[type] : classBreakdown?.[type]?.[selectedClass];
  if (!breakdown) return null;
  const termsPresent = TERMS.filter(t => breakdown[t]);
  if (termsPresent.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">
          {t('Detailed Breakdown') || 'Detailed Breakdown'} {selectedClass !== 'all' ? `— ${t('Class')} ${selectedClass}` : `— ${t('All Classes') || 'All Classes'}`}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="text-left px-6 py-3">{t('Level') || 'Level'}</th>
              {termsPresent.map(t => (
                <th key={t} className="px-4 py-3 text-center" colSpan={2}>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: TERM_COLORS[t] }} />
                    {t} <span className="text-slate-400 font-normal">(n={breakdown[t]?.total ?? 0})</span>
                  </span>
                </th>
              ))}
            </tr>
            <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-xs text-slate-400">
              <th className="px-6 py-1" />
              {termsPresent.map(t => (
                <Fragment key={t}>
                  <th className="px-4 py-1 text-center">%</th>
                  <th className="px-4 py-1 text-center">#</th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {labels.map((label, lvl) => (
              <tr key={label} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-3 font-semibold text-slate-700 dark:text-slate-200">{label}</td>
                {termsPresent.map(t => {
                  const d = breakdown[t]?.levels?.[lvl];
                  return (
                    <Fragment key={t}>
                      <td className="px-4 py-3 text-center">
                        <span className="font-extrabold" style={{ color: TERM_COLORS[t] }}>{d?.pct ?? 0}%</span>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-500">{d?.count ?? 0}</td>
                    </Fragment>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

function KPI({ label, value, icon, color, suffix = "" }: { label: string; value: number; icon: React.ReactNode; color: string; suffix?: string }) {
  const colors: Record<string, string> = {
    blue: 'border-l-blue-500 text-blue-600',
    indigo: 'border-l-indigo-500 text-indigo-600',
    emerald: 'border-l-emerald-500 text-emerald-600',
  };
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 border-l-4 ${colors[color]}`}>
      <div className={`mb-2 ${colors[color]}`}>{icon}</div>
      <p className="text-sm font-semibold text-slate-500 mb-1">{label}</p>
      <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">{(value ?? 0).toLocaleString()}{suffix}</h3>
    </div>
  );
}

function BarCard({ title, icon, data, percentage }: { title: string; icon: string; data: any[]; percentage?: boolean }) {
  const hasData = data.some((d: any) => TERMS.some(t => (d[t] ?? 0) > 0));
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
      <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-5">{icon} {title}</h2>
      {!hasData ? (
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data for selected filters</div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={percentage ? (v: number) => `${v}%` : undefined}
                domain={percentage ? [0, 100] : undefined} />
              <Tooltip cursor={{ fill: '#f8fafc' }}
                formatter={percentage ? (value: any) => [`${value}%`] : undefined}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '12px' }} />
              {TERMS.map(t => <Bar key={t} dataKey={t} fill={TERM_COLORS[t]} radius={[4, 4, 0, 0]} />)}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
