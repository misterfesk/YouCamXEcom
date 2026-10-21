import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  resolveScanSecret,
  ScanSecretError,
  signScanToken,
  TOKEN_TTL_SECONDS,
  verifyScanToken,
} from "@/lib/server/scan-token";

const secret = "test-secret-0123456789";
const input = {
  skinTaskId: "skin-1",
  fitzTaskId: "fitz-1",
  source: "camera" as const,
  sha256: "a".repeat(64),
};
const t0 = 1_800_000_000_000;

describe("scan token", () => {
  it("round-trips claims", () => {
    const token = signScanToken(input, secret, t0);
    expect(verifyScanToken(token, secret, t0 + 5_000)).toEqual({
      ok: true,
      claims: { ...input, iat: t0 / 1000, exp: t0 / 1000 + TOKEN_TTL_SECONDS },
    });
  });

  it("rejects a tampered payload", () => {
    const [payload, signature] = signScanToken(input, secret, t0).split(".");
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString());
    const forged = Buffer.from(JSON.stringify({ ...claims, skinTaskId: "other" })).toString("base64url");
    expect(verifyScanToken(`${forged}.${signature}`, secret, t0)).toEqual({ ok: false, reason: "bad_signature" });
  });

  it("rejects a tampered signature or another secret", () => {
    const token = signScanToken(input, secret, t0);
    expect(verifyScanToken(`${token}x`, secret, t0).ok).toBe(false);
    expect(verifyScanToken(token, "different-secret", t0)).toEqual({ ok: false, reason: "bad_signature" });
  });

  it("rejects malformed tokens", () => {
    for (const bad of ["", "abc", "a.b.c", ".", "a."]) {
      expect(verifyScanToken(bad, secret, t0).ok).toBe(false);
    }
  });

  it("rejects a correctly signed payload with the wrong shape", () => {
    const payload = Buffer.from(JSON.stringify({ hello: "world" })).toString("base64url");
    const signature = createHmac("sha256", secret).update(payload).digest("base64url");
    expect(verifyScanToken(`${payload}.${signature}`, secret, t0)).toEqual({ ok: false, reason: "malformed" });
  });

  it("rejects expired tokens", () => {
    const token = signScanToken(input, secret, t0);
    expect(verifyScanToken(token, secret, t0 + (TOKEN_TTL_SECONDS - 1) * 1000).ok).toBe(true);
    expect(verifyScanToken(token, secret, t0 + TOKEN_TTL_SECONDS * 1000)).toEqual({ ok: false, reason: "expired" });
  });
});

describe("resolveScanSecret", () => {
  it("uses the configured secret", () => {
    expect(resolveScanSecret({ SCAN_TOKEN_SECRET: " abc " })).toBe("abc");
  });

  it("falls back to a dev secret outside live mode", () => {
    expect(resolveScanSecret({}).length).toBeGreaterThan(16);
    expect(resolveScanSecret({ YOUCAM_MODE: "mock" }).length).toBeGreaterThan(16);
  });

  it("refuses to run live without a secret", () => {
    expect(() => resolveScanSecret({ YOUCAM_MODE: "live" })).toThrow(ScanSecretError);
    expect(() => resolveScanSecret({ YOUCAM_MODE: "live", SCAN_TOKEN_SECRET: "  " })).toThrow(ScanSecretError);
  });
});
