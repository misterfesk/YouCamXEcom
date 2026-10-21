import type { Metadata } from "next";
import { CatalogPreview } from "@/app/catalog-preview";
export const metadata: Metadata = {
  title: "Shop skincare | [BRAND]",
  description:
    "Explore cleansers, targeted treatments, moisturizers and daily sun protection. An optional skin scan helps you find a starting point.",
};
export default function ShopPage() {
  return <CatalogPreview />;
}
