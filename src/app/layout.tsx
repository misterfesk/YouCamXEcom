import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import "./globals.css";
import { StoreShell } from "./_store/store-shell";
import { archivo, bodoni } from "@/styles/fonts";
import { ScanController } from "./_store/scan-controller";

export const metadata: Metadata = {
  title: "[BRAND]",
  description: "Skincare that knows your skin.",
};

async function RuntimeScanController() {
  await connection();
  return <ScanController demoMode={process.env.YOUCAM_MODE !== "live"} />;
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${bodoni.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <StoreShell>
          {children}
          <Suspense fallback={null}><RuntimeScanController /></Suspense>
        </StoreShell>
      </body>
    </html>
  );
}
