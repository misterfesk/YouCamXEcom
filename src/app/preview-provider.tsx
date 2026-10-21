"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ScanModal } from "@/components/scan/scan-flow";
import { SearchOverlay } from "@/components/search/search-overlay";
import { products } from "@/fixtures/ui/products";
import { sampleFits } from "@/fixtures/ui/product-fits";
import { sampleProfiles } from "@/fixtures/ui/profiles";
import { searchProducts } from "./preview-search";
import { GOALS, GOAL_DEFS, type GoalScore } from "@/types/goal";
import type { SampleFaceId, ScanStep, ScanErrorCode } from "@/types/scan";
import type { ProfileSummary, ScanSource } from "@/types/storefront";
import type { DemoOrder } from "@/types/commerce-view";
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
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onPlaceOrder: () => void;
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
  const router = useRouter();
  const [sampleId, setSampleId] = useState<SampleFaceId>();
  const [recommendations, setRecommendations] = useState(true);
  const [bag, setBag] = useState<Record<string, number>>({});
  const [order, setOrder] = useState<DemoOrder>();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);
  const [scanOpen, setScanOpen] = useState(false);
  const [step, setStep] = useState<ScanStep>("intro");
  const [consent, setConsent] = useState(false);
  const [pendingSample, setPendingSample] = useState<SampleFaceId>();
  const [photo, setPhoto] = useState<string>();
  const [analysisStage, setAnalysisStage] = useState(0);
  const [error, setError] = useState<ScanErrorCode>("unknown");
  const [revisiting, setRevisiting] = useState(false);
  const returnPath = useRef("/");
  const uploadGeneration = useRef(0);
  const blobUrl = useRef<string | undefined>(undefined);
  const profile = sampleId ? summarizeProfile(sampleId) : undefined;
  const clearPhoto = () => {
    uploadGeneration.current += 1;
    if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
    blobUrl.current = undefined;
    setPhoto(undefined);
  };
  const closeScan = () => {
    clearPhoto();
    setScanOpen(false);
    setConsent(false);
    setPendingSample(undefined);
    setRevisiting(false);
  };
  useEffect(
    () => () => {
      if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
    },
    [],
  );
  useEffect(() => {
    if (!scanOpen || step !== "analyzing") return;
    const timers = [1, 2, 3].map((stage) =>
      setTimeout(() => setAnalysisStage(stage), stage * 650),
    );
    timers.push(setTimeout(() => setStep("reveal"), 2800));
    return () => timers.forEach(clearTimeout);
  }, [scanOpen, step]);
  const onStartScan = (source: ScanSource) => {
    clearPhoto();
    setPendingSample(undefined);
    setConsent(false);
    returnPath.current = window.location.pathname;
    const results = source === "results" && !!profile;
    setRevisiting(results);
    setStep(results ? "reveal" : "intro");
    setScanOpen(true);
  };
  const onAddToBag = (id: string) => {
    setBag((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }));
    setNotice(
      `${products.find((p) => p.id === id)?.name ?? "Product"} added to your bag`,
    );
  };
  const onUpload = async (file: File) => {
    clearPhoto();
    const generation = uploadGeneration.current;
    const fail = (code: ScanErrorCode) => {
      setError(code);
      setStep("error");
    };
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      fail("unknown");
      return;
    }
    if (file.size > 2.5 * 1024 * 1024) {
      fail("image_too_large");
      return;
    }
    const url = URL.createObjectURL(file);
    blobUrl.current = url;
    try {
      const image = new window.Image();
      image.src = url;
      await image.decode();
      if (generation !== uploadGeneration.current) return;
      if (image.naturalWidth < 1080 || image.naturalHeight < 1080) {
        clearPhoto();
        fail("image_too_small");
        return;
      }
      setPendingSample(undefined);
      setPhoto(url);
      setStep("preview");
    } catch {
      if (generation !== uploadGeneration.current) return;
      clearPhoto();
      fail("unknown");
    }
  };
  const resultId = pendingSample ?? sampleId;
  return (
    <PreviewContext.Provider
      value={{
        sampleId,
        profile,
        recommendations,
        bag,
        order,
        onStartScan,
        onAddToBag,
        onQuantityChange: (id, quantity) =>
          setBag((current) => ({
            ...current,
            [id]: Math.max(1, Math.floor(quantity)),
          })),
        onRemove: (id) => {
          setBag((current) => {
            const next = { ...current };
            delete next[id];
            return next;
          });
          setNotice("Removed from your bag");
        },
        onPlaceOrder: () => {
          const items = products
            .filter((p) => bag[p.id] > 0)
            .map((product) => ({ product, quantity: bag[product.id] }));
          if (!items.length) return;
          setOrder({
            reference: "DEMO-" + String(Date.now()).slice(-6),
            items,
            total: items.reduce(
              (sum, item) => sum + item.quantity * item.product.price,
              0,
            ),
          });
          setBag({});
          router.push("/order-confirmation");
        },
      }}
    >
      <SiteHeader
        profile={profile}
        recommendations={recommendations}
        bagCount={Object.values(bag).reduce((a, b) => a + b, 0)}
        onStartScan={onStartScan}
        onToggleRecommendations={() => setRecommendations((v) => !v)}
        onDeleteResults={() => {
          setSampleId(undefined);
          setRecommendations(true);
          setNotice("Your results have been deleted");
        }}
        onSearch={() => setSearchOpen(true)}
      />
      {children}
      <SiteFooter />
      <SearchOverlay
        open={searchOpen}
        onOpenChange={setSearchOpen}
        query={query}
        onQueryChange={setQuery}
        results={searchProducts(products, query).map((product) => ({
          product,
          fit:
            sampleId && recommendations
              ? sampleFits[sampleId][product.id]
              : undefined,
        }))}
        onNavigate={() => setSearchOpen(false)}
      />
      <ScanModal
        open={scanOpen}
        onOpenChange={(open) => {
          if (!open) closeScan();
        }}
        step={step}
        consent={consent}
        samples={sampleOptions}
        photo={photo}
        photoSource={pendingSample ? "sample" : "upload"}
        photoAlt={
          pendingSample
            ? `AI-generated sample face: ${sampleOptions.find((s) => s.id === pendingSample)?.label}`
            : "Your chosen photo, kept only while this preview is open"
        }
        result={resultId ? sampleProfiles[resultId] : undefined}
        summary={resultId ? summarizeProfile(resultId) : undefined}
        checks={{
          hasFace: false,
          position: false,
          frontal: false,
          lighting: false,
        }}
        cameraReady={false}
        analysisStage={analysisStage}
        error={error}
        unavailableReason="daily_cap"
        livePreview
        revisiting={revisiting}
        onConsentChange={setConsent}
        onStepChange={(next) => {
          if (next === "intro") {
            clearPhoto();
            setPendingSample(undefined);
            setRevisiting(false);
            setConsent(false);
          }
          if (next === "upload" || next === "samples") clearPhoto();
          setStep(next);
        }}
        onSelectSample={(id) => {
          clearPhoto();
          setPendingSample(id);
          setPhoto(`/samples/${id}.jpg`);
          setAnalysisStage(0);
          setStep("analyzing");
        }}
        onUpload={onUpload}
        onCapture={() => {
          setError("camera_unavailable");
          setStep("error");
        }}
        onUsePhoto={() => {
          clearPhoto();
          setStep("unavailable");
        }}
        onContinue={(enabled) => {
          if (pendingSample) setSampleId(pendingSample);
          setRecommendations(enabled);
          closeScan();
          if (enabled && !returnPath.current.startsWith("/products/"))
            router.push("/shop");
        }}
        onClose={closeScan}
      />
      <div
        role="status"
        className={notice ? "store-notice type-small" : "sr-only"}
      >
        {notice}
      </div>
    </PreviewContext.Provider>
  );
}
