"use client";
import { useState } from "react";
import { usePreview } from "./preview-provider";
import { CatalogView } from "@/components/views/catalog-view";
import { products } from "@/fixtures/ui/products";
import { sampleFits } from "@/fixtures/ui/product-fits";
import { catalogFilterOptions } from "@/fixtures/ui/catalog-options";
import { STEP_LABEL, type Step, type Product } from "@/types/catalog";
import { GOAL_DEFS, type GoalId } from "@/types/goal";
import type { SkinType } from "@/types/skin";
import {
  EMPTY_FILTERS,
  type CatalogFilters,
  type FilterKey,
  type CatalogSort,
} from "@/types/catalog-view";
import type { ProductListing } from "@/types/storefront";
const matchesGoal = (product: Product, goal: GoalId) =>
  product.targets.some((target) =>
    GOAL_DEFS[goal].concerns.includes(target.concern),
  );
const fitOrder = { great: 0, good: 1, everyday: 2, care: 3, avoid: 4 };
export function CatalogPreview({ step, goal }: { step?: Step; goal?: GoalId }) {
  const { profile, sampleId, recommendations, onStartScan, onAddToBag } =
    usePreview();
  const [filters, setFilters] = useState<CatalogFilters>({
    ...EMPTY_FILTERS,
    category: step ?? "",
    goal: goal ?? "",
  });
  const [sortChoice, setSortChoice] = useState<CatalogSort>();
  const [hideUnsuitable, setHideUnsuitable] = useState(false);
  const [view, setView] = useState<"all" | "for-you">("for-you");
  const [focusOverride, setFocusOverride] = useState<GoalId[]>();
  const showFits = !!profile && recommendations;
  const focus =
    focusOverride ?? profile?.goals.slice(0, 3).map((item) => item.goal) ?? [];
  const sort: CatalogSort =
    sortChoice === "best" && !showFits
      ? "featured"
      : (sortChoice ?? (showFits ? "best" : "featured"));
  const onChangeFilter = (key: FilterKey, value: string) =>
    setFilters((current) => ({
      ...current,
      [key]: value,
      ...(key === "category" ? { subtype: "" } : {}),
    }));
  const onClearFilters = () => {
    setFilters({ ...EMPTY_FILTERS, category: step ?? "", goal: goal ?? "" });
    setHideUnsuitable(false);
  };
  const items: ProductListing[] = products
    .filter((product) => {
      if (step && product.step !== step) return false;
      if (goal && !matchesGoal(product, goal)) return false;
      if (filters.category && product.step !== filters.category) return false;
      if (filters.subtype && product.subtype !== filters.subtype) return false;
      if (
        filters.skinType &&
        product.skinTypes[filters.skinType as SkinType] !== "suitable"
      )
        return false;
      if (filters.goal && !matchesGoal(product, filters.goal as GoalId))
        return false;
      if (
        filters.active &&
        !product.actives.some((active) => active.id === filters.active)
      )
        return false;
      return !filters.maxPrice || product.price <= Number(filters.maxPrice);
    })
    .map((product) => ({
      product,
      fit: showFits && sampleId ? sampleFits[sampleId][product.id] : undefined,
    }))
    .filter(
      (item) => !showFits || !hideUnsuitable || item.fit?.level !== "avoid",
    );
  items.sort((a, b) => {
    const avoidDifference =
      Number(a.fit?.level === "avoid") - Number(b.fit?.level === "avoid");
    if (avoidDifference) return avoidDifference;
    if (sort === "price-low") return a.product.price - b.product.price;
    if (sort === "price-high") return b.product.price - a.product.price;
    if (sort === "name") return a.product.name.localeCompare(b.product.name);
    if (sort === "best") {
      const byFit =
        fitOrder[a.fit?.level ?? "everyday"] -
        fitOrder[b.fit?.level ?? "everyday"];
      if (byFit) return byFit;
      const focusCount = (item: ProductListing) =>
        focus.filter((goal) => matchesGoal(item.product, goal)).length;
      const byFocus = focusCount(b) - focusCount(a);
      if (byFocus) return byFocus;
    }
    return products.indexOf(a.product) - products.indexOf(b.product);
  });
  const sections = focus
    .map((goal) => ({
      goal,
      band:
        profile?.goals.find((item) => item.goal === goal)?.band ??
        ("mild" as const),
      items: items
        .filter(
          (item) =>
            item.fit?.level !== "avoid" && matchesGoal(item.product, goal),
        )
        .slice(0, 6),
    }))
    .filter((section) => section.items.length > 0);
  const essentials = (["cleanse", "moisturize", "protect"] as Step[]).flatMap(
    (step) =>
      items
        .filter(
          (item) =>
            item.product.step === step &&
            item.fit?.level !== "avoid" &&
            item.fit?.level !== "care",
        )
        .slice(0, 2),
  );
  const routine = (["cleanse", "moisturize", "protect"] as Step[])
    .map((step) => essentials.find((item) => item.product.step === step))
    .filter((item): item is ProductListing => !!item);
  const featuredIds = new Set([
    ...sections.flatMap((section) =>
      section.items.map((item) => item.product.id),
    ),
    ...essentials.map((item) => item.product.id),
  ]);
  const everythingElse = items.filter(
    (item) => !featuredIds.has(item.product.id),
  );
  const forYou = showFits && view === "for-you" && !step && !goal;
  const title = step
    ? STEP_LABEL[step]
    : goal
      ? GOAL_DEFS[goal].title
      : forYou
        ? "A shelf arranged around"
        : "Find your";
  const description = step
    ? {
        cleanse:
          "Take the day off. Start fresh. Find a cleansing texture that feels right for your routine.",
        treat:
          "A little focus goes a long way. Explore targeted layers for the concerns on your mind.",
        moisturize:
          "From light gels to richer final layers, find a comfortable finish for your skin.",
        protect:
          "Make sun protection your last morning step, with a texture you will reach for again.",
      }[step]
    : goal
      ? GOAL_DEFS[goal].blurb
      : forYou
        ? "Your concerns set the order. Bring another focus to the front, or explore every product with match guidance."
        : "From a fresh cleanse to daily SPF. Explore a considered collection, one good step at a time.";
  const filterCount = Object.entries(filters).filter(
    ([key, value]) =>
      !!value && !(key === "category" && step) && !(key === "goal" && goal),
  ).length;
  return (
    <CatalogView
      title={title}
      accent={
        !step && !goal ? (forYou ? "you." : "starting point.") : undefined
      }
      description={description}
      step={step}
      goal={goal}
      profile={profile}
      recommendations={recommendations}
      view={view}
      items={items}
      filters={{
        values: filters,
        options: catalogFilterOptions(
          (step || filters.category || undefined) as Step | undefined,
        ),
        lockedCategory: !!step,
        lockedGoal: !!goal,
        onChange: onChangeFilter,
      }}
      filterCount={filterCount}
      sort={sort}
      hideUnsuitable={hideUnsuitable}
      focus={focus}
      sections={sections}
      essentials={essentials}
      everythingElse={everythingElse}
      canAddRoutine={routine.length === 3}
      onViewChange={setView}
      onSortChange={setSortChoice}
      onHideUnsuitableChange={setHideUnsuitable}
      onClearFilters={onClearFilters}
      onSetFocus={(goal) =>
        setFocusOverride(
          [goal, ...focus.filter((item) => item !== goal)].slice(0, 3),
        )
      }
      onAddRoutine={() =>
        routine.forEach((item) => onAddToBag(item.product.id))
      }
      onAddToBag={onAddToBag}
      onStartScan={onStartScan}
    />
  );
}
