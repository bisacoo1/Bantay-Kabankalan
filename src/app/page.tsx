import Link from 'next/link';
import HeroSlideshow from '@/components/HeroSlideshow';

const features = [
  {
    title: 'Issue Ticketing',
    description:
      'Report busted streetlights, potholes, garbage issues, and drainage clogging with photo and location.',
  },
  {
    title: 'Barangay Transparency',
    description: 'See announcements, projects, and contact details for your barangay officials.',
  },
  {
    title: 'Document Tracking',
    description: 'Track permits and clearances from City Hall in one place.',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-white">
      <section className="relative isolate min-h-screen overflow-hidden">
        <HeroSlideshow />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-20">
          <div className="max-w-4xl">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium text-white backdrop-blur">
              Kabankalan City • E-Governance Portal
            </span>

            <h1 className="mt-6 text-5xl font-bold tracking-tight text-white md:text-7xl">
              Bantay Kabankalan
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 md:text-xl">
              Report local issues, track permits, and stay informed about your barangay — all in one modern portal.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-500"
              >
                Create Account
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                Login
              </Link>
              <Link
                href="/dashboard"
                className="rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-emerald-500/30"
              >
                Open Dashboard
              </Link>
            </div>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 text-white backdrop-blur-md shadow-2xl">
              <h3 className="text-xl font-semibold">Fast Reporting</h3>
              <p className="mt-2 text-sm text-slate-200">
                Submit tickets with a photo and location.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 text-white backdrop-blur-md shadow-2xl">
              <h3 className="text-xl font-semibold">Transparency</h3>
              <p className="mt-2 text-sm text-slate-200">
                View barangay announcements and officials.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 text-white backdrop-blur-md shadow-2xl">
              <h3 className="text-xl font-semibold">Tracking</h3>
              <p className="mt-2 text-sm text-slate-200">
                Monitor permits and clearances online.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 text-slate-900">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
              Why residents use Bantay Kabankalan
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              A cleaner, faster way to report and track local concerns
            </h2>
            <p className="mt-4 text-slate-600">
              Built for citizens, barangay officials, and city hall staff to improve responsiveness and transparency.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}