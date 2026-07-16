"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { ClipboardPlus, LogIn, LogOut, Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface NavActionsProps {
  session: any;
  userRole: string;
  handleSignOut: () => Promise<void>;
}

export default function NavActions({ session, userRole, handleSignOut }: NavActionsProps) {
  const { t, language, setLanguage } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'mr', label: 'मराठी', flag: '🇮🇳' }
  ] as const;

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Language Switcher Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold border border-slate-100 dark:border-slate-800 transition-all cursor-pointer"
        >
          <Globe className="w-4 h-4 text-amber-500" />
          <span className="hidden xs:inline">{currentLang.flag} {currentLang.label}</span>
          <span className="xs:hidden">{currentLang.flag}</span>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setDropdownOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-2 transition-colors cursor-pointer ${
                  language === lang.code ? 'text-amber-600 font-bold bg-amber-50/50 dark:bg-amber-950/20' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {(userRole === 'admin') && (
        <Link
          href="/assessments/live"
          className="bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 px-4 sm:px-5 py-2 rounded-full text-sm font-semibold shadow-lg shadow-amber-500/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <ClipboardPlus className="w-4 h-4" />
          <span className="hidden sm:inline">{t('Record Score')}</span>
        </Link>
      )}

      {/* Desktop: avatar + sign out */}
      {session?.user ? (
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
          <Link href="/profile" className="cursor-pointer hover:opacity-80 transition-opacity" title="My Profile">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name ?? 'User'}
                width={32}
                height={32}
                className="rounded-full ring-2 ring-amber-100 object-cover w-8 h-8"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-sm">
                {session.user.name?.[0] ?? 'U'}
              </div>
            )}
          </Link>
          <button 
            onClick={() => handleSignOut()} 
            className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg transition-colors cursor-pointer" 
            title={t('Sign Out')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
