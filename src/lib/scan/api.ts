import type {
  ScanApiError,
  ScanErrorBody,
  ScanStartResponse,
  ScanStatusResponse,
  ScanUploadResponse,
} from "@/types/scan";
import type { SkinProfile } from "@/types/skin";
import type { PreparedImage } from "./prepare-image";

const POLL_MS = 1500;
/** The server times a scan out at 60 s; stop a little later as a safety net. */
const CLIENT_TIMEOUT_MS = 75_000;

/** Every failure the controller has to show: a fixable scan error or "scanner resting". */
export class ScanFailure extends Error {
  constructor(readonly error: ScanApiError) {
    super(error.kind);
  }
}

const network = () => new ScanFailure({ kind: "scan_error", code: "network" });

async function call<T>(input: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(input, init);
  } catch (error) {
    if ((error as Error).name === "AbortError") throw error;
    throw network();
  }
  const body = (await response.json().catch(() => undefined)) as T | ScanErrorBody | undefined;
  if (body && typeof body === "object" && "error" in body && body.error) throw new ScanFailure(body.error);
  if (!response.ok || !body) throw network();
  return body as T;
}

const json = (body: unknown, signal: AbortSignal): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
  signal,
});

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });

/**
 * Full live scan: get an upload slot (or a cached result for the same photo), PUT the photo
 * straight to YouCam, start both analyses, then poll until done. Stages: 0 upload, 1 analysing.
 */
export async function runLiveScan(
  image: PreparedImage,
  source: "camera" | "upload",
  { signal, onStage }: { signal: AbortSignal; onStage: (stage: number) => void },
): Promise<SkinProfile> {
  onStage(0);
  const slot = await call<ScanUploadResponse>(
    "/api/scan/upload",
    json({ contentType: "image/jpeg", fileSize: image.blob.size, sha256: image.sha256 }, signal),
  );
  if (slot.cached) return slot.profile;

  try {
    const put = await fetch(slot.upload.url, {
      method: slot.upload.method,
      headers: slot.upload.headers,
      body: image.blob,
      signal,
    });
    if (!put.ok) throw network();
  } catch (error) {
    if ((error as Error).name === "AbortError") throw error;
    throw network();
  }

  const { scanId } = await call<ScanStartResponse>(
    "/api/scan",
    json({ fileId: slot.fileId, sha256: image.sha256, source }, signal),
  );
  onStage(1);
  const deadline = Date.now() + CLIENT_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await sleep(POLL_MS, signal);
    const status = await call<ScanStatusResponse>(`/api/scan/${encodeURIComponent(scanId)}`, {
      signal,
      cache: "no-store",
    });
    if (status.status === "done") return status.profile;
    if (status.status === "error") throw new ScanFailure(status.error);
  }
  throw new ScanFailure({ kind: "scan_error", code: "timeout" });
}
