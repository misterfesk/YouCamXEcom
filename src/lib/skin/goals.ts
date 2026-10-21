import { BAND_THRESHOLDS, DERMATOLOGIST_NOTE } from "@/lib/knowledge/rules";
import { GOALS, GOAL_DEFS, type GoalId, type GoalScore } from "@/types/goal";
import { SKIN_TYPE_LABEL, type Concern, type SkinProfile } from "@/types/skin";
import type { ProfileSummary } from "@/types/storefront";

/** How far a concern sits toward its own "noticeable" line; comparable across concerns. */
const relative = (concern: Concern, severity: number) =>
  severity / BAND_THRESHOLDS[concern].noticeable;

/** Every goal for this profile, most pronounced first (relative to each concern's bands). */
export function scoreGoals(profile: SkinProfile): GoalScore[] {
  return GOALS.flatMap((goal) => {
    const scores = profile.concerns.filter((c) => GOAL_DEFS[goal].concerns.includes(c.concern));
    if (!scores.length) return [];
    const top = scores.reduce((a, b) =>
      relative(b.concern, b.severity) > relative(a.concern, a.severity) ? b : a,
    );
    return [{ goal, severity: top.severity, band: top.band, rank: relative(top.concern, top.severity) }];
  })
    .sort((a, b) => b.rank - a.rank)
    .map(({ goal, severity, band }) => ({ goal, severity, band }));
}

export const focusGoals = (goals: GoalScore[]): GoalId[] => goals.slice(0, 3).map((g) => g.goal);

/** All three focus goals mild → "Your skin looks balanced". */
export const isBalanced = (goals: GoalScore[]) => goals.slice(0, 3).every((g) => g.band === "mild");

/** Concerns past the dermatologist-note threshold (acne, redness). */
export const dermatologistConcerns = (profile: SkinProfile): Concern[] =>
  profile.concerns
    .filter((c) => {
      const limit = DERMATOLOGIST_NOTE[c.concern];
      return limit !== undefined && c.severity >= limit;
    })
    .map((c) => c.concern);

export function summarizeProfile(profile: SkinProfile): ProfileSummary {
  const goals = scoreGoals(profile);
  return {
    skinType: profile.skinType.whole.type,
    goals,
    label: [SKIN_TYPE_LABEL[profile.skinType.whole.type], goals[0] && GOAL_DEFS[goals[0].goal].title]
      .filter(Boolean)
      .join(" · "),
    dermatologist: dermatologistConcerns(profile).length > 0,
  };
}
