import { Redis } from "@upstash/redis";
import { getYouCamMode } from "@/lib/youcam/config";

/** The few operations scan limits need; small enough to fake or swap. */
export interface KeyValueStore {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttlSeconds: number): Promise<void>;
  /** Writes only if the key is absent; resolves to whether this call wrote it. */
  setNx(key: string, value: unknown, ttlSeconds?: number): Promise<boolean>;
  /** Atomic increment; the TTL is applied when the key is created. */
  incrBy(key: string, amount: number, ttlSeconds?: number): Promise<number>;
  /** Atomic decrement, floored at zero where the backend allows it. */
  decrBy(key: string, amount: number): Promise<number>;
}

export class ScanStoreConfigError extends Error {
  constructor() {
    super("Live scans need UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (or SCAN_STORE=memory for a single instance)");
    this.name = "ScanStoreConfigError";
  }
}

interface Entry {
  value: unknown;
  expiresAt: number;
}

/** Process-local store for dev, tests and single-container deploys. */
export function createMemoryStore(now: () => number = Date.now): KeyValueStore {
  const entries = new Map<string, Entry>();
  const live = (key: string): Entry | undefined => {
    const entry = entries.get(key);
    if (entry && entry.expiresAt <= now()) {
      entries.delete(key);
      return undefined;
    }
    return entry;
  };
  return {
    async get<T>(key: string) {
      const entry = live(key);
      return entry ? (structuredClone(entry.value) as T) : null;
    },
    async set(key, value, ttlSeconds) {
      entries.set(key, { value: structuredClone(value), expiresAt: now() + ttlSeconds * 1000 });
    },
    async setNx(key, value, ttlSeconds) {
      if (live(key)) return false;
      entries.set(key, { value: structuredClone(value), expiresAt: ttlSeconds === undefined ? Infinity : now() + ttlSeconds * 1000 });
      return true;
    },
    async incrBy(key, amount, ttlSeconds) {
      const entry = live(key);
      const next = (typeof entry?.value === "number" ? entry.value : 0) + amount;
      entries.set(key, { value: next, expiresAt: entry?.expiresAt ?? (ttlSeconds === undefined ? Infinity : now() + ttlSeconds * 1000) });
      return next;
    },
    async decrBy(key, amount) {
      const entry = live(key);
      if (!entry || typeof entry.value !== "number") return 0;
      const next = Math.max(0, entry.value - amount);
      entries.set(key, { ...entry, value: next });
      return next;
    },
  };
}

export function createUpstashStore(redis: Redis): KeyValueStore {
  return {
    async get<T>(key: string) {
      return (await redis.get<T>(key)) ?? null;
    },
    async set(key, value, ttlSeconds) {
      await redis.set(key, value, { ex: ttlSeconds });
    },
    async setNx(key, value, ttlSeconds) {
      return (await redis.set(key, value, ttlSeconds === undefined ? { nx: true } : { nx: true, ex: ttlSeconds })) !== null;
    },
    async incrBy(key, amount, ttlSeconds) {
      const next = await redis.incrby(key, amount);
      if (next === amount && ttlSeconds !== undefined) await redis.expire(key, ttlSeconds);
      return next;
    },
    async decrBy(key, amount) {
      return redis.decrby(key, amount);
    },
  };
}

/** Namespaces every key so mock, preview and production never share counters or balance. */
export function prefixStore(store: KeyValueStore, prefix: string): KeyValueStore {
  return {
    get: (key) => store.get(`${prefix}${key}`),
    set: (key, value, ttl) => store.set(`${prefix}${key}`, value, ttl),
    setNx: (key, value, ttl) => store.setNx(`${prefix}${key}`, value, ttl),
    incrBy: (key, amount, ttl) => store.incrBy(`${prefix}${key}`, amount, ttl),
    decrBy: (key, amount) => store.decrBy(`${prefix}${key}`, amount),
  };
}

const globalForStore = globalThis as typeof globalThis & { __scanMemoryStore?: KeyValueStore };

/**
 * Upstash when its REST credentials are set. Otherwise one shared in-memory store, which live mode
 * only accepts with SCAN_STORE=memory: on serverless every instance would count caps separately.
 */
export function createStoreFromEnv(env: Record<string, string | undefined> = process.env): KeyValueStore {
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;
  // Replaying an ambiguous decrement could undercount reservations.
  if (url && token) return createUpstashStore(new Redis({ url, token, retry: { retries: 0 } }));
  if (getYouCamMode(env) === "live" && env.SCAN_STORE !== "memory") throw new ScanStoreConfigError();
  return (globalForStore.__scanMemoryStore ??= createMemoryStore());
}
