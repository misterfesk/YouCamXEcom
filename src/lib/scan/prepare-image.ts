import type { ScanErrorCode } from "@/types/scan";

/** Upload limits: what we accept from the picker, and what we send to YouCam. */
export const INPUT_MAX_BYTES = 15 * 1024 * 1024;
export const UPLOAD_MAX_BYTES = 2.5 * 1024 * 1024;
const LONG_SIDE_MAX = 2560;
/** Short side: uploads need a sharp photo; Camera Kit frames are SD-sized by design. */
export const MIN_SHORT_SIDE = { upload: 1080, camera: 480 } as const;
const INPUT_TYPES = ["image/jpeg", "image/png", "image/webp"];

export class ImageCheckError extends Error {
  constructor(readonly code: ScanErrorCode) {
    super(code);
  }
}

export interface PreparedImage {
  blob: Blob;
  sha256: string;
}

async function sha256Hex(blob: Blob): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Target size: fit the long side, never upscale. */
export function fitSize(width: number, height: number, longMax = LONG_SIDE_MAX) {
  const scale = Math.min(1, longMax / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/**
 * Checks and re-encodes a photo in the browser: JPEG (Fitzpatrick needs it), long side ≤ 2560,
 * ≤ 2.5 MB by stepping quality down. The hash lets the server reuse an earlier result.
 */
export async function prepareImage(
  input: Blob,
  source: keyof typeof MIN_SHORT_SIDE,
): Promise<PreparedImage> {
  if (input.type && !INPUT_TYPES.includes(input.type)) throw new ImageCheckError("unknown");
  if (input.size > INPUT_MAX_BYTES) throw new ImageCheckError("image_too_large");
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(input, { imageOrientation: "from-image" });
  } catch {
    throw new ImageCheckError("unknown");
  }
  try {
    if (Math.min(bitmap.width, bitmap.height) < MIN_SHORT_SIDE[source])
      throw new ImageCheckError("image_too_small");
    const { width, height } = fitSize(bitmap.width, bitmap.height);
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext("2d");
    if (!context) throw new ImageCheckError("unknown");
    context.drawImage(bitmap, 0, 0, width, height);
    for (const quality of [0.92, 0.85, 0.78, 0.7, 0.6]) {
      const blob = await canvas.convertToBlob({ type: "image/jpeg", quality });
      if (blob.size <= UPLOAD_MAX_BYTES) return { blob, sha256: await sha256Hex(blob) };
    }
    throw new ImageCheckError("image_too_large");
  } finally {
    bitmap.close();
  }
}

/** Camera Kit hands back a data URL (or Blob); turn either into a Blob. */
export async function toBlob(image: string | Blob): Promise<Blob> {
  return typeof image === "string" ? (await fetch(image)).blob() : image;
}
