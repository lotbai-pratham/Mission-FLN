"use client";

import { ShieldCheck, User, Clock, Activity, School, Save } from 'lucide-react';
import { useState } from 'react';
import { setUserRole, assignUserSchool } from '@/app/actions';
import { cn } from '@/lib/utils';

export default function UsersClient({ initialUsers, schools }: { initialUsers: any[], schools: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    setLoadingId(userId);
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await setUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (e) {
      alert("Failed to update role");
    } finally {
      setLoadingId(null);
    }
  };

  const handleSchoolAssign = async (userId: string, schoolId: string | null) => {
    setLoadingId(userId);
    try {
      await assignUserSchool(userId, schoolId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, schoolId } : u));
    } catch (e) {
      alert("Failed to assign school");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="grid grid-cols-5 bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-semibold uppercase tracking-wider px-6 py-3 border-b border-slate-100 dark:border-slate-800">
        <span>User</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Last Login</span>
        <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> Sessions</span>
        <span className="flex items-center gap-1"><School className="w-3 h-3" /> Assigned School</span>
        <span>Role</span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {users.map((user: any) => (
          <div key={user.id} className={cn(
            "grid grid-cols-5 items-center px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors gap-3",
            loadingId === user.id && "opacity-50 pointer-events-none"
          )}>
            {/* User */}
            <div className="flex items-center gap-3 min-w-0">
              {user.image ? (
                <img src={user.image} alt={user.name ?? ''} className="w-9 h-9 rounded-full ring-2 ring-slate-100 flex-shrink-0 object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{user.name ?? '—'}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            {/* Last login */}
            <div className="text-sm text-slate-500">
              {user.lastLoginAt
                ? new Date(user.lastLoginAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : <span className="text-slate-300 dark:text-slate-600">Never</span>}
            </div>

            {/* Sessions */}
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {user._count?.sessions ?? 0}
            </div>

            {/* School assignment */}
            <div>
              <select
                value={user.schoolId ?? ''}
                onChange={e => handleSchoolAssign(user.id, e.target.value || null)}
                className="text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1.5 w-full max-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">— No school —</option>
                {schools.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Role */}
            <div className="flex items-center gap-3">
              <span className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                user.role === 'admin'
                  ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              )}>
                {user.role === 'admin' && <ShieldCheck className="w-3 h-3" />}
                {user.role}
              </span>

              <button 
                onClick={() => handleRoleToggle(user.id, user.role)}
                className={cn(
                  "text-xs font-semibold px-3 py-1.5 rounded-lg transition-all",
                  user.role === 'admin'
                    ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                )}
              >
                {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
              </button>
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <div className="px-6 py-12 text-center text-slate-400">
            No users have signed in yet.
          </div>
        )}
      </div>
    </div>
  );
}
