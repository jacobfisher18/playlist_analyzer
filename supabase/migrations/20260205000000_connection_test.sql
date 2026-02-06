-- Connection test table for frontend to verify Supabase connectivity.
-- Anon key can read one row.

create table if not exists public.connection_test (
  id int primary key,
  message text
);

insert into public.connection_test (id, message)
values (1, 'Hello from Supabase')
on conflict (id) do nothing;

alter table public.connection_test enable row level security;

drop policy if exists "Allow anon read connection_test" on public.connection_test;
create policy "Allow anon read connection_test"
  on public.connection_test for select
  to anon
  using (true);
