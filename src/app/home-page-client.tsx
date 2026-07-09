"use client";

import { useEffect, useState } from "react";
import { VideoCard } from "@/components/video-card";
import { LoginGate } from "@/components/login-gate";
import type { Video } from "@/db/schema";

export function HomePageClient({ videos }: { videos: Video[] }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("tg_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {}
    }
    setLoading(false);
  }, []);

  if (loading) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 z-[100]">
        <LoginGate onLogin={(u) => {
          setUser(u);
          // Small delay to ensure state is set before showing catalog
          setTimeout(() => window.location.reload(), 100);
        }} />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4 sm:space-y-12 sm:py-6">
      <header className="text-center space-y-3 sm:space-y-4 text-white">
        <h1 className="text-2xl font-black uppercase tracking-tighter sm:text-5xl lg:text-6xl">
          SOKPHENG DARAMA AI MOVIE
        </h1>
        <p className="mx-auto max-w-lg text-xs font-medium text-slate-400 sm:text-base">
          Premium digital marketplace. Choose your movie, scan KHQR, and stream instantly.
        </p>
      </header>

      <section id="catalog" className="space-y-6 sm:space-y-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4">
          <h2 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2 sm:text-xl sm:tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Live Catalog
          </h2>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
            {videos.length} Movies Available
          </span>
        </div>
        
        {videos.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center rounded-[2rem] border-2 border-dashed border-white/5">
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No movies found in the catalog.</p>
          </div>
        )}
      </section>
    </div>
  );
}
