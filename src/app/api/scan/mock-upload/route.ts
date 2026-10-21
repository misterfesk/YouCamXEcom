import { withScanApi } from "@/lib/server";

export function PUT(request: Request) {
  return withScanApi((api) => api.mockUpload(request));
}
