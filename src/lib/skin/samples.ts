import { normalizeScan } from "./normalize";
import type { SampleFaceId } from "@/types/scan";
import type { SkinProfile } from "@/types/skin";
import oilySkin from "../../../fixtures/youcam/skin-analysis.oily.json";
import drySkin from "../../../fixtures/youcam/skin-analysis.dry.json";
import matureSkin from "../../../fixtures/youcam/skin-analysis.mature.json";
import oilyFitz from "../../../fixtures/youcam/fitzpatrick.oily.json";
import dryFitz from "../../../fixtures/youcam/fitzpatrick.dry.json";
import matureFitz from "../../../fixtures/youcam/fitzpatrick.mature.json";

/** Recorded real YouCam results for the AI-generated sample faces (0 credits). */
const RECORDED = {
  oily: [oilySkin, oilyFitz],
  dry: [drySkin, dryFitz],
  mature: [matureSkin, matureFitz],
} as const;

/** Sample results go through the same normalizer as live scans; masks are local files. */
export function sampleProfile(id: SampleFaceId, scannedAt = new Date().toISOString()): SkinProfile {
  const [skin, fitz] = RECORDED[id];
  return normalizeScan({
    output: skin.data.results.output,
    fitzpatrick: fitz.data.results.fitzpatrick_scale,
    source: "sample",
    scannedAt,
  });
}
