import type { ProfileSummary, ScanSource } from "@/types/storefront";
import { ScanButton } from "@/components/ui/scan-button";
import { SkinSummary } from "@/components/scan/skin-summary";
import { Eyebrow } from "@/components/ui/eyebrow";
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
        A little skin understanding
      </Eyebrow>
      <h2 className="type-h3 mb-3">
        {profile ? "Your skin, your starting point" : "Meet your next routine"}
      </h2>
      {profile ? (
        <SkinSummary profile={profile} />
      ) : (
        <>
          <p className="type-small text-text-muted mb-6">
            A selfie scan brings products for your skin concerns to the front.
            Or explore with a sample face.
          </p>
          <ScanButton fullWidth onClick={() => onStartScan("hero")} />
          <p className="type-small text-text-muted mt-3">
            Optional, always. Shop freely without a scan.
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
      <Eyebrow className="text-text-muted">A more personal shelf</Eyebrow>
      <h3 className="type-h3 mt-3">Not sure what fits?</h3>
      <p className="text-text-muted mt-3 mb-6">
        Start with your skin. A quick scan helps put your next step in focus.
      </p>
      <ScanButton fullWidth onClick={() => onStartScan("grid")} />
      <p className="type-small text-text-muted mt-3">
        Try a sample face. No selfie needed.
      </p>
    </aside>
  );
}
