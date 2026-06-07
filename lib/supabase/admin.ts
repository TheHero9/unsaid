import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

/**
 * Service-role Supabase client - the ONLY way this app talks to the database.
 * All `u_*` tables have RLS enabled with zero policies (deny-all); the browser
 * never gets a Supabase client. Authorization = capability codes, re-resolved
 * server-side on every action (see specs/02-tech-stack/01-tech-stack.md).
 */

let adminClient: SupabaseClient<Database> | null = null;

export function getAdminClient(): SupabaseClient<Database> {
  if (adminClient) return adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  adminClient = createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}
