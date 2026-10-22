import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/catalog";
import { ProductPage as ProductBody } from "@/app/_store/pages";
import { RouteFallback } from "@/app/route-fallback";
import { pageMetadata, siteOrigin } from "@/lib/site-metadata";
import { BRAND_NAME } from "@/config/site";
export function generateStaticParams() {
  return getProducts().map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  return pageMetadata(product?.name ?? "Product", `/products/${slug}`, product?.description);
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: `Fictional demo product. ${product.description}`,
    sku: product.id,
    brand: { "@type": "Brand", name: BRAND_NAME },
    url: new URL(`/products/${slug}`, siteOrigin()).href,
    category: product.step,
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    <ProductBody key={slug} product={product} />
  </>;
}
