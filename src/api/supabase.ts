import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let initError: string | null = null;
if (!supabaseUrl || !supabaseAnonKey) {
  initError =
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env";
  console.warn(initError);
}

export const supabaseInitError: string | null = initError;

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
