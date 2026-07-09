import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import QRCode from "qrcode";
import { PaymentPanel } from "@/components/payment-panel";
import { db } from "@/db";
import { orders, videos } from "@/db/schema";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ orderId: string }>;
};

function asOrderStatus(
  status: string
): "pending" | "paid" | "expired" | "cancelled" {
  if (
    status === "pending" ||
    status === "paid" ||
    status === "expired" ||
    status === "cancelled"
  ) {
    return status;
  }
  return "pending";
}

export default async function CheckoutPage({ params }: Props) {
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
  if (!row) notFound();

  const { order, video } = row;

  let qrImageDataUrl: string | null = null;
  if (order.qrString) {
    qrImageDataUrl = await QRCode.toDataURL(order.qrString, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 320,
    });
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/videos/${video.id}`}
        className="inline-flex text-sm text-slate-400 transition hover:text-white"
      >
        ← Back to video
      </Link>

      <PaymentPanel
        initialOrder={{
          orderId: order.id,
          orderCode: order.billNumber,
          status: asOrderStatus(order.status),
          amountUsd: order.amount,
          currency: order.currency,
          buyerName: order.customerName || "Customer",
          buyerEmail: order.customerPhone || "",
          expiresAt: order.expiresAt.toISOString(),
          paidAt: order.paidAt ? order.paidAt.toISOString() : null,
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
            slug: video.id,
            thumbnailUrl: video.thumbnailUrl,
            description: video.description,
          },
        }}
      />
    </div>
  );
}
