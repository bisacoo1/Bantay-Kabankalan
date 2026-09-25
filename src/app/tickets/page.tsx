import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function TicketsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name,role,barangay_slug')
    .eq('id', user.id)
    .maybeSingle();

  const { data: tickets } = await supabase
    .from('tickets')
    .select('id,title,description,category,status,location_name,image_url,created_at,barangay_slug')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
                Issue Tickets
              </p>
              <h1 className="mt-2 text-3xl font-bold">Your Tickets</h1>
              <p className="mt-1 text-sm text-slate-600">
                {profile?.full_name || 'Resident'} · {profile?.role || 'citizen'}
              </p>
            </div>

            <div className="flex gap-3">
              <Link href="/tickets/new" className="rounded-xl bg-slate-950 px-4 py-2 font-semibold text-white">
                Report New Issue
              </Link>
              <Link href="/dashboard" className="rounded-xl border border-slate-300 px-4 py-2 font-semibold">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {tickets?.length ? (
            tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-3xl border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-black/30 backdrop-blur"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{ticket.title}</h2>
                    <p className="mt-1 text-sm text-slate-600">
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

                <p className="mt-4 text-sm leading-6 text-slate-700">
                  {ticket.description}
                </p>

                {ticket.image_url && (
                  <a
                    href={ticket.image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-block text-sm font-semibold text-blue-700 hover:underline"
                  >
                    View uploaded photo
                  </a>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-black/30 backdrop-blur">
              <p className="text-sm text-slate-600">No tickets found yet.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}