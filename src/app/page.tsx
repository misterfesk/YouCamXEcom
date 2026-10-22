import { HomePage } from "./_store/pages";
import { pageMetadata } from "@/lib/site-metadata";
export const metadata = pageMetadata("Skincare with a reason", "/");
export default function Home() {
  return <HomePage />;
}
