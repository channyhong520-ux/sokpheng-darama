import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-amber-300">404</p>
      <h1 className="mt-3 text-3xl font-semibold text-white">Page not found</h1>
      <p className="mt-3 text-sm text-slate-300">
        The video or order you requested does not exist.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950"
      >
        Back to store
      </Link>
    </div>
  );
}
