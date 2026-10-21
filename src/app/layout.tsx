import type { Metadata } from "next";
import "./globals.css";
import { StoreShell } from "./_store/store-shell";
import { archivo, bodoni } from "@/styles/fonts";

export const metadata: Metadata = {
  title: "[BRAND]",
  description: "Skincare that knows your skin.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${bodoni.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans"><StoreShell demoMode={process.env.YOUCAM_MODE !== "live"}>{children}</StoreShell></body>
    </html>
  );
}
