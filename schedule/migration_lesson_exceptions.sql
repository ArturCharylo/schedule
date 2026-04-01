create table public.lesson_exceptions (
  id uuid default gen_random_uuid() primary key,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  date text not null, -- YYYY-MM-DD
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.lesson_exceptions enable row level security;

-- Create policy to allow all access (Assuming anon key usage)
create policy "Allow all access" on public.lesson_exceptions for all using (true) with check (true);
