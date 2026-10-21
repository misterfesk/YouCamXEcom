import { z } from "zod";
import { normalizeScan } from "@/lib/skin/normalize";
import { MAX_UPLOAD_BYTES } from "@/lib/youcam/constants";
import { YouCamError, type YouCamFailure } from "@/lib/youcam/errors";
import type { YouCamMode } from "@/lib/youcam/config";
import type { YouCamClient } from "@/lib/youcam/types";
import type {
  ScanApiError,
  ScanErrorBody,
  ScanErrorCode,
  ScanStartResponse,
  ScanStatusResponse,
  ScanUnavailableReason,
  ScanUploadResponse,
} from "@/types/scan";
import { clientIp, hashIp, type ScanLimits } from "./limits";
import { signScanToken, verifyScanToken } from "./scan-token";

/** A scan still pending after this long is reported as a timeout. */
export const POLL_TIMEOUT_MS = 60_000;

/** Largest body the mock upload sink will read before discarding it. */
const MOCK_UPLOAD_LIMIT = MAX_UPLOAD_BYTES + 1024;

export interface ScanApiDeps {
  client: YouCamClient;
  limits: ScanLimits;
  mode: YouCamMode;
  /** Signs scan tokens and salts IP hashes. */
  secret: string;
  now?: () => number;
}

const sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);

const uploadSchema = z.object({
  contentType: z.string(),
  fileSize: z.number().int().positive(),
  sha256: sha256Schema,
});

const startSchema = z.object({
  fileId: z.string().min(1).max(256),
  sha256: sha256Schema,
  source: z.enum(["camera", "upload"]),
});

const SCAN_ERROR_STATUS: Partial<Record<ScanErrorCode, number>> = {
  image_too_large: 413,
  timeout: 504,
  network: 502,
  unknown: 500,
};

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function statusFor(error: ScanApiError): number {
  if (error.kind === "scan_unavailable") return error.reason === "daily_cap" ? 429 : 503;
  return SCAN_ERROR_STATUS[error.code] ?? 422;
}

function errorResponse(error: ScanApiError, status = statusFor(error)): Response {
  const body: ScanErrorBody = { error };
  return json(body, status);
}

const scanError = (code: ScanErrorCode): ScanApiError => ({ kind: "scan_error", code });
const unavailable = (reason: ScanUnavailableReason): ScanApiError => ({ kind: "scan_unavailable", reason });

function toApiError(failure: YouCamFailure): ScanApiError {
  return failure.kind === "out_of_credits" ? unavailable("provider_out_of_credits") : scanError(failure.code);
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

/** Runs a handler; anything unexpected becomes a generic typed error, never a raw message. */
async function guarded(run: () => Promise<Response>): Promise<Response> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof YouCamError) {
      console.error(`scan: provider failure (${error.failure.kind}): ${error.message}`);
      return errorResponse(toApiError(error.failure));
    }
    console.error("scan: unexpected failure", error instanceof Error ? error.name : "unknown");
    return errorResponse(scanError("unknown"));
  }
}

export function createScanApi(deps: ScanApiDeps) {
  const { client, limits, mode, secret } = deps;
  const now = deps.now ?? Date.now;
  const ipHashOf = (request: Request) => hashIp(clientIp(request.headers), secret);

  /** POST /api/scan/upload */
  const upload = (request: Request) =>
    guarded(async () => {
      const parsed = uploadSchema.safeParse(await readJson(request));
      if (!parsed.success) return errorResponse(scanError("unknown"), 400);
      const { contentType, fileSize, sha256 } = parsed.data;
      if (contentType !== "image/jpeg") return errorResponse(scanError("unknown"), 415);
      if (fileSize > MAX_UPLOAD_BYTES) return errorResponse(scanError("image_too_large"));

      const cached = await limits.getCachedProfile(sha256);
      if (cached) {
        const body: ScanUploadResponse = { cached: true, profile: cached };
        return json(body);
      }

      const capped = await limits.checkCaps(ipHashOf(request));
      if (capped) return errorResponse(unavailable(capped));
      const reserved = await limits.checkReserve(() => client.getCreditBalance());
      if (reserved) return errorResponse(unavailable(reserved));

      const file = await client.createFile({ contentType: "image/jpeg", fileSize });
      const body: ScanUploadResponse = { cached: false, ...file };
      return json(body);
    });

  /** POST /api/scan */
  const start = (request: Request) =>
    guarded(async () => {
      const parsed = startSchema.safeParse(await readJson(request));
      if (!parsed.success) return errorResponse(scanError("unknown"), 400);
      const { fileId, sha256, source } = parsed.data;

      const slot = await limits.reserveSlot(ipHashOf(request));
      if (!slot.ok) return errorResponse(unavailable(slot.reason));

      let started = false;
      try {
        const reserved = await limits.checkReserve(() => client.getCreditBalance());
        if (reserved) return errorResponse(unavailable(reserved));

        const [skin, fitz] = await Promise.allSettled([
          client.startSkinAnalysis(fileId),
          client.startFitzpatrick(fileId),
        ]);
        started = skin.status === "fulfilled" || fitz.status === "fulfilled";
        if (skin.status === "rejected") throw skin.reason;
        if (fitz.status === "rejected") throw fitz.reason;

        await limits.noteScanStarted();
        const scanId = signScanToken({ skinTaskId: skin.value, fitzTaskId: fitz.value, source, sha256 }, secret, now());
        const body: ScanStartResponse = { scanId };
        return json(body);
      } finally {
        if (!started) await slot.release();
      }
    });

  /** GET /api/scan/[scanId] */
  const status = (scanId: string) =>
    guarded(async () => {
      const verified = verifyScanToken(scanId, secret, now());
      if (!verified.ok) return errorResponse(scanError("unknown"), verified.reason === "expired" ? 410 : 400);
      const { claims } = verified;

      const [skin, fitz] = await Promise.all([
        client.pollSkinAnalysis(claims.skinTaskId),
        client.pollFitzpatrick(claims.fitzTaskId),
      ]);

      const failed = skin.status === "error" ? skin : fitz.status === "error" ? fitz : null;
      if (failed) {
        const body: ScanStatusResponse = { status: "error", error: toApiError(failed.failure) };
        return json(body);
      }
      if (skin.status === "success" && fitz.status === "success") {
        const profile = normalizeScan({
          output: skin.result,
          fitzpatrick: fitz.result,
          source: claims.source,
          scannedAt: new Date(now()).toISOString(),
          keepMasks: true,
        });
        await limits.cacheProfile(claims.sha256, profile);
        const body: ScanStatusResponse = { status: "done", profile };
        return json(body);
      }
      if (now() - claims.iat * 1000 > POLL_TIMEOUT_MS) {
        const body: ScanStatusResponse = { status: "error", error: scanError("timeout") };
        return json(body);
      }
      const body: ScanStatusResponse = { status: "pending" };
      return json(body);
    });

  /** PUT /api/scan/mock-upload: accepts and discards the bytes so the browser flow matches live mode. */
  const mockUpload = (request: Request) =>
    guarded(async () => {
      if (mode !== "mock") return new Response(null, { status: 404 });
      const declared = Number(request.headers.get("content-length") ?? 0);
      if (declared > MOCK_UPLOAD_LIMIT) return errorResponse(scanError("image_too_large"));
      let received = 0;
      const reader = request.body?.getReader();
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.byteLength;
        if (received > MOCK_UPLOAD_LIMIT) {
          await reader.cancel();
          return errorResponse(scanError("image_too_large"));
        }
      }
      return new Response(null, { status: 200, headers: { "Cache-Control": "no-store" } });
    });

  return { upload, start, status, mockUpload };
}
