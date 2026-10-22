import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CatalogPage } from "@/app/_store/catalog-page";
import { RouteFallback } from "@/app/route-fallback";
import { GOALS, GOAL_DEFS, type GoalId } from "@/types/goal";
import { pageMetadata } from "@/lib/site-metadata";
export function generateStaticParams() {
  return GOALS.map((goal) => ({ goal }));
}
export async function generateMetadata({
  params,
}: PageProps<"/concerns/[goal]">) {
  const { goal } = await params;
  const entry = GOAL_DEFS[goal as GoalId];
  return pageMetadata(entry?.title ?? "Shop by concern", `/concerns/${goal}`, entry?.blurb);
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
  return <CatalogPage key={goal} goal={goal as GoalId} />;
}
