"use client";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import type { ProductListing, ScanSource } from "@/types/storefront";
import { ProductCard } from "./product-card";
import { InlineScanCard } from "./scan-card";
import { resortTransition } from "@/styles/motion";
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
    <ul className="product-grid">
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
  return (
    <ul className="product-rail" aria-label={label} tabIndex={0}>
      {items.map((item) => (
        <li key={item.product.id}>
          <ProductCard {...item} onAddToBag={onAddToBag} />
        </li>
      ))}
    </ul>
  );
}
