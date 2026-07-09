"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function SiteHeader() {
  const [tgUser, setTgUser] = useState<{ first_name: string; photo_url?: string } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("tg_user");
    if (savedUser) {
      try {
        setTgUser(JSON.parse(savedUser));
      } catch (e) {}
    }

    const listener = () => {
      const user = localStorage.getItem("tg_user");
      setTgUser(user ? JSON.parse(user) : null);
    };

    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("tg_user");
    setTgUser(null);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-2 py-2 sm:px-6 sm:py-3">
        <Link href="/" className="group flex items-center gap-1.5 sm:gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-rose-500 text-sm font-black text-slate-950 shadow-lg shadow-rose-500/30 sm:h-10 sm:w-10 sm:rounded-2xl sm:text-lg">
            S
          </span>
          <div className="min-w-0">
            <p className="truncate text-[9px] font-black uppercase tracking-tighter text-white xs:text-xs sm:text-sm sm:tracking-normal">
              SOKPHENG DARAMA AI MOVIE
            </p>
            <p className="hidden text-[8px] text-slate-400 sm:block">Bakong KHQR Payments</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1 text-[10px] sm:gap-2 sm:text-sm">
          <Link
            href="/library"
            className="group flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1.5 text-slate-300 transition hover:border-amber-300/30 hover:bg-white/10 hover:text-amber-300 sm:px-4 sm:py-2"
          >
            <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9l-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="font-bold">Folder</span>
          </Link>
          <Link
            href="/admin"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white sm:h-9 sm:w-9"
            title="Admin"
          >
            <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
          
          {tgUser && (
             <button 
               onClick={handleLogout}
               className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[8px] font-bold text-slate-400 hover:bg-white/10 transition uppercase tracking-tighter"
             >
               Logout
             </button>
          )}
        </nav>
      </div>
    </header>
  );
}
