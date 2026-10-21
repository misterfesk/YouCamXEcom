"use client";
import { usePreview } from "./preview-provider";
import { products } from "@/fixtures/ui/products";
import { sampleFits } from "@/fixtures/ui/product-fits";
import { ProductView } from "@/components/views/product-view";
import type { Product } from "@/types/catalog";
export function ProductPreview({ product }: { product: Product }) {
  const { profile, sampleId, recommendations, bag, onAddToBag, onStartScan } = usePreview();
  const fits = sampleId && recommendations ? sampleFits[sampleId] : undefined;
  const pairs = products.filter(p => p.step !== product.step && (!fits || ["great", "good", "everyday"].includes(fits[p.id].level))).slice().sort((a,b) => Number(fits?.[b.id].level === "great") - Number(fits?.[a.id].level === "great")).slice(0,4).map(p => ({product:p, fit:fits?.[p.id]}));
  return <ProductView product={product} fit={fits?.[product.id]} profile={profile} pairs={pairs} quantity={bag[product.id] ?? 0} onAddToBag={onAddToBag} onStartScan={() => onStartScan("header")}/>;
}
