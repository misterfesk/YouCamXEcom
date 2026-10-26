import { GOAL_FINDING } from "./scan-copy";
import { BAND_LABEL } from "@/types/skin";
import type { ProfileSummary } from "@/types/storefront";
import { Button } from "@/components/ui/button";
export function SkinSummary({
  profile,
  onContinue,
}: {
  profile: ProfileSummary;
  onContinue?: () => void;
}) {
  return (
    <div>
      <p className="type-label text-text-muted mb-4">
        What stood out
      </p>
      <ol className="skin-goals">
        {profile.goals.slice(0, 3).map((item) => (
          <li key={item.goal}>
            <span>{GOAL_FINDING[item.goal].name}</span>
            <span className="type-small text-text-muted">
              {BAND_LABEL[item.band]}
            </span>
          </li>
        ))}
      </ol>
      <Button href="/shop" className="w-full mt-6" onClick={onContinue}>
        See my matches
      </Button>
    </div>
  );
}
