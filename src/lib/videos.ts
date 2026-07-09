import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { videos, type Video } from "@/db/schema";
import { SAMPLE_VIDEOS } from "@/lib/seed-data";

export async function ensureVideosSeeded(): Promise<void> {
  const existing = await db.select({ id: videos.id }).from(videos).limit(1);
  if (existing.length > 0) return;

  await db.insert(videos).values(
    SAMPLE_VIDEOS.map((video) => ({
      title: video.title,
      description: video.description,
      category: video.category,
      thumbnailUrl: video.thumbnailUrl,
      previewUrl: video.previewUrl,
      videoUrl: video.videoUrl,
      durationSeconds: video.durationSeconds,
      priceUsd: video.priceUsd,
      isPublished: true,
    }))
  );
}

export async function getAllVideos(): Promise<Video[]> {
  try {
    // We don't want to re-seed and add extra stuff if we manually cleaned it
    // But we keep this for initial setup safety
    await ensureVideosSeeded();
    return await db
      .select()
      .from(videos)
      .where(eq(videos.isPublished, true))
      .orderBy(desc(videos.createdAt));
  } catch (e) {
    console.error("Database query failed, returning fallback static data", e);
    return SAMPLE_VIDEOS.map((v, i) => ({
      id: `fallback-${i}`,
      title: v.title,
      description: v.description,
      thumbnailUrl: v.thumbnailUrl,
      videoUrl: v.videoUrl,
      previewUrl: v.previewUrl,
      priceUsd: v.priceUsd,
      durationSeconds: v.durationSeconds,
      category: v.category,
      isPublished: true,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      telegramFileId: null,
      telegramMessageId: null,
      telegramThumbFileId: null,
    })) as Video[];
  }
}

export async function getFeaturedVideos(): Promise<Video[]> {
  const all = await getAllVideos();
  return all.slice(0, 3);
}

export async function getVideoById(id: string): Promise<Video | null> {
  try {
    await ensureVideosSeeded();
    const rows = await db.select().from(videos).where(eq(videos.id, id)).limit(1);
    
    if (rows[0]) return rows[0];

    // If ID looks like a fallback ID, try to match it with sample data
    if (id.startsWith("fallback-")) {
      const index = parseInt(id.replace("fallback-", ""), 10);
      const v = SAMPLE_VIDEOS[index];
      if (v) {
        return {
          id: id,
          title: v.title,
          description: v.description,
          thumbnailUrl: v.thumbnailUrl,
          videoUrl: v.videoUrl,
          previewUrl: v.previewUrl,
          priceUsd: v.priceUsd,
          durationSeconds: v.durationSeconds,
          category: v.category,
          isPublished: true,
          viewCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          telegramFileId: null,
          telegramMessageId: null,
          telegramThumbFileId: null,
        } as Video;
      }
    }

    return null;
  } catch (e) {
    console.error(`Error fetching video ${id}:`, e);
    return null;
  }
}

export async function getVideoBySlugOrId(slugOrId: string): Promise<Video | null> {
  return getVideoById(slugOrId);
}

export function videoPath(video: Pick<Video, "id">): string {
  return `/videos/${video.id}`;
}
