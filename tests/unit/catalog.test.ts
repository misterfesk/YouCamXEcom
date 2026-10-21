import { describe, expect, it } from "vitest";
import raw from "../../data/products.json";
import { parseCatalog } from "../../src/lib/catalog/schema";
import { getProduct, getProductBySlug, getProductsByStep, catalogFilterOptions } from "../../src/lib/catalog";
import { ACTIVE_BY_ID } from "../../src/lib/knowledge/actives";
import { STEPS, SUBTYPES } from "../../src/types/catalog";
import { GOALS, GOAL_DEFS } from "../../src/types/goal";
import { SKIN_TYPES } from "../../src/types/skin";

const products = parseCatalog(raw);
const count = (fn: (p: (typeof products)[number]) => boolean) => products.filter(fn).length;

describe("catalog data", () => {
  it("passes the schema and has about 60 products", () => {
    expect(products.length).toBeGreaterThanOrEqual(55);
    expect(products.length).toBeLessThanOrEqual(65);
  });

  it("rejects bad data", () => {
    const bad = structuredClone(raw) as unknown as Record<string, unknown>[];
    bad[0].subtype = "mask";
    expect(() => parseCatalog(bad)).toThrow();
    expect(() => parseCatalog([...raw, raw[0]])).toThrow();
  });

  it("has 2 to 5 products in every subtype", () => {
    for (const step of STEPS) {
      for (const subtype of SUBTYPES[step]) {
        const n = count((p) => p.subtype === subtype);
        expect(n, subtype).toBeGreaterThanOrEqual(2);
        expect(n, subtype).toBeLessThanOrEqual(5);
      }
    }
  });

  it("targets every goal with at least 5 products", () => {
    for (const goal of GOALS) {
      const concerns = GOAL_DEFS[goal].concerns;
      const n = count((p) => p.targets.some((t) => concerns.includes(t.concern)));
      expect(n, goal).toBeGreaterThanOrEqual(5);
    }
  });

  it("has 2 suitable products per step and skin type", () => {
    for (const step of STEPS) {
      for (const type of SKIN_TYPES) {
        const n = count((p) => p.step === step && p.skinTypes[type] === "suitable");
        expect(n, `${step}/${type}`).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("covers the caution cases", () => {
    expect(count((p) => p.safety.includes("strongActives"))).toBeGreaterThanOrEqual(4);
    expect(
      count((p) => p.subtype === "exfoliating-toner" && p.safety.includes("strongActives")) +
        count((p) => p.subtype === "mask" && p.safety.includes("strongActives")),
    ).toBeGreaterThanOrEqual(2);
    expect(count((p) => !p.flags.fragranceFree)).toBeGreaterThanOrEqual(4);
    expect(count((p) => !p.flags.nonComedogenic && p.skinTypes.oily === "avoid")).toBeGreaterThanOrEqual(4);
    expect(count((p) => p.skinTypes.dry === "avoid")).toBeGreaterThanOrEqual(2);
    for (const fit of ["suitable", "neutral", "avoid"] as const) {
      expect(count((p) => SKIN_TYPES.some((t) => p.skinTypes[t] === fit))).toBeGreaterThan(0);
    }
    expect(count((p) => p.safety.includes("pregnancy"))).toBeGreaterThan(0);
  });

  it("only targets concerns its own actives help", () => {
    for (const p of products) {
      const helped = new Set(p.actives.flatMap((a) => ACTIVE_BY_ID[a.id].helps));
      for (const t of p.targets) expect(helped.has(t.concern), `${p.id}: ${t.concern}`).toBe(true);
      expect(p.targets.length, p.id).toBeGreaterThan(0);
    }
  });

  it("keeps flags consistent with ingredients", () => {
    for (const p of products) {
      expect(/\bParfum\b/.test(p.ingredientsInci), `${p.id} fragrance`).toBe(!p.flags.fragranceFree);
      expect(p.ingredientsInci.includes("Alcohol Denat."), `${p.id} alcohol`).toBe(!p.flags.alcoholFree);
      if (p.flags.mineralSpf) expect(p.ingredientsInci).toMatch(/Zinc Oxide|Titanium Dioxide/);
      if (p.flags.tinted) expect(p.ingredientsInci).toContain("Iron Oxides");
    }
  });

  it("describes protect products correctly", () => {
    const protect = products.filter((p) => p.step === "protect");
    expect(protect.every((p) => p.spf! >= 30 && p.spf! <= 50)).toBe(true);
    expect(protect.filter((p) => p.spf === 50).length).toBeGreaterThanOrEqual(2);
    expect(protect.filter((p) => p.spf === 30).length).toBeGreaterThanOrEqual(1);
    expect(protect.some((p) => p.flags.mineralSpf)).toBe(true);
    expect(protect.some((p) => !p.flags.mineralSpf && !p.flags.tinted)).toBe(true);
    for (const p of protect) expect(p.description).toMatch(/not a tested retail sunscreen/);
    for (const p of protect.filter((x) => x.subtype === "tinted-spf")) {
      expect(p.flags.tinted).toBe(true);
      expect(p.description).toMatch(/may not suit every skin tone/);
    }
  });

  it("has sane prices and badges", () => {
    for (const p of products) {
      expect(p.price).toBeGreaterThanOrEqual(12);
      expect(p.price).toBeLessThanOrEqual(48);
    }
    expect(count((p) => p.bestseller === true)).toBeGreaterThanOrEqual(6);
    expect(count((p) => p.new === true)).toBeGreaterThanOrEqual(3);
  });

  it("has safety notes where strong actives are", () => {
    for (const p of products) {
      if (p.actives.some((a) => ACTIVE_BY_ID[a.id].tags.includes("retinoid"))) {
        expect(p.safety, p.id).toEqual(expect.arrayContaining(["strongActives", "pregnancy"]));
      }
    }
  });

  it("keeps copy free of banned claims", () => {
    const banned = /whiten|fair(ness)?\b|bright|clinically|dermatologist[- ]tested|non-comedogenic|guarantee/i;
    for (const p of products) {
      for (const field of [p.name, p.tagline, p.description, p.usage.howTo]) {
        expect(banned.test(field), `${p.id}: ${field}`).toBe(false);
      }
    }
  });
});

describe("catalog access", () => {
  it("looks products up", () => {
    const first = products[0];
    expect(getProduct(first.id)?.name).toBe(first.name);
    expect(getProductBySlug(first.slug)?.id).toBe(first.id);
    expect(getProduct("nope")).toBeUndefined();
    expect(getProductsByStep("protect").length).toBe(count((p) => p.step === "protect"));
  });

  it("builds filter options with active names", () => {
    const options = catalogFilterOptions("treat");
    expect(options.subtype.length).toBe(SUBTYPES.treat.length + 1);
    expect(options.active.some((o) => o.label === "Salicylic acid (BHA)")).toBe(true);
  });
});
