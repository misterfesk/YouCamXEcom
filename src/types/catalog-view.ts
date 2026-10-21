import type { GoalId, GoalScore } from "./goal";
import type { ProductListing } from "./storefront";
export type CatalogFilters = {
  category: string;
  subtype: string;
  skinType: string;
  goal: string;
  active: string;
  maxPrice: string;
};
export type FilterKey = keyof CatalogFilters;
export type FilterOption = { value: string; label: string };
export type CatalogFilterOptions = Record<FilterKey, FilterOption[]>;
export type CatalogSort =
  "featured" | "best" | "price-low" | "price-high" | "name";
export type CatalogGoalSection = {
  goal: GoalId;
  items: ProductListing[];
  band: GoalScore["band"];
};
export const EMPTY_FILTERS: CatalogFilters = {
  category: "",
  subtype: "",
  skinType: "",
  goal: "",
  active: "",
  maxPrice: "",
};
