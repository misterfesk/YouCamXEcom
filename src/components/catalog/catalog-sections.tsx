import Link from "next/link";
import { Accent } from "@/components/ui/accent";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icon } from "@/components/icons/icon";
import { ProductRail } from "@/components/product/product-grid";
import { GOAL_DEFS, type GoalId, type GoalScore } from "@/types/goal";
import { BAND_LABEL } from "@/types/skin";
import { GOAL_FINDING } from "@/components/scan/scan-copy";
import type { CatalogGoalSection } from "@/types/catalog-view";
import type { ProductListing } from "@/types/storefront";
export function CatalogEmpty({
  onClearFilters,
}: {
  onClearFilters: () => void;
}) {
  return (
    <div className="catalog-empty">
      <Eyebrow className="text-text-muted mb-3">No results</Eyebrow>
      <h2 className="type-h2">
        Nothing matches <Accent>all of these.</Accent>
      </h2>
      <p className="text-text-muted mt-4 mb-6">
        Try removing a filter or two.
      </p>
      <Button onClick={onClearFilters}>Clear filters</Button>
    </div>
  );
}
export function CatalogLoading() {
  return (
    <div className="catalog-empty" role="status" aria-live="polite">
      <p className="type-h3">Loading products…</p>
    </div>
  );
}
export function FocusStrip({
  goals,
  focus,
  onSetFocus,
}: {
  goals: GoalScore[];
  focus: GoalId[];
  onSetFocus: (goal: GoalId) => void;
}) {
  return (
    <section className="focus-strip" aria-label="Your focus">
      <div>
        <Eyebrow className="mb-2">From your scan</Eyebrow>
        <p className="type-small text-text-muted">
          These lead your shop. Tap one to move it to the top.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {focus.map((goal, index) => (
          <Chip
            key={goal}
            pressed
            onPressedChange={() => onSetFocus(goal)}
            aria-label={`Move ${GOAL_DEFS[goal].title} to the top`}
          >
            <span aria-hidden="true">{index + 1}.</span>
            {GOAL_DEFS[goal].title}
            <span className="type-small">
              {
                BAND_LABEL[
                  goals.find((item) => item.goal === goal)?.band ?? "mild"
                ]
              }
            </span>
          </Chip>
        ))}
      </div>
    </section>
  );
}
export function GoalProductSection({
  section,
  onAddToBag,
}: {
  section: CatalogGoalSection;
  onAddToBag: (id: string) => void;
}) {
  return (
    <section className="catalog-goal-section">
      <div className="section-heading">
        <div>
          <p className="type-label text-text-muted mb-3">
            {GOAL_FINDING[section.goal].name} · {BAND_LABEL[section.band]} in
            your scan
          </p>
          <h2 className="type-h2">{GOAL_DEFS[section.goal].title}</h2>
          <p className="text-text-muted mt-3">
            {GOAL_DEFS[section.goal].blurb}
          </p>
        </div>
        <Link
          className="concern-text-link text-brand"
          href={`/concerns/${section.goal}`}
        >
          See all
          <Icon name="chevron-right" />
        </Link>
      </div>
      <ProductRail
        label={GOAL_DEFS[section.goal].title}
        items={section.items}
        onAddToBag={onAddToBag}
      />
    </section>
  );
}
export function DailyEssentials({
  items,
  onAddToBag,
  onAddRoutine,
  canAddRoutine,
}: {
  items: ProductListing[];
  onAddToBag: (id: string) => void;
  onAddRoutine: () => void;
  canAddRoutine: boolean;
}) {
  return (
    <section className="daily-essentials">
      <div className="section-heading">
        <div>
          <Eyebrow className="text-text-muted mb-3">The basics</Eyebrow>
          <h2 className="type-h2">
            Daily <Accent>essentials.</Accent>
          </h2>
          <p className="text-text-muted mt-3">
            Cleanser, moisturizer and SPF that suit your skin. Every routine
            starts here.
          </p>
        </div>
        <Button onClick={onAddRoutine} disabled={!canAddRoutine}>
          Add routine to bag
        </Button>
      </div>
      {items.length === 0 && (
        <p className="text-text-muted mb-5">
          No basics match these filters. Clear them to see your routine.
        </p>
      )}
      <ProductRail
        label="Daily essentials"
        items={items}
        onAddToBag={onAddToBag}
      />
      <p className="type-small text-text-muted mt-2">
        Adds the first cleanser, moisturizer and SPF shown.
      </p>
    </section>
  );
}
export function MoreForYourSkin({
  goals,
  onSetFocus,
}: {
  goals: GoalScore[];
  onSetFocus: (goal: GoalId) => void;
}) {
  return (
    <section className="more-for-skin">
      <h2 className="type-h3">Also in your scan</h2>
      <p className="text-text-muted mt-2 mb-5">
        Less visible, but you can shop for these too. Tap one to add it above.
      </p>
      <div className="flex flex-wrap gap-2">
        {goals.map((item) => (
          <Chip
            key={item.goal}
            pressed={false}
            onPressedChange={() => onSetFocus(item.goal)}
          >
            {GOAL_DEFS[item.goal].title}
            <span className="type-small">{BAND_LABEL[item.band]}</span>
            <Icon name="plus" />
          </Chip>
        ))}
      </div>
    </section>
  );
}
