"use client";
import { usePreview, summarizeProfile } from "@/app/preview-provider";
import { FrontendSpecimens } from "@/components/views/frontend-specimens";
import { concernTiles } from "@/fixtures/ui/home";
import { products } from "@/fixtures/ui/products";
import { fitExamples } from "@/fixtures/ui/fit";
export function StorefrontPreview() {
  const { onStartScan, onAddToBag } = usePreview();
  return (
    <FrontendSpecimens
      tiles={concernTiles}
      sampleResult={summarizeProfile("mature")}
      profile={summarizeProfile("oily")}
      items={products.map((product) => ({ product }))}
      fits={fitExamples}
      onStartScan={onStartScan}
      onAddToBag={onAddToBag}
    />
  );
}
