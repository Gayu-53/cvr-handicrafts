import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Public/browser-safe client (read-only usage on the client side, if ever needed).
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

// Server-only client using the service role key. This bypasses row-level security
// and must NEVER be imported into any client component or exposed to the browser.
// Only import this inside API routes / server actions / server components.
export function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Server-side storage operations require it."
    );
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}
