-- =====================================================================
-- Bandeau public : thème de l'année ecclésiale + annonces
-- À exécuter une fois dans Supabase > SQL Editor.
-- =====================================================================

-- Qui peut modifier le contenu du site (admin / pasteur)
create or replace function public.is_site_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and lower(trim(coalesce(role, ''))) in ('admin', 'pastor', 'corps_pastoral')
  );
$$;

-- ---------------------------------------------------------------------
-- Réglages publics du site (clé / valeur). Séparé de app_settings, qui
-- contient des mots de passe et ne doit jamais être lisible publiquement.
-- Clés utilisées : year_label, year_theme, year_theme_reference
-- ---------------------------------------------------------------------
create table if not exists public.site_settings (
  key         text primary key,
  value       text not null default '',
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id) on delete set null
);

alter table public.site_settings enable row level security;

drop policy if exists "site_settings public read" on public.site_settings;
create policy "site_settings public read"
  on public.site_settings for select
  using (true);

drop policy if exists "site_settings editors write" on public.site_settings;
create policy "site_settings editors write"
  on public.site_settings for all
  to authenticated
  using (public.is_site_editor())
  with check (public.is_site_editor());

-- ---------------------------------------------------------------------
-- Annonces affichées dans le bandeau
-- ---------------------------------------------------------------------
create table if not exists public.site_announcements (
  id          uuid primary key default gen_random_uuid(),
  label       text not null default 'Annonce',          -- texte du badge
  tone        text not null default 'info'
              check (tone in ('info', 'urgent', 'event', 'success')),
  message     text not null check (char_length(message) between 1 and 220),
  link_url    text,
  link_label  text,
  starts_at   timestamptz,                               -- null = immédiatement
  ends_at     timestamptz,                               -- null = sans fin
  is_active   boolean not null default true,
  priority    integer not null default 0,                -- plus grand = affiché en premier
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists site_announcements_live_idx
  on public.site_announcements (is_active, priority desc, created_at desc);

alter table public.site_announcements enable row level security;

-- Le public ne voit que les annonces actives et dans leur période
drop policy if exists "announcements public read live" on public.site_announcements;
create policy "announcements public read live"
  on public.site_announcements for select
  using (
    is_active
    and (starts_at is null or starts_at <= now())
    and (ends_at   is null or ends_at   >  now())
  );

-- Les éditeurs voient et gèrent tout (brouillons, programmées, expirées)
drop policy if exists "announcements editors all" on public.site_announcements;
create policy "announcements editors all"
  on public.site_announcements for all
  to authenticated
  using (public.is_site_editor())
  with check (public.is_site_editor());

-- Valeurs de départ (modifiables ensuite depuis le tableau de bord)
insert into public.site_settings (key, value) values
  ('year_label', 'Année ecclésiale 2026-2027'),
  ('year_theme', ''),
  ('year_theme_reference', '')
on conflict (key) do nothing;
