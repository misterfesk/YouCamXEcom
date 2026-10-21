import type { Fit, FitLevel } from "@/types/fit";
import type { SampleFaceId } from "@/types/scan";
import { products } from "./products";
const levels: Record<SampleFaceId, FitLevel[]> = {
  oily: [
    "good",
    "everyday",
    "avoid",
    "everyday",
    "care",
    "great",
    "care",
    "great",
    "great",
    "good",
    "good",
    "good",
    "good",
    "care",
    "great",
    "good",
    "avoid",
    "good",
    "avoid",
    "good",
    "good",
    "everyday",
    "great",
    "good",
  ],
  dry: [
    "good",
    "great",
    "avoid",
    "great",
    "care",
    "great",
    "care",
    "good",
    "great",
    "care",
    "everyday",
    "care",
    "good",
    "avoid",
    "great",
    "great",
    "great",
    "good",
    "avoid",
    "good",
    "good",
    "everyday",
    "great",
    "good",
  ],
  mature: [
    "good",
    "good",
    "avoid",
    "everyday",
    "care",
    "great",
    "care",
    "good",
    "great",
    "good",
    "everyday",
    "good",
    "great",
    "care",
    "great",
    "great",
    "avoid",
    "great",
    "avoid",
    "good",
    "good",
    "everyday",
    "great",
    "great",
  ],
};
const faceReasons: Record<SampleFaceId, string> = {
  oily: "A lightweight option for your oil and hydration focus",
  dry: "A gentle layer for your hydration and comfort focus",
  mature: "Supports your hydration and daily care focus",
};
export const sampleFits = Object.fromEntries(
  Object.entries(levels).map(([face, fits]) => [
    face,
    Object.fromEntries(
      products.map((product, index) => {
        const level = fits[index];
        let reason =
          level === "great" || level === "good"
            ? faceReasons[face as SampleFaceId]
            : "An option for the everyday steps in your routine";
        if (product.step === "protect")
          reason = "A sun-protection step for your morning routine";
        if (product.subtype === "eye-care")
          reason = "A focused step for your under-eye routine";
        if (level === "care")
          reason = product.flags.fragranceFree
            ? "Introduce slowly and patch test before regular use"
            : "Contains fragrance; patch test before use";
        if (level === "avoid")
          reason = product.safety.includes("strongActives")
            ? "A strong active for this sample's sensitive-skin profile"
            : "This rich texture is a less suitable match for oily skin";
        return [product.id, { level, reason } satisfies Fit];
      }),
    ),
  ]),
) as Record<SampleFaceId, Record<string, Fit>>;
