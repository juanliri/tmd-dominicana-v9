import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if valid production or custom Supabase environment variables are provided
export const isSupabaseConfigured = Boolean(
  rawUrl &&
  !rawUrl.includes('thxpgtkeszcfxiqypklq') &&
  rawAnonKey
);

const supabaseUrl = isSupabaseConfigured ? rawUrl : 'https://placeholder-tmd.supabase.co';
const supabaseAnonKey = isSupabaseConfigured ? rawAnonKey : 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: isSupabaseConfigured,
    autoRefreshToken: isSupabaseConfigured,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
