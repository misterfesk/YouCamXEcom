import { MethodView } from "@/components/views/information-views";
import { SOURCES } from "@/lib/knowledge/sources";
import { pageMetadata } from "@/lib/site-metadata";
export const metadata = pageMetadata("How we recommend", "/how-we-recommend");
export default function Page() {
  return <MethodView sources={Object.values(SOURCES)} />;
}
