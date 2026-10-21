import {
  STEPS,
  STEP_LABEL,
  SUBTYPES,
  SUBTYPE_LABEL,
  type Step,
} from "@/types/catalog";
import { GOALS, GOAL_DEFS } from "@/types/goal";
import { SKIN_TYPES, SKIN_TYPE_LABEL } from "@/types/skin";
import type { CatalogFilterOptions } from "@/types/catalog-view";
import { products } from "./products";
export function catalogFilterOptions(category?: Step): CatalogFilterOptions {
  const subtypes = category
    ? SUBTYPES[category]
    : STEPS.flatMap((step) => [...SUBTYPES[step]]);
  const activeIds = [
    ...new Set(
      products.flatMap((product) => product.actives.map((active) => active.id)),
    ),
  ].sort();
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
    active: [
      { value: "", label: "All ingredients" },
      ...activeIds.map((value) => ({
        value,
        label:
          value === "uv-filters"
            ? "UV filters"
            : value
                .replaceAll("-", " ")
                .replace(/^./, (letter) => letter.toUpperCase()),
      })),
    ],
    maxPrice: [
      { value: "", label: "Any price" },
      ...[20, 25, 30, 35].map((value) => ({
        value: String(value),
        label: `Up to $${value}`,
      })),
    ],
  };
}
