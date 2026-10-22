import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CatalogPage } from "@/app/_store/catalog-page";
import { RouteFallback } from "@/app/route-fallback";
import { STEPS, STEP_LABEL, type Step } from "@/types/catalog";
import { pageMetadata } from "@/lib/site-metadata";
export function generateStaticParams() {
  return STEPS.map((step) => ({ step }));
}
export async function generateMetadata({ params }: PageProps<"/shop/[step]">) {
  const { step } = await params;
  return pageMetadata(STEP_LABEL[step as Step] ?? "Shop", `/shop/${step}`);
}
export default function StepPage({ params }: PageProps<"/shop/[step]">) {
  return (
    <Suspense fallback={<RouteFallback />}>
      <StepContent params={params} />
    </Suspense>
  );
}
async function StepContent({ params }: Pick<PageProps<"/shop/[step]">, "params">) {
  const { step } = await params;
  if (!STEPS.includes(step as Step)) notFound();
  return <CatalogPage key={step} step={step as Step} />;
}
