import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseUrl.startsWith("http")) {
  throw new Error("Invalid VITE_SUPABASE_URL configuration");
}

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

export interface SupabaseHealthCheckResult {
  connected: boolean;
  url: string;
  authWorking: boolean;
  profilesTableAccessible: boolean;
  error?: string;
  notes?: string[];
}

export async function checkSupabaseConnection(): Promise<SupabaseHealthCheckResult> {
  const result: SupabaseHealthCheckResult = {
    connected: false,
    url: supabaseUrl,
    authWorking: false,
    profilesTableAccessible: false,
    notes: [],
  };

  try {
    // 1. Test Supabase Auth service ping
    const { error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      result.error = `Auth session check failed: ${sessionError.message}`;
      return result;
    }
    result.authWorking = true;
    result.connected = true;

    // 2. Test database access on 'profiles' table
    const { data: _data, error: dbError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (dbError) {
      if (dbError.code === '42P01') {
        // Table does not exist in public schema
        result.profilesTableAccessible = false;
        result.notes?.push("Table 'profiles' does not exist yet in your PostgreSQL schema.");
      } else if (dbError.code === 'PGRST301' || dbError.message.includes('permission') || dbError.message.includes('row-level security')) {
        // RLS active, table exists!
        result.profilesTableAccessible = true;
        result.notes?.push("RLS active on 'profiles' table.");
      } else {
        result.notes?.push(`Table query response: ${dbError.message} (code: ${dbError.code || 'unknown'})`);
      }
    } else {
      result.profilesTableAccessible = true;
      result.notes?.push("Successfully connected to 'profiles' table.");
    }

    return result;
  } catch (err: any) {
    result.connected = false;
    result.error = err.message || 'Unknown network error';
    return result;
  }
}
