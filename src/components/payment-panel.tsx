"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatDate, formatUsd } from "@/lib/format";

type OrderPayload = {
  orderId: string;
  orderCode: string;
  status: "pending" | "paid" | "expired" | "cancelled";
  amountUsd: string;
  currency: string;
  buyerName: string;
  buyerEmail: string;
  expiresAt: string;
  paidAt: string | null;
  qr: string | null;
  md5: string | null;
  qrImageDataUrl: string | null;
  merchantName: string;
  accessToken: string | null;
  watchUrl: string | null;
  video: {
    id: string;
    title: string;
    slug: string;
    thumbnailUrl: string;
    description?: string;
  };
};

export function PaymentPanel({ initialOrder }: { initialOrder: OrderPayload }) {
  const [order, setOrder] = useState(initialOrder);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);

  const expiresLabel = useMemo(
    () => formatDate(order.expiresAt),
    [order.expiresAt]
  );

  async function refreshStatus(manual = false) {
    if (order.status === "paid") return;
    if (manual) setChecking(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${order.orderId}/status`, {
        cache: "no-store",
      });
      const data = (await response.json()) as Partial<OrderPayload> & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Unable to check payment");
      }

      setOrder((prev) => ({
        ...prev,
        status: (data.status as OrderPayload["status"]) || prev.status,
        paidAt: data.paidAt ?? prev.paidAt,
        accessToken: data.accessToken ?? prev.accessToken,
        watchUrl: data.watchUrl ?? prev.watchUrl,
      }));
      setLastCheckedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment check failed");
    } finally {
      if (manual) setChecking(false);
    }
  }

  useEffect(() => {
    if (order.status !== "pending") return;

    const interval = setInterval(() => {
      void refreshStatus(false);
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.status, order.orderId]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-300">
              Order {order.orderCode}
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              Scan Bakong KHQR
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Open ABA, ACLEDA, Wing, or any Bakong-supported bank app, choose
              KHQR scan, and pay{" "}
              <span className="font-semibold text-white">
                {formatUsd(order.amountUsd)}
              </span>{" "}
              to <span className="text-white">{order.merchantName}</span>.
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-[280px_1fr]">
          <div className="mx-auto flex w-full max-w-[280px] flex-col items-center rounded-3xl bg-white p-4 shadow-xl">
            {order.qrImageDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={order.qrImageDataUrl}
                alt="Bakong KHQR payment code"
                className="h-auto w-full rounded-2xl"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500">
                QR unavailable
              </div>
            )}
            <p className="mt-3 text-center text-xs font-medium text-slate-600">
              Bakong KHQR · {order.currency}
            </p>
          </div>

          <div className="space-y-4">
            <InfoRow label="Video" value={order.video.title} />
            <InfoRow label="Buyer" value={`${order.buyerName} · ${order.buyerEmail}`} />
            <InfoRow label="Amount" value={formatUsd(order.amountUsd)} />
            <InfoRow label="Merchant" value={order.merchantName} />
            <InfoRow label="Expires" value={expiresLabel} />
            {order.md5 ? (
              <InfoRow label="MD5" value={order.md5} mono />
            ) : null}

            {order.status === "pending" ? (
              <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                Waiting for payment confirmation from Bakong. This page checks
                automatically every 5 seconds.
                {lastCheckedAt ? (
                  <span className="mt-1 block text-xs text-amber-100/70">
                    Last checked {formatDate(lastCheckedAt)}
                  </span>
                ) : null}
              </div>
            ) : null}

            {order.status === "paid" ? (
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-4 text-sm text-emerald-100">
                <p className="font-semibold text-emerald-200">
                  Payment confirmed!
                </p>
                <p className="mt-1">
                  Your video is unlocked. Keep this page or save the watch link.
                </p>
                {order.watchUrl ? (
                  <Link
                    href={order.watchUrl}
                    className="mt-4 inline-flex rounded-2xl bg-emerald-300 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-emerald-200"
                  >
                    Watch video now
                  </Link>
                ) : null}
              </div>
            ) : null}

            {order.status === "expired" ? (
              <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-4 text-sm text-rose-100">
                This KHQR expired. Go back to the video page and create a new
                checkout.
                <div className="mt-3">
                  <Link
                    href={`/videos/${order.video.slug}`}
                    className="inline-flex rounded-2xl bg-white px-4 py-2 font-semibold text-slate-950"
                  >
                    Buy again
                  </Link>
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            {order.status === "pending" ? (
              <button
                type="button"
                onClick={() => void refreshStatus(true)}
                disabled={checking}
                className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-60"
              >
                {checking ? "Checking Bakong..." : "I already paid — check now"}
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={order.video.thumbnailUrl}
            alt={order.video.title}
            className="aspect-video w-full object-cover"
          />
          <div className="space-y-2 p-5">
            <h2 className="text-xl font-semibold text-white">
              {order.video.title}
            </h2>
            {order.video.description ? (
              <p className="text-sm leading-6 text-slate-300">
                {order.video.description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-5">
          <h3 className="text-lg font-semibold text-white">How to pay</h3>
          <ol className="mt-3 space-y-3 text-sm leading-6 text-slate-300">
            <li>1. Open your bank app with Bakong / KHQR support.</li>
            <li>2. Choose Scan KHQR and scan the code on the left.</li>
            <li>3. Confirm the amount and merchant name.</li>
            <li>4. Wait a few seconds — this page unlocks automatically.</li>
          </ol>
        </div>
      </aside>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderPayload["status"] }) {
  const styles: Record<OrderPayload["status"], string> = {
    pending: "bg-amber-300/15 text-amber-200 border-amber-300/20",
    paid: "bg-emerald-300/15 text-emerald-200 border-emerald-300/20",
    expired: "bg-rose-300/15 text-rose-200 border-rose-300/20",
    cancelled: "bg-slate-300/15 text-slate-200 border-slate-300/20",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p
        className={`mt-1 break-all text-sm text-slate-100 ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
