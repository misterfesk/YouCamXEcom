import { BAND_THRESHOLDS } from "@/lib/knowledge/rules";
import {
  CONCERNS,
  FITZPATRICK_TYPES,
  type Band,
  type Concern,
  type ConcernScore,
  type FitzpatrickType,
  type SkinProfile,
  type SkinType,
  type ZoneSkinType,
} from "@/types/skin";

/** One entry of YouCam Skin Analysis `data.results.output` (concern, skin_type zone, all, skin_age…). */
export interface SkinAnalysisOutput {
  type: string;
  raw_score?: number;
  ui_score?: number;
  score?: number;
  region?: string;
  skin_type?: string;
  mask_urls?: string[];
}

export function bandFor(concern: Concern, severity: number): Band {
  const { moderate, noticeable } = BAND_THRESHOLDS[concern];
  if (severity >= noticeable) return "noticeable";
  if (severity >= moderate) return "moderate";
  return "mild";
}

/** YouCam labels look like "Oily", "Combination" or "Dry & Redness". */
export function parseSkinType(label: string | undefined): ZoneSkinType {
  const text = (label ?? "").toLowerCase();
  const type = (["combination", "oily", "dry", "normal"] as SkinType[]).find((t) =>
    text.includes(t),
  );
  return { type: type ?? "normal", redness: text.includes("redness") };
}

const isConcern = (type: string): type is Concern =>
  (CONCERNS as readonly string[]).includes(type);

export function normalizeScan({
  output,
  fitzpatrick,
  source,
  scannedAt = new Date().toISOString(),
  keepMasks = true,
}: {
  output: SkinAnalysisOutput[];
  fitzpatrick: string;
  source: SkinProfile["source"];
  scannedAt?: string;
  /** Live mask URLs expire; sample masks are local files. */
  keepMasks?: boolean;
}): SkinProfile {
  const concerns: ConcernScore[] = [];
  const zones: Partial<Record<"whole" | "t_zone" | "u_zone", ZoneSkinType>> = {};
  let skinAge: number | undefined;
  for (const item of output) {
    if (item.type === "skin_type" && item.region) {
      zones[item.region as "whole"] = parseSkinType(item.skin_type);
    } else if (item.type === "skin_age" && typeof item.score === "number") {
      skinAge = Math.round(item.score);
    } else if (isConcern(item.type) && typeof item.raw_score === "number") {
      const severity = Math.round(Math.min(100, Math.max(0, 100 - item.raw_score)));
      const mask = item.mask_urls?.[0];
      concerns.push({
        concern: item.type,
        severity,
        band: bandFor(item.type, severity),
        ...(keepMasks && mask ? { maskUrl: mask } : {}),
      });
    }
  }
  concerns.sort((a, b) => b.severity - a.severity);
  const whole = zones.whole ?? zones.t_zone ?? { type: "normal", redness: false };
  const redness = concerns.find((c) => c.concern === "redness");
  const fitz = (FITZPATRICK_TYPES as readonly string[]).includes(fitzpatrick)
    ? (fitzpatrick as FitzpatrickType)
    : "III";
  return {
    version: 1,
    scannedAt,
    source,
    skinType: { whole, tZone: zones.t_zone ?? whole, uZone: zones.u_zone ?? whole },
    concerns,
    fitzpatrick: fitz,
    sensitive:
      whole.redness ||
      !!zones.t_zone?.redness ||
      !!zones.u_zone?.redness ||
      (!!redness && redness.band !== "mild"),
    ...(skinAge !== undefined ? { skinAge } : {}),
  };
}
