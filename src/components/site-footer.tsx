export function SiteFooter() {
  const merchantName = process.env.MERCHANT_NAME || "Coffee NT26";
  const merchantCity = process.env.MERCHANT_CITY || "Phnom Penh";

  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-medium text-white uppercase tracking-tighter">SOKPHENG DARAMA AI MOVIE</p>
          <p>Premium digital video marketplace with Bakong KHQR.</p>
        </div>
        <div className="text-left sm:text-right">
          <p>Merchant: {merchantName}</p>
          <p>{merchantCity} · Cambodia</p>
        </div>
      </div>
    </footer>
  );
}
