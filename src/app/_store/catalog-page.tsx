"use client";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CatalogView } from "@/components/views/catalog-view";
import { catalogFilterOptions, getProducts } from "@/lib/catalog";
import { dailyEssentials, goalShelf, routinePicks, sortByFit, targetsGoal } from "@/lib/ranking";
import { useSkinStore } from "@/stores/skin";
import { STEP_LABEL, type Step } from "@/types/catalog";
import { GOAL_DEFS, type GoalId } from "@/types/goal";
import type { SkinType } from "@/types/skin";
import {
  EMPTY_FILTERS,
  type CatalogFilters,
  type CatalogSort,
  type FilterKey,
} from "@/types/catalog-view";
import { addToBag, startScan } from "./actions";
import { listing, usePersonalization } from "./use-fits";

/** URL keys for each filter; the category is the route on /shop/[step]. */
const PARAM: Record<FilterKey, string> = {
  category: "step",
  subtype: "type",
  skinType: "skin",
  goal: "concern",
  active: "ingredient",
  maxPrice: "price",
};
const SORTS: CatalogSort[] = ["featured", "best", "price-low", "price-high", "name"];

const STEP_COPY: Record<Step, string> = {
  cleanse:
    "Gels and foams for oilier skin, creams and balms for drier skin. Find the wash that feels right.",
  treat:
    "Serums and spot care for a specific concern, from breakouts to dark spots.",
  moisturize:
    "Light gels for oily skin, richer creams for dry skin, and everything in between.",
  protect:
    "The last step every morning. Daily sunscreens, including tinted ones.",
};

export function CatalogPage({ step, goal }: { step?: Step; goal?: GoalId }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { summary, focus, fits, recommendations } = usePersonalization();
  const setFocus = useSkinStore((s) => s.setFocus);
  const products = getProducts();

  const filters: CatalogFilters = { ...EMPTY_FILTERS };
  for (const key of Object.keys(PARAM) as FilterKey[]) filters[key] = params.get(PARAM[key]) ?? "";
  if (step) filters.category = step;
  if (goal) filters.goal = goal;
  const hideUnsuitable = params.get("hide") === "1";
  const view = params.get("view") === "all" ? "all" : "for-you";
  const showFits = !!fits;
  const requested = params.get("sort") as CatalogSort | null;
  const sort: CatalogSort =
    requested && SORTS.includes(requested) && (requested !== "best" || showFits)
      ? requested
      : showFits
        ? "best"
        : "featured";

  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const items = useMemo(() => {
    const matching = products.filter((p) => {
      if (filters.category && p.step !== filters.category) return false;
      if (filters.subtype && p.subtype !== filters.subtype) return false;
      if (filters.skinType && p.skinTypes[filters.skinType as SkinType] !== "suitable") return false;
      if (filters.goal && !targetsGoal(p, filters.goal as GoalId)) return false;
      if (filters.active && !p.actives.some((a) => a.id === filters.active)) return false;
      if (filters.maxPrice && p.price > Number(filters.maxPrice)) return false;
      if (fits && hideUnsuitable && fits[p.id]?.level === "avoid") return false;
      return true;
    });
    const sorted =
      sort === "best" && fits
        ? sortByFit(matching, fits)
        : sort === "price-low"
          ? [...matching].sort((a, b) => a.price - b.price)
          : sort === "price-high"
            ? [...matching].sort((a, b) => b.price - a.price)
            : sort === "name"
              ? [...matching].sort((a, b) => a.name.localeCompare(b.name))
              : matching;
    // "Not for your skin" always sits at the bottom, whatever the sort.
    const avoid = (id: string) => Number(fits?.[id]?.level === "avoid");
    return [...sorted].sort((a, b) => avoid(a.id) - avoid(b.id)).map((p) => listing(p, fits));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, params, fits, sort, step, goal]);

  const forYou = showFits && view === "for-you" && !step && !goal;
  const shelfPool = items.map((i) => i.product);
  const sections =
    forYou && fits
      ? focus
          .map((g) => ({
            goal: g,
            band: summary?.goals.find((s) => s.goal === g)?.band ?? ("mild" as const),
            items: goalShelf(shelfPool, fits, g).map((p) => listing(p, fits)),
          }))
          .filter((s) => s.items.length > 0)
      : [];
  const essentials = forYou ? dailyEssentials(shelfPool, fits).map((p) => listing(p, fits)) : [];
  const routine = routinePicks(essentials.map((e) => e.product));
  const featured = new Set([
    ...sections.flatMap((s) => s.items.map((i) => i.product.id)),
    ...essentials.map((e) => e.product.id),
  ]);
  const everythingElse = items.filter((i) => !featured.has(i.product.id));

  const filterCount = (Object.keys(PARAM) as FilterKey[]).filter(
    (key) => !!filters[key] && !(key === "category" && step) && !(key === "goal" && goal),
  ).length;

  return (
    <CatalogView
      title={step ? STEP_LABEL[step] : goal ? GOAL_DEFS[goal].title : forYou ? "Picked for" : "Shop"}
      accent={!step && !goal ? (forYou ? "your skin." : "everything.") : undefined}
      description={
        step
          ? STEP_COPY[step]
          : goal
            ? GOAL_DEFS[goal].blurb
            : forYou
              ? "Products for what stood out in your scan come first. Every product is still here, each tagged with how it fits you."
              : "Cleansers, treatments, moisturizers and SPF. Browse it all, or scan your skin to see what suits you first."
      }
      step={step}
      goal={goal}
      profile={summary}
      recommendations={recommendations}
      view={view}
      items={items}
      filters={{
        values: filters,
        options: catalogFilterOptions((step || filters.category || undefined) as Step | undefined),
        lockedCategory: !!step,
        lockedGoal: !!goal,
        onChange: (key, value) =>
          update({ [PARAM[key]]: value, ...(key === "category" ? { [PARAM.subtype]: "" } : {}) }),
      }}
      filterCount={filterCount}
      sort={sort}
      hideUnsuitable={hideUnsuitable}
      focus={focus}
      sections={sections}
      essentials={essentials}
      everythingElse={everythingElse}
      canAddRoutine={routine.length === 3}
      onViewChange={(next) => update({ view: next === "all" ? "all" : "" })}
      onSortChange={(next) => update({ sort: next })}
      onHideUnsuitableChange={(hide) => update({ hide: hide ? "1" : "" })}
      onClearFilters={() =>
        update({ ...Object.fromEntries(Object.values(PARAM).map((k) => [k, ""])), hide: "" })
      }
      onSetFocus={(g) => setFocus([g, ...focus.filter((item) => item !== g)].slice(0, 3))}
      onAddRoutine={() => routine.forEach((p) => addToBag(p.id))}
      onAddToBag={addToBag}
      onStartScan={startScan}
    />
  );
}
