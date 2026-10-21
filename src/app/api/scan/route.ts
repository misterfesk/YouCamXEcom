import { withScanApi } from "@/lib/server";

export const runtime = "nodejs";

export function POST(request: Request) {
  return withScanApi((api) => api.start(request));
}
