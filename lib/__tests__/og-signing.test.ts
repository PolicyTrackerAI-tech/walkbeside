import { describe, it, expect, afterEach, vi } from "vitest";
import { ogImage, ogQueryString } from "@/lib/og";
import { verifyOgSignature } from "@/lib/og-verify";
import { articleSchema } from "@/lib/article-schema";

/**
 * Audit A1-05: /og URLs are HMAC-signed when OG_SIGNING_SECRET is set,
 * so third parties can't mint official-looking cards from arbitrary
 * query text. Signing (lib/og.ts, node:crypto, sync) and verification
 * (lib/og-verify.ts, Web Crypto, edge-safe) are separate files — these
 * tests pin their canonical messages to each other.
 */

const SECRET = "test-og-signing-secret-long-enough";

function paramsOf(url: string): URLSearchParams {
  return new URL(url, "http://localhost").searchParams;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("ogImage signing", () => {
  it("sign/verify round-trip: ogImage's sig verifies (title + eyebrow)", async () => {
    vi.stubEnv("OG_SIGNING_SECRET", SECRET);
    const params = paramsOf(ogImage("Pet loss", "Grief").url);
    expect(params.get("sig")).toMatch(/^[0-9a-f]{64}$/);
    await expect(verifyOgSignature(params, SECRET)).resolves.toBe(true);
  });

  it("round-trip without an eyebrow", async () => {
    vi.stubEnv("OG_SIGNING_SECRET", SECRET);
    const params = paramsOf(ogImage("Pet loss").url);
    expect(params.has("eyebrow")).toBe(false);
    await expect(verifyOgSignature(params, SECRET)).resolves.toBe(true);
  });

  it("tampered title fails verification", async () => {
    vi.stubEnv("OG_SIGNING_SECRET", SECRET);
    const params = paramsOf(ogImage("Pet loss", "Grief").url);
    params.set("title", "We endorse Acme Funeral Home");
    await expect(verifyOgSignature(params, SECRET)).resolves.toBe(false);
  });

  it("tampered eyebrow fails verification", async () => {
    vi.stubEnv("OG_SIGNING_SECRET", SECRET);
    const params = paramsOf(ogImage("Pet loss", "Grief").url);
    params.set("eyebrow", "Official partner");
    await expect(verifyOgSignature(params, SECRET)).resolves.toBe(false);
  });

  it("stripping a signed eyebrow fails verification", async () => {
    vi.stubEnv("OG_SIGNING_SECRET", SECRET);
    const params = paramsOf(ogImage("Pet loss", "Grief").url);
    params.delete("eyebrow");
    await expect(verifyOgSignature(params, SECRET)).resolves.toBe(false);
  });

  it("missing sig fails verification", async () => {
    vi.stubEnv("OG_SIGNING_SECRET", SECRET);
    const params = paramsOf(ogImage("Pet loss", "Grief").url);
    params.delete("sig");
    await expect(verifyOgSignature(params, SECRET)).resolves.toBe(false);
  });

  it("malformed sig (wrong length / non-hex) fails verification", async () => {
    vi.stubEnv("OG_SIGNING_SECRET", SECRET);
    const params = paramsOf(ogImage("Pet loss", "Grief").url);
    params.set("sig", "deadbeef");
    await expect(verifyOgSignature(params, SECRET)).resolves.toBe(false);
    params.set("sig", "z".repeat(64));
    await expect(verifyOgSignature(params, SECRET)).resolves.toBe(false);
  });

  it("wrong secret fails verification", async () => {
    vi.stubEnv("OG_SIGNING_SECRET", SECRET);
    const params = paramsOf(ogImage("Pet loss", "Grief").url);
    await expect(verifyOgSignature(params, "some-other-secret")).resolves.toBe(
      false,
    );
  });

  it("a newline-bearing signed message cannot be re-split across the field boundary", async () => {
    // The canonical message length-prefixes the title. Without the prefix,
    // sig("A\nB", "E") would also verify for title="A", eyebrow="B\nE" —
    // text migrating between fields under one signature.
    vi.stubEnv("OG_SIGNING_SECRET", SECRET);
    const params = paramsOf(ogImage("A\nB", "E").url);
    await expect(verifyOgSignature(params, SECRET)).resolves.toBe(true);
    const resplit = new URLSearchParams(params);
    resplit.set("title", "A");
    resplit.set("eyebrow", "B\nE");
    await expect(verifyOgSignature(resplit, SECRET)).resolves.toBe(false);
    // And the tail-migration variant: sig("Foo\nBar") vs ("Foo", "Bar\n").
    const p2 = paramsOf(ogImage("Foo\nBar").url);
    const resplit2 = new URLSearchParams(p2);
    resplit2.set("title", "Foo");
    resplit2.set("eyebrow", "Bar\n");
    await expect(verifyOgSignature(resplit2, SECRET)).resolves.toBe(false);
  });

  it("secret unset → no sig param (pre-signing behavior)", () => {
    vi.stubEnv("OG_SIGNING_SECRET", "");
    const params = paramsOf(ogImage("Pet loss", "Grief").url);
    expect(params.has("sig")).toBe(false);
    expect(params.get("title")).toBe("Pet loss");
    expect(params.get("eyebrow")).toBe("Grief");
  });
});

describe("articleSchema image URL", () => {
  it("goes through the shared signed builder: absolute URL + valid sig", async () => {
    vi.stubEnv("OG_SIGNING_SECRET", SECRET);
    const schema = articleSchema({
      slug: "pet-loss",
      title: "Pet loss — when the animal you loved dies",
      description: "x",
      eyebrow: "Grief",
    });
    const image = schema.image as string;
    expect(image).toMatch(/^https:\/\/honestfuneral\.co\/og\?/);
    const params = new URL(image).searchParams;
    await expect(verifyOgSignature(params, SECRET)).resolves.toBe(true);
    // Same builder → byte-identical query to the og:image path.
    expect(image.split("?")[1]).toBe(
      ogQueryString("Pet loss — when the animal you loved dies", "Grief"),
    );
  });
});
