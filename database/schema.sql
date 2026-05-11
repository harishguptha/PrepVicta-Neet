-- PrepVicta minimal production schema.
-- Scope: login, onboarding, and planner agent only.
-- Existing app code uses SUPABASE_SCHEMA, defaulting to "prepvicta".

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE SCHEMA IF NOT EXISTS prepvicta;
SET search_path TO prepvicta, public;

DO $$
BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'elite', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE planner_priority AS ENUM ('must', 'should', 'could');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE planner_source AS ENUM ('llm', 'fallback', 'manual');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE planner_status AS ENUM ('active', 'superseded', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'skipped', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Login/auth users.
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  email_verified_at TIMESTAMPTZ,
  last_active TIMESTAMPTZ,
  disabled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_email_shape CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$')
);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active DESC);

-- Optional but production-ready session storage for login.
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT UNIQUE NOT NULL,
  user_agent TEXT,
  ip_address INET,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active
ON user_sessions(user_id, expires_at)
WHERE revoked_at IS NULL;

-- Onboarding profile.
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  attempt_year INT NOT NULL CHECK (attempt_year BETWEEN 2024 AND 2040),
  daily_study_hours TEXT,
  strongest_subject TEXT CHECK (strongest_subject IS NULL OR strongest_subject IN ('Physics', 'Chemistry', 'Biology')),
  weakest_subject TEXT CHECK (weakest_subject IS NULL OR weakest_subject IN ('Physics', 'Chemistry', 'Biology')),
  confidence TEXT CHECK (confidence IS NULL OR confidence IN ('Low', 'Medium', 'High')),
  preferred_times TEXT[] NOT NULL DEFAULT '{}',
  target_score INT NOT NULL DEFAULT 650 CHECK (target_score BETWEEN 0 AND 720),
  estimated_score_low INT NOT NULL DEFAULT 0 CHECK (estimated_score_low BETWEEN 0 AND 720),
  estimated_score_high INT NOT NULL DEFAULT 0 CHECK (estimated_score_high BETWEEN 0 AND 720),
  syllabus_completed INT NOT NULL DEFAULT 0 CHECK (syllabus_completed >= 0),
  syllabus_total INT NOT NULL DEFAULT 97 CHECK (syllabus_total > 0),
  planner_adherence INT NOT NULL DEFAULT 0 CHECK (planner_adherence BETWEEN 0 AND 100),
  study_streak_days INT NOT NULL DEFAULT 0 CHECK (study_streak_days >= 0),
  revision_percent INT NOT NULL DEFAULT 0 CHECK (revision_percent BETWEEN 0 AND 100),
  onboarding_completed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT estimated_score_range CHECK (estimated_score_low <= estimated_score_high)
);

DROP TRIGGER IF EXISTS trg_student_profiles_updated_at ON student_profiles;
CREATE TRIGGER trg_student_profiles_updated_at
BEFORE UPDATE ON student_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_student_profiles_attempt_year ON student_profiles(attempt_year);
CREATE INDEX IF NOT EXISTS idx_student_profiles_weakest_subject ON student_profiles(weakest_subject);

-- Planner agent plan header.
-- Store the full normalized PlannerPlan JSON here for replay/debugging/versioning.
CREATE TABLE IF NOT EXISTS planner_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  request_text TEXT,
  source planner_source NOT NULL DEFAULT 'fallback',
  model_name TEXT,
  status planner_status NOT NULL DEFAULT 'active',
  date_line TEXT,
  verdict TEXT,
  consequence TEXT,
  primary_action TEXT,
  total_time TEXT,
  short_session_action TEXT,
  progress_percent INT NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  plan_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_planner_plans_updated_at ON planner_plans;
CREATE TRIGGER trg_planner_plans_updated_at
BEFORE UPDATE ON planner_plans
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_planner_plans_user_date ON planner_plans(user_id, plan_date DESC);
CREATE INDEX IF NOT EXISTS idx_planner_plans_json ON planner_plans USING GIN(plan_json);
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_planner_plan_per_day
ON planner_plans(user_id, plan_date)
WHERE status = 'active';

-- Planner agent tasks.
-- Keeps columns compatible with the existing planner_tasks idea while adding planner UI fields.
CREATE TABLE IF NOT EXISTS planner_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES planner_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL CHECK (subject IN ('Physics', 'Chemistry', 'Biology')),
  title TEXT NOT NULL,
  note TEXT,
  duration_min INT NOT NULL CHECK (duration_min > 0),
  priority planner_priority NOT NULL,
  status task_status NOT NULL DEFAULT 'pending',
  is_done BOOLEAN NOT NULL DEFAULT FALSE,
  plan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  why TEXT,
  unlock TEXT,
  skip_cost TEXT,
  value_label TEXT,
  action_label TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT task_completion_consistency CHECK (
    (is_done = FALSE AND completed_at IS NULL) OR (is_done = TRUE AND completed_at IS NOT NULL)
  )
);

DROP TRIGGER IF EXISTS trg_planner_tasks_updated_at ON planner_tasks;
CREATE TRIGGER trg_planner_tasks_updated_at
BEFORE UPDATE ON planner_tasks
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_planner_tasks_user_date ON planner_tasks(user_id, plan_date DESC);
CREATE INDEX IF NOT EXISTS idx_planner_tasks_status ON planner_tasks(user_id, status, priority);
CREATE INDEX IF NOT EXISTS idx_planner_tasks_plan_id ON planner_tasks(plan_id);

-- Minimal seed users for local testing only.
-- Replace password_hash values with bcrypt/argon2 hashes before production.
INSERT INTO users (email, password_hash, name, role)
VALUES
  ('student@prepvicta.com', 'CHANGE_ME_HASH', 'Demo Student', 'student'),
  ('admin@prepvicta.com', 'CHANGE_ME_HASH', 'Admin', 'admin')
ON CONFLICT (email) DO NOTHING;
