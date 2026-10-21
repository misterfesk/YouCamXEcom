import type { GoalScore } from "./goal";
import type { SkinType } from "./skin";

export type ProfileSummary = {
  skinType: SkinType;
  goals: GoalScore[];
  label: string;
};
export type ScanSource = "header" | "mobile" | "hero" | "grid" | "results";

export type ProductListing = {
  product: import("./catalog").Product;
  fit?: import("./fit").Fit;
};
