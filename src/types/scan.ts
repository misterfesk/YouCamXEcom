import type { SkinProfile } from "./skin";

export type ScanSource = "camera" | "upload" | "sample";

export const SAMPLE_FACES = ["oily", "dry", "mature"] as const;
export type SampleFaceId = (typeof SAMPLE_FACES)[number];

/** Steps of the scan modal; each is a screen the scan view renders. */
export type ScanStep = "intro" | "camera" | "upload" | "samples" | "preview" | "analyzing" | "reveal" | "error" | "unavailable";

/**
 * Plain-language error classes. YouCam codes (error_src_face_too_small, error_lighting_dark, …)
 * and our own failures map onto these; each has its own fix copy and actions.
 */
export type ScanErrorCode =
  | "face_too_small"
  | "face_out_of_frame"
  | "too_dark"
  | "face_angle"
  | "image_too_small"
  | "image_too_large"
  | "no_face"
  | "camera_denied"
  | "camera_unavailable"
  | "timeout"
  | "network"
  | "unknown";

/** Why live scanning is off right now (shown as a warm message + sample faces). */
export type ScanUnavailableReason = "daily_cap" | "reserve_reached" | "provider_out_of_credits";

/** Typed error body of every /api/scan* route; never carries upstream text. */
export type ScanApiError =
  | { kind: "scan_error"; code: ScanErrorCode }
  | { kind: "scan_unavailable"; reason: ScanUnavailableReason };

export interface ScanErrorBody {
  error: ScanApiError;
}

/** POST /api/scan/upload */
export interface ScanUploadRequest {
  contentType: "image/jpeg";
  fileSize: number;
  /** Lowercase hex sha256 of the exact bytes the browser will upload. */
  sha256: string;
}

export type ScanUploadResponse =
  | { cached: true; profile: SkinProfile }
  | {
      cached: false;
      fileId: string;
      upload: { url: string; method: "PUT"; headers: Record<string, string> };
    };

/** POST /api/scan */
export interface ScanStartRequest {
  fileId: string;
  sha256: string;
  source: "camera" | "upload";
}

export interface ScanStartResponse {
  scanId: string;
}

/** GET /api/scan/[scanId] */
export type ScanStatusResponse =
  | { status: "pending" }
  | { status: "done"; profile: SkinProfile }
  | { status: "error"; error: ScanApiError };
