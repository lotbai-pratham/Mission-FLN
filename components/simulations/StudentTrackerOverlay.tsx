'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, Save, User, X, CheckCircle2, Clock } from 'lucide-react';
import { getStudentsBySchool, recordSingleGameResult } from '@/app/actions';
import { usePoints } from '@/lib/points-store';
import { cn } from '@/lib/utils';

export default function StudentTrackerOverlay({
  schoolId,
  classNum,
  gameSlug
}: {
  schoolId: string;
  classNum: number;
  gameSlug: string;
}) {
  const { xp: globalXp } = usePoints();
  const [isOpen, setIsOpen] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  
  const [assignedStudent, setAssignedStudent] = useState<any | null>(null);
  const [initialXp, setInitialXp] = useState<number>(0);
  const [currentXp, setCurrentXp] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch students
  useEffect(() => {
    if (isOpen && students.length === 0 && schoolId && schoolId !== "mock-school-id") {
      getStudentsBySchool(schoolId).then(res => {
        setStudents(res.filter(s => s.class === classNum));
      });
    }
  }, [isOpen, schoolId, classNum, students.length]);

  // Track global XP updates
  useEffect(() => {
    if (assignedStudent) {
      const handleXpUpdate = (e: Event) => {
        const customEvent = e as CustomEvent;
        if (customEvent.detail) {
          setCurrentXp(customEvent.detail.xp);
        }
      };
      window.addEventListener('fln_hub_xp_update', handleXpUpdate);
      return () => window.removeEventListener('fln_hub_xp_update', handleXpUpdate);
    }
  }, [assignedStudent]);

  // Update timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (assignedStudent && startTime > 0) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [assignedStudent, startTime]);

  const handleAssign = (student: any) => {
    setAssignedStudent(student);
    setInitialXp(globalXp);
    setCurrentXp(globalXp);
    setStartTime(Date.now());
    setElapsedSeconds(0);
    setSaveSuccess(false);
    setIsOpen(false);
  };

  const handleSave = async () => {
    if (!assignedStudent || isSaving) return;
    setIsSaving(true);
    
    const scoreEarned = currentXp - initialXp;
    
    const res = await recordSingleGameResult({
      schoolId,
      studentId: assignedStudent.id,
      gameSlug,
      score: scoreEarned,
      duration: elapsedSeconds
    });

    setIsSaving(false);
    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => {
        setAssignedStudent(null);
        setSaveSuccess(false);
      }, 2000);
    } else {
      alert("Failed to save. Please try again.");
    }
  };

  const pointsEarned = currentXp - initialXp;
  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="absolute top-4 left-4 z-50">
        {!assignedStudent ? (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 bg-slate-900/80 backdrop-blur text-white px-4 py-2 rounded-xl border border-white/10 hover:bg-slate-800 transition-all font-bold text-sm shadow-xl"
          >
            <UserPlus className="w-4 h-4 text-orange-400" />
            Play as Student
          </button>
        ) : (
          <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur text-white p-2 pr-4 rounded-2xl border border-orange-500/30 shadow-xl animate-in slide-in-from-top-4">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-black text-lg">
              {assignedStudent.name[0]}
            </div>
            <div>
              <p className="text-xs font-black text-orange-400">PLAYING AS</p>
              <p className="font-bold text-sm leading-tight">{assignedStudent.name}</p>
            </div>
            
            <div className="h-8 w-px bg-white/10 mx-2" />
            
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400">SCORE</p>
              <p className="font-mono font-bold text-emerald-400">{pointsEarned}</p>
            </div>
            
            <div className="h-8 w-px bg-white/10 mx-2" />
            
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400">TIME</p>
              <p className="font-mono font-bold text-slate-300">
                {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
              </p>
            </div>

            <div className="h-8 w-px bg-white/10 mx-2" />

            {saveSuccess ? (
              <div className="flex items-center gap-1 text-emerald-400 font-bold px-2">
                <CheckCircle2 className="w-4 h-4" /> Saved!
              </div>
            ) : (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-black transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? "SAVING..." : "FINISH & SAVE"}
              </button>
            )}
            
            {!isSaving && !saveSuccess && (
              <button onClick={() => setAssignedStudent(null)} className="ml-1 p-1 hover:bg-white/10 rounded-lg text-slate-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 w-full max-w-md rounded-[32px] border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-white">Select Student</h3>
                <p className="text-sm text-slate-400">Class {classNum} · Record score & time</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 border-b border-slate-800 bg-slate-800/30">
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-all"
              />
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              {students.length === 0 && schoolId !== "mock-school-id" ? (
                <p className="text-center py-8 text-slate-500 text-sm font-bold animate-pulse">Loading students...</p>
              ) : filteredStudents.length === 0 ? (
                <p className="text-center py-8 text-slate-500 text-sm font-bold">No students found.</p>
              ) : (
                <div className="space-y-1">
                  {filteredStudents.map(s => (
                    <button
                      key={s.id}
                      onClick={() => handleAssign(s)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-left transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-orange-500/20 text-slate-400 group-hover:text-orange-400 flex items-center justify-center font-black transition-colors">
                        {s.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-white">{s.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{s.gender} · {s.uid || "NO UID"}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
