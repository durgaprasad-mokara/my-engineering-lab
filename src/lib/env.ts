export type AppMode = "live" | "demo";

export interface PublicEnv {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  siteUrl: string;
}

export function readPublicEnv(source: Record<string, string | undefined> = process.env): PublicEnv {
  const clean = (v?: string) => (v && v.trim() ? v.trim() : undefined);
  return {
    supabaseUrl: clean(source.NEXT_PUBLIC_SUPABASE_URL),
    supabaseAnonKey: clean(source.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    siteUrl: clean(source.NEXT_PUBLIC_SITE_URL) ?? "http://localhost:3000",
  };
}

/** Live mode needs both public Supabase variables; otherwise the app runs in labelled demo mode. */
export function resolveMode(env: PublicEnv = readPublicEnv()): AppMode {
  return env.supabaseUrl && env.supabaseAnonKey ? "live" : "demo";
}

// Next.js inlines NEXT_PUBLIC_* at build time only for direct property access.
export const publicEnv: PublicEnv = readPublicEnv({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

export const appMode: AppMode = resolveMode(publicEnv);
export const isDemoMode = appMode === "demo";
