import { notFound } from "next/navigation";
import { CatalogPreview } from "@/app/catalog-preview";
import { STEPS, STEP_LABEL, type Step } from "@/types/catalog";
export function generateStaticParams() {
  return STEPS.map((step) => ({ step }));
}
export async function generateMetadata({ params }: PageProps<"/shop/[step]">) {
  const { step } = await params;
  return { title: `${STEP_LABEL[step as Step] ?? "Shop"} | [BRAND]` };
}
export default async function StepPage({ params }: PageProps<"/shop/[step]">) {
  const { step } = await params;
  if (!STEPS.includes(step as Step)) notFound();
  return <CatalogPreview key={step} step={step as Step} />;
}
