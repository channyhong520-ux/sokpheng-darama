"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { formatUsd } from "@/lib/format";

type Props = {
  videoId: string;
  videoTitle: string;
  priceUsd: string;
};

export function CheckoutForm({ videoId, videoTitle, priceUsd }: Props) {
  const router = useRouter();
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, buyerName, buyerEmail }),
      });

      const data = (await response.json()) as {
        orderId?: string;
        error?: string;
      };

      if (!response.ok || !data.orderId) {
        throw new Error(data.error || "Checkout failed");
      }

      router.push(`/checkout/${data.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/30"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-amber-300">
          Bakong KHQR Checkout
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Buy full access
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          Pay {formatUsd(priceUsd)} for <span className="text-white">{videoTitle}</span>{" "}
          using any Cambodian banking app that supports KHQR.
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-200">Full name</span>
        <input
          required
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
          placeholder="Sokha Chan"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none ring-amber-300/40 placeholder:text-slate-500 focus:ring-2"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-200">Email</span>
        <input
          required
          type="email"
          value={buyerEmail}
          onChange={(e) => setBuyerEmail(e.target.value)}
          placeholder="you@email.com"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none ring-amber-300/40 placeholder:text-slate-500 focus:ring-2"
        />
      </label>

      {error ? (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-r from-amber-300 via-orange-300 to-rose-400 px-4 py-3.5 text-sm font-semibold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Creating KHQR..." : `Pay ${formatUsd(priceUsd)} with KHQR`}
      </button>

      <p className="text-xs leading-5 text-slate-400">
        After payment is confirmed by Bakong, you will unlock an instant
        streaming link for this video. QR codes expire in 15 minutes.
      </p>
    </form>
  );
}
