import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/env", () => ({ PUBLIC: { appUrl: "https://honestfuneral.co" } }));
vi.mock("@/lib/email", () => ({ sendEmail: vi.fn() }));

import { sendEmail } from "@/lib/email";
import { __resetRateLimit } from "@/lib/rate-limit";
import { POST } from "../route";

const sendEmailMock = vi.mocked(sendEmail);

function digest(to: string, ip: string, headers: Record<string, string> = {}) {
  return POST(
    new Request("https://honestfuneral.co/api/family/digest", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip, ...headers },
      body: JSON.stringify({
        email: to,
        assigneeName: "Sam",
        items: [{ kind: "task", title: "Call the bank" }],
      }),
    }),
  );
}

beforeEach(() => {
  __resetRateLimit();
  sendEmailMock.mockReset();
  sendEmailMock.mockResolvedValue({ id: "e1" } as never);
});

describe("POST /api/family/digest (audit A1-07)", () => {
  it("sends a valid same-site digest", async () => {
    expect((await digest("sam@x.com", "198.51.100.1")).status).toBe(200);
    expect(sendEmailMock).toHaveBeenCalledOnce();
  });

  it("refuses a request from another site", async () => {
    const res = await digest("sam@x.com", "198.51.100.1", { origin: "https://evil.example" });
    expect(res.status).toBe(403);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("caps sends to one recipient even when every request comes from a new IP", async () => {
    const statuses = [];
    for (let i = 0; i < 5; i++) statuses.push((await digest("Sam@X.com", `198.51.100.${i + 10}`)).status);
    expect(statuses).toEqual([200, 200, 200, 429, 429]);
    expect(sendEmailMock).toHaveBeenCalledTimes(3);
  });
});
