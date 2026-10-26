import Image from "next/image";
import { editorialImageSizes } from "@/styles/image-sizes";
import Link from "next/link";
import { SKIN_TYPE_LABEL } from "@/types/skin";
import { Accent } from "@/components/ui/accent";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { ScanButton } from "@/components/ui/scan-button";
import { Icon } from "@/components/icons/icon";
import { ScanCard } from "@/components/product/scan-card";
import { GOAL_FINDING, stoodOut } from "@/components/scan/scan-copy";
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
          <Eyebrow>
            {profile ? "Matched to your scan" : "Skincare, matched to you"}
          </Eyebrow>
          <h1 className="type-display mt-6">
            Skincare that <Accent>knows</Accent> your skin.
          </h1>
          <p className="type-body-lg mt-6">
            {profile
              ? `Your shop now leads with products for ${stoodOut(profile.goals)}. Every product shows how it fits your ${SKIN_TYPE_LABEL[profile.skinType].toLowerCase()} skin.`
              : "Scan once and the whole shop sorts itself around your skin, with the reason on every match. Or skip the scan and browse everything."}
          </p>
          <div className="hero-actions">
            <ScanButton size="lg" onClick={() => onStartScan("hero")}>
              {profile ? "✦ Rescan my skin" : undefined}
            </ScanButton>
            <Button href="/shop" size="lg" variant="secondary-on-brand">
              Shop all
            </Button>
          </div>
          <p className="type-small mt-4">
            {profile
              ? "Hide, rescan or delete your results anytime from your skin menu."
              : "Your photo is never saved. Results stay in this browser."}
          </p>
        </div>
        <div className="hero-portrait">
          <Image
            src="/images/skin-campaign.webp"
            alt="Two women, one with deep brown skin and one with fair freckled skin, photographed in natural daylight with visible skin texture"
            width={1536}
            height={1024}
            sizes={editorialImageSizes.campaign}
            loading="eager"
            fetchPriority="high"
          />
          <p className="hero-image-caption type-small">
            Made for every skin type and every skin tone.
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
          <Eyebrow className="text-text-muted mb-3">Shop by concern</Eyebrow>
          <h2 className="type-h2">
            Know what you want to <Accent>work on?</Accent>
          </h2>
        </div>
        <p className="text-text-muted max-w-copy">
          Go straight to the products made for it. No scan needed.
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
                sizes={editorialImageSizes.concern}
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
/** A friendly selfie being read: phone, face, scan line and the highlighted spots. */
function ExplainerArt() {
  return (
    <svg
      className="explainer-svg"
      viewBox="0 0 240 280"
      aria-hidden="true"
      focusable="false"
    >
      <circle className="art-blob" cx="196" cy="58" r="40" />
      <circle className="art-blob" cx="34" cy="228" r="28" />
      <rect className="art-phone" x="48" y="14" width="144" height="252" rx="26" />
      <rect className="art-screen" x="58" y="34" width="124" height="214" rx="16" />
      <rect className="art-notch" x="100" y="22" width="40" height="6" rx="3" />
      <ellipse className="art-face" cx="120" cy="138" rx="40" ry="48" />
      <path
        className="art-hair"
        d="M78 134c-6-46 16-70 42-70s48 24 42 70c-4-20-12-32-24-38-12 10-32 16-60 38Z"
      />
      <path className="art-line" d="M100 134q6-6 12 0M128 134q6-6 12 0" />
      <path className="art-line" d="M110 160q10 9 20 0" />
      <ellipse className="art-blush" cx="96" cy="152" rx="8" ry="5" />
      <ellipse className="art-blush" cx="144" cy="152" rx="8" ry="5" />
      <circle className="art-pin" cx="100" cy="170" r="5" />
      <circle className="art-pin" cx="141" cy="168" r="4" />
      <circle className="art-pin" cx="122" cy="178" r="3" />
      <rect className="art-scan" x="64" y="100" width="112" height="3" rx="1.5" />
      <path className="art-twinkle" d="M206 120v14m-7-7h14M28 74v10m-5-5h10" />
    </svg>
  );
}
export function ScanExplainer({
  profile,
  onStartScan,
}: ScanEntryProps & { profile: ProfileSummary }) {
  return (
    <div className="scan-explainer">
      <div>
        <Eyebrow className="text-text-muted mb-3">How it works</Eyebrow>
        <h2 className="type-h2">
          From selfie to <Accent>shelf.</Accent>
        </h2>
        <ol className="scan-steps">
          <li>
            <span aria-hidden="true">01</span>
            <div>
              <h3 className="type-h3">Take a selfie</h3>
              <p className="text-text-muted mt-2">
                Use your camera or upload a photo. Curious first? Try a sample
                face.
              </p>
            </div>
          </li>
          <li>
            <span aria-hidden="true">02</span>
            <div>
              <h3 className="type-h3">See what stands out</h3>
              <p className="text-text-muted mt-2">
                Learn your skin type and the three things most visible in your
                photo, in plain words.
              </p>
            </div>
          </li>
          <li>
            <span aria-hidden="true">03</span>
            <div>
              <h3 className="type-h3">Shop your matches</h3>
              <p className="text-text-muted mt-2">
                Products for your skin move to the front, each tagged with why.
                Anything that may not suit you is clearly marked.
              </p>
            </div>
          </li>
        </ol>
        <Link href="/how-we-recommend" className="concern-text-link text-brand">
          How we recommend
          <Icon name="chevron-right" />
        </Link>
      </div>
      <div className="explainer-card">
        <div className="explainer-art">
          <ExplainerArt />
          <div className="explainer-bubble">
            <p className="type-label text-text-muted">Sample result</p>
            <p className="font-bold mt-1">
              {SKIN_TYPE_LABEL[profile.skinType]} skin
            </p>
            <ul className="mt-2">
              {profile.goals.slice(0, 3).map((item) => (
                <li key={item.goal} className="type-small">
                  {GOAL_FINDING[item.goal].name}
                  <span className="text-text-muted">
                    {" "}
                    · {BAND_LABEL[item.band]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Button variant="secondary" onClick={() => onStartScan("sample")}>
          Try a sample face
        </Button>
        <p className="type-small text-text-muted">
          AI-generated sample faces with real recorded results. No photo of
          you needed.
        </p>
      </div>
    </div>
  );
}
export function TrustStrip() {
  return (
    <div className="trust-strip">
      <div>
        <h3 className="font-bold">Every tag has a reason.</h3>
        <p className="type-small text-text-muted mt-2">
          Each match says what it is for, and we flag anything that may not
          suit your skin.
        </p>
      </div>
      <div>
        <h3 className="font-bold">Shop for anyone.</h3>
        <p className="type-small text-text-muted mt-2">
          Buying a gift, or a product you already trust? The whole collection
          is open to browse, scan or no scan.
        </p>
      </div>
      <div>
        <h3 className="font-bold">Your photo is never kept.</h3>
        <p className="type-small text-text-muted mt-2">
          Only your results are saved, in this browser. Delete them anytime
          from your skin menu.
        </p>
      </div>
    </div>
  );
}
