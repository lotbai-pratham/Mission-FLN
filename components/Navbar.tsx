import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
import { auth, signOut } from '@/auth';
import MobileMenu from '@/components/MobileMenu';
import NavLinks from './NavLinks';
import NavActions from './NavActions';
import { hasRole } from '@/lib/checkAccess';

export default async function Navbar() {
  const session = await auth();
  const isAdmin = hasRole(session, "admin");

  const handleSignOut = async () => {
    'use server';
    await signOut({ redirectTo: '/' });
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/75 border-b border-gray-100 shadow-sm supports-[backdrop-filter]:bg-white/60 transition-all dark:bg-slate-900/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Left: Logo + desktop nav links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2.5 tracking-tight">
              <img src="/pratham-logo.png" alt="Pratham Logo" className="h-8 w-auto object-contain" />
              <span className="font-black text-xl bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                Mission FLN
              </span>
            </Link>
            <NavLinks isAdmin={isAdmin} />
          </div>

          {/* Right: CTA + user avatar (desktop) + hamburger (mobile) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <NavActions session={session} handleSignOut={handleSignOut} />

            {/* Mobile hamburger — client component */}
            <MobileMenu
              isAdmin={isAdmin}
              userName={session?.user?.name}
              userImage={session?.user?.image}
              isLoggedIn={!!session?.user}
            />
          </div>

        </div>
      </div>
    </nav>
  );
}
