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
      <Eyebrow className="text-text-muted mb-3">Selfie scan</Eyebrow>
      <h2 className="type-h3 mb-3">
        {profile ? "Your skin at a glance" : "Not sure where to start?"}
      </h2>
      {profile ? (
        <SkinSummary profile={profile} />
      ) : (
        <>
          <p className="type-small text-text-muted mb-6">
            Scan once and the shop sorts itself around your skin: best matches
            first, anything to skip clearly marked.
          </p>
          <ScanButton fullWidth onClick={() => onStartScan("hero")} />
          <p className="type-small text-text-muted mt-3">
            No selfie handy? Try a sample face from the scan.
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
        A 30-second scan moves the products your skin needs to the top of
        this list.
      </p>
      <ScanButton fullWidth onClick={() => onStartScan("grid")} />
      <p className="type-small text-text-muted mt-3">
        No selfie? Try a sample face instead.
      </p>
    </aside>
  );
}
