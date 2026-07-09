import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, videos } from "@/db/schema";
import { formatDate, formatDuration, formatUsd } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function WatchPage({ params, searchParams }: Props) {
  const { orderId } = await params;
  const { token } = await searchParams;

  if (!token) {
    return (
      <LockedState
        title="Access token required"
        message="Open the watch link from your paid order page to stream this video."
      />
    );
  }

  const rows = await db
    .select({
      order: orders,
      video: videos,
    })
    .from(orders)
    .innerJoin(videos, eq(orders.videoId, videos.id))
    .where(and(eq(orders.id, orderId), eq(orders.accessToken, token)))
    .limit(1);

  const row = rows[0];
  if (!row) notFound();

  const { order, video } = row;

  if (order.status !== "paid") {
    return (
      <LockedState
        title="Payment not confirmed"
        message="This video unlocks only after Bakong KHQR payment is confirmed."
        href={`/checkout/${order.id}`}
        cta="Check payment status"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
            Unlocked access
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            {video.title}
          </h1>
        </div>
        <Link
          href="/"
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
        >
          Browse more videos
        </Link>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-emerald-400/20 bg-black shadow-2xl shadow-emerald-950/40">
        <video
          className="aspect-video w-full bg-black object-contain"
          controls
          autoPlay
          playsInline
          webkit-playsinline="true"
          poster={video.thumbnailUrl}
          controlsList="nodownload"
        >
          <source src={video.videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:grid-cols-2 lg:grid-cols-4">
        <Meta label="Order" value={order.billNumber} />
        <Meta label="Paid" value={formatUsd(order.amount)} />
        <Meta
          label="Paid at"
          value={order.paidAt ? formatDate(order.paidAt) : "—"}
        />
        <Meta label="Duration" value={formatDuration(video.durationSeconds)} />
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold text-white">About this video</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          {video.description}
        </p>
        <p className="mt-4 text-sm text-slate-400">
          Licensed stream for {order.customerName || "customer"}
          {order.customerPhone ? ` (${order.customerPhone})` : ""}. Keep your
          private link safe.
        </p>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function LockedState({
  title,
  message,
  href,
  cta,
}: {
  title: string;
  message: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Locked</p>
      <h1 className="mt-3 text-3xl font-semibold text-white">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-slate-300">{message}</p>
      <div className="mt-6 flex justify-center gap-3">
        {href && cta ? (
          <Link
            href={href}
            className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950"
          >
            {cta}
          </Link>
        ) : null}
        <Link
          href="/"
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
