"use client";

import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import { formatUsd } from "@/lib/format";
import Link from "next/link";

type OrderData = {
  orderId: string;
  orderCode: string;
  status: "pending" | "paid" | "expired" | "cancelled";
  amountUsd: string;
  qrImageDataUrl: string;
  expiresAt: string;
  md5: string;
  merchantName: string;
  accessToken?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  videoTitle: string;
  priceUsd: string;
};

export function CheckoutModal({ isOpen, onClose, videoId, videoTitle, priceUsd }: Props) {
  const [step, setStep] = useState<"form" | "payment" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && isOpen) {
      const saved = localStorage.getItem("tg_user");
      if (saved) {
        try {
          const user = JSON.parse(saved);
          setBuyerName(user.first_name || "");
          setBuyerEmail(user.phone || "");
        } catch (e) {}
      }
    }
  }, [isOpen]);

  // Handle Form Submission
  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, buyerName, buyerEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");
      
      setOrder(data);
      setStep("payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Poll for payment status
  useEffect(() => {
    if (step !== "payment" || !order) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${order.orderId}/status`);
        const data = await res.json();
        if (data.status === "paid") {
          setOrder(prev => ({ ...prev!, status: "paid", accessToken: data.accessToken }));
          setStep("success");
          
          // Save to user library
          const library = JSON.parse(localStorage.getItem("my_videos") || "[]");
          if (!library.some((item: any) => item.orderId === data.orderId)) {
            library.push({
              orderId: data.orderId,
              videoId: data.video.id,
              title: data.video.title,
              thumbnailUrl: data.video.thumbnailUrl,
              accessToken: data.accessToken
            });
            localStorage.setItem("my_videos", JSON.stringify(library));
          }
          
          clearInterval(interval);
        } else if (data.status === "expired") {
          setOrder(prev => ({ ...prev!, status: "expired" }));
          setError("This payment session has expired.");
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [step, order]);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-[95%] transform overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900 px-4 pb-5 pt-6 text-left shadow-2xl transition-all sm:max-w-md sm:rounded-[2rem] sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-full bg-slate-800 p-1 text-slate-400 hover:text-white"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {step === "form" && (
                  <form onSubmit={handleCreateOrder} className="space-y-4">
                    <div className="text-center sm:text-left">
                      <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-white">
                        Checkout
                      </Dialog.Title>
                      <p className="mt-2 text-sm text-slate-400">
                        Confirm details to generate a payment QR code for {videoTitle}.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <input
                        required
                        type="text"
                        placeholder="Full Name"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-amber-300/50"
                      />
                      <input
                        required
                        type="text"
                        placeholder="Phone or Contact"
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-amber-300/50"
                      />
                    </div>

                    {error && <p className="text-xs text-rose-400">{error}</p>}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-2xl bg-amber-300 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:opacity-50"
                    >
                      {loading ? "Initializing..." : `Pay ${formatUsd(priceUsd)} with Bakong`}
                    </button>
                  </form>
                )}

                {step === "payment" && order && (
                  <div className="space-y-4 text-center sm:space-y-5">
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-white sm:text-xl">
                        Scan Bakong KHQR
                      </Dialog.Title>
                      <p className="mt-1 text-[10px] uppercase tracking-widest text-amber-300 sm:mt-2 sm:text-xs">
                        {order.merchantName} · {formatUsd(order.amountUsd)}
                      </p>
                    </div>

                    <div className="mx-auto w-full max-w-[200px] rounded-2xl bg-white p-2 shadow-xl sm:max-w-[240px] sm:rounded-3xl sm:p-3">
                      <img src={order.qrImageDataUrl} alt="KHQR" className="h-auto w-full rounded-lg sm:rounded-xl" />
                      <p className="mt-1.5 text-[8px] font-black text-slate-500 sm:mt-2 sm:text-[10px]">BAKONG KHQR</p>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs text-slate-300 sm:text-sm">
                      <ClockIcon className="h-3.5 w-3.5 text-amber-300 animate-pulse sm:h-4 sm:w-4" />
                      <span>Waiting for payment...</span>
                    </div>

                    <div className="rounded-xl bg-white/5 px-2 py-2 sm:px-3">
                      <p className="text-[8px] text-slate-500 break-all uppercase sm:text-[9px]">
                        MD5: {order.md5}
                      </p>
                    </div>
                  </div>
                )}

                {step === "success" && order && (
                  <div className="space-y-6 text-center py-4">
                    <div className="flex justify-center">
                      <CheckCircleIcon className="h-16 w-16 text-emerald-400" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-2xl font-bold text-white">
                        Payment Successful!
                      </Dialog.Title>
                      <p className="mt-2 text-sm text-slate-300">
                        Your video has been added to your library.
                      </p>
                    </div>
                    <Link
                      href={`/watch/${order.orderId}?token=${order.accessToken}`}
                      className="inline-block w-full rounded-2xl bg-emerald-400 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                    >
                      Watch Now
                    </Link>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
