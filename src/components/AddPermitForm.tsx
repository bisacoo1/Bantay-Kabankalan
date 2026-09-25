'use client';

import { useState } from 'react';

type FormData = {
  business_name: string;
  owner_name: string;
  permit_type: string;
  address: string;
  contact_number: string;
  email: string;
  description: string;
};

const INITIAL_FORM: FormData = {
  business_name: '',
  owner_name: '',
  permit_type: '',
  address: '',
  contact_number: '',
  email: '',
  description: '',
};

export default function AddPermitForm() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitted, setSubmitted] = useState(false);
  const [generatedRef, setGeneratedRef] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNext = () => {
    if (step < 3) setStep((s) => (s + 1) as 1 | 2 | 3);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Replace this with your actual Supabase insert logic
    // const supabase = createClient();
    // const { data, error } = await supabase.from('permits').insert({ ...form });

    setTimeout(() => {
      const ref = `BK-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
      setGeneratedRef(ref);
      setSubmitted(true);
      setLoading(false);
    }, 1200);
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setStep(1);
    setSubmitted(false);
    setGeneratedRef('');
  };

  if (submitted) {
    return (
      <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-8 text-center shadow-md">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
          ✅
        </div>
        <h2 className="text-2xl font-bold text-green-800">Permit Request Submitted!</h2>
        <p className="mt-2 text-green-700">Your permit application has been received.</p>
        <div className="mt-4 inline-block rounded-xl bg-white border border-green-300 px-6 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase text-green-600 tracking-wider">
            Reference Number
          </p>
          <p className="mt-1 text-2xl font-bold font-mono text-green-900">{generatedRef}</p>
        </div>
        <p className="mt-4 text-sm text-green-700">
          Please save your reference number to track your permit status.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={handleReset}
            className="rounded-xl border border-green-400 bg-white px-5 py-2.5 font-semibold text-green-800 hover:bg-green-50 transition"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-5">

      {/* Step Indicator */}
      <div className="flex items-center rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
        {[
          { num: 1, label: 'Permit Type' },
          { num: 2, label: 'Your Details' },
          { num: 3, label: 'Review' },
        ].map(({ num, label }, idx) => (
          <div key={num} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  step === num
                    ? 'bg-blue-600 border-blue-600 text-white scale-110'
                    : step > num
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {step > num ? '✓' : num}
              </div>
              <p
                className={`mt-1 text-xs font-medium ${
                  step >= num ? 'text-blue-700' : 'text-slate-400'
                }`}
              >
                {label}
              </p>
            </div>
            {idx < 2 && (
              <div
                className={`flex-1 h-0.5 mb-4 mx-2 ${
                  step > num ? 'bg-green-400' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>

        {/* STEP 1: Permit Type Textbox */}
        {step === 1 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-800">What permit do you need?</h2>
              <p className="text-sm text-slate-500">
                Type the kind of permit you are applying for.
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Permit Type <span className="text-red-500">*</span>
              </label>
              <input
                name="permit_type"
                value={form.permit_type}
                onChange={handleChange}
                required
                placeholder="e.g. Business Permit, Building Permit, Sanitary Permit..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
              />
              <p className="mt-2 text-xs text-slate-400">
                💡 Examples: Business Permit · Building Permit · Sanitary Permit · Electrical Permit · Zoning Clearance · Certificate of Occupancy
              </p>
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleNext}
                disabled={!form.permit_type.trim()}
                className="rounded-xl bg-blue-700 px-6 py-2.5 font-semibold text-white hover:bg-blue-800 transition hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Fill in Details */}
        {step === 2 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Enter Your Details</h2>
              <p className="text-sm text-slate-500">
                Applying for:{' '}
                <span className="font-semibold text-blue-700">📋 {form.permit_type}</span>
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Business / Establishment Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="business_name"
                  value={form.business_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Juan's Bakery"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Owner / Applicant Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="owner_name"
                  value={form.owner_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Juan Dela Cruz"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  placeholder="Barangay, Kabankalan City, Negros Occidental"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  name="contact_number"
                  value={form.contact_number}
                  onChange={handleChange}
                  required
                  placeholder="09XX XXX XXXX"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="juan@email.com"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Additional Description / Notes
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Provide any additional information relevant to your application..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none text-sm"
                />
              </div>
            </div>
            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="rounded-xl border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 transition text-sm"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={
                  !form.business_name || !form.owner_name || !form.address || !form.contact_number
                }
                className="rounded-xl bg-blue-700 px-6 py-2.5 font-semibold text-white hover:bg-blue-800 transition hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Review →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Review & Submit */}
        {step === 3 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Review Your Application</h2>
              <p className="text-sm text-slate-500">Please confirm your details before submitting.</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 divide-y divide-slate-200 overflow-hidden">
              {[
                { label: 'Permit Type', value: `📋 ${form.permit_type}` },
                { label: 'Business Name', value: form.business_name },
                { label: 'Owner / Applicant', value: form.owner_name },
                { label: 'Address', value: form.address },
                { label: 'Contact Number', value: form.contact_number },
                { label: 'Email', value: form.email || '—' },
                { label: 'Notes', value: form.description || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-4 px-4 py-3 text-sm">
                  <span className="w-40 shrink-0 font-semibold text-slate-500">{label}</span>
                  <span className="text-slate-800">{value}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
              ℹ️ By submitting, you confirm that all information provided is accurate and true.
            </div>
            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="rounded-xl border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 transition text-sm"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-green-600 px-6 py-2.5 font-semibold text-white hover:bg-green-700 transition hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 text-sm"
              >
                {loading ? 'Submitting...' : '✅ Submit Application'}
              </button>
            </div>
          </div>
        )}

      </form>
    </div>
  );
}