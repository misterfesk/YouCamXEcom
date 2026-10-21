import { describe, expect, it, vi } from "vitest";
import { createYouCamClient, YouCamConfigError } from "@/lib/youcam";
import { createLiveClient } from "@/lib/youcam/client";
import { YouCamError } from "@/lib/youcam/errors";
import { createMockClient } from "@/lib/youcam/mock";
import { CONCERNS } from "@/types/skin";
import oilyFitz from "../../fixtures/youcam/fitzpatrick.oily.json";
import belowMin from "../../fixtures/youcam/skin-analysis.error.below-min-size.json";
import tooSmall from "../../fixtures/youcam/skin-analysis.error.face-too-small.json";
import tooDark from "../../fixtures/youcam/skin-analysis.error.lighting-dark.json";
import oilySkin from "../../fixtures/youcam/skin-analysis.oily.json";

type FetchMock = ReturnType<typeof vi.fn<typeof fetch>>;

function liveClient(fetchMock: FetchMock, backoffMs: readonly number[] = [10, 20]) {
  const sleep = vi.fn<(ms: number) => Promise<void>>(async () => {});
  const client = createLiveClient({
    apiKey: "test-key",
    baseUrl: "https://api.test",
    fetch: fetchMock,
    sleep,
    backoffMs,
  });
  return { client, sleep };
}

const reply = (body: unknown, status = 200) => Response.json(body, { status });

describe("live client", () => {
  it("creates a file and strips browser-controlled headers", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () =>
      reply({
        status: 200,
        data: {
          files: [
            {
              file_id: "f1",
              requests: [
                {
                  method: "PUT",
                  url: "https://s3.test/put",
                  headers: { "Content-Type": "image/jpeg", "Content-Length": "123" },
                },
              ],
            },
          ],
        },
      }),
    );
    const { client } = liveClient(fetchMock);
    const file = await client.createFile({ contentType: "image/jpeg", fileSize: 123 });
    expect(file).toEqual({
      fileId: "f1",
      upload: { url: "https://s3.test/put", method: "PUT", headers: { "Content-Type": "image/jpeg" } },
    });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.test/s2s/v2.0/file");
    expect((init?.headers as Record<string, string>).Authorization).toBe("Bearer test-key");
    expect(JSON.parse(init?.body as string)).toMatchObject({
      files: [{ content_type: "image/jpeg", file_size: 123 }],
    });
  });

  it("starts skin analysis with all concerns and Fitzpatrick with version 1.0", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => reply({ status: 200, data: { task_id: "t1" } }));
    const { client } = liveClient(fetchMock);
    expect(await client.startSkinAnalysis("f1")).toBe("t1");
    expect(await client.startFitzpatrick("f1")).toBe("t1");

    const [skinUrl, skinInit] = fetchMock.mock.calls[0];
    expect(skinUrl).toBe("https://api.test/s2s/v2.0/task/skin-analysis");
    expect(JSON.parse(skinInit?.body as string)).toEqual({
      src_file_id: "f1",
      dst_actions: [...CONCERNS, "skin_type"],
      miniserver_args: { enable_mask_overlay: false },
      format: "json",
    });
    const [fitzUrl, fitzInit] = fetchMock.mock.calls[1];
    expect(fitzUrl).toBe("https://api.test/s2s/v2.0/task/fitzpatrick-scale-analyzer");
    expect(JSON.parse(fitzInit?.body as string)).toEqual({ src_file_id: "f1", version: "1.0" });
  });

  it("parses recorded skin analysis and Fitzpatrick results", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(reply(oilySkin))
      .mockResolvedValueOnce(reply(oilyFitz));
    const { client } = liveClient(fetchMock);

    const skin = await client.pollSkinAnalysis("t1");
    expect(skin.status).toBe("success");
    if (skin.status === "success") {
      const acne = skin.result.find((item) => item.type === "acne");
      expect(acne?.raw_score).toBeCloseTo(56.631);
      expect(skin.result.filter((item) => item.type === "skin_type")).toHaveLength(3);
    }
    expect(await client.pollFitzpatrick("t2")).toEqual({ status: "success", result: "IV" });
  });

  it.each([
    [tooSmall, "face_too_small"],
    [tooDark, "too_dark"],
    [belowMin, "image_too_small"],
  ])("maps recorded task errors", async (fixture, code) => {
    const { client } = liveClient(vi.fn<typeof fetch>(async () => reply(fixture)));
    expect(await client.pollSkinAnalysis("t1")).toEqual({
      status: "error",
      failure: { kind: "scan_error", code },
    });
  });

  it("reports running tasks as pending", async () => {
    const body = { status: 200, data: { task_status: "running", error: null, results: null } };
    const { client } = liveClient(vi.fn<typeof fetch>(async () => reply(body)));
    expect(await client.pollFitzpatrick("t1")).toEqual({ status: "pending" });
  });

  it("rejects malformed success payloads", async () => {
    const body = { status: 200, data: { task_status: "success", error: null, results: { nope: true } } };
    const { client } = liveClient(vi.fn<typeof fetch>(async () => reply(body)));
    await expect(client.pollFitzpatrick("t1")).rejects.toMatchObject({
      failure: { kind: "scan_error", code: "unknown" },
    });
  });

  it("sums every credit entry", async () => {
    const body = { status: 200, results: [{ amount_dec: 800 }, { amount_dec: "51.5" }, { amount_dec: 0 }] };
    const fetchMock = vi.fn<typeof fetch>(async () => reply(body));
    const { client } = liveClient(fetchMock);
    expect(await client.getCreditBalance()).toBe(851.5);
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.test/s2s/v1.0/client/credit");
  });
});

describe("retry and backoff", () => {
  it("retries network errors and 5xx twice, then succeeds", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(reply({}, 503))
      .mockResolvedValueOnce(reply({ status: 200, results: [{ amount_dec: 5 }] }));
    const { client, sleep } = liveClient(fetchMock);
    expect(await client.getCreditBalance()).toBe(5);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(sleep.mock.calls.map(([ms]) => ms)).toEqual([10, 20]);
  });

  it("gives up with a network error after two retries", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(new TypeError("fetch failed"));
    const { client } = liveClient(fetchMock);
    await expect(client.getCreditBalance()).rejects.toMatchObject({
      failure: { kind: "scan_error", code: "network" },
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("does not retry client errors and maps their code", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => reply({ error: "error_insufficient_units" }, 400));
    const { client, sleep } = liveClient(fetchMock);
    const failure = await client.startSkinAnalysis("f1").catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(YouCamError);
    expect((failure as YouCamError).failure).toEqual({ kind: "out_of_credits" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });

  it("treats HTTP 402 as out of credits", async () => {
    const { client } = liveClient(vi.fn<typeof fetch>(async () => reply({}, 402)));
    await expect(client.startFitzpatrick("f1")).rejects.toMatchObject({ failure: { kind: "out_of_credits" } });
  });

  it("never puts the key or upstream text in error messages", async () => {
    const { client } = liveClient(vi.fn<typeof fetch>(async () => reply({ error: "boom" }, 500)));
    const error = (await client.getCreditBalance().catch((e: unknown) => e)) as YouCamError;
    expect(error.message).not.toContain("test-key");
    expect(error.failure).toEqual({ kind: "scan_error", code: "network" });
  });
});

describe("mock client", () => {
  const env = (extra: Record<string, string> = {}) => ({ YOUCAM_MOCK_FACE: "oily", ...extra });

  it("serves the recorded fixtures", async () => {
    const client = createMockClient({ env: env() });
    const skinId = await client.startSkinAnalysis("mock-file");
    const fitzId = await client.startFitzpatrick("mock-file");
    expect((await client.pollSkinAnalysis(skinId)).status).toBe("success");
    expect(await client.pollFitzpatrick(fitzId)).toEqual({ status: "success", result: "IV" });
    expect(await client.getCreditBalance()).toBeGreaterThan(0);
  });

  it("points uploads at the mock sink", async () => {
    const file = await createMockClient({ env: env() }).createFile({ contentType: "image/jpeg", fileSize: 10 });
    expect(file.upload.url).toBe("/api/scan/mock-upload");
  });

  it("picks the same face for the same file id", async () => {
    const client = createMockClient({ env: {} });
    const a = await client.startSkinAnalysis("same");
    const b = await client.startSkinAnalysis("same");
    expect(a.split(".")[2]).toBe(b.split(".")[2]);
  });

  it.each([
    ["face_too_small", "face_too_small"],
    ["too_dark", "too_dark"],
  ])("scenario %s fails the skin task", async (scenario, code) => {
    const client = createMockClient({ env: env({ YOUCAM_MOCK_SCENARIO: scenario }) });
    const id = await client.startSkinAnalysis("f");
    expect(await client.pollSkinAnalysis(id)).toEqual({ status: "error", failure: { kind: "scan_error", code } });
  });

  it("scenario unavailable runs out of credits when tasks start", async () => {
    const client = createMockClient({ env: env({ YOUCAM_MOCK_SCENARIO: "unavailable" }) });
    await expect(client.startSkinAnalysis("f")).rejects.toMatchObject({ failure: { kind: "out_of_credits" } });
  });

  it("scenario slow stays pending until the delay passes", async () => {
    let now = 1_000_000;
    const client = createMockClient({ env: env({ YOUCAM_MOCK_SCENARIO: "slow" }), now: () => now });
    const id = await client.startSkinAnalysis("f");
    expect(await client.pollSkinAnalysis(id)).toEqual({ status: "pending" });
    now += 10_000;
    expect((await client.pollSkinAnalysis(id)).status).toBe("success");
  });

  it("rejects task ids it did not issue", async () => {
    await expect(createMockClient({ env: env() }).pollSkinAnalysis("real-task")).rejects.toBeInstanceOf(YouCamError);
  });
});

describe("createYouCamClient", () => {
  it("defaults to mock and needs no key", async () => {
    expect(await createYouCamClient({}).getCreditBalance()).toBeGreaterThan(0);
  });

  it("refuses live mode without a key", () => {
    expect(() => createYouCamClient({ YOUCAM_MODE: "live" })).toThrow(YouCamConfigError);
  });
});
