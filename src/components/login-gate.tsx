"use client";

import { useEffect, useState, useRef } from "react";

function TelegramWidget({ botName }: { botName: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    containerRef.current.appendChild(script);
    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [botName]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={containerRef} className="min-h-[40px] transition-all hover:scale-105" />
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Connect with Telegram</p>
    </div>
  );
}

export function LoginGate({ onLogin }: { onLogin: (user: any) => void }) {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isWebApp, setIsWebApp] = useState(false);

  useEffect(() => {
    // 1. Automatic Catch if inside Telegram Web App
    const checkTG = () => {
      const tg = (window as any).Telegram?.WebApp;
      if (tg && tg.initDataUnsafe?.user) {
        const u = tg.initDataUnsafe.user;
        setUser(u);
        setName(u.first_name + (u.last_name ? " " + u.last_name : ""));
        setIsWebApp(true);
        tg.ready();
        tg.expand();
      }
    };

    checkTG();
    // Re-check after a short delay to ensure script initialization
    const timer = setTimeout(checkTG, 500);

    // 2. Listener for manual profile connection via Login Widget
    (window as any).onTelegramAuth = (u: any) => {
      setUser(u);
      setName(u.first_name + (u.last_name ? " " + u.last_name : ""));
    };

    return () => clearTimeout(timer);
  }, []);

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUser = {
      ...user,
      first_name: name,
      phone: phone
    };
    localStorage.setItem("tg_user", JSON.stringify(finalUser));
    onLogin(finalUser);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center bg-[#07624d] overflow-y-auto pb-10">
      {/* Background circles effect */}
      <div className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none opacity-20">
         <div className="absolute -top-10 -left-10 h-64 w-64 rounded-full border-[30px] border-white/20"></div>
         <div className="absolute top-20 -right-10 h-48 w-48 rounded-full border-[20px] border-white/20"></div>
      </div>

      <div className="relative mt-12 mb-8 flex flex-col items-center text-center px-4">
        <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-2xl">
          <span className="text-3xl">☕️</span>
        </div>
        <h1 className="mt-4 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
          SOKPHENG DARAMA AI MOVIE
        </h1>
        <p className="mt-1 text-sm font-medium text-white/80">សូមស្វាគមន៍ 🙏</p>
      </div>

      <div className="relative w-full max-w-[360px] bg-white rounded-[2.5rem] shadow-2xl px-6 py-8 mx-4">
        <h2 className="text-xl font-black text-slate-800 tracking-tight">ចូលប្រើប្រាស់</h2>
        <p className="mt-1 text-[10px] text-slate-400 font-medium leading-relaxed">
          សូមបញ្ចូលឈ្មោះ លេខទូរស័ព្ទ និងភ្ជាប់តេឡេក្រាមរបស់អ្នក
        </p>

        <div className="mt-6 space-y-5">
          {user ? (
             <div className="flex items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-3 shadow-sm transition-all hover:bg-sky-100/50">
               {user.photo_url ? (
                 <img src={user.photo_url} alt="" className="h-10 w-10 rounded-full border-2 border-white shadow-sm" />
               ) : (
                 <div className="h-10 w-10 rounded-full bg-sky-200 flex items-center justify-center text-sky-700 font-bold border-2 border-white shadow-sm">
                   {user.first_name[0]}
                 </div>
               )}
               <div className="min-w-0 flex-1">
                 <div className="flex items-center gap-1.5 text-[11px] text-sky-600 font-black">
                   <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 10.38 15.84 14.16 15.51 16.01C15.37 16.79 15.11 17.06 14.83 17.09C14.23 17.12 13.77 16.67 13.19 16.3C12.28 15.72 11.77 15.36 10.89 14.78C9.87 14.11 10.53 13.74 11.11 13.14C11.26 12.98 13.9 11.53 13.95 11.31C13.96 11.28 13.96 11.17 13.9 11.12C13.84 11.07 13.75 11.08 13.68 11.1C13.59 11.12 12.18 12.05 9.45 13.89C9.05 14.17 8.69 14.31 8.36 14.3C8 14.29 7.3 14.11 6.78 13.94C6.14 13.73 5.64 13.62 5.68 13.27C5.7 13.09 5.95 12.9 6.43 12.71C9.39 11.52 11.37 10.74 12.36 10.33C15.17 9.17 15.75 8.97 16.14 8.97C16.22 8.97 16.41 8.99 16.47 9.04C16.52 9.09 16.54 9.15 16.54 9.21C16.54 9.27 16.53 9.34 16.52 9.4C16.51 9.45 16.58 8.87 16.64 8.8Z"/>
                   </svg>
                   <span>បានភ្ជាប់ពី {user.username ? user.username : 'Telegram'}</span>
                 </div>
                 <p className="text-[13px] font-bold text-slate-800 truncate uppercase tracking-tight">
                   {user.first_name} {user.last_name}
                 </p>
               </div>
               <button 
                onClick={() => setUser(null)}
                className="text-[10px] font-bold text-sky-400 hover:text-sky-600 transition"
               >
                ផ្លាស់ប្តូរ
               </button>
             </div>
          ) : (
             <div className="space-y-4">
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                  <div className="flex justify-center mb-4">
                    <TelegramWidget botName={process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || "DaramaMovieBot"} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Please login to continue
                  </p>
                </div>
                
                {/* Information about automatic detection */}
                <div className="rounded-xl bg-amber-50 p-3 text-[10px] text-amber-700 leading-relaxed text-center font-medium">
                  Note: Automatic detection works best when opened as a <strong>Telegram Mini App</strong>. In standard browsers, please use the login button above.
                </div>
             </div>
          )}

          <form onSubmit={handleFinish} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">ឈ្មោះ *</label>
              <input
                required
                type="text"
                placeholder="ឈ្មោះរបស់អ្នក"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border-none px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-[#07624d]/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">លេខទូរស័ព្ទ *</label>
              <input
                required
                type="tel"
                placeholder="ឧ. 012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border-none px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-[#07624d]/20"
              />
            </div>

            <button
              type="submit"
              className="mt-4 w-full rounded-2xl bg-[#07624d] py-4 text-sm font-bold text-white shadow-xl shadow-[#07624d]/20 hover:bg-[#054d3d] transition-colors"
            >
              បន្តទៅកាន់គេហទំព័រ
            </button>
          </form>
        </div>
      </div>
      
      <p className="mt-8 text-[10px] text-white/50 uppercase font-black tracking-widest">
        Powered by AI darama
      </p>
    </div>
  );
}
