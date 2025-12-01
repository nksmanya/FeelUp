-- FeelUp Database Setup Script
-- Copy and paste this entire script into your Supabase SQL Editor

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  mood_color TEXT DEFAULT '#6b7280',
  theme TEXT DEFAULT 'default',
  privacy_level TEXT DEFAULT 'public',
  streak_count INTEGER DEFAULT 0,
  total_goals_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create mood_posts table (matches your API)
CREATE TABLE IF NOT EXISTS public.mood_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  content TEXT NOT NULL,
  mood_emoji TEXT NOT NULL,
  visibility TEXT DEFAULT 'public',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create post_reactions table (matches your API)
CREATE TABLE IF NOT EXISTS public.post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.mood_posts(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_email, type)
);

-- Create goals table (matches your API)
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  mood_at_completion TEXT,
  reflection_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create journal_entries table (matches your API)
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  mood_tag TEXT,
  gratitude_notes TEXT[],
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow all operations on profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow all operations on mood_posts" ON public.mood_posts FOR ALL USING (true);
CREATE POLICY "Allow all operations on post_reactions" ON public.post_reactions FOR ALL USING (true);
CREATE POLICY "Allow all operations on goals" ON public.goals FOR ALL USING (true);
CREATE POLICY "Allow all operations on journal_entries" ON public.journal_entries FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mood_posts_user_email ON public.mood_posts(user_email);
CREATE INDEX IF NOT EXISTS idx_mood_posts_created ON public.mood_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_goals_user_email ON public.goals(user_email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_email ON public.journal_entries(user_email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON public.post_reactions(post_id);

-- Success message
SELECT 'FeelUp database setup completed successfully!' as result;