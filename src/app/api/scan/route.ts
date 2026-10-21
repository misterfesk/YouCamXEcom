import { withScanApi } from "@/lib/server";

export function POST(request: Request) {
  return withScanApi((api) => api.start(request));
}
