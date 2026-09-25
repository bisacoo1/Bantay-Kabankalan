'use client';

import { useState } from 'react';
import PermitTracker from '@/components/PermitTracker';
import AddPermitForm from '@/components/AddPermitForm';

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
  trackedPermit: TrackedPermit | null;
  lookupError: boolean;
};

type Tab = 'track' | 'add';

export default function PermitPageClient({ initialRef, trackedPermit, lookupError }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('track');

  return (
    <div>
      {/* Tab Switcher */}
      <div className="mt-6 flex rounded-2xl border border-white/10 bg-white/10 p-1.5 backdrop-blur gap-1">
        <button
          onClick={() => setActiveTab('track')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-sm transition-all duration-200 ${
            activeTab === 'track'
              ? 'bg-white text-blue-700 shadow-md'
              : 'text-slate-300 hover:bg-white/10'
          }`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Track Permit
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-sm transition-all duration-200 ${
            activeTab === 'add'
              ? 'bg-white text-blue-700 shadow-md'
              : 'text-slate-300 hover:bg-white/10'
          }`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add New Permit
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'track' && (
        <div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-300 backdrop-blur">
            🔍 <span className="font-semibold text-white">Track Permit</span> — Enter your reference number below to check the status of your permit application.
          </div>
          <PermitTracker initialRef={initialRef} permit={trackedPermit} lookupError={lookupError} />
        </div>
      )}

      {activeTab === 'add' && (
        <div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-300 backdrop-blur">
            📋 <span className="font-semibold text-white">Add New Permit</span> — Fill out the form below to submit a new permit application.
          </div>
          <AddPermitForm />
        </div>
      )}
    </div>
  );
}