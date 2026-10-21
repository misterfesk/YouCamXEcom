import { describe, expect, it } from "vitest";
import { getProducts } from "@/lib/catalog";
import { buildSearchIndex, search } from "@/lib/search";

const products = getProducts();
const index = buildSearchIndex(products);
const names = (query: string) => search(index, query).map((p) => p.name);

describe("catalog search", () => {
  it("finds concerns through everyday words and phrases", () => {
    expect(names("pimples")).toContain("Clarify Daily BHA Wash");
    expect(search(index, "dark circles").every((p) => p.targets.length > 0)).toBe(true);
    expect(search(index, "dark circles").some((p) => p.subtype === "eye-care")).toBe(true);
    expect(names("vitamin c")).toContain("Daybreak C 15 Serum");
    expect(search(index, "aha").length).toBeGreaterThan(0);
  });

  it("ranks a one-letter typo in a name first, without broad unrelated matches", () => {
    expect(names("niacinamde")[0]).toBe("Even Ground Niacinamide Serum");
    expect(names("nothing matches this")).toEqual([]);
    expect(names("!!!")).toEqual([]);
  });

  it("finds every sunscreen through spf and sunscreen", () => {
    const protect = products.filter((p) => p.step === "protect").length;
    expect(search(index, "spf").filter((p) => p.spf)).toHaveLength(protect);
    expect(search(index, "sunscreen").filter((p) => p.spf)).toHaveLength(protect);
  });

  it("puts exact names first, shows bestsellers for an empty query, keeps catalog order", () => {
    const before = products.map((p) => p.id);
    expect(names("Terra Tint Mineral SPF 50")[0]).toBe("Terra Tint Mineral SPF 50");
    expect(search(index, "   ").every((p) => p.bestseller)).toBe(true);
    expect(products.map((p) => p.id)).toEqual(before);
  });
});
