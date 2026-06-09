import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock the email sender so no real send is attempted.
vi.mock("@/lib/email", () => ({ sendEmail: vi.fn() }));
// Mock the denylist so we can flip a specific address to denied.
vi.mock("@/lib/negotiation/denylist", () => ({ isEmailDenylisted: vi.fn() }));

import { sendEmail } from "@/lib/email";
import { isEmailDenylisted } from "@/lib/negotiation/denylist";
import { sendOutreachForNegotiation } from "@/lib/negotiation/send";

const sendEmailMock = vi.mocked(sendEmail);
const denylistMock = vi.mocked(isEmailDenylisted);
const NEG = "abcdef12-0000-0000-0000-000000000000";
const AUTH_ID = "WB-ABCDEF12"; // WB- + NEG.slice(0,8).toUpperCase()

interface Row {
  id: string;
  negotiation_id: string;
  status: string;
  home_email: string | null;
  initial_email_body?: string;
  initial_email_id?: string;
}

/**
 * Minimal in-memory stand-in for the supabase-js client, supporting exactly the
 * chains sendOutreachForNegotiation uses:
 *   from(t).select(..).eq(..).eq(..)            → { data }
 *   from(t).update(patch).eq("id", id)          → applies patch
 *   from("negotiations").update(..).eq().eq()   → applies patch if filters match
 */
function makeAdmin(rows: Row[], negStatus = "pending_payment") {
  const outreach = rows.map((r) => ({ ...r }));
  const negotiations = [{ id: NEG, status: negStatus }];

  const matches = (row: Record<string, unknown>, f: Record<string, unknown>) =>
    Object.entries(f).every(([k, v]) => row[k] === v);

  function run(name: string, op: string, patch: Record<string, unknown> | undefined, filters: Record<string, unknown>) {
    const store: Record<string, unknown>[] =
      name === "negotiation_outreach" ? outreach : negotiations;
    const matched = store.filter((r) => matches(r, filters));
    if (op === "update" && patch) for (const r of matched) Object.assign(r, patch);
    return { data: matched, error: null };
  }

  function chain(name: string, op: string, patch?: Record<string, unknown>) {
    const filters: Record<string, unknown> = {};
    const c = {
      eq(k: string, v: unknown) {
        filters[k] = v;
        return c;
      },
      then(resolve: (v: unknown) => void, reject?: (e: unknown) => void) {
        try {
          resolve(run(name, op, patch, filters));
        } catch (e) {
          reject?.(e);
        }
      },
    };
    return c;
  }

  return {
    from(name: string) {
      return {
        select: () => chain(name, "select"),
        update: (patch: Record<string, unknown>) => chain(name, "update", patch),
      };
    },
    _outreach: outreach,
    _negotiations: negotiations,
  };
}

let savedLive: string | undefined;
beforeEach(() => {
  savedLive = process.env.OUTREACH_LIVE;
  delete process.env.OUTREACH_LIVE;
  sendEmailMock.mockReset();
  sendEmailMock.mockResolvedValue({ id: "em_default" });
  denylistMock.mockReset();
  denylistMock.mockReturnValue(false);
});
afterEach(() => {
  if (savedLive === undefined) delete process.env.OUTREACH_LIVE;
  else process.env.OUTREACH_LIVE = savedLive;
});

const pendingRow = (id: string, email: string | null): Row => ({
  id,
  negotiation_id: NEG,
  status: "pending",
  home_email: email,
  initial_email_body: "body",
});

describe("sendOutreachForNegotiation", () => {
  it("OUTREACH_LIVE off → records dry_run, sends NO email", async () => {
    const admin = makeAdmin([pendingRow("o1", "a@h.com"), pendingRow("o2", "b@h.com")]);
    const res = await sendOutreachForNegotiation(admin as never, NEG);
    expect(res).toEqual({ sent: 0, dryRun: 2, skipped: 0, failed: 0 });
    expect(sendEmailMock).not.toHaveBeenCalled();
    expect(admin._outreach.every((r) => r.status === "dry_run")).toBe(true);
    expect(admin._negotiations[0].status).toBe("contacting");
  });

  it("OUTREACH_LIVE on → sends and marks rows sent", async () => {
    process.env.OUTREACH_LIVE = "true";
    sendEmailMock.mockResolvedValue({ id: "em_1" });
    const admin = makeAdmin([pendingRow("o1", "a@h.com"), pendingRow("o2", "b@h.com")]);
    const res = await sendOutreachForNegotiation(admin as never, NEG);
    expect(res.sent).toBe(2);
    expect(res.failed).toBe(0);
    expect(sendEmailMock).toHaveBeenCalledTimes(2);
    expect(admin._outreach.every((r) => r.status === "sent")).toBe(true);
    expect(admin._outreach.every((r) => r.initial_email_id === "em_1")).toBe(true);

    // Each email goes to its OWN home, with the ref-coded subject + a reply-to.
    const args = sendEmailMock.mock.calls.map((c) => c[0]);
    expect(args.map((a) => a.to).sort()).toEqual(["a@h.com", "b@h.com"]);
    expect(args.every((a) => a.subject.includes(AUTH_ID))).toBe(true);
    expect(args.every((a) => typeof a.replyTo === "string" && a.replyTo.length > 0)).toBe(true);
  });

  it("a denylisted email is declined, never sent (even when live)", async () => {
    process.env.OUTREACH_LIVE = "true";
    denylistMock.mockImplementation((e) => e === "deny@h.com");
    const admin = makeAdmin([pendingRow("o1", "ok@h.com"), pendingRow("o2", "deny@h.com")]);
    const res = await sendOutreachForNegotiation(admin as never, NEG);
    expect(res.sent).toBe(1);
    expect(res.skipped).toBe(1);
    expect(admin._outreach.find((r) => r.id === "o2")!.status).toBe("declined");
    // The denylisted address was never passed to the sender.
    expect(sendEmailMock.mock.calls.every((c) => c[0].to !== "deny@h.com")).toBe(true);
  });

  it("only flips the negotiation when it's in pending_payment", async () => {
    // A negotiation already past payment must NOT be reset to 'contacting'.
    const admin = makeAdmin([pendingRow("o1", "a@h.com")], "closed");
    await sendOutreachForNegotiation(admin as never, NEG);
    expect(admin._negotiations[0].status).toBe("closed");
  });

  it("a row with no email is declined, not sent", async () => {
    const admin = makeAdmin([pendingRow("o1", "a@h.com"), pendingRow("o2", null)]);
    const res = await sendOutreachForNegotiation(admin as never, NEG);
    expect(res.skipped).toBe(1);
    expect(res.dryRun).toBe(1);
    expect(admin._outreach.find((r) => r.id === "o2")!.status).toBe("declined");
  });

  it("is idempotent — re-running with no pending rows sends nothing", async () => {
    const admin = makeAdmin([
      { id: "o1", negotiation_id: NEG, status: "sent", home_email: "a@h.com" },
    ]);
    const res = await sendOutreachForNegotiation(admin as never, NEG);
    expect(res).toEqual({ sent: 0, dryRun: 0, skipped: 0, failed: 0 });
    expect(sendEmailMock).not.toHaveBeenCalled();
    expect(admin._outreach[0].status).toBe("sent");
  });

  it("a failed live send leaves the row pending (retryable) and counts failed", async () => {
    process.env.OUTREACH_LIVE = "true";
    sendEmailMock.mockRejectedValue(new Error("resend down"));
    const admin = makeAdmin([pendingRow("o1", "a@h.com")]);
    const res = await sendOutreachForNegotiation(admin as never, NEG);
    expect(res.sent).toBe(0);
    expect(res.failed).toBe(1);
    expect(admin._outreach[0].status).toBe("pending");
  });
});
