import { describe, expect, it } from "vitest";
import { buildSearchIndex, search } from "@/lib/search";
import { products } from "@/fixtures/ui/products";
const index = buildSearchIndex(products);
describe("catalog search", () => {
  it("finds concerns through familiar terms and multiword queries", () => {
    expect(search(index, "pimples").map((p) => p.name)).toContain(
      "Balance Notes Serum",
    );
    expect(
      search(index, "hydrating serum").map((p) => p.name),
    ).toContain("Water Reserve Serum");
    expect(
      search(index, "dark circles").some(
        (p) => p.subtype === "eye-care",
      ),
    ).toBe(true);
  });
  it("tolerates one typo in an ingredient without broad unrelated matches", () => {
    expect(search(index, "niacinamde").map((p) => p.name)).toContain(
      "Balance Notes Serum",
    );
    expect(search(index, "nothing matches this")).toEqual([]);
    expect(search(index, "!!!")).toEqual([]);
  });
  it("preserves exact names and concern words while expanding synonyms", () => {
    expect(search(index, "Sheer Veil Tinted SPF 50")[0]?.name).toBe(
      "Sheer Veil Tinted SPF 50",
    );
    expect(
      search(index, "spf").filter((product) => product.spf).length,
    ).toBe(3);
    expect(
      search(index, "sunscreen").filter((product) => product.spf)
        .length,
    ).toBe(3);
    expect(
      search(index, "dark spots").map((product) => product.name),
    ).toContain("Bright Notes Vitamin C Serum");
  });
  it("puts exact product names first and keeps the fixture order intact", () => {
    const before = products.map((p) => p.id);
    expect(search(index, "Water Reserve Serum")[0].name).toBe(
      "Water Reserve Serum",
    );
    expect(search(index, "   ").every((p) => p.bestseller)).toBe(
      true,
    );
    expect(products.map((p) => p.id)).toEqual(before);
  });
});
