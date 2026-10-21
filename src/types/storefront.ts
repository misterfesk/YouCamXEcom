import type { GoalScore } from "./goal";
import type { SkinType } from "./skin";

export type ProfileSummary = {
  skinType: SkinType;
  goals: GoalScore[];
  label: string;
  /** Breakouts or redness high enough to suggest a dermatologist (soft note). */
  dermatologist?: boolean;
};
export type ScanSource = "header" | "mobile" | "hero" | "grid" | "results" | "sample";

export type ProductListing = {
  product: import("./catalog").Product;
  fit?: import("./fit").Fit;
};
