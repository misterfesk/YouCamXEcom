import { describe, expect, it, vi } from "vitest";
import {
  clientIp,
  createScanLimits,
  hashIp,
  limitsFromEnv,
  normalizeIp,
  stripMasks,
  type LimitsConfig,
} from "@/lib/server/limits";
import { createMemoryStore, createStoreFromEnv, prefixStore, ScanStoreConfigError } from "@/lib/server/store";
import { SCAN_COST_UNITS } from "@/lib/youcam/constants";
import type { SkinProfile } from "@/types/skin";

const RELEASE_AT = Date.UTC(2026, 10, 2, 16, 45);
const config: LimitsConfig = { capPerIp: 2, capGlobal: 3, reserveFloor: 100, reserveReleaseAt: RELEASE_AT };
const IP = "a".repeat(32);

function setup(overrides: Partial<LimitsConfig> = {}, startAt = Date.UTC(2026, 9, 21, 12, 0, 0)) {
  let now = startAt;
  const clock = () => now;
  const limits = createScanLimits(createMemoryStore(clock), { ...config, ...overrides }, clock);
  return { limits, advance: (ms: number) => (now += ms) };
}

const rich = async () => 10_000;

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
    expect((await limits.reserveSlot("ip-a", rich)).ok).toBe(true);
    expect((await limits.reserveSlot("ip-a", rich)).ok).toBe(true);
    expect(await limits.checkCaps("ip-a")).toBe("daily_cap");
    expect(await limits.reserveSlot("ip-a", rich)).toEqual({ ok: false, reason: "daily_cap" });
    expect(await limits.checkCaps("ip-b")).toBeNull();
  });

  it("counts the global cap across IPs", async () => {
    const { limits } = setup();
    await limits.reserveSlot("ip-a", rich);
    await limits.reserveSlot("ip-b", rich);
    await limits.reserveSlot("ip-c", rich);
    expect(await limits.checkCaps("ip-d")).toBe("daily_cap");
    expect(await limits.reserveSlot("ip-d", rich)).toEqual({ ok: false, reason: "daily_cap" });
  });

  it("does not leak counts when a reservation is refused", async () => {
    const { limits } = setup();
    await limits.reserveSlot("ip-a", rich);
    await limits.reserveSlot("ip-a", rich);
    await limits.reserveSlot("ip-a", rich);
    expect((await limits.reserveSlot("ip-b", rich)).ok).toBe(true);
    expect((await limits.reserveSlot("ip-c", rich)).ok).toBe(false);
  });

  it("release rolls a slot back", async () => {
    const { limits } = setup({ capPerIp: 1 });
    const slot = await limits.reserveSlot("ip-a", rich);
    if (!slot.ok) throw new Error("expected a slot");
    expect(await limits.checkCaps("ip-a")).toBe("daily_cap");
    await slot.release();
    expect(await limits.checkCaps("ip-a")).toBeNull();
  });

  it("is atomic under concurrent requests", async () => {
    const { limits } = setup({ capPerIp: 5, capGlobal: 5 });
    const results = await Promise.all(Array.from({ length: 12 }, () => limits.reserveSlot("ip-a", rich)));
    expect(results.filter((r) => r.ok)).toHaveLength(5);
  });

  it("resets on the next UTC day", async () => {
    const { limits, advance } = setup({ capPerIp: 1 });
    await limits.reserveSlot("ip-a", rich);
    expect(await limits.checkCaps("ip-a")).toBe("daily_cap");
    advance(24 * 60 * 60 * 1000);
    expect(await limits.checkCaps("ip-a")).toBeNull();
  });
});

describe("credit reserve", () => {
  const caps = { capPerIp: 100, capGlobal: 100 };

  it("allows a scan when the balance stays above the floor", async () => {
    const { limits } = setup();
    expect(await limits.checkReserve(async () => 100 + SCAN_COST_UNITS)).toBeNull();
    expect((await limits.reserveSlot("ip-a", async () => 100 + SCAN_COST_UNITS)).ok).toBe(true);
  });

  it("refuses when one more scan would cross the floor", async () => {
    const { limits } = setup();
    const balance = async () => 100 + SCAN_COST_UNITS - 1;
    expect(await limits.checkReserve(balance)).toBe("reserve_reached");
    expect(await limits.reserveSlot("ip-a", balance)).toEqual({ ok: false, reason: "reserve_reached" });
  });

  it("holds units atomically so concurrent scans cannot overshoot the floor", async () => {
    const { limits } = setup(caps);
    const balance = async () => 100 + SCAN_COST_UNITS * 2;
    const results = await Promise.all(Array.from({ length: 8 }, (_, i) => limits.reserveSlot(`ip-${i}`, balance)));
    expect(results.filter((r) => r.ok)).toHaveLength(2);
    expect(results.filter((r) => !r.ok && r.reason === "reserve_reached")).toHaveLength(6);
    expect(await limits.checkReserve(balance)).toBe("reserve_reached");
  });

  it("release gives the units back and a refusal holds none", async () => {
    const { limits } = setup(caps);
    const balance = async () => 100 + SCAN_COST_UNITS;
    const slot = await limits.reserveSlot("ip-a", balance);
    if (!slot.ok) throw new Error("expected a slot");
    expect((await limits.reserveSlot("ip-b", balance)).ok).toBe(false);
    await slot.release();
    expect((await limits.reserveSlot("ip-c", balance)).ok).toBe(true);
  });

  it("does not leak cap counts when the reserve refuses", async () => {
    const { limits } = setup({ capPerIp: 1, capGlobal: 1 });
    expect((await limits.reserveSlot("ip-a", async () => 0)).ok).toBe(false);
    expect(await limits.checkCaps("ip-a")).toBeNull();
  });

  it("never repeats a partial cap rollback after a lost response", async () => {
    const base = createMemoryStore();
    const store = { ...base, decrBy: async (key: string, amount: number) => {
      const next = await base.decrBy(key, amount);
      if (key.startsWith("scan:global:")) throw new Error("lost response");
      return next;
    } };
    const clock = () => Date.UTC(2026, 9, 21);
    const limits = createScanLimits(store, { ...config, ...caps }, clock);
    await limits.reserveSlot("same-ip", async () => 126);
    await expect(limits.reserveSlot("same-ip", async () => 126)).rejects.toThrow("lost response");
    const day = new Date(clock()).toISOString().slice(0, 10);
    expect(await base.get(`scan:ip:same-ip:${day}`)).toBe(1);
  });

  it("returns a slot only once", async () => {
    const { limits } = setup(caps);
    const balance = async () => 152;
    const slot = await limits.reserveSlot("a", balance);
    await limits.reserveSlot("b", balance);
    if (!slot.ok) throw new Error("expected slot");
    await slot.release();
    await slot.release();
    expect((await limits.reserveSlot("c", balance)).ok).toBe(true);
    expect((await limits.reserveSlot("d", balance)).ok).toBe(false);
  });

  it("gives caps back when the balance lookup fails", async () => {
    const { limits } = setup({ capPerIp: 1 });
    await expect(
      limits.reserveSlot("ip-a", async () => {
        throw new Error("down");
      }),
    ).rejects.toThrow("down");
    expect(await limits.checkCaps("ip-a")).toBeNull();
  });

  it("keeps a durable budget and spent ledger across cache windows and UTC days", async () => {
    const { limits, advance } = setup(caps);
    let calls = 0;
    const balance = async () => {
      calls += 1;
      return 100 + SCAN_COST_UNITS;
    };
    expect((await limits.reserveSlot("ip-a", balance)).ok).toBe(true);
    expect((await limits.reserveSlot("ip-b", balance)).ok).toBe(false);
    expect(calls).toBe(1);
    advance(5 * 60 * 1000 + 1000);
    expect((await limits.reserveSlot("ip-c", balance)).ok).toBe(false);
    advance(24 * 60 * 60 * 1000);
    expect((await limits.reserveSlot("ip-d", balance)).ok).toBe(false);
    expect(calls).toBe(1);
  });

  it("cannot split reservations across an expired balance snapshot", async () => {
    let now = 0;
    const base = createMemoryStore(() => now);
    let pause = false;
    let unblock!: () => void;
    let reached!: () => void;
    const waiting = new Promise<void>((resolve) => { reached = resolve; });
    const resume = new Promise<void>((resolve) => { unblock = resolve; });
    const store = { ...base, get: async <T>(key: string) => {
      const value = await base.get<T>(key);
      if (key === "scan:budget:v2" && pause) {
        pause = false;
        reached();
        await resume;
      }
      return value;
    } };
    const limits = createScanLimits(store, { ...config, ...caps }, () => now);
    const balance = async () => 126;
    await limits.checkReserve(balance);
    now = 299_999;
    pause = true;
    const old = limits.reserveSlot("old", balance);
    await waiting;
    now = 300_001;
    const fresh = await limits.reserveSlot("fresh", balance);
    unblock();
    expect([fresh, await old].filter((slot) => slot.ok)).toHaveLength(1);
  });

  it("holds the floor before the release time", async () => {
    const { limits } = setup(caps, RELEASE_AT - 1000);
    expect((await limits.reserveSlot("a", async () => 120)).ok).toBe(false);
  });

  it("drops the floor at the release time so only the balance limits scans", async () => {
    const { limits } = setup(caps, RELEASE_AT);
    const balance = async () => 120; // 4 scans fit, the fifth would overdraw
    const results = [];
    for (let i = 0; i < 5; i++) results.push((await limits.reserveSlot(`ip-${i}`, balance)).ok);
    expect(results).toEqual([true, true, true, true, false]);
  });
});

describe("photo hash cache", () => {
  it("returns the cached profile without mask URLs", async () => {
    const { limits } = setup();
    const sha = "b".repeat(64);
    expect(await limits.getCachedProfile(IP, sha)).toBeNull();
    await limits.cacheProfile(IP, sha, profile);
    const cached = await limits.getCachedProfile(IP, sha);
    expect(cached?.fitzpatrick).toBe("IV");
    expect(cached?.concerns[0]).toEqual({ concern: "acne", severity: 44, band: "moderate" });
  });

  it("is scoped to the visitor", async () => {
    const { limits } = setup();
    const sha = "b".repeat(64);
    await limits.cacheProfile(IP, sha, profile);
    expect(await limits.getCachedProfile("c".repeat(32), sha)).toBeNull();
  });

  it("is written once", async () => {
    const { limits } = setup();
    const sha = "b".repeat(64);
    await limits.cacheProfile(IP, sha, profile);
    await limits.cacheProfile(IP, sha, { ...profile, fitzpatrick: "I" });
    expect((await limits.getCachedProfile(IP, sha))?.fitzpatrick).toBe("IV");
  });

  it("expires after 24 hours", async () => {
    const { limits, advance } = setup();
    const sha = "c".repeat(64);
    await limits.cacheProfile(IP, sha, profile);
    advance(23 * 60 * 60 * 1000);
    expect(await limits.getCachedProfile(IP, sha)).not.toBeNull();
    advance(2 * 60 * 60 * 1000);
    expect(await limits.getCachedProfile(IP, sha)).toBeNull();
  });

  it("stripMasks leaves the input untouched", () => {
    stripMasks(profile);
    expect(profile.concerns[0].maskUrl).toBeDefined();
  });
});

describe("store", () => {
  it("does not replay ambiguous Redis mutations", async () => {
    const fetch = vi.fn().mockRejectedValue(new Error("lost response"));
    vi.stubGlobal("fetch", fetch);
    try {
      const store = createStoreFromEnv({ YOUCAM_MODE: "live", UPSTASH_REDIS_REST_URL: "https://example.upstash.io", UPSTASH_REDIS_REST_TOKEN: "test-only" });
      await expect(store.decrBy("scan:spent:v2", 26)).rejects.toThrow();
      expect(fetch).toHaveBeenCalledTimes(1);
    } finally { vi.unstubAllGlobals(); }
  });
  it("prefixes keys so environments stay apart", async () => {
    const base = createMemoryStore();
    const prod = prefixStore(base, "live:production:");
    const mock = prefixStore(base, "mock:local:");
    await prod.incrBy("scan:global", 1, 60);
    expect(await mock.get("scan:global")).toBeNull();
    expect(await prod.get("scan:global")).toBe(1);
  });

  it("setNx only writes once", async () => {
    const store = createMemoryStore();
    expect(await store.setNx("k", 1, 60)).toBe(true);
    expect(await store.setNx("k", 2, 60)).toBe(false);
    expect(await store.get("k")).toBe(1);
  });

  it("refuses an in-memory store in live mode unless opted in", () => {
    expect(() => createStoreFromEnv({ YOUCAM_MODE: "live" })).toThrow(ScanStoreConfigError);
    expect(() => createStoreFromEnv({ YOUCAM_MODE: "live", SCAN_STORE: "memory" })).not.toThrow();
    expect(() => createStoreFromEnv({})).not.toThrow();
    expect(() =>
      createStoreFromEnv({
        YOUCAM_MODE: "live",
        UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
        UPSTASH_REDIS_REST_TOKEN: "token",
      }),
    ).not.toThrow();
  });
});

describe("helpers", () => {
  it("reads defaults and overrides from env", () => {
    expect(limitsFromEnv({})).toEqual({
      capPerIp: 1,
      capGlobal: 1,
      reserveFloor: 494,
      reserveReleaseAt: Date.parse("2026-11-02T16:45:00Z"),
    });
    expect(
      limitsFromEnv({
        SCAN_CAP_PER_IP: "5",
        SCAN_CAP_GLOBAL: "x",
        CREDIT_RESERVE_FLOOR: "0",
        RESERVE_RELEASE_AT: "2026-12-01T00:00:00Z",
      }),
    ).toEqual({ capPerIp: 5, capGlobal: 1, reserveFloor: 0, reserveReleaseAt: Date.parse("2026-12-01T00:00:00Z") });
    expect(limitsFromEnv({ RESERVE_RELEASE_AT: "garbage" }).reserveReleaseAt).toBe(Date.parse("2026-11-02T16:45:00Z"));
  });

  it("hashes addresses with a salt and never exposes them", () => {
    const hashed = hashIp("1.2.3.4", "salt");
    expect(hashed).toMatch(/^[a-f0-9]{32}$/);
    expect(hashIp("1.2.3.4", "other")).not.toBe(hashed);
  });

  it("groups IPv6 by /64", () => {
    expect(hashIp("2001:db8:1:2:aaaa:bbbb:cccc:dddd", "s")).toBe(hashIp("2001:db8:1:2::1", "s"));
    expect(hashIp("2001:db8:1:3::1", "s")).not.toBe(hashIp("2001:db8:1:2::1", "s"));
    expect(normalizeIp("::ffff:1.2.3.4")).toBe("1.2.3.4");
    expect(normalizeIp("::1")).toBe("0:0:0:0::/64");
  });
});

describe("clientIp", () => {
  const forwarded = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8", "x-real-ip": "9.9.9.9" });

  it("trusts forwarding headers on Vercel, behind TRUST_PROXY, and in mock mode", () => {
    expect(clientIp(forwarded, { YOUCAM_MODE: "live", VERCEL: "1" })).toBe("1.2.3.4");
    expect(clientIp(forwarded, { YOUCAM_MODE: "live", TRUST_PROXY: "1" })).toBe("1.2.3.4");
    expect(clientIp(new Headers({ "x-real-ip": "9.9.9.9" }), { YOUCAM_MODE: "live", TRUST_PROXY: "1" })).toBe("9.9.9.9");
    expect(clientIp(forwarded, {})).toBe("1.2.3.4");
  });

  it("uses one shared bucket for live mode without a trusted proxy", () => {
    expect(clientIp(forwarded, { YOUCAM_MODE: "live" })).toBe("direct");
  });

  it("falls back to a shared unknown bucket when headers are missing", () => {
    expect(clientIp(new Headers(), { VERCEL: "1" })).toBe("unknown");
  });
});
