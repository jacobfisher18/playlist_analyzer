import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

let initError: string | null = null;
if (!supabaseUrl || !supabaseAnonKey) {
  initError =
    "Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY in .env";
  console.warn(initError);
}

export const supabaseInitError: string | null = initError;

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
