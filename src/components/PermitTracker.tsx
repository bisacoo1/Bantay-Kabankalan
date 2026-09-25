'use client';

import { PERMIT_STATUS_LABELS, PERMIT_STATUS_STEPS } from '@/lib/permits';

type TrackedPermit = {
  reference_no: string;
  business_name: string;
  permit_type: string;
  status: string;
  notes: string | null;
  created_at: string;
};

type Props = {
  initialRef: string;
  permit: TrackedPermit | null;
  lookupError: boolean;
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  reviewing: 'bg-blue-100 text-blue-800 border-blue-300',
  approved: 'bg-green-100 text-green-800 border-green-300',
  released: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
};

export default function PermitTracker({ initialRef, permit, lookupError }: Props) {
  const currentStepIndex = PERMIT_STATUS_STEPS.findIndex(({ status }) => status === permit?.status);

  return (
    <div className="mt-6 space-y-6">
      <form action="/permits" method="get" className="rounded-2xl border border-white/10 bg-white/95 p-6 shadow-lg">
        <label htmlFor="permit-ref" className="mb-2 block text-sm font-semibold text-slate-700">
          Enter Reference Number
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="permit-ref"
            name="ref"
            type="text"
            defaultValue={initialRef}
            required
            maxLength={64}
            placeholder="e.g. BK-20260925-0123456789ABCDEF"
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <button
            type="submit"
            className="rounded-xl bg-blue-700 px-6 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-800 active:scale-95"
          >
            Track Permit
          </button>
        </div>
      </form>

      {initialRef && lookupError && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
          Unable to look up this permit right now. Please try again later.
        </div>
      )}

      {initialRef && !lookupError && !permit && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
          <p className="font-semibold">No permit found for: <span className="font-mono">{initialRef}</span></p>
          <p className="mt-1 text-sm">Check the reference number and make sure you are signed in to the account that submitted it.</p>
        </div>
      )}

      {permit && (
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">Permit Found</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">{permit.business_name}</h2>
              <p className="text-sm text-slate-500">Ref: <span className="font-mono font-semibold">{permit.reference_no}</span></p>
            </div>
            <span className={`inline-flex self-start rounded-full border px-3 py-1 text-sm font-semibold sm:self-auto ${STATUS_COLORS[permit.status] ?? 'border-slate-300 bg-slate-100 text-slate-700'}`}>
              {PERMIT_STATUS_LABELS[permit.status] ?? permit.status}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="mb-1 text-xs font-semibold uppercase text-slate-500">Permit Type</p>
              <p className="font-semibold text-slate-800">{permit.permit_type}</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="mb-1 text-xs font-semibold uppercase text-slate-500">Date Submitted</p>
              <p className="font-semibold text-slate-800">
                {new Date(permit.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            {permit.notes && (
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 sm:col-span-2">
                <p className="mb-1 text-xs font-semibold uppercase text-yellow-700">Staff note</p>
                <p className="text-slate-800">{permit.notes}</p>
              </div>
            )}
          </div>

          {permit.status !== 'rejected' && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase text-slate-500">Progress</p>
              <div className="flex items-center">
                {PERMIT_STATUS_STEPS.map((step, index) => (
                  <div key={step.status} className="flex flex-1 items-center last:flex-none">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold ${index <= currentStepIndex ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-400'}`}>
                        {index < currentStepIndex ? '✓' : index + 1}
                      </div>
                      <p className={`mt-1 w-16 text-center text-xs font-medium ${index <= currentStepIndex ? 'text-blue-700' : 'text-slate-400'}`}>
                        {step.label}
                      </p>
                    </div>
                    {index < PERMIT_STATUS_STEPS.length - 1 && (
                      <div className={`mx-1 mb-4 h-0.5 flex-1 ${index < currentStepIndex ? 'bg-blue-600' : 'bg-slate-200'}`} />
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
