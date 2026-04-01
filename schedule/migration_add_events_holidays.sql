-- Create events table
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  start_time text not null,
  end_time text not null,
  subject text not null,
  room text not null,
  type text default 'event',
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.events enable row level security;
create policy "Allow all access" on public.events for all using (true) with check (true);

-- Create holidays table
create table if not exists public.holidays (
  id uuid default gen_random_uuid() primary key,
  date date not null unique,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.holidays enable row level security;
create policy "Allow all access" on public.holidays for all using (true) with check (true);
