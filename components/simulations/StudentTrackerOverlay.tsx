'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, Save, User, X, CheckCircle2, Clock, Gamepad2, School, GraduationCap } from 'lucide-react';
import { getStudentsBySchool, recordSingleGameResult, getSchools } from '@/app/actions';
import { usePoints } from '@/lib/points-store';
import { cn } from '@/lib/utils';

const BATTLE_GAMES = [
  'marathi-letters',
  'marathi-words',
  'marathi-sent',
  'math-duel',
  'math-duel-b',
  'num-race',
  'num-race-b',
  'pv-battle',
  'pv-battle-b',
  'math-sprint',
  'sound-duel',
  'tili-duel',
  'tili-bundle-duel'
];

export default function StudentTrackerOverlay({
  schoolId: initialSchoolId,
  classNum: initialClassNum,
  gameSlug
}: {
  schoolId: string;
  classNum?: number;
  gameSlug: string;
}) {
  if (BATTLE_GAMES.includes(gameSlug)) {
    return null;
  }

  const { xp: globalXp } = usePoints();
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState(initialSchoolId || '');
  const [selectedClassNum, setSelectedClassNum] = useState<number>(initialClassNum || 3);
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  
  const [assignedStudent, setAssignedStudent] = useState<any | null>(null);
  const [initialXp, setInitialXp] = useState<number>(0);
  const [currentXp, setCurrentXp] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync initial props
  useEffect(() => {
    if (initialSchoolId && initialSchoolId !== 'mock-school-id') {
      setSelectedSchoolId(initialSchoolId);
    }
    if (initialClassNum) {
      setSelectedClassNum(initialClassNum);
    }
  }, [initialSchoolId, initialClassNum]);

  // Fetch schools if mock or empty schoolId
  useEffect(() => {
    if (!initialSchoolId || initialSchoolId === 'mock-school-id') {
      getSchools().then(setSchools);
    }
  }, [initialSchoolId]);

  // Fetch students when school or class changes
  useEffect(() => {
    if (selectedSchoolId && selectedSchoolId !== 'mock-school-id') {
      getStudentsBySchool(selectedSchoolId).then(res => {
        setStudents(res.filter(s => s.class === selectedClassNum));
      });
    } else {
      setStudents([]);
    }
  }, [selectedSchoolId, selectedClassNum]);

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
  };

  const handleSave = async () => {
    if (!assignedStudent || isSaving) return;
    setIsSaving(true);
    
    if (assignedStudent.id === 'guest') {
      setSaveSuccess(true);
      setTimeout(() => {
        setAssignedStudent(null);
        setSaveSuccess(false);
        setIsSaving(false);
      }, 1500);
      return;
    }
    
    const scoreEarned = currentXp - initialXp;
    
    const res = await recordSingleGameResult({
      schoolId: selectedSchoolId,
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

  // Render blocking verification overlay if no student is selected
  if (!assignedStudent) {
    const isMockSchool = !selectedSchoolId || selectedSchoolId === 'mock-school-id';
    return (
      <div className="absolute inset-0 z-[999] flex items-center justify-center bg-slate-950/90 backdrop-blur-lg p-4 overflow-y-auto">
        <div className="bg-slate-900 w-full max-w-md rounded-[32px] border border-slate-800 shadow-2xl p-6 flex flex-col space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/20 mx-auto mb-2">
              <Gamepad2 className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">Student Sign-In</h3>
            <p className="text-xs text-slate-400">Select your profile to unlock and record your session</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* School Selector (only shown if not preset) */}
            {(!initialSchoolId || initialSchoolId === 'mock-school-id') ? (
              <div className="col-span-2 space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <School className="w-3 h-3 text-orange-400" /> School
                </label>
                <select
                  value={selectedSchoolId}
                  onChange={(e) => setSelectedSchoolId(e.target.value)}
                  className="w-full bg-slate-800 border-none rounded-xl px-3 py-2.5 text-xs text-white focus:ring-2 focus:ring-orange-500 font-bold"
                >
                  <option value="">Choose School...</option>
                  {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            ) : null}

            {/* Class/Grade Selector */}
            <div className="col-span-2 space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-orange-400" /> Class/Grade
              </label>
              <select
                value={selectedClassNum}
                onChange={(e) => setSelectedClassNum(Number(e.target.value))}
                className="w-full bg-slate-800 border-none rounded-xl px-3 py-2.5 text-xs text-white focus:ring-2 focus:ring-orange-500 font-bold"
              >
                {[1, 2, 3, 4, 5].map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>
          </div>

          {/* Search/Name input */}
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Search by name, or type a new guest name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-orange-500 outline-none transition-all font-medium"
            />
          </div>

          {/* Student List Container */}
          <div className="flex-1 overflow-y-auto max-h-[160px] space-y-1 pr-1">
            {/* Custom Guest Name Option */}
            {search.trim().length > 0 && (
              <button
                onClick={() => handleAssign({ id: 'guest', name: search.trim() })}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-dashed border-slate-700 hover:bg-slate-800 text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-blue-500/20 text-slate-400 group-hover:text-blue-400 flex items-center justify-center font-black transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white text-xs">Play as Guest: "{search.trim()}"</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase">Scores won't be saved to db</p>
                </div>
              </button>
            )}

            {/* Students list */}
            {isMockSchool ? (
              <p className="text-center py-4 text-slate-500 text-xs font-bold">
                Please select a school to load student profiles.
              </p>
            ) : students.length === 0 ? (
              <p className="text-center py-4 text-slate-500 text-xs font-bold animate-pulse">
                Loading students for Class {selectedClassNum}...
              </p>
            ) : filteredStudents.length === 0 ? (
              <p className="text-center py-4 text-slate-500 text-xs font-bold">
                No students found in Class {selectedClassNum}.
              </p>
            ) : (
              filteredStudents.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleAssign(s)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800 text-left transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-orange-500/20 text-slate-400 group-hover:text-orange-400 flex items-center justify-center font-bold text-sm transition-colors uppercase">
                    {s.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-white text-xs">{s.name}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase">{s.gender} · {s.uid || "NO UID"}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Floating HUD when a student is actively playing
  return (
    <div className="absolute top-4 left-4 z-50 animate-in fade-in">
      <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur text-white p-2 pr-4 rounded-2xl border border-orange-500/30 shadow-xl animate-in slide-in-from-top-4">
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-black text-lg uppercase">
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
            <CheckCircle2 className="w-4 h-4" /> {assignedStudent.id === 'guest' ? 'Done!' : 'Saved!'}
          </div>
        ) : (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-black transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? "WAIT..." : (assignedStudent.id === 'guest' ? "FINISH" : "FINISH & SAVE")}
          </button>
        )}
        
        {!isSaving && !saveSuccess && (
          <button onClick={() => setAssignedStudent(null)} className="ml-1 p-1 hover:bg-white/10 rounded-lg text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
