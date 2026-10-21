"use client";
import {
  BagView,
  CheckoutView,
  ConfirmationView,
} from "@/components/views/commerce-views";
import { usePreview } from "./preview-provider";
import { products } from "@/fixtures/ui/products";
import { sampleFits } from "@/fixtures/ui/product-fits";
export function CommercePreview({
  page,
}: {
  page: "bag" | "checkout" | "confirmation";
}) {
  const {
    bag,
    sampleId,
    recommendations,
    onQuantityChange,
    onRemove,
    onPlaceOrder,
    order,
  } = usePreview();
  const items = products
    .filter((p) => bag[p.id] > 0)
    .map((product) => ({
      product,
      quantity: bag[product.id],
      fit:
        sampleId && recommendations
          ? sampleFits[sampleId][product.id]
          : undefined,
    }));
  if (page === "confirmation") return <ConfirmationView order={order} />;
  if (page === "checkout")
    return <CheckoutView items={items} onPlaceOrder={onPlaceOrder} />;
  return (
    <BagView
      items={items}
      onQuantityChange={onQuantityChange}
      onRemove={onRemove}
    />
  );
}
