import tokens from "@/styles/tokens.json";
import type { FitLevel } from "@/types/fit";

export const colorSpecimens = Object.entries(tokens.color)
  .filter(([name]) => !name.startsWith("$"))
  .map(([name, value]) => ({
    name,
    value: (value as { $value: string }).$value,
  }));
export const spaceSpecimens = Object.entries(tokens.space)
  .filter(([name]) => !name.startsWith("$"))
  .map(([name, value]) => ({
    name,
    value: (value as { $value: string }).$value,
  }));
export const radiusSpecimens = Object.entries(tokens.radius)
  .filter(([name]) => !name.startsWith("$"))
  .map(([name, value]) => ({
    name,
    value: (value as { $value: string }).$value,
  }));
export const productSpecimens: {
  id: string;
  name: string;
  category: string;
  level: FitLevel;
  color: "brand" | "lilac" | "tangerine" | "surface";
  rank: number;
}[] = [
  {
    id: "cleanser",
    name: "Gentle cleanser",
    category: "Cleanse",
    level: "good",
    color: "lilac",
    rank: 2,
  },
  {
    id: "serum",
    name: "Daily serum",
    category: "Treat",
    level: "great",
    color: "brand",
    rank: 0,
  },
  {
    id: "cream",
    name: "Barrier moisturiser",
    category: "Moisturise",
    level: "everyday",
    color: "surface",
    rank: 3,
  },
  {
    id: "spf",
    name: "Daily sunscreen",
    category: "Protect",
    level: "good",
    color: "tangerine",
    rank: 1,
  },
];
export const sampleSpecimens = [
  {
    id: "oily",
    label: "Oily skin",
    alt: "Generated South Asian woman with visible T-zone shine, enlarged pores, active acne and dark post-acne marks.",
  },
  {
    id: "dry",
    label: "Dry skin",
    alt: "Generated East Asian woman with matte, flaky skin and redness on her cheeks and around her nose.",
  },
  {
    id: "mature",
    label: "Mature skin",
    alt: "Generated Latina woman with cheekbone sun spots, forehead and eye lines, and mild under-eye bags.",
  },
];
