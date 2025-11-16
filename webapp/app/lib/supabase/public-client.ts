import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const createPublicClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Non usare cookies di sessione
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      // Disabilita qualsiasi storage che potrebbe usare cookies
      headers: {
        'X-Client-Info': 'education-public-client'
      }
    }
  });
};