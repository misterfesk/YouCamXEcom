import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // The Windows image loader needs its adjacent DLLs in standalone output.
  outputFileTracingIncludes: process.platform === "win32" ? {
    "/*": ["./node_modules/.pnpm/@img+sharp-win32-x64@*/node_modules/@img/sharp-win32-x64/lib/*.dll"],
  } : {},
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
