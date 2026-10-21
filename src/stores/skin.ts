import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { GoalId } from "@/types/goal";
import type { SampleFaceId } from "@/types/scan";
import type { SkinProfile } from "@/types/skin";

type SkinState = {
  /** Derived scores only; the photo is never stored. */
  profile?: SkinProfile;
  /** Which sample face produced the profile, if any (for the reveal photo). */
  sampleId?: SampleFaceId;
  recommendations: boolean;
  /** User's own top-3 order from "Your focus"; reset by a new scan. */
  focus?: GoalId[];
  setProfile: (profile: SkinProfile, sampleId?: SampleFaceId) => void;
  setRecommendations: (on: boolean) => void;
  setFocus: (focus: GoalId[]) => void;
  clear: () => void;
};

const initial = { profile: undefined, sampleId: undefined, recommendations: true, focus: undefined };

/** Bump on any shape change: stored state from older versions is reset, not migrated. */
const VERSION = 1;

export const useSkinStore = create<SkinState>()(
  persist(
    (set) => ({
      ...initial,
      setProfile: (profile, sampleId) => set({ profile, sampleId, focus: undefined }),
      setRecommendations: (recommendations) => set({ recommendations }),
      setFocus: (focus) => set({ focus }),
      clear: () => set(initial),
    }),
    {
      name: "skin",
      version: VERSION,
      storage: createJSONStorage(() => localStorage),
      // Live mask URLs expire, so only sample masks (local files) are kept across reloads.
      partialize: ({ profile, sampleId, recommendations, focus }) => ({
        profile:
          profile && !sampleId
            ? { ...profile, concerns: profile.concerns.map((c) => ({ ...c, maskUrl: undefined })) }
            : profile,
        sampleId,
        recommendations,
        focus,
      }),
      migrate: () => initial,
      skipHydration: true,
    },
  ),
);
