"use client";
import Link from "next/link";
import { uiTransition } from "@/styles/motion";
import { motion } from "motion/react";
import { STEPS, STEP_LABEL, type Product } from "@/types/catalog";
import { FIT_LEVEL_LABEL, type Fit } from "@/types/fit";
import { FitBadge } from "@/components/ui/fit-badge";
import { Button } from "@/components/ui/button";
import { Packshot } from "./packshot";
export type ProductCardProps = {
  product: Product;
  fit?: Fit;
  onAddToBag?: (productId: string) => void;
};
export function ProductCard({ product, fit, onAddToBag }: ProductCardProps) {
  // The badge names the reason; the card line names the match level, or the caution in full.
  const note =
    fit &&
    (fit.level === "care" || fit.level === "avoid"
      ? fit.reason
      : FIT_LEVEL_LABEL[fit.level]);
  return (
    <article className="product-card" data-unsuitable={fit?.level === "avoid"}>
      <Link href={`/products/${product.slug}`} className="product-card-link">
        <div className={`product-well well-${product.step}`}>
          {fit && (
            <motion.div
              className="product-badge"
              key={fit.level}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={uiTransition(false)}
            >
              <FitBadge fit={fit} />
            </motion.div>
          )}
          <Packshot
            {...product.image}
            label={STEP_LABEL[product.step].toUpperCase()}
            step={`0${STEPS.indexOf(product.step) + 1}`}
          />
          {product.new && <span className="product-new type-label">New</span>}
        </div>
        <div className="product-body">
          <p className="type-label text-text-muted">
            {STEP_LABEL[product.step]} · {product.size}
          </p>
          <h3 className="font-bold mt-2">{product.name}</h3>
          <p className="type-small text-text-muted mt-2">{product.tagline}</p>
          <p className="type-price mt-3">${product.price.toFixed(2)}</p>
          {note && note !== fit?.tag && (
            <p className="type-small text-text-muted mt-3">{note}</p>
          )}
        </div>
      </Link>
      {onAddToBag && (
        <div className="product-action">
          <Button
            variant="secondary"
            className="w-full"
            aria-label={`Add to bag: ${product.name}`}
            onClick={() => onAddToBag(product.id)}
          >
            Add to bag <span aria-hidden="true">+</span>
          </Button>
        </div>
      )}
    </article>
  );
}
