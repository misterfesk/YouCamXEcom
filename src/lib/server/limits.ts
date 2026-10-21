import { createHash } from "node:crypto";
import { SCAN_COST_UNITS } from "@/lib/youcam/constants";
import type { ScanUnavailableReason } from "@/types/scan";
import type { SkinProfile } from "@/types/skin";
import type { KeyValueStore } from "./store";

export interface LimitsConfig {
  capPerIp: number;
  capGlobal: number;
  reserveFloor: number;
}

const DAY_SECONDS = 25 * 60 * 60;
const BALANCE_TTL_SECONDS = 5 * 60;
const RESULT_TTL_SECONDS = 24 * 60 * 60;

function intFromEnv(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return value !== undefined && value.trim() !== "" && Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

export function limitsFromEnv(env: Record<string, string | undefined> = process.env): LimitsConfig {
  return {
    capPerIp: intFromEnv(env.SCAN_CAP_PER_IP, 3),
    capGlobal: intFromEnv(env.SCAN_CAP_GLOBAL, 20),
    reserveFloor: intFromEnv(env.CREDIT_RESERVE_FLOOR, 425),
  };
}

/** Client address from proxy headers; only its salted hash is ever used as a key. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}

export function hashIp(ip: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
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

interface CachedBalance {
  value: number;
  at: number;
}

export interface ScanLimits {
  /** Read-only check, used before an upload is created. */
  checkCaps(ipHash: string): Promise<ScanUnavailableReason | null>;
  /** Counts a scan against both daily caps; release() rolls it back if the tasks never started. */
  reserveSlot(ipHash: string): Promise<SlotResult>;
  /** Refuses when the remaining balance minus one scan would fall below the floor. */
  checkReserve(getBalance: () => Promise<number>): Promise<ScanUnavailableReason | null>;
  /** Keeps the cached balance honest between refreshes. */
  noteScanStarted(): Promise<void>;
  getCachedProfile(sha256: string): Promise<SkinProfile | null>;
  cacheProfile(sha256: string, profile: SkinProfile): Promise<void>;
}

export function createScanLimits(
  store: KeyValueStore,
  config: LimitsConfig,
  now: () => number = Date.now,
): ScanLimits {
  const day = () => new Date(now()).toISOString().slice(0, 10);
  const ipKey = (ipHash: string) => `scan:ip:${ipHash}:${day()}`;
  const globalKey = () => `scan:global:${day()}`;
  const balanceKey = "scan:balance";

  const count = async (key: string) => (await store.get<number>(key)) ?? 0;

  return {
    async checkCaps(ipHash) {
      if ((await count(globalKey())) >= config.capGlobal) return "daily_cap";
      if ((await count(ipKey(ipHash))) >= config.capPerIp) return "daily_cap";
      return null;
    },

    async reserveSlot(ipHash) {
      const gKey = globalKey();
      const iKey = ipKey(ipHash);
      if ((await store.incr(gKey, DAY_SECONDS)) > config.capGlobal) {
        await store.decr(gKey);
        return { ok: false, reason: "daily_cap" };
      }
      if ((await store.incr(iKey, DAY_SECONDS)) > config.capPerIp) {
        await store.decr(iKey);
        await store.decr(gKey);
        return { ok: false, reason: "daily_cap" };
      }
      return {
        ok: true,
        release: async () => {
          await store.decr(iKey);
          await store.decr(gKey);
        },
      };
    },

    async checkReserve(getBalance) {
      let cached = await store.get<CachedBalance>(balanceKey);
      if (!cached) {
        cached = { value: await getBalance(), at: now() };
        await store.set(balanceKey, cached, BALANCE_TTL_SECONDS);
      }
      return cached.value - SCAN_COST_UNITS < config.reserveFloor ? "reserve_reached" : null;
    },

    async noteScanStarted() {
      const cached = await store.get<CachedBalance>(balanceKey);
      if (!cached) return;
      const remaining = Math.max(1, BALANCE_TTL_SECONDS - Math.floor((now() - cached.at) / 1000));
      await store.set(balanceKey, { ...cached, value: cached.value - SCAN_COST_UNITS }, remaining);
    },

    getCachedProfile: (sha256) => store.get<SkinProfile>(`scan:result:${sha256}`),

    cacheProfile: (sha256, profile) => store.set(`scan:result:${sha256}`, stripMasks(profile), RESULT_TTL_SECONDS),
  };
}
