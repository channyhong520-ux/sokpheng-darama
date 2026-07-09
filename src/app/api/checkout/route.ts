import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, videos } from "@/db/schema";
import { generatePaymentKhqr } from "@/lib/bakong";
import { createAccessToken, createOrderCode } from "@/lib/orders";
import { ensureVideosSeeded } from "@/lib/videos";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await ensureVideosSeeded();

    const body = (await request.json()) as {
      videoId?: string;
      buyerName?: string;
      buyerEmail?: string;
    };

    const videoId = body.videoId?.trim();
    const buyerName = body.buyerName?.trim();
    const buyerEmail = body.buyerEmail?.trim().toLowerCase();

    if (!videoId || !buyerName || !buyerEmail) {
      return NextResponse.json(
        { error: "videoId, buyerName, and buyerEmail are required" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    const videoRows = await db
      .select()
      .from(videos)
      .where(eq(videos.id, videoId))
      .limit(1);
    const video = videoRows[0];

    if (!video || !video.isPublished) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const billNumber = createOrderCode();
    const accessToken = createAccessToken();
    const amountUsd = Number(video.priceUsd);

    const khqr = await generatePaymentKhqr({
      amountUsd,
      billNumber,
      storeLabel: "VideoKH",
      expirationMinutes: 15,
    });

    const [order] = await db
      .insert(orders)
      .values({
        videoId: video.id,
        amount: video.priceUsd,
        currency: "USD",
        status: "pending",
        qrString: khqr.qr,
        md5: khqr.md5,
        billNumber,
        accessToken,
        customerName: buyerName,
        customerPhone: buyerEmail.slice(0, 40),
        expiresAt: khqr.expiresAt,
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      orderId: order.id,
      orderCode: order.billNumber,
      amountUsd: order.amount,
      currency: order.currency,
      expiresAt: order.expiresAt,
      qr: khqr.qr,
      md5: khqr.md5,
      qrImageDataUrl: khqr.qrImageDataUrl,
      merchantName: process.env.MERCHANT_NAME || "Merchant",
      video: {
        id: video.id,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
      },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create Bakong KHQR checkout",
      },
      { status: 500 }
    );
  }
}
