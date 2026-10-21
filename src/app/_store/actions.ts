"use client";
import { getProduct } from "@/lib/catalog";
import { useBagStore } from "@/stores/bag";
import { useUiStore } from "@/stores/ui";
import type { ScanSource } from "@/types/storefront";

/** Store actions shared by every page; plain functions, so callers don't subscribe to state. */
export function addToBag(id: string) {
  useBagStore.getState().add(id);
  useUiStore.getState().notify(`${getProduct(id)?.name ?? "Product"} added to your bag`);
}

export function startScan(source: ScanSource) {
  useUiStore.getState().openScan(source, source === "results" ? "reveal" : source === "sample" ? "samples" : "intro");
}
