import { GOAL_DEFS } from "@/types/goal";
import { BAND_LABEL, SKIN_TYPE_LABEL } from "@/types/skin";
import type { ProfileSummary } from "@/types/storefront";
import { Button } from "@/components/ui/button";
export function SkinSummary({ profile, onContinue }: { profile: ProfileSummary; onContinue?: () => void }) {
  return <div><p className="type-label text-text-muted mb-4">{SKIN_TYPE_LABEL[profile.skinType]} skin · Your focus</p><ol className="skin-goals">{profile.goals.slice(0, 3).map(item => <li key={item.goal}><span>{GOAL_DEFS[item.goal].title}</span><span className="type-small text-text-muted">{BAND_LABEL[item.band]}</span></li>)}</ol><Button href="/shop" className="w-full mt-6" onClick={onContinue}>Shop for you</Button></div>;
}
