import { withScanApi } from "@/lib/server";

export async function GET(_request: Request, { params }: { params: Promise<{ scanId: string }> }) {
  const { scanId } = await params;
  return withScanApi((api) => api.status(scanId));
}
