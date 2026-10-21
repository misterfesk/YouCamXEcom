import { notFound } from "next/navigation";
import { products } from "@/fixtures/ui/products";
import { ProductPreview } from "@/app/product-preview";
export function generateStaticParams() { return products.map(({slug}) => ({slug})); }
export async function generateMetadata({params}: PageProps<"/products/[slug]">) {
  const {slug} = await params;
  return {title: `${products.find(p=>p.slug===slug)?.name ?? "Product"} | [BRAND]`};
}
export default async function ProductPage({params}: PageProps<"/products/[slug]">) {
  const {slug} = await params;
  const product=products.find(p=>p.slug===slug);
  if(!product) notFound();
  return <ProductPreview product={product}/>;
}
