import type { Concern, SkinType } from "./skin";

export const STEPS = ["cleanse", "treat", "moisturize", "protect"] as const;
export type Step = (typeof STEPS)[number];

export const STEP_LABEL: Record<Step, string> = {
  cleanse: "Cleanse",
  treat: "Treat",
  moisturize: "Moisturize",
  protect: "Protect",
};

export const SUBTYPES = {
  cleanse: ["gel-foam-cleanser", "cream-milk-cleanser", "oil-balm-cleanser", "micellar-water", "medicated-cleanser"],
  treat: ["hydrating-toner", "exfoliating-toner", "serum", "spot-treatment", "mask", "eye-care"],
  moisturize: ["gel-moisturizer", "cream-moisturizer", "barrier-balm", "night-cream", "face-oil"],
  protect: ["sunscreen", "tinted-spf"],
} as const satisfies Record<Step, readonly string[]>;

export type Subtype = (typeof SUBTYPES)[Step][number];

export const SUBTYPE_LABEL: Record<Subtype, string> = {
  "gel-foam-cleanser": "Gel & foam cleansers",
  "cream-milk-cleanser": "Cream & milk cleansers",
  "oil-balm-cleanser": "Oil & balm cleansers",
  "micellar-water": "Micellar water",
  "medicated-cleanser": "Medicated cleansers",
  "hydrating-toner": "Hydrating toners",
  "exfoliating-toner": "Exfoliating toners & peels",
  serum: "Serums",
  "spot-treatment": "Spot treatments & patches",
  mask: "Masks",
  "eye-care": "Eye creams & serums",
  "gel-moisturizer": "Gel moisturizers",
  "cream-moisturizer": "Cream moisturizers",
  "barrier-balm": "Barrier repair balms",
  "night-cream": "Night creams",
  "face-oil": "Face oils",
  sunscreen: "Sunscreens",
  "tinted-spf": "Tinted SPF",
};

/** Packshot is drawn in code from these; the packshot component owns the visuals per shape. */
export const PACK_SHAPES = ["tube", "pump", "dropper", "jar", "bottle", "stick", "sachet"] as const;
export type PackShape = (typeof PACK_SHAPES)[number];
/** Theme color names (DESIGN.md), never raw values. */
export type PackColor = "brand" | "lilac" | "tangerine" | "surface" | "ink";

export type SkinTypeFit = "suitable" | "neutral" | "avoid";
export type SafetyNote = "pregnancy" | "strongActives";

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  step: Step;
  subtype: Subtype;
  price: number;
  currency: "USD";
  size: string;
  image: { kind: "svg"; shape: PackShape; color: PackColor };
  skinTypes: Record<SkinType, SkinTypeFit>;
  targets: { concern: Concern; strength: 1 | 2 | 3 }[];
  actives: { id: string; percent?: number }[];
  flags: { fragranceFree: boolean; nonComedogenic: boolean; alcoholFree: boolean; mineralSpf?: boolean; tinted?: boolean };
  spf?: number;
  safety: SafetyNote[];
  usage: { when: "am" | "pm" | "both"; howTo: string; frequency: string };
  ingredientsInci: string;
  bestseller?: boolean;
  new?: boolean;
}

/** What an active does to skin, as far as ranking rules care. */
export const ACTIVE_TAGS = [
  "exfoliant",
  "retinoid",
  "drying",
  "soothing",
  "barrier",
  "humectant",
  "tone",
  "uv-filter",
  "visible-light",
] as const;
export type ActiveTag = (typeof ACTIVE_TAGS)[number];

export interface Active {
  id: string;
  name: string;
  helps: Concern[];
  tags: ActiveTag[];
  /** Leave-on use deserves an "ask your doctor if pregnant" note. */
  pregnancyCaution?: boolean;
  /** Source ids from the knowledge sources table. */
  source: string[];
}
