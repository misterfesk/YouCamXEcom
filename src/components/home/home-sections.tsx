import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Accent } from "@/components/ui/accent";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { ScanButton } from "@/components/ui/scan-button";
import { Icon } from "@/components/icons/icon";
import { ScanCard } from "@/components/product/scan-card";
import { GOAL_DEFS, type GoalId } from "@/types/goal";
import { BAND_LABEL } from "@/types/skin";
import type { ProfileSummary, ScanSource } from "@/types/storefront";
export type ConcernTileData = { goal: GoalId; image: string; alt: string };
export type ScanEntryProps = { onStartScan: (source: ScanSource) => void };
export function HomeHero({
  profile,
  onStartScan,
}: ScanEntryProps & { profile?: ProfileSummary }) {
  return (
    <div className="home-hero-wrap">
      <div className="home-hero on-brand">
        <div className="hero-copy">
          <Eyebrow>Skin first. Everything follows.</Eyebrow>
          <h1 className="type-display mt-6">
            Skincare that <Accent>knows</Accent> your skin.
          </h1>
          <p className="type-body-lg mt-6">
            A little understanding changes where you start. Explore your skin,
            then find a shelf arranged around you.
          </p>
          <div className="hero-actions">
            <ScanButton size="lg" onClick={() => onStartScan("hero")} />
            <Button href="/shop" size="lg" variant="secondary-on-brand">
              Shop all
            </Button>
          </div>
          <p className="type-small mt-4">
            Your scan is optional. Your next step is yours.
          </p>
        </div>
        <div className="hero-portrait">
          <Image
            src="/images/skin-campaign.webp"
            alt="Two women, one with deep brown skin and one with fair freckled skin, photographed in natural daylight with visible skin texture"
            width={1536}
            height={1024}
            sizes="(min-width: 1024px) 50vw, 100vw"
            preload
          />
          <p className="hero-image-caption type-small">
            Different skin. The same care in getting to know it.
          </p>
        </div>
        <div className="hero-scan">
          <ScanCard profile={profile} onStartScan={onStartScan} />
        </div>
      </div>
    </div>
  );
}
export function ConcernTiles({
  tiles,
  otherGoals,
}: {
  tiles: ConcernTileData[];
  otherGoals: GoalId[];
}) {
  return (
    <>
      <div className="section-heading">
        <div>
          <Eyebrow className="text-text-muted mb-3">
            Start with what matters to you
          </Eyebrow>
          <h2 className="type-h2">
            A little more <Accent>focus.</Accent>
          </h2>
        </div>
        <p className="text-text-muted max-w-copy">
          You know how your skin feels. Choose a concern and explore from there.
        </p>
      </div>
      <div className="concern-tiles">
        {tiles.map((tile) => (
          <Link
            key={tile.goal}
            href={`/concerns/${tile.goal}`}
            className="concern-tile"
          >
            <div className="concern-image">
              <Image
                src={tile.image}
                alt={tile.alt}
                width={1536}
                height={1024}
                sizes="(min-width: 768px) 33vw, 100vw"
              />
            </div>
            <div className="concern-copy">
              <div className="flex items-center justify-between gap-4">
                <h3 className="type-h3">{GOAL_DEFS[tile.goal].title}</h3>
                <Icon name="chevron-right" />
              </div>
              <p className="type-small text-text-muted mt-3">
                {GOAL_DEFS[tile.goal].blurb}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <nav aria-label="More skin concerns" className="more-concerns">
        {otherGoals.map((goal) => (
          <Link
            key={goal}
            href={`/concerns/${goal}`}
            className="concern-text-link"
          >
            {GOAL_DEFS[goal].title}
            <Icon name="chevron-right" />
          </Link>
        ))}
      </nav>
    </>
  );
}
export function SampleResultCard({
  profile,
  onStartScan,
}: ScanEntryProps & { profile: ProfileSummary }) {
  return (
    <div className="sample-result">
      <div className="sample-result-photo">
        <Image
          src="/samples/mature.jpg"
          alt="AI-generated sample face used for recorded under-eye, hydration and firmness analysis"
          width={600}
          height={600}
          sizes="(min-width: 768px) 280px, 100vw"
        />
        <span className="sample-photo-label type-label">Sample face</span>
      </div>
      <div className="sample-result-body">
        <Eyebrow className="text-text-muted mb-3">
          A real recorded analysis
        </Eyebrow>
        <h3 className="type-h3">Three places to start.</h3>
        <p className="type-small text-text-muted mt-2 mb-6">
          Oily skin · YouCam sample results
        </p>
        <ol className="severity-list">
          {profile.goals.slice(0, 3).map((item) => (
            <li key={item.goal}>
              <div className="flex justify-between gap-3 mb-2">
                <span>{GOAL_DEFS[item.goal].title}</span>
                <span className="type-small text-text-muted">
                  {BAND_LABEL[item.band]}
                </span>
              </div>
              <div
                className="severity-track"
                role="meter"
                aria-label={GOAL_DEFS[item.goal].title}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={item.severity}
                aria-valuetext={BAND_LABEL[item.band]}
              >
                <span
                  style={{ "--severity": `${item.severity}%` } as CSSProperties}
                />
              </div>
            </li>
          ))}
        </ol>
        <Button
          variant="secondary"
          className="mt-6"
          onClick={() => onStartScan("hero")}
        >
          Explore a sample
        </Button>
        <p className="type-small text-text-muted mt-4">
          AI-generated face. Recorded scores, not a treatment result.
        </p>
      </div>
    </div>
  );
}
export function ScanExplainer({
  profile,
  onStartScan,
}: ScanEntryProps & { profile: ProfileSummary }) {
  return (
    <div className="scan-explainer">
      <div>
        <Eyebrow className="text-text-muted mb-3">From selfie to shelf</Eyebrow>
        <h2 className="type-h2">
          Less guesswork.
          <br />A little more <Accent>you.</Accent>
        </h2>
        <ol className="scan-steps">
          <li>
            <span aria-hidden="true">01</span>
            <div>
              <h3 className="type-h3">Start with your skin</h3>
              <p className="text-text-muted mt-2">
                Take a selfie, upload a photo, or try a sample face to explore.
              </p>
            </div>
          </li>
          <li>
            <span aria-hidden="true">02</span>
            <div>
              <h3 className="type-h3">See what comes into focus</h3>
              <p className="text-text-muted mt-2">
                Your analysis brings hydration, texture and other concerns into
                view.
              </p>
            </div>
          </li>
          <li>
            <span aria-hidden="true">03</span>
            <div>
              <h3 className="type-h3">Find your next step</h3>
              <p className="text-text-muted mt-2">
                Products move around your focus, with a fit badge to explain
                each match.
              </p>
            </div>
          </li>
        </ol>
        <Link href="/how-we-recommend" className="concern-text-link text-brand">
          How we recommend
          <Icon name="chevron-right" />
        </Link>
      </div>
      <SampleResultCard profile={profile} onStartScan={onStartScan} />
    </div>
  );
}
export function TrustStrip() {
  return (
    <div className="trust-strip">
      <div>
        <h3 className="font-bold">Always optional.</h3>
        <p className="type-small text-text-muted mt-2">
          Shop the whole collection with or without a scan.
        </p>
      </div>
      <div>
        <h3 className="font-bold">Your results, your choice.</h3>
        <p className="type-small text-text-muted mt-2">
          Switch recommendations off or delete your results at any time.
        </p>
      </div>
      <div>
        <h3 className="font-bold">Care, with perspective.</h3>
        <p className="type-small text-text-muted mt-2">
          Everyday guidance, not a diagnosis. A professional can help with
          persistent concerns.
        </p>
      </div>
    </div>
  );
}
