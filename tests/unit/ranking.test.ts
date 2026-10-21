import { describe, expect, it } from "vitest";
import { getProducts } from "@/lib/catalog";
import { sampleProfile } from "@/lib/skin/samples";
import { focusGoals, scoreGoals } from "@/lib/skin/goals";
import {
  compareFit,
  dailyEssentials,
  fitCatalog,
  fitProduct,
  goalShelf,
  routinePicks,
  sortByFit,
  targetsGoal,
} from "@/lib/ranking";
import { FIT_LEVELS } from "@/types/fit";
import { SAMPLE_FACES, type SampleFaceId } from "@/types/scan";

const products = getProducts();
const byName = (name: string) => products.find((p) => p.name === name)!;
const setup = (face: SampleFaceId) => {
  const profile = sampleProfile(face, "2026-10-20T00:00:00.000Z");
  const focus = focusGoals(scoreGoals(profile));
  return { profile, focus, fits: fitCatalog(products, profile, focus) };
};

describe("fit for each sample face", () => {
  it("shows every badge level somewhere in the catalog", () => {
    for (const face of SAMPLE_FACES) {
      const levels = new Set(Object.values(setup(face).fits).map((f) => f.level));
      expect([...levels].sort()).toEqual([...FIT_LEVELS].sort());
    }
  });

  it("gates strong actives on the sensitive (dry) sample", () => {
    const { fits } = setup("dry");
    for (const name of ["Level Up Glycolic Toner", "Night Retinol 0.3 Serum", "Benzoyl 5 Spot Gel"]) {
      expect(fits[byName(name).id]).toMatchObject({ level: "avoid" });
    }
    expect(fits[byName("Rose Cloud Cream").id].level).toBe("care");
  });

  it("flags PIH risk for strong exfoliants on deeper tones, not on Fitzpatrick II", () => {
    const peel = byName("Level Up Glycolic Toner").id;
    expect(setup("oily").fits[peel].level).toBe("care");
    expect(setup("oily").fits[peel].reason).toMatch(/dark marks/);
  });

  it("puts breakout care first on the breakouts shelf of the oily sample", () => {
    const { fits } = setup("oily");
    const shelf = goalShelf(products, fits, "breakouts");
    expect(shelf.length).toBeGreaterThanOrEqual(5);
    expect(shelf.every((p) => targetsGoal(p, "breakouts") && fits[p.id].level !== "avoid")).toBe(true);
    expect(fits[shelf[0].id].level).toBe("great");
  });

  it("explains every fit: card line equals the first reason", () => {
    for (const face of SAMPLE_FACES) {
      for (const fit of Object.values(setup(face).fits)) {
        expect(fit.reasons?.[0]?.text ?? "An everyday option for your routine").toBe(fit.reason);
        expect(fit.score).toBeGreaterThanOrEqual(0);
        expect(fit.score).toBeLessThanOrEqual(100);
      }
    }
  });

  it("matches the skin-type line on the PDP to the same rule as the badge", () => {
    const { profile } = setup("mature");
    const balm = byName("Barrier Butter Balm");
    const fit = fitProduct(balm, profile, []);
    expect(balm.skinTypes.oily).toBe("avoid");
    expect(fit).toMatchObject({ level: "avoid", reason: "Likely too rich for oily skin" });
  });
});

describe("sorting and shelves", () => {
  it("sorts by level, then score", () => {
    const { fits } = setup("mature");
    const sorted = sortByFit(products, fits);
    for (let i = 1; i < sorted.length; i++)
      expect(compareFit(fits[sorted[i - 1].id], fits[sorted[i].id])).toBeLessThanOrEqual(0);
    expect(fits[sorted.at(-1)!.id].level).toBe("avoid");
  });

  it("builds daily essentials: 2 cleansers, 2 moisturizers, 2 SPF, no cautions", () => {
    for (const face of SAMPLE_FACES) {
      const { fits } = setup(face);
      const essentials = dailyEssentials(products, fits);
      expect(essentials.map((p) => p.step)).toEqual([
        "cleanse",
        "cleanse",
        "moisturize",
        "moisturize",
        "protect",
        "protect",
      ]);
      expect(essentials.every((p) => ["great", "good", "everyday"].includes(fits[p.id].level))).toBe(true);
      expect(routinePicks(essentials).map((p) => p.step)).toEqual(["cleanse", "moisturize", "protect"]);
    }
    expect(dailyEssentials(products)).toHaveLength(6);
  });

  it("prefers high SPF for burn-prone skin", () => {
    const { fits } = setup("dry");
    const spf = products.filter((p) => p.step === "protect" && fits[p.id].level !== "avoid");
    const best = sortByFit(spf, fits)[0];
    expect(best.spf).toBeGreaterThanOrEqual(50);
  });
});
