import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  readLimitedJson,
  readLimitedText,
  validateOrigin,
} from "@/lib/http-guards";

function jsonReq(body: string, headers: Record<string, string> = {}) {
  return new Request("https://honestfuneral.co/api/x", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body,
  });
}

describe("readLimitedText / readLimitedJson", () => {
  it("reads a small body", async () => {
    const res = await readLimitedJson<{ a: number }>(jsonReq('{"a":1}'), 10);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data.a).toBe(1);
  });

  it("rejects an oversized body with 413 (by actual length)", async () => {
    const big = JSON.stringify({ x: "z".repeat(2000) });
    const res = await readLimitedJson(jsonReq(big), 1); // 1 KB cap
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.status).toBe(413);
  });

  it("rejects an oversized body by Content-Length without reading it", async () => {
    const res = await readLimitedText(
      jsonReq("{}", { "content-length": String(5 * 1024) }),
      1,
    );
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.status).toBe(413);
  });

  it("returns 400 on invalid JSON", async () => {
    const res = await readLimitedJson(jsonReq("{not json"), 10);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.status).toBe(400);
  });
});

describe("validateOrigin", () => {
  let saved: string | undefined;
  beforeEach(() => {
    saved = process.env.NEXT_PUBLIC_APP_URL;
    process.env.NEXT_PUBLIC_APP_URL = "https://honestfuneral.co";
  });
  afterEach(() => {
    if (saved === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
    else process.env.NEXT_PUBLIC_APP_URL = saved;
  });

  const req = (headers: Record<string, string>) =>
    new Request("https://honestfuneral.co/api/x", { method: "POST", headers });

  it("allows a same-origin request", () => {
    expect(validateOrigin(req({ origin: "https://honestfuneral.co" }))).toBe(true);
  });

  it("allows when origin/referer are both absent", () => {
    expect(validateOrigin(req({}))).toBe(true);
  });

  it("rejects a cross-site origin", () => {
    expect(validateOrigin(req({ origin: "https://evil.example" }))).toBe(false);
  });

  it("falls back to Referer when Origin is missing", () => {
    expect(
      validateOrigin(req({ referer: "https://honestfuneral.co/negotiate/x" })),
    ).toBe(true);
    expect(validateOrigin(req({ referer: "https://evil.example/x" }))).toBe(false);
  });
});
