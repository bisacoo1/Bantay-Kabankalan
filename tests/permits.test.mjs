import assert from 'node:assert/strict';
import test from 'node:test';
import { parsePermitRequest, PERMIT_STATUS_LABELS, PERMIT_STATUS_STEPS } from '../src/lib/permits.ts';

const fields = {
  business_name: '  Juan’s Bakery  ',
  permit_type: '  Business Permit  ',
  owner_name: '  Juan Dela Cruz  ',
  address: '  Bantayan, Kabankalan  ',
  contact_number: '  09123456789  ',
  email: '  juan@example.com  ',
  description: '  New application  ',
};

function applicationForm(values = fields) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) formData.set(key, value);
  return formData;
}

test('all reviewed permit details are validated and saved, not just the business name', () => {
  assert.deepEqual(parsePermitRequest(applicationForm()), {
    business_name: 'Juan’s Bakery',
    permit_type: 'Business Permit',
    owner_name: 'Juan Dela Cruz',
    address: 'Bantayan, Kabankalan',
    contact_number: '09123456789',
    email: 'juan@example.com',
    description: 'New application',
  });
});

test('optional permit details are nullable', () => {
  const form = applicationForm();
  form.delete('email');
  form.delete('description');
  const application = parsePermitRequest(form);
  assert.equal(application.email, null);
  assert.equal(application.description, null);
});

test('every required field must be present and nonblank', () => {
  for (const key of ['business_name', 'permit_type', 'owner_name', 'address', 'contact_number']) {
    const form = applicationForm();
    form.set(key, '   ');
    assert.throws(() => parsePermitRequest(form), /required permit details/, key);
  }
});

test('the progress indicator uses the database permit statuses', () => {
  assert.deepEqual(PERMIT_STATUS_STEPS.map((step) => step.status), [
    'pending', 'reviewing', 'approved', 'released',
  ]);
  for (const step of PERMIT_STATUS_STEPS) {
    assert.equal(PERMIT_STATUS_LABELS[step.status], step.label);
  }
  assert.equal(PERMIT_STATUS_LABELS.rejected, 'Rejected');
});
