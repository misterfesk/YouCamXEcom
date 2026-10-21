"use client";
import Link from "next/link";
import {
  ConcernTiles,
  ScanExplainer,
  TrustStrip,
  type ConcernTileData,
} from "@/components/home/home-sections";
import { ProfileChip } from "@/components/layout/site-header";
import { Container } from "@/components/ui/container";
import { ProductGrid, ProductRail } from "@/components/product/product-grid";
import { Packshot } from "@/components/product/packshot";
import { ScanCard } from "@/components/product/scan-card";
import { PACK_SHAPES, type PackColor } from "@/types/catalog";
import { FIT_LEVELS, type Fit } from "@/types/fit";
import type {
  ProductListing,
  ProfileSummary,
  ScanSource,
} from "@/types/storefront";
export type FrontendSpecimensProps = {
  profile: ProfileSummary;
  items: ProductListing[];
  fits: Fit[];
  onStartScan: (source: ScanSource) => void;
  onAddToBag: (id: string) => void;
  tiles: ConcernTileData[];
  sampleResult: ProfileSummary;
};
const colors: PackColor[] = ["brand", "lilac", "tangerine", "surface", "ink"];
export function FrontendSpecimens({
  profile,
  items,
  fits,
  onStartScan,
  onAddToBag,
  tiles,
  sampleResult,
}: FrontendSpecimensProps) {
  return (
    <section id="storefront" className="section">
      <Container>
        <h2 className="type-h2 mb-6">Storefront components</h2>
        <section id="profile-chip" className="mb-12">
          <h3 className="type-h3 mb-4">Profile chip</h3>
          <p className="type-small text-text-muted mb-4">
            The live shell above includes navigation, mobile sheets, scan entry
            and footer.
          </p>
          <div className="flex flex-wrap gap-4">
            <ProfileChip profile={profile} recommendations />
            <ProfileChip profile={profile} recommendations={false} />
          </div>
        </section>
        <section id="packshots" className="mb-12">
          <h3 className="type-h3 mb-4">Packshots · Every shape and color</h3>
          {PACK_SHAPES.map((shape) => (
            <div key={shape} className="mb-6">
              <h4 className="type-label">{shape}</h4>
              <div className="packshot-specimens">
                {colors.map((color) => (
                  <div key={color}>
                    <Packshot shape={shape} color={color} />
                    <p className="type-small text-text-muted">{color}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
        <section id="product-cards" className="mb-12">
          <h3 className="type-h3 mb-4">
            Product cards · No fit, then all five levels
          </h3>
          <ProductGrid
            items={[
              { product: items[0].product },
              ...FIT_LEVELS.map((level, index) => ({
                product: items[index + 1].product,
                fit: fits.find((fit) => fit.level === level),
              })),
            ]}
            onAddToBag={onAddToBag}
          />
        </section>
        <section id="product-grid" className="mb-12">
          <h3 className="type-h3 mb-4">Grid with inline scan card</h3>
          <ProductGrid
            items={items.slice(0, 5)}
            onStartScan={onStartScan}
            onAddToBag={onAddToBag}
          />
        </section>
        <section id="product-rail" className="mb-12">
          <h3 className="type-h3 mb-4">Product rail</h3>
          <ProductRail
            label="Sample product rail"
            items={items.slice(0, 6)}
            onAddToBag={onAddToBag}
          />
        </section>
        <section id="scan-cards">
          <h3 className="type-h3 mb-4">Scan card · Before and after</h3>
          <div className="scan-card-specimens">
            <ScanCard onStartScan={onStartScan} />
            <ScanCard profile={profile} onStartScan={onStartScan} />
          </div>
        </section>
        <section id="home-hero" className="mt-12">
          <h3 className="type-h3 mb-4">Campaign hero</h3>
          <Link href="/" className="concern-text-link">
            View the home hero on its route
          </Link>
          <p className="type-small text-text-muted">
            Scan card before analysis; your skin card after choosing a sample
            face. Both card states appear above.
          </p>
        </section>
        <section id="concern-tiles" className="mt-12">
          <h3 className="type-h3 mb-4">Concern tiles</h3>
          <ConcernTiles tiles={tiles} otherGoals={[]} />
        </section>
        <section id="scan-explainer" className="mt-12">
          <h3 className="type-h3 mb-4">
            Scan explainer and recorded sample result
          </h3>
          <ScanExplainer profile={sampleResult} onStartScan={onStartScan} />
        </section>
        <section id="trust-strip" className="mt-12">
          <h3 className="type-h3 mb-4">Trust strip</h3>
          <TrustStrip />
        </section>
      </Container>
    </section>
  );
}
