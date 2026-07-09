import Link from "next/link";
import { getAllVideos, getFeaturedVideos } from "@/lib/videos";
import type { Video } from "@/db/schema";
import { HomePageClient } from "./home-page-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let videos: Video[] = [];

  try {
    const [v] = await Promise.all([getAllVideos()]);
    videos = v;
  } catch (error) {
    console.error("Home page data fetch error:", error);
  }

  return <HomePageClient videos={videos} />;
}
