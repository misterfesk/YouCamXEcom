import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

const DEV_SECRET = "dev-only-scan-token-secret-not-for-production";

export const TOKEN_TTL_SECONDS = 15 * 60;

const claimsSchema = z.object({
  skinTaskId: z.string().min(1),
  fitzTaskId: z.string().min(1),
  source: z.enum(["camera", "upload"]),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  iat: z.number().int(),
  exp: z.number().int(),
});

export type ScanTokenClaims = z.infer<typeof claimsSchema>;

export type TokenVerification =
  | { ok: true; claims: ScanTokenClaims }
  | { ok: false; reason: "malformed" | "bad_signature" | "expired" };

export class ScanSecretError extends Error {
  constructor() {
    super("SCAN_TOKEN_SECRET is required when YOUCAM_MODE=live");
    this.name = "ScanSecretError";
  }
}

/** Live mode refuses to run without a secret; mock/dev falls back to a fixed one. */
export function resolveScanSecret(env: Record<string, string | undefined> = process.env): string {
  const secret = env.SCAN_TOKEN_SECRET?.trim();
  if (secret) return secret;
  if (env.YOUCAM_MODE === "live") throw new ScanSecretError();
  return DEV_SECRET;
}

const sign = (payload: string, secret: string) =>
  createHmac("sha256", secret).update(payload).digest("base64url");

export function signScanToken(
  input: Omit<ScanTokenClaims, "iat" | "exp">,
  secret: string,
  nowMs: number = Date.now(),
): string {
  const iat = Math.floor(nowMs / 1000);
  const claims: ScanTokenClaims = { ...input, iat, exp: iat + TOKEN_TTL_SECONDS };
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyScanToken(token: string, secret: string, nowMs: number = Date.now()): TokenVerification {
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return { ok: false, reason: "malformed" };
  const [payload, signature] = parts;

  const expected = Buffer.from(sign(payload, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return { ok: false, reason: "bad_signature" };
  }

  let claims: ScanTokenClaims;
  try {
    claims = claimsSchema.parse(JSON.parse(Buffer.from(payload, "base64url").toString("utf8")));
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (Math.floor(nowMs / 1000) >= claims.exp) return { ok: false, reason: "expired" };
  return { ok: true, claims };
}
