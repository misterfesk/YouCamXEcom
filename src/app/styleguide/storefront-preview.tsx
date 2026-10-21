"use client";
import { ProductDetails } from "@/components/views/product-view";
import { useState } from "react";
import { CatalogSpecimens } from "@/components/views/catalog-specimens";
import { catalogFilterOptions } from "@/fixtures/ui/catalog-options";
import { sampleFits } from "@/fixtures/ui/product-fits";
import { EMPTY_FILTERS } from "@/types/catalog-view";
import { usePreview, summarizeProfile } from "@/app/preview-provider";
import { FrontendSpecimens } from "@/components/views/frontend-specimens";
import { concernTiles } from "@/fixtures/ui/home";
import { products } from "@/fixtures/ui/products";
import { fitExamples } from "@/fixtures/ui/fit";
export function StorefrontPreview() {
  const { onStartScan, onAddToBag } = usePreview();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  return (
    <>
      <FrontendSpecimens
        tiles={concernTiles}
        sampleResult={summarizeProfile("mature")}
        profile={summarizeProfile("oily")}
        items={products.map((product) => ({ product }))}
        fits={fitExamples}
        onStartScan={onStartScan}
        onAddToBag={onAddToBag}
      />
      <section id="product-details" className="container section"><h2 className="type-h2 mb-6">Product details · Matches & safety</h2>{[products[0], products[13], products[2]].map(product => <ProductDetails key={product.id} product={product} fit={sampleFits.oily[product.id]} profile={summarizeProfile("oily")}/>)}</section>
      <CatalogSpecimens
        filters={{
          values: filters,
          options: catalogFilterOptions(),
          onChange: (key, value) =>
            setFilters((current) => ({ ...current, [key]: value })),
        }}
        profile={summarizeProfile("mature")}
        items={products.map((product) => ({
          product,
          fit: sampleFits.mature[product.id],
        }))}
        essentials={["cleanse", "moisturize", "protect"].flatMap((step) =>
          products
            .filter((product) => product.step === step)
            .slice(0, 2)
            .map((product) => ({
              product,
              fit: sampleFits.mature[product.id],
            })),
        )}
        onSetFocus={() => onStartScan("results")}
        onAddToBag={onAddToBag}
        onClearFilters={() => setFilters(EMPTY_FILTERS)}
        onAddRoutine={() =>
          [products[0], products[14], products[19]].forEach((product) =>
            onAddToBag(product.id),
          )
        }
      />
    </>
  );
}
