import type { CameraChecks } from "@/types/scan-view";
import type { ScanErrorCode } from "@/types/scan";

const SDK_URL = "https://plugins-media.makeupar.com/v2.5-camera-kit/sdk.js";
/** Mount point the SDK renders into; it must exist before openCameraKit(). */
export const CAMERA_KIT_MOUNT_ID = "YMK-module";
const LOAD_TIMEOUT_MS = 15_000;
const RETRY_OPEN_MS = 5_000;

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
let openedBefore = false;

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
  /** Manual capture: the kit has no capture method, so grab the live video frame. */
  capture: () => Promise<Blob | undefined>;
  close: () => void;
}

/**
 * Opens the kit in skincare (SD) mode inside the mount point. Auto-capture arrives via
 * onCaptured after the kit's own countdown; checks stream into onChecks.
 */
export async function openCameraSession(handlers: {
  signal: AbortSignal;
  width: number;
  height: number;
  onChecks: (checks: CameraChecks) => void;
  onReady: () => void;
  onCaptured: (image: string | Blob) => void;
  onError: (code: ScanErrorCode) => void;
}): Promise<CameraSession> {
  const firstOpen = !openedBefore;
  openedBefore = true;
  const ymk = await loadCameraKit();
  handlers.signal.throwIfAborted();
  let closed = false;
  let answered = false;
  let retry: ReturnType<typeof setTimeout> | undefined;
  const answer = () => {
    answered = true;
    clearTimeout(retry);
  };
  const ids = [
    ymk.addEventListener("faceQualityChanged", (q: Quality) => handlers.onChecks(toChecks(q))),
    ymk.addEventListener("loaded", () => {
      answer();
      handlers.onReady();
    }),
    ymk.addEventListener("faceDetectionCaptured", (result: Captured) => {
      const first = result.images?.[0];
      if (first) handlers.onCaptured(first.image);
    }),
    ymk.addEventListener("cameraFailed", (code: string) => {
      answer();
      handlers.onError(CAMERA_ERRORS[code] ?? "camera_unavailable");
    }),
    ymk.addEventListener("unsupportedResolution", () => {
      answer();
      handlers.onError("camera_unavailable");
    }),
  ];
  const close = () => {
    if (closed) return;
    closed = true;
    clearTimeout(retry);
    ids.forEach((id) => ymk.removeEventListener(id));
    ymk.close();
    handlers.signal.removeEventListener("abort", close);
  };
  handlers.signal.addEventListener("abort", close, { once: true });
  const open = () => {
    ymk.init({
      faceDetectionMode: "skincare",
      imageFormat: "blob",
      language: "enu",
      qualityLevel: "moderate",
      // Phones get 720p (still above the camera minimum); 1080p lags on older ones.
      videoQuality: Math.min(screen.width, screen.height) < 768 ? "720p" : "1080p",
      countingDuration: 1500,
      width: Math.round(Math.min(1920, Math.max(300, handlers.width))),
      height: Math.round(Math.min(1920, Math.max(300, handlers.height))),
    });
    ymk.openCameraKit();
  };
  try {
    open();
  } catch (error) {
    close();
    throw error;
  }
  // The kit can ignore its first open on a page without any event; a second open works,
  // so do that once for the user instead of leaving a blank camera.
  if (firstOpen) {
    retry = setTimeout(() => {
      if (closed || answered) return;
      try {
        ymk.close();
        open();
      } catch {
        handlers.onError("camera_unavailable");
      }
    }, RETRY_OPEN_MS);
  }
  return {
    capture: async () => {
      if (closed) return undefined;
      const mount = document.getElementById(CAMERA_KIT_MOUNT_ID);
      // The kit's WebGL canvas reads back black, so draw the live video frame instead.
      const video = mount?.querySelector("video");
      const source = video && video.videoWidth > 0 ? video : mount?.querySelector("canvas");
      if (!source) return undefined;
      const width = source instanceof HTMLVideoElement ? source.videoWidth : source.width;
      const height = source instanceof HTMLVideoElement ? source.videoHeight : source.height;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context || !width || !height) return undefined;
      context.drawImage(source, 0, 0, width, height);
      if (isBlank(context, width, height)) return undefined;
      return new Promise<Blob | undefined>((resolve) =>
        canvas.toBlob((blob) => resolve(blob && blob.size > 0 ? blob : undefined), "image/jpeg", 0.92),
      );
    },
    close,
  };
}

/** True when a frame is (almost) all black, which means the read failed, not a dark room. */
function isBlank(context: CanvasRenderingContext2D, width: number, height: number): boolean {
  const { data } = context.getImageData(0, 0, width, height);
  const step = 4 * Math.max(1, Math.floor((width * height) / 4096));
  for (let i = 0; i < data.length; i += step) {
    if (data[i] > 8 || data[i + 1] > 8 || data[i + 2] > 8) return false;
  }
  return true;
}
