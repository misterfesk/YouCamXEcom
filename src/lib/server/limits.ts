import { createHash } from "node:crypto";
import { getYouCamMode } from "@/lib/youcam/config";
import { SCAN_COST_UNITS } from "@/lib/youcam/constants";
import type { ScanUnavailableReason } from "@/types/scan";
import type { SkinProfile } from "@/types/skin";
import type { KeyValueStore } from "./store";

export interface LimitsConfig {
  capPerIp: number;
  capGlobal: number;
  /** Units held back for judging until reserveReleaseAt (epoch ms). */
  reserveFloor: number;
  reserveReleaseAt: number;
}

const DAY_SECONDS = 25 * 60 * 60;
const RESULT_TTL_SECONDS = 24 * 60 * 60;

/** Submission deadline: the judging reserve is spendable from here on. */
export const DEFAULT_RESERVE_RELEASE_AT = "2026-11-02T16:45:00Z";

function intFromEnv(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return value !== undefined && value.trim() !== "" && Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function timeFromEnv(value: string | undefined): number {
  const parsed = Date.parse(value?.trim() ?? "");
  return Number.isNaN(parsed) ? Date.parse(DEFAULT_RESERVE_RELEASE_AT) : parsed;
}

export function limitsFromEnv(env: Record<string, string | undefined> = process.env): LimitsConfig {
  return {
    capPerIp: intFromEnv(env.SCAN_CAP_PER_IP, 1),
    capGlobal: intFromEnv(env.SCAN_CAP_GLOBAL, 1),
    reserveFloor: intFromEnv(env.CREDIT_RESERVE_FLOOR, 494),
    reserveReleaseAt: timeFromEnv(env.RESERVE_RELEASE_AT),
  };
}

/**
 * Client address for per-visitor caps. Forwarding headers are client-controlled unless a proxy we
 * run behind sets them, so live mode trusts them only on Vercel or with TRUST_PROXY=1; otherwise
 * everyone shares one "direct" bucket. Mock mode spends nothing and always reads the headers.
 */
export function clientIp(headers: Headers, env: Record<string, string | undefined> = process.env): string {
  const trusted = Boolean(env.VERCEL) || env.TRUST_PROXY === "1" || getYouCamMode(env) !== "live";
  if (!trusted) return "direct";
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}

/** IPv4 as is; IPv6 reduced to its /64 so one household or host cannot dodge caps by rotating suffixes. */
export function normalizeIp(ip: string): string {
  const text = ip.trim().toLowerCase().split("%")[0];
  if (!text.includes(":")) return text;
  const mapped = /^(?:0*:)*ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(text);
  if (mapped) return mapped[1];
  const [head, tail] = text.split("::");
  const left = head ? head.split(":") : [];
  const right = tail === undefined ? [] : tail ? tail.split(":") : [];
  const groups = tail === undefined ? left : [...left, ...Array(Math.max(0, 8 - left.length - right.length)).fill("0"), ...right];
  const prefix = groups.slice(0, 4).map((group) => (Number.parseInt(group || "0", 16) || 0).toString(16));
  return `${prefix.join(":")}::/64`;
}

export function hashIp(ip: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${normalizeIp(ip)}`).digest("hex").slice(0, 32);
}

/** Cached profiles must not carry mask URLs: they expire and belong to the live reveal only. */
export function stripMasks(profile: SkinProfile): SkinProfile {
  return {
    ...profile,
    concerns: profile.concerns.map((concern) => {
      const rest = { ...concern };
      delete rest.maskUrl;
      return rest;
    }),
  };
}

type SlotResult = { ok: true; release: () => Promise<void> } | { ok: false; reason: ScanUnavailableReason };

export interface ScanLimits {
  /** Read-only check, used before an upload is created. */
  checkCaps(ipHash: string): Promise<ScanUnavailableReason | null>;
  /** Read-only: would one more scan stay above the floor? */
  checkReserve(getBalance: () => Promise<number>): Promise<ScanUnavailableReason | null>;
  /**
   * Atomically counts a scan against both daily caps and holds its credit units against the cached
   * balance. release() gives all of it back; call it only when no task was started.
   */
  reserveSlot(ipHash: string, getBalance: () => Promise<number>): Promise<SlotResult>;
  getCachedProfile(ipHash: string, sha256: string): Promise<SkinProfile | null>;
  /** Write-once; later polls of the same scan do not rewrite the entry. */
  cacheProfile(ipHash: string, sha256: string, profile: SkinProfile): Promise<void>;
}

export function createScanLimits(
  store: KeyValueStore,
  config: LimitsConfig,
  now: () => number = Date.now,
): ScanLimits {
  const day = () => new Date(now()).toISOString().slice(0, 10);
  const ipKey = (ipHash: string) => `scan:ip:${ipHash}:${day()}`;
  const globalKey = () => `scan:global:${day()}`;
  const balanceKey = "scan:budget:v2";
  const spentKey = "scan:spent:v2";
  const resultKey = (ipHash: string, sha256: string) => `scan:result:${ipHash}:${sha256}`;

  const floor = () => (now() >= config.reserveReleaseAt ? 0 : config.reserveFloor);
  const count = async (key: string) => (await store.get<number>(key)) ?? 0;

  /** A durable budget: task holds never disappear during refreshes or between UTC days. */
  async function balance(getBalance: () => Promise<number>): Promise<number> {
    const cached = await store.get<number>(balanceKey);
    if (cached !== null) return cached;
    const fresh = await getBalance();
    if (!Number.isFinite(fresh) || fresh < 0) throw new Error("Invalid balance");
    if (await store.setNx(balanceKey, fresh)) return fresh;
    const winner = await store.get<number>(balanceKey);
    if (winner === null) throw new Error("Budget unavailable");
    return winner;
  }

  return {
    async checkCaps(ipHash) {
      if ((await count(globalKey())) >= config.capGlobal) return "daily_cap";
      if ((await count(ipKey(ipHash))) >= config.capPerIp) return "daily_cap";
      return null;
    },

    async checkReserve(getBalance) {
      const value = await balance(getBalance);
      const spent = await count(spentKey);
      return value - spent - SCAN_COST_UNITS < floor() ? "reserve_reached" : null;
    },

    async reserveSlot(ipHash, getBalance) {
      const gKey = globalKey();
      const iKey = ipKey(ipHash);
      if ((await store.incrBy(gKey, 1, DAY_SECONDS)) > config.capGlobal) {
        await store.decrBy(gKey, 1);
        return { ok: false, reason: "daily_cap" };
      }
      if ((await store.incrBy(iKey, 1, DAY_SECONDS)) > config.capPerIp) {
        await store.decrBy(iKey, 1);
        await store.decrBy(gKey, 1);
        return { ok: false, reason: "daily_cap" };
      }
      let capsReturned = false;
      const giveBackCaps = async () => {
        if (capsReturned) return;
        capsReturned = true;
        await store.decrBy(iKey, 1);
        await store.decrBy(gKey, 1);
      };

      try {
        const value = await balance(getBalance);
        const spent = await store.incrBy(spentKey, SCAN_COST_UNITS);
        if (value - spent < floor()) {
          await store.decrBy(spentKey, SCAN_COST_UNITS);
          await giveBackCaps();
          return { ok: false, reason: "reserve_reached" };
        }
        let released = false;
        return {
          ok: true,
          release: async () => {
            if (released) return;
            released = true;
            await store.decrBy(spentKey, SCAN_COST_UNITS);
            await giveBackCaps();
          },
        };
      } catch (error) {
        await giveBackCaps().catch(() => {});
        throw error;
      }
    },

    getCachedProfile: (ipHash, sha256) => store.get<SkinProfile>(resultKey(ipHash, sha256)),

    async cacheProfile(ipHash, sha256, profile) {
      await store.setNx(resultKey(ipHash, sha256), stripMasks(profile), RESULT_TTL_SECONDS);
    },
  };
}
