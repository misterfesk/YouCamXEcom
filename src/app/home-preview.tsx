"use client";
import { usePreview, summarizeProfile } from "./preview-provider";
import { HomeView } from "@/components/views/home-view";
import { products } from "@/fixtures/ui/products";
import { sampleFits } from "@/fixtures/ui/product-fits";
import { concernTiles, otherHomeGoals } from "@/fixtures/ui/home";
export function HomePreview() {
  const { profile, sampleId, recommendations, onStartScan, onAddToBag } =
    usePreview();
  return (
    <HomeView
      profile={profile}
      bestsellers={products
        .filter((product) => product.bestseller)
        .map((product) => ({
          product,
          fit:
            sampleId && recommendations
              ? sampleFits[sampleId][product.id]
              : undefined,
        }))}
      tiles={concernTiles}
      otherGoals={otherHomeGoals}
      sampleResult={summarizeProfile("mature")}
      onStartScan={onStartScan}
      onAddToBag={onAddToBag}
    />
  );
}
