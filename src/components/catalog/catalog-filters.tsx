import type {
  CatalogFilters as FilterValues,
  CatalogFilterOptions,
  FilterKey,
} from "@/types/catalog-view";
export type CatalogFiltersProps = {
  values: FilterValues;
  options: CatalogFilterOptions;
  lockedCategory?: boolean;
  lockedGoal?: boolean;
  onChange: (key: FilterKey, value: string) => void;
};
const labels: Record<FilterKey, string> = {
  category: "Routine step",
  subtype: "Product type",
  skinType: "Skin type",
  goal: "Skin concern",
  active: "Key ingredient",
  maxPrice: "Price",
};
export function CatalogFilters({
  values,
  options,
  lockedCategory,
  lockedGoal,
  onChange,
}: CatalogFiltersProps) {
  return (
    <div className="catalog-filter-fields">
      {(Object.keys(labels) as FilterKey[]).map((key) => (
        <label className="field-label" key={key}>
          <span className="font-bold">{labels[key]}</span>
          <select
            className="select-control"
            value={values[key]}
            disabled={
              (key === "category" && lockedCategory) ||
              (key === "goal" && lockedGoal)
            }
            onChange={(event) => onChange(key, event.target.value)}
          >
            {options[key].map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}
