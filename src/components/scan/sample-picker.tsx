import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { SampleFaceId } from "@/types/scan";
export type SampleOption = { id: SampleFaceId; label: string; detail: string };
export function SamplePicker({
  open,
  onOpenChange,
  samples,
  onSelectSample,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  samples: SampleOption[];
  onSelectSample: (id: SampleFaceId) => void;
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Get to know your skin"
      description="Explore recorded skin analysis with a sample face. These AI-generated faces show real YouCam analysis results; they are not customers."
    >
      <div className="sample-options">
        {samples.map((sample) => (
          <div key={sample.id} className="sample-option">
            <Image
              src={`/samples/${sample.id}.jpg`}
              alt={`Synthetic sample face for ${sample.label.toLowerCase()}`}
              width={160}
              height={160}
            />
            <div>
              <h2 className="type-h3">{sample.label}</h2>
              <p className="type-small text-text-muted mb-3">{sample.detail}</p>
              <Button
                variant="secondary"
                onClick={() => onSelectSample(sample.id)}
              >
                Try this face
              </Button>
            </div>
          </div>
        ))}
      </div>
      <p className="type-small text-text-muted mt-6">
        Camera and photo upload will join this preview in the complete scan
        flow. No photo is collected here.
      </p>
    </Modal>
  );
}
