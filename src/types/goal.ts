import type { Band, Concern } from "./skin";

/** User-facing goals; each groups one or more YouCam concerns and is a store section. */
export const GOALS = [
  "breakouts",
  "oil-pores",
  "calm",
  "hydrate",
  "even-tone",
  "under-eyes",
  "smooth-firm",
] as const;

export type GoalId = (typeof GOALS)[number];

export interface Goal {
  id: GoalId;
  /** Section title, e.g. "Clear breakouts". Copy may be refined. */
  title: string;
  /** One-line description for tiles and section intros. */
  blurb: string;
  concerns: Concern[];
}

export const GOAL_DEFS: Record<GoalId, Goal> = {
  breakouts: { id: "breakouts", title: "Clear breakouts", blurb: "[PLACEHOLDER]", concerns: ["acne"] },
  "oil-pores": { id: "oil-pores", title: "Balance oil & pores", blurb: "[PLACEHOLDER]", concerns: ["oiliness", "pore"] },
  calm: { id: "calm", title: "Calm & soothe", blurb: "[PLACEHOLDER]", concerns: ["redness"] },
  hydrate: { id: "hydrate", title: "Hydrate & smooth", blurb: "[PLACEHOLDER]", concerns: ["moisture", "texture"] },
  "even-tone": { id: "even-tone", title: "Even tone & glow", blurb: "[PLACEHOLDER]", concerns: ["age_spot", "radiance"] },
  "under-eyes": {
    id: "under-eyes",
    title: "Brighten under-eyes",
    blurb: "[PLACEHOLDER]",
    concerns: ["dark_circle_v2", "eye_bag", "tear_trough"],
  },
  "smooth-firm": {
    id: "smooth-firm",
    title: "Smooth & firm",
    blurb: "[PLACEHOLDER]",
    concerns: ["wrinkle", "firmness", "droopy_upper_eyelid", "droopy_lower_eyelid"],
  },
};

/** A goal as scored for one profile. Top 3 by severity become the "focus". */
export interface GoalScore {
  goal: GoalId;
  severity: number;
  band: Band;
}
