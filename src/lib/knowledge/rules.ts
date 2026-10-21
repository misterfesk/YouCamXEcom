import type { ActiveTag, Product } from "@/types/catalog";
import type { Band, Concern, FitzpatrickType, SkinProfile } from "@/types/skin";
import type { SourceId } from "./sources";

/**
 * Severity bands per concern (severity = 100 − YouCam raw_score). YouCam scores some concerns
 * low on every face (texture, moisture), so one global cut-off would flag them for everyone.
 * Provisional, set from the three recorded sample faces; recalibrated with more scans.
 */
export const BAND_THRESHOLDS: Record<Concern, { moderate: number; noticeable: number }> = {
  acne: { moderate: 20, noticeable: 40 },
  oiliness: { moderate: 35, noticeable: 60 },
  pore: { moderate: 30, noticeable: 55 },
  redness: { moderate: 25, noticeable: 50 },
  moisture: { moderate: 50, noticeable: 75 },
  texture: { moderate: 55, noticeable: 80 },
  age_spot: { moderate: 30, noticeable: 55 },
  radiance: { moderate: 30, noticeable: 55 },
  dark_circle_v2: { moderate: 35, noticeable: 65 },
  eye_bag: { moderate: 30, noticeable: 55 },
  tear_trough: { moderate: 35, noticeable: 60 },
  wrinkle: { moderate: 30, noticeable: 55 },
  firmness: { moderate: 30, noticeable: 55 },
  droopy_upper_eyelid: { moderate: 40, noticeable: 65 },
  droopy_lower_eyelid: { moderate: 40, noticeable: 65 },
};

/** Severity at which we add a soft "a dermatologist can help" note. Never blocks shopping. */
export const DERMATOLOGIST_NOTE: Partial<Record<Concern, number>> = {
  acne: 75,
  redness: 70,
};
export const DERMATOLOGIST_SOURCES: SourceId[] = ["aad-acne-tips", "dermnet-rosacea"];

/** Fit score weights. Score is clamped to 0–100. */
export const WEIGHTS = {
  /** Goal weight for products targeting one of the user's top three goals. */
  focusGoal: 1,
  otherGoal: 0.4,
  /** Points per unit of severity(0–1) × strength(1–3) × goal weight. */
  concernScale: 24,
  skinTypeSuitable: 10,
  /** Fitzpatrick I–II, SPF 50+ / below 50. */
  spfBurnProne: 30,
  spfBurnProneLow: 18,
  /** Fitzpatrick III–VI: any SPF, plus tint (visible light), plus gentle tone actives. */
  spfDeeperTone: 26,
  tintDeeperTone: 8,
  toneActiveDeeperTone: 6,
  /** Sensitive-looking skin: soothing or barrier actives. */
  soothingSensitive: 6,
} as const;

/** Fit score bands for the badge, after caution gates. */
export const FIT_BANDS = { great: 70, good: 40 } as const;

export interface RuleContext {
  product: Product;
  profile: SkinProfile;
  /** Union of tags of the product's actives. */
  tags: Set<ActiveTag>;
  bandOf: (concern: Concern) => Band;
}

export interface CautionRule {
  id: string;
  level: "avoid" | "care";
  applies: (ctx: RuleContext) => boolean;
  reason: (ctx: RuleContext) => string;
  source: SourceId[];
}

export const DEEPER_TONES: FitzpatrickType[] = ["III", "IV", "V", "VI"];
export const BURN_PRONE: FitzpatrickType[] = ["I", "II"];

const atLeast = (band: Band, min: Band) =>
  ["mild", "moderate", "noticeable"].indexOf(band) >= ["mild", "moderate", "noticeable"].indexOf(min);

/** Contraindications gate the badge before the score is read. Order = priority. */
export const CAUTION_RULES: CautionRule[] = [
  {
    id: "sensitive-strong-actives",
    level: "avoid",
    applies: ({ product, profile, tags }) =>
      profile.sensitive &&
      product.safety.includes("strongActives") &&
      (tags.has("exfoliant") || tags.has("retinoid") || tags.has("drying")),
    reason: () => "Strong actives can upset skin that shows redness",
    source: ["dermnet-rosacea", "aad-exfoliate"],
  },
  {
    id: "skin-type-avoid",
    level: "avoid",
    applies: ({ product, profile }) => product.skinTypes[profile.skinType.whole.type] === "avoid",
    reason: ({ profile }) =>
      profile.skinType.whole.type === "dry"
        ? "Likely too drying for dry skin"
        : "Likely too rich for oily skin",
    source: ["aad-acne-tips", "aad-dry-skin"],
  },
  {
    id: "fragrance-sensitive",
    level: "care",
    applies: ({ product, profile }) => profile.sensitive && !product.flags.fragranceFree,
    reason: () => "Contains fragrance; patch test first on skin that shows redness",
    source: ["dermnet-fragrance", "dermnet-rosacea"],
  },
  {
    id: "deeper-tone-strong-exfoliant",
    level: "care",
    applies: ({ product, profile, tags }) =>
      DEEPER_TONES.includes(profile.fitzpatrick) &&
      tags.has("exfoliant") &&
      product.safety.includes("strongActives"),
    reason: () => "Start slowly: strong exfoliation can leave dark marks on deeper skin tones",
    source: ["davis-2010", "dermnet-pih"],
  },
  {
    id: "comedogenic-acne",
    level: "care",
    applies: ({ product, bandOf }) =>
      !product.flags.nonComedogenic && atLeast(bandOf("acne"), "moderate"),
    reason: () => "A richer formula; watch for new breakouts",
    source: ["aad-acne-tips"],
  },
  {
    id: "drying-dehydrated",
    level: "care",
    applies: ({ tags, bandOf }) => tags.has("drying") && bandOf("moisture") === "noticeable",
    reason: () => "Can feel drying; follow with a moisturizer",
    source: ["aad-acne-tips", "aad-dry-skin"],
  },
];

/** Sun copy for the reveal and the protect step, keyed by Fitzpatrick type. Never "whitening". */
export const SUN_NOTE: Record<FitzpatrickType, string> = {
  I: "Your skin likely burns easily. A high SPF every morning matters most.",
  II: "Your skin likely burns easily. A high SPF every morning matters most.",
  III: "Your skin can burn and tan. Daily SPF also helps prevent dark marks.",
  IV: "Your skin tans more than it burns, and dark marks can linger. Daily SPF helps, and a tint adds visible-light protection.",
  V: "Your skin rarely burns, but dark marks can linger. Daily SPF helps, and a tint adds visible-light protection.",
  VI: "Your skin rarely burns, but dark marks can linger. Daily SPF helps, and a tint adds visible-light protection.",
};
export const SUN_SOURCES: SourceId[] = ["aad-sunscreen-faq", "lyons-2021", "davis-2010"];
