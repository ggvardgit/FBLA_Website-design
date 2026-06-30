-- APUSH Learning Hub - Supabase tables for user settings and progress
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- Ensure Email Auth is enabled in Authentication > Providers

-- User settings (theme, accessibility, AI config, etc.)
CREATE TABLE IF NOT EXISTS apush_user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User progress (periods, skills, activities)
CREATE TABLE IF NOT EXISTS apush_user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  progress JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE apush_user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE apush_user_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only access their own rows
DROP POLICY IF EXISTS "Users can manage own settings" ON apush_user_settings;
CREATE POLICY "Users can manage own settings" ON apush_user_settings
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own progress" ON apush_user_progress;
CREATE POLICY "Users can manage own progress" ON apush_user_progress
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_user ON apush_user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON apush_user_progress(user_id);
