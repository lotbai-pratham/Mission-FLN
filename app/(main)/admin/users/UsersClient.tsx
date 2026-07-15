"use client";

import { ShieldCheck, User, Clock, Activity, School, Building2, Map } from 'lucide-react';
import { useState } from 'react';
import { setUserRole, assignUserScope } from '@/app/actions';
import { cn } from '@/lib/utils';

export default function UsersClient({ 
  initialUsers, 
  schools,
  divisions,
  projectOffices 
}: { 
  initialUsers: any[], 
  schools: any[],
  divisions: any[],
  projectOffices: any[]
}) {
  const [users, setUsers] = useState(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoadingId(userId);
    try {
      await setUserRole(userId, newRole as any);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (e) {
      alert("Failed to update role");
    } finally {
      setLoadingId(null);
    }
  };

  const handleScopeAssign = async (userId: string, scopeType: 'school' | 'project_office' | 'division' | null, scopeId: string | null) => {
    setLoadingId(userId);
    try {
      await assignUserScope(userId, scopeType, scopeId);
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            schoolId: scopeType === 'school' ? scopeId : null,
            projectOfficeId: scopeType === 'project_office' ? scopeId : null,
            divisionId: scopeType === 'division' ? scopeId : null,
          };
        }
        return u;
      }));
    } catch (e) {
      alert("Failed to assign scope");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="grid grid-cols-[3fr_2fr_1fr_2fr_3fr] bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-semibold uppercase tracking-wider px-6 py-3 border-b border-slate-100 dark:border-slate-800 gap-4">
        <span>User</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Last Login</span>
        <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> Sess.</span>
        <span>Role</span>
        <span>Scope Assignment</span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {users.map((user: any) => (
          <div key={user.id} className={cn(
            "grid grid-cols-[3fr_2fr_1fr_2fr_3fr] items-center px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors gap-4",
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

            {/* Role */}
            <div>
              <select
                value={user.role}
                onChange={e => handleRoleChange(user.id, e.target.value)}
                className={cn(
                  "text-xs font-bold rounded-xl border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full",
                  user.role === 'admin' 
                    ? "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800/50 dark:bg-violet-900/20 dark:text-violet-300" 
                    : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                )}
              >
                <option value="user">School User</option>
                <option value="project_office">Project Office</option>
                <option value="division">Division Manager</option>
                <option value="state">State Coordinator</option>
                <option value="admin">System Admin</option>
              </select>
            </div>

            {/* Scope assignment */}
            <div className="flex items-center gap-2">
              {user.role === 'admin' ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400">
                  <ShieldCheck className="w-4 h-4" /> Full System Access
                </div>
              ) : user.role === 'state' ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <Map className="w-4 h-4" /> State Level Access
                </div>
              ) : user.role === 'division' ? (
                <>
                  <Map className="w-4 h-4 text-emerald-500 shrink-0" />
                  <select
                    value={user.divisionId ?? ''}
                    onChange={e => handleScopeAssign(user.id, 'division', e.target.value || null)}
                    className="text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="">— Select Division —</option>
                    {divisions.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </>
              ) : user.role === 'project_office' ? (
                <>
                  <Building2 className="w-4 h-4 text-orange-500 shrink-0" />
                  <select
                    value={user.projectOfficeId ?? ''}
                    onChange={e => handleScopeAssign(user.id, 'project_office', e.target.value || null)}
                    className="text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="">— Select Project Office —</option>
                    {projectOffices.map((po: any) => (
                      <option key={po.id} value={po.id}>{po.name} ({po.division?.name})</option>
                    ))}
                  </select>
                </>
              ) : (
                <>
                  <School className="w-4 h-4 text-blue-500 shrink-0" />
                  <select
                    value={user.schoolId ?? ''}
                    onChange={e => handleScopeAssign(user.id, 'school', e.target.value || null)}
                    className="text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">— Select School —</option>
                    {schools.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </>
              )}
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
