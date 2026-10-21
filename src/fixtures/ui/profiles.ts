import type { SampleFaceId } from "@/types/scan";
import type { SkinProfile } from "@/types/skin";

/**
 * Sample-face profiles from recorded YouCam responses (fixtures/youcam). Bands use provisional
 * thresholds until calibration; the real normalizer will replace this hand-off.
 */
export const sampleProfiles: Record<SampleFaceId, SkinProfile> = {
  oily: {
    version: 1,
    scannedAt: "2026-10-20T00:00:00.000Z",
    source: "sample",
    skinType: {
      whole: {
        type: "oily",
        redness: false,
      },
      tZone: {
        type: "oily",
        redness: false,
      },
      uZone: {
        type: "oily",
        redness: false,
      },
    },
    concerns: [
      {
        concern: "texture",
        severity: 82,
        band: "noticeable",
        maskUrl: "/samples/oily/masks/texture.png",
      },
      {
        concern: "moisture",
        severity: 72,
        band: "noticeable",
        maskUrl: "/samples/oily/masks/moisture.png",
      },
      {
        concern: "oiliness",
        severity: 63,
        band: "noticeable",
        maskUrl: "/samples/oily/masks/oiliness.png",
      },
      {
        concern: "dark_circle_v2",
        severity: 57,
        band: "noticeable",
        maskUrl: "/samples/oily/masks/dark_circle_v2.png",
      },
      {
        concern: "droopy_lower_eyelid",
        severity: 51,
        band: "moderate",
        maskUrl: "/samples/oily/masks/droopy_lower_eyelid.png",
      },
      {
        concern: "tear_trough",
        severity: 44,
        band: "moderate",
        maskUrl: "/samples/oily/masks/tear_trough.png",
      },
      {
        concern: "acne",
        severity: 43,
        band: "moderate",
        maskUrl: "/samples/oily/masks/acne.png",
      },
      {
        concern: "radiance",
        severity: 41,
        band: "moderate",
        maskUrl: "/samples/oily/masks/radiance.png",
      },
      {
        concern: "pore",
        severity: 35,
        band: "moderate",
        maskUrl: "/samples/oily/masks/pore.png",
      },
      {
        concern: "eye_bag",
        severity: 32,
        band: "moderate",
        maskUrl: "/samples/oily/masks/eye_bag.png",
      },
      {
        concern: "firmness",
        severity: 30,
        band: "moderate",
        maskUrl: "/samples/oily/masks/firmness.png",
      },
      {
        concern: "wrinkle",
        severity: 19,
        band: "mild",
        maskUrl: "/samples/oily/masks/wrinkle.png",
      },
      {
        concern: "age_spot",
        severity: 15,
        band: "mild",
        maskUrl: "/samples/oily/masks/age_spot.png",
      },
      {
        concern: "droopy_upper_eyelid",
        severity: 14,
        band: "mild",
        maskUrl: "/samples/oily/masks/droopy_upper_eyelid.png",
      },
      {
        concern: "redness",
        severity: 0,
        band: "mild",
        maskUrl: "/samples/oily/masks/redness.png",
      },
    ],
    fitzpatrick: "IV",
    sensitive: false,
    skinAge: 31,
  },
  dry: {
    version: 1,
    scannedAt: "2026-10-20T00:00:00.000Z",
    source: "sample",
    skinType: {
      whole: {
        type: "oily",
        redness: false,
      },
      tZone: {
        type: "oily",
        redness: false,
      },
      uZone: {
        type: "oily",
        redness: false,
      },
    },
    concerns: [
      {
        concern: "texture",
        severity: 59,
        band: "noticeable",
        maskUrl: "/samples/dry/masks/texture.png",
      },
      {
        concern: "moisture",
        severity: 52,
        band: "moderate",
        maskUrl: "/samples/dry/masks/moisture.png",
      },
      {
        concern: "redness",
        severity: 39,
        band: "moderate",
        maskUrl: "/samples/dry/masks/redness.png",
      },
      {
        concern: "pore",
        severity: 33,
        band: "moderate",
        maskUrl: "/samples/dry/masks/pore.png",
      },
      {
        concern: "droopy_lower_eyelid",
        severity: 32,
        band: "moderate",
        maskUrl: "/samples/dry/masks/droopy_lower_eyelid.png",
      },
      {
        concern: "oiliness",
        severity: 31,
        band: "moderate",
        maskUrl: "/samples/dry/masks/oiliness.png",
      },
      {
        concern: "radiance",
        severity: 27,
        band: "mild",
        maskUrl: "/samples/dry/masks/radiance.png",
      },
      {
        concern: "age_spot",
        severity: 20,
        band: "mild",
        maskUrl: "/samples/dry/masks/age_spot.png",
      },
      {
        concern: "eye_bag",
        severity: 17,
        band: "mild",
        maskUrl: "/samples/dry/masks/eye_bag.png",
      },
      {
        concern: "droopy_upper_eyelid",
        severity: 13,
        band: "mild",
        maskUrl: "/samples/dry/masks/droopy_upper_eyelid.png",
      },
      {
        concern: "tear_trough",
        severity: 11,
        band: "mild",
        maskUrl: "/samples/dry/masks/tear_trough.png",
      },
      {
        concern: "firmness",
        severity: 11,
        band: "mild",
        maskUrl: "/samples/dry/masks/firmness.png",
      },
      {
        concern: "acne",
        severity: 10,
        band: "mild",
        maskUrl: "/samples/dry/masks/acne.png",
      },
      {
        concern: "dark_circle_v2",
        severity: 8,
        band: "mild",
        maskUrl: "/samples/dry/masks/dark_circle_v2.png",
      },
      {
        concern: "wrinkle",
        severity: 6,
        band: "mild",
        maskUrl: "/samples/dry/masks/wrinkle.png",
      },
    ],
    fitzpatrick: "II",
    sensitive: true,
    skinAge: 33,
  },
  mature: {
    version: 1,
    scannedAt: "2026-10-20T00:00:00.000Z",
    source: "sample",
    skinType: {
      whole: {
        type: "oily",
        redness: false,
      },
      tZone: {
        type: "oily",
        redness: false,
      },
      uZone: {
        type: "oily",
        redness: false,
      },
    },
    concerns: [
      {
        concern: "eye_bag",
        severity: 80,
        band: "noticeable",
        maskUrl: "/samples/mature/masks/eye_bag.png",
      },
      {
        concern: "moisture",
        severity: 63,
        band: "noticeable",
        maskUrl: "/samples/mature/masks/moisture.png",
      },
      {
        concern: "firmness",
        severity: 61,
        band: "noticeable",
        maskUrl: "/samples/mature/masks/firmness.png",
      },
      {
        concern: "texture",
        severity: 60,
        band: "noticeable",
        maskUrl: "/samples/mature/masks/texture.png",
      },
      {
        concern: "oiliness",
        severity: 56,
        band: "noticeable",
        maskUrl: "/samples/mature/masks/oiliness.png",
      },
      {
        concern: "tear_trough",
        severity: 52,
        band: "moderate",
        maskUrl: "/samples/mature/masks/tear_trough.png",
      },
      {
        concern: "pore",
        severity: 49,
        band: "moderate",
        maskUrl: "/samples/mature/masks/pore.png",
      },
      {
        concern: "droopy_lower_eyelid",
        severity: 44,
        band: "moderate",
        maskUrl: "/samples/mature/masks/droopy_lower_eyelid.png",
      },
      {
        concern: "wrinkle",
        severity: 37,
        band: "moderate",
        maskUrl: "/samples/mature/masks/wrinkle.png",
      },
      {
        concern: "radiance",
        severity: 29,
        band: "mild",
        maskUrl: "/samples/mature/masks/radiance.png",
      },
      {
        concern: "age_spot",
        severity: 27,
        band: "mild",
        maskUrl: "/samples/mature/masks/age_spot.png",
      },
      {
        concern: "dark_circle_v2",
        severity: 27,
        band: "mild",
        maskUrl: "/samples/mature/masks/dark_circle_v2.png",
      },
      {
        concern: "droopy_upper_eyelid",
        severity: 16,
        band: "mild",
        maskUrl: "/samples/mature/masks/droopy_upper_eyelid.png",
      },
      {
        concern: "acne",
        severity: 14,
        band: "mild",
        maskUrl: "/samples/mature/masks/acne.png",
      },
      {
        concern: "redness",
        severity: 5,
        band: "mild",
        maskUrl: "/samples/mature/masks/redness.png",
      },
    ],
    fitzpatrick: "III",
    sensitive: false,
    skinAge: 61,
  },
};
