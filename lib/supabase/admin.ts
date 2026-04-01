import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/database";

// Server-only admin client for privileged operations (bypasses RLS).
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SERVICE_KEY!,
  );
}
