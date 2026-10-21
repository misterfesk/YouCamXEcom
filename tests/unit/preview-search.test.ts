import { describe, expect, it } from "vitest";
import { searchProducts } from "@/app/preview-search";
import { products } from "@/fixtures/ui/products";
describe("storefront preview search", () => {
  it("finds concerns through familiar terms and multiword queries", () => {
    expect(searchProducts(products, "pimples").map((p) => p.name)).toContain(
      "Balance Notes Serum",
    );
    expect(
      searchProducts(products, "hydrating serum").map((p) => p.name),
    ).toContain("Water Reserve Serum");
    expect(
      searchProducts(products, "dark circles").some(
        (p) => p.subtype === "eye-care",
      ),
    ).toBe(true);
  });
  it("tolerates one typo in an ingredient without broad unrelated matches", () => {
    expect(searchProducts(products, "niacinamde").map((p) => p.name)).toContain(
      "Balance Notes Serum",
    );
    expect(searchProducts(products, "nothing matches this")).toEqual([]);
    expect(searchProducts(products, "!!!")).toEqual([]);
  });
  it("puts exact product names first and keeps the fixture order intact", () => {
    const before = products.map((p) => p.id);
    expect(searchProducts(products, "Water Reserve Serum")[0].name).toBe(
      "Water Reserve Serum",
    );
    expect(searchProducts(products, "   ").every((p) => p.bestseller)).toBe(
      true,
    );
    expect(products.map((p) => p.id)).toEqual(before);
  });
});
