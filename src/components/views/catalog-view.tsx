"use client";
import { useState } from "react";
import Link from "next/link";
import { Accent } from "@/components/ui/accent";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Modal } from "@/components/ui/modal";
import { ProductGrid } from "@/components/product/product-grid";
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
import { STEPS, STEP_LABEL, type Step } from "@/types/catalog";
import type { GoalId } from "@/types/goal";
import type { CatalogGoalSection, CatalogSort } from "@/types/catalog-view";
import type {
  ProductListing,
  ProfileSummary,
  ScanSource,
} from "@/types/storefront";
export type CatalogViewProps = {
  title: string;
  accent?: string;
  description: string;
  step?: Step;
  goal?: GoalId;
  profile?: ProfileSummary;
  recommendations: boolean;
  view: "all" | "for-you";
  items: ProductListing[];
  filters: CatalogFiltersProps;
  filterCount: number;
  sort: CatalogSort;
  hideUnsuitable: boolean;
  loading?: boolean;
  focus: GoalId[];
  sections: CatalogGoalSection[];
  essentials: ProductListing[];
  everythingElse: ProductListing[];
  canAddRoutine: boolean;
  onViewChange: (view: "all" | "for-you") => void;
  onSortChange: (sort: CatalogSort) => void;
  onHideUnsuitableChange: (value: boolean) => void;
  onClearFilters: () => void;
  onSetFocus: (goal: GoalId) => void;
  onAddRoutine: () => void;
  onAddToBag: (id: string) => void;
  onStartScan: (source: ScanSource) => void;
};
export function CatalogView({
  title,
  accent,
  description,
  step,
  goal,
  profile,
  recommendations,
  view,
  items,
  filters,
  filterCount,
  sort,
  hideUnsuitable,
  loading = false,
  focus,
  sections,
  essentials,
  everythingElse,
  canAddRoutine,
  onViewChange,
  onSortChange,
  onHideUnsuitableChange,
  onClearFilters,
  onSetFocus,
  onAddRoutine,
  onAddToBag,
  onStartScan,
}: CatalogViewProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const forYou =
    view === "for-you" && !!profile && recommendations && !step && !goal;
  const countLabel = `${items.length} ${items.length === 1 ? "product" : "products"}`;
  const allStepLabel = {
    cleanse: "All cleansers",
    treat: "All treatments",
    moisturize: "All moisturizers",
    protect: "All SPF",
  };
  const subtypeOptions = filters.options.subtype.filter(
    (option) => option.value,
  );
  return (
    <main id="main-content" tabIndex={-1}>
      <Container>
        <nav className="catalog-breadcrumb type-small" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/shop">Shop</Link>
          {(step || goal) && (
            <>
              <span aria-hidden="true">/</span>
              <span>{title}</span>
            </>
          )}
        </nav>
        <header className="catalog-hero on-brand">
          <Eyebrow className="mb-4">
            {profile && recommendations
              ? "Matched to your scan"
              : "The collection"}
          </Eyebrow>
          <h1 className="type-h1">
            {title}
            {accent && (
              <>
                {" "}
                <Accent>{accent}</Accent>
              </>
            )}
          </h1>
          <p className="type-body-lg mt-5 max-w-copy">{description}</p>
          <p className="type-small mt-6">
            Cleanse. Treat. Moisturize. Protect.
          </p>
        </header>
        <div className="catalog-navigation">
          <nav className="category-chips" aria-label="Shop by routine step">
            <Link
              className="chip"
              data-active={!step && !goal}
              aria-current={!step && !goal ? "page" : undefined}
              href="/shop"
            >
              Shop all
            </Link>
            {STEPS.map((item) => (
              <Link
                key={item}
                className="chip"
                data-active={item === step}
                aria-current={item === step ? "page" : undefined}
                href={`/shop/${item}`}
              >
                {STEP_LABEL[item]}
              </Link>
            ))}
          </nav>
          {step && (
            <div
              className="subtype-chips"
              role="group"
              aria-label="Product types"
            >
              <Chip
                pressed={!filters.values.subtype}
                onPressedChange={() => filters.onChange("subtype", "")}
              >
                {allStepLabel[step]}
              </Chip>
              {subtypeOptions.map((option) => (
                <Chip
                  key={option.value}
                  pressed={filters.values.subtype === option.value}
                  onPressedChange={(pressed) =>
                    filters.onChange("subtype", pressed ? option.value : "")
                  }
                >
                  {option.label}
                </Chip>
              ))}
            </div>
          )}
          {profile && recommendations && !step && !goal && (
            <div
              className="catalog-view-switch"
              role="group"
              aria-label="Catalog view"
            >
              <button
                type="button"
                aria-pressed={forYou}
                onClick={() => onViewChange("for-you")}
              >
                For you
              </button>
              <button
                type="button"
                aria-pressed={!forYou}
                onClick={() => onViewChange("all")}
              >
                All products
              </button>
            </div>
          )}
        </div>
        <div className="catalog-toolbar">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={() => setFiltersOpen(true)}>
              Filters{filterCount > 0 ? ` (${filterCount})` : ""}
            </Button>
            {filterCount > 0 && (
              <Button variant="ghost" onClick={onClearFilters}>
                Clear filters
              </Button>
            )}
            <p className="type-small text-text-muted" role="status">
              {countLabel}
              {profile && recommendations ? " · Tagged for your skin" : ""}
            </p>
          </div>
          <label className="catalog-sort type-small">
            <span>Sort</span>
            <select
              className="select-control"
              value={sort}
              onChange={(event) =>
                onSortChange(event.target.value as CatalogSort)
              }
            >
              {profile && recommendations && (
                <option value="best">Best for my skin</option>
              )}
              <option value="featured">Featured</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </label>
        </div>
        {profile && recommendations && (
          <label className="check-control mb-6">
            <input
              type="checkbox"
              checked={hideUnsuitable}
              onChange={(event) => onHideUnsuitableChange(event.target.checked)}
            />
            Hide products marked “Not for your skin”
          </label>
        )}
        {loading ? (
          <CatalogLoading />
        ) : items.length === 0 ? (
          <CatalogEmpty onClearFilters={onClearFilters} />
        ) : forYou ? (
          <div className="for-you-catalog">
            <FocusStrip
              goals={profile!.goals}
              focus={focus}
              onSetFocus={onSetFocus}
            />
            {sections.map((section) => (
              <GoalProductSection
                key={section.goal}
                section={section}
                onAddToBag={onAddToBag}
              />
            ))}
            <DailyEssentials
              items={essentials}
              onAddToBag={onAddToBag}
              onAddRoutine={onAddRoutine}
              canAddRoutine={canAddRoutine}
            />
            <MoreForYourSkin
              goals={profile!.goals.filter(
                (item) => !focus.includes(item.goal),
              )}
              onSetFocus={onSetFocus}
            />
            {everythingElse.length > 0 && (
              <section className="catalog-goal-section">
                <div className="section-heading">
                  <div>
                    <Eyebrow className="text-text-muted mb-3">
                      The rest of the shop
                    </Eyebrow>
                    <h2 className="type-h2">Everything else</h2>
                    <p className="text-text-muted mt-3">
                      Good for gifts, favorites or another concern. Each one
                      is still tagged for your skin.
                    </p>
                  </div>
                </div>
                <ProductGrid
                  items={everythingElse}
                  onAddToBag={onAddToBag}
                  animate
                />
              </section>
            )}
          </div>
        ) : (
          <div className="catalog-products">
            <ProductGrid
              items={items}
              onAddToBag={onAddToBag}
              onStartScan={!profile ? onStartScan : undefined}
              animate
            />
          </div>
        )}
        <p className="type-small text-text-muted catalog-demo-note">
          Demo store with fictional products. Matches are skincare guidance,
          not a diagnosis.
        </p>
      </Container>
      <Modal
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        title="Filters"
        description="Narrow the shop by step, skin type, concern or ingredient."
        footer={
          <>
            <Button variant="secondary" onClick={onClearFilters}>
              Clear filters
            </Button>
            <Button onClick={() => setFiltersOpen(false)}>
              Show {countLabel}
            </Button>
          </>
        }
      >
        <CatalogFilters {...filters} />
      </Modal>
    </main>
  );
}
