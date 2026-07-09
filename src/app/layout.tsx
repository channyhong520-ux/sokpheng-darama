import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

import type { Viewport } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "SOKPHENG DARAMA AI MOVIE · Digital Video Marketplace",
  description: "Buy and stream premium movies instantly with Bakong KHQR.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="flex min-h-screen flex-col bg-slate-950 antialiased overflow-x-hidden selection:bg-amber-400 selection:text-slate-950">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
