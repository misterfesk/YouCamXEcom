import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site-metadata";
import { getProducts } from "@/lib/catalog";
import { STEPS } from "@/types/catalog";
import { GOALS } from "@/types/goal";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/shop", "/how-we-recommend", ...STEPS.map((step) => `/shop/${step}`), ...GOALS.map((goal) => `/concerns/${goal}`), ...getProducts().map((product) => `/products/${product.slug}`)]
    .map((path) => ({ url: new URL(path, siteOrigin()).href }));
}
