"use client";
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { GraduationCap, ShieldCheck, Users, Database, KeyRound } from 'lucide-react';

export default function NavLinks({ isAdmin }: { isAdmin: boolean }) {
  const { t } = useLanguage();
  return (
    <div className="hidden sm:flex sm:items-center sm:gap-6">
      <Link href="/dashboard" className="text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-colors">
        {t('Dashboards')}
      </Link>
      <Link href="/resources" className="text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-colors flex items-center gap-1.5">
        <GraduationCap className="w-4 h-4" /> {t('Implementation Corner')}
      </Link>
      <Link href="/students" className="text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-colors">
        {t('Students')}
      </Link>
      {isAdmin && (
        <>
          <Link href="/admin/upload" className="flex items-center gap-1 text-gray-400 hover:text-blue-600 text-sm font-medium transition-all">
            <ShieldCheck className="w-4 h-4" /> {t('Upload')}
          </Link>
          <Link href="/admin/users" className="flex items-center gap-1 text-gray-400 hover:text-blue-600 text-sm font-medium transition-all">
            <Users className="w-4 h-4" /> {t('Users')}
          </Link>
          <Link href="/admin/data" className="flex items-center gap-1 text-gray-400 hover:text-blue-600 text-sm font-medium transition-all">
            <Database className="w-4 h-4" /> {t('Data')}
          </Link>
          <Link href="/admin/logins" className="flex items-center gap-1 text-gray-400 hover:text-blue-600 text-sm font-medium transition-all">
            <KeyRound className="w-4 h-4" /> {t('Logins')}
          </Link>
        </>
      )}
    </div>
  );
}
