import { afterEach, describe, expect, it, vi } from "vitest";
import { runLiveScan } from "@/lib/scan/api";
import { openCameraSession } from "@/lib/scan/camera-kit";

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("scan cancellation", () => {
  it("interrupts a stalled upload request at the deadline", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn((_url: string, init: RequestInit) => new Promise((_resolve, reject) => {
      init.signal!.addEventListener("abort", () => reject(init.signal!.reason), { once: true });
    })));
    const result = runLiveScan({ blob: new Blob(), sha256: "a".repeat(64) }, "upload", {
      signal: new AbortController().signal, onStage: vi.fn(),
    });
    const assertion = expect(result).rejects.toMatchObject({ error: { code: "timeout" } });
    await vi.advanceTimersByTimeAsync(75_000);
    await assertion;
  });

  it("preserves user cancellation rather than showing a timeout", async () => {
    const controller = new AbortController();
    vi.stubGlobal("fetch", vi.fn((_url: string, init: RequestInit) => new Promise((_resolve, reject) => {
      init.signal!.addEventListener("abort", () => reject(init.signal!.reason), { once: true });
    })));
    const result = runLiveScan({ blob: new Blob(), sha256: "a".repeat(64) }, "upload", {
      signal: controller.signal, onStage: vi.fn(),
    });
    const assertion = expect(result).rejects.toMatchObject({ name: "AbortError" });
    controller.abort();
    await assertion;
  });

  it("does not initialize the camera after leaving during SDK loading", async () => {
    const windowStub: { YMK?: unknown; YMKAsyncInit?: () => void } = {};
    vi.stubGlobal("window", windowStub);
    vi.stubGlobal("document", { createElement: () => ({}), head: { append: vi.fn() } });
    const controller = new AbortController();
    const init = vi.fn();
    const opening = openCameraSession({ signal: controller.signal, width: 390, height: 390,
      onReady: vi.fn(), onChecks: vi.fn(), onCaptured: vi.fn(), onError: vi.fn() });
    controller.abort();
    windowStub.YMK = { init };
    windowStub.YMKAsyncInit!();
    await expect(opening).rejects.toMatchObject({ name: "AbortError" });
    expect(init).not.toHaveBeenCalled();
  });
});
