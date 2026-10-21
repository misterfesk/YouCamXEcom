/** The YouCam key must never reach the browser; fail loudly if this code is bundled client-side. */
export function assertServerOnly(): void {
  if (typeof window !== "undefined") {
    throw new Error("lib/youcam is server-only");
  }
}
