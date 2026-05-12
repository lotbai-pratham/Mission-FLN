export const dynamic = 'force-dynamic';
import { getUsers, getSchools } from '@/app/actions';
import { School } from 'lucide-react';
import UsersClient from './UsersClient';

export default async function AdminUsersPage() {
  const [users, schools] = await Promise.all([getUsers(), getSchools()]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">User Management</h1>
        <p className="text-slate-500 mt-1">Manage roles and assign teachers to their schools for scoped access.</p>
      </div>

      <UsersClient initialUsers={users} schools={schools} />

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl px-6 py-4 text-sm text-blue-700 dark:text-blue-300 flex items-start gap-3">
        <School className="w-5 h-5 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">School-scoped access</p>
          <p className="text-blue-600/80 dark:text-blue-400/80 mt-0.5">
            Users assigned to a school will only see students, assessments, and data from that school when they log in.
            Admins always see everything.
          </p>
        </div>
      </div>
    </div>
  );
}
