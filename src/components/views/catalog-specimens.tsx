"use client";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import {
  CatalogFilters,
  type CatalogFiltersProps,
} from "@/components/catalog/catalog-filters";
import {
  CatalogEmpty,
  CatalogLoading,
  FocusStrip,
  GoalProductSection,
  DailyEssentials,
  MoreForYourSkin,
} from "@/components/catalog/catalog-sections";
import type { ProfileSummary, ProductListing } from "@/types/storefront";
import type { GoalId } from "@/types/goal";
export function CatalogSpecimens({
  filters,
  profile,
  items,
  essentials,
  onSetFocus,
  onAddToBag,
  onClearFilters,
  onAddRoutine,
}: {
  filters: CatalogFiltersProps;
  profile: ProfileSummary;
  items: ProductListing[];
  essentials: ProductListing[];
  onSetFocus: (goal: GoalId) => void;
  onAddToBag: (id: string) => void;
  onClearFilters: () => void;
  onAddRoutine: () => void;
}) {
  return (
    <section className="section">
      <Container>
        <h2 className="type-h2 mb-8">Catalog components</h2>
        <section id="catalog-filters" className="mb-12">
          <h3 className="type-h3 mb-6">Filters</h3>
          <CatalogFilters {...filters} />
        </section>
        <section id="catalog-states" className="mb-12">
          <h3 className="type-h3 mb-6">Empty and loading</h3>
          <div className="grid gap-6">
            <CatalogEmpty onClearFilters={onClearFilters} />
            <CatalogLoading />
          </div>
        </section>
        <section id="focus-strip">
          <h3 className="type-h3 mb-6">Your focus</h3>
          <FocusStrip
            goals={profile.goals}
            focus={profile.goals.slice(0, 3).map((item) => item.goal)}
            onSetFocus={onSetFocus}
          />
        </section>
        <section id="goal-product-section">
          <h3 className="type-h3 mt-12">Goal product section</h3>
          <GoalProductSection
            section={{
              goal: profile.goals[0].goal,
              band: profile.goals[0].band,
              items: items.slice(0, 4),
            }}
            onAddToBag={onAddToBag}
          />
        </section>
        <section id="daily-essentials">
          <h3 className="type-h3 mb-6">Daily essentials · Complete routine</h3>
          <DailyEssentials
            items={essentials}
            onAddToBag={onAddToBag}
            onAddRoutine={onAddRoutine}
            canAddRoutine
          />
          <h3 className="type-h3 mb-6">
            Daily essentials · No matching routine
          </h3>
          <DailyEssentials
            items={[]}
            onAddToBag={onAddToBag}
            onAddRoutine={onAddRoutine}
            canAddRoutine={false}
          />
        </section>
        <section id="more-for-skin">
          <h3 className="type-h3 mb-6">More for your skin</h3>
          <MoreForYourSkin
            goals={profile.goals.slice(3)}
            onSetFocus={onSetFocus}
          />
        </section>
        <section id="catalog-route">
          <h3 className="type-h3 mb-3">Catalog page</h3>
          <p>
            Review the full catalog on{" "}
            <Link className="concern-text-link text-brand" href="/shop">
              its shop route
            </Link>
            , before and after choosing a sample face.
          </p>
        </section>
      </Container>
    </section>
  );
}
