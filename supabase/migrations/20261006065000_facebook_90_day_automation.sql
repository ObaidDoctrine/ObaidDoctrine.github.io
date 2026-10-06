-- OBAID DOCTRINE: Facebook 90-day automation schema
-- Applied to Supabase project nrckrzgxpxfwuyodbylg on 2026-10-06.
-- This migration is additive and does not alter the existing content_ratings table.

create extension if not exists pgcrypto;

create table if not exists public.facebook_content_posts (
  id uuid primary key default gen_random_uuid(),
  day_number integer not null check (day_number between 1 and 90),
  slot text not null check (slot in ('morning','afternoon','evening')),
  publish_date date,
  publish_time time,
  pillar text not null,
  topic text not null,
  subtopic text,
  hook text,
  core_idea text,
  lesson text,
  message text,
  storyline text,
  scenario text,
  metaphor text,
  visual_concept text,
  script text,
  caption text,
  cta text,
  media_url text,
  content_type text not null default 'reel' check (content_type in ('reel','video','image','link')),
  status text not null default 'draft' check (status in ('draft','schedule_pending','scheduled','publishing','published','failed','cancelled','retry_pending')),
  scheduled_at timestamptz,
  published_at timestamptz,
  facebook_post_id text,
  idempotency_key text not null unique,
  content_hash text not null,
  error_message text,
  retry_count integer not null default 0 check (retry_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(day_number, slot)
);

create index if not exists facebook_content_posts_due_idx
  on public.facebook_content_posts(status, scheduled_at);
create index if not exists facebook_content_posts_hash_idx
  on public.facebook_content_posts(content_hash);

create table if not exists public.facebook_publication_logs (
  id uuid primary key default gen_random_uuid(),
  content_post_id uuid not null references public.facebook_content_posts(id) on delete restrict,
  platform text not null default 'facebook',
  attempt_number integer not null,
  status text not null check (status in ('started','published','failed','skipped')),
  external_post_id text,
  response_status integer,
  error_message text,
  idempotency_key text not null,
  attempted_at timestamptz not null default now(),
  published_at timestamptz,
  unique(content_post_id, platform, attempt_number)
);

create index if not exists facebook_publication_logs_post_idx
  on public.facebook_publication_logs(content_post_id, attempted_at desc);

create table if not exists public.facebook_analytics (
  id uuid primary key default gen_random_uuid(),
  content_post_id uuid not null references public.facebook_content_posts(id) on delete restrict,
  platform text not null default 'facebook',
  reach bigint,
  impressions bigint,
  views bigint,
  reactions bigint,
  comments bigint,
  shares bigint,
  saves bigint,
  clicks bigint,
  fetched_at timestamptz not null default now(),
  unique(content_post_id, platform, fetched_at)
);

create table if not exists public.facebook_admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.facebook_is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.facebook_admin_users where user_id = auth.uid());
$$;

create or replace function public.facebook_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists facebook_content_posts_touch_updated_at on public.facebook_content_posts;
create trigger facebook_content_posts_touch_updated_at
before update on public.facebook_content_posts
for each row execute function public.facebook_touch_updated_at();

create or replace function public.facebook_validate_status_transition()
returns trigger
language plpgsql
as $
begin
  if new.status is not distinct from old.status then
    return new;
  end if;
  if not (
    (old.status='draft' and new.status in ('schedule_pending','scheduled','cancelled')) or
    (old.status='schedule_pending' and new.status in ('draft','scheduled','cancelled')) or
    (old.status='scheduled' and new.status in ('publishing','cancelled')) or
    (old.status='publishing' and new.status in ('published','failed','retry_pending')) or
    (old.status='retry_pending' and new.status in ('publishing','failed','cancelled')) or
    (old.status='failed' and new.status in ('retry_pending','scheduled','cancelled')) or
    (old.status='published' and new.status='published') or
    (old.status='cancelled' and new.status='cancelled')
  ) then
    raise exception 'Invalid Facebook automation status transition: % -> %', old.status, new.status;
  end if;
  return new;
end;
$;

drop trigger if exists facebook_content_posts_status_guard on public.facebook_content_posts;
create trigger facebook_content_posts_status_guard
before update of status on public.facebook_content_posts
for each row
when (old.status is distinct from new.status)
execute function public.facebook_validate_status_transition();

create or replace function public.claim_due_facebook_posts(p_limit integer default 3)
returns setof public.facebook_content_posts
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.facebook_content_posts
     set status = 'retry_pending',
         error_message = coalesce(error_message, 'Recovered stale publishing lock.')
   where status = 'publishing'
     and updated_at < now() - interval '30 minutes';

  return query
  with picked as (
    select id
    from public.facebook_content_posts
    where (
      status = 'scheduled' and scheduled_at <= now()
    ) or (
      status = 'retry_pending' and retry_count < 3
    )
    order by coalesce(scheduled_at, now()), created_at
    for update skip locked
    limit greatest(1, least(p_limit, 20))
  )
  update public.facebook_content_posts p
     set status = 'publishing',
         retry_count = p.retry_count + 1,
         error_message = null,
         updated_at = now()
    from picked
   where p.id = picked.id
     and p.facebook_post_id is null
  returning p.*;
end;
$$;

grant execute on function public.claim_due_facebook_posts(integer) to service_role;

alter table public.facebook_content_posts enable row level security;
alter table public.facebook_publication_logs enable row level security;
alter table public.facebook_analytics enable row level security;
alter table public.facebook_admin_users enable row level security;

drop policy if exists "facebook admins manage content" on public.facebook_content_posts;
create policy "facebook admins manage content"
on public.facebook_content_posts for all
using (public.facebook_is_admin())
with check (public.facebook_is_admin());

drop policy if exists "facebook admins read logs" on public.facebook_publication_logs;
create policy "facebook admins read logs"
on public.facebook_publication_logs for select
using (public.facebook_is_admin());

drop policy if exists "facebook admins read analytics" on public.facebook_analytics;
create policy "facebook admins read analytics"
on public.facebook_analytics for select
using (public.facebook_is_admin());

drop policy if exists "facebook admins read own admin row" on public.facebook_admin_users;
create policy "facebook admins read own admin row"
on public.facebook_admin_users for select
using (user_id = auth.uid());

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.facebook_content_posts to authenticated;
grant select on public.facebook_publication_logs, public.facebook_analytics to authenticated;
grant select on public.facebook_admin_users to authenticated;
