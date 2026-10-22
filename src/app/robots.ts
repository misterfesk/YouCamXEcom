import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site-metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/cart", "/checkout", "/order-confirmation", "/styleguide"] },
    sitemap: new URL("/sitemap.xml", siteOrigin()).href,
  };
}
