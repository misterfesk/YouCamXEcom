import { ScanPreview } from "./scan-preview";
import { StorefrontPreview } from "./storefront-preview";
import type { Metadata } from "next";
import { StyleguideView } from "@/components/views/styleguide-view";
import {
  colorSpecimens,
  spaceSpecimens,
  radiusSpecimens,
  productSpecimens,
  sampleSpecimens,
} from "@/fixtures/ui/styleguide";
import { fitExamples } from "@/fixtures/ui/fit";
export const metadata: Metadata = {
  title: "Design system | [BRAND]",
  robots: { index: false, follow: false },
};
export default function StyleguidePage() {
  return (
    <>
      <StyleguideView
        colors={colorSpecimens}
        spaces={spaceSpecimens}
        radii={radiusSpecimens}
        products={productSpecimens}
        samples={sampleSpecimens}
        fits={fitExamples}
      />
      <StorefrontPreview />
      <ScanPreview />
    </>
  );
}
