"use client";

import { createBrowserClient } from "@supabase/ssr";
import { PUBLIC } from "@/lib/env";

export function createClient() {
  return createBrowserClient(PUBLIC.supabaseUrl, PUBLIC.supabaseAnonKey);
}
