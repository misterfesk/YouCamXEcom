/** Skin concerns scored by YouCam Skin Analysis (SD). Keys match the API's `type` field. */
export const CONCERNS = [
  "acne",
  "oiliness",
  "pore",
  "redness",
  "moisture",
  "texture",
  "age_spot",
  "radiance",
  "dark_circle_v2",
  "eye_bag",
  "tear_trough",
  "wrinkle",
  "firmness",
  "droopy_upper_eyelid",
  "droopy_lower_eyelid",
] as const;

export type Concern = (typeof CONCERNS)[number];

export const CONCERN_LABEL: Record<Concern, string> = {
  acne: "Breakouts",
  oiliness: "Oiliness",
  pore: "Pores",
  redness: "Redness",
  moisture: "Hydration",
  texture: "Texture",
  age_spot: "Dark spots",
  radiance: "Radiance",
  dark_circle_v2: "Dark circles",
  eye_bag: "Eye bags",
  tear_trough: "Tear troughs",
  wrinkle: "Fine lines",
  firmness: "Firmness",
  droopy_upper_eyelid: "Upper eyelids",
  droopy_lower_eyelid: "Lower eyelids",
};

export const SKIN_TYPES = ["normal", "oily", "dry", "combination"] as const;
export type SkinType = (typeof SKIN_TYPES)[number];

export const SKIN_TYPE_LABEL: Record<SkinType, string> = {
  normal: "Normal",
  oily: "Oily",
  dry: "Dry",
  combination: "Combination",
};

/** YouCam returns e.g. "Dry & Redness"; we split it into a base type and a redness flag. */
export interface ZoneSkinType {
  type: SkinType;
  redness: boolean;
}

export const FITZPATRICK_TYPES = ["I", "II", "III", "IV", "V", "VI"] as const;
export type FitzpatrickType = (typeof FITZPATRICK_TYPES)[number];

/** Absolute severity band, thresholds live in one config (calibrated later). */
export const BANDS = ["mild", "moderate", "noticeable"] as const;
export type Band = (typeof BANDS)[number];

export const BAND_LABEL: Record<Band, string> = {
  mild: "Mild",
  moderate: "Moderate",
  noticeable: "Noticeable",
};

export interface ConcernScore {
  concern: Concern;
  /** 0–100, higher = more pronounced. Derived as 100 − YouCam raw_score. */
  severity: number;
  band: Band;
  /** Public URL of the YouCam mask PNG (same size as the analysed photo), if kept. */
  maskUrl?: string;
}

/** Normalized scan result. Only derived scores are stored, never the photo. */
export interface SkinProfile {
  version: 1;
  scannedAt: string;
  source: "camera" | "upload" | "sample";
  skinType: { whole: ZoneSkinType; tZone: ZoneSkinType; uZone: ZoneSkinType };
  concerns: ConcernScore[];
  fitzpatrick: FitzpatrickType;
  /** Derived: redness flagged in any zone or redness band ≥ moderate. */
  sensitive: boolean;
  skinAge?: number;
}
