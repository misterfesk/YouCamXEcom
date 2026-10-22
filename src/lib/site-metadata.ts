import type { Metadata } from "next";
import { BRAND_NAME, SITE_DESCRIPTION } from "@/config/site";

export function siteOrigin(): URL {
  const origin = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
  const url = new URL(origin);
  if (!["https:", "http:"].includes(url.protocol)) throw new Error("SITE_URL must be an HTTP origin");
  return new URL(url.origin);
}

export function pageMetadata(title: string, path: string, description = SITE_DESCRIPTION): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: `${title} | ${BRAND_NAME}`, description, url: path, siteName: BRAND_NAME, type: "website", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${BRAND_NAME}: skincare with a reason` }] },
    twitter: { card: "summary_large_image", title: `${title} | ${BRAND_NAME}`, description, images: ["/opengraph-image"] },
  };
}
