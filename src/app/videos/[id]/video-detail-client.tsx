"use client";

import { useState, useEffect } from "react";
import type { Video } from "@/db/schema";
import { formatDuration, formatUsd } from "@/lib/format";
import { CheckoutModal } from "@/components/checkout-modal";
import Link from "next/link";

export function VideoDetailClient({ video }: { video: Video }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    const library = JSON.parse(localStorage.getItem("my_videos") || "[]");
    const found = library.find((item: any) => item.videoId === video.id);
    if (found) {
      setIsPaid(true);
      setOrderId(found.orderId);
      setAccessToken(found.accessToken);
    }
  }, [video.id]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
      <section className="space-y-4 sm:space-y-6">
        {isPaid ? (
          <div className="overflow-hidden rounded-[2rem] border border-emerald-400/20 bg-black shadow-2xl shadow-black/30">
            <video
              className="aspect-video w-full bg-black object-contain"
              controls
              playsInline
              webkit-playsinline="true"
              poster={video.thumbnailUrl}
              preload="metadata"
              controlsList="nodownload"
            >
              <source src={video.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          <div className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/40 shadow-2xl shadow-black/30">
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="aspect-video w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
              <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white/10 text-white shadow-2xl backdrop-blur-md">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-widest">Locked</span>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 rounded-xl bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
              Preview Locked · Purchase to Stream
            </div>
          </div>
        )}

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
              {video.category}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
              {formatDuration(video.durationSeconds)}
            </span>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white sm:text-4xl">
            {video.title}
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
            {video.description}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <InfoBox label="Price" value={formatUsd(video.priceUsd)} highlight />
            <InfoBox label="Access" value="Lifetime" />
            <InfoBox label="Payment" value="Bakong KHQR" />
          </div>
        </div>
      </section>

      <aside>
        <div className="sticky top-24 space-y-6 rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-5 sm:rounded-[2rem] sm:p-8 backdrop-blur-xl">
          {isPaid ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-emerald-400 sm:text-2xl">Video Unlocked</h2>
                <p className="mt-2 text-sm text-slate-400">
                  You have already purchased this video. You can stream it anytime from your folder.
                </p>
              </div>
              <Link
                href={`/watch/${orderId}?token=${accessToken}`}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-6 py-4 text-base font-bold text-slate-950 transition hover:bg-emerald-300"
              >
                Watch Now
              </Link>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-xl font-bold text-white sm:text-2xl">Unlock Full Access</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Get instant streaming access to this premium video by paying with any Bakong-supported banking app.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-slate-400">Total Amount</span>
                  <span className="text-xl font-bold text-emerald-400">{formatUsd(video.priceUsd)}</span>
                </div>
                
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-amber-300 px-6 py-4 text-base font-bold text-slate-950 transition hover:bg-amber-200"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12 11V16H10V11H8L11 7L14 11H12Z" fill="currentColor"/>
                  </svg>
                  Scan & Pay Now
                </button>
                
                <p className="text-center text-[10px] uppercase tracking-widest text-slate-500">
                  Secure Bakong KHQR Transaction
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 p-4 text-xs leading-relaxed text-slate-400">
                <p>1. Press the button to "pop" the QR code.</p>
                <p className="mt-1">2. Scan with your ABA, Wing, or ACLEDA app.</p>
                <p className="mt-1">3. Video unlocks instantly after confirmation.</p>
              </div>
            </>
          )}
        </div>
      </aside>

      <CheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoId={video.id}
        videoTitle={video.title}
        priceUsd={video.priceUsd}
      />
    </div>
  );
}

function InfoBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center sm:text-left">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
      <p className={`mt-1 text-sm font-bold sm:text-base ${highlight ? 'text-emerald-400' : 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}
