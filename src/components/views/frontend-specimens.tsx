"use client";
import { ProfileChip } from "@/components/layout/site-header";
import { Container } from "@/components/ui/container";
import type { ProfileSummary } from "@/types/storefront";
const profile: ProfileSummary = { skinType: "oily", goals: [], label: "Oily · Balance oil & pores" };
export function FrontendSpecimens() {
  return <section id="storefront" className="section"><Container><h2 className="type-h2 mb-6">Storefront components</h2><h3 className="type-h3 mb-4">Profile chip</h3><p className="type-small text-text-muted mb-4">The live shell above includes navigation, mobile sheets, scan entry and footer.</p><div className="flex flex-wrap gap-4"><ProfileChip profile={profile} recommendations /><ProfileChip profile={profile} recommendations={false} /></div></Container></section>;
}
