"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { User, Search, MapPin, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { getStudentsList } from "@/app/actions";
import { useLanguage } from "@/context/LanguageContext";
import WarliMotif from "@/components/warli/WarliMotif";

export default function RosterClient({ hierarchy, initialData }: { hierarchy: any[], initialData: any }) {
  const { t } = useLanguage();
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [divId, setDivId] = useState("");
  const [poId, setPoId] = useState("");
  const [schoolId, setSchoolId] = useState("");

  const activeDivision = hierarchy.find(d => d.id === divId);
  const pos = activeDivision ? activeDivision.projectOffices : [];
  const activePO = pos.find((p: any) => p.id === poId);
  const schools = activePO ? activePO.schools : [];

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      startTransition(async () => {
        const newData = await getStudentsList(query, page, divId, poId, schoolId);
        setData(newData);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [query, page, divId, poId, schoolId]);

  return (
    <div className="max-w-5xl mx-auto mt-8 animate-in fade-in flex flex-col gap-6 pb-16">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <WarliMotif variant="dancer" size={34} className="warli-ink opacity-80 shrink-0" />
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{t('Active Students') || 'Student Roster'}</h1>
            <p className="text-slate-500 mt-1">{t('List of all registered students and their status.') || 'Select a student to view their Pedagogy learning recommendations.'}</p>
          </div>
        </div>
        
        <div className="relative w-full sm:w-auto">
           <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input type="text" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder={t('Search student...') || "Search by name or UID..."} 
                   className="w-full sm:w-72 pl-10 pr-4 py-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center z-20">
        <div className="flex items-center gap-2 text-slate-400 font-bold px-2">
           <Filter className="w-5 h-5"/>
           <span className="hidden lg:inline">{t('Filters') || 'Filters'}:</span>
        </div>
        
        <select value={divId} onChange={(e) => { setDivId(e.target.value); setPoId(""); setSchoolId(""); setPage(1); }}
                className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 font-medium">
          <option value="">{t('All Divisions')}</option>
          {hierarchy.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        
        <select value={poId} onChange={(e) => { setPoId(e.target.value); setSchoolId(""); setPage(1); }} disabled={!divId}
                className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 font-medium disabled:opacity-50">
          <option value="">{t('All Project Offices')}</option>
          {pos.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <select value={schoolId} onChange={(e) => { setSchoolId(e.target.value); setPage(1); }} disabled={!poId}
                className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 font-medium disabled:opacity-50">
          <option value="">{t('All Schools')}</option>
          {schools.map((s: any) => (
            <option key={s.id} value={s.id}>{s.name} ({s.udiseCode})</option>
          ))}
        </select>
      </div>

      <div className={`bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
        <div className="divide-y divide-slate-100 dark:divide-slate-800 min-h-[400px]">
          {data.students.map((student: any) => (
            <Link key={student.id} href={`/students/${student.id}`} className="group flex items-center justify-between py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-6 transition-all cursor-pointer">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-100 transition-colors">
                   <User className="w-6 h-6"/>
                 </div>
                 <div>
                   <div className="flex flex-wrap items-center gap-2">
                     <h3 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition-colors">{student.name}</h3>
                     <span className="text-[10px] font-black tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-md uppercase">
                       {student.uid}
                     </span>
                     {student._count?.assessments !== undefined && (
                       <span className="text-[10px] font-black tracking-wider bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-md uppercase">
                         {student._count.assessments} {t('Assessments')}
                       </span>
                     )}
                   </div>
                   <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                     <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {student.school.name} ({student.school.udiseCode})</span>
                     <span>•</span><span>{t('Class')} {student.class}</span><span>•</span><span>{t(student.gender) || student.gender}</span>
                   </div>
                  </div>
               </div>
               <div className="text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                 {t('View Profile') || 'View Profile'}
               </div>
            </Link>
          ))}
          {data.students.length === 0 && (
             <div className="py-16 flex flex-col items-center justify-center text-center text-slate-400 font-medium space-y-3">
               <WarliMotif variant="deer" size={56} className="warli-ink opacity-60" />
               <p>{t('No students found.')}</p>
             </div>
          )}
        </div>

        {data.pages > 1 && (
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
             <span className="text-sm text-slate-500">{t('Showing page')} <b className="text-slate-800 dark:text-slate-200">{page}</b> {t('of')} <b>{data.pages}</b> ({data.total} {t('records')})</span>
             <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                      className={`px-3 py-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-1 ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100'}`}>
                   <ChevronLeft className="w-4 h-4"/> Prev
                </button>
                <button onClick={() => setPage(Math.min(data.pages, page + 1))} disabled={page === data.pages || data.pages === 0}
                      className={`px-3 py-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-1 ${page === data.pages || data.pages === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100'}`}>
                   Next <ChevronRight className="w-4 h-4"/>
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
