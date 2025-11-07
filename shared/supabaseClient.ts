import { createClient } from '@supabase/supabase-js';

// Use Vite env in browser; in SSR/Node, process.env with VITE_ prefix won't exist.
// The anon key is safe to expose client-side.
const supabaseUrl = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || process.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

function createNoopSupabase() {
  const ok = async () => ({ data: null, error: null } as const);
  const okArray = async () => ({ data: [] as any[], error: null, count: 0 } as const);
  return {
    from: () => ({
      select: okArray,
      insert: ok,
      upsert: ok,
      update: ok,
      delete: ok,
      eq: () => ({ select: okArray }),
    }),
    rpc: ok,
    auth: {
      getSession: ok,
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } }, error: null } as const),
    },
  } as const;
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : (createNoopSupabase() as unknown as ReturnType<typeof createClient>);
