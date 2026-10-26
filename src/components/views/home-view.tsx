import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Accent } from "@/components/ui/accent";
import { Button } from "@/components/ui/button";
import { ProductRail } from "@/components/product/product-grid";
import {
  HomeHero,
  ConcernTiles,
  ScanExplainer,
  TrustStrip,
  type ConcernTileData,
} from "@/components/home/home-sections";
import type { GoalId } from "@/types/goal";
import type {
  ProductListing,
  ProfileSummary,
  ScanSource,
} from "@/types/storefront";
export type HomeViewProps = {
  profile?: ProfileSummary;
  bestsellers: ProductListing[];
  tiles: ConcernTileData[];
  otherGoals: GoalId[];
  sampleResult: ProfileSummary;
  onStartScan: (source: ScanSource) => void;
  onAddToBag: (id: string) => void;
};
export function HomeView({
  profile,
  bestsellers,
  tiles,
  otherGoals,
  sampleResult,
  onStartScan,
  onAddToBag,
}: HomeViewProps) {
  return (
    <main id="main-content" tabIndex={-1}>
      <Container>
        <HomeHero profile={profile} onStartScan={onStartScan} />
      </Container>
      <Section band="surface">
        <ConcernTiles tiles={tiles} otherGoals={otherGoals} />
      </Section>
      <Section>
        <div className="section-heading">
          <div>
            <p className="type-label text-text-muted mb-3">Bestsellers</p>
            <h2 className="type-h2">
              Good places to <Accent>begin.</Accent>
            </h2>
          </div>
          <Button href="/shop" variant="secondary">
            Shop all
          </Button>
        </div>
        <ProductRail
          label="Bestsellers"
          items={bestsellers}
          onAddToBag={onAddToBag}
        />
      </Section>
      <Section band="surface">
        <ScanExplainer profile={sampleResult} onStartScan={onStartScan} />
      </Section>
      <Section>
        <TrustStrip />
      </Section>
    </main>
  );
}
