import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, videos } from "@/db/schema";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ orderId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { orderId } = await params;

    const rows = await db
      .select({
        order: orders,
        video: videos,
      })
      .from(orders)
      .innerJoin(videos, eq(orders.videoId, videos.id))
      .where(eq(orders.id, orderId))
      .limit(1);

    const row = rows[0];
    if (!row) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { order, video } = row;

    let qrImageDataUrl: string | null = null;
    if (order.qrString) {
      qrImageDataUrl = await QRCode.toDataURL(order.qrString, {
        errorCorrectionLevel: "M",
        margin: 2,
        width: 320,
      });
    }

    return NextResponse.json({
      orderId: order.id,
      orderCode: order.billNumber,
      status: order.status,
      amountUsd: order.amount,
      currency: order.currency,
      buyerName: order.customerName,
      buyerEmail: order.customerPhone,
      expiresAt: order.expiresAt,
      paidAt: order.paidAt,
      qr: order.qrString,
      md5: order.md5,
      qrImageDataUrl,
      merchantName: process.env.MERCHANT_NAME || "Merchant",
      accessToken: order.status === "paid" ? order.accessToken : null,
      watchUrl:
        order.status === "paid"
          ? `/watch/${order.id}?token=${order.accessToken}`
          : null,
      video: {
        id: video.id,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
        description: video.description,
      },
    });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json(
      { error: "Unable to load order" },
      { status: 500 }
    );
  }
}
