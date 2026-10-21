"use client";
import { useMemo } from "react";
import { getProducts } from "@/lib/catalog";
import { fitCatalog, type FitMap } from "@/lib/ranking";
import { focusGoals, summarizeProfile } from "@/lib/skin/goals";
import { useSkinStore } from "@/stores/skin";
import type { GoalId } from "@/types/goal";
import type { Product } from "@/types/catalog";
import type { SkinProfile } from "@/types/skin";
import type { ProductListing, ProfileSummary } from "@/types/storefront";

let last: { profile: SkinProfile; focus: string; fits: FitMap } | undefined;

/** Header, search and page all ask for the same fits; compute them once per profile + focus. */
function cachedFits(profile: SkinProfile, focus: GoalId[]): FitMap {
  const key = focus.join();
  if (last?.profile !== profile || last.focus !== key)
    last = { profile, focus: key, fits: fitCatalog(getProducts(), profile, focus) };
  return last.fits;
}

export type Personalization = {
  summary?: ProfileSummary;
  /** Top-3 goals: the user's own order if they changed it, else by severity. */
  focus: GoalId[];
  /** Present only while recommendations are on. */
  fits?: FitMap;
  recommendations: boolean;
};

/** Profile summary, focus and fits, recomputed only when the profile or focus changes. */
export function usePersonalization(): Personalization {
  const profile = useSkinStore((s) => s.profile);
  const recommendations = useSkinStore((s) => s.recommendations);
  const chosenFocus = useSkinStore((s) => s.focus);
  const summary = useMemo(() => (profile ? summarizeProfile(profile) : undefined), [profile]);
  const focus = useMemo(
    () => chosenFocus ?? (summary ? focusGoals(summary.goals) : []),
    [chosenFocus, summary],
  );
  const allFits = useMemo(() => (profile ? cachedFits(profile, focus) : undefined), [profile, focus]);
  return { summary, focus, recommendations, fits: recommendations ? allFits : undefined };
}

export const listing = (product: Product, fits?: FitMap): ProductListing => ({
  product,
  fit: fits?.[product.id],
});
