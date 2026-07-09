import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET all videos for admin
export async function GET() {
  try {
    const allVideos = await db.select().from(videos).orderBy(videos.createdAt);
    return NextResponse.json(allVideos);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}

// POST new video
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, thumbnailUrl, videoUrl, priceUsd, category } = body;

    if (!title || !thumbnailUrl || !videoUrl || !priceUsd) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [newVideo] = await db.insert(videos).values({
      title,
      description: description || "",
      thumbnailUrl,
      videoUrl,
      previewUrl: videoUrl, // Use same URL for preview in this setup
      priceUsd: priceUsd.toString(),
      category: category || "General",
      isPublished: true,
      updatedAt: new Date(),
    }).returning();

    return NextResponse.json(newVideo);
  } catch (error) {
    console.error("Admin POST error:", error);
    return NextResponse.json({ error: "Failed to create video" }, { status: 500 });
  }
}
