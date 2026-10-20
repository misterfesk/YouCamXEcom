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

export interface Fit {
  level: FitLevel;
  /** One-line reason from the top score contributor, e.g. "Targets your T-zone oil (Moderate)". */
  reason: string;
}
