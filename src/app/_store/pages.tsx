"use client";
import { startTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { HomeView } from "@/components/views/home-view";
import { ProductView } from "@/components/views/product-view";
import { BagView, CheckoutView, ConfirmationView } from "@/components/views/commerce-views";
import { getProduct, getProducts } from "@/lib/catalog";
import { compareFit } from "@/lib/ranking";
import { summarizeProfile } from "@/lib/skin/goals";
import { sampleProfile } from "@/lib/skin/samples";
import { useBagStore } from "@/stores/bag";
import { useUiStore } from "@/stores/ui";
import type { Product } from "@/types/catalog";
import type { GoalId } from "@/types/goal";
import type { BagItem, DemoOrder } from "@/types/commerce-view";
import type { ConcernTileData } from "@/components/home/home-sections";
import { addToBag, startScan } from "./actions";
import { listing, usePersonalization } from "./use-fits";

const CONCERN_TILES: ConcernTileData[] = [
  {
    goal: "hydrate",
    image: "/images/water-study.webp",
    alt: "Daylight catches a ripple in clear water beside cobalt ceramic",
  },
  {
    goal: "breakouts",
    image: "/images/gel-study.webp",
    alt: "A translucent gel swatch with small bubbles on white and lilac ceramic tiles",
  },
  {
    goal: "calm",
    image: "/images/cream-study.webp",
    alt: "A soft white cream swoosh on a cool grey slab beside a cobalt tile",
  },
];
const OTHER_HOME_GOALS: GoalId[] = ["oil-pores", "even-tone", "under-eyes", "smooth-firm"];

export function HomePage() {
  const { summary, fits } = usePersonalization();
  const sampleResult = useMemo(
    () => summarizeProfile(sampleProfile("mature", "2026-10-20T00:00:00.000Z")),
    [],
  );
  return (
    <HomeView
      profile={summary}
      bestsellers={getProducts()
        .filter((p) => p.bestseller)
        .map((p) => listing(p, fits))}
      tiles={CONCERN_TILES}
      otherGoals={OTHER_HOME_GOALS}
      sampleResult={sampleResult}
      onStartScan={startScan}
      onAddToBag={addToBag}
    />
  );
}

export function ProductPage({ product }: { product: Product }) {
  const { summary, fits } = usePersonalization();
  const quantity = useBagStore((s) => s.lines[product.id] ?? 0);
  // Other steps of a routine; with a profile, the best fits first and never "not for you".
  const pairs = getProducts()
    .filter((p) => p.step !== product.step && (!fits || ["great", "good"].includes(fits[p.id].level)))
    .sort((a, b) => compareFit(fits?.[a.id], fits?.[b.id]))
    .slice(0, 4)
    .map((p) => listing(p, fits));
  return (
    <ProductView
      product={product}
      fit={fits?.[product.id]}
      profile={summary}
      pairs={pairs}
      quantity={quantity}
      onAddToBag={addToBag}
      onStartScan={() => startScan("header")}
    />
  );
}

function useBagItems(): BagItem[] {
  const lines = useBagStore((s) => s.lines);
  const { fits } = usePersonalization();
  return Object.entries(lines).flatMap(([id, quantity]) => {
    const product = getProduct(id);
    return product ? [{ ...listing(product, fits), quantity }] : [];
  });
}

export function BagPage() {
  const items = useBagItems();
  const setQuantity = useBagStore((s) => s.setQuantity);
  const remove = useBagStore((s) => s.remove);
  return (
    <BagView
      items={items}
      onQuantityChange={setQuantity}
      onRemove={(id) => {
        remove(id);
        useUiStore.getState().notify("Removed from your bag");
      }}
    />
  );
}

export function CheckoutPage() {
  const router = useRouter();
  const items = useBagItems();
  return (
    <CheckoutView
      items={items}
      onPlaceOrder={() => {
        if (!items.length) return;
        const order: DemoOrder = {
          reference: "DEMO-" + String(Date.now()).slice(-6),
          items,
          total: items.reduce((sum, item) => sum + item.quantity * item.product.price, 0),
        };
        useUiStore.getState().setOrder(order);
        // One transition, so checkout never flashes an empty bag before leaving.
        startTransition(() => {
          useBagStore.getState().clear();
          router.push("/order-confirmation");
        });
      }}
    />
  );
}

export function ConfirmationPage() {
  const order = useUiStore((s) => s.order);
  return <ConfirmationView order={order} />;
}
