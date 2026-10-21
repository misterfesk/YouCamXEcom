import { ACTIVES, ACTIVE_BY_ID } from "../knowledge/actives";
import {
  STEPS,
  STEP_LABEL,
  SUBTYPES,
  SUBTYPE_LABEL,
  type Active,
  type Product,
  type Step,
} from "../../types/catalog";
import type { CatalogFilterOptions } from "../../types/catalog-view";
import { GOALS, GOAL_DEFS } from "../../types/goal";
import { SKIN_TYPES, SKIN_TYPE_LABEL } from "../../types/skin";
import raw from "../../../data/products.json";

// Validated at build time by scripts/validate-catalog.ts, so no schema runs in the browser.
const products = raw as unknown as Product[];
const byId = new Map(products.map((p) => [p.id, p]));
const bySlug = new Map(products.map((p) => [p.slug, p]));

export function getProducts(): Product[] {
  return products;
}

export function getProduct(id: string): Product | undefined {
  return byId.get(id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return bySlug.get(slug);
}

export function getProductsByStep(step: Step): Product[] {
  return products.filter((p) => p.step === step);
}

export function getActive(id: string): Active | undefined {
  return ACTIVE_BY_ID[id];
}

export function catalogFilterOptions(category?: Step): CatalogFilterOptions {
  const subtypes = category ? SUBTYPES[category] : STEPS.flatMap((step) => [...SUBTYPES[step]]);
  const used = new Set(products.flatMap((p) => p.actives.map((a) => a.id)));
  const activeOptions = ACTIVES.filter((a) => used.has(a.id)).map((a) => ({
    value: a.id,
    label: a.name,
  }));
  return {
    category: [
      { value: "", label: "All routine steps" },
      ...STEPS.map((value) => ({ value, label: STEP_LABEL[value] })),
    ],
    subtype: [
      { value: "", label: "All product types" },
      ...subtypes.map((value) => ({ value, label: SUBTYPE_LABEL[value] })),
    ],
    skinType: [
      { value: "", label: "All skin types" },
      ...SKIN_TYPES.map((value) => ({ value, label: SKIN_TYPE_LABEL[value] })),
    ],
    goal: [
      { value: "", label: "All skin concerns" },
      ...GOALS.map((value) => ({ value, label: GOAL_DEFS[value].title })),
    ],
    active: [{ value: "", label: "All ingredients" }, ...activeOptions],
    maxPrice: [
      { value: "", label: "Any price" },
      ...[20, 25, 30, 35].map((value) => ({ value: String(value), label: `Up to $${value}` })),
    ],
  };
}
