'use server';

import { randomBytes } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { parsePermitRequest } from '@/lib/permits';

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function getProfileOrThrow(supabase: ServerSupabaseClient, userId: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id,full_name,role,barangay_slug')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!profile) throw new Error('Profile not found');

  return profile;
}

export async function createTicket(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const profile = await getProfileOrThrow(supabase, user.id);

  const title = String(formData.get('title') || '').trim();
  const category = String(formData.get('category') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const locationName = String(formData.get('location_name') || '').trim();
  const latitudeRaw = String(formData.get('latitude') || '').trim();
  const longitudeRaw = String(formData.get('longitude') || '').trim();
  const image = formData.get('image');

  if (!title || !category || !description) {
    throw new Error('Please fill out the required fields.');
  }

  let imageUrl: string | null = null;

  if (image instanceof File && image.size > 0) {
    const ext = image.name.split('.').pop() || 'jpg';
    const path = `tickets/${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('ticket-images')
      .upload(path, image, { upsert: true });

    if (uploadError) throw uploadError;

    imageUrl = supabase.storage.from('ticket-images').getPublicUrl(path).data.publicUrl;
  }

  const latitude = latitudeRaw ? Number(latitudeRaw) : null;
  const longitude = longitudeRaw ? Number(longitudeRaw) : null;

  const { error } = await supabase.from('tickets').insert({
    created_by: user.id,
    barangay_slug: profile.barangay_slug,
    category,
    title,
    description,
    location_name: locationName || null,
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
    image_url: imageUrl,
  });

  if (error) throw error;

  revalidatePath('/dashboard');
  revalidatePath('/tickets/new');
  redirect('/dashboard?ticket=created');
}

export async function createPermitRequest(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const profile = await getProfileOrThrow(supabase, user.id);

  if (!profile.barangay_slug) throw new Error('Please select a barangay before applying.');

  const application = parsePermitRequest(formData);
  const ref =
    `BK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-` +
    randomBytes(8).toString('hex').toUpperCase();

  const { error } = await supabase.from('permits').insert({
    ...application,
    reference_no: ref,
    requester_id: user.id,
    barangay_slug: profile.barangay_slug,
  });

  if (error) throw error;

  revalidatePath('/permits');
  revalidatePath('/dashboard');
  revalidatePath('/staff');
  return ref;
}

export async function updateTicketStatus(ticketId: string, status: string, note?: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const profile = await getProfileOrThrow(supabase, user.id);
  if (!['officer', 'admin'].includes(profile.role)) throw new Error('Forbidden');

  const { data: ticket } = await supabase.from('tickets').select('barangay_slug').eq('id', ticketId).maybeSingle();
  if (!ticket) throw new Error('Ticket not found');
  if (profile.role !== 'admin' && profile.barangay_slug !== ticket.barangay_slug) throw new Error('Forbidden');

  await supabase.from('tickets').update({ status }).eq('id', ticketId);
  await supabase.from('ticket_updates').insert({
    ticket_id: ticketId,
    updated_by: user.id,
    status,
    note: note || null,
  });

  revalidatePath('/dashboard');
}

export async function updatePermitStatus(permitId: string, status: string, note?: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const profile = await getProfileOrThrow(supabase, user.id);
  if (!['officer', 'admin'].includes(profile.role)) throw new Error('Forbidden');

  const { data: permit } = await supabase.from('permits').select('barangay_slug').eq('id', permitId).maybeSingle();
  if (!permit) throw new Error('Permit not found');
  if (profile.role !== 'admin' && profile.barangay_slug !== permit.barangay_slug) throw new Error('Forbidden');

  await supabase.from('permits').update({ status, notes: note || null }).eq('id', permitId);
  revalidatePath('/permits');
}

export async function updateBarangayInfo(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const profile = await getProfileOrThrow(supabase, user.id);
  if (!['officer', 'admin'].includes(profile.role)) throw new Error('Forbidden');

  const barangaySlug = String(formData.get('barangay_slug') || '').trim();
  const address = String(formData.get('address') || '').trim();
  const contactPhone = String(formData.get('contact_phone') || '').trim();
  const contactEmail = String(formData.get('contact_email') || '').trim();
  const officialsRaw = String(formData.get('officials_json') || '').trim();

  if (!barangaySlug) throw new Error('Barangay is required');

  if (profile.role !== 'admin' && profile.barangay_slug !== barangaySlug) {
    throw new Error('Forbidden');
  }

  let officials: unknown[] = [];

  if (officialsRaw) {
    try {
      const parsed = JSON.parse(officialsRaw);
      if (!Array.isArray(parsed)) throw new Error('Officials must be an array');
      officials = parsed;
    } catch {
      throw new Error('Officials must be valid JSON');
    }
  }

  const { error } = await supabase
    .from('barangays')
    .update({
      address: address || null,
      contact_phone: contactPhone || null,
      contact_email: contactEmail || null,
      officials,
    })
    .eq('slug', barangaySlug);

  if (error) throw error;

  revalidatePath('/dashboard');
  revalidatePath('/staff');
  revalidatePath(`/barangays/${barangaySlug}`);
}

export async function staffUpdateTicketStatus(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const profile = await getProfileOrThrow(supabase, user.id);
  if (!['officer', 'admin'].includes(profile.role)) throw new Error('Forbidden');

  const ticketId = String(formData.get('ticket_id') || '').trim();
  const status = String(formData.get('status') || '').trim();
  const note = String(formData.get('note') || '').trim();

  if (!ticketId || !status) throw new Error('Missing ticket or status');

  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select('id,barangay_slug')
    .eq('id', ticketId)
    .maybeSingle();

  if (ticketError) throw ticketError;
  if (!ticket) throw new Error('Ticket not found');

  if (profile.role !== 'admin' && profile.barangay_slug !== ticket.barangay_slug) {
    throw new Error('Forbidden');
  }

  const { error: updateError } = await supabase
    .from('tickets')
    .update({ status })
    .eq('id', ticketId);

  if (updateError) throw updateError;

  const { error: logError } = await supabase.from('ticket_updates').insert({
    ticket_id: ticketId,
    updated_by: user.id,
    status,
    note: note || null,
  });

  if (logError) throw logError;

  revalidatePath('/dashboard');
  revalidatePath('/staff');
  revalidatePath('/tickets');
}

export async function staffUpdatePermitStatus(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const profile = await getProfileOrThrow(supabase, user.id);
  if (!['officer', 'admin'].includes(profile.role)) throw new Error('Forbidden');

  const permitId = String(formData.get('permit_id') || '').trim();
  const status = String(formData.get('status') || '').trim();
  const note = String(formData.get('note') || '').trim();

  if (!permitId || !status) throw new Error('Missing permit or status');

  const { data: permit, error: permitError } = await supabase
    .from('permits')
    .select('id,barangay_slug')
    .eq('id', permitId)
    .maybeSingle();

  if (permitError) throw permitError;
  if (!permit) throw new Error('Permit not found');

  if (profile.role !== 'admin' && profile.barangay_slug !== permit.barangay_slug) {
    throw new Error('Forbidden');
  }

  const { error: updateError } = await supabase
    .from('permits')
    .update({
      status,
      notes: note || null,
    })
    .eq('id', permitId);

  if (updateError) throw updateError;

  revalidatePath('/dashboard');
  revalidatePath('/staff');
  revalidatePath('/permits');
}