import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Supabase requires non-empty values during client construction. Use harmless
// local placeholders so a missing .env does not crash the entire React app.
// Auth screens then provide a clear configuration message instead.
const configuredUrl = url?.trim();
const configuredAnonKey = anonKey?.trim();

export const supabase = createClient(
  configuredUrl || 'http://127.0.0.1:54321',
  configuredAnonKey || 'local-development-placeholder-key',
  {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  },
);

export const isSupabaseConfigured = Boolean(configuredUrl && configuredAnonKey);
