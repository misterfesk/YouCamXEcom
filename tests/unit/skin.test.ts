import { describe, expect, it } from "vitest";
import { normalizeScan, parseSkinType } from "@/lib/skin/normalize";
import { dermatologistConcerns, focusGoals, isBalanced, scoreGoals } from "@/lib/skin/goals";
import { SAMPLE_FACES, type SampleFaceId } from "@/types/scan";
import { CONCERNS } from "@/types/skin";
import { sampleProfile } from "@/lib/skin/samples";
import oilySkin from "../../fixtures/youcam/skin-analysis.oily.json";

const profileOf = (face: SampleFaceId) => sampleProfile(face, "2026-10-20T00:00:00.000Z");

describe("normalizeScan", () => {
  it("keeps every concern, severity = 100 − raw_score, sorted high first", () => {
    for (const face of SAMPLE_FACES) {
      const profile = profileOf(face);
      expect(profile.concerns.map((c) => c.concern).sort()).toEqual([...CONCERNS].sort());
      const severities = profile.concerns.map((c) => c.severity);
      expect(severities).toEqual([...severities].sort((a, b) => b - a));
    }
    const acne = oilySkin.data.results.output.find((o) => o.type === "acne")!;
    expect(profileOf("oily").concerns.find((c) => c.concern === "acne")!.severity).toBe(
      Math.round(100 - acne.raw_score!),
    );
  });

  it("reads skin type, Fitzpatrick and skin age", () => {
    expect(profileOf("oily")).toMatchObject({ fitzpatrick: "IV", skinAge: 31 });
    expect(profileOf("dry").fitzpatrick).toBe("II");
    expect(profileOf("mature")).toMatchObject({ fitzpatrick: "III", skinAge: 61 });
    expect(profileOf("oily").skinType.whole).toEqual({ type: "oily", redness: false });
  });

  it("flags sensitive from redness (zone label or band)", () => {
    expect(profileOf("dry").sensitive).toBe(true);
    expect(profileOf("oily").sensitive).toBe(false);
    expect(parseSkinType("Dry & Redness")).toEqual({ type: "dry", redness: true });
    expect(parseSkinType("Combination")).toEqual({ type: "combination", redness: false });
  });

  it("drops masks when asked (live URLs expire)", () => {
    const profile = normalizeScan({
      output: oilySkin.data.results.output,
      fitzpatrick: "IV",
      source: "upload",
      keepMasks: false,
    });
    expect(profile.concerns.every((c) => !c.maskUrl)).toBe(true);
  });
});

describe("goals", () => {
  it("locks the top three goals of each sample face", () => {
    expect(focusGoals(scoreGoals(profileOf("oily")))).toEqual(["breakouts", "oil-pores", "hydrate"]);
    expect(focusGoals(scoreGoals(profileOf("dry")))).toEqual(["calm", "hydrate", "oil-pores"]);
    expect(focusGoals(scoreGoals(profileOf("mature")))).toEqual(["under-eyes", "smooth-firm", "oil-pores"]);
  });

  it("covers all seven goals and only calls all-mild skin balanced", () => {
    for (const face of SAMPLE_FACES) {
      const goals = scoreGoals(profileOf(face));
      expect(goals).toHaveLength(7);
      expect(isBalanced(goals)).toBe(false);
    }
    const calm = profileOf("dry");
    calm.concerns = calm.concerns.map((c) => ({ ...c, severity: 5, band: "mild" }));
    expect(isBalanced(scoreGoals(calm))).toBe(true);
  });

  it("adds a dermatologist note only at high acne or redness", () => {
    for (const face of SAMPLE_FACES) expect(dermatologistConcerns(profileOf(face))).toEqual([]);
    const severe = profileOf("oily");
    severe.concerns = severe.concerns.map((c) => (c.concern === "acne" ? { ...c, severity: 80 } : c));
    expect(dermatologistConcerns(severe)).toEqual(["acne"]);
  });
});
