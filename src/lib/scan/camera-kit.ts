import type { CameraChecks } from "@/types/scan-view";
import type { ScanErrorCode } from "@/types/scan";

const SDK_URL = "https://plugins-media.makeupar.com/v2.5-camera-kit/sdk.js";
/** Mount point the SDK renders into; it must exist before openCameraKit(). */
export const CAMERA_KIT_MOUNT_ID = "YMK-module";
const LOAD_TIMEOUT_MS = 15_000;

type Quality = { hasFace: boolean; position: string; frontal: string; lighting: string };
type Captured = { images: { image: string | Blob; width: number; height: number }[] };
type Ymk = {
  init: (args: Record<string, unknown>) => void;
  openCameraKit: () => void;
  close: () => void;
  addEventListener: (event: string, callback: (payload: never) => void) => unknown;
  removeEventListener: (id: unknown) => void;
};
declare global {
  interface Window {
    YMK?: Ymk;
    YMKAsyncInit?: () => void;
  }
}

let loading: Promise<Ymk> | undefined;

/** Loads the YouCam JS Camera Kit once, on demand (never on page load). */
export function loadCameraKit(): Promise<Ymk> {
  if (window.YMK) return Promise.resolve(window.YMK);
  loading ??= new Promise<Ymk>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), LOAD_TIMEOUT_MS);
    window.YMKAsyncInit = () => {
      clearTimeout(timer);
      if (window.YMK) resolve(window.YMK);
      else reject(new Error("missing"));
    };
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onerror = () => {
      clearTimeout(timer);
      reject(new Error("network"));
    };
    document.head.append(script);
  }).catch((error) => {
    loading = undefined;
    throw error;
  });
  return loading;
}

export const toChecks = (q: Quality): CameraChecks => ({
  hasFace: q.hasFace,
  position: q.position === "good",
  frontal: q.frontal === "good",
  lighting: q.lighting === "good" || q.lighting === "ok",
});

const CAMERA_ERRORS: Record<string, ScanErrorCode> = {
  error_permission_denied: "camera_denied",
  error_access_failed: "camera_unavailable",
  error_resolution_unsupported: "camera_unavailable",
};

export interface CameraSession {
  /** Manual capture: the kit has no capture method, so read its live canvas. */
  capture: () => Promise<Blob | undefined>;
  close: () => void;
}

/**
 * Opens the kit in skincare (SD) mode inside the mount point. Auto-capture arrives via
 * onCaptured after the kit's own countdown; checks stream into onChecks.
 */
export async function openCameraSession(handlers: {
  width: number;
  height: number;
  onChecks: (checks: CameraChecks) => void;
  onReady: () => void;
  onCaptured: (image: string | Blob) => void;
  onError: (code: ScanErrorCode) => void;
}): Promise<CameraSession> {
  const ymk = await loadCameraKit();
  const ids = [
    ymk.addEventListener("faceQualityChanged", (q: Quality) => handlers.onChecks(toChecks(q))),
    ymk.addEventListener("loaded", () => handlers.onReady()),
    ymk.addEventListener("faceDetectionCaptured", (result: Captured) => {
      const first = result.images?.[0];
      if (first) handlers.onCaptured(first.image);
    }),
    ymk.addEventListener("cameraFailed", (code: string) =>
      handlers.onError(CAMERA_ERRORS[code] ?? "camera_unavailable"),
    ),
    ymk.addEventListener("unsupportedResolution", () => handlers.onError("camera_unavailable")),
  ];
  ymk.init({
    faceDetectionMode: "skincare",
    imageFormat: "blob",
    language: "enu",
    qualityLevel: "moderate",
    videoQuality: "1080p",
    countingDuration: 1500,
    width: Math.round(Math.min(1920, Math.max(300, handlers.width))),
    height: Math.round(Math.min(1920, Math.max(300, handlers.height))),
  });
  ymk.openCameraKit();
  return {
    capture: () =>
      new Promise((resolve) => {
        const canvas = document.querySelector<HTMLCanvasElement>(`#${CAMERA_KIT_MOUNT_ID} canvas`);
        if (!canvas) return resolve(undefined);
        canvas.toBlob((blob) => resolve(blob ?? undefined), "image/jpeg", 0.92);
      }),
    close: () => {
      ids.forEach((id) => ymk.removeEventListener(id));
      ymk.close();
    },
  };
}
