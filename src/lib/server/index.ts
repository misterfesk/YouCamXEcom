import { createYouCamClient, getYouCamMode } from "@/lib/youcam";
import { createScanApi } from "./scan-api";
import { createScanLimits, limitsFromEnv } from "./limits";
import { resolveScanSecret } from "./scan-token";
import { createStoreFromEnv, prefixStore } from "./store";

/** Builds the scan handlers from the environment; throws if live mode is misconfigured. */
export function scanApiFromEnv(env: Record<string, string | undefined> = process.env) {
  const mode = getYouCamMode(env);
  // Mock, preview and production must never share counters or the cached balance.
  const store = prefixStore(createStoreFromEnv(env), `${mode}:${env.VERCEL_ENV ?? "local"}:`);
  return createScanApi({
    client: createYouCamClient(env),
    limits: createScanLimits(store, limitsFromEnv(env)),
    mode,
    secret: resolveScanSecret(env),
    env,
  });
}

type ScanApi = ReturnType<typeof scanApiFromEnv>;

/** Route helper: a misconfigured environment becomes a typed error instead of a crash page. */
export async function withScanApi(run: (api: ScanApi) => Promise<Response>): Promise<Response> {
  let api: ScanApi;
  try {
    api = scanApiFromEnv();
  } catch (error) {
    console.error("scan: configuration error", error instanceof Error ? error.name : "unknown");
    return Response.json(
      { error: { kind: "scan_error", code: "unknown" } },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
  return run(api);
}
