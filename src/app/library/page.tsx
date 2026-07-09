"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

type PurchasedVideo = {
  orderId: string;
  videoId: string;
  title: string;
  thumbnailUrl: string;
  accessToken: string;
};

export default function LibraryPage() {
  const [videos, setVideos] = useState<PurchasedVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("my_videos");
    if (stored) {
      setVideos(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">My Video Folder</h1>
            <p className="mt-2 text-slate-400">All your purchased premium videos in one place.</p>
          </div>
          <Link
            href="/#catalog"
            className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
          >
            Store Catalog
          </Link>
        </header>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-video animate-pulse rounded-3xl bg-white/5" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="rounded-[3rem] border border-white/10 bg-white/5 py-24 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
              <svg className="h-10 w-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold">Your folder is empty</h2>
            <p className="mt-2 text-slate-400">Purchased videos will appear here automatically.</p>
            <Link
              href="/#catalog"
              className="mt-8 inline-block rounded-2xl border border-white/20 px-8 py-3 font-medium transition hover:bg-white/10"
            >
              Browse Videos
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <Link
                key={video.orderId}
                href={`/watch/${video.orderId}?token=${video.accessToken}`}
                className="group relative block overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 transition hover:scale-[1.02] hover:border-amber-300/30"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-300 text-slate-950 shadow-xl">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="truncate font-semibold text-white">{video.title}</h3>
                  <p className="mt-1 text-xs text-slate-500 uppercase tracking-widest">Unlocked</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
