import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/catalog";
import { ProductPage as ProductBody } from "@/app/_store/pages";
import { RouteFallback } from "@/app/route-fallback";
export function generateStaticParams() {
  return getProducts().map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  return {
    title: `${getProductBySlug(slug)?.name ?? "Product"} | [BRAND]`,
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
  const product = getProductBySlug(slug);
  if (!product) notFound();
  return <ProductBody key={slug} product={product} />;
}
