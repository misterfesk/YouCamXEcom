import { create } from "zustand";
import type { DemoOrder } from "@/types/commerce-view";
import type { ScanSource } from "@/types/storefront";

const NOTICE_MS = 4000;

type ScanEntry = "intro" | "samples" | "reveal";

type UiState = {
  scan: { open: boolean; entry: ScanEntry; source?: ScanSource; returnPath: string; key: number };
  searchOpen: boolean;
  notice?: { text: string; id: number };
  /** The last demo order, for the confirmation page (session memory only). */
  order?: DemoOrder;
  openScan: (source: ScanSource, entry?: ScanEntry) => void;
  closeScan: () => void;
  setSearchOpen: (open: boolean) => void;
  notify: (text: string) => void;
  setOrder: (order: DemoOrder) => void;
};

/** Short-lived UI state shared by the header, pages and the scan modal. Not persisted. */
export const useUiStore = create<UiState>()((set) => ({
  scan: { open: false, entry: "intro", returnPath: "/", key: 0 },
  searchOpen: false,
  openScan: (source, entry = "intro") =>
    set(({ scan }) => ({
      scan: { open: true, entry, source, returnPath: window.location.pathname, key: scan.key + 1 },
    })),
  closeScan: () => set(({ scan }) => ({ scan: { ...scan, open: false } })),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  notify: (text) => {
    const id = Date.now();
    set({ notice: { text, id } });
    setTimeout(() => {
      if (useUiStore.getState().notice?.id === id) set({ notice: undefined });
    }, NOTICE_MS);
  },
  setOrder: (order) => set({ order }),
}));
