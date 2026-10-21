import { createYouCamClient, getYouCamMode } from "@/lib/youcam";
import { createScanApi } from "./scan-api";
import { createScanLimits, limitsFromEnv } from "./limits";
import { resolveScanSecret } from "./scan-token";
import { createStoreFromEnv } from "./store";

/** Builds the scan handlers from the environment; throws if live mode is misconfigured. */
export function scanApiFromEnv(env: Record<string, string | undefined> = process.env) {
  return createScanApi({
    client: createYouCamClient(env),
    limits: createScanLimits(createStoreFromEnv(env), limitsFromEnv(env)),
    mode: getYouCamMode(env),
    secret: resolveScanSecret(env),
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
