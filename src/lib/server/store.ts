import { Redis } from "@upstash/redis";

/** The few operations scan limits need; small enough to fake or swap. */
export interface KeyValueStore {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttlSeconds: number): Promise<void>;
  /** Atomic increment; the TTL is applied when the key is created. */
  incr(key: string, ttlSeconds: number): Promise<number>;
  decr(key: string): Promise<number>;
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
    async incr(key, ttlSeconds) {
      const entry = live(key);
      const next = (typeof entry?.value === "number" ? entry.value : 0) + 1;
      entries.set(key, { value: next, expiresAt: entry?.expiresAt ?? now() + ttlSeconds * 1000 });
      return next;
    },
    async decr(key) {
      const entry = live(key);
      if (!entry || typeof entry.value !== "number") return 0;
      const next = Math.max(0, entry.value - 1);
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
    async incr(key, ttlSeconds) {
      const next = await redis.incr(key);
      if (next === 1) await redis.expire(key, ttlSeconds);
      return next;
    },
    async decr(key) {
      return redis.decr(key);
    },
  };
}

const globalForStore = globalThis as typeof globalThis & { __scanMemoryStore?: KeyValueStore };

/** Upstash when its REST credentials are set, otherwise one shared in-memory store. */
export function createStoreFromEnv(env: Record<string, string | undefined> = process.env): KeyValueStore {
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return createUpstashStore(new Redis({ url, token }));
  return (globalForStore.__scanMemoryStore ??= createMemoryStore());
}
