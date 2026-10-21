import { afterEach, describe, expect, it, vi } from "vitest";
import { createScanLimits, type LimitsConfig, type ScanLimits } from "@/lib/server/limits";
import { createScanApi, POLL_TIMEOUT_MS } from "@/lib/server/scan-api";
import { signScanToken } from "@/lib/server/scan-token";
import { createMemoryStore } from "@/lib/server/store";
import { YouCamError } from "@/lib/youcam/errors";
import { createMockClient } from "@/lib/youcam/mock";
import type { YouCamClient } from "@/lib/youcam/types";
import type { ScanStatusResponse, ScanUploadResponse } from "@/types/scan";

const SECRET = "test-secret-0123456789";
const SHA = "d".repeat(64);
const START = Date.UTC(2026, 9, 21, 12, 0, 0);

function setup({
  env = {},
  limits = {},
  client,
  wrapLimits,
}: {
  env?: Record<string, string>;
  limits?: Partial<LimitsConfig>;
  client?: (base: YouCamClient) => YouCamClient;
  wrapLimits?: (base: ScanLimits) => ScanLimits;
} = {}) {
  let now = START;
  const clock = () => now;
  const base = createMockClient({ env: { YOUCAM_MOCK_FACE: "oily", ...env }, now: clock });
  const api = createScanApi({
    client: client ? client(base) : base,
    limits: (wrapLimits ?? ((base: ScanLimits) => base))(
      createScanLimits(
        createMemoryStore(clock),
        { capPerIp: 3, capGlobal: 20, reserveFloor: 425, reserveReleaseAt: START + 1e12, ...limits },
        clock,
      ),
    ),
    mode: "mock",
    secret: SECRET,
    now: clock,
  });
  return { api, advance: (ms: number) => (now += ms) };
}

const post = (body: unknown, ip = "203.0.113.7") =>
  new Request("http://localhost/api/scan", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

const uploadBody = (sha256 = SHA) => ({ contentType: "image/jpeg", fileSize: 400_000, sha256 });

async function startScan(api: ReturnType<typeof setup>["api"], sha256 = SHA, ip?: string) {
  const upload = (await (await api.upload(post(uploadBody(sha256), ip))).json()) as ScanUploadResponse;
  if (upload.cached) throw new Error("unexpected cache hit");
  const response = await api.start(post({ fileId: upload.fileId, sha256, source: "camera" }, ip));
  return { upload, response };
}

describe("scan flow in mock mode", () => {
  it("uploads, starts, polls and returns a normalized profile", async () => {
    const { api } = setup();
    const { upload, response } = await startScan(api);

    expect(upload.upload).toMatchObject({ url: "/api/scan/mock-upload", method: "PUT" });
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const { scanId } = (await response.json()) as { scanId: string };

    const poll = await api.status(scanId);
    expect(poll.status).toBe(200);
    expect(poll.headers.get("cache-control")).toBe("no-store");
    const body = (await poll.json()) as ScanStatusResponse;
    expect(body.status).toBe("done");
    if (body.status !== "done") return;
    expect(body.profile.source).toBe("camera");
    expect(body.profile.fitzpatrick).toBe("IV");
    expect(body.profile.concerns).toHaveLength(15);
    expect(body.profile.concerns[0].maskUrl).toBeTruthy();
  });

  it("serves the same photo from the hash cache without masks", async () => {
    const { api } = setup();
    const { response } = await startScan(api);
    const { scanId } = (await response.json()) as { scanId: string };
    await api.status(scanId);

    const second = await api.upload(post(uploadBody()));
    const body = (await second.json()) as ScanUploadResponse;
    expect(body.cached).toBe(true);
    if (!body.cached) return;
    expect(body.profile.fitzpatrick).toBe("IV");
    expect(body.profile.concerns.every((c) => c.maskUrl === undefined)).toBe(true);
  });

  it("accepts and discards the mock upload body", async () => {
    const { api } = setup();
    const ok = await api.mockUpload(new Request("http://localhost/api/scan/mock-upload", { method: "PUT", body: new Uint8Array(1024) }));
    expect(ok.status).toBe(200);
    const tooBig = await api.mockUpload(
      new Request("http://localhost/api/scan/mock-upload", { method: "PUT", body: new Uint8Array(3 * 1024 * 1024) }),
    );
    expect(tooBig.status).toBe(413);
  });

  it("reports pending until the provider finishes", async () => {
    const { api, advance } = setup({ env: { YOUCAM_MOCK_SCENARIO: "slow" } });
    const { response } = await startScan(api);
    const { scanId } = (await response.json()) as { scanId: string };
    expect(await (await api.status(scanId)).json()).toEqual({ status: "pending" });
    advance(7_000);
    expect(((await (await api.status(scanId)).json()) as ScanStatusResponse).status).toBe("done");
  });

  it("reports a timeout when still pending after 60 seconds", async () => {
    const { api, advance } = setup({
      client: (base) => ({ ...base, pollSkinAnalysis: async () => ({ status: "pending" }) }),
    });
    const { response } = await startScan(api);
    const { scanId } = (await response.json()) as { scanId: string };
    expect(await (await api.status(scanId)).json()).toEqual({ status: "pending" });
    advance(POLL_TIMEOUT_MS + 1000);
    expect(await (await api.status(scanId)).json()).toEqual({
      status: "error",
      error: { kind: "scan_error", code: "timeout" },
    });
  });
});

describe("typed errors", () => {
  it.each([
    ["face_too_small", "face_too_small"],
    ["too_dark", "too_dark"],
  ])("returns the %s task failure as a scan error", async (scenario, code) => {
    const { api } = setup({ env: { YOUCAM_MOCK_SCENARIO: scenario } });
    const { response } = await startScan(api);
    const { scanId } = (await response.json()) as { scanId: string };
    const body = await (await api.status(scanId)).json();
    expect(body).toEqual({ status: "error", error: { kind: "scan_error", code } });
  });

  it("maps provider out-of-credits to unavailable and gives the cap slot back", async () => {
    const { api } = setup({ env: { YOUCAM_MOCK_SCENARIO: "unavailable" }, limits: { capPerIp: 1 } });
    const first = await startScan(api);
    expect(first.response.status).toBe(503);
    expect(await first.response.json()).toEqual({
      error: { kind: "scan_unavailable", reason: "provider_out_of_credits" },
    });
    // the failed start must not have consumed the visitor's only scan
    const second = await startScan(api);
    expect(second.response.status).toBe(503);
  });

  it("keeps the slot and units when a task start fails ambiguously", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { api } = setup({
      limits: { capPerIp: 1 },
      client: (base) => ({
        ...base,
        startSkinAnalysis: async () => {
          throw new YouCamError({ kind: "scan_error", code: "network" }, "timeout", true);
        },
      }),
    });
    const first = await startScan(api);
    expect(first.response.status).toBe(502);
    const second = await api.upload(post(uploadBody("4".repeat(64))));
    expect(second.status).toBe(429);
  });

  it("keeps the slot when only one task started", async () => {
    const { api } = setup({
      limits: { capPerIp: 1 },
      client: (base) => ({
        ...base,
        startFitzpatrick: async () => {
          throw new YouCamError({ kind: "scan_error", code: "unknown" }, "rejected");
        },
      }),
    });
    expect((await startScan(api)).response.status).toBe(500);
    expect((await api.upload(post(uploadBody("4".repeat(64))))).status).toBe(429);
  });

  it("holds credit units for started scans and refuses once the reserve is spent", async () => {
    // balance 800, floor 740: two scans fit (800 - 52 >= 740), the third does not
    const { api } = setup({ limits: { reserveFloor: 740, capPerIp: 10 } });
    expect((await startScan(api, "5".repeat(64))).response.status).toBe(200);
    expect((await startScan(api, "6".repeat(64))).response.status).toBe(200);
    const blocked = await api.start(post({ fileId: "x", sha256: "7".repeat(64), source: "camera" }));
    expect(blocked.status).toBe(503);
    expect(await blocked.json()).toEqual({ error: { kind: "scan_unavailable", reason: "reserve_reached" } });
  });

  it("returns the profile even when the result cache write fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { api } = setup({
      wrapLimits: (base) => ({
        ...base,
        cacheProfile: async () => {
          throw new Error("store down");
        },
      }),
    });
    const { response } = await startScan(api);
    const { scanId } = (await response.json()) as { scanId: string };
    const body = (await (await api.status(scanId)).json()) as ScanStatusResponse;
    expect(body.status).toBe("done");
  });

  it("does not serve one visitor's cached result to another", async () => {
    const { api } = setup();
    const { response } = await startScan(api, SHA, "203.0.113.1");
    const { scanId } = (await response.json()) as { scanId: string };
    await api.status(scanId);
    const same = (await (await api.upload(post(uploadBody(), "203.0.113.1"))).json()) as ScanUploadResponse;
    const other = (await (await api.upload(post(uploadBody(), "203.0.113.2"))).json()) as ScanUploadResponse;
    expect(same.cached).toBe(true);
    expect(other.cached).toBe(false);
  });

  it("stops at the per-IP cap with a 429", async () => {
    const { api } = setup({ limits: { capPerIp: 1 } });
    expect((await startScan(api, "e".repeat(64))).response.status).toBe(200);
    const blockedUpload = await api.upload(post(uploadBody("f".repeat(64))));
    expect(blockedUpload.status).toBe(429);
    expect(await blockedUpload.json()).toEqual({ error: { kind: "scan_unavailable", reason: "daily_cap" } });
    const blockedStart = await api.start(post({ fileId: "x", sha256: SHA, source: "upload" }));
    expect(blockedStart.status).toBe(429);
    // another visitor is unaffected
    expect((await startScan(api, "1".repeat(64), "198.51.100.9")).response.status).toBe(200);
  });

  it("stops at the global cap", async () => {
    const { api } = setup({ limits: { capGlobal: 1 } });
    expect((await startScan(api, "2".repeat(64), "198.51.100.1")).response.status).toBe(200);
    const blocked = await api.upload(post(uploadBody("3".repeat(64)), "198.51.100.2"));
    expect(await blocked.json()).toEqual({ error: { kind: "scan_unavailable", reason: "daily_cap" } });
  });

  it("refuses when the credit reserve would be crossed", async () => {
    const { api } = setup({ limits: { reserveFloor: 790 } });
    const blocked = await api.upload(post(uploadBody()));
    expect(blocked.status).toBe(503);
    expect(await blocked.json()).toEqual({ error: { kind: "scan_unavailable", reason: "reserve_reached" } });
  });

  it("validates upload bodies", async () => {
    const { api } = setup();
    const png = await api.upload(post({ ...uploadBody(), contentType: "image/png" }));
    expect(png.status).toBe(415);
    const big = await api.upload(post({ ...uploadBody(), fileSize: 3 * 1024 * 1024 }));
    expect(big.status).toBe(413);
    expect(await big.json()).toEqual({ error: { kind: "scan_error", code: "image_too_large" } });
    const badHash = await api.upload(post({ ...uploadBody(), sha256: "nope" }));
    expect(badHash.status).toBe(400);
    const notJson = await api.upload(post("{oops"));
    expect(notJson.status).toBe(400);
  });

  it("validates start bodies", async () => {
    const { api } = setup();
    expect((await api.start(post({ fileId: "", sha256: SHA, source: "camera" }))).status).toBe(400);
    expect((await api.start(post({ fileId: "f", sha256: SHA, source: "sample" }))).status).toBe(400);
  });

  it("rejects bad and expired scan ids", async () => {
    const { api, advance } = setup();
    expect((await api.status("garbage")).status).toBe(400);
    const token = signScanToken(
      { skinTaskId: "mock.skin.oily.success.1", fitzTaskId: "mock.fitz.oily.success.1", source: "camera", sha256: SHA, ipHash: "a".repeat(32) },
      SECRET,
      START,
    );
    expect((await api.status(`${token}x`)).status).toBe(400);
    advance(60 * 60 * 1000);
    const expired = await api.status(token);
    expect(expired.status).toBe(410);
    expect(await expired.json()).toEqual({ error: { kind: "scan_error", code: "unknown" } });
  });

  it("never leaks upstream messages", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { api } = setup({
      client: (base) => ({
        ...base,
        startSkinAnalysis: async () => {
          throw new Error("secret upstream detail sk-123");
        },
      }),
    });
    const { response } = await startScan(api);
    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toBe(JSON.stringify({ error: { kind: "scan_error", code: "unknown" } }));
  });

  it("hides the mock upload sink outside mock mode", async () => {
    const api = createScanApi({
      client: createMockClient({ env: {} }),
      limits: createScanLimits(createMemoryStore(), { capPerIp: 1, capGlobal: 1, reserveFloor: 0, reserveReleaseAt: 0 }),
      mode: "live",
      secret: SECRET,
    });
    const res = await api.mockUpload(new Request("http://localhost/x", { method: "PUT", body: "x" }));
    expect(res.status).toBe(404);
  });
});

describe("route modules", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("run end to end from the environment", async () => {
    vi.stubEnv("YOUCAM_MODE", "mock");
    vi.stubEnv("YOUCAM_MOCK_FACE", "dry");
    vi.stubEnv("YOUCAM_MOCK_SCENARIO", "success");
    const upload = await import("@/app/api/scan/upload/route");
    const scan = await import("@/app/api/scan/route");
    const status = await import("@/app/api/scan/[scanId]/route");
    const sink = await import("@/app/api/scan/mock-upload/route");

    const sha256 = "9".repeat(64);
    const ip = "192.0.2.55";
    const uploaded = (await (await upload.POST(post({ contentType: "image/jpeg", fileSize: 1000, sha256 }, ip))).json()) as {
      fileId: string;
    };
    expect((await sink.PUT(new Request("http://localhost/api/scan/mock-upload", { method: "PUT", body: "x" }))).status).toBe(200);
    const started = (await (await scan.POST(post({ fileId: uploaded.fileId, sha256, source: "upload" }, ip))).json()) as {
      scanId: string;
    };
    const res = await status.GET(new Request("http://localhost/api/scan/x"), {
      params: Promise.resolve({ scanId: started.scanId }),
    });
    const body = (await res.json()) as ScanStatusResponse;
    expect(body.status).toBe("done");
    if (body.status === "done") expect(body.profile.fitzpatrick).toBe("II");
  });

  it("refuse live mode on per-instance memory unless opted in", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubEnv("YOUCAM_MODE", "live");
    vi.stubEnv("YOUCAM_API_KEY", "k");
    vi.stubEnv("SCAN_TOKEN_SECRET", "s".repeat(32));
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    vi.stubEnv("SCAN_STORE", "");
    const upload = await import("@/app/api/scan/upload/route");
    const res = await upload.POST(post(uploadBody()));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: { kind: "scan_error", code: "unknown" } });
  });

  it("answer misconfigured live mode with a typed error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubEnv("YOUCAM_MODE", "live");
    vi.stubEnv("YOUCAM_API_KEY", "");
    const upload = await import("@/app/api/scan/upload/route");
    const res = await upload.POST(post(uploadBody()));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: { kind: "scan_error", code: "unknown" } });
  });
});
