-- =============================================================================
-- Complete Supabase SQL script for prompt_history table
-- Run this in Supabase → SQL Editor (one time, or when resetting)
-- =============================================================================

-- 1. Create or replace the helper function to get the current Clerk user ID from JWT
--    (preferred modern way over current_setting(...))
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT NULLIF(
    (auth.jwt() ->> 'sub')::text,
    ''
  );
$$;

-- 2. Create the prompt_history table (idempotent)
CREATE TABLE IF NOT EXISTS prompt_history (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text NOT NULL,
  type        text NOT NULL CHECK (type IN ('chat', 'image', 'slides', 'video', 'audio')),
  prompt      text NOT NULL,
  result      text,                     -- can be JSON stringified
  created_at  timestamptz DEFAULT now() NOT NULL
);

-- 3. Add comment for clarity
COMMENT ON TABLE prompt_history IS 'Stores user prompts and results across different generation types';

-- 4. Create index for fast per-user + sorting queries
CREATE INDEX IF NOT EXISTS idx_prompt_history_user_created
  ON prompt_history (clerk_user_id, created_at DESC);

-- 5. Enable Row Level Security
ALTER TABLE prompt_history ENABLE ROW LEVEL SECURITY;

-- 6. Drop any old / conflicting policies first (safe to run multiple times)
DROP POLICY IF EXISTS "Users manage their own history"         ON prompt_history;
DROP POLICY IF EXISTS "Public Access"                         ON prompt_history;
DROP POLICY IF EXISTS "Temporary full access for testing"     ON prompt_history;
DROP POLICY IF EXISTS "Users can manage their own history"    ON prompt_history;

-- 7. Create the secure policy using the helper function
--    → Only allows users to read/write rows where clerk_user_id matches their JWT sub
CREATE POLICY "Users manage their own history"
  ON prompt_history
  FOR ALL
  USING (clerk_user_id = requesting_user_id())
  WITH CHECK (clerk_user_id = requesting_user_id());

-- =============================================================================
-- Optional: Development / Testing policy (uncomment only when needed)
-- =============================================================================
/*
-- Temporarily allow full access (disable RLS or use this wide-open policy)
ALTER TABLE prompt_history DISABLE ROW LEVEL SECURITY;
-- OR --
CREATE POLICY "Temporary full access for testing"
  ON prompt_history
  FOR ALL
  USING (true)
  WITH CHECK (true);
*/

-- =============================================================================
-- Quick test queries (run these after setup to verify)
-- =============================================================================

-- See what your JWT sub looks like (run after making an authenticated request from app)
-- SELECT requesting_user_id() AS current_clerk_user_id;

-- Check current policies
-- SELECT * FROM pg_policies WHERE tablename = 'prompt_history';

-- Check table structure
-- \d prompt_history