import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type Official = {
  name: string;
  position?: string;
  phone?: string;
  email?: string;
};

export default async function BarangayPage({
  params,
}: {
  params?: { slug: string };
}) {
  const supabase = await createClient();
  const slug = params?.slug ?? '';

  const { data: barangay } = await supabase
    .from('barangays')
    .select('slug,name,address,contact_email,contact_phone,officials')
    .eq('slug', slug)
    .maybeSingle();

  if (!barangay) notFound();

  const { data: announcements } = await supabase
    .from('announcements')
    .select('title,body,published_at')
    .eq('barangay_slug', slug)
    .order('published_at', { ascending: false });

  const officials = ((barangay.officials ?? []) as Official[]) ?? [];

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-bold">{barangay.name}</h1>
      <p className="mt-2 text-slate-600">{barangay.address}</p>
      <p className="text-slate-600">{barangay.contact_phone || 'No contact phone yet.'}</p>
      <p className="text-slate-600">{barangay.contact_email || 'No contact email yet.'}</p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Barangay Officials</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {officials.length === 0 ? (
            <p className="text-sm text-slate-600">No officials listed yet.</p>
          ) : (
            officials.map((o, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="font-medium">{o.name}</p>
                <p className="text-sm text-slate-600">{o.position || 'Official'}</p>
                {o.phone && <p className="text-sm text-slate-600">{o.phone}</p>}
                {o.email && <p className="text-sm text-slate-600">{o.email}</p>}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Projects & Announcements</h2>
        <div className="mt-4 space-y-3">
          {(announcements ?? []).length === 0 ? (
            <p className="text-sm text-slate-600">No announcements yet.</p>
          ) : (
            announcements!.map((a) => (
              <div key={`${a.title}-${a.published_at}`} className="rounded-2xl bg-blue-50 p-4">
                <p className="font-medium">{a.title}</p>
                <p className="text-sm text-slate-700">{a.body}</p>
                <p className="mt-1 text-xs text-slate-500">{new Date(a.published_at).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}