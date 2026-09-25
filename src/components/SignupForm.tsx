'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Barangay = {
  slug: string;
  name: string;
};

export default function SignupForm({ barangays }: { barangays: Barangay[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const fullName = String(form.get('full_name') || '').trim();
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '').trim();
    const barangaySlug = String(form.get('barangay_slug') || '').trim();

    if (!fullName || !email || !password || !barangaySlug) {
      setError('Please fill out all fields.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          barangay_slug: barangaySlug,
          role: 'citizen',
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/login?registered=1');
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-800">Full name</label>
        <input
          name="full_name"
          className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-blue-500"
          placeholder="Juan Dela Cruz"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-800">Email</label>
        <input
          name="email"
          type="email"
          className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500"
          placeholder="juan@email.com"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-800">Password</label>
        <input
          name="password"
          type="password"
          className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500"
          placeholder="••••••••"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-800">Barangay</label>
        <select
          name="barangay_slug"
          className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 outline-none focus:border-blue-500"
          defaultValue=""
          required
        >
          <option value="" disabled>
            Select your barangay
          </option>
          {barangays.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
      >
        {loading ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  );
}