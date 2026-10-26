import type { ProfileSummary, ScanSource } from "@/types/storefront";
import { ScanButton } from "@/components/ui/scan-button";
import { Button } from "@/components/ui/button";
import { SkinSummary } from "@/components/scan/skin-summary";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SKIN_TYPE_LABEL } from "@/types/skin";
export function ScanCard({
  profile,
  onStartScan,
}: {
  profile?: ProfileSummary;
  onStartScan: (source: ScanSource) => void;
}) {
  return (
    <div className="scan-card">
      <Eyebrow className="text-text-muted mb-3">
        {profile ? "From your scan" : "Selfie scan · about 30 seconds"}
      </Eyebrow>
      <h2 className="type-h3 mb-3">
        {profile
          ? `${SKIN_TYPE_LABEL[profile.skinType]} skin`
          : "What one photo tells you"}
      </h2>
      {profile ? (
        <SkinSummary profile={profile} />
      ) : (
        <>
          <ol className="skin-goals mb-6">
            <li>
              <span>Your skin type</span>
              <span className="type-small text-text-muted">
                and the textures that suit it
              </span>
            </li>
            <li>
              <span>What stands out</span>
              <span className="type-small text-text-muted">
                your top three, slight to very visible
              </span>
            </li>
            <li>
              <span>Your matches</span>
              <span className="type-small text-text-muted">
                every product tagged with its fit
              </span>
            </li>
          </ol>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => onStartScan("sample")}
          >
            Try a sample face first
          </Button>
          <p className="type-small text-text-muted mt-3">
            Real recorded results. No photo of you needed.
          </p>
        </>
      )}
    </div>
  );
}
export function InlineScanCard({
  onStartScan,
}: {
  onStartScan: (source: ScanSource) => void;
}) {
  return (
    <aside className="inline-scan-card">
      <div className="scan-orbit" aria-hidden="true">
        <span>YOU</span>
      </div>
      <Eyebrow className="text-text-muted">Selfie scan</Eyebrow>
      <h3 className="type-h3 mt-3">Not sure what suits you?</h3>
      <p className="text-text-muted mt-3 mb-6">
        Scan once and this list sorts itself around your skin, best matches
        first.
      </p>
      <ScanButton fullWidth onClick={() => onStartScan("grid")} />
      <p className="type-small text-text-muted mt-3">
        No selfie handy? The scan has sample faces too.
      </p>
    </aside>
  );
}
