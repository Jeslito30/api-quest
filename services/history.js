import { supabase } from './supabase';

/**
 * Supabase table: prompt_history
 *
 * SQL to create this table (run once in Supabase SQL editor):
 *
 * create table prompt_history (
 *   id           uuid primary key default gen_random_uuid(),
 *   clerk_user_id text not null,
 *   type         text not null,        -- 'chat' | 'image' | 'slides' | 'video' | 'audio'
 *   prompt       text not null,
 *   result       text,                 -- stringified JSON for structured results
 *   created_at   timestamptz default now()
 * );
 *
 * -- Row-level security: users only see their own rows
 * alter table prompt_history enable row level security;
 *
 * create policy "Users can manage their own history"
 *   on prompt_history
 *   for all
 *   using (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub')
 *   with check (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');
 *
 * NOTE: For RLS with Clerk JWTs, add your Clerk JWKS URL in Supabase:
 * Dashboard → Auth → JWT Settings → "Use a custom signing key" with your Clerk JWKS URL.
 * Or, for simpler setup, disable RLS and filter by clerk_user_id in your queries.
 */

/**
 * Save a prompt + result to history.
 * @param {string} clerkUserId - the Clerk user.id
 * @param {'chat'|'image'|'slides'|'video'|'audio'} type
 * @param {string} prompt
 * @param {any} result - string or object (will be JSON-stringified if object)
 */
export const saveToHistory = async (clerkUserId, type, prompt, result) => {
  if (!clerkUserId) return { error: 'No user ID provided' };

  const resultStr = typeof result === 'string' ? result : JSON.stringify(result);

  const { data, error } = await supabase
    .from('prompt_history')
    .insert({
      clerk_user_id: clerkUserId,
      type,
      prompt,
      result: resultStr,
    })
    .select()
    .single();

  if (error) console.error('[History] Save error:', error.message);
  return { data, error };
};

/**
 * Fetch all history for a user, newest first.
 * @param {string} clerkUserId
 * @param {number} limit - max rows to return (default 50)
 */
export const fetchHistory = async (clerkUserId, limit = 50) => {
  if (!clerkUserId) return { data: [], error: 'No user ID provided' };

  const { data, error } = await supabase
    .from('prompt_history')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) console.error('[History] Fetch error:', error.message);
  return { data: data ?? [], error };
};

/**
 * Delete a single history entry by ID.
 */
export const deleteHistoryItem = async (id) => {
  const { error } = await supabase
    .from('prompt_history')
    .delete()
    .eq('id', id);

  if (error) console.error('[History] Delete error:', error.message);
  return { error };
};

/**
 * Delete ALL history for a user.
 */
export const clearHistory = async (clerkUserId) => {
  if (!clerkUserId) return { error: 'No user ID provided' };

  const { error } = await supabase
    .from('prompt_history')
    .delete()
    .eq('clerk_user_id', clerkUserId);

  if (error) console.error('[History] Clear error:', error.message);
  return { error };
};
