import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type Official = {
  name: string;
  position?: string;
  phone?: string;
  email?: string;
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name,role,barangay_slug')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12 text-slate-900">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-2xl font-bold text-red-700">Profile error</h1>
          <p className="mt-2 text-sm text-red-600">
            There was a problem loading your profile.
          </p>
          <p className="mt-2 text-xs text-red-500">{profileError.message}</p>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="relative min-h-[calc(100vh-73px)] overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_30%)]" />
        <div className="relative z-10 mx-auto max-w-4xl px-6 py-12">
          <div className="rounded-3xl border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-black/30 backdrop-blur">
            <h1 className="text-2xl font-bold text-red-700">Profile not found</h1>
            <p className="mt-2 text-sm text-slate-600">
              You are signed in, but your profile row could not be loaded.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!profile.barangay_slug) {
    return (
      <main className="relative min-h-[calc(100vh-73px)] overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_30%)]" />
        <div className="relative z-10 mx-auto max-w-4xl px-6 py-12">
          <div className="rounded-3xl border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-black/30 backdrop-blur">
            <h1 className="text-2xl font-bold text-yellow-700">Complete your profile</h1>
            <p className="mt-2 text-sm text-slate-600">
              Your account is signed in, but no barangay is linked yet.
            </p>
            <div className="mt-4">
              <Link
                href="/signup"
                className="inline-flex rounded-xl bg-slate-950 px-4 py-2 font-semibold text-white transition hover:bg-slate-800"
              >
                Go to Signup
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const barangaySlug = profile.barangay_slug;

  const [barangayRes, ticketsRes, permitsRes, announcementsRes] = await Promise.all([
    supabase
      .from('barangays')
      .select('slug,name,address,contact_email,contact_phone,officials')
      .eq('slug', barangaySlug)
      .maybeSingle(),
    supabase
      .from('tickets')
      .select('id,title,category,status,created_at,location_name')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('permits')
      .select('reference_no,business_name,permit_type,status,created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('announcements')
      .select('id,title,body,published_at')
      .eq('barangay_slug', barangaySlug)
      .order('published_at', { ascending: false })
      .limit(5),
  ]);

  const barangay = barangayRes.data;
  const tickets = ticketsRes.data ?? [];
  const permits = permitsRes.data ?? [];
  const announcements = announcementsRes.data ?? [];
  const officials = ((barangay?.officials ?? []) as Official[]) ?? [];

  return (
    <main className="relative min-h-[calc(100vh-73px)] overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_30%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-3xl border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
                Resident Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-bold">Welcome, {profile.full_name}</h1>
              <p className="mt-1 text-sm text-slate-600">
                {barangay?.name ?? 'Your barangay'} · {profile.role}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                className="rounded-xl bg-slate-950 px-4 py-2 font-semibold text-white"
                href="/tickets/new"
              >
                Report Issue
              </Link>
              <Link
                className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-900"
                href="/permits"
              >
                Track Permits
              </Link>
              <Link
                className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 font-semibold text-blue-700"
                href={`/barangays/${barangaySlug}`}
              >
                Barangay Info
              </Link>
            </div>
          </div>
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-black/30 backdrop-blur">
            <h2 className="text-lg font-semibold">Latest Issue Tickets</h2>

            <div className="mt-4 space-y-3">
              {tickets.length === 0 ? (
                <p className="text-sm text-slate-600">No issue tickets yet.</p>
              ) : (
                tickets.map((t) => (
                  <div key={t.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{t.title}</p>
                        <p className="text-sm text-slate-600">
                          {(t.category || '').replace(/_/g, ' ')} · {t.location_name || 'No location'}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {new Date(t.created_at).toLocaleString()}
                        </p>
                      </div>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize">
                        {(t.status || '').replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-black/30 backdrop-blur">
            <h2 className="text-lg font-semibold">Permit Tracking</h2>

            <div className="mt-4 space-y-3">
              {permits.length === 0 ? (
                <p className="text-sm text-slate-600">No permit requests yet.</p>
              ) : (
                permits.map((p) => (
                  <div key={p.reference_no} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{p.business_name}</p>
                        <p className="text-sm text-slate-600">
                          {p.reference_no} · {p.permit_type}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {new Date(p.created_at).toLocaleString()}
                        </p>
                      </div>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize">
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-black/30 backdrop-blur">
          <h2 className="text-lg font-semibold">Barangay Transparency</h2>

          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div className="space-y-2 text-sm text-slate-700">
              <p>{barangay?.address || 'No barangay address added yet.'}</p>
              <p>{barangay?.contact_phone || 'No contact phone added yet.'}</p>
              <p>{barangay?.contact_email || 'No contact email added yet.'}</p>
            </div>

            <div className="space-y-3">
              {officials.length === 0 ? (
                <p className="text-sm text-slate-600">No officials listed yet.</p>
              ) : (
                officials.map((o, idx) => (
                  <div key={idx} className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-medium">{o.name}</p>
                    <p className="text-sm text-slate-600">{o.position || 'Official'}</p>
                    {o.phone && <p className="text-sm text-slate-600">{o.phone}</p>}
                    {o.email && <p className="text-sm text-slate-600">{o.email}</p>}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {announcements.length === 0 ? (
              <p className="text-sm text-slate-600">No announcements yet.</p>
            ) : (
              announcements.map((a) => (
                <div key={a.id} className="rounded-2xl bg-blue-50 p-4">
                  <p className="font-medium">{a.title}</p>
                  <p className="text-sm text-slate-700">{a.body}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(a.published_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}