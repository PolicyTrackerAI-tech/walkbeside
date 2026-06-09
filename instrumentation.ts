/**
 * Next.js instrumentation hook — runs once when a server instance boots.
 * We use it to validate environment variables fail-fast (see lib/env.ts).
 *
 * Only runs under the Node.js runtime (not edge). When OUTREACH_LIVE !== "true"
 * the validator only warns, so local dev and CI builds never break on missing
 * secrets; when OUTREACH_LIVE === "true" missing send-path secrets throw and
 * abort startup, so the launch switch can't fire half-configured.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertEnvAtBoot } = await import("@/lib/env");
    assertEnvAtBoot();
  }
}
