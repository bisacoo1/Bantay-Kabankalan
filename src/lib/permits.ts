export const PERMIT_STATUS_STEPS = [
  { status: 'pending', label: 'Submitted' },
  { status: 'reviewing', label: 'Under Review' },
  { status: 'approved', label: 'Approved' },
  { status: 'released', label: 'Released' },
] as const;

export const PERMIT_STATUS_LABELS: Record<string, string> = {
  pending: 'Submitted',
  reviewing: 'Under Review',
  approved: 'Approved',
  released: 'Released',
  rejected: 'Rejected',
};

// Keep this validation on the server: the multi-step form's fields are not
// mounted on the review step, and a client can call the action without the UI.
export function parsePermitRequest(formData: FormData) {
  const business_name = String(formData.get('business_name') ?? '').trim();
  const permit_type = String(formData.get('permit_type') ?? '').trim();
  const owner_name = String(formData.get('owner_name') ?? '').trim();
  const address = String(formData.get('address') ?? '').trim();
  const contact_number = String(formData.get('contact_number') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();

  if (!business_name || !permit_type || !owner_name || !address || !contact_number) {
    throw new Error('Please fill out all required permit details.');
  }

  return {
    business_name,
    permit_type,
    owner_name,
    address,
    contact_number,
    email: email || null,
    description: description || null,
  };
}
