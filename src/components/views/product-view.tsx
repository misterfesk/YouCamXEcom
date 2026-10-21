"use client";
import Link from "next/link";
import { STEPS, STEP_LABEL } from "@/types/catalog";
import { CONCERN_LABEL, SKIN_TYPE_LABEL, BAND_LABEL } from "@/types/skin";
import type { ProductListing, ProfileSummary } from "@/types/storefront";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ScanButton } from "@/components/ui/scan-button";
import { FitBadge } from "@/components/ui/fit-badge";
import { Packshot } from "@/components/product/packshot";
import { ProductRail } from "@/components/product/product-grid";
import { GOAL_DEFS } from "@/types/goal";
export type ProductViewProps = ProductListing & {
  profile?: ProfileSummary;
  pairs: ProductListing[];
  quantity: number;
  onAddToBag: (id: string) => void;
  onStartScan: () => void;
};
export function ProductDetails({
  product,
  fit,
  profile,
}: Pick<ProductViewProps, "product" | "fit" | "profile">) {
  return (
    <div className="detail-stack">
      {fit && (
        <details open={fit.level === "avoid" || fit.level === "care"}>
          <summary>Why this fits you</summary>
          <div className="detail-content">
            <p>{fit.reason}</p>
            {profile && (
              <>
                <p>
                  {SKIN_TYPE_LABEL[profile.skinType]} skin:{" "}
                  {product.skinTypes[profile.skinType] === "avoid"
                    ? "this texture is not a suggested match"
                    : product.skinTypes[profile.skinType] === "suitable"
                      ? "a compatible texture in this sample routine"
                      : "a neutral texture match"}
                  .
                </p>
                <ul>
                  {profile.goals
                    .filter(({ goal }) =>
                      product.targets.some((t) =>
                        GOAL_DEFS[goal].concerns.includes(t.concern),
                      ),
                    )
                    .map((g) => (
                      <li key={g.goal}>
                        {GOAL_DEFS[g.goal].title}: {BAND_LABEL[g.band]} ·{" "}
                        {Math.round(g.severity)}/100
                      </li>
                    ))}
                </ul>
              </>
            )}
            <p>
              {STEP_LABEL[product.step]} step · {product.usage.frequency}{" "}
              {product.usage.howTo}
            </p>
            <Link className="text-brand underline" href="/how-we-recommend">
              How we recommend
            </Link>
            <p className="type-small text-text-muted">
              Demo fit guidance from a recorded sample. A match is not a
              guarantee of results.
            </p>
          </div>
        </details>
      )}
      {product.safety.length > 0 && (
        <aside className="safety-note">
          <h2 className="type-h3">A little care first</h2>
          {product.safety.includes("strongActives") && (
            <p>
              Patch test first and introduce this active slowly. Keep daily sun
              protection in your routine. Avoid layering it with other strong
              actives in the same routine. Stop if your skin feels irritated.
            </p>
          )}
          {product.safety.includes("pregnancy") && (
            <p>
              Check with your clinician before use during pregnancy or
              breastfeeding.
            </p>
          )}
        </aside>
      )}
      <details open>
        <summary>How to use</summary>
        <div className="detail-content">
          <p>
            {product.usage.when === "both"
              ? "Morning or evening"
              : product.usage.when === "am"
                ? "Morning"
                : "Evening"}{" "}
            · {product.usage.frequency}
          </p>
          <p>{product.usage.howTo}</p>
        </div>
      </details>
      <details>
        <summary>Actives & focus</summary>
        <div className="detail-content">
          <ul>
            {product.actives.map((a) => (
              <li key={a.id}>
                {a.percent ? `${a.percent}% ` : ""}
                {a.id.replaceAll("-", " ")}
              </li>
            ))}
          </ul>
          <p>
            Formula focus:{" "}
            {product.targets
              .map((t) => CONCERN_LABEL[t.concern].toLowerCase())
              .join(", ")}
            .
          </p>
        </div>
      </details>
      <details>
        <summary>Full ingredient list</summary>
        <div className="detail-content">
          <p>{product.ingredientsInci}</p>
          <p className="type-small text-text-muted">
            Illustrative formula for this demo store. Refer to the final
            packaging for a real product’s ingredient list.
          </p>
        </div>
      </details>
    </div>
  );
}
export function ProductView({
  product,
  fit,
  profile,
  pairs,
  quantity,
  onAddToBag,
  onStartScan,
}: ProductViewProps) {
  return (
    <main id="main-content" tabIndex={-1} className="product-page">
      <Container>
        <nav aria-label="Breadcrumb" className="breadcrumbs">
          <Link href="/shop">Shop</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/shop/${product.step}`}>{STEP_LABEL[product.step]}</Link>
        </nav>
        <div className="pdp-layout">
          <figure className="pdp-art">
            <span className="type-label">
              [BRAND] / {STEP_LABEL[product.step]}
            </span>
            <Packshot
              shape={product.image.shape}
              color={product.image.color}
              label={product.step.toUpperCase()}
              step={`0${STEPS.indexOf(product.step) + 1}`}
            />
            <figcaption className="type-small">
              {product.size} · Illustrative packaging
            </figcaption>
          </figure>
          <div className="pdp-copy">
            <p className="type-label text-brand">
              {STEP_LABEL[product.step]} / {product.size}
            </p>
            <h1 className="type-h1">{product.name}</h1>
            <p className="type-body-lg">{product.tagline}</p>
            <p className="type-h3">
              ${product.price.toFixed(2)}{" "}
              <span className="type-small text-text-muted">
                USD · {product.size}
              </span>
            </p>
            {fit ? (
              <div className="pdp-fit">
                <FitBadge fit={fit} size="pdp" />
                <p>{fit.reason}</p>
              </div>
            ) : (
              <div className="pdp-fit">
                <p>Does this suit my skin?</p>
                {profile ? (
                  <p className="type-small">
                    Recommendations are off. Turn them on in your skin menu to
                    see your match.
                  </p>
                ) : (
                  <ScanButton onClick={onStartScan}>
                    ✦ Does this suit my skin?
                  </ScanButton>
                )}
              </div>
            )}
            <Button size="lg" onClick={() => onAddToBag(product.id)}>
              Add to bag · ${product.price.toFixed(2)}
            </Button>
            <p role="status" className="type-small text-text-muted">
              {quantity > 0
                ? `${quantity} in your bag`
                : "Demo collection. No payment will be taken."}
            </p>
            <p>{product.description}</p>
            <ProductDetails product={product} fit={fit} profile={profile} />
          </div>
        </div>
        <section className="section">
          <h2 className="type-h2 mb-3">
            {fit ? "Pairs well for your skin" : "Build around this step"}
          </h2>
          <p className="mb-6 text-text-muted">
            {fit
              ? "Complementary steps with your sample skin profile in mind."
              : "A few other steps to explore at your own pace."}
          </p>
          <ProductRail
            items={pairs}
            label="Complementary products"
            onAddToBag={onAddToBag}
          />
        </section>
        <div className="mobile-bag-bar">
          <span>
            <strong>${product.price.toFixed(2)}</strong>
            <span className="type-small">{product.size}</span>
          </span>
          <Button onClick={() => onAddToBag(product.id)}>Add to bag</Button>
        </div>
      </Container>
    </main>
  );
}
