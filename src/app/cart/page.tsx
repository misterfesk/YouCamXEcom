import { BagPage } from "@/app/_store/pages";
export const metadata = { title: "Your bag", robots: { index: false, follow: false } };
export default function Page() {
  return <BagPage />;
}
