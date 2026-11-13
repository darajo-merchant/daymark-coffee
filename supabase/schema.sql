-- Daymark public website content. This table is accessed only from the Next.js
-- server with SUPABASE_SECRET_KEY; browser clients receive no direct table access.
-- The app seeds the row from its current local content on the first read.

create table if not exists public.site_content (
  id text primary key check (id = 'default'),
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;
revoke all on table public.site_content from anon, authenticated;
grant select, insert, update on table public.site_content to service_role;

-- Daily aggregate page views. No IP addresses, cookies, or visitor identifiers are stored.
create table if not exists public.site_page_views (
  viewed_on date not null default (timezone('utc', now())::date),
  page_path text not null check (page_path in ('/', '/about', '/our-story', '/menu', '/visit', '/contact')),
  page_views bigint not null default 0 check (page_views >= 0),
  primary key (viewed_on, page_path)
);

alter table public.site_page_views enable row level security;
revoke all on table public.site_page_views from anon, authenticated;
grant select, insert, update on table public.site_page_views to service_role;

create or replace function public.record_site_page_view(p_page_path text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_page_path not in ('/', '/about', '/our-story', '/menu', '/visit', '/contact') then
    raise exception 'Unsupported public page';
  end if;

  insert into public.site_page_views (viewed_on, page_path, page_views)
  values (timezone('utc', now())::date, p_page_path, 1)
  on conflict (viewed_on, page_path)
  do update set page_views = public.site_page_views.page_views + 1;
end;
$$;

revoke all on function public.record_site_page_view(text) from public, anon, authenticated;
grant execute on function public.record_site_page_view(text) to service_role;
