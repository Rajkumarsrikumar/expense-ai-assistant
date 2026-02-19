-- Project Tracker Schema
-- Run this in Supabase SQL Editor to create tables, RLS, and triggers

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- A) profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role text,
  timezone text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- B) projects
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text NOT NULL,
  priority text NOT NULL,
  progress int NOT NULL DEFAULT 0,
  start_date date,
  target_date date,
  tags text[] NOT NULL DEFAULT '{}',
  owner_label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- C) history_entries
CREATE TABLE IF NOT EXISTS public.history_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  timestamp timestamptz NOT NULL DEFAULT now(),
  type text NOT NULL,
  from_value text,
  to_value text,
  note text
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON public.projects(updated_at);
CREATE INDEX IF NOT EXISTS idx_history_entries_project_id ON public.history_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_history_entries_timestamp ON public.history_entries(timestamp DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.history_entries ENABLE ROW LEVEL SECURITY;

-- profiles: user can select/insert/update ONLY their own row
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- projects: user can select/insert/update/delete ONLY rows where user_id = auth.uid()
DROP POLICY IF EXISTS "projects_select_own" ON public.projects;
CREATE POLICY "projects_select_own" ON public.projects
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "projects_insert_own" ON public.projects;
CREATE POLICY "projects_insert_own" ON public.projects
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "projects_update_own" ON public.projects;
CREATE POLICY "projects_update_own" ON public.projects
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "projects_delete_own" ON public.projects;
CREATE POLICY "projects_delete_own" ON public.projects
  FOR DELETE USING (user_id = auth.uid());

-- history_entries: user can select/insert ONLY rows where user_id = auth.uid()
-- AND project_id belongs to user's projects
DROP POLICY IF EXISTS "history_select_own" ON public.history_entries;
CREATE POLICY "history_select_own" ON public.history_entries
  FOR SELECT USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = history_entries.project_id AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "history_insert_own" ON public.history_entries;
CREATE POLICY "history_insert_own" ON public.history_entries
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.user_id = auth.uid()
    )
  );

-- No UPDATE or DELETE on history_entries (append-only)

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Update projects.updated_at on any update
CREATE OR REPLACE FUNCTION public.update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_projects_updated_at ON public.projects;
CREATE TRIGGER trigger_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_projects_updated_at();

-- Trigger: Auto-insert history when status or progress changes
-- Frontend will NOT insert history for status/progress - trigger is source of truth
CREATE OR REPLACE FUNCTION public.auto_insert_project_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Status change
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.history_entries (user_id, project_id, type, from_value, to_value)
    VALUES (NEW.user_id, NEW.id, 'status_change', OLD.status, NEW.status);
  END IF;

  -- Progress change
  IF OLD.progress IS DISTINCT FROM NEW.progress THEN
    INSERT INTO public.history_entries (user_id, project_id, type, from_value, to_value)
    VALUES (NEW.user_id, NEW.id, 'progress_update', OLD.progress::text, NEW.progress::text);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_auto_project_history ON public.projects;
CREATE TRIGGER trigger_auto_project_history
  AFTER UPDATE ON public.projects
  FOR EACH ROW
  WHEN (
    OLD.status IS DISTINCT FROM NEW.status
    OR OLD.progress IS DISTINCT FROM NEW.progress
  )
  EXECUTE FUNCTION public.auto_insert_project_history();

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
