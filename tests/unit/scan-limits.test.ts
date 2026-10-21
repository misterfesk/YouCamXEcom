import { describe, expect, it } from "vitest";
import { clientIp, createScanLimits, hashIp, limitsFromEnv, stripMasks } from "@/lib/server/limits";
import { createMemoryStore } from "@/lib/server/store";
import { SCAN_COST_UNITS } from "@/lib/youcam/constants";
import type { SkinProfile } from "@/types/skin";

const config = { capPerIp: 2, capGlobal: 3, reserveFloor: 100 };

function setup(overrides: Partial<typeof config> = {}) {
  let now = Date.UTC(2026, 9, 21, 12, 0, 0);
  const clock = () => now;
  const store = createMemoryStore(clock);
  const limits = createScanLimits(store, { ...config, ...overrides }, clock);
  return { limits, advance: (ms: number) => (now += ms) };
}

const profile: SkinProfile = {
  version: 1,
  scannedAt: "2026-10-21T12:00:00.000Z",
  source: "camera",
  skinType: {
    whole: { type: "oily", redness: false },
    tZone: { type: "oily", redness: false },
    uZone: { type: "oily", redness: false },
  },
  concerns: [{ concern: "acne", severity: 44, band: "moderate", maskUrl: "https://s3.test/mask.png" }],
  fitzpatrick: "IV",
  sensitive: false,
};

describe("caps", () => {
  it("counts per IP and refuses past the cap", async () => {
    const { limits } = setup();
    expect((await limits.reserveSlot("ip-a")).ok).toBe(true);
    expect((await limits.reserveSlot("ip-a")).ok).toBe(true);
    expect(await limits.checkCaps("ip-a")).toBe("daily_cap");
    expect(await limits.reserveSlot("ip-a")).toEqual({ ok: false, reason: "daily_cap" });
    expect(await limits.checkCaps("ip-b")).toBeNull();
  });

  it("counts the global cap across IPs", async () => {
    const { limits } = setup();
    await limits.reserveSlot("ip-a");
    await limits.reserveSlot("ip-b");
    await limits.reserveSlot("ip-c");
    expect(await limits.checkCaps("ip-d")).toBe("daily_cap");
    expect(await limits.reserveSlot("ip-d")).toEqual({ ok: false, reason: "daily_cap" });
  });

  it("does not leak counts when a reservation is refused", async () => {
    const { limits } = setup();
    await limits.reserveSlot("ip-a");
    await limits.reserveSlot("ip-a");
    await limits.reserveSlot("ip-a");
    // the third attempt is refused per IP and must hand its global count back
    expect((await limits.reserveSlot("ip-b")).ok).toBe(true);
    expect((await limits.reserveSlot("ip-c")).ok).toBe(false);
  });

  it("release rolls a slot back", async () => {
    const { limits } = setup({ capPerIp: 1 });
    const slot = await limits.reserveSlot("ip-a");
    if (!slot.ok) throw new Error("expected a slot");
    expect(await limits.checkCaps("ip-a")).toBe("daily_cap");
    await slot.release();
    expect(await limits.checkCaps("ip-a")).toBeNull();
  });

  it("resets on the next UTC day", async () => {
    const { limits, advance } = setup({ capPerIp: 1 });
    await limits.reserveSlot("ip-a");
    expect(await limits.checkCaps("ip-a")).toBe("daily_cap");
    advance(24 * 60 * 60 * 1000);
    expect(await limits.checkCaps("ip-a")).toBeNull();
  });
});

describe("credit reserve", () => {
  it("allows a scan when the balance stays above the floor", async () => {
    const { limits } = setup();
    expect(await limits.checkReserve(async () => 100 + SCAN_COST_UNITS)).toBeNull();
  });

  it("refuses when one more scan would cross the floor", async () => {
    const { limits } = setup();
    expect(await limits.checkReserve(async () => 100 + SCAN_COST_UNITS - 1)).toBe("reserve_reached");
  });

  it("caches the balance for five minutes", async () => {
    const { limits, advance } = setup();
    let calls = 0;
    const balance = async () => {
      calls += 1;
      return 500;
    };
    await limits.checkReserve(balance);
    await limits.checkReserve(balance);
    expect(calls).toBe(1);
    advance(5 * 60 * 1000 + 1000);
    await limits.checkReserve(balance);
    expect(calls).toBe(2);
  });

  it("debits the cached balance as scans start", async () => {
    const { limits } = setup();
    const balance = async () => 100 + SCAN_COST_UNITS * 2;
    expect(await limits.checkReserve(balance)).toBeNull();
    await limits.noteScanStarted();
    expect(await limits.checkReserve(balance)).toBeNull();
    await limits.noteScanStarted();
    expect(await limits.checkReserve(balance)).toBe("reserve_reached");
  });
});

describe("photo hash cache", () => {
  it("returns the cached profile without mask URLs", async () => {
    const { limits } = setup();
    const sha = "b".repeat(64);
    expect(await limits.getCachedProfile(sha)).toBeNull();
    await limits.cacheProfile(sha, profile);
    const cached = await limits.getCachedProfile(sha);
    expect(cached?.fitzpatrick).toBe("IV");
    expect(cached?.concerns[0]).toEqual({ concern: "acne", severity: 44, band: "moderate" });
  });

  it("expires after 24 hours", async () => {
    const { limits, advance } = setup();
    const sha = "c".repeat(64);
    await limits.cacheProfile(sha, profile);
    advance(23 * 60 * 60 * 1000);
    expect(await limits.getCachedProfile(sha)).not.toBeNull();
    advance(2 * 60 * 60 * 1000);
    expect(await limits.getCachedProfile(sha)).toBeNull();
  });

  it("stripMasks leaves the input untouched", () => {
    stripMasks(profile);
    expect(profile.concerns[0].maskUrl).toBeDefined();
  });
});

describe("helpers", () => {
  it("reads defaults and overrides from env", () => {
    expect(limitsFromEnv({})).toEqual({ capPerIp: 3, capGlobal: 20, reserveFloor: 425 });
    expect(limitsFromEnv({ SCAN_CAP_PER_IP: "5", SCAN_CAP_GLOBAL: "x", CREDIT_RESERVE_FLOOR: "0" })).toEqual({
      capPerIp: 5,
      capGlobal: 20,
      reserveFloor: 0,
    });
  });

  it("takes the first forwarded address and hashes it", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" }))).toBe("1.2.3.4");
    expect(clientIp(new Headers({ "x-real-ip": "9.9.9.9" }))).toBe("9.9.9.9");
    expect(clientIp(new Headers())).toBe("unknown");
    const hashed = hashIp("1.2.3.4", "salt");
    expect(hashed).toMatch(/^[a-f0-9]{32}$/);
    expect(hashed).not.toContain("1.2.3.4");
    expect(hashIp("1.2.3.4", "other")).not.toBe(hashed);
  });
});
