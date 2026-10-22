import { pageMetadata } from "@/lib/site-metadata";
import { Suspense } from "react";
import { CatalogPage } from "@/app/_store/catalog-page";
import { RouteFallback } from "@/app/route-fallback";
export const metadata = pageMetadata("Shop skincare", "/shop", "Explore cleansers, targeted treatments, moisturizers and daily sun protection. An optional skin scan helps you find a starting point.");
export default function ShopPage() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <CatalogPage />
    </Suspense>
  );
}
