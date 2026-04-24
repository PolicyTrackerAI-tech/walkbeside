/**
 * Centralised env access. Server-only values live behind helper getters
 * that throw if used at runtime without being set — this avoids silently
 * making API calls with empty keys.
 */

export const PUBLIC = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};

export function requireServer(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `Missing env var ${name}. Set it in .env.local before using this feature.`,
    );
  }
  return v;
}

export function hasServer(name: string): boolean {
  return Boolean(process.env[name]);
}

export const FEATURES = {
  supabase: () =>
    Boolean(PUBLIC.supabaseUrl && PUBLIC.supabaseAnonKey),
  claude: () => hasServer("ANTHROPIC_API_KEY"),
  stripe: () => hasServer("STRIPE_SECRET_KEY"),
  email: () => hasServer("RESEND_API_KEY"),
};
