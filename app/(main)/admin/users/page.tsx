export const dynamic = 'force-dynamic';
import { getUsers, getSchools, getDivisions, getProjectOffices } from '@/app/actions';
import { Shield, Building2, Map, Users, Eye } from 'lucide-react';
import UsersClient from './UsersClient';

export default async function AdminUsersPage() {
  const [users, schools, divisions, projectOffices] = await Promise.all([
    getUsers(), 
    getSchools(),
    getDivisions(),
    getProjectOffices()
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">User Management</h1>
        <p className="text-slate-500 mt-1">Manage roles and assign teachers to their schools for scoped access.</p>
      </div>

      <UsersClient 
        initialUsers={users} 
        schools={schools} 
        divisions={divisions}
        projectOffices={projectOffices}
      />

      {/* Permissions Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm mt-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-indigo-500" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Role Permissions Matrix</h2>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          This table defines the visibility and data access constraints for each hierarchical role.
        </p>

        <div className="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-2xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="px-6 py-4 font-semibold w-1/4">Role</th>
                <th className="px-6 py-4 font-semibold w-1/4">Scope Level</th>
                <th className="px-6 py-4 font-semibold">Data Visibility & Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr className="bg-white dark:bg-slate-900">
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                    <Shield className="w-3 h-3" /> System Admin
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">Platform Wide</td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2"><Eye className="w-3.5 h-3.5 text-emerald-500" /> View all students, assessments, and analytics across all divisions.</li>
                    <li className="flex items-center gap-2"><Eye className="w-3.5 h-3.5 text-emerald-500" /> Manage platform settings, upload bulk data, and manage users.</li>
                  </ul>
                </td>
              </tr>
              <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    <Map className="w-3 h-3" /> Division Manager
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">Specific Division</td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2"><Eye className="w-3.5 h-3.5 text-emerald-500" /> View analytics for all Project Offices within their assigned Division.</li>
                    <li className="flex items-center gap-2"><Eye className="w-3.5 h-3.5 text-emerald-500" /> Filter down to any school in their division.</li>
                  </ul>
                </td>
              </tr>
              <tr className="bg-white dark:bg-slate-900">
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                    <Building2 className="w-3 h-3" /> Project Office
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">Specific Project Office</td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2"><Eye className="w-3.5 h-3.5 text-emerald-500" /> View analytics strictly for schools within their assigned Project Office.</li>
                    <li className="flex items-center gap-2"><Eye className="w-3.5 h-3.5 text-emerald-500" /> View struggling students and engagement for those specific schools.</li>
                  </ul>
                </td>
              </tr>
              <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    <Users className="w-3 h-3" /> School User
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">Specific School</td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2"><Eye className="w-3.5 h-3.5 text-emerald-500" /> View assessments and data strictly for their assigned School.</li>
                    <li className="flex items-center gap-2"><Eye className="w-3.5 h-3.5 text-emerald-500" /> Record new assessments and trigger gameplay sessions for their students.</li>
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
