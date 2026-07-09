import Link from "next/link";
import { notFound } from "next/navigation";
import { getVideoById } from "@/lib/videos";
import { VideoDetailClient } from "./video-detail-client";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function VideoDetailPage({ params }: Props) {
  const { id } = await params;
  let video;
  
  try {
    video = await getVideoById(id);
  } catch (error) {
    console.error("Video detail fetch error:", error);
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center sm:p-10">
        <h2 className="text-xl font-bold text-white">Video Unavailable</h2>
        <p className="mt-2 text-sm text-slate-400 sm:text-base">There was an error loading this video's details.</p>
        <Link href="/" className="mt-6 inline-block font-medium text-amber-300">Back to catalog</Link>
      </div>
    );
  }

  if (!video || !video.isPublished) notFound();

  return (
    <div className="space-y-6 sm:space-y-8">
      <Link
        href="/#catalog"
        className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
          <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
        </svg>
        Back to catalog
      </Link>

      <VideoDetailClient video={video} />
    </div>
  );
}
