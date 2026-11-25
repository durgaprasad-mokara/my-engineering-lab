"use client";

import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env";

export function createSupabaseBrowserClient() {
  if (!publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey) {
    throw new Error("Supabase is not configured (demo mode).");
  }
  return createBrowserClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey);
}
