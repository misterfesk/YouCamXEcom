"use client";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import type { ProductListing, ScanSource } from "@/types/storefront";
import { ProductCard } from "./product-card";
import { InlineScanCard } from "./scan-card";
import { uiTransition, resortTransition } from "@/styles/motion";
export type ProductGridProps = {
  items: ProductListing[];
  onAddToBag?: (id: string) => void;
  onStartScan?: (source: ScanSource) => void;
  animate?: boolean;
};
export function ProductGrid({
  items,
  onAddToBag,
  onStartScan,
  animate = false,
}: ProductGridProps) {
  const reduced = useReducedMotion();
  const entries: { id: string; node: ReactNode }[] = items.map((item) => ({
    id: item.product.id,
    node: <ProductCard {...item} onAddToBag={onAddToBag} />,
  }));
  if (onStartScan)
    entries.splice(Math.min(3, entries.length), 0, {
      id: "scan",
      node: <InlineScanCard onStartScan={onStartScan} />,
    });
  return (
    <ul className="product-grid" data-count={entries.length}>
      {animate && (
        <motion.li
          key={`highlight-${items.map((item) => item.product.id).join("-")}`}
          aria-hidden="true"
          className="reduced-grid-highlight"
          initial={{ opacity: 0 }}
          animate={{ opacity: reduced ? [0.3, 0] : 0 }}
          transition={uiTransition(false)}
        />
      )}
      {entries.map((entry, index) => (
        <motion.li
          key={entry.id}
          layout={animate && !reduced ? "position" : false}
          transition={resortTransition(!!reduced, index)}
        >
          {entry.node}
        </motion.li>
      ))}
    </ul>
  );
}
export function ProductRail({
  items,
  onAddToBag,
  label,
}: Omit<ProductGridProps, "onStartScan" | "animate"> & { label: string }) {
  const rail = useRef<HTMLUListElement>(null);
  const order = items.map((item) => item.product.id).join("|");
  useEffect(() => {
    if (rail.current) rail.current.scrollLeft = 0;
  }, [order]);
  return (
    <ul ref={rail} className="product-rail" aria-label={label} tabIndex={0}>
      {items.map((item) => (
        <li key={item.product.id}>
          <ProductCard {...item} onAddToBag={onAddToBag} />
        </li>
      ))}
    </ul>
  );
}
