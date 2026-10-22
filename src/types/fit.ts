/** How well a product fits the scanned skin profile. Ordered best → worst. */
export const FIT_LEVELS = ["great", "good", "everyday", "care", "avoid"] as const;

export type FitLevel = (typeof FIT_LEVELS)[number];

export const FIT_LEVEL_LABEL: Record<FitLevel, string> = {
  great: "Great match",
  good: "Good match",
  everyday: "Everyday pick",
  care: "Use with care",
  avoid: "Not for your skin",
};

/** One explained contribution to a fit: a plus, or a caution that gated the badge. */
export interface FitReason {
  tone: "plus" | "caution";
  text: string;
}

export interface Fit {
  level: FitLevel;
  /** One-line reason from the top score contributor, e.g. "Picked for the oiliness in your scan". */
  reason: string;
  /** Two- or three-word badge text naming why, e.g. "Controls shine" or "Not for your skin". */
  tag?: string;
  /** 0–100 fit score, absent in hand-made fixtures. */
  score?: number;
  /** Full reasoning for "Why this fits you", cautions first. */
  reasons?: FitReason[];
}
