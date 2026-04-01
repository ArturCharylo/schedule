create table public.lessons (
  id uuid default gen_random_uuid() primary key,
  day_of_week int not null check (day_of_week >= 1 and day_of_week <= 5),
  start_time text not null,
  end_time text not null,
  subject text not null,
  room text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.lessons enable row level security;

-- Create policy to allow all access (Assuming this is a personal app with anon key)
create policy "Allow all access" on public.lessons for all using (true) with check (true);
