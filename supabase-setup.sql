-- ============================================================
-- Run this once in your Supabase project → SQL Editor
-- ============================================================

-- 1. Create the history table
create table if not exists prompt_history (
  id            uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  type          text not null check (type in ('chat', 'image', 'slides', 'video', 'audio')),
  prompt        text not null,
  result        text,
  created_at    timestamptz default now()
);

-- 2. Index for fast per-user queries
create index if not exists idx_prompt_history_user
  on prompt_history (clerk_user_id, created_at desc);

-- 3. Row-Level Security (recommended)
alter table prompt_history enable row level security;

-- Policy: users can only read/write their own rows
-- NOTE: This requires Clerk JWT template configured in Supabase.
-- See SETUP.md for instructions. If you want to skip RLS for now,
-- comment out this policy block and just rely on clerk_user_id filtering.
create policy "Users manage their own history"
  on prompt_history
  for all
  using (
    clerk_user_id = (
      current_setting('request.jwt.claims', true)::json ->> 'sub'
    )
  )
  with check (
    clerk_user_id = (
      current_setting('request.jwt.claims', true)::json ->> 'sub'
    )
  );
