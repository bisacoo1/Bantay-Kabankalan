import SignupForm from '@/components/SignupForm';
import { createClient } from '@/lib/supabase/server';
import { FALLBACK_BARANGAYS } from '@/lib/barangays';

export default async function SignupPage() {
  const supabase = await createClient();

  const { data: barangays, error } = await supabase
    .from('barangays')
    .select('slug,name')
    .order('name', { ascending: true });

  const barangayOptions =
    !error && barangays && barangays.length > 0 ? barangays : FALLBACK_BARANGAYS;

  return (
    <main className="relative min-h-[calc(100vh-73px)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_28%)]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl items-center px-6 py-12">
        <div className="grid w-full gap-10 lg:grid-cols-2 lg:items-center">
          <div className="max-w-xl">
            <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-1 text-sm text-slate-200 backdrop-blur">
              Create your citizen account
            </span>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white md:text-6xl">
              Join Bantay Kabankalan
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-300">
              Register once to report issues, check barangay updates, and track permits online.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Fast reporting</p>
                <p className="mt-1 text-sm text-slate-300">Send tickets with photos and location.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Transparency</p>
                <p className="mt-1 text-sm text-slate-300">See barangay officials and announcements.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Tracking</p>
                <p className="mt-1 text-sm text-slate-300">Check permit status anytime.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/95 p-6 shadow-2xl shadow-black/30 backdrop-blur">
            <h2 className="text-2xl font-bold text-slate-900">Create account</h2>
            <p className="mt-2 text-sm text-slate-600">
              Pick your barangay from the list below.
            </p>

            <div className="mt-6">
              <SignupForm barangays={barangayOptions} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}