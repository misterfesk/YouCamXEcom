import { withScanApi } from "@/lib/server";

export const runtime = "nodejs";

export function PUT(request: Request) {
  return withScanApi((api) => api.mockUpload(request));
}
