"use client";
import { useRouter } from "next/navigation";
import { products } from "@/fixtures/ui/products";
import { sampleFits } from "@/fixtures/ui/product-fits";
import { searchProducts } from "./preview-search";
import { SearchOverlay } from "@/components/search/search-overlay";
import type { DemoOrder } from "@/types/commerce-view";
import { createContext, useContext, useState, type ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SkinSummary } from "@/components/scan/skin-summary";
import { SiteFooter } from "@/components/layout/site-footer";
import { SamplePicker } from "@/components/scan/sample-picker";
import { Modal } from "@/components/ui/modal";
import { sampleProfiles } from "@/fixtures/ui/profiles";
import { GOALS, GOAL_DEFS, type GoalScore } from "@/types/goal";
import type { SampleFaceId } from "@/types/scan";
import type { ProfileSummary, ScanSource } from "@/types/storefront";
export const sampleOptions = [
  {
    id: "oily" as const,
    label: "Breakouts & oil",
    detail: "Texture, hydration and oil balance",
  },
  {
    id: "dry" as const,
    label: "Dehydration & redness",
    detail: "Texture, hydration and comfort",
  },
  {
    id: "mature" as const,
    label: "Under-eyes & firmness",
    detail: "Under-eye care, hydration and firmness",
  },
];
export function summarizeProfile(id: SampleFaceId): ProfileSummary {
  const profile = sampleProfiles[id];
  const goals: GoalScore[] = GOALS.map((goal) => {
    const scores = profile.concerns.filter((item) =>
      GOAL_DEFS[goal].concerns.includes(item.concern),
    );
    const highest = scores.reduce((a, b) => (a.severity > b.severity ? a : b));
    return { goal, severity: highest.severity, band: highest.band };
  }).sort((a, b) => b.severity - a.severity);
  return {
    skinType: profile.skinType.whole.type,
    goals,
    label: `Oily · ${GOAL_DEFS[goals[0].goal].title}`,
  };
}
type PreviewState = {
  sampleId?: SampleFaceId;
  profile?: ProfileSummary;
  recommendations: boolean;
  bag: Record<string, number>;
  order?: DemoOrder;
  onQuantityChange: (id:string, quantity:number)=>void;
  onRemove: (id:string)=>void;
  onPlaceOrder: ()=>void;
  onStartScan: (source: ScanSource) => void;
  onAddToBag: (id: string) => void;
};
const PreviewContext = createContext<PreviewState | null>(null);
export function usePreview() {
  const value = useContext(PreviewContext);
  if (!value) throw new Error("Preview provider is required");
  return value;
}
export function PreviewProvider({ children }: { children: ReactNode }) {
  const router=useRouter();
  const [order,setOrder]=useState<DemoOrder>();
  const [query,setQuery]=useState("");
  const [sampleId, setSampleId] = useState<SampleFaceId>();
  const [recommendations, setRecommendations] = useState(true);
  const [bag, setBag] = useState<Record<string, number>>({});
  const [scanOpen, setScanOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const profile = sampleId ? summarizeProfile(sampleId) : undefined;
  const onStartScan = (source: ScanSource) =>
    source === "results" && profile ? setResultsOpen(true) : setScanOpen(true);
  const onAddToBag = (id: string) => {
    setBag((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }));
    setNotice("Added to your bag");
  };
  return (
    <PreviewContext.Provider
      value={{
        sampleId,
        profile,
        recommendations,
        bag,
        order,
        onQuantityChange:(id,quantity)=>setBag(current=>({...current,[id]:Math.max(1,Math.floor(quantity))})),
        onRemove:(id)=>{setBag(current=>{const next={...current};delete next[id];return next;});setNotice("Removed from your bag");},
        onPlaceOrder:()=>{const items=products.filter(p=>bag[p.id]>0).map(product=>({product,quantity:bag[product.id]}));if(!items.length)return;setOrder({reference:"DEMO-"+String(Date.now()).slice(-6),items,total:items.reduce((sum,item)=>sum+item.quantity*item.product.price,0)});setBag({});router.push("/order-confirmation");},
        onStartScan,
        onAddToBag,
      }}
    >
      <SiteHeader
        profile={profile}
        recommendations={recommendations}
        bagCount={Object.values(bag).reduce((a, b) => a + b, 0)}
        onStartScan={onStartScan}
        onToggleRecommendations={() => setRecommendations((value) => !value)}
        onDeleteResults={() => {
          setSampleId(undefined);
          setRecommendations(true);
          setNotice("Your results have been deleted");
        }}
        onSearch={() => setSearchOpen(true)}
      />
      {children}
      <SiteFooter />
      <SamplePicker
        open={scanOpen}
        onOpenChange={setScanOpen}
        samples={sampleOptions}
        onSelectSample={(id) => {
          setSampleId(id);
          setRecommendations(true);
          setScanOpen(false);
          setNotice("Recommendations are on. Explore products for your skin.");
        }}
      />
      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} query={query} onQueryChange={setQuery} results={searchProducts(products,query).map(product=>({product,fit:sampleId&&recommendations?sampleFits[sampleId][product.id]:undefined}))} onNavigate={()=>setSearchOpen(false)}/>
      <Modal
        open={resultsOpen}
        onOpenChange={setResultsOpen}
        title="Your skin, a little clearer"
        description="Recorded sample analysis. Everyday skincare guidance, not a diagnosis."
      >
        {profile && (
          <SkinSummary
            profile={profile}
            onContinue={() => setResultsOpen(false)}
          />
        )}
      </Modal>
      <div role="status" className="sr-only">
        {notice}
      </div>
    </PreviewContext.Provider>
  );
}
