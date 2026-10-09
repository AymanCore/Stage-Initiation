-- Tawsilex: table des expéditions
-- Exécuter ce fichier dans Supabase > SQL Editor après avoir créé un projet.

create table if not exists public.shipments (
    id bigint generated always as identity primary key,
    reference text generated always as ('TX-' || lpad(id::text, 8, '0')) stored unique,
    recipient_name text not null check (length(trim(recipient_name)) between 2 and 120),
    recipient_phone text not null check (length(trim(recipient_phone)) between 6 and 30),
    destination_city text not null check (length(trim(destination_city)) between 1 and 100),
    full_address text not null check (length(trim(full_address)) between 3 and 300),
    package_type text not null check (package_type in ('Colis standard', 'Document', 'Fragile')),
    package_weight text not null check (package_weight in ('Moins de 1 kg', '1 à 3 kg', '3 à 5 kg')),
    status text not null default 'Prêt au départ' check (status in ('Prêt au départ', 'En transit', 'Livré')),
    created_at timestamptz not null default now()
);

alter table public.shipments enable row level security;
revoke all on table public.shipments from anon, authenticated;
grant select, insert on table public.shipments to authenticated;

drop policy if exists "Agents read shipments" on public.shipments;
create policy "Agents read shipments"
    on public.shipments for select to authenticated
    using (true);

drop policy if exists "Agents create shipments" on public.shipments;
create policy "Agents create shipments"
    on public.shipments for insert to authenticated
    with check (true);
