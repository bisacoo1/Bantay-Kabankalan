import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PermitTracker from '@/components/PermitTracker';
import AddPermitForm from '@/components/AddPermitForm';
import PermitPageClient from './PermitPageClient';

type SearchParams = {
  ref?: string;
  created?: string;
};

type TrackedPermit = {
  reference_no: string;
  business_name: string;
  permit_type: string;
  status: string;
  notes: string | null;
  created_at: string;
};

export default async function PermitsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  const supabase = await createClient();
  const params: SearchParams = await Promise.resolve(searchParams ?? {});
  const ref = params.ref?.trim() || '';

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name,role,barangay_slug')
    .eq('id', user.id)
    .maybeSingle();

  let trackedPermit: TrackedPermit | null = null;

  if (ref) {
    const { data, error } = await supabase.rpc('track_permit_by_reference', { ref });
    if (error) console.error('Permit lookup error:', error);
    trackedPermit = (data?.[0] ?? null) as TrackedPermit | null;
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-7xl">

        {/* Page Header */}
        <div className="rounded-3xl border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
                Permits
              </p>
              <h1 className="mt-2 text-3xl font-bold">Permit Management</h1>
              <p className="mt-1 text-sm text-slate-600">
                {profile?.full_name || 'Resident'} · {profile?.role || 'citizen'}
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/dashboard"
                className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-900 transition-transform duration-200 hover:-translate-y-0.5 active:scale-95"
              >
                ← Back to Dashboard
              </a>
            </div>
          </div>
        </div>

        {/* Success Banner */}
        {params.created && (
          <div className="mt-6 rounded-3xl border border-green-200 bg-green-50 p-5 text-green-800">
            <p className="font-semibold">✅ Permit request submitted successfully.</p>
            <p className="mt-1 text-sm">
              Reference No: <span className="font-bold font-mono">{params.created}</span>
            </p>
          </div>
        )}

        {/* Tab UI (Client Component) */}
        <PermitPageClient initialRef={ref} trackedPermit={trackedPermit} />

      </div>
    </main>
  );
}