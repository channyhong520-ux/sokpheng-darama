import Link from "next/link";
import type { Video } from "@/db/schema";
import { formatDuration, formatUsd } from "@/lib/format";

export function VideoCard({ video }: { video: Video }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl transition-all hover:border-amber-300/40 sm:rounded-3xl">
      <Link href={`/videos/${video.id}`} className="block">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
          <div className="absolute bottom-2 left-2 flex flex-wrap items-center gap-1.5 sm:bottom-3 sm:left-3">
            <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur sm:px-3 sm:py-1 sm:text-xs">
              {video.category}
            </span>
            <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-slate-200 backdrop-blur sm:px-3 sm:py-1 sm:text-xs">
              {formatDuration(video.durationSeconds)}
            </span>
          </div>
        </div>
        <div className="space-y-1.5 p-3 sm:space-y-3 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-sm font-bold text-white sm:text-lg">{video.title}</h3>
            <p className="shrink-0 rounded-full bg-emerald-400/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 sm:px-3 sm:py-1 sm:text-sm">
              {formatUsd(video.priceUsd)}
            </p>
          </div>
          <p className="line-clamp-2 text-[10px] leading-tight text-slate-400 sm:text-sm sm:leading-6">
            {video.description}
          </p>
          <span className="inline-flex items-center text-[10px] font-bold text-amber-300 sm:text-sm">
            Buy Now →
          </span>
        </div>
      </Link>
    </article>
  );
}
