import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

/**
 * OUTREACH_NOTIFICATIONS_ENABLED gate tripwire (audit A10-02 — this kill
 * switch had zero coverage). The cron must short-circuit BEFORE touching the
 * database or email when the flag is anything but the literal "true", and
 * must refuse unauthenticated callers before even reading the flag.
 */

vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/email", () => ({ sendEmail: vi.fn() }));
vi.mock("@/lib/env", () => ({
  PUBLIC: { supabaseUrl: "http://test.local", appUrl: "http://test.local" },
  FEATURES: { supabase: () => true },
  requireServer: (k: string) =>
    k === "CRON_SECRET" ? "test-cron-secret" : "service-key",
}));

import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";
import { GET } from "../route";

const createClientMock = vi.mocked(createClient);
const sendEmailMock = vi.mocked(sendEmail);

function cronRequest(auth?: string) {
  return new Request("http://test.local/api/cron/quote-notifications", {
    headers: auth ? { authorization: auth } : {},
  });
}

const savedFlag = process.env.OUTREACH_NOTIFICATIONS_ENABLED;

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.OUTREACH_NOTIFICATIONS_ENABLED;
});

afterEach(() => {
  if (savedFlag === undefined) delete process.env.OUTREACH_NOTIFICATIONS_ENABLED;
  else process.env.OUTREACH_NOTIFICATIONS_ENABLED = savedFlag;
});

describe("quote-notifications cron gate", () => {
  it("rejects a caller without the CRON_SECRET before anything else", async () => {
    const res = await GET(cronRequest());
    expect(res.status).toBe(401);
    expect(createClientMock).not.toHaveBeenCalled();
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("flag unset → disabled short-circuit: no DB client, no email, ever", async () => {
    const res = await GET(cronRequest("Bearer test-cron-secret"));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { disabled?: boolean };
    expect(json.disabled).toBe(true);
    expect(createClientMock).not.toHaveBeenCalled();
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it('any value other than the literal "true" stays disabled (e.g. "TRUE", "1")', async () => {
    for (const v of ["TRUE", "1", "yes", "false"]) {
      process.env.OUTREACH_NOTIFICATIONS_ENABLED = v;
      const res = await GET(cronRequest("Bearer test-cron-secret"));
      expect(((await res.json()) as { disabled?: boolean }).disabled).toBe(true);
    }
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it('flag exactly "true" → the gate opens (DB client constructed)', async () => {
    process.env.OUTREACH_NOTIFICATIONS_ENABLED = "true";
    // Scripted empty result: no pending quotes → route completes sending nothing.
    createClientMock.mockReturnValue({
      from: () => ({
        select: () => ({
          not: () => ({
            is: () => ({
              order: () => ({
                limit: async () => ({ data: [], error: null }),
              }),
            }),
          }),
        }),
      }),
    } as never);
    const res = await GET(cronRequest("Bearer test-cron-secret"));
    expect(res.status).toBe(200);
    expect(createClientMock).toHaveBeenCalledTimes(1);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });
});
