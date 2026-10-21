import { Suspense } from "react";
import { notFound } from "next/navigation";
import { products } from "@/fixtures/ui/products";
import { ProductPreview } from "@/app/product-preview";
import { RouteFallback } from "@/app/route-fallback";
export function generateStaticParams() {
  return products.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  return {
    title: `${products.find((p) => p.slug === slug)?.name ?? "Product"} | [BRAND]`,
  };
}
export default function ProductPage({ params }: PageProps<"/products/[slug]">) {
  return (
    <Suspense fallback={<RouteFallback />}>
      <ProductContent params={params} />
    </Suspense>
  );
}
async function ProductContent({
  params,
}: Pick<PageProps<"/products/[slug]">, "params">) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();
  return <ProductPreview key={slug} product={product} />;
}
