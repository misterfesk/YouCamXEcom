import type { GoalScore } from "./goal";
import type { SkinType } from "./skin";

export type ProfileSummary = {
  skinType: SkinType;
  goals: GoalScore[];
  label: string;
};
export type ScanSource = "header" | "mobile" | "hero" | "grid" | "results";
