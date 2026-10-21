import { MethodView } from "@/components/views/information-views";
import { SOURCES } from "@/lib/knowledge/sources";
export const metadata = { title: "How we recommend | [BRAND]" };
export default function Page() {
  return <MethodView sources={Object.values(SOURCES)} />;
}
