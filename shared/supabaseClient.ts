import { createClient } from '@supabase/supabase-js';

// Resolve env safely in both browser (Vite) and Node without touching `process` in the browser.
const viteEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env) || undefined;
// Only read process.env if `process` exists (Node). In the browser, `process` is undefined.
const nodeEnv = (typeof process !== 'undefined' && (process as any).env) || undefined;

// The anon key is safe to expose client-side.
const supabaseUrl = viteEnv?.VITE_SUPABASE_URL ?? nodeEnv?.VITE_SUPABASE_URL;
const supabaseAnonKey = viteEnv?.VITE_SUPABASE_ANON_KEY ?? nodeEnv?.VITE_SUPABASE_ANON_KEY;

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
