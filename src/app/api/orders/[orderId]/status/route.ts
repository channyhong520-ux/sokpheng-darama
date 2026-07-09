import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, videos } from "@/db/schema";
import { checkTransactionByMd5 } from "@/lib/bakong";

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

    let order = row.order;
    const video = row.video;
    const now = new Date();

    if (order.status === "pending" && order.expiresAt < now) {
      const [expired] = await db
        .update(orders)
        .set({ status: "expired", updatedAt: new Date() })
        .where(and(eq(orders.id, order.id), eq(orders.status, "pending")))
        .returning();
      if (expired) order = expired;
    }

    if (order.status === "pending" && order.md5) {
      const check = await checkTransactionByMd5(order.md5);

      if (check.paid) {
        const [paid] = await db
          .update(orders)
          .set({
            status: "paid",
            paidAt: new Date(),
            updatedAt: new Date(),
          })
          .where(and(eq(orders.id, order.id), eq(orders.status, "pending")))
          .returning();

        if (paid) order = paid;
      }
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
      accessToken: order.status === "paid" ? order.accessToken : null,
      watchUrl:
        order.status === "paid"
          ? `/watch/${order.id}?token=${order.accessToken}`
          : null,
      video: {
        id: video.id,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
      },
    });
  } catch (error) {
    console.error("Order status error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to check payment status",
      },
      { status: 500 }
    );
  }
}
