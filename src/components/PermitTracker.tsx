'use client';

import { useState } from 'react';

type TrackedPermit = {
  reference_no: string;
  business_name: string;
  permit_type: string;
  status: string;
  notes: string | null;
  created_at: string;
};

type Props = {
  initialRef?: string;
  permit?: TrackedPermit | null;
};

const STATUS_STEPS = ['Submitted', 'Under Review', 'Approved', 'Released'];

const STATUS_COLORS: Record<string, string> = {
  Submitted: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Under Review': 'bg-blue-100 text-blue-800 border-blue-300',
  Approved: 'bg-green-100 text-green-800 border-green-300',
  Released: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Rejected: 'bg-red-100 text-red-800 border-red-300',
};

export default function PermitTracker({ initialRef = '', permit }: Props) {
  const [ref, setRef] = useState(initialRef);
  const [trackedPermit, setTrackedPermit] = useState<TrackedPermit | null>(permit ?? null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [searched, setSearched] = useState(!!initialRef);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ref.trim()) return;
    setLoading(true);
    setNotFound(false);

    const res = await fetch(`/api/permits/track?ref=${encodeURIComponent(ref.trim())}`);
    const data = await res.json();

    setTrackedPermit(data?.permit ?? null);
    setNotFound(!data?.permit);
    setSearched(true);
    setLoading(false);
  };

  const currentStepIndex = trackedPermit ? STATUS_STEPS.indexOf(trackedPermit.status) : -1;

  return (
    <div className="mt-6 space-y-6">
      <form onSubmit={handleSearch} className="rounded-2xl border border-white/10 bg-white/95 p-6 shadow-lg">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Enter Reference Number</label>
        <div className="flex gap-3 flex-col sm:flex-row">
          <input
            type="text"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="e.g. BK-2024-001"
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-blue-700 px-6 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-800 active:scale-95 disabled:opacity-60"
          >
            {loading ? 'Searching...' : 'Track Permit'}
          </button>
        </div>
      </form>

      {searched && notFound && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
          <p className="font-semibold">❌ No permit found for: <span className="font-mono">{ref}</span></p>
          <p className="mt-1 text-sm">Please double-check the reference number and try again.</p>
        </div>
      )}

      {trackedPermit && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">Permit Found</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">{trackedPermit.business_name}</h2>
              <p className="text-sm text-slate-500">Ref: <span className="font-mono font-semibold">{trackedPermit.reference_no}</span></p>
            </div>
            <span className={`self-start sm:self-auto inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${STATUS_COLORS[trackedPermit.status] ?? 'bg-slate-100 text-slate-700 border-slate-300'}`}>
              {trackedPermit.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Permit Type</p>
              <p className="font-semibold text-slate-800">{trackedPermit.permit_type}</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Date Submitted</p>
              <p className="font-semibold text-slate-800">
                {new Date(trackedPermit.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            {trackedPermit.notes && (
              <div className="rounded-xl bg-yellow-50 border border-yellow-200 px-4 py-3 sm:col-span-2">
                <p className="text-xs font-semibold uppercase text-yellow-700 mb-1">Notes</p>
                <p className="text-slate-800">{trackedPermit.notes}</p>
              </div>
            )}
          </div>

          {trackedPermit.status !== 'Rejected' && (
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 mb-3">Progress</p>
              <div className="flex items-center">
                {STATUS_STEPS.map((step, index) => (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${index <= currentStepIndex ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-400'}`}>
                        {index < currentStepIndex ? '✓' : index + 1}
                      </div>
                      <p className={`mt-1 text-xs text-center w-16 font-medium ${index <= currentStepIndex ? 'text-blue-700' : 'text-slate-400'}`}>{step}</p>
                    </div>
                    {index < STATUS_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mb-4 mx-1 ${index < currentStepIndex ? 'bg-blue-600' : 'bg-slate-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}