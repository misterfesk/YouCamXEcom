"use client";
import { STEPS, STEP_LABEL } from "@/types/catalog";
import Link from "next/link";
import type { BagItem } from "@/types/commerce-view";
import { Packshot } from "@/components/product/packshot";
import { Button } from "@/components/ui/button";
import { FitBadge } from "@/components/ui/fit-badge";
export function BagLine({
  product,
  fit,
  quantity,
  onQuantityChange,
  onRemove,
}: BagItem & {
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <article className="bag-line">
      <Link
        className="bag-art"
        href={`/products/${product.slug}`}
        aria-label={`View ${product.name}`}
      >
        <Packshot
          {...product.image}
          label={STEP_LABEL[product.step].toUpperCase()}
          step={`0${STEPS.indexOf(product.step) + 1}`}
        />
      </Link>
      <div className="bag-line-content">
        <Link className="font-bold" href={`/products/${product.slug}`}>
          {product.name}
        </Link>
        <p className="type-small text-text-muted">
          {product.size} · ${product.price.toFixed(2)} each
        </p>
        {fit && <FitBadge fit={fit} />}
        <div className="bag-controls">
          <label className="field-label type-small">
            Quantity
            <select
              aria-label={`Quantity for ${product.name}`}
              className="select-control"
              value={quantity}
              onChange={(e) =>
                onQuantityChange(product.id, Number(e.target.value))
              }
            >
              {Array.from(
                { length: Math.max(10, quantity) },
                (_, i) => i + 1,
              ).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <Button
            variant="ghost"
            aria-label={`Remove ${product.name}`}
            onClick={() => onRemove(product.id)}
          >
            Remove
          </Button>
        </div>
      </div>
      <p className="font-bold">${(quantity * product.price).toFixed(2)}</p>
    </article>
  );
}
export function OrderSummary({
  subtotal,
  children,
}: {
  subtotal: number;
  children?: React.ReactNode;
}) {
  return (
    <aside className="order-summary">
      <h2 className="type-h3">Order summary</h2>
      <dl>
        <div>
          <dt>Products</dt>
          <dd>${subtotal.toFixed(2)}</dd>
        </div>
        <div>
          <dt>Demo shipping</dt>
          <dd>$0.00</dd>
        </div>
        <div>
          <dt>Demo tax</dt>
          <dd>$0.00</dd>
        </div>
        <div className="summary-total">
          <dt>Total · USD</dt>
          <dd>${subtotal.toFixed(2)}</dd>
        </div>
      </dl>
      <p className="type-small text-text-muted">
        Illustrative totals for this demo. Nothing is charged, shipped or
        reserved.
      </p>
      {children}
    </aside>
  );
}
export function EmptyBag() {
  return (
    <div className="empty-panel">
      <p className="type-label text-brand">Your bag</p>
      <h2 className="type-h2">Your bag is empty.</h2>
      <p>
        Start with the basics: a cleanser, a moisturizer and SPF.
      </p>
      <Button href="/shop">Shop all</Button>
    </div>
  );
}
