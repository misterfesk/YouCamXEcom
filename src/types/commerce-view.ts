import type { ProductListing } from "./storefront";
export type BagItem = ProductListing & { quantity: number };
export type DemoOrder = { reference: string; items: BagItem[]; total: number };
