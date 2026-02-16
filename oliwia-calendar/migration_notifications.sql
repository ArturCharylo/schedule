-- Add notification_sent column to lessons
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS notification_sent boolean DEFAULT false;

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_data jsonb NOT NULL,
  user_agent text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all access (Assuming this is a personal app with anon key)
CREATE POLICY "Allow all access" ON public.subscriptions FOR ALL USING (true) WITH CHECK (true);
