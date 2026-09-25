'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

function RegisteredNotice() {
  const registered = useSearchParams().has('registered');
  if (!registered) return null;

  return (
    <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
      Account created successfully. Please sign in.
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await createClient().auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.replace('/dashboard');
    router.refresh();
  }

  return (
    <main className="relative min-h-[calc(100vh-73px)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.14),transparent_28%)]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl items-center px-6 py-12">
        <div className="grid w-full gap-10 lg:grid-cols-2 lg:items-center">
          <div className="max-w-xl">
            <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-1 text-sm text-slate-200 backdrop-blur">
              Sign in to your account
            </span>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white md:text-6xl">
              Welcome back
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-300">
              Continue reporting issues, checking permits, and viewing barangay updates.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Fast reporting</p>
                <p className="mt-1 text-sm text-slate-300">Submit tickets with photos and location.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Transparency</p>
                <p className="mt-1 text-sm text-slate-300">View barangay officials and announcements.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Tracking</p>
                <p className="mt-1 text-sm text-slate-300">Monitor permits and clearances online.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/95 p-6 shadow-2xl shadow-black/30 backdrop-blur">
            <h2 className="text-2xl font-bold text-slate-900">Login</h2>
            <p className="mt-2 text-sm text-slate-600">Use your email and password to continue.</p>

            <Suspense fallback={null}>
              <RegisteredNotice />
            </Suspense>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-800">Email</label>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  type="email"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-800">Password</label>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                  required
                />
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
                {loading ? 'Signing in...' : 'Sign in'}
              </button>

              <p className="text-sm text-slate-600">
                No account yet?{' '}
                <Link href="/signup" className="font-semibold text-blue-700 hover:underline">
                  Create one
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}