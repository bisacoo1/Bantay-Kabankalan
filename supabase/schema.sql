create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('citizen', 'officer', 'admin');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'ticket_status') then
    create type public.ticket_status as enum ('pending', 'in_progress', 'resolved');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'ticket_category') then
    create type public.ticket_category as enum ('busted_streetlight', 'garbage', 'pothole', 'drainage', 'other');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'permit_status') then
    create type public.permit_status as enum ('pending', 'reviewing', 'approved', 'released', 'rejected');
  end if;
end $$;

create table if not exists public.barangays (
  slug text primary key,
  name text not null,
  contact_email text,
  contact_phone text,
  address text,
  officials jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'citizen',
  barangay_slug text references public.barangays(slug),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  barangay_slug text not null references public.barangays(slug),
  category public.ticket_category not null,
  title text not null,
  description text not null,
  location_name text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  image_url text,
  status public.ticket_status not null default 'pending',
  assigned_to uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ticket_updates (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  updated_by uuid not null references public.profiles(id),
  status public.ticket_status not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.permits (
  id uuid primary key default gen_random_uuid(),
  reference_no text unique not null,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  barangay_slug text not null references public.barangays(slug),
  business_name text not null,
  permit_type text not null,
  status public.permit_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  barangay_slug text not null references public.barangays(slug),
  title text not null,
  body text not null,
  posted_by uuid references public.profiles(id),
  published_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, role, barangay_slug)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'citizen'),
    new.raw_user_meta_data->>'barangay_slug'
  );
  return new;
end;
$$;

create or replace function public.is_staff(target_slug text)
returns boolean language sql stable as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (p.role = 'officer' and p.barangay_slug = target_slug)
      )
  );
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop trigger if exists tickets_set_updated_at on public.tickets;
create trigger tickets_set_updated_at
before update on public.tickets
for each row execute function public.set_updated_at();

drop trigger if exists permits_set_updated_at on public.permits;
create trigger permits_set_updated_at
before update on public.permits
for each row execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.barangays enable row level security;
alter table public.profiles enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_updates enable row level security;
alter table public.permits enable row level security;
alter table public.announcements enable row level security;

drop policy if exists "public read barangays" on public.barangays;
create policy "public read barangays" on public.barangays
for select using (true);

drop policy if exists "public read announcements" on public.announcements;
create policy "public read announcements" on public.announcements
for select using (true);

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
for select using (
  auth.uid() = id
  or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  )
);

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
for update using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "read own tickets or staff tickets" on public.tickets;
create policy "read own tickets or staff tickets" on public.tickets
for select using (
  auth.uid() = created_by
  or public.is_staff(barangay_slug)
);

drop policy if exists "create own tickets" on public.tickets;
create policy "create own tickets" on public.tickets
for insert with check (auth.uid() = created_by);

drop policy if exists "staff update tickets" on public.tickets;
create policy "staff update tickets" on public.tickets
for update using (public.is_staff(barangay_slug))
with check (public.is_staff(barangay_slug));

drop policy if exists "read ticket updates if owner or staff" on public.ticket_updates;
create policy "read ticket updates if owner or staff" on public.ticket_updates
for select using (
  exists (
    select 1 from public.tickets t where t.id = ticket_id and t.created_by = auth.uid()
  )
  or exists (
    select 1 from public.tickets t where t.id = ticket_id and public.is_staff(t.barangay_slug)
  )
);

drop policy if exists "staff create ticket updates" on public.ticket_updates;
create policy "staff create ticket updates" on public.ticket_updates
for insert with check (
  exists (
    select 1 from public.tickets t where t.id = ticket_id and public.is_staff(t.barangay_slug)
  )
);

drop policy if exists "read own permits or staff permits" on public.permits;
create policy "read own permits or staff permits" on public.permits
for select using (
  auth.uid() = requester_id
  or public.is_staff(barangay_slug)
);

drop policy if exists "create own permits" on public.permits;
create policy "create own permits" on public.permits
for insert with check (auth.uid() = requester_id);

drop policy if exists "staff update permits" on public.permits;
create policy "staff update permits" on public.permits
for update using (public.is_staff(barangay_slug))
with check (public.is_staff(barangay_slug));

insert into storage.buckets (id, name, public)
values ('ticket-images', 'ticket-images', true)
on conflict (id) do nothing;

drop policy if exists "public read ticket images" on storage.objects;
create policy "public read ticket images"
on storage.objects for select
using (bucket_id = 'ticket-images');

drop policy if exists "authenticated upload ticket images" on storage.objects;
create policy "authenticated upload ticket images"
on storage.objects for insert
with check (bucket_id = 'ticket-images' and auth.role() = 'authenticated');

insert into public.barangays (slug, name, contact_email, contact_phone, address, officials)
values
('bantayan', 'Bantayan', null, null, null, '[]'::jsonb),
('barangay-1', 'Barangay 1', null, null, null, '[]'::jsonb),
('barangay-2', 'Barangay 2', null, null, null, '[]'::jsonb),
('barangay-3', 'Barangay 3', null, null, null, '[]'::jsonb),
('barangay-4', 'Barangay 4', null, null, null, '[]'::jsonb),
('barangay-5', 'Barangay 5', null, null, null, '[]'::jsonb),
('barangay-6', 'Barangay 6', null, null, null, '[]'::jsonb),
('barangay-7', 'Barangay 7', null, null, null, '[]'::jsonb),
('barangay-8', 'Barangay 8', null, null, null, '[]'::jsonb),
('barangay-9', 'Barangay 9', null, null, null, '[]'::jsonb),
('binicuil', 'Binicuil', null, null, null, '[]'::jsonb),
('camansi', 'Camansi', null, null, null, '[]'::jsonb),
('camingawa', 'Camingawa', null, null, null, '[]'::jsonb),
('camugao', 'Camugao', null, null, null, '[]'::jsonb),
('carol-an', 'Carol-an', null, null, null, '[]'::jsonb),
('daan-banua', 'Daan Banua', null, null, null, '[]'::jsonb),
('hilamonan', 'Hilamonan', null, null, null, '[]'::jsonb),
('inapoy', 'Inapoy', null, null, null, '[]'::jsonb),
('linao', 'Linao', null, null, null, '[]'::jsonb),
('locotan', 'Locotan', null, null, null, '[]'::jsonb),
('magballo', 'Magballo', null, null, null, '[]'::jsonb),
('oringao', 'Oringao', null, null, null, '[]'::jsonb),
('orong', 'Orong', null, null, null, '[]'::jsonb),
('pinaguinpinan', 'Pinaguinpinan', null, null, null, '[]'::jsonb),
('salong', 'Salong', null, null, null, '[]'::jsonb),
('tabugon', 'Tabugon', null, null, null, '[]'::jsonb),
('tagoc', 'Tagoc', null, null, null, '[]'::jsonb),
('tagukon', 'Tagukon', null, null, null, '[]'::jsonb),
('talubangi', 'Talubangi', null, null, null, '[]'::jsonb),
('tampalon', 'Tampalon', null, null, null, '[]'::jsonb),
('tan-awan', 'Tan-awan', null, null, null, '[]'::jsonb),
('tapi', 'Tapi', null, null, null, '[]'::jsonb)
on conflict (slug) do nothing;