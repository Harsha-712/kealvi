import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ❗ IMPORTANT: prevent build crash
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing Supabase env variables");
}

export const supabase = createClient(
  supabaseUrl || "",
  supabaseAnonKey || ""
);