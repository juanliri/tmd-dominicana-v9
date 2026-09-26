import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://thxpgtkeszcfxiqypklq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoeHBndGtlc3pjZnhpcXlwa2xxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNTU4NzgsImV4cCI6MjEwNDYzMTg3OH0.GlnR395zFYJq214iF1e_Yza7UPmyO2sDUXNFnenMO-Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
