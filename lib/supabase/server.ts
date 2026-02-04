import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabaseServerClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL or anon key is missing");
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return (cookies() as any).get(name)?.value;
      },
      set(name: string, value: string, options?: any) {
        (cookies() as any).set({ name, value, ...options });
      },
      remove(name: string, options?: any) {
        // Setting empty value to remove cookie in Next's cookie store
        (cookies() as any).set({ name, value: "", ...options });
      },
    },
  });
}
