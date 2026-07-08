"use client";
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { GraduationCap, ShieldCheck, Users, Database, KeyRound } from 'lucide-react';

interface TooltipProps {
  title: string;
  description: string;
}

function NavTooltip({ title, description }: TooltipProps) {
  return (
    <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50 dark:bg-slate-900 dark:border-slate-800">
      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-t border-l border-slate-100 dark:bg-slate-900 dark:border-slate-800" />
      <h5 className="font-extrabold text-xs text-orange-500 mb-1 relative z-10">{title}</h5>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal relative z-10">{description}</p>
    </div>
  );
}

export default function NavLinks({ isAdmin }: { isAdmin: boolean }) {
  const { t } = useLanguage();
  return (
    <div className="hidden sm:flex sm:items-center sm:gap-6">
      
      {/* Dashboards */}
      <div className="group relative py-2">
        <Link href="/dashboard" className="text-gray-500 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 text-sm font-medium transition-colors">
          {t('Dashboards')}
        </Link>
        <NavTooltip 
          title="Dashboards" 
          description="Analytics portal containing regional reports, student leaderboards, and learning growth velocity metrics." 
        />
      </div>

      {/* Implementation Corner */}
      <div className="group relative py-2">
        <Link href="/resources" className="text-gray-500 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 text-sm font-medium transition-colors flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4" /> {t('Implementation Corner')}
        </Link>
        <NavTooltip 
          title="Implementation Corner" 
          description="Interactive game arcade containing 2v2 multiplayer simulations for students to practice literacy and numeracy." 
        />
      </div>

      {/* Students */}
      <div className="group relative py-2">
        <Link href="/students" className="text-gray-500 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 text-sm font-medium transition-colors">
          {t('Students')}
        </Link>
        <NavTooltip 
          title="Students Profile" 
          description="Detailed register of all registered students, progress logs, and competitive match history." 
        />
      </div>

      {isAdmin && (
        <>
          {/* Upload */}
          <div className="group relative py-2">
            <Link href="/admin/upload" className="flex items-center gap-1 text-gray-400 hover:text-teal-600 text-sm font-medium transition-all">
              <ShieldCheck className="w-4 h-4" /> {t('Upload')}
            </Link>
            <NavTooltip 
              title="Bulk Upload" 
              description="Administrative tool to import student databases, school registers, and credentials via CSV files." 
            />
          </div>

          {/* Users */}
          <div className="group relative py-2">
            <Link href="/admin/users" className="flex items-center gap-1 text-gray-400 hover:text-teal-600 text-sm font-medium transition-all">
              <Users className="w-4 h-4" /> {t('Users')}
            </Link>
            <NavTooltip 
              title="Users Management" 
              description="Admin panel to create and configure accounts for teachers, coordinators, and state administrators." 
            />
          </div>

          {/* Data */}
          <div className="group relative py-2">
            <Link href="/admin/data" className="flex items-center gap-1 text-gray-400 hover:text-teal-600 text-sm font-medium transition-all">
              <Database className="w-4 h-4" /> {t('Data')}
            </Link>
            <NavTooltip 
              title="Database Explorer" 
              description="Administrative dashboard to view and maintain student assessment histories and raw database tables." 
            />
          </div>

          {/* Logins */}
          <div className="group relative py-2">
            <Link href="/admin/logins" className="flex items-center gap-1 text-gray-400 hover:text-teal-600 text-sm font-medium transition-all">
              <KeyRound className="w-4 h-4" /> {t('Logins')}
            </Link>
            <NavTooltip 
              title="Audit Logins" 
              description="Security audit log detailing account activities, timestamps, and login histories." 
            />
          </div>
        </>
      )}
    </div>
  );
}
