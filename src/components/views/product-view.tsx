"use client";
import { BRAND_NAME } from "@/config/site";
import Link from "next/link";
import { STEPS, STEP_LABEL } from "@/types/catalog";
import { CONCERN_LABEL, BAND_LABEL } from "@/types/skin";
import type { ProductListing, ProfileSummary } from "@/types/storefront";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ScanButton } from "@/components/ui/scan-button";
import { FitBadge } from "@/components/ui/fit-badge";
import { Packshot } from "@/components/product/packshot";
import { ProductRail } from "@/components/product/product-grid";
import { GOAL_DEFS } from "@/types/goal";
import { GOAL_FINDING } from "@/components/scan/scan-copy";
export type ProductViewProps = ProductListing & {
  profile?: ProfileSummary;
  pairs: ProductListing[];
  quantity: number;
  onAddToBag: (id: string) => void;
  onStartScan: () => void;
};
/** One general note for flagged products: why we flag, and why buying one can still be right. */
function FlaggedNote({ level }: { level: "care" | "avoid" }) {
  return (
    <div className="flagged-note">
      <p className="font-bold">
        {level === "avoid"
          ? "Why we flag some products"
          : "Why we suggest care"}
      </p>
      <p>
        Your scan suggests this formula may be too rich, too drying or too
        strong for your skin right now, so it could lead to breakouts or
        irritation. It can still be the right buy: a gift, a product your
        dermatologist recommended, or one you already use happily. If so,
        follow their advice, and patch test before using anything new on your
        face.
      </p>
    </div>
  );
}
export function ProductDetails({
  product,
  fit,
  profile,
}: Pick<ProductViewProps, "product" | "fit" | "profile">) {
  return (
    <div className="detail-stack">
      {fit && (
        <details open={fit.level === "avoid" || fit.level === "care"}>
          <summary>
            {fit.level === "avoid" || fit.level === "care"
              ? "Why it’s flagged for you"
              : "Why it suits you"}
          </summary>
          <div className="detail-content">
            {fit.reasons?.length ? (
              <ul className="fit-reasons">
                {fit.reasons.map((r) => (
                  <li key={r.text} data-tone={r.tone}>
                    <span aria-hidden="true">{r.tone === "caution" ? "!" : "✓"}</span>
                    <span>
                      <span className="sr-only">{r.tone === "caution" ? "Caution: " : ""}</span>
                      {r.text}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>{fit.reason}</p>
            )}
            {(fit.level === "avoid" || fit.level === "care") && (
              <FlaggedNote level={fit.level} />
            )}
            {profile && (
              <ul>
                {profile.goals
                  .slice(0, 3)
                  .filter(({ goal }) =>
                    product.targets.some((t) => GOAL_DEFS[goal].concerns.includes(t.concern)),
                  )
                  .map((g) => (
                    <li key={g.goal}>
                      In your scan: {GOAL_FINDING[g.goal].name.toLowerCase()} ·{" "}
                      {BAND_LABEL[g.band].toLowerCase()}
                    </li>
                  ))}
              </ul>
            )}
            <p>
              {STEP_LABEL[product.step]} step · {product.usage.frequency}{" "}
              {product.usage.howTo}
            </p>
            <Link className="text-brand underline" href="/how-we-recommend">
              How we recommend
            </Link>
            <p className="type-small text-text-muted">
              Based on your skin scan. A match is a good starting point, not a
              promise of results.
            </p>
          </div>
        </details>
      )}
      {product.safety.length > 0 && (
        <aside className="safety-note">
          <h2 className="type-h3">Before you start</h2>
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
              {BRAND_NAME} / {STEP_LABEL[product.step]}
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
                {profile ? (
                  <>
                    <p>Your matches are hidden.</p>
                    <p className="type-small">
                      Choose Show my matches in your skin menu to see how this
                      fits your skin.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      One selfie, about 30 seconds. You’ll come back to this
                      page with the answer.
                    </p>
                    <ScanButton onClick={onStartScan}>
                      ✦ Does this suit my skin?
                    </ScanButton>
                  </>
                )}
              </div>
            )}
            <Button size="lg" onClick={() => onAddToBag(product.id)}>
              Add to bag · ${product.price.toFixed(2)}
            </Button>
            <p role="status" className="type-small text-text-muted">
              {quantity > 0
                ? `${quantity} in your bag`
                : "Demo store: nothing is charged or shipped."}
            </p>
            <p>{product.description}</p>
            <ProductDetails product={product} fit={fit} profile={profile} />
          </div>
        </div>
        <section className="section">
          <h2 className="type-h2 mb-3">
            {fit ? "Pairs well for your skin" : "Pairs well with this"}
          </h2>
          <p className="mb-6 text-text-muted">
            {fit
              ? "Other routine steps that fit your skin."
              : "Other routine steps that go with it."}
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
