"use client";
import { useDeferredValue, useEffect, useMemo, useState, type ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SearchOverlay } from "@/components/search/search-overlay";
import { getProducts } from "@/lib/catalog";
import { buildSearchIndex, search } from "@/lib/search";
import { bagCount, useBagStore } from "@/stores/bag";
import { useSkinStore } from "@/stores/skin";
import { useUiStore } from "@/stores/ui";
import { startScan } from "./actions";
import { ScanController } from "./scan-controller";
import { listing, usePersonalization } from "./use-fits";

/** Persisted stores load after the first paint, so server and client render the same HTML. */
function useHydrateStores() {
  useEffect(() => {
    void useSkinStore.persist.rehydrate();
    void useBagStore.persist.rehydrate();
  }, []);
}

function Search() {
  const open = useUiStore((s) => s.searchOpen);
  const setOpen = useUiStore((s) => s.setSearchOpen);
  const { fits } = usePersonalization();
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const index = useMemo(() => (open ? buildSearchIndex(getProducts()) : undefined), [open]);
  const results = index ? search(index, deferred).map((p) => listing(p, fits)) : [];
  return (
    <SearchOverlay
      open={open}
      onOpenChange={setOpen}
      query={query}
      onQueryChange={setQuery}
      results={results}
      onNavigate={() => setOpen(false)}
    />
  );
}

function Notice() {
  const notice = useUiStore((s) => s.notice);
  return (
    <div role="status" className={notice ? "store-notice type-small" : "sr-only"}>
      {notice?.text}
    </div>
  );
}

function Header() {
  const { summary, recommendations } = usePersonalization();
  const count = useBagStore((s) => bagCount(s.lines));
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);
  const notify = useUiStore((s) => s.notify);
  return (
    <SiteHeader
      profile={summary}
      recommendations={recommendations}
      bagCount={count}
      onStartScan={startScan}
      onToggleRecommendations={() => {
        const { recommendations: on, setRecommendations } = useSkinStore.getState();
        setRecommendations(!on);
        notify(on ? "Recommendations are off" : "Recommendations are on");
      }}
      onDeleteResults={() => {
        useSkinStore.getState().clear();
        notify("Your results have been deleted");
      }}
      onSearch={() => setSearchOpen(true)}
    />
  );
}

export function StoreShell({ children, demoMode }: { children: ReactNode; demoMode: boolean }) {
  useHydrateStores();
  return (
    <>
      <Header />
      {children}
      <SiteFooter />
      <Search />
      <ScanController demoMode={demoMode} />
      <Notice />
    </>
  );
}
