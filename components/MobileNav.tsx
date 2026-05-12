"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Gamepad2, LayoutDashboard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Students", icon: Users, href: "/students" },
  { label: "Arcade", icon: Gamepad2, href: "/resources/simulations" },
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-3 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
      <ul className="flex justify-between items-center max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <li key={item.label}>
              <Link 
                href={item.href} 
                className={cn(
                  "flex flex-col items-center gap-1 transition-all",
                  isActive ? "text-emerald-600 dark:text-emerald-400 scale-110" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
