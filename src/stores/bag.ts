import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type BagState = {
  /** productId → quantity (≥ 1). */
  lines: Record<string, number>;
  add: (id: string, quantity?: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const VERSION = 1;

export const useBagStore = create<BagState>()(
  persist(
    (set) => ({
      lines: {},
      add: (id, quantity = 1) =>
        set(({ lines }) => ({ lines: { ...lines, [id]: (lines[id] ?? 0) + quantity } })),
      setQuantity: (id, quantity) =>
        set(({ lines }) => ({ lines: { ...lines, [id]: Math.max(1, Math.floor(quantity) || 1) } })),
      remove: (id) =>
        set(({ lines }) => {
          const next = { ...lines };
          delete next[id];
          return { lines: next };
        }),
      clear: () => set({ lines: {} }),
    }),
    {
      name: "bag",
      version: VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ lines }) => ({ lines }),
      migrate: () => ({ lines: {} }),
      skipHydration: true,
    },
  ),
);

export const bagCount = (lines: Record<string, number>) =>
  Object.values(lines).reduce((sum, n) => sum + n, 0);
