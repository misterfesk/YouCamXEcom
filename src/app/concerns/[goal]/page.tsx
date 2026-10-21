import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CatalogPreview } from "@/app/catalog-preview";
import { RouteFallback } from "@/app/route-fallback";
import { GOALS, GOAL_DEFS, type GoalId } from "@/types/goal";
export function generateStaticParams() {
  return GOALS.map((goal) => ({ goal }));
}
export async function generateMetadata({
  params,
}: PageProps<"/concerns/[goal]">) {
  const { goal } = await params;
  return {
    title: `${GOAL_DEFS[goal as GoalId]?.title ?? "Shop by concern"} | [BRAND]`,
  };
}
export default function GoalPage({ params }: PageProps<"/concerns/[goal]">) {
  return (
    <Suspense fallback={<RouteFallback />}>
      <GoalContent params={params} />
    </Suspense>
  );
}
async function GoalContent({
  params,
}: Pick<PageProps<"/concerns/[goal]">, "params">) {
  const { goal } = await params;
  if (!GOALS.includes(goal as GoalId)) notFound();
  return <CatalogPreview key={goal} goal={goal as GoalId} />;
}
