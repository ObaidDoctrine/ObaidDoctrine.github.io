-- Remove the retired Facebook 90-day content automation only.
-- Preserve public.content_ratings and the separate article-to-Facebook publisher.
drop table if exists public.facebook_publication_logs cascade;
drop table if exists public.facebook_analytics cascade;
drop table if exists public.facebook_content_posts cascade;
drop table if exists public.facebook_admin_users cascade;

drop function if exists public.claim_due_facebook_posts(integer) cascade;
drop function if exists public.facebook_validate_status_transition() cascade;
drop function if exists public.facebook_touch_updated_at() cascade;
drop function if exists public.facebook_is_admin() cascade;
