import { notFound } from "next/navigation";
import { CatalogPreview } from "@/app/catalog-preview";
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
export default async function GoalPage({
  params,
}: PageProps<"/concerns/[goal]">) {
  const { goal } = await params;
  if (!GOALS.includes(goal as GoalId)) notFound();
  return <CatalogPreview key={goal} goal={goal as GoalId} />;
}
