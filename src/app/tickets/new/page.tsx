import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createTicket } from '@/app/actions';

export default async function NewTicketPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name,barangay_slug')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.barangay_slug) redirect('/signup');

  const { data: barangay } = await supabase
    .from('barangays')
    .select('name')
    .eq('slug', profile.barangay_slug)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold">Report an Issue</h1>
      <p className="mt-2 text-slate-600">
        Send a complaint or report a problem in your barangay. You can attach a photo and location details.
      </p>

      <form action={createTicket} className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium">Issue title</label>
          <input
            name="title"
            className="w-full rounded-lg border border-slate-300 p-3"
            placeholder="Busted streetlight near the basketball court"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Category</label>
          <select name="category" className="w-full rounded-lg border border-slate-300 p-3" defaultValue="" required>
            <option value="" disabled>
              Select category
            </option>
            <option value="busted_streetlight">Busted streetlight</option>
            <option value="garbage">Uncollected garbage / illegal dumping</option>
            <option value="pothole">Pothole</option>
            <option value="drainage">Drainage clogging</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            name="description"
            rows={5}
            className="w-full rounded-lg border border-slate-300 p-3"
            placeholder="Describe what happened and when you noticed it."
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Location name</label>
          <input
            name="location_name"
            className="w-full rounded-lg border border-slate-300 p-3"
            placeholder="Street / landmark / sitio"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Latitude</label>
            <input name="latitude" className="w-full rounded-lg border border-slate-300 p-3" placeholder="Optional" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Longitude</label>
            <input name="longitude" className="w-full rounded-lg border border-slate-300 p-3" placeholder="Optional" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Photo</label>
          <input name="image" type="file" accept="image/*" className="w-full rounded-lg border border-slate-300 p-3" />
        </div>

        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          Submitting to: <span className="font-medium text-slate-900">{barangay?.name || 'Your barangay'}</span>
        </div>

        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-3 font-medium text-white">
          Submit ticket
        </button>
      </form>
    </main>
  );
}