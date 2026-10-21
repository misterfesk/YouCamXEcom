import type { ScanErrorCode } from "@/types/scan";

/** What went wrong, in our vocabulary. `out_of_credits` becomes an unavailable reason, not a scan error. */
export type YouCamFailure =
  | { kind: "scan_error"; code: ScanErrorCode }
  | { kind: "out_of_credits" };

export class YouCamError extends Error {
  readonly failure: YouCamFailure;
  /** True when the provider may have acted on the request despite the failure (timeout, 5xx, unreadable reply). */
  readonly ambiguous: boolean;
  constructor(failure: YouCamFailure, message: string, ambiguous = false) {
    super(message);
    this.ambiguous = ambiguous;
    this.name = "YouCamError";
    this.failure = failure;
  }
}

export const scanFailure = (code: ScanErrorCode): YouCamFailure => ({ kind: "scan_error", code });

const OUT_OF_CREDITS =
  /(insufficient|not_enough|out_of|exhaust|exceed)\w*(credit|unit|quota)|(credit|unit|quota)\w*(insufficient|not_enough|exhaust|exceed|expired)/;

const EXACT: Record<string, ScanErrorCode> = {
  error_src_face_too_small: "face_too_small",
  error_src_face_out_of_bound: "face_out_of_frame",
  error_lighting_dark: "too_dark",
  error_face_angle_invalid: "face_angle",
  error_below_min_image_size: "image_too_small",
};

/** Maps a YouCam error code (task `error` field or HTTP error body) onto our failure classes. */
export function failureFromCode(code: string | null | undefined, httpStatus?: number): YouCamFailure {
  const key = (code ?? "").toLowerCase();
  if (httpStatus === 402 || OUT_OF_CREDITS.test(key)) return { kind: "out_of_credits" };
  const exact = EXACT[key];
  if (exact) return scanFailure(exact);
  if (key.includes("face_too_small")) return scanFailure("face_too_small");
  if (key.includes("out_of_bound")) return scanFailure("face_out_of_frame");
  if (key.includes("lighting") || key.includes("too_dark")) return scanFailure("too_dark");
  if (key.includes("angle")) return scanFailure("face_angle");
  if (key.includes("min_image_size") || key.includes("below_min")) return scanFailure("image_too_small");
  if (/(max|exceed|large)\w*(size|resolution)|file_too_large/.test(key)) return scanFailure("image_too_large");
  if (/no_face|no_faces|face_not|not_detect|face_missing/.test(key)) return scanFailure("no_face");
  return scanFailure("unknown");
}
