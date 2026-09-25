import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  staffUpdateTicketStatus,
  staffUpdatePermitStatus,
  updateBarangayInfo,
} from '@/app/actions';

type SearchParams = {
  barangay?: string;
};

type Barangay = {
  slug: string;
  name: string;
  address: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  officials: unknown;
};

export default async function StaffPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  const supabase = await createClient();
  const params: SearchParams = await Promise.resolve(searchParams ?? {});

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name,role,barangay_slug')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || !['officer', 'admin'].includes(profile.role)) {
    redirect('/dashboard');
  }

  const { data: barangays } = await supabase
    .from('barangays')
    .select('slug,name,address,contact_phone,contact_email,officials')
    .order('name', { ascending: true });

  const selectedSlug =
    profile.role === 'admin'
      ? params.barangay || profile.barangay_slug || barangays?.[0]?.slug || ''
      : profile.barangay_slug || '';

  if (!selectedSlug) redirect('/dashboard');

  const [selectedBarangayRes, ticketsRes, permitsRes] = await Promise.all([
    supabase
      .from('barangays')
      .select('slug,name,address,contact_phone,contact_email,officials')
      .eq('slug', selectedSlug)
      .maybeSingle(),
    supabase
      .from('tickets')
      .select('id,title,description,category,status,created_at,location_name')
      .eq('barangay_slug', selectedSlug)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('permits')
      .select('id,reference_no,business_name,permit_type,status,notes,created_at')
      .eq('barangay_slug', selectedSlug)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const selectedBarangay = selectedBarangayRes.data as Barangay | null;
  const tickets = ticketsRes.data ?? [];
  const permits = permitsRes.data ?? [];

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
                Admin / Officer Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-bold">
                Welcome, {profile.full_name}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {profile.role} · {selectedBarangay?.name || selectedSlug}
              </p>
            </div>

            <div className="flex gap-3">
              <Link href="/tickets" className="rounded-xl border border-slate-300 px-4 py-2 font-semibold">
                Ticket List
              </Link>
              <Link href="/dashboard" className="rounded-xl bg-slate-950 px-4 py-2 font-semibold text-white">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {profile.role === 'admin' && (
          <form method="get" className="mt-6 rounded-3xl border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-black/30 backdrop-blur">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Select barangay to manage
            </label>
            <div className="flex flex-col gap-3 md:flex-row">
              <select
                name="barangay"
                defaultValue={selectedSlug}
                className="w-full rounded-xl border border-slate-300 bg-white p-3"
              >
                {(barangays ?? []).map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.name}
                  </option>
                ))}
              </select>
              <button className="rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white">
                Load barangay
              </button>
            </div>
          </form>
        )}

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-black/30 backdrop-blur">
            <h2 className="text-lg font-semibold">Edit Barangay Info</h2>
            <p className="mt-1 text-sm text-slate-600">
              Update address, contact details, and officials JSON.
            </p>

            <form action={updateBarangayInfo} className="mt-5 space-y-4">
              <input type="hidden" name="barangay_slug" value={selectedSlug} />

              <div>
                <label className="mb-1 block text-sm font-medium">Address</label>
                <input
                  name="address"
                  defaultValue={selectedBarangay?.address || ''}
                  className="w-full rounded-xl border border-slate-300 p-3"
                  placeholder="Barangay address"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Contact phone</label>
                <input
                  name="contact_phone"
                  defaultValue={selectedBarangay?.contact_phone || ''}
                  className="w-full rounded-xl border border-slate-300 p-3"
                  placeholder="Phone number"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Contact email</label>
                <input
                  name="contact_email"
                  defaultValue={selectedBarangay?.contact_email || ''}
                  className="w-full rounded-xl border border-slate-300 p-3"
                  placeholder="Email address"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Officials JSON</label>
                <textarea
                  name="officials_json"
                  defaultValue={JSON.stringify(selectedBarangay?.officials ?? [], null, 2)}
                  rows={10}
                  className="w-full rounded-xl border border-slate-300 p-3 font-mono text-sm"
                  placeholder='[{"name":"...","position":"...","phone":"...","email":"..."}]'
                />
              </div>

              <button className="rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white">
                Save barangay info
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-black/30 backdrop-blur">
            <h2 className="text-lg font-semibold">Latest Permit Requests</h2>
            <p className="mt-1 text-sm text-slate-600">
              Update the permit status directly from here.
            </p>

            <div className="mt-5 space-y-4">
              {permits.length === 0 ? (
                <p className="text-sm text-slate-600">No permits found.</p>
              ) : (
                permits.map((permit) => (
                  <form
                    key={permit.id}
                    action={staffUpdatePermitStatus}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <input type="hidden" name="permit_id" value={permit.id} />
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{permit.business_name}</p>
                        <p className="text-sm text-slate-600">
                          {permit.reference_no} · {permit.permit_type}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {new Date(permit.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize">
                        {permit.status}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <select
                        name="status"
                        defaultValue={permit.status}
                        className="rounded-xl border border-slate-300 p-3"
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="approved">Approved</option>
                        <option value="released">Released</option>
                        <option value="rejected">Rejected</option>
                      </select>

                      <button className="rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white">
                        Update permit
                      </button>
                    </div>

                    <textarea
                      name="note"
                      rows={3}
                      className="mt-3 w-full rounded-xl border border-slate-300 p-3"
                      placeholder="Optional note"
                      defaultValue={permit.notes || ''}
                    />
                  </form>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-black/30 backdrop-blur">
          <h2 className="text-lg font-semibold">Latest Issue Tickets</h2>
          <p className="mt-1 text-sm text-slate-600">
            Update ticket status from this panel.
          </p>

          <div className="mt-5 space-y-4">
            {tickets.length === 0 ? (
              <p className="text-sm text-slate-600">No tickets found.</p>
            ) : (
              tickets.map((ticket) => (
                <form
                  key={ticket.id}
                  action={staffUpdateTicketStatus}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <input type="hidden" name="ticket_id" value={ticket.id} />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{ticket.title}</p>
                      <p className="text-sm text-slate-600">
                        {(ticket.category || '').replace(/_/g, ' ')} · {ticket.location_name || 'No location'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(ticket.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize">
                      {ticket.status}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-slate-600">{ticket.description}</p>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <select
                      name="status"
                      defaultValue={ticket.status}
                      className="rounded-xl border border-slate-300 p-3"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>

                    <button className="rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white">
                      Update ticket
                    </button>
                  </div>

                  <textarea
                    name="note"
                    rows={3}
                    className="mt-3 w-full rounded-xl border border-slate-300 p-3"
                    placeholder="Optional note"
                  />
                </form>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}