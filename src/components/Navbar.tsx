import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-600/30">
            BK
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Bantay Kabankalan</p>
            <p className="text-xs text-slate-400">E-Governance Portal</p>
          </div>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/dashboard"
            className="rounded-xl px-4 py-2 text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            Dashboard
          </Link>
          <Link
            href="/tickets"
            className="rounded-xl px-4 py-2 text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            Tickets
          </Link>
          <Link
            href="/tickets/new"
            className="rounded-xl px-4 py-2 text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            Report Issue
          </Link>
          <Link
            href="/permits"
            className="rounded-xl px-4 py-2 text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            Permits
          </Link>
          <Link
            href="/staff"
            className="rounded-xl px-4 py-2 text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            Staff
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 font-medium text-white transition hover:bg-white/10"
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}