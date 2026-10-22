import { ACTIVE_BY_ID } from "@/lib/knowledge/actives";
import {
  BAND_THRESHOLDS,
  BURN_PRONE,
  CAUTION_RULES,
  DEEPER_TONES,
  FIT_BANDS,
  WEIGHTS,
  type RuleContext,
} from "@/lib/knowledge/rules";
import { bandFor } from "@/lib/skin/normalize";
import type { ActiveTag, Product, Step, Subtype } from "@/types/catalog";
import { FIT_LEVELS, FIT_LEVEL_LABEL, type Fit, type FitLevel, type FitReason } from "@/types/fit";
import { GOALS, GOAL_DEFS, type GoalId } from "@/types/goal";
import { SKIN_TYPE_LABEL, type Band, type Concern, type SkinProfile } from "@/types/skin";

/** How a concern reads in a fit reason: "Picked for the {phrase} in your scan". */
const CONCERN_PHRASE: Record<Concern, string> = {
  acne: "breakouts",
  oiliness: "shine",
  pore: "visible pores",
  redness: "redness",
  moisture: "dryness",
  texture: "uneven texture",
  age_spot: "dark spots",
  radiance: "dullness",
  dark_circle_v2: "dark circles",
  eye_bag: "under-eye puffiness",
  tear_trough: "under-eye hollows",
  wrinkle: "fine lines",
  firmness: "loss of firmness",
  droopy_upper_eyelid: "eye area",
  droopy_lower_eyelid: "eye area",
};

/** What a product does for a concern, as card badge text. */
const CONCERN_TAG: Record<Concern, string> = {
  acne: "Targets breakouts",
  oiliness: "Controls shine",
  pore: "Refines pores",
  redness: "Calms redness",
  moisture: "Hydrates",
  texture: "Smooths texture",
  age_spot: "For dark spots",
  radiance: "Boosts glow",
  dark_circle_v2: "For dark circles",
  eye_bag: "For puffy eyes",
  tear_trough: "For under-eyes",
  wrinkle: "For fine lines",
  firmness: "For firmness",
  droopy_upper_eyelid: "For the eye area",
  droopy_lower_eyelid: "For the eye area",
};

const GOAL_OF = Object.fromEntries(
  GOALS.flatMap((goal) => GOAL_DEFS[goal].concerns.map((concern) => [concern, goal])),
) as Record<Concern, GoalId>;

export const goalOf = (concern: Concern) => GOAL_OF[concern];

export const targetsGoal = (product: Product, goal: GoalId) =>
  product.targets.some((t) => GOAL_DEFS[goal].concerns.includes(t.concern));

export function activeTags(product: Product): Set<ActiveTag> {
  return new Set(product.actives.flatMap((a) => ACTIVE_BY_ID[a.id]?.tags ?? []));
}

type Contribution = { points: number; text: string; tag: string };

/**
 * Severity read through the concern's own bands so concerns compare fairly:
 * moderate spans 0.7–1, noticeable is 1 (mild concerns are skipped before this).
 */
const relativeSeverity = ({ concern, severity }: { concern: Concern; severity: number }) => {
  const { moderate, noticeable } = BAND_THRESHOLDS[concern];
  return Math.min(1, 0.7 + (0.3 * (severity - moderate)) / (noticeable - moderate));
};

/**
 * Fit of one product for one profile. Caution rules gate the level first (avoid, then care);
 * otherwise the score band decides. Every contribution carries its own reason.
 */
export function fitProduct(product: Product, profile: SkinProfile, focus: GoalId[]): Fit {
  const severity = new Map(profile.concerns.map((c) => [c.concern, c]));
  const bandOf = (concern: Concern): Band => severity.get(concern)?.band ?? bandFor(concern, 0);
  const tags = activeTags(product);
  const ctx: RuleContext = { product, profile, tags, bandOf };

  // Several targets with one phrase (both eyelid keys) merge into one reason.
  const byText = new Map<string, Contribution>();
  for (const target of product.targets) {
    const score = severity.get(target.concern);
    // Mild concerns are not "yours" to target; they add neither points nor reasons.
    if (!score || score.band === "mild") continue;
    const weight = focus.includes(goalOf(target.concern)) ? WEIGHTS.focusGoal : WEIGHTS.otherGoal;
    const points = relativeSeverity(score) * target.strength * weight * WEIGHTS.concernScale;
    const text = `Picked for the ${CONCERN_PHRASE[target.concern]} in your scan`;
    const tag = CONCERN_TAG[target.concern];
    byText.set(text, { text, tag, points: (byText.get(text)?.points ?? 0) + points });
  }
  // Scale the concern reasons down together when they pass the cap; order is kept.
  const concernTotal = [...byText.values()].reduce((sum, c) => sum + c.points, 0);
  const capScale = concernTotal > WEIGHTS.concernCap ? WEIGHTS.concernCap / concernTotal : 1;
  const contributions = [...byText.values()].map((c) => ({ ...c, points: c.points * capScale }));

  const skinType = profile.skinType.whole.type;
  if (product.skinTypes[skinType] === "suitable")
    contributions.push({
      points: WEIGHTS.skinTypeSuitable,
      text: `Suits ${SKIN_TYPE_LABEL[skinType].toLowerCase()} skin`,
      tag: `Suits ${SKIN_TYPE_LABEL[skinType].toLowerCase()} skin`,
    });

  if (product.step === "protect") {
    if (BURN_PRONE.includes(profile.fitzpatrick)) {
      const high = (product.spf ?? 0) >= 50;
      contributions.push({
        points: high ? WEIGHTS.spfBurnProne : WEIGHTS.spfBurnProneLow,
        text: high
          ? "High SPF for skin that burns easily"
          : "Daily SPF; skin that burns easily does best with SPF 50",
        tag: high ? "High SPF for you" : "Daily SPF",
      });
    } else {
      contributions.push({
        points: WEIGHTS.spfDeeperTone,
        text: "Daily SPF helps prevent lingering dark marks",
        tag: "Daily SPF",
      });
      if (product.flags.tinted || tags.has("visible-light"))
        contributions.push({
          points: WEIGHTS.tintDeeperTone,
          text: "Tint adds visible-light protection for dark marks",
          tag: "Tinted SPF",
        });
    }
  }

  const toneConcern = (["age_spot", "radiance"] as Concern[]).some((c) => bandOf(c) !== "mild");
  if (DEEPER_TONES.includes(profile.fitzpatrick) && toneConcern && tags.has("tone"))
    contributions.push({
      points: WEIGHTS.toneActiveDeeperTone,
      text: "A gentle tone-evening active suited to deeper skin tones",
      tag: "Evens tone gently",
    });

  if (profile.sensitive && (tags.has("soothing") || tags.has("barrier")))
    contributions.push({
      points: WEIGHTS.soothingSensitive,
      text: "Soothing, barrier-friendly ingredients for skin that shows redness",
      tag: "Soothing",
    });

  contributions.sort((a, b) => b.points - a.points);
  const score = Math.round(
    Math.min(100, Math.max(0, contributions.reduce((sum, c) => sum + c.points, 0))),
  );
  const cautions = CAUTION_RULES.filter((rule) => rule.applies(ctx));
  const gate = cautions.find((r) => r.level === "avoid") ?? cautions[0];
  const level: FitLevel = gate
    ? gate.level
    : score >= FIT_BANDS.great
      ? "great"
      : score >= FIT_BANDS.good
        ? "good"
        : "everyday";
  const reasons: FitReason[] = [
    ...cautions.map((rule) => ({ tone: "caution" as const, text: rule.reason(ctx) })),
    ...contributions.map((c) => ({ tone: "plus" as const, text: c.text })),
  ];
  const reason = gate
    ? gate.reason(ctx)
    : (contributions[0]?.text ?? "An everyday option for your routine");
  const tag = gate ? gate.tag : (contributions[0]?.tag ?? FIT_LEVEL_LABEL.everyday);
  return { level, reason, tag, score, reasons };
}

export type FitMap = Record<string, Fit>;

export function fitCatalog(products: Product[], profile: SkinProfile, focus: GoalId[]): FitMap {
  return Object.fromEntries(products.map((p) => [p.id, fitProduct(p, profile, focus)]));
}

const levelRank = (fit?: Fit) => FIT_LEVELS.indexOf(fit?.level ?? "everyday");

/** Best first: level order, then score; ties keep catalog order. */
export function compareFit(a?: Fit, b?: Fit): number {
  return levelRank(a) - levelRank(b) || (b?.score ?? 0) - (a?.score ?? 0);
}

export function sortByFit(products: Product[], fits: FitMap): Product[] {
  return [...products].sort((a, b) => compareFit(fits[a.id], fits[b.id]));
}

const shelfSafe = (fit?: Fit) => fit?.level !== "avoid" && fit?.level !== "care";

/** One goal section: products targeting the goal, never "avoid", best fit first. */
export function goalShelf(products: Product[], fits: FitMap, goal: GoalId, limit = 6): Product[] {
  return sortByFit(
    products.filter((p) => targetsGoal(p, goal) && fits[p.id]?.level !== "avoid"),
    fits,
  ).slice(0, limit);
}

const ESSENTIAL_SUBTYPES: Partial<Record<Step, Subtype[]>> = {
  cleanse: ["gel-foam-cleanser", "cream-milk-cleanser", "micellar-water", "oil-balm-cleanser"],
  moisturize: ["gel-moisturizer", "cream-moisturizer", "barrier-balm"],
  protect: ["sunscreen", "tinted-spf"],
};
export const ESSENTIAL_STEPS = Object.keys(ESSENTIAL_SUBTYPES) as Step[];

/** Basic 3-step routine: top 2 per step without cautions. Without fits: catalog order. */
export function dailyEssentials(products: Product[], fits?: FitMap): Product[] {
  return ESSENTIAL_STEPS.flatMap((step) => {
    const subtypes = ESSENTIAL_SUBTYPES[step] ?? [];
    const pool = products.filter(
      (p) => subtypes.includes(p.subtype) && (!fits || shelfSafe(fits[p.id])),
    );
    return (fits ? sortByFit(pool, fits) : pool).slice(0, 2);
  });
}

/** "Add routine to bag": the first pick of each essential step. */
export function routinePicks(essentials: Product[]): Product[] {
  return ESSENTIAL_STEPS.flatMap((step) => essentials.find((p) => p.step === step) ?? []);
}
