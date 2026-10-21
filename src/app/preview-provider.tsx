"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SkinSummary } from "@/components/scan/skin-summary";
import { SiteFooter } from "@/components/layout/site-footer";
import { SamplePicker } from "@/components/scan/sample-picker";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
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
      <Modal
        open={searchOpen}
        onOpenChange={setSearchOpen}
        title="Find your next step"
        description="Browse the collection by routine step or skin concern."
      >
        <Button href="/shop" onClick={() => setSearchOpen(false)}>
          Explore all products
        </Button>
      </Modal>
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
