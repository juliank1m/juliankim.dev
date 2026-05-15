import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Singleton Supabase client. Resolves to `null` if the env vars are
 * missing — callers should treat that as "no backend, fall back to
 * local storage" so dev still works without a configured project.
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null
